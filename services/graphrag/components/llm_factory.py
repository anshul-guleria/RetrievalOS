import os
from services.graphrag.llm import gemini, groq

LLM_PROVIDER=os.getenv("LLM_PROVIDER", "gemini")

def create_llm(llm_provider: str = LLM_PROVIDER):
    if llm_provider=="groq":
        return groq.create_groq_llm()
    elif llm_provider=='gemini':
        return gemini.create_gemini_llm()
    else:
        raise ValueError(f"Invalid LLM Provider: {LLM_PROVIDER}")

