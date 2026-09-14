/* Sajucheop service worker — pages, CSS and JS are network-first (fresh after every deploy) with the cache as an offline fallback;
 * images and fonts are cache-first. Bump VERSION to drop old caches. Registered by js/pwa.js. */
var VERSION = 'sajucheop-v1';
var OFFLINE = '/offline.html';
var PRECACHE = [OFFLINE, '/css/style.css', '/favicon.svg', '/icons/icon-192.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function put(req, res) {
  if (res && res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
  return res;
}
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.indexOf('/dev/') === 0) return;   /* fonts, analytics, ads, dev endpoints: untouched */
  if (req.mode === 'navigate' || /\.(css|js|webmanifest|json|xml|txt)$/.test(url.pathname)) {
    e.respondWith(fetch(req).then(function (res) { return put(req, res); }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || (req.mode === 'navigate' ? caches.match(OFFLINE) : Response.error()); });
    }));
    return;
  }
  if (/\.(png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) { return put(req, res); }).catch(function () { return hit || Response.error(); });
      return hit || net;
    }));
  }
});
