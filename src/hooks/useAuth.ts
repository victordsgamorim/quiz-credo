import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabase";
import { signOut as signOutService } from "@/services/authService";
import { clearCachedSession, isSessionValid, setCachedSession } from "@/services/authSession";

import type { Session, User } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Get initial session
    void supabase.auth.getSession().then(({ data: { session } }) => {
      const hasValidSession = isSessionValid(session?.expires_at);
      if (session && hasValidSession) {
        setCachedSession(session);
      } else {
        clearCachedSession();
      }

      setAuthState({
        user: hasValidSession ? (session?.user ?? null) : null,
        session: hasValidSession ? session : null,
        isAuthenticated: hasValidSession,
        isLoading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasValidSession = isSessionValid(session?.expires_at);
      if (session && hasValidSession) {
        setCachedSession(session);
      } else {
        clearCachedSession();
      }

      setAuthState({
        user: hasValidSession ? (session?.user ?? null) : null,
        session: hasValidSession ? session : null,
        isAuthenticated: hasValidSession,
        isLoading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await signOutService();
  };

  return {
    ...authState,
    signOut,
  };
};
