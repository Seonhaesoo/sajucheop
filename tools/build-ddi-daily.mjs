/* 오늘의 띠별 운세 — /today/ddi/ + /today/ddi/<띠>/ 12장, /tomorrow/ddi/ + 12장. 매일 daily-story.yml 이 다시 생성한다.
 * 그날 일진의 지지와 내 띠의 관계(합·충·형·해·파·원진), 천간의 오행이 내 띠에게 드는 십성 무리, 출생연도 천간별 십성으로 조합한다.
 * 사용: node tools/build-ddi-daily.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, kstToday, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { DDI, TRAIT, REL, DAY_REL, DAY_STEM, SIP_LINE, EL_HAN, EL_COLOR, EL_DIR, EL_NUM, YUKHAP, relations, elRelation, josa } from './ddi-data.mjs';

const { M, I, Lunar } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const SAENGIL = 'http://saengil.sajucheop.com';
const WD = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const weekday = (y, m, d) => ((I.daysFromCivil(y, m, d) + 4) % 7 + 7) % 7;
const HOURS = ['23~01시', '01~03시', '03~05시', '05~07시', '07~09시', '09~11시', '11~13시', '13~15시', '15~17시', '17~19시', '19~21시', '21~23시'];
const NAV = (rel) => [{ href: rel, label: '사주 보기' }, { href: rel + 'day/', label: '날짜별 일진' }, { href: rel + 'ddi-gunghap/', label: '띠 궁합' }];
const STYLE = `<style>
    .td-hero { margin: 0 0 18px; padding: 22px 20px; background: #221D17; border-radius: 14px; text-align: center; color: #F6F1E8; }
    .td-hero .td-over { font-size: 12px; letter-spacing: 3px; color: #E0B04A; }
    .td-hero .td-han { font-family: 'Noto Serif KR', serif; font-size: 40px; font-weight: 700; letter-spacing: 4px; margin: 6px 0 0; }
    .td-hero .td-score { font-size: 44px; font-weight: 700; color: #E0B04A; line-height: 1.1; margin-top: 6px; }
    .td-hero .td-sub { font-size: 13px; color: #CFC5B4; margin-top: 4px; }
    .td-bar { height: 8px; border-radius: 999px; background: rgba(246,241,232,.15); margin: 12px auto 0; max-width: 320px; overflow: hidden; }
    .td-bar i { display: block; height: 100%; background: #E0B04A; }
    .td-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 8px 0 4px; }
    .td-grid div { padding: 10px 8px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; text-align: center; font-size: 13px; }
    .td-grid small { display: block; font-size: 11px; color: var(--faint); margin-bottom: 3px; }
    .td-table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 6px 0 4px; }
    .td-table th, .td-table td { padding: 8px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .td-table th { font-weight: 500; color: var(--faint); font-size: 12px; }
    .td-table .sc { font-weight: 700; white-space: nowrap; }
    .td-list { list-style: none; padding: 0; margin: 6px 0 0; }
    .td-list li { padding: 9px 0; border-bottom: 1px solid var(--line-soft); font-size: 14px; line-height: 1.6; }
    .td-list li b { display: inline-block; min-width: 72px; }
    .td-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0 0; }
    .td-chips a { font-size: 12.5px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--line); text-decoration: none; color: inherit; background: #FFFDF9; }
    .td-chips a.on { border-color: var(--seal); color: var(--seal); font-weight: 700; }
  </style>`;

function write(relPath, html) {
  const file = path.join(DOCS, relPath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
const fill = (s, m) => s.replace(/\{(\w+)\}/g, (_, k) => m[k] == null ? '' : m[k]);
const pick = (arr, seed) => arr[seed % arr.length];

function lunarOf(y, m, d) {
  if (!Lunar || !Lunar.setSolarDate(y, m, d)) return null;
  const l = Lunar.getLunarCalendar();
  return { m: l.month, d: l.day, leap: !!(l.intercalation || l.isLeap || l.leap || l.leapMonth), son: l.day % 10 === 9 || l.day % 10 === 0 };
}

function dayInfo(y, m, d) {
  const p = M.dayPillarOf(y, m, d);
  const idx60 = I.dayPillarIndex(I.daysFromCivil(y, m, d) + I.JDN_EPOCH);
  return { y, m, d, w: weekday(y, m, d), stem: p.stem, branch: p.branch, g: M.ganjiName(p.stem, p.branch), idx60, lun: lunarOf(y, m, d), st: M.STEMS[p.stem], br: M.BRANCHES[p.branch] };
}

/* 띠 × 날 → 점수와 텍스트 */
export function fortune(day, a) {
  const D = DDI[a];
  const rels = relations(day.branch, a);
  const primary = rels.find((r) => r !== 'same') || rels[0] || 'none';
  const er = elRelation(day.st.el, D.el);        /* 일진 천간 오행 → 내 띠 오행 */
  let s = 60;
  for (const r of rels) s += Math.round(REL[r].score * 0.85);
  s += { ctl: 6, gen_by: 5, same: 2, gen: 3, ctl_by: -3 }[flip(er)];   /* 재성 +6 · 인성 +5 · 비겁 +2 · 식상 +3 · 관성 −3 */
  s += ((day.idx60 * 7 + a * 3) % 5) - 2;
  const score = Math.max(30, Math.min(97, s));
  const seed = day.idx60 + a;
  const RT = DAY_REL[primary], ST = DAY_STEM[flip(er)];
  const map = { dh: `${day.br.kor}(${day.br.han})`, my: D.animal, mh: `${M.BRANCHES[a].kor}(${D.han})` };
  const luckyBranch = YUKHAP[a];
  return { score, rels, primary, sip: ST.key, one: RT.one, total: josa(fill(pick(RT.total, seed), map)), love: RT.love, health: RT.health, money: pick(ST.money, seed), work: pick(ST.work, seed >> 1),
    lucky: { color: EL_COLOR[day.st.el], num: EL_NUM[D.el], hour: HOURS[luckyBranch], dir: EL_DIR[day.st.el] } };
}
/* elRelation(dayEl, myEl): 'gen' = 일진이 나를 생(인성) 등 — 내 입장으로 뒤집기 */
function flip(er) { return { gen: 'gen_by', gen_by: 'gen', ctl: 'ctl_by', ctl_by: 'ctl', same: 'same' }[er]; }

const years = (a, y) => { const out = []; for (let yy = y - 6; yy >= 1930; yy -= 1) if (((yy - 4) % 12 + 12) % 12 === a) out.push(yy); return out.slice(0, 7); };
const yearStem = (yy) => ((yy - 4) % 10 + 10) % 10;

function ddiPage(day, a, kind) {
  const D = DDI[a], f = fortune(day, a), rel = '../../../';
  const base = kind === 'today' ? '/today/ddi/' : '/tomorrow/ddi/';
  const url = `${base}${D.slug}/`;
  const label = kind === 'today' ? '오늘' : '내일';
  const dateTxt = `${day.y}년 ${day.m}월 ${day.d}일 ${WD[day.w]}`;
  const title = `${label}의 ${D.animal}띠 운세 — ${day.m}월 ${day.d}일 ${f.score}점, ${f.one}`;
  const desc = `${dateTxt} ${D.animal}띠 ${label}의 운세. 일진 ${day.g.kor}(${day.g.han})일과 ${D.han}의 관계는 ${f.rels.map((r) => REL[r].label).join('·') || '무난'}, ${f.score}점. 총운·재물·애정·일·건강과 출생연도별 한 줄, 행운의 시간과 색.`;
  const yrRows = years(a, day.y).map((yy) => { const sip = M.sipseongOf(yearStem(yy), day.stem); return `<li><b>${yy}년생</b> <span class="dp-tag">${sip}</span> ${SIP_LINE[sip]}</li>`; }).join('\n        ');
  const others = DDI.map((d, i) => ({ i, s: fortune(day, i).score }));
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}${kind}/ddi/" style="color: inherit; text-decoration: none;">${label}의 띠별 운세</a> · <a href="${rel}day/${iso(day.y, day.m, day.d)}/" style="color: inherit; text-decoration: none;">${day.m}월 ${day.d}일 일진</a></div>
    <h1 class="ga-title">${label}의 ${D.animal}띠 운세 —<br>${day.m}월 ${day.d}일 ${WD[day.w]}</h1>
    <p class="ga-meta">일진 ${day.g.kor}(${day.g.han})일 · ${day.lun ? `음력 ${day.lun.leap ? '윤' : ''}${day.lun.m}월 ${day.lun.d}일` : ''}${day.lun && day.lun.son ? ' · <b style="color: var(--seal);">손없는날</b>' : ''} · 매일 자정 갱신</p>
    <div class="td-hero">
      <div class="td-over">${D.animal}띠 · ${label}</div>
      <div class="td-han">${D.han} · ${day.g.han}</div>
      <div class="td-score">${f.score}<span style="font-size: 18px;">점</span></div>
      <div class="td-sub">${f.one} · ${f.rels.map((r) => REL[r].label).join('·') || '합충 없음'} · ${f.sip}의 날</div>
      <div class="td-bar"><i style="width: ${f.score}%"></i></div>
    </div>
    <p class="ga-lead">${esc(f.total)}</p>

    <div class="ga-body">
      <h2>재물</h2>
      <p>${esc(f.money)}</p>
      <h2>애정</h2>
      <p>${esc(f.love)} ${D.animal}띠는 ${esc(TRAIT[D.slug].love)}</p>
      <h2>일·공부</h2>
      <p>${esc(f.work)}</p>
      <h2>건강</h2>
      <p>${esc(f.health)}</p>

      <h2>행운의 조각</h2>
      <div class="td-grid">
        <div><small>시간</small>${f.lucky.hour}</div>
        <div><small>색</small>${f.lucky.color}</div>
        <div><small>숫자</small>${f.lucky.num}</div>
      </div>
      <p style="font-size: 12.5px; color: var(--muted);">시간은 ${D.han}와 육합하는 지지의 시각, 색은 ${label} 천간 ${day.st.kor}${day.st.el}(${day.st.han})의 오행, 숫자는 ${D.animal}띠 ${D.el}(${EL_HAN[D.el]})의 수. 방향은 ${f.lucky.dir}.</p>

      <h2>출생연도별 ${D.animal}띠</h2>
      <p>같은 띠라도 태어난 해의 천간이 달라 ${label} 천간 ${day.st.kor}(${day.st.han})이 드는 십성이 다릅니다.</p>
      <ul class="td-list">
        ${yrRows}
      </ul>

      <h2>${label} 다른 띠는</h2>
      <div class="td-chips">${others.map((x) => `<a href="${rel}${kind}/ddi/${DDI[x.i].slug}/"${x.i === a ? ' class="on"' : ''}>${DDI[x.i].animal}띠 ${x.s}</a>`).join('')}</div>

      <p class="callout">${kind === 'today' ? `<a href="${rel}tomorrow/ddi/${D.slug}/">내일의 ${D.animal}띠 운세 →</a>` : `<a href="${rel}today/ddi/${D.slug}/">← 오늘의 ${D.animal}띠 운세</a>`} · <a href="${rel}day/${iso(day.y, day.m, day.d)}/">${day.m}월 ${day.d}일 일진 (일간별)</a> · <a href="${rel}ddi-gunghap/${D.slug}/">${D.animal}띠 궁합</a> · <a href="${rel}2027/ddi/${D.slug}/">${D.animal}띠 2027년 운세</a> · <a href="${SAENGIL}/ddi/${D.slug}/">${D.animal}띠 출생연도 (생일 사전)</a></p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>내 사주로 ${label} 점수 보기</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">띠 운세는 태어난 해 한 글자로 보는 약식입니다. 생년월일시를 넣으면 여덟 글자로 본 ${label}의 흐름과 시간대별 점수가 나와요.</p>
    </div>
  </article>`;
  write(url.slice(1), shell({
    rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: `${label}의 ${D.animal}띠 운세 ${f.score}점`,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: `${label}의 띠별 운세`, url: SITE + base }, { name: `${D.animal}띠`, url: SITE + url }]),
      { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: iso(day.y, day.m, day.d), dateModified: iso(day.y, day.m, day.d), inLanguage: 'ko', author: { '@type': 'Organization', name: '사주첩' }, publisher: { '@type': 'Organization', name: '사주첩' }, mainEntityOfPage: SITE + url }],
    body
  }));
  return { url, score: f.score, one: f.one, rels: f.rels };
}

function indexPage(day, kind, items) {
  const rel = '../../', base = kind === 'today' ? '/today/ddi/' : '/tomorrow/ddi/', label = kind === 'today' ? '오늘' : '내일';
  const dateTxt = `${day.y}년 ${day.m}월 ${day.d}일 ${WD[day.w]}`;
  const sorted = items.map((it, i) => ({ ...it, i })).sort((x, y) => y.score - x.score);
  const title = `${label}의 띠별 운세 — ${day.m}월 ${day.d}일 12띠 점수와 한 줄 흐름`;
  const desc = `${dateTxt} ${label}의 띠별 운세. 일진 ${day.g.kor}(${day.g.han})일 기준으로 쥐띠부터 돼지띠까지 12띠 점수, 총운·재물·애정·일·건강, 출생연도별 한 줄. 매일 자정 갱신.`;
  const rows = sorted.map((it) => `<tr><td><a href="${rel}${kind}/ddi/${DDI[it.i].slug}/">${DDI[it.i].animal}띠</a></td><td class="sc">${it.score}점</td><td>${it.one}</td><td>${it.rels.map((r) => REL[r].label).join('·') || '무난'}</td></tr>`).join('\n        ');
  const body = `
  <article class="guide-article">
    <div class="ga-overline">${label}의 띠별 운세</div>
    <h1 class="ga-title">${label}의 띠별 운세 —<br>${day.m}월 ${day.d}일 ${WD[day.w]}</h1>
    <p class="ga-meta">일진 ${day.g.kor}(${day.g.han})일 · ${day.st.kor}${day.st.el}의 기운 · 매일 자정 갱신</p>
    <p class="ga-lead">${label}의 일진은 ${day.g.kor}(${day.g.han})일입니다. ${josa(`지지 ${day.br.kor}(${day.br.han})와`)} 내 띠의 지지가 합인지 충인지, 천간 ${day.st.kor}(${day.st.han})의 오행이 내 띠에게 무엇으로 드는지로 열두 띠의 하루를 읽습니다. 가장 순한 띠는 <b>${DDI[sorted[0].i].animal}띠</b>(${sorted[0].score}점), 한 템포 쉬어 갈 띠는 <b>${DDI[sorted[11].i].animal}띠</b>(${sorted[11].score}점)입니다.</p>
    <div class="ga-body">
      <h2>12띠 점수</h2>
      <table class="td-table">
        <tr><th>띠</th><th>점수</th><th>한 줄</th><th>일진과의 관계</th></tr>
        ${rows}
      </table>
      <p class="callout">${kind === 'today' ? `<a href="${rel}tomorrow/ddi/">내일의 띠별 운세 →</a>` : `<a href="${rel}today/ddi/">← 오늘의 띠별 운세</a>`} · <a href="${rel}day/${iso(day.y, day.m, day.d)}/">${day.m}월 ${day.d}일 일진 (일간별 흐름)</a> · <a href="${rel}ddi-gunghap/">띠 궁합표</a> · <a href="${rel}2027/">2027년 띠별 운세</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>내 사주로 ${label} 점수 보기</span></a>
    </div>
  </article>`;
  write(base.slice(1), shell({ rel, title, desc, canonical: SITE + base, nav: NAV(rel), extraHead: STYLE, jsonld: breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: `${label}의 띠별 운세`, url: SITE + base }]), body }));
}

/* ---------- 실행 ---------- */
const today = kstToday();
const tmr = I.civilFromDays(I.daysFromCivil(today.y, today.m, today.d) + 1);
const urls = [];
for (const [kind, dt] of [['today', today], ['tomorrow', tmr]]) {
  const day = dayInfo(dt.y, dt.m, dt.d);
  const items = DDI.map((_, a) => ddiPage(day, a, kind));
  indexPage(day, kind, items);
  const base = kind === 'today' ? '/today/ddi/' : '/tomorrow/ddi/';
  urls.push(base, ...items.map((it) => it.url));
}
const lastmod = iso(today.y, today.m, today.d);
const sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq></url>`)).concat(['</urlset>', '']).join('\n');
fs.writeFileSync(path.join(DOCS, 'sitemap-ddi-daily.xml'), sm);
const robotsPath = path.join(DOCS, 'robots.txt');
let robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-ddi-daily.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-ddi-daily.xml\n');
console.log(`띠별 운세 생성 완료 — ${lastmod} 오늘·내일 ${urls.length}장`);
