# Roadmap

This document outlines planned features, improvements, and technical debt for the Smart Composer HomeHeart Fork.

**Last Updated:** 2024-12-19

---

## Legend

| Status | Meaning |
|--------|---------|
| **Planned** | On the roadmap, not started |
| **In Progress** | Currently being worked on |
| **Completed** | Done and merged |
| **Blocked** | Waiting on external dependency |

---

## Current Sprint

### In Progress

- [ ] **Research: Provider-Specific Thinking/Reasoning Support**
  - OpenAI API: reasoning_effort parameter for o1/o3 models
  - Gemini: Flash Thinking model integration
  - Codex: Subscription-based access like Claude Code

### Completed This Sprint

- [x] **Two-Row UI Layout** (VS Code Copilot-style)
  - Provider dropdown (Claude, ChatGPT, Gemini, etc.)
  - Connection type toggle (API/Subscription)
  - Thinking level dropdown (adapts to provider)
  - New components: ProviderSelect, ConnectionTypeSelect, ThinkingSelect
- [x] Debug logging for model verification
- [x] Anthropic API Extended Thinking variants
- [x] Human-readable console messages for thinking levels

---

## Short-Term (Next 2-4 Weeks)

### Provider Enhancements

- [ ] **Claude Code streaming support**
  - Current: CLI returns complete response, displayed as single chunk
  - Goal: True streaming via Claude Code's streaming output mode
  - Benefit: Better UX for long responses

- [ ] **Google Gemini thinking mode support**
  - Add thinking variants for Gemini models
  - Similar to Anthropic Extended Thinking

- [ ] **OpenAI o1/o3 reasoning mode**
  - Support reasoning_effort parameter
  - Add model variants for different reasoning levels

### Bug Fixes

- [ ] **Fix TypeScript error in DatabaseManager.ts:190**
  - Buffer vs ArrayBuffer type mismatch
  - Low priority (doesn't affect runtime)
  - See: `src/database/DatabaseManager.ts:190`

### Documentation

- [ ] **Create PRD (Product Requirements Document)**
  - Define core features and use cases
  - Target users and personas
  - Success metrics

- [ ] **Create SFS (Software Feature Specification)**
  - Detailed technical specifications
  - API contracts
  - Data models

---

## Medium-Term (1-3 Months)

### Features

- [ ] **Template variables and placeholders**
  - Support `{{date}}`, `{{title}}`, `{{selection}}` in templates
  - Dynamic content insertion

- [ ] **Conversation export/import**
  - Export chat history to markdown
  - Import conversations from other tools
  - Backup/restore functionality

- [ ] **Multi-vault support**
  - Shared templates across vaults
  - Vault-specific settings

- [ ] **MCP server management UI**
  - Visual server configuration
  - Status monitoring
  - Tool discovery

### Performance

- [ ] **Token-based chunking migration**
  - Replace character-based with WASM tiktoken
  - More accurate context window management
  - See: ADR-011 notes

- [ ] **Lazy loading for large vaults**
  - Progressive indexing
  - Background re-indexing

### Integration

- [ ] **Obsidian Sync compatibility**
  - Proper handling of synced settings
  - Conflict resolution for templates

---

## Long-Term (3-6 Months)

### Major Features

- [ ] **Agent mode**
  - Multi-step task execution
  - Tool chaining
  - Progress tracking

- [ ] **Voice input/output**
  - Speech-to-text for chat input
  - Text-to-speech for responses
  - Accessibility enhancement

- [ ] **Collaborative editing**
  - Multiple users on same vault
  - Real-time sync
  - Conflict resolution

### Architecture

- [ ] **Plugin extensibility**
  - Custom provider plugins
  - Template plugin system
  - Hook system for customization

- [ ] **Mobile optimization**
  - Better mobile UI
  - Reduced memory footprint
  - Offline caching

---

## Technical Debt

### High Priority

| Issue | Location | Impact |
|-------|----------|--------|
| Buffer/ArrayBuffer type mismatch | `DatabaseManager.ts:190` | TypeScript errors on strict build |
| Undocumented Drizzle browser API | `src/database/` | May break on Drizzle update |

### Medium Priority

| Issue | Location | Impact |
|-------|----------|--------|
| js-tiktoken performance | `src/utils/token.ts` | Slow for large texts |
| Deep context nesting | `src/components/` | Verbose provider hierarchy |
| No Redux DevTools equivalent | State management | Harder debugging |

### Low Priority

| Issue | Location | Impact |
|-------|----------|--------|
| PGlite shim plugin | `esbuild.config.mjs` | Fragile workaround |
| Windows filename length limits | `JsonDb.ts` | Edge case for long titles |

---

## Upstream Sync Plan

We track [glowingjade/obsidian-smart-composer](https://github.com/glowingjade/obsidian-smart-composer) for upstream changes.

### Sync Strategy

1. **Watch** upstream releases for breaking changes
2. **Cherry-pick** bug fixes as needed
3. **Rebase** on major versions after testing
4. **Document** any conflicts in this roadmap

### Current Upstream Version

- Tracking: `v1.2.5`
- Last sync check: 2024-12-18

---

## Contributing

Want to help? See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Priority areas where help is welcome:
1. UI component development (React)
2. Provider integration testing
3. Documentation improvements
4. Mobile testing

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.
