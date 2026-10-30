type DateParts = { year: number; month: number; day: number };
type SchoolVerification = { status: string; editorApproved: boolean; approvedBy: string; approvedAt: string | null; verifiedAt: string; reviewDue: string | null; sourceUrl: string };
type SchoolEvent = { date: string; verification?: SchoolVerification };
type SchoolCalendar<T extends SchoolEvent> = { source: string; events: T[] };
export function schoolEventApproved<T extends SchoolEvent>(calendar: SchoolCalendar<T>, event: T | null | undefined, today: DateParts): boolean;
export function approvedSchoolEvents<T extends SchoolEvent>(calendar: SchoolCalendar<T>, today: DateParts): T[];
