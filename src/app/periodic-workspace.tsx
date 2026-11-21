"use client";

import { CriterionSuggestion } from "./criterion-suggestion";

import {
  emptyMeeting,
  MeetingSummary,
  OpeningMeetingForm,
} from "./opening-meeting";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  draftStorageKey,
  readPeriodicDraft,
  type CompetencyModel,
  type PeriodicDraft,
} from "../lib/drafts/periodic";
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
} from "../lib/scoring/periodic";
import type {
  Criterion,
  Decisions,
  Observation,
  PeriodicForm,
  Points,
} from "../lib/scoring/periodic";

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
  "Rozmowa rozpoczynająca",
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
  const [initial, setInitial] = useState<PeriodicDraft | null | undefined>(
    undefined,
  );
  const [notice, setNotice] = useState("");
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    let raw: string | null;
    try {
      raw = sessionStorage.getItem(draftStorageKey);
    } catch {
      setNotice("Przeglądarka zablokowała dostęp do szkicu.");
      setInitial(null);
      return;
    }
    try {
      setInitial(raw ? readPeriodicDraft(raw, model) : null);
      if (raw) setNotice("Wznowiono szkic.");
    } catch {
      setNotice(
        "Poprzedni szkic jest uszkodzony lub pochodzi z innej wersji modelu. Otwarto nową ocenę.",
      );
      setInitial(null);
    }
  }, [model]);
  if (initial === undefined)
    return <main aria-busy="true">Otwieranie arkusza…</main>;
  return (
    <AssessmentEditor
      key={generation}
      model={model}
      initial={initial}
      notice={notice}
      onRestart={() => {
        if (!window.confirm("Rozpocząć nową ocenę i usunąć szkic z tej karty?"))
          return;
        try {
          sessionStorage.removeItem(draftStorageKey);
        } catch {
          setNotice("Nie udało się usunąć szkicu. Spróbuj ponownie.");
          return;
        }
        setInitial(null);
        setNotice("");
        setGeneration((value) => value + 1);
      }}
    />
  );
}

function AssessmentEditor({
  model,
  initial,
  notice,
  onRestart,
}: {
  model: CompetencyModel;
  initial: PeriodicDraft | null;
  notice: string;
  onRestart: () => void;
}) {
  const [form, setForm] = useState<PeriodicForm>(initial?.form ?? "B");
  const [extra, setExtra] = useState<Criterion[]>(initial?.extra ?? []);
  const [step, setStep] = useState(initial?.step ?? 0);
  const [active, setActive] = useState(initial?.active ?? 0);
  const [index, setIndex] = useState(initial?.index ?? 0);
  const [ratings, setRatings] = useState<Record<string, Observation>>(
    initial?.ratings ?? {},
  );
  const [examples, setExamples] = useState<Record<string, string>>(
    initial?.examples ?? {},
  );
  const [decisions, setDecisions] = useState<Decisions>(
    initial?.decisions ?? {},
  );
  const [interview, setInterview] = useState(initial?.interview ?? false);
  const [justification, setJustification] = useState(
    initial?.justification ?? "",
  );
  const [developmentNotes, setDevelopmentNotes] = useState(
    initial?.developmentNotes ?? "",
  );
  const [meeting, setMeeting] = useState(initial?.meeting ?? emptyMeeting);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const draft: PeriodicDraft = {
      version: model.version,
      form,
      extra,
      step,
      active,
      index,
      ratings,
      examples,
      decisions,
      interview,
      justification,
      developmentNotes,
      meeting,
    };
    try {
      sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [
    model.version,
    form,
    extra,
    step,
    active,
    index,
    ratings,
    examples,
    decisions,
    interview,
    justification,
    developmentNotes,
    meeting,
  ]);
  const mandatory = periodicCriteria(form);
  const selected = periodicCriteria(form, extra);
  const key = selected[active];
  const indicators = model.competencies[key];
  const indicator = indicators[index];
  const result = periodicResult(form, extra, decisions);
  const summaryReady =
    result.status === "scored" &&
    interview &&
    !!developmentNotes.trim() &&
    (result.positive || !!justification.trim());

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
        <Link href="/pierwsza">Pierwsza ocena</Link>
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
          <div className="draft-status">
            <small role="status">
              {saved
                ? "Szkic zapisany w tej karcie."
                : "Zapis szkicu niedostępny."}
            </small>
            {notice && <small>{notice}</small>}
            <button onClick={onRestart}>Rozpocznij nową ocenę</button>
          </div>
        </aside>
        <main>
          <div className="context">
            Ocena okresowa <span>/</span> Krok {step + 1} z {steps.length}
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
                        setMeeting(emptyMeeting);
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
                  Przejdź do rozmowy rozpoczynającej <ArrowRight />
                </button>
              </div>
            </>
          )}
          {step === 1 && (
            <OpeningMeetingForm
              duties={roles[form].duties}
              criteria={selected.map((c) => criteria[c])}
              meeting={meeting}
              onChange={setMeeting}
              onBack={() => go(0)}
              onComplete={() => go(2)}
            />
          )}
          {step === 2 && (
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
                <CriterionSuggestion
                  indicators={indicators}
                  ratings={ratings}
                />
              </section>
              <div className="actions">
                <button className="primary" onClick={() => go(3)}>
                  Przejdź do rozmowy <ArrowRight />
                </button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <p className="lead">
                Omów z pracownikiem zadania, cele i potrzeby rozwojowe.
                Następnie wybierz ocenę każdego kryterium.
              </p>
              <section>
                <details>
                  <summary>Ustalenia z rozmowy rozpoczynającej</summary>
                  <MeetingSummary meeting={meeting} />
                </details>
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
                  return (
                    <div key={c} className="decision">
                      <div>
                        <strong>{criteria[c]}</strong>
                        <CriterionSuggestion
                          indicators={model.competencies[c]}
                          ratings={ratings}
                        />
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
                <label className="field">
                  Wnioski do indywidualnego programu rozwoju zawodowego
                  (wymagane)
                  <textarea
                    required
                    value={developmentNotes}
                    onChange={(e) => setDevelopmentNotes(e.target.value)}
                    placeholder="Jaką umiejętność warto rozwinąć? Jakie działanie omówiliście podczas rozmowy?"
                  />
                </label>
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
                <button onClick={() => go(2)}>Wróć do obserwacji</button>
                <button
                  className="primary"
                  disabled={!summaryReady}
                  onClick={() => go(4)}
                >
                  Pokaż wynik <ArrowRight />
                </button>
              </div>
            </>
          )}
          {step === 4 && result.status === "scored" && (
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
                <h2>Ustalenia początkowe</h2>
                <MeetingSummary meeting={meeting} />
              </section>
              <section>
                <h2>Decyzje przełożonego</h2>
                {selected.map((c) => (
                  <div className="decision" key={c}>
                    {criteria[c]}
                    <strong>{decisions[c]} pkt</strong>
                  </div>
                ))}
                <h3>Wnioski do indywidualnego programu rozwoju zawodowego</h3>
                <p className="whitespace-pre-wrap wrap-anywhere">
                  {developmentNotes}
                </p>
                {!result.positive && (
                  <p>
                    <strong>Uzasadnienie</strong>
                    <br />
                    {justification}
                  </p>
                )}
              </section>
              <div className="actions">
                <button onClick={() => go(3)}>
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
