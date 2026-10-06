import "dotenv/config"

const LLM_PROVIDER=process.env.LLM_PROVIDER || "gemini"

async function create_llm(provider: string = LLM_PROVIDER) {
    if(provider==="gemini") {
        const { create_gemini_llm }= await import("./gemini.ts");
        const gemini_llm = create_gemini_llm();
        return gemini_llm;
    }
    else if(provider==="groq") {
        const { create_groq_llm }= await import("./groq.ts");
        const groq_llm = create_groq_llm();
        return groq_llm;
    }
    else {
        const { create_gemini_llm }= await import("./gemini.ts");
        const gemini_llm = create_gemini_llm();
        return gemini_llm;
    }
}


export {create_llm}