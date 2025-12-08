export const CATEGORY_OPTIONS = [
  'Geografia',
  'Matemática',
  'História',
  'Ciências',
  'Arte',
  'Esportes',
  'Tecnologia',
  'Literatura',
  'Música',
  'Cinema',
  'Atualidades',
  'Mitologia',
  'Astronomia',
  'Biologia',
  'Química',
  'Política',
  'Economia',
  'Cultura Pop',
  'Idiomas',
  'Invenções'
] as const;

export type CategoryOption = typeof CATEGORY_OPTIONS[number];

export const CATEGORY_STORAGE_KEY = 'channel-category-preferences';

export const DEFAULT_MAX_CATEGORY_SELECTIONS = 5;
export const DEFAULT_DISPLAYED_CATEGORIES = 10;
