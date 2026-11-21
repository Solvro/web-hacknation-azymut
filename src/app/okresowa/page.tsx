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
  const session = await requireRole(["supervisor"]);
  const [model, saved, cases] = await Promise.all([
    loadCompetencyModel(),
    session ? readCase(session.workspace, "periodic") : undefined,
    session ? listCases(session.workspace) : [],
  ]);
  return (
    <PeriodicWorkspace
      model={model}
      workspace={session?.workspace}
      remoteDraft={saved?.draft}
      remoteRevision={saved?.revision ?? 0}
      reminder={cases.find((item) => item.kind === "periodic")?.reminder ?? null}
      sample={przyklad === "1"}
    />
  );
}
