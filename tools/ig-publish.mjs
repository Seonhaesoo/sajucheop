/* 인스타그램 스토리 자동 게시 (Meta Graph API · 비즈니스 계정 전용)
 * 필요 환경변수: IG_USER_ID, IG_ACCESS_TOKEN, IMAGE_URL
 * 메타 쪽 일시 오류는 meta-fetch.mjs 가 기다렸다 다시 시도한다. */
import { metaPost } from './meta-fetch.mjs';

const IG_USER_ID = process.env.IG_USER_ID;
const TOKEN = process.env.IG_ACCESS_TOKEN;
const IMAGE_URL = process.env.IMAGE_URL;

if (!IG_USER_ID || !TOKEN) {
  console.log('IG_USER_ID / IG_ACCESS_TOKEN 시크릿이 없어 게시를 건너뜁니다. (카드 생성은 완료됨)');
  process.exit(0);
}

/* 토큰 유형 자동 감지:
 * - "IG"로 시작하는 토큰 = Instagram 로그인 방식(페이스북 페이지 불필요) → graph.instagram.com
 * - 그 외(페이스북 페이지 토큰 등) → graph.facebook.com */
const HOST = TOKEN.startsWith('IG') ? 'graph.instagram.com' : 'graph.facebook.com';
console.log('API 호스트:', HOST);
const base = 'https://' + HOST + '/v21.0/' + IG_USER_ID;

const j1 = await metaPost(base + '/media', { media_type: 'STORIES', image_url: IMAGE_URL, access_token: TOKEN }, { label: '스토리 컨테이너' });
if (!j1.id) {
  console.error('미디어 컨테이너 생성 실패:', JSON.stringify(j1));
  process.exit(1);
}
console.log('컨테이너 생성:', j1.id);

await new Promise((r) => setTimeout(r, 8000));

const j2 = await metaPost(base + '/media_publish', { creation_id: j1.id, access_token: TOKEN }, { label: '스토리 게시' });
if (!j2.id) {
  console.error('스토리 게시 실패:', JSON.stringify(j2));
  process.exit(1);
}
console.log('스토리 게시 완료:', j2.id);
