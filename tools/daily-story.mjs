/* 데일리 스토리 카드 생성 — Playwright로 daily-card.html을 열어 JPEG 추출 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const url = process.env.CARD_URL || 'https://sajucheop.com/daily-card.html?bot=1';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 1200 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForFunction('window.__cardReady === true', null, { timeout: 60000 });
const dataUrl = await page.evaluate('window.__cardDataUrl');
const meta = await page.evaluate('window.__cardMeta').catch(() => null);
await browser.close();

const b64 = dataUrl.split(',')[1];
const buf = Buffer.from(b64, 'base64');
fs.mkdirSync('docs/daily', { recursive: true });
fs.writeFileSync('docs/daily/story.jpg', buf);
console.log('docs/daily/story.jpg 저장 완료 —', Math.round(buf.length / 1024), 'KB');
if (meta) {
  fs.writeFileSync('docs/daily/meta.json', JSON.stringify(meta, null, 2));
  console.log('docs/daily/meta.json 저장 완료 —', meta.date, meta.ganjiKor + '일');
}
