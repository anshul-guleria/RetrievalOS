import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"

const file_path="packages/core/rag/documents/ANSHUL_GULERIA_AI.pdf"

const loader = new PDFLoader(file_path);

const docs=await loader.load()

console.log(docs)