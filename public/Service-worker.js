const CACHE_NAME = 'fitosanitarios-cache-v1.1';
let urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/planta.png',
  '/robots.txt',
  '/Service-worker.js',
  '/src/static/css/main.chunk.css',
  '/src/static/js/main.chunk.js',
  '/src/static/js/0.chunk.js',
  '/src/static/js/bundle.js',
  '/src/styles/Main.css',
  '/src/styles/Pdf.css',
  '/src/styles/utils.css',
  '/src/styles/App.css',
  '/src/styles/index.css',
  '/src/assets/logo.png',
  '/src/assets/chatbot.pdf',
  '/src/components/Main.js',
  '/src/components/Pdf.js',
  '/src/App.js',
  '/src/firebase.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Fuerza la activación inmediata
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Error al abrir la caché:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache)
                .catch(error => {
                  console.error('Error al almacenar en la caché:', error);
                });
            });
          return response;
        }).catch(error => {
          console.error('Error al realizar la solicitud de red:', error);
          return error; // Devuelve una respuesta válida
        });
      }).catch(error => {
        console.error('Error al buscar en la caché:', error);
        return error; // Devuelve una respuesta válida
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});