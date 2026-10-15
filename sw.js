// Flex Rolling 7 Days — network-first navigation, offline fallback.
const CACHE = 'flex-rolling-ocr-20261014-v4';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['./index.html']).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('flex-rolling-') && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate' || request.url.endsWith('/index.html')) {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) { const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(request,copy)); }
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match('./index.html')) || Response.error()));
  }
});
