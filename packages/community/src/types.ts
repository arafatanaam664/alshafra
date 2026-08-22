export type QuestionStatus = 'open' | 'closed' | 'hidden';
export type VoteTarget = 'question' | 'answer' | 'comment';
export type ModerationTarget = 'question' | 'answer' | 'comment' | 'user' | 'document';

export interface CommunityMember {
  userId: string;
  email: string;
  displayName: string;
  handle: string | null;
  isTrusted: boolean;
  isNew: boolean;
  status: string;
}

export interface QuestionRecord {
  id: string;
  authorId: string | null;
  title: string;
  slug: string;
  path: string;
  body: string;
  status: QuestionStatus;
  indexable: boolean;
  robots: 'noindex, follow';
  createdAt?: string;
}

export interface AnswerRecord {
  id: string;
  questionId: string;
  authorId: string | null;
  body: string;
  isAccepted: boolean;
}

export const MIN_TITLE = 12;
export const MIN_BODY = 40;
export const MIN_ANSWER = 40;
export const NEW_USER_DAYS = 14;
