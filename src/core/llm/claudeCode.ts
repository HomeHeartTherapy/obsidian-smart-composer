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

/**
 * Claude Code Provider
 *
 * Uses the Claude Code CLI to make requests using your Max/Pro subscription.
 * No API key required - uses your authenticated Claude Code session.
 *
 * Prerequisites:
 * 1. Install Claude Code: npm install -g @anthropic-ai/claude-code
 * 2. Login: claude login
 * 3. Verify: claude --version
 *
 * Known limitations:
 * - Desktop only (requires Node.js child_process)
 * - No real streaming (returns complete response)
 * - No image support through CLI
 * - No prompt caching
 */
export class ClaudeCodeProvider extends BaseLLMProvider<
  Extract<LLMProvider, { type: 'claude-code' }>
> {
  private static readonly DEFAULT_CLI_PATH = 'claude'

  constructor(provider: Extract<LLMProvider, { type: 'claude-code' }>) {
    super(provider)

    if (!Platform.isDesktop) {
      throw new Error(
        'Claude Code provider is only available on desktop. Mobile devices do not support CLI execution.',
      )
    }
  }

  private getCliPath(): string {
    return (
      this.provider.additionalSettings?.cliPath ||
      ClaudeCodeProvider.DEFAULT_CLI_PATH
    )
  }

  /**
   * Thinking level trigger words for Claude Code
   * These keywords activate different thinking budgets in Claude Code CLI
   */
  private static readonly THINKING_TRIGGERS: Record<string, string> = {
    none: '', // No trigger, normal mode
    low: 'Think about this: ', // ~4,000 tokens
    medium: 'Think hard about this: ', // ~10,000 tokens
    high: 'Think harder about this: ', // ~20,000 tokens
    max: 'Ultrathink: ', // ~31,999 tokens (maximum)
  }

  /**
   * Convert request messages to a single prompt string for the CLI
   */
  private static formatMessagesAsPrompt(
    messages: RequestMessage[],
    thinkingLevel?: string,
  ): string {
    const parts: string[] = []

    // Add thinking trigger if specified
    const trigger =
      ClaudeCodeProvider.THINKING_TRIGGERS[thinkingLevel || 'none'] || ''

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
          parts.push(
            `[Tool Result: ${message.tool_call.name}]\n${message.content}\n`,
          )
          break
      }
    }

    // Prepend thinking trigger to the prompt
    const basePrompt = parts.join('\n')
    return trigger ? `${trigger}${basePrompt}` : basePrompt
  }

  /**
   * Execute the Claude CLI and return the response
   */
  private async executeClaudeCli(
    prompt: string,
    modelName: string,
    signal?: AbortSignal,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const cliPath = this.getCliPath()
      const args = [
        '-p', // print mode (non-interactive)
        '--output-format',
        'text',
        '--model',
        modelName,
        prompt,
      ]

      // Get shell environment for proper PATH resolution
      const shellEnv = this.getShellEnv()

      const child = spawn(cliPath, args, {
        // Critical: Use 'inherit' for stdin to avoid Node.js hanging issue
        // See: https://github.com/anthropics/claude-code/issues/771
        stdio: ['inherit', 'pipe', 'pipe'],
        env: {
          ...shellEnv,
          // Critical: Set ANTHROPIC_API_KEY to empty string
          // Without this, Node.js spawn hangs indefinitely
          ANTHROPIC_API_KEY: '',
        },
        // Don't create a console window on Windows
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

      // Handle abort signal
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
          // Parse error messages
          const errorMessage = this.parseErrorMessage(stderr, code)
          reject(new Error(errorMessage))
        }
      })

      child.on('error', (error) => {
        if (error.message.includes('ENOENT')) {
          reject(
            new Error(
              `Claude Code CLI not found at "${cliPath}". ` +
                'Please install it with: npm install -g @anthropic-ai/claude-code\n' +
                'Then login with: claude login',
            ),
          )
        } else {
          reject(new Error(`Failed to execute Claude Code CLI: ${error.message}`))
        }
      })
    })
  }

  /**
   * Get shell environment variables for proper PATH resolution
   */
  private getShellEnv(): Record<string, string> {
    // Start with current process environment
    const env: Record<string, string> = {}
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        env[key] = value
      }
    }
    return env
  }

  /**
   * Parse CLI error messages into user-friendly messages
   */
  private parseErrorMessage(stderr: string, exitCode: number | null): string {
    const lowerStderr = stderr.toLowerCase()

    // Check for common error patterns
    if (
      lowerStderr.includes('login') ||
      lowerStderr.includes('authenticate') ||
      lowerStderr.includes('not logged in')
    ) {
      return (
        'Claude Code is not logged in. ' +
        "Please run 'claude login' in your terminal to authenticate."
      )
    }

    if (
      lowerStderr.includes('limit') ||
      lowerStderr.includes('rate') ||
      lowerStderr.includes('quota')
    ) {
      return (
        'Claude Code usage limit reached. ' +
        'Limits reset every 5 hours for Max/Pro subscriptions.'
      )
    }

    if (
      lowerStderr.includes('not found') ||
      lowerStderr.includes('enoent') ||
      lowerStderr.includes('command not found')
    ) {
      return (
        'Claude Code CLI not found. ' +
        'Please install it with: npm install -g @anthropic-ai/claude-code'
      )
    }

    if (
      lowerStderr.includes('permission') ||
      lowerStderr.includes('access denied')
    ) {
      return (
        'Permission denied when running Claude Code CLI. ' +
        'Please check file permissions or run from an allowed directory.'
      )
    }

    // Default error message
    if (stderr.trim()) {
      return `Claude Code error (exit code ${exitCode}): ${stderr.trim()}`
    }

    return `Claude Code CLI exited with code ${exitCode}`
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
    const response = await this.executeClaudeCli(
      prompt,
      request.model,
      options?.signal,
    )

    // Return in the standard response format
    return {
      id: `claude-code-${Date.now()}`,
      choices: [
        {
          finish_reason: 'stop',
          message: {
            content: response,
            role: 'assistant',
          },
        },
      ],
      model: request.model,
      object: 'chat.completion',
      usage: {
        // Usage stats not available from CLI
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
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

    // Claude Code CLI doesn't support true streaming
    // We get the complete response and yield it as a single chunk
    const thinkingLevel = model.thinkingLevel
    const prompt = ClaudeCodeProvider.formatMessagesAsPrompt(
      request.messages,
      thinkingLevel,
    )
    const response = await this.executeClaudeCli(
      prompt,
      request.model,
      options?.signal,
    )

    // Return an async generator that yields the complete response
    return this.createStreamFromResponse(response, request.model)
  }

  private async *createStreamFromResponse(
    response: string,
    modelName: string,
  ): AsyncIterable<LLMResponseStreaming> {
    const messageId = `claude-code-${Date.now()}`

    // Yield the complete response as a single chunk
    yield {
      id: messageId,
      choices: [
        {
          finish_reason: null,
          delta: {
            content: response,
            role: 'assistant',
          },
        },
      ],
      object: 'chat.completion.chunk',
      model: modelName,
    }

    // Yield final chunk with finish reason
    yield {
      id: messageId,
      choices: [
        {
          finish_reason: 'stop',
          delta: {},
        },
      ],
      object: 'chat.completion.chunk',
      model: modelName,
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    }
  }

  async getEmbedding(_model: string, _text: string): Promise<number[]> {
    throw new Error(
      'Claude Code provider does not support embeddings. ' +
        'Please use a different provider for embedding generation.',
    )
  }
}
