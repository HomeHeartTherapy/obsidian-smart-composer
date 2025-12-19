# API Reference

Complete API documentation for the Obsidian Smart Composer HomeHeart plugin.

**Version**: 1.0.0
**Last Updated**: December 2024
**Target Audience**: Plugin developers, contributors, integrators

---

## Table of Contents

1. [Type Definitions](#type-definitions)
2. [Service Classes](#service-classes)
3. [Utility Functions](#utility-functions)
4. [React Contexts](#react-contexts)
5. [Database APIs](#database-apis)
6. [LLM Provider APIs](#llm-provider-apis)
7. [MCP APIs](#mcp-apis)
8. [Exception Types](#exception-types)

---

## Type Definitions

### Chat Message Types

**Location**: `src/types/chat.ts`

#### ChatUserMessage
```typescript
interface ChatUserMessage {
  role: 'user'
  content: SerializedEditorState | null
  promptContent: string | ContentPart[] | null
  id: string
  mentionables: Mentionable[]
  similaritySearchResults?: (Omit<SelectEmbedding, 'embedding'> & { similarity: number })[]
}
```

#### ChatAssistantMessage
```typescript
interface ChatAssistantMessage {
  role: 'assistant'
  content: string
  reasoning?: string
  annotations?: Annotation[]
  toolCallRequests?: ToolCallRequest[]
  id: string
  metadata?: {
    usage?: ResponseUsage
    model?: ChatModel
  }
}
```

#### ChatToolMessage
```typescript
interface ChatToolMessage {
  role: 'tool'
  id: string
  toolCalls: {
    request: ToolCallRequest
    response: ToolCallResponse
  }[]
}
```

#### Union Types
```typescript
type ChatMessage = ChatUserMessage | ChatAssistantMessage | ChatToolMessage
type SerializedChatMessage = SerializedChatUserMessage | SerializedChatAssistantMessage | SerializedChatToolMessage
type AssistantToolMessageGroup = (ChatAssistantMessage | ChatToolMessage)[]
```

---

### LLM Provider Types

**Location**: `src/types/provider.types.ts`

#### LLMProvider Schema
```typescript
const llmProviderSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('openai'), id: z.string(), baseUrl: z.string().optional(), apiKey: z.string().optional() }),
  z.object({ type: z.literal('anthropic'), id: z.string(), baseUrl: z.string().optional(), apiKey: z.string().optional() }),
  z.object({ type: z.literal('gemini'), id: z.string(), apiKey: z.string().optional() }),
  z.object({ type: z.literal('deepseek'), id: z.string(), baseUrl: z.string().optional(), apiKey: z.string().optional() }),
  z.object({ type: z.literal('perplexity'), id: z.string(), baseUrl: z.string().optional(), apiKey: z.string().optional() }),
  z.object({ type: z.literal('groq'), id: z.string(), baseUrl: z.string().optional(), apiKey: z.string().optional() }),
  z.object({ type: z.literal('mistral'), id: z.string(), baseUrl: z.string().optional(), apiKey: z.string().optional() }),
  z.object({ type: z.literal('openrouter'), id: z.string(), baseUrl: z.string().optional(), apiKey: z.string().optional() }),
  z.object({ type: z.literal('ollama'), id: z.string(), baseUrl: z.string().optional() }),
  z.object({ type: z.literal('lm-studio'), id: z.string(), baseUrl: z.string().optional() }),
  z.object({ type: z.literal('morph'), id: z.string(), baseUrl: z.string().optional(), apiKey: z.string().optional() }),
  z.object({ type: z.literal('azure-openai'), id: z.string(), baseUrl: z.string(), apiKey: z.string().optional(), deployment: z.string(), apiVersion: z.string() }),
  z.object({ type: z.literal('openai-compatible'), id: z.string(), baseUrl: z.string(), apiKey: z.string().optional(), additionalSettings: z.record(z.string()).optional() }),
  z.object({ type: z.literal('claude-code'), id: z.string() })
])

type LLMProvider = z.infer<typeof llmProviderSchema>
type LLMProviderType = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'perplexity' | 'groq' | 'mistral' | 'openrouter' | 'ollama' | 'lm-studio' | 'morph' | 'azure-openai' | 'openai-compatible' | 'claude-code'
```

---

### Chat Model Types

**Location**: `src/types/chat-model.types.ts`

```typescript
const chatModelSchema = z.discriminatedUnion('providerType', [
  // OpenAI with reasoning support
  z.object({
    providerType: z.literal('openai'),
    providerId: z.string(),
    id: z.string(),
    model: z.string(),
    promptLevel: z.nativeEnum(PromptLevel),
    enable: z.boolean(),
    reasoning: z.object({
      enabled: z.boolean(),
      reasoning_effort: z.enum(['low', 'medium', 'high'])
    }).optional()
  }),

  // Anthropic with thinking support
  z.object({
    providerType: z.literal('anthropic'),
    providerId: z.string(),
    id: z.string(),
    model: z.string(),
    promptLevel: z.nativeEnum(PromptLevel),
    enable: z.boolean(),
    thinking: z.object({
      enabled: z.boolean(),
      budget_tokens: z.number()
    }).optional()
  }),

  // Claude Code with thinking levels
  z.object({
    providerType: z.literal('claude-code'),
    providerId: z.string(),
    id: z.string(),
    model: z.string(),
    promptLevel: z.nativeEnum(PromptLevel),
    enable: z.boolean(),
    thinkingLevel: z.enum(['none', 'low', 'medium', 'high', 'max']).optional()
  }),

  // Perplexity with web search
  z.object({
    providerType: z.literal('perplexity'),
    providerId: z.string(),
    id: z.string(),
    model: z.string(),
    promptLevel: z.nativeEnum(PromptLevel),
    enable: z.boolean(),
    web_search_options: z.object({
      search_context_size: z.enum(['low', 'medium', 'high'])
    }).optional()
  }),

  // ... other providers follow base schema
])

type ChatModel = z.infer<typeof chatModelSchema>
```

---

### Embedding Model Types

**Location**: `src/types/embedding-model.types.ts`

```typescript
const baseEmbeddingModelSchema = z.object({
  providerId: z.string(),
  id: z.string(),
  model: z.string(),
  dimension: z.number()
})

type EmbeddingModel = z.infer<typeof embeddingModelSchema>
```

**Location**: `src/types/embedding.ts`

```typescript
interface EmbeddingModelClient {
  id: string
  dimension: number
  getEmbedding: (text: string) => Promise<number[]>
}

interface EmbeddingDbStats {
  model: string
  rowCount: number
  totalDataBytes: number
}
```

---

### LLM Request/Response Types

**Location**: `src/types/llm/request.ts`

```typescript
interface LLMRequestBase {
  messages: RequestMessage[]
  model: string
  tools?: RequestTool[]
  tool_choice?: RequestToolChoice
  max_tokens?: number
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  logit_bias?: Record<number, number>
  prediction?: ChatCompletionCreateParams['prediction']
  reasoning_effort?: ReasoningEffort
  web_search_options?: WebSearchOptions
}

interface LLMRequestNonStreaming extends LLMRequestBase {
  stream?: false | null
}

interface LLMRequestStreaming extends LLMRequestBase {
  stream: true
}

type LLMRequest = LLMRequestNonStreaming | LLMRequestStreaming

// Content Types
type ContentPart = TextContent | ImageContentPart

interface TextContent {
  type: 'text'
  text: string
}

interface ImageContentPart {
  type: 'image_url'
  image_url: { url: string }
}

// Message Types
type RequestMessage =
  | RequestSystemMessage
  | RequestUserMessage
  | RequestAssistantMessage
  | RequestToolMessage

interface RequestSystemMessage {
  role: 'system'
  content: string
}

interface RequestUserMessage {
  role: 'user'
  content: string | ContentPart[]
}

interface RequestAssistantMessage {
  role: 'assistant'
  content: string
  tool_calls?: ToolCallRequest[]
}

interface RequestToolMessage {
  role: 'tool'
  tool_call: ToolCallRequest
  content: string
}
```

**Location**: `src/types/llm/response.ts`

```typescript
interface LLMResponseBase {
  id: string
  created?: number
  model: string
  system_fingerprint?: string
  usage?: ResponseUsage
}

interface LLMResponseNonStreaming extends LLMResponseBase {
  choices: NonStreamingChoice[]
  object: 'chat.completion'
}

interface LLMResponseStreaming extends LLMResponseBase {
  choices: StreamingChoice[]
  object: 'chat.completion.chunk'
}

interface ResponseUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

interface Annotation {
  type: 'url_citation'
  url_citation: {
    url: string
    title?: string
    start_index?: number
    end_index?: number
  }
}
```

---

### Tool Call Types

**Location**: `src/types/tool-call.types.ts`

```typescript
interface ToolCallRequest {
  id: string
  name: string
  arguments?: string
}

enum ToolCallResponseStatus {
  PendingApproval = 'pending_approval'
  Rejected = 'rejected'
  Running = 'running'
  Success = 'success'
  Error = 'error'
  Aborted = 'aborted'
}

type ToolCallResponse =
  | { status: ToolCallResponseStatus.PendingApproval }
  | { status: ToolCallResponseStatus.Rejected }
  | { status: ToolCallResponseStatus.Running }
  | { status: ToolCallResponseStatus.Success; data: { type: 'text'; text: string } }
  | { status: ToolCallResponseStatus.Error; error: string }
  | { status: ToolCallResponseStatus.Aborted }
```

---

### Mentionable Types

**Location**: `src/types/mentionable.ts`

```typescript
// Runtime Types
interface MentionableFile { type: 'file'; file: TFile }
interface MentionableFolder { type: 'folder'; folder: TFolder }
interface MentionableVault { type: 'vault' }
interface MentionableCurrentFile { type: 'current-file'; file: TFile | null }
interface MentionableBlock {
  type: 'block'
  content: string
  file: TFile
  startLine: number
  endLine: number
}
interface MentionableUrl { type: 'url'; url: string }
interface MentionableImage {
  type: 'image'
  name: string
  mimeType: string
  data: string  // base64
}

type Mentionable =
  | MentionableFile
  | MentionableFolder
  | MentionableVault
  | MentionableCurrentFile
  | MentionableBlock
  | MentionableUrl
  | MentionableImage

// Serialized Types (for storage)
interface SerializedMentionableFile { type: 'file'; file: string }
interface SerializedMentionableFolder { type: 'folder'; folder: string }
// ... (file paths as strings instead of TFile objects)

type SerializedMentionable =
  | SerializedMentionableFile
  | SerializedMentionableFolder
  | SerializedMentionableVault
  | SerializedMentionableCurrentFile
  | SerializedMentionableBlock
  | SerializedMentionableUrl
  | SerializedMentionableImage
```

---

### MCP Types

**Location**: `src/types/mcp.types.ts`

```typescript
const mcpServerParametersSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional()
})

const mcpServerToolOptionsSchema = z.record(z.object({
  disabled: z.boolean().optional(),
  allowAutoExecution: z.boolean().optional()
}))

const mcpServerConfigSchema = z.object({
  id: z.string(),
  parameters: mcpServerParametersSchema,
  enabled: z.boolean(),
  toolOptions: mcpServerToolOptionsSchema
})

type McpServerConfig = z.infer<typeof mcpServerConfigSchema>
type McpServerParameters = z.infer<typeof mcpServerParametersSchema>

enum McpServerStatus {
  Disconnected = 'disconnected'
  Connecting = 'connecting'
  Connected = 'connected'
  Error = 'error'
}

type McpServerState =
  | { name: string; config: McpServerConfig; status: McpServerStatus.Disconnected }
  | { name: string; config: McpServerConfig; status: McpServerStatus.Connecting }
  | { name: string; config: McpServerConfig; status: McpServerStatus.Connected; client: McpClient; tools: McpTool[] }
  | { name: string; config: McpServerConfig; status: McpServerStatus.Error; error: Error }
```

---

### Settings Types

**Location**: `src/settings/schema/setting.types.ts`

```typescript
const smartComposerSettingsSchema = z.object({
  version: z.literal(SETTINGS_SCHEMA_VERSION),
  providers: z.array(llmProviderSchema),
  chatModels: z.array(chatModelSchema),
  embeddingModels: z.array(embeddingModelSchema),
  chatModelId: z.string(),
  applyModelId: z.string(),
  embeddingModelId: z.string(),
  systemPrompt: z.string(),
  ragOptions: z.object({
    chunkSize: z.number(),
    thresholdTokens: z.number(),
    minSimilarity: z.number(),
    limit: z.number(),
    excludePatterns: z.array(z.string()),
    includePatterns: z.array(z.string())
  }),
  mcp: z.object({
    servers: z.array(mcpServerConfigSchema)
  }),
  chatOptions: z.object({
    includeCurrentFileContent: z.boolean(),
    enableTools: z.boolean(),
    maxAutoIterations: z.number()
  })
})

type SmartComposerSettings = z.infer<typeof smartComposerSettingsSchema>
```

---

### Prompt Level Enum

**Location**: `src/types/prompt-level.types.ts`

```typescript
enum PromptLevel {
  Simple = 0   // Minimal system prompt
  Default = 1  // Full system prompt with instructions
}
```

---

### Database Schema Types

**Location**: `src/database/schema.ts`

```typescript
interface VectorMetaData {
  startLine: number
  endLine: number
}

// Drizzle ORM inferred types
type SelectEmbedding = {
  id: number
  path: string
  mtime: number
  content: string
  embedding: number[]
  metadata: VectorMetaData
  model: string
}

type InsertEmbedding = {
  path: string
  mtime: number
  content: string
  embedding: number[]
  metadata: VectorMetaData
  model: string
}
```

---

## Service Classes

### LLM Provider Base Class

**Location**: `src/core/llm/base.ts`

```typescript
abstract class BaseLLMProvider<P extends LLMProvider> {
  protected provider: P

  constructor(provider: P)

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

  abstract getEmbedding(model: string, text: string): Promise<number[]>
}
```

---

### LLM Provider Factory

**Location**: `src/core/llm/manager.ts`

```typescript
function getProviderClient(params: {
  settings: SmartComposerSettings
  providerId: string
}): BaseLLMProvider<LLMProvider>
// Throws: LLMModelNotFoundException if provider not found

function getChatModelClient(params: {
  settings: SmartComposerSettings
  modelId: string
}): {
  providerClient: BaseLLMProvider<LLMProvider>
  model: ChatModel
}
// Throws: LLMModelNotFoundException if model not found
```

---

### Anthropic Provider

**Location**: `src/core/llm/anthropic.ts`

```typescript
class AnthropicProvider extends BaseLLMProvider<Extract<LLMProvider, { type: 'anthropic' }>> {
  private client: Anthropic
  private static readonly DEFAULT_MAX_TOKENS = 8192

  constructor(provider: Extract<LLMProvider, { type: 'anthropic' }>)

  generateResponse(model: ChatModel, request: LLMRequestNonStreaming, options?: LLMOptions): Promise<LLMResponseNonStreaming>
  streamResponse(model: ChatModel, request: LLMRequestStreaming, options?: LLMOptions): Promise<AsyncIterable<LLMResponseStreaming>>
  getEmbedding(model: string, text: string): Promise<number[]>  // throws - not supported
}

// Features:
// - Thinking/reasoning blocks support
// - Tool calling with Anthropic format
// - Image support: jpeg, png, gif, webp
// - Custom base URL support
```

---

### OpenAI Provider

**Location**: `src/core/llm/openai.ts`

```typescript
class OpenAIAuthenticatedProvider extends BaseLLMProvider<Extract<LLMProvider, { type: 'openai' }>> {
  private adapter: OpenAIMessageAdapter
  private client: OpenAI

  constructor(provider: Extract<LLMProvider, { type: 'openai' }>)

  generateResponse(model: ChatModel, request: LLMRequestNonStreaming, options?: LLMOptions): Promise<LLMResponseNonStreaming>
  streamResponse(model: ChatModel, request: LLMRequestStreaming, options?: LLMOptions): Promise<AsyncIterable<LLMResponseStreaming>>
  getEmbedding(model: string, text: string): Promise<number[]>
}

// Features:
// - Full embeddings support
// - Reasoning model support (o1, o3)
// - Token usage reporting
```

---

### Gemini Provider

**Location**: `src/core/llm/gemini.ts`

```typescript
class GeminiProvider extends BaseLLMProvider<Extract<LLMProvider, { type: 'gemini' }>> {
  private client: GoogleGenerativeAI
  private apiKey: string

  constructor(provider: Extract<LLMProvider, { type: 'gemini' }>)
  // Note: Throws error if custom baseUrl provided

  generateResponse(model: ChatModel, request: LLMRequestNonStreaming, options?: LLMOptions): Promise<LLMResponseNonStreaming>
  streamResponse(model: ChatModel, request: LLMRequestStreaming, options?: LLMOptions): Promise<AsyncIterable<LLMResponseStreaming>>
  getEmbedding(model: string, text: string): Promise<number[]>
}

// Features:
// - System instruction support
// - Function calling with Gemini format
// - Image support: png, jpeg, webp, heic, heif
// - Usage metadata tracking
```

---

### Claude Code Provider

**Location**: `src/core/llm/claudeCode.ts`

```typescript
class ClaudeCodeProvider extends BaseLLMProvider<Extract<LLMProvider, { type: 'claude-code' }>> {
  constructor(provider: Extract<LLMProvider, { type: 'claude-code' }>)

  generateResponse(model: ChatModel, request: LLMRequestNonStreaming, options?: LLMOptions): Promise<LLMResponseNonStreaming>
  streamResponse(model: ChatModel, request: LLMRequestStreaming, options?: LLMOptions): Promise<AsyncIterable<LLMResponseStreaming>>
  getEmbedding(model: string, text: string): Promise<number[]>  // throws - not supported
}

// Features:
// - Uses Claude Max/Pro subscription via claude CLI
// - 5 thinking levels: none, low, medium, high, max
// - 16 model variants
// - No API key required (uses subscription)
```

---

### Database Manager

**Location**: `src/database/DatabaseManager.ts`

```typescript
class DatabaseManager {
  constructor(app: App, dbPath: string)

  static async create(app: App): Promise<DatabaseManager>

  getDb(): PgliteDatabase | null
  getVectorManager(): VectorManager
  getTemplateManager(): LegacyTemplateManager

  async vacuum(): Promise<void>
  async save(): Promise<void>
  async cleanup(): Promise<void>
}

// Features:
// - PGlite database with WebAssembly
// - Drizzle ORM integration
// - Automatic migration management
// - Compressed storage (.tar.gz)
```

---

### Vector Manager

**Location**: `src/database/modules/vector/VectorManager.ts`

```typescript
class VectorManager {
  constructor(app: App, db: PgliteDatabase)

  setSaveCallback(callback: () => Promise<void>): void
  setVacuumCallback(callback: () => Promise<void>): void

  async performSimilaritySearch(
    queryVector: number[],
    embeddingModel: EmbeddingModelClient,
    options: {
      minSimilarity: number
      limit: number
      scope?: { files: string[]; folders: string[] }
    }
  ): Promise<(Omit<SelectEmbedding, 'embedding'> & { similarity: number })[]>

  async updateVaultIndex(
    embeddingModel: EmbeddingModelClient,
    options: {
      chunkSize: number
      excludePatterns: string[]
      includePatterns: string[]
      reindexAll?: boolean
    },
    updateProgress?: (indexProgress: IndexProgress) => void
  ): Promise<void>

  async clearAllVectors(embeddingModel: EmbeddingModelClient): Promise<void>
  async getEmbeddingStats(): Promise<EmbeddingDbStats[]>
}

// Features:
// - Cosine similarity search with HNSW index
// - Incremental vault indexing
// - Batch processing (100 chunks per batch)
// - Exponential backoff for rate limiting
// - Progress tracking
```

---

### Chat Manager (JSON)

**Location**: `src/database/json/chat/ChatManager.ts`

```typescript
class ChatManager extends AbstractJsonRepository<ChatConversation, ChatConversationMetadata> {
  constructor(app: App)
  // Stores in: .smtcmp_data/chat/

  async createChat(initialData: Partial<ChatConversation>): Promise<ChatConversation>
  // Throws: EmptyChatTitleException if title is empty

  async findById(id: string): Promise<ChatConversation | null>

  async updateChat(
    id: string,
    updates: Partial<Omit<ChatConversation, 'id' | 'createdAt' | 'updatedAt' | 'schemaVersion'>>
  ): Promise<ChatConversation | null>

  async deleteChat(id: string): Promise<boolean>

  async listChats(): Promise<ChatConversationMetadata[]>
  // Returns sorted by updatedAt descending
}

// File format: v{version}_{encodedTitle}_{updatedAt}_{id}.json
```

---

### Template Manager (JSON)

**Location**: `src/database/json/template/TemplateManager.ts`

```typescript
class TemplateManager extends AbstractJsonRepository<Template, TemplateMetadata> {
  constructor(app: App)
  // Stores in: .smtcmp_data/templates/

  async createTemplate(
    template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'schemaVersion'>
  ): Promise<Template>
  // Throws: DuplicateTemplateException, EmptyTemplateNameException

  async findById(id: string): Promise<Template | null>
  async findByName(name: string): Promise<Template | null>

  async updateTemplate(
    id: string,
    updates: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'schemaVersion'>>
  ): Promise<Template | null>
  // Throws: DuplicateTemplateException, EmptyTemplateNameException

  async deleteTemplate(id: string): Promise<boolean>

  async searchTemplates(query: string): Promise<Template[]>
  // Uses fuzzysort, returns up to 20 results
}

// File format: v{version}_{encodedName}_{id}.json
```

---

### RAG Engine

**Location**: `src/core/rag/ragEngine.ts`

```typescript
class RAGEngine {
  constructor(
    app: App,
    settings: SmartComposerSettings,
    vectorManager: VectorManager
  )

  cleanup(): void
  setSettings(settings: SmartComposerSettings): void

  async updateVaultIndex(
    options?: { reindexAll: boolean },
    onQueryProgressChange?: (queryProgress: QueryProgressState) => void
  ): Promise<void>

  async processQuery(params: {
    query: string
    scope?: { files: string[]; folders: string[] }
    onQueryProgressChange?: (queryProgress: QueryProgressState) => void
  }): Promise<(Omit<SelectEmbedding, 'embedding'> & { similarity: number })[]>
}
```

---

### MCP Manager

**Location**: `src/core/mcp/mcpManager.ts`

```typescript
class McpManager {
  static TOOL_NAME_DELIMITER: '__'
  static disabled: boolean  // true on mobile

  constructor(params: {
    settings: SmartComposerSettings
    registerSettingsListener: (listener: (settings: SmartComposerSettings) => void) => () => void
  })

  async initialize(): Promise<void>
  cleanup(): void

  getServers(): McpServerState[]
  subscribeServersChange(callback: (servers: McpServerState[]) => void): () => void

  async handleSettingsUpdate(settings: SmartComposerSettings): Promise<void>

  async listAvailableTools(): Promise<McpTool[]>
  // Returns tools with names as: serverName__toolName

  allowToolForConversation(requestToolName: string, conversationId: string): void
  isToolExecutionAllowed(params: { requestToolName: string; conversationId?: string }): boolean

  async callTool(params: {
    name: string
    args?: Record<string, unknown> | string
    id?: string
    signal?: AbortSignal
  }): Promise<ToolCallResponse>

  abortToolCall(id: string): boolean
}
```

---

## Utility Functions

### Chat Utilities

**Location**: `src/utils/chat/`

#### applyChangesToFile
```typescript
async function applyChangesToFile(
  blockToApply: string,
  currentFile: TFile,
  currentFileContent: string,
  chatMessages: ChatMessage[],
  providerClient: BaseLLMProvider<LLMProvider>,
  model: ChatModel
): Promise<string | null>
```

#### createDiffBlocks
```typescript
function createDiffBlocks(currentMarkdown: string, incomingMarkdown: string): DiffBlock[]

type DiffBlock =
  | { type: 'unchanged'; value: string }
  | { type: 'modified'; originalValue?: string; modifiedValue?: string }
```

#### serializeMentionable / deserializeMentionable
```typescript
function serializeMentionable(mentionable: Mentionable): SerializedMentionable
function deserializeMentionable(serialized: SerializedMentionable, app: App): Mentionable | null
```

#### groupAssistantAndToolMessages
```typescript
function groupAssistantAndToolMessages(
  messages: ChatMessage[]
): (ChatUserMessage | AssistantToolMessageGroup)[]
```

#### parseTagContents
```typescript
function parseTagContents(input: string): ParsedTagContent[]

type ParsedTagContent =
  | { type: 'string'; content: string }
  | { type: 'smtcmp_block'; content: string; language?: string; filename?: string; startLine?: number; endLine?: number }
  | { type: 'think'; content: string }
```

---

### LLM Utilities

**Location**: `src/utils/llm/`

#### tokenCount
```typescript
async function tokenCount(text: string): Promise<number>
// Uses GPT-3.5/4 tokenizer (js-tiktoken)
// Warning: Computationally expensive for large inputs
```

#### calculateLLMCost
```typescript
function calculateLLMCost(model: ChatModel, usage: ResponseUsage): number | null
// Returns cost in dollars, null if provider not supported
```

#### formatMessages
```typescript
function formatMessages(messages: RequestMessage[]): RequestMessage[]
// Consolidates system messages, merges consecutive same-role messages
```

#### parseImageDataUrl
```typescript
function parseImageDataUrl(dataUrl: string): { mimeType: string; base64Data: string }
```

---

### Obsidian Integration

**Location**: `src/utils/obsidian.ts`

#### readTFileContent
```typescript
async function readTFileContent(file: TFile, vault: Vault): Promise<string>
async function readMultipleTFiles(files: TFile[], vault: Vault): Promise<string[]>
```

#### getNestedFiles
```typescript
function getNestedFiles(folder: TFolder, vault: Vault): TFile[]
// Recursive folder traversal
```

#### getMentionableBlockData
```typescript
async function getMentionableBlockData(
  editor: Editor,
  view: MarkdownView
): Promise<MentionableBlockData | null>
```

#### fuzzySearch
```typescript
function fuzzySearch(app: App, query: string): SearchableMentionable[]
// Features: open file boost, recency boost, proximity boost
```

#### openMarkdownFile
```typescript
function openMarkdownFile(app: App, filePath: string, startLine?: number): void
```

---

### Common Utilities

**Location**: `src/utils/common/`

#### chunkArray
```typescript
function chunkArray<T>(arr: T[], size: number): T[][]
```

#### classNames
```typescript
function classNames(...classes: string[]): string
// Filters falsy values
```

---

### MCP Tool Name Utilities

**Location**: `src/core/mcp/tool-name-utils.ts`

```typescript
function validateServerName(name: string, delimiter?: string): void
// Throws Error if invalid format

function parseToolName(name: string, delimiter?: string): { serverName: string; toolName: string }
// Throws InvalidToolNameException if invalid

function getToolName(serverName: string, toolName: string, delimiter?: string): string
// Returns: serverName__toolName
```

---

## React Contexts

### Plugin Context

**Location**: `src/contexts/PluginContext.tsx`

```typescript
interface PluginContextType {
  plugin: SmartComposerPlugin
}

const PluginContext: React.Context<PluginContextType | null>
function usePlugin(): SmartComposerPlugin
```

### Settings Context

**Location**: `src/contexts/SettingsContext.tsx`

```typescript
interface SettingsContextType {
  settings: SmartComposerSettings
  setSettings: (newSettings: SmartComposerSettings) => void | Promise<void>
}

const SettingsContext: React.Context<SettingsContextType | null>
function useSettings(): SettingsContextType
```

### Database Context

**Location**: `src/contexts/DatabaseContext.tsx`

```typescript
interface DatabaseContextType {
  getDatabaseManager: () => Promise<DatabaseManager>
  getVectorManager: () => Promise<VectorManager>
  getTemplateManager: () => Promise<LegacyTemplateManager>
}

const DatabaseContext: React.Context<DatabaseContextType | null>
function useDatabase(): DatabaseContextType
```

### RAG Context

**Location**: `src/contexts/RAGContext.tsx`

```typescript
interface RAGContextType {
  getRAGEngine: () => Promise<RAGEngine>
}

const RAGContext: React.Context<RAGContextType | null>
function useRAG(): RAGContextType
```

### MCP Context

**Location**: `src/contexts/McpContext.tsx`

```typescript
interface McpContextType {
  getMcpManager: () => Promise<McpManager>
}

const McpContext: React.Context<McpContextType | null>
function useMcp(): McpContextType
```

---

## Exception Types

**Location**: `src/database/exception.ts`, `src/database/json/exception.ts`, `src/utils/chat/youtube-transcript.ts`

### Database Exceptions
```typescript
class DatabaseException extends Error
class DatabaseNotInitializedException extends DatabaseException
class PGLiteAbortedException extends DatabaseException
```

### Template Exceptions
```typescript
class DuplicateTemplateException extends Error
class EmptyTemplateNameException extends Error
```

### Chat Exceptions
```typescript
class EmptyChatTitleException extends Error
```

### LLM Exceptions
```typescript
class LLMModelNotFoundException extends Error
class LLMAPIKeyNotSetException extends Error
```

### MCP Exceptions
```typescript
class InvalidToolNameException extends Error
```

### YouTube Exceptions
```typescript
class YoutubeTranscriptError extends Error
class YoutubeTranscriptTooManyRequestError extends YoutubeTranscriptError
class YoutubeTranscriptVideoUnavailableError extends YoutubeTranscriptError
class YoutubeTranscriptDisabledError extends YoutubeTranscriptError
class YoutubeTranscriptNotAvailableError extends YoutubeTranscriptError
class YoutubeTranscriptNotAvailableLanguageError extends YoutubeTranscriptError
```

---

## Enums Summary

| Enum | Location | Values |
|------|----------|--------|
| `PromptLevel` | `src/types/prompt-level.types.ts` | `Simple = 0`, `Default = 1` |
| `ToolCallResponseStatus` | `src/types/tool-call.types.ts` | `PendingApproval`, `Rejected`, `Running`, `Success`, `Error`, `Aborted` |
| `McpServerStatus` | `src/types/mcp.types.ts` | `Disconnected`, `Connecting`, `Connected`, `Error` |

---

## Constants

### Settings Schema Version
```typescript
const SETTINGS_SCHEMA_VERSION = 13
```

### Default Providers
Located in `src/settings/schema/migrations/migrationUtils.ts`

### Default Chat Models
Located in `src/settings/schema/migrations/migrationUtils.ts`

### Embedding Dimensions
| Provider | Model | Dimension |
|----------|-------|-----------|
| OpenAI | text-embedding-3-small | 1536 |
| OpenAI | text-embedding-3-large | 3072 |
| Gemini | text-embedding-004 | 768 |

---

## Index Progress Type

**Location**: `src/database/modules/vector/VectorManager.ts`

```typescript
interface IndexProgress {
  current: number
  total: number
  percentage: number
  status: 'idle' | 'indexing' | 'querying' | 'complete'
}
```

---

## Quick Reference: Import Paths

```typescript
// Types
import { ChatMessage, ChatUserMessage, ChatAssistantMessage } from '@/types/chat'
import { LLMProvider, LLMProviderType } from '@/types/provider.types'
import { ChatModel } from '@/types/chat-model.types'
import { EmbeddingModel, EmbeddingModelClient } from '@/types/embedding'
import { Mentionable, SerializedMentionable } from '@/types/mentionable'
import { ToolCallRequest, ToolCallResponse } from '@/types/tool-call.types'
import { McpServerConfig, McpServerState } from '@/types/mcp.types'

// Services
import { getProviderClient, getChatModelClient } from '@/core/llm/manager'
import { getEmbeddingModelClient } from '@/core/rag/embedding'
import { DatabaseManager } from '@/database/DatabaseManager'
import { VectorManager } from '@/database/modules/vector/VectorManager'
import { ChatManager } from '@/database/json/chat/ChatManager'
import { TemplateManager } from '@/database/json/template/TemplateManager'
import { RAGEngine } from '@/core/rag/ragEngine'
import { McpManager } from '@/core/mcp/mcpManager'

// Contexts
import { usePlugin } from '@/contexts/PluginContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useDatabase } from '@/contexts/DatabaseContext'
import { useRAG } from '@/contexts/RAGContext'
import { useMcp } from '@/contexts/McpContext'

// Utilities
import { tokenCount } from '@/utils/llm/token'
import { fuzzySearch } from '@/utils/fuzzy-search'
import { parseTagContents } from '@/utils/chat/parse-tag-content'
import { serializeMentionable, deserializeMentionable } from '@/utils/chat/mentionable'
```

---

*This API reference is auto-generated from source code analysis. For the latest updates, refer to the TypeScript source files.*
