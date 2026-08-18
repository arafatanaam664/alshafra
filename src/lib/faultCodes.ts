import faultCodesData from '../data/fault-codes.json';

export interface FaultCodeSource {
  label: string;
  url: string;
  sourceType: 'manufacturer-support' | 'official-manual' | 'regulator' | string;
}

export interface FaultCodeCause {
  title: string;
  detail: string;
}

export interface FaultCodeCheck {
  title: string;
  detail: string;
}

export interface FaultCodeDiagnosis {
  observation: string;
  likelyCause: string;
  firstAction: string;
}

export interface FaultCodeEntry {
  slug: string;
  deviceSlug: string;
  deviceName: string;
  brandSlug: string;
  brandName: string;
  code: string;
  alternateCodes: string[];
  title: string;
  seoTitle: string;
  description: string;
  shortAnswer: string;
  modelScope: string;
  warning: string;
  causes: FaultCodeCause[];
  safeChecks: FaultCodeCheck[];
  diagnosis: FaultCodeDiagnosis[];
  stopConditions: string[];
  faq: { q: string; a: string }[];
  sources: FaultCodeSource[];
  publishedAt: string;
  reviewedAt: string;
  status: 'draft' | 'review' | 'published' | 'archived';
}

export const FAULT_CODES = (faultCodesData as { faultCodes: FaultCodeEntry[] }).faultCodes.filter(
  (entry) => entry.status === 'published',
);

export function faultCodePath(entry: FaultCodeEntry): string {
  return `/fault-codes/${entry.deviceSlug}/${entry.brandSlug}/${entry.slug}`;
}

export function faultCodeByRoute(device: string, brand: string, slug: string): FaultCodeEntry | undefined {
  return FAULT_CODES.find(
    (entry) => entry.deviceSlug === device && entry.brandSlug === brand && entry.slug === slug,
  );
}

export function faultCodesForDevice(device: string): FaultCodeEntry[] {
  return FAULT_CODES.filter((entry) => entry.deviceSlug === device);
}

export function faultCodesForBrand(device: string, brand: string): FaultCodeEntry[] {
  return FAULT_CODES.filter((entry) => entry.deviceSlug === device && entry.brandSlug === brand);
}

export function faultCodeDevices(): { slug: string; name: string; count: number }[] {
  const devices = new Map<string, { slug: string; name: string; count: number }>();
  for (const entry of FAULT_CODES) {
    const current = devices.get(entry.deviceSlug);
    devices.set(entry.deviceSlug, {
      slug: entry.deviceSlug,
      name: entry.deviceName,
      count: (current?.count || 0) + 1,
    });
  }
  return [...devices.values()];
}

export function faultCodeBrands(device?: string): { slug: string; name: string; count: number; deviceSlug: string }[] {
  const brands = new Map<string, { slug: string; name: string; count: number; deviceSlug: string }>();
  for (const entry of FAULT_CODES) {
    if (device && entry.deviceSlug !== device) continue;
    const key = `${entry.deviceSlug}:${entry.brandSlug}`;
    const current = brands.get(key);
    brands.set(key, {
      slug: entry.brandSlug,
      name: entry.brandName,
      count: (current?.count || 0) + 1,
      deviceSlug: entry.deviceSlug,
    });
  }
  return [...brands.values()];
}
