import { z } from "zod";
import {
  criteria,
  periodicCriteria,
  periodicResult,
  type Criterion,
} from "../scoring/periodic.ts";

export const draftStorageKey = "azymut.periodic-draft.v1";

export interface CompetencyModel {
  version: string;
  competencies: Record<
    Criterion,
    { id: string; label: string; levels: string[] }[]
  >;
}

const points = z.literal([1, 3, 5, 7, 9]);
const criterion = z.custom<Criterion>(
  (value) => typeof value === "string" && Object.hasOwn(criteria, value),
);
const meeting = z.object({
  date: z.union([z.iso.date(), z.literal("")]),
  assessmentDue: z.union([z.iso.date(), z.literal("")]),
  expectations: z.string(),
  goals: z.string(),
  trigger: z
    .enum(["indefinite_contract", "previous_assessment", "negative_assessment"])
    .optional(),
  anchor: z.union([z.iso.date(), z.literal("")]).optional(),
  absenceFrom: z.union([z.iso.date(), z.literal("")]).optional(),
  absenceTo: z.union([z.iso.date(), z.literal("")]).optional(),
});
const schema = z.object({
  version: z.string(),
  sample: z.literal("training").optional(),
  form: z.enum(["B", "C"]),
  extra: z.array(criterion).max(3),
  step: z.int().min(0).max(4),
  active: z.int().nonnegative(),
  index: z.int().nonnegative(),
  ratings: z.record(
    z.string(),
    z.union([points, z.enum(["pending", "unobserved", "outside_scope"])]),
  ),
  examples: z.record(z.string(), z.string()),
  decisions: z.partialRecord(criterion, points.nullable()),
  interview: z.boolean(),
  justification: z.string(),
  developmentNotes: z.string().default(""),
  civilServant: z.boolean().optional(),
  gradeRequest: z.string().max(4000).optional(),
  acknowledged: z.union([z.iso.date(), z.literal("")]).optional(),
  meeting,
});
export type PeriodicDraft = z.infer<typeof schema>;

export function readPeriodicDraft(
  raw: string,
  model: CompetencyModel,
): PeriodicDraft {
  const draft = schema.parse(JSON.parse(raw));
  if (draft.version !== model.version)
    throw new Error("Wersja modelu uległa zmianie.");
  const selected = periodicCriteria(draft.form, draft.extra);
  const active = selected[draft.active];
  if (!active || !model.competencies[active][draft.index])
    throw new Error("Nieznany wskaźnik.");
  const ids = new Set(
    selected.flatMap((key) => model.competencies[key].map((item) => item.id)),
  );
  if (
    [...Object.keys(draft.ratings), ...Object.keys(draft.examples)].some(
      (id) => !ids.has(id),
    )
  ) {
    throw new Error("Obserwacja spoza wybranych kryteriów.");
  }
  if (
    Object.keys(draft.decisions).some(
      (key) => !selected.includes(key as Criterion),
    )
  ) {
    throw new Error("Decyzja spoza wybranych kryteriów.");
  }
  if (
    draft.step >= 2 &&
    (!draft.meeting.date || draft.meeting.assessmentDue < draft.meeting.date)
  ) {
    throw new Error("Brak poprawnych dat rozmowy rozpoczynającej.");
  }
  if (draft.step === 4) {
    const result = periodicResult(draft.form, draft.extra, draft.decisions);
    if (
      !draft.interview ||
      result.status !== "scored" ||
      (!result.positive && !draft.justification.trim())
    ) {
      throw new Error("Niekompletne podsumowanie.");
    }
    // Starsze szkice nie zawierały wniosków do IPRZ. Zachowaj podjęte decyzje.
    if (!draft.developmentNotes.trim()) return { ...draft, step: 3 };
  }
  return draft;
}
