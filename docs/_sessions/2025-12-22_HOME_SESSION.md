# Session Log: 2025-12-22 (HOME Machine)

## Session Context
- **Date**: December 22, 2025
- **Machine**: HOME (C:\Users\StuartRyan)
- **Work Machine Profile**: C:\Users\stuart.ryan
- **Problem**: Claude Code provider not working at home, says "not installed"

---

## CRITICAL: WORK IS AHEAD OF HOME

### The Situation
When analyzing the active plugin vs the homeheart fork, we discovered:

| Aspect | Active Plugin (wcm-sync) | HomeHeart Fork (GitHub) |
|--------|--------------------------|-------------------------|
| Settings Schema Version | **v14** | v13 |
| Has 13_to_14 migration | **YES** (in main.js) | **NO** |
| Last commit | N/A (not a git repo) | Dec 18, 2025 |
| main.js modified | Dec 19, 7:23 PM | Dec 18 (last build) |

### What This Means
**Code was written on Dec 19 at work that was NEVER PUSHED.** This includes:
- A `13_to_14.ts` migration file
- Updates to `migrations/index.ts` (SETTINGS_SCHEMA_VERSION = 14)
- Possibly other changes

### Evidence
```
# In active plugin main.js (line 768):
{fromVersion:13,toVersion:14,migrate:...}

# In homeheart source:
SETTINGS_SCHEMA_VERSION = 13  # Only goes up to v13!
```

---

## The Original Problem

### Symptom
Claude Code provider in Smart Composer said "Claude Code CLI not found" even though:
```
> where claude
C:\Users\StuartRyan\AppData\Roaming\npm\claude
C:\Users\StuartRyan\AppData\Roaming\npm\claude.cmd

> claude --version
2.0.75 (Claude Code)
```

### Root Cause
The `data.json` had:
```json
"cliPath": "%USERPROFILE%\\AppData\\Roaming\\npm\\claude.cmd"
```

But the plugin code did NOT expand Windows environment variables like `%USERPROFILE%`. It literally tried to spawn `%USERPROFILE%\AppData\Roaming\npm\claude.cmd` as a filename.

### Why It Worked at Work
At work, either:
1. The path was hardcoded to the work profile path
2. Or the v14 migration added proper env var handling
3. Or Obsidian's environment had claude in PATH

---

## The Fix (Applied Today)

### Fix 1: Environment Variable Expansion
Added to `getCliPath()`:
```typescript
private expandEnvVars(str: string): string {
  return str.replace(/%([^%]+)%/g, (_, varName) => {
    return process.env[varName] || `%${varName}%`
  })
}
```

### Fix 2: Auto-Detection
Added comprehensive auto-detection that checks 12+ common installation paths:
```typescript
const possiblePaths = [
  // Standard npm global (Windows)
  path.join(userProfile, 'AppData', 'Roaming', 'npm', 'claude.cmd'),
  // User-local npm prefix (for non-admin installs)
  path.join(userProfile, 'npm', 'claude.cmd'),
  // Direct in user profile (custom npm prefix)
  path.join(userProfile, 'claude.cmd'),
  path.join(userProfile, 'bin', 'claude.cmd'),
  // ... and more
]
```

Also falls back to `where claude` / `which claude` if file checks fail.

### Fix 3: Cleared Hardcoded Path
Removed `cliPath` from data.json so auto-detection kicks in:
```json
{
  "type": "claude-code",
  "id": "claude-code"
  // No cliPath = auto-detect
}
```

---

## Files Changed

### Modified
- `src/core/llm/claudeCode.ts` - Added auto-detection + env var expansion + multi-path retry

### Commits
```
110f6f3 Add auto-detection for Claude Code CLI path
56cb529 Fix Claude Code CLI execution on Windows
38a699e Add session documentation and work reconciliation notes
eaebf6d Add multi-path retry for Claude Code CLI detection
```

### Pushed
```
To https://github.com/HomeHeartTherapy/obsidian-smart-composer.git
   4a7b628..eaebf6d  main -> main
```

---

## WORK RECONCILIATION CHECKLIST

When you get to work, you MUST:

### Step 1: Check for Unpushed Code
```bash
cd C:\path\to\obsidian-smart-composer-homeheart  # wherever it is at work
git status
git log --oneline -5
```

Look for:
- `src/settings/schema/migrations/13_to_14.ts`
- Changes to `src/settings/schema/migrations/index.ts`
- Any other uncommitted changes

### Step 2: If Work Has v14 Migration
```bash
# Stash or commit work changes first
git stash  # or git add && git commit

# Pull the home changes
git pull origin main

# Restore work changes
git stash pop  # or merge as needed
```

### Step 3: Merge the Changes
The home fix (auto-detection) should be compatible with whatever the v14 migration does. They're in different files:
- Home fix: `src/core/llm/claudeCode.ts`
- Work v14: `src/settings/schema/migrations/13_to_14.ts`

### Step 4: Rebuild and Test
```bash
npm run build
# Copy main.js to plugin folder
# Restart Obsidian
# Test Claude Code provider
```

### Step 5: Push Everything
```bash
git add .
git commit -m "Merge home auto-detection with work v14 migration"
git push origin main
```

---

## Key Insights

### Why Different Machines Have Different Paths
- **Home**: Standard npm global install → `%USERPROFILE%\AppData\Roaming\npm\`
- **Work**: Custom npm prefix (no admin) → Possibly `%USERPROFILE%\npm\` or `%USERPROFILE%\`

### Why Obsidian Doesn't See Terminal's PATH
GUI applications on Windows inherit PATH from when they were launched. If npm's bin directory was added to PATH after Obsidian started (or is only in user PATH, not system PATH), Obsidian won't see it.

### The Auto-Detection Solution
By checking multiple known paths AND falling back to `where claude`, we handle:
1. Different npm configurations between machines
2. Different user profile paths
3. GUI apps not having full PATH access

---

## Console Debugging

When testing at work, open Obsidian's dev console (Ctrl+Shift+I) and look for:
```
[Claude Code] Trying path [1/7]: C:\Users\stuart.ryan\AppData\Roaming\npm\claude.cmd
[Claude Code] Path failed, trying next...
[Claude Code] Trying path [2/7]: C:\Users\stuart.ryan\npm\claude.cmd
[Claude Code] Caching working path: C:\Users\stuart.ryan\npm\claude.cmd
```

The multi-path retry system will automatically try all 7 paths:
1. `AppData\Roaming\npm\claude.cmd` (standard npm global)
2. `npm\claude.cmd` (custom prefix)
3. `.npm-global\claude.cmd` (another common prefix)
4. `AppData\Local\npm\claude.cmd` (local install)
5. `claude.cmd` (direct in profile)
6. `bin\claude.cmd` (bin folder)
7. `claude` (PATH fallback)

If ALL paths fail, you'll need to add your work-specific path to `buildPossiblePaths()` in `claudeCode.ts`.

---

## Summary

| What | Status |
|------|--------|
| Original problem | CLI path not expanding env vars |
| Home fix | Auto-detection + env var expansion + multi-path retry |
| Committed | Yes (eaebf6d) |
| Pushed | Yes |
| Work reconciliation | PENDING - v14 migration needs recovery |
