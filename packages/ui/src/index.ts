/** Design tokens aligned with the existing Tailwind `brand` scale. No I/O. */
export const brand = {
  name: 'Alshafra',
  calendarNavLabel: 'التقويم والمواعيد',
  alternateNames: ['تقويم السعودية', 'Saudi Calendar'] as const,
  colors: {
    brand600: '#9a3412',
    brand900: '#1b1814',
    sand: '#f6f1e7',
    gold500: '#b45309',
  },
  dir: 'rtl' as const,
  lang: 'ar' as const,
};

export type BrandTokens = typeof brand;
