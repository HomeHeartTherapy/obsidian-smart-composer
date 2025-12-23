# Architecture Decision Records (ADRs)

This document captures the significant architectural decisions made for the Obsidian Smart Composer HomeHeart plugin, including the context, alternatives considered, and rationale for each choice.

**Version**: 1.0.0
**Last Updated**: December 2024
**Format**: MADR (Markdown Architectural Decision Records)

---

## Table of Contents

1. [ADR-001: Database Engine - PGlite](#adr-001-database-engine---pglite)
2. [ADR-002: Vector Search - pgvector with HNSW](#adr-002-vector-search---pgvector-with-hnsw)
3. [ADR-003: ORM - Drizzle](#adr-003-orm---drizzle)
4. [ADR-004: State Management - React Context](#adr-004-state-management---react-context)
5. [ADR-005: Rich Text Editor - Lexical](#adr-005-rich-text-editor---lexical)
6. [ADR-006: LLM Provider Architecture](#adr-006-llm-provider-architecture)
7. [ADR-007: Settings Storage - JSON with Versioned Migrations](#adr-007-settings-storage---json-with-versioned-migrations)
8. [ADR-008: Chat and Template Storage - JSON Files](#adr-008-chat-and-template-storage---json-files)
9. [ADR-009: MCP Transport - stdio](#adr-009-mcp-transport---stdio)
10. [ADR-010: Build System - esbuild](#adr-010-build-system---esbuild)
11. [ADR-011: Text Chunking - RecursiveCharacterTextSplitter](#adr-011-text-chunking---recursivecharactertextsplitter)
12. [ADR-012: Token Counting - js-tiktoken](#adr-012-token-counting---js-tiktoken)
13. [ADR-013: Schema Validation - Zod](#adr-013-schema-validation---zod)
14. [ADR-014: Diff Algorithm - vscode-diff](#adr-014-diff-algorithm---vscode-diff)
15. [ADR-015: Fuzzy Search - fuzzysort](#adr-015-fuzzy-search---fuzzysort)
16. [ADR-016: Console Debug Logging](#adr-016-console-debug-logging-for-model-verification)
17. [ADR-017: Extended Thinking Variants](#adr-017-extended-thinking-variants-for-anthropic-api)
18. [ADR-018: Two-Row UI Layout](#adr-018-two-row-ui-layout-for-chat-input)
19. [ADR-019: Database Independence](#adr-019-database-independence-power-composer-vs-smart-composer)

---

## ADR-001: Database Engine - PGlite

### Status
**Accepted**

### Context
The plugin requires a database for storing vector embeddings with similarity search capability. The database must:
- Run entirely within Obsidian (Electron/browser environment)
- Support vector operations with HNSW indexing
- Persist data in the vault folder
- Work offline without external services

### Decision
Use **PGlite** (PostgreSQL compiled to WebAssembly) version 0.2.12.

```json
"@electric-sql/pglite": "0.2.12"
```

### Rationale
PGlite was chosen because:
1. **Full PostgreSQL compatibility** - Supports transactions, foreign keys, complex queries, and extensions
2. **pgvector extension support** - Enables HNSW indexing for fast vector similarity search
3. **Browser/Electron compatible** - Runs entirely in WebAssembly without a server
4. **Persistent storage** - Exports to compressed tarball (.smtcmp_vector_db.tar.gz)
5. **Offline-first** - No network calls required for database operations

### Alternatives Considered

#### SQLite (better-sqlite3 or sql.js)
**Why NOT chosen:**
- No native vector search extension equivalent to pgvector
- Would require implementing similarity search manually (slow linear scan)
- sql.js (WASM version) lacks the vector extension ecosystem
- better-sqlite3 is native Node.js module, doesn't work in Electron renderer

#### Traditional PostgreSQL Server
**Why NOT chosen:**
- Requires external service running alongside Obsidian
- Violates the "works offline" requirement
- Complex installation for end users
- Network latency for every query
- Cannot be bundled with the plugin

#### IndexedDB / Dexie.js
**Why NOT chosen:**
- No SQL query language (key-value only)
- No vector similarity search capability
- Would require building HNSW index from scratch
- Limited query expressiveness for complex operations
- No transaction isolation guarantees

#### LevelDB / RocksDB
**Why NOT chosen:**
- No SQL capability (key-value stores)
- Would need custom vector index implementation
- Less familiar to developers than SQL
- No complex join operations

#### Milvus / Pinecone / Weaviate (Vector Databases)
**Why NOT chosen:**
- All require external cloud services
- Violate offline-first requirement
- Add monthly costs for users
- Introduce network latency
- Privacy concerns (vault data leaves device)

### Implementation Notes
The esbuild configuration includes a custom shimPlugin to make PGlite work in Electron:
```javascript
// PGlite checks: typeof process === 'object' && process.versions.node
// The shim injects: const process = {} to force browser mode
```

### Consequences
- **Positive**: Full SQL power with vector search in a single embedded database
- **Positive**: No external dependencies or services required
- **Negative**: Larger bundle size (~8MB for WASM + extension)
- **Negative**: Cold start latency when loading WASM module

---

## ADR-002: Vector Search - pgvector with HNSW

### Status
**Accepted**

### Context
Vector similarity search is required for RAG (Retrieval-Augmented Generation) to find relevant vault content. The search must:
- Handle embeddings of varying dimensions (128-1792)
- Return results in sub-second time for thousands of chunks
- Support cosine similarity distance metric

### Decision
Use **pgvector** extension with **HNSW (Hierarchical Navigable Small World)** indexes, creating partial indexes for each supported dimension.

```sql
CREATE INDEX embeddings_embedding_768_index
ON embeddings
USING hnsw ((embedding::vector(768)) vector_cosine_ops)
WHERE dimension = 768;
```

### Rationale
HNSW with pgvector was chosen because:
1. **Logarithmic search time** - O(log n) vs O(n) linear scan
2. **PostgreSQL native** - Integrated with PGlite, single query execution
3. **Proven algorithm** - HNSW is industry standard for ANN (Approximate Nearest Neighbor)
4. **Dimension flexibility** - Partial indexes allow multiple embedding dimensions
5. **Cosine similarity** - Standard metric for text embeddings

### Alternatives Considered

#### IVFFlat Indexing (pgvector)
**Why NOT chosen:**
- Slower query performance than HNSW for our dataset sizes
- Requires tuning number of lists parameter
- Less accurate for small-to-medium datasets
- HNSW provides better recall at similar latency

#### Linear Scan (No Index)
**Why NOT chosen:**
- O(n) complexity - unacceptable for large vaults
- Would cause UI freezing on search
- Query times grow linearly with vault size
- Not viable for real-time RAG queries

#### Milvus / Pinecone / Weaviate
**Why NOT chosen:**
- Require external cloud services (see ADR-001)
- Cannot embed in Obsidian plugin
- Privacy and offline concerns
- Additional infrastructure costs

#### ChromaDB (In-Process Vector DB)
**Why NOT chosen:**
- Less mature than pgvector (newer project)
- Python-native, JavaScript bindings less developed
- Would require separate database alongside PGlite
- Larger combined footprint

#### Annoy (Spotify)
**Why NOT chosen:**
- No SQL integration (separate library)
- Optimized for static datasets (costly updates)
- Would need to maintain two databases
- More complex sync between SQL data and vector index

#### FAISS (Facebook)
**Why NOT chosen:**
- Python-native library, no first-class JavaScript support
- No SQL integration
- Complex build process for WASM
- Overkill for our scale (designed for billions of vectors)

### Implementation Notes
Partial indexes are created for each supported dimension to allow variable-dimension embeddings:
```typescript
const supportedDimensionsForIndex = [128, 256, 384, 512, 768, 1024, 1280, 1536, 1792]
```

### Consequences
- **Positive**: Sub-second similarity search on thousands of chunks
- **Positive**: Dimension-agnostic (supports any embedding model)
- **Negative**: Multiple indexes increase storage overhead
- **Negative**: Index rebuild required if dimensions change

---

## ADR-003: ORM - Drizzle

### Status
**Accepted**

### Context
An ORM or query builder is needed to:
- Provide type-safe database operations
- Abstract SQL generation
- Support migrations
- Work with PGlite in browser environment

### Decision
Use **Drizzle ORM** version 0.39.0.

```json
"drizzle-orm": "^0.39.0",
"drizzle-kit": "^0.30.3"
```

### Rationale
Drizzle was chosen because:
1. **Zero-runtime overhead** - SQL generated at compile time, not runtime
2. **TypeScript-first** - Superior type inference from schema definitions
3. **Lightweight** - No decorators, metadata, or reflection required
4. **Custom type support** - Easy to define pgvector column type
5. **Browser compatible** - Works in Electron renderer process

### Alternatives Considered

#### TypeORM
**Why NOT chosen:**
- Decorator-heavy API requires experimental decorators
- Heavier runtime with metadata reflection
- More boilerplate for simple operations
- Entity classes add complexity
- Slower query generation

#### Prisma
**Why NOT chosen:**
- Requires separate .prisma schema file (not TypeScript)
- Prisma Client generation step complicates build
- Heavier runtime than Drizzle
- Browser support is limited/experimental
- Query engine adds significant bundle size

#### Sequelize
**Why NOT chosen:**
- Older jQuery-era patterns
- Weak TypeScript support (added later, not native)
- Heavy runtime with many abstractions
- Not designed for modern bundlers
- Slower development velocity

#### Knex.js (Query Builder Only)
**Why NOT chosen:**
- No schema definition (just queries)
- Less type safety than Drizzle
- Would need separate migration tooling
- No TypeScript inference from schema

#### Raw SQL Queries
**Why NOT chosen:**
- No type safety for parameters or results
- SQL injection risks without parameterization
- Duplicate SQL across codebase
- Harder to refactor schema changes

### Implementation Notes
Custom vector type definition for pgvector:
```typescript
export const vectorType = customType<{ data: number[] }>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 1536})`
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value)
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value)
  },
})
```

Browser migration workaround using undocumented API:
```typescript
// drizzle-orm/pglite doesn't export migrate for browser
// Using internal API per: github.com/drizzle-team/drizzle-orm/discussions/2532
```

### Consequences
- **Positive**: Full type safety from schema to query results
- **Positive**: Minimal bundle size increase
- **Negative**: Some APIs are undocumented for browser use
- **Negative**: Smaller community than TypeORM/Prisma

---

## ADR-004: State Management - React Context

### Status
**Accepted**

### Context
The plugin UI requires state management for:
- Plugin settings
- Database connections
- RAG engine instances
- MCP server state
- Theme (dark mode)

### Decision
Use **React Context API** with custom hooks for all state management. No external state library.

### Rationale
React Context was chosen because:
1. **Built-in React** - No additional dependencies
2. **Sufficient for plugin scope** - Not a large SPA with complex state
3. **Familiar to contributors** - Standard React pattern
4. **Good for dependency injection** - Lazy-loaded services (DB, RAG, MCP)
5. **React 18 optimizations** - Automatic batching reduces re-renders

### Alternatives Considered

#### Redux
**Why NOT chosen:**
- Significant boilerplate (actions, reducers, selectors)
- Overkill for plugin-scale state
- Additional learning curve for contributors
- Would add ~10KB to bundle
- Unnecessary for predominantly async service state

#### Zustand
**Why NOT chosen:**
- Adds external dependency
- Minimal benefit over Context for our use case
- Another API to learn
- Not significantly simpler than Context for service injection
- Plugin state is mostly async resources, not synchronous updates

#### Recoil
**Why NOT chosen:**
- Experimental API, may change
- Smaller community than alternatives
- Atom-based model adds complexity
- Meta has deprioritized development
- Unclear long-term support

#### MobX
**Why NOT chosen:**
- Requires decorators or makeObservable boilerplate
- Observable pattern is different paradigm
- More complex mental model
- Adds significant bundle size
- Overkill for service injection use case

#### Jotai
**Why NOT chosen:**
- Similar to Recoil (atom-based)
- Adds dependency for minimal benefit
- Our state is mostly async services, not atoms
- Would need custom async atom patterns

### Implementation Notes
Context hierarchy with lazy initialization:
```typescript
// Contexts are nested for dependency order
ChatViewProvider
  └─ PluginProvider
       └─ AppProvider
            └─ SettingsProvider
                 └─ DatabaseProvider  // lazy: getDatabaseManager()
                      └─ RAGProvider  // lazy: getRAGEngine()
                           └─ McpProvider  // lazy: getMcpManager()
```

### Consequences
- **Positive**: Zero additional dependencies
- **Positive**: Familiar pattern for React developers
- **Negative**: Deep nesting can be verbose
- **Negative**: No built-in devtools (unlike Redux DevTools)

---

## ADR-005: Rich Text Editor - Lexical

### Status
**Accepted**

### Context
The chat input and template editor require:
- Rich text editing with custom nodes
- @mention autocomplete
- Image paste/drag support
- JSON serialization (not HTML)
- Accessible and performant

### Decision
Use **Lexical** version 0.17.1.

```json
"lexical": "^0.17.1",
"@lexical/react": "^0.17.1",
"@lexical/clipboard": "^0.17.1"
```

### Rationale
Lexical was chosen because:
1. **Meta maintained** - Active development, not abandoned
2. **JSON serialization** - Stores state as JSON, not HTML (safer, smaller)
3. **Extensible plugins** - Easy to add @mention, template commands
4. **Good accessibility** - ARIA support built-in
5. **Smaller bundle** - Less code than TipTap/Prosemirror stack

### Alternatives Considered

#### Draft.js
**Why NOT chosen:**
- No longer actively maintained by Meta
- Lexical is its successor
- Known performance issues with large documents
- Immutable.js dependency adds weight
- API is considered legacy

#### TipTap (Prosemirror)
**Why NOT chosen:**
- Wrapper around Prosemirror adds abstraction layer
- Larger combined bundle size
- Steeper learning curve for custom nodes
- More complex schema system
- Premium features require license

#### Slate
**Why NOT chosen:**
- API instability history (breaking changes)
- Immutable-focused architecture
- Smaller community than alternatives
- Complex plugin system
- Type definitions have gaps

#### Quill
**Why NOT chosen:**
- Less flexible for custom integrations
- HTML-based storage (XSS concerns)
- Harder to implement custom nodes
- Delta format less intuitive than JSON
- Older architecture

#### Monaco Editor
**Why NOT chosen:**
- Designed for code, not rich text
- Massive bundle size (~2MB)
- Overkill for chat input
- Would need heavy customization
- No built-in rich text features

#### ContentEditable (Plain)
**Why NOT chosen:**
- No structure (just HTML string)
- Browser inconsistencies
- Difficult to implement mentions
- No undo/redo management
- XSS vulnerabilities

### Implementation Notes
Templates store Lexical JSON for preservation:
```typescript
interface TemplateContent {
  nodes: SerializedLexicalNode[]
}
```

Custom MentionNode extends DecoratorNode for @mentions.

### Consequences
- **Positive**: Clean JSON serialization for storage
- **Positive**: Active Meta maintenance
- **Negative**: Newer library, less Stack Overflow answers
- **Negative**: Some Obsidian integration quirks

---

## ADR-006: LLM Provider Architecture

### Status
**Accepted**

### Context
The plugin must support multiple LLM providers (OpenAI, Anthropic, Gemini, etc.) with:
- Type-safe provider-specific configuration
- Runtime provider selection
- Extensibility for new providers
- Shared interface for chat/embedding operations

### Decision
Use **Factory Pattern** with **Zod Discriminated Unions** for type-safe multi-provider support.

```typescript
// Discriminated union for type safety
const llmProviderSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('openai'), ... }),
  z.object({ type: z.literal('anthropic'), ... }),
  // ... 14 more providers
])

// Factory function
function getProviderClient(settings, providerId): BaseLLMProvider {
  switch (provider.type) {
    case 'openai': return new OpenAIAuthenticatedProvider(provider)
    case 'anthropic': return new AnthropicProvider(provider)
    // ...
  }
}
```

### Rationale
Factory + Discriminated Union was chosen because:
1. **Single source of truth** - Zod schema validates at runtime AND provides types
2. **Type guards** - TypeScript narrows types based on discriminator
3. **Provider-specific fields** - `reasoning` for OpenAI, `thinking` for Anthropic
4. **Extensible** - Adding provider = one schema entry + one factory case
5. **Compile-time safety** - Can't access wrong provider's fields

### Alternatives Considered

#### Plugin/Registry Pattern
**Why NOT chosen:**
- More runtime complexity
- Loses compile-time type checking
- Providers must self-register
- Harder to see all providers at glance
- Dynamic loading adds latency

#### Configuration-Driven (JSON/YAML)
**Why NOT chosen:**
- No type safety for provider-specific fields
- Would need runtime validation anyway
- Harder to extend with TypeScript
- Provider logic still needs code
- Configuration drift from code

#### Single Provider with Feature Flags
**Why NOT chosen:**
- Loses type safety for provider features
- Massive switch statements in single class
- Can't model provider-specific APIs
- Poor separation of concerns
- Testing becomes difficult

#### Interface-Only (No Discriminated Union)
**Why NOT chosen:**
- Can't encode provider-specific fields
- Would need unsafe type assertions
- Runtime errors instead of compile errors
- Less documentation via types
- Harder for contributors to understand

### Implementation Notes
Provider-specific fields in chat models:
```typescript
// OpenAI has reasoning
{ providerType: 'openai', reasoning: { enabled: true, effort: 'medium' } }

// Anthropic has thinking
{ providerType: 'anthropic', thinking: { enabled: true, budget_tokens: 10000 } }

// Claude Code has thinkingLevel
{ providerType: 'claude-code', thinkingLevel: 'high' }
```

### Consequences
- **Positive**: Full type safety across 16 providers
- **Positive**: Self-documenting via TypeScript types
- **Negative**: Switch statement grows with providers
- **Negative**: All providers bundled (no tree-shaking per provider)

---

## ADR-007: Settings Storage - JSON with Versioned Migrations

### Status
**Accepted**

### Context
Plugin settings must:
- Persist across Obsidian restarts
- Support backward compatibility when schema changes
- Be human-readable for debugging
- Integrate with Obsidian's plugin data system

### Decision
Use **JSON file** (`data.json`) with **numbered migration functions** executed on load.

```typescript
const SETTINGS_SCHEMA_VERSION = 13

function migrateSettings(data: Record<string, unknown>) {
  for (const migration of SETTING_MIGRATIONS) {
    if (currentVersion < migration.toVersion) {
      currentData = migration.migrate(currentData)
    }
  }
}
```

### Rationale
JSON + Migrations was chosen because:
1. **Human-readable** - Easy to debug and backup
2. **Backward compatible** - Migrations handle v0 → v13
3. **Explicit history** - Each migration is reviewable
4. **Zod validation** - Runtime schema validation with defaults
5. **Obsidian standard** - Matches plugin data expectations

### Alternatives Considered

#### Single-Version Schema (No Migrations)
**Why NOT chosen:**
- Cannot handle breaking changes
- Old settings become invalid
- Users lose configuration on update
- Would need "reset settings" flow
- Poor user experience

#### Database Table in PGlite
**Why NOT chosen:**
- Overkill for ~50KB of settings
- Adds database dependency for simple config
- Harder to backup/restore manually
- Settings needed before DB initializes
- Circular dependency potential

#### Multiple JSON Files (Per Section)
**Why NOT chosen:**
- Harder to keep consistent
- Atomic updates become complex
- More file I/O operations
- Version tracking per file
- Merge conflicts on sync

#### TOML or YAML Format
**Why NOT chosen:**
- Less native to JavaScript ecosystem
- Would need additional parser
- Obsidian uses JSON throughout
- YAML has parsing edge cases
- No benefit over JSON for this use case

#### Browser LocalStorage
**Why NOT chosen:**
- Not portable across machines
- Not backed up with vault
- Obsidian doesn't expose LocalStorage API
- Limited size (5MB)
- Not discoverable by users

### Implementation Notes
Migration pattern with explicit version bumps:
```typescript
export const migrateFrom12To13: SettingMigration['migrate'] = (data) => {
  const newData = { ...data }
  newData.version = 13
  newData.providers = getMigratedProviders(newData, DEFAULT_PROVIDERS_V13)
  return newData
}
```

### Consequences
- **Positive**: Settings survive across 13+ schema versions
- **Positive**: Easy to debug with text editor
- **Negative**: Migration code grows over time
- **Negative**: Cannot remove old migration code (v0 users exist)

---

## ADR-008: Chat and Template Storage - JSON Files

### Status
**Accepted**

### Context
Chat conversations and templates need:
- Persistence across sessions
- Human-readable format for backups
- Integration with vault sync (OneDrive, iCloud, etc.)
- Efficient listing without parsing full content

### Decision
Use **JSON files** in `.smtcmp_json_db/` directory with **metadata encoded in filenames**.

```
.smtcmp_json_db/
├── chats/
│   └── v1_{urlEncodedTitle}_{updatedAt}_{id}.json
└── templates/
    └── v1_{urlEncodedName}_{id}.json
```

### Rationale
JSON files with metadata filenames was chosen because:
1. **Vault-integrated** - Part of standard Obsidian sync/backup
2. **Human-readable** - Can be edited manually if needed
3. **Fast listing** - Metadata in filename, no parsing for list views
4. **Diffable** - Git-friendly for version control
5. **Simple CRUD** - File operations map directly to database operations

### Alternatives Considered

#### All Data in PGlite
**Why NOT chosen:**
- Heavier for text data (chats, templates)
- Harder to selectively backup
- Can't diff individual conversations
- Single point of failure
- Overkill for document storage

#### Markdown Files with YAML Frontmatter
**Why NOT chosen:**
- Lexical JSON doesn't map cleanly to Markdown
- Would lose formatting fidelity
- YAML parsing adds complexity
- Harder to store nested structures
- Template content is rich text, not markdown

#### Separate SQLite Database
**Why NOT chosen:**
- Additional dependency
- Doesn't work in browser environment
- Already have PGlite for vectors
- Would need two database systems
- More complex migration strategy

#### IndexedDB
**Why NOT chosen:**
- Not portable across machines
- Not backed up with vault sync
- Browser storage limits
- Not human-readable
- Can't be edited externally

#### Single JSON File (All Chats)
**Why NOT chosen:**
- File grows unbounded
- Slow to parse for list view
- Merge conflicts on sync
- Can't delete individual chats atomically
- Poor performance at scale

### Implementation Notes
Filename convention encodes metadata:
```typescript
// v1_Help%20with%20TypeScript_1734567890000_abc123.json
// │   │                        │              └─ UUID
// │   │                        └─ updatedAt timestamp
// │   └─ URL-encoded title
// └─ Schema version

protected generateFileName(chat: ChatConversation): string {
  const title = encodeURIComponent(chat.title)
  return `v${SCHEMA_VERSION}_${title}_${chat.updatedAt}_${chat.id}.json`
}
```

### Consequences
- **Positive**: Individual files for each conversation
- **Positive**: Metadata visible without parsing
- **Negative**: Many small files in directory
- **Negative**: Filename length limits on Windows

---

## ADR-009: MCP Transport - stdio

### Status
**Accepted**

### Context
MCP (Model Context Protocol) servers need to communicate with the plugin. Transport options are:
- stdio (subprocess pipes)
- HTTP (REST/WebSocket)
- Unix sockets

### Decision
Use **stdio transport** exclusively for MCP server communication.

```typescript
const { StdioClientTransport } = await import(
  '@modelcontextprotocol/sdk/client/stdio.js'
)
await client.connect(new StdioClientTransport({
  command: serverParams.command,
  args: serverParams.args,
  env: { ...this.defaultEnv, ...serverParams.env }
}))
```

### Rationale
stdio transport was chosen because:
1. **Local only** - No network exposure (secure)
2. **Simplest implementation** - No port management
3. **MCP SDK native** - First-class support
4. **Process lifecycle** - Plugin controls server start/stop
5. **Environment isolation** - Each server gets its own process

### Alternatives Considered

#### HTTP Server Transport
**Why NOT chosen:**
- Requires binding to network port
- Port conflicts with other applications
- Security exposure (localhost still accessible)
- More complex connection management
- Firewall/antivirus interference potential

#### WebSocket Transport
**Why NOT chosen:**
- Same port binding issues as HTTP
- Overkill for local communication
- More complex than stdio
- No benefit for single-client scenario
- Additional handshake overhead

#### Unix Sockets / Named Pipes
**Why NOT chosen:**
- Platform-specific (Unix vs Windows)
- More complex than stdio
- Permission issues on some systems
- No cross-platform abstraction
- stdio works everywhere

#### gRPC
**Why NOT chosen:**
- Heavyweight for plugin context
- Requires protobuf compilation
- Binary protocol harder to debug
- MCP SDK doesn't support it
- Overkill for tool calling

### Implementation Notes
MCP is disabled on mobile:
```typescript
static disabled = !Platform.isDesktop
// Mobile doesn't support Node.js subprocess spawning
```

### Consequences
- **Positive**: Simple, secure local communication
- **Positive**: No network configuration needed
- **Negative**: Desktop-only (no mobile support)
- **Negative**: Each server is separate process (memory overhead)

---

## ADR-010: Build System - esbuild

### Status
**Accepted**

### Context
The build system must:
- Bundle TypeScript and React to single JS file
- Handle WASM modules (PGlite)
- Support hot reload during development
- Produce optimized production builds

### Decision
Use **esbuild** version 0.17.3.

```json
"esbuild": "0.17.3"
```

### Rationale
esbuild was chosen because:
1. **Blazing fast** - Sub-second rebuilds
2. **Minimal configuration** - Defaults work for most cases
3. **Native ESM support** - Handles modern JavaScript
4. **Single-file output** - Perfect for Obsidian plugins
5. **Plugin system** - Custom PGlite shim possible

### Alternatives Considered

#### Webpack
**Why NOT chosen:**
- Significantly slower rebuilds
- More configuration required
- Plugin system more complex
- Larger ecosystem burden
- Overkill for single-output plugin

#### Vite
**Why NOT chosen:**
- Designed for multi-page SSR applications
- Dev server not needed (Obsidian is the host)
- Extra abstraction over esbuild/rollup
- HMR not applicable to Obsidian plugins
- Would need to disable most features

#### Rollup
**Why NOT chosen:**
- Slower than esbuild
- More manual configuration
- No speed advantage for our case
- Plugin ecosystem more fragmented
- Tree-shaking already in esbuild

#### Parcel
**Why NOT chosen:**
- Less control over output format
- Zero-config sometimes wrong config
- Harder to customize for Obsidian
- Larger bundle output
- Magic can be hard to debug

#### tsc (TypeScript Compiler Only)
**Why NOT chosen:**
- No bundling (many output files)
- No minification
- No tree-shaking
- Would need additional tool
- Slow for development iteration

### Implementation Notes
Custom plugin to shim PGlite for Electron:
```javascript
const pgliteShimPlugin = {
  name: 'pglite-shim',
  setup(build) {
    build.onLoad({ filter: /pglite/ }, async (args) => {
      let contents = await fs.promises.readFile(args.path, 'utf8')
      // Inject: const process = {} to bypass Node.js detection
      contents = 'const process = {};\n' + contents
      return { contents, loader: 'js' }
    })
  }
}
```

### Consequences
- **Positive**: Development rebuilds in <1 second
- **Positive**: Single main.js output (~8MB)
- **Negative**: Some edge cases need custom plugins
- **Negative**: Less mature plugin ecosystem than Webpack

---

## ADR-011: Text Chunking - RecursiveCharacterTextSplitter

### Status
**Accepted**

### Context
Vault content must be chunked for embedding. Requirements:
- Markdown-aware splitting
- Reasonable chunk sizes for embedding models
- Preserve context at chunk boundaries
- Performance for large vaults

### Decision
Use **LangChain's RecursiveCharacterTextSplitter** with markdown language preset.

```typescript
const textSplitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
  chunkSize: 1000,      // characters
  chunkOverlap: 200,    // overlap for context
  separators: ['\n\n', '\n', ' ', '']  // fallback chain
})
```

### Rationale
RecursiveCharacterTextSplitter was chosen because:
1. **Markdown-aware** - Respects headers, code blocks, paragraphs
2. **Overlap support** - 200-char overlap preserves context
3. **Fallback chain** - Paragraph → line → word → character
4. **LangChain ecosystem** - Well-tested, documented
5. **Line number preservation** - Metadata includes source location

### Alternatives Considered

#### Token-Based Chunking
**Why NOT chosen (for now):**
- js-tiktoken too slow for large vaults
- Would block UI during indexing
- Character-based approximates tokens well enough
- TODO: Migrate to WASM tiktoken when available

Code comment shows intent:
```typescript
// TODO: Use token-based chunking after migrating to WebAssembly-based tiktoken
// Current token counting method is too slow for practical use
```

#### Manual Regex Splitting
**Why NOT chosen:**
- Less robust than recursive approach
- Would miss edge cases
- No markdown awareness
- Would need extensive testing
- Reinventing the wheel

#### Sentence Boundary Detection
**Why NOT chosen:**
- Overkill for markdown content
- NLP libraries add significant weight
- Markdown structure more relevant than sentences
- Would break code blocks incorrectly
- Slower than character-based

#### Semantic Chunking (Embedding-Based)
**Why NOT chosen:**
- Chicken-and-egg: need embeddings to chunk, need chunks to embed
- Would require two embedding passes
- Much more expensive (API costs)
- Slower indexing
- Diminishing returns for our use case

#### Fixed-Size Chunking (No Overlap)
**Why NOT chosen:**
- Loses context at boundaries
- Cuts mid-sentence/paragraph
- Poor retrieval quality
- Overlap is critical for RAG

### Implementation Notes
Chunk metadata preserves source location:
```typescript
{
  startLine: chunk.metadata.loc.lines.from,
  endLine: chunk.metadata.loc.lines.to
}
```

### Consequences
- **Positive**: Intelligent markdown-aware splits
- **Positive**: Context preserved via overlap
- **Negative**: Character-based not perfectly token-aligned
- **Negative**: LangChain dependency for single feature

---

## ADR-012: Token Counting - js-tiktoken

### Status
**Accepted**

### Context
Token counting is needed for:
- Context window management
- RAG threshold decisions
- Usage display to users

### Decision
Use **js-tiktoken** (Pure JavaScript Tiktoken) version 1.0.15.

```json
"js-tiktoken": "^1.0.15"
```

```typescript
import { getEncoding } from 'js-tiktoken'

export async function tokenCount(text: string): Promise<number> {
  const encoder = getEncoding('cl100k_base')
  return encoder.encode(text).length
}
```

### Rationale
js-tiktoken was chosen because:
1. **Pure JavaScript** - No native module compilation
2. **Browser compatible** - Works in Electron
3. **Accurate** - Matches OpenAI's actual tokenization
4. **Small bundle** - Reasonable size addition
5. **Standard encoding** - cl100k_base for GPT-3.5/4

### Alternatives Considered

#### Official tiktoken (WASM)
**Why NOT chosen (for now):**
- Requires complex esbuild configuration for WASM
- More setup for contributors
- js-tiktoken sufficient for current needs
- TODO: Migrate when performance becomes critical

Code comment:
```typescript
// TODO: Replace js-tiktoken with tiktoken library for better performance
// Note: tiktoken uses WebAssembly, requiring esbuild configuration
```

#### Estimation (Word Count × 1.3)
**Why NOT chosen:**
- Inaccurate for code, non-English text
- Would show wrong counts to users
- RAG thresholds would be miscalibrated
- Professional tool needs accuracy
- Simple but wrong

#### LLM API Token Counting
**Why NOT chosen:**
- Requires network call for every count
- High latency (100ms+ per call)
- API costs accumulate
- Doesn't work offline
- Overkill for local operation

#### No Token Counting
**Why NOT chosen:**
- Users need context window visibility
- RAG threshold decisions need token awareness
- Would lead to context overflow errors
- Poor user experience
- Feature expectation from similar tools

### Consequences
- **Positive**: Accurate token counts matching OpenAI
- **Positive**: Works entirely offline
- **Negative**: Slow for very large texts (disabled in chunking)
- **Negative**: Only accurate for OpenAI models (other providers vary)

---

## ADR-013: Schema Validation - Zod

### Status
**Accepted**

### Context
The plugin needs schema validation for:
- Settings structure
- Provider configurations
- Chat model definitions
- API request/response shapes

### Decision
Use **Zod** version 3.23.8 for runtime schema validation and TypeScript type inference.

```json
"zod": "^3.23.8"
```

### Rationale
Zod was chosen because:
1. **TypeScript-first** - Types inferred from schemas
2. **Runtime validation** - Validates actual data, not just types
3. **Discriminated unions** - Perfect for provider type system
4. **Default values** - `.default()` and `.catch()` for resilience
5. **Small bundle** - Minimal size impact

### Alternatives Considered

#### io-ts
**Why NOT chosen:**
- More verbose API
- Functional programming style less familiar
- Smaller community
- Less intuitive for simple cases
- fp-ts dependency

#### Yup
**Why NOT chosen:**
- Weaker TypeScript inference
- Originally designed for forms, not APIs
- Less expressive for complex unions
- Slower adoption of new TS features
- Object-oriented style less composable

#### Joi
**Why NOT chosen:**
- No TypeScript type inference
- Designed for Node.js, browser support secondary
- Heavier bundle size
- No discriminated union support
- Would need separate type definitions

#### TypeScript Only (No Runtime)
**Why NOT chosen:**
- No runtime validation
- External data (settings, API) could be malformed
- Type assertions unsafe
- Migrations need actual data validation
- Errors happen at runtime anyway

#### Ajv (JSON Schema)
**Why NOT chosen:**
- Separate schema format (JSON Schema)
- No TypeScript inference
- More verbose for complex types
- Validation-only, no transformation
- Would need code generation

### Implementation Notes
Discriminated unions for providers:
```typescript
const llmProviderSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('openai'), ... }),
  z.object({ type: z.literal('anthropic'), ... }),
])

type LLMProvider = z.infer<typeof llmProviderSchema>
```

### Consequences
- **Positive**: Single source of truth for types AND validation
- **Positive**: Excellent TypeScript integration
- **Negative**: Runtime overhead for validation
- **Negative**: Schema definitions can get verbose

---

## ADR-014: Diff Algorithm - vscode-diff

### Status
**Accepted**

### Context
The Apply feature needs to show differences between:
- Current file content
- LLM-suggested changes

### Decision
Use **vscode-diff** version 2.1.1.

```json
"vscode-diff": "^2.1.1"
```

### Rationale
vscode-diff was chosen because:
1. **Battle-tested** - Used in VS Code itself
2. **Line-level diffs** - Appropriate granularity for code
3. **Fast** - Optimized implementation
4. **Small bundle** - Minimal size impact
5. **Standard output** - Compatible with diff viewers

### Alternatives Considered

#### diff (npm package)
**Why NOT chosen:**
- Less optimized than vscode-diff
- Multiple algorithms to choose from (decision paralysis)
- vscode-diff is specifically for editor use case
- Less familiar output format
- Larger API surface

#### jsdiff
**Why NOT chosen:**
- Older library, less maintained
- Character-level default (need line-level)
- More configuration required
- vscode-diff more appropriate for code
- No significant benefit

#### Custom Implementation
**Why NOT chosen:**
- Diff algorithms are complex (Myers, patience, etc.)
- Would need extensive testing
- Performance optimization non-trivial
- Existing libraries are proven
- Not our core competency

#### Git Diff (via CLI)
**Why NOT chosen:**
- Requires git installation
- Shell execution overhead
- Parsing text output fragile
- Not available in all environments
- Async complexity for synchronous UI

### Implementation Notes
DiffBlock structure:
```typescript
type DiffBlock =
  | { type: 'unchanged'; value: string }
  | { type: 'modified'; originalValue?: string; modifiedValue?: string }
```

### Consequences
- **Positive**: Professional-quality diffs
- **Positive**: Same algorithm as VS Code
- **Negative**: One more dependency
- **Negative**: Line-level only (no word-level highlighting)

---

## ADR-015: Fuzzy Search - fuzzysort

### Status
**Accepted**

### Context
The @mention autocomplete needs:
- Fuzzy matching for file/folder names
- Fast search across vault contents
- Relevance scoring

### Decision
Use **fuzzysort** version 3.1.0.

```json
"fuzzysort": "^3.1.0"
```

### Rationale
fuzzysort was chosen because:
1. **Extremely fast** - Optimized for real-time search
2. **Simple API** - Single function call
3. **Good scoring** - Intelligent match ranking
4. **Highlighting support** - Can show matched characters
5. **Tiny bundle** - Minimal size impact

### Alternatives Considered

#### Fuse.js
**Why NOT chosen:**
- Slower than fuzzysort for our dataset sizes
- More features than needed (threshold config, etc.)
- Larger bundle size
- Configuration complexity
- fuzzysort benchmarks faster

#### match-sorter
**Why NOT chosen:**
- Different ranking philosophy
- Less fuzzy (more strict matching)
- Slower for large lists
- fuzzysort better for filenames
- Less intuitive API

#### Lunr.js
**Why NOT chosen:**
- Full-text search (overkill)
- Requires building index
- Larger bundle
- Not designed for filenames
- Too much for autocomplete

#### Custom Implementation
**Why NOT chosen:**
- Fuzzy matching is surprisingly complex
- Performance optimization non-trivial
- Would need extensive testing
- Existing libraries are proven
- Time better spent elsewhere

#### Regular Expression
**Why NOT chosen:**
- Not fuzzy (exact or nothing)
- Poor user experience
- Typo-intolerant
- Would need complex escaping
- No relevance scoring

### Implementation Notes
Used for both file search and template search:
```typescript
// File search in fuzzy-search.ts
const results = fuzzysort.go(query, files, { key: 'path' })

// Template search in TemplateManager.ts
const results = fuzzysort.go(query, templates, { key: 'name', threshold: 0.2 })
```

### Consequences
- **Positive**: Real-time responsive autocomplete
- **Positive**: Tolerant of typos
- **Negative**: Simple scoring (no semantic understanding)
- **Negative**: Case sensitivity handling needs configuration

---

## Summary

| ADR | Decision | Key Reason |
|-----|----------|------------|
| 001 | PGlite | Full PostgreSQL + pgvector in WASM |
| 002 | HNSW | Logarithmic search time for vectors |
| 003 | Drizzle | Zero-runtime type-safe ORM |
| 004 | React Context | Built-in, sufficient for plugin scale |
| 005 | Lexical | JSON storage, Meta-maintained |
| 006 | Factory + Discriminated Union | Type-safe extensible providers |
| 007 | JSON + Migrations | Human-readable, backward compatible |
| 008 | JSON Files | Vault-integrated, diffable |
| 009 | stdio | Simple, secure, local-only |
| 010 | esbuild | Fast rebuilds, minimal config |
| 011 | RecursiveCharacterTextSplitter | Markdown-aware, overlap support |
| 012 | js-tiktoken | Pure JS, accurate, offline |
| 013 | Zod | TypeScript inference + runtime validation |
| 014 | vscode-diff | Battle-tested, editor-appropriate |
| 015 | fuzzysort | Fast, good scoring, tiny |
| 016 | Console Debug Logging | Human-readable model verification |
| 017 | Extended Thinking Variants | Budget-based thinking for Anthropic API |
| 018 | Two-Row UI Layout | VS Code Copilot-style dropdown controls |
| 019 | Database Independence | Separate `.pwrcmp_*` paths from Smart Composer |

---

## ADR-016: Console Debug Logging for Model Verification

### Status
**Accepted**

### Context
Users selecting models in Smart Composer had no way to verify which model was actually being called. LLMs cannot reliably self-identify (they don't "know" what model they are), leading to user uncertainty about whether their model selection was being honored.

### Decision
Add **console.log debug messages** to all LLM providers that display:
1. The exact model ID being sent to the API
2. The thinking/reasoning configuration in human-readable format

```typescript
// Anthropic Provider
console.log(`[Anthropic Provider] Model: ${request.model} | Thinking: ${thinkingLabel}`)

// Claude Code Provider
console.log(`[Claude Code] Model: ${request.model} | Thinking: ${thinkingLabel}`)
```

Output examples:
```
[Anthropic Provider] Model: claude-opus-4-5-20251101 | Thinking: OFF
[Anthropic Provider] Model: claude-haiku-4-5 | Thinking: HIGH (20k tokens)
[Claude Code] Model: claude-opus-4-5-20251101 | Thinking: ULTRATHINK (~32k tokens)
```

### Rationale
Console debug logging was chosen because:
1. **Zero UI impact** - Doesn't clutter the chat interface
2. **Opt-in visibility** - Users must open DevTools to see it
3. **Immediate feedback** - Logs appear the moment a request is made
4. **Human-readable** - Labels like "HIGH (20k tokens)" vs raw numbers
5. **No performance impact** - Single console.log per request

### Alternatives Considered

#### Toast/Notification in UI
**Why NOT chosen:**
- Would clutter the interface for every message
- Distracting during normal use
- Not needed once user trusts the system

#### Settings panel indicator
**Why NOT chosen:**
- Doesn't show real-time request info
- Would need state management for "last used model"
- More complex implementation

#### No verification at all
**Why NOT chosen:**
- Users expressed concern about model accuracy
- "Trust but verify" approach preferred
- Debugging tool availability is standard practice

### Implementation Notes
Helper methods convert raw config to labels:
```typescript
// Anthropic: budget_tokens → label
if (budget <= 10000) return 'STANDARD (10k tokens)'
else if (budget <= 20000) return 'HIGH (20k tokens)'
else return 'MAX (32k tokens)'

// Claude Code: thinkingLevel → label
switch (thinkingLevel) {
  case 'low': return 'LOW (~4k tokens)'
  case 'medium': return 'MEDIUM (~10k tokens)'
  case 'high': return 'HIGH (~20k tokens)'
  case 'max': return 'ULTRATHINK (~32k tokens)'
  default: return 'OFF'
}
```

### Consequences
- **Positive**: Users can verify model selection with DevTools
- **Positive**: Useful for debugging provider issues
- **Negative**: Slightly increases code in hot path
- **Negative**: Messages may confuse non-technical users who open DevTools

---

## ADR-017: Extended Thinking Variants for Anthropic API

### Status
**Accepted**

### Context
Claude Code provider already had thinking level variants (think, think-hard, ultrathink). The standard Anthropic API models did not expose Extended Thinking capability, despite the API supporting it via the `thinking` parameter.

### Decision
Add **thinking variants** for all Anthropic API models with three budget levels:

| Suffix | Budget | Use Case |
|--------|--------|----------|
| `-thinking` | 10,000 tokens | Standard reasoning tasks |
| `-thinking-high` | 20,000 tokens | Complex analysis |
| `-thinking-max` | 32,000 tokens | Maximum reasoning depth |

Models added:
- `claude-opus-4.5-thinking`, `-thinking-high`, `-thinking-max`
- `claude-sonnet-4.5-thinking`, `-thinking-high`, `-thinking-max`
- `claude-haiku-4.5-thinking`, `-thinking-high`, `-thinking-max`

### Rationale
Separate model variants were chosen because:
1. **Consistent with Claude Code pattern** - Same approach as existing thinking levels
2. **No UI changes required** - Works with existing model dropdown
3. **Explicit selection** - User knows exactly what thinking budget they're using
4. **Migration-friendly** - Settings migration adds new models without breaking existing selections

### Alternatives Considered

#### UI Toggle for Thinking Level
**Why NOT chosen (for now):**
- Requires new UI components
- More complex state management
- Planned for future (see ROADMAP.md)
- Model variants work today

#### Single "thinking" model with dynamic budget
**Why NOT chosen:**
- Would need new settings field
- Less explicit about resource usage
- Harder to compare results between levels

#### No Extended Thinking for Anthropic API
**Why NOT chosen:**
- Feature parity with Claude Code provider expected
- Extended Thinking significantly improves complex reasoning
- API supports it natively

### Implementation Notes
Thinking config in model definition:
```typescript
{
  providerType: 'anthropic',
  id: 'claude-opus-4.5-thinking-high',
  model: 'claude-opus-4-5-20251101',
  thinking: {
    enabled: true,
    budget_tokens: 20000,
  },
}
```

Passed to Anthropic SDK:
```typescript
const response = await this.client.messages.create({
  model: request.model,
  thinking: model.thinking,  // SDK handles the rest
  // ...
})
```

### Consequences
- **Positive**: Full Extended Thinking support for API users
- **Positive**: Clear budget visibility in model name
- **Negative**: 9 new model variants in dropdown (may feel cluttered)
- **Negative**: Token budget not customizable (fixed at 10k/20k/32k)

---

## ADR-018: Two-Row UI Layout for Chat Input

### Status
**Accepted**

### Context
The original Smart Composer had a single-row model selector that required users to navigate through a long flat list of models from all providers. As more providers and thinking variants were added (16 providers, 30+ models), this became unwieldy. Users wanted a more intuitive way to:
1. Select provider first (Claude, ChatGPT, Gemini)
2. Toggle between connection types (API vs Subscription)
3. Adjust thinking/reasoning levels independently

### Decision
Implement a **two-row UI layout** inspired by VS Code Copilot's model selector:

**Row 1:**
- Provider dropdown (grouped by product: Claude, ChatGPT, Gemini, etc.)
- Model dropdown (filtered to selected provider)
- Context file indicators

**Row 2:**
- Connection type toggle (API/Subscription where applicable)
- Thinking level dropdown (adapts to provider)
- Submit button

New components created:
- `ProviderSelect.tsx` - Provider grouping dropdown
- `ConnectionTypeSelect.tsx` - API/Subscription toggle
- `ThinkingSelect.tsx` - Provider-adaptive thinking levels

### Rationale
The two-row layout was chosen because:
1. **Provider-first mental model** - Users think "I want Claude" before "I want claude-opus-4-5-20251101"
2. **Reduced cognitive load** - Only show relevant models for selected provider
3. **Connection type awareness** - Make API vs Subscription choice explicit
4. **Thinking level control** - Adjust reasoning depth without changing model variants
5. **VS Code familiarity** - Users already know this pattern from Copilot

### Alternatives Considered

#### Single Enhanced Dropdown with Grouping
**Why NOT chosen:**
- Still requires scrolling through all options
- No clear separation of concerns
- Harder to show connection type
- Thinking level buried in model names

#### Sidebar Settings Panel
**Why NOT chosen:**
- Too hidden for frequent access
- Breaks chat flow
- Extra clicks required
- Not inline with input

#### Model Variant Suffixes Only
**Why NOT chosen:**
- Leads to combinatorial explosion (model × thinking × connection)
- Long model names hard to read
- No visual grouping
- Already tried this approach

### Implementation Notes
Provider grouping uses a mapping structure:
```typescript
const PROVIDER_GROUPS: Record<string, string[]> = {
  Claude: ['anthropic', 'claude-code'],
  ChatGPT: ['openai'],
  Gemini: ['gemini'],
  // ...
}
```

Thinking options adapt per provider:
```typescript
const THINKING_OPTIONS: Record<string, ThinkingOption[]> = {
  anthropic: [
    { id: 'off', label: 'OFF' },
    { id: 'standard', label: 'Standard (10k)' },
    { id: 'high', label: 'High (20k)' },
    { id: 'max', label: 'Max (32k)' },
  ],
  'claude-code': [
    { id: 'off', label: 'OFF' },
    { id: 'low', label: 'Low (~4k)' },
    { id: 'medium', label: 'Medium (~10k)' },
    { id: 'high', label: 'High (~20k)' },
    { id: 'max', label: 'Ultrathink (~32k)' },
  ],
  // ...
}
```

### Consequences
- **Positive**: Intuitive provider-first selection
- **Positive**: Thinking level separate from model selection
- **Positive**: Easy to switch API/Subscription for same model family
- **Negative**: More UI components to maintain
- **Negative**: Need to keep provider groupings updated as new providers added

---

---

## ADR-019: Database Independence (Power Composer vs Smart Composer)

### Status
**Accepted**

### Context
Power Composer was forked from Smart Composer. Initially, both plugins shared the same database paths:
- `.smtcmp_json_db/` (chats, templates)
- `.smtcmp_vector_db.tar.gz` (vector embeddings)
- View types: `smtcmp-chat-view`, `smtcmp-apply-view`

When users attempted to run both plugins simultaneously, or when Smart Composer was enabled while loading Power Composer, a **fatal conflict** occurred:
- Error: "Failed to load plugin 'power-composer'"
- Root cause: Both plugins tried to access the same database file
- The first plugin to load locked the database, preventing the second from initializing

### Decision
Give Power Composer **completely independent database paths and identifiers**:

| Resource | Smart Composer | Power Composer |
|----------|---------------|----------------|
| JSON Database | `.smtcmp_json_db/` | `.pwrcmp_json_db/` |
| Vector Database | `.smtcmp_vector_db.tar.gz` | `.pwrcmp_vector_db.tar.gz` |
| Chat View Type | `smtcmp-chat-view` | `pwrcmp-chat-view` |
| Apply View Type | `smtcmp-apply-view` | `pwrcmp-apply-view` |

Files changed:
- `src/constants.ts` - View types and vector DB path
- `src/database/json/constants.ts` - JSON DB root directory
- `src/database/DatabaseManager.ts` - Log message branding

### Rationale
Database independence was chosen because:
1. **No locking conflicts** - Each plugin owns its database exclusively
2. **Isolation** - Corruption in one doesn't affect the other
3. **Clean uninstall** - Removing one plugin doesn't break the other's data
4. **Independent evolution** - Schema changes don't require coordination
5. **Concurrent operation** - Theoretically possible (untested)

### Alternatives Considered

#### Shared Database with Locking
**Why NOT chosen:**
- Complex lock management
- One plugin would block the other
- Defeats purpose of having two plugins
- Race conditions during startup

#### Database Migration on Fork
**Why NOT chosen:**
- Would require deleting Smart Composer data
- Users might want to keep both
- More complex migration path
- Data loss risk

#### Different Plugin IDs Only
**Why NOT chosen:**
- Doesn't solve database locking
- View types could still conflict
- Partial solution is no solution

### Implementation Notes
Existing data was **copied** (not moved) to new locations:
```bash
cp -r .smtcmp_json_db .pwrcmp_json_db
cp .smtcmp_vector_db.tar.gz .pwrcmp_vector_db.tar.gz
```

This preserves user's chat history and templates while creating independence.

### Consequences
- **Positive**: Plugins can coexist without conflicts
- **Positive**: Clear branding separation
- **Positive**: User data preserved in both locations
- **Negative**: Duplicate data storage (temporary, until user deletes old)
- **Negative**: Future Smart Composer updates won't sync to Power Composer

### Verification
Tested 2025-12-22 at Work:
- ✅ Power Composer loads with Smart Composer disabled
- ✅ Database initializes with `.pwrcmp_*` paths
- ✅ Console shows "Power Composer database initialized"
- 🟡 Concurrent operation untested (low priority)

---

*These ADRs document decisions made through December 2024. Future architectural changes should be documented as new ADRs.*
