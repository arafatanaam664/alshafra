export function countdownNotice(def: { schedule: { type: string; dates?: string[] }; category: string; slug: string; source?: { label: string; url: string; verifiedAt?: string }; verification?: { status: string; editorApproved: boolean; approvedBy: string; approvedAt: string; approvedSlug: string; approvedDates: string[]; verifiedAt: string; reviewDue: string; sourceUrl: string } }, verifiedAt: string, today?: { year: number; month: number; day: number }): string;

export const staticCountdownNotice: typeof countdownNotice;
