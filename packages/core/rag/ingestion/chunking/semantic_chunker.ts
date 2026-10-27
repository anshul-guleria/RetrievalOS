
import { Document } from "@langchain/core/documents";
import type { Embeddings } from "@langchain/core/embeddings";
import { cosineSimilarity } from "@langchain/core/utils/math";
import type { SemanticChunkingOptions } from "./types.ts";

function splitSentences(text: string): string[] {
  return (
    text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? []
  );
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;

  const result = sorted[Math.max(0, index)];

  if (result === undefined) {
    throw new Error("Failed to calculate percentile.");
  }

  return result;
}

export async function semanticChunking(
  documents: Document[],
  embeddings: Embeddings,
  options: SemanticChunkingOptions = {},
): Promise<Document[]> {
  const { breakpointPercentile = 90 } = options;

  if (
    !Number.isFinite(breakpointPercentile) ||
    breakpointPercentile <= 0 ||
    breakpointPercentile > 100
  ) {
    throw new Error(
      "breakpointPercentile must be greater than 0 and at most 100.",
    );
  }

  const chunks: Document[] = [];

  for (const document of documents) {
    const sentences = splitSentences(document.pageContent);

    if (sentences.length === 0) continue;

    if (sentences.length < 3) {
      chunks.push(
        new Document({
          pageContent: sentences.join(" "),
          metadata: { ...document.metadata },
        }),
      );
      continue;
    }

    const vectors = await embeddings.embedDocuments(sentences);

    if (vectors.length !== sentences.length) {
      throw new Error("Embedding count does not match sentence count.");
    }

    const distances: number[] = [];

    for (let i = 0; i < vectors.length - 1; i++) {
      const current = vectors[i];
      const next = vectors[i + 1];

      if (!current || !next) {
        throw new Error("Missing sentence embedding.");
      }

      const scores = cosineSimilarity([current], [next]);
      const similarity = scores[0]?.[0];

      if (similarity === undefined || !Number.isFinite(similarity)) {
        throw new Error("Could not calculate cosine similarity.");
      }

      distances.push(1 - similarity);
    }

    const threshold = percentile(distances, breakpointPercentile);
    let currentSentences: string[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];

      if (!sentence) continue;

      currentSentences.push(sentence);

      const isLast = i === sentences.length - 1;
      const topicChanged = !isLast && distances[i]! >= threshold;

      if (isLast || topicChanged) {
        chunks.push(
          new Document({
            pageContent: currentSentences.join(" "),
            metadata: { ...document.metadata },
          }),
        );

        currentSentences = [];
      }
    }
  }

  return chunks;
}
