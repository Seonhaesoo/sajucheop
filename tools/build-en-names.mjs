/* /en/korean-name/ — Korean name generator by five elements (자원오행).
 * Data: en-name-data.mjs (syllables · hanja · radical elements) → docs/js/en-names.js; prose: en-name-text.mjs.
 * Logic lives in docs/js/en-name-gen.js (hand-written). URL is listed in docs/sitemap.xml.  Usage: node tools/build-en-names.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './engine.mjs';
import { shell, breadcrumb } from './page-shell.mjs';
import { SYLLABLES, RADICALS, BLOCK } from './en-name-data.mjs';
import { TEXT } from './en-name-text.mjs';

const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const MODIFIED = '2026-09-14';
const rel = '../../', url = '/en/korean-name/';
const NAV = [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/today/', label: 'Today' }, { href: rel + 'en/match/', label: 'Match' }, { href: rel + 'en/zodiac/', label: 'Zodiac' }, { href: rel + 'en/guide/', label: 'Library' }, { href: rel, label: '한국어' }];
const EL_EN = { '목': 'Wood', '화': 'Fire', '토': 'Earth', '금': 'Metal', '수': 'Water' };
const EL_KEYS = ['목', '화', '토', '금', '수'];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- data file ---------- */
const SYL = SYLLABLES.map((s) => ({ s: s.s, rr: s.rr, alt: s.alt, say: s.say, g: s.g, pos: s.pos, pop: s.pop, hj: s.hj.map((h) => ({ h: h.h, el: h.el, m: h.m, r: h.r })) }));
fs.writeFileSync(path.join(DOCS, 'js', 'en-names.js'),
  `/* Korean name syllables by 자원오행 — tools/build-en-names.mjs from en-name-data.mjs */\nwindow.EN_NAMES = ${JSON.stringify({ SYL, SURNAMES: TEXT.surnames, BLOCK })};\n`);

/* ---------- page ---------- */
const hanjaCount = SYLLABLES.reduce((n, s) => n + s.hj.length, 0);
const title = 'Korean Name Generator by Five Elements — Hanja Meanings';
const desc = `Get Korean given names that balance your Saju chart. ${SYLLABLES.length} syllables and ${hanjaCount} name hanja sorted by element, with meanings, romanization and pronunciation.`;
const h1 = 'Korean name generator by five elements';
const lead = 'Enter a birth date — or pick an element — and get two-syllable Korean given names whose hanja supply the element your chart is short on, the way Korean naming masters have chosen characters for generations.';

const STYLE = `<style>
    .kn-box { margin: 6px 0 18px; padding: 16px; background: #FFFDF9; border: 1px solid var(--line); border-radius: 12px; }
    .kn-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
    .kn-tab { flex: 1; font: inherit; font-size: 13px; font-weight: 700; padding: 9px 8px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--muted); cursor: pointer; }
    .kn-tab.on { background: var(--ink); color: #F6F1E8; border-color: var(--ink); }
    .kn-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .kn-row label { flex: 1 1 140px; display: block; font-size: 12.5px; font-weight: 700; color: var(--muted); }
    .kn-row input, .kn-row select { display: block; width: 100%; margin-top: 6px; font: inherit; font-size: 16px; padding: 9px 10px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); }
    .kn-row input:disabled { color: var(--faint); background: #F7F3EA; }
    .kn-check { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 13px; color: var(--muted); cursor: pointer; }
    .kn-style { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 12px; font-size: 13px; color: var(--muted); }
    .kn-style label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
    .kn-box .kn-go { margin-top: 14px; width: 100%; font: inherit; font-weight: 700; padding: 11px 16px; border: 0; border-radius: 8px; background: var(--seal); color: #F6F1E8; cursor: pointer; }
    #kn-out { margin-top: 16px; }
    #kn-chart { font-size: 14px; line-height: 1.7; }
    .kn-dm b { color: var(--seal); }
    .kn-bars { margin: 10px 0 6px; }
    .kn-need { margin-top: 8px; padding: 10px 12px; background: #FBF3E6; border-radius: 8px; }
    .kn-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; margin-top: 14px; }
    .kn-card { padding: 14px 14px 12px; border: 1px solid var(--line-soft); border-radius: 12px; background: #fff; }
    .kn-hangul { font-family: var(--serif); font-size: 28px; font-weight: 700; color: var(--ink); line-height: 1.1; }
    .kn-hangul .kn-sn, .kn-hanja .kn-sn { color: var(--faint); font-weight: 500; margin-right: 4px; }
    .kn-rr { font-size: 15px; font-weight: 700; color: var(--seal); margin-top: 4px; }
    .kn-rr span { color: var(--muted); font-weight: 500; font-size: 13px; }
    .kn-hanja { font-family: var(--serif); font-size: 22px; margin-top: 8px; letter-spacing: 2px; }
    .kn-mean { font-size: 12.5px; color: var(--muted); line-height: 1.6; margin-top: 4px; }
    .kn-mean b { font-family: var(--serif); color: var(--ink); font-weight: 600; }
    .kn-mean i { color: var(--faint); font-style: normal; }
    .kn-foot { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
    .kn-tag { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; color: #fff; }
    .kn-say { font-size: 12px; color: var(--faint); margin-left: auto; }
    .kn-more { margin-top: 12px; font: inherit; font-weight: 700; font-size: 13px; padding: 9px 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); cursor: pointer; }
    #kn-count { font-size: 12.5px; color: var(--faint); margin-top: 8px; }
    .el-목 { background: var(--el-mok); } .el-화 { background: var(--el-hwa); } .el-토 { background: var(--el-to); } .el-금 { background: var(--el-geum); } .el-수 { background: var(--el-su); }
    .kn-table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin-top: 10px; }
    .kn-table th, .kn-table td { padding: 7px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .kn-table th { font-size: 12px; color: var(--muted); font-weight: 500; }
    .kn-syl { font-size: 13.5px; line-height: 1.7; }
    .kn-syl li { margin: 0 0 6px; }
    .kn-syl b { font-family: var(--serif); font-size: 15px; }
    .kn-syl .rad { color: var(--faint); font-size: 12px; }
    .kn-rads { font-size: 13px; color: var(--muted); }
  </style>`;

const calc = `<div class="kn-box">
      <div class="kn-tabs"><button type="button" class="kn-tab on" data-mode="birth">From my birth date</button><button type="button" class="kn-tab" data-mode="pick">Pick an element</button></div>
      <div id="kn-birth">
        <div class="kn-row">
          <label for="kn-date">Birth date<input id="kn-date" type="date" min="1900-01-01" max="2100-12-31" value="2000-06-15"></label>
          <label for="kn-time">Birth time<input id="kn-time" type="time" value="12:00"></label>
        </div>
        <label class="kn-check"><input type="checkbox" id="kn-no-time"> I don't know my birth time (the hour pillar is left out)</label>
        <div class="kn-row" style="margin-top: 10px;"><label for="kn-tz">Time zone of birthplace<select id="kn-tz"></select></label></div>
      </div>
      <div id="kn-pick" hidden>
        <div class="kn-row"><label for="kn-el">Element the name should carry<select id="kn-el"><option value="목">Wood 木</option><option value="화">Fire 火</option><option value="토">Earth 土</option><option value="금">Metal 金</option><option value="수">Water 水</option></select></label></div>
      </div>
      <div class="kn-style">
        <span>Name style:</span>
        <label><input type="radio" name="kn-style" value="any" checked> any</label>
        <label><input type="radio" name="kn-style" value="f"> feminine</label>
        <label><input type="radio" name="kn-style" value="m"> masculine</label>
      </div>
      <div class="kn-row" style="margin-top: 10px;"><label for="kn-surname">Surname (optional)<select id="kn-surname"></select></label></div>
      <button type="button" class="kn-go" id="kn-go">Suggest names</button>
      <div id="kn-out" hidden aria-live="polite">
        <div id="kn-chart"></div>
        <div class="kn-grid" id="kn-names"></div>
        <div id="kn-count"></div>
        <button type="button" class="kn-more" id="kn-more">Show a different twelve</button>
      </div>
    </div>`;

const howHtml = TEXT.how.map((s) => `      <h2>${esc(s.h)}</h2>\n` + s.p.map((p) => `      <p>${esc(p)}</p>`).join('\n')).join('\n');
const romHtml = `      <ul>\n${TEXT.romanization.map((b) => `        <li>${esc(b)}</li>`).join('\n')}\n      </ul>`;
const surnameHtml = `      <table class="kn-table"><thead><tr><th>Surname</th><th>Hangul · hanja</th><th>Meaning of the character</th></tr></thead><tbody>\n` +
  TEXT.surnames.map((s) => `        <tr><td><b>${esc(s.rr)}</b>${s.alt !== s.rr ? ` <span style="color: var(--faint);">(${esc(s.alt)})</span>` : ''}</td><td>${s.ko} ${s.hanja}</td><td>${esc(s.meaning)}</td></tr>`).join('\n') + `\n      </tbody></table>`;
const radHtml = EL_KEYS.map((k) => `<li><b>${EL_EN[k]}</b> — ${RADICALS[k].join(', ')}</li>`).join('\n        ');
const browseHtml = EL_KEYS.map((k, i) => {
  const rows = SYLLABLES.filter((s) => s.hj.some((h) => h.el === k)).map((s) => {
    const hs = s.hj.filter((h) => h.el === k).map((h) => `${h.h} ${esc(h.m)} <span class="rad">(${esc(h.r)})</span>`).join(' · ');
    const pos = s.pos === 'both' ? 'either position' : s.pos === 'first' ? 'usually first' : 'usually second';
    return `          <li><b>${s.s}</b> ${cap(s.rr)}${s.alt ? ` / ${s.alt}` : ''} <span class="rad">(${pos})</span><br>${hs}</li>`;
  }).join('\n');
  const n = SYLLABLES.reduce((c, s) => c + s.hj.filter((h) => h.el === k).length, 0);
  return `      <details class="ics-help"${i === 0 ? ' open' : ''}><summary>${EL_EN[k]} names — ${n} hanja</summary><div class="ih-body"><ul class="kn-syl">\n${rows}\n        </ul></div></details>`;
}).join('\n');
const faqHtml = TEXT.faq.map((f, i) => `      <details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><div class="ih-body"><p>${esc(f.a)}</p></div></details>`).join('\n');

const html = shell({
  rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV, extraHead: STYLE,
  jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: h1, url: SITE + url }]),
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: h1, url: SITE + url, description: desc, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', inLanguage: 'en', image: SITE + '/og-image-en.png', dateModified: MODIFIED, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: TEXT.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }],
  body: `
  <article class="guide-article">
    <div class="ga-overline">Tools</div>
    <h1 class="ga-title">${h1}</h1>
    <p class="ga-lead">${lead}</p>
    ${calc}
    <div class="ga-body">
${TEXT.intro.map((p) => `      <p>${esc(p)}</p>`).join('\n')}
${howHtml}
      <h2>Which radicals count as which element</h2>
      <p>The tool sorts every character by the customary table below. Characters whose radical is disputed between schools (the person radical 亻, for instance) are left out rather than guessed, which is why a few very common name hanja do not appear.</p>
      <ul class="kn-rads">
        ${radHtml}
      </ul>
      <h2>Saying the names</h2>
${romHtml}
      <h2>The twenty most common surnames</h2>
      <p>About half of all Koreans share the first five. Add one above to see how a full name reads.</p>
${surnameHtml}
      <h2>Browse the name syllables by element</h2>
      <p>Every syllable and hanja the generator draws from — ${SYLLABLES.length} syllables, ${hanjaCount} characters, each with its meaning and the radical that gives it its element.</p>
${browseHtml}
      <h2>FAQ</h2>
${faqHtml}
      <p class="callout" style="margin-top: 18px;">${esc(TEXT.disclaimer)}</p>
      <p class="callout"><a href="${rel}en/">Four Pillars calculator</a> · <a href="${rel}en/guide/day-master/">The ten Day Masters</a> · <a href="${rel}en/korean-age/">Korean age calculator</a> · <a href="${rel}en/zodiac/">Chinese zodiac calculator</a> · <a href="${rel}en/quiz/">Which Day Master are you?</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Read my Four Pillars chart</span></a>
    </div>
  </article>
<script src="${rel}js/manseryeok.js"></script>
<script src="${rel}js/en-names.js"></script>
<script src="${rel}js/en-name-gen.js"></script>`
});
const file = path.join(DOCS, 'en', 'korean-name', 'index.html');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, html);
console.log(`korean-name: ${SYLLABLES.length} syllables, ${hanjaCount} hanja → ${path.relative(ROOT_DIR, file)} (${(html.length / 1024).toFixed(0)} KB); title ${title.length}, desc ${desc.length}`);
