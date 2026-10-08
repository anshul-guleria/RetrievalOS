import { StateSchema } from "@langchain/langgraph"
import { BaseMessage } from "langchain"
import { z } from "zod"

const AgentState = new StateSchema({
    query: z.string(),
    history: z.array(z.instanceof(BaseMessage)),
    answer: z.string()
})

export {AgentState}