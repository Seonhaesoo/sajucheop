/* 사주첩 알림 서버 — Cloudflare Worker (무료 플랜)
 *  POST /subscribe   { token, ddi }   FCM 토큰을 'ddi-<띠>' 와 'all' 주제에 넣고, 다른 띠 주제는 뺀다
 *  POST /unsubscribe { token }        토큰이 든 주제를 모두 뺀다
 *  GET  /status                        마지막 발송 기록
 *  POST /admin/send-test { token }    (X-Admin-Key) 토큰 하나에 시험 알림
 *  cron 0 23 * * * (08:00 KST) — sajucheop.com/today/ddi/push.json 을 읽어 띠마다 한 통씩 FCM 주제로 보낸다. 0 0 * * * (09:00 KST) 는 아직 못 보냈을 때만 다시.
 * 비밀: FCM_SA_JSON(서비스 계정 JSON 전체 — Cloudflare 대시보드에서 넣음), ADMIN_KEY. 공개 설정: wrangler.toml [vars]. 상태: KV STATE.
 * 구독자 목록은 구글(FCM 주제)이 갖고 있고 여기엔 남기지 않는다 — 대략의 수만 KV 에 센다. */

const DDI = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];
const NAME = { rat: '쥐띠', ox: '소띠', tiger: '호랑이띠', rabbit: '토끼띠', dragon: '용띠', snake: '뱀띠', horse: '말띠', goat: '양띠', monkey: '원숭이띠', rooster: '닭띠', dog: '개띠', pig: '돼지띠' };
const SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

const json = (obj, status = 200, extra = {}) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...extra } });
const kstDate = (d = new Date()) => new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 10);

/* ---------- 구글 OAuth (서비스 계정 JWT → 액세스 토큰, KV 에 50분 저장) ---------- */
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const enc = (s) => new TextEncoder().encode(s);
async function accessToken(env) {
  const cached = await env.STATE.get('oauth', 'json');
  if (cached && cached.exp > Date.now() / 1000 + 120) return cached.token;
  const sa = JSON.parse(env.FCM_SA_JSON);
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(enc(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claims = b64url(enc(JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: sa.token_uri || 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })));
  const pem = sa.private_key.replace(/-----[A-Z ]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = b64url(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc(`${header}.${claims}`)));
  const r = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${header}.${claims}.${sig}` });
  if (!r.ok) throw new Error('oauth ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  await env.STATE.put('oauth', JSON.stringify({ token: j.access_token, exp: now + (j.expires_in || 3600) }), { expirationTtl: 3300 });
  return j.access_token;
}
const gHeaders = async (env) => ({ Authorization: `Bearer ${await accessToken(env)}`, access_token_auth: 'true', 'Content-Type': 'application/json' });

/* ---------- FCM 주제 ---------- */
async function topicInfo(env, token) {
  const r = await fetch(`https://iid.googleapis.com/iid/info/${encodeURIComponent(token)}?details=true`, { headers: await gHeaders(env) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('info ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  return Object.keys((j.rel && j.rel.topics) || {});
}
async function topicOp(env, token, topic, method) {
  const r = await fetch(`https://iid.googleapis.com/iid/v1/${encodeURIComponent(token)}/rel/topics/${topic}`, { method, headers: await gHeaders(env) });
  if (!r.ok) throw new Error(`${method} ${topic} ${r.status} ${(await r.text()).slice(0, 200)}`);
}
async function bump(env, key, delta) {
  const n = parseInt((await env.STATE.get(key)) || '0', 10) + delta;
  await env.STATE.put(key, String(Math.max(0, n)));
}

/* ---------- FCM 보내기 ---------- */
async function send(env, target, n) {
  const body = { message: { ...target, webpush: { headers: { TTL: '43200', Urgency: 'normal' }, notification: { title: n.title, body: n.body, icon: env.SITE + '/icons/icon-192.png', tag: n.tag || 'sajucheop-daily', lang: 'ko' }, fcm_options: { link: n.url } }, data: { url: n.url, date: n.date || '', kind: n.kind || 'ddi' } } };
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${env.FCM_PROJECT_ID}/messages:send`, { method: 'POST', headers: await gHeaders(env), body: JSON.stringify(body) });
  const text = await r.text();
  if (!r.ok) throw new Error('send ' + r.status + ' ' + text.slice(0, 200));
  return JSON.parse(text).name;
}
const withUtm = (u, campaign) => u + (u.includes('?') ? '&' : '?') + `utm_source=push&utm_medium=web_push&utm_campaign=${campaign}`;

async function sendDaily(env, retry) {
  const date = kstDate();
  const done = await env.STATE.get(`sent:${date}`);
  if (done) return { skipped: 'already', date };
  const r = await fetch(`${env.SITE}/today/ddi/push.json?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
  if (!r.ok) return { skipped: 'no-json ' + r.status, date };
  const feed = await r.json();
  if (feed.date !== date) {
    if (!retry) return { skipped: 'stale ' + feed.date, date };            /* 일진 봇이 늦으면 9시에 다시 본다 */
    return { skipped: 'stale-at-retry ' + feed.date, date };
  }
  const results = [];
  for (const it of feed.items) {
    if (!DDI.includes(it.slug)) continue;
    try {
      const id = await send(env, { topic: `ddi-${it.slug}` }, { title: it.title, body: it.body, url: withUtm(it.url, 'ddi_daily'), date, kind: 'ddi', tag: 'ddi-daily' });
      results.push({ ddi: it.slug, ok: true, id: id.split('/').pop() });
    } catch (e) { results.push({ ddi: it.slug, ok: false, error: String(e.message).slice(0, 120) }); }
  }
  const record = { date, at: new Date().toISOString(), retry: !!retry, n: results.filter((x) => x.ok).length, results };
  if (record.n) await env.STATE.put(`sent:${date}`, JSON.stringify(record), { expirationTtl: 14 * 86400 });
  await env.STATE.put('last', JSON.stringify(record));
  return record;
}

/* ---------- HTTP ---------- */
const origins = (env) => (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
function cors(env, req) {
  const o = req.headers.get('Origin') || '';
  const ok = origins(env).includes(o) || /^http:\/\/localhost(:\d+)?$/.test(o);
  return ok ? { 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' } : {};
}
const validToken = (t) => typeof t === 'string' && t.length >= 50 && t.length <= 512 && /^[A-Za-z0-9_:\-]+$/.test(t);

export default {
  async fetch(req, env) {
    const url = new URL(req.url), h = cors(env, req);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    try {
      if (url.pathname === '/health') return json({ ok: true, now: new Date().toISOString(), kst: kstDate() }, 200, h);
      if (url.pathname === '/status') {
        const last = await env.STATE.get('last', 'json');
        const counts = {}; for (const d of DDI) counts[d] = parseInt((await env.STATE.get(`count:ddi-${d}`)) || '0', 10);
        return json({ ok: true, last, subscribers_approx: counts }, 200, h);
      }
      if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405, h);
      if (url.pathname === '/admin/send-test' || url.pathname === '/admin/send-daily') {
        if (!env.ADMIN_KEY || req.headers.get('X-Admin-Key') !== env.ADMIN_KEY) return json({ ok: false, error: 'auth' }, 401, h);
        if (url.pathname === '/admin/send-daily') return json({ ok: true, result: await sendDaily(env, true) }, 200, h);
        const b = await req.json();
        if (!validToken(b.token)) return json({ ok: false, error: 'token' }, 400, h);
        const id = await send(env, { token: b.token }, { title: b.title || '사주첩 알림 시험', body: b.body || '이 알림이 보이면 준비가 끝난 거예요.', url: withUtm(b.url || env.SITE + '/today/ddi/', 'push_test'), kind: 'test', tag: 'test' });
        return json({ ok: true, id }, 200, h);
      }
      if (!Object.keys(h).length) return json({ ok: false, error: 'origin' }, 403, h);
      const b = await req.json().catch(() => ({}));
      if (!validToken(b.token)) return json({ ok: false, error: 'token' }, 400, h);
      if (url.pathname === '/subscribe') {
        if (!DDI.includes(b.ddi)) return json({ ok: false, error: 'ddi' }, 400, h);
        const have = (await topicInfo(env, b.token)) || [];
        for (const t of have) if (t.startsWith('ddi-') && t !== `ddi-${b.ddi}`) { await topicOp(env, b.token, t, 'DELETE'); await bump(env, `count:${t}`, -1); }
        if (!have.includes(`ddi-${b.ddi}`)) { await topicOp(env, b.token, `ddi-${b.ddi}`, 'POST'); await bump(env, `count:ddi-${b.ddi}`, 1); }
        if (!have.includes('all')) await topicOp(env, b.token, 'all', 'POST');
        return json({ ok: true, ddi: b.ddi, name: NAME[b.ddi] }, 200, h);
      }
      if (url.pathname === '/unsubscribe') {
        const have = (await topicInfo(env, b.token)) || [];
        for (const t of have) { await topicOp(env, b.token, t, 'DELETE'); if (t.startsWith('ddi-')) await bump(env, `count:${t}`, -1); }
        return json({ ok: true, removed: have }, 200, h);
      }
      return json({ ok: false, error: 'not-found' }, 404, h);
    } catch (e) {
      return json({ ok: false, error: String(e.message).slice(0, 200) }, 500, h);
    }
  },
  async scheduled(event, env, ctx) {
    const retry = event.cron !== '0 23 * * *';
    ctx.waitUntil(sendDaily(env, retry).then((r) => console.log('daily', JSON.stringify(r))));
  },
};
