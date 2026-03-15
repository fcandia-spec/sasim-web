// SASIM — Service Worker de limpieza
// Este SW reemplaza al viejo y se auto-desregistra.
// Cualquier usuario con el SW viejo cacheado recibirá este,
// que borra todos los caches y se desinstala.

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.map(function(name) { return caches.delete(name); })
      );
    }).then(function() {
      return self.registration.unregister();
    })
  );
});
