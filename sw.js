// Кэш оболочки приложения. Сам ИИ-разговор требует интернета (запросы к Gemini не кэшируются).
const CACHE = "chinese-sim-v2";
const ASSETS = ["./","./index.html","./scenarios.js","./gemini.js","./manifest.json","./icon.svg"];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e=>{
  if(e.request.method!=="GET") return;
  // Запросы к Gemini не трогаем — идут напрямую в сеть.
  if(e.request.url.indexOf("generativelanguage.googleapis.com")>-1) return;
  e.respondWith(
    caches.match(e.request).then(hit=> hit || fetch(e.request).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match("./index.html")))
  );
});
