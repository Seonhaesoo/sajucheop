/* 쓰레드 리스트글 자동 게시 — docs/social/thread.txt 내용을 TEXT 포스트로
 * 필요 환경변수: THREADS_USER_ID, THREADS_ACCESS_TOKEN */
import fs from 'node:fs';

const UID = process.env.THREADS_USER_ID;
const TOKEN = process.env.THREADS_ACCESS_TOKEN;

if (!UID || !TOKEN) {
  console.log('THREADS 시크릿이 없어 게시를 건너뜁니다. (글 생성은 완료됨)');
  process.exit(0);
}

const text = fs.readFileSync('docs/social/thread.txt', 'utf8').trim();
const base = `https://graph.threads.net/v1.0/${UID}`;

async function post(url, params) {
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const r = await fetch(url, { method: 'POST', body });
  return r.json();
}

const j1 = await post(`${base}/threads`, { media_type: 'TEXT', text });
if (!j1.id) {
  console.error('쓰레드 컨테이너 실패:', JSON.stringify(j1));
  process.exit(1);
}
console.log('컨테이너 생성:', j1.id);

await new Promise((r) => setTimeout(r, 6000));

const j2 = await post(`${base}/threads_publish`, { creation_id: j1.id });
if (!j2.id) {
  console.error('쓰레드 게시 실패:', JSON.stringify(j2));
  process.exit(1);
}
console.log('쓰레드 리스트글 게시 완료:', j2.id);
