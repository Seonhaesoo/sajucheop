/* English library articles and site pages
 *   /en/guide/<slug>/                    in-depth articles (tools/en-learn-a/b/c.mjs through en-learn.mjs)
 *   /en/about/, /en/privacy/, /en/terms/ site pages for English readers (privacy·terms noindex, like the Korean ones)
 *   /en/  "Learn to read your chart" box between <!-- en-learn:start --> and <!-- en-learn:end -->
 *   → sitemap-en-learn.xml (articles + about)
 * The /en/guide/ hub lists the articles too — rebuild it with build-en-guide.mjs.
 * Usage: node tools/build-en-learn.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { ARTICLES, CATS } from './en-learn.mjs';

const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const MODIFIED = '2026-09-13';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
const firstSentence = (s) => (s.match(/^.+?[.!?](?=\s|$)/) || [s])[0];
const NAV = (rel) => [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/today/', label: 'Today' }, { href: rel + 'en/match/', label: 'Match' }, { href: rel + 'en/zodiac/', label: 'Zodiac' }, { href: rel + 'en/guide/', label: 'Library' }, { href: rel, label: '한국어' }];
const ORG = { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/about/' };
const PUBLISHER = { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/', logo: { '@type': 'ImageObject', url: SITE + '/icons/apple-touch-icon.png' } };
const STYLE = `<style>
    .lr-try { margin: 26px 0 6px; padding: 14px 16px 8px; background: #FFFDF9; border: 1px solid var(--line); border-radius: 12px; }
    .lr-try .lr-h { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--seal); margin-bottom: 2px; }
    .lr-try a { display: block; padding: 8px 0; font-size: 14.5px; font-weight: 600; text-decoration: none; border-bottom: 1px solid var(--line-soft); }
    .lr-try a:last-child { border-bottom: 0; }
    .lr-related { list-style: none; padding: 0; margin: 8px 0 0; }
    .lr-related li { padding: 10px 0; border-bottom: 1px solid var(--line-soft); font-size: 14px; line-height: 1.55; }
    .lr-related li a { font-weight: 600; text-decoration: none; }
    .lr-related li small { display: block; color: var(--muted); font-size: 12.5px; margin-top: 3px; }
    .lr-tengods { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 10px 0 4px; }
    .lr-tengods a { display: block; text-align: center; padding: 10px 4px 8px; border: 1px solid var(--line-soft); border-radius: 10px; background: #fff; text-decoration: none; color: var(--ink); font-size: 11.5px; line-height: 1.3; }
    .lr-tengods a b { display: block; font-family: var(--serif); font-size: 20px; color: var(--seal); }
    .lr-tengods a small { display: block; color: var(--faint); font-size: 10.5px; }
  </style>`;

/* Korean articles on the same subject — a visible 한국어 link only (only when the file exists) */
const KO_PAIR = {
  'what-is-saju': 'guide/saju-basics.html', 'five-elements-balance': 'guide/ohaeng.html', 'ipchun-year-boundary': 'guide/jeolgi.html',
  'ten-gods': 'guide/sipseong.html', 'hidden-stems': 'guide/jijanggan.html', 'luck-pillars': 'guide/daeun.html',
  'day-master-strength': 'guide/singang.html', 'useful-god': 'guide/yongsin.html', 'gunghap': 'guide/gunghap-howto.html',
  'peach-blossom': 'guide/dohwasal.html', 'fire-goat-baby-2027': 'guide/2027-jeongmi.html',
};

const warn = [];
const written = [];
/* the Ten Gods article doubles as the hub for /en/guide/ten-gods/<slug>/ (build-en-ten-gods.mjs) — links appended when that data exists */
let TEN_GODS = null;
try { TEN_GODS = (await import('./en-ten-gods.mjs')).TEN_GODS; } catch (e) { warn.push('en-ten-gods.mjs not found — Ten Gods article without the ten links'); }
const tenGodsGrid = (rel) => TEN_GODS ? `
      <h2>The Ten Gods one by one</h2>
      <p>Each god has its own page — meaning, personality, love, money, career, and which stem plays it for every Day Master.</p>
      <div class="lr-tengods">${TEN_GODS.map((g) => `<a href="${rel}en/guide/ten-gods/${g.slug}/"><b>${g.han}</b>${g.name}<small>${g.ko}</small></a>`).join('')}</div>` : '';
function write(relDir, html) {
  const file = path.join(DOCS, relDir, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  written.push(relDir);
}
/* root-relative (/en/...) and absolute (https://sajucheop.com/...) links → relative to the page */
const localize = (html, rel) => html
  .replace(/href="https:\/\/sajucheop\.com\//g, `href="${rel}`)
  .replace(/href="\/(?!\/)/g, `href="${rel}`);

/* ---------- checks ---------- */
const seen = new Set();
for (const a of ARTICLES) {
  if (!/^[a-z0-9-]+$/.test(a.slug)) throw new Error('bad slug: ' + a.slug);
  if (seen.has(a.slug)) throw new Error('duplicate slug: ' + a.slug);
  seen.add(a.slug);
  if (!CATS.some((c) => c.key === a.cat)) throw new Error(`${a.slug}: unknown cat ${a.cat}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.published)) throw new Error(`${a.slug}: published`);
  if (/<h1[\s>]|<script|<style|[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(a.body)) throw new Error(`${a.slug}: h1, script, style or an e-mail address in the body`);
  if (a.title.length > 60) warn.push(`${a.slug}: title ${a.title.length} chars`);
  if (a.desc.length < 110 || a.desc.length > 160) warn.push(`${a.slug}: desc ${a.desc.length} chars`);
  a.words = a.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  if (a.words < 900) warn.push(`${a.slug}: only ${a.words} words`);
}

/* ---------- articles ---------- */
const urls = [];
ARTICLES.forEach((a, k) => {
  const rel = '../../../', url = `/en/guide/${a.slug}/`;
  const cat = CATS.find((c) => c.key === a.cat);
  const minutes = Math.max(3, Math.round(a.words / 230));
  const others = ARTICLES.filter((x) => x.cat !== a.cat);
  const related = ARTICLES.filter((x) => x.cat === a.cat && x !== a).slice(0, 3).concat(others.length ? [others[k % others.length]] : []);
  const ko = KO_PAIR[a.slug] && fs.existsSync(path.join(DOCS, KO_PAIR[a.slug])) ? KO_PAIR[a.slug] : null;
  const tryBox = (a.links || []).length
    ? `<div class="lr-try"><div class="lr-h">Try it</div>${a.links.map((l) => `<a href="${esc(l.href)}">${esc(l.title)} →</a>`).join('')}</div>`
    : '';
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/guide/" style="color: inherit; text-decoration: none;">Library</a> · <a href="${rel}en/guide/#${cat.key}" style="color: inherit; text-decoration: none;">${esc(cat.short)}</a></div>
    <h1 class="ga-title">${esc(a.h1 || a.title)}</h1>
    <p class="ga-meta">Sajucheop library · ${minutes} min read · ${fmtDate(a.published)}</p>
    <div class="ga-body">
      ${a.body.trim()}
      ${a.slug === 'ten-gods' ? tenGodsGrid(rel) : ''}
      ${tryBox}
      <h2>Keep reading</h2>
      <ul class="lr-related">${related.map((x) => `<li><a href="${rel}en/guide/${x.slug}/">${esc(x.title)}</a><small>${esc(firstSentence(x.desc))}</small></li>`).join('')}</ul>
      <p class="callout"><a href="${rel}en/guide/">All articles</a> · <a href="${rel}en/guide/#day-masters">The ten Day Masters</a> · <a href="${rel}en/guide/day-pillar/">60 Day Pillars</a>${ko ? ` · <a href="${rel}${ko}" hreflang="ko">한국어로 읽기</a>` : ''}</p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Cast my Four Pillars chart</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">Free, no account, nothing stored. Your birth date is read in your browser.</p>
    </div>
  </article>`;
  write(url.slice(1), shell({
    rel, lang: 'en', title: a.title, desc: a.desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: a.title,
    jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: 'Library', url: SITE + '/en/guide/' }, { name: a.title, url: SITE + url }]),
      { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.desc, image: SITE + '/og-image-en.png', datePublished: a.published, dateModified: a.updated || a.published, inLanguage: 'en', author: ORG, publisher: PUBLISHER, mainEntityOfPage: SITE + url }],
    body: localize(body, rel)
  }));
  urls.push({ loc: SITE + url, lastmod: a.updated || a.published });
});

/* ---------- site pages ---------- */
function sitePage(slug, { title, desc, h1, overline, meta, body, noindex, jsonld }) {
  const rel = '../../', url = `/en/${slug}/`;
  write(url.slice(1), shell({
    rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), noindex,
    jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: h1, url: SITE + url }])].concat(jsonld || []),
    body: `
  <article class="guide-article">
    <div class="ga-overline">${overline}</div>
    <h1 class="ga-title">${h1}</h1>
    <p class="ga-meta">${meta}</p>
${body}
  </article>`
  }));
  if (!noindex) urls.push({ loc: SITE + url, lastmod: MODIFIED });
}

const IG = '<a href="https://www.instagram.com/sajucheop/" target="_blank" rel="noopener">@sajucheop</a>';

sitePage('about', {
  title: 'About Sajucheop — How Our Korean Saju Calculator Works',
  desc: 'Who makes Sajucheop, how the Four Pillars are calculated (solar terms, Ipchun, time zones), how readings are written and how to reach us.',
  h1: 'About Sajucheop', overline: 'About', meta: `Sajucheop · updated ${fmtDate(MODIFIED)}`,
  jsonld: [{ '@context': 'https://schema.org', '@type': 'AboutPage', name: 'About Sajucheop', url: SITE + '/en/about/', inLanguage: 'en',
    publisher: { '@type': 'Organization', name: 'Sajucheop', alternateName: '사주첩', url: SITE + '/en/', sameAs: ['https://www.instagram.com/sajucheop/'] } }],
  body: `    <p class="ga-lead">Sajucheop (사주첩, “saju album”) is a free site for Korean saju, the Four Pillars of Destiny. It calculates the eight characters of a birth date and turns the rules of saju into plain sentences, in Korean and in English. The 첩 (帖) in the name is an old word for a bound album of writing, like a book of poems or calligraphy.</p>

    <div class="ga-body">
      <h2>What you can do here</h2>
      <p><a href="../">Cast a Four Pillars chart</a> from a birth date, with or without the hour, and see your Day Master, your Five Elements balance and the Ten Gods in your chart. <a href="../today/">Read today’s energy</a> for your chart, <a href="../match/">check your compatibility</a> with someone, or send them a link so they can enter their own birthday. Two calendar tools answer everyday Korean questions: the <a href="../korean-age/">Korean age calculator</a> and the <a href="../lunar-birthday/">lunar birthday calculator</a>.</p>
      <p>The <a href="../guide/">library</a> explains what the chart is made of: the ten Day Masters, the sixty Day Pillars, all hundred Day Master pairings, the Chinese zodiac with Lunar New Year dates from 1924 to 2031, the 2027 Year of the Fire Goat, and articles on how saju works and where it lives in Korean life.</p>

      <h2>Why it exists</h2>
      <p>Saju readings are everywhere in Korea, but few of them say what a statement is based on, and many lean on fear or steer you toward a paid consultation. Sajucheop tries to go the other way: show the calculation, say only what the rules support, and help you understand your chart rather than ask you to believe it.</p>
      <p>The English section exists because more and more people outside Korea are curious about saju, and most English sources either reuse Chinese BaZi material or stop at the zodiac animal. Korean saju has its own habits, from the way the year is counted to how couples read compatibility, and they deserve a plain explanation.</p>

      <h2>How the chart is calculated</h2>
      <ul>
        <li><strong>Solar terms.</strong> The month and year pillars change at solar terms, the moments the Sun reaches set points on its yearly path. Sajucheop computes each term from the Sun’s apparent longitude instead of copying a printed table. The result can differ from official almanac times by several minutes, so the calculator adds a note to any chart whose birth falls within two hours of a boundary.</li>
        <li><strong>The year boundary.</strong> The saju year begins at Ipchun, the start of spring around February 4 — not on January 1 and not at Lunar New Year.</li>
        <li><strong>Time zones.</strong> The English calculator reads your birth time together with the UTC offset you choose, so the solar-term boundaries fall correctly wherever you were born. The Korean edition also handles Korea’s historical standard times and daylight-saving years.</li>
        <li><strong>Lunar dates.</strong> Lunar calendar conversions follow the tables of the Korea Astronomy and Space Science Institute.</li>
        <li><strong>Testing.</strong> The engine is checked by 140 automated tests (reference day pillars, harmonies and clashes, lunar conversion, compatibility scores), which run again after every change.</li>
      </ul>

      <h2>How the readings are written</h2>
      <p>A reading is the rules of saju — how your Day Master relates to the other characters (the Ten Gods), harmonies and clashes, strong and weak charts — turned into sentences, condition by condition. The same chart always gets the same words, and the page shows which characters a statement comes from. Topics that are easy to use for frightening people, such as samjae or “unlucky” stars, are explained as the customs they are: ways of marking when to take extra care. Where Sajucheop wrote new text on top of a traditional structure, it says so.</p>
      <p>Saju is for reflection and entertainment. For health, money or legal questions, talk to a professional and make your own decision.</p>

      <h2>Privacy and advertising</h2>
      <p>Birth dates are calculated inside your browser and never sent to a server. Match links carry their dates after the # sign, a part of a link that browsers do not send to servers. We use Google Analytics to count visits and show Google AdSense ads to cover running costs. The <a href="../privacy/">privacy policy</a> and the <a href="../terms/">terms of use</a> have the details.</p>

      <h2>Changelog</h2>
      <ul>
        <li>August 2026 — Sajucheop opens in Korean with saju readings, today’s fortune, match links and twenty library articles.</li>
        <li>September 2026 — The English edition: chart calculator, today’s reading, match, the ten Day Masters, sixty Day Pillars, a hundred Day Master pairings, the Chinese zodiac and the 2027 horoscope.</li>
        <li>${fmtDate(MODIFIED)} — Fifteen English library articles, and this About page with an English privacy policy and terms.</li>
      </ul>

      <h2>Contact</h2>
      <p>Found a wrong calculation or a clumsy sentence? Send a direct message to ${IG} on Instagram. We check it, fix it and note the fix in the changelog above.</p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="../"><span class="seal-dot" aria-hidden="true"></span><span>Cast my Four Pillars chart</span></a>
    </div>`
});

sitePage('privacy', {
  title: 'Privacy Policy — Sajucheop',
  desc: 'Sajucheop’s privacy policy: birth dates never leave your browser. What analytics, ads and cookies do, and how to opt out.',
  h1: 'Privacy policy', overline: 'Policy', meta: `Effective ${fmtDate(MODIFIED)}`, noindex: true,
  body: `    <div class="ga-body">
      <p>Sajucheop (sajucheop.com, “the service”) respects your privacy. This policy explains what information the service handles and how. It is the English version of our <a href="../../privacy.html" hreflang="ko">Korean privacy policy</a>.</p>

      <h2>1. What we do not collect</h2>
      <ul>
        <li>The names, birth dates, birth times and genders you enter for saju calculations are <strong>not sent to or stored on any server</strong>. Every calculation and reading runs inside your browser, on your device.</li>
        <li>There is no sign-up. We do not collect accounts, passwords or contact details.</li>
      </ul>

      <h2>2. What stays on your device</h2>
      <p>So that today’s reading and the match page can reuse your chart, the service may save the birth date you entered in your browser’s own storage (localStorage). It never leaves your device, and you can delete it at any time by clearing this site’s data in your browser settings.</p>

      <h2>3. Match links</h2>
      <p>The “send a link” feature creates a link that contains a birth date, and a name if you typed one, after the # sign. Browsers do not send that part of a link to servers, but <strong>anyone who receives the link can read what it carries</strong>. Whether and with whom you share it is your choice; share it only with people you trust.</p>

      <h2>4. Information processed automatically</h2>
      <ul>
        <li><strong>Web fonts.</strong> The service loads fonts from Google Fonts (fonts.googleapis.com), which may pass your IP address to Google.</li>
        <li><strong>Hosting.</strong> The service is hosted on GitHub Pages. GitHub may collect access logs, such as IP addresses, to provide the service; see GitHub’s privacy statement.</li>
        <li><strong>Analytics.</strong> We use Google Analytics to understand which pages are read, where visitors come from and what devices they use. It uses cookies and does not identify you personally, and your saju entries are not part of it. You can refuse it through your browser’s cookie settings or the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics opt-out add-on</a>.</li>
      </ul>

      <h2>5. Advertising and cookies</h2>
      <p>The service shows ads through Google AdSense to cover its running costs.</p>
      <ul>
        <li>Third-party vendors, including Google, use cookies to serve ads based on your previous visits to this website or to other websites.</li>
        <li>Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visits to this site and/or other sites on the internet.</li>
        <li>You can opt out of personalized advertising in <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Ads Settings</a>, and out of some other vendors’ cookies for personalized advertising at <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener">aboutads.info</a>.</li>
        <li>You can also block cookies in your browser. The saju calculator keeps working without them.</li>
      </ul>

      <h2>6. Your choices and rights</h2>
      <p>Because the service keeps no personal data about you on its side, there is nothing for us to look up, correct or delete. What is stored on your device you can clear yourself, as described above. For data processed by Google, use Google’s own privacy controls.</p>

      <h2>7. Children</h2>
      <p>The service is not directed at children under 13 and does not knowingly collect personal information from them. Because saju entries are never collected, there is no separate parental-consent process.</p>

      <h2>8. Changes to this policy</h2>
      <p>If this policy changes, we will update this page, and announce important changes before they take effect.</p>

      <h2>9. Contact</h2>
      <p>For privacy questions, send a direct message to ${IG} on Instagram and we will answer as fully as we can.</p>
    </div>`
});

sitePage('terms', {
  title: 'Terms of Use — Sajucheop',
  desc: 'Sajucheop’s terms of use: what the service is, how you may use it, the limits of our responsibility and how to contact us.',
  h1: 'Terms of use', overline: 'Policy', meta: `Effective ${fmtDate(MODIFIED)}`, noindex: true,
  body: `    <div class="ga-body">
      <p>These terms are the English version of our <a href="../../terms.html" hreflang="ko">Korean terms of use</a>.</p>

      <h2>1. What the service is</h2>
      <p>Sajucheop (sajucheop.com, “the service”) calculates saju (Korean Four Pillars) charts and offers reading content based on traditional theory, <strong>for reference, reflection and entertainment</strong>. Its readings, daily fortunes, compatibility scores and date suggestions do not replace medical, legal, financial or any other professional advice.</p>

      <h2>2. Using the service</h2>
      <ul>
        <li>The service is free and needs no sign-up.</li>
        <li>We may improve, change or, when unavoidable, discontinue parts of the service without notice.</li>
        <li>Automated mass access or scraping that disrupts the normal running of the service is not allowed.</li>
      </ul>

      <h2>3. Limits of responsibility</h2>
      <ul>
        <li>Any decision you make on the basis of a reading, and its consequences, are your own responsibility. Please make important decisions with your own judgment.</li>
        <li>The calculator computes solar-term times astronomically and aims for accuracy, but a chart can differ for births close to a solar-term boundary, during daylight-saving time, or when the birth time or time zone is uncertain. The calculator shows a note when a birth falls close to a boundary.</li>
      </ul>

      <h2>4. Copyright</h2>
      <ul>
        <li>The reading texts, design and other content of the service belong to Sajucheop.</li>
        <li>You are free to keep and share your own results, such as screenshots and match links, for personal use. Copying the content for commercial use without permission is not allowed.</li>
      </ul>

      <h2>5. Privacy</h2>
      <p>How the service handles information is set out in the <a href="../privacy/">privacy policy</a>.</p>

      <h2>6. Contact</h2>
      <p>For questions about the service, send a direct message to ${IG} on Instagram.</p>
    </div>`
});

/* ---------- "Learn" box on /en/ ---------- */
{
  const p = path.join(DOCS, 'en', 'index.html');
  const FEATURED = ['what-is-saju', 'saju-vs-bazi', 'read-saju-chart', 'ten-gods', 'luck-pillars', 'gunghap'].map((s) => ARTICLES.find((a) => a.slug === s)).filter(Boolean);
  const box = `<!-- en-learn:start -->
    <ul class="en-learn">
      ${FEATURED.map((a) => `<li><a href="guide/${a.slug}/">${esc(a.title)}</a><span>${esc(firstSentence(a.desc))}</span></li>`).join('\n      ')}
    </ul>
    <p class="reading-body" style="margin-top: 10px; font-size: 13px;"><a href="guide/">All ${ARTICLES.length} articles</a> · <a href="guide/day-master/">The ten Day Masters</a> · <a href="quiz/">Which Day Master are you? — quiz</a> · <a href="guide/day-pillar/">60 Day Pillars</a> · <a href="guide/compatibility/">Day Master compatibility</a> · <a href="monthly/">Monthly horoscope</a> · <a href="day/">Day pillar calendar</a> · <a href="bazi-calculator/">BaZi calculator</a></p>
    <!-- en-learn:end -->`;
  const html = fs.readFileSync(p, 'utf8');
  const re = /<!-- en-learn:start -->[\s\S]*?<!-- en-learn:end -->/;
  if (re.test(html)) fs.writeFileSync(p, html.replace(re, () => box));
  else warn.push('en/index.html: en-learn markers missing');
}

/* ---------- links on everything written here ---------- */
for (const relDir of written.concat(['en'])) {
  const file = path.join(DOCS, relDir, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/href="([^"#]*)(#[^"]*)?"/g)) {
    const href = m[1];
    if (!href || /^(https?:|mailto:|data:)/.test(href) || /['+]/.test(href)) continue;   /* 인라인 스크립트가 이어 붙이는 주소는 건너뜀 */
    const target = href.startsWith('/') ? path.join(DOCS, href) : path.resolve(path.dirname(file), href);
    const ok = href.endsWith('/') ? fs.existsSync(path.join(target, 'index.html')) : fs.existsSync(target);
    if (!ok) warn.push(`${relDir}/: broken link ${href}`);
  }
}

fs.writeFileSync(path.join(DOCS, 'sitemap-en-learn.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-en-learn.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-en-learn.xml\n');

console.log(`EN library — ${ARTICLES.length} articles (${ARTICLES.map((a) => a.words).reduce((x, y) => x + y, 0)} words), about/privacy/terms, sitemap-en-learn.xml (${urls.length} URLs)`);
if (warn.length) console.log('WARN\n  ' + warn.join('\n  '));
