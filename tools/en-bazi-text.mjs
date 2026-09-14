// Prose for /en/bazi-calculator/ (free BaZi / Four Pillars of Destiny calculator).
// Data only: no HTML, no markup. Consumed by the page generator.
// Conventions described here match docs/js/manseryeok.js: year changes at Li Chun,
// month at the twelve jie (Sun's apparent longitude, published almanac times overlaid),
// day at midnight of the corrected time, 23:00-00:59 = Zi hour (late-Zi rule),
// full hidden-stem table, Luck Pillar start age = days to the jie / 3, rounded.

export const TEXT = {
  intro: [
    "Enter your birth date, time and place and this free BaZi calculator draws your Four Pillars of Destiny: the year, month, day and hour pillars, eight Chinese characters in all. From them it identifies your Day Master, labels every other character with its Ten God, lists the hidden stems inside each branch, weighs the balance of the five elements and judges whether the Day Master is strong or weak.",
    "It also lays out your ten-year Luck Pillars and the annual pillars around the current year. There is no sign-up and no fee, and nothing you type leaves your browser. Month boundaries follow the Sun's actual longitude, the twenty-four solar terms, rather than calendar months, so a birth on 5 February or 8 March lands in the correct pillar."
  ],

  sections: [
    {
      h: "What is BaZi?",
      p: [
        "BaZi (八字) means \"eight characters\". Your birth year, month, day and hour each become a pillar of two characters, so the whole chart has eight. The upper character of each pillar is a Heavenly Stem (天干) and the lower one an Earthly Branch (地支). Chinese almanacs have paired stems and branches this way for over two thousand years, and the same pairs name the years of the sixty-year cycle.",
        "There are ten stems: Jia 甲, Yi 乙, Bing 丙, Ding 丁, Wu 戊, Ji 己, Geng 庚, Xin 辛, Ren 壬 and Gui 癸. Each belongs to one of the five elements (Wood, Fire, Earth, Metal, Water) and is yang or yin: Jia is yang Wood, Yi is yin Wood. The twelve branches run from Zi 子 to Hai 亥, the twelve animals of the Chinese zodiac, and each carries an element and a season.",
        "The stem of your day pillar is the Day Master (日主, ri zhu), the character that stands for you. It is the fixed point of the chart. The other seven characters are not read on their own; each is read by its relationship to the Day Master, as the element that feeds it, drains it, controls it, is controlled by it or matches it. Those relationships are the Ten Gods."
      ]
    },
    {
      h: "How this calculator builds your chart",
      p: [
        "The year pillar does not change on 1 January. It changes at Li Chun (立春), the start of spring, which falls on or about 4 February when the Sun reaches 315 degrees of ecliptic longitude. Someone born on 20 January 1990 therefore has the year pillar of 1989, the Snake year, not the Horse year printed on the calendar.",
        "Month pillars change at the twelve \"jie\" (節) solar terms, one every 30 degrees of the Sun's path: Li Chun opens the Yin 寅 month, Jing Zhe (驚蟄) the Mao 卯 month, and so on. This calculator computes the Sun's apparent ecliptic longitude for the exact moment of birth, so a birth two hours before a term falls in the earlier month and two hours after it in the later one. The day pillar changes at midnight.",
        "The hour pillar uses the twelve two-hour branches: Zi 子 23:00 to 00:59, Chou 丑 01:00 to 02:59, through to Hai 亥 21:00 to 22:59. Enter your birthplace longitude to switch on true solar time, the classic BaZi correction: clock time shifts four minutes per degree from your time zone's standard meridian. With the hour unknown, leave it blank: a six-character chart is still valid for the Day Master, the Ten Gods and the Luck Pillars."
      ]
    },
    {
      h: "Reading the result",
      p: [
        "Start with the Day Master and its strength. The calculator rates it strong, weak or balanced, judged mainly by the month branch, the season of birth, then by how many other characters share or feed its element. Jia Wood born in spring with Water nearby is strong; the same Jia born in autumn among Metal is weak. Branches count through their hidden stems (藏干), the stems stored inside each branch: Yin 寅 holds Jia, Bing and Wu.",
        "Every other character is labelled with one of the Ten Gods (十神), its relationship to the Day Master. Same element: Friend 比肩, Rob Wealth 劫財. What you produce: Eating God 食神, Hurting Officer 傷官. What you control: Indirect Wealth 偏財, Direct Wealth 正財. What controls you: Seven Killings 七殺, Direct Officer 正官. What feeds you: Indirect Resource 偏印, Direct Resource 正印. The first of each pair has the Day Master's polarity, the second the opposite.",
        "Luck Pillars (大運) are ten-year periods counted from the month pillar: forward for men born in a yang year and women born in a yin year, backward otherwise. The starting age is the days to the next jie (forward) or the previous jie (backward), three days making one year. Annual pillars (流年) are the characters of each year; watch for a year whose branch clashes (冲) with your day branch or combines (合) with it."
      ]
    },
    {
      h: "Why your chart may differ from another site",
      p: [
        "Two charts for one birth can disagree, and the cause is nearly always one of five settings. First, solar-term times. Some sites switch months on fixed dates or on a rough table, so a birth within a few hours of a term can land in the wrong month pillar, which also shifts the Luck Pillar starting age. This page computes the Sun's ecliptic longitude for the moment of birth and overlays the published almanac times.",
        "Second, true solar time, on or off. Switched on, a birth at 00:30 in Singapore becomes 23:25 the day before and the day pillar moves; this page lets you choose. Third, time zone and daylight saving. Singapore and Malaysia shifted their clocks in 1982, and many countries ran summer time in some years, so enter the clock time as recorded and pick the zone in force that day; this page applies the zone you pick and nothing else.",
        "Fourth, the Zi hour. Some schools start the day at 23:00 (early Zi), giving a 23:30 birth the next day's pillar. This page changes the day at midnight and treats 23:00 to 00:59 as the Zi hour, the late-Zi rule used in Korea, so a birth in that hour may show a different day pillar elsewhere. Fifth, hidden-stem tables: this page uses the full table, where Zi holds Ren and Gui; some sites list only the principal stem."
      ]
    },
    {
      h: "BaZi and Korean Saju",
      p: [
        "Korean Saju (사주, 四柱) and Chinese BaZi are the same system. Both use the same solar calendar, the same sixty-cycle of stems and branches and the same eight characters; a chart cast in Seoul and a chart cast in Singapore for the same birth agree character for character, given the same settings. What differs is the reading.",
        "The Korean tradition reads the same chart with its own emphasis. It leans on the day pillar as a character type, with sixty day-pillar profiles (일주론) as familiar to Koreans as sun signs are in the West, and it tells the ten-year Luck Pillars as a life story rather than a list of helpful and unhelpful elements. Chinese practice puts more weight on the Useful God (用神) and chart structure. For the two side by side, read the comparison.",
        "The same engine that draws your chart here also powers the Korean-style Saju calculator at /en/. Given the same birth data and the same settings, the two pages produce the same eight characters; only the commentary changes. Use whichever reading speaks to you, or read both."
      ]
    }
  ],

  faq: [
    {
      q: "Is this BaZi calculator free?",
      a: "Yes. There is no charge, no account and no sign-up. The calculation runs entirely in your browser: your birth date, time and place are not sent to a server or stored anywhere. The Four Pillars, Ten Gods, hidden stems, element balance, Day Master strength, Luck Pillars and annual pillars are all included."
    },
    {
      q: "I don't know my birth hour. Is the chart still useful?",
      a: "Yes. Leave the hour blank and the calculator builds a six-character chart from the year, month and day. The Day Master, the Ten Gods of the other five characters, the element balance and the Luck Pillars all stand; only the hour pillar, and whatever it would add, is missing. If you later learn the hour, run it again."
    },
    {
      q: "Which time zone should I choose?",
      a: "The zone that was legally in force at your birthplace on the day you were born, including any daylight saving then in effect, because the clock time on your birth record was set by that zone. Singapore and Peninsular Malaysia, for example, used UTC+7:30 before 1 January 1982 and UTC+8 after. If you cannot check, choose the zone in use today and compare both results."
    },
    {
      q: "Should I turn on true solar time?",
      a: "Classical BaZi assumes local solar time, because the hour branches were defined by the Sun, not by a time zone. Turn it on if you want that standard, especially if your birthplace lies far from its zone's meridian: Singapore, Kuala Lumpur and Mumbai all run more than half an hour behind their clocks. Leave it off to match a chart cast from plain clock time."
    },
    {
      q: "Why does my Day Master differ from another calculator?",
      a: "The Day Master is the day stem, so it changes only when the two charts disagree about which day you were born on in BaZi terms. Three settings can do that: true solar time pushing a birth after midnight into the previous evening, a different time zone or daylight-saving assumption, and the Zi-hour convention, where some schools start the new day at 23:00. Check those three first."
    },
    {
      q: "What is a strong or weak Day Master?",
      a: "A Day Master is strong when the chart supports its element: born in its season, with several characters of the same element or the element that produces it. It is weak when the season and the other characters drain or control it. Neither is better: a strong chart welcomes elements that spend its energy, a weak chart those that feed it, and the Useful God is chosen accordingly."
    },
    {
      q: "How are Luck Pillars calculated?",
      a: "Luck Pillars are the pillars that follow your month pillar in the sixty-cycle, ten years each. Men born in a yang year and women born in a yin year take them forward; everyone else takes them backward. The first begins at an age found by counting the days from birth to the next (forward) or previous (backward) jie and dividing by three: nine days gives age three."
    },
    {
      q: "Is BaZi the same as the Chinese zodiac?",
      a: "No. The zodiac animal is one character of the eight: your year branch. BaZi reads all eight, and the day pillar, not the year, stands for you. Two people born in the same Dragon year can have entirely different charts, and because BaZi changes the year at Li Chun rather than at Chinese New Year, a birth in the days between the two can carry a different animal."
    }
  ],

  glossary: [
    { term: "Day Master 日主 (ri zhu)", def: "The Heavenly Stem of the day pillar. It represents you, and every other character in the chart is read in relation to it." },
    { term: "Heavenly Stems 天干 (tian gan)", def: "The ten characters Jia, Yi, Bing, Ding, Wu, Ji, Geng, Xin, Ren and Gui, each a yin or yang form of one element." },
    { term: "Earthly Branches 地支 (di zhi)", def: "The twelve characters from Zi to Hai that mark years, months and two-hour periods; the same twelve as the zodiac animals." },
    { term: "Ten Gods 十神 (shi shen)", def: "The ten relationships a character can have with the Day Master, such as Direct Wealth or Seven Killings, defined by element and polarity." },
    { term: "Hidden Stems 藏干 (cang gan)", def: "The one to three Heavenly Stems stored inside each Earthly Branch; the principal stem carries the most weight." },
    { term: "Li Chun 立春", def: "The solar term that begins spring, around 4 February, when the Sun reaches 315 degrees. The BaZi year and the Yin month begin here." },
    { term: "Jie 節 (solar terms)", def: "The twelve solar terms, spaced 30 degrees apart along the Sun's path, at which the month pillar changes; Li Chun is the first." },
    { term: "Luck Pillars 大運 (da yun)", def: "Ten-year periods that step forward or backward from the month pillar through the sixty-cycle; each sets the tone of a decade." },
    { term: "Annual Pillar 流年 (liu nian)", def: "The stem and branch of a calendar year, changing at Li Chun; read against the natal chart and the current Luck Pillar." },
    { term: "Clash 冲 (chong)", def: "A pairing of two branches six places apart, such as Zi and Wu, that unsettle or displace each other." },
    { term: "Combine 合 (he)", def: "Two branches or two stems that bind together, such as Zi and Chou or Jia and Ji, and may transform into another element." },
    { term: "Useful God 用神 (yong shen)", def: "The element a chart needs to restore balance: one that feeds a weak Day Master or spends a strong one. It guides the reading." }
  ]
};
