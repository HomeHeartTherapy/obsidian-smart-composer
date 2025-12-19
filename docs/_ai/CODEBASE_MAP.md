# Codebase Map

Annotated file-by-file guide to the source code.

---

## Directory Overview

```
src/
├── main.ts                    # Plugin lifecycle (onload, onunload)
├── constants.ts               # Global constants
│
├── components/                # React UI components
│   ├── chat-view/            # Chat interface (COMPLEX)
│   ├── apply-view/           # Diff/apply view
│   ├── settings/             # Settings UI
│   ├── common/               # Reusable components
│   └── modals/               # Modal dialogs
│
├── contexts/                  # React Context providers (9 total)
│   ├── PluginContext.tsx     # Plugin instance
│   ├── AppContext.tsx        # Obsidian App
│   ├── SettingsContext.tsx   # Settings state
│   ├── DatabaseContext.tsx   # DB connection
│   ├── RAGContext.tsx        # RAG engine
│   ├── McpContext.tsx        # MCP servers
│   └── ...
│
├── core/                      # Core business logic
│   ├── llm/                  # LLM provider implementations (16)
│   ├── mcp/                  # MCP integration
│   └── rag/                  # RAG system
│
├── database/                  # Data persistence
│   ├── DatabaseManager.ts    # PGlite initialization
│   ├── schema.ts             # Drizzle schema
│   ├── modules/              # SQL-based storage
│   └── json/                 # JSON file storage
│
├── settings/                  # Settings management
│   ├── settings.ts           # Load/save logic
│   └── schema/               # Zod schema + migrations
│
├── types/                     # TypeScript type definitions
│
├── utils/                     # Utility functions
│
└── hooks/                     # React hooks
```

---

## File Details

### Entry Point

#### `src/main.ts`
- **Purpose**: Plugin lifecycle management
- **Complexity**: LOW
- **Key Methods**:
  - `onload()` - Initialize plugin, register views
  - `onunload()` - Cleanup resources
- **Creates**: ChatView, ApplyView, SettingsTab

---

### Components (src/components/)

#### `chat-view/Chat.tsx`
- **Purpose**: Main chat container
- **Complexity**: HIGH (500+ lines)
- **State**: inputMessage, chatMessages, conversationId, queryProgress
- **Key Methods**:
  - `handleUserMessageSubmit()` - Process user message
  - `handleApply()` - Open apply view
  - `handleToolMessageUpdate()` - Handle MCP tool responses
- **Dependencies**: SettingsContext, RAGContext, McpContext

#### `chat-view/chat-input/ChatUserInput.tsx`
- **Purpose**: Rich text input with Lexical
- **Complexity**: MEDIUM
- **Features**: @mentions, image paste, template insertion
- **Children**: LexicalContentEditable, MentionableBadge, ModelSelect

#### `chat-view/chat-input/LexicalContentEditable.tsx`
- **Purpose**: Lexical editor wrapper
- **Complexity**: MEDIUM
- **Plugins**: MentionPlugin, TemplatePlugin, OnEnterPlugin, ImagePastePlugin

#### `apply-view/ApplyViewRoot.tsx`
- **Purpose**: Side-by-side diff viewer
- **Complexity**: MEDIUM
- **Features**: Accept/reject changes, navigate diffs
- **Uses**: vscode-diff library

---

### Core (src/core/)

#### `llm/manager.ts`
- **Purpose**: LLM provider factory
- **Complexity**: LOW
- **Pattern**: Switch statement over provider types
- **Functions**:
  - `getProviderClient()` - Get provider by ID
  - `getChatModelClient()` - Get provider + model

#### `llm/base.ts`
- **Purpose**: Abstract base class for providers
- **Complexity**: LOW
- **Methods**: `generateResponse()`, `streamResponse()`, `getEmbedding()`

#### `llm/anthropic.ts`
- **Purpose**: Anthropic Claude provider
- **Complexity**: MEDIUM
- **Features**: Thinking blocks, tool use translation
- **Note**: Different tool format than OpenAI

#### `llm/openai.ts`
- **Purpose**: OpenAI provider
- **Complexity**: MEDIUM
- **Features**: Embeddings, reasoning models

#### `llm/claudeCode.ts`
- **Purpose**: Claude Code CLI provider
- **Complexity**: MEDIUM
- **Note**: Uses CLI subprocess, not API
- **Features**: 5 thinking levels, 16 model variants

#### `mcp/mcpManager.ts`
- **Purpose**: MCP server lifecycle management
- **Complexity**: HIGH
- **Features**: Server connect/disconnect, tool execution
- **Transport**: stdio only (disabled on mobile)

#### `rag/ragEngine.ts`
- **Purpose**: RAG query orchestration
- **Complexity**: MEDIUM
- **Methods**:
  - `updateVaultIndex()` - Reindex vault
  - `processQuery()` - Similarity search

---

### Database (src/database/)

#### `DatabaseManager.ts`
- **Purpose**: PGlite initialization
- **Complexity**: HIGH
- **Key Details**:
  - Loads WASM from unpkg CDN
  - Custom migration workaround (undocumented API)
  - Manages VectorManager, TemplateManager
- **Storage**: `.smtcmp_vector_db.tar.gz`

#### `schema.ts`
- **Purpose**: Drizzle schema definition
- **Complexity**: MEDIUM
- **Tables**: embeddings (with pgvector)
- **Custom Type**: vectorType for number[] ↔ vector

#### `modules/vector/VectorManager.ts`
- **Purpose**: Vector storage/retrieval
- **Complexity**: MEDIUM
- **Methods**:
  - `performSimilaritySearch()` - Cosine similarity
  - `updateVaultIndex()` - Chunk and embed files
- **Uses**: LangChain RecursiveCharacterTextSplitter

#### `json/chat/ChatManager.ts`
- **Purpose**: Chat persistence to JSON files
- **Complexity**: LOW
- **Storage**: `.smtcmp_json_db/chats/`
- **Naming**: `v1_{title}_{timestamp}_{id}.json`

---

### Settings (src/settings/)

#### `settings.ts`
- **Purpose**: Load/save settings with migrations
- **Complexity**: MEDIUM
- **Pattern**: Version-based migration chain (v0→v13)

#### `schema/setting.types.ts`
- **Purpose**: Zod schema for settings
- **Complexity**: MEDIUM
- **Pattern**: `.catch()` for all optional fields

#### `schema/migrations/*.ts`
- **Purpose**: Settings schema migrations
- **Complexity**: LOW each
- **Count**: 13 migration files (0_to_1 through 12_to_13)

---

### Types (src/types/)

#### `chat.ts`
- **Types**: ChatMessage, ChatUserMessage, ChatAssistantMessage, ChatToolMessage

#### `provider.types.ts`
- **Types**: LLMProvider (discriminated union of 16 providers)

#### `chat-model.types.ts`
- **Types**: ChatModel (provider-specific fields)

#### `mentionable.ts`
- **Types**: Mentionable (file, folder, vault, block, url, image)

#### `tool-call.types.ts`
- **Types**: ToolCallRequest, ToolCallResponse, ToolCallResponseStatus

---

### Utils (src/utils/)

#### `chat/promptGenerator.ts`
- **Purpose**: Build LLM request messages
- **Complexity**: HIGH
- **Features**: RAG integration, file content, image handling

#### `chat/responseGenerator.ts`
- **Purpose**: Handle streaming LLM responses
- **Complexity**: HIGH
- **Features**: Tool call execution, auto-iteration

#### `llm/token.ts`
- **Purpose**: Token counting with js-tiktoken
- **Note**: Slow for large texts, avoid in hot paths

---

## Complexity Legend

| Level | Lines | State | Notes |
|-------|-------|-------|-------|
| LOW | <100 | Minimal | Straightforward logic |
| MEDIUM | 100-300 | Some | Domain complexity |
| HIGH | 300+ | Complex | State machines, many effects |

---

## Data Flow Summary

### User Message → Response
```
ChatUserInput.onSubmit
  → Chat.handleUserMessageSubmit
    → PromptGenerator.compileUserMessagePrompt
      → (optional) RAGEngine.processQuery
    → ResponseGenerator.run
      → provider.streamResponse
    → setChatMessages
```

### Settings Change
```
SettingsTab → setSettings
  → saveSettings (data.json)
  → SettingsContext update
  → Component re-renders
```

### MCP Tool Call
```
ToolMessage (PendingApproval)
  → User clicks Allow
  → mcpManager.callTool
  → onResponseUpdate (Running → Success/Error)
  → Chat.handleContinueResponse
```

---

*Last Updated: December 2024*
