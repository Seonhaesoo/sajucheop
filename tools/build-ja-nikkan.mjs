/* Japanese Day Master library — /ja/nikkan/ (hub) + /ja/nikkan/<slug>/ ×10; adds /ja/nikkan/* and /ja/match/ to sitemap-ja.xml.
 * Copy: tools/ja-daymaster-data.mjs (same keys as the English DAY_MASTERS). hreflang ja ↔ /en/guide/day-master/<slug>/ ↔ KO /guide/<koGuide>.html.
 * Usage: node tools/build-ja-nikkan.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { DAY_MASTERS_JA } from './ja-daymaster-data.mjs';

const { M } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-15', MODIFIED = '2026-09-15';
const KUN = ['きのえ', 'きのと', 'ひのえ', 'ひのと', 'つちのえ', 'つちのと', 'かのえ', 'かのと', 'みずのえ', 'みずのと'];
const EL_JA = { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' };
const NAV = (rel) => [{ href: rel + 'ja/', label: '命式計算' }, { href: rel + 'ja/match/', label: '相性' }, { href: rel + 'ja/2027/', label: '2027年の運勢' }, { href: rel + 'en/', label: 'English' }, { href: rel, label: '한국어' }];
if (DAY_MASTERS_JA.length !== 10) throw new Error('ja day masters: ' + DAY_MASTERS_JA.length);
DAY_MASTERS_JA.forEach((d, i) => { if (d.han !== M.STEMS[i].han) throw new Error('order: ' + d.slug); if (!(d.who && d.strengths.length && d.cautions.length && d.love && d.work && d.combine && d.strong && d.balanced && d.weak)) throw new Error('incomplete: ' + d.slug); });

const STYLE = `<style>
    .dm-han { font-family: var(--serif); font-size: 64px; font-weight: 700; line-height: 1; color: var(--seal); margin: 6px 0 4px; }
    .dm-meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 4px; }
    .dm-meta span { font-size: 12px; padding: 4px 10px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); }
    .dm-list { padding-left: 18px; line-height: 1.75; } .dm-list li + li { margin-top: 6px; }
    .dm-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 10px; }
    .dm-grid a { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--line-soft); border-radius: 10px; background: #fff; text-decoration: none; color: var(--ink); }
    .dm-grid a.cur { background: var(--ink); color: #F6F1E8; border-color: var(--ink); }
    .dm-grid i { font-style: normal; font-family: var(--serif); font-size: 24px; color: var(--seal); } .dm-grid a.cur i { color: #E8B04A; }
    .dm-grid b { display: block; font-size: 13.5px; } .dm-grid small { display: block; font-size: 11.5px; color: var(--faint); } .dm-grid a.cur small { color: #B7AD9C; }
    @media (max-width: 480px) { .dm-grid { grid-template-columns: 1fr 1fr; } .dm-han { font-size: 52px; } }
  </style>`;

const urls = [];
const dmUrl = (d) => `/ja/nikkan/${d.slug}/`;
function write(url, html) { const file = path.join(DOCS, url.slice(1), 'index.html'); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, html); urls.push(SITE + url); }
const article = (url, title, desc) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, image: SITE + '/og-image-en.png', datePublished: PUBLISHED, dateModified: MODIFIED, inLanguage: 'ja', author: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/en/about/' }, publisher: { '@type': 'Organization', name: 'Sajucheop', url: SITE + '/ja/' }, mainEntityOfPage: SITE + url });
const alt = (ja, en, ko) => `\n  <link rel="alternate" hreflang="ja" href="${SITE}${ja}">\n  <link rel="alternate" hreflang="en" href="${SITE}${en}">` + (ko ? `\n  <link rel="alternate" hreflang="ko" href="${SITE}${ko}">` : '');
const byName = (name) => DAY_MASTERS_JA.find((x) => x.name === name || x.arch === name || x.han === name) || null;

DAY_MASTERS_JA.forEach((d, i) => {
  const url = dmUrl(d), rel = '../../../';
  const prev = DAY_MASTERS_JA[(i + 9) % 10], next = DAY_MASTERS_JA[(i + 1) % 10];
  const st = M.STEMS[i];
  const title = `${st.han}（${KUN[i]}）の日干 — ${d.arch}の性格・恋愛・仕事 | 四柱推命`;
  const short = `${st.han}（${KUN[i]}）の日干 — ${d.arch} | 四柱推命`;
  const desc = `日干が${st.han}（${KUN[i]}・${st.yang ? '陽' : '陰'}の${EL_JA[st.el]}）の人の性格を「${d.arch}」の像で読む。強み、気をつけたいこと、恋愛、仕事、干合と冲の相手、身強・身弱での違いまで。`;
  const combineTarget = byName(d.combine.with), clashTarget = d.clash ? byName(d.clash.with) : null;
  const others = DAY_MASTERS_JA.map((x, k) => `<a href="${rel}${dmUrl(x).slice(1)}"${x === d ? ' class="cur"' : ''}><i>${x.han}</i><span><b>${esc(x.arch)}</b><small>${esc(x.name)}</small></span></a>`).join('');
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}ja/nikkan/" style="color: inherit; text-decoration: none;">日干の事典</a> · ${i + 1} / 10</div>
    <div class="dm-han">${st.han}</div>
    <h1 class="ga-title">${esc(d.name)} — <br>${esc(d.arch)}</h1>
    <div class="dm-meta">${d.keywords.map((k) => `<span>${esc(k)}</span>`).join('')}</div>
    <p class="ga-meta">サジュチョプ · ${esc(d.tagline)}</p>
    <p class="ga-lead">${esc(d.essence)}</p>
    <div class="ga-body">
      <h2>あなたという人</h2>
      <p>${esc(d.who)}</p>
      <h2>強み</h2>
      <ul class="dm-list">${d.strengths.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <h2>気をつけたいこと</h2>
      <ul class="dm-list">${d.cautions.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <h2>恋愛</h2>
      <p>${esc(d.love)}</p>
      <h2>仕事</h2>
      <p>${esc(d.work)}</p>
      <h2>相性 — 干合する相手、冲する相手</h2>
      <p><b>干合：${combineTarget ? `<a href="${rel}${dmUrl(combineTarget).slice(1)}">${esc(d.combine.with)} — ${esc(d.combine.arch)}</a>` : esc(d.combine.with + ' — ' + d.combine.arch)}。</b> ${esc(d.combine.line)}</p>
      ${d.clash ? `<p><b>冲：${clashTarget ? `<a href="${rel}${dmUrl(clashTarget).slice(1)}">${esc(d.clash.with)} — ${esc(d.clash.arch)}</a>` : esc(d.clash.with + ' — ' + d.clash.arch)}。</b> ${esc(d.clash.line)}</p>` : '<p>戊・己の土の日干には天干の冲がなく、間に立って和らげる役回りになります。</p>'}
      <p>日干どうしの相性は入口にすぎません。二人の生年月日を入れると、<a href="${rel}ja/match/">相性診断</a>が通変星（互いにとって何にあたるか）と五行の補い合いまで読みます。</p>
      <h2>身強・中和・身弱</h2>
      <p>同じ日干でも、ほかの七文字にどれだけ支えられているかで読み方が変わります。</p>
      <ul class="dm-list">
        <li><b>身強</b> — ${esc(d.strong)}</li>
        <li><b>中和</b> — ${esc(d.balanced)}</li>
        <li><b>身弱</b> — ${esc(d.weak)}</li>
      </ul>
      <h2>ほかの九つの日干</h2>
      <div class="dm-grid">${others}</div>
      <p class="callout">← <a href="${rel}${dmUrl(prev).slice(1)}">${esc(prev.arch)}</a> · <a href="${rel}${dmUrl(next).slice(1)}">${esc(next.arch)}</a> → · <a href="${rel}en/guide/day-master/${d.slug}/" hreflang="en">English</a> · <a href="${rel}guide/${d.koGuide}.html" hreflang="ko">한국어</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}ja/"><span class="seal-dot" aria-hidden="true"></span><span>自分の日干を調べる</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">生年月日を入れるだけ。韓国式の精密な干支暦で計算し、登録も保存もありません。</p>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'ja', title: title.length > 60 ? short : title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `${st.han}（${KUN[i]}）の日干 — ${d.arch}`, extraHead: STYLE + alt(url, `/en/guide/day-master/${d.slug}/`, `/guide/${d.koGuide}.html`),
    jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/ja/' }, { name: '日干の事典', url: SITE + '/ja/nikkan/' }, { name: d.name, url: SITE + url }]), article(url, title, desc)], body }));
});

/* hub */
{
  const url = '/ja/nikkan/', rel = '../../';
  const title = '日干（にっかん）事典 — 十干それぞれの性格と相性 | 四柱推命';
  const desc = '四柱推命の日干（日柱の天干）十種を、大樹・草花・太陽・灯火・山岳・田園・鉄剣・宝石・大海・雨露の像で読む事典。性格、恋愛、仕事、干合と冲の相手、身強・身弱の違いまで。';
  const grid = DAY_MASTERS_JA.map((d, i) => `<a href="${rel}${dmUrl(d).slice(1)}"><i>${d.han}</i><span><b>${esc(d.arch)}</b><small>${esc(d.name)}</small></span></a>`).join('');
  const faq = [
    ['日干とは何ですか？', '生まれた日の天干（十干のひとつ）で、命式の中で「自分」を表す文字です。ほかの七文字は日干との関係（通変星）で読みます。生年月日だけで決まり、出生時刻は不要です。'],
    ['自分の日干はどう調べますか？', '命式計算に生年月日を入れると、日柱の上の文字が日干です。年の境は立春、月の境は節入り、日の境は午前0時で計算しています。'],
    ['日本の四柱推命と韓国のサジュで日干は変わりますか？', '変わりません。同じ干支暦を使うので命式は一致します。違うのは解釈の流派と用語（日主／日干、十神／通変星）だけです。']
  ];
  const body = `
  <article class="guide-article">
    <div class="ga-overline">四柱推命 · 日干</div>
    <h1 class="ga-title">日干の事典</h1>
    <p class="ga-lead">十干のどれが日干かで、命式の読み方は根本から変わります。十の日干を古典の像——大樹から雨露まで——で一つずつ。</p>
    <div class="dm-grid">${grid}</div>
    <div class="ga-body">
      <h2>読み方</h2>
      <p>日干はまず陰陽と五行で分かれます。陽の干（甲・丙・戊・庚・壬）は外へ向かう力、陰の干（乙・丁・己・辛・癸）は内へ向かう細やかさ。像はその性質を一枚の絵にしたものです。各ページでは強み・注意点・恋愛・仕事のほか、干合（甲己・乙庚・丙辛・丁壬・戊癸）と冲の相手、身強・身弱での違いを読みます。</p>
      <h2>よくある質問</h2>
      ${faq.map(([q, a], i) => `<details class="ics-help"${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div class="ih-body"><p>${esc(a)}</p></div></details>`).join('\n      ')}
      <p class="callout"><a href="${rel}ja/">命式計算</a> · <a href="${rel}ja/match/">相性診断</a> · <a href="${rel}ja/2027/">2027年の運勢</a> · <a href="${rel}en/guide/day-master/" hreflang="en">English</a> · <a href="${rel}guide/ilgan.html" hreflang="ko">한국어</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}ja/"><span class="seal-dot" aria-hidden="true"></span><span>自分の日干を調べる</span></a>
    </div>
  </article>`;
  write(url, shell({ rel, lang: 'ja', title: title.length > 60 ? '日干（にっかん）事典 — 十干の性格と相性 | 四柱推命' : title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: '日干の事典 — 四柱推命', extraHead: STYLE + alt(url, '/en/guide/day-master/', '/guide/ilgan.html'),
    jsonld: [breadcrumb([{ name: 'Sajucheop', url: SITE + '/ja/' }, { name: '日干の事典', url: SITE + url }]), article(url, title, desc), { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }], body }));
}

/* sitemap-ja.xml: add these (and /ja/match/ when it exists) without disturbing the zodiac builder's entries */
const smPath = path.join(DOCS, 'sitemap-ja.xml');
let sm = fs.readFileSync(smPath, 'utf8');
const extra = urls.concat(fs.existsSync(path.join(DOCS, 'ja', 'match', 'index.html')) ? [SITE + '/ja/match/'] : []);
for (const u of extra) if (!sm.includes(`<loc>${u}</loc>`)) sm = sm.replace('</urlset>', `  <url><loc>${u}</loc><lastmod>${MODIFIED}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
fs.writeFileSync(smPath, sm);
console.log(`ja nikkan — 10 pages + hub; sitemap-ja.xml now ${(sm.match(/<loc>/g) || []).length} URLs`);
