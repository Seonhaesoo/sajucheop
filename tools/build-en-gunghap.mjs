/* English Day Master compatibility — /en/guide/compatibility/<me>-<them>/ (10×10, from "my" side) + index
 * Relation types (combine·clash·same·feed·drain) and Ten Gods from the engine; prose from templates.
 * Same weights and definitions as the Korean 일간 궁합 pages. */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { DAY_MASTERS } from './en-daymaster-data.mjs';
import { TEN_GOD_EN, STEM_PINYIN } from './en-ilju-data.mjs';

const { M } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-06';
const KO_SLUG = ['gapmok', 'eulmok', 'byeonghwa', 'jeonghwa', 'muto', 'gito', 'gyeonggeum', 'singeum', 'imsu', 'gyesu'];
const STEM_HAP = { 0: 5, 5: 0, 1: 6, 6: 1, 2: 7, 7: 2, 3: 8, 8: 3, 4: 9, 9: 4 };
const HAPHWA = { '05': 'Earth', '16': 'Metal', '27': 'Water', '38': 'Wood', '49': 'Fire' };
const STEM_CHUNG = { 0: 6, 6: 0, 1: 7, 7: 1, 2: 8, 8: 2, 3: 9, 9: 3 };
const GEN = M.elCycle.gen;
const CTRL = {}; Object.keys(GEN).forEach((k) => { CTRL[k] = GEN[GEN[k]]; });
const EL_EN = { '목': 'Wood', '화': 'Fire', '토': 'Earth', '금': 'Metal', '수': 'Water' };
const GEN_METAPHOR = { '목화': 'as wood feeds a fire', '화토': 'as fire warms the earth', '토금': 'as earth holds the ore', '금수': 'as a spring rises from rock', '수목': 'as rain grows a tree' };
const GEUK_METAPHOR = { '목토': 'as roots break through soil', '토수': 'as a dam holds a river', '수화': 'as water tames fire', '화금': 'as fire forges metal', '금목': 'as an axe shapes a tree' };

const REL = {
  hap: { label: 'A natural match', tag: 'stems combine',
    first: 'Of the ten stems, these two are the only pair that lock together. Even a first meeting does not feel foreign, and being together produces a force neither had alone. If there is an attraction you cannot explain, that is the feeling of combination.',
    love: 'Attraction comes fast and stays. But combination is a pull to merge, so one of you can adapt so completely to the other that your own color fades. Guard your own time as much as your shared time.',
    work: 'Hands fit in partnerships and teams; roles divide naturally and friction is low. The risk is that you both lean the same way and miss outside opinions. Add a third pair of eyes.',
    advice: 'Do not relax because it fits — combination is chemistry, not comfort. It cools the moment you take each other for granted.' },
  chung: { label: 'A charged match', tag: 'stems clash',
    first: 'Two energies standing face to face. At first it is either strong attraction or strong repulsion — rarely anything in between. The same force that pushes you apart also grows you, and the clash relationships that last become the sturdiest of all.',
    love: 'Sparks guaranteed. Never boring, but the same argument repeats easily. Trying to win makes it a war of attrition; accepting the difference makes it an engine. Distance and courtesy are the craft here.',
    work: 'The tension is productive at work — you are each other\'s sharpest reviewer, catching exactly the weak spot. Without clearly divided roles and authority, though, it becomes a fight for the wheel.',
    advice: 'The relationship opens the moment you stop trying to change them. A clash is not a match to win but one to learn from.' },
  bihwa: { label: 'An easy match', tag: 'same element',
    first: 'Two of the same energy. Colleagues who recognize each other instantly — the talk flows, the pace matches, closeness comes quickly. You also share the same weak spots, so without yielding you collide at the same point.',
    love: 'Lovers who are also friends. Similar taste and rhythm make it comfortable, with many moments that need no explanation. Familiarity outruns excitement, though — build new experiences so comfort is not mistaken for boredom.',
    work: 'Colleagues drawing the same picture: opinions converge fast, execution is quick, and you share one blind spot. Put someone of a different element on the team for balance.',
    advice: 'Being alike is exactly why you must yield more. One rule — take turns with the wheel — keeps this going for years.' },
  saengGive: { label: 'A nourishing match', tag: 'you feed them',
    first: 'Your energy feeds theirs. You give, they receive: they brighten when you meet, and you find meaning in watching it. Keep the giver from tiring and the receiver saying thank you — that cycle is the relationship\'s fuel.',
    love: 'You love by tending. They draw stability and strength from you; you draw joy from growing them. Give only, though, and one day you ask "who fills me?" Practice receiving too.',
    work: 'You are the one pushing from behind — mentor and junior, backer and builder. When they succeed, your contribution can vanish from view; keep a record of what you added.',
    advice: 'The joy of giving is real, but once it becomes duty the relationship gets heavy. Sit in the receiving seat sometimes.' },
  saengRecv: { label: 'A nourishing match', tag: 'they feed you',
    first: 'Their energy feeds yours. Beside them you inexplicably have more strength and things go smoother. Saying thank you out loud, as the receiver, is the easiest way to keep this alive.',
    love: 'A love you can lean on. They hold you up steadily and you grow on top of it. So that ease does not harden into dependence, find other currencies to give back — laughter, novelty, recognition.',
    work: 'They push you forward. You grow fastest in learning and supported roles — but their shade is comfortable, and independence can come late. Plan the day you stand alone.',
    advice: 'Do not ration the thank-yous. The one who nourishes is refilled by that single word.' },
  geukGive: { label: 'A forging match', tag: 'you shape them',
    first: 'Your energy shapes theirs. Without meaning to, you edit and correct them, and they tense up in front of you. Used with respect it becomes structure; as a habit it becomes criticism.',
    love: 'Easily becomes you leading and them adjusting — reassuring at first, then stifling. Swallow two of every three urges to correct and this relationship deepens instead.',
    work: 'Results come with you directing and them executing. They become more precise under your standard but lose autonomy. Ask for outcomes and leave the method to them.',
    advice: 'A shaping hand must be gentle. Cut only along the grain that makes them more themselves.' },
  geukRecv: { label: 'A forging match', tag: 'they shape you',
    first: 'Their energy shapes yours. Beside them you feel tense and corrected, yet looking back you find yourself more precise because of them. A test and a teacher at once.',
    love: 'Easily becomes them leading and correcting you. If you feel respected, it is a love that grows you; if you feel controlled, it is one that drains you. Naming your own territory protects it.',
    work: 'The strict boss, the demanding client. Hard, but your skill grows fastest under this person. Once you have learned what there is to learn, prepare your independence.',
    advice: 'Do not hear correction as attack. They are not cutting you down but shaping you — and if the hand is rough, say so.' }
};

/* What they are to me (received) and what I am to them (given) */
const SIP_RECV = {
  '비견': 'They are Friend to you — a peer walking at your shoulder. They understand your pace and your methods; when you both want the same thing, neither yields. The pair best suited to a relationship of equals.',
  '겁재': 'They are Rob Wealth to you — the rival who wakes your competitive streak. Beside them you try harder, but money and results tip into competition. Finances apart, goals together.',
  '식신': 'They are Eating God to you — the one who draws your talent out. Words come easily and ideas flow in front of them. Eating, making and enjoying multiply together; life gets richer.',
  '상관': 'They are Hurting Officer to you — the one who makes you express. You say what you would normally swallow and the hidden flair comes out. That expression sharpens sometimes, so slow down in front of seniors and formality.',
  '편재': 'They are Indirect Wealth to you — the one who widens your world. The board grows; opportunity and spending rise together. Fun and active, with a habit of counting twice.',
  '정재': 'They are Direct Wealth to you — the one who firms up your daily life. Thrifty and realistic, they put your life in order. Not flashy, but the partnership that keeps a household.',
  '편관': 'They are Seven Killings to you — the one who tenses you into growth. Your posture straightens and the tasks become clear beside them. Keep distance on days the pressure feels heavy, but admit that you are stronger because of them.',
  '정관': 'They are Direct Officer to you — the one who stands you up straight. They wake duty and rules naturally, and you feel more grown-up with them. The pair that builds a stable frame.',
  '편인': 'They are Indirect Resource to you — the one who brings unusual inspiration. Conversations wander and still yield something new. A mental connection; practical life needs mutual care.',
  '정인': 'They are Direct Resource to you — the hill you lean on. Understood without explaining, first to mind when things are hard. Keep dependence from running long and this is the most comfortable pair there is.'
};
const SIP_GIVE = {
  '비견': 'You are Friend to them — peer and mirror. You take their side when they are lonely, and meet them with the same stubbornness when you fight.',
  '겁재': 'You are Rob Wealth to them — the one who sparks their competitiveness. They work harder because of you, and sometimes see you as a rival.',
  '식신': 'You are Eating God to them — the one who draws out their talent. They relax and laugh easily around you.',
  '상관': 'You are Hurting Officer to them — the one who makes them express. With you they get honest, sometimes too honest.',
  '편재': 'You are Indirect Wealth to them — the one who widens their world. They meet opportunity because of you, and spend more too.',
  '정재': 'You are Direct Wealth to them — the one who firms up their days. To them you are stability and reality.',
  '편관': 'You are Seven Killings to them — the one who makes them tense. They straighten up in front of you, grow as much, and feel pressed at times.',
  '정관': 'You are Direct Officer to them — the one who stands them up straight. To them you are rule, duty and a frame they can trust.',
  '편인': 'You are Indirect Resource to them — the one who inspires. They leave a conversation with you holding a new thought.',
  '정인': 'You are Direct Resource to them — the hill they lean on. They draw stability from you, and you end up holding them.'
};

function relOf(a, b) {
  const sa = M.STEMS[a], sb = M.STEMS[b];
  const A = DAY_MASTERS[a].name, B = DAY_MASTERS[b].name;
  if (STEM_HAP[a] === b) {
    const hwa = HAPHWA[[Math.min(a, b), Math.max(a, b)].join('')];
    return { key: 'hap', title: 'Stems combine (합) — the pair that pulls together', body: `${A} and ${B} are the one interlocking pair among the ten stems. Their energies transform toward ${hwa}, and together they produce a force neither had alone.` };
  }
  if (STEM_CHUNG[a] === b) return { key: 'chung', title: 'Stems clash (충) — the pair that collides', body: `${A} and ${B} stand face to face. The push apart is also the push to grow; distance and courtesy are the craft of this pairing.` };
  if (sa.el === sb.el) return { key: 'bihwa', title: 'Same element (비화) — like meets like', body: `Two ${EL_EN[sa.el]} natures. Colleagues who recognize each other at once — comfortable and quick to bond, prone to collide without yielding.` };
  if (GEN[sa.el] === sb.el) return { key: 'saengGive', title: 'You nourish them (상생) — ' + GEN_METAPHOR[sa.el + sb.el], body: `Your ${EL_EN[sa.el]} feeds their ${EL_EN[sb.el]}. One side pushes steadily from behind; the giving and receiving are clear.` };
  if (GEN[sb.el] === sa.el) return { key: 'saengRecv', title: 'They nourish you (상생) — ' + GEN_METAPHOR[sb.el + sa.el], body: `Their ${EL_EN[sb.el]} feeds your ${EL_EN[sa.el]}. One side pushes steadily from behind; the giving and receiving are clear.` };
  if (CTRL[sa.el] === sb.el) return { key: 'geukGive', title: 'You shape them (상극) — ' + GEUK_METAPHOR[sa.el + sb.el], body: `Your ${EL_EN[sa.el]} shapes their ${EL_EN[sb.el]}. Uncomfortable moments, and — used well — a relationship that tempers you both.` };
  return { key: 'geukRecv', title: 'They shape you (상극) — ' + GEUK_METAPHOR[sb.el + sa.el], body: `Their ${EL_EN[sb.el]} shapes your ${EL_EN[sa.el]}. Uncomfortable moments, and — used well — a relationship that tempers you both.` };
}

const STYLE = `<style>
    .gp-pair { display: flex; align-items: center; justify-content: center; gap: 18px; margin: 8px 0 14px; }
    .gp-pair i { font-style: normal; font-family: 'Noto Serif KR', serif; font-size: 48px; font-weight: 700; color: var(--seal); line-height: 1; }
    .gp-pair i small { display: block; font-family: 'Noto Sans KR', sans-serif; font-size: 11px; color: var(--faint); font-weight: 400; margin-top: 4px; text-align: center; }
    .gp-pair b { font-size: 22px; color: var(--faint); font-weight: 400; }
    .gp-meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 6px; }
    .gp-meta span { font-size: 12px; padding: 3px 9px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); }
    .gp-meta span b { color: var(--ink); font-weight: 600; }
    .gp-meta span.lab { border-color: var(--seal); color: var(--seal); font-weight: 700; }
    .gp-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 8px 0 18px; }
    .gp-grid a { display: block; text-align: center; padding: 9px 2px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 9px; text-decoration: none; color: inherit; font-size: 11px; }
    .gp-grid a b { display: block; font-family: 'Noto Serif KR', serif; font-size: 18px; }
    .gp-grid a small { display: block; font-size: 10px; color: var(--faint); margin-top: 2px; }
    .gp-grid a.cur { border-color: var(--seal); background: #FBF3E6; }
    .gp-table { width: 100%; border-collapse: collapse; font-size: 11px; }
    .gp-table th, .gp-table td { padding: 5px 2px; text-align: center; border-bottom: 1px solid var(--line-soft); }
    .gp-table th { font-family: 'Noto Serif KR', serif; font-weight: 600; color: var(--muted); }
    .gp-table td a { display: block; text-decoration: none; color: inherit; padding: 4px 0; border-radius: 6px; }
    .gp-table td a.hap { background: #FBEAE7; color: var(--seal); font-weight: 700; }
    .gp-table td a.chung { background: #EFEAE0; color: var(--ink); }
    .gp-table td a.saeng { background: #EEF4EA; }
    .gp-table td a.bihwa { background: #F3EEE4; }
    .gp-table td a.geuk { color: var(--faint); }
  </style>`;
const NAV = (rel) => [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/guide/', label: 'Library' }, { href: rel + 'en/match/', label: 'Match' }, { href: rel, label: '한국어' }];

function write(relPath, html) {
  const file = path.join(DOCS, relPath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
const urls = [];
const slugOf = (a, b) => `${DAY_MASTERS[a].slug}-${DAY_MASTERS[b].slug}`;

for (let a = 0; a < 10; a++) {
  for (let b = 0; b < 10; b++) {
    const rel = '../../../../';
    const sa = M.STEMS[a], sb = M.STEMS[b];
    const A = DAY_MASTERS[a], B = DAY_MASTERS[b];
    const r = relOf(a, b);
    const T = REL[r.key];
    const recv = M.sipseongOf(a, b), give = M.sipseongOf(b, a);
    const yy = sa.yang !== sb.yang;
    const title = `${A.name} and ${B.name} Compatibility — when a ${A.name} Day Master meets ${B.name} (${T.label})`;
    const desc = `${A.name} (${sa.han}, ${STEM_PINYIN[a]}) with ${B.name} (${sb.han}, ${STEM_PINYIN[b]}) in Korean Saju / BaZi: ${r.title.replace(/ —.*/, '')}. They are ${TEN_GOD_EN[recv].name} to you; you are ${TEN_GOD_EN[give].name} to them. First impression, love, work and how to make it last.`;
    const others = M.STEMS.map((s, k) => `<a href="${rel}en/guide/compatibility/${slugOf(a, k)}/"${k === b ? ' class="cur"' : ''}><b>${s.han}</b>${DAY_MASTERS[k].name}<small>${REL[relOf(a, k).key].label}</small></a>`).join('\n        ');

    const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/guide/compatibility/" style="color: inherit; text-decoration: none;">Day Master compatibility</a> · from ${A.name}\'s side</div>
    <div class="gp-pair"><i>${sa.han}<small>${A.name} · you</small></i><b>×</b><i>${sb.han}<small>${B.name} · them</small></i></div>
    <h1 class="ga-title">${A.name} × ${B.name} —<br>${esc(T.label)}</h1>
    <div class="gp-meta">
      <span class="lab">${esc(T.tag)}</span><span>they are <b>${TEN_GOD_EN[recv].name}</b> to you</span><span>you are <b>${TEN_GOD_EN[give].name}</b> to them</span><span>${yy ? 'opposite polarity' : 'same polarity'}</span>
    </div>
    <p class="ga-meta">${esc(A.arch)} (${STEM_PINYIN[a]}) meets ${esc(B.arch)} (${STEM_PINYIN[b]})</p>
    <p class="ga-lead">${esc(r.title)}. ${esc(r.body)}</p>

    <div class="ga-body">
      <h2>First impression</h2>
      <p>${esc(T.first)}</p>
      <p>${yy ? 'Yin meets yang here, so two different grains complete one picture — the difference itself is the attraction.' : 'Same polarity: familiar and comfortable, but the push-and-pull has to be created on purpose.'}</p>

      <h2>They are ${TEN_GOD_EN[recv].name} to you <span class="dp-tag">${TEN_GOD_EN[recv].alt}</span></h2>
      <p>${esc(SIP_RECV[recv])}</p>
      <h2>You are ${TEN_GOD_EN[give].name} to them <span class="dp-tag">${TEN_GOD_EN[give].alt}</span></h2>
      <p>${esc(SIP_GIVE[give])}</p>

      <h2>In love</h2>
      <p>${esc(T.love)}</p>

      <h2>At work and in partnership</h2>
      <p>${esc(T.work)}</p>

      <h2>To make it last</h2>
      <p><b>${esc(T.advice)}</b></p>

      <h2>The Day Branch changes the reading</h2>
      <p>Day Master compatibility is the first line of the reading. Whether your Day Branches harmonize or clash, and whether you fill each other\'s missing elements, can move the same ${A.name}–${B.name} pairing a long way. Two birth dates on the <a href="${rel}en/match/">match page</a> add the score, the Ten Gods between you and your best shared days. The six ${A.name} pillars are in the <a href="${rel}en/guide/day-pillar/">60 Day Pillars</a>.</p>

      <h2>${A.name} with each of the ten</h2>
      <div class="gp-grid">
        ${others}
      </div>

      <p class="callout"><a href="${rel}en/guide/compatibility/${slugOf(b, a)}/">From ${B.name}\'s side →</a> · <a href="${rel}en/guide/day-master/${A.slug}/">${esc(A.arch)}</a> · <a href="${rel}en/guide/day-master/${B.slug}/">${esc(B.arch)}</a> · <a href="${rel}gunghap/${KO_SLUG[a]}-${KO_SLUG[b]}/" hreflang="ko">한국어</a></p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/match/"><span class="seal-dot" aria-hidden="true"></span><span>Get your real match score</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">Don\'t know their birthday? Send a link — the moment they enter it, both of you see the reading.</p>
    </div>
  </article>`;
    const url = `/en/guide/compatibility/${slugOf(a, b)}/`;
    write(url.slice(1), shell({
      rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `${A.name} × ${B.name} — ${T.label}`,
      extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">\n  <link rel="alternate" hreflang="ko" href="${SITE}/gunghap/${KO_SLUG[a]}-${KO_SLUG[b]}/">`,
      jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: 'Library', url: SITE + '/en/guide/' }, { name: 'Compatibility', url: SITE + '/en/guide/compatibility/' }, { name: `${A.name} × ${B.name}`, url: SITE + url }]),
        { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: PUBLISHED, dateModified: PUBLISHED, inLanguage: 'en', author: { '@type': 'Organization', name: 'Sajucheop' }, publisher: { '@type': 'Organization', name: 'Sajucheop' }, mainEntityOfPage: SITE + url }],
      body
    }));
    urls.push(SITE + url);
  }
}

/* Index — 10×10 table */
{
  const rel = '../../../';
  const head = M.STEMS.map((s, k) => `<th>${s.han}<br><span style="font-size: 9px; font-weight: 400;">${DAY_MASTERS[k].name.replace(' ', '<br>')}</span></th>`).join('');
  const rows = M.STEMS.map((sa, a) => `<tr><th>${sa.han}<br><span style="font-size: 9px; font-weight: 400;">${DAY_MASTERS[a].name.replace(' ', '<br>')}</span></th>` +
    M.STEMS.map((sb, b) => { const k = relOf(a, b).key; const cls = k === 'hap' ? 'hap' : k === 'chung' ? 'chung' : k === 'bihwa' ? 'bihwa' : k.startsWith('saeng') ? 'saeng' : 'geuk'; const w = { hap: '합', chung: '충', bihwa: '=', saeng: '+', geuk: '−' }[cls]; return `<td><a class="${cls}" href="${rel}en/guide/compatibility/${slugOf(a, b)}/" title="${DAY_MASTERS[a].name} × ${DAY_MASTERS[b].name}">${w}</a></td>`; }).join('') + '</tr>').join('\n        ');
  const title = 'Day Master Compatibility Table — all 100 pairings of the ten stems (Saju / BaZi)';
  const desc = 'Yang Wood with Yin Earth, Yang Fire with Yang Water… every pairing of the ten Day Masters, read from your side: combine, clash, same element, nourish or shape — plus what you are to each other in the Ten Gods, in love and at work.';
  const body = `
  <article class="guide-article">
    <div class="ga-overline">Compatibility</div>
    <h1 class="ga-title">Day Master compatibility —<br>ten natures, one hundred meetings</h1>
    <p class="ga-meta">Rows are you, columns are them · 합 combine (red) · 충 clash (dark) · + nourish · = same · − shape</p>
    <p class="ga-lead">The first line of any Saju compatibility reading is the relationship between two Day Masters. Combine and you are drawn together; clash and you collide; nourish and one feeds the other; shape and one edits the other. Don\'t know your Day Master? <a href="${rel}en/">Your birth date is enough</a>.</p>
    <div class="ga-body">
      <div style="overflow-x: auto;">
      <table class="gp-table">
        <tr><th></th>${head}</tr>
        ${rows}
      </table>
      </div>
      <p>Tap a cell for first impression, love, work and advice. The same pairing reads differently from <b>your</b> side and <b>theirs</b> — read both pages side by side.</p>
      <p class="callout"><a href="${rel}en/guide/">The ten Day Masters</a> · <a href="${rel}en/guide/day-pillar/">60 Day Pillars</a> · <a href="${rel}gunghap/" hreflang="ko">한국어 궁합표</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/match/"><span class="seal-dot" aria-hidden="true"></span><span>Get your real match score</span></a>
    </div>
  </article>`;
  write('en/guide/compatibility', shell({ rel, lang: 'en', title, desc, canonical: SITE + '/en/guide/compatibility/', nav: NAV(rel), ogTitle: 'Day Master compatibility — 100 pairings',
    extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}/en/guide/compatibility/">\n  <link rel="alternate" hreflang="ko" href="${SITE}/gunghap/">`,
    jsonld: breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }, { name: 'Library', url: SITE + '/en/guide/' }, { name: 'Compatibility', url: SITE + '/en/guide/compatibility/' }]), body }));
  urls.unshift(SITE + '/en/guide/compatibility/');
}

fs.writeFileSync(path.join(DOCS, 'sitemap-en-compat.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u}</loc><lastmod>${PUBLISHED}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-en-compat.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-en-compat.xml\n');
console.log(`EN compatibility — ${urls.length - 1} pages + index, sitemap-en-compat.xml`);
