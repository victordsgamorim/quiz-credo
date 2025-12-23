import type { Session } from "@supabase/supabase-js";

type CachedSession = {
  accessToken: string;
  expiresAt: number;
};

const AUTH_CACHE_KEY = "quiz-auth-session";
const SESSION_EXPIRY_BUFFER_SECONDS = 5 * 60;

const parseCachedSession = (raw: string): CachedSession | null => {
  try {
    const parsed = JSON.parse(raw) as CachedSession;
    if (!parsed?.accessToken || typeof parsed.expiresAt !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const isSessionValid = (expiresAt?: number): boolean => {
  if (!expiresAt) return false;

  const now = Math.floor(Date.now() / 1000);
  return expiresAt - now > SESSION_EXPIRY_BUFFER_SECONDS;
};

export const setCachedSession = (session: Session | null): void => {
  if (!session?.access_token || !session.expires_at) {
    clearCachedSession();
    return;
  }

  try {
    const payload: CachedSession = {
      accessToken: session.access_token,
      expiresAt: session.expires_at,
    };
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore localStorage errors
  }
};

export const getCachedSession = (): CachedSession | null => {
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;

    const parsed = parseCachedSession(raw);
    if (!parsed || !isSessionValid(parsed.expiresAt)) {
      localStorage.removeItem(AUTH_CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const clearCachedSession = (): void => {
  try {
    localStorage.removeItem(AUTH_CACHE_KEY);
  } catch {
    // Ignore localStorage errors
  }
};
