#!/usr/bin/env node
/**
 * Human title pass: content-first search queries + Alshafra as the only public brand.
 * Does not change paths. Writes both published.json inventories.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const files = [
  join(root, 'apps/web/public/published.json'),
  join(root, 'apps/web-legacy/public/published.json'),
];

const OVERRIDES = {
  '/': 'Alshafra — منصة عربية للمعلومات العملية',
  '/salaries': 'موعد صرف الرواتب وحساب المواطن 2026',
  '/hijri-calendar': 'التقويم الهجري 1448 هـ وفق أم القرى',
  '/school-calendar': 'التقويم الدراسي 1448-1449 في السعودية',
  '/holidays': 'الإجازات الرسمية في السعودية 2026',
  '/date-converter': 'تحويل التاريخ الهجري إلى ميلادي وفق أم القرى',
  '/age-calculator': 'حاسبة العمر بالهجري والميلادي',
  '/today': 'التاريخ الهجري والميلادي اليوم',
  '/articles': 'مقالات الرواتب والتقويم والإجازات',
  '/articles/salary-dates-saudi-arabia': 'موعد رواتب الموظفين الحكوميين 2026',
  '/articles/citizen-account-payment-dates': 'موعد حساب المواطن 2026',
  '/articles/hijri-calendar-1448': 'التقويم الهجري 1448 كاملًا',
  '/articles/school-calendar-1448': 'التقويم الدراسي 1448-1449',
  '/articles/official-holidays-saudi-arabia': 'الإجازات الرسمية في السعودية 2026',
  '/articles/hijri-to-gregorian-conversion': 'تحويل التاريخ الهجري والميلادي',
  '/articles/developed-social-security': 'الضمان الاجتماعي المطور 2026',
  '/countdown': 'كم باقي على رمضان والعيد والراتب',
  '/countdown/national-day': 'كم باقي على اليوم الوطني السعودي',
  '/countdown/founding-day': 'كم باقي على يوم التأسيس',
  '/countdown/ramadan': 'كم باقي على رمضان',
  '/countdown/eid-fitr': 'كم باقي على عيد الفطر',
  '/countdown/eid-adha': 'كم باقي على عيد الأضحى',
  '/countdown/laylat-alqadr': 'كم باقي على ليلة القدر',
  '/countdown/hijri-new-year': 'كم باقي على رأس السنة الهجرية',
  '/countdown/citizen-account': 'كم باقي على حساب المواطن',
  '/countdown/employee-salaries': 'كم باقي على الراتب',
  '/countdown/retiree-salaries': 'كم باقي على راتب المتقاعدين',
  '/countdown/social-security': 'كم باقي على الضمان الاجتماعي',
  '/countdown/school-start': 'كم باقي على الدراسة',
  '/countdown/fall-break': 'كم باقي على إجازة الخريف',
  '/countdown/midyear-break': 'كم باقي على إجازة منتصف العام',
  '/countdown/school-end': 'كم باقي على نهاية الدراسة',
  '/countdown/new-year': 'كم باقي على رأس السنة الميلادية',
  '/countdown/suhail': 'كم باقي على طلوع سهيل',
  '/countdown/murabbaniya': 'كم باقي على المربعانية',
  '/faq': 'أسئلة شائعة عن التحويل والرواتب',
  '/about': 'عن Alshafra',
  '/contact': 'تواصل مع Alshafra',
  '/privacy': 'سياسة الخصوصية',
  '/terms': 'شروط الاستخدام',
  '/trending': 'أدلة عملية في المال والتقنية والتعليم',
  '/trending/today': 'أكثر ما يُبحث عنه اليوم',
  '/trending/economy': 'أدلة الاقتصاد والأسواق',
  '/trending/technology': 'أدلة التقنية والتطبيقات',
  '/trending/social': 'أدلة الدعم والحياة',
  '/trending/education': 'أدلة التعليم في الخليج',
  '/trending/religion': 'أدلة الدين والعبادات',
  '/trending/travel': 'أدلة السفر والسياحة',
  '/trending/dollar-exchange-rate-gulf': 'سعر صرف الدولار اليوم في الخليج',
  '/trending/gold-price-gulf': 'أسعار الذهب اليوم في الخليج',
  '/trending/crypto-investing-gulf': 'الاستثمار في العملات الرقمية في الخليج',
  '/trending/remittances-guide': 'التحويلات المالية في الخليج',
  '/trending/ai-future-jobs-gulf': 'الذكاء الاصطناعي والوظائف في الخليج',
  '/trending/gcc-tech-apps-2026': 'تطبيقات التقنية في الخليج 2026',
  '/trending/smartphone-trends-gcc': 'اتجاهات الهواتف الذكية في الخليج',
  '/trending/gcc-savings-guide': 'الادخار وإدارة الميزانية في الخليج',
  '/trending/gulf-tax-guide': 'الضرائب في الخليج وضريبة القيمة المضافة',
  '/trending/citizen-support-guide': 'برامج الدعم الاجتماعي في الخليج',
  '/trending/gcc-education-guide': 'التعليم والجامعات في الخليج',
  '/trending/gcc-school-calendar-guide': 'التقويم الدراسي في دول الخليج',
  '/trending/ramadan-timetable-guide': 'مواقيت رمضان والسحور في الخليج',
  '/trending/gulf-hajj-umrah-guide': 'الحج والعمرة من دول الخليج',
  '/trending/gulf-visa-guide': 'التأشيرات في دول الخليج',
  '/trending/gcc-travel-guide': 'السفر والسياحة في الخليج',
  '/trending/oil-price-gulf': 'أسعار النفط واقتصاد الخليج',
  '/trending/real-estate-gulf': 'الاستثمار العقاري في الخليج',
  '/trending/ecommerce-gulf': 'التجارة الإلكترونية في الخليج',
  '/trending/ai-tools-guide': 'أدوات الذكاء الاصطناعي 2026',
  '/trending/cybersecurity-guide': 'الأمن السيبراني وحماية البيانات',
  '/trending/family-budget-gulf': 'ميزانية الأسرة في الخليج',
  '/trending/online-courses-guide': 'التعلم عن بعد والدورات المجانية',
  '/trending/prayer-times-guide': 'مواقيت الصلاة في دول الخليج',
  '/trending/zakah-calculator-guide': 'حساب الزكاة ومتى تجب',
  '/trending/saudi-tourism-guide': 'السياحة في السعودية',
  '/trending/social-media-guide': 'صناعة المحتوى في وسائل التواصل',
  '/trending/jobs-career-gulf': 'البحث عن وظيفة في الخليج',
  '/trending/car-owning-gulf': 'شراء وصيانة السيارات في الخليج',
  '/trending/insurance-guide-gulf': 'التأمين في دول الخليج',
  '/trending/student-guide-gulf': 'طرق الدراسة للطلاب',
  '/trending/quran-ramadan-guide': 'ختم القرآن في رمضان',
  '/trending/gulf-cuisine-guide': 'المأكولات الشعبية في الخليج',
  '/trending/digital-banking-gulf': 'البنوك الرقمية في الخليج',
  '/trending/freelancing-gulf': 'العمل الحر في الخليج',
  '/gold-price': 'سعر الذهب اليوم في الدول العربية',
  '/usd-rate': 'سعر الدولار اليوم في الدول العربية',
};

function withBrand(core) {
  const trimmed = core.trim();
  if (trimmed === 'عن Alshafra' || trimmed === 'تواصل مع Alshafra') return trimmed;
  if (trimmed.startsWith('Alshafra')) return trimmed;
  if (trimmed.endsWith('| Alshafra')) return trimmed;
  return `${trimmed} | Alshafra`;
}

function fallbackCore(title) {
  return title
    .replace(/\s*\|\s*تقويم السعودية\s*$/u, '')
    .replace(/\s*\|\s*شفرة تولز\s*$/u, '')
    .replace(/\s*\|\s*المواضيع الرائجة في الخليج\s*$/u, '')
    .replace(/\s*\|\s*تقويم أم القرى(?: الرسمي)?\s*$/u, '')
    .replace(/\s*\|\s*وزارة التعليم السعودية\s*$/u, '')
    .replace(/\s*\|\s*العدّ التنازلي\s*$/u, '')
    .trim();
}

const source = JSON.parse(readFileSync(files[0], 'utf8'));
const next = {
  ...source,
  generatedAt: '2026-08-24',
  published: source.published.map((row) => {
    const core = OVERRIDES[row.path] || fallbackCore(row.title);
    return { ...row, title: withBrand(core) };
  }),
};

const missing = next.published.filter((row) => !row.title || /تقويم السعودية|شفرة تولز/.test(row.title));
if (missing.length) {
  console.error('title rewrite failed', missing.slice(0, 8));
  process.exit(1);
}
if (next.published.length !== 127) {
  console.error('count drifted', next.published.length);
  process.exit(1);
}

const json = `${JSON.stringify(next)}\n`;
for (const file of files) writeFileSync(file, json);
console.log(`rewrote ${next.published.length} titles in ${files.length} inventories`);
