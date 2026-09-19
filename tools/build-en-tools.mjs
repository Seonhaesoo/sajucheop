/* English calendar tools
 *   /en/korean-age/      three ways Korea counts age (international · Korean · year age) + zodiac and saju year
 *   /en/lunar-birthday/  a birth date on the Korean lunar calendar and its solar date every year
 * Zodiac boundary = Chinese New Year (cny.mjs, same as /en/zodiac/); saju year = Ipchun from the engine.
 * Lunar dates = KASI tables in docs/js/vendor-korean-lunar.js — loaded by the page, and here for the leap-month table.
 * → sitemap-en-tools.xml.  Usage: node tools/build-en-tools.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, breadcrumb } from './page-shell.mjs';
import { zodiacSpan, lunarNewYear } from './cny.mjs';
import { publishedTime } from './solar-terms-data.mjs';

const { I } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const MODIFIED = '2026-09-13';
const NAV = (rel) => [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/today/', label: 'Today' }, { href: rel + 'en/match/', label: 'Match' }, { href: rel + 'en/zodiac/', label: 'Zodiac' }, { href: rel + 'en/guide/', label: 'Library' }, { href: rel, label: '한국어' }];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const iso = (c) => `${c.y}-${String(c.m).padStart(2, '0')}-${String(c.d).padStart(2, '0')}`;
const ord = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

/* the vendored KASI lunar library (UMD) */
const lunarSrc = fs.readFileSync(path.join(DOCS, 'js', 'vendor-korean-lunar.js'), 'utf8');
const lunarMod = { exports: {} };
new Function('module', 'exports', lunarSrc)(lunarMod, lunarMod.exports);
const cal = new lunarMod.exports();

function jdToKst(jd) {
  const t = jd - I.JDN_EPOCH + 0.5 + 9 / 24, dn = Math.floor(t), cv = I.civilFromDays(dn), frac = t - dn;
  let hh = Math.floor(frac * 24), mm = Math.round((frac * 24 - hh) * 60);
  if (mm === 60) { hh += 1; mm = 0; }
  return { y: cv.y, m: cv.m, d: cv.d, hh, mm };
}

const STYLE = `<style>
    .tl-calc { margin: 6px 0 18px; padding: 16px; background: #FFFDF9; border: 1px solid var(--line); border-radius: 12px; }
    .tl-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .tl-row label { flex: 1 1 130px; display: block; font-size: 12.5px; font-weight: 700; color: var(--muted); }
    .tl-row input, .tl-row select { display: block; width: 100%; margin-top: 6px; font: inherit; font-size: 16px; padding: 9px 10px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); }
    .tl-check { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 13px; color: var(--muted); cursor: pointer; }
    .tl-calc button { margin-top: 12px; width: 100%; font: inherit; font-weight: 700; padding: 11px 16px; border: 0; border-radius: 8px; background: var(--seal); color: #F6F1E8; cursor: pointer; }
    .tl-out { margin-top: 14px; font-size: 14px; line-height: 1.7; }
    .tl-out p + p { margin-top: 8px; }
    .tl-nums { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
    .tl-nums div { text-align: center; padding: 12px 4px; border: 1px solid var(--line-soft); border-radius: 10px; background: #fff; }
    .tl-nums b { display: block; font-family: 'Noto Serif KR', serif; font-size: 30px; color: var(--seal); line-height: 1.1; }
    .tl-nums span { display: block; font-size: 12.5px; font-weight: 700; margin-top: 4px; }
    .tl-nums small { display: block; font-size: 11px; color: var(--faint); margin-top: 2px; line-height: 1.4; }
    .tl-big { font-family: 'Noto Serif KR', serif; font-size: 19px; color: var(--seal); display: block; margin-bottom: 4px; }
    .tl-table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin-top: 10px; }
    .tl-table th, .tl-table td { padding: 7px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; }
    .tl-table th { font-size: 12px; color: var(--muted); font-weight: 500; }
    .tl-table tr.next td { background: #FBF3E6; font-weight: 600; }
  </style>`;

const urls = [];
function page(slug, { title, desc, h1, lead, calc = '', body, faq, script = '', extraHead = '', overline = 'Tools', article = false, cta = { href: 'en/', label: 'Read my Four Pillars chart' } }) {
  const rel = '../../', url = `/en/${slug}/`;
  const faqHtml = faq.map(([q, a], i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="ih-body"><p>${a}</p></div></details>`).join('\n      ');
  const strip = (s) => s.replace(/<[^>]+>/g, '');
  const html = shell({
    rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE + extraHead,
    jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: h1, url: SITE + url }]),
      article
        ? { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, image: SITE + '/og-image-en.png', datePublished: MODIFIED, dateModified: MODIFIED, inLanguage: 'en', author: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/about/' }, publisher: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/' }, mainEntityOfPage: SITE + url }
        : { '@context': 'https://schema.org', '@type': 'WebApplication', name: h1, url: SITE + url, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', inLanguage: 'en', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) }],
    body: `
  <article class="guide-article">
    <div class="ga-overline">${overline}</div>
    <h1 class="ga-title">${h1}</h1>
    <p class="ga-lead">${lead}</p>
    ${calc}
    <div class="ga-body">
${body}
      <h2>FAQ</h2>
      ${faqHtml}
      <p class="callout"><a href="${rel}en/korean-age/">Korean age calculator</a> · <a href="${rel}en/lunar-birthday/">Lunar birthday calculator</a> · <a href="${rel}en/lunar-age/">Lunar age calculator</a> · <a href="${rel}en/chinese-gender-calendar/">Chinese gender calendar</a> · <a href="${rel}en/zodiac/">Chinese zodiac calculator</a> · <a href="${rel}en/lunar-new-year/">Lunar New Year dates</a> · <a href="${rel}en/chinese-calendar/">Chinese calendar</a> · <a href="${rel}en/day/">Day pillar calendar</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}${cta.href}"><span class="seal-dot" aria-hidden="true"></span><span>${cta.label}</span></a>
    </div>
  </article>
${script}`
  });
  const file = path.join(DOCS, 'en', slug, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  urls.push(SITE + url);
}

/* ---------- Korean age ---------- */
const Z = [];
for (let y = 1924; y <= 2032; y++) { const ip = publishedTime(y, 21) || jdToKst(I.ipchunJd(y)); Z.push([y, iso(zodiacSpan(y).start), iso(ip), `${ip.published ? '' : 'about '}${String(ip.hh).padStart(2, '0')}:${String(ip.mm).padStart(2, '0')}`]); }

page('korean-age', {
  title: 'Korean Age Calculator — How Old Am I in Korea?',
  desc: 'Find your Korean age, international age and year age in one step, and see what changed when Korea switched to international age in June 2023.',
  h1: 'Korean age calculator',
  lead: 'Korea has three ways of counting age, and until 2023 all three were in everyday use. Enter your birth date to see each one and what it is used for.',
  calc: `<div class="tl-calc">
      <div class="tl-row">
        <label for="ka-birth">Birth date<input id="ka-birth" type="date" min="1900-01-01" max="2100-12-31" value="2000-06-15"></label>
        <label for="ka-on">Age on<input id="ka-on" type="date" min="1900-01-01" max="2100-12-31"></label>
      </div>
      <button type="button" id="ka-go">Calculate</button>
      <div class="tl-out" id="ka-out" aria-live="polite"></div>
    </div>`,
  body: `      <h2>Three ways to count age in Korea</h2>
      <table>
        <tr><th></th><th>How it counts</th><th>Where it is used</th></tr>
        <tr><td><b>International age</b><br>만 나이 (man nai)</td><td>0 at birth, one more on each birthday</td><td>Laws, contracts, hospitals and official forms. The legal standard since June 28, 2023.</td></tr>
        <tr><td><b>Korean age</b><br>세는 나이 (seneun nai)</td><td>1 at birth, one more every January 1</td><td>Everyday conversation, especially among older people.</td></tr>
        <tr><td><b>Year age</b><br>연 나이 (yeon nai)</td><td>This year minus your birth year</td><td>A few laws that group people by birth year, such as military service and the age for buying alcohol and tobacco.</td></tr>
      </table>
      <p>Korean age is always one or two years ahead of international age: two before your birthday in a given year, one after it. A baby born on December 31 is one year old in Korean age that day and two the next morning, on January 1.</p>

      <h2>What changed in June 2023</h2>
      <p>On June 28, 2023, amendments to Korea’s Civil Act and to its basic law on public administration took effect, making international age the standard for laws, contracts and official documents unless a law says otherwise. Overnight, most people in Korea became a year or two younger on paper. The aim was to end the confusion three systems caused in contracts, medical instructions and eligibility rules, where the same person could be 25, 26 or 27 depending on who was counting.</p>
      <p>A few laws still count by birth year. Buying alcohol and tobacco is allowed from January 1 of the year you turn 19, and military service obligations are also set by year of birth. That is the year age in the table above.</p>

      <h2>Why Korean age is still around</h2>
      <p>In Korea an age is more than a number: it decides how you speak to someone. People born in the same year are 친구 (chingu, friends) and can talk casually; a year older and they become 형 (hyung), 누나 (noona), 오빠 (oppa) or 언니 (unni), with polite speech going the other way. Because that hierarchy runs on birth years, “What year were you born?” is still an everyday question, and plenty of people give their Korean age in conversation even though every form now asks for the international one.</p>
      <p>School keeps it alive too. Korean school years group children by birth year, January to December, so classmates share a Korean age all year. Before 2009 the cut-off was March, and children born in January or February started school with the year above them: the 빠른 년생 (“early birthdays”), whose friends are all a year older on paper.</p>

      <h2>Korean age, the zodiac and saju</h2>
      <p>Korean age changes on January 1, the zodiac animal changes at Lunar New Year, and a saju chart starts its year at Ipchun, the start of spring around February 4. If you were born in January or early February, the three can disagree, so the calculator shows your animal by the Lunar New Year boundary and your saju year by Ipchun. <a href="../guide/ipchun-year-boundary/">Why saju uses Ipchun</a> · <a href="../zodiac/">Chinese zodiac calculator</a></p>`,
  faq: [
    ['How do I work out my Korean age?', 'Take the current year, subtract your birth year and add one. Someone born in 2000 is 27 in Korean age throughout 2026, and 25 or 26 in international age depending on whether their birthday has passed.'],
    ['Is Korean age still used?', 'Not legally: since June 28, 2023, international age is the standard in Korean law and official documents. Socially it lingers, especially among older people and whenever people work out who is older, and a few laws still use year age.'],
    ['Why are Korean babies one year old at birth?', 'The traditional East Asian count starts at one: from the day you are born, you are in your first year. China, Japan and Vietnam once counted the same way; Korea kept the habit in daily life the longest.'],
    ['Does Korean age go up at Lunar New Year?', 'In the old tradition everyone added a year at the New Year, and a bowl of tteokguk (rice-cake soup) on Seollal is still said to make you a year older. In modern practice the count changes on January 1.'],
    ['What does 만 (man) mean?', '만 나이 means age in full years, the same as international age. If a Korean form or sign says 만 19세, it means 19 in international age.'],
  ],
  script: `  <script>
  (function () {
    var Z = ${JSON.stringify(Z)};
    var AN = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
    var SL = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];
    var EL = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'], HAN = '甲乙丙丁戊己庚辛壬癸', BR = '子丑寅卯辰巳午未申酉戌亥';
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var $ = function (s) { return document.querySelector(s); };
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function parse(v) { var p = v.split('-'); return { y: +p[0], m: +p[1], d: +p[2] }; }
    function fmt(v) { var p = parse(v); return MONTHS[p.m - 1] + ' ' + p.d + ', ' + p.y; }
    function gz(y) { var s = ((y - 4) % 10 + 10) % 10, b = ((y - 4) % 12 + 12) % 12; return { han: HAN[s] + BR[b], name: EL[s] + ' ' + AN[b], b: b }; }
    var now = new Date(), today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    $('#ka-on').value = today;
    function go() {
      var bv = $('#ka-birth').value, ov = $('#ka-on').value || today, out = $('#ka-out');
      if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(bv)) { out.textContent = 'Enter your birth date.'; return; }
      if (ov < bv) { out.textContent = 'The “age on” date is before the birth date.'; return; }
      var b = parse(bv), o = parse(ov);
      var intl = o.y - b.y - ((o.m < b.m || (o.m === b.m && o.d < b.d)) ? 1 : 0), kor = o.y - b.y + 1, yr = o.y - b.y;
      var html = '<div class="tl-nums"><div><b>' + intl + '</b><span>International age</span><small>만 나이 · legal age</small></div>' +
        '<div><b>' + kor + '</b><span>Korean age</span><small>세는 나이 · everyday</small></div>' +
        '<div><b>' + yr + '</b><span>Year age</span><small>연 나이 · a few laws</small></div></div>';
      var next = new Date(o.y, b.m - 1, b.d), onD = new Date(o.y, o.m - 1, o.d);
      if (next < onD) next = new Date(o.y + 1, b.m - 1, b.d);
      var days = Math.round((next - onD) / 86400000);
      html += '<p>' + (days === 0 ? 'Happy birthday — you turn ' + intl + ' today in international age.' : 'Your international age goes up to ' + (intl + 1) + ' on your next birthday, in ' + days + ' day' + (days === 1 ? '' : 's') + '. Your Korean age goes up every January 1.') + '</p>';
      var row = null;
      for (var i = 0; i < Z.length; i++) if (Z[i][0] === b.y) row = Z[i];
      if (row) {
        var zy = bv >= row[1] ? b.y : b.y - 1, z = gz(zy);
        html += '<p>By the Lunar New Year boundary you were born in the Year of the <a href="../zodiac/' + SL[z.b] + '/">' + z.name + '</a> (' + z.han + ').';
        if (bv === row[2]) html += ' Your birthday is Ipchun itself, when the saju year turns at ' + row[3] + ' Korea time, so your saju year depends on your birth hour.';
        else { var sy = bv > row[2] ? b.y : b.y - 1, s = gz(sy); html += ' In a saju chart your year pillar is <b>' + s.han + '</b> (' + s.name + ')' + (sy !== zy ? ', a different year, because saju starts the year at Ipchun (' + fmt(row[2]) + ').' : '.'); }
        html += '</p>';
      }
      out.innerHTML = html;
    }
    $('#ka-go').addEventListener('click', go);
    $('#ka-birth').addEventListener('change', go);
    $('#ka-on').addEventListener('change', go);
    go();
  })();
  </script>`
});

/* ---------- lunar birthday ---------- */
const LEAPS = [];
for (let y = 2020; y <= 2040; y++) {
  for (let m = 1; m <= 12; m++) {
    if (!cal.setLunarDate(y, m, 1, true)) continue;
    const s = cal.getSolarCalendar(), start = { y: s.year, m: s.month, d: s.day };
    const len = cal.setLunarDate(y, m, 30, true) ? 30 : 29;
    cal.setLunarDate(y, m, len, true);
    const e = cal.getSolarCalendar(), end = { y: e.year, m: e.month, d: e.day };
    LEAPS.push({ y, m, start, end });
  }
}
if (LEAPS.length < 5) throw new Error('leap-month table looks wrong: ' + LEAPS.length);
const leapRows = LEAPS.map((x) => `<tr><td>${x.y}</td><td>Leap ${ord(x.m)} month (윤${x.m}월)</td><td>${MON[x.start.m - 1]} ${x.start.d} – ${MON[x.end.m - 1]} ${x.end.d}${x.end.y !== x.start.y ? ', ' + x.end.y : ''}</td></tr>`).join('\n        ');

page('lunar-birthday', {
  title: 'Lunar Birthday Calculator: When Is My Lunar Birthday?',
  desc: 'Convert a birth date to the Korean lunar calendar and see the solar date of the lunar birthday for each coming year, leap months included.',
  h1: 'Lunar birthday calculator',
  lead: 'Many Korean families still celebrate birthdays by the lunar calendar, especially a grandparent’s. Enter a birth date to find its lunar date and the day it falls on in each coming year.',
  extraHead: `\n  <link rel="alternate" hreflang="en" href="${SITE}/en/lunar-birthday/">\n  <link rel="alternate" hreflang="ko" href="${SITE}/lunar/">`,
  calc: `<div class="tl-calc">
      <div class="tl-row">
        <label for="lb-cal">The date is<select id="lb-cal"><option value="solar">Solar (Gregorian)</option><option value="lunar">Lunar (Korean)</option></select></label>
        <label for="lb-y">Year<select id="lb-y"></select></label>
      </div>
      <div class="tl-row" style="margin-top: 10px;">
        <label for="lb-m">Month<select id="lb-m"></select></label>
        <label for="lb-d">Day<select id="lb-d"></select></label>
      </div>
      <label class="tl-check" id="lb-leap-row" hidden><input type="checkbox" id="lb-leap"> Leap month (윤달)</label>
      <button type="button" id="lb-go">Find my lunar birthdays</button>
      <div class="tl-out" id="lb-out" aria-live="polite"></div>
    </div>`,
  body: `      <h2>Why a lunar birthday moves around</h2>
      <p>A lunar month runs from one new moon to the next, about 29.5 days, so twelve lunar months come to about 354 days, eleven short of a solar year. A lunar birthday therefore arrives about eleven days earlier each year, until a leap month is added and it jumps about nineteen days later. Nineteen solar years are almost exactly 235 lunar months, so the two calendars nearly line up again every nineteen years: around ages 19, 38, 57 and 76, the lunar and solar birthdays fall on or close to the same day.</p>

      <h2>Leap months</h2>
      <p>To keep the lunar year in step with the seasons, seven leap months are added in every nineteen years. A leap month repeats the number of the month before it, so a year can have two sixth months, and the second is the leap one: 윤달, yundal. If you were born in a leap month, most years have no such month, and Korean families then celebrate in the ordinary month with the same number. If you were born on the 30th and the month has only 29 days that year, the 29th stands in. The calculator follows both customs.</p>
      <table>
        <tr><th>Year</th><th>Leap month</th><th>Solar dates</th></tr>
        ${leapRows}
      </table>

      <h2>Korean and Chinese lunar calendars</h2>
      <p>The two calendars follow the same rules but count days in different time zones: the Korean lunar calendar uses Korea’s time (UTC+9), the Chinese one uses UTC+8. When a new moon falls in the hour before midnight in China, it is already past midnight in Korea, and the month starts a day later there. Lunar New Year 2027 is an example: February 6 in China, February 7 in Korea. This calculator uses the Korean calendar published by the Korea Astronomy and Space Science Institute, so an occasional date may differ by a day from a Chinese almanac.</p>

      <h2>Lunar birthdays and saju</h2>
      <p>A saju chart does not use lunar months. Its months change at solar terms and its year at Ipchun, around February 4, so a lunar birth date is converted to a solar date first. That is why the <a href="../">chart calculator</a> asks for the solar date, and why two people with the same lunar birthday can have different month pillars. <a href="../guide/ipchun-year-boundary/">Why saju uses Ipchun</a></p>`,
  faq: [
    ['What is a lunar birthday?', 'The day of the lunar calendar you were born on, such as the 15th day of the 8th month. Its solar date changes every year, which is why families look it up each year.'],
    ['How do I find my lunar birthday?', 'Enter your solar birth date in the calculator above. It converts the date to the Korean lunar calendar and lists the solar date of your lunar birthday for the coming years. If you already know your lunar birth date, switch the first box to Lunar.'],
    ['What if I was born in a leap month?', 'Most years have no leap month with the same number, so Korean families celebrate in the ordinary month instead. In the rare years that repeat your leap month, the calculator uses it.'],
    ['Is the Korean lunar calendar the same as the Chinese one?', 'Almost always. Because Korea’s calendar is calculated for UTC+9 and China’s for UTC+8, a month occasionally starts a day apart, as Lunar New Year does in 2027.'],
    ['Do Koreans still celebrate lunar birthdays?', 'Many do, especially older people, and families often keep a grandparent’s birthday on its lunar date. Holidays such as Seollal and Chuseok follow the lunar calendar too. Younger Koreans mostly use their solar birthday.'],
  ],
  script: `  <script src="../../js/vendor-korean-lunar.js"></script>
  <script>
  (function () {
    var $ = function (s) { return document.querySelector(s); };
    var cal = window.KoreanLunarCalendar ? new window.KoreanLunarCalendar() : null;
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var HAN = '甲乙丙丁戊己庚辛壬癸', BR = '子丑寅卯辰巳午未申酉戌亥', AN = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
    function ord(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
    function fmt(s) { return WD[new Date(s.y, s.m - 1, s.d).getDay()] + ', ' + MONTHS[s.m - 1] + ' ' + s.d + ', ' + s.y; }
    var o = '', nowY = new Date().getFullYear();
    for (var y = 2049; y >= 1900; y--) o += '<option value="' + y + '">' + y + '</option>';
    $('#lb-y').innerHTML = o; $('#lb-y').value = '1990';
    o = ''; for (var m = 1; m <= 12; m++) o += '<option value="' + m + '">' + m + '</option>';
    $('#lb-m').innerHTML = o; $('#lb-m').value = '6';
    o = ''; for (var d = 1; d <= 31; d++) o += '<option value="' + d + '">' + d + '</option>';
    $('#lb-d').innerHTML = o; $('#lb-d').value = '15';
    $('#lb-cal').addEventListener('change', function () { $('#lb-leap-row').hidden = this.value !== 'lunar'; });

    function lunarOf(y, m, d) { if (!cal.setSolarDate(y, m, d)) return null; var l = cal.getLunarCalendar(); return { y: l.year, m: l.month, d: l.day, leap: !!l.intercalation }; }
    function solarOf(y, lm, ld, leap) {
      var tries = [];
      if (leap) tries.push([ld, true], [Math.min(ld, 29), true]);
      tries.push([ld, false]);
      if (ld === 30) tries.push([29, false]);
      for (var i = 0; i < tries.length; i++) {
        if (cal.setLunarDate(y, lm, tries[i][0], tries[i][1])) { var s = cal.getSolarCalendar(); return { y: s.year, m: s.month, d: s.day, day: tries[i][0], leap: tries[i][1] }; }
      }
      return null;
    }
    function go() {
      var out = $('#lb-out');
      if (!cal) { out.textContent = 'The lunar calendar did not load — please reload the page.'; return; }
      var y = +$('#lb-y').value, m = +$('#lb-m').value, d = +$('#lb-d').value, lunarIn = $('#lb-cal').value === 'lunar', leapIn = lunarIn && $('#lb-leap').checked;
      var L, S;
      if (lunarIn) {
        S = solarOf(y, m, d, leapIn);
        if (!S || S.day !== d || S.leap !== leapIn) { out.textContent = 'That lunar date does not exist' + (leapIn ? ' — ' + y + ' has no leap ' + ord(m) + ' month, or the month has only 29 days.' : ' — this month has only 29 days in ' + y + '.'); return; }
        L = { y: y, m: m, d: d, leap: leapIn };
      } else {
        if (new Date(y, m - 1, d).getDate() !== d) { out.textContent = 'That date does not exist.'; return; }
        L = lunarOf(y, m, d); S = { y: y, m: m, d: d };
        if (!L) { out.textContent = 'This calculator covers 1900 to 2049.'; return; }
      }
      var s = ((L.y - 4) % 10 + 10) % 10, b = ((L.y - 4) % 12 + 12) % 12;
      var html = '<span class="tl-big">' + ord(L.d) + ' day of the ' + (L.leap ? 'leap ' : '') + ord(L.m) + ' lunar month</span>' +
        '<p>' + (lunarIn ? 'On the solar calendar that is <b>' + fmt(S) + '</b>.' : 'That is the lunar birth date of <b>' + fmt(S) + '</b>.') +
        ' The lunar year is ' + L.y + ', ' + HAN[s] + BR[b] + ' (' + AN[b] + ') on the Korean calendar.</p>';
      var today = new Date(), t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      var rows = '', nextDone = false, notes = {};
      for (var ly = Math.max(L.y + 1, nowY - 1); ly <= Math.min(nowY + 10, 2049); ly++) {
        var r = solarOf(ly, L.m, L.d, L.leap);
        if (!r) continue;
        var dt = new Date(r.y, r.m - 1, r.d), isNext = !nextDone && dt >= t0;
        if (isNext) nextDone = true;
        var note = '';
        if (L.leap && !r.leap) { note = ' *'; notes.leap = 1; }
        if (r.day !== L.d) { note += ' †'; notes.day = 1; }
        rows += '<tr' + (isNext ? ' class="next"' : '') + '><td>' + ly + '</td><td>' + fmt(r) + note + (isNext ? ' · next' : '') + '</td></tr>';
      }
      html += '<table class="tl-table"><tr><th>Lunar year</th><th>Your lunar birthday falls on</th></tr>' + rows + '</table>';
      if (notes.leap) html += '<p style="font-size: 12.5px; color: var(--muted);">* No leap ' + ord(L.m) + ' month that year, so the ordinary ' + ord(L.m) + ' month is used.</p>';
      if (notes.day) html += '<p style="font-size: 12.5px; color: var(--muted);">† The month has 29 days that year, so the 29th is used.</p>';
      out.innerHTML = html;
    }
    $('#lb-go').addEventListener('click', go);
    go();
  })();
  </script>`
});

/* ---------- Lunar New Year ---------- */
const WDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const wd = (c) => WDAY[new Date(Date.UTC(c.y, c.m - 1, c.d)).getUTCDay()];
const longD = (c) => `${wd(c)}, ${MONTH[c.m - 1]} ${c.d}, ${c.y}`;
const md = (c) => `${MONTH[c.m - 1]} ${c.d}`;
const ampm = (hh, mm) => `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'am' : 'pm'}`;
const sameDay = (a, b) => a.y === b.y && a.m === b.m && a.d === b.d;
const koreaNY = (y) => { cal.setLunarDate(y, 1, 1, false); const s = cal.getSolarCalendar(); return { y: s.year, m: s.month, d: s.day }; };
const ANIMAL = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
const ELEM = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
const signOf = (y) => `${ELEM[((y - 4) % 10 + 10) % 10]} ${ANIMAL[((y - 4) % 12 + 12) % 12]}`;
/* 중국 날짜는 cny.mjs(베이징 시각) — 그 규칙은 2033년 설까지 맞는다(2033년 윤11월 때문에 2034년 설부터는 다름). 한국 날짜는 KASI 표 */
const LNY = [];
for (let y = 2024; y <= 2033; y++) { const cn = lunarNewYear(y, 8), kr = koreaNY(y); LNY.push({ y, cn, kr, differ: !sameDay(cn, kr) }); }
const L27 = LNY.find((x) => x.y === 2027), L28 = LNY.find((x) => x.y === 2028);
if (!L27.differ || !L28.differ || LNY.filter((x) => x.differ).length !== 2) throw new Error('China/Korea New Year differences are not the expected 2027 and 2028');
/* 2027년 입춘은 천문연 발표 시각(solar-terms-data.mjs, 10:46) — 엔진 계산(10:42)은 몇 분 빠르다 */
const IP27 = publishedTime(2027, 21);
if (!IP27) throw new Error('solar-terms-data: 2027 입춘 없음');
const utcOf = (c) => `${String((c.hh + 16) % 24).padStart(2, '0')}:${String(c.mm).padStart(2, '0')}`;
const lnyRows = LNY.map((x) => `<tr><td>${x.y <= 2031 ? `<a href="../zodiac/year/${x.y}/">${x.y}</a>` : x.y}</td><td>${wd(x.cn).slice(0, 3)}, ${MON[x.cn.m - 1]} ${x.cn.d}</td><td>${x.differ ? '<b>' : ''}${wd(x.kr).slice(0, 3)}, ${MON[x.kr.m - 1]} ${x.kr.d}${x.differ ? '</b>' : ''}</td><td>${signOf(x.y)}</td></tr>`).join('\n        ');

page('lunar-new-year', {
  overline: 'Lunar New Year', article: true, cta: { href: 'en/2027/', label: 'See what 2027 brings your sign' },
  title: 'Lunar New Year 2027: Feb 6 in China, Feb 7 in Korea',
  desc: 'When Lunar New Year 2027 falls in China, Korea and Vietnam, why Korea’s Seollal is a day later, the holidays, and when the Year of the Fire Goat begins.',
  h1: 'Lunar New Year 2027: February 6 in China, February 7 in Korea',
  lead: `The Year of the Fire Goat begins on ${longD(L27.cn)} in China and Vietnam, and a day later, on ${longD(L27.kr)}, in Korea. Here is why the dates differ, when the holidays fall, and when the new zodiac year really starts.`,
  body: `      <h2>Why Korea celebrates a day later</h2>
      <p>A lunar month begins on the day of the new moon, and that day is counted in local time. China’s calendar runs on Beijing time (UTC+8), Korea’s on Korea time (UTC+9). The new moon that opens 2027 arrives at ${utcOf(L27.cn)} UTC on February 6: ${ampm(L27.cn.hh, L27.cn.mm)} in Beijing, still February 6, but ${ampm((L27.cn.hh + 1) % 24, L27.cn.mm)} on February 7 in Seoul. One hour of time zone puts the two New Years on different days.</p>
      <p>It happens again the following year. In 2028 the new moon lands at ${ampm(L28.cn.hh, L28.cn.mm)} Beijing time, so Chinese New Year falls on ${md(L28.cn)} and Korea’s Seollal on ${md(L28.kr)}. Vietnam’s Tết, counted in UTC+7, falls on February 6 in 2027, the same day as in China.</p>

      <h2>Seollal holidays in Korea, 2027</h2>
      <p>Korea takes three days off for Seollal: the day before, the day itself and the day after, which in 2027 means February 6 to 8. Because Seollal falls on a Sunday, the next working day, Tuesday, February 9, becomes a substitute holiday, so most people get four days in a row, Saturday to Tuesday. Seollal and Chuseok are the two big family trips of the Korean year, and trains and highways out of Seoul fill up well ahead.</p>
      <p>China’s official Spring Festival holiday for 2027 is set by the State Council, which announces the year’s holiday calendar in advance.</p>

      <h2>When does the Year of the Goat begin?</h2>
      <p>It depends on who is counting.</p>
      <table>
        <tr><th>Boundary</th><th>2027</th><th>Used for</th></tr>
        <tr><td>Chinese New Year</td><td>${longD(L27.cn)}</td><td>The Chinese zodiac sign in most English sources</td></tr>
        <tr><td>Korean Seollal</td><td>${longD(L27.kr)}</td><td>The Korean folk zodiac, 띠 (tti)</td></tr>
        <tr><td><a href="../solar-terms/2027/">Ipchun, the start of spring</a></td><td>${longD(IP27)}, ${ampm(IP27.hh, IP27.mm)} Korea time</td><td>The year pillar of a saju chart</td></tr>
      </table>
      <p>So a baby born on February 5, 2027 is already a Goat in a saju chart but still a Horse by Lunar New Year. <a href="../guide/fire-goat-baby-2027/">What a Fire Goat birth means</a> · <a href="../guide/ipchun-year-boundary/">Why saju starts the year at Ipchun</a> · <a href="../zodiac/year/2027/">The 2027 Fire Goat year</a></p>

      <h2>How Koreans spend Seollal</h2>
      <p>The morning starts with 차례 (charye), a memorial rite in which many families set out food for their ancestors, followed by 세배 (sebae): children and younger relatives bow deeply to their elders, wish them a good year and receive 세뱃돈 (sebaetdon), New Year money in an envelope. Everyone eats 떡국 (tteokguk), a soup of sliced rice cakes; by the old way of counting, the bowl makes you a year older (<a href="../korean-age/">Korean age</a>). Afternoons go to 윷놀이 (yunnori), a board game played by tossing four sticks, and to long talks with relatives about jobs, marriage and exams, which younger Koreans famously dread.</p>
      <p>The greeting is 새해 복 많이 받으세요 (saehae bok mani badeuseyo), “receive many blessings in the new year.” Many people also look up their fortune for the year, in a saju reading or the old <a href="../../tojeong/" hreflang="ko">Tojeong Bigyeol</a> almanac.</p>

      <h2>Lunar New Year dates, 2024–2033</h2>
      <table>
        <tr><th>Year</th><th>China</th><th>Korea (Seollal)</th><th>Sign</th></tr>
        ${lnyRows}
      </table>
      <p>For every lunar date of the year, see the <a href="../chinese-calendar/2027/">Chinese calendar for 2027</a>. Dates in bold differ from China’s. Chinese dates are computed for Beijing time; Korean dates follow the calendar of the Korea Astronomy and Space Science Institute.</p>`,
  faq: [
    ['When is Lunar New Year 2027?', `${longD(L27.cn)} in China and Vietnam, and ${longD(L27.kr)} in Korea. The Year of the Fire Goat lasts until the next Lunar New Year: ${longD(L28.cn)} in China and ${md(L28.kr)} in Korea.`],
    ['Why is Seollal a day later than Chinese New Year in 2027?', `The new moon arrives at ${ampm(L27.cn.hh, L27.cn.mm)} Beijing time on February 6, which is already past midnight in Korea. Each calendar starts the month on the local date of the new moon.`],
    ['What animal is 2027?', 'The Goat, sometimes translated as the Sheep or the Ram, with the Fire element: 丁未, a Yin Fire Goat year.'],
    ['Is a baby born in early 2027 a Horse or a Goat?', `By the Chinese zodiac, babies born before February 6, 2027 are Horses. In saju the year turns at Ipchun, ${ampm(IP27.hh, IP27.mm)} Korea time on February 4, so a baby born after that moment is already a Goat in their chart.`],
    ['How do you say Happy New Year in Korean?', '새해 복 많이 받으세요 (saehae bok mani badeuseyo), which means “receive many blessings in the new year.”'],
  ]
});

fs.writeFileSync(path.join(DOCS, 'sitemap-en-tools.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u}</loc><lastmod>${MODIFIED}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-en-tools.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-en-tools.xml\n');
console.log(`EN tools — korean-age, lunar-birthday (leap months ${LEAPS.map((x) => x.y + '/' + x.m).join(' ')}), sitemap-en-tools.xml`);
