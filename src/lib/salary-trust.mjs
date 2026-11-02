// Static content gate, not a substitute for access control or editorial review.
// Monthly rules alone cannot authorise a government payment date.
import { validIso } from './iso-date.mjs';

export function salaryScheduleApproved(def, today) {
  if (def.category !== 'salary') return true;
  const v = def.verification;
  if (def.schedule?.type !== 'fixed' || !v || v.status !== 'official' || v.editorApproved !== true ||
      typeof v.approvedBy !== 'string' || !v.approvedBy.trim() || v.approvedSlug !== def.slug ||
      !validIso(v.verifiedAt) || !validIso(v.approvedAt) || !validIso(v.reviewDue) ||
      v.approvedAt < v.verifiedAt || v.reviewDue < v.approvedAt ||
      !Array.isArray(def.schedule.dates) || !def.schedule.dates.length ||
      !def.schedule.dates.every(validIso) || new Set(def.schedule.dates).size !== def.schedule.dates.length ||
      !Array.isArray(v.approvedDates) || v.approvedDates.length !== def.schedule.dates.length ||
      !def.schedule.dates.every(date => v.approvedDates.includes(date))) return false;
  const current = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
  if (!validIso(current) || current < v.approvedAt || current > v.reviewDue) return false;
  if (!def.source?.label || def.source.url !== v.sourceUrl) return false;
  try {
    const url = new URL(v.sourceUrl);
    return url.protocol === 'https:' && (url.hostname === 'gov.sa' || url.hostname.endsWith('.gov.sa')) && !url.username && !url.password;
  } catch { return false; }
}
