/* 사주첩 알림 서버 — Cloudflare Worker (무료 플랜)
 *  POST /subscribe   { token, ddi } 또는 { token, mode: 'saju' }, 함께 time: 'HH:MM'(기기 시간), tz: 기기의 UTC 오프셋(분, 한국 540)
 *                    주제 세 개에 넣는다 — 종류 하나('ddi-<띠>' 또는 'saju'), 시간 칸 하나('t-HHMM', UTC 15분 단위), 'all'. 종류·시간은 늘 하나만.
 *  POST /unsubscribe { token }        토큰이 든 주제를 모두 뺀다
 *  GET  /status                        마지막 발송 기록·대략의 구독자 수(종류별·시간 칸별)
 *  POST /admin/send-test { token | topic | topics:[..], title?, body?, kind? }  (X-Admin-Key) 시험 알림
 *  POST /admin/send-now  { slot?: 'HHMM'(UTC), force?: true }                   (X-Admin-Key) 그 시간 칸의 알림을 지금 (표식이 있으면 건너뜀, force 면 다시)
 *  cron 15분마다(wrangler.toml) — 지금 칸에 구독자가 있으면 sajucheop.com/today/ddi/push.json(오늘·내일)을 읽어 띠마다 한 통('ddi-x' && 't-HHMM' 조건) + 'saju' && 't-HHMM' 에 한 통(문구는 기기가 만든다).
 * 비밀: FCM_SA_JSON(서비스 계정 JSON 전체 — Cloudflare 대시보드), ADMIN_KEY(wrangler secret). 공개 설정: wrangler.toml [vars]. 상태: KV STATE.
 * 구독자 목록은 구글(FCM 주제)이 갖고 있고 여기엔 남기지 않는다 — 대략의 수만 KV 에 센다. 토큰은 IID 주소에 넣지 않고 본문(batchAdd/batchRemove)으로 보낸다(':' 인코딩 문제). */

const DDI = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];
const NAME = { rat: '쥐띠', ox: '소띠', tiger: '호랑이띠', rabbit: '토끼띠', dragon: '용띠', snake: '뱀띠', horse: '말띠', goat: '양띠', monkey: '원숭이띠', rooster: '닭띠', dog: '개띠', pig: '돼지띠' };
const SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SAJU_TOPIC = 'saju';
const SLOT_MIN = 15;                       /* 시간 칸 크기(분) — wrangler.toml 의 cron 과 맞춘다 */
const DEFAULT_TIME = '08:00', DEFAULT_TZ = 540;

const json = (obj, status = 200, extra = {}) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...extra } });
const kstDate = (d = new Date()) => new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 10);
const pad = (n) => String(n).padStart(2, '0');
const hhmm = (min) => pad(Math.floor(min / 60)) + pad(min % 60);
const slotOf = (d) => hhmm(Math.floor((d.getUTCHours() * 60 + d.getUTCMinutes()) / SLOT_MIN) * SLOT_MIN);
const isSubject = (t) => t === SAJU_TOPIC || t.startsWith('ddi-');
const isSlot = (t) => /^t-\d{4}$/.test(t);
/* 기기 시간 'HH:MM' + 오프셋 → { slot: 'HHMM'(UTC, 15분 단위로 반올림), time: 'HH:MM'(반올림된 기기 시간) } */
function slotFor(time, tz) {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(time || DEFAULT_TIME));
  if (!m) return null;
  const off = Number.isFinite(+tz) && Math.abs(+tz) <= 840 ? Math.round(+tz) : DEFAULT_TZ;
  const local = Math.round((+m[1] * 60 + +m[2]) / SLOT_MIN) * SLOT_MIN % 1440;
  const utc = ((local - off) % 1440 + 1440) % 1440;
  return { slot: hhmm(utc), time: pad(Math.floor(local / 60)) + ':' + pad(local % 60) };
}
const slotKst = (slot) => { const m = (+slot.slice(0, 2) * 60 + +slot.slice(2) + 540) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };

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
  /* 토큰은 주소에 그대로(':' 를 %3A 로 바꾸면 InvalidToken) — validToken 이 글자 종류를 걸러 둔다 */
  const r = await fetch(`https://iid.googleapis.com/iid/info/${token}?details=true`, { headers: await gHeaders(env) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('info ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  return Object.keys((j.rel && j.rel.topics) || {});
}
async function topicOp(env, token, topic, method) {
  /* Admin SDK 와 같은 일괄 주소(batchAdd/batchRemove) — 토큰이 본문에 들어가 인코딩 문제가 없다 */
  const r = await fetch(`https://iid.googleapis.com/iid/v1:${method === 'DELETE' ? 'batchRemove' : 'batchAdd'}`, { method: 'POST', headers: await gHeaders(env), body: JSON.stringify({ to: `/topics/${topic}`, registration_tokens: [token] }) });
  const text = await r.text();
  if (!r.ok) throw new Error(`${method} ${topic} ${r.status} ${text.slice(0, 200)}`);
  const first = ((JSON.parse(text) || {}).results || [])[0] || {};
  if (first.error) throw new Error(`${method} ${topic} ${first.error}`);
}
const countKey = (t) => (isSlot(t) ? `count:slot:${t.slice(2)}` : `count:${t}`);
async function bump(env, topic, delta) {
  if (!isSubject(topic) && !isSlot(topic)) return;
  const k = countKey(topic);
  const n = parseInt((await env.STATE.get(k)) || '0', 10) + delta;
  await env.STATE.put(k, String(Math.max(0, n)));
}

/* ---------- FCM 보내기 — target: { token } | { topic } | { condition } ---------- */
async function send(env, target, n) {
  const body = { message: { ...target, webpush: { headers: { TTL: '43200', Urgency: 'normal' }, notification: { title: n.title, body: n.body, icon: env.SITE + '/icons/icon-192.png', tag: n.tag || 'sajucheop-daily', lang: 'ko' }, fcm_options: { link: n.url } }, data: { url: n.url, date: n.date || '', kind: n.kind || 'ddi' } } };
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${env.FCM_PROJECT_ID}/messages:send`, { method: 'POST', headers: await gHeaders(env), body: JSON.stringify(body) });
  const text = await r.text();
  if (!r.ok) throw new Error('send ' + r.status + ' ' + text.slice(0, 200));
  return JSON.parse(text).name;
}
const withUtm = (u, campaign) => u + (u.includes('?') ? '&' : '?') + `utm_source=push&utm_medium=web_push&utm_campaign=${campaign}`;
/* 내 사주 알림 — 서버는 신호와 안내 문구만 보내고, 문구는 기기의 서비스 워커가 저장된 사주로 만든다(sw.js personalToday) */
const sajuMessage = (env, date) => ({ title: '오늘의 내 사주 운세', body: '눌러서 오늘 점수와 흐름을 확인하세요.', url: withUtm(env.SITE + '/', 'saju_daily') + '#today', date, kind: 'saju', tag: 'saju-daily' });
const cleanTopic = (t) => String(t || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 40);
const condition = (topics) => topics.map((t) => `'${cleanTopic(t)}' in topics`).join(' && ');

/* 한 시간 칸의 발송 — 구독자가 없는 칸은 바로 끝(하루 96번 도는 cron 이 거의 비용 없이 지나가도록) */
async function sendSlot(env, slot, force, when = new Date()) {
  const date = kstDate(when);
  const subscribers = parseInt((await env.STATE.get(`count:slot:${slot}`)) || '0', 10);
  if (!subscribers && !force) return { skipped: 'empty', slot, date };
  const sentKey = `sent:${date}`;
  const sent = (await env.STATE.get(sentKey, 'json')) || {};
  if (sent[slot] && !force) return { skipped: 'already', slot, date };
  let items = null, feedNote = 'ok';
  const r = await fetch(`${env.SITE}/today/ddi/push.json?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
  if (r.ok) {
    const feed = await r.json();
    items = (feed.days && feed.days[date]) || (feed.date === date ? feed.items : null);   /* 오늘·내일이 든 새 꼴, 없으면 옛 꼴 */
    if (!items) feedNote = 'stale ' + (feed.date || '?');
  } else feedNote = 'no-json ' + r.status;
  const results = [];
  if (items) for (const it of items) {
    if (!DDI.includes(it.slug)) continue;
    try {
      const id = await send(env, { condition: condition([`ddi-${it.slug}`, `t-${slot}`]) }, { title: it.title, body: it.body, url: withUtm(it.url, 'ddi_daily'), date, kind: 'ddi', tag: 'ddi-daily' });
      results.push({ to: it.slug, ok: true, id: id.split('/').pop() });
    } catch (e) { results.push({ to: it.slug, ok: false, error: String(e.message).slice(0, 120) }); }
  }
  try {
    const id = await send(env, { condition: condition([SAJU_TOPIC, `t-${slot}`]) }, sajuMessage(env, date));
    results.push({ to: SAJU_TOPIC, ok: true, id: id.split('/').pop() });
  } catch (e) { results.push({ to: SAJU_TOPIC, ok: false, error: String(e.message).slice(0, 120) }); }
  const record = { date, slot, kst: slotKst(slot), at: new Date().toISOString(), force: !!force, subscribers, feed: feedNote, n: results.filter((x) => x.ok).length, results };
  sent[slot] = { at: record.at, n: record.n, feed: feedNote };
  await env.STATE.put(sentKey, JSON.stringify(sent), { expirationTtl: 3 * 86400 });
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
      if (url.pathname === '/health') return json({ ok: true, now: new Date().toISOString(), kst: kstDate(), slot: slotOf(new Date()) }, 200, h);
      if (url.pathname === '/status') {
        const last = await env.STATE.get('last', 'json');
        const counts = { saju: parseInt((await env.STATE.get(`count:${SAJU_TOPIC}`)) || '0', 10) };
        for (const d of DDI) counts[d] = parseInt((await env.STATE.get(`count:ddi-${d}`)) || '0', 10);
        const slots = {};
        for (const k of (await env.STATE.list({ prefix: 'count:slot:' })).keys) {
          const n = parseInt((await env.STATE.get(k.name)) || '0', 10);
          if (n) slots[k.name.slice(11) + ' (KST ' + slotKst(k.name.slice(11)) + ')'] = n;
        }
        return json({ ok: true, last, subscribers_approx: counts, slots_utc: slots }, 200, h);
      }
      if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405, h);
      if (url.pathname.startsWith('/admin/')) {
        if (!env.ADMIN_KEY || req.headers.get('X-Admin-Key') !== env.ADMIN_KEY) return json({ ok: false, error: 'auth' }, 401, h);
        const b = await req.json().catch(() => ({}));
        if (url.pathname === '/admin/send-now' || url.pathname === '/admin/send-daily') {
          const slot = /^\d{4}$/.test(String(b.slot || '')) ? String(b.slot) : slotOf(new Date());
          return json({ ok: true, result: await sendSlot(env, slot, !!b.force) }, 200, h);
        }
        if (url.pathname === '/admin/send-test') {
          const date = kstDate();
          const msg = b.kind === 'saju' ? { ...sajuMessage(env, date), tag: 'test' } : { title: b.title || '사주첩 알림 시험', body: b.body || '이 알림이 보이면 준비가 끝난 거예요.', url: withUtm(b.url || env.SITE + '/today/ddi/', 'push_test'), kind: b.kind || 'test', tag: 'test', date };
          const target = Array.isArray(b.topics) && b.topics.length ? { condition: condition(b.topics.slice(0, 5)) } : b.topic ? { topic: cleanTopic(b.topic) } : { token: b.token };
          if (target.token !== undefined && !validToken(target.token)) return json({ ok: false, error: 'token' }, 400, h);
          return json({ ok: true, target, id: await send(env, target, msg) }, 200, h);
        }
        return json({ ok: false, error: 'not-found' }, 404, h);
      }
      if (!Object.keys(h).length) return json({ ok: false, error: 'origin' }, 403, h);
      const b = await req.json().catch(() => ({}));
      if (!validToken(b.token)) return json({ ok: false, error: 'token' }, 400, h);
      if (url.pathname === '/subscribe') {
        const want = b.mode === 'saju' ? SAJU_TOPIC : (DDI.includes(b.ddi) ? `ddi-${b.ddi}` : null);
        if (!want) return json({ ok: false, error: 'ddi' }, 400, h);
        const s = slotFor(b.time, b.tz);
        if (!s) return json({ ok: false, error: 'time' }, 400, h);
        const slotTopic = `t-${s.slot}`;
        const have = (await topicInfo(env, b.token)) || [];
        for (const t of have) {
          if ((isSubject(t) && t !== want) || (isSlot(t) && t !== slotTopic)) { await topicOp(env, b.token, t, 'DELETE'); await bump(env, t, -1); }
        }
        for (const t of [want, slotTopic]) if (!have.includes(t)) { await topicOp(env, b.token, t, 'POST'); await bump(env, t, 1); }
        if (!have.includes('all')) await topicOp(env, b.token, 'all', 'POST');
        return json({ ok: true, mode: want === SAJU_TOPIC ? 'saju' : 'ddi', ddi: b.ddi || null, name: want === SAJU_TOPIC ? '내 사주' : NAME[b.ddi], time: s.time, slot: s.slot }, 200, h);
      }
      if (url.pathname === '/unsubscribe') {
        const have = (await topicInfo(env, b.token)) || [];
        for (const t of have) { await topicOp(env, b.token, t, 'DELETE'); await bump(env, t, -1); }
        return json({ ok: true, removed: have }, 200, h);
      }
      return json({ ok: false, error: 'not-found' }, 404, h);
    } catch (e) {
      return json({ ok: false, error: String(e.message).slice(0, 200) }, 500, h);
    }
  },
  async scheduled(event, env, ctx) {
    const when = new Date(event.scheduledTime || Date.now());
    ctx.waitUntil(sendSlot(env, slotOf(when), false, when).then((r) => console.log('slot', JSON.stringify(r))));
  },
};
