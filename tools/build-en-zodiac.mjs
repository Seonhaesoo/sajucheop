/* English Chinese zodiac — /en/zodiac/ (birth-date calculator + years chart), /en/zodiac/<animal>/ ×12,
 * /en/zodiac/year/<1924–2031>/ ×108, /en/zodiac/compatibility/ + /<a>-<b>/ ×78, /en/2027/ + /<animal>/ ×12 → sitemap-en-zodiac.xml.
 * Scores and relationships are the Korean 띠 궁합 and 2027 신년운세 numbers (ddi-data, newyear-2027-data), so both languages agree.
 * Zodiac-year boundaries are Chinese Lunar New Year (cny.mjs, UTC+8); the Korean saju boundary (Ipchun) comes from the engine. */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { DDI, REL, relations, elRelation, SAMHAP_G, BANGHAP_G } from './ddi-data.mjs';
import { YEAR_REL_SCORE, YEAR_EL_ADJ, SAMJAE_ADJ } from './newyear-2027-data.mjs';
import { ANIMALS, EL, GEN_METAPHOR, CTL_METAPHOR, SAMHAP_EN, BANGHAP_EN, REL_EN, EL_REL_EN, gradeEn, Y27_OPENER, Y27_REL, Y27_EL, SAMJAE_EN, Y27_MONTH } from './en-zodiac-data.mjs';
import { STEM_PINYIN, BRANCH_PINYIN } from './en-ilju-data.mjs';
import { zodiacSpan, lunarNewYear, koreaTz } from './cny.mjs';

const { M, I } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-11';
const Y0 = 1924, Y1 = 2031, NOW = 2026;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtD = (c) => `${MON[c.m - 1]} ${c.d}, ${c.y}`;
const fmtMD = (c) => `${MON[c.m - 1]} ${c.d}`;
const iso = (c) => `${c.y}-${String(c.m).padStart(2, '0')}-${String(c.d).padStart(2, '0')}`;
const fill = (s, m) => s.replace(/\{(\w+)\}/g, (_, k) => (m[k] == null ? '' : m[k]));
const dayBefore = (c) => { const x = I.civilFromDays(I.daysFromCivil(c.y, c.m, c.d) - 1); return { y: x.y, m: x.m, d: x.d }; };
const cmp = (a, b) => I.daysFromCivil(a.y, a.m, a.d) - I.daysFromCivil(b.y, b.m, b.d);

/* ---------- data checks ---------- */
ANIMALS.forEach((a, b) => {
  if (a.slug !== DDI[b].slug) throw new Error('animal order: ' + a.slug);
  if (Object.keys(a.el).length !== 5) throw new Error('element lines: ' + a.slug);
  if (!Y27_OPENER[a.slug]) throw new Error('2027 opener: ' + a.slug);
  if (!Y27_REL[DDI[b].rel]) throw new Error('2027 relation text: ' + DDI[b].rel);
});

/* ---------- years ---------- */
const stemOf = (y) => ((y - 4) % 10 + 10) % 10;
const branchOf = (y) => ((y - 4) % 12 + 12) % 12;
function jdToKst(jd) {
  const t = jd - I.JDN_EPOCH + 0.5 + 9 / 24, dn = Math.floor(t), cv = I.civilFromDays(dn), frac = t - dn;
  let hh = Math.floor(frac * 24), mm = Math.round((frac * 24 - hh) * 60);
  if (mm === 60) { hh += 1; mm = 0; }
  return { y: cv.y, m: cv.m, d: cv.d, hh, mm };
}
const hhmm = (c) => `${String(c.hh).padStart(2, '0')}:${String(c.mm).padStart(2, '0')}`;
function yearInfo(y) {
  const s = stemOf(y), b = branchOf(y), A = ANIMALS[b], st = M.STEMS[s], br = M.BRANCHES[b];
  const elE = EL[st.el].en, span = zodiacSpan(y), kr = lunarNewYear(y, koreaTz(y));
  return { y, s, b, A, elK: st.el, elE, name: `${elE} ${A.name}`, han: st.han + br.han, pinyin: `${STEM_PINYIN[s]} ${BRANCH_PINYIN[b]}`, kor: st.kor + br.kor, yang: st.yang,
    doubled: st.el === DDI[b].el, span, seollal: { y: kr.y, m: kr.m, d: kr.d }, ip: jdToKst(I.ipchunJd(y)) };
}
const YI = {};
for (let y = Y0 - 1; y <= Y1 + 1; y++) YI[y] = yearInfo(y);
const yearsOf = (b) => Object.values(YI).filter((x) => x.b === b && x.y >= Y0 && x.y <= Y1);

/* ---------- compatibility (same as build-ddi-gunghap pairScore) ---------- */
function pairScore(a, b) {
  const rels = relations(a, b);
  let s = 60;
  for (const r of rels) s += REL[r].score;
  const er = elRelation(DDI[a].el, DDI[b].el);
  if (er === 'gen' || er === 'gen_by') s += 6;
  else if (er === 'ctl' || er === 'ctl_by') s -= 6;
  else if (er === 'same' && a !== b) s += 3;
  return { score: Math.max(25, Math.min(98, s)), rels, er };
}
const primary = (rels) => (rels.includes('selfhyeong') ? 'selfhyeong' : rels.find((r) => r !== 'same' && r !== 'selfhyeong') || rels[0] || 'none');
const PAIR = {};
for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) PAIR[a + '-' + b] = pairScore(a, b);
const pairUrl = (a, b) => (a <= b ? `/en/zodiac/compatibility/${ANIMALS[a].slug}-${ANIMALS[b].slug}/` : `/en/zodiac/compatibility/${ANIMALS[b].slug}-${ANIMALS[a].slug}/`);
const ranking = (a) => ANIMALS.map((_, i) => ({ i, ...PAIR[a + '-' + i] })).sort((x, y) => y.score - x.score || x.i - y.i);
const elRelWord = (er) => (er === 'same' ? 'same element' : er === 'gen' || er === 'gen_by' ? 'elements nourish' : 'elements control');

/* ---------- 2027 ---------- */
const YB = 7, YS = 3;
function score27(b) {
  let s = 78;
  for (const r of relations(b, YB)) s += YEAR_REL_SCORE[r] || 0;
  s += YEAR_EL_ADJ[DDI[b].el];
  if (DDI[b].samjae) s += SAMJAE_ADJ;
  return Math.max(60, Math.min(95, s));
}
function grade27(score) {
  if (score >= 90) return { label: 'An excellent year', tone: 'good' };
  if (score >= 80) return { label: 'A favorable year', tone: 'good' };
  if (score >= 70) return { label: 'A steady year', tone: 'neutral' };
  return { label: 'A year for care', tone: 'warn' };
}
const S27 = ANIMALS.map((_, b) => score27(b));
const CNY27 = zodiacSpan(2027), SEOLLAL27 = YI[2027].seollal, IPCHUN27 = YI[2027].ip;
const TERM_EN = ['Start of Spring', 'Awakening of Insects', 'Clear and Bright', 'Start of Summer', 'Grain in Ear', 'Minor Heat', 'Start of Autumn', 'White Dew', 'Cold Dew', 'Start of Winter', 'Major Snow', 'Minor Cold'];
const MONTHS27 = [];
{
  let jd = I.ipchunJd(2027);
  for (let i = 0; i < 12; i++) {
    if (i > 0) jd = I.findTermJd((315 + 30 * i) % 360, jd + 20, jd + 40);
    const inStem = ((YS % 5) * 2 + 2) % 10;
    MONTHS27.push({ i, term: TERM_EN[i], start: jdToKst(jd), stem: (inStem + i) % 10, branch: (2 + i) % 12 });
  }
  const end = jdToKst(I.findTermJd(315, jd + 20, jd + 40));
  MONTHS27.forEach((mo, i) => { mo.end = dayBefore(i < 11 ? MONTHS27[i + 1].start : end); });
}
const monthRel = (b, mb) => { const r = relations(b, mb); return primary(r); };

/* ---------- output ---------- */
const urls = [];
function write(url, html) {
  const file = path.join(DOCS, url.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  urls.push(url);
}
const NAV = (rel) => [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/zodiac/', label: 'Zodiac' }, { href: rel + 'en/2027/', label: '2027' }, { href: rel + 'en/match/', label: 'Match' }, { href: rel, label: '한국어' }];
const STYLE = `<style>
    .zd-hero { margin: 0 0 18px; padding: 22px 20px; background: #221D17; border-radius: 14px; text-align: center; color: #F6F1E8; }
    .zd-hero .zd-over { font-size: 12px; letter-spacing: 3px; color: #E0B04A; text-transform: uppercase; }
    .zd-hero .zd-han { font-family: 'Noto Serif KR', serif; font-size: 42px; font-weight: 700; letter-spacing: 4px; margin: 8px 0 2px; }
    .zd-hero .zd-sub { font-size: 13px; color: #CFC5B4; }
    .zd-hero .zd-score { font-size: 48px; font-weight: 700; color: #E0B04A; line-height: 1.1; margin-top: 8px; }
    .zd-hero .zd-score span { font-size: 18px; }
    .zd-hero .zd-bar { height: 8px; border-radius: 999px; background: rgba(246,241,232,.15); margin: 12px auto 0; max-width: 320px; overflow: hidden; }
    .zd-hero .zd-bar i { display: block; height: 100%; background: #E0B04A; }
    .zd-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 12px; }
    .zd-badge { font-size: 12px; padding: 3px 10px; border-radius: 999px; border: 1px solid rgba(246,241,232,.35); color: #F6F1E8; }
    .zd-badge.good { border-color: #E0B04A; color: #E0B04A; } .zd-badge.bad { border-color: #E07A6A; color: #E07A6A; }
    .zd-meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 6px; }
    .zd-meta span { font-size: 12px; padding: 3px 9px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); }
    .zd-meta span b { color: var(--ink); font-weight: 600; }
    .zd-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 8px 0 4px; }
    .zd-two > div { padding: 12px 14px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; font-size: 13.5px; line-height: 1.6; }
    .zd-two b { display: block; font-family: 'Noto Serif KR', serif; font-size: 15px; margin-bottom: 4px; }
    .zd-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 8px 0 16px; }
    .zd-grid a { display: block; padding: 10px 6px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; text-decoration: none; color: inherit; text-align: center; }
    .zd-grid a b { display: block; font-family: 'Noto Serif KR', serif; font-size: 20px; }
    .zd-grid a span { display: block; font-size: 13px; font-weight: 600; margin-top: 2px; }
    .zd-grid a small { display: block; font-size: 10.5px; color: var(--faint); margin-top: 2px; line-height: 1.4; }
    .zd-grid a small i { font-style: normal; color: var(--seal); font-weight: 700; }
    .zd-grid a.cur { border-color: var(--seal); background: #FBF3E6; }
    .zd-table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 6px 0 14px; }
    .zd-table th, .zd-table td { padding: 8px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .zd-table th { font-size: 12px; color: var(--muted); font-weight: 500; }
    .zd-table td a { text-decoration: none; font-weight: 600; }
    .zd-table td small { color: var(--faint); }
    .zd-table .good { color: #1E5C46; font-weight: 700; } .zd-table .bad { color: var(--seal); font-weight: 700; }
    .zd-table tr.cur td { background: #FBF3E6; }
    .zd-matrix { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; min-width: 520px; }
    .zd-matrix th, .zd-matrix td { padding: 5px 2px; text-align: center; border: 1px solid var(--line-soft); }
    .zd-matrix th { font-weight: 500; color: var(--faint); font-size: 11px; }
    .zd-matrix a { text-decoration: none; color: inherit; display: block; }
    .zd-matrix .g3 { background: #E9F3EC; } .zd-matrix .g2 { background: #F4F7F0; } .zd-matrix .g1 { background: #FBF3E6; } .zd-matrix .g0 { background: #F8E7E2; }
    .zd-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0 0; }
    .zd-chips a { font-size: 12.5px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--line); text-decoration: none; color: inherit; background: #FFFDF9; }
    .zd-list { list-style: none; padding: 0; margin: 6px 0 0; }
    .zd-list li { padding: 9px 0; border-bottom: 1px solid var(--line-soft); font-size: 13.5px; line-height: 1.6; }
    .zd-list li b { font-family: 'Noto Serif KR', serif; }
    .zd-list li small { color: var(--faint); margin-left: 4px; }
    .zd-calc { margin: 6px 0 18px; padding: 16px; background: #FFFDF9; border: 1px solid var(--line); border-radius: 12px; }
    .zd-calc label { display: block; font-size: 12.5px; font-weight: 700; color: var(--muted); margin-bottom: 6px; }
    .zd-calc .row { display: flex; gap: 8px; }
    .zd-calc input { flex: 1; min-width: 0; font: inherit; font-size: 16px; padding: 9px 10px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .zd-calc button { font: inherit; font-weight: 700; padding: 0 16px; border: 0; border-radius: 8px; background: var(--seal); color: #F6F1E8; cursor: pointer; }
    .zd-out { margin-top: 12px; font-size: 14px; line-height: 1.7; }
    .zd-out b.big { display: block; font-family: 'Noto Serif KR', serif; font-size: 22px; color: var(--seal); }
    .zd-wrap { overflow-x: auto; }
    @media (max-width: 480px) { .zd-two { grid-template-columns: 1fr; } .zd-grid { grid-template-columns: repeat(3, 1fr); } .zd-hero .zd-han { font-size: 34px; } }
  </style>`;
const alt = (url, ko) => `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">` + (ko ? `\n  <link rel="alternate" hreflang="ko" href="${SITE}${ko}">` : '');
const article = (url, title, desc) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: PUBLISHED, dateModified: PUBLISHED, inLanguage: 'en', author: { '@type': 'Organization', name: 'Sajucheop' }, publisher: { '@type': 'Organization', name: 'Sajucheop' }, mainEntityOfPage: SITE + url });
const crumbs = (items) => breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }].concat(items.map(([name, url]) => ({ name, url: SITE + url }))));
const aUrl = (b) => `/en/zodiac/${ANIMALS[b].slug}/`;
const yUrl = (y) => `/en/zodiac/year/${y}/`;
const y27Url = (b) => `/en/2027/${ANIMALS[b].slug}/`;
const han = (b) => M.BRANCHES[b].han;
const relTag = (r) => `${REL_EN[r].label}${REL_EN[r].han ? ` (${REL_EN[r].han})` : ''}`;

/* ---------- pair pages ---------- */
function pairPage(a, b) {
  const A = ANIMALS[a], B = ANIMALS[b], url = pairUrl(a, b), rel = '../../../../';
  const { score, rels, er } = PAIR[a + '-' + b];
  const g = gradeEn(score), p = primary(rels), R = REL_EN[p];
  const elA = EL[DDI[a].el], elB = EL[DDI[b].el];
  const metaphor = er === 'gen' ? GEN_METAPHOR[DDI[a].el + DDI[b].el] : er === 'gen_by' ? GEN_METAPHOR[DDI[b].el + DDI[a].el] : er === 'ctl' ? CTL_METAPHOR[DDI[a].el + DDI[b].el] : er === 'ctl_by' ? CTL_METAPHOR[DDI[b].el + DDI[a].el] : '';
  const map = { A: A.name, B: B.name, ah: han(a), bh: han(b), ae: elA.en, be: elB.en, metaphor, group: p === 'samhap' ? SAMHAP_EN[SAMHAP_G[a]] : p === 'banghap' ? BANGHAP_EN[BANGHAP_G[a]] : '' };
  const relText = fill(R.body, map), elText = fill(EL_REL_EN[er], map);
  const extra = rels.filter((r) => r !== p && r !== 'same').map((r) => `They also form ${/^[AEIOU]/.test(REL_EN[r].long) ? 'an' : 'a'} ${REL_EN[r].long.toLowerCase()} (${REL_EN[r].han}) link, which ${REL_EN[r].tone === 'good' ? 'adds to the pull between them' : 'adds some friction to the mix'}.`).join(' ');
  const same = a === b;
  const title = same ? `${A.name} and ${A.name} Compatibility — Two ${A.name}s, ${score}/100 (${g.label}) | Chinese Zodiac` : `${A.name} and ${B.name} Compatibility — ${score}/100, ${g.label} | Chinese Zodiac`;
  const desc = same
    ? `Two ${A.name}s together score ${score}/100 in Chinese zodiac compatibility: ${R.label.toLowerCase()}. Love, friendship, family and how to make it work, with the Korean saju reading behind the score.`
    : `${A.name} and ${B.name} compatibility is ${score}/100 — ${g.label.toLowerCase()}. ${rels.length ? rels.filter((r) => r !== 'same').map((r) => REL_EN[r].long).join(' and ') + ' between their branches, ' : 'No fixed branch link, '}${elA.en} and ${elB.en} ${er === 'same' ? 'as the same element' : er === 'gen' || er === 'gen_by' ? 'in a nourishing cycle' : 'in a controlling cycle'}. Love, marriage, friendship and family (also read as ${B.name} and ${A.name}).`;
  const badges = rels.filter((r) => !(r === 'same' && p === 'selfhyeong')).map((r) => `<span class="zd-badge ${REL_EN[r].tone}">${relTag(r)}</span>`).join('') + `<span class="zd-badge">${elA.en} (${elA.han}) · ${elB.en} (${elB.han}) — ${elRelWord(er)}</span>`;
  const chipsFor = (x) => ranking(x).filter((r) => r.i !== (x === a ? b : a)).map((r) => `<a href="${rel}${pairUrl(x, r.i).slice(1)}">${ANIMALS[r.i].name} ${r.score}</a>`).join('');
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/zodiac/compatibility/" style="color: inherit; text-decoration: none;">Chinese zodiac compatibility</a> · <a href="${rel}${aUrl(a).slice(1)}" style="color: inherit; text-decoration: none;">${A.name}</a>${same ? '' : ` · <a href="${rel}${aUrl(b).slice(1)}" style="color: inherit; text-decoration: none;">${B.name}</a>`}</div>
    <h1 class="ga-title">${same ? `${A.name} and ${A.name} compatibility` : `${A.name} and ${B.name} compatibility`} —<br>${esc(R.title)}</h1>
    <p class="ga-meta">Birth-year branches ${han(a)} (${elA.en}) and ${han(b)} (${elB.en}) · same scoring as the Korean 띠 궁합 table</p>
    <div class="zd-hero">
      <div class="zd-han">${han(a)} · ${han(b)}</div>
      <div class="zd-score">${score}<span>/100</span></div>
      <div class="zd-sub">${g.label}</div>
      <div class="zd-bar"><i style="width: ${score}%"></i></div>
      <div class="zd-badges">${badges}</div>
    </div>
    <p class="ga-lead">${esc(relText.split('. ')[0])}. ${esc(elText.split('. ')[0])}.</p>
    <div class="ga-body">
      <h2>The two signs</h2>
      <div class="zd-two">
        <div><b>${A.name} — ${esc(A.key.toLowerCase())}</b>${esc(A.short)}</div>
        <div><b>${B.name} — ${esc(B.key.toLowerCase())}</b>${esc(B.short)}</div>
      </div>
      <h2>How the branches meet — ${esc(R.title.split(' — ')[0])}</h2>
      <p>${esc(relText)}${extra ? ' ' + esc(extra) : ''}</p>
      <h2>The elements</h2>
      <p>${esc(elText)}</p>
      <h2>In love and marriage</h2>
      <p>${esc(R.love)} ${esc(A.love)}${same ? '' : ' ' + esc(B.love)}</p>
      <h2>As friends and colleagues</h2>
      <p>${esc(R.friend)} ${esc(A.work)}${same ? '' : ' ' + esc(B.work)}</p>
      <h2>As family</h2>
      <p>${esc(R.family)} ${same ? `The ${A.name}’s weak spot — ${esc(A.challenges[0])} — is shared here, so name it out loud.` : `The ${A.name}’s weak spot is ${esc(A.challenges[0])}; the ${B.name}’s is ${esc(B.challenges[0])}. Knowing that solves half the problem.`}</p>
      <h2>Making it work</h2>
      <ul class="zd-list">${R.advice.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <h2>Does it matter who is the man and who is the woman?</h2>
      <p>Not in the branch reading — the relationship between ${han(a)} and ${han(b)} is the same either way, and so is the score. What does change the picture is the rest of each birth chart: the Day Masters, the elements each of you is missing, and when your ten-year luck cycles turn. Two full birth dates on the <a href="${rel}en/match/">match page</a> read all of that.</p>
      <h2>Other matches for the ${A.name}</h2>
      <div class="zd-chips">${chipsFor(a)}</div>
      ${same ? '' : `<h2>Other matches for the ${B.name}</h2>
      <div class="zd-chips">${chipsFor(b)}</div>`}
      <p class="callout">Your sign comes from your birth year, but the year starts at Lunar New Year, not January 1 — check yours on the <a href="${rel}en/zodiac/">zodiac calculator</a>. More: <a href="${rel}${aUrl(a).slice(1)}">${A.name} years and personality</a>${same ? '' : ` · <a href="${rel}${aUrl(b).slice(1)}">${B.name} years and personality</a>`} · <a href="${rel}${y27Url(a).slice(1)}">${A.name} in 2027</a> · <a href="${rel}ddi-gunghap/${url.split('/')[4]}/" hreflang="ko">한국어</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/match/"><span class="seal-dot" aria-hidden="true"></span><span>Compare two full birth charts</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: same ? `Two ${A.name}s — ${score}/100` : `${A.name} × ${B.name} — ${score}/100, ${g.label}`,
    extraHead: STYLE + alt(url, `/ddi-gunghap/${url.split('/')[4]}/`),
    jsonld: [crumbs([['Chinese Zodiac', '/en/zodiac/'], ['Compatibility', '/en/zodiac/compatibility/'], [same ? `${A.name} × ${A.name}` : `${A.name} × ${B.name}`, url]]), article(url, title, desc)], body }));
}

function compatIndex() {
  const url = '/en/zodiac/compatibility/', rel = '../../../';
  const cls = (s) => (s >= 85 ? 'g3' : s >= 75 ? 'g2' : s >= 62 ? 'g1' : 'g0');
  const head = ANIMALS.map((A, b) => `<th>${han(b)}<br>${A.name}</th>`).join('');
  const rows = ANIMALS.map((A, a) => `<tr><th>${han(a)} ${A.name}</th>${ANIMALS.map((B, b) => { const s = PAIR[a + '-' + b].score; return `<td class="${cls(s)}"><a href="${rel}${pairUrl(a, b).slice(1)}" title="${A.name} × ${B.name}: ${s}">${s}</a></td>`; }).join('')}</tr>`).join('\n        ');
  const pairsOf = (key) => { const out = []; for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) if (PAIR[a + '-' + b].rels.includes(key)) out.push(`<a href="${rel}${pairUrl(a, b).slice(1)}">${ANIMALS[a].name} & ${ANIMALS[b].name}</a>`); return out.join(''); };
  const title = 'Chinese Zodiac Compatibility Chart — All 78 Pairings Scored (12 × 12 Table)';
  const desc = 'Every Chinese zodiac pairing scored out of 100: secret friends (Six Harmony), trines, seasonal trios, clashes, punishments, harms and breaks between the twelve birth-year animals — with love, friendship and family readings for each pair.';
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/zodiac/" style="color: inherit; text-decoration: none;">Chinese zodiac</a> · Compatibility</div>
    <h1 class="ga-title">Chinese zodiac compatibility —<br>twelve signs, seventy-eight pairings</h1>
    <p class="ga-meta">Rows and columns are birth-year animals · green = strong match · red = clashing pair · tap a score for the full reading</p>
    <p class="ga-lead">Zodiac compatibility compares the branches of two birth years. Branches that harmonize pull people together; branches that clash or punish rub against each other. The score adds the elements of the two animals on top — the same numbers our Korean 띠 궁합 table uses.</p>
    <div class="ga-body">
      <div class="zd-wrap"><table class="zd-matrix">
        <tr><th></th>${head}</tr>
        ${rows}
      </table></div>
      <h2>Secret friends — Six Harmony (六合)</h2>
      <p>Six pairs of branches that recognize each other as partners. Tradition counts them among the best matches for marriage.</p>
      <div class="zd-chips">${pairsOf('yukhap')}</div>
      <h2>Natural allies — the four trines (三合)</h2>
      <p>${SAMHAP_EN.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('; ')}. Signs in the same trine face the same direction and multiply each other’s strength.</p>
      <div class="zd-chips">${pairsOf('samhap')}</div>
      <h2>Opposites — the six clashes (沖)</h2>
      <p>Signs directly across the wheel from each other. Strong chemistry, frequent collisions — a relationship that works through a division of labor rather than sameness.</p>
      <div class="zd-chips">${pairsOf('chung')}</div>
      <h2>Friction — punishment (刑), harm (害), break (破) and wonjin (怨嗔)</h2>
      <p>Milder frictions: punishment polishes through criticism, harm drains through small losses, break cracks plans at the finish, and wonjin — a pairing Korean tradition watches closely — breeds quiet resentment at close range. None of these rules a relationship out; they tell you where to take care.</p>
      <p class="callout">Pick your own sign: ${ANIMALS.map((A, b) => `<a href="${rel}${aUrl(b).slice(1)}">${A.name}</a>`).join(' · ')} · <a href="${rel}ddi-gunghap/" hreflang="ko">한국어 띠 궁합표</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/match/"><span class="seal-dot" aria-hidden="true"></span><span>Compare two full birth charts</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: 'Chinese zodiac compatibility — 78 pairings', extraHead: STYLE + alt(url, '/ddi-gunghap/'),
    jsonld: [crumbs([['Chinese Zodiac', '/en/zodiac/'], ['Compatibility', url]]), article(url, title, desc)], body }));
}

/* ---------- animal pages ---------- */
function animalPage(b) {
  const A = ANIMALS[b], url = aUrl(b), rel = '../../../', el = EL[DDI[b].el];
  const ys = yearsOf(b), rk = ranking(b);
  const best = rk.filter((r) => r.i !== b).slice(0, 3), worst = rk.filter((r) => r.i !== b).slice(-2).reverse();
  const g27 = grade27(S27[b]);
  const title = `Year of the ${A.name} — ${A.name} Years, Personality & Compatibility | Chinese Zodiac`;
  const desc = `${A.name} years: ${ys.map((x) => x.y).join(', ')}. The ${A.name} (${han(b)}) is ${A.key.toLowerCase()} — strengths, weaknesses, love and career, the five element types, best and worst matches, and the ${A.name} in 2027.`;
  const yearRows = ys.map((x) => `<tr${x.y === NOW ? ' class="cur"' : ''}><td><a href="${rel}${yUrl(x.y).slice(1)}">${x.y}</a></td><td>${x.name} <small>${x.han}</small></td><td>${fmtD(x.span.start)} – ${fmtD(x.span.end)}</td></tr>`).join('');
  const elRows = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'].map((e) => { const yy = ys.filter((x) => x.elE === e).map((x) => `<a href="${rel}${yUrl(x.y).slice(1)}">${x.y}</a>`).join(', '); return `<li><b>${e} ${A.name}</b><small>${yy}</small><br>${esc(A.el[e])}</li>`; }).join('');
  const rankRows = rk.map((r) => { const gg = gradeEn(r.score); const pr = primary(r.rels); return `<tr${r.i === b ? ' class="cur"' : ''}><td><a href="${rel}${pairUrl(b, r.i).slice(1)}">${r.i === b ? `${A.name} & ${A.name}` : ANIMALS[r.i].name}</a> <small>${han(r.i)}</small></td><td class="${gg.tone === 'good' ? 'good' : gg.tone === 'bad' || gg.tone === 'warn' ? 'bad' : ''}">${r.score}</td><td>${gg.label}<br><small>${REL_EN[pr].label}</small></td></tr>`; }).join('');
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/zodiac/" style="color: inherit; text-decoration: none;">Chinese zodiac</a> · ${A.name}</div>
    <h1 class="ga-title">Year of the ${A.name} —<br>${esc(A.key.toLowerCase())}</h1>
    <div class="zd-hero">
      <div class="zd-over">${A.alt ? esc(A.alt) : A.name}</div>
      <div class="zd-han">${han(b)}</div>
      <div class="zd-sub">${BRANCH_PINYIN[b]} · ${M.BRANCHES[b].kor} · ${A.ko} (${A.rr})</div>
    </div>
    <div class="zd-meta"><span>Branch <b>${han(b)} ${BRANCH_PINYIN[b]}</b></span><span>Fixed element <b>${el.en}</b></span><span><b>${A.yang ? 'Yang' : 'Yin'}</b></span><span>Hours <b>${A.hours}</b></span><span>Month <b>${A.month}</b></span></div>
    <p class="ga-lead">${esc(A.short)}</p>
    <div class="ga-body">
      <h2>${A.name} years</h2>
      <p>Each ${A.name} year starts at Chinese New Year, so January and early-February birthdays belong to the sign before. The dates below are the Chinese calendar (UTC+8).</p>
      <div class="zd-wrap"><table class="zd-table"><tr><th>Year</th><th>Sign</th><th>From – to</th></tr>${yearRows}</table></div>
      <h2>Personality</h2>
      <p><b>Strengths:</b> ${A.strengths.map(esc).join('; ')}.</p>
      <p><b>Challenges:</b> ${A.challenges.map(esc).join('; ')}.</p>
      <p><b>In love.</b> ${esc(A.love)}</p>
      <p><b>At work.</b> ${esc(A.work)}</p>
      <h2>The five ${A.name}s</h2>
      <p>The year’s heavenly stem adds one of five elements, so a 1984 ${A.name === 'Rat' ? 'Rat' : A.name} and a 1996 one are not quite the same animal.</p>
      <ul class="zd-list">${elRows}</ul>
      <h2>Best and worst matches</h2>
      <p>Best: ${best.map((r) => `<a href="${rel}${pairUrl(b, r.i).slice(1)}">${ANIMALS[r.i].name}</a> (${r.score})`).join(', ')}. Hardest: ${worst.map((r) => `<a href="${rel}${pairUrl(b, r.i).slice(1)}">${ANIMALS[r.i].name}</a> (${r.score})`).join(', ')}.</p>
      <div class="zd-wrap"><table class="zd-table"><tr><th>With</th><th>Score</th><th>Match</th></tr>${rankRows}</table></div>
      <h2>Element associations</h2>
      <p>The ${A.name}’s branch carries ${el.en} (${el.han}) — ${el.traits}. In Korean tradition, ${el.en} goes with ${el.color}, the ${el.dir}, and the numbers ${el.nums}.</p>
      <h2>The ${A.name} in 2027</h2>
      <p>The Year of the Fire Goat gives the ${A.name} <b>${S27[b]}/100</b> — ${g27.label.toLowerCase()} (${Y27_REL[DDI[b].rel].short.toLowerCase()}). <a href="${rel}${y27Url(b).slice(1)}">Read the ${A.name}’s 2027 horoscope →</a></p>
      <p class="callout">Korean: ${A.ko} · <a href="${rel}ddi-gunghap/${A.slug}/" hreflang="ko">${A.ko} 궁합</a> · <a href="${rel}2027/ddi/${A.slug}/" hreflang="ko">2027년 ${A.ko} 운세</a> · All signs: ${ANIMALS.map((X, i) => i === b ? `<b>${X.name}</b>` : `<a href="${rel}${aUrl(i).slice(1)}">${X.name}</a>`).join(' · ')}</p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Read your full Four Pillars chart</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `Year of the ${A.name} — ${A.key}`, extraHead: STYLE + alt(url),
    jsonld: [crumbs([['Chinese Zodiac', '/en/zodiac/'], [A.name, url]]), article(url, title, desc)], body }));
}

/* ---------- year pages ---------- */
function yearPage(y) {
  const x = YI[y], prev = YI[y - 1], next = YI[y + 1], A = x.A, b = x.b, url = yUrl(y), rel = '../../../../';
  const el = EL[x.elK], rk = ranking(b).filter((r) => r.i !== b);
  const best = rk.slice(0, 3), worst = rk.slice(-2).reverse();
  const startPrev = dayBefore(x.span.start);
  const cnyBeforeIp = cmp(x.span.start, x.ip) < 0;
  const gapFrom = cnyBeforeIp ? x.span.start : x.ip, gapTo = dayBefore(cnyBeforeIp ? x.ip : x.span.start);
  const gapOne = cmp(gapFrom, gapTo) === 0;
  const sajuNote = cnyBeforeIp
    ? `A birthday from ${fmtMD(gapFrom)} to ${fmtMD(gapTo)}, ${y} is already a ${A.name} by Lunar New Year but still ${prev.han} (${prev.name}) in a saju chart.`
    : `A birthday from ${fmtMD(gapFrom)}${gapOne ? '' : ` to ${fmtMD(gapTo)}`}, ${y} is already ${x.han} (${x.name}) in a saju chart but still a ${prev.A.name} by Lunar New Year.`;
  const seollalDiff = cmp(x.seollal, x.span.start) !== 0;
  const age = (t) => t - y;
  const same60 = [y - 60, y + 60].filter((t) => t >= 1900 && t <= 2100);
  const g27 = grade27(S27[b]);
  const title = `${y} Chinese Zodiac: ${x.name} (${x.han}) — ${fmtD(x.span.start)} to ${fmtD(x.span.end)}`;
  const desc = `${y} is the year of the ${x.name} (${x.han}, ${x.pinyin}) from ${fmtD(x.span.start)} to ${fmtD(x.span.end)}. Born before ${fmtMD(x.span.start)}? You are a ${prev.name}. Personality, compatibility and the Korean saju year boundary (Ipchun, ${fmtMD(x.ip)}).`;
  const sameSign = yearsOf(b).map((t) => (t.y === y ? `<b>${t.y}</b>` : `<a href="${rel}${yUrl(t.y).slice(1)}">${t.y}</a>`) + ` <small>${t.elE}</small>`).join(' · ');
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/zodiac/" style="color: inherit; text-decoration: none;">Chinese zodiac</a> · <a href="${rel}${aUrl(b).slice(1)}" style="color: inherit; text-decoration: none;">${A.name}</a> · ${y}</div>
    <h1 class="ga-title">${y} Chinese zodiac —<br>the ${x.name}</h1>
    <div class="zd-hero">
      <div class="zd-over">${y} · ${x.yang ? 'Yang' : 'Yin'} ${el.en}</div>
      <div class="zd-han">${x.han}</div>
      <div class="zd-sub">${x.name} · ${x.pinyin} · ${x.kor}</div>
      <div class="zd-sub" style="margin-top: 6px;">${fmtD(x.span.start)} – ${fmtD(x.span.end)}</div>
    </div>
    <div class="zd-meta"><span>Animal <b>${A.name} ${han(b)}</b></span><span>Element <b>${x.yang ? 'Yang' : 'Yin'} ${el.en} ${M.STEMS[x.s].han}</b></span><span>Starts <b>${fmtMD(x.span.start)}</b></span><span>Ends <b>${fmtD(x.span.end)}</b></span></div>
    <p class="ga-lead">People born between ${fmtD(x.span.start)} and ${fmtD(x.span.end)} are ${/^[AEIOU]/.test(x.name) ? 'an' : 'a'} ${x.name}. ${esc(A.el[x.elE])}</p>
    <div class="ga-body">
      <h2>Born in January or early February ${y}?</h2>
      <p>The ${y} ${A.name} year began at Chinese New Year on <b>${fmtD(x.span.start)}</b>. If you were born from January 1 to ${fmtMD(startPrev)}, ${y}, your sign is the <a href="${rel}${yUrl(y - 1).slice(1)}">${prev.name}</a> of ${y - 1}. The year ended on ${fmtD(x.span.end)}, so birthdays in early ${y + 1} up to that date still count as ${A.name}s.</p>
      <h2>The Korean saju year starts at Ipchun</h2>
      <p>In Korean saju (the Four Pillars), the year pillar changes at <b>Ipchun</b>, the start of spring — ${fmtD(x.ip)} at ${hhmm(x.ip)} Korea time — not at Lunar New Year. ${sajuNote}${seollalDiff ? ` In Korea, Seollal (Lunar New Year) fell on ${fmtD(x.seollal)}, one day after the Chinese date, because the new moon arrived just before midnight in China and just after it in Korea.` : ''}</p>
      <h2>The ${x.name} personality</h2>
      <p>${esc(A.el[x.elE])}${x.doubled ? ` Both the year stem and the ${A.name}’s own branch are ${el.en}, so the ${el.en} character is doubled this year.` : ''} ${el.en} brings ${el.traits}.</p>
      <p>${esc(A.short)} <b>Strengths:</b> ${A.strengths.map(esc).join('; ')}. <b>Watch for:</b> ${A.challenges.map(esc).join('; ')}.</p>
      <h2>Compatibility</h2>
      <p>Best matches for the ${A.name}: ${best.map((r) => `<a href="${rel}${pairUrl(b, r.i).slice(1)}">${ANIMALS[r.i].name}</a> (${r.score}/100)`).join(', ')}. Hardest: ${worst.map((r) => `<a href="${rel}${pairUrl(b, r.i).slice(1)}">${ANIMALS[r.i].name}</a> (${r.score})`).join(', ')}. <a href="${rel}${aUrl(b).slice(1)}">All twelve ${A.name} matches →</a></p>
      <h2>${y <= NOW ? 'Age' : 'Born in ' + y}</h2>
      <p>${y <= NOW ? `People born in the ${y} ${A.name} year turn ${age(NOW)} in ${NOW} and ${age(NOW + 1)} in ${NOW + 1}. ` : `Children born from ${fmtD(x.span.start)} to ${fmtD(x.span.end)} will be ${x.name}s. `}The same ${x.name} returns every sixty years${same60.length ? ` — ${same60.join(' and ')}` : ''}.</p>
      <h2>${A.name} years</h2>
      <p>${sameSign}</p>
      <h2>The ${A.name} in 2027</h2>
      <p>The Year of the Fire Goat gives the ${A.name} <b>${S27[b]}/100</b> — ${g27.label.toLowerCase()}. <a href="${rel}${y27Url(b).slice(1)}">Read the 2027 forecast →</a></p>
      <p class="callout">${y > Y0 ? `← <a href="${rel}${yUrl(y - 1).slice(1)}">${y - 1} ${prev.name}</a>` : ''}${y > Y0 && y < Y1 ? ' · ' : ''}${y < Y1 ? `<a href="${rel}${yUrl(y + 1).slice(1)}">${y + 1} ${next.name}</a> →` : ''} · <a href="${rel}en/zodiac/">All years and the calculator</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Your birth date, all four pillars</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `${y} — Year of the ${x.name}`, extraHead: STYLE + alt(url),
    jsonld: [crumbs([['Chinese Zodiac', '/en/zodiac/'], [A.name, aUrl(b)], [String(y), url]]), article(url, title, desc)], body }));
}

/* ---------- hub ---------- */
function hub() {
  const url = '/en/zodiac/', rel = '../../';
  const data = [];
  for (let y = Y0; y <= Y1 + 1; y++) { const x = YI[y]; data.push([y, iso(x.span.start), x.b, x.s, iso(x.ip)]); }
  const cells = ANIMALS.map((A, b) => { const ys = yearsOf(b).filter((x) => x.y >= 1960).map((x) => x.y); return `<a href="${rel}${aUrl(b).slice(1)}"${b === YI[NOW].b ? ' class="cur"' : ''}><b>${han(b)}</b><span>${A.name}</span><small>${ys.slice(-4).join(' ')}</small></a>`; }).join('');
  const rows = []; for (let y = Y1; y >= Y0; y--) { const x = YI[y]; rows.push(`<tr${y === NOW ? ' class="cur"' : ''}><td><a href="${rel}${yUrl(y).slice(1)}">${y}</a></td><td>${x.name} <small>${x.han}</small></td><td>${fmtMD(x.span.start)}</td><td>${fmtD(x.span.end)}</td></tr>`); }
  const title = 'Chinese Zodiac Calculator — What Is My Animal Sign? (Years 1924–2031 with Lunar New Year Dates)';
  const desc = 'Enter your birth date to find your Chinese zodiac animal and element — using the real Lunar New Year boundary, not January 1. Full chart of years 1924–2031, the twelve animals, compatibility and the 2027 Fire Goat year.';
  const body = `
  <article class="guide-article">
    <div class="ga-overline">Chinese zodiac</div>
    <h1 class="ga-title">What is my Chinese zodiac sign?</h1>
    <p class="ga-lead">Your animal sign comes from the year you were born — but the zodiac year starts at Chinese New Year, which falls between January 21 and February 20. Enter your birth date and the calculator checks the exact boundary.</p>
    <div class="zd-calc">
      <label for="zd-date">Your birth date</label>
      <div class="row"><input id="zd-date" type="date" min="1924-01-01" max="2032-12-31" value="1990-06-15"><button type="button" id="zd-go">Find my sign</button></div>
      <div class="zd-out" id="zd-out" aria-live="polite"></div>
    </div>
    <div class="ga-body">
      <h2>The twelve animals</h2>
      <div class="zd-grid">${cells}</div>
      <p>The cycle runs Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig. Each animal is one of the twelve earthly branches; each year also carries one of ten heavenly stems, which gives it an element — Wood, Fire, Earth, Metal or Water — and the two together repeat every sixty years. ${NOW} is the <a href="${rel}${yUrl(NOW).slice(1)}">${YI[NOW].name}</a>; ${NOW + 1} is the <a href="${rel}en/2027/">Fire Goat</a>.</p>
      <h2>Chinese zodiac years chart</h2>
      <p>Dates follow the Chinese calendar (UTC+8). In a few years Korea’s Seollal falls one day later than Chinese New Year; Korean saju uses a different boundary again — Ipchun, around February 4.</p>
      <div class="zd-wrap"><table class="zd-table"><tr><th>Year</th><th>Sign</th><th>Starts</th><th>Ends</th></tr>${rows.join('')}</table></div>
      <h2>Compatibility and 2027</h2>
      <p>See how the twelve signs get along on the <a href="${rel}en/zodiac/compatibility/">compatibility chart</a> — seventy-eight pairings, each scored and explained — and what the <a href="${rel}en/2027/">Year of the Fire Goat</a> brings each sign.</p>
      <p class="callout">The zodiac animal is one pillar of four. Your month, day and hour of birth complete a <a href="${rel}en/">Korean Four Pillars (saju) chart</a> — the Day Master in the <a href="${rel}en/guide/">library</a> describes you more precisely than the year animal does.</p>
    </div>
  </article>
  <script>
  (function () {
    var D = ${JSON.stringify(data)};
    var AN = ${JSON.stringify(ANIMALS.map((A) => A.name))}, SL = ${JSON.stringify(ANIMALS.map((A) => A.slug))};
    var EL = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'], HAN = '甲乙丙丁戊己庚辛壬癸', BR = '子丑寅卯辰巳午未申酉戌亥';
    var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function f(s) { var p = s.split('-'); return MON[+p[1] - 1] + ' ' + (+p[2]) + ', ' + p[0]; }
    function go() {
      var v = document.getElementById('zd-date').value, out = document.getElementById('zd-out');
      if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(v)) { out.textContent = 'Enter a date.'; return; }
      var row = null;
      for (var i = D.length - 1; i >= 0; i--) { if (v >= D[i][1]) { row = D[i]; break; } }
      if (!row || row[0] > ${Y1}) { out.textContent = 'This calculator covers birthdays from Feb 5, 1924 to early 2032.'; return; }
      var y = row[0], b = row[2], s = row[3], name = EL[s] + ' ' + AN[b];
      var nx = D[D.indexOf(row) + 1], e = nx[1].split('-'), end = new Date(Date.UTC(+e[0], +e[1] - 1, +e[2] - 1));
      var endS = MON[end.getUTCMonth()] + ' ' + end.getUTCDate() + ', ' + end.getUTCFullYear();
      var html = '<b class="big">' + HAN[s] + BR[b] + ' · ' + name + '</b>Your Chinese zodiac year is ' + y + ', the year of the ' + name + ' (' + f(row[1]) + ' – ' + endS + '). ' +
        '<a href="../../en/zodiac/year/' + y + '/">About ' + y + ' →</a> · <a href="../../en/zodiac/' + SL[b] + '/">The ' + AN[b] + ' →</a>';
      var cy = +v.slice(0, 4), ip = null;
      for (var j = 0; j < D.length; j++) if (D[j][0] === cy) ip = D[j][4];
      if (ip) {
        var sajuY = v >= ip ? cy : cy - 1;
        if (sajuY !== y) { var sb = ((sajuY - 4) % 12 + 12) % 12, ss = ((sajuY - 4) % 10 + 10) % 10; html += '<br><small>Korean saju starts the year at Ipchun (' + f(ip) + '), so your saju year pillar is ' + HAN[ss] + BR[sb] + ' (' + EL[ss] + ' ' + AN[sb] + ') — a birthday close to the boundary can also depend on the hour.</small>'; }
      }
      out.innerHTML = html;
    }
    document.getElementById('zd-go').addEventListener('click', go);
    document.getElementById('zd-date').addEventListener('change', go);
    go();
  })();
  </script>`;
  write(url, shell({ rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: 'What is my Chinese zodiac sign?', extraHead: STYLE + alt(url),
    jsonld: [crumbs([['Chinese Zodiac', url]]), { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Chinese zodiac calculator', url: SITE + url, applicationCategory: 'LifestyleApplication', operatingSystem: 'Any', inLanguage: 'en', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }], body }));
}

/* ---------- 2027 ---------- */
const monthLabel = (mo) => `${fmtMD(mo.start)} – ${fmtMD(mo.end)}`;
function year27Page(b) {
  const A = ANIMALS[b], d = DDI[b], url = y27Url(b), rel = '../../../';
  const score = S27[b], g = grade27(score), R = Y27_REL[d.rel];
  const rels = relations(b, YB);
  const extra = rels.filter((r) => r !== d.rel && r !== 'same' && !(d.rel === 'hae' && r === 'wonjin')).map((r) => `On top of that, ${A.name} and Goat also form ${/^[AEIOU]/.test(REL_EN[r].long) ? 'an' : 'a'} ${REL_EN[r].long.toLowerCase()} (${REL_EN[r].han}) link, which ${REL_EN[r].tone === 'good' ? 'adds support' : 'adds some friction — double-check paperwork and promises'}.`).join(' ');
  const months = MONTHS27.map((mo) => ({ mo, r: monthRel(b, mo.branch) }));
  const good = months.filter((m) => ['yukhap', 'samhap', 'banghap'].includes(m.r)), bad = months.filter((m) => ['chung', 'hyeong', 'hae', 'wonjin', 'pa', 'selfhyeong'].includes(m.r));
  const births = yearsOf(b).filter((x) => x.y <= 2027);
  const title = `${A.name} in 2027: Year of the Fire Goat Horoscope — ${score}/100 (${g.label})`;
  const desc = `2027 Chinese horoscope for the ${A.name}: ${score}/100, ${g.label.toLowerCase()} — ${R.short.toLowerCase()}. Overall luck, love, money, work and health in the Fire Goat year, the best and hardest months, and notes for each ${A.name} birth year.`;
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/2027/" style="color: inherit; text-decoration: none;">2027 horoscope</a> · ${A.name}</div>
    <h1 class="ga-title">The ${A.name} in 2027 —<br>${esc(R.label)}</h1>
    <div class="zd-hero">
      <div class="zd-over">2027 · 丁未 · Fire Goat</div>
      <div class="zd-han">${han(b)} · 未</div>
      <div class="zd-score">${score}<span>/100</span></div>
      <div class="zd-sub">${g.label}</div>
      <div class="zd-bar"><i style="width: ${score}%"></i></div>
      <div class="zd-badges">${rels.length ? rels.map((r) => `<span class="zd-badge ${REL_EN[r].tone}">${relTag(r)}</span>`).join('') : '<span class="zd-badge">No fixed link</span>'}${d.samjae ? '<span class="zd-badge bad">Samjae — final year</span>' : ''}</div>
    </div>
    <p class="ga-lead">${esc(Y27_OPENER[A.slug])}</p>
    <div class="ga-body">
      <h2>Overall</h2>
      <p>${esc(R.overall)}${extra ? ' ' + esc(extra) : ''}</p>
      <p>${esc(Y27_EL[d.el])}</p>
      ${d.samjae ? `<p class="callout"><b>Samjae.</b> ${esc(SAMJAE_EN)}</p>` : ''}
      <h2>Love</h2>
      <p>${esc(R.love)} ${esc(A.love)}</p>
      <h2>Money</h2>
      <p>${esc(R.money)}</p>
      <h2>Work</h2>
      <p>${esc(R.work)} ${esc(A.work)}</p>
      <h2>Health</h2>
      <p>${esc(R.health)}</p>
      <h2>Month by month</h2>
      <p>Months here are the solar-term months that Korean saju uses — each begins on a solar term, not on the 1st.${good.length ? ` The ${A.name}’s smoothest: ${good.map((m) => `${M.BRANCHES[m.mo.branch].han} month (${monthLabel(m.mo)})`).join(', ')}.` : ''}${bad.length ? ` Take more care in: ${bad.map((m) => `${M.BRANCHES[m.mo.branch].han} month (${monthLabel(m.mo)})`).join(', ')}.` : ''}</p>
      <div class="zd-wrap"><table class="zd-table"><tr><th>Month</th><th>Pillar</th><th>For the ${A.name}</th></tr>${months.map((m) => `<tr${['yukhap', 'samhap', 'banghap'].includes(m.r) ? ' class="cur"' : ''}><td>${monthLabel(m.mo)}<br><small>${m.mo.term}</small></td><td>${M.STEMS[m.mo.stem].han}${M.BRANCHES[m.mo.branch].han}<br><small>${ANIMALS[m.mo.branch].name}</small></td><td>${Y27_MONTH[m.r].charAt(0).toUpperCase() + Y27_MONTH[m.r].slice(1)}</td></tr>`).join('')}</table></div>
      <h2>By birth year</h2>
      <ul class="zd-list">${births.map((x) => `<li><a href="${rel}${yUrl(x.y).slice(1)}"><b>${x.y}</b></a> ${x.name} <small>${x.han}</small> — ${2027 - x.y === 0 ? 'born in 2027' : `turns ${2027 - x.y} in 2027`}. ${esc(A.el[x.elE])}</li>`).join('')}</ul>
      <p class="callout"><a href="${rel}en/2027/">All twelve signs in 2027</a> · <a href="${rel}${aUrl(b).slice(1)}">${A.name} years and personality</a> · <a href="${rel}${pairUrl(b, 7).slice(1)}">${A.name} and Goat compatibility</a> · <a href="${rel}2027/ddi/${A.slug}/" hreflang="ko">2027년 ${A.ko} 운세 (한국어)</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>See 2027 in your full chart</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `The ${A.name} in 2027 — ${score}/100`, extraHead: STYLE + alt(url, `/2027/ddi/${A.slug}/`),
    jsonld: [crumbs([['2027 Horoscope', '/en/2027/'], [A.name, url]]), article(url, title, desc)], body }));
}

function year27Hub() {
  const url = '/en/2027/', rel = '../../';
  const order = ANIMALS.map((_, b) => b).sort((x, y) => S27[y] - S27[x] || x - y);
  const cells = ANIMALS.map((A, b) => `<a href="${rel}${y27Url(b).slice(1)}"><b>${han(b)}</b><span>${A.name}</span><small><i>${S27[b]}</i> · ${Y27_REL[DDI[b].rel].short}</small></a>`).join('');
  const title = '2027 Chinese Horoscope: Year of the Fire Goat — Forecast for All 12 Signs';
  const desc = `2027 is the Year of the Fire Goat (丁未), from ${fmtD(CNY27.start)} to ${fmtD(CNY27.end)}. Scores and forecasts for all twelve Chinese zodiac signs — love, money, work and health — with the best months and the Korean saju view.`;
  const body = `
  <article class="guide-article">
    <div class="ga-overline">2027 horoscope</div>
    <h1 class="ga-title">2027 — the Year of the Fire Goat</h1>
    <div class="zd-hero">
      <div class="zd-over">丁未 · Ding Wei · 정미</div>
      <div class="zd-han">丁未</div>
      <div class="zd-sub">Yin Fire over the Goat · ${fmtD(CNY27.start)} – ${fmtD(CNY27.end)}</div>
    </div>
    <p class="ga-lead">2027 pairs the stem 丁 — yin fire, the fire of a candle or a lamp — with the branch 未, the Goat, the warm, dry earth of late summer. Fire feeds earth, so the top of the year nourishes the bottom: a gentle, cultivating year that favors care, creativity, home and slow building, with heat and short tempers as its weak spot.</p>
    <div class="ga-body">
      <h2>When the Fire Goat year begins</h2>
      <p><b>Chinese New Year:</b> ${fmtD(CNY27.start)} — the Goat year runs to ${fmtD(CNY27.end)}. <b>Korean Seollal:</b> ${fmtD(SEOLLAL27)}, a day later, because the new moon arrives just before midnight in China and just after it in Korea. <b>Korean saju:</b> the year pillar turns at Ipchun, ${fmtD(IPCHUN27)} at ${hhmm(IPCHUN27)} Korea time.</p>
      <h2>The twelve signs in 2027</h2>
      <div class="zd-grid">${cells}</div>
      <div class="zd-wrap"><table class="zd-table"><tr><th>Sign</th><th>Score</th><th>With the Goat</th></tr>${order.map((b) => { const g = grade27(S27[b]); return `<tr><td><a href="${rel}${y27Url(b).slice(1)}">${ANIMALS[b].name}</a> <small>${han(b)}</small></td><td class="${g.tone === 'good' ? 'good' : g.tone === 'warn' ? 'bad' : ''}">${S27[b]}</td><td>${g.label}<br><small>${Y27_REL[DDI[b].rel].short}${DDI[b].samjae ? ' · samjae ends' : ''}</small></td></tr>`; }).join('')}</table></div>
      <p>The scores weigh each sign’s branch relationship with 未 — harmony lifts, clash and friction lower — plus how the sign’s element meets the year’s fire and earth. They are the same numbers as our <a href="${rel}2027/" hreflang="ko">Korean 2027 horoscope</a>.</p>
      <h2>Samjae ends for the Pig, Rabbit and Goat</h2>
      <p>${esc(SAMJAE_EN)}</p>
      <h2>The months of 2027</h2>
      <div class="zd-wrap"><table class="zd-table"><tr><th>Month</th><th>Pillar</th><th>Smooth for</th></tr>${MONTHS27.map((mo) => { const ok = ANIMALS.map((_, b) => b).filter((b) => ['yukhap', 'samhap', 'banghap'].includes(monthRel(b, mo.branch))); return `<tr><td>${monthLabel(mo)}<br><small>${mo.term}</small></td><td>${M.STEMS[mo.stem].han}${M.BRANCHES[mo.branch].han}<br><small>${ANIMALS[mo.branch].name} month</small></td><td>${ok.map((b) => ANIMALS[b].name).join(', ')}</td></tr>`; }).join('')}</table></div>
      <p class="callout">Find your sign first: <a href="${rel}en/zodiac/">Chinese zodiac calculator</a> · <a href="${rel}en/zodiac/compatibility/">compatibility chart</a> · <a href="${rel}${yUrl(2027).slice(1)}">2027 Fire Goat year page</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>See 2027 in your full chart</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: '2027 — Year of the Fire Goat', extraHead: STYLE + alt(url, '/2027/'),
    jsonld: [crumbs([['2027 Horoscope', url]]), article(url, title, desc)], body }));
}

/* ---------- run ---------- */
hub();
ANIMALS.forEach((_, b) => animalPage(b));
for (let y = Y0; y <= Y1; y++) yearPage(y);
compatIndex();
for (let a = 0; a < 12; a++) for (let b = a; b < 12; b++) pairPage(a, b);
year27Hub();
ANIMALS.forEach((_, b) => year27Page(b));

fs.writeFileSync(path.join(DOCS, 'sitemap-en-zodiac.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${PUBLISHED}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-en-zodiac.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-en-zodiac.xml\n');
console.log(`EN zodiac — ${urls.length} pages (hub 1 · animals 12 · years ${Y1 - Y0 + 1} · compatibility 1 + 78 · 2027 1 + 12), sitemap-en-zodiac.xml`);
