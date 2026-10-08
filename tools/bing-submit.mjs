/* 빙 URL 제출 — 매일 사이트마다 최대 100개(빙 하루 한도)를 빙 웹마스터 API(SubmitUrlbatch)로 보낸다.
 * ChatGPT 검색이 빙 색인을 쓰므로 AI 유입과 바로 이어진다. IndexNow(알림)보다 '제출'이 크롤을 더 빨리 부른다.
 * 키: 빙 웹마스터 → 설정 → API 액세스 → API 키. GitHub 저장소 Secrets 의 BING_API_KEY 에 사용자가 직접 넣는다(채팅으로 받지 않는다). 키가 없으면 아무것도 하지 않고 끝난다.
 * 고르는 순서: ① 최근 사흘 안에 바뀐 주소(lastmod) ② 영문 페이지(사주첩, AI 검색은 영어가 많다) ③ 나머지를 날짜마다 돌아가며(전체를 며칠에 걸쳐 한 바퀴).
 * 사이트맵: sitemap-all.xml(구글용과 따로 둔 전체 목록)이 있으면 그것, 없으면 robots.txt 의 사이트맵. 사주첩은 구글에만 뺀 주소(tools/google-noindex.json)도 넣는다.
 * 사용: node tools/bing-submit.mjs [--dry]   (--dry: 고른 주소만 보여 주고 보내지 않음) */
import fs from 'node:fs';

const KEY = process.env.BING_API_KEY || '';
const DRY = process.argv.includes('--dry');
const API = 'https://ssl.bing.com/webmaster/api.svc/json';
const SITES = ['https://sajucheop.com/', 'https://dream.sajucheop.com/', 'http://saengil.sajucheop.com/', 'https://donpyo.com/', 'https://bodyzip.com/'];
const PER_DAY = 100;

const get = async (u) => { try { const r = await fetch(u, { headers: { 'user-agent': 'sajucheop-bing-submit' } }); return r.ok ? await r.text() : ''; } catch (e) { return ''; } };
async function readSitemap(url, out, depth = 0) {
  const xml = await get(url);
  if (!xml || depth > 2) return;
  if (/<sitemapindex[\s>]/.test(xml)) {
    for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) await readSitemap(m[1].replace(/&amp;/g, '&'), out, depth + 1);
    return;
  }
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = (m[1].match(/<loc>\s*([^<\s]+)\s*<\/loc>/) || [])[1];
    const mod = ((m[1].match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/) || [])[1] || '').slice(0, 10);
    if (loc) out.set(loc.replace(/&amp;/g, '&'), mod);
  }
}
async function urlsOf(site) {
  const out = new Map();
  const all = site + 'sitemap-all.xml';
  if (await get(all)) await readSitemap(all, out);
  else {
    const robots = await get(site + 'robots.txt');
    for (const m of robots.matchAll(/^\s*Sitemap:\s*(\S+)/gim)) if (!m[1].endsWith('/sitemap-index.xml')) await readSitemap(m[1], out);
  }
  if (site === 'https://sajucheop.com/' && fs.existsSync(new URL('./google-noindex.json', import.meta.url))) {
    const j = JSON.parse(fs.readFileSync(new URL('./google-noindex.json', import.meta.url), 'utf8'));
    for (const [p, xs] of Object.entries(j.groups)) for (const x of xs) if (!out.has('https://sajucheop.com' + p + x + '/')) out.set('https://sajucheop.com' + p + x + '/', '');
  }
  return out;
}
function pick(site, map, n) {
  const today = new Date(Date.now() + 9 * 3600e3);
  const recent = new Date(today - 3 * 86400e3).toISOString().slice(0, 10);
  const all = [...map.keys()].sort();
  const fresh = all.filter((u) => (map.get(u) || '') >= recent);
  const en = site === 'https://sajucheop.com/' ? all.filter((u) => u.includes('sajucheop.com/en/')) : [];
  const chosen = [];
  const add = (u) => { if (chosen.length < n && !chosen.includes(u)) chosen.push(u); };
  fresh.forEach(add);
  /* 영문은 하루 몫의 절반까지만, 날마다 돌아가며 */
  const day = Math.floor(today / 86400e3);
  for (let i = 0; i < en.length && chosen.length < n / 2; i++) add(en[(day * 50 + i) % en.length]);
  for (let i = 0; i < all.length && chosen.length < n; i++) add(all[(day * n + i) % all.length]);
  return chosen;
}
async function call(method, body, q = '') {
  const r = await fetch(`${API}/${method}?apikey=${encodeURIComponent(KEY)}${q}`, body ? { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) } : {});
  const text = await r.text();
  return { ok: r.ok, status: r.status, text: text.slice(0, 300) };
}

if (!KEY && !DRY) { console.log('BING_API_KEY 가 없어 건너뜀 (빙 웹마스터 → 설정 → API 액세스에서 만든 키를 GitHub Secrets 에 넣으면 매일 돌아요)'); process.exit(0); }
for (const site of SITES) {
  const map = await urlsOf(site);
  let n = PER_DAY;
  if (!DRY) {
    const q = await call('GetUrlSubmissionQuota', null, `&siteUrl=${encodeURIComponent(site)}`);
    const m = q.ok && /"DailyQuota"\s*:\s*(\d+)/.exec(q.text);
    if (m) n = Math.min(PER_DAY, +m[1]);
    if (!q.ok) { console.log(`${site} 한도 확인 실패 ${q.status} ${q.text}`); continue; }
  }
  const list = pick(site, map, n);
  if (!list.length) { console.log(`${site} 오늘 보낼 몫 없음 (주소 ${map.size}개)`); continue; }
  if (DRY) { console.log(`${site} 주소 ${map.size}개 → 오늘 ${list.length}개 (예: ${list.slice(0, 3).join(' ')})`); continue; }
  const r = await call('SubmitUrlbatch', { siteUrl: site, urlList: list });
  console.log(`${site} 주소 ${map.size}개 → ${list.length}개 제출: ${r.ok ? '성공' : '실패 ' + r.status + ' ' + r.text}`);
}
