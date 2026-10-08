/* 유료 2027 개인 리포트 — 출시 스위치와 홍보 상자
 * 출시하는 날: live 를 true 로 바꾸고 build-report-page·build-2027·build-tojeong·build-en-zodiac 를 다시 실행,
 * docs/index.html 의 data-report-promo 두 곳에서 hidden 을 지운다. Threads 매일 글(daily-story)은 다음 실행부터 따라간다.
 * 생성기·서버는 공개 저장소 밖(SAZU-REPORT)에 있다. */
export const REPORT = {
  live: false,
  ko: '/report/2027/',
  en: '/en/report/2027/',
  price: '9,900원',
  priceEn: '$9',
};

/* 페이지 안 홍보 상자 — 꺼져 있으면 빈 문자열 */
export function reportPromo(rel, where, lang = 'ko') {
  if (!REPORT.live) return '';
  const href = rel + (lang === 'en' ? REPORT.en : REPORT.ko).slice(1);
  const t = lang === 'en'
    ? { b: 'Your 2027, read from your own chart', s: `A 35-page report from all eight characters and your 10-year luck cycle, with a 365-day calendar of good days · ${REPORT.priceEn}`, go: 'See the report →' }
    : { b: '내 사주로 쓴 2027 리포트', s: `여덟 글자와 10년 운으로 풀어 쓴 35쪽 · 365일 좋은 날 달력 · ${REPORT.price}`, go: '자세히 보기 →' };
  return `<a class="rp-promo" href="${href}" onclick="try{gtag('event','report_promo',{where:'${where}'})}catch(e){}"><b>${t.b}</b><span>${t.s}</span><i>${t.go}</i></a>`;
}
