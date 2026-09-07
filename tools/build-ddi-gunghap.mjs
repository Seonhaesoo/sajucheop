/* 띠 궁합 — /ddi-gunghap/<a>-<b>/ 78장(순서 없는 짝, 지지 순) + /ddi-gunghap/<띠>/ 12장 + 인덱스 + sitemap-ddi-gunghap.xml
 * 태어난 해의 지지 관계(육합·삼합·방합·충·형·해·파·원진)와 오행 상생상극으로 점수와 풀이를 조합한다.
 * 사용: node tools/build-ddi-gunghap.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { DDI, TRAIT, REL, GH_REL, GH_EL, EL_HAN, SAMHAP_G, SAMHAP_NAME, BANGHAP_G, BANGHAP_NAME, relations, elRelation, grade, josa } from './ddi-data.mjs';

const { M } = loadEngine();

const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const SAENGIL = 'http://saengil.sajucheop.com';
const PUBLISHED = '2026-09-08';
const urls = [];
const pairUrl = (a, b) => a <= b ? `/ddi-gunghap/${DDI[a].slug}-${DDI[b].slug}/` : `/ddi-gunghap/${DDI[b].slug}-${DDI[a].slug}/`;
const ddiUrl = (a) => `/ddi-gunghap/${DDI[a].slug}/`;
const NAV = (rel) => [{ href: rel, label: '사주 보기' }, { href: rel + 'gunghap/', label: '일간 궁합' }, { href: rel + 'today/ddi/', label: '띠별 운세' }];
const STYLE = `<style>
    .gh-hero { margin: 0 0 18px; padding: 22px 20px; background: #221D17; border-radius: 14px; text-align: center; color: #F6F1E8; }
    .gh-hero .gh-pair { font-family: 'Noto Serif KR', serif; font-size: 30px; font-weight: 700; letter-spacing: 2px; }
    .gh-hero .gh-score { font-size: 52px; font-weight: 700; margin: 6px 0 0; color: #E0B04A; line-height: 1.1; }
    .gh-hero .gh-grade { font-size: 14px; color: #CFC5B4; margin-top: 4px; }
    .gh-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 12px; }
    .gh-badge { font-size: 12px; padding: 3px 10px; border-radius: 999px; border: 1px solid rgba(246,241,232,.35); color: #F6F1E8; }
    .gh-badge.good { border-color: #E0B04A; color: #E0B04A; } .gh-badge.bad { border-color: #E07A6A; color: #E07A6A; }
    .gh-bar { height: 8px; border-radius: 999px; background: rgba(246,241,232,.15); margin: 14px auto 0; max-width: 320px; overflow: hidden; }
    .gh-bar i { display: block; height: 100%; background: #E0B04A; }
    .gh-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 8px 0 4px; }
    .gh-two div { padding: 12px 14px; background: #FFFDF9; border: 1px solid var(--line-soft); border-radius: 10px; font-size: 13.5px; line-height: 1.6; }
    .gh-two b { display: block; font-family: 'Noto Serif KR', serif; font-size: 15px; margin-bottom: 4px; }
    .gh-table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 6px 0 4px; }
    .gh-table th, .gh-table td { padding: 8px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; }
    .gh-table th { font-weight: 500; color: var(--faint); font-size: 12px; }
    .gh-table .sc { font-weight: 700; } .gh-table .good { color: #1E5C46; } .gh-table .bad { color: var(--seal); }
    .gh-matrix { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
    .gh-matrix th, .gh-matrix td { padding: 5px 2px; text-align: center; border: 1px solid var(--line-soft); }
    .gh-matrix th { font-weight: 500; color: var(--faint); }
    .gh-matrix a { text-decoration: none; color: inherit; display: block; }
    .gh-matrix .g3 { background: #E9F3EC; } .gh-matrix .g2 { background: #F4F7F0; } .gh-matrix .g1 { background: #FBF3E6; } .gh-matrix .g0 { background: #F8E7E2; }
    .gh-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0 0; }
    .gh-chips a { font-size: 12.5px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--line); text-decoration: none; color: inherit; background: #FFFDF9; }
    @media (max-width: 480px) { .gh-two { grid-template-columns: 1fr; } .gh-matrix { font-size: 10.5px; } }
  </style>`;

function write(relPath, html) {
  const file = path.join(DOCS, relPath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
const fill = (s, m) => s.replace(/\{(\w+)\}/g, (_, k) => m[k] == null ? '' : m[k]);

/* ---------- 점수 ---------- */
export function pairScore(a, b) {
  const rels = relations(a, b);
  let s = 60;
  for (const r of rels) s += REL[r].score;
  const er = elRelation(DDI[a].el, DDI[b].el);
  if (er === 'gen' || er === 'gen_by') s += 6;
  else if (er === 'ctl' || er === 'ctl_by') s -= 6;
  else if (er === 'same' && a !== b) s += 3;
  return { score: Math.max(25, Math.min(98, s)), rels, er };
}
const primary = (rels) => rels.find((r) => r !== 'same' && r !== 'selfhyeong') || rels[0] || 'none';
const name = (i) => `${DDI[i].animal}띠`;

/* ---------- 짝 페이지 ---------- */
function pairPage(a, b) {
  const A = DDI[a], B = DDI[b], url = pairUrl(a, b), rel = '../../';
  const { score, rels, er } = pairScore(a, b);
  const g = grade(score);
  const p = primary(rels);
  const R = GH_REL[p] || GH_REL.none;
  const map = { A: name(a), B: name(b), ah: `${M.BRANCHES[a].kor}(${A.han})`, bh: `${M.BRANCHES[b].kor}(${B.han})`, ae: A.el, be: B.el, aeh: EL_HAN[A.el], beh: EL_HAN[B.el], group: p === 'samhap' ? SAMHAP_NAME[SAMHAP_G[a]] : p === 'banghap' ? BANGHAP_NAME[BANGHAP_G[a]] : '' };
  const relText = josa(fill(R.body, map));
  const elText = josa(fill(GH_EL[er], map));
  const extra = rels.filter((r) => r !== p && r !== 'same').map((r) => `여기에 ${REL[r].label}(${REL[r].han})까지 겹쳐 ${REL[r].tone === 'good' ? '끌림이 더해집니다' : '마찰의 결도 함께 있습니다'}.`).join(' ');
  const title = a === b ? `${name(a)}끼리 궁합 — ${score}점 ${g.label}` : `${name(a)}와 ${name(b)} 궁합 — ${score}점 ${g.label} (${name(b)} ${name(a)} 궁합)`;
  const desc = `${name(a)}(${A.han})와 ${name(b)}(${B.han})의 띠 궁합은 ${score}점, ${g.label}. ${rels.length ? rels.map((r) => REL[r].label).join('·') + '의 관계에 ' : ''}${A.el}과 ${B.el}의 ${er === 'same' ? '같은 오행' : (er === 'gen' || er === 'gen_by') ? '상생' : '상극'} 흐름. 연애·결혼·친구·가족으로 만났을 때와 잘 지내는 법.`;
  const partnersA = DDI.map((_, i) => ({ i, s: pairScore(a, i).score })).filter((x) => x.i !== b).sort((x, y) => y.s - x.s);
  const partnersB = DDI.map((_, i) => ({ i, s: pairScore(b, i).score })).filter((x) => x.i !== a).sort((x, y) => y.s - x.s);
  const badges = rels.map((r) => `<span class="gh-badge ${REL[r].tone}">${REL[r].label}(${REL[r].han})</span>`).join('') + `<span class="gh-badge">${A.el}(${EL_HAN[A.el]}) · ${B.el}(${EL_HAN[B.el]}) ${er === 'same' ? '같은 오행' : (er === 'gen' || er === 'gen_by') ? '상생' : '상극'}</span>`;
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}ddi-gunghap/" style="color: inherit; text-decoration: none;">띠 궁합</a> · <a href="${rel}ddi-gunghap/${A.slug}/" style="color: inherit; text-decoration: none;">${name(a)}</a>${a !== b ? ` · <a href="${rel}ddi-gunghap/${B.slug}/" style="color: inherit; text-decoration: none;">${name(b)}</a>` : ''}</div>
    <h1 class="ga-title">${a === b ? `${name(a)}끼리 궁합` : `${name(a)}와 ${name(b)} 궁합`} —<br>${R.title}</h1>
    <p class="ga-meta">태어난 해의 지지 ${A.han}(${A.el})와 ${B.han}(${B.el}) · 사주첩</p>
    <div class="gh-hero">
      <div class="gh-pair">${A.han} · ${B.han}</div>
      <div class="gh-score">${score}<span style="font-size: 20px;">점</span></div>
      <div class="gh-grade">${g.label}</div>
      <div class="gh-bar"><i style="width: ${score}%"></i></div>
      <div class="gh-badges">${badges}</div>
    </div>
    <p class="ga-lead">${esc(relText.split('. ')[0])}. ${esc(elText.split('. ')[0])}.</p>

    <div class="ga-body">
      <h2>두 사람의 결</h2>
      <div class="gh-two">
        <div><b>${name(a)} — ${TRAIT[A.slug].key}</b>${esc(TRAIT[A.slug].short)}</div>
        <div><b>${name(b)} — ${TRAIT[B.slug].key}</b>${esc(TRAIT[B.slug].short)}</div>
      </div>

      <h2>관계의 구조 — ${R.title}</h2>
      <p>${esc(relText)} ${esc(extra)}</p>
      <h2>오행의 흐름</h2>
      <p>${esc(elText)}</p>

      <h2>연애·결혼이라면</h2>
      <p>${esc(R.love)} ${name(a)}는 ${esc(TRAIT[A.slug].love)} ${name(b)}는 ${esc(TRAIT[B.slug].love)}</p>
      <h2>친구·동료라면</h2>
      <p>${esc(R.friend)} 일에서 ${name(a)}는 ${esc(TRAIT[A.slug].work)} ${name(b)}는 ${esc(TRAIT[B.slug].work)}</p>
      <h2>부모·자식이라면</h2>
      <p>${esc(R.family)} ${name(a)}의 약점은 ${esc(TRAIT[A.slug].weak)} ${name(b)}는 ${esc(TRAIT[B.slug].weak)} 서로의 약점을 알고 있으면 절반은 풀립니다.</p>

      <h2>잘 지내려면</h2>
      <ul class="dp-list">
        ${R.advice.map((x) => `<li>${esc(x)}</li>`).join('\n        ')}
      </ul>

      <h2>${name(a)}의 다른 궁합</h2>
      <div class="gh-chips">${partnersA.map((x) => `<a href="${rel}ddi-gunghap/${pairUrl(a, x.i).split('/')[2]}/">${name(x.i)} ${x.s}점</a>`).join('')}</div>
      ${a !== b ? `<h2>${name(b)}의 다른 궁합</h2>
      <div class="gh-chips">${partnersB.map((x) => `<a href="${rel}ddi-gunghap/${pairUrl(b, x.i).split('/')[2]}/">${name(x.i)} ${x.s}점</a>`).join('')}</div>` : ''}

      <p class="callout">띠 궁합은 태어난 해의 지지 한 글자로 보는 약식입니다. 두 사람의 생년월일을 다 넣으면 일간·일지·오행 균형까지 본 <a href="${rel}gunghap/">일간 궁합</a>이 나오고, 각자의 오늘은 <a href="${rel}today/ddi/${A.slug}/">${name(a)}</a>·<a href="${rel}today/ddi/${B.slug}/">${name(b)} 오늘의 운세</a>에서, 내년 흐름은 <a href="${rel}2027/ddi/${A.slug}/">${name(a)} 2027년 운세</a>에서 볼 수 있습니다. 띠의 경계(입춘 전후 출생)는 <a href="${SAENGIL}/ddi/${A.slug}/">생일 사전</a>에서 확인하세요.</p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}gunghap/"><span class="seal-dot" aria-hidden="true"></span><span>생년월일로 정확한 궁합 보기</span></a>
    </div>
  </article>`;
  write(url.slice(1), shell({
    rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, ogTitle: `${name(a)} ${name(b)} 궁합 ${score}점`,
    jsonld: [breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '띠 궁합', url: SITE + '/ddi-gunghap/' }, { name: `${name(a)} ${name(b)}`, url: SITE + url }]),
      { '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: PUBLISHED, dateModified: PUBLISHED, inLanguage: 'ko', author: { '@type': 'Organization', name: '사주첩' }, publisher: { '@type': 'Organization', name: '사주첩' }, mainEntityOfPage: SITE + url }],
    body
  }));
  urls.push(url);
}

/* ---------- 띠별 인덱스 ---------- */
function ddiPage(a) {
  const A = DDI[a], url = ddiUrl(a), rel = '../../';
  const list = DDI.map((_, i) => ({ i, ...pairScore(a, i) })).sort((x, y) => y.score - x.score);
  const best = list[0], worst = list[list.length - 1];
  const title = `${name(a)} 궁합 — 잘 맞는 띠와 안 맞는 띠 12가지 순위`;
  const desc = `${name(a)}(${A.han}·${A.el})와 가장 잘 맞는 띠는 ${name(best.i)}(${best.score}점), 가장 부딪히는 띠는 ${name(worst.i)}(${worst.score}점). 12띠 전체 궁합 점수와 육합·삼합·충·형 관계, 연애·결혼·친구로 만났을 때.`;
  const rows = list.map((x) => { const g = grade(x.score); return `<tr><td><a href="${rel}ddi-gunghap/${pairUrl(a, x.i).split('/')[2]}/">${name(x.i)}</a></td><td class="sc ${g.tone === 'good' ? 'good' : g.tone === 'bad' || g.tone === 'warn' ? 'bad' : ''}">${x.score}점</td><td>${g.label}</td><td>${x.rels.map((r) => REL[r].label).join('·') || '무난'}</td></tr>`; }).join('\n        ');
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}ddi-gunghap/" style="color: inherit; text-decoration: none;">띠 궁합</a> · ${name(a)}</div>
    <h1 class="ga-title">${name(a)} 궁합 —<br>잘 맞는 띠, 부딪히는 띠</h1>
    <p class="ga-meta">${A.han}(${A.el}) · ${TRAIT[A.slug].key}</p>
    <p class="ga-lead">${esc(TRAIT[A.slug].short)} ${name(a)}와 가장 잘 맞는 띠는 <b>${name(best.i)}</b>(${best.score}점, ${best.rels.map((r) => REL[r].label).join('·')}), 가장 부딪히는 띠는 <b>${name(worst.i)}</b>(${worst.score}점, ${worst.rels.map((r) => REL[r].label).join('·')})입니다.</p>
    <div class="ga-body">
      <h2>12띠 궁합 순위</h2>
      <table class="gh-table">
        <tr><th>상대 띠</th><th>점수</th><th>등급</th><th>관계</th></tr>
        ${rows}
      </table>
      <h2>${name(a)}는 어떤 사람</h2>
      <p><b>연애</b> — ${esc(TRAIT[A.slug].love)}</p>
      <p><b>일</b> — ${esc(TRAIT[A.slug].work)}</p>
      <p><b>조심할 것</b> — ${esc(TRAIT[A.slug].weak)}</p>
      <h2>${name(a)}의 합과 충</h2>
      <p>${josa(`${M.BRANCHES[a].kor}(${A.han})은`)} ${name(list.find((x) => x.rels.includes('yukhap')).i)}의 지지와 육합(六合), ${list.filter((x) => x.rels.includes('samhap')).map((x) => name(x.i)).join('·')}와 삼합(三合)을 이루고, ${name(list.find((x) => x.rels.includes('chung')).i)}와는 충(沖)입니다. 합은 끌림과 협력, 충은 변화와 마찰의 기운입니다.</p>
      <p class="callout"><a href="${rel}today/ddi/${A.slug}/">${name(a)} 오늘의 운세</a> · <a href="${rel}2027/ddi/${A.slug}/">${name(a)} 2027년 운세</a> · <a href="${SAENGIL}/ddi/${A.slug}/">${name(a)} 출생연도와 나이 (생일 사전)</a> · <a href="${rel}gunghap/">생년월일 궁합</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}gunghap/"><span class="seal-dot" aria-hidden="true"></span><span>생년월일로 정확한 궁합 보기</span></a>
    </div>
  </article>`;
  write(url.slice(1), shell({ rel, title, desc, canonical: SITE + url, nav: NAV(rel), extraHead: STYLE, jsonld: breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '띠 궁합', url: SITE + '/ddi-gunghap/' }, { name: name(a), url: SITE + url }]), body }));
  urls.push(url);
}

/* ---------- 인덱스 (12×12 표) ---------- */
function indexPage() {
  const rel = '../';
  const cls = (s) => s >= 80 ? 'g3' : s >= 65 ? 'g2' : s >= 50 ? 'g1' : 'g0';
  const head = DDI.map((d) => `<th>${d.animal}</th>`).join('');
  const rows = DDI.map((d, a) => `<tr><th><a href="${rel}ddi-gunghap/${d.slug}/">${d.animal}띠</a></th>${DDI.map((_, b) => { const s = pairScore(a, b).score; return `<td class="${cls(s)}"><a href="${rel}ddi-gunghap/${pairUrl(a, b).split('/')[2]}/">${s}</a></td>`; }).join('')}</tr>`).join('\n        ');
  const title = '띠 궁합표 — 12띠 × 12띠 점수와 잘 맞는 띠';
  const desc = '쥐띠부터 돼지띠까지 12띠 × 12띠 궁합 점수를 한 표로. 육합·삼합·방합·충·형·해·파·원진과 오행 상생상극으로 계산했고, 칸을 누르면 연애·결혼·친구·가족으로 만났을 때의 풀이가 나옵니다.';
  const body = `
  <article class="guide-article">
    <div class="ga-overline">띠 궁합</div>
    <h1 class="ga-title">띠 궁합표 —<br>12띠 × 12띠</h1>
    <p class="ga-meta">태어난 해의 지지로 보는 약식 궁합 · 점수는 합충 관계와 오행으로 계산</p>
    <p class="ga-lead">띠 궁합은 태어난 해의 지지(地支) 두 글자가 어떤 관계인지로 봅니다. 서로를 짝으로 알아보는 <b>육합</b>, 뜻이 모이는 <b>삼합</b>은 잘 맞는 자리이고, 정면으로 마주 보는 <b>충</b>, 서로를 깎는 <b>형</b>, 이유 없이 서운한 <b>원진</b>은 부딪히는 자리입니다. 여기에 두 띠의 오행이 상생인지 상극인지를 더해 점수를 냈습니다.</p>
    <div class="ga-body">
      <h2>궁합표</h2>
      <div style="overflow-x: auto;"><table class="gh-matrix">
        <tr><th></th>${head}</tr>
        ${rows}
      </table></div>
      <p style="font-size: 12px; color: var(--faint);">80점 이상 초록 · 65~79 연두 · 50~64 노랑 · 50 미만 분홍. 표는 대칭이라 어느 쪽에서 찾아도 같습니다.</p>
      <h2>띠별로 보기</h2>
      <div class="gh-chips">${DDI.map((d, a) => `<a href="${rel}ddi-gunghap/${d.slug}/">${d.animal}띠 궁합</a>`).join('')}</div>
      <h2>관계 읽는 법</h2>
      <ul class="dp-list">
        <li><b>육합(六合)</b> 자축·인해·묘술·진유·사신·오미 — 열두 지지가 짝을 이루는 자리. 가장 잘 맞는 궁합으로 봅니다.</li>
        <li><b>삼합(三合)</b> 신자진·해묘미·인오술·사유축 — 같은 국(局)을 이루는 세 지지. 목표가 같을 때 힘이 배가 됩니다.</li>
        <li><b>방합(方合)</b> 인묘진·사오미·신유술·해자축 — 같은 계절의 이웃. 결이 비슷해 편안합니다.</li>
        <li><b>충(沖)</b> 자오·축미·인신·묘유·진술·사해 — 정반대 자리. 끌림과 마찰이 함께 있습니다.</li>
        <li><b>형(刑)</b> 인사신·축술미·자묘, 자형 진오유해 — 서로를 다듬고 찌르는 자리.</li>
        <li><b>해(害)·파(破)·원진(怨嗔)</b> — 작은 손해, 마무리의 틈, 이유 없는 서운함. 큰 흉은 아니지만 밀도를 조절할 관계.</li>
      </ul>
      <p class="callout">띠는 입춘(2월 4일 전후)을 기준으로 바뀝니다. 1월이나 2월 초에 태어났다면 앞 해의 띠일 수 있으니 <a href="${SAENGIL}/">생일 사전</a>에서 확인하세요. 두 사람의 생년월일을 모두 알면 <a href="${rel}gunghap/">일간 궁합</a>이 훨씬 정확합니다.</p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${rel}gunghap/"><span class="seal-dot" aria-hidden="true"></span><span>생년월일로 정확한 궁합 보기</span></a>
    </div>
  </article>`;
  write('ddi-gunghap', shell({ rel, title, desc, canonical: SITE + '/ddi-gunghap/', nav: NAV(rel), extraHead: STYLE, jsonld: breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '띠 궁합', url: SITE + '/ddi-gunghap/' }]), body }));
  urls.push('/ddi-gunghap/');
}

/* ---------- 실행 ---------- */
indexPage();
for (let a = 0; a < 12; a++) ddiPage(a);
for (let a = 0; a < 12; a++) for (let b = a; b < 12; b++) pairPage(a, b);
const sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  .concat(urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${PUBLISHED}</lastmod></url>`)).concat(['</urlset>', '']).join('\n');
fs.writeFileSync(path.join(DOCS, 'sitemap-ddi-gunghap.xml'), sm);
const robotsPath = path.join(DOCS, 'robots.txt');
let robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-ddi-gunghap.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-ddi-gunghap.xml\n');
console.log(`띠 궁합 생성 완료 — ${urls.length}장 (짝 78 · 띠 12 · 인덱스 1)`);
