import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const dimensions = 1024;
export function embeddingModel() {
  const url = process.env.AZYMUT_EMBED_URL;
  const name = process.env.AZYMUT_EMBED_NAME;
  if (!url || !name) return null;
  const provider = createOpenAICompatible({
    name: "azymut-embeddings",
    baseURL: url,
    apiKey: process.env.AZYMUT_EMBED_TOKEN || undefined,
  });
  return { name, model: provider.embeddingModel(name) };
}

export function serializeVector(vector: number[]) {
  if (
    vector.length !== dimensions ||
    !vector.every(Number.isFinite) ||
    vector.every((value) => value === 0)
  ) {
    throw new Error("Niepoprawny wektor modelu embeddingowego.");
  }
  return "[" + vector.join(",") + "]";
}
