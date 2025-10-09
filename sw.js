const CACHE_NAME = 'v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './192.png',
  './512.png'
];

// Instalación: cachear archivos
self.addEventListener('install', event => {
  console.log('🧱 [SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 [SW] Cacheando recursos iniciales...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('✅ [SW] Archivos cacheados correctamente.');
        return self.skipWaiting();
      })
  );
});

// Activación: limpiar cachés antiguas
self.addEventListener('activate', event => {
  console.log('🧹 [SW] Activando y limpiando cachés antiguas...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log(`🗑️ [SW] Eliminando caché antigua: ${key}`);
              return caches.delete(key);
            })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: responder desde caché, con logs
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        console.log(`⚙️ [SW] Recurso desde caché: ${event.request.url}`);
        return cachedResponse;
      }

      console.log(`📡 [SW] Buscando en red: ${event.request.url}`);
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          console.log('🚫 [SW] Sin conexión — usando versión offline (index.html)');
          return caches.match('./index.html');
        }
      });
    })
  );
});