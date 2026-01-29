/**
 * Cache provider interface for caching data.
 * Implementations: Redis, in-memory, etc.
 */
export interface ICacheProvider {
  /**
   * Get a value from the cache
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in the cache
   */
  set<T>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<void>;

  /**
   * Delete a value from the cache
   */
  delete(key: string): Promise<boolean>;

  /**
   * Check if a key exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get multiple values
   */
  mget<T>(keys: string[]): Promise<(T | null)[]>;

  /**
   * Set multiple values
   */
  mset<T>(
    entries: Array<{ key: string; value: T }>,
    options?: CacheOptions
  ): Promise<void>;

  /**
   * Delete multiple keys
   */
  mdelete(keys: string[]): Promise<number>;

  /**
   * Get all keys matching a pattern
   */
  keys(pattern: string): Promise<string[]>;

  /**
   * Clear all cache entries (use with caution)
   */
  flush(): Promise<void>;

  /**
   * Get time-to-live for a key
   */
  ttl(key: string): Promise<number>;

  /**
   * Update expiration time for a key
   */
  expire(key: string, ttlSeconds: number): Promise<boolean>;

  /**
   * Close the cache connection
   */
  close(): Promise<void>;
}

export interface CacheOptions {
  ttl?: number; // seconds
  nx?: boolean; // only set if not exists
  xx?: boolean; // only set if exists
}
