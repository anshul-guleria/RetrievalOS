import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"

const basic_pdf_loader = async(filePath: string) => {
  //function to load pdf (simple no ocr)

  const loader = new PDFLoader(filePath);

  const documents = await loader.load();

  return documents;

}


//the unstructured pdf loaders will be written in python as unstructured doesnt provide native library for unstructured local deployment

export {basic_pdf_loader}