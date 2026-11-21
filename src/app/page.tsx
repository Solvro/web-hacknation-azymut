import { readFile } from "node:fs/promises";
import path from "node:path";
import { PeriodicWorkspace, type CompetencyModel } from "./periodic-workspace";

export default async function Page() {
  const file = await readFile(
    path.join(process.cwd(), "data", "competencies.json"),
    "utf8",
  );
  const model: CompetencyModel = JSON.parse(file);
  return <PeriodicWorkspace model={model} />;
}
