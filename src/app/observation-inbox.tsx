"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { CompetencyModel } from "../lib/drafts/periodic";
import {
  gapQuestions,
  maxNoteLength,
  maxNotesPerBatch,
  maxSavedNotes,
  splitNotes,
  type NoteSuggestion,
  type SavedNote,
} from "../lib/observations/notes";
import { criteria, periodicCriteria, type Criterion, type PeriodicForm } from "../lib/scoring/periodic";

type Review = NoteSuggestion & { text: string };

const sampleNotes = [
  "Kierująca rozdzieliła części raportu między członków zespołu i ustaliła, kto odpowiada za zebranie danych. Raport powstał na czas.",
  "Kiedy zabrakło danych z jednego wydziału, kierująca zorganizowała wcześniejszy przegląd. Braki uzupełniono przed wysłaniem raportu.",
  "Kierująca zbyt rzadko daje zespołowi informację zwrotną.",
].join("\n\n");

export function ObservationInbox({
  model,
  form,
  extra,
  sample,
  savedCount,
  onSave,
}: {
  model: CompetencyModel;
  form: PeriodicForm;
  extra: Criterion[];
  sample: boolean;
  savedCount: number;
  onSave: (note: SavedNote) => void;
}) {
  const [text, setText] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selected = periodicCriteria(form, extra);
  const notes = splitNotes(text);
  const valid = notes.length > 0 && notes.length <= maxNotesPerBatch &&
    notes.every((note) => note.length >= 3 && note.length <= maxNoteLength);

  async function review(useModel: boolean) {
    if (!valid || busy) return;
    setMessage("");
    if (!useModel) {
      setReviews(notes.map((note, index) => ({
        index, text: note, quote: "", indicatorId: null, gap: "context",
      })));
      setText("");
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
        setReviews(suggestions.map((item) => ({ ...item, text: notes[item.index] })));
        setText("");
      } else {
        setMessage("Nie udało się przeanalizować notatek. Możesz przypisać je ręcznie.");
      }
    } catch {
      setMessage("Brak połączenia. Możesz przypisać notatki ręcznie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="observation-inbox">
      <h2>Dodaj notatki z pracy</h2>
      <label className="field">
        <span>Opisz konkretne sytuacje. Oddziel notatki pustą linią i używaj wyłącznie danych fikcyjnych.</span>
        <textarea
          rows={4}
          maxLength={(maxNoteLength + 4) * maxNotesPerBatch}
          placeholder="Sytuacja, działanie i rezultat"
          value={text}
          disabled={busy || reviews.length > 0}
          onChange={(event) => setText(event.target.value)}
        />
      </label>
      <div className="actions">
        <button type="button" className="primary" disabled={!valid || busy || reviews.length > 0} onClick={() => void review(true)}>
          <Sparkles size={17} /> {busy ? "Analizuję notatki…" : "Przeanalizuj notatki"}
        </button>
        <button type="button" disabled={!valid || busy || reviews.length > 0} onClick={() => void review(false)}>
          Przypisz ręcznie
        </button>
        {sample && (
          <button type="button" className="link" disabled={busy || reviews.length > 0 || !!text} onClick={() => setText(sampleNotes)}>
            Wstaw przykładowe notatki
          </button>
        )}
      </div>
      {!valid && text.trim() && <p role="status">Wpisz maksymalnie {maxNotesPerBatch} notatek, po 3–{maxNoteLength} znaków.</p>}
      {message && <p role="status">{message}</p>}
      {reviews.length > 0 && (
        <div className="observation-cards">
          {reviews.map((item) => {
            const quoteStart = item.text.indexOf(item.quote);
            return (
              <article className="observation-card" key={item.index}>
                <p className="observation-original">
                  {item.text.slice(0, quoteStart)}
                  {item.quote && <mark>{item.quote}</mark>}
                  {item.text.slice(quoteStart + item.quote.length)}
                </p>
                {item.gap && <p>{gapQuestions[item.gap]}</p>}
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
                <div className="actions">
                  <button type="button" disabled={savedCount >= maxSavedNotes} onClick={() => {
                    onSave({ id: crypto.randomUUID(), text: item.text, indicatorId: item.indicatorId, gap: item.gap });
                    setReviews((previous) => previous.filter(({ index }) => index !== item.index));
                    setMessage(item.indicatorId ? "Zapisano przykład przy wskaźniku." : "Zapisano kwestię do rozmowy.");
                  }}>
                    {item.indicatorId ? "Zapisz i otwórz wskaźnik" : "Zapisz do rozmowy"}
                  </button>
                  <button type="button" className="link" onClick={() =>
                    setReviews((previous) => previous.filter(({ index }) => index !== item.index))
                  }>
                    Odrzuć
                  </button>
                </div>
              </article>
            );
          })}
          {savedCount >= maxSavedNotes && <p>Osiągnięto limit {maxSavedNotes} notatek w sprawie.</p>}
        </div>
      )}
    </section>
  );
}
