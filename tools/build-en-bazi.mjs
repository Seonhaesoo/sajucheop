/* /en/bazi-calculator/ — BaZi (Four Pillars of Destiny) calculator landing page, Chinese terminology on the same engine.
 * Prose: tools/en-bazi-text.mjs · logic: docs/js/en-bazi.js (hand-written). Listed in docs/sitemap.xml.  Usage: node tools/build-en-bazi.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { TEXT } from './en-bazi-text.mjs';
import { TEN_GOD_EN, STEM_PINYIN, BRANCH_PINYIN, STEM_EN, BRANCH_ANIMAL } from './en-ilju-data.mjs';

const { M, I } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const MODIFIED = '2026-11-02';   /* 2026-11-02: static worked example (the form's default birth data run through the engine at build time) so the page has a real chart without JavaScript — before: 2026-09-15 */

/* ---------- worked example — the form's default input (15 June 1990, 12:00, UTC+8, female, no solar-time correction) ---------- */
const EX = { y: 1990, m: 6, d: 15, hh: 12, mm: 0, tz: 480, gender: 'F' };
const ex = M.compute({ year: EX.y, month: EX.m, day: EX.d, hour: EX.hh, minute: EX.mm, gender: EX.gender, applySolarTime: false, tzOffsetMinutes: EX.tz });
const P = ex.pillars, dm = P.day.stem;
const tg = (k) => TEN_GOD_EN[k].name;
const stemCell = (s) => `<td class="han">${M.STEMS[s].han}<small>${STEM_PINYIN[s]} · ${STEM_EN[s]}</small></td>`;
const branchCell = (b) => `<td class="han">${M.BRANCHES[b].han}<small>${BRANCH_PINYIN[b]} · ${BRANCH_ANIMAL[b]}</small></td>`;
const hiddenCell = (b) => { const h = M.JIJANGGAN[b]; return `<td>${h.map((s, i) => (i === h.length - 1 ? `<b>${M.STEMS[s].han}</b>` : M.STEMS[s].han)).join(' ')}<small style="display:block;color:var(--faint);font-size:11px;">main ${STEM_PINYIN[h[h.length - 1]]} → ${tg(M.branchSipseong(dm, b))}</small></td>`; };
const cols = [['Year', P.year, ex.sipseong.yearStem], ['Month', P.month, ex.sipseong.monthStem], ['Day', P.day, 'Day Master'], ['Hour', P.hour, ex.sipseong.hourStem]];
const EL_EN = { '목': 'Wood', '화': 'Fire', '토': 'Earth', '금': 'Metal', '수': 'Water' };
const elLine = ['목', '화', '토', '금', '수'].map((k) => `${EL_EN[k]} ${ex.elements[k] || 0}`).join(' · ');
const STRENGTH_EN = { '신강': 'strong', '중화': 'balanced', '신약': 'weak' };
/* the jie that opened the example's month and the one that closes it — engine values in the birthplace's zone (no published table for 1990) */
const jieAt = (deg, approxJd) => I.findTermJd(deg, approxJd - 20, approxJd + 20);
const toZone = (jd) => { const t = jd - I.JDN_EPOCH + 0.5 + EX.tz / 1440, dn = Math.floor(t), c = I.civilFromDays(dn), mins = Math.round((t - dn) * 1440); return { ...c, hh: Math.floor(mins / 60), mm: mins % 60 }; };
const birthJd = I.daysFromCivil(EX.y, EX.m, EX.d) + I.JDN_EPOCH - 0.5 + (EX.hh * 60 + EX.mm - EX.tz) / 1440;
const monthStartDeg = (315 + ex.monthIdx * 30) % 360;
const mzJd = jieAt(monthStartDeg, birthJd), nextJd = jieAt((monthStartDeg + 30) % 360, birthJd + 30);
const mz = toZone(mzJd), nx = toZone(nextJd);
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (c) => `${c.d} ${MON[c.m - 1]} ${c.y}, ${String(c.hh).padStart(2, '0')}:${String(c.mm).padStart(2, '0')}`;
const TERM_EN = ['Li Chun 立春', 'Jing Zhe 驚蟄', 'Qing Ming 清明', 'Li Xia 立夏', 'Mang Zhong 芒種', 'Xiao Shu 小暑', 'Li Qiu 立秋', 'Bai Lu 白露', 'Han Lu 寒露', 'Li Dong 立冬', 'Da Xue 大雪', 'Xiao Han 小寒'];
const luck = ex.daeun.list.slice(0, 4);
const exampleHtml = `
      <h2>A worked example</h2>
      <p>This is what the calculator returns for its default entry — a woman born on ${EX.d} June ${EX.y} at ${String(EX.hh).padStart(2, '0')}:${String(EX.mm).padStart(2, '0')} in the UTC+8 zone, without the solar-time correction. The numbers below were produced by the same engine that runs in your browser, so you can check your own result against them.</p>
      <div style="overflow-x: auto;"><table class="bz-table">
        <tr><th></th>${cols.map(([n]) => `<th>${n}</th>`).join('')}</tr>
        <tr><th>Ten God of the stem</th>${cols.map(([, , k]) => `<td>${k === 'Day Master' ? '<b>Day Master</b>' : tg(k)}</td>`).join('')}</tr>
        <tr><th>Heavenly Stem</th>${cols.map(([, p]) => stemCell(p.stem)).join('')}</tr>
        <tr><th>Earthly Branch</th>${cols.map(([, p]) => branchCell(p.branch)).join('')}</tr>
        <tr><th>Hidden stems</th>${cols.map(([, p]) => hiddenCell(p.branch)).join('')}</tr>
      </table></div>
      <ul>
        <li><b>Day Master</b>: ${M.STEMS[dm].han} ${STEM_PINYIN[dm]}, ${STEM_EN[dm]}. Counting the stems and the main hidden stem of each branch, the chart holds ${elLine} — the Day Master is <b>${STRENGTH_EN[ex.strength.label]}</b> (${Math.round(ex.strength.ratio * 100)}% of the other characters support it), born in ${ex.season.name === '여름' ? 'summer' : ex.season.name === '봄' ? 'spring' : ex.season.name === '가을' ? 'autumn' : 'winter'}, when Fire is in season.</li>
        <li><b>Why the month is ${M.BRANCHES[P.month.branch].han} ${BRANCH_PINYIN[P.month.branch]}</b>: the Sun reached ${monthStartDeg}° of longitude (${TERM_EN[ex.monthIdx]}) on ${fmt(mz)} local time, and the next jie (${TERM_EN[(ex.monthIdx + 1) % 12]}) came on ${fmt(nx)}. Any birth between those two moments shares this month pillar; the calendar month is irrelevant.</li>
        <li><b>Why the year is ${M.STEMS[P.year.stem].han}${M.BRANCHES[P.year.branch].han}</b>: ${EX.y}'s Li Chun had passed, so the year pillar is simply ${EX.y}'s. A birth on 20 January ${EX.y} would still carry ${EX.y - 1}'s pillar.</li>
        <li><b>Hour</b>: ${String(EX.hh).padStart(2, '0')}:${String(EX.mm).padStart(2, '0')} falls in the ${M.BRANCHES[P.hour.branch].han} ${BRANCH_PINYIN[P.hour.branch]} hour (${String((P.hour.branch * 2 + 23) % 24).padStart(2, '0')}:00–${String((P.hour.branch * 2) % 24).padStart(2, '0')}:59); its stem ${M.STEMS[P.hour.stem].han} ${STEM_PINYIN[P.hour.stem]} follows from the day stem by the hour-stem rule.</li>
        <li><b>Luck Pillars</b>: a ${ex.daeun.forward ? 'yang-year man or yin-year woman counts forward' : 'yin-year man or yang-year woman counts backward'}; here they run <b>${ex.daeun.forward ? 'forward' : 'backward'}</b> from the month pillar. The gap from birth to the ${ex.daeun.forward ? 'next' : 'previous'} jie, divided by three, gives a starting age of ${ex.daeun.su}, so the first four pillars are ${luck.map((l) => `${M.STEMS[l.stem].han}${M.BRANCHES[l.branch].han} ${STEM_PINYIN[l.stem]} ${BRANCH_PINYIN[l.branch]} (ages ${l.startAge}–${l.endAge}, ${tg(l.sipseong)})`).join(', ')}.</li>
      </ul>
      <p>Switch on true solar time, change the zone, or enter your own date in the form above and every one of these lines is recomputed the same way.</p>`;
const rel = '../../', url = '/en/bazi-calculator/';
const NAV = [{ href: rel + 'en/', label: 'Saju' }, { href: rel + 'en/today/', label: 'Today' }, { href: rel + 'en/match/', label: 'Match' }, { href: rel + 'en/zodiac/', label: 'Zodiac' }, { href: rel + 'en/guide/', label: 'Library' }];
const title = 'BaZi Calculator — Free Four Pillars Chart & Luck Pillars';
const desc = 'Free BaZi (Four Pillars) calculator: Day Master, Ten Gods, hidden stems, five elements and 10-year Luck Pillars, with solar terms from the Sun\'s real position.';
const h1 = 'BaZi calculator';
const lead = 'Your Four Pillars of Destiny from the exact moment you were born — Day Master, Ten Gods, hidden stems, element balance, ten-year Luck Pillars and the annual pillars around now. Free, in your browser, nothing uploaded.';

const STYLE = `<style>
    .bz-form { margin: 6px 0 18px; padding: 16px; background: #FFFDF9; border: 1px solid var(--line); border-radius: 12px; }
    .bz-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .bz-row label { flex: 1 1 150px; display: block; font-size: 12.5px; font-weight: 700; color: var(--muted); }
    .bz-row input, .bz-row select { display: block; width: 100%; margin-top: 6px; font: inherit; font-size: 16px; padding: 9px 10px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); }
    .bz-row input:disabled { color: var(--faint); background: #F7F3EA; }
    .bz-check { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 13px; color: var(--muted); cursor: pointer; }
    .bz-form .bz-go { margin-top: 14px; width: 100%; font: inherit; font-weight: 700; padding: 11px 16px; border: 0; border-radius: 8px; background: var(--seal); color: #F6F1E8; cursor: pointer; }
    #bz-out h2 { margin-top: 26px; }
    #bz-when { font-size: 12.5px; color: var(--faint); margin: 6px 0 10px; }
    .bz-chart { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
    .bz-col { text-align: center; padding: 10px 4px 12px; border: 1px solid var(--line-soft); border-radius: 10px; background: #fff; }
    .bz-col.day { border-color: var(--seal); background: #FFF8F1; }
    .bz-lab { font-size: 11px; font-weight: 700; color: var(--faint); text-transform: uppercase; letter-spacing: 0.06em; }
    .bz-tg { font-size: 11.5px; font-weight: 700; color: var(--seal); margin-top: 4px; min-height: 15px; }
    .bz-han { font-family: var(--serif); font-size: 34px; font-weight: 700; line-height: 1.05; margin: 6px 0; }
    .bz-py { font-size: 10.5px; color: var(--muted); line-height: 1.45; }
    .bz-hidden { margin-top: 6px; font-family: var(--serif); font-size: 13px; letter-spacing: 1px; }
    .bz-hidden i { font-style: normal; font-family: var(--sans); font-size: 9px; color: var(--faint); text-transform: uppercase; letter-spacing: 0; display: block; }
    .bz-hidden .main { font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
    .bz-tg2 { font-size: 10.5px; color: var(--muted); margin-top: 2px; }
    .bz-dm { display: flex; gap: 14px; align-items: flex-start; padding: 14px; border: 1px solid var(--line-soft); border-radius: 12px; background: #fff; }
    .bz-dm-han { font-family: var(--serif); font-size: 64px; font-weight: 700; line-height: 1; }
    .bz-dm-body { font-size: 13.5px; line-height: 1.65; } .bz-dm-body b { font-size: 15px; } .bz-dm-body p { margin: 6px 0 8px; }
    .bz-fill-목 { background: var(--el-mok); } .bz-fill-화 { background: var(--el-hwa); } .bz-fill-토 { background: var(--el-to); } .bz-fill-금 { background: var(--el-geum); } .bz-fill-수 { background: var(--el-su); }
    .bz-tg-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
    .bz-tg-cell { text-align: center; padding: 10px 4px; border: 1px solid var(--line-soft); border-radius: 10px; background: #fff; font-size: 11.5px; line-height: 1.35; }
    .bz-tg-cell b { display: block; font-family: var(--serif); font-size: 22px; color: var(--seal); }
    .bz-tg-cell.none { opacity: 0.55; } .bz-tg-cell.none b { color: var(--faint); }
    .bz-tg-cell small { display: block; font-family: var(--serif); color: var(--faint); font-size: 11px; }
    .bz-tg-cell a { color: inherit; text-decoration: none; }
    .bz-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
    .bz-table th, .bz-table td { padding: 7px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .bz-table th { font-size: 11.5px; color: var(--muted); font-weight: 500; }
    .bz-table td.han { font-family: var(--serif); font-size: 18px; white-space: nowrap; } .bz-table td.han small { display: block; font-family: var(--sans); font-size: 11px; color: var(--faint); }
    .bz-table tr.cur td { background: #FBF3E6; }
    .bz-links a { display: block; margin-top: 8px; color: var(--seal); font-size: 14px; }
    .bz-actions { margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; }
    .bz-actions button { font: inherit; font-weight: 700; font-size: 13px; padding: 9px 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); cursor: pointer; }
    .bz-gloss dt { font-weight: 700; margin-top: 10px; } .bz-gloss dd { margin: 2px 0 0; color: var(--muted); font-size: 13.5px; }
    @media (max-width: 480px) { .bz-chart { gap: 4px; } .bz-han { font-size: 26px; } .bz-py { font-size: 9.5px; } .bz-tg-grid { grid-template-columns: repeat(5, 1fr); } .bz-tg-cell { font-size: 10px; padding: 8px 2px; } .bz-tg-cell b { font-size: 18px; } }
  </style>`;

const calc = `<div class="bz-form">
      <div class="bz-row">
        <label for="bz-date">Birth date<input id="bz-date" type="date" min="1900-01-01" max="2100-12-31" value="1990-06-15"></label>
        <label for="bz-time">Birth time (24h)<input id="bz-time" type="time" value="12:00"></label>
      </div>
      <label class="bz-check"><input type="checkbox" id="bz-no-time"> I don't know my birth hour (the chart is built from six characters)</label>
      <div class="bz-row" style="margin-top: 10px;">
        <label for="bz-tz">Time zone of birthplace<select id="bz-tz"></select></label>
        <label for="bz-gender">Gender (sets Luck Pillar direction)<select id="bz-gender"><option value="F">Female</option><option value="M">Male</option></select></label>
      </div>
      <label class="bz-check"><input type="checkbox" id="bz-solar"> Apply true solar time (longitude correction)</label>
      <div class="bz-row" id="bz-lon-row" hidden>
        <label for="bz-lon">Birthplace longitude — east positive, west negative<input id="bz-lon" type="number" step="0.01" min="-180" max="180" placeholder="e.g. 103.82 for Singapore"></label>
      </div>
      <p class="form-microcopy" style="text-align: left; margin-top: 8px;">Longitudes: Singapore 103.82 · Kuala Lumpur 101.69 · Jakarta 106.85 · Bangkok 100.50 · Manila 120.98 · Hong Kong 114.17 · Taipei 121.56 · Beijing 116.40 · Seoul 126.98 · Tokyo 139.69 · Sydney 151.21 · London −0.13 · New York −74.01 · Los Angeles −118.24</p>
      <button type="button" class="bz-go" id="bz-run">Calculate my BaZi chart</button>
    </div>
    <div id="bz-out" hidden>
      <h2>Your Four Pillars</h2>
      <p id="bz-when"></p>
      <div class="bz-chart" id="bz-chart"></div>
      <p class="form-microcopy" style="text-align: left;">Top row: the Ten God each stem plays for your Day Master. Underlined hidden stem = the branch's main qi; hover a hidden stem for its Ten God.</p>
      <h2>Day Master</h2>
      <div class="bz-dm" id="bz-dm"></div>
      <h2>Five elements</h2>
      <div id="bz-elements"></div>
      <h2>Ten Gods</h2>
      <div id="bz-tengods"></div>
      <h2>Special stars (神殺)</h2>
      <div id="bz-stars"></div>
      <h2>Luck Pillars (大運)</h2>
      <p id="bz-luck-intro"></p>
      <div class="zd-wrap" style="overflow-x: auto;" id="bz-luck"></div>
      <h2>Annual pillars (流年)</h2>
      <p>Each year runs from Li Chun to Li Chun. The last column shows how the year's branch meets your day branch.</p>
      <div style="overflow-x: auto;" id="bz-years"></div>
      <div class="bz-actions"><button type="button" id="bz-copy">Copy chart as text</button></div>
      <div class="bz-links" id="bz-links"></div>
    </div>`;

const sectionsHtml = TEXT.sections.map((s) => `      <h2>${esc(s.h)}</h2>\n` + s.p.map((p) => `      <p>${esc(p).replace('read the comparison', `<a href="${rel}en/guide/saju-vs-bazi/">read the comparison</a>`)}</p>`).join('\n')).join('\n');
const glossHtml = `      <dl class="bz-gloss">\n${TEXT.glossary.map((g) => `        <dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd>`).join('\n')}\n      </dl>`;
const faqHtml = TEXT.faq.map((f, i) => `      <details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><div class="ih-body"><p>${esc(f.a)}</p></div></details>`).join('\n');

const html = shell({
  rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV, extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">`,
  jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: h1, url: SITE + url }]),
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'BaZi Calculator — Four Pillars of Destiny', url: SITE + url, description: desc, applicationCategory: 'LifestyleApplication', operatingSystem: 'Any', inLanguage: 'en', image: SITE + '/og-image-en.png', dateModified: MODIFIED, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: TEXT.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }],
  body: `
  <article class="guide-article">
    <div class="ga-overline">Four Pillars of Destiny · 八字</div>
    <h1 class="ga-title">${h1}</h1>
    <p class="ga-lead">${lead}</p>
    ${calc}
    <div class="ga-body">
${TEXT.intro.map((p) => `      <p>${esc(p)}</p>`).join('\n')}
${exampleHtml}
${sectionsHtml}
      <h2>Glossary</h2>
${glossHtml}
      <h2>FAQ</h2>
${faqHtml}
      <p class="callout"><a href="${rel}en/">Korean-style saju reading</a> · <a href="${rel}en/guide/day-master/">The ten Day Masters</a> · <a href="${rel}en/guide/day-pillar/">60 Day Pillars</a> · <a href="${rel}en/guide/ten-gods/">Ten Gods</a> · <a href="${rel}en/guide/luck-pillars/">Luck Pillars explained</a> · <a href="${rel}en/solar-terms/">24 solar terms</a> · <a href="${rel}en/guide/saju-vs-bazi/">Saju vs BaZi</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Read the same chart the Korean way</span></a>
    </div>
  </article>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script src="${rel}js/manseryeok.js"></script>
<script src="${rel}js/en-daymaster.js"></script>
<script src="${rel}js/en-pillar-slugs.js"></script>
<script src="${rel}js/shensha.js"></script>
<script src="${rel}js/en-bazi.js"></script>
<script src="${rel}js/cinema.js" defer></script>`   /* 명식 펼침 연출(window.Cinema) — 전에는 docs 쪽 HTML에만 손으로 넣어 두어 다시 만들면 빠졌다(2026-11-02 빌더에 반영) */
});
const file = path.join(DOCS, 'en', 'bazi-calculator', 'index.html');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, html);
console.log(`bazi-calculator → ${path.relative(ROOT_DIR, file)} (${(html.length / 1024).toFixed(0)} KB); title ${title.length}, desc ${desc.length}; sections ${TEXT.sections.length}, faq ${TEXT.faq.length}`);
