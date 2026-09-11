/* 인스타그램 피드 캐러셀 자동 게시 (Graph API)
 * 필요 환경변수: IG_USER_ID, IG_ACCESS_TOKEN, (선택) IMAGE_VER
 * 메타 쪽 일시 오류는 meta-fetch.mjs 가 기다렸다 다시 시도한다(자식·캐러셀 컨테이너·발행 각각). */
import fs from 'node:fs';
import { metaPost } from './meta-fetch.mjs';

const IG_USER_ID = process.env.IG_USER_ID;
const TOKEN = process.env.IG_ACCESS_TOKEN;

if (!IG_USER_ID || !TOKEN) {
  console.log('IG 시크릿이 없어 캐러셀 게시를 건너뜁니다. (카드 생성은 완료됨)');
  process.exit(0);
}

const HOST = TOKEN.startsWith('IG') ? 'graph.instagram.com' : 'graph.facebook.com';
const base = `https://${HOST}/v21.0/${IG_USER_ID}`;
const ver = process.env.IMAGE_VER || Date.now();

const meta = JSON.parse(fs.readFileSync('docs/social/meta.json', 'utf8'));
const caption = fs.readFileSync('docs/social/caption.txt', 'utf8').trim();

const post = (url, params, what) => metaPost(url, { ...params, access_token: TOKEN }, { label: what });

/* 1) 자식 컨테이너 */
const children = [];
for (let i = 1; i <= meta.cards; i++) {
  const j = await post(`${base}/media`, {
    is_carousel_item: 'true',
    image_url: `https://sajucheop.com/social/carousel/card-${i}.jpg?v=${ver}`
  }, `카드 ${i} 컨테이너`);
  if (!j.id) {
    console.error(`카드 ${i} 컨테이너 실패:`, JSON.stringify(j));
    process.exit(1);
  }
  children.push(j.id);
  await new Promise((r) => setTimeout(r, 1200));
}
console.log('자식 컨테이너', children.length, '개 생성');

/* 2) 캐러셀 컨테이너 */
const car = await post(`${base}/media`, {
  media_type: 'CAROUSEL',
  children: children.join(','),
  caption
}, '캐러셀 컨테이너');
if (!car.id) {
  console.error('캐러셀 컨테이너 실패:', JSON.stringify(car));
  process.exit(1);
}
console.log('캐러셀 컨테이너:', car.id);

await new Promise((r) => setTimeout(r, 10000));

/* 3) 발행 — 아직 처리 중(9007)이면 meta-fetch 가 기다렸다 다시 */
const pub = await post(`${base}/media_publish`, { creation_id: car.id }, '캐러셀 게시');
if (!pub.id) {
  console.error('캐러셀 게시 실패:', JSON.stringify(pub));
  process.exit(1);
}
console.log('캐러셀 게시 완료:', pub.id, '—', meta.slug);
