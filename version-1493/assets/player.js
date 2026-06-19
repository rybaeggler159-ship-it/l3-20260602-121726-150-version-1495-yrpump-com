(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('.js-player')).forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('.js-play');
      var state = box.querySelector('[data-player-state]');
      var src = box.getAttribute('data-src');
      var hls = null;

      function setState(text) {
        if (state) {
          state.textContent = text || '';
        }
      }

      function setup() {
        if (!video || !src) {
          setState('视频源读取失败');
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setState('视频加载异常，请稍后重试');
            }
          });
          return;
        }

        video.src = src;
      }

      function play() {
        setup();
        var promise = video.play();
        if (promise && typeof promise.then === 'function') {
          promise.then(function () {
            if (button) {
              button.classList.add('is-hidden');
            }
            setState('');
          }).catch(function () {
            setState('请再次点击播放');
          });
        }
      }

      setup();

      if (button) {
        button.addEventListener('click', play);
      }

      box.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        if (video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    });
  });
})();
