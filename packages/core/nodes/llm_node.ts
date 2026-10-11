import { BaseMessage, HumanMessage } from "langchain";
import { create_llm } from "../../providers/src/llm/index.ts";
import { ChatBotState } from "../model/state.ts";
import { build_message } from "../utils/context_builder.ts";

const llm_node=async(state: typeof ChatBotState.State) => {
    const history = state.history ?? []
    const message = build_message({
        query: state.query,
        history: state.history,
        context: state.context
    })

    const llm=await create_llm(process.env.LLM_PROVIDER ?? "groq")

    const response = await llm.invoke(message)

    return {
        history: [
            ...history,
            new HumanMessage(state.query),
            response,
        ],
        answer: response.content
    }
}


export {llm_node}