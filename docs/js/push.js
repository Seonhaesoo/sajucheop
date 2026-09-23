/* 아침 운세 알림 — 구글 Firebase 클라우드 메시징(FCM) 주제 구독 + Cloudflare Worker(등록·발송). 시간은 사람마다 고른다(15분 단위, 기기 시간 기준).
 * 두 종류: 띠 알림(서버가 만든 문구 그대로) / 내 사주 알림(서버는 신호만, 문구는 sw.js 가 이 기기에 저장된 사주로 계산 — 사주는 서버로 가지 않는다).
 * 페이지의 <div class="push-box" data-push data-ddi="rat" data-name="쥐띠"> 를 채운다(data-ddi 가 없으면 고르기가 뜬다).
 * 여기 있는 값은 모두 공개값(웹 앱 설정·VAPID 공개키). 비밀키는 Worker 에만 있다.
 * 흐름: 단추 → 알림 허용 → FCM 토큰 → Worker /subscribe(토큰·띠 또는 mode:saju·time·tz) → 이 기기에 상태 저장. 끄기 → /unsubscribe + 토큰 삭제.
 * 내 사주 알림은 app.js 가 저장한 사주(localStorage)를 IndexedDB 에도 복사해 두어 서비스 워커가 읽을 수 있게 한다.
 * 아이폰은 홈 화면에 추가한 앱(standalone)에서만 알림이 된다. */
(function () {
  'use strict';
  var CFG = { apiKey: 'AIzaSyAqx040A97R6V18faWzNjGMIopjo8ezxBY', projectId: 'sajucheop', messagingSenderId: '593686367227', appId: '1:593686367227:web:983ce2f978e17aca36595e' };
  var VAPID = 'BB9L4Zpot3pcoVLxsgNnQIwlZ8rrqpu54ElQRU1zm3JCupL4NTvfpO__BJDzrSd8-s-mTThbIOrZeJsTT6wgpCA';   /* Firebase 콘솔 → 클라우드 메시징 → 웹 푸시 인증서 공개키 (2026-09-24) */
  var API = 'https://sajucheop-push.sajucheop-push.workers.dev';   /* Cloudflare Worker (push-worker/, 2026-09-24 배포) */
  var SDK = 'https://www.gstatic.com/firebasejs/11.10.0/';
  var KEY = 'sajucheop.push.v1';                             /* { token, mode: 'ddi' | 'saju', ddi, time: 'HH:MM', at } (예전 저장엔 mode·time 이 없다 = ddi·08:00) */
  var PROFILE_KEY = 'sajucheop.profile.v1';                  /* app.js 가 저장하는 내 사주 (이 기기에만) */
  var DDI = [['rat', '쥐띠'], ['ox', '소띠'], ['tiger', '호랑이띠'], ['rabbit', '토끼띠'], ['dragon', '용띠'], ['snake', '뱀띠'], ['horse', '말띠'], ['goat', '양띠'], ['monkey', '원숭이띠'], ['rooster', '닭띠'], ['dog', '개띠'], ['pig', '돼지띠']];
  var DEFAULT_TIME = '08:00', STEP = 15;
  var REFRESH = 7 * 864e5;
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  var supported = ('Notification' in window) && ('serviceWorker' in navigator) && ('PushManager' in window);

  function store() { try { var o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o) { if (!o.mode) o.mode = 'ddi'; if (!o.time) o.time = DEFAULT_TIME; } return o; } catch (e) { return null; } }
  function save(o) { try { if (o) localStorage.setItem(KEY, JSON.stringify(o)); else localStorage.removeItem(KEY); } catch (e) { /* 무시 */ } }
  function profile() { try { var p = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); return p && p.year && p.month && p.day ? p : null; } catch (e) { return null; } }
  function profileLabel(p) { return (p.name ? p.name + ' · ' : '') + p.year + '년 ' + p.month + '월 ' + p.day + '일생'; }
  function track(name, p) { try { if (window.gtag) window.gtag('event', name, p || {}); } catch (e) { /* 무시 */ } }
  function nameOf(slug) { for (var i = 0; i < DDI.length; i++) if (DDI[i][0] === slug) return DDI[i][1]; return ''; }
  function labelOf(s) { return s.mode === 'saju' ? '내 사주' : nameOf(s.ddi); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  /* 'HH:MM' → 15분 단위로 반올림한 'HH:MM' (Worker 도 같은 규칙) */
  function roundTime(t) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(t || '')); if (!m) return DEFAULT_TIME;
    var min = Math.round((+m[1] * 60 + +m[2]) / STEP) * STEP % 1440;
    return pad(Math.floor(min / 60)) + ':' + pad(min % 60);
  }
  function tz() { return -new Date().getTimezoneOffset(); }
  function firstWhen(time) { var now = new Date(), p = time.split(':'); var later = (+p[0] * 60 + +p[1]) > (now.getHours() * 60 + now.getMinutes()); return (later ? '오늘 ' : '내일 ') + time; }

  /* IndexedDB 'sajucheop' / 'kv' — sw.js 가 알림이 올 때 'profile' 을 읽는다 (app.js 도 저장할 때마다 같은 곳에 넣는다) */
  function kvPut(key, val) {
    return new Promise(function (resolve) {
      try {
        var open = indexedDB.open('sajucheop', 1);
        open.onupgradeneeded = function () { open.result.createObjectStore('kv'); };
        open.onerror = function () { resolve(false); };
        open.onsuccess = function () {
          try {
            var tx = open.result.transaction('kv', 'readwrite');
            tx.objectStore('kv').put(val, key);
            tx.oncomplete = function () { resolve(true); };
            tx.onerror = function () { resolve(false); };
          } catch (e) { resolve(false); }
        };
      } catch (e) { resolve(false); }
    });
  }
  function mirrorProfile() { var p = profile(); return p ? kvPut('profile', p) : Promise.resolve(false); }

  var loading = null;
  function loadSdk() {
    if (window.firebase && window.firebase.messaging) return Promise.resolve();
    if (loading) return loading;
    loading = ['firebase-app-compat.js', 'firebase-messaging-compat.js'].reduce(function (p, f) {
      return p.then(function () { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = SDK + f; s.onload = res; s.onerror = function () { rej(new Error('sdk')); }; document.head.appendChild(s); }); });
    }, Promise.resolve());
    return loading;
  }
  function messaging() {
    if (!window.firebase.apps.length) window.firebase.initializeApp(CFG);
    return window.firebase.messaging();
  }
  function post(path, body) {
    return fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || ('http ' + r.status)); return j; }); });
  }
  function getToken() {
    return loadSdk().then(function () { return navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }); })
      .then(function () { return navigator.serviceWorker.ready; })
      .then(function (reg) { return messaging().getToken({ vapidKey: VAPID, serviceWorkerRegistration: reg }); })
      .then(function (t) { if (!t) throw new Error('token'); return t; });
  }
  /* 원하는 설정: { mode: 'saju' | 'ddi', ddi, time } */
  function wantFrom(v, fixed, time) { var w = v === 'saju' ? { mode: 'saju', ddi: null } : { mode: 'ddi', ddi: v || fixed || 'rat' }; w.time = roundTime(time || DEFAULT_TIME); return w; }
  function payload(want, token) { var b = want.mode === 'saju' ? { token: token, mode: 'saju' } : { token: token, ddi: want.ddi }; b.time = want.time; b.tz = tz(); return b; }
  function prepare(want) { return want.mode === 'saju' ? mirrorProfile() : Promise.resolve(true); }
  function saved(want, token) { return { token: token, mode: want.mode, ddi: want.ddi, time: want.time, at: Date.now() }; }

  /* ---------- 화면 ---------- */
  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-push]'));
  if (!boxes.length) return;

  function options(cur) {
    var p = profile(), html = '';
    if (p) html += '<option value="saju"' + (cur === 'saju' ? ' selected' : '') + '>내 사주로 (' + esc(profileLabel(p)) + ')</option>';
    for (var i = 0; i < DDI.length; i++) html += '<option value="' + DDI[i][0] + '"' + (DDI[i][0] === cur ? ' selected' : '') + '>' + DDI[i][1] + '</option>';
    return html;
  }
  function timeField(time) { return '<label class="push-sel">시간 <input type="time" data-time value="' + esc(time) + '" step="' + (STEP * 60) + '"></label>'; }
  function render(box, state, msg) {
    var s = store(), fixed = box.getAttribute('data-ddi') || '', fixedName = box.getAttribute('data-name') || nameOf(fixed), p = profile();
    var cur = s ? (s.mode === 'saju' ? 'saju' : s.ddi) : '';
    var html = '';
    if (state === 'busy') {
      html = '<p class="push-text">' + esc(msg || '설정하는 중…') + '</p>';
    } else if (s && s.token) {
      html = '<p class="push-text"><b>✓ 매일 ' + esc(s.time) + ', ' + esc(labelOf(s)) + ' 운세 알림이 켜져 있어요.</b>' +
        (s.mode === 'saju' ? (p ? ' <span>' + esc(profileLabel(p)) + ' 기준으로, 문구는 이 기기 안에서 계산해요.</span>' : ' <span>저장된 사주가 없어 일반 문구가 와요. 사주를 한 번 다시 계산해 주세요.</span>') : '') +
        (fixed && cur !== fixed ? ' <span>이 페이지의 ' + esc(fixedName) + '로 바꿀 수도 있어요.</span>' : '') + '</p>' +
        '<div class="push-btns">' +
        (!fixed ? '<label class="push-sel">다른 걸로 <select data-sel>' + options(cur) + '</select></label>' : '') + timeField(s.time) +
        (fixed && cur !== fixed ? '<button type="button" class="btn-outline" data-act="switch" data-to="' + fixed + '">' + esc(fixedName) + '로 바꾸기</button>' : '') +
        (fixed && p && cur !== 'saju' ? '<button type="button" class="btn-outline" data-act="switch" data-to="saju">내 사주 운세로 바꾸기</button>' : '') +
        '<button type="button" class="btn-ghost" data-act="off">알림 끄기</button></div>' +
        '<p class="push-note">시간을 바꾸면 바로 저장돼요(15분 단위, 이 기기의 시간 기준).</p>' + (msg ? '<p class="push-note">' + esc(msg) + '</p>' : '');
    } else {
      var can = supported && (!isIOS || standalone);
      html = '<p class="push-text"><b>🔔 매일 내가 정한 시간에 ' + (fixed ? esc(fixedName) + ' 운세' : (p ? '내 운세' : '내 띠 운세')) + '를 알림으로 받기</b><br><span>점수와 한 줄 흐름이 뜨고, 누르면 그날 운세로 옵니다. 언제든 끌 수 있어요.</span></p>';
      if (!fixed) html += '<label class="push-sel">' + (p ? '무엇으로 ' : '내 띠 ') + '<select data-sel>' + options(p ? 'saju' : '') + '</select></label>';
      if (can) {
        html += timeField(DEFAULT_TIME) +
          '<div class="push-btns"><button type="button" class="btn-primary" data-act="on"><span class="seal-dot" aria-hidden="true"></span><span>알림 켜기</span></button>' +
          (fixed && p ? '<button type="button" class="btn-outline" data-act="on" data-mode="saju">내 사주 운세로 받기</button>' : '') + '</div>';
        if (!p) html += '<p class="push-note">' + (location.pathname === '/' ? '위에서 사주를 한 번 계산해 두면' : '<a href="/">사주 보기</a>에서 한 번 계산해 두면') + ' 띠 대신 <b>내 사주로 계산한 운세</b>도 받을 수 있어요. 사주는 이 기기에만 남고 서버로 가지 않아요.</p>';
        else html += '<p class="push-note">내 사주 알림의 문구는 이 기기에 저장된 사주로 기기 안에서 만들어져요. 사주는 서버로 가지 않아요.</p>';
      }
      else if (isIOS && !standalone) html += '<p class="push-note">아이폰은 먼저 <b>공유 → 홈 화면에 추가</b>로 앱처럼 설치한 뒤, 그 앱에서 알림을 켤 수 있어요.</p>';
      else html += '<p class="push-note">이 브라우저는 알림을 지원하지 않아요. 크롬·삼성 인터넷·엣지에서 열어 주세요.</p>';
      if (msg) html += '<p class="push-note">' + esc(msg) + '</p>';
    }
    box.innerHTML = html;
  }
  function renderAll(box, msg) { boxes.forEach(function (b) { render(b, 'idle', b === box ? msg : ''); }); }
  function firstMsg(want) { return firstWhen(want.time) + '에 첫 알림이 와요.' + (want.mode === 'saju' ? ' 문구는 이 기기에 저장된 사주로 만들어져요.' : ''); }
  function timeOf(box) { var t = box.querySelector('[data-time]'); return roundTime(t && t.value ? t.value : DEFAULT_TIME); }

  function turnOn(box, want) {
    if (!VAPID || !API) { render(box, 'idle', '알림 기능을 준비하고 있어요. 곧 켤 수 있어요.'); return; }
    if (want.mode === 'saju' && !profile()) { render(box, 'idle', '저장된 사주가 없어요. 사주를 한 번 계산한 뒤 다시 눌러 주세요.'); return; }
    var tag = want.mode === 'saju' ? 'saju' : want.ddi;
    render(box, 'busy', '알림 허용을 눌러 주세요…');
    Promise.resolve().then(function () { return Notification.requestPermission(); }).then(function (perm) {
      if (perm !== 'granted') { track('push_denied', { ddi: tag }); render(box, 'idle', '알림이 허용되지 않았어요. 브라우저 주소창의 자물쇠에서 알림을 허용하면 다시 켤 수 있어요.'); return; }
      render(box, 'busy', '등록하는 중…');
      return prepare(want).then(getToken).then(function (token) {
        return post('/subscribe', payload(want, token)).then(function (j) {
          if (j.time) want.time = j.time;
          save(saved(want, token));
          track('push_subscribe', { ddi: tag, time: want.time });
          renderAll(box, firstMsg(want));
        });
      });
    }).catch(function (e) {
      track('push_error', { ddi: tag, msg: String(e && e.message) });
      render(box, 'idle', '지금은 켜지지 않았어요. 잠시 뒤 다시 눌러 주세요. (' + (e && e.message ? e.message : '오류') + ')');
    });
  }
  function turnOff(box) {
    var s = store(); if (!s) { render(box, 'idle'); return; }
    render(box, 'busy', '끄는 중…');
    post('/unsubscribe', { token: s.token }).catch(function () { /* 서버가 못 지워도 기기에선 끈다 */ })
      .then(function () { return loadSdk().then(function () { return messaging().deleteToken(); }).catch(function () { /* 무시 */ }); })
      .then(function () { save(null); track('push_unsubscribe', { ddi: s.mode === 'saju' ? 'saju' : s.ddi }); renderAll(box, '알림을 껐어요.'); });
  }
  /* 켜진 상태에서 종류나 시간을 바꾼다 */
  function switchTo(box, want, what) {
    var s = store(); if (!s) { turnOn(box, want); return; }
    if (want.mode === 'saju' && !profile()) { render(box, 'idle', '저장된 사주가 없어요. 사주를 한 번 계산한 뒤 다시 골라 주세요.'); return; }
    var label = want.mode === 'saju' ? '내 사주' : nameOf(want.ddi);
    render(box, 'busy', (what === 'time' ? want.time + '로' : label + '로') + ' 바꾸는 중…');
    prepare(want).then(function () { return post('/subscribe', payload(want, s.token)); }).then(function (j) {
      if (j.time) want.time = j.time;
      save(saved(want, s.token)); track(what === 'time' ? 'push_time' : 'push_switch', { ddi: want.mode === 'saju' ? 'saju' : want.ddi, time: want.time });
      renderAll(box, what === 'time' ? '이제 매일 ' + want.time + '에 와요. 다음 알림은 ' + firstWhen(want.time) + '.' : '이제 ' + label + ' 운세로 와요.');
    }).catch(function () { render(box, 'idle', '바꾸지 못했어요. 잠시 뒤 다시 눌러 주세요.'); });
  }

  boxes.forEach(function (box) {
    render(box, 'idle');
    box.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-act]') : null; if (!b) return;
      var act = b.getAttribute('data-act'), sel = box.querySelector('[data-sel]'), fixed = box.getAttribute('data-ddi'), t = timeOf(box);
      if (act === 'on') turnOn(box, b.getAttribute('data-mode') === 'saju' ? wantFrom('saju', null, t) : wantFrom(fixed || (sel && sel.value), fixed, t));
      else if (act === 'off') turnOff(box);
      else if (act === 'switch') { var s = store(); switchTo(box, wantFrom(b.getAttribute('data-to'), fixed, s ? s.time : t), 'kind'); }
    });
    box.addEventListener('change', function (e) {
      var el = e.target; if (!el.hasAttribute) return;
      var s = store();
      if (el.hasAttribute('data-sel') && s) switchTo(box, wantFrom(el.value, null, s.time), 'kind');
      else if (el.hasAttribute('data-time')) {
        var t = roundTime(el.value); el.value = t;
        if (s) switchTo(box, wantFrom(s.mode === 'saju' ? 'saju' : s.ddi, null, t), 'time');
      }
    });
  });

  /* 켜 둔 기기: 일주일에 한 번 토큰을 새로 받아 다시 등록(FCM 토큰은 바뀔 수 있다). 시간 칸이 없는 예전 구독은 08:00 으로 한 번 다시 등록. 내 사주 알림이면 사주 복사본도 새로 넣는다. */
  var s0 = store();
  if (s0 && s0.token && VAPID && API && supported && Notification.permission === 'granted') {
    if (s0.mode === 'saju') mirrorProfile();
    var legacy = !s0.slotted;
    if (legacy || Date.now() - (s0.at || 0) > REFRESH) {
      getToken().then(function (token) { return post('/subscribe', payload(s0, token)).then(function (j) { var o = saved(s0, token); if (j.time) o.time = j.time; o.slotted = true; save(o); if (legacy) renderAll(null, ''); }); }).catch(function () { /* 다음에 */ });
    }
  }
})();
