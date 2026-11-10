// 洗車くん サービスワーカー（電波がなくても起動できるようにする）
const VER='senshakun-v5';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{}))))); self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER&&k!==VER+'-fonts').map(k=>caches.delete(k))))); self.clients.claim();});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  // 文字（Googleフォント）：一度読んだら保存して使う
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(VER+'-fonts').then(async c=>{const hit=await c.match(e.request);if(hit)return hit;
      const r=await fetch(e.request);c.put(e.request,r.clone());return r;}).catch(()=>caches.match(e.request)));return;}
  // アプリ本体：新しい版を優先、つながらない時は保存分
  if(u.origin===location.origin){
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(VER).then(c=>c.put(e.request,cp));return r;})
      .catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));}
});
