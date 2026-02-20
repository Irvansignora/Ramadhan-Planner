const CACHE = 'ramadhan-v8';
const CORE  = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;

  const url  = new URL(e.request.url);
  const same = url.origin === location.origin;

  if (same) {
    if (e.request.mode === 'navigate' || url.pathname === '/index.html' || url.pathname === '/') {
      // Network-first untuk index.html — update langsung terasa
      e.respondWith(
        fetch(e.request)
          .then(r => {
            if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
            return r;
          })
          .catch(() => caches.match(e.request).then(c => c || caches.match('/index.html')))
      );
    } else {
      // Cache-first untuk asset statis (icon, manifest, dll)
      e.respondWith(
        caches.match(e.request).then(c => c || fetch(e.request).then(r => {
          if (r.ok) caches.open(CACHE).then(cache => cache.put(e.request, r.clone()));
          return r;
        }))
      );
    }
  } else {
    // Request external (API dll) — network dulu, fallback cache
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  }
});
