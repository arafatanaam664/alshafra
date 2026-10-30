// Static content gate, not a substitute for access control or editorial review.
// Monthly rules alone cannot authorise a government payment date.
import { validIso } from './iso-date.mjs';

export function salaryScheduleApproved(def, today) {
  if (def.category !== 'salary') return true;
  const v = def.verification;
  if (def.schedule?.type !== 'fixed' || !v || v.status !== 'official' || v.editorApproved !== true ||
      !validIso(v.verifiedAt) || !validIso(v.reviewDue) || v.reviewDue < v.verifiedAt) return false;
  const current = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
  if (!validIso(current) || current < v.verifiedAt || current > v.reviewDue) return false;
  if (!def.source?.label || def.source.url !== v.sourceUrl) return false;
  try {
    const url = new URL(v.sourceUrl);
    return url.protocol === 'https:' && (url.hostname === 'gov.sa' || url.hostname.endsWith('.gov.sa')) && !url.username && !url.password;
  } catch { return false; }
}
