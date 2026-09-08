/* 오늘의 띠별 운세 카드 — 페이지의 .fcard[data-*] 값만으로 1080×1350 캔버스를 그려 저장·공유한다.
 * 외부 요청 없음. 글꼴은 페이지가 이미 불러온 Noto Serif KR / Noto Sans KR 을 document.fonts.load 로 기다린 뒤 그린다.
 * tools/build-ddi-daily.mjs 가 만드는 /today/ddi/<띠>/ · /tomorrow/ddi/<띠>/ 에서 쓴다. */
(function () {
  'use strict';
  var box = document.querySelector('.fcard');
  if (!box) return;
  var d = box.dataset;
  var img = document.getElementById('fcard-img');
  var cv = document.getElementById('fcard-canvas');
  var btnSave = document.getElementById('fcard-save');
  var btnShare = document.getElementById('fcard-share');
  if (!img || !cv || !cv.getContext) return;

  var SERIF = '"Noto Serif KR", "Nanum Myeongjo", Batang, serif';
  var SANS = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  var W = 1080, H = 1350;
  var INK = '#211C15', PAPER = '#F6F1E8', SEAL = '#B8382D', MUTED = '#6E6455', FAINT = '#9A8F7E', LINE = '#D8CDB9', BODY = '#40372B';
  var kind = d.kind || '오늘';
  var fileName = '사주첩-' + kind + '의-' + (d.ddi || '띠') + '-운세-' + (d.iso || '') + '.png';

  function track(name) {
    try { if (window.gtag) window.gtag('event', name, { ddi: d.ddi, kind: kind }); } catch (e) { /* 무시 */ }
  }
  function rr(ctx, x, y, w, h, r) {
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    else { ctx.beginPath(); ctx.rect(x, y, w, h); }
  }
  function spaced(ctx, px) { try { ctx.letterSpacing = px + 'px'; } catch (e) { /* 미지원 */ } }

  /* 한국어 줄바꿈 — 공백에서 먼저 끊고, 한 덩어리가 넘치면 글자 단위. maxLines 를 넘기면 말줄임 */
  function wrap(ctx, text, maxW, maxLines) {
    var words = String(text || '').trim().split(/\s+/), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var w = words[i], test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width <= maxW) { cur = test; continue; }
      if (cur) { lines.push(cur); cur = ''; }
      if (ctx.measureText(w).width > maxW) {
        var piece = '';
        for (var j = 0; j < w.length; j++) {
          if (ctx.measureText(piece + w[j]).width > maxW) { lines.push(piece); piece = w[j]; } else piece += w[j];
        }
        cur = piece;
      } else cur = w;
    }
    if (cur) lines.push(cur);
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      var last = lines[maxLines - 1];
      while (last.length && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1);
      lines[maxLines - 1] = last + '…';
    }
    return lines;
  }

  function draw() {
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    /* 먹 테두리 두 겹 */
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(36, 36, W - 72, H - 72);
    ctx.strokeStyle = LINE; ctx.lineWidth = 1.5; ctx.strokeRect(56, 56, W - 112, H - 112);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

    /* 머리말 · 날짜 */
    ctx.fillStyle = SEAL; ctx.font = '700 30px ' + SANS; spaced(ctx, 8);
    ctx.fillText(kind + '의 띠별 운세', W / 2 + 4, 150);
    spaced(ctx, 0);
    ctx.fillStyle = MUTED; ctx.font = '400 30px ' + SANS;
    ctx.fillText((d.date || '') + (d.ganji ? ' · ' + d.ganji + '일' : ''), W / 2, 205);

    /* 인주 도장 — 띠 한자 */
    ctx.fillStyle = SEAL; rr(ctx, W / 2 - 110, 262, 220, 220, 22); ctx.fill();
    ctx.fillStyle = PAPER; ctx.font = '700 150px ' + SERIF; ctx.textBaseline = 'middle';
    ctx.fillText(d.han || '', W / 2, 378);
    ctx.textBaseline = 'alphabetic';

    /* 띠 이름 */
    ctx.fillStyle = INK; ctx.font = '700 62px ' + SERIF;
    ctx.fillText(d.ddi || '', W / 2, 568);

    /* 점수 · 등급 */
    var score = d.score || '';
    ctx.font = '800 170px ' + SANS; var sw = ctx.measureText(score).width;
    ctx.font = '700 40px ' + SANS; var uw = ctx.measureText('점').width;
    var x0 = W / 2 - (sw + 10 + uw) / 2;
    ctx.textAlign = 'left';
    ctx.fillStyle = INK; ctx.font = '800 170px ' + SANS; ctx.fillText(score, x0, 748);
    ctx.font = '700 40px ' + SANS; ctx.fillText('점', x0 + sw + 10, 748);
    ctx.textAlign = 'center';
    ctx.fillStyle = SEAL; ctx.font = '600 40px ' + SERIF;
    ctx.fillText((d.gradeHan ? d.gradeHan + ' ' : '') + (d.grade || ''), W / 2, 812);

    ctx.strokeStyle = LINE; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(200, 862); ctx.lineTo(W - 200, 862); ctx.stroke();

    /* 한 줄 · 요약 (두 줄까지) */
    ctx.fillStyle = BODY; ctx.font = '600 52px ' + SERIF;
    ctx.fillText('「 ' + (d.line || '') + ' 」', W / 2, 946);
    ctx.fillStyle = MUTED; ctx.font = '400 33px ' + SANS;
    var lines = wrap(ctx, d.sum || '', W - 200, 2);
    for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], W / 2, 1014 + i * 48);

    /* 행운의 조각 */
    var lucky = [];
    if (d.color) lucky.push('색 ' + d.color);
    if (d.num) lucky.push('숫자 ' + d.num);
    if (d.hour) lucky.push('시간 ' + d.hour);
    if (lucky.length) {
      ctx.fillStyle = FAINT; ctx.font = '400 29px ' + SANS;
      ctx.fillText('행운의 조각 — ' + lucky.join(' · '), W / 2, 1140);
    }

    ctx.strokeStyle = LINE;
    ctx.beginPath(); ctx.moveTo(300, 1198); ctx.lineTo(W - 300, 1198); ctx.stroke();
    ctx.fillStyle = SEAL; ctx.font = '700 32px ' + SANS;
    ctx.fillText('sajucheop.com', W / 2, 1258);
    ctx.fillStyle = FAINT; ctx.font = '400 24px ' + SANS;
    ctx.fillText('사주첩 · 매일 자정 갱신 · 참고용', W / 2, 1300);
  }

  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var sample = '사주첩四柱' + (d.han || '') + (d.ddi || '');
    var fonts = ['700 150px ' + SERIF, '700 62px ' + SERIF, '600 52px ' + SERIF, '600 40px ' + SERIF,
      '700 30px ' + SANS, '400 30px ' + SANS, '800 170px ' + SANS, '400 33px ' + SANS];
    return Promise.all(fonts.map(function (f) { return document.fonts.load(f, sample); })).catch(function () { /* 대체 글꼴로 진행 */ });
  }
  function toBlob() {
    return new Promise(function (resolve) {
      try {
        if (cv.toBlob) { cv.toBlob(function (b) { resolve(b); }, 'image/png'); return; }
        var s = atob(cv.toDataURL('image/png').split(',')[1]);
        var a = new Uint8Array(s.length);
        for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
        resolve(new Blob([a], { type: 'image/png' }));
      } catch (e) { resolve(null); }
    });
  }

  fontsReady().then(function () {
    draw();
    try { img.src = cv.toDataURL('image/png'); } catch (e) { /* 캔버스 오염 등 — 미리보기 없이 진행 */ }
    box.classList.add('ready');

    if (btnSave) {
      btnSave.addEventListener('click', function () {
        toBlob().then(function (b) {
          if (!b) return;
          var url = URL.createObjectURL(b);
          var a = document.createElement('a');
          a.href = url; a.download = fileName; a.rel = 'noopener';
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
          track('fcard_save');
        });
      });
    }
    if (btnShare && navigator.share && navigator.canShare) {
      toBlob().then(function (b) {
        if (!b) return;
        var file;
        try { file = new File([b], fileName, { type: 'image/png' }); } catch (e) { return; }
        if (!navigator.canShare({ files: [file] })) return;
        btnShare.hidden = false;
        btnShare.addEventListener('click', function () {
          navigator.share({ files: [file], title: kind + '의 ' + d.ddi + ' 운세 ' + d.score + '점', text: (d.date || '') + ' ' + kind + '의 ' + d.ddi + ' 운세 — ' + (d.line || '') + ' ' + (d.url ? 'https://' + d.url : '') })
            .then(function () { track('fcard_share'); })
            .catch(function () { /* 사용자가 취소 */ });
        });
      });
    }
  });
})();
