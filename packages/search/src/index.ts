export { normalizeArabic, tokenize } from './normalize';
export { DEFAULT_SYNONYMS, expandWithSynonyms, synonymMap } from './synonyms';
export { prepareQuery, typeBoost } from './pipeline';
export { levenshtein, fuzzyMatch } from './fuzzy';
export { CatalogSearchProvider, EDITORIAL_SUGGESTIONS, scoreDocument } from './catalog';
export {
  SEARCH_PAGE_SIZE,
  SEARCH_MAX_PAGE,
  type SearchDocument,
  type SearchQuery,
  type SearchHit,
  type SearchResult,
  type SearchProvider,
} from './types';
