import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { tool } from "@langchain/core/tools";
import { z } from "zod"

const web_search_tool=tool(
    async ({query}) => {
        return await new DuckDuckGoSearch({
            maxResults:5
        }).invoke(query)
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