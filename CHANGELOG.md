# Changelog

All notable changes to the Smart Composer HomeHeart Fork will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Two-row UI layout** for chat input with dropdown controls
  - Row 1: Provider dropdown (Claude, ChatGPT, Gemini, etc.) + Model dropdown + Context files
  - Row 2: Connection type (API/Subscription) + Thinking level + Submit button
  - New components: `ProviderSelect.tsx`, `ConnectionTypeSelect.tsx`, `ThinkingSelect.tsx`
- Debug logging for model verification in DevTools console
  - `[Anthropic Provider] Model: xxx | Thinking: OFF/STANDARD/HIGH/MAX`
  - `[Claude Code] Model: xxx | Thinking: OFF/LOW/MEDIUM/HIGH/ULTRATHINK`
- Anthropic API thinking variants (Extended Thinking support)
  - `claude-opus-4.5-thinking` (10k token budget)
  - `claude-opus-4.5-thinking-high` (20k token budget)
  - `claude-opus-4.5-thinking-max` (32k token budget)
  - `claude-sonnet-4.5-thinking` (10k token budget)
  - `claude-sonnet-4.5-thinking-high` (20k token budget)
  - `claude-sonnet-4.5-thinking-max` (32k token budget)
  - `claude-haiku-4.5-thinking` (10k token budget)
  - `claude-haiku-4.5-thinking-high` (20k token budget)
  - `claude-haiku-4.5-thinking-max` (32k token budget)
- Settings migration v13 → v14 for new thinking variants

### Changed
- Improved console debug messages with human-readable thinking level labels

## [1.2.5-homeheart.3] - 2024-12-18

### Added
- Claude Code provider for Max/Pro subscription usage via CLI
  - No API key required - uses `claude login` authentication
  - Supports thinking levels: none, low, medium, high, max (ultrathink)
- Claude Code model variants:
  - `claude-code/opus-4.5` (base, no thinking)
  - `claude-code/opus-4.5-think` (~4k tokens thinking)
  - `claude-code/opus-4.5-think-hard` (~10k tokens thinking)
  - `claude-code/opus-4.5-ultrathink` (~32k tokens thinking)
  - Same variants for `sonnet-4`, `sonnet-4-thinking`, `haiku-3.5`
- Settings migrations v11 → v12 → v13 for Claude Code provider and models
- Comprehensive Windows installation guide (`INSTALLATION_GUIDE_WINDOWS.md`)
- GUI database locator script (`Find-SmartComposerDatabase.ps1`)
- Architecture Decision Records (`ADR.md`) with 15 ADRs

### Changed
- Updated provider type system to support Claude Code discriminated union
- Added `thinkingLevel` property to chat model schema for Claude Code models

### Fixed
- Provider factory now correctly routes Claude Code models to CLI wrapper

## [1.2.5-homeheart.2] - 2024-12-15

### Added
- Documentation suite for AI and human developers
  - `docs/_ai/` - AI developer context (CONTEXT_PRIMER, CODEBASE_MAP, COMMON_TASKS, GOTCHAS)
  - `docs/_human/` - Human developer docs (GETTING_STARTED, GLOSSARY, FAQ)
  - `docs/_index/` - Navigation (MASTER_INDEX, QUICK_REFERENCE, SEARCH_TAGS)
  - `docs/_meta/` - Doc management (FRESHNESS_LOG, PRIORITY_MATRIX)

### Changed
- Enhanced provider architecture documentation

## [1.2.5-homeheart.1] - 2024-12-10

### Added
- Initial HomeHeart fork from glowingjade/obsidian-smart-composer
- Custom branding and configuration for HomeHeart therapy practice

### Changed
- Updated manifest for HomeHeart distribution

---

## Upstream Changelog (glowingjade/obsidian-smart-composer)

### [1.2.5] - 2024-11-xx
- Original upstream release
- See [upstream releases](https://github.com/glowingjade/obsidian-smart-composer/releases)

---

## Version Numbering

This fork uses the format: `{upstream-version}-homeheart.{fork-revision}`

- `1.2.5` - Upstream Smart Composer version
- `homeheart` - Fork identifier
- `.3` - Fork revision number

When upstream releases a new version, we'll rebase and increment appropriately.
