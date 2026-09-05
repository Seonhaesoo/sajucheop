/* 롱테일 정적 페이지 생성 — 날짜별 일진(/day/), 월별 손없는날(/son/), 절기(/jeolgi/)
 * 엔진(docs/js)을 Node에서 그대로 돌려 올해 1월 1일 ~ 내년 12월 31일 범위를 만든다.
 * 출력은 결정적(같은 입력 → 같은 파일)이라 매일 다시 돌려도 오늘 표시가 있는 인덱스 외엔 diff가 없다.
 * 사용: node tools/build-pages.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, kstToday, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';

const { M, I, C, Q, Lunar } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const today = kstToday();
const Y0 = today.y, Y1 = today.y + 1;
const WD = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

/* ---------- 절기 24 (황경 15° 간격, idx = 황경/15) ---------- */
const TERMS = [
  { i: 0, name: '춘분', han: '春分', slug: 'chunbun', kind: '중기', approx: [3, 20], desc: '낮과 밤의 길이가 같아지는 날. 이 날을 지나면 낮이 길어지기 시작해 봄이 완연해집니다.', tip: '균형의 절기입니다. 한쪽으로 기운 생활 리듬을 되돌리기 좋은 때예요.' },
  { i: 1, name: '청명', han: '淸明', slug: 'cheongmyeong', kind: '절', month: 4, approx: [4, 5], desc: '하늘이 맑고 밝아진다는 뜻. 농사가 시작되고 성묘·나들이가 많은 절기입니다.', tip: '진월(辰月)이 열립니다. 새로 심는 일, 땅과 관련한 일을 시작하기에 좋은 달의 문턱이에요.' },
  { i: 2, name: '곡우', han: '穀雨', slug: 'gogu', kind: '중기', approx: [4, 20], desc: '곡식을 살찌우는 비가 내린다는 절기. 봄의 마지막 중기입니다.', tip: '뿌린 것에 물을 주는 시기 — 시작한 일을 꾸준히 돌보는 데 마음을 두세요.' },
  { i: 3, name: '입하', han: '立夏', slug: 'ipha', kind: '절', month: 5, approx: [5, 5], desc: '여름이 시작되는 날. 사주에서는 이 시각부터 사월(巳月)로 넘어갑니다.', tip: '불의 계절이 열립니다. 화(火) 일간은 기운이 오르고, 금(金) 일간은 더위를 대비할 때예요.' },
  { i: 4, name: '소만', han: '小滿', slug: 'soman', kind: '중기', approx: [5, 21], desc: '만물이 점차 생장하여 가득 차기 시작한다는 뜻. 보리가 익어가는 절기입니다.', tip: '아직 완전히 차지는 않은 때 — 성급한 수확보다 기다림이 어울립니다.' },
  { i: 5, name: '망종', han: '芒種', slug: 'mangjong', kind: '절', month: 6, approx: [6, 6], desc: '까끄라기 있는 곡식의 씨를 뿌린다는 절기. 사주의 오월(午月)이 이 시각에 시작됩니다.', tip: '한 해 중 양(陽)의 기운이 가장 강한 달의 문턱. 결단과 추진에 힘이 실립니다.' },
  { i: 6, name: '하지', han: '夏至', slug: 'haji', kind: '중기', approx: [6, 21], desc: '일 년 중 낮이 가장 긴 날. 이 날부터 밤이 조금씩 길어집니다.', tip: '정점은 곧 전환점 — 가장 밝을 때 다음 계절을 준비하는 지혜가 필요해요.' },
  { i: 7, name: '소서', han: '小暑', slug: 'soseo', kind: '절', month: 7, approx: [7, 7], desc: '본격적인 더위가 시작되는 절기. 사주에서는 미월(未月)이 열리는 시각입니다.', tip: '토(土)의 달로 들어섭니다. 열기를 품은 흙처럼, 쌓아둔 것을 숙성시키는 달이에요.' },
  { i: 8, name: '대서', han: '大暑', slug: 'daeseo', kind: '중기', approx: [7, 23], desc: '일 년 중 가장 더운 절기. 장마가 끝나고 무더위가 절정에 이릅니다.', tip: '무리하지 않는 것이 실력인 때. 체력 안배가 곧 운입니다.' },
  { i: 9, name: '입추', han: '立秋', slug: 'ipchu', kind: '절', month: 8, approx: [8, 7], desc: '가을이 시작되는 날. 더위 속에서도 사주의 계절은 이 시각부터 신월(申月), 금(金)의 계절로 바뀝니다.', tip: '금(金) 일간은 힘을 얻고, 목(木) 일간은 결실을 다듬을 때. 정리와 마무리가 어울리는 달의 문턱이에요.' },
  { i: 10, name: '처서', han: '處暑', slug: 'cheoseo', kind: '중기', approx: [8, 23], desc: '더위가 물러간다는 뜻. 아침저녁으로 선선한 바람이 불기 시작합니다.', tip: '식히는 절기 — 달아올랐던 일과 관계를 한 김 식혀 보세요.' },
  { i: 11, name: '백로', han: '白露', slug: 'baekro', kind: '절', month: 9, approx: [9, 8], desc: '흰 이슬이 맺힌다는 절기. 사주에서는 유월(酉月)이 시작되는 시각입니다.', tip: '가장 예리한 금(金)의 달. 판단이 선명해지는 대신 말이 날카로워지기 쉬워요.' },
  { i: 12, name: '추분', han: '秋分', slug: 'chubun', kind: '중기', approx: [9, 23], desc: '낮과 밤의 길이가 다시 같아지는 날. 이 날을 지나면 밤이 길어집니다.', tip: '거두는 균형의 절기. 반년의 결산을 해보기 좋은 때입니다.' },
  { i: 13, name: '한로', han: '寒露', slug: 'hanro', kind: '절', month: 10, approx: [10, 8], desc: '찬 이슬이 맺히는 절기. 사주의 술월(戌月)이 이 시각에 열립니다.', tip: '가을의 토(土) — 창고를 채우는 달. 모으고 갈무리하는 일에 힘이 붙어요.' },
  { i: 14, name: '상강', han: '霜降', slug: 'sanggang', kind: '중기', approx: [10, 23], desc: '서리가 내리기 시작하는 절기. 가을의 마지막 중기입니다.', tip: '마지막 수확의 때 — 미뤄둔 결정을 서리 내리기 전에 끝내세요.' },
  { i: 15, name: '입동', han: '立冬', slug: 'ipdong', kind: '절', month: 11, approx: [11, 7], desc: '겨울이 시작되는 날. 사주에서는 해월(亥月), 수(水)의 계절이 이 시각부터 시작됩니다.', tip: '수(水) 일간은 기운이 오르고, 화(火) 일간은 불씨를 지킬 때. 안으로 모으는 계절의 문턱이에요.' },
  { i: 16, name: '소설', han: '小雪', slug: 'soseol', kind: '중기', approx: [11, 22], desc: '첫눈이 내린다는 절기. 땅이 얼기 시작하고 겨울 채비를 하는 때입니다.', tip: '겉으로 드러나는 일보다 안살림을 살피는 절기입니다.' },
  { i: 17, name: '대설', han: '大雪', slug: 'daeseol', kind: '절', month: 12, approx: [12, 7], desc: '큰 눈이 내린다는 절기. 사주의 자월(子月)이 이 시각에 열립니다.', tip: '한 해 중 음(陰)이 가장 깊은 달의 문턱. 생각이 깊어지고 결정은 신중해집니다.' },
  { i: 18, name: '동지', han: '冬至', slug: 'dongji', kind: '중기', approx: [12, 22], desc: '일 년 중 밤이 가장 긴 날. 팥죽을 먹고 이 날부터 낮이 다시 길어집니다.', tip: '가장 어두운 날이 곧 빛이 돌아오는 날 — 새 계획의 씨앗을 심기 좋은 때예요.' },
  { i: 19, name: '소한', han: '小寒', slug: 'sohan', kind: '절', month: 1, approx: [1, 5], desc: '작은 추위라는 이름과 달리 한 해 중 가장 추운 무렵. 사주의 축월(丑月)이 이 시각에 시작됩니다.', tip: '얼어붙은 흙의 달. 움직임보다 다짐이 어울리고, 준비한 사람이 봄에 앞서갑니다.' },
  { i: 20, name: '대한', han: '大寒', slug: 'daehan', kind: '중기', approx: [1, 20], desc: '24절기의 마지막. 큰 추위라는 뜻이지만 봄이 멀지 않았다는 신호이기도 합니다.', tip: '한 해의 마지막 중기 — 사주의 새해(입춘)를 앞두고 묵은 것을 정리하세요.' },
  { i: 21, name: '입춘', han: '立春', slug: 'ipchun', kind: '절', month: 2, approx: [2, 4], desc: '봄이 시작되는 날이자 사주의 새해. 이 시각부터 년주(年柱)와 월주(月柱)가 함께 바뀝니다. 띠가 바뀌는 기준도 설날이 아니라 입춘입니다.', tip: '입춘 전에 태어났다면 사주에서는 전년도 띠와 년주로 계산됩니다. 1월생·2월 초 출생자는 꼭 확인하세요.' },
  { i: 22, name: '우수', han: '雨水', slug: 'usu', kind: '중기', approx: [2, 19], desc: '눈이 비로 바뀌고 얼음이 녹기 시작하는 절기입니다.', tip: '풀리는 절기 — 얼어 있던 관계와 계획도 이때 녹기 시작합니다.' },
  { i: 23, name: '경칩', han: '驚蟄', slug: 'gyeongchip', kind: '절', month: 3, approx: [3, 5], desc: '겨울잠 자던 벌레가 깨어나는 절기. 사주의 묘월(卯月)이 이 시각에 열립니다.', tip: '목(木)의 기운이 가장 부드럽게 퍼지는 달. 시작한 것을 키우기 좋은 문턱이에요.' }
];
const MONTH_BRANCH = { 2: '寅', 3: '卯', 4: '辰', 5: '巳', 6: '午', 7: '未', 8: '申', 9: '酉', 10: '戌', 11: '亥', 12: '子', 1: '丑' };

/* ---------- 오늘 천간이 각 일간에게 드는 십성 → 한 줄 ---------- */
const SIP_LINE = {
  '비견': '닮은 기운이 드는 날 — 내 페이스대로 밀어붙이기 좋아요. 고집만 한 뼘 줄이면 됩니다.',
  '겁재': '경쟁의 기운 — 추진력은 오르지만 돈과 약속은 나눠 갖게 되기 쉬워요. 큰 지출은 미루세요.',
  '식신': '표현과 여유의 날 — 말과 손에서 좋은 것이 나옵니다. 맛있는 것, 만드는 것에 운이 있어요.',
  '상관': '번뜩이는 날 — 아이디어와 말이 앞섭니다. 윗사람 앞에선 한 박자 늦게 말하세요.',
  '편재': '판이 커지는 날 — 기회와 씀씀이가 함께 옵니다. 즐기되 계산은 두 번.',
  '정재': '실속의 날 — 숫자와 계획이 맞아떨어집니다. 미뤄둔 정산과 정리를 끝내기 좋아요.',
  '편관': '압박이 드는 날 — 할 일이 몰리고 시험대에 서기 쉬워요. 단단히, 그러나 무리 없이.',
  '정관': '틀이 잡히는 날 — 책임과 규칙이 힘이 됩니다. 공식적인 자리와 문서에 유리해요.',
  '편인': '생각이 깊어지는 날 — 공부와 연구, 혼자만의 시간이 값져요. 결정은 내일로.',
  '정인': '기댈 곳이 생기는 날 — 배우고 정리하고 문서를 챙기기 좋아요. 어른의 조언이 답입니다.'
};
const STEM_HAP = { 0: 5, 5: 0, 1: 6, 6: 1, 2: 7, 7: 2, 3: 8, 8: 3, 4: 9, 9: 4 };
const STEM_CHUNG = { 0: 6, 6: 0, 1: 7, 7: 1, 2: 8, 8: 2, 3: 9, 9: 3 };

/* ---------- 달력 유틸 ---------- */
function midnightJd(y, m, d) { return I.daysFromCivil(y, m, d) + I.JDN_EPOCH - 0.5 - 9 / 24; }
function weekday(y, m, d) { return ((I.daysFromCivil(y, m, d) + 4) % 7 + 7) % 7; }
function nextDay(y, m, d) { return I.civilFromDays(I.daysFromCivil(y, m, d) + 1); }
function prevDay(y, m, d) { return I.civilFromDays(I.daysFromCivil(y, m, d) - 1); }

/* 연도의 절기 24개 — KST 날짜·시각 */
const termCache = {};
function yearTerms(y) {
  if (termCache[y]) return termCache[y];
  const out = TERMS.map((t) => {
    const approx = midnightJd(y, t.approx[0], t.approx[1]);
    const jd = I.findTermJd(t.i * 15, approx - 6, approx + 6);
    const tk = jd - I.JDN_EPOCH + 0.5 + 9 / 24;            /* 1970-01-01 KST 기준 일수 */
    const dn = Math.floor(tk);
    const cv = I.civilFromDays(dn);
    let hh = Math.floor((tk - dn) * 24), mm = Math.round(((tk - dn) * 24 - hh) * 60);
    if (mm === 60) { hh += 1; mm = 0; }
    return Object.assign({}, t, { y: cv.y, m: cv.m, d: cv.d, hh, mm, jd });
  });
  termCache[y] = out;
  return out;
}
function termsOn(y, m, d) { return yearTerms(y).filter((t) => t.m === m && t.d === d); }
function nextTermAfter(y, m, d) {
  const dn = I.daysFromCivil(y, m, d);
  const all = yearTerms(y).concat(yearTerms(y + 1));
  return all.filter((t) => I.daysFromCivil(t.y, t.m, t.d) > dn).sort((a, b) => a.jd - b.jd)[0];
}

function lunarOf(y, m, d) {
  if (!Lunar || !Lunar.setSolarDate(y, m, d)) return null;
  const l = Lunar.getLunarCalendar();
  const leap = !!(l.intercalation || l.isLeap || l.leap || l.leapMonth);
  return { y: l.year, m: l.month, d: l.day, leap, son: l.day % 10 === 9 || l.day % 10 === 0 };
}

function dayInfo(y, m, d) {
  const p = M.dayPillarOf(y, m, d);
  const g = M.ganjiName(p.stem, p.branch);
  const idx60 = I.dayPillarIndex(I.daysFromCivil(y, m, d) + I.JDN_EPOCH);
  const r = M.compute({ year: y, month: m, day: d, hour: 12, minute: 0, unknownTime: true, gender: 'M', applySolarTime: false });
  return { y, m, d, w: weekday(y, m, d), stem: p.stem, branch: p.branch, g, idx60, lun: lunarOf(y, m, d),
    yp: M.ganjiName(r.pillars.year.stem, r.pillars.year.branch), mp: M.ganjiName(r.pillars.month.stem, r.pillars.month.branch),
    terms: termsOn(y, m, d) };
}

const dayUrl = (y, m, d) => `/day/${iso(y, m, d)}/`;
const sonUrl = (y, m) => `/son/${y}-${pad(m)}/`;
const termUrl = (y, slug) => `/jeolgi/${y}/${slug}/`;
const NAV = (rel) => [{ href: rel, label: '사주 보기' }, { href: rel + 'manse/', label: '만세력' }, { href: rel + 'guide/', label: '서재' }];
const STYLE = `<style>
    .dp-table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 6px 0 4px; }
    .dp-table th, .dp-table td { padding: 8px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .dp-table th { font-weight: 500; color: var(--faint); font-size: 12px; }
    .dp-table .son { color: var(--seal); font-weight: 700; }
    .dp-table .term { color: var(--muted); font-size: 12px; }
    .dp-table tr.today td { background: #FBF3E6; }
    .dp-han { font-family: 'Noto Serif KR', serif; }
    .dp-list { list-style: none; padding: 0; margin: 6px 0 0; }
    .dp-list li { padding: 9px 0; border-bottom: 1px solid var(--line-soft); font-size: 14px; line-height: 1.6; }
    .dp-list li b { display: inline-block; min-width: 64px; }
    .dp-tag { font-size: 11px; padding: 1px 7px; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); margin-left: 6px; vertical-align: 1px; }
    .dp-tag.hap { color: var(--seal); border-color: var(--seal); }
    .dp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin: 8px 0 14px; }
    .dp-grid a, .dp-grid span { display: block; text-align: center; padding: 8px 0 6px; border-radius: 8px; background: #FFFDF9; border: 1px solid var(--line-soft); text-decoration: none; color: inherit; font-size: 13px; }
    .dp-grid a small { display: block; font-size: 10px; color: var(--faint); margin-top: 2px; }
    .dp-grid a.today { border-color: var(--seal); background: #FBF3E6; }
    .dp-grid a.son { color: var(--seal); font-weight: 700; }
    .dp-grid .wd { background: transparent; border: none; color: var(--faint); font-size: 11px; padding: 0; }
  </style>`;

function write(relPath, html) {
  const file = path.join(DOCS, relPath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const urls = [];
function addUrl(u, lastmod) { urls.push({ loc: SITE + u, lastmod }); }

/* ---------- 날짜별 일진 페이지 ---------- */
function buildDay(info) {
  const { y, m, d } = info;
  const rel = '../../';
  const st = M.STEMS[info.stem], br = M.BRANCHES[info.branch];
  const ch = C.of(st.han);
  const quote = Q.pick(info.stem, info.idx60);
  const hap = M.STEMS[STEM_HAP[info.stem]];
  const chung = STEM_CHUNG[info.stem] !== undefined ? M.STEMS[STEM_CHUNG[info.stem]] : null;
  const pv = prevDay(y, m, d), nx = nextDay(y, m, d);
  const pvI = M.ganjiName(M.dayPillarOf(pv.y, pv.m, pv.d).stem, M.dayPillarOf(pv.y, pv.m, pv.d).branch);
  const nxI = M.ganjiName(M.dayPillarOf(nx.y, nx.m, nx.d).stem, M.dayPillarOf(nx.y, nx.m, nx.d).branch);
  const lunTxt = info.lun ? `음력 ${info.lun.leap ? '윤' : ''}${info.lun.m}월 ${info.lun.d}일` : '';
  const sonTxt = info.lun ? (info.lun.son ? '손없는날' : '손없는날 아님') : '';
  const title = `${y}년 ${m}월 ${d}일 일진 — ${info.g.kor}(${info.g.han})일${info.lun && info.lun.son ? ' · 손없는날' : ''}`;
  const desc = `${y}년 ${m}월 ${d}일 ${WD[info.w]}의 일진은 ${info.g.kor}(${info.g.han})일. ${lunTxt}${sonTxt ? ', ' + sonTxt : ''}. ${st.kor}${st.el}의 기운이 흐르는 날 — 열 가지 일간별 오늘의 흐름과 합·충, 절기까지.`;

  /* 십성 10줄 */
  const rows = M.STEMS.map((s, i) => {
    const sip = M.sipseongOf(i, info.stem);
    const tag = i === STEM_HAP[info.stem] ? '<span class="dp-tag hap">오늘 가장 순한 일간</span>'
      : (chung && i === STEM_CHUNG[info.stem]) ? '<span class="dp-tag">한 템포 쉬어갈 일간</span>' : '';
    return `<li><b class="dp-han">${s.kor}${s.el}(${s.han})</b> <span class="dp-tag">${sip}</span>${tag}<br>${SIP_LINE[sip]}</li>`;
  }).join('\n        ');

  /* 일지 관계 */
  const chungB = M.BRANCHES.map((b, i) => i).filter((i) => M.branchRelation(info.branch, i) === '충').map((i) => M.BRANCHES[i]);
  const hapB = M.BRANCHES.map((b, i) => i).filter((i) => M.branchRelation(info.branch, i) === '육합').map((i) => M.BRANCHES[i]);
  const branchNote = `일지(태어난 날의 지지)가 <b>${chungB.map((b) => b.kor + '(' + b.han + ')').join('·')}</b>인 분은 오늘 ${br.kor}(${br.han})와 충(沖)이 듭니다 — 이동과 계획 변경이 잦은 날이니 중요한 서명은 미루세요. 반대로 일지가 <b>${hapB.map((b) => b.kor + '(' + b.han + ')').join('·')}</b>인 분은 합(合)이 드는 날, 만남과 부탁이 순하게 풀립니다.`;

  /* 절기 */
  let termHtml;
  if (info.terms.length) {
    termHtml = info.terms.map((t) => `오늘 <b>${pad(t.hh)}:${pad(t.mm)}</b>에 <a href="${rel}jeolgi/${t.y}/${t.slug}/">${t.name}(${t.han})</a>이 듭니다${t.kind === '절' ? ` — 이 시각부터 월주가 ${MONTH_BRANCH[t.month]}월로 바뀝니다${t.slug === 'ipchun' ? ' (년주도 함께 바뀌는 사주의 새해)' : ''}` : ''}.`).join(' ');
  } else {
    const nt = nextTermAfter(y, m, d);
    termHtml = nt ? `다음 절기는 <a href="${rel}jeolgi/${nt.y}/${nt.slug}/">${nt.name}(${nt.han})</a>, ${nt.m}월 ${nt.d}일 ${pad(nt.hh)}:${pad(nt.mm)}.` : '';
  }

  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}day/" style="color: inherit; text-decoration: none;">날짜별 일진</a> · <a href="${rel}son/${y}-${pad(m)}/" style="color: inherit; text-decoration: none;">${y}년 ${m}월</a></div>
    <h1 class="ga-title">${y}년 ${m}월 ${d}일 ${WD[info.w]} —<br><span class="dp-han">${info.g.kor}(${info.g.han})일</span></h1>
    <p class="ga-meta">${lunTxt}${sonTxt ? ' · ' + (info.lun.son ? '<b style="color: var(--seal);">손없는날</b>' : sonTxt) : ''} · ${info.yp.kor}년 ${info.mp.kor}월 ${info.g.kor}일</p>
    <p class="ga-lead">「 ${esc(ch.metaphor)} 」 — ${st.kor}${st.el}(${st.han})의 기운이 흐르는 ${br.kor}(${br.han})의 날. ${esc(quote)}</p>

    <div class="ga-body">
      <h2>이 날의 기둥</h2>
      <table class="dp-table">
        <tr><th>년주</th><td class="dp-han">${info.yp.kor}(${info.yp.han})</td><th>월주</th><td class="dp-han">${info.mp.kor}(${info.mp.han})</td><th>일주</th><td class="dp-han"><b>${info.g.kor}(${info.g.han})</b></td></tr>
      </table>
      <p>${termHtml} ${info.lun && info.lun.son ? `오늘은 음력 ${info.lun.d}일, 손(損)이 하늘로 올라가 쉬는 <b>손없는날</b>입니다 — 이사·개업·계약을 잡기 좋은 날로 전해집니다. <a href="${rel}son/${y}-${pad(m)}/">이 달의 손없는날 전체 보기</a>` : ''}</p>

      <h2>일간별 오늘의 흐름</h2>
      <p>오늘의 천간 ${st.kor}${st.el}이 내 일간에게 어떤 십성으로 드는지에 따라 하루의 결이 달라집니다. 내 일간을 모르면 <a href="${rel}">생일만 넣으면 10초</a>에 나와요.</p>
      <ul class="dp-list">
        ${rows}
      </ul>

      <h2>일지가 ${chungB.map((b) => b.kor).join('·')}인 분은</h2>
      <p>${branchNote}</p>

      <p class="callout">← <a href="${rel}day/${iso(pv.y, pv.m, pv.d)}/">${pv.m}월 ${pv.d}일 ${pvI.kor}일</a> · <a href="${rel}day/${iso(nx.y, nx.m, nx.d)}/">${nx.m}월 ${nx.d}일 ${nxI.kor}일</a> → · <a href="${rel}son/${y}-${pad(m)}/">${m}월 손없는날</a> · <a href="${rel}jeolgi/${y}/">${y}년 절기</a> · <a href="${rel}manse/">만세력</a>${I.daysFromCivil(y, m, d) <= I.daysFromCivil(today.y, today.m, today.d) ? ' · <a href="http://saengil.sajucheop.com/' + y + '/' + pad(m) + '/' + pad(d) + '/">이 날 태어난 아기의 생일첩</a>' : ''}</p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>내 사주로 오늘 점수 보기</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">이 페이지는 모두에게 같은 일진입니다. 내 여덟 글자와 겹쳐 보면 오늘 점수와 시간대별 흐름이 나와요.</p>
    </div>
  </article>`;

  const url = dayUrl(y, m, d);
  write(url.slice(1), shell({
    rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: `${m}월 ${d}일 일진 — ${info.g.kor}일`,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '날짜별 일진', url: SITE + '/day/' }, { name: `${y}년 ${m}월`, url: SITE + sonUrl(y, m) }, { name: `${m}월 ${d}일`, url: SITE + url }]),
      { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: iso(y, m, d), dateModified: iso(y, m, d), inLanguage: 'ko', author: { '@type': 'Organization', name: '사주첩' }, publisher: { '@type': 'Organization', name: '사주첩' }, mainEntityOfPage: SITE + url }],
    body
  }));
  addUrl(url);
}

/* ---------- 월별 손없는날 + 일진표 ---------- */
function buildMonth(y, m, days) {
  const rel = '../../';
  const sons = days.filter((x) => x.lun && x.lun.son);
  const terms = yearTerms(y).filter((t) => t.m === m);
  const pv = m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 };
  const nx = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
  const title = `${y}년 ${m}월 손없는날 — 이사·개업·계약 좋은 날과 ${m}월 일진표`;
  const desc = `${y}년 ${m}월 손없는날은 ${sons.map((x) => x.d + '일').join(', ')} (총 ${sons.length}일). 날짜별 일진(60갑자)과 음력, ${m}월에 드는 절기 시각까지 한 표로.`;
  const sonList = sons.map((x) => `<li><b><a href="${rel}day/${iso(y, m, x.d)}/">${m}월 ${x.d}일 ${WD[x.w]}</a></b> — ${x.g.kor}(${x.g.han})일 · 음력 ${x.lun.leap ? '윤' : ''}${x.lun.m}월 ${x.lun.d}일</li>`).join('\n        ');
  const rowsHtml = days.map((x) => {
    const t = x.terms.length ? x.terms.map((tt) => `<a href="${rel}jeolgi/${tt.y}/${tt.slug}/">${tt.name} ${pad(tt.hh)}:${pad(tt.mm)}</a>`).join(' ') : '';
    const isToday = x.y === today.y && x.m === today.m && x.d === today.d;
    return `<tr${isToday ? ' class="today"' : ''}><td><a href="${rel}day/${iso(y, m, x.d)}/">${x.d}일</a> <span class="term">${WD[x.w].slice(0, 1)}</span></td><td class="dp-han">${x.g.kor}(${x.g.han})</td><td>${x.lun ? (x.lun.leap ? '윤' : '') + x.lun.m + '.' + x.lun.d : ''}</td><td>${x.lun && x.lun.son ? '<span class="son">손없는날</span>' : ''}${t ? ' <span class="term">' + t + '</span>' : ''}</td></tr>`;
  }).join('\n        ');
  const termHtml = terms.length ? terms.map((t) => `<li><b><a href="${rel}jeolgi/${t.y}/${t.slug}/">${t.name}(${t.han})</a></b> — ${t.m}월 ${t.d}일 ${pad(t.hh)}:${pad(t.mm)}${t.kind === '절' ? ` · 이 시각부터 ${MONTH_BRANCH[t.month]}월` : ' · 중기'}</li>`).join('\n        ') : '';

  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}son/" style="color: inherit; text-decoration: none;">월별 손없는날</a> · ${y}년</div>
    <h1 class="ga-title">${y}년 ${m}월 손없는날 —<br>이사·개업·계약 좋은 날</h1>
    <p class="ga-meta">${m}월의 손없는날 ${sons.length}일 · 일진표 · 절기 ${terms.map((t) => t.name).join('·')}</p>
    <p class="ga-lead">${y}년 ${m}월의 손없는날은 <b>${sons.map((x) => x.d + '일(' + WD[x.w].slice(0, 1) + ')').join(', ')}</b>입니다. 음력 끝자리가 9·0인 날 — 손(損)이 하늘로 올라가 사람을 해치지 않는다고 전해져, 이사와 개업, 결혼과 계약을 잡는 날로 오래 쓰여 왔습니다.</p>

    <div class="ga-body">
      <h2>${m}월 손없는날</h2>
      <ul class="dp-list">
        ${sonList}
      </ul>
      <p>"모두의 손없는날"이 "나의 길일"과 같지는 않습니다. 내 일지와 충(沖)이 드는 날이면 손없는날이어도 흔들리는 날이에요. <a href="${rel}">내 사주를 넣으면</a> 손없는날 중 나에게도 트이는 날만 골라 드립니다.</p>

      <h2>${m}월 일진표</h2>
      <table class="dp-table">
        <tr><th>날짜</th><th>일진</th><th>음력</th><th>비고</th></tr>
        ${rowsHtml}
      </table>

      ${terms.length ? `<h2>${m}월에 드는 절기</h2>
      <ul class="dp-list">
        ${termHtml}
      </ul>
      <p>절(節)이 드는 시각부터 사주의 월주가 바뀝니다. 그 시각 앞뒤 두 시간 안에 태어났다면 <a href="${rel}manse/">절기 시각까지 계산하는 만세력</a>으로 월주를 확인하세요.</p>` : ''}

      <p class="callout">← <a href="${rel}son/${pv.y}-${pad(pv.m)}/">${pv.y}년 ${pv.m}월</a> · <a href="${rel}son/${nx.y}-${pad(nx.m)}/">${nx.y}년 ${nx.m}월</a> → · <a href="${rel}jeolgi/${y}/">${y}년 절기 전체</a> · <a href="${rel}lunar/">음력 기념일 변환</a></p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>내 사주 기준 이 달의 길일 찾기</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">운세 캘린더가 손없는날과 나만의 길일이 겹치는 날을 표시해 줍니다. 캘린더 앱으로 내보내기도 돼요.</p>
    </div>
  </article>`;

  const url = sonUrl(y, m);
  write(url.slice(1), shell({
    rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: `${y}년 ${m}월 손없는날`,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '월별 손없는날', url: SITE + '/son/' }, { name: `${y}년 ${m}월`, url: SITE + url }]),
      { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: iso(y, m, 1), inLanguage: 'ko', author: { '@type': 'Organization', name: '사주첩' }, publisher: { '@type': 'Organization', name: '사주첩' }, mainEntityOfPage: SITE + url }],
    body
  }));
  addUrl(url);
}

/* ---------- 절기 페이지 ---------- */
function buildTerm(y, t, list) {
  const rel = '../../../';
  const k = list.indexOf(t);
  const pv = k > 0 ? list[k - 1] : null, nx = k < list.length - 1 ? list[k + 1] : null;
  const dayI = M.ganjiName(M.dayPillarOf(t.y, t.m, t.d).stem, M.dayPillarOf(t.y, t.m, t.d).branch);
  const title = `${y}년 ${t.name}(${t.han}) — ${t.m}월 ${t.d}일 ${pad(t.hh)}:${pad(t.mm)} 시각과 뜻`;
  const desc = `${y}년 ${t.name}은 ${t.m}월 ${t.d}일 ${WD[weekday(t.y, t.m, t.d)]} ${pad(t.hh)}:${pad(t.mm)}(한국 시간)에 듭니다. ${t.desc} ${t.kind === '절' ? '이 시각부터 사주의 월주가 바뀝니다.' : ''}`;
  const roleHtml = t.kind === '절'
    ? `<p>${t.name}은 열두 절(節) 중 하나입니다. 사주에서 달은 1일이 아니라 절이 드는 <b>시각</b>에 바뀌므로, ${y}년 ${t.m}월 ${t.d}일 ${pad(t.hh)}:${pad(t.mm)}을 기점으로 월주(月柱)의 지지가 <b class="dp-han">${MONTH_BRANCH[t.month]}</b>로 넘어갑니다.${t.slug === 'ipchun' ? ' 입춘은 특별히 <b>년주(年柱)까지 바뀌는 사주의 새해</b>입니다 — 띠도 이 시각을 기준으로 바뀝니다.' : ''}</p>
      <p>이 시각 앞뒤로 두 시간 안에 태어났다면 월주가 경계에 걸립니다. 출생 시각이 확실하면 <a href="${rel}manse/">절기 시각까지 계산하는 만세력</a>으로 확인하세요.</p>`
    : `<p>${t.name}은 열두 중기(中氣) 중 하나로, 계절의 한가운데를 알리는 절기입니다. 중기에는 사주의 기둥이 바뀌지 않습니다 — 월주가 바뀌는 것은 절(節)이 드는 시각이에요.</p>`;

  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}jeolgi/" style="color: inherit; text-decoration: none;">절기</a> · <a href="${rel}jeolgi/${y}/" style="color: inherit; text-decoration: none;">${y}년</a></div>
    <h1 class="ga-title">${y}년 ${t.name}(${t.han}) —<br>${t.m}월 ${t.d}일 ${pad(t.hh)}:${pad(t.mm)}</h1>
    <p class="ga-meta">${WD[weekday(t.y, t.m, t.d)]} · 황경 ${t.i * 15}° · ${t.kind === '절' ? '절(節) — 월주가 바뀌는 절기' : '중기(中氣)'} · 그날의 일진 <a href="${rel}day/${iso(t.y, t.m, t.d)}/">${dayI.kor}(${dayI.han})일</a></p>
    <p class="ga-lead">${t.desc}</p>

    <div class="ga-body">
      <h2>사주에서 ${t.name}이 하는 일</h2>
      ${roleHtml}

      <h2>이 절기의 결</h2>
      <p>${t.tip}</p>

      <p class="callout">${pv ? `← <a href="${rel}jeolgi/${pv.y}/${pv.slug}/">${pv.name} ${pv.m}/${pv.d}</a>` : ''}${pv && nx ? ' · ' : ''}${nx ? `<a href="${rel}jeolgi/${nx.y}/${nx.slug}/">${nx.name} ${nx.m}/${nx.d}</a> →` : ''} · <a href="${rel}jeolgi/${y}/">${y}년 절기 전체</a> · <a href="${rel}guide/jeolgi.html">절기력이란</a></p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>절기 시각 기준으로 내 사주 세우기</span></a>
    </div>
  </article>`;

  const url = termUrl(y, t.slug);
  write(url.slice(1), shell({
    rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: `${y}년 ${t.name} — ${t.m}월 ${t.d}일 ${pad(t.hh)}:${pad(t.mm)}`,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '절기', url: SITE + '/jeolgi/' }, { name: `${y}년`, url: SITE + `/jeolgi/${y}/` }, { name: t.name, url: SITE + url }]),
      { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: iso(t.y, t.m, t.d), inLanguage: 'ko', author: { '@type': 'Organization', name: '사주첩' }, publisher: { '@type': 'Organization', name: '사주첩' }, mainEntityOfPage: SITE + url }],
    body
  }));
  addUrl(url);
}

function buildTermYear(y, list) {
  const rel = '../../';
  const rows = list.map((t) => `<tr><td><b><a href="${rel}jeolgi/${y}/${t.slug}/">${t.name}</a></b> <span class="dp-han term">${t.han}</span></td><td><a href="${rel}day/${iso(t.y, t.m, t.d)}/">${t.m}월 ${t.d}일</a> ${WD[weekday(t.y, t.m, t.d)].slice(0, 1)}</td><td>${pad(t.hh)}:${pad(t.mm)}</td><td>${t.kind === '절' ? '<span class="son">절</span> → ' + MONTH_BRANCH[t.month] + '월' : '중기'}</td></tr>`).join('\n        ');
  const ipchun = list.find((t) => t.slug === 'ipchun');
  const title = `${y}년 24절기 날짜와 시각 — 입춘 ${ipchun.m}월 ${ipchun.d}일 ${pad(ipchun.hh)}:${pad(ipchun.mm)}`;
  const desc = `${y}년 24절기의 정확한 날짜와 시각(한국 시간). 입춘 ${ipchun.m}월 ${ipchun.d}일 ${pad(ipchun.hh)}:${pad(ipchun.mm)}부터 동지까지 — 사주의 월주가 바뀌는 열두 절과 열두 중기.`;
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}jeolgi/" style="color: inherit; text-decoration: none;">절기</a></div>
    <h1 class="ga-title">${y}년 24절기 —<br>날짜와 시각</h1>
    <p class="ga-meta">한국 시간(KST) 기준 · 태양 황경으로 직접 계산 · 사주의 새해는 입춘 ${ipchun.m}월 ${ipchun.d}일 ${pad(ipchun.hh)}:${pad(ipchun.mm)}</p>
    <p class="ga-lead">사주는 달력의 달이 아니라 절기로 달을 셉니다. 아래 절(節)이 드는 시각마다 월주가 바뀌고, 입춘에는 년주까지 바뀝니다.</p>
    <div class="ga-body">
      <table class="dp-table">
        <tr><th>절기</th><th>날짜</th><th>시각</th><th>구분</th></tr>
        ${rows}
      </table>
      <p class="callout"><a href="${rel}jeolgi/${y - 1}/">${y - 1}년</a> · <a href="${rel}jeolgi/${y + 1}/">${y + 1}년</a> · <a href="${rel}guide/jeolgi.html">절기력이란</a> · <a href="${rel}manse/">만세력</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>절기 시각 기준으로 내 사주 세우기</span></a>
    </div>
  </article>`;
  const url = `/jeolgi/${y}/`;
  write(url.slice(1), shell({ rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: `${y}년 24절기 시각`,
    jsonld: breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '절기', url: SITE + '/jeolgi/' }, { name: `${y}년`, url: SITE + url }]), body }));
  addUrl(url, iso(today.y, today.m, today.d));
}

/* ---------- 인덱스 페이지 ---------- */
function monthGrid(y, m, days, rel) {
  const first = weekday(y, m, 1);
  let cells = ['일', '월', '화', '수', '목', '금', '토'].map((w) => `<span class="wd">${w}</span>`).join('');
  for (let i = 0; i < first; i++) cells += '<span style="border: none; background: transparent;"></span>';
  cells += days.map((x) => {
    const isToday = x.y === today.y && x.m === today.m && x.d === today.d;
    return `<a href="${rel}day/${iso(y, m, x.d)}/" class="${isToday ? 'today' : ''}${x.lun && x.lun.son ? ' son' : ''}">${x.d}<small>${x.g.kor}</small></a>`;
  }).join('');
  return `<h2>${y}년 ${m}월 <a href="${rel}son/${y}-${pad(m)}/" style="font-size: 13px; font-weight: 400; margin-left: 8px;">손없는날 →</a></h2><div class="dp-grid">${cells}</div>`;
}

function buildDayIndex(byMonth) {
  const rel = '../';
  const keys = Object.keys(byMonth).sort();
  const cur = `${today.y}-${pad(today.m)}`;
  const at = Math.max(0, keys.indexOf(cur));
  const show = keys.slice(at, at + 3);
  const grids = show.map((k) => { const [y, m] = k.split('-').map(Number); return monthGrid(y, m, byMonth[k], rel); }).join('\n');
  const todayInfo = byMonth[cur] ? byMonth[cur].find((x) => x.d === today.d) : null;
  const title = '날짜별 일진 — 오늘의 일진과 60갑자 달력';
  const desc = `오늘 ${today.m}월 ${today.d}일의 일진은 ${todayInfo ? todayInfo.g.kor + '(' + todayInfo.g.han + ')일' : ''}. 날짜를 누르면 그날의 일진과 음력, 손없는날, 일간별 흐름이 열립니다.`;
  const body = `
  <article class="guide-article">
    <div class="ga-overline">날짜별 일진</div>
    <h1 class="ga-title">오늘의 일진 —<br><span class="dp-han">${todayInfo ? todayInfo.g.kor + '(' + todayInfo.g.han + ')일' : ''}</span></h1>
    <p class="ga-meta">${today.y}년 ${today.m}월 ${today.d}일 ${todayInfo ? WD[todayInfo.w] : ''} · 손없는날은 붉게 표시</p>
    <p class="ga-lead">날마다 두 글자의 기운이 바뀝니다. 날짜를 누르면 그날의 일진과 음력, 손없는날, 열 가지 일간별 흐름이 열려요.${todayInfo ? ` <a href="${rel}day/${iso(today.y, today.m, today.d)}/">오늘 일진 자세히 보기 →</a>` : ''}</p>
    <div class="ga-body">
      ${grids}
      <p class="callout"><a href="${rel}son/">월별 손없는날</a> · <a href="${rel}jeolgi/${today.y}/">${today.y}년 절기</a> · <a href="${rel}manse/">만세력 달력</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>내 사주로 오늘 점수 보기</span></a>
    </div>
  </article>`;
  write('day', shell({ rel, title, desc, canonical: SITE + '/day/', nav: NAV(rel), extraHead: STYLE, jsonld: breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '날짜별 일진', url: SITE + '/day/' }]), body }));
  addUrl('/day/', iso(today.y, today.m, today.d));
}

function buildSonIndex(byMonth) {
  const rel = '../';
  const items = Object.keys(byMonth).sort().map((k) => {
    const [y, m] = k.split('-').map(Number);
    const sons = byMonth[k].filter((x) => x.lun && x.lun.son);
    return `<li><b><a href="${rel}son/${k}/">${y}년 ${m}월</a></b> — ${sons.map((x) => x.d + '일').join(', ')}</li>`;
  }).join('\n        ');
  const title = '월별 손없는날 — 이사·개업 좋은 날 달력';
  const desc = `${Y0}년과 ${Y1}년 매달의 손없는날을 한 번에. 음력 끝자리 9·0일을 양력으로 계산했고, 각 달의 일진표와 절기 시각도 함께 봅니다.`;
  const body = `
  <article class="guide-article">
    <div class="ga-overline">손없는날</div>
    <h1 class="ga-title">월별 손없는날 —<br>이사·개업 좋은 날</h1>
    <p class="ga-meta">${Y0}년 · ${Y1}년 · 음력 9·10·19·20·29·30일</p>
    <p class="ga-lead">손없는날은 음력 끝자리가 9와 0인 날 — 열흘에 이틀꼴로 옵니다. 손(損)이 하늘로 올라가 쉬는 날이라 이사와 개업, 계약을 잡는 날로 오래 쓰여 왔어요. 달을 누르면 날짜별 일진표와 절기까지 나옵니다.</p>
    <div class="ga-body">
      <ul class="dp-list">
        ${items}
      </ul>
      <p>모두의 손없는날이 나의 길일은 아닙니다. 내 일지와 충이 드는 날은 손없는날이어도 흔들려요. <a href="${rel}">내 사주를 넣으면</a> 손없는날 중 나에게도 트이는 날만 골라 드립니다.</p>
      <p class="callout"><a href="${rel}day/">날짜별 일진</a> · <a href="${rel}jeolgi/${Y0}/">${Y0}년 절기</a> · <a href="${rel}lunar/">음력 기념일 변환</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>내 사주 기준 길일 찾기</span></a>
    </div>
  </article>`;
  write('son', shell({ rel, title, desc, canonical: SITE + '/son/', nav: NAV(rel), extraHead: STYLE, jsonld: breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '월별 손없는날', url: SITE + '/son/' }]), body }));
  addUrl('/son/', iso(today.y, today.m, today.d));
}

function buildTermIndex() {
  const rel = '../';
  const years = [Y0, Y1].map((y) => {
    const ip = yearTerms(y).find((t) => t.slug === 'ipchun');
    return `<li><b><a href="${rel}jeolgi/${y}/">${y}년 24절기</a></b> — 입춘 ${ip.m}월 ${ip.d}일 ${pad(ip.hh)}:${pad(ip.mm)}</li>`;
  }).join('\n        ');
  const title = '24절기 날짜와 시각 — 사주의 달이 바뀌는 순간';
  const desc = `${Y0}년·${Y1}년 24절기의 정확한 시각(KST). 입춘·경칩·청명 등 열두 절이 드는 시각마다 사주의 월주가 바뀝니다.`;
  const body = `
  <article class="guide-article">
    <div class="ga-overline">절기</div>
    <h1 class="ga-title">24절기 —<br>날짜와 시각</h1>
    <p class="ga-meta">태양 황경으로 직접 계산 · 한국 시간</p>
    <p class="ga-lead">사주는 음력도 양력도 아닌 절기력을 씁니다. 열두 절(節)이 드는 시각에 월주가 바뀌고, 입춘에는 년주까지 바뀌어요. 연도를 누르면 24절기 전체 표가 열립니다.</p>
    <div class="ga-body">
      <ul class="dp-list">
        ${years}
      </ul>
      <p class="callout"><a href="${rel}guide/jeolgi.html">절기력이란 — 서재</a> · <a href="${rel}day/">날짜별 일진</a> · <a href="${rel}manse/">만세력</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>절기 시각 기준으로 내 사주 세우기</span></a>
    </div>
  </article>`;
  write('jeolgi', shell({ rel, title, desc, canonical: SITE + '/jeolgi/', nav: NAV(rel), extraHead: STYLE, jsonld: breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '절기', url: SITE + '/jeolgi/' }]), body }));
  addUrl('/jeolgi/', iso(today.y, today.m, today.d));
}

/* ---------- 실행 ---------- */
const byMonth = {};
let nDays = 0;
for (const y of [Y0, Y1]) {
  for (let m = 1; m <= 12; m++) {
    const days = [];
    for (let d = 1; d <= I.daysInMonth(y, m); d++) {
      const info = dayInfo(y, m, d);
      days.push(info);
      buildDay(info);
      nDays++;
    }
    byMonth[`${y}-${pad(m)}`] = days;
    buildMonth(y, m, days);
  }
  const list = yearTerms(y).slice().sort((a, b) => a.jd - b.jd);
  list.forEach((t) => buildTerm(y, t, list));
  buildTermYear(y, list);
}
buildDayIndex(byMonth);
buildSonIndex(byMonth);
buildTermIndex();

/* 사이트맵 + robots */
const sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? '<lastmod>' + u.lastmod + '</lastmod>' : ''}</url>`))
  .concat(['</urlset>', '']).join('\n');
fs.writeFileSync(path.join(DOCS, 'sitemap-pages.xml'), sm);
const robotsPath = path.join(DOCS, 'robots.txt');
let robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-pages.xml')) {
  robots = robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-pages.xml\n';
  fs.writeFileSync(robotsPath, robots);
}
console.log(`생성 완료 — 일진 ${nDays}장, 월 ${Object.keys(byMonth).length}장, 절기 ${2 * 24 + 2}장, 인덱스 3장 · sitemap-pages.xml ${urls.length} URL`);
