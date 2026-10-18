import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
load_dotenv()

GEMINI_MODEL=os.getenv("GEMINI_MODEL","gemini-3.5-flash")


def create_gemini_llm(model: str = GEMINI_MODEL, temperature: float = 0.1, thinking_budget: int = 0) -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=model,
        temperature=temperature,
        max_output_tokens=1024,
        thinking_budget=thinking_budget
    )