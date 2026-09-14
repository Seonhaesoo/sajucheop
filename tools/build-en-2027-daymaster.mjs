/* English "Your Day Master in 2027" — /en/2027/day-master/ (hub) + /en/2027/day-master/<slug>/ ×10 → sitemap-en-2027-dm.xml.
 * Facts (Ten Gods of the year pillar 丁未 and of the twelve solar months) come from the engine; prose from tools/en-2027-daymaster.mjs.
 * Usage: node tools/build-en-2027-daymaster.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { DAY_MASTERS } from './en-daymaster-data.mjs';
import { DM27, HUB27 } from './en-2027-daymaster.mjs';
import { publishedTime } from './solar-terms-data.mjs';

const { M, I } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-15', MODIFIED = '2026-09-15';
const YS = 3, YB = 7;   /* 2027 = 丁未 */
const PY_S = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
const PY_B = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
const EL = { 목: 'Wood', 화: 'Fire', 토: 'Earth', 금: 'Metal', 수: 'Water' };
const TG = { 비견: 'Friend', 겁재: 'Rob Wealth', 식신: 'Eating God', 상관: 'Hurting Officer', 편재: 'Indirect Wealth', 정재: 'Direct Wealth', 편관: 'Seven Killings', 정관: 'Direct Officer', 편인: 'Indirect Resource', 정인: 'Direct Resource' };
const TG_SLUG = { 비견: 'friend', 겁재: 'rob-wealth', 식신: 'eating-god', 상관: 'hurting-officer', 편재: 'indirect-wealth', 정재: 'direct-wealth', 편관: 'seven-killings', 정관: 'direct-officer', 편인: 'indirect-resource', 정인: 'direct-resource' };
const TERM = ['Li Chun', 'Jing Zhe', 'Qing Ming', 'Li Xia', 'Mang Zhong', 'Xiao Shu', 'Li Qiu', 'Bai Lu', 'Han Lu', 'Li Dong', 'Da Xue', 'Xiao Han'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const NAV = (rel) => [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/today/', label: 'Today' }, { href: rel + 'en/2027/', label: '2027' }, { href: rel + 'en/zodiac/', label: 'Zodiac' }, { href: rel + 'en/guide/', label: 'Library' }];
const iso = (c) => `${c.y}-${String(c.m).padStart(2, '0')}-${String(c.d).padStart(2, '0')}`;
const md = (c) => `${MON[c.m - 1]} ${c.d}`;
const listText = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];

function jdToKst(jd) {
  const t = jd - I.JDN_EPOCH + 0.5 + 9 / 24, dn = Math.floor(t), cv = I.civilFromDays(dn), frac = t - dn;
  let hh = Math.floor(frac * 24), mm = Math.round((frac * 24 - hh) * 60);
  if (mm === 60) { hh += 1; mm = 0; }
  return { y: cv.y, m: cv.m, d: cv.d, hh, mm };
}
const dayBefore = (c) => { const x = I.civilFromDays(I.daysFromCivil(c.y, c.m, c.d) - 1); return { y: x.y, m: x.m, d: x.d }; };
const IP27 = publishedTime(2027, 21) || jdToKst(I.ipchunJd(2027));

/* twelve solar months of 2027 */
const MONTHS = [];
{
  let jd = I.ipchunJd(2027);
  for (let i = 0; i < 12; i++) {
    if (i > 0) jd = I.findTermJd((315 + 30 * i) % 360, jd + 20, jd + 40);
    const inStem = ((YS % 5) * 2 + 2) % 10;
    const pub = publishedTime(i >= 11 ? 2028 : 2027, [21, 23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19][i]);
    MONTHS.push({ i, term: TERM[i], start: pub || jdToKst(jd), stem: (inStem + i) % 10, branch: (2 + i) % 12 });
  }
  const end = publishedTime(2028, 21) || jdToKst(I.findTermJd(315, jd + 20, jd + 40));
  MONTHS.forEach((mo, i) => { mo.end = dayBefore(i < 11 ? MONTHS[i + 1].start : end); });
}
const monthByFrom = {};
MONTHS.forEach((mo) => { monthByFrom[iso(mo.start)] = mo; });

const STYLE = `<style>
    .dm-hero { margin: 4px 0 18px; padding: 18px 16px; background: #211C15; color: #F6F1E8; border-radius: 14px; text-align: center; }
    .dm-hero .over { font-size: 12px; letter-spacing: 0.12em; color: #B7AD9C; }
    .dm-hero .han { font-family: var(--serif); font-size: 64px; font-weight: 700; line-height: 1.05; margin: 6px 0 2px; }
    .dm-hero .han small { font-size: 26px; color: #B7AD9C; margin: 0 8px; }
    .dm-hero .sub { font-size: 14px; color: #E8DFCB; margin-top: 6px; }
    .dm-hero .tg { display: inline-block; margin-top: 10px; font-size: 12.5px; padding: 5px 12px; border-radius: 999px; background: #3A3128; color: #E8DFCB; }
    .dm-list { padding-left: 18px; line-height: 1.75; } .dm-list li + li { margin-top: 6px; }
    .dm-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 12px 0 18px; }
    .dm-grid a { display: block; text-align: center; padding: 12px 4px 10px; border: 1px solid var(--line-soft); border-radius: 10px; background: #fff; text-decoration: none; color: var(--ink); }
    .dm-grid b { display: block; font-family: var(--serif); font-size: 28px; line-height: 1.1; }
    .dm-grid span { display: block; font-size: 11.5px; font-weight: 700; margin-top: 4px; }
    .dm-grid small { display: block; font-size: 10.5px; color: var(--faint); margin-top: 2px; line-height: 1.3; }
    .dm-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
    .dm-table th, .dm-table td { padding: 7px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .dm-table th { font-size: 11.5px; color: var(--muted); font-weight: 500; }
    .dm-table td.han { font-family: var(--serif); font-size: 17px; white-space: nowrap; } .dm-table td.han small { display: block; font-family: var(--sans); font-size: 11px; color: var(--faint); }
    .dm-table tr.best td { background: #EEF6EF; } .dm-table tr.care td { background: #FBECE8; }
    .dm-table td .why { display: block; font-size: 11.5px; color: var(--muted); margin-top: 2px; }
    .dm-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .dm-two div { padding: 12px 14px; border: 1px solid var(--line-soft); border-radius: 10px; background: #fff; font-size: 13.5px; line-height: 1.65; }
    .dm-two b { display: block; margin-bottom: 4px; color: var(--seal); }
    @media (max-width: 480px) { .dm-grid { grid-template-columns: repeat(5, 1fr); gap: 4px; } .dm-grid b { font-size: 22px; } .dm-grid small { display: none; } .dm-two { grid-template-columns: 1fr; } .dm-hero .han { font-size: 48px; } }
  </style>`;

const urls = [];
function write(url, html) {
  const file = path.join(DOCS, url.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  urls.push(SITE + url);
}
const article = (url, title, desc) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, image: SITE + '/og-image-en.png', datePublished: PUBLISHED, dateModified: MODIFIED, inLanguage: 'en', author: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/about/' }, publisher: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/' }, mainEntityOfPage: SITE + url });
const faqLd = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const crumbs = (items) => breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }].concat(items.map(([name, url]) => ({ name, url: SITE + url }))));
const dmUrl = (slug) => `/en/2027/day-master/${slug}/`;
const fitDesc = (s, tails) => { for (const t of tails) if ((s + t).length <= 155) return s + t; return s.slice(0, 152) + '…'; };

/* ---------- checks ---------- */
DAY_MASTERS.forEach((d) => {
  const o = DM27[d.slug];
  if (!o || o.overall.length !== 2 || !o.love || !o.money || !o.work || !o.health || !o.strong || !o.weak || o.do.length < 2 || o.dont.length < 2 || o.faq.length < 3) throw new Error('2027 copy incomplete: ' + d.slug);
  o.bestMonths.concat(o.careMonths).forEach((m) => { if (!monthByFrom[m.from]) throw new Error(`${d.slug}: unknown month date ${m.from}`); });
});

/* ---------- pages ---------- */
function dmPage(dm) {
  const d = DAY_MASTERS[dm], o = DM27[d.slug], url = dmUrl(d.slug), rel = '../../../../';
  const me = M.STEMS[dm];
  const tgStem = M.sipseongOf(dm, YS), tgBranch = M.branchSipseong(dm, YB);
  const hidden = M.JIJANGGAN[YB].map((h) => `${M.STEMS[h].han} ${PY_S[h]} — ${TG[M.sipseongOf(dm, h)]}`);
  const best = {}, care = {};
  o.bestMonths.forEach((m) => { best[m.from] = m.why; });
  o.careMonths.forEach((m) => { care[m.from] = m.why; });
  const mLabel = (mo) => `${md(mo.start)} – ${md(mo.end)}`;
  const bestList = o.bestMonths.map((m) => { const mo = monthByFrom[m.from]; return `${PY_S[mo.stem]} ${PY_B[mo.branch]} month (${mLabel(mo)})`; });
  const careList = o.careMonths.map((m) => { const mo = monthByFrom[m.from]; return `${PY_S[mo.stem]} ${PY_B[mo.branch]} month (${mLabel(mo)})`; });
  const faq = [
    [`What Ten God is 2027 for a ${d.name} Day Master?`, `The year stem 丁 Ding (yin Fire) is your ${TG[tgStem]}, and the year branch 未 Wei is ${TG[tgBranch]} through its main hidden stem 己 Ji. That pairing — ${TG[tgStem]} on top, ${TG[tgBranch]} underneath — is the shape of the whole year, and the twelve solar months colour it in.`]
  ].concat(o.faq.map((f) => [f.q, f.a]));
  const title = `${d.name} Day Master in 2027 — a ${TG[tgStem]} year`;
  const desc = fitDesc(`2027 (Ding Wei, Fire Goat) for the ${d.name} Day Master (${me.han} ${PY_S[dm]}): a ${TG[tgStem]} year over ${TG[tgBranch]} ground.`,
    [' Love, money, work, health, strong vs weak charts and the best months.', ' Love, money, work and the best months.', ' Month by month.']);
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/2027/day-master/" style="color: inherit; text-decoration: none;">2027 by Day Master</a> · ${esc(d.name)}</div>
    <h1 class="ga-title">${esc(o.headline)}</h1>
    <div class="dm-hero">
      <div class="over">2027 · 丁未 · DING WEI · FIRE GOAT</div>
      <div class="han"><span class="el-${me.el}">${me.han}</span><small>×</small>丁未</div>
      <div class="sub">${esc(d.name)} — ${esc(d.arch)} · ${me.yang ? 'yang' : 'yin'} ${EL[me.el]}</div>
      <span class="tg">Year stem 丁 = ${TG[tgStem]} · year branch 未 = ${TG[tgBranch]}</span>
    </div>
    <p class="ga-lead">${esc(o.lead)}</p>
    <div class="ga-body">
      <h2>2027 at a glance</h2>
      <ul class="dm-list">
        <li><b>The year's stem</b> 丁 Ding, yin Fire — your <a href="${rel}en/guide/ten-gods/${TG_SLUG[tgStem]}/">${TG[tgStem]}</a></li>
        <li><b>The year's branch</b> 未 Wei, Earth — ${TG[tgBranch]} by its main qi; hidden stems: ${hidden.join(' · ')}</li>
        <li><b>Year begins</b> Li Chun, ${md(IP27)} ${String(IP27.hh).padStart(2, '0')}:${String(IP27.mm).padStart(2, '0')} KST — until then it is still 2026, Bing Wu</li>
        <li><b>Months to act</b> ${esc(listText(bestList))}</li>
        <li><b>Months to take care</b> ${careList.length ? esc(listText(careList)) : 'none stands out'}</li>
      </ul>
      <h2>Overall</h2>
      ${o.overall.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
      <h2>Love</h2>
      <p>${esc(o.love)}</p>
      <h2>Money</h2>
      <p>${esc(o.money)}</p>
      <h2>Work and study</h2>
      <p>${esc(o.work)}</p>
      <h2>Health and energy</h2>
      <p>${esc(o.health)}</p>
      <h2>Strong or weak Day Master?</h2>
      <p>The same year lands differently depending on how much support your chart gives the Day Master — the <a href="${rel}en/">calculator</a> tells you which you are.</p>
      <div class="dm-two"><div><b>If your ${esc(d.name)} is strong</b>${esc(o.strong)}</div><div><b>If your ${esc(d.name)} is weak</b>${esc(o.weak)}</div></div>
      <h2>Month by month</h2>
      <p>Months are the solar-term months of the Four Pillars: each begins on a "jie" (節) term, not on the 1st. The stem's Ten God is the month's headline; the branch's is its ground.</p>
      <div style="overflow-x: auto;"><table class="dm-table"><tr><th>Month</th><th>Pillar</th><th>Stem · Ten God</th><th>Branch · Ten God</th></tr>${MONTHS.map((mo) => {
        const k = iso(mo.start), cls = best[k] ? ' class="best"' : care[k] ? ' class="care"' : '';
        const why = best[k] || care[k];
        return `<tr${cls}><td>${mLabel(mo)}<small style="display:block;color:var(--faint);">${mo.term}</small></td><td class="han">${M.STEMS[mo.stem].han}${M.BRANCHES[mo.branch].han}<small>${PY_S[mo.stem]} ${PY_B[mo.branch]}</small></td><td>${TG[M.sipseongOf(dm, mo.stem)]}${why ? `<span class="why">${esc(why)}</span>` : ''}</td><td>${TG[M.branchSipseong(dm, mo.branch)]}</td></tr>`;
      }).join('')}</table></div>
      <h2>Do and don't in 2027</h2>
      <ul class="dm-list">${o.do.map((t) => `<li><b>Do</b> — ${esc(t)}</li>`).join('')}${o.dont.map((t) => `<li><b>Don't</b> — ${esc(t)}</li>`).join('')}</ul>
      <h2>FAQ</h2>
      ${faq.map(([q, a], i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div class="ih-body"><p>${esc(a)}</p></div></details>`).join('\n      ')}
      <p class="callout">Other Day Masters in 2027: ${DAY_MASTERS.map((x, i) => i === dm ? `<b>${x.name}</b>` : `<a href="${rel}${dmUrl(x.slug).slice(1)}">${x.name}</a>`).join(' · ')}</p>
      <p class="callout"><a href="${rel}en/guide/day-master/${d.slug}/">${esc(d.name)} — the full Day Master profile</a> · <a href="${rel}en/2027/">2027 by Chinese zodiac sign</a> · <a href="${rel}en/monthly/">Monthly horoscope</a> · <a href="${rel}en/guide/ten-gods/">The Ten Gods explained</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Not sure of your Day Master? Cast your chart</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">Your Day Master is the heavenly stem of your birth day — the calculator shows it with your whole chart and your 2027 pillars.</p>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `${d.name} in 2027 — ${TG[tgStem]} year`, extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">`,
    jsonld: [crumbs([['2027 by Day Master', '/en/2027/day-master/'], [d.name, url]]), article(url, title, desc), faqLd(faq)], body }));
  return { title, desc };
}

function hub() {
  const url = '/en/2027/day-master/', rel = '../../../';
  const cells = DAY_MASTERS.map((d, i) => `<a href="${rel}${dmUrl(d.slug).slice(1)}"><b class="el-${M.STEMS[i].el}">${M.STEMS[i].han}</b><span>${esc(d.name)}</span><small>${TG[M.sipseongOf(i, YS)]} year</small></a>`).join('');
  const faq = [
    ['What is a Day Master?', 'The heavenly stem of your day pillar — one of ten (Jia, Yi, Bing, Ding, Wu, Ji, Geng, Xin, Ren, Gui), each a yin or yang version of Wood, Fire, Earth, Metal or Water. In saju and BaZi it stands for you; every other character in the chart is read by its relationship to it.'],
    ['Why read 2027 by Day Master instead of zodiac sign?', 'Your zodiac animal is one character, the year branch, shared with everyone born in the same year. The Day Master is chosen by your birth day, so it splits the year twelve times more finely and it is the axis the Ten Gods are counted from — the 2027 stem 丁 is a different god for each of the ten.'],
    ['How do I find my Day Master?', 'Enter your birth date in the calculator: the stem shown on the Day pillar is your Day Master. Birth time is not needed for it — the day pillar changes at midnight.'],
    [`When does 2027 start?`, `At Li Chun, ${md(IP27)} 2027 ${String(IP27.hh).padStart(2, '0')}:${String(IP27.mm).padStart(2, '0')} KST (${String((IP27.hh + 15) % 24).padStart(2, '0')}:${String(IP27.mm).padStart(2, '0')} UTC the day before). Until that moment the year pillar is still 丙午 Bing Wu.`]
  ];
  const title = '2027 Horoscope by Day Master — All Ten Stems in the Fire Goat Year';
  const desc = 'What 2027 (Ding Wei, Fire Goat) brings to each of the ten Day Masters: the Ten God the year plays for you, love, money, work, the months to act and the months to take care.';
  const body = `
  <article class="guide-article">
    <div class="ga-overline">2027 · 丁未 · Fire Goat</div>
    <h1 class="ga-title">2027 by Day Master</h1>
    <p class="ga-lead">${esc(HUB27.lead[0])}</p>
    <div class="dm-grid">${cells}</div>
    <div class="ga-body">
      <p>${esc(HUB27.lead[1])}</p>
      <h2>How to read these pages</h2>
      <p>${esc(HUB27.howRead)}</p>
      <h2>The year pillar, god by god</h2>
      <div style="overflow-x: auto;"><table class="dm-table"><tr><th>Day Master</th><th>丁 Ding, the year stem</th><th>未 Wei, the year branch</th></tr>${DAY_MASTERS.map((d, i) => `<tr><td class="han"><span class="el-${M.STEMS[i].el}">${M.STEMS[i].han}</span><small>${esc(d.name)}</small></td><td><a href="${rel}${dmUrl(d.slug).slice(1)}">${TG[M.sipseongOf(i, YS)]}</a></td><td>${TG[M.branchSipseong(i, YB)]}</td></tr>`).join('')}</table></div>
      <h2>FAQ</h2>
      ${faq.map(([q, a], i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div class="ih-body"><p>${esc(a)}</p></div></details>`).join('\n      ')}
      <p class="callout"><a href="${rel}en/2027/">2027 by zodiac sign</a> · <a href="${rel}en/monthly/">Month by month</a> · <a href="${rel}en/guide/day-master/">The ten Day Masters</a> · <a href="${rel}en/guide/ten-gods/">The Ten Gods</a> · <a href="${rel}2027/" hreflang="ko">한국어 2027 운세</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Find my Day Master</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'en', title: title.length > 60 ? '2027 Horoscope by Day Master — Fire Goat Year' : title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: '2027 by Day Master', extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">`,
    jsonld: [crumbs([['2027 by Day Master', url]]), article(url, title, desc), faqLd(faq)], body }));
}

const out = DAY_MASTERS.map((_, i) => dmPage(i));
hub();
fs.writeFileSync(path.join(DOCS, 'sitemap-en-2027-dm.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u}</loc><lastmod>${MODIFIED}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-en-2027-dm.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-en-2027-dm.xml\n');
console.log(`2027 by Day Master — 10 pages + hub, sitemap-en-2027-dm.xml; titles>60: ${out.filter((o) => o.title.length > 60).length}, descs>155: ${out.filter((o) => o.desc.length > 155).length}`);
