/* English Ten Gods — /en/guide/ten-gods/<slug>/ ×10 → sitemap-en-tengods.xml.
 * The hub is the existing article /en/guide/ten-gods/ (build-en-learn.mjs appends the ten links there).
 * Prose: tools/en-ten-gods.mjs; the "by Day Master" stems are verified against the engine. Usage: node tools/build-en-ten-gods.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { DAY_MASTERS } from './en-daymaster-data.mjs';
import { TEN_GODS } from './en-ten-gods.mjs';

const { M } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-15', MODIFIED = '2026-09-15';
const PY_S = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
const EL = { 목: 'Wood', 화: 'Fire', 토: 'Earth', 금: 'Metal', 수: 'Water' };
const KO = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
const NAV = (rel) => [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/today/', label: 'Today' }, { href: rel + 'en/match/', label: 'Match' }, { href: rel + 'en/zodiac/', label: 'Zodiac' }, { href: rel + 'en/guide/', label: 'Library' }];
const words = (o) => JSON.stringify(o).replace(/[^A-Za-z' ]+/g, ' ').split(/\s+/).filter(Boolean).length;

/* ---------- checks: order, completeness, by-Day-Master stems ---------- */
if (TEN_GODS.length !== 10) throw new Error('ten gods: ' + TEN_GODS.length);
TEN_GODS.forEach((g, gi) => {
  if (g.ko !== KO[gi]) throw new Error(`order: ${g.slug} should be ${KO[gi]}`);
  if (!(g.meaning.length === 3 && g.personality.length === 2 && g.faq.length === 3 && g.love && g.money && g.career && g.missing && g.excess)) throw new Error('incomplete: ' + g.slug);
  DAY_MASTERS.forEach((d, dm) => {
    const expect = M.STEMS.findIndex((_, s) => M.sipseongOf(dm, s) === g.ko);
    const got = g.byDayMaster[d.slug];
    if (!got) throw new Error(`${g.slug}: missing byDayMaster ${d.slug}`);
    if (got.stem !== M.STEMS[expect].han) throw new Error(`${g.slug} × ${d.slug}: stem ${got.stem} should be ${M.STEMS[expect].han}`);
  });
});

const STYLE = `<style>
    .tg-hero { margin: 4px 0 18px; padding: 18px 16px; background: #211C15; color: #F6F1E8; border-radius: 14px; text-align: center; }
    .tg-hero .over { font-size: 12px; letter-spacing: 0.12em; color: #B7AD9C; }
    .tg-hero .han { font-family: var(--serif); font-size: 56px; font-weight: 700; line-height: 1.05; margin: 6px 0 2px; }
    .tg-hero .sub { font-size: 14px; color: #E8DFCB; margin-top: 6px; }
    .tg-hero .rule { display: inline-block; margin-top: 10px; font-size: 12.5px; padding: 5px 12px; border-radius: 999px; background: #3A3128; color: #E8DFCB; }
    .tg-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
    .tg-table th, .tg-table td { padding: 7px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .tg-table th { font-size: 11.5px; color: var(--muted); font-weight: 500; }
    .tg-table td.han { font-family: var(--serif); font-size: 18px; white-space: nowrap; } .tg-table td.han small { display: block; font-family: var(--sans); font-size: 11px; color: var(--faint); }
    .tg-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .tg-two div { padding: 12px 14px; border: 1px solid var(--line-soft); border-radius: 10px; background: #fff; font-size: 13.5px; line-height: 1.65; }
    .tg-two b { display: block; margin-bottom: 4px; color: var(--seal); }
    .tg-nav { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-top: 10px; }
    .tg-nav a { display: block; text-align: center; padding: 8px 4px; border: 1px solid var(--line-soft); border-radius: 8px; background: #fff; text-decoration: none; color: var(--ink); font-size: 11.5px; line-height: 1.3; }
    .tg-nav a b { display: block; font-family: var(--serif); font-size: 16px; color: var(--seal); }
    .tg-nav a.cur { background: var(--ink); color: #F6F1E8; border-color: var(--ink); } .tg-nav a.cur b { color: #E8B04A; }
    @media (max-width: 480px) { .tg-two { grid-template-columns: 1fr; } .tg-hero .han { font-size: 44px; } }
  </style>`;

const urls = [];
const gUrl = (g) => `/en/guide/ten-gods/${g.slug}/`;
const article = (url, title, desc) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, image: SITE + '/og-image-en.png', datePublished: PUBLISHED, dateModified: MODIFIED, inLanguage: 'en', author: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/about/' }, publisher: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/' }, mainEntityOfPage: SITE + url });
const fitDesc = (s, tails) => { for (const t of tails) if ((s + t).length <= 155) return s + t; return s.slice(0, 152) + '…'; };

TEN_GODS.forEach((g, gi) => {
  const url = gUrl(g), rel = '../../../../';
  const pair = gi % 2 === 0 ? TEN_GODS[gi + 1] : TEN_GODS[gi - 1];
  const han1 = g.han.split(' ')[0];
  const title = `${g.name} (${han1}) in BaZi & Saju — Meaning, Love, Money, Career`;
  const short = `${g.name} (${han1}) — Ten Gods in BaZi & Saju`;
  const desc = fitDesc(`${g.name} (${g.han}, ${g.ko}) explained: ${g.rule.charAt(0).toLowerCase() + g.rule.slice(1)}.`,
    [` What it means in your chart, personality, love, money, career, and what it is for each Day Master.`, ' Meaning, personality, love, money and career.', ' Meaning and personality.']);
  const nav = `<div class="tg-nav">${TEN_GODS.map((x) => `<a href="${rel}${gUrl(x).slice(1)}"${x === g ? ' class="cur"' : ''}><b>${x.han}</b>${x.name}</a>`).join('')}</div>`;
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/guide/" style="color: inherit; text-decoration: none;">Library</a> · <a href="${rel}en/guide/ten-gods/" style="color: inherit; text-decoration: none;">Ten Gods</a> · ${gi + 1} / 10</div>
    <h1 class="ga-title">${esc(g.name)} — ${esc(g.han)}</h1>
    <div class="tg-hero">
      <div class="over">TEN GODS · 十神 · ${esc(g.pinyin.toUpperCase())}</div>
      <div class="han">${esc(g.han)}</div>
      <div class="sub">${esc(g.name)} · Korean ${esc(g.ko)} · ${esc(g.pinyin)}</div>
      <span class="rule">${esc(g.rule)}</span>
    </div>
    <p class="ga-lead">${esc(g.essence)}</p>
    ${nav}
    <div class="ga-body">
      <h2>What ${esc(g.name)} means</h2>
      ${g.meaning.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
      <h2>When ${esc(g.name)} is prominent</h2>
      ${g.personality.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
      <h2>Love</h2>
      <p>${esc(g.love)}</p>
      <h2>Money</h2>
      <p>${esc(g.money)}</p>
      <h2>Career</h2>
      <p>${esc(g.career)}</p>
      <h2>Missing, or too much</h2>
      <div class="tg-two"><div><b>No ${esc(g.name)} in the chart</b>${esc(g.missing)}</div><div><b>Three or more</b>${esc(g.excess)}</div></div>
      <h2>${esc(g.name)} for each Day Master</h2>
      <p>The same god is a different stem for each Day Master. Find your Day Master's row — the stem there is your ${esc(g.name)} wherever it appears: in your chart, in a luck pillar, or in a year.</p>
      <div style="overflow-x: auto;"><table class="tg-table"><tr><th>Day Master</th><th>Your ${esc(g.name)}</th><th>Flavour</th></tr>${DAY_MASTERS.map((d, dm) => {
        const b = g.byDayMaster[d.slug], s = M.STEMS.findIndex((x) => x.han === b.stem);
        return `<tr><td class="han"><span class="el-${M.STEMS[dm].el}">${M.STEMS[dm].han}</span><small><a href="${rel}en/guide/day-master/${d.slug}/">${esc(d.name)}</a></small></td><td class="han"><span class="el-${M.STEMS[s].el}">${b.stem}</span><small>${PY_S[s]} · ${M.STEMS[s].yang ? 'yang' : 'yin'} ${EL[M.STEMS[s].el]}</small></td><td>${esc(b.note)}</td></tr>`;
      }).join('')}</table></div>
      <h2>FAQ</h2>
      ${g.faq.map((f, i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><div class="ih-body"><p>${esc(f.a)}</p></div></details>`).join('\n      ')}
      <p class="callout">Its pair: <a href="${rel}${gUrl(pair).slice(1)}">${pair.name} (${pair.han})</a> — same element relationship, opposite polarity. · <a href="${rel}en/guide/ten-gods/">How the Ten Gods are counted</a> · <a href="${rel}en/bazi-calculator/">See the Ten Gods in your own chart</a> · <a href="${rel}guide/sipseong.html" hreflang="ko">한국어 십성</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Count the Ten Gods in my chart</span></a>
    </div>
  </article>`;
  const file = path.join(DOCS, url.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, shell({ rel, lang: 'en', title: title.length > 60 ? short : title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `${g.name} (${g.han}) — Ten Gods`, extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">`,
    jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: 'Library', url: SITE + '/en/guide/' }, { name: 'Ten Gods', url: SITE + '/en/guide/ten-gods/' }, { name: g.name, url: SITE + url }]), article(url, title, desc),
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: g.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }], body }));
  urls.push(SITE + url);
  console.log(`  ${g.slug}: ~${words(g)} words · title ${(title.length > 60 ? short : title).length} · desc ${desc.length}`);
});
fs.writeFileSync(path.join(DOCS, 'sitemap-en-tengods.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u}</loc><lastmod>${MODIFIED}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-en-tengods.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-en-tengods.xml\n');
console.log(`Ten Gods — 10 pages, sitemap-en-tengods.xml`);
