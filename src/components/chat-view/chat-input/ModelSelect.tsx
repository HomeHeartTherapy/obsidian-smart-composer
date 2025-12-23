import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useSettings } from '../../../contexts/settings-context'
import { ChatModel } from '../../../types/chat-model.types'

// Thinking suffixes to hide from model dropdown
const THINKING_SUFFIXES = ['-think', '-think-hard', '-ultrathink', '-thinking', '-thinking-high', '-thinking-max']

// Check if a model ID is a thinking variant (should be hidden)
function isThinkingVariant(modelId: string): boolean {
  return THINKING_SUFFIXES.some((suffix) => modelId.endsWith(suffix))
}

// Get the base model ID (without thinking suffix)
function getBaseModelId(modelId: string): string {
  for (const suffix of THINKING_SUFFIXES) {
    if (modelId.endsWith(suffix)) {
      return modelId.slice(0, -suffix.length)
    }
  }
  return modelId
}

// Get display name for model (cleaner version without provider prefix for claude-code)
function getModelDisplayName(model: ChatModel): string {
  const id = model.id
  // For claude-code models, show just the model part (e.g., "opus-4.5" instead of "claude-code/opus-4.5")
  if (id.startsWith('claude-code/')) {
    return id.replace('claude-code/', '')
  }
  return id
}

export function ModelSelect() {
  const { settings, setSettings } = useSettings()
  const [isOpen, setIsOpen] = useState(false)

  // Get current model
  const currentModel = useMemo(() => {
    return settings.chatModels.find((m) => m.id === settings.chatModelId)
  }, [settings.chatModels, settings.chatModelId])

  const currentProviderType = currentModel?.providerType ?? 'anthropic'

  // Filter models: only show base models (not thinking variants) for the current provider type
  const filteredModels = useMemo(() => {
    return settings.chatModels.filter((model) => {
      // Must be enabled
      if (!(model.enable ?? true)) return false
      // Must match current provider type
      if (model.providerType !== currentProviderType) return false
      // Must NOT be a thinking variant (those are selected via ThinkingSelect)
      if (isThinkingVariant(model.id)) return false
      return true
    })
  }, [settings.chatModels, currentProviderType])

  // Get display name for current model (show base model name even if a variant is selected)
  const currentDisplayName = useMemo(() => {
    if (!currentModel) return 'Select Model'
    const baseId = getBaseModelId(currentModel.id)
    const baseModel = settings.chatModels.find((m) => m.id === baseId)
    return getModelDisplayName(baseModel ?? currentModel)
  }, [currentModel, settings.chatModels])

  const handleSelectModel = (model: ChatModel) => {
    setSettings({
      ...settings,
      chatModelId: model.id,
    })
  }

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger className="smtcmp-chat-input-model-select">
        <div className="smtcmp-chat-input-model-select__model-name">
          {currentDisplayName}
        </div>
        <div className="smtcmp-chat-input-model-select__icon">
          {isOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="smtcmp-popover">
          <ul>
            {filteredModels.map((model) => (
              <DropdownMenu.Item
                key={model.id}
                onSelect={() => handleSelectModel(model)}
                asChild
              >
                <li
                  className={
                    getBaseModelId(settings.chatModelId) === model.id
                      ? 'smtcmp-popover-item--selected'
                      : ''
                  }
                >
                  {getModelDisplayName(model)}
                </li>
              </DropdownMenu.Item>
            ))}
          </ul>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
