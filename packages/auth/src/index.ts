export interface UserIdentity {
  authUserId: string;
  email?: string;
}

export interface Session {
  identity: UserIdentity;
  expiresAt?: string;
}

export interface AuthProvider {
  getSession(request: Request): Promise<Session | null>;
  signInEmail(email: string): Promise<void>;
  signInGoogle(redirectTo: string): Promise<void>;
  signOut(): Promise<void>;
}

export function isServerOnlyAuth(): true {
  return true;
}

/** Staff admin authorization lives in `@alshafra/cms` (permissions + session). This port stays identity-only. */
