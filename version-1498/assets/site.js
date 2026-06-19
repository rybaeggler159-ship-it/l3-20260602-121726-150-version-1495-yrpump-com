(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initNavigation() {
    var button = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");

    if (!button || !links) {
      return;
    }

    button.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        play();
      });
    });

    if (slides.length > 1) {
      play();
    }
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function (scope) {
      var searchInput = scope.querySelector("[data-local-search]");
      var yearSelect = scope.querySelector("[data-year-filter]");
      var typeSelect = scope.querySelector("[data-type-filter]");
      var list = document.querySelector("[data-card-list]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];
      var count = document.querySelector("[data-result-count]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilter() {
        var keyword = normalize(searchInput ? searchInput.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
          ].join(" "));
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !year || card.dataset.year === year;
          var matchType = !type || card.dataset.type === type;
          var show = matchKeyword && matchYear && matchType;

          card.classList.toggle("is-hidden", !show);

          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "共 " + visible + " 部影片";
        }
      }

      [searchInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var source = box.dataset.src;
      var hlsInstance = null;

      function loadAndPlay() {
        if (!video || !source) {
          return;
        }

        if (button) {
          button.classList.add("hidden");
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          }
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!video.src) {
            video.src = source;
          }
        } else {
          if (!video.src) {
            video.src = source;
          }
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener("click", loadAndPlay);
      }
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
