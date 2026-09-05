/* 정적 문서 페이지 공용 셸 — 서재(guide) 문서와 같은 .app.doc 스타일을 쓴다.
 * 경로 깊이에 맞춰 상대 경로(rel)를 넘긴다: 'docs/day/2026-09-04/' 이면 rel = '../../' */

export const GA = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-JCDJSNZX4J"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-JCDJSNZX4J');</script>
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

/* o: { rel, title, desc, canonical, jsonld (object|array), nav: [{href,label}], body, lang, extraHead, noindex } */
export function shell(o) {
  const lang = o.lang || 'ko';
  const brand = lang === 'en' ? 'Sajucheop' : '사주첩';
  const nav = (o.nav || []).concat(lang === 'en' ? [] : [{ href: 'http://saengil.sajucheop.com/', label: '생일첩' }, { href: 'https://dream.sajucheop.com/', label: '꿈첩' }]).map((n) => `<a href="${esc(n.href)}">${n.label}</a>`).join('\n      ');
  const ld = o.jsonld ? `<script type="application/ld+json">${JSON.stringify(o.jsonld)}</script>` : '';
  const footerLinks = lang === 'en'
    ? `<a href="${o.rel}en/">Chart</a><a href="${o.rel}terms.html">Terms</a><a href="${o.rel}privacy.html">Privacy</a>`
    : `<a href="${o.rel}guide/">서재</a><a href="${o.rel}terms.html">이용약관</a><a href="${o.rel}privacy.html">개인정보</a><a href="http://saengil.sajucheop.com/">생일첩</a><a href="https://dream.sajucheop.com/">꿈첩</a>`;
  const footerNote = o.footerNote || (lang === 'en'
    ? 'For reflection and entertainment. Important decisions are always yours to make.'
    : '본 콘텐츠는 전통 명리학 이론을 바탕으로 한 참고용입니다.');
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  ${GA}
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(o.title)}</title>
  <meta name="description" content="${esc(o.desc)}">
  <link rel="canonical" href="${esc(o.canonical)}">
  ${o.noindex ? '<meta name="robots" content="noindex, follow">' : ''}
  <link rel="icon" type="image/svg+xml" href="${o.rel}favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+KR:wght@400;600;700&display=swap">
  <link rel="stylesheet" href="${o.rel}css/style.css">
  ${ld}
  <meta property="og:title" content="${esc(o.ogTitle || o.title)}">
  <meta property="og:description" content="${esc(o.desc)}">
  <meta property="og:image" content="https://sajucheop.com/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  ${o.extraHead || ''}
</head>
<body>
<div class="app doc">

  <header class="doc-header">
    <a class="brand" href="${o.rel}${lang === 'en' ? 'en/' : ''}">
      ${brandSvg()}
      <span class="brand-name" style="font-size: 16px;">${brand}</span>
    </a>
    <nav class="doc-nav">
      ${nav}
    </nav>
  </header>

${o.body}

  <footer class="site-footer" style="margin-top: 30px;">
    <div class="footer-row">
      <span class="copy">© ${brand}</span>
      <nav class="footer-links">
        ${footerLinks}
      </nav>
    </div>
    <p class="footer-note">${footerNote}</p>
  </footer>

</div>
</body>
</html>
`;
}

export function breadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url }))
  };
}
