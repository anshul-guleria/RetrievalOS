import sys
from pathlib import Path

# RetrievalOS project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from services.graphrag.pipeline.retrieval import retrieve_context
from fastmcp import FastMCP
from typing import Any

mcp=FastMCP("graph-rag")

@mcp.tool
async def search_knowledge_base(query: str) -> dict[str, Any]:
    """Retrieve relevant context from the knowledge graph for a user query."""
    result = await retrieve_context(query)
    return result

if __name__ == "__main__":
    mcp.run(transport="stdio")