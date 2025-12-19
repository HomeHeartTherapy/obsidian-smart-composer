# AI Context Primer

**READ THIS FIRST** when starting a new session on this codebase.

---

## What This Project Is

**Obsidian Smart Composer HomeHeart** is an Obsidian plugin that provides:
- AI-powered chat interface within Obsidian
- RAG (Retrieval-Augmented Generation) over vault contents
- Support for **16 LLM providers** (including Claude Code CLI for Max/Pro subscribers)
- MCP (Model Context Protocol) tool integration
- Template system for prompt reuse

**Fork of**: [glowingjade/obsidian-smart-composer](https://github.com/glowingjade/obsidian-smart-composer)

---

## Critical Architecture Facts

| Component | Technology | Key Insight |
|-----------|------------|-------------|
| **Database** | PGlite 0.2.12 | PostgreSQL in WebAssembly, stored as `.smtcmp_vector_db.tar.gz` |
| **Vector Search** | pgvector + HNSW | Partial indexes per dimension (128-1792) |
| **ORM** | Drizzle 0.39 | Type-safe, uses undocumented browser migration API |
| **State** | React Context | No Redux - 9 nested context providers |
| **Editor** | Lexical 0.17 | JSON serialization, NOT Draft.js |
| **Validation** | Zod 3.23 | Discriminated unions for providers/models |
| **Build** | esbuild 0.17 | Custom shimPlugin for PGlite WASM |
| **Settings** | JSON + Migrations | Currently at v13, migration chain from v0 |

---

## Key Files to Understand

### Priority 0 (Must Know)
| File | Purpose |
|------|---------|
| `src/main.ts` | Plugin entry point, lifecycle |
| `src/database/DatabaseManager.ts` | PGlite initialization, WASM loading |
| `src/core/llm/manager.ts` | LLM provider factory (16 providers) |
| `src/settings/schema/setting.types.ts` | Zod settings schema |

### Priority 1 (Important)
| File | Purpose |
|------|---------|
| `src/components/chat-view/Chat.tsx` | Main chat UI (500+ lines, complex) |
| `src/core/rag/ragEngine.ts` | RAG query orchestration |
| `src/core/mcp/mcpManager.ts` | MCP server lifecycle |
| `src/database/schema.ts` | Drizzle schema with pgvector |

---

## Where to Find Documentation

```
Project Root:
├── ARCHITECTURE.md        # System architecture with diagrams
├── ADR.md                 # Architecture Decision Records (15 decisions)
├── API_REFERENCE.md       # Type definitions, service APIs
├── COMPONENT_SPEC.md      # React component documentation
├── DATABASE_SPEC.md       # PGlite, pgvector, JSON storage
├── FLOW_DIAGRAMS.md       # User flows, sequence diagrams
├── PRD.md                 # Product requirements
├── DOCUMENTATION_REFERENCES.md  # Links to all external docs
│
docs/
├── _ai/                   # YOU ARE HERE - AI context files
├── _index/                # Searchable indexes
├── _human/                # Human onboarding
├── _meta/                 # Maintenance info
├── database/              # PGlite, Drizzle, pgvector docs
├── llm-providers/         # OpenAI, Anthropic SDK docs
└── ...
```

---

## Data Storage Locations

| Data | Location | Format |
|------|----------|--------|
| Vector embeddings | `.smtcmp_vector_db.tar.gz` | PGlite compressed archive |
| Chat history | `.smtcmp_json_db/chats/*.json` | JSON files |
| Templates | `.smtcmp_json_db/templates/*.json` | JSON files |
| Settings | `data.json` (Obsidian plugin data) | JSON |

---

## LLM Providers Supported

| Provider | Type | Notes |
|----------|------|-------|
| OpenAI | API | Embeddings, reasoning models |
| Anthropic | API | Extended thinking support |
| Gemini | API | Function calling |
| Groq | API | Fast inference |
| Claude Code | CLI | Uses Max/Pro subscription, no API key |
| Ollama | Local | Custom base URL |
| LM Studio | Local | OpenAI-compatible |
| Azure OpenAI | API | Requires deployment config |
| Mistral | API | |
| Perplexity | API | Web search integration |
| DeepSeek | API | |
| OpenRouter | API | Multi-provider gateway |
| Morph | API | |
| OpenAI-compatible | API | Generic endpoint |

---

## Common Questions

### "How do I add a new feature?"
See [COMMON_TASKS.md](COMMON_TASKS.md) for step-by-step guides.

### "Why was X decision made?"
See [ADR.md](../ADR.md) for 15 documented architecture decisions.

### "What are the known issues?"
See [GOTCHAS.md](GOTCHAS.md) for pitfalls and workarounds.

### "Where are the type definitions?"
See [API_REFERENCE.md](../API_REFERENCE.md) for 90+ type definitions.

---

## Before Making Changes

1. **Check ADR.md** - Understand why things are the way they are
2. **Check GOTCHAS.md** - Avoid known pitfalls
3. **Check COMMON_TASKS.md** - Follow established patterns
4. **Run `npm run type:check`** - TypeScript validation
5. **Run `npm run lint:check`** - ESLint + Prettier

---

## Quick Commands

```bash
npm run dev          # Development build with watch
npm run build        # Production build
npm run type:check   # TypeScript check
npm run lint:check   # Lint check
npm run test         # Run Jest tests
```

---

## Context for Specific Tasks

### Working on Database
- Read: `DATABASE_SPEC.md`, `docs/database/pglite/`, `GOTCHAS.md#database`
- Key files: `DatabaseManager.ts`, `schema.ts`, `VectorManager.ts`

### Working on LLM Integration
- Read: `API_REFERENCE.md#llm-provider-apis`, `docs/llm-providers/`
- Key files: `manager.ts`, `base.ts`, specific provider file

### Working on UI
- Read: `COMPONENT_SPEC.md`, `docs/ui/lexical/`
- Key files: `Chat.tsx`, `ChatUserInput.tsx`, `LexicalContentEditable.tsx`

### Working on Settings
- Read: `setting.types.ts`, migration files
- Pattern: Add to schema with `.catch()`, create migration

---

*Last Updated: December 2024*
