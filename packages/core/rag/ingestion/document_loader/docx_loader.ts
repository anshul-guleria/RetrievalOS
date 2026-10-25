import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { access } from "node:fs/promises";
import path from "node:path"

const docx_loader =  async(filePath: string) => {
    
    const loader = new DocxLoader(filePath);
    
    const documents = await loader.load();

    return documents;
}

export {docx_loader};