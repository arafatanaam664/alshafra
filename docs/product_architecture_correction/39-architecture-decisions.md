# ADR-4501 كتالوج الأقسام

Context: الأقسام كانت ستُكتب في الواجهة فقط.
Decision: كتالوج TypeScript + تجاوزات site_settings. لا جدول sections الآن لتجنب التكرار مع categories.
Alternatives: جدول sections جديد / استخدام categories فقط.
Consequences: الظهور العام يحتاج snapshot+build. Phase لاحقة قد تضيف جدولاً إذا لزم CRUD أثقل.
Rollback: حذف مفتاح platform.sections يعيد البذرة.
