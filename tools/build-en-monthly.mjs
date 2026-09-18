/* English monthly zodiac horoscope — one page per solar month (jie to jie), all twelve signs on it
 *   /en/monthly/               hub: how a saju month works + list of months (current one marked)
 *   /en/monthly/YYYY-MM/       the solar month that begins in calendar month YYYY-MM: month pillar, each sign's reading
 *                              (branch relation × month stem element × 3 handwritten variants), its best and care DAYS
 *                              computed from the day pillars, and one line for each of the ten Day Masters
 * Window: the current solar month through December of next year. Deterministic apart from the "this month" mark,
 * so daily-story.yml can rerun it. → sitemap-en-monthly.xml.  Usage: node tools/build-en-monthly.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, kstToday, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { ANIMALS, EL, REL_EN } from './en-zodiac-data.mjs';
import { DDI, relations, elRelation, YUKHAP, CHUNG, SAMHAP_G } from './ddi-data.mjs';
import { STEM_PINYIN, BRANCH_PINYIN, STEM_EN, BRANCH_ANIMAL, TEN_GOD_EN } from './en-ilju-data.mjs';
import { DAY_MASTERS } from './en-daymaster-data.mjs';
import { publishedTime } from './solar-terms-data.mjs';

const { M, I } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const today = kstToday();
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad = (n) => String(n).padStart(2, '0');
const key = (y, m) => `${y}-${pad(m)}`;
const hm = (t) => `${pad(t.hh)}:${pad(t.mm)}`;
const md = (t) => `${MON[t.m - 1]} ${t.d}`;
const longD = (t) => `${WD[((I.daysFromCivil(t.y, t.m, t.d) + 4) % 7 + 7) % 7]}, ${MONTHS[t.m - 1]} ${t.d}, ${t.y}`;
const listText = (arr) => (arr.length < 3 ? arr.join(' and ') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const NAV = (rel) => [{ href: rel + 'en/', label: 'Chart' }, { href: rel + 'en/today/', label: 'Today' }, { href: rel + 'en/match/', label: 'Match' }, { href: rel + 'en/zodiac/', label: 'Zodiac' }, { href: rel + 'en/guide/', label: 'Library' }, { href: rel, label: '한국어' }];

/* ---------- solar months: the jie that opens calendar month m, and the branch of that month ---------- */
const JIE_OF_MONTH = { 1: 19, 2: 21, 3: 23, 4: 1, 5: 3, 6: 5, 7: 7, 8: 9, 9: 11, 10: 13, 11: 15, 12: 17 };   /* 소한 입춘 경칩 청명 입하 망종 소서 입추 백로 한로 입동 대설 */
const JIE_APPROX = { 1: 5, 2: 4, 3: 5, 4: 5, 5: 5, 6: 6, 7: 7, 8: 7, 9: 7, 10: 8, 11: 7, 12: 7 };
const BRANCH_OF_MONTH = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 0 };
function midnightJd(y, m, d) { return I.daysFromCivil(y, m, d) + I.JDN_EPOCH - 0.5 - 9 / 24; }
function jieOf(y, m) {
  const i = JIE_OF_MONTH[m];
  const pub = publishedTime(y, i);
  if (pub) return pub;
  const approx = midnightJd(y, m, JIE_APPROX[m]);
  const jd = I.findTermJd(i * 15, approx - 6, approx + 6);
  const tk = jd - I.JDN_EPOCH + 0.5 + 9 / 24, dn = Math.floor(tk), cv = I.civilFromDays(dn);
  let hh = Math.floor((tk - dn) * 24), mm = Math.round(((tk - dn) * 24 - hh) * 60);
  if (mm === 60) { hh += 1; mm = 0; }
  return { y: cv.y, m: cv.m, d: cv.d, hh, mm, published: false };
}
const nextMonth = (y, m) => (m === 12 ? [y + 1, 1] : [y, m + 1]);
const prevMonth = (y, m) => (m === 1 ? [y - 1, 12] : [y, m - 1]);
function solarMonth(y, m) {
  const start = jieOf(y, m), [ny, nm] = nextMonth(y, m), nextStart = jieOf(ny, nm);
  const endDn = I.daysFromCivil(nextStart.y, nextStart.m, nextStart.d) - 1, e = I.civilFromDays(endDn);
  const mid = I.civilFromDays(I.daysFromCivil(start.y, start.m, start.d) + 12);
  const r = M.compute({ year: mid.y, month: mid.m, day: mid.d, hour: 12, minute: 0, unknownTime: true, gender: 'M', applySolarTime: false });
  const p = r.pillars.month;
  if (p.branch !== BRANCH_OF_MONTH[m]) throw new Error(`month branch mismatch ${y}-${m}: engine ${p.branch}`);
  const days = [];
  for (let dn = I.daysFromCivil(start.y, start.m, start.d); dn <= endDn; dn++) { const c = I.civilFromDays(dn); const dp = M.dayPillarOf(c.y, c.m, c.d); days.push({ y: c.y, m: c.m, d: c.d, stem: dp.stem, branch: dp.branch }); }
  return { y, m, start, end: { y: e.y, m: e.m, d: e.d }, nextStart, stem: p.stem, branch: p.branch, days, yearStem: r.pillars.year.stem, yearBranch: r.pillars.year.branch };
}

/* ---------- handwritten text ---------- */
const MONTH_CHAR = [
  'The Rat month is the deepest point of winter’s Water: the solstice falls inside it, the nights are longest, and everything that matters happens indoors. It rewards planning, study and honest accounting, and punishes big launches. Whatever you seed now shows in spring.',
  'The Ox month closes the saju year: frozen ground, stored grain, the last stretch before Ipchun. It is a month for finishing, settling and clearing, not for beginnings; energy is inward and slow, and the people who use it best are the ones who tidy up so that the new year starts clean.',
  'The Tiger month opens the saju year. Wood breaks through frozen ground: first moves, applications, introductions and anything that needs a push carry unusual momentum. The weather still says winter; the calendar says go.',
  'The Rabbit month is spring at full strength — the gentlest Wood, growth without force. Things that were started now settle in and spread: relationships, projects, habits. A good month for the patient and a frustrating one for anyone who wants results by Friday.',
  'The Dragon month is spring’s damp Earth, the storehouse of Water. It is a month of foundations and paperwork, of deals reaching their middle rather than their end, and of a certain restlessness as spring turns toward summer.',
  'The Snake month opens summer: Fire begins to climb, days stretch, and the pace picks up everywhere. Visibility grows, and so does impatience. Good for presenting and promoting; less good for quiet, careful decisions.',
  'The Horse month is the peak of Fire, and the summer solstice sits inside it. Energy, exposure and tempers all run high. Things get decided quickly and publicly. Book the rest before the month starts, not after.',
  'The Goat month is late summer’s dry Earth, the height of the heat. Fire settles into soil: a month of ripening and maintenance, of holding what you have rather than reaching for more, and of protecting sleep and patience through the hottest weeks.',
  'The Monkey month opens autumn: Metal arrives inside the heat. Sharper decisions, clearer edges, the first cuts of the harvest. A month for deciding what to keep and what to drop, and for the paperwork that finalizes a summer’s work.',
  'The Rooster month is the sharpest Metal of the year, with the autumn equinox inside it. Judgment is clear, standards are high and words can cut. It rewards precision, reviews and finishing touches, and punishes loose promises.',
  'The Dog month is autumn’s Earth, the storehouse of Fire: the harvest goes into the barn. Gathering, consolidating, closing accounts and preparing for winter all suit it. Disputes over what belongs to whom are the month’s characteristic friction.',
  'The Pig month opens winter: Water rises, days shorten and the year turns inward. Planning, research and long conversations do well; visible launches less so. It is the month Koreans make kimchi — preparation for a season you cannot see yet.',
];
const STEM_TONE = [
  'Yang Wood on top gives the month a straightforward, upward push: projects start and plans get stated plainly.',
  'Yin Wood on top makes the month flexible and social — things grow by winding around obstacles rather than through them.',
  'Yang Fire on top puts everything in daylight: visibility, warmth, and no hiding place.',
  'Yin Fire on top gives a slow, focused warmth — good for careful work and long evenings.',
  'Yang Earth on top steadies the month: decisions stick, big things move slowly, and reliability counts.',
  'Yin Earth on top makes the month practical and nurturing — details, maintenance, and looking after people.',
  'Yang Metal on top sharpens everything: cuts, decisions, rules, and a tendency toward bluntness.',
  'Yin Metal on top brings polish and precision — good for finishing, judging and refining.',
  'Yang Water on top makes the month expansive and unpredictable — ideas travel far and plans change.',
  'Yin Water on top makes the month quiet and intuitive — research, reflection and gentle persistence.',
];
/* {S} sign, {M} month animal */
const SIGN_REL = {
  yukhap: [
    'The {M} month forms a six harmony with your branch, the closest bond in the zodiac. Doors that stuck open, people say yes, and negotiations that dragged find their ending. Put the important meeting, proposal or contract in this month, and let someone help you for once.',
    'This is your secret-friend month: the {M} and the {S} recognize each other. Relationships of every kind run smoothly, help arrives without being asked, and small kindnesses come back doubled. The one caution is that it is hard to say no when everyone is agreeable — choose carefully what you agree to.',
    'A harmony month for the {S}. Whatever depends on other people — hiring, dating, mending a quarrel, asking a favor — goes better now than in most months. Use the goodwill on the thing that matters most rather than spreading it thin, and confirm the agreements you make so they outlast the month.',
  ],
  samhap: [
    'The {M} shares your trine, so this month people pull in your direction. Teamwork produces more than solo effort, group plans come together, and shared projects reach a milestone. If you have been waiting to bring others in on something, this is the month.',
    'A trine month: the {M} and the {S} face the same way. Meetings multiply and most of them are worth attending; a friend of a friend turns out to be exactly the person you needed. The risk is overcommitting to everyone who asks, so decide early which two efforts get your best hours.',
    'Your allies are in the room this month. The {M} month brings the {S} the kind of company that gets things done — colleagues who deliver, relatives who help, a partner who takes the other end of the load. Push the shared goal, share the credit, and keep the pace steady.',
  ],
  banghap: [
    'The {M} month belongs to your season, so its rhythm fits yours. Things feel natural rather than forced: routines settle, work flows, and you are more yourself than in the months around it. Steady progress is the theme; there is no need to rush what is already moving.',
    'A same-season month for the {S}. The mood of the month matches your temperament, which makes it comfortable and slightly dangerous, because your weak spots share the month’s weak spots. Enjoy the ease, and ask someone with a different view before any big decision.',
    'The {M} sits in your seasonal trio, so this month runs at your speed. Good for consolidating gains, deepening a relationship and keeping a habit going. Nothing pushes you off course, which means the direction has to come from you.',
  ],
  same: [
    'Your own month. The {S}’s branch doubles, so confidence, visibility and stubbornness all rise together. People notice you and expect more of you. Take the stage that is offered, listen as much as you speak, and keep your calendar lighter than your ambitions.',
    'The {M} month is the {S}’s own, and it amplifies whatever you already are. Strengths show; so do habits you would rather hide. A good month to be seen doing your best work and a poor one for arguing with people who share your blind spots.',
    'A mirror month: the branch of the month is your branch. Energy is high and so is the temptation to do everything yourself. Delegate one thing, keep promises few, and spend the extra confidence on the conversation you have been avoiding.',
  ],
  selfhyeong: [
    'Your own month — and for the {S}, whose branch carries a self-punishment link, the month when you are hardest on yourself. Standards rise, patience falls, and overthinking creeps in. Rest earlier than feels justified, judge your progress by what got done rather than how it looked, and go easy on the people closest to you.',
    'The {M} month doubles your branch and, for the {S}, turns the pressure inward rather than outward. Expect a tendency to rework finished things and to replay conversations at night. Lighter deadlines, more sleep and one honest friend are the month’s medicine.',
    'A self-punishment month for the {S}: your own branch meets itself, and the usual result is perfectionism with nowhere to go. Plan a quiet month on purpose — maintenance, routine, small finishes — and keep big self-assessments for later.',
  ],
  chung: [
    'The {M} month clashes with your branch, so expect movement: schedules shift, plans get rearranged, and something you thought settled reopens. Clash is momentum, not damage. Use it to finish a change you have postponed, and keep big signatures and long journeys for a calmer month if you can.',
    'Your clash month. The {M} sits opposite the {S} on the wheel, and the collision shows up as changed plans, moved deadlines and short tempers. Travel with extra time, double-check bookings, and don’t decide anything permanent on the day it goes wrong.',
    'A month of friction and forward motion for the {S}. Things that were stuck come loose, which is useful if you wanted them loose and tiring if you did not. Sleep on decisions, slow down on busy days, and treat every change as a chance to renegotiate on your terms.',
  ],
  hyeong: [
    'The {M} month forms a punishment link with your branch: small corrections, rules and disputes come thicker than usual. Handle them by the book — written confirmations, receipts, dates — and the month ends with clearer arrangements than it began. Sleep on any argument before answering.',
    'A friction month for the {S}. People check your work, criticize your details and hold you to promises you half made. It stings, and it polishes. Read every document twice, keep your word to the letter, and postpone the conversation that would turn a disagreement into a feud.',
    'Punishment months are for refinement. The {M} rubs against the {S}, and what it rubs off is sloppiness: unclear terms, loose promises, unread fine print. Get precise this month and the friction works for you; get careless and it works against you.',
  ],
  hae: [
    'The {M} month forms a harm link with your branch — a quiet drain rather than a collision. Favors go unreturned, small costs pile up, and kindness gets misread. Keep money and help clear and written, ask before doing someone a favor, and don’t keep score.',
    'A harm month for the {S}: nothing dramatic, but a steady leak of goodwill and small change. Check subscriptions, fees and the terms of anything you agree to, and be plain about what you expect in return for help. Quiet weeks and small circles suit it.',
    'The harm link between the {S} and the {M} shows up as help that backfires and words passed on wrongly. Put important things in writing, expect a little less of people this month, and save generosity for those who have earned it.',
  ],
  wonjin: [
    'The {M} month sits in wonjin with your branch — quiet resentment, the irritation that builds without a clear cause. Give the people who annoy you a little distance, re-read messages before sending, and decide nothing in a bad mood. The feeling passes when the month does.',
    'A wonjin month for the {S}. Tone and timing keep missing, and small slights feel larger than they are. Spend less unplanned time with the people who set you off, more on things that need your hands, and mention hurts briefly on the day instead of storing them.',
    'Resentment month: for the {S}, the {M} brings friction that has no good explanation. Don’t look for one. Keep meetings short, keep promises small, and let a week pass before you judge anyone’s intentions.',
  ],
  pa: [
    'The {M} month forms a break link with your branch: things go well until the last step, then a gap opens. Plans fall through, appointments slip, deliveries arrive late. A habit of confirming twice is enough to turn this into an ordinary month.',
    'A break month for the {S}. Expect cracks at the finish — the signature that gets delayed, the plan that unravels at the end. Build a plan B into anything important, check the final details yourself, and don’t take the slips personally.',
    'The break between the {S} and the {M} is mild: a tendency for arrangements to come apart near completion. Confirm times, places and amounts in writing, leave slack in the schedule, and use the month to clear away plans that were never going to hold.',
  ],
  none: [
    'No fixed link between the {M} and the {S}: nothing pulls you along and nothing pushes back. A month whose shape you set yourself — the routine you keep is the result you get. Good for steady building, learning, and quiet progress on long projects.',
    'A neutral month for the {S}. With no harmony or clash in the branches, the month’s element does the talking, and its tone is mild. Keep your habits, tend your relationships, and use the calm to prepare for the busier months on either side.',
    'The {M} month leaves the {S} alone, which is its own kind of gift. Nothing dramatic is scheduled, so make something: a course, a savings target, a repair long postponed. Quiet months are where next year’s results are built.',
  ],
};
/* sign element vs month stem element — ddi-data elRelation(signEl, stemEl) */
const EL_LINE = {
  same: 'The month’s {E} matches your own element, adding company and competition in equal measure.',
  gen: 'Your {SE} feeds the month’s {E}: you give out more than you take in, so pace your energy.',
  gen_by: 'The month’s {E} feeds your {SE}: support, learning and backing come easier than usual.',
  ctl: 'Your {SE} controls the month’s {E}: a month where effort turns into tangible results and money can move.',
  ctl_by: 'The month’s {E} presses on your {SE}: more responsibility and scrutiny, and the discipline to match.',
};
const TEN_GOD_MONTH = {
  '비견': 'a month of standing on your own — peers gather and independence works; keep money matters separate.',
  '겁재': 'a competitive month — drive rises and so does shared spending; avoid lending.',
  '식신': 'a month of ease and output — make, cook, write, show, and enjoy without overdoing it.',
  '상관': 'a month of sharp expression — good for pitching and persuading, careful around authority.',
  '편재': 'opportunity and spending both swell — decide the budget before the month decides it for you.',
  '정재': 'steady gains — routine work pays, promises hold, and it is a fair month for sensible signatures.',
  '편관': 'pressure and proving — demands land on you; meet them squarely and protect your rest.',
  '정관': 'structure favors you — applications, reviews and formal steps go well if you follow the rules.',
  '편인': 'deep, unusual insight — study and research pull you in; don’t postpone the one decision that matters.',
  '정인': 'support and green lights — approvals, mentors and documents; ask for help and it tends to arrive.',
};
const primaryRel = (rels) => (rels.includes('selfhyeong') ? 'selfhyeong' : rels.find((r) => r !== 'same') || rels[0] || 'none');
const fill = (s, m) => s.replace(/\{(\w+)\}/g, (_, k) => m[k]);
const EL_KO = { Wood: '목', Fire: '화', Earth: '토', Metal: '금', Water: '수' };

const STYLE = `<style>
    .mo-hero { margin: 0 0 18px; padding: 20px; background: #221D17; border-radius: 14px; color: #F6F1E8; text-align: center; }
    .mo-hero .mo-over { font-size: 12px; letter-spacing: 3px; color: #E0B04A; text-transform: uppercase; }
    .mo-hero .mo-han { font-family: 'Noto Serif KR', serif; font-size: 40px; font-weight: 700; letter-spacing: 4px; margin: 6px 0 2px; }
    .mo-hero .mo-sub { font-size: 13px; color: #CFC5B4; }
    .mo-sign { padding: 14px 0; border-bottom: 1px solid var(--line-soft); }
    .mo-sign h3 { font-family: 'Noto Serif KR', serif; font-size: 17px; margin: 0 0 6px; }
    .mo-sign h3 small { font-size: 12px; color: var(--muted); font-weight: 400; margin-left: 8px; }
    .mo-sign h3 span.tag { font-size: 11px; padding: 1px 7px; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); margin-left: 6px; vertical-align: 2px; font-family: 'Noto Sans KR', sans-serif; font-weight: 500; }
    .mo-sign h3 span.tag.good { border-color: #1E5C46; color: #1E5C46; } .mo-sign h3 span.tag.bad { border-color: var(--seal); color: var(--seal); }
    .mo-sign p { margin: 6px 0 0; font-size: 14px; line-height: 1.65; }
    .mo-sign .days { font-size: 13px; color: var(--muted); }
    .mo-sign .days b { color: var(--ink); font-weight: 600; }
    .mo-list { list-style: none; padding: 0; margin: 6px 0 0; }
    .mo-list li { padding: 9px 0; border-bottom: 1px solid var(--line-soft); font-size: 14px; line-height: 1.6; }
    .mo-list li.cur { background: #FBF3E6; margin: 0 -8px; padding-left: 8px; padding-right: 8px; border-radius: 8px; }
    .mo-list li b.han { font-family: 'Noto Serif KR', serif; }
    .mo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 8px 0 14px; }
    .mo-grid a { display: block; padding: 8px 4px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; text-decoration: none; color: inherit; text-align: center; font-size: 12.5px; }
    .mo-grid a b { display: block; font-family: 'Noto Serif KR', serif; font-size: 18px; }
    .mo-grid a.good { border-color: #1E5C46; } .mo-grid a.bad { border-color: var(--seal); }
    @media (max-width: 480px) { .mo-grid { grid-template-columns: repeat(3, 1fr); } }
  </style>`;

const urls = [];
function write(url, o) {
  const file = path.join(DOCS, url.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, shell(o));
}
const faqHtml = (faq) => faq.map(([q, a], i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div class="ih-body"><p>${a}</p></div></details>`).join('\n      ');
const faqLd = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) });
const crumbs = (items) => breadcrumb([{ name: 'Sajucheop', url: SITE + '/en/' }].concat(items.map(([name, url]) => ({ name, url: SITE + url }))));
const article = (url, title, desc, published) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, image: SITE + '/og-image-en.png', datePublished: published, dateModified: published, inLanguage: 'en', author: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/about/' }, publisher: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/' }, mainEntityOfPage: SITE + url });

/* ---------- window ---------- */
function currentSolarMonth() {
  let y = today.y, m = today.m;
  const j = jieOf(y, m);
  if (I.daysFromCivil(today.y, today.m, today.d) < I.daysFromCivil(j.y, j.m, j.d)) [y, m] = prevMonth(y, m);
  return [y, m];
}
const [CY, CM] = currentSolarMonth();
const LIST = [];
for (let y = CY, m = CM; y < today.y + 2; [y, m] = nextMonth(y, m)) { LIST.push([y, m]); if (y === today.y + 1 && m === 12) break; }
const monthUrl = (y, m) => `/en/monthly/${key(y, m)}/`;
const monthName = (y, m) => `${MONTHS[m - 1]} ${y}`;

/* ---------- month page ---------- */
function monthPage(y, m, idx) {
  const S = solarMonth(y, m), url = monthUrl(y, m), rel = '../../../';
  const A = ANIMALS[S.branch], stemEl = EL[M.STEMS[S.stem].el].en, stemElKo = M.STEMS[S.stem].el;
  const han = M.STEMS[S.stem].han + M.BRANCHES[S.branch].han, pinyin = `${STEM_PINYIN[S.stem]} ${BRANCH_PINYIN[S.branch]}`;
  const range = `${md(S.start)} – ${md(S.end)}`;
  const isCur = y === CY && m === CM;
  const goodSigns = [], careSigns = [];
  const signs = ANIMALS.map((X, b) => {
    const rels = relations(b, S.branch), p = primaryRel(rels);
    const extra = rels.filter((r) => r !== p && r !== 'same');
    const good = ['yukhap', 'samhap', 'banghap'].includes(p), bad = ['chung', 'hyeong', 'hae', 'wonjin', 'pa', 'selfhyeong'].includes(p);
    if (good) goodSigns.push(b); if (bad) careSigns.push(b);
    const variant = SIGN_REL[p][(idx + b) % SIGN_REL[p].length];
    const er = elRelation(DDI[b].el, stemElKo);
    const bestDays = S.days.filter((d) => YUKHAP[b] === d.branch || (d.branch !== b && SAMHAP_G[d.branch] === SAMHAP_G[b]));
    const careDays = S.days.filter((d) => CHUNG[b] === d.branch);
    const fmtDays = (arr) => arr.map((d) => `${MON[d.m - 1]} ${d.d} (${BRANCH_ANIMAL[d.branch]})`).join(', ');
    const label = p === 'none' ? 'Neutral' : REL_EN[p].label + (extra.length ? ' · ' + extra.map((r) => REL_EN[r].long.toLowerCase()).join(' · ') : '');
    return { b, X, p, good, bad, html: `
      <div class="mo-sign" id="${X.slug}">
        <h3>${X.name} <b class="han" style="font-family: 'Noto Serif KR', serif;">${M.BRANCHES[b].han}</b><span class="tag${good ? ' good' : bad ? ' bad' : ''}">${esc(label)}</span><small><a href="${rel}en/2027/${X.slug}/">${X.name} in 2027</a></small></h3>
        <p>${esc(fill(variant, { S: X.name, M: A.name }))} ${esc(fill(EL_LINE[er], { E: stemEl, SE: EL[DDI[b].el].en }))}</p>
        <p class="days"><b>Best days:</b> ${bestDays.length ? fmtDays(bestDays) : 'none stand out'} · <b>Take care:</b> ${careDays.length ? fmtDays(careDays) : 'no clash days'}</p>
      </div>` };
  });
  const grid = signs.map((s) => `<a href="#${s.X.slug}" class="${s.good ? 'good' : s.bad ? 'bad' : ''}"><b>${M.BRANCHES[s.b].han}</b>${s.X.name}</a>`).join('');
  const dmLines = DAY_MASTERS.map((d, s) => { const sip = M.sipseongOf(s, S.stem); return `<li><b>${d.name}</b> <small>(${d.arch})</small> — ${TEN_GOD_EN[sip].name}: ${esc(TEN_GOD_MONTH[sip])}</li>`; }).join('\n        ');
  const yearHan = M.STEMS[S.yearStem].han + M.BRANCHES[S.yearBranch].han;
  const [py, pm] = prevMonth(y, m), [ny, nm] = nextMonth(y, m);
  const hasPrev = LIST.some(([a, b]) => a === py && b === pm), hasNext = LIST.some(([a, b]) => a === ny && b === nm);
  const title = `Chinese Horoscope ${MONTHS[m - 1]} ${y} — the ${A.name} Month`;
  const desc = `${MONTHS[m - 1]} ${y} horoscope for all 12 Chinese zodiac signs: the ${A.name} month (${range}), each sign’s best and care days, and notes for the ten Day Masters.`;
  const published = `${S.start.y}-${pad(S.start.m)}-${pad(S.start.d)}`;
  const faq = [
    [`When does the ${A.name} month of ${y} begin and end?`, `It runs from ${longD(S.start)} at ${hm(S.start)} Korea time, the solar term that opens it, to ${longD(S.end)}; the next month begins on ${md(S.nextStart)} at ${hm(S.nextStart)}. Saju months follow the solar terms, not the calendar, which is why the ${A.name} month straddles ${MONTHS[S.start.m - 1]} and ${MONTHS[S.end.m - 1]}.`],
    [`Which zodiac signs have the best ${MONTHS[m - 1]} ${y}?`, `${goodSigns.length ? `${listText(goodSigns.map((b) => `the ${ANIMALS[b].name}`))} — their branches form a harmony with the ${A.name}. ` : ''}${careSigns.length ? `${cap(listText(careSigns.map((b) => `the ${ANIMALS[b].name}`)))} meet more friction and should take the month steadily.` : 'No sign clashes with the month.'} The rest have no fixed link and read the month by its element, ${stemEl}.`],
    [`What is the month pillar for ${MONTHS[m - 1]} ${y}?`, `${han} — ${pinyin}, ${STEM_EN[S.stem]} over the ${A.name}. The stem, ${STEM_EN[S.stem]}, sets the month’s tone; the branch, the ${A.name}, decides how each sign meets it. It sits inside the ${yearHan} year.`],
    ['Is a monthly horoscope by zodiac sign the same as a saju reading?', `No. Your animal sign is one of eight characters in a saju chart, so this page reads one character against the month. A personal reading starts from your Day Master, the stem of your birth day; <a href="${rel}en/">cast your chart</a> and <a href="${rel}en/today/">today’s reading</a> compares each day with all of it.`],
  ];
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}en/monthly/" style="color: inherit; text-decoration: none;">Monthly horoscope</a> · ${monthName(y, m)}</div>
    <h1 class="ga-title">${MONTHS[m - 1]} ${y} — the ${A.name} month <br>for all twelve signs</h1>
    <p class="ga-meta">${range} · month pillar ${han} (${pinyin}) · the ${yearHan} year${isCur ? ' · this month' : ''}</p>
    <div class="mo-hero">
      <div class="mo-over">${MONTHS[m - 1]} ${y}</div>
      <div class="mo-han">${han}</div>
      <div class="mo-sub">${STEM_EN[S.stem]} over the ${A.name} · ${longD(S.start)} ${hm(S.start)} – ${longD(S.end)} (KST)</div>
    </div>
    <p class="ga-lead">${esc(MONTH_CHAR[S.branch])} ${esc(STEM_TONE[S.stem])}</p>
    <div class="ga-body">
      <p>Saju counts months from one solar term to the next, so this month begins at ${hm(S.start)} on ${md(S.start)} and ends on ${md(S.end)}. Each sign below is read two ways: how the ${A.name} branch meets the sign’s own branch, and how the month’s ${stemEl} meets the sign’s element. The best and care days are the days in the month whose day pillar harmonizes or clashes with the sign, computed from the sixty-day cycle.</p>
      <div class="mo-grid">${grid}</div>
      ${signs.map((s) => s.html).join('\n')}

      <h2>For the ten Day Masters</h2>
      <p>Your animal sign is one character of eight. The stem of the month, ${STEM_EN[S.stem]}, meets each Day Master as one of the Ten Gods, and that relationship sets the month’s theme more precisely than the animal does. Don’t know your Day Master? <a href="${rel}en/">Your birth date is enough.</a></p>
      <ul class="mo-list">
        ${dmLines}
      </ul>

      <h2>FAQ</h2>
      ${faqHtml(faq)}
      <p class="callout">${hasPrev ? `← <a href="${rel}${monthUrl(py, pm).slice(1)}">${monthName(py, pm)}</a> · ` : ''}${hasNext ? `<a href="${rel}${monthUrl(ny, nm).slice(1)}">${monthName(ny, nm)}</a> → · ` : ''}<a href="${rel}en/monthly/">All months</a> · <a href="${rel}en/solar-terms/${S.start.y}/">Solar terms ${S.start.y}</a> · <a href="${rel}en/day/">Day pillar calendar</a> · <a href="${rel}en/guide/luck-pillars/">Years and months in a chart</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/today/"><span class="seal-dot" aria-hidden="true"></span><span>Read this month day by day for my own chart</span></a>
    </div>
  </article>`;
  write(url, { rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `${MONTHS[m - 1]} ${y} — the ${A.name} month, all 12 signs`,
    extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">\n  <link rel="alternate" hreflang="ko" href="${SITE}/wolun/${key(y, m)}/">`,
    jsonld: [crumbs([['Monthly horoscope', '/en/monthly/'], [monthName(y, m), url]]), article(url, title, desc, published), faqLd(faq)], body });
  urls.push({ loc: SITE + url, lastmod: published });
  return { y, m, S, A, han, pinyin, range, isCur, goodSigns, careSigns };
}

/* ---------- hub ---------- */
function hub(months) {
  const url = '/en/monthly/', rel = '../../';
  const items = months.map((x) => `<li${x.isCur ? ' class="cur"' : ''}><b><a href="${rel}${monthUrl(x.y, x.m).slice(1)}">${monthName(x.y, x.m)}</a></b> — the ${x.A.name} month, ${x.range} · <b class="han">${x.han}</b> ${x.pinyin}${x.isCur ? ' · <b>this month</b>' : ''}<br><small style="color: var(--muted);">Smoothest for ${x.goodSigns.length ? listText(x.goodSigns.map((b) => ANIMALS[b].name)) : 'no sign in particular'}${x.careSigns.length ? `; more care for ${listText(x.careSigns.map((b) => ANIMALS[b].name))}` : ''}</small></li>`).join('\n        ');
  const cur = months.find((x) => x.isCur);
  const title = 'Monthly Chinese Horoscope — Every Sign, Every Solar Month';
  const desc = 'Monthly horoscope for all 12 Chinese zodiac signs: how each solar month meets your sign, your best and care days, and notes for the ten Day Masters.';
  const faq = [
    ['Why do these months start on the 4th to the 8th instead of the 1st?', 'Because a saju month runs from one solar term to the next. The twelve jie terms — Start of Spring, Awakening of Insects and so on — fall between the 4th and the 8th of each calendar month, and the month pillar changes at that moment. Every page gives the exact time.'],
    ['How are the best and care days worked out?', 'Every day carries a pillar from the sixty-day cycle. A day whose branch forms a six harmony or a trine with your sign is listed as a best day; a day whose branch clashes with it is a care day. They are the same relationships the yearly and monthly readings use, applied one day at a time.'],
    ['Is this the same as a daily or yearly horoscope?', 'It sits between them. The yearly pages read your sign against the year’s branch, these pages against the month’s, and the day pillar calendar against each day. A saju chart layers all three over eight characters of your own, which is what the calculator and today’s reading do.'],
  ];
  const body = `
  <article class="guide-article">
    <div class="ga-overline">Monthly horoscope</div>
    <h1 class="ga-title">Monthly Chinese horoscope — <br>every sign, every solar month</h1>
    <p class="ga-meta">${months.length} months · ${monthName(months[0].y, months[0].m)} to ${monthName(months[months.length - 1].y, months[months.length - 1].m)} · months begin at the solar terms</p>
    <p class="ga-lead">In saju a month is not a calendar month: it runs from one solar term to the next, and each one carries a pillar of two characters, the way a year does. These pages read every solar month for all twelve signs — how the month’s branch meets yours, which days in it harmonize or clash with you, and what the month’s stem means for each of the ten Day Masters.${cur ? ` This month is the <a href="${rel}${monthUrl(cur.y, cur.m).slice(1)}">${cur.A.name} month (${cur.range})</a>.` : ''}</p>
    <div class="ga-body">
      <ul class="mo-list">
        ${items}
      </ul>
      <h2>How to read a month</h2>
      <p>Start with the month pillar. Its branch is one of the twelve animals, and the same relationships that decide zodiac compatibility — six harmony, trine, clash, punishment, harm — decide how the month treats your sign. Its stem carries one of the five elements and colors the whole month: a Yang Fire month is loud and visible, a Yin Water month quiet and inward. Then look at the days: within any month, a handful of days harmonize with your sign and two or three clash with it, and those are worth knowing when you plan a meeting, a trip or a signature.</p>
      <p>All of this reads one character of your chart, the year branch. The <a href="${rel}en/">chart calculator</a> gives you the other seven, and <a href="${rel}en/today/">today’s reading</a> compares each day with your Day Master and Day Branch rather than with your animal alone.</p>
      <h2>FAQ</h2>
      ${faqHtml(faq)}
      <p class="callout"><a href="${rel}en/2027/">2027 yearly horoscope</a> · <a href="${rel}en/zodiac/">Chinese zodiac calculator</a> · <a href="${rel}en/solar-terms/">The 24 solar terms</a> · <a href="${rel}en/day/">Day pillar calendar</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}en/"><span class="seal-dot" aria-hidden="true"></span><span>Cast my Four Pillars chart</span></a>
    </div>
  </article>`;
  write(url, { rel, lang: 'en', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: 'Monthly Chinese horoscope — every sign, every solar month',
    extraHead: STYLE + `\n  <link rel="alternate" hreflang="en" href="${SITE}${url}">\n  <link rel="alternate" hreflang="ko" href="${SITE}/wolun/">`,
    jsonld: [crumbs([['Monthly horoscope', url]]), faqLd(faq)], body });
  urls.unshift({ loc: SITE + url, lastmod: `${today.y}-${pad(today.m)}-${pad(today.d)}` });
}

const months = LIST.map(([y, m], i) => monthPage(y, m, i));
hub(months);
fs.writeFileSync(path.join(DOCS, 'sitemap-en-monthly.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-en-monthly.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-en-monthly.xml\n');
console.log(`EN monthly — ${months.length} months (${key(LIST[0][0], LIST[0][1])} → ${key(...LIST[LIST.length - 1])}) + hub, sitemap-en-monthly.xml`);
