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
    refreshDays();
    yearSel.addEventListener('change', refreshDays);
    monthSel.addEventListener('change', refreshDays);

    function refreshDays() {
      var y = +yearSel.value, mo = +monthSel.value;
      var max = M._internals.daysInMonth(y, mo);
      var keep = Math.min(+daySel.value || 1, max);
      daySel.innerHTML = '';
      for (var d = 1; d <= max; d++) {
        var od = document.createElement('option');
        od.value = d; od.textContent = d + '일';
        daySel.appendChild(od);
      }
      daySel.value = keep;
    }

    // 시간 모름 토글
    $('#btn-unknown-time').addEventListener('click', function () {
      setUnknownTime(!isUnknownTime());
    });

    // 음력(준비 중) 안내
    $('#lunar-label').addEventListener('click', function (e) {
      e.preventDefault();
      toast('음력 입력은 준비 중이에요. 지금은 양력으로 입력해 주세요.');
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
      var input = {
        year: +$('#in-year').value,
        month: +$('#in-month').value,
        day: +$('#in-day').value,
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
      renderResult(result);
      renderCharacter(result);
      renderDaeun(result);
      renderToday(result);
      renderCalendar();
      saveProfile(input);
      track('saju_compute', { unknown_time: input.unknownTime ? 1 : 0 });
      if (state.invite) {
        var partnerResult = M.compute(state.invite);
        renderGunghap(partnerResult, result);
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
        applySolarTime: input.applySolarTime
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
    $('#in-year').value = p.year;
    $('#in-year').dispatchEvent(new Event('change'));
    $('#in-month').value = p.month;
    $('#in-month').dispatchEvent(new Event('change'));
    $('#in-day').value = p.day;
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
    if (!p) { chip.hidden = true; return; }
    $('#rc-name').textContent = p.name ? p.name + ' 님' : '저장된 사주';
    $('#rc-birth').textContent = p.year + '.' + p.month + '.' + p.day +
      (p.unknownTime ? ' · 시간 모름' : ' · ' + fmtTime(p.hour * 60 + p.minute));
    chip.hidden = false;
  }

  /* ---------- 결과 렌더 ---------- */

  function renderResult(r) {
    var inp = r.input;
    $('#r-name').textContent = state.name ? state.name + ' 님의 사주' : '나의 사주';

    var birthBits = [
      inp.year + '년 ' + inp.month + '월 ' + inp.day + '일' +
        (inp.unknownTime ? '' : ' ' + fmtTime(inp.hour * 60 + inp.minute)),
      '양력',
      inp.gender === 'F' ? '여성' : '남성'
    ];
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
    $('#r-foot').innerHTML =
      '<div>일간 <b>' + me.kor + me.el + ' ' + me.han + EL_HAN[me.el] + '</b></div>' +
      '<div>강약 <b>' + r.strength.label + '</b></div>' +
      '<div>계절 <b>' + (r.season ? r.season.name + ' · ' + r.season.wang : '─') + '</b></div>';

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
  }

  function dismissInvite() {
    state.invite = null;
    $('#invite-banner').hidden = true;
    $('#btn-submit-label').textContent = '내 사주 풀어보기';
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* 무시 */ }
  }

  function renderGunghap(partnerResult, myResult) {
    var partnerName = (state.invite && state.invite.name) || '상대';
    var myName = state.name || '나';
    var gh = G.compute(partnerResult, myResult, partnerName, myName);
    state.gunghap = { score: gh.score, tier: gh.tier, partnerName: partnerName };

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
    var text = (state.name || '나') + ' × ' + g.partnerName + ' 궁합 ' + g.score + '점 — ' +
      g.tier + ' · 사주첩';
    if (navigator.share) {
      navigator.share({ title: '사주첩 — 궁합 결과', text: text }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        toast('궁합 결과를 복사했어요.');
      });
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
      days.push({
        d: d,
        info: info,
        score: I.scoreDay(state.result, info)
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
        detail.innerHTML = '<b>' + c.m + '월 ' + dd.d + '일 · ' + g.kor + '(' + g.han + ')일</b><br>' +
          '흐름 ' + dd.score + '점 — ' + dd.info.stemSipseong +
          josa(dd.info.stemSipseong, '이', '가') + ' 드는 날' + relNote;
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
              '<span class="pd-reason">' + g.kor + '일 — ' + p.reason + '</span>' +
              '</div>';
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

  /* 반환: 'shared' | 'blocked' | 'downloaded' */
  function deliverFile(blob, filename, shareTitle) {
    var file = null, canShare = false;
    try {
      file = new File([blob], filename, { type: blob.type });
      canShare = isMobileUA() && !!(navigator.canShare && navigator.canShare({ files: [file] }));
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

  function icsEscape(s) {
    return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
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
    var count = 0;
    for (var i = 0; i < 30; i++) {
      var cv = M._internals.civilFromDays(dn0 + i);
      var info = M.todayInfo(state.result, cv.y, cv.m, cv.d);
      var score = I.scoreDay(state.result, info);
      var isGood = score >= 80;
      var isChung = info.relation === '충';
      if (!isGood && !isChung) continue;
      var g = M.ganjiName(info.pillar.stem, info.pillar.branch);
      var next = M._internals.civilFromDays(dn0 + i + 1);
      var summary = isGood
        ? '○ 길일 · ' + g.kor + '일 (' + score + '점)'
        : '△ 충 주의 · ' + g.kor + '일';
      var desc = isGood
        ? info.stemSipseong + josa(info.stemSipseong, '이', '가') + ' 드는 날 — 사주첩'
        : '내 일지와 충(沖)이 드는 날. 중요한 결정과 서명은 미루는 게 좋아요 — 사주첩';
      lines.push(
        'BEGIN:VEVENT',
        'UID:sjsj-' + cv.y + pad(cv.m) + pad(cv.d) + '@sajucheop',
        'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:' + cv.y + pad(cv.m) + pad(cv.d),
        'DTEND;VALUE=DATE:' + next.y + pad(next.m) + pad(next.d),
        'SUMMARY:' + icsEscape(summary),
        'DESCRIPTION:' + icsEscape(desc),
        'TRANSP:TRANSPARENT',
        'END:VEVENT'
      );
      count++;
    }
    lines.push('END:VCALENDAR');
    return { text: lines.join('\r\n'), count: count };
  }

  function downloadIcs() {
    if (!state.result) return;
    try {
      var ics = buildIcs();
      var blob = new Blob([ics.text], { type: 'text/calendar;charset=utf-8' });
      var mode = deliverFile(blob, '사주첩-운세캘린더.ics', '사주첩 — 운세 캘린더');
      track('ics_export', { mode: mode });
      var help = $('#ics-help');
      if (mode === 'downloaded') {
        toast('30일치 ' + ics.count + '개 일정을 파일로 받았어요. 캘린더에 넣는 법은 아래 안내를 보세요.');
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

  /* 홈 화면 오늘 일진 표시 */
  function renderHomeToday() {
    var t = todayDateParts();
    var p = M.dayPillarOf(t.y, t.m, t.d);
    var g = M.ganjiName(p.stem, p.branch);
    $('#home-today').innerHTML =
      '<span class="mini-dot" aria-hidden="true"></span>오늘은 ' + g.kor + '(' + g.han + ')일 · ' +
      t.m + '월 ' + t.d + '일 ' + WEEKDAYS[t.w];
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
      '<div class="rp-birth">' + inp.year + '년 ' + inp.month + '월 ' + inp.day + '일' +
      (inp.unknownTime ? ' (시간 모름)' : ' ' + fmtTime(inp.hour * 60 + inp.minute)) +
      ' · 양력 · ' + (inp.gender === 'F' ? '여성' : '남성') + '</div>' +
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
    $('#btn-to-character').addEventListener('click', function () { showView('character'); });
    $('#btn-char-to-today').addEventListener('click', function () { showView('today'); });
    $('#btn-save-card').addEventListener('click', saveCharacterCard);
    $('#btn-share-card').addEventListener('click', shareCharacterCard);
    $('#btn-make-gunghap').addEventListener('click', makeGunghapLink);
    $('#btn-make-gunghap2').addEventListener('click', makeGunghapLink);
    $('#btn-make-gunghap3').addEventListener('click', makeGunghapLink);
    $('#btn-share-gunghap').addEventListener('click', shareGunghap);
    $('#btn-my-result').addEventListener('click', function () { showView('result'); });
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
    $('#btn-save-myeongsik').addEventListener('click', function () {
      toast('명식 이미지 저장은 준비 중이에요.');
    });
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
  initEvents();
  renderHomeToday();
  var savedProfile = loadProfile();
  if (savedProfile) fillFormFromProfile(savedProfile);
  renderResumeChip();
  state.invite = parseInviteFromHash();
  if (state.invite) showInviteBanner();
  showView('home');

  /* 디버그·검증용 최소 노출 */
  window.App = { buildIcs: buildIcs, monthData: monthData, purposeTopDays: purposeTopDays, buildCharacterCard: buildCharacterCard, deliverFile: deliverFile, isInAppBrowser: isInAppBrowser };
})();
