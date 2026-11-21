import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { embed } from "ai";
import { sql } from "drizzle-orm";
import { getDatabase } from "./db";
import { embeddingModel, serializeVector } from "../knowledge/embeddings";
import type { Source } from "../knowledge/search";

export async function loadKnowledge() {
  const file = await readFile(
    join(process.cwd(), "data", "knowledge.json"),
    "utf8",
  );
  return {
    sources: JSON.parse(file) as Source[],
    digest: createHash("sha256").update(file).digest("hex"),
  };
}

export async function searchEmbedding(question: string, digest: string) {
  const model = embeddingModel();
  if (!model || !process.env.DATABASE_URL) return [];
  try {
    const { embedding } = await embed({
      model: model.model,
      value: question,
      abortSignal: AbortSignal.timeout(3500),
      maxRetries: 0,
    });
    const vector = serializeVector(embedding);
    const { rows } = await getDatabase().execute<{
      id: string;
      distance: number;
    }>(sql`
      SELECT id, embedding <=> ${vector}::vector AS distance
      FROM knowledge_chunk WHERE digest=${digest} AND model=${model.name}
      ORDER BY distance LIMIT 12
    `);
    return rows.filter((row) => row.distance <= 0.55).map((row) => row.id);
  } catch {
    // W trybie tekstowym źródła są dostępne również przy awarii usługi embeddingowej.
    return [];
  }
}
