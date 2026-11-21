import { suggestPeriodicPoints, type Observation } from "./periodic.ts";

// Kolejność elementów w arkuszu pierwszej oceny (§ 2 pkt 1 rozporządzenia z 23 lipca 2015 r.).
export const firstCriteria = ["reliability", "knowledge", "organization", "communication", "cooperation"] as const;
export type FirstCriterion = (typeof firstCriteria)[number];
const scale = [3, 5, 7] as const;
export type FirstPoints = (typeof scale)[number];

export function suggestFirstPoints(observations: readonly Observation[]) {
  const { selected, observed, average, suggestion: modelPoints } = suggestPeriodicPoints(observations);
  // Mapowanie produktu dotyczy sugestii. Oceny cząstkowe wprowadza przełożony.
  let suggestion: FirstPoints | null = null;
  if (modelPoints !== null) {
    if (modelPoints < 5) suggestion = 3;
    else if (modelPoints > 5) suggestion = 7;
    else suggestion = 5;
  }
  return { selected, observed, average, modelPoints, suggestion };
}

// Trzy podstawy pominięcia warunku egzaminu w § 10 ust. 3.
const examStatuses = [
  "passed",
  "not_passed",
  "ksap_graduate_without_nomination_application",
  "replacement_subject_to_first_evaluation",
  "higher_civil_service_position",
] as const;
const reportStatuses = ["on_time", "late", "not_submitted_by_deadline"] as const;

export interface FirstAssessment {
  decisions: Readonly<Partial<Record<FirstCriterion, FirstPoints | null>>>;
  exam?: (typeof examStatuses)[number] | null;
  report?: (typeof reportStatuses)[number] | null;
}

type NegativeReason = "exam_not_passed" | "report_not_on_time" | "multiple_threes" | "low_average";

// § 7 pkt 3 i § 10 ust. 1–4. Brak potwierdzonego faktu pozostawia ocenę w szkicu.
export function firstResult({ decisions, exam, report }: FirstAssessment) {
  const missing: (FirstCriterion | "exam" | "report")[] = [];
  let sum = 0;
  let threes = 0;
  for (const criterion of firstCriteria) {
    const points = decisions[criterion];
    if (points == null) {
      missing.push(criterion);
      continue;
    }
    if (!scale.includes(points)) throw new RangeError("W pierwszej ocenie dozwolone są 3, 5 i 7 pkt.");
    sum += points;
    if (points === 3) threes++;
  }

  if (exam == null) missing.push("exam");
  else if (!examStatuses.includes(exam)) throw new RangeError("Nieznany status egzaminu.");
  if (report == null) missing.push("report");
  else if (!reportStatuses.includes(report)) throw new RangeError("Nieznany status sprawozdania.");

  if (missing.length > 0) return { status: "draft" as const, missing };

  const average = sum / firstCriteria.length;
  const reasons: NegativeReason[] = [];
  if (exam === "not_passed") reasons.push("exam_not_passed");
  if (report !== "on_time") reasons.push("report_not_on_time");
  if (threes > 1) reasons.push("multiple_threes");
  if (average < 5) reasons.push("low_average");
  const positive = reasons.length === 0;
  return { status: "scored" as const, average, positive, reasons, justificationRequired: !positive };
}
