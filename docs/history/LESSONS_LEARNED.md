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

*Add new lessons as they're learned. This document grows with experience.*
