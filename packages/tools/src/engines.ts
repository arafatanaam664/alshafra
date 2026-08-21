export function percentOf(partPercent: number, total: number): number {
  return (total * partPercent) / 100;
}

export function percentIs(part: number, total: number): number {
  if (total === 0) throw new Error('division_by_zero');
  return (part / total) * 100;
}

export function percentChange(from: number, to: number): number {
  if (from === 0) throw new Error('division_by_zero');
  return ((to - from) / from) * 100;
}

export function applyDiscount(price: number, percent: number): { final: number; saved: number } {
  const saved = (price * percent) / 100;
  return { final: price - saved, saved };
}

export function bodyMassIndex(kg: number, cm: number): { bmi: number; category: string } {
  if (cm <= 0 || kg <= 0) throw new Error('invalid_input');
  const bmi = kg / (cm / 100) ** 2;
  let category = 'سمنة مفرطة';
  if (bmi < 18.5) category = 'نحافة';
  else if (bmi < 25) category = 'وزن مناسب';
  else if (bmi < 30) category = 'زيادة وزن';
  else if (bmi < 35) category = 'سمنة';
  return { bmi, category };
}

export function loanPayment(principal: number, annualPercent: number, months: number): {
  monthly: number;
  total: number;
  interest: number;
} {
  if (principal <= 0 || months <= 0) throw new Error('invalid_input');
  const r = annualPercent / 100 / 12;
  const monthly = r === 0 ? principal / months : (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1);
  const total = monthly * months;
  return { monthly, total, interest: total - principal };
}

const LENGTH_TO_M: Record<string, number> = { m: 1, cm: 0.01, km: 1000, in: 0.0254, ft: 0.3048 };
const MASS_TO_KG: Record<string, number> = { kg: 1, g: 0.001, lb: 0.45359237 };

export function convertLength(value: number, from: keyof typeof LENGTH_TO_M, to: keyof typeof LENGTH_TO_M): number {
  return (value * LENGTH_TO_M[from]) / LENGTH_TO_M[to];
}

export function convertMass(value: number, from: keyof typeof MASS_TO_KG, to: keyof typeof MASS_TO_KG): number {
  return (value * MASS_TO_KG[from]) / MASS_TO_KG[to];
}

export function convertTemperature(value: number, from: 'C' | 'F', to: 'C' | 'F'): number {
  if (from === to) return value;
  if (from === 'C' && to === 'F') return (value * 9) / 5 + 32;
  return ((value - 32) * 5) / 9;
}

export function countText(text: string): { words: number; chars: number; charsNoSpace: number } {
  const chars = [...text].length;
  const charsNoSpace = [...text.replace(/\s+/g, '')].length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { words, chars, charsNoSpace };
}

export function encodeBase64(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

export function decodeBase64(text: string): string {
  return decodeURIComponent(escape(atob(text)));
}

export function encodeUrl(text: string): string {
  return encodeURIComponent(text);
}

export function decodeUrl(text: string): string {
  return decodeURIComponent(text);
}

export function formatJson(text: string): string {
  return JSON.stringify(JSON.parse(text), null, 2);
}

export function generateUuid(bytes: Uint8Array = crypto.getRandomValues(new Uint8Array(16))): string {
  const copy = Uint8Array.from(bytes);
  copy[6] = (copy[6] & 0x0f) | 0x40;
  copy[8] = (copy[8] & 0x3f) | 0x80;
  const hex = [...copy].map((n) => n.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
