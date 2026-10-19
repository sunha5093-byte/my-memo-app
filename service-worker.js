'use strict';
// Change the version whenever the app shell changes.
const CACHE_PREFIX = 'my-notepad-pwa-';
const CACHE_NAME = CACHE_PREFIX + 'v1';
const APP_FILES = [
  './index.html', './pwa.js', './manifest.json',
  './icons/icon-180.png', './icons/icon-192.png',
  './icons/icon-512.png', './icons/icon-maskable-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const scope = new URL(self.registration.scope);
  if (event.request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  const indexURL = new URL('./index.html', scope).href;
  const isAppNavigation = event.request.mode === 'navigate' && (url.pathname === scope.pathname || url.pathname === new URL(indexURL).pathname);
  if (isAppNavigation) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      // Keep the HTML and JavaScript from the same installed version together.
      return (await cache.match(indexURL)) || fetch(event.request);
    })());
    return;
  }
  const assetURLs = APP_FILES.map(path => new URL(path, scope).href);
  if (!assetURLs.includes(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(event.request)) || fetch(event.request);
  })());
});
