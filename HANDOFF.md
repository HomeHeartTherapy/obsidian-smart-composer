# Handoff Document - Smart Composer HomeHeart Fork

**Purpose:** Enable any new contributor (human or AI) to pick up this project immediately without repeating past mistakes.

**Last Updated:** 2024-12-19
**Last Session:** See [SESSION_LOG.md](SESSION_LOG.md)

---

## 30-Second Overview

This is a **fork** of [obsidian-smart-composer](https://github.com/glowingjade/obsidian-smart-composer) for HomeHeart Therapy Practice. The main additions:

1. **Two-Row UI Layout** - VS Code Copilot-style dropdown controls
2. **Claude Code Provider** - Use Claude Max/Pro subscription instead of API fees
3. **Extended Thinking** - Variants for Anthropic API and Claude Code
4. **Debug Logging** - Verify which model is actually running

---

## If You're an AI Assistant

Read these files in order:
1. **This file** (HANDOFF.md) - You're here
2. [SESSION_LOG.md](SESSION_LOG.md) - What happened, what works, what doesn't
3. [TODO.md](TODO.md) - What needs to be done
4. [docs/_ai/GOTCHAS.md](docs/_ai/GOTCHAS.md) - Don't repeat these mistakes

**Critical Knowledge:**
- Schema version is **14** (check `src/settings/schema/migrations/index.ts`)
- Adding new models requires a **settings migration** (or they won't appear)
- Build with `node esbuild.config.mjs production` (not `npm run build` - has TypeScript error)
- After build, **copy files to vault** and **reload Obsidian**

---

## If You're a Human Developer

1. Read [INSTALLATION_GUIDE_WINDOWS.md](INSTALLATION_GUIDE_WINDOWS.md) for setup
2. Read [docs/_human/GETTING_STARTED.md](docs/_human/GETTING_STARTED.md) for development
3. Check [TODO.md](TODO.md) for current tasks

---

## Project State Summary

### What's Working (Verified 2024-12-19)

| Feature | Status | How to Verify |
|---------|--------|---------------|
| Two-row UI layout | ✅ | Provider/Model dropdowns visible |
| Provider grouping | ✅ | Claude, ChatGPT, Gemini groups |
| Connection type toggle | ✅ | API/Subscription for Claude |
| Thinking level dropdown | ✅ | Adapts to provider |
| Anthropic API models | ✅ | DevTools: `[Anthropic Provider]` log |
| Claude Code CLI models | ✅ | DevTools: `[Claude Code]` log |
| Extended Thinking (API) | ✅ | Budget shows in log |
| Extended Thinking (CLI) | ✅ | Trigger words in prompt |
| Debug logging | ✅ | Ctrl+Shift+I in Obsidian |
| Settings migrations | ✅ | data.json version = 14 |

### What's NOT Working (Known Issues)

| Issue | Impact | Workaround |
|-------|--------|------------|
| TypeScript error DatabaseManager.ts:190 | Build warning | Use esbuild directly |
| Claude Code no true streaming | UX (response appears at once) | None needed |

### What's NOT Implemented Yet

See [ROADMAP.md](ROADMAP.md) and [TODO.md](TODO.md)

---

## Critical Paths

### To Add a New Model

1. Add to `DEFAULT_CHAT_MODELS` in `src/constants.ts`
2. **Create settings migration** (e.g., `14_to_15.ts`)
3. Register migration in `src/settings/schema/migrations/index.ts`
4. Increment `SETTINGS_SCHEMA_VERSION`
5. Rebuild and test

**DO NOT** just add to constants.ts - existing users won't see it!

### To Modify Claude Code Provider

File: `src/core/llm/claudeCode.ts`

Key methods:
- `executeClaudeCli()` - Runs the CLI
- `formatMessagesAsPrompt()` - Converts messages to prompt string
- `getThinkingLabel()` - Debug output formatting

**Critical spawn() config:**
```typescript
spawn(cliPath, args, {
  stdio: ['inherit', 'pipe', 'pipe'],  // 'inherit' prevents hanging
  env: { ...process.env, ANTHROPIC_API_KEY: '' },  // MUST be empty string
})
```

### To Test Changes

```powershell
# 1. Build
node esbuild.config.mjs production

# 2. Copy to vault
Copy-Item main.js, manifest.json, styles.css -Destination "C:\obsidian-test\.obsidian\plugins\smart-composer\" -Force

# 3. Reload Obsidian (or toggle plugin off/on)

# 4. Open DevTools (Ctrl+Shift+I) and test
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/components/chat-view/chat-input/ProviderSelect.tsx` | Provider dropdown (Claude, ChatGPT, etc.) |
| `src/components/chat-view/chat-input/ConnectionTypeSelect.tsx` | API/Subscription toggle |
| `src/components/chat-view/chat-input/ThinkingSelect.tsx` | Thinking level dropdown |
| `src/components/chat-view/chat-input/ChatUserInput.tsx` | Two-row layout integration |
| `src/core/llm/claudeCode.ts` | Claude Code CLI provider |
| `src/core/llm/anthropic.ts` | Anthropic API provider |
| `src/core/llm/manager.ts` | Provider factory |
| `src/constants.ts` | Models, providers, defaults |
| `src/settings/schema/migrations/` | Settings migrations |
| `src/types/chat-model.types.ts` | Model type definitions |
| `src/types/provider.types.ts` | Provider type definitions |

---

## Environment Setup

| Item | Value |
|------|-------|
| Project | `C:\Projects\obsidian-smart-composer-homeheart-UPGRADED` |
| Vault | `C:\obsidian-test` |
| Plugin | `C:\obsidian-test\.obsidian\plugins\smart-composer` |
| Node | v18+ required (v24 tested) |
| Claude CLI | v2.0.73+ |

---

## Common Mistakes to Avoid

1. **Forgetting settings migration** → Models don't appear
2. **Using `npm run build`** → TypeScript error (use esbuild directly)
3. **Not copying to vault** → Testing old code
4. **Not reloading Obsidian** → Changes not applied
5. **Asking model "what model are you?"** → Models can't self-identify reliably

---

## Getting Help

1. Check [SESSION_LOG.md](SESSION_LOG.md) - Was this solved before?
2. Check [docs/_ai/GOTCHAS.md](docs/_ai/GOTCHAS.md) - Known pitfalls
3. Check [ADR.md](ADR.md) - Why was it built this way?
4. Check [CLAUDE_CODE_PROVIDER_SPEC.md](CLAUDE_CODE_PROVIDER_SPEC.md) - Detailed technical spec

---

## Document Map

```
Root/
├── HANDOFF.md          ← YOU ARE HERE (start here)
├── SESSION_LOG.md      ← What happened each session
├── TODO.md             ← Current tasks
├── CHANGELOG.md        ← Version history
├── ROADMAP.md          ← Future plans
├── ADR.md              ← Architecture decisions
├── CLAUDE_CODE_PROVIDER_SPEC.md  ← Technical spec
├── INSTALLATION_GUIDE_WINDOWS.md ← Setup guide
│
├── docs/_ai/           ← AI assistant context
│   ├── CONTEXT_PRIMER.md
│   ├── CODEBASE_MAP.md
│   ├── COMMON_TASKS.md
│   └── GOTCHAS.md
│
├── docs/_human/        ← Human developer docs
│   ├── GETTING_STARTED.md
│   ├── GLOSSARY.md
│   └── FAQ.md
│
└── docs/_meta/         ← Doc maintenance
    ├── FRESHNESS_LOG.md
    └── PRIORITY_MATRIX.md
```

---

*Welcome to the project! Check SESSION_LOG.md for the latest status.*
