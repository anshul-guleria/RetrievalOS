import os
import asyncio
from dotenv import load_dotenv
load_dotenv()

from services.graphrag.components.loader import document_loader, Document, rich_print
from services.graphrag.components.chunker import chunk_documents_by_recursive_text_splitter
from services.graphrag.components.extractor import extract_from_chunk, validate_extraction
from services.graphrag.db.neo4j_client import neo4j_client
from services.graphrag.db.neo4j_writer import persist_chunk
from services.graphrag.embedding.google_embeddings import embed_chunk

import logging
logger=logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

async def ingest_documents(path: str, chunk_size: int, overlap: int):
    """Ingest and chunks the documents"""

    documents = document_loader(path)
    if not documents:
        logger.warning("No documents were loaded from: %s", path)
        return []

    chunked_documents = chunk_documents_by_recursive_text_splitter(documents, chunk_size=chunk_size, overlap=overlap)
    if not chunked_documents:
        logger.warning("No chunks were created from: %s", path)
        return []

    logger.info("Loaded %d document(s)", len(documents))
    logger.info("Created %d chunk(s)", len(chunked_documents))

    extraction_result=[]

    source=os.path.abspath(path)
    try:
        for index, chunk in enumerate(chunked_documents):

            chunk_text=chunk.page_content

            #Generate embedding for the text
            embedding = await embed_chunk(chunk_text)

            result=await extract_from_chunk(chunk)
            result=validate_extraction(result)

            extraction_result.append(result)

            # Save chunk and its graph data
            stats = await persist_chunk(
                driver=neo4j_client.driver,
                source=source,
                chunk_index=index,
                chunk_text=chunk_text,
                result=result,
                embedding=embedding,
                database=neo4j_client.database,
            )

            logger.info("Neo4j write result: %s", stats)

    except Exception as e:
        logging.error(f"Ingestion Failed: {e}")

    logger.info("Ingestion completed successfully.")

if __name__=="__main__":
    asyncio.run(ingest_documents(r"C:\Users\anshu\Desktop\RetrievalOS\ANSHUL_GULERIA_AI.pdf"))