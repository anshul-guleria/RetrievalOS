import { StateGraph, START, END } from "@langchain/langgraph";
import { llm_node } from "../nodes/llm_node.ts";
import { ChatBotState } from "../model/state.ts";

//
import readline from "readline/promises"
import {stdin as input, stdout as output} from "process"
//

const builder=new StateGraph(ChatBotState);

const graph = builder
.addNode("chat_node", llm_node)
.addEdge(START, "chat_node")
.addEdge("chat_node", END)
.compile()

// export {graph}

const rl = readline.createInterface({ input, output });
while(1) {
    const question=await rl.question(">User: ")

    const response=await graph.invoke({
        query: question
    })

    console.log(`>AI: ${response.answer}\n\n`)
}