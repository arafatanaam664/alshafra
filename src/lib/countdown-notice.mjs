import { salaryScheduleApproved } from './salary-trust.mjs';
import { schoolEventApproved } from './school-trust.mjs';

/** Explain the provenance of a displayed date; not a substitute for source review. */
export function countdownNotice(def, _verifiedAt, today) {
  if (def.category === 'salary' && today && def.schedule.type === 'fixed' && def.schedule.dates.length && salaryScheduleApproved(def, today)) return `موعد مصدره ${def.source.label}؛ آخر تحقق ${def.verification.verifiedAt}، والمراجعة مستحقة ${def.verification.reviewDue}. راجع المصدر لأي تحديث.`;
  if (def.schedule.type === 'hijri-annual') return 'موعد حسابي غير نهائي؛ راجع الإعلان الرسمي لرؤية الهلال. وقد يستخدم المتصفح حساباً تقريبياً عند عدم توفر تقويم أم القرى.';
  if (def.category === 'school') {
    if (today && schoolEventApproved({ source: def.schoolSource }, def.schoolEvent, today)) return `حسب صفحة وزارة التعليم؛ آخر تحقق ${def.schoolEvent.verification.verifiedAt} والمراجعة مستحقة ${def.schoolEvent.verification.reviewDue}. راجع المصدر لأي تحديث.`;
    return 'موعد بانتظار التحقق والاعتماد؛ راجع وزارة التعليم.';
  }
  if (def.category === 'national') return `تاريخ المناسبة${def.source?.verifiedAt ? `؛ راجعنا المصدر في ${def.source.verifiedAt}` : ''}؛ قد تختلف أيام الإجازة والتعويض بحسب اللوائح والجهة.`;
  if (def.slug === 'new-year') return 'بداية السنة الميلادية، ولا تعني إجازة رسمية تلقائية.';
  if (def.category === 'seasonal') return 'موعد تقريبي متعارف عليه للموسم، وليس إعلاناً رسمياً.';
  return '';
}
