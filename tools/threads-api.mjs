/* 쓰레드 게시 공용 — 한글 계정(THREADS_*)과 영문 계정(THREADS_EN_*)을 같은 코드로.
 * creds(en) → { uid, token } 또는 null(시크릿 없음). publish(creds, { text, imageUrl }) → 게시물 id
 * 메타 쪽 일시 오류(is_transient·5xx·네트워크)는 meta-fetch.mjs 가 기다렸다 다시 시도한다. */
import { metaPost } from './meta-fetch.mjs';

export function creds(en) {
  const uid = process.env[en ? 'THREADS_EN_USER_ID' : 'THREADS_USER_ID'];
  const token = process.env[en ? 'THREADS_EN_ACCESS_TOKEN' : 'THREADS_ACCESS_TOKEN'];
  return uid && token ? { uid, token, label: en ? 'EN' : 'KO' } : null;
}

/* 이미지가 있으면 IMAGE 컨테이너를 먼저 시도하고, 그래도 안 되면 TEXT 로 */
export async function publish({ uid, token, label }, { text, imageUrl }) {
  const base = 'https://graph.threads.net/v1.0/' + uid;
  const tag = '[' + label + ']';
  const call = (path, params, what) => metaPost(base + path, { ...params, access_token: token }, { label: tag + ' ' + what });
  let j1 = null;
  if (imageUrl) {
    j1 = await call('/threads', { media_type: 'IMAGE', image_url: imageUrl, text }, '이미지 컨테이너');
    if (!j1.id) console.warn(tag + ' 이미지 컨테이너 실패, 텍스트로 재시도:', JSON.stringify(j1).slice(0, 200));
  }
  if (!j1 || !j1.id) j1 = await call('/threads', { media_type: 'TEXT', text }, '텍스트 컨테이너');
  if (!j1.id) throw new Error(tag + ' 컨테이너 생성 실패: ' + JSON.stringify(j1).slice(0, 300));
  await new Promise((r) => setTimeout(r, imageUrl ? 8000 : 5000));
  const j2 = await call('/threads_publish', { creation_id: j1.id }, '게시');
  if (!j2.id) throw new Error(tag + ' 게시 실패: ' + JSON.stringify(j2).slice(0, 300));
  console.log(tag + ' 쓰레드 게시 완료:', j2.id);
  return j2.id;
}
