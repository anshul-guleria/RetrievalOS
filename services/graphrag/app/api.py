import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path

from services.graphrag.pipeline.ingestion import ingest_documents

app = FastAPI(title="Graph RAG API")

class IngestionRequest(BaseModel):
    path: str


@app.post("/graph-rag/ingest")
async def ingest_documents_in_graph_db(request: IngestionRequest):
    """Ingest a document into Neo4j."""

    path = Path(request.path)

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
        results = await ingest_documents(str(path))

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


if __name__ == "__main__":
    uvicorn.run(
        "services.graphrag.app.api:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
