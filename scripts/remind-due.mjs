import { setTimeout as delay } from "node:timers/promises";
import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("Ustaw DATABASE_URL.");
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const watch = process.argv.includes("--watch");
try {
  do {
    try {
      const { rows: [{ count }] } = await db.query("SELECT queue_due_reminders() AS count");
      if (count > 0 || !watch) console.log(`Automatyczne przypomnienia: ${count}.`);
    } catch (error) {
      if (!watch) throw error;
      console.error("Nie udało się przygotować automatycznych przypomnień.", error.code ?? "");
    }
    if (watch) await delay(5 * 60 * 1000);
  } while (watch);
} finally {
  await db.end();
}
