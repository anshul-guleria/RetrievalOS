"""Chunks the documents into smaller parts"""

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

#using recursive text splitter
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    add_start_index=True,
    separators=["\n\n", "\n", ". ", " ", ""],
)


def chunk_documents_by_recursive_text_splitter(
    documents: list[Document],
) -> list[Document]:
    return splitter.split_documents(documents)