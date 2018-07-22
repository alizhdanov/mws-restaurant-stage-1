const staticCacheName = 'restaurants-static-v456'; // yeah I've actually put so much affort
const contentImgsCache = 'restaurants-imgs-v1';
const allCaches = [staticCacheName, contentImgsCache];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/',
        'restaurant.html',
        'index.bundle.js',
        'restaurant.bundle.js',
        'styles.css',
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(cacheName) {
            return (
              cacheName.startsWith('restaurants-') &&
              !allCaches.includes(cacheName)
            );
          })
          .map(function(cacheName) {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.startsWith('/img/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      return response || fetch(event.request);
    })
  );
});

const servePhoto = async request => {
  const { url } = request;
  const cache = await caches.open(contentImgsCache);
  const response = await cache.match(url);

  if (response) return response;

  const networkResponse = await fetch(request);

  cache.put(url, networkResponse.clone());

  return networkResponse;
};

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
