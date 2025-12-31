# Common Tasks Guide

Step-by-step instructions for frequent development tasks.

---

## Table of Contents

1. [Add a New LLM Provider](#add-a-new-llm-provider)
2. [Add a New Chat Model](#add-a-new-chat-model)
3. [Modify Database Schema](#modify-database-schema)
4. [Add a New Setting](#add-a-new-setting)
5. [Create a Settings Migration](#create-a-settings-migration)
6. [Add a New React Component](#add-a-new-react-component)
7. [Add a New MCP Tool Handler](#add-a-new-mcp-tool-handler)
8. [Debug Common Issues](#debug-common-issues)

---

## Add a New LLM Provider

### Step 1: Define Provider Type
**File**: `src/types/provider.types.ts`

Add to the discriminated union:
```typescript
// In llmProviderSchema
z.object({
  type: z.literal('my-provider'),
  id: z.string(),
  baseUrl: z.string().optional(),
  apiKey: z.string().optional(),
  // Add provider-specific fields
}),
```

### Step 2: Create Provider Class
**File**: `src/core/llm/myProvider.ts`

```typescript
import { BaseLLMProvider } from './base'
import { LLMProvider } from '@/types/provider.types'

export class MyProvider extends BaseLLMProvider<Extract<LLMProvider, { type: 'my-provider' }>> {
  private client: MySDKClient

  constructor(provider: Extract<LLMProvider, { type: 'my-provider' }>) {
    super(provider)
    this.client = new MySDKClient({
      apiKey: provider.apiKey,
      baseURL: provider.baseUrl,
    })
  }

  async generateResponse(model, request, options) {
    // Implement non-streaming
  }

  async streamResponse(model, request, options) {
    // Implement streaming (return AsyncIterable)
  }

  async getEmbedding(model, text) {
    // Implement or throw if not supported
    throw new Error('Embeddings not supported')
  }
}
```

### Step 3: Register in Factory
**File**: `src/core/llm/manager.ts`

```typescript
case 'my-provider':
  return new MyProvider(provider as Extract<LLMProvider, { type: 'my-provider' }>)
```

### Step 4: Add Default Config
**File**: `src/settings/schema/migrations/migrationUtils.ts`

Add to `DEFAULT_PROVIDERS`:
```typescript
{
  type: 'my-provider',
  id: 'my-provider-default',
  baseUrl: 'https://api.myprovider.com',
}
```

### Step 5: Add Settings UI
**File**: `src/components/settings/sections/ProvidersSection.tsx`

Add UI section for API key, base URL, etc.

### Step 6: Create Migration
See [Create a Settings Migration](#create-a-settings-migration)

---

## Add a New Chat Model

### Step 1: Update Chat Model Schema (if new provider type)
**File**: `src/types/chat-model.types.ts`

If adding provider-specific fields:
```typescript
z.object({
  providerType: z.literal('my-provider'),
  providerId: z.string(),
  id: z.string(),
  model: z.string(),
  promptLevel: z.nativeEnum(PromptLevel),
  enable: z.boolean(),
  // Provider-specific:
  myCustomOption: z.boolean().optional(),
}),
```

### Step 2: Add Default Model
**File**: `src/settings/schema/migrations/migrationUtils.ts`

Add to `DEFAULT_CHAT_MODELS`:
```typescript
{
  providerType: 'my-provider',
  providerId: 'my-provider-default',
  id: 'my-model-1',
  model: 'my-model-name',
  promptLevel: PromptLevel.Default,
  enable: true,
}
```

### Step 3: Create Migration
Increment settings version and add migration.

---

## Modify Database Schema

### Step 1: Update Schema
**File**: `src/database/schema.ts`

```typescript
// Add new column or table
export const myNewTable = pgTable('my_table', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  // ...
})
```

### Step 2: Generate Migration
```bash
npm run migrate:compile
```

This generates SQL in `drizzle/` directory.

### Step 3: Test Migration
```bash
npm test -- --grep migration
```

### Step 4: Handle Existing Data
If modifying existing tables, ensure migration handles existing rows.

---

## Add a New Setting

### Step 1: Add to Zod Schema
**File**: `src/settings/schema/setting.types.ts`

```typescript
// In smartComposerSettingsSchema
myNewSetting: z.boolean().catch(false),  // Use .catch() for default
myComplexSetting: z.object({
  enabled: z.boolean(),
  value: z.number(),
}).catch({ enabled: false, value: 0 }),
```

### Step 2: Create Migration
**File**: `src/settings/schema/migrations/{N}_to_{N+1}.ts`

```typescript
export const migrateFromNToN1: SettingMigration['migrate'] = (data) => {
  return {
    ...data,
    version: N + 1,
    myNewSetting: data.myNewSetting ?? false,
  }
}
```

### Step 3: Update Version
**File**: `src/settings/schema/setting.types.ts`

```typescript
export const SETTINGS_SCHEMA_VERSION = N + 1
```

### Step 4: Register Migration
**File**: `src/settings/schema/migrations/index.ts`

```typescript
import { migrateFromNToN1 } from './{N}_to_{N+1}'

export const SETTING_MIGRATIONS: SettingMigration[] = [
  // ... existing
  { fromVersion: N, toVersion: N + 1, migrate: migrateFromNToN1 },
]
```

### Step 5: Add UI Control
**File**: `src/components/settings/sections/...`

---

## Create a Settings Migration

### Template
**File**: `src/settings/schema/migrations/{N}_to_{N+1}.ts`

```typescript
import { SettingMigration } from '../setting.types'

export const migrateFromNToN1: SettingMigration['migrate'] = (data) => {
  const newData = { ...data }

  // ALWAYS set new version
  newData.version = N + 1

  // Add new fields with defaults
  if (newData.myField === undefined) {
    newData.myField = 'default'
  }

  // Transform existing fields
  if (newData.oldField) {
    newData.newField = transformOldToNew(newData.oldField)
  }

  return newData
}
```

### Important Rules

1. **Always increment version**: `newData.version = N + 1`
2. **Be idempotent**: Check if change already applied
3. **Use defaults**: Never assume field exists
4. **Test thoroughly**: Migrations run on user data

### Test Template
**File**: `src/settings/schema/migrations/{N}_to_{N+1}.test.ts`

```typescript
describe('migrateFromNToN1', () => {
  it('should add new field with default', () => {
    const input = { version: N, /* existing fields */ }
    const result = migrateFromNToN1(input)
    expect(result.version).toBe(N + 1)
    expect(result.myField).toBe('default')
  })

  it('should preserve existing values', () => {
    const input = { version: N, existingField: 'value' }
    const result = migrateFromNToN1(input)
    expect(result.existingField).toBe('value')
  })
})
```

---

## Add a New React Component

### Step 1: Create Component File
**File**: `src/components/[category]/MyComponent.tsx`

```typescript
import React from 'react'

interface MyComponentProps {
  value: string
  onChange: (value: string) => void
}

export function MyComponent({ value, onChange }: MyComponentProps) {
  return (
    <div className="smtcmp-my-component">
      {/* content */}
    </div>
  )
}
```

### Step 2: Add Styles (if needed)
**File**: `styles.css`

```css
.smtcmp-my-component {
  /* styles */
}
```

### Step 3: Use Contexts (if needed)
```typescript
import { useSettings } from '@/contexts/SettingsContext'
import { useApp } from '@/contexts/AppContext'

export function MyComponent() {
  const { settings } = useSettings()
  const app = useApp()
  // ...
}
```

---

## Add a New MCP Tool Handler

MCP tools are handled dynamically. To add special handling:

### Custom Tool Response Formatting
**File**: `src/core/mcp/mcpManager.ts`

The `callTool` method handles all tools generically. For custom formatting:

```typescript
async callTool({ name, args }) {
  // Parse tool name
  const { serverName, toolName } = parseToolName(name)

  // Get server client
  const server = this.servers.find(s => s.name === serverName)

  // Call tool
  const result = await server.client.callTool({ name: toolName, arguments: args })

  // Custom handling for specific tools
  if (toolName === 'my-special-tool') {
    return formatMySpecialToolResult(result)
  }

  return result
}
```

---

## Debug Common Issues

### PGlite Not Initializing
```typescript
// Check WASM loading
console.log('Loading PGlite...')
const db = await getDatabaseManager()
console.log('PGlite loaded:', db.getDb())
```

### Vector Search Returns No Results
```typescript
// Check index stats
const stats = await vectorManager.getEmbeddingStats()
console.log('Embedding stats:', stats)

// Force reindex
await ragEngine.updateVaultIndex({ reindexAll: true })
```

### Settings Not Persisting
```typescript
// Check migration chain
console.log('Settings version:', settings.version)
console.log('Expected:', SETTINGS_SCHEMA_VERSION)

// Manual migration test
const raw = await plugin.loadData()
console.log('Raw settings:', raw)
```

### MCP Server Not Connecting
```typescript
// Check server state
const servers = mcpManager.getServers()
console.log('Server states:', servers.map(s => ({ name: s.name, status: s.status })))

// Check for errors
servers.filter(s => s.status === 'error').forEach(s => console.error(s.error))
```

### Lexical Editor Issues
```typescript
// Get editor state
const state = editor.getEditorState()
console.log('Editor state:', JSON.stringify(state.toJSON(), null, 2))

// Force update
editor.update(() => {
  // modifications
})
```

---

*Last Updated: December 2024*
