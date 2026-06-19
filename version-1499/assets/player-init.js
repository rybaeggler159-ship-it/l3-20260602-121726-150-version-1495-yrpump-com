(() => {
  const video = document.querySelector('[data-player]');
  const button = document.querySelector('[data-play-button]');

  if (!video || !button) {
    return;
  }

  let hasLoaded = false;

  const startPlayback = async () => {
    const source = video.dataset.src;

    if (!source) {
      return;
    }

    if (!hasLoaded) {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      hasLoaded = true;
    }

    button.classList.add('is-hidden');

    try {
      await video.play();
    } catch (error) {
      button.classList.remove('is-hidden');
      button.textContent = '再次点击播放';
    }
  };

  button.addEventListener('click', startPlayback);
})();
