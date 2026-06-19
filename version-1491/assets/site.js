(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuToggle && mobilePanel) {
      menuToggle.addEventListener('click', function () {
        mobilePanel.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      }, { once: true });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function activate(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          activate(current + 1);
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
          activate(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      start();
    }

    var filterRoot = document.querySelector('[data-filter-root]');
    var cardList = document.querySelector('[data-card-list]');

    if (filterRoot && cardList) {
      var yearFilter = filterRoot.querySelector('[data-year-filter]');
      var cardFilter = filterRoot.querySelector('[data-card-filter]');
      var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));

      function applyFilters() {
        var yearValue = yearFilter ? yearFilter.value : '';
        var keyword = cardFilter ? cardFilter.value.trim().toLowerCase() : '';

        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase();
          var yearMatches = !yearValue || card.getAttribute('data-year') === yearValue;
          var keywordMatches = !keyword || text.indexOf(keyword) !== -1;
          card.classList.toggle('is-hidden-card', !(yearMatches && keywordMatches));
        });
      }

      if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
      }

      if (cardFilter) {
        cardFilter.addEventListener('input', applyFilters);
      }
    }

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage && window.MOVIE_INDEX) {
      var form = searchPage.querySelector('[data-search-form]');
      var input = searchPage.querySelector('[data-search-input]');
      var status = searchPage.querySelector('[data-search-status]');
      var results = searchPage.querySelector('[data-search-results]');
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';

      function escapeHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      function render(items) {
        results.innerHTML = items.map(function (movie) {
          return [
            '<article class="movie-card">',
            '  <a class="poster-link" href="movies/' + movie.id + '.html">',
            '    <span class="poster-backdrop"></span>',
            '    <img src="' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '    <span class="poster-shade"></span>',
            '    <span class="play-chip">播放</span>',
            '  </a>',
            '  <div class="movie-card-body">',
            '    <div class="movie-meta-line">',
            '      <span>' + escapeHtml(movie.year) + '</span>',
            '      <span>' + escapeHtml(movie.region) + '</span>',
            '      <span>' + escapeHtml(movie.type) + '</span>',
            '    </div>',
            '    <h3><a href="movies/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
            '    <p>' + escapeHtml(movie.oneLine) + '</p>',
            '    <div class="tag-row">' + movie.tags.slice(0, 4).map(function (tag) { return '<span class="tag">' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
            '  </div>',
            '</article>'
          ].join('
');
        }).join('
');
      }

      function performSearch(query) {
        var normalized = query.trim().toLowerCase();
        if (!normalized) {
          var defaults = window.MOVIE_INDEX.slice(0, 24);
          status.textContent = '默认展示近期精选内容';
          render(defaults);
          return;
        }

        var hits = window.MOVIE_INDEX.filter(function (movie) {
          return movie.searchText.indexOf(normalized) !== -1;
        }).slice(0, 120);

        status.textContent = '关键词“' + query + '”找到 ' + hits.length + ' 条结果';
        render(hits);
      }

      if (input) {
        input.value = initialQuery;
      }

      performSearch(initialQuery);

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value || '';
        var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
        window.history.replaceState(null, '', nextUrl);
        performSearch(query);
      });
    }
  });
})();
