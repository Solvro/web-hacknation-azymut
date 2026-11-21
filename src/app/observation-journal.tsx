import { gapQuestions, type SavedNote } from "../lib/observations/notes";

export function ObservationJournal({
  notes,
  labels,
  onDate,
  onDelete,
  onOpen,
}: {
  notes: SavedNote[];
  labels: ReadonlyMap<string, string>;
  onDate: (id: string, value: string) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <section>
      <details>
        <summary>Dziennik obserwacji <small>{notes.length} zapisanych notatek</small></summary>
        <div className="observation-cards">
          {notes.map((note) => {
            const indicatorId = note.indicatorId;
            return (
              <article className="observation-card" key={note.id}>
                <strong>{indicatorId ? labels.get(indicatorId) : "Kwestia do rozmowy"}</strong>
                <p className="observation-original">{note.text}</p>
                {note.gap && <p>{gapQuestions[note.gap]}</p>}
                <label className="field observation-date">
                  Data obserwacji (opcjonalnie)
                  <input type="date" value={note.date ?? ""} onChange={(event) => onDate(note.id, event.target.value)} />
                </label>
                <div className="actions">
                  {indicatorId && <button className="link" onClick={() => onOpen(indicatorId)}>Otwórz wskaźnik</button>}
                  <button className="link" onClick={() => {
                    if (window.confirm("Usunąć tę notatkę z dziennika?")) onDelete(note.id);
                  }}>Usuń notatkę</button>
                </div>
              </article>
            );
          })}
        </div>
      </details>
    </section>
  );
}
