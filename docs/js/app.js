/* ============================================================
 * 사주첩 — UI 컨트롤러
 * ============================================================ */
(function () {
  'use strict';

  var M = window.Manseryeok;
  var I = window.Interpret;
  var G = window.Gunghap;

  var $ = function (sel) { return document.querySelector(sel); };
  var state = { result: null, name: '' };
  var refreshDateInputs; // initForm에서 할당

  /* ---------- 음력 변환 (korean-lunar-calendar · 한국천문연구원 기준) ---------- */

  var lunarCal = window.KoreanLunarCalendar ? new window.KoreanLunarCalendar() : null;

  function calMode() {
    var el = document.querySelector('input[name="calendar"]:checked');
    return el ? el.value : 'solar';
  }
  function lunarValid(y, m, d, leap) {
    return !!(lunarCal && lunarCal.setLunarDate(y, m, d, !!leap));
  }
  function lunarLeapExists(y, m) { return lunarValid(y, m, 1, true); }
  function lunarMonthLen(y, m, leap) { return lunarValid(y, m, 30, leap) ? 30 : 29; }
  function lunarToSolar(y, m, d, leap) {
    if (!lunarValid(y, m, d, leap)) return null;
    var s = lunarCal.getSolarCalendar();
    return { y: s.year, m: s.month, d: s.day };
  }

  function birthDateText(inp) {
    if (state.calInfo) {
      var ci = state.calInfo;
      return '음력 ' + ci.ly + '년 ' + (ci.leap ? '윤' : '') + ci.lm + '월 ' + ci.ld + '일 (양력 ' +
        ci.sy + '.' + ci.sm + '.' + ci.sd + ')';
    }
    return inp.year + '년 ' + inp.month + '월 ' + inp.day + '일';
  }

  var EL_ORDER = ['목', '화', '토', '금', '수'];
  var EL_HAN = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };
  var EL_VAR = { '목': '--el-mok', '화': '--el-hwa', '토': '--el-to', '금': '--el-geum', '수': '--el-su' };

  /* ---------- 유틸 ---------- */

  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }

  /* GA4 이벤트 (미탑재 환경에선 조용히 무시) */
  function track(name, params) {
    if (window.gtag) {
      try { window.gtag('event', name, params || {}); } catch (e) { /* 무시 */ }
    }
  }

  function showView(name) {
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.remove('active', 'animate-in');
    });
    var el = $('#view-' + name);
    el.classList.add('active');
    track('page_view', { page_path: '/#' + name, page_title: '사주첩 — ' + name });
    /* 오늘의 운세를 열면 그날 도장 */
    if (name === 'today') { renderStampCard(); earnStamp(); }
    // 화면이 실제로 보일 때만 등장 애니메이션 — 숨겨진 상태에서 멈춰
    // 콘텐츠가 투명하게 고정되는 일을 막는다. 안전 타임아웃으로 항상 해제.
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.visibilityState === 'visible' && !reduced) {
      void el.offsetWidth;
      el.classList.add('animate-in');
      clearTimeout(el._animT);
      el._animT = setTimeout(function () { el.classList.remove('animate-in'); }, 1400);
    }
    window.scrollTo(0, 0);
  }

  function fmtTime(minOfDay) {
    var h = Math.floor(minOfDay / 60), mi = minOfDay % 60;
    var ampm = h < 12 ? '오전' : '오후';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return ampm + ' ' + h12 + ':' + String(mi).padStart(2, '0');
  }

  /* 받침 유무에 따른 조사 선택 */
  function josa(word, withBatchim, without) {
    var code = word.charCodeAt(word.length - 1);
    if (code < 0xAC00 || code > 0xD7A3) return withBatchim;
    return ((code - 0xAC00) % 28 > 0) ? withBatchim : without;
  }

  function stemLabel(idx) { var s = M.STEMS[idx]; return { han: s.han, kor: s.kor + s.el, el: s.el }; }
  function branchLabel(idx) { var b = M.BRANCHES[idx]; return { han: b.han, kor: b.kor + b.el, el: b.el }; }

  /* ---------- 폼 초기화 ---------- */

  function initForm() {
    var yearSel = $('#in-year'), monthSel = $('#in-month'), daySel = $('#in-day');
    var thisYear = new Date().getFullYear();
    for (var y = thisYear; y >= 1930; y--) {
      var o = document.createElement('option');
      o.value = y; o.textContent = y + '년';
      yearSel.appendChild(o);
    }
    for (var m = 1; m <= 12; m++) {
      var om = document.createElement('option');
      om.value = m; om.textContent = m + '월';
      monthSel.appendChild(om);
    }
    yearSel.value = 1995; monthSel.value = 1;

    refreshDateInputs = function () {
      var y = +yearSel.value, mo = +monthSel.value;
      var lunar = calMode() === 'lunar';
      var leapBtn = $('#btn-leap');
      var leapAvailable = lunar && lunarLeapExists(y, mo);
      leapBtn.hidden = !leapAvailable;
      if (!leapAvailable) leapBtn.setAttribute('aria-pressed', 'false');
      var leapOn = leapBtn.getAttribute('aria-pressed') === 'true';
      $('#cal-mode-label').textContent = lunar ? '(음력)' : '';
      var max = lunar ? lunarMonthLen(y, mo, leapOn) : M._internals.daysInMonth(y, mo);
      var keep = Math.min(+daySel.value || 1, max);
      daySel.innerHTML = '';
      for (var d = 1; d <= max; d++) {
        var od = document.createElement('option');
        od.value = d; od.textContent = d + '일';
        daySel.appendChild(od);
      }
      daySel.value = keep;
    };
    refreshDateInputs();
    yearSel.addEventListener('change', refreshDateInputs);
    monthSel.addEventListener('change', refreshDateInputs);
    document.querySelectorAll('input[name="calendar"]').forEach(function (rd) {
      rd.addEventListener('change', refreshDateInputs);
    });
    $('#btn-leap').addEventListener('click', function () {
      var on = $('#btn-leap').getAttribute('aria-pressed') === 'true';
      $('#btn-leap').setAttribute('aria-pressed', String(!on));
      refreshDateInputs();
    });

    // 시간 모름 토글
    $('#btn-unknown-time').addEventListener('click', function () {
      setUnknownTime(!isUnknownTime());
    });

    $('#saju-form').addEventListener('submit', function (e) {
      e.preventDefault();
      runCompute();
    });
  }

  /* ---------- 계산 실행 ---------- */

  function isUnknownTime() {
    return $('#btn-unknown-time').getAttribute('aria-pressed') === 'true';
  }

  function setUnknownTime(on) {
    var btn = $('#btn-unknown-time');
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = on ? '시간 입력하기' : '시간을 몰라요';
    $('#in-time').disabled = on;
    $('#time-wrap').style.opacity = on ? 0.4 : 1;
    $('#time-note').hidden = !on;
  }

  function runCompute() {
    var unknown = isUnknownTime();
    var timeVal = $('#in-time').value || '12:00';
    var parts = timeVal.split(':');
    try {
      var selY = +$('#in-year').value, selM = +$('#in-month').value, selD = +$('#in-day').value;
      var calInfo = null;
      if (calMode() === 'lunar') {
        var leapOn = $('#btn-leap').getAttribute('aria-pressed') === 'true';
        var conv = lunarToSolar(selY, selM, selD, leapOn);
        if (!conv) {
          toast('해당 음력 날짜가 존재하지 않아요. 날짜를 확인해 주세요.');
          return;
        }
        calInfo = { mode: 'lunar', ly: selY, lm: selM, ld: selD, leap: leapOn, sy: conv.y, sm: conv.m, sd: conv.d };
        selY = conv.y; selM = conv.m; selD = conv.d;
      }
      state.calInfo = calInfo;
      var input = {
        year: selY,
        month: selM,
        day: selD,
        hour: +parts[0],
        minute: +parts[1],
        unknownTime: unknown,
        gender: document.querySelector('input[name="gender"]:checked').value,
        applySolarTime: $('#in-solar').checked
      };
      var result = M.compute(input);
      state.result = result;
      state.name = $('#in-name').value.trim();
      state.lastInput = input;
      state.calCache = {};
      var t = todayDateParts();
      state.calendar = { y: t.y, m: t.m, selected: t.d, purpose: null };
      if (!state.quietCompute) saveProfile(input);
      renderResult(result);
      renderCharacter(result);
      renderDaeun(result);
      renderToday(result);
      renderCalendar();
      updateBookAddButton();
      track('saju_compute', { unknown_time: input.unknownTime ? 1 : 0, cal: calInfo ? 'lunar' : 'solar' });
      if (state.invite && !state.quietCompute) {
        var partnerResult = M.compute(state.invite);
        renderGunghap(partnerResult, result);
        state.gunghapUrl = location.origin + location.pathname + '#g=' +
          G.encodePair(state.invite, Object.assign({ name: state.name }, input));
        recordGunghap(state.invite);
        updateGunghapButtons('mine');
        showView('gunghap');
      } else {
        showView('result');
      }
    } catch (err) {
      toast('계산 중 문제가 생겼어요. 입력을 확인해 주세요.');
      if (window.console) console.error(err);
    }
  }

  /* ---------- 내 사주 기억 (이 기기에만 저장) ---------- */

  var PROFILE_KEY = 'sajucheop.profile.v1';

  function saveProfile(input) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify({
        name: $('#in-name').value.trim(),
        year: input.year, month: input.month, day: input.day,
        hour: input.hour, minute: input.minute,
        unknownTime: input.unknownTime,
        gender: input.gender,
        applySolarTime: input.applySolarTime,
        calMode: state.calInfo ? 'lunar' : 'solar',
        lunar: state.calInfo
          ? { y: state.calInfo.ly, m: state.calInfo.lm, d: state.calInfo.ld, leap: state.calInfo.leap }
          : null
      }));
    } catch (e) { /* 저장 불가 환경 — 무시 */ }
    renderResumeChip();
  }

  function loadProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function clearProfile() {
    try { localStorage.removeItem(PROFILE_KEY); } catch (e) { /* 무시 */ }
    renderResumeChip();
  }

  function fillFormFromProfile(p) {
    $('#in-name').value = p.name || '';
    var lunarProf = p.calMode === 'lunar' && p.lunar;
    var calRadio = document.querySelector('input[name="calendar"][value="' + (lunarProf ? 'lunar' : 'solar') + '"]');
    if (calRadio) calRadio.checked = true;
    var fy = lunarProf ? p.lunar.y : p.year;
    var fm = lunarProf ? p.lunar.m : p.month;
    var fd = lunarProf ? p.lunar.d : p.day;
    $('#in-year').value = fy;
    $('#in-year').dispatchEvent(new Event('change'));
    $('#in-month').value = fm;
    $('#in-month').dispatchEvent(new Event('change'));
    if (lunarProf && p.lunar.leap) {
      $('#btn-leap').setAttribute('aria-pressed', 'true');
      if (refreshDateInputs) refreshDateInputs();
    }
    $('#in-day').value = fd;
    if (!p.unknownTime && p.hour !== null && p.hour !== undefined) {
      $('#in-time').value = String(p.hour).padStart(2, '0') + ':' + String(p.minute).padStart(2, '0');
    }
    setUnknownTime(!!p.unknownTime);
    var g = document.querySelector('input[name="gender"][value="' + (p.gender || 'F') + '"]');
    if (g) g.checked = true;
    $('#in-solar').checked = p.applySolarTime !== false;
  }

  function renderResumeChip() {
    var chip = $('#resume-chip');
    var p = loadProfile();
    /* 명식첩이 있으면 첩이 이어보기 역할까지 대신함 */
    if (!p || loadBook().length) { chip.hidden = true; return; }
    $('#rc-name').textContent = p.name ? p.name + ' 님' : '저장된 사주';
    var dateStr = (p.calMode === 'lunar' && p.lunar)
      ? '음력 ' + p.lunar.y + '.' + (p.lunar.leap ? '윤' : '') + p.lunar.m + '.' + p.lunar.d
      : p.year + '.' + p.month + '.' + p.day;
    $('#rc-birth').textContent = dateStr +
      (p.unknownTime ? ' · 시간 모름' : ' · ' + fmtTime(p.hour * 60 + p.minute));
    chip.hidden = false;
  }

  /* ---------- 명식첩 (여러 명식 보관 · 이 기기에만) ---------- */

  var BOOK_KEY = 'sajucheop.book.v1';
  var BOOK_MAX = 10;

  function loadBook() {
    try {
      var raw = localStorage.getItem(BOOK_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function saveBookList(list) {
    try { localStorage.setItem(BOOK_KEY, JSON.stringify(list)); } catch (e) { /* 무시 */ }
  }

  function bookKeyOf(p) {
    return [p.year, p.month, p.day, p.unknownTime ? 'u' : p.hour + ':' + p.minute, p.gender].join('-');
  }

  /* 현재 계산된 사람을 저장용 형태로 */
  function currentProfileSnapshot() {
    var input = state.lastInput;
    if (!input) return null;
    return {
      id: 'b' + new Date().getTime(),
      name: state.name || '',
      year: input.year, month: input.month, day: input.day,
      hour: input.hour, minute: input.minute,
      unknownTime: input.unknownTime,
      gender: input.gender,
      applySolarTime: input.applySolarTime,
      calMode: state.calInfo ? 'lunar' : 'solar',
      lunar: state.calInfo
        ? { y: state.calInfo.ly, m: state.calInfo.lm, d: state.calInfo.ld, leap: state.calInfo.leap }
        : null
    };
  }

  function bookIndexOf(list, p) {
    var k = bookKeyOf(p);
    for (var i = 0; i < list.length; i++) if (bookKeyOf(list[i]) === k) return i;
    return -1;
  }

  /* 첩의 '나' 장 — 첫 저장 인물. 이후 폼으로 다른 사람을 계산해도 나의 기준점 유지 */
  function bookSelf() {
    return loadBook().filter(function (b) { return b.self; })[0] || null;
  }

  function addToBook() {
    var snap = currentProfileSnapshot();
    if (!snap) { toast('먼저 사주를 계산해 주세요.'); return; }
    var list = loadBook();
    var idx = bookIndexOf(list, snap);
    if (idx >= 0) {
      if (snap.name) { list[idx].name = snap.name; saveBookList(list); }
      toast('이미 첩에 있는 명식이에요.');
    } else {
      if (list.length >= BOOK_MAX) {
        toast('첩이 가득 찼어요 (최대 ' + BOOK_MAX + '명). 홈에서 하나 빼고 다시 끼워주세요.');
        return;
      }
      if (!list.length) snap.self = true;
      list.push(snap);
      saveBookList(list);
      track('book_add', { count: list.length });
      toast((snap.name ? snap.name + ' 님을' : '이 명식을') + ' 첩에 끼웠어요. 홈에서 오늘 흐름을 한눈에 봐요.');
    }
    renderBook();
    updateBookAddButton();
  }

  function removeFromBook(id) {
    saveBookList(loadBook().filter(function (b) { return b.id !== id; }));
    renderBook();
    updateBookAddButton();
    renderResumeChip();
    toast('첩에서 뺐어요.');
  }

  function updateBookAddButton() {
    var btn = $('#btn-book-add');
    if (!btn) return;
    var snap = currentProfileSnapshot();
    var inBook = snap && bookIndexOf(loadBook(), snap) >= 0;
    btn.textContent = inBook ? '명식첩에 있어요 ✓' : '이 명식, 첩에 끼워두기';
    btn.disabled = !!inBook;
  }

  function renderBook() {
    var sec = $('#book-section'), wrap = $('#book-cards');
    if (!sec || !wrap) return;
    var list = loadBook();
    if (!list.length) { sec.hidden = true; return; }
    var t = todayDateParts();
    wrap.innerHTML = list.map(function (b) {
      try {
        var res = M.compute(b);
        var info = M.todayInfo(res, t.y, t.m, t.d);
        var score = I.scoreDay(res, info);
        var st = M.STEMS[res.pillars.day.stem];
        var rel = info.relation === '충' ? ' · 충 조심'
          : (info.relation === '육합' || info.relation === '삼합' ? ' · 합이 드는 날' : '');
        var line = info.stemSipseong + josa(info.stemSipseong, '이', '가') + ' 드는 날' + rel;
        return '<div class="book-card" data-id="' + b.id + '" role="button" tabindex="0">' +
          '<span class="bc-emblem">' + C.emblemSvg(st.han, 30, 'light') + '</span>' +
          '<span class="bc-main"><b>' + G.escapeHtml(b.name || (b.year + '년생')) +
          (b.self ? '<i class="bc-me">나</i>' : '') + '</b>' +
          '<span class="bc-line">' + line + '</span></span>' +
          '<b class="bc-score">' + score + '</b>' +
          '<button type="button" class="bc-del" data-del="' + b.id + '" aria-label="첩에서 빼기">' +
          '<svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" stroke="#9A8F7E" stroke-width="1.5" stroke-linecap="round"></path></svg>' +
          '</button></div>';
      } catch (e) { return ''; }
    }).join('');
    sec.hidden = false;
    wrap.querySelectorAll('.book-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        var el = e.target;
        while (el && el !== card) {
          if (el.classList && el.classList.contains('bc-del')) return;
          el = el.parentNode;
        }
        var id = card.getAttribute('data-id');
        var b = loadBook().filter(function (x) { return x.id === id; })[0];
        if (b) openBookEntry(b);
      });
    });
    wrap.querySelectorAll('.bc-del').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        removeFromBook(btn.getAttribute('data-del'));
      });
    });
  }

  function openBookEntry(b) {
    track('book_open');
    var my = bookSelf() || loadProfile();
    fillFormFromProfile(b);
    state.quietCompute = true;
    runCompute();
    state.quietCompute = false;
    /* 입력 폼은 항상 내 정보로 되돌림 */
    if (my) fillFormFromProfile(my);
    if (state.result) showView('today');
  }

  /* ---------- 결과 렌더 ---------- */

  function renderResult(r) {
    var inp = r.input;
    $('#r-name').textContent = state.name ? state.name + ' 님의 사주' : '나의 사주';

    var birthBits = [
      birthDateText(inp) + (inp.unknownTime ? '' : ' ' + fmtTime(inp.hour * 60 + inp.minute)),
      state.calInfo ? null : '양력',
      inp.gender === 'F' ? '여성' : '남성'
    ].filter(Boolean);
    if (!inp.unknownTime && r.time.solarCorrectionMin !== 0) {
      birthBits.push('보정 ' + fmtTime(r.time.corrected.minOfDay));
    }
    $('#r-birth').textContent = birthBits.join(' · ');

    $('#r-method').textContent = (inp.applySolarTime ? '진태양시 · ' : '') + '절기력 · 야자시 기준';

    /* 알림 */
    var notices = [];
    if (r.jeolipWarning) {
      var w = r.jeolipWarning;
      var hrs = Math.max(1, Math.round(w.hours * 10) / 10);
      notices.push('절기 경계에 가까운 출생이에요. ' + w.term + ' ' +
        (w.side === 'before' ? '들기 약 ' + hrs + '시간 전' : '든 지 약 ' + hrs + '시간 뒤') +
        '이라, 출생 시각이 조금만 달라도 월주가 바뀔 수 있어요.');
    }
    if (r.time.dstEraWarning) {
      notices.push('출생 연도에 서머타임이 시행됐어요. 당시 시계가 1시간 빨랐다면 실제 출생 시각은 표기보다 1시간 이른 시각이에요.');
    }
    if (r.time.yajasi) {
      notices.push('23시 이후 출생이라 야자시 기준(시주는 다음 날 천간)으로 계산했어요.');
    }
    /* 시간을 모르는데 그날 월 경계 절기(節)가 드는 경우 — 시각에 따라 월주가 달라짐 */
    if (inp.unknownTime && !r.jeolipWarning) {
      try {
        var MI = M._internals;
        var jd0 = MI.daysFromCivil(inp.year, inp.month, inp.day) + MI.JDN_EPOCH - 0.5 - 9 / 24;
        var n360 = function (x) { return ((x % 360) + 360) % 360; };
        var mIdx0 = Math.floor(n360(MI.solarLongitude(jd0) - 315) / 30);
        var mIdx1 = Math.floor(n360(MI.solarLongitude(jd0 + 1) - 315) / 30);
        if (mIdx0 !== mIdx1) {
          notices.push('태어난 날은 절기가 바뀌는 날이에요. 출생 시각을 모르는 상태라, 실제 시각이 절기 전인지 후인지에 따라 월주가 달라질 수 있습니다.');
        }
      } catch (e) { /* 무시 */ }
    }
    $('#r-notices').innerHTML = notices.map(function (n) {
      return '<p class="notice">' + n + '</p>';
    }).join('');

    /* 명식 그리드 — 시·일·월·년 */
    var p = r.pillars;
    var cols = [
      { name: '시주', stem: p.hour && p.hour.stem, branch: p.hour && p.hour.branch,
        sipTop: r.sipseong.hourStem, sipBot: r.sipseong.hourBranch, isDay: false, empty: !p.hour },
      { name: '일주', stem: p.day.stem, branch: p.day.branch,
        sipTop: null, sipBot: M.branchSipseong(p.day.stem, p.day.branch), isDay: true },
      { name: '월주', stem: p.month.stem, branch: p.month.branch,
        sipTop: r.sipseong.monthStem, sipBot: r.sipseong.monthBranch, isDay: false },
      { name: '년주', stem: p.year.stem, branch: p.year.branch,
        sipTop: r.sipseong.yearStem, sipBot: r.sipseong.yearBranch, isDay: false }
    ];
    $('#r-pillars').innerHTML = cols.map(function (c) {
      if (c.empty) {
        return '<div class="pillar">' +
          '<div class="p-name">' + c.name + '</div>' +
          '<div class="p-sip">&nbsp;</div>' +
          '<div class="p-han" style="color: #8F8574;">─</div>' +
          '<div class="p-kor">시간</div>' +
          '<div class="p-gap"></div>' +
          '<div class="p-han" style="color: #8F8574;">─</div>' +
          '<div class="p-kor">모름</div>' +
          '<div class="p-sip" style="margin-top: 4px;">&nbsp;</div>' +
          '</div>';
      }
      var st = stemLabel(c.stem), br = branchLabel(c.branch);
      var topLabel = c.isDay
        ? '<div class="p-sip me">일간 · 나</div>'
        : '<div class="p-sip">' + (c.sipTop || '&nbsp;') + '</div>';
      return '<div class="pillar' + (c.isDay ? ' is-day' : '') + '">' +
        '<div class="p-name">' + c.name + '</div>' +
        topLabel +
        '<div class="p-han el-d-' + st.el + '">' + st.han + '</div>' +
        '<div class="p-kor">' + st.kor + '</div>' +
        '<div class="p-gap"></div>' +
        '<div class="p-han el-d-' + br.el + '">' + br.han + '</div>' +
        '<div class="p-kor">' + br.kor + '</div>' +
        '<div class="p-sip" style="margin-top: 4px;">' + (c.sipBot || '&nbsp;') + '</div>' +
        '</div>';
    }).join('');

    /* 명식 하단 요약 */
    var me = M.STEMS[p.day.stem];
    /* 60일주 사전 링크 — 일주 인덱스(0~59)로 slug 조회 */
    var iljuIdx = -1;
    for (var k = 0; k < 60; k++) if (k % 10 === p.day.stem && k % 12 === p.day.branch) { iljuIdx = k; break; }
    var iljuName = M.ganjiName(p.day.stem, p.day.branch);
    var iljuLink = (window.ILJU_SLUGS && iljuIdx >= 0)
      ? '<div>일주 <b><a href="ilju/' + window.ILJU_SLUGS[iljuIdx] + '/" style="color: var(--seal);">' + iljuName.kor + '일주 사전 →</a></b></div>'
      : '';
    $('#r-foot').innerHTML =
      '<div>일간 <b>' + me.kor + me.el + ' ' + me.han + EL_HAN[me.el] + '</b></div>' +
      '<div>강약 <b>' + r.strength.label + '</b></div>' +
      '<div>계절 <b>' + (r.season ? r.season.name + ' · ' + r.season.wang : '─') + '</b></div>' +
      iljuLink;

    /* 오행 바 */
    var counts = r.elements;
    var maxC = Math.max.apply(null, EL_ORDER.map(function (e) { return counts[e]; }).concat([1]));
    $('#r-el-headline').textContent = I.elementHeadline(r);
    $('#r-el-bars').innerHTML = EL_ORDER.map(function (el) {
      var c = counts[el];
      var pct = Math.round(c / maxC * 100);
      var zero = c === 0;
      return '<div class="el-bar-row">' +
        '<div class="el-name' + (zero ? ' zero' : '') + '">' + EL_HAN[el] + ' ' + el + '</div>' +
        '<div class="track">' +
        (zero ? '' : '<div class="fill" style="width: ' + pct + '%; background: var(' + EL_VAR[el] + ');"></div>') +
        '</div>' +
        '<div class="el-count' + (zero ? ' zero' : '') + '">' + c + '</div>' +
        '</div>';
    }).join('');
    $('#r-el-callout').textContent = I.elementComment(r);

    /* 아기 풀이 (만 5세 이하 자동) */
    var isBaby = inp.year >= todayDateParts().y - 5;
    if (isBaby) {
      var baby = I.babyReading(r);
      var ch = C.of(me.han);
      $('#r-baby').innerHTML =
        '<div class="card reading-card">' +
        '<div class="reading-overline">아기 풀이</div>' +
        '<h2 class="reading-title" style="font-size: 18px;">' + ch.name.replace('사람', '아이') + ' — ' + me.kor + me.el + ' 아기</h2>' +
        '<p class="reading-body">' + baby.temper + '</p>' +
        '<div class="rp-kv"><span class="kv-label accent">양육</span><div class="kv-text">' + baby.care + '</div></div>' +
        '<div class="rp-kv"><span class="kv-label">이름</span><div class="kv-text">' + baby.nameHint + '</div></div>' +
        '<p class="callout" style="margin-top: 14px;">아기의 건강과 발달에 관한 판단은 언제나 소아청소년과 의료진과 함께하세요. 이 풀이는 전통 명리 관점의 참고 정보입니다.</p>' +
        '</div>';
    } else {
      $('#r-baby').innerHTML = '';
    }

    /* 일간 풀이 */
    var ilgan = I.ilganText(me.han);
    $('#r-ilgan-title').textContent = ilgan.title;
    $('#r-ilgan-body').textContent = ilgan.body;
    $('#r-strength-body').textContent = I.strengthText(r.strength.label);

    /* 십성 구성 */
    var sip = I.sipseongSummary(r);
    $('#r-sip-title').textContent = sip.title;
    $('#r-sip-body').textContent = sip.body;
    $('#r-sip-pills').innerHTML = sip.pills
      .sort(function (a, b) { return b.count - a.count; })
      .map(function (pl) { return '<span class="pill">' + pl.name + ' ' + pl.count + '</span>'; })
      .join('');
  }

  /* ---------- 대운 렌더 ---------- */

  function renderDaeun(r) {
    var list = r.daeun.list;
    var who = state.name ? state.name + ' 님은' : '당신은';
    var currentIdx = -1;
    list.forEach(function (dw, i) { if (dw.current) currentIdx = i; });
    var cur = currentIdx >= 0 ? list[currentIdx] : list[0];
    var curGanji = M.ganjiName(cur.stem, cur.branch);

    var introTail;
    if (currentIdx >= 0) {
      introTail = '지금은 ' + r.daeun.koreanAge + '살(세는나이), ' +
        curGanji.kor + '(' + curGanji.han + ') 대운을 지나는 중입니다.';
    } else {
      introTail = '첫 대운 ' + curGanji.kor + '(' + curGanji.han + ')' +
        josa(curGanji.kor, '이', '가') + ' ' + cur.startAge + '살에 들어옵니다.';
    }
    $('#d-intro').textContent = who + ' ' + r.daeun.su + '살에 첫 대운이 들어와 10년마다 바뀝니다. ' + introTail;
    $('#d-range').textContent = list[0].startAge + '세 ~ ' + list[list.length - 1].endAge + '세';

    /* 그래프 */
    var scores = I.daeunScores(r);
    $('#d-graph').innerHTML = buildGraphSvg(r, scores, currentIdx);

    /* 세운 */
    renderSeun(r);

    /* 대운 상세 카드 (선택 가능) */
    state.daeunSel = currentIdx >= 0 ? currentIdx : 0;
    fillDaeunCard(r, state.daeunSel);

    /* 타임라인 — 행을 누르면 위 카드가 그 시기 풀이로 바뀐다 */
    $('#d-list').innerHTML = list.map(function (dw, i) {
      var s = stemLabel(dw.stem), b = branchLabel(dw.branch);
      var g = M.ganjiName(dw.stem, dw.branch);
      var sipPill = dw.current
        ? '<span class="d-sip">' + dw.sipseong + ' · 지금</span>'
        : '<span class="d-sip">' + dw.sipseong + '</span>';
      return '<button type="button" class="daeun-row' + (dw.current ? ' current' : '') +
        (i === state.daeunSel ? ' selected' : '') + '" data-di="' + i + '">' +
        '<div class="d-age">' + dw.startAge + '~' + dw.endAge + '세</div>' +
        '<div class="d-ganji">' +
        '<div class="d-han"><span class="el-' + s.el + '">' + s.han + '</span><span class="el-' + b.el + '">' + b.han + '</span></div>' +
        '<div class="d-kor">' + g.kor + '</div>' +
        '</div>' + sipPill + '</button>';
    }).join('');
    $('#d-list').querySelectorAll('.daeun-row').forEach(function (row) {
      row.addEventListener('click', function () {
        state.daeunSel = +row.getAttribute('data-di');
        fillDaeunCard(state.result, state.daeunSel);
        $('#d-list').querySelectorAll('.daeun-row').forEach(function (rw) {
          rw.classList.toggle('selected', +rw.getAttribute('data-di') === state.daeunSel);
        });
      });
    });
  }

  function fillDaeunCard(r, idx) {
    var dw = r.daeun.list[idx];
    var st = stemLabel(dw.stem), br = branchLabel(dw.branch);
    var dt = I.daeunText(dw.sipseong);
    var label = dw.current ? '지금의 대운'
      : (r.daeun.koreanAge < dw.startAge ? '다가올 대운' : '지나온 대운');
    $('#d-current').innerHTML =
      '<div class="ganji-col">' +
      '<span class="el-d-' + st.el + '">' + st.han + '</span>' +
      '<span class="el-d-' + br.el + '">' + br.han + '</span>' +
      '</div>' +
      '<div class="v-div"></div>' +
      '<div class="cd-info">' +
      '<div class="cd-range">' + label + ' · ' + dw.startAge + '~' + dw.endAge + '세 · ' + dw.sipseong + '</div>' +
      '<div class="cd-title">' + dt.title + '</div>' +
      '<div class="cd-body">' + dt.body + '</div>' +
      '</div>';
  }

  function buildGraphSvg(r, scores, currentIdx) {
    var n = scores.length;
    var x0 = 14, x1 = 306, baseY = 150;
    var step = (x1 - x0) / (n - 1);
    var pts = scores.map(function (s, i) { return { x: x0 + step * i, y: baseY - s }; });

    // 캣멀롬 → 베지어
    function pathFrom(points) {
      var d = 'M ' + points[0].x.toFixed(1) + ' ' + points[0].y.toFixed(1);
      for (var i = 0; i < points.length - 1; i++) {
        var p0 = points[Math.max(0, i - 1)], p1 = points[i],
            p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
        var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
        var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
        d += ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ', ' +
             c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ', ' +
             p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
      }
      return d;
    }

    var line = pathFrom(pts);
    var area = line + ' L ' + x1 + ' ' + baseY + ' L ' + x0 + ' ' + baseY + ' Z';

    var svg = '<svg viewBox="0 0 320 200" role="img" aria-label="대운 흐름 그래프" ' +
      'style="font-family: \'Noto Sans KR\', \'Apple SD Gothic Neo\', \'Malgun Gothic\', sans-serif;">' +
      '<path d="' + area + '" fill="#211C15" fill-opacity="0.05"></path>' +
      '<path d="' + line + '" fill="none" stroke="#211C15" stroke-width="2" stroke-linecap="round"></path>' +
      '<line x1="' + x0 + '" y1="' + baseY + '" x2="' + x1 + '" y2="' + baseY + '" stroke="#E1D6C2" stroke-width="1"></line>';

    // 눈금 (각 대운 시작 나이)
    r.daeun.list.forEach(function (dw, i) {
      var suffix = (i === 0 || i === n - 1) ? '세' : '';
      svg += '<text x="' + pts[i].x.toFixed(1) + '" y="168" text-anchor="middle" font-size="10" fill="#9A8F7E">' +
        dw.startAge + suffix + '</text>';
    });

    // 가장 높은 구간 라벨
    var peakIdx = scores.indexOf(Math.max.apply(null, scores));
    if (peakIdx !== currentIdx) {
      var px = Math.min(Math.max(pts[peakIdx].x, 52), 268);
      svg += '<text x="' + px.toFixed(1) + '" y="' + (pts[peakIdx].y - 12).toFixed(1) +
        '" text-anchor="middle" font-size="10" fill="#6E6455">가장 왕성한 구간</text>';
    }

    // 현재 위치 마커
    if (currentIdx >= 0) {
      var dw = r.daeun.list[currentIdx];
      var frac = Math.min(1, Math.max(0, (r.daeun.koreanAge - dw.startAge) / 10));
      var cx = pts[currentIdx].x + (currentIdx < n - 1 ? (pts[currentIdx + 1].x - pts[currentIdx].x) * frac : 0);
      var cy;
      if (currentIdx < n - 1) {
        cy = pts[currentIdx].y + (pts[currentIdx + 1].y - pts[currentIdx].y) * frac;
      } else {
        cy = pts[currentIdx].y;
      }
      var pillX = Math.min(Math.max(cx, 34), 286);
      svg += '<line x1="' + cx.toFixed(1) + '" y1="46" x2="' + cx.toFixed(1) + '" y2="' + baseY + '" stroke="#B8382D" stroke-width="1" stroke-dasharray="3 3"></line>' +
        '<rect x="' + (pillX - 20).toFixed(1) + '" y="22" width="40" height="20" rx="10" fill="#B8382D"></rect>' +
        '<text x="' + pillX.toFixed(1) + '" y="36" text-anchor="middle" font-size="11" font-weight="700" fill="#FFFDF8">지금</text>' +
        '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="5" fill="#B8382D" stroke="#FFFDF8" stroke-width="2"></circle>';
    }

    svg += '</svg>';
    return svg;
  }

  /* ---------- 링크 궁합 ---------- */

  function parseInviteFromHash() {
    var m = location.hash.match(/^#p=([A-Za-z0-9_-]+)$/);
    if (!m) return null;
    return G.decodeProfile(m[1]);
  }

  function showInviteBanner() {
    var inv = state.invite;
    if (!inv) return;
    $('#ib-title').textContent = (inv.name ? inv.name + ' 님이' : '친구가') + ' 궁합을 청했어요';
    $('#invite-banner').hidden = false;
    $('#btn-submit-label').textContent = '궁합 열어보기';
    /* 초대 집중 모드 — 홈의 다른 카드를 걷어내고 입력에 집중 */
    document.body.classList.add('invite-mode');
    setTimeout(function () {
      var banner = $('#invite-banner');
      if (banner && !banner.hidden) banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  }

  function dismissInvite() {
    state.invite = null;
    $('#invite-banner').hidden = true;
    $('#btn-submit-label').textContent = '내 사주 풀어보기';
    document.body.classList.remove('invite-mode');
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* 무시 */ }
  }

  function renderGunghap(partnerResult, myResult, partnerName, myName) {
    partnerName = partnerName || (state.invite && state.invite.name) || '상대';
    myName = myName || state.name || '나';
    var gh = G.compute(partnerResult, myResult, partnerName, myName);
    state.gunghap = { score: gh.score, tier: gh.tier, partnerName: partnerName, myName: myName };

    var pa = partnerResult.pillars.day.stem, pb = myResult.pillars.day.stem;
    var stA = M.STEMS[pa], stB = M.STEMS[pb];
    $('#gh-emblem-b').innerHTML = C.emblemSvg(stB.han, 56, 'dark');
    $('#gh-emblem-a').innerHTML = C.emblemSvg(stA.han, 56, 'dark');
    $('#gh-name-b').textContent = myName;
    $('#gh-name-a').textContent = partnerName;
    $('#gh-ilgan-b').textContent = stB.kor + stB.el + ' · ' + C.of(stB.han).name;
    $('#gh-ilgan-a').textContent = stA.kor + stA.el + ' · ' + C.of(stA.han).name;
    $('#gh-score').textContent = gh.score;
    $('#gh-tier').textContent = gh.tier;

    $('#gh-stem-title').textContent = gh.stemRel.title;
    $('#gh-stem-body').innerHTML = gh.stemRel.body;
    $('#gh-sip').innerHTML =
      '<div class="fortune-row" style="padding: 12px 0 6px;"><span class="f-label" style="width: 52px;">상대는</span>' +
      '<span class="f-text">나에게 <b>' + gh.sipseong.aboutA.name + '</b> — ' + gh.sipseong.aboutA.line + '</span></div>' +
      '<div class="fortune-row" style="padding: 6px 0 0; border-top: 1px solid var(--line-soft);"><span class="f-label" style="width: 52px;">나는</span>' +
      '<span class="f-text">상대에게 <b>' + gh.sipseong.aboutB.name + '</b> — ' + gh.sipseong.aboutB.line + '</span></div>';

    $('#gh-branch-title').textContent = gh.branchRel.title;
    $('#gh-branch-body').textContent = gh.branchRel.body;

    var compLines = gh.complement.length
      ? gh.complement.join(' ')
      : '서로의 빈 곳을 채우기보다, 닮은 균형을 나눠 가진 두 사람이에요.';
    compLines += ' ' + (gh.yinyang
      ? '음과 양이 만나 서로 다른 결이 하나로 완성됩니다.'
      : '같은 극성끼리라 익숙하고 편안한 결입니다.');
    $('#gh-complement').innerHTML = compLines;

    state.gunghapPair = { a: partnerResult, b: myResult };
    state.gunghapCard = {
      aHan: stA.han, aEl: stA.el, aName: partnerName,
      bHan: stB.han, bEl: stB.el, bName: myName,
      score: gh.score, tier: gh.tier, title: gh.stemRel.title
    };
    renderPairDays();
  }

  /* 궁합 점수 카드 (1080×1920 · 스토리용) — 링크 바이럴의 이미지 짝꿍 */
  function buildGunghapCard() {
    var g = state.gunghapCard;
    var fonts = ['600 190px ' + SERIF_STACK, '600 280px ' + SERIF_STACK, '600 56px ' + SERIF_STACK,
      '600 44px ' + SERIF_STACK, '400 34px ' + SANS_STACK, '700 32px ' + SANS_STACK];
    return Promise.all(fonts.map(function (ff) {
      return document.fonts.load(ff, '사주첩四柱궁합' + g.aHan + g.bHan);
    })).catch(function () {}).then(function () {
      var cv = document.createElement('canvas');
      cv.width = 1080; cv.height = 1920;
      var ctx = cv.getContext('2d');
      ctx.fillStyle = '#F6F1E8'; ctx.fillRect(0, 0, 1080, 1920);
      ctx.strokeStyle = '#211C15'; ctx.lineWidth = 4; ctx.strokeRect(36, 36, 1008, 1848);
      ctx.strokeStyle = '#D8CDB9'; ctx.lineWidth = 1.5; ctx.strokeRect(56, 56, 968, 1808);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#B8382D';
      rr(ctx, 498, 110, 84, 84, 14); ctx.fill();
      ctx.fillStyle = '#F6F1E8';
      ctx.font = '600 30px ' + SERIF_STACK;
      ctx.fillText('四', 540, 148); ctx.fillText('柱', 540, 184);
      ctx.fillStyle = '#B8382D';
      ctx.font = '700 32px ' + SANS_STACK;
      try { ctx.letterSpacing = '8px'; } catch (e) { /* 무시 */ }
      ctx.fillText('두 사람의 궁합', 548, 268);
      try { ctx.letterSpacing = '0px'; } catch (e) { /* 무시 */ }

      /* 이름 */
      ctx.fillStyle = '#211C15';
      ctx.font = '600 56px ' + SERIF_STACK;
      ctx.fillText(g.bName + '  ×  ' + g.aName, 540, 400);

      /* 두 일간 한자 */
      ctx.font = '600 190px ' + SERIF_STACK;
      ctx.fillStyle = CARD_EL_COLOR[g.bEl];
      ctx.fillText(g.bHan, 330, 660);
      ctx.fillStyle = '#C9BFAC';
      ctx.font = '400 90px ' + SANS_STACK;
      ctx.fillText('×', 540, 630);
      ctx.font = '600 190px ' + SERIF_STACK;
      ctx.fillStyle = CARD_EL_COLOR[g.aEl];
      ctx.fillText(g.aHan, 750, 660);

      /* 점수 */
      ctx.fillStyle = '#B8382D';
      ctx.font = '600 280px ' + SERIF_STACK;
      var sw = ctx.measureText(String(g.score)).width;
      ctx.fillText(String(g.score), 505, 1070);
      ctx.fillStyle = '#6E6455';
      ctx.font = '600 56px ' + SERIF_STACK;
      ctx.fillText('점', 505 + sw / 2 + 60, 1060);
      ctx.fillStyle = '#211C15';
      ctx.font = '600 64px ' + SERIF_STACK;
      ctx.fillText(g.tier, 540, 1200);
      ctx.fillStyle = '#6E6455';
      ctx.font = '400 34px ' + SANS_STACK;
      ctx.fillText(g.title, 540, 1280);

      ctx.strokeStyle = '#D8CDB9'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(200, 1420); ctx.lineTo(880, 1420); ctx.stroke();

      ctx.fillStyle = '#40372B';
      ctx.font = '400 36px ' + SANS_STACK;
      ctx.fillText('생일만 넣으면 우리 궁합도 10초', 540, 1530);
      ctx.fillStyle = '#B8382D';
      ctx.font = '700 44px ' + SANS_STACK;
      ctx.fillText('sajucheop.com', 540, 1610);
      ctx.fillStyle = '#9A8F7E';
      ctx.font = '400 30px ' + SANS_STACK;
      ctx.fillText('@sajucheop', 540, 1680);
      return cv;
    });
  }

  function saveGunghapCard() {
    if (!state.gunghapCard) return;
    track('gunghap_card');
    buildGunghapCard().then(function (cv) {
      cv.toBlob(function (blob) {
        var g = state.gunghapCard;
        deliverFile(blob, '사주첩-궁합-' + g.score + '점.jpg', '사주첩 — 궁합 카드');
      }, 'image/jpeg', 0.92);
    });
  }

  /* 둘 다 좋은 날 — 앞으로 30일 중 두 사람 모두 흐름이 좋고 충이 없는 날 */
  function renderPairDays() {
    var wrap = $('#pair-days');
    var pr = state.gunghapPair;
    if (!wrap || !pr) return;
    var t = todayDateParts();
    var dn0 = M._internals.daysFromCivil(t.y, t.m, t.d);
    var out = [];
    for (var i = 0; i < 30; i++) {
      var cv = M._internals.civilFromDays(dn0 + i);
      var ia = M.todayInfo(pr.a, cv.y, cv.m, cv.d);
      var ib = M.todayInfo(pr.b, cv.y, cv.m, cv.d);
      if (ia.relation === '충' || ib.relation === '충') continue;
      var sa = I.scoreDay(pr.a, ia), sb = I.scoreDay(pr.b, ib);
      if (sa < 60 || sb < 60) continue;
      var hap = (ia.relation === '육합' || ia.relation === '삼합' || ib.relation === '육합' || ib.relation === '삼합');
      out.push({ y: cv.y, m: cv.m, d: cv.d, avg: Math.round((sa + sb) / 2), pillar: ia.pillar, note: hap ? '합이 드는 날' : '' });
    }
    out.sort(function (a, b) { return b.avg - a.avg; });
    var top = out.slice(0, 5).sort(function (a, b) {
      return (a.y * 10000 + a.m * 100 + a.d) - (b.y * 10000 + b.m * 100 + b.d);
    });
    wrap.innerHTML = top.length
      ? top.map(function (p) {
          var g = M.ganjiName(p.pillar.stem, p.pillar.branch);
          var dow = WD[new Date(p.y, p.m - 1, p.d).getDay()];
          return '<div class="purpose-day-row">' +
            '<span class="pd-date">' + p.m + '월 ' + p.d + '일 (' + dow + ')</span>' +
            '<span class="pd-main"><span class="pd-reason">' + g.kor + '일 · 두 사람 평균 ' + p.avg + '점' +
            (p.note ? ' — ' + p.note : '') + '</span>' +
            gcalLink(p.y, p.m, p.d, '둘 다 좋은 날 · ' + g.kor + '일',
              '두 사람 평균 ' + p.avg + '점 — 사주첩 sajucheop.com', '+ 구글 캘린더') +
            '</span></div>';
        }).join('')
      : '<p class="purpose-empty">앞으로 30일 안엔 둘 다 트이는 날이 드물어요. 다음 달에 다시 확인해 주세요.</p>';
  }

  /* ---------- 카카오톡 공유 ---------- */

  var KAKAO_KEY = '83f6fa1f5870ca17fb70334a8f67730e';
  var SHARE_IMAGE = 'https://sajucheop.com/og-image.png';

  /* Kakao.Share 네임스페이스는 init() 이후에 생기므로 초기화가 먼저 */
  function kakaoReady() {
    if (!window.Kakao || !Kakao.init) return false;
    try {
      if (!Kakao.isInitialized()) Kakao.init(KAKAO_KEY);
      return !!(Kakao.Share && Kakao.Share.sendDefault);
    } catch (e) {
      return false;
    }
  }

  /* 카카오 콘솔에 등록된 도메인에서만 전송돼요 — 로컬 미리보기에선 실패가 정상 */
  function kakaoSend(o) {
    if (!kakaoReady()) return false;
    var link = { mobileWebUrl: o.url, webUrl: o.url };
    try {
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: { title: o.title, description: o.desc, imageUrl: SHARE_IMAGE, link: link },
        buttons: [{ title: o.btn, link: link }]
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  function kakaoInvite() {
    if (!state.lastInput) {
      toast('먼저 내 사주를 입력해 주세요.');
      return;
    }
    track('gunghap_invite_kakao');
    var payload = Object.assign({ name: state.name }, state.lastInput);
    var url = location.origin + location.pathname + '#p=' + G.encodeProfile(payload);
    var sent = kakaoSend({
      title: (state.name ? state.name + '님이' : '누군가') + ' 궁합을 청했어요',
      desc: '생일만 넣으면 10초 — 두 사람의 일간과 오행으로 보는 진짜 궁합.',
      url: url,
      btn: '궁합 보러 가기'
    });
    if (!sent) makeGunghapLink();
  }

  function kakaoResult() {
    var g = state.gunghap;
    if (!g || !state.gunghapUrl) return;
    track('gunghap_result_kakao');
    var sent = kakaoSend({
      title: '우리 궁합 ' + g.score + '점 — ' + g.tier,
      desc: (g.myName || state.name || '나') + ' × ' + g.partnerName + ' · 열어보면 입력 없이 결과가 바로 보여요.',
      url: state.gunghapUrl,
      btn: '궁합 결과 보기'
    });
    if (!sent) shareGunghapResultLink();
  }

  function initKakao() {
    var ok = kakaoReady();
    document.querySelectorAll('.btn-kakao').forEach(function (b) { b.hidden = !ok; });
    /* 카톡 버튼이 뜨면 같은 자리의 일반 공유 버튼은 감춰 버튼 수를 유지 */
    document.querySelectorAll('.js-invite-fallback').forEach(function (b) { b.hidden = ok; });
    document.querySelectorAll('.js-kakao-invite').forEach(function (b) {
      b.addEventListener('click', kakaoInvite);
    });
  }

  function makeGunghapLink() {
    if (!state.lastInput) {
      toast('먼저 내 사주를 입력해 주세요.');
      return;
    }
    track('gunghap_link');
    var payload = Object.assign({ name: state.name }, state.lastInput);
    var url = location.origin + location.pathname + '#p=' + G.encodeProfile(payload);
    var text = (state.name ? state.name + ' — ' : '') + '우리 궁합 볼래? 생일만 넣으면 바로 나와.';
    if (navigator.share) {
      navigator.share({ title: '사주첩 — 궁합', text: text, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        toast('궁합 링크를 복사했어요. 생년월일시가 담기니 아는 사람에게만 보내세요.');
      });
    }
  }

  function shareGunghap() {
    var g = state.gunghap;
    if (!g) return;
    var text = (g.myName || state.name || '나') + ' × ' + g.partnerName + ' 궁합 ' + g.score + '점 — ' +
      g.tier + ' · 사주첩';
    if (navigator.share) {
      var payload = { title: '사주첩 — 궁합 결과', text: text };
      if (state.gunghapUrl) payload.url = state.gunghapUrl;
      navigator.share(payload).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text + (state.gunghapUrl ? '\n' + state.gunghapUrl : '')).then(function () {
        toast('궁합 결과를 복사했어요.');
      });
    }
  }

  /* 결과 링크(#g=): 두 사람 정보가 모두 담겨, 여는 사람은 입력 없이 바로 결과를 봄 */
  function parsePairFromHash() {
    var m = location.hash.match(/^#g=([A-Za-z0-9_-]+)$/);
    if (!m) return null;
    return G.decodePair(m[1]);
  }

  function updateGunghapButtons(mode) {
    var retCard = $('#gh-return-card'), mine = $('#btn-my-result'), make = $('#btn-make-gunghap3');
    if (mode === 'pair') {
      retCard.hidden = true;
      make.hidden = true;
      mine.className = 'btn-primary';
      mine.textContent = '나도 내 사주 풀어보기';
    } else {
      retCard.hidden = false;
      $('#gh-return-link').value = state.gunghapUrl || '';
      /* 모바일: 문자앱으로 원탭 회신 보조 버튼 */
      $('#btn-return-sms').hidden = !isMobileUA();
      make.hidden = false;
      mine.className = 'btn-outline';
      mine.textContent = '내 사주 전체 보기';
    }
  }

  function returnBySms() {
    if (!state.gunghapUrl || !state.gunghap) return;
    track('gunghap_return_sms');
    var body = '우리 궁합 ' + state.gunghap.score + '점 「' + state.gunghap.tier + '」 — 결과 바로 보기: ' + state.gunghapUrl;
    var sep = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '?';
    location.href = 'sms:' + sep + 'body=' + encodeURIComponent(body);
  }

  function shareGunghapResultLink() {
    var g = state.gunghap;
    if (!g || !state.gunghapUrl) return;
    track('gunghap_return');
    var text = '우리 궁합 결과 나왔어 — ' + g.score + '점 「' + g.tier + '」. 링크 열면 바로 보여!';
    if (navigator.share) {
      navigator.share({ title: '사주첩 — 궁합 결과', text: text, url: state.gunghapUrl }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text + '\n' + state.gunghapUrl).then(function () {
        toast('복사 완료! 카톡 대화방에 붙여넣기만 하면 끝 — 상대는 입력 없이 바로 봐요.');
      });
    }
  }

  /* ---------- 궁합 순위 (이 기기에만 저장) ---------- */

  var GLOG_KEY = 'sajucheop.gunghap.log.v1';
  var GLOG_MAX = 30;

  function loadGlog() {
    try {
      var raw = localStorage.getItem(GLOG_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function saveGlog(list) {
    try { localStorage.setItem(GLOG_KEY, JSON.stringify(list)); } catch (e) { /* 무시 */ }
  }

  /* 궁합이 계산될 때마다 상대를 기록 — 같은 사람이면 갱신해 중복을 막는다 */
  function recordGunghap(partnerInput) {
    var g = state.gunghap, card = state.gunghapCard;
    if (!g || !card || !partnerInput) return;
    var key = bookKeyOf(partnerInput);
    var list = loadGlog().filter(function (e) { return e.key !== key; });
    list.push({
      key: key,
      name: g.partnerName,
      score: g.score,
      tier: g.tier,
      han: card.aHan,
      url: state.gunghapUrl || '',
      ts: new Date().getTime()
    });
    list.sort(function (a, b) { return b.score - a.score; });
    saveGlog(list.slice(0, GLOG_MAX));
    renderGunghapEntry();
  }

  function fmtGlogDate(ts) {
    var d = new Date(ts);
    return (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
  }

  /* 홈의 궁합 카드 부제 — 기록이 쌓이면 1위를 미리 보여 준다 */
  function renderGunghapEntry() {
    var sub = $('#gh-entry-sub');
    if (!sub) return;
    var list = loadGlog();
    sub.textContent = list.length
      ? '기록 ' + list.length + '명 · 1위 ' + list[0].name + ' ' + list[0].score + '점'
      : '링크 하나 보내면 끝 — 10초면 나와요';
  }

  function renderRanking() {
    var wrap = $('#rank-list'), head = $('#rank-count');
    if (!wrap) return;
    var list = loadGlog();
    head.textContent = list.length ? '기록된 사람 ' + list.length + '명' : '아직 기록이 없어요';
    if (!list.length) {
      wrap.innerHTML = '<p class="purpose-empty">아직 궁합 기록이 없어요. 친구에게 링크를 보내고 결과를 받으면 여기에 점수 순으로 쌓입니다.</p>';
      return;
    }
    wrap.innerHTML = list.map(function (e, i) {
      return '<div class="rank-row' + (i === 0 ? ' top' : '') + '" data-key="' + G.escapeHtml(e.key) + '" role="button" tabindex="0">' +
        '<span class="rank-no">' + (i + 1) + '</span>' +
        '<span class="rank-emblem">' + C.emblemSvg(e.han, 30, 'light') + '</span>' +
        '<span class="rank-main"><b>' + G.escapeHtml(e.name) + '</b>' +
        '<span class="rank-line">' + G.escapeHtml(e.tier) + ' · ' + fmtGlogDate(e.ts) + '</span></span>' +
        '<b class="rank-score">' + e.score + '</b>' +
        '<button type="button" class="rank-del" data-del="' + G.escapeHtml(e.key) + '" aria-label="기록 지우기">' +
        '<svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" stroke="#9A8F7E" stroke-width="1.5" stroke-linecap="round"></path></svg>' +
        '</button></div>';
    }).join('');
    wrap.querySelectorAll('.rank-row').forEach(function (row) {
      row.addEventListener('click', function (ev) {
        var el = ev.target;
        while (el && el !== row) {
          if (el.classList && el.classList.contains('rank-del')) return;
          el = el.parentNode;
        }
        var key = row.getAttribute('data-key');
        var hit = loadGlog().filter(function (x) { return x.key === key; })[0];
        if (!hit || !hit.url) {
          toast('이 기록은 결과 링크가 없어 다시 열 수 없어요.');
          return;
        }
        track('rank_open');
        location.href = hit.url;
        location.reload();
      });
    });
    wrap.querySelectorAll('.rank-del').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var key = btn.getAttribute('data-del');
        saveGlog(loadGlog().filter(function (x) { return x.key !== key; }));
        renderRanking();
        renderGunghapEntry();
        toast('기록에서 뺐어요.');
      });
    });
  }

  function openRanking() {
    renderRanking();
    showView('ranking');
  }

  /* 홈의 궁합 카드 — 내 사주가 이미 있으면 바로 초대, 없으면 입력 폼으로 */
  function startGunghapFromHome() {
    track('home_gunghap');
    if (state.lastInput) {
      kakaoInvite();
      return;
    }
    var form = $('#saju-form');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast('내 사주를 먼저 봐야 궁합 링크를 만들 수 있어요.');
  }

  /* ---------- 60갑자 도장첩 (이 기기에만 저장) ---------- */

  var STAMP_KEY = 'sajucheop.stamps.v1';

  function loadStamps() {
    try {
      var o = JSON.parse(localStorage.getItem(STAMP_KEY) || '{}');
      return (o && typeof o === 'object') ? o : {};
    } catch (e) { return {}; }
  }
  function saveStamps(o) {
    try { localStorage.setItem(STAMP_KEY, JSON.stringify(o)); } catch (e) { /* 무시 */ }
  }
  function todayIdx60() {
    var t = todayDateParts();
    return M._internals.dayPillarIndex(M._internals.daysFromCivil(t.y, t.m, t.d) + M._internals.JDN_EPOCH);
  }
  function ganjiOfIdx(k) { return M.ganjiName(k % 10, k % 12); }

  /* 오늘의 운세를 여는 순간 그날 일진 도장 — 하루 한 번 */
  function earnStamp() {
    var k = todayIdx60(), s = loadStamps(), t = todayDateParts();
    if (s[k]) return false;
    s[k] = journalDateKey(t.y, t.m, t.d);
    saveStamps(s);
    var n = Object.keys(s).length;
    toast(ganjiOfIdx(k).kor + '일 도장을 첩에 찍었어요 — ' + n + '/60' + (n >= 60 ? ' 완주!' : ''));
    track('stamp_earn', { n: n });
    renderStampCard();
    renderDailyStamps();
    return true;
  }

  /* 오늘의 운세 화면의 도장 카드 */
  function renderStampCard() {
    var seal = $('#stamp-today-seal');
    if (!seal) return;
    var k = todayIdx60(), s = loadStamps(), g = ganjiOfIdx(k), n = Object.keys(s).length;
    seal.className = 'stamp-seal' + (s[k] ? '' : ' empty');
    seal.innerHTML = g.han.charAt(0) + '<br>' + g.han.charAt(1);
    $('#stamp-today-line').textContent = s[k] ? g.kor + '일 도장, 오늘 받았어요' : g.kor + '일 도장이 지금 찍혔어요';
    $('#stamp-count-line').textContent = '60갑자 중 ' + n + '개 모음' + (n < 60 ? ' · ' + (60 - n) + '개 남음' : ' · 완주!');
  }

  /* 홈 '오늘의 한 문장' 아래 한 줄 */
  function renderDailyStamps() {
    var el = $('#db-stamps');
    if (!el) return;
    var s = loadStamps(), n = Object.keys(s).length;
    if (!n) { el.hidden = true; return; }
    var k = todayIdx60();
    el.textContent = '도장첩 ' + n + '/60' + (s[k] ? ' · 오늘 ' + ganjiOfIdx(k).kor + ' 도장 받음' : ' · 오늘 도장은 오늘의 운세에서') + ' →';
    el.hidden = false;
  }

  function renderStamps() {
    var s = loadStamps(), k = todayIdx60(), n = Object.keys(s).length;
    $('#stamp-head').textContent = n ? '모은 도장 ' + n + '/60' : '아직 도장이 없어요';
    var html = '';
    for (var i = 0; i < 60; i++) {
      var g = ganjiOfIdx(i), got = !!s[i];
      html += '<div class="stamp-cell ' + (got ? 'got' : 'miss') + (i === k ? ' today' : '') +
        '" title="' + g.kor + (got ? ' · ' + s[i] : '') + '">' + g.han + (got ? '<small>' + g.kor + '</small>' : '') + '</div>';
    }
    $('#stamp-grid').innerHTML = html;
    var gt = ganjiOfIdx(k), nk = (k + 1) % 60, gn = ganjiOfIdx(nk);
    $('#stamp-next').textContent = (s[k] ? '오늘 ' + gt.kor + ' 도장은 받았어요. ' : '오늘 ' + gt.kor + ' 도장은 오늘의 운세를 열면 찍혀요. ') +
      '내일은 ' + gn.kor + '일' + (s[nk] ? ' — 이미 있는 도장이에요.' : ' — 새 도장이 기다려요.');
  }

  function openStamps() {
    renderStamps();
    showView('stamps');
  }

  function shareStamps() {
    var n = Object.keys(loadStamps()).length;
    var text = '60갑자 도장첩 ' + n + '/60 — 매일 오늘의 운세를 열면 그날 일진 도장이 찍혀요. 사주첩 sajucheop.com';
    track('stamp_share', { n: n });
    if (navigator.share) {
      navigator.share({ title: '사주첩 — 도장첩', text: text }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () { toast('복사했어요.'); });
    }
  }

  /* ---------- 사주 캐릭터 ---------- */

  var C = window.SajuCharacters;

  function stemIdxByHan(han) {
    for (var i = 0; i < 10; i++) if (M.STEMS[i].han === han) return i;
    return 0;
  }

  function renderCharacter(r) {
    var me = M.STEMS[r.pillars.day.stem];
    var ch = C.of(me.han);
    var strength = r.strength.label;
    state.character = { han: me.han, data: ch, strength: strength };

    /* 결과 화면 티저 */
    $('#ch-mini').innerHTML = C.emblemSvg(me.han, 36, 'light');
    $('#ch-teaser-name').textContent = '나의 사주 캐릭터 — ' + ch.name;
    $('#ch-teaser-sub').textContent = ch.metaphor + ' · ' + me.kor + me.el + ' · ' + strength;

    /* 캐릭터 화면 */
    $('#ch-emblem').innerHTML = C.emblemSvg(me.han, 120, 'dark');
    $('#ch-name').textContent = ch.name;
    $('#ch-sub').textContent = '「' + ch.metaphor + '」 · ' + me.kor + me.el + '(' + me.han + EL_HAN[me.el] + ') 일간 · ' + strength;
    $('#ch-keywords').innerHTML = ch.keywords.map(function (k) {
      return '<span>' + k + '</span>';
    }).join('');

    $('#ch-essence').textContent = '「' + ch.essence + '」';
    $('#ch-body').textContent = ch.body;
    $('#ch-variant').innerHTML = '<b style="color: #B8382D;">' + strength + '</b> · ' + ch.variant[strength];

    $('#ch-strengths').innerHTML = ch.strengths.map(function (s) { return '<li>' + s + '</li>'; }).join('');
    $('#ch-cautions').innerHTML = ch.cautions.map(function (s) { return '<li>' + s + '</li>'; }).join('');

    /* 케미 */
    var chemiHtml = '';
    if (ch.hap) {
      var hapIdx = stemIdxByHan(ch.hap.partner);
      var hapCh = C.of(ch.hap.partner);
      chemiHtml += '<div class="chemi-row">' +
        '<span class="cm-emblem">' + C.emblemSvg(ch.hap.partner, 30, 'light') + '</span>' +
        '<div class="cm-body">' +
        '<div class="cm-tag hap">합(合)이 드는 상대</div>' +
        '<div class="cm-name">' + hapCh.name + ' · ' + M.STEMS[hapIdx].kor + M.STEMS[hapIdx].el + '(' + ch.hap.partner + ')</div>' +
        '<div class="cm-line">' + ch.hap.line + '</div>' +
        '</div></div>';
    }
    if (ch.chung) {
      var chIdx = stemIdxByHan(ch.chung.partner);
      var chungCh = C.of(ch.chung.partner);
      chemiHtml += '<div class="chemi-row">' +
        '<span class="cm-emblem">' + C.emblemSvg(ch.chung.partner, 30, 'light') + '</span>' +
        '<div class="cm-body">' +
        '<div class="cm-tag chung">부딪히기 쉬운 상대</div>' +
        '<div class="cm-name">' + chungCh.name + ' · ' + M.STEMS[chIdx].kor + M.STEMS[chIdx].el + '(' + ch.chung.partner + ')</div>' +
        '<div class="cm-line">' + ch.chung.line + '</div>' +
        '</div></div>';
    } else if (ch.noChungLine) {
      chemiHtml += '<div class="chemi-row">' +
        '<div class="cm-body">' +
        '<div class="cm-tag chung">특별한 점</div>' +
        '<div class="cm-line" style="margin-top: 5px;">' + ch.noChungLine + '</div>' +
        '</div></div>';
    }
    $('#ch-chemi').innerHTML = chemiHtml;
  }

  /* ---------- 사주 명함 이미지 (1080×1920 캔버스) ---------- */

  var CARD_EL_COLOR = { '목': '#3B9C69', '화': '#BC3E28', '토': '#B98D28', '금': '#6297DC', '수': '#2C69A8' };
  var SERIF_STACK = '"Noto Serif KR", "Nanum Myeongjo", Batang, serif';
  var SANS_STACK = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

  function wrapText(ctx, text, maxWidth) {
    var chars = text.split('');
    var lines = [], line = '';
    chars.forEach(function (chr) {
      if (ctx.measureText(line + chr).width > maxWidth && line) {
        lines.push(line); line = chr;
      } else {
        line += chr;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function rr(ctx, x, y, w, h, r) {
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    else { ctx.beginPath(); ctx.rect(x, y, w, h); }
  }

  function buildCharacterCard() {
    var r = state.result, chs = state.character;
    var fonts = [
      '600 92px ' + SERIF_STACK, '600 44px ' + SERIF_STACK, '600 34px ' + SERIF_STACK,
      '600 40px ' + SERIF_STACK, '700 28px ' + SANS_STACK, '500 36px ' + SANS_STACK,
      '400 30px ' + SANS_STACK, '700 34px ' + SANS_STACK, '400 26px ' + SANS_STACK
    ];
    return Promise.all(fonts.map(function (f) {
      return document.fonts.load(f, '사주四柱');
    })).catch(function () {}).then(function () {
      var cv = document.createElement('canvas');
      cv.width = 1080; cv.height = 1920;
      var ctx = cv.getContext('2d');
      var ch = chs.data;

      /* 바탕 + 이중 테두리 */
      ctx.fillStyle = '#F6F1E8';
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.strokeStyle = '#211C15'; ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, 1008, 1848);
      ctx.strokeStyle = '#D8CDB9'; ctx.lineWidth = 1.5;
      ctx.strokeRect(56, 56, 968, 1808);

      /* 낙관 */
      ctx.fillStyle = '#B8382D';
      rr(ctx, 492, 96, 96, 96, 16); ctx.fill();
      ctx.fillStyle = '#F6F1E8';
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.font = '600 34px ' + SERIF_STACK;
      ctx.fillText('四', 540, 140);
      ctx.fillText('柱', 540, 180);

      /* 오버라인 */
      ctx.fillStyle = '#B8382D';
      ctx.font = '700 28px ' + SANS_STACK;
      try { ctx.letterSpacing = '10px'; } catch (e) { /* 미지원 무시 */ }
      ctx.fillText('나의 사주 캐릭터', 545, 262);
      try { ctx.letterSpacing = '0px'; } catch (e) { /* 무시 */ }

      /* 엠블럼 */
      C.drawEmblem(ctx, chs.han, 540, 310, 300, 'light');

      /* 유형명 · 은유 · 정보 */
      var me = M.STEMS[r.pillars.day.stem];
      ctx.fillStyle = '#211C15';
      ctx.font = '600 ' + (ch.name.length > 8 ? 78 : 92) + 'px ' + SERIF_STACK;
      ctx.fillText(ch.name, 540, 740);
      ctx.fillStyle = '#6E6455';
      ctx.font = '600 44px ' + SERIF_STACK;
      ctx.fillText('「 ' + ch.metaphor + ' 」', 540, 812);
      ctx.font = '500 36px ' + SANS_STACK;
      ctx.fillText((state.name ? state.name + ' · ' : '') + me.kor + me.el + '(' + me.han +
        EL_HAN[me.el] + ') 일간 · ' + chs.strength, 540, 878);

      /* 키워드 필 */
      ctx.font = '400 30px ' + SANS_STACK;
      var padH = 26, gap = 14, pillH = 54;
      var widths = ch.keywords.map(function (k) { return ctx.measureText(k).width + padH * 2; });
      var totalW = widths.reduce(function (a, b) { return a + b; }, 0) + gap * (widths.length - 1);
      var px = 540 - totalW / 2;
      ch.keywords.forEach(function (k, i) {
        ctx.strokeStyle = '#C9BDA6'; ctx.lineWidth = 1.5;
        rr(ctx, px, 922, widths[i], pillH, 27); ctx.stroke();
        ctx.fillStyle = '#6E6455';
        ctx.fillText(k, px + widths[i] / 2, 922 + 38);
        px += widths[i] + gap;
      });

      /* 구분선 + 명식 */
      ctx.strokeStyle = '#D8CDB9'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(160, 1046); ctx.lineTo(920, 1046); ctx.stroke();
      ctx.fillStyle = '#9A8F7E';
      ctx.font = '600 30px ' + SERIF_STACK;
      ctx.fillText('命 式', 540, 1108);

      var cols = [
        { label: '시주', p: r.pillars.hour },
        { label: '일주', p: r.pillars.day, isDay: true },
        { label: '월주', p: r.pillars.month },
        { label: '년주', p: r.pillars.year }
      ];
      var centers = [261, 447, 633, 819];
      ctx.fillStyle = 'rgba(184, 56, 45, 0.08)';
      rr(ctx, centers[1] - 84, 1140, 168, 310, 14); ctx.fill();
      cols.forEach(function (col, i) {
        var x = centers[i];
        ctx.fillStyle = '#9A8F7E';
        ctx.font = '400 26px ' + SANS_STACK;
        ctx.fillText(col.label, x, 1188);
        if (!col.p) {
          ctx.fillStyle = '#B5AA97';
          ctx.font = '600 80px ' + SERIF_STACK;
          ctx.fillText('─', x, 1300);
          ctx.fillText('─', x, 1425);
          return;
        }
        var st = M.STEMS[col.p.stem], br = M.BRANCHES[col.p.branch];
        ctx.font = '600 92px ' + SERIF_STACK;
        ctx.fillStyle = CARD_EL_COLOR[st.el];
        ctx.fillText(st.han, x, 1305);
        ctx.fillStyle = CARD_EL_COLOR[br.el];
        ctx.fillText(br.han, x, 1428);
      });

      /* 오행 분포 */
      var elXs = [240, 390, 540, 690, 840];
      EL_ORDER.forEach(function (el, i) {
        var cnt = r.elements[el];
        var x = elXs[i];
        ctx.fillStyle = cnt === 0 ? '#D8CDB9' : CARD_EL_COLOR[el];
        rr(ctx, x - 58, 1500, 26, 26, 6); ctx.fill();
        ctx.fillStyle = cnt === 0 ? '#B5AA97' : '#211C15';
        ctx.font = '700 34px ' + SANS_STACK;
        ctx.textAlign = 'left';
        ctx.fillText(EL_HAN[el] + ' ' + cnt, x - 20, 1524);
        ctx.textAlign = 'center';
      });

      /* 에센스 문장 */
      ctx.fillStyle = '#40372B';
      ctx.font = '600 40px ' + SERIF_STACK;
      var lines = wrapText(ctx, '「' + ch.essence + '」', 860);
      lines.slice(0, 2).forEach(function (ln, i) {
        ctx.fillText(ln, 540, 1626 + i * 58);
      });

      /* 푸터 */
      ctx.strokeStyle = '#D8CDB9'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(200, 1742); ctx.lineTo(880, 1742); ctx.stroke();
      ctx.fillStyle = '#9A8F7E';
      ctx.font = '400 28px ' + SANS_STACK;
      ctx.fillText('사주첩 · 절기 시각 기준 정밀 만세력', 540, 1798);

      return cv;
    });
  }

  function cardFileName() {
    return '사주첩-명함-' + (state.name || '나의사주') + '.png';
  }

  function saveCharacterCard() {
    if (!state.result) return;
    toast('명함을 그리는 중이에요…');
    buildCharacterCard().then(function (cv) {
      cv.toBlob(function (blob) {
        var mode = deliverFile(blob, cardFileName(), '사주첩 — 나의 사주 캐릭터');
        track('save_card', { mode: mode });
        if (mode === 'downloaded') {
          toast('사주 명함을 저장했어요. 스토리에 올려보세요.');
        }
      }, 'image/png');
    }).catch(function () {
      toast('이미지 생성에 실패했어요. 다시 시도해 주세요.');
    });
  }

  function shareCharacterCard() {
    if (!state.result) return;
    buildCharacterCard().then(function (cv) {
      cv.toBlob(function (blob) {
        var file = new File([blob], cardFileName(), { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: '사주첩 — 나의 사주 캐릭터',
            text: '나의 사주 캐릭터: ' + state.character.data.name
          }).catch(function () {});
        } else if (deliverFile(blob, cardFileName(), '사주첩 — 나의 사주 캐릭터') === 'downloaded') {
          toast('이 기기에선 바로 공유가 안 돼서 이미지로 저장했어요.');
        }
      }, 'image/png');
    });
  }

  /* ---------- 오늘의 운세 렌더 ---------- */

  var WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  function todayDateParts() {
    var now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate(), w: now.getDay() };
  }

  function renderToday(r) {
    var t = todayDateParts();
    var info = M.todayInfo(r, t.y, t.m, t.d);
    var idx60 = M._internals.dayPillarIndex(M._internals.daysFromCivil(t.y, t.m, t.d) + M._internals.JDN_EPOCH);
    var f = I.todayFortune(r, info, idx60);
    state.todayFortune = f;
    state.todayInfo = info;
    state.todayDate = t;

    var g = M.ganjiName(info.pillar.stem, info.pillar.branch);
    var st = stemLabel(info.pillar.stem), br = branchLabel(info.pillar.branch);
    var me = M.STEMS[r.pillars.day.stem];

    /* 결과 화면 티저 */
    $('#tt-ganji').innerHTML =
      '<span class="el-' + st.el + '">' + st.han + '</span><span class="el-' + br.el + '">' + br.han + '</span>';
    $('#tt-sub').textContent = g.kor + '일 · ' + f.theme.title;

    /* 오늘의 운세 화면 */
    $('#t-date').textContent = t.m + '월 ' + t.d + '일 ' + WEEKDAYS[t.w];
    $('#t-sub').textContent = '오늘의 일진은 ' + g.kor + '(' + g.han + ') — 내 일간 ' +
      me.kor + me.el + '에게 ' + info.stemSipseong +
      josa(info.stemSipseong, '이', '가') + ' 드는 날이에요.';

    $('#t-hero').innerHTML =
      '<div class="ganji-col">' +
      '<span class="el-d-' + st.el + '">' + st.han + '</span>' +
      '<span class="el-d-' + br.el + '">' + br.han + '</span>' +
      '</div>' +
      '<div class="v-div"></div>' +
      '<div class="cd-info">' +
      '<div class="cd-range">오늘의 흐름 · ' + g.kor + '일</div>' +
      '<div class="cd-title"><span class="t-score">' + f.score + '</span>점 · ' + f.weather + '</div>' +
      '<div class="cd-body">' + f.weatherLine + '입니다.</div>' +
      '</div>';

    $('#t-relation').innerHTML = f.relationText
      ? '<p class="notice">' + f.relationText + '</p>'
      : '';

    $('#t-theme-title').textContent = f.theme.title;
    $('#t-theme-body').textContent = f.theme.body;

    $('#t-categories').innerHTML =
      '<div class="fortune-row"><span class="f-label">재물</span><span class="f-text">' + f.category.money + '</span></div>' +
      '<div class="fortune-row"><span class="f-label">관계</span><span class="f-text">' + f.category.people + '</span></div>' +
      '<div class="fortune-row"><span class="f-label">일·공부</span><span class="f-text">' + f.category.work + '</span></div>';

    $('#t-lucky').innerHTML =
      '<span class="pill"><span class="dot" style="background: var(' + EL_VAR[f.lucky.el] + ');"></span>행운색 ' + f.lucky.color + '</span>' +
      '<span class="pill">방위 ' + f.lucky.dir + '</span>' +
      '<span class="pill">숫자 ' + f.lucky.number + '</span>';

    /* 시간대별 흐름 */
    var flow = I.hourFlow(r, info.pillar.stem);
    $('#t-hour-tag').textContent = '자시(23시)부터 해시(21시)까지';
    $('#t-hours').innerHTML = flow.slots.map(function (s) {
      var h = Math.round(8 + (s.score - 15) / 75 * 34);
      var cls = s.idx === flow.best.idx ? ' best' : (s.idx === flow.worst.idx ? ' worst' : '');
      return '<div class="hs-col' + cls + '">' +
        '<div class="hs-bar' + cls + '" style="height: ' + h + 'px;"></div>' +
        '<div class="hs-label">' + s.branch.han + '</div>' +
        '</div>';
    }).join('');
    $('#t-hour-note').textContent = '힘이 붙는 시간은 ' + flow.best.branch.kor + '시(' + flow.best.label +
      '), 한 템포 쉴 시간은 ' + flow.worst.branch.kor + '시(' + flow.worst.label + ')예요.';

    renderWeekStrip(r);
    renderTomorrow(r);
    renderJournal();
  }

  /* ---------- 이번 주 나의 날씨 (7일 미니 그래프) ---------- */

  var WK_SHORT = ['일', '월', '화', '수', '목', '금', '토'];

  function renderWeekStrip(r) {
    var strip = $('#wk-strip');
    if (!strip) return;
    var t = todayDateParts();
    var dn0 = M._internals.daysFromCivil(t.y, t.m, t.d);
    var days = [];
    for (var i = 0; i < 7; i++) {
      var cv = M._internals.civilFromDays(dn0 + i);
      var info = M.todayInfo(r, cv.y, cv.m, cv.d);
      days.push({
        i: i, d: cv.d,
        w: WK_SHORT[new Date(cv.y, cv.m - 1, cv.d).getDay()],
        score: I.scoreDay(r, info),
        chung: info.relation === '충'
      });
    }
    var best = days.reduce(function (a, b) { return b.score > a.score ? b : a; });
    var care = days.filter(function (d) { return d.chung; })[0] ||
      days.reduce(function (a, b) { return b.score < a.score ? b : a; });

    strip.innerHTML = days.map(function (d) {
      var h = Math.round(10 + (d.score - 30) / 65 * 34);
      h = Math.max(8, Math.min(44, h));
      return '<div class="wk-col' + (d.i === 0 ? ' today' : '') + (d.i === best.i ? ' best' : '') + '">' +
        '<div class="wk-score">' + d.score + '</div>' +
        '<div class="wk-bar" style="height: ' + h + 'px;"></div>' +
        '<div class="wk-label">' + (d.i === 0 ? '오늘' : d.w) + (d.chung ? '<i class="wk-dot"></i>' : '') + '</div>' +
        '</div>';
    }).join('');
    $('#wk-range').textContent = '오늘부터 7일';
    $('#wk-note').textContent = '가장 트이는 날은 ' + (best.i === 0 ? '바로 오늘' : best.w + '요일') +
      '(' + best.score + '점), 한 템포 쉬어갈 날은 ' + (care.i === 0 ? '오늘' : care.w + '요일') +
      (care.chung ? ' — 충이 드는 날이에요.' : '이에요.');
  }

  /* ---------- 내일 예고 ---------- */

  function renderTomorrow(r) {
    var title = $('#tmr-title');
    if (!title) return;
    var t = todayDateParts();
    var cv = M._internals.civilFromDays(M._internals.daysFromCivil(t.y, t.m, t.d) + 1);
    var info = M.todayInfo(r, cv.y, cv.m, cv.d);
    var g = M.ganjiName(info.pillar.stem, info.pillar.branch);
    var score = I.scoreDay(r, info);
    title.textContent = '내일은 ' + g.kor + '(' + g.han + ')일 — 흐름 ' + score + '점';
    var relLine = info.relation === '충'
      ? ' 일지와 충이 드니, 중요한 결정은 오늘 마무리해 두는 게 좋아요.'
      : (info.relation === '육합' || info.relation === '삼합'
        ? ' 일지와 합이 들어 약속과 만남을 잡기 좋은 날이에요.'
        : '');
    $('#tmr-body').textContent = info.stemSipseong + josa(info.stemSipseong, '이', '가') +
      ' 드는 날입니다.' + relLine;
  }

  /* ---------- 아침 알림 심기 (매일 반복 캘린더 일정) ---------- */

  function downloadMorningAlarm() {
    var t = todayDateParts();
    var cv = M._internals.civilFromDays(M._internals.daysFromCivil(t.y, t.m, t.d) + 1);
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var start = '' + cv.y + pad(cv.m) + pad(cv.d);
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//sajucheop//morning-alarm//KO',
      'CALSCALE:GREGORIAN', 'X-WR-CALNAME:사주첩 아침 알림',
      'BEGIN:VEVENT',
      'UID:sj-morning-alarm@sajucheop',
      'DTSTAMP:' + start + 'T000000Z',
      'DTSTART:' + start + 'T080000',
      'DTEND:' + start + 'T081000',
      'RRULE:FREQ=DAILY',
      /* 반복 일정이라 그날의 점수는 담을 수 없음 — 점수는 링크를 눌러 확인 */
      'SUMMARY:오늘의 운세 보기 — 사주첩',
      'DESCRIPTION:오늘의 흐름 점수와 시간대별 운세 확인하기 https://sajucheop.com',
      'URL:https://sajucheop.com/?utm_source=calendar&utm_medium=alarm',
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:오늘의 운세 보기 — 사주첩', 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ];
    var blob = new Blob([icsJoin(lines)], { type: 'text/calendar;charset=utf-8' });
    var mode = deliverFile(blob, '사주첩-아침알림.ics', '사주첩 — 아침 알림', { download: true });
    track('morning_alarm', { mode: mode });
    if (mode === 'downloaded') {
      toast('받은 파일을 누르면 매일 아침 8시 알림이 캘린더에 심어져요.');
    }
  }

  /* ---------- 적중 기록 (운세 검증 · 이 기기에만) ---------- */

  var JOURNAL_KEY = 'sajucheop.journal.v1';

  function loadJournal() {
    try {
      var raw = localStorage.getItem(JOURNAL_KEY);
      var o = raw ? JSON.parse(raw) : {};
      return o && typeof o === 'object' ? o : {};
    } catch (e) { return {}; }
  }

  function saveJournal(j) {
    try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(j)); } catch (e) { /* 무시 */ }
  }

  function journalDateKey(y, m, d) {
    return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }

  /* 적중 기록은 '내 사주'를 볼 때만 — 첩의 다른 사람 화면에선 숨김 */
  function journalIsMine() {
    if (!state.lastInput) return true;
    var self = bookSelf();
    if (self) return bookKeyOf(self) === bookKeyOf(state.lastInput);
    var my = loadProfile();
    if (!my) return true;
    return bookKeyOf(my) === bookKeyOf(state.lastInput);
  }

  function journalStats() {
    var j = loadJournal();
    var keys = Object.keys(j);
    var n = keys.length;
    if (!n) return { n: 0 };
    var hit = 0, bySip = {};
    keys.forEach(function (k) {
      var e = j[k];
      if (e.v === 1) hit += 1;
      else if (e.v === 0) hit += 0.5;
      if (e.sip) {
        bySip[e.sip] = bySip[e.sip] || { n: 0, hit: 0 };
        bySip[e.sip].n++;
        if (e.v === 1) bySip[e.sip].hit++;
      }
    });
    var t = todayDateParts();
    var dn = M._internals.daysFromCivil(t.y, t.m, t.d);
    if (!j[journalDateKey(t.y, t.m, t.d)]) dn -= 1;
    var streak = 0;
    for (;;) {
      var cv = M._internals.civilFromDays(dn - streak);
      if (j[journalDateKey(cv.y, cv.m, cv.d)]) streak++;
      else break;
    }
    var best = null;
    Object.keys(bySip).forEach(function (s) {
      var e = bySip[s];
      if (e.n >= 3) {
        var rate = e.hit / e.n;
        if (!best || rate > best.rate) best = { sip: s, rate: rate, n: e.n, hit: e.hit };
      }
    });
    return { n: n, rate: Math.round(hit / n * 100), streak: streak, best: best };
  }

  function renderJournal() {
    var card = $('#journal-card');
    if (!card) return;
    if (!journalIsMine()) { card.hidden = true; return; }
    card.hidden = false;
    var t = todayDateParts();
    var today = loadJournal()[journalDateKey(t.y, t.m, t.d)];
    card.querySelectorAll('.jr-btn').forEach(function (b) {
      b.classList.toggle('selected', !!today && String(today.v) === b.getAttribute('data-jr'));
    });
    $('#jr-hint').textContent = today
      ? '오늘 기록 완료 — 내일 밤에 또 만나요. (다시 누르면 취소)'
      : '하루를 마치며, 오늘 흐름' + (state.todayFortune ? '(' + state.todayFortune.score + '점)' : '') +
        '이 실제 하루와 맞았는지 눌러보세요.';
    var s = journalStats();
    var stats = $('#jr-stats');
    if (s.n >= 1) {
      stats.innerHTML =
        '<span class="jr-num"><b>' + s.n + '</b>일 기록</span>' +
        '<span class="jr-num">적중률 <b>' + s.rate + '%</b></span>' +
        (s.streak >= 2 ? '<span class="jr-num">연속 <b>' + s.streak + '</b>일</span>' : '') +
        (s.best ? '<p class="jr-best">나에게 유난히 잘 맞는 날 — <b>' + s.best.sip + '</b> 드는 날 (' +
          s.best.hit + '/' + s.best.n + ' 적중)</p>' : '') +
        (s.n >= 7 ? '<button type="button" class="btn-outline jr-share" id="btn-jr-share">내 적중률 공유하기</button>' : '');
      stats.hidden = false;
      var shareBtn = $('#btn-jr-share');
      if (shareBtn) shareBtn.addEventListener('click', shareJournal);
    } else {
      stats.hidden = true;
    }
  }

  function markJournal(v) {
    if (!state.todayFortune || !state.todayInfo) return;
    var t = todayDateParts();
    var j = loadJournal();
    var key = journalDateKey(t.y, t.m, t.d);
    var same = j[key] && j[key].v === v;
    if (same) {
      delete j[key];
    } else {
      j[key] = { v: v, s: state.todayFortune.score, sip: state.todayInfo.stemSipseong };
      track('journal_mark', { v: v });
    }
    saveJournal(j);
    renderJournal();
    if (!same) {
      toast(v === 1 ? '기록했어요. 쌓일수록 나만의 패턴이 보여요.'
        : (v === 0 ? '반반도 소중한 기록이에요.' : '안 맞은 날도 기록하면, 어떤 날 조심할지 보이기 시작해요.'));
    }
  }

  function shareJournal() {
    var s = journalStats();
    if (!s.n) return;
    track('journal_share');
    var text = '나는 운세를 믿는 대신 기록해봤다 — ' + s.n + '일 기록, 적중률 ' + s.rate + '% · 사주첩 sajucheop.com';
    if (navigator.share) {
      navigator.share({ title: '사주첩 — 적중 기록', text: text }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () { toast('기록을 복사했어요.'); });
    }
  }

  /* ---------- 운세 캘린더 ---------- */

  function monthKey(y, m) { return y * 12 + (m - 1); }

  function monthData(y, m) {
    var key = y + '-' + m;
    if (state.calCache[key]) return state.calCache[key];
    var days = [];
    var max = M._internals.daysInMonth(y, m);
    for (var d = 1; d <= max; d++) {
      var info = M.todayInfo(state.result, y, m, d);
      var lun = null, son = false;
      if (lunarCal && lunarCal.setSolarDate(y, m, d)) {
        lun = lunarCal.getLunarCalendar();
        var tail = lun.day % 10;
        son = (tail === 9 || tail === 0); /* 손없는날 — 음력 끝자리 9·0 */
      }
      days.push({
        d: d,
        info: info,
        score: I.scoreDay(state.result, info),
        lunar: lun,
        son: son
      });
    }
    state.calCache[key] = days;
    return days;
  }

  function purposeTopDays(y, m, purposeKey) {
    var t = todayDateParts();
    var days = monthData(y, m);
    var isCurrentMonth = (y === t.y && m === t.m);
    return days
      .filter(function (dd) { return !isCurrentMonth || dd.d >= t.d; })
      .map(function (dd) {
        var match = I.purposeMatch(purposeKey, dd.info);
        /* 이사 목적: 손없는날 교차 보너스 */
        if (purposeKey === 'move' && dd.son && dd.info.relation !== '충') {
          match = match
            ? { bonus: match.bonus + 8, reason: '손없는날 · ' + match.reason }
            : { bonus: 8, reason: '손없는날 — 탈이 적다는 전통 이삿날' };
        }
        return match ? { d: dd.d, score: dd.score + match.bonus, reason: match.reason, info: dd.info } : null;
      })
      .filter(Boolean)
      .sort(function (a, b) { return b.score - a.score || a.d - b.d; })
      .slice(0, 3);
  }

  function renderCalendar() {
    if (!state.result) return;
    var c = state.calendar;
    var t = todayDateParts();
    $('#cal-title').textContent = c.y + '년 ' + c.m + '월';
    $('#purpose-month').textContent = c.m + '월 기준';

    var minK = monthKey(t.y, t.m) - 1, maxK = monthKey(t.y, t.m) + 11;
    $('#cal-prev').style.visibility = monthKey(c.y, c.m) > minK ? 'visible' : 'hidden';
    $('#cal-next').style.visibility = monthKey(c.y, c.m) < maxK ? 'visible' : 'hidden';

    var days = monthData(c.y, c.m);
    var firstDow = new Date(c.y, c.m - 1, 1).getDay();
    var purposeDays = c.purpose ? purposeTopDays(c.y, c.m, c.purpose).map(function (p) { return p.d; }) : [];

    var html = ['일', '월', '화', '수', '목', '금', '토'].map(function (w, i) {
      return '<div class="cg-head' + (i === 0 ? ' sun' : '') + '">' + w + '</div>';
    }).join('');
    for (var i = 0; i < firstDow; i++) html += '<div class="cal-cell empty"></div>';
    days.forEach(function (dd) {
      var dow = (firstDow + dd.d - 1) % 7;
      var isToday = (c.y === t.y && c.m === t.m && dd.d === t.d);
      var isPast = monthKey(c.y, c.m) < monthKey(t.y, t.m) ||
        (c.y === t.y && c.m === t.m && dd.d < t.d);
      var mark = dd.score >= 80 ? 'good' : (dd.info.relation === '충' ? 'warn' : 'none');
      var cls = 'cal-cell' + (dow === 0 ? ' sun' : '') + (isToday ? ' today-cell' : '') +
        (isPast ? ' past' : '') + (c.selected === dd.d ? ' selected' : '');
      html += '<button class="' + cls + '" data-day="' + dd.d + '">' +
        (purposeDays.indexOf(dd.d) >= 0 ? '<span class="cc-purpose"></span>' : '') +
        (dd.son ? '<span class="cc-son">손</span>' : '') +
        '<span>' + dd.d + '</span>' +
        '<span class="cc-mark ' + mark + '"></span>' +
        '</button>';
    });
    $('#cal-grid').innerHTML = html;

    $('#cal-grid').querySelectorAll('.cal-cell[data-day]').forEach(function (cell) {
      cell.addEventListener('click', function () {
        state.calendar.selected = +cell.getAttribute('data-day');
        renderCalendar();
      });
    });

    /* 선택한 날 상세 */
    var detail = $('#cal-detail');
    if (c.selected) {
      var dd = days.filter(function (x) { return x.d === c.selected; })[0];
      if (dd) {
        var g = M.ganjiName(dd.info.pillar.stem, dd.info.pillar.branch);
        var relNote = dd.info.relation === '충' ? ' · 일지와 충 — 큰 결정은 피하세요'
          : (dd.info.relation === '육합' ? ' · 일지와 합 — 인연이 순조로워요' : '');
        var evPrefix = dd.score >= 80 ? '○ 길일 · ' : (dd.info.relation === '충' ? '△ 충 주의 · ' : '');
        var lunLine = dd.lunar
          ? '<br><span class="cd-lunar">음력 ' + dd.lunar.month + '월 ' + dd.lunar.day + '일' +
            (dd.son ? ' · <b>손없는날</b> — 이사·이전에 탈이 적다는 날' : '') + '</span>'
          : '';
        detail.innerHTML = '<b>' + c.m + '월 ' + dd.d + '일 · ' + g.kor + '(' + g.han + ')일</b><br>' +
          '흐름 ' + dd.score + '점 — ' + dd.info.stemSipseong +
          josa(dd.info.stemSipseong, '이', '가') + ' 드는 날' + relNote + lunLine + '<br>' +
          gcalLink(c.y, c.m, dd.d, evPrefix + g.kor + '일 · 흐름 ' + dd.score + '점',
            dd.info.stemSipseong + josa(dd.info.stemSipseong, '이', '가') + ' 드는 날' +
            (dd.son ? ' · 손없는날' : '') + ' — 사주첩 sajucheop.com');
        detail.hidden = false;
      }
    } else {
      detail.hidden = true;
    }

    /* 목적 칩 */
    $('#purpose-chips').innerHTML = I.PURPOSES.map(function (p) {
      return '<button class="purpose-chip' + (c.purpose === p.key ? ' active' : '') +
        '" data-purpose="' + p.key + '">' + p.label + '</button>';
    }).join('');
    $('#purpose-chips').querySelectorAll('.purpose-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var k = chip.getAttribute('data-purpose');
        state.calendar.purpose = (state.calendar.purpose === k) ? null : k;
        renderCalendar();
      });
    });

    if (c.purpose) {
      var pDef = I.PURPOSES.filter(function (p) { return p.key === c.purpose; })[0];
      $('#purpose-hint').textContent = pDef.hint;
      var tops = purposeTopDays(c.y, c.m, c.purpose);
      $('#purpose-days').innerHTML = tops.length
        ? tops.map(function (p) {
            var g = M.ganjiName(p.info.pillar.stem, p.info.pillar.branch);
            var dow = ['일', '월', '화', '수', '목', '금', '토'][new Date(c.y, c.m - 1, p.d).getDay()];
            return '<div class="purpose-day-row">' +
              '<span class="pd-date">' + c.m + '월 ' + p.d + '일 (' + dow + ')</span>' +
              '<span class="pd-main"><span class="pd-reason">' + g.kor + '일 — ' + p.reason + '</span>' +
              gcalLink(c.y, c.m, p.d, pDef.label + ' 좋은 날 · ' + g.kor + '일',
                p.reason + ' — 사주첩 sajucheop.com', '+ 구글 캘린더') +
              '</span></div>';
          }).join('')
        : '<p class="purpose-empty">이번 달 남은 날 중엔 꼭 맞는 날이 없어요. 다음 달을 봐주세요.</p>';
    } else {
      $('#purpose-hint').textContent = '목적을 고르면 이번 달의 좋은 날 셋을 짚어드려요.';
      $('#purpose-days').innerHTML = '';
    }
  }

  function moveMonth(delta) {
    var c = state.calendar;
    var k = monthKey(c.y, c.m) + delta;
    c.y = Math.floor(k / 12);
    c.m = (k % 12) + 1;
    c.selected = null;
    renderCalendar();
  }

  /* ---------- 파일 전달 (다운로드 / 공유 시트 / 인앱 브라우저 안내) ---------- */

  function isMobileUA() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function isInAppBrowser() {
    return /Instagram|FBAN|FBAV|FB_IAB|KAKAOTALK|NAVER\(inapp|Line\/|DaumApps/i.test(navigator.userAgent);
  }

  /* 반환: 'shared' | 'blocked' | 'downloaded'
   * opts.download: 모바일에서도 공유창 없이 바로 내려받기 (ics — 공유 대상에 캘린더가 없어서) */
  function deliverFile(blob, filename, shareTitle, opts) {
    var file = null, canShare = false;
    try {
      file = new File([blob], filename, { type: blob.type });
      canShare = !(opts && opts.download) &&
        isMobileUA() && !!(navigator.canShare && navigator.canShare({ files: [file] }));
    } catch (e) { canShare = false; }

    if (canShare) {
      navigator.share({ files: [file], title: shareTitle }).then(function () {
        toast('공유 창에서 저장하거나 캘린더·사진 앱을 선택하면 돼요.');
      }).catch(function () { /* 사용자가 닫음 — 조용히 */ });
      return 'shared';
    }
    if (isInAppBrowser()) {
      toast('인스타·카톡 안 브라우저에서는 저장이 막혀요. 오른쪽 위 ⋯ 메뉴 → 외부 브라우저로 열기 후 다시 시도해 주세요.');
      return 'blocked';
    }
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.download = filename;
    a.href = url;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    return 'downloaded';
  }

  /* ---------- 캘린더 내보내기 (.ics) ---------- */

  /* 구글 캘린더 바로 추가 링크 — 기기의 .ics 기본 앱 설정과 무관하게 동작.
   * href는 innerHTML 속성에만 쓰므로 &는 &amp;로 넣음 */
  function gcalLink(y, m, d, title, details, label) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var nx = M._internals.civilFromDays(M._internals.daysFromCivil(y, m, d) + 1);
    var href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&amp;text=' + encodeURIComponent(title) +
      '&amp;dates=' + y + pad(m) + pad(d) + '/' + nx.y + pad(nx.m) + pad(nx.d) +
      '&amp;details=' + encodeURIComponent(details) +
      '&amp;ctz=Asia/Seoul';
    return '<a class="gcal-link" target="_blank" rel="noopener" href="' + href + '">' +
      (label || '+ 구글 캘린더에 저장') + '</a>';
  }

  function icsEscape(s) {
    return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  /* RFC 5545 — 한 줄 75옥텟 제한. 한글은 3바이트라 대부분의 줄이 넘어가므로 접어 준다.
   * 이어지는 줄은 맨 앞 공백 1칸을 포함해 75옥텟이 된다. */
  function utf8Bytes(s) {
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.codePointAt(i);
      if (c > 0xFFFF) i++;
      n += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
    }
    return n;
  }

  function icsFold(line) {
    var parts = [], cur = '', bytes = 0;
    for (var i = 0; i < line.length; i++) {
      var code = line.codePointAt(i);
      var ch = line[i];
      if (code > 0xFFFF) ch += line[++i];
      var w = code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
      if (bytes + w > (parts.length === 0 ? 75 : 74)) {
        /* URL이 반으로 갈리지 않도록, 가능하면 마지막 공백 앞에서 접는다.
         * 접힌 줄 맨 앞의 공백 1칸만 제거되므로 본문 공백은 그대로 남는다. */
        var sp = cur.lastIndexOf(' ');
        if (sp > 0 && cur.length - sp <= 30) {
          parts.push(cur.slice(0, sp));
          cur = cur.slice(sp);
          bytes = utf8Bytes(cur);
        } else {
          parts.push(cur);
          cur = '';
          bytes = 0;
        }
      }
      cur += ch;
      bytes += w;
    }
    parts.push(cur);
    return parts.join('\r\n ');
  }

  function icsJoin(lines) {
    return lines.map(icsFold).join('\r\n');
  }

  function buildIcs() {
    var t = todayDateParts();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var stamp = t.y + pad(t.m) + pad(t.d) + 'T000000Z';
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//sajucheop//fortune-calendar//KO',
      'CALSCALE:GREGORIAN',
      'X-WR-CALNAME:사주첩 — 나의 길일'
    ];
    var dn0 = M._internals.daysFromCivil(t.y, t.m, t.d);

    /* 30일치를 먼저 채점 */
    var days = [];
    for (var i = 0; i < 30; i++) {
      var cv = M._internals.civilFromDays(dn0 + i);
      var info = M.todayInfo(state.result, cv.y, cv.m, cv.d);
      days.push({
        cv: cv,
        next: M._internals.civilFromDays(dn0 + i + 1),
        info: info,
        score: I.scoreDay(state.result, info),
        pick: null
      });
    }
    days.forEach(function (d) {
      d.pick = d.score >= 80 ? 'good' : (d.info.relation === '충' ? 'chung' : null);
    });

    /* 80점을 넘는 날이 드문 사주가 3분의 1이라, 좋은 날이 세 개는 담기도록 상위 점수일로 채운다 */
    var goodCount = days.filter(function (d) { return d.pick === 'good'; }).length;
    days.slice().sort(function (a, b) { return b.score - a.score; }).forEach(function (d) {
      if (goodCount >= 3 || d.pick) return;
      d.pick = 'good';
      goodCount++;
    });

    var count = 0;
    days.forEach(function (d) {
      if (!d.pick) return;
      var g = M.ganjiName(d.info.pillar.stem, d.info.pillar.branch);
      var isGood = d.pick === 'good';
      var summary = (isGood ? (d.score >= 80 ? '○ 길일 · ' : '○ 좋은 날 · ') : '△ 충 주의 · ') +
        g.kor + '일 (' + d.score + '점)';
      var desc = (isGood
        ? d.info.stemSipseong + josa(d.info.stemSipseong, '이', '가') + ' 드는 날.'
        : '내 일지와 충(沖)이 드는 날. 중요한 결정과 서명은 미루는 게 좋아요.') +
        ' 오늘의 흐름 ' + d.score + '점 — 자세히 보기 https://sajucheop.com';
      lines.push(
        'BEGIN:VEVENT',
        'UID:sjsj-' + d.cv.y + pad(d.cv.m) + pad(d.cv.d) + '@sajucheop',
        'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:' + d.cv.y + pad(d.cv.m) + pad(d.cv.d),
        'DTEND;VALUE=DATE:' + d.next.y + pad(d.next.m) + pad(d.next.d),
        'SUMMARY:' + icsEscape(summary),
        'DESCRIPTION:' + icsEscape(desc),
        'URL:https://sajucheop.com/?utm_source=calendar&utm_medium=fortune',
        'TRANSP:TRANSPARENT',
        'END:VEVENT'
      );
      count++;
    });
    lines.push('END:VCALENDAR');
    return { text: icsJoin(lines), count: count };
  }

  function downloadIcs() {
    if (!state.result) return;
    try {
      var ics = buildIcs();
      var blob = new Blob([ics.text], { type: 'text/calendar;charset=utf-8' });
      var mode = deliverFile(blob, '사주첩-운세캘린더.ics', '사주첩 — 운세 캘린더', { download: true });
      track('ics_export', { mode: mode });
      var help = $('#ics-help');
      if (mode === 'downloaded') {
        toast(isMobileUA()
          ? ics.count + '개 일정 파일을 받았어요. 다운로드된 파일을 누르면 캘린더가 열립니다.'
          : '30일치 ' + ics.count + '개 일정을 파일로 받았어요. 캘린더에 넣는 법은 아래 안내를 보세요.');
      }
      if (help && mode !== 'shared') help.open = true;
    } catch (e) {
      toast('파일 생성에 문제가 생겼어요. 새로고침 후 다시 시도해 주세요.');
      if (window.console) console.error(e);
    }
  }

  function shareToday() {
    var f = state.todayFortune, t = state.todayDate, info = state.todayInfo;
    if (!f) return;
    var g = M.ganjiName(info.pillar.stem, info.pillar.branch);
    var text = t.m + '월 ' + t.d + '일 오늘의 운세 — ' + g.kor + '일 · 흐름 ' + f.score + '점(' +
      f.weather + ') · ' + f.theme.title + ' — 사주첩';
    if (navigator.share) {
      navigator.share({ title: '사주첩 — 오늘의 운세', text: text }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        toast('오늘 운세를 복사했어요.');
      });
    }
  }

  /* 오늘 카드 (스토리 1080×1920) */
  function buildTodayCard() {
    var r = state.result, info = state.todayInfo, f = state.todayFortune, t = state.todayDate;
    var fonts = ['600 300px ' + SERIF_STACK, '600 60px ' + SERIF_STACK, '600 48px ' + SERIF_STACK,
      '400 36px ' + SANS_STACK, '700 32px ' + SANS_STACK];
    return Promise.all(fonts.map(function (ff) {
      return document.fonts.load(ff, '사주첩四柱乙亥');
    })).catch(function () {}).then(function () {
      var cv = document.createElement('canvas');
      cv.width = 1080; cv.height = 1920;
      var ctx = cv.getContext('2d');
      ctx.fillStyle = '#F6F1E8'; ctx.fillRect(0, 0, 1080, 1920);
      ctx.strokeStyle = '#211C15'; ctx.lineWidth = 4; ctx.strokeRect(36, 36, 1008, 1848);
      ctx.strokeStyle = '#D8CDB9'; ctx.lineWidth = 1.5; ctx.strokeRect(56, 56, 968, 1808);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#B8382D';
      rr(ctx, 498, 110, 84, 84, 14); ctx.fill();
      ctx.fillStyle = '#F6F1E8';
      ctx.font = '600 30px ' + SERIF_STACK;
      ctx.fillText('四', 540, 148); ctx.fillText('柱', 540, 184);
      ctx.fillStyle = '#B8382D';
      ctx.font = '700 32px ' + SANS_STACK;
      try { ctx.letterSpacing = '8px'; } catch (e) { /* 무시 */ }
      ctx.fillText('오늘의 운세', 544, 268);
      try { ctx.letterSpacing = '0px'; } catch (e) { /* 무시 */ }
      ctx.fillStyle = '#6E6455';
      ctx.font = '400 36px ' + SANS_STACK;
      ctx.fillText(t.y + '년 ' + t.m + '월 ' + t.d + '일 ' + WEEKDAYS[t.w], 540, 330);

      var st = M.STEMS[info.pillar.stem], br = M.BRANCHES[info.pillar.branch];
      ctx.font = '600 300px ' + SERIF_STACK;
      ctx.fillStyle = CARD_EL_COLOR[st.el];
      ctx.fillText(st.han, 540, 680);
      ctx.fillStyle = CARD_EL_COLOR[br.el];
      ctx.fillText(br.han, 540, 1010);
      ctx.fillStyle = '#6E6455';
      ctx.font = '600 48px ' + SERIF_STACK;
      ctx.fillText(M.ganjiName(info.pillar.stem, info.pillar.branch).kor + '일', 540, 1105);

      ctx.strokeStyle = '#D8CDB9'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(200, 1180); ctx.lineTo(880, 1180); ctx.stroke();

      ctx.fillStyle = '#211C15';
      ctx.font = '600 60px ' + SERIF_STACK;
      ctx.fillText(f.score + '점 · ' + f.weather, 540, 1290);
      ctx.fillStyle = '#40372B';
      ctx.font = '600 48px ' + SERIF_STACK;
      ctx.fillText('「 ' + f.theme.title + ' 」', 540, 1380);
      var me = M.STEMS[r.pillars.day.stem];
      ctx.fillStyle = '#6E6455';
      ctx.font = '400 36px ' + SANS_STACK;
      ctx.fillText(me.kor + me.el + ' 일간에게 ' + info.stemSipseong + josa(info.stemSipseong, '이', '가') + ' 드는 날', 540, 1455);
      ctx.fillStyle = '#9A8F7E';
      ctx.fillText('행운색 ' + f.lucky.color + ' · 방위 ' + f.lucky.dir + ' · 숫자 ' + f.lucky.number, 540, 1520);

      ctx.strokeStyle = '#D8CDB9';
      ctx.beginPath(); ctx.moveTo(240, 1750); ctx.lineTo(840, 1750); ctx.stroke();
      ctx.fillStyle = '#9A8F7E';
      ctx.font = '400 30px ' + SANS_STACK;
      ctx.fillText('@sajucheop · 내 운세는 sajucheop.com', 540, 1805);
      return cv;
    });
  }

  function saveTodayCard() {
    if (!state.todayFortune) return;
    toast('오늘 카드를 그리는 중이에요…');
    buildTodayCard().then(function (cv) {
      cv.toBlob(function (blob) {
        var mode = deliverFile(blob, '사주첩-오늘운세.png', '사주첩 — 오늘의 운세');
        track('save_today', { mode: mode });
        if (mode === 'downloaded') toast('오늘 카드를 저장했어요. 스토리에 올려보세요.');
      }, 'image/png');
    }).catch(function () {
      toast('이미지 생성에 실패했어요. 다시 시도해 주세요.');
    });
  }

  /* 홈 화면 오늘 일진 표시 */
  function renderHomeToday() {
    var t = todayDateParts();
    var p = M.dayPillarOf(t.y, t.m, t.d);
    var g = M.ganjiName(p.stem, p.branch);
    $('#home-today').innerHTML =
      '<span class="mini-dot" aria-hidden="true"></span>오늘은 ' + g.kor + '(' + g.han + ')일 · ' +
      t.m + '월 ' + t.d + '일 ' + WEEKDAYS[t.w];
  }

  /* ---------- 재방문 장치: 방문 스트릭 · 오늘의 한 문장 · PWA ---------- */

  var VISIT_KEY = 'sajucheop.visits.v1';

  function touchVisitStreak() {
    var t = todayDateParts();
    var todayKey = journalDateKey(t.y, t.m, t.d);
    var v = { last: null, streak: 0 };
    try { v = JSON.parse(localStorage.getItem(VISIT_KEY) || '{}') || {}; } catch (e) { /* 무시 */ }
    if (v.last !== todayKey) {
      var dn = M._internals.daysFromCivil(t.y, t.m, t.d);
      var yv = M._internals.civilFromDays(dn - 1);
      var yesterdayKey = journalDateKey(yv.y, yv.m, yv.d);
      v.streak = (v.last === yesterdayKey) ? (v.streak || 0) + 1 : 1;
      v.last = todayKey;
      try { localStorage.setItem(VISIT_KEY, JSON.stringify(v)); } catch (e) { /* 무시 */ }
    }
    return v.streak || 1;
  }

  function renderDailyBit(streak) {
    var el = $('#daily-bit');
    if (!el || !window.DailyQuotes) return;
    var t = todayDateParts();
    var dn = M._internals.daysFromCivil(t.y, t.m, t.d);
    var idx60 = M._internals.dayPillarIndex(dn + M._internals.JDN_EPOCH);
    var p = M.dayPillarOf(t.y, t.m, t.d);
    var st = M.STEMS[p.stem];
    $('#db-text').textContent = window.DailyQuotes.pick(p.stem, idx60);
    $('#db-tag').textContent = st.kor + st.el + '의 날 · ' + t.m + '월 ' + t.d + '일';
    var stEl = $('#db-streak');
    if (streak >= 2) {
      stEl.textContent = '연속 ' + streak + '일째 만나는 아침';
      stEl.hidden = false;
    } else {
      stEl.hidden = true;
    }
    el.hidden = false;
  }

  /* PWA 설치 제안 — 연속 3일 방문했고, 설치 안 됐고, 닫은 적 없을 때만 */
  var PWA_DISMISS_KEY = 'sajucheop.pwa.dismissed';

  function maybeShowPwaBanner(streak) {
    var banner = $('#pwa-banner');
    if (!banner || !state.deferredInstall) return;
    var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    var dismissed = false;
    try { dismissed = !!localStorage.getItem(PWA_DISMISS_KEY); } catch (e) { /* 무시 */ }
    if (streak >= 3 && !standalone && !dismissed) banner.hidden = false;
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    state.deferredInstall = e;
    maybeShowPwaBanner(state.visitStreak || 1);
  });

  /* ---------- 세운 (연운) ---------- */

  var SEUN_TEXT = {
    '비견': '중심을 다시 세우는 해', '겁재': '경쟁에 불이 붙는 해',
    '식신': '만든 것이 밥이 되는 해', '상관': '끼와 말이 앞서는 해',
    '편재': '기회가 번쩍이는 해', '정재': '차곡차곡 쌓이는 해',
    '편관': '어깨가 무거워지는 해', '정관': '이름이 반듯해지는 해',
    '편인': '공부가 깊어지는 해', '정인': '문서에 도장 찍는 해'
  };

  function renderSeun(r) {
    var nowY = todayDateParts().y;
    var me = r.pillars.day.stem;
    var rows = [];
    for (var y = nowY - 1; y <= nowY + 3; y++) {
      var s = ((y - 4) % 10 + 10) % 10;
      var b = ((y - 4) % 12 + 12) % 12;
      var sip = M.sipseongOf(me, s);
      var info = {
        stemSipseong: sip,
        branchSipseong: M.branchSipseong(me, b),
        relation: M.branchRelation(b, r.pillars.day.branch)
      };
      var score = I.scoreDay(r, info);
      var st = stemLabel(s), br = branchLabel(b);
      var relNote = info.relation === '충' ? ' · 일지와 충' :
        (info.relation === '육합' ? ' · 일지와 합' : '');
      rows.push('<div class="seun-row' + (y === nowY ? ' now' : '') + '">' +
        '<span class="sr-year">' + y + (y === nowY ? '<b>올해</b>' : '') + '</span>' +
        '<span class="sr-ganji"><span class="el-' + st.el + '">' + st.han + '</span><span class="el-' + br.el + '">' + br.han + '</span></span>' +
        '<span class="sr-text">' + SEUN_TEXT[sip] + relNote + '</span>' +
        '<span class="sr-sip">' + sip + '</span>' +
        '<span class="sr-score">' + score + '</span>' +
        '</div>');
    }
    $('#d-seun').innerHTML = rows.join('');
  }

  /* ---------- 명식 이미지 (다크 카드 · 1080×1350) ---------- */

  var CARD_EL_DARK = { '목': '#7CC79A', '화': '#F08265', '토': '#E0B04A', '금': '#A5C6F0', '수': '#74A3D6' };

  function buildMyeongsikCard() {
    var r = state.result;
    var fonts = ['600 110px ' + SERIF_STACK, '600 40px ' + SERIF_STACK, '600 34px ' + SERIF_STACK,
      '400 26px ' + SANS_STACK, '400 24px ' + SANS_STACK, '700 30px ' + SANS_STACK];
    return Promise.all(fonts.map(function (f) {
      return document.fonts.load(f, '사주첩四柱命式甲');
    })).catch(function () {}).then(function () {
      var cv = document.createElement('canvas');
      cv.width = 1080; cv.height = 1350;
      var ctx = cv.getContext('2d');
      ctx.fillStyle = '#221D17';
      ctx.fillRect(0, 0, 1080, 1350);
      ctx.strokeStyle = 'rgba(243, 237, 224, 0.3)'; ctx.lineWidth = 3;
      ctx.strokeRect(36, 36, 1008, 1278);
      ctx.strokeStyle = 'rgba(243, 237, 224, 0.12)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(52, 52, 976, 1246);
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

      /* 낙관 + 타이틀 */
      ctx.fillStyle = '#B8382D';
      rr(ctx, 498, 92, 84, 84, 14); ctx.fill();
      ctx.fillStyle = '#F6F1E8';
      ctx.font = '600 30px ' + SERIF_STACK;
      ctx.fillText('四', 540, 130);
      ctx.fillText('柱', 540, 166);
      ctx.font = '600 40px ' + SERIF_STACK;
      ctx.fillStyle = '#F3EDE0';
      ctx.fillText(state.name ? state.name + ' 님의 命式' : '나의 命式', 540, 250);
      ctx.fillStyle = '#A99E8C';
      ctx.font = '400 26px ' + SANS_STACK;
      ctx.fillText(birthDateText(r.input) + (r.input.unknownTime ? '' : ' ' + fmtTime(r.input.hour * 60 + r.input.minute)), 540, 300);

      /* 명식 4주 */
      var cols = [
        { label: '시주', p: r.pillars.hour, sipT: r.sipseong.hourStem, sipB: r.sipseong.hourBranch },
        { label: '일주', p: r.pillars.day, sipT: null, sipB: M.branchSipseong(r.pillars.day.stem, r.pillars.day.branch), isDay: true },
        { label: '월주', p: r.pillars.month, sipT: r.sipseong.monthStem, sipB: r.sipseong.monthBranch },
        { label: '년주', p: r.pillars.year, sipT: r.sipseong.yearStem, sipB: r.sipseong.yearBranch }
      ];
      var centers = [225, 435, 645, 855];
      ctx.fillStyle = 'rgba(184, 56, 45, 0.16)';
      rr(ctx, 435 - 95, 360, 190, 620, 16); ctx.fill();
      cols.forEach(function (col, i) {
        var x = centers[i];
        ctx.fillStyle = '#A99E8C';
        ctx.font = '400 26px ' + SANS_STACK;
        ctx.fillText(col.label, x, 410);
        ctx.font = '400 24px ' + SANS_STACK;
        ctx.fillStyle = col.isDay ? '#F08265' : '#8F8574';
        ctx.fillText(col.isDay ? '일간 · 나' : (col.sipT || ' '), x, 455);
        if (!col.p) {
          ctx.fillStyle = '#8F8574';
          ctx.font = '600 90px ' + SERIF_STACK;
          ctx.fillText('─', x, 600);
          ctx.fillText('─', x, 850);
          return;
        }
        var st = M.STEMS[col.p.stem], br = M.BRANCHES[col.p.branch];
        ctx.font = '600 110px ' + SERIF_STACK;
        ctx.fillStyle = CARD_EL_DARK[st.el];
        ctx.fillText(st.han, x, 610);
        ctx.fillStyle = '#A99E8C';
        ctx.font = '400 24px ' + SANS_STACK;
        ctx.fillText(st.kor + st.el, x, 655);
        ctx.font = '600 110px ' + SERIF_STACK;
        ctx.fillStyle = CARD_EL_DARK[br.el];
        ctx.fillText(br.han, x, 830);
        ctx.fillStyle = '#A99E8C';
        ctx.font = '400 24px ' + SANS_STACK;
        ctx.fillText(br.kor + br.el, x, 875);
        ctx.fillStyle = '#8F8574';
        ctx.fillText(col.sipB || ' ', x, 940);
      });

      /* 요약 */
      ctx.strokeStyle = 'rgba(243, 237, 224, 0.15)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(140, 1020); ctx.lineTo(940, 1020); ctx.stroke();
      var me = M.STEMS[r.pillars.day.stem];
      ctx.fillStyle = '#F3EDE0';
      ctx.font = '700 30px ' + SANS_STACK;
      ctx.fillText('일간 ' + me.kor + me.el + ' ' + me.han + EL_HAN[me.el] + '  ·  ' + r.strength.label +
        '  ·  ' + (r.season ? r.season.name + ' ' + r.season.wang : ''), 540, 1085);

      ctx.fillStyle = '#8F8574';
      ctx.font = '400 24px ' + SANS_STACK;
      ctx.fillText('절기 시각 기준 정밀 만세력', 540, 1210);
      ctx.fillStyle = '#CFC4B0';
      ctx.font = '400 26px ' + SANS_STACK;
      ctx.fillText('sajucheop.com', 540, 1252);
      return cv;
    });
  }

  function saveMyeongsikCard() {
    if (!state.result) return;
    toast('명식 이미지를 그리는 중이에요…');
    buildMyeongsikCard().then(function (cv) {
      cv.toBlob(function (blob) {
        var mode = deliverFile(blob, '사주첩-명식-' + (state.name || '나의사주') + '.png', '사주첩 — 나의 명식');
        track('save_myeongsik', { mode: mode });
        if (mode === 'downloaded') toast('명식 이미지를 저장했어요.');
      }, 'image/png');
    }).catch(function () {
      toast('이미지 생성에 실패했어요. 다시 시도해 주세요.');
    });
  }

  /* ---------- 출산·결혼 택일 (베타) ---------- */

  var WD = ['일', '월', '화', '수', '목', '금', '토'];

  function initTaegil() {
    var ySel = $('#tg-year'), mSel = $('#tg-month'), dSel = $('#tg-day');
    var now = new Date();
    for (var y = now.getFullYear(); y <= now.getFullYear() + 1; y++) {
      var oy = document.createElement('option');
      oy.value = y; oy.textContent = y + '년';
      ySel.appendChild(oy);
    }
    for (var m = 1; m <= 12; m++) {
      var om = document.createElement('option');
      om.value = m; om.textContent = m + '월';
      mSel.appendChild(om);
    }
    function refreshTgDays() {
      var max = M._internals.daysInMonth(+ySel.value, +mSel.value);
      var keep = Math.min(+dSel.value || 1, max);
      dSel.innerHTML = '';
      for (var d = 1; d <= max; d++) {
        var od = document.createElement('option');
        od.value = d; od.textContent = d + '일';
        dSel.appendChild(od);
      }
      dSel.value = keep;
    }
    // 기본값: 두 달 뒤
    var def = M._internals.civilFromDays(M._internals.daysFromCivil(now.getFullYear(), now.getMonth() + 1, now.getDate()) + 60);
    ySel.value = def.y; mSel.value = def.m;
    refreshTgDays();
    dSel.value = def.d;
    ySel.addEventListener('change', refreshTgDays);
    mSel.addEventListener('change', refreshTgDays);
    $('#btn-taegil-scan').addEventListener('click', function () {
      if (taegilMode() === 'wedding') runWeddingScan();
      else runTaegilScan();
    });

    /* 결혼 택일 입력 */
    ['a', 'b'].forEach(function (who) {
      var wy = $('#tgw-' + who + '-year'), wm = $('#tgw-' + who + '-month'), wd = $('#tgw-' + who + '-day');
      for (var yy = now.getFullYear(); yy >= 1930; yy--) {
        var o = document.createElement('option');
        o.value = yy; o.textContent = yy + '년';
        wy.appendChild(o);
      }
      for (var mm = 1; mm <= 12; mm++) {
        var o2 = document.createElement('option');
        o2.value = mm; o2.textContent = mm + '월';
        wm.appendChild(o2);
      }
      function refresh() {
        var max = M._internals.daysInMonth(+wy.value, +wm.value);
        var keep = Math.min(+wd.value || 1, max);
        wd.innerHTML = '';
        for (var d = 1; d <= max; d++) {
          var od = document.createElement('option');
          od.value = d; od.textContent = d + '일';
          wd.appendChild(od);
        }
        wd.value = keep;
      }
      wy.value = who === 'a' ? 1995 : 1995;
      refresh();
      wy.addEventListener('change', refresh);
      wm.addEventListener('change', refresh);
    });
    var wYear = $('#tgw-year'), wMonth = $('#tgw-month');
    for (var wy2 = now.getFullYear(); wy2 <= now.getFullYear() + 2; wy2++) {
      var oy2 = document.createElement('option');
      oy2.value = wy2; oy2.textContent = wy2 + '년';
      wYear.appendChild(oy2);
    }
    for (var wm2 = 1; wm2 <= 12; wm2++) {
      var om2 = document.createElement('option');
      om2.value = wm2; om2.textContent = wm2 + '월부터';
      wMonth.appendChild(om2);
    }
    var wDef = M._internals.civilFromDays(M._internals.daysFromCivil(now.getFullYear(), now.getMonth() + 1, now.getDate()) + 90);
    wYear.value = wDef.y; wMonth.value = wDef.m;

    $('#tg-load-me').addEventListener('click', function () {
      var p = loadProfile();
      if (!p) { toast('저장된 사주가 없어요. 홈에서 내 사주를 먼저 봐주세요.'); return; }
      $('#tgw-a-year').value = p.year;
      $('#tgw-a-year').dispatchEvent(new Event('change'));
      $('#tgw-a-month').value = p.month;
      $('#tgw-a-month').dispatchEvent(new Event('change'));
      $('#tgw-a-day').value = p.day;
      toast((p.name ? p.name + ' 님' : '저장된') + ' 정보를 불러왔어요.');
    });

    document.querySelectorAll('input[name="tgmode"]').forEach(function (rd) {
      rd.addEventListener('change', function () {
        var wedding = taegilMode() === 'wedding';
        $('#tg-baby-form').hidden = wedding;
        $('#tg-wedding-form').hidden = !wedding;
        $('#tg-medical-notice').hidden = wedding;
        $('#tg-results').innerHTML = '';
        $('#tg-intro-text').innerHTML = wedding
          ? '두 사람 모두에게 좋은 기운이 드는 날을 찾아드립니다. 각자의 일간에 드는 <b>십성</b>과 일지의 <b>합·충</b>을 함께 채점하고, 어느 한쪽에 충이 드는 날은 후보에서 뺍니다.'
          : '병원과 조율할 수 있는 범위 안에서, 아기가 <b>균형 잡힌 명식</b>을 갖는 날과 시간대를 찾아드립니다.';
      });
    });
  }

  function taegilMode() {
    var el = document.querySelector('input[name="tgmode"]:checked');
    return el ? el.value : 'baby';
  }

  function runWeddingScan() {
    var label = $('#tg-scan-label');
    label.textContent = '두 사람의 흐름을 계산하는 중…';
    track('taegil_scan', { mode: 'wedding' });
    setTimeout(function () {
      try {
        var resA = M.compute({ year: +$('#tgw-a-year').value, month: +$('#tgw-a-month').value, day: +$('#tgw-a-day').value, unknownTime: true, gender: 'F', applySolarTime: true });
        var resB = M.compute({ year: +$('#tgw-b-year').value, month: +$('#tgw-b-month').value, day: +$('#tgw-b-day').value, unknownTime: true, gender: 'F', applySolarTime: true });
        var startY = +$('#tgw-year').value, startM = +$('#tgw-month').value;
        var span = +$('#tgw-span').value;
        var weekendOnly = $('#tgw-weekend').checked;
        var t = todayDateParts();
        var todayDn = M._internals.daysFromCivil(t.y, t.m, t.d);
        var out = [], excluded = 0;
        for (var k = 0; k < span; k++) {
          var mm = startM + k, yy = startY + Math.floor((mm - 1) / 12);
          mm = ((mm - 1) % 12) + 1;
          var dim = M._internals.daysInMonth(yy, mm);
          for (var d = 1; d <= dim; d++) {
            if (M._internals.daysFromCivil(yy, mm, d) < todayDn) continue;
            var dow = new Date(yy, mm - 1, d).getDay();
            if (weekendOnly && dow !== 0 && dow !== 6) continue;
            var infoA = M.todayInfo(resA, yy, mm, d);
            var infoB = M.todayInfo(resB, yy, mm, d);
            if (infoA.relation === '충' || infoB.relation === '충') { excluded++; continue; }
            var sA = I.scoreDay(resA, infoA), sB = I.scoreDay(resB, infoB);
            var score = Math.round((sA + sB) / 2);
            var reasons = [];
            if (sA >= 65 && sB >= 65) { score += 5; reasons.push('두 사람 모두에게 순풍이 부는 날'); }
            if (infoA.relation === '육합' || infoA.relation === '삼합') reasons.push('나의 일지와 합이 드는 날');
            if (infoB.relation === '육합' || infoB.relation === '삼합') reasons.push('상대의 일지와 합이 드는 날');
            out.push({ y: yy, m: mm, d: d, dow: dow, pillar: infoA.pillar, score: Math.min(99, score), sA: sA, sB: sB, sipA: infoA.stemSipseong, sipB: infoB.stemSipseong, reasons: reasons });
          }
        }
        out.sort(function (a, b) { return b.score - a.score || a.m - b.m || a.d - b.d; });
        var top = out.slice(0, 5);
        $('#tg-results').innerHTML = (top.length ? top.map(function (c, i) {
          var g = M.ganjiName(c.pillar.stem, c.pillar.branch);
          return '<div class="tg-card">' +
            '<div class="tg-head">' +
            '<span class="tg-rank">' + (i + 1) + '</span>' +
            '<span class="tg-date">' + c.y + '년 ' + c.m + '월 ' + c.d + '일 (' + WD[c.dow] + ')</span>' +
            '<span class="tg-ganji">' + g.kor + '일</span>' +
            '<span class="tg-score">' + c.score + '<small>점</small></span>' +
            '</div>' +
            '<div class="tg-hours">' +
            '<div class="tg-hour"><span class="th-rank">나</span><span class="th-label">' + c.sipA + josa(c.sipA, '이', '가') + ' 드는 날</span><span class="th-score">' + c.sA + '점</span></div>' +
            '<div class="tg-hour"><span class="th-rank">상대</span><span class="th-label">' + c.sipB + josa(c.sipB, '이', '가') + ' 드는 날</span><span class="th-score">' + c.sB + '점</span></div>' +
            '</div>' +
            (c.reasons.length ? '<div class="pill-row" style="margin-top: 10px;">' +
              c.reasons.map(function (rs) { return '<span class="pill">' + rs + '</span>'; }).join('') + '</div>' : '') +
            '<div>' + gcalLink(c.y, c.m, c.d, '결혼 택일 후보 · ' + g.kor + '일',
              '두 사람 평균 ' + c.score + '점 — 사주첩 sajucheop.com') + '</div>' +
            '</div>';
        }).join('') : '<p class="purpose-empty" style="margin: 20px;">조건에 맞는 날이 없어요. 기간을 넓히거나 주말만 보기를 꺼보세요.</p>') +
        '<p class="form-microcopy" style="margin: 16px 20px 0;">후보 중 어느 한쪽 일지와 충이 드는 날 ' + excluded + '일은 제외했어요. 점수는 참고용 지수입니다.</p>';
      } catch (e) {
        toast('계산 중 문제가 생겼어요. 다시 시도해 주세요.');
        if (window.console) console.error(e);
      }
      label.textContent = '좋은 날 찾기';
    }, 30);
  }

  function runTaegilScan() {
    var label = $('#tg-scan-label');
    label.textContent = '아기 명식을 계산하는 중…';
    track('taegil_scan', { range: +$('#tg-range').value });
    setTimeout(function () {
      try {
        var gender = (document.querySelector('input[name="gender"]:checked') || { value: 'F' }).value;
        var list = window.Taegil.scanDates(+$('#tg-year').value, +$('#tg-month').value, +$('#tg-day').value,
          +$('#tg-range').value, gender);
        var top = list.slice(0, 5);
        $('#tg-results').innerHTML = top.map(function (c, i) {
          var g = M.ganjiName(c.dayPillar.stem, c.dayPillar.branch);
          var dow = WD[new Date(c.y, c.m - 1, c.d).getDay()];
          var hours = c.bestHours.map(function (h, hi) {
            var hg = M.ganjiName(h.hourGanji.stem, h.hourGanji.branch);
            return '<div class="tg-hour"><span class="th-rank">' + (hi + 1) + '순위</span>' +
              '<span class="th-label">' + h.label + '</span>' +
              '<span class="th-ganji">' + hg.kor + '시</span>' +
              '<span class="th-score">' + h.score + '점</span></div>';
          }).join('');
          return '<div class="tg-card">' +
            '<div class="tg-head">' +
            '<span class="tg-rank">' + (i + 1) + '</span>' +
            '<span class="tg-date">' + c.m + '월 ' + c.d + '일 (' + dow + ')</span>' +
            '<span class="tg-ganji">' + g.kor + '(' + g.han + ')일</span>' +
            '<span class="tg-score">' + c.score + '<small>점</small></span>' +
            '</div>' +
            '<div class="pill-row" style="margin-top: 10px;">' +
            c.reasons.slice(0, 3).map(function (rs) { return '<span class="pill">' + rs + '</span>'; }).join('') +
            '</div>' +
            (c.cautions.length ? '<div class="tg-caution">유의 — ' + c.cautions.join(' · ') + '</div>' : '') +
            '<div class="tg-hours">' + hours + '</div>' +
            '<div>' + gcalLink(c.y, c.m, c.d, '출산 택일 후보 · ' + g.kor + '일',
              c.reasons.slice(0, 2).join(' · ') + ' — 사주첩 sajucheop.com') + '</div>' +
            '<button type="button" class="btn-outline tg-preview" style="height: 44px; margin-top: 12px; font-size: 13.5px;" ' +
            'data-y="' + c.y + '" data-m="' + c.m + '" data-d="' + c.d + '" data-h="' + c.bestHours[0].repHour + '">' +
            '이 날짜·시간의 아기 사주 미리 보기</button>' +
            '</div>';
        }).join('') +
        '<p class="form-microcopy" style="margin: 16px 20px 0;">점수는 오행 균형·충 유무·강약 등을 지수화한 참고 값입니다. 후보 ' + list.length + '일 중 상위 5일을 보여드려요.</p>';

        $('#tg-results').querySelectorAll('.tg-preview').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var solarRadio = document.querySelector('input[name="calendar"][value="solar"]');
            if (solarRadio) solarRadio.checked = true;
            $('#in-year').value = btn.getAttribute('data-y');
            $('#in-year').dispatchEvent(new Event('change'));
            $('#in-month').value = btn.getAttribute('data-m');
            $('#in-month').dispatchEvent(new Event('change'));
            $('#in-day').value = btn.getAttribute('data-d');
            $('#in-time').value = String(btn.getAttribute('data-h')).padStart(2, '0') + ':00';
            setUnknownTime(false);
            $('#in-name').value = '';
            runCompute();
          });
        });
      } catch (e) {
        toast('계산 중 문제가 생겼어요. 다시 시도해 주세요.');
        if (window.console) console.error(e);
      }
      label.textContent = '좋은 날 찾기';
    }, 30);
  }

  /* ---------- 전체 풀이 리포트 (무료 v1 · 인쇄/PDF) ---------- */

  function renderReport() {
    var r = state.result;
    if (!r) return;
    var p = r.pillars;
    var me = M.STEMS[p.day.stem];
    var ch = C.of(me.han);
    var t = todayDateParts();
    var inp = r.input;

    function pillarCol(name, pillar, sipTop, sipBot, isDay) {
      if (!pillar) {
        return '<div class="rp-col"><div class="l">' + name + '</div><div class="s">&nbsp;</div>' +
          '<div class="h" style="color: #B5AA97;">─</div><div class="k">시간</div>' +
          '<div class="h" style="color: #B5AA97;">─</div><div class="k">모름</div><div class="s">&nbsp;</div></div>';
      }
      var st = stemLabel(pillar.stem), br = branchLabel(pillar.branch);
      return '<div class="rp-col' + (isDay ? ' day' : '') + '">' +
        '<div class="l">' + name + '</div>' +
        '<div class="s">' + (isDay ? '<b style="color: #B8382D;">일간 · 나</b>' : (sipTop || '&nbsp;')) + '</div>' +
        '<div class="h el-' + st.el + '">' + st.han + '</div><div class="k">' + st.kor + '</div>' +
        '<div class="h el-' + br.el + '">' + br.han + '</div><div class="k">' + br.kor + '</div>' +
        '<div class="s">' + (sipBot || '&nbsp;') + '</div></div>';
    }

    var elBars = EL_ORDER.map(function (el) {
      var c = r.elements[el];
      var maxC = Math.max.apply(null, EL_ORDER.map(function (e) { return r.elements[e]; }).concat([1]));
      var zero = c === 0;
      return '<div class="el-bar-row">' +
        '<div class="el-name' + (zero ? ' zero' : '') + '">' + EL_HAN[el] + ' ' + el + '</div>' +
        '<div class="track">' + (zero ? '' : '<div class="fill" style="width: ' + Math.round(c / maxC * 100) + '%; background: var(' + EL_VAR[el] + ');"></div>') + '</div>' +
        '<div class="el-count' + (zero ? ' zero' : '') + '">' + c + '</div></div>';
    }).join('');

    var sip = I.sipseongSummary(r);
    var ilgan = I.ilganText(me.han);

    var daeunItems = r.daeun.list.map(function (dw) {
      var g = M.ganjiName(dw.stem, dw.branch);
      var dt = I.daeunText(dw.sipseong);
      return '<div class="rp-daeun">' +
        '<div class="rd-head"><span class="rd-range">' + dw.startAge + '~' + dw.endAge + '세</span>' +
        '<span class="rd-ganji">' + g.kor + '(' + g.han + ')</span>' +
        '<span class="rd-sip">' + dw.sipseong + (dw.current ? ' · 지금' : '') + '</span></div>' +
        '<div class="rd-title">' + dt.title + '</div>' +
        '<div class="rd-body">' + dt.body + '</div></div>';
    }).join('');

    var babySection = '';
    if (inp.year >= todayDateParts().y - 5) {
      var baby = I.babyReading(r);
      babySection =
        '<div class="report-section"><div class="rp-h">아기를 위한 안내</div>' +
        '<p class="rp-line">' + baby.temper + '</p>' +
        '<div class="rp-kv"><span class="kv-label accent">양육</span><div class="kv-text">' + baby.care + '</div></div>' +
        '<div class="rp-kv"><span class="kv-label">이름</span><div class="kv-text">' + baby.nameHint + '</div></div>' +
        '<p class="rp-line" style="color: #9A8F7E;">아기의 건강·발달 판단은 언제나 소아청소년과 의료진과 함께하세요.</p></div>';
    }

    var basisNotes = [
      '절기(節氣)는 태양의 시황경을 천문 계산해 시각 단위로 판정했습니다.',
      inp.applySolarTime ? '진태양시 보정(서울 기준 −32분)을 적용했습니다.' : '진태양시 보정 없이 표준시 그대로 계산했습니다.',
      '자시(子時)는 야자시 방식으로 처리했습니다.'
    ];
    if (r.time.dstEraWarning) basisNotes.push('출생 연도에 서머타임이 시행되어, 실제 출생 시각과 1시간 차이가 있을 수 있습니다.');
    if (r.jeolipWarning) basisNotes.push('절기 경계에 가까운 출생이라, 출생 시각에 따라 월주가 달라질 수 있습니다.');

    $('#report-body').innerHTML =
      '<div class="rp-cover">' +
      '<div class="rp-overline">四柱帖 · 전체 풀이 리포트</div>' +
      '<h2>' + (state.name ? G.escapeHtml(state.name) + ' 님의 사주' : '나의 사주') + '</h2>' +
      '<div class="rp-birth">' + birthDateText(inp) +
      (inp.unknownTime ? ' (시간 모름)' : ' ' + fmtTime(inp.hour * 60 + inp.minute)) +
      (state.calInfo ? '' : ' · 양력') + ' · ' + (inp.gender === 'F' ? '여성' : '남성') + '</div>' +
      '<div class="rp-date">발행일 ' + t.y + '년 ' + t.m + '월 ' + t.d + '일 · sajucheop.com</div>' +
      '</div>' +

      '<div class="report-section"><div class="rp-h">命式 — 나의 여덟 글자</div>' +
      '<div class="rp-pillars">' +
      pillarCol('시주', p.hour, r.sipseong.hourStem, r.sipseong.hourBranch, false) +
      pillarCol('일주', p.day, null, M.branchSipseong(p.day.stem, p.day.branch), true) +
      pillarCol('월주', p.month, r.sipseong.monthStem, r.sipseong.monthBranch, false) +
      pillarCol('년주', p.year, r.sipseong.yearStem, r.sipseong.yearBranch, false) +
      '</div>' +
      '<div class="rp-stats">' +
      '<span>일간 <b>' + me.kor + me.el + ' ' + me.han + EL_HAN[me.el] + '</b></span>' +
      '<span>강약 <b>' + r.strength.label + '</b></span>' +
      '<span>계절 <b>' + (r.season ? r.season.name + ' · ' + r.season.wang : '─') + '</b></span>' +
      '</div>' +
      '<p class="rp-line">' + ilgan.body + '</p></div>' +

      '<div class="report-section"><div class="rp-h">나의 사주 캐릭터</div>' +
      '<div class="rp-char"><span class="rp-emblem">' + C.emblemSvg(me.han, 54, 'light') + '</span>' +
      '<div class="rc-info">' +
      '<div class="rc-name">' + ch.name + '</div>' +
      '<div class="rc-meta">「 ' + ch.metaphor + ' 」</div>' +
      '<div class="rc-ess">' + ch.essence + '</div>' +
      '</div></div>' +
      '<p class="rp-line">' + ch.body + '</p>' +
      '<div class="rp-kv"><span class="kv-label accent">' + r.strength.label + '</span>' +
      '<div class="kv-text">' + ch.variant[r.strength.label] + '</div></div>' +
      '<div class="rp-kv"><span class="kv-label">강점</span><div class="kv-text">' +
      ch.strengths.map(function (s) { return '<div class="kv-item">· ' + s + '</div>'; }).join('') + '</div></div>' +
      '<div class="rp-kv"><span class="kv-label">조심</span><div class="kv-text">' +
      ch.cautions.map(function (s) { return '<div class="kv-item">· ' + s + '</div>'; }).join('') + '</div></div></div>' +

      babySection +

      '<div class="report-section"><div class="rp-h">오행의 균형 — ' + I.elementHeadline(r) + '</div>' +
      '<div style="display: flex; flex-direction: column; gap: 11px;">' + elBars + '</div>' +
      '<p class="rp-line" style="margin-top: 14px;">' + I.elementComment(r) + '</p></div>' +

      '<div class="report-section"><div class="rp-h">십성 구성 — ' + sip.title + '</div>' +
      '<p class="rp-line">' + sip.body + '</p>' +
      '<p class="rp-line">' + I.strengthText(r.strength.label) + '</p></div>' +

      '<div class="report-section"><div class="rp-h">대운 — 인생의 여덟 계절</div>' +
      '<p class="rp-line">' + r.daeun.su + '살에 첫 대운이 들어와 10년마다 ' + (r.daeun.forward ? '순행' : '역행') + '으로 바뀝니다.</p>' +
      daeunItems + '</div>' +

      '<div class="report-section"><div class="rp-h">계산 기준과 안내</div>' +
      '<p class="rp-line">' + basisNotes.join(' ') + '</p>' +
      '<p class="rp-line" style="color: #9A8F7E;">본 리포트는 전통 명리학 이론을 바탕으로 한 참고용 콘텐츠입니다. 중요한 결정은 스스로의 판단을 따르세요. © 사주첩</p></div>';
  }

  /* ---------- 그래프 PNG 저장 ---------- */

  function saveGraphPng() {
    var svgEl = $('#d-graph svg');
    if (!svgEl) return;
    var clone = svgEl.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', '640');
    clone.setAttribute('height', '400');
    var src = new XMLSerializer().serializeToString(clone);
    var blob = new Blob([src], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = 640; canvas.height = 400;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(0, 0, 640, 400);
      ctx.drawImage(img, 0, 0, 640, 400);
      URL.revokeObjectURL(url);
      canvas.toBlob(function (blob) {
        if (deliverFile(blob, '사주첩-대운그래프.png', '사주첩 — 대운 그래프') === 'downloaded') {
          toast('그래프 이미지를 저장했어요.');
        }
      }, 'image/png');
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      toast('이미지 저장에 실패했어요. 다시 시도해 주세요.');
    };
    img.src = url;
  }

  /* ---------- 공유 ---------- */

  function shareResult() {
    var r = state.result;
    if (!r) return;
    var p = r.pillars;
    var text = (state.name ? state.name + ' 님의' : '나의') + ' 사주 — ' +
      M.ganjiName(p.year.stem, p.year.branch).kor + '년 ' +
      M.ganjiName(p.month.stem, p.month.branch).kor + '월 ' +
      M.ganjiName(p.day.stem, p.day.branch).kor + '일' +
      (p.hour ? ' ' + M.ganjiName(p.hour.stem, p.hour.branch).kor + '시' : '') +
      ' · 일간 ' + M.STEMS[p.day.stem].kor + M.STEMS[p.day.stem].el;
    if (navigator.share) {
      navigator.share({ title: '사주첩', text: text }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        toast('사주 요약을 복사했어요.');
      });
    }
  }

  /* ---------- 이벤트 바인딩 ---------- */

  function initEvents() {
    document.querySelectorAll('[data-back]').forEach(function (btn) {
      btn.addEventListener('click', function () { showView(btn.getAttribute('data-back')); });
    });
    $('#btn-to-daeun').addEventListener('click', function () { showView('daeun'); });
    $('#btn-to-today').addEventListener('click', function () { showView('today'); });
    $('#btn-share-today').addEventListener('click', shareToday);
    $('#btn-share-today2').addEventListener('click', shareToday);
    $('#btn-to-calendar').addEventListener('click', function () { showView('calendar'); });
    $('#btn-home-gunghap').addEventListener('click', startGunghapFromHome);
    $('#btn-rank-invite').addEventListener('click', makeGunghapLink);
    $('#btn-to-ranking').addEventListener('click', openRanking);
    $('#menu-ranking').addEventListener('click', function (e) {
      e.preventDefault();
      $('#site-menu').hidden = true;
      openRanking();
    });
    /* 해시만 바뀌는 이동(뒤로가기·직접 링크)에서도 순위가 그려지도록 */
    window.addEventListener('hashchange', function () {
      if (location.hash === '#ranking') openRanking();
      if (location.hash === '#stamps') openStamps();
    });
    $('#menu-stamps').addEventListener('click', function (e) {
      e.preventDefault();
      $('#site-menu').hidden = true;
      openStamps();
    });
    $('#btn-open-stamps').addEventListener('click', openStamps);
    $('#db-stamps').addEventListener('click', openStamps);
    $('#btn-stamp-share').addEventListener('click', shareStamps);
    $('#btn-stamp-today').addEventListener('click', function () {
      if (state.result) { showView('today'); return; }
      showView('home');
      $('#saju-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast('내 사주를 먼저 봐야 오늘의 운세와 도장을 받을 수 있어요.');
    });
    $('#btn-to-taegil').addEventListener('click', function () { showView('taegil'); });
    $('#menu-taegil').addEventListener('click', function (e) {
      e.preventDefault();
      $('#site-menu').hidden = true;
      showView('taegil');
    });
    $('#btn-to-character').addEventListener('click', function () { showView('character'); });
    $('#btn-char-to-today').addEventListener('click', function () { showView('today'); });
    $('#btn-save-card').addEventListener('click', saveCharacterCard);
    $('#btn-share-card').addEventListener('click', shareCharacterCard);
    $('#btn-book-add').addEventListener('click', addToBook);
    $('#btn-alarm').addEventListener('click', downloadMorningAlarm);
    $('#pwa-install').addEventListener('click', function () {
      if (!state.deferredInstall) return;
      state.deferredInstall.prompt();
      state.deferredInstall.userChoice.then(function () {
        $('#pwa-banner').hidden = true;
        state.deferredInstall = null;
      });
      track('pwa_prompt');
    });
    $('#pwa-dismiss').addEventListener('click', function () {
      $('#pwa-banner').hidden = true;
      try { localStorage.setItem(PWA_DISMISS_KEY, '1'); } catch (e) { /* 무시 */ }
    });
    document.querySelectorAll('#jr-btns .jr-btn').forEach(function (b) {
      b.addEventListener('click', function () { markJournal(+b.getAttribute('data-jr')); });
    });
    $('#btn-make-gunghap').addEventListener('click', makeGunghapLink);
    $('#btn-make-gunghap2').addEventListener('click', makeGunghapLink);
    $('#btn-make-gunghap3').addEventListener('click', makeGunghapLink);
    $('#btn-share-gunghap').addEventListener('click', shareGunghap);
    $('#btn-return-gunghap').addEventListener('click', shareGunghapResultLink);
    $('#btn-kakao-return').addEventListener('click', kakaoResult);
    $('#btn-kakao-result').addEventListener('click', kakaoResult);
    initKakao();
    $('#btn-save-gunghap-card').addEventListener('click', saveGunghapCard);
    $('#btn-return-sms').addEventListener('click', returnBySms);
    $('#gh-return-link').addEventListener('click', function () { this.select(); });
    $('#btn-my-result').addEventListener('click', function () {
      if (state.pairView) {
        state.pairView = false;
        state.gunghapUrl = null;
        try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* 무시 */ }
        showView('home');
      } else {
        showView('result');
      }
    });
    /* 구글 캘린더 링크 클릭 집계 (위임) */
    document.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== document) {
        if (t.classList && t.classList.contains('gcal-link')) { track('gcal_add'); break; }
        t = t.parentNode;
      }
    });
    $('#ib-dismiss').addEventListener('click', dismissInvite);
    $('#cal-prev').addEventListener('click', function () { moveMonth(-1); });
    $('#cal-next').addEventListener('click', function () { moveMonth(1); });
    $('#btn-ics').addEventListener('click', downloadIcs);
    $('#rc-go').addEventListener('click', function () {
      var p = loadProfile();
      if (!p) return;
      fillFormFromProfile(p);
      runCompute();
      if (state.result) showView('today');
    });
    $('#rc-clear').addEventListener('click', function () {
      clearProfile();
      toast('저장된 정보를 지웠어요.');
    });
    $('#btn-save-graph').addEventListener('click', saveGraphPng);
    $('#btn-save-graph-top').addEventListener('click', saveGraphPng);
    $('#btn-save-myeongsik').addEventListener('click', saveMyeongsikCard);
    $('#btn-save-today').addEventListener('click', saveTodayCard);
    $('#btn-report').addEventListener('click', function () {
      track('open_report');
      renderReport();
      showView('report');
    });
    $('#btn-print').addEventListener('click', function () { window.print(); });
    $('#btn-print-top').addEventListener('click', function () { window.print(); });
    $('#btn-share').addEventListener('click', shareResult);
    document.querySelectorAll('[data-todo]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        toast('페이지 준비 중이에요.');
      });
    });

    /* 헤더 메뉴 */
    var menuBtn = $('#btn-menu'), menuPop = $('#site-menu');
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menuPop.hidden;
      menuPop.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!menuPop.hidden && !menuPop.contains(e.target)) {
        menuPop.hidden = true;
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  initForm();
  initTaegil();
  initEvents();
  renderHomeToday();
  state.visitStreak = touchVisitStreak();
  renderDailyBit(state.visitStreak);
  maybeShowPwaBanner(state.visitStreak);
  /* 입력 폼 자동 채움 — 첩의 '나' 장 우선, 없으면 마지막 계산 프로필 */
  var savedProfile = bookSelf() || loadProfile();
  if (savedProfile) fillFormFromProfile(savedProfile);
  /* 명식첩 시드: 예전 단일 프로필이 있으면 첫 장으로 옮겨 끼움 */
  if (savedProfile && !loadBook().length) {
    try {
      var seed = JSON.parse(JSON.stringify(savedProfile));
      seed.id = 'b' + new Date().getTime();
      seed.self = true;
      saveBookList([seed]);
    } catch (e) { /* 무시 */ }
  }
  renderBook();
  renderGunghapEntry();
  renderDailyStamps();
  renderResumeChip();
  var pairData = parsePairFromHash();
  if (pairData) {
    try {
      var pairA = M.compute(pairData.a), pairB = M.compute(pairData.b);
      state.pairView = true;
      state.gunghapUrl = location.origin + location.pathname + '#g=' + G.encodePair(pairData.a, pairData.b);
      /* 링크를 받은 원 발신자(a) 시점: a가 '나' 자리, b가 상대 자리 */
      renderGunghap(pairB, pairA, pairData.b.name || '상대', pairData.a.name || '상대');
      recordGunghap(pairData.b);
      updateGunghapButtons('pair');
      track('gunghap_pair_view');
    } catch (e) {
      state.pairView = false;
      if (window.console) console.error(e);
    }
  }
  if (!state.pairView) {
    state.invite = parseInviteFromHash();
    if (state.invite) showInviteBanner();
  }
  if (location.hash === '#tojeong') {
    location.replace('tojeong/'); /* 예전 해시 링크 → 독립 페이지 */
  } else if (location.hash === '#naming') {
    location.replace('naming/');
  } else if (state.pairView) {
    showView('gunghap');
  } else if (location.hash === '#ranking') {
    openRanking();
  } else if (location.hash === '#stamps') {
    openStamps();
  } else {
    showView(location.hash === '#taegil' ? 'taegil' : 'home');
  }

  /* 디버그·검증용 최소 노출 */
  window.App = { buildIcs: buildIcs, monthData: monthData, purposeTopDays: purposeTopDays, buildCharacterCard: buildCharacterCard, buildMyeongsikCard: buildMyeongsikCard, buildGunghapCard: buildGunghapCard, deliverFile: deliverFile, isInAppBrowser: isInAppBrowser, _state: state };
})();
