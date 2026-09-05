/* 쓰레드 게시 공용 — 한글 계정(THREADS_*)과 영문 계정(THREADS_EN_*)을 같은 코드로.
 * creds(en) → { uid, token } 또는 null(시크릿 없음). publish(creds, { text, imageUrl }) → 게시물 id */

export function creds(en) {
  const uid = process.env[en ? 'THREADS_EN_USER_ID' : 'THREADS_USER_ID'];
  const token = process.env[en ? 'THREADS_EN_ACCESS_TOKEN' : 'THREADS_ACCESS_TOKEN'];
  return uid && token ? { uid, token, label: en ? 'EN' : 'KO' } : null;
}

async function call(url, params, token) {
  const r = await fetch(url, { method: 'POST', body: new URLSearchParams({ ...params, access_token: token }) });
  return r.json();
}

/* 이미지가 있으면 IMAGE 컨테이너를 먼저 시도하고 실패하면 TEXT 로 재시도 */
export async function publish({ uid, token, label }, { text, imageUrl }) {
  const base = 'https://graph.threads.net/v1.0/' + uid;
  let j1 = null;
  if (imageUrl) {
    j1 = await call(base + '/threads', { media_type: 'IMAGE', image_url: imageUrl, text }, token);
    if (!j1.id) console.warn('[' + label + '] 이미지 컨테이너 실패, 텍스트로 재시도:', JSON.stringify(j1).slice(0, 200));
  }
  if (!j1 || !j1.id) j1 = await call(base + '/threads', { media_type: 'TEXT', text }, token);
  if (!j1.id) throw new Error('[' + label + '] 컨테이너 생성 실패: ' + JSON.stringify(j1).slice(0, 300));
  await new Promise((r) => setTimeout(r, imageUrl ? 8000 : 5000));
  const j2 = await call(base + '/threads_publish', { creation_id: j1.id }, token);
  if (!j2.id) throw new Error('[' + label + '] 게시 실패: ' + JSON.stringify(j2).slice(0, 300));
  console.log('[' + label + '] 쓰레드 게시 완료:', j2.id);
  return j2.id;
}
