# Component Specification

Complete React component documentation for the Obsidian Smart Composer HomeHeart plugin.

**Version**: 1.0.0
**Last Updated**: December 2024
**Framework**: React 18 with TypeScript

---

## Table of Contents

1. [Component Hierarchy](#component-hierarchy)
2. [Chat View Components](#chat-view-components)
3. [Apply View Component](#apply-view-component)
4. [Settings Components](#settings-components)
5. [Common Components](#common-components)
6. [Modal Components](#modal-components)
7. [Lexical Editor Plugins](#lexical-editor-plugins)
8. [Custom Hooks](#custom-hooks)
9. [Context Providers](#context-providers)
10. [Event Flow Diagrams](#event-flow-diagrams)

---

## Component Hierarchy

```
App (Plugin Root)
├── ContextProviders
│   ├── PluginContext
│   ├── AppContext
│   ├── SettingsContext
│   ├── DatabaseContext
│   ├── RAGContext
│   ├── McpContext
│   └── DarkModeContext
│
├── ChatView (Obsidian ItemView)
│   └── Chat
│       ├── ChatListDropdown
│       ├── QueryProgress
│       ├── UserMessageItem[]
│       │   ├── ChatUserInput
│       │   └── SimilaritySearchResults
│       └── AssistantToolMessageGroupItem[]
│           ├── AssistantMessageContent
│           │   ├── AssistantMessageReasoning
│           │   ├── MarkdownCodeComponent
│           │   └── ObsidianMarkdown
│           └── ToolMessage
│               └── ToolCallItem[]
│
├── ApplyView (Obsidian ItemView)
│   └── ApplyViewRoot
│       └── DiffBlockView[]
│
└── SettingsTab
    └── SettingsTabRoot
        ├── ChatSection
        ├── ProvidersSection
        ├── ModelsSection
        ├── RAGSection
        ├── McpSection
        ├── TemplateSection
        └── EtcSection
```

---

## Chat View Components

### Chat (Main Container)

**Location**: `src/components/chat-view/Chat.tsx`

The primary chat interface component managing conversation state and user interactions.

#### Props Interface
```typescript
type ChatProps = {
  selectedBlock?: MentionableBlockData
}
```

#### Ref Interface (Imperative Handle)
```typescript
type ChatRef = {
  openNewChat: (selectedBlock?: MentionableBlockData) => void
  addSelectionToChat: (selectedBlock: MentionableBlockData) => void
  focusMessage: () => void
}
```

#### Internal State
| State Variable | Type | Purpose |
|---------------|------|---------|
| `inputMessage` | `ChatUserMessage` | Current message being composed |
| `chatMessages` | `ChatMessage[]` | All messages in conversation |
| `currentConversationId` | `string` | Active conversation ID |
| `focusedMessageId` | `string \| null` | Message being edited |
| `queryProgress` | `QueryProgressState` | RAG indexing progress |
| `addedBlockKey` | `string \| null` | Recently added block mention |

#### Event Handlers
```typescript
handleNewChat(): void
// Creates fresh conversation, resets state

handleLoadConversation(id: string): Promise<void>
// Loads conversation from history

handleUserMessageSubmit(content: SerializedEditorState, useVaultSearch?: boolean): Promise<void>
// Compiles message, executes RAG if needed, streams LLM response

handleApply(blockToApply: string, chatMessages: ChatMessage[]): Promise<void>
// Opens ApplyView with diff comparison

handleToolMessageUpdate(message: ChatToolMessage): void
// Updates tool call status in conversation

handleContinueResponse(): void
// Continues after tool execution
```

#### Context Dependencies
- `useSettings()` - Plugin configuration
- `useApp()` - Obsidian App instance
- `useMcp()` - MCP tool manager
- `useRAG()` - RAG engine access

---

### ChatUserInput (Editor Component)

**Location**: `src/components/chat-view/chat-input/ChatUserInput.tsx`

Rich text input with Lexical editor for composing messages.

#### Props Interface
```typescript
type ChatUserInputProps = {
  initialSerializedEditorState: SerializedEditorState | null
  onChange: (content: SerializedEditorState) => void
  onSubmit: (content: SerializedEditorState, useVaultSearch?: boolean) => void
  onFocus: () => void
  mentionables: Mentionable[]
  setMentionables: (mentionables: Mentionable[]) => void
  autoFocus?: boolean
  addedBlockKey?: string | null
}
```

#### Ref Interface
```typescript
type ChatUserInputRef = {
  focus: () => void
}
```

#### Child Components
| Component | Purpose |
|-----------|---------|
| `LexicalContentEditable` | Editor core with plugins |
| `MentionableBadge[]` | Display attached files/images |
| `MentionableContentPreview` | Preview selected mention |
| `ModelSelect` | LLM model dropdown |
| `ImageUploadButton` | Image attachment |
| `SubmitButton` | Send message |
| `VaultChatButton` | Search entire vault |
| `ToolBadge` | MCP tool indicator |

---

### LexicalContentEditable (Editor Core)

**Location**: `src/components/chat-view/chat-input/LexicalContentEditable.tsx`

Lexical editor wrapper with plugin system.

#### Props Interface
```typescript
type LexicalContentEditableProps = {
  editorRef: RefObject<LexicalEditor>
  contentEditableRef: RefObject<HTMLDivElement>
  onChange?: (content: SerializedEditorState) => void
  onEnter?: (evt: KeyboardEvent) => void
  onFocus?: () => void
  onMentionNodeMutation?: (mutations: NodeMutations<MentionNode>) => void
  onCreateImageMentionables?: (mentionables: MentionableImage[]) => void
  initialEditorState?: InitialEditorStateType
  autoFocus?: boolean
  plugins?: {
    onEnter?: { onVaultChat: () => void }
    templatePopover?: { anchorElement: HTMLElement | null }
  }
}
```

#### Integrated Plugins
| Plugin | Trigger | Function |
|--------|---------|----------|
| `MentionPlugin` | `@` | File/folder autocomplete |
| `TemplatePlugin` | `/` | Insert saved templates |
| `OnEnterPlugin` | Enter | Submit or vault search |
| `OnMutationPlugin` | - | Track mention changes |
| `NoFormatPlugin` | Paste | Strip formatting |
| `ImagePastePlugin` | Paste | Handle images |
| `DragDropPastePlugin` | Drag | File drops |
| `CreateTemplatePopoverPlugin` | - | Quick template creation |

---

### UserMessageItem (User Message Display)

**Location**: `src/components/chat-view/UserMessageItem.tsx`

Renders user messages with edit capability.

#### Props Interface
```typescript
type UserMessageItemProps = {
  message: ChatUserMessage
  chatUserInputRef: (ref: ChatUserInputRef | null) => void
  onInputChange: (content: SerializedEditorState) => void
  onSubmit: (content: SerializedEditorState, useVaultSearch: boolean) => void
  onFocus: () => void
  onMentionablesChange: (mentionables: Mentionable[]) => void
}
```

#### Features
- Editable message content via `ChatUserInput`
- Displays RAG similarity search results
- Edit mode with focus management

---

### AssistantMessageContent (Response Rendering)

**Location**: `src/components/chat-view/AssistantMessageContent.tsx`

Parses and renders assistant responses with special tag handling.

#### Props Interface
```typescript
type AssistantMessageContentProps = {
  content: ChatAssistantMessage['content']
  contextMessages: ChatMessage[]
  handleApply: (blockToApply: string, chatMessages: ChatMessage[]) => void
  isApplying: boolean
}
```

#### Tag Parsing
| Tag | Renderer |
|-----|----------|
| `<think>` | `AssistantMessageReasoning` |
| `<smtcmp_block>` | `MarkdownCodeComponent` |
| Markdown | `ObsidianMarkdown` |

---

### AssistantToolMessageGroupItem (Tool Call Group)

**Location**: `src/components/chat-view/AssistantToolMessageGroupItem.tsx`

Groups assistant messages with their tool calls.

#### Props Interface
```typescript
type AssistantToolMessageGroupItemProps = {
  messages: AssistantToolMessageGroup
  contextMessages: ChatMessage[]
  conversationId: string
  isApplying: boolean
  onApply: (blockToApply: string, chatMessages: ChatMessage[]) => void
  onToolMessageUpdate: (message: ChatToolMessage) => void
}
```

---

### ToolMessage (Tool Call Display)

**Location**: `src/components/chat-view/ToolMessage.tsx`

Displays and manages MCP tool executions.

#### Props Interface
```typescript
type ToolMessageProps = {
  message: ChatToolMessage
  conversationId: string
  onMessageUpdate: (message: ChatToolMessage) => void
}
```

#### ToolCallItem Sub-component
Renders individual tool calls with:
- Expandable parameter view
- Status indicator (pending/running/success/error)
- Action buttons

#### Action Buttons by Status
| Status | Actions |
|--------|---------|
| PendingApproval | Allow, Allow for Chat, Always Allow, Reject |
| Running | Abort |
| Success/Error | (Expandable results) |

---

### MentionableBadge (File/Block Display)

**Location**: `src/components/chat-view/chat-input/MentionableBadge.tsx`

Displays attached mentionables with actions.

#### Props Interface
```typescript
type MentionableBadgeProps = {
  mentionable: Mentionable
  onDelete: () => void
  onClick: () => void
  isFocused?: boolean
}
```

#### Badge Variants
| Type | Icon | Features |
|------|------|----------|
| File | Document | Click to preview |
| Folder | Folder | Shows path |
| Vault | Database | Full vault search |
| CurrentFile | Document | Toggle visibility |
| Block | Brackets | Shows line numbers |
| URL | Link | Fetches content |
| Image | Image | Shows thumbnail |

---

### MarkdownCodeComponent (Code Block)

**Location**: `src/components/chat-view/MarkdownCodeComponent.tsx`

Renders code blocks with apply functionality.

#### Props Interface
```typescript
type MarkdownCodeComponentProps = PropsWithChildren<{
  onApply: (blockToApply: string) => void
  isApplying: boolean
  language?: string
  filename?: string
}>
```

#### Internal State
| State | Type | Purpose |
|-------|------|---------|
| `isPreviewMode` | `boolean` | Toggle formatted/raw view |
| `copied` | `boolean` | Copy button feedback |

#### Actions
- Toggle preview/raw view
- Copy to clipboard
- Apply changes to file
- Click filename to open

---

### QueryProgress (RAG Progress)

**Location**: `src/components/chat-view/QueryProgress.tsx`

Shows RAG indexing and query progress.

#### State Types
```typescript
type QueryProgressState =
  | { type: 'idle' }
  | { type: 'reading-mentionables' }
  | { type: 'indexing'; indexProgress: IndexProgress }
  | { type: 'querying' }
  | { type: 'querying-done'; queryResult: SearchResult[] }
```

#### Props Interface
```typescript
type QueryProgressProps = {
  state: QueryProgressState
}
```

---

### ChatListDropdown (Conversation History)

**Location**: `src/components/chat-view/ChatListDropdown.tsx`

Dropdown for loading previous conversations.

#### Props Interface
```typescript
type ChatListDropdownProps = {
  chatList: ChatConversationMetadata[]
  currentConversationId: string
  onSelect: (conversationId: string) => Promise<void>
  onDelete: (conversationId: string) => Promise<void>
  onUpdateTitle: (conversationId: string, newTitle: string) => Promise<void>
  children: React.ReactNode
}
```

#### Features
- Keyboard navigation (Arrow keys, Enter)
- Inline title editing
- Delete with confirmation
- Sorted by last updated

---

## Apply View Component

### ApplyViewRoot (Diff Viewer)

**Location**: `src/components/apply-view/ApplyViewRoot.tsx`

Side-by-side diff viewer for applying code changes.

#### Props Interface
```typescript
type ApplyViewRootProps = {
  state: ApplyViewState
  close: () => void
}
```

#### Internal State
| State | Type | Purpose |
|-------|------|---------|
| `currentDiffIndex` | `number` | Active diff block |
| `diff` | `DiffBlock[]` | Computed differences |
| `modifiedBlockIndices` | `number[]` | Changed block positions |
| `diffBlockRefs` | `Ref[]` | DOM refs for scrolling |

#### Actions
| Button | Function |
|--------|----------|
| Previous/Next | Navigate diff blocks |
| Accept | Apply all changes |
| Reject | Cancel without changes |
| Accept Current | Keep original block |
| Accept Incoming | Use new version |
| Accept Both | Concatenate versions |

#### DiffBlock Types
```typescript
type DiffBlock =
  | { type: 'unchanged'; value: string }
  | { type: 'modified'; originalValue?: string; modifiedValue?: string }
```

---

## Settings Components

### SettingsTabRoot (Container)

**Location**: `src/components/settings/SettingsTabRoot.tsx`

Main settings interface container.

#### Props Interface
```typescript
type SettingsTabRootProps = {
  app: App
  plugin: SmartComposerPlugin
}
```

#### Sections
| Component | Settings |
|-----------|----------|
| `ChatSection` | Model selection, system prompt, chat options |
| `ProvidersSection` | API keys, endpoints, provider config |
| `ModelsSection` | Chat and embedding model management |
| `RAGSection` | Chunk size, patterns, vector DB stats |
| `McpSection` | MCP server configuration |
| `TemplateSection` | Prompt template management |
| `EtcSection` | Miscellaneous options |

---

### ChatSection

**Location**: `src/components/settings/sections/ChatSection.tsx`

#### Controls
| Setting | Type | Description |
|---------|------|-------------|
| Chat Model | Dropdown | Select default chat model |
| Apply Model | Dropdown | Select model for apply operations |
| System Prompt | Textarea | Custom system instructions |
| Include Current File | Toggle | Auto-include active file |
| Enable Tools | Toggle | Allow MCP tool usage |
| Max Auto Iterations | Number | Tool call iteration limit |

---

### ModelsSection

**Location**: `src/components/settings/sections/ModelsSection.tsx`

#### Sub-sections
- **ChatModelsSubSection**: Add/edit/remove chat models
- **EmbeddingModelsSubSection**: Configure embedding models

---

### ProvidersSection

**Location**: `src/components/settings/sections/ProvidersSection.tsx`

#### Provider Configuration
Each provider section includes:
- API Key input (password field)
- Base URL override (optional)
- Provider-specific settings (e.g., Azure deployment)
- Test connection button

---

### RAGSection

**Location**: `src/components/settings/sections/RAGSection.tsx`

#### Settings
| Setting | Type | Description |
|---------|------|-------------|
| Embedding Model | Dropdown | Select embedding model |
| Chunk Size | Number | Text chunk size in tokens |
| Threshold Tokens | Number | When to trigger RAG |
| Min Similarity | Number | Similarity threshold (0-1) |
| Result Limit | Number | Max results returned |
| Exclude Patterns | Text | Glob patterns to ignore |
| Include Patterns | Text | Glob patterns to include |

#### Actions
- View database statistics
- Rebuild index
- Clear vectors

---

### McpSection

**Location**: `src/components/settings/sections/McpSection.tsx`

#### Server Configuration
- Server name, command, arguments
- Environment variables
- Enable/disable toggle
- Tool-level options (auto-execute, disable)

---

## Common Components

### ObsidianSetting (Setting Wrapper)

**Location**: `src/components/common/ObsidianSetting.tsx`

Wraps Obsidian's native Setting component for React.

#### Props Interface
```typescript
type ObsidianSettingProps = {
  name?: string
  desc?: string
  heading?: boolean
  className?: string
  required?: boolean
  children?: React.ReactNode
}
```

#### Context Provider
Provides `SettingContext` for child control components.

---

### ObsidianButton

**Location**: `src/components/common/ObsidianButton.tsx`

#### Props Interface
```typescript
type ObsidianButtonProps = {
  text?: string
  icon?: string
  tooltip?: string
  onClick: () => void
  cta?: boolean
  warning?: boolean
  disabled?: boolean
}
```

---

### ObsidianDropdown

**Location**: `src/components/common/ObsidianDropdown.tsx`

#### Props Interface
```typescript
type ObsidianDropdownProps = {
  value: string
  options: Record<string, string>  // value -> display
  onChange: (value: string) => void
}
```

---

### ObsidianToggle

**Location**: `src/components/common/ObsidianToggle.tsx`

#### Props Interface
```typescript
type ObsidianToggleProps = {
  value: boolean
  onChange: (value: boolean) => void
}
```

---

### ObsidianTextInput

**Location**: `src/components/common/ObsidianTextInput.tsx`

Single-line text input with optional placeholder.

---

### ObsidianTextArea

**Location**: `src/components/common/ObsidianTextArea.tsx`

Multi-line text input for longer content.

---

### ReactModal (Base Class)

**Location**: `src/components/common/ReactModal.tsx`

Extends Obsidian Modal with React rendering.

#### Class Definition
```typescript
class ReactModal<T> extends Modal {
  constructor(props: {
    app: App
    Component: React.ComponentType<T>
    props: Omit<T, 'onClose'>
    options?: { title?: string }
  })
}
```

---

### SplitButton

**Location**: `src/components/common/SplitButton.tsx`

Button with dropdown menu for multiple actions.

---

### DotLoader

**Location**: `src/components/common/DotLoader.tsx`

Animated loading indicator with bouncing dots.

---

## Modal Components

### ConfirmModal

**Location**: `src/components/modals/ConfirmModal.tsx`

Confirmation dialog with customizable actions.

#### Options
```typescript
type ConfirmModalOptions = {
  title: string
  message: string
  ctaText?: string
  onConfirm: () => void
  onCancel?: () => void
}
```

---

### TemplateFormModal

**Location**: `src/components/modals/TemplateFormModal.tsx`

Create or edit prompt templates.

#### Modal Classes
- `CreateTemplateModal` - New template with optional initial content
- `EditTemplateModal` - Modify existing template

#### Props Interface
```typescript
type TemplateFormComponentProps = {
  app: App
  selectedSerializedNodes?: BaseSerializedNode[] | null
  templateId?: string
  onSubmit?: () => void
  onClose: () => void
}
```

---

### ErrorModal

**Location**: `src/components/modals/ErrorModal.tsx`

Error display with optional settings navigation.

---

### McpSectionModal

**Location**: `src/components/modals/McpSectionModal.tsx`

Quick access to MCP configuration from chat.

---

### TemplateSectionModal

**Location**: `src/components/modals/TemplateSectionModal.tsx`

Template management from chat header.

---

## Lexical Editor Plugins

### MentionPlugin

**Location**: `src/components/chat-view/chat-input/plugins/mention/MentionPlugin.tsx`

Autocomplete for file/folder mentions.

#### Trigger
`@` character

#### Features
- Fuzzy search vault contents
- File, folder, vault mentions
- Up to 20 suggestions
- Keyboard navigation

---

### TemplatePlugin

**Location**: `src/components/chat-view/chat-input/plugins/template/TemplatePlugin.tsx`

Insert saved templates.

#### Trigger
`/` character

#### Features
- Search templates by name
- Insert template content
- Async template loading

---

### OnEnterPlugin

**Location**: `src/components/chat-view/chat-input/plugins/OnEnterPlugin.tsx`

Handle Enter key behavior.

#### Behavior
- Enter alone: Submit message
- Cmd/Ctrl+Shift+Enter: Vault search
- Shift+Enter: Newline

---

### ImagePastePlugin

**Location**: `src/components/chat-view/chat-input/plugins/ImagePastePlugin.tsx`

Handle image paste events.

---

### DragDropPastePlugin

**Location**: `src/components/chat-view/chat-input/plugins/DragDropPastePlugin.tsx`

Handle file drag-and-drop.

---

### MentionNode (Custom Lexical Node)

**Location**: `src/components/chat-view/chat-input/plugins/mention/MentionNode.ts`

Custom node type for storing mention data.

```typescript
class MentionNode extends DecoratorNode<JSX.Element> {
  mentionable: Mentionable

  static getType(): string
  static clone(node: MentionNode): MentionNode

  createDOM(): HTMLElement
  updateDOM(): false
  decorate(): JSX.Element

  exportJSON(): SerializedMentionNode
  static importJSON(serialized: SerializedMentionNode): MentionNode
}
```

---

## Custom Hooks

### useAutoScroll

**Location**: `src/components/chat-view/useAutoScroll.ts`

Auto-scroll to bottom behavior for chat.

#### Returns
```typescript
{
  autoScrollToBottom: () => void  // Scrolls if near bottom
  forceScrollToBottom: () => void // Always scrolls
}
```

#### Features
- Debounced scrolling
- User scroll detection
- 20px threshold

---

### useChatStreamManager

**Location**: `src/components/chat-view/useChatStreamManager.ts`

Manages LLM streaming responses.

#### Returns
```typescript
type UseChatStreamManager = {
  abortActiveStreams: () => void
  submitChatMutation: UseMutationResult<void, Error, {
    chatMessages: ChatMessage[]
    conversationId: string
  }>
}
```

#### Features
- AbortController management
- Model fallback handling
- Error notifications
- Auto-iteration with tools

---

### useToolCall

**Location**: `src/components/chat-view/useToolCall.ts`

Manages tool call execution and approval.

#### Returns
```typescript
{
  handleToolCall: () => void
  handleAllowForConversation: () => void
  handleAllowAutoExecution: () => void
  handleReject: () => void
  handleAbort: () => void
}
```

---

### useChatHistory

**Location**: `src/hooks/useChatHistory.ts`

Conversation persistence management.

#### Returns
```typescript
{
  chatList: ChatConversationMetadata[]
  loadConversation: (id: string) => Promise<ChatConversation | null>
  saveConversation: (conversation: ChatConversation) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  updateTitle: (id: string, title: string) => Promise<void>
}
```

---

### useObsidianSetting

**Location**: `src/components/common/ObsidianSetting.tsx`

Access setting context in child components.

#### Returns
```typescript
{
  setting: Setting
}
```

---

### useTemplateManager

**Location**: `src/hooks/useTemplateManager.ts`

Template CRUD operations.

#### Returns
```typescript
{
  templates: Template[]
  createTemplate: (template: Omit<Template, 'id'>) => Promise<Template>
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<Template>
  deleteTemplate: (id: string) => Promise<void>
  searchTemplates: (query: string) => Promise<Template[]>
}
```

---

## Context Providers

### PluginContext

**Location**: `src/contexts/PluginContext.tsx`

```typescript
interface PluginContextType {
  plugin: SmartComposerPlugin
}

function usePlugin(): SmartComposerPlugin
```

---

### AppContext

**Location**: `src/contexts/AppContext.tsx`

```typescript
interface AppContextType {
  app: App
}

function useApp(): App
```

---

### SettingsContext

**Location**: `src/contexts/SettingsContext.tsx`

```typescript
interface SettingsContextType {
  settings: SmartComposerSettings
  setSettings: (settings: SmartComposerSettings) => void | Promise<void>
}

function useSettings(): SettingsContextType
```

---

### DatabaseContext

**Location**: `src/contexts/DatabaseContext.tsx`

```typescript
interface DatabaseContextType {
  getDatabaseManager: () => Promise<DatabaseManager>
  getVectorManager: () => Promise<VectorManager>
  getTemplateManager: () => Promise<LegacyTemplateManager>
}

function useDatabase(): DatabaseContextType
```

---

### RAGContext

**Location**: `src/contexts/RAGContext.tsx`

```typescript
interface RAGContextType {
  getRAGEngine: () => Promise<RAGEngine>
}

function useRAG(): RAGContextType
```

---

### McpContext

**Location**: `src/contexts/McpContext.tsx`

```typescript
interface McpContextType {
  getMcpManager: () => Promise<McpManager>
}

function useMcp(): McpContextType
```

---

### DarkModeContext

**Location**: `src/contexts/DarkModeContext.tsx`

```typescript
interface DarkModeContextType {
  isDarkMode: boolean
}

function useDarkMode(): DarkModeContextType
```

---

### ChatViewContext

**Location**: `src/contexts/ChatViewContext.tsx`

```typescript
interface ChatViewContextType {
  chatViewRef: RefObject<ChatRef>
}

function useChatView(): ChatViewContextType
```

---

## Event Flow Diagrams

### Message Submission Flow

```
User types message
         │
         ▼
┌─────────────────┐
│  ChatUserInput  │
│   onChange()    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ChatUserInput  │
│   onSubmit()    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│        Chat             │
│ handleUserMessageSubmit │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│    PromptGenerator      │
│ compileUserMessagePrompt│
│   (RAG if vault search) │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  useChatStreamManager   │
│  submitChatMutation     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│    ResponseGenerator    │
│        run()            │
│   (streaming response)  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│        Chat             │
│   setChatMessages()     │
│  autoScrollToBottom()   │
└─────────────────────────┘
```

---

### Tool Call Approval Flow

```
LLM requests tool call
         │
         ▼
┌─────────────────────────┐
│      ToolMessage        │
│     ToolCallItem        │
│  (status: PendingApproval)
└────────┬────────────────┘
         │
    User clicks "Allow"
         │
         ▼
┌─────────────────────────┐
│      useToolCall        │
│    handleToolCall()     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│      McpManager         │
│       callTool()        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│    onResponseUpdate     │
│   (status: Running)     │
└────────┬────────────────┘
         │
    Tool executes...
         │
         ▼
┌─────────────────────────┐
│    onResponseUpdate     │
│  (status: Success/Error)│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│        Chat             │
│ handleToolMessageUpdate │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│        Chat             │
│  handleContinueResponse │
│   (if more iterations)  │
└─────────────────────────┘
```

---

### Apply Changes Flow

```
User clicks "Apply" on code block
         │
         ▼
┌─────────────────────────┐
│  MarkdownCodeComponent  │
│       onApply()         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│        Chat             │
│     handleApply()       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│    applyMutation        │
│      mutate()           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   applyChangesToFile    │
│   (LLM generates diff)  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│    ApplyViewRoot        │
│   (opens diff view)     │
└────────┬────────────────┘
         │
    User reviews diffs...
         │
         ▼
┌─────────────────────────┐
│  User clicks "Accept"   │
│    handleAccept()       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│    app.vault.modify()   │
│   (writes to file)      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│      close()            │
│   (closes diff view)    │
└─────────────────────────┘
```

---

## Component Patterns

### Ref Forwarding
```typescript
const Chat = forwardRef<ChatRef, ChatProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    openNewChat: (block) => { /* ... */ },
    addSelectionToChat: (block) => { /* ... */ },
    focusMessage: () => { /* ... */ }
  }))
  // ...
})
```

### Context Consumption
```typescript
function MyComponent() {
  const { settings, setSettings } = useSettings()
  const app = useApp()
  const { getMcpManager } = useMcp()
  // ...
}
```

### Memoization
```typescript
const AssistantTextRenderer = memo(({ content, onApply }) => {
  const parsed = useMemo(() => parseTagContents(content), [content])
  // ...
})
```

### ReactQuery Mutations
```typescript
const submitChatMutation = useMutation({
  mutationFn: async ({ chatMessages, conversationId }) => {
    // ...
  },
  onSuccess: () => { /* ... */ },
  onError: (error) => { /* ... */ }
})
```

---

## File Organization

```
src/components/
├── chat-view/
│   ├── Chat.tsx                    # Main container
│   ├── ChatListDropdown.tsx        # Conversation history
│   ├── UserMessageItem.tsx         # User message display
│   ├── AssistantMessageContent.tsx # Assistant rendering
│   ├── AssistantToolMessageGroupItem.tsx
│   ├── ToolMessage.tsx             # Tool call display
│   ├── QueryProgress.tsx           # RAG progress
│   ├── ObsidianMarkdown.tsx        # Markdown renderer
│   ├── MarkdownCodeComponent.tsx   # Code blocks
│   ├── useAutoScroll.ts
│   ├── useChatStreamManager.ts
│   └── chat-input/
│       ├── ChatUserInput.tsx
│       ├── LexicalContentEditable.tsx
│       ├── MentionableBadge.tsx
│       ├── ModelSelect.tsx
│       ├── SubmitButton.tsx
│       ├── VaultChatButton.tsx
│       ├── ImageUploadButton.tsx
│       ├── ToolBadge.tsx
│       └── plugins/
│           ├── mention/
│           ├── template/
│           └── [other plugins]
├── apply-view/
│   └── ApplyViewRoot.tsx
├── settings/
│   ├── SettingsTabRoot.tsx
│   └── sections/
│       ├── ChatSection.tsx
│       ├── ProvidersSection.tsx
│       ├── ModelsSection.tsx
│       ├── RAGSection.tsx
│       ├── McpSection.tsx
│       └── [other sections]
├── common/
│   ├── ObsidianSetting.tsx
│   ├── ObsidianButton.tsx
│   ├── ObsidianDropdown.tsx
│   ├── ObsidianToggle.tsx
│   ├── ReactModal.tsx
│   └── [other common components]
└── modals/
    ├── ConfirmModal.tsx
    ├── TemplateFormModal.tsx
    └── [other modals]
```

---

*This component specification is auto-generated from source code analysis. For implementation details, refer to the TypeScript source files.*
