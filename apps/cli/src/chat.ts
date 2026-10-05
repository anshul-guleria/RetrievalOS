import { model } from "../../../packages/providers/llm/src/groq.ts";

import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const rl = readline.createInterface({ input, output });

const query = await rl.question(">User: ");

const response = await model.invoke(query);

console.log(`>AI: ${response.content}`);

rl.close();