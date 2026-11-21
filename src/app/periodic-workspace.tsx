"use client";

import { FollowUpDeadlines } from "./periodic-deadlines";
import { CaseControls } from "./case-controls";
import type { ReminderKind } from "../lib/cases/next-action";
import { AppHeader } from "./app-header";

import { AssistantPanel } from "./assistant-panel";

import { trainingAssessment } from "../lib/drafts/demo";
import { CriterionSuggestion } from "./criterion-suggestion";
import { ObservationInbox } from "./observation-inbox";
import { ObservationEvidence } from "./observation-evidence";
import { assessmentCopy } from "../lib/observations/assessment-copy";
import { PositionPlanner } from "./position-planner";
import { maxPlannedIndicators } from "../lib/observations/position";
import { ObservationJournal } from "./observation-journal";
import { ConversationAgenda } from "./conversation-agenda";
import { buildConversationAgenda } from "../lib/observations/agenda";
import { gapQuestions, observationDate, type SavedNote } from "../lib/observations/notes";

import {
  emptyMeeting,
  MeetingSummary,
  OpeningMeetingForm,
} from "./opening-meeting";
import { AssessmentDownload } from "./assessment-download";
import { useEffect, useRef, useState } from "react";
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

export function PeriodicWorkspace({
  model,
  workspace,
  remoteDraft,
  remoteRevision,
  reminder,
  sample,
}: {
  model: CompetencyModel;
  workspace?: string;
  remoteDraft?: unknown;
  remoteRevision: number;
  reminder: ReminderKind | null;
  sample?: boolean;
}) {
  const [initial, setInitial] = useState<PeriodicDraft | null | undefined>(
    undefined,
  );
  const [notice, setNotice] = useState("");
  const [generation, setGeneration] = useState(0);
  const [revision, setRevision] = useState(remoteRevision);
  const storageKey = workspace
    ? draftStorageKey + ":" + workspace
    : draftStorageKey;

  useEffect(() => {
    let restored: PeriodicDraft | null = null;
    if (remoteDraft) {
      try {
        restored = readPeriodicDraft(JSON.stringify(remoteDraft), model);
        setNotice("Wznowiono sprawę z serwera.");
      } catch {
        setNotice(
          "Zapis serwerowy pochodzi z innej wersji modelu lub zawiera niepoprawne dane.",
        );
      }
    }
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const envelope = workspace ? JSON.parse(raw) : null;
        if (!workspace || envelope.revision === remoteRevision) {
          restored = readPeriodicDraft(
            workspace ? JSON.stringify(envelope.draft) : raw,
            model,
          );
          setNotice("Wznowiono szkic.");
        }
      }
    } catch {
      setNotice("Nie udało się odczytać szkicu z tej karty.");
    }
    if (sample) {
      restored = trainingAssessment(model);
      setNotice("Otwarto przykładową sprawę szkoleniową.");
      window.history.replaceState(null, "", "/okresowa");
    }
    setInitial(restored);
  }, [model, remoteDraft, remoteRevision, storageKey, workspace, sample]);

  if (initial === undefined)
    return <main aria-busy="true">Otwieranie arkusza…</main>;
  return (
    <AssessmentEditor
      key={generation}
      model={model}
      initial={initial}
      notice={notice}
      workspace={workspace}
      reminder={reminder}
      storageKey={storageKey}
      revision={revision}
      setRevision={setRevision}
      onSample={() => {
        setInitial(trainingAssessment(model));
        setNotice("Otwarto sprawę szkoleniową.");
        setGeneration((value) => value + 1);
        window.scrollTo(0, 0);
      }}
      onRestart={() => {
        if (!window.confirm("Rozpocząć nową ocenę i usunąć szkic z tej karty?"))
          return;
        try {
          sessionStorage.removeItem(storageKey);
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
  workspace,
  reminder,
  storageKey,
  revision,
  setRevision,
  onRestart,
  onSample,
}: {
  model: CompetencyModel;
  initial: PeriodicDraft | null;
  notice: string;
  workspace?: string;
  reminder: ReminderKind | null;
  storageKey: string;
  revision: number;
  setRevision: (value: number) => void;
  onRestart: () => void;
  onSample: () => void;
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
  const [positionDescription, setPositionDescription] = useState(initial?.positionDescription ?? "");
  const [plannedIndicators, setPlannedIndicators] = useState(initial?.plannedIndicators ?? []);
  const [notes, setNotes] = useState<SavedNote[]>(initial?.notes ?? []);
  const indicatorHeading = useRef<HTMLHeadingElement>(null);
  const [decisions, setDecisions] = useState<Decisions>(
    initial?.decisions ?? {},
  );
  const [interview, setInterview] = useState(initial?.interview ?? false);
  const [conversationDate, setConversationDate] = useState(initial?.conversationDate ?? "");
  const [periodFrom, setPeriodFrom] = useState(initial?.periodFrom ?? "");
  const [periodTo, setPeriodTo] = useState(initial?.periodTo ?? "");
  const [justification, setJustification] = useState(
    initial?.justification ?? "",
  );
  const [developmentNotes, setDevelopmentNotes] = useState(
    initial?.developmentNotes ?? "",
  );
  const [civilServant, setCivilServant] = useState(
    initial?.civilServant ?? false,
  );
  const [gradeRequest, setGradeRequest] = useState(initial?.gradeRequest ?? "");
  const [acknowledged, setAcknowledged] = useState(initial?.acknowledged ?? "");
  const [meeting, setMeeting] = useState(initial?.meeting ?? emptyMeeting);
  const [saved, setSaved] = useState(false);
  const [showExtra, setShowExtra] = useState(extra.length > 0);
  const draft: PeriodicDraft = {
    version: model.version,
    sample: initial?.sample,
    form,
    extra,
    step,
    active,
    index,
    ratings,
    examples,
    notes,
    positionDescription: positionDescription || undefined,
    plannedIndicators,
    decisions,
    interview,
    conversationDate,
    periodFrom,
    periodTo,
    justification,
    developmentNotes,
    civilServant,
    gradeRequest,
    acknowledged,
    meeting,
  };
  const serializedDraft = JSON.stringify(
    workspace ? { revision, draft } : draft,
  );
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, serializedDraft);
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [storageKey, serializedDraft]);
  const mandatory = periodicCriteria(form);
  const selected = periodicCriteria(form, extra);
  const key = selected[active];
  const indicators = model.competencies[key];
  const indicator = indicators[index];
  const agenda = buildConversationAgenda(model, selected, notes, examples, ratings);
  const currentNotes = notes.filter(({ indicatorId }) => indicatorId === indicator.id);
  const noteIndicatorIds = [...new Set(notes.flatMap(({ indicatorId }) => indicatorId ? [indicatorId] : []))];
  const nextNoteIndicator = noteIndicatorIds.find((id) =>
    id !== indicator.id && (!ratings[id] || ratings[id] === "pending"),
  );
  const suggestedCopy = assessmentCopy(agenda, decisions, meeting.goals);
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

  function chooseForm(next: PeriodicForm) {
    if (form === next) return;
    setForm(next);
    setMeeting(emptyMeeting);
    setExtra([]);
    setActive(0);
    setIndex(0);
    setPlannedIndicators([]);
  }

  function toggleCriterion(criterion: Criterion) {
    if (extra.includes(criterion)) {
      setExtra(extra.filter((item) => item !== criterion));
      setActive(0);
      setIndex(0);
      const removed = new Set(model.competencies[criterion].map(({ id }) => id));
      setPlannedIndicators((previous) => previous.filter((id) => !removed.has(id)));
    } else if (extra.length < 3) {
      setExtra([...extra, criterion]);
    }
  }

  function openIndicator(id: string) {
    const criterionIndex = selected.findIndex((criterion) =>
      model.competencies[criterion].some((item) => item.id === id),
    );
    if (criterionIndex < 0) return;
    setActive(criterionIndex);
    setIndex(model.competencies[selected[criterionIndex]].findIndex((item) => item.id === id));
    setStep(2);
    requestAnimationFrame(() => {
      indicatorHeading.current?.focus({ preventScroll: true });
      indicatorHeading.current?.scrollIntoView({ block: "start" });
    });
  }

  return (
    <>
      <AppHeader authenticated={!!workspace} section="Ocena okresowa" />
      <p className="desktop-only">
        Otwórz Azymut na komputerze, aby przejść przez ocenę.
      </p>
      <div className="shell">
        <aside>
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
              <small>{positionDescription ? "Opis stanowiska w sprawie" : roles[form].title}</small>
            </div>
          </div>
          <div className="draft-status">
            <small role="status">
              {saved
                ? "Szkic zapisany w tej karcie."
                : "Zapis szkicu niedostępny."}
            </small>
            {notice && <small>{notice}</small>}
            <button className="link" onClick={onRestart}>
              Rozpocznij nową ocenę
            </button>
            <button className="link" onClick={onSample}>
              Otwórz przykładową sprawę
            </button>
          </div>
          {workspace && (
            <CaseControls
              kind="periodic"
              revision={revision}
              setRevision={setRevision}
              reminder={reminder}
              draft={draft}
            />
          )}
        </aside>
        <main>
          <div className="context">
            Ocena okresowa <span>/</span> Krok {step + 1} z {steps.length}
          </div>
          <h1>{steps[step]}</h1>
          {draft.sample && (
            <p className="confirm">
              Sprawa szkoleniowa. Cztery decyzje wpisał fikcyjny przełożony.
              Uzupełnij obserwację, przejdź przez rozmowę i wybierz ocenę
              zarządzania ludźmi.
            </p>
          )}
          {step === 0 && (
            <>
              <p className="lead">
                Ustal arkusz i kryteria do rozmowy rozpoczynającej.
              </p>
              <PositionPlanner
                model={model}
                form={form}
                description={positionDescription}
                extra={extra}
                planned={plannedIndicators}
                onDescription={setPositionDescription}
                onForm={(next, text) => {
                  chooseForm(next);
                  setPositionDescription(text);
                }}
                onCriterion={toggleCriterion}
                onIndicator={(id) => setPlannedIndicators((previous) =>
                  previous.includes(id)
                    ? previous.filter((item) => item !== id)
                    : previous.length < maxPlannedIndicators ? [...previous, id] : previous,
                )}
              />
              <div className="role-grid">
                {(["B", "C"] as const).map((f) => (
                  <button
                    type="button"
                    key={f}
                    aria-pressed={f === form}
                    className="role"
                    onClick={() => chooseForm(f)}
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
              <details
                className="disclosure"
                open={showExtra}
                onToggle={(e) => setShowExtra(e.currentTarget.open)}
              >
                <summary>
                  Kryteria dodatkowe{" "}
                  <small>
                    {extra.length > 0
                      ? extra.length + "/3 wybrane"
                      : "opcjonalnie, maks. 3"}
                  </small>
                </summary>
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
                          onChange={() => toggleCriterion(c)}
                        />
                        {criteria[c]}
                      </label>
                    ))}
                </div>
              </details>
              <div className="actions">
                <button className="primary" onClick={() => go(1)}>
                  Przejdź do rozmowy rozpoczynającej <ArrowRight />
                </button>
              </div>
            </>
          )}
          {step === 1 && (
            <OpeningMeetingForm
              duties={positionDescription || roles[form].duties}
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
              {plannedIndicators.length > 0 && (
                <section>
                  <h2>Plan obserwacji ze stanowiska</h2>
                  <ul className="planned-indicators">
                    {selected.flatMap((criterion) => model.competencies[criterion])
                      .filter(({ id }) => plannedIndicators.includes(id))
                      .map(({ id, label }) => (
                        <li key={id}><button className="link agenda-indicator-link" onClick={() => openIndicator(id)}>{label}</button></li>
                      ))}
                  </ul>
                </section>
              )}
            </>
          )}
          {step >= 2 && (
            <ObservationInbox
              model={model}
              form={form}
              extra={extra}
              sample={initial?.sample === "training"}
              hidden={step !== 2}
              savedCount={notes.length}
              onSave={(batch, finished) => {
                setNotes((previous) => [...previous, ...batch]);
                if (!finished) return;
                const pending = [...batch, ...notes].find(({ indicatorId }) =>
                  indicatorId && (!ratings[indicatorId] || ratings[indicatorId] === "pending"),
                );
                if (pending?.indicatorId) openIndicator(pending.indicatorId);
                else go(3);
              }}
            />
          )}
          {step === 2 && (
            <>
              {notes.length > 0 && (
                <ObservationJournal
                  notes={notes}
                  labels={new Map(selected.flatMap((criterion) =>
                    model.competencies[criterion].map(({ id, label }) => [id, label] as const),
                  ))}
                  onDate={(id, value) => {
                    const date = observationDate.safeParse(value);
                    if (date.success) setNotes((previous) => previous.map((note) =>
                      note.id === id ? { ...note, date: date.data || undefined } : note,
                    ));
                  }}
                  onDelete={(id) => setNotes((previous) => previous.filter((note) => note.id !== id))}
                  onOpen={openIndicator}
                />
              )}
              <section>
                <h2 ref={indicatorHeading} tabIndex={-1}>Wybierz zaobserwowane zachowanie</h2>
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
                {currentNotes.length > 0 && (
                  <div className="indicator-evidence">
                    <h3>Zapisane przykłady dla tego wskaźnika</h3>
                    {currentNotes.map((note) => (
                      <div key={note.id}>
                        {note.date && <small><time dateTime={note.date}>{note.date.split("-").reverse().join(".")}</time></small>}
                        <ObservationEvidence quote={note.quote} text={note.text} />
                        {note.gap && <p>{gapQuestions[note.gap]}</p>}
                      </div>
                    ))}
                    <p>Na podstawie tych przykładów wybierz najtrafniejszy opis poniżej.</p>
                  </div>
                )}
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
                  {currentNotes.length > 0 ? "Uzupełnienie do zapisanych przykładów (opcjonalnie)" : "Przykład z pracy (opcjonalnie)"}
                  <textarea
                    value={examples[indicator.id] ?? ""}
                    placeholder={currentNotes.length > 0 ? "Dodaj szczegół tylko wtedy, gdy jest potrzebny" : "Sytuacja, działanie i rezultat"}
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
                {nextNoteIndicator && (
                  <button className="primary" onClick={() => openIndicator(nextNoteIndicator)}>
                    Następny wskaźnik z notatką <ArrowRight />
                  </button>
                )}
                <button className={nextNoteIndicator ? undefined : "primary"} onClick={() => go(3)}>
                  Przygotuj rozmowę <ArrowRight />
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
              <ConversationAgenda
                agenda={agenda}
                expectations={meeting.expectations}
                goals={meeting.goals}
                onOpen={openIndicator}
              />
              <section>
                <h2>Rozmowa i decyzje</h2>
                <label className="confirm">
                  <input
                    type="checkbox"
                    checked={interview}
                    onChange={(e) => {
                      setInterview(e.target.checked);
                      if (!e.target.checked) {
                        setDecisions({});
                        setConversationDate("");
                      }
                    }}
                  />
                  Rozmowa oceniająca odbyła się.
                </label>
                {interview && (
                  <label className="field observation-date">
                    Data rozmowy oceniającej
                    <input type="date" min={meeting.date} value={conversationDate} onChange={(event) =>
                      setConversationDate(event.target.validity.valid ? event.target.value : "")
                    } />
                  </label>
                )}
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
                {!developmentNotes.trim() && suggestedCopy.development && (
                  <div className="assessment-copy">
                    <p>{suggestedCopy.development}</p>
                    <button type="button" onClick={() => setDevelopmentNotes(suggestedCopy.development)}>
                      Wstaw propozycję do wniosków
                    </button>
                  </div>
                )}
                {result.status === "scored" && (
                  <label className="field">
                    {result.positive
                      ? "Uzasadnienie oceny pozytywnej (opcjonalnie)"
                      : "Uzasadnienie oceny negatywnej (wymagane)"}
                    <textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                    />
                  </label>
                )}
                {result.status === "scored" && !justification.trim() && suggestedCopy.justification && (
                  <details className="assessment-copy">
                    <summary>Propozycja uzasadnienia z decyzji i przykładów</summary>
                    <p>{suggestedCopy.justification}</p>
                    <button type="button" onClick={() => setJustification(suggestedCopy.justification)}>
                      Wstaw propozycję do uzasadnienia
                    </button>
                  </details>
                )}
                {result.status === "scored" && result.positive && (
                  <details>
                    <summary>Wniosek o kolejny stopień służbowy</summary>
                    <label className="confirm">
                      <input
                        type="checkbox"
                        checked={civilServant}
                        onChange={(e) => setCivilServant(e.target.checked)}
                      />
                      Oceniany jest urzędnikiem służby cywilnej.
                    </label>
                    {civilServant && (
                      <label className="field">
                        Uzasadnienie wniosku (opcjonalnie)
                        <textarea
                          maxLength={4000}
                          value={gradeRequest}
                          onChange={(e) => setGradeRequest(e.target.value)}
                        />
                      </label>
                    )}
                    <p>
                      Jeżeli dołączasz wniosek, opisz jego podstawę. Uzupełniony
                      wniosek trafi do części III arkusza.
                    </p>
                  </details>
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
                {justification.trim() && (
                  <p>
                    <strong>Uzasadnienie</strong>
                    <br />
                    {justification}
                  </p>
                )}
              </section>
              <FollowUpDeadlines
                positive={result.positive}
                acknowledged={acknowledged}
                onChange={setAcknowledged}
              />
              <AssessmentDownload
                form={form}
                payload={{
                  extra,
                  opening: meeting.date,
                  assessmentDue: meeting.assessmentDue,
                  decisions,
                  justification,
                  development: developmentNotes,
                  civilServant: result.positive && civilServant,
                  gradeRequest:
                    result.positive && civilServant ? gradeRequest : "",
                }}
              >
                <label className="field">
                  Początek ocenianego okresu
                  <input required name="periodFrom" type="date"
                    value={periodFrom || meeting.anchor || ""}
                    max={periodTo || conversationDate || undefined}
                    onChange={(event) => setPeriodFrom(event.target.value)} />
                  {!periodFrom && meeting.anchor && <small>Wstawiono datę zdarzenia rozpoczynającego. Sprawdź początek okresu.</small>}
                </label>
                <label className="field">
                  Koniec ocenianego okresu
                  <input required name="periodTo" type="date"
                    value={periodTo || conversationDate}
                    min={periodFrom || meeting.anchor || undefined}
                    max={conversationDate || undefined}
                    onChange={(event) => setPeriodTo(event.target.value)} />
                  {!periodTo && conversationDate && <small>Wstawiono datę rozmowy. Zmień ją, jeśli okres zakończył się wcześniej.</small>}
                </label>
                <label className="field">
                  Data rozmowy oceniającej
                  <input
                    required
                    name="conversation"
                    type="date"
                    min={meeting.date}
                    value={conversationDate}
                    onChange={(event) => setConversationDate(event.target.value)}
                  />
                </label>
              </AssessmentDownload>
              <div className="actions">
                <button onClick={() => go(3)}>
                  <ArrowLeft /> Wróć do decyzji
                </button>
              </div>
            </>
          )}
          <AssistantPanel
            scope="periodic"
            evidence={agenda.criteria.flatMap(({ indicators }) =>
              indicators.flatMap(({ label, evidence }) => evidence.map(({ text }) => ({
                label: label.slice(0, 300),
                text: text.slice(0, 1000),
              }))),
            ).slice(0, 8)}
          />
        </main>
      </div>
    </>
  );
}
