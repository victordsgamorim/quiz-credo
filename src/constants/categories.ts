export const CATEGORY_DEFINITIONS = [
  { id: "geography" },
  { id: "mathematics" },
  { id: "history" },
  { id: "science" },
  { id: "art" },
  { id: "sports" },
  { id: "technology" },
  { id: "literature" },
  { id: "music" },
  { id: "cinema" },
  { id: "current-events" },
  { id: "mythology" },
  { id: "astronomy" },
  { id: "biology" },
  { id: "chemistry" },
  { id: "politics" },
  { id: "economics" },
  { id: "pop-culture" },
  { id: "languages" },
  { id: "inventions" },
] as const;

export type CategoryId = (typeof CATEGORY_DEFINITIONS)[number]["id"];

export const CATEGORY_IDS: CategoryId[] = CATEGORY_DEFINITIONS.map((category) => category.id);

export const CATEGORY_STORAGE_KEY = "channel-category-preferences";

export const DEFAULT_MAX_CATEGORY_SELECTIONS = 5;
export const DEFAULT_DISPLAYED_CATEGORIES = 10;
