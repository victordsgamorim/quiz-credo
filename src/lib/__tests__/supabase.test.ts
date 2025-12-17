import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock environment variables before importing supabase
vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key");

describe("supabase", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exports a supabase client instance", async () => {
    const { supabase } = await import("../supabase");
    expect(supabase).toBeDefined();
    expect(supabase).toBeTruthy();
  });

  it("has auth property", async () => {
    const { supabase } = await import("../supabase");
    expect(supabase).toHaveProperty("auth");
    expect(supabase.auth).toBeDefined();
  });

  it("has from method for database queries", async () => {
    const { supabase } = await import("../supabase");
    expect(supabase).toHaveProperty("from");
    expect(typeof supabase.from).toBe("function");
  });

  it("has storage property", async () => {
    const { supabase } = await import("../supabase");
    expect(supabase).toHaveProperty("storage");
    expect(supabase.storage).toBeDefined();
  });

  it("has channel method for realtime subscriptions", async () => {
    const { supabase } = await import("../supabase");
    expect(supabase).toHaveProperty("channel");
    expect(typeof supabase.channel).toBe("function");
  });

  it("has rpc method for calling database functions", async () => {
    const { supabase } = await import("../supabase");
    expect(supabase).toHaveProperty("rpc");
    expect(typeof supabase.rpc).toBe("function");
  });

  it("can create a query builder", async () => {
    const { supabase } = await import("../supabase");
    const queryBuilder = supabase.from("test_table");
    expect(queryBuilder).toBeDefined();
    expect(queryBuilder).toHaveProperty("select");
    expect(queryBuilder).toHaveProperty("insert");
    expect(queryBuilder).toHaveProperty("update");
    expect(queryBuilder).toHaveProperty("delete");
  });
});
