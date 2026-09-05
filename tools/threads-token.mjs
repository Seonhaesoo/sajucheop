/* 쓰레드 API 토큰 준비 — 짧은 토큰을 60일 장기 토큰으로 바꾸고 사용자 ID를 찾아 GitHub 시크릿에 넣는다.
 *
 * 사용 (PowerShell, 값은 채팅에 붙여넣지 말고 여기서만):
 *   $env:THREADS_APP_SECRET = '앱 시크릿'
 *   $env:THREADS_SHORT_TOKEN = '사용자 토큰 생성기에서 받은 토큰'
 *   node tools/threads-token.mjs --set
 *
 * --set 이 없으면 시크릿 등록 없이 결과만 화면에 보여준다.
 * 이미 장기 토큰이 있으면 THREADS_SHORT_TOKEN 자리에 넣어도 된다(교환은 실패하고 그대로 씀). */
import { execSync } from 'node:child_process';

const SECRET = process.env.THREADS_APP_SECRET;
const SHORT = process.env.THREADS_SHORT_TOKEN;
const doSet = process.argv.includes('--set');

if (!SHORT) {
  console.error('THREADS_SHORT_TOKEN 이 없습니다. 위 사용법대로 환경변수를 먼저 넣어 주세요.');
  process.exit(1);
}

async function getJson(url) {
  const r = await fetch(url);
  const j = await r.json();
  return j;
}

/* 1) 장기 토큰 교환 */
let token = SHORT;
let expires = null;
if (SECRET) {
  const j = await getJson('https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=' +
    encodeURIComponent(SECRET) + '&access_token=' + encodeURIComponent(SHORT));
  if (j.access_token) {
    token = j.access_token;
    expires = j.expires_in ? Math.round(j.expires_in / 86400) + '일' : '60일';
    console.log('장기 토큰 교환 완료 — 유효기간 약', expires);
  } else {
    console.warn('장기 토큰 교환 실패(이미 장기 토큰이거나 시크릿 불일치) — 받은 토큰을 그대로 씁니다:', JSON.stringify(j.error || j).slice(0, 200));
  }
} else {
  console.warn('THREADS_APP_SECRET 이 없어 교환을 건너뜁니다 (짧은 토큰은 1시간 뒤 만료).');
}

/* 2) 사용자 ID */
const me = await getJson('https://graph.threads.net/v1.0/me?fields=id,username&access_token=' + encodeURIComponent(token));
if (!me.id) {
  console.error('사용자 조회 실패 — 테스터 초대 수락과 권한(threads_basic)을 확인하세요:', JSON.stringify(me).slice(0, 300));
  process.exit(1);
}
console.log('쓰레드 계정: @' + me.username + ' (ID ' + me.id + ')');

/* 3) GitHub 시크릿 등록 */
if (doSet) {
  execSync('gh secret set THREADS_USER_ID --body "' + me.id + '"', { stdio: 'inherit' });
  execSync('gh secret set THREADS_ACCESS_TOKEN', { input: token, stdio: ['pipe', 'inherit', 'inherit'] });
  console.log('GitHub 시크릿 등록 완료: THREADS_USER_ID, THREADS_ACCESS_TOKEN — 다음 봇 실행부터 쓰레드에 게시됩니다.');
  console.log('토큰은 60일마다 만료됩니다. 자동 갱신은 .github/workflows/threads-token-refresh.yml 참고 (GH_PAT 시크릿 필요).');
} else {
  console.log('\n--set 을 붙여 다시 실행하면 GitHub 시크릿에 등록됩니다.');
  console.log('토큰 앞 12자:', token.slice(0, 12) + '…');
}
