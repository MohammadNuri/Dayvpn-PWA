/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'my-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  '/', // صفحه اصلی
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  // فایل‌های build شده توسط Vite
  '/assets/index.[hash].js',
  '/assets/index.[hash].css',
];

self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // فوراً نسخه جدید فعال میشه
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // همه تب‌ها رو کنترل کن
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // فایل cached رو برگردون
        return cachedResponse;
      }
      // اگه فایل cache نشده بود، از شبکه بیار
      return fetch(event.request).then(response => {
        // فقط پاسخ‌های موفق رو cache کن
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    })
  );
});
export default null;