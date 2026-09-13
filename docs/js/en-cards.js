/* Sajucheop — English share cards (1080×1920 story format), paper-and-ink style shared by /en/, /en/quiz/ and /en/match/.
 * window.EnCards = { fonts, dayMaster, match, deliver } */
(function () {
  'use strict';
  var W = 1080, H = 1920;
  var INK = '#211C15', SEAL = '#B8382D', PAPER = '#F6F1E8', MUTED = '#6E6455', LINE = '#C9BFAC';
  var SERIF = '"Noto Serif KR", serif', SANS = '"Noto Sans KR", sans-serif';

  function fonts(extraText) {
    var list = ['700 420px ' + SERIF, '700 76px ' + SERIF, '600 44px ' + SERIF, '400 40px ' + SERIF, '700 260px ' + SERIF, '600 50px ' + SERIF,
      '500 38px ' + SANS, '500 30px ' + SANS, '400 30px ' + SANS, '700 36px ' + SANS, '700 120px ' + SANS];
    if (!(document.fonts && document.fonts.load)) return Promise.resolve();
    return Promise.all(list.map(function (f) { return document.fonts.load(f, '四柱' + (extraText || '')); })).catch(function () {});
  }

  function roundRect(x, px, py, w, h, r) {
    x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r);
    x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath();
  }
  function frame(x) {
    x.fillStyle = PAPER; x.fillRect(0, 0, W, H);
    x.strokeStyle = INK; x.lineWidth = 8; x.strokeRect(40, 40, W - 80, H - 80);
    x.strokeStyle = LINE; x.lineWidth = 2; x.strokeRect(72, 72, W - 144, H - 144);
  }
  function seal(x, overline) {
    x.fillStyle = SEAL; roundRect(x, 120, 120, 120, 120, 16); x.fill();
    x.fillStyle = PAPER; x.font = '600 44px ' + SERIF; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('四', 180, 158); x.fillText('柱', 180, 204);
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillStyle = MUTED; x.font = '500 30px ' + SANS; x.fillText(overline, 280, 190);
  }
  function wrap(x, text, maxWidth) {
    var words = String(text).split(' '), line = '', lines = [];
    words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxWidth && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line);
    return lines;
  }
  function pills(x, y, items) {
    x.font = '500 30px ' + SANS;
    var widths = items.map(function (p) { return x.measureText(p).width + 44; });
    var total = widths.reduce(function (a, b) { return a + b; }, 0) + (items.length - 1) * 16;
    var px = (W - total) / 2;
    items.forEach(function (p, i) {
      x.strokeStyle = LINE; x.lineWidth = 2; roundRect(x, px, y - 34, widths[i], 52, 26); x.stroke();
      x.fillStyle = INK; x.textAlign = 'center'; x.fillText(p, px + widths[i] / 2, y + 2);
      px += widths[i] + 16;
    });
  }
  function footer(x, line, url) {
    x.textAlign = 'center';
    x.fillStyle = MUTED; x.font = '400 30px ' + SANS; x.fillText(line, W / 2, 1700);
    x.fillStyle = SEAL; x.font = '700 36px ' + SANS; x.fillText(url, W / 2, 1760);
  }
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

  /* o: { han, arch, name, essence, keywords[], overline, footerLine, url, pillars: [{label, han}] } */
  function dayMaster(o) {
    var c = document.createElement('canvas'), x = c.getContext('2d');
    c.width = W; c.height = H;
    frame(x); seal(x, o.overline || 'MY DAY MASTER');
    x.textAlign = 'center';
    x.fillStyle = SEAL; x.font = '700 420px ' + SERIF; x.fillText(o.han, W / 2, 740);
    x.fillStyle = INK; x.font = '700 76px ' + SERIF; x.fillText(o.arch, W / 2, 890);
    x.fillStyle = MUTED; x.font = '500 38px ' + SANS; x.fillText(o.name + ' Day Master', W / 2, 960);
    x.strokeStyle = SEAL; x.lineWidth = 4; x.beginPath(); x.moveTo(440, 1010); x.lineTo(640, 1010); x.stroke();
    var y = 1100;
    if (o.essence) {
      x.fillStyle = INK; x.font = '400 40px ' + SERIF;
      var lines = wrap(x, o.essence, 820);
      lines.forEach(function (l, i) { x.fillText(l, W / 2, y + i * 58); });
      y += lines.length * 58 + 40;
    }
    if (o.keywords && o.keywords.length) { pills(x, y, o.keywords.map(cap)); y += 90; }
    if (o.pillars && o.pillars.length) {
      var cols = o.pillars.length, colW = 190, x0 = (W - cols * colW) / 2;
      o.pillars.forEach(function (p, i) {
        var cx = x0 + colW * i + colW / 2;
        x.fillStyle = MUTED; x.font = '500 22px ' + SANS; x.fillText(p.label.toUpperCase(), cx, y + 20);
        x.fillStyle = p.day ? SEAL : INK; x.font = '600 50px ' + SERIF;
        x.fillText(p.han.charAt(0), cx, y + 84); x.fillText(p.han.charAt(1) || '', cx, y + 140);
      });
    }
    footer(x, o.footerLine || 'Korean Four Pillars, explained in plain English.', o.url || 'sajucheop.com/en');
    return c;
  }

  /* o: { aHan, bHan, aLabel, bLabel, aName, bName, score, tier, notes[], overline, footerLine, url } */
  function match(o) {
    var c = document.createElement('canvas'), x = c.getContext('2d');
    c.width = W; c.height = H;
    frame(x); seal(x, o.overline || 'OUR SAJU MATCH');
    x.textAlign = 'center';
    x.fillStyle = INK; x.font = '600 50px ' + SERIF;
    x.fillText(o.aLabel + '   ×   ' + o.bLabel, W / 2, 400);
    x.fillStyle = SEAL; x.font = '700 260px ' + SERIF;
    x.fillText(o.aHan, 330, 720); x.fillText(o.bHan, 750, 720);
    x.fillStyle = MUTED; x.font = '500 30px ' + SANS;
    x.fillText(o.aName, 330, 790); x.fillText(o.bName, 750, 790);
    x.fillStyle = INK; x.font = '600 44px ' + SERIF; x.fillText('×', W / 2, 690);
    x.fillStyle = SEAL; x.font = '700 120px ' + SANS; x.fillText(String(o.score), W / 2, 1010);
    x.fillStyle = MUTED; x.font = '500 30px ' + SANS; x.fillText('out of 100', W / 2, 1060);
    x.fillStyle = INK; x.font = '400 40px ' + SERIF;
    var y = 1160;
    wrap(x, o.tier, 820).forEach(function (l, i) { x.fillText(l, W / 2, y + i * 58); y += 58; });
    if (o.notes && o.notes.length) {
      x.strokeStyle = LINE; x.lineWidth = 2; x.beginPath(); x.moveTo(440, y + 30); x.lineTo(640, y + 30); x.stroke();
      y += 110;
      x.fillStyle = MUTED; x.font = '400 32px ' + SANS;
      o.notes.forEach(function (n) {
        wrap(x, n, 800).forEach(function (l) { x.fillText(l, W / 2, y); y += 46; });
        y += 22;
      });
    }
    footer(x, o.footerLine || 'Two charts, one chemistry — free Saju compatibility.', o.url || 'sajucheop.com/en/match');
    return c;
  }

  /* share the PNG on phones, download it elsewhere; resolves 'shared' | 'downloaded' | 'failed' */
  function deliver(canvas, filename, shareText, shareTitle) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        if (!blob) { resolve('failed'); return; }
        var file = null;
        try { file = new File([blob], filename, { type: 'image/png' }); } catch (e) { file = null; }
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: shareTitle || 'Sajucheop', text: shareText || '' }).then(function () { resolve('shared'); }).catch(function () { resolve('shared'); });
        } else {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob); a.download = filename;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
          resolve('downloaded');
        }
      }, 'image/png');
    });
  }

  window.EnCards = { fonts: fonts, dayMaster: dayMaster, match: match, deliver: deliver };
})();
