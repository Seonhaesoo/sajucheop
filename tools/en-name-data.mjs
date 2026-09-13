/* Korean given-name syllables with name hanja, classified by 자원오행 (the element of the character's radical).
 * Used by tools/build-en-names.mjs → docs/js/en-names.js and /en/korean-name/.
 * Only radicals whose element is settled in the customary tables are used; hanja with disputed radicals
 * (人 亻, 示, 隹, 曰, 一, 夕 …) are left out on purpose, even when the character is common in names.
 *   s: hangul syllable   rr: Revised Romanization   alt: common passport spelling (if different)
 *   say: rough English sound   g: f | m | n (feminine / masculine / neutral lean in today's names)
 *   pos: first | last | both (usual position in a two-syllable given name)   pop: 1–3 (3 = very common)
 *   hj: [{ h: hanja, el: 목|화|토|금|수, m: meaning, r: radical gloss }] */

export const RADICALS = {
  '목': ['木 tree', '艹 grass', '禾 grain', '竹 bamboo', '糸 silk', '衣 clothing', '米 rice', '弓 bow', '手 hand', '目 eye', '大 big', '巾 cloth', '靑 blue-green', '門 gate', '乙 second stem'],
  '화': ['火 fire', '灬 fire dots', '日 sun', '心 heart', '忄 heart', '赤 red', '彳 step', '彡 brush strokes', '馬 horse', '羽 feather'],
  '토': ['土 earth', '山 mountain', '田 field', '阝 mound / town', '宀 roof', '广 shelter', '厂 cliff', '里 village', '女 woman', '囗 enclosure', '辶 walk', '止 stop', '至 arrive', '龍 dragon', '足 foot', '生 life', '廴 stride', '羊 sheep'],
  '금': ['金 metal', '玉 / 王 jade', '刀 / 刂 knife', '貝 shell (money)', '白 white', '車 cart', '言 speech', '戈 spear', '矢 arrow', '酉 wine jar', '革 leather'],
  '수': ['水 / 氵 water', '雨 rain', '冫 ice', '口 mouth', '魚 fish', '巛 river', '食 food']
};

const S = (s, rr, say, g, pos, pop, hj, alt) => ({ s, rr, alt: alt || null, say, g, pos, pop, hj });
const H = (h, el, m, r) => ({ h, el, m, r });

export const SYLLABLES = [
  S('서', 'seo', 'suh', 'n', 'first', 3, [
    H('瑞', '금', 'auspicious, a lucky omen', '玉 jade'), H('曙', '화', 'dawn light', '日 sun'), H('序', '토', 'order, a beginning', '广 shelter'),
    H('栖', '목', 'to nest, to settle', '木 tree'), H('徐', '화', 'calm, unhurried', '彳 step'), H('恕', '화', 'forgiveness, empathy', '心 heart')]),
  S('연', 'yeon', 'yun', 'n', 'both', 3, [
    H('姸', '토', 'beautiful, graceful', '女 woman'), H('娟', '토', 'lovely', '女 woman'), H('妍', '토', 'beautiful', '女 woman'), H('延', '토', 'to extend, to last', '廴 stride'),
    H('淵', '수', 'deep pool, profound', '氵 water'), H('演', '수', 'to unfold, perform', '氵 water'), H('涓', '수', 'clear trickling water', '氵 water'), H('沇', '수', 'flowing water', '氵 water'),
    H('燕', '화', 'swallow (the bird)', '灬 fire dots'), H('然', '화', 'so, natural', '灬 fire dots'), H('曣', '화', 'clear sky', '日 sun'),
    H('蓮', '목', 'lotus', '艹 grass'), H('練', '목', 'refined, practised', '糸 silk'), H('瑌', '금', 'jade-like stone', '玉 jade'), H('鍊', '금', 'tempered, refined', '金 metal')]),
  S('윤', 'yun', 'yoon', 'n', 'both', 3, [
    H('潤', '수', 'moist, glossy, enriching', '氵 water'), H('昀', '화', 'sunlight', '日 sun'), H('玧', '금', 'lustre of jade', '玉 jade')], 'Yoon'),
  S('지', 'ji', 'jee', 'n', 'both', 3, [
    H('智', '화', 'wisdom', '日 sun'), H('志', '화', 'will, aspiration', '心 heart'), H('池', '수', 'pond', '氵 water'), H('沚', '수', 'islet', '氵 water'),
    H('芝', '목', 'lingzhi, sacred herb', '艹 grass'), H('枝', '목', 'branch', '木 tree'), H('芷', '목', 'angelica herb', '艹 grass'),
    H('址', '토', 'foundation, site', '土 earth'), H('知', '금', 'to know', '矢 arrow'), H('誌', '금', 'record, to remember', '言 speech')]),
  S('호', 'ho', 'ho', 'n', 'both', 3, [
    H('浩', '수', 'vast, grand', '氵 water'), H('湖', '수', 'lake', '氵 water'), H('澔', '수', 'vast', '氵 water'), H('淏', '수', 'clear water', '氵 water'), H('灝', '수', 'boundless water', '氵 water'),
    H('昊', '화', 'summer sky', '日 sun'), H('晧', '화', 'bright', '日 sun'), H('皓', '금', 'bright, white', '白 white'), H('皞', '금', 'bright and calm', '白 white'),
    H('鎬', '금', 'bright; an ancient capital', '金 metal'), H('護', '금', 'to protect', '言 speech'), H('好', '토', 'good, fond', '女 woman'), H('岵', '토', 'wooded hill', '山 mountain')]),
  S('준', 'jun', 'joon', 'm', 'both', 3, [
    H('埈', '토', 'high, steep', '土 earth'), H('峻', '토', 'lofty mountain', '山 mountain'), H('寯', '토', 'outstanding', '宀 roof'), H('畯', '토', 'field overseer', '田 field'),
    H('浚', '수', 'deep, to dredge', '氵 water'), H('準', '수', 'standard, level', '氵 water'), H('濬', '수', 'deep, profound', '氵 water'),
    H('晙', '화', 'bright, early light', '日 sun'), H('焌', '화', 'to light a fire', '火 fire'), H('駿', '화', 'fine horse, swift', '馬 horse')], 'Joon'),
  S('현', 'hyeon', 'hyun', 'n', 'both', 3, [
    H('賢', '금', 'wise, worthy', '貝 shell'), H('玹', '금', 'jade-like stone', '玉 jade'), H('鉉', '금', 'cauldron handle; high office', '金 metal'),
    H('炫', '화', 'to shine, dazzle', '火 fire'), H('晛', '화', 'sunlight', '日 sun'), H('昡', '화', 'bright sunlight', '日 sun'),
    H('泫', '수', 'glistening drops', '氵 water'), H('峴', '토', 'hill', '山 mountain'), H('娊', '토', 'graceful', '女 woman'),
    H('弦', '목', 'bowstring; crescent', '弓 bow'), H('絃', '목', 'string of an instrument', '糸 silk')], 'Hyun'),
  S('민', 'min', 'min', 'n', 'both', 3, [
    H('旻', '화', 'autumn sky', '日 sun'), H('旼', '화', 'gentle, harmonious', '日 sun'), H('慜', '화', 'clever, quick', '心 heart'),
    H('珉', '금', 'jade-like stone', '玉 jade'), H('玟', '금', 'streaked jade', '玉 jade'), H('泯', '수', 'clear water', '氵 water'), H('湣', '수', 'calm water', '氵 water'),
    H('岷', '토', 'Mount Min', '山 mountain'), H('苠', '목', 'grass stalk', '艹 grass')]),
  S('하', 'ha', 'hah', 'n', 'first', 3, [
    H('河', '수', 'river', '氵 water'), H('霞', '수', 'rosy clouds', '雨 rain'), H('荷', '목', 'lotus', '艹 grass'), H('賀', '금', 'to congratulate', '貝 shell'),
    H('夏', '화', 'summer', '夊 (customary Fire)'), H('昰', '화', 'summer; right', '日 sun'), H('廈', '토', 'great house', '广 shelter')]),
  S('은', 'eun', 'un', 'n', 'both', 3, [
    H('恩', '화', 'grace, kindness', '心 heart'), H('慇', '화', 'earnest, heartfelt', '心 heart'), H('銀', '금', 'silver', '金 metal'), H('珢', '금', 'jade-like stone', '玉 jade'),
    H('誾', '금', 'gentle, respectful', '言 speech'), H('垠', '토', 'horizon, boundary', '土 earth'), H('隱', '토', 'hidden, quiet', '阝 mound'),
    H('溵', '수', 'sound of water', '氵 water'), H('檼', '목', 'ridgepole, support', '木 tree')]),
  S('아', 'a', 'ah', 'f', 'both', 3, [
    H('娥', '토', 'beautiful; moon goddess', '女 woman'), H('阿', '토', 'hill; gentle', '阝 mound'), H('峨', '토', 'lofty', '山 mountain'), H('婀', '토', 'graceful', '女 woman'),
    H('芽', '목', 'sprout', '艹 grass'), H('莪', '목', 'fragrant herb', '艹 grass'), H('涐', '수', 'river name', '氵 water'), H('誐', '금', 'fine, good', '言 speech')], 'Ah'),
  S('도', 'do', 'doh', 'n', 'first', 3, [
    H('道', '토', 'the Way, path', '辶 walk'), H('都', '토', 'capital, all', '阝 town'), H('島', '토', 'island', '山 mountain'), H('陶', '토', 'pottery; content', '阝 mound'), H('度', '토', 'measure, grace', '广 shelter'),
    H('桃', '목', 'peach', '木 tree'), H('稻', '목', 'rice plant', '禾 grain'), H('濤', '수', 'great waves', '氵 water'), H('渡', '수', 'to cross over', '氵 water'), H('燾', '화', 'to shine upon', '灬 fire dots')]),
  S('유', 'yu', 'yoo', 'n', 'both', 3, [
    H('裕', '목', 'abundance, ease', '衣 clothing'), H('柔', '목', 'gentle, soft', '木 tree'), H('榆', '목', 'elm', '木 tree'), H('楢', '목', 'oak', '木 tree'),
    H('瑜', '금', 'fine jade', '玉 jade'), H('諭', '금', 'to enlighten', '言 speech'), H('愈', '화', 'to heal, to excel', '心 heart'), H('悠', '화', 'serene, far-reaching', '心 heart'), H('惟', '화', 'to think, only', '忄 heart'),
    H('由', '토', 'reason, origin', '田 field'), H('宥', '토', 'generous, forgiving', '宀 roof'), H('唯', '수', 'only, unique', '口 mouth'), H('游', '수', 'to roam, to swim', '氵 water'), H('洧', '수', 'river name', '氵 water')], 'Yoo'),
  S('우', 'u', 'oo', 'n', 'both', 3, [
    H('宇', '토', 'universe, eaves', '宀 roof'), H('堣', '토', 'corner, nook', '土 earth'), H('雨', '수', 'rain', '雨 rain'), H('湡', '수', 'river name', '氵 water'),
    H('瑀', '금', 'jade ornament', '玉 jade'), H('玗', '금', 'jade-like stone', '玉 jade'), H('訏', '금', 'grand, vast', '言 speech'), H('旴', '화', 'sunrise', '日 sun'), H('栯', '목', 'wild cherry', '木 tree')], 'Woo'),
  S('재', 'jae', 'jeh', 'n', 'both', 3, [
    H('在', '토', 'to exist, present', '土 earth'), H('宰', '토', 'to govern', '宀 roof'), H('材', '목', 'talent, timber', '木 tree'), H('栽', '목', 'to plant, cultivate', '木 tree'), H('梓', '목', 'catalpa; homeland', '木 tree'),
    H('財', '금', 'wealth', '貝 shell'), H('載', '금', 'to carry, record', '車 cart'), H('渽', '수', 'clear', '氵 water')]),
  S('영', 'yeong', 'young', 'n', 'both', 3, [
    H('榮', '목', 'glory, flourishing', '木 tree'), H('英', '목', 'flower; hero', '艹 grass'), H('楹', '목', 'pillar', '木 tree'),
    H('永', '수', 'eternal', '水 water'), H('泳', '수', 'to swim', '氵 water'), H('潁', '수', 'river name', '氵 water'), H('瀛', '수', 'ocean', '氵 water'), H('渶', '수', 'clear water', '氵 water'),
    H('瑛', '금', 'lustre of jade', '玉 jade'), H('瑩', '금', 'lustrous, clear', '玉 jade'), H('詠', '금', 'to sing, recite', '言 speech'), H('瓔', '금', 'jade necklace', '玉 jade'),
    H('暎', '화', 'to reflect, shine', '日 sun'), H('映', '화', 'reflection, glow', '日 sun'), H('煐', '화', 'brilliant', '火 fire'), H('營', '화', 'to build, manage', '火 fire'),
    H('嶺', '토', 'mountain ridge', '山 mountain'), H('寧', '토', 'peaceful', '宀 roof')], 'Young'),
  S('수', 'su', 'soo', 'n', 'both', 3, [
    H('秀', '목', 'outstanding', '禾 grain'), H('樹', '목', 'tree, to establish', '木 tree'), H('穗', '목', 'ear of grain', '禾 grain'), H('粹', '목', 'pure', '米 rice'), H('綏', '목', 'peaceful', '糸 silk'),
    H('洙', '수', 'river name', '氵 water'), H('水', '수', 'water', '水 water'), H('澻', '수', 'stream', '氵 water'),
    H('守', '토', 'to guard, keep', '宀 roof'), H('岫', '토', 'mountain cave', '山 mountain'), H('隨', '토', 'to follow', '阝 mound'),
    H('銖', '금', 'a small weight; precise', '金 metal'), H('琇', '금', 'jade-like stone', '玉 jade'), H('璲', '금', 'jade pendant', '玉 jade'), H('燧', '화', 'flint fire', '火 fire')], 'Soo'),
  S('진', 'jin', 'jin', 'n', 'both', 3, [
    H('珍', '금', 'precious', '玉 jade'), H('鎭', '금', 'to calm, guard', '金 metal'), H('瑨', '금', 'beautiful stone', '玉 jade'), H('璡', '금', 'jade-like stone', '玉 jade'),
    H('進', '토', 'to advance', '辶 walk'), H('辰', '토', 'the Dragon branch; time', '辰 (Earth branch)'), H('陳', '토', 'to display; old', '阝 mound'), H('臻', '토', 'to reach, attain', '至 arrive'),
    H('晉', '화', 'to advance, rise', '日 sun'), H('震', '수', 'thunder', '雨 rain'), H('溱', '수', 'abundant water', '氵 water'), H('津', '수', 'ferry, ford', '氵 water'),
    H('榛', '목', 'hazel', '木 tree'), H('眞', '목', 'true, genuine', '目 eye'), H('振', '목', 'to rouse, to shake', '手 hand'), H('秦', '목', 'the Qin state', '禾 grain'), H('蓁', '목', 'lush', '艹 grass')]),
  S('소', 'so', 'so', 'f', 'first', 3, [
    H('昭', '화', 'bright, clear', '日 sun'), H('炤', '화', 'bright', '火 fire'), H('愫', '화', 'sincerity', '忄 heart'),
    H('素', '목', 'plain, pure', '糸 silk'), H('笑', '목', 'smile', '竹 bamboo'), H('蘇', '목', 'to revive', '艹 grass'), H('紹', '목', 'to continue, introduce', '糸 silk'),
    H('沼', '수', 'pond', '氵 water'), H('溯', '수', 'to trace upstream', '氵 water'), H('霄', '수', 'sky', '雨 rain'), H('瀟', '수', 'clear and deep', '氵 water'),
    H('邵', '토', 'lofty; a surname', '阝 town'), H('甦', '토', 'to revive', '生 life'), H('玿', '금', 'beautiful jade', '玉 jade')]),
  S('예', 'ye', 'yeh', 'f', 'both', 3, [
    H('藝', '목', 'art, skill', '艹 grass'), H('芮', '목', 'small, budding', '艹 grass'), H('芸', '목', 'rue herb; talent', '艹 grass'), H('蘂', '목', 'stamen', '艹 grass'), H('睿', '목', 'wise, far-sighted', '目 eye'),
    H('譽', '금', 'honour, praise', '言 speech'), H('銳', '금', 'sharp, keen', '金 metal'), H('玴', '금', 'jade-like stone', '玉 jade'),
    H('汭', '수', 'river bend', '氵 water'), H('霓', '수', 'rainbow', '雨 rain'), H('埶', '토', 'to plant', '土 earth'), H('燡', '화', 'shining', '火 fire')]),
  S('린', 'rin', 'rin', 'f', 'last', 3, [
    H('潾', '수', 'clear water', '氵 water'), H('璘', '금', 'lustre of jade', '玉 jade'), H('隣', '토', 'neighbour', '阝 mound'), H('嶙', '토', 'steep peaks', '山 mountain'),
    H('燐', '화', 'glow, phosphorescence', '火 fire'), H('藺', '목', 'rush plant', '艹 grass'), H('橉', '목', 'tree name', '木 tree')]),
  S('율', 'yul', 'yool', 'n', 'last', 3, [
    H('栗', '목', 'chestnut', '木 tree'), H('燏', '화', 'firelight', '火 fire'), H('律', '화', 'law, rhythm', '彳 step'), H('汩', '수', 'flowing', '氵 water'), H('潏', '수', 'gushing spring', '氵 water'), H('嵂', '토', 'steep', '山 mountain')]),
  S('온', 'on', 'ohn', 'f', 'both', 2, [
    H('溫', '수', 'warm, gentle', '氵 water'), H('穩', '목', 'calm, steady', '禾 grain'), H('榲', '목', 'tree name', '木 tree'), H('蒀', '목', 'fragrant herb', '艹 grass'),
    H('瑥', '금', 'a jade name', '玉 jade'), H('昷', '화', 'kind, warm', '日 sun'), H('熅', '화', 'gentle warmth', '火 fire')]),
  S('가', 'ga', 'gah', 'f', 'first', 2, [
    H('家', '토', 'home, family', '宀 roof'), H('迦', '토', 'Buddha\'s name syllable', '辶 walk'), H('珂', '금', 'white jade', '玉 jade'), H('珈', '금', 'jade hair ornament', '玉 jade'),
    H('柯', '목', 'branch, axe handle', '木 tree'), H('稼', '목', 'to sow', '禾 grain'), H('葭', '목', 'reed', '艹 grass'), H('嘉', '수', 'fine, praiseworthy', '口 mouth'), H('可', '수', 'possible, right', '口 mouth'), H('暇', '화', 'leisure', '日 sun')]),
  S('나', 'na', 'nah', 'f', 'both', 2, [H('娜', '토', 'graceful', '女 woman'), H('那', '토', 'that; a place name', '阝 town'), H('梛', '목', 'tree name', '木 tree')]),
  S('라', 'ra', 'rah', 'f', 'both', 2, [H('蘿', '목', 'vine, ivy', '艹 grass')]),
  S('리', 'ri', 'ree', 'f', 'both', 2, [
    H('理', '금', 'reason, principle', '玉 jade'), H('利', '금', 'benefit, sharp', '刂 knife'), H('璃', '금', 'glass, lapis', '玉 jade'),
    H('梨', '목', 'pear', '木 tree'), H('莉', '목', 'jasmine', '艹 grass'), H('李', '목', 'plum', '木 tree'), H('里', '토', 'village', '里 village'), H('悧', '화', 'clever', '忄 heart'), H('浬', '수', 'nautical mile', '氵 water'), H('鯉', '수', 'carp', '魚 fish')]),
  S('시', 'si', 'shee', 'n', 'first', 2, [
    H('時', '화', 'time, season', '日 sun'), H('是', '화', 'right, this', '日 sun'), H('恃', '화', 'to rely on', '忄 heart'), H('詩', '금', 'poem', '言 speech'), H('諟', '금', 'correct', '言 speech'),
    H('始', '토', 'beginning', '女 woman'), H('塒', '토', 'roost', '土 earth'), H('柴', '목', 'firewood, brushwood', '木 tree'), H('蒔', '목', 'to plant seedlings', '艹 grass')], 'Shi'),
  S('안', 'an', 'ahn', 'n', 'last', 2, [H('安', '토', 'peace, safe', '宀 roof'), H('岸', '토', 'shore', '山 mountain'), H('婩', '토', 'pretty', '女 woman'), H('晏', '화', 'peaceful, serene', '日 sun'), H('桉', '목', 'eucalyptus', '木 tree')], 'Ahn'),
  S('태', 'tae', 'teh', 'm', 'first', 2, [
    H('泰', '수', 'great, peaceful', '水 water'), H('台', '수', 'platform; star', '口 mouth'), H('邰', '토', 'an ancient state', '阝 town'), H('埭', '토', 'embankment', '土 earth'), H('娧', '토', 'joyful', '女 woman'),
    H('態', '화', 'bearing, manner', '心 heart'), H('珆', '금', 'patterned jade', '玉 jade')]),
  S('성', 'seong', 'sung', 'n', 'both', 3, [
    H('成', '금', 'to achieve', '戈 spear'), H('誠', '금', 'sincerity', '言 speech'), H('珹', '금', 'a jade name', '玉 jade'), H('瑆', '금', 'lustre of jade', '玉 jade'), H('醒', '금', 'awake, aware', '酉 wine jar'),
    H('星', '화', 'star', '日 sun'), H('晟', '화', 'bright, prosperous', '日 sun'), H('性', '화', 'nature, character', '忄 heart'), H('惺', '화', 'awakened', '忄 heart'), H('晠', '화', 'bright', '日 sun'),
    H('城', '토', 'castle, city', '土 earth'), H('宬', '토', 'archive', '宀 roof'), H('娍', '토', 'beautiful', '女 woman')], 'Sung'),
  S('승', 'seung', 'sung', 'n', 'first', 3, [
    H('昇', '화', 'to rise', '日 sun'), H('曻', '화', 'to rise', '日 sun'), H('陞', '토', 'to ascend, promote', '阝 mound'), H('塍', '토', 'field ridge', '土 earth'), H('陹', '토', 'to rise', '阝 mound'),
    H('承', '목', 'to inherit, carry on', '手 hand'), H('繩', '목', 'rope; a rule', '糸 silk')]),
  S('정', 'jeong', 'jung', 'n', 'both', 3, [
    H('正', '토', 'right, upright', '止 stop'), H('定', '토', 'settled, steady', '宀 roof'), H('姃', '토', 'dignified', '女 woman'), H('庭', '토', 'courtyard', '广 shelter'), H('婷', '토', 'graceful', '女 woman'),
    H('貞', '금', 'faithful, chaste', '貝 shell'), H('珽', '금', 'jade sceptre', '玉 jade'), H('珵', '금', 'a jade name', '玉 jade'),
    H('晶', '화', 'crystal, sparkling', '日 sun'), H('炡', '화', 'bright', '火 fire'), H('情', '화', 'feeling, affection', '忄 heart'), H('晸', '화', 'sunrise', '日 sun'),
    H('靜', '목', 'calm, still', '靑 blue-green'), H('靖', '목', 'peaceful', '靑 blue-green'), H('程', '목', 'path, measure', '禾 grain'), H('楨', '목', 'hardwood; pillar', '木 tree'), H('精', '목', 'essence, refined', '米 rice'), H('挺', '목', 'outstanding', '手 hand'),
    H('汀', '수', 'shoreline', '氵 water'), H('淨', '수', 'clean, pure', '氵 water'), H('湞', '수', 'river name', '氵 water')], 'Jung'),
  S('채', 'chae', 'cheh', 'f', 'first', 2, [
    H('埰', '토', 'fief, estate', '土 earth'), H('寀', '토', 'estate', '宀 roof'), H('綵', '목', 'coloured silk', '糸 silk'), H('菜', '목', 'greens', '艹 grass'), H('蔡', '목', 'an ancient state', '艹 grass'), H('棌', '목', 'oak', '木 tree'),
    H('釵', '금', 'hairpin', '金 metal'), H('琗', '금', 'jade lustre', '玉 jade'), H('彩', '화', 'colour, brilliance', '彡 brush strokes')]),
  S('해', 'hae', 'heh', 'n', 'first', 2, [
    H('海', '수', 'sea', '氵 water'), H('澥', '수', 'a sea name', '氵 water'), H('瀣', '수', 'night dew', '氵 water'), H('楷', '목', 'model, standard', '木 tree'),
    H('諧', '금', 'harmony', '言 speech'), H('垓', '토', 'boundary; vast', '土 earth'), H('邂', '토', 'to meet by chance', '辶 walk'), H('晐', '화', 'complete', '日 sun')]),
  S('혜', 'hye', 'hyeh', 'f', 'both', 3, [
    H('惠', '화', 'grace, kindness', '心 heart'), H('慧', '화', 'wisdom', '心 heart'), H('暳', '화', 'twinkling star', '日 sun'), H('憓', '화', 'loving', '忄 heart'),
    H('蕙', '목', 'orchid', '艹 grass'), H('譓', '금', 'wise', '言 speech'), H('譿', '금', 'clever', '言 speech'), H('嵇', '토', 'mountain name', '山 mountain'), H('寭', '토', 'bright', '宀 roof'), H('潓', '수', 'river name', '氵 water')]),
  S('희', 'hui', 'hee', 'n', 'both', 3, [
    H('姬', '토', 'lady, noblewoman', '女 woman'), H('嬉', '토', 'joyful play', '女 woman'), H('熙', '화', 'bright, glorious', '灬 fire dots'), H('曦', '화', 'sunlight', '日 sun'), H('熹', '화', 'bright dawn', '灬 fire dots'),
    H('晞', '화', 'daybreak', '日 sun'), H('憙', '화', 'joy', '心 heart'), H('喜', '수', 'joy, delight', '口 mouth'), H('凞', '수', 'shining', '冫 ice'), H('希', '목', 'hope, rare', '巾 cloth'), H('稀', '목', 'rare, precious', '禾 grain')], 'Hee'),
  S('훈', 'hun', 'hoon', 'm', 'last', 3, [
    H('訓', '금', 'teaching', '言 speech'), H('鑂', '금', 'golden colour', '金 metal'), H('薰', '목', 'fragrant herb', '艹 grass'), H('纁', '목', 'sunset pink silk', '糸 silk'),
    H('熏', '화', 'fragrant smoke', '灬 fire dots'), H('焄', '화', 'fragrance', '灬 fire dots'), H('燻', '화', 'to smoke, to warm', '火 fire'), H('曛', '화', 'dusk light', '日 sun'), H('壎', '토', 'clay flute', '土 earth'), H('塤', '토', 'clay flute', '土 earth')], 'Hoon'),
  S('환', 'hwan', 'hwahn', 'm', 'last', 3, [
    H('煥', '화', 'shining, brilliant', '火 fire'), H('晥', '화', 'bright', '日 sun'), H('桓', '목', 'pillar; mighty', '木 tree'), H('紈', '목', 'fine white silk', '糸 silk'),
    H('渙', '수', 'to dissolve, flow', '氵 water'), H('澴', '수', 'river name', '氵 water'), H('環', '금', 'ring, jade ring', '玉 jade'), H('瓛', '금', 'jade sceptre', '玉 jade'), H('皖', '금', 'morning star', '白 white'),
    H('還', '토', 'to return', '辶 walk'), H('圜', '토', 'round, heaven', '囗 enclosure'), H('寰', '토', 'the whole world', '宀 roof')]),
  S('규', 'gyu', 'gyoo', 'm', 'both', 2, [
    H('圭', '토', 'jade tablet; upright', '土 earth'), H('逵', '토', 'broad road', '辶 walk'), H('巋', '토', 'towering', '山 mountain'), H('珪', '금', 'jade tablet', '玉 jade'),
    H('葵', '목', 'sunflower, hollyhock', '艹 grass'), H('槻', '목', 'zelkova', '木 tree'), H('揆', '목', 'to measure, plan', '手 hand'), H('奎', '목', 'a star mansion; scholar', '大 big'),
    H('煃', '화', 'firelight', '火 fire'), H('湀', '수', 'welling spring', '氵 water')], 'Kyu'),
  S('경', 'gyeong', 'kyung', 'n', 'both', 3, [
    H('景', '화', 'scenery; bright', '日 sun'), H('慶', '화', 'celebration', '心 heart'), H('炅', '화', 'radiant', '火 fire'), H('暻', '화', 'bright', '日 sun'), H('炯', '화', 'clear, bright', '火 fire'), H('憬', '화', 'to awaken, aspire', '忄 heart'),
    H('璟', '금', 'lustre of jade', '玉 jade'), H('瓊', '금', 'fine jade', '玉 jade'), H('鏡', '금', 'mirror', '金 metal'), H('庚', '금', 'the seventh stem', '庚 (Metal stem)'), H('璥', '금', 'a jade name', '玉 jade'),
    H('耕', '목', 'to plough', '耒 plough'), H('經', '목', 'classic; to pass through', '糸 silk'), H('檠', '목', 'lamp stand', '木 tree'),
    H('涇', '수', 'to flow through', '氵 water'), H('澃', '수', 'clear water', '氵 water'), H('境', '토', 'realm, boundary', '土 earth'), H('逕', '토', 'path', '辶 walk'), H('坰', '토', 'open country', '土 earth')], 'Kyung'),
  S('건', 'geon', 'gun', 'm', 'both', 2, [
    H('建', '토', 'to build', '廴 stride'), H('楗', '목', 'door bar; key', '木 tree'), H('乾', '목', 'heaven; creative', '乙 second stem'), H('鍵', '금', 'key', '金 metal'),
    H('湕', '수', 'river name', '氵 water'), H('騫', '화', 'to soar', '馬 horse')], 'Gun'),
  S('결', 'gyeol', 'gyul', 'n', 'last', 1, [H('潔', '수', 'clean, pure', '氵 water'), H('決', '수', 'decisive', '氵 water'), H('結', '목', 'to bind, bear fruit', '糸 silk'), H('絜', '목', 'pure', '糸 silk'), H('玦', '금', 'jade ring', '玉 jade')]),
  S('강', 'gang', 'kang', 'm', 'first', 2, [
    H('江', '수', 'great river', '氵 water'), H('康', '토', 'health, ease', '广 shelter'), H('岡', '토', 'ridge', '山 mountain'), H('崗', '토', 'hill', '山 mountain'), H('疆', '토', 'territory', '田 field'), H('堈', '토', 'hillock', '土 earth'),
    H('剛', '금', 'firm, strong', '刂 knife'), H('鋼', '금', 'steel', '金 metal'), H('玒', '금', 'a jade name', '玉 jade'),
    H('綱', '목', 'mainstay, principle', '糸 silk'), H('杠', '목', 'flagpole', '木 tree'), H('橿', '목', 'evergreen oak', '木 tree'), H('強', '목', 'strong', '弓 bow'), H('彊', '목', 'strong', '弓 bow'), H('慷', '화', 'generous spirit', '忄 heart')], 'Kang'),
  S('원', 'won', 'won', 'n', 'both', 3, [
    H('原', '토', 'origin, plain', '厂 cliff'), H('遠', '토', 'far-reaching', '辶 walk'), H('園', '토', 'garden', '囗 enclosure'), H('圓', '토', 'round, complete', '囗 enclosure'), H('媛', '토', 'beauty, lady', '女 woman'), H('垣', '토', 'wall', '土 earth'), H('嫄', '토', 'a legendary mother', '女 woman'),
    H('源', '수', 'source, spring', '氵 water'), H('沅', '수', 'river name', '氵 water'), H('洹', '수', 'river name', '氵 water'), H('湲', '수', 'flowing water', '氵 water'),
    H('苑', '목', 'park, garden', '艹 grass'), H('楥', '목', 'tree name', '木 tree'), H('援', '목', 'to help', '手 hand'), H('薗', '목', 'garden', '艹 grass'), H('瑗', '금', 'large jade ring', '玉 jade'), H('愿', '화', 'sincere', '心 heart')]),
  S('석', 'seok', 'suk', 'm', 'both', 2, [
    H('錫', '금', 'tin; to bestow', '金 metal'), H('鉐', '금', 'brass', '金 metal'), H('皙', '금', 'fair, clear', '白 white'), H('晳', '화', 'bright', '日 sun'), H('晰', '화', 'clear, distinct', '日 sun'), H('昔', '화', 'old days', '日 sun'),
    H('析', '목', 'to analyse', '木 tree'), H('席', '목', 'seat, mat', '巾 cloth'), H('汐', '수', 'evening tide', '氵 water'), H('坧', '토', 'foundation', '土 earth')], 'Suk'),
  S('철', 'cheol', 'chul', 'm', 'both', 2, [
    H('澈', '수', 'clear, limpid', '氵 water'), H('哲', '수', 'wise, philosophical', '口 mouth'), H('喆', '수', 'wise', '口 mouth'), H('鐵', '금', 'iron', '金 metal'), H('鉄', '금', 'iron', '金 metal'), H('銕', '금', 'iron', '金 metal'),
    H('悊', '화', 'wise', '心 heart'), H('晢', '화', 'bright', '日 sun'), H('埑', '토', 'bright', '土 earth')], 'Chul'),
  S('용', 'yong', 'yong', 'm', 'both', 2, [
    H('容', '토', 'countenance; to embrace', '宀 roof'), H('埇', '토', 'road', '土 earth'), H('墉', '토', 'city wall', '土 earth'), H('庸', '토', 'steady, ordinary', '广 shelter'), H('龍', '토', 'dragon', '龍 dragon'),
    H('溶', '수', 'to dissolve, flowing', '氵 water'), H('湧', '수', 'to gush', '氵 water'), H('涌', '수', 'to well up', '氵 water'), H('鎔', '금', 'to smelt, mould', '金 metal'), H('瑢', '금', 'tinkling jade', '玉 jade'), H('鏞', '금', 'great bell', '金 metal'),
    H('榕', '목', 'banyan', '木 tree'), H('蓉', '목', 'lotus, hibiscus', '艹 grass'), H('熔', '화', 'to melt, fuse', '火 fire')]),
  S('혁', 'hyeok', 'hyuk', 'm', 'both', 2, [H('赫', '화', 'brilliant, glorious', '赤 red'), H('爀', '화', 'fiery red', '火 fire'), H('赩', '화', 'deep red', '赤 red'), H('焃', '화', 'red, bright', '火 fire'), H('革', '금', 'leather; reform', '革 leather'), H('奕', '목', 'great, radiant', '大 big')], 'Hyuk'),
  S('찬', 'chan', 'chahn', 'm', 'both', 2, [
    H('燦', '화', 'brilliant', '火 fire'), H('璨', '금', 'lustrous gem', '玉 jade'), H('瓚', '금', 'jade ladle', '玉 jade'), H('讚', '금', 'praise', '言 speech'), H('贊', '금', 'to assist, approve', '貝 shell'),
    H('粲', '목', 'bright, polished', '米 rice'), H('纘', '목', 'to continue', '糸 silk'), H('撰', '목', 'to compose', '手 hand'), H('澯', '수', 'clear water', '氵 water'), H('巑', '토', 'lofty peak', '山 mountain')]),
  S('한', 'han', 'hahn', 'n', 'both', 2, [
    H('漢', '수', 'the Han river; grand', '氵 water'), H('瀚', '수', 'vast', '氵 water'), H('澖', '수', 'wide water', '氵 water'), H('翰', '화', 'writing brush; feather', '羽 feather'), H('憪', '화', 'generous', '忄 heart'),
    H('閑', '목', 'leisurely, elegant', '門 gate'), H('閒', '목', 'calm', '門 gate'), H('橌', '목', 'great tree', '木 tree'), H('邯', '토', 'a place name', '阝 town'), H('嫺', '토', 'refined, elegant', '女 woman')]),
  S('범', 'beom', 'bum', 'm', 'both', 2, [
    H('範', '목', 'model, pattern', '竹 bamboo'), H('帆', '목', 'sail', '巾 cloth'), H('梵', '목', 'Sanskrit; pure', '木 tree'), H('范', '목', 'a surname; grass', '艹 grass'), H('凡', '목', 'all, ordinary', '几 table'), H('笵', '목', 'rule', '竹 bamboo'),
    H('汎', '수', 'broad, floating', '氵 water'), H('泛', '수', 'to float widely', '氵 water'), H('渢', '수', 'sound of water', '氵 water')], 'Bum'),
  S('빈', 'bin', 'bin', 'n', 'last', 3, [
    H('彬', '화', 'refined, cultivated', '彡 brush strokes'), H('賓', '금', 'honoured guest', '貝 shell'), H('玭', '금', 'pearl', '玉 jade'), H('鑌', '금', 'fine steel', '金 metal'), H('贇', '금', 'beautiful, refined', '貝 shell'),
    H('嬪', '토', 'court lady', '女 woman'), H('邠', '토', 'an ancient state', '阝 town'), H('娦', '토', 'pretty', '女 woman'), H('濱', '수', 'shore', '氵 water'), H('霦', '수', 'jade lustre', '雨 rain'),
    H('檳', '목', 'betel palm', '木 tree'), H('繽', '목', 'colourful abundance', '糸 silk'), H('斌', '목', 'refined and strong', '文 pattern')]),
  S('미', 'mi', 'mee', 'f', 'both', 2, [
    H('美', '토', 'beautiful', '羊 sheep'), H('嵄', '토', 'mountain name', '山 mountain'), H('媄', '토', 'pretty', '女 woman'), H('微', '화', 'subtle, delicate', '彳 step'), H('煝', '화', 'shining', '火 fire'),
    H('渼', '수', 'ripples', '氵 water'), H('湄', '수', 'waterside', '氵 water'), H('瀰', '수', 'wide water', '氵 water'), H('薇', '목', 'rose', '艹 grass'), H('眉', '목', 'eyebrow', '目 eye'), H('彌', '목', 'wide, lasting', '弓 bow'), H('瑂', '금', 'jade-like stone', '玉 jade')]),
  S('주', 'ju', 'joo', 'n', 'both', 2, [
    H('珠', '금', 'pearl', '玉 jade'), H('珘', '금', 'a jade name', '玉 jade'), H('宙', '토', 'cosmos, sky', '宀 roof'), H('姝', '토', 'pretty', '女 woman'), H('婤', '토', 'pretty', '女 woman'),
    H('柱', '목', 'pillar', '木 tree'), H('株', '목', 'tree trunk, stock', '木 tree'), H('朱', '목', 'vermilion red', '木 tree'), H('奏', '목', 'to play music, present', '大 big'), H('紬', '목', 'pongee silk', '糸 silk'),
    H('洲', '수', 'continent, islet', '氵 water'), H('澍', '수', 'timely rain', '氵 water'), H('湊', '수', 'to gather', '氵 water'), H('周', '수', 'complete, all round', '口 mouth'), H('州', '수', 'province', '巛 river'),
    H('晝', '화', 'daytime', '日 sun'), H('炷', '화', 'wick, to burn incense', '火 fire')], 'Joo'),
  S('이', 'i', 'ee', 'f', 'both', 2, [
    H('怡', '화', 'joy, harmony', '忄 heart'), H('燡', '화', 'shining', '火 fire'), H('易', '화', 'easy; change', '日 sun'), H('珥', '금', 'jade earring', '玉 jade'), H('貽', '금', 'to bestow', '貝 shell'), H('珆', '금', 'jade-like stone', '玉 jade'),
    H('荑', '목', 'young shoots', '艹 grass'), H('苡', '목', 'Job\'s tears (a grain)', '艹 grass'), H('洢', '수', 'river name', '氵 water'), H('廙', '토', 'respectful', '广 shelter'), H('邇', '토', 'near, close', '辶 walk')], 'Yi'),
  S('인', 'in', 'een', 'n', 'both', 2, [
    H('寅', '토', 'the Tiger branch; respectful', '宀 roof'), H('因', '토', 'cause, reason', '囗 enclosure'), H('引', '목', 'to lead, to draw', '弓 bow'), H('茵', '목', 'soft mat of grass', '艹 grass'), H('絪', '목', 'vital energy', '糸 silk'),
    H('認', '금', 'to recognise', '言 speech'), H('璌', '금', 'a jade name', '玉 jade'), H('諲', '금', 'respectful', '言 speech'), H('忈', '화', 'benevolent', '心 heart')]),
  S('화', 'hwa', 'hwah', 'f', 'both', 2, [
    H('花', '목', 'flower', '艹 grass'), H('華', '목', 'splendid, flourishing', '艹 grass'), H('禾', '목', 'grain', '禾 grain'), H('樺', '목', 'birch', '木 tree'), H('和', '수', 'harmony', '口 mouth'), H('澕', '수', 'deep water', '氵 water'),
    H('嬅', '토', 'beautiful', '女 woman'), H('嫿', '토', 'graceful', '女 woman'), H('火', '화', 'fire', '火 fire'), H('驊', '화', 'fine horse', '馬 horse')]),
  S('향', 'hyang', 'hyahng', 'f', 'last', 1, [H('香', '목', 'fragrance', '香 fragrance (grain)'), H('鄕', '토', 'hometown', '阝 town'), H('姠', '토', 'a woman\'s name', '女 woman'), H('珦', '금', 'a jade name', '玉 jade'), H('向', '수', 'to face toward', '口 mouth'), H('晑', '화', 'bright', '日 sun')]),
  S('선', 'seon', 'sun', 'n', 'both', 3, [
    H('宣', '토', 'to proclaim; bright', '宀 roof'), H('選', '토', 'chosen', '辶 walk'), H('嬋', '토', 'graceful', '女 woman'), H('嫙', '토', 'pretty', '女 woman'), H('墡', '토', 'white clay', '土 earth'),
    H('璇', '금', 'fine jade; a star', '玉 jade'), H('瑄', '금', 'ceremonial jade', '玉 jade'), H('琁', '금', 'fine jade', '玉 jade'), H('銑', '금', 'polished metal', '金 metal'), H('詵', '금', 'many, abundant', '言 speech'), H('珗', '금', 'jade-like stone', '玉 jade'),
    H('善', '수', 'good, kind', '口 mouth'), H('鮮', '수', 'fresh, bright', '魚 fish'), H('渲', '수', 'wash of ink', '氵 water'), H('線', '목', 'line, thread', '糸 silk'), H('愃', '화', 'generous', '忄 heart')], 'Sun'),
  S('슬', 'seul', 'seul', 'f', 'both', 2, [H('瑟', '금', 'zither', '玉 jade'), H('璱', '금', 'blue-green gem', '玉 jade')]),
  S('오', 'o', 'oh', 'm', 'last', 2, [
    H('悟', '화', 'enlightenment', '忄 heart'), H('晤', '화', 'bright, clear', '日 sun'), H('旿', '화', 'bright', '日 sun'), H('梧', '목', 'paulownia', '木 tree'), H('奧', '목', 'profound', '大 big'),
    H('澳', '수', 'deep bay', '氵 water'), H('吾', '수', 'I, myself', '口 mouth'), H('塢', '토', 'bank, dock', '土 earth'), H('娛', '토', 'joy', '女 woman'), H('珸', '금', 'jade-like stone', '玉 jade')], 'Oh'),
  S('양', 'yang', 'yahng', 'n', 'last', 1, [
    H('陽', '토', 'sun, yang', '阝 mound'), H('壤', '토', 'soil', '土 earth'), H('洋', '수', 'ocean', '氵 water'), H('瀁', '수', 'shape of water', '氵 water'), H('養', '수', 'to nurture', '食 food'),
    H('楊', '목', 'willow', '木 tree'), H('揚', '목', 'to raise', '手 hand'), H('暘', '화', 'sunrise', '日 sun'), H('昜', '화', 'sunshine', '日 sun'), H('瑒', '금', 'jade cup', '玉 jade')]),
  S('훤', 'hwon', 'hwon', 'f', 'last', 1, [H('萱', '목', 'daylily (forget-worry)', '艹 grass'), H('蘐', '목', 'daylily', '艹 grass'), H('暄', '화', 'warm sunshine', '日 sun'), H('煊', '화', 'warm, bright', '火 fire'), H('烜', '화', 'bright', '火 fire'), H('晅', '화', 'bright', '日 sun')]),
  S('담', 'dam', 'dahm', 'n', 'last', 2, [
    H('潭', '수', 'deep pool', '氵 water'), H('淡', '수', 'clear, mild', '氵 water'), H('澹', '수', 'calm, tranquil', '氵 water'), H('湛', '수', 'deep, clear', '氵 water'),
    H('談', '금', 'conversation', '言 speech'), H('譚', '금', 'story', '言 speech'), H('憺', '화', 'peaceful', '忄 heart'), H('郯', '토', 'an ancient state', '阝 town')]),
  S('로', 'ro', 'roh', 'n', 'both', 2, [
    H('路', '토', 'road', '足 foot'), H('嶗', '토', 'mountain name', '山 mountain'), H('露', '수', 'dew', '雨 rain'), H('潞', '수', 'river name', '氵 water'), H('瀘', '수', 'river name', '氵 water'),
    H('蘆', '목', 'reed', '艹 grass'), H('蕗', '목', 'liquorice', '艹 grass'), H('爐', '화', 'hearth', '火 fire'), H('璐', '금', 'beautiful jade', '玉 jade')]),
  S('겸', 'gyeom', 'gyum', 'm', 'last', 2, [H('謙', '금', 'humility', '言 speech'), H('蒹', '목', 'reed', '艹 grass'), H('岒', '토', 'mountain name', '山 mountain')]),
  S('람', 'ram', 'rahm', 'n', 'last', 2, [H('藍', '목', 'indigo', '艹 grass'), H('嵐', '토', 'mountain mist', '山 mountain'), H('灆', '수', 'clear water', '氵 water')]),
  S('후', 'hu', 'hoo', 'n', 'last', 2, [H('厚', '토', 'generous, thick', '厂 cliff'), H('垕', '토', 'generous', '土 earth'), H('逅', '토', 'to meet', '辶 walk'), H('煦', '화', 'warm, kind', '灬 fire dots'), H('珝', '금', 'a jade name', '玉 jade')]),
  S('랑', 'rang', 'rahng', 'n', 'last', 2, [H('琅', '금', 'a gem; clear ringing', '玉 jade'), H('瑯', '금', 'a gem', '玉 jade'), H('郎', '토', 'young man', '阝 town'), H('娘', '토', 'young lady', '女 woman'), H('烺', '화', 'bright', '火 fire'), H('浪', '수', 'wave', '氵 water')])
];

/* pairings that spell an everyday Korean word with an unfortunate meaning (blind person, receipt, towel, escape …) */
export const BLOCK = ['소경', '소승', '소환', '소결', '하수', '하인', '오수', '오해', '수인', '수로', '수한', '수건', '미수', '미로', '미결', '우유', '우환', '재수', '재미', '재화', '재정', '재건', '재결',
  '성인', '성미', '성경', '해수', '해경', '해결', '유해', '유서', '유가', '유훈', '원로', '환수', '강수', '강우', '강진', '안주', '도안', '도로', '도주', '도수', '도미', '도인', '도용', '도선', '도랑', '도해',
  '가수', '가정', '가담', '가로', '이유', '이주', '이하', '이후', '이율', '이건', '인건', '예수', '예후', '예정', '예결', '진로', '진담', '영수', '영화', '영양', '영결', '정오', '정규', '정경', '화환',
  '시정', '시주', '시수', '시경', '시승', '시선', '시혜', '시인', '서로', '용건', '선결', '수술', '대수', '정수리', '주수', '주유', '주도', '주인', '주해', '주범', '주정', '주화', '진수성', '희로', '경로', '경유', '경화', '경성', '경진', '경주', '경수', '경찰',
  '한수', '한주', '한화', '한시', '한랑', '범인', '범주', '범위', '규수', '규정', '규율', '규환', '건성', '건수', '건물', '건조', '건강', '철수', '철화', '석수', '석유', '석화', '용수', '용화', '용인', '혁명', '찬성', '찬수', '찬양', '빈수', '빈혈', '빈곤',
  '온수', '온유', '온화', '온도', '하지', '소지', '승율', '승인', '승수', '승용', '승강', '승선', '지수', '지주', '지하', '지연', '지진', '지인', '지원', '진주', '민주', '주인', '유인', '유물', '유수', '은인', '수유', '수영', '결선', '람수', '후수', '후환', '랑수', '로수', '담수', '담화', '겸수', '향수', '향유', '향미', '양수', '양미', '양화', '양인', '오미', '오인', '오한', '오용', '오진', '오랑', '나체', '라면', '리수', '아수', '아미', '아유', '아정', '아용', '아진', '아환', '아담'];

/* sanity checks: unique syllables, valid fields, every hanja assigned once per syllable */
const EL = new Set(['목', '화', '토', '금', '수']);
const seen = new Set();
for (const s of SYLLABLES) {
  if (seen.has(s.s)) throw new Error('duplicate syllable ' + s.s);
  seen.add(s.s);
  if (!['f', 'm', 'n'].includes(s.g) || !['first', 'last', 'both'].includes(s.pos) || !(s.pop >= 1 && s.pop <= 3)) throw new Error('bad fields ' + s.s);
  const hs = new Set();
  for (const h of s.hj) {
    if (!EL.has(h.el) || !h.m || !h.r || h.h.length !== 1) throw new Error('bad hanja ' + s.s + ' ' + h.h);
    if (hs.has(h.h)) throw new Error('duplicate hanja ' + s.s + ' ' + h.h);
    hs.add(h.h);
  }
}
