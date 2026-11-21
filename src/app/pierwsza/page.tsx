import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CompetencyModel } from "../../lib/drafts/periodic";
import { FirstWorkspace } from "./workspace";

export default async function FirstPage() {
  const model: CompetencyModel = JSON.parse(
    await readFile(join(process.cwd(), "data", "competencies.json"), "utf8"),
  );
  return <FirstWorkspace model={model} />;
}
