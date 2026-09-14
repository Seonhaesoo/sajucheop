/* English library articles — Reading the chart. 2026-09-13
 * Worked examples computed with tools/engine.mjs (docs/js/manseryeok.js), English calculator settings
 * (applySolarTime false, tzOffsetMinutes 540):
 *   A. 1984-01-23 16:40 UTC+9 → 癸亥 乙丑 丙辰 丙申, weak 0.2353 (support 2 / 8.5), winter.
 *      Sohan 1984-01-06 12:44 KST (17.16 d before), Ipchun 1984-02-05 00:24 KST (12.32 d after).
 *      Female: forward, daeunsu 4 (丙寅 丁卯 戊辰 己巳 庚午 辛未 壬申 癸酉).
 *      Male: backward, daeunsu 6 (甲子 癸亥 壬戌 辛酉 庚申 己未 戊午 丁巳).
 *   B. 1994-03-19 10:20 UTC+9 → 甲戌 丁卯 甲辰 己巳, balanced 0.3529, elements W3 F2 E3 M0 Wa0.
 * Yearly Ten Gods (2026 丙午, 2027 丁未) match docs/guide/seun-wolun.html. */
export const ARTICLES = [
  { slug: 'ten-gods', cat: 'chart', published: '2026-09-13',
    title: 'The Ten Gods in Saju (BaZi): A Plain-English Guide',
    desc: 'What the Ten Gods mean in Korean saju: how every character relates to your Day Master, the five pairs, a keyword table and a worked example chart.',
    links: [{ href: '/en/', title: 'Find your Ten Gods' }, { href: '/en/guide/', title: 'The 10 Day Masters' }, { href: '/en/guide/day-master-strength/', title: 'Strong or weak Day Master?' }],
    body: `
<p>Your chart comes back with a list: Direct Officer, Seven Killings, Hurting Officer, Eating God. The names sound like the cast of a martial-arts film, and two of them sound like warnings. They aren't. The Ten Gods, called sipseong (십성, 十星) in Korean and also sipsin (십신, 十神), are relationship labels. Each one names how a character in your chart treats you, and "you" is always the same character: your Day Master, the heavenly stem of your birth day.</p>
<p>Once you see the logic, the ten names come down to two questions you can answer in seconds. Below, each Ten God gets plain keywords, and then we read a real chart computed with the same engine that runs our calculator.</p>

<h2>Two questions, ten names</h2>
<p>Every character in a saju chart carries one of the Five Elements (Wood, Fire, Earth, Metal, Water) and a polarity, yang or yin. To name its Ten God, set it next to your Day Master and ask two things.</p>
<p><b>First: how does its element relate to mine?</b> There are only five possibilities, because the elements move in two fixed cycles. In the feeding cycle, Wood feeds Fire, Fire feeds Earth, Earth feeds Metal, Metal feeds Water and Water feeds Wood. In the controlling cycle, Wood controls Earth, Earth controls Water, Water controls Fire, Fire controls Metal and Metal controls Wood. Any other character is therefore my own element, an element I feed, one I control, one that controls me, or one that feeds me.</p>
<p><b>Second: is its polarity the same as mine?</b> Same polarity gives the first name of each pair; opposite polarity gives the second.</p>
<table>
<tr><th>Relationship to the Day Master</th><th>Group</th><th>Same polarity</th><th>Opposite polarity</th></tr>
<tr><td>Same element</td><td>Peers (bigeop, 비겁, 比劫)</td><td>Friend</td><td>Rob Wealth</td></tr>
<tr><td>I feed it</td><td>Output (siksang, 식상, 食傷)</td><td>Eating God</td><td>Hurting Officer</td></tr>
<tr><td>I control it</td><td>Wealth (jaeseong, 재성, 財星)</td><td>Indirect Wealth</td><td>Direct Wealth</td></tr>
<tr><td>It controls me</td><td>Authority (gwanseong, 관성, 官星)</td><td>Seven Killings</td><td>Direct Officer</td></tr>
<tr><td>It feeds me</td><td>Resource (inseong, 인성, 印星)</td><td>Indirect Resource</td><td>Direct Resource</td></tr>
</table>
<p>"Direct" and "indirect" translate the Korean jeong (정, 正) and pyeon (편, 偏). Opposite polarities balance each other, so the old texts called that bond proper; same polarity is one-sided, so they called it partial. Korean readers treat the direct version as the steady, institutional form of an energy and the indirect version as the dynamic, unconventional one. Direct Wealth is a salary and Indirect Wealth is a deal; Direct Officer is promotion through the ranks and Seven Killings is the reputation you earn in a crisis. Neither is better. They are two styles.</p>
<p>Some names explain themselves once you know the rule. Seven Killings, also called the Indirect Officer (pyeongwan, 편관, 偏官) or chilsal (칠살, 七殺), is always the seventh stem counting from your own: Jia to Geng, Yi to Xin, Bing to Ren. Rob Wealth shares your element, so it competes for the Wealth you control. Hurting Officer is the Output that attacks your Direct Officer, the way a sharp tongue attacks a rulebook. And old texts nickname Indirect Resource dosik (도식, 倒食), the overturned rice bowl, because it controls the Eating God.</p>

<h2>The ten at a glance</h2>
<p>Keywords are shorthand, not verdicts. How a Ten God plays out depends on the strength of your Day Master and on what else sits in the chart.</p>
<table>
<tr><th>Ten God</th><th>At work</th><th>In relationships</th><th>When excessive</th></tr>
<tr><td>Friend (bigyeon, 비견, 比肩)</td><td>Independence, running your own show</td><td>A partnership of equals</td><td>Stubbornness, going it alone</td></tr>
<tr><td>Rob Wealth (geopjae, 겁재, 劫財)</td><td>Drive, competition, turnarounds</td><td>Passionate, a little rivalrous</td><td>Impulsive spending, risky partnerships</td></tr>
<tr><td>Eating God (siksin, 식신, 食神)</td><td>Craft, steady output, care work</td><td>Easygoing and generous</td><td>Complacency, indulgence</td></tr>
<tr><td>Hurting Officer (sanggwan, 상관, 傷官)</td><td>Performance, persuasion, innovation</td><td>Witty, needs to be heard</td><td>Sharp words, clashes with bosses</td></tr>
<tr><td>Indirect Wealth (pyeonjae, 편재, 偏財)</td><td>Deals, sales, ventures</td><td>Sociable, openhanded</td><td>Overextension, a gambler's streak</td></tr>
<tr><td>Direct Wealth (jeongjae, 정재, 正財)</td><td>Salary, budgets, careful management</td><td>Loyal and practical</td><td>Tightfistedness, rigidity</td></tr>
<tr><td>Seven Killings (편관 / 칠살)</td><td>Crisis leadership, high-pressure fields</td><td>Intense, protective</td><td>Stress, harshness</td></tr>
<tr><td>Direct Officer (jeonggwan, 정관, 正官)</td><td>Organizations, rank, reputation</td><td>Responsible, faithful</td><td>Rigidity, fear of judgment</td></tr>
<tr><td>Indirect Resource (pyeonin, 편인, 偏印)</td><td>Specialist knowledge, unusual fields</td><td>Needs a meeting of minds</td><td>Isolation, overthinking</td></tr>
<tr><td>Direct Resource (jeongin, 정인, 正印)</td><td>Study, credentials, mentors</td><td>Caring, supportive</td><td>Dependence, passivity</td></tr>
</table>
<p>Two rules of thumb come from Korean practice. Three or more characters from one group make that group a theme of the whole life: a Resource-heavy chart belongs to a learner, an Output-heavy chart to a maker. And a missing Ten God is a blank, not a lack. You can still have the skill; you build it without a default setting, and the theme tends to wake up when a luck pillar brings that Ten God in.</p>

<h2>How to spot them in your own chart</h2>
<ol>
<li><b>Find your Day Master,</b> the top character of the Day Pillar. Everything else is read against it.</li>
<li><b>Label the other stems.</b> Each heavenly stem has one element and one polarity, so it gets one Ten God.</li>
<li><b>Label the branches by their main qi.</b> An earthly branch holds one to three hidden stems, and its Ten God comes from the main one. That is why the Horse (午) counts as Ding Fire rather than Bing Fire. Our guide to <a href="/en/guide/hidden-stems/">hidden stems</a> lists all twelve.</li>
<li><b>Count by group.</b> Seven characters get labels, or five if you don't know your birth time. Which group leads, and which is absent?</li>
<li><b>Note where they sit.</b> The year pillar speaks for roots and early life, the month pillar for career and the social world, the Day Branch for you and your partner, and the hour pillar for later life, children and the results of your work.</li>
</ol>
<p>Because every label is relative, one character means different things to different people. The stem 丙 (Bing, Yang Fire) is a Friend to a Bing Day Master, an Eating God to Jia, Indirect Resource to Wu, Seven Killings to Geng and Indirect Wealth to Ren. So the same Bing Wu year, 2026, reads as a year of expression for a Jia Day Master and a year of pressure for a Geng.</p>

<h2>A worked example</h2>
<p>Take a woman born in Seoul on 23 January 1984 at 4:40 p.m. Ipchun, the saju New Year, didn't arrive until 5 February, so her Year Pillar still belongs to 1983. This is the chart our engine gives, and you can reproduce it on the calculator with the UTC+9 time zone.</p>
<table>
<tr><th>Position</th><th>Character</th><th>Element</th><th>Ten God</th></tr>
<tr><td>Year stem</td><td>癸 Gui</td><td>Yin Water</td><td>Direct Officer</td></tr>
<tr><td>Year branch</td><td>亥 Pig</td><td>Water (main qi 壬, yang)</td><td>Seven Killings</td></tr>
<tr><td>Month stem</td><td>乙 Yi</td><td>Yin Wood</td><td>Direct Resource</td></tr>
<tr><td>Month branch</td><td>丑 Ox</td><td>Earth (main qi 己, yin)</td><td>Hurting Officer</td></tr>
<tr><td>Day stem</td><td>丙 Bing</td><td>Yang Fire</td><td>Day Master</td></tr>
<tr><td>Day branch</td><td>辰 Dragon</td><td>Earth (main qi 戊, yang)</td><td>Eating God</td></tr>
<tr><td>Hour stem</td><td>丙 Bing</td><td>Yang Fire</td><td>Friend</td></tr>
<tr><td>Hour branch</td><td>申 Monkey</td><td>Metal (main qi 庚, yang)</td><td>Indirect Wealth</td></tr>
</table>
<p>Her Day Master is Bing, <a href="/en/guide/day-master/yang-fire/">the Midday Sun</a>, seated on the Dragon: the <a href="/en/guide/day-pillar/bing-chen/">Bing Chen</a> Day Pillar. Seven characters produce seven different Ten Gods, which is unusually varied. Authority and Output have two each; Peers, Wealth and Resource have one each. Rob Wealth, Direct Wealth and Indirect Resource don't appear on the surface.</p>
<p>Reading it means following the relationships. Water, the element that controls Fire, fills the year pillar, and she was born in the Ox month, the depth of winter: a Sun under pressure from structure and expectation. The month stem Yi is Direct Resource, the Wood that feeds Fire, so learning, credentials and mentors are how she turns pressure into fuel. The month branch holds the Hurting Officer, which in the career seat reads as a gift for questioning how things are done. Classical texts flag a Hurting Officer that meets a Direct Officer (sanggwan-gyeongwan, 상관견관, 傷官見官) as friction with rules; a modern reader might call her the insider-critic every organization needs, provided she chooses her words. The Eating God in the Day Branch, the spouse seat, suggests a home built on shared pleasures, and the Friend and Indirect Wealth of the hour pillar point to independent ventures later on.</p>
<p>One more layer sits underneath. Open the branches and Direct Wealth (辛, inside the Ox) and Indirect Resource (甲, inside the Pig) turn up as hidden stems, so neither is truly absent. Rob Wealth appears nowhere, not even hidden. This is also a weak chart, which changes how every Ten God behaves; our guide to <a href="/en/guide/day-master-strength/">Day Master strength</a> scores it step by step.</p>

<h2>The Ten Gods talk to each other</h2>
<p>Because the Ten Gods are built from the element cycles, they inherit them. In the feeding direction, Resource feeds you, you feed Output, Output feeds Wealth, Wealth feeds Authority and Authority feeds Resource. In the controlling direction, Output restrains Authority, Authority restrains Peers, Peers restrain Wealth, Wealth restrains Resource and Resource restrains Output.</p>
<p>This is where readings get their depth. In the example, the Eating God in the Dragon holds back the Seven Killings of the Pig, a pairing the classics praise as siksin-jesal (식신제살, 食神制殺), the Eating God restraining the Killings. Her Direct Resource also stands between the pressure and the self: Water feeds Wood and Wood feeds Fire, so the weight of the year pillar can reach her as support instead of hitting her head-on.</p>
<p>The same logic underlies the traditional family reading, yukchin (육친, 六親): Resource for the mother, Peers for siblings and friends, Indirect Wealth for the father, Wealth for a man's wife, Authority for a woman's husband, Output for a woman's children and Authority for a man's children. Those assignments mirror the households the classics were written in. Sajucheop reads them as roles rather than genders: the person who steadies you, the person you nurture, the person who pushes you.</p>

<h2>Three misreadings to drop</h2>
<ul>
<li><b>"Seven Killings and Hurting Officer are bad luck."</b> They are the most intense Ten Gods, not the worst. Seven Killings is the pressure that forges leaders; Hurting Officer is talent that won't stay quiet. What matters is whether the chart can channel them.</li>
<li><b>"More Wealth means more money."</b> A crowd of Wealth around a weak Day Master can mean more responsibility than resources. Counts describe emphasis, not income.</li>
<li><b>"The Ten Gods never change."</b> Your natal ones don't, but every luck pillar, year and day brings a new character with its own Ten God. That is how saju describes timing, and it is the subject of our guide to <a href="/en/guide/luck-pillars/">luck pillars</a>.</li>
</ul>

<p>To see your own labels, enter your birth date on the <a href="/en/">Sajucheop calculator</a>. The "Ten Gods in your chart" panel counts them for you, and the result links your Day Pillar to its page among the <a href="/en/guide/day-pillar/">60 Day Pillars</a>. The <a href="/en/today/">daily reading</a> builds each day's theme from the Ten God that day's stem brings you, and the <a href="/en/match/">match page</a> shows what two people are to each other in the same language.</p>` },

  { slug: 'hidden-stems', cat: 'chart', published: '2026-09-13',
    title: 'Hidden Stems in Saju: What Each Branch Holds Inside',
    desc: 'Hidden stems (jijanggan) explained: why each earthly branch holds one to three stems, the table for all 12 branches, and how they change your chart.',
    links: [{ href: '/en/', title: 'Cast your chart' }, { href: '/en/guide/day-pillar/', title: 'The 60 Day Pillars' }, { href: '/en/guide/ten-gods/', title: 'The Ten Gods' }],
    body: `
<p>The calculator says your chart has no Metal. Then a saju reader tells you there is Metal hidden in your Dog. Who is right? Both. The eight visible characters are only the surface. Inside each earthly branch sit one to three heavenly stems, the hidden stems: jijanggan (지장간, 支藏干) in Korean, "the stems stored in the branches". Learning to read them is the biggest single step from a beginner's view of a chart to a practitioner's.</p>

<h2>A branch is a month, not a moment</h2>
<p>A heavenly stem is one pure quality. Jia is Yang Wood and nothing else. A branch is different: each of the twelve governs one solar month of the saju calendar, and a month has a beginning, a middle and an end. Korean tables describe that passage with up to three stems.</p>
<ul>
<li><b>Residual qi</b> (yeogi, 여기, 餘氣): the opening days, still colored by the month before.</li>
<li><b>Middle qi</b> (junggi, 중기, 中氣): a passing influence in the middle of the month.</li>
<li><b>Main qi</b> (bongi, 본기, 本氣): the month's own character, which takes over and gives the branch its element.</li>
</ul>
<p>The pattern follows the seasons. The four branches at the heart of a season, the Rat, Rabbit, Horse and Rooster, are the purest; three of them hold only a trace of the previous month plus their main qi. The four that open a season, the Tiger, Snake, Monkey and Pig, carry the element being born there: Bing Fire inside the Tiger, Geng Metal inside the Snake, Ren Water inside the Monkey, Jia Wood inside the Pig. The four that close a season, the Dragon, Goat, Dog and Ox, are storehouses, each holding the element whose season is being put away: Water in the Dragon, Wood in the Goat, Fire in the Dog, Metal in the Ox.</p>

<h2>The twelve branches and their hidden stems</h2>
<p>This is the table Sajucheop uses, in the Korean order from residual to main qi. The rows start with the Tiger because the saju year does: each branch governs the stretch from one jeol (절, 節) solar term to the next, beginning early in the month shown.</p>
<table>
<tr><th>Branch</th><th>Month</th><th>Residual qi</th><th>Middle qi</th><th>Main qi</th></tr>
<tr><td>寅 Tiger</td><td>Feb–Mar</td><td>戊 Wu, Earth</td><td>丙 Bing, Fire</td><td>甲 Jia, Wood</td></tr>
<tr><td>卯 Rabbit</td><td>Mar–Apr</td><td>甲 Jia, Wood</td><td>—</td><td>乙 Yi, Wood</td></tr>
<tr><td>辰 Dragon</td><td>Apr–May</td><td>乙 Yi, Wood</td><td>癸 Gui, Water</td><td>戊 Wu, Earth</td></tr>
<tr><td>巳 Snake</td><td>May–Jun</td><td>戊 Wu, Earth</td><td>庚 Geng, Metal</td><td>丙 Bing, Fire</td></tr>
<tr><td>午 Horse</td><td>Jun–Jul</td><td>丙 Bing, Fire</td><td>己 Ji, Earth</td><td>丁 Ding, Fire</td></tr>
<tr><td>未 Goat</td><td>Jul–Aug</td><td>丁 Ding, Fire</td><td>乙 Yi, Wood</td><td>己 Ji, Earth</td></tr>
<tr><td>申 Monkey</td><td>Aug–Sep</td><td>戊 Wu, Earth</td><td>壬 Ren, Water</td><td>庚 Geng, Metal</td></tr>
<tr><td>酉 Rooster</td><td>Sep–Oct</td><td>庚 Geng, Metal</td><td>—</td><td>辛 Xin, Metal</td></tr>
<tr><td>戌 Dog</td><td>Oct–Nov</td><td>辛 Xin, Metal</td><td>丁 Ding, Fire</td><td>戊 Wu, Earth</td></tr>
<tr><td>亥 Pig</td><td>Nov–Dec</td><td>戊 Wu, Earth</td><td>甲 Jia, Wood</td><td>壬 Ren, Water</td></tr>
<tr><td>子 Rat</td><td>Dec–Jan</td><td>壬 Ren, Water</td><td>—</td><td>癸 Gui, Water</td></tr>
<tr><td>丑 Ox</td><td>Jan–Feb</td><td>癸 Gui, Water</td><td>辛 Xin, Metal</td><td>己 Ji, Earth</td></tr>
</table>
<p>Tables differ a little between schools. Many Chinese BaZi references list a single hidden stem for the Rat, Rabbit and Rooster and two for the Horse and Pig, while Korean month-division tables add a residual qi to each, as above. Older texts go further and give each hidden stem a share of the month's days, and those shares vary from book to book. Sajucheop doesn't weight them: it takes a branch's element and Ten God from the main qi and treats the other stems as secondary. Our guide to <a href="/en/guide/saju-vs-bazi/">saju and BaZi</a> covers other differences between the two traditions.</p>

<h2>How hidden stems change the element count</h2>
<p>Take a chart born in Seoul on 19 March 1994 at 10:20 a.m.: a 甲戌 Jia Xu year, 丁卯 Ding Mao month, 甲辰 Jia Chen day and 己巳 Ji Si hour. The Day Master is Jia, <a href="/en/guide/day-master/yang-wood/">the Tall Pine</a>.</p>
<p>Count the eight visible characters, one element each, and you get what the calculator's Five Elements bar shows: Wood 3, Fire 2, Earth 3, Metal 0, Water 0. Two elements are missing.</p>
<p>Now open the four branches. The Dog (戌) holds 辛 Metal, 丁 Fire and 戊 Earth. The Rabbit (卯) holds 甲 and 乙, both Wood. The Dragon (辰) holds 乙 Wood, 癸 Water and 戊 Earth. The Snake (巳) holds 戊 Earth, 庚 Metal and 丙 Fire. Metal turns up twice and Water once. Neither was missing after all; both were stored out of sight.</p>
<table>
<tr><th>Count</th><th>Wood</th><th>Fire</th><th>Earth</th><th>Metal</th><th>Water</th></tr>
<tr><td>Visible characters (main qi only)</td><td>3</td><td>2</td><td>3</td><td>0</td><td>0</td></tr>
<tr><td>Four stems plus every hidden stem</td><td>5</td><td>3</td><td>4</td><td>2</td><td>1</td></tr>
</table>
<p>Don't read the second row as a new score, though. It counts a residual trace as fully as a main qi, which overstates the minor stems. The fair summary is that this chart is short on Metal and Water but not empty of them. They exist as potential, the kind that tends to surface when a year or a luck pillar brings the same stem into the open.</p>

<h2>How hidden stems change the Ten Gods</h2>
<p>A branch's Ten God comes from its main qi, which is why the calculator lists seven labels for a chart with a birth time. For this Jia Day Master they are Friend (甲), Hurting Officer (丁), Direct Wealth (己), Indirect Wealth twice (the Dog and the Dragon), Rob Wealth (the Rabbit) and Eating God (the Snake). Peers, Output and Wealth are all present. Authority and Resource are not.</p>
<p>The hidden stems supply both. 辛 in the Dog is Direct Officer, 庚 in the Snake is Seven Killings and 癸 in the Dragon is Direct Resource. A reader would say this person has a sense of duty and a capacity for study that don't advertise themselves: real, but held in reserve.</p>
<p>Two more ideas come from the same layer. A Day Master that finds its own element among the hidden stems is said to have roots (tonggeun, 통근, 通根), and roots are a large part of how strength is judged. Here Jia is rooted in the Rabbit, whose stems are pure Wood, and more lightly in the Dragon through its residual 乙. And when a hidden stem also shows up among the heavenly stems, Korean readers call it revealed (tuchul, 투출, 透出): it has both a root and a face, and it tends to act strongly. The 丁 inside the Dog appears as the month stem, so this chart's Hurting Officer is revealed and rooted, one reason expression is among its loudest voices.</p>

<h2>Why the month branch matters most</h2>
<p>If you open only one branch, open the month. It is the season you were born into, which Korean texts call wollyeong (월령, 月令), the command of the month, and it sets the temperature of the whole chart. That is why Sajucheop's strength score counts the month branch double. It is also where classical structure analysis starts. In the method associated with the Qing-era text Ziping Zhenquan (자평진전, 子平眞詮), a chart's structure (gyeokguk, 격국, 格局) is named from the month branch, usually from whichever of its hidden stems is revealed among the heavenly stems.</p>
<p>In our example the month branch is the Rabbit, the peak of spring, and both of its hidden stems are Wood, the Day Master's own element. Jia also stands in the year stem, so the month's Wood is revealed on the surface: a Pine born in its own season. Yet Earth and Fire crowd the rest of the chart, and our quick score calls this Day Master balanced, only just clear of the weak line. Weighing the season against the crowd is the judgment our guide to <a href="/en/guide/day-master-strength/">Day Master strength</a> walks through.</p>

<h2>Reading hidden stems without overdoing it</h2>
<ul>
<li><b>Main qi first.</b> A branch's main qi carries most of its weight; residual and middle qi add color. Two minor Metal stems don't make a chart Metal-rich.</li>
<li><b>Hidden means private, not powerless.</b> Readers often describe hidden Ten Gods as abilities a person keeps in reserve: less visible to others, but available.</li>
<li><b>Timing draws them out.</b> When a luck pillar or year brings a hidden stem into the open, many readers expect its theme to rise. For the example chart, a Metal year would put its hidden Authority on stage.</li>
<li><b>The Day Branch is personal.</b> The hidden stems of your Day Branch describe your inner room and your spouse seat, which is why each of our Day Pillar pages lists them.</li>
</ul>

<p>Cast your chart on the <a href="/en/">calculator</a>, then find each of your four branches in the table above. Your Day Branch has its own page among the <a href="/en/guide/day-pillar/">60 Day Pillars</a>, with every hidden stem, its Ten God and the main qi marked. To put names to what you find, keep the <a href="/en/guide/ten-gods/">Ten Gods guide</a> open alongside.</p>` },

  { slug: 'luck-pillars', cat: 'chart', published: '2026-09-13',
    title: 'Luck Pillars in Saju: How Your 10-Year Cycles Work',
    desc: 'How luck pillars (daeun) work in Korean saju: forward or backward counting, the start age, how to read a decade, and yearly and monthly luck.',
    links: [{ href: '/en/', title: 'Get your Month Pillar' }, { href: '/en/today/', title: "Today's reading" }, { href: '/en/2027/', title: '2027, the Fire Goat year' }],
    body: `
<p>Why does one decade of your life feel like a different climate from the last? Saju answers with luck pillars, daeun (대운, 大運) in Korean: ten-year pillars of two characters that your chart passes through one after another. In Korea you will hear "my daeun has come in" said as if it meant a lottery win. It doesn't. A luck pillar is simply the next season, good or bad, and it changes on schedule. If your natal chart is the vessel you were born with, the luck pillars are the weather it sails through.</p>

<h2>Where luck pillars come from</h2>
<p>Luck pillars grow out of your Month Pillar, the two characters of the solar month you were born in. From there they step through the cycle of sixty stem-and-branch pairs, one step per decade. If your Month Pillar is 乙丑 Yi Chou, the next pillar forward is 丙寅 Bing Yin and the next backward is 甲子 Jia Zi. Each lasts ten years, so a chart usually lists eight, covering about eighty years.</p>
<p>The idea is that life continues the season you were born into. A winter birth moving forward walks into spring; moving backward, it walks into autumn. The natal chart never changes, but the climate around it does.</p>

<h2>Forward or backward</h2>
<p>Direction depends on the polarity of your Year Stem and on your sex. The traditional rule:</p>
<table>
<tr><th>Year Stem</th><th>Men</th><th>Women</th></tr>
<tr><td>Yang: Jia, Bing, Wu, Geng, Ren</td><td>Forward (sunhaeng, 순행, 順行)</td><td>Backward (yeokhaeng, 역행, 逆行)</td></tr>
<tr><td>Yin: Yi, Ding, Ji, Xin, Gui</td><td>Backward</td><td>Forward</td></tr>
</table>
<p>Two details trip people up. The Year Stem is the one in your chart, which changes at Ipchun (입춘, 立春) around 4 February, not on 1 January or at Lunar New Year, so a January birthday usually carries the previous year's stem (see <a href="/en/guide/ipchun-year-boundary/">why the saju year starts at Ipchun</a>). And because the rule is written in terms of sex, twins of different sexes can share all eight characters yet travel in opposite directions. The classical rule is binary, and there is no settled convention for people it doesn't describe.</p>

<h2>When your first luck pillar starts</h2>
<p>The first luck pillar doesn't begin at birth. Its starting age, the daeunsu (대운수, 大運數), comes from a neat piece of arithmetic.</p>
<ol>
<li>If you count forward, measure the time from your birth to the next jeol (절, 節), one of the twelve solar terms that open each saju month. If you count backward, measure back to the previous jeol.</li>
<li>Divide the number of days by three. Three days equal one year.</li>
<li>Round to the nearest whole year. Sajucheop keeps the result between 1 and 10.</li>
</ol>
<p>Why three days? A solar month of about thirty days stands for one ten-year luck pillar, so three days stand for a year. The classical conversion goes finer, with one day worth four months, but everyday Korean charts print the rounded number. Born nine days before the next term and counting forward? Your first luck pillar starts at 3, the next ones at 13, 23, 33 and so on.</p>
<p>One convention matters when you match a pillar to a calendar year. Korean charts may label these ages in the traditional Korean count, in which a baby is one at birth and everyone gains a year on New Year's Day. Sajucheop's Korean chart does: a pillar marked 44 starts in the calendar year you turn 43. Other charts may use international age, so check which count a chart uses.</p>

<h2>A worked example: twins, two directions</h2>
<p>Take a chart born in Seoul on 23 January 1984 at 4:40 p.m.: year 癸亥 Gui Hai, month 乙丑 Yi Chou, day 丙辰 Bing Chen, hour 丙申 Bing Shen. The Day Master is Bing, <a href="/en/guide/day-master/yang-fire/">the Midday Sun</a>, born in deep winter, and it is a weak chart with Water pressing on the Fire; our <a href="/en/guide/ten-gods/">Ten Gods guide</a> reads it in detail. The Year Stem, Gui, is yin.</p>
<p>Our engine places the birth 17.2 days after the previous jeol, Sohan ("Minor Cold", 6 January), and 12.3 days before the next, Ipchun (just after midnight on 5 February, Korea time). A girl counts forward: 12.3 ÷ 3 ≈ 4.1, so her first luck pillar starts at 4. A twin brother born in the same hour counts backward: 17.2 ÷ 3 ≈ 5.7, so his starts at 6.</p>
<table>
<tr><th>Her ages</th><th>Her pillar</th><th>Ten Gods (stem / branch)</th><th>His ages</th><th>His pillar</th><th>Ten Gods (stem / branch)</th></tr>
<tr><td>4–13</td><td>丙寅</td><td>Friend / Indirect Resource</td><td>6–15</td><td>甲子</td><td>Indirect Resource / Direct Officer</td></tr>
<tr><td>14–23</td><td>丁卯</td><td>Rob Wealth / Direct Resource</td><td>16–25</td><td>癸亥</td><td>Direct Officer / Seven Killings</td></tr>
<tr><td>24–33</td><td>戊辰</td><td>Eating God / Eating God</td><td>26–35</td><td>壬戌</td><td>Seven Killings / Eating God</td></tr>
<tr><td>34–43</td><td>己巳</td><td>Hurting Officer / Friend</td><td>36–45</td><td>辛酉</td><td>Direct Wealth / Direct Wealth</td></tr>
<tr><td>44–53</td><td>庚午</td><td>Indirect Wealth / Rob Wealth</td><td>46–55</td><td>庚申</td><td>Indirect Wealth / Indirect Wealth</td></tr>
<tr><td>54–63</td><td>辛未</td><td>Direct Wealth / Hurting Officer</td><td>56–65</td><td>己未</td><td>Hurting Officer / Hurting Officer</td></tr>
</table>
<p>Same chart, two lives. Her decades walk out of winter through the Tiger, Rabbit and Dragon of spring into the Snake, Horse and Goat of summer. For a cold, weak Sun, the Wood and Fire of her first two pillars are fuel and warmth, and the Snake, Horse and Goat bring summer heat. His decades walk back through the Rat and the Pig into the Dog, Rooster and Monkey of autumn, with Water and Metal in the lead. By the balancing logic, his middle decades ask more of a weak Day Master: Wealth decades that bring opportunity along with a heavier load. That is not a verdict. It is a reason, in his thirties and forties, to build support (skills, allies, credentials) before expanding.</p>

<h2>How to read a luck pillar against your chart</h2>
<ol>
<li><b>Name its Ten Gods.</b> The stem and the branch's main qi set the decade's theme. Resource decades favor study and credentials, Output decades making and showing, Wealth decades money and a wider field, Authority decades responsibility and rank, Peer decades independence and competition.</li>
<li><b>Check the branch against your natal branches.</b> A six-harmony such as 辰 with 酉 lets a decade blend in; a clash such as 子 against 午 or 辰 against 戌 brings moves and change, especially when it hits your Day Branch or Month Branch.</li>
<li><b>Weigh it against strength.</b> A strong Day Master usually does well in Output, Wealth and Authority decades, a weak one in Resource and Peer decades. That is the logic behind the luck graph on Sajucheop's Korean chart, and our <a href="/en/guide/useful-god/">useful god guide</a> refines it.</li>
<li><b>Give the branch its due.</b> A common teaching holds that a luck pillar's branch outweighs its stem, because branches carry the seasons, and Sajucheop's luck graph weights it that way. Splitting a decade into a stem half and a branch half is a popular rule of thumb, not a law, so read the two together.</li>
</ol>
<p>Korean readers also watch the handover years, gyoungi (교운기, 交運期), and expect some turbulence around them, the way weather is unsettled between seasons.</p>

<h2>Years and months inside the decade</h2>
<p>Luck pillars set the season; faster layers set the weather. The yearly pillar, seun (세운, 歲運), changes at Ipchun. The monthly pillar, wolun (월운, 月運), changes at each jeol rather than on the first of the month, and the daily pillar, iljin (일진, 日辰), changes at midnight. Read them in the same order: the stem's Ten God gives the theme, the branch shows where it lands, and harmony or clash with your Day Branch tells you how smoothly. The luck pillar is the stage; the year is what happens on it.</p>
<table>
<tr><th>Day Master</th><th>2026 丙午 (stem / branch)</th><th>2027 丁未 (stem / branch)</th></tr>
<tr><td>Jia</td><td>Eating God / Hurting Officer</td><td>Hurting Officer / Direct Wealth</td></tr>
<tr><td>Yi</td><td>Hurting Officer / Eating God</td><td>Eating God / Indirect Wealth</td></tr>
<tr><td>Bing</td><td>Friend / Rob Wealth</td><td>Rob Wealth / Hurting Officer</td></tr>
<tr><td>Ding</td><td>Rob Wealth / Friend</td><td>Friend / Eating God</td></tr>
<tr><td>Wu</td><td>Indirect Resource / Direct Resource</td><td>Direct Resource / Rob Wealth</td></tr>
<tr><td>Ji</td><td>Direct Resource / Indirect Resource</td><td>Indirect Resource / Friend</td></tr>
<tr><td>Geng</td><td>Seven Killings / Direct Officer</td><td>Direct Officer / Direct Resource</td></tr>
<tr><td>Xin</td><td>Direct Officer / Seven Killings</td><td>Seven Killings / Indirect Resource</td></tr>
<tr><td>Ren</td><td>Indirect Wealth / Direct Wealth</td><td>Direct Wealth / Direct Officer</td></tr>
<tr><td>Gui</td><td>Direct Wealth / Indirect Wealth</td><td>Indirect Wealth / Seven Killings</td></tr>
</table>
<p>The Ding Wei year begins at Ipchun, on the morning of 4 February 2027, Korea time. For our example woman, 2026 is a Peers year that props up her Fire. The month that opened at Baengno ("White Dew", 7 September 2026) is 丁酉 Ding You, whose Rooster forms a six-harmony with her Dragon Day Branch. The next, 戊戌 Wu Xu from Hallo ("Cold Dew", 8 October), brings the Dog, which clashes with that Dragon: a month for double-checking commitments, not for fear. And by the Korean count, her fifth luck pillar, 庚午, opens in 2027.</p>

<p>The English calculator doesn't list luck pillars, but it gives you the two facts this method starts from: your Year Stem and your Month Pillar. Cast your chart on the <a href="/en/">calculator</a>, choose your direction from the table above, and count the days to the right jeol (each falls early in the month, usually between the 4th and the 8th). For the faster layers, the <a href="/en/today/">daily reading</a> tracks each day's pillar against your chart, and the <a href="/en/2027/">2027 Fire Goat forecast</a> lists every month of the coming year.</p>` },

  { slug: 'day-master-strength', cat: 'chart', published: '2026-09-13',
    title: 'Strong or Weak Day Master? How Saju Measures Strength',
    desc: 'What a strong or weak Day Master means in Korean saju: season, roots and support, a simple scoring walk-through, and what each tendency implies.',
    links: [{ href: '/en/', title: 'Check your Day Master strength' }, { href: '/en/guide/useful-god/', title: 'Find your useful god' }, { href: '/en/guide/', title: 'The 10 Day Masters' }],
    body: `
<p>Your chart says "a gentle Day Master", and you wonder whether that is a polite way of saying weak. It is, and it is nothing to worry about. Singang (신강, 身強) and sinyak (신약, 身弱), strong and weak, describe how much support your Day Master gets from the rest of the chart. Treat the verdict as a user's manual, not a grade: the same Midday Sun can blaze at noon in July or glow through winter cloud, and each version needs different handling.</p>

<h2>What "strength" measures</h2>
<p>Your Day Master is one of eight characters. The other seven either help it or take from it, and the Ten Gods tell you which.</p>
<ul>
<li><b>Helpers:</b> Peers, which share your element, and Resource, the element that feeds you.</li>
<li><b>Drains:</b> Output, which you feed; Wealth, which costs energy to control; and Authority, which controls you.</li>
</ul>
<p>When helpers dominate, the Day Master is strong. When drains dominate, it is weak. When they roughly match, Korean readers call it junghwa (중화, 中和), balanced. None of these is a virtue. A strong chart has plenty of fuel and needs somewhere to spend it; a weak chart is sensitive and receptive and needs a steady supply. Trouble comes from imbalance in either direction, which is why the next step in a reading, the useful god, is chosen to correct it.</p>

<h2>The three things readers check</h2>
<p>Korean teachers often frame the judgment as three gains. A Day Master that has two or three of them usually leans strong.</p>
<ul>
<li><b>Holding the season</b> (deungnyeong, 득령, 得令). The month branch is the season of your birth and weighs more than any other character. A Wood Day Master born in the Tiger or Rabbit month, the heart of spring, has the season on its side, and many readers extend that to a birth month of its Resource element.</li>
<li><b>Holding ground</b> (deukji, 득지, 得地). Does the Day Master have roots in the branches, above all in the Day Branch it sits on? Roots count through hidden stems (tonggeun, 통근, 通根): a Jia Day Master is rooted in any branch that hides Jia or Yi.</li>
<li><b>Holding numbers</b> (deukse, 득세, 得勢). How many of the remaining characters are Peers or Resource?</li>
</ul>
<p>Practitioners add refinements. A helper stem that also has a root below it (a revealed stem, or tuchul) counts for more; a combination can tie up a helper; a clash can shake a root loose. Schools differ on how to weigh all of this. Some teachers use point tables, others judge by eye, and a borderline chart can get different verdicts from different readers.</p>

<h2>A simple scoring walk-through</h2>
<p>Sajucheop's calculator uses a transparent quick score built on the same three ideas. Each of the seven characters around the Day Master is worth one point, except the month branch, worth two for the season, and the Day Branch, worth one and a half for the ground you sit on. Add up the points held by helpers and divide by the total: 8.5 with a birth time, 6.5 without. At 55 percent or more the chart is strong, at 35 percent or less it is weak, and anything between is balanced. Branches count by their own element, which is always the element of their main qi.</p>
<p>Here it is for a chart born in Seoul on 23 January 1984 at 4:40 p.m., whose Day Master is Bing, <a href="/en/guide/day-master/yang-fire/">the Midday Sun</a>. Helpers for Fire are Fire itself and Wood, which feeds it.</p>
<table>
<tr><th>Position</th><th>Character</th><th>Element</th><th>Weight</th><th>Helps Bing?</th><th>Points</th></tr>
<tr><td>Year stem</td><td>癸 Gui</td><td>Water</td><td>1</td><td>No: Water controls Fire</td><td>0</td></tr>
<tr><td>Year branch</td><td>亥 Pig</td><td>Water</td><td>1</td><td>No</td><td>0</td></tr>
<tr><td>Month stem</td><td>乙 Yi</td><td>Wood</td><td>1</td><td>Yes: Wood feeds Fire</td><td>1</td></tr>
<tr><td>Month branch</td><td>丑 Ox</td><td>Earth</td><td>2</td><td>No: Fire feeds Earth</td><td>0</td></tr>
<tr><td>Day branch</td><td>辰 Dragon</td><td>Earth</td><td>1.5</td><td>No</td><td>0</td></tr>
<tr><td>Hour stem</td><td>丙 Bing</td><td>Fire</td><td>1</td><td>Yes: same element</td><td>1</td></tr>
<tr><td>Hour branch</td><td>申 Monkey</td><td>Metal</td><td>1</td><td>No: Fire controls Metal</td><td>0</td></tr>
<tr><td>Total</td><td></td><td></td><td>8.5</td><td></td><td>2</td></tr>
</table>
<p>Two points out of 8.5 is about 24 percent, well under the 35 percent line, so the calculator calls this a gentle, or weak, Day Master. Without the birth time the score would be 1 out of 6.5, weaker still. If your own result sits near a line and you don't know your birth time, treat it as provisional: the hour pillar adds two characters and can tip it either way.</p>
<p>The traditional check agrees. The season is against her: the Ox month is deep winter, when Water rules and Fire is out of season. Her ground is thin, because no branch in the chart hides any Fire at all; the Sun has only traces of Wood to lean on, 甲 in the Pig and 乙 in the Dragon. Her numbers are thin too, two helpers among seven. And none of her four branches is a Official or Prosperity position for Bing in the twelve stages. By the usual methods, this Sun is clearly weak.</p>

<h2>Where a quick score can miss</h2>
<p>A quick score is a starting point. It skips several things a careful reader weighs.</p>
<ul>
<li><b>Hidden roots.</b> The score counts a branch by its main qi only. A Yi Wood Day Master surrounded by the Dragon and the Goat looks rootless, yet both branches hide Yi.</li>
<li><b>Combinations and clashes.</b> Two stems can combine and stop helping; a clash can loosen the root a Day Master relied on.</li>
<li><b>Special structures.</b> When one force overwhelms a chart, many schools stop counting. In a follow structure (jonggyeok, 종격, 從格) a very weak Day Master is read as yielding to the dominant element; in a dominant-element structure (jeonwang, 전왕, 專旺) one element fills nearly everything. The usual advice then flips, and whether a chart qualifies is among the most argued questions in saju.</li>
</ul>
<p>Borderline charts show the limits most clearly. Take someone born on 19 March 1994 at 10:20 a.m.: a Jia Wood Day Master in the Rabbit month, the peak of Wood's own season. The season is fully on its side, yet Earth and Fire crowd the other characters, and the quick score lands at 35.3 percent, balanced by a hair. A reader who leans on the season would call it strong; one who counts the crowd would call it weak. Both are reading the same chart honestly, which is why a good reader explains the reasoning rather than just the label.</p>

<h2>What each tendency implies</h2>
<table>
<tr><th>Tendency</th><th>Typical temperament</th><th>What tends to help</th></tr>
<tr><td>Strong</td><td>Self-propelled, persistent, sometimes stubborn</td><td>Spending energy: expressing (Output), earning (Wealth), taking responsibility (Authority)</td></tr>
<tr><td>Balanced</td><td>Flexible and adaptable</td><td>Most environments; the main task is not to overload one side</td></tr>
<tr><td>Weak</td><td>Sensitive, receptive, tires when isolated</td><td>Refilling: study and credentials (Resource), allies and teams (Peers)</td></tr>
</table>
<p>A strong chart kept idle gets restless, and a weak chart that takes on everything burns out. Strength also decides how Korean readers judge timing. The same Wealth year that feels like a harvest to a strong Day Master can feel like a heavy load to a weak one, while a Resource year that bores the strong chart restores the weak. Every Day Master page in <a href="/en/guide/">our library</a> describes a strong, a balanced and a weak version of its archetype, because the difference is that large.</p>
<p>The same logic carries into daily life. At work, strong charts tend to do best with room to lead and a real target to push against; weak charts do best inside good systems, teams and mentorships, where support is built in. In relationships, a strong chart often wants a partner who can push back, and a weak one a partner who steadies.</p>
<p>Strength also moves with time, even though the natal verdict doesn't. A luck pillar or year rich in Resource and Peers tops up a weak Day Master; one rich in Output, Wealth and Authority draws a strong one down. The woman in our example is a case in point. Her first two luck pillars, 丙寅 and 丁卯, brought the Fire and Wood her chart lacks, and a year like 2026, a Bing Wu year of Peers, lends her Fire for twelve months. So readers ask two questions, not one: how strong is the chart, and how strong is it right now?</p>

<h2>From strength to the useful god</h2>
<p>Strength is the diagnosis; the useful god, yongsin (용신, 用神), is the prescription. In the most common method, a strong Day Master finds its useful element among Output, Wealth and Authority, and a weak one among Resource and Peers. For the winter-born Sun above, the season adds a second voice: she needs warmth as well as support, and Wood and Fire answer both. How practitioners choose, and why they sometimes disagree, is the subject of our guide to <a href="/en/guide/useful-god/">the useful god</a>.</p>

<p>To see your own verdict, enter your birth date on the <a href="/en/">Sajucheop calculator</a>; the line under your Day Master's description says whether it is strong, balanced or gentle. Then open your Day Master's page in <a href="/en/guide/">the library</a> for the version of your archetype that fits, and read <a href="/en/guide/ten-gods/">the Ten Gods guide</a> to see which helpers and drains your chart contains.</p>` },

  { slug: 'useful-god', cat: 'chart', published: '2026-09-13',
    title: 'The Useful God in Saju: Finding the Element You Need',
    desc: 'The useful god (yongsin) explained: how saju readers find the element your chart needs, the main methods, a worked example, and how Koreans use it.',
    links: [{ href: '/en/', title: 'See your element balance' }, { href: '/en/guide/day-master-strength/', title: 'Strong or weak Day Master?' }, { href: '/en/match/', title: 'Check a match' }],
    body: `
<p>A saju reader tells you, "Your useful god is Water, so wear black." What does that actually mean, and should you rebuild your wardrobe? The useful god, yongsin (용신, 用神), literally the spirit put to use, is the element that does the most to correct the imbalance in your chart. It is the closest thing saju has to a prescription, and it is also the concept practitioners argue about most. Here is how it is found, how Koreans use it, and where its limits lie.</p>

<h2>A prescription for balance</h2>
<p>Saju prizes balance. If Fire runs too hot, the chart wants Water; if Earth is thin, it wants Earth. The one element that brings the chart closest to equilibrium is its useful god. Knowing it tells you two things: what your natal chart has in excess or in short supply, and which stretches of time are likely to feel like a tailwind, because luck pillars and years that bring the useful element are read as favorable.</p>
<p>Once the useful god is set, the other four elements get roles through the element cycles. The most common scheme looks like this:</p>
<table>
<tr><th>Role</th><th>Definition</th><th>If the useful god is Water</th></tr>
<tr><td>Useful god (yongsin, 용신, 用神)</td><td>The element the chart needs most</td><td>Water</td></tr>
<tr><td>Favorable (huisin, 희신, 喜神)</td><td>Feeds the useful god</td><td>Metal</td></tr>
<tr><td>Unfavorable (gisin, 기신, 忌神)</td><td>Controls the useful god</td><td>Earth</td></tr>
<tr><td>Enemy (gusin, 구신, 仇神)</td><td>Feeds the unfavorable element</td><td>Fire</td></tr>
<tr><td>Idle (hansin, 한신, 閑神)</td><td>The one left over</td><td>Wood</td></tr>
</table>
<p>In practice many readers simplify to two sides. For a weak chart, Resource and Peers form the helpful side and Output, Wealth and Authority the burdensome side; for a strong chart it is the reverse. The idle element is where schools diverge most.</p>

<h2>The main ways to find it</h2>
<p><b>Balancing strength</b> (eokbu, 억부, 抑扶, "restrain and support") is the most widely used method. First judge whether the Day Master is strong or weak. A strong one needs its energy spent or checked, so the useful god comes from Output, Wealth or Authority; a weak one needs support, so it comes from Resource or Peers. Within those groups, readers choose by what is overflowing. A strong chart swollen with Resource looks first to Wealth, which controls Resource; one crowded with Peers looks to Authority to discipline them or Output to drain them.</p>
<table>
<tr><th>Day Master</th><th>Look among</th><th>For a Jia (Yang Wood) Day Master</th></tr>
<tr><td>Strong</td><td>Output, Wealth, Authority</td><td>Fire, Earth, Metal</td></tr>
<tr><td>Weak</td><td>Resource, Peers</td><td>Water, Wood</td></tr>
</table>
<p><b>Seasonal adjustment</b> (johu, 조후, 調候, "regulating the climate") asks about temperature before strength. A chart born in the Pig, Rat or Ox months of winter is cold and wants Fire; one born in the Snake, Horse or Goat months of summer is hot and dry and wants Water. The Qing-era classic Qiongtong Baojian (궁통보감, 窮通寶鑑), arranged Day Master by Day Master and month by month, is the text usually cited for this method. The two methods can collide. A weak Geng Metal born in high summer needs Earth or Metal by balancing but Water by climate, and Water drains Geng. Some readers resolve it with damp Earth such as the Ox or the Dragon, which feeds Metal and cools the heat at once; which method should lead is argued school by school.</p>
<p><b>Mediation</b> (tonggwan, 통관, 通關) applies when two strong forces are locked in a standoff: the useful god is the element that connects them. Metal against Wood is bridged by Water, which Metal feeds and which feeds Wood; Water against Fire is bridged by Wood.</p>
<p><b>Disease and medicine</b> (byeongyak, 병약, 病藥) names the character doing the most harm as the disease and its cure as the useful god. <b>Following the dominant element</b> (jeonwang, 전왕, 專旺) applies when one element fills a chart so completely that resisting it makes no sense, and the useful god becomes that element or the one it flows into. This last reading reverses the balancing method, which is why it is the most disputed.</p>
<p>The word itself carries more than one meaning. The Qing-dynasty text Ziping Zhenquan (자평진전, 子平眞詮) uses "useful god" for the key element of a chart's structure, named from the month branch, which is not quite the modern sense of "the element you need".</p>

<h2>A worked example: when the methods agree</h2>
<p>Take a chart born in Seoul on 23 January 1984 at 4:40 p.m.: year 癸亥, month 乙丑, day 丙辰, hour 丙申. The Day Master is Bing Fire, <a href="/en/guide/day-master/yang-fire/">the Midday Sun</a>. Our <a href="/en/guide/day-master-strength/">strength guide</a> scores it weak, at 2 points out of 8.5, and Water, the element that controls Fire, is everywhere: 癸 and 亥 on the surface, and 壬 or 癸 hidden in all four branches.</p>
<ul>
<li><b>Balancing</b> says a weak Day Master needs Resource or Peers: Wood or Fire.</li>
<li><b>Climate</b> says a winter chart needs warmth: Fire first, with Wood to keep it burning.</li>
<li><b>Mediation</b> says Water and Fire are at odds and Wood bridges them. Water feeds Wood and Wood feeds Fire, so the pressure of the year pillar becomes fuel instead of a threat.</li>
</ul>
<p>When three methods point the same way, a reader can be confident. The natural reading names Wood as her useful god, with Fire as its partner and Water as the element to manage rather than add. Someone might argue for Earth, which dams Water in the classic pattern of the Eating God restraining the Killings, but Earth also drains a Fire that is already weak, so the balancing method ranks it lower. That is what disagreement looks like in practice: reasoned trade-offs, not guesses. Her luck pillars run forward into spring and summer, which the same logic reads as largely supportive; our <a href="/en/guide/luck-pillars/">luck pillars guide</a> lays them out.</p>

<h2>How Koreans use it day to day</h2>
<p>Each element traditionally carries a color, a direction and a pair of numbers, the numbers taken from the River Map (Hado, 하도, 河圖). Bringing your useful element into daily life in these forms is what Koreans usually mean by using your yongsin.</p>
<table>
<tr><th>Element</th><th>Color</th><th>Direction</th><th>Numbers</th><th>Fields often suggested</th></tr>
<tr><td>Wood</td><td>Green, blue-green</td><td>East</td><td>3, 8</td><td>Education, publishing, design, plants</td></tr>
<tr><td>Fire</td><td>Red</td><td>South</td><td>2, 7</td><td>Media, performance, energy, electronics</td></tr>
<tr><td>Earth</td><td>Yellow, beige</td><td>Center</td><td>5, 10</td><td>Real estate, agriculture, mediation</td></tr>
<tr><td>Metal</td><td>White, silver</td><td>West</td><td>4, 9</td><td>Finance, law, engineering, precision work</td></tr>
<tr><td>Water</td><td>Black, navy</td><td>North</td><td>1, 6</td><td>Trade, logistics, research, travel</td></tr>
</table>
<ul>
<li><b>Colors and objects.</b> A wallet, a scarf, a plant on the desk for Wood. Treat them as reminders of the quality you are cultivating, not as switches for luck.</li>
<li><b>Direction.</b> Some people weigh the direction of a move, a school or a desk. It is folk practice, pleasant when it costs nothing.</li>
<li><b>Work.</b> The fields column reflects common associations, not rules. The quality of the element, such as Water's flow or Metal's precision, matters more than the literal industry.</li>
<li><b>Names.</b> Korean naming houses (jakmyeongso, 작명소, 作名所) often choose hanja whose radical carries the useful element, such as the water radical 氵 for a chart that needs Water, drawing on the list of characters Korea permits in personal names.</li>
<li><b>Timing.</b> The most practical use of all: note which years and luck pillars bring your useful element, and plan big pushes for those stretches.</li>
</ul>
<p>Sajucheop's Korean daily reading uses the balancing split for its lucky color and direction: weak charts get a Resource or Peer element, other charts an Output, Wealth or Authority element, rotating by day. It is a light daily version of the idea rather than a full useful-god judgment.</p>

<h2>Limits worth keeping in mind</h2>
<ul>
<li><b>A missing element is not automatically your useful god.</b> Sometimes the missing element is exactly what a chart should avoid. Need is judged by balance, not by counting.</li>
<li><b>Different methods give different answers.</b> If two readers name different useful gods, ask each for the reasoning; usually they are applying different methods, not making mistakes. Some also reassess the useful god as luck pillars shift the balance, while others keep one for life.</li>
<li><b>Colors and directions are symbols, not proven remedies.</b> Enjoy them as habits, and don't pay large sums for talismans or objects sold as fixes.</li>
<li><b>A useful god absent from your chart is not a flaw.</b> It means the help arrives from outside, through the right people, places and years.</li>
</ul>

<p>Start with your own balance. The <a href="/en/">Sajucheop calculator</a> shows your Five Elements count and whether your Day Master is strong, balanced or gentle, the two facts the balancing method needs. The <a href="/en/match/">match page</a> checks a simpler cousin of the idea, whether two charts fill each other's missing elements, and <a href="/en/guide/five-elements-balance/">our Five Elements guide</a> explains the cycles behind every step above.</p>` },
];
