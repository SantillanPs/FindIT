/**
 * Simple global cache for loaded images to prevent re-animation
 * and track load state across component remounts.
 */
class ImageCacheManager {
  constructor() {
    this.loadedUrls = new Set();
    this.preloading = new Map();
  }

  isLoaded(url) {
    return this.loadedUrls.has(url);
  }

  markLoaded(url) {
    this.loadedUrls.add(url);
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
