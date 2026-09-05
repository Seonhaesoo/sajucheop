/* 주간 소셜 콘텐츠 생성 — 캐러셀 카드 이미지 + 캡션 + 쓰레드 리스트글 (한글 + 영문)
 * 회차(seq)는 docs/social/meta.json에 저장되어 실행마다 1씩 증가,
 * 콘텐츠 풀을 순환한다. 결과물은 커밋되어 Pages로 서빙된다.
 * 영문판은 같은 slug의 짝을 social-content-en.mjs에서 찾아 carousel-en/에 따로 그린다. */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CAROUSELS, THREADS, CTA_TAGS } from './social-content.mjs';
import { VIRAL_CAROUSELS, VIRAL_THREADS } from './viral-content.mjs';
import { CAROUSELS_EN, THREADS_EN, VIRAL_THREADS_EN, CTA_TAGS_EN } from './social-content-en.mjs';
import { HOOK_CAROUSELS, HOOK_THREADS, HOOK_TAGS } from './hook-content.mjs';

const OUT_DIR = 'docs/social';
const CARD_DIR = path.join(OUT_DIR, 'carousel');
const CARD_DIR_EN = path.join(OUT_DIR, 'carousel-en');

/* 회차 결정 */
let seq = 0;
try {
  const prev = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'meta.json'), 'utf8'));
  if (Number.isInteger(prev.seq)) seq = prev.seq + 1;
} catch { /* 첫 실행 */ }

/* 3종 순환: 회차 % 3 → 0 교육(서재) · 1 바이럴(일간 저격·기능 시연) · 2 후킹(유입용) */
const KIND = ['edu', 'viral', 'hook'][seq % 3];
const KIND_KO = { edu: '교육', viral: '바이럴', hook: '후킹' }[KIND];
const cPool = KIND === 'edu' ? CAROUSELS : KIND === 'viral' ? VIRAL_CAROUSELS : HOOK_CAROUSELS;
const tPool = KIND === 'edu' ? THREADS : KIND === 'viral' ? VIRAL_THREADS : HOOK_THREADS;
const poolIdx = Math.floor(seq / 3);
const carousel = cPool[poolIdx % cPool.length];
const thread = tPool[poolIdx % tPool.length];
const kstDate = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

/* 영문판 — 캐러셀은 slug로 짝을 찾고, 쓰레드는 같은 회차 인덱스를 쓴다 (후킹 풀은 영문 없음) */
const carouselEn = CAROUSELS_EN[carousel.slug] || null;
const tPoolEn = KIND === 'edu' ? THREADS_EN : KIND === 'viral' ? VIRAL_THREADS_EN : null;
const threadEn = tPoolEn ? (tPoolEn[poolIdx % tPoolEn.length] || null) : null;
if (!carouselEn) console.warn(`영문 캐러셀 없음: ${carousel.slug} — EN 카드는 건너뜀`);

console.log(`회차 ${seq} (${KIND_KO}) · ${kstDate} — 캐러셀 "${carousel.slug}", 쓰레드 ${poolIdx % tPool.length + 1}번`);

/* 출력 폴더 초기화 */
fs.rmSync(CARD_DIR, { recursive: true, force: true });
fs.mkdirSync(CARD_DIR, { recursive: true });
fs.rmSync(CARD_DIR_EN, { recursive: true, force: true });
if (carouselEn) fs.mkdirSync(CARD_DIR_EN, { recursive: true });

/* 카드 목록: 표지 + 본문 + CTA */
const cards = [
  { type: 'cover', title: carousel.title, sub: carousel.sub, hanja: carousel.hanja },
  ...carousel.cards.map((c, i) => ({ type: 'content', idx: i, head: c.head, body: c.body })),
  { type: 'cta' }
];
const cardsEn = carouselEn ? [
  { type: 'cover', lang: 'en', title: carouselEn.title, sub: carouselEn.sub, hanja: carouselEn.hanja || carousel.hanja },
  ...carouselEn.cards.map((c, i) => ({ type: 'content', lang: 'en', idx: i, head: c.head, body: c.body })),
  { type: 'cta', lang: 'en' }
] : [];

const templateUrl = pathToFileURL(
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'carousel-template.html')
).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(templateUrl, { waitUntil: 'networkidle', timeout: 60000 });
await page.evaluate('window.fontsReady');

async function shoot(list, dir) {
  for (let i = 0; i < list.length; i++) {
    await page.evaluate((d) => window.renderCard(d), list[i]);
    await page.waitForTimeout(150);
    const file = path.join(dir, `card-${i + 1}.jpg`);
    await page.locator('#card').screenshot({ type: 'jpeg', quality: 90, path: file });
    console.log(`${file} 저장 (${Math.round(fs.statSync(file).size / 1024)} KB)`);
  }
}
await shoot(cards, CARD_DIR);
if (carouselEn) await shoot(cardsEn, CARD_DIR_EN);
await browser.close();

/* 캡션 · 쓰레드 · 메타 */
const tagLine = (carousel.tags ? carousel.tags + ' ' : '') + (KIND === 'hook' ? HOOK_TAGS : CTA_TAGS);
fs.writeFileSync(path.join(OUT_DIR, 'caption.txt'), carousel.caption + '\n\n' + tagLine + '\n');
fs.writeFileSync(path.join(OUT_DIR, 'thread.txt'), thread + '\n');
if (carouselEn) {
  fs.writeFileSync(path.join(OUT_DIR, 'caption-en.txt'), carouselEn.caption + '\n\n' + CTA_TAGS_EN + '\n');
} else {
  fs.rmSync(path.join(OUT_DIR, 'caption-en.txt'), { force: true });
}
if (threadEn) fs.writeFileSync(path.join(OUT_DIR, 'thread-en.txt'), threadEn + '\n');
else fs.rmSync(path.join(OUT_DIR, 'thread-en.txt'), { force: true });
fs.writeFileSync(path.join(OUT_DIR, 'meta.json'), JSON.stringify({
  seq,
  type: KIND,
  date: kstDate,
  slug: carousel.slug,
  title: carousel.title.replace(/\n/g, ' '),
  cards: cards.length,
  en: carouselEn ? { title: carouselEn.title.replace(/\n/g, ' '), cards: cardsEn.length } : null
}, null, 2));

console.log(`완료 — 카드 ${cards.length}장` + (carouselEn ? ` + 영문 ${cardsEn.length}장` : '') + ', caption/thread(+en), meta.json');
