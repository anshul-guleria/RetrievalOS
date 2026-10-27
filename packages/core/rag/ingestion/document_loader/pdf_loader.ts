import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import type { BasicPdfLoaderOptions } from "./types.ts";

const basic_pdf_loader = async(filePath: string,
  options: BasicPdfLoaderOptions = {}
) => {
  //function to load pdf (simple no ocr)
  const { splitPages = true } = options;

  const loader = new PDFLoader(filePath, {
    splitPages,
  });

  const documents = await loader.load();

  return documents;

}

//the unstructured pdf loaders will be written in python as unstructured doesnt provide native library for unstructured local deployment

export {basic_pdf_loader}