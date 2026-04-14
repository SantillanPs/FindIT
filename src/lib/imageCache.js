/**
 * Simple global cache for loaded images to prevent re-animation
 * and track load state across component remounts.
 */
class ImageCacheManager {
  constructor() {
    this.loadedUrls = new Set();
    this.failedUrls = new Set();
    this.preloading = new Map();
  }

  isLoaded(url) {
    return this.loadedUrls.has(url);
  }

  isFailed(url) {
    return this.failedUrls.has(url);
  }

  markLoaded(url) {
    this.loadedUrls.add(url);
    this.failedUrls.delete(url);
  }

  markFailed(url) {
    this.failedUrls.add(url);
    this.loadedUrls.delete(url);
  }

  preload(url) {
    if (this.isLoaded(url) || this.preloading.has(url)) return;

    const img = new Image();
    const promise = new Promise((resolve) => {
      img.onload = () => {
        this.markLoaded(url);
        this.preloading.delete(url);
        resolve(true);
      };
      img.onerror = () => {
        this.markFailed(url);
        this.preloading.delete(url);
        resolve(false);
      };
    });

    img.src = url;
    this.preloading.set(url, promise);
    return promise;
  }
}

export const imageCache = new ImageCacheManager();
