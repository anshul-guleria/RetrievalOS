# RetrievalOS — Project Structure

RetrievalOS is a **Node.js + TypeScript** platform for configurable and extensible AI retrieval. The architecture separates ingestion, retrieval, reranking, generation, storage, and evaluation so retrieval strategies can be swapped without changing the chat pipeline.

## Repository

```text
retrieval-os/
├── apps/
│   ├── api/                         # NestJS backend
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/
│   │       │   ├── projects/
│   │       │   ├── documents/
│   │       │   ├── conversations/
│   │       │   ├── chat/
│   │       │   ├── retrieval/
│   │       │   └── experiments/
│   │       ├── common/
│   │       ├── config/
│   │       ├── app.module.ts
│   │       └── main.ts
│   │
│   ├── worker/                      # Background document/RAG jobs
│   │   └── src/
│   │
│   └── web/                         # Next.js frontend
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── types/
│
├── packages/
│   ├── core/                        # RetrievalOS engine
│   │   └── src/
│   │       ├── ingestion/
│   │       ├── chunking/
│   │       ├── retrieval/
│   │       ├── embeddings/
│   │       ├── reranking/
│   │       ├── generation/
│   │       ├── pipelines/
│   │       └── index.ts
│   │
│   ├── domain/                      # Domain models/interfaces
│   │   └── src/
│   │       ├── document/
│   │       ├── project/
│   │       ├── conversation/
│   │       └── retrieval/
│   │
│   ├── providers/                   # External provider implementations
│   │   └── src/
│   │       ├── llm/
│   │       ├── embeddings/
│   │       ├── vector/
│   │       ├── graph/
│   │       └── storage/
│   │
│   └── evaluation/                  # RAG evaluation/experiments
│       └── src/
│           ├── metrics/
│           ├── datasets/
│           ├── experiments/
│           └── runner.ts
│
├── infrastructure/
│   ├── database/                    # PostgreSQL/Prisma
│   ├── queues/                      # Redis/BullMQ
│   └── storage/                     # S3-compatible storage
│
├── scripts/
│   ├── seed.ts
│   ├── ingest.ts
│   ├── build-graph.ts
│   └── evaluate.ts
│
├── tests/
│   ├── integration/
│   └── e2e/
│
├── docker/
│   ├── api.Dockerfile
│   └── worker.Dockerfile
│
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── .env.example
├── README.md
└── STRUCTURE.md
```

## Core Architecture

```text
                         ┌──────────────┐
                         │   Next.js    │
                         │     Web      │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │    NestJS    │
                         │     API      │
                         └──────┬───────┘
                                │
                    ┌───────────▼───────────┐
                    │       Pipelines       │
                    └───────────┬───────────┘
                                │
             ┌──────────────────┼──────────────────┐
             ▼                  ▼                  ▼
        Ingestion           Retrieval          Generation
             │                  │                  │
       ┌─────┴─────┐     ┌──────┼──────┐          │
       │           │     │      │      │          ▼
    Chunking    Embedding Vector Hybrid Graph     LLM
                              │      │      │
                              └──────┼──────┘
                                     ▼
                                  Reranker
                                     │
                                     ▼
                                  Context
```

## `packages/core`

The core contains framework-independent RetrievalOS logic.

```text
core/src/
├── ingestion/
│   ├── loaders/                    # PDF, DOCX, TXT, MD, CSV
│   ├── parsers/
│   └── ingestion-pipeline.ts
│
├── chunking/
│   ├── interfaces/
│   ├── recursive/
│   ├── semantic/
│   └── hierarchical/
│
├── retrieval/
│   ├── interfaces/
│   │   ├── retriever.ts
│   │   ├── vector-store.ts
│   │   └── graph-store.ts
│   ├── registry/
│   │   └── retrieval-registry.ts
│   ├── vector/
│   ├── keyword/
│   ├── hybrid/
│   ├── graph/
│   └── parent-document/
│
├── embeddings/
├── reranking/
├── generation/
└── pipelines/
    ├── ingestion-pipeline.ts
    ├── retrieval-pipeline.ts
    └── chat-pipeline.ts
```

## Retrieval

Every retrieval strategy implements the same interface:

```typescript
export interface Retriever {
  retrieve(
    query: string,
    config: RetrievalConfig,
  ): Promise<RetrievedDocument[]>;
}
```

Available/planned strategies:

```text
Retriever
├── VectorRetriever
├── KeywordRetriever
├── HybridRetriever
├── GraphRetriever
└── CustomRetriever
```

The `RetrievalRegistry` resolves strategies dynamically:

```typescript
const retriever = registry.get(config.strategy);

const results = await retriever.retrieve(
  query,
  config,
);
```

**Important:** retrieval strategy is configuration, not chat-pipeline logic.

## Ingestion Flow

```text
Upload
  → Loader
  → Parser
  → Cleaner
  → Chunker
  → Embedding
  → Vector/Graph Index
```

Document processing should run asynchronously through the worker:

```text
API → Redis/BullMQ → Worker → Ingestion Pipeline → Storage
```

## Chat Flow

```text
User Query
    ↓
Query Processing
    ↓
Retrieval Registry
    ↓
Vector / Hybrid / Graph / Custom
    ↓
Reranking
    ↓
Context Builder
    ↓
Prompt Builder
    ↓
LLM
    ↓
Answer + Sources
```

## `packages/domain`

Core entities and types:

```text
domain/
├── document/
├── project/
├── conversation/
│   ├── conversation.ts
│   └── message.ts
└── retrieval/
    ├── retrieval-config.ts
    └── retrieval-result.ts
```

Example configuration:

```typescript
interface RetrievalConfig {
  strategy: "vector" | "keyword" | "hybrid" | "graph";

  chunking?: {
    strategy: string;
    size?: number;
    overlap?: number;
  };

  vector?: {
    topK?: number;
  };

  keyword?: {
    enabled: boolean;
    topK?: number;
  };

  graph?: {
    enabled: boolean;
    provider?: string;
  };

  reranking?: {
    enabled: boolean;
    provider?: string;
    topK?: number;
  };
}
```

## `packages/providers`

Provider-specific implementations stay outside the core:

```text
providers/src/
├── llm/
│   ├── openai/
│   ├── anthropic/
│   └── local/
├── embeddings/
│   ├── openai/
│   └── local/
├── vector/
│   ├── qdrant/
│   └── pgvector/
├── graph/
│   └── neo4j/
└── storage/
    └── s3/
```

This keeps RetrievalOS provider-agnostic.

## `packages/evaluation`

Used to compare retrieval strategies:

```text
Dataset
   ├── Vector RAG
   ├── Hybrid RAG
   ├── GraphRAG
   └── Custom RAG
          ↓
      Evaluation
          ↓
 ┌────────────────────┐
 │ Recall@K           │
 │ Precision@K        │
 │ MRR / NDCG         │
 │ Context Relevance  │
 │ Faithfulness       │
 │ Latency            │
 │ Token Usage        │
 │ Cost               │
 └────────────────────┘
```

## Dependency Rules

```text
Web
 ↓
API
 ↓
Pipelines
 ↓
Core / Domain
 ↓
Provider Interfaces
 ↓
Infrastructure / Providers
```

Rules:

1. `core` must not depend on NestJS.
2. `core` must not depend directly on OpenAI, Qdrant, Neo4j, etc.
3. Providers implement core interfaces.
4. API orchestrates but does not implement RAG algorithms.
5. UI communicates only through the API.
6. Retrieval implementations must implement `Retriever`.
7. New retrieval strategies should require minimal/no changes to existing pipelines.

## Initial Stack

```text
Runtime       Node.js
Language      TypeScript
API           NestJS
Frontend      Next.js
Monorepo      pnpm workspaces
Database      PostgreSQL + Prisma
Vector        pgvector / Qdrant
Graph         Neo4j
Queue         Redis + BullMQ
Storage       S3
LLM           Provider abstraction
Embeddings    Provider abstraction
```

## Implementation Order

```text
1.  Project + document management
2.  Document upload + storage
3.  PDF/DOCX/TXT ingestion
4.  Chunking
5.  Embeddings
6.  Vector retrieval
7.  Chat + citations
8.  Retriever interface + registry
9.  Hybrid retrieval
10. Reranking
11. GraphRAG
12. Evaluation
13. Custom retrieval plugins
```

### Core Principle

> **RetrievalOS is not a single RAG implementation. It is a configurable retrieval engine where retrieval strategies, providers, chunking, reranking, and generation can be replaced independently.**