const cacheName = "DefaultCompany-Shwe Kyawl-1.0";
const contentToCache = [
    "Build/560a6d0327b7384c075b0187fac16866.loader.js",
    "Build/7f2f0b80361fd2fab1930382888087ef.framework.js.br",
    "Build/4dbe5e3090e46d5c9152c157b03f6503.data.br",
    "Build/7d0abec18e94c3c7b69120387eb7588f.wasm.br",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
});
