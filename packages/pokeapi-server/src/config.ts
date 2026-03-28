import type { PokeApiConfig } from './api/types.js'

export function loadConfig(): PokeApiConfig {
  return {
    baseUrl: process.env.POKEAPI_MCP_BASE_URL ?? 'https://pokeapi.co/api/v2',
    cacheTtlMs: parseInt(process.env.POKEAPI_MCP_CACHE_TTL_MS ?? '86400000', 10),
    cacheMaxSize: parseInt(process.env.POKEAPI_MCP_CACHE_MAX_SIZE ?? '500', 10),
    timeoutMs: parseInt(process.env.POKEAPI_MCP_TIMEOUT_MS ?? '10000', 10),
    language: process.env.POKEAPI_MCP_LANGUAGE ?? 'en',
  }
}
