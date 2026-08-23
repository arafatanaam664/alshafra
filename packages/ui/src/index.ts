/** Design tokens aligned with the existing Tailwind `brand` scale. No I/O. */
export const brand = {
  name: 'Alshafra',
  calendarNavLabel: 'التقويم والمواعيد',
  alternateNames: ['تقويم السعودية', 'Saudi Calendar'] as const,
  colors: {
    brand600: '#5b4dff',
    brand900: '#0b1020',
    sand: '#f7f6f3',
    gold500: '#f97316',
  },
  dir: 'rtl' as const,
  lang: 'ar' as const,
};

export type BrandTokens = typeof brand;
