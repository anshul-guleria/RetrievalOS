import express from "express";
import {router} from "./routes/chat.routes.ts";

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

app.use("/api/chat", router);

export default app;
