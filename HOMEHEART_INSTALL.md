# HomeHeart Smart Composer Fork - Installation Guide

This fork adds **Claude Opus 4.5** (`claude-opus-4-5-20251101`) to the Smart Composer plugin.

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

6. **Configure**
   - Open Settings > Smart Composer
   - Ensure your Anthropic API key is set
   - Select **claude-opus-4.5** as your model

## What Changed

Only `src/constants.ts` was modified:
- Added `claude-opus-4.5` to `DEFAULT_CHAT_MODELS` (API model: `claude-opus-4-5-20251101`)
- Added pricing entry to `ANTHROPIC_PRICES`

## Syncing with Upstream

To get updates from the original Smart Composer repo:
```bash
git fetch upstream
git merge upstream/main
npm install
npm run build
```

Then re-copy the built files to your vault.
