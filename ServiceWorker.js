const contentToCache = [
    "Build/Build21_Buy.loader.js",
    "Build/29418b910aa66cb57865323387164d09.js.br",
    "Build/6d221c2aac8da674c6335f908ceb34c6.data.br",
    "Build/ff2636ec32a380c3faa47515ca93b67d.wasm.br",
    "TemplateData/style.css"
];

// Derive the cache name from the hashed build file names. Unity re-hashes these
// on every build, so when you deploy a new build the cache name changes
// automatically -> the old cache is treated as stale and discarded. This is the
// "if filenames match, reuse; if they differ, refetch" behaviour, automated.
const buildVersion = contentToCache.join("|");
const cacheName = "DefaultCompany-WebSlots-" + hashString(buildVersion);

function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(16);
}

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install ' + cacheName);
    // Activate this new worker immediately instead of waiting for all tabs to close.
    self.skipWaiting();
    e.waitUntil((async function () {
        const cache = await caches.open(cacheName);
        console.log('[Service Worker] Caching app shell and content');
        await cache.addAll(contentToCache);
    })());
});

self.addEventListener('activate', function (e) {
    e.waitUntil((async function () {
        // Delete every cache that isn't the current build's cache.
        const keys = await caches.keys();
        await Promise.all(
            keys.filter(k => k !== cacheName).map(k => {
                console.log('[Service Worker] Deleting old cache: ' + k);
                return caches.delete(k);
            })
        );
        // Take control of already-open pages right away.
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', function (e) {
    const request = e.request;
    const url = new URL(request.url);

    // HTML / loader / manifest must always reflect the latest deploy, so they
    // are network-first. The HTML references the current hashed build files, so
    // as soon as a new deploy is live, a reload picks up the new build.
    const isNavigation =
        request.mode === 'navigate' ||
        url.pathname.endsWith('.html') ||
        url.pathname.endsWith('.loader.js') ||
        url.pathname.endsWith('.webmanifest');

    if (isNavigation) {
        e.respondWith((async function () {
            try {
                const fresh = await fetch(request);
                const cache = await caches.open(cacheName);
                cache.put(request, fresh.clone());
                return fresh;
            } catch (err) {
                // Offline fallback to whatever we last cached.
                const cached = await caches.match(request);
                if (cached) { return cached; }
                throw err;
            }
        })());
        return;
    }

    // Hashed build assets (.br / .data / .wasm) are content-addressed and
    // immutable, so cache-first is correct and fast.
    e.respondWith((async function () {
        const cached = await caches.match(request);
        if (cached) { return cached; }

        const response = await fetch(request);
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
        return response;
    })());
});
