# Product Requirements Document (PRD)

**Document Version:** 1.0
**Date:** 2025-12-18
**Status:** Complete
**Product:** Smart Composer - Obsidian Plugin
**Fork:** HomeHeart Upgraded

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Target Users](#3-target-users)
4. [Feature Requirements](#4-feature-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [User Stories](#6-user-stories)
7. [Feature Specifications](#7-feature-specifications)
8. [HomeHeart Fork Additions](#8-homeheart-fork-additions)
9. [Constraints & Limitations](#9-constraints--limitations)
10. [Success Metrics](#10-success-metrics)
11. [Roadmap](#11-roadmap)

---

## 1. Executive Summary

### 1.1 Product Description

Smart Composer is an AI-powered writing assistant plugin for Obsidian that enables users to have intelligent conversations with their notes. It provides:

- **Multi-provider LLM chat** with context from vault notes
- **RAG (Retrieval-Augmented Generation)** for semantic note search
- **MCP (Model Context Protocol)** for extensible tool execution
- **Apply feature** for AI-suggested file modifications
- **Template system** for reusable prompts

### 1.2 HomeHeart Fork Enhancements

This fork adds:
- **Claude Code Provider**: Use Max/Pro subscription instead of API fees
- **Claude Opus 4.5 Support**: Latest Claude model
- **Thinking Level Variants**: Extended reasoning modes (think, think-hard, ultrathink)
- **16 New Claude Code Models**: 4 base models × 4 thinking levels

### 1.3 Key Value Proposition

| Traditional Approach | Smart Composer |
|---------------------|----------------|
| Manual note searching | Semantic similarity search |
| Copy-paste to ChatGPT | In-app chat with vault context |
| API costs per token | Claude Code: use existing subscription |
| No file editing | Direct Apply feature |

---

## 2. Product Vision

### 2.1 Mission Statement

*Enable knowledge workers to leverage AI assistants directly within their Obsidian workflow, with full context from their personal knowledge base.*

### 2.2 Vision Goals

1. **Seamless Integration**: Feel native to Obsidian
2. **Context-Aware AI**: Understand user's vault structure and content
3. **Provider Flexibility**: Support multiple AI providers
4. **Privacy-Conscious**: Local processing where possible
5. **Extensible**: MCP protocol for custom tools

### 2.3 Core Principles

- **User Control**: Users choose providers, models, and data handling
- **Transparency**: Show what context is sent to AI
- **Efficiency**: Minimize API calls, cache embeddings
- **Reliability**: Graceful degradation on API failures

---

## 3. Target Users

### 3.1 Primary Personas

#### Persona 1: Knowledge Worker (Primary)

| Attribute | Description |
|-----------|-------------|
| Role | Researcher, Writer, Analyst |
| Vault Size | 500-5000 notes |
| Use Case | Research synthesis, writing assistance |
| Technical Level | Moderate (comfortable with plugins) |
| Pain Points | Finding relevant notes, synthesizing information |

#### Persona 2: Developer (Secondary)

| Attribute | Description |
|-----------|-------------|
| Role | Software Developer |
| Vault Size | 100-1000 notes (docs, meeting notes) |
| Use Case | Code documentation, technical writing |
| Technical Level | High |
| Pain Points | Context switching, documentation maintenance |

#### Persona 3: Healthcare Professional (HomeHeart)

| Attribute | Description |
|-----------|-------------|
| Role | Physical Therapist, Clinician |
| Vault Size | 100-500 notes (patient templates, protocols) |
| Use Case | Clinical documentation, assessment writing |
| Technical Level | Low-Moderate |
| Pain Points | Repetitive documentation, time constraints |

### 3.2 User Environment

| Environment | Support Level |
|-------------|---------------|
| Windows | Full |
| macOS | Full |
| Linux | Full |
| Mobile (iOS/Android) | Partial (no MCP, no Claude Code) |

---

## 4. Feature Requirements

### 4.1 Feature Priority Matrix

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (Must) | Multi-provider chat | Done |
| P0 (Must) | Streaming responses | Done |
| P0 (Must) | Message history | Done |
| P0 (Must) | Settings UI | Done |
| P1 (Should) | RAG/semantic search | Done |
| P1 (Should) | File context (@mentions) | Done |
| P1 (Should) | Apply feature | Done |
| P1 (Should) | Templates | Done |
| P2 (Could) | MCP tools | Done |
| P2 (Could) | Vision/image support | Done |
| P2 (Could) | Extended thinking | Done (HomeHeart) |
| P3 (Nice) | URL fetching | Done |
| P3 (Nice) | YouTube transcripts | Done |

### 4.2 Core Features

```
┌─────────────────────────────────────────────────────────────────┐
│                     FEATURE MAP                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      CHAT                                │   │
│  │  • Multi-turn conversation                               │   │
│  │  • Streaming responses                                   │   │
│  │  • Model selection                                       │   │
│  │  • System prompt customization                          │   │
│  │  • Chat history persistence                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   CONTEXT                                │   │
│  │  • @mention files/folders                               │   │
│  │  • Current file inclusion                                │   │
│  │  • Block references                                      │   │
│  │  • Vault-wide semantic search                           │   │
│  │  • Image attachments                                     │   │
│  │  • URL content fetching                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    RAG                                   │   │
│  │  • Automatic vault indexing                             │   │
│  │  • Semantic similarity search                           │   │
│  │  • Include/exclude patterns                             │   │
│  │  • Configurable chunk size                              │   │
│  │  • Multiple embedding models                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   APPLY                                  │   │
│  │  • AI-suggested file modifications                      │   │
│  │  • Diff view                                            │   │
│  │  • Accept/reject per block                              │   │
│  │  • Apply to open file                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    MCP                                   │   │
│  │  • External tool servers                                │   │
│  │  • Tool discovery                                       │   │
│  │  • Authorization control                                │   │
│  │  • Auto-execute option                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 TEMPLATES                                │   │
│  │  • Reusable prompt templates                            │   │
│  │  • /command autocomplete                                │   │
│  │  • Create from selection                                │   │
│  │  • CRUD management                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Metric | Requirement |
|--------|-------------|
| Plugin load time | < 2 seconds |
| Chat response start | < 1 second (streaming) |
| Vault indexing | < 5 min for 1000 notes |
| Similarity search | < 500ms |
| Database save | < 1 second |

### 5.2 Reliability

| Metric | Requirement |
|--------|-------------|
| Uptime | 99.9% (plugin stability) |
| Data integrity | No data loss on crash |
| Error recovery | Graceful API failure handling |
| Offline support | Templates and history work offline |

### 5.3 Security

| Aspect | Requirement |
|--------|-------------|
| API keys | Stored in Obsidian's encrypted storage |
| Data in transit | HTTPS for all API calls |
| Local data | Stored in vault (user-controlled) |
| MCP sandboxing | Tool authorization per-conversation |

### 5.4 Scalability

| Vault Size | Support Level |
|------------|---------------|
| < 100 notes | Excellent |
| 100-1000 notes | Good |
| 1000-5000 notes | Acceptable |
| > 5000 notes | May need exclusion patterns |

### 5.5 Compatibility

| Dependency | Minimum Version |
|------------|-----------------|
| Obsidian | 1.4.0 |
| Node.js | 18.0.0 (for dev) |
| Electron | Bundled with Obsidian |

---

## 6. User Stories

### 6.1 Chat & Conversation

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-01 | User | Chat with AI in Obsidian | I don't context-switch to external apps |
| US-02 | User | See streaming responses | I get immediate feedback |
| US-03 | User | Choose my AI provider | I use my preferred service |
| US-04 | User | Save chat history | I can reference past conversations |
| US-05 | User | Set a system prompt | The AI behaves as I prefer |

### 6.2 Context & RAG

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-10 | User | @mention files | The AI sees specific note content |
| US-11 | User | Search my entire vault | The AI finds relevant context |
| US-12 | User | Exclude folders from search | My private notes stay private |
| US-13 | User | See what context was sent | I trust what data the AI receives |
| US-14 | User | Include images | The AI can analyze visuals |

### 6.3 Apply & Editing

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-20 | User | Have AI suggest edits | I can improve my notes |
| US-21 | User | See a diff view | I understand what changes |
| US-22 | User | Accept/reject changes | I control what's modified |
| US-23 | User | Apply to current file | Edits happen in context |

### 6.4 Templates

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-30 | User | Create prompt templates | I reuse effective prompts |
| US-31 | User | Type /template to insert | It's quick to use templates |
| US-32 | User | Manage my templates | I can organize my workflows |

### 6.5 MCP Tools

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-40 | User | Connect external tools | The AI has extended capabilities |
| US-41 | User | Control tool permissions | I manage security risks |
| US-42 | User | See tool execution status | I know what's happening |

### 6.6 HomeHeart-Specific

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-50 | Clinician | Use Claude without API fees | I save money on my subscription |
| US-51 | Clinician | Use extended thinking | Complex clinical reasoning works better |
| US-52 | Clinician | Migrate my templates | I keep my workflow on new machines |

---

## 7. Feature Specifications

### 7.1 Chat Feature

```
┌─────────────────────────────────────────────────────────────────┐
│                      CHAT SPECIFICATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT                                                          │
│  ├── User message (rich text via Lexical)                      │
│  ├── @mentions (files, folders, blocks)                        │
│  ├── Images (paste, drag-drop, upload)                         │
│  ├── URLs (auto-fetched)                                       │
│  └── Template insertion (/command)                             │
│                                                                 │
│  PROCESSING                                                     │
│  ├── Resolve mentions to content                               │
│  ├── Build prompt with system message                          │
│  ├── Add conversation history                                  │
│  ├── Stream response from LLM                                  │
│  └── Parse tool calls (if MCP enabled)                         │
│                                                                 │
│  OUTPUT                                                         │
│  ├── Streamed text response                                    │
│  ├── Reasoning/thinking display                                │
│  ├── Annotations/citations                                     │
│  ├── Tool call results                                         │
│  └── Token usage stats                                         │
│                                                                 │
│  CONTROLS                                                       │
│  ├── Model selector                                            │
│  ├── New chat button                                           │
│  ├── History dropdown                                          │
│  ├── Stop generation button                                    │
│  └── Continue response button                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 RAG Feature

```
┌─────────────────────────────────────────────────────────────────┐
│                       RAG SPECIFICATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INDEXING                                                       │
│  ├── Trigger: Manual command OR auto on query                  │
│  ├── Scope: Include/exclude glob patterns                      │
│  ├── Chunking: RecursiveCharacterTextSplitter                  │
│  │   └── Default: 1000 tokens, 200 overlap                     │
│  ├── Embedding: Via configured model                           │
│  └── Storage: PGlite with pgvector HNSW indexes               │
│                                                                 │
│  SEARCHING                                                      │
│  ├── Trigger: "Vault Chat" button or Ctrl+Shift+Enter          │
│  ├── Query embedding via same model                            │
│  ├── Cosine similarity search                                  │
│  ├── Minimum similarity threshold (default 0.7)                │
│  ├── Result limit (default 10)                                 │
│  └── Scope filtering (optional files/folders)                  │
│                                                                 │
│  CONFIGURATION                                                  │
│  ├── Embedding model selection                                 │
│  ├── Chunk size                                                │
│  ├── Similarity threshold                                      │
│  ├── Max results                                               │
│  └── Include/exclude patterns                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Provider Configuration

```
┌─────────────────────────────────────────────────────────────────┐
│                   PROVIDER SPECIFICATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PROVIDER TYPES                                                 │
│  ├── API-based (require API key)                               │
│  │   ├── openai                                                │
│  │   ├── anthropic                                             │
│  │   ├── gemini                                                │
│  │   ├── groq                                                  │
│  │   ├── deepseek                                              │
│  │   ├── perplexity                                            │
│  │   ├── mistral                                               │
│  │   └── openrouter                                            │
│  │                                                             │
│  ├── Self-hosted (require base URL)                            │
│  │   ├── ollama                                                │
│  │   ├── lmstudio                                              │
│  │   └── openai-compatible                                     │
│  │                                                             │
│  ├── Azure (require base URL + API key)                        │
│  │   └── azure-openai                                          │
│  │                                                             │
│  └── CLI-based (no API key)                                    │
│      └── claude-code                                           │
│                                                                 │
│  PROVIDER SETTINGS                                              │
│  ├── id: Unique identifier                                     │
│  ├── type: Provider type                                       │
│  ├── apiKey: For API-based providers                           │
│  ├── baseUrl: For self-hosted providers                        │
│  └── additionalSettings: Provider-specific options             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. HomeHeart Fork Additions

### 8.1 Claude Code Provider

| Aspect | Specification |
|--------|---------------|
| Purpose | Use Claude Max/Pro subscription without API fees |
| Implementation | Wraps `claude` CLI via child_process.spawn |
| Prerequisites | Claude Code CLI installed and logged in |
| Platform | Desktop only (no mobile support) |
| Streaming | Simulated (returns complete response) |
| Embeddings | Not supported |

### 8.2 Added Models

| Model ID | Base Model | Thinking Level |
|----------|------------|----------------|
| claude-code/opus-4.5 | claude-opus-4-5-20251101 | None |
| claude-code/opus-4.5-think | claude-opus-4-5-20251101 | Low (~4k tokens) |
| claude-code/opus-4.5-think-hard | claude-opus-4-5-20251101 | Medium (~10k tokens) |
| claude-code/opus-4.5-ultrathink | claude-opus-4-5-20251101 | Max (~32k tokens) |
| claude-code/sonnet-4.5 | claude-sonnet-4-5-20250929 | None |
| claude-code/sonnet-4.5-think | claude-sonnet-4-5-20250929 | Low |
| claude-code/sonnet-4.5-think-hard | claude-sonnet-4-5-20250929 | Medium |
| claude-code/sonnet-4.5-ultrathink | claude-sonnet-4-5-20250929 | Max |
| claude-code/sonnet-4 | claude-sonnet-4-20250514 | None |
| claude-code/sonnet-4-think | claude-sonnet-4-20250514 | Low |
| claude-code/sonnet-4-think-hard | claude-sonnet-4-20250514 | Medium |
| claude-code/sonnet-4-ultrathink | claude-sonnet-4-20250514 | Max |
| claude-code/haiku-4.5 | claude-haiku-4-5-20251001 | None |
| claude-code/haiku-4.5-think | claude-haiku-4-5-20251001 | Low |
| claude-code/haiku-4.5-think-hard | claude-haiku-4-5-20251001 | Medium |
| claude-code/haiku-4.5-ultrathink | claude-haiku-4-5-20251001 | Max |

### 8.3 Thinking Triggers

| Level | Trigger Prefix | Token Budget |
|-------|----------------|--------------|
| None | (none) | Standard |
| Low | "Think about this: " | ~4,000 |
| Medium | "Think hard about this: " | ~10,000 |
| Max | "Ultrathink: " | ~32,000 |

### 8.4 Claude API Model Addition

Also added to standard Anthropic provider:

| Model ID | API Model |
|----------|-----------|
| claude-opus-4.5 | claude-opus-4-5-20251101 |

---

## 9. Constraints & Limitations

### 9.1 Technical Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| No real streaming for Claude Code | Response appears all at once | Simulated streaming display |
| Desktop-only for Claude Code | Mobile users can't use subscription | Use API providers on mobile |
| PGlite WASM size | ~5MB initial download | CDN caching |
| MCP stdio transport | Only local servers | Planned: SSE/HTTP transport |

### 9.2 Provider Limitations

| Provider | Limitation |
|----------|------------|
| Claude Code | No embeddings, no vision, no streaming |
| Ollama | Local only, no vision for most models |
| Anthropic | No embeddings API |
| All | Rate limits per provider |

### 9.3 Platform Limitations

| Platform | Limitation |
|----------|------------|
| Mobile | No MCP, no Claude Code, no local providers |
| Windows | WSL path complexity for Claude Code |
| Corporate | Proxy/firewall may block API calls |

---

## 10. Success Metrics

### 10.1 Adoption Metrics

| Metric | Target |
|--------|--------|
| Daily Active Users | 100+ |
| Plugin Downloads | 1000+ |
| GitHub Stars | 50+ |
| GitHub Issues Resolved | 80%+ |

### 10.2 Quality Metrics

| Metric | Target |
|--------|--------|
| Plugin Crash Rate | < 0.1% |
| API Error Rate | < 5% |
| User Satisfaction | 4.5+/5 rating |
| Feature Adoption | 70%+ use RAG |

### 10.3 Performance Metrics

| Metric | Target |
|--------|--------|
| Indexing Speed | 200 files/minute |
| Search Latency | < 500ms p95 |
| Response Start | < 1s p95 |
| Database Load | < 2s |

---

## 11. Roadmap

### 11.1 Completed (Current State)

- [x] Multi-provider LLM support (15 providers)
- [x] RAG with PGlite/pgvector
- [x] MCP tool integration
- [x] Apply feature with diff view
- [x] Template system
- [x] Chat history persistence
- [x] Claude Code provider (HomeHeart)
- [x] Extended thinking modes (HomeHeart)

### 11.2 Near-Term Enhancements

- [ ] Real-time streaming for Claude Code (pending CLI support)
- [ ] MCP over HTTP/SSE (for remote servers)
- [ ] Improved mobile experience
- [ ] Multi-language UI

### 11.3 Long-Term Vision

- [ ] Collaborative chat (multi-user)
- [ ] Plugin marketplace for templates
- [ ] Voice input/output
- [ ] Agent mode (autonomous task execution)

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| RAG | Retrieval-Augmented Generation - enhancing LLM responses with retrieved context |
| MCP | Model Context Protocol - standard for LLM tool integration |
| HNSW | Hierarchical Navigable Small World - vector index algorithm |
| PGlite | PostgreSQL compiled to WebAssembly |
| Lexical | React-based rich text editor framework |

---

## Appendix B: References

- [Obsidian Plugin API](https://docs.obsidian.md/Plugins)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Code CLI](https://claude.ai/code)
- [PGlite](https://github.com/electric-sql/pglite)
- [Original Smart Composer](https://github.com/glowingjade/obsidian-smart-composer)

---

**END OF PRD**
