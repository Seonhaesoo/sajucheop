/* '이번 주 궁합 상대' — 60일주 중 하나를 주 단위로 정하는 규칙. 사이트(app.js)와 봇이 같은 식을 쓴다.
 * 기준 월요일 2026-09-07부터 주마다 일주 인덱스가 1씩 돈다(60주 한 바퀴).
 * 생일은 1990~1997년 중 그 일주가 드는 첫 날로 고정 — 실제 인물이 아닌 캐릭터. */
import { loadEngine, kstToday } from './engine.mjs';
import { ILJU } from './ilju-data.mjs';

const { M, I, G } = loadEngine();
const EPOCH = I.daysFromCivil(2026, 9, 7);

export function weekMondayDn(t = kstToday()) {
  const dn = I.daysFromCivil(t.y, t.m, t.d);
  const wd = ((dn + 4) % 7 + 7) % 7;
  return dn - ((wd + 6) % 7);
}

export function personaForWeek(mondayDn = weekMondayDn()) {
  const weekIdx = Math.floor((mondayDn - EPOCH) / 7);
  const idx = ((weekIdx % 60) + 60) % 60;
  const year = 1990 + (idx % 8);
  const baseDn = I.daysFromCivil(year, 1, 1);
  const k0 = I.dayPillarIndex(baseDn + I.JDN_EPOCH);
  const cv = I.civilFromDays(baseDn + (((idx - k0) % 60) + 60) % 60);
  const e = ILJU[idx];
  const input = { name: e.alias.slice(0, 12), year: cv.y, month: cv.m, day: cv.d, unknownTime: true, gender: idx % 2 ? 'F' : 'M', applySolarTime: true, persona: true };
  return { idx, alias: e.alias, kor: e.kor, han: e.han, slug: e.slug, input, stem: idx % 10, url: 'https://sajucheop.com/#p=' + G.encodeProfile(input) };
}
