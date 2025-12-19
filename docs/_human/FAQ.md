# Frequently Asked Questions

Common questions about the Obsidian Smart Composer plugin.

---

## General Questions

### What is Smart Composer?

Smart Composer is an Obsidian plugin that provides AI-powered chat with your notes. It uses RAG (Retrieval-Augmented Generation) to find relevant notes and include them in conversations with various LLM providers.

### What LLM providers are supported?

The plugin supports 15+ providers:
- **Cloud**: OpenAI, Anthropic, Google Gemini, Groq, Mistral, Perplexity, DeepSeek, OpenRouter, Morph
- **Local**: Ollama, LM Studio
- **Enterprise**: Azure OpenAI
- **Special**: Claude Code, OpenAI-Compatible (for custom endpoints)

### Is my data sent to external services?

Yes, when you chat, your messages and relevant note content are sent to your configured LLM provider. Your API keys are stored locally. The plugin does not send data anywhere else.

### Does it work offline?

Only with local providers like Ollama or LM Studio. Cloud providers require internet connectivity.

---

## Setup & Configuration

### How do I install the plugin?

See [GETTING_STARTED.md](GETTING_STARTED.md) for detailed installation instructions.

### Where do I get API keys?

| Provider | URL |
|----------|-----|
| OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Anthropic | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| Google | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| Groq | [console.groq.com/keys](https://console.groq.com/keys) |
| Mistral | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) |

### How do I change the embedding model?

1. Open plugin settings
2. Go to the Embeddings section
3. Select a new embedding model
4. **Important**: You must reindex your vault after changing embedding models

### Why do I need to reindex after changing embedding models?

Different models produce embeddings with different dimensions and semantic spaces. Old embeddings are incompatible with queries from a new model.

---

## Usage Questions

### How do I reference my notes in chat?

Use the `@` symbol followed by:
- `@filename.md` - Reference a specific file
- `@folder/` - Reference all files in a folder
- `@vault` - Reference your entire indexed vault

You can also use `[[wikilinks]]` which Obsidian users are familiar with.

### What does "indexing" mean?

Indexing creates vector embeddings of your notes. These embeddings allow the plugin to find semantically similar content when you ask questions. Without indexing, the plugin can't search your notes.

### How long does indexing take?

Depends on vault size and embedding model:
- Small vault (<100 notes): 1-2 minutes
- Medium vault (100-1000 notes): 5-15 minutes
- Large vault (1000+ notes): 30+ minutes

Progress is shown in the status bar.

### Can I use images in chat?

Yes, if your LLM provider supports vision (OpenAI GPT-4o, Anthropic Claude 3+). Paste or drag images into the chat input.

### What are MCP tools?

MCP (Model Context Protocol) allows the LLM to execute actions like reading files or searching the web. Configure MCP servers in plugin settings.

---

## Troubleshooting

### The plugin doesn't load

1. Check the developer console (Ctrl+Shift+I) for errors
2. Verify `main.js` exists in the plugin folder
3. Try disabling and re-enabling the plugin
4. Reinstall the plugin

### I get "Rate limit exceeded" errors

Your API provider is limiting requests. Solutions:
- Wait a few minutes and retry
- Reduce request frequency
- Upgrade your API tier
- Switch to a provider with higher limits

### I get "Invalid API key" errors

- Verify the key in plugin settings
- Check the key hasn't been revoked
- Ensure you're using the correct provider
- Some keys require specific permissions/scopes

### The chat is slow to respond

Possible causes:
- Slow internet connection
- Provider API is overloaded
- Large context (many notes referenced)
- Model choice (larger models are slower)

Solutions:
- Reference fewer notes
- Use a faster model
- Try a different provider
- Check your internet connection

### Embeddings aren't working

Symptoms: Search returns no results, irrelevant results

Solutions:
1. Reindex your vault (Settings → Reindex Vault)
2. Check embedding model is configured
3. Verify API key for embedding provider
4. Check console for errors

### Database errors

**"Database locked"**
- Only one Obsidian window can access the database
- Close other windows using the same vault

**"Dimension mismatch"**
- Embeddings were created with a different model
- Reindex with your current embedding model

**"WASM error"**
- Browser/Obsidian compatibility issue
- Try restarting Obsidian
- Report the issue on GitHub

### Chat history is missing

Chat history is stored in `.smtcmp_json_db/chats/`. If files are missing:
- Check if folder exists
- Check folder permissions
- Files may have been accidentally deleted

---

## Development Questions

### How do I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run type:check` and `npm run lint:fix`
5. Test in Obsidian
6. Submit a pull request

See [GETTING_STARTED.md](GETTING_STARTED.md) for development setup.

### How do I add a new LLM provider?

See [COMMON_TASKS.md](../_ai/COMMON_TASKS.md#adding-a-new-llm-provider) for step-by-step instructions.

### How do I debug the plugin?

1. Open Obsidian developer tools (Ctrl+Shift+I)
2. Check Console for errors
3. Add `console.log` statements
4. Use React DevTools for component debugging

### Where is data stored?

| Data | Location |
|------|----------|
| Settings | `<vault>/.obsidian/plugins/smart-composer/data.json` |
| Vector DB | `<vault>/.smtcmp_vector_db.tar.gz` |
| Chats | `<vault>/.smtcmp_json_db/chats/*.json` |
| Templates | `<vault>/.smtcmp_json_db/templates/*.json` |

### How do I reset the plugin?

**Soft reset** (keeps settings):
1. Delete `.smtcmp_vector_db.tar.gz`
2. Delete `.smtcmp_json_db/` folder
3. Restart Obsidian

**Hard reset** (removes everything):
1. Delete all files above
2. Delete `<vault>/.obsidian/plugins/smart-composer/data.json`
3. Restart Obsidian

---

## Privacy & Security

### Are my notes encrypted?

Notes are stored as-is in your vault. The vector database contains embeddings (not readable text). API calls use HTTPS.

### Can I use this with sensitive data?

Consider:
- Your data is sent to LLM providers
- Check each provider's data retention policy
- Use local providers (Ollama) for sensitive vaults
- Review what notes you reference in chats

### Are API keys stored securely?

API keys are stored in Obsidian's plugin data file (`data.json`). This file is:
- Not encrypted by default
- Stored in your vault's `.obsidian` folder
- Should not be committed to version control

---

## Feature Requests

### Can you add support for [X] provider?

Possibly! Open a GitHub issue with:
- Provider name and URL
- Whether they have a public API
- Link to their API documentation

### Can you add [X] feature?

Open a GitHub issue describing:
- What feature you want
- Why it would be useful
- How you envision it working

---

## Known Limitations

### Not Supported

- Real-time collaboration
- End-to-end encryption
- Mobile (Obsidian mobile)
- Obsidian Publish integration

### Partial Support

- Very large vaults (>10,000 files may be slow)
- Non-text files (PDFs, images not indexed)
- Right-to-left languages

---

*Last Updated: December 2024*

*For issues not covered here, please [open a GitHub issue](https://github.com/HomeHeartTherapy/obsidian-smart-composer/issues).*
