# Lessons Learned

**Purpose**: What worked, what failed, and why. Learn from our mistakes.
**Last Updated**: 2025-12-22

---

## Critical Lessons

### 1. ALWAYS Push Your Work

**What Happened**: Friday's complete working implementation (v14 migration, two-row UI) was never pushed to GitHub. When work resumed on Sunday, we had to do a complex recovery operation.

**Impact**: Lost hours on recovery, risked losing work entirely.

**Prevention**:
- Push at end of every session
- Push before leaving work/home
- Consider a pre-shutdown hook or reminder

**Quote**: *"If it's not pushed, it doesn't exist."*

---

### 2. Verify, Don't Assume

**What Happened**: Morning's documentation assumed Claude at work was installed via npm (`.npm-global`). Actual verification at work revealed it's a standalone `.exe` in `.local\bin\`.

**Impact**: The "fixed" code would still fail at work.

**Prevention**:
- Run actual commands to verify (`where claude`, `npm config get prefix`)
- Document verification method alongside the fact
- Mark unverified facts with ⚠️

**Quote**: *"What you think you know will hurt you. What you verify will save you."*

---

### 3. Freeze Before Merging

**What Happened**: We created frozen backup repos before attempting the merge. This gave us safe restore points.

**Impact**: Confidence to proceed knowing we could recover.

**Pattern**:
1. Create backup repo with current state
2. Push to GitHub
3. Only then proceed with merge
4. If merge fails, start fresh from backup

---

### 4. Different Environments, Different Paths

**What Happened**: Home machine has Claude via npm. Work machine has Claude as standalone exe. Same version, different installation methods.

**Root Cause**:
- Home: Admin rights, standard npm global
- Work: No admin, used standalone installer

**Solution**: Multi-path retry system that checks multiple possible locations.

**Lesson**: Never assume a single path. Always have fallbacks.

---

### 5. Environment Variables Need Expansion

**What Happened**: Original code used `%USERPROFILE%` without expanding it. Windows doesn't auto-expand in Node.js.

**The Bug**:
```typescript
// BROKEN
const path = '%USERPROFILE%\\.local\\bin\\claude.exe'
// %USERPROFILE% stays as literal text!

// FIXED
const userProfile = process.env.USERPROFILE || process.env.HOME || ''
const path = path.join(userProfile, '.local', 'bin', 'claude.exe')
```

**Lesson**: Node.js doesn't expand Windows environment variables. Do it yourself.

---

## What Worked

### Multi-Path Retry System

**Implementation**:
```typescript
private buildPossiblePaths(): string[] {
  return [
    path.join(userProfile, '.local', 'bin', 'claude.exe'),  // Work
    path.join(userProfile, 'AppData', 'Roaming', 'npm', 'claude.cmd'),  // Home
    // ... fallbacks
  ]
}

private async findWorkingPath(): Promise<string> {
  for (const testPath of this.buildPossiblePaths()) {
    if (await this.pathExists(testPath)) {
      return testPath  // Cache this for future calls
    }
  }
}
```

**Why It Works**: Tries paths in order, caches the first working one.

---

### Settings Migrations

**Pattern**: Each schema version gets a migration file.

```typescript
// 13_to_14.ts
export const migrateFrom13To14 = (data) => {
  const newData = { ...data }
  newData.version = 14
  newData.chatModels = getMigratedChatModels(newData, DEFAULT_CHAT_MODELS_V14)
  return newData
}
```

**Why It Works**: Existing users get new features without losing their settings.

---

### Debug Logging

**Pattern**: Log to console what model is actually being used.

```typescript
console.log(`[Claude Code] Model: ${request.model} | Thinking: ${thinkingLabel}`)
```

**Why It Works**: LLMs can't reliably self-identify. Console logging provides ground truth.

---

### stdin Piping

**Pattern**: Pass long prompts via stdin instead of CLI argument.

```typescript
const args = ['--output-format', 'text', '-']  // '-' means read from stdin
child.stdin.write(prompt)
child.stdin.end()
```

**Why It Works**: Bypasses Windows 8191 character command line limit.

---

## What Failed

### Assuming npm for All Machines

**The Assumption**: "Claude is installed via npm, so check npm paths."

**Reality**: Work machine used standalone installer.

**Fix**: Include `.local\bin\` in path list.

---

### Not Pushing Friday's Work

**The Assumption**: "I'll push it when I'm done."

**Reality**: Left work, work stayed local.

**Fix**: Push early, push often.

---

### Single-Path CLI Detection

**The Assumption**: "Everyone installs Claude the same way."

**Reality**: Different install methods on different machines.

**Fix**: Multi-path retry with fallbacks.

---

## Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|------------|
| Guess paths | Verify with `where claude` |
| Assume npm installation | Check actual file location |
| Commit to main directly | Use feature branches |
| Test on one machine only | Test on ALL target machines |
| Trust old documentation | Verify current state |
| Batch up commits | Commit and push frequently |

---

## Patterns That Work

| Pattern | Why |
|---------|-----|
| Freeze before merge | Safe restore point |
| Verify at each location | Ground truth, not assumptions |
| Multi-path detection | Handles different environments |
| Settings migrations | Backward compatibility |
| Debug logging | Verify what's actually happening |
| stdin for prompts | Bypasses CLI limits |
| Document confidence levels | Know what's verified vs assumed |

---

## Recovery Procedures That Saved Us

### 1. Frozen Backup Repos

When Friday's work seemed lost:
1. Found it still existed locally (not pushed)
2. Created new GitHub repo for backup
3. Committed and pushed
4. Now have safe restore point

### 2. Forensic Verification

When assumptions proved wrong:
1. Ran actual commands at work
2. Discovered real CLI location
3. Updated code to match reality
4. Documented verified facts

### 3. Comprehensive Documentation

When context was lost:
1. Created MASTER_SPEC document
2. Marked everything with verification status
3. Future sessions can resume without re-discovery

---

## Quotes to Remember

> *"Slow is smooth, smooth is fast."*
> - Used when deciding to freeze repos before merging

> *"If it's not pushed, it doesn't exist."*
> - After discovering Friday's work wasn't on GitHub

> *"What you verify will save you. What you assume will hurt you."*
> - After discovering wrong CLI path assumptions

> *"Safety over speed."*
> - Guiding principle for this recovery

---

## Lessons from 2025-12-22 Evening Session

### 6. Forked Plugins Need Independent Databases

**What Happened**: Power Composer (forked from Smart Composer) initially shared the same database paths. When both were enabled, Power Composer failed to load with "Failed to load plugin" error.

**Root Cause**: Both plugins tried to lock `.smtcmp_vector_db.tar.gz` simultaneously. First one wins, second crashes.

**Fix**:
```typescript
// OLD (shared)
export const PGLITE_DB_PATH = '.smtcmp_vector_db.tar.gz'
export const ROOT_DIR = '.smtcmp_json_db'

// NEW (independent)
export const PGLITE_DB_PATH = '.pwrcmp_vector_db.tar.gz'
export const ROOT_DIR = '.pwrcmp_json_db'
```

**Lesson**: When forking a plugin, change ALL identifiers: database paths, view types, command IDs.

---

### 7. Copy Data, Don't Move It

**What Happened**: When separating databases, we copied existing data to new locations rather than moving it.

**Why This Was Right**:
- User keeps their Smart Composer data intact
- Power Composer starts with full history
- No data loss risk
- Can delete old data later if desired

**Pattern**:
```bash
# COPY, don't move
cp -r .smtcmp_json_db .pwrcmp_json_db
cp .smtcmp_vector_db.tar.gz .pwrcmp_vector_db.tar.gz
```

---

### 8. Test the Actual Plugin, Not Just the Code

**What Happened**: Build succeeded, code looked correct, but plugin failed to load in Obsidian due to database conflict that only manifests at runtime.

**Lesson**: Always test in the actual Obsidian environment. Build success ≠ plugin works.

**Testing Checklist**:
1. ✅ Build succeeds (`npm run build`)
2. ✅ Deploy to Obsidian vault
3. ✅ Plugin enables without error
4. ✅ Console shows correct initialization
5. ✅ Core functionality works (Claude Code tested)

---

### 9. Claude Code Provider: Tested & Working

**Verified 2025-12-22**:
- ✅ Multi-path CLI detection finds `claude.exe` at work
- ✅ Haiku 4.5 with low thinking works
- ✅ Opus 4.5 with ultrathink works
- ✅ No API key needed (uses Max/Pro subscription)

**Expected at Home**:
- Path #2 (`AppData\Roaming\npm\claude.cmd`) should be found
- Same models should work

**If It Fails at Home**:
```bash
where claude
# Add output to buildPossiblePaths() in claudeCode.ts
```

---

## Critical Discovery: The "fs" Error is Harmless

**The Error**:
```
Failed to fetch extension: vector TypeError: Failed to resolve module specifier 'fs'
```

**What It Means**: PGlite trying to load vector extension has a cosmetic error.

**Impact**: NONE. Database still initializes. Plugin works fine.

**Action**: Ignore it. It's noise from the PGlite library.

---

*Add new lessons as they're learned. This document grows with experience.*
