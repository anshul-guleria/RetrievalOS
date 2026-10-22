
import { getGraphRagTool } from "../mcp_client/mcp_client.ts";

export async function knowledge_retrieval_node(state: {
  query: string;
}) {
  const tool = getGraphRagTool();

  const result = await tool.invoke({
    query: state.query,
  });
  
  return {
    context:
      typeof result === "string"
        ? result
        : JSON.stringify(result),
  };
}
