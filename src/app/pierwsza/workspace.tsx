"use client";

import { CaseControls } from "../case-controls";
import { firstReportStatus, type FirstDraft } from "../../lib/drafts/first";
import { Logout } from "../logout";

import { AssistantPanel } from "../assistant-panel";

import Link from "next/link";
import { AssessmentDownload } from "../assessment-download";
import { useState } from "react";
import { Compass } from "lucide-react";
import type { CompetencyModel } from "../../lib/drafts/periodic";
import {
  criteria,
  type Observation,
  type Points,
} from "../../lib/scoring/periodic";
import {
  firstCriteria,
  firstResult,
  suggestFirstPoints,
  type FirstAssessment,
  type FirstPoints,
} from "../../lib/scoring/first";
import { firstAssessmentWindow } from "../../lib/scoring/calendar";

const examLabels = {
  passed: "Egzamin zaliczony",
  not_passed: "Egzamin niezaliczony",
  ksap_graduate_without_nomination_application:
    "Absolwent KSAP bez wniosku o mianowanie",
  replacement_subject_to_first_evaluation: "Zastępstwo objęte pierwszą oceną",
  higher_civil_service_position: "Wyższe stanowisko w służbie cywilnej",
} satisfies Record<NonNullable<FirstAssessment["exam"]>, string>;
const reasons = {
  exam_not_passed: "Nie spełniono warunku zaliczenia egzaminu.",
  report_not_on_time: "Sprawozdanie nie wpłynęło w terminie.",
  multiple_threes: "Więcej niż jeden element oceniono na 3 pkt.",
  low_average: "Średnia jest niższa niż 5 pkt.",
};
const steps = [
  "Rozmowa wstępna",
  "Sprawozdanie i egzamin",
  "Obserwacje",
  "Rozmowa oceniająca i decyzje",
  "Podsumowanie",
];
const behaviorPoints: Points[] = [1, 3, 5, 7, 9];

export function FirstWorkspace({
  model,
  authenticated,
  initial,
  remoteRevision,
  unread,
  notice,
}: {
  model: CompetencyModel;
  authenticated: boolean;
  initial?: FirstDraft;
  remoteRevision: number;
  unread: boolean;
  notice?: string;
}) {
  const [step, setStep] = useState(initial?.step ?? 0);
  const [start, setStart] = useState(initial?.start ?? "2026-02-02");
  const [end, setEnd] = useState(initial?.end ?? "2027-02-01");
  const [replacement, setReplacement] = useState(initial?.replacement ?? false);
  const [agreement, setAgreement] = useState(initial?.agreement ?? "");
  const [opening, setOpening] = useState(initial?.opening ?? "");
  const [reportFrom, setReportFrom] = useState(initial?.reportFrom ?? "");
  const [reportDue, setReportDue] = useState(initial?.reportDue ?? "");
  const [received, setReceived] = useState(initial?.received ?? "");
  const [overdue, setOverdue] = useState(initial?.overdue ?? false);
  const [exam, setExam] = useState<FirstAssessment["exam"]>(initial?.exam);
  const [active, setActive] = useState(initial?.active ?? 0);
  const [index, setIndex] = useState(initial?.index ?? 0);
  const [ratings, setRatings] = useState<Record<string, Observation>>(
    initial?.ratings ?? {},
  );
  const [examples, setExamples] = useState<Record<string, string>>(
    initial?.examples ?? {},
  );
  const [conversation, setConversation] = useState(initial?.conversation ?? "");
  const [decisions, setDecisions] = useState<FirstAssessment["decisions"]>(
    initial?.decisions ?? {},
  );
  const [justification, setJustification] = useState(
    initial?.justification ?? "",
  );
  const [development, setDevelopment] = useState(initial?.development ?? "");

  const [revision, setRevision] = useState(remoteRevision);

  const windowDates =
    start && end && (!replacement || agreement)
      ? firstAssessmentWindow(start, end, replacement ? agreement : start)
      : null;
  const report = firstReportStatus(reportFrom, reportDue, received, overdue);
  const draft: FirstDraft = {
    version: model.version,
    step,
    start,
    end,
    replacement,
    agreement,
    opening,
    reportFrom,
    reportDue,
    received,
    overdue,
    exam,
    active,
    index,
    ratings,
    examples,
    conversation,
    decisions,
    justification,
    development,
  };
  const result = firstResult({ decisions, exam, report });
  const criterion = firstCriteria[active];
  const indicators = model.competencies[criterion];
  const indicator = indicators[index];
  const suggest = (key: typeof criterion) =>
    suggestFirstPoints(
      model.competencies[key].map((item) => ratings[item.id] ?? "pending"),
    );
  const suggestion = suggest(criterion);
  const conversationMin = received || reportDue;
  function go(next: number) {
    setStep(next);
    window.scrollTo(0, 0);
  }
  function invalidateDecision() {
    setDecisions((previous) => ({ ...previous, [criterion]: null }));
  }

  return (
    <>
      <header className="top">
        <Link className="brand" href="/">
          <Compass size={32} /> Azymut
        </Link>
        <Link href="/">Ocena okresowa</Link>
        <span className="demo">
          {authenticated ? <Logout /> : "Demo przełożonego"}
        </span>
      </header>
      <p className="desktop-only">
        Otwórz Azymut na komputerze, aby przejść przez ocenę.
      </p>
      <div className="shell">
        <aside>
          <h2>Pierwsza ocena</h2>
          <ol className="steps">
            {steps.map((label, i) => (
              <li key={label} aria-current={i === step ? "step" : undefined}>
                <span>{i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
        </aside>
        <main>
          <h1>{steps[step]}</h1>
          {notice && <p role="status">{notice}</p>}
          {step === 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                go(1);
              }}
            >
              <p className="lead">
                Przykładowa sprawa starszego specjalisty. Potwierdź terminy na
                podstawie umowy i odnotuj rozmowę.
              </p>
              <section>
                <h2>Umowa i rozmowa</h2>
                <label className="field">
                  Początek zatrudnienia
                  <input
                    required
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </label>
                <label className="field">
                  Koniec umowy
                  <input
                    required
                    type="date"
                    min={start}
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </label>
                <label className="confirm">
                  <input
                    type="checkbox"
                    checked={replacement}
                    onChange={(e) => {
                      setReplacement(e.target.checked);
                      if (
                        !e.target.checked &&
                        exam === "replacement_subject_to_first_evaluation"
                      )
                        setExam(null);
                    }}
                  />
                  Zastępstwo objęte pierwszą oceną
                </label>
                {replacement && (
                  <label className="field">
                    Data ustalenia przez strony
                    <input
                      required
                      type="date"
                      min={start}
                      max={end}
                      value={agreement}
                      onChange={(e) => setAgreement(e.target.value)}
                    />
                  </label>
                )}
                <label className="field">
                  Data rozmowy wstępnej
                  <input
                    required
                    type="date"
                    min={replacement ? agreement : start}
                    max={end}
                    value={opening}
                    onChange={(e) => setOpening(e.target.value)}
                  />
                </label>
                {windowDates && (
                  <p>
                    Termin rozmowy wstępnej:{" "}
                    <time>{windowDates.interviewDeadline}</time>
                    {opening > windowDates.interviewDeadline &&
                      " · Odnotowana rozmowa odbyła się po terminie."}
                  </p>
                )}
              </section>
              <section>
                <h2>Okno złożenia sprawozdania</h2>
                <p>
                  Sprawozdanie obejmuje co najmniej siedem przepracowanych
                  miesięcy.
                </p>
                <label className="field">
                  Początek okna
                  <input
                    required
                    type="date"
                    min={windowDates?.earliestAssessment}
                    max={windowDates?.latestAssessment}
                    value={reportFrom}
                    onChange={(e) => setReportFrom(e.target.value)}
                  />
                </label>
                <label className="field">
                  Koniec okna
                  <input
                    required
                    type="date"
                    min={reportFrom || windowDates?.earliestAssessment}
                    max={windowDates?.latestAssessment}
                    value={reportDue}
                    onChange={(e) => setReportDue(e.target.value)}
                  />
                </label>
                {windowDates && (
                  <p>
                    Okno dokonania oceny: {windowDates.earliestAssessment} –{" "}
                    {windowDates.latestAssessment}.
                  </p>
                )}
                {windowDates &&
                  windowDates.earliestAssessment >
                    windowDates.latestAssessment && (
                    <p role="alert">
                      Daty umowy nie pozostawiają okna oceny. Sprawdź sprawę z
                      HR.
                    </p>
                  )}
              </section>
              <div className="actions">
                <button className="primary">Przejdź do sprawozdania</button>
              </div>
            </form>
          )}
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                go(2);
              }}
            >
              <section>
                <h2>Sprawozdanie</h2>
                <p>
                  Wyznaczony termin: {reportFrom} – {reportDue}.
                </p>
                <label className="field">
                  Data wpływu sprawozdania
                  <input
                    type="date"
                    min={start}
                    value={received}
                    onChange={(e) => {
                      setReceived(e.target.value);
                      setOverdue(false);
                    }}
                  />
                </label>
                {!received && (
                  <label className="confirm">
                    <input
                      type="checkbox"
                      checked={overdue}
                      onChange={(e) => setOverdue(e.target.checked)}
                    />
                    Termin upłynął i sprawozdanie nie wpłynęło
                  </label>
                )}
              </section>
              <section>
                <h2>Egzamin ze służby przygotowawczej</h2>
                <label className="field">
                  Wynik lub podstawa wyjątku
                  <select
                    required
                    value={exam ?? ""}
                    onChange={(e) =>
                      setExam((e.target.value || null) as FirstAssessment["exam"])
                    }
                  >
                    <option value="">Wybierz</option>
                    {Object.entries(examLabels)
                      .filter(
                        ([key]) =>
                          key !== "replacement_subject_to_first_evaluation" ||
                          replacement,
                      )
                      .map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                  </select>
                </label>
              </section>
              <div className="actions">
                <button type="button" onClick={() => go(0)}>
                  Wróć do rozmowy wstępnej
                </button>
                <button disabled={!report} className="primary">
                  Przejdź do obserwacji
                </button>
              </div>
            </form>
          )}
          {step === 2 && (
            <>
              <section>
                <label className="field">
                  Element oceny
                  <select
                    value={active}
                    onChange={(e) => {
                      setActive(Number(e.target.value));
                      setIndex(0);
                    }}
                  >
                    {firstCriteria.map((key, i) => (
                      <option key={key} value={i}>
                        {criteria[key]}
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
                      disabled={!index}
                      onClick={() => setIndex(index - 1)}
                    >
                      Poprzedni
                    </button>
                    <button
                      disabled={index === indicators.length - 1}
                      onClick={() => setIndex(index + 1)}
                    >
                      Następny
                    </button>
                  </div>
                </div>
                <fieldset>
                  <legend>{indicator.label}</legend>
                  {(
                    [...behaviorPoints, "unobserved", "outside_scope"] as const
                  ).map((value, i) => (
                    <label key={value} className="option">
                      <input
                        type="radio"
                        name="first-observed"
                        checked={ratings[indicator.id] === value}
                        onChange={() => {
                          setRatings({ ...ratings, [indicator.id]: value });
                          invalidateDecision();
                        }}
                      />
                      {typeof value === "number"
                        ? indicator.levels[i]
                        : value === "unobserved"
                          ? "Brak podstaw do oceny"
                          : "Poza zakresem stanowiska"}
                    </label>
                  ))}
                </fieldset>
                <label className="field">
                  Przykład z pracy
                  <textarea
                    placeholder="Sytuacja, działanie i rezultat"
                    value={examples[indicator.id] ?? ""}
                    onChange={(e) => {
                      setExamples({
                        ...examples,
                        [indicator.id]: e.target.value,
                      });
                      invalidateDecision();
                    }}
                  />
                </label>
                <p>
                  Sugestia w skali pierwszej oceny:{" "}
                  <strong>
                    {suggestion.suggestion === null
                      ? "Za mało obserwacji"
                      : suggestion.suggestion + " pkt"}
                  </strong>
                </p>
                <details>
                  <summary>Jak przeliczamy poziomy?</summary>
                  <p>
                    Zaobserwowano {suggestion.observed} z {suggestion.selected}{" "}
                    dobranych wskaźników. Azymut pokazuje sugestię od połowy
                    zaobserwowanych wskaźników. Dwa niższe poziomy modelu
                    odpowiadają 3 pkt, środkowy 5 pkt, a dwa wyższe 7 pkt.
                  </p>
                </details>
              </section>
              <div className="actions">
                <button onClick={() => go(1)}>Wróć do sprawozdania</button>
                <button className="primary" onClick={() => go(3)}>
                  Przejdź do rozmowy oceniającej
                </button>
              </div>
            </>
          )}
          {step === 3 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                go(4);
              }}
            >
              <section>
                <label className="field">
                  Data rozmowy oceniającej
                  <input
                    required
                    type="date"
                    min={conversationMin}
                    value={conversation}
                    onChange={(e) => setConversation(e.target.value)}
                  />
                </label>
                <details>
                  <summary>Przykłady do rozmowy</summary>
                  {firstCriteria
                    .flatMap((key) => model.competencies[key])
                    .filter((item) => examples[item.id]?.trim())
                    .map((item) => (
                      <p key={item.id}>
                        <strong>{item.label}</strong>
                        <br />
                        {examples[item.id]}
                      </p>
                    ))}
                </details>
                {firstCriteria.map((key) => (
                  <div className="decision" key={key}>
                    <div>
                      <strong>{criteria[key]}</strong>
                      <small>
                        Sugestia:{" "}
                        {suggest(key).suggestion ?? "za mało obserwacji"}
                      </small>
                    </div>
                    <label>
                      Twoja decyzja
                      <select
                        required
                        disabled={
                          !conversation || conversation < conversationMin
                        }
                        value={decisions[key] ?? ""}
                        onChange={(e) =>
                          setDecisions({
                            ...decisions,
                            [key]: e.target.value
                              ? (Number(e.target.value) as FirstPoints)
                              : null,
                          })
                        }
                      >
                        <option value="">Wybierz poziom</option>
                        <option value="3">3 pkt · poniżej oczekiwań</option>
                        <option value="5">5 pkt · na poziomie oczekiwań</option>
                        <option value="7">7 pkt · powyżej oczekiwań</option>
                      </select>
                    </label>
                  </div>
                ))}
                {result.status === "scored" && (
                  <label className="field">
                    Uzasadnienie{" "}
                    {result.positive ? "(opcjonalnie)" : "(wymagane)"}
                    <textarea
                      required={!result.positive}
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                    />
                  </label>
                )}
                {result.status === "scored" && result.positive && (
                  <label className="field">
                    Wnioski rozwojowe (opcjonalnie)
                    <textarea
                      value={development}
                      onChange={(e) => setDevelopment(e.target.value)}
                    />
                  </label>
                )}
              </section>
              <div className="actions">
                <button type="button" onClick={() => go(2)}>
                  Wróć do obserwacji
                </button>
                <button
                  className="primary"
                  disabled={
                    !conversation ||
                    result.status !== "scored" ||
                    (!result.positive && !justification.trim())
                  }
                >
                  Pokaż wynik
                </button>
              </div>
            </form>
          )}
          {step === 4 && result.status === "scored" && (
            <>
              <section>
                <h2>Ocena {result.positive ? "pozytywna" : "negatywna"}</h2>
                <p>
                  Średnia {result.average.toLocaleString("pl-PL")} pkt · Do
                  podpisu przełożonego i kierującego komórką
                </p>
                {result.reasons.map((reason) => (
                  <p key={reason}>{reasons[reason]}</p>
                ))}
                {firstCriteria.map((key) => (
                  <div className="decision" key={key}>
                    {criteria[key]}
                    <strong>{decisions[key]} pkt</strong>
                  </div>
                ))}
                {justification.trim() && (
                  <p className="whitespace-pre-wrap wrap-anywhere">
                    {justification}
                  </p>
                )}
                {result.positive && development.trim() && (
                  <p className="whitespace-pre-wrap wrap-anywhere">
                    {development}
                  </p>
                )}
              </section>
              <AssessmentDownload
                form="first"
                payload={{
                  employmentStart: start,
                  opening,
                  reportFrom,
                  reportDue,
                  ...windowDates,
                  conversation,
                  exam,
                  report,
                  decisions,
                  justification,
                  development,
                }}
              />
              <div className="actions">
                <button onClick={() => go(3)}>Wróć do decyzji</button>
              </div>
            </>
          )}
          {authenticated && (
            <CaseControls
              kind="first"
              revision={revision}
              setRevision={setRevision}
              unread={unread}
              draft={draft}
            />
          )}
          <AssistantPanel
            scope="first"
            evidence={firstCriteria
              .flatMap((c) => model.competencies[c])
              .filter((item) => examples[item.id]?.trim())
              .map((item) => ({
                label: item.label.slice(0, 300),
                text: examples[item.id].trim().slice(0, 1000),
              }))}
          />
        </main>
      </div>
    </>
  );
}
