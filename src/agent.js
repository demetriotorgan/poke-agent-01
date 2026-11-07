import { createAgent } from "langchain";
import { SYSTEM_PROMPT } from "./prompts.js";

export function createPokemonAgent({model, tools}){
    return createAgent({
        model,
        tools,
        systemPrompt: SYSTEM_PROMPT
    });
};

