/* English library articles — Saju basics. 2026-09-13
 * Charts, solar-term times and calendar dates were computed with tools/engine.mjs (the site's own engine),
 * tools/cny.mjs (Chinese New Year) and the KASI-based lunar table in docs/js/vendor-korean-lunar.js,
 * Ipchun times quoted in the text are published almanac times (Beijing +1 h, e.g. 2027 10:46 KST); the engine
 * runs a few minutes early (2027 10:42), so examples keep clear of the boundary. */
export const ARTICLES = [
  { slug: 'what-is-saju', cat: 'basics', published: '2026-09-13',
    title: "What Is Saju? Korea's Four Pillars of Destiny, Explained",
    desc: "Saju is Korea's Four Pillars of Destiny: eight characters from your birth moment. What they are, how a reading works and how Koreans use it today.",
    links: [{ href: '/en/', title: 'Free saju calculator' }, { href: '/en/guide/', title: 'The 10 Day Masters' }, { href: '/en/match/', title: 'Couple compatibility' }],
    body: `
<p>A Korean friend asks for your birth date and the hour you were born, taps it into an app, and tells you that you are a Tall Pine standing in winter water. What just happened? They cast your saju (사주, 四柱), the Korean name for the Four Pillars of Destiny, and read the first line of it.</p>
<p>Saju turns the moment of a birth into eight written characters, then reads those characters as a portrait of temperament and a map of timing. The same system took shape in China, where it is called BaZi. This guide covers what the eight characters are, how a reader gets from them to a reading, how Koreans actually use saju today, and what it is not.</p>

<h2>Four pillars, eight characters</h2>
<p>The word saju means "four pillars." Each pillar stands for one unit of time at your birth: the year, the month, the day and the two-hour block of the hour. Each pillar is written as two characters stacked on top of each other.</p>
<ul>
<li><b>The top character is a heavenly stem</b> (cheongan, 천간, 天干). There are ten, and each is one of the five elements, Wood, Fire, Earth, Metal or Water, in a yang or a yin form. Jia (甲, Korean gap) is Yang Wood, Yi (乙, eul) is Yin Wood, and so on down to Gui (癸, gye), Yin Water.</li>
<li><b>The bottom character is an earthly branch</b> (jiji, 지지, 地支). There are twelve, and they are the twelve animals of the zodiac: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog and Pig. Each branch also carries an element, and each holds one to three "hidden stems" inside it.</li>
</ul>
<p>Four pillars times two characters gives eight characters, palja (팔자, 八字). It is the same word Mandarin speakers pronounce bazi, and together the two words make saju palja (사주팔자), the everyday Korean name for the whole chart. The word has slipped into ordinary speech: someone with an easy life has a good palja (팔자가 좋다), and someone whose life has been stormy has a hard one (팔자가 세다).</p>
<p>Stems and branches pair up in a fixed order to make sixty combinations, the sexagenary cycle (yuksip gapja, 육십갑자, 六十甲子). The same cycle counts years, months, days and hours. It is also why the 60th birthday, hwangap (환갑, 還甲), is a milestone in Korea: it is the year your birth-year pillar comes around again.</p>
<p>The discipline of reading all this is myeongrihak (명리학, 命理學), roughly "the study of the patterns of a life." Your zodiac animal, the part of the system most people have heard of, is just one of the eight characters: the branch of the year pillar.</p>

<h2>A sample chart, built step by step</h2>
<p>Here is a real chart, cast with Sajucheop's engine, for someone born in Seoul at 2:40 p.m. on November 18, 1997. Korean apps and books usually print the pillars in the opposite order, hour on the left and year on the right, following the old right-to-left layout; the English chart page runs from year to hour, as below.</p>
<table>
<tr><th></th><th>Year</th><th>Month</th><th>Day</th><th>Hour</th></tr>
<tr><td>Stem</td><td>丁 Ding · Yin Fire</td><td>辛 Xin · Yin Metal</td><td>甲 Jia · Yang Wood</td><td>辛 Xin · Yin Metal</td></tr>
<tr><td>Branch</td><td>丑 Ox · Earth</td><td>亥 Pig · Water</td><td>子 Rat · Water</td><td>未 Goat · Earth</td></tr>
<tr><td>Stem's Ten God</td><td>Hurting Officer</td><td>Direct Officer</td><td>Day Master (you)</td><td>Direct Officer</td></tr>
<tr><td>Branch's Ten God</td><td>Direct Wealth</td><td>Indirect Resource</td><td>Direct Resource</td><td>Direct Wealth</td></tr>
</table>
<p><b>Year.</b> The saju year does not begin on January 1 or at Lunar New Year. It begins at Ipchun (입춘, 立春), the Start of Spring solar term, when the sun reaches 315 degrees of celestial longitude. In 1997 that moment came early on the morning of February 4, Korea time, so a November birthday sits well inside the Ding Chou (丁丑) year, a Fire Ox year.</p>
<p><b>Month.</b> Saju months follow the sun too. Each begins at one of twelve solar terms called jeol (절, 節). The Start of Winter (Ipdong, 입동, 立冬) fell on November 7, 1997, and Major Snow (Daeseol, 대설, 大雪) on December 7, so November 18 belongs to the Pig month, Xin Hai (辛亥).</p>
<p><b>Day.</b> Days run through the sixty combinations without a break, ignoring months and years entirely. November 18, 1997 was a Jia Zi (甲子) day, the first pair of the cycle.</p>
<p><b>Hour.</b> Each branch covers two hours. Korea sets its clocks to the 135°E meridian, but Seoul sits near 127°E, so a Seoul clock runs about 32 minutes ahead of the sun. Sajucheop's Korean calculator subtracts those 32 minutes by default: 2:40 p.m. becomes about 2:08 p.m., inside the Goat hour (1 to 3 p.m.). The hour's stem follows from the day stem: Xin Wei (辛未). The English calculator, which works from your birthplace's time zone, gives the same pillar here.</p>
<p>That is the whole calculation. Everything after it is interpretation.</p>

<h2>How a reading works</h2>
<p>A reader does not look up eight meanings and add them together. The characters are read as a system, and most readers work in roughly this order.</p>
<ol>
<li><b>Find the Day Master.</b> The stem of the day pillar stands for you. Here it is 甲, Yang Wood, which Sajucheop's library calls the Tall Pine. Every other character is read through its relationship to this one.</li>
<li><b>Weigh the five elements.</b> This chart holds one Wood, one Fire, two Earth, two Metal and two Water: all five present, none running away with the chart. The month branch, the season of birth, counts most, and born in the Pig month of early winter, this tree stands in cold water.</li>
<li><b>Judge the strength of the Day Master.</b> Water feeds Wood and Wood backs Wood; Fire, Earth and Metal drain or cut it. Sajucheop counts the month branch double and the day branch one and a half times, and this chart comes out balanced, with about 41 percent of the weight on the tree's side.</li>
<li><b>Name the Ten Gods.</b> Each character gets a role from how its element relates to the Day Master: Friend, Rob Wealth, Eating God, Hurting Officer, Indirect and Direct Wealth, Seven Killings, Direct Officer, Indirect and Direct Resource. This chart has two Direct Officers (structure, duty, reputation), two Direct Wealth (steady earnings, practical care), Resource in the month and day branches (learning and backing), and one Hurting Officer (a voice that questions the rules).</li>
<li><b>Check how the branches interact.</b> Some branches combine and some clash. Here the Rat of the day and the Ox of the year form a six-harmony pair, while that Ox and the Goat of the hour stand opposite each other in a clash.</li>
<li><b>Lay the chart against time.</b> The chart is fixed at birth, but ten-year luck pillars (daeun, 대운, 大運) and each year's own pillar keep moving past it. That is where questions of timing get answered. It is also the only step where sex matters: with a yin year stem (丁), a woman's luck pillars here run forward from about age 6 and a man's run backward from about age 4.</li>
</ol>
<p>Put together, a first-pass reading of this chart might sound like this: a straight, principled tree raised on winter water, who tends to do well inside a structure (two Direct Officers above), gains from study and credentials (Resource below), and keeps one restless, outspoken streak (the Hurting Officer in the year pillar). A good reader would then ask about the person's actual life, because a chart describes tendencies and seasons, not events. The <a href="/en/guide/read-saju-chart/">step-by-step guide to reading a chart</a> takes a different example through every stage in detail.</p>

<h2>What Koreans use saju for today</h2>
<p>Saju is not a museum piece in Korea. Apps, fortune cafés and New Year columns keep it in daily circulation, and people bring it a handful of recurring questions.</p>
<ul>
<li><b>Self-understanding.</b> Plenty of people know their Day Master the way others know their personality type, and use it as a shared vocabulary for temperament, stress and what recharges them.</li>
<li><b>Timing.</b> Checking the coming year's fortune (sinnyeon unse, 신년운세, 新年運勢) is a familiar New Year ritual. Weightier questions, such as whether to change jobs, move abroad or start a business, are read against the ten-year luck pillars.</li>
<li><b>Compatibility.</b> Gunghap (궁합, 宮合) compares two charts. It has deep roots in marriage custom: traditionally the groom's family sent the bride's family a saju danja (사주단자, 四柱單子), a folded paper bearing the groom's four pillars, and the wedding date was often chosen with both charts in mind.</li>
<li><b>Naming.</b> Korean naming practitioners (jakmyeong, 작명, 作名) often choose the hanja of a baby's name partly to supply an element the child's chart lacks, alongside rules for stroke counts and sounds.</li>
<li><b>Choosing dates.</b> Taekil (택일, 擇日), picking a good day for a wedding, a move or an opening, draws on the same stems and branches, often mixed with folk calendar customs.</li>
</ul>
<p>Most people hold it lightly, quoting their chart and laughing at it in the same breath, which is a healthy way to use it.</p>

<h2>What saju is not</h2>
<ul>
<li><b>It is not your zodiac animal.</b> The animal is one character of eight. Two people born in the same year share it and can have completely different charts.</li>
<li><b>It is not a lunar-calendar system.</b> This is the most common misunderstanding, in Korea as elsewhere. The year and month pillars follow the sun through the solar terms. A lunar birthday is simply converted to a solar date first.</li>
<li><b>It is not a verdict.</b> The tradition does not sort charts into good and bad. A Fire-heavy chart is strong in expression and short on stamina; a Water-heavy chart is the reverse. The useful question is how a structure works, not whether it wins.</li>
<li><b>It is not science.</b> Saju is a traditional symbolic system with a long literature, and there is no scientific evidence that it predicts events. Treat it as a structured way to reflect on your temperament and your timing, not as a forecast.</li>
<li><b>It is not a reason to be afraid.</b> A reading that ends in dread and an expensive remedy is a reason to walk away. The chart describes the weather; how you walk through it is up to you.</li>
</ul>

<h2>What you need to cast your own chart</h2>
<ul>
<li><b>Your birth date.</b> If your family remembers only a lunar birthday, convert it with a Korean lunar calendar first. Korea's calendar, computed for Korean time by the Korea Astronomy and Space Science Institute (KASI), occasionally starts a month one day later than China's.</li>
<li><b>Your birth time, if you have it.</b> Without it you still get six of the eight characters, including the Day Master, most of the element balance and most of the Ten Gods. Only the hour pillar is missing.</li>
<li><b>Where you were born.</b> The time zone matters, and so does daylight saving time. Korea used summer time in 1948–1951, 1955–1960 and 1987–1988, and from March 1954 to August 1961 it ran on UTC+8:30 instead of UTC+9. Sajucheop's Korean calculator handles the UTC+8:30 years automatically and flags the summer-time years.</li>
<li><b>A second look near the boundaries.</b> If you were born within a couple of hours of a solar term, or close to the start of a two-hour block, read the pillar on both sides of the line. Sajucheop warns you when a birth falls within two hours of a solar term.</li>
</ul>
<p>To see your own eight characters, <a href="/en/">cast your chart on Sajucheop</a>. It computes the solar-term boundaries astronomically and runs entirely in your browser. Then look up your Day Master in <a href="/en/guide/">the library of ten Day Masters</a>, find your pair of day characters among <a href="/en/guide/day-pillar/">the 60 Day Pillars</a> (the example above is <a href="/en/guide/day-pillar/jia-zi/">Jia Zi</a>), or put two birth dates side by side on the <a href="/en/match/">compatibility page</a>.</p>` },

  { slug: 'saju-vs-bazi', cat: 'basics', published: '2026-09-13',
    title: 'Saju vs BaZi: Korean and Chinese Four Pillars Compared',
    desc: 'Saju and BaZi read the same eight characters. What Korean practice does differently: terms, Ipchun, solar time, the Rat hour, calendars, customs.',
    links: [{ href: '/en/', title: 'Free saju calculator' }, { href: '/en/guide/day-pillar/', title: 'The 60 Day Pillars' }, { href: '/en/zodiac/', title: 'Chinese zodiac finder' }],
    body: `
<p>If you have read BaZi books in English or used a Chinese Four Pillars calculator, you may wonder whether Korean saju is a separate system, and whether it will hand you a different chart. The short answer: it is the same system, built on the same astronomy, and for most people it produces exactly the same eight characters. The differences sit in vocabulary, in a few calculation conventions that matter only at the edges, in Korea's clock and calendar history, and in what people use the chart for.</p>
<p>Neither tradition is "the accurate one." Both descend from the same classics, and practitioners in each country argue among themselves about the points below.</p>

<h2>One system, two vocabularies</h2>
<p>The Four Pillars took shape in China. The method that makes the day stem the center of the chart is traditionally credited to Xu Ziping (徐子平) of the Song dynasty and is still called the Ziping method. It spread to Korea, and to Japan, where it is known as shichū suimei (四柱推命). Korean students still learn from the Chinese classics, such as the Ziping Zhenquan (子平眞詮, Korean Japyeong jinjeon), the Qiongtong Baojian (窮通寶鑑, Gungtong bogam) and the Ditian Sui (滴天髓, Jeokcheonsu). What changes from one language to the other is pronunciation and, sometimes, the preferred word.</p>
<table>
<tr><th>Concept</th><th>Korean</th><th>Chinese</th><th>Characters</th></tr>
<tr><td>Four pillars</td><td>saju 사주</td><td>sizhu</td><td>四柱</td></tr>
<tr><td>Eight characters</td><td>palja 팔자</td><td>bazi</td><td>八字</td></tr>
<tr><td>The discipline</td><td>myeongrihak 명리학</td><td>mingli</td><td>命理</td></tr>
<tr><td>Day Master</td><td>ilgan 일간</td><td>rigan, also rizhu</td><td>日干, 日主</td></tr>
<tr><td>Five elements</td><td>ohaeng 오행</td><td>wuxing</td><td>五行</td></tr>
<tr><td>Ten Gods</td><td>sipseong 십성 or sipsin 십신</td><td>shishen</td><td>十星, 十神</td></tr>
<tr><td>Hidden stems</td><td>jijanggan 지장간</td><td>canggan</td><td>支藏干, 藏干</td></tr>
<tr><td>Luck pillars</td><td>daeun 대운</td><td>dayun</td><td>大運</td></tr>
<tr><td>Useful god</td><td>yongsin 용신</td><td>yongshen</td><td>用神</td></tr>
<tr><td>Solar terms</td><td>jeolgi 절기</td><td>jieqi</td><td>節氣</td></tr>
<tr><td>Start of Spring</td><td>Ipchun 입춘</td><td>Lichun</td><td>立春</td></tr>
<tr><td>Marriage compatibility</td><td>gunghap 궁합</td><td>hehun</td><td>宮合, 合婚</td></tr>
</table>
<p>The stems and branches change sound as well. 甲 is jia in Mandarin and gap in Korean, 子 is zi and ja, so the first pair of the sixty is Jia Zi in a BaZi book and gapja (갑자) in Korea. Korean texts also keep the traditional character forms, 大運 and 沖, where mainland Chinese books print the simplified 大运 and 冲. Sajucheop's English pages use pinyin, since that is what English-language BaZi literature uses, and give the Korean reading alongside.</p>
<table>
<tr><th>Stem</th><th>Pinyin</th><th>Korean</th><th>Element</th></tr>
<tr><td>甲</td><td>Jia</td><td>gap 갑</td><td>Yang Wood</td></tr>
<tr><td>乙</td><td>Yi</td><td>eul 을</td><td>Yin Wood</td></tr>
<tr><td>丙</td><td>Bing</td><td>byeong 병</td><td>Yang Fire</td></tr>
<tr><td>丁</td><td>Ding</td><td>jeong 정</td><td>Yin Fire</td></tr>
<tr><td>戊</td><td>Wu</td><td>mu 무</td><td>Yang Earth</td></tr>
<tr><td>己</td><td>Ji</td><td>gi 기</td><td>Yin Earth</td></tr>
<tr><td>庚</td><td>Geng</td><td>gyeong 경</td><td>Yang Metal</td></tr>
<tr><td>辛</td><td>Xin</td><td>sin 신</td><td>Yin Metal</td></tr>
<tr><td>壬</td><td>Ren</td><td>im 임</td><td>Yang Water</td></tr>
<tr><td>癸</td><td>Gui</td><td>gye 계</td><td>Yin Water</td></tr>
</table>
<p>Two traps catch people moving between the systems. In Korean, sin names both the stem 辛 and the Monkey branch 申, which pinyin keeps apart as Xin and Shen. In pinyin, Wu is both the stem 戊 and the Horse branch 午, which Korean keeps apart as mu and o.</p>

<h2>The year starts at the Start of Spring, in both traditions</h2>
<p>A common belief holds that Korean saju starts the year at Ipchun while Chinese BaZi starts it at Lunar New Year. That is not quite right. Classical BaZi and Korean saju both change the year pillar at Lichun, or Ipchun, the moment the sun reaches 315 degrees of celestial longitude, around February 4. What follows Lunar New Year is the popular zodiac: Chinese New Year celebrations mark the arrival of the new animal, and in everyday Korean conversation many people also count their animal (tti, 띠) from Seollal (설날), the Korean Lunar New Year.</p>
<p>So when two sources disagree about the animal of someone born in late January or early February, the split is usually between a practitioner's chart and a zodiac table, not between Korea and China. The <a href="/en/guide/ipchun-year-boundary/">Ipchun guide</a> works through the 2027 case hour by hour.</p>

<h2>The clock problem: true solar time</h2>
<p>The hour pillar follows the sun, not the clock, and here Korea's geography stands out. Korea Standard Time, UTC+9, is set to the 135°E meridian, which runs through western Japan, while Seoul lies at about 127°E. At four minutes per degree, a Seoul clock runs about 32 minutes ahead of the sun. Chinese practitioners apply the same correction under the name zhen taiyang shi (真太陽時); it simply plays out differently because China keeps a single time zone, UTC+8, for the whole country.</p>
<table>
<tr><th>City</th><th>Longitude</th><th>Standard time</th><th>Clock vs. sun</th></tr>
<tr><td>Seoul</td><td>127.0°E</td><td>UTC+9</td><td>about 32 min fast</td></tr>
<tr><td>Busan</td><td>129.1°E</td><td>UTC+9</td><td>about 24 min fast</td></tr>
<tr><td>Tokyo</td><td>139.7°E</td><td>UTC+9</td><td>about 19 min slow</td></tr>
<tr><td>Beijing</td><td>116.4°E</td><td>UTC+8</td><td>about 14 min fast</td></tr>
<tr><td>Shanghai</td><td>121.5°E</td><td>UTC+8</td><td>about 6 min slow</td></tr>
<tr><td>Ürümqi</td><td>87.6°E</td><td>UTC+8</td><td>about 2 h 10 min fast</td></tr>
</table>
<p>Korea's clock history adds a second layer. The country used UTC+8:30 from 1908 to 1911, moved to UTC+9 in 1912, returned to UTC+8:30 from March 21, 1954 to August 9, 1961, and has used UTC+9 since. It also ran summer time in 1948–1951, 1955–1960 and 1987–1988. Ignore that history and the hour pillars of people born in those years can shift, one reason a parent's chart may differ between Korean sites.</p>
<p>Sajucheop's Korean calculator applies the Seoul correction of −32 minutes by default, with a switch to turn it off, handles both UTC+8:30 periods automatically, and warns about summer-time years. During 1954–1961 the correction shrinks to about two minutes, because UTC+8:30 is set to 127.5°E, almost exactly Seoul's longitude. The English calculator asks for your birthplace's time zone and works from clock time, so if you were born within about half an hour of the start of a two-hour block, read the hour pillar on both sides of the line. Strictly speaking, astronomers' true solar time also includes the equation of time, a seasonal wobble of up to about a quarter of an hour; Sajucheop applies the longitude part, and some practitioners add the seasonal part too.</p>

<h2>The late-night Rat hour</h2>
<p>The Rat hour runs from 11 p.m. to 1 a.m. by the sun, so it straddles midnight, and the tradition has never settled which day its first half belongs to. One school changes the day at 11 p.m. (jasi ilbyeon, 자시일변, 子時日變). The other, the late-Rat or yajasi (야자시, 夜子時) convention, keeps the day pillar until midnight but gives the hour pillar the next day's Rat hour. Both exist in Chinese and Korean practice. Sajucheop follows the late-Rat convention; other calculators may use either or let you choose.</p>
<p>The two schools agree on the hour pillar and disagree on the day pillar, and since the day stem is the Day Master, the stakes are high. Take a birth in Seoul at 11:40 p.m. on September 13, 2026. After the solar correction it is about 11:08 p.m., inside the Rat hour.</p>
<table>
<tr><th>Convention</th><th>Day pillar</th><th>Hour pillar</th><th>Day Master</th></tr>
<tr><td>Late Rat (Sajucheop)</td><td>庚寅 Geng Yin</td><td>戊子 Wu Zi</td><td>Yang Metal</td></tr>
<tr><td>Day changes at 11 p.m.</td><td>辛卯 Xin Mao</td><td>戊子 Wu Zi</td><td>Yin Metal</td></tr>
</table>
<p>Combined with the Seoul correction, the late-Rat window on a Seoul clock runs from about 11:32 p.m. to 12:32 a.m., so a baby born at 12:20 a.m. still takes the previous day's pillar. If you were born between 11 p.m. and 1 a.m., find out which rule your calculator uses and read both day pillars.</p>

<h2>Two lunar calendars, a day apart</h2>
<p>The traditional lunisolar calendar starts each month on the day of the new moon, and which day that is depends on the time zone. China computes its calendar for UTC+8. Korea's calendar, published by the Korea Astronomy and Space Science Institute (KASI), is computed for Korean time. When a new moon falls in the last hour before midnight in China, it is already the next day in Korea, and the month begins a day later there.</p>
<p>That is exactly what happens at the start of 2027. The new moon arrives at 11:56 p.m. on February 6, China time, which is 12:56 a.m. on February 7 in Seoul. Chinese New Year 2027 is February 6; Seollal is February 7. The same split happens again in 2028 (January 26 in China, January 27 in Korea), and according to the calendar data Sajucheop uses, it last happened in 1997.</p>
<p>The pillars themselves never use the lunar calendar: years and months follow the solar terms, and days follow the unbroken sixty-day count. The lunar calendar matters for one practical reason. Many Korean families still keep birthdays by the lunar calendar (eumnyeok saengil, 음력 생일), and a lunar date converted with a Chinese table in one of the split months lands on the wrong solar day, which means the wrong day pillar. Convert a Korean lunar birthday with Korean (KASI) calendar data.</p>

<h2>What Korea uses the chart for</h2>
<p>The biggest differences are cultural. Chinese-speaking communities have their own customs, such as marriage matching (hehun, 合婚) and date selection with almanacs like the Tung Shing (通勝) of Hong Kong. In Korea, the same stems and branches feed a distinct set of practices.</p>
<ul>
<li><b>Gunghap (궁합), compatibility.</b> Couple readings are historically tied to marriage negotiations, when the groom's family sent a saju danja (사주단자), a folded paper bearing his four pillars, to the bride's family. Korean gunghap pays special attention to wonjin (원진, 怨嗔), six branch pairs said to breed resentment without an obvious cause: Rat and Goat, Ox and Horse, Tiger and Rooster, Rabbit and Monkey, Dragon and Pig, Snake and Dog.</li>
<li><b>Jakmyeong (작명), naming.</b> Naming offices choose hanja whose element fills a gap in the baby's chart, and check stroke counts and the elements of the name's sounds.</li>
<li><b>Taekil (택일), date selection.</b> Wedding, moving and opening dates are chosen against the charts involved, often combined with folk customs like son eomneun nal (손없는날), the lunar days ending in 9 or 0 that are considered safe for moving house.</li>
<li><b>Tojeong bigyeol (토정비결, 土亭祕訣).</b> A New Year fortune book traditionally attributed to the Joseon scholar Yi Ji-ham, whose pen name was Tojeong. It is not saju: it uses your age and lunar birth month and day to pick one of 144 readings for the year.</li>
<li><b>Samjae (삼재, 三災).</b> A folk belief that each group of three zodiac animals passes through three years of caution every twelve years.</li>
</ul>
<p>Korean popular fortune content also leans heavily on named markers called sinsal (신살, 神殺), such as dohwasal (도화살, 桃花殺), the "peach blossom" star of charm and attraction. Chinese BaZi uses the same markers under the name shensha (神煞). The <a href="/en/guide/peach-blossom/">peach blossom guide</a> covers the best known of them.</p>

<h2>Will a Korean calculator give you a different chart?</h2>
<p>Usually not. For most birth data, a careful Chinese calculator and a careful Korean one produce identical eight characters. Look more closely if any of these apply to you:</p>
<ul>
<li>You were born within a couple of hours of a solar term, so your month pillar, or at Ipchun your year pillar, depends on minutes.</li>
<li>You were born near the start of a two-hour block, where the solar-time correction can move the hour pillar.</li>
<li>You were born between 11 p.m. and 1 a.m., where the Rat hour convention can move the day pillar.</li>
<li>You were born in Korea in the UTC+8:30 years or in a summer-time year.</li>
<li>Your birth date was converted from a lunar date with a non-Korean table.</li>
</ul>
<p>Interpretation varies more, but as much inside each country as between them: readers everywhere differ on how to judge strength and which useful god to choose.</p>
<p>To see your chart computed the Korean way, with astronomically computed solar terms and the late-Rat rule, <a href="/en/">cast it on Sajucheop</a>. Then compare your day pair with <a href="/en/guide/day-pillar/">the 60 Day Pillars</a>, where every page gives the pinyin and Korean names side by side, or see how the popular Lunar New Year boundary works on the <a href="/en/zodiac/">zodiac finder</a>.</p>` },

  { slug: 'read-saju-chart', cat: 'basics', published: '2026-09-13',
    title: "How to Read a Saju Chart: A Beginner's Step-by-Step Guide",
    desc: 'Read a saju chart in five steps: the Day Master, element balance, Ten Gods, branch combinations and clashes, and luck pillars, with one worked example.',
    links: [{ href: '/en/', title: 'Free saju calculator' }, { href: '/en/guide/day-master/yang-metal/', title: 'Yang Metal: The Raw Blade' }, { href: '/en/guide/day-pillar/', title: 'The 60 Day Pillars' }],
    body: `
<p>You have your chart: four columns, eight characters and a row of colored bars. Now what? This guide takes one real chart from start to finish in the order most readers use: the Day Master, the element balance, the Ten Gods, the branches, and the luck pillars that carry the chart through time. Each step builds on the last, so resist jumping straight to next year's forecast.</p>

<h2>The example chart</h2>
<p>Our example is a woman born in Seoul at 8:30 p.m. on February 19, 1991, cast with Sajucheop's engine.</p>
<table>
<tr><th></th><th>Year</th><th>Month</th><th>Day</th><th>Hour</th></tr>
<tr><td>Stem</td><td>辛 Xin · Yin Metal</td><td>庚 Geng · Yang Metal</td><td>庚 Geng · Yang Metal</td><td>丙 Bing · Yang Fire</td></tr>
<tr><td>Stem's Ten God</td><td>Rob Wealth</td><td>Friend</td><td>Day Master</td><td>Seven Killings</td></tr>
<tr><td>Branch</td><td>未 Goat · Earth</td><td>寅 Tiger · Wood</td><td>申 Monkey · Metal</td><td>戌 Dog · Earth</td></tr>
<tr><td>Branch's Ten God</td><td>Direct Resource</td><td>Indirect Wealth</td><td>Friend</td><td>Indirect Resource</td></tr>
<tr><td>Hidden stems</td><td>丁 乙 己</td><td>戊 丙 甲</td><td>戊 壬 庚</td><td>辛 丁 戊</td></tr>
</table>
<p>First, check the edges. February 19 is well past Ipchun, which fell on February 4, 1991, and past that year's Lunar New Year on February 15, so every system agrees on a Xin Wei (辛未), Metal Goat, year. The Tiger month runs from Ipchun to the Awakening of Insects (Gyeongchip, 경칩, 驚蟄) on March 6. And 8:30 p.m. on a Seoul clock is about 7:58 p.m. by the sun, inside the Dog hour (7 to 9 p.m.) with or without the correction. No boundary is close, so the chart is safe to read.</p>

<h2>Step 1: Start with the Day Master</h2>
<p>The Day Master (ilgan, 일간, 日干) is the stem of the day pillar, and it stands for the person. Here it is 庚, Yang Metal, which Sajucheop's library calls the Raw Blade: decisive, loyal, principled, at its best on hard calls. Every other character takes its meaning from its relationship to this one, so read the <a href="/en/guide/day-master/yang-metal/">Yang Metal profile</a> first and keep it as your lens.</p>
<p>Then look at what the Day Master sits on. The day branch is 申, the Monkey, which is Metal too: a Day Master on its own element is well rooted. The day branch is also the spouse seat, the place read for close partnership, and the pair has its own page among the sixty: <a href="/en/guide/day-pillar/geng-shen/">Geng Shen</a>.</p>

<h2>Step 2: Count the elements, then weigh them</h2>
<p>Count the five elements among the eight visible characters: Metal 4 (辛, 庚, 庚, 申), Earth 2 (未, 戌), Wood 1 (寅), Fire 1 (丙), Water 0.</p>
<p>A raw count is only a start, because positions do not weigh the same. The month branch is the season of birth and counts most. She was born in the Tiger month of early spring, when Wood is in command and Metal is out of season, so on that alone a Metal Day Master would lean weak.</p>
<p>The rest of the chart pushes back. To judge the strength of the Day Master (singang and sinyak, 신강·신약, 身強·身弱), sort the other seven characters into those that support Metal (Metal itself, and Earth, which generates Metal) and those that drain or control it (Water, Wood and Fire). Sajucheop weighs the month branch 2, the day branch 1.5 and every other position 1:</p>
<table>
<tr><th>Character</th><th>Element</th><th>Weight</th><th>Effect on Yang Metal</th></tr>
<tr><td>辛 year stem</td><td>Metal</td><td>1</td><td>Supports</td></tr>
<tr><td>未 year branch</td><td>Earth</td><td>1</td><td>Supports</td></tr>
<tr><td>庚 month stem</td><td>Metal</td><td>1</td><td>Supports</td></tr>
<tr><td>寅 month branch</td><td>Wood</td><td>2</td><td>Drains</td></tr>
<tr><td>申 day branch</td><td>Metal</td><td>1.5</td><td>Supports</td></tr>
<tr><td>丙 hour stem</td><td>Fire</td><td>1</td><td>Controls</td></tr>
<tr><td>戌 hour branch</td><td>Earth</td><td>1</td><td>Supports</td></tr>
</table>
<p>That puts 5.5 of 8.5, about 65 percent, on the Day Master's side. Sajucheop calls a Day Master strong at 55 percent or more and weak (the English chart says "gentle") at 35 percent or less, so this Raw Blade is strong: out of season but surrounded by allies. Other schools weigh positions differently; the <a href="/en/guide/day-master-strength/">Day Master strength guide</a> compares them.</p>
<p>Strong does not mean better. A strong Day Master carries its own engine and does best with somewhere to spend it: work and money (Wealth), rules and pressure (Officer), outlets for expression (Output). A weak one does best with backing: learning, credentials, allies. They are two different instruction manuals.</p>

<h2>Step 3: Read the Ten Gods as a pattern</h2>
<p>The Ten Gods (sipseong, 십성, 十星) name each character's role relative to the Day Master. For a branch, the role comes from its main hidden stem, the last one listed in the table. Grouped into five families, this chart shows:</p>
<ul>
<li><b>Companions, 3:</b> Friend in the month stem and day branch, Rob Wealth in the year stem. Peers, independence, competition.</li>
<li><b>Resource, 2:</b> Direct Resource in the year branch, Indirect Resource in the hour branch. Backing, learning, a safety net.</li>
<li><b>Wealth, 1:</b> Indirect Wealth in the month branch. Opportunity, ventures, money in motion.</li>
<li><b>Officer, 1:</b> Seven Killings in the hour stem. Pressure, challenge, the forge.</li>
<li><b>Output, 0 visible:</b> no Eating God or Hurting Officer on the surface.</li>
</ul>
<p>Read the families as a pattern. The self and its allies dominate, which fits the strength verdict: someone who would rather do it herself. The only Wealth sits in the month branch, the seat of career and surroundings, with three companions nearby to compete for it, a classic picture of opportunity that has to be defended. The lone Seven Killings in the hour stem is the fire that tempers the blade: pressure she may not enjoy but tends to grow from.</p>
<p>The empty Output family is where hidden stems earn their keep. Inside the day branch 申 sits 壬, Yang Water, which is Eating God to Yang Metal. Expression and craft are not absent; they are tucked into the most private branch of the chart. The <a href="/en/guide/ten-gods/">Ten Gods guide</a> covers each role, and the <a href="/en/guide/hidden-stems/">hidden stems guide</a> the full table.</p>

<h2>Step 4: Look for combinations and clashes</h2>
<p>Branches interact in three main ways: six-harmony pairs (yukhap, 육합, 六合), which bind quietly; trines (samhap, 삼합, 三合), in which three branches pull toward one element, with any two making a half trine; and clashes (chung, 충, 沖) between branches on opposite sides of the circle. Stems have combinations and clashes of their own.</p>
<ul>
<li><b>寅 and 申 clash</b> (month and day). Tiger faces Monkey, Wood against Metal. A clash between the month branch (work, family of origin, surroundings) and the day branch (self and partnership) is often read as movement: more changes of job, home or priorities than average, and a tug between work and private life. It also shakes the chart's only Wealth.</li>
<li><b>寅 and 戌 make a half Fire trine</b> (month and hour). They are two of the three members of 寅午戌. Fire controls Metal, so this quietly feeds the Seven Killings, and the trine completes whenever a 午 (Horse) arrives from a luck pillar or a year.</li>
<li><b>丙 and 辛 combine</b> (hour and year stems). In theory this pair transforms into Water, the element the chart lacks. Whether a combination transforms depends on the season and the rest of the chart; with no Water support here, most readers would treat it as a bond that ties both stems up rather than as new Water.</li>
</ul>
<p>A clash is not a disaster and a combination is not a blessing; they show where a chart moves and where it sticks. Some schools also track "punishments" and "harms" (未 and 戌 belong to one punishment group). This walkthrough stays with combinations and clashes, which are also what Sajucheop's tools use.</p>

<h2>Step 5: Move the chart through time</h2>
<p>The eight characters never change. What changes is the weather passing over them: ten-year luck pillars (daeun, 대운, 大運), each year's pillar (seun, 세운, 歲運) and, at finer grain, each month and day. Luck pillars are the only part of the chart that depends on sex. They step through the sixty-pair cycle from the month pillar, forward for a man born in a yang year or a woman born in a yin year, backward otherwise. She was born in a Xin (yin) year, so her luck runs forward from 庚寅.</p>
<p>The starting age comes from the solar terms: count the days from birth to the next month boundary (or back to the previous one, if the luck runs backward) and divide by three. Gyeongchip came about 14.6 days after her birth, and 14.6 ÷ 3 ≈ 4.9, so her first luck pillar begins at about 5.</p>
<table>
<tr><th>Ages</th><th>Luck pillar</th><th>Stem's Ten God</th><th>What it brings</th></tr>
<tr><td>5–14</td><td>辛卯 Xin Mao</td><td>Rob Wealth</td><td>More Metal above, Wood below</td></tr>
<tr><td>15–24</td><td>壬辰 Ren Chen</td><td>Eating God</td><td>The missing Water arrives</td></tr>
<tr><td>25–34</td><td>癸巳 Gui Si</td><td>Hurting Officer</td><td>Water above, Fire below</td></tr>
<tr><td>35–44</td><td>甲午 Jia Wu</td><td>Indirect Wealth</td><td>午 completes the Fire trine</td></tr>
<tr><td>45–54</td><td>乙未 Yi Wei</td><td>Direct Wealth</td><td>Wood above, Earth below</td></tr>
<tr><td>55–64</td><td>丙申 Bing Shen</td><td>Seven Killings</td><td>Fire above, a second Monkey below</td></tr>
</table>
<p>Read luck pillars against the strength verdict. A strong Day Master generally welcomes Output, Wealth and Officer periods, which give its energy somewhere to go. That makes the Water decades from 15 to 34 a natural time to build skills and a voice, since they supply the element she was born without. The 甲午 decade is the most dramatic: Wealth above, and a Horse below that joins her Tiger and Dog in a full Fire trine, the element that forges Metal. Read it as a decade of larger responsibility, visibility and pressure, the kind a strong Metal chart is built to carry. Years work the same way on a smaller scale: 2026, a 丙午 year, brings that same Horse under a Seven Killings stem.</p>
<p>Treat starting ages as approximate. Sajucheop's Korean result page counts them in traditional Korean age, in which you are one at birth, so a changeover is better read as a shift across a year or two than as a birthday event. The <a href="/en/guide/luck-pillars/">luck pillars guide</a> goes deeper.</p>

<h2>Common beginner mistakes</h2>
<ul>
<li><b>Reading one character alone.</b> "I have Seven Killings, so life will be hard" skips every step above. The same character reads differently in a strong chart and a weak one.</li>
<li><b>Treating a zero as a hole.</b> Check hidden stems and luck pillars first. Here the "missing" Water is hidden in the day branch and delivered by two decades.</li>
<li><b>Skipping the boundary check.</b> A chart cast on the wrong side of a solar term or a Rat-hour midnight is a different chart.</li>
<li><b>Centering the zodiac animal.</b> Her animal is the Goat, and this reading barely mentioned it. The day pillar carries the self.</li>
<li><b>Forgetting it is a mirror.</b> A chart describes tendencies and seasons. Test it against the life in front of you and keep what is useful.</li>
</ul>
<p>Now try it on your own chart. <a href="/en/">Cast it on Sajucheop</a> to get your pillars, element bars, strength line and Ten Gods on one screen, read your Day Master in <a href="/en/guide/">the library</a>, and find your day pair among <a href="/en/guide/day-pillar/">the 60 Day Pillars</a>. To see how each day's pillar meets your chart, open <a href="/en/today/">today's reading</a>.</p>` },

  { slug: 'five-elements-balance', cat: 'basics', published: '2026-09-13',
    title: 'Five Elements in Saju: How to Read Your Element Balance',
    desc: 'Wood, Fire, Earth, Metal and Water in a saju chart: the two cycles, how to count elements and hidden stems, and what a missing or excess element means.',
    links: [{ href: '/en/', title: 'See your element balance' }, { href: '/en/guide/useful-god/', title: 'The useful god' }, { href: '/en/guide/hidden-stems/', title: 'Hidden stems explained' }],
    body: `
<p>Your chart came back with a bar for each of the five elements, and one of them reads zero. Is that bad? Should you start wearing a certain color? The five elements (ohaeng, 오행, 五行) are the grammar under every saju reading, and a zero means less than it first seems. Here is how the elements work, how to count them properly, and what a missing or excessive element does and does not tell you.</p>

<h2>Five movements, not five substances</h2>
<p>The elements are easiest to understand not as materials but as five directions of movement, each tied to a season. That is how Sajucheop's Korean guides teach them, and it makes the rest of saju much easier to follow.</p>
<table>
<tr><th>Element</th><th>Movement</th><th>Season</th><th>Stems</th><th>Branches</th></tr>
<tr><td>Wood 목 木</td><td>Reaching up and out</td><td>Spring</td><td>甲 Jia, 乙 Yi</td><td>寅 Tiger, 卯 Rabbit</td></tr>
<tr><td>Fire 화 火</td><td>Spreading in every direction</td><td>Summer</td><td>丙 Bing, 丁 Ding</td><td>巳 Snake, 午 Horse</td></tr>
<tr><td>Earth 토 土</td><td>Gathering to the center</td><td>The turn of each season</td><td>戊 Wu, 己 Ji</td><td>辰 Dragon, 未 Goat, 戌 Dog, 丑 Ox</td></tr>
<tr><td>Metal 금 金</td><td>Condensing inward</td><td>Autumn</td><td>庚 Geng, 辛 Xin</td><td>申 Monkey, 酉 Rooster</td></tr>
<tr><td>Water 수 水</td><td>Sinking down and storing</td><td>Winter</td><td>壬 Ren, 癸 Gui</td><td>亥 Pig, 子 Rat</td></tr>
</table>
<p>Sprouting, flourishing, harvest and storage, with Earth as the hinge between seasons: the elements are the rhythm of the year applied to temperament. It is also why saju follows the sun. Seasons come from the solar year, so a chart's months are solar months that begin at the solar terms.</p>

<h2>The generating and controlling cycles</h2>
<p>The elements relate in two fixed loops.</p>
<ul>
<li><b>Generating (sangsaeng, 상생, 相生):</b> Wood feeds Fire, Fire leaves ash that becomes Earth, Earth yields Metal, Metal gathers Water (think of springs rising from rock), and Water nourishes Wood.</li>
<li><b>Controlling (sanggeuk, 상극, 相剋):</b> Wood breaks up Earth, Earth dams Water, Water puts out Fire, Fire melts and forges Metal, and Metal cuts Wood.</li>
</ul>
<p>Control is not the villain. A river without banks floods; metal that never meets fire never becomes a tool. Much of what is useful in a chart comes from a controlling relationship in the right amount.</p>
<p>The subtler lesson is that generating can go wrong too. Classical phrases still taught in Korea put it in four characters: 土多金埋, "too much earth buries the metal," and 水多木浮, "too much water sets the wood afloat." Support that arrives in excess smothers instead of helping. Keep that in mind for the example below.</p>

<h2>How to count the elements in a chart</h2>
<p>Counting works in layers, and each layer adds resolution.</p>
<ol>
<li><b>The eight visible characters.</b> Each stem and branch carries one element. Sajucheop's Five Elements bars show this count, and it is the right place to start.</li>
<li><b>Position.</b> The month branch is the season of birth and weighs most; the day branch, directly under the Day Master, comes next. Sajucheop's strength verdict counts the month branch twice, the day branch one and a half times, and every other position once.</li>
<li><b>Hidden stems.</b> Each branch holds one to three stems (jijanggan, 지장간, 支藏干): energy lingering from the season before, a middle energy, and the branch's main energy, listed last below. They explain why an element can be missing from the bars and still be present in the chart.</li>
</ol>
<table>
<tr><th>Branch</th><th>Hidden stems</th><th>Branch</th><th>Hidden stems</th></tr>
<tr><td>子 Rat</td><td>壬 癸</td><td>午 Horse</td><td>丙 己 丁</td></tr>
<tr><td>丑 Ox</td><td>癸 辛 己</td><td>未 Goat</td><td>丁 乙 己</td></tr>
<tr><td>寅 Tiger</td><td>戊 丙 甲</td><td>申 Monkey</td><td>戊 壬 庚</td></tr>
<tr><td>卯 Rabbit</td><td>甲 乙</td><td>酉 Rooster</td><td>庚 辛</td></tr>
<tr><td>辰 Dragon</td><td>乙 癸 戊</td><td>戌 Dog</td><td>辛 丁 戊</td></tr>
<tr><td>巳 Snake</td><td>戊 庚 丙</td><td>亥 Pig</td><td>戊 甲 壬</td></tr>
</table>
<p>Schools differ on how much each hidden stem counts, and some assign each one a share of days within the month. The safe rule for beginners: the main stem matters most, and a hidden element is real but quieter than a visible one.</p>

<h2>A worked example: heavy Earth, no visible Fire</h2>
<p>Take a chart cast with Sajucheop's engine for someone born in Seoul at 8:30 p.m. on October 21, 1998: a 戊寅 year, 壬戌 month, 辛丑 day and 戊戌 hour. The Day Master is 辛, Yin Metal, <a href="/en/guide/day-master/yin-metal/">the Polished Gem</a>.</p>
<table>
<tr><th>Count</th><th>Wood</th><th>Fire</th><th>Earth</th><th>Metal</th><th>Water</th></tr>
<tr><td>Visible characters</td><td>1</td><td>0</td><td>5</td><td>1</td><td>1</td></tr>
<tr><td>Hidden stems</td><td>1</td><td>3</td><td>4</td><td>3</td><td>1</td></tr>
</table>
<p>On the bars this chart reads Earth 5, Fire 0. Two things change the picture.</p>
<p>First, Fire is not really absent. It sits inside three of the four branches: 丙 in the Tiger and 丁 in each Dog. For a Yin Metal Day Master, Fire is the Officer element of structure, standards and recognition. The chart has it, but underground, as a potential that surfaces when a Fire year or luck pillar draws it out. The Fire Horse and Fire Goat years, 2026 and 2027, do exactly that.</p>
<p>Second, the Earth is too much of a good thing. Earth generates Metal, so every Earth character counts as Resource for this Day Master, and with the month branch 戌 also Earth, Sajucheop's weighting puts about 76 percent of the chart on the Day Master's side: strong. This is the classical picture of 土多金埋, a gem buried in soil. Read as a person, it suggests plenty of backing, knowledge and caution, with the risk of too much of it: overthinking, waiting for permission, being protected out of one's own shine.</p>
<p>What would balance it? Not more support. Wood breaks up Earth, so it is the natural counterweight, and for Yin Metal it is Wealth, the element of practical engagement with the world. Water helps too, drawing the Metal's energy outward; a traditional image has Yin Metal as a jewel that shines once it is washed. Choosing between candidates like these is the job of the useful god (yongsin, 용신, 用神), covered in the <a href="/en/guide/useful-god/">useful god guide</a>.</p>

<h2>What a missing element means, and what it doesn't</h2>
<ul>
<li><b>A zero is a blank, not a defect.</b> Sajucheop's Korean guide calls it an empty square rather than a shortage: the element's themes do not come by default and have to be built on purpose. A chart with no visible Earth, for example, is often read as needing routine and follow-through built by habit.</li>
<li><b>Check the hidden stems.</b> An element absent from the bars but present as a hidden stem is latent, not missing, as in the example.</li>
<li><b>Check the luck pillars.</b> Elements arrive from outside ten years at a time, and a missing element often shows up as a decade that feels unusually new.</li>
<li><b>Missing does not mean needed.</b> The element a chart lacks is sometimes its useful god and sometimes the one that would do the most harm. Need is judged by balance, not by count.</li>
<li><b>Excess means a strong engine.</b> Three or more of one element usually marks a person's most obvious drive and the place they overheat. Four or five, as in the example, starts to define the whole chart.</li>
<li><b>All five present is not a prize.</b> A chart with every element can still tilt hard through season and position.</li>
</ul>
<p>An element also stands for a family of Ten Gods, which is how a reader turns a count into a sentence. For a Yin Metal Day Master, no visible Fire means no visible Officer; for a Yang Wood Day Master, the same missing Fire would mean no visible Output. The <a href="/en/guide/ten-gods/">Ten Gods guide</a> maps each element to its role for every Day Master.</p>

<h2>How Koreans apply balance</h2>
<p>Korea has long used the five elements as a design language, most visibly in the five directional colors, obangsaek (오방색, 五方色): blue-green for the east, red for the south, yellow for the center, white for the west and black for the north. They appear in traditional dress, temple paintwork and the five-colored pouches called obangnang (오방낭). The same correspondences sit behind the common advice to "use" an element you need.</p>
<table>
<tr><th>Element</th><th>Color</th><th>Direction</th><th>Numbers</th><th>Everyday practice</th></tr>
<tr><td>Wood</td><td>Blue, green</td><td>East</td><td>3, 8</td><td>Plants nearby, learning something new</td></tr>
<tr><td>Fire</td><td>Red</td><td>South</td><td>2, 7</td><td>Sunlight, an expressive hobby</td></tr>
<tr><td>Earth</td><td>Yellow</td><td>Center</td><td>5, 10</td><td>Regular routines, walking</td></tr>
<tr><td>Metal</td><td>White</td><td>West</td><td>4, 9</td><td>Tidying, finishing what you start</td></tr>
<tr><td>Water</td><td>Black</td><td>North</td><td>1, 6</td><td>Enough sleep, reading</td></tr>
</table>
<p>The numbers come from the Hado (河圖), the traditional River Chart. The practices in the last column follow Sajucheop's Korean guide, which makes no claim of physical effect and treats a missing element as a direction of movement to practice in daily life.</p>
<p>Names are the most lasting application. Korean naming practitioners look at the element of each hanja character, usually read from its radical (jawon ohaeng, 자원오행), and the element of each syllable's opening sound (bareum ohaeng, 발음오행). In the widely used sound system, which Sajucheop's Korean naming tool also follows, ㄱ and ㅋ are Wood; ㄴ, ㄷ, ㄹ and ㅌ are Fire; ㅇ and ㅎ are Earth; ㅅ, ㅈ and ㅊ are Metal; and ㅁ, ㅂ and ㅍ are Water, though schools disagree about some of these assignments. A family told that their baby's chart lacks Wood might look for a character with the tree radical, such as 林 (forest) or 松 (pine).</p>
<p>Keep the scale in proportion. Colors and directions are reminders, not remedies, and nobody's life turns on a sweater. The most practical use of element balance is timing: knowing which element your chart leans on and which it lacks, and noticing when a year or a ten-year luck pillar brings it in.</p>
<p>To see your own balance, <a href="/en/">cast your chart on Sajucheop</a>: the Five Elements bars count your eight visible characters, and the strength line shows which way the chart leans. Then look inside your branches with the <a href="/en/guide/hidden-stems/">hidden stems guide</a>, and learn how readers choose the element a chart needs most in the <a href="/en/guide/useful-god/">useful god guide</a>.</p>` },

  { slug: 'ipchun-year-boundary', cat: 'basics', published: '2026-09-13',
    title: 'Ipchun: Why Your Saju Year Starts Around February 4',
    desc: 'In saju your year pillar and zodiac animal change at Ipchun, around Feb 4, not on Jan 1 or Lunar New Year. Exact 2027 times, and who is affected.',
    links: [{ href: '/en/zodiac/', title: 'Find your zodiac animal' }, { href: '/en/2027/', title: '2027: Year of the Fire Goat' }, { href: '/en/', title: 'Free saju calculator' }],
    body: `
<p>Born on January 28: are you the new zodiac animal or the old one? Every website seems to give a different answer, and a Korean saju reader may give a third. The confusion comes from three different ideas of when a year begins: January 1, Lunar New Year and Ipchun. Saju uses Ipchun, and once you see why, the rest falls into place.</p>

<h2>What Ipchun is</h2>
<p>Ipchun (입춘, 立春), "spring begins," is one of the 24 solar terms (jeolgi, 절기, 節氣) that divide the sun's yearly path into 15-degree steps. It is the moment the sun reaches 315 degrees of celestial longitude, halfway between the winter solstice and the spring equinox. In recent years it has fallen on February 3 or 4 in Korea.</p>
<p>Two details matter. First, Ipchun is an instant, not a day: in 2027 it arrives at 10:46 a.m. Korea time on Thursday, February 4. Second, it is the same instant everywhere on Earth, so the local date and time depend on where you are.</p>
<table>
<tr><th>Place</th><th>Local time of Ipchun 2027</th></tr>
<tr><td>Seoul (UTC+9)</td><td>Thursday, February 4, 10:46 a.m.</td></tr>
<tr><td>Beijing (UTC+8)</td><td>Thursday, February 4, 9:46 a.m.</td></tr>
<tr><td>London (UTC)</td><td>Thursday, February 4, 1:46 a.m.</td></tr>
<tr><td>New York (UTC−5)</td><td>Wednesday, February 3, 8:46 p.m.</td></tr>
<tr><td>Los Angeles (UTC−8)</td><td>Wednesday, February 3, 5:46 p.m.</td></tr>
</table>
<p>These are the published almanac times. Sajucheop’s calculator computes the solar terms itself and can differ from published times by a few minutes, so for a birth within a few minutes of Ipchun, go by the published time.</p>
<p>Ipchun opens the first saju month as well as the year. Saju months begin at the twelve jeol (절, 節) terms, one every 30 degrees of the sun's path, and each starts a new branch:</p>
<table>
<tr><th>Solar term</th><th>Around</th><th>Month branch</th></tr>
<tr><td>Start of Spring (Ipchun 입춘)</td><td>Feb 4</td><td>寅 Tiger</td></tr>
<tr><td>Awakening of Insects (Gyeongchip 경칩)</td><td>Mar 5</td><td>卯 Rabbit</td></tr>
<tr><td>Clear and Bright (Cheongmyeong 청명)</td><td>Apr 5</td><td>辰 Dragon</td></tr>
<tr><td>Start of Summer (Ipha 입하)</td><td>May 5</td><td>巳 Snake</td></tr>
<tr><td>Grain in Ear (Mangjong 망종)</td><td>Jun 6</td><td>午 Horse</td></tr>
<tr><td>Minor Heat (Soseo 소서)</td><td>Jul 7</td><td>未 Goat</td></tr>
<tr><td>Start of Autumn (Ipchu 입추)</td><td>Aug 7</td><td>申 Monkey</td></tr>
<tr><td>White Dew (Baengno 백로)</td><td>Sep 7</td><td>酉 Rooster</td></tr>
<tr><td>Cold Dew (Hallo 한로)</td><td>Oct 8</td><td>戌 Dog</td></tr>
<tr><td>Start of Winter (Ipdong 입동)</td><td>Nov 7</td><td>亥 Pig</td></tr>
<tr><td>Major Snow (Daeseol 대설)</td><td>Dec 7</td><td>子 Rat</td></tr>
<tr><td>Minor Cold (Sohan 소한)</td><td>Jan 5</td><td>丑 Ox</td></tr>
</table>

<h2>Why not January 1 or Lunar New Year?</h2>
<p>Saju is a calendar of seasons. Its five elements map onto the seasons, Wood onto spring, Fire onto summer and so on, and seasons are made by the sun, not by the moon or the civil calendar. So the chart's year begins where spring begins, with the Tiger month, and each month begins when the sun crosses the next 30-degree mark.</p>
<p>January 1 plays no part in the tradition at all. Lunar New Year, Seollal (설날) in Korea and Chunjie (春節) in China, is the first day of the lunar calendar. In most years it falls on the second new moon after the winter solstice, anywhere from January 21 to February 20. It is the right boundary for holidays, lunar birthdays and the popular zodiac, and it is the boundary Sajucheop's <a href="/en/zodiac/">zodiac finder</a> uses. But a lunar month says nothing precise about the season, so the Four Pillars never used it. This is not a Korean quirk: Chinese BaZi also turns the year at the Start of Spring, which it calls Lichun, and in both countries the popular zodiac often follows Lunar New Year instead.</p>

<h2>The 2027 case, hour by hour</h2>
<p>Early 2027 puts all three boundaries inside three days. The Fire Horse year (丙午) gives way to the Fire Goat year (丁未), and the calendars disagree about when:</p>
<ul>
<li><b>Ipchun:</b> February 4, 10:46 a.m. Korea time. The saju year pillar becomes 丁未.</li>
<li><b>Chinese New Year:</b> February 6. The new moon falls at 11:56 p.m. on February 6, China time.</li>
<li><b>Seollal:</b> February 7. The same new moon is 12:56 a.m. on February 7 in Korea, so the Korean lunar calendar starts its year a day later.</li>
</ul>
<table>
<tr><th>Born in Seoul</th><th>Saju year (Ipchun)</th><th>Chinese calendar</th><th>Korean lunar calendar</th></tr>
<tr><td>Feb 3, noon</td><td>Horse 丙午</td><td>Horse</td><td>Horse</td></tr>
<tr><td>Feb 4, 10:00 a.m.</td><td>Horse 丙午</td><td>Horse</td><td>Horse</td></tr>
<tr><td>Feb 4, 10:55 a.m.</td><td>Goat 丁未</td><td>Horse</td><td>Horse</td></tr>
<tr><td>Feb 5, noon</td><td>Goat 丁未</td><td>Horse</td><td>Horse</td></tr>
<tr><td>Feb 6, noon</td><td>Goat 丁未</td><td>Goat</td><td>Horse</td></tr>
<tr><td>Feb 7, noon</td><td>Goat 丁未</td><td>Goat</td><td>Goat</td></tr>
</table>
<p>Look at the two babies born 55 minutes apart on the morning of February 4. They share a day pillar (甲寅) and even an hour pillar (己巳). But the first has the year and month pillars 丙午 and 辛丑, the second 丁未 and 壬寅: two zodiac animals and two different months of birth, which changes how the whole chart is weighed. Sajucheop's calculator flags births like these, within two hours of a solar term, so you know to double-check the time.</p>

<h2>Ipchun, Seollal and Chinese New Year, 2020–2030</h2>
<p>Ipchun moves slowly. Each year it arrives about 5 hours 48 minutes later than the year before, because the solar year runs almost a quarter of a day past 365 days, until a leap day pulls it back. Lunar New Year jumps by weeks. Times are Korea time, converted from published almanac tables (Beijing time plus one hour) and rounded to the minute.</p>
<table>
<tr><th>Year</th><th>Ipchun (KST)</th><th>Saju year from Ipchun</th><th>Seollal</th><th>Chinese New Year</th></tr>
<tr><td>2020</td><td>Feb 4, 6:03 p.m.</td><td>庚子 Metal Rat</td><td>Jan 25</td><td>Jan 25</td></tr>
<tr><td>2021</td><td>Feb 3, 11:59 p.m.</td><td>辛丑 Metal Ox</td><td>Feb 12</td><td>Feb 12</td></tr>
<tr><td>2022</td><td>Feb 4, 5:51 a.m.</td><td>壬寅 Water Tiger</td><td>Feb 1</td><td>Feb 1</td></tr>
<tr><td>2023</td><td>Feb 4, 11:42 a.m.</td><td>癸卯 Water Rabbit</td><td>Jan 22</td><td>Jan 22</td></tr>
<tr><td>2024</td><td>Feb 4, 5:27 p.m.</td><td>甲辰 Wood Dragon</td><td>Feb 10</td><td>Feb 10</td></tr>
<tr><td>2025</td><td>Feb 3, 11:10 p.m.</td><td>乙巳 Wood Snake</td><td>Jan 29</td><td>Jan 29</td></tr>
<tr><td>2026</td><td>Feb 4, 5:02 a.m.</td><td>丙午 Fire Horse</td><td>Feb 17</td><td>Feb 17</td></tr>
<tr><td>2027</td><td>Feb 4, 10:46 a.m.</td><td>丁未 Fire Goat</td><td>Feb 7</td><td>Feb 6</td></tr>
<tr><td>2028</td><td>Feb 4, 4:31 p.m.</td><td>戊申 Earth Monkey</td><td>Jan 27</td><td>Jan 26</td></tr>
<tr><td>2029</td><td>Feb 3, 10:20 p.m.</td><td>己酉 Earth Rooster</td><td>Feb 13</td><td>Feb 13</td></tr>
<tr><td>2030</td><td>Feb 4, 4:08 a.m.</td><td>庚戌 Metal Dog</td><td>Feb 3</td><td>Feb 3</td></tr>
</table>
<p>Notice 2021, 2025 and 2029, when Ipchun fell late on February 3 in Korea: a baby born in Seoul at 11:30 p.m. on February 3, 2025 was already a Snake in saju. And compare 2030, when Seollal and Ipchun land a day apart, with 2026, when they are almost two weeks apart. The full tables of all twenty-four terms, with times, are on the <a href="/en/solar-terms/2027/">2027 solar terms page</a> and its neighbors.</p>

<h2>Who is affected</h2>
<p>If you were born between January 1 and Ipchun, your saju year is always the previous calendar year. Beyond that, the people whose animal depends on the rule are those born between Lunar New Year and Ipchun, whichever comes first.</p>
<ul>
<li><b>When Lunar New Year comes first,</b> people born in the gap are the new animal by the lunar calendar but the old one in saju. In 2023, anyone born from January 22 to 11:42 a.m. on February 4 is a Rabbit by the lunar calendar and a Tiger (壬寅) in saju. In 2028, a baby born on January 30 is a Monkey by the lunar calendar and a Goat (丁未) in saju.</li>
<li><b>When Ipchun comes first,</b> it is the reverse. In 2026, anyone born from 5:02 a.m. on February 4 to February 16 is a Horse (丙午) in saju but still a Snake by the lunar calendar.</li>
</ul>
<p>January births carry one more wrinkle: the month. Before Minor Cold (Sohan, 소한, 小寒), around January 5 or 6, you are in the Rat month of the previous saju year; after it, the Ox month. A baby born on January 20, 2027 has the year pillar 丙午 and the Ox month 辛丑, even though the calendar says 2027. Either way, a January chart always carries a winter month branch.</p>

<h2>Near the boundary: what to check</h2>
<ul>
<li><b>Your exact birth time.</b> Within a couple of hours of Ipchun, the year and month pillars depend on minutes. A hospital record beats family memory.</li>
<li><b>Your time zone.</b> Because Ipchun is one global instant, compare it with your birth in your birthplace's local time, as in the table above. On Sajucheop's English calculator you choose your birthplace's UTC offset and the engine does the conversion.</li>
<li><b>Daylight saving time.</b> Summer time rarely applies in early February in the Northern Hemisphere, but there have been exceptions, and in the Southern Hemisphere February is summer. Use the offset that was actually in force.</li>
<li><b>Solar-time corrections do not move the line.</b> True solar time adjusts the hour pillar and, around midnight, the day pillar. The year and month boundaries are astronomical instants compared with the real moment of birth, so Seoul's −32-minute correction does not shift Ipchun.</li>
</ul>

<h2>Ipchun in Korean life</h2>
<p>Ipchun is more than a calculation in Korea. On the day, households traditionally paste spring notes called ipchunchuk (입춘축, 立春祝) on the gate or front door, most often the eight characters 立春大吉 建陽多慶: "great luck as spring begins; much joy as the bright energy rises." You can still see them on traditional houses and temple gates, and some families tape them to apartment doors. Another name for these notes is ipchuncheop (입춘첩, 立春帖), and the cheop in Sajucheop is that same character, 帖.</p>
<p>In everyday talk, though, many Koreans count the zodiac animal from Seollal, and many families keep birthdays by the lunar calendar. That is why the question "am I really the new animal?" comes up every winter. The answer depends on which rule you mean: the lunar rule for the popular zodiac and the holidays, and Ipchun for the chart.</p>
<p>To see both answers for your own birthday, check the <a href="/en/zodiac/">zodiac finder</a> for the Lunar New Year boundary, then <a href="/en/">cast your saju chart</a>, which uses Ipchun and flags births near a solar term. For the year ahead, <a href="/en/2027/">the 2027 Fire Goat guide</a> covers what 丁未 brings each sign, and parents expecting a baby that winter can read about <a href="/en/guide/fire-goat-baby-2027/">2027 Fire Goat babies</a>.</p>` },
];
