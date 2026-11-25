// Keeps the app shell available offline. Data offline is handled by Firestore's own cache.
const CACHE = "divine-billing-v4";
const SHELL = ["./", "index.html", "firebase.js", "config.js", "manifest.webmanifest", "icons/icon-192.png", "logo.png", "qr-links.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.hostname.endsWith("googleapis.com") && !u.hostname.startsWith("fonts")) return; // Firestore/Auth traffic
  const isLib = /gstatic\.com|cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.hostname);
  if (isLib) { // cache-first for pinned library files and fonts
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return res; })));
    return;
  }
  if (u.origin === location.origin) { // network-first for the app itself, so updates show up
    e.respondWith(fetch(e.request).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return res; }).catch(() => caches.match(e.request).then((r) => r || caches.match("index.html"))));
  }
});
