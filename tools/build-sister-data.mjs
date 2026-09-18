/* 첩 시리즈 쓰레드 글(tools/sister-post.mjs)이 쓰는 자매 사이트 데이터 묶음 → tools/sister-data.json
 * GitHub Actions 에서는 다른 저장소를 못 읽으니, 로컬에서 옆 폴더(../SAENGIL · ../DREAM)를 읽어 만들어 커밋해 둔다.
 * 꿈 목록은 인기(hot) 상징 먼저 — 글은 이 순서대로 돈다. 자매 사이트 문구가 바뀌면 다시 돌릴 것.
 * 사용: node tools/build-sister-data.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SIB = (repo, rel) => pathToFileURL(path.join(ROOT, '..', repo, rel)).href;

const { ZODIAC, BIRTHSTONE } = await import(SIB('SAENGIL', 'data/meta.mjs'));
const dreamMod = await import(SIB('DREAM', 'data/dreams/index.mjs'));
const DREAMS = dreamMod.DREAMS || dreamMod.default;
const index = JSON.parse(fs.readFileSync(path.join(ROOT, '..', 'DREAM', 'dist', 'index.json'), 'utf8'));
const titleOf = Object.fromEntries(index.map((x) => [x.u, x.t]));

const firstSentence = (s) => { const m = String(s).match(/^[\s\S]*?[.!?](?=\s|$)/); return (m ? m[0] : String(s)).trim(); };

const zodiac = ZODIAC.map((z) => ({ kor: z.kor, sym: z.sym, from: z.from, to: z.to, trait: firstSentence(z.trait) }));
const stones = BIRTHSTONE.map((b) => (b ? { name: b.name, meaning: b.meaning } : null));
const ordered = DREAMS.filter((d) => d.hot).concat(DREAMS.filter((d) => !d.hot));
const dreams = ordered.map((d) => {
  const u = `/d/${d.slug}/`;
  const t = titleOf[u] || d.q || `${d.name} 꿈`;
  if (!d.lead) throw new Error(`꿈 lead 없음: ${d.slug}`);
  return { u, t, lead: d.lead.trim() };
});

const out = { built: new Date().toISOString().slice(0, 10), zodiac, stones, dreams };
fs.writeFileSync(path.join(ROOT, 'tools', 'sister-data.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`sister-data.json: 별자리 ${zodiac.length} · 탄생석 ${stones.filter(Boolean).length} · 꿈 ${dreams.length}(인기 ${DREAMS.filter((d) => d.hot).length} 먼저)`);
