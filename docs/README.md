# Power Composer Documentation

**Single Source of Truth** for the Power Composer Obsidian plugin.

**Repository**: https://github.com/HomeHeartTherapy/power-composer
**Last Updated**: 2025-12-22

---

## Quick Start

| If you need to... | Read this |
|-------------------|-----------|
| Understand the project in 30 seconds | [OVERVIEW.md](./OVERVIEW.md) |
| Start working immediately | [QUICK_START.md](./QUICK_START.md) |
| Do the merge (if incomplete) | [../MERGE_GUIDE.md](../MERGE_GUIDE.md) |
| Debug a problem | [troubleshooting/](./troubleshooting/) |
| Understand environment differences | [environment/](./environment/) |

---

## Document Map

```
docs/
├── README.md                    <- YOU ARE HERE
├── OVERVIEW.md                  <- 30-second project summary
├── QUICK_START.md               <- Start working immediately
│
├── architecture/                <- How the system works
│   ├── SYSTEM_ARCHITECTURE.md   <- High-level architecture
│   ├── ADR.md                   <- Architecture Decision Records (18 ADRs)
│   ├── CLAUDE_CODE_PROVIDER.md  <- Claude Code CLI integration spec
│   └── PROVIDER_ARCHITECTURE.md <- LLM provider system
│
├── environment/                 <- Machine-specific configurations
│   ├── VERIFIED_FACTS.md        <- What we KNOW is true (verified)
│   ├── HOME_ENVIRONMENT.md      <- Home machine specifics
│   ├── WORK_ENVIRONMENT.md      <- Work machine specifics
│   └── PATH_RESOLUTION.md       <- How CLI paths are detected
│
├── development/                 <- How to develop
│   ├── SETUP.md                 <- Development environment setup
│   ├── BUILD_DEPLOY.md          <- Building and deploying
│   ├── MIGRATIONS.md            <- Settings migrations guide
│   ├── COMMON_TASKS.md          <- How to do common things
│   └── GOTCHAS.md               <- Pitfalls to avoid
│
├── troubleshooting/             <- When things go wrong
│   ├── DEBUGGING.md             <- General debugging guide
│   ├── CLI_NOT_FOUND.md         <- Claude CLI detection issues
│   ├── MODELS_NOT_APPEARING.md  <- Model dropdown issues
│   └── CACHE_ISSUES.md          <- Obsidian cache problems
│
├── history/                     <- Project history
│   ├── CHANGELOG.md             <- Version history
│   ├── SESSION_LOG.md           <- Development session notes
│   ├── LESSONS_LEARNED.md       <- What worked, what didn't
│   └── FROZEN_STATES.md         <- Backup repos documentation
│
└── reference/                   <- Technical reference
    ├── MODELS.md                <- All supported models
    ├── SETTINGS_SCHEMA.md       <- Settings structure
    ├── FILE_STRUCTURE.md        <- Codebase file map
    └── EXTERNAL_LINKS.md        <- External documentation links
```

---

## Navigation Index

### By Topic

| Topic | Documents |
|-------|-----------|
| **Getting Started** | [OVERVIEW](./OVERVIEW.md), [QUICK_START](./QUICK_START.md) |
| **Architecture** | [SYSTEM_ARCHITECTURE](./architecture/SYSTEM_ARCHITECTURE.md), [ADR](./architecture/ADR.md) |
| **Claude Code** | [CLAUDE_CODE_PROVIDER](./architecture/CLAUDE_CODE_PROVIDER.md), [PATH_RESOLUTION](./environment/PATH_RESOLUTION.md) |
| **Environment** | [VERIFIED_FACTS](./environment/VERIFIED_FACTS.md), [HOME](./environment/HOME_ENVIRONMENT.md), [WORK](./environment/WORK_ENVIRONMENT.md) |
| **Development** | [SETUP](./development/SETUP.md), [BUILD_DEPLOY](./development/BUILD_DEPLOY.md), [MIGRATIONS](./development/MIGRATIONS.md) |
| **Troubleshooting** | [DEBUGGING](./troubleshooting/DEBUGGING.md), [CLI_NOT_FOUND](./troubleshooting/CLI_NOT_FOUND.md) |
| **History** | [CHANGELOG](./history/CHANGELOG.md), [SESSION_LOG](./history/SESSION_LOG.md), [LESSONS_LEARNED](./history/LESSONS_LEARNED.md) |

### By Role

| Role | Start Here |
|------|------------|
| **New AI Assistant** | [OVERVIEW](./OVERVIEW.md) → [VERIFIED_FACTS](./environment/VERIFIED_FACTS.md) → [QUICK_START](./QUICK_START.md) |
| **Human Developer** | [OVERVIEW](./OVERVIEW.md) → [SETUP](./development/SETUP.md) → [BUILD_DEPLOY](./development/BUILD_DEPLOY.md) |
| **Debugger** | [VERIFIED_FACTS](./environment/VERIFIED_FACTS.md) → [DEBUGGING](./troubleshooting/DEBUGGING.md) |
| **Historian** | [SESSION_LOG](./history/SESSION_LOG.md) → [LESSONS_LEARNED](./history/LESSONS_LEARNED.md) |

### By Task

| Task | Read |
|------|------|
| Add a new model | [MIGRATIONS](./development/MIGRATIONS.md), [COMMON_TASKS](./development/COMMON_TASKS.md) |
| Fix CLI detection | [PATH_RESOLUTION](./environment/PATH_RESOLUTION.md), [CLI_NOT_FOUND](./troubleshooting/CLI_NOT_FOUND.md) |
| Understand past decisions | [ADR](./architecture/ADR.md), [LESSONS_LEARNED](./history/LESSONS_LEARNED.md) |
| Deploy to Obsidian | [BUILD_DEPLOY](./development/BUILD_DEPLOY.md), [CACHE_ISSUES](./troubleshooting/CACHE_ISSUES.md) |

---

## Related Repositories

| Repo | Purpose | Status |
|------|---------|--------|
| [power-composer](https://github.com/HomeHeartTherapy/power-composer) | **Primary** - Production code | Active |
| [obsidian-smart-composer-UPGRADED-two-row-2025.12.19](https://github.com/HomeHeartTherapy/obsidian-smart-composer-UPGRADED-two-row-2025.12.19) | Friday 12/19 frozen backup | Archived |
| [obsidian-smart-composer](https://github.com/HomeHeartTherapy/obsidian-smart-composer) | Morning 12/22 frozen backup | Archived |
| [glowingjade/obsidian-smart-composer](https://github.com/glowingjade/obsidian-smart-composer) | Upstream (not ours) | Reference |

---

## Quick Reference

### Build Commands

```bash
npm install --legacy-peer-deps  # Install dependencies
npm run build                    # Build plugin
npm run dev                      # Watch mode
```

### Key Paths

| Machine | Claude CLI |
|---------|------------|
| **Work** | `C:\Users\stuart.ryan\.local\bin\claude.exe` |
| **Home** | `C:\Users\StuartRyan\AppData\Roaming\npm\claude.cmd` |

### Current Versions

| Component | Version |
|-----------|---------|
| Plugin | Power Composer |
| Settings Schema | 14 |
| Claude CLI | 2.0.75 |

---

*This documentation is version-controlled with the code. When in doubt, trust this over external documents.*
