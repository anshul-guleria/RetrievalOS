"""Chunks the documents into smaller parts"""
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
import logging
logger=logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

RECURSIVE_SPLITTER_CHUNK_SIZE=os.getenv("RECURSIVE_SPLITTER_CHUNK_SIZE")
RECURSIVE_SPLITTER_OVERLAP=os.getenv("RECURSIVE_SPLITTER_OVERLAP")

#using recursive text splitter
def chunk_documents_by_recursive_text_splitter(
    documents: list[Document],
    chunk_size: int = RECURSIVE_SPLITTER_CHUNK_SIZE, 
    overlap: int = RECURSIVE_SPLITTER_OVERLAP
) -> list[Document]:

    logging.info("Using Recursive Text Splitter for Chunking: Chunk Size = %d Overlap = %d", chunk_size, overlap)
    splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=overlap,
            add_start_index=True,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
    
    return splitter.split_documents(documents)