import type { buildConversationAgenda } from "./agenda.ts";
import { criteria, type Decisions } from "../scoring/periodic.ts";

export function assessmentCopy(
  agenda: ReturnType<typeof buildConversationAgenda>,
  decisions: Decisions,
  goals: string,
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
  const justification = scored.map(({ clause, points, example }) =>
    example ? `${clause} – ${points} pkt. Przykład z pracy: ${excerpt(example)}.` : `${clause} – ${points} pkt.`,
  ).join("\n\n");
  return { development, justification };
}
