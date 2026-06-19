(function () {
  var root = document.documentElement;
  var toggle = document.querySelector('.menu-toggle');

  if (toggle) {
    toggle.addEventListener('click', function () {
      root.classList.toggle('mobile-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === active);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === active);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var genreSelect = document.querySelector('[data-filter-genre]');
  var filterItems = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function runFilter() {
    var keyword = normalize(filterInput ? filterInput.value : '');
    var year = yearSelect ? yearSelect.value : '';
    var genre = genreSelect ? normalize(genreSelect.value) : '';
    var shown = 0;

    filterItems.forEach(function (item) {
      var title = normalize(item.getAttribute('data-title'));
      var itemYear = item.getAttribute('data-year') || '';
      var itemGenre = normalize(item.getAttribute('data-genre'));
      var itemRegion = normalize(item.getAttribute('data-region'));
      var textMatch = !keyword || title.indexOf(keyword) >= 0 || itemGenre.indexOf(keyword) >= 0 || itemRegion.indexOf(keyword) >= 0;
      var yearMatch = !year || itemYear === year;
      var genreMatch = !genre || itemGenre.indexOf(genre) >= 0;
      var match = textMatch && yearMatch && genreMatch;

      item.style.display = match ? '' : 'none';

      if (match) {
        shown += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = shown ? 'none' : 'block';
    }
  }

  [filterInput, yearSelect, genreSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', runFilter);
      control.addEventListener('change', runFilter);
    }
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');

  if (query && filterInput) {
    filterInput.value = query;
    runFilter();
  }
})();
