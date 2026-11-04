import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { LocaleProvider, useLocale } from "../LocaleContext";

// Helper wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocaleProvider>{children}</LocaleProvider>
);

describe("LocaleContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should provide default locale (pt-BR)", () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.locale).toBe("pt-BR");
    expect(result.current.t).toBeDefined();
    expect(result.current.t.common.loading).toBe("Carregando...");
  });

  it("should change locale to en-UK", () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    act(() => {
      result.current.setLocale("en-UK");
    });

    expect(result.current.locale).toBe("en-UK");
    expect(result.current.t.common.loading).toBe("Loading...");
  });

  it("should change locale to es-BO", () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    act(() => {
      result.current.setLocale("es-BO");
    });

    expect(result.current.locale).toBe("es-BO");
    expect(result.current.t.common.loading).toBe("Cargando...");
  });

  it("should persist locale in localStorage", () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    act(() => {
      result.current.setLocale("en-UK");
    });

    expect(localStorage.getItem("app-locale")).toBe("en-UK");
  });

  it("changes the language at any time, even on a device a room locked before", () => {
    // Joining a room used to lock the language, under this key
    localStorage.setItem("locale-locked", "true");
    const { result } = renderHook(() => useLocale(), { wrapper });

    act(() => {
      result.current.setLocale("es-BO");
    });

    expect(result.current.locale).toBe("es-BO");
    expect(localStorage.getItem("app-locale")).toBe("es-BO");
  });

  it("should load locale from localStorage on mount", () => {
    localStorage.setItem("app-locale", "es-BO");

    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.locale).toBe("es-BO");
    expect(result.current.t.common.loading).toBe("Cargando...");
  });
});
