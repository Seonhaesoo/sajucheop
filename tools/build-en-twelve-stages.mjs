/* English Twelve Life Stages (12운성 十二運星) — /en/guide/twelve-stages/ (hub) + /en/guide/twelve-stages/<slug>/ ×12 → sitemap-en-stages.xml.
 * Tables are computed (birth branch per stem, yang forward / yin backward); prose from tools/en-twelve-stages.mjs. Usage: node tools/build-en-twelve-stages.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { DAY_MASTERS } from './en-daymaster-data.mjs';
import { ILJU_EN } from './en-ilju-data.mjs';
import { STAGES, STAGES_INTRO } from './en-twelve-stages.mjs';

const { M } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-15', MODIFIED = '2026-09-15';
const PY_S = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
const PY_B = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
const KO_STAGES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
const BIRTH = { 0: 11, 2: 2, 4: 2, 6: 5, 8: 8, 1: 6, 3: 9, 5: 9, 7: 0, 9: 3 };
const stageIdx = (s, b) => (s % 2 === 0 ? (b - BIRTH[s] + 12) % 12 : (BIRTH[s] - b + 12) % 12);
const NAV = (rel) => [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/today/', label: 'Today' }, { href: rel + 'en/match/', label: 'Match' }, { href: rel + 'en/zodiac/', label: 'Zodiac' }, { href: rel + 'en/guide/', label: 'Library' }];

if (STAGES.length !== 12) throw new Error('stages: ' + STAGES.length);
STAGES.forEach((s, i) => { if (s.ko !== KO_STAGES[i]) throw new Error(`order: ${s.slug} should be ${KO_STAGES[i]}`); if (!(s.meaning.length === 3 && s.personality.length === 2 && s.faq.length === 3 && s.byPillar && s.byPillar.hour && s.luck)) throw new Error('incomplete: ' + s.slug); });
/* cross-check with the Korean day-pillar data (ilju-data un field) via ILJU_EN order = 60 pillars */
for (let i = 0; i < 60; i++) { const s = i % 10, b = i % 12; if (KO_STAGES[stageIdx(s, b)] !== ILJU_EN[i].un) throw new Error(`stage mismatch at pillar ${i}: ${KO_STAGES[stageIdx(s, b)]} vs ${ILJU_EN[i].un}`); }

const STYLE = `<style>
    .st-hero { margin: 4px 0 18px; padding: 18px 16px; background: #211C15; color: #F6F1E8; border-radius: 14px; text-align: center; }
    .st-hero .over { font-size: 12px; letter-spacing: 0.12em; color: #B7AD9C; }
    .st-hero .han { font-family: var(--serif); font-size: 56px; font-weight: 700; line-height: 1.05; margin: 6px 0 2px; }
    .st-hero .sub { font-size: 14px; color: #E8DFCB; margin-top: 6px; }
    .st-nav { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin-top: 10px; }
    .st-nav a { display: block; text-align: center; padding: 8px 2px; border: 1px solid var(--line-soft); border-radius: 8px; background: #fff; text-decoration: none; color: var(--ink); font-size: 11px; line-height: 1.3; }
    .st-nav a b { display: block; font-family: var(--serif); font-size: 16px; color: var(--seal); }
    .st-nav a.cur { background: var(--ink); color: #F6F1E8; border-color: var(--ink); } .st-nav a.cur b { color: #E8B04A; }
    .st-table { width: 100%; border-collapse: collapse; font-size: 12.5px; margin-top: 8px; }
    .st-table th, .st-table td { padding: 6px 5px; border-bottom: 1px solid var(--line-soft); text-align: center; vertical-align: top; }
    .st-table th { font-size: 11px; color: var(--muted); font-weight: 500; }
    .st-table td.han, .st-table th.han { font-family: var(--serif); font-size: 16px; white-space: nowrap; } .st-table td.han small { display: block; font-family: var(--sans); font-size: 10.5px; color: var(--faint); }
    .st-table td.hit { background: #FBF3E6; font-weight: 700; }
    .st-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .st-two div { padding: 12px 14px; border: 1px solid var(--line-soft); border-radius: 10px; background: #fff; font-size: 13.5px; line-height: 1.65; }
    .st-two b { display: block; margin-bottom: 4px; color: var(--seal); }
    .st-pillars a { display: inline-block; margin: 4px 6px 0 0; padding: 4px 9px; border: 1px solid var(--line-soft); border-radius: 999px; font-family: var(--serif); font-size: 14px; text-decoration: none; color: var(--ink); background: #fff; }
    @media (max-width: 480px) { .st-two { grid-template-columns: 1fr; } .st-hero .han { font-size: 44px; } .st-nav { grid-template-columns: repeat(4, 1fr); } }
  </style>`;

const urls = [];
const sUrl = (s) => `/en/guide/twelve-stages/${s.slug}/`;
const article = (url, title, desc) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, image: SITE + '/og-image-en.png', datePublished: PUBLISHED, dateModified: MODIFIED, inLanguage: 'en', author: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/about/' }, publisher: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/' }, mainEntityOfPage: SITE + url });
const faqLd = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
const fitDesc = (s, tails) => { for (const t of tails) if ((s + t).length <= 155) return s + t; return s.slice(0, 152) + '…'; };
function write(url, html) { const file = path.join(DOCS, url.slice(1), 'index.html'); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, html); urls.push(SITE + url); }
const navHtml = (rel, cur) => `<div class="st-nav">${STAGES.map((x) => `<a href="${rel}${sUrl(x).slice(1)}"${x === cur ? ' class="cur"' : ''}><b>${x.han}</b>${x.name}</a>`).join('')}</div>`;
const fullTable = (rel, hi) => `<div style="overflow-x: auto;"><table class="st-table"><tr><th>Day Master</th>${M.BRANCHES.map((b, bi) => `<th class="han">${b.han}<br><small style="font-family: var(--sans); font-size: 10px; color: var(--faint);">${PY_B[bi]}</small></th>`).join('')}</tr>${DAY_MASTERS.map((d, s) => `<tr><td class="han"><a href="${rel}en/guide/day-master/${d.slug}/" style="text-decoration: none;"><span class="el-${M.STEMS[s].el}">${M.STEMS[s].han}</span></a><small>${PY_S[s]}</small></td>${M.BRANCHES.map((b, bi) => { const st = STAGES[stageIdx(s, bi)]; return `<td${hi && st === hi ? ' class="hit"' : ''}><a href="${rel}${sUrl(st).slice(1)}" style="text-decoration: none; color: inherit;">${st.name}</a></td>`; }).join('')}</tr>`).join('')}</table></div>`;

STAGES.forEach((st, si) => {
  const url = sUrl(st), rel = '../../../../';
  const sitting = [];
  for (let i = 0; i < 60; i++) if (stageIdx(i % 10, i % 12) === si) sitting.push(i);
  const byDm = DAY_MASTERS.map((d, s) => { const b = M.BRANCHES.findIndex((_, bi) => stageIdx(s, bi) === si); return { d, s, b }; });
  const title = `${st.name} (${st.han}) — Twelve Life Stages of Saju and BaZi`;
  const short = `${st.name} (${st.han}) — Twelve Life Stages Explained`;
  const desc = fitDesc(`${st.name} (${st.han}, ${st.ko}${st.alt ? ', also ' + st.alt : ''}): ${st.essence}`, [' What it means on each branch, in your day pillar, and in a luck pillar or year.', ' Meaning in the chart and in luck pillars.', '']);
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/guide/" style="color: inherit; text-decoration: none;">Library</a> · <a href="${rel}en/guide/twelve-stages/" style="color: inherit; text-decoration: none;">Twelve Life Stages</a> · ${si + 1} / 12</div>
    <h1 class="ga-title">${esc(st.name)} — ${esc(st.han)}</h1>
    <div class="st-hero">
      <div class="over">TWELVE LIFE STAGES · 十二運星 · ${esc(st.pinyin.toUpperCase())}</div>
      <div class="han">${esc(st.han)}</div>
      <div class="sub">${esc(st.name)} · Korean ${esc(st.ko)} · ${esc(st.pinyin)}${st.alt ? ' · also “' + esc(st.alt) + '”' : ''}</div>
    </div>
    <p class="ga-lead">${esc(st.essence)}</p>
    ${navHtml(rel, st)}
    <div class="ga-body">
      <h2>What ${esc(st.name)} means</h2>
      ${st.meaning.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
      <h2>Which branch is ${esc(st.name)} for you</h2>
      <p>Each Day Master reaches ${esc(st.name)} on one branch. Find your Day Master; wherever that branch appears in your chart — year, month, day or hour — that pillar is in ${esc(st.name)}.</p>
      <div style="overflow-x: auto;"><table class="st-table"><tr><th>Day Master</th><th>${esc(st.name)} branch</th><th>Day pillar sitting on it</th></tr>${byDm.map(({ d, s, b }) => { const own = sitting.filter((i) => i % 10 === s).map((i) => `<a href="${rel}en/guide/day-pillar/${ILJU_EN[i].slug}/">${M.STEMS[i % 10].han}${M.BRANCHES[i % 12].han}</a>`); return `<tr><td class="han"><span class="el-${M.STEMS[s].el}">${M.STEMS[s].han}</span><small><a href="${rel}en/guide/day-master/${d.slug}/">${esc(d.name)}</a></small></td><td class="han"><span class="el-${M.BRANCHES[b].el}">${M.BRANCHES[b].han}</span><small>${PY_B[b]}</small></td><td>${own.length ? own.join(' ') : '—'}</td></tr>`; }).join('')}</table></div>
      <h2>Personality when it sits under you</h2>
      ${st.personality.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
      <h2>In each pillar</h2>
      <div class="st-two"><div><b>Year branch</b>${esc(st.byPillar.year)}</div><div><b>Month branch</b>${esc(st.byPillar.month)}</div><div><b>Day branch</b>${esc(st.byPillar.day)}</div><div><b>Hour branch</b>${esc(st.byPillar.hour)}</div></div>
      <h2>In a luck pillar or a year</h2>
      <p>${esc(st.luck)}</p>
      <h2>Day pillars in ${esc(st.name)}</h2>
      <p class="st-pillars">${sitting.map((i) => `<a href="${rel}en/guide/day-pillar/${ILJU_EN[i].slug}/">${M.STEMS[i % 10].han}${M.BRANCHES[i % 12].han} ${PY_S[i % 10]} ${PY_B[i % 12]}</a>`).join('')}</p>
      <h2>FAQ</h2>
      ${st.faq.map((f, i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><div class="ih-body"><p>${esc(f.a)}</p></div></details>`).join('\n      ')}
      <p class="callout"><a href="${rel}en/guide/twelve-stages/">All twelve stages and the full table</a> · <a href="${rel}en/guide/day-pillar/">60 Day Pillars</a> · <a href="${rel}en/guide/luck-pillars/">Luck Pillars explained</a> · <a href="${rel}guide/sibi-unseong.html" hreflang="ko">한국어 12운성</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>See the stages in my own chart</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'en', title: title.length > 60 ? short : title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `${st.name} (${st.han}) — Twelve Life Stages`, extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">`,
    jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: 'Library', url: SITE + '/en/guide/' }, { name: 'Twelve Life Stages', url: SITE + '/en/guide/twelve-stages/' }, { name: st.name, url: SITE + url }]), article(url, title, desc), faqLd(st.faq)], body }));
});

/* hub */
{
  const url = '/en/guide/twelve-stages/', rel = '../../../';
  const title = 'Twelve Life Stages (十二運星) in Saju and BaZi — Full Table';
  const desc = 'The twelve life stages from Birth to Nurture: what each says about a Day Master on a branch, how to find yours, and the complete table for all ten stems.';
  const faq = [
    { q: 'What are the Twelve Life Stages?', a: 'A cycle that describes how strong a heavenly stem is on each of the twelve branches, drawn as a life: Birth, Bath, Cap and Belt, Official, Prosperity, Decline, Sickness, Death, Grave, Extinction, Conception and Nurture. Readers use it for the day pillar, the month branch and luck pillars.' },
    { q: 'Which stage is my day pillar?', a: 'Take your Day Master (the day stem) and your day branch and read the table: the cell where they meet is the stage your day pillar sits on. The calculator shows your day pillar, and every sixty-pillar page names its stage.' },
    { q: 'Are Death, Sickness and Grave bad?', a: 'No. They describe how the Day Master’s energy behaves on that branch — inward, quiet, storing — not events. Many focused, scholarly and patient charts sit on exactly those stages.' }
  ];
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/guide/" style="color: inherit; text-decoration: none;">Library</a> · Twelve Life Stages</div>
    <h1 class="ga-title">Twelve Life Stages — 十二運星</h1>
    <p class="ga-lead">${esc(STAGES_INTRO.lead[0])}</p>
    ${navHtml(rel, null)}
    <div class="ga-body">
      <p>${esc(STAGES_INTRO.lead[1])}</p>
      <h2>How to read the stages</h2>
      <p>${esc(STAGES_INTRO.howToRead)}</p>
      <h2>The full table</h2>
      <p>${esc(STAGES_INTRO.tableNote)}</p>
      ${fullTable(rel, null)}
      <h2>The twelve, in order</h2>
      <ul class="zd-list" style="padding-left: 18px; line-height: 1.75;">${STAGES.map((s) => `<li><a href="${rel}${sUrl(s).slice(1)}"><b>${s.name}</b> ${s.han}</a> — ${esc(s.essence)}</li>`).join('')}</ul>
      <h2>FAQ</h2>
      ${faq.map((f, i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><div class="ih-body"><p>${esc(f.a)}</p></div></details>`).join('\n      ')}
      <p class="callout"><a href="${rel}en/guide/day-pillar/">60 Day Pillars</a> · <a href="${rel}en/guide/day-master/">The ten Day Masters</a> · <a href="${rel}en/guide/luck-pillars/">Luck Pillars</a> · <a href="${rel}guide/sibi-unseong.html" hreflang="ko">한국어 12운성</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Find my day pillar’s stage</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'en', title: title.length > 60 ? 'Twelve Life Stages (十二運星) — Saju & BaZi Table' : title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: 'Twelve Life Stages — full table', extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">`,
    jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: 'Library', url: SITE + '/en/guide/' }, { name: 'Twelve Life Stages', url: SITE + url }]), article(url, title, desc), faqLd(faq)], body }));
}
fs.writeFileSync(path.join(DOCS, 'sitemap-en-stages.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u}</loc><lastmod>${MODIFIED}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-en-stages.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-en-stages.xml\n');
console.log(`Twelve stages — 12 pages + hub, sitemap-en-stages.xml`);
