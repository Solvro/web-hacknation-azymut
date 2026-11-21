import assert from "node:assert/strict";
import { test } from "node:test";
import { explicitPositionForm, verifyPositionSuggestion } from "./position.ts";
import { periodicCriteria } from "../scoring/periodic.ts";

const ids = periodicCriteria("B", ["analysis"]);
const model = { competencies: Object.fromEntries(ids.map((id) => [id, [{ id: id + "-1" }]])) };
const text = "Bezpośrednio kieruje zespołem. Analizuje przyczyny odchyleń.";
const suggestion = {
  form: { kind: "B", quote: "Bezpośrednio kieruje zespołem" },
  criteria: [{ id: "analysis", quote: "Analizuje przyczyny odchyleń" }],
  indicators: [
    { id: "leadership-1", quote: "kieruje zespołem" },
    { id: "analysis-1", quote: "Analizuje przyczyny odchyleń" },
  ],
};

test("sprawdza źródła arkusza, kryteriów opcjonalnych i wskaźników w planie", () => {
  assert.deepEqual(verifyPositionSuggestion(text, suggestion, model), suggestion);
  assert.equal(verifyPositionSuggestion(text, { ...suggestion, form: { kind: "B", quote: "Kieruje zespołem" } }, model), null);
  const verified = verifyPositionSuggestion(text, {
    ...suggestion,
    criteria: [{ id: "leadership", quote: "kieruje zespołem" }],
    indicators: [
      suggestion.indicators[0],
      suggestion.indicators[0],
      suggestion.indicators[1],
      { id: "leadership-1", quote: "zmyślony cytat" },
    ],
  }, model);
  assert.deepEqual(verified.criteria, []);
  assert.deepEqual(verified.indicators, [suggestion.indicators[0]]);
});

test("dopuszcza niejednoznaczny opis lub propozycję arkusza A bez zakresu B/C", () => {
  assert.deepEqual(verifyPositionSuggestion(text, { ...suggestion, form: null }, model), {
    form: null, criteria: [], indicators: [],
  });
  const form = { kind: "A", quote: "kierownika urzędu" };
  assert.deepEqual(verifyPositionSuggestion("Stanowisko kierownika urzędu.", {
    ...suggestion, form,
  }, model), { form, criteria: [], indicators: [] });
});

test("wyłuskuje dokładny cytat przy jawnym zakresie, pozostawia koordynację i sprzeczne opisy do wyjaśnienia", () => {
  assert.deepEqual(explicitPositionForm("Samodzielna praca bez podległych pracowników."), {
    kind: "C", quote: "bez podległych pracowników",
  });
  assert.equal(explicitPositionForm("Koordynuje projekt i współpracuje z zespołem."), null);
  assert.equal(explicitPositionForm("Bezpośrednio kieruje zespołem. Niemniej nie kieruje pracownikami."), null);
  assert.equal(explicitPositionForm("Bezpośrednio kieruje pięcioosobowym zespołem.").kind, "B");
});
