/* 정적 문서 페이지 공용 셸 — 서재(guide) 문서와 같은 .app.doc 스타일을 쓴다.
 * 경로 깊이에 맞춰 상대 경로(rel)를 넘긴다: 'docs/day/2026-09-04/' 이면 rel = '../../' */
/* 구글에만 검색 제외할 주소(tools/google-noindex.json, 2026-10-08 스팸 업데이트 뒤 정리) — googlebot noindex, follow. 네이버·빙은 그대로 색인 */
const GOOGLE_NOINDEX = (() => {
  try {
    const j = JSON.parse(fs.readFileSync(new URL('./google-noindex.json', import.meta.url), 'utf8'));
    const s = new Set();
    for (const [p, xs] of Object.entries(j.groups)) for (const x of xs) s.add(p + x + '/');
    return s;
  } catch (e) { return new Set(); }
})();
export const isGoogleNoindex = (urlPath) => GOOGLE_NOINDEX.has(urlPath);

/* 운영자 표기 — 소개(/about/)·계산 방법(/about/method/) 페이지와 구조화 데이터(Organization)에 쓴다.
 * 실명이나 단체명을 쓰려면 이 한 줄만 바꾸고 build-about.mjs 를 다시 돌리면 된다. 사람 이름·경력은 지어 넣지 않는다. */
export const SITE_OPERATOR = '사주첩 운영자';
export const SITE_CONTACT_URL = 'https://www.instagram.com/sajucheop/';
/* 계산 방법 페이지를 마지막으로 점검한 날 — 본문·구조화 데이터·사이트맵 lastmod 가 같은 값을 쓴다. 내용이 실제로 바뀐 날만 고친다 */
export const METHOD_REVIEWED = '2026-11-02';

export const GA = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-JCDJSNZX4J"></script>
  <script>if(location.hostname.indexOf('localhost')<0&&location.hostname.indexOf('127.0.0.1')<0&&location.protocol!=='file:'&&!navigator.webdriver&&!/bot|crawl|spider|slurp|yeti|daumoa|bingpreview|headless|lighthouse|scrap|facebookexternalhit|compatible;|mediapartners|adsbot/i.test(navigator.userAgent)){window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-JCDJSNZX4J');}</script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9924140539322407" crossorigin="anonymous"></script>`;

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function brandSvg() {
  return `<svg width="26" height="26" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <rect x="1.5" y="1.5" width="27" height="27" rx="5" fill="#B8382D"></rect>
        <text x="15" y="13.5" text-anchor="middle" font-family="'Noto Serif KR', serif" font-size="10" font-weight="600" fill="#F6F1E8">四</text>
        <text x="15" y="25" text-anchor="middle" font-family="'Noto Serif KR', serif" font-size="10" font-weight="600" fill="#F6F1E8">柱</text>
      </svg>`;
}

/* 공유 카드 — docs/og/<키>.jpg (tools/og.mjs 가 그림). o.og 키가 있고 그림이 있으면 그것, 없으면 주소 앞부분으로 구역 그림, 그것도 없으면 og-image.png */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const OG_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'og');
const OG_FILES = new Set(fs.existsSync(OG_DIR) ? fs.readdirSync(OG_DIR).filter((f) => f.endsWith('.jpg')).map((f) => f.slice(0, -4)) : []);
const OG_BY_PATH = [['/2027/ilju/', '2027-ilju'], ['/2027/', '2027'], ['/wolun/', 'wolun'], ['/ddi-gunghap/', 'ddi-gunghap'], ['/gunghap/', 'gunghap'], ['/today/ddi/', 'today-ddi'], ['/tomorrow/ddi/', 'today-ddi'],
  ['/ilju/', 'ilju'], ['/naming/hanja/', 'hanja'], ['/naming/', 'naming'], ['/guide/', 'guide'], ['/jeolgi/', 'jeolgi'], ['/day/', 'day'], ['/son/', 'son'], ['/tojeong/', 'tojeong'], ['/samjae/', 'samjae'], ['/manse/', 'manse'], ['/lunar/', 'lunar'], ['/test/', 'test'],
  ['/en/zodiac/compatibility/', 'en-compat'], ['/en/zodiac/', 'en-zodiac'], ['/en/2027/day-pillar/', 'en-pillars'], ['/en/2027/', 'en-2027'], ['/en/monthly/', 'en-monthly'], ['/en/day/', 'en-day'], ['/en/korean-name/', 'en-name'], ['/en/guide/', 'en-guide'], ['/en/day-pillar/', 'en-pillars'], ['/en/bazi/', 'en-bazi'], ['/ja/', 'ja']];
export function ogImage(o) {
  const foreign = o.lang === 'en' || o.lang === 'ja';
  if (o.og && OG_FILES.has(o.og)) return `/og/${o.og}.jpg`;
  const p = (o.canonical || '').replace(/^https?:\/\/[^/]+/, '');
  const hit = OG_BY_PATH.find(([prefix]) => p.startsWith(prefix));
  if (hit && OG_FILES.has(hit[1])) return `/og/${hit[1]}.jpg`;
  return foreign ? '/og-image-en.png' : '/og-image.png';
}

/* o: { rel, title, desc, canonical, jsonld (object|array), nav: [{href,label}], body, lang, extraHead, noindex, og } */
export function shell(o) {
  const lang = o.lang || 'ko';
  const foreign = lang === 'en' || lang === 'ja';
  const brand = foreign ? 'Sajucheop' : '사주첩';
  const nav = (o.nav || []).concat(foreign ? [] : [{ href: 'http://saengil.sajucheop.com/', label: '생일 사전' }, { href: 'https://dream.sajucheop.com/', label: '꿈해몽' }, { href: 'https://tarot.sajucheop.com/', label: '타로' }]).map((n) => `<a href="${esc(n.href)}">${n.label}</a>`).join('\n      ');
  const ogUrl = 'https://sajucheop.com' + ogImage(o);
  const withImage = (x) => (x && x['@type'] === 'Article' && !x.image ? { ...x, image: [ogUrl] } : x);
  const ldData = o.jsonld ? (Array.isArray(o.jsonld) ? o.jsonld.map(withImage) : withImage(o.jsonld)) : null;
  const ld = ldData ? `<script type="application/ld+json">${JSON.stringify(ldData)}</script>` : '';
  /* 3) 본문 안 1200px 그림 — 구글 디스커버는 페이지 안의 큰 이미지를 쓴다. 그 페이지(구역)만의 카드가 있을 때만, 검색에서 뺀 페이지는 넣지 않는다 */
  const card = !o.noindex && ogImage(o).startsWith('/og/') ? ogImage(o) : '';
  const cardNote = lang === 'en' ? 'This card shows when you share the page' : lang === 'ja' ? 'このページを共有するとこのカードが表示されます' : '이 페이지를 공유하면 이 그림이 함께 보여요';
  const shareCard = card ? `\n  <figure class="share-card"><img src="${card}" width="1200" height="630" loading="lazy" decoding="async" alt="${esc(o.ogTitle || o.title)}"><figcaption>${cardNote}</figcaption></figure>\n` : '';
  const footerLinks = lang === 'en'
    ? `<a href="${o.rel}en/">Chart</a><a href="${o.rel}en/guide/">Library</a><a href="${o.rel}en/about/">About</a><a href="${o.rel}en/privacy/">Privacy</a><a href="${o.rel}en/terms/">Terms</a>`
    : lang === 'ja'
      ? `<a href="${o.rel}ja/">命式計算</a><a href="${o.rel}ja/2027/">2027年の運勢</a><a href="${o.rel}en/about/">About（英語）</a><a href="${o.rel}en/privacy/">Privacy</a><a href="${o.rel}en/terms/">Terms</a><a href="${o.rel}en/">English</a><a href="${o.rel}">한국어</a>`
      : `<a href="${o.rel}guide/">서재</a><a href="${o.rel}about/">소개</a><a href="${o.rel}about/method/">계산 방법</a><a href="${o.rel}terms.html">이용약관</a><a href="${o.rel}privacy.html">개인정보</a><a href="http://saengil.sajucheop.com/">생일 사전</a><a href="https://dream.sajucheop.com/">꿈해몽</a><a href="https://tarot.sajucheop.com/">타로</a>${o.footerExtra || ''}`; /* 주제가 다른 돈표·바디집은 소개 페이지에만(footerExtra, 2026-10-24: 사이트 전체 상호 링크가 링크 묶음으로 읽히지 않게). 계산 방법 링크는 2026-11-02 */
  const footerNote = o.footerNote || (lang === 'en'
    ? 'For reflection and entertainment. Important decisions are always yours to make.'
    : lang === 'ja'
      ? '本コンテンツは伝統的な命理学に基づく参考情報です。大切な決断はご自身で。'
      : '본 콘텐츠는 전통 명리학 이론을 바탕으로 한 참고용입니다.');
  const jaFonts = lang === 'ja'
    ? `\n  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;600;700&display=swap">`
    : '';
  const jaStyle = lang === 'ja' ? `\n  <style>:root{--serif:'Noto Serif JP','Noto Serif KR',serif;--sans:'Noto Sans JP','Noto Sans KR',sans-serif}</style>` : '';
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  ${GA}
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(o.title)}</title>
  <meta name="description" content="${esc(o.desc)}">
  <link rel="canonical" href="${esc(o.canonical)}">
  ${o.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="max-image-preview:large">'}${!o.noindex && GOOGLE_NOINDEX.has(String(o.canonical || '').replace(/^https?:\/\/[^/]+/, '')) ? '\n  <meta name="googlebot" content="noindex, follow">' : ''}
  <link rel="icon" type="image/svg+xml" href="${o.rel}favicon.svg">
  <link rel="manifest" href="${lang === 'en' ? '/en/manifest.webmanifest' : lang === 'ja' ? '/ja/manifest.webmanifest' : '/manifest.webmanifest'}">
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
  <meta name="theme-color" content="#F6F1E8">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="${lang === 'en' ? 'Sajucheop' : lang === 'ja' ? '四柱推命' : '사주첩'}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+KR:wght@400;600;700&display=swap">${jaFonts}
  <link rel="stylesheet" href="${o.rel}css/style.css">${jaStyle}
  ${ld}
  <meta property="og:title" content="${esc(o.ogTitle || o.title)}">
  <meta property="og:description" content="${esc(o.desc)}">
  <meta property="og:image" content="https://sajucheop.com${ogImage(o)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  ${lang === 'en' ? '<meta property="og:locale" content="en_US">' : lang === 'ja' ? '<meta property="og:locale" content="ja_JP">' : ''}
  <meta name="twitter:card" content="summary_large_image">
  ${o.extraHead || ''}
</head>
<body>
<div class="app doc">

  <header class="doc-header">
    <a class="brand" href="${o.rel}${lang === 'en' ? 'en/' : lang === 'ja' ? 'ja/' : ''}">
      ${brandSvg()}
      <span class="brand-name" style="font-size: 16px;">${brand}</span>
    </a>
    <nav class="doc-nav">
      ${nav}
    </nav>
  </header>

${o.body}
${shareCard}
  <footer class="site-footer" style="margin-top: 30px;">
    <div class="footer-row">
      <span class="copy">© ${brand}</span>
      <nav class="footer-links">
        ${footerLinks}
      </nav>
    </div>
    <p class="footer-note">${footerNote}</p>
  </footer>
<script src="/js/pwa.js" defer></script>

</div>
</body>
</html>
`;
}

/* 고르기 상자 — 조합형 페이지(궁합 짝, 2027 출생연도·일주…)로 가는 길을 링크 수십 개 대신 <select> 로 낸다(2026-11-02).
 * 허브에서 구글 제외 페이지로 가는 링크 묶음을 줄이되 네이버 이용자는 그대로 갈 수 있게. 자바스크립트가 없으면 안내문(o.fallback)만 보인다.
 * o: { id, title, note, selects: [{ name, label, options: [[value, label]] }], go: 'JS 식 — v.name 으로 값을 읽어 상대 주소 문자열을 돌려준다', button, fallback } */
export function picker(o) {
  const sel = (s) => `<label>${esc(s.label)}<select name="${esc(s.name)}">${s.options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select></label>`;
  return `<form class="pick" id="${esc(o.id)}" action="." onsubmit="return false;">
        ${o.title ? `<div class="pick-title">${o.title}</div>` : ''}
        <div class="pick-row">${o.selects.map(sel).join('\n          ')}<button type="submit">${esc(o.button || '보기')}</button></div>
        ${o.note ? `<p class="pick-note">${o.note}</p>` : ''}
        ${o.fallback ? `<noscript><p class="pick-note">${o.fallback}</p></noscript>` : ''}
      </form>
      <script>(function(){var f=document.getElementById(${JSON.stringify(o.id)});if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var v={};for(var i=0;i<f.elements.length;i++){var el=f.elements[i];if(el.name)v[el.name]=el.value;}var to=(function(v){return ${o.go};})(v);if(to)location.href=to;});})();</script>`;
}
export const PICKER_STYLE = `<style>
    .pick { margin: 10px 0 16px; padding: 14px 16px; background: #FFFDF9; border: 1px solid var(--line); border-radius: 12px; }
    .pick-title { font-weight: 700; font-size: 14px; margin-bottom: 8px; }
    .pick-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
    .pick-row label { flex: 1 1 140px; font-size: 12px; font-weight: 700; color: var(--muted); }
    .pick-row select { display: block; width: 100%; margin-top: 5px; font: inherit; font-size: 15px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); }
    .pick-row button { flex: none; font: inherit; font-weight: 700; font-size: 14px; padding: 9px 18px; border: 0; border-radius: 8px; background: var(--seal); color: #F6F1E8; cursor: pointer; }
    .pick-note { font-size: 12.5px; color: var(--muted); margin: 8px 0 0; line-height: 1.55; }
  </style>`;

export function breadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url }))
  };
}
