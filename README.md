<p align="center">
  <img src="logo.png" alt="PokéAPI MCP Server" width="128" />
</p>

<h1 align="center">PokéAPI MCP Server</h1>

<p align="center">
  <strong>Give your AI assistant access to the entire Pokémon universe</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/pokeapi-mcp-server"><img src="https://img.shields.io/npm/v/pokeapi-mcp-server?color=cb3837&label=npm&logo=npm" alt="npm" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=bhayanak.pokeapi-mcp-extension"><img src="https://img.shields.io/visual-studio-marketplace/v/bhayanak.pokeapi-mcp-extension?color=007ACC&logo=visual-studio-code&label=VS%20Code" alt="VS Code" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/bhayanak/pokemon-mcp-server?color=blue" alt="license" /></a>
  <img src="https://img.shields.io/badge/MCP-compatible-blueviolet" alt="MCP" />
</p>

---

A **Model Context Protocol (MCP) server** in TypeScript that wraps [PokéAPI v2](https://pokeapi.co/docs/v2) — the largest Pokémon RESTful API (1300+ species, 900+ moves, 300+ abilities, 18 types). Ships as both an **npm package** and a **VS Code extension**.

## Packages

| Package | Description | Docs |
|---------|-------------|------|
| [`pokeapi-mcp-server`](packages/pokeapi-server/) | MCP server (npm/CLI) | [README →](packages/pokeapi-server/README.md) |
| [`pokeapi-mcp-extension`](packages/pokeapi-vscode-extension/) | VS Code extension | [README →](packages/pokeapi-vscode-extension/README.md) |

## Quick Start

### Option 1: VS Code Extension (recommended)

Install from the marketplace — the extension handles everything automatically:

```
ext install bhayanak.pokeapi-mcp-extension
```

VS Code provides built-in **start / stop / restart** controls. Your AI assistant gets access to all 12 tools immediately.

### Option 2: npm / CLI

```bash
npm install -g pokeapi-mcp-server
pokeapi-mcp-server
```

Or use with Claude Desktop:

```json
{
  "mcpServers": {
    "pokeapi": {
      "command": "npx",
      "args": ["-y", "pokeapi-mcp-server"]
    }
  }
}
```

## 12 MCP Tools

| Category | Tools | What They Do |
|----------|-------|-------------|
| **Pokémon** | `pokemon_get`, `pokemon_search` | Lookup & search by type/generation |
| **Types** | `pokemon_get_type`, `pokemon_type_matchup` | Type details & effectiveness calculator |
| **Moves** | `pokemon_get_move`, `pokemon_search_moves` | Move database & filtered search |
| **Abilities** | `pokemon_get_ability` | Ability effects & Pokémon lists |
| **Evolution** | `pokemon_get_evolution_chain` | Full evolution trees with conditions |
| **Species** | `pokemon_get_species` | Flavor text, habitat, egg groups |
| **Items** | `pokemon_get_item` | Item details, effects, categories |
| **Analysis** | `pokemon_compare`, `pokemon_type_coverage` | Side-by-side stats & team coverage |

## License

[MIT](LICENSE) © bhayanak

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run the MCP server (stdio mode)
cd packages/pokeapi-server && pnpm run dev
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `pokemon_get` | Get detailed Pokémon data (stats, types, abilities, moves) |
| `pokemon_search` | Search Pokémon by type, generation, or browse |
| `pokemon_get_type` | Get type details and damage relations |
| `pokemon_type_matchup` | Check type effectiveness |
| `pokemon_get_move` | Get move details (power, accuracy, effect) |
| `pokemon_search_moves` | Search moves by criteria |
| `pokemon_get_ability` | Get ability details |
| `pokemon_get_evolution_chain` | Get evolution chain with conditions |
| `pokemon_get_species` | Get species data (flavor text, habitat, catch rate) |
| `pokemon_get_item` | Get item details |
| `pokemon_compare` | Compare 2-4 Pokémon side-by-side |
| `pokemon_type_coverage` | Analyze team type coverage |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `POKEAPI_MCP_BASE_URL` | `https://pokeapi.co/api/v2` | API base URL |
| `POKEAPI_MCP_CACHE_TTL_MS` | `86400000` (24hr) | Cache TTL |
| `POKEAPI_MCP_CACHE_MAX_SIZE` | `500` | Max cache entries |
| `POKEAPI_MCP_TIMEOUT_MS` | `10000` | HTTP timeout |
| `POKEAPI_MCP_LANGUAGE` | `en` | Preferred language |

## Development

```bash
pnpm run typecheck   # TypeScript type checking
pnpm run lint        # ESLint with security rules
pnpm run test        # Run tests
pnpm run build       # Build all packages
```

## License

MIT
