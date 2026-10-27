import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { RecursiveChunkingOptions } from "./types.ts";

export async function recursiveChunking(
  documents: Document[],
  options: RecursiveChunkingOptions = {},
): Promise<Document[]> {
  const {
    chunkSize = 1000,
    chunkOverlap = 200,
  } = options;

  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error("chunkSize must be a positive integer.");
  }

  if (
    !Number.isInteger(chunkOverlap) ||
    chunkOverlap < 0 ||
    chunkOverlap >= chunkSize
  ) {
    throw new Error(
      "chunkOverlap must be a non-negative integer smaller than chunkSize.",
    );
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  return splitter.splitDocuments(documents);
}
