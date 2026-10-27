import { supabase } from "@/lib/supabase";

import { clearCachedSession, isSessionValid, setCachedSession } from "./authSession";

/**
 * Attempts to refresh the current session
 *
 * @returns True if refresh was successful
 */
export const tryRefreshSession = async (): Promise<boolean> => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) {
    return false;
  }

  if (!isSessionValid(data.session.expires_at)) {
    return false;
  }

  setCachedSession(data.session);
  return true;
};

/**
 * Validates the existing Supabase session to access the quiz schema
 * Attempts a refresh when the current token is expired
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
      setCachedSession(session);
      return;
    }

    // Try to refresh even if getSession returns null.
    const wasRefreshed = await tryRefreshSession();
    if (wasRefreshed) {
      return;
    }
    if (session) {
      console.warn("[AuthService] Session expired and refresh failed");
    } else {
      console.warn("[AuthService] Session missing and refresh failed");
    }
    clearCachedSession();
    throw new Error("Missing or expired session");
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
  } finally {
    clearCachedSession();
  }
};
