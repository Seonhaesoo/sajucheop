/* English glossary — /en/glossary/ (one page, ~100 terms grouped, anchors per term, DefinedTermSet JSON-LD).
 * Terms from tools/en-glossary.mjs. Listed in docs/sitemap.xml. Usage: node tools/build-en-glossary.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { GROUPS, GLOSSARY_INTRO } from './en-glossary.mjs';

const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const MODIFIED = '2026-09-15';
const rel = '../../', url = '/en/glossary/';
const NAV = [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/today/', label: 'Today' }, { href: rel + 'en/match/', label: 'Match' }, { href: rel + 'en/zodiac/', label: 'Zodiac' }, { href: rel + 'en/guide/', label: 'Library' }];
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const total = GROUPS.reduce((n, g) => n + g.terms.length, 0);
const seen = new Set();
GROUPS.forEach((g) => g.terms.forEach((t) => { const id = slugify(t.term); if (seen.has(id)) throw new Error('duplicate term: ' + t.term); seen.add(id); if (t.link && !fs.existsSync(path.join(DOCS, t.link.slice(1), 'index.html'))) throw new Error(`${t.term}: link ${t.link} does not exist`); }));

const STYLE = `<style>
    .gl-toc { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 4px; }
    .gl-toc a { font-size: 12.5px; padding: 6px 11px; border: 1px solid var(--line); border-radius: 999px; text-decoration: none; color: var(--ink); background: #fff; }
    .gl-search { width: 100%; font: inherit; font-size: 16px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; background: #fff; margin-top: 14px; }
    .gl-term { padding: 12px 0; border-bottom: 1px solid var(--line-soft); }
    .gl-term dt { font-weight: 700; font-size: 15px; } .gl-term dt small { font-weight: 500; color: var(--muted); font-size: 12.5px; margin-left: 6px; font-family: var(--serif); }
    .gl-term dd { margin: 4px 0 0; font-size: 13.5px; line-height: 1.65; color: var(--ink); }
    .gl-term dd a { color: var(--seal); }
    .gl-term.hide { display: none; }
    .gl-count { font-size: 12.5px; color: var(--faint); margin-top: 6px; }
  </style>`;

const tocHtml = GROUPS.map((g) => `<a href="#${g.key}">${esc(g.label)}</a>`).join('');
const groupsHtml = GROUPS.map((g) => `      <h2 id="${g.key}">${esc(g.label)} <small style="color: var(--faint); font-weight: 400; font-size: 13px;">${g.terms.length}</small></h2>
      <dl>
${g.terms.map((t) => `        <div class="gl-term" id="${slugify(t.term)}" data-q="${esc((t.term + ' ' + t.han + ' ' + t.ko + ' ' + t.pinyin).toLowerCase())}"><dt>${esc(t.term)}${t.han ? `<small>${esc(t.han)}</small>` : ''}${t.ko ? `<small>${esc(t.ko)}</small>` : ''}${t.pinyin ? `<small>${esc(t.pinyin)}</small>` : ''}</dt><dd>${esc(t.def)}${t.link ? ` <a href="${rel}${t.link.slice(1)}">Read more →</a>` : ''}</dd></div>`).join('\n')}
      </dl>`).join('\n');

const title = 'Saju & BaZi Glossary — 100 Terms in Plain English';
const desc = `${total} saju and BaZi terms in plain English with Chinese characters, Korean and pinyin — Day Master, Ten Gods, hidden stems, luck pillars, clashes, stars.`;
const html = shell({
  rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV, extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">`,
  jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: 'Glossary', url: SITE + url }]),
    { '@context': 'https://schema.org', '@type': 'DefinedTermSet', name: 'Saju & BaZi glossary', url: SITE + url, inLanguage: 'en', hasDefinedTerm: GROUPS.flatMap((g) => g.terms.map((t) => ({ '@type': 'DefinedTerm', name: t.term, description: t.def, url: SITE + url + '#' + slugify(t.term) }))) }],
  body: `
  <article class="guide-article">
    <div class="ga-overline">Library · Glossary</div>
    <h1 class="ga-title">Saju &amp; BaZi glossary</h1>
    <p class="ga-lead">${esc(GLOSSARY_INTRO.lead[0])}</p>
    <input class="gl-search" id="gl-q" type="search" placeholder="Search ${total} terms — e.g. Day Master, 冲, 겁재, Wei" aria-label="Search the glossary">
    <p class="gl-count" id="gl-count"></p>
    <div class="gl-toc">${tocHtml}</div>
    <div class="ga-body">
      <p>${esc(GLOSSARY_INTRO.lead[1])}</p>
${groupsHtml}
      <p class="callout"><a href="${rel}en/guide/">All library articles</a> · <a href="${rel}en/guide/ten-gods/">The Ten Gods</a> · <a href="${rel}en/guide/twelve-stages/">Twelve Life Stages</a> · <a href="${rel}en/bazi-calculator/">BaZi calculator</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>See these terms in my own chart</span></a>
    </div>
  </article>
<script>
(function () {
  var q = document.getElementById('gl-q'), items = Array.prototype.slice.call(document.querySelectorAll('.gl-term')), count = document.getElementById('gl-count');
  function run() {
    var v = q.value.trim().toLowerCase(), n = 0;
    items.forEach(function (el) { var hit = !v || el.getAttribute('data-q').indexOf(v) >= 0 || el.textContent.toLowerCase().indexOf(v) >= 0; el.classList.toggle('hide', !hit); if (hit) n++; });
    count.textContent = v ? n + ' of ${total} terms match' : '';
  }
  q.addEventListener('input', run);
  if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.style.background = '#FBF3E6'; }
})();
</script>`
});
const file = path.join(DOCS, 'en', 'glossary', 'index.html');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, html);
console.log(`glossary → ${total} terms in ${GROUPS.length} groups (${(html.length / 1024).toFixed(0)} KB); title ${title.length}, desc ${desc.length}`);
