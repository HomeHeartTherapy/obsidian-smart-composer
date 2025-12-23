import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useSettings } from '../../../contexts/settings-context'

// Connection types per provider group
type ConnectionType = 'api' | 'subscription'

type ConnectionOption = {
  type: ConnectionType
  label: string
  providerType: string // maps to actual provider type in settings
}

// Define which providers support which connection types
const PROVIDER_CONNECTION_MAP: Record<string, ConnectionOption[]> = {
  Claude: [
    { type: 'api', label: 'API', providerType: 'anthropic' },
    { type: 'subscription', label: 'Subscription', providerType: 'claude-code' },
  ],
  ChatGPT: [
    { type: 'api', label: 'API', providerType: 'openai' },
    // Future: { type: 'subscription', label: 'Codex', providerType: 'openai-codex' },
  ],
  Gemini: [
    { type: 'api', label: 'API', providerType: 'gemini' },
  ],
  DeepSeek: [
    { type: 'api', label: 'API', providerType: 'deepseek' },
  ],
  Perplexity: [
    { type: 'api', label: 'API', providerType: 'perplexity' },
  ],
  Groq: [
    { type: 'api', label: 'API', providerType: 'groq' },
  ],
  Mistral: [
    { type: 'api', label: 'API', providerType: 'mistral' },
  ],
  OpenRouter: [
    { type: 'api', label: 'API', providerType: 'openrouter' },
  ],
  Ollama: [
    { type: 'api', label: 'Local', providerType: 'ollama' },
  ],
  'LM Studio': [
    { type: 'api', label: 'Local', providerType: 'lm-studio' },
  ],
  Morph: [
    { type: 'api', label: 'API', providerType: 'morph' },
  ],
}

// Get provider display name from provider type
function getProviderDisplayName(providerType: string): string {
  for (const [displayName, options] of Object.entries(PROVIDER_CONNECTION_MAP)) {
    if (options.some((opt) => opt.providerType === providerType)) {
      return displayName
    }
  }
  return providerType
}

export function ConnectionTypeSelect() {
  const { settings, setSettings } = useSettings()
  const [isOpen, setIsOpen] = useState(false)

  // Get current model's provider type
  const currentModel = useMemo(() => {
    return settings.chatModels.find((m) => m.id === settings.chatModelId)
  }, [settings.chatModels, settings.chatModelId])

  const currentProviderType = currentModel?.providerType ?? 'anthropic'

  // Get current provider display name
  const currentDisplayName = getProviderDisplayName(currentProviderType)

  // Get connection options for current provider
  const connectionOptions = useMemo(() => {
    return PROVIDER_CONNECTION_MAP[currentDisplayName] ?? []
  }, [currentDisplayName])

  // Get current connection type
  const currentConnection = useMemo(() => {
    return connectionOptions.find((opt) => opt.providerType === currentProviderType)
  }, [connectionOptions, currentProviderType])

  // Only show if there are multiple connection options
  if (connectionOptions.length <= 1) {
    return null
  }

  const handleSelectConnection = (option: ConnectionOption) => {
    // Find the first enabled model for this provider type
    const firstModel = settings.chatModels.find(
      (m) =>
        (m.enable ?? true) &&
        m.providerType === option.providerType,
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
      <DropdownMenu.Trigger className="smtcmp-chat-input-connection-select">
        <div className="smtcmp-chat-input-connection-select__name">
          {currentConnection?.label ?? 'API'}
        </div>
        <div className="smtcmp-chat-input-connection-select__icon">
          {isOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="smtcmp-popover">
          <ul>
            {connectionOptions.map((option) => (
              <DropdownMenu.Item
                key={option.type}
                onSelect={() => handleSelectConnection(option)}
                asChild
              >
                <li
                  className={
                    option.providerType === currentProviderType
                      ? 'smtcmp-popover-item--selected'
                      : ''
                  }
                >
                  {option.label}
                </li>
              </DropdownMenu.Item>
            ))}
          </ul>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
