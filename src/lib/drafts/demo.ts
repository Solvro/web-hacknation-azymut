import type { CompetencyModel, PeriodicDraft } from "./periodic.ts";

export function trainingAssessment(model: CompetencyModel): PeriodicDraft {
  const [delegation, monitoring] = model.competencies.leadership;
  return {
    version: model.version,
    sample: "training",
    form: "B",
    extra: [],
    step: 2,
    active: 0,
    index: 2,
    ratings: { [delegation.id]: 5, [monitoring.id]: 7 },
    examples: {
      [delegation.id]:
        "Przed zamknięciem raportu miesięcznego kierująca przydzieliła zespołowi części raportu i uzgodniła terminy. Zespół dostarczył komplet danych na czas.",
      [monitoring.id]:
        "Gdy zabrakło danych z jednego wydziału, kierująca zorganizowała wcześniejszy przegląd. Uzupełniono braki przed przekazaniem raportu.",
    },
    decisions: {
      decisions: 5,
      organization: 7,
      cooperation: 5,
      communication: 5,
    },
    interview: false,
    justification: "",
    developmentNotes: "",
    meeting: {
      date: "2024-11-21",
      assessmentDue: "2026-11-21",
      expectations:
        "Jasno uzgadniać odpowiedzialność w zespole i monitorować realizację zadań.",
      goals: "Ujednolicić miesięczny raport z realizacji zadań.",
    },
  };
}
