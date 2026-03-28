interface CacheEntry<T> {
  value: T
  timestamp: number
}

export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private readonly maxSize: number
  private readonly ttlMs: number

  constructor(maxSize: number, ttlMs: number) {
    this.maxSize = maxSize
    this.ttlMs = ttlMs
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key)
      return undefined
    }

    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)
    return entry.value
  }

  set(key: string, value: T): void {
    // Delete first to update insertion order
    this.cache.delete(key)

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, { value, timestamp: Date.now() })
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}
