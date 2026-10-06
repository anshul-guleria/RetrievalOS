import { create_llm } from "../../../packages/providers/llm/src/index.ts";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

const history: BaseMessage[] = []

const rl = readline.createInterface({ input, output });

const llm=await create_llm("groq");

const chat = async(message: string) => {
    const response=await llm.invoke([
        ...history,
        new HumanMessage(message)
    ])

    history.push(new HumanMessage(message));
    history.push(new AIMessage(response.content))

    return response.content;
}

while(true) {
    // console.info(`History: ${JSON.stringify(history, null, 2)}`)

    const question=await rl.question(">User: ")
    const response=await chat(question);

    console.log(`>AI: ${response}\n\n`)
}
