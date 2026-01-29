import type { KnowledgeEntry, SearchQuery, SearchResult } from '@sage/shared';

/**
 * Search provider interface for full-text and vector search.
 * Implementations: Postgres full-text, Elasticsearch, Pinecone, etc.
 */
export interface ISearchProvider {
  /**
   * Index a knowledge entry for search
   */
  index(entry: KnowledgeEntry): Promise<void>;

  /**
   * Index multiple entries in batch
   */
  indexBatch(entries: KnowledgeEntry[]): Promise<void>;

  /**
   * Remove an entry from the index
   */
  remove(entryId: string): Promise<void>;

  /**
   * Remove multiple entries from the index
   */
  removeBatch(entryIds: string[]): Promise<void>;

  /**
   * Perform a search query
   */
  search(query: SearchQuery): Promise<SearchResult>;

  /**
   * Perform a semantic/vector search
   */
  semanticSearch(
    embedding: number[],
    options?: SemanticSearchOptions
  ): Promise<SemanticSearchResult>;

  /**
   * Get search suggestions/autocomplete
   */
  suggest(
    prefix: string,
    options?: SuggestOptions
  ): Promise<Suggestion[]>;

  /**
   * Update an existing indexed entry
   */
  update(entry: KnowledgeEntry): Promise<void>;

  /**
   * Rebuild the entire search index
   */
  reindex(): Promise<void>;

  /**
   * Check search provider health
   */
  healthCheck(): Promise<boolean>;
}

export interface SemanticSearchOptions {
  userId: string;
  limit?: number;
  minScore?: number;
  filters?: SearchFilters;
}

export interface SearchFilters {
  tags?: string[];
  concepts?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SemanticSearchResult {
  entries: Array<{
    entry: KnowledgeEntry;
    score: number;
  }>;
  totalCount: number;
}

export interface SuggestOptions {
  userId: string;
  limit?: number;
  types?: SuggestionType[];
}

export type SuggestionType = 'entry' | 'concept' | 'tag';

export interface Suggestion {
  type: SuggestionType;
  value: string;
  displayText: string;
  score: number;
}
