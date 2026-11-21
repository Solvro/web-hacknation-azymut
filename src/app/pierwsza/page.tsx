import { requireRole } from "../../lib/server/access";
import { listCases, readCase } from "../../lib/server/cases";
import { loadCompetencyModel } from "../../lib/server/model";
import { validateFirstDraft, type FirstDraft } from "../../lib/drafts/first";
import { FirstWorkspace } from "./workspace";

export const dynamic = "force-dynamic";

export default async function FirstPage() {
  const session = await requireRole(["supervisor"]);
  const [model, saved, cases] = await Promise.all([
    loadCompetencyModel(),
    session ? readCase(session.workspace, "first") : undefined,
    session ? listCases(session.workspace) : [],
  ]);
  let initial: FirstDraft | undefined;
  let notice: string | undefined;
  if (saved) {
    try {
      initial = validateFirstDraft(saved.draft, model);
    } catch {
      notice =
        "Zapisaną sprawę utworzono w innej wersji modelu lub zawiera niepoprawne dane.";
    }
  }
  return (
    <FirstWorkspace
      model={model}
      workspace={session?.workspace}
      initial={initial}
      remoteRevision={saved?.revision ?? 0}
      notice={notice}
      reminder={cases.find((item) => item.kind === "first")?.reminder ?? null}
    />
  );
}
