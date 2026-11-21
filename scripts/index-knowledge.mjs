import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { embedMany } from "ai";
import pg from "pg";
import {
  embeddingModel,
  serializeVector,
} from "../src/lib/knowledge/embeddings.ts";

const config = embeddingModel();
const connectionString = process.env.DATABASE_URL;
if (!config || !connectionString)
  throw new Error("Ustaw DATABASE_URL, AZYMUT_EMBED_URL i AZYMUT_EMBED_NAME.");
const file = await readFile(
  process.env.AZYMUT_KNOWLEDGE_FILE ||
    new URL("../data/knowledge.json", import.meta.url),
  "utf8",
);
const sources = JSON.parse(file);
const digest = createHash("sha256").update(file).digest("hex");
const db = new pg.Client({ connectionString });
await db.connect();
try {
  await db.query(
    await readFile(new URL("../db/002-knowledge.sql", import.meta.url), "utf8"),
  );
  const count = await db.query(
    "SELECT COUNT(*)::integer AS count FROM knowledge_chunk WHERE digest=$1 AND model=$2",
    [digest, config.name],
  );
  if (count.rows[0].count === sources.length) {
    console.log("Indeks wektorowy jest aktualny.");
  } else {
    const vectors = [];
    for (let i = 0; i < sources.length; i += 12) {
      const batch = sources.slice(i, i + 12);
      const result = await embedMany({
        model: config.model,
        values: batch.map(
          (source) =>
            source.title +
            " " +
            source.locator +
            " " +
            source.text.slice(0, 3600),
        ),
        abortSignal: AbortSignal.timeout(120000),
        maxRetries: 1,
      });
      vectors.push(...result.embeddings.map(serializeVector));
    }
    await db.query("BEGIN");
    try {
      await db.query("DELETE FROM knowledge_chunk");
      for (let i = 0; i < sources.length; i++) {
        await db.query(
          "INSERT INTO knowledge_chunk(id,digest,model,embedding) VALUES($1,$2,$3,$4::vector)",
          [sources[i].id, digest, config.name, vectors[i]],
        );
      }
      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
    console.log(`Zapisano ${vectors.length} reprezentacji wektorowych.`);
  }
} finally {
  await db.end();
}
