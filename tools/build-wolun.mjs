/* 이달의 띠별 운세(월운) — /wolun/ 허브 + /wolun/YYYY-MM/ (그 달에 드는 절기부터 다음 절기 전까지, 12띠 한 페이지)
 *  - 띠마다: 점수(기본 74 ± 월지와의 관계 ± 월간 오행, 55~96 참고값), 관계 태그, 풀이(관계 문단 + 함께 드는 관계 + 오행 한 줄),
 *    좋은 날(일지가 띠와 육합·삼합) · 조심할 날(일지가 띠와 충) — 날짜는 날짜별 일진 페이지로 잇는다
 *  - 일간 열 가지의 이달 십성 한 줄, 자주 묻는 질문(FAQPage)
 *  - 달 1일부터 절기 전날까지는 지난 달의 흐름이라 맨 위에 안내
 * 범위: 이번 절기 달부터 내년 12월까지. 문장 변형은 절대 달 번호로 골라 범위가 굴러가도 페이지 문장이 바뀌지 않는다.
 * daily-story.yml 이 매일 다시 돌려 '이번 달' 표시와 새 달을 붙인다. → sitemap-wolun.xml
 * 사용: node tools/build-wolun.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, kstToday, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { DDI, relations, elRelation, YUKHAP, CHUNG, SAMHAP_G, EL_HAN, josa } from './ddi-data.mjs';
import { MONTH_SIP } from './newyear-2027-data.mjs';
import { makeWolun, JIE_NAME, nextMonth, prevMonth, monthKey } from './wolun-lib.mjs';
import { WOL_CHAR, WOL_STEM, WOL_TAG, WOL_REL, WOL_EXTRA, WOL_EL, WOL_REL_SCORE, WOL_EL_SCORE, wolGrade } from './wolun-data.mjs';

const { M, I } = loadEngine();
const { currentSolarMonth, solarMonth } = makeWolun({ M, I });
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const today = kstToday();
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (n) => String(n).padStart(2, '0');
const iso = (c) => `${c.y}-${pad(c.m)}-${pad(c.d)}`;
const hm = (t) => `${pad(t.hh)}:${pad(t.mm)}`;
const ILGAN_SLUG = ['gapmok', 'eulmok', 'byeonghwa', 'jeonghwa', 'muto', 'gito', 'gyeonggeum', 'singeum', 'imsu', 'gyesu'];
const NAV = (rel) => [{ href: rel, label: '사주 보기' }, { href: rel + 'today/ddi/', label: '오늘의 띠별 운세' }, { href: rel + '2027/', label: '2027 신년운세' }, { href: rel + 'ddi-gunghap/', label: '띠 궁합' }];
const name = (b) => `${DDI[b].animal}띠`;
const elName = (el) => `${el}(${EL_HAN[el]})`;
const fill = (s, m) => s.replace(/\{(\w+)\}/g, (_, k) => m[k]);

/* 여러 관계 중 문단을 고를 주 관계 — 자형 > 합·충 등(표 순서) > 같은 띠 > 없음 */
const ORDER = ['selfhyeong', 'yukhap', 'samhap', 'banghap', 'chung', 'hyeong', 'wonjin', 'hae', 'pa', 'same'];
const primaryOf = (rels) => ORDER.find((r) => rels.includes(r)) || 'none';
const GOOD = ['yukhap', 'samhap', 'banghap'], BAD = ['chung', 'hyeong', 'hae', 'wonjin', 'pa', 'selfhyeong'];

/* 날짜 묶음 — 10월 12·16·24일, 11월 1일 (일진 페이지가 있으면 링크) */
function dayList(days, rel) {
  const byMonth = [];
  for (const d of days) {
    let g = byMonth.find((x) => x.m === d.m && x.y === d.y);
    if (!g) byMonth.push((g = { y: d.y, m: d.m, items: [] }));
    const has = fs.existsSync(path.join(DOCS, 'day', iso(d), 'index.html'));
    g.items.push(has ? `<a href="${rel}day/${iso(d)}/">${d.d}</a>` : String(d.d));
  }
  return byMonth.map((g) => `${g.m}월 ${g.items.join('·')}일`).join(', ');
}

const STYLE = `<style>
    .wo-hero { margin: 0 0 18px; padding: 22px 20px; background: #221D17; border-radius: 14px; color: #F6F1E8; text-align: center; }
    .wo-hero .wo-over { font-size: 12px; letter-spacing: 3px; color: #E0B04A; }
    .wo-hero .wo-han { font-family: 'Noto Serif KR', serif; font-size: 42px; font-weight: 700; letter-spacing: 4px; margin: 6px 0 2px; }
    .wo-hero .wo-sub { font-size: 13px; color: #CFC5B4; }
    .wo-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 4px 0 14px; }
    .wo-two > div { padding: 12px 14px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; font-size: 13.5px; line-height: 1.7; }
    .wo-two b.h { display: block; font-family: 'Noto Serif KR', serif; font-size: 15px; margin-bottom: 4px; }
    .wo-two a { text-decoration: none; }
    .wo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 8px 0 16px; }
    .wo-grid a { display: block; padding: 8px 4px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; text-decoration: none; color: inherit; text-align: center; font-size: 12.5px; }
    .wo-grid a b { display: block; font-family: 'Noto Serif KR', serif; font-size: 18px; }
    .wo-grid a i { font-style: normal; color: var(--seal); font-weight: 700; }
    .wo-grid a.good { border-color: #1E5C46; } .wo-grid a.warn { border-color: var(--seal); }
    .wo-sign { padding: 14px 0 16px; border-bottom: 1px solid var(--line-soft); }
    .wo-sign h3 { font-family: 'Noto Serif KR', serif; font-size: 17px; margin: 0 0 6px; }
    .wo-sign h3 .sc { color: var(--seal); margin-left: 6px; }
    .wo-sign p { margin: 6px 0 0; font-size: 14px; line-height: 1.7; }
    .wo-sign .days { font-size: 13px; color: var(--muted); }
    .wo-sign .days b { color: var(--ink); font-weight: 600; }
    .wo-sign .days a { text-decoration: none; }
    .wo-sign .more { font-size: 12.5px; }
    .ny-tag { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--line-soft); color: var(--muted); vertical-align: 2px; margin-left: 6px; font-family: 'Noto Sans KR', sans-serif; font-weight: 500; }
    .ny-tag.good { background: var(--seal); border-color: var(--seal); color: #F6F1E8; }
    .ny-tag.warn { background: #211C15; border-color: #211C15; color: #F6F1E8; }
    .wo-list { list-style: none; padding: 0; margin: 6px 0 0; }
    .wo-list li { padding: 9px 0; border-bottom: 1px solid var(--line-soft); font-size: 14px; line-height: 1.6; }
    .wo-list li.cur { background: #FBF3E6; margin: 0 -8px; padding-left: 8px; padding-right: 8px; border-radius: 8px; }
    .wo-list li b.han { font-family: 'Noto Serif KR', serif; }
    .wo-list li small { color: var(--muted); }
    @media (max-width: 480px) { .wo-grid { grid-template-columns: repeat(3, 1fr); } .wo-two { grid-template-columns: 1fr; } }
  </style>`;

const urls = [];
function write(url, o) {
  const file = path.join(DOCS, url.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, shell(o));
}
const faqLd = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const article = (url, title, desc, published) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: published, dateModified: published, inLanguage: 'ko', author: { '@type': 'Organization', name: '사주첩' }, publisher: { '@type': 'Organization', name: '사주첩' }, mainEntityOfPage: SITE + url });

/* ---------- 범위 ---------- */
const [CY, CM] = currentSolarMonth(today);
const LIST = [];
for (let y = CY, m = CM; ; [y, m] = nextMonth(y, m)) { LIST.push([y, m]); if (y === today.y + 1 && m === 12) break; }
const monthUrl = (y, m) => `/wolun/${monthKey(y, m)}/`;

/* ---------- 달 페이지 ---------- */
function monthPage(y, m) {
  const S = solarMonth(y, m), url = monthUrl(y, m), rel = '../../';
  const abs = y * 12 + m;   /* 문장 변형 — 범위가 굴러가도 그대로 */
  const st = M.STEMS[S.stem], br = M.BRANCHES[S.branch], mon = DDI[S.branch];
  const han = st.han + br.han, kor = st.kor + br.kor;
  const range = `${S.start.m}월 ${S.start.d}일 ~ ${S.end.m}월 ${S.end.d}일`;
  const isCur = y === CY && m === CM;
  const signs = DDI.map((D, b) => {
    const rels = relations(b, S.branch), p = primaryOf(rels);
    const er = elRelation(D.el, st.el);
    let score = 74 + rels.reduce((s, r) => s + (WOL_REL_SCORE[r] || 0), 0) + WOL_EL_SCORE[er];
    score = Math.max(55, Math.min(96, score));
    const g = wolGrade(score);
    const vars = WOL_REL[p];
    const relText = fill(vars[(abs + b) % vars.length], { D: name(b) });
    const extras = rels.filter((r) => r !== p && r !== 'same' && WOL_EXTRA[r]).map((r) => '다만 ' + WOL_EXTRA[r]);
    const elText = josa(fill(WOL_EL[er][(abs + b) % 2], { D: name(b), E: elName(st.el), SE: elName(D.el) }));
    const best = S.days.filter((d) => YUKHAP[b] === d.branch || (d.branch !== b && SAMHAP_G[d.branch] === SAMHAP_G[b]));
    const care = S.days.filter((d) => CHUNG[b] === d.branch);
    const tone = GOOD.includes(p) ? 'good' : BAD.includes(p) ? 'warn' : '';
    return { b, D, p, rels, score, g, tone, html: `
      <section class="wo-sign" id="${D.slug}">
        <h3>${name(b)} ${m}월 운세<span class="sc">${score}점</span><span class="ny-tag ${tone}">${WOL_TAG[p]}</span></h3>
        <p>${esc(relText)}${extras.length ? ' ' + esc(extras.join(' ')) : ''} ${esc(elText)}</p>
        <p class="days"><b>좋은 날</b> ${best.length ? dayList(best, rel) : '두드러진 날 없음'} · <b>조심할 날</b> ${care.length ? dayList(care, rel) : '부딪히는 날 없음'}</p>
        <p class="more"><a href="${rel}today/ddi/${D.slug}/">오늘의 ${name(b)} 운세</a> · <a href="${rel}2027/ddi/${D.slug}/">${name(b)} 2027년 운세</a> · <a href="${rel}ddi-gunghap/${D.slug}/">${name(b)} 궁합</a></p>
      </section>` };
  });
  const ranked = signs.slice().sort((x, z) => z.score - x.score || x.b - z.b);
  const top = ranked.slice(0, 3), low = ranked.slice(-3).reverse();
  const grid = signs.map((s) => `<a href="#${s.D.slug}" class="${s.tone}"><b>${s.D.han}</b>${name(s.b)} <i>${s.score}</i></a>`).join('');
  const dm = M.STEMS.map((x, s) => { const sip = M.sipseongOf(s, S.stem); return `<li><a href="${rel}guide/ilgan-${ILGAN_SLUG[s]}.html"><b>${x.kor}${x.el}(${x.han})</b></a> 일간 — ${sip}, ${MONTH_SIP[sip]} 달</li>`; }).join('\n        ');
  const [py, pm] = prevMonth(y, m), [ny, nm] = nextMonth(y, m);
  const hasPrev = fs.existsSync(path.join(DOCS, 'wolun', monthKey(py, pm), 'index.html')) || LIST.some(([a, c]) => a === py && c === pm);
  const hasNext = LIST.some(([a, c]) => a === ny && c === nm);
  const yearHan = M.STEMS[S.yearStem].han + M.BRANCHES[S.yearBranch].han, yearKor = M.STEMS[S.yearStem].kor + M.BRANCHES[S.yearBranch].kor;
  const title = `${y}년 ${m}월 띠별 운세 — 12띠 이달의 흐름과 좋은 날 (${kor}월)`;
  const desc = `${y}년 ${m}월 띠별 운세. ${S.start.m}월 ${S.start.d}일 ${JIE_NAME[m]}부터 ${kor}월(${han}) — 운이 좋은 띠는 ${top.map((s) => name(s.b)).join('·')}, 조심할 띠는 ${low.map((s) => name(s.b)).join('·')}. 12띠 점수와 좋은 날·조심할 날, 일간별 한 줄까지 쉬운 말로.`;
  const published = iso(S.start);
  const gap = S.start.d > 1 ? `<p class="callout">${m}월 1일~${S.start.d - 1}일은 아직 절기상 지난달(${M.STEMS[(S.stem + 9) % 10].kor}${M.BRANCHES[(S.branch + 11) % 12].kor}월)이라 ${hasPrev ? `<a href="${rel}wolun/${monthKey(py, pm)}/">${pm}월 운세</a>` : `${pm}월 운세`}의 흐름입니다. ${m}월의 기운은 ${S.start.d}일 ${hm(S.start)} ${JIE_NAME[m]}부터 들어와요.</p>` : '';
  const faq = [
    [`${y}년 ${m}월 운세는 언제부터 언제까지인가요?`, `사주에서 달은 1일이 아니라 절기로 바뀝니다. ${y}년 ${m}월의 ${kor}월(${han})은 ${S.start.m}월 ${S.start.d}일 ${hm(S.start)} ${JIE_NAME[m]}부터 ${S.end.m}월 ${S.end.d}일까지이고, 다음 달은 ${S.nextStart.m}월 ${S.nextStart.d}일 ${JIE_NAME[S.nextStart.m]}에 시작합니다.`],
    [`${y}년 ${m}월에 운이 좋은 띠는?`, `${top.map((s) => `${name(s.b)}(${s.score}점)`).join(', ')} 순입니다. 이달의 글자 ${br.kor}(${br.han})와 띠의 글자가 짝을 이루거나 한 무리가 되고, 달의 오행이 띠를 돕는 쪽일수록 점수가 높아요.`],
    [`${y}년 ${m}월에 조심할 띠는?`, `${low.map((s) => `${name(s.b)}(${s.score}점)`).join(', ')}입니다. 점수가 낮은 달은 일정이 흔들리거나 말이 엇갈리기 쉬운 달이라는 뜻이지, 나쁜 일이 생긴다는 뜻은 아니에요. 페이지의 조심할 날에 큰 결정을 피하면 충분합니다.`],
    [`${m}월의 월주(달의 간지)는 무엇인가요?`, `${kor}(${han})입니다. 윗글자 ${st.kor}${st.el}(${st.han})가 달의 분위기를, 아랫글자 ${br.kor}(${br.han}, ${mon.animal})가 띠별로 맞는 정도를 정합니다. ${yearKor}년(${yearHan}) 안의 한 달입니다.`]
  ].map(([q, a]) => [q, josa(a)]);
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}wolun/" style="color: inherit; text-decoration: none;">이달의 띠별 운세</a> · ${y}년 ${m}월</div>
    <h1 class="ga-title">${y}년 ${m}월 띠별 운세 —<br>${kor}월, ${mon.animal}의 달</h1>
    <p class="ga-meta">${range} · 월주 ${kor}(${han}) · ${yearKor}년(${yearHan})${isCur ? ' · <b style="color: var(--seal);">이번 달</b>' : ''}</p>
    <div class="wo-hero">
      <div class="wo-over">${y} · ${m}월</div>
      <div class="wo-han">${han}</div>
      <div class="wo-sub">${kor}월 · ${S.start.m}월 ${S.start.d}일(${WD[S.days[0].w]}) ${hm(S.start)} ${JIE_NAME[m]} ~ ${S.end.m}월 ${S.end.d}일</div>
    </div>
    ${gap}
    <p class="ga-lead">${esc(WOL_CHAR[S.branch])} ${esc(WOL_STEM[S.stem])}</p>
    <div class="wo-two">
      <div><b class="h">운이 좋은 띠</b>${top.map((s) => `<a href="#${s.D.slug}">${name(s.b)}</a> ${s.score}점`).join(' · ')}</div>
      <div><b class="h">조심할 띠</b>${low.map((s) => `<a href="#${s.D.slug}">${name(s.b)}</a> ${s.score}점`).join(' · ')}</div>
    </div>
    <div class="ga-body">
      <h2>12띠 ${m}월 운세</h2>
      <p>${josa(`띠마다 두 가지로 읽었습니다. 이달의 아랫글자 ${br.kor}(${br.han})가 내 띠 글자와 짝을 이루는지 부딪히는지, 그리고 윗글자 ${st.kor}${st.el}(${st.han})의 오행이 내 띠의 오행을 돕는지 누르는지입니다.`)} 좋은 날은 그날의 글자가 내 띠와 짝을 이루는 날, 조심할 날은 정면으로 부딪히는 날이에요.</p>
      <div class="wo-grid">${grid}</div>
      ${signs.map((s) => s.html).join('\n')}

      <h2>일간별로 보는 ${m}월</h2>
      <p>띠는 여덟 글자 중 한 글자입니다. ${josa(`태어난 날의 윗글자인 일간으로 보면 이달의 윗글자 ${st.kor}${st.el}(${st.han})가 사람마다 다른 별(십성)로 옵니다.`)} 내 일간은 <a href="${rel}">생년월일만 넣으면</a> 바로 나와요.</p>
      <ul class="wo-list">
        ${dm}
      </ul>

      <h2>자주 묻는 질문</h2>
      ${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n      ')}
      <p class="callout">${hasPrev ? `← <a href="${rel}wolun/${monthKey(py, pm)}/">${py !== y ? py + '년 ' : ''}${pm}월 운세</a> · ` : ''}${hasNext ? `<a href="${rel}wolun/${monthKey(ny, nm)}/">${ny !== y ? ny + '년 ' : ''}${nm}월 운세</a> → · ` : ''}<a href="${rel}wolun/">달별 목록</a> · <a href="${rel}today/ddi/">오늘의 띠별 운세</a> · <a href="${rel}2027/">2027 신년운세</a> · <a href="${rel}jeolgi/${S.start.y}/">${S.start.y}년 절기</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>띠 말고 내 사주로 이달 보기</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">점수는 띠 글자와 이달 글자의 관계(합은 더하고 충·형·해·원진·파는 빼고)에 오행 보정을 더해 55~96점으로 맞춘 참고값입니다.</p>
    </div>
  </article>`;
  write(url, { rel, title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: `${y}년 ${m}월 띠별 운세 — ${kor}월, 12띠 점수와 좋은 날`, extraHead: STYLE,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '이달의 띠별 운세', url: SITE + '/wolun/' }, { name: `${y}년 ${m}월`, url: SITE + url }]), article(url, title, desc, published), faqLd(faq)], body });
  urls.push({ loc: SITE + url, lastmod: published });
  return { y, m, S, han, kor, range, isCur, top, low };
}

/* ---------- 허브 ---------- */
function hub(months) {
  const url = '/wolun/', rel = '../';
  const cur = months.find((x) => x.isCur);
  const items = months.map((x) => `<li${x.isCur ? ' class="cur"' : ''}><b><a href="${rel}wolun/${monthKey(x.y, x.m)}/">${x.y}년 ${x.m}월 띠별 운세</a></b> — <b class="han">${x.han}</b> ${x.kor}월${x.isCur ? ' · <b>이번 달</b>' : ''}<br><small>${x.range} · 운이 좋은 띠 ${x.top.map((s) => name(s.b)).join('·')}</small></li>`).join('\n        ');
  const title = '이달의 띠별 운세 — 12띠 월운, 달마다 좋은 날과 조심할 날';
  const desc = `12띠의 달별 운세를 절기 기준으로. ${cur.y}년 ${cur.m}월(${cur.kor}월)부터 ${months[months.length - 1].y}년 ${months[months.length - 1].m}월까지, 띠마다 이달의 점수와 풀이, 좋은 날·조심할 날을 쉬운 말로 정리했어요.`;
  const faq = [
    ['왜 달이 1일이 아니라 4~8일쯤 바뀌나요?', '사주에서 한 달은 절기(節)에서 다음 절기까지입니다. 입춘·경칩·청명 같은 열두 절기가 양력 4~8일 사이에 들어서, 그날부터 그달의 기운으로 봅니다. 그래서 각 달 페이지 맨 위에 그 달이 시작하는 날짜와 시각을 적어 두었어요.'],
    ['좋은 날과 조심할 날은 어떻게 고르나요?', '날마다 60갑자 중 하나의 글자가 듭니다. 그날의 아랫글자가 내 띠 글자와 짝(육합)을 이루거나 한 무리(삼합)가 되는 날을 좋은 날, 정면으로 부딪히는(충) 날을 조심할 날로 골랐어요. 오늘의 띠별 운세와 같은 기준입니다.'],
    ['띠 운세와 내 사주 운세는 다른가요?', '띠는 여덟 글자 중 태어난 해의 한 글자입니다. 그래서 같은 띠라도 사람마다 이달이 다르게 옵니다. 생년월일을 넣으면 일간을 기준으로 한 이달의 흐름을 볼 수 있어요.']
  ];
  const body = `
  <article class="guide-article">
    <div class="ga-overline">이달의 띠별 운세</div>
    <h1 class="ga-title">이달의 띠별 운세 —<br>12띠, 달마다 한 장</h1>
    <p class="ga-meta">${months.length}달 · ${months[0].y}년 ${months[0].m}월 ~ ${months[months.length - 1].y}년 ${months[months.length - 1].m}월 · 달은 절기에서 바뀝니다</p>
    <p class="ga-lead">사주에서 한 달은 양력 1일이 아니라 절기에서 시작합니다. 달마다 두 글자(월주)가 있어서, 그 달의 아랫글자가 내 띠와 짝을 이루는지 부딪히는지로 열두 띠의 한 달을 읽을 수 있어요.${cur ? ` 지금은 <a href="${rel}wolun/${monthKey(cur.y, cur.m)}/">${cur.y}년 ${cur.m}월 ${cur.kor}월</a>입니다.` : ''}</p>
    <div class="ga-body">
      <ul class="wo-list">
        ${items}
      </ul>
      <h2>자주 묻는 질문</h2>
      ${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n      ')}
      <p class="callout"><a href="${rel}today/ddi/">오늘의 띠별 운세</a> · <a href="${rel}2027/">2027 신년운세 (월별 흐름)</a> · <a href="${rel}ddi-gunghap/">띠 궁합</a> · <a href="${rel}jeolgi/">절기 달력</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>내 사주로 이달 흐름 보기</span></a>
    </div>
  </article>`;
  write(url, { rel, title, desc, canonical: SITE + url, nav: NAV(rel), ogTitle: '이달의 띠별 운세 — 12띠 월운', extraHead: STYLE,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '이달의 띠별 운세', url: SITE + url }]), faqLd(faq)], body });
  urls.unshift({ loc: SITE + url, lastmod: iso(today) });
}

const months = LIST.map(([y, m]) => monthPage(y, m));
hub(months);
fs.writeFileSync(path.join(DOCS, 'sitemap-wolun.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-wolun.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-wolun.xml\n');
console.log(`이달의 띠별 운세 — ${months.length}달 (${monthKey(...LIST[0])} → ${monthKey(...LIST[LIST.length - 1])}) + 허브, sitemap-wolun.xml`);
