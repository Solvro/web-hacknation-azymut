import { z } from "zod";
import { requireApiRole } from "../../../lib/server/access";
import { saveCase } from "../../../lib/server/cases";
import { loadCompetencyModel } from "../../../lib/server/model";
import { readPeriodicDraft } from "../../../lib/drafts/periodic";
import { validateFirstDraft } from "../../../lib/drafts/first";
import { firstCaseState, periodicCaseState } from "../../../lib/cases/next-action";

const input = z.object({
  kind: z.enum(["periodic", "first"]),
  revision: z.int().min(0),
  draft: z.record(z.string(), z.unknown()),
});
export async function POST(request: Request) {
  const actor = await requireApiRole(request, ["supervisor"]);
  if (actor instanceof Response) return actor;
  if (!actor) return new Response(null, { status: 503 });
  const body = await request.text();
  if (body.length > 150000)
    return Response.json({ error: "Szkic jest za duży." }, { status: 413 });
  let payload: z.infer<typeof input>;
  let record: {
    title: string;
    status: string;
    due: string | null;
    actionDue: string | null;
    draft: unknown;
  };
  try {
    payload = input.parse(JSON.parse(body));
    const model = await loadCompetencyModel();
    if (payload.kind === "periodic") {
      const draft = readPeriodicDraft(JSON.stringify(payload.draft), model);
      record = {
        title: `Ocena okresowa · arkusz ${draft.form}`,
        ...periodicCaseState(draft),
        draft,
      };
    } else {
      const draft = validateFirstDraft(payload.draft, model);
      record = {
        title: "Pierwsza ocena",
        ...firstCaseState(draft),
        draft,
      };
    }
  } catch {
    return Response.json(
      { error: "Sprawdź daty i kompletność szkicu." },
      { status: 400 },
    );
  }
  const saved = await saveCase(actor, payload.kind, {
    ...record,
    revision: payload.revision,
  });
  if (saved === null)
    return Response.json(
      {
        error:
          "Sprawę zapisano w innej karcie. Odśwież, aby pobrać wersję z serwera.",
      },
      { status: 409 },
    );
  return Response.json(saved);
}
