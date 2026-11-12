// নেটওয়ার্ক আগে (সর্বোচ্চ ৩ সেকেন্ড), ধীর বা অফলাইন হলে ক্যাশ থেকে সঙ্গে সঙ্গে খোলে।
const C='mess-v2';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res});
  const cached=()=>caches.match(r).then(m=>m||caches.match('./'));
  const slow=new Promise(res=>setTimeout(()=>cached().then(res),3000));
  e.respondWith(Promise.race([net,slow]).then(x=>x||net).catch(()=>cached().then(m=>m||Response.error())));
});
