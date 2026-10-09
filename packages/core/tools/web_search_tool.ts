import { TavilySearch } from "@langchain/tavily";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const tavilySearch = new TavilySearch({
  maxResults: 5
});

const web_search_tool=tool(
    async ({query}) => {
        const result = await tavilySearch.invoke({query});
        return JSON.stringify(result);
    },
    {
        name: "web_search_tool",
        description: "Searches the internet for the current information",
        schema: z.object({
            query: z.string().describe("The search query")
        })
    }
)

export {web_search_tool}