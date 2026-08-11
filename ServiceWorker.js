const cacheName = "DefaultCompany-Shwe Kyawl-1.0";
const contentToCache = [
    "Build/31c46d067b12925dd2063e6cf27db6a4.loader.js",
    "Build/7f2f0b80361fd2fab1930382888087ef.framework.js.br",
    "Build/27f8a9c4d19b8634bb56f75057136776.data.br",
    "Build/33f43f45b3ba9befb407779bbf2058c0.wasm.br",
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
