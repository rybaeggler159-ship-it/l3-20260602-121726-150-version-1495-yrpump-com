function initVideoPlayer(streamUrl) {
  var video = document.getElementById('moviePlayer');
  var cover = document.getElementById('playerCover');
  if (!video || !cover || !streamUrl) {
    return;
  }

  var started = false;
  var showPlayable = function () {
    cover.classList.add('is-hidden');
  };
  var showCover = function () {
    if (!started) {
      cover.classList.remove('is-hidden');
    }
  };
  var begin = function () {
    started = true;
    showPlayable();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        started = false;
        showCover();
      });
    }
  };

  if (window.Hls && window.Hls.isSupported()) {
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(streamUrl);
    hls.attachMedia(video);
    hls.on(window.Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          cover.querySelector('.big-play').textContent = '播放暂时不可用';
        }
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = streamUrl;
  } else {
    cover.querySelector('.big-play').textContent = '播放暂时不可用';
  }

  cover.addEventListener('click', begin);
  video.addEventListener('play', showPlayable);
  video.addEventListener('pause', function () {
    started = false;
  });
  video.addEventListener('click', function () {
    if (video.paused) {
      begin();
    }
  });
}
