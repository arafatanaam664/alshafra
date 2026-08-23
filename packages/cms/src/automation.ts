import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';
import { enqueueSocialPublish, type SocialProviderName } from '@alshafra/social';
import { createNotification } from '@alshafra/notifications';
import { requirePermission, type Actor } from './permissions';
import { writeAudit } from './audit';

export interface AutomationEvent {
  name: string;
  documentId?: string;
  documentType?: string;
  title?: string;
  path?: string;
  url?: string;
  actorId?: string;
}

export async function listAutomationRules(db: SqlClient, actor: Actor | null) {
  requirePermission(actor, 'automation.edit');
  return (
    await db.query(
      `SELECT id, name, trigger, conditions_json, actions_json, is_enabled, cooldown_seconds, created_at
       FROM automation_rules ORDER BY created_at DESC`,
    )
  ).rows;
}

export async function upsertAutomationRule(
  db: SqlClient,
  actor: Actor,
  input: {
    id?: string;
    name: string;
    trigger: string;
    conditions?: Record<string, unknown>;
    actions?: unknown[];
    isEnabled?: boolean;
  },
) {
  requirePermission(actor, 'automation.edit');
  const id = input.id || newId();
  await db.query(
    `INSERT INTO automation_rules (id, name, trigger, conditions_json, actions_json, is_enabled, created_by)
     VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6,$7)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       trigger = EXCLUDED.trigger,
       conditions_json = EXCLUDED.conditions_json,
       actions_json = EXCLUDED.actions_json,
       is_enabled = EXCLUDED.is_enabled`,
    [
      id,
      input.name,
      input.trigger,
      JSON.stringify(input.conditions ?? {}),
      JSON.stringify(input.actions ?? []),
      Boolean(input.isEnabled),
      actor.userId,
    ],
  );
  await writeAudit(db, actor, 'automation.edit', 'automation_rule', id, null, { name: input.name });
  return { id };
}

export async function setAutomationEnabled(db: SqlClient, actor: Actor, id: string, enabled: boolean) {
  requirePermission(actor, 'automation.edit');
  await db.query(`UPDATE automation_rules SET is_enabled = $2 WHERE id = $1`, [id, enabled]);
}

function matches(conditions: Record<string, unknown>, event: AutomationEvent): boolean {
  if (conditions.type && conditions.type !== event.documentType) return false;
  if (conditions.pathPrefix && !String(event.path || '').startsWith(String(conditions.pathPrefix))) return false;
  return true;
}

export async function dispatchAutomation(db: SqlClient, event: AutomationEvent) {
  const flags = await db.query<{ key: string; is_enabled: boolean }>(
    `SELECT key, is_enabled FROM feature_flags WHERE key IN ('social_auto_publish_enabled','notifications_enabled')`,
  );
  const enabled = Object.fromEntries(flags.rows.map((row) => [row.key, row.is_enabled]));
  const rules = await db.query<{
    id: string;
    trigger: string;
    conditions_json: Record<string, unknown>;
    actions_json: unknown;
    is_enabled: boolean;
  }>(`SELECT id, trigger, conditions_json, actions_json, is_enabled FROM automation_rules WHERE is_enabled = true`);

  const ran: string[] = [];
  for (const rule of rules.rows) {
    if (rule.trigger !== event.name) continue;
    if (!matches(rule.conditions_json || {}, event)) continue;
    const actions = Array.isArray(rule.actions_json) ? rule.actions_json : [];
    for (const action of actions) {
      const item = action as { type?: string; provider?: SocialProviderName; recipientId?: string };
      if (item.type === 'social.enqueue' && enabled.social_auto_publish_enabled && event.documentId && event.url) {
        await enqueueSocialPublish(db, {
          documentId: event.documentId,
          provider: item.provider || 'telegram',
          rendered: { title: event.title || event.path || 'Alshafra', url: event.url, summary: event.title },
        });
      }
      if (item.type === 'notify.staff' && enabled.notifications_enabled && item.recipientId) {
        await createNotification(db, {
          recipientId: item.recipientId,
          type: 'moderation',
          actorId: event.actorId,
          entityType: 'document',
          entityId: event.documentId,
          payload: { path: event.path, title: event.title },
        });
      }
    }
    await db.query(
      `INSERT INTO automation_runs (id, rule_id, event_id, status, payload_json) VALUES ($1,$2,$3,'ok',$4::jsonb)`,
      [newId(), rule.id, event.name, JSON.stringify({ path: event.path })],
    );
    ran.push(rule.id);
  }
  return { ran };
}

export async function listAutomationRuns(db: SqlClient, actor: Actor | null) {
  requirePermission(actor, 'automation.edit');
  return (
    await db.query(
      `SELECT id, rule_id, event_id, status, payload_json, created_at FROM automation_runs ORDER BY created_at DESC LIMIT 50`,
    )
  ).rows;
}
