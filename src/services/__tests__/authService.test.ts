/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      refreshSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Import the mocked supabase after mocking
import { supabase } from "@/lib/supabase";

import * as authService from "../authService";
import { authenticateForQuizAccess, signOut } from "../authService";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock credentials object to return test credentials
    Object.defineProperty(authService.credentials, "email", {
      get: () => "test@example.com",
      configurable: true,
    });
    Object.defineProperty(authService.credentials, "password", {
      get: () => "test-password",
      configurable: true,
    });
  });

  describe("authenticateForQuizAccess", () => {
    it("should reuse valid session without re-authenticating", async () => {
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
      expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
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
      expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should sign in when no session exists", async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          session: {
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            access_token: "new-token",
            refresh_token: "new-refresh-token",
          } as never,
          user: {} as never,
        },
        error: null,
      });

      await authenticateForQuizAccess();

      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: expect.any(String),
        password: expect.any(String),
      });
    });

    it("should sign in when refresh fails", async () => {
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

      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          session: {
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            access_token: "new-token",
            refresh_token: "new-refresh-token",
          } as never,
          user: {} as never,
        },
        error: null,
      });

      await authenticateForQuizAccess();

      expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(1);
    });

    it("should throw error when sign in fails", async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { session: null, user: null },
        error: { message: "Invalid credentials" } as never,
      });

      await expect(authenticateForQuizAccess()).rejects.toThrow(
        "Failed to authenticate for quiz access"
      );
    });
  });

  describe("signOut", () => {
    it("should sign out successfully", async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

      await signOut();

      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it("should not throw error when sign out fails", async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: { message: "Sign out failed" } as never,
      });

      // Should not throw - error is caught and logged
      await expect(signOut()).resolves.toBeUndefined();
    });
  });
});
