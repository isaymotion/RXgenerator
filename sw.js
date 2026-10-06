const C='rx-v6',F=['./','index.html','app.js','pdf.js','manifest.json','icon-180.png','icon-192.png','icon-512.png','icon-px.png','fonts/PressStart2P-Regular.ttf'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
