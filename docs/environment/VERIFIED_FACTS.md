# Verified Facts

**Purpose**: Facts we KNOW are true, with verification status.
**Last Updated**: 2025-12-22

---

## Verification Legend

| Symbol | Meaning | Confidence |
|--------|---------|------------|
| ✅ | **VERIFIED** - Directly tested/observed this session | 100% |
| 📋 | **DOCUMENTED** - Recorded during session, not re-verified | 95% |
| ⚠️ | **ASSUMED** - Based on documentation, not directly verified | 70% |
| ❓ | **UNKNOWN** - Needs investigation | 0% |

---

## Work Machine Facts

*Verified: 2025-12-22 Evening (Current Session)*

### User Environment

| Fact | Value | Status | How Verified |
|------|-------|--------|--------------|
| User Profile Path | `C:\Users\stuart.ryan` | ✅ | `whoami` output |
| Username Format | `stuart.ryan` (with period) | ✅ | `whoami` output |
| Admin Rights | **NO** | 📋 | User statement |
| Roaming Profile | Yes (same across work machines) | 📋 | User statement |

### Claude CLI

| Fact | Value | Status | How Verified |
|------|-------|--------|--------------|
| Claude Location | `C:\Users\stuart.ryan\.local\bin\claude.exe` | ✅ | `where claude` |
| Claude Version | 2.0.75 | ✅ | `claude --version` |
| Installation Method | **Standalone .exe** (NOT npm) | ✅ | Path + file check |
| File Type | PE32+ Windows executable | ✅ | `file` command |
| File Size | 234,453,664 bytes | ✅ | `ls -la` |

### Node/npm

| Fact | Value | Status | How Verified |
|------|-------|--------|--------------|
| npm prefix | `C:\Users\stuart.ryan\AppData\Roaming\npm` | ✅ | `npm config get prefix` |
| npmrc location | `C:\Users\stuart.ryan\.npmrc` | ✅ | `npm config list` |
| Node.js version | v24.11.1 | ✅ | `npm config list` |
| Node.js source | WinGet (OpenJS.NodeJS.LTS) | ✅ | npm config path |

### Critical Insight

> **Claude at work is NOT installed via npm.** It's a standalone Windows executable in `.local\bin\`. This was incorrectly assumed in earlier documentation.

---

## Home Machine Facts

*Verified: 2025-12-22 Morning Session*

### User Environment

| Fact | Value | Status | How Verified |
|------|-------|--------|--------------|
| User Profile Path | `C:\Users\StuartRyan` | 📋 | Session log |
| Username Format | `StuartRyan` (no period) | 📋 | Session log |
| Admin Rights | **YES** | 📋 | User statement |

### Claude CLI

| Fact | Value | Status | How Verified |
|------|-------|--------|--------------|
| Claude Location | `C:\Users\StuartRyan\AppData\Roaming\npm\claude.cmd` | 📋 | `where claude` in morning |
| Claude Version | 2.0.75 | 📋 | Morning session |
| Installation Method | **npm global** | 📋 | Path implies npm |
| File Type | .cmd batch wrapper | ⚠️ | Assumed from npm pattern |

### Node/npm

| Fact | Value | Status | How Verified |
|------|-------|--------|--------------|
| npm prefix | `C:\Users\StuartRyan\AppData\Roaming\npm` | ⚠️ | Assumed standard |
| Node.js version | Unknown | ❓ | Not verified |

### To Verify Next Time at Home

- [ ] Exact npm prefix (`npm config get prefix`)
- [ ] Node.js version
- [ ] npmrc contents (if any)
- [ ] Plugin folder name in vault

---

## Codebase Facts

*Verified: 2025-12-22 Evening*

### Source Files

| Fact | Status | How Verified |
|------|--------|--------------|
| v14 migration exists (`13_to_14.ts`) | ✅ | File read |
| Two-row UI in ChatUserInput.tsx | ✅ | File read |
| 3 new selector components exist | ✅ | Files copied |
| Multi-path CLI retry in claudeCode.ts | ✅ | File read |
| `.local/bin/claude.exe` path NOW included | ✅ | Edit made this session |

### Build

| Fact | Status | How Verified |
|------|--------|--------------|
| Build succeeds | ✅ | `npm run build` output |
| main.js size ~8.5MB | ✅ | `ls -la` |
| No TypeScript errors (except DatabaseManager) | ✅ | Build output |

### Git

| Fact | Status | How Verified |
|------|--------|--------------|
| Merge commit created | ✅ | Git commit |
| Pushed to power-composer remote | ✅ | Git push |
| Current branch: main | ✅ | Git status |

---

## Repository Facts

| Repo | URL | Status | Purpose |
|------|-----|--------|---------|
| power-composer | https://github.com/HomeHeartTherapy/power-composer | ✅ Exists | Production |
| obsidian-smart-composer-UPGRADED-two-row-2025.12.19 | https://github.com/HomeHeartTherapy/obsidian-smart-composer-UPGRADED-two-row-2025.12.19 | ✅ Exists | Friday backup |
| obsidian-smart-composer | https://github.com/HomeHeartTherapy/obsidian-smart-composer | ✅ Exists | Morning backup |

---

## Path Detection Requirements

For the Claude CLI to be found on BOTH machines, the code must check these paths (in order):

```typescript
// Windows paths - VERIFIED WORKING
[
  // Work: Standalone installer (VERIFIED 2025-12-22)
  '{USERPROFILE}\\.local\\bin\\claude.exe',

  // Home: npm global (VERIFIED 2025-12-22)
  '{USERPROFILE}\\AppData\\Roaming\\npm\\claude.cmd',

  // Fallbacks (not verified but reasonable)
  '{USERPROFILE}\\npm\\claude.cmd',
  '{USERPROFILE}\\.npm-global\\claude.cmd',
  '{USERPROFILE}\\AppData\\Local\\npm\\claude.cmd',
  '{USERPROFILE}\\claude.cmd',
  '{USERPROFILE}\\bin\\claude.cmd',
  'claude',  // PATH fallback
]
```

---

## Unknown/To Investigate

| Question | Impact | When to Verify |
|----------|--------|----------------|
| Home npm config details | Low | Next home session |
| Plugin folder names at both locations | Medium | Before first live test |
| Obsidian Sync behavior with plugin updates | Medium | First cross-machine sync |
| v14 migration runtime behavior | High | First plugin load |

---

## Update History

| Date | Location | What Was Verified |
|------|----------|-------------------|
| 2025-12-22 Evening | Work | All work machine facts |
| 2025-12-22 Morning | Home | Home CLI location, env var issue |

---

*Trust ✅ facts completely. Verify ⚠️ facts before depending on them.*
