import { MIN_ANSWER, MIN_BODY, MIN_TITLE } from './types';

const LINK_RE = /https?:\/\/|www\.|t\.me\/|wa\.me\/|bit\.ly\//i;

export function hasExternalLink(text: string): boolean {
  return LINK_RE.test(text);
}

export function assertPostLength(title: string, body: string): void {
  if (title.trim().length < MIN_TITLE) throw new Error('title_too_short');
  if (body.trim().length < MIN_BODY) throw new Error('body_too_short');
}

export function assertAnswerLength(body: string): void {
  if (body.trim().length < MIN_ANSWER) throw new Error('answer_too_short');
}

export function assertNewUserLinks(isNew: boolean, isTrusted: boolean, text: string): void {
  if ((isNew || !isTrusted) && hasExternalLink(text)) throw new Error('links_forbidden_for_new_user');
}

/** v1: never auto-index even if the score would pass. */
export function evaluateUgcIndexable(input: {
  ugcAutoIndex: boolean;
  status: string;
  title: string;
  body: string;
  answerCount: number;
  hidden: boolean;
}): boolean {
  if (!input.ugcAutoIndex) return false;
  if (input.hidden || input.status !== 'open') return false;
  if (input.title.trim().length < MIN_TITLE || input.body.trim().length < MIN_BODY) return false;
  if (input.answerCount < 1) return false;
  return false;
}

export function ugcRobots(): 'noindex, follow' {
  return 'noindex, follow';
}
