/* English day pages — /en/day/YYYY-MM-DD/ (this year + next) + /en/day/ index + sitemap-pages-en.xml
 * "What day is it in the Four Pillars?" — the day pillar in pinyin / Korean / English, the Korean lunar date,
 * solar terms, and one line for each of the ten Day Masters. Deterministic output; runs daily with build-pages. */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, kstToday, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { STEM_PINYIN, STEM_EN, BRANCH_PINYIN, BRANCH_ANIMAL, TEN_GOD_EN } from './en-ilju-data.mjs';
import { DAY_MASTERS } from './en-daymaster-data.mjs';

const { M, I, Lunar } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const today = kstToday();
const Y0 = today.y, Y1 = today.y + 1;
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const TERM_EN = ['Spring Equinox', 'Clear and Bright (Qingming)', 'Grain Rain', 'Start of Summer', 'Grain Buds', 'Grain in Ear', 'Summer Solstice', 'Minor Heat', 'Major Heat', 'Start of Autumn', 'End of Heat', 'White Dew', 'Autumn Equinox', 'Cold Dew', 'Frost Descent', 'Start of Winter', 'Minor Snow', 'Major Snow', 'Winter Solstice', 'Minor Cold', 'Major Cold', 'Start of Spring (Ipchun)', 'Rain Water', 'Awakening of Insects'];
const TERM_KO = ['春分', '清明', '穀雨', '立夏', '小滿', '芒種', '夏至', '小暑', '大暑', '立秋', '處暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒', '立春', '雨水', '驚蟄'];
const TERM_APPROX = [[3, 20], [4, 5], [4, 20], [5, 5], [5, 21], [6, 6], [6, 21], [7, 7], [7, 23], [8, 7], [8, 23], [9, 8], [9, 23], [10, 8], [10, 23], [11, 7], [11, 22], [12, 7], [12, 22], [1, 5], [1, 20], [2, 4], [2, 19], [3, 5]];
const IS_JIE = new Set([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]);   /* 절 — month pillar changes */
const STEM_HAP = { 0: 5, 5: 0, 1: 6, 6: 1, 2: 7, 7: 2, 3: 8, 8: 3, 4: 9, 9: 4 };
const STEM_CHUNG = { 0: 6, 6: 0, 1: 7, 7: 1, 2: 8, 8: 2, 3: 9, 9: 3 };
const TG_LINE = {
  '비견': 'a day of kindred energy — push at your own pace, and trim the stubbornness by an inch.',
  '겁재': 'a competitive day — drive rises, but money and promises get split. Delay big spending.',
  '식신': 'a day of ease and expression — good things come from your words and hands.',
  '상관': 'a flashy day — ideas run ahead of you. Speak a beat later in front of superiors.',
  '편재': 'the board gets bigger — opportunity and spending arrive together. Enjoy, count twice.',
  '정재': 'a practical day — numbers and plans line up. Finish the accounting you postponed.',
  '편관': 'a day of pressure — tasks pile up and you stand on a testing ground. Firm, not forced.',
  '정관': 'a day of structure — duty and rules are your strength. Good for official settings and documents.',
  '편인': 'a day for thinking — study, research and time alone pay off. Decide tomorrow.',
  '정인': 'a day with a shelter — learn, organize, handle documents. An elder\'s advice is the answer.'
};

function midnightJd(y, m, d) { return I.daysFromCivil(y, m, d) + I.JDN_EPOCH - 0.5 - 9 / 24; }
function weekday(y, m, d) { return ((I.daysFromCivil(y, m, d) + 4) % 7 + 7) % 7; }
const termCache = {};
function yearTerms(y) {
  if (termCache[y]) return termCache[y];
  termCache[y] = TERM_APPROX.map((ap, i) => {
    const approx = midnightJd(y, ap[0], ap[1]);
    const jd = I.findTermJd(i * 15, approx - 6, approx + 6);
    const tk = jd - I.JDN_EPOCH + 0.5 + 9 / 24;
    const dn = Math.floor(tk), cv = I.civilFromDays(dn);
    let hh = Math.floor((tk - dn) * 24), mm = Math.round(((tk - dn) * 24 - hh) * 60);
    if (mm === 60) { hh += 1; mm = 0; }
    return { i, name: TERM_EN[i], han: TERM_KO[i], y: cv.y, m: cv.m, d: cv.d, hh, mm, jd, jie: IS_JIE.has(i) };
  });
  return termCache[y];
}
function termsOn(y, m, d) { return yearTerms(y).filter((t) => t.m === m && t.d === d); }
function nextTermAfter(y, m, d) {
  const dn = I.daysFromCivil(y, m, d);
  return yearTerms(y).concat(yearTerms(y + 1)).filter((t) => I.daysFromCivil(t.y, t.m, t.d) > dn).sort((a, b) => a.jd - b.jd)[0];
}
function lunarOf(y, m, d) {
  if (!Lunar || !Lunar.setSolarDate(y, m, d)) return null;
  const l = Lunar.getLunarCalendar();
  return { m: l.month, d: l.day, leap: !!(l.intercalation || l.isLeap || l.leap || l.leapMonth) };
}
const pinyin = (s, b) => STEM_PINYIN[s] + ' ' + BRANCH_PINYIN[b];
const enName = (s, b) => STEM_EN[s] + ' ' + BRANCH_ANIMAL[b];
const han = (s, b) => M.STEMS[s].han + M.BRANCHES[b].han;

const STYLE = `<style>
    .dp-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 6px 0 4px; }
    .dp-table th, .dp-table td { padding: 8px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .dp-table th { font-weight: 500; color: var(--faint); font-size: 12px; }
    .dp-han { font-family: 'Noto Serif KR', serif; }
    .dp-list { list-style: none; padding: 0; margin: 6px 0 0; }
    .dp-list li { padding: 9px 0; border-bottom: 1px solid var(--line-soft); font-size: 13.5px; line-height: 1.6; }
    .dp-tag { font-size: 11px; padding: 1px 7px; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); margin-left: 6px; vertical-align: 1px; }
    .dp-tag.hap { color: var(--seal); border-color: var(--seal); }
    .dp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin: 8px 0 14px; }
    .dp-grid a, .dp-grid span { display: block; text-align: center; padding: 8px 0 6px; border-radius: 8px; background: #FFFDF9; border: 1px solid var(--line-soft); text-decoration: none; color: inherit; font-size: 13px; }
    .dp-grid a small { display: block; font-size: 9px; color: var(--faint); margin-top: 2px; }
    .dp-grid a.today { border-color: var(--seal); background: #FBF3E6; }
    .dp-grid .wd { background: transparent; border: none; color: var(--faint); font-size: 11px; padding: 0; }
  </style>`;
const NAV = (rel) => [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/today/', label: 'Today' }, { href: rel + 'en/guide/', label: 'Library' }, { href: rel, label: '한국어' }];
function write(relPath, html) {
  const file = path.join(DOCS, relPath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
const urls = [];

function dayInfo(y, m, d) {
  const p = M.dayPillarOf(y, m, d);
  const r = M.compute({ year: y, month: m, day: d, hour: 12, minute: 0, unknownTime: true, gender: 'M', applySolarTime: false });
  return { y, m, d, w: weekday(y, m, d), s: p.stem, b: p.branch, yp: r.pillars.year, mp: r.pillars.month, lun: lunarOf(y, m, d), terms: termsOn(y, m, d) };
}

function buildDay(x) {
  const rel = '../../../';
  const { y, m, d, s, b } = x;
  const dm = DAY_MASTERS[s];
  const pv = I.civilFromDays(I.daysFromCivil(y, m, d) - 1), nx = I.civilFromDays(I.daysFromCivil(y, m, d) + 1);
  const pvP = M.dayPillarOf(pv.y, pv.m, pv.d), nxP = M.dayPillarOf(nx.y, nx.m, nx.d);
  const dateEn = `${MON[m - 1]} ${d}, ${y}`;
  const title = `${dateEn} — ${pinyin(s, b)} Day (${han(s, b)}, ${enName(s, b)}): today\'s day pillar`;
  const desc = `The day pillar for ${WD[x.w]}, ${dateEn} is ${pinyin(s, b)} (${han(s, b)}) — ${enName(s, b)}. Korean lunar ${x.lun ? (x.lun.leap ? 'leap ' : '') + x.lun.m + '/' + x.lun.d : ''}. What this day means for each of the ten Day Masters, plus clashes, harmonies and solar terms.`;
  const rows = M.STEMS.map((st, i) => {
    const sip = M.sipseongOf(i, s);
    const tag = i === STEM_HAP[s] ? '<span class="dp-tag hap">gentlest today</span>' : (STEM_CHUNG[s] !== undefined && i === STEM_CHUNG[s]) ? '<span class="dp-tag">slower lane</span>' : '';
    return `<li><b>${STEM_EN[i]}</b> <span class="dp-han">(${st.han})</span> <span class="dp-tag">${TEN_GOD_EN[sip].name}</span>${tag}<br>${dm && TG_LINE[sip] ? esc(TG_LINE[sip]) : ''}</li>`;
  }).join('\n        ');
  const clashB = M.BRANCHES.map((_, i) => i).filter((i) => M.branchRelation(b, i) === '충').map((i) => BRANCH_ANIMAL[i]);
  const harmB = M.BRANCHES.map((_, i) => i).filter((i) => M.branchRelation(b, i) === '육합').map((i) => BRANCH_ANIMAL[i]);
  let termHtml;
  if (x.terms.length) {
    termHtml = x.terms.map((t) => `<b>${t.name}</b> (${t.han}) arrives today at <b>${pad(t.hh)}:${pad(t.mm)}</b> KST${t.jie ? ' — from that minute the Month Pillar changes' : ''}.`).join(' ');
  } else {
    const nt = nextTermAfter(y, m, d);
    termHtml = nt ? `Next solar term: <b>${nt.name}</b> (${nt.han}), ${MON[nt.m - 1]} ${nt.d} at ${pad(nt.hh)}:${pad(nt.mm)} KST.` : '';
  }
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/day/" style="color: inherit; text-decoration: none;">Day pillar calendar</a> · ${MON[m - 1]} ${y}</div>
    <h1 class="ga-title">${WD[x.w]}, ${dateEn} —<br><span class="dp-han">${han(s, b)}</span> ${pinyin(s, b)} Day</h1>
    <p class="ga-meta">${enName(s, b)}${x.lun ? ' · Korean lunar ' + (x.lun.leap ? 'leap ' : '') + x.lun.m + '/' + x.lun.d : ''} · Korean ${STEM_PINYIN[s]}·${BRANCH_PINYIN[b]}</p>
    <p class="ga-lead">The sky character of the day is <b>${STEM_EN[s]}</b> — ${esc(dm.arch)} — and the earth character is the <b>${BRANCH_ANIMAL[b]}</b>. In Korean Saju every day carries two characters, and how they meet your own Day Master sets the texture of the day.</p>

    <div class="ga-body">
      <h2>The pillars of this day</h2>
      <table class="dp-table">
        <tr><th>Year</th><td class="dp-han">${han(x.yp.stem, x.yp.branch)} <span style="font-family: inherit; font-size: 12px; color: var(--muted);">${pinyin(x.yp.stem, x.yp.branch)}</span></td><th>Month</th><td class="dp-han">${han(x.mp.stem, x.mp.branch)} <span style="font-family: inherit; font-size: 12px; color: var(--muted);">${pinyin(x.mp.stem, x.mp.branch)}</span></td><th>Day</th><td class="dp-han"><b>${han(s, b)}</b></td></tr>
      </table>
      <p>${termHtml}</p>

      <h2>What today is for each Day Master</h2>
      <p>Today\'s ${STEM_EN[s]} relates to your Day Master as one of the Ten Gods. Don\'t know yours? <a href="${rel}en/">Your birth date is enough</a>.</p>
      <ul class="dp-list">
        ${rows}
      </ul>

      <h2>If your Day Branch is the ${clashB.join(' or ')}</h2>
      <p>Your Day Branch clashes with today\'s ${BRANCH_ANIMAL[b]} — plans change and people move; keep signatures and big decisions for another day. If your Day Branch is the <b>${harmB.join(' or ')}</b>, today harmonizes with you: meetings and requests go smoothly.</p>

      <p class="callout">← <a href="${rel}en/day/${iso(pv.y, pv.m, pv.d)}/">${MON[pv.m - 1]} ${pv.d} · ${pinyin(pvP.stem, pvP.branch)}</a> · <a href="${rel}en/day/${iso(nx.y, nx.m, nx.d)}/">${MON[nx.m - 1]} ${nx.d} · ${pinyin(nxP.stem, nxP.branch)}</a> → · <a href="${rel}day/${iso(y, m, d)}/" hreflang="ko">한국어</a></p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/today/"><span class="seal-dot" aria-hidden="true"></span><span>See today\'s energy for your own chart</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">This page is the same for everyone. Add your eight characters and you get a score, a theme and the best hours of the day.</p>
    </div>
  </article>`;
  const url = `/en/day/${iso(y, m, d)}/`;
  write(url.slice(1), shell({
    rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">\n  <link rel="alternate" hreflang="ko" href="${SITE}/day/${iso(y, m, d)}/">`,
    ogTitle: `${MON[m - 1]} ${d} — ${pinyin(s, b)} Day`,
    jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: 'Day pillar calendar', url: SITE + '/en/day/' }, { name: dateEn, url: SITE + url }]),
      { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: iso(y, m, d), dateModified: iso(y, m, d), inLanguage: 'en', author: { '@type': 'Organization', name: 'Sajucheop' }, publisher: { '@type': 'Organization', name: 'Sajucheop' }, mainEntityOfPage: SITE + url }],
    body
  }));
  urls.push({ loc: SITE + url });
}

function monthGrid(y, m, days, rel) {
  const first = weekday(y, m, 1);
  let cells = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w) => `<span class="wd">${w}</span>`).join('');
  for (let i = 0; i < first; i++) cells += '<span style="border: none; background: transparent;"></span>';
  cells += days.map((x) => `<a href="${rel}en/day/${iso(y, m, x.d)}/" class="${x.y === today.y && x.m === today.m && x.d === today.d ? 'today' : ''}">${x.d}<small>${STEM_PINYIN[x.s].slice(0, 4)} ${BRANCH_PINYIN[x.b]}</small></a>`).join('');
  return `<h2>${MON[m - 1]} ${y}</h2><div class="dp-grid">${cells}</div>`;
}

const byMonth = {};
let n = 0;
for (const y of [Y0, Y1]) {
  for (let m = 1; m <= 12; m++) {
    const days = [];
    for (let d = 1; d <= I.daysInMonth(y, m); d++) { const x = dayInfo(y, m, d); days.push(x); buildDay(x); n++; }
    byMonth[`${y}-${pad(m)}`] = days;
  }
}
{
  const rel = '../../';
  const keys = Object.keys(byMonth).sort();
  const at = Math.max(0, keys.indexOf(`${today.y}-${pad(today.m)}`));
  const grids = keys.slice(at, at + 3).map((k) => { const [y, m] = k.split('-').map(Number); return monthGrid(y, m, byMonth[k], rel); }).join('\n');
  const t = byMonth[`${today.y}-${pad(today.m)}`].find((x) => x.d === today.d);
  const title = 'Day Pillar Calendar — what day is it in the Four Pillars today?';
  const desc = `Today, ${MON[today.m - 1]} ${today.d}, is a ${pinyin(t.s, t.b)} (${han(t.s, t.b)}) day — ${enName(t.s, t.b)}. Tap any date for its day pillar, the Korean lunar date, solar terms and what the day means for each of the ten Day Masters.`;
  const body = `
  <article class="guide-article">
    <div class="ga-overline">Day pillar calendar</div>
    <h1 class="ga-title">Today\'s day pillar —<br><span class="dp-han">${han(t.s, t.b)}</span> ${pinyin(t.s, t.b)}</h1>
    <p class="ga-meta">${WD[t.w]}, ${MON[today.m - 1]} ${today.d}, ${today.y} · ${enName(t.s, t.b)}</p>
    <p class="ga-lead">The sixty-day cycle never stops: every day has two characters of its own. Tap a date for its day pillar, the Korean lunar date, solar terms and what the day means for each of the ten Day Masters. <a href="${rel}en/day/${iso(today.y, today.m, today.d)}/">Read today in full →</a></p>
    <div class="ga-body">
      ${grids}
      <p class="callout"><a href="${rel}en/today/">Today\'s energy for your chart</a> · <a href="${rel}en/guide/day-pillar/">The 60 Day Pillars</a> · <a href="${rel}day/" hreflang="ko">한국어</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/today/"><span class="seal-dot" aria-hidden="true"></span><span>See today for my own chart</span></a>
    </div>
  </article>`;
  write('en/day', shell({ rel, lang: 'en', title, desc, canonical: SITE + '/en/day/', nav: NAV(rel), extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}/en/day/">\n  <link rel="alternate" hreflang="ko" href="${SITE}/day/">`,
    jsonld: breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: 'Day pillar calendar', url: SITE + '/en/day/' }]), body }));
  urls.unshift({ loc: SITE + '/en/day/', lastmod: iso(today.y, today.m, today.d) });
}
fs.writeFileSync(path.join(DOCS, 'sitemap-pages-en.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? '<lastmod>' + u.lastmod + '</lastmod>' : ''}</url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-pages-en.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-pages-en.xml\n');
console.log(`EN day pages — ${n} + index, sitemap-pages-en.xml (${urls.length} URLs)`);
