import { OpeningDeadlines } from "./periodic-deadlines";
import type { OpeningTrigger } from "../lib/scoring/calendar";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface OpeningMeeting {
  date: string;
  assessmentDue: string;
  expectations: string;
  goals: string;
  trigger?: OpeningTrigger;
  anchor?: string;
  absenceFrom?: string;
  absenceTo?: string;
}

export const emptyMeeting: OpeningMeeting = {
  date: "",
  assessmentDue: "",
  expectations: "",
  goals: "",
};

export function MeetingSummary({ meeting }: { meeting: OpeningMeeting }) {
  function dateLabel(iso: string) {
    return iso.split("-").reverse().join(".");
  }
  return (
    <dl className="meeting-summary">
      <dt>Data rozmowy rozpoczynającej</dt>
      <dd>{dateLabel(meeting.date)}</dd>
      <dt>Termin sporządzenia oceny na piśmie</dt>
      <dd>{dateLabel(meeting.assessmentDue)}</dd>
      {meeting.expectations && (
        <>
          <dt>Oczekiwania</dt>
          <dd>{meeting.expectations}</dd>
        </>
      )}
      {meeting.goals && (
        <>
          <dt>Cele i sposób realizacji</dt>
          <dd>{meeting.goals}</dd>
        </>
      )}
    </dl>
  );
}

export function OpeningMeetingForm({
  duties,
  criteria,
  meeting,
  onChange,
  onBack,
  onComplete,
}: {
  duties: string;
  criteria: string[];
  meeting: OpeningMeeting;
  onChange: (meeting: OpeningMeeting) => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onComplete();
      }}
    >
      <p className="lead">
        Omów z pracownikiem obowiązki, kryteria i oczekiwania. Jeżeli charakter
        zadań to uzasadnia, ustalcie również cele i sposób ich realizacji.
      </p>
      <section>
        <h2>Zakres rozmowy</h2>
        <p>{duties}</p>
        <ul className="pills">
          {criteria.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
        <label className="field">
          Oczekiwania wobec pracownika
          <textarea
            value={meeting.expectations}
            onChange={(e) =>
              onChange({ ...meeting, expectations: e.target.value })
            }
          />
        </label>
        <label className="field">
          Cele i sposób realizacji (opcjonalnie)
          <textarea
            value={meeting.goals}
            onChange={(e) => onChange({ ...meeting, goals: e.target.value })}
          />
        </label>
      </section>
      <section>
        <h2>Terminy do arkusza</h2>
        <OpeningDeadlines
          trigger={meeting.trigger ?? "indefinite_contract"}
          anchor={meeting.anchor ?? ""}
          opening={meeting.date}
          absenceFrom={meeting.absenceFrom ?? ""}
          absenceTo={meeting.absenceTo ?? ""}
          onChange={(trigger, anchor) =>
            onChange({ ...meeting, trigger, anchor })
          }
          onAbsence={(absenceFrom, absenceTo) =>
            onChange({ ...meeting, absenceFrom, absenceTo })
          }
          onUseDue={(assessmentDue) => onChange({ ...meeting, assessmentDue })}
        />
        <label className="field">
          Data rozmowy rozpoczynającej
          <input
            required
            type="date"
            value={meeting.date}
            onChange={(e) => onChange({ ...meeting, date: e.target.value })}
          />
        </label>
        <label className="field">
          Termin sporządzenia oceny na piśmie
          <input
            required
            type="date"
            min={meeting.date}
            value={meeting.assessmentDue}
            onChange={(e) =>
              onChange({ ...meeting, assessmentDue: e.target.value })
            }
          />
        </label>
      </section>
      <div className="actions">
        <button type="button" onClick={onBack}>
          <ArrowLeft /> Wróć do kryteriów
        </button>
        <button type="submit" className="primary">
          Potwierdź przeprowadzenie rozmowy <ArrowRight />
        </button>
      </div>
    </form>
  );
}
