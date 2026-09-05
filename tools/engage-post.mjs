/* 참여형 궁합 링크글 — '이번 주 궁합 상대'와 몇 점인지 링크로 바로 확인하게 하는 쓰레드 글.
 * 화·목·토마다 같은 상대, 다른 각도. docs/social/engage.txt 에 남기고 THREADS 시크릿이 있으면 게시한다. */
import fs from 'node:fs';
import { personaForWeek } from './persona.mjs';
import { kstToday, loadEngine } from './engine.mjs';
import { DAY_MASTERS } from './en-daymaster-data.mjs';

const STEM_KOR = ['갑목', '을목', '병화', '정화', '무토', '기토', '경금', '신금', '임수', '계수'];
const STEM_HAP = { 0: 5, 5: 0, 1: 6, 6: 1, 2: 7, 7: 2, 3: 8, 8: 3, 4: 9, 9: 4 };

const p = personaForWeek();
const t = kstToday();
const wd = new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay(); /* 0=일 */
const who = '「' + p.alias + '」 ' + p.kor + '일주(' + p.han + ')';

/* 영문 — 같은 캐릭터를 Day Master 아키타입 이름으로, 링크는 /en/match/ 초대 모드 */
const { G } = loadEngine();
const dm = DAY_MASTERS[p.stem];
const enName = dm.arch.replace(/^The /, '').slice(0, 12);
const enUrl = 'https://sajucheop.com/en/match/#p=' + G.encodeProfile(Object.assign({}, p.input, { name: enName }));
const enTail = ['', '🌏 EN — This week\'s match: "' + dm.arch + '" (' + dm.name + '). Your score in 10 seconds → ' + enUrl];

const variants = {
  intro: [
    '이번 주 궁합 상대: ' + who + '.',
    '당신과 몇 점일까?',
    '생일만 넣으면 10초 → ' + p.url,
    '',
    '점수 나오면 댓글에 남겨주세요. 90점 넘으면 진짜 인연 🔥'
  ],
  hap: [
    '이번 주 궁합 상대 ' + who + '와 합(合)이 드는 일간은 ' + STEM_KOR[STEM_HAP[p.stem]] + '.',
    '당신 일간은? 점수는?',
    '→ ' + p.url,
    '',
    '내 점수보다 높은 사람 있으면 댓글로 이겨보기.'
  ],
  weekend: [
    '주말 궁합 도전 🔥 ' + who + '와 나, 그리고 내 짝꿍.',
    '둘 다 넣어보고 누가 더 높은지 → ' + p.url,
    '',
    '결과 화면의 "궁합 카드 이미지 저장"으로 스토리 인증 + @sajucheop 태그하면 리포스트해요.'
  ]
};
const kind = wd === 6 ? 'weekend' : wd === 4 ? 'hap' : 'intro';
const text = variants[kind].concat(enTail).join('\n');

fs.mkdirSync('docs/social', { recursive: true });
fs.writeFileSync('docs/social/engage.txt', text + '\n');
fs.writeFileSync('docs/social/engage.json', JSON.stringify({ date: `${t.y}-${String(t.m).padStart(2, '0')}-${String(t.d).padStart(2, '0')}`, kind, persona: { idx: p.idx, alias: p.alias, ilju: p.kor, han: p.han }, url: p.url }, null, 2));
console.log('참여형 글(' + kind + ') — 상대 ' + p.kor + '일주 ' + p.alias);
console.log(text);

const UID = process.env.THREADS_USER_ID, TOKEN = process.env.THREADS_ACCESS_TOKEN;
if (!UID || !TOKEN) { console.log('THREADS 시크릿이 없어 게시는 건너뜁니다.'); process.exit(0); }
const base = 'https://graph.threads.net/v1.0/' + UID;
async function post(url, params) {
  const r = await fetch(url, { method: 'POST', body: new URLSearchParams({ ...params, access_token: TOKEN }) });
  return r.json();
}
const j1 = await post(base + '/threads', { media_type: 'TEXT', text });
if (!j1.id) { console.error('컨테이너 생성 실패:', JSON.stringify(j1)); process.exit(1); }
await new Promise((r) => setTimeout(r, 5000));
const j2 = await post(base + '/threads_publish', { creation_id: j1.id });
if (!j2.id) { console.error('게시 실패:', JSON.stringify(j2)); process.exit(1); }
console.log('쓰레드 게시 완료:', j2.id);
