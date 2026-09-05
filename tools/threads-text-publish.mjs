/* 쓰레드 리스트글 자동 게시 — docs/social/thread.txt 를 TEXT 포스트로, --en 이면 thread-en.txt 를 영문 계정에
 * 필요 환경변수: THREADS_USER_ID, THREADS_ACCESS_TOKEN / --en: THREADS_EN_USER_ID, THREADS_EN_ACCESS_TOKEN */
import fs from 'node:fs';
import { creds, publish } from './threads-api.mjs';

const en = process.argv.includes('--en');
const c = creds(en);
if (!c) {
  console.log((en ? 'THREADS_EN' : 'THREADS') + ' 시크릿이 없어 게시를 건너뜁니다. (글 생성은 완료됨)');
  process.exit(0);
}

const file = en ? 'docs/social/thread-en.txt' : 'docs/social/thread.txt';
let text;
try {
  text = fs.readFileSync(file, 'utf8').trim();
} catch {
  console.log(file + ' 없음(이번 회차는 영문 글이 없는 풀) — 건너뜁니다.');
  process.exit(0);
}
if (!text) { console.log(file + ' 비어 있음 — 건너뜁니다.'); process.exit(0); }

try {
  await publish(c, { text });
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
