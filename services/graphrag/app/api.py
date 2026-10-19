import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path
from contextlib import asynccontextmanager

from services.graphrag.pipeline.ingestion import ingest_documents
from services.graphrag.pipeline.retrieval import retrieve_context_text
from services.graphrag.db.neo4j_client import neo4j_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    await neo4j_client.connect()
    await neo4j_client.create_vector_index()
    try:
        yield
    finally:
        await neo4j_client.close()


app = FastAPI(title="Graph RAG API",lifespan=lifespan)

class IngestionRequest(BaseModel):
    path: str
    chunk_size: int
    overlap: int

class RetrievalRequest(BaseModel):
    question: str
    top_k: int=5

@app.post("/graphrag/ingest-document")
async def ingest_documents_in_graph_db(request: IngestionRequest):
    """Ingest a document into Neo4j."""

    path = Path(request.path)
    chunk_size=request.chunk_size
    overlap=request.overlap

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Path not found: {request.path}",
        )

    if not path.is_file():
        raise HTTPException(
            status_code=400,
            detail="The path must point to a file.",
        )

    try:
        results = await ingest_documents(str(path), chunk_size=chunk_size, overlap=overlap)

        return {
            "message": "Document ingested successfully",
            "path": str(path),
            "results": results,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Ingestion failed: {str(exc)}",
        ) from exc

@app.post("/graphrag/retrieve")
async def retrieve_context_from_graph_db(request: RetrievalRequest):
    """Retrieve context from graph DB"""
    
    question = request.question
    top_k = request.top_k

    if not question or not question.strip():
        raise HTTPException(
            status_code=400,
            detail="The question must be a non-empty string.",
        )

    if top_k < 1:
        raise HTTPException(
            status_code=400,
            detail="top_k must be at least 1.",
        )

    try:
        results = await retrieve_context_text(question=question, top_k=top_k)

        return {
            "message": "Context retrieved successfully",
            "question": question,
            "results": results,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Retrieval failed: {str(exc)}",
        ) from exc

if __name__ == "__main__":
    uvicorn.run(
        "services.graphrag.app.api:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
