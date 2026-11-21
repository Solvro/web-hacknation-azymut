import assert from "node:assert/strict";
import { test } from "node:test";
import { readPeriodicDraft } from "./periodic.ts";
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
