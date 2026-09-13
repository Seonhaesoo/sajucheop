/* 서재 추가 글 15편 + 소개 페이지 — 애드센스 '가치가 별로 없는 콘텐츠' 반려(2026-09-13) 대응.
 * 본문은 tools/guide-extra-a·b·c.mjs(손으로 씀) → docs/guide/<slug>.html,
 * 서재 목록 docs/guide/index.html 의 <!-- extra:start --> ~ <!-- extra:end --> 구간, docs/sitemap.xml 에 반영.
 * /about/ 소개 페이지도 여기서 만든다. 사용: node tools/build-guide-extra.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { ARTICLES as A } from './guide-extra-a.mjs';
import { ARTICLES as B } from './guide-extra-b.mjs';
import { ARTICLES as C } from './guide-extra-c.mjs';

const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-13';
const DATE_KO = '2026년 9월 13일';
/* 서재 목록 순서 — 개념·실전을 앞에, 신살은 뒤에 */
const ORDER = ['yongsin', 'gunghap-howto', 'seun-wolun', 'sibi-unseong', 'gongmang', 'samjae', 'son-eomneun-nal',
  'cheoneul-gwiin', 'dohwasal', 'yeokmasal', 'hwagaesal', 'goegangsal', 'yanginsal', 'baekhosal', 'wonjinsal'];
const MIN_CHARS = 2000;

const all = [...A, ...B, ...C];
const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));
const textLen = (h) => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().length;

/* ---------- 검사: 빠진 글·필드, 분량, 링크 대상 ---------- */
const problems = [];
if (all.length !== ORDER.length) problems.push(`글 수 ${all.length} (기대 ${ORDER.length})`);
for (const s of ORDER) if (!bySlug[s]) problems.push('글 없음: ' + s);
for (const a of all) {
  for (const k of ['slug', 'tag', 'title', 'h1', 'desc', 'card', 'lead', 'body']) if (!a[k]) problems.push(`${a.slug}: ${k} 없음`);
  if (!a.cta || !a.cta.href || !a.cta.label) problems.push(`${a.slug}: cta 없음`);
  if (!['신살', '개념', '실전'].includes(a.tag)) problems.push(`${a.slug}: tag '${a.tag}'`);
  const n = textLen(a.lead + a.body);
  if (n < MIN_CHARS) problems.push(`${a.slug}: 분량 ${n}자`);
  for (const m of (a.body + a.lead + ' href="' + a.cta.href + '"').matchAll(/href="([^"#?]*)/g)) {
    const h = m[1];
    if (!h || /^(https?:|mailto:)/.test(h)) continue;
    if (ORDER.some((s) => h === s + '.html')) continue;
    const target = path.join(DOCS, 'guide', h);
    const ok = fs.existsSync(target) && (fs.statSync(target).isFile() || fs.existsSync(path.join(target, 'index.html')));
    if (!ok) problems.push(`${a.slug}: 없는 링크 ${h}`);
  }
}
if (problems.length) { console.error('서재 추가 글 검사 실패:\n  ' + problems.join('\n  ')); process.exit(1); }

/* ---------- 글 페이지 ---------- */
function articlePage(a) {
  const url = `/guide/${a.slug}.html`;
  const pos = ORDER.indexOf(a.slug);
  const next = [1, 2, 3].map((k) => bySlug[ORDER[(pos + k) % ORDER.length]]);
  const body = `
  <article class="guide-article">
    <div class="ga-overline">${esc(a.tag)}</div>
    <h1 class="ga-title">${a.h1}</h1>
    <p class="ga-meta">사주첩 서재 · ${DATE_KO}</p>
    <p class="ga-lead">${a.lead.trim()}</p>

    <div class="ga-body">
${a.body.trim()}

      <h2>함께 읽기</h2>
      <ul>
        ${next.map((x) => `<li><a href="${x.slug}.html">${esc(x.title)}</a></li>`).join('\n        ')}
        <li><a href="index.html">서재 전체 목록</a></li>
      </ul>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${esc(a.cta.href)}"><span class="seal-dot" aria-hidden="true"></span><span>${esc(a.cta.label)}</span></a>
    </div>
  </article>`;
  return shell({
    rel: '../', title: `${a.title} — 사주첩 서재`, desc: a.desc, canonical: SITE + url, ogTitle: a.title,
    nav: [{ href: 'index.html', label: '서재' }, { href: '../index.html', label: '사주 보기' }],
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.desc, datePublished: PUBLISHED, dateModified: PUBLISHED, inLanguage: 'ko', author: { '@type': 'Organization', name: '사주첩' }, publisher: { '@type': 'Organization', name: '사주첩' }, mainEntityOfPage: SITE + url },
      breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '서재', url: SITE + '/guide/' }, { name: a.title, url: SITE + url }])
    ],
    body
  });
}

/* ---------- 소개 페이지 ---------- */
function aboutPage() {
  const url = '/about/';
  const body = `
  <article class="guide-article">
    <div class="ga-overline">소개</div>
    <h1 class="ga-title">사주첩을 소개합니다</h1>
    <p class="ga-meta">사주첩 · ${DATE_KO} 고침</p>
    <p class="ga-lead">사주첩(四柱帖)은 태어난 해·달·날·시의 여덟 글자를 직접 계산하고, 명리학의 규칙을 알기 쉬운 문장으로 옮겨 보여 주는 무료 사주 풀이 사이트입니다. '첩(帖)'은 시첩·서첩처럼 기록을 묶은 책을 뜻합니다.</p>

    <div class="ga-body">
      <h2>무엇을 하는 곳인가요</h2>
      <p>생년월일시를 넣으면 명식(여덟 글자), 오행 분포, 십성, 10년 단위 대운, 오늘의 운세, 궁합, 좋은 날을 한 흐름으로 보여 줍니다. 여기에 <a href="../ilju/">60일주 사전</a>, <a href="../gunghap/">일간 궁합표</a>, 날짜별 일진, 절기, 손없는날 달력, 토정비결, 만세력, 음력 기념일 변환, 삼재 계산 같은 도구와, 개념을 풀어 쓴 <a href="../guide/">서재</a> 글이 있습니다.</p>

      <h2>왜 만들었나요</h2>
      <p>사주 풀이는 흔하지만, 무엇을 근거로 그런 말을 하는지 알려 주는 곳은 드뭅니다. 겁을 주거나 유료 상담으로 이끄는 문장도 많습니다. 사주첩은 반대로 가려고 합니다. 계산 과정을 숨기지 않고, 풀이는 규칙에서 나온 만큼만 말하며, '믿으세요'보다 '이해하세요'에 가까운 안내서가 되는 것이 목표입니다.</p>

      <h2>계산은 이렇게 합니다</h2>
      <ul>
        <li><strong>절기</strong> — 표를 베끼지 않고 태양의 겉보기 위치(황경)로 24절기가 바뀌는 시각을 분 단위까지 계산합니다. 월주와 년주는 이 시각을 경계로 바뀌고, 사주의 새해는 1월 1일이나 설날이 아니라 입춘입니다(<a href="../guide/jeolgi.html">왜 입춘인가</a>).</li>
        <li><strong>진태양시</strong> — 한국 표준시는 동경 135도 기준이라 서울에서 해가 실제로 움직이는 시각과 30분 남짓 어긋납니다. 기본값으로 서울 기준 32분을 빼서 보정하고, 끄는 스위치도 둡니다(<a href="../guide/birth-time.html">출생시간 보정 이야기</a>).</li>
        <li><strong>과거 표준시</strong> — 1954~1961년처럼 표준시가 동경 127.5도(UTC+8:30)였던 시기를 반영합니다. 서머타임이 있던 해는 경고로 알려 드립니다.</li>
        <li><strong>음력</strong> — 한국천문연구원 기준 음력 자료로 양력으로 바꾼 뒤 계산합니다. 윤달도 고를 수 있습니다.</li>
        <li><strong>검증</strong> — 계산 엔진은 136개의 자동 테스트(일주 기준일, 합충, 음력 변환, 궁합 점수 등)로 확인하고, 고칠 때마다 다시 돌립니다.</li>
      </ul>

      <h2>풀이는 이렇게 씁니다</h2>
      <p>풀이 문장은 명리학의 규칙 — 일간과 다른 글자의 관계(십성), 합과 충, 신강·신약 — 을 조건에 따라 문장으로 옮긴 것입니다. 같은 조건이면 누구에게나 같은 문장이 나오고, 근거가 된 글자를 함께 보여 줍니다. 삼재·신살처럼 겁을 주기 쉬운 주제는 '조심할 때를 정리하는 관습'으로 설명합니다. 토정비결 144괘 풀이처럼 전통 구조 위에 사주첩이 새로 쓴 문장은 그렇다고 밝혀 둡니다.</p>
      <p>사주는 참고용입니다. 건강·돈·법률처럼 중요한 결정은 전문가와 상의하고 스스로 판단해 주세요.</p>

      <h2>개인정보와 광고</h2>
      <p>입력한 생년월일시는 서버로 보내지 않고 이 기기의 브라우저 안에서만 계산합니다. 궁합 링크는 정보가 주소 끝(#)에만 담겨 서버에 남지 않습니다. 방문 통계를 위해 Google 애널리틱스를, 운영비를 위해 Google 애드센스 광고를 씁니다. 자세한 내용은 <a href="../privacy.html">개인정보처리방침</a>과 <a href="../terms.html">이용약관</a>에 있습니다.</p>

      <h2>함께 운영하는 사이트</h2>
      <ul>
        <li><a href="http://saengil.sajucheop.com/">생일 사전</a> — 1940년부터 오늘까지 날짜별 생일·나이·띠·음력</li>
        <li><a href="https://dream.sajucheop.com/">꿈해몽</a> — 상징과 상황별 꿈 풀이</li>
        <li><a href="https://tarot.sajucheop.com/">타로</a> — 78장 카드의 뜻과 뽑기</li>
      </ul>

      <h2>고친 기록</h2>
      <ul>
        <li>2026년 8월 — 사주 풀이, 오늘의 운세, 궁합 링크, 서재 글 20편으로 문을 열었습니다.</li>
        <li>2026년 9월 — 60일주 사전, 일간 궁합표, 날짜별 일진·절기·손없는날, 영문판, 2027 토정비결을 더했습니다.</li>
        <li>${DATE_KO} — 용신·궁합 보는 법·신살 등 서재 글 15편을 더했습니다.</li>
      </ul>

      <h2>문의</h2>
      <p>잘못된 계산이나 어색한 문장을 발견하면 인스타그램 <a href="https://www.instagram.com/sajucheop/" target="_blank" rel="noopener">@sajucheop</a> 메시지(DM)로 알려 주세요. 확인한 뒤 고치고 이 페이지의 기록에 남깁니다.</p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="../index.html"><span class="seal-dot" aria-hidden="true"></span><span>내 사주 풀어보기</span></a>
    </div>
  </article>`;
  return shell({
    rel: '../', title: '사주첩 소개 — 계산 기준과 풀이 원칙', desc: '사주첩이 여덟 글자를 어떻게 계산하는지(절기 시각·진태양시·과거 표준시·음력), 풀이 문장을 어떤 원칙으로 쓰는지, 개인정보와 광고, 문의 방법을 정리했습니다.',
    canonical: SITE + url, nav: [{ href: '../guide/', label: '서재' }, { href: '../index.html', label: '사주 보기' }],
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'AboutPage', name: '사주첩 소개', url: SITE + url, inLanguage: 'ko', publisher: { '@type': 'Organization', name: '사주첩', url: SITE + '/', sameAs: ['https://www.instagram.com/sajucheop/'] } },
      breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '소개', url: SITE + url }])
    ],
    body
  });
}

/* ---------- 쓰기 ---------- */
for (const a of all) fs.writeFileSync(path.join(DOCS, 'guide', a.slug + '.html'), articlePage(a));
fs.mkdirSync(path.join(DOCS, 'about'), { recursive: true });
fs.writeFileSync(path.join(DOCS, 'about', 'index.html'), aboutPage());

/* 서재 목록 — 표시 구간이 없으면 첫 글 목록(nav.guide-list) 바로 뒤에 만든다 */
const idxPath = path.join(DOCS, 'guide', 'index.html');
let idx = fs.readFileSync(idxPath, 'utf8');
const cards = ORDER.map((s) => {
  const a = bySlug[s];
  return `    <a class="guide-card" href="${a.slug}.html">
      <div class="gc-tag">${esc(a.tag)}</div>
      <h2>${esc(a.title)}</h2>
      <p>${esc(a.card)}</p>
    </a>`;
}).join('\n');
const section = `<!-- extra:start -->
  <div class="guide-section">
    <h2>용신·궁합·신살</h2>
    <span>2026년 9월에 더한 ${ORDER.length}편</span>
  </div>

  <nav class="guide-list">
${cards}
  </nav>
  <!-- extra:end -->`;
if (idx.includes('<!-- extra:start -->')) {
  idx = idx.replace(/<!-- extra:start -->[\s\S]*?<!-- extra:end -->/, section);
} else {
  const at = idx.indexOf('</nav>', idx.indexOf('<nav class="guide-list">')) + '</nav>'.length;
  idx = idx.slice(0, at) + '\n\n  ' + section + idx.slice(at);
}
if (!idx.includes('href="../about/"')) idx = idx.replace('<a href="../terms.html">이용약관</a>', '<a href="../about/">소개</a>\n        <a href="../terms.html">이용약관</a>');
fs.writeFileSync(idxPath, idx);

/* 사이트맵 — 없는 주소만 </urlset> 앞에 */
const smPath = path.join(DOCS, 'sitemap.xml');
let sm = fs.readFileSync(smPath, 'utf8');
const add = ORDER.map((s) => [`${SITE}/guide/${s}.html`, '0.7']).concat([[`${SITE}/about/`, '0.5']])
  .filter(([u]) => !sm.includes(`<loc>${u}</loc>`))
  .map(([u, p]) => `  <url><loc>${u}</loc><priority>${p}</priority></url>`);
if (add.length) sm = sm.replace('</urlset>', add.join('\n') + '\n</urlset>');
fs.writeFileSync(smPath, sm);

console.log(`서재 추가 글 ${all.length}편 + 소개 페이지 · 사이트맵 +${add.length} · 분량 ${all.map((a) => textLen(a.lead + a.body)).sort((x, y) => x - y).filter((_, i, arr) => i === 0 || i === arr.length - 1).join('~')}자`);
