/* 유료 2027 개인 리포트 안내 페이지 — /report/2027/ (한국어, 크몽) · /en/report/2027/ (영어, 해외 판매처)
 * 리포트 생성기는 저장소 밖(개인 폴더)에 있다. 이 저장소에는 안내 페이지와 공개 샘플 그림(가상 인물 김하늘 님)만 둔다.
 * 판매 주소(STORE)가 비어 있으면 '판매 준비 중'으로 보이고 검색에서 뺀다(noindex). 주소가 생기면 채우고 다시 실행.
 * 샘플 그림: docs/report/2027/img/{ko,en}-pNN.png — 있으면 미리보기 갤러리를 그린다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { shell, breadcrumb, esc } from './page-shell.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');
const SITE = 'https://sajucheop.com';
const MODIFIED = '2026-10-08';
const STORE = { ko: 'https://sajucheop.gumroad.com/l/saju-2027-report', en: 'https://sajucheop.gumroad.com/l/bazi-2027-report' };   /* Gumroad 상품 주소(한국어판·영어판) — 등록되면 채운다 */
const API = 'https://sajucheop-report.sajucheop-push.workers.dev';   /* 즉시 생성 서버(개인 폴더 SAZU-REPORT/worker) */
const PRICE = { ko: '9,900원', en: '$9' };
const IMG_DIR = path.join(DOCS, 'report', '2027', 'img');
const imgs = (lang) => (fs.existsSync(IMG_DIR) ? fs.readdirSync(IMG_DIR).filter((f) => f.startsWith(lang + '-p') && f.endsWith('.png')).sort() : []);

const STYLE = `
  <style>
    .rp-price { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 18px; margin: 18px 0 8px; padding: 16px 18px; border: 1px solid var(--line); border-radius: 12px; background: var(--paper, #FFFDF9); }
    .rp-price b.amt { font-family: var(--serif); font-size: 26px; color: var(--ink); }
    .rp-price span { color: var(--muted); font-size: 13.5px; }
    .rp-price .btn-primary { margin-left: auto; }
    .rp-soon { margin-left: auto; font-size: 13.5px; color: var(--seal); font-weight: 700; }
    .rp-toc { counter-reset: rp; list-style: none; padding: 0; margin: 10px 0 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; }
    .rp-toc li { padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; font-size: 14px; line-height: 1.5; }
    .rp-toc li b { display: block; font-size: 14.5px; }
    .rp-toc li small { color: var(--muted); }
    .rp-gal { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 12px 0 4px; }
    .rp-gal img { width: 100%; height: auto; border: 1px solid var(--line); border-radius: 6px; box-shadow: 0 2px 8px rgba(33,28,21,.06); background: #fff; }
    .rp-cmp { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 8px; }
    .rp-cmp th, .rp-cmp td { border-bottom: 1px solid var(--line); padding: 9px 6px; text-align: left; vertical-align: top; }
    .rp-cmp th { font-size: 13px; color: var(--muted); font-weight: 500; }
    .rp-steps { padding-left: 20px; } .rp-steps li { margin: 6px 0; }
    @media (max-width: 560px) { .rp-toc { grid-template-columns: 1fr; } .rp-gal { grid-template-columns: repeat(2, 1fr); } .rp-price .btn-primary, .rp-soon { margin-left: 0; } }
  </style>`;

const T = {
  ko: {
    url: '/report/2027/', rel: '../../', lang: 'ko',
    title: '2027 정미년 개인 리포트 — 내 여덟 글자로 쓴 35쪽 신년운세 PDF',
    desc: '생년월일시 여덟 글자와 지금 지나는 10년 운으로 2027년을 풀어 쓴 35쪽 PDF입니다. 열두 달 풀이, 365일 좋은 날 달력, 계약·이사·거래·만남에 좋은 날까지 담았고 주문 확인 뒤 바로 보내 드립니다. 9,900원.',
    crumb: '2027 개인 리포트', overline: '유료 리포트',
    h1: '2027 정미년 개인 리포트',
    lead: '생년월일시 여덟 글자로 2027년을 처음부터 끝까지 풀어 쓴 35쪽 PDF예요. 띠나 일주 하나로 보는 무료 운세와 달리 여덟 글자 전체와 지금 지나는 10년 운(대운)을 함께 읽고, 2027년 365일에 하루하루 점수를 매겨 좋은 날을 골라 드려요.',
    meta: 'PDF 35쪽 안팎 · 결제하면 바로 만들어져요',
    buy: '구매하기', soon: '판매 준비 중이에요. 곧 열려요.', made: '이미 구매했다면 리포트 만들기',
    tocH: '무엇이 들어 있나요',
    toc: [['한눈에 보는 2027년', '올해를 두 쪽으로'], ['내 여덟 글자', '사주표 · 다섯 가지 기운 · 역할'], ['나라는 사람', '성격과 강점'], ['사주 속 관계와 특별한 기운', '잘 맞는 글자, 부딪히는 글자'], ['10년마다 바뀌는 큰 운', '지금과 다음 10년'], ['2027년 전체 흐름', '올해의 기운과 내 사주'], ['분야별 2027년', '일 · 돈 · 사랑 · 건강 · 공부'], ['달마다 보기', '2027년 2월부터 2028년 1월까지 열두 달'], ['2027년 달력', '좋은 날과 조심할 날'], ['일의 종류별 좋은 날', '계약 · 이사 · 거래 · 만남'], ['2027년 실천 가이드', '힘이 되는 것 · 할 일 · 피할 일'], ['부록', '용어 풀이와 계산 기준']],
    galH: '샘플 미리보기', galNote: '가상 인물 김하늘 님(1995년 8월 12일 14시 20분, 여성)으로 만든 샘플의 일부예요.',
    cmpH: '무료 운세와 무엇이 다른가요',
    cmp: [['', '사주첩 무료 운세', '2027 개인 리포트'], ['기준', '띠나 일주 하나', '여덟 글자 전체와 지금의 10년 운'], ['같은 띠·일주끼리', '같은 내용', '사람마다 다른 내용'], ['날짜', '오늘·이번 달 중심', '2027년 365일 점수와 일의 종류별 좋은 날'], ['형태', '웹페이지', '이름이 들어간 35쪽 PDF, 인쇄용 판형']],
    howH: '주문 방법',
    how: ['구매하기를 눌러 결제해요. 결제는 해외 결제대행 Gumroad가 처리하고 한국 카드로 결제할 수 있어요.', '결제 완료 화면과 확인 메일에 나오는 구매 코드를 복사해요.', '리포트 만들기 화면에 구매 코드와 이름, 성별, 생년월일, 태어난 시각을 넣으면 몇 초 만에 리포트가 열리고 바로 PDF로 저장할 수 있어요.'],
    faqH: '자주 묻는 질문',
    faq: [
      ['태어난 시각을 몰라도 되나요?', '네. 시각을 모르면 여덟 글자 가운데 태어난 시의 두 글자를 빼고 여섯 글자로 계산해요. 시주에 기대는 풀이 몇 곳이 줄어들고, 리포트 안에 그 점을 적어 드려요.'],
      ['음력 생일도 되나요?', '네. 한국천문연구원 음력 기준으로 양력으로 바꿔 계산해요. 윤달에 태어났다면 꼭 윤달이라고 알려 주세요.'],
      ['개인정보는 어떻게 다루나요?', '생년월일은 리포트를 만드는 순간에만 쓰고 저장하지 않아요. 구매 코드 하나를 여러 사람이 쓰지 못하게 생년월일에서 만든 되돌릴 수 없는 서명값만 남겨요. 사주첩의 무료 계산기는 지금처럼 브라우저 안에서만 계산해요.'],
      ['다시 받을 수 있나요?', '네. 같은 구매 코드와 같은 생년월일로 언제든 다시 만들 수 있어요. 이름은 자유롭게 고칠 수 있고, 생년월일을 잘못 넣었다면 두 번까지 바꿀 수 있어요. 한국어판과 영어판 모두 만들 수 있어요.'],
      ['환불되나요?', '리포트를 만들기 전이면 전액 환불해 드려요. 사람마다 따로 만드는 디지털 상품이라 만든 뒤에는 환불이 어렵지만, 계산이나 정보에 오류가 있으면 고쳐 드려요. 인스타그램 @sajucheop 으로 알려 주세요.'],
      ['리포트 내용은 정해진 미래인가요?', '아니에요. 전통 명리학의 규칙으로 읽은 참고용 풀이예요. 건강·법률·투자 같은 중요한 결정은 전문가와 상의해 주세요.'],
    ],
    more: '궁금한 점은 인스타그램 <a href="https://www.instagram.com/sajucheop/" target="_blank" rel="noopener">@sajucheop</a> 다이렉트 메시지로 물어봐 주세요. 무료로 먼저 보고 싶다면 <a href="../../">사주 풀이 계산기</a>와 <a href="../../2027/">2027 띠별 운세</a>가 있어요.',
  },
  en: {
    url: '/en/report/2027/', rel: '../../../', lang: 'en',
    title: '2027 Personal BaZi Report — a 35-page PDF for your own Four Pillars',
    desc: 'A 35-page PDF that reads 2027, the Year of the Fire Goat, through your full Four Pillars chart and current 10-year luck cycle: month-by-month readings, a scored 365-day calendar and good days for contracts, moving, deals and dates. $9.',
    crumb: '2027 personal report', overline: 'Paid report',
    h1: '2027 Personal BaZi Report',
    lead: 'A 35-page PDF that reads your 2027 from all eight characters of your birth chart. Free zodiac readings look at one animal; this report reads your whole Four Pillars together with the 10-year luck cycle you are in now, scores every day of 2027 for you, and picks your good days.',
    meta: 'About 35 PDF pages · made the moment you pay',
    buy: 'Buy the report', soon: 'Coming soon. Orders open shortly.', made: 'Already bought? Make your report',
    tocH: 'What is inside',
    toc: [['Your 2027 at a glance', 'The year in two pages'], ['Your eight characters', 'Chart · five elements · roles'], ['Who you are', 'Character and strengths'], ['Connections and special stars', 'What gets along, what clashes'], ['Your 10-year luck cycles', 'This decade and the next'], ['The shape of 2027', 'This year’s energy meets your chart'], ['2027 by area', 'Work · money · love · health · study'], ['Month by month', 'February 2027 to January 2028'], ['Your 2027 calendar', 'Good days and days to watch'], ['Good days for big plans', 'Contracts · moving · deals · dates'], ['Your 2027 action guide', 'What helps · what to do · what to avoid'], ['Appendix', 'Glossary and how it is calculated']],
    galH: 'Sample pages', galNote: 'Pages from a sample made for a fictional reader, Haneul Kim (born August 12, 1995, 2:20 pm, female).',
    cmpH: 'How it differs from the free readings',
    cmp: [['', 'Free readings on Sajucheop', '2027 personal report'], ['Based on', 'One zodiac animal or day pillar', 'All eight characters plus your current luck cycle'], ['Two people with the same sign', 'Same text', 'Different reports'], ['Dates', 'Today and this month', 'All 365 days of 2027 scored, good days by purpose'], ['Format', 'Web page', 'A 35-page PDF with your name, print-ready']],
    howH: 'How to order',
    how: ['Click Buy and pay on Gumroad.', 'Copy the purchase code shown on the receipt page and in your email.', 'On the Make your report page, enter the code with your name, gender, birth date and time. Your report opens in seconds and you can save it as a PDF right away.'],
    faqH: 'Questions',
    faq: [
      ['What if I do not know my birth time?', 'The report is calculated from the other six characters and the hour pillar is left out. A few hour-based readings get shorter, and the report says so.'],
      ['Can I use a lunar birthday?', 'Yes. It is converted with the Korean astronomical (KASI) lunar calendar. If you were born in a leap month, please say so.'],
      ['What happens to my birth details?', 'They are used only while your report is being made and are not stored. To stop one code being shared, we keep only a one-way signature derived from them. The free calculators on Sajucheop still run entirely in your browser.'],
      ['Can I download it again?', 'Yes. Use the same code with the same birth details any time. You can change the name freely, and fix a mistyped birth date up to two times. Korean and English versions are both included.'],
      ['Can I get a refund?', 'Before your report is made, yes, in full. Once it is made, a personal digital report cannot be returned, but if anything is miscalculated we fix it. Message us on Instagram @sajucheop.'],
      ['Is this a prediction?', 'No. It is a reflective reading based on the rules of traditional Korean and Chinese astrology. Please make health, legal and money decisions with a professional.'],
    ],
    more: 'Questions? Send a direct message on Instagram <a href="https://www.instagram.com/sajucheop/" target="_blank" rel="noopener">@sajucheop</a>. Try the free <a href="../../">BaZi calculator</a> and the <a href="../../2027/">2027 zodiac forecast</a> first if you like.',
  },
};

function build(lang) {
  const t = T[lang];
  const live = !!STORE[lang];
  const rel = t.rel;
  const gal = imgs(lang);
  const buy = live
    ? `<a class="btn-primary" href="${esc(STORE[lang])}" target="_blank" rel="noopener" data-track="report_order"><span class="seal-dot" aria-hidden="true"></span><span>${t.buy}</span></a>`
    : `<span class="rp-soon">${t.soon}</span>`;
  const madeLink = `<p style="margin: 4px 0 0; font-size: 13.5px;"><a href="make/">${t.made} →</a></p>`;
  const body = `
  <article class="guide-article">
    <div class="ga-overline">${t.overline}</div>
    <h1 class="ga-title">${t.h1}</h1>
    <p class="ga-lead">${t.lead}</p>
    <div class="rp-price"><b class="amt">${PRICE[lang]}</b><span>${t.meta}</span>${buy}</div>
    ${live ? madeLink : ''}
    <div class="ga-body">
      <h2>${t.tocH}</h2>
      <ol class="rp-toc">
        ${t.toc.map(([a, b]) => `<li><b>${esc(a)}</b><small>${esc(b)}</small></li>`).join('\n        ')}
      </ol>
${gal.length ? `      <h2>${t.galH}</h2>
      <div class="rp-gal">
        ${gal.map((f) => `<img src="${rel}report/2027/img/${f}" width="1240" height="1754" loading="lazy" decoding="async" alt="${esc(t.galH)} ${f.replace(/\D/g, '')}">`).join('\n        ')}
      </div>
      <p style="font-size: 12.5px; color: var(--muted);">${t.galNote}</p>` : ''}
      <h2>${t.cmpH}</h2>
      <table class="rp-cmp">
        ${t.cmp.map((r, i) => `<tr>${r.map((c) => i === 0 ? `<th>${esc(c)}</th>` : `<td>${esc(c)}</td>`).join('')}</tr>`).join('\n        ')}
      </table>
      <h2>${t.howH}</h2>
      <ol class="rp-steps">
        ${t.how.map((x) => `<li>${esc(x)}</li>`).join('\n        ')}
      </ol>
      <div class="rp-price"><b class="amt">${PRICE[lang]}</b><span>${t.meta}</span>${buy}</div>
      <h2>${t.faqH}</h2>
      ${t.faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n      ')}
      <p class="callout">${t.more}</p>
    </div>
  </article>`;
  const other = lang === 'ko' ? T.en : T.ko;
  const html = shell({
    rel, lang, title: t.title, desc: t.desc, canonical: SITE + t.url, noindex: !live, ogTitle: t.h1,
    extraHead: STYLE + `\n  <link rel="alternate" hreflang="${lang}" href="${SITE}${t.url}">\n  <link rel="alternate" hreflang="${lang === 'ko' ? 'en' : 'ko'}" href="${SITE}${other.url}">`,
    jsonld: [
      breadcrumb([{ name: lang === 'ko' ? '사주첩' : 'Sajucheop', url: SITE + (lang === 'ko' ? '/' : '/en/') }, { name: t.crumb, url: SITE + t.url }]),
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    ],
    body,
  });
  const dir = path.join(DOCS, t.url);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  return `${t.url} ${live ? '판매 중' : '준비 중(noindex)'} · 샘플 그림 ${gal.length}장`;
}

/* ---------- 리포트 만들기 (구매 코드 + 생년월일 → 생성 서버 → 새 창에 리포트) ---------- */
const MK = {
  ko: {
    url: '/report/2027/make/', rel: '../../../', title: '2027 개인 리포트 만들기 — 구매 코드 입력', h1: '2027 개인 리포트 만들기',
    lead: '결제 완료 화면과 확인 메일에 있는 구매 코드, 그리고 생년월일을 넣으면 몇 초 만에 이 화면에 리포트가 열려요. 생년월일은 리포트를 만드는 순간에만 쓰고 저장하지 않아요.',
    key: '구매 코드', keyPh: '결제 확인 메일의 코드를 붙여 넣어 주세요', name: '이름 (리포트에 들어가요)', namePh: '예: 김하늘',
    gender: '성별', F: '여성', Mm: '남성', cal: '생일 달력', solar: '양력', lunar: '음력', leap: '윤달', date: '생년월일', time: '태어난 시각', noTime: '모름',
    lang: '리포트 언어', ko: '한국어', en: 'English', go: '리포트 만들기', busy: '만드는 중이에요. 몇 초 걸려요.',
    ok: '리포트가 새 창에 열렸어요. 위쪽의 <b>PDF로 저장</b>을 누르면 파일로 받을 수 있어요. 같은 코드와 생년월일로 언제든 다시 만들 수 있어요.',
    blocked: '새 창이 막혔어요. 아래에서 리포트를 열어 주세요.', open: '리포트 열기',
    note: '구매 코드 하나에 한 사람의 생년월일로 만들 수 있어요. 이름은 자유롭게 고칠 수 있고, 생년월일을 잘못 넣었다면 두 번까지 바꿀 수 있어요. 태어난 시각을 모르면 "모름"을 고르세요.',
    back: '<a href="../">리포트 안내로 돌아가기</a> · 문제가 생기면 인스타그램 <a href="https://www.instagram.com/sajucheop/" target="_blank" rel="noopener">@sajucheop</a>',
    err: '연결이 원활하지 않아요. 잠시 뒤 다시 해 주세요.',
  },
  en: {
    url: '/en/report/2027/make/', rel: '../../../../', title: 'Make your 2027 personal report — enter your purchase code', h1: 'Make your 2027 report',
    lead: 'Enter the purchase code from your receipt page or email along with your birth details. Your report opens on this page within seconds. Your birth details are used only while the report is being made and are not stored.',
    key: 'Purchase code', keyPh: 'Paste the code from your receipt email', name: 'Name (printed on the report)', namePh: 'e.g. Haneul Kim',
    gender: 'Gender', F: 'Female', Mm: 'Male', cal: 'Calendar', solar: 'Solar (Gregorian)', lunar: 'Lunar', leap: 'Leap month', date: 'Birth date', time: 'Birth time', noTime: 'Unknown',
    lang: 'Report language', ko: '한국어', en: 'English', go: 'Make my report', busy: 'Making your report. This takes a few seconds.',
    ok: 'Your report opened in a new window. Press <b>Save as PDF</b> at the top to keep it. You can make it again any time with the same code and birth details.',
    blocked: 'The new window was blocked. Open your report below.', open: 'Open report',
    note: 'One code covers one person. You can change the name freely and fix a mistyped birth date up to two times. If you do not know the birth time, tick "Unknown".',
    back: '<a href="../">Back to the report page</a> · Need help? Instagram <a href="https://www.instagram.com/sajucheop/" target="_blank" rel="noopener">@sajucheop</a>',
    err: 'Connection problem. Please try again in a moment.',
  },
};
function buildMake(lang) {
  const t = MK[lang];
  const body = `
  <article class="guide-article">
    <div class="ga-overline">${lang === 'ko' ? '유료 리포트' : 'Paid report'}</div>
    <h1 class="ga-title">${t.h1}</h1>
    <p class="ga-lead">${t.lead}</p>
    <form id="mk" class="mk" autocomplete="off">
      <label>${t.key}<input name="key" required maxlength="80" placeholder="${esc(t.keyPh)}"></label>
      <label>${t.name}<input name="name" required maxlength="24" placeholder="${esc(t.namePh)}"></label>
      <fieldset><legend>${t.gender}</legend><label class="in"><input type="radio" name="gender" value="F" required> ${t.F}</label><label class="in"><input type="radio" name="gender" value="M"> ${t.Mm}</label></fieldset>
      <fieldset><legend>${t.cal}</legend><label class="in"><input type="radio" name="cal" value="solar" checked> ${t.solar}</label><label class="in"><input type="radio" name="cal" value="lunar"> ${t.lunar}</label><label class="in" id="mk-leap" hidden><input type="checkbox" name="leap"> ${t.leap}</label></fieldset>
      <label>${t.date}<input type="date" name="date" required min="1910-01-01" max="2026-12-31"></label>
      <div class="mk-row"><label>${t.time}<input type="time" name="time"></label><label class="in"><input type="checkbox" name="notime"> ${t.noTime}</label></div>
      <fieldset><legend>${t.lang}</legend><label class="in"><input type="radio" name="lang" value="ko"${lang === 'ko' ? ' checked' : ''}> ${t.ko}</label><label class="in"><input type="radio" name="lang" value="en"${lang === 'en' ? ' checked' : ''}> ${t.en}</label></fieldset>
      <button class="btn-primary" type="submit"><span class="seal-dot" aria-hidden="true"></span><span>${t.go}</span></button>
      <p id="mk-msg" class="mk-msg" role="status" aria-live="polite"></p>
    </form>
    <p class="callout" style="font-size: 13.5px;">${t.note}</p>
    <p style="font-size: 13.5px;">${t.back}</p>
  </article>
  <script>
  (function () {
    var API = ${JSON.stringify(API)}, T = ${JSON.stringify({ busy: t.busy, ok: t.ok, blocked: t.blocked, open: t.open, err: t.err })};
    var f = document.getElementById('mk'), msg = document.getElementById('mk-msg');
    try { var q = new URLSearchParams(location.search).get('key'); if (q) f.key.value = q; } catch (e) {}
    f.addEventListener('change', function () { document.getElementById('mk-leap').hidden = f.cal.value !== 'lunar'; f.time.disabled = f.notime.checked; });
    function track(n, p) { try { if (window.gtag) gtag('event', n, p || {}); } catch (e) {} }
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = f.querySelector('button'); btn.disabled = true; msg.className = 'mk-msg'; msg.textContent = T.busy;
      var body = { key: f.key.value.trim(), name: f.name.value.trim(), gender: f.gender.value, cal: f.cal.value, leap: f.leap.checked, date: f.date.value, time: f.notime.checked ? '' : f.time.value, lang: f.lang.value };
      fetch(API + '/make', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          btn.disabled = false;
          if (!j.ok) { msg.className = 'mk-msg bad'; msg.textContent = j.message || T.err; track('report_make_err', { error: j.error }); return; }
          track('report_make_ok', { lang: body.lang });
          document.open(); document.write(j.html); document.close(); window.scrollTo(0, 0);
        })
        .catch(function () { btn.disabled = false; msg.className = 'mk-msg bad'; msg.textContent = T.err; });
    });
  })();
  </script>`;
  const style = `
  <style>
    .mk { display: grid; gap: 14px; margin: 18px 0 14px; padding: 18px; border: 1px solid var(--line); border-radius: 12px; background: var(--paper, #FFFDF9); }
    .mk label { display: grid; gap: 6px; font-size: 14px; font-weight: 500; }
    .mk input:not([type]), .mk input[type=date], .mk input[type=time] { font: inherit; font-weight: 400; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); }
    .mk fieldset { border: 0; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 6px 16px; align-items: center; }
    .mk legend { font-size: 14px; font-weight: 500; margin-bottom: 6px; width: 100%; }
    .mk label.in { display: inline-flex; gap: 6px; align-items: center; font-weight: 400; }
    .mk-row { display: flex; gap: 14px; align-items: end; flex-wrap: wrap; }
    .mk-msg { margin: 0; font-size: 14px; min-height: 1.4em; }
    .mk-msg.bad { color: var(--seal); }
  </style>`;
  const html = shell({ rel: t.rel, lang, title: t.title, desc: t.lead, canonical: SITE + t.url, noindex: true, ogTitle: t.h1, extraHead: STYLE + style, body });
  const dir = path.join(DOCS, t.url);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  return t.url;
}

console.log('리포트 만들기:', buildMake('ko'), buildMake('en'));

console.log('유료 리포트 안내:', build('ko'), '|', build('en'), '| 수정', MODIFIED);
