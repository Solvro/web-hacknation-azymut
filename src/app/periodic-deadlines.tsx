import {
  extendPeriodicDeadline,
  periodicCycleDeadline,
  periodicFollowUp,
  periodicOpeningDeadline,
  type OpeningTrigger,
} from "../lib/scoring/calendar";

const triggers: Record<OpeningTrigger, string> = {
  indefinite_contract: "Zatrudnienie na czas nieokreślony",
  previous_assessment: "Sporządzenie poprzedniej oceny pozytywnej",
  negative_assessment: "Sporządzenie poprzedniej oceny negatywnej",
};

export function OpeningDeadlines({
  trigger,
  anchor,
  opening,
  absenceFrom,
  absenceTo,
  onChange,
  onAbsence,
  onUseDue,
}: {
  trigger: OpeningTrigger;
  anchor: string;
  opening: string;
  absenceFrom: string;
  absenceTo: string;
  onChange: (trigger: OpeningTrigger, anchor: string) => void;
  onAbsence: (from: string, to: string) => void;
  onUseDue: (due: string) => void;
}) {
  const deadline = anchor ? periodicOpeningDeadline(trigger, anchor) : null;
  const cycle =
    anchor && trigger !== "negative_assessment"
      ? periodicCycleDeadline(anchor)
      : null;
  const adjusted =
    cycle && absenceFrom && absenceTo && absenceFrom <= absenceTo
      ? extendPeriodicDeadline(cycle, absenceFrom, absenceTo)
      : null;
  return (
    <details>
      <summary>Oblicz terminy oceny okresowej</summary>
      <label className="field">
        Zdarzenie rozpoczynające bieg terminu
        <select
          value={trigger}
          onChange={(e) => onChange(e.target.value as OpeningTrigger, anchor)}
        >
          {Object.entries(triggers).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Data zdarzenia
        <input
          type="date"
          value={anchor}
          onChange={(e) => onChange(trigger, e.target.value)}
        />
      </label>
      {deadline && (
        <p>
          Termin czynności z §§ 5–6: <strong>{displayDate(deadline)}</strong>
          {opening > deadline &&
            " · odnotowana rozmowa odbyła się po terminie."}
        </p>
      )}
      {cycle && (
        <p>
          Standardowy termin oceny: <strong>{displayDate(cycle)}</strong>{" "}
          <button type="button" onClick={() => onUseDue(cycle)}>
            Wstaw do arkusza
          </button>
        </p>
      )}
      {cycle && (
        <fieldset>
          <legend>Usprawiedliwiona nieobecność (opcjonalnie)</legend>
          <label className="field">
            Od dnia
            <input
              type="date"
              value={absenceFrom}
              onChange={(e) => onAbsence(e.target.value, absenceTo)}
            />
          </label>
          <label className="field">
            Do dnia włącznie
            <input
              type="date"
              min={absenceFrom}
              value={absenceTo}
              onChange={(e) => onAbsence(absenceFrom, e.target.value)}
            />
          </label>
          {adjusted && (
            <p>
              {adjusted === cycle ? (
                "Okres nie przekracza miesiąca. Termin pozostaje bez zmian."
              ) : (
                <>
                  Termin po przedłużeniu:{" "}
                  <strong>{displayDate(adjusted)}</strong>{" "}
                  <button type="button" onClick={() => onUseDue(adjusted)}>
                    Wstaw przedłużony termin
                  </button>
                </>
              )}
            </p>
          )}
        </fieldset>
      )}
      {anchor && trigger === "negative_assessment" && (
        <p>
          Termin ponownej oceny biegnie od zapoznania pracownika z negatywną
          oceną. Oblicz go w podsumowaniu poprzedniej oceny lub wpisz go w
          arkuszu.
        </p>
      )}
    </details>
  );
}

export function FollowUpDeadlines({
  positive,
  acknowledged,
  onChange,
}: {
  positive: boolean;
  acknowledged: string;
  onChange: (value: string) => void;
}) {
  const dates = acknowledged ? periodicFollowUp(acknowledged, positive) : null;
  return (
    <section>
      <h2>Po zapoznaniu pracownika z oceną</h2>
      <label className="field">
        Data zapoznania z oceną
        <input
          type="date"
          value={acknowledged}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      {dates && (
        <>
          <p>
            Termin wniesienia sprzeciwu do dyrektora generalnego:{" "}
            <strong>{displayDate(dates.objectionDue)}</strong> · art. 83 ust. 1.
          </p>
          {dates.nextAssessment && (
            <p>
              Ponowna ocena po upływie sześciu miesięcy:{" "}
              <strong>{displayDate(dates.nextAssessment)}</strong> · art. 81
              ust. 9.
            </p>
          )}
        </>
      )}
    </section>
  );
}

function displayDate(value: string) {
  return value.split("-").reverse().join(".");
}
