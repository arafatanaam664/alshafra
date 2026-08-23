# 06 — Content model

يبقى `documents + content_types` من Phase 4.
الأنواع الموجودة: article, guide, solution, news, trend, faq_page, comparison, opportunity, job, scholarship, tool_page, calendar_content, service_info, collection, legal.

لا جداول articles/news منفصلة.
News العام يستخدم `/update/:slug` وليس `/news/*` (410).
