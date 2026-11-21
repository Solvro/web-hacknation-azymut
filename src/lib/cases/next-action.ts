import type { FirstDraft } from "../drafts/first.ts";
import type { PeriodicDraft } from "../drafts/periodic.ts";
import { addDays, firstAssessmentWindow, periodicOpeningDeadline } from "../scoring/calendar.ts";

export type CaseKind = "periodic" | "first";
export type ReminderKind = "manual" | "automatic";

const statuses = [
  "Przygotowanie",
  "Rozmowa wstępna",
  "Obserwacje",
  "Rozmowa oceniająca",
  "Do podpisu",
] as const;

export function periodicCaseState(draft: PeriodicDraft) {
  let status: string = statuses[draft.step];
  if (draft.step === 4 && draft.acknowledged) status = "Zapoznano z oceną";
  if (draft.step === 3 && draft.interview) status = "Ocena na piśmie";
  const due = draft.meeting.assessmentDue || null;
  const openingDue = draft.meeting.anchor
    ? periodicOpeningDeadline(draft.meeting.trigger ?? "indefinite_contract", draft.meeting.anchor)
    : null;
  return {
    status,
    due,
    actionDue: draft.step < 2 ? openingDue : draft.step < 4 ? due : null,
  };
}

export function firstCaseState(draft: FirstDraft) {
  let status: string = statuses[draft.step];
  if (draft.step === 1) status = "Sprawozdanie i egzamin";
  if (draft.step === 3 && draft.conversation) status = "Ocena na piśmie";
  if (draft.step === 4 && draft.acknowledged) status = "Zapoznano z oceną";
  const anchor = draft.replacement ? draft.agreement : draft.start;
  const latest = draft.start && draft.end ? firstAssessmentWindow(draft.start, draft.end).latestAssessment : null;
  return {
    status,
    due: latest,
    actionDue: draft.step === 0
      ? anchor ? addDays(anchor, 21) : null
      : draft.step === 1 && !draft.received && !draft.overdue ? draft.reportDue || null
        : draft.step < 4 ? latest : null,
  };
}

const actions: Record<string, string> = {
  "Rozmowa wstępna": "Przeprowadź rozmowę rozpoczynającą",
  "Sprawozdanie i egzamin": "Sprawdź sprawozdanie i wynik egzaminu",
  "Obserwacje": "Uzupełnij obserwacje przed rozmową oceniającą",
  "Rozmowa oceniająca": "Przeprowadź rozmowę i sporządź pisemną ocenę",
  "Ocena na piśmie": "Sporządź pisemną ocenę po przeprowadzonej rozmowie",
  "Do podpisu": "Dopilnuj podpisów i odnotuj zapoznanie z oceną",
};

const warsawDate = new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Warsaw", dateStyle: "short" });

export function caseTask(kind: CaseKind, status: string, due: string | null, today = warsawDate.format(new Date())) {
  if (status === "Zapoznano z oceną") return null;
  const label = actions[status] ?? (kind === "periodic"
    ? "Ustal kryteria i przygotuj rozmowę rozpoczynającą"
    : "Przeprowadź rozmowę wstępną i ustal termin sprawozdania");
  if (status === "Do podpisu") return { label, urgency: "confirmation" } as const;
  if (due && due < today) return { label, urgency: "overdue" } as const;
  if (due && due <= addDays(today, 7)) return { label, urgency: "soon" } as const;
  return { label, urgency: due ? "scheduled" : "undated" } as const;
}
