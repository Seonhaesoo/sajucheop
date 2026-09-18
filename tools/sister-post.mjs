/* 첩 시리즈 쓰레드 글 — 타로첩·꿈첩·생일첩 글을 이틀에 한 편씩 번갈아 (sister-post.yml 은 매일 저녁 돌고, 쉬는 날엔 여기서 건너뜀)
 * 상태 파일이 없다: 날짜(KST)로 올릴 날·종류·내용이 정해진다 → 커밋이 없어 다른 봇의 rebase 와 부딪히지 않는다.
 * 격일은 크론의 '2일마다' 표기가 아니라 START 부터 센 날수의 짝홀로 — 크론은 달이 바뀔 때 31일·1일이 연달아 걸린다.
 *   타로 — 타로첩 /daily/ 와 같은 카드(cards.json 을 받아 같은 공식으로), 꿈 — sister-data.json 순서대로(인기 먼저),
 *   생일 — 그날 생일의 별자리·탄생석(생일첩 데이터). 자매 사이트 데이터는 tools/build-sister-data.mjs 로 묶어 둔다.
 * 같은 날 다시 돌려도 최근 글에 같은 첫 줄이 있으면 올리지 않는다(재실행·수동 실행 중복 방지).
 * 사용: node tools/sister-post.mjs           오늘 글 게시
 *       node tools/sister-post.mjs --dry     만들기만(출력) — DATE=2026-09-19 · KIND=tarot|dream|birthday 로 바꿔 볼 수 있음 */
import fs from 'node:fs';
import { creds, publish, fitText } from './threads-api.mjs';

const DRY = process.argv.includes('--dry') || process.env.DRY === 'true';
const DATA = JSON.parse(fs.readFileSync(new URL('./sister-data.json', import.meta.url), 'utf8'));
const START = Date.UTC(2026, 8, 19);                 // 2026-09-19 첫 글(타로). 여기서 짝수 날째마다 한 편, 글 순서대로 타로 → 꿈 → 생일
const KINDS = ['tarot', 'dream', 'birthday'];

/* 오늘(KST) */
function kstDate() {
  if (process.env.DATE) { const [y, m, d] = process.env.DATE.split('-').map(Number); return { y, m, d }; }
  const t = new Date(Date.now() + 9 * 3600e3);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}
const pad = (n) => String(n).padStart(2, '0');
const first = (s) => { const m = String(s).match(/^[\s\S]*?[.!?](?=\s|$)/); return (m ? m[0] : String(s)).trim(); };

async function getJson(url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), { headers: { 'User-Agent': 'sajucheop-bot' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      if (i >= tries) throw new Error(url + ' 받기 실패: ' + e.message);
      await new Promise((res) => setTimeout(res, 5000 * i));
    }
  }
}

/* 타로 — 타로첩 tools/build.mjs 의 오늘의 카드와 같은 공식: CARDS[(dayIndex*31)%78], 역방향 (dayIndex*7)%3===0 */
async function tarot({ y, m, d }, n) {
  const cards = await getJson('https://tarot.sajucheop.com/cards.json');
  if (!Array.isArray(cards) || cards.length !== 78) throw new Error('cards.json 형식이 예상과 다름');
  const dayIndex = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  const c = cards[(dayIndex * 31) % 78], rev = (dayIndex * 7) % 3 === 0;
  const dir = rev ? '역방향' : '정방향', kw = (rev ? c.kr : c.ku).slice(0, 3).join('·');
  const variant = ((Math.floor(n / 3) % 2) + 2) % 2;
  const head = variant === 0 ? `🔮 오늘의 타로 · ${m}월 ${d}일` : `${m}월 ${d}일, 오늘을 비추는 카드 한 장 🔮`;
  const body = variant === 0
    ? [`${c.n} ${dir}`, first(rev ? c.rv : c.up), `오늘의 조언 — ${c.ad}`, '나도 직접 골라 뽑기 → tarot.sajucheop.com/draw/']
    : [`${c.n} ${dir} · ${kw}`, c.ad, '마음 가는 카드를 직접 골라 보세요 → tarot.sajucheop.com/draw/'];
  return [head].concat(body).join('\n');
}

/* 꿈 — 인기 상징부터 차례대로(엿새에 한 번이라 162개를 다 도는 데 2년 넘게 걸린다) */
function dream(date, n) {
  const k = Math.floor(n / 3);
  const x = DATA.dreams[((k % DATA.dreams.length) + DATA.dreams.length) % DATA.dreams.length];
  const head = ((k % 2) + 2) % 2 === 0 ? `🌙 ${x.t}, 무슨 뜻일까?` : `어젯밤 ${x.t} 꾸셨나요? 🌙`;
  return [head, x.lead, `상황별로 뜻이 달라요 → dream.sajucheop.com${x.u}`].join('\n');
}

/* 생일 — 그날 생일인 사람의 별자리·탄생석 */
function birthday({ m, d }) {
  const z = DATA.zodiac.find(({ from: [fm, fd], to: [tm, td] }) => (fm <= tm
    ? (m > fm || (m === fm && d >= fd)) && (m < tm || (m === tm && d <= td))
    : (m > fm || (m === fm && d >= fd)) || (m < tm || (m === tm && d <= td))));
  const s = DATA.stones[m];
  if (!z || !s) throw new Error(`별자리·탄생석을 못 찾음: ${m}/${d}`);
  return [`🎂 ${m}월 ${d}일, 오늘 생일인 분들 축하해요!`, `별자리 ${z.kor}(${z.sym}) · 탄생석 ${s.name}(${s.meaning})`, `${z.kor} — ${z.trait}`,
    `태어난 해의 요일·띠·일주까지 한눈에 → saengil.sajucheop.com/md/${pad(m)}-${pad(d)}/`].join('\n');
}

/* 최근 글에 같은 첫 줄이 있으면 이미 올린 것 */
async function alreadyPosted(c, headLine) {
  try {
    const url = `https://graph.threads.net/v1.0/me/threads?fields=text,timestamp&limit=10&access_token=${encodeURIComponent(c.token)}`;
    const r = await fetch(url);
    if (!r.ok) return false;
    const j = await r.json();
    const dayAgo = Date.now() - 30 * 3600e3;
    return (j.data || []).some((p) => p.text && p.text.split('\n')[0].trim() === headLine && Date.parse(p.timestamp) > dayAgo);
  } catch { return false; }
}

/* process.exit 대신 exitCode — 윈도에서 fetch 소켓이 열린 채 exit 하면 libuv 단언 오류가 난다 */
async function main() {
  const date = kstDate();
  const days = Math.round((Date.UTC(date.y, date.m - 1, date.d) - START) / 86400000);
  const forced = KINDS.includes(process.env.KIND);   // 수동 실행에서 종류를 고르면 쉬는 날이어도 만든다
  if (!forced && ((days % 2) + 2) % 2 === 1) {
    console.log(`[${date.y}-${pad(date.m)}-${pad(date.d)}] 쉬는 날(이틀에 한 번) — 건너뜁니다.`);
    return;
  }
  const n = Math.floor(days / 2);                    // 몇 번째 글인지 — 종류·꿈 순서·문구 변형이 이것으로 돈다
  const kind = forced ? process.env.KIND : KINDS[((n % 3) + 3) % 3];
  const text = fitText(kind === 'tarot' ? await tarot(date, n) : kind === 'dream' ? dream(date, n) : birthday(date));
  console.log(`[${date.y}-${pad(date.m)}-${pad(date.d)} · ${kind}] ${text.length}자\n${text}\n`);
  if (DRY) return;
  const c = creds(false);
  if (!c) { console.log('THREADS 시크릿이 없어 게시를 건너뜁니다.'); return; }
  if (await alreadyPosted(c, text.split('\n')[0].trim())) { console.log('오늘 같은 글이 이미 올라가 있어 건너뜁니다.'); return; }
  await publish(c, { text });
}
main().catch((e) => { console.error(e.message); process.exitCode = 1; });
