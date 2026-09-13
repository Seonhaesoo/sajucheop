/* English library articles — Korean saju culture. 2026-09-13
 * Ipchun times are published almanac times (2027 10:46 KST; the engine runs a few minutes early).
 * Pillars, element counts and match scores were computed with tools/engine.mjs
 * (English match formula as in docs/en/match/index.html). Lunar New Year dates: tools/cny.mjs.
 * Real-world facts are attributed in the text to the outlets that reported them. */
export const ARTICLES = [
  {
    slug: 'gunghap',
    cat: 'culture',
    published: '2026-09-13',
    title: 'Gunghap: How Koreans Check Couple Compatibility',
    desc: 'Why Korean families ask for your birth time: what gunghap compares, how our match score works, a worked example, and how to read a low result calmly.',
    links: [
      { href: '/en/match/', title: 'Check your gunghap' },
      { href: '/en/guide/compatibility/', title: 'Day Master compatibility' },
      { href: '/en/zodiac/compatibility/', title: 'Birth-year animal compatibility' },
    ],
    body: `
<p>Sooner or later, many people dating a Korean partner hear some version of the same request: could you share your exact birth date and time? Often a parent is asking, and the reason has a name. <b>Gunghap</b> (궁합, 宮合) is the traditional reading of a couple's compatibility through their saju, or Four Pillars charts. Here is what is being compared, why it still matters to some families, how Sajucheop turns it into a score, and how to take a disappointing number in stride.</p>

<h2>Where gunghap shows up in Korean life</h2>
<p>For centuries gunghap was part of the wedding itself. The Encyclopedia of Korean Culture places it inside <em>napchae</em> (납채, 納采), the betrothal step. The groom's family sent the bride's family a <b>saju danja</b> (사주단자, 四柱單子): a sheet of paper folded five or seven times, with the groom's year, month, day and hour of birth written in the middle, sealed in an envelope and bound with blue and red thread. The bride's family asked a diviner to read it for good and bad signs and to judge the couple's match. If the charts were found to carry harmful influences, the marriage could be called off. Otherwise the document was later packed with the bride's trousseau, to be kept in her wardrobe for the rest of her life.</p>
<p>Arranged marriages have given way to couples choosing each other, and the same encyclopedia notes the prevailing view that the custom will keep fading now that couples get to know each other before marrying. Still, it never quite left. Couples check it for fun at saju cafés, some parents ask for a reading before the two families meet, and in 2018 it carried a whole period comedy, <em>The Princess and the Matchmaker</em>, whose Korean title is simply <em>Gunghap</em>. A request for your birth time is usually curiosity or care, not a test you can fail.</p>

<h2>Three ways to check a match</h2>
<p>"Checking gunghap" can mean very different things, depending on how much of each chart is used.</p>
<table>
<tr><th>Method</th><th>What is compared</th><th>What you need</th><th>Limitation</th></tr>
<tr><td>Animal-sign match (띠 궁합, tti gunghap)</td><td>The branch of each birth year</td><td>Birth years</td><td>Everyone born in the same year gets the same answer</td></tr>
<tr><td>Day Master match</td><td>The stem of each birth day</td><td>Birth dates</td><td>Only the core temperament; 100 possible pairings</td></tr>
<tr><td>Full saju match</td><td>All eight characters of both charts</td><td>Birth dates and times</td><td>Without a birth time, six characters instead of eight</td></tr>
</table>
<p>Animal signs are the version most people know, but the year branch is only one character out of eight. The heart of a chart is the <b>Day Pillar</b>: the <b>Day Master</b> (일간, ilgan), the stem that stands for you, and the <b>Day Branch</b> (일지, ilji) beneath it, traditionally called the spouse palace. A serious gunghap reading therefore starts from the two Day Pillars.</p>

<h2>What is actually compared</h2>
<h3>1. The two Day Masters</h3>
<p>The ten stems relate to each other in five ways. Five pairs <b>combine</b> (합, hap): 甲己, 乙庚, 丙辛, 丁壬 and 戊癸, read as a pull toward each other that creates something neither has alone. Four pairs <b>clash</b> (충, chung): 甲庚, 乙辛, 丙壬 and 丁癸, two natures meeting head-on. Yang and Yin Earth (戊 and 己) clash with nobody. Every other pairing either shares an element, has one element feeding the other (Wood feeds Fire, Fire feeds Earth, Earth feeds Metal, Metal feeds Water, Water feeds Wood), or has one element controlling the other. Our <a href="/en/guide/compatibility/">Day Master compatibility table</a> lays out all 100 pairings.</p>
<h3>2. The two Day Branches</h3>
<p>This is the texture of daily life together: sleep, pace, habits, the feel of a shared home. Six pairs form a <b>six harmony</b> (육합): 子丑, 寅亥, 卯戌, 辰酉, 巳申 and 午未. Branches from the same <b>trine</b> (삼합), such as 申子辰 or 寅午戌, pull in one direction like teammates. Six pairs <b>clash</b>: 子午, 丑未, 寅申, 卯酉, 辰戌 and 巳亥.</p>
<h3>3. Elements that fill each other's gaps</h3>
<p>If one chart has none of an element and the other carries it, the two are said to complete each other. It is the most intuitive part of gunghap, and many couples find it the most persuasive.</p>
<h3>4. Wonjin, the quiet irritant</h3>
<p>Korean tradition watches one more branch relationship closely: <b>wonjin</b> (원진, 怨嗔), "resentment," found in the pairs 子未, 丑午, 寅酉, 卯申, 辰亥 and 巳戌. Old rhymes explain it with animal quirks, such as the Rat that cannot stand the Goat's horns. It describes friction that builds from small differences rather than open fights. Our birth-year animal chart counts it as a friction; the Day Pillar match score leaves it out. The other named patterns of this kind are covered in our guide to <a href="/en/guide/peach-blossom/">Peach Blossom and the special stars</a>.</p>
<p>One structural detail surprises most people. In the sixty pillars, yang stems sit only on yang branches and yin stems only on yin ones. Every stem combination joins a yang and a yin Day Master, while every branch clash and every trine joins two branches of the same polarity. So a couple whose Day Masters combine can never have clashing Day Branches, and a couple whose Day Masters clash can never share a six harmony. Opposite polarities meet softly or not at all in the branches; same polarities are where both the trines and the clashes live.</p>

<h2>How Sajucheop scores a match</h2>
<p>The <a href="/en/match/">English match page</a> needs only two birth dates, so it reads six characters per person and leaves out the hour. Every couple starts at 62, and the score moves like this:</p>
<table>
<tr><th>Step</th><th>Relationship</th><th>Points</th></tr>
<tr><td>Day Masters</td><td>Combine</td><td>+18</td></tr>
<tr><td>Day Masters</td><td>One element feeds the other</td><td>+10</td></tr>
<tr><td>Day Masters</td><td>Same element</td><td>+4</td></tr>
<tr><td>Day Masters</td><td>One element controls the other</td><td>−6</td></tr>
<tr><td>Day Masters</td><td>Clash</td><td>−12</td></tr>
<tr><td>Day Branches</td><td>Six harmony, same trine, or clash</td><td>+12, +10 or −16</td></tr>
<tr><td>Elements</td><td>Each element one of you lacks entirely and the other has (up to two each way, +10 in total)</td><td>+5 each</td></tr>
<tr><td>Yin and yang</td><td>Day Masters of opposite polarity</td><td>+4</td></tr>
</table>
<p>The result is kept between 30 and 99 and given a label: 90 and up is "A rare, fated fit," the 80s "Deeply harmonious," the 70s "A warm, workable match," the 60s "Complementary with effort," 45 to 59 "A study in contrasts," and anything lower "A challenge — and a teacher." The page also names what each of you is to the other in the <a href="/en/guide/ten-gods/">Ten Gods</a>, which often says more than the number. Sajucheop's Korean-language match uses exactly the same formula; when birth times are entered there, it also counts the elements of the hour pillar.</p>

<h2>A worked example</h2>
<p>Ha-eun was born in Seoul on March 10, 1996, and Ethan on August 30, 1994. Neither knows a birth time, which is fine for this page. Their six characters:</p>
<ul>
<li><b>Ha-eun:</b> year 丙子, month 辛卯, day 丙午. Day Master Yang Fire (丙). Elements: Fire 3, Wood 1, Metal 1, Water 1, Earth 0.</li>
<li><b>Ethan:</b> year 甲戌, month 壬申, day 戊子. Day Master Yang Earth (戊). Elements: Earth 2, Water 2, Wood 1, Metal 1, Fire 0.</li>
</ul>
<table>
<tr><th>Step</th><th>What we see</th><th>Score</th></tr>
<tr><td>Start</td><td>Every couple begins here</td><td>62</td></tr>
<tr><td>Day Masters</td><td>Her Fire feeds his Earth</td><td>+10</td></tr>
<tr><td>Day Branches</td><td>午 (Horse) and 子 (Rat) clash</td><td>−16</td></tr>
<tr><td>Elements</td><td>He brings the Earth she lacks; she brings the Fire he lacks</td><td>+10</td></tr>
<tr><td>Yin and yang</td><td>Both Day Masters are yang</td><td>0</td></tr>
<tr><td>Total</td><td>"Complementary with effort"</td><td>66</td></tr>
</table>
<p>Read the lines, not just the total. To Ha-eun, Ethan is the <b>Eating God</b>, which the match page calls "the Feast": around him, appetite and laughter come back. To Ethan, Ha-eun is the <b>Indirect Resource</b>, "the Oracle": conversations with her go places no one else takes him. The Day Branch clash is the practical warning. Their daily rhythms, from bedtimes to how tidy a home should be, will rub, and agreeing on those house rules early turns a clash into a division of labor.</p>
<p>Notice what the animal signs would have said. Ha-eun is a Rat and Ethan a Dog, a pair that scores a middling 54 on our <a href="/en/zodiac/compatibility/">zodiac compatibility chart</a> and reveals nothing about the Day Branch clash or the elements they trade. That gap is exactly why Korean readers start from the Day Pillars.</p>

<h2>How to read a "bad" result</h2>
<p>Low scores come from a small number of structures. Take two Day Pillars that clash on both levels: Yang Wood on the Monkey (甲申) and Yang Metal on the Tiger (庚寅). The couple starts at 62, loses 12 for the stem clash and 16 for the branch clash, and lands at 34. Even if each fills an element the other lacks, the ceiling is 44, "A challenge — and a teacher." Yet the Ten Gods tell a livelier story. To the Yang Wood partner, the Yang Metal partner is <b>Seven Killings</b>, "the Trial": demanding, but the kind of person you grow taller around. To the Metal partner, the Wood partner is <b>Indirect Wealth</b>, "the Venture": plans get bigger together. That describes a stretching relationship, not a doomed one.</p>
<p>A healthier way to use any result:</p>
<ul>
<li><b>Treat it as a map of friction points.</b> A clash tells you where you are likely to collide, such as pace, space or money habits. Name that area and agree on how you will handle it.</li>
<li><b>Look at the whole chart.</b> All eight characters, the Ten Gods between you and the element each person most needs (see the <a href="/en/guide/useful-god/">useful god</a>) can outweigh a single clash.</li>
<li><b>Mind the timing.</b> Luck pillars change every ten years, so a hard stretch for one partner is not a verdict on the pair. Our guide to <a href="/en/guide/luck-pillars/">luck pillars</a> explains how they shift.</li>
<li><b>Keep animal signs in proportion.</b> A clash or wonjin between birth years involves one character out of eight.</li>
<li><b>Talk to family with respect.</b> If a parent is worried, ask what the reader actually said. Usually it is one relationship in the chart, and going through the full reading together calms things more than arguing about fortune-telling.</li>
</ul>
<p>Saju is a tradition for reflection, not a verdict. A high score does not guarantee a happy marriage, and a low one is not a reason to end a good relationship.</p>
<p>To try it yourself, put both birth dates into the <a href="/en/match/">match page</a>, or send a link and let your partner enter their own. Compare your two Day Masters in the <a href="/en/guide/compatibility/">compatibility table</a>, check your birth-year animals on the <a href="/en/zodiac/compatibility/">zodiac chart</a>, and if you would like all eight characters first, <a href="/en/">cast your chart</a>.</p>
`,
  },
  {
    slug: 'peach-blossom',
    cat: 'culture',
    published: '2026-09-13',
    title: 'Peach Blossom (Dohwasal) and the Special Stars of Saju',
    desc: 'What dohwasal, the Peach Blossom star, really means in Korean saju, how to find it from your year or day branch, and seven other special stars in context.',
    links: [
      { href: '/en/', title: 'Cast your chart' },
      { href: '/en/guide/', title: 'The ten Day Masters' },
      { href: '/en/guide/day-pillar/', title: 'The 60 Day Pillars' },
    ],
    body: `
<p>If you watch Korean dramas or read Korean fan forums, you have probably seen someone described as having <b>dohwasal</b> (도화살, 桃花殺), the Peach Blossom star, usually with a knowing wink: this person is irresistible, or trouble. So what is it, how do you tell whether you have one, and should it worry you? The short answers: it is a label for magnetism, you can check for it in a minute, and no.</p>

<h2>What the special stars are</h2>
<p>Beyond the eight characters and their five elements, saju keeps a catalog of named patterns called <b>sinsal</b> (신살, 神殺), usually translated as special stars or symbolic stars. Each one is a specific combination: a certain branch appearing alongside another, or a certain pair of characters standing in one pillar. Many of the names end in <em>-sal</em> (殺), a character that literally means "kill" or "harm," which is why they sound far more alarming than they are. A few are openly positive, such as the Nobleman.</p>
<p>Korean readers treat the stars as accents. The main reading comes from the Day Master, the balance of the five elements and the <a href="/en/guide/ten-gods/">Ten Gods</a>. The stars add color to that picture, and none of them overrides it.</p>

<h2>How to find your Peach Blossom</h2>
<p>Peach Blossom is found from a reference branch: the branch of your birth year (your animal sign) or of your birth day. Modern Korean readers look from the day branch first and check the year branch as well.</p>
<ol>
<li>Cast your chart and note your year branch and day branch. In saju the year turns at Ipchun, around February 4, not on January 1 or at Lunar New Year (see <a href="/en/guide/ipchun-year-boundary/">why the year starts at Ipchun</a>).</li>
<li>Find your reference branch in the table below.</li>
<li>If the Peach Blossom branch appears anywhere else among your four branches (year, month, day, hour), your chart has a Peach Blossom.</li>
</ol>
<table>
<tr><th>Year or day branch</th><th>Animals</th><th>Peach Blossom</th><th>Peach Blossom years</th><th>Peach Blossom month</th></tr>
<tr><td>寅 午 戌</td><td>Tiger, Horse, Dog</td><td>卯 Rabbit</td><td>2023, 2035</td><td>about Mar 6 to Apr 4</td></tr>
<tr><td>申 子 辰</td><td>Monkey, Rat, Dragon</td><td>酉 Rooster</td><td>2017, 2029</td><td>about Sep 8 to Oct 7</td></tr>
<tr><td>巳 酉 丑</td><td>Snake, Rooster, Ox</td><td>午 Horse</td><td>2026, 2038</td><td>about Jun 6 to Jul 6</td></tr>
<tr><td>亥 卯 未</td><td>Pig, Rabbit, Goat</td><td>子 Rat</td><td>2020, 2032</td><td>about Dec 7 to Jan 5</td></tr>
</table>
<p>The four groups are the trines (삼합, samhap), branches that combine into one element, and there is a pattern worth remembering. The Peach Blossom is always the branch right after the first member of its trine, and it is always one of 子, 午, 卯 or 酉, the four branches at the height of winter, summer, spring and autumn. Readers tie the star's vividness to those mid-season branches, when each season's color is at its strongest. Old texts also call Peach Blossom <em>hamji</em> (咸池), after a mythical pool where the sun bathes.</p>

<h2>What modern readers take from it</h2>
<p>Peach blossoms stop people on a spring road without trying, and the star reads the same way: charm, visibility, expressiveness, a knack for drawing people in. Its old reputation for infidelity says more about the era than about the star. A woman's Peach Blossom was once judged harshly simply because being noticed in public was considered a flaw. Today it is read as social magnetism that serves well in sales, teaching, performance, design, hospitality and any work where people respond to you. Whether someone stays loyal depends on the rest of the chart and, above all, on the person.</p>
<p>Where the star sits changes its stage:</p>
<ul>
<li><b>Year branch:</b> first impressions and childhood; a child who stood out.</li>
<li><b>Month branch:</b> work and social life; charm as a professional asset.</li>
<li><b>Day branch:</b> the self and the spouse palace; warmth felt most in close relationships.</li>
<li><b>Hour branch:</b> later life and creative output; style that lasts, or work that draws an audience.</li>
</ul>
<p>Peach Blossom also comes and goes with time. The Fire Horse year, which runs until Ipchun on February 4, 2027, has 午 as its branch, so it is a Peach Blossom year for Snakes, Roosters and Oxen, and for anyone whose day branch is 巳, 酉 or 丑. The 未 of 2027 is not a Peach Blossom branch; the next Peach Blossom year is 2029, a 酉 year, for Monkeys, Rats and Dragons.</p>

<h2>The other stars Koreans talk about</h2>
<p>Seven more names come up often in Korean readings. The table shows how each is found and how it is read today.</p>
<table>
<tr><th>Star</th><th>How it is found</th><th>Modern reading</th></tr>
<tr><td>Traveling Horse, yeokmasal (역마살, 驛馬殺)</td><td>From the year or day branch: 寅午戌 → 申, 申子辰 → 寅, 巳酉丑 → 亥, 亥卯未 → 巳</td><td>Movement, travel, relocation, work on the road; once a worry, now often an asset</td></tr>
<tr><td>Canopy, hwagaesal (화개살, 華蓋殺)</td><td>The last branch of the same trine: 戌, 辰, 丑 or 未</td><td>Depth, study, art, faith, and a need for solitude that recharges</td></tr>
<tr><td>Nobleman, cheoneul gwiin (천을귀인, 天乙貴人)</td><td>From the Day Master: 甲戊庚 → 丑 未; 乙己 → 子 申; 丙丁 → 亥 酉; 辛 → 寅 午; 壬癸 → 巳 卯</td><td>Help that arrives through people, timely information, the ability to accept support</td></tr>
<tr><td>Goegang (괴강살, 魁罡殺)</td><td>A day pillar of 庚辰, 庚戌, 壬辰 or 壬戌; some schools add 戊戌, a few also 戊辰</td><td>Decisiveness, leadership, an uncompromising streak</td></tr>
<tr><td>Yangin, the Goat Blade (양인살, 羊刃殺)</td><td>From a yang Day Master: 甲 → 卯, 丙 and 戊 → 午, 庚 → 酉, 壬 → 子</td><td>Drive at its peak; strength that needs a sheath and a direction</td></tr>
<tr><td>White Tiger, baekhosal (백호살, 白虎殺)</td><td>One of seven pillars, weighed mainly as the day or month pillar: 甲辰, 乙未, 丙戌, 丁丑, 戊辰, 壬戌, 癸丑</td><td>Intensity, and composure under pressure</td></tr>
<tr><td>Wonjin (원진살, 怨嗔殺)</td><td>A pair of branches: 子未, 丑午, 寅酉, 卯申, 辰亥, 巳戌</td><td>Friction from small differences, within a chart or between two people</td></tr>
</table>
<p>A few notes keep these in proportion. The Traveling Horse is the branch that clashes with the first member of your trine, and the Canopy is the trine's last member, so a Dog's own year branch 戌 is already a Canopy; many readers only count it when it appears in another pillar. No Day Master has 辰 or 戌 as a Nobleman branch. Yangin placements differ between schools for yin Day Masters, so our guides list the yang ones. The White Tiger's old association with blood and accidents is exactly the kind of reading modern practitioners drop: roughly one person in eight or nine is born on a White Tiger day, far too many to say anything about anyone's safety. Wonjin matters most in couple readings, covered in our <a href="/en/guide/gunghap/">gunghap guide</a>.</p>
<p>The coming year brings its own accents. From Ipchun on February 4, 2027, the year's branch is 未. That makes 2027 a Canopy year for Pigs, Rabbits and Goats (a year for finishing and deepening rather than expanding), a Nobleman year for Yang Wood, Yang Earth and Yang Metal Day Masters, and a wonjin year for anyone whose year or day branch is 子.</p>

<h2>A worked example</h2>
<p>Take a chart for someone born on April 26, 1990, at 10 a.m. in Seoul. Its four pillars are 庚午 (year), 庚辰 (month), 辛酉 (day) and 癸巳 (hour).</p>
<ul>
<li><b>Peach Blossom:</b> the day branch 酉 belongs to the 巳酉丑 trine, whose Peach Blossom is 午. There is a 午 in the year pillar, so the chart has one, in the seat of first impressions. Looking from the year branch 午 instead, the Peach Blossom would be 卯, which does not appear.</li>
<li><b>Nobleman:</b> the Day Master is 辛, Yin Metal, whose Nobleman branches are 寅 and 午. The same 午 in the year pillar carries it, pointing to help from elders or family early in life.</li>
<li><b>Traveling Horse and Canopy:</b> the chart would need 亥 or 丑 from the day branch, or 申 or 戌 from the year branch. None appear.</li>
<li><b>Goegang:</b> the month pillar 庚辰 is one of the Goegang pairs, but Goegang is read mainly on the day pillar, so here it is a light note at most.</li>
</ul>
<p>Now the part the stars cannot tell you. This Day Master is Yin Metal, and the chart holds four Metal characters (庚, 庚, 辛 and 酉), two Fire, one Earth, one Water and no Wood at all. The day branch 酉 forms a six harmony with the month's 辰 and half a Metal trine with the hour's 巳, so Metal dominates. A reader would begin with that strength, with the missing Wood (the element of wealth for a Metal Day Master) and with the Fire that refines Metal, and only then mention the charming, well-supported year pillar. The stars are in the chart. They are just not what the chart is about.</p>

<h2>Why the stars stay secondary</h2>
<ul>
<li><b>They are common.</b> Any single branch has a one-in-six chance of being one of your two Nobleman branches, and seven of the sixty day pillars are White Tiger pillars. Most charts carry a star or two.</li>
<li><b>They depend on the reference point.</b> Lookups from the year branch and from the day branch can disagree, and schools differ on details such as the extra Goegang pillars or the Yangin of yin Day Masters.</li>
<li><b>They describe; they do not decide.</b> A Peach Blossom does not make anyone unfaithful, and a missing Nobleman does not leave anyone without help. What you do with charm, mobility or intensity is up to you.</li>
<li><b>They are never a health or safety forecast.</b> No star tells you about accidents or illness. Those belong with doctors and ordinary caution.</li>
</ul>
<p>To check your own chart, <a href="/en/">cast your Four Pillars</a> and match your branches against the tables above. Then meet your Day Master among <a href="/en/guide/">the ten Day Masters</a>, look up your birth day in <a href="/en/guide/day-pillar/">the 60 Day Pillars</a>, and if you want the bigger picture first, start with <a href="/en/guide/read-saju-chart/">how to read a saju chart</a>.</p>
`,
  },
  {
    slug: 'saju-reading-seoul',
    cat: 'culture',
    published: '2026-09-13',
    title: "Getting a Saju Reading in Seoul: A Visitor's Guide",
    desc: 'Saju café or traditional reader? Where to go in Seoul, what readings cost as of 2026, what to bring, Korean phrases to use, and how to follow along.',
    links: [
      { href: '/en/', title: 'Cast your chart before you go' },
      { href: '/en/match/', title: 'Check a couple match' },
    ],
    body: `
<p>A saju reading has become one of Seoul's more unusual souvenirs: half an hour across a small table from someone who takes your birth date, writes out eight characters and talks about your work, your love life and the next ten years. If you are planning one, you probably want to know where to go, what it costs, what to bring and whether you will understand a word. This guide answers those questions, with prices as reported by Korean and international media through 2026.</p>

<h2>Saju cafés, traditional readers and shamans</h2>
<p>Three quite different things can sit behind a sign promising to tell your fortune.</p>
<table>
<tr><th>Type</th><th>What happens</th><th>Typical length</th><th>Language</th></tr>
<tr><td>Saju or tarot café</td><td>A casual café where readers offer saju, tarot and sometimes palm or face reading, often with a drink included</td><td>Around 20 to 30 minutes</td><td>Some offer English, Japanese or Chinese</td></tr>
<tr><td>Traditional saju reader</td><td>A practitioner, a yeoksurin (역술인), works through your chart, often in an office signed cheolhakgwan (철학관, "philosophy house")</td><td>Varies; longer sessions are common</td><td>Mostly Korean</td></tr>
<tr><td>Shaman</td><td>A musogin (무속인) gives sinjeom (신점), readings said to come through spirits rather than from a chart</td><td>Varies</td><td>Mostly Korean</td></tr>
</table>
<p>For a first reading, a café is the easy choice: simple booking or walk-ins, a relaxed setting and readers who are used to foreign visitors. A traditional reader suits you if you already know some saju or can bring an interpreter. A shaman offers a different tradition altogether, which is worth knowing before you sit down.</p>

<h2>Where to look</h2>
<ul>
<li><b>Hongdae and Yeonnam-dong</b> (Mapo-gu): the thickest cluster of saju and tarot cafés aimed at students and tourists. VisitKorea's own write-up of a café visit here describes 30-minute readings, walk-ins and reservations through Naver, Korea's main portal and maps app.</li>
<li><b>Myeong-dong and Seongsu-dong</b>: The Korea Herald reported in 2025 that cafés in these areas, as well as in Hongdae, put up signs in English, Japanese and Chinese for foreign visitors.</li>
<li><b>Gangnam</b>: a 2024 Korea Times analysis of Naver listings found the densest concentration of fortune-telling businesses around Nonhyeon Station, including shamans who charge well above café prices.</li>
<li><b>Miari (Mia-ri)</b> in northern Seoul: a fortune-tellers' village that grew up around blind fortune-tellers from 1966. AFP reported in August 2026 that fewer than 20 practitioners remain, down from 70 to 80 at its peak, as more Koreans turn to apps and AI chatbots.</li>
</ul>
<p>Seoul's official tourism site, Visit Seoul, also lists a Hongdae saju café that offers English and Japanese interpretation, a sign of how established readings for visitors have become.</p>

<h2>What it costs and how long it takes</h2>
<p>Prices are set by each reader and change often, so treat these as ballpark figures from recent reporting, not a price list:</p>
<table>
<tr><th>Setting</th><th>Reported price</th><th>Reported by</th></tr>
<tr><td>Hongdae café, quick reading</td><td>About 20,000 won</td><td>The Korea Times, 2024</td></tr>
<tr><td>Hongdae café, in-depth reading</td><td>About 50,000 won</td><td>The Korea Times, 2024</td></tr>
<tr><td>Café aimed at visitors, 30-minute session</td><td>About 50,000 won</td><td>The Korea Herald, 2025</td></tr>
<tr><td>Veteran fortune-teller at Miari</td><td>50,000 won</td><td>AFP, 2026</td></tr>
<tr><td>Gangnam shaman, single or couple's session</td><td>100,000 or 200,000 won</td><td>The Korea Times, 2024</td></tr>
</table>
<p>As of 2026, then, budget roughly 20,000 to 50,000 won for a café reading of 20 to 30 minutes, and more for a couple's compatibility reading (gunghap, 궁합) or a well-known name. Ask the price and the length before you start; many cafés offer separate options such as a general reading, love, career or compatibility. Cards are widely accepted in Seoul, though a little cash helps at small shops, and tipping is not expected.</p>

<h3>How a session usually unfolds</h3>
<p>Most readings follow a similar arc. The reader enters your birth details into a manseryeok (만세력, 萬歲曆), the perpetual calendar that converts a date and time into four pillars, whether that is an app, a computer program or a thick printed book. Eight characters appear, and a good reader points to your Day Master, the stem of your birth day, before anything else, because the whole reading is built around it.</p>
<p>From there the conversation usually moves from the general to the specific: your temperament and the balance of the five elements, then the ten-year luck pillar you are in now and the year ahead, and finally your own questions. For gunghap, the reader sets two charts side by side and compares the Day Masters, the day branches and the elements each person lacks. At a café, expect a brisk version of this in 20 to 30 minutes; with a traditional reader it can run longer and go deeper into timing. If something sounds alarming, ask which part of the chart it comes from. A clear answer is a good sign; vague warnings followed by a sales pitch are not.</p>

<h2>What to bring: a checklist</h2>
<ul>
<li><b>Your exact birth date,</b> and whether it is solar or lunar. Many older Koreans celebrate lunar birthdays, so readers ask: yangnyeok (양력) means solar, eumnyeok (음력) lunar. If you grew up with the Western calendar, yours is solar.</li>
<li><b>Your birth time,</b> as precise as possible. A birth certificate or hospital record beats family memory. Without it, a reader works from six characters instead of eight, which still covers your Day Master and most of the chart.</li>
<li><b>Your birthplace and time zone.</b> A reader in Seoul will usually assume Korean time. If you were born in Toronto or Sydney, say so, or better, bring a chart already calculated for your time zone (see the last section).</li>
<li><b>Your gender,</b> which readers ask because it sets the direction of your ten-year luck pillars.</li>
<li><b>Two or three focused questions.</b> "A career change in the next two years" gets a richer answer than "tell me everything."</li>
<li><b>Your partner's details, with their consent,</b> if you want a gunghap reading together.</li>
<li><b>A way to take notes.</b> Readings move fast. Ask before you record audio.</li>
</ul>

<h2>Language tips</h2>
<p>At cafés that advertise English or other languages you will be fine. The Korea Herald noted that smaller shops rely on translation tools, and an app such as Papago works but loses nuance. A few Korean phrases go a long way:</p>
<table>
<tr><th>Korean</th><th>Romanization</th><th>Meaning</th></tr>
<tr><td>사주 봐 주세요</td><td>saju bwa juseyo</td><td>Please read my saju</td></tr>
<tr><td>궁합 봐 주세요</td><td>gunghap bwa juseyo</td><td>Please read our compatibility</td></tr>
<tr><td>영어 되나요?</td><td>yeongeo doenayo?</td><td>Is English available?</td></tr>
<tr><td>양력 / 음력</td><td>yangnyeok / eumnyeok</td><td>Solar / lunar calendar</td></tr>
<tr><td>태어난 시간은 몰라요</td><td>taeeonan siganeun mollayo</td><td>I don't know my birth time</td></tr>
<tr><td>녹음해도 될까요?</td><td>nogeumhaedo doelkkayo?</td><td>May I record this?</td></tr>
</table>
<p>Expect some technical vocabulary even in English. Readers talk about your Day Master, your strong or missing elements and your current luck pillar, daeun (대운). Korean readers can also be direct about marriage timing, money or health. You are free to steer: "Please focus on work" is a perfectly polite request.</p>

<h2>Etiquette and good sense</h2>
<ul>
<li>Arrive on time if you booked; popular cafés run on tight slots, and walk-ins may wait.</li>
<li>Readings are usually one person at a time, or both partners together for gunghap.</li>
<li>Treat it as a conversation. Ask what a term means, or which rule the reader is applying.</li>
<li>You never have to buy extras. If anyone suggests an expensive talisman, a bujeok (부적), or a ritual to "fix" your fate, a polite "no, thank you" ends the matter.</li>
<li>Leave medical, legal and financial decisions to professionals in those fields. Saju is a tradition for reflection, not a guarantee.</li>
</ul>

<h2>Follow along with your own chart</h2>
<p>The best preparation takes two minutes. Cast your chart on our <a href="/en/">Four Pillars calculator</a>, choosing the time zone of your birthplace (including daylight saving if it applied), and save a screenshot of the pillars. Korean readers can read those Chinese characters directly, which spares them a conversion and gives you both the same starting point. During the reading, match what you hear to the screen: which character is your Day Master, which elements are strong or missing, and where the Ten Gods fall.</p>
<p>If the reader's hour pillar differs from yours, ask why. Many Korean practitioners use true solar time, which for Seoul moves the clock back about 32 minutes, while our English calculator uses the clock time of your birthplace. For a birth within half an hour after an odd hour (1:00, 3:00, 5:00 and so on), that choice can change the hour pillar, and neither answer is a mistake. Knowing which one you are hearing keeps the rest of the reading clear.</p>
<p>Afterward, look up anything that puzzled you in our <a href="/en/guide/">library</a>, starting with <a href="/en/guide/read-saju-chart/">how to read a saju chart</a>. If you had a couple reading, compare notes with the <a href="/en/match/">match page</a> and our guide to <a href="/en/guide/gunghap/">gunghap</a>.</p>
`,
  },
  {
    slug: 'saju-chatgpt',
    cat: 'culture',
    published: '2026-09-13',
    title: 'Can ChatGPT Read Your Saju? What AI Gets Right and Wrong',
    desc: 'AI chatbots explain saju well but can get the pillars wrong. Why solar terms, time zones and calendars trip them up, and a prompt that works better.',
    links: [
      { href: '/en/', title: 'Get an accurate chart first' },
      { href: '/en/today/', title: "Today's reading" },
    ],
    body: `
<p>Type your birthday into ChatGPT or any other AI chatbot, ask for your saju, and within seconds you get a confident, nicely written reading. Plenty of people now do exactly that: AFP reported in 2026 that many South Koreans get readings from apps and chatbots instead of visiting a fortune-teller. The real question is whether the reading is about your chart at all. Quite often the interpretation is reasonable and the arithmetic underneath it is not.</p>

<h2>What a chatbot does well</h2>
<p>Large language models are good with language, and saju has a deep vocabulary. A chatbot can explain what a Day Master is, why Fire feeds Earth, what a clash between two branches means, or how Korean practice differs from Chinese BaZi. Give it a correct chart and it can turn eight characters into readable prose, answer follow-up questions and walk you through the logic at any hour, in your own language. It is also a patient tutor for the Korean terms you may hear at a saju café, from ilgan (일간), the Day Master, to daeun (대운), the ten-year luck pillars. For learning and reflection, that is genuinely useful.</p>

<h2>Where the pillars go wrong</h2>
<p>Casting a chart is not interpretation. It is calendar astronomy, and a model that predicts text is not running a calendar. Some chatbots can run code or search the web, but unless you can see that happening, assume the pillars came from pattern-matching. These are the usual traps:</p>
<table>
<tr><th>Trap</th><th>What goes wrong</th><th>Example</th></tr>
<tr><td>The year boundary</td><td>Saju years start at Ipchun (입춘, 立春), the Start of Spring solar term, not on January 1 or at Lunar New Year</td><td>The Fire Goat year begins at 10:46 a.m. Korea time on February 4, 2027; a baby born in Seoul at 10:30 that morning still has a Fire Horse year pillar</td></tr>
<tr><td>Month boundaries</td><td>Months change at the solar terms, down to the minute, not on the 1st</td><td>A birth two hours before a solar term and one two hours after it have different month pillars</td></tr>
<tr><td>The day count</td><td>The day pillar comes from an unbroken 60-day cycle, so being off by one day changes the Day Master itself</td><td>January 1, 2000 was a 戊午 (Yang Earth Horse) day; the day pillar of September 13, 2026 is 庚寅 (Yang Metal Tiger)</td></tr>
<tr><td>Time zones and daylight saving</td><td>A solar term happens at one moment worldwide, so the local clock and its UTC offset matter. Korea itself used UTC+8:30 from 1954 to 1961 and observed daylight saving in 1948 to 1951, 1955 to 1960 and 1987 to 1988</td><td>Ipchun 2027 falls at 5:46 p.m. on February 3 in Los Angeles: born there at 5 p.m., Fire Horse; at 6 p.m., Fire Goat</td></tr>
<tr><td>Lunar birthdays</td><td>A lunar date must be converted first, and the Korean and Chinese lunar calendars occasionally start a month on different days</td><td>Lunar New Year 2027 falls on February 6 in China but February 7 in Korea</td></tr>
<tr><td>Hour conventions</td><td>Schools differ on true solar time and on births between 11 p.m. and midnight</td><td>For Seoul, true solar time moves the clock back about 32 minutes, which can shift the hour pillar</td></tr>
</table>
<p>None of these traps is exotic. Anyone born in January or early February, near a solar term, close to midnight, outside Korea, during daylight saving or with a lunar birthday is exposed to at least one of them. A chatbot may also mix systems without saying so, for example taking your animal sign from the Chinese lunar new year while reading the rest of the chart the Korean way.</p>

<h2>Get the chart right first</h2>
<p>The fix is simple: calculate first, interpret second. Sajucheop's <a href="/en/">Four Pillars calculator</a> computes the solar terms astronomically and uses the time zone of your birthplace, including daylight saving if it applied. It follows the Korean conventions: the year turns at Ipchun, and for births after 11 p.m. the day pillar still changes at midnight while the hour pillar takes the next day's stem, the rule called yajasi (야자시, 夜子時). It runs in your browser, so your birth data is not uploaded. Our guide to <a href="/en/guide/ipchun-year-boundary/">the Ipchun year boundary</a> explains why the year starts where it does.</p>
<p>Then give any chatbot a sixty-second test before trusting it with your chart: ask for the day pillar of January 1, 2000. The answer is 戊午. If it gets that wrong, or if its version of your chart differs from the calculator's, keep the calculated chart and ask the chatbot only to interpret it.</p>

<h2>A prompt structure that works</h2>
<p>A good prompt hands the model the chart as fixed data and asks it to reason from there. Five parts are enough:</p>
<ol>
<li><b>Role and scope.</b> "You are explaining a Korean saju chart for self-reflection. Do not recalculate the pillars."</li>
<li><b>The chart.</b> All four pillars in Chinese characters with their English names, the Day Master and the element count, copied from the calculator.</li>
<li><b>Context that changes the rules.</b> Your gender only if you want the luck pillars discussed, since it sets their direction, and your current age or the year you are asking about.</li>
<li><b>One focused question.</b> For example: "How does this chart tend to handle stress at work?"</li>
<li><b>Ground rules for the answer.</b> Separate classical rules from interpretation; name the rule behind each claim; flag anything that looks inconsistent instead of quietly fixing it; make no predictions about health, death or specific events.</li>
</ol>
<p>Filled in, the chart section might read: "Year 庚午 (Yang Metal Horse), month 庚辰 (Yang Metal Dragon), day 辛酉 (Yin Metal Rooster), hour 癸巳 (Yin Water Snake). Day Master: Yin Metal. Elements: Metal 4, Fire 2, Earth 1, Water 1, Wood 0." With that in hand a model can talk sensibly about a strong Metal Day Master and a missing Wood element, and you can check each step against our guides to <a href="/en/guide/ten-gods/">the Ten Gods</a>, <a href="/en/guide/five-elements-balance/">five-element balance</a> and <a href="/en/guide/day-master-strength/">Day Master strength</a>.</p>
<p>Ask follow-ups in the same spirit. "Which Ten God is 午 to this Day Master, and why?" can be checked. "What will happen to me in 2027?" invites a confident guess.</p>
<p>Luck pillars deserve the same caution as the chart itself. Their direction depends on whether the year stem is yin or yang and on gender, and the age at which the first one begins comes from counting the days from birth to the next month-opening solar term, or back to the previous one when the pillars run backward, with three days standing for one year. That is arithmetic, not interpretation, so if a chatbot lists your luck pillars, check the direction and the starting age before reading anything into them. Our guide to <a href="/en/guide/luck-pillars/">luck pillars</a> walks through the count.</p>

<h2>Sensible limits</h2>
<ul>
<li><b>It does not know you.</b> A human reader watches your reactions and asks questions. A chatbot fills the gaps with plausible generalities, and flattering ones are the easiest to believe.</li>
<li><b>It can sound certain about uncertain things.</b> Schools disagree on true solar time, the late-night hour, extra Goegang pillars and more. Ask which convention it is using, and expect a different reader to choose differently.</li>
<li><b>It may invent sources.</b> Ask for the rule rather than a quotation from a classic, and check anything that matters to you.</li>
<li><b>It is not advice.</b> Saju is a traditional practice for reflection, not a proven science. Keep decisions about health, money, law and relationships with people qualified to help, and with yourself.</li>
</ul>

<h2>Protect your privacy</h2>
<ul>
<li><b>Share the pillars, not the birth record.</b> Your eight characters are shared with everyone born in the same two-hour window of that day, so they reveal far less than an exact date, time and place.</li>
<li><b>Leave out names and places.</b> A full name plus a birth date is exactly the kind of detail used to verify identity.</li>
<li><b>Check the chatbot's data settings,</b> including whether conversations are stored or used for training, and delete chats you do not want kept.</li>
<li><b>Ask before pasting someone else's details,</b> such as a partner's birth data for a compatibility question. The same goes for match links that carry birth dates: share them only with people you know.</li>
</ul>
<p>Start with an accurate chart from our <a href="/en/">calculator</a>, see how each day's pillar meets it in <a href="/en/today/">today's reading</a>, and compare two charts on the <a href="/en/match/">match page</a>. When a chatbot's explanation sounds intriguing, our <a href="/en/guide/">library</a> is there to check it against.</p>
`,
  },
  {
    slug: 'fire-goat-baby-2027',
    cat: 'culture',
    published: '2026-09-13',
    title: 'Having a Baby in 2027, the Year of the Fire Goat',
    desc: "When the 2027 Fire Goat year starts in saju and at Lunar New Year, who counts as a Horse or Goat baby, the folklore, and what a child's chart shows.",
    links: [
      { href: '/en/2027/', title: '2027 Fire Goat year' },
      { href: '/en/zodiac/goat/', title: 'Year of the Goat' },
      { href: '/en/', title: "Cast a baby's chart" },
    ],
    body: `
<p>If your baby is due in 2027, you may already have heard that it will be a "Fire Goat" baby, and if the due date falls in late January or early February, you may have heard two different answers. Which animal year will your child be born into? Do the stories about Goat-year children mean anything? And what would a Korean saju reader actually look at? Here are the dates, the folklore in context, and the things that matter more than the animal.</p>

<h2>When does the Fire Goat year begin?</h2>
<p>2027 is 丁未 (jeongmi, 정미; Ding Wei in Chinese): the stem 丁, Yin Fire, over the branch 未, the Goat. Koreans often call it the Year of the Red Goat, 붉은 양의 해 (bulgeun yang-ui hae), because red is Fire's color. The Korean word 양 (yang) covers both sheep and goat, which is why English sources switch between Goat, Sheep and Ram.</p>
<p>When the year starts depends on which calendar you ask:</p>
<table>
<tr><th>System</th><th>Fire Goat year begins</th><th>Fire Goat year ends</th></tr>
<tr><td>Korean saju (Ipchun, the Start of Spring solar term)</td><td>February 4, 2027, 10:46 a.m. Korea time</td><td>February 4, 2028, 4:31 p.m. Korea time</td></tr>
<tr><td>Chinese lunar calendar (Chinese New Year)</td><td>February 6, 2027</td><td>January 25, 2028</td></tr>
<tr><td>Korean lunar calendar (Seollal, 설날)</td><td>February 7, 2027</td><td>January 26, 2028</td></tr>
</table>
<p>Chinese New Year and Korean Seollal usually fall on the same day, but in 2027 the new moon arrives just before midnight in China and just after midnight in Korea, so Seollal comes a day later. Saju sets the lunar calendar aside altogether. It counts years by the sun, and the year turns at the exact moment of Ipchun (입춘, 立春), which is why our <a href="/en/2027/">2027 Fire Goat page</a> lists all three dates. Our guide to <a href="/en/guide/ipchun-year-boundary/">the Ipchun year boundary</a> explains the reasoning.</p>

<h2>Fire Horse or Fire Goat? The early-February window</h2>
<p>Every baby born in January 2027 is a Fire Horse (丙午, byeong-o) in all three systems. The confusion lives in a few days around February 4 to 7:</p>
<table>
<tr><th>Born (Korea time)</th><th>Saju year pillar</th><th>Chinese calendar</th><th>Korean lunar calendar</th></tr>
<tr><td>Before 10:46 a.m., February 4, 2027</td><td>丙午 Fire Horse</td><td>Horse</td><td>Horse</td></tr>
<tr><td>From 10:46 a.m., February 4, through February 5</td><td>丁未 Fire Goat</td><td>Horse</td><td>Horse</td></tr>
<tr><td>February 6</td><td>丁未 Fire Goat</td><td>Goat</td><td>Horse</td></tr>
<tr><td>February 7 onward</td><td>丁未 Fire Goat</td><td>Goat</td><td>Goat</td></tr>
</table>
<p>The Chinese calendar runs on China's clock (UTC+8), so a birth in Korea just after midnight can still fall on the previous Chinese date. The Ipchun moment, by contrast, is the same everywhere on Earth; only the local clock reading changes. It falls at 1:46 a.m. UTC on February 4, which is 8:46 p.m. on February 3 in New York and 5:46 p.m. on February 3 in Los Angeles. A baby born in Los Angeles at 6 p.m. on February 3, 2027, already has a Fire Goat year pillar in saju, while the Chinese calendar still counts that date as the Horse year.</p>
<p>Ipchun changes the month as well. On our calculator, a baby born in Seoul at 10:30 a.m. on February 4, 2027, has a 丙午 year and a 辛丑 month, while a baby born at 10:50 a.m. has a 丁未 year and a 壬寅 month; both share the day pillar 甲寅. Twenty minutes changes two pillars out of four, which is why saju readers care far more about the exact birth time than about the animal.</p>

<h2>Goat-year folk beliefs, in context</h2>
<p>You may run into warnings about Goat babies, especially online. They are folk beliefs, and they differ from country to country.</p>
<ul>
<li><b>China.</b> A saying, 十羊九不全 ("of ten sheep, nine are incomplete"), holds that most people born in Sheep years will go without something in life. Before the 2015 Sheep year, Chinese state media reported maternity wards crowded with families hoping to deliver in the Horse year instead. The same coverage cited a Guangzhou newspaper account tracing the saying no further back than the Qing dynasty's Xianfeng era in the mid-1800s.</li>
<li><b>Korea.</b> The Goat has mostly been a gentle symbol. The Korea Times described the sheep as standing for peace, harmony and tranquility in Korean tradition, and the National Folk Museum marked 2015 with an exhibition titled "A Sheep Bringing Happiness." The birth-year worry that researchers have actually measured in Korea concerns the Horse. A 2006 study in the journal Demography found that in Horse years the sex ratio at birth rose significantly while fertility fell, reflecting a traditional view that the Horse year was inauspicious for daughters. Korea's sex ratio at birth peaked at 116.5 boys per 100 girls in 1990, a Metal or "White" Horse year.</li>
<li><b>Japan.</b> The best-known case is the Fire Horse, hinoeuma. In 1966, Japan recorded 1,361,000 births, about 500,000 fewer than the years on either side, according to Nippon.com, and a World Bank analysis notes that the fertility rate fell from roughly 2.0 to 1.6 that year. The next Fire Horse year is 2026, and preliminary government figures show 342,068 births in Japan from January to June 2026, up 0.8 percent on a year earlier. So far, there is no repeat.</li>
</ul>
<p>Saju itself has no unlucky animal. Every animal is one branch among twelve, and every chart has strengths and weak points whatever year it falls in. A belief that bent birth statistics in 1966 or 1990 says a great deal about the pressures families faced then, and nothing about your child.</p>

<h2>What saju actually looks at for a child</h2>
<p>A saju chart has eight characters, and the animal sign is only one of them. Every baby born between Ipchun 2027 and Ipchun 2028 shares the year pillar 丁未. Everything else varies: the month pillar changes roughly every thirty days with the solar terms, the day pillar every day, and the hour pillar every two hours. A reader starts with:</p>
<ul>
<li><b>The Day Master,</b> the stem of the birth day, which stands for the child. There are ten, from Yang Wood to Yin Water; meet them in <a href="/en/guide/">the ten Day Masters</a>.</li>
<li><b>The month, or season,</b> the most influential position in the chart. A Fire Goat born in midsummer and one born in midwinter live in very different climates.</li>
<li><b>The balance of the five elements,</b> and which element the chart needs most.</li>
<li><b>The luck pillars,</b> ten-year phases that begin in childhood. In a yin year like 丁未 they run forward for girls and backward for boys, the reverse of a yang year like 丙午, so a boy born just before Ipchun 2027 and a boy born just after it start their luck pillars in opposite directions. Our guide to <a href="/en/guide/luck-pillars/">luck pillars</a> explains how they are counted.</li>
</ul>
<p>The months of the Fire Goat year, with the season each brings to a chart:</p>
<table>
<tr><th>Born between</th><th>Month pillar</th><th>Season in the chart</th></tr>
<tr><td>Feb 4 – Mar 5, 2027</td><td>壬寅</td><td>Early spring: Water over Wood</td></tr>
<tr><td>Mar 6 – Apr 4</td><td>癸卯</td><td>Mid-spring: Wood at its peak</td></tr>
<tr><td>Apr 5 – May 5</td><td>甲辰</td><td>Late spring: Wood over damp Earth</td></tr>
<tr><td>May 6 – Jun 5</td><td>乙巳</td><td>Early summer: Fire rising</td></tr>
<tr><td>Jun 6 – Jul 6</td><td>丙午</td><td>Midsummer: Fire at its peak</td></tr>
<tr><td>Jul 7 – Aug 7</td><td>丁未</td><td>Late summer: Fire and dry Earth, the year's own pillar</td></tr>
<tr><td>Aug 8 – Sep 7</td><td>戊申</td><td>Early autumn: Earth over Metal</td></tr>
<tr><td>Sep 8 – Oct 7</td><td>己酉</td><td>Mid-autumn: Metal at its peak</td></tr>
<tr><td>Oct 8 – Nov 7</td><td>庚戌</td><td>Late autumn: Metal over dry Earth</td></tr>
<tr><td>Nov 8 – Dec 6</td><td>辛亥</td><td>Early winter: Metal over Water</td></tr>
<tr><td>Dec 7, 2027 – Jan 5, 2028</td><td>壬子</td><td>Midwinter: Water at its peak</td></tr>
<tr><td>Jan 6 – Feb 3, 2028</td><td>癸丑</td><td>Late winter: Water over cold Earth</td></tr>
</table>
<p>Each month begins at the exact time of its solar term, so a birth on a boundary day needs the calculator rather than the table.</p>
<h3>Two Fire Goats, two different charts</h3>
<p>Take two babies born in Seoul in the same Fire Goat year:</p>
<ul>
<li><b>Baby A, July 20, 2027, at noon:</b> 丁未 year, 丁未 month, 庚子 day, 壬午 hour. The Day Master is Yang Metal, born in the hottest, driest month of a Fire year, with three Fire, two Earth, one Metal, two Water and no Wood. A reader would talk about heat that needs cooling and a Metal Day Master under pressure, with the Water in the day and hour pillars as the chart's relief.</li>
<li><b>Baby B, December 20, 2027, at 4 a.m.:</b> 丁未 year, 壬子 month, 癸酉 day, 甲寅 hour. The Day Master is Yin Water in midwinter, with three Water, two Wood and one each of Fire, Earth and Metal. Here the year's Fire becomes welcome warmth in a cold chart.</li>
</ul>
<p>Same animal, same year, and almost nothing else in common. That is the point a Korean reader would make to worried grandparents: the Goat is one character in eight.</p>

<h2>A calm way to use saju as a parent</h2>
<ul>
<li><b>Let medicine set the date.</b> Korean media reported in 2026 that some parents planning a cesarean now ask AI chatbots for an "auspicious" delivery time. Delivery timing belongs to your doctor; a chart is something to read afterward, never a reason to change a medical plan.</li>
<li><b>Record the birth time precisely,</b> along with the time zone and whether daylight saving applied. It is the one detail you cannot reconstruct later.</li>
<li><b>Read tendencies, not labels.</b> A chart can suggest what a child may find easy or hard. It cannot tell you who they will become.</li>
<li><b>Answer family worries with the whole chart.</b> If a relative is uneasy about a Goat or Horse year, looking at all eight characters together usually says more than any saying.</li>
</ul>
<p>To see the year as a whole, visit our <a href="/en/2027/">2027 Fire Goat page</a> and the <a href="/en/zodiac/goat/">Year of the Goat</a> profile, or compare the <a href="/en/zodiac/horse/">Year of the Horse</a> if your due date sits near the boundary. Once your baby arrives, <a href="/en/">cast their chart</a> with the exact birth time and time zone, and read it as a first sketch of a new person.</p>
`,
  },
];
