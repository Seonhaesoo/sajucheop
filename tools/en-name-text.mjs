// Prose for /en/korean-name/ (Korean name generator by five elements).
// Data only: no HTML, no markup. Consumed by the page generator.

export const TEXT = {
  intro: [
    "Enter a birth date, or simply pick an element, and this page works out which of the five elements your Saju chart is short on. It then suggests two-syllable Korean given names whose hanja, the Chinese characters used in Korean names, carry that element. Korean naming masters call this 자원오행 (jawon ohaeng), \"five elements by character origin\", and it has shaped Korean names for generations.",
    "It is for fun and for learning, not a certified naming service. A naming master weighs far more than one method, and a name is finally a matter of taste and family. Use the results as a starting point: a way to meet Korean names, learn what their characters mean, and see how the five elements run through them."
  ],

  how: [
    {
      h: "How a Korean name is built",
      p: [
        "A Korean name is usually three syllables: a one-syllable surname followed by a two-syllable given name, written surname first. Each syllable of the given name is traditionally a hanja, a Chinese character chosen for its sound and its meaning at the same time, so 지호 (Ji-ho) might pair 智, wisdom, with 浩, vast.",
        "The hanja must come from the list of characters the Supreme Court of Korea allows in personal names (인명용 한자), which now runs to more than 8,000 characters. Not every name uses them, though: many modern names are pure Korean words such as 하늘 (sky) or 슬기 (wisdom) and are registered in hangul alone."
      ]
    },
    {
      h: "What jawon ohaeng means",
      p: [
        "Each hanja is assigned to one of the five elements by its radical (부수), the root component that hints at what the character is about. Characters built on tree, grass or grain radicals count as Wood; fire, sun or heart radicals as Fire; earth, mountain, field or roof radicals as Earth; metal, jade, knife or shell radicals as Metal; and water, rain or ice radicals as Water.",
        "A naming master reads the client's Saju chart, finds the element that is missing or weakest, and chooses characters that supply it. Professional naming also weighs the stroke counts of the characters (수리 성명학) and the element of each syllable's sound (발음오행). This page uses the radical method only, so treat its suggestions as one lens among several."
      ]
    },
    {
      h: "Which element you need",
      p: [
        "The simplest classical rule looks at the eight characters of your chart, two each for the year, month, day and hour, and counts how many belong to each element. The element with none, or with the fewest, is the one your name can supply. Enter a birth date and the tool does the count for you; if you already know your answer, pick an element directly.",
        "A second rule starts from the Day Master, the heavenly stem of your day pillar, which stands for you. When the Day Master is weak, the name should supply the element that feeds it: Water feeds Wood, Wood feeds Fire, Fire feeds Earth, Earth feeds Metal, and Metal feeds Water. When the two rules point to different elements, the tool shows both so you can compare."
      ]
    },
    {
      h: "Reading the results",
      p: [
        "Each suggestion is romanized with Revised Romanization, the official system used on road signs and in textbooks, with common passport-style spellings in brackets. So you will see Seo-yeon and Ji-ho, but also 영 Yeong, often spelled Young; 수 Su, often Soo; and 희 Hui, often Hee. Either spelling is fine in everyday use, and many Koreans keep the passport form for life.",
        "The hyphen between the two syllables is optional: Seo-yeon, Seoyeon and Seo Yeon all appear on real documents, though the hyphen makes the syllable break clear to English readers. Koreans write and say the surname first, so a girl named 서연 in the Kim family is 김서연, Kim Seo-yeon. Abroad, many people flip the order to match local habit."
      ]
    }
  ],

  romanization: [
    "eo is the \"u\" in \"sun\", so Seo-yeon starts like \"suh\"; ae is the \"e\" in \"bed\", as in Tae-yang; eu is a tight \"oo\" made with the lips flat rather than rounded, a sound English lacks, so Eun-woo is nearer to \"un-woo\" than to \"yoon-woo\".",
    "Final consonants are not released: the k that ends Min-seok and the p that ends Sang-yeop stop in the mouth without the puff of air English adds, so do not tack a vowel on after them.",
    "An initial ㄹ, written r, sits between English r and l: in Ryu or Ra-on the tongue taps lightly just behind the top teeth. A doubled ㄹㄹ, as in Seol-li, is a plain l."
  ],

  surnames: [
    { rr: "Kim",   alt: "Gim",   ko: "김", hanja: "金", meaning: "gold, metal" },
    { rr: "Lee",   alt: "I",     ko: "이", hanja: "李", meaning: "plum tree" },
    { rr: "Park",  alt: "Bak",   ko: "박", hanja: "朴", meaning: "simple, unadorned; magnolia" },
    { rr: "Choi",  alt: "Choe",  ko: "최", hanja: "崔", meaning: "lofty, high" },
    { rr: "Jung",  alt: "Jeong", ko: "정", hanja: "鄭", meaning: "name of an ancient state" },
    { rr: "Kang",  alt: "Gang",  ko: "강", hanja: "姜", meaning: "ginger; an ancient clan" },
    { rr: "Cho",   alt: "Jo",    ko: "조", hanja: "趙", meaning: "an ancient state" },
    { rr: "Yoon",  alt: "Yun",   ko: "윤", hanja: "尹", meaning: "to govern" },
    { rr: "Jang",  alt: "Jang",  ko: "장", hanja: "張", meaning: "to stretch, to spread" },
    { rr: "Lim",   alt: "Im",    ko: "임", hanja: "林", meaning: "forest" },
    { rr: "Han",   alt: "Han",   ko: "한", hanja: "韓", meaning: "name of Korea; an ancient state" },
    { rr: "Oh",    alt: "O",     ko: "오", hanja: "吳", meaning: "an ancient state" },
    { rr: "Seo",   alt: "Seo",   ko: "서", hanja: "徐", meaning: "slowly, calm" },
    { rr: "Shin",  alt: "Sin",   ko: "신", hanja: "申", meaning: "to state; the Monkey branch" },
    { rr: "Kwon",  alt: "Gwon",  ko: "권", hanja: "權", meaning: "authority" },
    { rr: "Hwang", alt: "Hwang", ko: "황", hanja: "黃", meaning: "yellow" },
    { rr: "Ahn",   alt: "An",    ko: "안", hanja: "安", meaning: "peace" },
    { rr: "Song",  alt: "Song",  ko: "송", hanja: "宋", meaning: "an ancient dynasty" },
    { rr: "Ryu",   alt: "Ryu",   ko: "류", hanja: "柳", meaning: "willow" },
    { rr: "Hong",  alt: "Hong",  ko: "홍", hanja: "洪", meaning: "vast flood" }
  ],

  faq: [
    {
      q: "Does a Korean name have to have hanja?",
      a: "No. Many Koreans register hangul-only names, and pure Korean names such as 하늘 or 이슬 have no characters at all. Hanja add a second layer of meaning and are needed for the element method, but a name written only in hangul is every bit as official."
    },
    {
      q: "Can a foreigner have a Korean name?",
      a: "Yes. Language learners, K-pop fans and people in international marriages often choose one, and Korean friends or teachers enjoy helping. Nothing legal is required: you can simply use it. Only if you naturalize does a name need to be registered officially."
    },
    {
      q: "Is the five-element method scientifically proven?",
      a: "No. It is a cultural tradition, part of the same world of ideas as the Saju chart itself, and there is no evidence that a name's element changes a person's fortune. The honest way to use it is the way you would use any naming tradition: choose a name whose sound and meaning you genuinely like."
    },
    {
      q: "Why two syllables?",
      a: "Convention, not law. Two-syllable given names became the norm over the past few centuries, partly because one syllable was often a generation name (돌림자) shared with siblings and cousins. One-syllable names such as 준 (Jun) and three-syllable ones, often pure Korean, exist and are perfectly legal."
    },
    {
      q: "How do I know which hanja to register?",
      a: "Parents write the name in hangul on the birth report and add the hanja for each syllable beside it. The registry accepts only characters on the Supreme Court's list of name hanja, so an unlisted character has to be swapped for a listed one with the same sound. Check a character against that list before registering it."
    },
    {
      q: "Are these names actually used in Korea today?",
      a: "Yes. The syllables come from names that have been popular over the last few decades, and the pairings are ordinary Korean given names you would meet in any classroom or office. A few pairings are rarer than others, but all of them read as real Korean names."
    }
  ],

  disclaimer: "This page is for entertainment and learning only; it is not a substitute for a professional naming service (작명소) or for legal advice on registering a name."
};
