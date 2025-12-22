import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useSettings } from '../../../contexts/settings-context'
import { LLMProviderType } from '../../../types/provider.types'

// Provider display names (product names, not company names)
const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  anthropic: 'Claude',
  'claude-code': 'Claude',
  openai: 'ChatGPT',
  gemini: 'Gemini',
  deepseek: 'DeepSeek',
  perplexity: 'Perplexity',
  groq: 'Groq',
  mistral: 'Mistral',
  openrouter: 'OpenRouter',
  ollama: 'Ollama',
  'lm-studio': 'LM Studio',
  morph: 'Morph',
  'azure-openai': 'Azure OpenAI',
  'openai-compatible': 'OpenAI Compatible',
}

// Group providers by product (Claude has both API and Subscription)
type ProviderGroup = {
  displayName: string
  providerTypes: LLMProviderType[]
}

const PROVIDER_GROUPS: ProviderGroup[] = [
  { displayName: 'Claude', providerTypes: ['anthropic', 'claude-code'] },
  { displayName: 'ChatGPT', providerTypes: ['openai'] },
  { displayName: 'Gemini', providerTypes: ['gemini'] },
  { displayName: 'DeepSeek', providerTypes: ['deepseek'] },
  { displayName: 'Perplexity', providerTypes: ['perplexity'] },
  { displayName: 'Groq', providerTypes: ['groq'] },
  { displayName: 'Mistral', providerTypes: ['mistral'] },
  { displayName: 'OpenRouter', providerTypes: ['openrouter'] },
  { displayName: 'Ollama', providerTypes: ['ollama'] },
  { displayName: 'LM Studio', providerTypes: ['lm-studio'] },
  { displayName: 'Morph', providerTypes: ['morph'] },
]

export function ProviderSelect() {
  const { settings, setSettings } = useSettings()
  const [isOpen, setIsOpen] = useState(false)

  // Get current model's provider type
  const currentModel = useMemo(() => {
    return settings.chatModels.find((m) => m.id === settings.chatModelId)
  }, [settings.chatModels, settings.chatModelId])

  const currentProviderType = currentModel?.providerType ?? 'anthropic'

  // Get display name for current provider
  const currentDisplayName = useMemo(() => {
    const group = PROVIDER_GROUPS.find((g) =>
      g.providerTypes.includes(currentProviderType),
    )
    return group?.displayName ?? PROVIDER_DISPLAY_NAMES[currentProviderType] ?? currentProviderType
  }, [currentProviderType])

  // Get available provider groups (only those with enabled models)
  const availableGroups = useMemo(() => {
    const enabledProviderTypes = new Set(
      settings.chatModels
        .filter(({ enable }) => enable ?? true)
        .map((m) => m.providerType),
    )

    return PROVIDER_GROUPS.filter((group) =>
      group.providerTypes.some((pt) => enabledProviderTypes.has(pt)),
    )
  }, [settings.chatModels])

  const handleSelectProvider = (group: ProviderGroup) => {
    // Find the first enabled model for this provider group
    const firstModel = settings.chatModels.find(
      (m) =>
        (m.enable ?? true) &&
        group.providerTypes.includes(m.providerType),
    )

    if (firstModel) {
      setSettings({
        ...settings,
        chatModelId: firstModel.id,
      })
    }
  }

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger className="smtcmp-chat-input-provider-select">
        <div className="smtcmp-chat-input-provider-select__name">
          {currentDisplayName}
        </div>
        <div className="smtcmp-chat-input-provider-select__icon">
          {isOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="smtcmp-popover">
          <ul>
            {availableGroups.map((group) => (
              <DropdownMenu.Item
                key={group.displayName}
                onSelect={() => handleSelectProvider(group)}
                asChild
              >
                <li
                  className={
                    group.displayName === currentDisplayName
                      ? 'smtcmp-popover-item--selected'
                      : ''
                  }
                >
                  {group.displayName}
                </li>
              </DropdownMenu.Item>
            ))}
          </ul>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
