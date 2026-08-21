// Build-time twin of src/lib/countdowns.ts.
//
// It reads the SAME data file (src/data/countdowns.json) that the React app
// imports, so the static HTML written by scripts/prerender.mjs and the
// interactive page can never disagree about a date. Only the date maths is
// reimplemented here, because a .mjs build script cannot import TypeScript.
//
// Hijri conversion uses the ICU `islamic-umalqura` calendar — the same table
// used by the official Umm Al-Qura calendar — never a hand-typed date.

import { readFileSync } from 'fs';
import { join } from 'path';

export const HIJRI_MONTHS = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

export const GREGORIAN_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export const ARABIC_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const SITE_TIMEZONE = 'Asia/Riyadh';

const umFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone: 'UTC',
});

export function gregorianToJdn(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: 100 * b + d - 4800 + Math.floor(m / 10),
  };
}

export function gregorianToHijri(year, month, day) {
  const parts = umFormatter.formatToParts(new Date(Date.UTC(year, month - 1, day)));
  const pick = (type) => parseInt((parts.find((p) => p.type === type)?.value ?? '').replace(/[^0-9]/g, ''), 10);
  return { year: pick('year'), month: pick('month'), day: pick('day') };
}

/** Hijri -> Gregorian by searching around a linear estimate of the Hijri epoch. */
export function hijriToGregorian(h) {
  const estimate = Math.round((h.year - 1) * 354.367) + 1948440 + Math.round((h.month - 1) * 29.53) + h.day - 1;
  for (let delta = 0; delta <= 30; delta++) {
    const candidates = delta === 0 ? [estimate] : [estimate - delta, estimate + delta];
    for (const jdn of candidates) {
      const g = jdnToGregorian(jdn);
      const back = gregorianToHijri(g.year, g.month, g.day);
      if (back.year === h.year && back.month === h.month && back.day === h.day) return g;
    }
  }
  throw new Error(`[countdowns] Umm Al-Qura lookup failed for ${h.year}-${h.month}-${h.day}`);
}

/** Real length (29 or 30) of a Hijri month, from the Umm Al-Qura table. */
export function hijriMonthLength(year, month) {
  const start = hijriToGregorian({ year, month, day: 1 });
  const next = month === 12 ? { year: year + 1, month: 1, day: 1 } : { year, month: month + 1, day: 1 };
  const end = hijriToGregorian(next);
  return gregorianToJdn(end.year, end.month, end.day) - gregorianToJdn(start.year, start.month, start.day);
}

export function weekdayIndex(g) {
  return (gregorianToJdn(g.year, g.month, g.day) + 1) % 7;
}

export function weekdayName(g) {
  return ARABIC_WEEKDAYS[weekdayIndex(g)];
}

export function formatHijri(h) {
  return `${h.day} ${HIJRI_MONTHS[h.month - 1]} ${h.year}هـ`;
}

export function formatGregorian(g) {
  return `${g.day} ${GREGORIAN_MONTHS[g.month - 1]} ${g.year}م`;
}

export function isoDate(g) {
  return `${g.year}-${String(g.month).padStart(2, '0')}-${String(g.day).padStart(2, '0')}`;
}

/** Friday -> Thursday, Saturday -> Sunday (official Saudi disbursement rule). */
export function applyWeekendRule(date) {
  const jdn = gregorianToJdn(date.year, date.month, date.day);
  const wd = weekdayIndex(date);
  if (wd === 5) return jdnToGregorian(jdn - 1);
  if (wd === 6) return jdnToGregorian(jdn + 1);
  return date;
}

/** "Today" in Riyadh — the reference timezone for every date on the site. */
export function todayInRiyadh() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SITE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const pick = (t) => Number(parts.find((p) => p.type === t)?.value);
  return { year: pick('year'), month: pick('month'), day: pick('day') };
}

export function loadCountdowns(root = process.cwd()) {
  const file = join(root, 'src', 'data', 'countdowns.json');
  return JSON.parse(readFileSync(file, 'utf-8')).countdowns;
}

function parseIso(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
  return m ? { year: +m[1], month: +m[2], day: +m[3] } : null;
}

const jdnOf = (d) => gregorianToJdn(d.year, d.month, d.day);

export function occurrences(def, from, limit = 3) {
  const fromJdn = jdnOf(from);
  const s = def.schedule;
  const out = [];

  if (s.type === 'gregorian-annual') {
    for (let i = 0; out.length < limit && i < limit + 2; i++) {
      const candidate = { year: from.year + i, month: s.month, day: s.day };
      if (jdnOf(candidate) >= fromJdn) out.push(candidate);
    }
    return out.slice(0, limit);
  }

  if (s.type === 'hijri-annual') {
    const h = gregorianToHijri(from.year, from.month, from.day);
    for (let i = 0; out.length < limit && i < limit + 2; i++) {
      const candidate = hijriToGregorian({ year: h.year + i, month: s.hijriMonth, day: s.hijriDay });
      if (jdnOf(candidate) >= fromJdn) out.push(candidate);
    }
    return out.slice(0, limit);
  }

  if (s.type === 'monthly') {
    for (let offset = 0; out.length < limit && offset < limit + 3; offset++) {
      const month = ((from.month - 1 + offset) % 12) + 1;
      const year = from.year + Math.floor((from.month - 1 + offset) / 12);
      const scheduled = { year, month, day: s.dayOfMonth };
      const adjusted = s.weekendRule === false ? scheduled : applyWeekendRule(scheduled);
      if (jdnOf(adjusted) >= fromJdn) out.push(adjusted);
    }
    return out.slice(0, limit);
  }

  return (s.dates || [])
    .map(parseIso)
    .filter(Boolean)
    .filter((d) => jdnOf(d) >= fromJdn)
    .sort((a, b) => jdnOf(a) - jdnOf(b))
    .slice(0, limit);
}

export function displayTitle(def, date) {
  if (!date) return def.title;
  const s = def.schedule;
  if (s.type === 'gregorian-annual' && s.editionBase) return `${def.title} ${date.year - s.editionBase}`;
  if (s.type === 'hijri-annual' && s.showHijriYear) {
    return `${def.title} ${gregorianToHijri(date.year, date.month, date.day).year}هـ`;
  }
  return def.title;
}

export function resolveCountdown(def, from) {
  const upcoming = occurrences(def, from, 3);
  const date = upcoming[0] ?? null;
  const hijri = date ? gregorianToHijri(date.year, date.month, date.day) : null;
  return {
    def,
    date,
    hijri,
    displayTitle: displayTitle(def, date),
    gregorianText: date ? formatGregorian(date) : '—',
    hijriText: hijri ? formatHijri(hijri) : '—',
    weekdayText: date ? weekdayName(date) : '—',
    daysRemaining: date ? Math.max(0, jdnOf(date) - jdnOf(from)) : -1,
    upcoming,
  };
}

export function resolveAll(from) {
  return loadCountdowns()
    .map((def) => resolveCountdown(def, from))
    .sort((a, b) => {
      if (a.date && b.date) return a.daysRemaining - b.daysRemaining;
      if (a.date) return -1;
      if (b.date) return 1;
      return 0;
    });
}
