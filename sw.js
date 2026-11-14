// নেটওয়ার্ক আগে (সর্বোচ্চ ৩ সেকেন্ড), ধীর বা অফলাইন হলে ক্যাশ থেকে সঙ্গে সঙ্গে খোলে।
// নতুন সংস্করণ দিলে নিচের নম্বরটা বাড়িয়ে দিন (mess-v4, mess-v5 ...)
const C='mess-v4';
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
