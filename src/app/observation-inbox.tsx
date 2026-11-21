"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check, MessageSquareText, Sparkles } from "lucide-react";
import type { CompetencyModel } from "../lib/drafts/periodic";
import {
  dateFromNote,
  gapQuestions,
  maxNoteLength,
  maxNotesPerBatch,
  maxSavedNotes,
  observationDate,
  splitNotes,
  type NoteSuggestion,
  type SavedNote,
} from "../lib/observations/notes";
import { criteria, periodicCriteria, type Criterion, type PeriodicForm } from "../lib/scoring/periodic";
import { ObservationEvidence } from "./observation-evidence";

type Review = NoteSuggestion & { text: string; date?: string };

const sampleNotes = [
  "18.06.2026: Gdy zespół stracił zapał do pracy nad raportem, kierująca zachęciła pracowników do jego dokończenia. Pokazała, jak ich raport pomoże innym wydziałom. Członkowie zespołu wrócili do zadania i oddali raport na czas.",
  "08.11.2026: Kiedy zabrakło danych z jednego wydziału, kierująca zorganizowała wcześniejszy przegląd. Braki uzupełniono przed wysłaniem raportu.",
  "Kierująca zbyt rzadko daje zespołowi informację zwrotną.",
].join("\n\n");

export function ObservationInbox({
  model,
  form,
  extra,
  sample,
  hidden,
  savedCount,
  onSave,
}: {
  model: CompetencyModel;
  form: PeriodicForm;
  extra: Criterion[];
  sample: boolean;
  hidden: boolean;
  savedCount: number;
  onSave: (notes: SavedNote[], finished: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [pendingReviews, setReviews] = useState<Review[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const selected = periodicCriteria(form, extra);
  const indicators = new Map(selected.flatMap((criterion) =>
    model.competencies[criterion].map(({ id, label }) => [id, { label, criterion }] as const),
  ));
  const reviews = pendingReviews.map((note) =>
    note.indicatorId && !indicators.has(note.indicatorId)
      ? { ...note, indicatorId: null, gap: note.gap ?? "context" as const }
      : note,
  );
  const notes = splitNotes(text);
  const valid = notes.length > 0 && notes.length <= maxNotesPerBatch &&
    notes.every((note) => note.length >= 3 && note.length <= maxNoteLength);
  const matchedCount = reviews.filter(({ indicatorId }) => indicatorId !== null).length;
  const hasRoom = savedCount + reviews.length <= maxSavedNotes;

  function showReview(suggestions: NoteSuggestion[]) {
    setReviews(suggestions.map((item) => ({
      ...item,
      text: notes[item.index],
      date: dateFromNote(notes[item.index]),
    })));
    setText("");
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: "start" });
    });
  }

  async function review(useModel: boolean) {
    if (!valid || busy) return;
    setMessage("");
    if (!useModel) {
      showReview(notes.map((_, index) => ({
        index, quote: "", indicatorId: null, gap: "context",
      })));
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/obserwacje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: model.version, form, extra, notes }),
      });
      if (response.status === 503) {
        setMessage("Model jest niedostępny. Ponów próbę lub przypisz notatki ręcznie.");
      } else if (response.status === 422) {
        setMessage("Nie udało się potwierdzić dopasowań. Ponów próbę lub przypisz notatki ręcznie.");
      } else if (response.status === 409) {
        setMessage("Wersja modelu kompetencji uległa zmianie. Możesz przypisać notatki ręcznie.");
      } else if (response.ok) {
        const { suggestions }: { suggestions: NoteSuggestion[] } = await response.json();
        showReview(suggestions);
      } else {
        setMessage("Nie udało się przeanalizować notatek. Możesz przypisać je ręcznie.");
      }
    } catch {
      setMessage("Brak połączenia. Możesz przypisać notatki ręcznie.");
    } finally {
      setBusy(false);
    }
  }

  function save(items: Review[]) {
    if (savedCount + items.length > maxSavedNotes) return;
    onSave(items.map((item) => ({
      id: crypto.randomUUID(),
      text: item.text,
      quote: item.quote || undefined,
      date: item.date || undefined,
      indicatorId: item.indicatorId,
      gap: item.gap,
    })), items.length === reviews.length);
    const savedIndices = new Set(items.map(({ index }) => index));
    setReviews((previous) => previous.filter(({ index }) => !savedIndices.has(index)));
    setMessage(items.length === 1 ? "Zapisano notatkę." : `Zapisano notatki (${items.length}).`);
  }

  const saveAll = (
    <button type="button" className="primary review-save" disabled={!hasRoom} onClick={() => save(reviews)}>
      Zapisz wszystkie i przejdź dalej <ArrowRight size={18} />
    </button>
  );

  return (
    <section className="observation-inbox" hidden={hidden} aria-busy={busy}>
      {reviews.length === 0 ? (
        <>
          <h2>Dodaj notatki z pracy</h2>
          <label className="field">
            <span>Opisz konkretne sytuacje. Oddziel notatki pustą linią i używaj wyłącznie danych fikcyjnych.</span>
            <textarea
              rows={4}
              maxLength={(maxNoteLength + 4) * maxNotesPerBatch}
              placeholder="Sytuacja, działanie i rezultat"
              value={text}
              disabled={busy}
              onChange={(event) => setText(event.target.value)}
            />
          </label>
          <div className="actions">
            <button type="button" className="primary" disabled={!valid || busy} onClick={() => void review(true)}>
              <Sparkles size={17} /> {busy ? "Analizuję notatki…" : "Przeanalizuj notatki"}
            </button>
            <button type="button" disabled={!valid || busy} onClick={() => void review(false)}>
              Przypisz ręcznie
            </button>
            {sample && (
              <button type="button" className="link" disabled={busy || !!text} onClick={() => setText(sampleNotes)}>
                Wstaw przykładowe notatki
              </button>
            )}
          </div>
          {!valid && text.trim() && <p role="status">Wpisz maksymalnie {maxNotesPerBatch} notatek, po 3–{maxNoteLength} znaków.</p>}
        </>
      ) : (
        <>
          <div className="review-header">
            <h2 ref={heading} tabIndex={-1}>Sprawdź i zapisz notatki</h2>
            <p>Sprawdź wyróżnione fragmenty i w razie potrzeby popraw przypisanie. Po zapisaniu przejdziesz do wyboru zachowania lub do agendy rozmowy.</p>
            <div className="review-counts">
              {matchedCount > 0 && <span><Check size={16} /> Dopasowane: {matchedCount}</span>}
              {matchedCount < reviews.length && <span><MessageSquareText size={16} /> Do rozmowy: {reviews.length - matchedCount}</span>}
            </div>
            {saveAll}
            {!hasRoom && <p role="status">Możesz zapisać maksymalnie {maxSavedNotes} notatek w sprawie. Zapisz część lub usuń zbędne wpisy z dziennika.</p>}
          </div>
          <div className="observation-cards">
            {reviews.map((item) => {
              const match = item.indicatorId ? indicators.get(item.indicatorId) : undefined;
              return (
                <article className="observation-card review-card" data-match={Boolean(match)} key={item.index}>
                  <div>
                    <small className="review-label">{match ? criteria[match.criterion] : "Kwestia do rozmowy"}</small>
                    <h3>{match ? match.label : gapQuestions[item.gap ?? "context"]}</h3>
                  </div>
                  <ObservationEvidence quote={item.quote} text={item.text} />
                  {match && item.gap && <p>{gapQuestions[item.gap]}</p>}
                  <details className="review-edit">
                    <summary>Zmień przypisanie lub datę</summary>
                    <label className="field">
                      Wskaźnik modelu MC
                      <select value={item.indicatorId ?? ""} onChange={(event) => {
                        const id = event.target.value || null;
                        setReviews((previous) => previous.map((entry) => entry.index === item.index
                          ? { ...entry, indicatorId: id, gap: id === null ? entry.gap ?? "context" : null }
                          : entry));
                      }}>
                        <option value="">Kwestia do rozmowy</option>
                        {selected.map((criterion) => (
                          <optgroup key={criterion} label={criteria[criterion]}>
                            {model.competencies[criterion].map(({ id, label }) => (
                              <option key={id} value={id}>{label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </label>
                    <label className="field observation-date">
                      Data obserwacji (opcjonalnie)
                      <input type="date" value={item.date ?? ""} onChange={(event) => {
                        const date = observationDate.safeParse(event.target.value);
                        if (date.success) setReviews((previous) => previous.map((entry) => entry.index === item.index
                          ? { ...entry, date: date.data }
                          : entry));
                      }} />
                    </label>
                    <div className="actions">
                      <button type="button" disabled={savedCount >= maxSavedNotes} onClick={() => save([item])}>Zapisz tylko tę notatkę</button>
                      <button type="button" className="link" onClick={() =>
                        setReviews((previous) => previous.filter(({ index }) => index !== item.index))
                      }>Odrzuć tę notatkę</button>
                    </div>
                  </details>
                  {item.date && <small><time dateTime={item.date}>{item.date.split("-").reverse().join(".")}</time></small>}
                </article>
              );
            })}
          </div>
          {reviews.length > 2 && <div className="actions">{saveAll}</div>}
        </>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
