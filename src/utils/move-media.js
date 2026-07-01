/** Detect move demo URLs that are video rather than static images. */
export function isVideoUrl(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url);
}

export function mediaDimensions(el) {
  if (!el) return { width: 0, height: 0 };
  return {
    width: el.videoWidth || el.naturalWidth || 0,
    height: el.videoHeight || el.naturalHeight || 0,
  };
}

/** Load a static image for Konva / img tags. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ element: img, isVideo: false });
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Load a video element paused on the first frame for use as a thumbnail.
 * Konva.Image accepts HTMLVideoElement directly.
 */
export function loadVideoThumbnail(url, seekTime = 0.1) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = 'auto';
    video.style.position = 'fixed';
    video.style.width = '0';
    video.style.height = '0';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);

    const fail = () => {
      video.remove();
      reject(new Error(`Failed to load video: ${url}`));
    };

    video.addEventListener('error', fail, { once: true });
    video.addEventListener('loadeddata', () => {
      video.addEventListener('seeked', () => resolve({ element: video, isVideo: true }), { once: true });
      try {
        video.currentTime = seekTime;
      } catch {
        video.currentTime = 0;
      }
    }, { once: true });

    video.src = url;
  });
}

function VueSafeSetCurrentTime(video, time) {
  try {
    video.currentTime = time;
  } catch {
    video.currentTime = 0;
  }
}

/** Load either an image or a video thumbnail depending on URL. */
export function loadMoveMedia(url) {
  if (isVideoUrl(url)) return loadVideoThumbnail(url);
  return loadImage(url);
}

export function playVideo(element) {
  if (!element || !element.play) return Promise.resolve();
  return element.play().catch(() => {});
}

export function pauseVideo(element, resetTime = 0.1) {
  if (!element) return;
  element.pause();
  VueSafeSetCurrentTime(element, resetTime);
}

export function disposeVideoElement(element) {
  if (!element || !element.tagName || element.tagName.toLowerCase() !== 'video') return;
  element.pause();
  element.removeAttribute('src');
  element.load();
  if (element.parentNode) element.parentNode.removeChild(element);
}
