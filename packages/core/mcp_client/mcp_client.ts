import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const mcpClient = new MultiServerMCPClient({
  servers: {
    graphRag: {
      transport: "stdio",
      command: "python",
      args: ["C:/Users/anshu/Desktop/RetrievalOS/services/mcp/mcp_server_graph_rag.py"],
    },
  },
});

// Discover the executable LangChain tools
const tools = await mcpClient.listTools();

console.log("Available MCP tools:", tools.map((tool) => tool.name));

export function getGraphRagTool() {
  const tool = tools.find(
    (tool) => tool.name === "graphRag_search_knowledge_base"
  );

  if (!tool) {
    throw new Error("search_knowledge_base MCP tool not found");
  }

  return tool;
}