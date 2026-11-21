import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const passphrase = process.env.AZYMUT_DEMO_PASSWORD;
if (!connectionString || !passphrase || passphrase.length < 12) {
  throw new Error(
    "Ustaw DATABASE_URL i AZYMUT_DEMO_PASSWORD (co najmniej 12 znaków).",
  );
}
const db = new pg.Client({ connectionString });
await db.connect();
try {
  await db.query(
    await readFile(new URL("../db/001-demo.sql", import.meta.url), "utf8"),
  );
  const password = await hashPassword(passphrase);
  await db.query("BEGIN");
  for (const [role, name] of [
    ["supervisor", "Przełożony"],
    ["hr", "Kadry"],
    ["admin", "Administrator"],
  ]) {
    const email = role + "@azymut.example";
    const {
      rows: [account],
    } = await db.query(
      `
      INSERT INTO "user"(id, name, email, "emailVerified", role) VALUES ($1,$2,$3,true,$4)
      ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name, role=EXCLUDED.role RETURNING id
    `,
      [randomUUID(), name, email, role],
    );
    await db.query(
      `
      INSERT INTO account(id, "accountId", "providerId", "userId",password) VALUES ($1,$2,'credential',$2,$3)
      ON CONFLICT("providerId","accountId") DO UPDATE SET password=EXCLUDED.password
    `,
      [randomUUID(), account.id, password],
    );
  }
  await db.query("COMMIT");
  console.log("Schemat i trzy konta demonstracyjne są gotowe.");
} catch (error) {
  await db.query("ROLLBACK");
  throw error;
} finally {
  await db.end();
}
