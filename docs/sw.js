/* Sajucheop service worker — pages, CSS and JS are network-first (fresh after every deploy) with the cache as an offline fallback;
 * images and fonts are cache-first. Bump VERSION to drop old caches. Registered by js/pwa.js. */
var VERSION = 'sajucheop-v2';   /* v2: 알림(push) 처리 추가 */
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

/* ---------- 알림 (FCM 웹 푸시 — js/push.js 가 구독, push-worker 가 발송) ----------
 * FCM 이 넘기는 본문: { notification: { title, body, icon, tag }, data: { url, kind, date }, fcmOptions: { link } } */
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { notification: { title: '사주첩', body: e.data ? e.data.text() : '' } }; }
  var n = d.notification || {}, data = d.data || {};
  var url = (d.fcmOptions && d.fcmOptions.link) || data.url || '/today/ddi/';
  e.waitUntil(self.registration.showNotification(n.title || data.title || '오늘의 운세', {
    body: n.body || data.body || '',
    icon: n.icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: n.tag || data.tag || 'sajucheop',
    renotify: false,
    lang: 'ko',
    data: { url: url }
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (c.url.indexOf(self.location.origin) === 0 && 'focus' in c) { if ('navigate' in c) c.navigate(url); return c.focus(); }
    }
    return self.clients.openWindow(url);
  }));
});
