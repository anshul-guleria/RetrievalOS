import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import "dotenv/config"

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || "no-api-key-set", // Default value.
  model: process.env.GROQ_LLM_MODEL || "openai/gpt-oss-20b",
});

export {model}