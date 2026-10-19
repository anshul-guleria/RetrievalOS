import { Router } from "express";
import { graph } from "../../../../packages/core/graph/simple_chat_graph.ts";

const router = Router();

router.post("/", async (req, res, next) => {
    try {
        const { query } = req.body ?? {};

        if (typeof query !== "string" || !query.trim()) {
            res.status(400).json({
                error: "query must be a non-empty string"
            });
            return;
        }

        const result = await graph.invoke({
            query: query.trim(),
            history: [],
            context: "",
            answer: ""
        });

        res.json({
            answer: result.answer
        });
    } catch (error) {
        next(error);
    }
});

export {router};