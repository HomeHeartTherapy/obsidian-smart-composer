# Smart Composer Work Merge - Breadcrumb Trail

**Session Date**: 2025-12-22 (Home Machine)
**Purpose**: Track every file touched and what was done

---

## Files Modified

### Source Code

| File | Action | Details |
|------|--------|---------|
| `src/core/llm/claudeCode.ts` | **MODIFIED** | Added multi-path CLI detection, env var expansion, stdin piping, shell:true for Windows |

#### claudeCode.ts Changes Summary
```
+ expandEnvVars()           - Expands %USERPROFILE% etc.
+ possibleCliPaths          - Array of 7 paths to try
+ currentPathIndex          - Tracks which path we're on
+ buildPossiblePaths()      - Returns platform-specific paths
+ tryNextPath()             - Advances to next path on ENOENT
+ cacheWorkingPath()        - Caches working path after success
~ getCliPath()              - Now uses multi-path retry
~ executeClaudeCli()        - Uses stdin for prompt, shell:true, retry logic
```

---

### Documentation Created

| File | Location | Purpose |
|------|----------|---------|
| `2025-12-22_HOME_SESSION.md` | `docs/_sessions/` | Full session log with problem/solution |
| `WORK_RECONCILIATION_URGENT.md` | `docs/_ai/` | Instructions for Claude at work |
| `SMART_COMPOSER_WORK_MERGE_MASTER.md` | `docs/_ai/` | Comprehensive merge reference |
| `SMART_COMPOSER_WORK_MERGE_BREADCRUMBS.md` | `docs/_ai/` | This file - breadcrumb trail |

---

### Plugin Files

| File | Action | Details |
|------|--------|---------|
| `main.js` | **BUILT & COPIED** | Built from source, copied to wcm-sync plugin folder |
| `data.json` | **CLEARED** | Removed `cliPath` setting to enable auto-detection |

#### Copy Locations
- Source: `c:\obsidian-smart-composer-homeheart\main.js`
- Destination: `C:\wcm-sync\.obsidian\plugins\smart-composer\main.js`

---

### Mirror Files at c:\claude\

| File | Purpose |
|------|---------|
| `2025-12-22_HOME_SESSION.md` | Copy of session log |
| `WORK_RECONCILIATION_URGENT.md` | Copy of reconciliation notes |
| `SMART_COMPOSER_WORK_MERGE_MASTER.md` | Master reference doc |
| `SMART_COMPOSER_WORK_MERGE_BREADCRUMBS.md` | This breadcrumb trail |

---

## Git Commits (in order)

| Commit | Message | Files |
|--------|---------|-------|
| `110f6f3` | Add auto-detection for Claude Code CLI path | claudeCode.ts |
| `56cb529` | Fix Claude Code CLI execution on Windows | claudeCode.ts |
| `38a699e` | Add session documentation and work reconciliation notes | docs/_sessions/, docs/_ai/ |
| `eaebf6d` | Add multi-path retry for Claude Code CLI detection | claudeCode.ts |
| `ed80546` | Update documentation with multi-path retry details | docs/_sessions/, docs/_ai/ |
| `5512a14` | Add comprehensive work merge master reference | docs/_ai/ |

---

## What Each Commit Fixed

### 110f6f3 - Auto-detection
- Problem: `%USERPROFILE%` not expanded
- Fix: Added `expandEnvVars()` and basic path construction

### 56cb529 - Windows Execution
- Problem: `spawn EINVAL` on Windows
- Fix: Added `shell: true` for .cmd files

### 38a699e - Documentation
- Created session log and work reconciliation notes

### eaebf6d - Multi-path Retry
- Problem: Different npm configs between machines
- Fix: Try 7 paths, retry on ENOENT, cache working path

### ed80546 - Doc Updates
- Updated docs with new console output format

### 5512a14 - Master Reference
- Created comprehensive merge guide with work context

---

## Key Technical Decisions

### Why stdin instead of CLI argument?
Windows has ~8191 character command line limit. Long prompts would fail.
```typescript
// Before: spawn(cli, ['-p', prompt])  // FAILS on long prompts
// After:  spawn(cli, ['-p', '-'])     // Read from stdin
child.stdin.write(prompt)
child.stdin.end()
```

### Why shell:true on Windows?
.cmd batch files can't be executed directly by Node.js spawn.
```typescript
shell: process.platform === 'win32'  // Required for .cmd
```

### Why multi-path retry instead of detection?
`fs.existsSync()` behaves unexpectedly in Electron. Direct spawn with ENOENT retry is more reliable.

### Why 7 specific paths?
Cover all common npm configurations:
1. Standard admin install: `AppData\Roaming\npm`
2. Custom prefix #1: `~\npm`
3. Custom prefix #2: `~\.npm-global` (user's work setup)
4. Local install: `AppData\Local\npm`
5. Profile root: `~\claude.cmd`
6. Bin folder: `~\bin`
7. PATH fallback: `claude`

---

## Data Flow

```
User sends message
    ↓
Smart Composer formats prompt
    ↓
ClaudeCodeProvider.streamResponse()
    ↓
executeClaudeCli()
    ↓
getCliPath() → buildPossiblePaths() → return paths[currentIndex]
    ↓
spawn(path, args, {shell: true, stdio: ['pipe', ...]})
    ↓
Write prompt to stdin
    ↓
On ENOENT → tryNextPath() → retry
On success → cacheWorkingPath()
    ↓
Return response to user
```

---

## Files NOT Modified (but relevant)

| File | Why Relevant |
|------|--------------|
| `src/settings/schema/migrations/index.ts` | Has VERSION=13, work has VERSION=14 |
| `src/settings/schema/migrations/13_to_14.ts` | **MISSING** - exists at work only |

---

## Recovery Information

### If you need to find unpushed work changes:
```bash
git status
git stash list
git log --all --oneline
git reflog
```

### If you need to recreate the session:
1. Start with `c:\claude\SMART_COMPOSER_WORK_MERGE_MASTER.md`
2. Reference `c:\claude\2025-12-22_HOME_SESSION.md` for details
3. Check repo at `c:\obsidian-smart-composer-homeheart\docs\_ai\`

### If you need to revert home changes:
```bash
git log --oneline
git reset --hard 4a7b628  # Before any home changes
```

---

## Session Timeline

| Time | Action |
|------|--------|
| Session Start | Analyzed active plugin vs homeheart fork |
| | Discovered v14 migration mismatch |
| | Found Claude Code "not installed" error |
| | Identified %USERPROFILE% expansion bug |
| | Added expandEnvVars() - still failed |
| | Added shell:true - spawn EINVAL fixed |
| | Added stdin piping - cmd line limit fixed |
| | SUCCESS - Claude Code working |
| | Created session documentation |
| | Added multi-path retry for work compatibility |
| | Created master reference and breadcrumbs |
| Session End | All pushed, mirrors created at c:\claude\ |

---

## Verification Commands

```bash
# Check all commits are pushed
git log origin/main..HEAD  # Should be empty

# Check file exists at work path
dir "C:\Users\stuart.ryan\.npm-global\claude.cmd"

# Check npm prefix at work
npm config get prefix

# Check Claude is installed
where claude
claude --version
```

---

This breadcrumb trail is complete. Use `SMART_COMPOSER_WORK_MERGE_MASTER.md` for the action plan.
