import { StateSchema } from "@langchain/langgraph"
import { BaseMessage } from "langchain"
import { z } from "zod"

const AgentState = new StateSchema({
    query: z.string(),
    answer: z.string()
})

export {AgentState}