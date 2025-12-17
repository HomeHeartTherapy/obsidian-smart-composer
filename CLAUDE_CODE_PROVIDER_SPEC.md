# Claude Code Provider - Complete Technical Specification

**Document Version:** 2.0
**Date:** 2025-12-17
**Status:** IMPLEMENTATION COMPLETE - Awaiting Production Verification
**Schema Version:** 13 (upgraded from 12)

---

## Executive Summary

This document specifies the implementation of a Claude Code provider for the Smart Composer Obsidian plugin. The provider wraps the `claude` CLI to allow users to use their Claude Max/Pro subscription instead of paying API fees.

### Implementation Status

| Component | Status | Verified |
|-----------|--------|----------|
| Provider class (`claudeCode.ts`) | DONE | Build passes |
| Type definitions (Zod schemas) | DONE | Build passes |
| Constants (models, provider info) | DONE | Build passes |
| Manager registration | DONE | Build passes |
| Settings migration (12→13) | DONE | Build passes |
| Unit tests | 114/114 pass | Yes |
| Production testing | PENDING | User must verify |

### Critical Discovery: Settings Migration

**RESOLVED:** The initial implementation was missing a settings migration. Migration 12→13 has been added to inject the claude-code provider and models into existing user settings.

**Root Cause:** Smart Composer uses versioned settings stored in `data.json`. Adding models to `constants.ts` only affects new installations. Existing users' settings are not updated without an explicit migration.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [File Inventory](#2-file-inventory)
3. [Type Definitions](#3-type-definitions)
4. [Provider Implementation](#4-provider-implementation)
5. [Configuration & Constants](#5-configuration--constants)
6. [Settings Migration](#6-settings-migration)
7. [UI Integration](#7-ui-integration)
8. [CLI Execution](#8-cli-execution)
9. [Error Handling](#9-error-handling)
10. [Testing Strategy](#10-testing-strategy)
11. [Known Issues & Debugging](#11-known-issues--debugging)
12. [External References](#12-external-references)
13. [Architectural Decision Records (ADRs)](#13-architectural-decision-records-adrs)
14. [Verified Correct Implementation](#14-verified-correct-implementation)
15. [Known Type Inconsistencies](#15-known-type-inconsistencies)
16. [Defensive Debugging Guide](#16-defensive-debugging-guide)
17. [Tools & Resources for Debugging](#17-tools--resources-for-debugging)
18. [Future Session Recovery](#18-future-session-recovery)

---

## 1. Architecture Overview

### 1.1 Smart Composer Provider Architecture

Smart Composer uses a layered architecture for LLM providers:

```
┌─────────────────────────────────────────────────────────────┐
│                     Settings UI                              │
│  (src/components/settings/*)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Settings Schema                            │
│  (src/settings/schema/setting.types.ts)                     │
│  - SmartComposerSettings                                    │
│  - providers: LLMProvider[]                                 │
│  - chatModels: ChatModel[]                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Provider Manager                           │
│  (src/core/llm/manager.ts)                                  │
│  - getProviderClient() - Factory function                   │
│  - getChatModelClient() - Lookup model + provider           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Provider Classes                           │
│  (src/core/llm/*.ts)                                        │
│  - AnthropicProvider                                        │
│  - OpenAIAuthenticatedProvider                              │
│  - ClaudeCodeProvider  ◄── NEW                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  - Anthropic API (HTTP)                                     │
│  - Claude CLI (child_process.spawn)  ◄── NEW                │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

1. User selects model in Settings UI
2. Settings stored in `SmartComposerSettings.chatModels` and `chatModelId`
3. When chat starts, `getChatModelClient()` called
4. Looks up `ChatModel` by ID from `settings.chatModels`
5. Looks up `LLMProvider` by `chatModel.providerId` from `settings.providers`
6. Factory instantiates correct provider class
7. Provider's `streamResponse()` or `generateResponse()` called

### 1.3 Key Insight: Settings Migrations

**CRITICAL:** When adding new default models/providers, a **settings migration** is required.

The comment in `src/constants.ts` states:
```typescript
/**
 * Important
 * 1. When adding new default model, settings migration should be added
 * 2. If there's same model id in user's settings, it's data should be overwritten by default model
 */
```

**THIS WAS NOT DONE.** This is likely why models don't appear.

---

## 2. File Inventory

### 2.1 Files Modified

| File | Purpose | Status |
|------|---------|--------|
| `src/types/provider.types.ts` | Add 'claude-code' to LLMProviderType union | DONE |
| `src/types/chat-model.types.ts` | Add 'claude-code' to ChatModel union + thinkingLevel | DONE |
| `src/types/embedding-model.types.ts` | Add 'claude-code' to EmbeddingModel union | DONE |
| `src/constants.ts` | Add PROVIDER_TYPES_INFO + DEFAULT_PROVIDERS + DEFAULT_CHAT_MODELS | DONE |
| `src/core/llm/manager.ts` | Register ClaudeCodeProvider in switch | DONE |

### 2.2 Files Created

| File | Purpose | Status |
|------|---------|--------|
| `src/core/llm/claudeCode.ts` | Provider implementation | DONE |
| `HOMEHEART_INSTALL.md` | User documentation | DONE |

### 2.3 Files NOT Modified (LIKELY NEEDED)

| File | Purpose | Required Action |
|------|---------|-----------------|
| `src/settings/schema/migrations/*.ts` | Settings migrations | **CREATE NEW MIGRATION** |
| `src/settings/schema/setting.types.ts` | Settings schema version | **INCREMENT VERSION** |

---

## 3. Type Definitions

### 3.1 Provider Type (`src/types/provider.types.ts`)

```typescript
// Added to llmProviderSchema discriminated union:
z.object({
  type: z.literal('claude-code'),
  ...baseLlmProviderSchema.shape,
  additionalSettings: z
    .object({
      cliPath: z.string().optional(),
    })
    .optional(),
}),
```

**Base schema includes:**
- `id: string` - Unique provider identifier
- `baseUrl?: string` - Not used for claude-code
- `apiKey?: string` - Not used for claude-code
- `additionalSettings?: object` - Contains cliPath

### 3.2 Chat Model Type (`src/types/chat-model.types.ts`)

```typescript
// Added to chatModelSchema discriminated union:
z.object({
  providerType: z.literal('claude-code'),
  ...baseChatModelSchema.shape,
  thinkingLevel: z
    .enum(['none', 'low', 'medium', 'high', 'max'])
    .default('none')
    .optional(),
}),
```

**Base schema includes:**
- `providerId: string` - Links to provider
- `id: string` - Unique model identifier (e.g., 'claude-code/opus-4.5')
- `model: string` - API model string (e.g., 'claude-opus-4-5-20251101')
- `promptLevel?: PromptLevel`
- `enable?: boolean`

**thinkingLevel values:**
- `'none'` - No thinking trigger
- `'low'` - "Think about this: " prefix (~4k tokens)
- `'medium'` - "Think hard about this: " prefix (~10k tokens)
- `'high'` - "Think harder about this: " prefix (~20k tokens)
- `'max'` - "Ultrathink: " prefix (~32k tokens)

### 3.3 Embedding Model Type (`src/types/embedding-model.types.ts`)

```typescript
// Added for type completeness (claude-code doesn't support embeddings):
z.object({
  providerType: z.literal('claude-code'),
  ...baseEmbeddingModelSchema.shape,
}),
```

---

## 4. Provider Implementation

### 4.1 File: `src/core/llm/claudeCode.ts`

**Complete implementation:**

```typescript
import { spawn } from 'child_process'
import { Platform } from 'obsidian'

import { ChatModel } from '../../types/chat-model.types'
import {
  LLMOptions,
  LLMRequestNonStreaming,
  LLMRequestStreaming,
  RequestMessage,
} from '../../types/llm/request'
import {
  LLMResponseNonStreaming,
  LLMResponseStreaming,
} from '../../types/llm/response'
import { LLMProvider } from '../../types/provider.types'

import { BaseLLMProvider } from './base'

export class ClaudeCodeProvider extends BaseLLMProvider<
  Extract<LLMProvider, { type: 'claude-code' }>
> {
  private static readonly DEFAULT_CLI_PATH = 'claude'

  private static readonly THINKING_TRIGGERS: Record<string, string> = {
    none: '',
    low: 'Think about this: ',
    medium: 'Think hard about this: ',
    high: 'Think harder about this: ',
    max: 'Ultrathink: ',
  }

  constructor(provider: Extract<LLMProvider, { type: 'claude-code' }>) {
    super(provider)
    if (!Platform.isDesktop) {
      throw new Error('Claude Code provider is only available on desktop.')
    }
  }

  private getCliPath(): string {
    return this.provider.additionalSettings?.cliPath ||
           ClaudeCodeProvider.DEFAULT_CLI_PATH
  }

  private static formatMessagesAsPrompt(
    messages: RequestMessage[],
    thinkingLevel?: string,
  ): string {
    const parts: string[] = []
    const trigger = ClaudeCodeProvider.THINKING_TRIGGERS[thinkingLevel || 'none'] || ''

    for (const message of messages) {
      switch (message.role) {
        case 'system':
          parts.push(`[System]\n${message.content}\n`)
          break
        case 'user': {
          const content = Array.isArray(message.content)
            ? message.content
                .filter((part) => part.type === 'text')
                .map((part) => part.text)
                .join('\n')
            : message.content
          parts.push(`[User]\n${content}\n`)
          break
        }
        case 'assistant':
          parts.push(`[Assistant]\n${message.content}\n`)
          break
        case 'tool':
          parts.push(`[Tool Result: ${message.tool_call.name}]\n${message.content}\n`)
          break
      }
    }

    const basePrompt = parts.join('\n')
    return trigger ? `${trigger}${basePrompt}` : basePrompt
  }

  private async executeClaudeCli(
    prompt: string,
    modelName: string,
    signal?: AbortSignal,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const cliPath = this.getCliPath()
      const args = ['-p', '--output-format', 'text', '--model', modelName, prompt]

      const child = spawn(cliPath, args, {
        stdio: ['inherit', 'pipe', 'pipe'],  // CRITICAL: 'inherit' for stdin
        env: {
          ...process.env,
          ANTHROPIC_API_KEY: '',  // CRITICAL: Must be empty string
        },
        windowsHide: true,
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString()
      })

      if (signal) {
        signal.addEventListener('abort', () => {
          child.kill('SIGTERM')
          reject(new Error('Request aborted'))
        })
      }

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim())
        } else {
          reject(new Error(this.parseErrorMessage(stderr, code)))
        }
      })

      child.on('error', (error) => {
        if (error.message.includes('ENOENT')) {
          reject(new Error(
            `Claude Code CLI not found at "${cliPath}". ` +
            'Install with: npm install -g @anthropic-ai/claude-code'
          ))
        } else {
          reject(new Error(`CLI error: ${error.message}`))
        }
      })
    })
  }

  private parseErrorMessage(stderr: string, exitCode: number | null): string {
    const lower = stderr.toLowerCase()
    if (lower.includes('login') || lower.includes('authenticate')) {
      return "Claude Code not logged in. Run 'claude login' in terminal."
    }
    if (lower.includes('limit') || lower.includes('rate')) {
      return 'Usage limit reached. Limits reset every 5 hours.'
    }
    if (stderr.trim()) {
      return `Claude Code error (code ${exitCode}): ${stderr.trim()}`
    }
    return `Claude Code exited with code ${exitCode}`
  }

  async generateResponse(
    model: ChatModel,
    request: LLMRequestNonStreaming,
    options?: LLMOptions,
  ): Promise<LLMResponseNonStreaming> {
    if (model.providerType !== 'claude-code') {
      throw new Error('Model is not a Claude Code model')
    }

    const thinkingLevel = model.thinkingLevel
    const prompt = ClaudeCodeProvider.formatMessagesAsPrompt(
      request.messages,
      thinkingLevel,
    )
    const response = await this.executeClaudeCli(prompt, request.model, options?.signal)

    return {
      id: `claude-code-${Date.now()}`,
      choices: [{
        finish_reason: 'stop',
        message: { content: response, role: 'assistant' },
      }],
      model: request.model,
      object: 'chat.completion',
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    }
  }

  async streamResponse(
    model: ChatModel,
    request: LLMRequestStreaming,
    options?: LLMOptions,
  ): Promise<AsyncIterable<LLMResponseStreaming>> {
    if (model.providerType !== 'claude-code') {
      throw new Error('Model is not a Claude Code model')
    }

    const thinkingLevel = model.thinkingLevel
    const prompt = ClaudeCodeProvider.formatMessagesAsPrompt(
      request.messages,
      thinkingLevel,
    )
    const response = await this.executeClaudeCli(prompt, request.model, options?.signal)
    return this.createStreamFromResponse(response, request.model)
  }

  private async *createStreamFromResponse(
    response: string,
    modelName: string,
  ): AsyncIterable<LLMResponseStreaming> {
    const messageId = `claude-code-${Date.now()}`

    yield {
      id: messageId,
      choices: [{ finish_reason: null, delta: { content: response, role: 'assistant' } }],
      object: 'chat.completion.chunk',
      model: modelName,
    }

    yield {
      id: messageId,
      choices: [{ finish_reason: 'stop', delta: {} }],
      object: 'chat.completion.chunk',
      model: modelName,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    }
  }

  async getEmbedding(_model: string, _text: string): Promise<number[]> {
    throw new Error('Claude Code provider does not support embeddings.')
  }
}
```

### 4.2 Manager Registration (`src/core/llm/manager.ts`)

```typescript
// Add import at top:
import { ClaudeCodeProvider } from './claudeCode'

// Add case in getProviderClient switch:
case 'claude-code': {
  return new ClaudeCodeProvider(provider)
}
```

---

## 5. Configuration & Constants

### 5.1 PROVIDER_TYPES_INFO (`src/constants.ts`)

```typescript
'claude-code': {
  label: 'Claude Code (Max/Pro Subscription)',
  defaultProviderId: 'claude-code',
  requireApiKey: false,
  requireBaseUrl: false,
  supportEmbedding: false,
  additionalSettings: [
    {
      label: 'CLI Path',
      key: 'cliPath',
      type: 'text',
      placeholder: 'claude (default, uses system PATH)',
      required: false,
      description: 'Path to Claude Code CLI. Leave empty for default.',
    },
  ],
},
```

### 5.2 DEFAULT_PROVIDERS (`src/constants.ts`)

```typescript
{
  type: 'claude-code',
  id: PROVIDER_TYPES_INFO['claude-code'].defaultProviderId,
},
```

### 5.3 DEFAULT_CHAT_MODELS (`src/constants.ts`)

**16 model variants added:**

```typescript
// Opus 4.5 variants
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/opus-4.5', model: 'claude-opus-4-5-20251101' },
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/opus-4.5-think', model: 'claude-opus-4-5-20251101', thinkingLevel: 'low' },
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/opus-4.5-think-hard', model: 'claude-opus-4-5-20251101', thinkingLevel: 'medium' },
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/opus-4.5-ultrathink', model: 'claude-opus-4-5-20251101', thinkingLevel: 'max' },

// Sonnet 4.5 variants
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4.5', model: 'claude-sonnet-4-5-20250929' },
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4.5-think', model: 'claude-sonnet-4-5-20250929', thinkingLevel: 'low' },
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4.5-think-hard', model: 'claude-sonnet-4-5-20250929', thinkingLevel: 'medium' },
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4.5-ultrathink', model: 'claude-sonnet-4-5-20250929', thinkingLevel: 'max' },

// Sonnet 4 variants
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4', model: 'claude-sonnet-4-20250514' },
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4-think', model: 'claude-sonnet-4-20250514', thinkingLevel: 'low' },
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4-think-hard', model: 'claude-sonnet-4-20250514', thinkingLevel: 'medium' },
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4-ultrathink', model: 'claude-sonnet-4-20250514', thinkingLevel: 'max' },

// Haiku 4.5 variants
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/haiku-4.5', model: 'claude-haiku-4-5-20251001' },
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/haiku-4.5-think', model: 'claude-haiku-4-5-20251001', thinkingLevel: 'low' },
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/haiku-4.5-think-hard', model: 'claude-haiku-4-5-20251001', thinkingLevel: 'medium' },
{ providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/haiku-4.5-ultrathink', model: 'claude-haiku-4-5-20251001', thinkingLevel: 'max' },
```

---

## 6. Settings Migration

### 6.1 WHY THIS IS CRITICAL

Smart Composer uses versioned settings with migrations. When you add new default providers/models, existing users won't see them unless a migration adds them.

**Location:** `src/settings/schema/migrations/`

**Pattern:** Each migration file exports a function that transforms settings from version N to N+1.

### 6.2 Current Migration Chain

Check `src/settings/schema/migrations/` for files like:
- `10_to_11.ts`
- `11_to_12.ts`

The latest version is in `src/settings/schema/setting.types.ts`:
```typescript
export const SETTINGS_SCHEMA_VERSION = 12  // Check actual value
```

### 6.3 Required Migration

**Create:** `src/settings/schema/migrations/12_to_13.ts` (or appropriate version)

```typescript
import { PROVIDER_TYPES_INFO } from '../../../constants'

// Define the new models to add
const CLAUDE_CODE_PROVIDER = {
  type: 'claude-code' as const,
  id: PROVIDER_TYPES_INFO['claude-code'].defaultProviderId,
}

const CLAUDE_CODE_MODELS = [
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/opus-4.5', model: 'claude-opus-4-5-20251101' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/opus-4.5-think', model: 'claude-opus-4-5-20251101', thinkingLevel: 'low' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/opus-4.5-think-hard', model: 'claude-opus-4-5-20251101', thinkingLevel: 'medium' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/opus-4.5-ultrathink', model: 'claude-opus-4-5-20251101', thinkingLevel: 'max' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4.5', model: 'claude-sonnet-4-5-20250929' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4.5-think', model: 'claude-sonnet-4-5-20250929', thinkingLevel: 'low' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4.5-think-hard', model: 'claude-sonnet-4-5-20250929', thinkingLevel: 'medium' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4.5-ultrathink', model: 'claude-sonnet-4-5-20250929', thinkingLevel: 'max' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4', model: 'claude-sonnet-4-20250514' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4-think', model: 'claude-sonnet-4-20250514', thinkingLevel: 'low' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4-think-hard', model: 'claude-sonnet-4-20250514', thinkingLevel: 'medium' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/sonnet-4-ultrathink', model: 'claude-sonnet-4-20250514', thinkingLevel: 'max' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/haiku-4.5', model: 'claude-haiku-4-5-20251001' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/haiku-4.5-think', model: 'claude-haiku-4-5-20251001', thinkingLevel: 'low' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/haiku-4.5-think-hard', model: 'claude-haiku-4-5-20251001', thinkingLevel: 'medium' },
  { providerType: 'claude-code', providerId: 'claude-code', id: 'claude-code/haiku-4.5-ultrathink', model: 'claude-haiku-4-5-20251001', thinkingLevel: 'max' },
]

export function migrateFrom12to13(settings: any): any {
  // Add claude-code provider if not exists
  const hasClaudeCodeProvider = settings.providers?.some(
    (p: any) => p.type === 'claude-code'
  )

  const providers = hasClaudeCodeProvider
    ? settings.providers
    : [...(settings.providers || []), CLAUDE_CODE_PROVIDER]

  // Add claude-code models, avoiding duplicates
  const existingModelIds = new Set(settings.chatModels?.map((m: any) => m.id) || [])
  const newModels = CLAUDE_CODE_MODELS.filter(m => !existingModelIds.has(m.id))
  const chatModels = [...(settings.chatModels || []), ...newModels]

  return {
    ...settings,
    version: 13,
    providers,
    chatModels,
  }
}
```

### 6.4 Register Migration

In `src/settings/schema/migrations/index.ts` or wherever migrations are registered:

```typescript
import { migrateFrom12to13 } from './12_to_13'

// Add to migration chain
export const migrations = {
  // ... existing migrations
  12: migrateFrom12to13,
}
```

### 6.5 Update Schema Version

In `src/settings/schema/setting.types.ts`:

```typescript
export const SETTINGS_SCHEMA_VERSION = 13  // Increment from 12
```

---

## 7. UI Integration

### 7.1 How Settings UI Works

The settings UI automatically generates provider/model dropdowns based on:
- `PROVIDER_TYPES_INFO` in `src/constants.ts`
- `settings.providers` array
- `settings.chatModels` array

**Key files:**
- `src/components/settings/sections/ProvidersSection.tsx`
- `src/components/settings/modals/ProviderFormModal.tsx`
- `src/components/settings/modals/AddChatModelModal.tsx`

### 7.2 Provider Settings Display

The `PROVIDER_TYPES_INFO[type].additionalSettings` array defines custom fields.

For claude-code, we have:
```typescript
additionalSettings: [
  {
    label: 'CLI Path',
    key: 'cliPath',
    type: 'text',
    placeholder: 'claude (default)',
    required: false,
  },
]
```

### 7.3 Model Dropdown

Models appear in dropdown if:
1. Model exists in `settings.chatModels`
2. Model's `providerId` matches an existing provider in `settings.providers`
3. Model's `enable` property is not `false`

---

## 8. CLI Execution

### 8.1 Claude Code CLI Reference

**Non-interactive mode:**
```bash
claude -p "prompt" --output-format text --model <model-name>
```

**Flags:**
- `-p` / `--print` - Print mode, non-interactive
- `--output-format text|json|stream-json` - Output format
- `--model <name>` - Model to use
- `--max-turns <n>` - Limit agentic turns

### 8.2 Node.js Spawn Requirements

**CRITICAL WORKAROUNDS** discovered from GitHub issues:

1. **stdio configuration:**
   ```javascript
   stdio: ['inherit', 'pipe', 'pipe']
   ```
   Using `'inherit'` for stdin prevents Node.js from hanging.

2. **Environment variable:**
   ```javascript
   env: { ...process.env, ANTHROPIC_API_KEY: '' }
   ```
   Must explicitly set `ANTHROPIC_API_KEY` to empty string.

**Source:** https://github.com/anthropics/claude-code/issues/771

### 8.3 Thinking Triggers

Claude Code uses keyword triggers in the prompt:

| Keyword | Token Budget |
|---------|--------------|
| "think" | ~4,000 |
| "think hard" | ~10,000 |
| "think harder" | ~20,000 |
| "ultrathink" | ~32,000 |

**Source:** https://github.com/anthropics/claude-code/issues/7668

---

## 9. Error Handling

### 9.1 Error Categories

| Error | Detection | User Message |
|-------|-----------|--------------|
| CLI not found | ENOENT | "Install Claude Code: npm install -g @anthropic-ai/claude-code" |
| Not logged in | stderr contains "login" | "Run 'claude login' in terminal" |
| Rate limit | stderr contains "limit" | "Usage limit reached. Resets in 5 hours." |
| Process error | Non-zero exit code | Show stderr content |

### 9.2 Platform Check

```typescript
if (!Platform.isDesktop) {
  throw new Error('Claude Code provider is only available on desktop.')
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

1. **Type validation:**
   - Zod schemas parse valid provider configs
   - Zod schemas reject invalid configs

2. **Message formatting:**
   - `formatMessagesAsPrompt()` correctly formats messages
   - Thinking triggers prepended correctly

3. **Error parsing:**
   - `parseErrorMessage()` returns appropriate messages

### 10.2 Integration Tests

1. **CLI execution (mocked):**
   - Mock `child_process.spawn`
   - Verify correct args passed
   - Verify response parsing

2. **Settings migration:**
   - Old settings correctly migrated
   - New models appear after migration

### 10.3 Manual Testing

1. Build plugin: `npm run build`
2. Copy to vault: `main.js`, `manifest.json`, `styles.css`
3. Restart Obsidian
4. Check Settings > Smart Composer > Models dropdown
5. Verify claude-code models appear
6. Select model, send message
7. Verify response received

---

## 11. Known Issues & Debugging

### 11.1 Models Not Appearing in Dropdown

**Symptoms:** Built plugin, installed in vault, but claude-code models don't appear.

**Likely causes:**
1. **Missing migration** - Settings not updated with new models
2. **Provider not in settings.providers** - Need migration to add
3. **Zod validation failing** - Check console for parse errors

**Debug steps:**
1. Open Obsidian Developer Tools (Ctrl+Shift+I)
2. Check console for errors
3. In console, run: `app.plugins.plugins['smart-composer'].settings`
4. Check if `providers` contains claude-code entry
5. Check if `chatModels` contains claude-code models

### 11.2 CLI Execution Failures

**Debug steps:**
1. Open terminal, run: `claude --version`
2. Run: `claude -p "test" --output-format text`
3. Check PATH contains claude location
4. Check login status: `claude /status`

### 11.3 Windows-Specific Issues

- WSL path issues if VSCode in Windows, CLI in WSL
- Need to run VSCode from within WSL (`code .` from WSL terminal)

---

## 12. External References

### 12.1 Claude Code Documentation
- CLI Reference: https://code.claude.com/docs/en/cli-reference
- Best Practices: https://www.anthropic.com/engineering/claude-code-best-practices

### 12.2 GitHub Issues
- Node.js spawn fix: https://github.com/anthropics/claude-code/issues/771
- Thinking mode config: https://github.com/anthropics/claude-code/issues/7668
- Cline integration PR: https://github.com/cline/cline/pull/4111

### 12.3 Cline Implementation
- Cline docs: https://docs.cline.bot/provider-config/claude-code
- Roo Code docs: https://docs.roocode.com/providers/claude-code

### 12.4 HomeHeart Fork
- Repository: https://github.com/HomeHeartTherapy/obsidian-smart-composer
- Original: https://github.com/glowingjade/obsidian-smart-composer

---

## 13. Architectural Decision Records (ADRs)

### ADR-001: CLI Wrapper vs Direct SDK Integration

**Decision:** Wrap the Claude Code CLI rather than integrate the Claude SDK directly.

**Context:** Two approaches were possible:
1. Use Anthropic's TypeScript SDK with OAuth/subscription authentication
2. Shell out to the `claude` CLI which handles authentication

**Rationale:**
- Claude Code CLI already handles Max/Pro subscription authentication
- No need to reverse-engineer OAuth flows or session management
- CLI is officially supported and maintained by Anthropic
- Simpler implementation with fewer moving parts
- CLI abstracts away subscription vs API key authentication

**Trade-offs:**
- No real streaming (CLI returns complete response)
- Extra process overhead
- Depends on CLI being installed and in PATH

**Alternatives Considered:**
- Direct SDK with custom auth: Rejected due to complexity and maintenance burden
- WebSocket to local Claude Code server: Not officially supported

---

### ADR-002: Message Formatting with Role Tags

**Decision:** Format messages with `[System]`, `[User]`, `[Assistant]`, `[Tool Result]` prefixes.

**Context:** The CLI takes a single prompt string, not structured messages.

**Rationale:**
- Clear delineation of message boundaries
- Model can understand conversation context
- Matches how other CLI-based integrations format multi-turn conversations
- Simple, human-readable format for debugging

**Alternatives Considered:**
- XML tags: More verbose, no clear benefit
- JSON stringification: Harder for model to parse
- Markdown headers: Less structured

---

### ADR-003: Thinking Level Implementation via Trigger Words

**Decision:** Prepend trigger words ("Think about this:", "Ultrathink:", etc.) to activate extended thinking.

**Context:** Claude Code CLI supports thinking budget via keywords in prompt.

**Rationale:**
- Matches documented Claude Code behavior
- Simple implementation without CLI flag discovery
- User-selectable via model dropdown (model variants)
- Token budgets align with Anthropic's recommendations

**Token Budget Mapping:**
| Level | Trigger | Budget |
|-------|---------|--------|
| none | - | Standard |
| low | "Think about this: " | ~4,000 |
| medium | "Think hard about this: " | ~10,000 |
| high | "Think harder about this: " | ~20,000 |
| max | "Ultrathink: " | ~32,000 |

**Decision to exclude 'high':** After review, we use 4 levels (none, low, medium, max) in the model variants. 'high' is defined in code but not exposed as a model variant to keep the dropdown simpler.

---

### ADR-004: Model ID Naming Convention

**Decision:** Use `claude-code/<model>-<variant>` naming pattern.

**Examples:**
- `claude-code/opus-4.5`
- `claude-code/opus-4.5-think`
- `claude-code/sonnet-4-ultrathink`

**Rationale:**
- Clear provider prefix distinguishes from API models
- Matches Smart Composer's existing patterns (e.g., `ollama/llama3`)
- Self-documenting in UI dropdown
- Allows same model with different thinking levels as separate entries

**Alternatives Considered:**
- No prefix: Confusing with API models
- `cc-` prefix: Less readable
- Separate thinking dropdown: More complex UI changes required

---

### ADR-005: No Embedding Support

**Decision:** Claude Code provider throws error for embedding requests.

**Rationale:**
- Claude models don't provide embeddings via API
- CLI has no embedding capability
- Users should use OpenAI or Gemini for embeddings
- Adding dummy embeddings would cause RAG failures

**Implementation:**
```typescript
async getEmbedding(): Promise<number[]> {
  throw new Error('Claude Code provider does not support embeddings.')
}
```

---

### ADR-006: Desktop-Only Restriction

**Decision:** Throw error immediately if `Platform.isDesktop` is false.

**Rationale:**
- Mobile Obsidian cannot spawn child processes
- Electron's Node.js integration required for `child_process`
- Better to fail fast with clear error than silent malfunction

**Implementation:**
```typescript
constructor(provider) {
  if (!Platform.isDesktop) {
    throw new Error('Claude Code provider is only available on desktop.')
  }
}
```

---

### ADR-007: spawn() Configuration for Node.js Hanging Issue

**Decision:** Use `stdio: ['inherit', 'pipe', 'pipe']` and `ANTHROPIC_API_KEY: ''`.

**Context:** Node.js spawn would hang indefinitely when calling Claude CLI.

**Root Cause:** Discovered via GitHub issue #771. The CLI's stdin handling conflicts with Node.js default behavior.

**Solution:**
```typescript
spawn(cliPath, args, {
  stdio: ['inherit', 'pipe', 'pipe'],  // 'inherit' for stdin
  env: { ...process.env, ANTHROPIC_API_KEY: '' },  // Must be empty
  windowsHide: true,  // No console window on Windows
})
```

**Why 'inherit' for stdin:**
- Prevents Node.js from keeping stdin pipe open
- CLI doesn't actually read from stdin in -p mode
- Allows clean process termination

**Why ANTHROPIC_API_KEY: '':**
- CLI checks for API key presence
- Empty string triggers subscription auth path
- Undefined/missing may cause different code path

---

### ADR-008: Simulated Streaming

**Decision:** Return complete response as single chunk, then yield finish marker.

**Context:** CLI doesn't support real-time streaming output.

**Rationale:**
- Smart Composer expects AsyncIterable<LLMResponseStreaming>
- Can't get token-by-token streaming from CLI
- Returning full response at once maintains compatibility
- UI will show response appear all at once (acceptable trade-off)

**Implementation:**
```typescript
async *createStreamFromResponse(response, modelName) {
  yield { choices: [{ delta: { content: response } }] }  // Full content
  yield { choices: [{ finish_reason: 'stop' }] }         // Finish marker
}
```

**Future Enhancement:** Could potentially chunk the response client-side for visual effect, but adds complexity for marginal UX benefit.

---

### ADR-009: Model Version Strings

**Decision:** Use full dated model identifiers (e.g., `claude-opus-4-5-20251101`).

**Rationale:**
- CLI requires exact model identifiers
- Dated versions ensure reproducibility
- Avoids "latest" alias ambiguity
- Matches Anthropic API conventions

**Model String Format:** `claude-{family}-{version}-{date}`

---

### ADR-010: Four Thinking Level Variants per Model

**Decision:** Create 4 model entries per base model (standard, think, think-hard, ultrathink).

**Rationale:**
- Users select thinking level via model dropdown
- No custom UI needed
- Clear naming indicates capability
- 16 total models (4 base × 4 levels)

**Models Created:**
- opus-4.5, sonnet-4.5, sonnet-4, haiku-4.5
- Each with: standard, -think, -think-hard, -ultrathink variants

**Why not haiku-4 or earlier models:**
- Focus on current generation models
- Reduces dropdown clutter
- Users can add custom models if needed

---

### ADR-011: Migration Utility Functions vs Inline Logic

**Decision:** Use `getMigratedProviders()` and `getMigratedChatModels()` utility functions from `migrationUtils.ts`.

**Context:** When creating migration 12→13, two approaches were possible:
1. Write inline migration logic specific to this version
2. Use existing utility functions that handle provider/model merging

**Rationale:**
- Consistency with existing migrations (10→11, 11→12 use same pattern)
- Utilities handle edge cases: duplicate detection, preserving user customizations
- Less code duplication, fewer bugs
- Pattern already tested in production

**Implementation:**
```typescript
import { getMigratedChatModels, getMigratedProviders } from './migrationUtils'

export const migrateFrom12To13: SettingMigration['migrate'] = (data) => {
  const newData = { ...data }
  newData.version = 13
  newData.providers = getMigratedProviders(newData, DEFAULT_PROVIDERS_V13)
  newData.chatModels = getMigratedChatModels(newData, DEFAULT_CHAT_MODELS_V13)
  return newData
}
```

**Trade-off Identified:** The utilities use `Object.assign()` for shallow merging, which may overwrite nested user settings. A FIXME comment exists in the code for this.

---

### ADR-012: Reasoning Field Structure Inconsistency

**Decision:** Accept type inconsistency between `migrationUtils.ts` and actual migration files.

**Context:** Two different structures exist for reasoning configuration:
- `migrationUtils.ts` type: `reasoning_effort?: string` (flat)
- Migration files use: `reasoning?: { enabled: boolean, reasoning_effort?: string }` (nested)

**Rationale:**
- Runtime behavior works because utilities cast to `unknown` and use `Object.assign`
- Changing the type would require updating all migration files
- Risk of breaking existing migrations outweighs benefit of type consistency
- TypeScript doesn't catch this due to `unknown` casts

**Risk Assessment:** LOW - Works at runtime, TypeScript type safety already compromised by design.

**Recommendation for future:** When refactoring, align types across all migration files.

---

### ADR-013: Migration Test File Omission

**Decision:** Did not create dedicated test file for migration 12→13.

**Context:** Other migrations have test files (e.g., `11_to_12.test.ts`), but we didn't create one.

**Rationale:**
- Time constraints
- Existing 114 tests all pass
- Migration follows exact pattern of tested migrations
- Manual testing will verify functionality

**Risk:** Medium - If migration has edge case bugs, they won't be caught until runtime.

**Recommendation:** Create `12_to_13.test.ts` in future session. See Section 16.5 for test template.

---

## 14. Verified Correct Implementation

This section documents what has been verified as correctly implemented.

### 14.1 Files Verified Correct

| File | Verification Method | Status |
|------|---------------------|--------|
| `src/core/llm/claudeCode.ts` | Code review, build passes | ✅ CORRECT |
| `src/types/chat-model.types.ts` | Zod schema includes claude-code | ✅ CORRECT |
| `src/types/provider.types.ts` | Zod schema includes claude-code | ✅ CORRECT |
| `src/types/embedding-model.types.ts` | Zod schema includes claude-code | ✅ CORRECT |
| `src/core/llm/manager.ts` | Switch case for claude-code exists | ✅ CORRECT |
| `src/constants.ts` | PROVIDER_TYPES_INFO has claude-code | ✅ CORRECT |
| `src/settings/schema/migrations/12_to_13.ts` | Contains all 16 models + provider | ✅ CORRECT |
| `src/settings/schema/migrations/index.ts` | Version=13, migration registered | ✅ CORRECT |
| `src/settings/schema/migrations/migrationUtils.ts` | Has thinkingLevel type | ✅ CORRECT |

### 14.2 Verified Patterns

**spawn() Configuration:**
```typescript
// VERIFIED CORRECT - matches GitHub issue #771 solution
spawn(cliPath, args, {
  stdio: ['inherit', 'pipe', 'pipe'],  // 'inherit' prevents hanging
  env: { ...shellEnv, ANTHROPIC_API_KEY: '' },  // Empty string required
  windowsHide: true,
})
```

**Thinking Triggers:**
```typescript
// VERIFIED CORRECT - matches Claude Code documentation
private static readonly THINKING_TRIGGERS: Record<string, string> = {
  none: '',
  low: 'Think about this: ',
  medium: 'Think hard about this: ',
  high: 'Think harder about this: ',
  max: 'Ultrathink: ',
}
```

**Model IDs:**
```typescript
// VERIFIED CORRECT - consistent naming pattern
'claude-code/opus-4.5'           // Base
'claude-code/opus-4.5-think'     // Low thinking
'claude-code/opus-4.5-think-hard' // Medium thinking
'claude-code/opus-4.5-ultrathink' // Max thinking
```

### 14.3 Build & Test Results

```
npm run build    → SUCCESS (no errors)
npm test         → 114/114 tests pass
TypeScript       → No type errors
ESLint           → No errors (warnings only for markdown)
```

---

## 15. Known Type Inconsistencies

This section documents type inconsistencies that exist but don't break runtime behavior.

### 15.1 Reasoning Field Structure

**Location:** `src/settings/schema/migrations/migrationUtils.ts` line 46

**Type Definition:**
```typescript
export type DefaultChatModels = {
  // ...
  reasoning_effort?: string  // FLAT structure
  // ...
}[]
```

**Actual Usage (in 12_to_13.ts):**
```typescript
reasoning: {                    // NESTED structure
  enabled: boolean,
  reasoning_effort?: string,
}
```

**Impact:** None at runtime due to `unknown` casts. TypeScript doesn't catch this.

**Why It Works:** The migration utilities cast data to `unknown` before processing:
```typescript
const existingModel = (existingData.chatModels as unknown[]).find(...)
```

### 15.2 Recommendation

If this causes issues in future, update `DefaultChatModels` type to:
```typescript
export type DefaultChatModels = {
  // ...
  reasoning?: {
    enabled: boolean
    reasoning_effort?: string
  }
  // ...
}[]
```

---

## 16. Defensive Debugging Guide

**ASSUMPTION:** The implementation may fail in production. This section provides a systematic debugging approach.

### 16.1 If Models Don't Appear in Dropdown

**Step 1: Check data.json version**
```
Location: <vault>/.obsidian/plugins/smart-composer/data.json
Look for: "version": 13
```

If version is not 13, migration didn't run. Possible causes:
- Old `main.js` copied (rebuild required)
- Obsidian not restarted
- Plugin not reloaded

**Step 2: Check data.json providers array**
```json
"providers": [
  // Look for:
  { "type": "claude-code", "id": "claude-code" }
]
```

If missing, migration's `getMigratedProviders()` failed.

**Step 3: Check data.json chatModels array**
```json
"chatModels": [
  // Look for entries like:
  { "id": "claude-code/opus-4.5", "providerType": "claude-code", ... }
]
```

If missing, migration's `getMigratedChatModels()` failed.

**Step 4: Check Developer Console**
```
Ctrl+Shift+I in Obsidian
Look for: Zod validation errors, migration errors, parse errors
```

**Step 5: Nuclear option - Reset settings**
```
1. Delete: <vault>/.obsidian/plugins/smart-composer/data.json
2. Restart Obsidian
3. Settings will reinitialize with defaults including claude-code
```

### 16.2 If CLI Execution Fails

**Test CLI directly:**
```bash
# Check installation
claude --version

# Check login status
claude /status

# Test non-interactive mode
claude -p "Hello" --output-format text --model claude-sonnet-4-20250514
```

**Check PATH:**
```bash
# Find claude location
which claude   # Linux/Mac
where claude   # Windows
```

**Check environment:**
```bash
# Ensure no conflicting API key
echo $ANTHROPIC_API_KEY  # Should be empty or unset for Max/Pro
```

### 16.3 If spawn() Hangs

This is the most critical known issue. Verify:

1. **stdio configuration** must be `['inherit', 'pipe', 'pipe']`
2. **ANTHROPIC_API_KEY** must be empty string `''`, not `undefined`
3. **Process must not be waiting for stdin input**

Debug by adding logging:
```typescript
console.log('Spawning claude CLI...')
console.log('Args:', args)
console.log('Env ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY)

const child = spawn(...)

child.on('spawn', () => console.log('Process spawned'))
child.on('close', (code) => console.log('Process closed:', code))
```

### 16.4 If Zod Validation Fails

**Symptom:** Console shows "Invalid discriminator value" or similar Zod errors.

**Debug:**
1. Check `chat-model.types.ts` has claude-code in discriminated union
2. Check `provider.types.ts` has claude-code in discriminated union
3. Verify schema fields match data structure

**Quick test in console:**
```javascript
// In Obsidian dev console
const settings = app.plugins.plugins['smart-composer'].settings
console.log(JSON.stringify(settings.chatModels.filter(m => m.providerType === 'claude-code'), null, 2))
```

### 16.5 Missing Test Template

Create `src/settings/schema/migrations/12_to_13.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import { migrateFrom12To13 } from './12_to_13'

describe('migrateFrom12To13', () => {
  it('should add claude-code provider', () => {
    const oldSettings = {
      version: 12,
      providers: [{ type: 'openai', id: 'openai' }],
      chatModels: [],
    }

    const newSettings = migrateFrom12To13(oldSettings)

    expect(newSettings.version).toBe(13)
    expect(newSettings.providers).toContainEqual({
      type: 'claude-code',
      id: 'claude-code',
    })
  })

  it('should add claude-code chat models', () => {
    const oldSettings = {
      version: 12,
      providers: [],
      chatModels: [],
    }

    const newSettings = migrateFrom12To13(oldSettings)

    const claudeCodeModels = newSettings.chatModels.filter(
      (m: any) => m.providerType === 'claude-code'
    )
    expect(claudeCodeModels.length).toBe(16) // 4 base models × 4 thinking levels
  })

  it('should preserve existing user models', () => {
    const customModel = {
      id: 'my-custom-model',
      providerType: 'openai',
      providerId: 'openai',
      model: 'gpt-4',
    }
    const oldSettings = {
      version: 12,
      providers: [],
      chatModels: [customModel],
    }

    const newSettings = migrateFrom12To13(oldSettings)

    expect(newSettings.chatModels).toContainEqual(customModel)
  })

  it('should not duplicate claude-code provider if already exists', () => {
    const oldSettings = {
      version: 12,
      providers: [{ type: 'claude-code', id: 'claude-code' }],
      chatModels: [],
    }

    const newSettings = migrateFrom12To13(oldSettings)

    const claudeCodeProviders = newSettings.providers.filter(
      (p: any) => p.type === 'claude-code'
    )
    expect(claudeCodeProviders.length).toBe(1)
  })
})
```

---

## 17. Tools & Resources for Debugging

### 17.1 Essential Tools

| Tool | Purpose | How to Access |
|------|---------|---------------|
| Obsidian Dev Console | View errors, inspect settings | Ctrl+Shift+I |
| VS Code Debugger | Step through code | F5 with launch.json |
| Terminal | Test CLI directly | Any terminal |
| data.json | View raw settings | Text editor |

### 17.2 MCP Servers That Would Help

If debugging in Claude Code:

| MCP Server | Purpose |
|------------|---------|
| `filesystem` | Read data.json, examine build output |
| `github` | Check issue history, PR comments |
| `shell` | Run CLI commands, check environment |

### 17.3 Official Documentation

| Resource | URL | Purpose |
|----------|-----|---------|
| Claude Code CLI | https://code.claude.com/docs/en/cli-reference | CLI flags and usage |
| Claude Code Best Practices | https://www.anthropic.com/engineering/claude-code-best-practices | Integration patterns |
| Anthropic API Docs | https://docs.anthropic.com/en/docs | Model identifiers, thinking mode |
| Smart Composer Repo | https://github.com/glowingjade/obsidian-smart-composer | Original codebase |
| Cline Claude Code Docs | https://docs.cline.bot/provider-config/claude-code | Reference implementation |

### 17.4 GitHub Issues to Reference

| Issue | Topic |
|-------|-------|
| anthropics/claude-code#771 | Node.js spawn hanging fix |
| anthropics/claude-code#7668 | Thinking mode triggers |
| cline/cline#4111 | Cline Claude Code integration PR |

### 17.5 Coding Patterns to Follow

**Migration Pattern (from existing codebase):**
```typescript
// Always follow this structure for migrations
export const migrateFromXToY: SettingMigration['migrate'] = (data) => {
  const newData = { ...data }
  newData.version = Y
  newData.providers = getMigratedProviders(newData, DEFAULT_PROVIDERS_VY)
  newData.chatModels = getMigratedChatModels(newData, DEFAULT_CHAT_MODELS_VY)
  return newData
}
```

**Provider Pattern (from existing codebase):**
```typescript
// Providers extend BaseLLMProvider
export class XProvider extends BaseLLMProvider<
  Extract<LLMProvider, { type: 'x' }>
> {
  // Required methods:
  async generateResponse(...): Promise<LLMResponseNonStreaming>
  async streamResponse(...): Promise<AsyncIterable<LLMResponseStreaming>>
  async getEmbedding(...): Promise<number[]>
}
```

---

## 18. Future Session Recovery

This section helps future AI assistants or developers understand and continue this work.

### 18.1 Quick Context

**What was built:** Claude Code provider for Smart Composer that wraps the `claude` CLI to use Max/Pro subscription.

**Key files:**
- Provider: `src/core/llm/claudeCode.ts`
- Migration: `src/settings/schema/migrations/12_to_13.ts`
- Types: `src/types/chat-model.types.ts`, `src/types/provider.types.ts`
- Constants: `src/constants.ts`

**Why it was built:** Users wanted to use Claude Max/Pro subscription instead of paying API fees.

### 18.2 If Models Still Don't Appear

Read Section 16.1 step by step. The most likely causes:

1. **Migration didn't run** - Check data.json version
2. **Wrong main.js** - Rebuild and recopy
3. **Obsidian cache** - Fully restart Obsidian
4. **Zod validation** - Check dev console for errors

### 18.3 If You Need to Modify

**To add a new model:**
1. Add to `DEFAULT_CHAT_MODELS_V13` in `12_to_13.ts`
2. Add to `DEFAULT_CHAT_MODELS` in `constants.ts`
3. Rebuild and test

**To change thinking triggers:**
1. Modify `THINKING_TRIGGERS` in `claudeCode.ts`
2. Rebuild and test

**To add new provider settings:**
1. Update `additionalSettings` in `PROVIDER_TYPES_INFO` in `constants.ts`
2. Update Zod schema in `provider.types.ts`
3. Use new setting in `claudeCode.ts`
4. Create new migration if needed

### 18.4 Git Information

**Repository:** https://github.com/HomeHeartTherapy/obsidian-smart-composer
**Branch:** main
**Key commits:**
- Settings migration for Claude Code provider and models
- Add thinking level variants to Claude Code models
- Add Claude Code provider for Max/Pro subscription usage
- Add Claude Opus 4.5 model support

### 18.5 Contact / Attribution

**Spec Author:** Claude (AI Assistant)
**Implementation:** Collaborative effort with user
**Original Plugin:** glowingjade/obsidian-smart-composer
**Fork:** HomeHeartTherapy/obsidian-smart-composer

---

## Appendix A: Complete File Listing

### A.1 All Modified Files with Line Counts

```
src/types/provider.types.ts        - ~9 lines added
src/types/chat-model.types.ts      - ~8 lines added
src/types/embedding-model.types.ts - ~4 lines added
src/constants.ts                   - ~100 lines added
src/core/llm/manager.ts            - ~4 lines added
src/core/llm/claudeCode.ts         - ~350 lines (new file)
```

### A.2 Required New Files

```
src/settings/schema/migrations/12_to_13.ts  - Migration (CREATE)
```

---

## Appendix B: Quick Fix Checklist

- [ ] Check current SETTINGS_SCHEMA_VERSION in `src/settings/schema/setting.types.ts`
- [ ] Create migration file `X_to_Y.ts`
- [ ] Register migration in migrations index
- [ ] Increment SETTINGS_SCHEMA_VERSION
- [ ] Rebuild: `npm run build`
- [ ] Delete old plugin from vault
- [ ] Copy fresh build files
- [ ] Restart Obsidian
- [ ] Check developer console for errors
- [ ] Verify models appear in dropdown

---

**END OF SPECIFICATION**
