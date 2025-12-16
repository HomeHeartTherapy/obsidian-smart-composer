export class LLMAPIKeyNotSetException extends Error {
  constructor(
    message: string,
    public rawError?: Error,
  ) {
    super(message)
    this.name = 'LLMAPIKeyNotSetException'
  }
}

export class LLMAPIKeyInvalidException extends Error {
  constructor(
    message: string,
    public rawError?: Error,
  ) {
    super(message)
    this.name = 'LLMAPIKeyInvalidException'
  }
}

export class LLMBaseUrlNotSetException extends Error {
  constructor(
    message: string,
    public rawError?: Error,
  ) {
    super(message)
    this.name = 'LLMBaseUrlNotSetException'
  }
}

export class LLMRateLimitExceededException extends Error {
  constructor(
    message: string,
    public rawError?: Error,
  ) {
    super(message)
    this.name = 'LLMRateLimitExceededException'
  }
}

export class LLMModelNotFoundException extends Error {
  constructor(
    message: string,
    public rawError?: Error,
  ) {
    super(message)
    this.name = 'LLMModelNotFoundException'
  }
}

// Claude Code specific exceptions

export class ClaudeCodeCliNotFoundException extends Error {
  constructor(
    message: string,
    public rawError?: Error,
  ) {
    super(message)
    this.name = 'ClaudeCodeCliNotFoundException'
  }
}

export class ClaudeCodeNotAuthenticatedException extends Error {
  constructor(
    message: string,
    public rawError?: Error,
  ) {
    super(message)
    this.name = 'ClaudeCodeNotAuthenticatedException'
  }
}

export class ClaudeCodeRateLimitException extends Error {
  constructor(
    message: string,
    public rawError?: Error,
  ) {
    super(message)
    this.name = 'ClaudeCodeRateLimitException'
  }
}

export class ClaudeCodeExecutionException extends Error {
  constructor(
    message: string,
    public rawError?: Error,
  ) {
    super(message)
    this.name = 'ClaudeCodeExecutionException'
  }
}

export class ClaudeCodeNotAvailableException extends Error {
  constructor(
    message: string,
    public rawError?: Error,
  ) {
    super(message)
    this.name = 'ClaudeCodeNotAvailableException'
  }
}
