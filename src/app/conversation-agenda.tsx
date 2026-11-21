import { CalendarDays, ClipboardList, MessageSquareText } from "lucide-react";
import { buildConversationAgenda } from "../lib/observations/agenda";
import { gapQuestions, type SavedNote } from "../lib/observations/notes";
import { criteria } from "../lib/scoring/periodic";

const date = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeZone: "UTC" });
const month = new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric", timeZone: "UTC" });

export function ConversationAgenda({
  agenda,
  expectations,
  goals,
  onOpen,
}: {
  agenda: ReturnType<typeof buildConversationAgenda>;
  expectations: string;
  goals: string;
  onOpen: (id: string) => void;
}) {
  const hasGaps = agenda.criteria.some(({ covered, indicators }) => covered < indicators.length);
  return (
    <section className="observation-inbox conversation-agenda">
      <h2><ClipboardList size={20} /> Agenda rozmowy</h2>
      {(expectations.trim() || goals.trim()) && (
        <div className="agenda-opening">
          <h3>Wróć do ustaleń początkowych</h3>
          {expectations.trim() && <p><strong>Oczekiwania</strong> {expectations}</p>}
          {goals.trim() && <p><strong>Cele</strong> {goals}</p>}
        </div>
      )}
      {agenda.questions.length > 0 && (
        <div className="agenda-questions">
          <h3><MessageSquareText size={17} /> Kwestie do rozmowy</h3>
          <ul>
            {agenda.questions.map((note) => (
              <li key={note.id}>
                <Note text={note.text} dateValue={note.date} />
                <strong>{gapQuestions[note.gap ?? "context"]}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h3>Przykłady i pokrycie wskaźników</h3>
        {hasGaps && <p className="agenda-hint">Przy lukach warto zapytać o przykład z pracy lub ustalić, czy była okazja do obserwacji.</p>}
        {agenda.months.length > 0 && (
          <div className="agenda-months">
            <strong><CalendarDays size={16} /> Datowane przykłady</strong>
            <ul>
              {agenda.months.map(([key, count]) => <li key={key}>{month.format(new Date(key + "-01"))} · {count}</li>)}
            </ul>
            {agenda.datesClustered && <p>Datowane przykłady pochodzą z jednego miesiąca. Warto przywołać też wcześniejsze sytuacje, jeśli wystąpiły.</p>}
          </div>
        )}
        {agenda.criteria.map(({ criterion, indicators, covered }) => (
          <details className="agenda-criterion" key={criterion} open={covered > 0}>
            <summary>
              {criteria[criterion]}
              <small>{indicators.length === 0 ? "Brak wskaźników w zakresie" : `${covered}/${indicators.length} z przykładami`}</small>
            </summary>
            <ul>
              {indicators.map((indicator) => (
                <li key={indicator.id}>
                  <button className="link agenda-indicator-link" onClick={() => onOpen(indicator.id)}>{indicator.label}</button>
                  {indicator.evidence.length === 0 && <p>Brak zapisanego przykładu.</p>}
                  {indicator.evidence.length > 1 &&
                    <p>Porównaj sytuacje. Co się powtórzyło i co wynikało z warunków zadania?</p>}
                  {indicator.evidence.map((item) => (
                    <div key={item.id} className="agenda-example">
                      <Note text={item.text} dateValue={item.date} />
                      {item.gap && <p>{gapQuestions[item.gap]}</p>}
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}

function Note({ text, dateValue }: { text: string; dateValue?: SavedNote["date"] }) {
  return (
    <blockquote className="observation-original">
      {dateValue && <small><time dateTime={dateValue}>{date.format(new Date(dateValue))}</time></small>}
      {text}
    </blockquote>
  );
}
