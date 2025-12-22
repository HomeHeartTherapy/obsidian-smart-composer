# UI Upgrade Specification: Two-Row Provider & Thinking Controls

**Version:** 2.0
**Date:** 2024-12-19
**Status:** APPROVED - Implementation Ready
**Related:** ADR-017 (Extended Thinking Variants), ROADMAP.md
**Thread:** [2024.12.19 Smart Composer UI Upgrade](C:\claude\claude-conversations\threads\2024.12.19%20Smart%20Composer%20UI%20Upgrade%20-%20Thinking%20Dropdown%20and%20Context%20System\THREAD.md)

---

## Executive Summary

Add a two-row control bar to the chat input, inspired by VS Code Codex's UI pattern:
- **Row 1:** Provider selector + API/Subscription toggle (adjacent on left)
- **Row 2:** Model selector + Thinking level dropdown + action buttons

This provides users immediate access to provider, model, and thinking configuration without navigating to settings.

---

## Final Decisions (from Clarification Rounds)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Layout | Two rows | Better contrast and readability |
| Row 1 Left | [Provider ▼] [API/Subscription ▼] | Adjacent dropdowns for provider config |
| Row 1 Right | Open for future additions | Reserved space |
| Row 2 | [Model ▼] [Thinking ▼] ... [buttons] | Model and thinking selection |
| Provider Names | Product names (Claude, ChatGPT, Gemini) | User recognition over company names |
| Provider Structure | Single provider with API/Subscription toggle | NOT two separate providers |
| Persistence | data.json | Consistent with existing settings |
| State Per Provider | Remember last successful settings | Persists across Obsidian sessions |
| OpenAI | HAS thinking options (Codex: Low/Med/High/Extra high) | Corrected from initial proposal |
| Priority | Claude (Subscription) first | Already working via Claude Code |

---

## Reference: VS Code Codex UI Analysis

### Screenshots Analyzed

| Screenshot | Description | Key Insight |
|------------|-------------|-------------|
| 4252 | Codex panel overview | Task history, workspace selector, rate limits |
| 4253 | Rate limits expanded | 5h/Weekly limits with percentages and reset times |
| 4254 | Mode selector | Chat / Agent / Agent (full access) |
| 4255 | Model selector | GPT-5.2-Codex / GPT-5.1-Codex-Max / GPT-5.2 |
| 4256 | **Reasoning selector** | Low / Medium / High / Extra high |

### Codex Chat Input Layout

```
┌─────────────────────────────────────────────────────────┐
│  Ask Codex to do anything...                            │
├─────────────────────────────────────────────────────────┤
│ [+] [/] [Auto context] [Model ▼] [Reasoning ▼]     [↑] │
└─────────────────────────────────────────────────────────┘
```

**Control Bar Elements:**
- `[+]` - Add attachment/context
- `[/]` - Slash commands
- `[Auto context]` - Toggle automatic context detection
- `[Model ▼]` - Model selector dropdown
- `[Reasoning ▼]` - Reasoning level dropdown (THE KEY FEATURE)
- `[↑]` - Send button

### Codex Dropdown Options

**Mode Selector:**
```
Switch mode
○ Chat
○ Agent
● Agent (full access) ✓
```

**Model Selector:**
```
Select model
● GPT-5.2-Codex ✓
○ GPT-5.1-Codex-Max
○ GPT-5.2
─────────────────────
Choose model and reasoning
```

**Reasoning Selector:**
```
Select reasoning
○ Low
○ Medium
○ High
● Extra high ✓
```

---

## Proposed Smart Composer Implementation

### Target Layout (Two-Row Design - FINAL)

```
┌─────────────────────────────────────────────────────────────────┐
│  [@mention] Chat input with Lexical editor...                   │
├─────────────────────────────────────────────────────────────────┤
│ ROW 1: [Claude ▼] [API ▼]                                       │
├─────────────────────────────────────────────────────────────────┤
│ ROW 2: [Model ▼] [Thinking ▼]      [Image] [Submit] [Vault]     │
└─────────────────────────────────────────────────────────────────┘
```

**Row 1 Elements (Left-aligned, adjacent):**
- `[Claude ▼]` - Provider selector (Claude, ChatGPT, Gemini, etc.)
- `[API ▼]` - Connection type toggle (API / Subscription)
- Right side reserved for future additions

**Row 2 Elements:**
- `[Model ▼]` - Model selector (filtered by provider + connection type)
- `[Thinking ▼]` - Thinking/reasoning level (provider-specific options)
- `[Image]` - Image upload button
- `[Submit]` - Send message button
- `[Vault]` - Vault chat button

### Thinking Level Options by Provider

#### Anthropic API
```
Select thinking level
○ OFF (default)
○ Standard (10k tokens)
○ High (20k tokens)
○ Max (32k tokens)
```

**Implementation:** Maps to `thinking.budget_tokens`:
- OFF: `undefined` (no thinking block)
- Standard: `10000`
- High: `20000`
- Max: `32000`

#### Claude Code (CLI)
```
Select thinking level
○ OFF
○ Low (~4k tokens)
○ Medium (~10k tokens)
○ High (~20k tokens)
○ Ultrathink (~32k tokens)
```

**Implementation:** Maps to `thinkingLevel` enum:
- OFF: `undefined`
- Low: `"low"`
- Medium: `"medium"`
- High: `"high"`
- Ultrathink: `"ultrathink"` (custom, maps to max)

#### OpenAI (API)
```
Select reasoning effort
○ OFF (default)
○ Low
○ Medium
○ High
```

**Implementation:** Maps to `reasoning.reasoning_effort`:
- OFF: `undefined`
- Low: `"low"`
- Medium: `"medium"`
- High: `"high"`

#### OpenAI (Codex Subscription)
```
Select reasoning
○ Low
○ Medium
○ High
○ Extra high
```

**Note:** Codex subscription uses different reasoning levels. Research needed for exact API mapping.

#### Google Gemini
```
(TBD - research Gemini's thinking/reasoning API)
```

#### Ollama / Local
```
(No thinking options - dropdown hidden)
```

---

## Technical Design

### Option A: Per-Message Override (Recommended)

Thinking level selected in chat UI overrides the model's default thinking config for that message only.

```typescript
interface ChatMessage {
  // ... existing fields
  thinkingOverride?: ThinkingLevel; // NEW
}

type ThinkingLevel =
  | { type: 'off' }
  | { type: 'standard', budget: 10000 }
  | { type: 'high', budget: 20000 }
  | { type: 'max', budget: 32000 };
```

**Pros:**
- Flexible per-message control
- Doesn't modify settings/models
- Easy to implement

**Cons:**
- State management for "current selection"
- Need to persist across messages?

### Option B: Quick Model Switcher

Dropdown shows all thinking variants of currently selected model.

```
Current: claude-opus-4-5
──────────────────────────
○ claude-opus-4-5 (no thinking)
○ claude-opus-4-5-thinking (10k)
○ claude-opus-4-5-thinking-high (20k)
○ claude-opus-4-5-thinking-max (32k)
```

**Pros:**
- Uses existing model selection infrastructure
- Clear which variant is active

**Cons:**
- Many models to scroll through
- Harder to compare across model families

### Option C: Hybrid

Show thinking dropdown that dynamically filters/updates based on selected model family.

---

## UI Component Structure

### New Components Needed

```
src/components/chat-view/
├── ChatInput.tsx           (modify)
├── ChatInputControls.tsx   (NEW - control bar)
├── ThinkingDropdown.tsx    (NEW)
├── ModelDropdown.tsx       (NEW, optional)
└── ProviderBadge.tsx       (NEW, optional)
```

### ThinkingDropdown Component

```tsx
interface ThinkingDropdownProps {
  provider: ProviderType;
  currentLevel: ThinkingLevel;
  onChange: (level: ThinkingLevel) => void;
  disabled?: boolean;
}

const ThinkingDropdown: React.FC<ThinkingDropdownProps> = ({
  provider,
  currentLevel,
  onChange,
  disabled
}) => {
  const options = getThinkingOptionsForProvider(provider);

  if (options.length === 0) {
    return null; // Hide for providers without thinking
  }

  return (
    <Dropdown
      label={`Thinking: ${currentLevel.label}`}
      options={options}
      value={currentLevel}
      onChange={onChange}
      disabled={disabled}
    />
  );
};
```

### Provider-Specific Options

```typescript
function getThinkingOptionsForProvider(provider: ProviderType): ThinkingOption[] {
  switch (provider) {
    case 'anthropic':
      return [
        { id: 'off', label: 'OFF', budget: undefined },
        { id: 'standard', label: 'Standard (10k)', budget: 10000 },
        { id: 'high', label: 'High (20k)', budget: 20000 },
        { id: 'max', label: 'Max (32k)', budget: 32000 },
      ];

    case 'claude-code':
      return [
        { id: 'off', label: 'OFF', level: undefined },
        { id: 'low', label: 'Low (~4k)', level: 'low' },
        { id: 'medium', label: 'Medium (~10k)', level: 'medium' },
        { id: 'high', label: 'High (~20k)', level: 'high' },
        { id: 'ultrathink', label: 'Ultrathink (~32k)', level: 'ultrathink' },
      ];

    case 'openai':
      return [
        { id: 'off', label: 'OFF', effort: undefined },
        { id: 'low', label: 'Low', effort: 'low' },
        { id: 'medium', label: 'Medium', effort: 'medium' },
        { id: 'high', label: 'High', effort: 'high' },
      ];

    case 'openai-codex': // Subscription
      return [
        { id: 'low', label: 'Low', effort: 'low' },
        { id: 'medium', label: 'Medium', effort: 'medium' },
        { id: 'high', label: 'High', effort: 'high' },
        { id: 'extra-high', label: 'Extra high', effort: 'extra_high' },
      ];

    default:
      return []; // No thinking options (gemini, ollama, etc.)
  }
}
```

---

## State Management

### Where to Store Current Thinking Level

**Option 1: React State (Session Only)**
```tsx
const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>('off');
```
- Resets on reload
- Simple implementation

**Option 2: Settings (Persistent)**
```typescript
// In SmartCopilotSettings
defaultThinkingLevel?: ThinkingLevel;
```
- Persists across sessions
- Requires settings migration

**Option 3: Per-Chat State**
```typescript
// In Chat metadata
interface Chat {
  // ...existing
  thinkingLevel?: ThinkingLevel;
}
```
- Different chats can have different defaults
- More complex

**Recommendation:** Start with Option 1 (session state), add Option 2 (persistent default) later.

---

## Implementation Phases

### Phase 1: Basic Dropdown (MVP)
1. Create `ThinkingDropdown` component
2. Add to `ChatInput` component
3. Wire up state management (session only)
4. Pass override to provider on send

### Phase 2: Provider Awareness
1. Detect current provider from selected model
2. Show/hide dropdown based on provider
3. Map options correctly for each provider

### Phase 3: Polish
1. Add icons to dropdown options
2. Keyboard shortcuts
3. Persist last selection
4. Add to settings as default

### Phase 4: Extended (Optional)
1. Model quick-switcher dropdown
2. Provider badge/indicator
3. Token budget display
4. Rate limit indicator (like Codex)

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/chat-view/ChatView.tsx` | Add state for thinking level |
| `src/components/chat-view/chat-input/ChatInput.tsx` | Add ThinkingDropdown |
| `src/components/chat-view/chat-input/ThinkingDropdown.tsx` | NEW component |
| `src/core/llm/anthropic.ts` | Accept thinking override |
| `src/core/llm/claudeCode.ts` | Accept thinking override |
| `src/types.ts` | Add ThinkingLevel type |
| `styles.css` | Dropdown styling |

---

## Open Questions

1. **Should thinking level persist per-chat or globally?**
   - Codex appears to be global/session

2. **Show provider badge in chat input?**
   - Helps user know which dropdown options to expect

3. **What about models that don't support thinking?**
   - Hide dropdown? Show disabled? Show "Not supported"?

4. **Mobile/responsive behavior?**
   - Obsidian mobile is limited, may need different UI

---

## Appendix: Screenshot Locations

Screenshots referenced in this document are stored at:
```
C:\PT_VRTE1\OneDrive - Home Heart LLC\Screenshots\
```

Key files:
- `Screenshot (4252).png` - Codex overview
- `Screenshot (4253).png` - Rate limits
- `Screenshot (4254).png` - Mode selector
- `Screenshot (4255).png` - Model selector
- `Screenshot (4256).png` - Reasoning selector (KEY REFERENCE)

---

## Current Codebase Analysis

### Existing Chat Input Structure

**File:** `src/components/chat-view/chat-input/ChatUserInput.tsx`

```
┌─────────────────────────────────────────────────────────┐
│ smtcmp-chat-user-input-files                            │
│ [ToolBadge] [MentionableBadge] [MentionableBadge]...    │
├─────────────────────────────────────────────────────────┤
│ MentionableContentPreview (conditional)                 │
├─────────────────────────────────────────────────────────┤
│ LexicalContentEditable                                  │
│ (Lexical editor with mention/template plugins)          │
├─────────────────────────────────────────────────────────┤
│ smtcmp-chat-user-input-controls                         │
│ [ModelSelect ▼]        [Image] [Submit] [VaultChat]     │
└─────────────────────────────────────────────────────────┘
```

### ModelSelect Component

**File:** `src/components/chat-view/chat-input/ModelSelect.tsx`

Already uses Radix UI DropdownMenu - exact same pattern for ThinkingDropdown:

```tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

// Shows settings.chatModelId
// Lists settings.chatModels.filter(({ enable }) => enable ?? true)
// Updates settings.chatModelId on select
```

### ChatModel Types

**File:** `src/types/chat-model.types.ts`

Provider-specific thinking configurations:

```typescript
// Anthropic
thinking?: {
  enabled: boolean;
  budget_tokens: number;  // 10000, 20000, 32000
}

// Claude Code
thinkingLevel?: 'none' | 'low' | 'medium' | 'high' | 'max'

// OpenAI (for future)
reasoning?: {
  enabled: boolean;
  reasoning_effort?: string;
}
```

### Current Thinking Model Variants in constants.ts

**Anthropic API (9 variants):**
- `claude-opus-4.5-thinking` (10k)
- `claude-opus-4.5-thinking-high` (20k)
- `claude-opus-4.5-thinking-max` (32k)
- `claude-sonnet-4.5-thinking` (10k)
- `claude-sonnet-4.5-thinking-high` (20k)
- `claude-sonnet-4.5-thinking-max` (32k)
- `claude-haiku-4.5-thinking` (10k)
- `claude-haiku-4.5-thinking-high` (20k)
- `claude-haiku-4.5-thinking-max` (32k)

**Claude Code (12+ variants):**
- `claude-code/opus-4.5`, `-think`, `-think-hard`, `-ultrathink`
- `claude-code/sonnet-4.5`, `-think`, `-think-hard`, `-ultrathink`
- `claude-code/sonnet-4`, `-think`, `-think-hard`, `-ultrathink`
- `claude-code/haiku-4.5`, `-think`, `-think-hard`, `-ultrathink`

**Problem:** Model dropdown shows 30+ entries - hard to navigate

**Solution:** ThinkingDropdown separates thinking selection from model selection

---

## Implementation Recommendation

### Minimal Viable Change

Add `ThinkingSelect` component next to existing `ModelSelect`:

```tsx
// In ChatUserInput.tsx, around line 274-277
<div className="smtcmp-chat-user-input-controls">
  <div className="smtcmp-chat-user-input-controls__model-select-container">
    <ModelSelect />
    <ThinkingSelect />  {/* NEW */}
  </div>
  // ...buttons
</div>
```

### ThinkingSelect Component

```tsx
// src/components/chat-view/chat-input/ThinkingSelect.tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useSettings } from '../../../contexts/settings-context'

export function ThinkingSelect() {
  const { settings } = useSettings()
  const [isOpen, setIsOpen] = useState(false)

  // Get current model to determine provider
  const currentModel = settings.chatModels.find(
    m => m.id === settings.chatModelId
  )

  // Only show for providers with thinking support
  if (!currentModel ||
      !['anthropic', 'claude-code'].includes(currentModel.providerType)) {
    return null
  }

  const options = getThinkingOptions(currentModel.providerType)
  const currentLevel = getCurrentThinkingLevel(currentModel)

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger className="smtcmp-chat-input-thinking-select">
        Thinking: {currentLevel}
      </DropdownMenu.Trigger>
      // ... dropdown content
    </DropdownMenu.Root>
  )
}
```

### Key Design Decision

**Option A (Simpler):** ThinkingSelect modifies `settings.chatModelId` to switch between thinking variants

- Example: User selects "High" → switches from `claude-sonnet-4.5` to `claude-sonnet-4.5-thinking-high`
- Pros: No changes to providers, uses existing model variants
- Cons: Creates coupling between UI and model naming convention

**Option B (Cleaner):** ThinkingSelect stores separate state, merged at request time

- Pros: Cleaner separation, model list stays short
- Cons: Requires provider changes to accept runtime thinking override

**Recommendation:** Start with Option A for quick win, refactor to Option B later

---

*Document created: 2024-12-19*
*Based on VS Code Codex UI analysis*
*Updated with codebase analysis: 2024-12-19*
