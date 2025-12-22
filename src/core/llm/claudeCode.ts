import { spawn } from 'child_process'
import * as path from 'path'
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

  /**
   * Cached CLI path after auto-detection
   */
  private cachedCliPath: string | null = null

  /**
   * Expand Windows environment variables like %USERPROFILE%
   */
  private expandEnvVars(str: string): string {
    return str.replace(/%([^%]+)%/g, (_, varName) => {
      return process.env[varName] || `%${varName}%`
    })
  }

  /**
   * List of possible CLI paths to try (populated on first call)
   */
  private possibleCliPaths: string[] | null = null
  private currentPathIndex: number = 0

  /**
   * Get the CLI path, auto-detecting if not explicitly configured.
   * Uses a simple approach that works reliably in Electron.
   */
  private getCliPath(): string {
    // Return cached path if already resolved
    if (this.cachedCliPath) {
      return this.cachedCliPath
    }

    // If user explicitly set a path, use it (with env var expansion)
    const configuredPath = this.provider.additionalSettings?.cliPath
    if (configuredPath && configuredPath.trim() !== '') {
      this.cachedCliPath = this.expandEnvVars(configuredPath)
      console.log(`[Claude Code] Using configured path: ${this.cachedCliPath}`)
      return this.cachedCliPath
    }

    // Build list of possible paths if not already done
    if (!this.possibleCliPaths) {
      this.possibleCliPaths = this.buildPossiblePaths()
    }

    // Return current path to try
    const currentPath = this.possibleCliPaths[this.currentPathIndex]
    console.log(`[Claude Code] Trying path [${this.currentPathIndex + 1}/${this.possibleCliPaths.length}]: ${currentPath}`)
    return currentPath
  }

  /**
   * Called when CLI execution fails - try the next path
   */
  private tryNextPath(): boolean {
    if (!this.possibleCliPaths) return false

    this.currentPathIndex++
    if (this.currentPathIndex < this.possibleCliPaths.length) {
      console.log(`[Claude Code] Path failed, trying next...`)
      return true
    }
    return false
  }

  /**
   * Called when CLI execution succeeds - cache the working path
   */
  private cacheWorkingPath(): void {
    if (this.possibleCliPaths && this.currentPathIndex < this.possibleCliPaths.length) {
      this.cachedCliPath = this.possibleCliPaths[this.currentPathIndex]
      console.log(`[Claude Code] Caching working path: ${this.cachedCliPath}`)
    }
  }

  /**
   * Build list of possible CLI paths based on platform
   */
  private buildPossiblePaths(): string[] {
    const userProfile = process.env.USERPROFILE || process.env.HOME || ''

    if (process.platform === 'win32') {
      return [
        // Standard npm global (with admin)
        path.join(userProfile, 'AppData', 'Roaming', 'npm', 'claude.cmd'),
        // Common non-admin npm prefix locations
        path.join(userProfile, 'npm', 'claude.cmd'),
        path.join(userProfile, '.npm-global', 'claude.cmd'),
        path.join(userProfile, 'AppData', 'Local', 'npm', 'claude.cmd'),
        // Direct in user profile (some custom setups)
        path.join(userProfile, 'claude.cmd'),
        path.join(userProfile, 'bin', 'claude.cmd'),
        // Fallback to just 'claude' hoping it's in PATH
        'claude',
      ]
    } else {
      return [
        '/usr/local/bin/claude',
        '/usr/bin/claude',
        path.join(userProfile, '.npm-global', 'bin', 'claude'),
        path.join(userProfile, '.local', 'bin', 'claude'),
        'claude',
      ]
    }
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
      // Don't pass prompt as arg - Windows has ~8191 char limit
      // Instead, we'll pipe it via stdin
      const args = [
        '-p', // print mode (non-interactive)
        '--output-format',
        'text',
        '--model',
        modelName,
        '-', // Read prompt from stdin
      ]

      // Get shell environment for proper PATH resolution
      const shellEnv = this.getShellEnv()

      const child = spawn(cliPath, args, {
        // Use 'pipe' for stdin so we can write the prompt
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...shellEnv,
          // Critical: Set ANTHROPIC_API_KEY to empty string
          // Without this, Node.js spawn hangs indefinitely
          ANTHROPIC_API_KEY: '',
        },
        // Critical for Windows: shell:true required to run .cmd files
        // Without this, spawn throws EINVAL on Windows
        shell: process.platform === 'win32',
        // Don't create a console window on Windows
        windowsHide: true,
      })

      // Write prompt to stdin and close it
      if (child.stdin) {
        child.stdin.write(prompt)
        child.stdin.end()
      }

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
          // Success! Cache this working path
          this.cacheWorkingPath()
          resolve(stdout.trim())
        } else {
          // Parse error messages
          const errorMessage = this.parseErrorMessage(stderr, code)
          reject(new Error(errorMessage))
        }
      })

      child.on('error', (error) => {
        if (error.message.includes('ENOENT')) {
          // Path not found - try next path if available
          if (this.tryNextPath()) {
            // Retry with next path
            this.executeClaudeCli(prompt, modelName, signal)
              .then(resolve)
              .catch(reject)
          } else {
            // All paths exhausted
            const triedPaths = this.possibleCliPaths?.join('\n  - ') || cliPath
            reject(
              new Error(
                `Claude Code CLI not found. Tried paths:\n  - ${triedPaths}\n\n` +
                  'Please install it with: npm install -g @anthropic-ai/claude-code\n' +
                  'Then login with: claude login\n\n' +
                  'Or set the CLI path manually in Smart Composer settings.',
              ),
            )
          }
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
