import { Document } from "@langchain/core/documents";
import type { FixedChunkingOptions } from "./types.ts";

export function fixedChunking(
  documents: Document[],
  options: FixedChunkingOptions = {},
): Document[] {
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

  const chunks: Document[] = [];
  const step = chunkSize - chunkOverlap;

  for (const document of documents) {
    const text = document.pageContent;

    for (let start = 0; start < text.length; start += step) {
      const content = text.slice(start, start + chunkSize);

      if (content.length === 0) {
        break;
      }

      chunks.push(
        new Document({
          pageContent: content,
          metadata: { ...document.metadata },
        }),
      );
    }
  }

  return chunks;
}