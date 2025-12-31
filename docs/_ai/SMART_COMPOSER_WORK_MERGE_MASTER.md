# Power Composer Work Merge - Master Reference

**Created**: 2025-12-22 (Home Session)
**For**: Claude at Work
**Priority**: CRITICAL - Read before doing anything!

---

## PLUGIN RENAMED!

**This fork is now "Power Composer"** (not Smart Composer).

| Field | New Value |
|-------|-----------|
| Plugin ID | `power-composer` |
| Plugin Name | `Power Composer` |
| Author | `Home Heart, LLC` |
| Contact | `StuartRyan@homehearttherapy.com` |
| License | Proprietary (UNLICENSED) |

**Why?** Prevents Obsidian from auto-updating and destroying customizations.

**See**: `TODO.md` for full task list including future Agentic Mode feature.

---

## Quick Summary

| What | Details |
|------|---------|
| **Problem Fixed at Home** | Claude Code CLI "not installed" error |
| **Root Cause** | `%USERPROFILE%` not expanded, paths not auto-detected |
| **Solution** | Multi-path retry system (7 paths) |
| **Work has unpushed** | v14 settings migration |
| **Home pushed** | Multi-path CLI detection + rename to Power Composer |
| **Action Required** | Merge both, rebuild, push |

---

## Work Machine Context

### npm Configuration (No Admin)
At work, npm global packages are installed to a user prefix:
```bash
npm config set prefix "$HOME/.npm-global"
# Translates to: C:\Users\stuart.ryan\.npm-global\
```

### Claude CLI Location at Work
```
C:\Users\stuart.ryan\.npm-global\claude.cmd
```

This is **Path #3** in the retry list - should be found automatically.

### User Profile
- Work: `C:\Users\stuart.ryan`
- Home: `C:\Users\StuartRyan`

---

## The Multi-Path Retry System

When Claude Code provider runs, it tries these paths in order:
```
[1/7] C:\Users\stuart.ryan\AppData\Roaming\npm\claude.cmd  (standard)
[2/7] C:\Users\stuart.ryan\npm\claude.cmd                  (custom prefix)
[3/7] C:\Users\stuart.ryan\.npm-global\claude.cmd          <-- WORK PATH
[4/7] C:\Users\stuart.ryan\AppData\Local\npm\claude.cmd    (local)
[5/7] C:\Users\stuart.ryan\claude.cmd                      (profile root)
[6/7] C:\Users\stuart.ryan\bin\claude.cmd                  (bin folder)
[7/7] claude                                               (PATH fallback)
```

Console output at work should show:
```
[Claude Code] Trying path [1/7]: ...
[Claude Code] Path failed, trying next...
[Claude Code] Trying path [2/7]: ...
[Claude Code] Path failed, trying next...
[Claude Code] Trying path [3/7]: C:\Users\stuart.ryan\.npm-global\claude.cmd
[Claude Code] Caching working path: C:\Users\stuart.ryan\.npm-global\claude.cmd
```

---

## What's Missing at Work (v14 Migration)

The compiled plugin has a v14 migration that was never committed/pushed:
```javascript
// In main.js (minified):
{fromVersion:13,toVersion:14,migrate:...}
```

### Files to Look For
```
src/settings/schema/migrations/13_to_14.ts     # THE FILE
src/settings/schema/migrations/index.ts        # VERSION = 14
```

### If Files Don't Exist
The v14 migration was written but never saved? Check:
1. Git stash: `git stash list`
2. Uncommitted changes: `git status`
3. Other branches: `git branch -a`

---

## Merge Steps

### Step 1: Save Work Changes
```bash
cd C:\path\to\obsidian-smart-composer-homeheart
git status
git log --oneline -5

# If unpushed changes exist:
git add .
git commit -m "WIP: v14 migration from work"
```

### Step 2: Pull Home Changes
```bash
git pull origin main
# Should pull commits up to ed80546
```

### Step 3: Resolve Any Conflicts
Home changed: `src/core/llm/claudeCode.ts`
Work changed: `src/settings/schema/migrations/`

These are different files - conflicts unlikely.

### Step 4: Rebuild & Test
```bash
npm run build
```

Copy `main.js` to plugin folder:
```bash
# NOTE: Folder may still be named smart-composer until you rename it
copy main.js "C:\path\to\vault\.obsidian\plugins\smart-composer\"
# After renaming folder:
copy main.js "C:\path\to\vault\.obsidian\plugins\power-composer\"
```

Restart Obsidian, test Claude Code provider.

**Note**: You may need to rename the plugin folder from `smart-composer` to `power-composer` and update Obsidian's community-plugins.json.

### Step 5: Push Everything
```bash
git add .
git commit -m "Merge home CLI detection with work v14 migration"
git push origin main
```

---

## Debugging Console Commands

Open Obsidian dev console: `Ctrl+Shift+I`

Look for Claude Code logs. If path detection fails:
```cmd
where claude
npm config get prefix
```

Add the actual path to `buildPossiblePaths()` in `claudeCode.ts` if needed.

---

## Files Changed by Home Session

### src/core/llm/claudeCode.ts
- Added `expandEnvVars()` for `%USERPROFILE%` expansion
- Added `buildPossiblePaths()` with 7 Windows paths
- Added `tryNextPath()` for retry on ENOENT
- Added `cacheWorkingPath()` to cache working path
- Changed spawn to use stdin for prompt (Windows cmd limit)
- Added `shell: true` for Windows .cmd execution

### Commits Pushed
```
110f6f3 Add auto-detection for Claude Code CLI path
56cb529 Fix Claude Code CLI execution on Windows
38a699e Add session documentation and work reconciliation notes
eaebf6d Add multi-path retry for Claude Code CLI detection
ed80546 Update documentation with multi-path retry details
```

---

## Success Criteria

After merge is complete:
- [ ] `git log` shows both home and work commits
- [ ] `SETTINGS_SCHEMA_VERSION = 14` in migrations/index.ts
- [ ] `13_to_14.ts` exists
- [ ] `claudeCode.ts` has multi-path retry code
- [ ] Plugin works at work (path #3 should be found)
- [ ] Everything is pushed to GitHub

---

## If Things Go Wrong

### Accidentally Overwrote Work Changes
```bash
git reflog
git reset --hard HEAD@{n}
```

### v14 Migration Truly Lost
1. Check the compiled main.js - it's minified but the migration exists
2. Compare data.json structure to understand what v14 adds
3. Recreate based on the migration's apparent purpose

### CLI Still Not Found at Work
Add the exact path to `buildPossiblePaths()`:
```typescript
// In claudeCode.ts
private buildPossiblePaths(): string[] {
  return [
    // Add your specific path at the top for priority:
    path.join(userProfile, 'YOUR_ACTUAL_PATH', 'claude.cmd'),
    // ... rest of paths
  ]
}
```

---

## Reference Documentation

Also see:
- `c:\claude\2025-12-22_HOME_SESSION.md` - Full session log
- `c:\claude\WORK_RECONCILIATION_URGENT.md` - Original reconciliation notes
- `c:\obsidian-smart-composer-homeheart\docs\_sessions\` - In-repo docs
- `c:\obsidian-smart-composer-homeheart\docs\_ai\` - AI context docs

---

Good luck, future me!
