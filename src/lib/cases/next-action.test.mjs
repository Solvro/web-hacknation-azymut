import assert from "node:assert/strict";
import { test } from "node:test";
import { caseTask, firstCaseState, periodicCaseState } from "./next-action.ts";

test("w okresowej rozróżnia termin rozmowy i pisemnej oceny", () => {
  const draft = { step: 1, meeting: {
    anchor: "2026-11-21", trigger: "negative_assessment", assessmentDue: "2027-05-23",
  } };
  assert.equal(periodicCaseState(draft).actionDue, "2026-11-28");
  assert.equal(periodicCaseState({ ...draft, step: 2 }).actionDue, "2027-05-23");
  assert.equal(periodicCaseState({ ...draft, step: 4 }).actionDue, null);
  assert.equal(periodicCaseState({ ...draft, step: 4, acknowledged: "2027-05-25" }).status, "Zapoznano z oceną");
});

test("w pierwszej uwzględnia zastępstwo i kolejny termin sprawozdania", () => {
  const draft = {
    step: 0, replacement: true, start: "2026-01-15", end: "2027-01-15",
    agreement: "2026-01-19", reportDue: "2026-11-18",
  };
  assert.equal(firstCaseState(draft).actionDue, "2026-02-09");
  assert.equal(firstCaseState({ ...draft, agreement: "" }).actionDue, null);
  assert.equal(firstCaseState({ ...draft, step: 1 }).actionDue, "2026-11-18");
  assert.equal(firstCaseState({ ...draft, step: 1, received: draft.reportDue }).actionDue, "2026-12-15");
});

test("kolejka rozróżnia zbliżający się termin, zaległość i potwierdzenie", () => {
  const task = (status, due) => caseTask("periodic", status, due, "2026-11-21");
  assert.equal(task("Obserwacje", "2026-11-20").urgency, "overdue");
  assert.equal(task("Obserwacje", "2026-11-28").urgency, "soon");
  assert.equal(task("Obserwacje", "2026-11-29").urgency, "scheduled");
  assert.equal(task("Rozmowa wstępna", null).urgency, "undated");
  assert.equal(task("Do podpisu", "2026-11-20").urgency, "confirmation");
  assert.equal(task("Zapoznano z oceną", null), null);
});
