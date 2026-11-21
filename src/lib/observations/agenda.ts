import type { CompetencyModel } from "../drafts/periodic.ts";
import type { Criterion, Observation } from "../scoring/periodic.ts";
import type { SavedNote } from "./notes.ts";

type AgendaExample = {
  id: string;
  text: string;
  quote?: string;
  date?: string;
  gap: SavedNote["gap"];
};

export function buildConversationAgenda(
  model: CompetencyModel,
  selected: readonly Criterion[],
  notes: readonly SavedNote[],
  examples: Readonly<Record<string, string>>,
  ratings: Readonly<Record<string, Observation>>,
) {
  const criteria = selected.map((criterion) => {
    const indicators = model.competencies[criterion]
      .filter(({ id }) => ratings[id] !== "outside_scope")
      .map(({ id, label }) => {
        const evidence: AgendaExample[] = notes
          .filter(({ indicatorId }) => indicatorId === id)
          .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
        const olderExample = examples[id]?.trim();
        if (olderExample && !evidence.some(({ text }) => text === olderExample)) {
          evidence.push({ id, text: olderExample, gap: null });
        }
        return { id, label, evidence };
      });
    const covered = indicators.filter(({ evidence }) => evidence.length > 0).length;
    return { criterion, indicators, covered };
  });
  const dated = criteria.flatMap(({ indicators }) =>
    indicators.flatMap(({ evidence }) => evidence.flatMap(({ date }) => date ? [date] : [])),
  );
  const monthCounts = new Map<string, number>();
  for (const date of dated) {
    const month = date.slice(0, 7);
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
  }
  const months = [...monthCounts].sort(([a], [b]) => a.localeCompare(b));
  return {
    criteria,
    questions: notes.filter(({ indicatorId }) => indicatorId === null),
    months,
    datesClustered: months.length === 1 && dated.length > 1,
  };
}
