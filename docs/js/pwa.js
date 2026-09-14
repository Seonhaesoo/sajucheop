/* Sajucheop PWA — registers the service worker and nudges phones to add the site to the home screen.
 * Android/Samsung: the browser's install prompt (beforeinstallprompt). iOS Safari: a two-step hint (Share → Add to Home Screen).
 * Shown once per 14 days, never once installed or when already running standalone. Loaded on every page. */
(function () {
  'use strict';
  var lang = (document.documentElement.getAttribute('lang') || 'ko').slice(0, 2);
  var SHARE = '<svg class="pwa-share" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l4 4h-3v8h-2V7H8l4-4zM5 11h3v2H7v8h10v-8h-1v-2h3v12H5V11z" fill="currentColor"/></svg>';
  var TEXT = {
    ko: { title: '홈 화면에 사주첩 추가', body: '앱처럼 바로 열고, 매일 아침 오늘의 운세를 한 번에.', add: '추가', later: '나중에',
      ios: '아래 공유 버튼 ' + SHARE + ' 을 누른 뒤 <b>홈 화면에 추가</b>를 선택하세요.' },
    en: { title: 'Add Sajucheop to your home screen', body: 'Opens like an app — your chart and today’s reading in one tap.', add: 'Add', later: 'Later',
      ios: 'Tap the Share button ' + SHARE + ' below, then <b>Add to Home Screen</b>.' },
    ja: { title: 'ホーム画面にサジュチョプを追加', body: 'アプリのようにワンタップで命式と今日の運勢へ。', add: '追加', later: 'あとで',
      ios: '下の共有ボタン ' + SHARE + ' をタップし、<b>ホーム画面に追加</b>を選んでください。' }
  };
  var T = TEXT[lang] || TEXT.ko;
  var KEY = 'sajucheop.pwa.v2';   /* { dismissedAt, installed } */
  var DELAY = 12000, SNOOZE = 14 * 864e5;
  var ua = navigator.userAgent || '';
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|KAKAOTALK|Instagram|FBAN|FBAV|Line\/|NAVER|DaumApps|Twitter|Threads/.test(ua);
  var mobile = !!(window.matchMedia && (window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768));

  function store() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* ignore */ } }
  function track(name, params) { try { if (window.gtag) window.gtag('event', name, params || {}); } catch (e) { /* ignore */ } }

  /* service worker: offline shell + Android install criteria */
  if (('serviceWorker' in navigator) && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(function () { /* ignore */ });
    });
  }

  var deferred = null, bar = null;
  function eligible() {
    var s = store();
    if (standalone || s.installed) return false;
    if (s.dismissedAt && Date.now() - s.dismissedAt < SNOOZE) return false;
    return mobile;
  }
  function build(kind) {
    if (bar) return;
    bar = document.createElement('div');
    bar.className = 'pwa-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', T.title);
    bar.innerHTML = '<img class="pwa-icon" src="/icons/icon-192.png" alt="" width="44" height="44">' +
      '<div class="pwa-text"><b>' + T.title + '</b><span>' + (kind === 'ios' ? T.ios : T.body) + '</span></div>' +
      '<div class="pwa-actions">' + (kind === 'android' ? '<button type="button" class="pwa-add">' + T.add + '</button>' : '') +
      '<button type="button" class="pwa-later">' + T.later + '</button></div>';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (bar) bar.classList.add('show'); }); });
    bar.querySelector('.pwa-later').addEventListener('click', function () { dismiss('later'); });
    var add = bar.querySelector('.pwa-add');
    if (add) add.addEventListener('click', install);
    track('pwa_prompt_shown', { kind: kind, lang: lang });
  }
  function hide() {
    if (!bar) return;
    var el = bar; bar = null;
    el.classList.remove('show');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
  }
  function dismiss(why) {
    var s = store(); s.dismissedAt = Date.now(); save(s);
    hide();
    track('pwa_dismiss', { why: why });
  }
  function install() {
    if (!deferred) { dismiss('no-prompt'); return; }
    var p = deferred; deferred = null;
    track('pwa_install_click');
    p.prompt();
    p.userChoice.then(function (c) {
      var s = store();
      if (c.outcome === 'accepted') s.installed = Date.now(); else s.dismissedAt = Date.now();
      save(s);
      track('pwa_install_result', { outcome: c.outcome });
      hide();
    }).catch(hide);
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    if (eligible()) setTimeout(function () { if (deferred) build('android'); }, DELAY);
  });
  window.addEventListener('appinstalled', function () {
    var s = store(); s.installed = Date.now(); save(s);
    hide();
    track('pwa_installed');
  });
  if (isIOS && isSafari && eligible()) setTimeout(function () { build('ios'); }, DELAY);

  /* QA: ?pwa=ios or ?pwa=android shows the nudge right away */
  var q = /[?&]pwa=(ios|android)/.exec(location.search);
  if (q) setTimeout(function () { build(q[1]); }, 300);
  window.SajuPwa = { show: build, hide: hide };
})();
