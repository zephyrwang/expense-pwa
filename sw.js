// App-shell cache only. Data (Apps Script API) is never cached — the app is
// online-only by design. Bump CACHE_VERSION on every deploy so clients update.
const CACHE_VERSION = 'shell-v12';

const SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './api.js',
  './taxonomy.js',
  './analytics.js',
  './vendor/chart.umd.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    // cache: 'reload' skips the browser's HTTP cache (GitHub Pages sends
    // max-age=600), so a new version never re-caches the previous deploy's files.
    caches.open(CACHE_VERSION)
      .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Never intercept the API (script.google.com / googleusercontent) or any
  // cross-origin request — network only.
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});
