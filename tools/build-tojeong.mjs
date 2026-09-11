/* 토정비결 정적 페이지 — /tojeong/2027/ (정미년 괘 찾기표: 음력 출생연도→상괘 · 음력 생월→중괘 · 생월·생일→하괘, 2027 음력 달)
 * + /tojeong/gwae/ (144괘 번호표와 상·중·하괘 풀이 한 장). 계산·풀이는 도구와 같은 docs/js/tojeong.js 를 불러 쓰고,
 * 표로 찾은 괘가 도구의 compute() 와 같은지 무작위 생일 500개로 확인한다. sitemap-tojeong.xml 을 만들고 robots.txt 에 등록.
 * 해를 바꾸려면 FY 만 고치면 된다(풀이 본문은 해마다 같고, 찾기표만 해마다 달라진다). */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';

const { M, W } = loadEngine(['tojeong']);
const TJ = W.Tojeong;
const { SANG, JUNG, HA } = TJ.parts;
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const FY = 2027;
const PUBLISHED = '2026-09-12';
const Y_MIN = 1930;
const mod1 = TJ._mod1;
const cal = new W.KoreanLunarCalendar();
const WD = '일월화수목금토';
const STEM_SU = [9, 8, 7, 6, 5, 9, 8, 7, 6, 5];
const BRANCH_SU = [9, 8, 7, 6, 5, 4, 9, 8, 7, 6, 5, 4];
const WOL_START = { 0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0 };
const han = (s, b) => M.STEMS[s].han + M.BRANCHES[b].han;
const kor = (s, b) => M.STEMS[s].kor + M.BRANCHES[b].kor;
const wd = (y, m, d) => WD[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];

/* ---------- 2027 찾기표 ---------- */
const YS = ((FY - 4) % 10 + 10) % 10, YB = ((FY - 4) % 12 + 12) % 12;
const TAESE = TJ.taeseSu(FY);
if (TAESE !== STEM_SU[YS] + BRANCH_SU[YB]) throw new Error('태세수 불일치');
const sangOf = (ly) => mod1((FY - ly + 1) + TAESE, 8);
const sangYears = Array.from({ length: 8 }, () => []);
for (let ly = FY; ly >= Y_MIN; ly--) sangYears[sangOf(ly) - 1].push(ly);

const MONTHS = [];
for (let m = 1; m <= 12; m++) {
  const days = cal.setLunarDate(FY, m, 30, false) ? 30 : 29;
  const stem = (WOL_START[YS] + (m - 1)) % 10, branch = (2 + (m - 1)) % 12;
  const su = TJ.wolgeonSu(FY, m);
  if (su !== STEM_SU[stem] + BRANCH_SU[branch]) throw new Error('월건수 불일치 ' + m);
  cal.setLunarDate(FY, m, 1, false);
  const s = cal.getSolarCalendar();
  MONTHS.push({ m, days, stem, branch, su, jung: mod1(days + su, 6), start: { y: s.year, m: s.month, d: s.day } });
}
/* 하괘 — 소월의 30일생은 29일로(도구와 같다) */
const HA_GRID = MONTHS.map((mo) => Array.from({ length: 30 }, (_, i) => {
  let use = i + 1;
  if (!cal.setLunarDate(FY, mo.m, use, false)) { use = 29; cal.setLunarDate(FY, mo.m, use, false); }
  const s = cal.getSolarCalendar();
  const dp = M.dayPillarOf(s.year, s.month, s.day);
  return { d: i + 1, use, ha: mod1(use + STEM_SU[dp.stem] + BRANCH_SU[dp.branch], 3) };
}));
const codeOf = (ly, lm, ld) => sangOf(ly) * 100 + MONTHS[lm - 1].jung * 10 + HA_GRID[lm - 1][ld - 1].ha;

/* 찾기표 = 도구: 무작위 양력 생일 500개를 도구의 compute() 와 대조 */
{
  let seed = 20270101;
  const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const t0 = Date.UTC(1935, 0, 1), t1 = Date.UTC(2020, 11, 31);
  let n = 0;
  for (let i = 0; i < 500; i++) {
    const dt = new Date(t0 + Math.floor(rand() * (t1 - t0)));
    const b = { sy: dt.getUTCFullYear(), sm: dt.getUTCMonth() + 1, sd: dt.getUTCDate() };
    const r = TJ.compute(FY, b);
    if (!r) continue;
    const c = codeOf(r.lunarBirth.y, r.lunarBirth.m, r.lunarBirth.d);
    if (c !== r.code) throw new Error(`찾기표와 도구가 다름 ${JSON.stringify(b)}: 표 ${c} / 도구 ${r.code}`);
    n++;
  }
  console.log(`찾기표 = 도구 compute(): ${n}건 일치`);
}

/* ---------- 공용 ---------- */
const urls = [];
function write(url, html) {
  const file = path.join(DOCS, url.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  urls.push(url);
}
const NAV = (rel) => [{ href: rel, label: '사주 보기' }, { href: rel + 'tojeong/', label: '토정비결' }, { href: rel + '2027/', label: '2027 신년운세' }, { href: rel + 'ddi-gunghap/', label: '띠 궁합' }];
const STYLE = `<style>
    .tj-table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 6px 0 14px; }
    .tj-table th, .tj-table td { padding: 8px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .tj-table th { font-size: 12px; color: var(--muted); font-weight: 500; }
    .tj-table td b.k { font-family: 'Noto Serif KR', serif; font-size: 17px; color: var(--seal); }
    .tj-table td small { display: block; color: var(--faint); font-size: 11.5px; margin-top: 2px; }
    .tj-table tr:target td { background: #FBF3E6; }
    .tj-years { line-height: 1.9; font-size: 13px; }
    .tj-wrap { overflow-x: auto; }
    .tj-months { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 8px 0 16px; }
    .tj-month { padding: 10px 10px 8px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; }
    .tj-month h3 { font-family: 'Noto Serif KR', serif; font-size: 14px; margin: 0 0 6px; }
    .tj-month h3 small { font-family: 'Noto Sans KR', sans-serif; font-weight: 400; color: var(--faint); font-size: 11px; margin-left: 4px; }
    .tj-days { display: grid; grid-template-columns: repeat(10, 1fr); gap: 3px; }
    .tj-days span { text-align: center; font-size: 10px; color: var(--faint); padding: 3px 0 2px; border-radius: 5px; background: #F6F1E8; line-height: 1.2; }
    .tj-days span b { display: block; font-size: 14px; color: var(--ink); }
    .tj-days span.h1 { background: #F4EBDD; } .tj-days span.h2 { background: #EAF0E6; } .tj-days span.h3 { background: #EDE8F1; }
    .tj-days span.x { opacity: .55; }
    .tj-box { margin: 10px 0 16px; padding: 14px 16px; background: #221D17; color: #F6F1E8; border-radius: 12px; font-size: 14px; line-height: 1.7; }
    .tj-box b { color: #E0B04A; font-family: 'Noto Serif KR', serif; }
    .tj-box a { color: #F6F1E8; }
    .tj-part { padding: 12px 0; border-bottom: 1px solid var(--line-soft); }
    .tj-part h3 { font-family: 'Noto Serif KR', serif; font-size: 16px; margin: 0 0 4px; }
    .tj-part h3 small { font-family: 'Noto Sans KR', sans-serif; font-weight: 400; color: var(--faint); font-size: 12px; margin-left: 6px; }
    .tj-part p { margin: 4px 0; font-size: 14px; line-height: 1.75; }
    @media (max-width: 480px) { .tj-months { grid-template-columns: 1fr; } }
  </style>`;
const crumbs = (items) => breadcrumb([{ name: '사주첩', url: SITE + '/' }].concat(items.map(([name, url]) => ({ name, url: SITE + url }))));
const article = (url, title, desc) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: PUBLISHED, dateModified: PUBLISHED, inLanguage: 'ko', author: { '@type': 'Organization', name: '사주첩' }, publisher: { '@type': 'Organization', name: '사주첩' }, mainEntityOfPage: SITE + url });
const titleOf = (code) => TJ.text(code).title;

/* ---------- /tojeong/2027/ ---------- */
function yearPage() {
  const url = `/tojeong/${FY}/`, rel = '../../';
  const ex = { y: 1990, m: 3, d: 15 };
  const exCode = codeOf(ex.y, ex.m, ex.d), exT = TJ.text(exCode);
  const exAge = FY - ex.y + 1;
  const sangRows = SANG.map((S, i) => `<tr><td style="width: 46%;"><b class="k">${i + 1}</b> ${S.name}<small>${S.han} — ${esc(S.gloss)}</small></td><td class="tj-years">${sangYears[i].join(' · ')}</td></tr>`).join('');
  const jungRows = MONTHS.map((mo) => `<tr><td>음력 ${mo.m}월</td><td>${mo.days}일<small>${han(mo.stem, mo.branch)}월 · 수 ${mo.su}</small></td><td><b class="k">${mo.jung}</b></td><td>${JUNG[mo.jung - 1].han}<small>${JUNG[mo.jung - 1].short}</small></td></tr>`).join('');
  const grids = MONTHS.map((mo, mi) => `<div class="tj-month"><h3>음력 ${mo.m}월<small>${FY}년 ${mo.days}일까지</small></h3><div class="tj-days">${HA_GRID[mi].map((c) => `<span class="h${c.ha}${c.use !== c.d ? ' x' : ''}" title="${mo.m}월 ${c.d}일생 → 하괘 ${c.ha}${c.use !== c.d ? ' (29일로 봄)' : ''}">${c.d}<b>${c.ha}</b></span>`).join('')}</div></div>`).join('');
  const calRows = MONTHS.map((mo) => `<tr><td>음력 ${mo.m}월</td><td>${mo.start.y}년 ${mo.start.m}월 ${mo.start.d}일(${wd(mo.start.y, mo.start.m, mo.start.d)})</td><td>${mo.days}일</td><td>${han(mo.stem, mo.branch)}월</td></tr>`).join('');
  const title = `${FY} 토정비결 무료 — 정미년 괘 찾기표(출생연도·생월·생일)와 144괘 풀이`;
  const desc = `${FY}년 정미년(丁未年) 토정비결을 표로 찾습니다. 태세수 ${TAESE}로 음력 출생연도→상괘, 음력 생월→중괘, 생월·생일→하괘를 찾아 세 자리 괘 번호를 만들고, 144괘 풀이와 ${FY}년 음력 달까지 한 페이지에.`;
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}tojeong/" style="color: inherit; text-decoration: none;">토정비결</a> · ${FY} 정미년</div>
    <h1 class="ga-title">${FY} 토정비결 —<br>정미년 괘 찾기표</h1>
    <p class="ga-meta">음력 생년월일로 세 자리 괘를 찾는 표 · 계산은 사주첩 토정비결 도구와 같습니다</p>
    <p class="ga-lead">토정비결은 태어난 해·달·날을 신수를 볼 해의 간지와 맞춰 세 자리 괘를 뽑고, 그 괘로 한 해의 흐름을 봅니다. ${FY}년은 정미년(丁未年)이라 태세수가 ${TAESE}입니다. 아래 세 표에서 음력 출생연도·생월·생일에 맞는 숫자를 차례로 찾으면 괘 번호가 나옵니다.</p>
    <div class="tj-box">양력 생일만 알아도 됩니다. <a href="${rel}tojeong/"><b>생년월일로 바로 뽑기 →</b></a> 음력 변환부터 괘·풀이·음력 달별 흐름까지 한 번에 보여 줍니다.</div>
    <div class="ga-body">
      <h2>1. 상괘 — 음력 출생연도로</h2>
      <p>상괘는 ${FY}년 세는나이에 태세수 ${TAESE}를 더해 8로 나눈 나머지입니다(0이면 8). 세는나이는 음력 출생연도로 따지므로, 양력 1월~2월 초에 태어나 음력으로는 전년도라면 전년도 칸을 보세요.</p>
      <div class="tj-wrap"><table class="tj-table"><tr><th>상괘 · 한 해의 바탕</th><th>음력 출생연도</th></tr>${sangRows}</table></div>
      <h2>2. 중괘 — 음력 생월로</h2>
      <p>중괘는 ${FY}년 그 음력 달의 날수(29·30)에 그 달 월건의 수를 더해 6으로 나눈 나머지입니다(0이면 6). 달의 크기가 해마다 달라서, 같은 생월이라도 해마다 중괘가 바뀝니다.</p>
      <div class="tj-wrap"><table class="tj-table"><tr><th>생월</th><th>${FY}년 날수·월건</th><th>중괘</th><th>한 해의 전개</th></tr>${jungRows}</table></div>
      <h2>3. 하괘 — 음력 생월·생일로</h2>
      <p>하괘는 음력 생일에 ${FY}년 그 음력 날짜의 일진 수를 더해 3으로 나눈 나머지입니다(0이면 3). 칸마다 위는 생일, 아래 굵은 숫자가 하괘입니다. 30일생인데 ${FY}년 그 달이 29일에서 끝나면 29일로 보고(흐린 칸), 윤달생은 본달로 봅니다.</p>
      <div class="tj-months">${grids}</div>
      <h2>4. 괘 번호 읽기</h2>
      <p>상괘가 백의 자리, 중괘가 십의 자리, 하괘가 일의 자리입니다. 예를 들어 음력 ${ex.y}년 ${ex.m}월 ${ex.d}일생은 ${FY}년 세는나이 ${exAge}세라 상괘 ${sangOf(ex.y)}, 음력 ${ex.m}월이라 중괘 ${MONTHS[ex.m - 1].jung}, ${ex.m}월 ${ex.d}일이라 하괘 ${HA_GRID[ex.m - 1][ex.d - 1].ha} — <b>제${exCode}괘 「${esc(exT.title)}」</b>입니다.</p>
      <p>번호별 풀이는 <a href="${rel}tojeong/gwae/#g${exCode}">토정비결 144괘 풀이</a>에 모아 두었습니다. 상괘는 한 해의 바탕, 중괘는 전개, 하괘는 끝맺음을 말합니다.</p>
      <h2>${FY}년 음력 달 — 월별 흐름을 볼 때</h2>
      <p>토정비결의 달별 흐름은 음력 달로 봅니다. ${FY}년 음력 달이 양력으로 언제 시작하는지 정리했습니다.</p>
      <div class="tj-wrap"><table class="tj-table"><tr><th>음력</th><th>초하루(양력)</th><th>날수</th><th>월건</th></tr>${calRows}</table></div>
      <h2>토정비결은</h2>
      <p>조선 중기 학자 토정 이지함의 이름을 빌려 전해 오는 신수 풀이로, 실제로 누가 지었는지는 분명하지 않습니다. 144괘로 한 해를 가늠하는 가벼운 풍습이라, 정초에 가족끼리 서로의 괘를 찾아보며 한 해의 마음가짐을 나누는 데 쓰였습니다. 사주첩의 풀이 본문은 옛 괘의 뜻을 오늘의 말로 새로 쓴 것입니다.</p>
      <p class="callout"><a href="${rel}tojeong/gwae/">144괘 풀이</a> · <a href="${rel}tojeong/">생년월일로 토정비결 보기</a> · <a href="${rel}2027/">${FY} 신년운세</a> · <a href="${rel}samjae/">삼재 계산</a> · <a href="${rel}ddi-gunghap/">띠 궁합</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}tojeong/"><span class="seal-dot" aria-hidden="true"></span><span>생년월일로 ${FY} 토정비결 보기</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: `${FY} 토정비결 — 정미년 괘 찾기표`,
    jsonld: [crumbs([['토정비결', '/tojeong/'], [`${FY} 토정비결`, url]]), article(url, title, desc)], body }));
}

/* ---------- /tojeong/gwae/ ---------- */
function gwaePage() {
  const url = '/tojeong/gwae/', rel = '../../';
  const groups = SANG.map((S, si) => {
    const rows = [];
    for (let j = 1; j <= 6; j++) for (let h = 1; h <= 3; h++) {
      const code = (si + 1) * 100 + j * 10 + h;
      rows.push(`<tr id="g${code}"><td><b class="k">${code}</b></td><td>${esc(titleOf(code))}<small>${JUNG[j - 1].han} · 끝맺음 「${HA[h - 1].short}」</small></td><td><a href="#sang-${si + 1}">바탕</a> · <a href="#jung-${j}">전개</a> · <a href="#ha-${h}">끝</a></td></tr>`);
    }
    return `<h3 style="margin-top: 18px;">상괘 ${si + 1} — ${S.name}의 해 <small style="font-weight: 400; color: var(--faint);">${S.han} · ${(si + 1)}11~${(si + 1)}63괘</small></h3>
      <div class="tj-wrap"><table class="tj-table"><tr><th>괘</th><th>풀이 제목</th><th>읽기</th></tr>${rows.join('')}</table></div>`;
  }).join('\n      ');
  const sangParts = SANG.map((S, i) => `<div class="tj-part" id="sang-${i + 1}"><h3>상괘 ${i + 1} · ${S.name}<small>${S.han} — ${esc(S.gloss)}</small></h3><p>${esc(S.body)}</p><p><b>조심할 것</b> ${esc(S.caution)}</p></div>`).join('');
  const jungParts = JUNG.map((J, i) => `<div class="tj-part" id="jung-${i + 1}"><h3>중괘 ${i + 1} · ${J.han}<small>${esc(J.short)}</small></h3><p>${esc(J.body)}</p><p><b>상반기와 하반기</b> ${esc(J.half)}</p></div>`).join('');
  const haParts = HA.map((H, i) => `<div class="tj-part" id="ha-${i + 1}"><h3>하괘 ${i + 1} · ${H.han}<small>${esc(H.short)}</small></h3><p>${esc(H.body)}</p></div>`).join('');
  const title = '토정비결 144괘 풀이 — 괘 번호 111~863의 뜻과 한 해의 흐름';
  const desc = '토정비결 괘 번호 세 자리(상괘·중괘·하괘)가 말하는 한 해의 바탕·전개·끝맺음. 111괘부터 863괘까지 144괘 번호표와 풀이, 올해와 내년 괘 찾는 법.';
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}tojeong/" style="color: inherit; text-decoration: none;">토정비결</a> · 144괘</div>
    <h1 class="ga-title">토정비결 144괘 풀이 —<br>괘 번호로 읽는 한 해</h1>
    <p class="ga-meta">111괘부터 863괘까지 · 상괘 8 × 중괘 6 × 하괘 3</p>
    <p class="ga-lead">괘 번호 세 자리는 각각 상괘(백의 자리)·중괘(십의 자리)·하괘(일의 자리)입니다. 상괘는 한 해의 바탕, 중괘는 한 해가 펼쳐지는 모양, 하괘는 끝맺음을 말합니다. 번호표에서 내 괘를 찾고, 아래 풀이에서 세 부분을 이어 읽으면 됩니다.</p>
    <div class="tj-box">아직 괘 번호를 모른다면 — <a href="${rel}tojeong/"><b>생년월일로 바로 뽑기 →</b></a> · <a href="${rel}tojeong/${FY}/">${FY}년 괘 찾기표</a></div>
    <div class="ga-body">
      <h2>144괘 번호표</h2>
      ${groups}
      <h2>상괘 — 한 해의 바탕</h2>
      ${sangParts}
      <h2>중괘 — 한 해의 전개</h2>
      ${jungParts}
      <h2>하괘 — 끝맺음</h2>
      ${haParts}
      <p class="callout">토정비결은 조선 중기 학자 토정 이지함의 이름을 빌려 전해 오는 신수 풀이입니다. 사주첩의 풀이는 옛 괘의 뜻을 오늘의 말로 새로 쓴 것이며, 달별 흐름은 <a href="${rel}tojeong/">토정비결 도구</a>에서 내 일간에 맞춰 보여 줍니다.</p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}tojeong/"><span class="seal-dot" aria-hidden="true"></span><span>내 괘 뽑기</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: '토정비결 144괘 풀이',
    jsonld: [crumbs([['토정비결', '/tojeong/'], ['144괘 풀이', url]]), article(url, title, desc)], body }));
}

yearPage();
gwaePage();

fs.writeFileSync(path.join(DOCS, 'sitemap-tojeong.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${PUBLISHED}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-tojeong.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-tojeong.xml\n');
console.log(`토정비결 — ${urls.join(', ')} · 태세수 ${TAESE} · sitemap-tojeong.xml`);
