/*
 * Service Worker: アプリ一式をキャッシュしてオフラインで動作させる。
 * ファイルを更新したら CACHE_VERSION を上げること。
 */
const CACHE_VERSION = 'v1';
const CACHE_NAME = `howmanydays-${CACHE_VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/date-utils.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('howmanydays-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ネットワーク優先・失敗時はキャッシュ（オンライン時は常に最新を表示）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request, { ignoreSearch: true })
          .then((cached) => cached || (request.mode === 'navigate' ? caches.match('./index.html') : undefined))
          .then((res) => res || Response.error())
      )
  );
});
