/* Sajucheop service worker — pages, CSS and JS are network-first (fresh after every deploy) with the cache as an offline fallback;
 * images and fonts are cache-first. Bump VERSION to drop old caches. Registered by js/pwa.js.
 * v3: 알림(push) — 띠 알림은 서버가 보낸 문구 그대로, '내 사주' 알림은 기기에 저장된 사주로 여기서 오늘 점수를 계산해 띄운다(사주는 서버로 가지 않는다). */
var VERSION = 'sajucheop-v3';
var OFFLINE = '/offline.html';
var PRECACHE = [OFFLINE, '/css/style.css', '/favicon.svg', '/icons/icon-192.png', '/js/manseryeok.js', '/js/interpret.js'];

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

/* ---------- 기기 저장소 (IndexedDB 'sajucheop' / 'kv') — js/push.js·app.js 가 같은 곳에 사주를 넣는다 ---------- */
function idbGet(key) {
  return new Promise(function (resolve) {
    try {
      var open = indexedDB.open('sajucheop', 1);
      open.onupgradeneeded = function () { open.result.createObjectStore('kv'); };
      open.onerror = function () { resolve(null); };
      open.onsuccess = function () {
        try {
          var tx = open.result.transaction('kv', 'readonly'), req = tx.objectStore('kv').get(key);
          req.onsuccess = function () { resolve(req.result || null); };
          req.onerror = function () { resolve(null); };
        } catch (e) { resolve(null); }
      };
    } catch (e) { resolve(null); }
  });
}

/* 만세력·해석 엔진 — 알림이 올 때만 캐시에서 읽어 실행 (평소 화면 요청에는 부담 없음) */
var engineReady = null;
function loadEngine() {
  if (self.Manseryeok && self.Interpret) return Promise.resolve(true);
  if (engineReady) return engineReady;
  self.window = self;
  engineReady = Promise.all(['/js/manseryeok.js', '/js/interpret.js'].map(function (p) {
    return caches.match(p).then(function (hit) { return hit || fetch(p); }).then(function (r) { return r.text(); });
  })).then(function (srcs) {
    srcs.forEach(function (src) { (0, eval)(src); });
    return !!(self.Manseryeok && self.Interpret);
  }).catch(function () { engineReady = null; return false; });
  return engineReady;
}

/* 내 사주로 오늘 문구 — { title, body }. 날짜는 기기의 오늘(앱 화면과 같은 기준). app.js renderToday 와 같은 계산. */
function personalToday(profile) {
  var M = self.Manseryeok, I = self.Interpret;
  var now = new Date();
  var y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
  var r = M.compute({ year: profile.year, month: profile.month, day: profile.day, hour: profile.hour, minute: profile.minute, unknownTime: !!profile.unknownTime, gender: profile.gender || 'F', applySolarTime: profile.applySolarTime !== false, nowYear: y });
  var info = M.todayInfo(r, y, m, d);
  var idx60 = M._internals.dayPillarIndex(M._internals.daysFromCivil(y, m, d) + M._internals.JDN_EPOCH);
  var f = I.todayFortune(r, info, idx60);
  var who = profile.name ? profile.name + '님의' : '내';
  var theme = f.theme && f.theme.title ? f.theme.title : f.weatherLine;
  return {
    title: '오늘 ' + who + ' 운세 ' + f.score + '점 · ' + f.weather,
    body: theme + (f.lucky && f.lucky.color ? ' · 행운의 색 ' + f.lucky.color : '') + (f.relationText ? ' · ' + f.relationText : '')
  };
}

/* ---------- 알림 (FCM 웹 푸시 — js/push.js 가 구독, push-worker 가 발송) ----------
 * 본문: { notification: { title, body, icon, tag }, data: { url, kind: 'ddi' | 'saju' | 'test', date }, fcmOptions: { link } } */
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { notification: { title: '사주첩', body: e.data ? e.data.text() : '' } }; }
  var n = d.notification || {}, data = d.data || {};
  var url = (d.fcmOptions && d.fcmOptions.link) || data.url || '/today/ddi/';
  var title = n.title || data.title || '오늘의 운세', body = n.body || data.body || '';
  var show = function (t, b) {
    return self.registration.showNotification(t, { body: b, icon: n.icon || '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: n.tag || data.tag || 'sajucheop', renotify: false, lang: 'ko', data: { url: url } });
  };
  if (data.kind !== 'saju') { e.waitUntil(show(title, body)); return; }
  /* 내 사주 알림: 기기에 저장된 사주로 계산 — 없거나 실패하면 서버가 준 안내 문구 */
  e.waitUntil(idbGet('profile').then(function (profile) {
    if (!profile || !profile.year) return show(title, body);
    return loadEngine().then(function (ok) {
      if (!ok) return show(title, body);
      try { var p = personalToday(profile); return show(p.title, p.body); } catch (err) { return show(title, body); }
    });
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
