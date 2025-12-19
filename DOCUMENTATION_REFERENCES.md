# Documentation References

Complete list of official documentation sources for every technology, library, framework, API, protocol, and tool used in this project.

**Purpose**: One-stop reference for developers, legal review, licensing compliance, and future maintenance.

---

## Table of Contents

1. [Project Documentation (Created In-House)](#1-project-documentation-created-in-house)
2. [Original Upstream Repository](#2-original-upstream-repository)
3. [Core Languages and Runtimes](#3-core-languages-and-runtimes)
4. [Build and Development Tools](#4-build-and-development-tools)
5. [Database and Storage](#5-database-and-storage)
6. [LLM Provider SDKs](#6-llm-provider-sdks)
7. [React and UI Libraries](#7-react-and-ui-libraries)
8. [Rich Text Editor](#8-rich-text-editor)
9. [AI/ML Libraries](#9-aiml-libraries)
10. [Protocols and Standards](#10-protocols-and-standards)
11. [Utility Libraries](#11-utility-libraries)
12. [Testing Framework](#12-testing-framework)
13. [Linting and Formatting](#13-linting-and-formatting)
14. [Platform and Host](#14-platform-and-host)
15. [Type Definitions](#15-type-definitions)
16. [Transitive Dependencies (Notable)](#16-transitive-dependencies-notable)
17. [Algorithms and Concepts](#17-algorithms-and-concepts)
18. [Data Formats and Standards](#18-data-formats-and-standards)

---

## 1. Project Documentation (Created In-House)

Documentation created specifically for this project:

| Document | Description | Location |
|----------|-------------|----------|
| **README.md** | Project overview | [README.md](README.md) |
| **DEVELOPMENT.md** | Development setup guide | [DEVELOPMENT.md](DEVELOPMENT.md) |
| **CONTRIBUTING.md** | Contribution guidelines | [CONTRIBUTING.md](CONTRIBUTING.md) |
| **INSTALLATION_GUIDE_WINDOWS.md** | Windows installation guide | [INSTALLATION_GUIDE_WINDOWS.md](INSTALLATION_GUIDE_WINDOWS.md) |
| **HOMEHEART_INSTALL.md** | HomeHeart fork installation | [HOMEHEART_INSTALL.md](HOMEHEART_INSTALL.md) |
| **CLAUDE_CODE_PROVIDER_SPEC.md** | Claude Code provider specification | [CLAUDE_CODE_PROVIDER_SPEC.md](CLAUDE_CODE_PROVIDER_SPEC.md) |
| **DATABASE_SPEC.md** | Database schema and storage spec | [DATABASE_SPEC.md](DATABASE_SPEC.md) |
| **ARCHITECTURE.md** | System architecture documentation | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **PRD.md** | Product Requirements Document | [PRD.md](PRD.md) |
| **FLOW_DIAGRAMS.md** | User flows and sequence diagrams | [FLOW_DIAGRAMS.md](FLOW_DIAGRAMS.md) |
| **API_REFERENCE.md** | Internal API documentation | [API_REFERENCE.md](API_REFERENCE.md) |
| **COMPONENT_SPEC.md** | React component specification | [COMPONENT_SPEC.md](COMPONENT_SPEC.md) |
| **ADR.md** | Architecture Decision Records | [ADR.md](ADR.md) |

---

## 2. Original Upstream Repository

| Resource | URL |
|----------|-----|
| **GitHub Repository** | https://github.com/glowingjade/obsidian-smart-composer |
| **Original Author** | glowingjade |
| **License** | MIT |
| **Issues** | https://github.com/glowingjade/obsidian-smart-composer/issues |
| **Discussions** | https://github.com/glowingjade/obsidian-smart-composer/discussions |

---

## 3. Core Languages and Runtimes

### TypeScript
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://www.typescriptlang.org/docs/ | ^5.9.3 |
| **Handbook** | https://www.typescriptlang.org/docs/handbook/intro.html | |
| **TSConfig Reference** | https://www.typescriptlang.org/tsconfig | |
| **GitHub** | https://github.com/microsoft/TypeScript | |
| **npm** | https://www.npmjs.com/package/typescript | |
| **Changelog** | https://github.com/microsoft/TypeScript/releases | |
| **Playground** | https://www.typescriptlang.org/play | |

### JavaScript (ECMAScript)
| Resource | URL |
|----------|-----|
| **ECMAScript Spec** | https://tc39.es/ecma262/ |
| **MDN JavaScript Guide** | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide |
| **MDN JavaScript Reference** | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference |
| **ES6+ Features** | https://kangax.github.io/compat-table/es6/ |

### Node.js
| Resource | URL | Target |
|----------|-----|--------|
| **Official Docs** | https://nodejs.org/docs/latest/api/ | ES6 target |
| **Guides** | https://nodejs.org/en/learn | |
| **GitHub** | https://github.com/nodejs/node | |
| **@types/node** | https://www.npmjs.com/package/@types/node | ^16.11.6 |

---

## 4. Build and Development Tools

### esbuild
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://esbuild.github.io/ | 0.17.3 |
| **API Reference** | https://esbuild.github.io/api/ | |
| **Plugins** | https://esbuild.github.io/plugins/ | |
| **GitHub** | https://github.com/evanw/esbuild | |
| **npm** | https://www.npmjs.com/package/esbuild | |
| **Changelog** | https://github.com/evanw/esbuild/blob/main/CHANGELOG.md | |

### ESLint
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://eslint.org/docs/latest/ | ^8.57.1 |
| **Rules Reference** | https://eslint.org/docs/latest/rules/ | |
| **Configuration** | https://eslint.org/docs/latest/use/configure/ | |
| **GitHub** | https://github.com/eslint/eslint | |

### Prettier
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://prettier.io/docs/en/ | ^3.3.3 |
| **Options** | https://prettier.io/docs/en/options.html | |
| **Configuration** | https://prettier.io/docs/en/configuration.html | |
| **GitHub** | https://github.com/prettier/prettier | |

### TypeScript ESLint
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://typescript-eslint.io/docs/ | 5.29.0 |
| **Rules** | https://typescript-eslint.io/rules/ | |
| **GitHub** | https://github.com/typescript-eslint/typescript-eslint | |

### tslib
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/tslib | 2.4.0 |
| **GitHub** | https://github.com/Microsoft/tslib | |

---

## 5. Database and Storage

### PGlite (Electric SQL)
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://pglite.dev/docs/ | 0.2.12 |
| **Getting Started** | https://pglite.dev/docs/getting-started | |
| **Extensions** | https://pglite.dev/docs/extensions | |
| **GitHub** | https://github.com/electric-sql/pglite | |
| **npm** | https://www.npmjs.com/package/@electric-sql/pglite | |
| **Discord** | https://discord.gg/electric-sql | |

### PostgreSQL (Underlying Engine)
| Resource | URL |
|----------|-----|
| **Official Docs** | https://www.postgresql.org/docs/current/ |
| **SQL Reference** | https://www.postgresql.org/docs/current/sql.html |
| **Data Types** | https://www.postgresql.org/docs/current/datatype.html |
| **Indexes** | https://www.postgresql.org/docs/current/indexes.html |

### pgvector Extension
| Resource | URL |
|----------|-----|
| **GitHub** | https://github.com/pgvector/pgvector |
| **Usage Guide** | https://github.com/pgvector/pgvector#usage |
| **HNSW Indexes** | https://github.com/pgvector/pgvector#hnsw |
| **IVFFlat Indexes** | https://github.com/pgvector/pgvector#ivfflat |
| **Distance Functions** | https://github.com/pgvector/pgvector#querying |

### Drizzle ORM
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://orm.drizzle.team/docs/overview | ^0.39.0 |
| **PostgreSQL Docs** | https://orm.drizzle.team/docs/get-started-postgresql | |
| **Schema Declaration** | https://orm.drizzle.team/docs/sql-schema-declaration | |
| **Queries** | https://orm.drizzle.team/docs/rqb | |
| **Migrations** | https://orm.drizzle.team/docs/migrations | |
| **GitHub** | https://github.com/drizzle-team/drizzle-orm | |
| **npm** | https://www.npmjs.com/package/drizzle-orm | |

### Drizzle Kit (CLI)
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Docs** | https://orm.drizzle.team/kit-docs/overview | ^0.30.3 |
| **Commands** | https://orm.drizzle.team/kit-docs/commands | |
| **npm** | https://www.npmjs.com/package/drizzle-kit | |

---

## 6. LLM Provider SDKs

### OpenAI SDK
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://platform.openai.com/docs/introduction | ^4.91.1 |
| **API Reference** | https://platform.openai.com/docs/api-reference | |
| **Node.js SDK** | https://github.com/openai/openai-node | |
| **npm** | https://www.npmjs.com/package/openai | |
| **Models** | https://platform.openai.com/docs/models | |
| **Embeddings** | https://platform.openai.com/docs/guides/embeddings | |
| **Chat Completions** | https://platform.openai.com/docs/guides/chat-completions | |
| **Reasoning Models** | https://platform.openai.com/docs/guides/reasoning | |

### Anthropic SDK
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://docs.anthropic.com/ | ^0.39.0 |
| **API Reference** | https://docs.anthropic.com/en/api | |
| **TypeScript SDK** | https://github.com/anthropics/anthropic-sdk-typescript | |
| **npm** | https://www.npmjs.com/package/@anthropic-ai/sdk | |
| **Models** | https://docs.anthropic.com/en/docs/about-claude/models | |
| **Tool Use** | https://docs.anthropic.com/en/docs/build-with-claude/tool-use | |
| **Extended Thinking** | https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking | |

### Google Generative AI (Gemini)
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://ai.google.dev/gemini-api/docs | ^0.24.0 |
| **Node.js SDK** | https://github.com/google-gemini/generative-ai-js | |
| **npm** | https://www.npmjs.com/package/@google/generative-ai | |
| **Models** | https://ai.google.dev/gemini-api/docs/models/gemini | |
| **Embeddings** | https://ai.google.dev/gemini-api/docs/embeddings | |

### Groq SDK
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://console.groq.com/docs | ^0.7.0 |
| **API Reference** | https://console.groq.com/docs/api-reference | |
| **npm** | https://www.npmjs.com/package/groq-sdk | |
| **GitHub** | https://github.com/groq/groq-typescript | |
| **Models** | https://console.groq.com/docs/models | |

### Azure OpenAI
| Resource | URL |
|----------|-----|
| **Official Docs** | https://learn.microsoft.com/en-us/azure/ai-services/openai/ |
| **REST API** | https://learn.microsoft.com/en-us/azure/ai-services/openai/reference |
| **Quickstart** | https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart |

### Ollama
| Resource | URL |
|----------|-----|
| **Official Site** | https://ollama.ai/ |
| **GitHub** | https://github.com/ollama/ollama |
| **API Docs** | https://github.com/ollama/ollama/blob/main/docs/api.md |
| **OpenAI Compatibility** | https://github.com/ollama/ollama/blob/main/docs/openai.md |

### LM Studio
| Resource | URL |
|----------|-----|
| **Official Site** | https://lmstudio.ai/ |
| **Docs** | https://lmstudio.ai/docs |
| **API Server** | https://lmstudio.ai/docs/local-server |

### Mistral AI
| Resource | URL |
|----------|-----|
| **Official Docs** | https://docs.mistral.ai/ |
| **API Reference** | https://docs.mistral.ai/api/ |
| **Models** | https://docs.mistral.ai/getting-started/models/ |

### Perplexity
| Resource | URL |
|----------|-----|
| **Official Docs** | https://docs.perplexity.ai/ |
| **API Reference** | https://docs.perplexity.ai/reference |
| **Models** | https://docs.perplexity.ai/docs/model-cards |

### DeepSeek
| Resource | URL |
|----------|-----|
| **Official Docs** | https://platform.deepseek.com/api-docs |
| **API Reference** | https://platform.deepseek.com/api-docs/api/create-chat-completion |

### OpenRouter
| Resource | URL |
|----------|-----|
| **Official Docs** | https://openrouter.ai/docs |
| **API Reference** | https://openrouter.ai/docs#quick-start |
| **Models** | https://openrouter.ai/models |

### Morph
| Resource | URL |
|----------|-----|
| **Official Site** | https://morph.so/ |
| **Docs** | https://docs.morph.so/ |

### Claude Code CLI
| Resource | URL |
|----------|-----|
| **Official Docs** | https://docs.anthropic.com/en/docs/claude-code |
| **Installation** | https://docs.anthropic.com/en/docs/claude-code/getting-started |
| **SDK Mode** | https://docs.anthropic.com/en/docs/claude-code/sdk |
| **GitHub** | https://github.com/anthropics/claude-code |

---

## 7. React and UI Libraries

### React
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://react.dev/ | ^18.3.1 |
| **API Reference** | https://react.dev/reference/react | |
| **Hooks** | https://react.dev/reference/react/hooks | |
| **Legacy Docs** | https://legacy.reactjs.org/ | |
| **GitHub** | https://github.com/facebook/react | |

### React DOM
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Docs** | https://react.dev/reference/react-dom | ^18.3.1 |
| **Client APIs** | https://react.dev/reference/react-dom/client | |

### TanStack Query (React Query)
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://tanstack.com/query/latest/docs/framework/react/overview | ^5.56.2 |
| **Queries** | https://tanstack.com/query/latest/docs/framework/react/guides/queries | |
| **Mutations** | https://tanstack.com/query/latest/docs/framework/react/guides/mutations | |
| **GitHub** | https://github.com/TanStack/query | |

### Radix UI Primitives
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://www.radix-ui.com/primitives/docs/overview/introduction | |
| **Dialog** | https://www.radix-ui.com/primitives/docs/components/dialog | ^1.1.2 |
| **Dropdown Menu** | https://www.radix-ui.com/primitives/docs/components/dropdown-menu | ^2.1.2 |
| **Popover** | https://www.radix-ui.com/primitives/docs/components/popover | ^1.1.2 |
| **Tooltip** | https://www.radix-ui.com/primitives/docs/components/tooltip | ^1.1.3 |
| **GitHub** | https://github.com/radix-ui/primitives | |

### Lucide React (Icons)
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://lucide.dev/guide/packages/lucide-react | ^0.447.0 |
| **Icon Search** | https://lucide.dev/icons/ | |
| **GitHub** | https://github.com/lucide-icons/lucide | |

### React Markdown
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/react-markdown | ^9.0.1 |
| **GitHub** | https://github.com/remarkjs/react-markdown | |
| **Plugins** | https://github.com/remarkjs/react-markdown#plugins | |

### React Syntax Highlighter
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/react-syntax-highlighter | ^15.5.0 |
| **GitHub** | https://github.com/react-syntax-highlighter/react-syntax-highlighter | |

### React Textarea Autosize
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/react-textarea-autosize | ^8.5.9 |
| **GitHub** | https://github.com/Andarist/react-textarea-autosize | |

### clsx
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/clsx | ^2.1.1 |
| **GitHub** | https://github.com/lukeed/clsx | |

---

## 8. Rich Text Editor

### Lexical
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://lexical.dev/docs/intro | ^0.17.1 |
| **Getting Started** | https://lexical.dev/docs/getting-started/quick-start | |
| **Concepts** | https://lexical.dev/docs/concepts/editor-state | |
| **Nodes** | https://lexical.dev/docs/concepts/nodes | |
| **Plugins** | https://lexical.dev/docs/react/plugins | |
| **GitHub** | https://github.com/facebook/lexical | |
| **npm** | https://www.npmjs.com/package/lexical | |
| **Playground** | https://playground.lexical.dev/ | |

### @lexical/react
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Docs** | https://lexical.dev/docs/react/plugins | ^0.17.1 |
| **npm** | https://www.npmjs.com/package/@lexical/react | |

### @lexical/clipboard
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/@lexical/clipboard | ^0.17.1 |

---

## 9. AI/ML Libraries

### LangChain.js
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://js.langchain.com/docs/ | ^0.3.2 |
| **Text Splitters** | https://js.langchain.com/docs/modules/data_connection/document_transformers/ | |
| **Embeddings** | https://js.langchain.com/docs/modules/data_connection/text_embedding/ | |
| **GitHub** | https://github.com/langchain-ai/langchainjs | |
| **npm** | https://www.npmjs.com/package/langchain | |

### @langchain/core
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Docs** | https://js.langchain.com/docs/modules/ | ^1.1.6 |
| **npm** | https://www.npmjs.com/package/@langchain/core | |

### RecursiveCharacterTextSplitter
| Resource | URL |
|----------|-----|
| **Docs** | https://js.langchain.com/docs/modules/data_connection/document_transformers/recursive_text_splitter |
| **API Reference** | https://api.js.langchain.com/classes/langchain_textsplitters.RecursiveCharacterTextSplitter.html |

### js-tiktoken
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/js-tiktoken | ^1.0.15 |
| **GitHub** | https://github.com/dqbd/tiktoken | |
| **Encodings** | https://github.com/openai/tiktoken#encodings | |

### Tiktoken (Official Reference)
| Resource | URL |
|----------|-----|
| **GitHub** | https://github.com/openai/tiktoken |
| **Cookbook** | https://cookbook.openai.com/examples/how_to_count_tokens_with_tiktoken |

---

## 10. Protocols and Standards

### Model Context Protocol (MCP)
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://modelcontextprotocol.io/ | ^1.9.0 |
| **Specification** | https://spec.modelcontextprotocol.io/ | |
| **TypeScript SDK** | https://github.com/modelcontextprotocol/typescript-sdk | |
| **npm** | https://www.npmjs.com/package/@modelcontextprotocol/sdk | |
| **Servers Directory** | https://github.com/modelcontextprotocol/servers | |
| **stdio Transport** | https://spec.modelcontextprotocol.io/specification/basic/transports/#stdio | |

### stdio (Standard Streams)
| Resource | URL |
|----------|-----|
| **Node.js Docs** | https://nodejs.org/api/process.html#processstdin |
| **Child Process** | https://nodejs.org/api/child_process.html |
| **POSIX Spec** | https://pubs.opengroup.org/onlinepubs/9699919799/functions/stdin.html |

---

## 11. Utility Libraries

### Zod (Schema Validation)
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://zod.dev/ | ^3.23.8 |
| **API Reference** | https://zod.dev/?id=basic-usage | |
| **Discriminated Unions** | https://zod.dev/?id=discriminated-unions | |
| **GitHub** | https://github.com/colinhacks/zod | |
| **npm** | https://www.npmjs.com/package/zod | |

### vscode-diff
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/vscode-diff | ^2.1.1 |
| **GitHub** | https://github.com/nicedoc/vscode-diff | |

### fuzzysort
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/fuzzysort | ^3.1.0 |
| **GitHub** | https://github.com/farzher/fuzzysort | |

### minimatch (Glob Patterns)
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/minimatch | ^10.0.1 |
| **GitHub** | https://github.com/isaacs/minimatch | |
| **Pattern Syntax** | https://github.com/isaacs/minimatch#features | |

### uuid
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/uuid | ^10.0.0 |
| **GitHub** | https://github.com/uuidjs/uuid | |
| **RFC 4122** | https://www.ietf.org/rfc/rfc4122.txt | |

### dayjs
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://day.js.org/docs/en/installation/installation | ^1.11.13 |
| **API Reference** | https://day.js.org/docs/en/parse/parse | |
| **GitHub** | https://github.com/iamkun/dayjs | |

### Lodash (Partial)
| Resource | URL | Version Used |
|----------|-----|--------------|
| **lodash.debounce** | https://www.npmjs.com/package/lodash.debounce | ^4.0.8 |
| **lodash.isequal** | https://www.npmjs.com/package/lodash.isequal | ^4.5.0 |
| **Full Docs** | https://lodash.com/docs/ | |

### exponential-backoff
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/exponential-backoff | ^3.1.1 |
| **GitHub** | https://github.com/coveooss/exponential-backoff | |

### parse5 (HTML Parser)
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/parse5 | ^7.1.2 |
| **GitHub** | https://github.com/inikulin/parse5 | |
| **API Docs** | https://parse5.js.org/ | |

### path-browserify
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/path-browserify | ^1.0.1 |
| **GitHub** | https://github.com/browserify/path-browserify | |

### shell-env
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/shell-env | ^4.0.1 |
| **GitHub** | https://github.com/sindresorhus/shell-env | |

### remark-gfm (GitHub Flavored Markdown)
| Resource | URL | Version Used |
|----------|-----|--------------|
| **npm** | https://www.npmjs.com/package/remark-gfm | ^4.0.0 |
| **GitHub** | https://github.com/remarkjs/remark-gfm | |
| **GFM Spec** | https://github.github.com/gfm/ | |

---

## 12. Testing Framework

### Jest
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Official Docs** | https://jestjs.io/docs/getting-started | ^29.7.0 |
| **API Reference** | https://jestjs.io/docs/api | |
| **Configuration** | https://jestjs.io/docs/configuration | |
| **GitHub** | https://github.com/jestjs/jest | |

### ts-jest
| Resource | URL | Version Used |
|----------|-----|--------------|
| **Docs** | https://kulshekhar.github.io/ts-jest/docs/ | ^29.2.5 |
| **GitHub** | https://github.com/kulshekhar/ts-jest | |

---

## 13. Linting and Formatting

### ESLint Plugins

| Package | npm | Version |
|---------|-----|---------|
| **eslint-config-prettier** | https://www.npmjs.com/package/eslint-config-prettier | ^9.1.0 |
| **eslint-plugin-import** | https://www.npmjs.com/package/eslint-plugin-import | ^2.30.0 |
| **eslint-plugin-react** | https://www.npmjs.com/package/eslint-plugin-react | ^7.37.1 |
| **eslint-plugin-react-hooks** | https://www.npmjs.com/package/eslint-plugin-react-hooks | ^5.0.0 |

---

## 14. Platform and Host

### Obsidian
| Resource | URL |
|----------|-----|
| **Official Site** | https://obsidian.md/ |
| **Developer Docs** | https://docs.obsidian.md/Home |
| **Plugin API** | https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin |
| **API Reference** | https://docs.obsidian.md/Reference/TypeScript+API |
| **Sample Plugin** | https://github.com/obsidianmd/obsidian-sample-plugin |
| **npm (@types)** | https://www.npmjs.com/package/obsidian | latest |
| **Community Plugins** | https://obsidian.md/plugins |
| **Forum** | https://forum.obsidian.md/ |
| **Discord** | https://discord.gg/obsidianmd |

### Electron (Obsidian Runtime)
| Resource | URL |
|----------|-----|
| **Official Docs** | https://www.electronjs.org/docs/latest |
| **Process Model** | https://www.electronjs.org/docs/latest/tutorial/process-model |
| **Security** | https://www.electronjs.org/docs/latest/tutorial/security |

### WebAssembly
| Resource | URL |
|----------|-----|
| **Official Site** | https://webassembly.org/ |
| **MDN Docs** | https://developer.mozilla.org/en-US/docs/WebAssembly |
| **JavaScript API** | https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface |

---

## 15. Type Definitions

| Package | npm | Version |
|---------|-----|---------|
| **@types/jest** | https://www.npmjs.com/package/@types/jest | ^29.5.13 |
| **@types/lodash.debounce** | https://www.npmjs.com/package/@types/lodash.debounce | ^4.0.9 |
| **@types/lodash.isequal** | https://www.npmjs.com/package/@types/lodash.isequal | ^4.5.8 |
| **@types/node** | https://www.npmjs.com/package/@types/node | ^16.11.6 |
| **@types/path-browserify** | https://www.npmjs.com/package/@types/path-browserify | ^1.0.3 |
| **@types/react** | https://www.npmjs.com/package/@types/react | ^18.3.10 |
| **@types/react-dom** | https://www.npmjs.com/package/@types/react-dom | ^18.3.0 |
| **@types/react-syntax-highlighter** | https://www.npmjs.com/package/@types/react-syntax-highlighter | ^15.5.13 |
| **@types/semver** | https://www.npmjs.com/package/@types/semver | ^7.5.8 |
| **@types/uuid** | https://www.npmjs.com/package/@types/uuid | ^10.0.0 |

### DefinitelyTyped Repository
| Resource | URL |
|----------|-----|
| **GitHub** | https://github.com/DefinitelyTyped/DefinitelyTyped |
| **Search** | https://www.typescriptlang.org/dt/search |

---

## 16. Transitive Dependencies (Notable)

These are not direct dependencies but are pulled in and may be relevant for legal/security review:

| Package | Purpose | Via |
|---------|---------|-----|
| **express** | HTTP server (MCP dev) | @modelcontextprotocol/sdk |
| **langsmith** | LangChain telemetry | langchain |
| **@babel/runtime** | Runtime helpers | react-syntax-highlighter |
| **core-js** | Polyfills | Various |
| **regenerator-runtime** | Async/await | Various |
| **prismjs** | Syntax highlighting | react-syntax-highlighter |
| **highlight.js** | Syntax highlighting | react-syntax-highlighter |
| **hast-util-\*** | HTML AST utilities | react-markdown |
| **mdast-util-\*** | Markdown AST utilities | react-markdown |
| **unified** | Text processing pipeline | react-markdown |
| **micromark** | Markdown parser | react-markdown |

---

## 17. Algorithms and Concepts

### HNSW (Hierarchical Navigable Small World)
| Resource | URL |
|----------|-----|
| **Original Paper** | https://arxiv.org/abs/1603.09320 |
| **Wikipedia** | https://en.wikipedia.org/wiki/Hierarchical_navigable_small_world |
| **pgvector Implementation** | https://github.com/pgvector/pgvector#hnsw |
| **Pinecone Explainer** | https://www.pinecone.io/learn/series/faiss/hnsw/ |

### Cosine Similarity
| Resource | URL |
|----------|-----|
| **Wikipedia** | https://en.wikipedia.org/wiki/Cosine_similarity |
| **OpenAI Cookbook** | https://cookbook.openai.com/examples/semantic_text_search_using_embeddings |

### Vector Embeddings
| Resource | URL |
|----------|-----|
| **OpenAI Guide** | https://platform.openai.com/docs/guides/embeddings |
| **What are Embeddings** | https://vickiboykis.com/what_are_embeddings/ |

### RAG (Retrieval-Augmented Generation)
| Resource | URL |
|----------|-----|
| **Original Paper** | https://arxiv.org/abs/2005.11401 |
| **LangChain RAG** | https://js.langchain.com/docs/tutorials/rag |
| **OpenAI Cookbook** | https://cookbook.openai.com/examples/question_answering_using_embeddings |

### Text Chunking Strategies
| Resource | URL |
|----------|-----|
| **LangChain Splitters** | https://js.langchain.com/docs/modules/data_connection/document_transformers/ |
| **Chunking Strategies** | https://www.pinecone.io/learn/chunking-strategies/ |

### Tokenization
| Resource | URL |
|----------|-----|
| **OpenAI Tokenizer** | https://platform.openai.com/tokenizer |
| **Tiktoken Cookbook** | https://cookbook.openai.com/examples/how_to_count_tokens_with_tiktoken |
| **BPE Algorithm** | https://huggingface.co/learn/nlp-course/chapter6/5 |

---

## 18. Data Formats and Standards

### JSON
| Resource | URL |
|----------|-----|
| **Official Spec** | https://www.json.org/json-en.html |
| **ECMA-404** | https://ecma-international.org/publications-and-standards/standards/ecma-404/ |
| **RFC 8259** | https://datatracker.ietf.org/doc/html/rfc8259 |
| **MDN Guide** | https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON |

### Markdown
| Resource | URL |
|----------|-----|
| **CommonMark Spec** | https://spec.commonmark.org/ |
| **GitHub Flavored Markdown** | https://github.github.com/gfm/ |
| **Original Markdown** | https://daringfireball.net/projects/markdown/ |
| **MDN Guide** | https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Howto/Markdown_in_MDN |

### YAML (Used in some configs)
| Resource | URL |
|----------|-----|
| **Official Spec** | https://yaml.org/spec/1.2.2/ |

### CSS
| Resource | URL |
|----------|-----|
| **MDN Reference** | https://developer.mozilla.org/en-US/docs/Web/CSS |
| **CSS Spec** | https://www.w3.org/Style/CSS/ |

### HTML
| Resource | URL |
|----------|-----|
| **MDN Reference** | https://developer.mozilla.org/en-US/docs/Web/HTML |
| **WHATWG Spec** | https://html.spec.whatwg.org/ |

### UUID (RFC 4122)
| Resource | URL |
|----------|-----|
| **RFC 4122** | https://www.ietf.org/rfc/rfc4122.txt |
| **Wikipedia** | https://en.wikipedia.org/wiki/Universally_unique_identifier |

### URL Encoding
| Resource | URL |
|----------|-----|
| **RFC 3986** | https://datatracker.ietf.org/doc/html/rfc3986 |
| **MDN encodeURIComponent** | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent |

### Base64
| Resource | URL |
|----------|-----|
| **RFC 4648** | https://datatracker.ietf.org/doc/html/rfc4648 |
| **MDN btoa/atob** | https://developer.mozilla.org/en-US/docs/Web/API/btoa |

### Gzip Compression
| Resource | URL |
|----------|-----|
| **RFC 1952** | https://datatracker.ietf.org/doc/html/rfc1952 |
| **Wikipedia** | https://en.wikipedia.org/wiki/Gzip |

### Tar Archive Format
| Resource | URL |
|----------|-----|
| **GNU Tar Manual** | https://www.gnu.org/software/tar/manual/ |
| **POSIX Spec** | https://pubs.opengroup.org/onlinepubs/9699919799/utilities/pax.html |

---

## License Summary

| Category | Licenses Present |
|----------|------------------|
| **This Project** | MIT |
| **React Ecosystem** | MIT |
| **LLM SDKs** | Apache-2.0, MIT |
| **Database (PGlite)** | Apache-2.0 |
| **Drizzle** | Apache-2.0 |
| **LangChain** | MIT |
| **Lexical** | MIT |
| **Obsidian** | Proprietary (plugin API MIT-like) |
| **Most Utilities** | MIT |

**Note**: Always verify current license status on npm/GitHub before production use.

---

## Quick Reference Card

```
Core Stack:
  Language:    TypeScript 5.9 / JavaScript ES6+
  Runtime:     Node.js (Electron)
  Framework:   React 18.3
  Database:    PGlite 0.2.12 (PostgreSQL WASM)
  ORM:         Drizzle 0.39
  Vectors:     pgvector + HNSW
  Editor:      Lexical 0.17
  Validation:  Zod 3.23
  Build:       esbuild 0.17

LLM Providers:
  OpenAI, Anthropic, Gemini, Groq, Ollama, LM Studio,
  Mistral, Perplexity, DeepSeek, OpenRouter, Azure OpenAI,
  OpenAI-compatible, Morph, Claude Code

Protocols:
  MCP (Model Context Protocol) via stdio

Platform:
  Obsidian (Electron-based)
```

---

*Last Updated: December 2024*
*Total Technologies Documented: 100+*
