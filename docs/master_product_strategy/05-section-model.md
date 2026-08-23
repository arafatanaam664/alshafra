# 05 — Section model

الحقول: key, name, path, description, icon, enabled, showInNav, showInHome, showInFooter, showInMobile, featured, sort, children, featureFlag, hasPublicPage, lockedPath, system, seoTitle, seoDescription.

القواعد:
- المسار المقفل لا يتغير.
- لا تفعيل بلا صفحة عامة.
- الأقسام النظامية لا تُحذف.
- التجاوزات في `site_settings.platform.sections`.
- الظهور العام بعد snapshot ثم build لأن Astro static.
