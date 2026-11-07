import "dotenv/config";
import { createPokemonAgent } from "./agent.js";
import { createModel } from "./model.js";
import { getPokemon } from "./tools/get-pokemon.js";

async function main(){
  const model = createModel();
  const agent = createPokemonAgent({
    model,
    tools:[getPokemon]
  });

  const result = await agent.invoke({
    messages:[
      {
        role:'user',
        content: "Quais são os tipos e as principais stats do bulbasaur?"
      },
    ],
  });

  const resposta = result.messages[result.messages.length -1];
  console.log("\n🤖 Resposta do agente:\n", resposta.content);
}

main().catch(console.error);