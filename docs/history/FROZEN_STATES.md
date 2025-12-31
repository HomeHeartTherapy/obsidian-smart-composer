# Frozen States Documentation

**Purpose**: Document all backup repositories and their contents.
**Created**: 2025-12-22

---

## Overview

Three frozen states exist as safety backups. These are READ-ONLY references - do not modify them.

---

## 1. Friday Frozen (2025-12-19)

**The Gold Standard for Features**

### Identity

| Field | Value |
|-------|-------|
| GitHub URL | https://github.com/HomeHeartTherapy/obsidian-smart-composer-UPGRADED-two-row-2025.12.19 |
| Local Path | `C:\Projects\obsidian-smart-composer-homeheart-UPGRADED` |
| Frozen Date | 2025-12-22 (pushed Sunday, contains Friday state) |
| Key Commit | `5757ed1` |

### What It Contains

| Feature | Status |
|---------|--------|
| v14 settings migration | ✅ Exists |
| Two-row UI layout | ✅ Exists |
| ProviderSelect.tsx | ✅ Exists |
| ConnectionTypeSelect.tsx | ✅ Exists |
| ThinkingSelect.tsx | ✅ Exists |
| Two-row CSS styles | ✅ Exists |
| Extended Thinking models (API) | ✅ Exists |
| Claude Code provider | ✅ Exists |
| 20+ documentation files | ✅ Exists |

### What It's Missing

| Feature | Status |
|---------|--------|
| Multi-path CLI detection | ❌ Not present |
| Env var expansion | ❌ Not present |
| stdin piping | ❌ Not present |
| shell:true for Windows | ❌ Not present |
| `.local/bin/` path | ❌ Not present |

### Known Issues

- Would NOT work at home (no path detection)
- Would NOT work at work (different CLI location)
- Worked at work on Friday because path was hardcoded to work location

### Use Case

Use this repo to reference:
- How v14 migration was implemented
- How two-row UI components are structured
- The complete documentation set
- Claude Code provider original implementation

---

## 2. Morning Frozen (2025-12-22 AM)

**The Gold Standard for CLI Detection**

### Identity

| Field | Value |
|-------|-------|
| GitHub URL | https://github.com/HomeHeartTherapy/power-composer |
| Also at | https://github.com/HomeHeartTherapy/obsidian-smart-composer |
| Local Path | `C:\Projects\power-composer` (before merge) |
| Frozen Date | 2025-12-22 morning |
| Key Commit | `563e4ec` |

### What It Contains

| Feature | Status |
|---------|--------|
| Multi-path CLI retry | ✅ Exists |
| Env var expansion | ✅ Exists |
| stdin piping | ✅ Exists |
| shell:true for Windows | ✅ Exists |
| Plugin renamed to Power Composer | ✅ Exists |
| Path caching | ✅ Exists |

### What It's Missing

| Feature | Status |
|---------|--------|
| v14 migration | ❌ Not present |
| Two-row UI | ❌ Not present |
| New selector components | ❌ Not present |
| `.local/bin/` path | ❌ Not present |

### Known Issues

- Missing all Friday's UI features
- Multi-path retry doesn't include `.local/bin/` (work location)
- Worked at home because paths included npm location

### Use Case

Use this repo to reference:
- How multi-path detection was implemented
- How env var expansion works
- stdin piping pattern

---

## 3. Merged State (2025-12-22 Evening)

**The Current Production Code**

### Identity

| Field | Value |
|-------|-------|
| GitHub URL | https://github.com/HomeHeartTherapy/power-composer |
| Local Path | `C:\Projects\power-composer` |
| Key Commit | Merge commit from this session |

### What It Contains

**From Friday:**
- v14 settings migration
- Two-row UI layout
- All selector components
- Two-row CSS
- Documentation

**From Morning:**
- Multi-path CLI retry
- Env var expansion
- stdin piping
- shell:true

**New (This Session):**
- `.local/bin/claude.exe` path added
- Updated documentation
- Comprehensive docs/ folder

### Status

- ✅ Build succeeds
- ✅ Pushed to GitHub
- ⏳ Needs live testing in Obsidian

---

## Comparison Table

| Feature | Friday | Morning | Merged |
|---------|--------|---------|--------|
| v14 migration | ✅ | ❌ | ✅ |
| Two-row UI | ✅ | ❌ | ✅ |
| Selector components | ✅ | ❌ | ✅ |
| Multi-path CLI | ❌ | ✅ | ✅ |
| Env var expansion | ❌ | ✅ | ✅ |
| stdin piping | ❌ | ✅ | ✅ |
| shell:true | ❌ | ✅ | ✅ |
| `.local/bin/` path | ❌ | ❌ | ✅ |
| Works at home | ❌ | ✅ | ✅ |
| Works at work | ✅* | ❌ | ✅ |
| Full documentation | ✅ | ⚠️ | ✅ |

*Friday worked at work because of hardcoded path that matched work location by accident.

---

## How to Access

### Clone Friday Frozen
```bash
git clone https://github.com/HomeHeartTherapy/obsidian-smart-composer-UPGRADED-two-row-2025.12.19
```

### Clone Morning Frozen
```bash
git clone https://github.com/HomeHeartTherapy/obsidian-smart-composer
```

### Clone Merged/Current
```bash
git clone https://github.com/HomeHeartTherapy/power-composer
```

---

## Recovery Scenarios

### "I need to see how v14 migration was originally written"
→ Look at Friday frozen: `src/settings/schema/migrations/13_to_14.ts`

### "I need to see how multi-path detection was implemented"
→ Look at Morning frozen: `src/core/llm/claudeCode.ts`

### "I need to start completely fresh"
→ Clone merged state and continue from there

### "Everything is broken, need to go back"
→ Clone Friday frozen for features OR Morning frozen for CLI detection

---

## Important Notes

1. **Do NOT modify frozen repos** - They are historical snapshots
2. **All development happens in power-composer** - The merged state
3. **Frozen repos are insurance** - Only use them for reference or recovery
4. **Morning frozen exists in TWO places** - `power-composer` and `obsidian-smart-composer` were identical at that point

---

*These frozen states saved us. Maintain them carefully.*
