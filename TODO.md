# Power Composer - Development TODO

**Fork**: HomeHeart Fork of Smart Composer
**New Name**: Power Composer
**Owner**: Home Heart, LLC
**Contact**: StuartRyan@homehearttherapy.com
**License**: Proprietary (UNLICENSED)

---

## CRITICAL - Priority 1

### [x] Rename Plugin Identity (DONE - 2025-12-22 Home Session)
- [x] Update `manifest.json`:
  - `id`: `smart-composer` -> `power-composer`
  - `name`: `Smart Composer` -> `Power Composer`
  - `author`: `Home Heart, LLC`
  - `authorUrl`: `https://homehearttherapy.com`
  - `isDesktopOnly`: `true` (Claude Code requires desktop)
- [x] Update `package.json`:
  - `name`: `obsidian-power-composer`
  - `author`: `Home Heart, LLC <StuartRyan@homehearttherapy.com>`
  - `license`: `UNLICENSED`
  - `private`: `true`

**Why Critical**: Without this, Obsidian thinks it's the original Smart Composer and could auto-update, destroying all customizations.

---

## HIGH - Priority 2

### [ ] Resolve Work/Home Merge Conflicts
Merge unpushed work code (v14 migration) with home changes (CLI auto-detection).

**Reference Documentation**:
- `c:\claude\SMART_COMPOSER_WORK_MERGE_MASTER.md` - Start here
- `c:\claude\SMART_COMPOSER_WORK_MERGE_BREADCRUMBS.md` - File-by-file trail
- `c:\claude\2025-12-22_HOME_SESSION.md` - Session narrative
- `docs/_ai/WORK_RECONCILIATION_URGENT.md` - In-repo copy

**What needs merging**:
| Source | File | Status |
|--------|------|--------|
| Work | `src/settings/schema/migrations/13_to_14.ts` | MISSING - needs recovery |
| Work | `src/settings/schema/migrations/index.ts` | VERSION=14 needed |
| Home | `src/core/llm/claudeCode.ts` | Multi-path retry (already pushed) |

**Steps**:
1. At work: `git status` to find unpushed changes
2. Commit or stash work changes
3. `git pull origin main` (pulls home changes)
4. Merge/restore v14 migration
5. `npm run build`
6. Test in Obsidian
7. `git push origin main`

---

### [ ] Restore Two-Level UI
The two-level user interface from work needs to be recovered/restored.

**Context**: This was part of the unpushed work changes from Dec 19.

**Action**: Check work machine for UI changes, possibly in:
- `src/components/`
- `src/views/`
- CSS/styling files

---

## MEDIUM - Priority 3

### [ ] Implement Agentic Mode Switch

**Goal**: Add a toggle to switch between two modes:

#### Mode 1: Chat Mode (Current Smart Composer behavior)
- AI chat with vault context
- Writing assistance
- One-click edits
- Standard conversational interface

#### Mode 2: Agentic Mode (Claude Code style)
- Multi-step task execution
- File creation/modification
- Command execution within vault
- "Go make me a JavaScript metabind, add it to the right file, hardwire it to note toolbar"
- Uses same Claude Code CLI wrapper (no additional API costs)

**Implementation Ideas**:
```typescript
// Settings
interface PowerComposerSettings {
  mode: 'chat' | 'agentic';
  // ... existing settings
}

// UI Toggle
// - Ribbon icon to switch modes
// - Or dropdown in composer header
// - Or keyboard shortcut

// Agentic Mode Features
// - File system access within vault
// - Template execution
// - Plugin integration (Templater, Dataview, MetaBind)
// - Task planning and execution
```

**Key Requirements**:
- Same Claude Code CLI wrapper for both modes
- No additional API costs (uses Max/Pro subscription)
- Seamless switching
- Clear visual indicator of current mode

---

## LOW - Priority 4

### [ ] Update Plugin Folder Name
After stable release, consider renaming the plugin folder from `smart-composer` to `power-composer` in vault `.obsidian/plugins/`.

**Note**: This may require migrating settings. Be careful with Obsidian Sync.

---

### [ ] Add Version Badge/Indicator
Show "Power Composer" and version in UI to distinguish from upstream Smart Composer.

---

### [ ] Documentation Cleanup
- Update README.md with Power Composer branding
- Add CHANGELOG.md for fork-specific changes
- Document Claude Code integration setup

---

## Technical Debt

### [ ] Remove Upstream References
- Remove `fundingUrl` (done in manifest)
- Update any hardcoded "Smart Composer" strings in code
- Update error messages to reference "Power Composer"

### [ ] Test Migration Path
- Test that existing Smart Composer users can migrate to Power Composer
- Document data migration if needed

---

## Reference: What Changed in 2025-12-22 Home Session

### Problem Solved
Claude Code provider said "not installed" even though CLI was installed.

### Root Cause
- `%USERPROFILE%` environment variable not expanded
- No auto-detection for different npm configurations

### Solution Implemented
- Multi-path retry system (7 paths for Windows)
- Environment variable expansion
- stdin piping for long prompts (Windows cmd limit)
- `shell: true` for .cmd file execution

### Files Changed
- `src/core/llm/claudeCode.ts` - All the fixes

### Commits
```
110f6f3 Add auto-detection for Claude Code CLI path
56cb529 Fix Claude Code CLI execution on Windows
38a699e Add session documentation and work reconciliation notes
eaebf6d Add multi-path retry for Claude Code CLI detection
ed80546 Update documentation with multi-path retry details
5512a14 Add comprehensive work merge master reference
d8404ad Add breadcrumb trail of all files touched
```

---

## Contact

**Questions about this fork?**
- Email: StuartRyan@homehearttherapy.com
- GitHub: https://github.com/HomeHeartTherapy/obsidian-smart-composer
