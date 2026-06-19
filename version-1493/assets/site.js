(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, '');
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }

      function start() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });

      if (slides.length > 1) {
        start();
      }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]')).forEach(function (input) {
      var scope = input.closest('main') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      input.addEventListener('input', function () {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent);
          card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
        });
      });
    });

    var globalInput = document.querySelector('[data-global-search]');
    var results = document.querySelector('[data-search-results]');
    if (globalInput && results && window.SEARCH_INDEX) {
      function render(query) {
        var keyword = normalize(query);
        var list = window.SEARCH_INDEX.filter(function (item) {
          var haystack = normalize(item.title + ' ' + item.meta + ' ' + item.oneLine + ' ' + item.tags);
          return !keyword || haystack.indexOf(keyword) !== -1;
        }).slice(0, 80);

        results.innerHTML = list.map(function (item) {
          return [
            '<article class="movie-card" data-card>',
            '  <a class="poster-link" href="' + item.url + '">',
            '    <img class="poster" src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
            '    <span class="poster-year">' + item.year + '</span>',
            '  </a>',
            '  <div class="card-body">',
            '    <a class="card-title" href="' + item.url + '">' + item.title + '</a>',
            '    <p class="card-meta">' + item.meta + '</p>',
            '    <p class="card-line">' + item.oneLine + '</p>',
            '    <a class="card-category" href="' + item.categoryUrl + '">' + item.category + '</a>',
            '  </div>',
            '</article>'
          ].join('');
        }).join('');
      }

      render('');
      globalInput.addEventListener('input', function () {
        render(globalInput.value);
      });
    }
  });
})();
