# Known Gotchas and Pitfalls

Things that will bite you if you don't know about them.

---

## Database

### PGlite IN_NODE Check
**Problem**: PGlite checks if running in Node.js and behaves differently.

**Symptom**: "process is not defined" or weird initialization errors.

**Cause**: PGlite has this check:
```javascript
typeof process === 'object' &&
typeof process.versions === 'object' &&
typeof process.versions.node === 'string'
```

**Solution**: The `esbuild.config.mjs` has a shimPlugin that injects `const process = {}` at the top of PGlite files.

**If broken**: Check that shimPlugin is in esbuild config and targeting correct files.

---

### Drizzle Browser Migrations
**Problem**: Drizzle's `migrate()` function doesn't work in browser environment.

**Symptom**: Migration fails silently or throws about missing Node.js APIs.

**Solution**: Using undocumented internal API in `DatabaseManager.ts`:
```typescript
// Line ~168
const { readMigrationFiles } = await import('drizzle-orm/migrator')
```

**Reference**: https://github.com/drizzle-team/drizzle-orm/discussions/2532

**Risk**: May break in future Drizzle versions. Monitor Drizzle releases.

---

### pgvector Dimension Mismatch
**Problem**: Can't query vectors with different dimensions than the index.

**Symptom**: "dimension mismatch" error on similarity search.

**Cause**: pgvector indexes are dimension-specific.

**Solution**: Partial indexes per dimension in `schema.ts`:
```typescript
supportedDimensionsForIndex.map((dimension) =>
  index(`embeddings_embedding_${dimension}_index`)
    .using('hnsw', sql.raw(`(${table.embedding.name}::vector(${dimension})) vector_cosine_ops`))
    .where(sql.raw(`${table.dimension.name} = ${dimension}`))
)
```

**Supported dimensions**: 128, 256, 384, 512, 768, 1024, 1280, 1536, 1792

---

### Database Vacuum Required
**Problem**: Deleted vectors still take space until vacuum.

**Symptom**: Database file grows but stats show fewer rows.

**Solution**: Call `vacuum()` periodically:
```typescript
await databaseManager.vacuum()
```

---

## LLM Providers

### Anthropic Tool Call Format
**Problem**: Anthropic uses different tool call format than OpenAI.

**OpenAI format**:
```json
{ "function_call": { "name": "...", "arguments": "..." } }
```

**Anthropic format**:
```json
{ "type": "tool_use", "id": "...", "name": "...", "input": {...} }
```

**Solution**: Translation layer in `anthropic.ts`.

**Watch for**: Tool results also differ (`tool_result` vs `function` role).

---

### OpenAI Streaming Token Usage
**Problem**: Token usage stats only appear in final streaming chunk.

**Symptom**: `usage` is undefined in most chunks.

**Solution**: Accumulate chunks and extract usage from last one:
```typescript
let lastChunk
for await (const chunk of stream) {
  lastChunk = chunk
  // process content
}
const usage = lastChunk?.usage
```

---

### Ollama CORS Issues
**Problem**: Ollama server may have CORS restrictions in browser.

**Symptom**: Network errors, "Failed to fetch".

**Solution**: Use `NoStainlessOpenAI` client (in `NoStainlessOpenAI.ts`) which bypasses stainless headers that trigger CORS.

---

### Claude Code CLI Path
**Problem**: Claude CLI must be in system PATH for Claude Code provider.

**Symptom**: "claude not found" or subprocess spawn errors.

**Solution**:
1. Ensure Claude Code is installed: `npm install -g @anthropic-ai/claude-code`
2. Verify path: `which claude` or `where claude`
3. Restart terminal/Obsidian after installation

**Windows Note**: May need to restart Obsidian after adding to PATH.

---

### Gemini No Custom Base URL
**Problem**: Gemini provider doesn't support custom base URL.

**Symptom**: Error thrown if baseUrl is provided.

**Location**: `gemini.ts` constructor

**Reason**: Google SDK doesn't support custom endpoints.

---

## React

### Lexical State Serialization
**Problem**: Can't store Lexical EditorState directly in React state.

**Symptom**: Weird rendering issues, state not updating.

**Wrong**:
```typescript
const [state, setState] = useState<EditorState>(...)
```

**Right**:
```typescript
const [state, setState] = useState<SerializedEditorState>(...)
// Use: editor.getEditorState().toJSON()
```

---

### Context Initialization Order
**Problem**: Contexts depend on each other in specific order.

**Symptom**: "Cannot read property of null" for context values.

**Required nesting order** (outermost to innermost):
1. PluginProvider
2. AppProvider
3. SettingsProvider
4. DarkModeProvider
5. DatabaseProvider
6. RAGProvider
7. McpProvider
8. DialogContainerProvider
9. ChatViewProvider

---

### React Query Cache Stale After Settings Change
**Problem**: Cached data becomes stale after settings update.

**Symptom**: Old data shows despite settings change.

**Solution**: Invalidate queries after settings update:
```typescript
queryClient.invalidateQueries({ queryKey: ['affected-query'] })
```

---

### useEffect Cleanup with Async
**Problem**: Async operations may complete after unmount.

**Symptom**: "Can't perform state update on unmounted component"

**Solution**:
```typescript
useEffect(() => {
  let mounted = true

  async function load() {
    const data = await fetchData()
    if (mounted) setData(data)
  }

  load()
  return () => { mounted = false }
}, [])
```

---

## Build

### Lexical Clipboard External
**Problem**: @lexical/clipboard has build issues with esbuild.

**Symptom**: Build errors about clipboard module.

**Solution**: Mark as external in `esbuild.config.mjs`:
```javascript
external: [
  // ...
  '@lexical/clipboard',
]
```

---

### Source Maps in Production
**Problem**: Source maps expose source code.

**Solution**: Disabled for production builds in esbuild config.

**Check**: Ensure `sourcemap: false` for production.

---

### Import Path Resolution
**Problem**: Relative imports can get messy.

**Solution**: Use `@/` alias configured in tsconfig.json:
```typescript
import { something } from '@/utils/something'
// instead of
import { something } from '../../../utils/something'
```

---

## Settings

### Migration Must Be Idempotent
**Problem**: Migrations can run multiple times.

**Symptom**: Duplicate data or errors on repeated runs.

**Pattern**:
```typescript
// WRONG
data.newField = 'value'

// RIGHT
if (data.newField === undefined) {
  data.newField = 'value'
}
```

---

### Zod .catch() for Defaults
**Problem**: Missing fields cause parse errors.

**Symptom**: Settings fail to load after update.

**Solution**: Use `.catch(defaultValue)` for ALL optional fields:
```typescript
// WRONG
myField: z.string().optional()

// RIGHT
myField: z.string().catch('default')
```

---

### Settings Version Must Be Literal
**Problem**: Version must match exact constant.

**Location**: `setting.types.ts`

```typescript
// WRONG
version: z.number()

// RIGHT
version: z.literal(SETTINGS_SCHEMA_VERSION)
```

---

## MCP

### Mobile Disabled
**Problem**: MCP requires Node.js subprocess spawning.

**Symptom**: Tools not available on mobile.

**Solution**: Explicitly disabled in `mcpManager.ts`:
```typescript
static disabled = !Platform.isDesktop
```

**Cannot fix**: iOS/Android don't support stdio subprocesses.

---

### Tool Name Delimiter
**Problem**: Tool names must be unique across all servers.

**Solution**: Prefix with server name using `__`:
```
serverName__toolName
```

**Parsing**: Use `parseToolName()` from `tool-name-utils.ts`.

**Validation**: Server names can't contain `__`.

---

### Server Environment Variables
**Problem**: MCP servers may need specific env vars.

**Solution**: Pass via server config:
```typescript
{
  parameters: {
    command: 'my-server',
    env: {
      MY_API_KEY: '...'
    }
  }
}
```

**Note**: Parent process env is inherited via `shell-env`.

---

### AbortController for Tool Calls
**Problem**: Long-running tools need cancellation support.

**Solution**: Pass `signal` to `callTool`:
```typescript
const controller = new AbortController()
await mcpManager.callTool({ name, args, signal: controller.signal })

// To cancel:
controller.abort()
```

---

## Performance

### Token Counting is Slow
**Problem**: js-tiktoken is slow for large texts.

**Symptom**: UI freezes during token counting.

**Solution**: Don't use in hot paths. Disabled in chunking:
```typescript
// VectorManager.ts comment:
// TODO: Use token-based chunking after migrating to WebAssembly-based tiktoken
```

---

### Large Vault Indexing
**Problem**: Indexing large vaults can take minutes.

**Symptom**: Progress bar stuck, high CPU.

**Solution**:
1. Use include/exclude patterns
2. Incremental indexing (default)
3. Batch size of 100 chunks

---

### React Re-renders
**Problem**: Excessive re-renders on settings change.

**Solution**:
1. Use `useMemo` for expensive computations
2. Split contexts by update frequency
3. Use `React.memo` for pure components

---

## Obsidian Plugin Deployment

### Chromium Code Cache Blocks Plugin Updates
**Problem**: Obsidian uses Chromium/Electron, which caches compiled JavaScript at the V8 level.

**Symptom**: Plugin changes don't appear despite:
- Updated main.js with correct content (verified by MD5)
- Multiple Obsidian restarts
- Plugin disable/enable cycles

**Cause**: Each vault has its own cache partition at:
```
C:\Users\{user}\AppData\Roaming\obsidian\Partitions\vault-{id}\
├── Code Cache\   <- Compiled JS cache (THE CULPRIT)
├── Cache\        <- General cache
└── ...
```

Vault IDs are mapped in `obsidian.json`:
```json
{"vaults": {"27bf24272b1bc5cb": {"path": "C:\\wcm-sync"}}}
```

**Solution - Full Cache Flush**:
```powershell
# 1. Close Obsidian completely (check Task Manager)

# 2. Rename workspace to force state refresh
cd C:\{vault}\.obsidian
ren workspace.json workspace.json.bak

# 3. Clear vault-specific Code Cache (replace {vault-id} with actual ID)
Remove-Item -Recurse "C:\Users\{user}\AppData\Roaming\obsidian\Partitions\vault-{vault-id}\Code Cache\*" -Force

# 4. Optionally clear general cache too
Remove-Item -Recurse "C:\Users\{user}\AppData\Roaming\obsidian\Partitions\vault-{vault-id}\Cache\*" -Force

# 5. Restart Obsidian
```

**Finding Vault ID**:
```powershell
cat "$env:APPDATA\obsidian\obsidian.json"
```

---

### Plugin Files Not Updating After Build
**Problem**: Obsidian caches plugin files even after copying new versions.

**Symptom**: Old UI/behavior persists after deploying new build.

**Solution**:
1. Delete entire plugin folder first
2. Copy fresh files
3. Clear Code Cache (see above)
4. Restart Obsidian

---

### Workspace.json Caches View State
**Problem**: Old plugin view state persists in workspace.json.

**Symptom**: Plugin panel shows old layout despite new code.

**Solution**: Rename workspace.json before restart:
```powershell
cd C:\{vault}\.obsidian
ren workspace.json workspace.json.bak
```

Obsidian will recreate it fresh on startup.

---

*Last Updated: 2024-12-19*
