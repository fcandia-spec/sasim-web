// SASIM Service Worker — cache básico para PWA
const CACHE = 'sasim-v2';
const ASSETS = ['/', '/index.html', '/css/variables.css', '/css/main.css'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
