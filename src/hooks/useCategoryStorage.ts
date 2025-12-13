import { useCallback } from "react";

import { CATEGORY_STORAGE_KEY } from "@/constants/categories";

type CategoryStorage = Record<string, string[]>;

/*
 * Hook for managing category selections persistence in localStorage.
 */
export function useCategoryStorage() {
  const loadStoredCategories = useCallback((channelId: string | null): string[] => {
    return readCategories(channelId);
  }, []);

  const persistCategories = useCallback((channelId: string, categories: string[]) => {
    persistCategorySelection(channelId, categories);
  }, []);

  const clearPersistedCategories = useCallback((channelId?: string | null) => {
    clearCategorySelection(channelId);
  }, []);

  return {
    loadStoredCategories,
    persistCategories,
    clearPersistedCategories,
  };
}

const readCategories = (channelId: string | null): string[] => {
  if (!channelId) {
    return [];
  }
  try {
    const parsed = readCategoryStorage();
    const stored = parsed[channelId];
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const persistCategorySelection = (channelId: string, categories: string[]) => {
  try {
    const parsed = readCategoryStorage();
    if (!categories.length) {
      delete parsed[channelId];
    } else {
      parsed[channelId] = categories;
    }
    writeCategoryStorage(parsed);
  } catch {
    // ignore
  }
};

const clearCategorySelection = (channelId?: string | null) => {
  try {
    if (!channelId) {
      localStorage.removeItem(CATEGORY_STORAGE_KEY);
      return;
    }
    const parsed = readCategoryStorage();
    delete parsed[channelId];
    writeCategoryStorage(parsed);
  } catch {
    // ignore
  }
};

const readCategoryStorage = (): CategoryStorage => {
  const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as CategoryStorage) : {};
};

const writeCategoryStorage = (data: CategoryStorage) => {
  if (Object.keys(data).length === 0) {
    localStorage.removeItem(CATEGORY_STORAGE_KEY);
    return;
  }
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(data));
};
