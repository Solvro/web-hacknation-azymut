import assert from "node:assert/strict";
import { test } from "node:test";
import { buildConversationAgenda } from "./agenda.ts";

const model = {
  competencies: {
    leadership: [
      { id: "delegation", label: "Delegowanie" },
      { id: "feedback", label: "Informacja zwrotna" },
      { id: "conflict", label: "Rozwiązywanie konfliktów" },
    ],
  },
};
const notes = [
  { id: "1", indicatorId: "delegation", text: "Rozdzieliła zadania.", date: "2026-10-24", gap: null },
  { id: "2", indicatorId: "delegation", text: "Uzgodniła odpowiedzialność.", date: "2026-10-12", gap: null },
  { id: "3", indicatorId: null, text: "Rzadko reaguje.", date: "2026-09-04", gap: "situation" },
];
const agenda = (notes, examples = {}, ratings = {}) =>
  buildConversationAgenda(model, ["leadership"], notes, examples, ratings);

test("agreguje różne źródła przy wskaźniku i pokazuje miesiące tylko potwierdzonych przykładów", () => {
  const result = agenda(notes, { delegation: "Rozdzieliła zadania." }, { conflict: "outside_scope" });
  const [leadership] = result.criteria;
  assert.equal(leadership.covered, 1);
  assert.equal(leadership.indicators.length, 2);
  assert.deepEqual(leadership.indicators[0].evidence.map(({ id }) => id), ["2", "1"]);
  assert.deepEqual(result.months, [["2026-10", 2]]);
  assert.equal(result.datesClustered, true);
  assert.deepEqual(result.questions, [notes[2]]);
});

test("po zmianie notatki agenda pokazuje nowe pokrycie bez wnioskowania z ocen", () => {
  const result = agenda([...notes.slice(0, 2), { ...notes[2], indicatorId: "feedback" }], {}, { conflict: 9 });
  assert.equal(result.criteria[0].covered, 2);
  assert.equal(result.criteria[0].indicators[2].evidence.length, 0);
  assert.deepEqual(result.months, [["2026-09", 1], ["2026-10", 2]]);
  assert.equal(result.datesClustered, false);
});
