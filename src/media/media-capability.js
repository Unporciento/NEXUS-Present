const imageMimes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

export function createMediaCapabilityDetector({ documentApi = globalThis.document } = {}) {
  return {
    supportsImage(mime) {
      return imageMimes.has(mime);
    },
    supportsVideo(mime) {
      const video = documentApi?.createElement?.('video');
      if (!video?.canPlayType) return { supported: false, confidence: '' };
      const confidence = video.canPlayType(mime);
      return { supported: confidence === 'probably' || confidence === 'maybe', confidence };
    },
    supportsCaptions(mime) {
      return mime === 'text/vtt';
    }
  };
}
