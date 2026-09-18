/* 이름 한자 사전 — /naming/hanja/ 허브 + /naming/hanja/<음>/ (음마다 한 장, 한자 수십 자를 한 표로)
 *  글자 목록·자원오행·자리·성별 느낌: tools/en-name-data.mjs (영문 이름 생성기와 같은 목록)
 *  음·인명용 여부·부수·획수: tools/hanja-unihan.mjs (Unicode Unihan 발췌) — kHangul 의 E(교육용)·N(인명용) 출처가 그 음에 붙은 글자만 싣는다
 *  원획: 강희자전 부수 원형(氵→水 4, 艹→艸 6, 王→玉 5, 阝→阜 8·邑 7, 辶→辵 7 …) 획 + 나머지 획, 쓰는 획수보다 작으면 쓰는 획수.
 *        한국 자전과 획을 다르게 세는 글자는 STROKE_FIX 로 고친다(成 7획 계열, 熙 13획). 작명 도구 naming.js 160자와 전부 맞는지 빌드 때 확인.
 *  뜻: tools/hanja-names-ko.mjs (naming.js 에 있는 글자는 그 뜻) · 발음오행: 훈민정음 오음(naming.js 와 같은 표)
 *  한 자씩 페이지를 만들지 않고 음별로 묶었다 — 얇은 페이지 수백 장보다 음마다 충실한 한 장이 낫다(애드센스 '가치 낮은 콘텐츠' 반려 이력).
 * 사용: node tools/build-hanja.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { SYLLABLES } from './en-name-data.mjs';
import { UNIHAN } from './hanja-unihan.mjs';
import { KO_MEAN, EXCLUDE } from './hanja-names-ko.mjs';

const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-18';
const EL_HAN = { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' };
const EL_ORDER = ['목', '화', '토', '금', '수'];
const NAV = (rel) => [{ href: rel, label: '사주 보기' }, { href: rel + 'naming/', label: '이름 짓기' }, { href: rel + 'naming/hanja/', label: '이름 한자 사전' }];

/* ---------- 부수: 강희 부수 번호 → 원형 글자·이름·획수 ---------- */
const RAD_STROKES = (n) => n <= 6 ? 1 : n <= 29 ? 2 : n <= 60 ? 3 : n <= 94 ? 4 : n <= 117 ? 5 : n <= 146 ? 6 : n <= 166 ? 7 : n <= 175 ? 8 : n <= 186 ? 9 : n <= 194 ? 10 : n <= 200 ? 11 : n <= 204 ? 12 : n <= 208 ? 13 : n <= 210 ? 14 : n <= 211 ? 15 : n <= 213 ? 16 : 17;
const RAD_NAME = {
  5: '乙 새 을', 15: '冫 이수변', 16: '几 안석 궤', 18: '刀·刂 칼 도', 27: '厂 민엄호', 30: '口 입 구', 31: '囗 큰입구몸', 32: '土 흙 토', 35: '夊 천천히걸을쇠발', 37: '大 큰 대',
  38: '女 계집 녀', 40: '宀 갓머리', 46: '山 메 산', 47: '巛 개미허리(내 천)', 50: '巾 수건 건', 53: '广 엄호', 54: '廴 민책받침', 57: '弓 활 궁', 59: '彡 터럭 삼', 60: '彳 두인변',
  61: '心·忄 마음 심', 62: '戈 창 과', 64: '手·扌 손 수', 67: '文 글월 문', 72: '日 날 일', 75: '木 나무 목', 77: '止 그칠 지', 85: '水·氵 물 수', 86: '火·灬 불 화', 96: '玉·王 구슬 옥',
  100: '生 날 생', 102: '田 밭 전', 106: '白 흰 백', 109: '目 눈 목', 111: '矢 화살 시', 115: '禾 벼 화', 118: '竹 대 죽', 119: '米 쌀 미', 120: '糸 실 사', 123: '羊 양 양',
  124: '羽 깃 우', 127: '耒 쟁기 뢰', 133: '至 이를 지', 140: '艸·艹 풀 초', 145: '衣·衤 옷 의', 149: '言 말씀 언', 154: '貝 조개 패', 155: '赤 붉을 적', 157: '足 발 족', 159: '車 수레 거',
  161: '辰 별 진', 162: '辵·辶 책받침', 163: '邑·阝 고을 읍(우부방)', 164: '酉 닭 유', 166: '里 마을 리', 167: '金 쇠 금', 169: '門 문 문', 170: '阜·阝 언덕 부(좌부변)', 173: '雨 비 우',
  174: '靑 푸를 청', 177: '革 가죽 혁', 184: '食 밥 식', 186: '香 향기 향', 187: '馬 말 마', 195: '魚 물고기 어', 212: '龍 용 룡'
};
/* 유니코드 나머지 획이 강희자전과 다른 글자 — Unihan kRSAdobe_Japan1_6·자전과 대조해 고쳤다(2026-09-18)
 *  成 계열: 유니코드 6획, 한국 자전·성명학 7획(戈부 3획) · 熙 13획(火부 9획) · 路 계열: 路 는 13획인데 璐·潞·蕗·露 의 나머지를 12로 셈
 *  巋(歸 18) · 斌(武 8) · 廙(異 11) · 柴(此 6) · 郎(良 7, 유니코드는 점 없는 良 6) · 延(한국 자전 7획, 유니코드 총획 8은 대만 자형) */
const STROKE_FIX = { '成': 7, '誠': 14, '城': 10, '晟': 11, '珹': 12, '宬': 10, '娍': 10, '熙': 13, '凞': 15,
  '璐': 18, '潞': 17, '蕗': 19, '露': 21, '巋': 21, '斌': 12, '廙': 14, '柴': 10, '郎': 14, '延': 7 };
const NUM_STROKE = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };

function uni(ch) {
  const u = UNIHAN[ch];
  if (!u || !u[0]) return null;
  const m = u[0].split(' ')[0].match(/^(\d+)('*)\.(-?\d+)$/);
  const rad = +m[1], rest = +m[3];
  const tot = u[1].split(' ').map(Number), written = tot[tot.length - 1];
  const won = STROKE_FIX[ch] || NUM_STROKE[ch] || Math.max(written, RAD_STROKES(rad) + rest);
  const readings = u[2].split(' ').filter(Boolean).map((x) => { const [r, src] = x.split(':'); return { r, src: src || '' }; });
  return { rad, rest, written, won, readings };
}

/* 두음법칙 정규화 — 련→연, 률→율, 녕→영, 로→노 … (이름 첫소리 음과 사전 음을 같은 것으로 본다) */
const YV = [20, 2, 6, 12, 17, 7];   /* ㅣ ㅑ ㅕ ㅛ ㅠ ㅖ */
function norm(s) {
  const c = s.charCodeAt(0) - 0xAC00; let ini = Math.floor(c / 588); const med = Math.floor((c % 588) / 28), fin = c % 28;
  if (ini === 5) ini = YV.includes(med) ? 11 : 2;
  else if (ini === 2 && YV.includes(med)) ini = 11;
  return String.fromCharCode(0xAC00 + ini * 588 + med * 28 + fin);
}
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const CHO_EL = { 'ㄱ': '목', 'ㄲ': '목', 'ㅋ': '목', 'ㄴ': '화', 'ㄷ': '화', 'ㄸ': '화', 'ㄹ': '화', 'ㅌ': '화', 'ㅇ': '토', 'ㅎ': '토', 'ㅅ': '금', 'ㅆ': '금', 'ㅈ': '금', 'ㅉ': '금', 'ㅊ': '금', 'ㅁ': '수', 'ㅂ': '수', 'ㅃ': '수', 'ㅍ': '수' };
const choOf = (s) => CHO[Math.floor((s.charCodeAt(0) - 0xAC00) / 588)];

/* ---------- 작명 도구(naming.js) 160자 — 뜻을 가져오고 원획이 맞는지 확인 ---------- */
const NM = {};
for (const m of fs.readFileSync(path.join(DOCS, 'js', 'naming.js'), 'utf8').matchAll(/\{ h: '(.)', r: '(.)', s: (\d+), e: '(.)', m: '([^']*)'/g)) NM[m[1]] = { r: m[2], s: +m[3], e: m[4], m: m[5] };
const strokeDiff = Object.entries(NM).filter(([h, x]) => { const u = uni(h); return !u || u.won !== x.s; });
if (strokeDiff.length) throw new Error('작명 도구와 원획이 다름: ' + strokeDiff.map(([h, x]) => `${h} ${x.s}/${uni(h) && uni(h).won}`).join(' '));

/* ---------- 음별 목록 ---------- */
const POS_KO = { first: '앞 글자에 많이', last: '뒤 글자에 많이', both: '앞·뒤 모두' };
const G_KO = { f: '여자 이름에 많이', m: '남자 이름에 많이', n: '남녀 모두' };
const skipped = [];
const groups = SYLLABLES.map((S) => {
  const items = [];
  for (const h of S.hj) {
    if (EXCLUDE[h.h]) { skipped.push(`${h.h}(${S.s}) 뜻`); continue; }
    const u = uni(h.h);
    if (!u) { skipped.push(`${h.h}(${S.s}) 자료 없음`); continue; }
    const hit = u.readings.filter((x) => norm(x.r) === norm(S.s));
    if (!hit.length || !hit.some((x) => /[EN]/.test(x.src))) { skipped.push(`${h.h}(${S.s}) 인명용 음 아님`); continue; }
    const mean = (NM[h.h] && NM[h.h].m) || KO_MEAN[h.h];
    if (!mean) throw new Error('뜻 없음: ' + h.h);
    const dict = hit.find((x) => /[EN]/.test(x.src)).r;   /* 사전 음 — 련·률처럼 두음법칙 전의 음일 수 있다 */
    items.push({ h: h.h, el: h.el, mean, dict, edu: hit.some((x) => /E/.test(x.src)), rad: u.rad, won: u.won, written: u.written });
  }
  return { s: S.s, rr: S.rr, g: S.g, pos: S.pos, pop: S.pop, items };
}).filter((g) => g.items.length);
const slugOf = (g) => g.rr.replace(/[^a-z]/g, '');
{ const seen = new Set(); groups.forEach((g) => { const k = slugOf(g); if (seen.has(k)) throw new Error('주소 겹침 ' + k); seen.add(k); }); }

/* ---------- 공용 ---------- */
const STYLE = `<style>
    .hj-meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 8px; }
    .hj-meta span { font-size: 12px; padding: 3px 9px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); }
    .hj-meta span b { color: var(--ink); font-weight: 600; }
    .hj-table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 6px 0 14px; }
    .hj-table th, .hj-table td { padding: 9px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .hj-table th { font-size: 12px; color: var(--muted); font-weight: 500; }
    .hj-table td.h { font-family: 'Noto Serif KR', serif; font-size: 24px; line-height: 1.1; width: 40px; }
    .hj-table td small { color: var(--faint); display: block; font-size: 11.5px; margin-top: 2px; }
    .hj-el { display: inline-block; font-size: 11.5px; padding: 1px 8px; border-radius: 999px; border: 1px solid var(--line); }
    .hj-el.목 { color: #2F6B3A; border-color: #9CC3A3; } .hj-el.화 { color: #B8382D; border-color: #E2A59E; } .hj-el.토 { color: #8A6A1F; border-color: #D9C38A; }
    .hj-el.금 { color: #6E6455; border-color: #C9C0B0; } .hj-el.수 { color: #2A4B7C; border-color: #9DB3D6; }
    .hj-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 8px 0 16px; }
    .hj-grid a { display: block; padding: 8px 4px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; text-decoration: none; color: inherit; text-align: center; }
    .hj-grid a b { display: block; font-family: 'Noto Serif KR', serif; font-size: 18px; }
    .hj-grid a small { display: block; font-size: 11px; color: var(--faint); margin-top: 2px; }
    .hj-grid a.cur { border-color: var(--seal); background: #FBF3E6; }
    @media (max-width: 480px) { .hj-grid { grid-template-columns: repeat(4, 1fr); } .hj-table td.h { font-size: 22px; } }
  </style>`;
function write(url, o) {
  const file = path.join(DOCS, url.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, shell(o));
}
const faqLd = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const article = (url, title, desc) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: PUBLISHED, dateModified: PUBLISHED, inLanguage: 'ko', author: { '@type': 'Organization', name: '사주첩' }, publisher: { '@type': 'Organization', name: '사주첩' }, mainEntityOfPage: SITE + url });
const urls = [];
const radLabel = (n) => RAD_NAME[n] || '';
const strokeCell = (x) => x.won === x.written ? `${x.won}획` : `${x.won}획<small>쓰는 획수 ${x.written}획</small>`;

/* ---------- 음별 페이지 ---------- */
function sylPage(g, idx) {
  const url = `/naming/hanja/${slugOf(g)}/`, rel = '../../../';
  const cho = choOf(g.s), soundEl = CHO_EL[cho];
  const byEl = EL_ORDER.map((e) => ({ e, list: g.items.filter((x) => x.el === e) })).filter((x) => x.list.length);
  const dictNote = [...new Set(g.items.filter((x) => x.dict !== g.s).map((x) => x.dict))];
  const rows = g.items.map((x) => `<tr><td class="h">${x.h}</td><td><b>${esc(x.mean)} ${x.dict}</b>${x.dict !== g.s ? `<small>이름 첫소리에선 '${g.s}'</small>` : ''}<small>${radLabel(x.rad)}</small></td><td>${strokeCell(x)}</td><td><span class="hj-el ${x.el}">${x.el}(${EL_HAN[x.el]})</span></td></tr>`).join('\n        ');
  const listText = g.items.map((x) => x.h).join('·');
  const title = `이름 한자 '${g.s}' — ${g.items.slice(0, 6).map((x) => x.h).join('·')} 뜻·원획·자원오행`;
  const desc = `이름에 쓰는 '${g.s}' 한자 ${g.items.length}자(${g.items.slice(0, 8).map((x) => `${x.h} ${x.mean}`).join(', ')}…)의 뜻과 원획, 자원오행을 한 표로. 모두 인명용 한자이고, '${g.s}'의 발음오행은 ${soundEl}(${EL_HAN[soundEl]})입니다.`;
  const faq = [
    [`이름 한자 '${g.s}'에는 어떤 글자가 있나요?`, `인명용 한자 중 이름에 자주 쓰는 ${g.items.length}자를 모았습니다: ${listText}. 뜻과 획수, 자원오행은 표에 정리했어요.`],
    [`'${g.s}'의 발음오행은 무엇인가요?`, `첫소리 ${cho}은 훈민정음 오음으로 ${soundEl}(${EL_HAN[soundEl]})입니다. 발음오행은 한자와 상관없이 소리로 정해지고, 자원오행은 한자의 부수로 정해져서 같은 '${g.s}'라도 한자마다 자원오행이 다릅니다.`],
    [`'${g.s}' 한자 중 자원오행이 ${byEl.map((x) => x.e).join('·')}인 글자는?`, byEl.map((x) => `${x.e}(${EL_HAN[x.e]}) — ${x.list.map((y) => y.h).join('·')}`).join(' / ') + '.']
  ];
  const others = groups.map((o) => `<a href="${rel}naming/hanja/${slugOf(o)}/"${o === g ? ' class="cur"' : ''}><b>${o.s}</b><small>${o.items.length}자</small></a>`).join('');
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}naming/hanja/" style="color: inherit; text-decoration: none;">이름 한자 사전</a> · ${g.s}</div>
    <h1 class="ga-title">이름 한자 '${g.s}' —<br>${g.items.length}자의 뜻·원획·자원오행</h1>
    <div class="hj-meta"><span>발음오행 <b>${soundEl}(${EL_HAN[soundEl]})</b></span><span>자리 <b>${POS_KO[g.pos]}</b></span><span>느낌 <b>${G_KO[g.g]}</b></span><span>한자 <b>${g.items.length}자</b></span></div>
    <p class="ga-lead">'${g.s}'는 이름에 ${g.pop >= 3 ? '아주 자주' : g.pop === 2 ? '자주' : '종종'} 쓰는 음이에요. 같은 '${g.s}'라도 어떤 한자를 고르느냐에 따라 뜻과 획수, 자원오행이 달라집니다. 아래 ${g.items.length}자는 모두 대법원 인명용 한자(교육용 기초한자 포함)에 드는 글자예요.${dictNote.length ? ` 사전 음이 ${dictNote.map((d) => `'${d}'`).join('·')}인 글자는 이름 첫소리에서 두음법칙에 따라 '${g.s}'로 읽습니다.` : ''}</p>
    <div class="ga-body">
      <h2>'${g.s}' 한자 ${g.items.length}자</h2>
      <table class="hj-table">
        <tr><th>한자</th><th>뜻·음 / 부수</th><th>원획</th><th>자원오행</th></tr>
        ${rows}
      </table>
      <h2>자원오행으로 고르기</h2>
      <p>사주에 부족한 오행이 있으면 그 오행의 한자를 고르는 것이 작명의 기본입니다. '${g.s}' 한자를 자원오행별로 나누면:</p>
      <ul>
        ${byEl.map((x) => `<li><b>${x.e}(${EL_HAN[x.e]})</b> — ${x.list.map((y) => `${y.h}(${esc(y.mean)})`).join(', ')}</li>`).join('\n        ')}
      </ul>
      <p>내 사주에 어떤 오행이 부족한지는 <a href="${rel}">생년월일로 사주</a>를 풀면 오행 분포로 바로 보이고, <a href="${rel}naming/">이름 짓기 도구</a>에서 성과 이름 두 글자를 넣으면 81수리 네 격과 발음오행까지 함께 풀어 줍니다.</p>
      <h2>자주 묻는 질문</h2>
      ${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n      ')}
      <h2>다른 음의 이름 한자</h2>
      <div class="hj-grid">${others}</div>
      <p class="callout">원획은 성명학에서 쓰는 강희자전 부수 원형 기준입니다(氵은 水 4획, 艹은 艸 6획, 王은 玉 5획, 阝은 阜 8획·邑 7획으로 셈). 쓰는 획수와 다르면 함께 적었어요. 자전·유파에 따라 한두 획 다르게 세는 글자도 있습니다.</p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}naming/"><span class="seal-dot" aria-hidden="true"></span><span>이 한자로 이름 풀어 보기</span></a>
    </div>
  </article>`;
  write(url, { rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '이름 한자 사전', url: SITE + '/naming/hanja/' }, { name: `'${g.s}' 한자`, url: SITE + url }]), article(url, title, desc), faqLd(faq)], body });
  urls.push(url);
}

/* ---------- 허브 ---------- */
function hub() {
  const url = '/naming/hanja/', rel = '../../';
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const cells = groups.slice().sort((a, b) => a.s.localeCompare(b.s, 'ko')).map((g) => `<a href="${rel}naming/hanja/${slugOf(g)}/"><b>${g.s}</b><small>${g.items.slice(0, 3).map((x) => x.h).join('')} · ${g.items.length}자</small></a>`).join('');
  const byEl = EL_ORDER.map((e) => {
    const list = [];
    for (const g of groups) for (const x of g.items) if (x.el === e) list.push({ g, x });
    return `<h3>${e}(${EL_HAN[e]}) — ${list.length}자</h3>\n      <p>${list.map(({ g, x }) => `<a href="${rel}naming/hanja/${slugOf(g)}/">${x.h}</a>`).join(' ')}</p>`;
  }).join('\n      ');
  const title = '이름 한자 사전 — 인명용 한자의 뜻·원획·자원오행 (음별)';
  const desc = `이름에 쓰는 인명용 한자 ${total}자를 음별로. 서·연·윤·지·준·현·민·하·은처럼 이름에 자주 쓰는 ${groups.length}개 음의 한자마다 뜻, 원획, 자원오행을 한 표로 정리했어요. 발음오행과 두음법칙도 함께.`;
  const faq = [
    ['자원오행이란 무엇인가요?', '한자가 가진 오행입니다. 보통 부수로 정해서 氵(물)이 들어가면 수, 木이 들어가면 목, 日·火가 들어가면 화, 土·山이 들어가면 토, 金·玉이 들어가면 금으로 봅니다. 사주에 부족한 오행을 이름 한자로 채울 때 씁니다.'],
    ['원획은 쓰는 획수와 어떻게 다른가요?', '성명학은 부수를 원래 글자의 획수로 셉니다. 氵은 水의 4획, 艹은 艸의 6획, 王(玉)은 5획, 왼쪽 阝은 阜의 8획, 오른쪽 阝은 邑의 7획, 辶은 辵의 7획으로 세서 쓰는 획수보다 많아질 수 있어요. 81수리는 이 원획으로 계산합니다.'],
    ['여기 있는 한자는 모두 이름에 쓸 수 있나요?', '네. 유니코드 한자 데이터베이스(Unihan)에서 그 음으로 교육용 기초한자나 대법원 인명용 한자에 드는 글자만 실었습니다. 인명용 한자표는 개정될 수 있으니 출생신고 전에는 대법원 전자가족관계등록시스템에서 한 번 더 확인하세요.']
  ];
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}naming/" style="color: inherit; text-decoration: none;">이름 짓기</a> · 이름 한자 사전</div>
    <h1 class="ga-title">이름 한자 사전 —<br>${groups.length}개 음, ${total}자</h1>
    <p class="ga-meta">인명용 한자 · 뜻 · 원획(강희자전 부수 원형) · 자원오행 · 발음오행</p>
    <p class="ga-lead">이름에 자주 쓰는 음마다 인명용 한자를 모아 뜻과 원획, 자원오행을 정리했습니다. 음을 누르면 그 음의 한자가 한 표로 나와요. 한자를 고른 뒤에는 <a href="${rel}naming/">이름 짓기 도구</a>에서 81수리와 발음오행까지 풀어 볼 수 있어요.</p>
    <div class="ga-body">
      <h2>음으로 찾기</h2>
      <div class="hj-grid">${cells}</div>
      <h2>자원오행으로 찾기</h2>
      ${byEl}
      <h2>자주 묻는 질문</h2>
      ${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n      ')}
      <p class="callout">음·획수·인명용 여부는 유니코드 한자 데이터베이스(Unihan, Unicode 18.0)에서 가져와 계산했고, 뜻은 사주첩이 정리했습니다. <a href="${rel}naming/">이름 짓기</a> · <a href="${rel}guide/ohaeng.html">오행 완전 정리</a> · <a href="${rel}guide/yongsin.html">용신 — 내 사주에 필요한 오행</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}naming/"><span class="seal-dot" aria-hidden="true"></span><span>이름 짓기 도구로 가기</span></a>
    </div>
  </article>`;
  write(url, { rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '이름 짓기', url: SITE + '/naming/' }, { name: '이름 한자 사전', url: SITE + url }]), faqLd(faq)], body });
  urls.unshift(url);
}

groups.forEach(sylPage);
hub();
fs.writeFileSync(path.join(DOCS, 'sitemap-hanja.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${PUBLISHED}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-hanja.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-hanja.xml\n');
console.log(`이름 한자 사전 — 음 ${groups.length}장 · 한자 ${groups.reduce((n, g) => n + g.items.length, 0)}자 + 허브, 뺀 글자 ${skipped.length} (${skipped.join(' ')})`);
