/* 절기 달(월운) 계산 — build-wolun.mjs(이달의 띠별 운세)와 build-ddi-daily.mjs(오늘의 띠 페이지의 '이달의 운세' 링크)가 같이 쓴다.
 * 달 m 은 그 달 안에 드는 절(節)부터 다음 달 절 전날까지: 1월 소한 · 2월 입춘 · 3월 경칩 · 4월 청명 · 5월 입하 · 6월 망종
 * 7월 소서 · 8월 입추 · 9월 백로 · 10월 한로 · 11월 입동 · 12월 대설. 절기 시각은 천문연 발표값(solar-terms-data), 없으면 엔진 계산. */
import { publishedTime } from './solar-terms-data.mjs';

export const JIE_OF_MONTH = { 1: 19, 2: 21, 3: 23, 4: 1, 5: 3, 6: 5, 7: 7, 8: 9, 9: 11, 10: 13, 11: 15, 12: 17 };
export const JIE_NAME = { 1: '소한', 2: '입춘', 3: '경칩', 4: '청명', 5: '입하', 6: '망종', 7: '소서', 8: '입추', 9: '백로', 10: '한로', 11: '입동', 12: '대설' };
const JIE_APPROX = { 1: 5, 2: 4, 3: 5, 4: 5, 5: 5, 6: 6, 7: 7, 8: 7, 9: 7, 10: 8, 11: 7, 12: 7 };
export const BRANCH_OF_MONTH = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 0 };
export const nextMonth = (y, m) => (m === 12 ? [y + 1, 1] : [y, m + 1]);
export const prevMonth = (y, m) => (m === 1 ? [y - 1, 12] : [y, m - 1]);
export const monthKey = (y, m) => `${y}-${String(m).padStart(2, '0')}`;

export function makeWolun({ M, I }) {
  const midnightJd = (y, m, d) => I.daysFromCivil(y, m, d) + I.JDN_EPOCH - 0.5 - 9 / 24;
  function jieOf(y, m) {
    const i = JIE_OF_MONTH[m];
    const pub = publishedTime(y, i);
    if (pub) return pub;
    const approx = midnightJd(y, m, JIE_APPROX[m]);
    const jd = I.findTermJd(i * 15, approx - 6, approx + 6);
    const tk = jd - I.JDN_EPOCH + 0.5 + 9 / 24, dn = Math.floor(tk), cv = I.civilFromDays(dn);
    let hh = Math.floor((tk - dn) * 24), mm = Math.round(((tk - dn) * 24 - hh) * 60);
    if (mm === 60) { hh += 1; mm = 0; }
    return { y: cv.y, m: cv.m, d: cv.d, hh, mm, published: false };
  }
  /* 오늘이 속한 절기 달 — 이번 달 절기 전이면 지난달 */
  function currentSolarMonth(t) {
    const j = jieOf(t.y, t.m);
    return I.daysFromCivil(t.y, t.m, t.d) < I.daysFromCivil(j.y, j.m, j.d) ? prevMonth(t.y, t.m) : [t.y, t.m];
  }
  function solarMonth(y, m) {
    const start = jieOf(y, m), [ny, nm] = nextMonth(y, m), nextStart = jieOf(ny, nm);
    const endDn = I.daysFromCivil(nextStart.y, nextStart.m, nextStart.d) - 1, e = I.civilFromDays(endDn);
    const mid = I.civilFromDays(I.daysFromCivil(start.y, start.m, start.d) + 12);
    const r = M.compute({ year: mid.y, month: mid.m, day: mid.d, hour: 12, minute: 0, unknownTime: true, gender: 'M', applySolarTime: false });
    const p = r.pillars.month;
    if (p.branch !== BRANCH_OF_MONTH[m]) throw new Error(`월지 불일치 ${y}-${m}: 엔진 ${p.branch}`);
    const days = [];
    for (let dn = I.daysFromCivil(start.y, start.m, start.d); dn <= endDn; dn++) {
      const c = I.civilFromDays(dn), dp = M.dayPillarOf(c.y, c.m, c.d);
      days.push({ y: c.y, m: c.m, d: c.d, w: ((dn + 4) % 7 + 7) % 7, stem: dp.stem, branch: dp.branch });
    }
    return { y, m, start, end: { y: e.y, m: e.m, d: e.d }, nextStart, stem: p.stem, branch: p.branch, days, yearStem: r.pillars.year.stem, yearBranch: r.pillars.year.branch };
  }
  return { jieOf, currentSolarMonth, solarMonth };
}
