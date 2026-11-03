const CACHE_NAME = 'apna-bazar-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './offline.html'
];

// Install Event - Files ko cache karna
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Purana cache delete karna
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Pehle internet check karega, nahi toh cache se layega
self.addEventListener('fetch', (e) => {
  // Sirf GET requests handle karo
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Agar internet hai, toh latest file cache mein save karo
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => {
        // Agar internet nahi hai, toh cache se do
        return caches.match(e.request).then((cached) => {
          if (cached) return cached;
          // Agar page nahi mila, toh offline page dikhao
          if (e.request.mode === 'navigate') {
            return caches.match('./offline.html');
          }
        });
      })
  );
});
