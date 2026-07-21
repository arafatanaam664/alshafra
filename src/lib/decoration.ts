// Name decoration engine — generates multiple ornamented variants for a given name.
// Supports Arabic, English, PUBG, Free Fire, and French styles.

export interface DecorationStyle {
  id: string;
  label: string;
  transform: (name: string) => string;
}

// --- Arabic decoration styles ----------------------------------------------

const ARABIC_WRAPPERS: { id: string; label: string; left: string; right: string }[] = [
  { id: 'ar_wings', label: 'زخرفة بالأجنحة', left: '★', right: '★' },
  { id: 'ar_crown', label: 'زخرفة بالتاج', left: '♛', right: '♛' },
  { id: 'ar_flower', label: 'زخرفة بالورود', left: '✿', right: '✿' },
  { id: 'ar_heart', label: 'زخرفة بالقلوب', left: '♥', right: '♥' },
  { id: 'ar_star', label: 'زخرفة بالنجوم', left: '✦', right: '✦' },
  { id: 'ar_diamond', label: 'زخرفة بالألماس', left: '◈', right: '◈' },
  { id: 'ar_brackets', label: 'زخرفة بالأقواس', left: '【', right: '】' },
  { id: 'ar_ornate', label: 'زخرفة فاخرة', left: '༺', right: '༻' },
  { id: 'ar_swords', label: 'زخرفة بالسيوف', left: '⚔', right: '⚔' },
  { id: 'ar_fire', label: 'زخرفة بالنار', left: '🔥', right: '🔥' },
];

// Arabic letter substitution map — ornate Unicode equivalents
const ARABIC_LETTER_MAP: Record<string, string> = {
  ا: 'ﺍ',
  ب: 'ﺏ',
  ت: 'ﺕ',
  ث: 'ﺙ',
  ج: 'ﺝ',
  ح: 'ﺡ',
  خ: 'ﺥ',
  د: 'ﺩ',
  ذ: 'ﺫ',
  ر: 'ﺭ',
  ز: 'ﺯ',
  س: 'ﺱ',
  ش: 'ﺵ',
  ص: 'ﺹ',
  ض: 'ﺽ',
  ط: 'ﻁ',
  ظ: 'ﻅ',
  ع: 'ﻉ',
  غ: 'ﻍ',
  ف: 'ﻑ',
  ق: 'ﻕ',
  ك: 'ﻙ',
  ل: 'ﻝ',
  م: 'ﻡ',
  ن: 'ﻥ',
  ه: 'ﻩ',
  و: 'ﻭ',
  ي: 'ﻱ',
  ة: 'ﺓ',
  ى: 'ﯨ',
  ء: 'ﺀ',
  ؤ: 'ﺅ',
  ئ: 'ﺉ',
};

function applyArabicLetterMap(name: string): string {
  let out = '';
  for (const ch of name) {
    out += ARABIC_LETTER_MAP[ch] ?? ch;
  }
  return out;
}

export const ARABIC_STYLES: DecorationStyle[] = [
  ...ARABIC_WRAPPERS.map((w) => ({
    id: w.id,
    label: w.label,
    transform: (name: string) => `${w.left} ${name} ${w.right}`,
  })),
  {
    id: 'ar_ornament_letters',
    label: 'زخرفة الحروف العربية',
    transform: (name: string) => applyArabicLetterMap(name),
  },
  {
    id: 'ar_ornament_wrapped',
    label: 'زخرفة الحروف مع أجنحة',
    transform: (name: string) => `★ ${applyArabicLetterMap(name)} ★`,
  },
  {
    id: 'ar_dotted',
    label: 'زخرفة بالتنقيط',
    transform: (name: string) => `•°•°• ${name} •°•°•`,
  },
  {
    id: 'ar_reverse',
    label: 'زخرفة معكوسة',
    transform: (name: string) => `↬ ${name} ↫`,
  },
  {
    id: 'ar_elegant',
    label: 'زخرفة أنيقة',
    transform: (name: string) => `❀ ${name} ❀`,
  },
  {
    id: 'ar_royal',
    label: 'زخرفة ملكية',
    transform: (name: string) => `♔ ${name} ♔`,
  },
  {
    id: 'ar_mystic',
    label: 'زخرفة غامضة',
    transform: (name: string) => `✧ ${name} ✧`,
  },
];

// --- English decoration styles ---------------------------------------------

// Fancy Unicode letter map for English (Mathematical Alphanumeric Symbols)
const ENGLISH_LETTER_MAP: Record<string, string> = {
  a: '𝓪', b: '𝓫', c: '𝓬', d: '𝓭', e: '𝓮', f: '𝓯', g: '𝓰', h: '𝓱', i: '𝓲',
  j: '𝓳', k: '𝓴', l: '𝓵', m: '𝓶', n: '𝓷', o: '𝓸', p: '𝓹', q: '𝓺', r: '𝓻',
  s: '𝓼', t: '𝓽', u: '𝓾', v: '𝓿', w: '𝔀', x: '𝔁', y: '𝔂', z: '𝔃',
  A: '𝓐', B: '𝓑', C: '𝓒', D: '𝓓', E: '𝓔', F: '𝓕', G: '𝓖', H: '𝓗', I: '𝓘',
  J: '𝓙', K: '𝓚', L: '𝓛', M: '𝓜', N: '𝓝', O: '𝓞', P: '𝓟', Q: '𝓠', R: '𝓡',
  S: '𝓢', T: '𝓣', U: '𝓤', V: '𝓥', W: '𝓦', X: '𝓧', Y: '𝓨', Z: '𝓩',
};

const ENGLISH_BOLD_MAP: Record<string, string> = {
  a: '𝐚', b: '𝐛', c: '𝐜', d: '𝐝', e: '𝐞', f: '𝐟', g: '𝐠', h: '𝐡', i: '𝐢',
  j: '𝐣', k: '𝐤', l: '𝐥', m: '𝐦', n: '𝐧', o: '𝐨', p: '𝐩', q: '𝐪', r: '𝐫',
  s: '𝐬', t: '𝐭', u: '𝐮', v: '𝐯', w: '𝐰', x: '𝐱', y: '𝐲', z: '𝐳',
  A: '𝐀', B: '𝐁', C: '𝐂', D: '𝐃', E: '𝐄', F: '𝐅', G: '𝐆', H: '𝐇', I: '𝐈',
  J: '𝐉', K: '𝐊', L: '𝐋', M: '𝐌', N: '𝐍', O: '𝐎', P: '𝐏', Q: '𝐐', R: '𝐑',
  S: '𝐒', T: '𝐓', U: '𝐔', V: '𝐕', W: '𝐖', X: '𝐗', Y: '𝐘', Z: '𝐙',
};

const ENGLISH_ITALIC_MAP: Record<string, string> = {
  a: '𝘢', b: '𝘣', c: '𝘤', d: '𝘥', e: '𝘦', f: '𝘧', g: '𝘨', h: '𝘩', i: '𝘪',
  j: '𝘫', k: '𝘬', l: '𝘭', m: '𝘮', n: '𝘯', o: '𝘰', p: '𝘱', q: '𝘲', r: '𝘳',
  s: '𝘴', t: '𝘵', u: '𝘶', v: '𝘷', w: '𝘸', x: '𝘹', y: '𝘺', z: '𝘻',
  A: '𝘈', B: '𝘉', C: '𝘊', D: '𝘋', E: '𝘌', F: '𝘍', G: '𝘎', H: '𝘏', I: '𝘐',
  J: '𝘑', K: '𝘒', L: '𝘓', M: '𝘔', N: '𝘕', O: '𝘖', P: '𝘗', Q: '𝘘', R: '𝘙',
  S: '𝘚', T: '𝘛', U: '𝘜', V: '𝘝', W: '𝘞', X: '𝘟', Y: '𝘠', Z: '𝘡',
};

const ENGLISH_MONOSPACE_MAP: Record<string, string> = {
  a: '𝚊', b: '𝚋', c: '𝚌', d: '𝚍', e: '𝚎', f: '𝚏', g: '𝚐', h: '𝚑', i: '𝚒',
  j: '𝚓', k: '𝚔', l: '𝚕', m: '𝚖', n: '𝚗', o: '𝚘', p: '𝚙', q: '𝚚', r: '𝚛',
  s: '𝚜', t: '𝚝', u: '𝚞', v: '𝚟', w: '𝚠', x: '𝚡', y: '𝚢', z: '𝚣',
  A: '𝙰', B: '𝙱', C: '𝙲', D: '𝙳', E: '𝙴', F: '𝙵', G: '𝙶', H: '𝙷', I: '𝙸',
  J: '𝙹', K: '𝙺', L: '𝙻', M: '𝙼', N: '𝙽', O: '𝙾', P: '𝙿', Q: '𝚀', R: '𝚁',
  S: '𝚂', T: '𝚃', U: '𝚄', V: '𝚅', W: '𝚆', X: '𝚇', Y: '𝚈', Z: '𝚉',
};

const ENGLISH_DOUBLE_MAP: Record<string, string> = {
  a: '𝕒', b: '𝕓', c: '𝕔', d: '𝕕', e: '𝕖', f: '𝕗', g: '𝕘', h: '𝕙', i: '𝕚',
  j: '𝕛', k: '𝕜', l: '𝕝', m: '𝕞', n: '𝕟', o: '𝕠', p: '𝕡', q: '𝕢', r: '𝕣',
  s: '𝕤', t: '𝕥', u: '𝕦', v: '𝕧', w: '𝕨', x: '𝕩', y: '𝕪', z: '𝕫',
  A: '𝔸', B: '𝔹', C: 'ℂ', D: '𝔻', E: '𝔼', F: '𝔽', G: '𝔾', H: 'ℍ', I: '𝕀',
  J: '𝕁', K: '𝕂', L: '𝕃', M: '𝕄', N: 'ℕ', O: '𝕆', P: 'ℙ', Q: 'ℚ', R: 'ℝ',
  S: '𝕊', T: '𝕋', U: '𝕌', V: '𝕍', W: '𝕎', X: '𝕏', Y: '𝕐', Z: 'ℤ',
};

const ENGLISH_CIRCLE_MAP: Record<string, string> = {
  a: 'ⓐ', b: 'ⓑ', c: 'ⓒ', d: 'ⓓ', e: 'ⓔ', f: 'ⓕ', g: 'ⓖ', h: 'ⓗ', i: 'ⓘ',
  j: 'ⓙ', k: 'ⓚ', l: 'ⓛ', m: 'ⓜ', n: 'ⓝ', o: 'ⓞ', p: 'ⓟ', q: 'ⓠ', r: 'ⓡ',
  s: 'ⓢ', t: 'ⓣ', u: 'ⓤ', v: 'ⓥ', w: 'ⓦ', x: 'ⓧ', y: 'ⓨ', z: 'ⓩ',
  A: 'Ⓐ', B: 'Ⓑ', C: 'Ⓒ', D: 'Ⓓ', E: 'Ⓔ', F: 'Ⓕ', G: 'Ⓖ', H: 'Ⓗ', I: 'Ⓘ',
  J: 'Ⓙ', K: 'Ⓚ', L: 'Ⓛ', M: 'Ⓜ', N: 'Ⓝ', O: 'Ⓞ', P: 'Ⓟ', Q: 'Ⓠ', R: 'Ⓡ',
  S: 'Ⓢ', T: 'Ⓣ', U: 'Ⓤ', V: 'Ⓥ', W: 'Ⓦ', X: 'Ⓧ', Y: 'Ⓨ', Z: 'Ⓩ',
};

function applyMap(name: string, map: Record<string, string>): string {
  let out = '';
  for (const ch of name) {
    out += map[ch] ?? ch;
  }
  return out;
}

export const ENGLISH_STYLES: DecorationStyle[] = [
  { id: 'en_script', label: 'خط أنيق (Script)', transform: (n) => applyMap(n, ENGLISH_LETTER_MAP) },
  { id: 'en_bold', label: 'خط عريض (Bold)', transform: (n) => applyMap(n, ENGLISH_BOLD_MAP) },
  { id: 'en_italic', label: 'خط مائل (Italic)', transform: (n) => applyMap(n, ENGLISH_ITALIC_MAP) },
  { id: 'en_mono', label: 'خط أحادي (Monospace)', transform: (n) => applyMap(n, ENGLISH_MONOSPACE_MAP) },
  { id: 'en_double', label: 'خط مزدوج (Double)', transform: (n) => applyMap(n, ENGLISH_DOUBLE_MAP) },
  { id: 'en_circle', label: 'خط دائري (Circle)', transform: (n) => applyMap(n, ENGLISH_CIRCLE_MAP) },
  { id: 'en_wings', label: 'بالأجنحة', transform: (n) => `✰ ${n} ✰` },
  { id: 'en_star', label: 'بالنجوم', transform: (n) => `✦ ${n} ✦` },
  { id: 'en_crown', label: 'بالتاج', transform: (n) => `♛ ${n} ♛` },
  { id: 'en_heart', label: 'بالقلوب', transform: (n) => `♥ ${n} ♥` },
  { id: 'en_flower', label: 'بالورود', transform: (n) => `✿ ${n} ✿` },
  { id: 'en_ornate', label: 'فاخر', transform: (n) => `༺ ${n} ༻` },
  { id: 'en_fire', label: 'بالنار', transform: (n) => `🔥 ${n} 🔥` },
  { id: 'en_swords', label: 'بالسيوف', transform: (n) => `⚔ ${n} ⚔` },
  { id: 'en_script_wings', label: 'خط أنيق مع أجنحة', transform: (n) => `✰ ${applyMap(n, ENGLISH_LETTER_MAP)} ✰` },
  { id: 'en_bold_star', label: 'خط عريض مع نجوم', transform: (n) => `✦ ${applyMap(n, ENGLISH_BOLD_MAP)} ✦` },
];

// --- PUBG decoration styles -------------------------------------------------

const PUBG_SYMBOLS = ['★', '♛', '✦', '⚔', '◤', '◥', '★', '☆', '✧', '◈', '♔', '♕'];

export const PUBG_STYLES: DecorationStyle[] = [
  { id: 'pubg_wings', label: 'زخرفة ببجي بالأجنحة', transform: (n) => `◤ ${n} ◥` },
  { id: 'pubg_star', label: 'زخرفة ببجي بالنجوم', transform: (n) => `★ ${n} ★` },
  { id: 'pubg_crown', label: 'زخرفة ببجي بالتاج', transform: (n) => `♛ ${n} ♛` },
  { id: 'pubg_swords', label: 'زخرفة ببجي بالسيوف', transform: (n) => `⚔ ${n} ⚔` },
  { id: 'pubg_fire', label: 'زخرفة ببجي بالنار', transform: (n) => `🔥 ${n} 🔥` },
  { id: 'pubg_elegant', label: 'زخرفة ببجي أنيقة', transform: (n) => `✧ ${n} ✧` },
  { id: 'pubg_diamond', label: 'زخرفة ببجي بالألماس', transform: (n) => `◈ ${n} ◈` },
  { id: 'pubg_king', label: 'زخرفة ببجي الملك', transform: (n) => `♔ ${n} ♔` },
  { id: 'pubg_queen', label: 'زخرفة ببجي الملكة', transform: (n) => `♕ ${n} ♕` },
  { id: 'pubg_ornate', label: 'زخرفة ببجي فاخرة', transform: (n) => `༺ ${n} ༻` },
  { id: 'pubg_brackets', label: 'زخرفة ببجي بالأقواس', transform: (n) => `【 ${n} 】` },
  { id: 'pubg_mystic', label: 'زخرفة ببجي غامضة', transform: (n) => `✦ ${n} ✦` },
  {
    id: 'pubg_spaced',
    label: 'زخرفة ببجي بالمسافات',
    transform: (n) => n.split('').join(' '),
  },
  {
    id: 'pubg_dotted',
    label: 'زخرفة ببجي بالتنقيط',
    transform: (n) => `•°•°• ${n} •°•°•`,
  },
  {
    id: 'pubg_reverse',
    label: 'زخرفة ببجي معكوسة',
    transform: (n) => `↬ ${n} ↫`,
  },
];

// --- Free Fire decoration styles -------------------------------------------

export const FREEFIRE_STYLES: DecorationStyle[] = [
  { id: 'ff_wings', label: 'زخرفة فري فاير بالأجنحة', transform: (n) => `◤ ${n} ◥` },
  { id: 'ff_star', label: 'زخرفة فري فاير بالنجوم', transform: (n) => `★ ${n} ★` },
  { id: 'ff_crown', label: 'زخرفة فري فاير بالتاج', transform: (n) => `♛ ${n} ♛` },
  { id: 'ff_swords', label: 'زخرفة فري فاير بالسيوف', transform: (n) => `⚔ ${n} ⚔` },
  { id: 'ff_fire', label: 'زخرفة فري فاير بالنار', transform: (n) => `🔥 ${n} 🔥` },
  { id: 'ff_elegant', label: 'زخرفة فري فاير أنيقة', transform: (n) => `✧ ${n} ✧` },
  { id: 'ff_diamond', label: 'زخرفة فري فاير بالألماس', transform: (n) => `◈ ${n} ◈` },
  { id: 'ff_king', label: 'زخرفة فري فاير الملك', transform: (n) => `♔ ${n} ♔` },
  { id: 'ff_ornate', label: 'زخرفة فري فاير فاخرة', transform: (n) => `༺ ${n} ༻` },
  { id: 'ff_brackets', label: 'زخرفة فري فاير بالأقواس', transform: (n) => `【 ${n} 】` },
  { id: 'ff_flower', label: 'زخرفة فري فاير بالورود', transform: (n) => `✿ ${n} ✿` },
  { id: 'ff_heart', label: 'زخرفة فري فاير بالقلوب', transform: (n) => `♥ ${n} ♥` },
  { id: 'ff_mystic', label: 'زخرفة فري فاير غامضة', transform: (n) => `✦ ${n} ✦` },
  {
    id: 'ff_spaced',
    label: 'زخرفة فري فاير بالمسافات',
    transform: (n) => n.split('').join(' '),
  },
  {
    id: 'ff_dotted',
    label: 'زخرفة فري فاير بالتنقيط',
    transform: (n) => `•°•°• ${n} •°•°•`,
  },
  {
    id: 'ff_reverse',
    label: 'زخرفة فري فاير معكوسة',
    transform: (n) => `↬ ${n} ↫`,
  },
];

// --- French decoration styles -----------------------------------------------

export const FRENCH_STYLES: DecorationStyle[] = [
  { id: 'fr_script', label: 'Style élégant (Script)', transform: (n) => applyMap(n, ENGLISH_LETTER_MAP) },
  { id: 'fr_bold', label: 'Style gras (Bold)', transform: (n) => applyMap(n, ENGLISH_BOLD_MAP) },
  { id: 'fr_italic', label: 'Style italique', transform: (n) => applyMap(n, ENGLISH_ITALIC_MAP) },
  { id: 'fr_double', label: 'Style double', transform: (n) => applyMap(n, ENGLISH_DOUBLE_MAP) },
  { id: 'fr_circle', label: 'Style cercle', transform: (n) => applyMap(n, ENGLISH_CIRCLE_MAP) },
  { id: 'fr_wings', label: 'Avec ailes', transform: (n) => `✰ ${n} ✰` },
  { id: 'fr_star', label: 'Avec étoiles', transform: (n) => `✦ ${n} ✦` },
  { id: 'fr_crown', label: 'Avec couronne', transform: (n) => `♛ ${n} ♛` },
  { id: 'fr_heart', label: 'Avec cœurs', transform: (n) => `♥ ${n} ♥` },
  { id: 'fr_flower', label: 'Avec fleurs', transform: (n) => `✿ ${n} ✿` },
  { id: 'fr_ornate', label: 'Style royal', transform: (n) => `༺ ${n} ༻` },
  { id: 'fr_fire', label: 'Avec feu', transform: (n) => `🔥 ${n} 🔥` },
  { id: 'fr_elegant', label: 'Style mystique', transform: (n) => `✧ ${n} ✧` },
  { id: 'fr_script_wings', label: 'Script avec ailes', transform: (n) => `✰ ${applyMap(n, ENGLISH_LETTER_MAP)} ✰` },
  { id: 'fr_bold_star', label: 'Gras avec étoiles', transform: (n) => `✦ ${applyMap(n, ENGLISH_BOLD_MAP)} ✦` },
];

// --- Tool registry ----------------------------------------------------------

export interface DecorationTool {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  keywords: string[];
  intro: string;
  about: { heading: string; body: string }[];
  styles: DecorationStyle[];
  placeholder: string;
}

export const DECORATION_TOOLS: DecorationTool[] = [
  {
    slug: 'arabic',
    title: 'زخرفة الأسماء بالعربي',
    shortTitle: 'زخرفة الأسماء عربي',
    description:
      'أداة زخرفة الأسماء بالعربية أونلاين مجاناً — اكتب اسمك واحصل على أكثر من 15 نمط زخرفة عربي بأجنحة ونجوم وورود وألماس، مع زر نسخ مباشر لكل نمط.',
    keywords: [
      'زخرفة الأسماء عربي',
      'زخرفة الأسماء بالعربي',
      'زخرفة الأسماء العربية',
      'زخرفة اسمي بالعربي',
      'أداة زخرفة الأسماء عربي',
      'زخرفة عربية أونلاين',
      'زخرفة الأسماء بالعربية مجاناً',
    ],
    intro:
      'اكتب اسمك بالعربية في الحقل أدناه واختر من بين أكثر من 15 نمط زخرفة عربي مختلف — من الزخرفة بالأجنحة والنجوم إلى زخرفة الحروف العربية الأصيلة. كل نمط جاهز للنسخ المباشر.',
    about: [
      {
        heading: 'كيف تزخرف اسمك بالعربي؟',
        body:
          'اكتب اسمك بالعربية في حقل الإدخال، وستقوم الأداة فوراً بتوليد أكثر من 15 نمط زخرفة مختلف لاسمك. يمكنك تصفّح النماذج والضغط على زر «نسخ» بجانب أي نمط لنسخه مباشرة إلى الحافظة، ثم لصقه في أي مكان تريد — وسائل التواصل الاجتماعي، الواتساب، الانستغرام، أو أي تطبيق آخر.',
      },
      {
        heading: 'أنماط الزخرفة العربية المتاحة',
        body:
          'توفر الأداة أنماطاً متنوعة من الزخرفة العربية: زخرفة بالأجنحة، بالتاج، بالورود، بالقلوب، بالنجوم، بالألماس، بالأقواس، زخرفة فاخرة، بالسيوف، بالنار، إضافة إلى زخرفة الحروف العربية الأصيلة باستخدام الحروف العربية المزخرفة يونيكود. كل نمط يعطي شكلاً مختلفاً ومميزاً لاسمك.',
      },
      {
        heading: 'أين تستخدم الاسم المزخرف بالعربي؟',
        body:
          'يمكنك استخدام الأسماء المزخرفة بالعربية في العديد من المنصات: واتساب (اسم الحالة والعرض)، انستغرام (البيو)، تويتر/X (الاسم المعروض)، سناب شات، تيك توك، فيس بوك، تيليجرام، إضافة إلى الرسائل النصية والبريد الإلكتروني. الزخرفة العربية تعطي شخصية مميزة لاسمك وتجعله يبرز بين الأسماء الأخرى.',
      },
    ],
    styles: ARABIC_STYLES,
    placeholder: 'اكتب اسمك هنا بالعربية...',
  },
  {
    slug: 'pubg',
    title: 'زخرفة الأسماء ببجي (PUBG)',
    shortTitle: 'زخرفة الأسماء ببجي',
    description:
      'أداة زخرفة الأسماء ببجي PUBG Mobile أونلاين — زخرف اسمك في ببجي بأكثر من 15 نمط: أجنحة، نجوم، تاج، سيوف، نار، وألماس مع نسخ مباشر لتغيير اسمك في اللعبة.',
    keywords: [
      'زخرفة الأسماء ببجي',
      'زخرفة اسم ببجي',
      'زخرفة ببجي',
      'اسم ببجي مزخرف',
      'تغيير اسم ببجي',
      'زخرفة ببجي موبايل',
      'PUBG name decoration',
      'زخرفة الأسماء للببجي',
    ],
    intro:
      'اكتب اسمك وحصل على أكثر من 15 نمط زخرفة مخصص لأسماء ببجي (PUBG Mobile). كل نمط جاهز للنسخ المباشر واستخدامه في تغيير اسمك داخل اللعبة.',
    about: [
      {
        heading: 'كيف تغير اسمك في ببجي باسم مزخرف؟',
        body:
          'اكتب اسمك في الحقل، اختر النمط الذي يعجبك، اضغط «نسخ»، ثم افتح لعبة ببجي موبايل وادخل إلى تغيير الاسم (Rename Card)، الصق الاسم المزخرف في الحقل المخصص واحفظ. سيتغير اسمك في اللعبة فوراً إلى الاسم المزخرف الذي اخترته.',
      },
      {
        heading: 'أنماط زخرفة ببجي المتاحة',
        body:
          'توفر الأداة أنماطاً مخصصة للاعبي ببجي: زخرفة بالأجنحة (◤ ◥)، بالنجوم (★)، بالتاج (♛ ♛)، بالسيوف (⚔)، بالنار (🔥)، بالألماس (◈)، زخرفة الملك (♔ ♔)، زخرفة الملكة (♕)، زخرفة فاخرة (༺ ༻)، زخرفة بالأقواس (【 】)، زخرفة بالمسافات، زخرفة بالتنقيط، وزخرفة معكوسة. كل هذه الأنماط متوافقة مع نظام أسماء ببجي.',
      },
      {
        heading: 'نصائح لاسم ببجي مميز',
        body:
          'اختر زخرفة تعكس شخصيتك في اللعبة — الأجنحة والسيوف تناسب اللاعبين الهجوميين، التاج والملك يناسب القادة، النار تناسب اللاعبين ذوي المستوى العالي. تجنب الزخرفة المفرطة لأنها قد تجعل الاسم صعب القراءة على زملائك في الفريق. اسم مميز يساعدك على بناء سمعتك في مجتمع ببجي.',
      },
    ],
    styles: PUBG_STYLES,
    placeholder: 'اكتب اسمك هنا لزخرفة ببجي...',
  },
  {
    slug: 'english',
    title: 'زخرفة الأسماء بالإنجليزي (English Name Decoration)',
    shortTitle: 'زخرفة الأسماء بالإنجليزي',
    description:
      'أداة زخرفة الأسماء بالإنجليزي أونلاين — اكتب اسمك بالإنجليزية واحصل على أكثر من 15 خطاً مزخرفاً: Script، Bold، Italic، Double، Circle، Monospace مع رموز ونسخ مباشر.',
    keywords: [
      'زخرفة الأسماء بالانجليزي',
      'زخرفة الأسماء بالإنجليزي',
      'English name decoration',
      'fancy text generator',
      'زخرفة اسم بالإنجليزي',
      'زخرفة خطوط إنجليزية',
      'stylish English name',
    ],
    intro:
      'اكتب اسمك بالإنجليزية واحصل على أكثر من 15 نمط زخرفة وخطوط أنيقة — من خط Script الكلاسيكي إلى الخط العريض والمائل والدائري والمزدوج، مع رموز الأجنحة والنجوم والتاج. كل نمط جاهز للنسخ المباشر.',
    about: [
      {
        heading: 'كيف تزخرف اسمك بالإنجليزي؟',
        body:
          'اكتب اسمك بالأحرف الإنجليزية في حقل الإدخال، وستقوم الأداة بتوليد أكثر من 15 نمطاً مختلفاً باستخدام رموز يونيكود الرياضية. تشمل الأنماط: الخط الأنيق (Script Math)، الخط العريض (Bold Math)، الخط المائل (Italic Math)، الخط المزدوج (Double-struck)، الخط الدائري (Circled)، الخط الأحادي (Monospace)، إضافة إلى أنماط بالرموز مثل الأجنحة والنجوم والتاج والقلوب والورود.',
      },
      {
        heading: 'أين تستخدم الاسم المزخرف بالإنجليزي؟',
        body:
          'الأسماء الإنجليزية المزخرفة شائعة جداً على منصات التواصل الاجتماعي: انستغرام (الاسم والبيو)، تويتر/X (الاسم المعروض)، تيك توك، يوتيوب، ديسكورد، سناب شات، تيليجرام، جيميل، إضافة إلى الألعاب الإلكترونية مثل فري فاير، ببجي، كول أوف ديوتي، فورتنايت. الخطوط المزخرفة تعطي للاسمك تميزاً بصرياً يجذب الانتباه.',
      },
      {
        heading: 'أنماط الخطوط الإنجليزية المتاحة',
        body:
          'الخط الأنيق (𝓢𝓬𝓻𝓲𝓹𝓽) — حروف رفيعة منحنية. الخط العريض (𝐁𝐨𝐥𝐝) — حروف سميكة بارزة. الخط المائل (𝘐𝘵𝘢𝘭𝘪𝘤) — حروف مائلة. الخط المزدوج (𝔻𝕠𝕦𝕓𝕝𝕖) — حروف بحدود مزدوجة. الخط الدائري (Ⓒⓘⓡⓒⓛⓔ) — حروف داخل دوائر. الخط الأحادي (𝙼𝚘𝚗𝚘) — حروف بعرض ثابت. كل هذه الخطوط متوافقة مع معظم المنصات التي تدعم يونيكود.',
      },
    ],
    styles: ENGLISH_STYLES,
    placeholder: 'Type your name here in English...',
  },
  {
    slug: 'free-fire',
    title: 'زخرفة الأسماء فري فاير (Free Fire)',
    shortTitle: 'زخرفة الأسماء فري فاير',
    description:
      'أداة زخرفة الأسماء فري فاير Free Fire أونلاين — زخرف اسمك في فري فاير بأكثر من 15 نمط: أجنحة، نجوم، تاج، سيوف، نار، وورود مع نسخ مباشر لتغيير اسمك في اللعبة.',
    keywords: [
      'زخرفة الأسماء فري فاير',
      'زخرفة اسم فري فاير',
      'زخرفة فري فاير',
      'اسم فري فاير مزخرف',
      'تغيير اسم فري فاير',
      'Free Fire name decoration',
      'زخرفة الأسماء للفري فاير',
      'اسم ستايل فري فاير',
    ],
    intro:
      'اكتب اسمك واحصل على أكثر من 15 نمط زخرفة مخصص لأسماء فري فاير (Free Fire). كل نمط جاهز للنسخ المباشر واستخدامه في تغيير اسمك داخل اللعبة.',
    about: [
      {
        heading: 'كيف تغير اسمك في فري فاير باسم مزخرف؟',
        body:
          'اكتب اسمك في الحقل، اختر النمط الذي يعجبك، اضغط «نسخ»، ثم افتح لعبة فري فاير وادخل إلى تغيير الاسم (Name Change Card)، الصق الاسم المزخرف في الحقل المخصص واحفظ. سيتغير اسمك في اللعبة فوراً. يمكنك أيضاً استخدام الاسم المزخرف عند إنشاء حساب جديد.',
      },
      {
        heading: 'أنماط زخرفة فري فاير المتاحة',
        body:
          'توفر الأداة أنماطاً مخصصة للاعبي فري فاير: زخرفة بالأجنحة (◤ ◥)، بالنجوم (★)، بالتاج (♛ ♛)، بالسيوف (⚔)، بالنار (🔥)، بالألماس (◈)، زخرفة الملك (♔ ♔)، زخرفة فاخرة (༺ ༻)، زخرفة بالأقواس (【 】)، زخرفة بالورود (✿)، زخرفة بالقلوب (♥)، زخرفة بالمسافات، زخرفة بالتنقيط، وزخرفة معكوسة. كل هذه الأنماط مدعومة في نظام أسماء فري فاير.',
      },
      {
        heading: 'نصائح لاسم فري فاير احترافي',
        body:
          'في فري فاير، الاسم المميز يساعدك على بناء هويتك كلاعب. اختر زخرفة تعكس أسلوبك — الأجنحة والسيوف للاعبين الهجوميين، التاج للقادة، النار للاعبين ذوي المستوى العالي. يمكنك أيضاً دمج اسمك مع رموز خاصة لإنشاء اسم فريد لا يشبه أي لاعب آخر. تذكر أن الاسم المزخرف يجذب الانتباه في قوائم المتصدرين.',
      },
    ],
    styles: FREEFIRE_STYLES,
    placeholder: 'اكتب اسمك هنا لزخرفة فري فاير...',
  },
  {
    slug: 'french',
    title: 'زخرفة الأسماء بالفرنسية (Décoration de Noms)',
    shortTitle: 'زخرفة الأسماء بالفرنسية',
    description:
      'أداة زخرفة الأسماء بالفرنسية أونلاين — اكتب اسمك بالفرنسية واحصل على أكثر من 15 نمط زخرفة: Script، Bold، Italic، Double، Circle مع رموز ونسخ مباشر.',
    keywords: [
      'زخرفة الأسماء بالفرنسية',
      'زخرفة الأسماء فرنسي',
      'décoration de noms',
      'zakhrafat asma french',
      'زخرفة اسم بالفرنسي',
      'stylish French name',
      'زخرفة فرنسية أونلاين',
    ],
    intro:
      'اكتب اسمك بالفرنسية واحصل على أكثر من 15 نمط زخرفة وخطوط أنيقة — من خط Script الكلاسيكي إلى الخط العريض والمائل والدائري والمزدوج، مع رموز الأجنحة والنجوم والتاج. كل نمط جاهز للنسخ المباشر.',
    about: [
      {
        heading: 'كيف تزخرف اسمك بالفرنسية؟',
        body:
          'اكتب اسمك بالأحرف الفرنسية في حقل الإدخال، وستقوم الأداة بتوليد أكثر من 15 نمطاً مختلفاً باستخدام رموز يونيكود. تشمل الأنماط: الخط الأنيق (Script)، الخط العريض (Bold)، الخط المائل (Italic)، الخط المزدوج (Double-struck)، الخط الدائري (Circled)، إضافة إلى أنماط بالرموز مثل الأجنحة (Ailes)، النجوم (Étoiles)، التاج (Couronne)، القلوب (Cœurs)، الورود (Fleurs).',
      },
      {
        heading: 'أين تستخدم الاسم المزخرف بالفرنسية؟',
        body:
          'الأسماء الفرنسية المزخرفة شائعة على منصات التواصل الاجتماعي الناطقة بالفرنسية: انستغرام، تيك توك، فيس بوك، تيليجرام، سناب شات، إضافة إلى الألعاب الإلكترونية. إذا كنت تستخدم الفرنسية في تواصلك أو تعيش في دولة ناطقة بالفرنسية، فإن الاسم المزخرف بالفرنسية يعطي شخصية مميزة ويسهل التعرف عليك.',
      },
      {
        heading: 'أنماط الزخرفة الفرنسية المتاحة',
        body:
          'الخط الأنيق (𝓢𝓬𝓻𝓲𝓹𝓽) — حروف رفيعة منحنية. الخط العريض (𝐁𝐨𝐥𝐝) — حروف سميكة بارزة. الخط المائل (𝘐𝘵𝘢𝘭𝘪𝘲𝘶𝘦) — حروف مائلة. الخط المزدوج (𝔻𝕠𝕦𝕓𝕝𝕖) — حروف بحدود مزدوجة. الخط الدائري (Ⓒⓘⓡⓒⓛⓔ) — حروف داخل دوائر. إضافة إلى أنماط بالرموز: Avec ailes (✰)، Avec étoiles (✦)، Avec couronne (♛)، Avec cœurs (♥)، Avec fleurs (✿)، Style royal (༺ ༻)، Avec feu (🔥).',
      },
    ],
    styles: FRENCH_STYLES,
    placeholder: 'Tapez votre nom ici en français...',
  },
];

export function decorationToolBySlug(slug: string): DecorationTool | undefined {
  return DECORATION_TOOLS.find((t) => t.slug === slug);
}
