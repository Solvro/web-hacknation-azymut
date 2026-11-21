import type { CompetencyModel } from "../lib/drafts/periodic";
import {
  suggestPeriodicPoints,
  type Criterion,
  type Observation,
} from "../lib/scoring/periodic";

const statusLabels = {
  outside_scope: "Poza zakresem stanowiska",
  pending: "Jeszcze niewypełniony",
  unobserved: "Brak podstaw do oceny",
};

export function CriterionSuggestion({
  indicators,
  ratings,
}: {
  indicators: CompetencyModel["competencies"][Criterion];
  ratings: Readonly<Record<string, Observation>>;
}) {
  const observations = indicators.map((item) => ratings[item.id] ?? "pending");
  const { average, observed, selected, suggestion } =
    suggestPeriodicPoints(observations);
  const scores = observations.filter((value) => typeof value === "number");
  return (
    <div className="criterion-suggestion">
      <p>
        Sugestia dla kryterium:{" "}
        <strong>
          {suggestion === null ? "Za mało obserwacji" : suggestion + " pkt"}
        </strong>
      </p>
      <details>
        <summary>Jak powstała sugestia?</summary>
        <p>
          Zaobserwowane wskaźniki: {observed} z {selected} dobranych do
          stanowiska.
        </p>
        {selected === 0 ? (
          <p>Wszystkie wskaźniki oznaczono jako poza zakresem stanowiska.</p>
        ) : average === null ? (
          <p>
            Azymut pokazuje sugestię po zaobserwowaniu co najmniej połowy
            dobranych wskaźników.
          </p>
        ) : (
          <>
            <p>
              Średnia: ({scores.join(" + ")}) / {observed}{" "}
              {Number.isInteger(average * 100) ? "=" : "≈"}{" "}
              {average.toLocaleString("pl-PL", { maximumFractionDigits: 2 })}{" "}
              pkt.
            </p>
            <p>
              {Number.isInteger(average) && average % 2 === 0
                ? "Średnia wypada w połowie między poziomami. Azymut wskazuje poziom bliższy standardowi 5 pkt."
                : "Azymut wskazuje dozwoloną liczbę punktów najbliższą średniej."}
            </p>
          </>
        )}
        <dl>
          {indicators.map((item, index) => {
            const value = observations[index];
            return (
              <div key={item.id}>
                <dt>{item.label}</dt>
                <dd>
                  {typeof value === "number"
                    ? value + " pkt · " + item.levels[(value - 1) / 2]
                    : statusLabels[value]}
                </dd>
              </div>
            );
          })}
        </dl>
        <p>
          To reguła pomocnicza Azymutu. Ocenę do arkusza wybiera przełożony.
        </p>
      </details>
    </div>
  );
}
