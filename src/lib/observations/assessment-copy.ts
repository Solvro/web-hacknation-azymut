import type { buildConversationAgenda } from "./agenda.ts";
import { criteria, type Decisions, type periodicResult } from "../scoring/periodic.ts";

export function assessmentCopy(
  agenda: ReturnType<typeof buildConversationAgenda>,
  decisions: Decisions,
  goals: string,
  result?: ReturnType<typeof periodicResult>,
) {
  const scored = agenda.criteria
    .flatMap(({ criterion, indicators }) => {
      const points = decisions[criterion];
      if (points == null) return [];
      const examples = indicators.flatMap(({ evidence }) => evidence).filter(({ gap }) => gap === null);
      return [{
        clause: criteria[criterion],
        points,
        example: examples.find(({ quote }) => quote) ?? examples[0],
      }];
    })
    .sort((a, b) => a.points - b.points);
  const target = scored.find(({ example }) => example);
  function excerpt(example: NonNullable<(typeof scored)[number]["example"]>) {
    const source = example.quote || example.text;
    return `„${source.length > 280 ? source.slice(0, 280).trimEnd() + "…" : source}”`;
  }
  const development = target?.example
    ? `Ustalić z pracownikiem działanie rozwojowe w obszarze: ${target.clause}. Punktem wyjścia do rozmowy jest obserwacja: ${excerpt(target.example)}.`
    : goals.trim() ? `Ustalić z pracownikiem dalsze działania w odniesieniu do uzgodnionego celu: ${goals.trim()}.` : "";
  const reasons: string[] = [];
  if (result?.status === "scored") {
    if (result.reasons.includes("one_point")) {
      const below = scored.filter(({ points }) => points === 1).map(({ clause }) => clause);
      reasons.push(`Przyznano ocenę cząstkową 1 pkt w kryteriach: ${below.join(", ")}.`);
    }
    if (result.reasons.includes("low_average")) {
      const average = result.average.toLocaleString("pl-PL", { maximumFractionDigits: 3 });
      reasons.push(`Średnia ocen cząstkowych wyniosła ${average} pkt i nie przekroczyła progu 4 pkt.`);
    }
  }
  const examples = scored.flatMap(({ clause, points, example }) =>
    example ? [`${clause} – ${points} pkt. Przykład z pracy: ${excerpt(example)}.`] : [],
  );
  return { development, justification: [...reasons, ...examples].join("\n\n") };
}
