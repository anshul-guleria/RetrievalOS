import { MessagesValue, type GraphNode, StateGraph, START, END, StateSchema } from "@langchain/langgraph";
import { AgentState } from "./state.ts";
import { create_llm } from "../llm/index.ts";


const chat_node = async(state: typeof AgentState.State) => {
    const llm=await create_llm("groq");
    
    const response=await llm.invoke(state.query);

    return {
        answer: response.content
    }

}

const builder=new StateGraph(AgentState);

const graph=builder.addNode("chat_node", chat_node)
.addEdge(START, "chat_node")
.addEdge("chat_node", END)
.compile()


export {graph}

