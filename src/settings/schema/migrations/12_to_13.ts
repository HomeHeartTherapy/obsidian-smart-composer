import { SettingMigration } from '../setting.types'

import { getMigratedChatModels, getMigratedProviders } from './migrationUtils'

/**
 * Migration from version 12 to version 13
 * - Add claude-code provider (for Max/Pro subscription via CLI)
 * - Add claude-opus-4.5 model to Anthropic provider
 * - Add claude-code models with thinking level variants:
 *   - opus-4.5, opus-4.5-think, opus-4.5-think-hard, opus-4.5-ultrathink
 *   - sonnet-4.5, sonnet-4.5-think, sonnet-4.5-think-hard, sonnet-4.5-ultrathink
 *   - sonnet-4, sonnet-4-think, sonnet-4-think-hard, sonnet-4-ultrathink
 *   - haiku-4.5, haiku-4.5-think, haiku-4.5-think-hard, haiku-4.5-ultrathink
 */
export const migrateFrom12To13: SettingMigration['migrate'] = (data) => {
  const newData = { ...data }
  newData.version = 13

  newData.providers = getMigratedProviders(newData, DEFAULT_PROVIDERS_V13)
  newData.chatModels = getMigratedChatModels(newData, DEFAULT_CHAT_MODELS_V13)

  return newData
}

type DefaultProvidersV13 = {
  type: string
  id: string
}[]

export const DEFAULT_PROVIDERS_V13: DefaultProvidersV13 = [
  { type: 'openai', id: 'openai' },
  { type: 'anthropic', id: 'anthropic' },
  { type: 'gemini', id: 'gemini' },
  { type: 'deepseek', id: 'deepseek' },
  { type: 'perplexity', id: 'perplexity' },
  { type: 'groq', id: 'groq' },
  { type: 'mistral', id: 'mistral' },
  { type: 'openrouter', id: 'openrouter' },
  { type: 'ollama', id: 'ollama' },
  { type: 'lm-studio', id: 'lm-studio' },
  { type: 'morph', id: 'morph' },
  { type: 'claude-code', id: 'claude-code' },
]

type DefaultChatModelsV13 = {
  id: string
  providerType: string
  providerId: string
  model: string
  reasoning?: {
    enabled: boolean
    reasoning_effort?: string
  }
  thinking?: {
    enabled: boolean
    budget_tokens: number
  }
  web_search_options?: {
    search_context_size?: string
  }
  thinkingLevel?: 'none' | 'low' | 'medium' | 'high' | 'max'
  enable?: boolean
}[]

export const DEFAULT_CHAT_MODELS_V13: DefaultChatModelsV13 = [
  // Anthropic API models
  {
    providerType: 'anthropic',
    providerId: 'anthropic',
    id: 'claude-opus-4.5',
    model: 'claude-opus-4-5-20251101',
  },
  {
    providerType: 'anthropic',
    providerId: 'anthropic',
    id: 'claude-opus-4.1',
    model: 'claude-opus-4-1',
  },
  {
    providerType: 'anthropic',
    providerId: 'anthropic',
    id: 'claude-sonnet-4.5',
    model: 'claude-sonnet-4-5',
  },
  {
    providerType: 'anthropic',
    providerId: 'anthropic',
    id: 'claude-haiku-4.5',
    model: 'claude-haiku-4-5',
  },
  // Claude Code models (uses Max/Pro subscription via CLI)
  // Opus 4.5 - with thinking level variants
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/opus-4.5',
    model: 'claude-opus-4-5-20251101',
  },
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/opus-4.5-think',
    model: 'claude-opus-4-5-20251101',
    thinkingLevel: 'low',
  },
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/opus-4.5-think-hard',
    model: 'claude-opus-4-5-20251101',
    thinkingLevel: 'medium',
  },
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/opus-4.5-ultrathink',
    model: 'claude-opus-4-5-20251101',
    thinkingLevel: 'max',
  },
  // Sonnet 4.5 - with thinking level variants
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/sonnet-4.5',
    model: 'claude-sonnet-4-5-20250929',
  },
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/sonnet-4.5-think',
    model: 'claude-sonnet-4-5-20250929',
    thinkingLevel: 'low',
  },
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/sonnet-4.5-think-hard',
    model: 'claude-sonnet-4-5-20250929',
    thinkingLevel: 'medium',
  },
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/sonnet-4.5-ultrathink',
    model: 'claude-sonnet-4-5-20250929',
    thinkingLevel: 'max',
  },
  // Sonnet 4 - with thinking level variants
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/sonnet-4',
    model: 'claude-sonnet-4-20250514',
  },
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/sonnet-4-think',
    model: 'claude-sonnet-4-20250514',
    thinkingLevel: 'low',
  },
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/sonnet-4-think-hard',
    model: 'claude-sonnet-4-20250514',
    thinkingLevel: 'medium',
  },
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/sonnet-4-ultrathink',
    model: 'claude-sonnet-4-20250514',
    thinkingLevel: 'max',
  },
  // Haiku 4.5 - with thinking level variants
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/haiku-4.5',
    model: 'claude-haiku-4-5-20251001',
  },
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/haiku-4.5-think',
    model: 'claude-haiku-4-5-20251001',
    thinkingLevel: 'low',
  },
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/haiku-4.5-think-hard',
    model: 'claude-haiku-4-5-20251001',
    thinkingLevel: 'medium',
  },
  {
    providerType: 'claude-code',
    providerId: 'claude-code',
    id: 'claude-code/haiku-4.5-ultrathink',
    model: 'claude-haiku-4-5-20251001',
    thinkingLevel: 'max',
  },
  // OpenAI models
  {
    providerType: 'openai',
    providerId: 'openai',
    id: 'gpt-5',
    model: 'gpt-5',
  },
  {
    providerType: 'openai',
    providerId: 'openai',
    id: 'gpt-5-mini',
    model: 'gpt-5-mini',
  },
  {
    providerType: 'openai',
    providerId: 'openai',
    id: 'gpt-5-nano',
    model: 'gpt-5-nano',
  },
  {
    providerType: 'openai',
    providerId: 'openai',
    id: 'gpt-4.1',
    model: 'gpt-4.1',
  },
  {
    providerType: 'openai',
    providerId: 'openai',
    id: 'gpt-4.1-mini',
    model: 'gpt-4.1-mini',
  },
  {
    providerType: 'openai',
    providerId: 'openai',
    id: 'gpt-4.1-nano',
    model: 'gpt-4.1-nano',
  },
  {
    providerType: 'openai',
    providerId: 'openai',
    id: 'gpt-4o',
    model: 'gpt-4o',
  },
  {
    providerType: 'openai',
    providerId: 'openai',
    id: 'gpt-4o-mini',
    model: 'gpt-4o-mini',
  },
  {
    providerType: 'openai',
    providerId: 'openai',
    id: 'o4-mini',
    model: 'o4-mini',
    reasoning: {
      enabled: true,
      reasoning_effort: 'medium',
    },
  },
  {
    providerType: 'openai',
    providerId: 'openai',
    id: 'o3',
    model: 'o3',
    reasoning: {
      enabled: true,
      reasoning_effort: 'medium',
    },
  },
  // Gemini models
  {
    providerType: 'gemini',
    providerId: 'gemini',
    id: 'gemini-2.5-pro',
    model: 'gemini-2.5-pro',
  },
  {
    providerType: 'gemini',
    providerId: 'gemini',
    id: 'gemini-2.5-flash',
    model: 'gemini-2.5-flash',
  },
  {
    providerType: 'gemini',
    providerId: 'gemini',
    id: 'gemini-2.5-flash-lite',
    model: 'gemini-2.5-flash-lite',
  },
  {
    providerType: 'gemini',
    providerId: 'gemini',
    id: 'gemini-2.0-flash',
    model: 'gemini-2.0-flash',
  },
  {
    providerType: 'gemini',
    providerId: 'gemini',
    id: 'gemini-2.0-flash-lite',
    model: 'gemini-2.0-flash-lite',
  },
  // DeepSeek models
  {
    providerType: 'deepseek',
    providerId: 'deepseek',
    id: 'deepseek-chat',
    model: 'deepseek-chat',
  },
  {
    providerType: 'deepseek',
    providerId: 'deepseek',
    id: 'deepseek-reasoner',
    model: 'deepseek-reasoner',
  },
  // Perplexity models
  {
    providerType: 'perplexity',
    providerId: 'perplexity',
    id: 'sonar',
    model: 'sonar',
    web_search_options: {
      search_context_size: 'low',
    },
  },
  {
    providerType: 'perplexity',
    providerId: 'perplexity',
    id: 'sonar-pro',
    model: 'sonar',
    web_search_options: {
      search_context_size: 'low',
    },
  },
  {
    providerType: 'perplexity',
    providerId: 'perplexity',
    id: 'sonar-deep-research',
    model: 'sonar-deep-research',
    web_search_options: {
      search_context_size: 'low',
    },
  },
  {
    providerType: 'perplexity',
    providerId: 'perplexity',
    id: 'sonar-reasoning',
    model: 'sonar',
    web_search_options: {
      search_context_size: 'low',
    },
  },
  {
    providerType: 'perplexity',
    providerId: 'perplexity',
    id: 'sonar-reasoning-pro',
    model: 'sonar',
    web_search_options: {
      search_context_size: 'low',
    },
  },
  // Morph models
  {
    providerType: 'morph',
    providerId: 'morph',
    id: 'morph-v0',
    model: 'morph-v0',
  },
]
