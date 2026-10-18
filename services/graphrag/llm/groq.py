import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv
load_dotenv()

GROQ_MODEL=os.getenv("GROQ_MODEL","openai/gpt-oss-20b")


def create_groq_llm(model: str = GROQ_MODEL, temperature: float = 0.1, thinking_budget: int = 0) -> ChatGroq:
    return ChatGroq(
        model=model,
        temperature=temperature,
        reasoning_effort='low',
        max_tokens=8096
    )