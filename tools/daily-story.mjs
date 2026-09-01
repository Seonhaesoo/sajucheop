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

  /* 수동 게시용 일진 글 텍스트 (쓰레드 복붙용) */
  const lines = [
    meta.dateKor + ', 오늘은 ' + meta.ganjiKor + '(' + meta.ganjiHan + ')일.',
    '「 ' + meta.metaphor + ' 」 — ' + meta.stemKor + '의 기운이 흐르는 날입니다.',
    '',
    '오늘 유난히 순한 일간은 ' + meta.hapKor +
      (meta.chungKor ? ', 한 템포 쉬어갈 일간은 ' + meta.chungKor + '.' : '.'),
    '일지가 ' + meta.chungBranchKor + '인 분은 변동만 조심하세요.',
    '',
    '내 일간이 뭔지 모른다면, 생일만 넣으면 10초 → sajucheop.com'
  ];
  fs.writeFileSync('docs/daily/thread.txt', lines.join('\n') + '\n');
  console.log('docs/daily/thread.txt 저장 완료');

  /* 영문 데일리 글 (쓰레드·인스타 영문용) — 간지 한자에서 직접 매핑 */
  const STEM_EN = { '甲': 'Yang Wood', '乙': 'Yin Wood', '丙': 'Yang Fire', '丁': 'Yin Fire', '戊': 'Yang Earth', '己': 'Yin Earth', '庚': 'Yang Metal', '辛': 'Yin Metal', '壬': 'Yang Water', '癸': 'Yin Water' };
  const BR_EN = { '子': 'Rat', '丑': 'Ox', '寅': 'Tiger', '卯': 'Rabbit', '辰': 'Dragon', '巳': 'Snake', '午': 'Horse', '未': 'Goat', '申': 'Monkey', '酉': 'Rooster', '戌': 'Dog', '亥': 'Pig' };
  const MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hanOf = (s) => ((s || '').match(/\(([^)]+)\)/) || [])[1];
  const dparts = meta.date.split('-');
  const dateEn = MON_EN[+dparts[1] - 1] + ' ' + (+dparts[2]);
  const hapEn = STEM_EN[hanOf(meta.hapKor)];
  const chungEn = meta.chungKor ? STEM_EN[hanOf(meta.chungKor)] : null;
  const chungBrEn = BR_EN[hanOf(meta.chungBranchKor)];
  const enLines = [
    dateEn + ' — a ' + STEM_EN[meta.ganjiHan[0]] + ' ' + BR_EN[meta.ganjiHan[1]] + ' (' + meta.ganjiHan + ') day.',
    '',
    'Gentlest on ' + hapEn + ' Day Masters' + (chungEn ? '; a slower lane for ' + chungEn + '.' : '.'),
    'If your Day Branch is the ' + chungBrEn + ', keep today\'s plans flexible.',
    '',
    'Find your Day Master in 10 seconds → sajucheop.com/en/'
  ];
  fs.writeFileSync('docs/daily/thread-en.txt', enLines.join('\n') + '\n');
  console.log('docs/daily/thread-en.txt 저장 완료');
}
