import type { DocumentStatus } from '@alshafra/content';
import { hasPermission, type Actor } from './permissions';

const TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  idea: ['draft', 'archived'],
  draft: ['review', 'archived'],
  review: ['draft', 'scheduled', 'published'],
  scheduled: ['published', 'draft'],
  published: ['unpublished', 'archived'],
  unpublished: ['draft', 'published', 'archived'],
  archived: ['draft'],
};

export function allowedTransitions(from: DocumentStatus): DocumentStatus[] {
  return TRANSITIONS[from] ?? [];
}

export function canTransition(from: DocumentStatus, to: DocumentStatus): boolean {
  return allowedTransitions(from).includes(to);
}

/** Who may perform a transition. Author may only submit draft → review. */
export function actorCanTransition(actor: Actor | null, from: DocumentStatus, to: DocumentStatus): boolean {
  if (!actor || !canTransition(from, to)) return false;
  if (actor.roles.includes('super_admin') || actor.roles.includes('admin')) return true;
  if (to === 'published' || to === 'unpublished' || (from === 'review' && to === 'scheduled')) {
    return hasPermission(actor, 'documents.publish');
  }
  if (from === 'draft' && to === 'review') {
    return hasPermission(actor, 'documents.create') || hasPermission(actor, 'documents.update');
  }
  return hasPermission(actor, 'documents.update') || hasPermission(actor, 'documents.create');
}

export function assertTransition(actor: Actor | null, from: DocumentStatus, to: DocumentStatus): void {
  if (!actorCanTransition(actor, from, to)) {
    const err = new Error(`invalid_transition:${from}->${to}`);
    err.name = 'WorkflowError';
    throw err;
  }
}
