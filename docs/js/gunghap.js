/* ============================================================
 * 사주첩 — 링크 궁합
 * 프로필을 URL 해시에 담아 공유하고(서버 전송 없음),
 * 두 명식의 천간 합충·일지 관계·오행 보완으로 궁합을 푼다.
 * window.Gunghap 으로 노출.
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 프로필 인코딩 (URL 해시용, UTF-8 안전 base64url) ---------- */

  function b64urlEncode(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function b64urlDecode(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function encodeProfile(p) {
    return b64urlEncode(JSON.stringify({
      n: (p.name || '').slice(0, 12),
      y: p.year, m: p.month, d: p.day,
      h: p.unknownTime ? null : p.hour,
      i: p.unknownTime ? null : p.minute,
      u: p.unknownTime ? 1 : 0,
      g: p.gender === 'M' ? 'M' : 'F',
      s: p.applySolarTime === false ? 0 : 1
    }));
  }

  function unpackProfile(o) {
    var y = +o.y, m = +o.m, d = +o.d;
    if (!(y >= 1900 && y <= 2100)) return null;
    if (!(m >= 1 && m <= 12)) return null;
    if (!(d >= 1 && d <= 31)) return null;
    var unknown = o.u === 1;
    var h = unknown ? 12 : +o.h, mi = unknown ? 0 : +o.i;
    if (!unknown && !(h >= 0 && h <= 23 && mi >= 0 && mi <= 59)) return null;
    return {
      name: String(o.n || '').slice(0, 12),
      year: y, month: m, day: d,
      hour: h, minute: mi,
      unknownTime: unknown,
      gender: o.g === 'M' ? 'M' : 'F',
      applySolarTime: o.s !== 0
    };
  }

  function packProfile(p) {
    return {
      n: (p.name || '').slice(0, 12),
      y: p.year, m: p.month, d: p.day,
      h: p.unknownTime ? null : p.hour,
      i: p.unknownTime ? null : p.minute,
      u: p.unknownTime ? 1 : 0,
      g: p.gender === 'M' ? 'M' : 'F',
      s: p.applySolarTime === false ? 0 : 1
    };
  }

  function decodeProfile(str) {
    try {
      return unpackProfile(JSON.parse(b64urlDecode(str)));
    } catch (e) { return null; }
  }

  /* 두 사람 결과 링크: #g=… */
  function encodePair(a, b) {
    return b64urlEncode(JSON.stringify({ a: packProfile(a), b: packProfile(b) }));
  }

  function decodePair(str) {
    try {
      var o = JSON.parse(b64urlDecode(str));
      var a = unpackProfile(o.a), b = unpackProfile(o.b);
      if (!a || !b) return null;
      return { a: a, b: b };
    } catch (e) { return null; }
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- 천간 관계 표 ---------- */

  /* 천간합: 甲己 乙庚 丙辛 丁壬 戊癸 */
  var STEM_HAP = { 0: 5, 5: 0, 1: 6, 6: 1, 2: 7, 7: 2, 3: 8, 8: 3, 4: 9, 9: 4 };
  /* 합화 오행 */
  var HAPHWA = { '05': '토', '16': '금', '27': '수', '38': '목', '49': '화' };
  /* 천간충: 甲庚 乙辛 丙壬 丁癸 */
  var STEM_CHUNG = { 0: 6, 6: 0, 1: 7, 7: 1, 2: 8, 8: 2, 3: 9, 9: 3 };

  var GEN_METAPHOR = {
    '목화': '나무가 불을 지피듯', '화토': '불이 흙을 데우듯', '토금': '흙이 쇠를 품듯',
    '금수': '바위틈에서 샘이 솟듯', '수목': '비가 나무를 키우듯'
  };
  var GEUK_METAPHOR = {
    '목토': '나무 뿌리가 흙을 파고들듯', '토수': '둑이 물길을 잡듯', '수화': '물이 불을 다스리듯',
    '화금': '불이 쇠를 벼리듯', '금목': '도끼가 나무를 다듬듯'
  };

  /* 상대가 나에게 드는 십성 → 한 줄 */
  var SIPSEONG_PERSON = {
    '비견': '나와 어깨를 나란히 하는 동료 같은 사람',
    '겁재': '승부욕을 깨워주는 라이벌 같은 사람',
    '식신': '내 재주를 꺼내주는 사람',
    '상관': '나를 표현하게 만드는 사람',
    '편재': '내 세상을 넓혀주는 사람',
    '정재': '일상을 단단하게 해주는 사람',
    '편관': '나를 긴장시켜 성장시키는 사람',
    '정관': '나를 반듯하게 세워주는 사람',
    '편인': '남다른 영감을 주는 사람',
    '정인': '기댈 언덕이 되어주는 사람'
  };

  var BRANCH_TEXT = {
    '육합': { title: '일지가 합(合)', body: '일상 리듬과 속정이 잘 붙는 사이입니다. 오래 같이 있어도 편안하고, 말하지 않아도 통하는 구석이 있어요.', delta: 14 },
    '삼합': { title: '일지가 삼합(三合)', body: '함께 무언가를 벌일 때 시너지가 나는 사이입니다. 같은 목표가 생기면 빠르게 가까워져요.', delta: 10 },
    '동일': { title: '일지가 같음', body: '닮은 생활 습관, 닮은 속마음 — 거울을 보는 듯한 사이입니다. 편안하지만 서로의 단점도 닮았을 수 있어요.', delta: 4 },
    '충': { title: '일지가 충(沖)', body: '생활 패턴과 속마음이 자주 엇갈릴 수 있는 사이입니다. 각자의 시간과 공간을 존중하는 것이 오래 가는 비결이에요.', delta: -14 }
  };

  var EL_HAN = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };

  var TIERS = [
    { min: 90, label: '하늘이 이어준 짝' },
    { min: 78, label: '합이 빼어난 사이' },
    { min: 64, label: '합이 좋은 사이' },
    { min: 50, label: '맞춰갈수록 좋은 사이' },
    { min: 38, label: '노력이 빛나는 사이' },
    { min: 0, label: '서로를 배우게 하는 사이' }
  ];

  /* ---------- 궁합 계산 ----------
   * a, b: Manseryeok.compute 결과. nameA/nameB: 표시 이름(이미 이스케이프 전 원문).
   * 반환 텍스트는 이름을 escapeHtml 처리해 innerHTML에 바로 넣을 수 있게 한다. */
  function compute(a, b, nameA, nameB) {
    var M = window.Manseryeok;
    var sa = a.pillars.day.stem, sb = b.pillars.day.stem;
    var stA = M.STEMS[sa], stB = M.STEMS[sb];
    var nA = escapeHtml(nameA || '상대'), nB = escapeHtml(nameB || '나');
    var score = 50;

    /* 1. 일간 천간 관계 */
    var stemRel;
    if (STEM_HAP[sa] === sb) {
      var hwa = HAPHWA[[Math.min(sa, sb), Math.max(sa, sb)].join('')];
      score += 18;
      stemRel = {
        type: 'hap',
        title: '천간의 합(合) — 서로에게 끌리는 조합',
        body: stA.kor + stA.el + '와 ' + stB.kor + stB.el + '는 열 개의 천간 중 서로 맞물리는 단 하나의 짝입니다. 두 기운이 만나 ' +
          hwa + '(' + EL_HAN[hwa] + ')의 기운으로 화(化)해, 함께 있을 때 없던 힘이 생겨요.'
      };
    } else if (STEM_CHUNG[sa] === sb) {
      score -= 12;
      stemRel = {
        type: 'chung',
        title: '천간의 충(沖) — 강하게 부딪히는 조합',
        body: stA.kor + stA.el + '와 ' + stB.kor + stB.el + '는 정면으로 마주 서는 기운입니다. 밀어내는 만큼 서로를 성장시키는 자극이 되기도 해요. 거리와 예의가 이 관계의 기술입니다.'
      };
    } else if (stA.el === stB.el) {
      score += 4;
      stemRel = {
        type: 'bihwa',
        title: '비화(比和) — 같은 기운의 만남',
        body: '같은 ' + stA.el + ' 기운끼리 만났습니다. 서로를 가장 잘 알아보는 동료 같은 사이 — 편안하고 빠르게 가까워지지만, 양보가 없으면 부딪히기도 해요.'
      };
    } else if (window.Manseryeok.elCycle.gen[stA.el] === stB.el) {
      score += 10;
      stemRel = {
        type: 'saeng',
        title: '상생(相生) — ' + GEN_METAPHOR[stA.el + stB.el],
        body: nA + '의 ' + stA.el + ' 기운이 ' + nB + '의 ' + stB.el + ' 기운을 살립니다. 한쪽이 든든히 밀어주는, 주고받음이 분명한 관계예요. 받는 쪽의 고마움 표현이 관계의 연료가 됩니다.'
      };
    } else if (window.Manseryeok.elCycle.gen[stB.el] === stA.el) {
      score += 10;
      stemRel = {
        type: 'saeng',
        title: '상생(相生) — ' + GEN_METAPHOR[stB.el + stA.el],
        body: nB + '의 ' + stB.el + ' 기운이 ' + nA + '의 ' + stA.el + ' 기운을 살립니다. 한쪽이 든든히 밀어주는, 주고받음이 분명한 관계예요. 받는 쪽의 고마움 표현이 관계의 연료가 됩니다.'
      };
    } else if (window.Manseryeok.elCycle.control[stA.el] === stB.el) {
      score -= 6;
      stemRel = {
        type: 'geuk',
        title: '상극(相剋) — ' + GEUK_METAPHOR[stA.el + stB.el],
        body: nA + '의 ' + stA.el + ' 기운이 ' + nB + '의 ' + stB.el + ' 기운을 다듬습니다. 불편한 순간도 있지만, 잘 쓰면 서로를 단련시키는 관계입니다.'
      };
    } else {
      score -= 6;
      stemRel = {
        type: 'geuk',
        title: '상극(相剋) — ' + GEUK_METAPHOR[stB.el + stA.el],
        body: nB + '의 ' + stB.el + ' 기운이 ' + nA + '의 ' + stA.el + ' 기운을 다듬습니다. 불편한 순간도 있지만, 잘 쓰면 서로를 단련시키는 관계입니다.'
      };
    }

    /* 2. 서로에게 드는 십성 */
    var sipAB = M.sipseongOf(sb, sa); // A는 B(나)에게
    var sipBA = M.sipseongOf(sa, sb); // B는 A에게
    var sipseong = {
      aboutA: { name: sipAB, line: SIPSEONG_PERSON[sipAB] },
      aboutB: { name: sipBA, line: SIPSEONG_PERSON[sipBA] }
    };

    /* 3. 일지 관계 */
    var bRel = M.branchRelation(a.pillars.day.branch, b.pillars.day.branch);
    var branchRel;
    if (bRel && BRANCH_TEXT[bRel]) {
      score += BRANCH_TEXT[bRel].delta;
      branchRel = { type: bRel, title: BRANCH_TEXT[bRel].title, body: BRANCH_TEXT[bRel].body };
    } else {
      branchRel = { type: null, title: '일지는 담백한 사이', body: '일상에서 크게 부딪히지도, 유난히 끈적이지도 않는 무난한 흐름입니다. 다른 관계 요소가 궁합의 색을 결정해요.' };
    }

    /* 4. 오행 보완 */
    var complement = [];
    ['목', '화', '토', '금', '수'].forEach(function (el) {
      if (a.elements[el] === 0 && b.elements[el] >= 2) {
        complement.push(nB + '의 넉넉한 ' + el + '(' + EL_HAN[el] + ') 기운이 ' + nA + '의 빈 곳을 채워줍니다.');
      }
      if (b.elements[el] === 0 && a.elements[el] >= 2) {
        complement.push(nA + '의 넉넉한 ' + el + '(' + EL_HAN[el] + ') 기운이 ' + nB + '의 빈 곳을 채워줍니다.');
      }
    });
    score += Math.min(complement.length, 2) * 5;

    /* 5. 음양 조화 */
    var yinyang = stA.yang !== stB.yang;
    if (yinyang) score += 4;

    score = Math.max(30, Math.min(99, Math.round(score)));
    var tier = TIERS.filter(function (t) { return score >= t.min; })[0].label;

    return {
      score: score,
      tier: tier,
      stemRel: stemRel,
      sipseong: sipseong,
      branchRel: branchRel,
      complement: complement,
      yinyang: yinyang
    };
  }

  window.Gunghap = {
    encodeProfile: encodeProfile,
    decodeProfile: decodeProfile,
    encodePair: encodePair,
    decodePair: decodePair,
    escapeHtml: escapeHtml,
    compute: compute
  };
})();
