import { StateGraph, START, END } from "@langchain/langgraph";
import { llm_node } from "../nodes/llm_node.ts";
import { knowledge_retrieval_node } from "../nodes/knowledge_retrieal_node.ts";
import { ChatBotState } from "../model/state.ts";

const builder = new StateGraph(ChatBotState);

const graph = builder
  .addNode("knowledge_retrieval", knowledge_retrieval_node)
  .addNode("chat_node", llm_node)
  .addEdge(START, "knowledge_retrieval")
  .addEdge("knowledge_retrieval", "chat_node")
  .addEdge("chat_node", END)
  .compile();

export { graph };
