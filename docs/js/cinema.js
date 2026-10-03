/* 사주첩 연출 — 결과가 '펼쳐지는' 순간을 영화처럼. (window.Cinema, 없어도 앱은 그대로 돈다)
 *  revealChart(r, {lang, name, order, onCovered})  명식 펼침: 누른 자리에서 먹이 번져 화면을 덮고, 레터박스, 년→월→일→시 글자가
 *      붓으로 쓰이듯 나타나고, 일간에 초점이 모이고, 도장이 찍힌 뒤 막이 걷힌다. 누르면 건너뜀. onCovered 는 화면이 다 덮였을 때(그 아래에서 결과 화면으로 바꾸라고).
 *  onView(name, view)  app.js showView 끝에서: 첩장 넘기듯 화면 넘김, 아래쪽 카드는 스크롤하면 먹이 번지듯 등장, 오행 막대 채우기,
 *      오늘의 운세(하루 한 번 긁어서 보기 → 점수 올라가기 · 날씨 그림 · 높은 점수엔 매화 꽃잎), 캐릭터(카드 뒤집기 → 엠블럼이 붓으로 그려짐),
 *      대운 그래프 그리기, 궁합 점수 올라가기.
 *  enhance(scope)  영문·일본어 계산기 결과 블록에 오행 막대 채우기.
 *  소리는 처음엔 꺼져 있고 연출 화면의 '소리 켜기'로 켠다(기기에 기억). 움직임 줄이기 설정·주소에 ?nocine 이면 아무 연출 없이 바로 보인다. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var off = /[?&]nocine\b/.test(location.search);
  function motionOK() { return !off && !(mq && mq.matches); }                 /* 연출 전반 */
  function enabled() { return motionOK() && doc.visibilityState !== 'hidden'; }   /* 펼침은 화면이 보일 때만 */
  var LANG = (root.getAttribute('lang') || 'ko').slice(0, 2);

  var T = {
    ko: { title: '명식 펼치기', skip: '건너뛰기', tap: '화면을 누르면 건너뛰어요', soundOn: '소리 켜기', soundOff: '소리 끄기', building: '여덟 글자를 세웁니다',
      steps: { year: '태어난 해', month: '태어난 달', day: '태어난 날', hour: '태어난 시' }, unknown: '모름',
      me: function (n) { return n ? '이 글자가 ' + n + '님이에요' : '이 글자가 나예요'; }, meSub: '일간 · 나를 나타내는 글자',
      scratch: '긁어서 오늘의 점수 확인', scratchHint: '손가락으로 문질러 보세요', now: '바로 보기',
      flip: '눌러서 카드 뒤집기', flipHint: '나를 닮은 캐릭터가 숨어 있어요' },
    en: { title: 'Casting your chart', skip: 'Skip', tap: 'Tap anywhere to skip', soundOn: 'Sound on', soundOff: 'Sound off', building: 'Casting your Four Pillars',
      steps: { year: 'Year of birth', month: 'Month of birth', day: 'Day of birth', hour: 'Hour of birth' }, unknown: 'unknown',
      me: function () { return 'This character is you'; }, meSub: 'your Day Master',
      scratch: 'Scratch to see today’s score', scratchHint: 'Rub with your finger', now: 'Show now', flip: 'Tap to flip the card', flipHint: 'Your character is hiding here' },
    ja: { title: '命式を立てる', skip: 'スキップ', tap: '画面をタップでスキップ', soundOn: '音をオン', soundOff: '音をオフ', building: '八つの文字を立てています',
      steps: { year: '生まれた年', month: '生まれた月', day: '生まれた日', hour: '生まれた時' }, unknown: '不明',
      me: function () { return 'この文字があなたです'; }, meSub: '日干 · あなた自身を表す文字',
      scratch: 'こすって今日の点数を確認', scratchHint: '指でこすってください', now: 'すぐ見る', flip: 'タップしてカードをめくる', flipHint: 'あなたに似たキャラクターが隠れています' }
  };
  var LAB = {
    ko: { year: ['年', '년주'], month: ['月', '월주'], day: ['日', '일주'], hour: ['時', '시주'] },
    en: { year: ['年', 'Year'], month: ['月', 'Month'], day: ['日', 'Day'], hour: ['時', 'Hour'] },
    ja: { year: ['年', '年柱'], month: ['月', '月柱'], day: ['日', '日柱'], hour: ['時', '時柱'] }
  };
  var PY_S = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
  var PY_B = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
  var AN_EN = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  var JA_S = ['きのえ', 'きのと', 'ひのえ', 'ひのと', 'つちのえ', 'つちのと', 'かのえ', 'かのと', 'みずのえ', 'みずのと'];
  var JA_B = ['ね', 'うし', 'とら', 'う', 'たつ', 'み', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'い'];
  var EL_EN = { '목': 'Wood', '화': 'Fire', '토': 'Earth', '금': 'Metal', '수': 'Water' };
  var EL_JA = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 무시 */ } }
  function track(n, p) { try { if (window.gtag) window.gtag('event', n, p || {}); } catch (e) { /* 무시 */ } }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* 무시 */ } }
  function dayStr() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function key(inp) { return inp ? [inp.year, inp.month, inp.day, inp.unknownTime ? 'x' : inp.hour + ':' + inp.minute, inp.gender].join('|') : ''; }

  /* 마지막으로 누른 자리 — 먹이 거기서 번진다 */
  var lastTap = null;
  doc.addEventListener('pointerdown', function (e) {
    lastTap = { x: e.clientX, y: e.clientY, t: Date.now() };
    if (!motionOK() || !e.target.closest) return;
    var b = e.target.closest('.btn-primary, .btn-outline'); if (!b) return;
    var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.4, s = doc.createElement('span');
    s.className = 'cine-ripple';
    s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
    if (getComputedStyle(b).position === 'static') b.classList.add('cine-rel');
    b.classList.add('cine-clip');
    b.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 720);
  }, true);

  /* ---------- 소리 (선택) — 파일 없이 WebAudio 로 만든다 ---------- */
  var SOUND = 'sajucheop.sound.v1', actx = null;
  function soundOn() { return get(SOUND) === '1'; }
  function audio() {
    if (!actx) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; try { actx = new A(); } catch (e) { return null; } }
    if (actx.state === 'suspended') { try { actx.resume(); } catch (e) { /* 무시 */ } }
    return actx;
  }
  function noise(c, sec) { var n = Math.floor(c.sampleRate * sec), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; }
  function env(c, g, t, peak, a, dcy) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dcy); }
  function sfx(kind) {
    if (!soundOn()) return;
    var c = audio(); if (!c) return;
    try {
      var t = c.currentTime + 0.01, out = c.createGain(); out.gain.value = 0.6; out.connect(c.destination);
      if (kind === 'brush' || kind === 'flip') {
        var s = c.createBufferSource(); s.buffer = noise(c, 0.45);
        var f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = kind === 'flip' ? 0.6 : 1.1;
        f.frequency.setValueAtTime(kind === 'flip' ? 900 : 2800, t); f.frequency.exponentialRampToValueAtTime(kind === 'flip' ? 2600 : 520, t + 0.36);
        var g = c.createGain(); env(c, g, t, kind === 'flip' ? 0.16 : 0.2, 0.05, 0.34);
        s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + 0.45);
      } else if (kind === 'stamp') {
        var o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.18);
        var g2 = c.createGain(); g2.gain.setValueAtTime(0.9, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        o.connect(g2); g2.connect(out); o.start(t); o.stop(t + 0.34);
        var s2 = c.createBufferSource(); s2.buffer = noise(c, 0.07); var hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1600;
        var g3 = c.createGain(); g3.gain.setValueAtTime(0.4, t); g3.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
        s2.connect(hp); hp.connect(g3); g3.connect(out); s2.start(t); s2.stop(t + 0.08);
      } else if (kind === 'chime') {
        [1046.5, 1568, 2093].forEach(function (fq, i) {
          var o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = fq;
          var g4 = c.createGain(); env(c, g4, t + i * 0.1, 0.14 / (i + 1), 0.02, 1.5);
          o2.connect(g4); g4.connect(out); o2.start(t + i * 0.1); o2.stop(t + i * 0.1 + 1.6);
        });
      }
    } catch (e) { /* 소리는 없어도 된다 */ }
  }

  /* ---------- 명식 펼침 ---------- */
  var busy = false, pending = [];
  var SEAL = '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><filter id="cine-rough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"></feTurbulence><feDisplacementMap in="SourceGraphic" scale="4.5"></feDisplacementMap></filter></defs>' +
    '<g filter="url(#cine-rough)"><rect x="5" y="5" width="90" height="90" rx="9" fill="#B8382D"></rect><rect x="12" y="12" width="76" height="76" rx="5" fill="none" stroke="#F6E9DC" stroke-width="2.6"></rect>' +
    '<text x="67" y="45" text-anchor="middle" font-family="\'Noto Serif KR\',serif" font-size="27" font-weight="700" fill="#F6E9DC">四</text>' +
    '<text x="67" y="77" text-anchor="middle" font-family="\'Noto Serif KR\',serif" font-size="27" font-weight="700" fill="#F6E9DC">柱</text>' +
    '<text x="33" y="62" text-anchor="middle" font-family="\'Noto Serif KR\',serif" font-size="30" font-weight="700" fill="#F6E9DC">帖</text></g></svg>';

  function subOf(lang, kind, idx, x) {
    if (lang === 'en') return kind === 's' ? PY_S[idx] + ' · ' + (x.yang ? 'Yang ' : 'Yin ') + EL_EN[x.el] : PY_B[idx] + ' · ' + AN_EN[idx];
    if (lang === 'ja') return (kind === 's' ? JA_S[idx] : JA_B[idx]) + ' · ' + EL_JA[x.el];
    return x.kor + x.el;
  }

  function revealChart(r, o) {
    o = o || {};
    var M = window.Manseryeok;
    if (!enabled() || busy || !r || !r.pillars || !M) return false;
    try {
      var lang = T[o.lang] ? o.lang : (T[LANG] ? LANG : 'ko'), t = T[lang], P = r.pillars;
      var order = o.order === 'west' ? ['year', 'month', 'day', 'hour'] : ['hour', 'day', 'month', 'year'];
      var cols = order.map(function (k) {
        var p = P[k], lab = LAB[lang][k], head = '<div class="cine-lab"><b>' + lab[0] + '</b>' + lab[1] + '</div>';
        if (!p) return '<div class="cine-col empty" data-k="' + k + '">' + head + '<div class="cine-ch"><span>─</span></div><div class="cine-sub">' + t.unknown + '</div><div class="cine-gap"></div><div class="cine-ch b"><span>─</span></div><div class="cine-sub b">&nbsp;</div></div>';
        var s = M.STEMS[p.stem], b = M.BRANCHES[p.branch];
        return '<div class="cine-col' + (k === 'day' ? ' is-day' : '') + '" data-k="' + k + '">' + head +
          '<div class="cine-ch el-d-' + s.el + '"><i class="cine-blot"></i><span>' + s.han + '</span></div>' +
          '<div class="cine-sub">' + esc(subOf(lang, 's', p.stem, s)) + '</div><div class="cine-gap"></div>' +
          '<div class="cine-ch b el-d-' + b.el + '"><i class="cine-blot"></i><span>' + b.han + '</span></div>' +
          '<div class="cine-sub b">' + esc(subOf(lang, 'b', p.branch, b)) + '</div></div>';
      }).join('');
      var dm = M.STEMS[P.day.stem];
      var dots = '';
      for (var i = 0; i < 9; i++) { var a = (i / 9) * Math.PI * 2 + 0.3; dots += '<i class="cine-dot" style="--dx:' + Math.round(Math.cos(a) * (46 + (i % 3) * 14)) + 'px;--dy:' + Math.round(Math.sin(a) * (46 + (i % 3) * 14)) + 'px;--s:' + (3 + (i % 3) * 2) + 'px"></i>'; }
      var ov = doc.createElement('div');
      ov.className = 'cine';
      ov.setAttribute('role', 'dialog');
      ov.setAttribute('aria-modal', 'true');
      ov.setAttribute('aria-label', t.title);
      ov.setAttribute('lang', lang);
      var tap = lastTap && Date.now() - lastTap.t < 4000 ? lastTap : { x: window.innerWidth / 2, y: window.innerHeight * 0.7 };
      ov.style.setProperty('--cx', Math.round(tap.x) + 'px');
      ov.style.setProperty('--cy', Math.round(tap.y) + 'px');
      ov.innerHTML = '<i class="cine-cloud c1"></i><i class="cine-cloud c2"></i><i class="cine-grain"></i>' +
        '<i class="cine-bar top"></i><i class="cine-bar bottom"></i>' +
        '<div class="cine-stage"><div class="cine-cap"><span>' + esc(t.building) + '</span></div>' +
        '<div class="cine-grid-wrap"><div class="cine-grid">' + cols + '</div><div class="cine-seal">' + SEAL + dots + '</div></div>' +
        '<div class="cine-me"><b class="el-d-' + dm.el + '">' + dm.han + '</b><span>' + esc(t.me(o.name)) + '</span><small>' + esc(subOf(lang, 's', P.day.stem, dm)) + ' · ' + esc(t.meSub) + '</small></div></div>' +
        '<div class="cine-ui"><button type="button" class="cine-sound" aria-pressed="' + soundOn() + '">' + (soundOn() ? '🔊 ' + t.soundOff : '🔈 ' + t.soundOn) + '</button>' +
        '<button type="button" class="cine-skip">' + esc(t.skip) + ' ›</button></div><div class="cine-tap">' + esc(t.tap) + '</div>';
      doc.body.appendChild(ov);
      busy = true;
      if (soundOn()) audio();   /* 버튼을 누른 그 순간(사용자 동작)에 소리 장치를 깨워 둔다 */

      var timers = [], covered = false, ended = false, skipped = false, cap = ov.querySelector('.cine-cap span');
      var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
      var cover = function () { if (covered) return; covered = true; try { if (o.onCovered) o.onCovered(); } catch (e) { if (window.console) console.error(e); } };
      var setCap = function (txt) { cap.classList.add('swap'); setTimeout(function () { cap.textContent = txt; cap.classList.remove('swap'); }, 170); };
      var show = function (k) {
        var c = ov.querySelector('.cine-col[data-k="' + k + '"]'); if (!c) return;
        c.classList.add('show'); sfx('brush');
        setCap(t.steps[k] + (c.classList.contains('empty') ? ' · ' + t.unknown : ''));
      };
      var finish = function () {
        if (ended) return; ended = true;
        timers.forEach(clearTimeout);
        cover();
        if (ov.parentNode) ov.parentNode.removeChild(ov);
        busy = false;
        track('cine_reveal', { skipped: skipped ? 1 : 0, lang: lang });
        afterReveal();
        try { if (o.onDone) o.onDone(); } catch (e) { /* 무시 */ }
      };
      var out = function (fast) {
        cover();
        ov.classList.add('out');
        timers.push(setTimeout(finish, fast ? 420 : 760));
      };
      var skip = function () {
        if (ended || ov.classList.contains('out')) return;
        skipped = true;
        timers.forEach(clearTimeout); timers = [];
        ov.classList.add('fast', 'on', 'cap', 'lit', 'stamp');
        Array.prototype.forEach.call(ov.querySelectorAll('.cine-col'), function (c) { c.classList.add('show'); });
        cover();
        timers.push(setTimeout(function () { out(true); }, 260));
      };
      ov.addEventListener('click', function (e) {
        var snd = e.target.closest && e.target.closest('.cine-sound');
        if (snd) {
          e.stopPropagation();
          var on = !soundOn(); set(SOUND, on ? '1' : '0');
          snd.setAttribute('aria-pressed', String(on));
          snd.textContent = on ? '🔊 ' + t.soundOff : '🔈 ' + t.soundOn;
          if (on) { audio(); sfx('brush'); }
          track('cine_sound', { on: on ? 1 : 0 });
          return;
        }
        skip();
      });
      ov.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); skip(); } });
      ov.addEventListener('wheel', function (e) { e.preventDefault(); }, { passive: false });
      ov.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });

      requestAnimationFrame(function () { requestAnimationFrame(function () { ov.classList.add('on'); }); });
      try { ov.querySelector('.cine-skip').focus({ preventScroll: true }); } catch (e) { /* 무시 */ }
      at(520, cover);
      at(620, function () { ov.classList.add('cap'); });
      ['year', 'month', 'day', 'hour'].forEach(function (k, i) { at(1000 + i * 540, function () { show(k); }); });
      at(3250, function () { ov.classList.add('lit'); setCap(''); });
      at(3900, function () { ov.classList.add('stamp'); sfx('stamp'); buzz(18); });
      at(4700, function () { out(false); });
      at(9000, finish);   /* 무슨 일이 있어도 닫힌다 */
      return true;
    } catch (e) {
      busy = false;
      var stale = doc.querySelector('.cine'); if (stale && stale.parentNode) stale.parentNode.removeChild(stale);
      if (window.console) console.error(e);
      return false;
    }
  }

  function afterReveal() {
    var v = doc.querySelector('.view.active');
    if (v) replay(v);
    var list = pending; pending = [];
    list.forEach(function (fn) { try { fn(); } catch (e) { /* 무시 */ } });
  }
  function replay(v) {
    v.classList.remove('animate-in'); void v.offsetWidth; v.classList.add('animate-in');
    clearTimeout(v._animT); v._animT = setTimeout(function () { v.classList.remove('animate-in'); }, 1400);
  }
  function later(fn) { if (busy) pending.push(fn); else fn(); }

  /* ---------- 스크롤 등장 · 오행 막대 ---------- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      var fn = en.target._cine; en.target._cine = null;
      if (fn) later(fn);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 }) : null;

  function rise1(c, delay) {
    c.classList.remove('cine-wait');
    if (delay) c.style.animationDelay = delay + 's';
    c.classList.add('cine-in');
    setTimeout(function () { c.classList.remove('cine-in'); c.style.animationDelay = ''; }, 1100 + (delay || 0) * 1000);
  }
  function prepWait(view) {
    if (!io) return;
    var vh = window.innerHeight || 700;
    Array.prototype.forEach.call(view.children, function (c) {
      if (!c.classList.contains('rise')) return;
      io.unobserve(c); c._cine = null; c.classList.remove('cine-in');
      if (c.offsetParent !== null && c.getBoundingClientRect().top > vh * 0.92) {
        c.classList.add('cine-wait');
        c._cine = function () { rise1(c, 0); };
        io.observe(c);
      } else c.classList.remove('cine-wait');
    });
  }
  function prepBars(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll('.el-bars'), function (box) {
      var fills = box.querySelectorAll('.fill:not([data-cw])');
      if (!fills.length) return;
      Array.prototype.forEach.call(fills, function (f) { f.setAttribute('data-cw', f.style.width || '0'); f.style.width = '0px'; });
      var play = function () {
        Array.prototype.forEach.call(box.querySelectorAll('.fill[data-cw]'), function (f, i) {
          setTimeout(function () { f.style.width = f.getAttribute('data-cw'); }, 260 + i * 110);
        });
      };
      if (io) { box._cine = play; io.observe(box); } else play();
    });
  }
  function countUp(node, to, ms, done) {
    if (!node || !(to >= 0)) { if (done) done(); return; }
    var t0 = 0;
    var step = function (now) {
      if (!t0) t0 = now;
      var k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      node.textContent = String(Math.round(to * e));
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    };
    node.textContent = '0';
    requestAnimationFrame(step);
  }

  /* ---------- 매화 꽃잎 ---------- */
  function petals(n) {
    var layer = doc.createElement('div'); layer.className = 'cine-petals'; layer.setAttribute('aria-hidden', 'true');
    var html = '';
    for (var i = 0; i < n; i++) {
      var size = 11 + Math.random() * 10;
      html += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;animation-delay:' + (Math.random() * 1.4).toFixed(2) + 's;animation-duration:' + (3.4 + Math.random() * 2.2).toFixed(2) + 's;--dx:' + Math.round((Math.random() - 0.5) * 160) + 'px;--rot:' + Math.round(240 + Math.random() * 520) + 'deg"></i>';
    }
    layer.innerHTML = html;
    doc.body.appendChild(layer);
    setTimeout(function () { if (layer.parentNode) layer.parentNode.removeChild(layer); }, 7200);
  }
  function burst(host) {
    var b = doc.createElement('span'); b.className = 'cine-burst'; b.setAttribute('aria-hidden', 'true');
    var html = '';
    for (var i = 0; i < 14; i++) { var a = (i / 14) * Math.PI * 2, d = 70 + (i % 4) * 16; html += '<i style="--dx:' + Math.round(Math.cos(a) * d) + 'px;--dy:' + Math.round(Math.sin(a) * d) + 'px;--s:' + (3 + (i % 3)) + 'px"></i>'; }
    b.innerHTML = html;
    host.appendChild(b);
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 1200);
  }

  /* ---------- 오늘의 운세: 날씨 그림 · 긁기 · 점수 ---------- */
  var WX = { '쾌청': 'sun', '맑음': 'sun', '구름 조금': 'part', '흐림': 'cloud', '소나기 뒤 갬': 'rain' };
  function wxSvg(k) {
    var sun = '<g class="wx-sun"><circle cx="24" cy="24" r="8" fill="#E0B04A"></circle><g class="wx-rays" stroke="#E0B04A" stroke-width="2.4" stroke-linecap="round"><path d="M24 7v5M24 36v5M7 24h5M36 24h5M12 12l3.5 3.5M32.5 32.5L36 36M12 36l3.5-3.5M32.5 15.5L36 12"></path></g></g>';
    var cloud = function (x, y, s, c) { return '<path class="wx-cloud" transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M10 30h24a8 8 0 0 0 0-16 11 11 0 0 0-21-2 8 8 0 0 0-3 18z" fill="' + c + '"></path>'; };
    var drops = '<g class="wx-drops" stroke="#74A3D6" stroke-width="2.2" stroke-linecap="round"><path d="M17 38l-2 5"></path><path d="M25 38l-2 5"></path><path d="M33 38l-2 5"></path></g>';
    var inner = k === 'sun' ? sun
      : k === 'part' ? '<g transform="translate(-6 -6) scale(.8)">' + sun + '</g>' + cloud(6, 10, 0.95, '#CFC4B0')
      : k === 'cloud' ? cloud(-2, 2, 0.8, '#8F8574') + cloud(8, 10, 0.95, '#CFC4B0')
      : '<g transform="translate(12 -8) scale(.6)">' + sun + '</g>' + cloud(2, 4, 0.95, '#CFC4B0') + drops;
    return '<svg viewBox="0 0 48 48" aria-hidden="true">' + inner + '</svg>';
  }
  function scratch(hero, done) {
    var w = hero.clientWidth, h = hero.clientHeight;
    if (!w || !h) { done(); return; }
    var t = T.ko, scoreEl = hero.querySelector('.t-score'), real = scoreEl ? scoreEl.textContent : '';
    if (scoreEl) scoreEl.textContent = '??';
    hero.classList.add('cine-scratching');
    var wrap = doc.createElement('div'); wrap.className = 'cine-scratch';
    wrap.innerHTML = '<canvas aria-hidden="true"></canvas><div class="cs-label"><b>' + t.scratch + '</b><span>' + t.scratchHint + '</span></div><button type="button" class="cs-now">' + t.now + '</button>';
    hero.appendChild(wrap);
    var cv = wrap.querySelector('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    var g = cv.getContext('2d'); g.scale(dpr, dpr);
    var grd = g.createLinearGradient(0, 0, w, h); grd.addColorStop(0, '#ECE3CF'); grd.addColorStop(1, '#D9CBAE');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 170; i++) {   /* 한지 섬유 */
      var x = Math.random() * w, y = Math.random() * h, len = 6 + Math.random() * 26, ang = Math.random() * Math.PI;
      g.strokeStyle = 'rgba(120,96,62,' + (0.05 + Math.random() * 0.13).toFixed(2) + ')'; g.lineWidth = 0.5 + Math.random() * 0.7;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(ang) * len * 0.5 + 3, y + Math.sin(ang) * len * 0.5 - 2, x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.stroke();
    }
    g.fillStyle = 'rgba(184,56,45,0.85)'; g.fillRect(w - 34, 10, 22, 22);   /* 귀퉁이 인주 */
    g.fillStyle = '#F6E9DC'; g.font = '600 13px "Noto Serif KR", serif'; g.textAlign = 'center'; g.fillText('今', w - 23, 26);
    g.globalCompositeOperation = 'destination-out'; g.strokeStyle = '#000'; g.fillStyle = '#000'; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 38;   /* 지우개는 불투명해야 한 번에 지워진다 */
    var last = null, moves = 0, finished = false, label = wrap.querySelector('.cs-label');
    var finish = function (how) {
      if (finished) return; finished = true;
      wrap.classList.add('gone');
      if (scoreEl) scoreEl.textContent = real;
      track('today_scratch', { how: how });
      setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); hero.classList.remove('cine-scratching'); }, 560);
      done();
    };
    var cleared = function () {
      var data = g.getImageData(0, 0, cv.width, cv.height).data, clear = 0, total = 0;
      for (var j = 3; j < data.length; j += 4 * 24) { total++; if (data[j] < 40) clear++; }
      return total ? clear / total : 1;
    };
    var pos = function (e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    var draw = function (p) {
      g.beginPath();
      if (last) { g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke(); }
      g.beginPath(); g.arc(p.x, p.y, 19, 0, Math.PI * 2); g.fill();
      last = p;
      if (++moves % 7 === 0 && cleared() > 0.42) finish('scratch');
    };
    cv.addEventListener('pointerdown', function (e) { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* 무시 */ } last = null; label.classList.add('hide'); draw(pos(e)); });
    cv.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'touch' || e.pressure > 0) draw(pos(e)); });
    cv.addEventListener('pointerup', function () { last = null; if (!finished && cleared() > 0.42) finish('scratch'); });
    wrap.querySelector('.cs-now').addEventListener('click', function () { finish('button'); });
  }
  function celebrate(hero, score) {
    var s = hero.querySelector('.t-score');
    countUp(s, score, 1150, function () {
      if (score >= 80) { s.classList.add('cine-glow'); petals(28); sfx('chime'); buzz([12, 60, 12]); }
      else if (score >= 65) s.classList.add('cine-sheen');
    });
    var wx = hero.querySelector('.cine-wx'); if (wx) wx.classList.add('play');
  }
  function today(view) {
    var hero = view.querySelector('#t-hero');
    if (!hero || !hero.getAttribute('data-score') || hero.getAttribute('data-cdone')) return;
    hero.setAttribute('data-cdone', '1');
    var score = +hero.getAttribute('data-score'), wk = WX[hero.getAttribute('data-weather')] || 'part';
    if (!hero.querySelector('.cine-wx')) hero.insertAdjacentHTML('beforeend', '<span class="cine-wx wx-' + wk + '">' + wxSvg(wk) + '</span>');
    var SK = 'sajucheop.scratch.v1', stamp = dayStr() + '|' + (hero.getAttribute('data-key') || '');
    if (location.hash !== '#today' && get(SK) !== stamp) scratch(hero, function () { set(SK, stamp); celebrate(hero, score); });
    else celebrate(hero, score);
  }

  /* ---------- 캐릭터 카드 ---------- */
  var FLIP = 'sajucheop.flip.v1';
  function flipped() { try { return JSON.parse(get(FLIP) || '[]'); } catch (e) { return []; } }
  function isSealed(k) { return motionOK() && !!k && flipped().indexOf(k) < 0; }
  function markFlipped(k) { var a = flipped().filter(function (x) { return x !== k; }); a.unshift(k); set(FLIP, JSON.stringify(a.slice(0, 40))); }
  function cardBack(cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 120 160" aria-hidden="true"><rect x="0.5" y="0.5" width="119" height="159" rx="11" fill="#92291F"></rect>' +
      '<rect x="7" y="7" width="106" height="146" rx="7" fill="none" stroke="#F6E9DC" stroke-opacity=".55"></rect>' +
      '<g stroke="#F6E9DC" stroke-opacity=".22" fill="none"><path d="M60 20l40 60-40 60-40-60z"></path><path d="M60 34l30 46-30 46-30-46z"></path></g>' +
      '<g fill="#F6E9DC" fill-opacity=".55"><path d="M14 14h9v1.6h-7.4V23H14z"></path><path d="M106 14h-9v1.6h7.4V23H106z"></path><path d="M14 146h9v-1.6h-7.4V137H14z"></path><path d="M106 146h-9v-1.6h7.4V137H106z"></path></g>' +
      '<circle cx="60" cy="80" r="23" fill="#92291F" stroke="#F6E9DC" stroke-opacity=".75" stroke-width="1.2"></circle>' +
      '<text x="60" y="89.5" text-anchor="middle" font-family="\'Noto Serif KR\',serif" font-size="25" font-weight="600" fill="#F6E9DC">命</text></svg>';
  }
  function drawEmblem(svg) {
    if (!svg || !motionOK()) return;
    Array.prototype.forEach.call(svg.querySelectorAll('path'), function (p, i) {
      if (!p.animate) return;
      if (p.getAttribute('fill') && p.getAttribute('fill') !== 'none') {
        p.style.transformBox = 'fill-box'; p.style.transformOrigin = 'center';
        p.animate([{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 520, delay: 240 + i * 150, easing: 'cubic-bezier(.2,.8,.25,1.25)', fill: 'both' });
        return;
      }
      var len = p.getTotalLength ? p.getTotalLength() : 0; if (!len) return;
      p.style.strokeDasharray = len + ' ' + len;
      p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 560, delay: i * 150, easing: 'cubic-bezier(.65,.05,.35,1)', fill: 'both' });
    });
  }
  function character(view) {
    var hero = view.querySelector('.char-hero'), em = view.querySelector('#ch-emblem');
    if (!hero || !em) return;
    var k = hero.getAttribute('data-key') || '', han = hero.getAttribute('data-han') || '';
    var fresh = em.querySelector(':scope > svg');
    if (fresh) {
      em.innerHTML = '<button type="button" class="cine-flip" aria-label="' + T.ko.flip + '"><span class="cf-in">' +
        '<span class="cf-face cf-back">' + cardBack() + '</span>' +
        '<span class="cf-face cf-front"><i class="cf-idx">' + esc(han) + '</i>' + fresh.outerHTML + '<i class="cf-idx b">' + esc(han) + '</i></span></span></button>' +
        '<div class="cf-hint">' + T.ko.flip + '<small>' + T.ko.flipHint + '</small></div>';
    }
    var flip = em.querySelector('.cine-flip'); if (!flip) return;
    var front = flip.querySelector('.cf-front svg');
    if (!isSealed(k)) {
      flip.classList.add('flipped', 'instant'); flip.setAttribute('tabindex', '-1');
      hero.classList.remove('sealed'); view.classList.remove('ch-locked');
      if (fresh) drawEmblem(front);
      return;
    }
    hero.classList.add('sealed'); view.classList.add('ch-locked');
    flip.classList.remove('flipped', 'instant');
    flip.onclick = function () {
      if (flip.classList.contains('flipped')) return;
      flip.classList.add('flipped'); flip.setAttribute('tabindex', '-1');
      sfx('flip'); buzz(10);
      markFlipped(k);
      track('char_flip', { han: han });
      setTimeout(function () { burst(em); drawEmblem(front); }, 420);
      setTimeout(function () {
        hero.classList.remove('sealed'); hero.classList.add('unveil');
        Array.prototype.forEach.call(hero.querySelectorAll('.ch-keywords span'), function (s, i) { s.style.animationDelay = (0.35 + i * 0.09) + 's'; });
        setTimeout(function () { hero.classList.remove('unveil'); }, 2200);
      }, 760);
      setTimeout(function () {
        view.classList.remove('ch-locked');
        var n = 0;
        Array.prototype.forEach.call(view.children, function (c) {
          if (!c.classList.contains('rise') || c === hero || c.classList.contains('sub-header')) return;
          if (io) { io.unobserve(c); c._cine = null; }
          rise1(c, 0.12 * n++);
        });
        try { doc.dispatchEvent(new CustomEvent('cine:flip', { detail: { key: k } })); } catch (e) { /* 무시 */ }
      }, 1250);
    };
  }

  /* ---------- 대운 그래프 · 궁합 점수 ---------- */
  function daeun(view) {
    var g = view.querySelector('#d-graph svg'); if (!g || g.getAttribute('data-cdone')) return;
    g.setAttribute('data-cdone', '1');
    var line = g.querySelector('path[stroke]'), area = g.querySelector('path[fill-opacity]');
    if (line && line.animate && line.getTotalLength) {
      var len = line.getTotalLength(); line.style.strokeDasharray = len + ' ' + len;
      line.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1500, delay: 200, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'both' });
    }
    if (area && area.animate) area.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 900, fill: 'both' });
    Array.prototype.forEach.call(g.querySelectorAll('circle'), function (c, i) {
      if (c.animate) c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 300 + i * 110, fill: 'both' });
    });
  }
  function gunghap(view) {
    var s = view.querySelector('#gh-score'); if (!s) return;
    var to = parseInt(s.textContent, 10);
    if (!(to >= 0) || s.getAttribute('data-cv') === String(to)) return;
    s.setAttribute('data-cv', String(to));
    countUp(s, to, 1300, function () { if (to >= 80) { petals(24); sfx('chime'); } });
  }

  /* ---------- 화면 ---------- */
  var WAIT = { result: 1, character: 1, today: 1, daeun: 1, gunghap: 1, report: 1, weekly: 1, calendar: 1 };
  var first = true, prev = null;
  function onView(name, view) {
    if (!view) return;
    var was = prev; prev = name;
    if (!motionOK()) { first = false; return; }
    if (!first && was !== name && !busy) {
      view.classList.remove('cine-turn'); void view.offsetWidth; view.classList.add('cine-turn');
      clearTimeout(view._turnT); view._turnT = setTimeout(function () { view.classList.remove('cine-turn'); }, 700);
    }
    first = false;
    if (WAIT[name]) prepWait(view);
    prepBars(view);
    if (name === 'character') character(view);
    later(function () {
      if (name === 'today') today(view);
      else if (name === 'character') { /* 카드는 위에서 */ }
      else if (name === 'daeun') daeun(view);
      else if (name === 'gunghap') gunghap(view);
    });
  }
  function enhance(scope) { if (scope && motionOK()) prepBars(scope); }

  /* 결과 화면 '캐릭터' 줄에 쓰는 작은 카드 뒷면 */
  function cardBackMini(size) { return '<span class="cine-mini-back" style="width:' + Math.round(size * 0.75) + 'px;height:' + size + 'px">' + cardBack() + '</span>'; }

  window.Cinema = { enabled: motionOK, revealChart: revealChart, onView: onView, enhance: enhance, key: key, isSealed: isSealed, cardBackMini: cardBackMini, petals: petals, sfx: sfx };
})();
