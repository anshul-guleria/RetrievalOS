import os
import asyncio
from dotenv import load_dotenv
load_dotenv()

from services.graphrag.components.loader import document_loader, Document, rich_print
from services.graphrag.components.chunker import chunk_documents_by_recursive_text_splitter
from services.graphrag.components.extractor import extract_from_chunk

def ingest_documents(path: str) -> list[Document]:
    """Ingest and chunks the documents"""
    documents = document_loader(path)
    chunked_documents = chunk_documents_by_recursive_text_splitter(documents)
    return chunked_documents

docs=ingest_documents(r"C:\Users\anshu\Desktop\RetrievalOS\ANSHUL_GULERIA_AI.pdf")
rich_print(docs)

chunk=docs[0]

result = asyncio.run(
    extract_from_chunk(chunk.page_content)
    )

print("Entities:")
for entity in result.entities:
    print(entity.model_dump())

print("Relationships:")
for relation in result.relations:
    print(relation.model_dump())

