import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import "dotenv/config"

// const GroqLLM = new ChatGroq({
//   apiKey: process.env.GROQ_API_KEY || "no-api-key-set", // Default value.
//   model: process.env.GROQ_LLM_MODEL || "openai/gpt-oss-20b",
// });

const GROQ_API_KEY=process.env.GROQ_API_KEY || "";
const GROQ_LLM_MODEL=process.env.GROQ_LLM_MODEL || "";

function create_groq_llm(api_key: string = GROQ_API_KEY, model: string = GROQ_LLM_MODEL) {
  return new ChatGroq({
    apiKey: api_key,
    model: model
  })
}


export {create_groq_llm}