/* RSS 피드와 사이트맵 색인 — 네이버 서치어드바이저에 한 번 등록해 두면 그 뒤로는 네이버가 알아서 새 글을 가져간다.
 *  docs/rss.xml            한국어 페이지 가운데 날짜가 있는 글(Article 구조화 데이터) 최신 60개 — 오늘의 띠별 운세·이달의 운세·절기·2027·서재·이름 한자
 *  docs/sitemap-index.xml  robots.txt 에 적힌 사이트맵을 한 파일로 묶은 색인(네이버에는 이 주소 하나만 등록)
 * 검색에서 뺀(noindex) 페이지와 영문·일본어 페이지, 아직 오지 않은 날짜의 글은 넣지 않는다.
 * daily-story.yml 이 매일 다시 만든다. 사용: node tools/build-feeds.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { kstToday, ROOT_DIR } from './engine.mjs';

const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const today = kstToday();
const todayIso = `${today.y}-${String(today.m).padStart(2, '0')}-${String(today.d).padStart(2, '0')}`;
const LIMIT = 60;
const x = (s) => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const un = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

const items = [];
const walk = (d) => {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) { if (['en', 'ja', 'og', 'dev', 'social', 'daily', 'js', 'css', 'icons'].includes(f.name) && d === DOCS) continue; walk(p); continue; }
    if (!f.name.endsWith('.html')) continue;
    const h = fs.readFileSync(p, 'utf8');
    if (/<meta name="robots" content="[^"]*noindex/i.test(h)) continue;
    const canonical = (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1];
    const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1];
    if (!canonical || !title || !desc) continue;
    let date = null;
    for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        const j = JSON.parse(m[1]);
        for (const o of Array.isArray(j) ? j : [j]) if (o && o['@type'] === 'Article') date = (o.dateModified || o.datePublished || '').slice(0, 10) || date;
      } catch { /* 구조화 데이터가 깨진 페이지는 건너뜀 */ }
    }
    if (!date || date > todayIso) continue;
    items.push({ url: canonical, title: un(title), desc: un(desc), date });
  }
};
walk(DOCS);
/* 같은 날짜 안에서는 짧은 주소(허브)부터 */
items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.url.length - b.url.length));
const top = items.slice(0, LIMIT);
const rfc822 = (iso) => new Date(iso + 'T00:00:00+09:00').toUTCString();
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>사주첩 — 여덟 글자에 담긴 당신의 이야기</title>
  <link>${SITE}/</link>
  <description>오늘의 띠별 운세, 이달의 운세, 2027 신년운세, 절기와 사주 이야기 — 사주첩의 새 글</description>
  <language>ko</language>
  <lastBuildDate>${rfc822(todayIso)}</lastBuildDate>
  <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${top.map((it) => `  <item>
    <title>${x(it.title)}</title>
    <link>${x(it.url)}</link>
    <guid isPermaLink="true">${x(it.url)}</guid>
    <description>${x(it.desc)}</description>
    <pubDate>${rfc822(it.date)}</pubDate>
  </item>`).join('\n')}
</channel>
</rss>
`;
fs.writeFileSync(path.join(DOCS, 'rss.xml'), rss);

const robots = fs.readFileSync(path.join(DOCS, 'robots.txt'), 'utf8');
const maps = [...robots.matchAll(/^\s*Sitemap:\s*(\S+)/gim)].map((m) => m[1]).filter((u) => !u.endsWith('/sitemap-index.xml'));
fs.writeFileSync(path.join(DOCS, 'sitemap-index.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${maps.map((u) => `  <sitemap><loc>${x(u)}</loc><lastmod>${todayIso}</lastmod></sitemap>`).join('\n')}
</sitemapindex>
`);
console.log(`feeds — rss.xml ${top.length}개(날짜 있는 글 ${items.length}개 중, 가장 새 글 ${top[0] ? top[0].date : '-'}) · sitemap-index.xml 사이트맵 ${maps.length}개`);
