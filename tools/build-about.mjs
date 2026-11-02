/* 소개 페이지(/about/)와 계산 방법 페이지(/about/method/) — 누가 운영하고, 여덟 글자를 어떻게 계산하는지, 출처·한계·오류 신고 방법.
 * 2026-11-02: 구글 '대량 생성 콘텐츠' 판정·애드센스 '가치가 별로 없는 콘텐츠' 반려 뒤 운영자·방법·출처를 한 페이지에 모았다.
 * 소개 페이지는 전에 build-guide-extra.mjs 가 만들던 것을 여기로 옮겼다. 운영자 표기는 page-shell.mjs 의 SITE_OPERATOR 한 곳에서 바꾼다.
 * 본문의 수치(진태양시 −32분, 표준시 이력, 서머타임 연도, 절기 정밀도, 음력 범위, 대운수)는 docs/js/manseryeok.js·vendor-korean-lunar.js·tools/solar-terms-data.mjs 에 있는 값 그대로다.
 * 사용: node tools/build-about.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { loadEngine, ROOT_DIR } from './engine.mjs';
import { shell, esc, breadcrumb, SITE_OPERATOR, SITE_CONTACT_URL, METHOD_REVIEWED } from './page-shell.mjs';
import { PUBLISHED as TERM_PUBLISHED, publishedYears } from './solar-terms-data.mjs';

const { M, I } = loadEngine();
const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const koDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${y}년 ${m}월 ${d}일`; };
const REVIEWED_KO = koDate(METHOD_REVIEWED);
const ABOUT_MODIFIED = METHOD_REVIEWED;   /* 소개 페이지도 이날 운영자·계산 방법 절을 고쳤다 */

/* 본문에 적는 수치는 엔진에서 다시 읽어 와 글과 코드가 어긋나지 않게 한다 */
const SEOUL_LON = 126.978;
const solarCorr = Math.round((SEOUL_LON - 135) * 4);   /* −32 */
const termYears = publishedYears();                      /* 발표 시각이 있는 해: 2026·2027·2028 */
const ip2027 = TERM_PUBLISHED[2027]['입춘'];              /* '02-04 10:46' */
/* 경계 예시 — 2027 입춘 앞뒤 한 시간의 년주·월주를 엔진으로 직접 뽑는다 */
const [ipMd, ipHm] = ip2027.split(' ');
const [ipM, ipD] = ipMd.split('-').map(Number), [ipH, ipMin] = ipHm.split(':').map(Number);
const at = (hh, mm) => M.compute({ year: 2027, month: ipM, day: ipD, hour: hh, minute: mm, gender: 'M', applySolarTime: false });
const before = at(ipH - 1, ipMin), after = at(ipH + 1, ipMin);
const gj = (p) => { const g = M.ganjiName(p.stem, p.branch); return `${g.kor}(${g.han})`; };
/* 운영자 표기 뒤 조사 — 받침이 있으면 '이', 없으면 '가' (SITE_OPERATOR 를 실명으로 바꿔도 문장이 어긋나지 않게) */
const iga = (s) => { const c = s.charCodeAt(s.length - 1); return s + (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 ? '이' : '가'); };
const OPERATOR_GA = esc(iga(SITE_OPERATOR));
const ORG = { '@type': 'Organization', name: '사주첩', alternateName: 'Sajucheop', url: SITE + '/', sameAs: [SITE_CONTACT_URL], logo: SITE + '/icons/apple-touch-icon.png' };
const FOOTER_EXTRA = `<a href="https://donpyo.com/">돈표</a><a href="https://bodyzip.com/">바디집</a>`;   /* 주제가 다른 자매 사이트는 소개 페이지에만 */

function write(url, html) {
  const file = path.join(DOCS, url.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

/* ---------- 소개 ---------- */
function aboutPage() {
  const url = '/about/', rel = '../';
  const body = `
  <article class="guide-article">
    <div class="ga-overline">소개</div>
    <h1 class="ga-title">사주첩을 소개합니다</h1>
    <p class="ga-meta">사주첩 · ${koDate(ABOUT_MODIFIED)} 고침</p>
    <p class="ga-lead">사주첩(四柱帖)은 태어난 해·달·날·시의 여덟 글자를 직접 계산하고, 명리학의 규칙을 알기 쉬운 문장으로 옮겨 보여 주는 무료 사주 풀이 사이트입니다. '첩(帖)'은 시첩·서첩처럼 기록을 묶은 책을 뜻합니다.</p>

    <div class="ga-body">
      <h2>무엇을 하는 곳인가요</h2>
      <p>생년월일시를 넣으면 명식(여덟 글자), 오행 분포, 십성, 10년 단위 대운, 오늘의 운세, 궁합, 좋은 날을 한 흐름으로 보여 줍니다. 여기에 <a href="${rel}ilju/">60일주 사전</a>, <a href="${rel}gunghap/">일간 궁합표</a>, 날짜별 일진, 절기, 손없는날 달력, 토정비결, 만세력, 음력 기념일 변환, 삼재 계산 같은 도구와, 개념을 풀어 쓴 <a href="${rel}guide/">서재</a> 글이 있습니다.</p>

      <h2>누가 운영하나요</h2>
      <p>사주첩은 ${OPERATOR_GA} 혼자 만들고 운영합니다. 계산 엔진과 풀이 문장, 서재 글을 직접 쓰고, 틀린 곳을 알려 주시면 확인한 뒤 고칩니다. 상담이나 유료 풀이는 하지 않고, 운영비는 페이지의 광고로만 충당합니다. 명리학은 자격 제도가 없는 분야라 사주첩은 전문가의 권위 대신 <a href="${rel}about/method/">계산 과정과 출처를 전부 공개하는 것</a>으로 신뢰를 얻으려 합니다.</p>

      <h2>왜 만들었나요</h2>
      <p>사주 풀이는 흔하지만, 무엇을 근거로 그런 말을 하는지 알려 주는 곳은 드뭅니다. 겁을 주거나 유료 상담으로 이끄는 문장도 많습니다. 사주첩은 반대로 가려고 합니다. 계산 과정을 숨기지 않고, 풀이는 규칙에서 나온 만큼만 말하며, '믿으세요'보다 '이해하세요'에 가까운 안내서가 되는 것이 목표입니다.</p>

      <h2>계산은 이렇게 합니다</h2>
      <p>절기는 표를 베끼지 않고 태양의 겉보기 위치(황경)로 직접 계산하되, 한국천문연구원이 시각을 발표한 해(${termYears.join('·')}년)는 발표값을 그대로 씁니다. 사주의 새해는 1월 1일이나 설날이 아니라 입춘이고, 달은 열두 절(節)이 드는 시각에 바뀝니다. 출생 시각은 서울 기준 진태양시(시계에서 ${Math.abs(solarCorr)}분 빼기)로 보정하고, 1954~1961년의 옛 표준시도 반영합니다. 음력은 한국천문연구원 기준 자료로 바꿉니다. 공식 하나하나와 출처, 한계는 <a href="${rel}about/method/"><b>계산 방법</b> 페이지</a>에 따로 적었습니다.</p>

      <h2>풀이는 이렇게 씁니다</h2>
      <p>풀이 문장은 일간과 다른 글자의 관계(십성), 합과 충, 신강·신약 같은 명리학의 규칙을 조건에 따라 문장으로 옮긴 것입니다. 같은 조건이면 누구에게나 같은 문장이 나오고, 근거가 된 글자를 함께 보여 줍니다. 삼재·신살처럼 겁을 주기 쉬운 주제는 '조심할 때를 정리하는 관습'으로 설명합니다. 토정비결 144괘 풀이처럼 전통 구조 위에 사주첩이 새로 쓴 문장은 그렇다고 밝혀 둡니다.</p>
      <p>사주는 참고용입니다. 건강·돈·법률처럼 중요한 결정은 전문가와 상의하고 스스로 판단해 주세요.</p>

      <h2>개인정보와 광고</h2>
      <p>입력한 생년월일시는 서버로 보내지 않고 이 기기의 브라우저 안에서만 계산합니다. 궁합 링크는 정보가 주소 끝(#)에만 담겨 서버에 남지 않습니다. 방문 통계를 위해 Google 애널리틱스를, 운영비를 위해 Google 애드센스 광고를 씁니다. 자세한 내용은 <a href="${rel}privacy.html">개인정보처리방침</a>과 <a href="${rel}terms.html">이용약관</a>에 있습니다.</p>

      <h2>함께 운영하는 사이트</h2>
      <ul>
        <li><a href="http://saengil.sajucheop.com/">생일 사전</a>: 1940년부터 오늘까지 날짜별 생일·나이·띠·음력</li>
        <li><a href="https://dream.sajucheop.com/">꿈해몽</a>: 상징과 상황별 꿈 풀이</li>
        <li><a href="https://tarot.sajucheop.com/">타로</a>: 78장 카드의 뜻과 뽑기</li>
      </ul>

      <h2>고친 기록</h2>
      <ul>
        <li>2026년 8월에 사주 풀이, 오늘의 운세, 궁합 링크, 서재 글 20편으로 문을 열었습니다.</li>
        <li>2026년 9월에 60일주 사전, 일간 궁합표, 날짜별 일진·절기·손없는날, 영문판, 2027 토정비결을 더했습니다.</li>
        <li>2026년 9월 13일에 용신·궁합 보는 법·신살 등 서재 글 15편을 더했습니다.</li>
        <li>2026년 10월에 틀로 찍어 낸 조합형 페이지(궁합 짝, 출생연도별 운세 등)를 구글 검색에서 빼고, 절기 페이지의 되풀이 문항을 정리했습니다.</li>
        <li>${REVIEWED_KO}에 <a href="${rel}about/method/">계산 방법</a> 페이지를 따로 만들고, 궁합표·2027 운세 허브의 긴 링크 목록을 고르기 상자로 바꾸고, 절기 페이지마다 그 시각 앞뒤 출생의 월주 예시를 더했습니다.</li>
      </ul>

      <h2>문의</h2>
      <p>잘못된 계산이나 어색한 문장을 발견하면 인스타그램 <a href="${SITE_CONTACT_URL}" target="_blank" rel="noopener">@sajucheop</a> 메시지(DM)로 알려 주세요. 확인한 뒤 고치고 이 페이지의 기록에 남깁니다.</p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}index.html"><span class="seal-dot" aria-hidden="true"></span><span>내 사주 풀어보기</span></a>
    </div>
  </article>`;
  write(url, shell({
    rel, title: '사주첩 소개 — 계산 기준과 풀이 원칙', desc: '사주첩을 누가 운영하는지, 여덟 글자를 어떻게 계산하는지(절기 시각·진태양시·과거 표준시·음력), 풀이 문장을 어떤 원칙으로 쓰는지, 개인정보와 광고, 문의 방법을 정리했습니다.',
    canonical: SITE + url, nav: [{ href: rel + 'guide/', label: '서재' }, { href: rel + 'index.html', label: '사주 보기' }], footerExtra: FOOTER_EXTRA,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'AboutPage', name: '사주첩 소개', url: SITE + url, inLanguage: 'ko', dateModified: ABOUT_MODIFIED, mainEntity: ORG, publisher: ORG },
      breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '소개', url: SITE + url }])
    ],
    body
  }));
}

/* ---------- 계산 방법 ---------- */
function methodPage() {
  const url = '/about/method/', rel = '../../';
  const title = '사주첩 계산 방법 — 절기 시각·진태양시·표준시·음력을 이렇게 계산합니다';
  const desc = `사주첩이 년주·월주·일주·시주를 세우는 공식과 출처. 태양 황경으로 구한 절기 시각과 한국천문연구원 발표값, 서울 기준 진태양시 ${Math.abs(solarCorr)}분 보정, 1954~1961년 표준시, 야자시, 대운수, 음력 자료, 검증 방법과 한계, 오류 신고 방법.`;
  const faq = [
    ['사주첩의 절기 시각은 어디서 나온 값인가요?', `${termYears.join('·')}년은 한국천문연구원이 발표한 시각(한국 시간, 분 단위)을 그대로 씁니다. 그 밖의 해는 태양의 겉보기 황경을 천문 공식으로 계산해 구하며, 발표값보다 평균 6분, 최대 14분쯤 이릅니다. 이 차이 때문에 절기 시각 앞뒤 두 시간 안에 태어난 분에게는 경계 경고를 보여 줍니다.`],
    [`진태양시 보정은 왜 ${Math.abs(solarCorr)}분인가요?`, `한국 표준시는 동경 135도를 기준으로 하지만 서울은 동경 ${SEOUL_LON}도에 있습니다. 경도 1도는 4분이므로 (${SEOUL_LON} − 135) × 4 = −${Math.abs(solarCorr)}분입니다. 시계 시각에서 ${Math.abs(solarCorr)}분을 빼서 일주·시주를 세우고, 설정에서 끌 수 있습니다. 절기(년주·월주) 판정에는 표준시를 그대로 씁니다.`],
    ['1950년대에 태어났는데 시간이 다르게 계산되나요?', '1954년 3월 21일부터 1961년 8월 9일까지 한국 표준시는 동경 127.5도(UTC+8:30)였습니다. 이 기간의 출생 시각은 그 표준시로 해석하고, 진태양시 보정도 127.5도를 기준으로 2분만 뺍니다. 1948~1951년, 1955~1960년, 1987~1988년에는 서머타임이 있었는데 사주첩은 이를 자동으로 되돌리지 않고 경고로 알려 드리니, 출생 시각이 서머타임 시계인지 확인해 주세요.'],
    ['밤 11시 이후 출생은 어느 날의 일주인가요?', '사주첩은 야자시(夜子時) 방식을 씁니다. 보정한 시각이 23시 이후면 날짜는 그대로 두되 시주의 천간만 다음 날 일간을 기준으로 세우고, 0시부터는 다음 날 일주로 넘어갑니다. 유파에 따라 23시부터 다음 날 일주로 보는 방식(조자시)도 있어 결과가 다를 수 있습니다.'],
    ['계산이 틀린 것 같으면 어떻게 하나요?', `생년월일시와 기대한 결과를 인스타그램 @sajucheop 메시지로 보내 주세요. 자동 테스트와 공식 역서로 확인한 뒤 고치고, 소개 페이지의 고친 기록에 남깁니다. 이 페이지는 ${REVIEWED_KO}에 마지막으로 점검했습니다.`]
  ];
  const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${rel}about/" style="color: inherit; text-decoration: none;">소개</a> · 계산 방법</div>
    <h1 class="ga-title">사주첩은 여덟 글자를<br>이렇게 계산합니다</h1>
    <p class="ga-meta">${esc(SITE_OPERATOR)} · 마지막 점검 ${REVIEWED_KO}</p>
    <p class="ga-lead">사주첩의 모든 결과는 브라우저 안에서 돌아가는 계산 엔진(<code>manseryeok.js</code>) 하나에서 나옵니다. 이 페이지는 그 엔진이 년주·월주·일주·시주와 대운을 어떤 공식과 자료로 세우는지, 어디까지 믿을 수 있고 어디서 어긋날 수 있는지를 적은 설명서입니다. 코드에 있는 값을 그대로 옮겼고, 코드가 바뀌면 이 글도 함께 고칩니다.</p>

    <div class="ga-body">
      <h2>누가 만들고 운영하나요</h2>
      <p>${OPERATOR_GA} 혼자 만들어 운영합니다. 명리 이론은 널리 쓰이는 전통 규칙(절기력, 60갑자, 십성, 합충, 12운성)을 따르고, 천문 계산과 역법 자료는 아래에 적은 공개 출처를 씁니다. 사주첩은 상담을 하지 않고 개인의 미래를 예측한다고 말하지 않습니다. 운영비는 광고로 충당하며, 입력한 생년월일시는 서버로 보내지 않습니다.</p>

      <h2>1. 년주와 월주 — 태양의 위치로 절기를 판정합니다</h2>
      <p>사주의 해와 달은 양력 1월 1일이나 음력 설이 아니라 <b>절기</b>로 나뉩니다. 태양이 황경 315°에 닿는 순간이 입춘이고, 그때 년주가 바뀝니다. 월주는 입춘부터 30°마다 드는 열두 절(節) — 입춘·경칩·청명·입하·망종·소서·입추·백로·한로·입동·대설·소한 — 의 시각에 바뀝니다.</p>
      <p>엔진은 출생 순간의 태양 겉보기 황경을 직접 계산합니다. 평균 황경과 평균 근점이각에서 중심차를 더해 참 황경을 구하고, 장동(章動)과 광행차를 보정하는 천문 알고리즘(Jean Meeus, <i>Astronomical Algorithms</i>의 태양 위치 공식)을 쓰며, 지구 자전의 어긋남(ΔT)은 1900~2100년 표를 보간해 넣습니다. 절기 시각은 황경이 목표 각도를 지나는 순간을 이분법으로 60번 좁혀 분 단위까지 구합니다.</p>
      <p>이 계산값은 공식 발표값보다 조금 이릅니다. 2025년 24절기로 재어 보면 평균 5.8분, 최대 약 14분 차이가 났습니다. 그래서 <b>한국천문연구원이 시각을 발표한 해(${termYears.join('·')}년)는 발표값을 우선</b> 쓰고(출처: 한국천문연구원 역서, 공공데이터포털 특일 정보), 발표되지 않은 해에만 계산값을 씁니다. <a href="${rel}jeolgi/">절기 페이지</a>와 <a href="${rel}2027/">2027 운세</a>의 시각이 그 값입니다.</p>
      <p>경계에 걸린 출생을 위해 절기 시각 앞뒤 <b>두 시간 안</b>이면 결과 화면에 경고를 띄웁니다. 예를 들어 2027년 입춘은 ${ipM}월 ${ipD}일 ${ipHm}이므로, 같은 날 ${String(ipH - 1).padStart(2, '0')}:${ipHm.slice(3)}에 태어나면 년주 ${gj(before.pillars.year)}·월주 ${gj(before.pillars.month)}이고, ${String(ipH + 1).padStart(2, '0')}:${ipHm.slice(3)}에 태어나면 년주 ${gj(after.pillars.year)}·월주 ${gj(after.pillars.month)}로 두 기둥이 함께 바뀝니다. 절기 판정에는 진태양시 보정을 적용하지 않고 표준시 그대로를 씁니다.</p>

      <h2>2. 일주 — 율리우스일로 60갑자를 셉니다</h2>
      <p>일주는 날짜를 율리우스일(연속 일수)로 바꿔 60갑자 순환에 맞춥니다. 날의 경계는 자정(0시)이고, 아래의 진태양시 보정을 적용한 뒤의 시각으로 날짜를 정합니다. 그래서 0시 20분 출생은 보정 뒤 전날 23시 48분이 되어 전날 일주가 됩니다.</p>

      <h2>3. 시주 — 시두법과 야자시</h2>
      <p>시주는 하루를 두 시간씩 열두 지지로 나눕니다. 자시는 23:00~00:59, 축시는 01:00~02:59처럼 이어지고, 천간은 일간에 따라 정하는 시두법(時頭法)으로 붙입니다. 23시 이후 출생은 <b>야자시</b>로 처리합니다. 날짜(일주)는 그대로 두고 시주의 천간만 다음 날 일간 기준으로 세웁니다. 23시부터 다음 날 일주로 넘기는 조자시 방식은 쓰지 않으므로, 다른 만세력과 23시대 출생의 일주가 다를 수 있습니다.</p>

      <h2>4. 진태양시 — 서울 기준 ${Math.abs(solarCorr)}분을 뺍니다</h2>
      <p>한국 표준시는 동경 135° 자오선 기준이라 서울(동경 ${SEOUL_LON}°)에서 태양이 남중하는 시각보다 시계가 앞서 갑니다. 경도 1°는 4분이므로 (${SEOUL_LON} − 135) × 4 = <b>−${Math.abs(solarCorr)}분</b>, 즉 시계 시각에서 ${Math.abs(solarCorr)}분을 뺀 값을 '명리 시각'으로 삼아 일주와 시주를 세웁니다. 이 보정은 끌 수 있고, 영문판 계산기에서는 출생지의 경도와 시간대를 직접 넣을 수 있습니다. 균시차(태양의 빠르고 늦음, ±16분)는 전통 만세력 관행에 따라 넣지 않습니다. 보정의 배경은 <a href="${rel}guide/birth-time.html">출생시간 보정 이야기</a>에 있습니다.</p>

      <h2>5. 표준시 이력 — 1954~1961년과 서머타임</h2>
      <ul>
        <li><b>1954년 3월 21일 ~ 1961년 8월 9일</b>: 한국 표준시가 동경 127.5°(UTC+8:30)였습니다. 이 기간 출생 시각은 그 표준시로 해석하고, 진태양시 보정도 127.5° 기준으로 계산해 2분만 뺍니다.</li>
        <li><b>1908년 4월 1일 ~ 1911년 12월 31일</b>: 같은 UTC+8:30 표준시를 적용합니다.</li>
        <li><b>서머타임</b>(1948~1951년, 1955~1960년, 1987~1988년): 시행 기간이 해마다 달라 자동으로 되돌리지 않습니다. 해당 연도 출생이면 경고를 보여 주고, 출생 시각이 서머타임 시계라면 한 시간을 빼서 넣도록 안내합니다.</li>
      </ul>

      <h2>6. 음력 — 한국천문연구원 기준 자료</h2>
      <p>음력 생일은 한국천문연구원의 음양력 대조 자료를 담은 공개 라이브러리(korean-lunar-calendar)로 양력으로 바꾼 뒤 계산합니다. 범위는 음력 1000년 1월 1일부터 2050년 11월 18일까지이고, 윤달은 따로 고를 수 있습니다. 손없는날(음력 끝자리 9·0)과 토정비결의 음력 생월·생일도 같은 자료를 씁니다. 영문 Chinese calendar 페이지는 베이징 시간(동경 120°) 기준의 중국 음력을 따로 계산해, 설날이 한국과 하루 다른 해가 있습니다.</p>

      <h2>7. 대운 — 절입까지의 날수를 3으로 나눕니다</h2>
      <p>대운의 방향은 년주 천간의 음양과 성별로 정합니다(양년 남자·음년 여자는 순행, 그 밖에는 역행). 대운수는 출생 시각에서 다음 절(순행) 또는 이전 절(역행)까지의 날수를 3으로 나눠 반올림하고, 1~10 사이로 맞춥니다. 첫 대운은 월주의 다음(또는 이전) 간지부터 10년씩 이어 가고, 화면에는 여덟 개까지 보여 줍니다.</p>

      <h2>8. 풀이 문장과 점수</h2>
      <p>십성은 일간과 다른 글자의 오행 생극과 음양으로 정하고, 지지의 십성은 그 지지 지장간의 본기를 기준으로 봅니다. 신강·신약은 일간을 돕는 글자의 비율로 판정합니다. 궁합 점수, 띠별 운세 점수, 2027년 띠 점수는 합·충·형·해·파·원진과 오행 상생상극에 정해 둔 가중치를 더한 참고값이며, 공식은 각 페이지 아래에 적어 두었습니다. 풀이 문장은 조건별로 미리 써 둔 문장을 규칙에 따라 고른 것이라 같은 조건이면 누구에게나 같은 문장이 나옵니다.</p>

      <h2>어떻게 검증하나요</h2>
      <ul>
        <li>엔진에는 자동 테스트 140여 개(일주 기준일, 절기 경계, 표준시 전환, 합충, 음력 변환, 궁합 점수 등)가 있어 코드를 고칠 때마다 다시 돌립니다. <a href="${rel}tests.html">테스트 페이지</a>에서 직접 결과를 볼 수 있습니다.</li>
        <li>절기 시각은 한국천문연구원 발표값과 비교해 20분 넘게 어긋나면 페이지 생성을 멈춥니다. ${termYears[0]}~${termYears[termYears.length - 1]}년 72개 절기는 DE441 천체력 기반 계산과 ±1분 안에서 맞고, 중국 발표 시각(베이징 시간 +1시간)과도 일치하는지 확인했습니다.</li>
        <li>날짜별 일진·절기·손없는날 페이지는 같은 엔진으로 미리 만들어 두므로, 계산기 결과와 페이지의 값이 항상 같습니다.</li>
      </ul>

      <h2>한계 — 어디까지 믿을 수 있나요</h2>
      <ul>
        <li>사주는 참고용입니다. 건강·돈·법률처럼 중요한 결정은 전문가와 상의하고 스스로 판단해 주세요. 사주첩은 미래를 단정하지 않습니다.</li>
        <li>절기 시각은 분 단위이고 계산값은 발표값과 몇 분 다를 수 있습니다. 경계 두 시간 안의 출생은 월주·년주가 바뀔 수 있으니 출생 시각을 다시 확인해 주세요.</li>
        <li>야자시·진태양시·서머타임 처리 방식은 유파마다 달라 다른 만세력과 결과가 다를 수 있습니다. 어떤 방식을 썼는지는 위에 모두 적었습니다.</li>
        <li>출생 시각을 모르면 시주 없이 여섯 글자로 계산하며, 그만큼 풀이가 덜 정확합니다.</li>
        <li>풀이 문장은 규칙에 따라 고른 참고 글이며, 개인의 사정을 모두 담지 못합니다.</li>
      </ul>

      <h2>출처</h2>
      <ul>
        <li>절기 시각: 한국천문연구원 역서(${termYears.join('·')}년), 공공데이터포털 특일 정보</li>
        <li>태양 위치 공식: Jean Meeus, <i>Astronomical Algorithms</i>(2판) 25장의 태양 황경 근사식(ΔT 는 공개된 관측값 표를 1900~2100년 범위에서 보간)</li>
        <li>음양력 변환: 한국천문연구원 기준 데이터를 담은 korean-lunar-calendar 0.4.0(MIT)</li>
        <li>표준시 이력: 대한민국 표준시 변경 기록(1908·1912·1954·1961년 개정)</li>
        <li>이름 한자: 유니코드 한자 데이터베이스(Unihan 18.0)의 음·획수·인명용 한자 정보</li>
      </ul>

      <h2>틀린 곳을 발견하면</h2>
      <p>생년월일시와 기대한 결과를 인스타그램 <a href="${SITE_CONTACT_URL}" target="_blank" rel="noopener">@sajucheop</a> 메시지(DM)로 알려 주세요. 확인한 뒤 고치고 <a href="${rel}about/">소개 페이지의 고친 기록</a>에 남깁니다. 이 페이지는 <b>${REVIEWED_KO}</b>에 마지막으로 점검했습니다.</p>

      <h2>자주 묻는 질문</h2>
      ${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n      ')}
      <p class="callout"><a href="${rel}about/">사주첩 소개</a> · <a href="${rel}guide/jeolgi.html">사주의 새해는 입춘</a> · <a href="${rel}guide/birth-time.html">출생시간 보정 이야기</a> · <a href="${rel}jeolgi/">24절기 시각표</a> · <a href="${rel}manse/">만세력</a></p>
    </div>

    <div class="ga-cta">
      <a class="btn-primary" href="${rel}index.html"><span class="seal-dot" aria-hidden="true"></span><span>이 기준으로 내 사주 세우기</span></a>
    </div>
  </article>`;
  write(url, shell({
    rel, title, desc, canonical: SITE + url, nav: [{ href: rel + 'guide/', label: '서재' }, { href: rel + 'about/', label: '소개' }, { href: rel + 'index.html', label: '사주 보기' }],
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'AboutPage', name: '사주첩 계산 방법', headline: title, description: desc, url: SITE + url, inLanguage: 'ko', dateModified: METHOD_REVIEWED, lastReviewed: METHOD_REVIEWED, mainEntity: ORG, publisher: ORG, author: ORG },
      breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '소개', url: SITE + '/about/' }, { name: '계산 방법', url: SITE + url }]),
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
    ],
    body
  }));
}

aboutPage();
methodPage();

/* 사이트맵(docs/sitemap.xml) — 없는 주소만 더하고, 계산 방법 페이지의 lastmod 는 점검일로 맞춘다 */
const smPath = path.join(DOCS, 'sitemap.xml');
let sm = fs.readFileSync(smPath, 'utf8');
const methodLoc = `${SITE}/about/method/`;
const methodRow = `  <url><loc>${methodLoc}</loc><lastmod>${METHOD_REVIEWED}</lastmod><priority>0.5</priority></url>`;
if (sm.includes(`<loc>${methodLoc}</loc>`)) sm = sm.replace(/[ \t]*<url><loc>https:\/\/sajucheop\.com\/about\/method\/<\/loc>[\s\S]*?<\/url>/, methodRow);
else sm = sm.replace(/([ \t]*<url><loc>https:\/\/sajucheop\.com\/about\/<\/loc>[^\n]*\n)/, `$1${methodRow}\n`);
if (!sm.includes(`<loc>${SITE}/about/</loc>`)) sm = sm.replace('</urlset>', `  <url><loc>${SITE}/about/</loc><priority>0.5</priority></url>\n${methodRow}\n</urlset>`);
fs.writeFileSync(smPath, sm);
console.log(`소개·계산 방법 — /about/ (${koDate(ABOUT_MODIFIED)}), /about/method/ (점검 ${REVIEWED_KO}, 운영자 '${SITE_OPERATOR}') · 2027 입춘 경계 예시 ${gj(before.pillars.year)}/${gj(before.pillars.month)} → ${gj(after.pillars.year)}/${gj(after.pillars.month)}`);
