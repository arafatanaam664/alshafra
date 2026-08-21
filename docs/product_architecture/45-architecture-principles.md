# 45 — Architecture Principles

1. **Preserve existing value.** URLs, Hijri engine, payday rule, articles, 410 for the old site.
2. **Build once, activate gradually.** Flags, not deleted code paths.
3. **SEO-first.** HTML must be meaningful without JS; no soft 404; no thin farms.
4. **User-first.** Answer above the fold for tools; no ads before the result.
5. **Performance-first.** Static/CDN, islands, few fonts, no 1Hz homepage rerender.
6. **Modular monolith.** Clear modules, one deploy.
7. **Simple infrastructure.** Cloudflare + Supabase + R2 on $0.
8. **Scalable boundaries.** Modules can be extracted later.
9. **Automation where useful.** Never as the only editor.
10. **Human control over automation.** Social and AI cannot silently ship YMYL facts.
11. **No unnecessary complexity.** No Kafka, no microservices, no ML recs on day one.
12. **No premature microservices.**
13. **No dependency on one external provider.** Interfaces for Auth, Search, AI, Social, Queue.
14. **UGC must be controlled.** Default noindex, rate limits, moderation.
15. **Content quality over quantity.** A 1500-word pad is not quality.

These principles override local convenience in later phases.
