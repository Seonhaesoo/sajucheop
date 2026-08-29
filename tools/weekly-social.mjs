/* 주간 소셜 콘텐츠 생성 — 캐러셀 카드 이미지 + 캡션 + 쓰레드 리스트글
 * 회차(seq)는 docs/social/meta.json에 저장되어 실행마다 1씩 증가,
 * 콘텐츠 풀을 순환한다. 결과물은 커밋되어 Pages로 서빙된다. */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CAROUSELS, THREADS, CTA_TAGS } from './social-content.mjs';

const OUT_DIR = 'docs/social';
const CARD_DIR = path.join(OUT_DIR, 'carousel');

/* 회차 결정 */
let seq = 0;
try {
  const prev = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'meta.json'), 'utf8'));
  if (Number.isInteger(prev.seq)) seq = prev.seq + 1;
} catch { /* 첫 실행 */ }

const carousel = CAROUSELS[seq % CAROUSELS.length];
const thread = THREADS[seq % THREADS.length];
const kstDate = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

console.log(`회차 ${seq} · ${kstDate} — 캐러셀 "${carousel.slug}", 쓰레드 ${seq % THREADS.length + 1}번`);

/* 출력 폴더 초기화 */
fs.rmSync(CARD_DIR, { recursive: true, force: true });
fs.mkdirSync(CARD_DIR, { recursive: true });

/* 카드 목록: 표지 + 본문 + CTA */
const cards = [
  { type: 'cover', title: carousel.title, sub: carousel.sub, hanja: carousel.hanja },
  ...carousel.cards.map((c, i) => ({ type: 'content', idx: i, head: c.head, body: c.body })),
  { type: 'cta' }
];

const templateUrl = pathToFileURL(
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'carousel-template.html')
).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(templateUrl, { waitUntil: 'networkidle', timeout: 60000 });
await page.evaluate('window.fontsReady');

for (let i = 0; i < cards.length; i++) {
  await page.evaluate((d) => window.renderCard(d), cards[i]);
  await page.waitForTimeout(150);
  const file = path.join(CARD_DIR, `card-${i + 1}.jpg`);
  await page.locator('#card').screenshot({ type: 'jpeg', quality: 90, path: file });
  console.log(`${file} 저장 (${Math.round(fs.statSync(file).size / 1024)} KB)`);
}
await browser.close();

/* 캡션 · 쓰레드 · 메타 */
fs.writeFileSync(path.join(OUT_DIR, 'caption.txt'), carousel.caption + '\n\n' + CTA_TAGS + '\n');
fs.writeFileSync(path.join(OUT_DIR, 'thread.txt'), thread + '\n');
fs.writeFileSync(path.join(OUT_DIR, 'meta.json'), JSON.stringify({
  seq,
  date: kstDate,
  slug: carousel.slug,
  title: carousel.title.replace(/\n/g, ' '),
  cards: cards.length
}, null, 2));

console.log(`완료 — 카드 ${cards.length}장, caption.txt, thread.txt, meta.json`);
