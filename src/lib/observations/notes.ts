import { z } from "zod";

export const maxNoteLength = 700;
export const maxNotesPerBatch = 8;
export const maxSavedNotes = 80;
export const observationDate = z.union([z.iso.date(), z.literal("")]);
export const noteText = z.string().trim().min(3).max(maxNoteLength);

const gap = z.enum(["situation", "action", "result", "context"]);
type Gap = z.infer<typeof gap>;

export const noteSuggestion = z.object({
  index: z.int().min(0).max(maxNotesPerBatch - 1),
  indicatorId: z.string().max(80).nullable(),
  quote: noteText,
  gap: gap.nullable(),
});
export type NoteSuggestion = z.infer<typeof noteSuggestion>;

export const savedNote = z.object({
  id: z.uuid(),
  text: noteText,
  date: observationDate.optional(),
  quote: noteText.optional(),
  indicatorId: z.string().max(80).nullable(),
  gap: gap.nullable(),
})
  .refine(({ text, quote }) => !quote || text.includes(quote));
export type SavedNote = z.infer<typeof savedNote>;

export const gapQuestions: Record<Gap, string> = {
  situation: "W jakiej konkretnej sytuacji to się wydarzyło?",
  action: "Co dokładnie pracownik zrobił w tej sytuacji?",
  result: "Jaki był rezultat dla zadania lub zespołu?",
  context: "Czy możesz przywołać konkretny przykład i opisać jego okoliczności?",
};

export function splitNotes(text: string) {
  return text.trim().split(/\r?\n[\t ]*\r?\n/u).map((note) => note.trim()).filter(Boolean);
}

export function dateFromNote(text: string) {
  const start = text.replace(/^data obserwacji:\s*/iu, "");
  const iso = /^([0-9]{4}-[0-9]{2}-[0-9]{2})(?=$|[\s:;,–—])/u.exec(start)?.[1];
  const polish = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?(?=$|[\s:;,–—])/u.exec(start);
  const candidate = iso ?? (polish ? `${polish[3]}-${polish[2].padStart(2, "0")}-${polish[1].padStart(2, "0")}` : "");
  return observationDate.safeParse(candidate).data || undefined;
}

export function verifyNoteSuggestions(
  notes: readonly string[],
  suggestions: readonly NoteSuggestion[],
  candidateIds: ReadonlySet<string>,
): NoteSuggestion[] | null {
  const byIndex = new Map<number, NoteSuggestion>();
  for (const suggestion of suggestions) {
    const text = notes[suggestion.index];
    if (
      !text ||
      byIndex.has(suggestion.index) ||
      !text.includes(suggestion.quote) ||
      (suggestion.indicatorId !== null && !candidateIds.has(suggestion.indicatorId)) ||
      (suggestion.indicatorId === null && suggestion.gap === null)
    ) return null;
    byIndex.set(suggestion.index, suggestion);
  }
  if (byIndex.size !== notes.length) return null;
  return [...byIndex.values()].sort((a, b) => a.index - b.index);
}
