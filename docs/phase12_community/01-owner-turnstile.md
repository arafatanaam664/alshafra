# Turnstile والمجتمع — ماذا تضع وأين (قبل التفعيل)

لا تلصق الأسرار في الدردشة. الأعلام تبقى **متوقفة** حتى تكمل هذا.

## 1) Cloudflare Turnstile

1. Cloudflare → Turnstile → أضف موقعاً (`alshafra.com`).
2. انسخ **Site Key** و **Secret Key**.

## 2) أين تضع القيم

| الاسم | أين | سر؟ |
|---|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | `.env.local` و Vercel (عام، يظهر في المتصفح) | لا |
| `TURNSTILE_SECRET_KEY` | `.env.local` و Vercel **Server only** | نعم |

لا تضع السر في `PUBLIC_*`.

## 3) متى تقلب الأعلام

من لوحة الإدارة → Feature Flags، **بعد** وجود مشرف وTurnstile:

1. `community_enabled`
2. `questions_enabled` و/أو `comments_enabled`
3. اترك `registration_enabled` و `seo.ugc_auto_index` **false** حتى يتوفر تسجيل Supabase وسياسة فهرسة بشرية

الواجهة العامة الساكنة (Astro) لن تنشر صفحات أسئلة في هذه المرحلة. التفعيل يعني API + إشراف فقط، لا هباً مفهرساً فارغاً.

## 4) التطوير بدون مفاتيح

`ALSHAFRA_ENV=development` وبدون `TURNSTILE_SECRET_KEY`: استخدم الرمز الاختباري `dev-ok` في الاختبارات فقط. في الإنتاج بدون السر تُرفض الكتابة.
