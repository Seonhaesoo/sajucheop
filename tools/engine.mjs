/* 브라우저용 엔진(docs/js/*.js)을 Node에서 그대로 쓰기 위한 로더.
 * 각 파일은 window.X 로 노출하는 IIFE라, window/self/globalThis를 한 객체로 묶은
 * vm 컨텍스트에서 실행하면 DOM 없이도 동작한다 (계산 모듈만 로드). */
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function loadEngine() {
  const w = {};
  const ctx = {
    window: w, self: w, globalThis: w,
    console, Date, Math, JSON, TextEncoder, TextDecoder,
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    atob: (s) => Buffer.from(s, 'base64').toString('binary')
  };
  vm.createContext(ctx);
  for (const f of ['vendor-korean-lunar', 'manseryeok', 'interpret', 'characters', 'gunghap', 'daily-quotes']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'docs/js', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
  }
  const M = w.Manseryeok;
  return {
    M,
    I: M._internals,
    Interp: w.Interpret,
    C: w.SajuCharacters,
    G: w.Gunghap,
    Q: w.DailyQuotes,
    Lunar: w.KoreanLunarCalendar ? new w.KoreanLunarCalendar() : null
  };
}

/* KST 기준 오늘 */
export function kstToday() {
  const t = new Date(Date.now() + 9 * 3600e3);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export const ROOT_DIR = ROOT;
