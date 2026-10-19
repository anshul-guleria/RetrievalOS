import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings

GOOGLE_EMBEDDING_MODEL=os.getenv("GOOGLE_EMBEDDING_MODEL", "models/gemini-embedding-001")

embedding_model = GoogleGenerativeAIEmbeddings(
    model=GOOGLE_EMBEDDING_MODEL,
    output_dimensionality=1536,
)

async def embed_chunk(text: str) -> list[float]:
    return await embedding_model.aembed_query(text)