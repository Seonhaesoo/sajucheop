/* 공유 카드(OG 이미지, 1200×630) — 카톡·쓰레드·인스타에 링크를 붙였을 때 뜨는 그림. 먹과 한지 색으로 한 번 그려 docs/og/ 에 JPEG 로 저장(정적 커밋, 한 장 60~90KB).
 *  구역별 고정 그림 + 자료로 만드는 그림(2027 띠 12·띠 궁합 12·이달의 띠별 운세·영문 띠 12·영문 2027 12).
 *  page-shell 은 o.og 키 → /og/<키>.jpg, 없으면 주소 앞부분으로 구역 그림, 그것도 없으면 og-image.png.
 *  실행: node tools/og.mjs [키,키 …]   (Playwright 가 필요 — 옆 폴더 MOMJA 의 node_modules 를 PLAYWRIGHT_DIR 로 줄 수 있다) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ROOT_DIR } from './engine.mjs';
import { ANIMALS } from './en-zodiac-data.mjs';

const OUT = path.join(ROOT_DIR, 'docs', 'og');
const DOCS = path.join(ROOT_DIR, 'docs');
const NY = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'tools', 'ny2027-ddi.json'), 'utf8'));

/* ---------- 구역별 고정 ---------- */
const STATIC = [
  { key: '2027', kicker: '2027 정미년 신년운세', title: '2027년 내 운세는\n몇 점일까', sub: '12띠 점수 · 나이별 · 60일주별 · 월별 흐름 · 좋은 달' },
  { key: '2027-ilju', kicker: '2027 정미년 · 일주별', title: '내 일주에게\n2027년은 어떤 해', sub: '60일주 × 정화(丁)의 십성 · 좋은 달·조심할 달' },
  { key: 'wolun', kicker: '이달의 띠별 운세', title: '이번 달\n내 띠 운세는', sub: '12띠 점수 · 좋은 날·조심할 날 · 절기 기준' },
  { key: 'ddi-gunghap', kicker: '띠 궁합', title: '우리 띠는\n잘 맞을까', sub: '12띠 × 12띠 점수 · 연애·결혼·친구·가족' },
  { key: 'gunghap', kicker: '일간 궁합', title: '생년월일로 보는\n두 사람의 궁합', sub: '일간·일지·오행 균형 · 100가지 만남' },
  { key: 'today-ddi', kicker: '오늘의 띠별 운세', title: '오늘 내 띠는\n몇 점일까', sub: '12띠 점수 · 재물·애정·일·건강 · 행운의 시간과 색' },
  { key: 'ilju', kicker: '60일주 사전', title: '태어난 날의 두 글자,\n나는 어떤 사람', sub: '갑자일주부터 계해일주까지 · 성격·연애·직업' },
  { key: 'naming', kicker: '이름 짓기', title: '아기 이름,\n어떤 한자가 좋을까', sub: '81수리 · 발음오행 · 사주에 부족한 오행 채우기' },
  { key: 'hanja', kicker: '이름 한자 사전', title: '이름 한자의\n뜻·원획·자원오행', sub: '70개 음 · 645자 · 인명용 한자' },
  { key: 'guide', kicker: '서재', title: '사주, 믿지 말고\n이해하세요', sub: '일간 · 오행 · 십성 · 대운 · 용신 · 신살' },
  { key: 'jeolgi', kicker: '24절기', title: '올해 절기는\n며칠 몇 시일까', sub: '시각 · 뜻 · 풍습 · 먹는 음식 · 사주에서 달이 바뀌는 때' },
  { key: 'day', kicker: '날짜별 일진', title: '오늘의 일진은\n무슨 날일까', sub: '60갑자 · 음력 · 손없는날 · 일간별 흐름' },
  { key: 'son', kicker: '손없는날', title: '이사하기 좋은 날,\n이달의 손없는날', sub: '음력 9·10·19·20·29·30일 · 달력으로' },
  { key: 'tojeong', kicker: '토정비결', title: '올해 내 괘는\n무엇일까', sub: '144괘 · 생년월일로 · 2026·2027' },
  { key: 'samjae', kicker: '삼재', title: '내 띠는\n지금 삼재일까', sub: '들삼재·눌삼재·날삼재 · 띠별 3년' },
  { key: 'manse', kicker: '만세력', title: '절기 시각까지\n정확한 만세력', sub: '년·월·일·시 네 기둥 · 진태양시 보정' },
  { key: 'lunar', kicker: '음력 기념일', title: '음력 생일,\n올해는 양력 며칠', sub: '음력 ↔ 양력 · 윤달 · 해마다 바뀌는 날짜' },
  { key: 'test', kicker: '일간 테스트', title: '나는 열 가지 일간 중\n어떤 사람일까', sub: '12문항 · 갑목부터 계수까지' },
  { key: 'social', kicker: '사주첩', title: '여덟 글자에 담긴\n당신의 이야기', sub: '무료 사주풀이 · 오늘의 운세 · 궁합 · 2027 신년운세' },
  /* 영문 */
  { key: 'en-zodiac', lang: 'en', kicker: 'Chinese Zodiac', title: 'What animal\nis my birth year?', sub: 'Every year 1924–2031 · dates, element, personality, compatibility' },
  { key: 'en-compat', lang: 'en', kicker: 'Zodiac Compatibility', title: 'Do our signs\nget along?', sub: 'All 78 pairings scored · love, friendship, family' },
  { key: 'en-2027', lang: 'en', kicker: '2027 Chinese Horoscope', title: 'Year of the Fire Goat —\nhow is your sign?', sub: 'Score, love, money, career, health · month by month' },
  { key: 'en-monthly', lang: 'en', kicker: 'Monthly Chinese Horoscope', title: 'This month\nfor all twelve signs', sub: 'Solar months · best and care days · ten Day Masters' },
  { key: 'en-day', lang: 'en', kicker: 'Day Pillar Calendar', title: 'What pillar\nis today?', sub: 'Sixty-day cycle · lunar date · a line for each Day Master' },
  { key: 'en-name', lang: 'en', kicker: 'Korean Name Generator', title: 'A Korean name\nthat fits your chart', sub: '70 syllables · 646 name hanja · sorted by element' },
  { key: 'en-guide', lang: 'en', kicker: 'Library', title: 'Saju, explained\nwithout the mysticism', sub: 'Day Masters · Five Elements · Ten Gods · luck cycles' },
  { key: 'en-pillars', lang: 'en', kicker: 'Sixty Day Pillars', title: 'Which of the sixty\nday pillars are you?', sub: 'Personality, love, career · your 2027' },
  { key: 'en-gender', lang: 'en', kicker: 'Chinese Gender Calendar 2027', title: 'Boy or girl?\nThe old chart, read right', sub: 'Lunar age and lunar month worked out from real dates · 2026–2027 tables' },
  { key: 'en-lunar-age', lang: 'en', kicker: 'Lunar Age Calculator', title: 'What is my\nlunar age?', sub: 'One at birth, one more at every Chinese New Year · 1930–2050' },
  { key: 'en-chinese-calendar', lang: 'en', kicker: 'Chinese Calendar 2027', title: 'Every lunar date\nin the Year of the Goat', sub: 'Month by month · festivals · solar terms · day pillars' },
  { key: 'en-lucky-colors', lang: 'en', kicker: 'Lucky Colors 2027', title: 'Your lucky colors\nfor the Fire Goat year', sub: 'All twelve signs · worked out from the Five Elements, step by step' },
  { key: 'en-bazi', lang: 'en', kicker: 'Four Pillars', title: 'Your BaZi chart\nin ten seconds', sub: 'Day Master · Five Elements · Ten Gods · luck cycles' },
  { key: 'ja', lang: 'ja', kicker: '四柱推命', title: '生年月日で\n命式を立てる', sub: '日干・五行・十神 · 2027年 干支別の運勢' },
];

/* ---------- 자료로 만드는 그림 ---------- */
const readTitle = (rel) => { const f = path.join(DOCS, rel, 'index.html'); return fs.existsSync(f) ? (fs.readFileSync(f, 'utf8').match(/<title>([^<]*)<\/title>/) || [])[1] || '' : ''; };
const readDesc = (rel) => { const f = path.join(DOCS, rel, 'index.html'); return fs.existsSync(f) ? (fs.readFileSync(f, 'utf8').match(/name="description" content="([^"]*)"/) || [])[1] || '' : ''; };
const un = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const DYNAMIC = [];
/* 2027 띠 12 */
for (const d of NY) DYNAMIC.push({ key: `2027-${d.slug}`, kicker: '2027 정미년 신년운세', title: `${d.animal}띠 ${d.score}점`, sub: `${d.tail} · 좋은 달 ${d.good} · 나이별 운세` });
/* 띠 궁합 12 — 만들어 둔 페이지 제목에서 잘 맞는 띠 셋 */
for (const d of NY) {
  const t = un(readTitle(`ddi-gunghap/${d.slug}`)), m = t.match(/잘 맞는 띠는\? ([^ ]+) —/);
  if (m) DYNAMIC.push({ key: `gunghap-${d.slug}`, kicker: '띠 궁합', title: `${d.animal}띠와\n잘 맞는 띠는?`, sub: `${m[1]} · 12띠 점수 순위 · 연애·결혼·친구` });
}
/* 이달의 띠별 운세 — 만들어 둔 달 페이지마다 */
if (fs.existsSync(path.join(DOCS, 'wolun'))) for (const k of fs.readdirSync(path.join(DOCS, 'wolun')).filter((x) => /^\d{4}-\d{2}$/.test(x))) {
  const t = un(readTitle(`wolun/${k}`)), ds = un(readDesc(`wolun/${k}`));
  const kor = (t.match(/\((.+?)월\)/) || [])[1] || '', good = (ds.match(/운이 좋은 띠는 ([^,]+),/) || [])[1] || '';
  const [y, m] = k.split('-').map(Number);
  DYNAMIC.push({ key: `wolun-${k}`, kicker: '이달의 띠별 운세', title: `${y}년 ${m}월\n띠별 운세`, sub: `${kor ? kor + '월 · ' : ''}운이 좋은 띠 ${good} · 좋은 날·조심할 날` });
}
/* 영문 띠 12 + 2027 12 */
const yearsOf = (b) => { const ys = []; for (let y = 1960; y <= 2031; y++) if (((y - 4) % 12 + 12) % 12 === b) ys.push(y); return ys; };
ANIMALS.forEach((A, b) => {
  DYNAMIC.push({ key: `en-zodiac-${A.slug}`, lang: 'en', kicker: 'Chinese Zodiac', title: `Year of the ${A.name}`, sub: `${yearsOf(b).join(', ')} · personality, compatibility, 2027` });
  const d = NY[b];
  DYNAMIC.push({ key: `en-2027-${A.slug}`, lang: 'en', kicker: '2027 Chinese Horoscope', title: `${A.name} in 2027\n${d.score}/100`, sub: 'Year of the Fire Goat · love, money, career, health · month by month' });
});
export const OG = STATIC.concat(DYNAMIC);

/* ---------- 그림 ---------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>');
const html = (o) => {
  const en = o.lang === 'en', ja = o.lang === 'ja';
  const serif = ja ? "'Noto Serif JP','Noto Serif KR',serif" : en ? "'Noto Serif KR','Noto Serif',serif" : "'Noto Serif KR',serif";
  const titleSize = en ? 78 : 84;
  return `<!doctype html><html lang="${o.lang || 'ko'}"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+KR:wght@600;700${ja ? '&family=Noto+Serif+JP:wght@700&family=Noto+Sans+JP:wght@500' : ''}&display=swap">
<style>
html,body{margin:0}
#og{width:1200px;height:630px;position:relative;background:#F6F1E8;color:#211C15;font-family:'Noto Sans KR',${ja ? "'Noto Sans JP'," : ''}sans-serif;overflow:hidden}
#og:before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 100% 0%, rgba(184,56,45,.07), transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(33,28,21,.05), transparent 50%)}
.side{position:absolute;left:0;top:0;bottom:0;width:18px;background:#B8382D}
.kick{position:absolute;top:74px;left:92px;font-size:28px;color:#B8382D;font-weight:700;letter-spacing:.06em}
.title{position:absolute;top:140px;left:92px;right:92px;font-family:${serif};font-size:${titleSize}px;line-height:1.22;font-weight:700;letter-spacing:-.01em;word-break:keep-all}
.sub{position:absolute;top:418px;left:92px;right:92px;font-size:31px;line-height:1.5;color:#6E6455;word-break:keep-all}
.brand{position:absolute;bottom:56px;left:92px;font-size:32px;font-weight:700;color:#211C15}
.brand small{font-weight:500;color:#9A8F7E;font-size:24px;margin-left:14px}
.seal{position:absolute;right:88px;bottom:52px;width:92px;height:92px;background:#B8382D;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Noto Serif KR',serif;color:#F6F1E8;font-size:34px;line-height:1.05;font-weight:600}
.vert{position:absolute;right:210px;top:64px;writing-mode:vertical-rl;font-family:'Noto Serif KR',serif;font-size:22px;letter-spacing:.35em;color:#9A8F7E}
</style></head><body><div id="og"><div class="side"></div>
<div class="kick">${esc(o.kicker)}</div><div class="title">${esc(o.title)}</div><div class="sub">${esc(o.sub)}</div>
<div class="vert">${en ? 'Four Pillars' : '命을 읽다'}</div>
<div class="brand">sajucheop.com${en ? '<small>Korean saju · Four Pillars, plainly</small>' : ja ? '<small>四柱推命 · 韓国式</small>' : '<small>무료 사주풀이 · 먹과 한지</small>'}</div>
<div class="seal"><span>四</span><span>柱</span></div>
</div></body></html>`;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const pwDir = process.env.PLAYWRIGHT_DIR;
  const { chromium } = await import(pwDir ? pathToFileURL(path.join(pwDir, 'playwright', 'index.mjs')).href : 'playwright');
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const only = (process.argv[2] || '').split(',').filter(Boolean);   /* node tools/og.mjs 2027,wolun — 일부만 다시 그리기 */
  const skipExisting = process.argv.includes('--new');               /* --new: 없는 것만 */
  let n = 0;
  for (const o of OG.filter((x) => !only.length || only.includes(x.key))) {
    const file = path.join(OUT, `${o.key}.jpg`);
    if (skipExisting && fs.existsSync(file)) continue;
    await page.setContent(html(o), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(120);
    const jpg = await page.locator('#og').screenshot({ type: 'jpeg', quality: 88 });
    fs.writeFileSync(file, jpg);
    n++;
  }
  await browser.close();
  console.log(`og — ${n}장 그림 (${OG.length}개 중), docs/og/`);
}
