import { MessagesValue, type GraphNode, StateGraph, START, END, StateSchema } from "@langchain/langgraph";
import { AgentState } from "./state.ts";
import { create_llm } from "../llm/index.ts";
import { HumanMessage, SystemMessage } from "langchain";


const chat_node = async(state: typeof AgentState.State) => {
    const llm=await create_llm();
    
    const messages=[
        new SystemMessage("You are a helpful AI assistant"),
        ...state.history,
        new HumanMessage(state.query)
    ]

    // console.log(...messages)

    const response=await llm.invoke(messages);

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

