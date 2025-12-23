# Quick Start

**Purpose**: Start working immediately.
**Time**: 5 minutes

---

## If You're a New AI Assistant

### Step 1: Understand the Situation (30 seconds)

This is **Power Composer**, a fork of obsidian-smart-composer that adds Claude Code CLI integration.

**Current state**: Merged and pushed. Ready for testing.

### Step 2: Read Verified Facts (2 minutes)

Read [environment/VERIFIED_FACTS.md](./environment/VERIFIED_FACTS.md) to understand:
- What we KNOW is true (marked ✅)
- What we assume (marked ⚠️)
- What's unknown (marked ❓)

### Step 3: Understand the Key Challenge

This plugin must work on TWO machines:

| Machine | Claude Path |
|---------|-------------|
| Work | `C:\Users\stuart.ryan\.local\bin\claude.exe` |
| Home | `C:\Users\StuartRyan\AppData\Roaming\npm\claude.cmd` |

The code handles this with multi-path detection in `src/core/llm/claudeCode.ts`.

### Step 4: Find What You Need

| Task | Document |
|------|----------|
| Understand architecture | [architecture/ADR.md](./architecture/ADR.md) |
| Debug CLI issues | [troubleshooting/CLI_NOT_FOUND.md](./troubleshooting/CLI_NOT_FOUND.md) |
| Add new features | [development/COMMON_TASKS.md](./development/COMMON_TASKS.md) |
| Understand past failures | [history/LESSONS_LEARNED.md](./history/LESSONS_LEARNED.md) |

---

## If You're a Human Developer

### Prerequisites

- Node.js v18+ (v24 tested)
- npm
- Claude Code CLI (`claude --version` should work)
- Obsidian installed

### Clone and Build

```bash
# Clone
git clone https://github.com/HomeHeartTherapy/power-composer
cd power-composer

# Install
npm install --legacy-peer-deps

# Build
npm run build
```

### Deploy to Obsidian

1. Locate your Obsidian vault's plugin folder:
   ```
   <vault>/.obsidian/plugins/power-composer/
   ```

2. Copy these files:
   ```bash
   cp main.js manifest.json styles.css <vault>/.obsidian/plugins/power-composer/
   ```

3. Restart Obsidian or reload the plugin

### Verify It Works

1. Open Obsidian
2. Open Developer Tools: `Ctrl+Shift+I`
3. Go to Console tab
4. Look for `[Claude Code]` log messages when using the plugin

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/core/llm/claudeCode.ts` | Claude CLI integration |
| `src/components/chat-view/chat-input/ChatUserInput.tsx` | Two-row UI |
| `src/settings/schema/migrations/` | Settings migrations |
| `src/constants.ts` | Models and providers |

---

## Common Commands

```bash
npm run build     # Production build
npm run dev       # Watch mode
npm run test      # Run tests
npm run lint      # Check code style
```

---

## If Something Goes Wrong

1. **CLI not found**: See [troubleshooting/CLI_NOT_FOUND.md](./troubleshooting/CLI_NOT_FOUND.md)
2. **Models not appearing**: See [troubleshooting/MODELS_NOT_APPEARING.md](./troubleshooting/MODELS_NOT_APPEARING.md)
3. **Cache issues**: See [troubleshooting/CACHE_ISSUES.md](./troubleshooting/CACHE_ISSUES.md)

---

## Next Steps

- Read [OVERVIEW.md](./OVERVIEW.md) for project context
- Read [environment/VERIFIED_FACTS.md](./environment/VERIFIED_FACTS.md) for ground truth
- Read [history/LESSONS_LEARNED.md](./history/LESSONS_LEARNED.md) to avoid past mistakes

---

*You're ready to start. Good luck!*
