# 52 — Permission Matrix

Legend: ✓ allow, – deny, ◐ limited (own objects or non-SEO fields).

| Permission | Visitor | User | Trusted | Moderator | Editor | SEO Mgr | Social Mgr | Analyst | Admin | Super |
|---|---|---|---|---|---|---|---|---|---|---|
| Read public pages | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Use public tools | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Register | ✓ | – | – | – | – | – | – | – | – | – |
| Edit own profile | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create question | – | ✓ | ✓ | ✓ | – | – | – | – | – | ✓ |
| Answer question | – | ✓ | ✓ | ✓ | – | – | – | – | – | ✓ |
| Comment | – | ✓ | ✓ | ✓ | – | – | – | – | – | ✓ |
| Vote | – | ✓ | ✓ | ✓ | – | – | – | – | – | ✓ |
| Bookmark / follow | – | ✓ | ✓ | ✓ | – | – | – | – | – | ✓ |
| Post links in UGC | – | – | ✓ | ✓ | – | – | – | – | – | ✓ |
| Accept answer (own Q) | – | ✓ | ✓ | ✓ | – | – | – | – | – | ✓ |
| Accept any answer | – | – | – | ✓ | – | – | – | – | ✓ | ✓ |
| Report content | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Handle reports | – | – | – | ✓ | – | – | – | – | ✓ | ✓ |
| Hide UGC | – | – | – | ✓ | – | – | – | – | ✓ | ✓ |
| Suspend / ban user | – | – | – | ✓ | – | – | – | – | ✓ | ✓ |
| Bypass new-user limits | – | – | ✓ | ✓ | – | – | – | – | ✓ | ✓ |
| Create editorial draft | – | – | – | – | ✓ | – | – | – | ✓ | ✓ |
| Submit review | – | – | – | – | ✓ | – | – | – | ✓ | ✓ |
| Publish / unpublish | – | – | – | – | ✓ | – | – | – | ✓ | ✓ |
| Edit published body | – | – | – | – | ✓ | – | – | – | ✓ | ✓ |
| Edit SEO on published | – | – | – | – | ◐ | ✓ | – | – | ✓ | ✓ |
| Manage redirects / 410 | – | – | – | – | – | ✓ | – | – | ✓ | ✓ |
| Force index UGC | – | – | – | – | – | ✓ | – | – | – | ✓ |
| Upload media (editorial) | – | – | – | – | ✓ | – | ✓ | – | ✓ | ✓ |
| Connect social account | – | – | – | – | – | – | ✓ | – | ✓ | ✓ |
| Approve social job | – | – | – | – | – | – | ✓ | – | ✓ | ✓ |
| Edit social templates | – | – | – | – | – | – | ✓ | – | ✓ | ✓ |
| Edit automation rules | – | – | – | – | – | – | ✓ | – | ✓ | ✓ |
| View analytics | – | – | – | – | ◐ | ✓ | ◐ | ✓ | ✓ | ✓ |
| Toggle feature flags | – | – | – | – | – | – | – | – | ✓ | ✓ |
| Edit site settings | – | – | – | – | – | ◐ SEO group | ◐ social group | – | ✓ | ✓ |
| Manage users/roles | – | – | – | – | – | – | – | – | – | ✓ |
| View audit logs | – | – | – | ✓ own | – | – | – | – | ✓ | ✓ |
| Restore revisions | – | – | – | – | ✓ | – | – | – | ✓ | ✓ |
| System health | – | – | – | – | – | – | – | ✓ | ✓ | ✓ |

Community permissions apply only if `community_enabled` and `registration_enabled`.
