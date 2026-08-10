const cacheName = "DefaultCompany-Shwe Kyawl-1.0";
const contentToCache = [
    "Build/e0845394379a85f1171541048c5f21d8.loader.js",
    "Build/7f2f0b80361fd2fab1930382888087ef.framework.js.br",
    "Build/3848932f00b819d7f5231e8fd465d7ae.data.br",
    "Build/e65ee02bd566b330c414436b49b12d10.wasm.br",
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
