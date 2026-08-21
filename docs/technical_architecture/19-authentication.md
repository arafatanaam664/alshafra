# 19 — Authentication

## Split

```
auth.users          (Supabase Auth identity)
  1:1 optional
public.users        (domain: handle, reputation, status)
  1:1
public.profiles
```

`users.auth_user_id` unique. Creating a session without a domain row: first login **provisions** `users` (status active). Registration flag off: only invited staff get Auth users until `registration_enabled`.

## AuthProvider

```ts
interface AuthProvider {
  signInEmail(email: string): Promise<void>; // magic link
  signInGoogle(redirect: string): Promise<void>;
  signOut(): Promise<void>;
  getSession(request: Request): Promise<Session | null>;
}
```

Adapters: `SupabaseAuthProvider`. Future Apple/Facebook/X = more methods, same session.

## Session

HttpOnly Secure SameSite=Lax cookies (Supabase SSR cookie pattern on the BFF). Admin requires session. Public pages: no auth.

## MFA

Not in v1. Super Admin should use strong Google account. Document as future.

## Provisioning staff

Super Admin invites email in Supabase dashboard or admin “invite editor”. No public signup while flag off.

## OAuth (Google)

Google Cloud client ids in env. Redirect `https://alshafra.com/api/v1/auth/callback`.
