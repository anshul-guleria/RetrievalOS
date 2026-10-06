import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import "dotenv/config"

const GOOGLE_API_KEY=process.env.GOOGLE_API_KEY || "";
const GEMINI_LLM_MODEL=process.env.GEMINI_LLM_MODEL || "";

function create_gemini_llm(api_key: string = GOOGLE_API_KEY, model: string = GEMINI_LLM_MODEL) {
  return new ChatGoogleGenerativeAI({
    apiKey: api_key,
    model: model
  })
}


export {create_gemini_llm}