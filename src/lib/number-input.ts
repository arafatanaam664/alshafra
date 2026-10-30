/** Normalize common Arabic-Indic, Persian and Latin digits for date inputs. */
export function parseYearInput(value: string): number {
  const normalized = value.replace(/[٠-٩۰-۹]/g, digit => {
    const n = digit.charCodeAt(0);
    return String(n >= 0x06f0 ? n - 0x06f0 : n - 0x0660);
  }).trim();
  return /^\d{1,6}$/.test(normalized) ? Number(normalized) : 0;
}
