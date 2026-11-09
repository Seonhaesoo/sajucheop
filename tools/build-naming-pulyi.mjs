/* 이름 풀이 — /naming/pulyi/ 한 장. 성(한글→성씨 한자)과 이름 1~2자(한글→이름 한자 사전 645자에서 고름)를 넣으면
 *  글자마다 원획·획수 음양·자원오행, 첫소리 발음오행(운해·해례 두 방식), 81수리 원형이정 4격(전통 작명 관습)을 규칙과 함께 보여 준다.
 *  생년월일(시)을 넣으면 사주 오행 분포(docs/js/manseryeok.js — 홈 계산기와 같은 엔진)에 이름 한자의 자원오행이 어디를 채우는지 본다.
 *  자료: 이름 한자 tools/build-hanja.mjs 의 groups(뜻·원획·자원오행·사전 주소) · 성씨 tools/surnames-ko.mjs(원획은 같은 규칙으로 계산)
 *  81수리 길흉·발음오행 표·오행 상생상극: docs/js/naming.js(작명 도구)를 그대로 쓴다 — 계산 코어(pulyiCore)는 한 벌을 써서 빌드 때 예시를 만들고 페이지에도 그대로 넣는다.
 *  모든 계산은 이용자 브라우저 안에서만. 수정일: 글 영역이 이전 빌드와 같으면 예전 날짜 유지(build-hanja 와 같은 방식).
 * 사용: node tools/build-naming-pulyi.mjs  (build-hanja.mjs 를 먼저 돌려 두는 편이 좋다 — 사전 주소가 그 쪽 결과를 가리킨다) */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR, loadEngine } from './engine.mjs';
import { shell, esc, breadcrumb } from './page-shell.mjs';
import { groups, slugOf, uni, strokeWhy, norm, EL_HAN, EL_ORDER, UNIHAN_VER } from './build-hanja.mjs';
import { SURNAMES, SURNAME_UNIHAN } from './surnames-ko.mjs';

const SITE = 'https://sajucheop.com';
const DOCS = path.join(ROOT_DIR, 'docs');
const URL = '/naming/pulyi/', REL = '../../';
const PUBLISHED = '2026-11-09';
const REVISED = '2026-11-09';   /* 글 영역을 고친 날 — 내용을 또 고치면 그날로 */
const NAV = [{ href: REL, label: '사주 보기' }, { href: REL + 'naming/', label: '이름 짓기' }, { href: REL + 'naming/hanja/', label: '이름 한자 사전' }];

/* ---------- 자료: 이름 한자(음별) ---------- */
/* DICT[음] = [[한자, 뜻, 원획, 쓰는 획수, 자원오행, 사전 주소 조각(slug), 원획이 다른 까닭]]
 *  열쇠는 사전의 음 그대로(라·나, 리·이, 류·유 는 다른 음). 찾을 때는 입력 음 그대로 먼저, 없으면 두음법칙으로 고친 음(련→연 …)으로 */
const DICT = {};
let dictTotal = 0;
for (const g of groups) {
  if (DICT[g.s]) throw new Error('음 겹침: ' + g.s);
  DICT[g.s] = g.items.map((x) => [x.h, x.mean, x.won, x.written, x.el, slugOf(g), x.won !== x.written ? strokeWhy(x) : '']);
  dictTotal += g.items.length;
}
const dictOf = (s) => DICT[s] || DICT[norm(s)] || null;

/* ---------- 자료: 성씨 한자 ---------- */
/* SUR[음] = [[한자, 원획, 쓰는 획수, 원획이 다른 까닭]] — 원획은 build-hanja 의 uni() 규칙 그대로, 음이 Unihan 에 있는지 확인 */
const SUR = {};
const surChars = new Set();
for (const [s, list] of SURNAMES) {
  SUR[s] = list.map((h) => {
    const u = uni(h, SURNAME_UNIHAN);
    if (!u) throw new Error('성씨 한자 자료 없음: ' + h);
    if (!u.readings.some((r) => norm(r.r) === norm(s))) throw new Error(`성씨 ${s} ${h} — Unihan 음(${u.readings.map((r) => r.r).join('·')})과 다름`);
    surChars.add(h);
    return [h, u.won, u.written, u.won !== u.written ? strokeWhy({ h, rad: u.rad }) : ''];
  });
}
/* 작명 도구(naming.js)의 성씨 원획과 대조 — 다르면 멈춘다(王은 셈법이 갈려 성씨 표에서 뺐다) */
const namingSrc = fs.readFileSync(path.join(DOCS, 'js', 'naming.js'), 'utf8');
const nmSur = {};
for (const m of namingSrc.matchAll(/\{ h: '(.)', r: '(.)', s: (\d+) \}/g)) nmSur[m[1]] = +m[3];
const surDiff = Object.entries(SUR).flatMap(([, list]) => list).filter(([h, won]) => nmSur[h] && nmSur[h] !== won);
if (surDiff.length) throw new Error('작명 도구의 성씨 원획과 다름: ' + surDiff.map(([h, won]) => `${h} ${won}/${nmSur[h]}`).join(' '));
const SUR_SOUNDS = Object.keys(SUR).length, SUR_CHARS = surChars.size;
const surDiffWritten = [...surChars].map((h) => ({ h, u: uni(h, SURNAME_UNIHAN) })).filter((x) => x.u.won !== x.u.written);

/* ---------- 계산 코어 — 브라우저와 빌드가 같은 코드를 쓴다 (ES5, DOM 없음) ---------- */
const CORE = `function pulyiCore(NM) {
  var EL_HAN = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };
  var EL_ORDER = ['목', '화', '토', '금', '수'];
  var SWAP = { '토': '수', '수': '토' };
  var SCHOOL = { unhae: '운해 방식(ㅇ·ㅎ 토, ㅁ·ㅂ·ㅍ 수)', haerye: '해례 방식(ㅇ·ㅎ 수, ㅁ·ㅂ·ㅍ 토)' };
  var SCHOOL_SHORT = { unhae: '운해 방식', haerye: '해례 방식' };
  var GY = { '원격': ['이름 글자끼리 더한 수', '초년·바탕'], '형격': ['성과 이름 첫 글자를 더한 수', '청년·주운'], '이격': ['성과 이름 끝 글자를 더한 수', '중년·대외'], '정격': ['성과 이름을 모두 더한 수', '총운·말년'] };
  var ICON = { '대길': '◎', '길': '○', '평': '△', '흉': '✕' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function soundEl(r, school) { var e = NM.soundElOf(r); if (!e) return null; return school === 'haerye' ? (SWAP[e] || e) : e; }
  function relName(a, b) { var v = NM.elRel(a, b); return v === 2 ? '상생' : v === 0 ? '상극' : '비화'; }
  function cho(r) { var c = r.charCodeAt(0) - 0xAC00; return c < 0 || c > 11171 ? '' : ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'][Math.floor(c / 588)]; }
  function P(word, a, b) { return ((word.charCodeAt(word.length - 1) - 0xAC00) % 28) ? a : b; }
  function uniq(arr) { var o = []; arr.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); return o; }

  /* inp = { sur: {h, r, won, written, why}, chars: [{h, r, won, written, el, mean, slug, why}] 1~2, saju: {elements, pillars:[{name, kor, han}], unknownTime} | null } */
  function analyze(inp) {
    var sur = inp.sur, chars = inp.chars, one = chars.length === 1, n1 = chars[0], n2 = chars[1] || null;
    var all = [sur].concat(chars);
    var totalWon = all.reduce(function (s, c) { return s + c.won; }, 0);
    var lab = function (c) { return (c.h || c.r) + ' ' + c.won; };
    var gyeok = [];
    gyeok.push({ name: '원격', formula: one ? lab(n1) : lab(n1) + ' + ' + lab(n2), sum: one ? n1.won : n1.won + n2.won });
    gyeok.push({ name: '형격', formula: lab(sur) + ' + ' + lab(n1), sum: sur.won + n1.won });
    if (!one) gyeok.push({ name: '이격', formula: lab(sur) + ' + ' + lab(n2), sum: sur.won + n2.won });
    gyeok.push({ name: '정격', formula: all.map(lab).join(' + '), sum: totalWon });
    gyeok.forEach(function (g) { g.su = NM.su81(g.sum); g.desc = GY[g.name]; });
    var tiers = {}; gyeok.forEach(function (g) { tiers[g.su.tier] = (tiers[g.su.tier] || 0) + 1; });
    var parity = all.map(function (c) { return c.won % 2 ? '양' : '음'; });
    var allSame = parity.every(function (p) { return p === parity[0]; });
    var sound = {};
    ['unhae', 'haerye'].forEach(function (sc) {
      var els = all.map(function (c) { return soundEl(c.r, sc); }), rels = [];
      for (var i = 0; i < els.length - 1; i++) rels.push(relName(els[i], els[i + 1]));
      sound[sc] = { els: els, rels: rels, clash: rels.indexOf('상극') >= 0, allGen: rels.every(function (x) { return x === '상생'; }), allSame: rels.every(function (x) { return x === '비화'; }) };
    });
    var soundDiffers = sound.unhae.els.join() !== sound.haerye.els.join();
    var jawon = chars.filter(function (c) { return c.el; }).map(function (c) { return c.el; });
    var saju = null;
    if (inp.saju && inp.saju.elements) {
      var el = inp.saju.elements, after = {}, min = Infinity;
      EL_ORDER.forEach(function (e) { after[e] = el[e]; if (el[e] < min) min = el[e]; });
      jawon.forEach(function (e) { after[e]++; });
      var weakest = EL_ORDER.filter(function (e) { return el[e] === min; });
      var zero = EL_ORDER.filter(function (e) { return el[e] === 0; });
      saju = { elements: el, after: after, min: min, weakest: weakest, zero: zero, adds: uniq(jawon),
        fills: weakest.filter(function (e) { return jawon.indexOf(e) >= 0; }), fillsZero: zero.filter(function (e) { return jawon.indexOf(e) >= 0; }),
        pillars: inp.saju.pillars || [], unknownTime: !!inp.saju.unknownTime, total: EL_ORDER.reduce(function (s, e) { return s + el[e]; }, 0) };
    }
    return { sur: sur, chars: chars, one: one, all: all, totalWon: totalWon, gyeok: gyeok, tiers: tiers, parity: parity, allSame: allSame, sound: sound, soundDiffers: soundDiffers, jawon: jawon, saju: saju };
  }

  /* 사실만 이어 붙인 요약 — 길흉 단정 없이 */
  function summary(a, school) {
    var nameKo = a.sur.r + a.chars.map(function (c) { return c.r; }).join('');
    var nameHan = a.all.every(function (c) { return c.h; }) ? '(' + a.all.map(function (c) { return c.h; }).join('') + ')' : '';
    var s = [];
    s.push(nameKo + nameHan + P(nameKo, '은', '는') + ' 원획이 ' + a.all.map(function (c) { return c.won; }).join('·') + '획으로 모두 ' + a.totalWon + '획이고, 홀·짝은 ' + a.parity.join('·') + (a.allSame ? '으로 한쪽에 몰려 있어요.' : '으로 섞여 있어요.'));
    if (a.jawon.length) {
      var withEl = a.chars.filter(function (c) { return c.el; }), parts = withEl.map(function (c) { return c.h + ' ' + c.el + '(' + EL_HAN[c.el] + ')'; });
      var lastEl = withEl[withEl.length - 1].el;
      s.push('이름 글자의 자원오행은 ' + (parts.length === 2 ? parts[0] + P(withEl[0].el, '과 ', '와 ') + parts[1] : parts[0]) + P(lastEl, '이에요', '예요') + '.' + (withEl.length < a.chars.length ? ' 직접 획수를 넣은 글자는 자원오행을 몰라 빼고 봤어요.' : ''));
    }
    var so = a.sound[school], oth = a.sound[school === 'unhae' ? 'haerye' : 'unhae'];
    var othLast = oth.els[oth.els.length - 1] || '행';
    s.push('첫소리 발음오행은 ' + so.els.map(function (e) { return e || '?'; }).join('·') + '(' + SCHOOL_SHORT[school] + ')으로 글자 사이가 ' + so.rels.join('·') + P(so.rels[so.rels.length - 1], '이에요', '예요') + (a.soundDiffers ? ' — ' + SCHOOL_SHORT[school === 'unhae' ? 'haerye' : 'unhae'] + '으로 보면 ' + oth.els.join('·') + P(othLast, '이', '가') + ' 돼요.' : '.'));
    var t = ['대길', '길', '평', '흉'].filter(function (k) { return a.tiers[k]; }).map(function (k) { return k + ' ' + a.tiers[k]; }).join('·');
    s.push('81수리 ' + a.gyeok.length + '격은 ' + a.gyeok.map(function (g) { return g.name + ' ' + g.su.v + '수'; }).join(', ') + '로, 전통 길흉 표에서는 ' + t + '에 해당해요. 이 표는 획수 조합으로 길흉을 나눈 전통 작명 관습이고 검증된 근거는 아니에요.');
    if (a.saju) {
      var el = a.saju.elements;
      var dist = EL_ORDER.map(function (e) { return e + ' ' + el[e]; }).join('·');
      var base = '생년월일로 세운 사주 ' + a.saju.total + '글자의 오행은 ' + dist + P('행', '이고', '고') + ', ' + (a.saju.zero.length ? a.saju.zero.join('·') + P(a.saju.zero[a.saju.zero.length - 1], '이', '가') + ' 없어요' : '가장 적은 오행은 ' + a.saju.weakest.join('·') + '(' + a.saju.min + ')이에요') + '. ';
      if (!a.jawon.length) base += '이름 글자의 자원오행을 모르는 상태라 무엇을 채우는지는 볼 수 없어요.';
      else if (a.saju.fills.length) base += '이름 한자가 보태는 ' + a.saju.adds.join('·') + ' 가운데 ' + a.saju.fills.join('·') + P(a.saju.fills[a.saju.fills.length - 1], '이', '가') + ' 가장 적은 자리를 채워요.';
      else base += '이름 한자가 보태는 오행은 ' + a.saju.adds.join('·') + P(a.saju.adds[a.saju.adds.length - 1], '이라', '라') + ' 가장 적은 ' + a.saju.weakest.join('·') + P(a.saju.weakest[a.saju.weakest.length - 1], '을', '를') + ' 직접 채우지는 않아요.';
      s.push(base);
    }
    return s.join(' ');
  }

  function elTag(e) { return e ? '<span class="hj-el ' + e + '">' + e + '(' + EL_HAN[e] + ')</span>' : '<span class="np-dim">—</span>'; }
  function render(a, o) {
    o = o || {}; var school = o.school || 'unhae', rel = o.rel || '';
    var so = a.sound[school], other = school === 'unhae' ? 'haerye' : 'unhae';
    var nameKo = a.sur.r + a.chars.map(function (c) { return c.r; }).join('');
    var nameHan = a.all.map(function (c) { return c.h || '□'; }).join('');
    var rows = a.all.map(function (c, i) {
      var isSur = i === 0;
      var link = !isSur && c.slug ? '<a class="np-dict" href="' + rel + 'naming/hanja/' + c.slug + '/#h-' + c.h + '">사전</a>' : '';
      var el = isSur ? '<span class="np-dim">성은 안 셈</span>' : (c.el ? elTag(c.el) : '<span class="np-dim">모름</span>');
      return '<tr><td class="h">' + (c.h ? esc(c.h) : '<span class="np-dim">□</span>') + '<small>' + esc(c.r) + (isSur ? ' · 성' : '') + '</small></td>' +
        '<td>' + (isSur ? '<span class="np-dim">성씨</span>' : (c.mean ? '<b>' + esc(c.mean) + '</b>' : '<span class="np-dim">직접 넣은 획수</span>')) + (link ? ' ' + link : '') + '</td>' +
        '<td><b>' + c.won + '획</b>' + (c.written && c.written !== c.won ? '<small>쓰는 획수 ' + c.written + '획' + (c.why ? ' · ' + esc(c.why) : '') + '</small>' : '') + '</td>' +
        '<td>' + a.parity[i] + '<small>' + (a.parity[i] === '양' ? '홀수' : '짝수') + '</small></td>' +
        '<td>' + el + '</td>' +
        '<td>' + (so.els[i] ? elTag(so.els[i]) : '—') + '<small>첫소리 ' + cho(c.r) + (a.soundDiffers && a.sound[other].els[i] !== so.els[i] ? ' · 다른 방식 ' + a.sound[other].els[i] : '') + '</small></td></tr>';
    }).join('');
    var gy = a.gyeok.map(function (g) {
      return '<div class="np-gy"><div class="np-gy-head"><b>' + g.name + '</b><span class="np-gy-tier t-' + g.su.tier + '">' + ICON[g.su.tier] + ' ' + g.su.tier + '</span></div>' +
        '<div class="np-gy-f">' + esc(g.formula) + ' = <b>' + g.sum + '</b>' + (g.sum > 81 ? ' → 81을 넘어 80을 뺀 <b>' + g.su.v + '</b>' : '') + '</div>' +
        '<div class="np-gy-d">' + g.su.v + '수 ' + esc(g.su.label) + '격 · ' + g.desc[0] + ' — 전통에서 ' + g.desc[1] + '</div></div>';
    }).join('');
    var chain = so.els.map(function (e, i) { return '<b class="np-ch ' + (e || '') + '">' + (e || '?') + '</b>' + (i < so.rels.length ? '<i class="np-rel r-' + so.rels[i] + '">' + so.rels[i] + '</i>' : ''); }).join('');
    var soundLine = so.clash ? '첫소리 오행 사이에 상극이 있어요 — 전통 작명에서는 소리가 부딪힌다고 보고 피하는 배열이에요.' : so.allGen ? '첫소리 오행이 모두 상생으로 이어져요 — 전통 작명에서 가장 선호하는 배열이에요.' : so.allSame ? '첫소리 오행이 모두 같아요(비화) — 상극은 아니지만 한 기운으로 몰린 배열이에요.' : '첫소리 오행에 상극은 없고 상생과 비화가 섞여 있어요.';
    var sajuHtml = '';
    if (a.saju) {
      var el = a.saju.elements, after = a.saju.after, max = 1;
      EL_ORDER.forEach(function (e) { if (after[e] > max) max = after[e]; });
      var bars = EL_ORDER.map(function (e) {
        var c = el[e], add = after[e] - c, zero = c === 0;
        return '<div class="el-bar-row"><div class="el-name' + (zero ? ' zero' : '') + '">' + EL_HAN[e] + ' ' + e + '</div><div class="track">' +
          (c ? '<div class="fill np-fill ' + e + '" style="width:' + Math.round(c / max * 100) + '%"></div>' : '') +
          (add ? '<div class="fill np-fill-add ' + e + '" style="left:' + Math.round(c / max * 100) + '%;width:' + Math.round(add / max * 100) + '%"></div>' : '') +
          '</div><div class="el-count' + (zero ? ' zero' : '') + '">' + c + (add ? '<small>+' + add + '</small>' : '') + '</div></div>';
      }).join('');
      var pil = a.saju.pillars.map(function (p) { return '<span><small>' + esc(p.name) + '</small><b>' + esc(p.han) + '</b><em>' + esc(p.kor) + '</em></span>'; }).join('');
      var line = !a.jawon.length ? '이름 글자의 자원오행을 모르는 상태라 무엇을 채우는지는 볼 수 없어요.'
        : a.saju.fillsZero.length ? '사주에 없는 ' + a.saju.fillsZero.join('·') + P(a.saju.fillsZero[a.saju.fillsZero.length - 1], '을', '를') + ' 이름 한자가 보태요. 전통 작명에서 가장 먼저 보는 보완이에요.'
        : a.saju.fills.length ? '가장 적은 ' + a.saju.weakest.join('·') + '(' + a.saju.min + ') 가운데 ' + a.saju.fills.join('·') + P(a.saju.fills[a.saju.fills.length - 1], '을', '를') + ' 이름 한자가 보태요.'
        : '이름 한자가 보태는 ' + a.saju.adds.join('·') + P(a.saju.adds[a.saju.adds.length - 1], '은', '는') + ' 가장 적은 ' + a.saju.weakest.join('·') + '(' + a.saju.min + ')' + P('행', '이', '가') + ' 아니에요. 부족한 오행을 채우는 것이 목표라면 그 오행의 한자를 사전에서 찾아 바꿔 넣고 다시 비교해 보세요.';
      sajuHtml = '<h3 class="np-h">사주 오행과 이름이 보태는 오행</h3><p class="np-rule">규칙: 생년월일(시)로 세운 ' + a.saju.total + '글자(' + (a.saju.unknownTime ? '시를 몰라 세 기둥' : '네 기둥') + ')의 오행을 세고, 이름 글자의 자원오행을 하나씩 더해 봐요. 옅은 막대가 이름이 보태는 몫이에요.</p>' +
        '<div class="np-pillars">' + pil + '</div><div class="el-bars np-bars">' + bars + '</div><p>' + line + '</p>';
    }
    return '<div class="np-head"><div class="np-name">' + esc(nameKo) + '</div><div class="np-han">' + esc(nameHan) + '</div><div class="np-sub">원획 합 ' + a.totalWon + '획 · 음양 ' + a.parity.join('·') + ' · 발음오행 ' + so.els.map(function (e) { return e || '?'; }).join('·') + '</div></div>' +
      '<h3 class="np-h">글자별 원획·음양·오행</h3><p class="np-rule">규칙: 원획은 강희자전 부수 원형으로 센 획수(氵→水 4획, 艹→艸 6획, 王→玉 5획, 阝→阜 8·邑 7획, 辶→辵 7획). 홀수는 양, 짝수는 음. 자원오행은 한자의 부수에 따라 정해진 오행이고, 발음오행은 첫소리(초성)에 따라 정해져요.</p>' +
      '<table class="hj-table np-table"><tr><th>글자</th><th>뜻</th><th>원획</th><th>음양</th><th>자원오행</th><th>발음오행</th></tr>' + rows + '</table>' +
      '<p>' + (a.allSame ? '획수가 모두 ' + a.parity[0] + '(' + (a.parity[0] === '양' ? '홀수' : '짝수') + ')이라 전통 작명에서 말하는 음양 배열이 한쪽으로 몰려 있어요.' : '홀수(양)와 짝수(음)가 섞여 있어 전통 작명에서 말하는 음양 배열은 치우치지 않았어요.') + '</p>' +
      '<h3 class="np-h">81수리 원형이정 ' + a.gyeok.length + '격 <small>전통 작명 관습</small></h3><p class="np-rule">규칙: 원격은 이름 글자끼리, 형격은 성+이름 첫 글자, 이격은 성+이름 끝 글자, 정격은 전부 더한 원획. 81을 넘으면 80을 빼요. 길흉은 널리 통용되는 81수리 표를 따랐고, 표마다 한두 수가 다르게 적혀 있기도 해요.' + (a.one ? ' 외자 이름은 이격이 없어 세 격만 봐요(두 번째 글자 자리에 가성수 1을 넣어 네 격으로 보는 유파도 있어요).' : '') + '</p>' +
      '<div class="np-gys">' + gy + '</div>' +
      '<h3 class="np-h">발음오행 <small>' + SCHOOL[school] + '</small></h3><p class="np-rule">규칙: ㄱ·ㅋ 목, ㄴ·ㄷ·ㄹ·ㅌ 화, ㅅ·ㅈ·ㅊ 금은 어느 방식이나 같고, ㅇ·ㅎ와 ㅁ·ㅂ·ㅍ만 토·수가 바뀌어요. 이웃한 글자끼리 상생(서로 살림)·비화(같음)·상극(부딪힘)을 봐요.</p>' +
      '<div class="np-chain">' + chain + '</div><p>' + soundLine + (a.soundDiffers ? ' ' + SCHOOL_SHORT[other] + '으로 보면 ' + a.sound[other].els.join('·') + P(a.sound[other].els[a.sound[other].els.length - 1] || '행', '이', '가') + ' 되어 ' + a.sound[other].rels.join('·') + P(a.sound[other].rels[a.sound[other].rels.length - 1], '이에요', '예요') + '.' : ' ㅇ·ㅎ·ㅁ·ㅂ·ㅍ 첫소리가 없어서 두 방식의 결과가 같아요.') + '</p>' +
      sajuHtml +
      '<h3 class="np-h">요약</h3><p class="np-sum">' + summary(a, school) + '</p>';
  }
  return { analyze: analyze, render: render, summary: summary, soundEl: soundEl, SCHOOL: SCHOOL };
}`;

/* ---------- 예시(빌드 때 계산) — 흔한 중립적 이름: 이서윤(李瑞潤), 2026년 3월 15일 10시 30분생 ---------- */
const { M, W } = loadEngine(['naming']);
const core = new Function('return ' + CORE)()(W.Naming);
const EX = { sur: '이', surH: '李', name: '서윤', nameH: '瑞潤', birth: { y: 2026, m: 3, d: 15, hh: 10, mi: 30 } };
const findSur = (s, h) => { const row = SUR[s].find((x) => x[0] === h); return { h: row[0], r: s, won: row[1], written: row[2], why: row[3] }; };
const findChar = (s, h) => { const row = dictOf(s).find((x) => x[0] === h); return { h: row[0], r: s, mean: row[1], won: row[2], written: row[3], el: row[4], slug: row[5], why: row[6] }; };
const PILLAR_NAMES = ['연주', '월주', '일주', '시주'];
function sajuOf(b) {
  const r = M.compute({ year: b.y, month: b.m, day: b.d, hour: b.hh, minute: b.mi, unknownTime: b.hh == null, gender: 'M', applySolarTime: true });
  const ps = [r.pillars.year, r.pillars.month, r.pillars.day, r.pillars.hour].map((p, i) => p && Object.assign({ name: PILLAR_NAMES[i] }, M.ganjiName(p.stem, p.branch))).filter(Boolean);
  return { elements: r.elements, pillars: ps, unknownTime: r.input.unknownTime };
}
const exInput = { sur: findSur(EX.sur, EX.surH), chars: [...EX.name].map((s, i) => findChar(s, EX.nameH[i])), saju: sajuOf(EX.birth) };
const exA = core.analyze(exInput);
const exHtml = core.render(exA, { school: 'unhae', rel: REL });
/* 빌드 때 손으로 맞춰 본 값과 대조 — 李 7, 瑞 14, 潤 16: 원격 30, 형격 21, 이격 23, 정격 37 */
const exCheck = exA.gyeok.map((g) => g.name + g.sum).join(' ');
if (exCheck !== '원격30 형격21 이격23 정격37') throw new Error('예시 4격이 손계산과 다름: ' + exCheck);

/* ---------- 본문 ---------- */
const STYLE = `<style>
    .hj-table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 6px 0 14px; }
    .hj-table th, .hj-table td { padding: 9px 6px; border-bottom: 1px solid var(--line-soft); text-align: left; vertical-align: top; }
    .hj-table th { font-size: 12px; color: var(--muted); font-weight: 500; }
    .hj-table td.h { font-family: 'Noto Serif KR', serif; font-size: 24px; line-height: 1.1; width: 40px; }
    .hj-table td small { color: var(--faint); display: block; font-size: 11.5px; margin-top: 2px; }
    .hj-table td.h small { font-family: var(--sans, 'Noto Sans KR', sans-serif); font-size: 10px; line-height: 1.3; }
    .hj-el { display: inline-block; font-size: 11.5px; padding: 1px 8px; border-radius: 999px; border: 1px solid var(--line); font-style: normal; white-space: nowrap; }
    .hj-el.목, .np-ch.목 { color: #2F6B3A; border-color: #9CC3A3; } .hj-el.화, .np-ch.화 { color: #B8382D; border-color: #E2A59E; } .hj-el.토, .np-ch.토 { color: #8A6A1F; border-color: #D9C38A; }
    .hj-el.금, .np-ch.금 { color: #6E6455; border-color: #C9C0B0; } .hj-el.수, .np-ch.수 { color: #2A4B7C; border-color: #9DB3D6; }
    .np-form { margin: 10px 0 16px; padding: 16px; background: #FFFDF9; border: 1px solid var(--line); border-radius: 12px; }
    .np-form label, .np-form .np-l { display: block; font-size: 12px; font-weight: 700; color: var(--muted); }
    .np-form input[type="text"], .np-form select, .np-form input[type="time"] { display: block; width: 100%; box-sizing: border-box; margin-top: 5px; font: inherit; font-size: 16px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); }
    .np-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-start; margin-top: 10px; }
    .np-row > label { flex: 1 1 120px; }
    .np-row .np-w2 { flex: 2 1 160px; }
    .np-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .np-chip { font: inherit; font-size: 12.5px; padding: 6px 10px; border: 1px solid var(--line-soft); border-radius: 8px; background: #fff; color: var(--ink); cursor: pointer; display: inline-flex; align-items: baseline; gap: 6px; text-align: left; }
    .np-chip b { font-family: 'Noto Serif KR', serif; font-size: 20px; font-weight: 600; }
    .np-chip small { color: var(--muted); font-size: 11.5px; }
    .np-chip.on { border-color: var(--seal); background: #FBF3E6; }
    .np-chip.manual { border-style: dashed; }
    .np-chip.manual input { width: 52px; font: inherit; font-size: 13px; padding: 2px 4px; border: 1px solid var(--line); border-radius: 6px; margin-left: 4px; }
    .np-note { font-size: 12.5px; color: var(--muted); margin: 8px 0 0; line-height: 1.55; }
    .np-seg { display: inline-flex; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; margin-top: 5px; }
    .np-seg label { display: block; padding: 7px 12px; font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; background: #fff; }
    .np-seg input { position: absolute; opacity: 0; width: 0; height: 0; }
    .np-seg input:checked + span { color: var(--ink); font-weight: 700; }
    .np-seg label:has(input:checked) { background: #FBF3E6; }
    .np-go { margin-top: 14px; font: inherit; font-weight: 700; font-size: 15px; padding: 11px 22px; border: 0; border-radius: 8px; background: var(--seal); color: #F6F1E8; cursor: pointer; width: 100%; }
    .np-out { margin-top: 18px; }
    .np-out:empty { display: none; }
    .np-head { padding: 14px 16px; background: #211C15; color: #F6F1E8; border-radius: 12px; margin-bottom: 14px; }
    .np-name { font-size: 22px; font-weight: 700; }
    .np-han { font-family: 'Noto Serif KR', serif; font-size: 26px; letter-spacing: 4px; margin-top: 2px; }
    .np-sub { font-size: 12.5px; color: #CFC6B5; margin-top: 6px; }
    .ga-body h3.np-h { font-family: inherit; font-size: 15px; font-weight: 700; margin: 22px 0 4px; }
    .ga-body h3.np-h small { font-size: 12px; font-weight: 500; color: var(--faint); margin-left: 6px; }
    .np-rule { font-size: 13px; color: var(--muted); line-height: 1.6; margin: 0 0 8px; padding-left: 10px; border-left: 3px solid var(--line); }
    .np-dim { color: var(--faint); font-size: 12px; }
    .np-dict { font-size: 11.5px; border: 1px solid var(--line-soft); border-radius: 6px; padding: 1px 6px; text-decoration: none; white-space: nowrap; }
    .np-gys { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 8px 0 12px; }
    .np-gy { padding: 10px 12px; border: 1px solid var(--line-soft); border-radius: 10px; background: #FFFDF9; }
    .np-gy-head { display: flex; justify-content: space-between; align-items: baseline; font-size: 14px; }
    .np-gy-tier { font-size: 12.5px; font-weight: 700; }
    .np-gy-tier.t-대길 { color: #2F6B3A; } .np-gy-tier.t-길 { color: #2A4B7C; } .np-gy-tier.t-평 { color: #8A6A1F; } .np-gy-tier.t-흉 { color: #B8382D; }
    .np-gy-f { font-size: 13px; margin-top: 4px; }
    .np-gy-d { font-size: 12px; color: var(--muted); margin-top: 3px; line-height: 1.5; }
    .np-chain { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 8px 0; }
    .np-ch { display: inline-block; padding: 4px 12px; border: 1px solid; border-radius: 999px; font-size: 14px; }
    .np-rel { font-style: normal; font-size: 11.5px; color: var(--muted); }
    .np-rel.r-상극 { color: #B8382D; font-weight: 700; } .np-rel.r-상생 { color: #2F6B3A; }
    .np-pillars { display: flex; gap: 6px; margin: 8px 0; }
    .np-pillars span { flex: 1; text-align: center; padding: 8px 4px; border: 1px solid var(--line-soft); border-radius: 10px; background: #FFFDF9; }
    .np-pillars small { display: block; font-size: 11px; color: var(--faint); }
    .np-pillars b { display: block; font-family: 'Noto Serif KR', serif; font-size: 20px; letter-spacing: 2px; }
    .np-pillars em { display: block; font-style: normal; font-size: 11.5px; color: var(--muted); }
    .np-bars { margin: 10px 0 12px; }
    .np-bars .track { position: relative; }
    .np-fill { position: absolute; left: 0; top: 0; }
    .np-fill-add { position: absolute; top: 0; opacity: .35; }
    .np-fill.목, .np-fill-add.목 { background: var(--el-mok, #4E8A5A); } .np-fill.화, .np-fill-add.화 { background: var(--el-hwa, #C4463A); } .np-fill.토, .np-fill-add.토 { background: var(--el-to, #B08A3A); } .np-fill.금, .np-fill-add.금 { background: var(--el-geum, #8C8273); } .np-fill.수, .np-fill-add.수 { background: var(--el-su, #3B6190); }
    .np-bars .el-count { width: auto; min-width: 14px; } .np-bars .el-count small { color: var(--faint); font-weight: 500; margin-left: 2px; }
    .np-sum { line-height: 1.75; }
    .np-ex { padding: 14px 16px; border: 1px solid var(--line); border-radius: 12px; background: #fff; }
    @media (max-width: 480px) { .np-gys { grid-template-columns: 1fr; } .hj-table { font-size: 12.5px; } .hj-table th, .hj-table td { padding: 7px 4px; } .hj-table td.h { font-size: 20px; width: 32px; } }
  </style>`;

const faq = [
  ['원획이 쓰는 획수와 다른 글자가 있는 건 왜인가요?', '성명학은 부수를 강희자전의 원래 글자로 셉니다. 氵은 水 4획, 艹은 艸 6획, 王(玉변)은 5획, 왼쪽 阝은 阜 8획, 오른쪽 阝은 邑 7획, 辶은 辵 7획으로 세서 쓰는 획수보다 많아집니다. 이 페이지는 글자마다 쓰는 획수와 원획을 함께 보여 주고, 다른 이유도 적어 둡니다. 자전·유파에 따라 한두 획 다르게 보는 글자도 있으니 작명소에서 받은 획수와 다르면 그 차이부터 확인해 보세요.'],
  ['외자 이름은 4격을 어떻게 보나요?', `이름이 한 글자면 성+이름 끝 글자인 이격이 성립하지 않아 원격(이름 글자)·형격(성+이름)·정격(모두 더함) 세 격만 봅니다. 두 번째 글자 자리에 가성수 1을 넣어 네 격으로 보는 유파도 있는데, 이 페이지는 사주첩 이름 짓기 도구와 같은 방식으로 세 격을 보여 줍니다.`],
  ['발음오행에서 ㅇ·ㅎ가 토인지 수인지 왜 갈리나요?', '훈민정음 해례본은 어금닛소리(ㄱ·ㅋ) 목, 혓소리(ㄴ·ㄷ·ㄹ·ㅌ) 화, 입술소리(ㅁ·ㅂ·ㅍ) 토, 잇소리(ㅅ·ㅈ·ㅊ) 금, 목구멍소리(ㅇ·ㅎ) 수로 배정합니다. 뒤에 나온 훈민정음 운해(신경준)는 입술소리를 수, 목구멍소리를 토로 바꿔 배정했고 오늘날 작명 현장에서는 이 운해 방식이 더 널리 쓰입니다. 이 페이지는 운해 방식을 기본으로 하되 단추 하나로 해례 방식으로 바꿔 볼 수 있고, 두 방식의 결과가 다르면 그 사실을 적어 줍니다.'],
  ['81수리 길흉은 믿어도 되나요?', '81수리는 성과 이름 글자의 원획을 더한 수를 81가지로 나눠 길흉을 붙인 전통 작명 관습입니다. 오래 통용돼 왔지만 통계나 실험으로 검증된 근거가 있는 것은 아니어서, 사주첩은 어느 수가 어느 격인지 계산해 보여 주되 "이 이름은 좋다·나쁘다"고 단정하지 않습니다. 뜻이 좋고 부르기 편한 이름을 먼저 고르고, 획수는 참고로 보세요.'],
  ['생년월일을 넣으면 어디로 보내지나요?', '아무 데도 보내지 않습니다. 이름·한자·생년월일의 계산은 모두 이용자의 브라우저 안에서 끝나고, 서버에 저장하거나 전송하지 않습니다. 결과를 다시 보려고 주소를 복사하면 입력값이 주소 끝(#) 조각에만 담기는데, 이 부분은 서버로 전송되지 않습니다.']
];
const title = '이름 풀이 — 원획·자원오행·발음오행·81수리 4격 계산기';
const desc = `성과 이름을 넣고 인명용 한자 ${dictTotal}자 가운데 한자를 고르면 글자마다 원획과 획수 음양, 자원오행, 첫소리 발음오행(운해·해례), 81수리 원형이정 4격을 규칙과 함께 계산해요. 생년월일을 넣으면 사주 오행에 이름이 보태는 오행까지. 모두 브라우저 안에서만 계산.`;
const surDiffText = surDiffWritten.map((x) => `${x.h} ${x.u.won}획(쓰는 획수 ${x.u.written}획)`).join(', ');

const form = `<form class="np-form" id="np-form" action="." onsubmit="return false;">
        <div class="np-row">
          <label>성(한글)<input type="text" id="np-sur" maxlength="1" placeholder="예: 이" autocomplete="off" inputmode="text"></label>
          <label class="np-w2">이름(한글 1~2자)<input type="text" id="np-name" maxlength="2" placeholder="예: 서윤" autocomplete="off"></label>
        </div>
        <div id="np-sur-pick"></div>
        <div id="np-c0"></div>
        <div id="np-c1"></div>
        <div class="np-row">
          <label>생년(양력, 선택)<select id="np-y"><option value="">넣지 않음</option></select></label>
          <label>월<select id="np-m"></select></label>
          <label>일<select id="np-d"></select></label>
          <label>태어난 시각<input type="time" id="np-t" value=""><span class="np-note" style="display:block">비우면 시주 없이 세 기둥</span></label>
        </div>
        <div class="np-row">
          <div role="radiogroup" aria-labelledby="np-school-l"><span class="np-l" id="np-school-l">발음오행 방식</span><div class="np-seg"><label><input type="radio" name="np-school" value="unhae" checked><span>운해 (ㅇ·ㅎ 토)</span></label><label><input type="radio" name="np-school" value="haerye"><span>해례 (ㅇ·ㅎ 수)</span></label></div></div>
        </div>
        <button type="submit" class="np-go" id="np-go">이름 풀이 보기</button>
        <p class="np-note" id="np-msg">성씨 ${SUR_SOUNDS}개 음(${SUR_CHARS}자)과 이름 한자 ${dictTotal}자(70개 음)에서 고를 수 있어요. 목록에 없는 글자는 획수를 직접 넣으면 원획·음양·4격·발음오행까지만 계산해요. 입력한 내용은 이 브라우저 안에서만 쓰고 어디에도 보내지 않아요.</p>
        <noscript><p class="np-note">자바스크립트가 꺼져 있으면 계산기가 동작하지 않아요. 아래 예시와 규칙 설명은 그대로 볼 수 있어요.</p></noscript>
      </form>
      <div class="np-out" id="np-out" aria-live="polite"></div>`;

const body = `
  <article class="guide-article">
    <div class="ga-overline"><a href="${REL}naming/" style="color: inherit; text-decoration: none;">이름 짓기</a> · 이름 풀이</div>
    <h1 class="ga-title">이름 풀이 —<br>원획·오행·81수리 4격을 규칙과 함께</h1>
    <p class="ga-meta">성씨 ${SUR_CHARS}자 · 이름 한자 ${dictTotal}자 · 발음오행 두 방식 · 사주 오행 보완 · 브라우저 안에서만 계산</p>
    <p class="ga-lead">성과 이름을 한글로 넣고 한자를 고르면, 글자마다 원획(강희자전 부수 원형)과 홀·짝 음양, 자원오행, 첫소리 발음오행을 표로 보여 주고 81수리 원형이정 4격을 계산해요. 격마다 어떤 글자를 더했는지 식을 그대로 적고, 길흉은 전통 작명 관습의 표를 따랐다는 것을 함께 적어요. 생년월일을 넣으면 <a href="${REL}">사주 계산기</a>와 같은 엔진으로 여덟 글자의 오행을 세어 이름 한자가 어느 오행을 보태는지도 봐요.</p>
    <div class="ga-body">
      ${form}
      <h2>풀이 예시 — 이서윤(李瑞潤)</h2>
      <p>흔히 쓰는 이름 하나를 골라 ${EX.birth.y}년 ${EX.birth.m}월 ${EX.birth.d}일 ${EX.birth.hh}시 ${EX.birth.mi}분생으로 가정하고 같은 계산을 미리 돌려 두었어요. 계산기가 내는 결과도 꼭 이 모양이에요.</p>
      <div class="np-ex">${exHtml}</div>
      <h2>계산 규칙</h2>
      <h3>원획</h3>
      <p>성명학은 한자의 부수를 강희자전의 원래 글자 획수로 세요. 氵은 水 4획, 艹은 艸 6획, 王(玉변)은 5획, 왼쪽 阝은 阜 8획, 오른쪽 阝은 邑 7획, 辶은 辵 7획, 忄은 心 4획, 扌은 手 4획, 衤은 衣 6획이에요. 이 페이지의 원획은 <a href="${REL}naming/hanja/">이름 한자 사전</a>과 같은 규칙으로 유니코드 한자 데이터베이스(Unihan)의 부수·획수에서 계산했고, 한국 자전과 다르게 세는 글자(成 7획 계열, 熙 13획 등)는 한국 자전을 따랐어요. 一·二·三 같은 숫자 글자는 그 수를 획수로 봐요. 성씨 가운데 원획이 쓰는 획수와 다른 글자는 ${surDiffText}${P('자', '예요', '예요')}.</p>
      <h3>획수 음양</h3>
      <p>원획이 홀수면 양, 짝수면 음이에요. 성·이름 글자의 음양이 한쪽으로만 몰리지 않는 배열을 전통 작명에서 선호해요. 이 페이지는 배열을 보여 주고 몰렸는지만 말해요.</p>
      <h3>자원오행</h3>
      <p>한자마다 부수에 따라 정해진 오행이에요. 氵·水는 수, 木·艹는 목, 日·火·心은 화, 土·山·阝(언덕)은 토, 金·玉·貝는 금처럼 배정하고, 부수의 오행 배정이 자전마다 갈리는 글자는 사전에 싣지 않았어요. 성은 바꿀 수 없으니 전통 작명에서도 이름 글자의 자원오행만 따지고, 이 페이지도 성씨의 자원오행은 세지 않아요.</p>
      <h3>발음오행</h3>
      <p>첫소리(초성)로 정해요. ㄱ·ㅋ 목, ㄴ·ㄷ·ㄹ·ㅌ 화, ㅅ·ㅈ·ㅊ 금은 어느 방식이나 같고, ㅇ·ㅎ와 ㅁ·ㅂ·ㅍ만 갈려요. 훈민정음 해례본은 ㅁ·ㅂ·ㅍ 토, ㅇ·ㅎ 수이고, 훈민정음 운해(신경준)는 ㅁ·ㅂ·ㅍ 수, ㅇ·ㅎ 토예요. 작명 현장에서는 운해 방식이 더 널리 쓰여 기본으로 두었고, 단추로 해례 방식으로 바꿀 수 있어요. 이웃한 글자끼리 목→화→토→금→수→목 순이면 상생, 같으면 비화, 목↔토·토↔수·수↔화·화↔금·금↔목이면 상극이에요.</p>
      <h3>81수리 원형이정 4격 <small style="font-size: 12px; color: var(--faint);">전통 작명 관습</small></h3>
      <p>원격 = 이름 첫 글자 + 끝 글자, 형격 = 성 + 이름 첫 글자, 이격 = 성 + 이름 끝 글자, 정격 = 성 + 이름 전부. 81을 넘으면 80을 빼요. 외자 이름은 이격이 없어 세 격만 봐요. 길흉은 1·3·5·6·11·13·15·16·21·23·24·29·31·32·33·35·37·39·41·45·47·48·52·57·61·63·65·67·68·81을 대길, 7·8·17·18·25를 길, 26·27·30·38·49·51·53·55·58·71·73·75·77·78을 평, 나머지를 흉으로 보는 통용 표를 따랐어요. 이 표는 획수 조합으로 길흉을 나눈 전통 작명 관습이고, 통계나 실험으로 검증된 근거가 있는 것은 아니에요. 사주첩은 수와 격 이름을 계산해 보여 줄 뿐 이름의 좋고 나쁨을 단정하지 않아요.</p>
      <h3>사주 오행과 이름</h3>
      <p>생년월일(시)을 넣으면 <a href="${REL}about/method/">사주 계산기와 같은 방법</a>으로 연·월·일·시 기둥을 세우고(절기 황경 계산, 진태양시 보정, 야자시) 여덟 글자의 오행을 세요. 시를 모르면 여섯 글자예요. 거기에 이름 글자의 자원오행을 하나씩 더해 어느 오행이 늘어나는지, 가장 적은 오행(없는 오행)을 채우는지 보여 줘요. 부족한 오행을 이름으로 채우는 것은 작명에서 가장 많이 쓰는 방법이지만, 어느 오행이 필요한지는 <a href="${REL}guide/yongsin.html">용신</a>처럼 더 깊이 보는 방법도 있어요.</p>
      <h2>자주 묻는 질문</h2>
      ${faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n      ')}
      <h2>출처와 한계</h2>
      <ul>
        <li>이름 한자 ${dictTotal}자: 대법원 인명용 한자표(「가족관계의 등록 등에 관한 규칙」 별표, 교육용 기초한자 포함)에 드는 글자만. 음·부수·획수·인명용 여부는 유니코드 한자 데이터베이스(Unihan, ${UNIHAN_VER})에서, 뜻과 자원오행은 <a href="${REL}naming/hanja/">이름 한자 사전</a>과 같은 자료.</li>
        <li>성씨 한자 ${SUR_CHARS}자(${SUR_SOUNDS}개 음): 흔한 성씨의 한자를 같은 Unihan 자료로 확인했고, 거기 없던 章·裵·裴·廉·邊·呂·卞·陰·蔣·諸·睦·辛·羅 13자는 unicode.org 의 Unihan 조회(Unicode 18.0)에서 부수·획수·음을 확인했어요. 한 음에 여러 성씨 한자가 쓰이면 모두 실었어요(정 鄭·丁, 장 張·章·蔣, 조 趙·曺, 배 裵·裴, 진 陳·秦·晉 …). 확인하지 못한 글자(王·表·慎, 두 글자 성씨 등)는 싣지 않았고, 목록에 없으면 획수를 직접 넣어 계산할 수 있어요.</li>
        <li>81수리 길흉 표와 발음오행 표, 오행 상생상극은 사주첩 <a href="${REL}naming/">이름 짓기 도구</a>와 같은 것을 써서 두 도구의 결과가 같아요.</li>
        <li>원획은 자전·유파에 따라 한두 획 다를 수 있고, 81수리는 전통 작명 관습이에요. 출생신고 전에는 대법원 전자가족관계등록시스템에서 인명용 한자 여부를 한 번 더 확인하세요.</li>
      </ul>
      <p class="callout">모든 계산은 이 브라우저 안에서만 하고 입력한 이름·생년월일을 서버로 보내지 않아요. <a href="${REL}naming/hanja/">이름 한자 사전</a> · <a href="${REL}naming/">이름 짓기(추천·평가)</a> · <a href="${REL}guide/ohaeng.html">오행 완전 정리</a> · <a href="${REL}about/method/">계산 방법</a></p>
    </div>
    <div class="ga-cta">
      <a class="btn-primary" href="${REL}naming/hanja/"><span class="seal-dot" aria-hidden="true"></span><span>이름 한자 사전에서 글자 고르기</span></a>
    </div>
  </article>
  <script type="application/json" id="np-dict">${JSON.stringify(DICT)}</script>
  <script type="application/json" id="np-sur-data">${JSON.stringify(SUR)}</script>
  <script src="${REL}js/manseryeok.js"></script>
  <script src="${REL}js/naming.js"></script>
  <script>${CORE}
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var NM = window.Naming, M = window.Manseryeok;
  if (!NM || !M) return;
  var core = pulyiCore(NM);
  var DICT = JSON.parse($('#np-dict').textContent), SUR = JSON.parse($('#np-sur-data').textContent);
  var YV = [20, 2, 6, 12, 17, 7];
  function isHangul(ch) { var c = ch.charCodeAt(0); return c >= 0xAC00 && c <= 0xD7A3; }
  function norm(s) { var c = s.charCodeAt(0) - 0xAC00, ini = Math.floor(c / 588), med = Math.floor((c % 588) / 28), fin = c % 28; if (ini === 5) ini = YV.indexOf(med) >= 0 ? 11 : 2; else if (ini === 2 && YV.indexOf(med) >= 0) ini = 11; return String.fromCharCode(0xAC00 + ini * 588 + med * 28 + fin); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var picked = { sur: null, c: [null, null] };   /* 고른 글자 — {h, r, won, written, el, mean, slug, why} 또는 직접 획수 {h:'', r, won} */

  /* 날짜 선택 상자 */
  var nowY = new Date().getFullYear(), ySel = $('#np-y'), h = '';
  for (var y = nowY + 1; y >= 1930; y--) h += '<option value="' + y + '">' + y + '년</option>';
  ySel.innerHTML += h; h = '';
  for (var m = 1; m <= 12; m++) h += '<option value="' + m + '">' + m + '월</option>';
  $('#np-m').innerHTML = h; h = '';
  for (var d = 1; d <= 31; d++) h += '<option value="' + d + '">' + d + '일</option>';
  $('#np-d').innerHTML = h;

  /* 글자 고르기 상자 — box: 담을 자리, list: 후보, kind: 'sur'|'name', idx */
  function chips(box, r, list, kind, idx) {
    if (!r || !isHangul(r)) { box.innerHTML = ''; return; }
    var cur = kind === 'sur' ? picked.sur : picked.c[idx];
    var html = '<div class="np-chips" role="group" aria-label="' + esc(r) + ' 한자">' + list.map(function (x, i) {
      var on = cur && cur.h === x[0] ? ' on' : '';
      return kind === 'sur'
        ? '<button type="button" class="np-chip' + on + '" data-i="' + i + '"><b>' + x[0] + '</b><small>' + x[1] + '획' + (x[2] !== x[1] ? ' (쓰는 획수 ' + x[2] + ')' : '') + '</small></button>'
        : '<button type="button" class="np-chip' + on + '" data-i="' + i + '"><b>' + x[0] + '</b><small>' + esc(x[1]) + ' · ' + x[2] + '획' + (x[3] !== x[2] ? '(쓰는 획수 ' + x[3] + ')' : '') + ' · ' + x[4] + '</small></button>';
    }).join('') + '<span class="np-chip manual' + (cur && !cur.h ? ' on' : '') + '">' + (list.length ? '목록에 없으면 ' : "'" + esc(r) + "' 음은 목록에 없어요. ") + '획수 직접<input type="number" min="1" max="40" inputmode="numeric" aria-label="' + esc(r) + ' 획수 직접 입력" value="' + (cur && !cur.h ? cur.won : '') + '"></span></div>';
    box.innerHTML = '<label style="margin-top:10px">' + (kind === 'sur' ? '성 ' : '이름 ' + (idx + 1) + '번째 글자 ') + "'" + esc(r) + "' 한자</label>" + html;
    var btns = box.querySelectorAll('button.np-chip'), man = box.querySelector('.manual input');
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function () {
        var x = list[+b.getAttribute('data-i')];
        var v = kind === 'sur' ? { h: x[0], r: r, won: x[1], written: x[2], why: x[3] } : { h: x[0], r: r, mean: x[1], won: x[2], written: x[3], el: x[4], slug: x[5], why: x[6] };
        if (kind === 'sur') picked.sur = v; else picked.c[idx] = v;
        Array.prototype.forEach.call(btns, function (o) { o.classList.toggle('on', o === b); });
        box.querySelector('.manual').classList.remove('on'); man.value = '';
      });
    });
    man.addEventListener('input', function () {
      var n = +man.value;
      var v = n > 0 ? { h: '', r: r, won: n, written: n } : null;
      if (kind === 'sur') picked.sur = v; else picked.c[idx] = v;
      Array.prototype.forEach.call(btns, function (o) { o.classList.remove('on'); });
      box.querySelector('.manual').classList.toggle('on', !!v);
    });
  }
  function refreshSur() {
    var r = $('#np-sur').value.trim();
    if (picked.sur && picked.sur.r !== r) picked.sur = null;
    chips($('#np-sur-pick'), r, (isHangul(r) && SUR[r]) || (isHangul(r) && SUR[norm(r)]) || [], 'sur', 0);
  }
  function refreshName() {
    var v = $('#np-name').value.trim();
    [0, 1].forEach(function (i) {
      var r = v[i] || '';
      if (picked.c[i] && picked.c[i].r !== r) picked.c[i] = null;
      chips($('#np-c' + i), r, (isHangul(r) && (DICT[r] || DICT[norm(r)])) || [], 'name', i);
    });
  }
  $('#np-sur').addEventListener('input', refreshSur);
  $('#np-name').addEventListener('input', refreshName);

  function school() { return document.querySelector('input[name="np-school"]:checked').value; }
  function sajuInput() {
    var y = +$('#np-y').value; if (!y) return null;
    var t = $('#np-t').value, hh = null, mi = 0;
    if (/^\\d{2}:\\d{2}$/.test(t)) { hh = +t.slice(0, 2); mi = +t.slice(3); }
    var r = M.compute({ year: y, month: +$('#np-m').value, day: +$('#np-d').value, hour: hh == null ? 12 : hh, minute: mi, unknownTime: hh == null, gender: 'M', applySolarTime: true });
    var names = ['연주', '월주', '일주', '시주'];
    var ps = [r.pillars.year, r.pillars.month, r.pillars.day, r.pillars.hour].map(function (p, i) { if (!p) return null; var g = M.ganjiName(p.stem, p.branch); return { name: names[i], kor: g.kor, han: g.han }; }).filter(Boolean);
    return { elements: r.elements, pillars: ps, unknownTime: r.input.unknownTime };
  }
  function msg(s) { $('#np-msg').textContent = s; }
  function run(fromHash) {
    var sr = $('#np-sur').value.trim(), nm = $('#np-name').value.trim();
    if (!isHangul(sr)) { msg('성을 한글 한 글자로 넣어 주세요.'); return; }
    if (!nm || !Array.prototype.every.call(nm, isHangul)) { msg('이름을 한글 1~2자로 넣어 주세요.'); return; }
    if (!picked.sur) { msg("성 '" + sr + "'의 한자를 고르거나 획수를 넣어 주세요."); return; }
    var chars = [];
    for (var i = 0; i < nm.length; i++) { if (!picked.c[i]) { msg("이름 '" + nm[i] + "'의 한자를 고르거나 획수를 넣어 주세요."); return; } chars.push(picked.c[i]); }
    var saju = null;
    try { saju = sajuInput(); } catch (e) { saju = null; msg('생년월일을 다시 확인해 주세요.'); }
    var a = core.analyze({ sur: picked.sur, chars: chars, saju: saju });
    $('#np-out').innerHTML = core.render(a, { school: school(), rel: ${JSON.stringify(REL)} });
    msg('결과는 이 브라우저 안에서만 계산했어요. 주소를 복사하면 입력값이 # 뒤에 담겨 같은 결과를 다시 볼 수 있어요.');
    /* 주소 조각(#)에만 담는다 — 서버로 가지 않는다 */
    var q = 's=' + encodeURIComponent(sr) + '&sh=' + encodeURIComponent(picked.sur.h || picked.sur.won) + '&n=' + encodeURIComponent(nm) + '&nh=' + encodeURIComponent(chars.map(function (c) { return c.h || c.won; }).join(',')) + '&o=' + school();
    if ($('#np-y').value) q += '&b=' + $('#np-y').value + '-' + $('#np-m').value + '-' + $('#np-d').value + ($('#np-t').value ? 'T' + $('#np-t').value : '');
    if (!fromHash) { try { history.replaceState(null, '', '#' + q); } catch (e) { /* 무시 */ } }
    if (!fromHash) $('#np-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.gtag) { try { window.gtag('event', 'naming_pulyi', { chars: chars.length, saju: !!saju }); } catch (e) { /* 무시 */ } }
  }
  $('#np-form').addEventListener('submit', function (e) { e.preventDefault(); run(false); });
  Array.prototype.forEach.call(document.querySelectorAll('input[name="np-school"]'), function (r) { r.addEventListener('change', function () { if ($('#np-out').innerHTML) run(true); }); });

  /* 주소 조각에서 되살리기 */
  (function fromHash() {
    var hsh = location.hash.replace(/^#/, ''); if (!hsh) return;
    var p = {}; hsh.split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) p[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); });
    if (!p.s || !p.n) return;
    $('#np-sur').value = p.s.slice(0, 1); $('#np-name').value = p.n.slice(0, 2);
    if (p.o === 'haerye') document.querySelector('input[name="np-school"][value="haerye"]').checked = true;
    if (p.b) { var mb = p.b.match(/^(\\d{4})-(\\d{1,2})-(\\d{1,2})(?:T(\\d{2}:\\d{2}))?$/); if (mb) { $('#np-y').value = mb[1]; $('#np-m').value = +mb[2]; $('#np-d').value = +mb[3]; if (mb[4]) $('#np-t').value = mb[4]; } }
    refreshSur(); refreshName();
    var pickIn = function (box, want) { if (!want) return; var hit = null; Array.prototype.forEach.call(box.querySelectorAll('button.np-chip'), function (b) { if (b.querySelector('b').textContent === want) hit = b; }); if (hit) hit.click(); else if (/^\\d+$/.test(want)) { var inp = box.querySelector('.manual input'); if (inp) { inp.value = want; inp.dispatchEvent(new Event('input')); } } };
    pickIn($('#np-sur-pick'), p.sh);
    (p.nh || '').split(',').forEach(function (w, i) { pickIn($('#np-c' + i), w); });
    run(true);
  })();
})();
  </script>`;

/* 조사(빌드용) */
function P(word, a, b) { return ((word.charCodeAt(word.length - 1) - 0xAC00) % 28) ? a : b; }

/* ---------- 수정일 — 글 영역(스크립트 제외)이 이전 빌드와 같으면 예전 날짜 ---------- */
const contentKey = (html) => { const a = html.indexOf('<article'), b = html.indexOf('</article>'); return html.slice(a, b).replace(/<script[\s\S]*?<\/script>/g, '').replace(/\s+/g, ' ').trim(); };
const file = path.join(DOCS, URL.slice(1), 'index.html');
let modified = REVISED;
if (fs.existsSync(file)) {
  const old = fs.readFileSync(file, 'utf8');
  const m = old.match(/"dateModified":"(\d{4}-\d{2}-\d{2})"/);
  if (m && contentKey(old) === contentKey(body)) modified = m[1];
}

const jsonld = [
  breadcrumb([{ name: '사주첩', url: SITE + '/' }, { name: '이름 짓기', url: SITE + '/naming/' }, { name: '이름 풀이', url: SITE + URL }]),
  { '@context': 'https://schema.org', '@type': 'WebApplication', name: '사주첩 이름 풀이', url: SITE + URL, description: desc, applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', browserRequirements: 'Requires JavaScript', isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' }, inLanguage: 'ko', datePublished: PUBLISHED, dateModified: modified, publisher: { '@type': 'Organization', name: '사주첩' },
    featureList: ['원획(강희자전 부수 원형) 계산', '획수 음양 배열', '자원오행', '발음오행(운해·해례 두 방식)', '81수리 원형이정 4격', '사주 오행 분포와 이름이 보태는 오행'] },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
];
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, shell({ rel: REL, title, desc, canonical: SITE + URL, nav: NAV, extraHead: STYLE, jsonld, body, og: 'naming',
  footerNote: '본 도구는 전통 성명학의 규칙을 그대로 계산해 보여 주는 참고용 콘텐츠입니다. 81수리 길흉은 전통 작명 관습이며 검증된 근거가 아닙니다.' }));

/* 사이트맵 — 이 한 장. robots.txt 에 없으면 적어 두면 build-feeds 가 색인에 넣는다 */
fs.writeFileSync(path.join(DOCS, 'sitemap-naming.xml'), ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  `  <url><loc>${SITE}${URL}</loc><lastmod>${modified}</lastmod></url>`, '</urlset>', ''].join('\n'));
const robotsPath = path.join(DOCS, 'robots.txt');
const robots = fs.readFileSync(robotsPath, 'utf8');
if (!robots.includes('sitemap-naming.xml')) fs.writeFileSync(robotsPath, robots.trimEnd() + '\nSitemap: https://sajucheop.com/sitemap-naming.xml\n');

console.log(`이름 풀이 ${URL} — 성씨 ${SUR_SOUNDS}음 ${SUR_CHARS}자(원획≠쓰는 획수: ${surDiffText}) · 이름 한자 ${dictTotal}자 · 예시 ${EX.sur}${EX.name}(${EX.surH}${EX.nameH}) ${exCheck} · 사주 ${EL_ORDER.map((e) => `${e}${exInput.saju.elements[e]}`).join(' ')} · 수정일 ${modified}`);
