const CACHE_NAME = 'papa-static-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const isStatic = request.destination === 'image' || request.destination === 'font' || request.destination === 'style' || request.destination === 'script' || url.pathname.startsWith('/_next/static/');
  if (!isStatic) return;
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        return cached ?? Response.error();
      }
    })
  );
});
