# 31 — Social Adapters

```ts
interface SocialProvider {
  readonly name: SocialProviderName;
  connect(input: OAuthInput): Promise<Account>;
  refresh(account: Account): Promise<Account>;
  publish(post: SocialPost, idempotencyKey: string): Promise<{ external_id: string; permalink?: string }>;
  unpublish?(external_id: string): Promise<void>;
  validate(account: Account): Promise<boolean>;
}
```

Implement later: Facebook, Telegram, X. Stubs throw `not_implemented`.

Telegram uses bot token (not user password). X/Facebook OAuth.

Adapters live in `packages/social/adapters/*`. Domain only sees the interface.
