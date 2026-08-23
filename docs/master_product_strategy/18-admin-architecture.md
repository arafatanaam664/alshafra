# 18 — Admin architecture

تطبيق منفصل `apps/admin`، لاindex، مصادقة، RBAC، تدقيق.

الآن:
- لوحة، محتوى، أقسام، تنقل، تصنيفات، أدوات، وسائط، SEO، تحليلات، مجتمع (إشراف)، مستخدمون، أعلام، إعدادات، تدقيق، صحة.

لاحقًا (لا تُبنى الآن):
- إنشاء صفحات هبوط للأقسام، Social queue، Automation، Revenue، GSC/Bing connectors.

إدارة الأقسام الحالية:
- GET/PATCH `/api/v1/admin/sections`
- GET/PATCH `/api/v1/admin/navigation`
- التخزين: `site_settings.platform.sections`
- لا تغيير لمسارات 127
