/* meta-fetch.mjs 검증 — 가짜 fetch 로 일시 오류 재시도를 확인한다(네트워크·실제 게시 없음). node tools/test-meta-fetch.mjs */
process.env.META_RETRY_WAITS = '0,0,0';
const MF = await import('./meta-fetch.mjs');

let pass = 0, fail = 0;
const ok = (cond, name, detail = '') => { if (cond) pass++; else { fail++; console.log('FAIL', name, detail); } };
const res = (status, body) => ({ status, ok: status < 400, text: async () => (typeof body === 'string' ? body : JSON.stringify(body)) });
async function run(seq) {
  let n = 0;
  const waits = [];
  const out = await MF.metaPost('https://graph.test/v1.0/1/threads', { text: 'x' }, {
    waits: [20, 60, 120], sleep: async (s) => { waits.push(s); },
    fetch: async () => { const s = seq[Math.min(n++, seq.length - 1)]; if (s === 'net') throw new Error('fetch failed'); return s; }
  });
  return { out, n, waits };
}
const T = res(500, { error: { message: 'An unexpected error has occurred. Please retry your request later.', type: 'OAuthException', is_transient: true, code: 2 } });
const OK = res(200, { id: '123' });

{ const r = await run([T, T, OK]); ok(r.out.id === '123' && r.n === 3 && r.waits.join() === '20,60', '일시 오류 2번 → 20초·60초 기다려 3번째에 성공', JSON.stringify(r)); }
{ const r = await run([res(400, { error: { message: 'Session has expired', code: 190 } }), OK]); ok(r.out.error && r.out.error.code === 190 && r.n === 1 && !r.waits.length, '토큰 만료(190)는 기다리지 않고 바로 실패'); }
{ const r = await run([res(400, { error: { message: 'Invalid parameter', code: 100 } }), OK]); ok(r.out.error && r.n === 1, '잘못된 값(100)도 바로 실패'); }
{ const r = await run(['net', OK]); ok(r.out.id === '123' && r.n === 2, '네트워크 끊김은 다시 시도'); }
{ const r = await run([T]); ok(r.out.error && r.n === 4 && r.waits.join() === '20,60,120', '끝까지 일시 오류면 4번 시도 뒤 마지막 오류를 돌려줌', JSON.stringify(r.waits)); }
{ const r = await run([res(502, '<html>Bad Gateway</html>'), OK]); ok(r.out.id === '123' && r.n === 2, 'JSON 아닌 502 응답도 다시 시도'); }
{ const r = await run([res(429, { error: { message: 'Too many calls', code: 4 } }), OK]); ok(r.out.id === '123' && r.n === 2, '호출 한도(429·4)는 기다렸다 다시'); }
{ const r = await run([res(400, { error: { message: 'Media ID is not available', code: 9007, error_subcode: 2207027 } }), OK]); ok(r.out.id === '123' && r.n === 2, '미디어 처리 중(9007)은 기다렸다 게시'); }
{ let msg = ''; try { await run(['net']); } catch (e) { msg = e.message; } ok(msg === 'fetch failed', '네트워크가 끝까지 안 되면 예외'); }
{ const r = await run([res(500, { error: { message: 'Param text must be at most 500 characters long.', type: 'THApiException', code: 100 } }), OK]); ok(r.out.error && r.n === 1 && !r.waits.length, 'HTTP 500이어도 잘못된 값(100)은 다시 시도하지 않음 — 쓰레드 500자 초과', JSON.stringify(r)); }

/* 쓰레드 500자 맞추기 */
{ const { fitText, THREADS_MAX } = await import('./threads-api.mjs');
  const long = ['첫 줄 → https://sajucheop.com/', '둘째 줄', '', 'x'.repeat(480)].join('\n');
  const f = fitText(long);
  ok(f.length <= THREADS_MAX && f.startsWith('첫 줄') && f.includes('https://sajucheop.com/') && !f.includes('xxx'), '500자 넘으면 뒤 줄부터 빼서 맞춤', f.length);
  ok(fitText('짧은 글') === '짧은 글' && fitText('가'.repeat(600)).length === THREADS_MAX, '짧으면 그대로 · 한 줄이 길면 말줄임'); }

/* 웹훅 */
{ let n = 0; const waits = []; const r = await MF.hookPost('https://hook.test/x', { a: 1 }, { waits: [20, 60, 120], sleep: async (s) => { waits.push(s); }, fetch: async () => (n++ === 0 ? res(503, 'busy') : res(200, 'Accepted')) });
  ok(r.ok && r.status === 200 && n === 2 && waits.join() === '20', '웹훅 503 → 20초 뒤 다시 보내 성공', JSON.stringify(r)); }
{ let n = 0; const r = await MF.hookPost('https://hook.test/x', {}, { sleep: async () => {}, fetch: async () => { n++; return res(400, 'bad'); } });
  ok(!r.ok && n === 1, '웹훅 400은 다시 보내지 않음'); }

/* 쓰레드 게시 흐름 — 텍스트 컨테이너가 일시 오류 한 번 → 다시 만들고 그 id로 게시 */
{
  const calls = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const p = Object.fromEntries(init.body);
    calls.push(new URL(url).pathname + ' ' + (p.media_type || p.creation_id || '') + (p.access_token ? ' +token' : ''));
    if (calls.length === 1) return res(500, { error: { message: 'unexpected', is_transient: true, code: 2 } });
    return res(200, { id: 'c' + calls.length });
  };
  const { publish } = await import('./threads-api.mjs');
  const id = await publish({ uid: '42', token: 't', label: 'KO' }, { text: '테스트' });
  globalThis.fetch = real;
  ok(id === 'c3' && calls.join(' | ') === '/v1.0/42/threads TEXT +token | /v1.0/42/threads TEXT +token | /v1.0/42/threads_publish c2 +token', '쓰레드: 일시 오류 뒤 컨테이너를 다시 만들고 그 id로 게시', calls.join(' | '));
}

console.log(`meta-fetch: ${pass} pass, ${fail} fail`);
if (fail) process.exit(1);
