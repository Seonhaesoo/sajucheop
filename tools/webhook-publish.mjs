/* 웹훅 발행 — Make/Zapier 등 서드파티 자동화로 콘텐츠를 넘긴다.
 * 메타 개발자 API 키 없이도 게시 자동화가 가능하도록 하는 B플랜 경로.
 * 사용: node tools/webhook-publish.mjs daily|weekly
 * 환경변수:
 *   MAKE_WEBHOOK_URL          웹훅 주소 (없으면 건너뜀)
 *   IMAGE_VER                 이미지 캐시버스터 (기본: 현재 시각)
 *   IG_ACCESS_TOKEN 등        직접 API 키가 있으면 해당 채널은 웹훅에서 제외 (중복 게시 방지) */
import fs from 'node:fs';

const HOOK = process.env.MAKE_WEBHOOK_URL;
const kind = process.argv[2];

if (!HOOK) {
  console.log('MAKE_WEBHOOK_URL 없음 — 웹훅 발행을 건너뜁니다.');
  process.exit(0);
}
if (kind !== 'daily' && kind !== 'weekly') {
  console.error('사용법: node tools/webhook-publish.mjs daily|weekly');
  process.exit(1);
}

const ver = process.env.IMAGE_VER || Date.now();
const postInstagram = !process.env.IG_ACCESS_TOKEN;
const postThreads = !process.env.THREADS_ACCESS_TOKEN;
if (!postInstagram && !postThreads) {
  console.log('직접 API 키가 모두 등록돼 있어 웹훅 발행을 건너뜁니다.');
  process.exit(0);
}

let payload;

if (kind === 'daily') {
  const meta = JSON.parse(fs.readFileSync('docs/daily/meta.json', 'utf8'));
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
  payload = {
    kind: 'daily',
    date: meta.date,
    ganji: meta.ganjiKor,
    post_instagram: postInstagram,
    post_threads: postThreads,
    image_url: 'https://sajucheop.com/daily/story.jpg?v=' + ver,
    thread_text: lines.join('\n')
  };
} else {
  let meta = {};
  try { meta = JSON.parse(fs.readFileSync('docs/social/meta.json', 'utf8')); } catch { /* 무시 */ }
  const caption = fs.readFileSync('docs/social/caption.txt', 'utf8').trim();
  const thread = fs.readFileSync('docs/social/thread.txt', 'utf8').trim();
  const files = fs.readdirSync('docs/social/carousel')
    .filter((f) => /^card-\d+\.jpg$/.test(f))
    .sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]));
  payload = {
    kind: 'weekly',
    date: meta.date || null,
    slug: meta.slug || null,
    title: meta.title || null,
    type: meta.type || null,
    post_instagram: postInstagram,
    post_threads: postThreads,
    images: files.map((f) => 'https://sajucheop.com/social/carousel/' + f + '?v=' + ver),
    image_url: 'https://sajucheop.com/social/carousel/card-1.jpg?v=' + ver,
    caption: caption,
    thread_text: thread
  };
}

const r = await fetch(HOOK, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
console.log('웹훅 전송 완료:', kind, '→ HTTP', r.status,
  kind === 'weekly' ? '(카드 ' + payload.images.length + '장)' : '(' + payload.ganji + '일)');
if (!r.ok) {
  console.error('웹훅 응답 오류 — Make 시나리오가 켜져 있는지 확인하세요.');
  process.exit(1);
}
