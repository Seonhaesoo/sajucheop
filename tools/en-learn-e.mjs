/* English library articles — the special stars (sinsal, 神殺). 2026-09-15
 * Adapted from the Korean library: tools/guide-extra-a.mjs (yeokmasal, hwagaesal, goegangsal, yanginsal)
 * and tools/guide-extra-b.mjs (cheoneul-gwiin, gongmang, baekhosal, wonjinsal). Rule tables are identical to the Korean ones.
 * Solar-term dates (KST) from tools/solar-terms-data.mjs: 2026 Ipchun 02-04, Gyeongchip 03-05, Cheongmyeong 04-05, Ipha 05-05,
 * Mangjong 06-06, Soseo 07-07, Ipchu 08-07, Baengno 09-07, Hallo 10-08, Ipdong 11-07, Daeseol 12-07, Sohan 2027-01-05;
 * 2027 Ipchun 02-04, Gyeongchip 03-06, Cheongmyeong 04-05, Ipha 05-06, Mangjong 06-06, Soseo 07-07, Ipchu 08-08, Baengno 09-08,
 * Hallo 10-08, Ipdong 11-08 (00:39), Daeseol 12-07, Sohan 2028-01-06; 2028 Ipchun 02-04, Cheongmyeong 04-04, Ipha 05-05,
 * Mangjong 06-05, Soseo 07-06, Ipchu 08-07, Baengno 09-07, Hallo 10-08, Ipdong 11-07, Daeseol 12-06.
 * Month pillars: 2026 庚寅…辛丑, 2027 壬寅…癸丑, 2028 甲寅…乙丑. cat 'stars' must be added to CATS in en-learn.mjs. */
export const ARTICLES = [
  { slug: 'nobleman-star', cat: 'stars', published: '2026-09-15',
    title: 'Nobleman Star (Tian Yi Gui Ren) in Saju: Table and Meaning',
    desc: 'How to find the Nobleman Star (cheoneul gwiin, Tian Yi Gui Ren) from your Day Master: the ten-stem table, its meaning in each pillar, and when it arrives.',
    links: [{ href: '/en/', title: 'Find your Day Master' }, { href: '/en/guide/day-pillar/ding-hai/', title: 'Ding Hai, a day Nobleman pillar' }, { href: '/en/guide/peach-blossom/', title: 'Peach Blossom and the special stars' }],
    body: `
<p>When a Korean reader says your chart "has a gwiin," you are meant to feel relieved. The word means a noble person, someone who helps, and the star it refers to is the first thing many readers look for after the Day Master. Its full name is <strong>cheoneul gwiin</strong> (천을귀인, 天乙貴人), Tian Yi Gui Ren in Chinese, usually translated as the Nobleman Star or simply the Nobleman. This guide explains where the name comes from, gives the lookup table for all ten Day Masters and shows how Korean readers use the star today, which is less as a lucky charm and more as a description of how help reaches you.</p>

<h2>What the Nobleman Star is</h2>
<p>Beyond the Five Elements and the <a href="/en/guide/ten-gods/">Ten Gods</a>, saju keeps a catalog of named patterns called sinsal (신살, 神殺), the special stars; Chinese BaZi calls them shensha (神煞). Each star is a specific meeting of characters, and each has a reputation. The ones read as favorable are gilsin (길신, 吉神), the ones read with caution hyungsal (흉살, 凶煞). Among the favorable stars the Nobleman ranks first, and it is the one a traditional reader mentions before any other.</p>
<p>The name is old. Tian Yi (天乙) was a title for the highest of the heavenly spirits, the one that sat closest to the celestial emperor, and gui ren (貴人) is a person of rank, a patron. In the classical texts a chart with the Nobleman meets trouble and finds a hand extended: an official who speaks up, a stranger who knows the way. Modern Korean readers keep the idea but translate it. The Nobleman is "people luck" (인복), and also a temperament: the ability to ask for help, accept it and pass it on. The helper can be a person, but it can just as well be a good institution, a timely piece of information or an opportunity that arrives through someone else.</p>

<h2>The table: Nobleman branches by Day Master</h2>
<p>The Nobleman is found <strong>from your Day Master</strong>, the heavenly stem of your birth day, and it appears as an earthly branch. Tradition also runs the same lookup from the year stem as a second base, but the day stem comes first. Each Day Master has two Nobleman branches.</p>
<table>
<tr><th>Day Master (or year stem)</th><th>Nobleman branches</th><th>Animals</th></tr>
<tr><td>甲 Jia · 戊 Wu · 庚 Geng</td><td>丑 Chou · 未 Wei</td><td>Ox, Goat</td></tr>
<tr><td>乙 Yi · 己 Ji</td><td>子 Zi · 申 Shen</td><td>Rat, Monkey</td></tr>
<tr><td>丙 Bing · 丁 Ding</td><td>亥 Hai · 酉 You</td><td>Pig, Rooster</td></tr>
<tr><td>辛 Xin</td><td>寅 Yin · 午 Wu</td><td>Tiger, Horse</td></tr>
<tr><td>壬 Ren · 癸 Gui</td><td>巳 Si · 卯 Mao</td><td>Snake, Rabbit</td></tr>
</table>
<p>Students once memorized this as a rhyme about animals: 甲戊庚牛羊 (Jia, Wu and Geng, the ox and the goat), 乙己鼠猴鄉 (Yi and Ji, the home of the rat and the monkey), 丙丁猪鷄位 (Bing and Ding, the seats of the pig and the rooster), 壬癸兎蛇藏 (Ren and Gui, where the rabbit and the snake hide), 六辛逢馬虎 (the Xin days meet the horse and the tiger).</p>
<p>Finding yours takes three steps.</p>
<ol>
<li><strong>Find your Day Master.</strong> Cast your chart on the <a href="/en/">calculator</a>; the Day Master is the top character of the day pillar.</li>
<li><strong>Read its two Nobleman branches</strong> from the table.</li>
<li><strong>Look for those branches</strong> among your four earthly branches: year, month, day and hour. Then repeat the lookup once more with your year stem as the base.</li>
</ol>
<p>Schools differ on a few points. One version of the rhyme pairs 庚 Geng with 辛 Xin and gives it the Tiger and the Horse; another divides the two branches into a daytime Nobleman and a nighttime Nobleman and weighs one of them more heavily depending on the hour of birth. Sajucheop follows the most widely used rule, with Jia, Wu and Geng on the Ox and the Goat. Look at the table for a moment and you will also notice that 辰 (Dragon) and 戌 (Dog) appear nowhere. The classics say it plainly: the Nobleman does not rest at the Dragon or the Dog, the two branches that carry the <a href="/en/guide/kui-gang/">Kui Gang</a>, which the old texts thought too harsh a place for a courteous star.</p>

<h2>Four day pillars that sit on their own Nobleman</h2>
<p>Of the sixty day pillars, only four carry a Nobleman in their own day branch, the spouse seat: <a href="/en/guide/day-pillar/ding-hai/">Ding Hai (丁亥)</a>, <a href="/en/guide/day-pillar/ding-you/">Ding You (丁酉)</a>, <a href="/en/guide/day-pillar/gui-si/">Gui Si (癸巳)</a> and <a href="/en/guide/day-pillar/gui-mao/">Gui Mao (癸卯)</a>. The reason is arithmetic. In the sixty-pillar cycle a yang stem (甲丙戊庚壬) only ever pairs with a yang branch (子寅辰午申戌), and a yin stem (乙丁己辛癸) only with a yin branch (丑卯巳未酉亥). The Nobleman branches of the five yang stems are all yin, so none of them can sit under its own stem; the Nobleman branches of Yi, Ji and Xin are all yang, so the same applies. Only Ding and Gui use yin branches, and that leaves four pillars.</p>
<p>The classics treated these four as a category of their own, ilgwi (일귀, 日貴), the "day Nobleman," and read them as people whose help comes from those closest to them, and who hold themselves to a certain dignity in return. One pillar never describes a whole person, so read yours alongside its full page in <a href="/en/guide/day-pillar/">the 60 Day Pillars</a>.</p>

<h2>What it means in each pillar</h2>
<p>Where the Nobleman branch sits tells you the direction help tends to come from.</p>
<ul>
<li><strong>Year branch</strong>: family, elders and the world of childhood. Read as a child who was noticed early by older people, and as support that comes through the family line.</li>
<li><strong>Month branch</strong>: parents and siblings, and the social stage of school and work. The month branch is the season of birth and the heaviest character in the chart, so a Nobleman here has real presence: mentors, bosses and colleagues who open doors.</li>
<li><strong>Day branch</strong>: the spouse and the people nearest to you. This is the seat of the four day Nobleman pillars above.</li>
<li><strong>Hour branch</strong>: children, juniors and the later years. Read as connections made late in life that turn out to matter, and as help you receive from those who come after you.</li>
</ul>
<p>Two Nobleman branches in one chart do not double the luck; they describe more than one channel. In the other direction, readers say a Nobleman branch that is clashed by another branch, or that falls into the <a href="/en/guide/void-kong-wang/">void</a>, works more weakly.</p>

<h2>When it arrives: luck pillars and years</h2>
<p>A chart without a Nobleman can still meet one in time. Every ten-year <a href="/en/guide/luck-pillars/">luck pillar</a> and every year brings a new branch, and when that branch is one of your two, readers call it a Nobleman period: a stretch when doors open through people.</p>
<ul>
<li><strong>2026, the Bing Wu year (丙午)</strong>, has the branch 午. Only one Day Master uses the Horse as a Nobleman: <strong>辛 Xin</strong>, Yin Metal.</li>
<li><strong>2027, the Ding Wei year (丁未)</strong>, begins at Ipchun on February 4, 2027, and its branch 未 is the Nobleman of <strong>甲 Jia, 戊 Wu and 庚 Geng</strong>.</li>
<li><strong>2028, the Wu Shen year (戊申)</strong>, brings 申, the Nobleman of <strong>乙 Yi and 己 Ji</strong>.</li>
<li>Months count too. In 2026 the Rooster month (about September 7 to October 8) and the Pig month (about November 7 to December 7) are Nobleman months for 丙 Bing and 丁 Ding.</li>
</ul>
<p>Saju years and months begin at the solar terms, not on January 1, which is why 2027 starts in February; see <a href="/en/guide/ipchun-year-boundary/">why the saju year starts at Ipchun</a>. A Nobleman year is not a stamp that guarantees a result. It is a good time to show up where people gather, to ask the question you have been sitting on and to accept the introduction. The road opens; walking it is still your part.</p>

<h2>The modern reading</h2>
<p><strong>Strengths first.</strong> People with a well-placed Nobleman tend to be easy to help. They ask clearly, say thank you and keep the relationship alive after the favor, which is exactly what makes the next favor possible. In work, that reads as networks that hold up under pressure, sponsors rather than mere contacts, and a habit of finding the person who knows. The star is often visible in careers that run on trust: consulting, medicine, teaching, diplomacy, any role where a recommendation matters.</p>
<p><strong>Then the cautions.</strong> Help that comes easily can be taken for granted, and some charts with several Nobleman branches lean on others when they should act. Readers also warn against confusing the star with a specific person: the Nobleman is a direction help comes from, not a name. And nothing about the star overrides the main reading. <a href="/en/guide/day-master-strength/">Day Master strength</a>, the balance of the elements and the Ten Gods decide what a chart is about; the Nobleman adds a note on how support arrives.</p>

<h2>Questions people ask</h2>
<h3>My chart has no Nobleman. Does that mean no one will help me?</h3>
<p>No. Only two of the twelve branches are Nobleman branches for any Day Master, so each branch in a chart has a one-in-six chance, and charts without one are common. Saju reads support through the Ten Gods as well: Resource stars describe help from elders and from learning, and Peer stars describe help from friends and colleagues. The star is one lens among several.</p>
<h3>My partner's zodiac animal is my Nobleman branch. Is that a sign?</h3>
<p>It is one pleasant note out of eight characters. Compatibility in saju is read mainly through the two Day Masters, the two day branches and how the elements of both charts fill each other's gaps, which is what the <a href="/en/match/">match page</a> scores. A partner whose year branch is your Nobleman is nice; a partner whose chart balances yours is what matters.</p>
<h3>Should I use the day stem or the year stem?</h3>
<p>Use the Day Master first; that is the base modern Korean readers rely on and the one this site uses. The year stem is a traditional second check. If the two lookups disagree, trust the day-stem result and treat the year-stem result as a lighter note about family and early life.</p>
<p>To check your own chart, <a href="/en/">cast your Four Pillars</a>, find your Day Master and compare the table above with your four branches. For the other named patterns, start with our overview of <a href="/en/guide/peach-blossom/">Peach Blossom and the special stars</a>.</p>
` },

  { slug: 'traveling-horse', cat: 'stars', published: '2026-09-15',
    title: 'Traveling Horse (Yi Ma) in Saju: Table, Years and Meaning',
    desc: 'The Traveling Horse star (yeokmasal, Yi Ma): the trine table that finds it from your year or day branch, its meaning in each pillar, and the years it arrives.',
    links: [{ href: '/en/', title: 'Cast your chart' }, { href: '/en/guide/peach-blossom/', title: 'Peach Blossom, found the same way' }, { href: '/en/guide/flower-canopy/', title: 'Flower Canopy, the quiet opposite' }],
    body: `
<p>"You have a traveling horse in your chart" used to be a worry. In a farming village it meant a life on the road, away from the fields and the family. Today the same words describe someone whose opportunities open when they move: the transfer abroad, the job that involves travel, the degree in another country. The star is <strong>yeokmasal</strong> (역마살, 驛馬殺) in Korean and Yi Ma (驛馬) in Chinese BaZi, the Traveling Horse or Post Horse. This guide covers how it is found, what it means in each pillar and when it arrives.</p>

<h2>What the Traveling Horse is</h2>
<p>The name comes from the postal relay system of old East Asia. Along the main roads stood stations (역, 驛) that kept horses ready so that official documents and traveling officials could move quickly from one to the next. A post horse was a horse that was always on the road. In saju the star stands for the same thing: movement, business trips, moving house, travel and changes of surroundings.</p>
<p>Like the other sinsal (신살, 神殺), the special stars that Chinese BaZi calls shensha, the Traveling Horse is a note laid over the eight characters, not the main reading. Having one does not mean a life that never settles; it means a life that widens through movement rather than through staying put. In the Korean twelve-star system (십이신살), which assigns a star to every branch of a trine, the first branch of the trine, called jisal (지살, 地殺), the Earth Star, is often read together with the Horse as a second marker of departures and moves.</p>

<h2>The table: finding the Horse from the trines</h2>
<p>The Traveling Horse is found the same way as <a href="/en/guide/peach-blossom/">Peach Blossom</a>: from a reference branch, either your year branch (your zodiac animal) or your day branch. Modern Korean readers look from the day branch first and check the year branch as well. Find the trine (삼합, 三合) that your reference branch belongs to, then see whether the Horse branch for that trine appears among your other branches.</p>
<table>
<tr><th>Year or day branch</th><th>Animals</th><th>Traveling Horse</th><th>Horse years</th><th>Horse month</th></tr>
<tr><td>寅午戌 Yin, Wu, Xu</td><td>Tiger, Horse, Dog</td><td><strong>申 Shen</strong> (Monkey)</td><td>2016 丙申, 2028 戊申</td><td>Monkey month, early Aug to early Sep</td></tr>
<tr><td>申子辰 Shen, Zi, Chen</td><td>Monkey, Rat, Dragon</td><td><strong>寅 Yin</strong> (Tiger)</td><td>2022 壬寅, 2034 甲寅</td><td>Tiger month, early Feb to early Mar</td></tr>
<tr><td>巳酉丑 Si, You, Chou</td><td>Snake, Rooster, Ox</td><td><strong>亥 Hai</strong> (Pig)</td><td>2019 己亥, 2031 辛亥</td><td>Pig month, early Nov to early Dec</td></tr>
<tr><td>亥卯未 Hai, Mao, Wei</td><td>Pig, Rabbit, Goat</td><td><strong>巳 Si</strong> (Snake)</td><td>2025 乙巳, 2037 丁巳</td><td>Snake month, early May to early Jun</td></tr>
</table>
<p>The pattern is easy to remember: the Horse is the branch that clashes with the first member of the trine. 寅 opens the Fire trine and its clash partner is 申; 亥 opens the Wood trine and its clash partner is 巳. So a person whose day branch is 午 belongs to the 寅午戌 group and has 申 as a Horse branch, and a Pig, whose year branch is 亥, has 巳.</p>
<p>Three steps:</p>
<ol>
<li><strong>Cast your chart</strong> on the <a href="/en/">calculator</a> and note your day branch and your year branch. Remember that the saju year turns at Ipchun, around February 4, so a January birthday usually belongs to the previous animal (see <a href="/en/guide/ipchun-year-boundary/">the Ipchun rule</a>).</li>
<li><strong>Find the row</strong> that contains your day branch and read its Horse branch. Do the same for your year branch.</li>
<li><strong>Check the other three branches</strong> of your chart for that character. If it is there, you have a Traveling Horse; note which pillar holds it.</li>
</ol>

<h2>Why the Horse is always 寅, 申, 巳 or 亥</h2>
<p>Only four branches can be a Traveling Horse, and they are the four that open a season: 寅 Yin begins spring, 巳 Si summer, 申 Shen autumn and 亥 Hai winter. Because each one stands at the threshold where a new season starts, the classics call them the four birth branches (사생지, 四生地). Departure and transition are built into them, and that is the logic behind the Horse.</p>
<p>Their hidden stems say the same thing. Each of the four holds three different energies at once: the Tiger carries 戊 Earth, 丙 Fire and 甲 Wood; the Monkey carries 戊 Earth, 壬 Water and 庚 Metal. Nothing in them sits still. Our guide to <a href="/en/guide/hidden-stems/">hidden stems</a> lists all twelve branches.</p>

<h2>What it means in each pillar</h2>
<ul>
<li><strong>Year branch</strong>: childhood and family. Read as frequent moves early in life, or a person who leaves the hometown and settles far away.</li>
<li><strong>Month branch</strong>: work. Movement attaches to the job: field work, business travel, sales, trade, logistics, tourism, overseas assignments. People with the Horse here do well in roles that keep them moving and poorly in roles that keep them at one desk.</li>
<li><strong>Day branch</strong>: the self and the spouse. An active person with a wide radius of daily life; there may be periods when work keeps the couple in different places.</li>
<li><strong>Hour branch</strong>: children and later life. Travel and new pursuits well into old age, or children who make their lives far away.</li>
</ul>
<p>Layer the <a href="/en/guide/ten-gods/">Ten Gods</a> over it and the purpose of the movement shows. A Horse branch that is a Wealth star suggests earning by going back and forth to distant places; an Authority star, a job with frequent postings and transfers; a Resource star, study or training abroad; an Output star, work that means moving around, presenting and speaking.</p>

<h2>When the Horse moves: clashes, years and luck pillars</h2>
<p>Readers say the Horse rests quietly until something prods it, and the classic prod is a clash. When a luck pillar or a year clashes the Horse branch in the natal chart (寅 with 申, 巳 with 亥), the move tends to be sudden and large: the transfer that comes with two weeks of notice, the relocation that was not in the plan.</p>
<p>Neither 2026 (丙午) nor 2027 (丁未) is a Horse year for anyone, since 午 and 未 are not Horse branches. The months still turn. The Pig month of 2026, 己亥, runs from about November 7 to December 7 and is a Horse month for Snakes, Roosters and Oxen. In 2027 the Tiger month 壬寅 (about February 4 to March 6) belongs to Monkeys, Rats and Dragons; the Snake month 乙巳 (about May 6 to June 6) to Pigs, Rabbits and Goats; and the Monkey month 戊申 (about August 8 to September 8) to Tigers, Horses and Dogs.</p>
<p>The next Horse year is <strong>2028, Wu Shen (戊申)</strong>. 申 is the Horse of the 寅午戌 group, so Tigers, Horses and Dogs, and anyone with 寅, 午 or 戌 as a day branch, can expect a year in which moves and changes stand out. It is also the year the three-year samjae (삼재, 三災) period begins for those same three animals, and that is no coincidence: for every group, samjae starts in its Horse year and ends in its Flower Canopy year. Structurally, samjae is simply the three years from the Horse to the Canopy.</p>
<p>A ten-year <a href="/en/guide/luck-pillars/">luck pillar</a> whose branch is your Horse is read as a decade in which the stage of your life changes: moves, job changes and study abroad tend to cluster in it.</p>

<h2>The modern reading</h2>
<p><strong>Strengths first.</strong> The Traveling Horse is the star of range. People who carry it adapt quickly to new places, make contacts across distances and recover their footing after a move faster than most. In a world of remote teams, relocation packages and international study that is an asset, and many of the careers that once counted as hardship (trade, transport, diplomacy, fieldwork, journalism) are now the interesting ones. A strong Horse is also good news for restlessness: it tells you that the itch is part of your make-up and not a failure of commitment.</p>
<p><strong>Then the cautions.</strong> Constant movement can become a way of avoiding roots, and a chart with several Horse branches may need to decide deliberately what stays fixed: a home base, a few long friendships, a craft that travels with you. If your work keeps you at one desk, the traditional advice is to build movement into the week rather than fight the star: take the role that visits sites and clients, or make a habit of going somewhere new regularly. Movement does not have to be a change of address.</p>

<h2>Questions people ask</h2>
<h3>Does a Traveling Horse mean I will never settle down?</h3>
<p>No. It describes a tendency toward movement, not a sentence to rootlessness. The worry comes from a time when leaving the village meant hardship; now it often means opportunity. Many people with a Horse in the month pillar have a stable home and a job that involves travel, which is the star working as intended.</p>
<h3>I have no Horse branch. Does that rule out living abroad?</h3>
<p>Not at all. The Horse also arrives through luck pillars and years, and in the end a move is a decision you make. A single star cannot say whether you will live overseas.</p>
<h3>Do I have to move house in a Horse year?</h3>
<p>No. Movement in saju is broader than residence: a change of department, a season of heavy travel, a new course of study or a wider daily radius all count. Treat a Horse year as a good time to plan a move you already want, not as an instruction to make one.</p>
<p>To find yours, <a href="/en/">cast your chart</a>, note your day and year branches and compare them with the table; the pillars of the coming years are in the table too, so you can see when a Horse branch is on its way. The other star found from the same trines is the <a href="/en/guide/flower-canopy/">Flower Canopy</a>, the Horse's quiet opposite.</p>
` },

  { slug: 'flower-canopy', cat: 'stars', published: '2026-09-15',
    title: 'Flower Canopy (Hua Gai) in Saju: Table, 2027 and Meaning',
    desc: 'Flower Canopy (hwagaesal, Hua Gai): the trine table, why the storehouse branches carry it, its meaning in each pillar, and why 2027 is a Canopy year.',
    links: [{ href: '/en/', title: 'Cast your chart' }, { href: '/en/guide/traveling-horse/', title: 'Traveling Horse, its restless twin' }, { href: '/en/guide/peach-blossom/', title: 'Peach Blossom and the special stars' }],
    body: `
<p>Some people have liked being alone since childhood, and once something catches them they have to see it through to the end. Korean saju has a name for that temperament: <strong>hwagaesal</strong> (화개살, 華蓋殺), the Flower Canopy, Hua Gai (華蓋) in Chinese BaZi. The name means an ornate canopy, and the image fits: a gift that is bright but held under cover, maturing in the shade. This guide explains where the name comes from, how the star is found from the trines, what it means in each pillar and why 2027 is a Canopy year for a third of all charts.</p>

<h2>What the Flower Canopy is</h2>
<p>A hua gai was the decorated canopy carried over an emperor's carriage, a covering that marked what was precious underneath. There is also a Chinese asterism of that name near the pole star, a canopy spread over the emperor's star. Something valuable sits under the cover, visible but a little apart from the crowd, and that is why the Canopy has always been the star of art, scholarship, religion and reflection.</p>
<p>Traditional readers went further and said a chart with several Canopies had a tie to the life of a monk or a hermit. In today's terms the star reads as depth: absorption in one field, the habit of recharging alone, and the ability to organize and record. Like the other sinsal (신살, 神殺), the special stars of saju (shensha in BaZi), the Canopy is a secondary note over the eight characters, and the Korean twelve-star system uses the same name for it.</p>

<h2>The table: finding the Canopy from the trines</h2>
<p>The method is the same as for the <a href="/en/guide/traveling-horse/">Traveling Horse</a> and <a href="/en/guide/peach-blossom/">Peach Blossom</a>. Take your year branch or your day branch (modern Korean readers look from the day branch first), find the trine (삼합, 三合) it belongs to, and check whether that trine's Canopy branch appears elsewhere in your chart.</p>
<table>
<tr><th>Year or day branch</th><th>Animals</th><th>Flower Canopy</th><th>Canopy years</th><th>Canopy month</th></tr>
<tr><td>寅午戌 Yin, Wu, Xu</td><td>Tiger, Horse, Dog</td><td><strong>戌 Xu</strong> (Dog), the storehouse of Fire</td><td>2018 戊戌, 2030 庚戌</td><td>Dog month, early Oct to early Nov</td></tr>
<tr><td>申子辰 Shen, Zi, Chen</td><td>Monkey, Rat, Dragon</td><td><strong>辰 Chen</strong> (Dragon), the storehouse of Water</td><td>2024 甲辰, 2036 丙辰</td><td>Dragon month, early Apr to early May</td></tr>
<tr><td>巳酉丑 Si, You, Chou</td><td>Snake, Rooster, Ox</td><td><strong>丑 Chou</strong> (Ox), the storehouse of Metal</td><td>2021 辛丑, 2033 癸丑</td><td>Ox month, early Jan to early Feb</td></tr>
<tr><td>亥卯未 Hai, Mao, Wei</td><td>Pig, Rabbit, Goat</td><td><strong>未 Wei</strong> (Goat), the storehouse of Wood</td><td>2027 丁未, 2039 己未</td><td>Goat month, early Jul to early Aug</td></tr>
</table>
<p>The Canopy is always the last branch of the trine: 戌 for 寅午戌, 辰 for 申子辰. That gives it a quirk the Horse and Peach Blossom do not have. Because the Canopy branch belongs to the same trine as the reference branch, the reference branch can be its own Canopy: a Dog's year branch 戌 is already the Canopy of 寅午戌. Whether that single character counts as "having" the star differs from reader to reader, so the safe approach is to look first for the Canopy branch in a pillar other than the one you started from.</p>
<ol>
<li><strong>Cast your chart</strong> on the <a href="/en/">calculator</a> and note your day branch and your year branch.</li>
<li><strong>Find the row</strong> for each and read its Canopy branch: one of 辰, 戌, 丑 or 未.</li>
<li><strong>Check the other branches</strong> of your chart for that character, and count how many of the four storehouse branches you hold in total.</li>
</ol>

<h2>Why 辰, 戌, 丑 and 未 are storehouses</h2>
<p>Only four branches can be a Canopy, and they are the four that close a season: 辰 Chen is late spring, 未 Wei late summer, 戌 Xu late autumn and 丑 Chou late winter. Each one gathers a season up and puts it away, which is why the classics call them the four storehouses (사고지, 四庫地).</p>
<p>The word is more than a metaphor. The element of each trine goes into its last branch to rest, and the trace is right there in the <a href="/en/guide/hidden-stems/">hidden stems</a>: 戌 holds 丁 Fire in its middle qi, 辰 holds 癸 Water, 丑 holds 辛 Metal and 未 holds 乙 Wood. The Fire trine 寅午戌 has the Fire-bearing Dog as its Canopy for exactly this reason. In the twelve life stages this position is the Grave (묘, 墓), where an element is gathered in.</p>
<p>A storehouse collects, stacks and matures. That is why readers see collecting and record-keeping, research and organizing, and the stamina to hold one subject for years as the marks of a Canopy chart. Because a storehouse is also where old things are brought out again, some readers add return, restarts and reunions with people from the past.</p>

<h2>What it means in each pillar</h2>
<ul>
<li><strong>Year branch</strong>: childhood. A thoughtful, early-maturing child, often one who played alone with books and with making things.</li>
<li><strong>Month branch</strong>: work. Strength in fields that demand depth: research, planning, teaching, the arts, counseling, religious life. The typical path is one field held long enough to become an expert in it.</li>
<li><strong>Day branch</strong>: the self and the spouse. A person who values conversation and the exchange of ideas in a relationship, and who needs a room of their own even with the people closest to them.</li>
<li><strong>Hour branch</strong>: later life and the results of your work. Study, faith and hobbies that deepen with age, or lasting output such as writing, records and works of art.</li>
</ul>
<p>Layer the <a href="/en/guide/ten-gods/">Ten Gods</a> over the Canopy and you see what the storehouse holds. A Canopy branch that is a Resource star stores learning and ideas; an Output star, art and creative work; a Wealth star, collections and assets; an Authority star, tradition and rules.</p>

<h2>When it arrives: 2026, 2027 and the luck pillars</h2>
<p><strong>2027 is the Ding Wei year (丁未)</strong>, and 未 is the Canopy of the 亥卯未 group. From Ipchun on February 4, 2027, it is a Canopy year for Pigs, Rabbits and Goats, and for anyone whose day branch is 亥, 卯 or 未. Readers describe such a year as one for finishing rather than expanding: closing out projects, studying for a qualification, writing things down, building inward. It is also read as a year in which something set aside, or someone long out of touch, comes back around. The Goat month of 2027, from about July 7 to August 8, is itself 丁未, so the theme doubles for a month.</p>
<p>For the same three animals 2027 is also the last year of samjae (삼재, 三災), the three-year caution period of Korean folk calendars. That is by design: every group's samjae ends in its Canopy year, so the year reads naturally as gathering three years of change into the storehouse. Our <a href="/en/2027/goat/">Goat</a>, <a href="/en/2027/rabbit/">Rabbit</a> and <a href="/en/2027/pig/">Pig</a> pages for 2027 go through the year in detail.</p>
<p>2026, the Bing Wu year (丙午), is not a Canopy year, but its Dog month, 戊戌, from about October 8 to November 7, is a Canopy month for Tigers, Horses and Dogs. 2028 (戊申) is not a Canopy year either; its Dragon month 丙辰 (about April 4 to May 5) belongs to Monkeys, Rats and Dragons, and its Dog month 壬戌 (about October 8 to November 7) to Tigers, Horses and Dogs. The next Canopy years come in order: 2030 庚戌 for Tigers, Horses and Dogs, 2033 癸丑 for Snakes, Roosters and Oxen, 2036 丙辰 for Monkeys, Rats and Dragons. A ten-year <a href="/en/guide/luck-pillars/">luck pillar</a> with a Canopy branch is read as a decade that fills up inside even when little shows outside.</p>

<h2>The modern reading</h2>
<p><strong>Strengths first.</strong> The Canopy is the star of depth, and depth is scarce. People who carry it can stay with a problem after everyone else has moved on, keep records that turn out to matter, and produce work that lasts. They recharge alone, which means they can also give a great deal when they choose to be with people. Research, writing, design, archival and clinical work, teaching and the contemplative professions all reward the temperament directly.</p>
<p><strong>Then the cautions.</strong> A storehouse can become a place to hide. A chart heavy with Canopy branches may collect more than it produces, or withdraw when a conversation would have solved things. The practical advice is simple: pick one subject to go deep on, put solitary time in the calendar so that it happens on purpose rather than by default, and turn what you gather into something you can show, because a record is how a storehouse becomes a result.</p>

<h2>Questions people ask</h2>
<h3>Does the Flower Canopy mean a lonely life?</h3>
<p>No. Needing time alone is not the same as isolation. People with a Canopy last longer in company precisely because they have somewhere to recharge. Loneliness comes from circumstances, not from a branch.</p>
<h3>The old books say I am destined for a monastery. Are they right?</h3>
<p>They describe a deep-going temperament in the language of their era, when the scholar, the monk and the hermit were the obvious careers for it. Today the same temperament makes researchers, specialists, artists and counselors. Read the monastery as a metaphor for depth.</p>
<h3>The name ends in -sal (殺). Is it a bad star?</h3>
<p>Peach Blossom, the Traveling Horse and the Canopy all carry the suffix, and none of them is bad or good on its own. Whether a star helps depends on the whole chart: Day Master strength, the balance of the elements and what the branch is doing there. The suffix is a naming convention, not a verdict.</p>
<p>To find your Canopy, <a href="/en/">cast your chart</a>, note your day and year branches and read the table. Count the storehouse branches (辰, 戌, 丑, 未) among your four, and watch for a Canopy branch in your luck pillars and in the year ahead.</p>
` },

  { slug: 'yang-blade', cat: 'stars', published: '2026-09-15',
    title: 'Yang Blade (Yang Ren) in Saju: Table, Day Pillars and 2026',
    desc: 'The Yang Blade (yanginsal, Yang Ren): the table for the five yang Day Masters, the three day pillars that sit on their blade, and why 2026 is a blade year.',
    links: [{ href: '/en/', title: 'Find your Day Master' }, { href: '/en/guide/day-pillar/bing-wu/', title: 'Bing Wu, a day blade pillar' }, { href: '/en/guide/day-master-strength/', title: 'Strong or weak Day Master?' }],
    body: `
<p>The character 刃 means a blade, and the name alone makes people nervous. Yet the star it belongs to marks the point where a Day Master's energy is at its fullest. A blade is dangerous swung carelessly and indispensable in the right hands, and reading the <strong>Yang Blade</strong>, yanginsal (양인살, 羊刃殺) in Korean and Yang Ren (羊刃) in Chinese BaZi, comes down to how the blade is held. This guide gives the table, explains why only three day pillars sit on their own blade, and shows why 2026 is a blade year for two Day Masters.</p>

<h2>What the Yang Blade is</h2>
<p>Peach Blossom, the Traveling Horse and the Flower Canopy are found from the trines of the year or day branch. The Yang Blade is different: it is found from the Day Master. As a Day Master's energy passes through the twelve branches it is born, grows, peaks and declines, the cycle the classics call the twelve life stages (십이운성, 十二運星). The branch at the peak, the stage this site calls Prosperity (제왕, 帝旺, the emperor's flourishing), is the Yang Blade. The old books describe the same spot another way: the branch just after the Day Master's Official branch (건록, 建祿), where it holds its full share, is the blade, one step past a full vessel, where it overflows.</p>
<p>The name is written 羊刃, "goat blade," but many books write 陽刃, "yang blade," and explanations of the name vary; either way the point is energy concentrated to an edge. The Yang Blade is both a special star (sinsal, 신살) and a term of structural analysis, gyeokguk (격국, 格局), where a blade in the month branch defines the whole chart. Schools disagree about where the blade of a yin Day Master falls, so this article, like the rest of this site, follows the five-yang-stem rule and describes the blade for yang Day Masters only.</p>

<h2>The table: blade branches by Day Master</h2>
<table>
<tr><th>Day Master</th><th>Yang Blade</th><th>Blade month</th><th>Blade years</th><th>Day pillar sitting on its blade</th></tr>
<tr><td>甲 Jia, Yang Wood</td><td><strong>卯 Mao</strong> (Rabbit)</td><td>Rabbit month, early Mar to early Apr</td><td>2023 癸卯, 2035 乙卯</td><td>none</td></tr>
<tr><td>丙 Bing, Yang Fire</td><td><strong>午 Wu</strong> (Horse)</td><td>Horse month, early Jun to early Jul</td><td>2026 丙午, 2038 戊午</td><td><a href="/en/guide/day-pillar/bing-wu/">Bing Wu 丙午</a></td></tr>
<tr><td>戊 Wu, Yang Earth</td><td><strong>午 Wu</strong> (Horse)</td><td>Horse month, early Jun to early Jul</td><td>2026 丙午, 2038 戊午</td><td><a href="/en/guide/day-pillar/wu-wu/">Wu Wu 戊午</a></td></tr>
<tr><td>庚 Geng, Yang Metal</td><td><strong>酉 You</strong> (Rooster)</td><td>Rooster month, early Sep to early Oct</td><td>2017 丁酉, 2029 己酉</td><td>none</td></tr>
<tr><td>壬 Ren, Yang Water</td><td><strong>子 Zi</strong> (Rat)</td><td>Rat month, early Dec to early Jan</td><td>2020 庚子, 2032 壬子</td><td><a href="/en/guide/day-pillar/ren-zi/">Ren Zi 壬子</a></td></tr>
</table>
<p>The way to remember it is "one past Official." Jia's Official branch is 寅, so its blade is 卯; Bing and Wu have 巳, so their blade is 午; Geng has 申, so 酉; Ren has 亥, so 子. Yang Earth shares Fire's positions because the twelve stages traditionally count Earth together with Fire.</p>
<ol>
<li><strong>Find your Day Master</strong> on the <a href="/en/">calculator</a>. If it is a yin stem (乙, 丁, 己, 辛, 癸), this table does not apply.</li>
<li><strong>Read the blade branch</strong> for your stem.</li>
<li><strong>Look for it</strong> among the year, month, day and hour branches. The month branch matters most, the day branch next.</li>
</ol>
<p>In Ten God terms the blade branch is Rob Wealth, the same element as the Day Master with the opposite polarity: 卯 holds 乙 for Jia, 午 holds 丁 for Bing, 酉 holds 辛 for Geng and 子 holds 癸 for Ren. Yang Earth is the exception. The main qi of 午 is 丁, which is Direct Resource for Wu, but the middle qi is 己, so the Rob Wealth component is there underneath (see <a href="/en/guide/hidden-stems/">hidden stems</a>). The blank cells in the last column also have a reason: the sixty pillars pair yang stems only with yang branches, so Jia can never sit on 卯 and Geng can never sit on 酉. Only three day pillars sit on their own blade, <a href="/en/guide/day-pillar/bing-wu/">Bing Wu</a>, <a href="/en/guide/day-pillar/wu-wu/">Wu Wu</a> and <a href="/en/guide/day-pillar/ren-zi/">Ren Zi</a>, and the classics give them a name of their own, the day blade (일인, 日刃).</p>

<h2>What it means in each pillar</h2>
<ul>
<li><strong>Month branch</strong>: the strongest position, since the season of birth itself is the Day Master's peak. Structural analysis calls this a Yang Blade structure (양인격, 羊刃格) and says its surplus power is put to use when Authority stars, Direct Officer or Seven Killings, discipline it. A blade paired with Seven Killings, the pattern called yangin gasal (양인가살, 羊刃駕殺), "the blade harnessing the Killings," was prized as the makeup of commanders and administrators.</li>
<li><strong>Day branch</strong>: the day blade of Bing Wu, Wu Wu and Ren Zi. Power gathered in the seat of the self gives strong conviction; because the day branch is also the spouse seat, sharing decisions in close relationships takes practice.</li>
<li><strong>Year branch</strong>: family and early life. A competitive environment from an early age, and often an early start to standing on one's own.</li>
<li><strong>Hour branch</strong>: children and later life. The stamina to stay active late into life, sometimes a strict manner with juniors and children.</li>
</ul>
<p>A blade tilts a chart toward strength. If the Day Master is already strong, the chart needs an outlet for the heat: Output, Wealth or Authority stars to spend it on. If the Day Master is weak, the blade is a welcome prop that holds the person up. The same blade serves different owners differently, which is why the reading starts with <a href="/en/guide/day-master-strength/">Day Master strength</a>.</p>

<h2>When it arrives: 2026 is a blade year for Bing and Wu</h2>
<p><strong>2026, the Bing Wu year (丙午)</strong>, carries 午, the blade of Yang Fire and Yang Earth. For a 丙 Day Master the year stem 丙 is a Friend as well, so the self is doubled from above and below: maximum drive, and a real risk of overheating and collisions. A Bing Wu day pillar meets its own pillar again in 2026, which readers treat as an especially loud version of the same theme. For a 戊 Day Master the stem 丙 is Indirect Resource, so study and self-belief grow together in 2026; the thing to watch is stubbornness.</p>
<p>The Ren Zi day pillar has the opposite experience. In 2026 the stems clash (丙 against 壬) and the branches clash (子 against 午), so the blade takes a direct hit. The classics were wary of a clashed blade. The modern translation is to slow down, avoid overextending and keep emotional confrontations short.</p>
<p><strong>2027, the Ding Wei year (丁未)</strong>, has no blade in it for any yang stem, though the Horse month of 2027, 丙午, from about June 6 to July 7, gives Bing and Wu Day Masters one more blade month. 2028 (戊申) is not a blade year either; its Horse month 戊午 (about June 5 to July 6) repeats the note. The next blade years come in order: 2029 己酉 for Geng, 2032 壬子 for Ren, 2035 乙卯 for Jia and 2038 戊午 for Bing and Wu. A ten-year <a href="/en/guide/luck-pillars/">luck pillar</a> on a blade branch is read as a decade of pushing through on one's own strength.</p>

<h2>The modern reading</h2>
<p><strong>Strengths first.</strong> The Yang Blade is drive at its peak. People who carry it push through to the finish, come alive in competition, solve their own problems rather than waiting, and can make a decision in a crisis when others freeze. Traditional readers matched the star to fields that reward decisiveness and skill with tools and edges: surgery, engineering, sport, the military and police, and any organization with clear rules to compete under. Modern readers add founders, litigators and emergency workers.</p>
<p><strong>Then the cautions.</strong> Rob Wealth is the star of competition and sharing, so the old warnings are about money leaking through partners and rivals, hasty judgment, cutting words, and driving the body too hard. The remedy is a sheath: a clear goal to spend the force on, arenas with rules and referees, and money matters put in writing. Treat any talk of the blade and injury as a reminder about speed and overwork, not a prediction; health questions belong to doctors.</p>

<h2>Questions people ask</h2>
<h3>Does a Yang Blade mean I will be injured or need surgery?</h3>
<p>That is a literal reading of the word blade from an era that had few other explanations. Take it as a caution against rushing and exhausting yourself. Saju cannot diagnose or forecast health; a doctor can.</p>
<h3>Is it better not to have a blade at all?</h3>
<p>For a weak Day Master a blade is a support, and for anyone it is a source of decisiveness and push. The question is never whether you have it but where you point it.</p>
<h3>Is the Yang Blade the same as Kui Gang?</h3>
<p>No. <a href="/en/guide/kui-gang/">Kui Gang</a> is a whole day pillar, such as Geng Chen or Ren Xu, and describes the character of that pillar. The blade is a single branch found from the Day Master and describes where the Day Master's power overflows. Both are strong, but they are found differently and mean different things.</p>
<p>To check your own, <a href="/en/">cast your chart</a>, confirm your Day Master and look for its blade branch among your four branches. Then read our guide to <a href="/en/guide/day-master-strength/">Day Master strength</a> to judge whether that blade is a prop or a fire to be cooled.</p>
` },

  { slug: 'white-tiger', cat: 'stars', published: '2026-09-15',
    title: 'White Tiger (Bai Hu) in Saju: The Seven Day Pillars',
    desc: 'The White Tiger star (baekhosal, Bai Hu): the seven day pillars, the nine-palace rule behind them, what each one means, and how modern readers drop the fear.',
    links: [{ href: '/en/', title: 'Find your day pillar' }, { href: '/en/guide/day-pillar/jia-chen/', title: 'Jia Chen, a White Tiger pillar' }, { href: '/en/guide/kui-gang/', title: 'Kui Gang, the overlapping star' }],
    body: `
<p>Of all the special stars, the White Tiger has the most frightening reputation. Its Korean name is <strong>baekhosal</strong> (백호살, 白虎殺), often lengthened to baekho daesal (백호대살, 白虎大殺), the Great White Tiger; Chinese BaZi calls it Bai Hu (白虎). The old texts tied it to "the sight of blood." Take the star apart, though, and it turns out to be a name for seven day pillars whose energy is packed unusually tight, and modern readers read it for what that energy is good for. This guide lists the seven pillars, explains the curious rule that produces them and gives the modern reading.</p>

<h2>What the White Tiger is</h2>
<p>The white tiger is the guardian of the west among the four directional spirits of East Asian cosmology, alongside the azure dragon of the east, the vermilion bird of the south and the black tortoise of the north. It is the spirit of autumn, of Metal and of the blade, which is how classical readers came to connect the star with accidents, surgery and quarrels, the sudden and the sharp.</p>
<p>The White Tiger is found differently from stars like the <a href="/en/guide/nobleman-star/">Nobleman</a>, which match a Day Master against a branch. Here the question is whether <strong>a whole pillar, stem and branch together, is one of seven fixed pairs</strong>: 戊辰, 丁丑, 丙戌, 乙未, 甲辰, 癸丑 and 壬戌. Any of the four pillars can carry one, but readers weigh the day pillar most and the month pillar next.</p>

<h2>The seven pillars and the rule of nine</h2>
<p>Lay the seven pillars out in the order of the sixty-pillar cycle and a pattern appears at once.</p>
<table>
<tr><th>White Tiger pillar</th><th>Position in the 60 pillars</th><th>Ten God of the day branch</th><th>Twelve-stage position</th></tr>
<tr><td><a href="/en/guide/day-pillar/wu-chen/">戊辰 Wu Chen</a></td><td>5</td><td>Friend</td><td>Cap and Belt</td></tr>
<tr><td><a href="/en/guide/day-pillar/ding-chou/">丁丑 Ding Chou</a></td><td>14</td><td>Eating God</td><td>Grave</td></tr>
<tr><td><a href="/en/guide/day-pillar/bing-xu/">丙戌 Bing Xu</a></td><td>23</td><td>Eating God</td><td>Grave</td></tr>
<tr><td><a href="/en/guide/day-pillar/yi-wei/">乙未 Yi Wei</a></td><td>32</td><td>Indirect Wealth</td><td>Nurture</td></tr>
<tr><td><a href="/en/guide/day-pillar/jia-chen/">甲辰 Jia Chen</a></td><td>41</td><td>Indirect Wealth</td><td>Decline</td></tr>
<tr><td><a href="/en/guide/day-pillar/gui-chou/">癸丑 Gui Chou</a></td><td>50</td><td>Seven Killings</td><td>Cap and Belt</td></tr>
<tr><td><a href="/en/guide/day-pillar/ren-xu/">壬戌 Ren Xu</a></td><td>59</td><td>Seven Killings</td><td>Cap and Belt</td></tr>
</table>
<p>The positions run 5, 14, 23, 32, 41, 50, 59: exactly nine apart. The traditional explanation is a game of squares. Deal the sixty pillars one by one into the nine palaces (구궁, 九宮), the three-by-three grid of the Luo Shu, starting from 甲子, and the pillars that land in the fifth palace, the center, are these seven. Sixty is not divisible by nine, so the center receives seven pillars and not six. The same arithmetic means that in a calendar a White Tiger day usually comes every nine days, with one gap of six days in each sixty-day cycle.</p>
<p>Notice too that all seven branches are 辰, 戌, 丑 or 未, the storehouse branches at the end of each season, which the classics call the four storehouses (사고지, 四庫地) because each one holds an element in reserve. One reading finds the White Tiger's intensity in that picture: stored energy released all at once. The Ten Gods in the table are taken from the main hidden stem of the day branch (see <a href="/en/guide/hidden-stems/">hidden stems</a> and <a href="/en/guide/ten-gods/">the Ten Gods</a>), and the twelve-stage positions are counted from the Day Master.</p>
<p>Finding out whether you have one takes three steps.</p>
<ol>
<li><strong>Cast your chart</strong> on the <a href="/en/">calculator</a> and read your day pillar, the two characters of your birth day.</li>
<li><strong>Compare it with the seven pairs.</strong> Both characters must match; a lone 辰 or a lone 戊 means nothing here.</li>
<li><strong>Check the month pillar</strong> the same way, and note the year and hour pillars as lighter information.</li>
</ol>

<h2>What kind of person it describes</h2>
<p>The old reading sounds alarming, but today's readers treat the White Tiger as a matter of <strong>density</strong>: the drive to push a decision through to the end, a composure that increases rather than collapses in a crisis, and clear personal standards. Because that energy suits sharp tools, urgent situations and work on the body, readers often mention medicine, rescue services, technical trades and athletics. These are tendencies, not a formula for choosing a career.</p>
<p>The Ten God of the day branch gives each pillar its grain.</p>
<ul>
<li><strong>Jia Chen and Yi Wei (Indirect Wealth)</strong>: drive expressed as building something large and moving people and resources around it.</li>
<li><strong>Bing Xu and Ding Chou (Eating God)</strong>: tenacity in one field and skill in the hands, the craftsman's version of intensity.</li>
<li><strong>Wu Chen (Friend)</strong>: self-reliance and a refusal to lean on anyone, with the stubbornness that comes with it.</li>
<li><strong>Ren Xu and Gui Chou (Seven Killings)</strong>: the capacity to carry responsibility under pressure and tension.</li>
</ul>

<h2>What it means in each pillar</h2>
<ul>
<li><strong>Day pillar</strong>: your own temperament and the spouse seat. A distinct personality that likes to hold the initiative in relationships, which means that when there is a collision it can be a hard one. The nearer the relationship, the more it pays to turn the temperature of your words down a notch.</li>
<li><strong>Month pillar</strong>: the social stage, and the seat of parents and siblings. A bold working style, and a tendency to volunteer for the difficult and unglamorous jobs first.</li>
<li><strong>Year and hour pillars</strong>: read lightly. The classical texts said trouble would visit the relatives those pillars stand for, the elders in the year and the children in the hour. There is no reason to worry about a family member on that basis.</li>
</ul>
<p>A White Tiger in both the day and the month pillar is read as a stronger dose. Ren Xu is also a <a href="/en/guide/kui-gang/">Kui Gang</a> pillar, so the two stars overlap there, and some schools list Wu Chen under Kui Gang as well. Each pillar's full portrait is in <a href="/en/guide/day-pillar/">the 60 Day Pillars</a>.</p>

<h2>When it arrives: luck pillars and years</h2>
<p>When a ten-year <a href="/en/guide/luck-pillars/">luck pillar</a>, a year or a month is one of the seven pillars, readers expect the pace of events and the level of tension to rise for that period. Some also watch the years in which the branch of a natal White Tiger pillar is clashed.</p>
<ul>
<li><strong>Neither 2026 (丙午) nor 2027 (丁未) is a White Tiger year, and neither is 2028 (戊申).</strong> The most recent one was 2024, Jia Chen (甲辰); the next is 2033, Gui Chou (癸丑).</li>
<li>The months do arrive. In 2026 the Goat month, 乙未, ran from about July 7 to August 7. In 2027 the Dragon month 甲辰 runs from about April 5 to May 6, and the last month of the Ding Wei year, 癸丑, from about January 6, 2028, to Ipchun on February 4, 2028. In 2028 the Dog month 壬戌 runs from about October 8 to November 7.</li>
<li>The 未 of 2027 clashes 丑, so for the Ding Chou and Gui Chou day pillars 2027 is a year in which the White Tiger branch is shaken. The right amount of caution is modest: no hurry at the wheel, on the field or with tools, and one extra beat before big decisions.</li>
</ul>

<h2>The modern reading</h2>
<p><strong>Strengths first.</strong> A White Tiger day pillar describes someone who can be trusted when things go wrong: decisions get made, the job gets finished, the pressure is carried rather than passed on. In ordinary times that same density shows as focus, high standards and an unusual capacity for hard work. People with the star tend to do well where speed and nerve matter and where the work is concrete enough to show results.</p>
<p><strong>Then the cautions.</strong> Intensity needs somewhere to go. Left without a task it turns into impatience, and turned on the people closest to you it turns into arguments that run hotter than the subject deserves. The useful disciplines are the ordinary ones: rest scheduled like work, speech a shade softer than the feeling, and the humility to ask for help before the crisis rather than during it.</p>

<h2>Questions people ask</h2>
<h3>Do people born on a White Tiger day have serious accidents?</h3>
<p>Seven of the sixty days are White Tiger days, so roughly one person in eight or nine is born on one. A pattern that common cannot say anything about the safety of any one person. Accident prevention belongs to seat belts, sleep and attention, not to a day pillar.</p>
<h3>Is marriage or having children harder with a White Tiger?</h3>
<p>That is a folk belief with weak grounds. A strong temperament asks for more deliberate give-and-take in a relationship, and that is all the star reasonably says.</p>
<h3>Can I get rid of it with a talisman or a new name?</h3>
<p>The special stars are one of several frames for reading eight characters, and the core of saju is the balance of the Five Elements, the Ten Gods and Day Master strength. The White Tiger is not something to remove but a disposition to know and to use, and neither charms nor name changes alter a birth date.</p>
<p>To check, <a href="/en/">cast your chart</a> and look at the day and month pillars. If either is one of the seven, read the Ten God and twelve-stage columns in the table and then the pillar's own page. For the family of stars this one belongs to, see <a href="/en/guide/peach-blossom/">Peach Blossom and the special stars</a>.</p>
` },

  { slug: 'kui-gang', cat: 'stars', published: '2026-09-15',
    title: 'Kui Gang (Goegang) in Saju: The Four Day Pillars Explained',
    desc: 'Kui Gang (goegangsal): the core day pillars Geng Chen, Geng Xu, Ren Chen and Ren Xu, the schools that add Wu Xu, and what 2026 and 2027 bring to each.',
    links: [{ href: '/en/', title: 'Find your day pillar' }, { href: '/en/guide/day-pillar/geng-chen/', title: 'Geng Chen, a Kui Gang pillar' }, { href: '/en/guide/day-pillar/ren-xu/', title: 'Ren Xu, Kui Gang and White Tiger' }],
    body: `
<p>"Kui Gang people have a strong aura." "A woman with Kui Gang has a hard fate." Both sayings are still heard in Korea, and the star behind them, <strong>goegangsal</strong> (괴강살, 魁罡殺), Kui Gang (魁罡) in Chinese BaZi, really is one of the strongest patterns in the catalog. But strength is not misfortune. Used well, Kui Gang is the drive and decisiveness that gets large things done. This guide explains which day pillars carry it, where the name comes from, what 2026 and 2027 bring to each pillar, and how to read the strength without the old prejudice.</p>

<h2>What Kui Gang is</h2>
<p>Kui Gang is the name given when the day pillar, the pillar of your birth day, is one of <strong>庚辰 Geng Chen, 庚戌 Geng Xu, 壬辰 Ren Chen or 壬戌 Ren Xu</strong>. Those four are the core. Depending on the school and the text, 戊戌 Wu Xu is added to make five, and a few also include 戊辰 Wu Chen. Unlike Peach Blossom or the Traveling Horse, which are found from a single branch, Kui Gang needs a stem and a branch together as a fixed pair, and it is read mainly on the day pillar.</p>
<p>The name comes from the stars. Kui (魁) and Gang (罡) are both names connected with the Big Dipper. In the old divination system called liuren (육임, 六壬), 戌 was called He Kui (河魁) and 辰 was called Tian Gang (天罡), and that is the usual explanation for why every Kui Gang pillar sits on a Dragon or a Dog. The two branches are the pair of storehouses that clash head-on, and the stems above them, 庚 Yang Metal and 壬 Yang Water, are the big, hard yang stems. Even so, no single principle of the Five Elements explains neatly why this combination became Kui Gang; it is better understood as a rule handed down with its name.</p>

<h2>The Kui Gang pillars, with 2026 and 2027</h2>
<p>Find your day pillar in the table. The third column is the Ten God the Day Master sees in its own day branch; the last two columns show what the stems of the coming years are to that Day Master.</p>
<table>
<tr><th>Day pillar</th><th>Status</th><th>Ten God of the day branch</th><th>2026 丙午 Bing Wu</th><th>2027 丁未 Ding Wei</th></tr>
<tr><td><a href="/en/guide/day-pillar/geng-chen/">庚辰 Geng Chen</a></td><td>core</td><td>Indirect Resource</td><td>Seven Killings</td><td>Direct Officer</td></tr>
<tr><td><a href="/en/guide/day-pillar/geng-xu/">庚戌 Geng Xu</a></td><td>core</td><td>Indirect Resource</td><td>Seven Killings</td><td>Direct Officer</td></tr>
<tr><td><a href="/en/guide/day-pillar/ren-chen/">壬辰 Ren Chen</a></td><td>core</td><td>Seven Killings</td><td>Indirect Wealth</td><td>Direct Wealth</td></tr>
<tr><td><a href="/en/guide/day-pillar/ren-xu/">壬戌 Ren Xu</a></td><td>core</td><td>Seven Killings</td><td>Indirect Wealth</td><td>Direct Wealth</td></tr>
<tr><td><a href="/en/guide/day-pillar/wu-xu/">戊戌 Wu Xu</a></td><td>many schools</td><td>Friend</td><td>Indirect Resource</td><td>Direct Resource</td></tr>
<tr><td><a href="/en/guide/day-pillar/wu-chen/">戊辰 Wu Chen</a></td><td>some schools</td><td>Friend</td><td>Indirect Resource</td><td>Direct Resource</td></tr>
</table>
<p>The third column already hints at the character. The Geng pillars sit on Indirect Resource, the Ren pillars on Seven Killings, the Wu pillars on a Friend: all of them Ten Gods that push straight ahead rather than talk around a subject. The <a href="/en/guide/ten-gods/">Ten Gods guide</a> explains each label; the ten Day Masters themselves are introduced in <a href="/en/guide/">the Day Master guide</a>.</p>
<ol>
<li><strong>Cast your chart</strong> on the <a href="/en/">calculator</a> and read the day pillar.</li>
<li><strong>Match both characters</strong> against the six pairs in the table. A 庚 on any other branch, or a 辰 under any other stem, is not Kui Gang.</li>
<li><strong>Look at the other pillars</strong> as well. A Kui Gang pair in the month or hour pillar is a lighter note, and two Kui Gang pillars in one chart are read as a stronger dose.</li>
</ol>

<h2>What kind of person it describes</h2>
<p>Kui Gang day pillars are read as quick thinkers with clear judgment. Once a decision is made they do not dither; they grow calmer as a crisis grows; and they take the role of setting direction for a group without being asked. Their principles are firm, and once they believe something is right they rarely bend.</p>
<p>The old texts saw Kui Gang as a pattern of extremes. When the luck pillars strengthen the Day Master it rises high; when Wealth or Authority stars are excessive, or a clash or punishment breaks the energy, the hardship is correspondingly large. Several Kui Gang pillars together were said to magnify the effect. So Kui Gang is always read together with <a href="/en/guide/day-master-strength/">Day Master strength</a>, which decides whether the chart can carry it.</p>
<p>Strong energy casts a shadow. Kui Gang can look like stubbornness, sound sharp in conversation, and carry burdens alone instead of asking for help. Three habits make the most of it: take roles that come with real decision-making authority, practice explaining the reasoning and not only the conclusion, and keep rest on the calendar as firmly as work. Traditionally the star was matched with fields that demand discipline and decisiveness, and with professions where a qualification lets a person stand on their own.</p>

<h2>What it means in each pillar</h2>
<ul>
<li><strong>Day pillar</strong>: the core case. The day pillar is the seat of the self and the spouse, so a Kui Gang day pillar puts strong energy at the center of the personality. In a relationship it means two people who need to divide the areas each one decides.</li>
<li><strong>Month pillar</strong>: career and parents. Kui Gang drive shows in working life, in the way a person leads projects and handles authority.</li>
<li><strong>Hour pillar</strong>: children and later life. The same push appears late in life and in what a person leaves behind.</li>
<li><strong>Year pillar</strong>: family and early life; the lightest position, read as a strong-willed household or early independence.</li>
</ul>
<p>Two Kui Gang pillars in one chart happen more easily than you might think. A Geng Day Master born in the Dragon hour has 庚辰 as the hour pillar; if the day pillar is Geng Xu, the chart holds two Kui Gang pairs and the day branch 戌 clashes the hour branch 辰, a structure readers describe as energy in violent motion. The same doubling can occur with a Ren Day Master in a Dragon or Dog hour.</p>

<h2>When it arrives: 2026, 2027 and the clash years</h2>
<ul>
<li><strong>Geng Chen and Geng Xu</strong>: 2026 brings Seven Killings and 2027 Direct Officer, two Authority years in a row. The old rule that Kui Gang dislikes Authority stars reads them as years of pressure; the modern reading is years in which responsibility and position grow and performance is judged. For Geng Xu the 午 of 2026 forms a half Fire trine with the day branch 戌, so the Officer's fire burns hotter still. Principles over speed.</li>
<li><strong>Ren Chen and Ren Xu</strong>: 2026 is Indirect Wealth with a stem clash (丙 against 壬), a year of opportunity and collision together. 2027 is Direct Wealth with a stem combination (丁 with 壬), a calmer year for building steadily and making commitments. Since Kui Gang was said to dislike excessive Wealth, the skill is sizing ambition sensibly.</li>
<li><strong>Wu Xu (and Wu Chen)</strong>: 2026 is Indirect Resource and 2027 Direct Resource, years for study, paperwork and qualifications. For Wu Xu the 午 of 2026 joins the day branch 戌 in a half trine, which strengthens the Resource energy further.</li>
</ul>
<p>2028, Wu Shen (戊申), brings a stem of Yang Earth: Indirect Resource for the Geng pillars, Seven Killings for the Ren pillars and a Friend for the Wu pillars. Note also the years that clash the day branch: 2030, Geng Xu (庚戌), clashes the 辰 of Geng Chen and Ren Chen, and is itself a Kui Gang pillar; 2036, Bing Chen (丙辰), clashes the 戌 of Geng Xu, Ren Xu and Wu Xu. Those are years to avoid rushing big decisions and to thin out the schedule. Kui Gang months come round too: 壬辰 from about April 5 to May 5 in 2026, 庚戌 from about October 8 to November 8 in 2027, and 壬戌 from about October 8 to November 7 in 2028. A ten-year <a href="/en/guide/luck-pillars/">luck pillar</a> that is a Kui Gang pair adds the same intensity to a decade.</p>

<h2>The modern reading</h2>
<p><strong>Strengths first.</strong> Kui Gang is leadership material: the nerve to decide, the composure to decide well under pressure, and the consistency that lets other people follow. Its owners tend to thrive where the stakes are visible and the authority is real, whether that is running a team, a clinic, a courtroom argument or a business of their own, and they are often the person a group turns to when nobody else will say what has to happen next.</p>
<p><strong>Then the cautions.</strong> The same force can flatten disagreement, and a Kui Gang that never explains itself is experienced by others as simple obstinacy. The readings of "hard fate" for women come from an age that treated a woman's initiative as a defect; today the honest translation is agency, expertise and the capacity to lead. The remaining caution is practical: strong people wear out too, so guard rest and ask for help earlier than feels natural.</p>

<h2>Questions people ask</h2>
<h3>Is Kui Gang bad for marriage?</h3>
<p>The worry arises because the day pillar doubles as the spouse seat. Two strong people who divide up the decisions make a formidable pair. What Kui Gang asks for is agreed territory, not a weaker partner.</p>
<h3>Is Kui Gang always unlucky, or always a great blessing?</h3>
<p>Neither. It is a large quantity of energy; its direction is decided by the balance of the whole chart and by the luck pillars. Strong charts carry it well, weak or badly clashed charts struggle with it, and the reading follows from there.</p>
<h3>Are Kui Gang and the White Tiger the same thing?</h3>
<p>No, they are separate stars. Ren Xu and Wu Chen appear on the <a href="/en/guide/white-tiger/">White Tiger</a> list as well, so for those two pillars readers say the stars overlap, but the lists and the meanings differ. The other star often mentioned alongside Kui Gang is the <a href="/en/guide/yang-blade/">Yang Blade</a>, which describes a single branch where the Day Master's power overflows, not a whole pillar.</p>
<p>To check, <a href="/en/">cast your chart</a> and read the day pillar. If it is Geng Chen, Geng Xu, Ren Chen or Ren Xu (or Wu Xu and Wu Chen, depending on the school), follow the link in the table to that pillar's page for its personality, love and compatibility readings.</p>
` },

  { slug: 'void-kong-wang', cat: 'stars', published: '2026-09-15',
    title: 'Void (Kong Wang, Gongmang) in Saju: Find Your Empty Branches',
    desc: 'Void (gongmang, Kong Wang): the six decades of the sixty pillars and their empty branches, how to find yours from the day pillar, and what a filled void means.',
    links: [{ href: '/en/', title: 'Find your day pillar' }, { href: '/en/guide/day-pillar/bing-wu/', title: 'Bing Wu, the worked example' }, { href: '/en/guide/nobleman-star/', title: 'Nobleman Star, weakened by the void' }],
    body: `
<p>Sooner or later a reading mentions that a character in your chart "is in the void." The Korean term is <strong>gongmang</strong> (공망, 空亡), Kong Wang in Chinese BaZi, literally "empty and lost," and it describes two earthly branches that a given birth day leaves unfilled. Once you see the arithmetic behind it, anyone can find their own void in a minute, and the reading is calmer than the name suggests. This guide explains where the two empty branches come from, gives the table for all six decades of the sixty pillars, and shows how Korean readers use it, including the idea of a void that gets filled.</p>

<h2>Ten stems, twelve branches, two left over</h2>
<p>The sixty pillars are made by pairing the ten heavenly stems with the twelve earthly branches one step at a time: 甲子, 乙丑, 丙寅 and so on. In the ten steps it takes the stems to make one full round, only ten of the twelve branches get a partner. Count from 甲子 to 癸酉 and the branches left without a stem are 戌 and 亥.</p>
<p>Each block of ten pillars is a decade, sun (순, 旬) in Korean and xun in Chinese, and the two branches each decade leaves out are its void. The full name is sunjung gongmang (순중공망, 旬中空亡), "the void within the decade," shortened to sungong (순공, 旬空). Old readers pictured a heavenly stem as something that descends onto a branch, so a branch with no stem to receive was empty ground. Because there are six decades, there are six possible voids, and the two void branches are always neighbors. The Japanese system of sanmeigaku calls the same thing tenchusatsu (天中殺), the "heaven-center void," and derives it in exactly the same way.</p>

<h2>The table: six decades and their void branches</h2>
<p>The base is <strong>the decade your day pillar belongs to</strong>. Find your day pillar in the middle column and the void is on the right. Tradition also runs the lookup from the year pillar as a second base; which of the two a reader weighs more heavily varies by school.</p>
<table>
<tr><th>Decade</th><th>Its ten pillars</th><th>Void branches</th></tr>
<tr><td>甲子旬 Jia Zi decade</td><td>甲子 乙丑 丙寅 丁卯 戊辰 己巳 庚午 辛未 壬申 癸酉</td><td><strong>戌 Xu · 亥 Hai</strong> (Dog, Pig)</td></tr>
<tr><td>甲戌旬 Jia Xu decade</td><td>甲戌 乙亥 丙子 丁丑 戊寅 己卯 庚辰 辛巳 壬午 癸未</td><td><strong>申 Shen · 酉 You</strong> (Monkey, Rooster)</td></tr>
<tr><td>甲申旬 Jia Shen decade</td><td>甲申 乙酉 丙戌 丁亥 戊子 己丑 庚寅 辛卯 壬辰 癸巳</td><td><strong>午 Wu · 未 Wei</strong> (Horse, Goat)</td></tr>
<tr><td>甲午旬 Jia Wu decade</td><td>甲午 乙未 丙申 丁酉 戊戌 己亥 庚子 辛丑 壬寅 癸卯</td><td><strong>辰 Chen · 巳 Si</strong> (Dragon, Snake)</td></tr>
<tr><td>甲辰旬 Jia Chen decade</td><td>甲辰 乙巳 丙午 丁未 戊申 己酉 庚戌 辛亥 壬子 癸丑</td><td><strong>寅 Yin · 卯 Mao</strong> (Tiger, Rabbit)</td></tr>
<tr><td>甲寅旬 Jia Yin decade</td><td>甲寅 乙卯 丙辰 丁巳 戊午 己未 庚申 辛酉 壬戌 癸亥</td><td><strong>子 Zi · 丑 Chou</strong> (Rat, Ox)</td></tr>
</table>
<p>There is a way to do it without the table. Count your day stem backward to 甲, then count your day branch backward by the same number of steps. That gives the first pillar of your decade, and the two branches just before its branch are your void. Take the <a href="/en/guide/day-pillar/bing-wu/">Bing Wu (丙午)</a> day pillar: 丙 is two steps after 甲, and two steps back from 午 is 辰, so the decade is 甲辰旬 and the void is the pair before 辰, namely 寅 and 卯.</p>
<ol>
<li><strong>Cast your chart</strong> on the <a href="/en/">calculator</a> and read your day pillar.</li>
<li><strong>Find its decade</strong> in the table and read the two void branches.</li>
<li><strong>Check your year, month and hour branches</strong> for those two characters. Then, as a second check, repeat the lookup with your year pillar.</li>
</ol>
<p>One useful fact falls out of the arithmetic: <strong>by the day-pillar method, your day branch can never be void</strong>, because it already has its stem within the decade. So a day-pillar void can only sit in the year, month or hour branch.</p>

<h2>How the void is read</h2>
<p>The traditional reading is short. A branch in the void has less force behind it, so the Ten God it carries, and the family member it stands for, acts weakly or shows up late. To that the classics add one principle: <strong>if a character that helps you is void, that is a pity; if a character that burdens you is void, the burden is lighter.</strong> What helps and what burdens is decided by the balance of the whole chart, the analysis that identifies the <a href="/en/guide/useful-god/">useful god</a>. The same logic applies to the special stars: a <a href="/en/guide/nobleman-star/">Nobleman</a> branch in the void is read as a weakened Nobleman.</p>
<p>Modern readers describe the void as a gap between effort and the sense of possession. The area a void branch points to never quite feels held, however hard one works at it, and people are more at ease there once they loosen their grip on the outcome and find the meaning in the process. A void Wealth star suggests money that flows through rather than piles up; a void Authority star suggests someone who would rather be recognized for ability than for a title. Charts with several void branches have long been read as drawn to philosophy, religion and art, the domains that do not run on ordinary accounting.</p>

<h2>What it means in each pillar</h2>
<ul>
<li><strong>Year branch void</strong>: a thin fence around ancestry and hometown. Early independence, and a life built on ground of one's own making rather than inherited ground.</li>
<li><strong>Month branch void</strong>: standing on one's own feet rather than on the help of parents and siblings. Because the month branch is the season itself and carries so much weight, some schools do not count a void here at all.</li>
<li><strong>Hour branch void</strong>: children, juniors and the later years. Results that ripen late, or satisfaction found in the work more than in its rewards.</li>
<li><strong>Day branch</strong>: never void by the day-pillar method. By the year-pillar method it can be, and even then readers treat it as a footnote rather than a verdict on the marriage.</li>
</ul>
<p>A void can be filled. When a void branch forms a combination (합, 合) or a clash (충, 沖) with another branch, whether in the natal chart or in a luck pillar or a year, readers say the empty seat has been set in motion and occupied, and the branch is no longer treated as void. This is haegong (해공, 解空), the "resolved void." A void 卯, for example, is filled by a 戌 (its six-harmony partner) or by a 酉 (its clash partner) anywhere in the chart or in the current year.</p>

<h2>When it arrives: 2026, 2027 and 2028</h2>
<p>When the branch of a luck pillar or a year is one of your void branches, readers call the period a void year. The classics warned that what is started in such a year tends to spin without catching. A more reasonable modern reading is <strong>a period for preparation and tidying up rather than for harvesting</strong>: not a ban, a change of gear.</p>
<ul>
<li><strong>2026 (丙午) and 2027 (丁未)</strong> have 午 and 未 as their branches, the void pair of the 甲申旬 decade. Anyone with a day pillar of 甲申, 乙酉, 丙戌, 丁亥, 戊子, 己丑, 庚寅, 辛卯, 壬辰 or 癸巳 passes through two void years in a row. Contracts and big decisions deserve one more review, and the two years are well spent strengthening foundations rather than opening new fronts.</li>
<li><strong>2028 (戊申)</strong> brings 申, one of the void branches of the 甲戌旬 decade, and 2029 (己酉) brings the other. Day pillars from 甲戌 to 癸未 get their own pair of void years next.</li>
<li>丙午, 丁未 and 戊申 all belong to the 甲辰旬 decade, so everyone born from the Jia Chen year of 2024 to the Gui Chou year of 2033, counted from Ipchun, has a year-pillar void of 寅 and 卯. See <a href="/en/guide/ipchun-year-boundary/">why the saju year starts at Ipchun</a>.</li>
<li>A ten-year <a href="/en/guide/luck-pillars/">luck pillar</a> on a void branch is read as a decade whose theme matures slowly, accumulating inside more than it shows outside.</li>
</ul>

<h2>The modern reading</h2>
<p><strong>Strengths first.</strong> People with a void in the chart are often unusually free in the very area the void marks. They hold money, titles or family expectations more lightly than others, which makes them good at work whose rewards are delayed or intangible: research, the arts, teaching, care, anything done for its own sake. A void year, read well, is a productive one: the studying gets done, the files get sorted, the long-postponed conversation happens.</p>
<p><strong>Then the cautions.</strong> Lightness can slide into not trying, and a void that is used as an excuse becomes self-fulfilling. The void does not say that a domain is closed to you; it says the usual sense of grip will be weaker there, so build structure deliberately: written plans, deadlines, a second person to check the numbers. And keep the proportions in mind. Every one of the sixty day pillars has a void pair; it is a calculation that applies to everyone, and plenty of charts contain no void branch at all.</p>

<h2>Questions people ask</h2>
<h3>Does having a void mean my life will feel empty?</h3>
<p>No. All sixty day pillars have two void branches; the question is only whether those branches happen to appear in your chart. Many people have none, and those who do have a note about one area of life, not a description of the whole.</p>
<h3>Should I avoid doing anything important in a void year?</h3>
<p>A void year is a signal to adjust speed, not a stop sign. Work whose results can arrive late, such as study, preparation, organizing and repair, suits it well. If a big decision cannot wait, take it; just review it once more than usual.</p>
<h3>Is the void always a bad thing?</h3>
<p>No. The traditional rule says that a burdensome character in the void becomes less of a burden. Whether a void helps or hinders depends entirely on which character is empty, which is why the void is read after the main analysis of the chart, never before it.</p>
<p>To find yours, <a href="/en/">cast your chart</a>, read the day pillar and locate its decade in the table. Then check the year, month and hour branches for the two void characters, and look at whether anything in the chart combines with or clashes them.</p>
` },

  { slug: 'wonjin', cat: 'stars', published: '2026-09-15',
    title: 'Wonjin (Resentment Pairs) in Saju: The Six Pairs Explained',
    desc: 'Wonjin (wonjinsal), the six resentment pairs of Korean saju: the old animal rhymes, where the pairs sit in a chart, and which zodiac animal is your wonjin.',
    links: [{ href: '/en/zodiac/compatibility/', title: 'Zodiac compatibility chart' }, { href: '/en/match/', title: 'Match two charts' }, { href: '/en/guide/peach-blossom/', title: 'Peach Blossom and the special stars' }],
    body: `
<p>"Those two are wonjin; it will never work" is a line you hear whenever Koreans talk about compatibility. <strong>Wonjin</strong> (원진, 怨嗔), or wonjinsal (원진살, 怨嗔殺), is made of two characters meaning resentment and anger. The name is harsh, but what it describes is closer to the small, persistent friction of daily life than to open conflict. It is also a distinctly Korean reading: the six pairs are watched closely in Korean saju and appear in few of the standard Chinese BaZi textbooks, which list the six clashes, harms and punishments instead. This guide gives the six pairs, translates the old rhymes that explain them, shows where the pairs sit inside a single chart, and explains how to use, and how not to overuse, wonjin in compatibility.</p>

<h2>One seat beside the clash</h2>
<p>Wonjin is a relationship between two earthly branches, and there are exactly six pairs: <strong>子–未 (Zi and Wei), 丑–午 (Chou and Wu), 寅–酉 (Yin and You), 卯–申 (Mao and Shen), 辰–亥 (Chen and Hai) and 巳–戌 (Si and Xu)</strong>.</p>
<p>The pairs follow a rule. Arrange the twelve branches in a circle like a clock and each branch clashes with the one directly opposite, six seats away. Wonjin is the branch <strong>right next to the clash partner</strong>. 子 clashes 午, and its wonjin is the next seat, 未; 丑 clashes 未, and its wonjin is the seat before, 午. For the yang branches (子寅辰午申戌) the wonjin is one seat after the clash partner; for the yin branches (丑卯巳未酉亥) it is one seat before. As a result two wonjin branches are always five or seven seats apart.</p>
<p>The geometry explains the character of the pair. A clash is a head-on collision; wonjin is a glancing one. It is not the big fight that ends things but the slow accumulation of hurt feelings from mismatched tempo, tone and expectations. Korean readers therefore call wonjin the relationship "that feels wronged for no reason." Our <a href="/en/guide/gunghap/">gunghap guide</a> covers the clashes and combinations that sit beside it.</p>

<h2>The six pairs and the old rhymes</h2>
<p>Wonjin is usually spoken of in terms of the zodiac animals, and the old teachers memorized it with a rhyme that blames each animal's looks and habits.</p>
<table>
<tr><th>Branches</th><th>Animals</th><th>Rhyme</th><th>Translation</th></tr>
<tr><td>子 Zi – 未 Wei</td><td>Rat – Goat</td><td>鼠忌羊頭角</td><td>The rat dreads the horns on the goat's head.</td></tr>
<tr><td>丑 Chou – 午 Wu</td><td>Ox – Horse</td><td>牛憎馬不耕</td><td>The ox resents the horse that does not plow.</td></tr>
<tr><td>寅 Yin – 酉 You</td><td>Tiger – Rooster</td><td>虎憎鷄嘴短</td><td>The tiger despises the rooster's short beak.</td></tr>
<tr><td>卯 Mao – 申 Shen</td><td>Rabbit – Monkey</td><td>兎怨猴不平</td><td>The rabbit resents the monkey's restlessness.</td></tr>
<tr><td>辰 Chen – 亥 Hai</td><td>Dragon – Pig</td><td>龍嫌猪面黑</td><td>The dragon dislikes the pig's black face.</td></tr>
<tr><td>巳 Si – 戌 Xu</td><td>Snake – Dog</td><td>蛇驚犬吠聲</td><td>The snake is startled by the dog's barking.</td></tr>
</table>
<p>Read the rhymes and you notice how small the grievances are: the shape of a pair of horns, the length of a beak, the sound of barking. Nobody has done anything wrong; the other animal is simply built differently, and that is irritating. That is the whole psychology of wonjin. It is friction born of difference, not of fault.</p>
<ol>
<li><strong>Cast your chart</strong> on the <a href="/en/">calculator</a> and write down your four branches: year, month, day and hour.</li>
<li><strong>Look for any of the six pairs</strong> among them. Two branches make a wonjin pair wherever they sit.</li>
<li><strong>For compatibility</strong>, compare your year branch (your animal) with the other person's, and then, more importantly, your day branch with theirs.</li>
</ol>

<h2>Wonjin inside one chart: which seats</h2>
<p>Wonjin is not only a compatibility tool. When two of the four branches in a single chart form a pair, readers expect friction between the two areas of life those seats govern.</p>
<ul>
<li><strong>Year and month</strong>: the environment you grew up in against the direction you take into society. Typically the family's expectations and the path you chose do not line up, and the tension is felt in early adulthood.</li>
<li><strong>Month and day</strong>: work against home. The person you are outside and the person you are at home move differently, and a clear boundary between the two helps.</li>
<li><strong>Day and hour</strong>: the spouse seat against the children's seat. Within the family this shows as a difference of pace between generations.</li>
<li><strong>Year and day</strong>: the elders against you, or the elders against your spouse: a difference in grain between the family you came from and the household you make.</li>
</ul>
<p>In every case the pair marks a point where friction is likely, not a prophecy of estrangement. Knowing where the contact point is lets you adjust distance and tone before feelings pile up.</p>

<h2>Which animal is your wonjin, and how much it weighs</h2>
<p>Each zodiac animal has exactly one wonjin animal: Rat and Goat, Ox and Horse, Tiger and Rooster, Rabbit and Monkey, Dragon and Pig, Snake and Dog. In a couple reading the year-branch wonjin compares one character out of eight, and saju compatibility puts far more weight on the two Day Masters, the two day branches and whether the two charts' elements fill each other's gaps. A couple whose animals are wonjin but whose Day Masters combine, or whose day branches form a six harmony, has a very different texture from what the animal pairing alone suggests.</p>
<p>The arithmetic keeps the animal version in proportion.</p>
<ul>
<li>Of the twelve animals, only one is your wonjin: a one-in-twelve chance with a random partner.</li>
<li>Because the pairs are five or seven seats apart, an animal wonjin only occurs between people <strong>born five or seven years apart</strong> (or seventeen or nineteen, adding a cycle), and even then only in half of those cases.</li>
<li>Animals change at Ipchun, around February 4, not on January 1. Someone born in January or early February usually belongs to the previous animal, and a wrong animal gives a wrong wonjin. See <a href="/en/guide/ipchun-year-boundary/">the Ipchun rule</a>.</li>
</ul>
<p>Sajucheop's <a href="/en/zodiac/compatibility/">zodiac compatibility chart</a> counts wonjin as one friction among the branch relationships it scores; the Day Pillar score on the <a href="/en/match/">match page</a> leaves it out, because at that level the Day Masters and day branches carry the reading.</p>

<h2>When it arrives: 2026, 2027 and 2028</h2>
<p>When the branch of a year is wonjin to your year branch or your day branch, readers say the year calls for care with subtle misunderstandings between people. The branch of a ten-year <a href="/en/guide/luck-pillars/">luck pillar</a> is read the same way.</p>
<ul>
<li><strong>2026, Bing Wu (丙午)</strong>: 午 is wonjin to 丑. That covers Oxen, and everyone whose day branch is 丑: the <a href="/en/guide/day-pillar/yi-chou/">Yi Chou</a>, <a href="/en/guide/day-pillar/ding-chou/">Ding Chou</a>, Ji Chou, Xin Chou and Gui Chou day pillars. 丑 and 午 also form a harm (해, 害), so the two relationships overlap.</li>
<li><strong>2027, Ding Wei (丁未)</strong>: from Ipchun on February 4, 2027, the year branch is 未, wonjin to 子. That covers Rats, and the 子 day branches: <a href="/en/guide/day-pillar/jia-zi/">Jia Zi</a>, Bing Zi, Wu Zi, Geng Zi and Ren Zi. 子 and 未 are a harm pair as well.</li>
<li><strong>2028, Wu Shen (戊申)</strong>: 申 is wonjin to 卯. Rabbits, and the 卯 day branches Yi Mao, Ding Mao, Ji Mao, Xin Mao and Gui Mao, get their turn.</li>
</ul>
<p>The practical habits for a wonjin year are modest. Put important things in writing, say what bothered you the same day instead of storing it, and meet in groups more often than one-on-one when a relationship is running hot. The year-by-year pages for each animal, such as the <a href="/en/2027/rat/">Rat in 2027</a>, walk through the details.</p>

<h2>The modern reading</h2>
<p><strong>Strengths first.</strong> A wonjin pair, in a chart or between two people, is a difference of make-up that becomes visible up close. Difference is also complementarity: the ox that plows and the horse that runs are good at different things, and couples and colleagues who name the difference rather than resent it often make it their strength. Because wonjin is friction rather than rupture, it is one of the more manageable patterns in the catalog, answered by distance, timing and tone rather than by any big decision.</p>
<p><strong>Then the cautions.</strong> The risk with wonjin is accumulation. Small irritations left unspoken harden into a story about the other person, and the story does more damage than any of the irritations did. The other caution is about the reading itself: wonjin is one of several branch relationships, alongside combinations, clashes, harms, punishments and breaks, and it is never enough on its own to judge a chart or a couple.</p>

<h2>Questions people ask</h2>
<h3>We are wonjin. Should we not get married?</h3>
<p>Wonjin is not a reason to end anything. It tells two people where the friction is likely to come from and suggests what to adjust: a little more distance, a warmer tone, a habit of clearing the air early. Plenty of long marriages are wonjin pairs by animal; they simply learned where the edges were.</p>
<h3>Is wonjin the same as gwimun gwansal?</h3>
<p>No, though the two are often named together. Gwimun gwansal (귀문관살, 鬼門關殺), the "ghost gate" star, shares four pairs with wonjin (丑午, 卯申, 辰亥, 巳戌) but uses 子酉 and 寅未 in place of wonjin's 子未 and 寅酉. It is read as a different kind of sensitivity, and the two should not be merged.</p>
<h3>Is wonjin only used for zodiac compatibility?</h3>
<p>No. As the sections above show, it is read between the branches of a single chart, and between a chart and its luck pillars and years. The zodiac version is simply the best known because it needs only two birth years.</p>
<p>To check a pair, look up both animals on the <a href="/en/zodiac/compatibility/">zodiac compatibility chart</a>, and to go beyond the year branch, put both birth dates into the <a href="/en/match/">match page</a>, which compares the Day Masters and day branches too. The related patterns are covered in <a href="/en/guide/peach-blossom/">Peach Blossom and the special stars</a>.</p>
` },
];
