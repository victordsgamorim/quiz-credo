import { supabase } from "@/lib/supabase";

/**
 * Service credentials configuration
 * Exported for testing purposes
 */
export const credentials = {
  get email() {
    return import.meta.env.VITE_SUPABASE_EMAIL as string | undefined;
  },
  get password() {
    return import.meta.env.VITE_SUPABASE_PASSWORD as string | undefined;
  },
};

/**
 * Checks if session is valid and not expired
 *
 * @param expiresAt - Session expiration timestamp
 * @returns True if session is still valid
 */
const isSessionValid = (expiresAt: number | undefined): boolean => {
  if (!expiresAt) return false;

  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;

  return expiresAt - now > fiveMinutes;
};

/**
 * Attempts to refresh the current session
 *
 * @returns True if refresh was successful
 */
const tryRefreshSession = async (): Promise<boolean> => {
  const { data, error } = await supabase.auth.refreshSession();
  return !error && !!data.session;
};

/**
 * Signs in with service credentials
 */
const signInWithCredentials = async (): Promise<void> => {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new Error("Service credentials not configured");
  }

  await supabase.auth.signOut();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.session) {
    throw new Error("Failed to create session");
  }
};

/**
 * Authenticates with Supabase to get JWT token for accessing quiz schema
 * Handles token refresh if the current session is expired
 *
 * @returns Promise that resolves when authentication is successful
 */
export const authenticateForQuizAccess = async (): Promise<void> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If session exists and is valid, we're done
    if (session && isSessionValid(session.expires_at)) {
      return;
    }

    // Try to refresh if we have a session
    if (session) {
      const wasRefreshed = await tryRefreshSession();
      if (wasRefreshed) {
        return;
      }
      console.warn("[AuthService] Session expired and refresh failed, signing in again");
    }

    // Sign in with credentials
    await signInWithCredentials();
  } catch (error) {
    console.error("[AuthService] Authentication failed:", error);
    throw new Error("Failed to authenticate for quiz access");
  }
};

/**
 * Signs out from Supabase
 */
export const signOut = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("[AuthService] Sign out failed:", error);
  }
};
