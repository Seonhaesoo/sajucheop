/* BaZi calculator — /en/bazi-calculator/. Same engine as the Korean chart (js/manseryeok.js), Chinese terminology.
 * Uses window.EN_DAY_MASTERS (js/en-daymaster.js) for the Day Master card and window.EN_PILLAR_SLUGS for the day-pillar link. */
(function () {
  'use strict';
  var M = window.Manseryeok;
  if (!M) return;
  var $ = function (s) { return document.querySelector(s); };
  var PY_S = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
  var PY_B = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
  var ANIMAL = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  var EL_EN = { '목': 'Wood', '화': 'Fire', '토': 'Earth', '금': 'Metal', '수': 'Water' };
  var EL_KEYS = ['목', '화', '토', '금', '수'];
  var TG = { '비견': ['Friend', '比肩'], '겁재': ['Rob Wealth', '劫財'], '식신': ['Eating God', '食神'], '상관': ['Hurting Officer', '傷官'], '편재': ['Indirect Wealth', '偏財'], '정재': ['Direct Wealth', '正財'], '편관': ['Seven Killings', '七殺'], '정관': ['Direct Officer', '正官'], '편인': ['Indirect Resource', '偏印'], '정인': ['Direct Resource', '正印'] };
  var TG_ORDER = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
  var TG_SLUG = { '비견': 'friend', '겁재': 'rob-wealth', '식신': 'eating-god', '상관': 'hurting-officer', '편재': 'indirect-wealth', '정재': 'direct-wealth', '편관': 'seven-killings', '정관': 'direct-officer', '편인': 'indirect-resource', '정인': 'direct-resource' };
  var TG_HUB = '/en/guide/ten-gods/';
  var REL_EN = { '육합': 'Six Harmony (合)', '삼합': 'Trine (三合)', '충': 'Clash (冲)', '동일': 'Same branch' };
  var STRENGTH = { '신강': 'strong', '중화': 'balanced', '신약': 'weak' };
  var TZ = [
    [-720, 'UTC−12'], [-660, 'UTC−11'], [-600, 'UTC−10 · Hawaii'], [-540, 'UTC−9 · Alaska'], [-480, 'UTC−8 · Los Angeles, Vancouver'],
    [-420, 'UTC−7 · Denver'], [-360, 'UTC−6 · Chicago, Mexico City'], [-300, 'UTC−5 · New York, Toronto'], [-240, 'UTC−4 · Santiago'],
    [-210, 'UTC−3:30 · Newfoundland'], [-180, 'UTC−3 · São Paulo'], [-120, 'UTC−2'], [-60, 'UTC−1'], [0, 'UTC±0 · London, Lisbon'],
    [60, 'UTC+1 · Paris, Berlin, Lagos'], [120, 'UTC+2 · Cairo, Johannesburg'], [180, 'UTC+3 · Moscow, Riyadh'], [210, 'UTC+3:30 · Tehran'],
    [240, 'UTC+4 · Dubai'], [270, 'UTC+4:30 · Kabul'], [300, 'UTC+5 · Karachi'], [330, 'UTC+5:30 · India, Sri Lanka'], [345, 'UTC+5:45 · Nepal'],
    [360, 'UTC+6 · Dhaka'], [390, 'UTC+6:30 · Myanmar'], [420, 'UTC+7 · Bangkok, Jakarta, Hanoi'], [480, 'UTC+8 · Singapore, Kuala Lumpur, Beijing, Hong Kong, Taipei, Manila, Perth'],
    [540, 'UTC+9 · Tokyo, Seoul'], [570, 'UTC+9:30 · Adelaide'], [600, 'UTC+10 · Sydney, Melbourne'], [660, 'UTC+11'], [720, 'UTC+12 · Auckland'], [780, 'UTC+13'], [840, 'UTC+14']
  ];
  function track(name, params) { try { if (window.gtag) window.gtag('event', name, params || {}); } catch (e) { /* ignore */ } }
  function toast(msg) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  var pad2 = function (n) { return String(n).padStart(2, '0'); };
  var stemHtml = function (i) { var s = M.STEMS[i]; return '<span class="el-' + s.el + '">' + s.han + '</span>'; };
  var branchHtml = function (i) { var b = M.BRANCHES[i]; return '<span class="el-' + b.el + '">' + b.han + '</span>'; };
  var tgName = function (k) { return TG[k] ? TG[k][0] : k; };
  var tgLink = function (k) { return '<a href="' + TG_HUB + TG_SLUG[k] + '/">' + tgName(k) + '</a>'; };
  function idx60(stem, branch) { for (var i = 0; i < 60; i++) if (i % 10 === stem && i % 12 === branch) return i; return -1; }

  /* ---------- form ---------- */
  $('#bz-tz').innerHTML = TZ.map(function (t) { return '<option value="' + t[0] + '"' + (t[0] === 480 ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('');
  try {
    var p = JSON.parse(localStorage.getItem('sajucheop.en.profile.v1') || 'null');
    if (p && p.y) {
      $('#bz-date').value = p.y + '-' + pad2(p.m) + '-' + pad2(p.d);
      $('#bz-no-time').checked = !!p.unknown;
      if (!p.unknown) $('#bz-time').value = pad2(p.hh) + ':' + pad2(p.mi || 0);
      if (typeof p.tz === 'number') $('#bz-tz').value = p.tz;
      if (p.g) $('#bz-gender').value = p.g;
    }
  } catch (e) { /* ignore */ }
  function syncForm() {
    $('#bz-time').disabled = $('#bz-no-time').checked;
    $('#bz-lon-row').hidden = !$('#bz-solar').checked;
  }
  $('#bz-no-time').addEventListener('change', syncForm);
  $('#bz-solar').addEventListener('change', syncForm);
  syncForm();

  /* ---------- rendering ---------- */
  var last = null;
  function pillarCol(label, p, isDay, dm) {
    if (!p) return '<div class="bz-col"><div class="bz-lab">' + label + '</div><div class="bz-tg">—</div><div class="bz-han" style="color: var(--faint);">—<br>—</div><div class="bz-py">hour unknown</div></div>';
    var s = M.STEMS[p.stem], b = M.BRANCHES[p.branch];
    var hidden = (M.JIJANGGAN[p.branch] || []).map(function (h, i, arr) {
      var main = i === arr.length - 1;
      return '<span class="el-' + M.STEMS[h].el + (main ? ' main' : '') + '" title="' + PY_S[h] + ' — ' + tgName(M.sipseongOf(dm, h)) + '">' + M.STEMS[h].han + '</span>';
    }).join(' ');
    return '<div class="bz-col' + (isDay ? ' day' : '') + '">' +
      '<div class="bz-lab">' + label + '</div>' +
      '<div class="bz-tg">' + (isDay ? 'Day Master' : tgName(M.sipseongOf(dm, p.stem))) + '</div>' +
      '<div class="bz-han">' + stemHtml(p.stem) + '<br>' + branchHtml(p.branch) + '</div>' +
      '<div class="bz-py">' + PY_S[p.stem] + ' · ' + (s.yang ? 'yang' : 'yin') + ' ' + EL_EN[s.el] + '<br>' + PY_B[p.branch] + ' · ' + ANIMAL[p.branch] + ' · ' + EL_EN[b.el] + '</div>' +
      '<div class="bz-hidden"><i>hidden</i> ' + hidden + '</div>' +
      '<div class="bz-tg2">' + tgName(M.branchSipseong(dm, p.branch)) + '</div>' +
      '</div>';
  }
  function render(r) {
    var P = r.pillars, dm = P.day.stem, me = M.STEMS[dm];
    var inp = r.input;
    $('#bz-chart').innerHTML = pillarCol('Year', P.year, false, dm) + pillarCol('Month', P.month, false, dm) + pillarCol('Day', P.day, true, dm) + pillarCol('Hour', P.hour, false, dm);
    var corr = r.time && r.time.solarCorrectionMin;
    var when = inp.year + '-' + pad2(inp.month) + '-' + pad2(inp.day) + (inp.unknownTime ? ' (hour unknown)' : ' ' + pad2(inp.hour) + ':' + pad2(inp.minute));
    $('#bz-when').textContent = 'Born ' + when + ' · UTC' + (r.time.offsetMinutes >= 0 ? '+' : '−') + Math.abs(r.time.offsetMinutes / 60) + (corr ? ' · true solar time ' + (corr > 0 ? '+' : '−') + Math.abs(corr) + ' min' : '') + (r.jeolipWarning ? ' · born within hours of a solar-term boundary — the month pillar is sensitive to the exact minute' : '');

    /* Day Master */
    var dmData = (window.EN_DAY_MASTERS || [])[dm] || {};
    var strengthKey = r.strength.label;
    $('#bz-dm').innerHTML = '<div class="bz-dm-han el-' + me.el + '">' + me.han + '</div>' +
      '<div class="bz-dm-body"><b>' + PY_S[dm] + ' — ' + (me.yang ? 'yang' : 'yin') + ' ' + EL_EN[me.el] + (dmData.arch ? ' · ' + dmData.arch : '') + '</b>' +
      '<p>' + (dmData.essence || '') + ' Your Day Master reads as <b>' + STRENGTH[strengthKey] + '</b> in this chart' + (strengthKey === '신강' ? ' — it has enough support to spend itself outward.' : strengthKey === '신약' ? ' — it does best with Resource and Friend support around it.' : ' — supported and drained in roughly equal measure.') + '</p>' +
      (dmData.slug ? '<a href="/en/guide/day-master/' + dmData.slug + '/">Read the ' + PY_S[dm] + ' ' + EL_EN[me.el] + ' Day Master profile →</a>' : '') + '</div>';

    /* elements */
    var max = 0; EL_KEYS.forEach(function (k) { if (r.elements[k] > max) max = r.elements[k]; });
    var missing = EL_KEYS.filter(function (k) { return r.elements[k] === 0; });
    $('#bz-elements').innerHTML = '<div class="el-bars">' + EL_KEYS.map(function (k) {
      var n = r.elements[k];
      return '<div class="el-bar-row"><span class="el-name' + (n ? '' : ' zero') + '">' + EL_EN[k] + '</span><div class="track"><div class="fill bz-fill-' + k + '" style="width:' + (max ? Math.round(n / max * 100) : 0) + '%"></div></div><span class="el-count">' + n + '</span></div>';
    }).join('') + '</div><p class="form-microcopy" style="text-align:left;">' + r.totalChars + ' characters counted (stems and branches' + (P.hour ? '' : ', no hour pillar') + ').' + (missing.length ? ' Missing: ' + missing.map(function (k) { return EL_EN[k]; }).join(', ') + '.' : ' All five elements are present.') + '</p>';

    /* ten gods */
    var counts = r.sipseongCounts || {};
    $('#bz-tengods').innerHTML = '<div class="bz-tg-grid">' + TG_ORDER.map(function (k) {
      var n = counts[k] || 0;
      return '<div class="bz-tg-cell' + (n ? '' : ' none') + '"><b>' + n + '</b><span>' + tgLink(k) + '<small>' + TG[k][1] + '</small></span></div>';
    }).join('') + '</div><p class="form-microcopy" style="text-align:left;">Counted over the other ' + (r.totalChars - 1) + ' characters: every stem, plus the main hidden stem of each branch. Two or more of one god makes it a theme of the chart; none means you meet that energy mostly through luck pillars and years.</p>';

    /* luck pillars */
    var d = r.daeun, list = d.list, birthY = inp.year, age0 = list[0].startAge - 1;
    var cur = null; list.forEach(function (dw) { if (dw.current) cur = dw; });
    $('#bz-luck-intro').innerHTML = 'Luck Pillars run <b>' + (d.forward ? 'forward' : 'backward') + '</b> from the Month Pillar (' + (d.forward ? 'yang-year man or yin-year woman' : 'yin-year man or yang-year woman') + '), one every ten years. The first begins in ' + (birthY + age0) + ', the year you turn ' + age0 + (cur ? '. You are in the <b>' + M.STEMS[cur.stem].han + M.BRANCHES[cur.branch].han + '</b> (' + PY_S[cur.stem] + ' ' + PY_B[cur.branch] + ') pillar now.' : '.');
    $('#bz-luck').innerHTML = '<table class="bz-table"><tr><th>Ages</th><th>Years</th><th>Pillar</th><th>Stem · Ten God</th><th>Branch · Ten God</th></tr>' + list.map(function (dw) {
      var a0 = dw.startAge - 1, a1 = dw.endAge - 1;
      return '<tr' + (dw.current ? ' class="cur"' : '') + '><td>' + a0 + '–' + a1 + '</td><td>' + (birthY + a0) + '–' + (birthY + a1) + '</td><td class="han">' + stemHtml(dw.stem) + branchHtml(dw.branch) + '<small>' + PY_S[dw.stem] + ' ' + PY_B[dw.branch] + '</small></td><td>' + tgName(dw.sipseong) + '</td><td>' + tgName(M.branchSipseong(dm, dw.branch)) + '</td></tr>';
    }).join('') + '</table>';

    /* annual pillars */
    var nowY = new Date().getFullYear(), rows = '';
    for (var y = nowY - 1; y <= nowY + 3; y++) {
      var s = ((y - 4) % 10 + 10) % 10, b = ((y - 4) % 12 + 12) % 12;
      var rel = M.branchRelation(b, P.day.branch);
      rows += '<tr' + (y === nowY ? ' class="cur"' : '') + '><td>' + y + (y === nowY ? ' <small>now</small>' : '') + '</td><td class="han">' + stemHtml(s) + branchHtml(b) + '<small>' + PY_S[s] + ' ' + PY_B[b] + '</small></td><td>' + tgName(M.sipseongOf(dm, s)) + '</td><td>' + tgName(M.branchSipseong(dm, b)) + '</td><td>' + (REL_EN[rel] || '—') + '</td></tr>';
    }
    $('#bz-years').innerHTML = '<table class="bz-table"><tr><th>Year</th><th>Pillar</th><th>Stem · Ten God</th><th>Branch · Ten God</th><th>With your Day Branch</th></tr>' + rows + '</table>';

    /* links */
    var i60 = idx60(P.day.stem, P.day.branch), slug = (window.EN_PILLAR_SLUGS || [])[i60];
    $('#bz-links').innerHTML = (slug ? '<a href="/en/guide/day-pillar/' + slug + '/">Your Day Pillar ' + PY_S[P.day.stem] + ' ' + PY_B[P.day.branch] + ' — the sixty-pillar profile →</a>' : '') +
      '<a href="/en/">Korean-style reading of this chart (Day Master character, luck-pillar stories) →</a>' +
      '<a href="/en/today/">Today’s energy for this chart →</a>';
    last = r;
  }

  function chartText(r) {
    var P = r.pillars, dm = P.day.stem, inp = r.input;
    var pil = function (p) { return p ? M.STEMS[p.stem].han + M.BRANCHES[p.branch].han + ' ' + PY_S[p.stem] + ' ' + PY_B[p.branch] : '— (hour unknown)'; };
    var lines = ['My BaZi chart — born ' + inp.year + '-' + pad2(inp.month) + '-' + pad2(inp.day) + (inp.unknownTime ? '' : ' ' + pad2(inp.hour) + ':' + pad2(inp.minute)),
      'Year ' + pil(P.year) + ' · Month ' + pil(P.month) + ' · Day ' + pil(P.day) + ' · Hour ' + pil(P.hour),
      'Day Master: ' + M.STEMS[dm].han + ' ' + PY_S[dm] + ' (' + (M.STEMS[dm].yang ? 'yang' : 'yin') + ' ' + EL_EN[M.STEMS[dm].el] + ') — ' + STRENGTH[r.strength.label],
      'Elements: ' + EL_KEYS.map(function (k) { return EL_EN[k] + ' ' + r.elements[k]; }).join(', '),
      'Ten Gods: ' + TG_ORDER.filter(function (k) { return r.sipseongCounts[k]; }).map(function (k) { return tgName(k) + ' ×' + r.sipseongCounts[k]; }).join(', '),
      'Luck Pillars: ' + r.daeun.list.map(function (dw) { return (dw.startAge - 1) + ' ' + M.STEMS[dw.stem].han + M.BRANCHES[dw.branch].han; }).join(' · '),
      'sajucheop.com/en/bazi-calculator/'];
    return lines.join('\n');
  }

  $('#bz-run').addEventListener('click', function () {
    var v = $('#bz-date').value, parts = v.split('-').map(Number);
    if (parts.length !== 3 || !parts[0] || parts[0] < 1900 || parts[0] > 2100) { toast('Please enter a birth date between 1900 and 2100.'); return; }
    var unknown = $('#bz-no-time').checked, t = ($('#bz-time').value || '12:00').split(':').map(Number);
    var solar = $('#bz-solar').checked, lon = parseFloat($('#bz-lon').value);
    if (solar && !(lon >= -180 && lon <= 180)) { toast('Enter the birthplace longitude to apply true solar time.'); return; }
    var opts = { year: parts[0], month: parts[1], day: parts[2], hour: unknown ? 12 : t[0], minute: unknown ? 0 : (t[1] || 0), unknownTime: unknown, gender: $('#bz-gender').value, applySolarTime: solar, tzOffsetMinutes: +$('#bz-tz').value };
    if (solar) opts.longitude = lon;
    var r;
    try { r = M.compute(opts); } catch (e) { toast('Something went wrong — please check the date.'); return; }
    render(r);
    try {
      localStorage.setItem('sajucheop.en.profile.v1', JSON.stringify({ y: parts[0], m: parts[1], d: parts[2], unknown: unknown, hh: unknown ? 12 : t[0], mi: unknown ? 0 : (t[1] || 0), tz: +$('#bz-tz').value, g: $('#bz-gender').value }));
    } catch (e) { /* ignore */ }
    $('#bz-out').hidden = false;
    $('#bz-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
    track('en_bazi_cast', { unknown_time: unknown ? 1 : 0, solar: solar ? 1 : 0 });
  });
  $('#bz-copy').addEventListener('click', function () {
    if (!last) return;
    var text = chartText(last);
    var done = function () { toast('Chart copied — paste it anywhere.'); track('en_bazi_copy'); };
    var manual = function () { try { window.prompt('Copy your chart:', text); } catch (e) { toast('Copy is blocked here — select the chart text instead.'); } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, manual);
    else manual();
  });
})();
