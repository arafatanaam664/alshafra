export type SocialProviderName = 'facebook' | 'telegram' | 'x' | 'instagram' | 'linkedin' | 'youtube';

export interface SocialPost {
  title: string;
  summary?: string;
  url: string;
  body?: string;
}

export interface SocialProvider {
  readonly name: SocialProviderName;
  publish(post: SocialPost, idempotencyKey: string): Promise<{ externalId: string }>;
}

export function socialIdempotencyKey(provider: SocialProviderName, documentId: string, templateVersion: string): string {
  return `social:${provider}:${documentId}:${templateVersion}`;
}
