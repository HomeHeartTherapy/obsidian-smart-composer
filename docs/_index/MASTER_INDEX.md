# Master Documentation Index

Complete searchable index of all documentation for the Obsidian Smart Composer HomeHeart project.

---

## How to Use This Index

- **Ctrl+F / Cmd+F** to search for any term
- Each entry links to local documentation
- Tags help AI systems find relevant docs
- Priority indicates importance (P0 = must read)

---

## Quick Links

| Document | Purpose | Audience |
|----------|---------|----------|
| [CONTEXT_PRIMER](../_ai/CONTEXT_PRIMER.md) | First read for AI sessions | AI |
| [CODEBASE_MAP](../_ai/CODEBASE_MAP.md) | File-by-file guide | AI + Human |
| [GOTCHAS](../_ai/GOTCHAS.md) | Known pitfalls | AI + Human |
| [GETTING_STARTED](../_human/GETTING_STARTED.md) | Day-1 developer guide | Human |
| [QUICK_REFERENCE](QUICK_REFERENCE.md) | Cheat sheet | Everyone |

---

## By Category

### Project Documentation (Root Level)

| Document | Description | Tags | Priority |
|----------|-------------|------|----------|
| [README.md](../../README.md) | Project overview | #overview | P2 |
| [ARCHITECTURE.md](../../ARCHITECTURE.md) | System architecture | #architecture #diagrams | P0 |
| [ADR.md](../../ADR.md) | Architecture decisions | #decisions #rationale | P0 |
| [API_REFERENCE.md](../../API_REFERENCE.md) | Type definitions, APIs | #types #api | P1 |
| [COMPONENT_SPEC.md](../../COMPONENT_SPEC.md) | React components | #react #components | P1 |
| [DATABASE_SPEC.md](../../DATABASE_SPEC.md) | Database layer | #database #pglite | P1 |
| [FLOW_DIAGRAMS.md](../../FLOW_DIAGRAMS.md) | User/data flows | #flows #diagrams | P2 |
| [PRD.md](../../PRD.md) | Product requirements | #product #requirements | P2 |
| [DOCUMENTATION_REFERENCES.md](../../DOCUMENTATION_REFERENCES.md) | External doc links | #external #references | P2 |

### AI Context (docs/_ai/)

| Document | Description | Tags | Priority |
|----------|-------------|------|----------|
| [CONTEXT_PRIMER.md](../_ai/CONTEXT_PRIMER.md) | First read for AI | #ai #primer | P0 |
| [CODEBASE_MAP.md](../_ai/CODEBASE_MAP.md) | File navigation | #files #map | P0 |
| [COMMON_TASKS.md](../_ai/COMMON_TASKS.md) | How-to guides | #howto #tasks | P1 |
| [GOTCHAS.md](../_ai/GOTCHAS.md) | Pitfalls | #pitfalls #bugs | P1 |

### Human Onboarding (docs/_human/)

| Document | Description | Tags | Priority |
|----------|-------------|------|----------|
| [GETTING_STARTED.md](../_human/GETTING_STARTED.md) | Quick start | #setup #onboarding | P0 |
| [GLOSSARY.md](../_human/GLOSSARY.md) | Term definitions | #terms #glossary | P2 |
| [FAQ.md](../_human/FAQ.md) | Common questions | #faq #help | P2 |

### Maintenance (docs/_meta/)

| Document | Description | Tags | Priority |
|----------|-------------|------|----------|
| [FRESHNESS_LOG.md](../_meta/FRESHNESS_LOG.md) | Doc currency | #maintenance | P3 |
| [PRIORITY_MATRIX.md](../_meta/PRIORITY_MATRIX.md) | What to read when | #priority | P2 |

---

## By Topic

### Database Layer

| Topic | Document | Tags |
|-------|----------|------|
| PGlite overview | [DATABASE_SPEC.md](../../DATABASE_SPEC.md) | #pglite #wasm |
| Schema definition | [DATABASE_SPEC.md#schema](../../DATABASE_SPEC.md) | #schema #drizzle |
| Vector search | [DATABASE_SPEC.md#vectors](../../DATABASE_SPEC.md) | #vectors #pgvector #hnsw |
| Migrations | [COMMON_TASKS.md#database](../_ai/COMMON_TASKS.md) | #migrations |
| Gotchas | [GOTCHAS.md#database](../_ai/GOTCHAS.md) | #pitfalls |

### LLM Integration

| Topic | Document | Tags |
|-------|----------|------|
| Provider architecture | [ARCHITECTURE.md](../../ARCHITECTURE.md) | #llm #providers |
| Adding providers | [COMMON_TASKS.md#providers](../_ai/COMMON_TASKS.md) | #howto |
| API reference | [API_REFERENCE.md#llm](../../API_REFERENCE.md) | #api #types |
| Gotchas | [GOTCHAS.md#llm](../_ai/GOTCHAS.md) | #pitfalls |

### React Components

| Topic | Document | Tags |
|-------|----------|------|
| Component hierarchy | [COMPONENT_SPEC.md](../../COMPONENT_SPEC.md) | #react #hierarchy |
| Chat components | [COMPONENT_SPEC.md#chat](../../COMPONENT_SPEC.md) | #chat #ui |
| Context providers | [ARCHITECTURE.md#contexts](../../ARCHITECTURE.md) | #context #state |
| Lexical editor | [COMPONENT_SPEC.md#lexical](../../COMPONENT_SPEC.md) | #lexical #editor |

### Settings System

| Topic | Document | Tags |
|-------|----------|------|
| Settings schema | [API_REFERENCE.md#settings](../../API_REFERENCE.md) | #settings #zod |
| Migrations | [COMMON_TASKS.md#settings](../_ai/COMMON_TASKS.md) | #migrations |
| Adding settings | [COMMON_TASKS.md#add-setting](../_ai/COMMON_TASKS.md) | #howto |

### MCP Integration

| Topic | Document | Tags |
|-------|----------|------|
| MCP overview | [ARCHITECTURE.md#mcp](../../ARCHITECTURE.md) | #mcp #tools |
| Tool handling | [FLOW_DIAGRAMS.md#mcp](../../FLOW_DIAGRAMS.md) | #tools #flows |
| Gotchas | [GOTCHAS.md#mcp](../_ai/GOTCHAS.md) | #pitfalls |

---

## By Use Case

### "I need to add a new LLM provider"
1. [ARCHITECTURE.md](../../ARCHITECTURE.md) - Understand provider architecture
2. [COMMON_TASKS.md#add-provider](../_ai/COMMON_TASKS.md) - Step-by-step guide
3. [API_REFERENCE.md#llm-provider-apis](../../API_REFERENCE.md) - Interface to implement
4. [GOTCHAS.md#llm](../_ai/GOTCHAS.md) - Known issues

### "I need to fix a database issue"
1. [DATABASE_SPEC.md](../../DATABASE_SPEC.md) - Database architecture
2. [GOTCHAS.md#database](../_ai/GOTCHAS.md) - Common issues
3. [COMMON_TASKS.md#debug](../_ai/COMMON_TASKS.md) - Debug procedures

### "I need to add a new setting"
1. [COMMON_TASKS.md#add-setting](../_ai/COMMON_TASKS.md) - Step-by-step
2. [API_REFERENCE.md#settings](../../API_REFERENCE.md) - Schema types
3. [GOTCHAS.md#settings](../_ai/GOTCHAS.md) - Migration pitfalls

### "I need to modify the UI"
1. [COMPONENT_SPEC.md](../../COMPONENT_SPEC.md) - Component documentation
2. [CODEBASE_MAP.md](../_ai/CODEBASE_MAP.md) - Find relevant files
3. [GOTCHAS.md#react](../_ai/GOTCHAS.md) - React pitfalls

### "I'm debugging a crash"
1. [GOTCHAS.md](../_ai/GOTCHAS.md) - Known issues first
2. [CODEBASE_MAP.md](../_ai/CODEBASE_MAP.md) - Navigate to relevant code
3. [COMMON_TASKS.md#debug](../_ai/COMMON_TASKS.md) - Debug procedures

### "I'm onboarding to this project"
1. [GETTING_STARTED.md](../_human/GETTING_STARTED.md) - Setup
2. [CONTEXT_PRIMER.md](../_ai/CONTEXT_PRIMER.md) - Architecture overview
3. [CODEBASE_MAP.md](../_ai/CODEBASE_MAP.md) - Code navigation
4. [GLOSSARY.md](../_human/GLOSSARY.md) - Term definitions

---

## By File Location

### src/main.ts
- [CODEBASE_MAP.md](../_ai/CODEBASE_MAP.md) - Entry point docs

### src/core/llm/
- [API_REFERENCE.md#llm-provider-apis](../../API_REFERENCE.md)
- [COMMON_TASKS.md#add-provider](../_ai/COMMON_TASKS.md)
- [GOTCHAS.md#llm](../_ai/GOTCHAS.md)

### src/database/
- [DATABASE_SPEC.md](../../DATABASE_SPEC.md)
- [GOTCHAS.md#database](../_ai/GOTCHAS.md)

### src/components/
- [COMPONENT_SPEC.md](../../COMPONENT_SPEC.md)
- [GOTCHAS.md#react](../_ai/GOTCHAS.md)

### src/settings/
- [API_REFERENCE.md#settings](../../API_REFERENCE.md)
- [COMMON_TASKS.md#settings](../_ai/COMMON_TASKS.md)

---

## Tag Reference

| Tag | Description | Documents |
|-----|-------------|-----------|
| #ai | AI-specific docs | CONTEXT_PRIMER, CODEBASE_MAP |
| #api | API reference | API_REFERENCE |
| #architecture | System design | ARCHITECTURE, ADR |
| #components | React UI | COMPONENT_SPEC |
| #database | Data layer | DATABASE_SPEC |
| #decisions | Why choices made | ADR |
| #diagrams | Visual docs | ARCHITECTURE, FLOW_DIAGRAMS |
| #drizzle | ORM docs | DATABASE_SPEC |
| #faq | Q&A | FAQ |
| #flows | Data/user flows | FLOW_DIAGRAMS |
| #glossary | Definitions | GLOSSARY |
| #gotchas | Known issues | GOTCHAS |
| #hnsw | Vector index | DATABASE_SPEC |
| #howto | Step-by-step | COMMON_TASKS |
| #lexical | Editor | COMPONENT_SPEC |
| #llm | Language models | ARCHITECTURE, API_REFERENCE |
| #mcp | Tool protocol | ARCHITECTURE, FLOW_DIAGRAMS |
| #migrations | Schema changes | COMMON_TASKS |
| #onboarding | Getting started | GETTING_STARTED |
| #pglite | Database | DATABASE_SPEC |
| #pgvector | Vector search | DATABASE_SPEC |
| #pitfalls | Things that break | GOTCHAS |
| #primer | First read | CONTEXT_PRIMER |
| #priority | What to read | PRIORITY_MATRIX |
| #product | Requirements | PRD |
| #providers | LLM providers | ARCHITECTURE |
| #react | UI framework | COMPONENT_SPEC |
| #references | External links | DOCUMENTATION_REFERENCES |
| #schema | Data structure | DATABASE_SPEC |
| #settings | Configuration | API_REFERENCE |
| #state | State management | ARCHITECTURE |
| #tasks | How-to | COMMON_TASKS |
| #terms | Definitions | GLOSSARY |
| #tools | MCP tools | ARCHITECTURE |
| #types | TypeScript | API_REFERENCE |
| #vectors | Embeddings | DATABASE_SPEC |
| #wasm | WebAssembly | DATABASE_SPEC |
| #zod | Validation | API_REFERENCE |

---

*Last Updated: December 2024*
