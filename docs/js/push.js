/* 아침 8시 띠별 운세 알림 — 구글 Firebase 클라우드 메시징(FCM) 주제 구독 + Cloudflare Worker(등록·발송).
 * 페이지의 <div class="push-box" data-push data-ddi="rat" data-name="쥐띠"> 를 채운다(data-ddi 가 없으면 띠 고르기가 뜬다).
 * 여기 있는 값은 모두 공개값(웹 앱 설정·VAPID 공개키). 비밀키는 Worker 에만 있다.
 * 흐름: 단추 → 알림 허용 → FCM 토큰 → Worker /subscribe(토큰·띠) → 이 기기에 상태 저장. 끄기 → /unsubscribe + 토큰 삭제.
 * 아이폰은 홈 화면에 추가한 앱(standalone)에서만 알림이 된다. */
(function () {
  'use strict';
  var CFG = { apiKey: 'AIzaSyAqx040A97R6V18faWzNjGMIopjo8ezxBY', projectId: 'sajucheop', messagingSenderId: '593686367227', appId: '1:593686367227:web:983ce2f978e17aca36595e' };
  var VAPID = 'BB9L4Zpot3pcoVLxsgNnQIwlZ8rrqpu54ElQRU1zm3JCupL4NTvfpO__BJDzrSd8-s-mTThbIOrZeJsTT6wgpCA';   /* Firebase 콘솔 → 클라우드 메시징 → 웹 푸시 인증서 공개키 (2026-09-24) */
  var API = 'https://sajucheop-push.sajucheop-push.workers.dev';   /* Cloudflare Worker (push-worker/, 2026-09-24 배포) */
  var SDK = 'https://www.gstatic.com/firebasejs/11.10.0/';
  var KEY = 'sajucheop.push.v1';                             /* { token, ddi, at } */
  var DDI = [['rat', '쥐띠'], ['ox', '소띠'], ['tiger', '호랑이띠'], ['rabbit', '토끼띠'], ['dragon', '용띠'], ['snake', '뱀띠'], ['horse', '말띠'], ['goat', '양띠'], ['monkey', '원숭이띠'], ['rooster', '닭띠'], ['dog', '개띠'], ['pig', '돼지띠']];
  var REFRESH = 7 * 864e5;
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  var supported = ('Notification' in window) && ('serviceWorker' in navigator) && ('PushManager' in window);

  function store() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save(o) { try { if (o) localStorage.setItem(KEY, JSON.stringify(o)); else localStorage.removeItem(KEY); } catch (e) { /* 무시 */ } }
  function track(name, p) { try { if (window.gtag) window.gtag('event', name, p || {}); } catch (e) { /* 무시 */ } }
  function nameOf(slug) { for (var i = 0; i < DDI.length; i++) if (DDI[i][0] === slug) return DDI[i][1]; return ''; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

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

  /* ---------- 화면 ---------- */
  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-push]'));
  if (!boxes.length) return;

  function render(box, state, msg) {
    var s = store(), fixed = box.getAttribute('data-ddi') || '', fixedName = box.getAttribute('data-name') || nameOf(fixed);
    var cur = s && s.ddi, curName = nameOf(cur);
    var html = '';
    if (state === 'busy') {
      html = '<p class="push-text">' + esc(msg || '설정하는 중…') + '</p>';
    } else if (s && s.token) {
      html = '<p class="push-text"><b>✓ 매일 아침 8시, ' + esc(curName) + ' 운세 알림이 켜져 있어요.</b>' + (fixed && fixed !== cur ? ' 이 페이지의 ' + esc(fixedName) + '로 바꿀 수도 있어요.' : '') + '</p>' +
        '<div class="push-btns">' + (fixed && fixed !== cur ? '<button type="button" class="btn-outline" data-act="switch">' + esc(fixedName) + '로 바꾸기</button>' : '') +
        (!fixed ? '<label class="push-sel">다른 띠로 <select data-sel>' + DDI.map(function (d) { return '<option value="' + d[0] + '"' + (d[0] === cur ? ' selected' : '') + '>' + d[1] + '</option>'; }).join('') + '</select></label>' : '') +
        '<button type="button" class="btn-ghost" data-act="off">알림 끄기</button></div>' + (msg ? '<p class="push-note">' + esc(msg) + '</p>' : '');
    } else {
      var can = supported && (!isIOS || standalone);
      html = '<p class="push-text"><b>🔔 매일 아침 8시, ' + (fixed ? esc(fixedName) + ' 운세' : '내 띠 운세') + '를 알림으로 받기</b><br><span>점수와 한 줄 흐름이 뜨고, 누르면 그날 운세로 옵니다. 언제든 끌 수 있어요.</span></p>';
      if (!fixed) html += '<label class="push-sel">내 띠 <select data-sel>' + DDI.map(function (d) { return '<option value="' + d[0] + '">' + d[1] + '</option>'; }).join('') + '</select></label>';
      if (can) html += '<div class="push-btns"><button type="button" class="btn-primary" data-act="on"><span class="seal-dot" aria-hidden="true"></span><span>알림 켜기</span></button></div>';
      else if (isIOS && !standalone) html += '<p class="push-note">아이폰은 먼저 <b>공유 → 홈 화면에 추가</b>로 앱처럼 설치한 뒤, 그 앱에서 알림을 켤 수 있어요.</p>';
      else html += '<p class="push-note">이 브라우저는 알림을 지원하지 않아요. 크롬·삼성 인터넷·엣지에서 열어 주세요.</p>';
      if (msg) html += '<p class="push-note">' + esc(msg) + '</p>';
    }
    box.innerHTML = html;
  }

  function turnOn(box, ddi) {
    if (!VAPID || !API) { render(box, 'idle', '알림 기능을 준비하고 있어요. 곧 켤 수 있어요.'); return; }
    if (!ddi) ddi = 'rat';
    render(box, 'busy', '알림 허용을 눌러 주세요…');
    Promise.resolve().then(function () { return Notification.requestPermission(); }).then(function (perm) {
      if (perm !== 'granted') { track('push_denied', { ddi: ddi }); render(box, 'idle', '알림이 허용되지 않았어요. 브라우저 주소창의 자물쇠에서 알림을 허용하면 다시 켤 수 있어요.'); return; }
      render(box, 'busy', '등록하는 중…');
      return getToken().then(function (token) {
        return post('/subscribe', { token: token, ddi: ddi }).then(function () {
          save({ token: token, ddi: ddi, at: Date.now() });
          track('push_subscribe', { ddi: ddi });
          boxes.forEach(function (b) { render(b, 'idle', b === box ? '내일 아침 8시에 첫 알림이 와요.' : ''); });
        });
      });
    }).catch(function (e) {
      track('push_error', { ddi: ddi, msg: String(e && e.message) });
      render(box, 'idle', '지금은 켜지지 않았어요. 잠시 뒤 다시 눌러 주세요. (' + (e && e.message ? e.message : '오류') + ')');
    });
  }
  function turnOff(box) {
    var s = store(); if (!s) { render(box, 'idle'); return; }
    render(box, 'busy', '끄는 중…');
    post('/unsubscribe', { token: s.token }).catch(function () { /* 서버가 못 지워도 기기에선 끈다 */ })
      .then(function () { return loadSdk().then(function () { return messaging().deleteToken(); }).catch(function () { /* 무시 */ }); })
      .then(function () { save(null); track('push_unsubscribe', { ddi: s.ddi }); boxes.forEach(function (b) { render(b, 'idle', b === box ? '알림을 껐어요.' : ''); }); });
  }
  function switchTo(box, ddi) {
    var s = store(); if (!s) { turnOn(box, ddi); return; }
    render(box, 'busy', nameOf(ddi) + '로 바꾸는 중…');
    post('/subscribe', { token: s.token, ddi: ddi }).then(function () {
      save({ token: s.token, ddi: ddi, at: Date.now() }); track('push_switch', { ddi: ddi });
      boxes.forEach(function (b) { render(b, 'idle', b === box ? '이제 ' + nameOf(ddi) + ' 운세로 와요.' : ''); });
    }).catch(function (e) { render(box, 'idle', '바꾸지 못했어요. 잠시 뒤 다시 눌러 주세요.'); });
  }

  boxes.forEach(function (box) {
    render(box, 'idle');
    box.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-act]') : null; if (!b) return;
      var act = b.getAttribute('data-act'), sel = box.querySelector('[data-sel]'), fixed = box.getAttribute('data-ddi');
      if (act === 'on') turnOn(box, fixed || (sel && sel.value));
      else if (act === 'off') turnOff(box);
      else if (act === 'switch') switchTo(box, fixed);
    });
    box.addEventListener('change', function (e) {
      if (!e.target.hasAttribute || !e.target.hasAttribute('data-sel')) return;
      if (store()) switchTo(box, e.target.value);
    });
  });

  /* 켜 둔 기기: 일주일에 한 번 토큰을 새로 받아 다시 등록(FCM 토큰은 바뀔 수 있다) */
  var s0 = store();
  if (s0 && s0.token && VAPID && API && supported && Notification.permission === 'granted' && Date.now() - (s0.at || 0) > REFRESH) {
    getToken().then(function (token) { return post('/subscribe', { token: token, ddi: s0.ddi }).then(function () { save({ token: token, ddi: s0.ddi, at: Date.now() }); }); }).catch(function () { /* 다음에 */ });
  }
})();
