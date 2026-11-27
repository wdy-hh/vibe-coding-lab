export function createServiceWorkerSource(version, assets) {
  return `const CACHE_PREFIX = 'ecom-studio-v1:' + self.registration.scope + ':';
const CACHE = CACHE_PREFIX + ${JSON.stringify(version)};
const ASSETS = ${JSON.stringify(assets)};
const INDEX_URL = new URL('./index.html', self.registration.scope).href;

self.addEventListener('install', event => {
  const requests = ASSETS.map(asset => new Request(new URL(asset, self.registration.scope), { cache: 'reload' }));
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(requests)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  // Keep the previous build while pages using its HTML finish loading assets.
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).slice(0, -1).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // Health and generation requests must always reach the current server.
  if (new URL(request.url).pathname.startsWith(new URL('api/', self.registration.scope).pathname)) return;
  if (request.mode === 'navigate') {
    // Fetch fresh HTML online so it always references the currently deployed bundle.
    // A short timeout also handles hosts that stop responding while offline.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    event.respondWith(fetch(request, { cache: 'no-cache', signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Navigation unavailable');
      return response;
    }).catch(async () => {
      const cache = await caches.open(CACHE);
      const fallback = await cache.match(INDEX_URL, { ignoreVary: true }) || await caches.match(INDEX_URL, { ignoreVary: true });
      if (fallback) return fallback;
      return new Response('暂时无法离线打开，请联网后重试。', { status: 503, headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
    }).finally(() => clearTimeout(timeout)));
    return;
  }
  // These are public static assets. Module requests include Origin whereas
  // precache requests may not; Vite's Vary: Origin must not hide cached bundles.
  event.respondWith(caches.match(request, { ignoreVary: true }).then(cached => cached || fetch(request)));
});
`;
}
