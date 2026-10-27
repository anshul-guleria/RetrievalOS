import { Embeddings } from "@langchain/core/embeddings";

export interface FixedChunkingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export interface RecursiveChunkingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}


export interface SemanticChunkingOptions {
  breakpointPercentile?: number;
  minChunkSize?: number;
}

export type ChunkingConfig =
  | {
      strategy: "fixed";
      options?: FixedChunkingOptions;
    }
  | {
      strategy: "recursive";
      options?: RecursiveChunkingOptions;
    }
  | {
      strategy: "semantic";
      options?: SemanticChunkingOptions;
      embeddings: Embeddings;
    };
