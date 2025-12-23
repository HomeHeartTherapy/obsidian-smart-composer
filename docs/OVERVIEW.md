# Power Composer Overview

**Read time**: 2 minutes
**Purpose**: Understand this project completely

---

## What Is This?

**Power Composer** is a fork of [obsidian-smart-composer](https://github.com/glowingjade/obsidian-smart-composer) - an AI chat plugin for Obsidian.

### Key Additions

1. **Claude Code CLI Integration** - Use Claude Max/Pro subscription instead of API fees
2. **Two-Row UI Layout** - VS Code Copilot-style dropdown controls
3. **Extended Thinking** - Support for thinking/reasoning modes across providers
4. **Multi-Environment Support** - Works on both home and work machines

---

## Why "Power Composer"?

The original plugin is named "Smart Composer". We renamed our fork to:
- Prevent Obsidian auto-updates from overwriting our customizations
- Establish a distinct identity for the fork
- Allow both plugins to coexist if needed

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                    Obsidian Plugin                       │
├─────────────────────────────────────────────────────────┤
│  Chat UI (React + Lexical)                              │
│  ├── Two-row control bar                                │
│  │   ├── Provider → Model → Context                     │
│  │   └── Connection Type → Thinking → Submit            │
│  └── Chat messages with streaming                       │
├─────────────────────────────────────────────────────────┤
│  Provider Layer (16 providers)                          │
│  ├── Anthropic API (with Extended Thinking)             │
│  ├── Claude Code CLI (Max/Pro subscription)   ← KEY    │
│  ├── OpenAI, Gemini, Ollama, etc.                      │
│  └── Factory pattern with Zod validation               │
├─────────────────────────────────────────────────────────┤
│  Storage                                                │
│  ├── PGlite (PostgreSQL in WASM) for vectors          │
│  ├── JSON files for chats/templates                    │
│  └── data.json for settings (versioned migrations)     │
└─────────────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/core/llm/claudeCode.ts` | Claude Code CLI provider |
| `src/core/llm/manager.ts` | Provider factory |
| `src/components/chat-view/chat-input/ChatUserInput.tsx` | Two-row UI |
| `src/settings/schema/migrations/*.ts` | Settings migrations |
| `src/constants.ts` | Models, providers, defaults |

---

## Environment Challenge

This plugin must work on TWO machines with different configurations:

| Aspect | Home | Work |
|--------|------|------|
| User Profile | `StuartRyan` | `stuart.ryan` |
| Admin Rights | Yes | No |
| Claude Installation | npm global | Standalone .exe |
| Claude Path | `AppData\Roaming\npm\claude.cmd` | `.local\bin\claude.exe` |

The code handles this with a **multi-path retry system** that tries multiple possible CLI locations.

---

## Current State (2025-12-22)

### What Works
- Claude Code CLI integration (both machines)
- Extended Thinking models (Anthropic API)
- Two-row UI layout
- Settings migrations (v14)
- Multi-path CLI detection

### What's Tested
- Work machine: CLI detection verified
- Home machine: CLI detection verified (morning session)
- Build: Compiles without errors
- Plugin: Loads in Obsidian

### What's Pending
- Obsidian live testing (need to deploy to vault)
- Cross-machine sync testing

---

## Links

- **Primary Repo**: https://github.com/HomeHeartTherapy/power-composer
- **Full Documentation**: [./README.md](./README.md)
- **Architecture Decisions**: [./architecture/ADR.md](./architecture/ADR.md)
- **Environment Details**: [./environment/VERIFIED_FACTS.md](./environment/VERIFIED_FACTS.md)

---

*Next: [QUICK_START.md](./QUICK_START.md) to start working*
