# Documentation Architecture Proposal

How to structure, organize, and maximize the utility of downloaded documentation for both AI threads and human developers.

---

## Table of Contents

1. [Proposed Directory Structure](#1-proposed-directory-structure)
2. [Index and Navigation Documents](#2-index-and-navigation-documents)
3. [AI Context Documents](#3-ai-context-documents)
4. [Human Onboarding Documents](#4-human-onboarding-documents)
5. [Maintenance Documents](#5-maintenance-documents)
6. [Implementation Plan](#6-implementation-plan)

---

## 1. Proposed Directory Structure

```
docs/
├── _index/                          # Navigation & discovery
│   ├── MASTER_INDEX.md              # Complete searchable index
│   ├── QUICK_REFERENCE.md           # One-page cheat sheet
│   ├── DEPENDENCY_GRAPH.md          # Visual dependency relationships
│   └── SEARCH_TAGS.json             # Machine-readable tag index
│
├── _ai/                             # AI-specific context files
│   ├── CONTEXT_PRIMER.md            # First file AI should read
│   ├── CODEBASE_MAP.md              # File-by-file purpose guide
│   ├── DECISION_CONTEXT.md          # Why things are the way they are
│   ├── COMMON_TASKS.md              # How-to for frequent operations
│   ├── GOTCHAS.md                   # Known pitfalls and workarounds
│   └── PROMPT_TEMPLATES.md          # Effective prompts for this codebase
│
├── _human/                          # Human onboarding
│   ├── GETTING_STARTED.md           # Day-1 developer guide
│   ├── ARCHITECTURE_OVERVIEW.md     # Visual system overview
│   ├── GLOSSARY.md                  # Term definitions
│   ├── FAQ.md                       # Frequently asked questions
│   └── TROUBLESHOOTING.md           # Common issues and solutions
│
├── _meta/                           # Documentation about documentation
│   ├── FRESHNESS_LOG.md             # When each doc was captured
│   ├── UPDATE_PROCEDURES.md         # How to refresh docs
│   ├── PRIORITY_MATRIX.md           # Which docs matter most
│   └── KNOWN_GAPS.md                # What's missing or incomplete
│
├── core/                            # Core technology docs
│   ├── typescript/
│   │   ├── README.md                # Local overview + links
│   │   ├── handbook/                # Downloaded TypeScript handbook
│   │   ├── tsconfig-reference.md
│   │   └── version-5.9-release-notes.md
│   │
│   ├── react/
│   │   ├── README.md
│   │   ├── hooks-reference.md
│   │   ├── context-api.md
│   │   └── react-18-features.md
│   │
│   └── javascript/
│       ├── README.md
│       └── es6-features.md
│
├── database/                        # Database technology docs
│   ├── pglite/
│   │   ├── README.md
│   │   ├── getting-started.md
│   │   ├── extensions.md
│   │   ├── browser-usage.md
│   │   └── version-0.2.12-api.md
│   │
│   ├── postgresql/
│   │   ├── README.md
│   │   ├── sql-reference.md
│   │   ├── data-types.md
│   │   └── indexes.md
│   │
│   ├── pgvector/
│   │   ├── README.md
│   │   ├── hnsw-indexes.md
│   │   ├── distance-functions.md
│   │   └── performance-tuning.md
│   │
│   └── drizzle/
│       ├── README.md
│       ├── schema-declaration.md
│       ├── queries.md
│       ├── migrations.md
│       └── pglite-integration.md
│
├── llm-providers/                   # LLM SDK documentation
│   ├── _overview.md                 # Comparison of all providers
│   │
│   ├── openai/
│   │   ├── README.md
│   │   ├── chat-completions.md
│   │   ├── embeddings.md
│   │   ├── reasoning-models.md
│   │   ├── tool-use.md
│   │   └── sdk-v4.91-reference.md
│   │
│   ├── anthropic/
│   │   ├── README.md
│   │   ├── messages-api.md
│   │   ├── tool-use.md
│   │   ├── extended-thinking.md
│   │   ├── vision.md
│   │   └── sdk-v0.39-reference.md
│   │
│   ├── gemini/
│   │   ├── README.md
│   │   ├── generate-content.md
│   │   ├── embeddings.md
│   │   ├── function-calling.md
│   │   └── sdk-v0.24-reference.md
│   │
│   ├── claude-code/
│   │   ├── README.md
│   │   ├── installation.md
│   │   ├── sdk-mode.md
│   │   └── thinking-levels.md
│   │
│   └── [other-providers]/
│       └── README.md
│
├── ui/                              # UI library docs
│   ├── lexical/
│   │   ├── README.md
│   │   ├── concepts/
│   │   │   ├── editor-state.md
│   │   │   ├── nodes.md
│   │   │   └── commands.md
│   │   ├── react-integration.md
│   │   ├── plugins.md
│   │   └── custom-nodes.md
│   │
│   ├── radix-ui/
│   │   ├── README.md
│   │   ├── dialog.md
│   │   ├── dropdown-menu.md
│   │   ├── popover.md
│   │   └── tooltip.md
│   │
│   └── tanstack-query/
│       ├── README.md
│       ├── queries.md
│       └── mutations.md
│
├── protocols/                       # Protocol specifications
│   ├── mcp/
│   │   ├── README.md
│   │   ├── specification.md
│   │   ├── transports/
│   │   │   └── stdio.md
│   │   ├── tools.md
│   │   └── typescript-sdk.md
│   │
│   └── standards/
│       ├── json-rfc8259.md
│       ├── markdown-commonmark.md
│       ├── gfm-spec.md
│       └── uuid-rfc4122.md
│
├── ai-ml/                           # AI/ML library docs
│   ├── langchain/
│   │   ├── README.md
│   │   ├── text-splitters.md
│   │   ├── embeddings.md
│   │   └── rag-patterns.md
│   │
│   ├── tiktoken/
│   │   ├── README.md
│   │   ├── encodings.md
│   │   └── js-tiktoken-api.md
│   │
│   └── concepts/
│       ├── hnsw-algorithm.md
│       ├── cosine-similarity.md
│       ├── rag-explained.md
│       └── chunking-strategies.md
│
├── utilities/                       # Utility library docs
│   ├── zod/
│   │   ├── README.md
│   │   ├── basic-usage.md
│   │   ├── discriminated-unions.md
│   │   └── transforms.md
│   │
│   ├── vscode-diff/
│   │   └── README.md
│   │
│   ├── fuzzysort/
│   │   └── README.md
│   │
│   └── [other-utils]/
│       └── README.md
│
├── platform/                        # Platform docs
│   ├── obsidian/
│   │   ├── README.md
│   │   ├── plugin-api.md
│   │   ├── vault-api.md
│   │   ├── views.md
│   │   ├── settings.md
│   │   └── sample-plugin-patterns.md
│   │
│   ├── electron/
│   │   ├── README.md
│   │   └── process-model.md
│   │
│   └── webassembly/
│       └── README.md
│
├── build/                           # Build tool docs
│   ├── esbuild/
│   │   ├── README.md
│   │   ├── api.md
│   │   └── plugins.md
│   │
│   ├── eslint/
│   │   └── README.md
│   │
│   └── jest/
│       └── README.md
│
└── archived/                        # Old versions (for reference)
    ├── pglite-0.1.x/
    ├── drizzle-0.38/
    └── react-17/
```

---

## 2. Index and Navigation Documents

### MASTER_INDEX.md
```markdown
# Master Documentation Index

## How to Use This Index
- **Ctrl+F** to search for any term
- Each entry links to local documentation
- Tags help AI systems find relevant docs

## By Category

### Database Layer
| Topic | Location | Tags | Priority |
|-------|----------|------|----------|
| PGlite Setup | [docs/database/pglite/README.md] | #database #pglite #wasm | P0 |
| Vector Search | [docs/database/pgvector/hnsw-indexes.md] | #vectors #hnsw #search | P0 |
| Drizzle Queries | [docs/database/drizzle/queries.md] | #orm #sql #queries | P1 |

### LLM Integration
| Topic | Location | Tags | Priority |
|-------|----------|------|----------|
| OpenAI SDK | [docs/llm-providers/openai/README.md] | #llm #openai #api | P0 |
| Anthropic SDK | [docs/llm-providers/anthropic/README.md] | #llm #anthropic #claude | P0 |
| Tool Calling | [docs/llm-providers/openai/tool-use.md] | #tools #functions | P1 |

[... complete index ...]

## By Use Case

### "I need to add a new LLM provider"
1. [docs/llm-providers/_overview.md] - Understand provider patterns
2. [docs/_ai/COMMON_TASKS.md#add-provider] - Step-by-step guide
3. [API_REFERENCE.md#llm-provider-apis] - Interface to implement

### "I need to fix a database issue"
1. [docs/database/pglite/README.md] - PGlite basics
2. [docs/database/drizzle/migrations.md] - Migration system
3. [docs/_ai/GOTCHAS.md#database] - Known issues

[... more use cases ...]
```

### QUICK_REFERENCE.md
```markdown
# Quick Reference Card

## One-Liners

### Database
```typescript
// Get database instance
const db = await getDatabaseManager()

// Vector similarity search
const results = await vectorManager.performSimilaritySearch(queryVector, model, { minSimilarity: 0.7, limit: 10 })

// Run migration
await db.migrate()
```

### LLM Calls
```typescript
// Get provider
const provider = getProviderClient({ settings, providerId: 'openai' })

// Stream response
const stream = await provider.streamResponse(model, request)
for await (const chunk of stream) { /* ... */ }

// Get embedding
const embedding = await provider.getEmbedding('text-embedding-3-small', text)
```

### Settings
```typescript
// Read settings
const { settings } = useSettings()

// Update settings
setSettings({ ...settings, chatModelId: 'new-model' })
```

[... more one-liners ...]

## File Locations

| What | Where |
|------|-------|
| Main plugin entry | src/main.ts |
| LLM providers | src/core/llm/*.ts |
| Database manager | src/database/DatabaseManager.ts |
| Settings schema | src/settings/schema/setting.types.ts |
| React components | src/components/**/*.tsx |
| Migrations | src/settings/schema/migrations/*.ts |

## Version Matrix

| Dependency | Version | Docs Location |
|------------|---------|---------------|
| PGlite | 0.2.12 | docs/database/pglite/ |
| Drizzle | 0.39.0 | docs/database/drizzle/ |
| Lexical | 0.17.1 | docs/ui/lexical/ |
| OpenAI SDK | 4.91.1 | docs/llm-providers/openai/ |
| Anthropic SDK | 0.39.0 | docs/llm-providers/anthropic/ |
```

### SEARCH_TAGS.json
```json
{
  "version": "1.0.0",
  "generated": "2024-12-18",
  "tags": {
    "#database": [
      "docs/database/pglite/README.md",
      "docs/database/drizzle/README.md",
      "docs/database/pgvector/README.md"
    ],
    "#llm": [
      "docs/llm-providers/openai/README.md",
      "docs/llm-providers/anthropic/README.md"
    ],
    "#vectors": [
      "docs/database/pgvector/README.md",
      "docs/ai-ml/concepts/hnsw-algorithm.md"
    ],
    "#react": [
      "docs/core/react/README.md",
      "docs/ui/lexical/react-integration.md"
    ],
    "#troubleshooting": [
      "docs/_ai/GOTCHAS.md",
      "docs/_human/TROUBLESHOOTING.md"
    ]
  },
  "keywords": {
    "embedding": ["#vectors", "#llm", "#database"],
    "similarity": ["#vectors", "#database"],
    "streaming": ["#llm"],
    "migration": ["#database", "#settings"],
    "plugin": ["#obsidian", "#platform"]
  }
}
```

---

## 3. AI Context Documents

### CONTEXT_PRIMER.md
```markdown
# AI Context Primer

**READ THIS FIRST** when starting a new session on this codebase.

## What This Project Is

Obsidian Smart Composer HomeHeart is an Obsidian plugin that provides:
- AI-powered chat interface within Obsidian
- RAG (Retrieval-Augmented Generation) over vault contents
- Support for 16 LLM providers
- MCP tool integration
- Template system for prompts

## Critical Architecture Facts

1. **Database**: PGlite (PostgreSQL in WebAssembly) stored as `.smtcmp_vector_db.tar.gz`
2. **Vector Search**: pgvector extension with HNSW indexes
3. **State Management**: React Context (no Redux)
4. **Editor**: Lexical for rich text (not Draft.js)
5. **Validation**: Zod for all schemas
6. **Build**: esbuild (not Webpack)

## Key Files to Understand

| Priority | File | Purpose |
|----------|------|---------|
| P0 | src/main.ts | Plugin entry point |
| P0 | src/database/DatabaseManager.ts | Database initialization |
| P0 | src/core/llm/manager.ts | LLM provider factory |
| P0 | src/settings/schema/setting.types.ts | Settings schema |
| P1 | src/components/chat-view/Chat.tsx | Main UI component |
| P1 | src/core/rag/ragEngine.ts | RAG orchestration |

## Where to Find Documentation

```
docs/
├── _ai/           ← You are here. AI-specific guides.
├── _index/        ← Searchable indexes and quick reference
├── database/      ← PGlite, Drizzle, pgvector docs
├── llm-providers/ ← OpenAI, Anthropic, etc. SDK docs
├── ui/            ← Lexical, Radix UI docs
└── platform/      ← Obsidian plugin API docs
```

## Common Questions

### "How do I add a new feature?"
→ See [COMMON_TASKS.md]

### "Why was X decision made?"
→ See [ADR.md] for architecture decisions
→ See [DECISION_CONTEXT.md] for implementation decisions

### "What are the known issues?"
→ See [GOTCHAS.md]

## Before Making Changes

1. Check [ADR.md] to understand why things are the way they are
2. Check [GOTCHAS.md] for known pitfalls
3. Check [COMMON_TASKS.md] for step-by-step guides
4. Run `npm run type:check` before committing
```

### CODEBASE_MAP.md
```markdown
# Codebase Map

Annotated file-by-file guide to the source code.

## Directory Overview

```
src/
├── main.ts                    # Plugin lifecycle (onload, onunload)
├── constants.ts               # Global constants
│
├── components/                # React UI components
│   ├── chat-view/            # Chat interface
│   │   ├── Chat.tsx          # Main chat container (COMPLEX - 500+ lines)
│   │   ├── ChatUserInput.tsx # Message input with Lexical
│   │   └── ...
│   ├── apply-view/           # Diff/apply view
│   ├── settings/             # Settings UI
│   └── common/               # Reusable components
│
├── contexts/                  # React Context providers
│   ├── SettingsContext.tsx   # Settings state
│   ├── DatabaseContext.tsx   # DB connection
│   ├── RAGContext.tsx        # RAG engine
│   └── McpContext.tsx        # MCP servers
│
├── core/                      # Core business logic
│   ├── llm/                  # LLM provider implementations
│   │   ├── base.ts           # Abstract base class
│   │   ├── manager.ts        # Factory function
│   │   ├── openai.ts         # OpenAI provider
│   │   ├── anthropic.ts      # Anthropic provider
│   │   └── ...               # 14 more providers
│   ├── mcp/                  # MCP integration
│   │   └── mcpManager.ts     # Server management
│   └── rag/                  # RAG system
│       ├── ragEngine.ts      # Query orchestration
│       └── embedding.ts      # Embedding client factory
│
├── database/                  # Data persistence
│   ├── DatabaseManager.ts    # PGlite initialization
│   ├── schema.ts             # Drizzle schema
│   ├── modules/
│   │   ├── vector/           # Vector storage
│   │   └── template/         # Template storage (legacy)
│   └── json/                 # JSON file storage
│       ├── chat/             # Chat persistence
│       └── template/         # Template persistence
│
├── settings/                  # Settings management
│   ├── settings.ts           # Load/save logic
│   └── schema/
│       ├── setting.types.ts  # Zod schema
│       └── migrations/       # v0→v1→...→v13
│
├── types/                     # TypeScript type definitions
│   ├── chat.ts               # Chat message types
│   ├── provider.types.ts     # LLM provider types
│   ├── chat-model.types.ts   # Chat model types
│   └── ...
│
├── utils/                     # Utility functions
│   ├── chat/                 # Chat utilities
│   │   ├── promptGenerator.ts # Build LLM prompts
│   │   └── responseGenerator.ts # Handle streaming
│   ├── llm/                  # LLM utilities
│   └── ...
│
└── hooks/                     # React hooks
    └── useChatHistory.ts     # Chat persistence hook
```

## Complexity Indicators

| File | Lines | Complexity | Notes |
|------|-------|------------|-------|
| Chat.tsx | 500+ | HIGH | State machine, many effects |
| DatabaseManager.ts | 200+ | MEDIUM | WASM loading, migrations |
| anthropic.ts | 300+ | MEDIUM | Message translation |
| promptGenerator.ts | 400+ | HIGH | RAG integration |
| mcpManager.ts | 350+ | HIGH | Server lifecycle |

## Data Flow Paths

### User Message → LLM Response
```
ChatUserInput → Chat.handleUserMessageSubmit
  → PromptGenerator.compileUserMessagePrompt
    → RAGEngine.processQuery (if vault search)
  → ResponseGenerator.run
    → getProviderClient → provider.streamResponse
  → setChatMessages (state update)
```

### Settings Change
```
SettingsTab UI → setSettings
  → saveSettings (to data.json)
  → context propagation
  → component re-renders
```
```

### COMMON_TASKS.md
```markdown
# Common Tasks Guide

Step-by-step instructions for frequent development tasks.

---

## Add a New LLM Provider

### 1. Define provider type
**File**: `src/types/provider.types.ts`
```typescript
// Add to discriminated union
z.object({
  type: z.literal('my-provider'),
  id: z.string(),
  baseUrl: z.string().optional(),
  apiKey: z.string().optional(),
})
```

### 2. Create provider class
**File**: `src/core/llm/myProvider.ts`
```typescript
export class MyProvider extends BaseLLMProvider<Extract<LLMProvider, { type: 'my-provider' }>> {
  async generateResponse(...) { /* ... */ }
  async streamResponse(...) { /* ... */ }
  async getEmbedding(...) { /* ... */ }
}
```

### 3. Register in factory
**File**: `src/core/llm/manager.ts`
```typescript
case 'my-provider':
  return new MyProvider(provider)
```

### 4. Add default provider config
**File**: `src/settings/schema/migrations/migrationUtils.ts`
```typescript
// Add to DEFAULT_PROVIDERS
```

### 5. Add to settings UI
**File**: `src/components/settings/sections/ProvidersSection.tsx`

### 6. Create settings migration
**File**: `src/settings/schema/migrations/{N}_to_{N+1}.ts`

---

## Add a New Chat Model

### 1. Add to chat model schema
**File**: `src/types/chat-model.types.ts`

### 2. Add default model config
**File**: `src/settings/schema/migrations/migrationUtils.ts`

### 3. Create migration

---

## Modify Database Schema

### 1. Update schema
**File**: `src/database/schema.ts`

### 2. Generate migration
```bash
npm run migrate:compile
```

### 3. Test migration
```bash
npm test -- --grep migration
```

---

## Add a New Setting

### 1. Add to Zod schema
**File**: `src/settings/schema/setting.types.ts`

### 2. Add default value with .catch()
```typescript
myNewSetting: z.boolean().catch(false)
```

### 3. Create migration for existing users
**File**: `src/settings/schema/migrations/{N}_to_{N+1}.ts`

### 4. Add UI control
**File**: `src/components/settings/sections/...`

---

## Debug PGlite Issues

### Check database state
```typescript
const db = await getDatabaseManager()
const stats = await db.getVectorManager().getEmbeddingStats()
console.log(stats)
```

### Force reindex
```typescript
await ragEngine.updateVaultIndex({ reindexAll: true })
```

### Check for corruption
```typescript
// In console
await db.vacuum()
```
```

### GOTCHAS.md
```markdown
# Known Gotchas and Pitfalls

Things that will bite you if you don't know about them.

---

## Database

### PGlite IN_NODE Check
**Problem**: PGlite checks if running in Node.js and behaves differently.
**Solution**: esbuild.config.mjs has shimPlugin that injects `const process = {}`.
**Symptom**: "process is not defined" or weird initialization errors.
**Fix**: Ensure shimPlugin is in esbuild config.

### Drizzle Browser Migrations
**Problem**: Drizzle's migrate() doesn't work in browser.
**Solution**: Using undocumented internal API (see DatabaseManager.ts:168).
**Reference**: https://github.com/drizzle-team/drizzle-orm/discussions/2532
**Risk**: May break in future Drizzle versions.

### pgvector Dimension Mismatch
**Problem**: Can't query vectors with different dimensions.
**Solution**: Partial indexes per dimension (see schema.ts).
**Symptom**: "dimension mismatch" errors.

---

## LLM Providers

### Anthropic Tool Call Format
**Problem**: Anthropic uses different tool call format than OpenAI.
**Solution**: Custom translation in anthropic.ts.
**Watch out**: tool_use blocks, not function_call.

### OpenAI Streaming Token Usage
**Problem**: Usage stats only in final chunk.
**Solution**: Accumulate chunks, extract usage from last one.

### Ollama CORS Issues
**Problem**: Ollama server has CORS restrictions.
**Solution**: NoStainlessOpenAI client bypasses stainless headers.

### Claude Code CLI Path
**Problem**: Claude CLI must be in PATH.
**Solution**: Installation adds to user PATH, but new terminals needed.
**Symptom**: "claude not found" errors.

---

## React

### Lexical State Serialization
**Problem**: Can't store Lexical EditorState directly.
**Solution**: Serialize to JSON via editor.getEditorState().toJSON().
**Watch out**: Don't store EditorState objects in React state.

### Context Initialization Order
**Problem**: Contexts depend on each other.
**Solution**: Strict provider nesting order (see ARCHITECTURE.md).
**Symptom**: "Cannot read property of null" for context values.

### React Query Cache
**Problem**: Stale data after settings change.
**Solution**: Invalidate queries after settings update.

---

## Build

### Lexical Clipboard External
**Problem**: @lexical/clipboard has build issues.
**Solution**: Mark as external in esbuild config.
**Symptom**: Build errors about clipboard module.

### Source Maps in Production
**Problem**: Source maps expose source code.
**Solution**: Disabled for production builds.

---

## Settings

### Migration Must Be Idempotent
**Problem**: Migrations can run multiple times.
**Solution**: Always check if change already applied.
**Pattern**: `if (!data.newField) { data.newField = default }`

### Zod .catch() for Defaults
**Problem**: Missing fields cause parse errors.
**Solution**: Use .catch(defaultValue) for all optional fields.

---

## MCP

### Mobile Disabled
**Problem**: MCP requires Node.js subprocess spawning.
**Solution**: Disabled on mobile via Platform.isDesktop check.
**Location**: mcpManager.ts line 27.

### Tool Name Delimiter
**Problem**: Tool names must be unique across servers.
**Solution**: Prefix with server name: `serverName__toolName`.
**Parsing**: tool-name-utils.ts.
```

---

## 4. Human Onboarding Documents

### GETTING_STARTED.md
```markdown
# Getting Started - Developer Guide

Welcome! This guide will get you up and running in 30 minutes.

## Prerequisites

- Node.js 18+
- Git
- VS Code (recommended)
- Obsidian (for testing)

## Quick Setup

```bash
# Clone and install
git clone https://github.com/[repo]/obsidian-smart-composer-homeheart.git
cd obsidian-smart-composer-homeheart
npm install

# Start development
npm run dev

# In another terminal, link to test vault
# (see DEVELOPMENT.md for vault setup)
```

## First Steps

1. **Read the architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
2. **Understand the decisions**: [ADR.md](ADR.md)
3. **Browse the codebase map**: [docs/_ai/CODEBASE_MAP.md](docs/_ai/CODEBASE_MAP.md)

## Development Workflow

1. Make changes in `src/`
2. esbuild auto-rebuilds
3. Reload Obsidian (Cmd+R / Ctrl+R)
4. Test your changes

## Key Commands

```bash
npm run dev          # Start dev build with watch
npm run build        # Production build
npm run type:check   # TypeScript check
npm run lint:check   # ESLint + Prettier check
npm run test         # Run Jest tests
```

## Where to Find Things

| I want to... | Look in... |
|--------------|------------|
| Add a feature | [docs/_ai/COMMON_TASKS.md] |
| Fix a bug | [docs/_ai/GOTCHAS.md] |
| Understand the code | [docs/_ai/CODEBASE_MAP.md] |
| Look up an API | [API_REFERENCE.md] |
| Check a dependency | [DOCUMENTATION_REFERENCES.md] |

## Getting Help

- Check [FAQ.md](docs/_human/FAQ.md)
- Check [TROUBLESHOOTING.md](docs/_human/TROUBLESHOOTING.md)
- Open an issue on GitHub
```

### GLOSSARY.md
```markdown
# Glossary

Technical terms used in this project.

---

## A

**ADR (Architecture Decision Record)**
: Document capturing a significant architectural decision with context and rationale.

## C

**Chunk**
: A segment of text created by splitting a larger document for embedding.

**Claude Code**
: Anthropic's CLI tool for AI-assisted development, used as an LLM provider.

## D

**Discriminated Union**
: TypeScript pattern using a literal type field to distinguish between union members.

**Drizzle**
: TypeScript ORM used for database operations.

## E

**Embedding**
: A vector representation of text, used for similarity search.

## H

**HNSW (Hierarchical Navigable Small World)**
: Graph-based algorithm for approximate nearest neighbor search.

## L

**Lexical**
: Meta's rich text editor framework.

## M

**MCP (Model Context Protocol)**
: Protocol for connecting LLMs to external tools and data sources.

**Mentionable**
: A file, folder, block, URL, or image that can be referenced in chat.

## P

**PGlite**
: PostgreSQL compiled to WebAssembly for browser/Electron use.

**pgvector**
: PostgreSQL extension for vector similarity search.

## R

**RAG (Retrieval-Augmented Generation)**
: Technique of retrieving relevant context before generating LLM responses.

## S

**stdio**
: Standard input/output streams, used for MCP server communication.

## Z

**Zod**
: TypeScript-first schema validation library.
```

---

## 5. Maintenance Documents

### FRESHNESS_LOG.md
```markdown
# Documentation Freshness Log

When each documentation file was captured and from which version.

| Document | Captured | Source Version | Upstream URL | Next Review |
|----------|----------|----------------|--------------|-------------|
| PGlite docs | 2024-12-18 | 0.2.12 | pglite.dev/docs | 2025-03-18 |
| Drizzle docs | 2024-12-18 | 0.39.0 | orm.drizzle.team | 2025-03-18 |
| OpenAI SDK | 2024-12-18 | 4.91.1 | platform.openai.com | 2025-01-18 |
| Anthropic SDK | 2024-12-18 | 0.39.0 | docs.anthropic.com | 2025-01-18 |
| Lexical docs | 2024-12-18 | 0.17.1 | lexical.dev | 2025-03-18 |
| React docs | 2024-12-18 | 18.3.1 | react.dev | 2025-06-18 |
| TypeScript docs | 2024-12-18 | 5.9.3 | typescriptlang.org | 2025-06-18 |
| MCP spec | 2024-12-18 | 1.9.0 | modelcontextprotocol.io | 2025-02-18 |

## Review Schedule

- **Monthly**: LLM provider SDKs (APIs change frequently)
- **Quarterly**: Database, UI libraries
- **Bi-annually**: Core languages (TypeScript, React)

## Update Procedure

See [UPDATE_PROCEDURES.md](UPDATE_PROCEDURES.md)
```

### PRIORITY_MATRIX.md
```markdown
# Documentation Priority Matrix

Which docs are most critical for different scenarios.

## Priority Levels

- **P0**: Must read before any work
- **P1**: Read before related tasks
- **P2**: Reference as needed
- **P3**: Deep dives, edge cases

## By Document

| Document | Priority | Reason |
|----------|----------|--------|
| CONTEXT_PRIMER.md | P0 | First read for AI |
| ARCHITECTURE.md | P0 | System overview |
| ADR.md | P0 | Decision rationale |
| CODEBASE_MAP.md | P0 | Navigate code |
| COMMON_TASKS.md | P1 | How-to guides |
| GOTCHAS.md | P1 | Avoid pitfalls |
| API_REFERENCE.md | P1 | Type definitions |
| COMPONENT_SPEC.md | P1 | React components |
| DATABASE_SPEC.md | P1 | Data layer |
| FLOW_DIAGRAMS.md | P2 | Visual flows |
| PRD.md | P2 | Product context |
| GLOSSARY.md | P2 | Term lookup |
| FAQ.md | P2 | Quick answers |
| FRESHNESS_LOG.md | P3 | Maintenance |

## By Scenario

### "I'm debugging a crash"
1. GOTCHAS.md (P0)
2. CODEBASE_MAP.md (P0)
3. Relevant library docs (P1)

### "I'm adding a new feature"
1. COMMON_TASKS.md (P0)
2. ADR.md (P0)
3. API_REFERENCE.md (P1)

### "I'm reviewing a PR"
1. ADR.md (P0)
2. GOTCHAS.md (P0)
3. COMPONENT_SPEC.md (P1)

### "I'm onboarding"
1. CONTEXT_PRIMER.md (P0)
2. ARCHITECTURE.md (P0)
3. GETTING_STARTED.md (P0)
4. CODEBASE_MAP.md (P1)
```

---

## 6. Implementation Plan

### Phase 1: Core Structure (Day 1)
```bash
# Create directory structure
mkdir -p docs/{_index,_ai,_human,_meta}
mkdir -p docs/{core,database,llm-providers,ui,protocols,ai-ml,utilities,platform,build}

# Create index documents
touch docs/_index/{MASTER_INDEX.md,QUICK_REFERENCE.md,SEARCH_TAGS.json}

# Create AI context documents
touch docs/_ai/{CONTEXT_PRIMER.md,CODEBASE_MAP.md,COMMON_TASKS.md,GOTCHAS.md}

# Create human onboarding
touch docs/_human/{GETTING_STARTED.md,GLOSSARY.md,FAQ.md,TROUBLESHOOTING.md}

# Create maintenance docs
touch docs/_meta/{FRESHNESS_LOG.md,UPDATE_PROCEDURES.md,PRIORITY_MATRIX.md}
```

### Phase 2: Download Critical Docs (Day 2-3)
Priority order:
1. PGlite + pgvector (unique, not well-known)
2. Drizzle (ORM specifics)
3. Obsidian plugin API
4. MCP specification
5. Lexical editor
6. LLM provider SDKs

### Phase 3: Create Navigation (Day 4)
1. Build MASTER_INDEX.md
2. Create QUICK_REFERENCE.md
3. Generate SEARCH_TAGS.json
4. Cross-link all documents

### Phase 4: Write Context Docs (Day 5)
1. Expand CONTEXT_PRIMER.md
2. Detail CODEBASE_MAP.md
3. Complete COMMON_TASKS.md
4. Document GOTCHAS.md

### Phase 5: Validate and Test (Day 6)
1. Have new developer follow GETTING_STARTED.md
2. Test AI with CONTEXT_PRIMER.md
3. Verify all links work
4. Fill gaps identified

---

## Automation Opportunities

### Doc Update Script
```bash
#!/bin/bash
# update-docs.sh - Refresh documentation from upstream

echo "Updating documentation..."

# Check versions
current_pglite=$(npm list @electric-sql/pglite --json | jq -r '.dependencies["@electric-sql/pglite"].version')

# Compare with logged version
logged_pglite=$(grep "PGlite" docs/_meta/FRESHNESS_LOG.md | awk '{print $4}')

if [ "$current_pglite" != "$logged_pglite" ]; then
  echo "PGlite updated: $logged_pglite → $current_pglite"
  echo "Fetching new docs..."
  # curl/wget commands here
fi

# Update freshness log
date=$(date +%Y-%m-%d)
sed -i "s/PGlite docs.*/PGlite docs | $date | $current_pglite | .../" docs/_meta/FRESHNESS_LOG.md
```

### Link Checker
```bash
#!/bin/bash
# check-links.sh - Verify all documentation links

find docs/ -name "*.md" -exec grep -oP '\[.*?\]\(.*?\)' {} \; | \
  grep -oP '\(.*?\)' | \
  tr -d '()' | \
  while read link; do
    if [[ $link == http* ]]; then
      curl -s -o /dev/null -w "%{http_code}" "$link" | grep -q "200" || echo "BROKEN: $link"
    else
      [ -f "$link" ] || echo "MISSING: $link"
    fi
  done
```

---

## Summary

This architecture provides:

1. **For AI threads**: CONTEXT_PRIMER.md as the first read, with CODEBASE_MAP.md and GOTCHAS.md for orientation
2. **For humans**: GETTING_STARTED.md for day-1, with progressive depth through indexes
3. **For maintenance**: FRESHNESS_LOG.md tracks currency, UPDATE_PROCEDURES.md enables refresh
4. **For discovery**: MASTER_INDEX.md and SEARCH_TAGS.json enable finding anything

The key principle: **Every document has a clear purpose and audience, with explicit navigation paths between related content.**
