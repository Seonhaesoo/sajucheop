/* 일간 궁합 100페이지 — /gunghap/<나>-<상대>/ (10×10, 나의 시점) + /gunghap/ 인덱스
 * 천간 관계(합·충·상생·비화·상극)와 서로에게 드는 십성은 엔진, 문장은 관계 유형·십성별 템플릿.
 * 링크 궁합(gunghap.js)의 관계 정의와 같은 표를 쓴다. 사용: node tools/build-gunghap.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';

const { M, C } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-05';
const SLUG = ['gapmok', 'eulmok', 'byeonghwa', 'jeonghwa', 'muto', 'gito', 'gyeonggeum', 'singeum', 'imsu', 'gyesu'];
const GUIDE = SLUG.map((s) => 'ilgan-' + s);
const STEM_HAP = { 0: 5, 5: 0, 1: 6, 6: 1, 2: 7, 7: 2, 3: 8, 8: 3, 4: 9, 9: 4 };
const HAPHWA = { '05': '토', '16': '금', '27': '수', '38': '목', '49': '화' };
const STEM_CHUNG = { 0: 6, 6: 0, 1: 7, 7: 1, 2: 8, 8: 2, 3: 9, 9: 3 };
const GEN = M.elCycle.gen;
const CTRL = {}; Object.keys(GEN).forEach((k) => { CTRL[k] = GEN[GEN[k]]; });
const EL_HAN = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };
const GEN_METAPHOR = { '목화': '나무가 불을 지피듯', '화토': '불이 흙을 데우듯', '토금': '흙이 쇠를 품듯', '금수': '바위틈에서 샘이 솟듯', '수목': '비가 나무를 키우듯' };
const GEUK_METAPHOR = { '목토': '나무 뿌리가 흙을 파고들듯', '토수': '둑이 물길을 잡듯', '수화': '물이 불을 다스리듯', '화금': '불이 쇠를 벼리듯', '금목': '도끼가 나무를 다듬듯' };

/* 관계 유형(나의 시점) → 라벨·첫인상·연애·일·조언 */
const REL = {
  hap: { label: '찰떡 조합', tag: '천간합',
    first: '열 개의 천간 중 서로 맞물리는 단 하나의 짝입니다. 처음 만나도 낯설지 않고, 함께 있으면 없던 힘이 생겨요. 설명하기 어려운 끌림이 있다면 그게 합(合)의 감각입니다.',
    love: '끌림이 빠르고 오래 갑니다. 다만 합은 서로에게 스며드는 힘이라, 한쪽이 상대에게 자기를 다 맞추다 정작 자기 색을 잃기 쉬워요. 붙어 있는 시간만큼 각자의 시간도 지키세요.',
    work: '동업이나 팀에서 손발이 잘 맞습니다. 역할이 자연스럽게 나뉘고 갈등이 적은 대신, 둘 다 같은 방향으로 기울어 바깥의 다른 의견을 놓칠 수 있어요. 제3의 눈을 하나 두면 완성됩니다.',
    advice: '잘 맞는다고 방심하지 말 것 — 합은 편안함이 아니라 화학 반응입니다. 서로를 당연하게 여기는 순간부터 식어요.' },
  chung: { label: '긴장 조합', tag: '천간충',
    first: '정면으로 마주 서는 기운입니다. 처음엔 강하게 끌리거나 강하게 밀어내거나 둘 중 하나예요. 밀어내는 힘만큼 서로를 성장시키는 자극이 있어서, 오래 가는 충의 관계는 다른 어떤 관계보다 단단해집니다.',
    love: '불꽃이 튀는 사랑입니다. 지루할 틈은 없지만 같은 문제로 반복해서 부딪히기 쉬워요. 이기려 들면 소모전, 다름을 인정하면 동력이 됩니다. 거리와 예의가 이 관계의 기술이에요.',
    work: '팽팽한 긴장이 일에서는 오히려 생산적입니다. 서로의 허점을 정확히 찔러주는 검토자가 되어주니까요. 다만 역할과 권한을 명확히 나누지 않으면 주도권 싸움이 됩니다.',
    advice: '상대를 바꾸려는 시도를 멈추는 순간 관계가 열립니다. 충은 이기는 관계가 아니라 배우는 관계예요.' },
  bihwa: { label: '편안한 조합', tag: '비화',
    first: '같은 기운끼리 만났습니다. 서로를 가장 잘 알아보는 동료 같은 사이 — 말이 통하고 속도가 비슷해 금세 가까워져요. 대신 닮은 단점까지 공유하고 있어서, 양보가 없으면 같은 지점에서 부딪힙니다.',
    love: '친구 같은 연인이 됩니다. 취향과 리듬이 비슷해 편하고, 설명이 필요 없는 순간이 많아요. 다만 설렘보다 익숙함이 앞서기 쉬우니, 익숙함을 권태로 착각하지 않도록 새로운 경험을 함께 만드세요.',
    work: '같은 그림을 그리는 동료입니다. 의견이 빨리 모이고 실행이 빠르지만, 둘 다 같은 것을 못 보는 사각지대가 생겨요. 다른 오행의 사람을 팀에 두면 균형이 잡힙니다.',
    advice: '닮았기 때문에 더 양보해야 합니다. 서로의 주도권을 번갈아 내주는 규칙 하나가 이 관계를 오래 지켜요.' },
  saengGive: { label: '잘 맞는 조합', tag: '상생 — 내가 살림',
    first: '내 기운이 상대를 살리는 관계입니다. 나는 주고 상대는 받는 구도라, 만나면 상대가 밝아지고 나는 그 모습에서 보람을 느껴요. 주는 쪽이 지치지 않게, 받는 쪽이 고마움을 표현하게 — 그 순환이 관계의 연료입니다.',
    love: '돌보는 사랑을 하게 됩니다. 상대는 나에게서 안정과 힘을 얻고, 나는 상대를 키우는 데서 기쁨을 얻어요. 다만 주기만 하다 보면 어느 날 "나는 누가 채워주지?" 하는 순간이 옵니다. 받는 연습도 하세요.',
    work: '내가 밀어주는 구도입니다. 멘토와 후배, 투자자와 실행자 같은 관계에서 빛나요. 상대가 성과를 내면 내 공이 가려질 수 있으니, 기여를 기록으로 남기는 습관이 필요합니다.',
    advice: '주는 기쁨이 크지만 그것이 의무가 되면 관계가 무거워집니다. 가끔은 받는 자리에 앉으세요.' },
  saengRecv: { label: '잘 맞는 조합', tag: '상생 — 상대가 살림',
    first: '상대의 기운이 나를 살리는 관계입니다. 곁에 있으면 이상하게 힘이 나고 일이 풀려요. 받는 쪽인 내가 고마움을 말로 표현하는 것이 이 관계를 오래 가게 하는 가장 쉬운 방법입니다.',
    love: '기댈 수 있는 사랑입니다. 상대가 나를 든든히 받쳐주고 나는 그 위에서 자라요. 편안함이 의존으로 굳지 않게, 나도 상대에게 줄 수 있는 다른 것(웃음, 새로움, 인정)을 찾아 돌려주세요.',
    work: '상대가 나를 밀어주는 구도입니다. 배우는 자리, 지원받는 자리에서 가장 빨리 성장해요. 다만 상대의 그늘이 편해 독립이 늦어질 수 있으니, 언젠가 혼자 설 계획을 세워두세요.',
    advice: '고맙다는 말을 아끼지 마세요. 살려주는 쪽은 그 한마디로 다시 채워집니다.' },
  geukGive: { label: '단련하는 조합', tag: '상극 — 내가 다듬음',
    first: '내 기운이 상대를 다듬는 관계입니다. 나도 모르게 상대를 고치고 편집하게 되고, 상대는 나 앞에서 긴장해요. 존중으로 쓰면 구조가 되고, 습관이 되면 비판이 됩니다.',
    love: '내가 주도하고 상대가 맞추는 구도가 되기 쉽습니다. 처음엔 든든하다가 나중엔 답답하다는 말을 듣기도 해요. 고치고 싶은 마음이 들 때 세 번 중 두 번은 삼키면, 이 관계는 오히려 깊어집니다.',
    work: '내가 감독하고 상대가 실행하는 구도에서 성과가 납니다. 상대는 내 기준 덕에 정교해지지만 자율성을 잃기 쉬워요. 결과만 요구하고 방법은 맡기는 것이 요령입니다.',
    advice: '다듬는 손은 부드러워야 합니다. 상대의 결을 살리는 방향으로만 깎으세요.' },
  geukRecv: { label: '단련하는 조합', tag: '상극 — 상대가 다듬음',
    first: '상대의 기운이 나를 다듬는 관계입니다. 곁에 있으면 긴장되고 지적받는 느낌이 들지만, 돌아보면 그 사람 덕에 정교해진 자신을 발견해요. 시험대이자 스승 같은 사람입니다.',
    love: '상대가 나를 이끌고 고치려 드는 구도가 되기 쉽습니다. 존중받고 있다고 느끼면 성장의 사랑이, 통제당한다고 느끼면 소모의 사랑이 돼요. 내 영역을 분명히 말하는 것이 관계를 지킵니다.',
    work: '엄격한 상사, 까다로운 고객 같은 관계에서 자주 만납니다. 힘들지만 이 사람 밑에서 실력이 가장 빨리 늘어요. 배울 것을 다 배운 뒤에는 독립을 준비하세요.',
    advice: '지적을 공격으로 듣지 마세요. 상대는 당신을 깎는 것이 아니라 다듬고 있습니다 — 다만 그 손이 거칠면 말하세요.' }
};

/* 상대가 나에게 드는 십성 — 받는 쪽의 감각 */
const SIP_RECV = {
  '비견': '상대는 나와 어깨를 나란히 하는 동료 같은 사람입니다. 내 속도와 방식을 이해해 주는 대신, 같은 것을 원할 때는 양보가 없어 부딪혀요. 동등한 관계를 가장 잘 만드는 짝입니다.',
  '겁재': '상대는 내 승부욕을 깨우는 라이벌 같은 사람입니다. 곁에 있으면 자극받아 더 잘하게 되지만, 돈과 성과를 두고는 경쟁 구도가 되기 쉬워요. 재정은 따로, 목표는 함께가 답입니다.',
  '식신': '상대는 내 재주를 꺼내주는 사람입니다. 그 사람 앞에서는 말이 잘 나오고 아이디어가 흘러요. 함께 있으면 먹고 만들고 즐기는 일이 늘어나는, 삶이 풍요로워지는 짝입니다.',
  '상관': '상대는 나를 표현하게 만드는 사람입니다. 평소라면 삼켰을 말을 하게 되고, 숨겨둔 끼가 나와요. 다만 그 표현이 날카로워질 때가 있어 윗사람·격식 앞에서는 한 박자 늦추세요.',
  '편재': '상대는 내 세상을 넓혀주는 사람입니다. 판이 커지고 기회와 씀씀이가 함께 늘어요. 즐겁고 활동적인 관계지만 계산은 두 번 하는 습관이 필요합니다.',
  '정재': '상대는 내 일상을 단단하게 해주는 사람입니다. 알뜰하고 현실적이라 함께 있으면 삶이 정돈돼요. 화려하진 않아도 오래 가는, 살림이 되는 짝입니다.',
  '편관': '상대는 나를 긴장시켜 성장시키는 사람입니다. 곁에 있으면 자세가 바로 서고 할 일이 분명해져요. 압박이 크게 느껴지는 날엔 거리를 두되, 이 사람 덕에 강해진다는 건 인정하세요.',
  '정관': '상대는 나를 반듯하게 세워주는 사람입니다. 책임과 규칙을 자연스럽게 일깨우고, 함께 있으면 어른스러워져요. 안정적인 관계의 틀을 만드는 짝입니다.',
  '편인': '상대는 남다른 영감을 주는 사람입니다. 대화가 엉뚱한 곳으로 흘러도 결국 새로운 것을 얻어요. 정신적으로 통하는 대신 현실 살림은 서로 챙겨줘야 합니다.',
  '정인': '상대는 기댈 언덕이 되어주는 사람입니다. 설명하지 않아도 이해받고, 힘들 때 제일 먼저 생각나요. 의존이 길어지지 않게만 조심하면 가장 편안한 짝입니다.'
};
/* 나는 상대에게 — 주는 쪽의 역할 */
const SIP_GIVE = {
  '비견': '나는 상대에게 동료이자 거울입니다. 상대가 외로울 때 같은 편이 되어주고, 다툴 때는 같은 고집으로 맞서게 돼요.',
  '겁재': '나는 상대의 승부욕을 자극하는 사람입니다. 상대는 나 때문에 더 노력하지만, 가끔은 나를 경쟁자로 느낍니다.',
  '식신': '나는 상대의 재주를 꺼내주는 사람입니다. 상대는 내 앞에서 편안해지고 잘 웃어요.',
  '상관': '나는 상대를 표현하게 만드는 사람입니다. 상대는 나와 있을 때 솔직해지고, 가끔은 지나치게 솔직해집니다.',
  '편재': '나는 상대의 세상을 넓혀주는 사람입니다. 상대는 나 덕에 기회를 만나고, 씀씀이도 커집니다.',
  '정재': '나는 상대의 일상을 단단하게 해주는 사람입니다. 상대에게 나는 안정이자 현실이에요.',
  '편관': '나는 상대를 긴장시키는 사람입니다. 상대는 내 앞에서 자세를 고치고, 그만큼 성장하지만 눌리기도 해요.',
  '정관': '나는 상대를 반듯하게 세우는 사람입니다. 상대에게 나는 규칙이자 책임이고, 믿을 만한 틀입니다.',
  '편인': '나는 상대에게 영감을 주는 사람입니다. 상대는 나와 대화한 뒤 새로운 생각을 얻어요.',
  '정인': '나는 상대의 기댈 언덕입니다. 상대는 내게서 안정을 얻고, 나는 그 사람을 품게 됩니다.'
};

function relOf(a, b) {
  const sa = M.STEMS[a], sb = M.STEMS[b];
  if (STEM_HAP[a] === b) {
    const hwa = HAPHWA[[Math.min(a, b), Math.max(a, b)].join('')];
    return { key: 'hap', title: '천간의 합(合) — 서로에게 끌리는 조합', body: `${sa.kor}${sa.el}와 ${sb.kor}${sb.el}는 열 개의 천간 중 서로 맞물리는 단 하나의 짝입니다. 두 기운이 만나 ${hwa}(${EL_HAN[hwa]})의 기운으로 화(化)해, 함께 있을 때 없던 힘이 생겨요.` };
  }
  if (STEM_CHUNG[a] === b) return { key: 'chung', title: '천간의 충(沖) — 강하게 부딪히는 조합', body: `${sa.kor}${sa.el}와 ${sb.kor}${sb.el}는 정면으로 마주 서는 기운입니다. 밀어내는 만큼 서로를 성장시키는 자극이 되기도 해요. 거리와 예의가 이 관계의 기술입니다.` };
  if (sa.el === sb.el) return { key: 'bihwa', title: '비화(比和) — 같은 기운의 만남', body: `같은 ${sa.el} 기운끼리 만났습니다. 서로를 가장 잘 알아보는 동료 같은 사이 — 편안하고 빠르게 가까워지지만, 양보가 없으면 부딪히기도 해요.` };
  if (GEN[sa.el] === sb.el) return { key: 'saengGive', title: '상생(相生) — ' + GEN_METAPHOR[sa.el + sb.el], body: `나의 ${sa.el} 기운이 상대의 ${sb.el} 기운을 살립니다. 한쪽이 든든히 밀어주는, 주고받음이 분명한 관계예요.` };
  if (GEN[sb.el] === sa.el) return { key: 'saengRecv', title: '상생(相生) — ' + GEN_METAPHOR[sb.el + sa.el], body: `상대의 ${sb.el} 기운이 나의 ${sa.el} 기운을 살립니다. 한쪽이 든든히 밀어주는, 주고받음이 분명한 관계예요.` };
  if (CTRL[sa.el] === sb.el) return { key: 'geukGive', title: '상극(相剋) — ' + GEUK_METAPHOR[sa.el + sb.el], body: `나의 ${sa.el} 기운이 상대의 ${sb.el} 기운을 다듬습니다. 불편한 순간도 있지만, 잘 쓰면 서로를 단련시키는 관계입니다.` };
  return { key: 'geukRecv', title: '상극(相剋) — ' + GEUK_METAPHOR[sb.el + sa.el], body: `상대의 ${sb.el} 기운이 나의 ${sa.el} 기운을 다듬습니다. 불편한 순간도 있지만, 잘 쓰면 서로를 단련시키는 관계입니다.` };
}

const STYLE = `<style>
    .gp-pair { display: flex; align-items: center; justify-content: center; gap: 18px; margin: 8px 0 14px; }
    .gp-pair i { font-style: normal; font-family: 'Noto Serif KR', serif; font-size: 48px; font-weight: 700; color: var(--seal); line-height: 1; }
    .gp-pair i small { display: block; font-family: 'Noto Sans KR', sans-serif; font-size: 11px; color: var(--faint); font-weight: 400; margin-top: 4px; text-align: center; }
    .gp-pair b { font-size: 22px; color: var(--faint); font-weight: 400; }
    .gp-meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 6px; }
    .gp-meta span { font-size: 12px; padding: 3px 9px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); }
    .gp-meta span b { color: var(--ink); font-weight: 600; }
    .gp-meta span.lab { border-color: var(--seal); color: var(--seal); font-weight: 700; }
    .gp-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 8px 0 18px; }
    .gp-grid a { display: block; text-align: center; padding: 9px 2px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 9px; text-decoration: none; color: inherit; font-size: 12px; }
    .gp-grid a b { display: block; font-family: 'Noto Serif KR', serif; font-size: 18px; }
    .gp-grid a small { display: block; font-size: 10px; color: var(--faint); margin-top: 2px; }
    .gp-grid a.cur { border-color: var(--seal); background: #FBF3E6; }
    .gp-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .gp-table th, .gp-table td { padding: 5px 2px; text-align: center; border-bottom: 1px solid var(--line-soft); }
    .gp-table th { font-family: 'Noto Serif KR', serif; font-weight: 600; color: var(--muted); }
    .gp-table td a { display: block; text-decoration: none; color: inherit; padding: 4px 0; border-radius: 6px; }
    .gp-table td a.hap { background: #FBEAE7; color: var(--seal); font-weight: 700; }
    .gp-table td a.chung { background: #EFEAE0; color: var(--ink); }
    .gp-table td a.saeng { background: #EEF4EA; }
    .gp-table td a.bihwa { background: #F3EEE4; }
    .gp-table td a.geuk { color: var(--faint); }
  </style>`;
const NAV = (rel) => [{ href: rel, label: '사주 보기' }, { href: rel + 'ilju/', label: '일주 사전' }, { href: rel + 'guide/', label: '서재' }];

function write(relPath, html) {
  const file = path.join(DOCS, relPath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
const urls = [];

for (let a = 0; a < 10; a++) {
  for (let b = 0; b < 10; b++) {
    const rel = '../../';
    const sa = M.STEMS[a], sb = M.STEMS[b];
    const ca = C.of(sa.han), cb = C.of(sb.han);
    const r = relOf(a, b);
    const T = REL[r.key];
    const sipRecv = M.sipseongOf(a, b);   /* 상대(b)는 나(a)에게 */
    const sipGive = M.sipseongOf(b, a);   /* 나(a)는 상대(b)에게 */
    const yy = sa.yang !== sb.yang;
    const A = `${sa.kor}${sa.el}`, B = `${sb.kor}${sb.el}`;
    const title = `${A} ${B} 궁합 — ${A} 일간이 ${B} 일간을 만나면 (${T.label})`;
    const desc = `${A}(${sa.han}) 일간과 ${B}(${sb.han}) 일간의 궁합. ${r.title.replace(/ — .*/, '')} 관계로 ${T.label}. 상대는 나에게 ${sipRecv}, 나는 상대에게 ${sipGive}. 첫인상·연애·일·오래 가는 법까지.`;
    const others = M.STEMS.map((s, k) => `<a href="${rel}gunghap/${SLUG[a]}-${SLUG[k]}/"${k === b ? ' class="cur"' : ''}><b>${s.han}</b>${s.kor}${s.el}<small>${REL[relOf(a, k).key].label}</small></a>`).join('\n        ');

    const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}gunghap/" style="color: inherit; text-decoration: none;">일간 궁합</a> · ${A}의 시점</div>
    <div class="gp-pair"><i>${sa.han}<small>${A} · 나</small></i><b>×</b><i>${sb.han}<small>${B} · 상대</small></i></div>
    <h1 class="ga-title">${A} × ${B} 궁합 —<br>${esc(T.label)}</h1>
    <div class="gp-meta">
      <span class="lab">${esc(T.tag)}</span><span>상대는 나에게 <b>${sipRecv}</b></span><span>나는 상대에게 <b>${sipGive}</b></span><span>${yy ? '음양이 다름' : '같은 극성'}</span>
    </div>
    <p class="ga-meta">${esc(ca.metaphor)}(${A}) 이 ${esc(cb.metaphor)}(${B}) 을 만나면</p>
    <p class="ga-lead">${esc(r.title)}. ${esc(r.body)}</p>

    <div class="ga-body">
      <h2>첫인상과 끌림</h2>
      <p>${esc(T.first)}</p>
      <p>${yy ? '음과 양이 만나 서로 다른 결이 하나로 완성되는 조합이라, 다름이 매력이 됩니다.' : '같은 극성끼리라 익숙하고 편안하지만, 밀고 당기는 긴장감은 스스로 만들어야 합니다.'}</p>

      <h2>상대는 나에게 ${sipRecv}</h2>
      <p>${esc(SIP_RECV[sipRecv])}</p>
      <h2>나는 상대에게 ${sipGive}</h2>
      <p>${esc(SIP_GIVE[sipGive])}</p>

      <h2>연애에서</h2>
      <p>${esc(T.love)}</p>

      <h2>일과 동업에서</h2>
      <p>${esc(T.work)}</p>

      <h2>오래 가려면</h2>
      <p><b>${esc(T.advice)}</b></p>

      <h2>일주까지 보면 달라집니다</h2>
      <p>일간 궁합은 관계의 첫 줄입니다. 두 사람의 일지(태어난 날의 지지)가 합인지 충인지, 서로의 빈 오행을 채워주는지에 따라 같은 ${A}·${B} 조합도 결과가 크게 달라져요. <a href="${rel}">생년월일 두 개를 넣으면</a> 점수와 십성 케미, 둘 다 좋은 날까지 나옵니다. ${A} 일간의 여섯 일주는 <a href="${rel}ilju/">60일주 사전</a>에서.</p>

      <h2>${A}가 만나는 열 가지 일간</h2>
      <div class="gp-grid">
        ${others}
      </div>

      <p class="callout"><a href="${rel}gunghap/${SLUG[b]}-${SLUG[a]}/">${B} 입장에서 보기 →</a> · <a href="${rel}guide/${GUIDE[a]}.html">${A} 일간 사전</a> · <a href="${rel}guide/${GUIDE[b]}.html">${B} 일간 사전</a> · <a href="${rel}guide/hapchung.html">합과 충이란</a></p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>생년월일로 실제 궁합 점수 보기</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">상대 생일을 모르면 링크만 보내세요 — 상대가 생일을 넣는 순간 두 사람의 결과가 열립니다.</p>
    </div>
  </article>`;
    const url = `/gunghap/${SLUG[a]}-${SLUG[b]}/`;
    write(url.slice(1), shell({
      rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: `${A} × ${B} 궁합 — ${T.label}`,
      jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '일간 궁합', url: SITE + '/gunghap/' }, { name: `${A} × ${B}`, url: SITE + url }]),
        { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: PUBLISHED, dateModified: PUBLISHED, inLanguage: 'ko', author: { '@type': 'Organization', name: '사주첩' }, publisher: { '@type': 'Organization', name: '사주첩' }, mainEntityOfPage: SITE + url }],
      body
    }));
    urls.push(SITE + url);
  }
}

/* 인덱스 — 10×10 표 */
{
  const rel = '../';
  const head = M.STEMS.map((s) => `<th>${s.han}<br><span style="font-size: 10px; font-weight: 400;">${s.kor}${s.el}</span></th>`).join('');
  const rows = M.STEMS.map((sa, a) => `<tr><th>${sa.han}<br><span style="font-size: 10px; font-weight: 400;">${sa.kor}${sa.el}</span></th>` +
    M.STEMS.map((sb, b) => { const k = relOf(a, b).key; const cls = k === 'hap' ? 'hap' : k === 'chung' ? 'chung' : k === 'bihwa' ? 'bihwa' : k.startsWith('saeng') ? 'saeng' : 'geuk'; const w = { hap: '합', chung: '충', bihwa: '비화', saeng: '생', geuk: '극' }[cls]; return `<td><a class="${cls}" href="${rel}gunghap/${SLUG[a]}-${SLUG[b]}/" title="${sa.kor}${sa.el} × ${sb.kor}${sb.el}">${w}</a></td>`; }).join('') + '</tr>').join('\n        ');
  const title = '일간 궁합표 — 갑목·을목·병화… 열 가지 일간의 100가지 조합';
  const desc = '나의 일간과 상대의 일간으로 보는 궁합 100가지. 천간의 합·충·상생·비화·상극과 서로에게 드는 십성으로 첫인상, 연애, 일, 오래 가는 법을 풀었습니다.';
  const body = `
  <article class="guide-article">
    <div class="ga-overline">일간 궁합</div>
    <h1 class="ga-title">일간 궁합표 —<br>열 가지 일간, 백 가지 만남</h1>
    <p class="ga-meta">세로가 나, 가로가 상대 · 합(合)은 붉게, 충(沖)은 짙게</p>
    <p class="ga-lead">사주 궁합의 첫 줄은 두 사람의 일간이 맺는 관계입니다. 합이면 끌리고, 충이면 부딪히고, 상생이면 한쪽이 살리고, 상극이면 한쪽이 다듬어요. 내 일간을 모르면 <a href="${rel}">생일만 넣으면 10초</a>에 나옵니다.</p>
    <div class="ga-body">
      <div style="overflow-x: auto;">
      <table class="gp-table">
        <tr><th></th>${head}</tr>
        ${rows}
      </table>
      </div>
      <p>표의 칸을 누르면 그 조합의 첫인상·연애·일·조언이 열립니다. 같은 조합이라도 <b>내 시점</b>과 <b>상대 시점</b>이 다르게 읽히니, 두 페이지를 나란히 보세요.</p>
      <p class="callout"><a href="${rel}guide/hapchung.html">합과 충이란</a> · <a href="${rel}guide/sipseong.html">십성 한눈에</a> · <a href="${rel}ilju/">60일주 사전</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>생년월일로 실제 궁합 보기</span></a>
    </div>
  </article>`;
  write('gunghap', shell({ rel, title, desc, canonical: SITE + '/gunghap/', nav: NAV(rel), extraHead: STYLE, ogTitle: '일간 궁합표 100',
    jsonld: breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '일간 궁합', url: SITE + '/gunghap/' }]), body }));
  urls.unshift(SITE + '/gunghap/');
}

fs.writeFileSync(path.join(DOCS, 'sitemap-gunghap.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u}</loc><lastmod>${PUBLISHED}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-gunghap.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-gunghap.xml\n');
console.log(`일간 궁합 — ${urls.length - 1}장 + 인덱스, sitemap-gunghap.xml`);
