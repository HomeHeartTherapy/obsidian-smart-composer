# URGENT: Work Reconciliation Required

**To: Claude at Work**
**From: Claude at Home**
**Date: 2025-12-22**
**Priority: CRITICAL**

---

## TL;DR

The user forgot to push code from work on Dec 19. The work machine has a **v14 settings migration** that doesn't exist in this repo. Today (Dec 22) at home, we fixed a different bug (CLI path auto-detection). You need to merge these changes.

---

## The Problem We Fixed Today

### Original Issue
Claude Code provider said "not installed" even though CLI was installed.

### Root Cause
```typescript
// OLD CODE - broken
private getCliPath(): string {
  return this.provider.additionalSettings?.cliPath || 'claude'
}
// This returned "%USERPROFILE%\..." literally, not expanded!
```

### Our Fix
```typescript
// NEW CODE - works
private getCliPath(): string {
  // Auto-detects from 12+ common paths
  // Falls back to 'where claude' command
  // Expands %ENV_VARS% if path is configured
}
```

---

## The Problem YOU Need to Fix

### Missing v14 Migration
The active plugin in `wcm-sync\.obsidian\plugins\smart-composer\main.js` contains:
```javascript
{fromVersion:13,toVersion:14,migrate:...}
```

But this repo only has migrations up to v13. **The v14 migration was written at work on Dec 19 but never pushed.**

### Where to Find It
Check the work machine for:
```
src/settings/schema/migrations/13_to_14.ts     # THE MISSING FILE
src/settings/schema/migrations/index.ts        # Should have VERSION = 14
```

### What to Do
1. **DO NOT PULL** until you've saved your local changes
2. Commit or stash any unpushed work changes
3. Pull the home changes (110f6f3)
4. Merge/restore the v14 migration
5. Rebuild and test
6. PUSH EVERYTHING

---

## What We Changed (Already Pushed)

### File: `src/core/llm/claudeCode.ts`

**Added imports:**
```typescript
import { execSync, spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
```

**Added auto-detection method:**
- Checks 12+ common Claude CLI installation paths
- Works for standard npm, custom npm prefix, nvm, Unix
- Falls back to `where`/`which` command
- Caches result for performance
- Expands Windows `%ENV_VARS%`

### Commit
```
110f6f3 Add auto-detection for Claude Code CLI path
```

---

## Machine Differences

| Aspect | Work | Home |
|--------|------|------|
| User Profile | `C:\Users\stuart.ryan` | `C:\Users\StuartRyan` |
| Admin Rights | No (user npm prefix) | Yes (standard) |
| npm Global Path | Custom (in user dir?) | `AppData\Roaming\npm` |

The auto-detection handles both configurations.

---

## Debugging at Work

Open Obsidian dev console (Ctrl+Shift+I) and look for:
```
[Claude Code] Auto-detected CLI at: C:\Users\stuart.ryan\...
```

If it fails, check:
```cmd
where claude
npm config get prefix
```

Add the work path to `possiblePaths` in `claudeCode.ts` if needed.

---

## Git Commands You'll Need

```bash
# 1. Check status
git status
git log --oneline -5

# 2. If you have unpushed changes:
git stash
# OR
git add . && git commit -m "WIP: v14 migration and other work changes"

# 3. Pull home changes
git pull origin main

# 4. Restore your changes
git stash pop
# OR (if committed)
# Your changes are already there, just resolve any conflicts

# 5. Rebuild
npm run build

# 6. Test
# Copy main.js to plugin folder, restart Obsidian

# 7. PUSH!
git push origin main
```

---

## Files That Might Have Conflicts

| File | Home Changed | Work Might Have Changed |
|------|--------------|------------------------|
| `src/core/llm/claudeCode.ts` | YES | Possibly |
| `src/settings/schema/migrations/index.ts` | NO | YES (v14) |
| `src/settings/schema/migrations/13_to_14.ts` | NO | YES (new file) |

The changes should be in different parts of the codebase, so conflicts should be minimal.

---

## Success Criteria

After reconciliation:
1. `git log` shows both home (110f6f3) and work commits
2. `SETTINGS_SCHEMA_VERSION = 14` in migrations/index.ts
3. `13_to_14.ts` exists
4. `claudeCode.ts` has auto-detection code
5. Plugin works on both machines
6. Everything is pushed to GitHub

---

## If Things Go Wrong

### If you accidentally overwrote work changes:
```bash
git reflog  # Find the commit before the pull
git reset --hard HEAD@{n}  # Go back to it
```

### If the v14 migration is truly lost:
The compiled main.js still has it (minified). We can reverse-engineer what it does by:
1. Comparing data.json structure between v13 and v14
2. Looking at what the migration adds/changes in settings

### If auto-detection doesn't find Claude at work:
Add the work path to `possiblePaths` array in `claudeCode.ts`:
```typescript
const possiblePaths = [
  // Add work-specific path here
  path.join(userProfile, 'YOUR_WORK_NPM_PATH', 'claude.cmd'),
  // ... existing paths
]
```

---

## Remember

1. **PUSH YOUR CHANGES** when done
2. This sync happens via Obsidian Sync, so data.json will be consistent
3. The user will have context from reading these docs
4. Check the session log: `docs/_sessions/2025-12-22_HOME_SESSION.md`

Good luck, future me!
