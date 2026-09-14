/* English "Your Day Pillar in 2027" — /en/2027/day-pillar/ (hub) + /en/2027/day-pillar/<pinyin>/ ×60 → sitemap-en-2027-pillars.xml.
 * Facts from the engine (Ten Gods of 丁未, day-branch relations with 未, twelve stages, solar months); prose from tools/en-2027-pillars-a/b.mjs.
 * Pairs with the Korean /2027/ilju/<slug>/ pages (hreflang). Usage: node tools/build-en-2027-pillars.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { ILJU } from './ilju-data.mjs';
import { ILJU_EN, STAGE_EN } from './en-ilju-data.mjs';
import { DAY_MASTERS } from './en-daymaster-data.mjs';
import { relations } from './ddi-data.mjs';
import { publishedTime } from './solar-terms-data.mjs';
import { PILLARS27 as PA } from './en-2027-pillars-a.mjs';
import { PILLARS27 as PB } from './en-2027-pillars-b.mjs';

const { M, I } = loadEngine();
const PILLARS27 = Object.assign({}, PA, PB);
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-15', MODIFIED = '2026-09-15';
const YS = 3, YB = 7;
const PY_S = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
const PY_B = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
const TG = { 비견: 'Friend', 겁재: 'Rob Wealth', 식신: 'Eating God', 상관: 'Hurting Officer', 편재: 'Indirect Wealth', 정재: 'Direct Wealth', 편관: 'Seven Killings', 정관: 'Direct Officer', 편인: 'Indirect Resource', 정인: 'Direct Resource' };
const TG_SLUG = { 비견: 'friend', 겁재: 'rob-wealth', 식신: 'eating-god', 상관: 'hurting-officer', 편재: 'indirect-wealth', 정재: 'direct-wealth', 편관: 'seven-killings', 정관: 'direct-officer', 편인: 'indirect-resource', 정인: 'direct-resource' };
const REL = { same: ['Same branch (伏吟)', 'neutral'], yukhap: ['Six Harmony 六合', 'good'], samhap: ['Trine 三合', 'good'], banghap: ['Seasonal trio 方合', 'good'], chung: ['Clash 冲', 'bad'], hyeong: ['Punishment 刑', 'bad'], hae: ['Harm 害', 'bad'], pa: ['Break 破', 'bad'], wonjin: ['Wonjin 怨嗔', 'bad'] };
const STAGES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
const BIRTH = { 0: 11, 2: 2, 4: 2, 6: 5, 8: 8, 1: 6, 3: 9, 5: 9, 7: 0, 9: 3 };
const stageOf = (s, b) => STAGES[s % 2 === 0 ? (b - BIRTH[s] + 12) % 12 : (BIRTH[s] - b + 12) % 12];
const stageName = (ko) => (STAGE_EN[ko] && STAGE_EN[ko].name) || ko;
const STAGE_SLUG = { 장생: 'birth', 목욕: 'bath', 관대: 'cap-and-belt', 건록: 'official', 제왕: 'prosperity', 쇠: 'decline', 병: 'sickness', 사: 'death', 묘: 'grave', 절: 'extinction', 태: 'conception', 양: 'nurture' };
const TERM = ['Li Chun', 'Jing Zhe', 'Qing Ming', 'Li Xia', 'Mang Zhong', 'Xiao Shu', 'Li Qiu', 'Bai Lu', 'Han Lu', 'Li Dong', 'Da Xue', 'Xiao Han'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const NAV = (rel) => [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/today/', label: 'Today' }, { href: rel + 'en/2027/', label: '2027' }, { href: rel + 'en/zodiac/', label: 'Zodiac' }, { href: rel + 'en/guide/', label: 'Library' }];
const md = (c) => `${MON[c.m - 1]} ${c.d}`;
const listText = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const fitDesc = (s, tails) => { for (const t of tails) if ((s + t).length <= 155) return s + t; return s.slice(0, 152) + '…'; };

function jdToKst(jd) { const t = jd - I.JDN_EPOCH + 0.5 + 9 / 24, dn = Math.floor(t), cv = I.civilFromDays(dn), frac = t - dn; let hh = Math.floor(frac * 24), mm = Math.round((frac * 24 - hh) * 60); if (mm === 60) { hh += 1; mm = 0; } return { y: cv.y, m: cv.m, d: cv.d, hh, mm }; }
const dayBefore = (c) => { const x = I.civilFromDays(I.daysFromCivil(c.y, c.m, c.d) - 1); return { y: x.y, m: x.m, d: x.d }; };
const IP27 = publishedTime(2027, 21) || jdToKst(I.ipchunJd(2027));
const MONTHS = [];
{
  let jd = I.ipchunJd(2027);
  for (let i = 0; i < 12; i++) { if (i > 0) jd = I.findTermJd((315 + 30 * i) % 360, jd + 20, jd + 40); const pub = publishedTime(i >= 11 ? 2028 : 2027, [21, 23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19][i]); MONTHS.push({ i, term: TERM[i], start: pub || jdToKst(jd), stem: (((YS % 5) * 2 + 2) % 10 + i) % 10, branch: (2 + i) % 12 }); }
  const end = publishedTime(2028, 21) || jdToKst(I.findTermJd(315, jd + 20, jd + 40));
  MONTHS.forEach((mo, i) => { mo.end = dayBefore(i < 11 ? MONTHS[i + 1].start : end); });
}
const primary = (rels) => rels.find((r) => r !== 'same') || rels[0] || null;

/* ---------- checks ---------- */
const pillars = ILJU.map((e, i) => ({ i, s: i % 10, b: i % 12, ko: e, en: ILJU_EN[i] }));
pillars.forEach((p) => {
  if (M.STEMS[p.s].han + M.BRANCHES[p.b].han !== p.ko.han) throw new Error('pillar order mismatch at ' + p.i);
  const o = PILLARS27[p.en.slug];
  if (!o || o.overall.length !== 2 || !o.love || !o.money || !o.work || !o.home || o.do.length < 2 || o.dont.length < 2 || o.faq.length < 2) throw new Error('2027 pillar copy incomplete: ' + p.en.slug);
});

const STYLE = `<style>
    .pl-hero { margin: 4px 0 18px; padding: 18px 16px; background: #211C15; color: #F6F1E8; border-radius: 14px; text-align: center; }
    .pl-hero .over { font-size: 12px; letter-spacing: 0.12em; color: #B7AD9C; }
    .pl-hero .han { font-family: var(--serif); font-size: 60px; font-weight: 700; line-height: 1.05; margin: 6px 0 2px; }
    .pl-hero .han small { font-size: 24px; color: #B7AD9C; margin: 0 8px; }
    .pl-hero .sub { font-size: 14px; color: #E8DFCB; margin-top: 6px; }
    .pl-badges { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 10px; }
    .pl-badge { font-size: 12px; padding: 4px 10px; border-radius: 999px; background: #3A3128; color: #E8DFCB; }
    .pl-badge.good { background: #2F5D3F; } .pl-badge.bad { background: #7A2E24; }
    .pl-list { padding-left: 18px; line-height: 1.75; } .pl-list li + li { margin-top: 6px; }
    .pl-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
    .pl-table th, .pl-table td { padding: 7px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .pl-table th { font-size: 11.5px; color: var(--muted); font-weight: 500; }
    .pl-table td.han { font-family: var(--serif); font-size: 17px; white-space: nowrap; } .pl-table td.han small { display: block; font-family: var(--sans); font-size: 11px; color: var(--faint); }
    .pl-table tr.good td { background: #EEF6EF; } .pl-table tr.bad td { background: #FBECE8; }
    .pl-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin: 12px 0 18px; }
    .pl-grid a { display: block; text-align: center; padding: 8px 2px 6px; border: 1px solid var(--line-soft); border-radius: 8px; background: #fff; text-decoration: none; color: var(--ink); font-size: 10.5px; line-height: 1.3; }
    .pl-grid a b { display: block; font-family: var(--serif); font-size: 18px; }
    .pl-grid a small { display: block; color: var(--faint); font-size: 9.5px; }
    @media (max-width: 480px) { .pl-grid { grid-template-columns: repeat(5, 1fr); gap: 4px; } .pl-hero .han { font-size: 46px; } }
  </style>`;

const urls = [];
const pUrl = (p) => `/en/2027/day-pillar/${p.en.slug}/`;
const article = (url, title, desc) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, image: SITE + '/og-image-en.png', datePublished: PUBLISHED, dateModified: MODIFIED, inLanguage: 'en', author: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/about/' }, publisher: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/' }, mainEntityOfPage: SITE + url });
const faqLd = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
function write(url, html) { const file = path.join(DOCS, url.slice(1), 'index.html'); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, html); urls.push(SITE + url); }

pillars.forEach((p) => {
  const o = PILLARS27[p.en.slug], url = pUrl(p), rel = '../../../../';
  const py = `${PY_S[p.s]} ${PY_B[p.b]}`, han = p.ko.han, dm = DAY_MASTERS[p.s];
  const tgStem = M.sipseongOf(p.s, YS), tgBranch = M.branchSipseong(p.s, YB);
  const rels = relations(p.b, YB), stageAtWei = stageOf(p.s, YB), selfStage = p.ko.un;
  const months = MONTHS.map((mo) => { const r = relations(p.b, mo.branch); const tone = r.some((k) => ['yukhap', 'samhap', 'banghap'].includes(k)) ? 'good' : r.some((k) => ['chung', 'hyeong', 'hae', 'pa', 'wonjin'].includes(k)) ? 'bad' : ''; return { mo, r, tone }; });
  const mLabel = (m) => `${PY_S[m.mo.stem]} ${PY_B[m.mo.branch]} month (${md(m.mo.start)} – ${md(m.mo.end)})`;
  const good = months.filter((m) => m.tone === 'good'), bad = months.filter((m) => m.tone === 'bad');
  const prev = pillars[(p.i + 59) % 60], next = pillars[(p.i + 1) % 60];
  const faq = o.faq.map((f) => [f.q, f.a]).concat([[`What is 2027 for a ${py} day pillar, in Ten Gods?`, `The year stem 丁 Ding is your ${TG[tgStem]} and the year branch 未 Wei is ${TG[tgBranch]} through its main qi 己 Ji. Your day branch ${M.BRANCHES[p.b].han} ${PY_B[p.b]} meets 未 as ${rels.length ? listText(rels.map((k) => REL[k][0])) : 'a neutral pairing'}, and your Day Master stands in ${stageName(stageAtWei)} on 未.`]]);
  const title = `${py} (${han}) in 2027 — ${TG[tgStem]} Year for This Day Pillar`;
  const short = `${py} (${han}) Day Pillar in 2027 — ${TG[tgStem]} Year`;
  const desc = fitDesc(`2027 (Ding Wei, Fire Goat) for the ${py} day pillar, "${p.en.alias}": a ${TG[tgStem]} year, day branch ${PY_B[p.b]} ${rels.length ? 'in ' + REL[primary(rels)][0].split(' ')[0].toLowerCase() : 'neutral'} with 未.`, [' Love, money, work, home, and the months to act.', ' Love, money, work and the months to act.', '']);
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/2027/day-pillar/" style="color: inherit; text-decoration: none;">2027 by day pillar</a> · ${p.i + 1} / 60</div>
    <h1 class="ga-title">${esc(o.headline)}</h1>
    <div class="pl-hero">
      <div class="over">2027 · 丁未 · DING WEI · FIRE GOAT</div>
      <div class="han"><span class="el-${M.STEMS[p.s].el}">${M.STEMS[p.s].han}</span><span class="el-${M.BRANCHES[p.b].el}">${M.BRANCHES[p.b].han}</span><small>×</small>丁未</div>
      <div class="sub">${py} — “${esc(p.en.alias)}” · Day Master ${esc(dm.name)}</div>
      <div class="pl-badges"><span class="pl-badge">丁 = ${TG[tgStem]}</span><span class="pl-badge">未 = ${TG[tgBranch]}</span>${rels.length ? rels.map((k) => `<span class="pl-badge ${REL[k][1]}">${REL[k][0]}</span>`).join('') : '<span class="pl-badge">no fixed link with 未</span>'}<span class="pl-badge">${stageName(stageAtWei)} on 未</span></div>
    </div>
    <p class="ga-lead">${esc(o.overall[0].split('. ')[0])}.</p>
    <div class="ga-body">
      <h2>2027 at a glance</h2>
      <ul class="pl-list">
        <li><b>Year stem</b> 丁 Ding, yin Fire — your <a href="${rel}en/guide/ten-gods/${TG_SLUG[tgStem]}/">${TG[tgStem]}</a></li>
        <li><b>Year branch</b> 未 Wei, Earth — ${TG[tgBranch]} by its main qi (hidden ${M.JIJANGGAN[YB].map((h) => M.STEMS[h].han + ' ' + TG[M.sipseongOf(p.s, h)]).join(', ')})</li>
        <li><b>Your day branch ${M.BRANCHES[p.b].han} ${PY_B[p.b]} and 未</b> ${rels.length ? listText(rels.map((k) => REL[k][0])) : 'no fixed relation — a neutral year at home'}</li>
        <li><b>Your Day Master on 未</b> <a href="${rel}en/guide/twelve-stages/${STAGE_SLUG[stageAtWei]}/">${stageName(stageAtWei)}</a> · your day pillar itself sits in <a href="${rel}en/guide/twelve-stages/${STAGE_SLUG[selfStage]}/">${stageName(selfStage)}</a></li>
        <li><b>Months to act</b> ${good.length ? esc(listText(good.map(mLabel))) : 'no harmony month stands out — an even year'}</li>
        <li><b>Months to take care</b> ${bad.length ? esc(listText(bad.map(mLabel))) : 'no clashing months'}</li>
        <li><b>Year begins</b> Li Chun, ${md(IP27)} 2027 ${String(IP27.hh).padStart(2, '0')}:${String(IP27.mm).padStart(2, '0')} KST</li>
      </ul>
      <h2>Overall</h2>
      ${o.overall.map((t) => `<p>${esc(t)}</p>`).join('\n      ')}
      <h2>Love</h2>
      <p>${esc(o.love)}</p>
      <h2>Money</h2>
      <p>${esc(o.money)}</p>
      <h2>Work and study</h2>
      <p>${esc(o.work)}</p>
      <h2>Home, partner and body</h2>
      <p>${esc(o.home)}</p>
      <h2>Month by month</h2>
      <p>Solar-term months of 2027 — each begins on a “jie” term. Green rows harmonise with your day branch; red rows clash or rub against it.</p>
      <div style="overflow-x: auto;"><table class="pl-table"><tr><th>Month</th><th>Pillar</th><th>Stem · Ten God</th><th>Branch · Ten God</th><th>With ${M.BRANCHES[p.b].han}</th></tr>${months.map((m) => `<tr${m.tone ? ` class="${m.tone}"` : ''}><td>${md(m.mo.start)} – ${md(m.mo.end)}<small style="display:block;color:var(--faint);">${m.mo.term}</small></td><td class="han">${M.STEMS[m.mo.stem].han}${M.BRANCHES[m.mo.branch].han}<small>${PY_S[m.mo.stem]} ${PY_B[m.mo.branch]}</small></td><td>${TG[M.sipseongOf(p.s, m.mo.stem)]}</td><td>${TG[M.branchSipseong(p.s, m.mo.branch)]}</td><td>${m.r.length ? m.r.map((k) => REL[k][0].split(' ')[0]).join(', ') : '—'}</td></tr>`).join('')}</table></div>
      <h2>Do and don't in 2027</h2>
      <ul class="pl-list">${o.do.map((t) => `<li><b>Do</b> — ${esc(t)}</li>`).join('')}${o.dont.map((t) => `<li><b>Don't</b> — ${esc(t)}</li>`).join('')}</ul>
      <h2>FAQ</h2>
      ${faq.map(([q, a], i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div class="ih-body"><p>${esc(a)}</p></div></details>`).join('\n      ')}
      <p class="callout">← <a href="${rel}${pUrl(prev).slice(1)}">${PY_S[prev.s]} ${PY_B[prev.b]}</a> · <a href="${rel}${pUrl(next).slice(1)}">${PY_S[next.s]} ${PY_B[next.b]}</a> → · <a href="${rel}en/2027/day-pillar/">All sixty in 2027</a> · <a href="${rel}en/guide/day-pillar/${p.en.slug}/">${py} — the day pillar profile</a> · <a href="${rel}en/2027/day-master/${dm.slug}/">${esc(dm.name)} Day Master in 2027</a> · <a href="${rel}2027/ilju/${p.ko.slug}/" hreflang="ko">한국어</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Not sure of your day pillar? Cast your chart</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'en', title: title.length > 60 ? short : title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `${py} in 2027 — ${TG[tgStem]} year`,
    extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">\n  <link rel="alternate" hreflang="ko" href="${SITE}/2027/ilju/${p.ko.slug}/">`,
    jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: '2027 by day pillar', url: SITE + '/en/2027/day-pillar/' }, { name: py, url: SITE + url }]), article(url, title, desc), faqLd(faq)], body }));
});

/* hub */
{
  const url = '/en/2027/day-pillar/', rel = '../../../';
  const cells = pillars.map((p) => `<a href="${rel}${pUrl(p).slice(1)}"><b><span class="el-${M.STEMS[p.s].el}">${M.STEMS[p.s].han}</span><span class="el-${M.BRANCHES[p.b].el}">${M.BRANCHES[p.b].han}</span></b>${PY_S[p.s]} ${PY_B[p.b]}<small>${TG[M.sipseongOf(p.s, YS)]}</small></a>`).join('');
  const faq = [
    ['What is a day pillar?', 'The stem and branch of your birth day — one of sixty pairs (Jia Zi to Gui Hai). The stem is your Day Master; the branch is the spouse palace and your inner ground. Together they are the single most personal unit of a Four Pillars chart.'],
    ['How is this different from the Day Master pages?', 'The Day Master pages read 2027 from the stem alone (ten readings). These sixty pages add the day branch: how 未 Wei, the year branch, meets your own branch — harmony, clash, punishment or nothing — and which twelve-stage your Day Master reaches on it.'],
    ['How do I find my day pillar?', 'Enter your birth date in the calculator; the Day column shows it (birth time is not needed for it). Each page here also links to the full profile of that pillar.']
  ];
  const title = '2027 Horoscope by Day Pillar — All Sixty Pillars in the Fire Goat Year';
  const desc = 'What 2027 (Ding Wei, Fire Goat) brings to each of the sixty day pillars: the Ten God the year plays, how 未 meets your day branch, the twelve-stage, and the months to act or take care.';
  const body = `
  <article class="guide-article">
    <div class="ga-overline">2027 · 丁未 · Fire Goat</div>
    <h1 class="ga-title">2027 by day pillar</h1>
    <p class="ga-lead">Sixty readings, one per day pillar. Each starts from the same year — 丁 Ding over 未 Wei — and asks two questions your zodiac sign cannot: what Ten God this year is to your Day Master, and how the year's branch meets the branch you were born on.</p>
    <div class="ga-body">
      <p>Find your pillar below (the calculator shows it in the Day column). The badge under each pillar is the Ten God that 丁 Ding plays for its Day Master — the headline of the year. The page itself adds the day-branch relation, the twelve-stage on 未, and the twelve solar months.</p>
      <div class="pl-grid">${cells}</div>
      <h2>FAQ</h2>
      ${faq.map(([q, a], i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div class="ih-body"><p>${esc(a)}</p></div></details>`).join('\n      ')}
      <p class="callout"><a href="${rel}en/2027/day-master/">2027 by Day Master</a> · <a href="${rel}en/2027/">2027 by zodiac sign</a> · <a href="${rel}en/guide/day-pillar/">The sixty day pillars</a> · <a href="${rel}en/monthly/">Month by month</a> · <a href="${rel}2027/ilju/" hreflang="ko">한국어 60일주 2027</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Find my day pillar</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'en', title: '2027 Horoscope by Day Pillar — Sixty Pillars, Fire Goat Year', desc, canonical: SITE + url, nav: NAV(rel), ogTitle: '2027 by day pillar', extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">\n  <link rel="alternate" hreflang="ko" href="${SITE}/2027/ilju/">`,
    jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: '2027 by day pillar', url: SITE + url }]), article(url, title, desc), faqLd(faq)], body }));
}
fs.writeFileSync(path.join(DOCS, 'sitemap-en-2027-pillars.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u}</loc><lastmod>${MODIFIED}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-en-2027-pillars.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-en-2027-pillars.xml\n');
console.log(`2027 by day pillar — 60 pages + hub, sitemap-en-2027-pillars.xml`);
