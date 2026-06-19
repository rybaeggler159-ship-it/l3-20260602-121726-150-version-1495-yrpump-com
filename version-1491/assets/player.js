(function () {
  function setupPlayer(card) {
    var video = card.querySelector('video[data-video-src]');
    var button = card.querySelector('[data-player-button]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-video-src');
    var initialized = false;

    function initialize() {
      if (initialized) {
        return;
      }
      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      initialize();
      if (button) {
        button.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('[data-player-card]').forEach(setupPlayer);
    });
  } else {
    document.querySelectorAll('[data-player-card]').forEach(setupPlayer);
  }
})();
