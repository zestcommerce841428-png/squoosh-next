/**
 * Squoosh Next Service Worker
 * Caches WASM codecs, pages, and static assets for offline use.
 */

const CACHE_NAME = 'squoosh-next-v1';

// Codec WASM + JS files — cache aggressively (immutable binaries)
const CODEC_ASSETS = [
  '/codecs/mozjpeg/enc/mozjpeg_enc.wasm',
  '/codecs/mozjpeg/enc/mozjpeg_enc.js',
  '/codecs/webp/enc/webp_enc.wasm',
  '/codecs/webp/enc/webp_enc.js',
  '/codecs/avif/enc/avif_enc.wasm',
  '/codecs/avif/enc/avif_enc.js',
  '/codecs/jxl/enc/jxl_enc.wasm',
  '/codecs/jxl/enc/jxl_enc.js',
  '/codecs/oxipng/pkg/squoosh_oxipng_bg.wasm',
  '/codecs/oxipng/pkg/squoosh_oxipng.js',
];

// App shell pages
const SHELL_PAGES = ['/', '/compress', '/blog', '/tools', '/features', '/about'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([...CODEC_ASSETS, ...SHELL_PAGES]).catch(() => {
        // Pre-caching may fail in dev — that's fine
      })
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Cache-first for codec binaries
  if (url.pathname.startsWith('/codecs/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Network-first with cache fallback for pages
  if (url.pathname === '/' || SHELL_PAGES.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
  }
});
