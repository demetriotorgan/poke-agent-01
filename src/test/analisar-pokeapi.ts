/**
 * 📊 Módulo de análise da resposta da PokeAPI
 *
 * Objetivo: inspecionar a estrutura crua da API e a formatação atual da
 * ferramenta `get_pokemon`, para decidir quais campos são essenciais e
 * reduzir o tamanho da saída (evitando estourar o OTPM).
 *
 * Como rodar:
 *   npx tsx src/test/analisar-pokeapi.ts [nomeOuId] [--raw]
 * Exemplos:
 *   npx tsx src/test/analisar-pokeapi.ts pikachu
 *   npx tsx src/test/analisar-pokeapi.ts 25 --raw
 *
 * --raw grava a resposta crua completa em arquivo JSON para inspeção no editor.
 */

const ALVO = (process.argv[2] ?? "pikachu").toLowerCase();
const GRAVAR_RAW = process.argv.includes("--raw");

// ----------------------------- helpers -----------------------------

const tipoDe = (v: unknown): string => {
  if (v === null) return "null";
  if (Array.isArray(v)) return `array[${v.length}]`;
  if (typeof v === "object") return "object";
  return typeof v;
};

const amostra = (v: unknown, limite = 70): string => {
  const t = JSON.stringify(v) ?? String(v);
  return t.length > limite ? `${t.slice(0, limite)}…` : t;
};

const tamanho = (v: unknown): number => (JSON.stringify(v) ?? "").length;

const tokens = (texto: string): number => Math.ceil(texto.length / 4); // ~4 chars/token

function analisarObjeto(obj: Record<string, unknown>, prefixo = ""): void {
  const linhas = Object.entries(obj)
    .map(([chave, valor]) => ({
      chave,
      tipo: tipoDe(valor),
      tamanho: tamanho(valor),
      amostra: amostra(valor),
    }))
    .sort((a, b) => b.tamanho - a.tamanho);

  console.log(`${prefixo}${"Campo".padEnd(22)} | ${"Tipo".padEnd(14)} | Tamanho | Amostra`);
  console.log("-".repeat(100));
  for (const l of linhas) {
    console.log(
      `${prefixo}${l.chave.padEnd(22)} | ${l.tipo.padEnd(14)} | ${String(l.tamanho).padStart(7)} | ${l.amostra}`
    );
  }
  const total = linhas.reduce((s, l) => s + l.tamanho, 0);
  console.log("-".repeat(100));
  console.log(`${prefixo}Total: ${total} chars (~${tokens(JSON.stringify(obj))} tokens)\n`);
}

// ------------------------------ main -------------------------------

async function main(): Promise<void> {
  const url = `https://pokeapi.co/api/v2/pokemon/${ALVO}`;
  console.log(`🔎 Analisando: ${ALVO}`);
  console.log(`   URL: ${url}\n`);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`❌ Erro ${res.status}: Pokémon não encontrado. Verifique nome/ID.`);
    process.exit(1);
  }

  const cru = (await res.json()) as Record<string, any>;

  if (GRAVAR_RAW) {
    const caminho = `pokeapi-cru-${ALVO}.json`;
    const fs = await import("node:fs/promises");
    await fs.writeFile(caminho, JSON.stringify(cru, null, 2));
    console.log(`💾 Resposta crua gravada em: ${caminho}\n`);
  }

  // 1) Campos de 1º nível da resposta crua
  console.log("📦 1. RESPOSTA CRUA — campos de 1º nível (ordenados por tamanho)");
  analisarObjeto(cru);

  // 2) Estrutura dos campos aninhados relevantes
  console.log("🧩 2. ESTRUTURA DOS CAMPOS ANINHADOS");

  if (cru.abilities?.length) {
    console.log("\n→ abilities[0]:");
    analisarObjeto(cru.abilities[0], "   ");
  }
  if (cru.stats?.length) {
    console.log("→ stats[0]:");
    analisarObjeto(cru.stats[0], "   ");
  }
  if (cru.types?.length) {
    console.log("→ types[0]:");
    analisarObjeto(cru.types[0], "   ");
  }

  console.log("→ sprites (chaves disponíveis):");
  console.log(`   ${Object.keys(cru.sprites ?? {}).join(", ")}\n`);

  console.log(`→ moves: ${(cru.moves ?? []).length} itens — amostra: ${amostra((cru.moves ?? [])[0])}`);
  console.log(`→ game_indices: ${(cru.game_indices ?? []).length} itens`);
  console.log(`→ held_items: ${(cru.held_items ?? []).length} itens\n`);

  // 3) Formato ATUAL da ferramenta
  console.log("✂️ 3. FORMATO ATUAL (o que get_pokemon retorna hoje)");
  const atual = {
    nome: cru.name,
    id: cru.id,
    tipos: (cru.types ?? []).map((t: any) => t.type.name),
    stats: (cru.stats ?? []).map((s: any) => ({ nome: s.stat.name, base: s.base_stat })),
    altura: cru.height,
    peso: cru.weight,
    habilidades: (cru.abilities ?? []).map((a: any) => a.ability.name),
  };
  const textoAtual = JSON.stringify(atual);
  console.log(textoAtual);
  console.log(`\n→ Tamanho: ${textoAtual.length} chars (~${tokens(textoAtual)} tokens)\n`);

  // 4) Comparativo
  console.log("⚖️ 4. COMPARATIVO DE TAMANHO");
  const tamanhoCru = tamanho(cru);
  const reducao = 100 - Math.round((textoAtual.length / tamanhoCru) * 100);
  console.log(`   Resposta crua completa : ${tamanhoCru} chars (~${tokens(JSON.stringify(cru))} tokens)`);
  console.log(`   Formato atual da tool  : ${textoAtual.length} chars (~${tokens(textoAtual)} tokens)`);
  console.log(`   Redução aplicada       : ${reducao}%`);
}

main().catch((e) => {
  console.error("💥 Erro:", e);
  process.exit(1);
});
