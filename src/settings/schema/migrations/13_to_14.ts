import { SettingMigration } from '../setting.types'

import { getMigratedChatModels } from './migrationUtils'

/**
 * Migration from version 13 to version 14
 * - Add Anthropic API models with Extended Thinking enabled:
 *   - claude-opus-4.5-thinking (10k budget)
 *   - claude-opus-4.5-thinking-high (20k budget)
 *   - claude-opus-4.5-thinking-max (32k budget)
 *   - claude-sonnet-4.5-thinking (10k budget)
 *   - claude-sonnet-4.5-thinking-high (20k budget)
 *   - claude-sonnet-4.5-thinking-max (32k budget)
 *   - claude-haiku-4.5-thinking (10k budget)
 *   - claude-haiku-4.5-thinking-high (20k budget)
 *   - claude-haiku-4.5-thinking-max (32k budget)
 */
export const migrateFrom13To14: SettingMigration['migrate'] = (data) => {
  const newData = { ...data }
  newData.version = 14

  newData.chatModels = getMigratedChatModels(newData, DEFAULT_CHAT_MODELS_V14)

  return newData
}

type DefaultChatModelsV14 = {
  id: string
  providerType: string
  providerId: string
  model: string
  thinking?: {
    enabled: boolean
    budget_tokens: number
  }
}[]

export const DEFAULT_CHAT_MODELS_V14: DefaultChatModelsV14 = [
  // Anthropic API models with Extended Thinking enabled
  // Opus 4.5 thinking variants
  {
    providerType: 'anthropic',
    providerId: 'anthropic',
    id: 'claude-opus-4.5-thinking',
    model: 'claude-opus-4-5-20251101',
    thinking: {
      enabled: true,
      budget_tokens: 10000,
    },
  },
  {
    providerType: 'anthropic',
    providerId: 'anthropic',
    id: 'claude-opus-4.5-thinking-high',
    model: 'claude-opus-4-5-20251101',
    thinking: {
      enabled: true,
      budget_tokens: 20000,
    },
  },
  {
    providerType: 'anthropic',
    providerId: 'anthropic',
    id: 'claude-opus-4.5-thinking-max',
    model: 'claude-opus-4-5-20251101',
    thinking: {
      enabled: true,
      budget_tokens: 32000,
    },
  },
  // Sonnet 4.5 thinking variants
  {
    providerType: 'anthropic',
    providerId: 'anthropic',
    id: 'claude-sonnet-4.5-thinking',
    model: 'claude-sonnet-4-5',
    thinking: {
      enabled: true,
      budget_tokens: 10000,
    },
  },
  {
    providerType: 'anthropic',
    providerId: 'anthropic',
    id: 'claude-sonnet-4.5-thinking-high',
    model: 'claude-sonnet-4-5',
    thinking: {
      enabled: true,
      budget_tokens: 20000,
    },
  },
  {
    providerType: 'anthropic',
    providerId: 'anthropic',
    id: 'claude-sonnet-4.5-thinking-max',
    model: 'claude-sonnet-4-5',
    thinking: {
      enabled: true,
      budget_tokens: 32000,
    },
  },
  // Haiku 4.5 thinking variants
  {
    providerType: 'anthropic',
    providerId: 'anthropic',
    id: 'claude-haiku-4.5-thinking',
    model: 'claude-haiku-4-5',
    thinking: {
      enabled: true,
      budget_tokens: 10000,
    },
  },
  {
    providerType: 'anthropic',
    providerId: 'anthropic',
    id: 'claude-haiku-4.5-thinking-high',
    model: 'claude-haiku-4-5',
    thinking: {
      enabled: true,
      budget_tokens: 20000,
    },
  },
  {
    providerType: 'anthropic',
    providerId: 'anthropic',
    id: 'claude-haiku-4.5-thinking-max',
    model: 'claude-haiku-4-5',
    thinking: {
      enabled: true,
      budget_tokens: 32000,
    },
  },
]
