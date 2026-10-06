import { create_llm } from "../../../packages/providers/llm/src/index.ts";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const rl = readline.createInterface({ input, output });

const query = await rl.question(">User: ");

const llm=await create_llm();

const response = await llm.invoke(query);

console.log(`>AI: ${response.content}`);

rl.close();