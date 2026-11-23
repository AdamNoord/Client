importScripts('./service-worker-assets.js');

const cachePrefix = 'client-pwa-';
const cacheName = `${cachePrefix}${self.assetsManifest.version}`;

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(cacheName);
        const requests = self.assetsManifest.assets.map(asset =>
            new Request(asset.url, { integrity: asset.hash, cache: 'no-cache' }));
        await cache.addAll(requests);
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys
            .filter(key => key.startsWith(cachePrefix) && key !== cacheName)
            .map(key => caches.delete(key)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(fetch(event.request).catch(async () => {
            const cache = await caches.open(cacheName);
            return await cache.match('index.html') ?? Response.error();
        }));
        return;
    }

    event.respondWith((async () => {
        const cached = await caches.match(event.request);
        return cached ?? fetch(event.request);
    })());
});
