# Database Technical Specification

**Document Version:** 1.0
**Date:** 2025-12-18
**Status:** Complete

---

## Table of Contents

1. [Overview](#1-overview)
2. [Storage Architecture](#2-storage-architecture)
3. [PGlite Vector Database](#3-pglite-vector-database)
4. [JSON File Database](#4-json-file-database)
5. [Database Initialization](#5-database-initialization)
6. [Schema Definitions](#6-schema-definitions)
7. [Vector Indexing System](#7-vector-indexing-system)
8. [Data Access Patterns](#8-data-access-patterns)
9. [Migration System](#9-migration-system)
10. [Backup & Recovery](#10-backup--recovery)
11. [Performance Considerations](#11-performance-considerations)

---

## 1. Overview

Smart Composer uses a **hybrid storage architecture**:

| Storage Type | Technology | Purpose | Location |
|--------------|------------|---------|----------|
| Vector Database | PGlite (PostgreSQL WASM) + pgvector | RAG embeddings, semantic search | `.smtcmp_vector_db.tar.gz` |
| JSON Database | Plain JSON files | Chat history, templates | `.smtcmp_json_db/` |

### 1.1 Why Hybrid?

- **PGlite**: High-performance vector similarity search using HNSW indexes
- **JSON Files**: Human-readable, easily portable, simple CRUD operations

### 1.2 File Locations

All database files are stored in the **vault root** (not the plugin folder):

```
<vault_root>/
├── .smtcmp_vector_db.tar.gz     # Compressed PGlite database
└── .smtcmp_json_db/             # JSON file storage
    ├── .initial_migration_completed  # Migration marker
    ├── chats/                   # Chat conversations
    │   └── v1_{title}_{timestamp}_{id}.json
    └── templates/               # Prompt templates
        └── v1_{name}_{id}.json
```

---

## 2. Storage Architecture

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Smart Composer Plugin                       │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
    ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
    │  DatabaseManager │     │   ChatManager   │     │TemplateManager  │
    │  (PGlite)        │     │   (JSON Files)  │     │  (JSON Files)   │
    └────────┬────────┘     └────────┬────────┘     └────────┬────────┘
             │                       │                       │
             ▼                       │                       │
    ┌─────────────────┐              │                       │
    │  VectorManager  │              │                       │
    └────────┬────────┘              │                       │
             │                       │                       │
             ▼                       ▼                       ▼
    ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
    │.smtcmp_vector_db│     │   chats/*.json  │     │templates/*.json │
    │   .tar.gz       │     │                 │     │                 │
    └─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 2.2 Manager Hierarchy

```typescript
DatabaseManager (singleton)
├── PGlite instance (PostgreSQL in WASM)
├── Drizzle ORM instance
├── VectorManager (embeddings & search)
│   └── VectorRepository (data access layer)
└── LegacyTemplateManager (PGlite templates - deprecated)
    └── TemplateRepository

ChatManager (JSON files)
└── AbstractJsonRepository<ChatConversation>

TemplateManager (JSON files)
└── AbstractJsonRepository<Template>
```

---

## 3. PGlite Vector Database

### 3.1 What is PGlite?

PGlite is PostgreSQL compiled to WebAssembly, enabling a full SQL database in the browser/Electron without a server.

**Key Features:**
- Full PostgreSQL compatibility
- pgvector extension for vector similarity search
- HNSW (Hierarchical Navigable Small World) indexing
- Persistent storage via tar.gz compression

### 3.2 Database File: `.smtcmp_vector_db.tar.gz`

| Attribute | Value |
|-----------|-------|
| Format | Gzipped TAR archive |
| Typical Size | 4-10 MB (depends on vault size) |
| Contains | PostgreSQL data directory |
| Location | Vault root |

### 3.3 PGlite Initialization

**Source:** `src/database/DatabaseManager.ts`

```typescript
// Initialization flow
static async create(app: App): Promise<DatabaseManager> {
  // 1. Load WASM resources from CDN
  const { wasmModule, vectorBundle } = await loadPGliteResources()

  // 2. Check for existing database
  if (existingDatabase) {
    // Load from .smtcmp_vector_db.tar.gz
    db = await loadExistingDatabase()
  } else {
    // Create new empty database
    db = await createNewDatabase()
  }

  // 3. Run migrations
  await migrateDatabase(db)

  return new DatabaseManager(db)
}
```

### 3.4 Resource Loading

PGlite loads from unpkg CDN:
- `@electric-sql/pglite@0.2.12` - Core WASM bundle
- `@electric-sql/pglite@0.2.12/vector` - pgvector extension

### 3.5 Database Persistence

```typescript
// Save to disk (gzipped tar)
async save(): Promise<void> {
  const data = await this.db.dumpDataDir('gzip')
  await this.app.vault.adapter.writeBinary(PGLITE_DB_PATH, data)
}

// Constants
export const PGLITE_DB_PATH = '.smtcmp_vector_db.tar.gz'
```

---

## 4. JSON File Database

### 4.1 Directory Structure

```
.smtcmp_json_db/
├── .initial_migration_completed   # Marker file (empty)
├── chats/
│   ├── v1_My%20First%20Chat_1734567890123_abc123.json
│   ├── v1_Code%20Review_1734567890456_def456.json
│   └── ...
└── templates/
    ├── v1_Assessment_abc123.json
    ├── v1_Goals_def456.json
    └── ...
```

### 4.2 File Naming Convention

**Chats:** `v1_{urlEncodedTitle}_{updatedAtTimestamp}_{id}.json`
**Templates:** `v1_{urlEncodedName}_{id}.json`

| Component | Description |
|-----------|-------------|
| `v1_` | Schema version prefix |
| `{urlEncodedTitle}` | URL-encoded title/name (spaces → %20) |
| `{updatedAtTimestamp}` | Unix timestamp in milliseconds (chats only) |
| `{id}` | UUID identifier |

### 4.3 Base Repository Pattern

**Source:** `src/database/json/base.ts`

```typescript
abstract class AbstractJsonRepository<T, M> {
  protected basePath: string  // e.g., ".smtcmp_json_db/chats"

  async create(row: T): Promise<void>
  async read(fileName: string): Promise<T | null>
  async update(oldRow: T, newRow: T): Promise<void>
  async delete(fileName: string): Promise<void>
  async listMetadata(): Promise<(M & { fileName: string })[]>

  // Abstract methods for subclasses
  protected abstract buildFileName(row: T): string
  protected abstract extractMetadataFromFileName(fileName: string): M | null
}
```

---

## 5. Database Initialization

### 5.1 Plugin Startup Flow

**Source:** `src/main.ts`

```
onload()
    │
    ├── loadSettings()
    │
    ├── registerViews() & registerCommands()
    │
    └── migrateToJsonStorage() [async, non-blocking]
            │
            ├── getDbManager() [lazy init]
            │       │
            │       └── DatabaseManager.create(app)
            │               │
            │               ├── loadPGliteResources() [CDN fetch]
            │               ├── loadExistingDatabase() OR createNewDatabase()
            │               └── migrateDatabase() [Drizzle migrations]
            │
            └── migrateToJsonDatabase()
                    │
                    ├── Migrate legacy chats to JSON
                    └── Migrate legacy templates to JSON
```

### 5.2 Lazy Initialization

Database is NOT loaded until first access:

```typescript
// In main.ts
async getDbManager(): Promise<DatabaseManager> {
  if (!this.dbManagerInitPromise) {
    this.dbManagerInitPromise = DatabaseManager.create(this.app)
  }
  return this.dbManagerInitPromise
}
```

### 5.3 First Access Triggers

- Opening Chat View
- Running vault index command
- Accessing RAG engine
- Loading templates

---

## 6. Schema Definitions

### 6.1 Embeddings Table (PGlite)

**Source:** `src/database/schema.ts`

```sql
CREATE TABLE embeddings (
  id          SERIAL PRIMARY KEY,
  path        TEXT NOT NULL,           -- Vault file path
  mtime       BIGINT NOT NULL,         -- File modification timestamp (ms)
  content     TEXT NOT NULL,           -- Chunk text content
  model       TEXT NOT NULL,           -- Embedding model ID
  dimension   SMALLINT NOT NULL,       -- Vector dimension (128-3072)
  embedding   VECTOR,                  -- pgvector column
  metadata    JSONB NOT NULL           -- { startLine, endLine }
);

-- B-tree indexes
CREATE INDEX ON embeddings (path);
CREATE INDEX ON embeddings (model);
CREATE INDEX ON embeddings (dimension);

-- HNSW vector indexes (one per dimension)
CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops)
  WHERE dimension = 128;
CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops)
  WHERE dimension = 256;
-- ... indexes for 384, 512, 768, 1024, 1280, 1536, 1792
```

**TypeScript Type:**

```typescript
type VectorMetaData = {
  startLine: number   // 0-indexed line number
  endLine: number     // 0-indexed line number
}

type Embedding = {
  id: number
  path: string
  mtime: number
  content: string
  model: string
  dimension: number
  embedding: number[]
  metadata: VectorMetaData
}
```

### 6.2 Chat Conversation (JSON)

**Source:** `src/database/json/chat/types.ts`

```typescript
type ChatConversation = {
  id: string                      // UUID
  title: string                   // Display title
  messages: SerializedChatMessage[]  // Full conversation
  createdAt: number               // Unix timestamp (ms)
  updatedAt: number               // Unix timestamp (ms)
  schemaVersion: number           // Currently 1
}

type ChatConversationMetadata = {
  id: string
  title: string
  updatedAt: number
  schemaVersion: number
}

type SerializedChatMessage =
  | ChatUserMessage
  | ChatAssistantMessage
  | ChatToolMessage
```

**Example Chat JSON:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Help with TypeScript",
  "schemaVersion": 1,
  "createdAt": 1734567890123,
  "updatedAt": 1734567895000,
  "messages": [
    {
      "role": "user",
      "content": "How do I type a generic function?",
      "id": "msg_001",
      "mentionables": [],
      "promptContent": null
    },
    {
      "role": "assistant",
      "content": "Here's how to create a generic function...",
      "id": "msg_002",
      "metadata": {
        "usage": { "prompt_tokens": 50, "completion_tokens": 200 },
        "model": "claude-code/opus-4.5"
      }
    }
  ]
}
```

### 6.3 Template (JSON)

**Source:** `src/database/json/template/types.ts`

```typescript
type Template = {
  id: string                    // UUID
  name: string                  // Display name (unique)
  content: TemplateContent      // Lexical editor state
  createdAt: number             // Unix timestamp (ms)
  updatedAt: number             // Unix timestamp (ms)
  schemaVersion: number         // Currently 1
}

type TemplateContent = {
  nodes: SerializedLexicalNode[]  // Lexical JSON nodes
}
```

**Example Template JSON:**

```json
{
  "id": "t1234567-89ab-cdef-0123-456789abcdef",
  "name": "Assessment",
  "schemaVersion": 1,
  "createdAt": 1734500000000,
  "updatedAt": 1734500000000,
  "content": {
    "nodes": [
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "Write a comprehensive assessment for the patient based on:"
          }
        ]
      },
      {
        "type": "paragraph",
        "children": [
          {
            "type": "text",
            "text": "- Chief complaint\n- History of present illness\n- Objective findings"
          }
        ]
      }
    ]
  }
}
```

### 6.4 Legacy Template Table (PGlite - Deprecated)

```sql
CREATE TABLE template (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  content     JSONB NOT NULL,          -- { nodes: SerializedLexicalNode[] }
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 7. Vector Indexing System

### 7.1 RAG Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         RAGEngine                                │
│  src/core/rag/ragEngine.ts                                      │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐      ┌─────────────────────┐      ┌─────────────────┐
│ updateVaultIndex│      │    processQuery     │      │getQueryEmbedding│
│ (index vault)   │      │ (similarity search) │      │(embed query)    │
└────────┬────────┘      └──────────┬──────────┘      └─────────────────┘
         │                          │
         ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        VectorManager                             │
│  src/database/modules/vector/VectorManager.ts                   │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐      ┌─────────────────────┐      ┌─────────────────┐
│  Chunk Files    │      │  Generate Embeddings│      │  Store Vectors  │
│(RecursiveText   │      │  (LLM Provider)     │      │  (PGlite)       │
│ Splitter)       │      │                     │      │                 │
└─────────────────┘      └─────────────────────┘      └─────────────────┘
```

### 7.2 Indexing Flow

**Source:** `src/database/modules/vector/VectorManager.ts`

```typescript
async updateVaultIndex(options: {
  embeddingModel: EmbeddingModel,
  getEmbeddingClient: () => BaseLLMProvider,
  reindexAll: boolean,
  includePatterns: string[],
  excludePatterns: string[],
  chunkSize: number,
  onProgress?: (progress: QueryProgressState) => void
}): Promise<void> {
  // 1. Get markdown files matching patterns
  const files = await getMarkdownFiles(includePatterns, excludePatterns)

  // 2. Filter to changed files (unless reindexAll)
  const changedFiles = reindexAll
    ? files
    : files.filter(f => f.mtime > lastIndexed)

  // 3. Delete embeddings for removed files
  await deleteVectorsForDeletedFiles()

  // 4. For each file:
  for (const file of changedFiles) {
    // 4a. Chunk content
    const chunks = await splitContent(file.content, chunkSize)

    // 4b. Generate embeddings (with retry)
    const embeddings = await generateEmbeddingsWithRetry(chunks)

    // 4c. Store in database
    await insertVectors(file.path, embeddings, metadata)

    // 4d. Report progress
    onProgress?.({ type: 'indexing', current, total })
  }
}
```

### 7.3 Text Chunking

Uses LangChain's `RecursiveCharacterTextSplitter`:

```typescript
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: settings.ragOptions.chunkSize,  // Default: 1000
  chunkOverlap: 200,  // Overlap between chunks
  separators: ['\n\n', '\n', ' ', '']  // Split priority
})

const chunks = await splitter.createDocuments([fileContent])
```

### 7.4 Embedding Generation

```typescript
// Get embedding for text
async function getEmbedding(
  model: EmbeddingModel,
  text: string
): Promise<{ embedding: number[], dimension: number }> {
  const provider = getProviderClient(model.providerId)
  const embedding = await provider.getEmbedding(model.model, text)
  return {
    embedding,
    dimension: embedding.length
  }
}
```

### 7.5 Similarity Search

**Source:** `src/database/modules/vector/VectorRepository.ts`

```sql
-- Similarity search query
SELECT
  id, path, content, mtime, metadata,
  1 - (embedding <=> $1::vector) as similarity
FROM embeddings
WHERE model = $2
  AND dimension = $3
  AND (path = ANY($4) OR path LIKE ANY($5))  -- scope filter
ORDER BY embedding <=> $1::vector
LIMIT $6
```

**Operator:** `<=>` is pgvector's cosine distance operator

**Similarity Score:** `1 - cosine_distance` (higher = more similar)

### 7.6 Supported Embedding Models

| Provider | Model ID | Dimension |
|----------|----------|-----------|
| OpenAI | text-embedding-3-small | 1536 |
| OpenAI | text-embedding-3-large | 3072 |
| Gemini | text-embedding-004 | 768 |
| Ollama | nomic-embed-text | 768 |
| Ollama | mxbai-embed-large | 1024 |
| Ollama | bge-m3 | 1024 |

### 7.7 HNSW Index Configuration

```sql
-- Partial indexes for each dimension
CREATE INDEX embeddings_128_hnsw
  ON embeddings USING hnsw (embedding vector_cosine_ops)
  WHERE dimension = 128;

CREATE INDEX embeddings_256_hnsw
  ON embeddings USING hnsw (embedding vector_cosine_ops)
  WHERE dimension = 256;

-- ... etc for 384, 512, 768, 1024, 1280, 1536, 1792
```

---

## 8. Data Access Patterns

### 8.1 React Context Integration

```typescript
// DatabaseContext provides access
const { getDatabaseManager, getVectorManager, getTemplateManager } = useDatabase()

// RAGContext provides search
const { getRAGEngine } = useRAG()
```

### 8.2 Common Operations

**Insert Embeddings:**

```typescript
await vectorManager.updateVaultIndex({
  embeddingModel,
  getEmbeddingClient: () => provider,
  reindexAll: false,
  includePatterns: ['**/*.md'],
  excludePatterns: ['**/node_modules/**'],
  chunkSize: 1000
})
```

**Search Embeddings:**

```typescript
const results = await vectorManager.performSimilaritySearch({
  query: 'how to implement authentication',
  model: 'openai/text-embedding-3-small',
  dimension: 1536,
  limit: 10,
  minSimilarity: 0.7,
  scope: { files: [], folders: ['src/'] }
})
```

**CRUD Chats:**

```typescript
// Create
await chatManager.createChat({ title: 'New Chat', messages: [] })

// Read
const chat = await chatManager.findById('chat-id')

// Update
await chatManager.updateChat('chat-id', { messages: [...] })

// Delete
await chatManager.deleteChat('chat-id')

// List
const chats = await chatManager.listChats()
```

**CRUD Templates:**

```typescript
// Create
await templateManager.createTemplate({ name: 'Assessment', content: {...} })

// Read
const template = await templateManager.findByName('Assessment')

// Update
await templateManager.updateTemplate('template-id', { content: {...} })

// Delete
await templateManager.deleteTemplate('template-id')

// Search
const matches = await templateManager.searchTemplates('assess')
```

---

## 9. Migration System

### 9.1 Drizzle Migrations (PGlite)

**Source:** `src/database/migrations.json`

| Migration | Description |
|-----------|-------------|
| 1 | Create VECTOR extension |
| 2-5 | Create model-specific embedding tables |
| 6 | Rename tables with provider prefix |
| 7 | Add Gemini embedding table |
| 8 | **Unify into single `embeddings` table** |
| 9 | Add dimension column |
| 10 | Add HNSW partial indexes per dimension |

### 9.2 JSON Migration

**Source:** `src/database/json/migrateToJsonDatabase.ts`

```typescript
async function migrateToJsonDatabase(app: App, dbManager: DatabaseManager) {
  const marker = '.smtcmp_json_db/.initial_migration_completed'

  if (await fileExists(marker)) {
    return  // Already migrated
  }

  // Migrate chats from legacy storage
  await migrateLegacyChats()

  // Migrate templates from PGlite to JSON
  await migrateTemplatesFromPGlite()

  // Create marker file
  await createMarkerFile(marker)
}
```

### 9.3 Settings Migrations

**Location:** `src/settings/schema/migrations/`

Each file exports a migration function:

```typescript
// 12_to_13.ts
export const migrateFrom12To13: SettingMigration['migrate'] = (data) => {
  const newData = { ...data }
  newData.version = 13
  newData.providers = getMigratedProviders(newData, DEFAULT_PROVIDERS_V13)
  newData.chatModels = getMigratedChatModels(newData, DEFAULT_CHAT_MODELS_V13)
  return newData
}
```

---

## 10. Backup & Recovery

### 10.1 Manual Backup

```powershell
# Backup both database files
$vaultPath = "C:\Users\You\Documents\ObsidianVault"
$backupPath = "D:\Backups\smart-composer"

# Vector database
Copy-Item "$vaultPath\.smtcmp_vector_db.tar.gz" -Destination $backupPath

# JSON database
Copy-Item "$vaultPath\.smtcmp_json_db" -Destination $backupPath -Recurse
```

### 10.2 Restore

```powershell
# Restore both database files
$vaultPath = "C:\Users\You\Documents\ObsidianVault"
$backupPath = "D:\Backups\smart-composer"

# Delete existing
Remove-Item "$vaultPath\.smtcmp_vector_db.tar.gz" -Force -ErrorAction SilentlyContinue
Remove-Item "$vaultPath\.smtcmp_json_db" -Recurse -Force -ErrorAction SilentlyContinue

# Copy backup
Copy-Item "$backupPath\.smtcmp_vector_db.tar.gz" -Destination $vaultPath
Copy-Item "$backupPath\.smtcmp_json_db" -Destination $vaultPath -Recurse
```

### 10.3 Reset to Fresh State

```powershell
# Delete all Smart Composer data
Remove-Item "$vaultPath\.smtcmp_vector_db.tar.gz" -Force
Remove-Item "$vaultPath\.smtcmp_json_db" -Recurse -Force

# Restart Obsidian - plugin will create fresh databases
```

---

## 11. Performance Considerations

### 11.1 Vector Search Performance

| Factor | Impact | Optimization |
|--------|--------|--------------|
| Dimension | Higher = slower search | Use smallest dimension that works |
| Index type | HNSW is faster than IVFFlat | Use HNSW (default) |
| Vault size | More vectors = slower | Use include/exclude patterns |
| Chunk size | Smaller = more vectors | Balance granularity vs. count |

### 11.2 Recommended Settings

```typescript
ragOptions: {
  chunkSize: 1000,        // Tokens per chunk
  thresholdTokens: 8192,  // Max context tokens
  minSimilarity: 0.7,     // Minimum relevance
  limit: 10,              // Max results
  excludePatterns: [
    '**/node_modules/**',
    '**/.git/**',
    '**/assets/**'
  ]
}
```

### 11.3 Database Size Estimates

| Vault Files | Estimated Vector DB Size |
|-------------|--------------------------|
| 100 notes | ~2 MB |
| 500 notes | ~5 MB |
| 1000 notes | ~10 MB |
| 5000 notes | ~50 MB |

### 11.4 Rate Limiting

Embedding API calls include exponential backoff:

```typescript
const RETRY_CONFIG = {
  maxAttempts: 8,
  initialDelay: 1000,      // 1 second
  maxDelay: 60000,         // 60 seconds
  backoffFactor: 2
}
```

---

## Appendix A: File Format Examples

### A.1 Minimal Chat File

```json
{
  "id": "abc123",
  "title": "Untitled",
  "schemaVersion": 1,
  "createdAt": 1734567890000,
  "updatedAt": 1734567890000,
  "messages": []
}
```

### A.2 Minimal Template File

```json
{
  "id": "def456",
  "name": "Simple Template",
  "schemaVersion": 1,
  "createdAt": 1734567890000,
  "updatedAt": 1734567890000,
  "content": {
    "nodes": [
      {
        "type": "paragraph",
        "children": [{ "type": "text", "text": "Template content here" }]
      }
    ]
  }
}
```

---

## Appendix B: Troubleshooting

### B.1 Database Won't Load

**Symptom:** Error on plugin startup about PGlite

**Cause:** Corrupted `.smtcmp_vector_db.tar.gz`

**Fix:**
```powershell
Remove-Item "$vaultPath\.smtcmp_vector_db.tar.gz" -Force
# Restart Obsidian - will create new database
```

### B.2 Embeddings Not Updating

**Symptom:** Changed files not appearing in search

**Cause:** mtime mismatch or API errors

**Fix:** Run "Rebuild Entire Vault Index" command

### B.3 Templates Not Showing

**Symptom:** Templates list is empty

**Cause:** JSON migration not completed

**Fix:**
```powershell
Remove-Item "$vaultPath\.smtcmp_json_db\.initial_migration_completed" -Force
# Restart Obsidian - will re-run migration
```

---

**END OF DATABASE SPECIFICATION**
