import { StateSchema } from "@langchain/langgraph"
import { BaseMessage } from "langchain"
import { z } from "zod"

const ChatBotState = new StateSchema({
    query: z.string(),
    history: z.array(z.instanceof(BaseMessage)),
    context: z.string(),
    answer: z.string()
})

export {ChatBotState}