import { z } from "zod";
import { firstCriteria, firstResult } from "../scoring/first";
import {
  criteria,
  periodicCriteria,
  periodicResult,
  type Criterion,
} from "../scoring/periodic";

const note = z.string().trim().max(6000);
const date = z.iso.date();
const criterion = z.custom<Criterion>(
  (value) => typeof value === "string" && Object.hasOwn(criteria, value),
);
const periodic = z
  .object({
    form: z.enum(["B", "C"]),
    extra: z.array(criterion).max(3),
    opening: date,
    assessmentDue: date,
    conversation: date,
    periodFrom: date,
    periodTo: date,
    decisions: z.partialRecord(criterion, z.literal([1, 3, 5, 7, 9])),
    justification: note,
    development: note.min(1),
  })
  .refine(
    (data) =>
      data.periodFrom <= data.periodTo &&
      data.periodTo <= data.conversation &&
      data.opening <= data.conversation &&
      data.opening <= data.assessmentDue,
  );

const first = z
  .object({
    form: z.literal("first"),
    employmentStart: date,
    opening: date,
    reportFrom: date,
    reportDue: date,
    earliestAssessment: date,
    latestAssessment: date,
    conversation: date,
    exam: z.enum([
      "passed",
      "not_passed",
      "ksap_graduate_without_nomination_application",
      "replacement_subject_to_first_evaluation",
      "higher_civil_service_position",
    ]),
    report: z.enum(["on_time", "late", "not_submitted_by_deadline"]),
    decisions: z.partialRecord(z.enum(firstCriteria), z.literal([3, 5, 7])),
    justification: note,
    development: note,
  })
  .refine(
    (data) =>
      data.employmentStart <= data.opening &&
      data.earliestAssessment <= data.reportFrom &&
      data.reportFrom <= data.reportDue &&
      data.reportDue <= data.latestAssessment &&
      data.opening <= data.conversation,
  );

const input = z.union([first, periodic]);

export function prepareAssessment(raw: unknown) {
  const data = input.parse(raw);
  const result =
    data.form === "first"
      ? firstResult(data)
      : periodicResult(data.form, data.extra, data.decisions);
  if (result.status !== "scored" || (!result.positive && !data.justification)) {
    throw new Error(
      "Arkusz wymaga kompletu decyzji i uzasadnienia oceny negatywnej.",
    );
  }
  const keys =
    data.form === "first"
      ? firstCriteria
      : periodicCriteria(data.form, data.extra);
  const rows = keys.map((key) => ({
    label: criteria[key],
    points: data.decisions[key as keyof typeof data.decisions]!,
  }));
  return { data, result, rows };
}
