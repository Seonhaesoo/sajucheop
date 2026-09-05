/* English library — /en/guide/ index + /en/guide/day-master/<slug>/ (10 Day Masters)
 * Content from tools/en-daymaster-data.mjs; hreflang pairs with the Korean 일간 사전 articles.
 * Usage: node tools/build-en-guide.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { DAY_MASTERS } from './en-daymaster-data.mjs';

const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-05';
const NAV = (rel) => [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/today/', label: 'Today' }, { href: rel + 'en/match/', label: 'Match' }, { href: rel, label: '한국어' }];
const STYLE = `<style>
    .dm-han { font-family: 'Noto Serif KR', serif; font-size: 56px; font-weight: 700; color: var(--seal); line-height: 1; margin: 6px 0 12px; }
    .dm-meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 6px; }
    .dm-meta span { font-size: 12px; padding: 3px 9px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); }
    .dm-list { list-style: none; padding: 0; margin: 6px 0 0; }
    .dm-list li { padding: 9px 0; border-bottom: 1px solid var(--line-soft); font-size: 14px; line-height: 1.6; }
    .dm-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 8px 0 18px; }
    .dm-grid a { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; text-decoration: none; color: inherit; }
    .dm-grid a i { font-style: normal; font-family: 'Noto Serif KR', serif; font-size: 22px; color: var(--seal); flex: none; }
    .dm-grid a b { display: block; font-size: 13.5px; }
    .dm-grid a small { display: block; font-size: 11px; color: var(--faint); }
    .dm-grid a.cur { border-color: var(--seal); background: #FBF3E6; }
    .dm-tag { font-size: 11px; padding: 1px 7px; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); margin-left: 6px; vertical-align: 1px; }
  </style>`;

function write(relPath, html) {
  const file = path.join(DOCS, relPath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
const urls = [];
const dmUrl = (d) => `/en/guide/day-master/${d.slug}/`;

DAY_MASTERS.forEach((d, i) => {
  const rel = '../../../../';
  const prev = DAY_MASTERS[(i + 9) % 10], next = DAY_MASTERS[(i + 1) % 10];
  const title = `${d.name} Day Master (${d.han}) — ${d.arch}: personality, love, work and chemistry`;
  const desc = `${d.arch}: what a ${d.name} Day Master is like in Korean Saju — strengths, watch-outs, love and work, who they combine and clash with, and how strong or weak charts differ.`;
  const others = DAY_MASTERS.map((x) => `<a href="${rel}en/guide/day-master/${x.slug}/"${x === d ? ' class="cur"' : ''}><i>${x.han}</i><span><b>${x.arch}</b><small>${x.name}</small></span></a>`).join('\n        ');
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/guide/" style="color: inherit; text-decoration: none;">Day Master library</a> · ${i + 1} / 10</div>
    <div class="dm-han">${d.han}</div>
    <h1 class="ga-title">${d.name} Day Master —<br>${esc(d.arch)}</h1>
    <div class="dm-meta">${d.keywords.map((k) => `<span>${esc(k)}</span>`).join('')}</div>
    <p class="ga-meta">Sajucheop library · ${esc(d.tagline)}</p>
    <p class="ga-lead">${esc(d.essence)}</p>

    <div class="ga-body">
      <h2>Who you are</h2>
      <p>${esc(d.who)}</p>

      <h2>Strengths</h2>
      <ul class="dm-list">${d.strengths.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <h2>Watch out for</h2>
      <ul class="dm-list">${d.cautions.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>

      <h2>In love</h2>
      <p>${esc(d.love)}</p>

      <h2>At work</h2>
      <p>${esc(d.work)}</p>

      <h2>Chemistry — who you combine and clash with</h2>
      <p><b>Combines with <a href="${rel}en/guide/day-master/${DAY_MASTERS.find((x) => x.name === d.combine.with).slug}/">${d.combine.with} — ${d.combine.arch}</a>.</b> ${esc(d.combine.line)}</p>
      ${d.clash ? `<p><b>Clashes with <a href="${rel}en/guide/day-master/${DAY_MASTERS.find((x) => x.name === d.clash.with).slug}/">${d.clash.with} — ${d.clash.arch}</a>.</b> ${esc(d.clash.line)}</p>` : `<p><b>No stem clash.</b> Earth Day Masters sit at the center of the cycle and clash with no one — the ${d.arch} is the mediator of the ten.</p>`}
      <p>Two Day Masters are only the first line of a compatibility reading. Put in both birth dates and the <a href="${rel}en/match/">match page</a> adds what you are to each other in the Ten Gods and whether your elements fill each other\'s gaps.</p>

      <h2>Strong, balanced or weak?</h2>
      <p>The same Day Master reads differently depending on how well it is supported by the other seven characters.</p>
      <ul class="dm-list">
        <li><b>Strong</b> — ${esc(d.strong)}</li>
        <li><b>Balanced</b> — ${esc(d.balanced)}</li>
        <li><b>Weak</b> — ${esc(d.weak)}</li>
      </ul>

      <h2>The other nine</h2>
      <div class="dm-grid">
        ${others}
      </div>

      <p class="callout">← <a href="${rel}en/guide/day-master/${prev.slug}/">${prev.arch}</a> · <a href="${rel}en/guide/day-master/${next.slug}/">${next.arch}</a> → · <a href="${rel}guide/${d.koGuide}.html" hreflang="ko">한국어로 읽기</a></p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Find out if you are ${d.arch.replace('The ', 'a ')}</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">Birth date in, ten seconds out. Computed with a precise Korean calendar — no account, nothing stored.</p>
    </div>
  </article>`;
  const url = dmUrl(d);
  write(url.slice(1), shell({
    rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `${d.name} Day Master — ${d.arch}`,
    extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">\n  <link rel="alternate" hreflang="ko" href="${SITE}/guide/${d.koGuide}.html">`,
    jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: 'Library', url: SITE + '/en/guide/' }, { name: d.arch, url: SITE + url }]),
      { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: PUBLISHED, dateModified: PUBLISHED, inLanguage: 'en', author: { '@type': 'Organization', name: 'Sajucheop' }, publisher: { '@type': 'Organization', name: 'Sajucheop' }, mainEntityOfPage: SITE + url }],
    body
  }));
  urls.push(SITE + url);
});

/* Index */
{
  const rel = '../../';
  const cards = DAY_MASTERS.map((d) => `<a href="${rel}en/guide/day-master/${d.slug}/"><i>${d.han}</i><span><b>${d.arch}</b><small>${d.name} · ${esc(d.tagline)}</small></span></a>`).join('\n        ');
  const title = 'Saju Library — the ten Day Masters of Korean Four Pillars';
  const desc = 'Ten archetypes, one for each Day Master: the Tall Pine, the Midday Sun, the Morning Dew and more. Personality, love, work, chemistry and how strong or weak charts differ.';
  const body = `
  <article class="guide-article">
    <div class="ga-overline">Library</div>
    <h1 class="ga-title">The ten Day Masters —<br>which nature are you?</h1>
    <p class="ga-meta">Sajucheop library · Korean Four Pillars in plain English</p>
    <p class="ga-lead">Your Saju chart has eight characters and only one of them is you: the Day Master, the sky character of your birth day. There are ten. Each is a nature — a tree, a sun, a mountain, the dew — and each reads the world differently. Find yours in the list, or <a href="${rel}en/">enter your birth date</a> and let the chart tell you.</p>
    <div class="ga-body">
      <div class="dm-grid">
        ${cards}
      </div>
      <h2>How to read these</h2>
      <p>Each article describes the pure nature first, then how it behaves in love and at work, who it combines with (합) and clashes with (충), and how the reading shifts when the Day Master is strongly or weakly supported by the rest of the chart. Treat it as a mirror, not a verdict — the chart describes weather, and what you do in it has always been yours.</p>
      <h2>Go one level deeper</h2>
      <p>Your Day Master sits on one of twelve branches, and that seat changes everything. The <a href="${rel}en/guide/day-pillar/">60 Day Pillars</a> — Jia Zi to Gui Hai — read each combination: hidden stems, spouse seat, twelve-stage, and the pillars you match best with. The <a href="${rel}en/guide/compatibility/">Day Master compatibility table</a> covers all 100 pairings.</p>
      <p class="callout"><a href="${rel}en/today/">Today\'s energy</a> · <a href="${rel}en/match/">Compatibility</a> · <a href="${rel}guide/" hreflang="ko">한국어 서재</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Find my Day Master</span></a>
    </div>
  </article>`;
  write('en/guide', shell({ rel, lang: 'en', title, desc, canonical: SITE + '/en/guide/', nav: NAV(rel), ogTitle: 'Saju Library — the ten Day Masters', extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}/en/guide/">\n  <link rel="alternate" hreflang="ko" href="${SITE}/guide/">`,
    jsonld: breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: 'Library', url: SITE + '/en/guide/' }]), body }));
  urls.unshift(SITE + '/en/guide/');
}

fs.writeFileSync(path.join(DOCS, 'sitemap-en.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u}</loc><lastmod>${PUBLISHED}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-en.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-en.xml\n');
console.log(`English library — ${urls.length - 1} Day Master pages + index, sitemap-en.xml`);
