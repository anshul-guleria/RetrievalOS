import { create_llm } from "../../../packages/providers/src/llm/index.ts";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const rl = readline.createInterface({ input, output });

const query = await rl.question(">User: ");

const llm=await create_llm();

const response = await llm.invoke(query);

console.log(`>AI: ${response.content}\n`);
console.log(`>AI: ${response.content.toString()}`);

rl.close();