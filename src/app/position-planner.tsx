"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { CompetencyModel } from "../lib/drafts/periodic";
import { maxPlannedIndicators, maxPositionLength, positionText, type PositionSuggestion } from "../lib/observations/position";
import { criteria, periodicCriteria, type Criterion, type PeriodicForm } from "../lib/scoring/periodic";

const example = "Stanowisko naczelniczki wydziału. Bezpośrednio kieruje pięcioosobowym zespołem i rozdziela zadania oraz odpowiedzialność. Monitoruje harmonogram raportów i organizuje przeglądy postępu. Analizuje przyczyny odchyleń w danych i porównuje warianty rozwiązań przed rekomendacją.";

export function PositionPlanner({
  model,
  form,
  description,
  extra,
  planned,
  onDescription,
  onForm,
  onCriterion,
  onIndicator,
}: {
  model: CompetencyModel;
  form: PeriodicForm;
  description: string;
  extra: Criterion[];
  planned: string[];
  onDescription: (text: string) => void;
  onForm: (form: PeriodicForm, text: string) => void;
  onCriterion: (criterion: Criterion) => void;
  onIndicator: (id: string) => void;
}) {
  const [text, setText] = useState(description);
  const [suggestion, setSuggestion] = useState<PositionSuggestion>();
  const [confirmedForm, setConfirmedForm] = useState<PeriodicForm>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const valid = positionText.safeParse(text);
  const selected = periodicCriteria(form, extra);
  const suggestedForm = suggestion?.form?.kind;
  const formConfirmed = !!description && description === valid.data && confirmedForm === form && form === suggestedForm;

  function update(value: string) {
    setText(value);
    setSuggestion(undefined);
    setConfirmedForm(undefined);
    setMessage("");
  }

  async function analyze() {
    if (!valid.success || busy) return;
    setBusy(true);
    setMessage("");
    setSuggestion(undefined);
    try {
      const response = await fetch("/api/opis-stanowiska", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: valid.data, version: model.version }),
      });
      if (response.ok) {
        const result: { suggestion: PositionSuggestion } = await response.json();
        setSuggestion(result.suggestion);
        return;
      }
      setMessage(response.status === 503
        ? "Model jest niedostępny. Możesz użyć opisu i wybrać arkusz samodzielnie."
        : "Nie udało się zweryfikować propozycji. Możesz użyć opisu i wybrać arkusz samodzielnie.");
    } catch {
      setMessage("Brak połączenia. Możesz użyć opisu i wybrać arkusz samodzielnie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="observation-inbox position-planner">
      <h2>Przygotuj ocenę z opisu stanowiska</h2>
      <label className="field">
        <span>Wklej obowiązki i zakres kierowania z fikcyjnego opisu stanowiska pracy (OSP).</span>
        <textarea
          rows={4}
          maxLength={maxPositionLength}
          value={text}
          disabled={busy}
          onChange={(event) => update(event.target.value)}
        />
      </label>
      <div className="actions">
        <button className="primary" disabled={!valid.success || busy} onClick={() => void analyze()}>
          <Sparkles size={17} /> {busy ? "Analizuję opis…" : "Przeanalizuj opis stanowiska"}
        </button>
        <button disabled={!valid.success || busy || description === valid.data} onClick={() => {
          if (valid.success) onDescription(valid.data);
        }}>Użyj opisu w sprawie</button>
        <button className="link" disabled={busy || !!text} onClick={() => update(example)}>Wstaw przykład OSP</button>
      </div>
      {description && (
        <p className="position-used">
          Opis zapisany w sprawie.{" "}
          <button className="link" onClick={() => { setConfirmedForm(undefined); onDescription(""); }}>Usuń zapisany opis</button>
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {suggestion && (
        <div className="observation-cards">
          {!suggestion.form ? (
            <article className="observation-card">
              <strong>Sprawdź, czy stanowisko obejmuje bezpośrednie kierowanie pracownikami</strong>
              <p>Z opisu nie udało się ustalić arkusza. Po sprawdzeniu obowiązków wybierz go samodzielnie poniżej.</p>
            </article>
          ) : (
            <article className="observation-card">
              <strong>Proponowany arkusz {suggestion.form.kind}</strong>
              <PositionQuote text={suggestion.form.quote} />
              {suggestion.form.kind === "A" ? (
                <p>Wskazano stanowisko kierownika urzędu. Sprawdź obowiązki z opisu. Arkusz A jest poza zakresem prototypu MC.</p>
              ) : (
                <button disabled={formConfirmed} onClick={() => {
                  if (valid.success && (suggestedForm === "B" || suggestedForm === "C")) {
                    onForm(suggestedForm, valid.data);
                    setConfirmedForm(suggestedForm);
                  }
                }}>{formConfirmed ? "Arkusz potwierdzony" : `Potwierdź arkusz ${suggestion.form.kind}`}</button>
              )}
            </article>
          )}
          {suggestion.criteria.length > 0 && (
            <div className="observation-card">
              <h3>Kryteria dodatkowe</h3>
              <ul>
                {suggestion.criteria.map(({ id, quote }) => {
                  const key = id as Criterion;
                  const added = extra.includes(key);
                  return (
                    <li key={id}>
                      <strong>{criteria[key]}</strong>
                      <PositionQuote text={quote} />
                      <button disabled={!formConfirmed || (!added && extra.length >= 3)} onClick={() => onCriterion(key)}>
                        {added ? "Usuń z kryteriów" : "Dodaj kryterium"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {suggestion.indicators.length > 0 && (
            <div className="observation-card">
              <h3>Wskaźniki do planu obserwacji</h3>
              <p>Po potwierdzeniu kryterium możesz przypiąć wskaźnik i szybko wrócić do niego na etapie obserwacji.</p>
              <ul>
                {suggestion.indicators.map(({ id, quote }) => {
                  const key = (Object.keys(criteria) as Criterion[]).find((key) =>
                    model.competencies[key].some((item) => item.id === id),
                  );
                  if (!key) return null;
                  const added = planned.includes(id);
                  return (
                    <li key={id}>
                      <strong>{model.competencies[key].find((item) => item.id === id)?.label}</strong>
                      <PositionQuote text={quote} />
                      <button disabled={!formConfirmed || !selected.includes(key) || (!added && planned.length >= maxPlannedIndicators)} onClick={() => onIndicator(id)}>
                        {added ? "Odepnij wskaźnik" : "Przypnij wskaźnik"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function PositionQuote({ text }: { text: string }) {
  return <blockquote className="observation-original"><mark>{text}</mark></blockquote>;
}
