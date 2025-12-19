# Quick Reference Card

One-page cheat sheet for common operations.

---

## Commands

```bash
npm run dev          # Development build with watch
npm run build        # Production build
npm run type:check   # TypeScript validation
npm run lint:check   # ESLint + Prettier check
npm run lint:fix     # Auto-fix lint issues
npm run test         # Run Jest tests
npm run migrate:compile  # Generate DB migrations
```

---

## Key File Locations

| What | Where |
|------|-------|
| Plugin entry | `src/main.ts` |
| LLM providers | `src/core/llm/*.ts` |
| Provider factory | `src/core/llm/manager.ts` |
| Database manager | `src/database/DatabaseManager.ts` |
| Database schema | `src/database/schema.ts` |
| Settings schema | `src/settings/schema/setting.types.ts` |
| Settings migrations | `src/settings/schema/migrations/*.ts` |
| Chat component | `src/components/chat-view/Chat.tsx` |
| MCP manager | `src/core/mcp/mcpManager.ts` |
| RAG engine | `src/core/rag/ragEngine.ts` |
| Type definitions | `src/types/*.ts` |

---

## Data Storage

| Data | Location |
|------|----------|
| Vector DB | `.smtcmp_vector_db.tar.gz` |
| Chats | `.smtcmp_json_db/chats/*.json` |
| Templates | `.smtcmp_json_db/templates/*.json` |
| Settings | `data.json` (Obsidian plugin data) |

---

## Code Snippets

### Get Database
```typescript
const { getDatabaseManager } = useDatabase()
const db = await getDatabaseManager()
```

### Get Settings
```typescript
const { settings, setSettings } = useSettings()
```

### Get LLM Provider
```typescript
const provider = getProviderClient({ settings, providerId: 'openai' })
const { providerClient, model } = getChatModelClient({ settings, modelId: 'gpt-4' })
```

### Stream Response
```typescript
const stream = await provider.streamResponse(model, request)
for await (const chunk of stream) {
  // chunk.choices[0].delta.content
}
```

### Get Embedding
```typescript
const embedding = await provider.getEmbedding('text-embedding-3-small', text)
```

### Similarity Search
```typescript
const vectorManager = await getVectorManager()
const results = await vectorManager.performSimilaritySearch(
  queryVector,
  embeddingModel,
  { minSimilarity: 0.7, limit: 10 }
)
```

### Reindex Vault
```typescript
const ragEngine = await getRAGEngine()
await ragEngine.updateVaultIndex({ reindexAll: true })
```

### Call MCP Tool
```typescript
const mcpManager = await getMcpManager()
const result = await mcpManager.callTool({
  name: 'serverName__toolName',
  args: { param: 'value' }
})
```

---

## Version Matrix

| Dependency | Version | Purpose |
|------------|---------|---------|
| PGlite | 0.2.12 | Database |
| Drizzle | 0.39.0 | ORM |
| Lexical | 0.17.1 | Editor |
| React | 18.3.1 | UI |
| Zod | 3.23.8 | Validation |
| OpenAI SDK | 4.91.1 | LLM |
| Anthropic SDK | 0.39.0 | LLM |
| esbuild | 0.17.3 | Build |
| TypeScript | 5.9.3 | Language |

---

## Context Provider Order

```
PluginProvider
  └─ AppProvider
       └─ SettingsProvider
            └─ DarkModeProvider
                 └─ DatabaseProvider
                      └─ RAGProvider
                           └─ McpProvider
                                └─ DialogContainerProvider
                                     └─ ChatViewProvider
```

---

## Type Cheat Sheet

### Messages
```typescript
type ChatMessage = ChatUserMessage | ChatAssistantMessage | ChatToolMessage

interface ChatUserMessage {
  role: 'user'
  content: SerializedEditorState | null
  promptContent: string | ContentPart[] | null
  mentionables: Mentionable[]
}

interface ChatAssistantMessage {
  role: 'assistant'
  content: string
  reasoning?: string
  toolCallRequests?: ToolCallRequest[]
}
```

### Providers
```typescript
type LLMProviderType = 'openai' | 'anthropic' | 'gemini' | 'groq' |
  'claude-code' | 'ollama' | 'lm-studio' | 'azure-openai' |
  'mistral' | 'perplexity' | 'deepseek' | 'openrouter' |
  'morph' | 'openai-compatible'
```

### Mentionables
```typescript
type Mentionable =
  | { type: 'file'; file: TFile }
  | { type: 'folder'; folder: TFolder }
  | { type: 'vault' }
  | { type: 'current-file'; file: TFile | null }
  | { type: 'block'; content: string; file: TFile; startLine: number; endLine: number }
  | { type: 'url'; url: string }
  | { type: 'image'; name: string; mimeType: string; data: string }
```

---

## Settings Migration Pattern

```typescript
// src/settings/schema/migrations/N_to_N+1.ts
export const migrateFromNToN1: SettingMigration['migrate'] = (data) => {
  return {
    ...data,
    version: N + 1,
    newField: data.newField ?? 'default',
  }
}
```

---

## Adding New Provider Checklist

1. [ ] Add to `provider.types.ts` discriminated union
2. [ ] Create provider class in `src/core/llm/`
3. [ ] Register in `manager.ts` factory
4. [ ] Add default config in `migrationUtils.ts`
5. [ ] Add settings UI in `ProvidersSection.tsx`
6. [ ] Create settings migration
7. [ ] Update tests

---

## Debugging

```typescript
// Check DB state
const stats = await vectorManager.getEmbeddingStats()
console.log(stats)

// Check MCP servers
const servers = mcpManager.getServers()
console.log(servers.map(s => ({ name: s.name, status: s.status })))

// Check settings version
console.log('Version:', settings.version, 'Expected:', SETTINGS_SCHEMA_VERSION)

// Force reindex
await ragEngine.updateVaultIndex({ reindexAll: true })
```

---

## Links

| Resource | Location |
|----------|----------|
| Full architecture | [ARCHITECTURE.md](../../ARCHITECTURE.md) |
| All decisions | [ADR.md](../../ADR.md) |
| Type definitions | [API_REFERENCE.md](../../API_REFERENCE.md) |
| Common tasks | [COMMON_TASKS.md](../_ai/COMMON_TASKS.md) |
| Known issues | [GOTCHAS.md](../_ai/GOTCHAS.md) |
| External docs | [DOCUMENTATION_REFERENCES.md](../../DOCUMENTATION_REFERENCES.md) |

---

*Last Updated: December 2024*
