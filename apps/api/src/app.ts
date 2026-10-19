import express from "express";
import axios from "axios"
import {router} from "./routes/chat.routes.ts";
import {graph_rag_router} from "./routes/graph_rag.routes.ts"

const app = express();

app.use(express.json());

app.use((req, res, next) => {

    res.on("finish", ()=> {
        console.log(`${req.method} ${req.url} ${res.statusCode}`);
    })
    // console.log("Headers:", req.headers);

    next();
});


app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/graphrag", graph_rag_router);

app.use("/api/chat", router);

export default app;
