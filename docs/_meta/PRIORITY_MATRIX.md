# Documentation Priority Matrix

Guide for what to read based on your situation.

---

## Priority Levels

| Priority | Meaning | When to Read |
|----------|---------|--------------|
| **P0** | Critical | Always read first |
| **P1** | Important | Read for specific tasks |
| **P2** | Helpful | Read when time permits |
| **P3** | Reference | Consult as needed |

---

## By Audience

### AI/LLM Sessions

**Start Here (P0)**:
1. [CONTEXT_PRIMER.md](../_ai/CONTEXT_PRIMER.md) - Essential context
2. [CODEBASE_MAP.md](../_ai/CODEBASE_MAP.md) - Navigate files

**Task-Specific (P1)**:
3. [COMMON_TASKS.md](../_ai/COMMON_TASKS.md) - How-to guides
4. [GOTCHAS.md](../_ai/GOTCHAS.md) - Avoid known issues
5. [QUICK_REFERENCE.md](../_index/QUICK_REFERENCE.md) - Code snippets

**Deep Dives (P2)**:
6. [ARCHITECTURE.md](../../ARCHITECTURE.md) - System design
7. [API_REFERENCE.md](../../API_REFERENCE.md) - Type definitions

### Human Developers

**Day 1 (P0)**:
1. [GETTING_STARTED.md](../_human/GETTING_STARTED.md) - Setup
2. [GLOSSARY.md](../_human/GLOSSARY.md) - Terminology

**First Week (P1)**:
3. [ARCHITECTURE.md](../../ARCHITECTURE.md) - System design
4. [CODEBASE_MAP.md](../_ai/CODEBASE_MAP.md) - File navigation
5. [ADR.md](../../ADR.md) - Why decisions were made

**Ongoing Reference (P2)**:
6. [COMPONENT_SPEC.md](../../COMPONENT_SPEC.md) - UI components
7. [DATABASE_SPEC.md](../../DATABASE_SPEC.md) - Data layer
8. [API_REFERENCE.md](../../API_REFERENCE.md) - Types

---

## By Task

### Adding a New LLM Provider

| Order | Document | Priority |
|-------|----------|----------|
| 1 | [COMMON_TASKS.md#add-provider](../_ai/COMMON_TASKS.md) | P0 |
| 2 | [API_REFERENCE.md#llm-provider](../../API_REFERENCE.md) | P1 |
| 3 | [ARCHITECTURE.md#llm-layer](../../ARCHITECTURE.md) | P1 |
| 4 | [GOTCHAS.md#llm](../_ai/GOTCHAS.md) | P1 |

### Adding a New Setting

| Order | Document | Priority |
|-------|----------|----------|
| 1 | [COMMON_TASKS.md#add-setting](../_ai/COMMON_TASKS.md) | P0 |
| 2 | [API_REFERENCE.md#settings](../../API_REFERENCE.md) | P1 |
| 3 | [GOTCHAS.md#settings](../_ai/GOTCHAS.md) | P1 |

### Fixing Database Issues

| Order | Document | Priority |
|-------|----------|----------|
| 1 | [GOTCHAS.md#database](../_ai/GOTCHAS.md) | P0 |
| 2 | [DATABASE_SPEC.md](../../DATABASE_SPEC.md) | P1 |
| 3 | [COMMON_TASKS.md#debug](../_ai/COMMON_TASKS.md) | P1 |

### Modifying UI Components

| Order | Document | Priority |
|-------|----------|----------|
| 1 | [COMPONENT_SPEC.md](../../COMPONENT_SPEC.md) | P0 |
| 2 | [CODEBASE_MAP.md#components](../_ai/CODEBASE_MAP.md) | P1 |
| 3 | [GOTCHAS.md#react](../_ai/GOTCHAS.md) | P1 |

### Working with MCP Tools

| Order | Document | Priority |
|-------|----------|----------|
| 1 | [ARCHITECTURE.md#mcp](../../ARCHITECTURE.md) | P0 |
| 2 | [FLOW_DIAGRAMS.md#mcp](../../FLOW_DIAGRAMS.md) | P1 |
| 3 | [GOTCHAS.md#mcp](../_ai/GOTCHAS.md) | P1 |

### Understanding RAG Pipeline

| Order | Document | Priority |
|-------|----------|----------|
| 1 | [ARCHITECTURE.md#rag](../../ARCHITECTURE.md) | P0 |
| 2 | [DATABASE_SPEC.md#vectors](../../DATABASE_SPEC.md) | P1 |
| 3 | [FLOW_DIAGRAMS.md#indexing](../../FLOW_DIAGRAMS.md) | P2 |

---

## Reading Order for Context Loading

### Minimal Context (Token-Constrained)

If you have limited context window:
1. [CONTEXT_PRIMER.md](../_ai/CONTEXT_PRIMER.md) (~2K tokens)
2. [QUICK_REFERENCE.md](../_index/QUICK_REFERENCE.md) (~3K tokens)

### Standard Context

For typical tasks:
1. [CONTEXT_PRIMER.md](../_ai/CONTEXT_PRIMER.md)
2. [CODEBASE_MAP.md](../_ai/CODEBASE_MAP.md)
3. [GOTCHAS.md](../_ai/GOTCHAS.md)
4. Task-specific documentation

### Full Context

For complex tasks or deep understanding:
1. All P0 documents
2. All P1 documents relevant to task
3. [ARCHITECTURE.md](../../ARCHITECTURE.md)
4. [ADR.md](../../ADR.md)

---

## Document Sizes

Approximate token counts for context planning:

| Document | ~Tokens | Priority |
|----------|---------|----------|
| CONTEXT_PRIMER.md | 2,000 | P0 |
| CODEBASE_MAP.md | 5,000 | P0 |
| QUICK_REFERENCE.md | 3,000 | P1 |
| GOTCHAS.md | 4,000 | P1 |
| COMMON_TASKS.md | 6,000 | P1 |
| ARCHITECTURE.md | 8,000 | P1 |
| ADR.md | 15,000 | P2 |
| API_REFERENCE.md | 20,000 | P2 |
| COMPONENT_SPEC.md | 10,000 | P2 |
| DATABASE_SPEC.md | 8,000 | P2 |

---

## Priority Assignment Criteria

### P0 (Must Read)
- Required for any work on the project
- Foundational understanding
- Navigation/orientation
- Examples: CONTEXT_PRIMER, GETTING_STARTED

### P1 (Should Read)
- Required for specific categories of work
- Important patterns and conventions
- Common procedures
- Examples: COMMON_TASKS, GOTCHAS, ARCHITECTURE

### P2 (Good to Read)
- Deepens understanding
- Comprehensive reference
- Edge cases and details
- Examples: API_REFERENCE, COMPONENT_SPEC

### P3 (Optional)
- Maintenance/meta documentation
- Historical context
- Rarely needed reference
- Examples: FRESHNESS_LOG, PRD

---

## Quick Decision Tree

```
Need to understand the project?
  → Start with CONTEXT_PRIMER.md (P0)

Need to find a file?
  → Use CODEBASE_MAP.md (P0)

Need to do a specific task?
  → Check COMMON_TASKS.md (P1)

Getting an error?
  → Check GOTCHAS.md (P1)

Need code examples?
  → Check QUICK_REFERENCE.md (P1)

Need deep type info?
  → Check API_REFERENCE.md (P2)

Need to understand why?
  → Check ADR.md (P2)
```

---

*Last Updated: December 2024*
