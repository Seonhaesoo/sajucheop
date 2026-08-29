/* ============================================================
 * 사주첩 — 출산 택일 (베타)
 * 후보 날짜·시간대별로 아기의 명식을 미리 세워 품질을 채점한다.
 * 채점 기준(명리학 관점의 참고 지표):
 *  - 오행을 고루 갖췄는가 (종류 수, 치우침, 부재)
 *  - 강약이 중화에 가까운가
 *  - 지지끼리 충(沖)이 없는가 / 합(合)이 있는가
 *  - 천간합이 있는가, 십성이 고루 갖춰졌는가, 관인상생 구조
 * window.Taegil 로 노출.
 * ============================================================ */
(function () {
  'use strict';

  var GROUP = {
    '비견': '비겁', '겁재': '비겁', '식신': '식상', '상관': '식상',
    '편재': '재성', '정재': '재성', '편관': '관성', '정관': '관성',
    '편인': '인성', '정인': '인성'
  };
  /* 천간합: 甲己 乙庚 丙辛 丁壬 戊癸 */
  var STEM_HAP = { 0: 5, 5: 0, 1: 6, 6: 1, 2: 7, 7: 2, 3: 8, 8: 3, 4: 9, 9: 4 };

  /* 수술 현실을 고려한 주간 시진: 진(07~09)~유(17~19) */
  var DAY_SLOTS = [4, 5, 6, 7, 8, 9];
  var SLOT_LABEL = {
    4: '07~09시 · 진시', 5: '09~11시 · 사시', 6: '11~13시 · 오시',
    7: '13~15시 · 미시', 8: '15~17시 · 신시', 9: '17~19시 · 유시'
  };

  function scoreResult(r) {
    var M = window.Manseryeok;
    var score = 40, reasons = [], cautions = [];

    /* 오행 */
    var els = r.elements, kinds = 0, maxc = 0, missing = [];
    ['목', '화', '토', '금', '수'].forEach(function (e) {
      if (els[e] > 0) kinds++; else missing.push(e);
      if (els[e] > maxc) maxc = els[e];
    });
    if (kinds === 5) { score += 20; reasons.push('오행 다섯 기운을 모두 갖춤'); }
    else if (kinds === 4) { score += 12; reasons.push('오행 네 기운을 갖춤'); }
    else if (kinds === 3) { score += 4; }
    if (missing.length) cautions.push(missing.join('·') + ' 기운이 비어 있음');
    if (maxc >= 4) { score -= 6; cautions.push('한 기운으로 치우침'); }
    else { score += 6; }

    /* 강약 */
    if (r.strength.label === '중화') { score += 12; reasons.push('강약이 균형 잡힌 중화 명식'); }
    else if (r.strength.label === '신강') { score += 6; }
    else { score += 2; }

    /* 지지 관계 */
    var br = [r.pillars.year.branch, r.pillars.month.branch, r.pillars.day.branch];
    if (r.pillars.hour) br.push(r.pillars.hour.branch);
    var chung = 0, hap = 0, i, j;
    for (i = 0; i < br.length; i++) {
      for (j = i + 1; j < br.length; j++) {
        var rel = M.branchRelation(br[i], br[j]);
        if (rel === '충') chung++;
        else if (rel === '육합' || rel === '삼합') hap++;
      }
    }
    if (chung === 0) { score += 8; reasons.push('기둥끼리 충(沖)이 없음'); }
    else { score -= 8 * chung; cautions.push('지지 충 ' + chung + '곳'); }
    if (hap > 0) { score += Math.min(hap * 5, 10); reasons.push('지지에 합(合)이 있어 조화로움'); }

    /* 천간합 */
    var st = [r.pillars.year.stem, r.pillars.month.stem, r.pillars.day.stem];
    if (r.pillars.hour) st.push(r.pillars.hour.stem);
    var shap = 0;
    for (i = 0; i < st.length; i++) {
      for (j = i + 1; j < st.length; j++) {
        if (STEM_HAP[st[i]] === st[j]) shap++;
      }
    }
    if (shap > 0) { score += Math.min(shap * 6, 12); reasons.push('천간의 합이 있어 인연이 순함'); }

    /* 십성 구성 */
    var g = {};
    Object.keys(r.sipseongCounts).forEach(function (s) { g[GROUP[s]] = 1; });
    var gk = Object.keys(g).length;
    if (gk >= 4) { score += 8; reasons.push('십성이 고루 갖춰짐'); }
    if (g['관성'] && g['인성']) { score += 5; reasons.push('관인상생의 씨앗을 갖춤'); }

    return {
      score: Math.max(5, Math.min(99, Math.round(score))),
      reasons: reasons,
      cautions: cautions
    };
  }

  /**
   * centerY/M/D: 출산 예정일(양력), rangeDays: ± 범위, gender: 'F'|'M'
   * 반환: 종합 점수 내림차순 후보 배열
   */
  function scanDates(centerY, centerM, centerD, rangeDays, gender) {
    var M = window.Manseryeok;
    var dn = M._internals.daysFromCivil(centerY, centerM, centerD);
    var out = [];
    for (var off = -rangeDays; off <= rangeDays; off++) {
      var cv = M._internals.civilFromDays(dn + off);
      var base = M.compute({
        year: cv.y, month: cv.m, day: cv.d,
        unknownTime: true, gender: gender || 'F', applySolarTime: false
      });
      var dayScore = scoreResult(base);

      var hours = DAY_SLOTS.map(function (slot) {
        var rep = ((slot * 2 + 23) % 24) + 1; // 시진 중간 대표 시각
        var full = M.compute({
          year: cv.y, month: cv.m, day: cv.d, hour: rep, minute: 0,
          gender: gender || 'F', applySolarTime: false
        });
        var hs = scoreResult(full);
        return {
          slot: slot,
          label: SLOT_LABEL[slot],
          score: hs.score,
          repHour: rep,
          hourGanji: full.pillars.hour
        };
      }).sort(function (a, b) { return b.score - a.score; });

      out.push({
        y: cv.y, m: cv.m, d: cv.d, off: off,
        dayPillar: base.pillars.day,
        score: dayScore.score,
        reasons: dayScore.reasons,
        cautions: dayScore.cautions,
        bestHours: hours.slice(0, 2),
        combined: dayScore.score * 2 + hours[0].score
      });
    }
    out.sort(function (a, b) {
      return b.combined - a.combined || Math.abs(a.off) - Math.abs(b.off);
    });
    return out;
  }

  window.Taegil = { scoreResult: scoreResult, scanDates: scanDates, SLOT_LABEL: SLOT_LABEL };
})();
