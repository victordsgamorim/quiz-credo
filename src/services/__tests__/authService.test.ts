/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { supabase } from "@/lib/supabase";

import { authenticateForQuizAccess, signOut } from "../authService";
import { getCachedSession, setCachedSession } from "../authSession";

// Mock the supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      refreshSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("authenticateForQuizAccess", () => {
    it("should reuse valid session without refreshing", async () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: {
          session: {
            expires_at: futureTimestamp,
            access_token: "valid-token",
            refresh_token: "refresh-token",
          } as never,
        },
        error: null,
      });

      await authenticateForQuizAccess();

      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
      expect(supabase.auth.refreshSession).not.toHaveBeenCalled();
      expect(getCachedSession()).toEqual({
        accessToken: "valid-token",
        expiresAt: futureTimestamp,
      });
    });

    it("should refresh session when token is close to expiration", async () => {
      const closeToExpiryTimestamp = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: {
          session: {
            expires_at: closeToExpiryTimestamp,
            access_token: "old-token",
            refresh_token: "refresh-token",
          } as never,
        },
        error: null,
      });

      vi.mocked(supabase.auth.refreshSession).mockResolvedValueOnce({
        data: {
          session: {
            expires_at: futureTimestamp,
            access_token: "new-token",
            refresh_token: "new-refresh-token",
          } as never,
        },
        error: null,
      });

      await authenticateForQuizAccess();

      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
      expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1);
      expect(getCachedSession()).toEqual({
        accessToken: "new-token",
        expiresAt: futureTimestamp,
      });
    });

    it("should throw when no session exists", async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      await expect(authenticateForQuizAccess()).rejects.toThrow(
        "Failed to authenticate for quiz access"
      );
      expect(getCachedSession()).toBeNull();
    });

    it("should throw when refresh fails", async () => {
      const closeToExpiryTimestamp = Math.floor(Date.now() / 1000) + 60;

      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: {
          session: {
            expires_at: closeToExpiryTimestamp,
            access_token: "old-token",
            refresh_token: "refresh-token",
          } as never,
        },
        error: null,
      });

      vi.mocked(supabase.auth.refreshSession).mockResolvedValueOnce({
        data: { session: null },
        error: { message: "Refresh failed" } as never,
      });

      await expect(authenticateForQuizAccess()).rejects.toThrow(
        "Failed to authenticate for quiz access"
      );
      expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1);
      expect(getCachedSession()).toBeNull();
    });
  });

  describe("signOut", () => {
    it("should sign out successfully and clear cached session", async () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600;
      setCachedSession({
        access_token: "cached-token",
        expires_at: futureTimestamp,
      } as never);

      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

      await signOut();

      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
      expect(getCachedSession()).toBeNull();
    });

    it("should not throw error when sign out fails", async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: { message: "Sign out failed" } as never,
      });

      await expect(signOut()).resolves.toBeUndefined();
      expect(getCachedSession()).toBeNull();
    });
  });
});
