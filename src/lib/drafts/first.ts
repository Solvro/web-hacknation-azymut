import { z } from "zod";
import { firstCriteria, firstResult } from "../scoring/first.ts";
import { firstAssessmentWindow } from "../scoring/calendar.ts";
import type { CompetencyModel } from "./periodic.ts";

const date = z.union([z.iso.date(), z.literal("")]);
const text = z.string().max(6000);
const exam = z.enum([
  "passed",
  "not_passed",
  "ksap_graduate_without_nomination_application",
  "replacement_subject_to_first_evaluation",
  "higher_civil_service_position",
]);
const schema = z.object({
  version: z.string(),
  step: z.int().min(0).max(4),
  start: date,
  end: date,
  replacement: z.boolean(),
  agreement: date,
  opening: date,
  reportFrom: date,
  reportDue: date,
  received: date,
  overdue: z.boolean(),
  exam: exam.nullish(),
  active: z
    .int()
    .min(0)
    .max(firstCriteria.length - 1),
  index: z.int().nonnegative(),
  ratings: z.record(
    z.string(),
    z.union([
      z.literal([1, 3, 5, 7, 9]),
      z.enum(["pending", "unobserved", "outside_scope"]),
    ]),
  ),
  examples: z.record(z.string(), text),
  conversation: date,
  decisions: z.partialRecord(
    z.enum(firstCriteria),
    z.literal([3, 5, 7]).nullable(),
  ),
  justification: text,
  development: text,
});

export type FirstDraft = z.infer<typeof schema>;

export function firstReportStatus(
  from: string,
  due: string,
  received: string,
  overdue: boolean,
) {
  if (received) return received >= from && received <= due ? "on_time" : "late";
  return overdue ? "not_submitted_by_deadline" : null;
}

export function validateFirstDraft(
  raw: unknown,
  model: CompetencyModel,
): FirstDraft {
  const draft = schema.parse(raw);
  if (draft.version !== model.version)
    throw new Error("Wersja modelu uległa zmianie.");
  if (!model.competencies[firstCriteria[draft.active]][draft.index])
    throw new Error("Nieznany wskaźnik.");
  const ids = new Set(
    firstCriteria.flatMap((key) =>
      model.competencies[key].map((item) => item.id),
    ),
  );
  if (
    [...Object.keys(draft.ratings), ...Object.keys(draft.examples)].some(
      (id) => !ids.has(id),
    )
  )
    throw new Error("Nieznana obserwacja.");
  if (draft.step > 0) {
    const {
      start,
      end,
      replacement,
      agreement,
      opening,
      reportFrom,
      reportDue,
    } = draft;
    if (
      !start ||
      !end ||
      !opening ||
      !reportFrom ||
      !reportDue ||
      (replacement && (!agreement || agreement < start || agreement > end))
    ) {
      throw new Error("Uzupełnij daty rozpoczęcia oceny.");
    }
    const window = firstAssessmentWindow(
      start,
      end,
      replacement ? agreement : start,
    );
    if (
      opening < (replacement ? agreement : start) ||
      opening > end ||
      reportFrom < window.earliestAssessment ||
      reportDue > window.latestAssessment ||
      reportFrom > reportDue
    ) {
      throw new Error("Niepoprawne daty pierwszej oceny.");
    }
  }
  if (draft.step > 1 && (!draft.exam || (!draft.received && !draft.overdue)))
    throw new Error("Uzupełnij dane sprawozdania i egzaminu.");
  if (
    draft.exam === "replacement_subject_to_first_evaluation" &&
    !draft.replacement
  )
    throw new Error("Podstawa wyjątku wymaga zatrudnienia na zastępstwo.");
  if (draft.step === 4) {
    const result = firstResult({
      decisions: draft.decisions,
      exam: draft.exam,
      report: firstReportStatus(
        draft.reportFrom,
        draft.reportDue,
        draft.received,
        draft.overdue,
      ),
    });
    if (
      !draft.conversation ||
      draft.conversation < (draft.received || draft.reportDue) ||
      result.status !== "scored" ||
      (!result.positive && !draft.justification.trim())
    ) {
      throw new Error("Niekompletne podsumowanie.");
    }
  }
  return draft;
}
