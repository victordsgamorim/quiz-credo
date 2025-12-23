import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";

if (!process.env.VITE_SUPABASE_URL) {
  vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
}
if (!process.env.VITE_SUPABASE_ANON_KEY) {
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key");
}

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Mock ResizeObserver for tests (required by Radix UI components)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
