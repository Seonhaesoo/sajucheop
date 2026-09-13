/* 24절기 발표 시각(한국 표준시, 분 단위) — 한국천문연구원 역서·공공데이터포털 특일 정보 값.
 * 엔진(docs/js/manseryeok.js)의 절기 계산은 발표값보다 몇 분(2025년 기준 평균 5.8분, 최대 약 14분) 이르므로,
 * 시각을 그대로 보여 주는 페이지(/jeolgi/, /en/solar-terms/, 날짜 페이지의 '오늘 절기')는 이 표를 먼저 쓰고 표에 없는 해만 엔진값을 쓴다.
 * 출처(2026-09-14 확인): 2026 = 천문연 역서 전재(bebeyam.com), 2027·2028 = 공공데이터포털 특일 정보 전재(month2k.com).
 * DE441 계산(uncle.tools·사자사주)과 24×3개 전부 ±1분 안에서 일치, 중국 발표(北京時間 +1h: 2026 立春 04:01:51 → 05:02, 2027 雨水 05:33:10 → 06:33)와도 일치.
 * 절기 index = 태양 황경/15 (0 춘분 … 21 입춘 … 23 경칩) — build-pages.mjs TERMS[].i, build-en-pages.mjs 배열 순서와 같다. */

export const NAME_INDEX = { 춘분: 0, 청명: 1, 곡우: 2, 입하: 3, 소만: 4, 망종: 5, 하지: 6, 소서: 7, 대서: 8, 입추: 9, 처서: 10, 백로: 11, 추분: 12, 한로: 13, 상강: 14, 입동: 15, 소설: 16, 대설: 17, 동지: 18, 소한: 19, 대한: 20, 입춘: 21, 우수: 22, 경칩: 23 };

/* 달력 순서(1월 소한 → 12월 동지) */
export const YEAR_ORDER = ['소한', '대한', '입춘', '우수', '경칩', '춘분', '청명', '곡우', '입하', '소만', '망종', '하지', '소서', '대서', '입추', '처서', '백로', '추분', '한로', '상강', '입동', '소설', '대설', '동지'];

export const PUBLISHED = {
  2026: { 소한: '01-05 17:23', 대한: '01-20 10:45', 입춘: '02-04 05:02', 우수: '02-19 00:52', 경칩: '03-05 22:59', 춘분: '03-20 23:46', 청명: '04-05 03:40', 곡우: '04-20 10:39', 입하: '05-05 20:49', 소만: '05-21 09:37', 망종: '06-06 00:48', 하지: '06-21 17:25', 소서: '07-07 10:57', 대서: '07-23 04:13', 입추: '08-07 20:43', 처서: '08-23 11:19', 백로: '09-07 23:41', 추분: '09-23 09:05', 한로: '10-08 15:29', 상강: '10-23 18:38', 입동: '11-07 18:52', 소설: '11-22 16:23', 대설: '12-07 11:53', 동지: '12-22 05:50' },
  2027: { 소한: '01-05 23:10', 대한: '01-20 16:30', 입춘: '02-04 10:46', 우수: '02-19 06:33', 경칩: '03-06 04:40', 춘분: '03-21 05:25', 청명: '04-05 09:17', 곡우: '04-20 16:18', 입하: '05-06 02:25', 소만: '05-21 15:18', 망종: '06-06 06:26', 하지: '06-21 23:11', 소서: '07-07 16:37', 대서: '07-23 10:05', 입추: '08-08 02:27', 처서: '08-23 17:14', 백로: '09-08 05:28', 추분: '09-23 15:02', 한로: '10-08 21:17', 상강: '10-24 00:33', 입동: '11-08 00:39', 소설: '11-22 22:16', 대설: '12-07 17:38', 동지: '12-22 11:42' },
  2028: { 소한: '01-06 04:55', 대한: '01-20 22:22', 입춘: '02-04 16:31', 우수: '02-19 12:26', 경칩: '03-05 10:25', 춘분: '03-20 11:17', 청명: '04-04 15:03', 곡우: '04-19 22:09', 입하: '05-05 08:12', 소만: '05-20 21:10', 망종: '06-05 12:16', 하지: '06-21 05:02', 소서: '07-06 22:30', 대서: '07-22 15:54', 입추: '08-07 08:21', 처서: '08-22 23:01', 백로: '09-07 11:22', 추분: '09-22 20:45', 한로: '10-08 03:09', 상강: '10-23 06:13', 입동: '11-07 06:27', 소설: '11-22 03:54', 대설: '12-06 23:25', 동지: '12-21 17:20' },
};
for (const [y, t] of Object.entries(PUBLISHED)) {
  if (Object.keys(t).length !== 24) throw new Error(`solar-terms-data ${y}: ${Object.keys(t).length} terms`);
  for (const [k, v] of Object.entries(t)) if (!(k in NAME_INDEX) || !/^\d{2}-\d{2} \d{2}:\d{2}$/.test(v)) throw new Error(`solar-terms-data ${y} ${k}: ${v}`);
}

/* 발표 시각 — y 는 달력 연도, i 는 절기 index. 없으면 null */
export function publishedTime(y, i) {
  const name = Object.keys(NAME_INDEX).find((k) => NAME_INDEX[k] === i);
  const v = PUBLISHED[y] && PUBLISHED[y][name];
  if (!v) return null;
  const [md, hm] = v.split(' ');
  const [m, d] = md.split('-').map(Number), [hh, mm] = hm.split(':').map(Number);
  return { y, m, d, hh, mm, name, published: true };
}
export const publishedYears = () => Object.keys(PUBLISHED).map(Number).sort();

/* 영문 페이지용 — index 순서. jie = 절(월주가 바뀜), branch = 그 절이 여는 달의 지지(0 子 … 11 亥) */
export const TERM_INFO = [
  { ko: '춘분', han: '春分', en: 'Spring Equinox', pinyin: 'Chunfen', rr: 'chunbun', jie: false, meaning: 'Day and night are equal as the Sun crosses the celestial equator heading north. From here the days grow longer than the nights.' },
  { ko: '청명', han: '清明', en: 'Clear and Bright', pinyin: 'Qingming', rr: 'cheongmyeong', jie: true, branch: 4, meaning: 'Clear skies and the start of the farming year. Qingming is tomb-sweeping day in China; Korea’s Hansik (한식), a day for tending family graves, falls beside it.' },
  { ko: '곡우', han: '穀雨', en: 'Grain Rain', pinyin: 'Guyu', rr: 'gogu', jie: false, meaning: 'The rain that fattens the grain. Rice seedbeds are prepared, and it is the last term of spring.' },
  { ko: '입하', han: '立夏', en: 'Start of Summer', pinyin: 'Lixia', rr: 'ipha', jie: true, branch: 5, meaning: 'Summer begins in the calendar, weeks before it feels like it. In a saju chart the Snake month opens: the season of Fire.' },
  { ko: '소만', han: '小滿', en: 'Grain Buds', pinyin: 'Xiaoman', rr: 'soman', jie: false, meaning: '“Small fullness”: the grain fills but has not ripened. Barley turns golden and everything is still growing.' },
  { ko: '망종', han: '芒種', en: 'Grain in Ear', pinyin: 'Mangzhong', rr: 'mangjong', jie: true, branch: 6, meaning: 'Time to sow the bearded grains and transplant rice. The Horse month opens, the most yang month of the year.' },
  { ko: '하지', han: '夏至', en: 'Summer Solstice', pinyin: 'Xiazhi', rr: 'haji', jie: false, meaning: 'The longest day and shortest night. The peak of light is also the turning point: from here the nights lengthen.' },
  { ko: '소서', han: '小暑', en: 'Minor Heat', pinyin: 'Xiaoshu', rr: 'soseo', jie: true, branch: 7, meaning: 'The real heat begins and the rainy season peaks. The Goat month opens, the dry Earth of late summer.' },
  { ko: '대서', han: '大暑', en: 'Major Heat', pinyin: 'Dashu', rr: 'daeseo', jie: false, meaning: 'The hottest stretch of the year, when the monsoon ends and the heat settles in.' },
  { ko: '입추', han: '立秋', en: 'Start of Autumn', pinyin: 'Liqiu', rr: 'ipchu', jie: true, branch: 8, meaning: 'Autumn begins in the calendar while the heat lingers. The Monkey month opens: the season of Metal, of harvest and finishing.' },
  { ko: '처서', han: '處暑', en: 'End of Heat', pinyin: 'Chushu', rr: 'cheoseo', jie: false, meaning: 'The heat withdraws; mornings and evenings turn cool. Koreans say the mosquitoes’ mouths go crooked at Cheoseo.' },
  { ko: '백로', han: '白露', en: 'White Dew', pinyin: 'Bailu', rr: 'baengno', jie: true, branch: 9, meaning: 'Dew forms as the nights cool. The Rooster month opens, the sharpest month of Metal.' },
  { ko: '추분', han: '秋分', en: 'Autumn Equinox', pinyin: 'Qiufen', rr: 'chubun', jie: false, meaning: 'Day and night are equal again, and from here the nights are longer. A time for taking stock.' },
  { ko: '한로', han: '寒露', en: 'Cold Dew', pinyin: 'Hanlu', rr: 'hallo', jie: true, branch: 10, meaning: 'The dew turns cold. The Dog month opens, autumn’s Earth, the month of filling the storehouse.' },
  { ko: '상강', han: '霜降', en: 'Frost Descent', pinyin: 'Shuangjiang', rr: 'sanggang', jie: false, meaning: 'The first frost. The last of the harvest comes in before the ground hardens.' },
  { ko: '입동', han: '立冬', en: 'Start of Winter', pinyin: 'Lidong', rr: 'ipdong', jie: true, branch: 11, meaning: 'Winter begins; in Korea it is kimchi-making (김장) season. The Pig month opens: the season of Water.' },
  { ko: '소설', han: '小雪', en: 'Minor Snow', pinyin: 'Xiaoxue', rr: 'soseol', jie: false, meaning: 'The first light snow, and the ground begins to freeze. Preparations for winter are finished.' },
  { ko: '대설', han: '大雪', en: 'Major Snow', pinyin: 'Daxue', rr: 'daeseol', jie: true, branch: 0, meaning: 'Heavy snow. The Rat month opens, the deepest yin month of the year, when thinking runs deep and decisions slow down.' },
  { ko: '동지', han: '冬至', en: 'Winter Solstice', pinyin: 'Dongzhi', rr: 'dongji', jie: false, meaning: 'The longest night. Koreans eat red-bean porridge (팥죽) and count the day as the return of the light.' },
  { ko: '소한', han: '小寒', en: 'Minor Cold', pinyin: 'Xiaohan', rr: 'sohan', jie: true, branch: 1, meaning: 'Despite the name, usually the coldest stretch of the Korean year. The Ox month opens: the last month of the saju year, frozen ground where plans are made.' },
  { ko: '대한', han: '大寒', en: 'Major Cold', pinyin: 'Dahan', rr: 'daehan', jie: false, meaning: 'The last of the twenty-four. “Great cold” by name, but spring is close: the saju year ends at the next term.' },
  { ko: '입춘', han: '立春', en: 'Start of Spring', pinyin: 'Lichun', rr: 'ipchun', jie: true, branch: 2, meaning: 'The saju New Year. At this moment the year pillar and the month pillar change together, and so does the zodiac animal in a chart. Korean households paste 立春大吉 on the door.' },
  { ko: '우수', han: '雨水', en: 'Rain Water', pinyin: 'Yushui', rr: 'usu', jie: false, meaning: 'Snow turns to rain and the ice begins to melt. What was frozen, in the fields and in plans, starts to loosen.' },
  { ko: '경칩', han: '驚蟄', en: 'Awakening of Insects', pinyin: 'Jingzhe', rr: 'gyeongchip', jie: true, branch: 3, meaning: 'Hibernating creatures stir and frogs come up from the ground. The Rabbit month opens, the gentlest month of Wood.' },
];
if (TERM_INFO.length !== 24 || TERM_INFO.some((t, i) => NAME_INDEX[t.ko] !== i)) throw new Error('TERM_INFO order');
