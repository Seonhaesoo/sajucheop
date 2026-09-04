/* 사주첩 — 주간 소셜 콘텐츠 영문판
 * KO 캐러셀과 slug로 짝을 맞춘다. 영문 사이트(/en/)에 없는 도구(토정비결·만세력·음력·삼재·작명·
 * 일간 테스트·명식첩·적중 기록)를 시연하는 회차는 영문권에 통하는 주제로 바꿔 넣었다 — 그래서
 * 같은 회차라도 KO/EN 주제가 다를 수 있다. 쓰레드는 KO 배열과 길이를 맞춰 회차 인덱스를 공유한다.
 * 일간 영문명은 /en/ 사이트의 아키타입과 동일: Tall Pine · Winding Vine · Midday Sun · Candle Flame ·
 * Great Mountain · Fertile Field · Raw Blade · Polished Gem · Open Sea · Morning Dew */

export const CTA_TAGS_EN = '#saju #fourpillars #bazi #koreanastrology #daymaster #fiveelements #tengods #birthchart #astrologycommunity #kculture #sajucheop';

const EN_URL = 'sajucheop.com/en';

export const CAROUSELS_EN = {
  /* ---------- 교육 (8) ---------- */
  'ilgan-intro': {
    title: 'Your chart has\none main character',
    sub: 'Eight characters, one "you" — the Day Master',
    cards: [
      { head: 'Saju = eight characters', body: 'Your birth year, month, day and hour each become two characters — eight in all. That is your Saju, the Korean Four Pillars. Only one of the eight is you.' },
      { head: 'The sky character of your birth day', body: 'The first character of your day pillar is called the Day Master. Every reading in Saju is measured from this one character — it is the "I" in the chart.' },
      { head: 'There are ten of them', body: 'Tall Pine, Winding Vine, Midday Sun, Candle Flame, Great Mountain, Fertile Field, Raw Blade, Polished Gem, Open Sea, Morning Dew. Ten natures — which one is yours?' },
      { head: 'Sharper than a zodiac animal', body: 'Everyone born in the same year shares an animal. The Day Master changes every single day — two people born a week apart can be a Sun and a Sea.' },
      { head: 'Ten seconds is all it takes', body: 'Enter your birth date and your Day Master appears, computed with a precise Korean calendar that tracks the exact minute each solar term begins.' }
    ],
    caption: 'Your Saju chart has eight characters — and only one of them is you. Meet the Day Master.\n\nNot sure which of the ten natures you are? Link in bio, birth date in, ten seconds out. Save this and check your friends too 📖'
  },
  'yang-ilgan': {
    title: 'The five Yang\nDay Masters',
    sub: 'Pine · Sun · Mountain · Blade · Sea',
    cards: [
      { head: 'Tall Pine — Yang Wood', body: 'A tree that only grows upward. Fast to start, allergic to bending. Principle first, profit second — a Pine would rather break than bow.' },
      { head: 'Midday Sun — Yang Fire', body: 'Impossible to hide. Lights up every room and everyone in it. No grudges, no filters — but when the Sun sets, it goes quiet fast.' },
      { head: 'Great Mountain — Yang Earth', body: 'Unshakable. People come to lean on the Mountain without being asked. The one habit to watch: burying its own feelings deep under the rock.' },
      { head: 'Raw Blade — Yang Metal', body: 'Cuts straight, decides fast. Loyalty and principle above all. Looks blunt until life sharpens it — then it is the keenest edge in the room.' },
      { head: 'Open Sea — Yang Water', body: 'Flows around whatever blocks it. Big heart, big scale, big plans. Where exactly it is heading, though — even the Sea is not always sure.' }
    ],
    caption: 'The five Yang Day Masters — Pine, Sun, Mountain, Blade, Sea. Big, bold, impossible to miss.\n\nWondering which one you (or that person) are? Link in bio — birth date only. The five Yin natures are coming next 🌊'
  },
  'eum-ilgan': {
    title: 'The five Yin\nDay Masters',
    sub: 'Vine · Flame · Field · Gem · Dew',
    cards: [
      { head: 'Winding Vine — Yin Wood', body: 'Climbs rock walls other plants give up on. Soft, but never snaps. The Vine knows in its body that flexibility is a kind of strength.' },
      { head: 'Candle Flame — Yin Fire', body: 'Lights one person for a long time. Attentive, devoted, warm at close range. Its only flaw: forgetting its own wick is burning down.' },
      { head: 'Fertile Field — Yin Earth', body: 'Receives every seed and grows it. Kindness is built in. But the Field keeps its own words buried deep in the furrows.' },
      { head: 'Polished Gem — Yin Metal', body: 'Already finished at birth. Sharp taste, sharp pride. Remembers every scratch — and knows exactly how to catch the light.' },
      { head: 'Morning Dew — Yin Water', body: 'Seeps in without a sound and touches everything. Intuitive, sensitive, deeper than it looks — like fog you cannot see the bottom of.' }
    ],
    caption: 'The five Yin Day Masters — Vine, Flame, Field, Gem, Dew. Quiet, and quietly winning.\n\nFind your Day Master in ten seconds — link in bio. Swipe back through the feed for the Yang five 🕯️'
  },
  'saju-myths': {
    title: '5 things people\nget wrong about Saju',
    sub: 'Centuries of theory vs. rumor',
    cards: [
      { head: '"It uses the lunar calendar, right?"', body: 'No. Saju runs on neither the lunar nor the Western calendar but on solar terms — the position of the sun. The year does not even start on January 1.' },
      { head: '"My year animal decides everything"', body: 'The animal is one of eight characters, and not the important one. The Day Master and the balance of elements do the real work.' },
      { head: '"I got a bad chart"', body: 'There is no good or bad chart. There are balanced charts and lopsided ones — and a lopsided chart is usually where a person\'s edge lives.' },
      { head: '"I don\'t know my birth hour, so I can\'t"', body: 'You can. Without the hour you still have six characters: Day Master, element balance, the seasonal pillar. More than half the reading survives.' },
      { head: '"So my fate is fixed?"', body: 'Saju is a weather forecast, not a prophecy. It says rain is likely. Whether you bring an umbrella has always been up to you.' }
    ],
    caption: '"Saju is lunar astrology, right?" — the most common myth, busted first.\n\nWant the real chart, computed to the minute of each solar term? Link in bio. Save this for the next dinner-table debate 😌'
  },
  'sipseong': {
    title: 'The Ten Gods,\nexplained on one card',
    sub: 'Peers · Output · Wealth · Authority · Support',
    cards: [
      { head: 'Ten Gods = you vs. the world', body: 'Each of the other seven characters relates to your Day Master in one of five ways. Those relationships are the Ten Gods — the skeleton of every reading.' },
      { head: 'Peers — what looks like you', body: 'Siblings, colleagues, rivals. Plenty of Peers means drive and independence — and a habit of splitting the pie with others.' },
      { head: 'Output — what you create', body: 'Words, talent, art, children. The urge to express and produce. Life around a strong Output person is never boring.' },
      { head: 'Wealth — what you handle', body: 'Money, results, a nose for the practical. Clear Wealth means comfort with numbers and outcomes. In a man\'s chart it also points to romance.' },
      { head: 'Authority & Support', body: 'Authority is discipline, career, responsibility. Support is study, documents, help from elders. When the pressing force and the feeding force balance, the chart stands firm.' }
    ],
    caption: 'Peers, Output, Wealth, Authority, Support — learn the Ten Gods and half of any Saju reading opens up.\n\nSee which ones fill your chart and which are missing — free, link in bio. Save this card as your cheat sheet 📌'
  },
  'chung': {
    title: 'A clash day\nis not a bad day',
    sub: 'The other word for collision is "motion"',
    cards: [
      { head: 'Clash = opposite characters meeting', body: 'When two characters that sit directly across the cycle meet — Rat and Horse, Rabbit and Rooster — that is a clash. It sounds violent. It means "shaken into motion".' },
      { head: 'Not bad — volatile', body: 'On a clash day plans change, people move, moods swing. It is not an accident warning. It is a turbulence forecast.' },
      { head: 'Avoid exactly one thing', body: 'Big signatures, irreversible decisions, promises you cannot take back. Don\'t stamp anything on a day the ground is moving — that is the whole of the old advice.' },
      { head: 'Sometimes it is exactly what you need', body: 'Stale water needs shaking. Ending a relationship that should end, finally making that move — a clash breaks stagnation too.' },
      { head: 'When are yours?', body: 'A day that clashes your day branch comes about five times every two months. Your daily energy page flags them so the wave never surprises you.' }
    ],
    caption: 'Clash day ≠ bad day. It is a volatile day. Skip the signatures and you are fine.\n\nSee today\'s energy for your chart — link in bio. Save this for the next time someone panics about a clash 🗓️'
  },
  'no-birth-time': {
    title: 'You don\'t need\nyour birth hour',
    sub: 'How to read six characters',
    cards: [
      { head: 'A very common worry', body: '"I have no idea what time I was born." One in three people say this. Hours were rarely recorded on older birth certificates — and many still aren\'t.' },
      { head: 'Six characters still stand', body: 'Without the hour, only the hour pillar goes blank. Your Day Master, element balance, the seasonal month pillar — all intact.' },
      { head: 'Better than a guess', body: '"I think it was early morning…" A guessed hour is worse than none. A wrong hour pillar quietly bends the entire reading.' },
      { head: 'The one edge case', body: 'Born around 11 pm? That is the late Rat hour, where the day can roll over early. It only matters if you are sure of the time.' },
      { head: 'So we built a button', body: 'Sajucheop has an "I don\'t know my birth hour" option. Tap it and you get an honest six-character reading — nothing inflated, nothing invented.' }
    ],
    caption: 'Not knowing your birth hour does not lock you out of Saju. Six characters still tell more than half the story.\n\nLink in bio → tap "I don\'t know my hour". Send this to the friend who always says they can\'t check theirs 🌙'
  },
  'ohaeng-missing': {
    title: '"You have no Water."\nWhat that means',
    sub: 'A missing element is a hint, not a curse',
    cards: [
      { head: 'Five Elements = five kinds of energy', body: 'Wood, Fire, Earth, Metal, Water. Sort your eight characters into five bins and you get your energy map. A perfectly even chart is rare.' },
      { head: 'Missing = unpracticed', body: 'No Water means rest and flexibility may not come naturally. It is not a doomed life — it is a blank page in your own manual.' },
      { head: 'Too much = overflow', body: 'Four or more of one element is excess. Overflowing Fire turns passion into impatience. Often the surplus is the real homework, not the gap.' },
      { head: 'You fill it with daily life', body: 'Short on Water? Swimming, night walks, the color black. Short on Wood? Mornings and plants. Missing energy is topped up through habits, colors, directions.' },
      { head: 'See your own map', body: 'Your Five Elements balance shows up as a chart the moment you enter your birth date — which bins are full, which are empty, and what to do about it.' }
    ],
    caption: '"You have no Water in your chart" is not a curse. It is a user manual.\n\nSee your own Five Elements map as a graph — free, link in bio 🌿'
  },

  /* ---------- 일간 저격 (10) ---------- */
  'teuk-gapmok': {
    hanja: '甲', title: 'Tall Pine\nthings', sub: 'Born as a tree that only grows up',
    cards: [
      { head: 'Thinks while already walking', body: 'Fast starter. While others are still weighing options, the Pine is a step ahead — and occasionally walks the step back.' },
      { head: 'Won\'t move without a reason', body: '"Is this right?" comes before "what do I get?" If it isn\'t right, no amount of money moves the Pine\'s hand.' },
      { head: 'Would rather break than bend', body: 'Apologies are the hardest thing in the world. Instead of "sorry", the Pine repays you with action.' },
      { head: 'Accidental leader', body: 'Never wanted the front. But nobody else stepped up, and one day the Pine looked around and was standing there.' },
      { head: 'The tallest tree takes all the wind', body: 'Hard on the outside, softer inside than anyone guesses. A Pine falls silently. Hug the Pine in your life once in a while.' }
    ],
    caption: 'Tall Pine (Yang Wood) things 🌲\n\nSomeone came to mind, didn\'t they? Send them this. Whether YOU are a Pine takes ten seconds — link in bio, birth date only.'
  },
  'teuk-eulmok': {
    hanja: '乙', title: 'Winding Vine\nthings', sub: 'Born to climb over anything',
    cards: [
      { head: 'Grows back after being stepped on', body: 'Survival maxed out. Cut it and a new shoot appears. The Vine\'s softness is not weakness — it is strategy.' },
      { head: 'Gets what it wants, gently', body: 'No head-on charges. It seeps in — and one day it is exactly where it wanted to be.' },
      { head: 'Adapts anywhere', body: 'New job, new city, new group — settling in takes half the time it takes everyone else. It roots on bare rock.' },
      { head: 'Explodes with a wall to lean on', body: 'Grows bigger together than alone. Give the Vine a good partner or a good team and watch it reach the roof.' },
      { head: 'Can\'t let go without pulling the roots', body: 'Once tangled, it stays tangled. That is why a Vine\'s breakups ache for so long.' }
    ],
    caption: 'Winding Vine (Yin Wood) things 🌿\n\nLiving proof that soft is strong. Your Day Master takes ten seconds — link in bio.'
  },
  'teuk-byeonghwa': {
    hanja: '丙', title: 'Midday Sun\nthings', sub: 'Born as the sun at noon',
    cards: [
      { head: 'Face works as subtitles', body: 'Hiding a feeling is physically impossible — moods broadcast live on the face. Which is why a Sun\'s compliment is worth so much.' },
      { head: 'Knows everyone, feels lonely', body: 'Busy lighting up everybody, still looking for the one person to go deep with. The sun shines wide but cannot stay anywhere long.' },
      { head: 'Angry, then done', body: 'Zero grudges. Fights with you yesterday, texts you normally today — and you are the one left confused.' },
      { head: 'Best reaction in the room', body: 'Tell a Sun a story and it becomes a good story. The temperature of any party is set by how many Suns showed up.' },
      { head: 'Drains fast when alone', body: 'Its energy comes from people. A quiet Sun is a hurting Sun — send a message.' }
    ],
    caption: 'Midday Sun (Yang Fire) things ☀️\n\nIf one person came to mind, send this instead of tagging them. Your own Day Master is a birth date away — link in bio.'
  },
  'teuk-jeonghwa': {
    hanja: '丁', title: 'Candle Flame\nthings', sub: 'Born as a candle in the dark',
    cards: [
      { head: 'Lights one person for a long time', body: 'Deep over wide. A Flame\'s affection burns low and long — the true-love type.' },
      { head: 'Runs the room\'s thermostat', body: 'First to feel the air go cold, quietly warms it back up. Unnoticed when present, obvious the moment it is gone.' },
      { head: 'Notices everything', body: 'New haircut, a tired face — what everyone else misses, the Flame sees.' },
      { head: 'Forgets its own wick is burning', body: 'So busy lighting others it doesn\'t feel itself shrinking. What a Flame needs most is the question "and how are YOU?"' },
      { head: 'Brightest in the dark', body: 'Surprisingly the calmest person in a crisis. A candle proves itself when the lights go out.' }
    ],
    caption: 'Candle Flame (Yin Fire) things 🕯️\n\nTake care of the Flame in your life — they are quietly doing everything. Check your Day Master via the link in bio.'
  },
  'teuk-muto': {
    hanja: '戊', title: 'Great Mountain\nthings', sub: 'Born as the mountain itself',
    cards: [
      { head: 'Everyone brings their problems', body: 'Says nothing, and people still come to lean. It is a mountain. Almost nobody knows what the Mountain itself is carrying.' },
      { head: 'Cannot stand wobbling', body: 'Including its own. Calm-on-the-outside is the default setting even when anxious — which is exactly why it looks so reliable.' },
      { head: 'Not against change — for verification', body: 'New things are fine once checked. The checking just takes a while.' },
      { head: 'Three years to open up', body: 'If a Mountain has told you its real story, you have been invited deep into the valley. Very few are.' },
      { head: 'Never drops what it holds', body: 'People or projects — what enters the Mountain\'s embrace stays for years. Slow to warm, slow to cool.' }
    ],
    caption: 'Great Mountain (Yang Earth) things ⛰️\n\nThe person you think of when you think "if I tell them, it\'ll be handled." Your own Day Master: ten seconds, link in bio.'
  },
  'teuk-gito': {
    hanja: '己', title: 'Fertile Field\nthings', sub: 'Born as rich garden soil',
    cards: [
      { head: 'Counseling office, open 24/7', body: 'Accepts everything. You start small talk and end up telling your life story — that is the Field.' },
      { head: 'Chronic inability to say no', body: '"Uh… sure," followed by kicking the blanket at midnight. The Field\'s kindness is both a talent and a condition.' },
      { head: 'Remembers everything quietly', body: 'Something you mentioned in passing shows up as a gift later. Soil never forgets a seed.' },
      { head: 'Someone else takes the credit', body: 'Grew the whole thing without fanfare — and someone else harvests. Fields, please ask for your share sometimes.' },
      { head: 'Feelings run furrow-deep', body: 'Mild on the surface, rows and rows of stories underneath. The friend a Field opens up to first is a real friend.' }
    ],
    caption: 'Fertile Field (Yin Earth) things 🌾\n\nSend this to the Field who gives everything away and say "this is you." Your own Day Master — link in bio.'
  },
  'teuk-gyeonggeum': {
    hanja: '庚', title: 'Raw Blade\nthings', sub: 'Born as unpolished steel',
    cards: [
      { head: 'Cannot talk around things', body: 'Facts, straight ahead. No gift wrap — sometimes misunderstood, but a Blade\'s words are never false.' },
      { head: 'Lives on loyalty', body: 'If someone they love is wronged, the Blade steps in before handling its own business — knowing full well it will cost.' },
      { head: 'Clumsy at tenderness', body: 'Looks after you without letting it show. A gruff "did you eat?" is the Blade\'s love letter.' },
      { head: 'Sharper with every hardship', body: 'Trouble doesn\'t dull the Blade — it hones it. The late-bloomer Day Master.' },
      { head: 'Undone by recognition', body: 'Looks unbreakable, but "you worked hard" makes it cry on the inside. For a Blade, being seen matters more than being paid.' }
    ],
    caption: 'Raw Blade (Yang Metal) things ⚔️\n\nThat blunt person you somehow can\'t dislike? Send it. Your Day Master takes ten seconds — link in bio.'
  },
  'teuk-singeum': {
    hanja: '辛', title: 'Polished Gem\nthings', sub: 'Born already cut and set',
    cards: [
      { head: 'Its own standards, crystal clear', body: 'Born finished. Would rather keep its own bar than lower it to someone else\'s.' },
      { head: 'Taste is identity', body: '"Anything is fine" is never fine. A Gem\'s objects, spaces and playlists all have a reason.' },
      { head: 'Forgives, never forgets', body: 'Scratches are remembered for years. It smiles at you again — but the ledger in its heart keeps the entry.' },
      { head: 'Knows its moment', body: 'Instinctively knows when to step up and when to step back. A gem shines brightest under the right light.' },
      { head: 'Pretends to be dull, feels everything', body: 'Acts unbothered so nobody spots the sensitivity. A Gem\'s "I\'m fine" is about half true.' }
    ],
    caption: 'Polished Gem (Yin Metal) things 💎\n\nThat friend with the very specific taste? Probably a Gem. Enter their birth date via the link in bio and see.'
  },
  'teuk-imsu': {
    hanja: '壬', title: 'Open Sea\nthings', sub: 'Born as the ocean',
    cards: [
      { head: 'Everything is ocean-sized', body: 'Plans are big, worries are bigger. Thinking small is simply not installed.' },
      { head: 'Goes around, not through', body: 'Detours instead of collisions. Wins without fighting. Water does not argue with the rock.' },
      { head: 'Holds everyone, shows no one', body: 'Listens to everybody\'s troubles while its own sit at the bottom of the sea. Very few have seen the Sea\'s true feelings.' },
      { head: 'Doesn\'t know where it\'s flowing either', body: 'Looks like a planner, lives like a drifter. Trusts the current more than the destination — and somehow arrives.' },
      { head: 'Deep water is quiet', body: 'A loud Sea is just a shallow stretch. When it goes silent, it is getting deep.' }
    ],
    caption: 'Open Sea (Yang Water) things 🌊\n\nThe person you can never quite read might be a Sea. Ten seconds to find out — link in bio.'
  },
  'teuk-gyesu': {
    hanja: '癸', title: 'Morning Dew\nthings', sub: 'Born as spring rain and dew',
    cards: [
      { head: 'Seeps in without a sound', body: 'You cannot remember when you became close — the Dew was just suddenly there. It arrives like drizzle.' },
      { head: 'Gut feeling is data', body: '"I kind of felt this would happen" — and it did. The Day Master with the eerily accurate intuition.' },
      { head: 'Cries at commercials', body: 'Feelings run rich and close to the surface. Which also makes it the first to feel someone else\'s pain.' },
      { head: 'Shallow-looking, fog-deep', body: 'Soft on the surface, unfathomable underneath. Thinking you fully know a Dew is a mistake.' },
      { head: 'Waters everyone, dries itself out', body: 'Soaks every heart around it while its own runs dry. Somebody, rain on the Dew for once.' }
    ],
    caption: 'Morning Dew (Yin Water) things 🌧️\n\nSend it to the friend with great instincts and easy tears. Your Day Master via the link in bio — birth date only.'
  },

  /* ---------- 기능 시연 → 영문 사이트에 있는 것만 시연, 나머지는 영문권 교육 주제로 대체 (8) ---------- */
  'demo-gunghap': {
    hanja: '緣', title: 'Compatibility\nin ten seconds', sub: 'Two birth dates, one honest answer',
    cards: [
      { head: '① Enter two birth dates', body: 'Yours and theirs. No sign-up, no email, nothing stored on a server — the whole thing runs on your phone.' },
      { head: '② See the Day Master chemistry', body: 'Sun meets Sea, Pine meets Blade. The classical pairings say whether two natures combine, clash, feed or drain each other.' },
      { head: '③ Who you are to each other', body: 'Not just a score. "They are your Support — the shelter you rest in. You are their Output — the spark that makes them create."' },
      { head: '④ Branch harmony & elements', body: 'Do your day branches sit in harmony or across the cycle? Does one of you fill the element the other lacks? All on one screen.' },
      { head: '⑤ Share the result', body: 'One tap copies a summary to send back. Awkward "when\'s your birthday?" conversations have never been this easy.' }
    ],
    caption: 'The hardest question in the talking stage: "so… when\'s your birthday?" Here is your excuse to ask 🔗\n\nLink in bio → Match. Two dates, ten seconds, no account.'
  },
  'demo-jeokjung': {
    hanja: '日', title: 'How your daily\nscore is computed', sub: 'Not a horoscope — arithmetic',
    cards: [
      { head: 'Every day has two characters', body: 'Today is a day in the 60-day cycle — say, Fire Rat or Metal Rooster. Those two characters are the raw material.' },
      { head: 'They meet your Day Master', body: 'Today\'s sky character relates to yours as one of the Ten Gods. Support day? Wealth day? That sets the theme.' },
      { head: 'Then your day branch', body: 'Today\'s earthly branch either harmonizes with yours, clashes with it, or passes quietly. That moves the score up or down.' },
      { head: 'The result is a number', body: 'A flow score from 20 to 96 with a weather word — Clear, Cloudy, Stormy. Same input, same output. No mood, no mystery.' },
      { head: 'Read it in the morning', body: 'Your daily energy page shows the score, the theme, the best hours of the day and a look at tomorrow. One glance with your coffee.' }
    ],
    caption: 'Your daily score is not a horoscope. It is today\'s two characters meeting your chart — and you can check the math 📊\n\nLink in bio → Today\'s Energy. Free, no account.'
  },
  'demo-myeongsikcheop': {
    hanja: '春', title: 'Your zodiac animal\nmight be wrong', sub: 'The year does not start on January 1',
    cards: [
      { head: 'Saju runs on the sun', body: 'Not the Gregorian calendar, not the lunar one. The year turns at Ipchun — the start of spring — around February 4.' },
      { head: 'January babies, check again', body: 'Born January 20, "Year of the Dragon"? In Saju you are still a Rabbit. Nine out of ten January birthdays carry last year\'s animal.' },
      { head: 'Early February is a coin flip', body: 'The switch happens at a specific minute — Feb 3 or 4 or 5 depending on the year. Born that week? Only a precise calendar knows.' },
      { head: 'Months work the same way', body: 'Each month begins at a solar term, not on the 1st. Your month pillar can differ from what a naive calculator prints.' },
      { head: 'We track it to the minute', body: 'Sajucheop computes the exact time each solar term begins, so your year and month pillars are right even at the boundaries.' }
    ],
    caption: 'If you were born in January, your zodiac animal is probably last year\'s. Saju years start at Ipchun, ~Feb 4 🐉→🐇\n\nCheck your real chart — link in bio.'
  },
  'demo-test': {
    hanja: '問', title: 'Which of the ten\nnatures are you?', sub: 'Guess first, then check',
    cards: [
      { head: 'Fast starter, hates apologizing?', body: 'Pine. Grows straight up, breaks before it bends, leads by accident.' },
      { head: 'Can\'t hide a single feeling?', body: 'Sun. Broadcasts every mood, forgives by lunchtime, drains when alone.' },
      { head: 'Everyone leans on you?', body: 'Mountain. Calm on the outside no matter what — and nobody asks how YOU are.' },
      { head: 'Very specific taste, long memory?', body: 'Gem. Own standards, own playlist, and a quiet ledger of every scratch.' },
      { head: 'Now check the real answer', body: 'Your guess vs. your actual Day Master. When they match it feels seen; when they don\'t, that gap is the best conversation you\'ll have this week.' }
    ],
    caption: 'Guess your Day Master before you look. I was sure I was a Sea — turned out I\'m a Candle Flame 🔥\n\nLink in bio, birth date in, ten seconds. Then send it to a friend and guess theirs.'
  },
  'demo-tojeong': {
    hanja: '比', title: 'Saju vs. BaZi vs.\nWestern astrology', sub: 'Same sky, three different maps',
    cards: [
      { head: 'Western: where the planets were', body: 'Sun sign, moon sign, rising sign — the positions of planets at your birth. Twelve signs, a wheel of houses.' },
      { head: 'BaZi: the Chinese Four Pillars', body: 'Eight characters from year, month, day and hour. Day Master, Ten Gods, Five Elements — the same root system Saju grew from.' },
      { head: 'Saju: the Korean branch', body: 'Same eight characters, Korean calendar conventions — solar terms computed for Korea, true-solar-time correction, the late Rat hour rule.' },
      { head: 'The big difference from Western', body: 'No planets, no signs. Saju is a calendar system: what season, what day, what hour of the cosmic cycle you entered.' },
      { head: 'Try the Korean map', body: 'Enter your birth date and get your eight characters, Day Master archetype, element balance and Ten Gods — in plain English.' }
    ],
    caption: 'Sun sign, BaZi, Saju — three ways to read the same sky. Saju is the Korean branch of the Four Pillars 🗺️\n\nGet your Korean chart in English — link in bio.'
  },
  'demo-manse': {
    hanja: '曆', title: 'The 24 solar terms\nbehind your chart', sub: 'The clock Saju actually runs on',
    cards: [
      { head: 'The sun\'s path, cut into 24', body: 'Every 15 degrees of the sun\'s journey marks a solar term — Start of Spring, Grain Rain, Great Heat, Winter Solstice.' },
      { head: 'Twelve of them start months', body: 'Your month pillar changes not on the 1st but at the term — Ipchun, Gyeongchip, Cheongmyeong… That is why "March-born" can be two different pillars.' },
      { head: 'They shift every year', body: 'A term can land on the 4th one year and the 5th the next, at a different hour. Almanacs exist because this is hard to do by hand.' },
      { head: 'Minutes matter at the edge', body: 'Born within hours of a term? Your month pillar hangs on the exact minute. A rough calculator can put you in the wrong season.' },
      { head: 'We compute it astronomically', body: 'Sajucheop calculates the sun\'s longitude to find each term\'s time, so boundary births get the right pillar — with a warning when it is close.' }
    ],
    caption: 'Saju does not run on months. It runs on 24 solar terms — and your pillar can flip on a single minute ⏱️\n\nGet a chart computed to the minute — link in bio.'
  },
  'demo-lunar': {
    hanja: '陰', title: 'Yin or Yang?\nHow your nature moves', sub: 'Same element, opposite style',
    cards: [
      { head: 'Every element comes in two', body: 'Wood is a Pine or a Vine. Fire is a Sun or a Flame. Yang is the bold form; Yin is the subtle one. Both are fully that element.' },
      { head: 'Yang pushes', body: 'Pine, Sun, Mountain, Blade, Sea. Outward, direct, hard to miss. They move first and think while moving.' },
      { head: 'Yin seeps', body: 'Vine, Flame, Field, Gem, Dew. Inward, patient, precise. They arrive without anyone seeing them leave.' },
      { head: 'Neither is stronger', body: 'A Vine climbs walls a Pine would snap against. A Flame lasts through nights that would exhaust a Sun. Different strategy, same power.' },
      { head: 'Which way do you move?', body: 'Your Day Master tells you both your element and its polarity — the material you are made of, and how it moves through the world.' }
    ],
    caption: 'Same element, opposite style. Yang pushes, Yin seeps — and neither one is the "strong" one ☯️\n\nFind your element and polarity in ten seconds — link in bio.'
  },
  'demo-naming': {
    hanja: '八', title: 'How to read\nyour eight characters', sub: 'A first look at a Saju chart',
    cards: [
      { head: 'Four columns, two rows', body: 'Year, month, day, hour — each a pillar. Top row: heavenly stems (sky). Bottom row: earthly branches (earth, the animals).' },
      { head: 'Find yourself first', body: 'Top of the day pillar. That stem is your Day Master — every other character is read in relation to it.' },
      { head: 'Then the season', body: 'The month branch is the climate you were born into. A Fire person born in winter and one born in summer live very different charts.' },
      { head: 'Count the elements', body: 'Sort all eight into Wood, Fire, Earth, Metal, Water. What is abundant, what is missing — that is your balance at a glance.' },
      { head: 'Let the chart do the rest', body: 'Sajucheop lays it out in English: pillars, Day Master archetype, element graph and the Ten Gods you carry. Free, no account.' }
    ],
    caption: 'Eight characters, four pillars, one main character. Here is how to read a Saju chart in a minute 📖\n\nSee yours laid out in English — link in bio.'
  }
};

/* ---------- 교육 쓰레드 (16, KO THREADS와 인덱스 공유) ---------- */
export const THREADS_EN = [
  'In Saju, "you" are one character out of eight.\n\nThe sky character of your birth day = the Day Master.\nTall Pine, Midday Sun, Morning Dew — ten natures.\n\nA zodiac animal is one per year. The Day Master changes daily. That is why Saju is sharper than the animal.\n\nFind yours in 10 seconds → ' + EN_URL,
  '3 questions never to ask a Saju reader\n\n1. "When will I die?" — Saju cannot see lifespan. Anyone who says they can, walk away.\n2. "Lottery numbers?" — Wealth luck is a current, not digits.\n3. "Is my chart bad?" — No bad charts. Only lopsided ones.\n\nSaju is a weather forecast, not a prophecy. ' + EN_URL,
  'What matters more than the compatibility score\n\nWhether your two Day Masters combine, and who you are to each other in the Ten Gods.\n\n"They are my Support — the shelter I rest in."\n"I am their Output — the spark that makes them create."\n\nThose two lines say more than ten scores.\n\nTwo birth dates, done → ' + EN_URL + '/match/',
  'Why the birth hour matters (and what if you don\'t know it)\n\nThe hour pillar is two of your eight characters — your private side, late life, children.\n\nDon\'t know it? Skip it. Six honest characters beat eight with a guess.\nA wrong hour quietly bends the whole reading.\n\nThere is an "I don\'t know my hour" button → ' + EN_URL,
  'A "clash day" is not a bad day.\n\nIt is a day when today\'s branch sits directly across from yours — Rat vs. Horse, Rabbit vs. Rooster.\n\nMeaning: things move. Plans shift, people travel, moods swing.\nOne rule: don\'t sign anything irreversible.\n\nSee today\'s energy for your chart → ' + EN_URL + '/today/',
  'The Saju new year is not January 1. Not Lunar New Year either.\n\nIt is Ipchun — the start of spring, ~February 4.\n\nSaju runs on solar terms, the sun\'s position.\nSo January babies almost always carry last year\'s animal. Check yours.\n\n' + EN_URL,
  'A strong vs. weak Day Master is not a personality test.\n\nStrong = your own energy is well fed; you win by pushing.\nWeak = you go furthest with support around you.\n\nNeither is better. The strategy is different.\nSolo vs. together — see which you are → ' + EN_URL,
  'Four or more of one element = excess.\n\nExcess Fire: passion becomes impatience.\nExcess Water: thinking becomes worrying.\nExcess Earth: caution becomes stubbornness.\n\nSurplus is more often the homework than a gap. You don\'t suppress it — you let it flow out.\n\nYour Five Elements graph → ' + EN_URL,
  'Each earthly branch hides 2–3 heavenly stems inside it.\n\nThey are called hidden stems.\nThe reason a quiet person can carry three different energies under the surface.\n\nThe Saju explanation for "I can never quite figure them out."\n\nSee your hidden characters → ' + EN_URL,
  'Born after 11 pm? Your chart gets tricky.\n\nThe late Rat hour — the clock says today, the chart says tomorrow.\n\nSomeone born 11:55 pm and someone born 12:05 am can have different day pillars.\nBoundary births need a calculator that handles it.\n\nOne that tracks solar terms to the minute → ' + EN_URL,
  'Saju is not BaZi — 3 differences\n\n1. Solar terms computed for Korea, not Beijing\n2. True-solar-time correction (Seoul runs ~32 min behind its clock)\n3. The late Rat hour convention for births after 11 pm\n\nSame eight characters, Korean calendar rules.\n\nThe Korean chart in English → ' + EN_URL,
  'How to read your daily score in 10 seconds\n\nThe number (20–96) is today\'s energy meeting your chart.\nThe weather word tells you the texture — Clear, Cloudy, Stormy.\nThe theme tells you which Ten God is driving the day.\n\nCheck it in the morning, act on it by noon.\n\n' + EN_URL + '/today/',
  'Reading a friend\'s chart? Look at one thing first.\n\nNot the animal. Not the score.\nThe Day Master — top of the day pillar.\n\nPine, Sun, Mountain, Gem, Dew… once you know their nature, everything they do makes sense.\n\nEnter their birth date → ' + EN_URL,
  'The 5 kinds of Day Master pairings\n\nCombine — two natures that lock together\nClash — opposites that spark and exhaust\nFeed — one nourishes the other\nDrain — one wears the other down\nSame — comfortable, mirror-like\n\nWhich one are you two? → ' + EN_URL + '/match/',
  'A newborn\'s chart reads differently from an adult\'s.\n\nThe luck cycles haven\'t started. It is the raw stone — temperament, not fate.\n\nWhy they fight sleep, what soothes them, which element they are short on.\nA user manual, not a prophecy.\n\nEnter the birth date → ' + EN_URL,
  '2027 is the year of the Fire Goat — Jeongmi.\n\nJeong is Yin Fire: a hearth, a candle. The blazing noon sun of 2026 sets, and a slow, steady flame takes over.\n\nA year for lasting over exploding, finishing over expanding.\n\nSee how it meets your chart → ' + EN_URL
];

/* ---------- 바이럴 쓰레드 (18, KO VIRAL_THREADS와 인덱스 공유) ---------- */
export const VIRAL_THREADS_EN = [
  'Tall Pine things:\n\n- Thinks while already walking\n- Can\'t apologize, repays with action\n- Somehow always ends up leading\n- Pine outside, tofu inside\n\nIf a Pine came to mind, send it.\nYour Day Master → ' + EN_URL,
  'Winding Vine things:\n\n- Grows back after being stepped on\n- Gets what it wants without a fight\n- Adapts anywhere, best new hire ever\n- Letting go means pulling the roots\n\nProof that soft is the strongest.\nYour Day Master → ' + EN_URL,
  'Midday Sun things:\n\n- Face works as subtitles\n- Angry, then over it in 10 minutes\n- Knows everyone, sometimes lonely\n- Drains fast when left alone\n\nA quiet Sun is a hurting Sun. Text them.\nYour Day Master → ' + EN_URL,
  'Candle Flame things:\n\n- Lights one person for years (true-love type)\n- First to notice your haircut\n- Burns its own wick caring for others\n- Weirdly calm in a crisis\n\nTake care of the Flame in your life. They\'re quietly doing everything.\n' + EN_URL,
  'Great Mountain things:\n\n- Everyone brings them their problems\n- Calm-on-the-outside even when anxious\n- Three years before they open up\n- Never drops what they hold\n\nIf a Mountain told you their real story, you\'re special.\nYour Day Master → ' + EN_URL,
  'Fertile Field things:\n\n- Counseling office, open 24/7\n- Can\'t say no → regrets it at midnight\n- Remembers what you said in passing\n- Someone else always takes the credit\n\nToday, give back to the Field who gives everything.\n' + EN_URL,
  'Raw Blade things:\n\n- No "talking around it" mode (facts, straight)\n- Runs on loyalty\n- Looks after you without showing it\n- "You worked hard" makes them cry inside\n\nBlunt but impossible to dislike = Blade.\nYour Day Master → ' + EN_URL,
  'Polished Gem things:\n\n- Taste is identity\n- Forgives, never forgets (keeps a ledger)\n- Knows exactly when to shine\n- Pretends to be dull, feels everything\n\nThe person for whom "anything\'s fine" is never fine.\n' + EN_URL,
  'Open Sea things:\n\n- Plans and worries both ocean-sized\n- Detours around conflict and wins\n- Holds everyone\'s secrets, shows none\n- Drifts with no destination and somehow arrives\n\nThe one you can\'t read? Probably a Sea.\n' + EN_URL,
  'Morning Dew things:\n\n- You never noticed when you got close\n- "I kind of felt this would happen" — and it did\n- Cries at commercials\n- Waters everyone, runs dry itself\n\nSend to the friend with great instincts and easy tears.\n' + EN_URL,
  'How to ask for their birthday without making it weird.\n\n"Let\'s check our Saju match" — that\'s it.\nTwo dates, ten seconds, and you get the Day Master chemistry plus who you are to each other in the Ten Gods.\n\nNothing stored. No account.\n\n' + EN_URL + '/match/',
  'Your daily score is not a horoscope — here\'s the math.\n\nToday has two characters (e.g. Fire Rat).\nThe sky one meets your Day Master → a Ten God theme.\nThe earth one meets your day branch → harmony, clash or neutral.\n\nOut comes a number, 20 to 96. Same input, same output.\n\n' + EN_URL + '/today/',
  'Check your whole family\'s Day Masters at dinner tonight.\n\nDad\'s a Mountain, mom\'s a Flame, the kid\'s a Sun — suddenly every argument in the house makes sense.\n\nTen seconds each. Free. Nothing stored.\n\n' + EN_URL,
  'Game: guess your friend\'s Day Master before checking.\n\nFast, principled, bad at apologies → Pine\nCan\'t hide a mood → Sun\nEveryone leans on them → Mountain\nVery specific taste → Gem\n\nThen enter their birth date and see if you were right.\n\n' + EN_URL,
  '24 solar terms — the clock your chart runs on.\n\nNot months. The sun\'s path cut into 24 slices.\nYour month pillar flips at the term, not on the 1st — and the term lands at a different minute every year.\n\nBorn near a boundary? The minute matters.\n\nComputed to the minute → ' + EN_URL,
  'Lunar or solar birthday — which one does Saju use?\n\nNeither. Saju runs on solar terms.\nEnter your Gregorian birth date; the calendar behind the scenes converts it to the year, month, day and hour pillars.\n\nNo need to look up your lunar date at all.\n\n' + EN_URL,
  'Your Chinese zodiac animal is 1 of 8 characters in your chart.\n\nAnd not the important one. The year branch is the family weather you were born into.\n"You" are the Day Master — top of the day pillar.\n\nFind the character that\'s actually you → ' + EN_URL,
  '"You have no Water in your chart." What that means:\n\n- Not a curse\n- Rest and flexibility may not come naturally\n- Swimming, night walks, black clothes — you top it up through life\n- Excess is usually the bigger homework than a gap\n\nYour Five Elements graph → ' + EN_URL
];
