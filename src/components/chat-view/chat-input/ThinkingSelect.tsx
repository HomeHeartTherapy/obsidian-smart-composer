import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Brain, ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useSettings } from '../../../contexts/settings-context'
import { ChatModel } from '../../../types/chat-model.types'

type ThinkingOption = {
  id: string
  label: string
  shortLabel: string
}

// Define thinking options for each provider type
const THINKING_OPTIONS: Record<string, ThinkingOption[]> = {
  anthropic: [
    { id: 'off', label: 'OFF', shortLabel: 'OFF' },
    { id: 'standard', label: 'Standard (10k)', shortLabel: '10k' },
    { id: 'high', label: 'High (20k)', shortLabel: '20k' },
    { id: 'max', label: 'Max (32k)', shortLabel: '32k' },
  ],
  'claude-code': [
    { id: 'off', label: 'OFF', shortLabel: 'OFF' },
    { id: 'low', label: 'Low (~4k)', shortLabel: 'Low' },
    { id: 'medium', label: 'Medium (~10k)', shortLabel: 'Med' },
    { id: 'high', label: 'High (~20k)', shortLabel: 'High' },
    { id: 'max', label: 'Ultrathink (~32k)', shortLabel: 'Ultra' },
  ],
  openai: [
    { id: 'off', label: 'OFF', shortLabel: 'OFF' },
    { id: 'low', label: 'Low', shortLabel: 'Low' },
    { id: 'medium', label: 'Medium', shortLabel: 'Med' },
    { id: 'high', label: 'High', shortLabel: 'High' },
  ],
}

// Map model suffixes to thinking level IDs
const MODEL_SUFFIX_TO_THINKING: Record<string, string> = {
  // Anthropic API suffixes
  '-thinking': 'standard',
  '-thinking-high': 'high',
  '-thinking-max': 'max',
  // Claude Code suffixes
  '-think': 'low',
  '-think-hard': 'medium',
  '-ultrathink': 'max',
}

// Get the base model ID (without thinking suffix)
function getBaseModelId(modelId: string): string {
  for (const suffix of Object.keys(MODEL_SUFFIX_TO_THINKING)) {
    if (modelId.endsWith(suffix)) {
      return modelId.slice(0, -suffix.length)
    }
  }
  return modelId
}

// Get current thinking level from model ID
function getThinkingLevelFromModel(model: ChatModel): string {
  // Check for Anthropic API thinking config
  if (model.providerType === 'anthropic' && 'thinking' in model && model.thinking?.enabled) {
    const budget = model.thinking.budget_tokens
    if (budget >= 32000) return 'max'
    if (budget >= 20000) return 'high'
    if (budget >= 10000) return 'standard'
  }

  // Check for Claude Code thinking level
  if (model.providerType === 'claude-code' && 'thinkingLevel' in model) {
    const level = model.thinkingLevel
    if (level === 'max') return 'max'
    if (level === 'high') return 'high'
    if (level === 'medium') return 'medium'
    if (level === 'low') return 'low'
  }

  // Check for OpenAI reasoning
  if (model.providerType === 'openai' && 'reasoning' in model && model.reasoning?.enabled) {
    const effort = model.reasoning.reasoning_effort
    if (effort === 'high') return 'high'
    if (effort === 'medium') return 'medium'
    if (effort === 'low') return 'low'
  }

  // Check model ID for suffix patterns
  for (const [suffix, level] of Object.entries(MODEL_SUFFIX_TO_THINKING)) {
    if (model.id.endsWith(suffix)) {
      return level
    }
  }

  return 'off'
}

// Find a model variant with the specified thinking level
function findModelWithThinkingLevel(
  models: ChatModel[],
  currentModel: ChatModel,
  targetLevel: string,
): ChatModel | undefined {
  const baseId = getBaseModelId(currentModel.id)
  const providerType = currentModel.providerType

  // For 'off', find the base model
  if (targetLevel === 'off') {
    return models.find(
      (m) =>
        (m.enable ?? true) &&
        m.providerType === providerType &&
        m.id === baseId,
    )
  }

  // Map target level to expected suffixes
  const suffixMap: Record<string, Record<string, string>> = {
    anthropic: {
      standard: '-thinking',
      high: '-thinking-high',
      max: '-thinking-max',
    },
    'claude-code': {
      low: '-think',
      medium: '-think-hard',
      max: '-ultrathink',
      high: '-think-hard', // high maps to think-hard for claude-code
    },
  }

  const suffixes = suffixMap[providerType]
  if (suffixes && suffixes[targetLevel]) {
    const targetId = baseId + suffixes[targetLevel]
    return models.find(
      (m) =>
        (m.enable ?? true) &&
        m.providerType === providerType &&
        m.id === targetId,
    )
  }

  return undefined
}

export function ThinkingSelect() {
  const { settings, setSettings } = useSettings()
  const [isOpen, setIsOpen] = useState(false)

  // Get current model
  const currentModel = useMemo(() => {
    return settings.chatModels.find((m) => m.id === settings.chatModelId)
  }, [settings.chatModels, settings.chatModelId])

  // Get thinking options for current provider
  const thinkingOptions = useMemo(() => {
    if (!currentModel) return []
    return THINKING_OPTIONS[currentModel.providerType] ?? []
  }, [currentModel])

  // Get current thinking level
  const currentLevel = useMemo(() => {
    if (!currentModel) return 'off'
    return getThinkingLevelFromModel(currentModel)
  }, [currentModel])

  // Get current option for display
  const currentOption = useMemo(() => {
    return thinkingOptions.find((opt) => opt.id === currentLevel) ?? thinkingOptions[0]
  }, [thinkingOptions, currentLevel])

  // Don't show for providers without thinking support
  if (thinkingOptions.length === 0 || !currentModel) {
    return null
  }

  const handleSelectLevel = (option: ThinkingOption) => {
    if (!currentModel) return

    const targetModel = findModelWithThinkingLevel(
      settings.chatModels,
      currentModel,
      option.id,
    )

    if (targetModel) {
      setSettings({
        ...settings,
        chatModelId: targetModel.id,
      })
    }
  }

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger className="smtcmp-chat-input-thinking-select">
        <Brain size={14} className="smtcmp-chat-input-thinking-select__icon" />
        <div className="smtcmp-chat-input-thinking-select__level">
          {currentOption?.shortLabel ?? 'OFF'}
        </div>
        <div className="smtcmp-chat-input-thinking-select__chevron">
          {isOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="smtcmp-popover">
          <div className="smtcmp-popover-header">Thinking Level</div>
          <ul>
            {thinkingOptions.map((option) => {
              const isAvailable = findModelWithThinkingLevel(
                settings.chatModels,
                currentModel,
                option.id,
              )
              return (
                <DropdownMenu.Item
                  key={option.id}
                  onSelect={() => handleSelectLevel(option)}
                  disabled={!isAvailable}
                  asChild
                >
                  <li
                    className={`
                      ${option.id === currentLevel ? 'smtcmp-popover-item--selected' : ''}
                      ${!isAvailable ? 'smtcmp-popover-item--disabled' : ''}
                    `}
                  >
                    {option.label}
                  </li>
                </DropdownMenu.Item>
              )
            })}
          </ul>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
