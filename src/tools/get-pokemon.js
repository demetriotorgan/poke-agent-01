import { tool } from "@langchain/core/tools";
import z from "zod";

export const getPokemon = tool(
    async ({ name }) => {
        // console.log("🔧 Ferramenta chamada com name:", name);
        try {
            const url = `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`;
            // console.log("Chamando URL: ", url);

            const res = await fetch(url);
            // console.log("📡 Status da resposta:", res.status);

            if (!res.ok) {
                const erro = `Pokémon "${name}" não encontrado. Verifique o nome ou ID.`;
                console.log("❌ Erro tratado:", erro);
                return erro;
            }

            const data = await res.json();

            const resultado = JSON.stringify({
                nome: data.name,
                id: data.id,
                tipos: data.types.map((t) => t.type.name),
                stats: data.stats.map((s) => ({ nome: s.stat.name, base: s.base_stat })),
                altura: data.height,
                peso: data.weight,
                habilidades: data.abilities.map((a) => a.ability.name),
            });
            // console.log("✅ Resultado da ferramenta:", resultado);
            return resultado;

        } catch (error) {
            console.error("💥 Exceção na ferramenta:", error.message);
            return `Erro técnico ao buscar Pokémon: ${error.message}`;
        }
    },
    {
        name: "get_pokemon",
        description: "Busca dados de um Pokémon pelo nome ou ID na PokeAPI.",
        schema: z.object({
            name: z.string().describe("Nome ou ID do Pokémon (ex: 'pikachu' ou '25')")
        })
    }
);