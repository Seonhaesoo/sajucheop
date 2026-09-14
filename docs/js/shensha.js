/* Special stars (신살 神殺) found in a chart — the rules used by the Korean library articles (tools/guide-extra-a/b.mjs).
 * window.Shensha.find(result) → [{ key, name, han, ko, slug, where: ['year'|'month'|'day'|'hour'…], note }]
 * Base rules: Nobleman by day (and year) stem; Peach Blossom / Traveling Horse / Flower Canopy by the trine group of the year and day branch;
 * Yang Blade by day stem (five yang stems); White Tiger and Kui Gang by the day pillar; Void by the day pillar's decade; Wonjin between any two branches. */
(function () {
  'use strict';
  var M = window.Manseryeok;
  var POS = ['year', 'month', 'day', 'hour'];
  var NOBLE = { 0: [1, 7], 4: [1, 7], 6: [1, 7], 1: [0, 8], 5: [0, 8], 2: [11, 9], 3: [11, 9], 7: [2, 6], 8: [5, 3], 9: [5, 3] };
  var GROUP = { 2: 0, 6: 0, 10: 0, 8: 1, 0: 1, 4: 1, 5: 2, 9: 2, 1: 2, 11: 3, 3: 3, 7: 3 };   /* 寅午戌 · 申子辰 · 巳酉丑 · 亥卯未 */
  var PEACH = [3, 9, 6, 0], HORSE = [8, 2, 11, 5], CANOPY = [10, 4, 1, 7];
  var BLADE = { 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 };
  var TIGER = ['戊辰', '丁丑', '丙戌', '乙未', '甲辰', '癸丑', '壬戌'];
  var KUI = { '庚辰': 'core', '庚戌': 'core', '壬辰': 'core', '壬戌': 'core', '戊戌': 'most schools', '戊辰': 'some schools' };
  var VOID = [[10, 11], [8, 9], [6, 7], [4, 5], [2, 3], [0, 1]];
  var WONJIN = { 0: 7, 7: 0, 1: 6, 6: 1, 2: 9, 9: 2, 3: 8, 8: 3, 4: 11, 11: 4, 5: 10, 10: 5 };
  var STARS = {
    nobleman: { name: 'Nobleman Star', han: '天乙貴人', ko: '천을귀인', slug: 'nobleman-star' },
    peach: { name: 'Peach Blossom', han: '桃花', ko: '도화살', slug: 'peach-blossom' },
    horse: { name: 'Traveling Horse', han: '驛馬', ko: '역마살', slug: 'traveling-horse' },
    canopy: { name: 'Flower Canopy', han: '華蓋', ko: '화개살', slug: 'flower-canopy' },
    blade: { name: 'Yang Blade', han: '羊刃', ko: '양인살', slug: 'yang-blade' },
    tiger: { name: 'White Tiger', han: '白虎', ko: '백호대살', slug: 'white-tiger' },
    kui: { name: 'Kui Gang', han: '魁罡', ko: '괴강살', slug: 'kui-gang' },
    voidStar: { name: 'Void', han: '空亡', ko: '공망', slug: 'void-kong-wang' },
    wonjin: { name: 'Wonjin', han: '怨嗔', ko: '원진살', slug: 'wonjin' }
  };
  function pillarsOf(r) {
    var P = r.pillars;
    return [P.year, P.month, P.day, P.hour].map(function (p, i) { return p ? { pos: POS[i], stem: p.stem, branch: p.branch } : null; });
  }
  function han(p) { return M.STEMS[p.stem].han + M.BRANCHES[p.branch].han; }
  function idx60(p) { for (var i = 0; i < 60; i++) if (i % 10 === p.stem && i % 12 === p.branch) return i; return 0; }
  function branchStar(key, targets, pl) {
    /* targets: { branch → base label }; a hit on any pillar other than its own base */
    var where = [], notes = [];
    pl.forEach(function (p) { if (!p) return; var base = targets[p.branch]; if (base && base !== p.pos) { where.push(p.pos); notes.push(M.BRANCHES[p.branch].han + ' in the ' + p.pos + ' pillar (from your ' + base + ' branch)'); } });
    return where.length ? { key: key, where: where, note: notes.join('; ') } : null;
  }
  function find(r) {
    var pl = pillarsOf(r), day = pl[2], year = pl[0], out = [];
    /* Nobleman: day stem (and year stem) → two branches */
    (function () {
      var where = [], notes = [];
      [['day', day.stem], ['year', year.stem]].forEach(function (b) {
        var t = NOBLE[b[1]];
        pl.forEach(function (p) { if (p && t.indexOf(p.branch) >= 0 && where.indexOf(p.pos) < 0) { where.push(p.pos); notes.push(M.BRANCHES[p.branch].han + ' in the ' + p.pos + ' pillar (by your ' + b[0] + ' stem ' + M.STEMS[b[1]].han + ')'); } });
      });
      if (where.length) out.push({ key: 'nobleman', where: where, note: notes.join('; ') });
    })();
    /* trine-group stars from the year branch and the day branch */
    [['peach', PEACH], ['horse', HORSE], ['canopy', CANOPY]].forEach(function (s) {
      var targets = {};
      targets[s[1][GROUP[year.branch]]] = 'year';
      if (!targets[s[1][GROUP[day.branch]]]) targets[s[1][GROUP[day.branch]]] = 'day';
      var hit = branchStar(s[0], targets, pl);
      if (hit) out.push(hit);
    });
    /* Yang Blade: day stem → branch, any pillar */
    if (BLADE[day.stem] !== undefined) {
      var bw = [], bn = [];
      pl.forEach(function (p) { if (p && p.branch === BLADE[day.stem]) { bw.push(p.pos); bn.push(M.BRANCHES[p.branch].han + ' in the ' + p.pos + ' pillar' + (p.pos === 'day' ? ' — you sit on your blade' : '')); } });
      if (bw.length) out.push({ key: 'blade', where: bw, note: bn.join('; ') });
    }
    /* day-pillar stars */
    var dh = han(day);
    if (TIGER.indexOf(dh) >= 0) out.push({ key: 'tiger', where: ['day'], note: dh + ' day pillar' });
    if (KUI[dh]) out.push({ key: 'kui', where: ['day'], note: dh + ' day pillar (' + KUI[dh] + ')' });
    /* Void: the day pillar's decade */
    var v = VOID[Math.floor(idx60(day) / 10)], vw = [], vn = [];
    pl.forEach(function (p) { if (p && p.pos !== 'day' && v.indexOf(p.branch) >= 0) { vw.push(p.pos); vn.push(M.BRANCHES[p.branch].han + ' in the ' + p.pos + ' pillar'); } });
    if (vw.length) out.push({ key: 'voidStar', where: vw, note: vn.join('; ') + ' (void branches for your decade: ' + M.BRANCHES[v[0]].han + M.BRANCHES[v[1]].han + ')' });
    /* Wonjin: any two branches */
    var ww = [], wn = [];
    for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) {
      if (pl[i] && pl[j] && WONJIN[pl[i].branch] === pl[j].branch) { ww.push(pl[i].pos + '–' + pl[j].pos); wn.push(M.BRANCHES[pl[i].branch].han + '–' + M.BRANCHES[pl[j].branch].han + ' (' + pl[i].pos + ' and ' + pl[j].pos + ')'); }
    }
    if (ww.length) out.push({ key: 'wonjin', where: ww, note: wn.join('; ') });
    return out.map(function (o) { var s = STARS[o.key]; return { key: o.key, name: s.name, han: s.han, ko: s.ko, slug: s.slug, where: o.where, note: o.note }; });
  }
  window.Shensha = { find: find, STARS: STARS };
})();
