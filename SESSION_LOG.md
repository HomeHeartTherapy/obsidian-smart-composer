# Session Log - Smart Composer HomeHeart Fork

A living forensic ledger of all development sessions. Enables any new contributor (human or AI) to pick up exactly where we left off.

**Repository:** `C:\Projects\obsidian-smart-composer-homeheart-UPGRADED`
**Upstream:** [glowingjade/obsidian-smart-composer](https://github.com/glowingjade/obsidian-smart-composer)
**Fork:** HomeHeart Therapy Practice

---

## Quick Status

| Metric | Value |
|--------|-------|
| **Current Schema Version** | 14 |
| **Last Session** | 2024-12-19 |
| **Build Status** | ✅ Passing (esbuild) |
| **Test Status** | ✅ 114/114 passing |
| **Production Status** | ✅ Verified working in Obsidian |

---

## Session History

### Session 2024-12-19 (Late - Cache Investigation)

**Participants:** Stuart Ryan (Human), Claude Opus 4.5 (AI)
**Duration:** ~1.5 hours
**Branch:** main

#### Objectives

1. ⏳ Debug why wcm-sync vault not showing two-row UI despite identical files
2. ✅ Document Smart Composer file structure completely
3. ✅ Create backup of wcm-sync Smart Composer data
4. ✅ Discover and document Obsidian's cache architecture
5. ✅ Develop cache flush procedure

#### Accomplishments

| Item | Status | Notes |
|------|--------|-------|
| File structure documentation | ✅ Done | All .smtcmp files mapped |
| Backup created | ✅ Done | `C:\Backups\smart-composer-wcm-sync-20241219\` |
| Vault ID mapping discovered | ✅ Done | wcm-sync = `27bf24272b1bc5cb` |
| Cache architecture documented | ✅ Done | Partitions/vault-{id}/ structure |
| Cache flush procedure | ✅ Done | Added to GOTCHAS.md |
| Chat log saved | ✅ Done | `docs/_ai/CHAT_LOG_2024-12-19_Cache_Investigation.md` |

#### Key Discoveries

| Discovery | Impact | Resolution |
|-----------|--------|------------|
| Obsidian uses per-vault Chromium cache | Critical | Must clear `Partitions/vault-{id}/Code Cache/` |
| Vault IDs in `obsidian.json` | High | Maps hash ID to vault path |
| Code Cache persists compiled JS | Critical | Even identical files can have stale cache |
| workspace.json affects plugin state | Medium | Rename to force re-initialization |

#### Smart Composer File Structure (Complete)

**Vault Root:**

- `.smtcmp_json_db/chats/` - Chat history JSON files
- `.smtcmp_json_db/templates/` - Prompt template JSON files
- `.smtcmp_json_db/.initial_migration_completed` - Migration marker
- `.smtcmp_vector_db.tar.gz` - Vector embeddings database

**Plugin Directory (`.obsidian/plugins/smart-composer/`):**

- `main.js` - Plugin code (8.5MB)
- `manifest.json` - Plugin metadata
- `styles.css` - CSS styles (45KB)
- `data.json` - Settings, API keys, MCP config

#### Obsidian Cache Locations

```
C:\Users\{user}\AppData\Roaming\obsidian\
├── obsidian.json          <- Vault ID mappings
└── Partitions\
    └── vault-{id}\
        ├── Code Cache\    <- V8 compiled JS (CLEAR THIS!)
        ├── Cache\         <- General cache
        ├── IndexedDB\     <- Database
        └── Session Storage\
```

#### Handoff Notes

1. **UI still not showing in wcm-sync** - Pending restart after cache flush
2. **All documentation updated** - GOTCHAS.md has cache procedure
3. **Backup verified** - 19 chats, 21 templates preserved

---

### Session 2024-12-19 (Continued - UI Upgrade)

**Participants:** Stuart Ryan (Human), Claude Opus 4.5 (AI)
**Duration:** ~3 hours
**Branch:** main

#### Objectives

1. ✅ Implement two-row UI layout (VS Code Copilot-style)
2. ✅ Create ProviderSelect, ConnectionTypeSelect, ThinkingSelect components
3. ✅ Build and deploy to wcm-sync vault
4. ✅ Fix migration issues in wcm-sync (v12→v14)
5. ✅ Update all documentation to parity

#### Accomplishments

| Item | Status | Notes |
|------|--------|-------|
| UI_UPGRADE_SPEC.md v2.0 | ✅ Done | Complete design specification |
| ProviderSelect.tsx | ✅ Done | Groups models by product name |
| ConnectionTypeSelect.tsx | ✅ Done | API/Subscription toggle |
| ThinkingSelect.tsx | ✅ Done | Provider-adaptive thinking levels |
| ChatUserInput integration | ✅ Done | Two-row layout |
| CSS styles | ✅ Done | Radix-based dropdowns |
| wcm-sync deployment | ✅ Done | Manual migration v12→v14 |
| THREAD.md reconstruction | ✅ Done | After context compaction |

#### Discoveries

| Discovery | Impact | Resolution |
|-----------|--------|------------|
| wcm-sync was on schema v12 | High | Manual JSON edit to v14 |
| Context compaction loses verbatim transcript | High | Documented need for real-time capture |
| Zod validation triggers migration | Medium | Schema version mismatch triggers re-migration |

#### Files Created/Modified

```
src/components/chat-view/chat-input/
  ProviderSelect.tsx          - NEW: Provider dropdown
  ConnectionTypeSelect.tsx    - NEW: API/Subscription toggle
  ThinkingSelect.tsx          - NEW: Thinking level dropdown
  ChatUserInput.tsx           - MODIFIED: Two-row layout integration
src/styles.css                - MODIFIED: New dropdown styles
docs/UI_UPGRADE_SPEC.md       - NEW: Design specification
```

---

### Session 2024-12-19 (Earlier)

**Participants:** Stuart Ryan (Human), Claude Opus 4.5 (AI)
**Duration:** ~2 hours
**Branch:** main

#### Objectives
1. ✅ Verify model selection is accurate (not using fallback)
2. ✅ Add debug logging for model verification
3. ✅ Add Extended Thinking variants for Anthropic API
4. ✅ Test Claude Code provider (Max subscription)
5. ✅ Update documentation

#### Accomplishments

| Item | Status | Notes |
|------|--------|-------|
| Debug logging (Anthropic Provider) | ✅ Done | `[Anthropic Provider] Model: xxx \| Thinking: xxx` |
| Debug logging (Claude Code Provider) | ✅ Done | `[Claude Code] Model: xxx \| Thinking: xxx` |
| Anthropic thinking variants | ✅ Done | 9 new models (opus/sonnet/haiku × 3 levels) |
| Settings migration v13→v14 | ✅ Done | Adds thinking variants |
| Claude Code provider verification | ✅ Done | Working with Max subscription |
| CHANGELOG.md | ✅ Created | Version history |
| ROADMAP.md | ✅ Created | Future plans |
| ADR-016, ADR-017 | ✅ Added | Debug logging & thinking variants |

#### Discoveries

| Discovery | Impact | Resolution |
|-----------|--------|------------|
| Models can't self-identify reliably | High | Added console debug logging |
| Plugin must be copied to vault after rebuild | High | Document in workflow |
| Obsidian caches plugin until restart | Medium | Reload required after updates |
| `npm run build` has pre-existing TypeScript error | Low | Use `node esbuild.config.mjs production` |
| SystemSculpt AI logs to same console | None | Just noise from another plugin |

#### What Works
- ✅ All Anthropic API models with/without thinking
- ✅ All Claude Code CLI models with/without thinking
- ✅ Debug logging shows correct model in DevTools
- ✅ Thinking budget tokens correctly passed to API
- ✅ Human-readable thinking level labels

#### What Doesn't Work (Known Issues)
- ⚠️ TypeScript error in DatabaseManager.ts:190 (Buffer vs ArrayBuffer) - doesn't affect runtime
- ⚠️ Claude Code doesn't support true streaming (returns complete response)

#### Files Modified
```
src/core/llm/anthropic.ts          - Added debug logging + getThinkingLabel()
src/core/llm/claudeCode.ts         - Added debug logging + getThinkingLabel()
src/constants.ts                   - Added 9 Anthropic thinking variants
src/settings/schema/migrations/
  13_to_14.ts                      - NEW: Migration for thinking variants
  index.ts                         - Updated version to 14
CHANGELOG.md                       - NEW
ROADMAP.md                         - NEW
ADR.md                             - Added ADR-016, ADR-017
CLAUDE_CODE_PROVIDER_SPEC.md       - Updated to v2.1
docs/_meta/FRESHNESS_LOG.md        - Updated
```

#### Handoff Notes for Next Session
1. **All features working** - No blockers
2. **Consider fixing** DatabaseManager.ts TypeScript error (low priority)
3. **Future UI work** - Add dropdown toggles for thinking level (see ROADMAP.md)
4. **To test any changes**: Rebuild → Copy to vault → Reload Obsidian

---

### Session 2024-12-18

**Participants:** Stuart Ryan (Human), Claude (AI)
**Duration:** Multiple hours
**Branch:** main

#### Objectives
1. ✅ Implement Claude Code provider
2. ✅ Add settings migrations
3. ✅ Create comprehensive documentation

#### Accomplishments
- Created Claude Code provider (`claudeCode.ts`)
- Added 16 Claude Code model variants
- Created settings migrations v11→v12→v13
- Created comprehensive documentation suite (20+ docs)
- Created Windows installation guide

#### Discoveries
- Settings migrations required for new models to appear
- spawn() requires `stdio: ['inherit', 'pipe', 'pipe']` to avoid hanging
- `ANTHROPIC_API_KEY` must be empty string for Max subscription auth

---

### Session 2024-12-15

**Participants:** Stuart Ryan (Human), Claude (AI)
**Branch:** main

#### Objectives
1. ✅ Initial fork setup
2. ✅ Add Claude Opus 4.5 support

#### Accomplishments
- Forked from glowingjade/obsidian-smart-composer
- Added Opus 4.5 model support
- Initial documentation

---

## Ownership & Responsibilities

| Area | Owner | Notes |
|------|-------|-------|
| Overall Architecture | Stuart Ryan | Final decisions |
| Claude Code Provider | Stuart/AI | Collaborative |
| Documentation | AI-generated | Human-reviewed |
| Testing | Stuart Ryan | Manual verification |
| Deployment | Stuart Ryan | Vault installation |

---

## Build & Deploy Checklist

Every session should end with:

```
[ ] Code changes complete
[ ] npm run build (or node esbuild.config.mjs production)
[ ] Copy main.js, manifest.json, styles.css to vault
[ ] Reload Obsidian
[ ] Verify in DevTools console
[ ] Update this SESSION_LOG.md
[ ] Update TODO.md if needed
[ ] Commit changes to git
```

---

## Environment Reference

| Item | Value |
|------|-------|
| Project Path | `C:\Projects\obsidian-smart-composer-homeheart-UPGRADED` |
| Vault Path | `C:\obsidian-test` |
| Plugin Path | `C:\obsidian-test\.obsidian\plugins\smart-composer` |
| Node Version | v24.x |
| Claude CLI | v2.0.73 |
| Platform | Windows 11 |

---

## Links to Key Documents

| Document | Purpose |
|----------|---------|
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [ROADMAP.md](ROADMAP.md) | Future plans & tech debt |
| [ADR.md](ADR.md) | Architecture decisions (17 ADRs) |
| [TODO.md](TODO.md) | Current task list |
| [CLAUDE_CODE_PROVIDER_SPEC.md](CLAUDE_CODE_PROVIDER_SPEC.md) | Provider technical spec |
| [INSTALLATION_GUIDE_WINDOWS.md](INSTALLATION_GUIDE_WINDOWS.md) | Setup guide |
| [docs/_ai/CONTEXT_PRIMER.md](docs/_ai/CONTEXT_PRIMER.md) | AI onboarding |
| [docs/_ai/GOTCHAS.md](docs/_ai/GOTCHAS.md) | Known pitfalls |

---

*Last Updated: 2024-12-19*
