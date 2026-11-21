import { requireRole } from "../../lib/server/access";
import { listCases, readCase } from "../../lib/server/cases";
import { loadCompetencyModel } from "../../lib/server/model";
import { PeriodicWorkspace } from "../periodic-workspace";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ przyklad?: string }>;
}) {
  const { przyklad } = await searchParams;
  const sample = przyklad === "1";
  const session = await requireRole(["supervisor"]);
  const workspace = session?.workspace;
  const [model, saved, cases] = await Promise.all([
    loadCompetencyModel(),
    workspace && !sample ? readCase(workspace, "periodic") : undefined,
    workspace && !sample ? listCases(workspace) : [],
  ]);
  return (
    <PeriodicWorkspace
      key={sample ? "sample" : "case"}
      model={model}
      workspace={workspace}
      remoteDraft={saved?.draft}
      remoteRevision={saved?.revision ?? 0}
      reminder={cases.find((item) => item.kind === "periodic")?.reminder ?? null}
      sample={sample}
    />
  );
}
