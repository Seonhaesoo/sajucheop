/* 쓰레드 데일리 일진 글 자동 게시 (Threads API) — 카드 이미지 + 글
 * 필요 환경변수: THREADS_USER_ID, THREADS_ACCESS_TOKEN, (선택) IMAGE_VER */
import fs from 'node:fs';

const UID = process.env.THREADS_USER_ID;
const TOKEN = process.env.THREADS_ACCESS_TOKEN;

if (!UID || !TOKEN) {
  console.log('THREADS 시크릿이 없어 게시를 건너뜁니다.');
  process.exit(0);
}

const meta = JSON.parse(fs.readFileSync('docs/daily/meta.json', 'utf8'));
const ver = process.env.IMAGE_VER || Date.now();
const imageUrl = 'https://sajucheop.com/daily/story.jpg?v=' + ver;

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
const text = lines.join('\n');

const base = 'https://graph.threads.net/v1.0/' + UID;

async function post(url, params) {
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const r = await fetch(url, { method: 'POST', body });
  return r.json();
}

/* 1) 이미지+글 컨테이너 — 실패하면 텍스트만으로 재시도 */
let j1 = await post(base + '/threads', { media_type: 'IMAGE', image_url: imageUrl, text });
if (!j1.id) {
  console.error('이미지 컨테이너 실패, 텍스트로 재시도:', JSON.stringify(j1));
  j1 = await post(base + '/threads', { media_type: 'TEXT', text });
}
if (!j1.id) {
  console.error('쓰레드 컨테이너 생성 실패:', JSON.stringify(j1));
  process.exit(1);
}
console.log('컨테이너 생성:', j1.id);

await new Promise((r) => setTimeout(r, 8000));

const j2 = await post(base + '/threads_publish', { creation_id: j1.id });
if (!j2.id) {
  console.error('쓰레드 게시 실패:', JSON.stringify(j2));
  process.exit(1);
}
console.log('쓰레드 게시 완료 (카드 이미지 + 글):', j2.id);
