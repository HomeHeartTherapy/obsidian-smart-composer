# HomeHeart Smart Composer Fork - Installation Guide

This fork adds:
1. **Claude Opus 4.5** (`claude-opus-4-5-20251101`) to the Smart Composer plugin
2. **Claude Code Provider** - Use your Max/Pro subscription instead of paying API fees!

## Quick Install

### Prerequisites
- Node.js (v18+ recommended)
- npm
- Git

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/HomeHeartTherapy/obsidian-smart-composer.git
   cd obsidian-smart-composer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the plugin**
   ```bash
   npm run build
   ```

4. **Copy to your Obsidian vault**

   Copy these 3 files to `<your-vault>/.obsidian/plugins/smart-composer/`:
   - `main.js`
   - `manifest.json`
   - `styles.css`

   Example (adjust paths for your system):
   ```bash
   # Windows (PowerShell)
   Copy-Item main.js, manifest.json, styles.css -Destination "C:\Users\<you>\Documents\ObsidianVault\.obsidian\plugins\smart-composer\"

   # macOS/Linux
   cp main.js manifest.json styles.css ~/Documents/ObsidianVault/.obsidian/plugins/smart-composer/
   ```

5. **Restart Obsidian** (or disable/re-enable the Smart Composer plugin)

---

## Option A: Use Anthropic API (Claude Opus 4.5)

For API-based access with your Anthropic API key:

1. Open Settings > Smart Composer
2. Set your Anthropic API key
3. Select **claude-opus-4.5** as your model

---

## Option B: Use Claude Code (Max/Pro Subscription) - NO API COST!

Use your Claude Max or Pro subscription instead of paying API fees:

### Prerequisites

1. **Install Claude Code CLI**
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **Login to Claude Code**
   ```bash
   claude login
   ```

3. **Verify installation**
   ```bash
   claude --version
   ```

### Configuration

1. Open Settings > Smart Composer
2. The **claude-code** provider should already be available
3. Select one of these models:
   - `claude-code/opus-4.5` - Claude Opus 4.5
   - `claude-code/sonnet-4.5` - Claude Sonnet 4.5
   - `claude-code/sonnet-4` - Claude Sonnet 4
   - `claude-code/haiku-4.5` - Claude Haiku 4.5

4. (Optional) Set a custom CLI path if needed

### Limitations

- Desktop only (mobile doesn't support CLI execution)
- No real streaming (responses come all at once)
- No image support through CLI
- No prompt caching
- Usage limits apply (reset every 5 hours for Max/Pro)

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Claude Code not found" | Install CLI: `npm install -g @anthropic-ai/claude-code` |
| "Not logged in" | Run: `claude login` |
| "Usage limit reached" | Wait for limit reset (every 5 hours) |

---

## What Changed

### Files Modified
- `src/constants.ts` - Added Claude Opus 4.5 model and Claude Code provider/models
- `src/types/provider.types.ts` - Added 'claude-code' provider type
- `src/types/chat-model.types.ts` - Added 'claude-code' model type
- `src/types/embedding-model.types.ts` - Added 'claude-code' embedding type
- `src/core/llm/manager.ts` - Registered Claude Code provider

### Files Created
- `src/core/llm/claudeCode.ts` - Claude Code provider implementation

---

## Syncing with Upstream

To get updates from the original Smart Composer repo:
```bash
git fetch upstream
git merge upstream/main
npm install
npm run build
```

Then re-copy the built files to your vault.
