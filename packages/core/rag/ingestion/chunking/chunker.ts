import type { Document } from "@langchain/core/documents";

import { fixedChunking } from "./fixed_chunker.ts";
import { recursiveChunking } from "./recursive_chunker.ts";
import { semanticChunking } from "./semantic_chunker.ts";

import type {
  ChunkingConfig
} from "./types.ts";

export async function chunkDocuments(
  documents: Document[],
  config: ChunkingConfig,
): Promise<Document[]> {
  switch (config.strategy) {
    case "fixed":
      return fixedChunking(documents, config.options);

    case "recursive":
      return recursiveChunking(documents, config.options);

    case "semantic":
      return semanticChunking(
        documents,
        config.embeddings,
        config.options,
      );

    default: {
      const exhaustiveCheck: never = config;
      throw new Error(
        `Unsupported chunking configuration: ${exhaustiveCheck}`,
      );
    }
  }
}
