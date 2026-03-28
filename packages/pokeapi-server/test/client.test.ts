import { describe, it, expect } from 'vitest'
import { LRUCache } from '../src/api/cache.js'

describe('LRUCache', () => {
  it('stores and retrieves values', () => {
    const cache = new LRUCache<string>(10, 60000)
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('returns undefined for missing keys', () => {
    const cache = new LRUCache<string>(10, 60000)
    expect(cache.get('missing')).toBeUndefined()
  })

  it('evicts oldest entry when at capacity', () => {
    const cache = new LRUCache<string>(2, 60000)
    cache.set('a', '1')
    cache.set('b', '2')
    cache.set('c', '3') // should evict 'a'
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe('2')
    expect(cache.get('c')).toBe('3')
  })

  it('refreshes LRU order on access', () => {
    const cache = new LRUCache<string>(2, 60000)
    cache.set('a', '1')
    cache.set('b', '2')
    cache.get('a') // access 'a', making 'b' the oldest
    cache.set('c', '3') // should evict 'b'
    expect(cache.get('a')).toBe('1')
    expect(cache.get('b')).toBeUndefined()
    expect(cache.get('c')).toBe('3')
  })

  it('expires entries after TTL', async () => {
    const cache = new LRUCache<string>(10, 50)
    cache.set('key', 'value')
    expect(cache.get('key')).toBe('value')

    await new Promise((r) => setTimeout(r, 60))
    expect(cache.get('key')).toBeUndefined()
  })

  it('tracks size correctly', () => {
    const cache = new LRUCache<string>(10, 60000)
    expect(cache.size).toBe(0)
    cache.set('a', '1')
    expect(cache.size).toBe(1)
    cache.set('b', '2')
    expect(cache.size).toBe(2)
    cache.clear()
    expect(cache.size).toBe(0)
  })
})
