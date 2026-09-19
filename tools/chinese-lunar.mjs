/* 중국 음력(농력) — 베이징 시각(UTC+8)으로 센 달의 시작일과 윤달.
 * 영문 'Chinese calendar' 페이지는 중국 날짜여야 해서 한국 음력표(KASI) 대신 천문 계산으로 만든다(2027·2028년 설처럼 하루 다른 달이 있고, 2012년처럼 윤달이 다른 해도 있다).
 * 규칙(1645년 시헌력 이후): ① 달은 삭(朔)이 드는 날에 시작 ② 동지가 든 달이 11월 ③ 동지 달 사이에 달이 13개면 윤년이고, 중기(中氣, 황경 30° 배수)가 없는 첫 달이 윤달.
 * 삭 = cny.mjs(Meeus 49장 + ΔT), 중기 = 엔진 findTermJd. 검증은 맨 아래 selfCheck() — 알려진 윤달 목록·춘절·한국 음력표와 대조.
 * 쓰는 곳: build-en-lunar.mjs (성별 달력·음력 나이·Chinese calendar) */
import { loadEngine } from './engine.mjs';
import { newMoonJd, chinaTz, lunarNewYear } from './cny.mjs';

const { I, Lunar } = loadEngine();
const dayNo = (jd, tz) => Math.floor(jd - I.JDN_EPOCH + 0.5 + tz / 24);

/* 중기 12개 — 황경과 그 무렵의 양력 날짜 */
const ZHONGQI = [[300, 1, 20], [330, 2, 19], [0, 3, 20], [30, 4, 20], [60, 5, 21], [90, 6, 21], [120, 7, 23], [150, 8, 23], [180, 9, 23], [210, 10, 23], [240, 11, 22], [270, 12, 22]];
const termCache = new Map();
function termDay(y, lon) {
  const key = y * 1000 + lon;
  if (!termCache.has(key)) {
    const [, m, d] = ZHONGQI.find((z) => z[0] === lon);
    const approx = I.daysFromCivil(y, m, d) + I.JDN_EPOCH - 0.5;
    termCache.set(key, dayNo(I.findTermJd(lon, approx - 6, approx + 6), chinaTz(y)));
  }
  return termCache.get(key);
}

/* Y-1년 동지 달(11월)부터 Y년 동지 달 앞까지의 달들 */
function sui(Y) {
  const ws1 = termDay(Y - 1, 270), ws2 = termDay(Y, 270);
  let k = Math.floor((Y - 1 + 10.5 / 12 - 2000) * 12.3685) - 2;
  const nm = [];
  for (let i = 0; i < 18; i++, k++) nm.push(dayNo(newMoonJd(k), chinaTz(Y)));
  const lastOnOrBefore = (day) => { let idx = -1; nm.forEach((d, i) => { if (d <= day) idx = i; }); return idx; };
  const a = lastOnOrBefore(ws1), b = lastOnOrBefore(ws2);
  if (a < 0 || b + 1 >= nm.length || (b - a !== 12 && b - a !== 13)) throw new Error(`chinese-lunar: ${Y}년 달 수가 이상함 (${b - a})`);
  const terms = [termDay(Y - 1, 270)].concat(ZHONGQI.filter((z) => z[0] !== 270).map((z) => termDay(Y, z[0])));
  const months = [];
  let num = 11, leapUsed = false;
  for (let i = a; i < b; i++) {
    const start = nm[i], end = nm[i + 1];
    const hasTerm = terms.some((t) => t >= start && t < end);
    let leap = false;
    if (i > a) {
      if (b - a === 13 && !leapUsed && !hasTerm) { leap = true; leapUsed = true; } else num = (num % 12) + 1;
    }
    months.push({ lunarYear: num >= 11 && i - a < 3 ? Y - 1 : Y, month: num, leap, start, days: end - start });
  }
  return months;
}

/* y0~y1 음력 해의 모든 달 — [{ lunarYear, month, leap, start(1970-01-01=0 일수), days }] */
export function chineseMonths(y0, y1) {
  const out = [];
  for (let Y = y0; Y <= y1 + 1; Y++) for (const m of sui(Y)) if (m.lunarYear >= y0 && m.lunarYear <= y1) out.push(m);
  return out;
}

/* 양력 → 중국 음력 (months = chineseMonths 결과) */
export function toChineseLunar(months, y, m, d) {
  const dn = I.daysFromCivil(y, m, d);
  let lo = 0, hi = months.length - 1;
  if (dn < months[0].start || dn >= months[hi].start + months[hi].days) return null;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (months[mid].start <= dn) lo = mid; else hi = mid - 1; }
  const mo = months[lo];
  return { year: mo.lunarYear, month: mo.month, leap: mo.leap, day: dn - mo.start + 1, monthDays: mo.days };
}

export const civilOf = (dn) => I.civilFromDays(dn);

/* 알려진 중국 음력 윤달 (홍콩 천문대 음양력 대조표 기준, 1950~2035) */
const KNOWN_LEAPS = { 1952: 5, 1955: 3, 1957: 8, 1960: 6, 1963: 4, 1966: 3, 1968: 7, 1971: 5, 1974: 4, 1976: 8, 1979: 6, 1982: 4, 1984: 10, 1987: 6, 1990: 5, 1993: 3, 1995: 8, 1998: 5, 2001: 4, 2004: 2, 2006: 7, 2009: 5, 2012: 4, 2014: 9, 2017: 6, 2020: 4, 2023: 2, 2025: 6, 2028: 5, 2031: 3, 2033: 11 };
/* 2026·2027년 달의 시작일 — 다른 출처(prokerala 성별 달력 표)와 대조한 값 */
const KNOWN_STARTS = {
  2026: ['2026-02-17', '2026-03-19', '2026-04-17', '2026-05-17', '2026-06-15', '2026-07-14', '2026-08-13', '2026-09-11', '2026-10-10', '2026-11-09', '2026-12-09', '2027-01-08'],
  2027: ['2027-02-06', '2027-03-08', '2027-04-07', '2027-05-06', '2027-06-05', '2027-07-04', '2027-08-02', '2027-09-01', '2027-09-30', '2027-10-29', '2027-11-28', '2027-12-28'],
};

/* 자체 검증 — 어긋나면 던진다. 돌려주는 값: 한국 음력표와 다른 달의 목록(설명용) */
export function selfCheck(months) {
  const iso = (dn) => { const c = I.civilFromDays(dn); return `${c.y}-${String(c.m).padStart(2, '0')}-${String(c.d).padStart(2, '0')}`; };
  const y0 = months[0].lunarYear, y1 = months[months.length - 1].lunarYear;
  for (let y = Math.max(y0, 1950); y <= Math.min(y1, 2035); y++) {
    const leaps = months.filter((m) => m.lunarYear === y && m.leap);
    const want = KNOWN_LEAPS[y] || 0, got = leaps.length ? leaps[0].month : 0;
    if (leaps.length > 1 || want !== got) throw new Error(`chinese-lunar: ${y}년 윤달 ${got} ≠ 알려진 값 ${want}`);
    const n = months.filter((m) => m.lunarYear === y).length;
    if (n !== (want ? 13 : 12)) throw new Error(`chinese-lunar: ${y}년 달 수 ${n}`);
  }
  for (const m of months) if (m.days !== 29 && m.days !== 30) throw new Error(`chinese-lunar: ${m.lunarYear}-${m.month} 길이 ${m.days}`);
  for (let y = Math.max(y0, 1930); y <= Math.min(y1, 2033); y++) {
    const first = months.find((m) => m.lunarYear === y && m.month === 1 && !m.leap), ny = lunarNewYear(y);
    if (!first || first.start !== ny.dn) throw new Error(`chinese-lunar: ${y}년 춘절 ${first && iso(first.start)} ≠ cny.mjs ${iso(ny.dn)}`);
  }
  for (const [y, list] of Object.entries(KNOWN_STARTS)) {
    const got = months.filter((m) => m.lunarYear === +y).map((m) => iso(m.start));
    if (got.join() !== list.join()) throw new Error(`chinese-lunar: ${y}년 달 시작일이 대조값과 다름\n  ${got.join(' ')}\n  ${list.join(' ')}`);
  }
  /* 한국 음력표와 대조 — 다른 달만 모은다 */
  const diffs = [];
  if (Lunar) {
    for (const m of months) {
      const c = I.civilFromDays(m.start);
      if (c.y < 1900 || c.y > 2049 || !Lunar.setSolarDate(c.y, c.m, c.d)) continue;
      const k = Lunar.getLunarCalendar();
      if (k.day !== 1 || k.month !== m.month || !!k.intercalation !== m.leap) diffs.push({ china: `${m.lunarYear}-${m.leap ? '윤' : ''}${m.month}-1`, solar: iso(m.start), korea: `${k.year}-${k.intercalation ? '윤' : ''}${k.month}-${k.day}` });
    }
  }
  return diffs;
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('tools/chinese-lunar.mjs')) {
  const months = chineseMonths(1930, 2040);
  const diffs = selfCheck(months);
  console.log(`중국 음력 1930~2040: 달 ${months.length}개 · 자체 검증 통과 · 한국 음력표와 다른 달 ${diffs.length}개`);
  for (const d of diffs) console.log(`  ${d.solar}  중국 ${d.china}  한국 ${d.korea}`);
}
