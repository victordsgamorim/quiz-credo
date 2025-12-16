import { CATEGORY_DEFINITIONS, type CategoryId } from "@/constants/categories";
import type { TranslationKeys } from "@/locales";

const VALID_CATEGORY_IDS = new Set<CategoryId>(CATEGORY_DEFINITIONS.map((category) => category.id));

export const isValidCategoryId = (value: string): value is CategoryId =>
  VALID_CATEGORY_IDS.has(value as CategoryId);

export const getCategoryLabel = (t: TranslationKeys, categoryId: string) => {
  if (isValidCategoryId(categoryId)) {
    return t.lobby.categoryNames[categoryId];
  }
  return categoryId;
};
