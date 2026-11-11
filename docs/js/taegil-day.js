/* ============================================================
 * 사주첩 — 택일 달력(/taegil/) 계산 코어. window.TaegilDay 로 노출.
 * 달력 계산은 새로 만들지 않고 기존 것을 그대로 쓴다:
 *  - 일진(60갑자)·절기 황경: js/manseryeok.js (만세력·사주 계산기와 같은 엔진)
 *  - 음력(손없는날): js/vendor-korean-lunar.js (한국천문연구원 기준, /son/·/manse/ 와 같은 자료)
 * 날마다 붙이는 표시(모두 전통 택일 관습 — 검증된 근거가 아니다):
 *  손없는날 · 황도/흑도(십이천신) · 월파 · 사리·사절 · 절입일 · 개인 충/합(일지·띠) · 요일·공휴일(정보)
 * 빌드(tools/build-taegil.mjs)와 브라우저가 이 한 벌을 같이 쓴다. ES5, DOM 없음.
 * (js/taegil.js 는 홈의 '출산 택일(베타)'용 별개 모듈)
 * ============================================================ */
(function () {
  'use strict';
  var M = window.Manseryeok, I = M._internals;
  var lunarCal = window.KoreanLunarCalendar ? new window.KoreanLunarCalendar() : null;

  var WD = ['일', '월', '화', '수', '목', '금', '토'];
  /* 절기 index = 태양 황경/15 (0 춘분 … 21 입춘) — 만세력 페이지·build-pages.mjs 와 같은 순서. 홀수 index 가 절(節, 월주가 바뀜) */
  var TERMS = ['춘분', '청명', '곡우', '입하', '소만', '망종', '하지', '소서', '대서', '입추', '처서', '백로',
    '추분', '한로', '상강', '입동', '소설', '대설', '동지', '소한', '대한', '입춘', '우수', '경칩'];
  var SARI = { 0: 1, 6: 1, 12: 1, 18: 1 };     /* 이분이지(춘분·하지·추분·동지) — 그 전날이 사리일(四離) */
  var SAJEOL = { 21: 1, 3: 1, 9: 1, 15: 1 };   /* 사립(입춘·입하·입추·입동) — 그 전날이 사절일(四絶) */
  var ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  /* 십이천신(황도·흑도) — 청룡이 드는 날: 寅申월 子, 卯酉월 寅, 辰戌월 辰, 巳亥월 午, 子午월 申, 丑未월 戌. 그 뒤로 지지 순서대로 */
  var SHIN = [['청룡', 1], ['명당', 1], ['천형', 0], ['주작', 0], ['금궤', 1], ['천덕', 1], ['백호', 0], ['옥당', 1], ['천뢰', 0], ['현무', 0], ['사명', 1], ['구진', 0]];
  var SAMHAP_NAME = { 0: '신자진', 4: '신자진', 8: '신자진', 3: '해묘미', 7: '해묘미', 11: '해묘미', 2: '인오술', 6: '인오술', 10: '인오술', 1: '사유축', 5: '사유축', 9: '사유축' };

  /* 목적 — son: 손없는날 가중치, wd: 후보 목록의 기본 요일 조건(all 전체 · rest 주말·공휴일 · work 평일) */
  var PURPOSES = [
    { key: 'move', label: '이사', son: 3, wd: 'all', hint: '이사·입주는 손없는날을 가장 크게 봐요.' },
    { key: 'wedding', label: '결혼', son: 1, wd: 'rest', hint: '결혼은 두 사람 모두와 충이 없는 날을 먼저 봐요. 후보는 주말·공휴일로 좁혀 두었어요.' },
    { key: 'open', label: '개업', son: 2, wd: 'all', hint: '개업은 손없는날과 황도일을 함께 봐요.' },
    { key: 'contract', label: '계약', son: 1, wd: 'work', hint: '계약은 은행·관공서가 여는 평일로 좁혀 두었어요.' }
  ];
  function purposeOf(key) { for (var i = 0; i < PURPOSES.length; i++) if (PURPOSES[i].key === key) return PURPOSES[i]; return PURPOSES[0]; }

  /* 규칙 한 줄 설명 — 페이지 본문과 결과 화면이 같은 문장을 쓴다 */
  var RULES = {
    son: { name: '손없는날', line: '음력 날짜 끝자리가 9·0인 날(9·10·19·20·29·30일). 사람을 따라다니며 방해한다는 손(損)이 하늘로 올라가 쉰다고 봐요.' },
    hwang: { name: '황도일', line: '달(절기 기준)과 일진 지지로 열두 천신을 돌려, 청룡·명당·금궤·천덕·옥당·사명이 드는 날을 황도일이라 해요. 나머지 여섯은 흑도일이에요.' },
    pa: { name: '월파일', line: '일진의 지지가 그달 지지(월건)와 충인 날. 통서에서 큰일을 피하는 날로 적어요.' },
    sa: { name: '사리·사절일', line: '춘분·하지·추분·동지 전날(사리)과 입춘·입하·입추·입동 전날(사절). 계절 기운이 갈리는 날이라 큰일을 피했어요.' },
    jeol: { name: '절입일', line: '달의 간지(월주)가 바뀌는 절기가 드는 날. 기운이 바뀌는 경계라 조심하는 날로 봐요.' },
    chung: { name: '충(沖)', line: '일진의 지지가 내 띠(년지)나 일지와 여섯 칸 떨어져 마주 보는 날(자오·축미·인신·묘유·진술·사해). 택일에서 가장 먼저 빼는 날이에요.' },
    hap: { name: '합(合)', line: '일진의 지지가 내 띠나 일지와 육합(자축·인해·묘술·진유·사신·오미) 또는 삼합(신자진·해묘미·인오술·사유축)으로 묶이는 날.' },
    wd: { name: '요일·공휴일', line: '길흉이 아니라 일정 정보예요. 결혼은 주말·공휴일, 계약은 평일로 후보를 좁힐 수 있어요.' }
  };

  function norm360(x) { x = x % 360; return x < 0 ? x + 360 : x; }
  function dnOf(y, m, d) { return I.daysFromCivil(y, m, d); }
  function midJd(dn) { return dn + I.JDN_EPOCH - 0.5 - 9 / 24; }                 /* KST 자정의 JD (만세력 페이지와 같은 식) */
  function termIdxAt(dn) { return Math.floor(norm360(I.solarLongitude(midJd(dn))) / 15); }
  function weekdayOf(dn) { return ((dn + 4) % 7 + 7) % 7; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }

  /* ---------- 공휴일 — 「관공서의 공휴일에 관한 규정」의 날짜 규칙으로 계산 ----------
   * 고정일 + 음력(설·부처님오신날·추석) + 대체공휴일(제3조). 임시공휴일과 선거일은 그때그때 정해지므로 넣지 않는다.
   * 제헌절·노동절은 2026년부터. 빌드 때 2027년 결과를 발표된 목록과 대조한다(tools/build-taegil.mjs). */
  var holCache = {};
  function lunarToDn(y, lm, ld) {
    if (!lunarCal || !lunarCal.setLunarDate(y, lm, ld, false)) return null;
    var s = lunarCal.getSolarCalendar();
    return dnOf(s.year, s.month, s.day);
  }
  function holidaysOf(y) {
    if (holCache[y]) return holCache[y];
    var list = [];   /* { dn, name, sub: 'satsun' | 'sun' | null, end } */
    function fixed(m, d, name, sub) { var dn = dnOf(y, m, d); list.push({ dn: dn, name: name, sub: sub, end: dn }); }
    function group(dn, name) {
      if (dn == null) return;
      list.push({ dn: dn - 1, name: name + ' 연휴', sub: 'sun', end: dn + 1 });
      list.push({ dn: dn, name: name, sub: 'sun', end: dn + 1 });
      list.push({ dn: dn + 1, name: name + ' 연휴', sub: 'sun', end: dn + 1 });
    }
    fixed(1, 1, '신정', null);
    group(lunarToDn(y, 1, 1), '설날');
    fixed(3, 1, '삼일절', 'satsun');
    if (y >= 2026) fixed(5, 1, '노동절', 'satsun');
    fixed(5, 5, '어린이날', 'satsun');
    var bd = lunarToDn(y, 4, 8);
    if (bd != null) list.push({ dn: bd, name: '부처님오신날', sub: 'satsun', end: bd });
    fixed(6, 6, '현충일', null);
    if (y >= 2026) fixed(7, 17, '제헌절', 'satsun');
    fixed(8, 15, '광복절', 'satsun');
    group(lunarToDn(y, 8, 15), '추석');
    fixed(10, 3, '개천절', 'satsun');
    fixed(10, 9, '한글날', 'satsun');
    fixed(12, 25, '성탄절', 'satsun');
    list.sort(function (a, b) { return a.dn - b.dn; });

    var map = {}, count = {};
    list.forEach(function (h) { count[h.dn] = (count[h.dn] || 0) + 1; map[h.dn] = map[h.dn] ? map[h.dn] + '·' + h.name : h.name; });
    var done = {};
    list.forEach(function (h) {
      if (!h.sub) return;
      var w = weekdayOf(h.dn);
      var overlap = w === 0 || (h.sub === 'satsun' && w === 6) || count[h.dn] > 1;
      var key = h.sub === 'sun' ? 'g' + h.end : 'd' + h.dn;      /* 연휴는 한 번, 같은 날 겹친 공휴일도 한 번 */
      if (!overlap || done[key]) return;
      done[key] = 1;
      var s = h.end + 1;
      while (weekdayOf(s) === 0 || map[s]) s++;
      map[s] = '대체공휴일(' + h.name.replace(' 연휴', '') + ')';
    });
    holCache[y] = map;
    return map;
  }

  /* ---------- 하루의 사실 ---------- */
  var cache = {};
  function facts(dn) {
    if (cache[dn]) return cache[dn];
    var cv = I.civilFromDays(dn);
    var p = M.dayPillarOf(cv.y, cv.m, cv.d);
    var g = M.ganjiName(p.stem, p.branch);
    var f = { dn: dn, y: cv.y, m: cv.m, d: cv.d, w: weekdayOf(dn), stem: p.stem, branch: p.branch, kor: g.kor, han: g.han };

    /* 음력·손없는날 — /son/ 과 같은 판정(끝자리 9·0) */
    f.lun = null; f.son = false;
    if (lunarCal && lunarCal.setSolarDate(cv.y, cv.m, cv.d)) {
      var l = lunarCal.getLunarCalendar();
      f.lun = { m: l.month, d: l.day, leap: !!l.intercalation };
      f.son = l.day % 10 === 9 || l.day % 10 === 0;
    }

    /* 절기 — 이날 드는 절기, 내일 드는 절기 */
    var a = termIdxAt(dn), b = termIdxAt(dn + 1), c = termIdxAt(dn + 2);
    f.term = a !== b ? { idx: b, name: TERMS[b], jeol: b % 2 === 1 } : null;
    var eve = b !== c ? c : -1;
    f.sa = eve >= 0 && SARI[eve] ? { kind: '사리일', term: TERMS[eve] } : eve >= 0 && SAJEOL[eve] ? { kind: '사절일', term: TERMS[eve] } : null;

    /* 그달의 지지(월건) — 절기 기준. 정오의 태양 황경으로: 입춘(315°)부터 寅 */
    var lam = norm360(I.solarLongitude(midJd(dn) + 0.5));
    f.monthBranch = (2 + Math.floor(norm360(lam - 315) / 30)) % 12;
    f.pa = M.branchRelation(f.branch, f.monthBranch) === '충';

    /* 황도·흑도 */
    var start = ((f.monthBranch + 10) % 6) * 2;
    var s = SHIN[(f.branch - start + 12) % 12];
    f.shin = { name: s[0], good: !!s[1] };

    f.holiday = holidaysOf(cv.y)[dn] || null;
    f.rest = f.w === 0 || f.w === 6 || !!f.holiday;
    cache[dn] = f;
    return f;
  }

  /* ---------- 사람 — 생년월일(양력)에서 일지와 띠(년지, 입춘 기준) ---------- */
  function person(y, m, d, who) {
    var r = M.compute({ year: y, month: m, day: d, unknownTime: true, gender: 'M', applySolarTime: false });
    var dp = r.pillars.day, yp = r.pillars.year;
    var g = M.ganjiName(dp.stem, dp.branch);
    return { who: who || '본인', y: y, m: m, d: d, dayStem: dp.stem, dayBranch: dp.branch, yearBranch: yp.branch,
      ilgan: M.STEMS[dp.stem].kor + '(' + M.STEMS[dp.stem].han + ')', ilju: g.kor + '(' + g.han + ')',
      ilji: M.BRANCHES[dp.branch].kor + '(' + M.BRANCHES[dp.branch].han + ')',
      ddi: ANIMALS[yp.branch] + '띠', ddiBranch: M.BRANCHES[yp.branch].kor + '(' + M.BRANCHES[yp.branch].han + ')' };
  }

  function pairName(a, b) { var lo = Math.min(a, b), hi = Math.max(a, b); return M.BRANCHES[lo].kor + M.BRANCHES[hi].kor; }

  /* ---------- 평가 — 표시와 점수. 점수는 '전통 기준 표시가 몇 개 겹치나'를 세는 값일 뿐 운의 크기가 아니다 ---------- */
  function evaluate(f, purposeKey, people) {
    var P = purposeOf(purposeKey);
    var plus = [], minus = [], info = [], score = 0, avoid = false;
    var bk = M.BRANCHES[f.branch].kor;

    if (f.son) { score += P.son; plus.push({ k: 'son', badge: '손', label: '손없는날', why: '음력 ' + (f.lun.leap ? '윤' : '') + f.lun.m + '월 ' + f.lun.d + '일' }); }
    if (f.shin.good) { score += 2; plus.push({ k: 'hwang', badge: '황', label: '황도일(' + f.shin.name + ')', why: M.BRANCHES[f.monthBranch].kor + '월의 ' + bk + '일' }); }
    else info.push({ k: 'heuk', label: '흑도일(' + f.shin.name + ')', why: '표시만 하고 점수에는 넣지 않아요' });

    if (f.pa) { score -= 4; avoid = true; minus.push({ k: 'pa', badge: '파', label: '월파일', why: '일진 ' + bk + ' ↔ 월지 ' + M.BRANCHES[f.monthBranch].kor + ' (' + pairName(f.branch, f.monthBranch) + '충)' }); }
    if (f.sa) { score -= 3; avoid = true; minus.push({ k: 'sa', badge: '사', label: f.sa.kind, why: f.sa.term + ' 전날' }); }
    if (f.term && f.term.jeol) { score -= 1; minus.push({ k: 'jeol', badge: '절', label: '절입일', why: f.term.name + '이 드는 날 — 달의 간지가 바뀌어요' }); }
    else if (f.term) info.push({ k: 'term', label: '절기 ' + f.term.name, why: '중기라 달의 간지는 그대로예요' });

    (people || []).forEach(function (p) {
      [['일지', p.dayBranch, 5, 2], ['띠', p.yearBranch, 4, 1]].forEach(function (t) {
        var rel = M.branchRelation(f.branch, t[1]);
        var tk = M.BRANCHES[t[1]].kor;
        if (rel === '충') {
          score -= t[2]; avoid = true;
          minus.push({ k: 'chung', badge: '충', label: p.who + ' ' + t[0] + '와 충', why: '일진 ' + bk + ' ↔ ' + t[0] + ' ' + tk + ' (' + pairName(f.branch, t[1]) + '충)' });
        } else if (rel === '육합' || rel === '삼합') {
          score += t[3];
          plus.push({ k: 'hap', badge: '합', label: p.who + ' ' + t[0] + '와 ' + rel, why: '일진 ' + bk + ' + ' + t[0] + ' ' + tk + (rel === '육합' ? ' (' + pairName(f.branch, t[1]) + '합)' : ' (' + SAMHAP_NAME[f.branch] + ' 삼합의 두 글자)') });
        }
      });
    });

    info.push({ k: 'wd', label: WD[f.w] + '요일' + (f.holiday ? ' · ' + f.holiday : ''), why: f.rest ? '쉬는 날' : '평일' });

    var grade = avoid ? 'avoid' : minus.length ? 'caution' : score >= P.son + 2 ? 'good' : score >= 2 ? 'ok' : 'plain';
    return { score: score, plus: plus, minus: minus, info: info, avoid: avoid, grade: grade };
  }

  /* ---------- 훑기 — startY/startM 부터 months 달. opts: { people, wd: 'all'|'rest'|'work', fromDn: 이날부터만 후보, top } ---------- */
  function scan(startY, startM, months, purposeKey, opts) {
    opts = opts || {};
    var P = purposeOf(purposeKey);
    var wd = opts.wd || P.wd;
    var out = [], all = [];
    var y = startY, m = startM;
    for (var k = 0; k < months; k++) {
      var n = I.daysInMonth(y, m), days = [];
      for (var d = 1; d <= n; d++) {
        var f = facts(dnOf(y, m, d));
        var ev = evaluate(f, purposeKey, opts.people);
        var row = { f: f, ev: ev };
        days.push(row); all.push(row);
      }
      out.push({ y: y, m: m, days: days });
      m++; if (m > 12) { m = 1; y++; }
    }
    var cand = all.filter(function (r) {
      if (opts.fromDn != null && r.f.dn < opts.fromDn) return false;
      if (r.ev.grade !== 'good' && r.ev.grade !== 'ok') return false;
      if (wd === 'rest' && !r.f.rest) return false;
      if (wd === 'work' && r.f.rest) return false;
      return true;
    }).sort(function (a, b) { return b.ev.score - a.ev.score || a.f.dn - b.f.dn; });
    return { months: out, ranked: cand.slice(0, opts.top || 10), candidates: cand.length, wd: wd, purpose: P };
  }

  function dateLabel(f) { return f.m + '월 ' + f.d + '일(' + WD[f.w] + ')'; }
  function reasonText(ev) { return ev.plus.map(function (x) { return x.label; }).join(' · '); }

  /* 하루짜리 종일 일정 .ics */
  function icsFor(f, title, desc) {
    var nx = I.civilFromDays(f.dn + 1);
    var esc = function (s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); };
    var ymd = function (y, m, d) { return '' + y + pad(m) + pad(d); };
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//sajucheop//taegil//KO', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:taegil-' + ymd(f.y, f.m, f.d) + '@sajucheop.com', 'DTSTAMP:' + ymd(f.y, f.m, f.d) + 'T000000Z',
      'DTSTART;VALUE=DATE:' + ymd(f.y, f.m, f.d), 'DTEND;VALUE=DATE:' + ymd(nx.y, nx.m, nx.d),
      'SUMMARY:' + esc(title), 'DESCRIPTION:' + esc(desc), 'TRANSP:TRANSPARENT', 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
  }

  window.TaegilDay = {
    PURPOSES: PURPOSES, RULES: RULES, WD: WD, TERMS: TERMS, ANIMALS: ANIMALS,
    purposeOf: purposeOf, facts: facts, person: person, evaluate: evaluate, scan: scan,
    holidaysOf: holidaysOf, dnOf: dnOf, iso: iso, dateLabel: dateLabel, reasonText: reasonText, icsFor: icsFor
  };
})();
