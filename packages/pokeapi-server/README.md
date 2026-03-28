<p align="center">
  <img src="../../logo.png" alt="PokéAPI MCP Server" width="128" />
</p>

<h1 align="center">PokéAPI MCP Server</h1>

<p align="center">
  <strong>Model Context Protocol server for <a href="https://pokeapi.co">PokéAPI</a> — giving AI assistants access to the entire Pokémon universe</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/pokeapi-mcp-server"><img src="https://img.shields.io/npm/v/pokeapi-mcp-server?color=cb3837&label=npm&logo=npm" alt="npm version" /></a>
  <a href="https://github.com/bhayanak/pokemon-mcp-server/blob/main/LICENSE"><img src="https://img.shields.io/github/license/bhayanak/pokemon-mcp-server?color=blue" alt="license" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen?logo=node.js" alt="node version" />
  <img src="https://img.shields.io/badge/MCP-compatible-blueviolet?logo=data:image/svg+xml;base64," alt="MCP compatible" />
</p>

---

## Overview

A TypeScript MCP server that wraps the [PokéAPI v2 REST API](https://pokeapi.co/docs/v2), providing **12 structured tools** for AI assistants (Claude, GitHub Copilot, etc.) to query Pokémon data across all 9 generations.

- **No API key required** — PokéAPI is free and open
- **Smart caching** — LRU cache with configurable TTL (default 24h)
- **Full type safety** — TypeScript types for all API responses
- **Formatted output** — Stat bars, type emojis, evolution trees

## Installation

### npm

```bash
npm install -g pokeapi-mcp-server
```

### From source

```bash
git clone https://github.com/bhayanak/pokemon-mcp-server.git
cd pokemon-mcp-server/packages/pokeapi-server
pnpm install
pnpm run build
```

## Quick Start

### stdio (default)

```bash
pokeapi-mcp-server
```

### With Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

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

### With VS Code (Copilot)

Install the companion [VS Code extension](../pokeapi-vscode-extension/) for automatic MCP server management with start/stop/restart controls.

## Tools (12)

### Pokémon Lookup

| Tool | Description |
|------|-------------|
| `pokemon_get` | Get detailed Pokémon info — stats, types, abilities, moves |
| `pokemon_search` | Search Pokémon by type, generation, or ability |

### Type System

| Tool | Description |
|------|-------------|
| `pokemon_get_type` | Get type details — damage relations, Pokémon with that type |
| `pokemon_type_matchup` | Calculate type effectiveness (supports dual types) |

### Moves & Abilities

| Tool | Description |
|------|-------------|
| `pokemon_get_move` | Get move details — power, accuracy, PP, effects |
| `pokemon_search_moves` | Search moves by type, damage class, power range |
| `pokemon_get_ability` | Get ability details — effects, Pokémon with that ability |

### Evolution & Species

| Tool | Description |
|------|-------------|
| `pokemon_get_evolution_chain` | Full evolution tree with triggers and conditions |
| `pokemon_get_species` | Species data — flavor text, habitat, egg groups, catch rate |

### Items

| Tool | Description |
|------|-------------|
| `pokemon_get_item` | Get item details — effect, category, cost |

### Team Analysis

| Tool | Description |
|------|-------------|
| `pokemon_compare` | Compare 2–4 Pokémon side-by-side (stats, types, abilities) |
| `pokemon_type_coverage` | Analyze team type coverage and weaknesses |

## Configuration

All settings via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `POKEAPI_MCP_BASE_URL` | `https://pokeapi.co/api/v2` | API base URL |
| `POKEAPI_MCP_CACHE_TTL_MS` | `86400000` (24h) | Cache TTL in milliseconds |
| `POKEAPI_MCP_CACHE_MAX_SIZE` | `500` | Max LRU cache entries |
| `POKEAPI_MCP_TIMEOUT_MS` | `10000` | HTTP request timeout (ms) |
| `POKEAPI_MCP_LANGUAGE` | `en` | Language for names/descriptions |

## Example Output

```
#025 Pikachu — Electric ⚡
"Mouse Pokémon" | Gen I | Height: 0.4m | Weight: 6.0kg

Base Stats (Total: 320)
  HP: 35       ████░░░░░░░░░░░
  Attack: 55   ████████░░░░░░░
  Defense: 40  █████░░░░░░░░░░
  Sp. Atk: 50  ███████░░░░░░░░
  Sp. Def: 50  ███████░░░░░░░░
  Speed: 90    ████████████░░░

Abilities: Static, Lightning Rod (hidden)
```

## License

[MIT](../../LICENSE) © bhayanak
