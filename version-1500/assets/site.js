(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMobileMenu() {
    var btn = $('[data-mobile-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!btn || !panel) {
      return;
    }
    btn.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero).map(function (node) {
      return JSON.parse(node.textContent);
    });
    if (!slides.length) {
      return;
    }
    var bg = $('[data-hero-bg]', hero);
    var bgImg = $('[data-hero-bg-img]', hero);
    var title = $('[data-hero-title]', hero);
    var desc = $('[data-hero-desc]', hero);
    var meta = $('[data-hero-meta]', hero);
    var link = $('[data-hero-link]', hero);
    var cardTitle = $('[data-hero-card-title]', hero);
    var cardText = $('[data-hero-card-text]', hero);
    var cardImg = $('[data-hero-card-img]', hero);
    var dots = $('[data-hero-dots]', hero);
    var index = 0;

    function render() {
      var slide = slides[index];
      if (bg) {
        bg.style.background = 'linear-gradient(135deg, #111827, #7c2d12 50%, #111827)';
      }
      if (bgImg) {
        bgImg.src = slide.image;
        bgImg.alt = slide.title;
      }
      if (title) {
        title.textContent = slide.title;
      }
      if (desc) {
        desc.textContent = slide.desc;
      }
      if (meta) {
        meta.textContent = slide.meta;
      }
      if (link) {
        link.href = slide.href;
      }
      if (cardTitle) {
        cardTitle.textContent = slide.title;
      }
      if (cardText) {
        cardText.textContent = slide.one;
      }
      if (cardImg) {
        cardImg.src = slide.image;
        cardImg.alt = slide.title;
      }
      $all('.hero-dot', dots).forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === index);
      });
    }

    if (dots) {
      slides.forEach(function (slide, idx) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot';
        dot.setAttribute('aria-label', '切换到 ' + slide.title);
        dot.addEventListener('click', function () {
          index = idx;
          render();
        });
        dots.appendChild(dot);
      });
    }

    render();
    if (slides.length > 1) {
      setInterval(function () {
        index = (index + 1) % slides.length;
        render();
      }, 5200);
    }
  }

  function setupFilters() {
    var filterRoot = $('[data-filter-root]');
    if (!filterRoot) {
      return;
    }
    var search = $('[data-filter-search]', filterRoot);
    var genre = $('[data-filter-genre]', filterRoot);
    var year = $('[data-filter-year]', filterRoot);
    var items = $all('[data-filter-item]', filterRoot);
    var empty = $('[data-empty-state]', filterRoot);

    function apply() {
      var query = normalize(search && search.value);
      var genreValue = normalize(genre && genre.value);
      var yearValue = normalize(year && year.value);
      var shown = 0;
      items.forEach(function (item) {
        var hay = normalize(item.getAttribute('data-title') + ' ' + item.getAttribute('data-tags') + ' ' + item.getAttribute('data-genre') + ' ' + item.getAttribute('data-region'));
        var itemGenre = normalize(item.getAttribute('data-genre') + ' ' + item.getAttribute('data-tags'));
        var itemYear = normalize(item.getAttribute('data-year'));
        var ok = true;
        if (query && hay.indexOf(query) === -1) {
          ok = false;
        }
        if (genreValue && itemGenre.indexOf(genreValue) === -1) {
          ok = false;
        }
        if (yearValue && itemYear !== yearValue) {
          ok = false;
        }
        item.classList.toggle('is-hidden', !ok);
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    }

    [search, genre, year].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupPlayers() {
    $all('[data-video-player]').forEach(function (shell) {
      var video = $('video', shell);
      var button = $('[data-play-button]', shell);
      if (!video) {
        return;
      }
      var hlsSource = video.getAttribute('data-hls');
      var mp4Source = video.getAttribute('data-mp4');
      var prepared = false;

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (window.Hls && window.Hls.isSupported() && hlsSource) {
          var hls = new window.Hls();
          hls.loadSource(hlsSource);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl') && hlsSource) {
          video.src = hlsSource;
        } else if (mp4Source) {
          video.src = mp4Source;
        }
      }

      function play() {
        prepare();
        if (button) {
          button.style.display = 'none';
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', play);
      video.addEventListener('play', function () {
        if (button) {
          button.style.display = 'none';
        }
      });
    });
  }

  function setupTopSearch() {
    $all('[data-site-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = $('input', form);
        var q = encodeURIComponent((input && input.value || '').trim());
        var prefix = form.getAttribute('data-prefix') || '';
        window.location.href = prefix + 'search.html' + (q ? '?q=' + q : '');
      });
    });

    var searchPageInput = $('[data-filter-search]');
    if (searchPageInput && window.location.search) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        searchPageInput.value = q;
        searchPageInput.dispatchEvent(new Event('input'));
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupTopSearch();
    setupFilters();
    setupPlayers();
  });
})();
