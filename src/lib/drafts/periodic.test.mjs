import assert from "node:assert/strict";
import { test } from "node:test";
import { draftStorageKey, periodicStorageKey, readPeriodicDraft, retainPeriodicEvidence } from "./periodic.ts";
import { periodicCriteria } from "../scoring/periodic.ts";

const keys = periodicCriteria("B", ["analysis"]);
const model = {
  version: "demo-1",
  competencies: Object.fromEntries(
    keys.map((key) => [key, [{ id: key + "-1" }]]),
  ),
};
const draft = {
  version: model.version,
  form: "B",
  extra: ["analysis"],
  step: 2,
  active: 5,
  index: 0,
  ratings: { "analysis-1": 3 },
  examples: { "analysis-1": "Przykład" },
  decisions: {},
  interview: false,
  justification: "",
  developmentNotes: "",
  meeting: {
    date: "2024-11-21",
    assessmentDue: "2026-11-21",
    expectations: "Terminowość",
    goals: "",
  },
};
const restore = (changes) =>
  readPeriodicDraft(JSON.stringify({ ...draft, ...changes }), model);

test("odtwarza bieżący wskaźnik, obserwację oraz treść ustaleń", () => {
  assert.deepEqual(restore({}), draft);
});

test("sprawa szkoleniowa ma osobny zapis w karcie, a istniejące klucze pozostają ważne", () => {
  assert.equal(periodicStorageKey(), draftStorageKey);
  assert.equal(periodicStorageKey("konto"), draftStorageKey + ":konto");
  const keys = [periodicStorageKey(), periodicStorageKey("konto"),
    periodicStorageKey(undefined, true), periodicStorageKey("konto", true)];
  assert.equal(new Set(keys).size, keys.length);
});

test("zmiana kryteriów zostawia szkic możliwy do wznowienia i zachowuje treść notatki", () => {
  const note = {
    id: "6a75d8b1-91a7-4184-8819-08b4b62cf03b",
    text: "Przykład analizy z pracy",
    indicatorId: "analysis-1",
    gap: null,
  };
  const evidence = retainPeriodicEvidence(model, "B", [], {
    ...draft,
    notes: [note],
    plannedIndicators: ["analysis-1", "leadership-1"],
    decisions: { analysis: 3, leadership: 7 },
  });
  const restored = restore({ ...evidence, extra: [], active: 0 });
  assert.deepEqual(restored.ratings, {});
  assert.deepEqual(restored.examples, {});
  assert.deepEqual(restored.notes, [{ ...note, indicatorId: null, gap: "context" }]);
  assert.deepEqual(restored.plannedIndicators, ["leadership-1"]);
  assert.deepEqual(restored.decisions, { leadership: 7 });
});

test("odrzuca błędne lub niezgodne szkice przed renderowaniem", () => {
  assert.throws(() => readPeriodicDraft("{", model));
  for (const change of [
    { version: "inna" },
    { active: 6 },
    { index: 1 },
    { step: 99 },
    { extra: ["leadership"] },
    { ratings: { "analysis-1": 2 } },
    { examples: { typo: "tekst" } },
    { decisions: { knowledge: 5 } },
    { meeting: { ...draft.meeting, assessmentDue: "" } },
    { meeting: { ...draft.meeting, date: "2024-02-30" } },
  ])
    assert.throws(() => restore(change));
});

test("wznawia nieukończoną rozmowę oraz kompletne podsumowanie", () => {
  assert.equal(
    restore({
      step: 1,
      meeting: { ...draft.meeting, date: "", assessmentDue: "" },
    }).step,
    1,
  );
  const final = {
    step: 4,
    interview: true,
    developmentNotes: "Ćwiczenie udzielania informacji zwrotnej.",
    decisions: Object.fromEntries(keys.map((key) => [key, 7])),
  };
  assert.equal(restore(final).step, 4);
  assert.throws(() => restore({ ...final, interview: false }));
  assert.throws(() => restore({ ...final, decisions: {} }));
  assert.throws(() =>
    restore({ ...final, decisions: { ...final.decisions, analysis: 1 } }),
  );
});

test("starsze podsumowanie bez wniosków do IPRZ wraca do decyzji i zachowuje dane", () => {
  const decisions = Object.fromEntries(keys.map((key) => [key, 7]));
  for (const developmentNotes of [undefined, "   "]) {
    const restored = restore({
      step: 4,
      interview: true,
      decisions,
      developmentNotes,
    });
    assert.equal(restored.step, 3);
    assert.deepEqual(restored.decisions, decisions);
    assert.deepEqual(restored.examples, draft.examples);
  }
});
