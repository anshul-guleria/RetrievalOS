import readline from "readline/promises"
import {stdin as input, stdout as output} from "process"
import { AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage } from "langchain";
import { StringOutputParser } from "@langchain/core/output_parsers"

import { MessagesValue, type GraphNode, StateGraph, START, END, StateSchema } from "@langchain/langgraph";
import { AgentState } from "../../../packages/providers/src/agent/state.ts";
import { create_llm } from "../../../packages/providers/src/llm/index.ts";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { web_search_tool } from "../../../packages/core/tools/web_search_tool.ts";

const output_parser=new StringOutputParser();

const chat_node = async(state: typeof AgentState.State) => {
    const llm=(await create_llm("gemini")).bindTools([web_search_tool]);

    const last_message=state.history.at(-1)
    const messages = [
        new SystemMessage(`
            You are a helpful AI assistant.

            For any question requiring current, real-time, or up-to-date information,
            always use the web_search tool before answering.
            `),
        ...state.history,
    ];

    if (!(last_message instanceof HumanMessage) && !(last_message instanceof ToolMessage)) {
        messages.push(new HumanMessage(state.query));
    }

    const response=await llm.invoke(messages);
    
    if (typeof response?.content == typeof "") {
        return {
            history: [
            ...state.history,
            new HumanMessage(state.query),
            response,
        ],
        answer: response?.content
        }
    }
    return {
        history: [
            ...state.history,
            new HumanMessage(state.query),
            response,
        ]
    }

}



const tool_node = async (state: typeof AgentState.State) => {

    console.log("Tool node running")
    
    const last_message = state.history.at(-1);
    
    if (!(last_message instanceof AIMessage)) {
        return {};
    }
    
    const tool_messages = [];
    
    for (const tool_call of last_message.tool_calls ?? []) {
        
        console.log(
            "Tool called with query:",
            (tool_call.args as { query: string }).query
        );

        if (tool_call.name === "web_search_tool") {
            
            const result = await web_search_tool.invoke(
                tool_call.args as { query: string }
            );
            // console.log(`Content`)
            // console.log(result)
            tool_messages.push(
                new ToolMessage({
                    content: result,
                    tool_call_id: tool_call.id!,
                })
            );
        }
    }

    // for (const message of tool_messages) {
    //     console.log("Tool message:", message.content);
    // }
    return {
        history: [
            ...state.history,
            ...tool_messages,
        ],
    };
};

const should_continue = (state: typeof AgentState.State) => {
    const last_message = state.history.at(-1);

    if(last_message instanceof AIMessage && last_message.tool_calls?.length) {
        return "tool_node"
    }

    return END;
}


const builder=new StateGraph(AgentState);

const graph=builder.addNode("chat_node", chat_node)
.addNode("tool_node", tool_node)
.addEdge(START, "chat_node")
.addConditionalEdges("chat_node", should_continue)
.addEdge("tool_node", "chat_node")
.compile()


const rl = readline.createInterface({ input, output });

const history: BaseMessage[] = []


while(true) {
    const question=await rl.question(">User: ")

    const response=await graph.invoke({
        query: question,
        history:history
    })

    history.push(new HumanMessage(question), new AIMessage(response.answer))


    console.log(`>AI: ${response.answer}\n\n`)
}