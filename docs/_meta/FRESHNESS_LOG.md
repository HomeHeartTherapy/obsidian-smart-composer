# Documentation Freshness Log

Track documentation currency and update history.

---

## Purpose

This log tracks when each document was last reviewed for accuracy. Documentation can become stale as code evolves. Regular freshness checks ensure documentation remains useful.

---

## Freshness Status

| Status | Meaning |
|--------|---------|
| FRESH | Reviewed within 30 days, accurate |
| STALE | Not reviewed in 30+ days, may be outdated |
| OUTDATED | Known to be inaccurate, needs update |
| ARCHIVED | No longer maintained, kept for reference |

---

## Document Status

### Root Level Documents

| Document | Last Review | Status | Reviewer | Notes |
|----------|-------------|--------|----------|-------|
| README.md | 2024-12-18 | FRESH | AI | Initial creation |
| ARCHITECTURE.md | 2024-12-18 | FRESH | AI | Comprehensive architecture doc |
| ADR.md | 2024-12-19 | FRESH | AI | 17 architecture decisions (added ADR-016, ADR-017) |
| API_REFERENCE.md | 2024-12-18 | FRESH | AI | Full type documentation |
| CHANGELOG.md | 2024-12-19 | FRESH | AI | **NEW** - Version history |
| CLAUDE_CODE_PROVIDER_SPEC.md | 2024-12-19 | FRESH | AI | Updated to v2.1 with debug logging |
| COMPONENT_SPEC.md | 2024-12-18 | FRESH | AI | React component hierarchy |
| DATABASE_SPEC.md | 2024-12-18 | FRESH | AI | PGlite/pgvector details |
| FLOW_DIAGRAMS.md | 2024-12-18 | FRESH | AI | User and data flows |
| INSTALLATION_GUIDE_WINDOWS.md | 2024-12-18 | FRESH | AI | Comprehensive Windows setup |
| PRD.md | 2024-12-18 | FRESH | AI | Product requirements |
| ROADMAP.md | 2024-12-19 | FRESH | AI | **NEW** - Future plans |
| DOCUMENTATION_REFERENCES.md | 2024-12-18 | FRESH | AI | 100+ external doc links |

### AI Context (docs/_ai/)

| Document | Last Review | Status | Reviewer | Notes |
|----------|-------------|--------|----------|-------|
| CONTEXT_PRIMER.md | 2024-12-18 | FRESH | AI | First-read for AI sessions |
| CODEBASE_MAP.md | 2024-12-18 | FRESH | AI | File-by-file guide |
| COMMON_TASKS.md | 2024-12-18 | FRESH | AI | Step-by-step procedures |
| GOTCHAS.md | 2024-12-18 | FRESH | AI | Known pitfalls |

### Index (docs/_index/)

| Document | Last Review | Status | Reviewer | Notes |
|----------|-------------|--------|----------|-------|
| MASTER_INDEX.md | 2024-12-18 | FRESH | AI | Searchable index |
| QUICK_REFERENCE.md | 2024-12-18 | FRESH | AI | Cheat sheet |
| SEARCH_TAGS.json | 2024-12-18 | FRESH | AI | Machine-readable index |

### Human Onboarding (docs/_human/)

| Document | Last Review | Status | Reviewer | Notes |
|----------|-------------|--------|----------|-------|
| GETTING_STARTED.md | 2024-12-18 | FRESH | AI | Setup guide |
| GLOSSARY.md | 2024-12-18 | FRESH | AI | Term definitions |
| FAQ.md | 2024-12-18 | FRESH | AI | Common questions |

### Maintenance (docs/_meta/)

| Document | Last Review | Status | Reviewer | Notes |
|----------|-------------|--------|----------|-------|
| FRESHNESS_LOG.md | 2024-12-18 | FRESH | AI | This document |
| PRIORITY_MATRIX.md | 2024-12-18 | FRESH | AI | Reading order guide |

---

## Update History

### December 2024

**2024-12-19 (Continued)**: Two-Row UI Layout Implementation
- Implemented VS Code Copilot-style two-row UI layout
- Created new components: ProviderSelect, ConnectionTypeSelect, ThinkingSelect
- Updated ChatUserInput.tsx for two-row integration
- Added CSS styles for Radix-based dropdowns
- Created UI_UPGRADE_SPEC.md v2.0 design specification
- Added ADR-018 (Two-Row UI Design)
- Built and deployed to wcm-sync vault (manual migration v12→v14)
- Reconstructed THREAD.md after context compaction
- Updated all documentation to parity

**2024-12-19 (Earlier)**: Debug Logging & Extended Thinking
- Added debug logging to Anthropic and Claude Code providers
- Created CHANGELOG.md with version history
- Created ROADMAP.md with future plans and technical debt
- Updated ADR.md with ADR-016 (Console Debug Logging) and ADR-017 (Extended Thinking Variants)
- Updated CLAUDE_CODE_PROVIDER_SPEC.md to v2.1 with debug logging section
- Added Anthropic API Extended Thinking variants (9 new models)
- Added settings migration v13→v14
- Human-readable console output for model verification

**2024-12-18**: Initial documentation creation
- Created complete documentation suite
- 20+ documents covering architecture, API, components, database
- AI context documents for stateless threads
- Human onboarding documents
- Index and navigation documents
- Meta/maintenance documents

---

## Review Schedule

### Monthly Reviews

Documents that should be reviewed monthly:
- QUICK_REFERENCE.md (version numbers change)
- GOTCHAS.md (new issues discovered)
- FAQ.md (new questions arise)

### Quarterly Reviews

Documents that should be reviewed quarterly:
- ARCHITECTURE.md
- COMPONENT_SPEC.md
- DATABASE_SPEC.md
- API_REFERENCE.md

### As-Needed Reviews

Documents to review when related code changes:
- ADR.md (when new decisions made)
- CODEBASE_MAP.md (when file structure changes)
- COMMON_TASKS.md (when procedures change)
- DOCUMENTATION_REFERENCES.md (when dependencies change)

---

## Freshness Check Procedure

When reviewing a document:

1. **Read the document** completely
2. **Verify code references** still exist at stated locations
3. **Test code examples** if applicable
4. **Check version numbers** against package.json
5. **Update content** if anything is wrong
6. **Update this log** with review date and status

---

## Staleness Alerts

Documents approaching staleness (>25 days since review):

*None currently - all documents freshly created*

---

## Maintenance Notes

### When Adding New Documents

1. Add entry to this freshness log
2. Add to MASTER_INDEX.md
3. Add tags to SEARCH_TAGS.json
4. Set initial status to FRESH

### When Removing Documents

1. Change status to ARCHIVED
2. Update MASTER_INDEX.md
3. Remove from SEARCH_TAGS.json
4. Move file to docs/_archived/ (if keeping)

### When Code Changes

If code changes affect documentation:
1. Identify affected documents
2. Update document content
3. Update freshness status to FRESH
4. Log the update in history section

---

*Last Updated: 2024-12-19*
