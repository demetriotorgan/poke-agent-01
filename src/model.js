import { ChatGroq } from "@langchain/groq";

export function createModel(){
    return new ChatGroq({
        model: "qwen/qwen3.8-27b",
        // model: "openai/gpt-oss-20b",
        temperature: 0,
        maxTokens: 512,
    });
};

