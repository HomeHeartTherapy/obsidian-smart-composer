# Getting Started

Welcome to the Obsidian Smart Composer HomeHeart fork! This guide will get you up and running in under 15 minutes.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: v18.x or higher ([download](https://nodejs.org/))
- **npm**: v9.x or higher (comes with Node.js)
- **Git**: Latest version ([download](https://git-scm.com/))
- **Obsidian**: v1.4.0 or higher ([download](https://obsidian.md/))
- **Code Editor**: VSCode recommended ([download](https://code.visualstudio.com/))

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/HomeHeartTherapy/obsidian-smart-composer.git
cd obsidian-smart-composer
```

### 2. Install Dependencies

```bash
npm install
```

This installs ~85 dependencies including:
- React 18.3.1
- PGlite 0.2.12 (WebAssembly PostgreSQL)
- OpenAI SDK 4.91.1
- Anthropic SDK 0.39.0
- Drizzle ORM 0.39.0

### 3. Build the Plugin

```bash
# Development build (with watch mode)
npm run dev

# Production build
npm run build
```

### 4. Link to Obsidian

Copy or symlink the build output to your Obsidian vault's plugins folder:

```bash
# Windows (PowerShell as Admin)
New-Item -ItemType SymbolicLink -Path "C:\path\to\vault\.obsidian\plugins\smart-composer" -Target "C:\path\to\obsidian-smart-composer"

# macOS/Linux
ln -s /path/to/obsidian-smart-composer /path/to/vault/.obsidian/plugins/smart-composer
```

### 5. Enable the Plugin

1. Open Obsidian
2. Go to Settings → Community Plugins
3. Enable "Smart Composer"
4. Configure your LLM provider API keys in plugin settings

---

## First Run Configuration

### Setting Up an LLM Provider

1. Open plugin settings (Settings → Smart Composer)
2. Navigate to the Providers tab
3. Add at least one provider:

**OpenAI (Recommended for beginners)**:
- Get API key from [platform.openai.com](https://platform.openai.com/)
- Paste key in OpenAI provider settings
- Recommended models: `gpt-4o` (chat), `text-embedding-3-small` (embeddings)

**Anthropic**:
- Get API key from [console.anthropic.com](https://console.anthropic.com/)
- Paste key in Anthropic provider settings
- Recommended models: `claude-sonnet-4-20250514` (chat)

### Indexing Your Vault

1. Open the Smart Composer chat panel (ribbon icon or command palette)
2. Click the settings gear
3. Select "Reindex Vault"
4. Wait for indexing to complete (progress shown in status bar)

The plugin creates vector embeddings of your notes for semantic search.

---

## Project Structure Overview

```
obsidian-smart-composer/
├── src/
│   ├── main.ts              # Plugin entry point
│   ├── core/
│   │   ├── llm/             # LLM provider implementations
│   │   ├── rag/             # RAG engine
│   │   └── mcp/             # MCP tool server
│   ├── components/          # React UI components
│   ├── database/            # PGlite + Drizzle
│   └── settings/            # Plugin configuration
├── docs/                    # Documentation (you are here)
├── styles.css               # Plugin styles
└── manifest.json            # Obsidian plugin manifest
```

See [CODEBASE_MAP.md](../_ai/CODEBASE_MAP.md) for detailed file documentation.

---

## Development Workflow

### Daily Commands

```bash
# Start development (watches for changes)
npm run dev

# Check types before committing
npm run type:check

# Lint and format
npm run lint:check
npm run lint:fix

# Run tests
npm run test
```

### Making Changes

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run `npm run type:check` to catch type errors
4. Run `npm run lint:fix` to auto-format
5. Test in Obsidian
6. Commit with descriptive message
7. Push and create PR

### Hot Reload

The development build watches for changes. After saving a file:
1. Wait for esbuild to rebuild (~1-2 seconds)
2. In Obsidian, press `Ctrl+P` → "Reload app without saving"
3. Or close/reopen Obsidian

---

## Key Concepts

### Providers vs Models

- **Provider**: An LLM service (OpenAI, Anthropic, etc.)
- **Model**: A specific model within a provider (gpt-4o, claude-sonnet-4-20250514)

Each provider can have multiple models. The plugin supports 15+ providers.

### Vector Database

The plugin uses PGlite (WebAssembly PostgreSQL) with pgvector for:
- Storing note embeddings
- Semantic similarity search
- Persistent storage in `.smtcmp_vector_db.tar.gz`

### Mentionables

When chatting, you can reference:
- `@filename.md` - Specific file
- `@folder/` - Entire folder
- `@vault` - All indexed content
- `[[wikilink]]` - Linked notes
- URLs - Web content

### MCP Tools

The plugin supports Model Context Protocol (MCP) tools:
- File system access
- External API calls
- Custom tool servers

---

## Troubleshooting

### Build Errors

**"Cannot find module"**
```bash
rm -rf node_modules
npm install
```

**TypeScript errors**
```bash
npm run type:check
# Fix reported errors
```

### Plugin Not Loading

1. Check Obsidian developer console (Ctrl+Shift+I)
2. Look for errors in Console tab
3. Ensure `main.js` exists in plugin folder
4. Verify `manifest.json` is valid JSON

### Database Issues

**"Database locked"**
- Close other Obsidian windows
- Delete `.smtcmp_vector_db.tar.gz` to reset (loses embeddings)

**"Dimension mismatch"**
- Embeddings were created with different model
- Reindex vault with consistent embedding model

### API Errors

**"Rate limited"**
- Wait and retry
- Check provider usage dashboard
- Consider upgrading API tier

**"Invalid API key"**
- Verify key in provider settings
- Check key hasn't expired
- Ensure correct provider selected

---

## Next Steps

1. **Explore Documentation**
   - [ARCHITECTURE.md](../../ARCHITECTURE.md) - System design
   - [COMMON_TASKS.md](../_ai/COMMON_TASKS.md) - How-to guides
   - [GOTCHAS.md](../_ai/GOTCHAS.md) - Known issues

2. **Understand the Codebase**
   - [CODEBASE_MAP.md](../_ai/CODEBASE_MAP.md) - File-by-file guide
   - [COMPONENT_SPEC.md](../../COMPONENT_SPEC.md) - UI components

3. **Make Your First Contribution**
   - Find a `good-first-issue` on GitHub
   - Or improve documentation
   - Submit a PR!

---

## Getting Help

- **GitHub Issues**: [Report bugs and request features](https://github.com/HomeHeartTherapy/obsidian-smart-composer/issues)
- **Discussions**: Ask questions in GitHub Discussions
- **Documentation**: Check [FAQ.md](FAQ.md) for common questions

---

*Last Updated: December 2024*
