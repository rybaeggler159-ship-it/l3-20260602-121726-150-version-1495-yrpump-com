(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }

    document.querySelectorAll(".hero-carousel").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
          slide.classList.toggle("active", current === index);
        });
        dots.forEach(function (dot, current) {
          dot.classList.toggle("active", current === index);
        });
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5600);
      }

      dots.forEach(function (dot, current) {
        dot.addEventListener("click", function () {
          show(current);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      restart();
    });

    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var query = root.querySelector("[data-filter-query]");
      var type = root.querySelector("[data-filter-type]");
      var region = root.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-filter-card]"));

      function apply() {
        var words = query ? query.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";
        var regionValue = region ? region.value : "";

        cards.forEach(function (card) {
          var key = (card.getAttribute("data-key") || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var visible = true;

          if (words && key.indexOf(words) === -1) {
            visible = false;
          }

          if (typeValue && cardType.indexOf(typeValue) === -1) {
            visible = false;
          }

          if (regionValue && cardRegion.indexOf(regionValue) === -1) {
            visible = false;
          }

          card.classList.toggle("hidden-card", !visible);
        });
      }

      [query, type, region].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
    });
  });
})();

function setupPlayer(streamUrl) {
  var player = document.getElementById("movie-player");
  var start = document.getElementById("player-start");
  var hlsInstance = null;
  var attached = false;

  if (!player || !start || !streamUrl) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(player);
    } else if (player.canPlayType("application/vnd.apple.mpegurl")) {
      player.src = streamUrl;
    } else {
      player.src = streamUrl;
    }

    attached = true;
  }

  function play() {
    attach();
    start.classList.add("is-hidden");
    var attempt = player.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        start.classList.remove("is-hidden");
      });
    }
  }

  start.addEventListener("click", play);

  player.addEventListener("click", function () {
    if (player.paused) {
      play();
    } else {
      player.pause();
    }
  });

  player.addEventListener("play", function () {
    start.classList.add("is-hidden");
  });

  player.addEventListener("pause", function () {
    if (player.currentTime === 0 || player.ended) {
      start.classList.remove("is-hidden");
    }
  });

  player.addEventListener("ended", function () {
    start.classList.remove("is-hidden");
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
