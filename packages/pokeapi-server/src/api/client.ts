import { LRUCache } from './cache.js'
import type {
  Pokemon,
  PokemonSpecies,
  PokemonType,
  Move,
  Ability,
  EvolutionChain,
  Item,
  NamedAPIResourceList,
  PokeApiConfig,
} from './types.js'

export class PokeApiClient {
  private cache: LRUCache<unknown>
  private config: PokeApiConfig

  constructor(config: PokeApiConfig) {
    this.config = config
    this.cache = new LRUCache(config.cacheMaxSize, config.cacheTtlMs)
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const url = `${this.config.baseUrl}${path}`
    const cached = this.cache.get(url) as T | undefined
    if (cached) return cached

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs)

    try {
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Not found: ${path}`)
        }
        throw new Error(`API error ${response.status}: ${response.statusText}`)
      }
      const data = (await response.json()) as T
      this.cache.set(url, data)
      return data
    } finally {
      clearTimeout(timeout)
    }
  }

  async getPokemon(nameOrId: string | number): Promise<Pokemon> {
    const id = String(nameOrId).toLowerCase()
    return this.fetchJson<Pokemon>(`/pokemon/${encodeURIComponent(id)}`)
  }

  async getSpecies(nameOrId: string | number): Promise<PokemonSpecies> {
    const id = String(nameOrId).toLowerCase()
    return this.fetchJson<PokemonSpecies>(`/pokemon-species/${encodeURIComponent(id)}`)
  }

  async getType(name: string): Promise<PokemonType> {
    return this.fetchJson<PokemonType>(`/type/${encodeURIComponent(name.toLowerCase())}`)
  }

  async getMove(nameOrId: string | number): Promise<Move> {
    const id = String(nameOrId).toLowerCase()
    return this.fetchJson<Move>(`/move/${encodeURIComponent(id)}`)
  }

  async getAbility(nameOrId: string | number): Promise<Ability> {
    const id = String(nameOrId).toLowerCase()
    return this.fetchJson<Ability>(`/ability/${encodeURIComponent(id)}`)
  }

  async getEvolutionChain(id: number): Promise<EvolutionChain> {
    return this.fetchJson<EvolutionChain>(`/evolution-chain/${id}`)
  }

  async getItem(nameOrId: string | number): Promise<Item> {
    const id = String(nameOrId).toLowerCase()
    return this.fetchJson<Item>(`/item/${encodeURIComponent(id)}`)
  }

  async getResourceList(
    endpoint: string,
    limit: number,
    offset: number,
  ): Promise<NamedAPIResourceList> {
    return this.fetchJson<NamedAPIResourceList>(`/${endpoint}?limit=${limit}&offset=${offset}`)
  }
}
