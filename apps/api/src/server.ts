import "dotenv/config";
import app from "./app.ts";

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
    console.log(`Chat API running at http://localhost:${PORT}`);
});