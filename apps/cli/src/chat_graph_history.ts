import { graph } from "../../../packages/providers/src/agent/graph.ts";
import readline from "readline/promises"
import {stdin as input, stdout as output} from "process"
import { AIMessage, BaseMessage, HumanMessage } from "langchain";

const rl = readline.createInterface({ input, output });

const history: BaseMessage[] = []

while(true) {
    const question=await rl.question(">User: ")

    const response=await graph.invoke({
        query: question,
        history:history
    })

    history.push(...[new HumanMessage(question), new AIMessage(response.answer)])


    console.log(`>AI: ${response.answer}\n\n`)
}