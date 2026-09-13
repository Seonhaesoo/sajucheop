/* Korean name generator by five elements — /en/korean-name/
 * Data: js/en-names.js (window.EN_NAMES = { SYL, SURNAMES }); chart: js/manseryeok.js (window.Manseryeok). */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var M = window.Manseryeok, D = window.EN_NAMES;
  if (!M || !D) return;
  var EL_EN = { '목': 'Wood', '화': 'Fire', '토': 'Earth', '금': 'Metal', '수': 'Water' };
  var EL_KEYS = ['목', '화', '토', '금', '수'];
  var GEN = { '목': '화', '화': '토', '토': '금', '금': '수', '수': '목' };   /* X feeds GEN[X] */
  var FED_BY = { '화': '목', '토': '화', '금': '토', '수': '금', '목': '수' }; /* FED_BY[X] feeds X */
  var STEM_EN = ['Yang Wood', 'Yin Wood', 'Yang Fire', 'Yin Fire', 'Yang Earth', 'Yin Earth', 'Yang Metal', 'Yin Metal', 'Yang Water', 'Yin Water'];
  var TZ = [
    [-720, 'UTC−12'], [-660, 'UTC−11'], [-600, 'UTC−10 · Hawaii'], [-540, 'UTC−9 · Alaska'],
    [-480, 'UTC−8 · Los Angeles'], [-420, 'UTC−7 · Denver'], [-360, 'UTC−6 · Chicago, Mexico City'],
    [-300, 'UTC−5 · New York, Toronto'], [-240, 'UTC−4 · Santiago, Halifax'], [-210, 'UTC−3:30 · Newfoundland'],
    [-180, 'UTC−3 · São Paulo, Buenos Aires'], [-120, 'UTC−2'], [-60, 'UTC−1'],
    [0, 'UTC±0 · London, Lisbon, Accra'], [60, 'UTC+1 · Paris, Berlin, Lagos'], [120, 'UTC+2 · Cairo, Athens, Johannesburg'],
    [180, 'UTC+3 · Moscow, Istanbul, Riyadh'], [210, 'UTC+3:30 · Tehran'], [240, 'UTC+4 · Dubai'],
    [270, 'UTC+4:30 · Kabul'], [300, 'UTC+5 · Karachi, Tashkent'], [330, 'UTC+5:30 · India, Sri Lanka'],
    [345, 'UTC+5:45 · Nepal'], [360, 'UTC+6 · Dhaka, Almaty'], [390, 'UTC+6:30 · Myanmar'],
    [420, 'UTC+7 · Bangkok, Jakarta, Hanoi'], [480, 'UTC+8 · Beijing, Singapore, Manila'],
    [540, 'UTC+9 · Seoul, Tokyo'], [570, 'UTC+9:30 · Adelaide'], [600, 'UTC+10 · Sydney, Guam'],
    [660, 'UTC+11'], [720, 'UTC+12 · Auckland'], [780, 'UTC+13'], [840, 'UTC+14']
  ];
  function track(name, params) { try { if (window.gtag) window.gtag('event', name, params || {}); } catch (e) { /* ignore */ } }
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- form setup ---------- */
  $('#kn-tz').innerHTML = TZ.map(function (t) { return '<option value="' + t[0] + '"' + (t[0] === 540 ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('');
  $('#kn-surname').innerHTML = '<option value="">No surname</option>' + D.SURNAMES.map(function (s, i) { return '<option value="' + i + '">' + s.rr + ' (' + s.ko + ' ' + s.hanja + ')</option>'; }).join('');
  /* prefill from the chart page profile, if this device has one */
  try {
    var p = JSON.parse(localStorage.getItem('sajucheop.en.profile.v1') || 'null');
    if (p && p.y) {
      $('#kn-date').value = p.y + '-' + String(p.m).padStart(2, '0') + '-' + String(p.d).padStart(2, '0');
      $('#kn-no-time').checked = !!p.unknown;
      if (!p.unknown) $('#kn-time').value = String(p.hh).padStart(2, '0') + ':' + String(p.mi || 0).padStart(2, '0');
      if (typeof p.tz === 'number') $('#kn-tz').value = p.tz;
    }
  } catch (e) { /* ignore */ }
  function setMode(mode) {
    $('#kn-birth').hidden = mode !== 'birth';
    $('#kn-pick').hidden = mode !== 'pick';
    Array.prototype.forEach.call(document.querySelectorAll('.kn-tab'), function (b) { b.classList.toggle('on', b.getAttribute('data-mode') === mode); });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.kn-tab'), function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); }); });
  $('#kn-no-time').addEventListener('change', function () { $('#kn-time').disabled = $('#kn-no-time').checked; });
  $('#kn-time').disabled = $('#kn-no-time').checked;

  /* ---------- picking the elements a name should carry ---------- */
  function needFromChart(r) {
    var els = r.elements, min = Infinity;
    EL_KEYS.forEach(function (k) { if (els[k] < min) min = els[k]; });
    var primary = EL_KEYS.filter(function (k) { return els[k] === min; }).slice(0, 2);
    var dmEl = M.STEMS[r.pillars.day.stem].el, support = null, why = '';
    if (r.strength.label === '신약') { support = FED_BY[dmEl]; why = 'weak, so ' + EL_EN[support] + ' — the element that feeds ' + EL_EN[dmEl] + ' — also helps'; }
    else if (r.strength.label === '신강') { support = GEN[dmEl]; why = 'strong, so ' + EL_EN[support] + ' — the element ' + EL_EN[dmEl] + ' pours into — gives it an outlet'; }
    if (support && primary.indexOf(support) >= 0) support = null;
    return { primary: primary, support: support, min: min, why: why, dmEl: dmEl };
  }
  function pickHanja(syl, el) { for (var i = 0; i < syl.hj.length; i++) if (syl.hj[i].el === el) return syl.hj[i]; return null; }
  function allowed(syl, style) { return syl.g === 'n' || style === 'any' || syl.g === style; }
  function seeded(seed) { var x = seed * 9301 + 49297; return function () { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }

  var BLOCK = {};
  (D.BLOCK || []).forEach(function (w) { BLOCK[w] = true; });
  function generate(need, style, seed) {
    var targets = need.primary, support = need.support, out = [], rnd = seeded(seed);
    var firsts = D.SYL.filter(function (s) { return s.pos !== 'last' && allowed(s, style); });
    var lasts = D.SYL.filter(function (s) { return s.pos !== 'first' && allowed(s, style); });
    var wants = [];
    targets.forEach(function (a) { targets.forEach(function (b) { wants.push([a, b, 2]); }); });
    if (support) targets.forEach(function (a) { wants.push([a, support, 1]); wants.push([support, a, 1]); });
    firsts.forEach(function (A) {
      lasts.forEach(function (B) {
        if (A.s === B.s || BLOCK[A.s + B.s]) return;
        var best = null;
        wants.forEach(function (w) {
          var ha = pickHanja(A, w[0]), hb = pickHanja(B, w[1]);
          if (!ha || !hb) return;
          var score = A.pop + B.pop + w[2] + (A.pos === 'both' && B.pos === 'both' ? 0 : 0.5);
          if (!best || score > best.score) best = { A: A, B: B, ha: ha, hb: hb, score: score };
        });
        if (best) { best.r = rnd(); out.push(best); }
      });
    });
    out.sort(function (a, b) { return b.score - a.score || a.r - b.r; });
    return out;
  }

  /* ---------- rendering ---------- */
  function elBars(r) {
    var total = r.totalChars || 8, max = 0;
    EL_KEYS.forEach(function (k) { if (r.elements[k] > max) max = r.elements[k]; });
    return '<div class="el-bars kn-bars">' + EL_KEYS.map(function (k) {
      var n = r.elements[k];
      return '<div class="el-bar-row"><span class="el-name' + (n === 0 ? ' zero' : '') + '">' + EL_EN[k] + '</span><div class="track"><div class="fill el-' + k + '" style="width:' + (max ? Math.round(n / max * 100) : 0) + '%"></div></div><span class="el-count">' + n + '</span></div>';
    }).join('') + '<p class="form-microcopy" style="text-align:left;margin-top:4px;">' + total + ' characters counted' + (total === 6 ? ' (no hour pillar — birth time unknown)' : '') + '.</p></div>';
  }
  function needLine(need, r) {
    var p = need.primary.map(function (k) { return EL_EN[k]; });
    var s = need.min === 0 ? (p.length > 1 ? p.join(' and ') + ' are missing from your chart' : p[0] + ' is missing from your chart') : (p.length > 1 ? p.join(' and ') + ' are the thinnest (' + need.min + ' each)' : p[0] + ' is the thinnest (' + need.min + ')');
    s += ' — so the names below carry ' + (p.length > 1 ? 'those elements' : p[0]) + '.';
    if (need.support) s += ' Your Day Master ' + M.STEMS[r.pillars.day.stem].han + ' ' + STEM_EN[r.pillars.day.stem] + ' reads as ' + need.why + ', so a few names mix in ' + EL_EN[need.support] + '.';
    return s;
  }
  var state = { need: null, style: 'any', seed: 1, r: null };
  function romanize(A, B) { return cap(A.rr) + '-' + B.rr; }
  function passport(A, B) { var a = A.alt || cap(A.rr), b = B.alt ? B.alt.toLowerCase() : B.rr; var s = a + '-' + b; return s === romanize(A, B) ? '' : s; }
  function cardHtml(n, surname) {
    var A = n.A, B = n.B, sn = surname ? surname : null;
    var rr = romanize(A, B), pp = passport(A, B);
    var tags = [n.ha.el, n.hb.el].filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (k) { return '<span class="kn-tag el-' + k + '">' + EL_EN[k] + '</span>'; }).join('');
    return '<div class="kn-card">' +
      '<div class="kn-hangul">' + (sn ? '<span class="kn-sn">' + sn.ko + '</span>' : '') + A.s + B.s + '</div>' +
      '<div class="kn-rr">' + (sn ? sn.rr + ' ' : '') + rr + (pp ? ' <span>(' + (sn ? sn.rr + ' ' : '') + pp + ')</span>' : '') + '</div>' +
      '<div class="kn-hanja">' + (sn ? '<span class="kn-sn">' + sn.hanja + '</span>' : '') + n.ha.h + n.hb.h + '</div>' +
      '<div class="kn-mean"><b>' + n.ha.h + '</b> ' + esc(n.ha.m) + ' <i>(' + esc(n.ha.r) + ')</i><br><b>' + n.hb.h + '</b> ' + esc(n.hb.m) + ' <i>(' + esc(n.hb.r) + ')</i></div>' +
      '<div class="kn-foot">' + tags + '<span class="kn-say">say “' + A.say + '-' + B.say + '”</span></div>' +
      '</div>';
  }
  function renderNames() {
    var list = generate(state.need, state.style, state.seed);
    var sn = $('#kn-surname').value !== '' ? D.SURNAMES[+$('#kn-surname').value] : null;
    $('#kn-names').innerHTML = list.length ? list.slice(0, 12).map(function (n) { return cardHtml(n, sn); }).join('') : '<p>No names found for that combination — try another style.</p>';
    $('#kn-count').textContent = list.length ? list.length + ' name pairings match — showing 12.' : '';
  }
  function run() {
    var mode = $('#kn-birth').hidden ? 'pick' : 'birth', style = $('input[name="kn-style"]:checked').value;
    state.style = style; state.seed = 1;
    if (mode === 'pick') {
      var el = $('#kn-el').value;
      state.need = { primary: [el], support: null, min: -1 };
      state.r = null;
      $('#kn-chart').innerHTML = '<p><b>' + EL_EN[el] + '</b> names — every syllable below is written with a hanja whose radical belongs to ' + EL_EN[el] + '.</p>';
    } else {
      var v = $('#kn-date').value, parts = v.split('-').map(Number);
      if (parts.length !== 3 || !parts[0]) { $('#kn-chart').innerHTML = '<p>Please enter a birth date.</p>'; return; }
      var unknown = $('#kn-no-time').checked, t = ($('#kn-time').value || '12:00').split(':').map(Number), r;
      try {
        r = M.compute({ year: parts[0], month: parts[1], day: parts[2], hour: unknown ? 12 : t[0], minute: unknown ? 0 : (t[1] || 0), unknownTime: unknown, gender: 'F', applySolarTime: false, tzOffsetMinutes: +$('#kn-tz').value });
      } catch (e) { $('#kn-chart').innerHTML = '<p>Something went wrong — please check the date.</p>'; return; }
      state.r = r; state.need = needFromChart(r);
      var dm = r.pillars.day.stem;
      $('#kn-chart').innerHTML = '<p class="kn-dm">Day Master <b>' + M.STEMS[dm].han + ' ' + STEM_EN[dm] + '</b> · ' + (r.strength.label === '신강' ? 'strong' : r.strength.label === '신약' ? 'weak' : 'balanced') + ' chart</p>' + elBars(r) + '<p class="kn-need">' + needLine(state.need, r) + '</p>';
    }
    renderNames();
    $('#kn-out').hidden = false;
    track('en_name_gen', { mode: mode, style: style });
  }
  $('#kn-go').addEventListener('click', run);
  $('#kn-more').addEventListener('click', function () { if (!state.need) return; state.seed += 1; renderNames(); track('en_name_more'); });
  $('#kn-surname').addEventListener('change', function () { if (state.need) renderNames(); });
  Array.prototype.forEach.call(document.querySelectorAll('input[name="kn-style"]'), function (i) { i.addEventListener('change', function () { if (state.need) { state.style = i.value; state.seed = 1; renderNames(); } }); });
})();
