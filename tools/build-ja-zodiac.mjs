/* Japanese 2027 horoscope — /ja/2027/ (hub) + /ja/2027/<animal>/ ×12 → sitemap-ja.xml (also lists /ja/).
 * Scores and relations are the same numbers as the Korean 2027 신년운세 and /en/2027/ (ddi-data, newyear-2027-data);
 * the copy is tools/ja-2027-signs.mjs. Year boundary = 立春 (published time). Usage: node tools/build-ja-zodiac.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { DDI, relations } from './ddi-data.mjs';
import { YEAR_REL_SCORE, YEAR_EL_ADJ, SAMJAE_ADJ } from './newyear-2027-data.mjs';
import { SIGNS27, YEAR_INTRO } from './ja-2027-signs.mjs';
import { publishedTime } from './solar-terms-data.mjs';

const { M, I } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-14', MODIFIED = '2026-09-14';
const YB = 7, YS = 3;   /* 2027 = 丁未 */
const NAV = (rel) => [{ href: rel + 'ja/', label: '命式計算' }, { href: rel + 'ja/2027/', label: '2027年の運勢' }, { href: rel + 'en/', label: 'English' }, { href: rel, label: '한국어' }];
const REL_JA = {
  same: { label: '同じ支', tone: 'neutral', short: '未と同じ支' }, yukhap: { label: '支合', tone: 'good', short: '未と支合' }, samhap: { label: '三合', tone: 'good', short: '未と三合' },
  banghap: { label: '方合', tone: 'good', short: '未と方合' }, chung: { label: '冲', tone: 'bad', short: '未と冲' }, hyeong: { label: '刑', tone: 'bad', short: '未と刑' },
  selfhyeong: { label: '自刑', tone: 'bad', short: '未と自刑' }, wonjin: { label: '怨嗔', tone: 'bad', short: '未と怨嗔' }, hae: { label: '害', tone: 'bad', short: '未と害' }, pa: { label: '破', tone: 'bad', short: '未と破' },
  none: { label: '特別な関係なし', tone: 'neutral', short: '未と特別な関係なし' }
};
const EL_JA = { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' };
const TERM_JA = ['立春', '啓蟄', '清明', '立夏', '芒種', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
const primary = (rels) => (rels.includes('selfhyeong') ? 'selfhyeong' : rels.find((r) => r !== 'same' && r !== 'selfhyeong') || rels[0] || 'none');
const han = (b) => M.BRANCHES[b].han;
const slugs = DDI.map((d) => d.slug);
slugs.forEach((s) => { const o = SIGNS27[s]; if (!o || o.overall.length !== 2 || o.do.length < 2 || o.dont.length < 2 || o.faq.length < 3) throw new Error('ja copy incomplete: ' + s); });

function jdToKst(jd) {
  const t = jd - I.JDN_EPOCH + 0.5 + 9 / 24, dn = Math.floor(t), cv = I.civilFromDays(dn), frac = t - dn;
  let hh = Math.floor(frac * 24), mm = Math.round((frac * 24 - hh) * 60);
  if (mm === 60) { hh += 1; mm = 0; }
  return { y: cv.y, m: cv.m, d: cv.d, hh, mm };
}
const dayBefore = (c) => { const x = I.civilFromDays(I.daysFromCivil(c.y, c.m, c.d) - 1); return { y: x.y, m: x.m, d: x.d }; };
const md = (c) => `${c.m}月${c.d}日`;

/* ---------- scores, months (same formulas as /en/2027/) ---------- */
function score27(b) {
  let s = 78;
  for (const r of relations(b, YB)) s += YEAR_REL_SCORE[r] || 0;
  s += YEAR_EL_ADJ[DDI[b].el];
  if (DDI[b].samjae) s += SAMJAE_ADJ;
  return Math.max(60, Math.min(95, s));
}
function grade27(score) {
  if (score >= 90) return { label: 'とても良い年', tone: 'good' };
  if (score >= 80) return { label: '恵まれた年', tone: 'good' };
  if (score >= 70) return { label: '安定の年', tone: 'neutral' };
  return { label: '用心の年', tone: 'warn' };
}
const S27 = slugs.map((_, b) => score27(b));
const IP27 = publishedTime(2027, 21) || jdToKst(I.ipchunJd(2027));
const MONTHS27 = [];
{
  let jd = I.ipchunJd(2027);
  for (let i = 0; i < 12; i++) {
    if (i > 0) jd = I.findTermJd((315 + 30 * i) % 360, jd + 20, jd + 40);
    const inStem = ((YS % 5) * 2 + 2) % 10;
    const pub = publishedTime(i === 0 ? 2027 : (i >= 11 ? 2028 : 2027), [21, 23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19][i]);
    MONTHS27.push({ i, term: TERM_JA[i], start: pub || jdToKst(jd), stem: (inStem + i) % 10, branch: (2 + i) % 12 });
  }
  const end = publishedTime(2028, 21) || jdToKst(I.findTermJd(315, jd + 20, jd + 40));
  MONTHS27.forEach((mo, i) => { mo.end = dayBefore(i < 11 ? MONTHS27[i + 1].start : end); });
}
const monthRel = (b, mb) => primary(relations(b, mb));
const yearsOf = (b) => { const ys = []; for (let y = 1936; y <= 2032; y++) if (((y - 4) % 12 + 12) % 12 === b) ys.push(y); return ys; };
const listJa = (a) => a.join('・');

const STYLE = `<style>
    .zd-hero { margin: 4px 0 18px; padding: 18px 16px; background: #211C15; color: #F6F1E8; border-radius: 14px; text-align: center; }
    .zd-over { font-size: 12px; letter-spacing: 0.12em; color: #B7AD9C; }
    .zd-han { font-family: var(--serif); font-size: 44px; font-weight: 700; margin: 6px 0 2px; }
    .zd-score { font-family: var(--serif); font-size: 40px; font-weight: 700; color: #E8B04A; line-height: 1.1; }
    .zd-score span { font-size: 16px; color: #B7AD9C; font-weight: 500; }
    .zd-sub { font-size: 14px; color: #E8DFCB; margin-top: 4px; }
    .zd-bar { height: 8px; background: #3A3128; border-radius: 4px; margin: 12px 20px 10px; overflow: hidden; }
    .zd-bar i { display: block; height: 8px; background: #E8B04A; border-radius: 4px; }
    .zd-badges { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
    .zd-badge { font-size: 12px; padding: 4px 10px; border-radius: 999px; background: #3A3128; color: #E8DFCB; }
    .zd-badge.good { background: #2F5D3F; } .zd-badge.bad { background: #7A2E24; }
    .zd-list { padding-left: 18px; line-height: 1.75; } .zd-list li + li { margin-top: 6px; }
    .zd-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0 18px; }
    .zd-grid a { display: block; text-align: center; padding: 12px 6px; border: 1px solid var(--line-soft); border-radius: 10px; background: #fff; text-decoration: none; color: var(--ink); }
    .zd-grid b { display: block; font-family: var(--serif); font-size: 26px; color: var(--seal); line-height: 1.1; }
    .zd-grid span { display: block; font-size: 12.5px; font-weight: 700; margin-top: 4px; }
    .zd-grid small { display: block; font-size: 11px; color: var(--faint); margin-top: 2px; } .zd-grid small i { font-style: normal; font-weight: 700; color: var(--ink); }
    .zd-wrap { overflow-x: auto; }
    .zd-table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin-top: 10px; }
    .zd-table th, .zd-table td { padding: 7px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .zd-table th { font-size: 12px; color: var(--muted); font-weight: 500; }
    .zd-table tr.cur td { background: #FBF3E6; } .zd-table td.good { color: #2F5D3F; font-weight: 700; } .zd-table td.bad { color: var(--seal); font-weight: 700; }
    @media (max-width: 480px) { .zd-grid { grid-template-columns: repeat(3, 1fr); } .zd-han { font-size: 34px; } }
  </style>`;

const urls = [SITE + '/ja/'];
function write(url, html) {
  const file = path.join(DOCS, url.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  urls.push(SITE + url);
}
const alt = (ja, en, ko) => `\n  <link rel="alternate" hreflang="ja" href="${SITE}${ja}">\n  <link rel="alternate" hreflang="en" href="${SITE}${en}">\n  <link rel="alternate" hreflang="ko" href="${SITE}${ko}">`;
const article = (url, title, desc) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, image: SITE + '/og-image-en.png', datePublished: PUBLISHED, dateModified: MODIFIED, inLanguage: 'ja', author: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/about/' }, publisher: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/ja/' }, mainEntityOfPage: SITE + url });
const faqLd = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const crumbs = (items) => breadcrumb([{ name: 'Sajucheop', url: SITE + '/ja/' }].concat(items.map(([name, url]) => ({ name, url: SITE + url }))));
const sUrl = (b) => `/ja/2027/${slugs[b]}/`;

/* ---------- sign pages ---------- */
function signPage(b) {
  const d = DDI[b], S = SIGNS27[d.slug], url = sUrl(b), rel = '../../../';
  const score = S27[b], g = grade27(score), rels = relations(b, YB);
  const months = MONTHS27.map((mo) => ({ mo, r: monthRel(b, mo.branch) }));
  const good = months.filter((m) => ['yukhap', 'samhap', 'banghap'].includes(m.r)), bad = months.filter((m) => ['chung', 'hyeong', 'hae', 'wonjin', 'pa', 'selfhyeong'].includes(m.r));
  const mName = (m) => `${SIGNS27[slugs[m.mo.branch]].kanji}月（${md(m.mo.start)}〜${md(m.mo.end)}）`;
  const others = slugs.map((_, i) => i).filter((i) => i !== b);
  const withRel = (key) => others.filter((i) => relations(b, i).includes(key));
  const link = (i) => `<a href="${rel}${sUrl(i).slice(1)}">${SIGNS27[slugs[i]].ja}</a>`;
  const allyRow = (label, key, note) => { const list = withRel(key); return list.length ? `<li><b>${label}</b>：${list.map(link).join('・')}（2027年 ${list.map((i) => S27[i] + '点').join('・')}）。${note}</li>` : ''; };
  const years = yearsOf(b).filter((y) => y <= 2027);
  const relWords = rels.length ? listJa(rels.map((r) => REL_JA[r].label)) : '特別な関係なし';
  const faq = [
    [`2027年の${S.ja}の運勢は何点ですか？`, `100点満点で${score}点、「${g.label}」です。${S.ja}の支（${han(b)}）と年の支・未との関係（${relWords}）、そして${EL_JA[d.el]}の気が丁火・未土の年とどう出会うかで採点しています${d.samjae ? '。三災の最終年にあたる分も含みます' : ''}。韓国語版・英語版と同じ数字です。`],
    [`${S.ja}にとって2027年の良い月と注意する月は？`, `${good.length ? `流れがなめらかなのは${listJa(good.map(mName))}。` : '合を作る月がなく、一年を通して波の少ない年です。'}${bad.length ? `注意したいのは${listJa(bad.map(mName))}。` : '冲・刑・害の月はありません。'}月の境は節入り（節気）の時刻で、1日ではありません。`]
  ].concat(S.faq.map((f) => [f.q, f.a]));
  const title = `2027年 ${S.ja}の運勢 — 丁未年 ${score}点`;
  const desc = `2027年（丁未・ひのとひつじ）の${S.ja}生まれの運勢。${REL_JA[d.rel].short}、総合${score}点「${g.label}」。恋愛・金運・仕事・健康、良い月と注意する月、相性のよい干支まで。`;
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}ja/2027/" style="color: inherit; text-decoration: none;">2027年の運勢</a> · ${S.ja}</div>
    <h1 class="ga-title">2027年 ${S.ja}の運勢 — <br>${esc(g.label)}</h1>
    <div class="zd-hero">
      <div class="zd-over">2027 · 丁未 · ひのとひつじ</div>
      <div class="zd-han">${han(b)} · 未</div>
      <div class="zd-score">${score}<span>／100</span></div>
      <div class="zd-sub">${g.label}</div>
      <div class="zd-bar"><i style="width: ${score}%"></i></div>
      <div class="zd-badges">${rels.length ? rels.map((r) => `<span class="zd-badge ${REL_JA[r].tone}">${REL_JA[r].label}</span>`).join('') : '<span class="zd-badge">特別な関係なし</span>'}${d.samjae ? '<span class="zd-badge bad">三災 — 最終年</span>' : ''}</div>
    </div>
    <p class="ga-lead">${esc(S.rel)}</p>
    <div class="ga-body">
      <h2>2027年のポイント</h2>
      <ul class="zd-list">
        <li><b>総合</b> ${score}点 — ${g.label}</li>
        <li><b>未との関係</b> ${relWords}</li>
        ${d.samjae ? '<li><b>三災</b> 2025〜2027年の三災の最終年（出て行く年）</li>' : ''}
        <li><b>流れの良い月</b> ${good.length ? esc(listJa(good.map(mName))) : '目立つ月はなく、平らな一年'}</li>
        <li><b>注意する月</b> ${bad.length ? esc(listJa(bad.map(mName))) : '冲・刑の月なし'}</li>
        <li><b>生まれ年</b> ${years.join('・')}年</li>
      </ul>
      <h2>総合運</h2>
      ${S.overall.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
      ${d.samjae ? '<p class="callout"><b>三災について。</b>亥・卯・未の三合グループは2025年から三災に入り、2027年が最後の年（날삼재＝出て行く三災）です。仕上げと整理に向く年とされ、2028年の立春で明けます。</p>' : ''}
      <h2>恋愛運</h2>
      <p>${esc(S.love)}</p>
      <h2>金運</h2>
      <p>${esc(S.money)}</p>
      <h2>仕事運・学業</h2>
      <p>${esc(S.work)}</p>
      <h2>健康運</h2>
      <p>${esc(S.health)}</p>
      <h2>月別の流れ</h2>
      <p>ここでいう月は四柱推命の節月です。各月は節入り（二十四節気の「節」）から始まり、月の支で名づけます。</p>
      <div class="zd-wrap"><table class="zd-table"><tr><th>期間</th><th>月柱</th><th>${S.ja}との関係</th></tr>${months.map((m) => `<tr${['yukhap', 'samhap', 'banghap'].includes(m.r) ? ' class="cur"' : ''}><td>${md(m.mo.start)}〜${md(m.mo.end)}<br><small>${m.mo.term}から</small></td><td>${M.STEMS[m.mo.stem].han}${han(m.mo.branch)}</td><td class="${REL_JA[m.r].tone === 'good' ? 'good' : REL_JA[m.r].tone === 'bad' ? 'bad' : ''}">${REL_JA[m.r].label}</td></tr>`).join('')}</table></div>
      <h2>相性のよい干支</h2>
      <p>自分の支と合を作る干支は、2027年の計画を一緒に進める相手として頼りになります。</p>
      <ul class="zd-list">
        ${[allyRow('支合（六合）', 'yukhap', '十二支の中でもっとも近い一対一の縁とされます。'), allyRow('三合', 'samhap', '同じ方向を向く三つの支で、互いの力を増やし合います。'), allyRow('冲（向かい合う支）', 'chung', '刺激は強く摩擦も多い相手。役割を先に決めると噛み合います。')].filter(Boolean).join('\n        ')}
      </ul>
      <h2>生まれ年と2027年の年齢</h2>
      <p>年の境は立春（2027年は2月4日 ${String(IP27.hh).padStart(2, '0')}:${String(IP27.mm).padStart(2, '0')}）です。1月1日から立春前に生まれた方は前の年の干支になります。</p>
      <ul class="zd-list">${years.map((y) => `<li><b>${y}年</b>生まれ — 2027年に${2027 - y === 0 ? '誕生' : `${2027 - y}歳`}</li>`).join('')}</ul>
      <h2>2027年にすること・避けること</h2>
      <ul class="zd-list">${S.do.map((t) => `<li><b>する</b> — ${esc(t)}</li>`).join('')}${S.dont.map((t) => `<li><b>避ける</b> — ${esc(t)}</li>`).join('')}</ul>
      <h2>よくある質問</h2>
      ${faq.map(([q, a], i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div class="ih-body"><p>${esc(a)}</p></div></details>`).join('\n      ')}
      <p class="callout"><a href="${rel}ja/2027/">十二支すべての2027年</a> · <a href="${rel}ja/">生年月日で命式を見る</a> · <a href="${rel}en/2027/${d.slug}/" hreflang="en">English</a> · <a href="${rel}2027/ddi/${d.slug}/" hreflang="ko">한국어</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}ja/"><span class="seal-dot" aria-hidden="true"></span><span>干支ではなく、生年月日の命式で2027年を見る</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">干支は生まれ年の一文字です。生年月日を入れると日干・日支まで反映した命式が出ます。</p>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'ja', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `2027年 ${S.ja}の運勢 — ${score}点`, extraHead: STYLE + alt(url, `/en/2027/${d.slug}/`, `/2027/ddi/${d.slug}/`),
    jsonld: [crumbs([['2027年の運勢', '/ja/2027/'], [S.ja, url]]), article(url, title, desc), faqLd(faq)], body }));
  return { title, desc };
}

/* ---------- hub ---------- */
function hub() {
  const url = '/ja/2027/', rel = '../../';
  const order = slugs.map((_, b) => b).sort((x, y) => S27[y] - S27[x] || x - y);
  const cells = slugs.map((s, b) => `<a href="${rel}${sUrl(b).slice(1)}"><b>${han(b)}</b><span>${SIGNS27[s].ja}</span><small><i>${S27[b]}</i>点 · ${REL_JA[DDI[b].rel].label}</small></a>`).join('');
  const faq = [
    ['2027年は何年ですか？', '2027年は丁未（ひのとひつじ）の年です。十干は丁（火の陰）、十二支は未（土）。火が土を生む「相生」の組み合わせで、日本の四柱推命でも韓国のサジュでも同じ干支暦を使います。'],
    ['2027年の運勢はいつから変わりますか？', `四柱推命では年の境を1月1日ではなく立春に置きます。2027年の立春は2月4日 ${String(IP27.hh).padStart(2, '0')}:${String(IP27.mm).padStart(2, '0')}（日本時間・韓国時間は同じUTC+9）。それ以前に生まれた2027年生まれは丙午年の午年です。`],
    ['点数はどう決めていますか？', '基準を78点とし、自分の支と未との関係（支合・三合・方合は加点、冲・刑・害・破は減点）、支の五行が丁火・未土の年とどう出会うか、三災の該当を加味して60〜95点に収めています。韓国語版・英語版と同じ計算です。'],
    ['干支の運勢と命式の運勢はどう違いますか？', '干支の運勢は生まれ年の一文字（年支）だけで見る略式です。生年月日で命式を立てると、自分を表す日干や日支・月支との関係まで反映されるので、同じ年でも人によって流れが変わります。']
  ];
  const title = YEAR_INTRO.title || '2027年 丁未年の運勢 — 十二支別';
  const desc = '2027年（丁未・ひのとひつじ）の運勢を十二支別に。未との支合・三合・冲などの関係で採点した総合点、恋愛・金運・仕事・健康、良い月と注意する月。立春で年が変わる韓国式四柱推命の読み方です。';
  const body = `
  <article class="guide-article">
    <div class="ga-overline">2027年の運勢</div>
    <h1 class="ga-title">${esc(title)}</h1>
    <p class="ga-lead">${esc(YEAR_INTRO.lead[0])}</p>
    <div class="zd-grid">${cells}</div>
    <div class="ga-body">
      <p>${esc(YEAR_INTRO.lead[1])}</p>
      <h2>年の境は立春</h2>
      <p>${esc(YEAR_INTRO.howCounted)}</p>
      <h2>十二支ランキング</h2>
      <div class="zd-wrap"><table class="zd-table"><tr><th>干支</th><th>点数</th><th>未との関係</th></tr>${order.map((b) => { const g = grade27(S27[b]); return `<tr><td><a href="${rel}${sUrl(b).slice(1)}">${SIGNS27[slugs[b]].ja}</a> <small>${han(b)}</small></td><td class="${g.tone === 'good' ? 'good' : g.tone === 'warn' ? 'bad' : ''}">${S27[b]}</td><td>${g.label}<br><small>${REL_JA[DDI[b].rel].label}${DDI[b].samjae ? ' · 三災明け' : ''}</small></td></tr>`; }).join('')}</table></div>
      <p>点数は、各支と未との関係（合は加点、冲・刑・害は減点）に、支の五行が年の火と土とどう出会うかを加えたものです。<a href="${rel}2027/" hreflang="ko">韓国語版</a>・<a href="${rel}en/2027/" hreflang="en">英語版</a>と同じ数字です。</p>
      <h2>よくある質問</h2>
      ${faq.map(([q, a], i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div class="ih-body"><p>${esc(a)}</p></div></details>`).join('\n      ')}
      <p class="callout"><a href="${rel}ja/">四柱推命 命式計算（無料）</a> · <a href="${rel}en/2027/" hreflang="en">English</a> · <a href="${rel}2027/" hreflang="ko">한국어</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}ja/"><span class="seal-dot" aria-hidden="true"></span><span>生年月日で命式を見る</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'ja', title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: '2027年 丁未年の運勢 — 十二支別', extraHead: STYLE + alt(url, '/en/2027/', '/2027/'),
    jsonld: [crumbs([['2027年の運勢', url]]), article(url, title, desc), faqLd(faq)], body }));
  return { title, desc };
}

const out = [];
slugs.forEach((_, b) => out.push(signPage(b)));
out.push(hub());
fs.writeFileSync(path.join(DOCS, 'sitemap-ja.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u}</loc><lastmod>${MODIFIED}</lastmod><changefreq>monthly</changefreq><priority>${u.endsWith('/ja/') ? '0.9' : '0.8'}</priority></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-ja.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-ja.xml\n');
const longT = out.filter((o) => o.title.length > 60).length, longD = out.filter((o) => o.desc.length > 120).length;
console.log(`ja: ${urls.length} URLs in sitemap-ja.xml; scores ${slugs.map((s, b) => `${SIGNS27[s].kanji}${S27[b]}`).join(' ')}; titles>60: ${longT}, descs>120: ${longD}`);
