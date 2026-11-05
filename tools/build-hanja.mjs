/* 이름 한자 사전 — /naming/hanja/ 허브 + /naming/hanja/<음>/ (음마다 한 장, 한자 수십 자를 한 표로)
 *  글자 목록·자원오행·자리·성별 느낌: tools/en-name-data.mjs (영문 이름 생성기와 같은 목록)
 *  음·인명용 여부·부수·획수: tools/hanja-unihan.mjs (Unicode Unihan 발췌) — kHangul 의 E(교육용)·N(인명용) 출처가 그 음에 붙은 글자만 싣는다
 *  원획: 강희자전 부수 원형(氵→水 4, 艹→艸 6, 王→玉 5, 阝→阜 8·邑 7, 辶→辵 7 …) 획 + 나머지 획, 쓰는 획수보다 작으면 쓰는 획수.
 *        한국 자전과 획을 다르게 세는 글자는 STROKE_FIX 로 고친다(成 7획 계열, 熙 13획). 작명 도구 naming.js 160자와 전부 맞는지 빌드 때 확인.
 *  뜻: tools/hanja-names-ko.mjs (naming.js 에 있는 글자는 그 뜻) · 발음오행: 훈민정음 오음(naming.js 와 같은 표)
 *  한 자씩 페이지를 만들지 않고 음별로 묶었다 — 얇은 페이지 수백 장보다 음마다 충실한 한 장이 낫다(애드센스 '가치 낮은 콘텐츠' 반려 이력).
 *  음 페이지의 안내문은 전부 그 음의 자료로 계산한다(오행별 수와 빠진 오행, 교육용 기초한자 수, 원획별 묶음, 원획이 쓰는 획수와 다른 글자와 그 이유,
 *  같은 부수 글자, 다른 음으로도 읽는 글자) — 70장에 똑같이 들어가는 문장은 길잡이(다른 음 바둑판)만. 2026-11-05
 *  수정일: 글 영역(<article>, 다른 음 바둑판 제외)이 이전 빌드 파일과 같으면 그 파일의 dateModified 를 그대로 쓰고, 다르면 REVISED. 사이트맵 lastmod 도 같은 값.
 * 사용: node tools/build-hanja.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb, picker, PICKER_STYLE } from './page-shell.mjs';
import { SYLLABLES } from './en-name-data.mjs';
import { UNIHAN } from './hanja-unihan.mjs';
import { KO_MEAN, EXCLUDE } from './hanja-names-ko.mjs';

const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-18';
const REVISED = '2026-11-05';   /* 이번 빌드에서 글 영역이 바뀐 페이지의 수정일 — 내용을 또 고치면 그날로 바꾼다(글이 그대로인 페이지는 예전 날짜 유지) */
const UNIHAN_VER = 'Unicode 18.0, 2026년 7월';
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
/* 부수가 변형(변·방·머리·받침)으로 쓰여 원획이 쓰는 획수보다 커지는 부수 — 음 페이지의 '원획이 다른 글자' 설명에 쓴다 */
const RAD_VARIANT = { 85: ['氵', '水', 4], 140: ['艹', '艸', 6], 96: ['王', '玉', 5], 170: ['왼쪽 阝', '阜', 8], 163: ['오른쪽 阝', '邑', 7], 162: ['辶', '辵', 7], 61: ['忄', '心', 4], 64: ['扌', '手', 4], 145: ['衤', '衣', 6] };
/* 유니코드 나머지 획이 강희자전과 다른 글자 — Unihan kRSAdobe_Japan1_6·자전과 대조해 고쳤다(2026-09-18)
 *  成 계열: 유니코드 6획, 한국 자전·성명학 7획(戈부 3획) · 熙 13획(火부 9획) · 路 계열: 路 는 13획인데 璐·潞·蕗·露 의 나머지를 12로 셈
 *  巋(歸 18) · 斌(武 8) · 廙(異 11) · 柴(此 6) · 郎(良 7, 유니코드는 점 없는 良 6) · 延(한국 자전 7획, 유니코드 총획 8은 대만 자형) */
const STROKE_FIX = { '成': 7, '誠': 14, '城': 10, '晟': 11, '珹': 12, '宬': 10, '娍': 10, '熙': 13, '凞': 15,
  '璐': 18, '潞': 17, '蕗': 19, '露': 21, '巋': 21, '斌': 12, '廙': 14, '柴': 10, '郎': 14, '延': 7 };
const FIX_WHY = { '成': '成을 한국 자전대로 7획으로 셈', '誠': '成을 한국 자전대로 7획으로 셈', '城': '成을 한국 자전대로 7획으로 셈', '晟': '成을 한국 자전대로 7획으로 셈', '珹': '王→玉 5획, 成 7획', '宬': '成을 한국 자전대로 7획으로 셈', '娍': '成을 한국 자전대로 7획으로 셈',
  '熙': '한국 자전·성명학은 13획', '凞': '熙를 13획으로 셈', '璐': '王→玉 5획, 路 13획', '潞': '氵→水 4획, 路 13획', '蕗': '艹→艸 6획, 路 13획', '露': '路를 13획으로 셈', '郎': '良을 7획, 오른쪽 阝을 邑 7획으로 셈', '延': '한국 자전은 7획, 유니코드 8획은 대만 자형' };
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
/* 조사 — 마지막 글자에 받침이 있으면 a(은·이·을·이나), 없으면 b(는·가·를·나) */
const P = (word, a, b) => ((word.charCodeAt(word.length - 1) - 0xAC00) % 28 ? a : b);

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
    /* 이 음 말고도 교육용·인명용 음이 있는 글자(度 도·탁, 沇 연·윤 …) — 두음법칙으로 같아지는 음은 뺀다 */
    const other = [...new Set(u.readings.filter((x) => /[EN]/.test(x.src) && norm(x.r) !== norm(S.s)).map((x) => x.r))];
    items.push({ h: h.h, el: h.el, mean, dict, other, edu: hit.some((x) => /E/.test(x.src)), rad: u.rad, won: u.won, written: u.written });
  }
  return { s: S.s, rr: S.rr, g: S.g, pos: S.pos, pop: S.pop, items };
}).filter((g) => g.items.length);
const slugOf = (g) => g.rr.replace(/[^a-z]/g, '');
{ const seen = new Set(); groups.forEach((g) => { const k = slugOf(g); if (seen.has(k)) throw new Error('주소 겹침 ' + k); seen.add(k); }); }
const TOTAL = groups.reduce((n, g) => n + g.items.length, 0);
const TOTAL_EDU = groups.reduce((n, g) => n + g.items.filter((x) => x.edu).length, 0);

/* ---------- 뜻 갈래 — 사전 훈(뜻)의 낱말로 묶는다. 허브 '뜻으로 찾기'. 뜻 낱말이 갈래 낱말과 같거나(exact) 그 낱말로 끝나면(suffix), 또는 뜻 전체가 같으면(whole — 永 '길·오랠'의 길다 와 道 '길' 을 가르기 위해) 든다 ---------- */
const THEMES = [
  ['밝음·빛', { exact: ['밝을', '빛', '빛날', '빛나는', '빛나고', '볕', '햇빛', '햇살', '비칠', '불꽃', '불빛', '샛별', '새벽', '노을', '석양빛', '무지개', '금빛', '해', '해돋이', '낮'] }],
  ['옥·구슬·보배', { exact: ['옥', '옥돌', '옥빛', '패옥', '구슬', '보배', '유리', '옥홀', '옥잔', '도리옥', '거울'], suffix: ['옥'] }],
  ['물·강·바다', { exact: ['물', '물가', '물결', '물소리', '물굽이', '물놀이', '바다', '못', '호수', '시내', '샘솟을', '나루', '늪', '이슬', '조수', '흐를', '헤엄칠', '강', '단비', '비'] }],
  ['맑음·바름', { exact: ['맑을', '깨끗할', '순수할', '고요할', '흴', '바탕', '곧을', '바를', '단정할', '참', '옳을'] }],
  ['하늘·별', { exact: ['하늘', '별', '천하', '우레', '반짝일'] }],
  ['나무·꽃·풀', { exact: ['나무', '꽃', '풀', '연꽃', '말리꽃', '꽃술', '향풀', '골풀', '가지', '지초', '향초', '싹', '쑥', '복숭아', '벼', '이삭', '재목', '심을', '갈대', '담쟁이', '오얏', '장미', '오동', '원추리', '감초', '나물', '혜초', '해바라기', '우거질', '동산', '모종', '삘기', '율무', '그루', '섶', '잎'], suffix: ['나무'] }],
  ['산·땅·마을', { exact: ['산', '언덕', '땅', '터', '지경', '고개', '섬', '산봉우리', '둑', '담', '밭두둑', '들', '고을', '마을', '시골', '도읍', '나라', '모퉁이', '길거리', '흙', '백토', '서울'], whole: ['길'] }],
  ['마음·덕', { exact: ['어질', '용서할', '공경할', '편안할', '편안', '화할', '온화할', '은혜', '기쁠', '기뻐할', '따뜻할', '따뜻하게', '사랑할', '착할', '겸손할', '너그러울', '두터울', '정성', '믿을', '은근할', '성품', '즐길', '웃음', '떳떳할', '바랄', '도울', '베풀', '지킬', '보호할', '기릴', '공경'] }],
  ['지혜·배움', { exact: ['지혜', '슬기', '슬기로울', '총명할', '깨달을', '깨우칠', '깨어날', '알', '뜻', '생각할', '헤아릴', '영리할', '재주', '가르칠', '익힐', '글', '기록할', '시', '말씀', '이야기', '읊을', '책상', '서고', '법', '법도', '법칙', '본보기', '다스릴', '경영할', '결단할'] }],
  ['크고 높음·성취', { exact: ['클', '넓을', '깊을', '높을', '솟을', '오를', '성할', '굳셀', '강할', '빼어날', '뛰어날', '우뚝할', '영화로울', '이룰', '나아갈', '떨칠', '날릴', '많을', '넉넉할', '윤택할', '두루', '준마', '세울', '갖출', '재물', '녹봉'] }],
  ['아름다움', { exact: ['아름다울', '아름다운', '고울', '예쁠', '아리따울', '우아할', '미인', '탐스러울', '모습', '채색'] }],
  ['복·상서로움', { exact: ['상서로울', '좋을', '경사', '하례할', '이로울', '나을'] }],
  ['쇠·금속', { exact: ['쇠', '은', '강철', '놋쇠', '무쇠', '쇠북', '열쇠', '주석', '솥귀', '저울눈', '고리', '비녀', '귀고리', '불릴', '녹일'] }]
];
const meanWords = (m) => m.split(/[·,\s]+/).filter(Boolean);
const inTheme = (x, t) => (t.whole || []).includes(x.mean) || meanWords(x.mean).some((w) => t.exact.includes(w) || (t.suffix || []).some((s) => w.length > s.length && w.endsWith(s)));

/* ---------- 수정일 — 글 영역이 이전 빌드와 같으면 그 파일의 날짜 그대로 ---------- */
const contentKey = (html) => { const a = html.indexOf('<article'), b = html.indexOf('</article>'); return html.slice(a, b).replace(/<div class="hj-grid">[\s\S]*?<\/div>/g, '').replace(/\s+/g, ' ').trim(); };
function modifiedFor(url, body) {
  const file = path.join(DOCS, url.slice(1), 'index.html');
  if (!fs.existsSync(file)) return REVISED;
  const old = fs.readFileSync(file, 'utf8');
  const m = old.match(/"dateModified":"(\d{4}-\d{2}-\d{2})"/);
  return m && contentKey(old) === contentKey(body) ? m[1] : REVISED;
}

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
    .hj-table td.h small { font-family: var(--sans, 'Noto Sans KR', sans-serif); font-size: 10px; line-height: 1.3; }
    .hj-el { display: inline-block; font-size: 11.5px; padding: 1px 8px; border-radius: 999px; border: 1px solid var(--line); font-style: normal; }
    .hj-el.목 { color: #2F6B3A; border-color: #9CC3A3; } .hj-el.화 { color: #B8382D; border-color: #E2A59E; } .hj-el.토 { color: #8A6A1F; border-color: #D9C38A; }
    .hj-el.금 { color: #6E6455; border-color: #C9C0B0; } .hj-el.수 { color: #2A4B7C; border-color: #9DB3D6; }
    .hj-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 8px 0 16px; }
    .hj-grid a { display: block; padding: 8px 4px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; text-decoration: none; color: inherit; text-align: center; }
    .hj-grid a b { display: block; font-family: 'Noto Serif KR', serif; font-size: 18px; }
    .hj-grid a small { display: block; font-size: 11px; color: var(--faint); margin-top: 2px; }
    .hj-grid a.cur { border-color: var(--seal); background: #FBF3E6; }
    .ga-body h3.hj-h { font-family: inherit; font-size: 13px; font-weight: 600; color: var(--muted); margin: 18px 0 4px; }
    .hj-won { line-height: 2.1; }
    .hj-won b { font-weight: 600; color: var(--muted); font-size: 12.5px; margin: 0 4px 0 10px; }
    .hj-won b:first-child { margin-left: 0; }
    .hj-won span { font-family: 'Noto Serif KR', serif; font-size: 17px; letter-spacing: 1px; }
    .hj-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0 14px; }
    .hj-chips a { display: inline-flex; align-items: baseline; gap: 5px; text-decoration: none; color: inherit; border: 1px solid var(--line-soft); border-radius: 8px; padding: 4px 9px; background: #FFFDF9; font-size: 12.5px; }
    .hj-chips a b { font-weight: 600; color: var(--muted); font-size: 12px; }
    .hj-chips a span { font-family: 'Noto Serif KR', serif; font-size: 17px; letter-spacing: 1px; }
    .hj-find { margin: 10px 0 16px; padding: 14px 16px; background: #FFFDF9; border: 1px solid var(--line); border-radius: 12px; }
    .hj-find label { display: block; font-size: 12px; font-weight: 700; color: var(--muted); }
    .hj-find input { display: block; width: 100%; box-sizing: border-box; margin-top: 5px; font: inherit; font-size: 15px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); }
    .hj-find .hj-chips { margin-bottom: 0; }
    @media (max-width: 480px) { .hj-grid { grid-template-columns: repeat(4, 1fr); } .hj-table td.h { font-size: 22px; } }
  </style>`;
function write(url, o) {
  const file = path.join(DOCS, url.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, shell(o));
}
const faqLd = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const article = (url, title, desc, modified) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: PUBLISHED, dateModified: modified, inLanguage: 'ko', author: { '@type': 'Organization', name: '사주첩' }, publisher: { '@type': 'Organization', name: '사주첩' }, mainEntityOfPage: SITE + url });
const urls = [];   /* [url, lastmod] */
const radLabel = (n) => RAD_NAME[n] || '';
const strokeCell = (x) => x.won === x.written ? `${x.won}획` : `${x.won}획<small>쓰는 획수 ${x.written}획</small>`;
const han = (list) => list.map((x) => x.h).join('·');
const elTag = (e) => `<span class="hj-el ${e}">${e}(${EL_HAN[e]})</span>`;
const count = (list, f) => list.filter(f).length;
/* 원획이 쓰는 획수와 다른 이유 — 글자별 */
function strokeWhy(x) {
  if (FIX_WHY[x.h]) return FIX_WHY[x.h];
  const v = RAD_VARIANT[x.rad];
  if (v) return `${v[0]}을 원형 ${v[1]} ${v[2]}획으로 셈`;
  return '글자 안의 부수 변형(阝·氵·王 등)을 원형 획수로 셈';
}

/* ---------- 음별 페이지 ---------- */
function sylPage(g) {
  const url = `/naming/hanja/${slugOf(g)}/`, rel = '../../../';
  const n = g.items.length, cho = choOf(g.s), soundEl = CHO_EL[cho];
  const byEl = EL_ORDER.map((e) => ({ e, list: g.items.filter((x) => x.el === e) })).filter((x) => x.list.length);
  const missing = EL_ORDER.filter((e) => !g.items.some((x) => x.el === e));
  const edu = g.items.filter((x) => x.edu), nonEdu = g.items.filter((x) => !x.edu);
  const dictNote = [...new Set(g.items.filter((x) => x.dict !== g.s).map((x) => x.dict))];
  const wons = [...new Set(g.items.map((x) => x.won))].sort((a, b) => a - b);
  const byWon = wons.map((w) => ({ w, list: g.items.filter((x) => x.won === w) }));
  const radMap = {}; for (const x of g.items) (radMap[x.rad] ||= []).push(x);
  const radGroups = Object.entries(radMap).filter(([, v]) => v.length > 1).sort((a, b) => b[1].length - a[1].length || +a[0] - +b[0]);
  const diffs = g.items.filter((x) => x.won !== x.written);
  const sameEl = g.items.filter((x) => x.el === soundEl);
  const alsoRead = g.items.filter((x) => x.other.length);
  const one = n === 1, only = g.items[0];
  const H = (a, b) => P(g.s, a, b);   /* 이 페이지의 한자는 전부 g.s 로 읽히니 조사도 g.s 를 따른다 */
  const rows = g.items.map((x) => `<tr id="h-${x.h}"><td class="h">${x.h}${x.edu ? '<small>교육용</small>' : ''}</td><td><b>${esc(x.mean)} ${x.dict}</b>${x.dict !== g.s ? `<small>이름 첫소리에선 '${g.s}'</small>` : ''}${x.other.length ? `<small>${x.other.map((r) => `'${r}'`).join('·')}로도 읽음</small>` : ''}<small>${radLabel(x.rad)}</small></td><td>${strokeCell(x)}</td><td>${elTag(x.el)}</td></tr>`).join('\n        ');
  const listText = han(g.items);
  const title = `이름 한자 '${g.s}' — ${g.items.slice(0, 6).map((x) => x.h).join('·')} 뜻·원획·자원오행`;
  const desc = `이름에 쓰는 '${g.s}' 한자 ${n}자(${g.items.slice(0, 8).map((x) => `${x.h} ${x.mean}`).join(', ')}…)의 뜻과 원획, 자원오행을 한 표로. 모두 인명용 한자이고, '${g.s}'의 발음오행은 ${soundEl}(${EL_HAN[soundEl]})입니다.`;

  /* 교육용·인명용 — 그 음의 수로 문장을 만든다 */
  const eduText = one
    ? (only.edu ? `${only.h}${H('은', '는')} 교육용 기초한자여서 학교에서 배우는 글자예요. 한자를 아는 사람이면 대부분 읽을 수 있어요.` : `${only.h}${H('은', '는')} 교육용 기초한자에는 없고 인명용 한자표에만 있는 글자예요. 이름에 쓸 수 있지만, 한자를 배운 사람도 처음 보면 읽기 어려울 수 있어요.`)
    : edu.length === n
      ? `${n}자 모두 교육용 기초한자여서 학교에서 배우는 글자예요. 한자를 아는 사람이면 대부분 읽을 수 있어요.`
      : edu.length === 0
        ? `${n}자 모두 교육용 기초한자에는 없고 인명용 한자표에만 있는 글자예요. 이름에 쓸 수 있지만, 한자를 배운 사람도 처음 보면 읽기 어려울 수 있어요.`
        : `${n}자 중 ${edu.length}자(${han(edu)})는 교육용 기초한자여서 학교에서 배우는 글자이고, 나머지 ${nonEdu.length}자(${han(nonEdu)})는 인명용 한자표에만 있어요. 인명용 한자표에만 있는 글자는 이름에 쓸 수 있지만 남이 읽기는 어려울 수 있어요.`;
  const alsoText = alsoRead.length ? ` ${alsoRead.map((x) => `${x.h}${H('은', '는')} ${x.other.map((r) => `'${r}'`).join('·')}`).join(', ')}${alsoRead.length > 1 ? ' 음으로도 각각' : ' 음으로도'} 교육용·인명용 한자표에 올라 있어요. 출생신고 때 적는 음은 쓰려는 음으로 하면 돼요.` : '';

  /* 자원오행 — 오행별 수와 빠진 오행 */
  const elCount = byEl.map((x) => `${x.e} ${x.list.length}`).join('·');
  const elHead = one ? `'${g.s}' 음에 실은 글자는 ${only.h} 하나로 자원오행은 ${only.el}(${EL_HAN[only.el]})이에요.` : `'${g.s}' ${n}자의 자원오행은 ${elCount}자${missing.length ? '예요.' : '로 다섯 오행이 모두 있어요.'}`;
  const lackLink = (e) => `<a href="${rel}naming/hanja/#el-${e}">다른 음의 ${e}(${EL_HAN[e]}) 한자</a>`;
  const lackList = missing.map((e, i) => i < missing.length - 1 ? `${e}${P(e, '이나', '나')}` : `${e}${P(e, '이', '가')}`).join(' ');
  const elText = missing.length === 0
    ? `${elHead} 사주에 어느 오행이 부족해도 '${g.s}' 음 안에서 그 오행의 글자를 고를 수 있어요.`
    : `${elHead} ${missing.map((e) => `${e}(${EL_HAN[e]})`).join('·')} 글자는 없어서, 사주에 ${lackList} 부족한 아이라면 '${g.s}' 음에서는 채울 글자가 없어요. ${missing.map(lackLink).join('·')}를 보거나 이름의 다른 글자로 채우세요.`;
  const sameElText = one
    ? `'${g.s}'의 발음오행은 ${soundEl}(${EL_HAN[soundEl]})${only.el === soundEl ? `이고 ${only.h}의 자원오행도 ${soundEl}이라 소리와 글자의 오행이 같아요.` : `인데 ${only.h}의 자원오행은 ${only.el}(${EL_HAN[only.el]})이라, 소리는 ${soundEl}, 글자는 ${only.el}이 되는 거예요.`}`
    : sameEl.length === 0
      ? `'${g.s}'의 발음오행은 ${soundEl}(${EL_HAN[soundEl]})인데 ${n}자 가운데 자원오행도 ${soundEl}인 글자는 없어요. '${g.s}' 음을 쓰면 소리는 ${soundEl}, 글자는 다른 오행이 되는 거예요.`
      : sameEl.length === n
        ? `'${g.s}'의 발음오행은 ${soundEl}(${EL_HAN[soundEl]})이고 ${n}자 모두 자원오행도 ${soundEl}이라 소리와 글자의 오행이 같아요.`
        : `'${g.s}'의 발음오행은 ${soundEl}(${EL_HAN[soundEl]})${P(soundEl, '이에요', '예요')}. ${han(sameEl)}${H('은', '는')} 소리와 글자의 오행이 모두 ${soundEl}이고, 나머지 ${n - sameEl.length}자는 소리는 ${soundEl}, 글자는 다른 오행이에요.`;

  /* 원획 — 획수별 묶음, 쓰는 획수와 다른 글자와 이유 */
  const wonLine = byWon.map((x) => `<b>${x.w}획</b><span>${han(x.list)}</span>`).join(' ');
  const wonRange = one ? `${only.h}의 원획은 ${only.won}획이에요.` : wons.length === 1 ? `'${g.s}' ${n}자의 원획은 모두 ${wons[0]}획이에요.` : `'${g.s}' ${n}자의 원획은 ${wons[0]}획부터 ${wons[wons.length - 1]}획까지 ${wons.length}가지예요.`;
  const wonText = `${wonRange} 성명학에서는 성과 이름 글자의 원획을 더해 81수리를 보는데, 이건 획수 조합으로 길흉을 따지는 전통 작명 관습이고 검증된 근거가 있는 건 아니에요. 그래도 맞춰 보고 싶다면 <a href="${rel}naming/">이름 짓기 도구</a>에 성과 이름 두 글자를 넣으면 네 격을 계산해 줘요.`;
  const diffList = diffs.map((x) => `${x.h} ${x.won}획(쓰는 획수 ${x.written}획, ${strokeWhy(x)})`).join(' · ');
  const diffText = diffs.length === 0
    ? (one ? `${only.h}${H('은', '는')} 원획과 쓰는 획수가 같아요.` : `'${g.s}' ${n}자는 모두 원획과 쓰는 획수가 같아요.`) + ' 부수가 변형(氵·艹·王·阝 등)으로 쓰인 글자가 없기 때문이에요.'
    : (one ? `${only.h}${H('은', '는')} 원획이 쓰는 획수와 달라요 — ${diffList}.` : diffs.length === n ? `${n}자 모두 원획이 쓰는 획수와 달라요 — ${diffList}.` : `${n}자 중 ${diffs.length}자는 원획이 쓰는 획수와 달라요 — ${diffList}.`) + ' 성명학은 부수를 강희자전 원형으로 세기 때문이고, 자전·유파에 따라 한두 획 다르게 보는 글자도 있어요.';

  /* 같은 부수 */
  const radText = radGroups.map(([r, list]) => `<li><b>${radLabel(+r) || `부수 ${r}`}</b> ${list.length}자: ${list.map((x) => `${x.h}(${esc(x.mean)})`).join(', ')} — 자원오행 ${[...new Set(list.map((x) => x.el))].map((e) => `${e}(${EL_HAN[e]})`).join('·')}</li>`).join('\n        ');
  const radIntro = radGroups.length ? `'${g.s}' 음에는 부수가 같은 글자가 ${radGroups.length}묶음 있어요. 부수가 같으면 자원오행도 같아서, 오행은 정해 두고 뜻과 획수만 고르면 돼요.` : '';

  const faq = [
    [`이름 한자 '${g.s}'에는 어떤 글자가 있나요?`, `인명용 한자 중 이름에 자주 쓰는 ${n}자를 모았습니다: ${listText}. 뜻과 획수, 자원오행은 표에 정리했습니다.`],
    [`'${g.s}'의 발음오행은 무엇인가요?`, `첫소리 ${cho}은 훈민정음 오음으로 ${soundEl}(${EL_HAN[soundEl]})입니다. 발음오행은 한자와 상관없이 소리로 정해지고, 자원오행은 한자의 부수로 정해져서 같은 '${g.s}' 음이라도 한자마다 자원오행이 다릅니다.`],
    [`'${g.s}' 한자 중 자원오행이 ${byEl.map((x) => x.e).join('·')}인 글자는?`, byEl.map((x) => `${x.e}(${EL_HAN[x.e]}): ${han(x.list)}`).join(' / ') + (missing.length ? `. ${missing.join('·')} 글자는 '${g.s}' 음에 없습니다.` : '.')],
    [`'${g.s}' 한자 중 학교에서 배우는 교육용 기초한자는?`, edu.length ? `${n}자 중 ${edu.length}자(${han(edu)})가 교육용 기초한자 1,800자에 들어 있습니다.${nonEdu.length ? ` ${han(nonEdu)}${H('은', '는')} 인명용 한자표에만 있어 이름에는 쓸 수 있지만 교과서에서는 배우지 않는 글자입니다.` : ''}` : `없습니다. ${n}자 모두 인명용 한자표에만 있는 글자여서 이름에는 쓸 수 있지만 교과서에서는 배우지 않습니다.`]
  ];
  const others = groups.map((o) => `<a href="${rel}naming/hanja/${slugOf(o)}/"${o === g ? ' class="cur"' : ''}><b>${o.s}</b><small>${o.items.length}자</small></a>`).join('');
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}naming/hanja/" style="color: inherit; text-decoration: none;">이름 한자 사전</a> · ${g.s}</div>
    <h1 class="ga-title">이름 한자 '${g.s}' —<br>${n}자의 뜻·원획·자원오행</h1>
    <div class="hj-meta"><span>발음오행 <b>${soundEl}(${EL_HAN[soundEl]})</b></span><span>자리 <b>${POS_KO[g.pos]}</b></span><span>느낌 <b>${G_KO[g.g]}</b></span><span>한자 <b>${n}자</b></span><span>교육용 기초한자 <b>${edu.length}자</b></span></div>
    <p class="ga-lead">'${g.s}' 음은 이름에 ${g.pop >= 3 ? '아주 자주' : g.pop === 2 ? '자주' : '종종'} 쓰여요. 같은 '${g.s}' 음이라도 어떤 한자를 고르느냐에 따라 뜻과 획수, 자원오행이 달라져요. 아래 ${n}자는 모두 대법원 인명용 한자(교육용 기초한자 포함)에 드는 글자예요.${dictNote.length ? ` 사전 음이 ${dictNote.map((d) => `'${d}'`).join('·')}인 글자는 이름 첫소리에서 두음법칙에 따라 '${g.s}' 음으로 읽어요.` : ''}</p>
    <div class="ga-body">
      <h2>'${g.s}' 한자 ${n}자</h2>
      <table class="hj-table">
        <tr><th>한자</th><th>뜻·음 / 부수</th><th>원획</th><th>자원오행</th></tr>
        ${rows}
      </table>
      <p>${eduText}${alsoText}</p>
      <h2>자원오행으로 고르기</h2>
      <p>${elText}</p>
      <ul>
        ${byEl.map((x) => `<li><b>${x.e}(${EL_HAN[x.e]})</b> ${x.list.length}자: ${x.list.map((y) => `${y.h}(${esc(y.mean)})`).join(', ')}</li>`).join('\n        ')}
      </ul>
      <p>${sameElText} 내 사주에 어떤 오행이 부족한지는 <a href="${rel}">생년월일로 사주</a>를 풀면 오행 분포로 바로 보여요.</p>
      <h2>원획으로 보기</h2>
      <p class="hj-won">${wonLine}</p>
      <p>${wonText}</p>
      <p class="callout">${diffText}</p>${radGroups.length ? `
      <h2>부수가 같은 글자</h2>
      <p>${radIntro}</p>
      <ul>
        ${radText}
      </ul>` : ''}
      <h2>자주 묻는 질문</h2>
      ${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n      ')}
      <h2>다른 음의 이름 한자</h2>
      <div class="hj-grid">${others}</div>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}naming/"><span class="seal-dot" aria-hidden="true"></span><span>이 한자로 이름 풀어 보기</span></a>
    </div>
  </article>`;
  const modified = modifiedFor(url, body);
  write(url, { rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '이름 한자 사전', url: SITE + '/naming/hanja/' }, { name: `'${g.s}' 한자`, url: SITE + url }]), article(url, title, desc, modified), faqLd(faq)], body });
  urls.push([url, modified]);
}

/* ---------- 허브 ---------- */
function hub() {
  const url = '/naming/hanja/', rel = '../../';
  const href = (g) => `${rel}naming/hanja/${slugOf(g)}/`;
  const sorted = groups.slice().sort((a, b) => a.s.localeCompare(b.s, 'ko'));
  /* 음 바둑판 — 발음오행(첫소리)별로 묶고 그 안은 가나다순 */
  const soundGroups = EL_ORDER.map((e) => ({ e, list: sorted.filter((g) => CHO_EL[choOf(g.s)] === e) })).filter((x) => x.list.length);
  const cells = soundGroups.map(({ e, list }) => {
    const chos = [...new Set(list.map((g) => choOf(g.s)))].join('·');
    return `<h3 class="hj-h">발음오행 ${e}(${EL_HAN[e]}) — 첫소리가 ${chos}인 음 ${list.length}개, 한자 ${list.reduce((s, g) => s + g.items.length, 0)}자</h3>
      <div class="hj-grid">${list.map((g) => `<a href="${href(g)}"><b>${g.s}</b><small>${g.items.slice(0, 3).map((x) => x.h).join('')} · ${g.items.length}자</small></a>`).join('')}</div>`;
  }).join('\n      ');
  /* 자원오행별 — (오행, 음) 한 묶음이 링크 하나. 글자 하나하나를 링크로 걸지 않는다 */
  const chips = (pairs) => `<div class="hj-chips">${pairs.map(({ g, list }) => `<a href="${href(g)}" title="${esc(list.map((x) => `${x.h} ${x.mean} ${x.dict} ${x.won}획`).join(', '))}"><b>${g.s}</b><span>${list.map((x) => x.h).join('')}</span></a>`).join('')}</div>`;
  const pairsOf = (f) => sorted.map((g) => ({ g, list: g.items.filter(f) })).filter((p) => p.list.length);
  const byEl = EL_ORDER.map((e) => {
    const pairs = pairsOf((x) => x.el === e), total = pairs.reduce((s, p) => s + p.list.length, 0);
    return `<h3 id="el-${e}">${e}(${EL_HAN[e]}) — ${total}자, ${pairs.length}개 음</h3>\n      ${chips(pairs)}`;
  }).join('\n      ');
  /* 뜻 갈래 */
  const themes = THEMES.map(([name, t]) => ({ name, pairs: pairsOf((x) => inTheme(x, t)) })).map((th) => ({ ...th, total: th.pairs.reduce((s, p) => s + p.list.length, 0) })).filter((th) => th.total >= 5);
  const themeHtml = themes.map((th) => `<h3 id="t-${th.name.replace(/[^가-힣]/g, '')}">${th.name} — ${th.total}자</h3>\n      ${chips(th.pairs)}`).join('\n      ');
  const themeCount = new Set(themes.flatMap((th) => th.pairs.flatMap((p) => p.list.map((x) => x.h + p.g.s)))).size;
  /* 찾기 상자 자료 — [한자, 음, 주소, 뜻, 원획, 자원오행] */
  const data = JSON.stringify(sorted.flatMap((g) => g.items.map((x) => [x.h, g.s, href(g), x.mean, x.won, x.el])));
  const pick = picker({ id: 'hj-pick', title: '음으로 바로 가기', button: '보기',
    selects: [{ name: 's', label: '이름에 쓸 음', options: sorted.map((g) => [slugOf(g), `${g.s} (${g.items.length}자)`]) }],
    go: `'${rel}naming/hanja/'+v.s+'/'`,
    fallback: '아래 음 바둑판에서 음을 누르면 같은 곳으로 갑니다.' });
  const find = `<form class="hj-find" id="hj-find" action="." onsubmit="return false;">
        <label>뜻·음·획수로 찾기<input type="search" name="q" placeholder="예: 밝을 · 옥 · 서 · 14" autocomplete="off" aria-describedby="hj-find-note"></label>
        <p class="pick-note" id="hj-find-note">뜻은 '밝을'·'옥'처럼 사전 훈의 낱말로, 획수는 숫자만(원획 기준), 음은 한 글자로 넣으면 ${TOTAL}자 가운데 맞는 글자가 바로 나와요.</p>
        <div id="hj-result" aria-live="polite"></div>
        <noscript><p class="pick-note">자바스크립트가 꺼져 있으면 아래 '뜻으로 찾기'·'자원오행으로 찾기' 목록을 보세요. 같은 ${TOTAL}자가 다 실려 있어요.</p></noscript>
      </form>
      <script type="application/json" id="hj-data">${data}</script>
      <script>(function(){var el=document.getElementById('hj-data'),q=document.querySelector('#hj-find input'),out=document.getElementById('hj-result');if(!el||!q||!out)return;var d=JSON.parse(el.textContent);function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}q.addEventListener('input',function(){var s=q.value.trim();if(!s){out.innerHTML='';return;}var num=/^\\d+$/.test(s)?+s:0;var hit=d.filter(function(r){return num?r[4]===num:(r[3].indexOf(s)>=0||r[0]===s||r[1]===s);});if(!hit.length){out.innerHTML='<p class="pick-note">맞는 글자가 없어요. 뜻은 \\'밝을\\'처럼 사전 훈으로, 획수는 숫자만 넣어 보세요.</p>';return;}var h='<p class="pick-note">'+hit.length+'자'+(hit.length>80?' (80자까지만 보여요)':'')+'</p><div class="hj-chips">';hit.slice(0,80).forEach(function(r){h+='<a href="'+r[2]+'"><span>'+r[0]+'</span>'+esc(r[3])+' '+r[1]+' · '+r[4]+'획 · <i class="hj-el '+r[5]+'">'+r[5]+'</i></a>';});out.innerHTML=h+'</div>';});})();</script>`;
  const title = '이름 한자 사전 — 인명용 한자의 뜻·원획·자원오행 (음별)';
  const desc = `이름에 쓰는 인명용 한자 ${TOTAL}자를 음별로. 서·연·윤·지·준·현·민·하·은처럼 이름에 자주 쓰는 ${groups.length}개 음의 한자마다 뜻, 원획, 자원오행을 한 표로 정리했어요. 발음오행과 두음법칙도 함께.`;
  const faq = [
    ['자원오행이란 무엇인가요?', '한자마다 정해진 오행입니다. 보통 부수로 정해서 氵(물)이 들어가면 수, 木이 들어가면 목, 日·火가 들어가면 화, 土·山이 들어가면 토, 金·玉이 들어가면 금으로 봅니다. 사주에 부족한 오행을 이름 한자로 채울 때 씁니다.'],
    ['원획은 쓰는 획수와 어떻게 다른가요?', '성명학은 부수를 원래 글자의 획수로 셉니다. 氵은 水의 4획, 艹은 艸의 6획, 王(玉)은 5획, 왼쪽 阝은 阜의 8획, 오른쪽 阝은 邑의 7획, 辶은 辵의 7획으로 세서 쓰는 획수보다 많아질 수 있습니다. 81수리는 이 원획으로 계산합니다.'],
    ['81수리(획수 조합)는 꼭 맞춰야 하나요?', '81수리는 성과 이름 글자의 원획을 더한 수로 길흉을 따지는 전통 작명 관습입니다. 오래 통용돼 왔지만 통계나 실험으로 검증된 근거가 있는 것은 아니어서, 사주첩은 속설로 참고하는 선에서 안내합니다. 뜻이 좋고 부르기 편한 이름을 먼저 고르고, 획수는 그다음에 맞춰 봐도 늦지 않습니다.'],
    ['여기 있는 한자는 모두 이름에 쓸 수 있나요?', `네. 유니코드 한자 데이터베이스(Unihan, ${UNIHAN_VER})에서 그 음으로 교육용 기초한자나 인명용 한자표에 드는 글자만 실었습니다. 인명용 한자표는 대법원이 「가족관계의 등록 등에 관한 규칙」 별표로 고시하며 교육용 기초한자 1,800자를 포함합니다. ${TOTAL}자 중 ${TOTAL_EDU}자가 교육용 기초한자이고, 나머지 ${TOTAL - TOTAL_EDU}자는 인명용 한자표에만 있는 글자입니다. 표는 개정될 수 있으니 출생신고 전에는 대법원 전자가족관계등록시스템에서 한 번 더 확인하세요.`],
    ['이 사전에 없는 한자는 이름에 못 쓰나요?', `아닙니다. 인명용 한자는 8천 자가 넘고, 여기에는 이름에 자주 쓰는 ${groups.length}개 음의 ${TOTAL}자만 실었습니다. 亻·示·隹·曰·一·夕처럼 부수의 오행 배정이 자전·유파마다 갈리는 글자는 자원오행을 한 가지로 적을 수 없어 뺐고, 뜻이 이름에 맞지 않는 글자도 뺐습니다. 다른 글자의 인명용 여부는 대법원 전자가족관계등록시스템에서 확인할 수 있습니다.`]
  ];
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}naming/" style="color: inherit; text-decoration: none;">이름 짓기</a> · 이름 한자 사전</div>
    <h1 class="ga-title">이름 한자 사전 —<br>${groups.length}개 음, ${TOTAL}자</h1>
    <p class="ga-meta">인명용 한자 · 뜻 · 원획(강희자전 부수 원형) · 자원오행 · 발음오행</p>
    <p class="ga-lead">이름에 자주 쓰는 음마다 인명용 한자를 모아 뜻과 원획, 자원오행을 정리했어요. ${TOTAL}자 중 ${TOTAL_EDU}자는 학교에서 배우는 교육용 기초한자이고, 나머지는 인명용 한자표에만 있는 글자예요. 음을 누르면 그 음의 한자가 한 표로 나오고, 음 페이지마다 오행별로 몇 자인지, 빠진 오행은 무엇인지, 원획이 쓰는 획수와 다른 글자는 왜 다른지까지 그 음의 글자로 풀어 두었어요. 한자를 고른 뒤에는 <a href="${rel}naming/">이름 짓기 도구</a>에서 발음오행과 81수리(전통 작명 관습)까지 풀어 볼 수 있어요.</p>
    <div class="ga-body">
      ${pick}
      ${find}
      <h2>음으로 찾기</h2>
      <p>첫소리로 발음오행이 정해지니, 음 바둑판은 발음오행별로 묶었어요. 음마다 한자 수와 앞 세 글자를 적어 두었어요.</p>
      ${cells}
      <h2>뜻으로 찾기</h2>
      <p>사전 훈(뜻)의 낱말로 ${themes.length}갈래로 묶었어요 — ${TOTAL}자 중 ${themeCount}자가 어느 한 갈래에 들고, 뜻이 둘인 글자는 두 갈래에 다 들어요. 묶음을 누르면 그 음의 표로 가고, 묶음에 마우스를 올리면 뜻과 획수가 보여요.</p>
      ${themeHtml}
      <h2 id="el">자원오행으로 찾기</h2>
      <p>사주에 부족한 오행이 있으면 그 오행의 한자를 고르는 것이 작명에서 가장 많이 쓰는 방법이에요. 어느 오행이 부족한지는 <a href="${rel}">생년월일로 사주</a>를 풀면 오행 분포로 보여요.</p>
      ${byEl}
      <h2>자주 묻는 질문</h2>
      ${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n      ')}
      <p class="callout">음·획수·인명용 여부는 유니코드 한자 데이터베이스(Unihan, ${UNIHAN_VER})에서 가져와 계산했고, 뜻은 사주첩이 정리했습니다. 자원오행은 부수의 오행이 관습적으로 정해진 글자만 실었습니다. <a href="${rel}naming/">이름 짓기</a> · <a href="${rel}guide/ohaeng.html">오행 완전 정리</a> · <a href="${rel}guide/yongsin.html">용신 — 내 사주에 필요한 오행</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}naming/"><span class="seal-dot" aria-hidden="true"></span><span>이름 짓기 도구로 가기</span></a>
    </div>
  </article>`;
  const modified = modifiedFor(url, body);
  write(url, { rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE + PICKER_STYLE,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '이름 짓기', url: SITE + '/naming/' }, { name: '이름 한자 사전', url: SITE + url }]),
      { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description: desc, url: SITE + url, inLanguage: 'ko', datePublished: PUBLISHED, dateModified: modified, publisher: { '@type': 'Organization', name: '사주첩' } },
      faqLd(faq)], body });
  urls.unshift([url, modified]);
  return themes;
}

groups.forEach(sylPage);
const themes = hub();
fs.writeFileSync(path.join(DOCS, 'sitemap-hanja.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map(([u, m]) => `  <url><loc>${SITE}${u}</loc><lastmod>${m}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-hanja.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-hanja.xml\n');
const byDate = urls.reduce((a, [, m]) => (a[m] = (a[m] || 0) + 1, a), {});
console.log(`이름 한자 사전 — 음 ${groups.length}장 · 한자 ${TOTAL}자(교육용 ${TOTAL_EDU}) + 허브, 뜻 갈래 ${themes.map((t) => `${t.name} ${t.total}`).join(' · ')}, 수정일 ${Object.entries(byDate).map(([d, n]) => `${d}×${n}`).join(' ')}, 뺀 글자 ${skipped.length} (${skipped.join(' ')})`);
