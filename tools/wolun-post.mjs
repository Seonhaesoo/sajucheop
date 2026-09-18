/* 절기 날 쓰레드 글 — 달이 바뀌는 절기(입춘·경칩·청명…)가 드는 날 저녁에 '이달의 띠별 운세'를 공유 카드와 함께 올린다.
 * sister-post.yml 이 매일 19:37 KST 에 돌리고, 오늘이 절기 날이 아니면 아무것도 하지 않는다(상태 파일 없음).
 *   글감: docs/wolun/<YYYY-MM>/index.html 의 제목·설명(운이 좋은 띠·조심할 띠), 그림: https://sajucheop.com/og/wolun-<YYYY-MM>.jpg (없으면 글만)
 *   같은 첫 줄이 최근 글에 있으면 다시 올리지 않는다.
 * 사용: node tools/wolun-post.mjs            절기 날이면 게시
 *       node tools/wolun-post.mjs --dry      만들기만 — DATE=2026-10-08 로 날짜를 바꿔 볼 수 있음, FORCE=1 이면 절기 날이 아니어도 만든다 */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { makeWolun, JIE_NAME, monthKey } from './wolun-lib.mjs';
import { creds, publish, fitText } from './threads-api.mjs';

const DRY = process.argv.includes('--dry') || process.env.DRY === 'true';
const { M, I } = loadEngine();
const { currentSolarMonth, solarMonth } = makeWolun({ M, I });
const pad = (n) => String(n).padStart(2, '0');

function kstDate() {
  if (process.env.DATE) { const [y, m, d] = process.env.DATE.split('-').map(Number); return { y, m, d }; }
  const t = new Date(Date.now() + 9 * 3600e3);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}
const un = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

async function main() {
  const today = kstDate();
  const [y, m] = currentSolarMonth(today);
  const S = solarMonth(y, m);
  const isJie = S.start.y === today.y && S.start.m === today.m && S.start.d === today.d;
  if (!isJie && !process.env.FORCE) { console.log(`[${today.y}-${pad(today.m)}-${pad(today.d)}] 절기 날이 아님 — 건너뜁니다 (이번 달 ${monthKey(y, m)}은 ${S.start.m}/${S.start.d} ${JIE_NAME[m]}부터).`); return; }
  const key = monthKey(y, m);
  const file = path.join(ROOT_DIR, 'docs', 'wolun', key, 'index.html');
  if (!fs.existsSync(file)) throw new Error('달 페이지 없음: ' + file);
  const html = fs.readFileSync(file, 'utf8');
  const desc = un((html.match(/name="description" content="([^"]*)"/) || [, ''])[1]);
  const good = (desc.match(/운이 좋은 띠는 ([^,]+),/) || [])[1] || '', bad = (desc.match(/조심할 띠는 ([^.]+)\./) || [])[1] || '';
  const kor = M.STEMS[S.stem].kor + M.BRANCHES[S.branch].kor, han = M.STEMS[S.stem].han + M.BRANCHES[S.branch].han;
  const head = `🗓 ${m}월 띠별 운세 — 오늘 ${JIE_NAME[m]}(${pad(S.start.hh)}:${pad(S.start.mm)})부터 ${kor}월(${han})`;
  const text = fitText([head,
    `운이 좋은 띠 ${good}`,
    `조심할 띠 ${bad}`,
    '띠별 점수와 좋은 날·조심할 날은 여기서 👇',
    `sajucheop.com/wolun/${key}/`].join('\n'));
  const imageUrl = `https://sajucheop.com/og/wolun-${key}.jpg`;
  let hasImage = false;
  try { const r = await fetch(imageUrl, { method: 'HEAD' }); hasImage = r.ok; } catch { hasImage = false; }
  console.log(`[${today.y}-${pad(today.m)}-${pad(today.d)} · ${key}] ${text.length}자 · 그림 ${hasImage ? '있음' : '없음'}\n${text}\n`);
  if (DRY) return;
  const c = creds(false);
  if (!c) { console.log('THREADS 시크릿이 없어 게시를 건너뜁니다.'); return; }
  try {
    const r = await fetch(`https://graph.threads.net/v1.0/me/threads?fields=text,timestamp&limit=10&access_token=${encodeURIComponent(c.token)}`);
    if (r.ok) {
      const j = await r.json(), dayAgo = Date.now() - 30 * 3600e3;
      if ((j.data || []).some((p) => p.text && p.text.split('\n')[0].trim() === head && Date.parse(p.timestamp) > dayAgo)) { console.log('오늘 같은 글이 이미 올라가 있어 건너뜁니다.'); return; }
    }
  } catch { /* 확인 실패면 그냥 올린다 */ }
  await publish(c, hasImage ? { text, imageUrl } : { text });
}
main().catch((e) => { console.error(e.message); process.exitCode = 1; });
