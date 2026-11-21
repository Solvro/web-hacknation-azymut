import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CompetencyModel } from "../drafts/periodic";

export async function loadCompetencyModel(): Promise<CompetencyModel> {
  return JSON.parse(
    await readFile(join(process.cwd(), "data", "competencies.json"), "utf8"),
  );
}
