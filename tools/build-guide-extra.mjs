/* 서재 추가 글 15편 + 소개 페이지 — 애드센스 '가치가 별로 없는 콘텐츠' 반려(2026-09-13) 대응.
 * 본문은 tools/guide-extra-a·b·c.mjs(손으로 씀) → docs/guide/<slug>.html,
 * 서재 목록 docs/guide/index.html 의 <!-- extra:start --> ~ <!-- extra:end --> 구간, docs/sitemap.xml 에 반영.
 * (/about/ 소개 페이지는 2026-11-02 부터 build-about.mjs 로 옮김.) 사용: node tools/build-guide-extra.mjs */
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

/* 소개 페이지(/about/)는 2026-11-02 부터 tools/build-about.mjs 가 만든다(계산 방법 페이지와 함께) */

/* ---------- 쓰기 ---------- */
for (const a of all) fs.writeFileSync(path.join(DOCS, 'guide', a.slug + '.html'), articlePage(a));

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

/* 꿈첩 인기 꿈해몽 12 — 새 도메인이라 구글이 속 페이지를 아직 몰라서(2026-09-18 표본 10/10 미발견), 잘 읽히는 사주첩 서재에서 길을 낸다.
 * 목록은 tools/sister-data.json(인기순, node tools/build-sister-data.mjs 로 꿈첩 데이터를 묶음) 앞에서 12개 */
const DREAMS = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'tools', 'sister-data.json'), 'utf8')).dreams.slice(0, 12);
const firstOf = (s) => (String(s).match(/^[\s\S]*?[.!?](?=\s|$)/) || [String(s)])[0].trim();
const dreamSection = `<!-- dream:start -->
  <div class="guide-section">
    <h2>꿈해몽 — 자매 사이트 꿈첩</h2>
    <span>많이 찾는 꿈 ${DREAMS.length}가지</span>
  </div>

  <nav class="guide-grid" aria-label="꿈첩 인기 꿈해몽">
${DREAMS.map((x) => `    <a class="guide-card" href="https://dream.sajucheop.com${x.u}">
      <div class="gc-tag">꿈첩</div>
      <h3>${esc(x.t)}</h3>
      <p>${esc(firstOf(x.lead))}</p>
    </a>`).join('\n')}
  </nav>
  <!-- dream:end -->`;
if (idx.includes('<!-- dream:start -->')) idx = idx.replace(/<!-- dream:start -->[\s\S]*?<!-- dream:end -->/, dreamSection);
else idx = idx.replace('  <div class="ga-cta" style="padding: 0 22px;">', '  ' + dreamSection + '\n\n  <div class="ga-cta" style="padding: 0 22px;">');
if (!idx.includes('<!-- dream:start -->')) throw new Error('서재 목록에 꿈첩 구간을 넣을 자리를 못 찾음');
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
