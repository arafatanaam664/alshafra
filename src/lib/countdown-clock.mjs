// Riyadh observes UTC+03:00 year-round. Count down to the start of the target date.
export function countdownRemaining(target, nowMs) {
  const targetMs = Date.UTC(target.year, target.month - 1, target.day, -3);
  const total = Math.max(0, targetMs - nowMs);
  return {
    total,
    days: Math.floor(total / 86400000),
    hours: Math.floor((total % 86400000) / 3600000),
    minutes: Math.floor((total % 3600000) / 60000),
    seconds: Math.floor((total % 60000) / 1000),
  };
}
