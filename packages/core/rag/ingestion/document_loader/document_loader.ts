//complete to load all documents
import { access } from "node:fs/promises";
import path from "node:path"

const load_document = async(filePath: string) =>{

    if(!filePath || typeof filePath!='string') {
        throw new Error("File path must be a non-empty string!")
    }

    const resolvedPath = await path.resolve(filePath);

    access(resolvedPath);

    const ext = path.extname(resolvedPath).toLowerCase();

    //to be completed
}
