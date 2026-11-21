import { z } from "zod";
import { requireApiRole } from "../../../lib/server/access";
import { saveCase } from "../../../lib/server/cases";
import { loadCompetencyModel } from "../../../lib/server/model";
import { readPeriodicDraft } from "../../../lib/drafts/periodic";
import { validateFirstDraft } from "../../../lib/drafts/first";
import { firstAssessmentWindow } from "../../../lib/scoring/calendar";

const input = z.object({
  kind: z.enum(["periodic", "first"]),
  revision: z.int().min(0),
  draft: z.record(z.string(), z.unknown()),
});
const statuses = [
  "Przygotowanie",
  "Rozmowa wstępna",
  "Obserwacje",
  "Rozmowa oceniająca",
  "Do podpisu",
];

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
    draft: unknown;
  };
  try {
    payload = input.parse(JSON.parse(body));
    const model = await loadCompetencyModel();
    if (payload.kind === "periodic") {
      const draft = readPeriodicDraft(JSON.stringify(payload.draft), model);
      record = {
        title: `Ocena okresowa · arkusz ${draft.form}`,
        due: draft.meeting.assessmentDue || null,
        status: statuses[draft.step],
        draft,
      };
    } else {
      const draft = validateFirstDraft(payload.draft, model);
      const due =
        draft.start && draft.end
          ? firstAssessmentWindow(draft.start, draft.end).latestAssessment
          : null;
      record = {
        title: "Pierwsza ocena",
        due,
        status:
          draft.step === 1 ? "Sprawozdanie i egzamin" : statuses[draft.step],
        draft,
      };
    }
  } catch {
    return Response.json(
      { error: "Sprawdź daty i kompletność szkicu." },
      { status: 400 },
    );
  }
  const revision = await saveCase(actor, payload.kind, {
    ...record,
    revision: payload.revision,
  });
  if (revision === null)
    return Response.json(
      {
        error:
          "Sprawę zapisano w innej karcie. Odśwież, aby pobrać wersję z serwera.",
      },
      { status: 409 },
    );
  return Response.json({ revision });
}
