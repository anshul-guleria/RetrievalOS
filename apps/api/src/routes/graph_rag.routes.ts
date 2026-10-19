import {Router, type Request, type Response} from "express";
import axios from "axios"
import path from "path";
import "dotenv"

const GRAPH_RAG_FASTAPI_URL=process.env.GRAPH_RAG_FASTAPI_URL || "http://localhost:8000/graphrag/ingest-document";

const graph_rag_router=Router();

graph_rag_router.post('/ingest-document' , async(req: Request, res: Response) => {
    
    try {
        const file_path: string | undefined = req.body?.path;
        const chunk_size: number | undefined = req.body?.chunk_size;
        const overlap: number | undefined = req.body?.overlap;
        
        const response = await axios.post(
            GRAPH_RAG_FASTAPI_URL, {
                path: file_path,
                chunk_size: chunk_size,
                overlap: overlap
            }
        );
        res.status(200).json(response.data);
    }
    catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        res.status(error.response?.status ?? 502).json({
          error: error.response?.data?.detail ?? error.message,
        });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
})

export {graph_rag_router};