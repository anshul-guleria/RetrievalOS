"""Document Loader/Parser for RAG"""

"""Supported types: pdf, md, txt, docx"""

from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_core.documents import Document

from pathlib import Path

from rich import print as rich_print

SUPPORTED_EXT= {
    ".pdf", ".md", ".txt", ".docx"
}

def document_loader(file_path: str) -> list[Document]:
    path=Path(file_path)

    extension=path.suffix.lower()

    if extension not in SUPPORTED_EXT:
        raise ValueError(f"Unsupported file type: {extension}")

    if extension=='.pdf':
        loader=PyPDFLoader(str(path))

    elif extension=='.txt' or extension=='.md':
        loader=TextLoader(str(path), encoding='utf-8')

    else:
        loader=Docx2txtLoader(str(path))

    documents=loader.load()

    for document in documents:
        document.metadata['source']=str(path)
        document.metadata['file_type']=extension.lstrip('.')

    return documents


# rich_print(document_loader(r'C:\Users\anshu\Desktop\RetrievalOS\proposed-structure.md'))
# rich_print(document_loader(r'C:\Users\anshu\Desktop\RetrievalOS\ANSHUL_GULERIA_AI.pdf'))
# rich_print(document_loader(r'C:\Users\anshu\Desktop\RetrievalOS\Anshul_Guleria_Resume (1).docx'))
