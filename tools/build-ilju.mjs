/* 60일주 사전 생성 — /ilju/<slug>/ 60장 + /ilju/ 인덱스 + sitemap-ilju.xml
 * 본문은 tools/ilju-data.mjs(손으로 씀), 지장간·십성·궁합은 엔진으로 붙인다.
 * 사용: node tools/build-ilju.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { ILJU, UN_LINE, SPOUSE_LINE } from './ilju-data.mjs';

const { M, C } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-05';
const GUIDE = ['ilgan-gapmok', 'ilgan-eulmok', 'ilgan-byeonghwa', 'ilgan-jeonghwa', 'ilgan-muto', 'ilgan-gito', 'ilgan-gyeonggeum', 'ilgan-singeum', 'ilgan-imsu', 'ilgan-gyesu'];
const STEM_HAP = { 0: 5, 5: 0, 1: 6, 6: 1, 2: 7, 7: 2, 3: 8, 8: 3, 4: 9, 9: 4 };
const STEM_CHUNG = { 0: 6, 6: 0, 1: 7, 7: 1, 2: 8, 8: 2, 3: 9, 9: 3 };
const GEN = M.elCycle.gen;
const CTRL = {};
Object.keys(GEN).forEach((k) => { CTRL[k] = GEN[GEN[k]]; });

const stemIdx = (han) => M.STEMS.findIndex((s) => s.han === han);
const branchIdx = (han) => M.BRANCHES.findIndex((b) => b.han === han);

/* 데이터에 인덱스 붙이기 + 60갑자 순서 검증 */
const list = ILJU.map((e) => Object.assign({}, e, { s: stemIdx(e.han[0]), b: branchIdx(e.han[1]) }));
list.forEach((e, i) => {
  if (e.s !== i % 10 || e.b !== i % 12) throw new Error('60갑자 순서 불일치: ' + e.han + ' at ' + i);
});

/* 일주끼리의 궁합 점수 — 링크 궁합(gunghap.js)의 천간·지지 가중치와 같은 기준 */
function pairScore(a, b) {
  let s = 0;
  const sa = M.STEMS[a.s], sb = M.STEMS[b.s];
  if (STEM_HAP[a.s] === b.s) s += 18;
  else if (STEM_CHUNG[a.s] === b.s) s -= 12;
  else if (GEN[sa.el] === sb.el || GEN[sb.el] === sa.el) s += 10;
  else if (sa.el === sb.el) s += 4;
  else s -= 6;
  const br = M.branchRelation(a.b, b.b);
  if (br === '육합') s += 14; else if (br === '삼합') s += 10; else if (br === '동일') s += 4; else if (br === '충') s -= 14;
  if (sa.yang !== sb.yang) s += 4;
  return s;
}
function relWord(a, b) {
  const parts = [];
  if (STEM_HAP[a.s] === b.s) parts.push('천간합');
  else if (STEM_CHUNG[a.s] === b.s) parts.push('천간충');
  else if (GEN[M.STEMS[a.s].el] === M.STEMS[b.s].el) parts.push('내가 상대를 생함');
  else if (GEN[M.STEMS[b.s].el] === M.STEMS[a.s].el) parts.push('상대가 나를 생함');
  const br = M.branchRelation(a.b, b.b);
  if (br === '육합') parts.push('일지 육합'); else if (br === '삼합') parts.push('일지 삼합'); else if (br === '충') parts.push('일지 충');
  return parts.join(' · ') || '무난한 사이';
}

const STYLE = `<style>
    .ij-meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 4px; }
    .ij-meta span { font-size: 12px; padding: 3px 9px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); }
    .ij-meta span b { color: var(--ink); font-weight: 600; }
    .ij-han { font-family: 'Noto Serif KR', serif; font-size: 48px; font-weight: 700; letter-spacing: 0.08em; color: var(--seal); line-height: 1; margin: 6px 0 14px; }
    .ij-list { list-style: none; padding: 0; margin: 6px 0 0; }
    .ij-list li { padding: 9px 0; border-bottom: 1px solid var(--line-soft); font-size: 14px; line-height: 1.6; }
    .ij-list li b { font-family: 'Noto Serif KR', serif; }
    .ij-list li a { text-decoration: none; }
    .ij-tag { font-size: 11px; padding: 1px 7px; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); margin-left: 6px; vertical-align: 1px; }
    .ij-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 8px 0 18px; }
    .ij-grid a { display: block; padding: 10px 8px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; text-decoration: none; color: inherit; text-align: center; }
    .ij-grid a b { display: block; font-family: 'Noto Serif KR', serif; font-size: 16px; }
    .ij-grid a small { display: block; font-size: 11px; color: var(--faint); margin-top: 3px; line-height: 1.4; }
    .ij-grid a.cur { border-color: var(--seal); background: #FBF3E6; }
    .ij-group { margin-top: 22px; }
    .ij-group h2 a { text-decoration: none; }
  </style>`;
const NAV = (rel) => [{ href: rel, label: '사주 보기' }, { href: rel + 'guide/', label: '서재' }, { href: rel + 'ilju/', label: '일주 사전' }];

function write(relPath, html) {
  const file = path.join(DOCS, relPath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const urls = [];

list.forEach((e, i) => {
  const rel = '../../';
  const st = M.STEMS[e.s], br = M.BRANCHES[e.b];
  const ch = C.of(st.han);
  const hidden = M.JIJANGGAN[e.b];
  const mainSip = M.branchSipseong(e.s, e.b);
  const hiddenHtml = hidden.map((h, k) => {
    const hs = M.STEMS[h];
    const sip = M.sipseongOf(e.s, h);
    return `<b>${hs.kor}${hs.el}(${hs.han})</b> — ${sip}${k === hidden.length - 1 ? ' <span class="ij-tag">본기</span>' : ''}`;
  }).join('<br>');
  const siblings = list.filter((x) => x.s === e.s);
  const prev = list[(i + 59) % 60], next = list[(i + 1) % 60];

  /* 궁합 순위 */
  const scored = list.filter((x) => x !== e).map((x) => ({ x, sc: pairScore(e, x) })).sort((p, q) => q.sc - p.sc);
  const best = scored.slice(0, 5), worst = scored.slice(-3).reverse();
  const fmtPair = ({ x, sc }) => `<li><b><a href="${rel}ilju/${x.slug}/">${x.kor}일주(${x.han})</a></b> <span class="ij-tag">${relWord(e, x)}</span> — ${x.alias}</li>`;

  const title = `${e.kor}일주(${e.han}) — ${e.alias}, 성격·연애·직업·궁합`;
  const desc = `${e.kor}일주는 ${st.kor}${st.el} 일간이 ${br.kor}${br.el} 위에 앉은 자리. 일지 ${mainSip}, 12운성 ${e.un}. ${e.core.split('. ')[0]}. 잘 맞는 일주와 조심할 일주까지.`;

  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}ilju/" style="color: inherit; text-decoration: none;">60일주 사전</a> · ${i + 1} / 60</div>
    <div class="ij-han">${e.han}</div>
    <h1 class="ga-title">${e.kor}일주 —<br>${esc(e.alias)}</h1>
    <div class="ij-meta">
      <span>일간 <b>${st.kor}${st.el}</b></span><span>일지 <b>${br.kor}${br.el}</b></span><span>일지 십성 <b>${mainSip}</b></span><span>12운성 <b>${e.un}</b></span>
    </div>
    <p class="ga-meta">사주첩 서재 · 일간 캐릭터 「${esc(ch.name)}」 · ${ch.keywords.join(' · ')}</p>
    <p class="ga-lead">${esc(e.core.split('. ')[0])}.</p>

    <div class="ga-body">
      <h2>어떤 사람인가</h2>
      <p>${esc(e.core)}</p>
      <p>${st.kor}${st.el} 일간의 결은 <a href="${rel}guide/${GUIDE[e.s]}.html">${esc(ch.metaphor)}</a> — ${esc(ch.essence)}. 여기에 일지 ${br.kor}(${br.han})가 어떤 방을 내어주는지가 ${e.kor}일주만의 색을 만듭니다.</p>

      <h2>일지 ${br.kor}(${br.han})가 말하는 것</h2>
      <p>일지는 나의 안방이자 배우자 자리입니다. ${br.kor} 안에는 하늘 글자가 ${hidden.length}개 숨어 있어요(지장간):</p>
      <p>${hiddenHtml}</p>
      <p>${SPOUSE_LINE[mainSip]}</p>
      <p>${UN_LINE[e.un]}</p>

      <h2>연애와 배우자</h2>
      <p>${esc(e.love)}</p>

      <h2>일과 재물</h2>
      <p>${esc(e.work)}</p>

      <h2>잘 맞는 일주</h2>
      <p>천간의 합·생과 일지의 합을 기준으로 고른 다섯입니다. 일주만으로 보는 궁합이라 참고용이고, 여덟 글자를 다 넣으면 <a href="${rel}">링크 궁합</a>에서 점수와 십성 케미가 나옵니다.</p>
      <ul class="ij-list">
        ${best.map(fmtPair).join('\n        ')}
      </ul>
      <h2>조심할 일주</h2>
      <ul class="ij-list">
        ${worst.map(fmtPair).join('\n        ')}
      </ul>

      <h2>한 줄 조언</h2>
      <p><b>${esc(e.advice)}</b></p>

      <h2>같은 ${st.kor}${st.el} 일간의 여섯 일주</h2>
      <div class="ij-grid">
        ${siblings.map((x) => `<a href="${rel}ilju/${x.slug}/"${x === e ? ' class="cur"' : ''}><b>${x.han}</b><small>${x.kor}일주<br>${esc(x.alias)}</small></a>`).join('\n        ')}
      </div>

      <p class="callout">← <a href="${rel}ilju/${prev.slug}/">${prev.kor}일주</a> · <a href="${rel}ilju/${next.slug}/">${next.kor}일주</a> → · <a href="${rel}ilju/">60일주 전체</a> · <a href="${rel}guide/${GUIDE[e.s]}.html">${st.kor}${st.el} 일간 사전</a></p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>내 일주가 ${e.kor}일주인지 확인하기</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">생년월일만 넣으면 10초. 절기 시각과 야자시까지 반영한 정밀 만세력으로 일주를 세웁니다.</p>
    </div>
  </article>`;

  const url = `/ilju/${e.slug}/`;
  write(url.slice(1), shell({
    rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: `${e.kor}일주(${e.han}) — ${e.alias}`,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '60일주 사전', url: SITE + '/ilju/' }, { name: `${e.kor}일주`, url: SITE + url }]),
      { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: PUBLISHED, dateModified: PUBLISHED, inLanguage: 'ko', author: { '@type': 'Organization', name: '사주첩' }, publisher: { '@type': 'Organization', name: '사주첩' }, mainEntityOfPage: SITE + url }],
    body
  }));
  urls.push(SITE + url);
});

/* 인덱스 — 일간별 6개씩 */
{
  const rel = '../';
  const groups = M.STEMS.map((st, s) => {
    const ch = C.of(st.han);
    const cells = list.filter((x) => x.s === s).map((x) => `<a href="${rel}ilju/${x.slug}/"><b>${x.han}</b><small>${x.kor}일주<br>${esc(x.alias)}</small></a>`).join('\n        ');
    return `<div class="ij-group"><h2><a href="${rel}guide/${GUIDE[s]}.html">${st.kor}${st.el}(${st.han}) 일간</a> <span class="ij-tag">${esc(ch.name)}</span></h2><div class="ij-grid">\n        ${cells}\n      </div></div>`;
  }).join('\n');
  const title = '60일주 사전 — 갑자일주부터 계해일주까지 성격·연애·궁합';
  const desc = '태어난 날의 두 글자, 일주(日柱) 60가지를 모두 풀었습니다. 일간 캐릭터와 일지의 지장간·십성·12운성으로 읽는 성격, 배우자 자리, 어울리는 일, 잘 맞는 일주와 조심할 일주.';
  const body = `
  <article class="guide-article">
    <div class="ga-overline">60일주 사전</div>
    <h1 class="ga-title">일주(日柱) 60가지 —<br>내가 태어난 날의 두 글자</h1>
    <p class="ga-meta">사주첩 서재 · 일간 10 × 일지 12의 조합 60</p>
    <p class="ga-lead">사주의 주인공은 일간이지만, 그 일간이 어떤 자리에 앉았는지가 사람의 결을 정합니다. 같은 갑목이라도 물 위(갑자)와 바위 위(갑신)는 전혀 다른 나무가 되죠. 60가지 일주를 일간별로 묶었습니다 — 내 일주를 모르면 <a href="${rel}">생일만 넣으면 10초</a>에 나옵니다.</p>
    <div class="ga-body">
      ${groups}
      <p class="callout"><a href="${rel}guide/ilgan.html">일간이란</a> · <a href="${rel}guide/jijanggan.html">지장간이란</a> · <a href="${rel}guide/sipseong.html">십성 한눈에</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>내 일주 확인하기</span></a>
    </div>
  </article>`;
  write('ilju', shell({ rel, title, desc, canonical: SITE + '/ilju/', nav: NAV(rel), extraHead: STYLE, ogTitle: '60일주 사전',
    jsonld: breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '60일주 사전', url: SITE + '/ilju/' }]), body }));
  urls.unshift(SITE + '/ilju/');
}

/* 사이트맵 + robots */
fs.writeFileSync(path.join(DOCS, 'sitemap-ilju.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u}</loc><lastmod>${PUBLISHED}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
let robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-ilju.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-ilju.xml\n');

/* 앱에서 쓸 slug 표 (일주 인덱스 순) */
fs.writeFileSync(path.join(DOCS, 'js', 'ilju-slugs.js'), '/* 60일주 사전 URL slug — tools/build-ilju.mjs 가 생성 */\nwindow.ILJU_SLUGS = ' + JSON.stringify(list.map((x) => x.slug)) + ';\n');
console.log(`60일주 사전 생성 — ${urls.length - 1}장 + 인덱스, sitemap-ilju.xml, js/ilju-slugs.js`);
