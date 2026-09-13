/* English library articles — culture, batch d. 2026-09-14
 * Day Master archetypes, keywords and strong/weak readings follow tools/en-daymaster-data.mjs;
 * the MBTI correspondences mirror the Korean social post 'hook-mbti' in tools/hook-content.mjs
 * (E/I ↔ yang/yin stems, T ↔ Metal, F/N ↔ Fire and Water, S/J ↔ Earth, N/P ↔ Wood) and are
 * presented as loose "neighborhoods", never as a conversion rule. */
export const ARTICLES = [
  {
    slug: 'saju-vs-mbti',
    cat: 'culture',
    published: '2026-09-14',
    title: 'Saju vs MBTI: Ten Day Masters Meet Sixteen Types',
    desc: 'Why Koreans ask for both, what each measures, the ten Day Masters next to their nearest MBTI types, and what a chart can do that a questionnaire cannot.',
    links: [
      { href: '/en/', title: 'Cast your chart' },
      { href: '/en/guide/day-master/', title: 'The ten Day Masters' },
      { href: '/en/match/', title: 'Check a match' },
    ],
    body: `
<p>Two questions come up early in Korean conversations, on a first date, at a new desk, in a group chat. One is "What's your MBTI?" The other is "When were you born?", the opening move of a saju reading. Many Koreans carry both answers like a business card: a four-letter type and a Day Master. If you know the first and are meeting the second, here is what they share, where they part ways, and how to hold both without taking either too seriously.</p>

<h2>Why the comparison keeps coming up</h2>
<p>Both are shortcuts for a slow question: what kind of person are you? MBTI sorts everyone into sixteen types. <b>Saju</b> (사주, 四柱), the Korean reading of the Four Pillars of your birth, sorts everyone first by one of ten characters, the <b>Day Master</b> (일간, ilgan). Both give friends a vocabulary for differences that nobody has to take personally: "you would say that, you're an ENFP" and "of course, you're a Yang Fire" do the same social work.</p>

<h2>What each one actually measures</h2>
<p><b>MBTI</b> is a questionnaire. You report your preferences, and the answers are scored on four pairs: Extraversion or Introversion (E/I), Sensing or Intuition (S/N), Thinking or Feeling (T/F), Judging or Perceiving (J/P). The result is a self-portrait, only as good as your self-knowledge that day, and many people get a different type on a different day. Psychologists have long questioned how reliable it is.</p>
<p><b>Saju</b> is a calculation. Your birth year, month, day and hour each become a stem (one of ten characters) over a branch (one of the twelve animal signs): four pillars, eight characters. Nothing goes in except the moment of birth, and nothing you do later changes the result. What comes out is not a self-image but a nature (the Day Master), a season (the birth month, which decides whether that nature runs warm or cold) and a timeline (ten-year phases that unfold from birth). It is a traditional symbolic system with no scientific standing. Neither is a diagnosis; both are vocabularies, best used as questions rather than answers.</p>
<table>
<tr><th></th><th>MBTI</th><th>Saju</th></tr>
<tr><td>Comes from</td><td>Your answers to a questionnaire</td><td>Your birth date and time</td></tr>
<tr><td>Can it change?</td><td>Yes, from one sitting to the next</td><td>No; the chart is fixed, only the timing moves</td></tr>
<tr><td>Describes</td><td>How you see your own preferences now</td><td>A nature, a season and a timeline</td></tr>
</table>

<h2>The ten Day Masters and their nearest MBTI neighborhood</h2>
<p>The Day Master is the stem of your birth day. There are ten stems, Wood, Fire, Earth, Metal and Water in yang and yin forms, each with a picture from nature, and Korean saju fans have rules of thumb for matching them. The five <b>yang stems</b>, 甲 丙 戊 庚 壬 (gap, byeong, mu, gyeong, im), push outward, the way E does; the five <b>yin stems</b>, 乙 丁 己 辛 癸 (eul, jeong, gi, sin, gye), seep inward, like I. Metal judges coolly, like T. Fire and Water lead with feeling and intuition, like F and N. Earth is grounded and steady, like S and J. Wood is growth-minded and idea-led, like N and P. So every Day Master has a nearest MBTI neighborhood: not an address, just the part of town where it would feel at home.</p>
<table>
<tr><th>Day Master</th><th>Archetype</th><th>In a sentence</th><th>Nearest MBTI neighborhood</th></tr>
<tr><td>甲 Yang Wood</td><td>The Tall Pine</td><td>If there is no road, it cuts one; hard to bend</td><td>ENTP or ENFP, with a straightness that can look like ENTJ</td></tr>
<tr><td>乙 Yin Wood</td><td>The Winding Vine</td><td>Does not break; goes around and arrives anyway</td><td>INFP, sometimes ISFP</td></tr>
<tr><td>丙 Yang Fire</td><td>The Midday Sun</td><td>Cannot hide, lights everyone up; moods show like weather</td><td>ENFJ or ESFP</td></tr>
<tr><td>丁 Yin Fire</td><td>The Candle Flame</td><td>Quiet, burning to the end; one field, dug deep</td><td>INFJ, sometimes INFP</td></tr>
<tr><td>戊 Yang Earth</td><td>The Great Mountain</td><td>Barely moves; everyone leans on it; calmest in a crisis</td><td>ESTJ on paper, ISTJ in the room</td></tr>
<tr><td>己 Yin Earth</td><td>The Fertile Field</td><td>Things grow beside it; runs the board without anyone noticing</td><td>ISFJ, sometimes ISTJ</td></tr>
<tr><td>庚 Yang Metal</td><td>The Raw Blade</td><td>Does not postpone, it cuts; loyal, allergic to compromise</td><td>ENTJ or ESTJ</td></tr>
<tr><td>辛 Yin Metal</td><td>The Polished Gem</td><td>Wins on detail; an eye nobody can fool</td><td>INTJ or ISTJ</td></tr>
<tr><td>壬 Yang Water</td><td>The Open Sea</td><td>Flows toward the wider place; withers when still</td><td>ENTP or ENFP</td></tr>
<tr><td>癸 Yin Water</td><td>The Morning Dew</td><td>Sees everything and says nothing; seeps in, then soaks everything</td><td>INFP, sometimes INFJ</td></tr>
</table>
<p>Read that last column with a smile, because the rules break at once. A Day Master is one character out of eight, and the other seven all pull the picture. Above all, a reader asks how <b>strong</b> the Day Master is: whether the rest of the chart feeds it or drains it. A strong Yin Water person is a monsoon, and everything around them grows and floods. A weak one is a single drop, evaporating in other people's weather. Same archetype, nothing alike in a room. Our guide to <a href="/en/guide/day-master-strength/">Day Master strength</a> shows how that call is made. The table cannot show any of it; a chart can.</p>

<h2>What saju can do that MBTI cannot</h2>
<p><b>Compatibility by calculation.</b> The ten Day Masters have fixed relationships. Five pairs <b>combine</b> (합, hap), pulling toward each other, such as the Tall Pine and the Fertile Field. Four pairs <b>clash</b> (충, chung), such as the Pine and the Raw Blade. Every other pairing has one element feeding or checking the other. Two MBTI types can only be compared by opinion; two Day Masters can be looked up. Our <a href="/en/guide/compatibility/">compatibility table</a> covers all hundred pairings, the <a href="/en/match/">match page</a> scores two whole charts from two birth dates, and the Korean custom built on this has a name, <a href="/en/guide/gunghap/">gunghap</a> (궁합).</p>
<p><b>Timing.</b> MBTI has no calendar. Saju is mostly calendar: every chart comes with <a href="/en/guide/luck-pillars/">luck pillars</a> (대운, daeun), ten-year phases that bring new characters up against your own, plus a pillar for each year. Whether or not a year can favor anyone, at least the system lets you ask.</p>
<p><b>No questionnaire.</b> Nobody has to sit a test, answer honestly or be in a good mood. A birth date finds the Day Master; a birth time completes the chart. It is how a Korean parent can check a future son-in-law before ever meeting him.</p>

<h2>What MBTI can do that saju cannot</h2>
<p><b>It describes what you actually report.</b> The raw material is you saying how you behave. A chart cannot know that you hate parties or love spreadsheets; it can only suggest what someone born at that moment might be like.</p>
<p><b>It updates.</b> If you were an anxious I at twenty and a confident E at forty, MBTI will say so. Saju will say you were the same Sea or Candle all along, now in a different luck pillar: poetic, but not the same as noticing.</p>
<p><b>It travels.</b> Four letters need no explanation anywhere; a Day Master needs Chinese characters, five elements and a year that begins in early February. Outside Korea, and honestly inside it, MBTI is the easier icebreaker.</p>

<h2>When the two disagree</h2>
<p>Three invented sketches, where questionnaire and calendar point different ways:</p>
<ul>
<li><b>A colleague who tests ENTJ but has a Yin Water Day Master.</b> The <a href="/en/guide/day-master/yin-water/">Morning Dew</a> is the quiet observer; at work she runs meetings like a general. The chart does not overrule the test; it suggests the ENTJ is a role she built, and asks what it costs: the Dew's page warns about digesting things alone until the cup overflows. If her Water is strong, the general is simply a monsoon. If it is weak, the type describes her Monday and the Day Master her Sunday.</li>
<li><b>A friend who tests INFP but has a Yang Metal Day Master.</b> The <a href="/en/guide/day-master/yang-metal/">Raw Blade</a> is supposed to cut; this friend apologizes to furniture. Then a principle gets crossed, and the one flat "no" that is never revisited is pure Blade. The type caught the daily texture; the chart caught the streak the letters had no room for.</li>
<li><b>A couple who both test ISTJ.</b> Everyone assumes they are easy together. Their Day Masters are Yang Wood and Yang Metal, the Pine and the Blade, a clashing pair. The letters describe two tidy, dutiful people; the clash describes what happens when both are sure how the dishwasher should be loaded. Neither reading is a verdict.</li>
</ul>
<p>None of this proves which system is right; a disagreement is worth having because it makes you look twice.</p>

<h2>How to try it</h2>
<ol>
<li><a href="/en/">Cast your chart</a> with your birth date, birth time if known, and the time zone of your birthplace.</li>
<li>Find the Day Master: the top character of the day pillar. The chart page names it, archetype and all.</li>
<li>Read its page among <a href="/en/guide/day-master/">the ten Day Masters</a>, and check how strong it is in your chart.</li>
<li>Put your MBTI type beside it and look for the seams.</li>
</ol>
<p>A few questions make it worthwhile. Which description sounds like you on a good day, and which on a bad one? Does the type describe the role you play at work while the Day Master describes how you recharge, or the reverse? For the wider picture, start with <a href="/en/guide/what-is-saju/">what saju is</a> and the <a href="/en/guide/ten-gods/">Ten Gods</a> (십성, sipseong), the roles the other characters play for the Day Master.</p>
<h3>A note on Korean etiquette</h3>
<p>In Korea, "MBTI가 뭐예요?" (MBTI-ga mwoyeyo?, what's your MBTI?) and "일간이 뭐예요?" (ilgan-i mwoyeyo?, what's your Day Master?) are the same kind of question: friendly, low-stakes, an invitation to tease. "너 완전 병화다" (neo wanjeon byeonghwa-da), "you are so obviously a Yang Fire," is what friends say to whoever just lit up the room. Answer with a laugh and ask theirs back. Using either answer to decide whom to hire or date misses the point, which was to have something to laugh about.</p>

<h2>Frequently asked questions</h2>
<h3>Is saju more accurate than MBTI?</h3>
<p>Neither has a track record that settles it. MBTI records how you describe yourself, so it is faithful to your self-image and only as stable as that. Saju computes a chart from a birth date and reads it through a traditional symbolic system with no scientific standing. Use both for reflection, and trust whichever gives you better questions.</p>
<h3>Which Day Master is INFJ?</h3>
<p>No single one. The nearest neighbors are the Candle Flame (Yin Fire) and the Morning Dew (Yin Water): inward, warm and intuitive. But INFJs turn up with all ten Day Masters, because the Day Master is one character out of eight and its strength changes everything. Cast your chart and read the page for the one you actually have.</p>
<h3>Can saju tell my MBTI type?</h3>
<p>No. A chart cannot predict how you will answer a questionnaire, and our neighborhood table is a playful guess, not a converter. The useful direction runs the other way: knowing your type, read your Day Master's page and notice which lines you recognize and which you resist.</p>
<h3>Does my Day Master change, the way an MBTI type can?</h3>
<p>No. It is fixed by your birth date, so the Yang Fire you were at twenty is the Yang Fire you are at sixty. What moves is the timing: every ten years a new <a href="/en/guide/luck-pillars/">luck pillar</a> arrives, and each year brings a pillar of its own, so the same nature meets different weather.</p>
`,
  },
];
