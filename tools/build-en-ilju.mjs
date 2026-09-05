/* English 60 Day Pillars — /en/guide/day-pillar/<pinyin>/ ×60 + index, sitemap-en-pillars.xml
 * Text from tools/en-ilju-data.mjs; hidden stems, Ten Gods and pillar-to-pillar compatibility from the engine
 * (same weights as the Korean 60일주 사전). hreflang pairs each page with /ilju/<ko-slug>/. */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { ILJU } from './ilju-data.mjs';
import { ILJU_EN, STEM_PINYIN, STEM_KOR_RR, STEM_EN, BRANCH_PINYIN, BRANCH_KOR_RR, BRANCH_ANIMAL, BRANCH_EL, TEN_GOD_EN, STAGE_EN, SPOUSE_EN } from './en-ilju-data.mjs';
import { DAY_MASTERS } from './en-daymaster-data.mjs';

const { M } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-06';
const STEM_HAP = { 0: 5, 5: 0, 1: 6, 6: 1, 2: 7, 7: 2, 3: 8, 8: 3, 4: 9, 9: 4 };
const STEM_CHUNG = { 0: 6, 6: 0, 1: 7, 7: 1, 2: 8, 8: 2, 3: 9, 9: 3 };
const GEN = M.elCycle.gen;

const list = ILJU_EN.map((e, i) => Object.assign({}, e, { i, s: i % 10, b: i % 12, ko: ILJU[i] }));
if (list.length !== 60) throw new Error('need 60 entries, got ' + list.length);
list.forEach((e) => { if (e.slug !== (STEM_PINYIN[e.s] + '-' + BRANCH_PINYIN[e.b]).toLowerCase()) throw new Error('slug mismatch at ' + e.i + ': ' + e.slug); });

const han = (e) => M.STEMS[e.s].han + M.BRANCHES[e.b].han;
const pinyin = (e) => STEM_PINYIN[e.s] + ' ' + BRANCH_PINYIN[e.b];
const korRR = (e) => STEM_KOR_RR[e.s] + BRANCH_KOR_RR[e.b].toLowerCase();
const nature = (e) => STEM_EN[e.s] + ' on ' + BRANCH_ANIMAL[e.b];
const tg = (sip) => TEN_GOD_EN[sip];

function pairScore(a, b) {
  let s = 0;
  const sa = M.STEMS[a.s], sb = M.STEMS[b.s];
  if (STEM_HAP[a.s] === b.s) s += 18; else if (STEM_CHUNG[a.s] === b.s) s -= 12;
  else if (GEN[sa.el] === sb.el || GEN[sb.el] === sa.el) s += 10; else if (sa.el === sb.el) s += 4; else s -= 6;
  const br = M.branchRelation(a.b, b.b);
  if (br === '육합') s += 14; else if (br === '삼합') s += 10; else if (br === '동일') s += 4; else if (br === '충') s -= 14;
  if (sa.yang !== sb.yang) s += 4;
  return s;
}
function relWord(a, b) {
  const p = [];
  if (STEM_HAP[a.s] === b.s) p.push('stems combine'); else if (STEM_CHUNG[a.s] === b.s) p.push('stems clash');
  else if (GEN[M.STEMS[a.s].el] === M.STEMS[b.s].el) p.push('you feed them'); else if (GEN[M.STEMS[b.s].el] === M.STEMS[a.s].el) p.push('they feed you');
  const br = M.branchRelation(a.b, b.b);
  if (br === '육합') p.push('branches in six-harmony'); else if (br === '삼합') p.push('branches in trine'); else if (br === '충') p.push('branches clash');
  return p.join(' · ') || 'neutral';
}

const STYLE = `<style>
    .dp-han { font-family: 'Noto Serif KR', serif; font-size: 48px; font-weight: 700; letter-spacing: 0.08em; color: var(--seal); line-height: 1; margin: 6px 0 12px; }
    .dp-meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 6px; }
    .dp-meta span { font-size: 12px; padding: 3px 9px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); }
    .dp-meta span b { color: var(--ink); font-weight: 600; }
    .dp-list { list-style: none; padding: 0; margin: 6px 0 0; }
    .dp-list li { padding: 9px 0; border-bottom: 1px solid var(--line-soft); font-size: 14px; line-height: 1.6; }
    .dp-list li a { text-decoration: none; }
    .dp-tag { font-size: 11px; padding: 1px 7px; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); margin-left: 6px; vertical-align: 1px; }
    .dp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 8px 0 18px; }
    .dp-grid a { display: block; padding: 10px 8px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; text-decoration: none; color: inherit; text-align: center; }
    .dp-grid a b { display: block; font-family: 'Noto Serif KR', serif; font-size: 16px; }
    .dp-grid a small { display: block; font-size: 11px; color: var(--faint); margin-top: 3px; line-height: 1.4; }
    .dp-grid a.cur { border-color: var(--seal); background: #FBF3E6; }
    .dp-group { margin-top: 22px; }
    .dp-group h2 a { text-decoration: none; }
  </style>`;
const NAV = (rel) => [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/guide/', label: 'Library' }, { href: rel + 'en/match/', label: 'Match' }, { href: rel, label: '한국어' }];

function write(relPath, html) {
  const file = path.join(DOCS, relPath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
const urls = [];
const urlOf = (e) => `/en/guide/day-pillar/${e.slug}/`;

list.forEach((e) => {
  const rel = '../../../../';
  const st = M.STEMS[e.s], dm = DAY_MASTERS[e.s];
  const hidden = M.JIJANGGAN[e.b];
  const mainSip = M.branchSipseong(e.s, e.b);
  const hiddenHtml = hidden.map((h, k) => {
    const g = tg(M.sipseongOf(e.s, h));
    return `<b>${STEM_EN[h]} (${M.STEMS[h].han}, ${STEM_PINYIN[h]})</b> — ${g.name}${k === hidden.length - 1 ? ' <span class="dp-tag">main qi</span>' : ''}`;
  }).join('<br>');
  const siblings = list.filter((x) => x.s === e.s);
  const prev = list[(e.i + 59) % 60], next = list[(e.i + 1) % 60];
  const scored = list.filter((x) => x !== e).map((x) => ({ x, sc: pairScore(e, x) })).sort((p, q) => q.sc - p.sc);
  const best = scored.slice(0, 5), worst = scored.slice(-3).reverse();
  const fmt = ({ x }) => `<li><b><a href="${rel}en/guide/day-pillar/${x.slug}/">${pinyin(x)} (${han(x)})</a></b> <span class="dp-tag">${relWord(e, x)}</span> — ${esc(x.alias)}</li>`;
  const stage = STAGE_EN[e.un];
  const g = tg(mainSip);

  const title = `${pinyin(e)} Day Pillar (${han(e)}, ${korRR(e)}) — ${e.alias}: personality, love, work, compatibility`;
  const desc = `${pinyin(e)} (${han(e)}) is ${nature(e)} — a ${STEM_EN[e.s]} Day Master sitting on the ${BRANCH_ANIMAL[e.b]}. Day Branch: ${g.name} (${g.alt}). Twelve-stage: ${stage.name}. ${e.core.split('. ')[0]}. Best and worst matching pillars.`;

  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/guide/day-pillar/" style="color: inherit; text-decoration: none;">60 Day Pillars</a> · ${e.i + 1} / 60</div>
    <div class="dp-han">${han(e)}</div>
    <h1 class="ga-title">${pinyin(e)} Day Pillar —<br>${esc(e.alias)}</h1>
    <div class="dp-meta">
      <span>Korean <b>${korRR(e)}</b> (${e.ko.kor})</span><span><b>${nature(e)}</b></span><span>Day Branch <b>${g.name}</b></span><span>Stage <b>${stage.name}</b></span>
    </div>
    <p class="ga-meta">Day Master <a href="${rel}en/guide/day-master/${dm.slug}/">${dm.arch}</a> (${STEM_EN[e.s]}) · Day Branch ${BRANCH_ANIMAL[e.b]} (${BRANCH_EL[e.b]})</p>
    <p class="ga-lead">${esc(e.core.split('. ')[0])}.</p>

    <div class="ga-body">
      <h2>Who you are</h2>
      <p>${esc(e.core)}</p>
      <p>The Day Master is the "you" of the chart — here, <a href="${rel}en/guide/day-master/${dm.slug}/">${dm.arch}</a>: ${esc(dm.essence)} What gives ${pinyin(e)} its own color is the room the ${BRANCH_ANIMAL[e.b]} beneath it offers.</p>

      <h2>What the ${BRANCH_ANIMAL[e.b]} branch says</h2>
      <p>The Day Branch is your inner room and your spouse seat. The ${BRANCH_ANIMAL[e.b]} (${M.BRANCHES[e.b].han}, ${BRANCH_PINYIN[e.b]}) carries ${hidden.length} hidden stems:</p>
      <p>${hiddenHtml}</p>
      <p>${esc(SPOUSE_EN[mainSip])}</p>
      <p>${esc(stage.line)}</p>

      <h2>In love</h2>
      <p>${esc(e.love)}</p>

      <h2>At work</h2>
      <p>${esc(e.work)}</p>

      <h2>Best matching Day Pillars</h2>
      <p>Chosen by stem combinations, the feeding cycle and branch harmonies — a day-pillar-only reading, so treat it as a first look. Two full birth dates on the <a href="${rel}en/match/">match page</a> add the Ten Gods between you and your element complement.</p>
      <ul class="dp-list">
        ${best.map(fmt).join('\n        ')}
      </ul>
      <h2>Pillars to handle with care</h2>
      <ul class="dp-list">
        ${worst.map(fmt).join('\n        ')}
      </ul>

      <h2>One line to keep</h2>
      <p><b>${esc(e.advice)}</b></p>

      <h2>The six ${STEM_EN[e.s]} pillars</h2>
      <div class="dp-grid">
        ${siblings.map((x) => `<a href="${rel}en/guide/day-pillar/${x.slug}/"${x === e ? ' class="cur"' : ''}><b>${han(x)}</b><small>${pinyin(x)}<br>${esc(x.alias)}</small></a>`).join('\n        ')}
      </div>

      <p class="callout">← <a href="${rel}en/guide/day-pillar/${prev.slug}/">${pinyin(prev)}</a> · <a href="${rel}en/guide/day-pillar/${next.slug}/">${pinyin(next)}</a> → · <a href="${rel}en/guide/day-pillar/">all 60</a> · <a href="${rel}ilju/${e.ko.slug}/" hreflang="ko">한국어로 읽기</a></p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Find out if your Day Pillar is ${pinyin(e)}</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">Birth date in, ten seconds out — computed with a precise Korean calendar, nothing stored.</p>
    </div>
  </article>`;

  const url = urlOf(e);
  write(url.slice(1), shell({
    rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `${pinyin(e)} Day Pillar (${han(e)}) — ${e.alias}`,
    extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">\n  <link rel="alternate" hreflang="ko" href="${SITE}/ilju/${e.ko.slug}/">`,
    jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: 'Library', url: SITE + '/en/guide/' }, { name: '60 Day Pillars', url: SITE + '/en/guide/day-pillar/' }, { name: pinyin(e), url: SITE + url }]),
      { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: PUBLISHED, dateModified: PUBLISHED, inLanguage: 'en', author: { '@type': 'Organization', name: 'Sajucheop' }, publisher: { '@type': 'Organization', name: 'Sajucheop' }, mainEntityOfPage: SITE + url }],
    body
  }));
  urls.push(SITE + url);
});

/* Index — grouped by Day Master */
{
  const rel = '../../../';
  const groups = M.STEMS.map((st, s) => {
    const dm = DAY_MASTERS[s];
    const cells = list.filter((x) => x.s === s).map((x) => `<a href="${rel}en/guide/day-pillar/${x.slug}/"><b>${han(x)}</b><small>${pinyin(x)}<br>${esc(x.alias)}</small></a>`).join('\n        ');
    return `<div class="dp-group"><h2><a href="${rel}en/guide/day-master/${dm.slug}/">${STEM_EN[s]} (${st.han}, ${STEM_PINYIN[s]})</a> <span class="dp-tag">${esc(dm.arch)}</span></h2><div class="dp-grid">\n        ${cells}\n      </div></div>`;
  }).join('\n');
  const title = 'The 60 Day Pillars — Jia Zi to Gui Hai: personality, love and compatibility';
  const desc = 'All sixty day pillars of the Four Pillars (BaZi / Saju), one page each: the Day Master\'s nature, the hidden stems and Ten God of the Day Branch, the twelve life stage, love, work, and the best and worst matching pillars. With Chinese pinyin and Korean names.';
  const body = `
  <article class="guide-article">
    <div class="ga-overline">60 Day Pillars</div>
    <h1 class="ga-title">The sixty Day Pillars —<br>the two characters of your birth day</h1>
    <p class="ga-meta">Sajucheop library · 10 Day Masters × 12 branches · pinyin, hanja and Korean names</p>
    <p class="ga-lead">The Day Master is the main character of your chart, but the seat it sits on decides its character. The same Yang Wood becomes a different tree over a spring (Jia Zi) and on a rocky peak (Jia Shen). Sixty pillars, grouped by Day Master — don\'t know yours? <a href="${rel}en/">Enter your birth date</a> and the chart tells you in ten seconds.</p>
    <div class="ga-body">
      ${groups}
      <p class="callout"><a href="${rel}en/guide/">The ten Day Masters</a> · <a href="${rel}en/match/">Compatibility</a> · <a href="${rel}ilju/" hreflang="ko">한국어 60일주 사전</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Find my Day Pillar</span></a>
    </div>
  </article>`;
  write('en/guide/day-pillar', shell({ rel, lang: 'en', title, desc, canonical: SITE + '/en/guide/day-pillar/', nav: NAV(rel), ogTitle: 'The 60 Day Pillars',
    extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}/en/guide/day-pillar/">\n  <link rel="alternate" hreflang="ko" href="${SITE}/ilju/">`,
    jsonld: breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: 'Library', url: SITE + '/en/guide/' }, { name: '60 Day Pillars', url: SITE + '/en/guide/day-pillar/' }]), body }));
  urls.unshift(SITE + '/en/guide/day-pillar/');
}

fs.writeFileSync(path.join(DOCS, 'sitemap-en-pillars.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u}</loc><lastmod>${PUBLISHED}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-en-pillars.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-en-pillars.xml\n');
/* slug table for the EN chart page */
fs.writeFileSync(path.join(DOCS, 'js', 'en-pillar-slugs.js'), '/* EN day-pillar slugs by 60갑자 index — tools/build-en-ilju.mjs */\nwindow.EN_PILLAR_SLUGS = ' + JSON.stringify(list.map((x) => x.slug)) + ';\nwindow.EN_PILLAR_ALIAS = ' + JSON.stringify(list.map((x) => x.alias)) + ';\n');
console.log(`EN day pillars — ${urls.length - 1} pages + index, sitemap-en-pillars.xml, js/en-pillar-slugs.js`);
