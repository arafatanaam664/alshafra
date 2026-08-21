import type { SqlClient } from '@alshafra/database';
import type { DocumentStatus, DocumentType } from '@alshafra/content';
import {
  createStorageFromEnv,
  decodeBase64Upload,
  getMedia,
  ingestEditorial,
  isR2Configured,
  listMediaLibrary,
  mediaStatus,
  readMediaBytes,
  softDeleteMedia,
  updateMediaMeta,
} from '@alshafra/media';
import {
  addRelation,
  addSource,
  createDocument,
  getDocument,
  listDocuments,
  replaceFaqs,
  restoreRevision,
  setTags,
  transitionDocument,
  updateDocument,
} from './content';
import { getDashboardOverview, getSystemHealth } from './dashboard';
import {
  getAnalyticsOverview,
  getDocumentAnalytics,
  listFlags,
  listRedirects,
  listSettings,
  listTools,
  listUsers,
  setFlag,
  setSetting,
} from './flags-settings';
import { listAudit, writeAudit } from './audit';
import { canAccessAdmin, hasPermission, requirePermission, type Actor } from './permissions';
import { auditSeo } from './seo-audit';
import {
  actorFromCookie,
  clearCookie,
  encodeCookie,
  provisionStaff,
  sessionSecret,
} from './session';
import {
  listAuthors,
  listCategories,
  listEntities,
  listTags,
  listTopics,
  mergeTags,
  upsertAuthor,
  upsertCategory,
  upsertEntity,
  upsertTag,
  upsertTopic,
} from './taxonomy';

export interface HttpInput {
  method: string;
  pathname: string;
  search: string;
  headers: Record<string, string | undefined>;
  body?: unknown;
}

export interface HttpOutput {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
  raw?: Uint8Array;
}

function json(status: number, body: unknown, headers?: Record<string, string>): HttpOutput {
  return { status, body, headers };
}

function errorStatus(err: unknown): HttpOutput {
  const msg = err instanceof Error ? err.message : 'error';
  if (msg.startsWith('forbidden:')) return json(403, { error: msg });
  if (err instanceof Error && err.name === 'ForbiddenError') return json(403, { error: msg });
  if (msg === 'not_found') return json(404, { error: msg });
  if (msg.startsWith('invalid_transition')) return json(409, { error: msg });
  return json(400, { error: msg });
}

const DEV_ROLES: Record<string, string> = {
  'author@local.test': 'author',
  'editor@local.test': 'editor',
  'seo@local.test': 'seo_manager',
  'analyst@local.test': 'analyst',
  'admin@local.test': 'admin',
  'super@local.test': 'super_admin',
};

function qs(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
}

export async function handleAdminApi(input: HttpInput, db: SqlClient): Promise<HttpOutput> {
  const method = input.method.toUpperCase();
  const path = input.pathname.replace(/\/+$/, '') || '/';
  const secret = sessionSecret();
  const env = process.env.ALSHAFRA_ENV || 'development';
  const devLogin = process.env.ADMIN_DEV_LOGIN === 'true' && env !== 'production';

  if (method === 'POST' && path === '/api/v1/admin/auth/login') {
    const email = String((input.body as { email?: string })?.email || '')
      .trim()
      .toLowerCase();
    if (!email || !email.includes('@')) return json(400, { error: 'invalid_email' });
    if (!devLogin) return json(501, { error: 'supabase_auth_not_configured' });
    if (!secret) return json(500, { error: 'ADMIN_SESSION_SECRET missing' });
    const role = DEV_ROLES[email] || 'editor';
    const actor = await provisionStaff(db, email, role);
    return json(200, { user: actor }, { 'Set-Cookie': encodeCookie(actor.userId, secret) });
  }

  if (method === 'POST' && path === '/api/v1/admin/auth/logout') {
    return json(200, { ok: true }, { 'Set-Cookie': clearCookie() });
  }

  let actor: Actor | null = null;
  try {
    actor = await actorFromCookie(db, input.headers.cookie || input.headers.Cookie || null, secret);
  } catch {
    actor = null;
  }

  if (method === 'GET' && path === '/api/v1/admin/auth/session') {
    if (!actor || !canAccessAdmin(actor)) return json(401, { error: 'unauthorized' });
    return json(200, { user: actor });
  }

  if (!actor || !canAccessAdmin(actor)) return json(401, { error: 'unauthorized' });

  try {
    if (method === 'GET' && path === '/api/v1/admin/dashboard') {
      return json(200, await getDashboardOverview(db, actor));
    }
    if (method === 'GET' && path === '/api/v1/admin/health') {
      if (!hasPermission(actor, 'health.read')) return json(403, { error: 'forbidden:health.read' });
      return json(200, await getSystemHealth(db, actor));
    }
    if (method === 'GET' && path === '/api/v1/admin/documents') {
      const q = qs(input.search);
      return json(
        200,
        await listDocuments(db, actor, {
          status: q.get('status') || undefined,
          type: q.get('type') || undefined,
          q: q.get('q') || undefined,
        }),
      );
    }
    if (method === 'POST' && path === '/api/v1/admin/documents') {
      const b = input.body as { type: DocumentType; title: string; slug?: string; excerpt?: string; path?: string };
      return json(201, await createDocument(db, actor, b));
    }

    const docMatch = path.match(/^\/api\/v1\/admin\/documents\/([^/]+)(?:\/([a-z-]+))?$/);
    if (docMatch) {
      const id = docMatch[1];
      const sub = docMatch[2];
      if (method === 'GET' && !sub) {
        const row = await getDocument(db, actor, id);
        if (!row) return json(404, { error: 'not_found' });
        const d = row.document;
        const checks = auditSeo({
          title: String(d.title ?? ''),
          seoTitle: d.seo_title as string | null,
          description: (d.meta_description || d.excerpt) as string | null,
          canonical: d.canonical_url as string | null,
          h1: (d.h1_override || d.title) as string | null,
          path: String(d.path ?? ''),
          hasImage: Boolean(d.featured_media_id),
          hasInternalLink: row.relations.length > 0,
          indexable: Boolean(d.indexable),
          robots: d.robots as string | null,
          faqCount: row.faq.length,
        });
        return json(200, { ...row, seoAudit: checks });
      }
      if (method === 'PATCH' && !sub) {
        return json(200, await updateDocument(db, actor, id, input.body as never));
      }
      if (method === 'POST' && sub === 'transition') {
        const b = input.body as { to: DocumentStatus; scheduledAt?: string };
        return json(200, await transitionDocument(db, actor, id, b.to, b.scheduledAt));
      }
      if (method === 'POST' && sub === 'restore') {
        const b = input.body as { version: number };
        return json(200, await restoreRevision(db, actor, id, b.version));
      }
      if (method === 'POST' && sub === 'faq') {
        await replaceFaqs(db, actor, id, (input.body as { items: { q: string; a: string }[] }).items || []);
        return json(200, { ok: true });
      }
      if (method === 'POST' && sub === 'source') {
        await addSource(db, actor, id, input.body as { name: string; url?: string });
        return json(200, { ok: true });
      }
      if (method === 'POST' && sub === 'tags') {
        await setTags(db, actor, id, (input.body as { slugs: string[] }).slugs || []);
        return json(200, { ok: true });
      }
      if (method === 'POST' && sub === 'relation') {
        const b = input.body as { toId: string; kind?: string };
        await addRelation(db, actor, id, b.toId, b.kind);
        return json(200, { ok: true });
      }
      if (method === 'GET' && sub === 'analytics') {
        return json(200, await getDocumentAnalytics(db, actor, id));
      }
    }

    if (method === 'GET' && path === '/api/v1/admin/categories') return json(200, await listCategories(db));
    if (method === 'POST' && path === '/api/v1/admin/categories') {
      return json(201, await upsertCategory(db, actor, input.body as never));
    }
    if (method === 'GET' && path === '/api/v1/admin/topics') return json(200, await listTopics(db));
    if (method === 'POST' && path === '/api/v1/admin/topics') return json(201, await upsertTopic(db, actor, input.body as never));
    if (method === 'GET' && path === '/api/v1/admin/tags') return json(200, await listTags(db));
    if (method === 'POST' && path === '/api/v1/admin/tags') return json(201, await upsertTag(db, actor, input.body as never));
    if (method === 'POST' && path === '/api/v1/admin/tags/merge') {
      const b = input.body as { fromId: string; toId: string };
      await mergeTags(db, actor, b.fromId, b.toId);
      return json(200, { ok: true });
    }
    if (method === 'GET' && path === '/api/v1/admin/entities') return json(200, await listEntities(db));
    if (method === 'POST' && path === '/api/v1/admin/entities') return json(201, await upsertEntity(db, actor, input.body as never));
    if (method === 'GET' && path === '/api/v1/admin/authors') return json(200, await listAuthors(db));
    if (method === 'POST' && path === '/api/v1/admin/authors') return json(201, await upsertAuthor(db, actor, input.body as never));

    if (method === 'GET' && path === '/api/v1/admin/tools') return json(200, await listTools(db, actor));
    if (method === 'GET' && path === '/api/v1/admin/media/status') {
      requirePermission(actor, 'media.read');
      return json(200, { ...mediaStatus(), r2Ready: isR2Configured() });
    }
    if (method === 'GET' && path === '/api/v1/admin/media') {
      requirePermission(actor, 'media.read');
      return json(200, await listMediaLibrary(db));
    }
    if (method === 'POST' && path === '/api/v1/admin/media') {
      requirePermission(actor, 'media.upload');
      const b = input.body as {
        filename?: string;
        contentType?: string;
        base64?: string;
        alt?: string;
        caption?: string;
        credit?: string;
        visibility?: 'public' | 'private';
      };
      if (!b?.base64) return json(400, { error: 'missing_file' });
      const storage = createStorageFromEnv();
      const result = await ingestEditorial(db, storage, {
        filename: b.filename || 'upload',
        contentType: b.contentType || 'application/octet-stream',
        bytes: decodeBase64Upload(b.base64),
        alt: b.alt,
        caption: b.caption,
        credit: b.credit,
        visibility: b.visibility,
        uploadedBy: actor.userId,
      });
      await writeAudit(db, actor, result.reused ? 'media.reuse' : 'media.upload', 'media', result.media.id, null, {
        objectKey: result.media.objectKey,
        mime: result.media.mime,
      });
      return json(result.reused ? 200 : 201, result);
    }
    const mediaMatch = path.match(/^\/api\/v1\/admin\/media\/([^/]+)(?:\/(file))?$/);
    if (mediaMatch) {
      const id = mediaMatch[1];
      const sub = mediaMatch[2];
      if (method === 'GET' && sub === 'file') {
        requirePermission(actor, 'media.read');
        const file = await readMediaBytes(db, createStorageFromEnv(), id);
        if (!file) return json(404, { error: 'not_found' });
        return {
          status: 200,
          body: null,
          raw: file.bytes,
          headers: { 'content-type': file.mime, 'cache-control': 'private, max-age=60' },
        };
      }
      if (method === 'GET' && !sub) {
        requirePermission(actor, 'media.read');
        const row = await getMedia(db, id);
        if (!row) return json(404, { error: 'not_found' });
        return json(200, row);
      }
      if (method === 'PATCH' && !sub) {
        requirePermission(actor, 'media.upload');
        const b = input.body as { alt?: string; caption?: string; credit?: string };
        return json(200, await updateMediaMeta(db, id, b));
      }
      if (method === 'DELETE' && !sub) {
        requirePermission(actor, 'media.delete');
        await softDeleteMedia(db, id);
        return json(200, { ok: true });
      }
    }
    if (method === 'GET' && path === '/api/v1/admin/redirects') return json(200, await listRedirects(db, actor));
    if (method === 'GET' && path === '/api/v1/admin/flags') return json(200, await listFlags(db, actor));
    if (method === 'PATCH' && path.startsWith('/api/v1/admin/flags/')) {
      const key = decodeURIComponent(path.slice('/api/v1/admin/flags/'.length));
      await setFlag(db, actor, key, Boolean((input.body as { enabled?: boolean }).enabled));
      return json(200, { ok: true });
    }
    if (method === 'GET' && path === '/api/v1/admin/settings') return json(200, await listSettings(db, actor));
    if (method === 'PATCH' && path === '/api/v1/admin/settings') {
      const b = input.body as { key: string; value: unknown };
      await setSetting(db, actor, b.key, b.value);
      return json(200, { ok: true });
    }
    if (method === 'GET' && path === '/api/v1/admin/audit') return json(200, await listAudit(db, actor));
    if (method === 'GET' && path === '/api/v1/admin/users') return json(200, await listUsers(db, actor));
    if (method === 'GET' && path === '/api/v1/admin/analytics') return json(200, await getAnalyticsOverview(db, actor));

    return json(404, { error: 'not_found' });
  } catch (err) {
    return errorStatus(err);
  }
}
