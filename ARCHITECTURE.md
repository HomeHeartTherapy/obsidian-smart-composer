# System Architecture

**Document Version:** 1.0
**Date:** 2025-12-18
**Status:** Complete

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Module Structure](#3-module-structure)
4. [Plugin Lifecycle](#4-plugin-lifecycle)
5. [LLM Provider System](#5-llm-provider-system)
6. [State Management](#6-state-management)
7. [Database Layer](#7-database-layer)
8. [MCP Integration](#8-mcp-integration)
9. [Build System](#9-build-system)
10. [Directory Structure](#10-directory-structure)

---

## 1. High-Level Architecture

### 1.1 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              OBSIDIAN APP                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    SMART COMPOSER PLUGIN                               │  │
│  │                                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  Chat View   │  │  Apply View  │  │ Settings Tab │                │  │
│  │  │   (React)    │  │   (React)    │  │   (React)    │                │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                │  │
│  │         │                 │                 │                         │  │
│  │         └─────────────────┼─────────────────┘                         │  │
│  │                           │                                           │  │
│  │                    ┌──────▼──────┐                                    │  │
│  │                    │   Contexts   │                                    │  │
│  │                    │  (React)     │                                    │  │
│  │                    └──────┬──────┘                                    │  │
│  │                           │                                           │  │
│  │      ┌────────────────────┼────────────────────┐                     │  │
│  │      │                    │                    │                     │  │
│  │  ┌───▼────┐          ┌────▼───┐          ┌────▼────┐                 │  │
│  │  │  LLM   │          │  RAG   │          │   MCP   │                 │  │
│  │  │Providers│          │ Engine │          │ Manager │                 │  │
│  │  └───┬────┘          └────┬───┘          └────┬────┘                 │  │
│  │      │                    │                    │                     │  │
│  └──────┼────────────────────┼────────────────────┼─────────────────────┘  │
│         │                    │                    │                        │
└─────────┼────────────────────┼────────────────────┼────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ External │        │  PGlite  │        │   MCP    │
    │   APIs   │        │ Database │        │ Servers  │
    │(OpenAI,  │        │ + JSON   │        │ (stdio)  │
    │Anthropic)│        │  Files   │        │          │
    └──────────┘        └──────────┘        └──────────┘
```

### 1.2 Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Views** | UI rendering, user interaction |
| **Contexts** | State management, dependency injection |
| **Core Services** | LLM communication, RAG, MCP |
| **Data Layer** | Persistence, caching, migrations |
| **External** | Third-party APIs, MCP servers |

---

## 2. Technology Stack

### 2.1 Core Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Runtime | Obsidian API | 1.4+ | Plugin host environment |
| Language | TypeScript | 5.9.x | Type safety, modern JS |
| UI Framework | React | 18.x | Component-based UI |
| Build Tool | esbuild | 0.24.x | Fast bundling |
| ORM | Drizzle | 0.30.x | Type-safe SQL |
| Database | PGlite | 0.2.12 | PostgreSQL in WASM |
| Vector Search | pgvector | - | Similarity search |

### 2.2 LLM SDKs

| Provider | SDK | Purpose |
|----------|-----|---------|
| OpenAI | openai (4.x) | GPT models, embeddings |
| Anthropic | @anthropic-ai/sdk (0.36.x) | Claude models |
| Google | @google/generative-ai (0.21.x) | Gemini models |
| Groq | groq-sdk (0.9.x) | Fast inference |
| MCP | @modelcontextprotocol/sdk (1.x) | Tool execution |

### 2.3 UI Libraries

| Library | Purpose |
|---------|---------|
| Lexical | Rich text editor |
| Radix UI | Accessible primitives (Dialog, Popover, Tooltip) |
| Lucide React | Icons |
| TanStack Query | Async state management |

### 2.4 Utilities

| Library | Purpose |
|---------|---------|
| LangChain | Text chunking, RAG utilities |
| tiktoken | Token counting |
| Zod | Runtime schema validation |
| fuse.js | Fuzzy search |

---

## 3. Module Structure

### 3.1 Module Dependency Graph

```
                         ┌─────────────┐
                         │   main.ts   │
                         │  (Plugin)   │
                         └──────┬──────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│   ChatView    │       │  ApplyView    │       │ SettingsTab   │
│   (React)     │       │   (React)     │       │   (React)     │
└───────┬───────┘       └───────┬───────┘       └───────┬───────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │      CONTEXTS         │
                    │  ┌─────────────────┐  │
                    │  │ PluginContext   │  │
                    │  │ SettingsContext │  │
                    │  │ DatabaseContext │  │
                    │  │ RAGContext      │  │
                    │  │ McpContext      │  │
                    │  └─────────────────┘  │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│  LLM CORE     │       │  DATABASE     │       │    MCP        │
│               │       │               │       │               │
│ ├─manager.ts  │       │ ├─Manager.ts  │       │ ├─Manager.ts  │
│ ├─base.ts     │       │ ├─schema.ts   │       │ ├─types.ts    │
│ ├─openai.ts   │       │ ├─vector/     │       │ └─utils.ts    │
│ ├─anthropic.ts│       │ └─json/       │       │               │
│ └─...         │       │               │       │               │
└───────┬───────┘       └───────┬───────┘       └───────┬───────┘
        │                       │                       │
        ▼                       ▼                       ▼
   External APIs          Vault Storage           MCP Servers
```

### 3.2 Module Descriptions

| Module | Path | Responsibility |
|--------|------|----------------|
| Plugin | `src/main.ts` | Lifecycle, command registration |
| Views | `src/ChatView.tsx`, `src/ApplyView.tsx` | Obsidian ItemViews |
| Components | `src/components/` | React UI components |
| Contexts | `src/contexts/` | React state providers |
| LLM Core | `src/core/llm/` | Provider abstractions |
| RAG | `src/core/rag/` | Embedding & search |
| MCP | `src/core/mcp/` | Tool protocol |
| Database | `src/database/` | PGlite + JSON storage |
| Settings | `src/settings/` | Schema & migrations |
| Types | `src/types/` | Shared type definitions |
| Utils | `src/utils/` | Helper functions |

---

## 4. Plugin Lifecycle

### 4.1 Startup Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│                     PLUGIN STARTUP                               │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │     onload()          │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│loadSettings() │       │registerViews()│       │registerCmds() │
│               │       │               │       │               │
│ Parse JSON    │       │ ChatView      │       │ open-chat     │
│ Migrate       │       │ ApplyView     │       │ add-selection │
│ Validate      │       │               │       │ rebuild-index │
└───────┬───────┘       └───────┬───────┘       └───────────────┘
        │                       │
        │                       ▼
        │               ┌───────────────┐
        │               │ addRibbonIcon │
        │               │ addSettingTab │
        │               └───────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│              LAZY INITIALIZATION (on first access)            │
│                                                               │
│  getDbManager()  ──►  DatabaseManager.create()                │
│       │                      │                                │
│       │                      ├── loadPGliteResources()        │
│       │                      ├── loadExistingDatabase()       │
│       │                      └── migrateDatabase()            │
│       │                                                       │
│       ▼                                                       │
│  getRAGEngine()  ──►  new RAGEngine(vectorManager)            │
│                                                               │
│  getMcpManager() ──►  new McpManager(settings)                │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 4.2 Shutdown Sequence

```
onunload()
    │
    ├── clearAllTimeouts()
    │
    ├── ragEngine?.cleanup()
    │       └── Cancel pending operations
    │
    ├── dbManager?.cleanup()
    │       └── save() → Write .smtcmp_vector_db.tar.gz
    │
    └── mcpManager?.cleanup()
            └── Disconnect all servers
```

### 4.3 Settings Change Propagation

```
User changes setting in UI
         │
         ▼
    saveSettings()
         │
         ├── Write to data.json
         │
         └── notifySettingsListeners()
                  │
         ┌───────┴───────────────────────┐
         │               │               │
         ▼               ▼               ▼
    ChatView        RAGEngine       McpManager
    (re-render)     (update model)  (reload servers)
```

---

## 5. LLM Provider System

### 5.1 Provider Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        LLM MANAGER                               │
│                    (src/core/llm/manager.ts)                    │
│                                                                 │
│  getProviderClient(provider: LLMProvider) → BaseLLMProvider     │
│  getChatModelClient(modelId, settings) → {provider, model}      │
│                                                                 │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PROVIDER FACTORY                             │
│                                                                 │
│  switch (provider.type) {                                       │
│    case 'openai':           return new OpenAIAuthenticatedProvider│
│    case 'anthropic':        return new AnthropicProvider        │
│    case 'gemini':           return new GeminiProvider           │
│    case 'groq':             return new GroqProvider             │
│    case 'ollama':           return new OllamaProvider           │
│    case 'openrouter':       return new OpenRouterProvider       │
│    case 'openai-compatible':return new OpenAICompatibleProvider │
│    case 'azure-openai':     return new AzureOpenAIProvider      │
│    case 'deepseek':         return new DeepSeekProvider         │
│    case 'perplexity':       return new PerplexityProvider       │
│    case 'mistral':          return new MistralProvider          │
│    case 'lmstudio':         return new LMStudioProvider         │
│    case 'morph':            return new MorphProvider            │
│    case 'claude-code':      return new ClaudeCodeProvider       │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Base Provider Interface

```typescript
abstract class BaseLLMProvider<P extends LLMProvider> {
  constructor(protected provider: P)

  abstract generateResponse(
    model: ChatModel,
    request: LLMRequestNonStreaming,
    options?: LLMOptions
  ): Promise<LLMResponseNonStreaming>

  abstract streamResponse(
    model: ChatModel,
    request: LLMRequestStreaming,
    options?: LLMOptions
  ): Promise<AsyncIterable<LLMResponseStreaming>>

  abstract getEmbedding(
    model: string,
    text: string
  ): Promise<number[]>
}
```

### 5.3 Provider Capabilities

| Provider | Chat | Stream | Embeddings | Tools | Vision |
|----------|:----:|:------:|:----------:|:-----:|:------:|
| OpenAI | ✓ | ✓ | ✓ | ✓ | ✓ |
| Anthropic | ✓ | ✓ | ✗ | ✓ | ✓ |
| Gemini | ✓ | ✓ | ✓ | ✓ | ✓ |
| Claude Code | ✓ | ✗* | ✗ | ✗ | ✗ |
| Ollama | ✓ | ✓ | ✓ | ✗ | ✗ |
| OpenRouter | ✓ | ✓ | ✗ | ✓ | ✓ |

*Claude Code returns complete response (simulated stream)

### 5.4 Message Adapters

Some providers require message format transformation:

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Smart       │    │  Message Adapter │    │  Provider SDK   │
│ Composer    │───►│                  │───►│                 │
│ Messages    │    │  - OpenAI        │    │  Native Format  │
│             │    │  - DeepSeek      │    │                 │
│             │    │  - Perplexity    │    │                 │
│             │    │  - Mistral       │    │                 │
└─────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 6. State Management

### 6.1 React Context Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CONTEXT PROVIDERS                           │
│                                                                 │
│  ChatViewProvider                                               │
│    └─ PluginProvider                                            │
│         └─ AppProvider                                          │
│              └─ SettingsProvider                                │
│                   └─ DarkModeProvider                           │
│                        └─ DatabaseProvider                      │
│                             └─ RAGProvider                      │
│                                  └─ McpProvider                 │
│                                       └─ DialogContainerProvider│
│                                            └─ Chat (component)  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Context Responsibilities

| Context | Hook | Provides |
|---------|------|----------|
| App | `useApp()` | Obsidian `App` instance |
| Plugin | `usePlugin()` | `SmartComposerPlugin` instance |
| Settings | `useSettings()` | `settings`, `setSettings()` |
| Database | `useDatabase()` | Database managers |
| RAG | `useRAG()` | `getRAGEngine()` |
| Mcp | `useMcp()` | `getMcpManager()` |
| DarkMode | `useDarkMode()` | `isDarkMode` boolean |
| ChatView | `useChatView()` | Current `ChatView` instance |
| DialogContainer | `useDialogContainer()` | Modal portal container |

### 6.3 Settings Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    SETTINGS FLOW                              │
│                                                              │
│  data.json ──► parseSmartComposerSettings() ──► Zod Schema  │
│      │                    │                         │        │
│      │                    ▼                         │        │
│      │            Migration Chain                   │        │
│      │         0→1→2→3→...→12→13                   │        │
│      │                    │                         │        │
│      │                    ▼                         ▼        │
│      │            Validated Settings ──► SettingsContext     │
│      │                                        │              │
│      │                                        │              │
│      ◄────────────────────────────────────────┘              │
│                      saveSettings()                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Database Layer

### 7.1 Database Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  DatabaseManager                         │   │
│  │                                                          │   │
│  │   ┌─────────────┐    ┌─────────────┐                    │   │
│  │   │   PGlite    │    │  Drizzle    │                    │   │
│  │   │  Instance   │◄──►│    ORM      │                    │   │
│  │   └─────────────┘    └─────────────┘                    │   │
│  │          │                                               │   │
│  │          ▼                                               │   │
│  │   ┌─────────────┐    ┌─────────────┐                    │   │
│  │   │   Vector    │    │   Legacy    │                    │   │
│  │   │   Manager   │    │  Template   │                    │   │
│  │   │             │    │   Manager   │                    │   │
│  │   └──────┬──────┘    └─────────────┘                    │   │
│  │          │                                               │   │
│  │          ▼                                               │   │
│  │   ┌─────────────┐                                       │   │
│  │   │   Vector    │                                       │   │
│  │   │ Repository  │                                       │   │
│  │   └─────────────┘                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌───────────────────┐    ┌───────────────────┐                │
│  │    ChatManager    │    │  TemplateManager  │                │
│  │   (JSON Files)    │    │   (JSON Files)    │                │
│  └─────────┬─────────┘    └─────────┬─────────┘                │
│            │                        │                          │
│            ▼                        ▼                          │
│      .smtcmp_json_db/         .smtcmp_json_db/                 │
│          chats/                  templates/                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Data Flow

```
User Query
    │
    ▼
RAGEngine.processQuery()
    │
    ├── 1. Update vault index (if needed)
    │       └── VectorManager.updateVaultIndex()
    │               ├── Chunk files
    │               ├── Generate embeddings
    │               └── Store in PGlite
    │
    ├── 2. Get query embedding
    │       └── Provider.getEmbedding(query)
    │
    └── 3. Similarity search
            └── VectorRepository.performSimilaritySearch()
                    └── SQL: SELECT ... ORDER BY embedding <=> query
```

---

## 8. MCP Integration

### 8.1 MCP Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       MCP INTEGRATION                            │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                     McpManager                          │    │
│  │                                                         │    │
│  │   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │    │
│  │   │  Server 1   │ │  Server 2   │ │  Server N   │      │    │
│  │   │  (state)    │ │  (state)    │ │  (state)    │      │    │
│  │   └──────┬──────┘ └──────┬──────┘ └──────┬──────┘      │    │
│  │          │               │               │              │    │
│  │          ▼               ▼               ▼              │    │
│  │   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │    │
│  │   │ MCP Client  │ │ MCP Client  │ │ MCP Client  │      │    │
│  │   │   (SDK)     │ │   (SDK)     │ │   (SDK)     │      │    │
│  │   └──────┬──────┘ └──────┬──────┘ └──────┬──────┘      │    │
│  │          │               │               │              │    │
│  └──────────┼───────────────┼───────────────┼──────────────┘    │
│             │               │               │                   │
│             ▼               ▼               ▼                   │
│      ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│      │ Process  │    │ Process  │    │ Process  │              │
│      │ (stdio)  │    │ (stdio)  │    │ (stdio)  │              │
│      └──────────┘    └──────────┘    └──────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Tool Execution Flow

```
LLM Response contains tool_call
           │
           ▼
   Parse tool name: "server__tool"
           │
           ▼
   McpManager.callTool(serverName, toolName, args)
           │
           ├── Check authorization
           │
           ├── Get server client
           │
           └── client.callTool({ name, arguments })
                   │
                   ▼
           Return tool result
                   │
                   ▼
           Continue LLM conversation
```

---

## 9. Build System

### 9.1 Build Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                      BUILD PIPELINE                              │
│                                                                 │
│  npm run build                                                  │
│       │                                                         │
│       ├── 1. TypeScript Check                                   │
│       │       └── tsc --noEmit                                  │
│       │                                                         │
│       └── 2. esbuild Bundle                                     │
│               │                                                 │
│               ├── Entry: src/main.ts                            │
│               ├── Output: main.js (CJS)                         │
│               ├── Externals: obsidian, codemirror, electron     │
│               ├── Plugins: PGlite shim                          │
│               └── Options: minify, tree-shake, sourcemaps       │
│                                                                 │
│  Output Files:                                                  │
│    ├── main.js       (~8 MB)                                    │
│    ├── manifest.json                                            │
│    └── styles.css                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 esbuild Configuration

**Source:** `esbuild.config.mjs`

```javascript
{
  entryPoints: ['src/main.ts'],
  bundle: true,
  format: 'cjs',
  target: 'es2018',
  platform: 'node',
  external: [
    'obsidian',
    'electron',
    '@codemirror/*',
    '@lezer/*',
    '@lexical/clipboard'
  ],
  plugins: [
    // PGlite shim: makes it think it's in browser
    pgliteShimPlugin()
  ],
  minify: production,
  treeShaking: production,
  sourcemap: production ? false : 'inline'
}
```

### 9.3 Development Workflow

```
npm run dev
    │
    └── esbuild --watch
            │
            ├── Watch src/**/*.ts
            ├── Rebuild on change
            └── Output to main.js

# Copy to vault:
cp main.js manifest.json styles.css <vault>/.obsidian/plugins/smart-composer/
```

---

## 10. Directory Structure

### 10.1 Complete Tree

```
obsidian-smart-composer-homeheart-UPGRADED/
├── src/
│   ├── main.ts                    # Plugin entry point
│   ├── ChatView.tsx               # Chat ItemView
│   ├── ApplyView.tsx              # Apply ItemView
│   ├── constants.ts               # App constants, defaults
│   │
│   ├── components/                # React components
│   │   ├── chat-view/             # Chat UI
│   │   │   ├── Chat.tsx           # Main chat component
│   │   │   ├── ChatUserInput.tsx  # User input editor
│   │   │   ├── UserMessageItem.tsx
│   │   │   ├── AssistantMessageContent.tsx
│   │   │   ├── AssistantMessageReasoning.tsx
│   │   │   ├── ToolMessage.tsx
│   │   │   ├── chat-input/        # Input sub-components
│   │   │   │   ├── plugins/       # Lexical plugins
│   │   │   │   └── ...
│   │   │   └── ...
│   │   ├── settings/              # Settings UI
│   │   │   ├── sections/          # Settings sections
│   │   │   └── modals/            # Settings modals
│   │   ├── common/                # Shared UI components
│   │   └── modals/                # Generic modals
│   │
│   ├── contexts/                  # React contexts
│   │   ├── app-context.tsx
│   │   ├── plugin-context.tsx
│   │   ├── settings-context.tsx
│   │   ├── database-context.tsx
│   │   ├── rag-context.tsx
│   │   └── mcp-context.tsx
│   │
│   ├── core/                      # Core services
│   │   ├── llm/                   # LLM providers
│   │   │   ├── manager.ts         # Provider factory
│   │   │   ├── base.ts            # Base provider class
│   │   │   ├── openai.ts
│   │   │   ├── anthropic.ts
│   │   │   ├── claudeCode.ts      # Claude Code CLI
│   │   │   └── ...
│   │   ├── rag/                   # RAG engine
│   │   │   ├── ragEngine.ts
│   │   │   └── embedding.ts
│   │   └── mcp/                   # MCP integration
│   │       ├── mcpManager.ts
│   │       └── tool-name-utils.ts
│   │
│   ├── database/                  # Data layer
│   │   ├── DatabaseManager.ts     # PGlite manager
│   │   ├── schema.ts              # Drizzle schema
│   │   ├── migrations.json        # Migration history
│   │   ├── modules/
│   │   │   ├── vector/            # Vector storage
│   │   │   │   ├── VectorManager.ts
│   │   │   │   └── VectorRepository.ts
│   │   │   └── template/          # Legacy templates
│   │   └── json/                  # JSON storage
│   │       ├── base.ts
│   │       ├── chat/
│   │       └── template/
│   │
│   ├── settings/                  # Settings system
│   │   ├── schema/
│   │   │   ├── setting.types.ts   # Schema version
│   │   │   ├── settings.ts        # Parser
│   │   │   └── migrations/        # Migration functions
│   │   └── SettingTab.tsx
│   │
│   ├── types/                     # Type definitions
│   │   ├── chat.ts
│   │   ├── provider.types.ts
│   │   ├── chat-model.types.ts
│   │   ├── embedding-model.types.ts
│   │   ├── tool-call.types.ts
│   │   ├── mcp.types.ts
│   │   ├── mentionable.ts
│   │   └── llm/
│   │       ├── request.ts
│   │       └── response.ts
│   │
│   ├── utils/                     # Utilities
│   │   ├── chat/
│   │   ├── llm/
│   │   └── common/
│   │
│   └── hooks/                     # React hooks
│       ├── useChatHistory.ts
│       └── useJsonManagers.ts
│
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md            # This file
│   ├── DATABASE_SPEC.md
│   ├── CLAUDE_CODE_PROVIDER_SPEC.md
│   └── ...
│
├── tests/                         # Test files
│   └── ...
│
├── manifest.json                  # Obsidian manifest
├── package.json                   # npm dependencies
├── tsconfig.json                  # TypeScript config
├── esbuild.config.mjs             # Build config
├── drizzle.config.ts              # Drizzle config
└── README.md
```

### 10.2 Key File Purposes

| File | Purpose |
|------|---------|
| `src/main.ts` | Plugin lifecycle, command registration |
| `src/constants.ts` | All app constants, defaults, pricing |
| `src/ChatView.tsx` | Chat panel ItemView wrapper |
| `src/components/chat-view/Chat.tsx` | Main chat React component |
| `src/core/llm/manager.ts` | LLM provider factory |
| `src/core/rag/ragEngine.ts` | RAG orchestration |
| `src/database/DatabaseManager.ts` | PGlite lifecycle |
| `src/settings/schema/settings.ts` | Settings parser |
| `manifest.json` | Obsidian plugin metadata |

---

## Appendix: Architecture Decision Records

See [CLAUDE_CODE_PROVIDER_SPEC.md](CLAUDE_CODE_PROVIDER_SPEC.md) Section 13 for detailed ADRs on:
- CLI wrapper vs SDK integration
- Message formatting
- Thinking level implementation
- Model ID naming
- Embedding support
- Desktop-only restriction
- spawn() configuration
- Simulated streaming

---

**END OF ARCHITECTURE DOCUMENT**
