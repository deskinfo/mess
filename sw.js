// নেটওয়ার্ক আগে (সর্বোচ্চ ৩ সেকেন্ড), ধীর বা অফলাইন হলে ক্যাশ থেকে সঙ্গে সঙ্গে খোলে।
// নতুন সংস্করণ দিলে নিচের নম্বরটা বাড়িয়ে দিন (mess-v7, mess-v8 ...)
const C='mess-v7';
const FILES=['./','index.html','config.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res});
  const cached=()=>caches.match(r).then(m=>m||caches.match('./'));
  const slow=new Promise(res=>setTimeout(()=>cached().then(res),3000));
  e.respondWith(Promise.race([net,slow]).then(x=>x||net).catch(()=>cached().then(m=>m||Response.error())));
});

// ---------- নোটিফিকেশন (FCM থেকে আসা মেসেজ দেখানো) ----------
self.addEventListener('push',e=>{
  let p={};try{p=e.data?e.data.json():{}}catch(_){try{p={data:{body:e.data.text()}}}catch(__){}}
  const d=(p.data&&Object.keys(p.data).length?p.data:null)||p.notification||p||{};
  const title=d.title||'মেস ম্যানেজার',body=d.body||'';
  e.waitUntil(self.registration.showNotification(title,{body,icon:'icon-192.png',badge:'icon-192.png',tag:d.tag||undefined,renotify:!!d.tag,data:{url:d.url||'./'}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const u=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
    for(const c of l){if('focus' in c)return c.focus()}
    return clients.openWindow(u);
  }));
});
