import { requireRole } from "../lib/server/access";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PeriodicWorkspace } from "./periodic-workspace";
import type { CompetencyModel } from "../lib/drafts/periodic";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await requireRole(["supervisor"]);
  const file = await readFile(
    path.join(process.cwd(), "data", "competencies.json"),
    "utf8",
  );
  const model: CompetencyModel = JSON.parse(file);
  return <PeriodicWorkspace model={model} authenticated={!!session} />;
}
