/* 2027 정미년 신년운세 생성 — /2027/ddi/<띠>/ 12장 + /2027/ddi/<띠>/<출생연도>/ + /2027/ilju/<일주>/ 60장 + 인덱스 2장 + sitemap-2027.xml
 * 본문은 tools/newyear-2027-data.mjs(손으로 씀), 합충·십성·12운성·월건·절기는 엔진으로 계산해 조합한다.
 * 사용: node tools/build-2027.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { ILJU } from './ilju-data.mjs';
import { YEAR, DDI, REL, DDI_TEXT, SAMJAE_TEXT, STEM_REL_TEXT, AGE_TEXT, MONTH_LINE, MONTH_SIP, ILGAN_SEUN, ILJI_TEXT, UN_TEXT } from './newyear-2027-data.mjs';

const { M } = loadEngine();
const I = M._internals;
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const PUBLISHED = '2026-09-06';
const Y = YEAR.y, YS = YEAR.stem, YB = YEAR.branch; /* 丁=3, 未=7 */
const BIRTH_FROM = 1945, BIRTH_TO = 2010;
const SAENGIL = 'http://saengil.sajucheop.com';

/* ---------- 지지 관계표 ---------- */
const YUKHAP = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
const CHUNG = { 0: 6, 6: 0, 1: 7, 7: 1, 2: 8, 8: 2, 3: 9, 9: 3, 4: 10, 10: 4, 5: 11, 11: 5 };
const SAMHAP_G = { 8: 0, 0: 0, 4: 0, 11: 1, 3: 1, 7: 1, 2: 2, 6: 2, 10: 2, 5: 3, 9: 3, 1: 3 };
const BANGHAP_G = { 2: 0, 3: 0, 4: 0, 5: 1, 6: 1, 7: 1, 8: 2, 9: 2, 10: 2, 11: 3, 0: 3, 1: 3 };
const HYEONG = [[2, 5], [5, 8], [2, 8], [1, 10], [10, 7], [1, 7], [0, 3]];
const PA = { 0: 9, 9: 0, 1: 4, 4: 1, 2: 11, 11: 2, 3: 6, 6: 3, 5: 8, 8: 5, 7: 10, 10: 7 };
const HAE = { 0: 7, 7: 0, 1: 6, 6: 1, 2: 5, 5: 2, 3: 4, 4: 3, 8: 11, 11: 8, 9: 10, 10: 9 };
const WONJIN = { 0: 7, 7: 0, 1: 6, 6: 1, 2: 9, 9: 2, 3: 8, 8: 3, 4: 11, 11: 4, 5: 10, 10: 5 };

function relations(a, b) {
  const r = [];
  if (a === b) r.push('same');
  if (YUKHAP[a] === b) r.push('yukhap');
  if (CHUNG[a] === b) r.push('chung');
  if (a !== b && SAMHAP_G[a] === SAMHAP_G[b]) r.push('samhap');
  if (HYEONG.some(([p, q]) => (p === a && q === b) || (p === b && q === a))) r.push('hyeong');
  if (HAE[a] === b) r.push('hae');
  if (WONJIN[a] === b) r.push('wonjin');
  if (PA[a] === b) r.push('pa');
  if (a !== b && BANGHAP_G[a] === BANGHAP_G[b]) r.push('banghap');
  return r;
}
const primaryRel = (a, b) => relations(a, b)[0] || 'none';
const REL_KO = { same: '동일', yukhap: '육합', chung: '충', samhap: '삼합', hyeong: '형', hae: '해', wonjin: '원진', pa: '파', banghap: '방합', none: '무난' };

/* 데이터의 띠 관계가 표와 맞는지 검증 */
DDI.forEach((d, b) => {
  if (M.BRANCHES[b].han !== d.han) throw new Error('띠 순서 불일치: ' + d.animal);
  const p = primaryRel(b, YB);
  if (p !== d.rel) throw new Error(`띠 관계 불일치 ${d.animal}: 데이터 ${d.rel} / 계산 ${p}`);
});

/* ---------- 12운성 ---------- */
const UN_NAMES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
const UN_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];
function unseong(s, b) {
  const k = M.STEMS[s].yang ? (b - UN_START[s] + 12) % 12 : (UN_START[s] - b + 12) % 12;
  return UN_NAMES[k];
}
const stemIdx = (han) => M.STEMS.findIndex((x) => x.han === han);
const branchIdx = (han) => M.BRANCHES.findIndex((x) => x.han === han);
const iljuList = ILJU.map((e) => Object.assign({}, e, { s: stemIdx(e.han[0]), b: branchIdx(e.han[1]) }));
iljuList.forEach((e) => {
  const u = unseong(e.s, e.b);
  if (u !== e.un) throw new Error(`12운성 불일치 ${e.kor}: 데이터 ${e.un} / 계산 ${u}`);
});

/* ---------- 일간별 세운 십성 검증 ---------- */
ILGAN_SEUN.forEach((g) => {
  const sip = M.sipseongOf(g.stem, YS), bsip = M.branchSipseong(g.stem, YB);
  if (sip !== g.sip || bsip !== g.bsip) throw new Error(`세운 십성 불일치 ${M.STEMS[g.stem].kor}: ${sip}/${bsip} vs ${g.sip}/${g.bsip}`);
});

/* ---------- 오행 생극 ---------- */
const GEN = M.elCycle.gen, CTRL = M.elCycle.control;
['목', '화', '토', '금', '수'].forEach((el) => { if (!GEN[el] || !CTRL[el]) throw new Error('오행표 누락 ' + el); });
function stemRelKey(el) {
  if (el === '화') return 'same';
  if (GEN[el] === '화') return 'gen_out';
  if (GEN['화'] === el) return 'gen_in';
  if (CTRL['화'] === el) return 'ctrl_in';
  return 'ctrl_out';
}
const COLOR = ['푸른', '푸른', '붉은', '붉은', '황금', '황금', '흰', '흰', '검은', '검은'];

/* ---------- 정미년 절기·월건 ---------- */
function jdToKst(jd) {
  const t = jd - I.JDN_EPOCH + 0.5 + 9 / 24;
  const dayN = Math.floor(t);
  const cv = I.civilFromDays(dayN);
  const frac = t - dayN;
  let hh = Math.floor(frac * 24), mm = Math.round((frac * 24 - hh) * 60);
  if (mm === 60) { hh += 1; mm = 0; }
  return { y: cv.y, m: cv.m, d: cv.d, hh, mm };
}
const TERM_NAMES = ['입춘', '경칩', '청명', '입하', '망종', '소서', '입추', '백로', '한로', '입동', '대설', '소한'];
const MONTHS = [];
{
  let jd = I.ipchunJd(Y);
  for (let i = 0; i < 12; i++) {
    if (i > 0) jd = I.findTermJd((315 + 30 * i) % 360, jd + 20, jd + 40);
    const inStem = ((YS % 5) * 2 + 2) % 10;
    MONTHS.push({ i, term: TERM_NAMES[i], start: jdToKst(jd), stem: (inStem + i) % 10, branch: (2 + i) % 12 });
  }
  const end = I.findTermJd(315, jd + 20, jd + 40); /* 2028 입춘 */
  MONTHS.forEach((mo, i) => { mo.end = i < 11 ? MONTHS[i + 1].start : jdToKst(end); });
}
const IPCHUN = MONTHS[0].start;
const pad2 = (n) => String(n).padStart(2, '0');
const fmtMd = (c) => `${c.m}/${c.d}`;
function monthLabel(mo) {
  const st = M.STEMS[mo.stem], br = M.BRANCHES[mo.branch];
  return { name: `${mo.start.m}월`, ganji: `${st.han}${br.han}`, kor: `${st.kor}${br.kor}`, range: `${fmtMd(mo.start)}~${fmtMd(mo.end)}`, yearNote: mo.start.y !== Y ? `${mo.start.y}년 ` : '' };
}

/* 월별 흐름 — 내 지지(띠 또는 일지)와 월지의 관계 */
function monthRows(myBranch, dayStem) {
  return MONTHS.map((mo) => {
    const lab = monthLabel(mo);
    const rel = primaryRel(mo.branch, myBranch);
    const variants = MONTH_LINE[rel] || MONTH_LINE.none;
    const line = variants[(mo.i + myBranch) % variants.length];
    const sip = dayStem == null ? null : M.sipseongOf(dayStem, mo.stem);
    const head = `${lab.yearNote}${lab.name} <b>${lab.ganji}</b>월 <small>${lab.range}</small>`;
    const tag = `<span class="ny-tag ${REL[rel] ? REL[rel].badge : 'neutral'}">${REL_KO[rel]}</span>`;
    const sipTxt = sip ? `<span class="ny-sip">월간 ${sip} · ${MONTH_SIP[sip]} 달</span>` : '';
    return `<li><div class="ny-m-head">${head} ${tag}</div>${sipTxt}<div class="ny-m-line">${line}</div></li>`;
  }).join('\n        ');
}

/* ---------- 공용 ---------- */
const STYLE = `<style>
    .ny-hero { margin: 0 0 18px; padding: 24px 20px; background: #221D17; border-radius: 14px; text-align: center; color: #F6F1E8; }
    .ny-hero .ny-over { font-size: 12px; letter-spacing: 4px; color: #E0B04A; }
    .ny-hero .ny-han { font-family: 'Noto Serif KR', serif; font-size: 44px; font-weight: 700; letter-spacing: 6px; margin: 8px 0 2px; }
    .ny-hero .ny-sub { font-size: 13px; color: #CFC5B4; }
    .ny-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 12px; }
    .ny-tag { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--line-soft); color: var(--muted); vertical-align: 1px; }
    .ny-tag.good { background: var(--seal); border-color: var(--seal); color: #F6F1E8; }
    .ny-tag.warn { background: #211C15; border-color: #211C15; color: #F6F1E8; }
    .ny-hero .ny-tag { border-color: #4A4038; color: #F6F1E8; }
    .ny-hero .ny-tag.good { background: var(--seal); border-color: var(--seal); }
    .ny-hero .ny-tag.warn { background: #F6F1E8; color: #211C15; border-color: #F6F1E8; }
    .ny-meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 6px; }
    .ny-meta span { font-size: 12px; padding: 3px 9px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); }
    .ny-meta span b { color: var(--ink); font-weight: 600; }
    .ny-months { list-style: none; padding: 0; margin: 6px 0 0; }
    .ny-months li { padding: 10px 0; border-bottom: 1px solid var(--line-soft); }
    .ny-m-head { font-size: 14px; } .ny-m-head b { font-family: 'Noto Serif KR', serif; } .ny-m-head small { color: var(--faint); font-size: 12px; margin-left: 4px; }
    .ny-sip { display: block; font-size: 12px; color: var(--seal); margin-top: 2px; }
    .ny-m-line { font-size: 13.5px; color: var(--ink-body); line-height: 1.6; margin-top: 4px; }
    .ny-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 8px 0 18px; }
    .ny-grid a { display: block; padding: 10px 8px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; text-decoration: none; color: inherit; text-align: center; }
    .ny-grid a b { display: block; font-family: 'Noto Serif KR', serif; font-size: 16px; }
    .ny-grid a small { display: block; font-size: 11px; color: var(--faint); margin-top: 3px; line-height: 1.4; }
    .ny-grid a.cur { border-color: var(--seal); background: #FBF3E6; }
    .ny-grid.four { grid-template-columns: repeat(4, 1fr); }
    .ny-years { width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 6px 0 14px; }
    .ny-years th, .ny-years td { padding: 8px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; }
    .ny-years th { font-size: 12px; color: var(--muted); font-weight: 500; }
    .ny-years td a { text-decoration: none; font-weight: 600; }
    .ny-years td small { color: var(--faint); }
    .ny-group { margin-top: 22px; } .ny-group h2 a { text-decoration: none; }
    @media (max-width: 480px) { .ny-grid.four { grid-template-columns: repeat(3, 1fr); } .ny-hero .ny-han { font-size: 36px; } }
  </style>`;
const NAV = (rel) => [{ href: rel, label: '사주 보기' }, { href: rel + '2027/', label: '2027 운세' }, { href: rel + 'ilju/', label: '일주 사전' }, { href: rel + 'guide/', label: '서재' }];
const urls = [];
function write(relPath, html) {
  const file = path.join(DOCS, relPath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
function article(o) {
  return { '@context': 'https://schema.org', '@type': 'Article', headline: o.title, description: o.desc, datePublished: PUBLISHED, dateModified: PUBLISHED, inLanguage: 'ko', author: { '@type': 'Organization', name: '사주첩' }, publisher: { '@type': 'Organization', name: '사주첩' }, mainEntityOfPage: SITE + o.url };
}
function faq(items) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
}
const firstSentence = (s) => s.split(/(?<=[.!?다요])\s/)[0].replace(/\.$/, '') + '.';
const hero = (over, han, sub, badges) => `<div class="ny-hero"><div class="ny-over">${over}</div><div class="ny-han">${han}</div><div class="ny-sub">${sub}</div>${badges ? `<div class="ny-badges">${badges}</div>` : ''}</div>`;
const relBadge = (key) => `<span class="ny-tag ${REL[key].badge}">${REL[key].label}</span>`;
const yearsOf = (b) => { const ys = []; for (let y = BIRTH_FROM; y <= BIRTH_TO; y++) if (((y - 4) % 12 + 12) % 12 === b) ys.push(y); return ys; };
const ganjiOfYear = (y) => ({ s: ((y - 4) % 10 + 10) % 10, b: ((y - 4) % 12 + 12) % 12 });
const ipchunLine = `정미년은 ${IPCHUN.y}년 ${IPCHUN.m}월 ${IPCHUN.d}일 ${pad2(IPCHUN.hh)}:${pad2(IPCHUN.mm)} 입춘부터 ${MONTHS[11].end.y}년 ${MONTHS[11].end.m}월 ${MONTHS[11].end.d}일 입춘 전까지입니다. 그 전(1월 1일~2월 3일)은 아직 병오년(丙午) 기운으로 봅니다.`;

/* ---------- 띠 페이지 12 ---------- */
DDI.forEach((d, b) => {
  const rel = '../../../';
  const R = REL[d.rel], T = DDI_TEXT[d.rel];
  const years = yearsOf(b);
  const samjae = d.samjae ? SAMJAE_TEXT[d.samjae] : null;
  const url = `/2027/ddi/${d.slug}/`;
  const title = `2027년 ${d.animal}띠 운세 — 정미년 ${R.label} 흐름, 재물·애정·직장·건강과 월별 운세`;
  const desc = `${firstSentence(d.opener)} 2027 정미년 ${d.animal}띠의 총운·재물·애정·직장·건강, 12개월 흐름과 ${years[0]}~${years[years.length - 1]}년생 출생연도별 운세.`;
  const yearRows = years.map((y) => {
    const g = ganjiOfYear(y), st = M.STEMS[g.s];
    const age = Y - y + 1;
    return `<tr><td><a href="${rel}2027/ddi/${d.slug}/${y}/">${y}년생</a> <small>${COLOR[g.s]} ${d.animal}띠 · ${st.kor}${d.han === M.BRANCHES[g.b].han ? M.BRANCHES[g.b].kor : ''}년(${st.han}${M.BRANCHES[g.b].han})</small></td><td>세는나이 ${age}세 <small>만 ${age - 2}~${age - 1}세</small></td><td><small>${STEM_REL_TEXT[stemRelKey(st.el)].name}</small></td></tr>`;
  }).join('\n          ');
  const others = DDI.map((x, i) => `<a href="${rel}2027/ddi/${x.slug}/"${i === b ? ' class="cur"' : ''}><b>${x.han}</b><small>${x.animal}띠<br>${REL[x.rel].label}</small></a>`).join('\n        ');
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}2027/" style="color: inherit; text-decoration: none;">2027 정미년 운세</a> · 띠별</div>
    ${hero('2 0 2 7 · 丁未年', `${d.han} · ${d.animal}띠`, `미(未)와의 관계 — ${R.short}`, relBadge(d.rel) + (d.samjae ? `<span class="ny-tag warn">${d.samjae}</span>` : ''))}
    <h1 class="ga-title">2027년 ${d.animal}띠 운세 —<br>정미년, ${R.label}의 해</h1>
    <div class="ny-meta"><span>띠 지지 <b>${d.han} ${M.BRANCHES[b].kor}${d.el}</b></span><span>세운 <b>丁未 정미</b></span><span>관계 <b>${R.label}</b></span><span>삼재 <b>${d.samjae || '해당 없음'}</b></span></div>
    <p class="ga-meta">사주첩 · 2027 신년운세 · ${d.animal}띠</p>
    <p class="ga-lead">${esc(d.opener)}</p>

    <div class="ga-body">
      <h2>총운 — ${R.label}의 해</h2>
      <p>${esc(T.overall)}</p>
      ${samjae ? `<p class="callout"><b>${d.samjae}</b> — ${esc(samjae)} <a href="${rel}samjae/">내 삼재 기간 계산하기</a></p>` : ''}
      <h2>재물운</h2>
      <p>${esc(T.money)}</p>
      <h2>애정운</h2>
      <p>${esc(T.love)}</p>
      <h2>직장·학업운</h2>
      <p>${esc(T.work)}</p>
      <h2>건강운</h2>
      <p>${esc(T.health)}</p>

      <h2>월별 흐름 — 열두 달의 결</h2>
      <p>정미년 열두 달의 월건(月建)과 ${d.animal}띠 지지 ${d.han}의 관계로 읽은 달별 흐름입니다. 달의 경계는 1일이 아니라 절기(입춘·경칩·청명…)라 날짜를 함께 적었습니다.</p>
      <ul class="ny-months">
        ${monthRows(b, null)}
      </ul>

      <h2>출생연도별 ${d.animal}띠 2027년 운세</h2>
      <p>같은 ${d.animal}띠라도 태어난 해의 천간이 달라 정화(丁火)를 다르게 맞습니다. 내 출생연도를 고르면 나이와 연주(年柱), 정미년과의 오행 관계까지 이어서 봅니다.</p>
      <table class="ny-years">
        <thead><tr><th>출생연도</th><th>2027년 나이</th><th>정화(丁)와의 관계</th></tr></thead>
        <tbody>
          ${yearRows}
        </tbody>
      </table>
      <p class="callout">${ipchunLine} 띠의 경계도 같아서, 1월생·2월 초생은 <a href="${SAENGIL}/ddi/${d.slug}/">생일첩의 ${d.animal}띠 해 목록</a>에서 설날·입춘 기준을 확인하세요.</p>

      <h2>다른 띠의 2027년</h2>
      <div class="ny-grid four">
        ${others}
      </div>
      <p class="callout"><a href="${rel}2027/">2027 정미년 운세 전체</a> · <a href="${rel}2027/ilju/">60일주별 2027 운세</a> · <a href="${rel}tojeong/">2027 토정비결</a> · <a href="${rel}samjae/">삼재 계산</a></p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>띠 말고 내 사주 여덟 글자로 2027 보기</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">띠는 태어난 해 한 글자입니다. 생년월일을 넣으면 일간·일지까지 반영한 정밀 흐름이 나옵니다.</p>
    </div>
  </article>`;
  write(url.slice(1), shell({
    rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: `2027년 ${d.animal}띠 운세 — ${R.label}의 해`,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '2027 정미년 운세', url: SITE + '/2027/' }, { name: `${d.animal}띠`, url: SITE + url }]), article({ title, desc, url }),
      faq([
        [`2027년 ${d.animal}띠 운세는 어떤가요?`, `${d.animal}띠(${d.han})는 정미년의 미(未)와 ${R.label} 관계입니다. ${firstSentence(T.overall)}`],
        [`${d.animal}띠는 2027년에 삼재인가요?`, d.samjae ? `네. 해묘미(돼지·토끼·양) 그룹의 삼재 3년 중 마지막 해인 날삼재입니다. 나가는 삼재라 마무리와 정리에 좋다고 보며, 2028년 입춘부터 삼재가 끝납니다.` : `아닙니다. 2027년 삼재는 돼지띠·토끼띠·양띠(날삼재)이고 ${d.animal}띠는 해당하지 않습니다.`],
        [`${d.animal}띠 2027년 운세는 언제부터 적용되나요?`, ipchunLine]
      ])],
    body
  }));
  urls.push(SITE + url);

  /* ---------- 띠 × 출생연도 ---------- */
  years.forEach((y) => {
    const rel2 = '../../../../';
    const g = ganjiOfYear(y), st = M.STEMS[g.s], br = M.BRANCHES[g.b];
    const key = stemRelKey(st.el), S = STEM_REL_TEXT[key];
    const age = Y - y + 1;
    const stage = AGE_TEXT.find((a) => age <= a.max);
    const ganjiKor = `${st.kor}${br.kor}`;
    const url2 = `/2027/ddi/${d.slug}/${y}/`;
    const title2 = `${y}년생 ${d.animal}띠 2027년 운세 — 정미년 ${age}세, ${ganjiKor}년생의 한 해`;
    const desc2 = `${y}년생 ${COLOR[g.s]} ${d.animal}띠(${ganjiKor}년 ${st.han}${br.han}생)의 2027 정미년 운세. ${S.name}, 세는나이 ${age}세(만 ${age - 2}~${age - 1}세). 총운·재물·직장과 ${stage.label}의 한 해, ${d.animal}띠 ${R.label} 흐름까지.`;
    const sibYears = years.map((yy) => `<a href="${rel2}2027/ddi/${d.slug}/${yy}/"${yy === y ? ' class="cur"' : ''}><b>${yy}</b><small>${Y - yy + 1}세</small></a>`).join('\n        ');
    const body2 = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel2}2027/" style="color: inherit; text-decoration: none;">2027 정미년 운세</a> · <a href="${rel2}2027/ddi/${d.slug}/" style="color: inherit; text-decoration: none;">${d.animal}띠</a> · ${y}년생</div>
    ${hero('2 0 2 7 · 丁未年', `${st.han}${br.han}`, `${y}년생 ${COLOR[g.s]} ${d.animal}띠 — ${ganjiKor}년생`, `<span class="ny-tag">세는나이 ${age}세</span>` + relBadge(d.rel) + (d.samjae ? `<span class="ny-tag warn">${d.samjae}</span>` : ''))}
    <h1 class="ga-title">${y}년생 ${d.animal}띠 2027년 운세 —<br>${S.name}</h1>
    <div class="ny-meta"><span>연주 <b>${ganjiKor}(${st.han}${br.han})</b></span><span>연간 <b>${st.kor}${st.el}</b></span><span>2027년 <b>세는나이 ${age}세 · 만 ${age - 2}~${age - 1}세</b></span><span>띠 관계 <b>${R.label}</b></span></div>
    <p class="ga-meta">사주첩 · 2027 신년운세 · ${d.animal}띠 ${y}년생</p>
    <p class="ga-lead">${y}년에 태어난 ${d.animal}띠는 연주가 ${ganjiKor}(${st.han}${br.han}), 오행 색으로는 ${COLOR[g.s]} ${d.animal}입니다. 태어난 해의 천간 ${st.kor}${st.el}(${st.han})이 2027년의 정화(丁火)를 어떻게 맞는지가 같은 띠 안에서 이 해를 다르게 만듭니다.</p>

    <div class="ga-body">
      <h2>${S.name} — ${st.kor}${st.el}과 정화(丁火)</h2>
      <p>${esc(S.overall)}</p>
      <h2>${d.animal}띠로 보는 정미년 — ${R.label}</h2>
      <p>${esc(d.opener)}</p>
      <p>${esc(firstSentence(T.overall))} ${esc(T.overall.split(/(?<=[.!?다요])\s/).slice(1, 3).join(' '))} <a href="${rel2}2027/ddi/${d.slug}/">${d.animal}띠 2027년 운세 전체와 월별 흐름 보기</a></p>
      ${samjae ? `<p class="callout"><b>${d.samjae}</b> — ${esc(firstSentence(samjae))} 자세한 내용은 <a href="${rel2}samjae/">삼재 계산</a>에서.</p>` : ''}
      <h2>재물운</h2>
      <p>${esc(S.money)}</p>
      <p>${esc(T.money)}</p>
      <h2>직장·학업운</h2>
      <p>${esc(S.work)}</p>
      <h2>${stage.label}의 정미년 — 세는나이 ${age}세</h2>
      <p>${esc(stage.text)}</p>
      <p class="callout">${y}년생의 2027년 나이는 세는나이 ${age}세, 만나이는 생일 전 ${age - 2}세·생일 후 ${age - 1}세입니다. 학번·띠 경계·기념일은 <a href="${SAENGIL}/${y}/">생일첩의 ${y}년생 페이지</a>에서 날짜별로 볼 수 있습니다.</p>

      <h2>같은 ${d.animal}띠, 다른 출생연도</h2>
      <div class="ny-grid four">
        ${sibYears}
      </div>
      <p class="callout"><a href="${rel2}2027/ddi/${d.slug}/">${d.animal}띠 2027 운세</a> · <a href="${rel2}2027/ddi/">12띠 전체</a> · <a href="${rel2}2027/ilju/">60일주별 2027 운세</a> · <a href="${rel2}2027/">정미년 운세 허브</a></p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel2}"><span class="seal-dot" aria-hidden="true"></span><span>${y}년생 내 생일로 일주까지 보기</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">연주는 여덟 글자 중 두 글자입니다. 생년월일을 넣으면 일간 기준의 2027 세운 십성이 나옵니다.</p>
    </div>
  </article>`;
    write(url2.slice(1), shell({
      rel: rel2, title: title2, desc: desc2, canonical: SITE + url2, nav: NAV(rel2), extraHead: STYLE, ogTitle: `${y}년생 ${d.animal}띠 2027년 운세`,
      jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '2027 정미년 운세', url: SITE + '/2027/' }, { name: `${d.animal}띠`, url: SITE + url }, { name: `${y}년생`, url: SITE + url2 }]), article({ title: title2, desc: desc2, url: url2 }),
        faq([
          [`${y}년생은 2027년에 몇 살인가요?`, `세는나이 ${age}세, 만나이는 생일 전 ${age - 2}세·생일 후 ${age - 1}세입니다. ${y}년생은 ${ganjiKor}년(${st.han}${br.han}) ${COLOR[g.s]} ${d.animal}띠입니다.`],
          [`${y}년생 ${d.animal}띠의 2027년 운세는?`, `연간 ${st.kor}${st.el}이 정화(丁火)와 만나는 ${S.name}이고, 띠로는 미(未)와 ${R.label} 관계입니다. ${firstSentence(S.overall)}`]
        ])],
      body: body2
    }));
    urls.push(SITE + url2);
  });
});

/* ---------- 일주 페이지 60 ---------- */
iljuList.forEach((e, i) => {
  const rel = '../../../';
  const st = M.STEMS[e.s], br = M.BRANCHES[e.b];
  const G = ILGAN_SEUN[e.s];
  const relKey = primaryRel(e.b, YB);
  const rels = relations(e.b, YB);
  const ilji = ILJI_TEXT[relKey] || ILJI_TEXT.none;
  const un = unseong(e.s, YB);
  const url = `/2027/ilju/${e.slug}/`;
  const title = `${e.kor}일주 2027년 운세 — 정미년 세운 ${G.sip}·${G.bsip}, ${G.pattern}`;
  const desc = `${e.kor}일주(${e.han})의 2027 정미년 운세. 정화(丁)는 ${G.sip}, 미토(未)는 ${G.bsip}로 오는 ${G.pattern}의 해. 일지 ${br.kor}와 미(未)의 관계 ${REL_KO[relKey]}, 12운성 ${un}, 열두 달 월별 흐름까지.`;
  const siblings = iljuList.filter((x) => x.s === e.s).map((x) => `<a href="${rel}2027/ilju/${x.slug}/"${x === e ? ' class="cur"' : ''}><b>${x.han}</b><small>${x.kor}일주</small></a>`).join('\n        ');
  const prev = iljuList[(i + 59) % 60], next = iljuList[(i + 1) % 60];
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}2027/" style="color: inherit; text-decoration: none;">2027 정미년 운세</a> · 일주별 · ${i + 1} / 60</div>
    ${hero('2 0 2 7 · 丁未年', e.han, `${e.kor}일주 — ${esc(e.alias)}`, `<span class="ny-tag good">정화 ${G.sip}</span><span class="ny-tag">미토 ${G.bsip}</span><span class="ny-tag ${REL[relKey] ? REL[relKey].badge : 'neutral'}">일지 ${REL_KO[relKey]}</span><span class="ny-tag">12운성 ${un}</span>`)}
    <h1 class="ga-title">${e.kor}일주 2027년 운세 —<br>${G.pattern}의 해</h1>
    <div class="ny-meta"><span>일간 <b>${st.kor}${st.el}</b></span><span>일지 <b>${br.kor}${br.el}</b></span><span>세운 천간 丁 <b>${G.sip}</b></span><span>세운 지지 未 <b>${G.bsip}</b></span><span>12운성 <b>${un}</b></span></div>
    <p class="ga-meta">사주첩 · 2027 신년운세 · <a href="${rel}ilju/${e.slug}/">${e.kor}일주 사전</a></p>
    <p class="ga-lead">${esc(e.core.split('. ')[0])}. 그런 ${e.kor}일주에게 2027년은 정화(丁)가 ${G.sip}, 미토(未)가 ${G.bsip}로 오는 해입니다.</p>

    <div class="ga-body">
      <h2>2027 세운의 구조 — ${G.pattern}</h2>
      <p>${esc(G.text)}</p>
      <h2>재물운</h2>
      <p>${esc(G.money)}</p>
      <h2>직장·학업운</h2>
      <p>${esc(G.work)}</p>
      <h2>일지 ${br.kor}(${br.han})와 미(未) — 배우자·가정·터전</h2>
      <p>${esc(ilji)}${rels.length > 1 ? ` (${rels.map((k) => REL_KO[k]).join('·')}이 함께 듭니다.)` : ''}</p>
      <p>${esc(UN_TEXT[un])}</p>

      <h2>월별 흐름 — 열두 달의 결</h2>
      <p>정미년 열두 달의 월건(月建)을 ${e.kor}일주 기준으로 읽었습니다. 월간은 일간 ${st.kor}${st.el} 기준 십성, 월지는 일지 ${br.kor}(${br.han})와의 관계입니다. 달의 경계는 절기라 날짜를 함께 적었어요.</p>
      <ul class="ny-months">
        ${monthRows(e.b, e.s)}
      </ul>

      <h2>같은 ${st.kor}${st.el} 일간의 여섯 일주</h2>
      <p>일간이 같으면 정화(丁)를 맞는 별은 같고(${G.sip}), 일지에 따라 미(未)와의 관계와 12운성이 달라집니다.</p>
      <div class="ny-grid">
        ${siblings}
      </div>
      <p class="callout">← <a href="${rel}2027/ilju/${prev.slug}/">${prev.kor}일주</a> · <a href="${rel}2027/ilju/${next.slug}/">${next.kor}일주</a> → · <a href="${rel}2027/ilju/">60일주 2027 운세 전체</a> · <a href="${rel}ilju/${e.slug}/">${e.kor}일주 성격·연애·궁합</a> · <a href="${rel}2027/ddi/">띠별 2027 운세</a></p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>내 일주가 ${e.kor}일주인지 확인하기</span></a>
      <p class="form-microcopy" style="margin-top: 10px;">생년월일만 넣으면 10초. 절기 시각과 야자시까지 반영한 만세력으로 일주를 세우고, 2027 세운을 여덟 글자 전체로 읽습니다.</p>
    </div>
  </article>`;
  write(url.slice(1), shell({
    rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: `${e.kor}일주 2027년 운세 — ${G.pattern}`,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '2027 정미년 운세', url: SITE + '/2027/' }, { name: '60일주별', url: SITE + '/2027/ilju/' }, { name: `${e.kor}일주`, url: SITE + url }]), article({ title, desc, url }),
      faq([
        [`${e.kor}일주의 2027년 운세는 어떤가요?`, `정화(丁)가 ${G.sip}, 미토(未)가 ${G.bsip}로 오는 ${G.pattern}의 해입니다. ${firstSentence(G.text.split('. ').slice(1).join('. ') || G.text)}`],
        [`${e.kor}일주의 일지와 2027년 미(未)의 관계는?`, `일지 ${br.kor}(${br.han})와 미(未)는 ${REL_KO[relKey]} 관계이고, 일간 ${st.kor}${st.el}의 12운성으로 미(未)는 ${un}의 자리입니다.`]
      ])],
    body
  }));
  urls.push(SITE + url);
});

/* ---------- 인덱스: 띠별 ---------- */
{
  const rel = '../../';
  const url = '/2027/ddi/';
  const cells = DDI.map((d, b) => `<a href="${rel}2027/ddi/${d.slug}/"><b>${d.han}</b><small>${d.animal}띠<br>${REL[d.rel].label}${d.samjae ? ' · ' + d.samjae : ''}</small></a>`).join('\n        ');
  const yearTable = [];
  for (let y = BIRTH_TO; y >= BIRTH_FROM; y--) {
    const g = ganjiOfYear(y), d = DDI[g.b], st = M.STEMS[g.s];
    yearTable.push(`<tr><td><a href="${rel}2027/ddi/${d.slug}/${y}/">${y}년생</a></td><td>${COLOR[g.s]} ${d.animal}띠 <small>${st.kor}${M.BRANCHES[g.b].kor}년</small></td><td>세는나이 ${Y - y + 1}세</td><td><span class="ny-tag ${REL[d.rel].badge}">${REL[d.rel].label}</span></td></tr>`);
  }
  const title = '2027년 띠별 운세 — 12띠 정미년 운세와 출생연도별 흐름';
  const desc = '2027 정미년(丁未) 띠별 운세. 미(未)와 육합인 말띠, 삼합인 토끼·돼지띠, 충인 소띠, 형인 개띠, 해인 쥐띠, 본명년 양띠까지 12띠의 총운·재물·애정·직장·건강과 월별 흐름, 1945~2010년생 출생연도별 운세.';
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}2027/" style="color: inherit; text-decoration: none;">2027 정미년 운세</a> · 띠별</div>
    ${hero('2 0 2 7 · 丁未年', '十二支', '띠별로 보는 정미년 — 미(未)와의 관계 기준')}
    <h1 class="ga-title">2027년 띠별 운세 —<br>열두 띠가 맞는 붉은 양의 해</h1>
    <p class="ga-meta">사주첩 · 2027 신년운세</p>
    <p class="ga-lead">띠는 태어난 해의 지지 한 글자입니다. 2027년의 미(未)와 그 글자가 합하는지, 부딪히는지, 무심히 지나가는지가 띠별 운세의 뼈대예요. 육합인 말띠와 삼합인 토끼·돼지띠에 인연과 결실의 기운이, 축미충인 소띠에 변동이, 본명년인 양띠에 책임이 듭니다. ${ipchunLine}</p>
    <div class="ga-body">
      <h2>12띠 2027년 운세</h2>
      <div class="ny-grid four">
        ${cells}
      </div>
      <h2>2027년 삼재</h2>
      <p>${esc(SAMJAE_TEXT['날삼재'])} <a href="${rel}samjae/">내 삼재 기간 계산하기</a></p>
      <h2>출생연도별 2027년 운세</h2>
      <p>같은 띠라도 태어난 해의 천간이 다르면 정화(丁火)를 다르게 맞습니다. 내 출생연도로 바로 들어가세요.</p>
      <table class="ny-years">
        <thead><tr><th>출생연도</th><th>띠·연주</th><th>2027년 나이</th><th>미(未)와</th></tr></thead>
        <tbody>
          ${yearTable.join('\n          ')}
        </tbody>
      </table>
      <p class="callout"><a href="${rel}2027/">정미년 운세 허브</a> · <a href="${rel}2027/ilju/">60일주별 2027 운세</a> · <a href="${rel}tojeong/">2027 토정비결</a> · <a href="${SAENGIL}/ddi/">생일첩 띠별 해 목록</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>띠 말고 내 사주로 2027 보기</span></a>
    </div>
  </article>`;
  write(url.slice(1), shell({ rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: '2027년 띠별 운세',
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '2027 정미년 운세', url: SITE + '/2027/' }, { name: '띠별 운세', url: SITE + url }]), article({ title, desc, url })], body }));
  urls.unshift(SITE + url);
}

/* ---------- 인덱스: 일주별 ---------- */
{
  const rel = '../../';
  const url = '/2027/ilju/';
  const groups = M.STEMS.map((st, s) => {
    const G = ILGAN_SEUN[s];
    const cells = iljuList.filter((x) => x.s === s).map((x) => `<a href="${rel}2027/ilju/${x.slug}/"><b>${x.han}</b><small>${x.kor}일주<br>일지 ${REL_KO[primaryRel(x.b, YB)]} · ${unseong(x.s, YB)}</small></a>`).join('\n        ');
    return `<div class="ny-group"><h2>${st.kor}${st.el}(${st.han}) 일간 <span class="ny-tag good">정화 ${G.sip}</span> <span class="ny-tag">미토 ${G.bsip}</span> <span class="ny-tag">${G.pattern}</span></h2><div class="ny-grid">\n        ${cells}\n      </div></div>`;
  }).join('\n');
  const title = '2027년 60일주 운세 — 내 일주로 보는 정미년 세운';
  const desc = '태어난 날의 두 글자, 일주 60가지로 읽는 2027 정미년 운세. 일간별로 정화(丁)와 미토(未)가 어떤 십성으로 오는지(상관생재·식신생재·관인상생·재생관…), 일지와 미(未)의 합충, 12운성, 월별 흐름까지.';
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}2027/" style="color: inherit; text-decoration: none;">2027 정미년 운세</a> · 일주별</div>
    ${hero('2 0 2 7 · 丁未年', '六十日柱', '일주별로 보는 정미년 — 일간이 정화(丁)를 맞는 별')}
    <h1 class="ga-title">2027년 60일주 운세 —<br>내 일간이 정화(丁)를 어떤 별로 맞는가</h1>
    <p class="ga-meta">사주첩 · 2027 신년운세 · 일간 10 × 일지 12</p>
    <p class="ga-lead">띠는 태어난 해의 한 글자지만, 사주의 주인공은 태어난 날의 천간인 일간입니다. 같은 정미년도 갑목에게는 상관생재의 해, 경금에게는 관인상생의 해, 임수에게는 재생관의 해로 전혀 다르게 옵니다. 내 일주를 모르면 <a href="${rel}">생일만 넣으면 10초</a>에 나오고, 60일주의 성격은 <a href="${rel}ilju/">일주 사전</a>에 있습니다.</p>
    <div class="ga-body">
      ${groups}
      <p class="callout"><a href="${rel}2027/">정미년 운세 허브</a> · <a href="${rel}2027/ddi/">띠별 2027 운세</a> · <a href="${rel}guide/sipseong.html">십성 한눈에</a> · <a href="${rel}ilju/">60일주 사전</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}"><span class="seal-dot" aria-hidden="true"></span><span>내 일주 확인하고 2027 보기</span></a>
    </div>
  </article>`;
  write(url.slice(1), shell({ rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: '2027년 60일주 운세',
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '2027 정미년 운세', url: SITE + '/2027/' }, { name: '60일주별 운세', url: SITE + url }]), article({ title, desc, url })], body }));
  urls.unshift(SITE + url);
}

/* ---------- 사이트맵 + robots ---------- */
fs.writeFileSync(path.join(DOCS, 'sitemap-2027.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${u}</loc><lastmod>${PUBLISHED}</lastmod></url>`)).concat(['</urlset>', '']).join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-2027.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-2027.xml\n');

/* 허브 페이지용 슬러그·월건 표 */
fs.writeFileSync(path.join(DOCS, 'js', 'ny2027-slugs.js'), '/* 2027 띠 slug — tools/build-2027.mjs 가 생성 */\nwindow.NY2027_DDI = ' + JSON.stringify(DDI.map((d) => d.slug)) + ';\n');
console.log(`2027 정미년 운세 — 띠 ${DDI.length} + 출생연도 ${urls.length - 2 - DDI.length - 60} + 일주 60 + 인덱스 2 = ${urls.length}장, sitemap-2027.xml · 입춘 ${IPCHUN.y}-${IPCHUN.m}-${IPCHUN.d} ${pad2(IPCHUN.hh)}:${pad2(IPCHUN.mm)} · 월건 ${MONTHS.map((m) => M.STEMS[m.stem].han + M.BRANCHES[m.branch].han).join(' ')}`);
