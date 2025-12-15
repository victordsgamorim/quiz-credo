import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { LocaleProvider, useLocale } from "../LocaleContext";

// Helper wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocaleProvider>{children}</LocaleProvider>
);

// eslint-disable-next-line max-lines-per-function
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

  it("should lock locale changes when lockLocaleChange is called", () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    act(() => {
      result.current.setLocale("en-UK");
    });

    expect(result.current.locale).toBe("en-UK");

    act(() => {
      result.current.lockLocaleChange();
    });

    expect(result.current.isLockedFromChange).toBe(true);

    // Try to change locale after lock
    act(() => {
      result.current.setLocale("es-BO");
    });

    // Locale should remain en-UK
    expect(result.current.locale).toBe("en-UK");
  });

  it("should load locale from localStorage on mount", () => {
    localStorage.setItem("app-locale", "es-BO");

    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.locale).toBe("es-BO");
    expect(result.current.t.common.loading).toBe("Cargando...");
  });

  it("should unlock locale changes when unlockLocaleChange is called", () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    // Lock the locale first
    act(() => {
      result.current.setLocale("en-UK");
      result.current.lockLocaleChange();
    });

    expect(result.current.isLockedFromChange).toBe(true);

    // Unlock the locale
    act(() => {
      result.current.unlockLocaleChange();
    });

    expect(result.current.isLockedFromChange).toBe(false);

    // Should be able to change locale again
    act(() => {
      result.current.setLocale("es-BO");
    });

    expect(result.current.locale).toBe("es-BO");
  });
});
