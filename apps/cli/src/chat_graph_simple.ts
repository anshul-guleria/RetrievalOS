import { graph } from "../../../packages/providers/src/agent/graph.ts";
import readline from "readline/promises"
import {stdin as input, stdout as output} from "process"

const rl = readline.createInterface({ input, output });

while(true) {
    const question=await rl.question(">User: ")
    const response=await graph.invoke({
        query: question
    })

    console.log(`>AI: ${response.answer}\n\n`)
}