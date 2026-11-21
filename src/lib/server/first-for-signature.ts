import { readCase } from "./cases";
import { loadCompetencyModel } from "./model";
import { firstReportStatus, validateFirstDraft } from "../drafts/first";
import { firstAssessmentWindow } from "../scoring/calendar";
import { prepareAssessment } from "../pdf/assessment";

export async function firstForSignature(workspace: string) {
  const saved = await readCase(workspace, "first");
  if (!saved) return null;
  const model = await loadCompetencyModel();
  try {
    const draft = validateFirstDraft(saved.draft, model);
    if (draft.step !== 4) return null;
    return prepareAssessment({
      ...draft,
      form: "first",
      employmentStart: draft.start,
      ...firstAssessmentWindow(
        draft.start,
        draft.end,
        draft.replacement ? draft.agreement : draft.start,
      ),
      report: firstReportStatus(
        draft.reportFrom,
        draft.reportDue,
        draft.received,
        draft.overdue,
      ),
    });
  } catch {
    return null;
  }
}
