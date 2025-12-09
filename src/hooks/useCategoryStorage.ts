import { useCallback } from "react";
import { CATEGORY_STORAGE_KEY } from "@/constants/categories";

export function useCategoryStorage() {
  const loadStoredCategories = useCallback((channelId: string | null): string[] => {
    if (!channelId) {
      return [];
    }
    try {
      const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      const stored = parsed?.[channelId];
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }, []);

  const persistCategories = useCallback((channelId: string, categories: string[]) => {
    try {
      const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (!categories.length) {
        delete parsed[channelId];
      } else {
        parsed[channelId] = categories;
      }
      if (Object.keys(parsed).length === 0) {
        localStorage.removeItem(CATEGORY_STORAGE_KEY);
      } else {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  const clearPersistedCategories = useCallback((channelId?: string | null) => {
    try {
      const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (!raw) {
        return;
      }
      if (!channelId) {
        localStorage.removeItem(CATEGORY_STORAGE_KEY);
        return;
      }
      const parsed = JSON.parse(raw);
      delete parsed[channelId];
      if (Object.keys(parsed).length === 0) {
        localStorage.removeItem(CATEGORY_STORAGE_KEY);
      } else {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  return {
    loadStoredCategories,
    persistCategories,
    clearPersistedCategories,
  };
}
