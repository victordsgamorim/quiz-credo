import { describe, it, expect } from "vitest";

import { supabase } from "../supabase";

describe("supabase", () => {
  it("exports a supabase client instance", () => {
    expect(supabase).toBeDefined();
    expect(supabase).toBeTruthy();
  });

  it("has auth property", () => {
    expect(supabase).toHaveProperty("auth");
    expect(supabase.auth).toBeDefined();
  });

  it("has from method for database queries", () => {
    expect(supabase).toHaveProperty("from");
    expect(typeof supabase.from).toBe("function");
  });

  it("has storage property", () => {
    expect(supabase).toHaveProperty("storage");
    expect(supabase.storage).toBeDefined();
  });

  it("has channel method for realtime subscriptions", () => {
    expect(supabase).toHaveProperty("channel");
    expect(typeof supabase.channel).toBe("function");
  });

  it("has rpc method for calling database functions", () => {
    expect(supabase).toHaveProperty("rpc");
    expect(typeof supabase.rpc).toBe("function");
  });

  it("can create a query builder", () => {
    const queryBuilder = supabase.from("test_table");
    expect(queryBuilder).toBeDefined();
    expect(queryBuilder).toHaveProperty("select");
    expect(queryBuilder).toHaveProperty("insert");
    expect(queryBuilder).toHaveProperty("update");
    expect(queryBuilder).toHaveProperty("delete");
  });
});
