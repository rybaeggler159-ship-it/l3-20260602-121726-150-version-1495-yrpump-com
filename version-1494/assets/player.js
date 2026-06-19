function initVideoPlayer(videoId, buttonId, coverId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var cover = document.getElementById(coverId);

  if (!video || !button || !source) {
    return;
  }

  function bindSource() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      return Promise.resolve();
    }

    video.src = source;
    return Promise.resolve();
  }

  function startPlayback() {
    bindSource().then(function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  }

  button.addEventListener('click', startPlayback);

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }
}
