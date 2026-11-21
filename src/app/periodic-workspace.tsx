"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CircleCheck,
  Compass,
  FileText,
  Users,
} from "lucide-react";
import {
  criteria,
  periodicCriteria,
  periodicResult,
  suggestPeriodicPoints,
} from "../lib/scoring/periodic";
import type {
  Criterion,
  Decisions,
  Observation,
  PeriodicForm,
  Points,
} from "../lib/scoring/periodic";

export interface CompetencyModel {
  version: string;
  competencies: Record<
    Criterion,
    { id: string; label: string; levels: string[] }[]
  >;
}

const roles = {
  B: {
    title: "Naczelniczka wydziału",
    duties:
      "Kieruje pięcioosobowym zespołem, rozdziela zadania i omawia ich realizację.",
  },
  C: {
    title: "Starszy specjalista",
    duties:
      "Analizuje wnioski i przygotowuje odpowiedzi. Pracuje na samodzielnym stanowisku.",
  },
};
const steps = [
  "Stanowisko i kryteria",
  "Obserwacje",
  "Rozmowa i decyzje",
  "Podsumowanie",
];
const points: Points[] = [1, 3, 5, 7, 9];
const levelNames = [
  "Znacznie poniżej oczekiwań",
  "Poniżej oczekiwań",
  "Na poziomie oczekiwań",
  "Powyżej oczekiwań",
  "Znacznie powyżej oczekiwań",
];

export function PeriodicWorkspace({ model }: { model: CompetencyModel }) {
  const [form, setForm] = useState<PeriodicForm>("B");
  const [extra, setExtra] = useState<Criterion[]>([]);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, Observation>>({});
  const [examples, setExamples] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<Decisions>({});
  const [interview, setInterview] = useState(false);
  const [justification, setJustification] = useState("");
  const mandatory = periodicCriteria(form);
  const selected = periodicCriteria(form, extra);
  const key = selected[active];
  const indicators = model.competencies[key];
  const indicator = indicators[index];
  const result = periodicResult(form, extra, decisions);
  const summaryReady =
    result.status === "scored" &&
    interview &&
    (result.positive || !!justification.trim());

  function suggest(criterion: Criterion) {
    return suggestPeriodicPoints(
      model.competencies[criterion].map(
        (item) => ratings[item.id] ?? "pending",
      ),
    );
  }
  const currentSuggestion = suggest(key);

  function go(next: number) {
    setStep(next);
    window.scrollTo(0, 0);
  }
  function chooseCriterion(i: number) {
    setActive(i);
    setIndex(0);
  }
  function invalidateDecision() {
    setDecisions((previous) => ({ ...previous, [key]: null }));
    setInterview(false);
  }

  return (
    <>
      <header className="top">
        <div className="brand">
          <Compass aria-hidden="true" size={32} /> Azymut
        </div>
        <span>Kompas Kompetencji</span>
        <span className="demo">Demo przełożonego</span>
      </header>
      <p className="desktop-only">
        Otwórz Azymut na komputerze, aby przejść przez ocenę.
      </p>
      <div className="shell">
        <aside>
          <p className="eyebrow">Ścieżka oceny</p>
          <h2>Ocena okresowa</h2>
          <ol className="steps">
            {steps.map((label, i) => (
              <li key={label} aria-current={i === step ? "step" : undefined}>
                <span>{i < step ? <Check size={15} /> : i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
          <div className="side-note">
            <FileText size={19} />
            <div>
              <strong>Arkusz {form}</strong>
              <small>{roles[form].title}</small>
            </div>
          </div>
          <small>
            Przykład szkoleniowy. Dane są dostępne do odświeżenia strony.
          </small>
        </aside>
        <main>
          <div className="context">
            Ocena okresowa <span>/</span> Krok {step + 1} z 4
          </div>
          <h1>{steps[step]}</h1>
          {step === 0 && (
            <>
              <p className="lead">
                Wybierz przykładowy opis stanowiska i ustal kryteria do rozmowy
                rozpoczynającej.
              </p>
              <div className="role-grid">
                {(["B", "C"] as const).map((f) => (
                  <button
                    type="button"
                    key={f}
                    aria-pressed={f === form}
                    className="role"
                    onClick={() => {
                      if (form !== f) {
                        setForm(f);
                        setExtra([]);
                      }
                    }}
                  >
                    {f === "B" ? <Users /> : <BriefcaseBusiness />}
                    <span>Arkusz {f}</span>
                    <strong>{roles[f].title}</strong>
                    <small>{roles[f].duties}</small>
                  </button>
                ))}
              </div>
              <section>
                <h2>Kryteria obowiązkowe</h2>
                <ul className="pills">
                  {mandatory.map((c) => (
                    <li key={c}>{criteria[c]}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h2>
                  Kryteria dodatkowe <small>{extra.length}/3</small>
                </h2>
                <p>Wybierz te, które wynikają z obowiązków na stanowisku.</p>
                <div className="choices">
                  {(Object.keys(criteria) as Criterion[])
                    .filter((c) => !mandatory.includes(c))
                    .map((c) => (
                      <label key={c}>
                        <input
                          type="checkbox"
                          checked={extra.includes(c)}
                          disabled={!extra.includes(c) && extra.length >= 3}
                          onChange={(e) =>
                            setExtra(
                              e.target.checked
                                ? [...extra, c]
                                : extra.filter((x) => x !== c),
                            )
                          }
                        />
                        {criteria[c]}
                      </label>
                    ))}
                </div>
              </section>
              <div className="actions">
                <button className="primary" onClick={() => go(1)}>
                  Ustal kryteria i rozpocznij <ArrowRight />
                </button>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <p className="lead">
                Wybierz zachowania z modelu MC, które udało się zaobserwować w
                ocenianym okresie.
              </p>
              <section>
                <label className="field">
                  Kryterium
                  <select
                    value={active}
                    onChange={(e) => chooseCriterion(Number(e.target.value))}
                  >
                    {selected.map((c, i) => (
                      <option key={c} value={i}>
                        {criteria[c]}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="pager">
                  <strong>
                    Wskaźnik {index + 1} z {indicators.length}
                  </strong>
                  <div>
                    <button
                      aria-label="Poprzedni wskaźnik"
                      disabled={index === 0}
                      onClick={() => setIndex(index - 1)}
                    >
                      <ArrowLeft />
                    </button>
                    <button
                      aria-label="Następny wskaźnik"
                      disabled={index === indicators.length - 1}
                      onClick={() => setIndex(index + 1)}
                    >
                      <ArrowRight />
                    </button>
                  </div>
                </div>
                <fieldset>
                  <legend>{indicator.label}</legend>
                  {indicator.levels.map((description, i) => (
                    <label className="option" key={i}>
                      <input
                        type="radio"
                        name="observed"
                        checked={ratings[indicator.id] === points[i]}
                        onChange={() => {
                          setRatings({ ...ratings, [indicator.id]: points[i] });
                          invalidateDecision();
                        }}
                      />
                      <span>
                        <strong>{levelNames[i]}</strong>
                        {description}
                      </span>
                    </label>
                  ))}
                  {(["unobserved", "outside_scope"] as const).map((value) => (
                    <label className="option compact" key={value}>
                      <input
                        type="radio"
                        name="observed"
                        checked={ratings[indicator.id] === value}
                        onChange={() => {
                          setRatings({ ...ratings, [indicator.id]: value });
                          invalidateDecision();
                        }}
                      />
                      {value === "unobserved"
                        ? "Brak podstaw do oceny"
                        : "Poza zakresem stanowiska"}
                    </label>
                  ))}
                </fieldset>
                <label className="field">
                  Przykład z pracy
                  <textarea
                    value={examples[indicator.id] ?? ""}
                    placeholder="Sytuacja, działanie i rezultat"
                    onChange={(e) => {
                      setExamples({
                        ...examples,
                        [indicator.id]: e.target.value,
                      });
                      invalidateDecision();
                    }}
                  />
                </label>
                <p className="suggestion">
                  Sugestia dla kryterium:{" "}
                  <strong>
                    {currentSuggestion.suggestion === null
                      ? "Za mało obserwacji"
                      : currentSuggestion.suggestion + " pkt"}
                  </strong>{" "}
                  · Zaobserwowane {currentSuggestion.observed} z{" "}
                  {currentSuggestion.selected}
                </p>
              </section>
              <div className="actions">
                <button className="primary" onClick={() => go(2)}>
                  Przejdź do rozmowy <ArrowRight />
                </button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="lead">
                Omów z pracownikiem zadania, cele i potrzeby rozwojowe.
                Następnie wybierz ocenę każdego kryterium.
              </p>
              <section>
                <details>
                  <summary>Przykłady do rozmowy</summary>
                  {selected
                    .flatMap((c) => model.competencies[c])
                    .filter((item) => examples[item.id]?.trim()).length ===
                    0 && <p>Brak zapisanych przykładów.</p>}
                  {selected.map((c) =>
                    model.competencies[c]
                      .filter((item) => examples[item.id]?.trim())
                      .map((item) => (
                        <p key={item.id}>
                          <strong>{criteria[c]}</strong> · {item.label}
                          <br />
                          {examples[item.id]}
                        </p>
                      )),
                  )}
                </details>
                <label className="confirm">
                  <input
                    type="checkbox"
                    checked={interview}
                    onChange={(e) => {
                      setInterview(e.target.checked);
                      if (!e.target.checked) setDecisions({});
                    }}
                  />
                  Rozmowa oceniająca odbyła się.
                </label>
                {selected.map((c) => {
                  const { suggestion } = suggest(c);
                  return (
                    <div key={c} className="decision">
                      <div>
                        <strong>{criteria[c]}</strong>
                        <small>
                          Sugestia:{" "}
                          {suggestion === null
                            ? "za mało obserwacji"
                            : suggestion + " pkt"}
                        </small>
                      </div>
                      <label>
                        Twoja decyzja
                        <select
                          aria-label={"Twoja decyzja: " + criteria[c]}
                          disabled={!interview}
                          value={decisions[c] ?? ""}
                          onChange={(e) =>
                            setDecisions({
                              ...decisions,
                              [c]: e.target.value
                                ? (Number(e.target.value) as Points)
                                : null,
                            })
                          }
                        >
                          <option value="">Wybierz poziom</option>
                          {points.map((p, i) => (
                            <option key={p} value={p}>
                              {p} pkt · {levelNames[i]}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  );
                })}
                {result.status === "scored" && !result.positive && (
                  <label className="field">
                    Uzasadnienie oceny negatywnej (wymagane)
                    <textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                    />
                  </label>
                )}
              </section>
              <div className="actions">
                <button onClick={() => go(1)}>Wróć do obserwacji</button>
                <button
                  className="primary"
                  disabled={!summaryReady}
                  onClick={() => go(3)}
                >
                  Pokaż wynik <ArrowRight />
                </button>
              </div>
            </>
          )}
          {step === 3 && result.status === "scored" && (
            <>
              <section className="result">
                <CircleCheck size={30} />
                <h2>Ocena {result.positive ? "pozytywna" : "negatywna"}</h2>
                <p>
                  Średnia{" "}
                  {result.average.toLocaleString("pl-PL", {
                    maximumFractionDigits: 3,
                  })}{" "}
                  pkt · {levelNames[points.indexOf(result.level)]}
                </p>
                {result.reasons.includes("one_point") && (
                  <p>Co najmniej jedno kryterium oceniono na 1 pkt.</p>
                )}
                {result.reasons.includes("low_average") && (
                  <p>Średnia wynosi co najwyżej 4 pkt.</p>
                )}
                <a
                  href="https://eli.gov.pl/eli/DU/2016/470/ogl"
                  target="_blank"
                  rel="noreferrer"
                >
                  Podstawa wyniku · § 11 rozporządzenia
                </a>
              </section>
              <section>
                <h2>Decyzje przełożonego</h2>
                {selected.map((c) => (
                  <div className="decision" key={c}>
                    {criteria[c]}
                    <strong>{decisions[c]} pkt</strong>
                  </div>
                ))}
                {!result.positive && (
                  <p>
                    <strong>Uzasadnienie</strong>
                    <br />
                    {justification}
                  </p>
                )}
              </section>
              <div className="actions">
                <button onClick={() => go(2)}>
                  <ArrowLeft /> Wróć do decyzji
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
