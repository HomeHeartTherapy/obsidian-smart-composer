# Project TODO List

Persistent task tracking for the Smart Composer HomeHeart Fork.

**Last Updated:** 2024-12-19
**Current Sprint:** Post-UI Upgrade

---

## Status Legend

| Status | Meaning |
|--------|---------|
| 🔴 | Blocked |
| 🟡 | In Progress |
| 🟢 | Ready to Start |
| ✅ | Completed |
| ⏸️ | Paused/Deferred |

---

## Active Tasks

### High Priority

| Status | Task | Owner | Notes |
|--------|------|-------|-------|
| 🟢 | Fix TypeScript error in DatabaseManager.ts:190 | Unassigned | Buffer vs ArrayBuffer type mismatch |

### Medium Priority

| Status | Task | Owner | Notes |
|--------|------|-------|-------|
| 🟢 | Claude Code streaming support | Unassigned | True streaming instead of complete response |
| 🟢 | Research OpenAI API reasoning options | Unassigned | reasoning_effort parameter support |
| 🟢 | Research Gemini thinking levels | Unassigned | Flash Thinking, Pro models |
| 🟢 | Research Codex subscription integration | Unassigned | OpenAI subscription like Claude Code |
| 🟢 | Create real-time conversation capture agent | Unassigned | Prevent context loss during long sessions |

### Low Priority

| Status | Task | Owner | Notes |
|--------|------|-------|-------|
| 🟢 | Add migration tests for 12_to_13, 13_to_14 | Unassigned | Test templates exist in CLAUDE_CODE_PROVIDER_SPEC.md |

---

## Completed Tasks (Recent)

### 2024-12-19 (Continued - UI Upgrade)

| Task | Completed By | Notes |
|------|--------------|-------|
| ✅ Two-row UI layout implementation | AI | ProviderSelect, ConnectionTypeSelect, ThinkingSelect |
| ✅ UI_UPGRADE_SPEC.md v2.0 | AI | Complete design specification |
| ✅ CSS styles for new components | AI | Radix-based dropdowns |
| ✅ Build and deploy to wcm-sync | AI | Production tested |
| ✅ Manual migration fix for wcm-sync | AI | Version 12→14 upgrade |
| ✅ THREAD.md reconstruction | AI | After context compaction |

### 2024-12-19 (Earlier)

| Task | Completed By | Notes |
|------|--------------|-------|
| ✅ Debug logging for model verification | AI | Human-readable console output |
| ✅ Anthropic Extended Thinking variants | AI | 9 new models |
| ✅ Settings migration v13→v14 | AI | For thinking variants |
| ✅ CHANGELOG.md | AI | Version history |
| ✅ ROADMAP.md | AI | Future plans |
| ✅ ADR-016, ADR-017 | AI | Debug logging & thinking decisions |
| ✅ SESSION_LOG.md | AI | Living forensic ledger |
| ✅ TODO.md | AI | Persistent task tracking |
| ✅ HANDOFF.md | AI | Onboarding for new contributors |
| ✅ Claude Code provider verification | Stuart | Production tested |

### 2024-12-18

| Task | Completed By | Notes |
|------|--------------|-------|
| ✅ Claude Code provider implementation | AI | `claudeCode.ts` |
| ✅ Settings migrations v11→v12→v13 | AI | Provider + models |
| ✅ Documentation suite (20+ docs) | AI | Comprehensive |
| ✅ Windows installation guide | AI | 1400+ lines |

---

## Backlog (Future Consideration)

| Task | Priority | Complexity | Notes |
|------|----------|------------|-------|
| Template variables ({{date}}, etc.) | Medium | Medium | Dynamic content |
| Conversation export/import | Medium | Medium | Backup functionality |
| Multi-vault support | Low | High | Shared templates |
| MCP server management UI | Low | High | Visual configuration |
| Voice input/output | Low | High | Accessibility |
| Agent mode (multi-step tasks) | Low | Very High | Major feature |

---

## Technical Debt

| Item | Location | Impact | Priority |
|------|----------|--------|----------|
| Buffer/ArrayBuffer type mismatch | DatabaseManager.ts:190 | TypeScript errors | Medium |
| js-tiktoken performance | token.ts | Slow for large texts | Low |
| PGlite shim plugin | esbuild.config.mjs | Fragile workaround | Low |
| Undocumented Drizzle browser API | database/ | May break on update | Low |

---

## How to Use This File

### Adding a Task
```markdown
| 🟢 | [Task description] | [Owner or Unassigned] | [Notes] |
```

### Completing a Task
1. Move to "Completed Tasks" section with date
2. Add who completed it
3. Add any relevant notes

### Starting a Session
1. Review "Active Tasks"
2. Pick task to work on
3. Change status to 🟡
4. Update SESSION_LOG.md

### Ending a Session
1. Update task statuses
2. Move completed items
3. Add any new tasks discovered
4. Update "Last Updated" date

---

*This file should be updated at the end of every development session.*
