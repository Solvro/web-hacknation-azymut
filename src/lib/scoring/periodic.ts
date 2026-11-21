// Rozporządzenie PRM z 4 kwietnia 2016 r., załącznik nr 1 i § 4 ust. 2–3.
export const criteria = {
  communication: "Komunikacja",
  creativity: "Kreatywność",
  negotiation: "Negocjowanie",
  organization: "Organizacja pracy i orientacja na osiąganie celów",
  customer: "Orientacja na klienta/interesanta",
  decisions: "Podejmowanie decyzji i odpowiedzialność",
  crisis: "Radzenie sobie w sytuacjach kryzysowych",
  reliability: "Rzetelność",
  analysis: "Myślenie analityczne",
  knowledge: "Wykorzystywanie wiedzy i doskonalenie zawodowe",
  cooperation: "Współpraca",
  speaking: "Wystąpienia publiczne",
  leadership: "Zarządzanie ludźmi",
  strategy: "Zarządzanie strategiczne",
} as const;

export type Criterion = keyof typeof criteria;
export type PeriodicForm = "B" | "C";
const common = ["organization", "cooperation", "communication"] as const;
const mandatory = {
  B: ["leadership", "decisions", ...common],
  C: ["knowledge", "reliability", ...common],
} as const;

export function periodicCriteria(form: PeriodicForm, additional: readonly Criterion[] = []): Criterion[] {
  if (!Object.hasOwn(mandatory, form)) throw new RangeError("Nieznany arkusz oceny okresowej.");
  if (additional.length > 3) throw new RangeError("Można wybrać najwyżej trzy kryteria dodatkowe.");
  const selected = [...mandatory[form], ...additional];
  if (additional.some((key) => !Object.hasOwn(criteria, key))) throw new RangeError("Nieznane kryterium.");
  if (new Set(selected).size !== selected.length) throw new RangeError("Kryteria muszą być różne.");
  return selected;
}

const scale = [1, 3, 5, 7, 9] as const;
export type Points = (typeof scale)[number];
export type Observation = Points | "outside_scope" | "pending" | "unobserved";

function validatePoints(points: Points) {
  if (!scale.includes(points)) throw new RangeError("Dozwolone oceny to 1, 3, 5, 7 i 9 pkt.");
}

// Reguła produktu. Punkty opisują wybrane zachowanie, a nie decyzję przełożonego.
export function suggestPeriodicPoints(observations: readonly Observation[]) {
  let selected = 0;
  let observed = 0;
  let sum = 0;
  for (const observation of observations) {
    if (observation === "outside_scope") continue;
    selected++;
    if (observation === "pending" || observation === "unobserved") continue;
    validatePoints(observation);
    observed++;
    sum += observation;
  }
  if (observed === 0 || observed * 2 < selected) {
    return { selected, observed, average: null, suggestion: null };
  }
  const average = sum / observed;
  const suggestion = scale.reduce((best, candidate) => {
    const distance = Math.abs(candidate * observed - sum);
    const bestDistance = Math.abs(best * observed - sum);
    if (distance === bestDistance) return Math.abs(candidate - 5) < Math.abs(best - 5) ? candidate : best;
    return distance < bestDistance ? candidate : best;
  });
  return { selected, observed, average, suggestion };
}

export type Decisions = Readonly<Partial<Record<Criterion, Points | null>>>;
type NegativeReason = "low_average" | "one_point";

// § 11 ust. 1. Źródłem wyniku są wyłącznie decyzje dla kryteriów ustalonych dla tej sprawy.
export function periodicResult(form: PeriodicForm, additional: readonly Criterion[], decisions: Decisions) {
  const missing: Criterion[] = [];
  let sum = 0;
  let hasOnePoint = false;
  const selected = periodicCriteria(form, additional);
  for (const criterion of selected) {
    const points = decisions[criterion];
    if (points == null) {
      missing.push(criterion);
      continue;
    }
    validatePoints(points);
    sum += points;
    if (points === 1) hasOnePoint = true;
  }
  if (missing.length > 0) return { status: "draft" as const, missing };

  const average = sum / selected.length;
  // § 11 ust. 1 pkt 2: górna granica każdego przedziału jest włączona.
  let level: Points = 9;
  if (average <= 2) level = 1;
  else if (average <= 4) level = 3;
  else if (average <= 6) level = 5;
  else if (average <= 8) level = 7;
  const reasons: NegativeReason[] = [];
  if (average <= 4) reasons.push("low_average");
  if (hasOnePoint) reasons.push("one_point");
  return { status: "scored" as const, average, level, positive: reasons.length === 0, reasons };
}
