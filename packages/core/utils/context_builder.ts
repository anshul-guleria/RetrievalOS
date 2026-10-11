import { BaseMessage, HumanMessage, SystemMessage } from "langchain";
import { SYSTEM_PROMPT } from "../prompts/prompts.ts";

const build_message = ({
    query,
    history = [],
    context = "",
    system_prompt = SYSTEM_PROMPT
}: {
    query: string;
    history?: BaseMessage[];
    context?: string;
    system_prompt?: string;
}) => {
    return [
        new SystemMessage(SYSTEM_PROMPT + `\n\nContext: ${context}`),
        ...history,
        new HumanMessage(query)
    ]
}


export {build_message}