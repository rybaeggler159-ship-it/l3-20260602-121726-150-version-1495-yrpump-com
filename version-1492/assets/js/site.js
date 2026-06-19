(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener('load', resolve);
        resolve();
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('.main-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var dotIndex = parseInt(dot.getAttribute('data-hero-dot'), 10);
        show(dotIndex);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initLocalFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-local-filter]');
      var select = scope.querySelector('[data-sort-select]');
      var grid = scope.querySelector('[data-card-grid]') || document.querySelector('[data-card-grid]');
      if (!grid) {
        return;
      }
      var items = Array.prototype.slice.call(grid.children);

      function getText(item) {
        return (item.getAttribute('data-title') || item.textContent || '').toLowerCase();
      }

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        items.forEach(function (item) {
          var text = getText(item);
          item.classList.toggle('is-hidden', q && text.indexOf(q) === -1);
        });

        if (select && select.value !== 'default') {
          var visible = items.filter(function (item) {
            return !item.classList.contains('is-hidden');
          });
          visible.sort(function (a, b) {
            if (select.value === 'year') {
              return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            }
            if (select.value === 'score') {
              return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
            }
            return getText(a).localeCompare(getText(b), 'zh-Hans-CN');
          });
          visible.forEach(function (item) {
            grid.appendChild(item);
          });
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', apply);
      }
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var src = player.getAttribute('data-src');
      var initialized = false;
      if (!video || !button || !src) {
        return;
      }

      function startPlayer() {
        if (initialized) {
          video.play().catch(function () {});
          return;
        }
        initialized = true;
        button.style.display = 'none';

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
          return;
        }

        loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest')
          .then(function () {
            if (window.Hls && window.Hls.isSupported()) {
              var hls = new window.Hls();
              hls.loadSource(src);
              hls.attachMedia(video);
              hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
              });
            } else {
              video.src = src;
              video.play().catch(function () {});
            }
          })
          .catch(function () {
            video.src = src;
            video.play().catch(function () {});
          });
      }

      button.addEventListener('click', startPlayer);
    });
  }

  function makeResultCard(movie) {
    var tags = movie.tags.slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-score="' + escapeHtml(movie.score) + '">' +
      '  <a class="poster" href="' + escapeHtml(movie.url) + '">' +
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.remove();">' +
      '    <span class="poster-glow"></span>' +
      '    <span class="score-badge">' + escapeHtml(movie.score) + '</span>' +
      '  </a>' +
      '  <div class="card-body">' +
      '    <div class="card-meta"><a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '    <p>' + escapeHtml(movie.oneLine) + '</p>' +
      '    <div class="tag-row">' + tags + '</div>' +
      '  </div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initGlobalSearch() {
    var form = document.querySelector('[data-global-search]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    if (!form || !results || !window.SEARCH_MOVIES) {
      return;
    }
    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function runSearch(query) {
      var q = query.trim().toLowerCase();
      if (!q) {
        title.textContent = '请输入关键词';
        results.innerHTML = '';
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase();
        return haystack.indexOf(q) !== -1;
      }).slice(0, 120);
      title.textContent = '找到 ' + matched.length + ' 条结果';
      results.innerHTML = matched.map(makeResultCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch(input.value);
      var url = new URL(window.location.href);
      url.searchParams.set('q', input.value.trim());
      history.replaceState(null, '', url.toString());
    });

    input.addEventListener('input', function () {
      runSearch(input.value);
    });

    runSearch(initialQuery);
  }

  ready(function () {
    initNavigation();
    initHero();
    initLocalFilters();
    initPlayers();
    initGlobalSearch();
  });
})();
