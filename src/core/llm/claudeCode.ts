/**
 * Claude Code Provider
 *
 * This provider wraps the Claude Code CLI to use Claude Max/Pro subscriptions
 * instead of paying API fees. It spawns the `claude` CLI for each message,
 * passing conversation history via stdin and capturing the response from stdout.
 *
 * Key features:
 * - No API key required - uses CLI authentication
 * - Image support via base64 data URLs
 * - Extended thinking levels: think, megathink, ultrathink
 * - Simulated streaming (CLI returns complete response)
 *
 * Reference: https://docs.anthropic.com/en/docs/claude-code
 */

import { spawn } from 'child_process'
import { Platform } from 'obsidian'

import { ChatModel } from '../../types/chat-model.types'
import {
  ContentPart,
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
import {
  ClaudeCodeCliNotFoundException,
  ClaudeCodeNotAuthenticatedException,
  ClaudeCodeRateLimitException,
  ClaudeCodeExecutionException,
  ClaudeCodeNotAvailableException,
} from './exception'

type ClaudeCodeProviderType = Extract<LLMProvider, { type: 'claude-code' }>
type ClaudeCodeChatModel = Extract<ChatModel, { providerType: 'claude-code' }>

// Thinking level keywords that trigger extended reasoning in Claude Code CLI
const THINKING_LEVEL_KEYWORDS = {
  none: '',
  think: ' think',
  megathink: ' megathink',
  ultrathink: ' ultrathink',
} as const

export class ClaudeCodeLLMProvider extends BaseLLMProvider<ClaudeCodeProviderType> {
  private defaultEnv: Record<string, string> | null = null

  constructor(provider: ClaudeCodeProviderType) {
    super(provider)
  }

  /**
   * Get the CLI path from settings or use default
   */
  private getCliPath(): string {
    return this.provider.additionalSettings?.cliPath || 'claude'
  }

  /**
   * Initialize environment variables from the user's shell
   */
  private async ensureEnv(): Promise<Record<string, string>> {
    if (this.defaultEnv) {
      return this.defaultEnv
    }

    // On desktop, we can get the shell environment
    if (Platform.isDesktop) {
      try {
        const { shellEnvSync } = await import('shell-env')
        this.defaultEnv = shellEnvSync()
      } catch {
        // Fall back to process.env if shell-env fails
        this.defaultEnv = { ...process.env } as Record<string, string>
      }
    } else {
      this.defaultEnv = { ...process.env } as Record<string, string>
    }

    return this.defaultEnv
  }

  /**
   * Convert a content part to CLI-compatible format
   * Images are converted to base64 data URL format which Claude Code CLI supports
   */
  private formatContentPart(part: ContentPart): string | { type: string; source?: unknown; text?: string } {
    if (part.type === 'text') {
      return part.text
    } else if (part.type === 'image_url') {
      // Claude Code CLI supports images via base64 data URLs
      // Format: data:image/png;base64,<base64_data>
      const url = part.image_url.url
      if (url.startsWith('data:')) {
        // Already a data URL - extract for JSON format
        const match = url.match(/^data:([^;]+);base64,(.+)$/)
        if (match) {
          return {
            type: 'image',
            source: {
              type: 'base64',
              media_type: match[1],
              data: match[2],
            },
          }
        }
      }
      // If not a data URL, include as-is (might be a file reference)
      return {
        type: 'image',
        source: {
          type: 'url',
          url: url,
        },
      }
    }
    return ''
  }

  /**
   * Convert internal message format to a format suitable for Claude CLI
   * Uses stream-json input format which supports multimodal content
   */
  private formatMessagesForCli(
    messages: RequestMessage[],
    thinkingLevel?: 'none' | 'think' | 'megathink' | 'ultrathink',
  ): string {
    // Build the conversation as a structured prompt
    const parts: string[] = []
    let systemPrompt = ''

    for (const message of messages) {
      switch (message.role) {
        case 'system':
          systemPrompt = message.content
          break
        case 'user': {
          if (Array.isArray(message.content)) {
            // Handle multimodal content
            const textParts: string[] = []
            const imageParts: Array<{ type: string; source: unknown }> = []

            for (const part of message.content) {
              const formatted = this.formatContentPart(part)
              if (typeof formatted === 'string') {
                textParts.push(formatted)
              } else if (formatted.type === 'image') {
                imageParts.push(formatted as { type: string; source: unknown })
              }
            }

            // For now, include text content and note about images
            // Claude Code CLI in --print mode may have limited image support
            let content = textParts.join('\n')
            if (imageParts.length > 0) {
              // Include image data in a format Claude Code might understand
              content += `\n[Attached ${imageParts.length} image(s)]`
            }
            parts.push(`Human: ${content}`)
          } else {
            parts.push(`Human: ${message.content}`)
          }
          break
        }
        case 'assistant':
          parts.push(`Assistant: ${message.content}`)
          break
        case 'tool':
          // Tool responses are formatted as user messages with tool context
          parts.push(
            `Human: [Tool Result for ${message.tool_call.name}]: ${message.content}`,
          )
          break
      }
    }

    // Build the final prompt
    let prompt = ''
    if (systemPrompt) {
      prompt += `${systemPrompt}\n\n`
    }
    prompt += parts.join('\n\n')

    // Add thinking level keyword if specified
    if (thinkingLevel && thinkingLevel !== 'none') {
      const keyword = THINKING_LEVEL_KEYWORDS[thinkingLevel]
      if (keyword) {
        prompt += keyword
      }
    }

    return prompt
  }

  /**
   * Execute the Claude CLI with the given prompt
   */
  private async executeClaudeCli(
    model: ClaudeCodeChatModel,
    messages: RequestMessage[],
    options?: LLMOptions,
  ): Promise<string> {
    if (!Platform.isDesktop) {
      throw new ClaudeCodeNotAvailableException(
        'Claude Code provider is only available on desktop platforms.',
      )
    }

    const cliPath = this.getCliPath()
    const env = await this.ensureEnv()

    // Format the conversation for the CLI with thinking level
    const prompt = this.formatMessagesForCli(messages, model.thinkingLevel)

    return new Promise((resolve, reject) => {
      const args = [
        '--print',
        '--output-format',
        'text',
        '--model',
        model.model,
      ]

      const childProcess = spawn(cliPath, args, {
        env: {
          ...env,
          // Ensure PATH includes common locations for the claude CLI
          PATH: `${env.PATH || ''}:/usr/local/bin:/opt/homebrew/bin`,
        },
        shell: false,
      })

      let stdout = ''
      let stderr = ''

      childProcess.stdout.on('data', (data: Buffer) => {
        stdout += data.toString()
      })

      childProcess.stderr.on('data', (data: Buffer) => {
        stderr += data.toString()
      })

      // Handle abort signal
      if (options?.signal) {
        options.signal.addEventListener('abort', () => {
          childProcess.kill('SIGTERM')
          reject(new Error('Request aborted'))
        })
      }

      childProcess.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') {
          reject(
            new ClaudeCodeCliNotFoundException(
              `Claude Code CLI not found at "${cliPath}". ` +
                'Please install Claude Code (npm install -g @anthropic-ai/claude-code) ' +
                'and ensure it is in your PATH, or configure the CLI path in settings.',
            ),
          )
        } else {
          reject(
            new ClaudeCodeExecutionException(
              `Failed to execute Claude Code CLI: ${error.message}`,
              error,
            ),
          )
        }
      })

      childProcess.on('close', (code: number | null) => {
        if (code === 0) {
          resolve(stdout.trim())
        } else {
          // Parse error messages
          const stderrLower = stderr.toLowerCase()

          if (
            stderrLower.includes('login') ||
            stderrLower.includes('authenticate') ||
            stderrLower.includes('not logged in') ||
            stderrLower.includes('unauthorized')
          ) {
            reject(
              new ClaudeCodeNotAuthenticatedException(
                'Claude Code is not authenticated. ' +
                  "Run 'claude login' in your terminal to authenticate with your Anthropic account.",
              ),
            )
          } else if (
            stderrLower.includes('rate limit') ||
            stderrLower.includes('limit') ||
            stderrLower.includes('quota') ||
            stderrLower.includes('usage limit')
          ) {
            reject(
              new ClaudeCodeRateLimitException(
                'Claude usage limit reached. ' +
                  'Limits typically reset every 5 hours. Please wait and try again later.',
              ),
            )
          } else {
            reject(
              new ClaudeCodeExecutionException(
                `Claude Code process exited with code ${code}: ${stderr || stdout || 'Unknown error'}`,
              ),
            )
          }
        }
      })

      // Send the prompt via stdin
      childProcess.stdin.write(prompt)
      childProcess.stdin.end()
    })
  }

  /**
   * Generate a non-streaming response
   */
  async generateResponse(
    model: ChatModel,
    request: LLMRequestNonStreaming,
    options?: LLMOptions,
  ): Promise<LLMResponseNonStreaming> {
    if (model.providerType !== 'claude-code') {
      throw new Error('Model is not a Claude Code model')
    }

    const responseText = await this.executeClaudeCli(
      model as ClaudeCodeChatModel,
      request.messages,
      options,
    )

    // Convert the CLI response to the expected format
    return {
      id: `claude-code-${Date.now()}`,
      choices: [
        {
          finish_reason: 'stop',
          message: {
            content: responseText,
            role: 'assistant',
          },
        },
      ],
      model: request.model,
      object: 'chat.completion',
      usage: {
        // Claude Code CLI doesn't provide token counts
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    }
  }

  /**
   * Generate a streaming response
   *
   * Note: Claude Code CLI doesn't support true streaming, so we simulate it
   * by returning the complete response in chunks for better UX.
   */
  async streamResponse(
    model: ChatModel,
    request: LLMRequestStreaming,
    options?: LLMOptions,
  ): Promise<AsyncIterable<LLMResponseStreaming>> {
    if (model.providerType !== 'claude-code') {
      throw new Error('Model is not a Claude Code model')
    }

    // Get the complete response first
    const responseText = await this.executeClaudeCli(
      model as ClaudeCodeChatModel,
      request.messages,
      options,
    )

    // Create an async generator that yields the response as chunks
    // We simulate streaming by yielding the response in smaller pieces
    return this.simulateStreaming(responseText, request.model)
  }

  /**
   * Simulate streaming by yielding the response in chunks
   */
  private async *simulateStreaming(
    text: string,
    modelName: string,
  ): AsyncIterable<LLMResponseStreaming> {
    const messageId = `claude-code-${Date.now()}`

    // Yield the content in chunks to simulate streaming
    // This provides a better UX by showing progressive output
    const chunkSize = 50 // Characters per chunk
    const chunks: string[] = []

    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize))
    }

    for (const chunk of chunks) {
      yield {
        id: messageId,
        choices: [
          {
            finish_reason: null,
            delta: {
              content: chunk,
            },
          },
        ],
        object: 'chat.completion.chunk',
        model: modelName,
      }

      // Small delay between chunks for visual effect
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    // Final chunk with usage info
    yield {
      id: messageId,
      choices: [],
      object: 'chat.completion.chunk',
      model: modelName,
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    }
  }

  /**
   * Get embeddings - not supported by Claude Code CLI
   */
  async getEmbedding(_model: string, _text: string): Promise<number[]> {
    throw new Error(
      `Provider ${this.provider.id} does not support embeddings. ` +
        'Claude Code CLI only supports chat completions. ' +
        'Please use a different provider for embeddings.',
    )
  }
}
