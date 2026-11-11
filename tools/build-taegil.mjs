/* 택일 달력 — /taegil/ 한 장. 목적(이사·결혼·개업·계약)과 기간을 고르면 날마다 전통 택일 기준의 표시를 달력과 후보 목록으로 보여 준다.
 *  계산 코어: docs/js/taegil-day.js (window.TaegilDay) — 빌드(예시)와 브라우저가 같은 코드를 쓴다.
 *   일진·절기 = docs/js/manseryeok.js(만세력·사주 계산기 엔진), 음력·손없는날 = docs/js/vendor-korean-lunar.js(/son/·/manse/ 와 같은 자료)
 *  빌드 때 대조(다르면 멈춤): 절기 날짜 ↔ 발표 시각 표(solar-terms-data.mjs) · 월지 ↔ 엔진 월주 · 2027년 공휴일 ↔ 발표 목록
 *  생년월일은 브라우저 밖으로 나가지 않는다(주소의 # 뒤에만 담김). 날짜별 페이지를 찍어 내지 않는다 — 이 한 장뿐.
 *  수정일: 글 영역(스크립트 제외)이 이전 빌드와 같으면 예전 날짜 유지. 예시는 '다음 달'이라 달이 바뀐 뒤 다시 돌리면 그날로 바뀐다.
 * 사용: node tools/build-taegil.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR, loadEngine, kstToday } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { PUBLISHED as TERM_PUBLISHED } from './solar-terms-data.mjs';

const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const URL = '/taegil/', REL = '../';
const PUBLISHED = '2026-11-11';
const NAV = [{ href: REL, label: '사주 보기' }, { href: REL + 'manse/', label: '만세력' }, { href: REL + 'son/', label: '손없는날' }];

const { M, I, W } = loadEngine(['taegil-day']);
const T = W.TaegilDay;
const today = kstToday();
const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

/* ---------- 대조 1: 절기 날짜 — 발표 시각 표가 있는 해는 날짜가 같아야 한다 ---------- */
for (const [y, terms] of Object.entries(TERM_PUBLISHED)) {
  for (const [name, v] of Object.entries(terms)) {
    const [m, d] = v.split(' ')[0].split('-').map(Number);
    const f = T.facts(T.dnOf(+y, m, d));
    if (!f.term || f.term.name !== name) throw new Error(`절기 날짜가 발표값과 다름: ${y} ${name} ${v}`);
  }
}
/* ---------- 대조 2: 월지(월건) — 엔진의 월주와 같아야 한다 (올해~3년) ---------- */
for (let dn = T.dnOf(today.y, 1, 1); dn < T.dnOf(today.y + 3, 1, 1); dn++) {
  const f = T.facts(dn);
  const r = M.compute({ year: f.y, month: f.m, day: f.d, hour: 12, minute: 0, gender: 'M', applySolarTime: false });
  if (r.pillars.month.branch !== f.monthBranch) throw new Error(`월지가 엔진 월주와 다름: ${iso(f.y, f.m, f.d)}`);
}
/* ---------- 대조 3: 공휴일 — 2027년 목록(인사혁신처 고시·「관공서의 공휴일에 관한 규정」 기준으로 정리된 달력, kholidayz.com/year/2027, 2026-11-11 확인) ---------- */
const HOLIDAYS_2027 = ['01-01', '02-06', '02-07', '02-08', '02-09', '03-01', '05-01', '05-03', '05-05', '05-13', '06-06', '07-17', '07-19', '08-15', '08-16',
  '09-14', '09-15', '09-16', '10-03', '10-04', '10-09', '10-11', '12-25', '12-27'];
{
  const got = Object.keys(T.holidaysOf(2027)).map((dn) => { const c = I.civilFromDays(+dn); return `${pad(c.m)}-${pad(c.d)}`; }).sort();
  if (got.join() !== HOLIDAYS_2027.join()) throw new Error('2027년 공휴일 계산이 발표 목록과 다름: ' + got.join(' '));
}

/* ---------- 예시: 다음 달 이사(생년월일 없이) ---------- */
const EX = today.m === 12 ? { y: today.y + 1, m: 1 } : { y: today.y, m: today.m + 1 };
const ex = T.scan(EX.y, EX.m, 1, 'move', { top: 8 });
const exDays = ex.months[0].days;
const dayLink = (f) => `<a href="${REL}day/${iso(f.y, f.m, f.d)}/">${T.dateLabel(f)}</a>`;
const exRows = ex.ranked.map((r, i) => `<tr><td>${i + 1}</td><td>${dayLink(r.f)}</td><td>${r.f.kor}(${r.f.han})</td><td>${r.ev.plus.map((x) => `${esc(x.label)} <small>${esc(x.why)}</small>`).join('<br>')}</td><td>${r.ev.score}</td></tr>`).join('\n          ');
const exSon = exDays.filter((r) => r.f.son).map((r) => `${r.f.d}일(${T.WD[r.f.w]})`).join(', ');
const exAvoid = exDays.filter((r) => r.ev.avoid).map((r) => `${r.f.d}일(${r.ev.minus.map((x) => x.label + ' — ' + x.why).join(', ')})`).join(', ');
const exJeol = exDays.filter((r) => r.f.term).map((r) => `${r.f.d}일 ${r.f.term.name}${r.f.term.jeol ? '(절입일)' : ''}`).join(', ');
const exHol = exDays.filter((r) => r.f.holiday).map((r) => `${r.f.d}일 ${r.f.holiday}`).join(', ');
const exTop = ex.ranked[0];

/* ---------- 본문 ---------- */
const R = T.RULES;
const title = '택일 달력 — 이사·결혼·개업·계약 날짜, 손없는날과 내 띠 충까지';
const desc = '목적과 기간을 고르면 손없는날·황도일·월파일·절기 경계와 공휴일을 한 달력에 표시해요. 생년월일을 넣으면 내 띠·일지와 충인 날, 합인 날도 함께. 전통 택일 관습 참고용, 계산은 브라우저 안에서만.';

const faq = [
  ['손없는날이면 무조건 좋은 날인가요?', '손없는날은 누구에게나 같은 날이에요. 전통 택일에서는 여기에 개인 기준을 더해, 내 띠나 일지와 충인 날은 손없는날이어도 피했어요. 이 달력은 그런 날을 따로 표시해요. 손없는날은 이사 예약이 몰려 비용이 오르기도 하니 일정과 비용을 먼저 보세요.'],
  ['띠는 설날 기준인가요, 입춘 기준인가요?', '이 도구는 사주의 년지를 띠로 써서 입춘이 기준이에요. 1월이나 2월 초에 태어났다면 흔히 아는 띠와 다르게 나올 수 있어요. 결과 위에 계산에 쓴 띠와 일주를 적어 두니 확인해 보세요.'],
  ['태어난 시간을 몰라도 되나요?', '네. 택일에서 사람과 날을 맞춰 볼 때는 띠(년지)와 태어난 날의 지지(일지)만 써요. 다만 밤 11시부터 자정 사이에 태어났다면 일지를 다음 날로 보는 견해도 있어서, 다음 날 날짜로도 한 번 넣어 보면 좋아요.'],
  ['충으로 나온 날은 꼭 피해야 하나요?', '아니에요. 충·합·손없는날·황도일은 모두 전통 택일 관습이고 검증된 근거가 있는 것은 아니에요. 예식장이나 이삿짐 업체 예약, 계약 상대 일정, 비용이 먼저예요. 조건이 비슷한 날 사이에서 고를 때 참고하세요.'],
  ['출산 날짜도 여기서 볼 수 있나요?', '이 달력에서는 다루지 않아요. 분만 시기는 산모와 아기의 상태를 보고 의료진이 정하는 것이 먼저예요.']
];

const ruleBlock = (r, extra) => `<h3>${r.name} <small style="font-size: 12px; color: var(--faint); font-weight: 500;">전통 택일 관습</small></h3>\n      <p>${r.line}${extra ? ' ' + extra : ''}</p>`;

const form = `<form class="tk-form" id="tk-form" action="." onsubmit="return false;">
        <div class="tk-l">무엇을 위한 날인가요</div>
        <div class="tk-seg" role="radiogroup" aria-label="목적">
          ${T.PURPOSES.map((p, i) => `<label><input type="radio" name="tk-p" value="${p.key}"${i === 0 ? ' checked' : ''}><span>${p.label}</span></label>`).join('')}
        </div>
        <div class="tk-row">
          <label>시작 달<select id="tk-start"></select></label>
          <label>기간<select id="tk-n"><option value="1">1개월</option><option value="2">2개월</option><option value="3" selected>3개월</option><option value="4">4개월</option><option value="6">6개월</option></select></label>
          <label>후보 요일<select id="tk-w"><option value="all">모든 요일</option><option value="rest">주말·공휴일만</option><option value="work">평일만</option></select></label>
        </div>
        <div class="tk-l" style="margin-top: 14px;">생년월일 <small>양력 · 넣지 않아도 돼요</small></div>
        <div class="tk-row tk-birth" data-who="a">
          <label><span class="tk-who">본인</span> 태어난 해<input type="number" id="tk-ay" min="1900" max="2100" inputmode="numeric" placeholder="예: 1990"></label>
          <label>월<select id="tk-am"></select></label>
          <label>일<select id="tk-ad"></select></label>
        </div>
        <div class="tk-row tk-birth" data-who="b" id="tk-b-row" hidden>
          <label><span class="tk-who">상대</span> 태어난 해<input type="number" id="tk-by" min="1900" max="2100" inputmode="numeric" placeholder="예: 1992"></label>
          <label>월<select id="tk-bm"></select></label>
          <label>일<select id="tk-bd"></select></label>
        </div>
        <p class="tk-note">생년월일을 넣으면 일진이 내 띠·일지와 충인 날과 합인 날을 표시해요. 태어난 시간은 쓰지 않아요. 입력값은 이 브라우저 안에서만 계산하고 서버로 보내지 않아요.</p>
        <noscript><p class="tk-note">자바스크립트를 켜면 달력이 열려요. 꺼 둔 상태에서는 아래 예시와 기준 설명을 볼 수 있어요.</p></noscript>
      </form>
      <div id="tk-out" class="tk-out" aria-live="polite"></div>`;

const body = `
  <article class="guide-article">
    <div class="ga-overline">택일 달력</div>
    <h1 class="ga-title">택일 달력 —<br>이사·결혼·개업·계약 날짜 고르기</h1>
    <p class="ga-meta">손없는날 · 황도일 · 월파일 · 절기 경계 · 내 띠·일지와 충·합 · 브라우저 안에서만 계산</p>
    <p class="ga-lead">목적과 기간을 고르면 날마다 전통 택일에서 보던 기준을 달력에 표시하고, 표시가 많이 겹치는 날부터 후보로 추려요. 생년월일을 넣으면 내 띠·일지와 충인 날은 빼고 합인 날은 더해요. 모두 전통 택일 관습이고 검증된 근거가 아니에요. 왜 그렇게 표시했는지는 날마다 한 줄씩 적어 두었어요.</p>
    <div class="ga-body">
      ${form}
      <h2>미리 계산한 예시 — ${EX.y}년 ${EX.m}월 이사</h2>
      <p>생년월일 없이 ${EX.y}년 ${EX.m}월 한 달을 이사 목적으로 돌린 결과예요. 위 달력도 같은 계산을 해요.${exTop ? ` 표시가 가장 많이 겹친 날은 <b>${T.dateLabel(exTop.f)}</b> ${exTop.f.kor}(${exTop.f.han})일이에요.` : ''}</p>
      <table>
        <thead><tr><th>순서</th><th>날짜</th><th>일진</th><th>표시</th><th>점수</th></tr></thead>
        <tbody>
          ${exRows}
        </tbody>
      </table>
      <ul>
        <li>${EX.m}월의 손없는날: ${exSon} — <a href="${REL}son/${EX.y}-${pad(EX.m)}/">${EX.m}월 손없는날·일진표</a>와 같아요.</li>
        ${exAvoid ? `<li>후보에서 뺀 날: ${esc(exAvoid)}</li>` : ''}
        ${exJeol ? `<li>${EX.m}월의 절기: ${exJeol}</li>` : ''}
        ${exHol ? `<li>공휴일: ${esc(exHol)}</li>` : ''}
      </ul>
      <p>생년월일을 넣으면 여기서 내 띠·일지와 충인 날이 더 빠지고, 합인 날은 점수가 올라가요.</p>

      <h2>날마다 보는 기준</h2>
      <p>아래 기준은 모두 책력과 통서(通書)에 전해 온 택일 관습이에요. 좋은 일이 생긴다는 뜻이 아니라, 예부터 그날을 골랐거나 피했다는 표시예요.</p>
      ${ruleBlock(R.son, `이사와 개업에서 가장 널리 쓰는 기준이라 이사 3점, 개업 2점, 결혼·계약 1점으로 세요. <a href="${REL}son/">월별 손없는날</a>과 같은 음력 자료로 계산해요.`)}
      ${ruleBlock(R.hwang, '청룡은 인·신월에 자일, 묘·유월에 인일, 진·술월에 진일, 사·해월에 오일, 자·오월에 신일, 축·미월에 술일에 들고, 그 뒤로 명당·천형·주작·금궤·천덕·백호·옥당·천뢰·현무·사명·구진 순서예요. 황도일은 2점, 흑도일은 표시만 하고 점수에 넣지 않아요.')}
      ${ruleBlock(R.pa, '『협기변방서(協紀辨方書)』는 “월파는 월건이 충하는 날”이라고 적어요. 예를 들어 자월(대설~소한)에는 오(午)일이에요. 후보에서 빼요.')}
      ${ruleBlock(R.sa, '한 해에 여덟 날이에요. 후보에서 빼요.')}
      ${ruleBlock(R.jeol, `입춘·경칩·청명처럼 달을 여는 열두 절기가 드는 날이에요. 후보에서 빼지는 않고 주의로만 표시해요. 절기 날짜는 <a href="${REL}jeolgi/">24절기 시각표</a>와 같아요.`)}
      ${ruleBlock(R.chung, '생년월일을 넣었을 때만 봐요. 일지와 충이면 5점, 띠와 충이면 4점을 빼고 후보에서 빼요. 결혼은 두 사람 가운데 한 사람만 충이어도 빼요.')}
      ${ruleBlock(R.hap, '일지와 합이면 2점, 띠와 합이면 1점을 더해요.')}
      <h3>요일·공휴일 <small style="font-size: 12px; color: var(--faint); font-weight: 500;">일정 정보</small></h3>
      <p>${R.wd.line} 공휴일은 「관공서의 공휴일에 관한 규정」의 날짜 규칙(고정일, 음력 설·부처님오신날·추석, 대체공휴일)으로 계산해요. 임시공휴일과 선거일은 그때그때 정해져서 들어 있지 않아요.</p>

      <h2>점수는 이렇게 세요</h2>
      <p>점수는 기준이 몇 개 겹치는지 세는 값이에요. 운의 크기를 뜻하지 않아요.</p>
      <table>
        <thead><tr><th>표시</th><th>이사</th><th>결혼</th><th>개업</th><th>계약</th></tr></thead>
        <tbody>
          <tr><td>손없는날</td>${T.PURPOSES.map((p) => `<td>+${p.son}</td>`).join('')}</tr>
          <tr><td>황도일</td><td colspan="4">+2</td></tr>
          <tr><td>일지와 합 · 띠와 합</td><td colspan="4">+2 · +1 (사람마다)</td></tr>
          <tr><td>절입일</td><td colspan="4">−1 (주의)</td></tr>
          <tr><td>월파일 · 사리·사절일</td><td colspan="4">−4 · −3 (후보에서 뺌)</td></tr>
          <tr><td>일지와 충 · 띠와 충</td><td colspan="4">−5 · −4 (후보에서 뺌)</td></tr>
        </tbody>
      </table>
      <p>뺄 표시가 없고 2점 이상인 날만 후보가 돼요. 점수가 같으면 빠른 날짜가 먼저예요. 결혼은 주말·공휴일, 계약은 평일로 좁혀 두었고 ‘후보 요일’에서 바꿀 수 있어요.</p>

      <h2>자주 묻는 질문</h2>
      ${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n      ')}

      <h2>출처와 한계</h2>
      <ul>
        <li>일진(60갑자)과 절기는 사주첩 <a href="${REL}manse/">만세력</a>과 같은 엔진으로 계산해요. 절기 날짜는 ${Object.keys(TERM_PUBLISHED).join('·')}년 한국천문연구원 발표 날짜와 같은지 확인했어요. 계산 방법은 <a href="${REL}about/method/">계산 방법</a>에 있어요.</li>
        <li>음력과 손없는날은 한국천문연구원 기준 음양력 자료를 써요. <a href="${REL}son/">손없는날 달력</a>과 결과가 같아요.</li>
        <li>월파일의 정의는 『협기변방서』 권4, 사리·사절일은 통서가 인용하는 『옥문경(玉門經)』의 “사절은 사립 전날”, 황도·흑도는 통서의 십이천신 표를 따랐어요. 책과 유파에 따라 기준이 더 있고(건제십이신, 이십팔수, 개인 생기복덕 등), 이 달력은 그 가운데 규칙이 분명한 것만 넣었어요.</li>
        <li>띠는 입춘 기준 년지예요. 일진은 자정에 바뀌는 것으로 계산해요.</li>
        <li>이 달력은 날짜를 고를 때 참고하는 전통 관습 정리예요. 길흉을 보장하지 않아요.</li>
      </ul>
      <p class="callout">모든 계산은 이 브라우저 안에서만 해요. 주소를 복사하면 고른 조건이 # 뒤에 담겨 같은 화면을 다시 볼 수 있어요. <a href="${REL}son/">월별 손없는날</a> · <a href="${REL}manse/">만세력</a> · <a href="${REL}day/">날짜별 일진</a> · <a href="${REL}guide/hapchung.html">합과 충</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${REL}"><span class="seal-dot" aria-hidden="true"></span><span>내 사주 여덟 글자 보기</span></a>
    </div>
  </article>
  <script src="${REL}js/vendor-korean-lunar.js"></script>
  <script src="${REL}js/manseryeok.js"></script>
  <script src="${REL}js/taegil-day.js"></script>
  <script>
(function () {
  'use strict';
  var T = window.TaegilDay, M = window.Manseryeok, I = M._internals;
  if (!T) return;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var now = new Date();
  var todayDn = T.dnOf(now.getFullYear(), now.getMonth() + 1, now.getDate());
  var selected = null, lastPurpose = null;

  /* 고르기 상자 채우기 */
  (function () {
    var o = '', y = now.getFullYear(), m = now.getMonth() + 1;
    for (var k = 0; k < 24; k++) { o += '<option value="' + y + '-' + pad(m) + '">' + y + '년 ' + m + '월</option>'; m++; if (m > 12) { m = 1; y++; } }
    $('#tk-start').innerHTML = o;
    var mo = '<option value="">월</option>', da = '<option value="">일</option>', i;
    for (i = 1; i <= 12; i++) mo += '<option value="' + i + '">' + i + '월</option>';
    for (i = 1; i <= 31; i++) da += '<option value="' + i + '">' + i + '일</option>';
    ['a', 'b'].forEach(function (w) { $('#tk-' + w + 'm').innerHTML = mo; $('#tk-' + w + 'd').innerHTML = da; });
  })();

  function purpose() { return document.querySelector('input[name="tk-p"]:checked').value; }
  /* 생년월일 읽기 — 비었으면 null, 틀리면 { bad: true } */
  function birth(w) {
    var y = $('#tk-' + w + 'y').value, m = $('#tk-' + w + 'm').value, d = $('#tk-' + w + 'd').value;
    if (!y && !m && !d) return null;
    y = +y; m = +m; d = +d;
    if (!(y >= 1900 && y <= 2100) || !m || !d || d > I.daysInMonth(y, m)) return { bad: true };
    return { y: y, m: m, d: d };
  }

  function badges(ev) {
    return ev.plus.concat(ev.minus).map(function (x) { return '<i class="b-' + x.k + '">' + x.badge + '</i>'; }).join('');
  }
  function markList(ev) {
    var li = function (cls, sign) { return function (x) { return '<li class="' + cls + '"><b>' + sign + esc(x.label) + '</b> <span>' + esc(x.why) + '</span></li>'; }; };
    return '<ul class="tk-marks">' + ev.plus.map(li('pl', '＋ ')).join('') + ev.minus.map(li('mi', '－ ')).join('') + ev.info.map(li('in', '')).join('') + '</ul>';
  }
  var GRADE = { good: '후보 — 표시가 여럿 겹쳐요', ok: '후보', caution: '주의 표시가 있어요', avoid: '전통 기준으로 피하는 날', plain: '특별한 표시 없음' };

  function detail(row, P) {
    var f = row.f, ev = row.ev, y = now.getFullYear();
    var isoD = T.iso(f.y, f.m, f.d);
    var ttl = P.label + ' 후보일';
    var why = ev.plus.concat(ev.minus).map(function (x) { return x.label; }).join(', ') || '특별한 표시 없음';
    var descTxt = f.kor + '(' + f.han + ')일 · ' + why + ' — 사주첩 택일 달력(전통 관습 참고용) https://sajucheop.com/taegil/';
    var nx = I.civilFromDays(f.dn + 1);
    var gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(ttl) +
      '&dates=' + f.y + pad(f.m) + pad(f.d) + '/' + nx.y + pad(nx.m) + pad(nx.d) + '&details=' + encodeURIComponent(descTxt);
    var links = [];
    if (f.y === y || f.y === y + 1) {
      links.push('<a href="${REL}day/' + isoD + '/">이날 일진 자세히</a>');
      links.push('<a href="${REL}son/' + f.y + '-' + pad(f.m) + '/">' + f.m + '월 손없는날</a>');
    }
    links.push('<a href="${REL}manse/">만세력</a>');
    return '<div class="tk-detail" id="tk-detail">' +
      '<div class="tk-dh"><b>' + f.y + '년 ' + T.dateLabel(f) + '</b> <span class="tk-han">' + f.kor + '(' + f.han + ')일</span>' +
      (f.lun ? ' <small>음력 ' + (f.lun.leap ? '윤' : '') + f.lun.m + '월 ' + f.lun.d + '일</small>' : '') + '</div>' +
      '<div class="tk-grade g-' + ev.grade + '">' + GRADE[ev.grade] + (f.dn < todayDn ? ' · 지난 날' : '') + ' · ' + ev.score + '점</div>' +
      markList(ev) +
      '<div class="tk-act"><button type="button" id="tk-ics" data-title="' + esc(ttl) + '" data-desc="' + esc(descTxt) + '">캘린더 파일(.ics) 받기</button>' +
      '<a href="' + esc(gcal) + '" target="_blank" rel="noopener">구글 캘린더에 추가</a></div>' +
      '<p class="tk-links">' + links.join(' · ') + '</p></div>';
  }

  function render(fromHash) {
    var pk = purpose(), P = T.purposeOf(pk);
    if (lastPurpose !== pk) { if (lastPurpose !== null || !fromHash) $('#tk-w').value = P.wd; lastPurpose = pk; }
    $('#tk-b-row').hidden = pk !== 'wedding';
    var s = $('#tk-start').value.split('-'), sy = +s[0], sm = +s[1], n = +$('#tk-n').value, wd = $('#tk-w').value;
    var people = [], notes = [], ba = birth('a'), bb = pk === 'wedding' ? birth('b') : null;
    [[ba, '본인'], [bb, '상대']].forEach(function (t) {
      if (!t[0]) return;
      if (t[0].bad) { notes.push(t[1] + ' 생년월일을 다시 확인해 주세요. 해·월·일을 모두 넣어야 해요.'); return; }
      try { people.push(T.person(t[0].y, t[0].m, t[0].d, t[1])); } catch (e) { notes.push(t[1] + ' 생년월일을 계산하지 못했어요.'); }
    });
    var res = T.scan(sy, sm, n, pk, { people: people, wd: wd, fromDn: todayDn, top: 10 });

    var h = '<div class="tk-sum"><b>' + P.label + '</b> · ' + sy + '년 ' + sm + '월부터 ' + n + '개월 <span>' + esc(P.hint) + '</span></div>';
    people.forEach(function (p) {
      var cd = M.BRANCHES[(p.dayBranch + 6) % 12], cy = M.BRANCHES[(p.yearBranch + 6) % 12];
      h += '<p class="tk-person"><b>' + p.who + '</b> ' + p.y + '년 ' + p.m + '월 ' + p.d + '일생 · 일주 ' + p.ilju + ' · ' + p.ddi + '<br>' +
        '충으로 빼는 날: 일진 지지가 <b>' + cd.kor + '(' + cd.han + ')</b>인 날(일지 ' + p.ilji + ' 기준), <b>' + cy.kor + '(' + cy.han + ')</b>인 날(띠 ' + p.ddiBranch + ' 기준).' +
        (p.m <= 2 ? ' 띠는 입춘 기준이라 1월·2월 초 생은 흔히 아는 띠와 다를 수 있어요.' : '') + '</p>';
    });
    notes.forEach(function (t) { h += '<p class="tk-warn">' + esc(t) + '</p>'; });

    /* 후보 목록 */
    var wdTxt = { all: '', rest: ' · 주말·공휴일만', work: ' · 평일만' }[res.wd];
    h += '<h3 class="tk-h">후보 날짜 <small>표시가 많이 겹치는 순' + wdTxt + ' · 오늘 이후</small></h3>';
    if (res.ranked.length) {
      h += '<ol class="tk-rank">' + res.ranked.map(function (r) {
        return '<li><button type="button" data-dn="' + r.f.dn + '"><span class="tk-rd">' + (r.f.y !== now.getFullYear() ? r.f.y + '년 ' : '') + T.dateLabel(r.f) + (r.f.holiday ? ' <em>' + esc(r.f.holiday) + '</em>' : '') + '</span>' +
          '<span class="tk-rg">' + r.f.kor + '(' + r.f.han + ')일 · ' + r.ev.score + '점</span>' +
          '<span class="tk-rr">' + r.ev.plus.map(function (x) { return esc(x.label); }).join(' · ') + '</span></button></li>';
      }).join('') + '</ol>';
      if (res.candidates > res.ranked.length) h += '<p class="tk-note">조건에 맞는 날 ' + res.candidates + '일 가운데 위 ' + res.ranked.length + '일이에요. 날짜를 누르면 까닭과 캘린더 추가가 열려요.</p>';
    } else {
      h += '<p class="tk-warn">이 기간에는 조건에 맞는 후보가 없어요. 기간을 늘리거나 후보 요일을 ‘모든 요일’로 바꿔 보세요.</p>';
    }

    /* 달력 */
    h += '<div class="tk-legend"><span><i class="lg g-good"></i>후보(여럿 겹침)</span><span><i class="lg g-ok"></i>후보</span><span><i class="lg g-caution"></i>주의</span><span><i class="lg g-avoid"></i>피하는 날</span>' +
      '<span><i class="b-son">손</i>손없는날</span><span><i class="b-hwang">황</i>황도일</span>' + (people.length ? '<span><i class="b-hap">합</i>합</span><span><i class="b-chung">충</i>충</span>' : '') +
      '<span><i class="b-pa">파</i>월파</span><span><i class="b-sa">사</i>사리·사절</span><span><i class="b-jeol">절</i>절입일</span></div>';
    var selRow = null;
    res.months.forEach(function (mo) {
      h += '<div class="tk-month"><div class="tk-mt">' + mo.y + '년 ' + mo.m + '월</div><div class="tk-grid">' +
        T.WD.map(function (w, i) { return '<div class="tk-wh' + (i === 0 ? ' sun' : '') + '">' + w + '</div>'; }).join('');
      for (var e = 0; e < mo.days[0].f.w; e++) h += '<div class="tk-c empty"></div>';
      var has = false;
      mo.days.forEach(function (r) {
        var f = r.f, sel = selected === f.dn;
        if (sel) { has = true; selRow = r; }
        h += '<button type="button" class="tk-c g-' + r.ev.grade + (f.dn < todayDn ? ' past' : '') + (f.dn === todayDn ? ' today' : '') + (sel ? ' sel' : '') + (f.w === 0 || f.holiday ? ' red' : '') + '" data-dn="' + f.dn + '"' +
          ' aria-label="' + f.m + '월 ' + f.d + '일 ' + f.kor + '일 ' + esc(r.ev.plus.concat(r.ev.minus).map(function (x) { return x.label; }).join(', ')) + '">' +
          '<span class="tk-d">' + f.d + '</span><span class="tk-g">' + f.kor + '</span><span class="tk-b">' + badges(r.ev) + '</span>' +
          (f.term || f.holiday ? '<span class="tk-t">' + esc(f.term ? f.term.name : f.holiday.replace(/\\(.*/, '')) + '</span>' : '') + '</button>';
      });
      h += '</div>' + (has ? detail(selRow, P) : '') + '</div>';
    });
    h += '<div class="tk-share"><button type="button" id="tk-copy">이 화면 주소 복사</button><span id="tk-copied" role="status"></span></div>';
    $('#tk-out').innerHTML = h;

    Array.prototype.forEach.call($('#tk-out').querySelectorAll('[data-dn]'), function (b) {
      b.addEventListener('click', function () {
        var dn = +b.getAttribute('data-dn');
        var fromRank = !b.classList.contains('tk-c');
        selected = (selected === dn && !fromRank) ? null : dn;
        render(false);
        var el = document.getElementById('tk-detail');
        if (el && fromRank) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
    var ics = document.getElementById('tk-ics');
    if (ics && selRow) ics.addEventListener('click', function () {
      var blob = new Blob([T.icsFor(selRow.f, ics.getAttribute('data-title'), ics.getAttribute('data-desc'))], { type: 'text/calendar;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = '사주첩-택일-' + T.iso(selRow.f.y, selRow.f.m, selRow.f.d) + '.ics';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    });
    $('#tk-copy').addEventListener('click', function () {
      var done = function (ok) { $('#tk-copied').textContent = ok ? '복사했어요.' : '주소창의 주소를 복사해 주세요.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(location.href).then(function () { done(true); }, function () { done(false); });
      else done(false);
    });

    /* 주소 조각(#)에만 담는다 — 서버로 가지 않는다 */
    var q = 'p=' + pk + '&s=' + $('#tk-start').value + '&n=' + n + '&w=' + wd;
    if (ba && !ba.bad) q += '&a=' + T.iso(ba.y, ba.m, ba.d);
    if (bb && !bb.bad) q += '&b=' + T.iso(bb.y, bb.m, bb.d);
    if (selRow) q += '&d=' + T.iso(selRow.f.y, selRow.f.m, selRow.f.d);
    try { history.replaceState(null, '', '#' + q); } catch (e) { /* 무시 */ }
  }

  /* 주소 조각에서 되살리기 */
  function restore() {
    var hsh = location.hash.replace(/^#/, ''); if (!hsh) return false;
    var p = {}; hsh.split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) p[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); });
    var r = p.p && document.querySelector('input[name="tk-p"][value="' + p.p.replace(/[^a-z]/g, '') + '"]');
    if (!r) return false;
    r.checked = true;
    var setIf = function (sel, v) { var el = $(sel); if (v != null && el.querySelector('option[value="' + String(v).replace(/[^0-9a-z-]/g, '') + '"]')) el.value = v; };
    setIf('#tk-start', p.s); setIf('#tk-n', p.n); setIf('#tk-w', p.w);
    [['a', p.a], ['b', p.b]].forEach(function (t) {
      var m = t[1] && t[1].match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
      if (m) { $('#tk-' + t[0] + 'y').value = m[1]; $('#tk-' + t[0] + 'm').value = +m[2]; $('#tk-' + t[0] + 'd').value = +m[3]; }
      else { $('#tk-' + t[0] + 'y').value = ''; $('#tk-' + t[0] + 'm').value = ''; $('#tk-' + t[0] + 'd').value = ''; }
    });
    var d = p.d && p.d.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
    selected = d ? T.dnOf(+d[1], +d[2], +d[3]) : null;
    return true;
  }

  Array.prototype.forEach.call(document.querySelectorAll('#tk-form input, #tk-form select'), function (el) {
    el.addEventListener(el.type === 'number' ? 'input' : 'change', function () {
      if (el.name === 'tk-p' && window.gtag) { try { window.gtag('event', 'taegil_cal', { purpose: el.value }); } catch (e) { /* 무시 */ } }
      render(false);
    });
  });
  render(restore());
  /* 다른 조건이 담긴 주소를 같은 탭에 붙여 넣었을 때 */
  window.addEventListener('hashchange', function () { if (restore()) { lastPurpose = null; render(true); } });
})();
  </script>`;

const STYLE = `<style>
    .tk-form { margin: 10px 0 16px; padding: 16px; background: #FFFDF9; border: 1px solid var(--line); border-radius: 12px; }
    .tk-l, .tk-form label { display: block; font-size: 12px; font-weight: 700; color: var(--muted); }
    .tk-l small { font-weight: 500; color: var(--faint); margin-left: 4px; }
    .tk-seg { display: flex; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; margin-top: 6px; }
    .tk-seg label { flex: 1; text-align: center; padding: 10px 4px; font-size: 14px; font-weight: 500; cursor: pointer; background: #fff; border-left: 1px solid var(--line); }
    .tk-seg label:first-child { border-left: 0; }
    .tk-seg input { position: absolute; opacity: 0; width: 0; height: 0; }
    .tk-seg label:has(input:checked) { background: var(--seal); color: #F6F1E8; font-weight: 700; }
    .tk-seg label:has(input:focus-visible) { outline: 2px solid var(--ink); outline-offset: -2px; }
    .tk-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
    .tk-row > label { flex: 1 1 90px; min-width: 0; }
    .tk-birth { display: grid; grid-template-columns: 1.5fr 1fr 1fr; }
    .tk-who { color: var(--seal); }
    .tk-form select, .tk-form input[type="number"] { display: block; width: 100%; box-sizing: border-box; margin-top: 5px; font: inherit; font-size: 16px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); }
    .tk-note { font-size: 12.5px; color: var(--muted); margin: 10px 0 0; line-height: 1.55; }
    .tk-warn { font-size: 13px; color: var(--seal-deep); margin: 8px 0; }
    .tk-out:empty { display: none; }
    .tk-sum { padding: 12px 14px; background: #211C15; color: #F6F1E8; border-radius: 12px; font-size: 14px; }
    .tk-sum span { display: block; font-size: 12.5px; color: #CFC6B5; margin-top: 4px; }
    .ga-body p.tk-person { font-size: 13px; line-height: 1.6; margin: 10px 0 0; padding-left: 10px; border-left: 3px solid var(--line); color: var(--ink-body); }
    .ga-body h3.tk-h { font-family: inherit; font-size: 15px; font-weight: 700; margin: 20px 0 8px; }
    .ga-body h3.tk-h small { font-size: 12px; font-weight: 500; color: var(--faint); margin-left: 6px; }
    .ga-body ol.tk-rank { list-style: none; margin: 0; padding: 0; counter-reset: tg; }
    .ga-body ol.tk-rank li { margin: 0 0 6px; padding: 0; counter-increment: tg; }
    .tk-rank button { display: grid; grid-template-columns: auto 1fr; column-gap: 10px; width: 100%; text-align: left; font: inherit; padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; background: #FFFDF9; color: var(--ink); cursor: pointer; }
    .tk-rank button::before { content: counter(tg); grid-row: 1 / span 2; align-self: center; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 50%; background: var(--seal); color: #F6F1E8; font-size: 12px; font-weight: 700; }
    .tk-rd { font-weight: 700; font-size: 14.5px; }
    .tk-rd em { font-style: normal; font-weight: 500; font-size: 12px; color: var(--seal); margin-left: 4px; }
    .tk-rg { grid-column: 2; font-size: 12.5px; color: var(--muted); }
    .tk-rr { grid-column: 2; font-size: 12.5px; color: var(--ink-body); margin-top: 2px; }
    .tk-legend { display: flex; flex-wrap: wrap; gap: 6px 12px; font-size: 11.5px; color: var(--muted); margin: 20px 0 4px; }
    .tk-legend span { display: inline-flex; align-items: center; gap: 4px; }
    .tk-legend .lg { width: 14px; height: 14px; border-radius: 4px; border: 1px solid var(--line); display: inline-block; }
    .tk-month { margin-top: 14px; }
    .tk-mt { font-family: 'Noto Serif KR', serif; font-weight: 700; font-size: 16px; margin-bottom: 6px; }
    .tk-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 3px; }
    .tk-wh { text-align: center; font-size: 11px; color: var(--faint); padding: 2px 0; }
    .tk-wh.sun { color: var(--seal); }
    .tk-c { min-height: 66px; padding: 4px 2px; border: 1px solid var(--line-soft); border-radius: 8px; background: #fff; color: var(--ink); font: inherit; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 1px; overflow: hidden; }
    .tk-c.empty { border: 0; background: none; cursor: default; }
    .tk-d { font-size: 13px; font-weight: 700; line-height: 1.2; }
    .tk-c.red .tk-d { color: var(--seal); }
    .tk-g { font-size: 10.5px; color: var(--muted); line-height: 1.2; }
    .tk-b { display: flex; flex-wrap: wrap; justify-content: center; gap: 1px; min-height: 15px; }
    .tk-b i, .tk-legend i[class^="b-"] { font-style: normal; font-size: 10px; line-height: 14px; width: 14px; height: 14px; text-align: center; border-radius: 4px; font-weight: 700; display: inline-block; }
    .b-son, .b-hwang, .b-hap { background: var(--seal); color: #F6F1E8; }
    .b-hwang { background: #B98D28; }
    .b-hap { background: #3B7A57; }
    .b-chung, .b-pa, .b-sa { background: #211C15; color: #F6F1E8; }
    .b-jeol { background: #fff; color: var(--ink); box-shadow: inset 0 0 0 1px var(--underline); }
    .tk-t { font-size: 9.5px; color: var(--faint); line-height: 1.1; white-space: nowrap; overflow: hidden; max-width: 100%; }
    .g-good { background: #F9E2DC; border-color: #E2A59E; }
    .g-ok { background: #FBF3E6; border-color: #E6D6B8; }
    .g-caution { background: #fff; border-style: dashed; border-color: var(--underline); }
    .g-avoid { background: #E9E4DA; border-color: #D8D0C2; }
    .tk-c.g-avoid .tk-d, .tk-c.g-avoid .tk-g { color: var(--faint); }
    .tk-c.past { opacity: .45; }
    .tk-c.today { box-shadow: inset 0 0 0 2px var(--ink); }
    .tk-c.sel { box-shadow: 0 0 0 2px var(--seal); }
    .tk-detail { margin-top: 10px; padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: #FFFDF9; }
    .tk-dh { font-size: 15px; }
    .tk-dh small { color: var(--muted); font-size: 12px; margin-left: 4px; }
    .tk-han { font-family: 'Noto Serif KR', serif; margin-left: 4px; }
    .tk-grade { display: inline-block; margin-top: 8px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid var(--line); }
    .ga-body ul.tk-marks { list-style: none; margin: 10px 0 0; padding: 0; }
    .ga-body ul.tk-marks li { margin: 0; padding: 6px 0; border-top: 1px solid var(--line-soft); font-size: 13px; line-height: 1.5; }
    .tk-marks li span { color: var(--muted); }
    .tk-marks li.pl b { color: var(--seal-deep); }
    .tk-marks li.in b { font-weight: 500; }
    .tk-act { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .tk-act button, .tk-act a, .tk-share button { flex: 1 1 150px; text-align: center; font: inherit; font-size: 13.5px; font-weight: 700; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--seal); background: var(--seal); color: #F6F1E8; cursor: pointer; text-decoration: none; }
    .tk-act a, .tk-share button { background: #fff; color: var(--seal-deep); }
    .ga-body p.tk-links { font-size: 12.5px; margin: 10px 0 0; }
    .tk-share { display: flex; align-items: center; gap: 10px; margin-top: 16px; }
    .tk-share button { flex: none; }
    .tk-share span { font-size: 12.5px; color: var(--muted); }
    @media (max-width: 420px) { .tk-c { min-height: 62px; } .tk-seg label { font-size: 13.5px; } .tk-row:not(.tk-birth) > label:first-child { flex-basis: 100%; } .tk-form select, .tk-form input[type="number"] { padding: 8px 6px; } }
  </style>`;

/* ---------- 수정일 — 글 영역(스크립트 제외)이 이전 빌드와 같으면 예전 날짜, 달라졌으면 오늘 ---------- */
const contentKey = (html) => { const a = html.indexOf('<article'), b = html.indexOf('</article>'); return html.slice(a, b).replace(/<script[\s\S]*?<\/script>/g, '').replace(/\s+/g, ' ').trim(); };
const file = path.join(DOCS, URL.slice(1), 'index.html');
let modified = iso(today.y, today.m, today.d);
if (fs.existsSync(file)) {
  const old = fs.readFileSync(file, 'utf8');
  const m = old.match(/"dateModified":"(\d{4}-\d{2}-\d{2})"/);
  if (m && contentKey(old) === contentKey(body)) modified = m[1];
}

const jsonld = [
  breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '택일 달력', url: SITE + URL }]),
  { '@context': 'https://schema.org', '@type': 'WebApplication', name: '사주첩 택일 달력', url: SITE + URL, description: desc, applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', browserRequirements: 'Requires JavaScript', isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' }, inLanguage: 'ko', datePublished: PUBLISHED, dateModified: modified, publisher: { '@type': 'Organization', name: '사주첩' },
    featureList: ['이사·결혼·개업·계약 목적별 후보 날짜', '손없는날', '황도일·흑도일', '월파일·사리·사절일·절입일', '내 띠·일지와 일진의 충·합', '공휴일 표시', '캘린더(.ics) 내보내기'] },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
];
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, shell({ rel: REL, title, desc, canonical: SITE + URL, nav: NAV, extraHead: STYLE, jsonld, body, ogTitle: '택일 달력 — 이사·결혼·개업·계약 날짜 고르기',
  footerNote: '본 도구는 전통 택일 관습의 규칙을 그대로 계산해 보여 주는 참고용 콘텐츠입니다. 길흉을 보장하지 않으며 검증된 근거가 아닙니다.' }));

/* 사이트맵(docs/sitemap.xml) — 이 한 줄만 더하거나 lastmod 를 맞춘다 */
const smPath = path.join(DOCS, 'sitemap.xml');
let sm = fs.readFileSync(smPath, 'utf8');
const row = `  <url><loc>${SITE}${URL}</loc><lastmod>${modified}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>`;
if (sm.includes(`<loc>${SITE}${URL}</loc>`)) sm = sm.replace(/[ \t]*<url><loc>https:\/\/sajucheop\.com\/taegil\/<\/loc>[^\n]*<\/url>/, row);
else sm = sm.replace(/([ \t]*<url><loc>https:\/\/sajucheop\.com\/manse\/<\/loc>[^\n]*\n)/, `$1${row}\n`);
if (!sm.includes(`<loc>${SITE}${URL}</loc>`)) throw new Error('sitemap.xml 에 /taegil/ 을 넣지 못함');
fs.writeFileSync(smPath, sm);

console.log(`택일 달력 ${URL} — 예시 ${EX.y}-${pad(EX.m)} 이사: ${ex.ranked.slice(0, 3).map((r) => `${r.f.d}일 ${r.f.kor}(${r.ev.score})`).join(', ')} · 손없는날 ${exSon} · 수정일 ${modified}`);
