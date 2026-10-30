import { useEffect, useState } from 'react';
import { todayGregorian, type GregorianDate } from './hijri';

/** Refresh the calendar day across Riyadh midnight, including long-lived tabs. */
export function useRiyadhToday(): GregorianDate {
  const [today, setToday] = useState(todayGregorian);
  useEffect(() => {
    const update = () => setToday(previous => {
      const current = todayGregorian();
      return current.year === previous.year && current.month === previous.month && current.day === previous.day ? previous : current;
    });
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);
  return today;
}
