# RetrievalOS

A configurable, provider-agnostic AI retrieval platform — the goal is a system where retrieval strategies, providers, chunking, reranking, and generation can all be swapped independently without rewriting the chat pipeline.

This repository is a **work in progress**. It currently contains a working LangGraph-based chat API, a pluggable LLM provider layer, a set of CLI playgrounds for experimenting with the graph and providers, and the beginnings of a Python **GraphRAG** ingestion service that extracts entities and relationships from documents.

---

## Status at a glance

| Area | Status |
| --- | --- |
| Express chat API (`/api/chat`) | ✅ Working |
| LangGraph chat graph (single LLM node) | ✅ Working |
| LLM provider abstraction (Groq, Gemini) | ✅ Working |
| Conversation history in state | ✅ Working |
| Web search tool (Tavily) | ✅ Implemented, not yet wired into the graph |
| CLI chat playgrounds | ✅ Working (two graph CLIs reference a removed path) |
| PDF/document loader (TS) | 🚧 Script-level only, hardcoded path |
| Chunking (TS), knowledge-retrieval node, web-search node | 🚧 Empty placeholders |
| GraphRAG ingestion (Python) — load → chunk → extract | ✅ Working end to end |
| Graph persistence / vector store / retrieval / reranking / evaluation | 🗺️ Not started (see [Roadmap](#roadmap)) |

See [proposed-structure.md](./proposed-structure.md) for the full target architecture.

---

## Architecture

The long-term design separates ingestion, retrieval, reranking, generation, storage, and evaluation. What exists today is the first slice of that:

```text
                     ┌───────────────────────────┐
   HTTP client  ───►  │  apps/api  (Express)      │
                     │  POST /api/chat           │
                     └─────────────┬─────────────┘
                                   │ graph.invoke({ query, ... })
                                   ▼
                     ┌───────────────────────────┐
                     │  packages/core            │
                     │  LangGraph StateGraph     │
                     │  START ─► llm_node ─► END │
                     └─────────────┬─────────────┘
                                   │ create_llm(provider)
                                   ▼
                     ┌───────────────────────────┐
                     │  packages/providers       │
                     │  Groq  |  Gemini          │
                     └───────────────────────────┘

   Offline / separate process:

   ┌────────────┐   ┌──────────┐   ┌─────────────────────┐
   │  loader    │──►│ chunker  │──►│ extractor (LLM)     │
   │ (pdf/md/   │   │ recursive│   │ entities+relations  │
   │  txt/docx) │   │ splitter │   │  (structured output)│
   └────────────┘   └──────────┘   └─────────────────────┘
        services/graphrag  (Python)
```

**Dependency intent:** `apps` orchestrate; `packages/core` holds framework-independent logic; `packages/providers` implements the swappable provider interfaces. Core must not depend directly on a specific vendor — providers are resolved through a factory.

---

## Repository layout

```text
RetrievalOS/
├── apps/
│   ├── api/                       # Express HTTP API
│   │   └── src/
│   │       ├── server.ts          # Boots the server (PORT, default 3000)
│   │       ├── app.ts             # Middleware, /health, mounts /api/chat
│   │       └── routes/chat.routes.ts
│   └── cli/                       # Interactive CLI experiments
│       └── src/
│           ├── chat.ts                    # one-shot query against the LLM
│           ├── chat_with_history.ts       # multi-turn chat with history
│           ├── chat_graph_simple.ts       # loops the graph (stale import)
│           └── chat_graph_history.ts      # graph + history (stale import)
│
├── packages/
│   ├── core/
│   │   ├── graph/simple_chat_graph.ts     # LangGraph StateGraph definition
│   │   ├── model/state.ts                 # ChatBotState schema
│   │   ├── nodes/llm_node.ts              # Calls the LLM, updates state
│   │   ├── nodes/knowledge_retrieal_node.ts  # (placeholder, empty)
│   │   ├── nodes/web_search_node.ts          # (placeholder, empty)
│   │   ├── prompts/prompts.ts             # System prompt
│   │   ├── tools/web_search_tool.ts       # Tavily search tool
│   │   ├── utils/context_builder.ts       # Builds the message array
│   │   └── rag/ingestion/
│   │       ├── document_loader.ts         # PDFLoader script
│   │       └── chunking.ts                # (placeholder, empty)
│   └── providers/
│       └── src/llm/
│           ├── index.ts                   # create_llm(provider) factory
│           ├── groq.ts                    # ChatGroq factory
│           └── gemini.ts                  # ChatGoogleGenerativeAI factory
│
├── services/                      # Python services
│   └── graphrag/
│       ├── components/
│       │   ├── loader.py          # pdf / md / txt / docx loader
│       │   ├── chunker.py         # RecursiveCharacterTextSplitter
│       │   ├── extractor.py       # LLM entity/relation extraction (retries)
│       │   ├── model.py           # Pydantic Entity / Relation / ExtractionResult
│       │   ├── prompt.py          # Extraction prompt
│       │   ├── normalizer.py      # (stub — TBA)
│       │   └── llm_factory.py     # Provider factory
│       ├── llm/
│       │   ├── groq.py
│       │   └── gemini.py
│       └── pipeline/
│           └── ingestion.py       # load → chunk → extract orchestrator
│
├── .env.example
├── proposed-structure.md          # Target architecture
├── package.json
├── tsconfig.json
└── README.md
```

---

## Tech stack

**TypeScript / Node**
- Node.js + TypeScript (ESM, `NodeNext`)
- Express
- LangChain + LangGraph
- Providers: Groq (`@langchain/groq`), Google Gemini (`@langchain/google-genai`)
- Tavily web search (`@langchain/tavily`), `duck-duck-scrape`
- `pdf-parse` / `@langchain/community` PDF loader

**Python**
- LangChain (`langchain-community`, `langchain-text-splitters`, `langchain-groq`, `langchain-google-genai`)
- Pydantic (structured extraction schemas)
- python-dotenv, rich

---

## Getting started

### Prerequisites

- Node.js (a version that supports running TypeScript directly, used by the `dev` script)
- Python 3.x with `pip`
- API keys for the providers you want to use (Groq and/or Google Gemini; Tavily for web search)

### 1. Clone and install

```bash
git clone https://github.com/anshul-guleria/RetrievalOS.git
cd RetrievalOS

# Node dependencies
npm install

# Python dependencies (from the repo root)
python -m venv services/.venv
services/.venv/Scripts/activate      # Windows
# source services/.venv/bin/activate # macOS / Linux
pip install langchain-community langchain-text-splitters langchain-groq \
            langchain-google-genai pydantic python-dotenv rich
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Used by | Description |
| --- | --- | --- |
| `LLM_PROVIDER` | TS + Python | Default provider: `groq` or `gemini` |
| `GROQ_API_KEY` | TS + Python | Groq API key |
| `GROQ_LLM_MODEL` | TS | Groq model id (e.g. `openai/gpt-oss-20b`) |
| `GOOGLE_API_KEY` | TS + Python | Google Gemini API key |
| `GEMINI_LLM_MODEL` | TS | Gemini model id |
| `TAVILY_API_KEY` | TS | Tavily search key (for the web search tool) |

> The Python service reads `GROQ_MODEL` / `GEMINI_MODEL`, while the TypeScript side reads `GROQ_LLM_MODEL` / `GEMINI_LLM_MODEL`. Keep both in mind when configuring models.

### 3. Run the API

```bash
npm run dev
# → Chat API running at http://localhost:3000
```

### 4. Try the CLI playgrounds

```bash
# Single question against the configured LLM
npx tsx apps/cli/src/chat.ts

# Multi-turn chat with history
npx tsx apps/cli/src/chat_with_history.ts
```

### 5. Run the GraphRAG ingestion pipeline

Imports are rooted at `services.*`, so run it as a module from the repo root:

```bash
python -m services.graphrag.pipeline.ingestion
```

The current entry point ingests a hardcoded PDF path, chunks it, and prints the entities and relationships the LLM extracted from the first chunk.

---

## API reference

### `GET /health`

```json
{ "status": "ok" }
```

### `POST /api/chat`

**Request**

```json
{ "query": "What is RetrievalOS?" }
```

**Response**

```json
{ "answer": "..." }
```

Returns `400` if `query` is missing or not a non-empty string.

**Example**

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is RetrievalOS?"}'
```

---

## How the chat graph works

1. `POST /api/chat` validates the query and calls `graph.invoke({ query, history: [], context: "", answer: "" })`.
2. The LangGraph state graph (`simple_chat_graph.ts`) runs a single node, `llm_node`.
3. `llm_node` builds the message array — `SystemMessage(system prompt + context)`, prior history, then the `HumanMessage` — via `build_message`.
4. `create_llm(provider)` resolves the provider from `LLM_PROVIDER` and returns a LangChain chat model.
5. The response is appended to `history` and returned as `answer`.

Adding retrieval later means inserting nodes (knowledge retrieval, reranking, context building) between `START` and the LLM node — the API contract stays the same.

---

## GraphRAG extraction schema

The Python service asks the LLM for a strict JSON structure:

```python
class Entity(BaseModel):
    name: str          # primary name, capitalized
    entity_type: str   # PERSON, ORGANIZATION, CREATIVE_WORK, PLACE, EVENT, CONCEPT
    description: str

class Relation(BaseModel):
    source: str        # exact source entity name
    predicate: str     # ALL_CAPS verb, e.g. DIRECTED, LOCATED_IN
    target: str        # exact target entity name
    evidence: str      # verbatim supporting sentence

class ExtractionResult(BaseModel):
    entities: list[Entity]
    relations: list[Relation]
```

The extractor uses `with_structured_output(..., method="json_schema", strict=True)` and retries on failure.

---

## Roadmap

Planned in rough implementation order (see `proposed-structure.md` for detail):

1. Project + document management
2. Document upload + storage
3. PDF / DOCX / TXT ingestion (async via a worker + queue)
4. Chunking strategies (recursive, semantic, hierarchical)
5. Embeddings
6. Vector retrieval
7. Chat + citations
8. `Retriever` interface + `RetrievalRegistry`
9. Hybrid retrieval
10. Reranking
11. GraphRAG (persist the extracted graph; graph retrieval)
12. Evaluation (Recall@K, Precision@K, MRR/NDCG, faithfulness, latency, cost)
13. Custom retrieval plugins

**Core principle:** RetrievalOS is not a single RAG implementation — it is a configurable retrieval engine where strategies and providers can be replaced independently.

---

## Known gaps / notes

- `packages/core/nodes/knowledge_retrieal_node.ts`, `packages/core/nodes/web_search_node.ts`, and `packages/core/rag/ingestion/chunking.ts` are empty placeholders.
- The web search tool (`tools/web_search_tool.ts`) is implemented but not connected to any graph yet.
- `apps/cli/src/chat_graph_simple.ts` and `chat_graph_history.ts` import `packages/providers/src/agent/graph.ts`, which no longer exists — they predate the move to `packages/core/graph`.
- The TypeScript document loader uses a hardcoded file path and is a script, not yet a reusable loader.
- `services/graphrag/components/normalizer.py` is a stub.
- The `Retriever` interface, `RetrievalRegistry`, vector/hybrid/graph retrieval, reranking, and evaluation packages are not implemented yet.
- `npm test` is not configured.
