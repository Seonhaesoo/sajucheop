/* 음력 설 날짜 — 천문 계산(Meeus 『Astronomical Algorithms』 49장 삭 공식 + ΔT)으로 동지 뒤 두 번째 삭의 날짜를 구한다.
 * tz 로 나라를 고른다: 중국 춘절 UTC+8(1929년 전은 베이징 지방시 +7:45:40), 한국 설날 UTC+9(1955~1961년 +8:30).
 * 영문 띠 페이지의 "Chinese New Year" 경계는 중국 날짜여야 해서 엔진의 한국 음력표 대신 이 계산을 쓴다(2027년처럼 하루 다른 해가 있다).
 * 1924~2032 범위에는 11·12월 윤달이 없어 "동지 뒤 두 번째 삭 = 정월 초하루" 규칙이 그대로 맞는다 — 한국 음력표와 전 구간 대조로 확인. */
import { loadEngine } from './engine.mjs';

const { I } = loadEngine();
const R = Math.PI / 180;
const sin = (deg) => Math.sin(deg * R);

/* ΔT(초) — Espenak & Meeus 다항식 (NASA 일식 목록과 같은 식) */
function deltaT(y) {
  if (y < 1920) { const t = y - 1900; return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t ** 3 - 0.000197 * t ** 4; }
  if (y < 1941) { const t = y - 1920; return 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t ** 3; }
  if (y < 1961) { const t = y - 1950; return 29.07 + 0.407 * t - t * t / 233 + t ** 3 / 2547; }
  if (y < 1986) { const t = y - 1975; return 45.45 + 1.067 * t - t * t / 260 - t ** 3 / 718; }
  if (y < 2005) { const t = y - 2000; return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5; }
  const t = y - 2000;
  return 62.92 + 0.32217 * t + 0.005589 * t * t;
}

/* k번째 삭(2000년 1월 6일 = 0)의 역학시 JDE */
export function newMoonJde(k) {
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T2 - 0.000000150 * T3 + 0.00000000073 * T4;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const M = 2.5534 + 29.10535670 * k - 0.0000014 * T2 - 0.00000011 * T3;
  const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4;
  const F = 160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4;
  const Om = 124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3;
  jde += -0.40720 * sin(Mp) + 0.17241 * E * sin(M) + 0.01608 * sin(2 * Mp) + 0.01039 * sin(2 * F)
    + 0.00739 * E * sin(Mp - M) - 0.00514 * E * sin(Mp + M) + 0.00208 * E * E * sin(2 * M)
    - 0.00111 * sin(Mp - 2 * F) - 0.00057 * sin(Mp + 2 * F) + 0.00056 * E * sin(2 * Mp + M)
    - 0.00042 * sin(3 * Mp) + 0.00042 * E * sin(M + 2 * F) + 0.00038 * E * sin(M - 2 * F)
    - 0.00024 * E * sin(2 * Mp - M) - 0.00017 * sin(Om) - 0.00007 * sin(Mp + 2 * M)
    + 0.00004 * sin(2 * Mp - 2 * F) + 0.00004 * sin(3 * M) + 0.00003 * sin(Mp + M - 2 * F)
    + 0.00003 * sin(2 * Mp + 2 * F) - 0.00003 * sin(Mp + M + 2 * F) + 0.00003 * sin(Mp - M + 2 * F)
    - 0.00002 * sin(Mp - M - 2 * F) - 0.00002 * sin(3 * Mp + M) + 0.00002 * sin(4 * Mp);
  const A = [
    [299.77 + 0.107408 * k - 0.009173 * T2, 0.000325], [251.88 + 0.016321 * k, 0.000165], [251.83 + 26.651886 * k, 0.000164],
    [349.42 + 36.412478 * k, 0.000126], [84.66 + 18.206239 * k, 0.000110], [141.74 + 53.303771 * k, 0.000062],
    [207.14 + 2.453732 * k, 0.000060], [154.84 + 7.306860 * k, 0.000056], [34.52 + 27.261239 * k, 0.000047],
    [207.19 + 0.121824 * k, 0.000042], [291.34 + 1.844379 * k, 0.000040], [161.72 + 24.198154 * k, 0.000037],
    [239.56 + 25.513099 * k, 0.000035], [331.55 + 3.592518 * k, 0.000023]];
  for (const [a, c] of A) jde += c * sin(a);
  return jde;
}

/* 세계시 JD */
export const newMoonJd = (k) => newMoonJde(k) - deltaT(2000 + k / 12.3685) / 86400;

export const chinaTz = (y) => (y < 1929 ? 7 + 45 / 60 + 40 / 3600 : 8);
export const koreaTz = (y) => (y >= 1955 && y <= 1961 ? 8.5 : 9);

const dayNo = (jd, tz) => Math.floor(jd - I.JDN_EPOCH + 0.5 + tz / 24);
export function civil(jd, tz) {
  const t = jd - I.JDN_EPOCH + 0.5 + tz / 24;
  const dn = Math.floor(t), c = I.civilFromDays(dn), h = (t - dn) * 24;
  return { y: c.y, m: c.m, d: c.d, dn, hh: Math.floor(h), mm: Math.floor((h - Math.floor(h)) * 60) };
}

/* y년 음력 정월 초하루(양력) — { y, m, d, dn, hh, mm }: hh·mm 은 그 삭의 현지 시각 */
export function lunarNewYear(y, tz = chinaTz(y)) {
  const approx = I.daysFromCivil(y - 1, 12, 21) + I.JDN_EPOCH - 0.5;
  const wsDay = dayNo(I.findTermJd(270, approx - 6, approx + 6), tz);
  let k = Math.floor((y - 1 + 10.5 / 12 - 2000) * 12.3685) - 1;
  const after = [];
  for (let i = 0; i < 10 && after.length < 2; i++, k++) {
    const jd = newMoonJd(k);
    if (dayNo(jd, tz) > wsDay) after.push(civil(jd, tz));
  }
  return after[1];
}

/* 띠 해의 양력 구간 — 시작일(춘절)과 끝날(다음 춘절 전날) */
export function zodiacSpan(y) {
  const a = lunarNewYear(y), b = lunarNewYear(y + 1);
  const end = I.civilFromDays(b.dn - 1);
  return { start: { y: a.y, m: a.m, d: a.d }, end: { y: end.y, m: end.m, d: end.d } };
}
