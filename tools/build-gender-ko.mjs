/* 중국 황실 달력(성별 예측표) 한국어판 — /jungguk-dallyeok/
 * 한국 사람들은 영어판 /en/chinese-gender-calendar/ 로 ChatGPT를 거쳐 들어오고 있었다(2026-09 AI 유입 한국 122회). 그 수요를 한국어로 받는다.
 * 계산은 한국천문연구원 음력(docs/js/vendor-korean-lunar.js)으로: 엄마의 음력 나이(설날 기준) × 임신한 음력 달. 예정일은 266일 전, 마지막 생리 시작일은 14일 뒤.
 * 윤달은 보름까지는 그 달, 16일부터는 다음 달로 본다(영어판과 같은 규칙). 한국과 중국 음력이 다른 날은 계산기가 중국 기준 결과도 함께 보여 준다.
 * 해마다 1월: YEARS 를 한 해씩 옮기고 MODIFIED 를 바꾼 뒤 다시 실행. 표의 해에 윤달이 있으면 멈춘다(그해 표는 윤달 칸 규칙이 필요). */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { shell, breadcrumb, esc } from './page-shell.mjs';
import { chineseMonths } from './chinese-lunar.mjs';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');
const SITE = 'https://sajucheop.com';
const KLC = require(path.join(DOCS, 'js', 'vendor-korean-lunar.js'));
const cal = new KLC();
const YEARS = [2026, 2027];            /* 표로 보여 줄 '임신한 해'(음력) */
const MODIFIED = '2026-10-03';
const URL_PATH = '/jungguk-dallyeok/';
const EN_URL = '/en/chinese-gender-calendar/';

/* ---------- 날짜 ---------- */
const dn = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / 864e5);
const civ = (z) => { const t = new Date(z * 864e5); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; };
const long = (z) => { const c = civ(z); return `${c.y}년 ${c.m}월 ${c.d}일`; };
const md = (z) => { const c = civ(z); return `${c.m}.${c.d}`; };
const lunarOf = (z) => { const c = civ(z); cal.setSolarDate(c.y, c.m, c.d); const L = cal.getLunarCalendar(); return { year: L.year, month: L.month, day: L.day, leap: !!L.intercalation }; };

/* 한국 음력 달 목록 (양력 하루씩 돌며 음력 1일을 찾는다) */
const months = [];
for (let z = dn(YEARS[0] - 2, 1, 1); z <= dn(YEARS[YEARS.length - 1] + 2, 12, 31); z++) {
  const L = lunarOf(z);
  if (L.day === 1) months.push({ ly: L.year, month: L.month, leap: L.leap, start: z });
}
months.forEach((m, i) => { m.days = (months[i + 1] ? months[i + 1].start : m.start + 30) - m.start; });
const newYear = (ly) => { if (!cal.setLunarDate(ly, 1, 1, false)) throw new Error('설날 계산 실패 ' + ly); const s = cal.getSolarCalendar(); return dn(s.year, s.month, s.day); };   /* 엄마 생일 줄은 수십 년 전까지 간다 */
for (const y of YEARS) if (months.some((m) => m.ly === y && m.leap)) throw new Error(`중국 황실 달력: 음력 ${y}년에 윤달이 있어 표에 윤달 칸 규칙이 필요합니다`);
const leapAround = months.filter((m) => m.leap && m.ly >= YEARS[0] - 1 && m.ly <= YEARS[YEARS.length - 1]);
const nextLeap = months.find((m) => m.leap && m.ly > YEARS[YEARS.length - 1]);

/* 한국·중국 음력이 다른 날 (계산기가 중국 기준도 함께 보여 줌) */
const cnMonths = chineseMonths(YEARS[0] - 6, YEARS[YEARS.length - 1] + 6);
const cnOf = (z) => { for (let i = cnMonths.length - 1; i >= 0; i--) if (z >= cnMonths[i].start) return { year: cnMonths[i].lunarYear, month: cnMonths[i].month, leap: !!cnMonths[i].leap, day: z - cnMonths[i].start + 1 }; return null; };
const DIFF = {};
for (let z = dn(YEARS[0] - 5, 1, 1); z <= dn(YEARS[YEARS.length - 1] + 5, 12, 31); z++) {
  const K = lunarOf(z), C = cnOf(z);
  if (C && (K.year !== C.year || K.month !== C.month || K.leap !== C.leap)) { const c = civ(z); DIFF[`${c.y}-${c.m}-${c.d}`] = [C.year, C.month, C.leap ? 1 : 0, C.day]; }
}
const diffInYears = Object.keys(DIFF).filter((k) => YEARS.includes(+k.split('-')[0])).map((k) => { const [y, m, d] = k.split('-').map(Number); return dn(y, m, d); }).sort((a, b) => a - b);
if (!diffInYears.length) throw new Error('중국 황실 달력: 표의 해에 한·중 음력이 다른 날이 없으면 본문 문장을 고쳐야 합니다');

/* ---------- 성별 예측표: 엄마의 음력 나이 18~45(줄) × 임신한 음력 달 1~12(칸) — 영어판과 같은 표(두 출판본과 칸마다 대조, 2026-09-19) ---------- */
const CHART = ['GBGBBBBBBBBB', 'BGBGGBBBBBGG', 'GBGBBBBBBGBB', 'BGGGGGGGGGGG', 'GBBGBGGBGGGG', 'BBGBBGBGBBBG', 'BGBBGBBGGGGG', 'GBBGGBGBBBBB', 'BGBGGBGBGGGG', 'GBGBGGBBBBGB',
  'BGBGGGBBBBGG', 'GBGGBBBBBGGG', 'BGGGGGGGGGBB', 'BGBGGGGGGGGB', 'BGBGGGGGGGGB', 'GBGBGGGBGGGB', 'BGBGGGGGGGBB', 'BBGBGGGBGGBB', 'GBBGBGGGBBBB', 'BGBBGBGBGBGB',
  'GBGBBGBGBGBG', 'BGBBBGGBGBGG', 'GBGBGBBGBGBG', 'BGBGBGBBGBGB', 'GBGBGBGBBGBG', 'BGBGBGBGBBBB', 'BBGBBBGBGBGG', 'GBBGGGBGBGBB'];
if (CHART.length !== 28 || CHART.some((r) => !/^[BG]{12}$/.test(r))) throw new Error('성별 예측표는 28줄 × 12칸이어야 합니다');
const enChart = fs.readFileSync(path.join(ROOT, 'tools', 'build-en-lunar.mjs'), 'utf8').match(/const CHART = (\[[\s\S]*?\]);/);
if (!enChart || JSON.stringify(eval(enChart[1])) !== JSON.stringify(CHART)) throw new Error('영어판 표와 한국어판 표가 다릅니다');
const boys = CHART.join('').split('B').length - 1;
const W = (v) => (v === 'B' ? '남' : '여');
const cell = (age, mo, id) => { const v = CHART[age - 18][mo - 1]; return `<td class="${v === 'B' ? 'gb' : 'gg'}"${id ? ` id="${id}"` : ''}>${W(v)}</td>`; };

function yearTable(LY) {
  const ms = months.filter((m) => m.ly === LY);
  const head = ms.map((m) => `<th>${m.month}월<small>${md(m.start)}~<br>${md(m.start + m.days - 1)}</small></th>`).join('');
  const rows = [];
  for (let age = 18; age <= 45; age++) {
    const by = LY - age + 1;
    rows.push(`<tr><th class="gc-born">${long(newYear(by)).replace(/(\d+)년 /, '$1.').replace('월 ', '.').replace('일', '')}~<br>${long(newYear(by + 1) - 1).replace(/(\d+)년 /, '$1.').replace('월 ', '.').replace('일', '')}</th><th class="gc-age">${age}</th>${ms.map((m) => cell(age, m.month, `y${LY}-${age}-${m.month}`)).join('')}</tr>`);
  }
  return `<div class="gc-wrap"><table class="gc-chart gc-year">
        <tr><th class="gc-corner">엄마 생일(양력)</th><th class="gc-age">음력<br>나이</th>${head}</tr>
        ${rows.join('\n        ')}
      </table></div>`;
}
const masterChart = `<div class="gc-wrap"><table class="gc-chart">
        <tr><th class="gc-corner">나이</th>${Array.from({ length: 12 }, (_, i) => `<th>${i + 1}월</th>`).join('')}</tr>
        ${Array.from({ length: 28 }, (_, i) => `<tr><th>${i + 18}</th>${Array.from({ length: 12 }, (_, j) => cell(i + 18, j + 1, `c-${i + 18}-${j + 1}`)).join('')}</tr>`).join('\n        ')}
      </table></div>`;
const monthRows = (LY) => months.filter((m) => m.ly === LY).map((m) => `<tr><td>${m.leap ? '윤' : ''}${m.month}월</td><td>${long(m.start)}</td><td>${long(m.start + m.days - 1)}</td><td>${m.days}일</td></tr>`).join('\n        ');

/* 보기 예: 1995년 1월 20일생(설날 전이라 음력으로는 1994년생), 예정일 YEARS[1]년 6월 26일 */
const EX = (() => {
  const birth = { y: 1995, m: 1, d: 20 }, due = { y: YEARS[1], m: 6, d: 26 };
  const con = dn(due.y, due.m, due.d) - 266, L = lunarOf(con), B = lunarOf(dn(birth.y, birth.m, birth.d));
  const age = L.year - B.year + 1, c = civ(con);
  const man = c.y - birth.y - (c.m < birth.m || (c.m === birth.m && c.d < birth.d) ? 1 : 0), seneun = c.y - birth.y + 1;
  if (L.leap || B.year !== 1994 || age === seneun || age === man + 1) throw new Error('중국 황실 달력: 보기 예가 더는 "만 나이+1·세는 나이와 다름"을 보여 주지 못합니다');
  return { birth, due, con, L, B, age, man, seneun, v: CHART[age - 18][L.month - 1] };
})();

const STYLE = `<style>
    .gc-calc { margin: 6px 0 18px; padding: 16px; background: #FFFDF9; border: 1px solid var(--line); border-radius: 12px; }
    .gc-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .gc-row + .gc-row { margin-top: 10px; }
    .gc-row label { flex: 1 1 130px; display: block; font-size: 12.5px; font-weight: 700; color: var(--muted); }
    .gc-row input[type=date], .gc-row select { display: block; width: 100%; margin-top: 6px; font: inherit; font-size: 16px; padding: 9px 10px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); }
    .gc-row .gc-leap { flex: 0 0 auto; display: flex; align-items: flex-end; gap: 6px; padding-bottom: 10px; font-size: 13px; font-weight: 500; color: var(--ink); }
    .gc-calc button { margin-top: 12px; width: 100%; font: inherit; font-weight: 700; padding: 11px 16px; border: 0; border-radius: 8px; background: var(--seal); color: #F6F1E8; cursor: pointer; }
    .gc-out { margin-top: 14px; font-size: 14px; line-height: 1.7; }
    .gc-out .gc-big { display: block; font-family: var(--serif); font-size: 22px; font-weight: 600; color: var(--ink); }
    .gc-out .gc-big b.gb { color: #2C69A8; } .gc-out .gc-big b.gg { color: #B8382D; }
    .gc-out .gc-fine { display: block; margin-top: 2px; font-size: 12.5px; color: var(--muted); }
    .gc-out ol { margin: 10px 0 0 18px; padding: 0; }
    .gc-out li { margin-top: 6px; }
    .gc-out p { margin-top: 8px; font-size: 13px; color: var(--muted); }
    .gc-wrap { overflow-x: auto; margin: 10px 0 6px; -webkit-overflow-scrolling: touch; }
    .gc-chart { border-collapse: collapse; font-size: 12px; min-width: 100%; }
    .gc-chart th, .gc-chart td { border: 1px solid var(--line); padding: 4px 3px; text-align: center; white-space: nowrap; }
    .gc-chart th { background: var(--paper-deep); font-weight: 700; }
    .gc-chart th small { display: block; font-weight: 400; font-size: 10px; color: var(--muted); }
    .gc-chart th.gc-born { font-weight: 400; font-size: 10.5px; color: var(--muted); text-align: left; }
    .gc-chart .gc-corner { font-size: 11px; }
    .gc-chart td.gb { background: #E3EEF8; color: #2C69A8; font-weight: 700; }
    .gc-chart td.gg { background: #F8E3E0; color: #B8382D; font-weight: 700; }
    .gc-chart td.on { outline: 3px solid var(--ink); outline-offset: -3px; }
    .gc-key { font-size: 13px; color: var(--muted); }
    .gc-key b { display: inline-block; min-width: 22px; text-align: center; border-radius: 4px; margin-right: 4px; }
    .gc-key b.gb { background: #E3EEF8; color: #2C69A8; } .gc-key b.gg { background: #F8E3E0; color: #B8382D; }
  </style>
  <link rel="alternate" hreflang="ko" href="${SITE}${URL_PATH}">
  <link rel="alternate" hreflang="en" href="${SITE}${EN_URL}">`;

const [LYA, LYB] = YEARS;
const diffList = diffInYears.map((z) => { const K = lunarOf(z), C = cnOf(z); return `${long(z)}(한국 음력 ${K.year}년 ${K.month}월 ${K.day}일, 중국 음력 ${C.year}년 ${C.month}월 ${C.day}일)`; });
const leapText = leapAround.map((m) => `${m.ly}년 윤${m.month}월(양력 ${long(m.start)}~${long(m.start + m.days - 1)})`).join(', ');

const faq = [
  ['중국 황실 달력, 정말 맞나요?', '맞을 확률은 동전을 던졌을 때와 같은 반반이에요. 2010년 학술지 『소아·주산기 역학(Paediatric and Perinatal Epidemiology)』에 실린 연구가 스웨덴 출생 기록 약 280만 건에 이 표를 대 봤더니 50%만 맞았어요. 재미로 보고, 성별은 병원에서 확인하세요.'],
  ['나이는 만 나이로 보나요?', '아니요. 임신한 날의 음력 나이로 봐요. 음력 나이는 태어나면 한 살이고 설날마다 한 살씩 늘어요. 그래서 만 나이보다 한두 살 많고, 1월 1일에 한 살 먹는 세는 나이와도 1~2월생은 한 살 차이가 날 수 있어요.'],
  ['임신한 날을 모르면 어떻게 하나요?', '출산 예정일에서 266일을 빼거나, 마지막 생리 시작일에 14일을 더하면 대략 임신한 날이 나와요. 계산기는 세 가지 날짜를 모두 받고, 음력 달이 바뀌는 날과 가까우면 앞뒤 달 결과도 함께 알려 드려요.'],
  ['윤달에 임신했다면요?', `윤달의 1~15일은 그 달로, 16일부터는 다음 달로 보는 게 흔한 방식이에요. 계산기도 이 방식으로 봐요. 가까운 윤달은 ${leapText}이고, 그다음은 ${nextLeap.ly}년 윤${nextLeap.month}월이에요.`],
  [`${LYB}년 달력은 ${LYA}년과 뭐가 다른가요?`, `표는 해마다 똑같아요. 달라지는 건 음력 달의 양력 날짜와 엄마의 음력 나이예요. 음력 ${LYB}년은 설날인 ${long(newYear(LYB))}에 시작하니, 그 전에 임신했다면 ${LYA}년 표를, 그날부터는 ${LYB}년 표를 보세요.`],
  ['중국 음력과 한국 음력이 다르다던데요?', `대부분 같지만 시간대가 한 시간 달라서 가끔 달의 첫날이 하루 어긋나요. ${LYA}·${LYB}년에는 ${diffList.join(', ')}이 그래요. 이날 임신했다면 계산기가 중국 음력으로 본 결과도 함께 보여 드려요.`],
  ['쌍둥이도 알 수 있나요?', '아니요. 이 표는 한 번에 한 가지 답만 내고, 쌍둥이에 대해서는 아무것도 알려 주지 않아요.'],
  ['병원에서는 언제 성별을 알 수 있나요?', '초음파로는 보통 임신 16~20주 무렵에 보이고, 산전 혈액검사는 10주 무렵부터 하는 곳도 있어요. 예전에는 32주 전에는 성별을 알려 줄 수 없었지만, 2024년 2월 헌법재판소가 그 조항을 위헌으로 결정해서 지금은 시기와 상관없이 물어볼 수 있어요. 자세한 건 다니는 병원에 물어보세요.'],
];

const title = `중국황실달력 ${LYA}·${LYB} 성별 계산기 · 음력 나이 자동 계산 — 사주첩`;
const desc = `엄마 생년월일과 출산 예정일만 넣으면 음력 나이와 임신한 음력 달을 계산해 중국 황실 달력 표에서 아들·딸을 찾아 드려요. ${LYA}·${LYB}년 음력 달 날짜, 전체 표, 보는 법, 정확도까지 정리했어요.`;
const h1 = `중국 황실 달력 성별 계산기 ${LYA}·${LYB}`;
const NAV = [{ href: '../', label: '사주 보기' }, { href: '../lunar/', label: '음력 기념일' }, { href: '../guide/', label: '서재' }];

const body = `
  <article class="guide-article">
    <div class="ga-overline">임신·출산</div>
    <h1 class="ga-title">${h1}</h1>
    <p class="ga-lead">중국 황실 달력은 엄마의 <b>음력 나이</b>와 <b>임신한 음력 달</b>로 아들인지 딸인지 점쳐 보는 표예요. 이 두 숫자를 잘못 세서 엉뚱한 칸을 보는 일이 가장 많아서, 날짜만 넣으면 둘 다 계산해 드려요. 재미로 보는 민간 풀이이고, 맞을 확률은 반반이에요.</p>
    <div class="gc-calc">
      <div class="gc-row">
        <label for="gc-birth">엄마 생년월일<input id="gc-birth" type="date" min="1940-01-01" max="2015-12-31" value="1995-01-20"></label>
        <label for="gc-bcal">달력<select id="gc-bcal"><option value="solar">양력</option><option value="lunar">음력</option></select></label>
        <label class="gc-leap" id="gc-leap-wrap" hidden><input type="checkbox" id="gc-bleap"> 윤달</label>
      </div>
      <div class="gc-row">
        <label for="gc-kind">아는 날짜<select id="gc-kind"><option value="due">출산 예정일</option><option value="con">임신한 날(수정일)</option><option value="lmp">마지막 생리 시작일</option></select></label>
        <label for="gc-date">날짜<input id="gc-date" type="date" min="1960-01-01" max="2049-12-31" value="${LYB}-06-26"></label>
      </div>
      <button type="button" id="gc-go">표에서 찾기</button>
      <div class="gc-out" id="gc-out" aria-live="polite"></div>
    </div>
    <div class="ga-body">
      <h2>${LYA}·${LYB}년에 임신했다면 이 표를 보세요</h2>
      <p>${LYB}년에 태어날 아기는 대개 ${LYA}년 봄부터 ${LYB}년 봄 사이에 생겨서, 음력 해가 두 번 걸쳐요. 음력 ${LYA}년은 ${long(newYear(LYA))}부터 ${long(newYear(LYB) - 1)}까지, 음력 ${LYB}년은 ${long(newYear(LYB))}부터 ${long(newYear(LYB + 1) - 1)}까지예요. 임신한 날이 들어 있는 표에서 엄마 생일 줄을 찾으면 음력 나이도 따로 셀 필요가 없어요.</p>
      <p class="gc-key"><b class="gb">남</b>아들 &nbsp; <b class="gg">여</b>딸</p>
      <h3>${long(newYear(LYA))} ~ ${long(newYear(LYB) - 1)}에 임신</h3>
      ${yearTable(LYA)}
      <h3>${long(newYear(LYB))} ~ ${long(newYear(LYB + 1) - 1)}에 임신</h3>
      ${yearTable(LYB)}
      <p>엄마 생일 줄은 1월 1일이 아니라 설날에 바뀌어요. 음력 나이는 설날마다 한 살씩 늘기 때문이에요. 음력 ${LYA}년과 ${LYB}년에는 윤달이 없어서 두 표 모두 열두 칸이에요.</p>

      <h2>중국 황실 달력 보는 법</h2>
      <p><strong>1. 임신한 날의 음력 나이를 셉니다.</strong> 임신한 해의 음력 연도에서 엄마가 태어난 음력 연도를 빼고 1을 더해요. 1~2월생은 양력 생일이 설날보다 앞서면 음력으로는 전해에 태어난 셈이니 꼭 확인하세요.</p>
      <p><strong>2. 임신한 날이 음력 몇 월인지 찾습니다.</strong> 음력 달은 초승달이 뜨는 날 시작해서 양력 1월, 2월과 맞지 않아요. 위 표의 칸 머리나 아래 달 날짜표를 보세요.</p>
      <p><strong>3. 나이 줄과 달 칸이 만나는 곳을 읽습니다.</strong></p>
      <p><strong>예를 들어 볼게요.</strong> ${long(dn(EX.birth.y, EX.birth.m, EX.birth.d))}에 태어난 엄마의 출산 예정일이 ${long(dn(EX.due.y, EX.due.m, EX.due.d))}이라면, 임신한 날은 그보다 266일 앞선 ${long(EX.con)}쯤이에요. 이날은 음력 ${EX.L.year}년 ${EX.L.month}월 ${EX.L.day}일이에요. 엄마는 양력 1월생이지만 그해 설날(${long(newYear(1995))})보다 먼저 태어나서 음력으로는 ${EX.B.year}년생이에요. 그래서 음력 나이는 ${EX.L.year} − ${EX.B.year} + 1 = ${EX.age}세예요. 이때 만 나이는 ${EX.man}세, 1월 1일에 먹는 세는 나이는 ${EX.seneun}세라서, 둘 중 무엇으로 봐도 다른 줄을 보게 돼요. ${EX.age}세 줄과 ${EX.L.month}월 칸이 만나는 곳은 '${W(EX.v)}', 곧 ${EX.v === 'B' ? '아들' : '딸'}이에요.</p>

      <h2>중국 황실 달력 전체 표</h2>
      <p>줄은 임신했을 때 엄마의 음력 나이, 칸은 임신한 음력 달이에요. 표는 해마다 바뀌지 않고, 바뀌는 건 음력 달의 날짜와 엄마의 나이뿐이에요. 336칸 가운데 아들이 ${boys}칸, 딸이 ${336 - boys}칸이에요.</p>
      <p class="gc-key"><b class="gb">남</b>아들 &nbsp; <b class="gg">여</b>딸</p>
      ${masterChart}

      <h2>${LYA}·${LYB}년 음력 달 날짜 (중국달력 ${LYA}·${LYB})</h2>
      <table>
        <tr><th>음력 ${LYA}년</th><th>첫날(양력)</th><th>마지막 날</th><th>날수</th></tr>
        ${monthRows(LYA)}
      </table>
      <table>
        <tr><th>음력 ${LYB}년</th><th>첫날(양력)</th><th>마지막 날</th><th>날수</th></tr>
        ${monthRows(LYB)}
      </table>
      <p>한국천문연구원이 발표하는 한국 음력이에요. 중국 음력은 베이징 시간으로 세서 가끔 달의 첫날이 하루 빨라요. ${LYA}·${LYB}년에는 ${diffList.join(', ')}이 서로 달라요. 특히 ${LYB}년 설날은 한국이 ${long(newYear(LYB))}, 중국이 하루 앞서요. 다른 날의 음력은 <a href="../lunar/">음력 날짜 계산</a>이나 <a href="../manse/">만세력</a>에서 볼 수 있어요.</p>

      <h2>계산기마다 결과가 다른 이유</h2>
      <p><strong>나이를 잘못 세서.</strong> 가장 흔한 방법이 '만 나이 + 1'이에요. 설날부터 생일 전까지는 음력 나이가 만 나이보다 두 살 많아서 이 방법이 한 살 모자라요. 1월 1일에 한 살 먹는 세는 나이로 보면 설날 전에 태어난 1~2월생이 한 살 어긋나요.</p>
      <p><strong>양력 달로 봐서.</strong> 3월을 3월 칸으로 읽으면 절반쯤은 다른 칸을 보게 돼요. 칸은 음력 달이에요.</p>
      <p><strong>윤달 때문에.</strong> 윤달은 같은 달이 한 번 더 오는 달이에요. 이 계산기는 1~15일을 그 달로, 16일부터를 다음 달로 보고, 그렇게 본 경우에는 결과에 따로 알려 드려요.</p>
      <p><strong>임신한 날이 추정이라서.</strong> 출산 예정일과 생리 주기는 사람마다 달라요. 임신한 날이 음력 달이 바뀌는 날과 이틀 안쪽이면 계산기가 옆 달 결과도 함께 보여 드려요.</p>
      <p><strong>한국 음력과 중국 음력이 달라서.</strong> 위에서 본 날짜들에 임신했다면 어느 달력으로 보느냐에 따라 칸이 달라질 수 있어요.</p>
      <p><strong>표가 여러 가지라서.</strong> 칸이 조금 다른 표도 돌아다녀요. 여기 쓴 표는 가장 널리 실린 것으로, 두 출판본과 칸마다 대조해 확인했어요.</p>

      <h2>중국 황실 달력 정확도</h2>
      <p>동전 던지기와 비슷해요. 2010년 학술지 『소아·주산기 역학』에 실린 연구가 스웨덴의 출생 기록 약 280만 건에 이 표를 대 봤더니 맞은 비율이 50%였어요. 두 번, 세 번 맞았다는 이야기도 많지만, 반반의 확률이라면 여러 집에서 연달아 맞는 일도 흔하게 생겨요.</p>
      <p>아기의 성별은 수정되는 순간 정해지기 때문에, 이 표에 맞춰 임신할 달을 골라도 확률은 달라지지 않아요. 정확한 성별은 초음파나 산전 혈액검사로 확인하세요. 2024년 2월 헌법재판소 결정으로 임신 32주 전 성별 고지를 막던 조항이 사라져서, 지금은 시기와 상관없이 병원에 물어볼 수 있어요.</p>

      <h2>어디서 온 표일까</h2>
      <p>표와 함께 도는 이야기로는 청나라 황실을 위해 만들었다거나, 베이징 근처 왕실 무덤에서 나왔다고 해요. 300년 전이라고도 700년 전이라고도 하고, 원본이 박물관에 있다고도 해요. 하지만 그런 원본이 공개된 적은 없고, 역사학자들도 기록을 찾지 못했어요. 확실한 건 20세기 후반에 중국어권과 영어권 육아 책과 잡지에 실리며 널리 퍼졌다는 것 정도예요.</p>

      <h2>우리나라에서는 태몽도 함께 봐요</h2>
      <p>우리나라에서는 이 표가 '중국 황실 달력'이라는 이름으로 임신 소식과 함께 육아 커뮤니티를 돌아요. 더 오래된 우리 방식은 태몽이에요. 임신 초기에 엄마나 할머니처럼 가까운 사람이 꾼 꿈을 두고, 용·호랑이·큰 과일이면 아들, 꽃·작은 과일·보석이면 딸이라고들 해요. 태몽도 재미로 나누는 이야기지만, 꿈마다 담긴 뜻은 <a href="https://dream.sajucheop.com/taemong/" target="_blank" rel="noopener">꿈첩 태몽 모음</a>에서 볼 수 있어요.</p>

      <h2>자주 묻는 질문</h2>
      ${faq.map(([q, a], i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="ih-body"><p>${a}</p></div></details>`).join('\n      ')}

      <p class="callout">함께 보기: <a href="../lunar/">음력 날짜 계산</a> · <a href="../manse/">만세력</a> · <a href="../#taegil">출산 택일</a> · <a href="https://dream.sajucheop.com/taemong/" target="_blank" rel="noopener">태몽 해몽</a> · <a href="..${EN_URL}" hreflang="en">English version</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="../"><span class="seal-dot" aria-hidden="true"></span><span>아기 사주도 풀어 보기</span></a>
    </div>
  </article>
  <script src="../js/vendor-korean-lunar.js"></script>
  <script>
  (function () {
    var CHART = ${JSON.stringify(CHART)}, DIFF = ${JSON.stringify(DIFF)};
    var $ = function (s) { return document.querySelector(s); };
    var K = window.KoreanLunarCalendar ? new window.KoreanLunarCalendar() : null;
    function dn(y, m, d) { return Math.round(Date.UTC(y, m - 1, d) / 864e5); }
    function civ(z) { var t = new Date(z * 864e5); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; }
    function fmt(z) { var c = civ(z); return c.y + '년 ' + c.m + '월 ' + c.d + '일'; }
    function lunar(z) { var c = civ(z); if (!K.setSolarDate(c.y, c.m, c.d)) return null; var L = K.getLunarCalendar(); return { year: L.year, month: L.month, day: L.day, leap: !!L.intercalation }; }
    function newYear(ly) { if (!K.setLunarDate(ly, 1, 1, false)) return null; var s = K.getSolarCalendar(); return dn(s.year, s.month, s.day); }
    function parse(v) { var p = String(v || '').split('-'); return p.length === 3 && +p[0] > 0 ? { y: +p[0], m: +p[1], d: +p[2] } : null; }
    function word(v) { return v === 'B' ? '아들' : '딸'; }
    function read(L, birthLy) {
      var mo = L.month, yr = L.year;
      if (L.leap && L.day > 15) { mo = mo % 12 + 1; if (mo === 1) yr++; }
      var age = yr - birthLy + 1;
      return { L: L, month: mo, age: age, v: age >= 18 && age <= 45 ? CHART[age - 18].charAt(mo - 1) : '' };
    }
    function go() {
      var out = $('#gc-out');
      var on = document.querySelectorAll('.gc-chart td.on');
      for (var i = 0; i < on.length; i++) on[i].className = on[i].className.replace(' on', '');
      if (!K) { out.textContent = '음력 계산기를 불러오지 못했어요. 페이지를 새로 고쳐 주세요.'; return; }
      var b = parse($('#gc-birth').value), t = parse($('#gc-date').value), kind = $('#gc-kind').value, lunarBirth = $('#gc-bcal').value === 'lunar';
      if (!b || !t) { out.textContent = '두 날짜를 모두 넣어 주세요.'; return; }
      var bz, by;
      if (lunarBirth) {
        if (!K.setLunarDate(b.y, b.m, b.d, $('#gc-bleap').checked)) { out.textContent = '그런 음력 날짜는 없어요. 윤달 여부와 날짜를 확인해 주세요.'; return; }
        var s = K.getSolarCalendar(); bz = dn(s.year, s.month, s.day); by = b.y;
      } else {
        bz = dn(b.y, b.m, b.d); var BL = lunar(bz); if (!BL) { out.textContent = '1000년부터 2050년 사이 날짜만 계산할 수 있어요.'; return; } by = BL.year;
      }
      var z = dn(t.y, t.m, t.d) + (kind === 'due' ? -266 : kind === 'lmp' ? 14 : 0);
      if (z <= bz) { out.textContent = '임신한 날이 엄마 생일보다 앞서요. 날짜를 확인해 주세요.'; return; }
      var L = lunar(z); if (!L) { out.textContent = '2050년까지의 날짜만 계산할 수 있어요.'; return; }
      var R = read(L, by), how = kind === 'due' ? '(예정일에서 266일 전)' : kind === 'lmp' ? '(마지막 생리 시작일에서 14일 뒤)' : '';
      var ny = newYear(by), nyNext = newYear(by + 1), bc = civ(bz), c = civ(z);
      var man = c.y - bc.y - (c.m < bc.m || (c.m === bc.m && c.d < bc.d) ? 1 : 0), seneun = c.y - bc.y + 1, wrong = [];
      if (man + 1 !== R.age) wrong.push('만 나이에 1을 더한 ' + (man + 1) + '세');
      if (seneun !== R.age) wrong.push('1월 1일 기준 세는 나이 ' + seneun + '세');
      var ageNote = wrong.length ? ' ' + wrong.join('나 ') + '로 보면 다른 줄을 보게 돼요.' : '';
      var html = R.v
        ? '<span class="gc-big">표로 보면 <b class="' + (R.v === 'B' ? 'gb' : 'gg') + '">' + word(R.v) + '</b>이에요</span><span class="gc-fine">재미로 보는 민간 풀이예요. 맞을 확률은 반반이에요.</span>'
        : '<span class="gc-big">표 밖의 나이예요</span><span class="gc-fine">이 표는 음력 나이 18~45세만 다뤄요.</span>';
      html += '<ol><li><b>임신한 날</b> ' + (how ? '약 ' : '') + fmt(z) + how + '은 음력 ' + L.year + '년 ' + (L.leap ? '윤' : '') + L.month + '월 ' + L.day + '일이에요.' +
        (L.leap ? ' 윤달이라 1~15일은 ' + L.month + '월로, 16일부터는 ' + (L.month % 12 + 1) + '월로 봐서 ' + R.month + '월 칸을 읽어요.' : '') + '</li>' +
        '<li><b>그때 엄마의 음력 나이</b> ' + R.age + '세예요. 음력 ' + by + '년생' + (!lunarBirth && by !== bc.y ? '(양력 생일이 그해 설날 ' + fmt(newYear(bc.y)) + '보다 앞서서)' : '') + '이라 ' + (R.age - 1 + by) + ' − ' + by + ' + 1 = ' + R.age + '세예요.' + ageNote + '</li>' +
        (R.v ? '<li><b>표</b> ' + R.age + '세 줄과 ' + R.month + '월 칸이 만나는 곳은 ' + word(R.v) + '이에요.</li>' : '') + '</ol>';
      if (R.v) {
        var notes = [], seen = {};
        [-2, -1, 1, 2].forEach(function (k) {
          var NL = lunar(z + k); if (!NL) return;
          var N = read(NL, by);
          if (!N.v || (N.month === R.month && N.age === R.age)) return;
          var key = N.age + '-' + N.month; if (seen[key]) return; seen[key] = 1;
          notes.push((k < 0 ? -k + '일 앞은' : k + '일 뒤는') + ' 음력 ' + N.month + '월' + (N.age !== R.age ? '(' + N.age + '세)' : '') + '이라 ' + word(N.v));
        });
        if (notes.length) html += '<p>임신한 날이 음력 달이 바뀌는 날과 가까워요. 임신한 날은 추정이라 옆 날도 함께 보세요: ' + notes.join(', ') + '.</p>';
        var cn = DIFF[c.y + '-' + c.m + '-' + c.d];
        if (cn) {
          var C = read({ year: cn[0], month: cn[1], leap: !!cn[2], day: cn[3] }, by);
          html += '<p>이날은 중국 음력으로는 ' + cn[0] + '년 ' + (cn[2] ? '윤' : '') + cn[1] + '월 ' + cn[3] + '일이에요. 중국 음력으로 보면 ' + C.age + '세 줄 ' + C.month + '월 칸이라 ' + (C.v ? word(C.v) : '표 밖') + '이에요.</p>';
        }
        var a = document.getElementById('c-' + R.age + '-' + R.month), y = document.getElementById('y' + (R.age - 1 + by) + '-' + R.age + '-' + R.month);
        if (a) a.className += ' on';
        if (y) y.className += ' on';
      }
      out.innerHTML = html;
      try { if (window.gtag) window.gtag('event', 'gender_calendar', { kind: kind, cal: lunarBirth ? 'lunar' : 'solar' }); } catch (e) { /* 무시 */ }
    }
    $('#gc-bcal').addEventListener('change', function () { $('#gc-leap-wrap').hidden = this.value !== 'lunar'; go(); });
    $('#gc-go').addEventListener('click', go);
    ['#gc-birth', '#gc-date', '#gc-kind', '#gc-bleap'].forEach(function (s) { $(s).addEventListener('change', go); });
    go();
  })();
  </script>`;

const html = shell({
  rel: '../', title, desc, canonical: SITE + URL_PATH, nav: NAV, extraHead: STYLE, og: 'ko-gender', ogTitle: h1,
  jsonld: [
    breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: h1, url: SITE + URL_PATH }]),
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: h1, url: SITE + URL_PATH, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', inLanguage: 'ko', dateModified: MODIFIED, offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ],
  body,
});
const out = path.join(DOCS, URL_PATH.slice(1), 'index.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
fs.writeFileSync(path.join(DOCS, 'sitemap-jungguk.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  `  <url><loc>${SITE}${URL_PATH}</loc><lastmod>${MODIFIED}</lastmod><changefreq>monthly</changefreq></url>`, '</urlset>', ''].join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-jungguk.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-jungguk.xml\n');
console.log(`중국 황실 달력 한국어판 — ${URL_PATH} · 표 ${LYA}·${LYB} · 예: ${EX.age}세 ${EX.L.month}월 ${W(EX.v)} · 한·중 다른 날 ${diffInYears.length}일 · 아들 칸 ${boys}/336`);
