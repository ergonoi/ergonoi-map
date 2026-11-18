// Service worker of the site build (README: Install as an app). The page and its icons are
// kept on the device: fetched from the network first, so a new version arrives when online,
// and taken from the cache without a network. Maps never pass through here; they stay in
// the browser's storage.
const CACHE = "outheis-map-@@CACHE_ID@@";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // The network first, but not for long: on a weak connection the copy on the device is
  // used after 3 seconds, and the fetch still refreshes the cache when it arrives.
  const net = fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  });
  const cached = () => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html"));
  const late = new Promise(res => setTimeout(res, 3000)).then(cached);
  e.respondWith(Promise.race([net.catch(cached), late.then(r => r || net)]));
  e.waitUntil(net.catch(() => {}));
});
