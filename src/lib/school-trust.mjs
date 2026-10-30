import { validIso } from './iso-date.mjs';

// Approval belongs to each event; a source link or a past check alone is not approval.
export function schoolEventApproved(calendar, event, today) {
  const v = event?.verification;
  if (!v || v.status !== 'official' || v.editorApproved !== true ||
      typeof v.approvedBy !== 'string' || !v.approvedBy.trim() ||
      !validIso(v.verifiedAt) || !validIso(v.approvedAt) || !validIso(v.reviewDue) ||
      v.approvedAt < v.verifiedAt || v.reviewDue < v.approvedAt ||
      !validIso(event.date) || !v.sourceUrl || v.sourceUrl !== calendar.source) return false;
  const current = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
  if (!validIso(current) || current < v.approvedAt || current > v.reviewDue) return false;
  try {
    const u = new URL(v.sourceUrl);
    return u.protocol === 'https:' && u.hostname === 'www.moe.gov.sa' && !u.username && !u.password;
  } catch { return false; }
}
export function approvedSchoolEvents(calendar, today) {
  return calendar.events.filter(event => schoolEventApproved(calendar, event, today));
}
