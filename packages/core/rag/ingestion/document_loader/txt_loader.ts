import { TextLoader } from "@langchain/classic/document_loaders/fs/text";

const txt_loader = async(filePath: string) => {

    const loader = new TextLoader(filePath);

    const docs = await loader.load();

    return docs;
}

export {txt_loader}