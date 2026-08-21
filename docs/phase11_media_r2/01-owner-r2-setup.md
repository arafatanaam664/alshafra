# إعداد R2 — ماذا تضع وأين (قبل الإطلاق)

لا تلصق المفاتيح في الدردشة. ضعها بنفسك في الملفات أو لوحة الاستضافة.

## 1) أنشئ الموارد في Cloudflare

1. ادخل Cloudflare → **R2 Object Storage**.
2. أنشئ bucket بالاسم المقترح: `alshafra-media` (أو أي اسم، ثم انسخه كما هو).
3. أنشئ **R2 API Token** بصلاحية **Object Read & Write** على هذا الـ bucket فقط.
4. انسخ: Account ID، Access Key ID، Secret Access Key.
5. (اختياري لاحقاً، وبعد أن تسمح بتغيير DNS) اربط نطاقاً عاماً مثل `media.alshafra.com`. **لا تغيّر DNS الآن.**

للمعاينة قبل النطاق المخصص يمكن تفعيل R2.dev public URL (اعتبره noindex).

## 2) أين تضع القيم

### تطوير محلي

انسخ `.env.example` إلى `.env.local` في جذر المستودع:

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=alshafra-media
R2_REGION=auto
PUBLIC_R2_PUBLIC_BASE_URL=https://media.alshafra.com
```

`.env.local` في `.gitignore`. لا ترفعها إلى Git.

### الإنتاج الحالي (Vercel)

Vercel → المشروع → **Settings → Environment Variables** → أضف نفس الأسماء لـ Production (وPreview إن أردت). ثم أعد النشر.

لا تضع `R2_SECRET_ACCESS_KEY` في متغيرات `PUBLIC_*`.

### لاحقاً Cloudflare Pages

نفس الأسماء في إعدادات المشروع هناك، عندما تقرر النقل بعد اكتمال المنصة.

## 3) جدول الأسماء

| الاسم | أين | سر؟ | مثال شكل القيمة |
|---|---|---|---|
| `R2_ACCOUNT_ID` | خادم فقط | لا | معرّف حساب Cloudflare |
| `R2_ACCESS_KEY_ID` | خادم فقط | نعم | مفتاح الوصول |
| `R2_SECRET_ACCESS_KEY` | خادم فقط | نعم | السر |
| `R2_BUCKET` | خادم فقط | لا | `alshafra-media` |
| `R2_ENDPOINT` | خادم فقط، اختياري | لا | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `R2_REGION` | خادم فقط، اختياري | لا | `auto` |
| `PUBLIC_R2_PUBLIC_BASE_URL` | عام (يظهر في HTML) | لا | `https://media.alshafra.com` |
| `MEDIA_DRIVER` | خادم فقط، اختياري | لا | اتركه فارغاً ليختار R2 تلقائياً عند وجود المفاتيح |
| `MEDIA_LOCAL_DIR` | محلي فقط | لا | `.data/media` |

## 4) ماذا يحدث قبل أن تضع المفاتيح؟

الرفع يعمل محلياً على القرص. الموقع العام يبقى يستخدم `/og-image.jpg` الافتراضي من المستودع. بعد وضع `PUBLIC_R2_PUBLIC_BASE_URL` ورفع صورة وربطها كصورة بارزة، تُستخدم في OG عند نشر اللقطة.
