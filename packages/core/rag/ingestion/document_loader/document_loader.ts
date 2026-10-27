//complete to load all documents
import { access } from "node:fs/promises";
import path from "node:path"
import { docx_loader } from "./docx_loader.ts";
import { basic_pdf_loader } from "./pdf_loader.ts";
import { txt_loader } from "./txt_loader.ts"

import type { LoadDocumentOptions } from "./types.ts";


const load_document = async(
    filePath: string,
    options: LoadDocumentOptions = {}
) => {

    if(!filePath || typeof filePath!='string') {
        throw new Error("File path must be a non-empty string!")
    }

    const resolvedPath = path.resolve(filePath);

    access(resolvedPath);

    const ext = path.extname(resolvedPath).toLowerCase();

    switch(ext) {
        case ".pdf":
            return await basic_pdf_loader(resolvedPath, {
                splitPages: options.splitPages ?? true
            });

        case ".docx":
            return await docx_loader(resolvedPath);

        case ".md":
        case ".txt":
            return await txt_loader(resolvedPath);

        default:
            throw new Error(`Unsupported file extension: ${ext}`);
    }
}

export {load_document};
