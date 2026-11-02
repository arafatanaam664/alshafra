type DateParts = { year: number; month: number; day: number };
type SchoolVerification = { status: string; editorApproved: boolean; approvedBy: string; approvedAt: string | null; approvedDate: string | null; approvedTitle: string; approvedEventId: string; approvedHijri: string; approvedCountdownSlug: string | null; verifiedAt: string; reviewDue: string | null; sourceUrl: string };
type SchoolEvent = { id: string; title: string; hijri: string; countdownSlug?: string; date: string; verification?: SchoolVerification };
type SchoolCalendar<T extends SchoolEvent> = { source: string; events: T[] };
export function schoolEventApproved<T extends SchoolEvent>(calendar: SchoolCalendar<T>, event: T | null | undefined, today: DateParts): boolean;
export function approvedSchoolEvents<T extends SchoolEvent>(calendar: SchoolCalendar<T>, today: DateParts): T[];
