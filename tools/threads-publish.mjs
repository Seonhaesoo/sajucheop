/* 쓰레드 데일리 일진 글 자동 게시 — 카드 이미지 + 글 (한글 계정), --en 이면 영문 글만 (영문 계정)
 * 필요 환경변수: THREADS_USER_ID, THREADS_ACCESS_TOKEN / --en: THREADS_EN_USER_ID, THREADS_EN_ACCESS_TOKEN */
import fs from 'node:fs';
import { creds, publish } from './threads-api.mjs';

const en = process.argv.includes('--en');
const c = creds(en);
if (!c) {
  console.log((en ? 'THREADS_EN' : 'THREADS') + ' 시크릿이 없어 게시를 건너뜁니다.');
  process.exit(0);
}

const file = en ? 'docs/daily/thread-en.txt' : 'docs/daily/thread.txt';
let text;
try {
  text = fs.readFileSync(file, 'utf8').trim();
} catch {
  console.log(file + ' 없음 — 건너뜁니다.');
  process.exit(0);
}

const ver = process.env.IMAGE_VER || Date.now();
/* 카드 이미지는 한글이라 한글 계정에만 첨부 */
const imageUrl = en ? null : 'https://sajucheop.com/daily/story.jpg?v=' + ver;

try {
  await publish(c, { text, imageUrl });
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
