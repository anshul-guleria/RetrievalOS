
import { Router, type Request, type Response } from "express";
import axios from "axios";
import "dotenv/config";

import { graph } from "../../../../packages/core/graph/graphrag_chat_app.ts";

const GRAPH_RAG_FASTAPI_URL =
  process.env.GRAPH_RAG_FASTAPI_URL ??
  "http://localhost:8000/graphrag/ingest-document";

const graph_rag_router = Router();

// Ingest a document into Graph RAG
graph_rag_router.post(
  "/ingest-document",
  async (req: Request, res: Response) => {
    try {
      const file_path: string | undefined = req.body?.path;
      const chunk_size: number | undefined = req.body?.chunk_size;
      const overlap: number | undefined = req.body?.overlap;

      if (!file_path) {
        res.status(400).json({ error: "Document path is required" });
        return;
      }

      const response = await axios.post(GRAPH_RAG_FASTAPI_URL, {
        path: file_path,
        chunk_size,
        overlap,
      });

      res.status(200).json(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        res.status(error.response?.status ?? 502).json({
          error: error.response?.data?.detail ?? error.message,
        });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Chat using the LangGraph + Graph RAG workflow

graph_rag_router.post(
  "/chat",
  async (req: Request, res: Response) => {
    try {
      const query: string | undefined = req.body?.query;

      if (!query || typeof query !== "string" || !query.trim()) {
        res.status(400).json({
          error: "A valid query is required",
        });
        return;
      }

      const response = await graph.invoke({
        query: query.trim(),
      });

      res.status(200).json({
        query: query.trim(),
        context: response.context,
        answer: response.answer,
      });
    } catch (error: unknown) {
      console.error("Graph RAG chat error:", error);

      res.status(500).json({
        error: "Failed to process chat request",
      });
    }
  }
);

export {graph_rag_router}