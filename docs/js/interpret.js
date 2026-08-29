/* ============================================================
 * 사주서재 — 풀이 콘텐츠 (규칙 기반)
 * Manseryeok 계산 결과를 받아 한국어 풀이 텍스트를 생성한다.
 * window.Interpret 으로 노출.
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 일간 10종 풀이 ---------- */
  var ILGAN = {
    '甲': {
      title: '곧게 자라는 큰 나무, 갑목(甲木)',
      body: '갑목은 하늘을 향해 곧게 자라는 큰 나무입니다. 시작하는 힘과 추진력이 강하고, 굽히기보다 정면으로 뻗어 나가는 기질이 있습니다. 다만 한 번 방향을 정하면 잘 바꾸지 않아, 유연함이 더해질 때 크게 자랍니다.'
    },
    '乙': {
      title: '바람에 휘어도 꺾이지 않는 을목(乙木)',
      body: '을목은 담쟁이와 화초처럼 부드럽게 뻗는 나무입니다. 환경에 맞춰 유연하게 적응하고, 관계 속에서 길을 찾는 생존력이 뛰어납니다. 부드러워 보여도 뿌리는 끈질겨서, 조용히 목표를 이루는 유형입니다.'
    },
    '丙': {
      title: '한낮의 태양, 병화(丙火)',
      body: '병화는 하늘 한가운데 뜬 태양의 불입니다. 표현이 분명하고 숨김이 없으며, 주변을 밝히고 사람을 모으는 힘이 있습니다. 열정이 빠르게 타오르는 만큼, 완급을 조절할 때 그 빛이 오래갑니다.'
    },
    '丁': {
      title: '어둠을 밝히는 등불, 정화(丁火)',
      body: '정화는 촛불과 화롯불처럼 가까운 곳을 데우는 불입니다. 섬세하게 살피고 집중하는 힘이 강해, 한 분야를 깊게 파고드는 데 어울립니다. 겉은 온화하지만 속의 열기는 병화 못지않게 뜨겁습니다.'
    },
    '戊': {
      title: '흔들리지 않는 큰 산, 무토(戊土)',
      body: '무토는 너른 산과 대지의 흙입니다. 쉽게 동요하지 않는 중심이 있고, 사람과 일을 품어 안는 그릇이 큽니다. 묵직한 신뢰를 주는 대신 변화에는 느린 편이라, 때로는 먼저 움직이는 연습이 필요합니다.'
    },
    '己': {
      title: '곡식을 기르는 기름진 밭, 기토(己土)',
      body: '기토는 씨앗을 받아 곡식을 길러내는 밭의 흙입니다. 실속 있게 가꾸고 돌보는 힘이 있어, 곁에 있는 사람을 성장시키는 유형입니다. 겉으로 드러내지 않아도 속으로는 계산이 정교합니다.'
    },
    '庚': {
      title: '벼려진 무쇠, 경금(庚金)',
      body: '경금은 바위와 무쇠처럼 단단한 금입니다. 결단이 빠르고 원칙이 분명하며, 한 번 맡은 일은 끝을 보는 기질입니다. 강한 만큼 부딪힘도 있지만, 다듬어질수록 명검이 되는 사주입니다.'
    },
    '辛': {
      title: '다듬어진 보석, 신금(辛金)',
      body: '신금은 세공을 마친 보석과 금붙이입니다. 예리한 안목과 섬세한 완성도를 추구하고, 자존심이 곧 동력이 됩니다. 날카로움을 품격으로 쓰는 법을 익히면 어디서든 빛이 납니다.'
    },
    '壬': {
      title: '쉼 없이 흐르는 큰 강, 임수(壬水)',
      body: '임수는 바다와 큰 강의 물입니다. 시야가 넓고 발상이 자유로워, 고인 자리보다 흐르는 자리에서 힘을 냅니다. 품는 양이 큰 만큼 방향을 정해줄 둑이 있을 때 그 흐름이 위대해집니다.'
    },
    '癸': {
      title: '스며드는 봄비, 계수(癸水)',
      body: '계수는 땅속으로 스며드는 이슬비와 샘물입니다. 조용히 관찰하고 깊게 공감하는 힘이 있어, 드러나지 않게 판을 움직이는 유형입니다. 부드럽지만 바위를 뚫는 것은 결국 낙숫물입니다.'
    }
  };

  /* ---------- 오행 코멘트 ---------- */
  var EL_MEANING = {
    '목': '성장과 시작', '화': '표현과 열정', '토': '중심과 신용',
    '금': '결단과 마무리', '수': '지혜와 유연함'
  };

  var EL_MISSING = {
    '목': '새로 시작하고 뻗어 나가는 목(木)의 기운이 비어 있습니다. 계획을 세우고 배움을 이어가는 습관이 이 빈자리를 채워줍니다.',
    '화': '드러내고 표현하는 화(火)의 기운이 비어 있습니다. 감정과 성과를 밖으로 꺼내 보이는 연습이 균형에 도움이 됩니다.',
    '토': '믿음과 중심을 뜻하는 토(土)의 기운이 비어 있습니다. 일상의 루틴과 꾸준한 약속 지키기가 이 빈자리를 채워줍니다.',
    '금': '맺고 끊는 금(金)의 기운이 비어 있습니다. 마무리를 짓고 정리하는 습관이 균형에 도움이 됩니다.',
    '수': '쉬어가며 채우는 수(水)의 기운이 비어 있습니다. 충분한 휴식과 깊은 공부가 이 빈자리를 채워줍니다.'
  };

  var EL_EXCESS = {
    '목': '목(木)이 유난히 강해 일을 벌이는 힘은 크지만, 거두는 힘이 따라오지 못할 수 있습니다.',
    '화': '화(火)가 유난히 강해 열정이 넘치는 만큼, 완급 조절이 평생의 과제가 됩니다.',
    '토': '토(土)가 유난히 강해 신중하고 묵직하지만, 변화 앞에서 무거워지기 쉽습니다.',
    '금': '금(金)이 유난히 강해 결단은 빠르지만, 날이 서기 쉬워 부드러움이 보약입니다.',
    '수': '수(水)가 유난히 강해 생각이 깊지만, 생각이 길어져 때를 놓치지 않는 것이 관건입니다.'
  };

  /* ---------- 십성 카테고리 ---------- */
  var SIPSEONG_GROUP = {
    '비견': '비겁', '겁재': '비겁',
    '식신': '식상', '상관': '식상',
    '편재': '재성', '정재': '재성',
    '편관': '관성', '정관': '관성',
    '편인': '인성', '정인': '인성'
  };

  var GROUP_TEXT = {
    '비겁': {
      title: '주체성이 단단한 독립가형',
      body: '나를 지키는 힘인 비겁(比劫)이 두드러집니다. 남에게 기대기보다 스스로 서는 것을 편안해하고, 경쟁 속에서 오히려 힘이 나는 구조입니다. 내 편을 만드는 협업의 기술이 더해지면 크게 이룹니다.'
    },
    '식상': {
      title: '표현이 흐르는 창작자형',
      body: '만들어 내보이는 힘인 식상(食傷)이 두드러집니다. 말과 글, 손끝의 재주로 자신을 증명하는 구조라, 담아두기보다 꺼내놓을 때 운이 트입니다. 표현이 곧 밥이 되고 이름이 되는 사주입니다.'
    },
    '재성': {
      title: '현실 감각이 밝은 실리형',
      body: '기회와 결과를 붙잡는 힘인 재성(財星)이 두드러집니다. 흐름을 읽고 실속을 챙기는 눈이 밝아, 움직인 만큼 손에 쥐는 구조입니다. 관리와 저축의 습관이 더해지면 재물이 머뭅니다.'
    },
    '관성': {
      title: '질서를 세우는 관리자형',
      body: '나를 다듬는 힘인 관성(官星)이 두드러집니다. 책임과 명예를 무겁게 여기고, 조직과 제도 안에서 인정받는 구조입니다. 스스로에게 엄격한 만큼, 이룬 자리가 오래갑니다.'
    },
    '인성': {
      title: '받아들이는 힘이 큰 학자형',
      body: '배우고 받아들이는 힘인 인성(印星)이 두드러집니다. 지식을 쌓아 자격과 명예로 잇는 흐름이 강하고, 문서와 공부에서 귀인을 만나는 구조입니다. 아는 것을 나눌 때 운이 커집니다.'
    }
  };

  /* ---------- 대운 십성별 풀이 ---------- */
  var DAEUN_TEXT = {
    '비견': { title: '나를 세우는 10년', body: '주체성이 강해지는 시기입니다. 독립, 창업, 내 이름을 거는 일에 힘이 실리지만, 동업과 분배는 신중해야 합니다.' },
    '겁재': { title: '승부가 걸리는 10년', body: '경쟁심과 추진력이 커지는 시기입니다. 과감한 도전에 유리하지만, 금전 관리와 동업 문제는 돌다리를 두드려야 합니다.' },
    '식신': { title: '재주가 밥이 되는 10년', body: '만들고 표현하는 힘이 커지는 시기입니다. 실력을 쌓아 결과물로 보여주기 좋고, 의식주가 안정되는 흐름입니다.' },
    '상관': { title: '재능이 드러나는 10년', body: '말과 재능이 밖으로 드러나는 시기입니다. 창작, 강의, 콘텐츠처럼 표현하는 일에 운이 실리지만, 말로 인한 구설은 조심해야 합니다.' },
    '편재': { title: '판이 커지는 10년', body: '활동 반경과 기회가 넓어지는 시기입니다. 사업과 투자에 흐름이 생기지만, 들어오는 만큼 나가기도 쉬워 관리가 관건입니다.' },
    '정재': { title: '차곡차곡 쌓이는 10년', body: '성실함이 결실로 돌아오는 시기입니다. 안정적인 수입과 재산 형성에 유리하고, 꾸준함이 최고의 전략이 됩니다.' },
    '편관': { title: '단련되는 10년', body: '책임과 부담이 커지는 대신 단단해지는 시기입니다. 압박을 이겨내면 권한과 자리가 따라오는 흐름입니다.' },
    '정관': { title: '이름이 서는 10년', body: '명예와 지위가 자라는 시기입니다. 조직에서 인정받고 자리가 올라가는 흐름이라, 원칙을 지키는 것이 곧 전략입니다.' },
    '편인': { title: '깊어지는 10년', body: '남다른 공부와 통찰이 깊어지는 시기입니다. 전문 분야를 파고들기 좋지만, 생각이 많아져 실행이 늦어지지 않게 균형이 필요합니다.' },
    '정인': { title: '배움이 힘이 되는 10년', body: '공부, 자격, 문서에 운이 실리는 시기입니다. 배운 것이 명예와 안정으로 이어지고, 어른과 귀인의 도움을 받는 흐름입니다.' }
  };

  /* ---------- 신강약 ---------- */
  var STRENGTH_TEXT = {
    '신강': '일간의 뿌리가 튼튼한 신강(身強)한 사주입니다. 스스로 끌고 가는 힘이 좋아, 기운을 덜어내 쓰는 일 — 표현하고, 벌고, 책임지는 일 — 에서 오히려 빛이 납니다.',
    '중화': '기운이 한쪽으로 치우치지 않은 중화(中和)에 가까운 사주입니다. 균형이 좋은 만큼 환경 변화에 유연하게 대응할 수 있습니다.',
    '신약': '일간을 돕는 기운이 적은 신약(身弱)한 사주입니다. 혼자 버티기보다 배움과 사람의 도움을 받을 때 힘이 나는 구조로, 기댈 언덕을 만드는 것이 전략입니다.'
  };

  /* ---------- 생성 함수 ---------- */

  function ilganText(dayStemHan) {
    return ILGAN[dayStemHan];
  }

  function elementComment(result) {
    var els = result.elements;
    var missing = [], excess = [];
    Object.keys(els).forEach(function (el) {
      if (els[el] === 0) missing.push(el);
      if (els[el] >= 3) excess.push(el);
    });
    var parts = [];
    missing.forEach(function (el) { parts.push(EL_MISSING[el]); });
    if (missing.length === 0) {
      excess.forEach(function (el) { parts.push(EL_EXCESS[el]); });
    }
    if (parts.length === 0) {
      parts.push('다섯 기운이 고르게 퍼져 있는 균형 잡힌 명식입니다. 치우침이 적은 만큼 어떤 환경에서도 무난하게 적응합니다.');
    }
    return parts.join(' ');
  }

  function elementHeadline(result) {
    var els = result.elements;
    var sorted = Object.keys(els).sort(function (a, b) { return els[b] - els[a]; });
    var top = sorted[0], second = sorted[1];
    var seasonName = result.season ? result.season.name : '';
    var HAN = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };
    if (els[top] >= 3 && els[second] >= 3) {
      return HAN[top] + '·' + HAN[second] + '가 왕성한 ' + seasonName + '의 명식';
    }
    if (els[top] >= 3) {
      return HAN[top] + ' 기운이 왕성한 ' + seasonName + '의 명식';
    }
    return '기운이 고른 ' + seasonName + '의 명식';
  }

  function sipseongSummary(result) {
    var counts = result.sipseongCounts;
    var groups = { '비겁': 0, '식상': 0, '재성': 0, '관성': 0, '인성': 0 };
    Object.keys(counts).forEach(function (s) {
      groups[SIPSEONG_GROUP[s]] += counts[s];
    });
    var dominant = Object.keys(groups).sort(function (a, b) { return groups[b] - groups[a]; })[0];
    return {
      dominant: dominant,
      title: GROUP_TEXT[dominant].title,
      body: GROUP_TEXT[dominant].body,
      pills: Object.keys(counts).map(function (s) { return { name: s, count: counts[s] }; })
    };
  }

  function daeunText(sipseong) {
    return DAEUN_TEXT[sipseong] || { title: '흐름이 바뀌는 10년', body: '' };
  }

  function strengthText(label) {
    return STRENGTH_TEXT[label];
  }

  /* 대운 곡선 점수 (참고 지수): 신강이면 덜어내는 운(식상·재성·관성)을 높게,
     신약이면 채워주는 운(인성·비겁)을 높게 평가 */
  function daeunScores(result) {
    var strong = result.strength.label === '신강';
    var favGroups = strong ? { '식상': 1, '재성': 1, '관성': 1 } : { '인성': 1, '비겁': 1 };
    var M = window.Manseryeok;
    var meStem = result.pillars.day.stem;
    return result.daeun.list.map(function (dw) {
      var stemS = M.sipseongOf(meStem, dw.stem);
      var branchS = M.branchSipseong(meStem, dw.branch);
      var score = 52;
      score += favGroups[SIPSEONG_GROUP[stemS]] ? 16 : -10;
      score += favGroups[SIPSEONG_GROUP[branchS]] ? 22 : -14;
      // 중화 사주는 진폭을 줄인다
      if (result.strength.label === '중화') score = 52 + (score - 52) * 0.5;
      return Math.max(18, Math.min(92, score));
    });
  }

  /* ---------- 오늘의 운세 ---------- */

  /* 오늘 천간 십성별 테마 (제목 + 총운) */
  var TODAY_THEME = {
    '비견': { title: '내 걸음대로 가는 날', body: '오늘은 남의 속도가 아니라 내 속도가 정답입니다. 비교하지 않고 내 일에 집중할수록 마음도 성과도 단단해져요.' },
    '겁재': { title: '승부욕이 깨어나는 날', body: '경쟁의 기운이 도는 날입니다. 추진력은 최고조지만, 돈과 물건을 빌리고 빌려주는 일은 오늘만큼은 미루는 게 좋아요.' },
    '식신': { title: '손끝이 즐거운 날', body: '만들고, 요리하고, 쓰고, 가꾸는 일이 잘 풀리는 날입니다. 몸을 움직여 무언가를 만들어내면 기분까지 넉넉해져요.' },
    '상관': { title: '말문이 트이는 날', body: '표현력이 살아나는 날입니다. 발표와 제안, 콘텐츠 올리기에 좋지만, 날카로운 말 한마디가 구설이 될 수 있으니 마지막 문장만 부드럽게 다듬으세요.' },
    '편재': { title: '기회가 스치는 날', body: '뜻밖의 제안과 기회가 오가는 날입니다. 움직인 만큼 눈에 들어오는 것이 많아지니, 약속과 외출을 마다하지 마세요. 다만 즉흥 지출은 한 템포 쉬고요.' },
    '정재': { title: '차곡차곡 쌓는 날', body: '성실함이 그대로 결과가 되는 날입니다. 밀린 정리와 꼼꼼한 마무리에 좋고, 오늘 아낀 돈은 유난히 오래 남습니다.' },
    '편관': { title: '긴장이 나를 세우는 날', body: '부담스러운 일이 앞에 놓이지만, 그 긴장이 오히려 집중력을 끌어올립니다. 미루던 어려운 일을 오늘 정면으로 처리하면 홀가분해져요.' },
    '정관': { title: '반듯함이 통하는 날', body: '원칙과 예의가 빛을 보는 날입니다. 공적인 자리, 면접, 결재처럼 격식이 필요한 일에 유리하고, 반듯한 태도가 그대로 점수가 됩니다.' },
    '편인': { title: '감이 예리해지는 날', body: '직감과 통찰이 날카로워지는 날입니다. 혼자 파고드는 공부와 기획에 좋지만, 생각이 많아져 끼니를 거르기 쉬우니 챙겨 드세요.' },
    '정인': { title: '배움이 힘이 되는 날', body: '배우고 묻고 정리하기 좋은 날입니다. 어른이나 선배의 조언에 답이 있고, 문서와 계약 관련 소식이 반갑게 들어옵니다.' }
  };

  /* 오늘 천간 십성 그룹별 카테고리 한 줄 */
  var TODAY_CATEGORY = {
    '비겁': {
      money: '지갑이 쉽게 열리는 날이에요. 계획에 없던 지출만 조심하면 무난합니다.',
      people: '친구와 동료가 힘이 되는 날 — 같이 밥 먹자는 연락을 먼저 해보세요.',
      work: '협업보다 내 몫에 집중할 때 능률이 오르는 날입니다.'
    },
    '식상': {
      money: '재주와 아이디어가 돈으로 이어지는 날입니다. 만든 것을 세상에 보여주세요.',
      people: '말이 매력이 되는 날 — 마음에 있던 이야기를 꺼내기 좋아요.',
      work: '기획서, 발표, 창작처럼 만들어 내보이는 일에 운이 실립니다.'
    },
    '재성': {
      money: '재물 흐름이 밝은 날입니다. 협상, 거래, 가격 비교 모두 유리해요.',
      people: '실속 있는 인연이 오가는 날 — 소개와 모임을 반기세요.',
      work: '성과가 숫자로 보이는 날입니다. 결과 정리와 보고에 좋아요.'
    },
    '관성': {
      money: '나가는 돈이 생기기 쉬운 날 — 큰 결제는 내역을 두 번 확인하세요.',
      people: '윗사람과 공적인 자리에서 점수를 얻는 날입니다.',
      work: '책임이 주어지는 날 — 원칙대로 처리하면 그대로 인정이 됩니다.'
    },
    '인성': {
      money: '문서와 계약에 좋은 날입니다. 서두르지 말고 꼼꼼히 읽어보세요.',
      people: '조언을 구하면 귀인이 나타나는 날 — 묻는 것이 지름길이에요.',
      work: '배우고 정리하고 계획 세우기 좋은 날입니다.'
    }
  };

  var TODAY_RELATION = {
    '육합': { text: '오늘의 지지가 내 일지와 합(合)을 이룹니다. 인연과 협력이 부드럽게 이어지는 날이라, 만남과 부탁 모두 순조로워요.', delta: 12 },
    '삼합': { text: '오늘의 지지가 내 일지와 삼합(三合)의 기운으로 통합니다. 여럿이 함께하는 일에서 시너지가 나는 날이에요.', delta: 10 },
    '충': { text: '오늘의 지지가 내 일지와 충(沖)을 이룹니다. 계획이 흔들리고 마음이 급해지기 쉬운 날 — 중요한 결정과 서명은 하루 미루는 것도 지혜예요.', delta: -16 },
    '동일': { text: '오늘은 내 일지와 같은 글자가 드는 날입니다. 익숙한 리듬이 반복되는 날이니, 무리한 변화보다 다지는 데 쓰세요.', delta: 0 }
  };

  var WEATHER = [
    { min: 80, label: '쾌청', line: '흐름이 활짝 열린 날' },
    { min: 65, label: '맑음', line: '가볍게 나아가기 좋은 날' },
    { min: 50, label: '구름 조금', line: '평온하게 흘러가는 날' },
    { min: 35, label: '흐림', line: '천천히, 신중하게 가는 날' },
    { min: 0,  label: '소나기 뒤 갬', line: '한 템포 쉬어 가라는 날' }
  ];

  var LUCKY_COLOR = { '목': '초록', '화': '붉은색', '토': '노랑·베이지', '금': '흰색·은색', '수': '검정·파랑' };
  var LUCKY_DIR = { '목': '동쪽', '화': '남쪽', '토': '가운데(집·근거지)', '금': '서쪽', '수': '북쪽' };

  /**
   * result: Manseryeok.compute 결과
   * info: Manseryeok.todayInfo 결과
   * dayIdx60: 오늘 일진의 60갑자 인덱스 (행운 요소 결정에 사용)
   */
  function favGroupsOf(result) {
    var strong = result.strength.label;
    if (strong === '신강') return { '식상': 1, '재성': 1, '관성': 1 };
    if (strong === '신약') return { '인성': 1, '비겁': 1 };
    return { '식상': 1, '재성': 1, '관성': 1, '인성': 1 };
  }

  /* 하루 점수 (오늘의 운세·캘린더 공용) */
  function scoreDay(result, info) {
    var favGroups = favGroupsOf(result);
    var score = 55;
    score += favGroups[SIPSEONG_GROUP[info.stemSipseong]] ? 14 : -8;
    score += favGroups[SIPSEONG_GROUP[info.branchSipseong]] ? 10 : -6;
    var rel = info.relation ? TODAY_RELATION[info.relation] : null;
    if (rel) score += rel.delta;
    return Math.max(20, Math.min(96, score));
  }

  function todayFortune(result, info, dayIdx60) {
    var strong = result.strength.label;
    var stemGroup = SIPSEONG_GROUP[info.stemSipseong];
    var score = scoreDay(result, info);
    var rel = info.relation ? TODAY_RELATION[info.relation] : null;
    var weather = WEATHER.filter(function (w) { return score >= w.min; })[0];

    /* 행운의 오행: 내게 필요한 기운 중 오늘 날짜로 결정 (매일 달라짐) */
    var cyc = window.Manseryeok.elCycle;
    var meEl = window.Manseryeok.STEMS[result.pillars.day.stem].el;
    var need;
    if (strong === '신약') {
      var inEl = Object.keys(cyc.gen).filter(function (e) { return cyc.gen[e] === meEl; })[0];
      need = [inEl, meEl];
    } else {
      var gwanEl = Object.keys(cyc.control).filter(function (e) { return cyc.control[e] === meEl; })[0];
      need = [cyc.gen[meEl], cyc.control[meEl], gwanEl];
    }
    var luckyEl = need[dayIdx60 % need.length];

    return {
      score: score,
      weather: weather.label,
      weatherLine: weather.line,
      theme: TODAY_THEME[info.stemSipseong],
      relationText: rel ? rel.text : null,
      category: TODAY_CATEGORY[stemGroup],
      lucky: {
        el: luckyEl,
        color: LUCKY_COLOR[luckyEl],
        dir: LUCKY_DIR[luckyEl],
        number: (dayIdx60 % 9) + 1
      }
    };
  }

  /* ---------- 목적별 택일 ---------- */

  var PURPOSES = [
    { key: 'docs', label: '계약 · 문서', hint: '계약서 서명, 등기, 시험 접수, 제출' },
    { key: 'start', label: '새 시작', hint: '오픈, 첫 출근, 프로젝트 시작' },
    { key: 'move', label: '이사 · 입주', hint: '이사, 입주, 잔금 치르기 — 손없는날과 내 길일을 함께 봐요' },
    { key: 'money', label: '거래 · 재물', hint: '큰 구매, 판매, 협상, 투자 결정' },
    { key: 'meet', label: '만남 · 고백', hint: '소개팅, 고백, 상견례, 중요한 모임' }
  ];

  /* 해당 목적에 좋은 날이면 {bonus, reason}, 아니면 null. 충이 드는 날은 모든 목적에서 제외 */
  function purposeMatch(key, info) {
    if (info.relation === '충') return null;
    var sg = SIPSEONG_GROUP[info.stemSipseong];
    var bg = SIPSEONG_GROUP[info.branchSipseong];
    var has = function (g) { return sg === g || bg === g; };
    if (key === 'docs') {
      if (has('인성')) return { bonus: 20, reason: '문서와 계약의 별인 인성(' + (sg === '인성' ? info.stemSipseong : info.branchSipseong) + ')이 드는 날' };
      if (info.stemSipseong === '정관') return { bonus: 10, reason: '격식과 승인이 통하는 정관의 날' };
      return null;
    }
    if (key === 'start') {
      if (has('식상')) return { bonus: 16, reason: '만들고 벌이는 힘, 식상(' + (sg === '식상' ? info.stemSipseong : info.branchSipseong) + ')이 드는 날' };
      return null;
    }
    if (key === 'money') {
      if (sg === '비겁' || bg === '비겁') return null; // 탈재 기운
      if (has('재성')) return { bonus: 20, reason: '재물 흐름이 밝은 재성(' + (sg === '재성' ? info.stemSipseong : info.branchSipseong) + ')의 날' };
      return null;
    }
    if (key === 'move') {
      if (has('인성')) return { bonus: 14, reason: '터와 문서를 지켜주는 인성(' + (sg === '인성' ? info.stemSipseong : info.branchSipseong) + ')이 드는 날' };
      if (info.stemSipseong === '정재') return { bonus: 8, reason: '살림의 터를 단단히 하는 정재의 날' };
      return null;
    }
    if (key === 'meet') {
      if (info.relation === '육합') return { bonus: 18, reason: '내 일지와 합(合)이 들어 인연이 부드럽게 이어지는 날' };
      if (info.relation === '삼합') return { bonus: 12, reason: '삼합의 기운으로 여럿이 모이는 자리에 좋은 날' };
      if (has('식상')) return { bonus: 8, reason: '표현력이 살아나 마음을 전하기 좋은 날' };
      return null;
    }
    return null;
  }

  /* ---------- 시간대별 흐름 (오늘의 12시진) ---------- */

  var HOUR_SHORT = ['23~01시', '01~03시', '03~05시', '05~07시', '07~09시', '09~11시',
                    '11~13시', '13~15시', '15~17시', '17~19시', '19~21시', '21~23시'];

  function hourFlow(result, dayStemIdx) {
    var M = window.Manseryeok;
    var meStem = result.pillars.day.stem;
    var meBranch = result.pillars.day.branch;
    var favGroups = favGroupsOf(result);
    var slots = [];
    for (var s = 0; s < 12; s++) {
      var stem = M.hourStemOf(dayStemIdx, s);
      var stemS = M.sipseongOf(meStem, stem);
      var branchS = M.branchSipseong(meStem, s);
      var rel = M.branchRelation(s, meBranch);
      var score = 50;
      score += favGroups[SIPSEONG_GROUP[stemS]] ? 12 : -8;
      score += favGroups[SIPSEONG_GROUP[branchS]] ? 9 : -6;
      if (rel === '육합') score += 8;
      else if (rel === '삼합') score += 6;
      else if (rel === '충') score -= 10;
      slots.push({
        idx: s,
        branch: M.BRANCHES[s],
        label: HOUR_SHORT[s],
        score: Math.max(15, Math.min(90, score))
      });
    }
    var best = slots.reduce(function (a, b) { return b.score > a.score ? b : a; });
    var worst = slots.reduce(function (a, b) { return b.score < a.score ? b : a; });
    return { slots: slots, best: best, worst: worst };
  }

  /* ---------- 아기 풀이 (만 5세 이하 자동) ---------- */

  var BABY_ILGAN = {
    '甲': '뜻이 또렷하고 스스로 해보려는 의지가 강한 아이입니다. "안 돼"보다 "이렇게 해볼까"가 잘 통해요.',
    '乙': '눈치가 빠르고 애교로 마음을 얻는 아이입니다. 낯선 환경에도 부드럽게 스며들어요.',
    '丙': '감정 표현이 크고 밝아 어딜 가도 존재감이 있는 아이입니다. 칭찬받을 때 가장 크게 자라요.',
    '丁': '조용하지만 한 가지에 오래 몰입하는 아이입니다. 곁의 온기에 민감하니 다정한 말이 보약이에요.',
    '戊': '순하고 듬직하며 잘 놀라지 않는 아이입니다. 느긋해 보여도 속으로는 다 담아두고 있어요.',
    '己': '차분히 관찰하고 손으로 만드는 놀이를 좋아하는 아이입니다. 재촉보다 기다림이 잘 맞아요.',
    '庚': '좋고 싫음이 분명하고 몸으로 노는 걸 좋아하는 아이입니다. 규칙을 정해주면 오히려 안정돼요.',
    '辛': '섬세하고 깔끔한 것을 좋아하는 아이입니다. 예민한 만큼 감각이 좋으니 다그치지 말아 주세요.',
    '壬': '호기심이 크고 새로운 것에 겁이 없는 아이입니다. 넓은 놀이터가 최고의 선물이에요.',
    '癸': '감수성이 깊고 어른의 감정을 잘 읽는 아이입니다. 혼자 노는 시간도 이 아이에겐 충전이에요.'
  };

  var BABY_STRENGTH = {
    '신강': '기운이 넉넉한 아이라 몸으로 발산할 놀이 시간이 충분해야 잠도 잘 잡니다.',
    '중화': '기운의 균형이 좋은 아이라 환경 변화에도 무난하게 적응하는 편입니다.',
    '신약': '기운이 섬세한 아이라 충분한 수면과 일정한 생활 리듬이 무엇보다 보약입니다.'
  };

  /* 이름에 채우면 좋은 오행 → 한자 계열 힌트 */
  var EL_NAME_HINT = {
    '목': '나무 목(木) 계열 — 수(樹)·림(林)·동(東) 같은 글자',
    '화': '불 화(火)·해 일(日) 계열 — 현(炫)·희(熙)·환(煥) 같은 글자',
    '토': '흙 토(土) 계열 — 균(均)·재(在)·규(圭) 같은 글자',
    '금': '쇠 금(金) 계열 — 현(鉉)·종(鍾)·석(錫) 같은 글자',
    '수': '물 수(水·氵) 계열 — 호(浩)·수(洙)·태(泰) 같은 글자'
  };

  function babyReading(result) {
    var M = window.Manseryeok;
    var me = M.STEMS[result.pillars.day.stem];
    var missing = ['목', '화', '토', '금', '수'].filter(function (e) { return result.elements[e] === 0; });
    var nameHint = missing.length
      ? '이름을 지을 때 비어 있는 ' + missing.join('·') + ' 기운을 채우는 방향을 참고해 보세요. ' +
        missing.map(function (e) { return EL_NAME_HINT[e]; }).join(', ') +
        '이 그런 계열입니다. (작명은 전문가와 상의하세요)'
      : '오행이 고루 갖춰져 있어 이름으로 특정 기운을 채울 필요는 크지 않습니다. 부르기 좋고 뜻이 따뜻한 이름이면 충분해요.';
    return {
      temper: BABY_ILGAN[me.han],
      care: BABY_STRENGTH[result.strength.label],
      nameHint: nameHint,
      missing: missing
    };
  }

  window.Interpret = {
    babyReading: babyReading,
    ilganText: ilganText,
    elementComment: elementComment,
    elementHeadline: elementHeadline,
    sipseongSummary: sipseongSummary,
    daeunText: daeunText,
    strengthText: strengthText,
    daeunScores: daeunScores,
    todayFortune: todayFortune,
    scoreDay: scoreDay,
    PURPOSES: PURPOSES,
    purposeMatch: purposeMatch,
    hourFlow: hourFlow,
    EL_MEANING: EL_MEANING
  };
})();
