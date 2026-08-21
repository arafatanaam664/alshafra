/** Design tokens aligned with the existing Tailwind `brand` scale. No I/O. */
export const brand = {
  name: 'Alshafra',
  calendarNavLabel: 'التقويم والمواعيد',
  alternateNames: ['تقويم السعودية', 'Saudi Calendar'] as const,
  colors: {
    brand600: '#0b6e4f',
    brand900: '#022c22',
    sand: '#faf7f2',
    gold500: '#c9aa7c',
  },
  dir: 'rtl' as const,
  lang: 'ar' as const,
};

export type BrandTokens = typeof brand;
