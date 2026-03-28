export interface NamedAPIResource {
  name: string
  url: string
}

export interface NamedAPIResourceList {
  count: number
  next: string | null
  previous: string | null
  results: NamedAPIResource[]
}

export interface PokemonStat {
  stat: NamedAPIResource
  effort: number
  base_stat: number
}

export interface PokemonAbility {
  ability: NamedAPIResource
  is_hidden: boolean
  slot: number
}

export interface PokemonTypeSlot {
  slot: number
  type: NamedAPIResource
}

export interface PokemonMove {
  move: NamedAPIResource
  version_group_details: {
    level_learned_at: number
    move_learn_method: NamedAPIResource
    version_group: NamedAPIResource
  }[]
}

export interface PokemonSprites {
  front_default: string | null
  front_shiny: string | null
  back_default: string | null
  back_shiny: string | null
}

export interface Pokemon {
  id: number
  name: string
  base_experience: number
  height: number
  weight: number
  abilities: PokemonAbility[]
  types: PokemonTypeSlot[]
  stats: PokemonStat[]
  moves: PokemonMove[]
  sprites: PokemonSprites
  species: NamedAPIResource
}

export interface FlavorText {
  flavor_text: string
  language: NamedAPIResource
  version: NamedAPIResource
}

export interface Genus {
  genus: string
  language: NamedAPIResource
}

export interface PokemonSpecies {
  id: number
  name: string
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  gender_rate: number
  capture_rate: number
  base_happiness: number
  growth_rate: NamedAPIResource
  egg_groups: NamedAPIResource[]
  color: NamedAPIResource
  habitat: NamedAPIResource | null
  generation: NamedAPIResource
  evolution_chain: { url: string }
  flavor_text_entries: FlavorText[]
  genera: Genus[]
}

export interface TypeRelations {
  double_damage_from: NamedAPIResource[]
  double_damage_to: NamedAPIResource[]
  half_damage_from: NamedAPIResource[]
  half_damage_to: NamedAPIResource[]
  no_damage_from: NamedAPIResource[]
  no_damage_to: NamedAPIResource[]
}

export interface PokemonType {
  id: number
  name: string
  damage_relations: TypeRelations
  pokemon: { pokemon: NamedAPIResource; slot: number }[]
  generation: NamedAPIResource
}

export interface VerboseEffect {
  effect: string
  short_effect: string
  language: NamedAPIResource
}

export interface Move {
  id: number
  name: string
  accuracy: number | null
  power: number | null
  pp: number
  priority: number
  type: NamedAPIResource
  damage_class: NamedAPIResource
  effect_entries: VerboseEffect[]
  effect_chance: number | null
  generation: NamedAPIResource
  learned_by_pokemon: NamedAPIResource[]
}

export interface AbilityEffectEntry {
  effect: string
  short_effect: string
  language: NamedAPIResource
}

export interface AbilityPokemon {
  is_hidden: boolean
  slot: number
  pokemon: NamedAPIResource
}

export interface Ability {
  id: number
  name: string
  is_main_series: boolean
  generation: NamedAPIResource
  effect_entries: AbilityEffectEntry[]
  pokemon: AbilityPokemon[]
}

export interface EvolutionDetail {
  trigger: NamedAPIResource
  item: NamedAPIResource | null
  min_level: number | null
  min_happiness: number | null
  time_of_day: string
  held_item: NamedAPIResource | null
  known_move: NamedAPIResource | null
  known_move_type: NamedAPIResource | null
  location: NamedAPIResource | null
}

export interface ChainLink {
  is_baby: boolean
  species: NamedAPIResource
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

export interface EvolutionChain {
  id: number
  chain: ChainLink
}

export interface ItemEffectEntry {
  effect: string
  short_effect: string
  language: NamedAPIResource
}

export interface Item {
  id: number
  name: string
  cost: number
  category: NamedAPIResource
  effect_entries: ItemEffectEntry[]
  sprites: { default: string | null }
  fling_power: number | null
  fling_effect: NamedAPIResource | null
}

export interface PokeApiConfig {
  baseUrl: string
  cacheTtlMs: number
  cacheMaxSize: number
  timeoutMs: number
  language: string
}
