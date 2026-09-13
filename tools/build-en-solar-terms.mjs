/* English 24 solar terms
 *   /en/solar-terms/          what the terms are, which twelve change a chart, the 24 explained, years available
 *   /en/solar-terms/<year>/   dates and times (KST + UTC) for every year with published KASI times in tools/solar-terms-data.mjs
 * Pairs with the Korean /jeolgi/ pages by hreflang where they exist. → sitemap-en-terms.xml
 * Usage: node tools/build-en-solar-terms.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { PUBLISHED, TERM_INFO, YEAR_ORDER, NAME_INDEX, publishedTime, publishedYears } from './solar-terms-data.mjs';

const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const MODIFIED = '2026-09-14';
const YEARS = publishedYears();
const NAV = (rel) => [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/today/', label: 'Today' }, { href: rel + 'en/match/', label: 'Match' }, { href: rel + 'en/zodiac/', label: 'Zodiac' }, { href: rel + 'en/guide/', label: 'Library' }, { href: rel, label: '한국어' }];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ANIMAL = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
const HANB = '子丑寅卯辰巳午未申酉戌亥', HANS = '甲乙丙丁戊己庚辛壬癸';
const ELEM = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
const pad = (n) => String(n).padStart(2, '0');
const hm = (t) => `${pad(t.hh)}:${pad(t.mm)}`;
const ampm = (t) => `${((t.hh + 11) % 12) + 1}:${pad(t.mm)} ${t.hh < 12 ? 'am' : 'pm'}`;
const wd = (t) => WDAY[new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay()];
const longD = (t) => `${wd(t)}, ${MONTHS[t.m - 1]} ${t.d}, ${t.y}`;
const md = (t) => `${MON[t.m - 1]} ${t.d}`;
/* the same instant in another zone (offset in hours from UTC); KST = +9 */
function inZone(t, offset) {
  const u = new Date(Date.UTC(t.y, t.m - 1, t.d, t.hh - 9 + offset, t.mm));
  return { y: u.getUTCFullYear(), m: u.getUTCMonth() + 1, d: u.getUTCDate(), hh: u.getUTCHours(), mm: u.getUTCMinutes() };
}
const yearGanji = (y) => { const s = ((y - 4) % 10 + 10) % 10, b = ((y - 4) % 12 + 12) % 12; return { han: HANS[s] + HANB[b], name: `${ELEM[s]} ${ANIMAL[b]}` }; };
function termsOf(y) { return YEAR_ORDER.map((ko) => { const i = NAME_INDEX[ko]; return Object.assign({ i }, TERM_INFO[i], publishedTime(y, i)); }); }
const listText = (arr) => (arr.length < 3 ? arr.join(' and ') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]);
/* "around Feb 3–4" from the published years */
function around(i) {
  const ds = YEARS.map((y) => publishedTime(y, i));
  const lo = Math.min(...ds.map((t) => t.d)), hi = Math.max(...ds.map((t) => t.d));
  return `${MON[ds[0].m - 1]} ${lo === hi ? lo : lo + '–' + hi}`;
}

const STYLE = `<style>
    .st-table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 6px 0 14px; }
    .st-table th, .st-table td { padding: 8px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .st-table th { font-size: 12px; color: var(--muted); font-weight: 500; }
    .st-table td small { color: var(--faint); display: block; font-size: 11.5px; }
    .st-table tr.jie td { background: #FBF7EE; }
    .st-table td b.han { font-family: 'Noto Serif KR', serif; font-weight: 600; }
    .st-tag { font-size: 11px; padding: 1px 7px; border-radius: 999px; border: 1px solid var(--seal); color: var(--seal); white-space: nowrap; }
    .st-list { list-style: none; padding: 0; margin: 6px 0 0; }
    .st-list li { padding: 10px 0; border-bottom: 1px solid var(--line-soft); font-size: 14px; line-height: 1.6; }
    .st-list li b.han { font-family: 'Noto Serif KR', serif; }
    .st-list li small { color: var(--muted); }
    .zd-wrap { overflow-x: auto; }
    @media (max-width: 480px) { .st-table .utc { display: none; } .st-table { font-size: 12.5px; } .st-table th, .st-table td { padding: 7px 4px; } }
  </style>`;

const urls = [];
function write(url, o) {
  const file = path.join(DOCS, url.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, shell(o));
  urls.push(url);
}
const faqHtml = (faq) => faq.map(([q, a], i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div class="ih-body"><p>${a}</p></div></details>`).join('\n      ');
const faqLd = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) });
const article = (url, title, desc) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, image: SITE + '/og-image.png', datePublished: MODIFIED, dateModified: MODIFIED, inLanguage: 'en', author: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/about/' }, publisher: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/' }, mainEntityOfPage: SITE + url });
const crumbs = (items) => breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }].concat(items.map(([name, url]) => ({ name, url: SITE + url }))));

/* ---------- year pages ---------- */
function yearPage(y) {
  const url = `/en/solar-terms/${y}/`, rel = '../../../';
  const list = termsOf(y), ip = list.find((t) => t.i === 21), ws = list.find((t) => t.i === 18), ss = list.find((t) => t.i === 6);
  const g = yearGanji(y), prevG = yearGanji(y - 1);
  const jie = list.filter((t) => t.jie);
  const koPage = fs.existsSync(path.join(DOCS, 'jeolgi', String(y), 'index.html'));
  const rows = list.map((t) => {
    const u = inZone(t, 0);
    const saju = t.jie ? `<span class="st-tag">jie</span> opens the ${ANIMAL[t.branch]} month <b class="han">${HANB[t.branch]}</b>${t.i === 21 ? ` and the ${g.han} year` : ''}` : '<small>mid-term (zhongqi) — no pillar changes</small>';
    return `<tr${t.jie ? ' class="jie"' : ''}><td><b>${t.en}</b><small><b class="han">${t.han}</b> ${t.pinyin} · ${t.rr}</small></td><td>${md(t)}<small>${wd(t)}</small></td><td>${hm(t)}</td><td class="utc">${md(u)}<small>${hm(u)} UTC</small></td><td>${saju}</td></tr>`;
  }).join('\n        ');
  const jieItems = jie.map((t) => `<li><b>${md(t)}, ${hm(t)}</b> — ${t.en} (<b class="han">${t.han}</b>) opens the ${ANIMAL[t.branch]} month <b class="han">${HANB[t.branch]}</b>${t.i === 21 ? `, and with it the ${g.han} (${g.name}) year` : ''}.</li>`).join('\n        ');
  const zones = [['Seoul, Tokyo', 9], ['Beijing, Hong Kong, Singapore', 8], ['London', 0], ['New York, Toronto', -5], ['Los Angeles, Vancouver', -8]];
  const zoneRows = zones.map(([city, off]) => { const z = inZone(ip, off); return `<tr><td>${city}</td><td>UTC${off >= 0 ? '+' : '−'}${Math.abs(off)}</td><td>${longD(z)}, ${ampm(z)}</td></tr>`; }).join('\n        ');
  const beforeMidnight = list.filter((t) => t.hh < 1);
  const beforeUtc = list.filter((t) => t.hh < 9);
  const dayShift = `${beforeUtc.length ? `In UTC, ${beforeUtc.length === 1 ? 'one term falls' : beforeUtc.length + ' terms fall'} on the previous calendar day (${listText(beforeUtc.map((t) => t.en))}), because Korea is nine hours ahead. ` : ''}${beforeMidnight.length ? `Even Beijing, only one hour behind Seoul, has ${listText(beforeMidnight.map((t) => `${t.en} on ${md(inZone(t, 8))}`))} — the same instant, the day before.` : 'This year no term falls in the first hour after midnight in Korea, so Beijing and Seoul share every date.'}`;
  const title = `24 Solar Terms ${y} — Dates, Times and the Saju Calendar`;
  const desc = `All 24 solar terms of ${y} in Korea Standard Time and UTC — Ipchun on ${md(ip)} at ${hm(ip)} — with the twelve that change a saju chart.`;
  const faq = [
    [`When is Lichun (Ipchun) in ${y}?`, `${longD(ip)} at ${hm(ip)} Korea Standard Time, which is ${md(inZone(ip, 0))} ${hm(inZone(ip, 0))} UTC and ${md(inZone(ip, 8))} ${hm(inZone(ip, 8))} in Beijing. In a saju or BaZi chart it is the moment the year pillar changes from ${prevG.han} (${prevG.name}) to ${g.han} (${g.name}).`],
    [`When is the winter solstice in ${y} in Korea?`, `${longD(ws)} at ${hm(ws)} KST (${md(inZone(ws, 0))} ${hm(inZone(ws, 0))} UTC), the longest night of the year. Koreans eat red-bean porridge on the day. The summer solstice, the longest day, is ${longD(ss)} at ${hm(ss)} KST.`],
    ['Are the solar term dates the same in China and Korea?', `Each term is a single instant for the whole planet, so only the clock reading differs: Korea (UTC+9) is one hour ahead of China and Hong Kong (UTC+8). ${dayShift}`],
    ['Why do different websites give different times for the same term?', 'Three reasons: the time zone (Beijing, Korea and UTC are all common), rounding (almanacs print whole minutes and some sites truncate the seconds instead), and the ephemeris used. The times here are the ones the Korea Astronomy and Space Science Institute publishes. Our own <a href="../../">chart calculator</a> computes each term from the Sun’s position and can differ from these by a few minutes, which only matters for a birth within minutes of a boundary.'],
    ['Which solar terms matter for a saju or BaZi chart?', `The twelve jie (절, 節), the odd-numbered terms that begin each solar month: ${listText(jie.map((t) => t.en))}. A chart’s month pillar changes at each of them, and the year pillar changes at the Start of Spring. The other twelve, the zhongqi, mark the middle of a month and change nothing in a chart.`],
  ];
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/solar-terms/" style="color: inherit; text-decoration: none;">Solar terms</a> · ${y}</div>
    <h1 class="ga-title">24 solar terms in ${y} — <br>dates and times</h1>
    <p class="ga-meta">Korea Standard Time (UTC+9) · times as published by the Korea Astronomy and Space Science Institute · Beijing and Hong Kong are one hour earlier</p>
    <p class="ga-lead">The twenty-four solar terms mark the Sun’s progress along its yearly path, one every 15 degrees. Twelve of them, the jie (절, 節), open the months of a saju chart, and the Start of Spring (Ipchun) opens the whole year: from <b>${longD(ip)} at ${hm(ip)}</b>, ${y} is a ${g.han} (${g.name}) year in the chart.</p>
    <div class="ga-body">
      <div class="zd-wrap"><table class="st-table">
        <tr><th>Term</th><th>Date (KST)</th><th>Time (KST)</th><th class="utc">UTC</th><th>In a saju chart</th></tr>
        ${rows}
      </table></div>
      <p>Shaded rows are the twelve jie. The table runs by the Western calendar year, so it opens with Minor Cold in January, inside the Ox month that closes the previous saju year, and Minor Cold ${y + 1} belongs to the next page.</p>

      <h2>The twelve that change a chart</h2>
      <p>A saju or BaZi month is not a calendar month: it begins at a jie and ends at the next one. Whoever is born after the moment below has the new month pillar, whoever is born before it has the old one, and the time of birth decides for anyone born on the day itself.</p>
      <ul class="st-list">
        ${jieItems}
      </ul>

      <h2>Ipchun, the year boundary</h2>
      <p>The saju year does not begin on January 1 or at Lunar New Year. It begins at the Start of Spring, when the Sun reaches 315° of longitude, and in ${y} that is ${longD(ip)} at ${hm(ip)} in Korea. Anyone born in ${y} before that moment has the ${prevG.han} (${prevG.name}) year pillar of ${y - 1}; the zodiac animal in their chart is the ${prevG.name.split(' ')[1]}, whatever the Lunar New Year tables say. Because the instant is the same everywhere, it lands on different clocks around the world:</p>
      <div class="zd-wrap"><table class="st-table">
        <tr><th>Where you were born</th><th>Zone</th><th>Ipchun ${y} local time</th></tr>
        ${zoneRows}
      </table></div>
      <p>Daylight-saving time is not in force in early February in these cities. The <a href="${rel}en/">chart calculator</a> does this conversion for any time zone, and <a href="${rel}en/guide/ipchun-year-boundary/">the Ipchun guide</a> works through the cases where the three New Years disagree.</p>

      <h2>Same instant, different dates</h2>
      <p>${dayShift} Korean almanacs, Korean saju software and this page all use Korea Standard Time; Chinese and Hong Kong almanacs use UTC+8. When you compare two sources, check the zone before you decide one of them is wrong.</p>

      <h2>How the times are computed</h2>
      <p>A solar term is the moment the Sun’s apparent longitude, seen from Earth, reaches a multiple of 15 degrees. The Korea Astronomy and Space Science Institute computes those moments from a modern planetary ephemeris and publishes them, to the minute, in its yearly almanac; these are the times above. Whole-minute rounding is why two careful sources can differ by a minute. Sajucheop’s own calculator solves the same problem from a compact formula for the Sun’s position, which can run a few minutes ahead of the published times; it warns you when a birth falls within two hours of a boundary, and for a birth within minutes of one, the published time is the one to trust.</p>

      <h2>FAQ</h2>
      ${faqHtml(faq)}
      <p class="callout">${YEARS.filter((x) => x !== y).map((x) => `<a href="${rel}en/solar-terms/${x}/">${x}</a>`).join(' · ')} · <a href="${rel}en/solar-terms/">What the 24 terms mean</a> · <a href="${rel}en/day/">Day pillar calendar</a> · <a href="${rel}en/lunar-new-year/">Lunar New Year dates</a>${koPage ? ` · <a href="${rel}jeolgi/${y}/" hreflang="ko">한국어</a>` : ''}</p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Cast my chart with the right month pillar</span></a>
    </div>
  </article>`;
  write(url, { rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `24 solar terms ${y} — Ipchun ${md(ip)} ${hm(ip)} KST`,
    extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">` + (koPage ? `\n  <link rel="alternate" hreflang="ko" href="${SITE}/jeolgi/${y}/">` : ''),
    jsonld: [crumbs([['Solar terms', '/en/solar-terms/'], [String(y), url]]), article(url, title, desc), faqLd(faq)], body });
}

/* ---------- hub ---------- */
function hub() {
  const url = '/en/solar-terms/', rel = '../../';
  const ordered = YEAR_ORDER.map((ko) => TERM_INFO[NAME_INDEX[ko]]).map((t) => Object.assign({ i: NAME_INDEX[t.ko] }, t));
  const items = ordered.map((t) => `<li><b>${t.en}</b> <b class="han">${t.han}</b> <small>${t.pinyin} · Korean ${t.rr} · around ${around(t.i)}${t.jie ? ` · opens the ${ANIMAL[t.branch]} month` : ''}</small><br>${esc(t.meaning)}</li>`).join('\n        ');
  const monthRows = ordered.filter((t) => t.jie).map((t) => `<tr><td>${ANIMAL[t.branch]} month <b class="han">${HANB[t.branch]}</b></td><td>${t.en} <b class="han">${t.han}</b></td><td>around ${around(t.i)}</td><td>${t.i === 21 ? 'year and month pillar' : 'month pillar'}</td></tr>`).join('\n        ');
  const yearItems = YEARS.map((y) => { const ip = publishedTime(y, 21), ws = publishedTime(y, 18); return `<li><b><a href="${rel}en/solar-terms/${y}/">24 solar terms of ${y}</a></b> — Ipchun ${md(ip)} at ${hm(ip)}, winter solstice ${md(ws)} at ${hm(ws)} (KST)</li>`; }).join('\n        ');
  const title = '24 Solar Terms — Dates, Meanings and the Saju Calendar';
  const desc = 'The 24 solar terms explained: what each means, which twelve begin the months of a saju or BaZi chart, and their dates and times by year.';
  const faq = [
    ['What is a solar term?', 'One of twenty-four points on the Sun’s yearly path, spaced 15 degrees apart, that East Asian calendars have used for over two thousand years to track the seasons. Each is an instant, not a day, and they arrive about 15 days apart. Korean calls them jeolgi (절기), Chinese jieqi (节气), Japanese sekki (節気).'],
    ['Are solar terms lunar?', 'No. They follow the Sun alone, which is why they fall on almost the same Western dates every year. Lunar New Year, by contrast, moves by weeks. A saju chart uses the solar terms for its year and month pillars and never the lunar calendar.'],
    ['Why does a solar term shift by a day from year to year?', 'The solar year is about a quarter of a day longer than 365 days, so each term arrives roughly six hours later than the year before until a leap day pulls it back. Over a few years the same term can fall on the 3rd, 4th or 5th of a month.'],
    ['Which solar terms change a saju or BaZi chart?', 'The twelve jie: Start of Spring, Awakening of Insects, Clear and Bright, Start of Summer, Grain in Ear, Minor Heat, Start of Autumn, White Dew, Cold Dew, Start of Winter, Major Snow and Minor Cold. Each begins a solar month and changes the month pillar; the Start of Spring changes the year pillar as well.'],
  ];
  const body = `
  <article class="guide-article">
    <div class="ga-overline">Solar terms</div>
    <h1 class="ga-title">The 24 solar terms — <br>the calendar behind a saju chart</h1>
    <p class="ga-meta">Sajucheop · jeolgi (절기, 節氣) in Korean, jieqi in Chinese · ${YEARS.length} years of dates and times</p>
    <p class="ga-lead">A saju chart counts its years and months by the Sun, not the Moon. Twenty-four points on the Sun’s yearly path, one every 15 degrees, mark the turning of the seasons, and twelve of them open the months that a Four Pillars chart is built from. Here is what each term means, which ones change a chart, and the exact dates and times for ${listText(YEARS.map(String))}.</p>
    <div class="ga-body">
      <h2>How the twenty-four are made</h2>
      <p>Seen from Earth, the Sun moves once around the sky each year. Divide that circle into 24 equal arcs of 15 degrees and you have the solar terms: the moment the Sun reaches 315° is the Start of Spring, 0° is the spring equinox, 90° the summer solstice, and so on. Because the Sun moves a little faster in winter, when Earth is nearest to it, the terms are not spaced perfectly evenly in time — about 14.7 days apart in January, 15.7 in July — but each falls within a day or two of the same Western date every year.</p>
      <p>The twenty-four alternate between two kinds. The <b>jie</b> (절, 節, “sectional terms”) begin the twelve solar months; the <b>zhongqi</b> (중기, 中氣, “middle terms”) mark their midpoints, and include the two equinoxes and two solstices. In the traditional lunisolar calendar a month with no zhongqi becomes the leap month, which is how the two calendars are kept in step.</p>

      <h2>The twelve that begin the months of a chart</h2>
      <p>A saju or BaZi month runs from one jie to the next. The Tiger month, the first of the chart’s year, opens at the Start of Spring; the Ox month, the last, opens at Minor Cold in January. Each month carries one of the twelve earthly branches, the same characters as the zodiac animals.</p>
      <div class="zd-wrap"><table class="st-table">
        <tr><th>Saju month</th><th>Opens at</th><th>Usually</th><th>What changes</th></tr>
        ${monthRows}
      </table></div>
      <p>Nothing changes at a zhongqi, so a birth on the day of a solstice or an equinox needs no special care. A birth on the day of a jie does: the month pillar depends on whether the birth came before or after the exact time, and the yearly pages below give that time to the minute.</p>

      <h2>The year begins at Ipchun</h2>
      <p>The Start of Spring, Ipchun (입춘) in Korean and Lichun in Chinese, is the saju New Year. The year pillar and the month pillar change together at that moment, which falls on February 3, 4 or 5 depending on the year. This is different from Lunar New Year, which the popular zodiac uses and which can fall anywhere from January 21 to February 20; it is why a January baby is always the previous year’s animal in a chart. <a href="${rel}en/guide/ipchun-year-boundary/">The Ipchun guide</a> explains the rule and its edge cases.</p>

      <h2>Dates and times by year</h2>
      <ul class="st-list">
        ${yearItems}
      </ul>
      <p>Times are Korea Standard Time as published by the Korea Astronomy and Space Science Institute, with UTC alongside. Beijing and Hong Kong run one hour behind Korea.</p>

      <h2>The twenty-four terms explained</h2>
      <p>In calendar order, with the Chinese pinyin and Korean names. The dates are the range across ${YEARS[0]}–${YEARS[YEARS.length - 1]}.</p>
      <ul class="st-list">
        ${items}
      </ul>

      <h2>Korea, China and Japan</h2>
      <p>The terms are the same instants everywhere; only the names and the clocks differ. Korea writes 절기 and reads the characters in Korean (입춘 Ipchun, 동지 Dongji); China writes 节气 and reads them in Mandarin (立春 Lichun, 冬至 Dongzhi); Japan writes 節気 and reads 立春 as Risshun. Korean and Japanese almanacs give the times in UTC+9, Chinese and Hong Kong almanacs in UTC+8. A few Korean customs hang on particular terms: pasting 立春大吉 on the door at Ipchun, tending family graves around Hansik near Clear and Bright, making kimchi after the Start of Winter, and eating red-bean porridge at the winter solstice.</p>

      <h2>FAQ</h2>
      ${faqHtml(faq)}
      <p class="callout"><a href="${rel}en/guide/what-is-saju/">What saju is</a> · <a href="${rel}en/day/">Day pillar calendar</a> · <a href="${rel}en/lunar-new-year/">Lunar New Year dates</a> · <a href="${rel}en/lunar-birthday/">Lunar birthday calculator</a> · <a href="${rel}jeolgi/" hreflang="ko">한국어: 절기</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Cast my Four Pillars chart</span></a>
    </div>
  </article>`;
  write(url, { rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: 'The 24 solar terms — the calendar behind a saju chart',
    extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">\n  <link rel="alternate" hreflang="ko" href="${SITE}/jeolgi/">`,
    jsonld: [crumbs([['Solar terms', url]]), article(url, title, desc), faqLd(faq)], body });
}

hub();
for (const y of YEARS) yearPage(y);
fs.writeFileSync(path.join(DOCS, 'sitemap-en-terms.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${MODIFIED}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-en-terms.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-en-terms.xml\n');
console.log(`EN solar terms — hub + ${YEARS.join('·')}, sitemap-en-terms.xml`);
