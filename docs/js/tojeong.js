/* 사주첩 — 토정비결 괘 산출 + 풀이
 * 산출법(민간에 널리 전하는 방식):
 *   상괘 = (당년 세는나이 + 당년 태세수) % 8   (0이면 8)
 *   중괘 = (당년 음력 생월의 날수 29|30 + 그 달 월건수) % 6   (0이면 6)
 *   하괘 = (음력 생일 + 당년 음력 생월·생일의 일진수) % 3   (0이면 3)
 * 수는 선천수: 甲己子午9 乙庚丑未8 丙辛寅申7 丁壬卯酉6 戊癸辰戌5 巳亥4
 * 월건은 민간 방식대로 음력 월 순서(정월=寅)에 연두법을 적용.
 * 풀이 본문은 사주첩이 오늘의 언어로 새로 쓴 것. */
(function () {
  'use strict';

  /* 선천수 — 천간(甲~癸), 지지(子~亥) 순서 인덱스 */
  var STEM_SU = [9, 8, 7, 6, 5, 9, 8, 7, 6, 5];
  var BRANCH_SU = [9, 8, 7, 6, 5, 4, 9, 8, 7, 6, 5, 4];

  function yearStemIdx(y) { return ((y - 4) % 10 + 10) % 10; }
  function yearBranchIdx(y) { return ((y - 4) % 12 + 12) % 12; }

  /* 당년 태세수 */
  function taeseSu(y) {
    return STEM_SU[yearStemIdx(y)] + BRANCH_SU[yearBranchIdx(y)];
  }

  /* 민간 월건 — 음력 m월(1~12): 정월=寅, 연두법으로 천간 */
  var WOL_START = { 0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0 };
  function wolgeon(fy, m) {
    var ys = yearStemIdx(fy);
    return {
      stem: (WOL_START[ys] + (m - 1)) % 10,
      branch: (2 + (m - 1)) % 12
    };
  }
  function wolgeonSu(fy, m) {
    var w = wolgeon(fy, m);
    return STEM_SU[w.stem] + BRANCH_SU[w.branch];
  }

  /* ---------- 괘 산출 ---------- */

  function mod1(n, k) { var r = n % k; return r === 0 ? k : r; }

  /* birth: { sy, sm, sd } 양력 생년월일. fy: 신수를 보는 해 */
  function compute(fy, birth) {
    if (!window.KoreanLunarCalendar) return null;
    var cal = new window.KoreanLunarCalendar();

    /* 1) 양력 생일 → 음력 생일 (윤달생은 본달로) */
    if (!cal.setSolarDate(birth.sy, birth.sm, birth.sd)) return null;
    var lb = cal.getLunarCalendar();
    var ly = lb.year, lm = lb.month, ld = lb.day;
    var leapBorn = !!lb.intercalation;

    /* 2) 세는나이 — 음력 출생년 기준 */
    var age = fy - ly + 1;
    if (age < 1) return null;

    /* 3) 상괘 */
    var tSu = taeseSu(fy);
    var sang = mod1(age + tSu, 8);

    /* 4) 중괘 — 당년 음력 생월의 대소월 날수 + 월건수 */
    var monthDays = cal.setLunarDate(fy, lm, 30, false) ? 30 : 29;
    var wSu = wolgeonSu(fy, lm);
    var jung = mod1(monthDays + wSu, 6);

    /* 5) 하괘 — 당년 음력 (생월, 생일)의 일진수 + 생일 */
    var useDay = ld;
    if (!cal.setLunarDate(fy, lm, useDay, false)) {
      useDay = 29; /* 소월엔 30일생 → 29일로 */
      if (!cal.setLunarDate(fy, lm, useDay, false)) return null;
    }
    var sol = cal.getSolarCalendar();
    var dp = window.Manseryeok.dayPillarOf(sol.year, sol.month, sol.day);
    var iSu = STEM_SU[dp.stem] + BRANCH_SU[dp.branch];
    var ha = mod1(useDay + iSu, 3);

    return {
      fy: fy,
      sang: sang, jung: jung, ha: ha,
      code: sang * 100 + jung * 10 + ha,
      age: age,
      lunarBirth: { y: ly, m: lm, d: ld, leap: leapBorn },
      detail: { taeseSu: tSu, monthDays: monthDays, wolgeonSu: wSu, iljinSu: iSu, iljin: dp }
    };
  }

  /* ---------- 풀이 텍스트 (사주첩 창작) ---------- */

  var SANG = [
    { name: '하늘', han: '天道剛健', gloss: '하늘의 길은 굳세게 나아간다',
      body: '올해의 바탕은 하늘의 상입니다. 스스로 이끌어야 할 일이 많아지고, 책임이 커지는 만큼 이름도 함께 오릅니다. 남에게 기대기보다 내가 결정하고 내가 감당할 때 운이 붙는 해예요.',
      caution: '굳센 해일수록 고집이 화근이 됩니다. 결정은 빠르게 하되, 결정 전에 한 사람의 말은 꼭 들어보세요.' },
    { name: '연못', han: '澤潤萬物', gloss: '연못의 물이 만물을 적신다',
      body: '올해의 바탕은 연못의 상입니다. 말과 관계가 재산이 되는 해 — 소개, 대화, 협상 자리에서 기회가 열립니다. 즐거운 자리에 나가야 운이 도는 흐름이에요.',
      caution: '말로 얻는 해는 말로 잃기도 합니다. 계약과 약속은 문서로 남기고, 가벼운 농담이 무거운 오해가 되지 않게 하세요.' },
    { name: '불', han: '日麗中天', gloss: '해가 중천에 걸려 빛난다',
      body: '올해의 바탕은 불의 상입니다. 재주와 이름이 밖으로 드러나는 해 — 숨어 있던 노력이 조명을 받고, 평가와 시험에 유리합니다. 보여줘야 할 때 주저하지 마세요.',
      caution: '밝게 드러나는 만큼 그림자도 선명합니다. 화려함에 지출이 따르니 씀씀이의 고삐를 쥐고, 남의 시선을 의식한 결정은 피하세요.' },
    { name: '우레', han: '雷動春山', gloss: '봄 산에 우레가 크게 울린다',
      body: '올해의 바탕은 우레의 상입니다. 변화와 이동의 기운이 강해, 자리를 옮기거나 새 판을 벌이기에 좋은 해예요. 멈춰 있으면 오히려 답답해지는 흐름입니다.',
      caution: '움직임이 많은 해는 서두름이 탈입니다. 옮기되 알아보고 옮기고, 벌이되 물러날 길을 정해 두고 벌이세요.' },
    { name: '바람', han: '風行水上', gloss: '바람이 물 위를 부드럽게 지난다',
      body: '올해의 바탕은 바람의 상입니다. 소식과 인연이 바람처럼 스며드는 해 — 멀리서 온 제안, 뜻밖의 연락이 길을 엽니다. 부드럽게 스며드는 쪽이 밀어붙이는 쪽을 이깁니다.',
      caution: '바람은 방향이 자주 바뀝니다. 이야기가 오갈 땐 확답을 기다렸다 움직이고, 소문에 실린 말은 절반만 믿으세요.' },
    { name: '물', han: '水深流靜', gloss: '깊은 물은 고요히 흐른다',
      body: '올해의 바탕은 물의 상입니다. 겉으로 잔잔해도 속으로 깊어지는 해 — 공부, 자격, 실력을 쌓는 일에 가장 좋은 때입니다. 급류를 만나도 깊은 물처럼 침착하면 건너집니다.',
      caution: '험한 여울을 한두 번 지나는 해입니다. 보증·큰 빚·무리한 확장은 피하고, 건강은 미루지 말고 살피세요.' },
    { name: '산', han: '山高不動', gloss: '산은 높이 앉아 움직이지 않는다',
      body: '올해의 바탕은 산의 상입니다. 쌓고 지키는 해 — 크게 벌리기보다 지금 가진 것을 단단히 다질 때 뒤가 든든해집니다. 멈춘 듯 보여도 산 아래에선 뿌리가 자라고 있어요.',
      caution: '지키는 해라고 문을 다 닫으면 인연도 막힙니다. 새 일은 신중하되, 사람은 계속 만나며 다음 해의 씨앗을 놓아두세요.' },
    { name: '땅', han: '厚德載物', gloss: '두터운 땅이 만물을 싣고 기른다',
      body: '올해의 바탕은 땅의 상입니다. 품고 거두는 해 — 그동안 뿌린 것들이 결실로 돌아오고, 가족과 터전에 관한 일이 잘 풀립니다. 서두르지 않아도 때가 되면 익습니다.',
      caution: '거두는 해엔 나눠야 뒤탈이 없습니다. 도움받은 이를 챙기고, 결실을 혼자 쥐려 하면 구설이 따릅니다.' }
  ],
  JUNG = [
    { han: '枯木逢春', short: '마른 나무가 봄을 만나다',
      body: '오래 막혀 있던 일이 풀리기 시작합니다. 포기했던 것, 미뤄 뒀던 것부터 다시 꺼내 보세요.',
      half: '상반기에 얼음이 녹고, 하반기에 새 가지가 자랍니다.' },
    { han: '順水行舟', short: '물길 따라 배가 나아가다',
      body: '큰 파도 없이 순리대로 흘러가는 전개입니다. 흐름을 거스르지만 않으면 힘의 절반으로 두 배를 갑니다.',
      half: '상반기의 속도를 하반기까지 유지하는 것이 관건입니다.' },
    { han: '先困後泰', short: '먼저 굽이치고 뒤에 트이다',
      body: '전반부에 고비가 한 차례 있으나, 그 고비를 넘기면 뒤가 순합니다. 초반의 어려움에 뜻을 꺾지 마세요.',
      half: '상반기는 견디는 때, 하반기는 거두는 때입니다.' },
    { han: '錦上添花', short: '비단 위에 꽃을 더하다',
      body: '잘되어 가는 일에 좋은 소식이 겹치는 전개입니다. 도와주는 사람이 나타나니 혼자 다 하려 하지 마세요.',
      half: '상반기의 기회를 잡으면 하반기에 겹경사가 따릅니다.' },
    { han: '密雲不雨', short: '구름은 짙으나 비는 아직',
      body: '준비는 무르익었는데 결과가 반 박자 늦는 전개입니다. 늦는 것이지 오지 않는 것이 아니니, 때를 기다리며 채비를 마치세요.',
      half: '상반기엔 씨를 뿌리고, 하반기 늦게 비가 내립니다.' },
    { han: '守分安穩', short: '분수를 지켜 평안하다',
      body: '벌리기보다 지킬 때 이로운 전개입니다. 화려하진 않아도 잃는 것 없이 한 해를 건너는 것이 올해의 승리예요.',
      half: '상반기든 하반기든, 무리한 확장만 피하면 내내 잔잔합니다.' }
  ],
  HA = [
    { han: '有終之美', short: '끝맺음이 아름답다',
      body: '맺음이 좋은 해라, 연말에 이르러 웃게 됩니다. 시작한 일은 끝까지 밀고 가세요.' },
    { han: '半吉半實', short: '절반의 결실을 거두다',
      body: '얻는 것과 남는 숙제가 반반인 해입니다. 욕심의 절반만 이뤄도 성공이라 여기면 마음이 넉넉해집니다.' },
    { han: '積小成大', short: '작게 쌓아 크게 이루다',
      body: '눈앞의 성과보다 쌓임이 큰 해입니다. 올해 쌓은 작은 벽돌들이 내년의 집이 됩니다.' }
  ];

  function text(code) {
    var s = Math.floor(code / 100), j = Math.floor(code / 10) % 10, h = code % 10;
    var S = SANG[s - 1], J = JUNG[j - 1], H = HA[h - 1];
    if (!S || !J || !H) return null;
    return {
      code: code,
      han: S.han + ' ' + J.han,
      gloss: S.gloss + ', ' + J.short,
      title: S.name + '의 해 — ' + J.short,
      overview: S.body + ' ' + J.body + ' ' + H.body,
      half: J.half,
      ending: H.short,
      caution: S.caution
    };
  }

  /* ---------- 월별 흐름 — 내 일간 × 당년 12개 월건(민간) 십성 ---------- */

  var MONTH_LINE = {
    '비견': '내 힘이 차오르는 달 — 동료·형제와 함께하면 수월하나, 돈 문제는 각자 계산이 깔끔해요.',
    '겁재': '경쟁의 기운이 도는 달 — 내 몫을 분명히 챙기고, 빌려주는 돈은 없다고 생각하세요.',
    '식신': '먹을 복과 여유가 드는 달 — 만들고 표현하는 일이 잘 풀리고 몸도 마음도 순해집니다.',
    '상관': '재기가 번뜩이는 달 — 아이디어는 빛나되 윗사람과의 말다툼만 조심하면 얻는 게 많아요.',
    '편재': '큰돈이 움직이는 달 — 기회와 지출이 함께 커지니 들어올 곳과 나갈 곳을 미리 정하세요.',
    '정재': '알뜰한 결실의 달 — 꾸준히 한 일에서 또박또박 보상이 들어옵니다. 저축과 계약에 좋아요.',
    '편관': '압박과 시험의 달 — 일이 몰려 버겁지만 여기서 버티면 급이 올라갑니다. 건강을 챙기세요.',
    '정관': '인정과 승진의 달 — 격식을 갖춘 자리, 공적인 일이 유리합니다. 규칙을 지키는 쪽에 서세요.',
    '편인': '생각이 깊어지는 달 — 색다른 공부·기술이 눈에 들어옵니다. 다만 결정은 미루지 말 것.',
    '정인': '문서와 귀인의 달 — 계약·합격·승인 소식에 좋고, 어른의 도움이 힘이 됩니다.'
  };

  function monthly(fy, dayStemIdx) {
    var M = window.Manseryeok;
    var out = [];
    for (var m = 1; m <= 12; m++) {
      var w = wolgeon(fy, m);
      var sip = M.sipseongOf(dayStemIdx, w.stem);
      var g = M.ganjiName(w.stem, w.branch);
      out.push({ m: m, ganji: g, sip: sip, line: MONTH_LINE[sip] || '' });
    }
    return out;
  }

  window.Tojeong = {
    compute: compute,
    text: text,
    monthly: monthly,
    taeseSu: taeseSu,
    wolgeonSu: wolgeonSu,
    _mod1: mod1
  };
})();
