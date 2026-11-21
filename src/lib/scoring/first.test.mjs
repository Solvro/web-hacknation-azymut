import assert from "node:assert/strict";
import { test } from "node:test";
import { firstResult, suggestFirstPoints } from "./first.ts";

const standard = {
  decisions: { reliability: 5, knowledge: 5, organization: 5, communication: 5, cooperation: 5 },
  exam: "passed",
  report: "on_time",
};

test("mapuje pięć poziomów zachowań na trzy dopiero po wyliczeniu sugestii", () => {
  for (const [model, first] of [[1, 3], [3, 3], [5, 5], [7, 7], [9, 7]]) {
    assert.equal(suggestFirstPoints([model]).suggestion, first);
  }
  assert.deepEqual(suggestFirstPoints([1, 7]), {
    selected: 2, observed: 2, average: 4, modelPoints: 5, suggestion: 5,
  });
  assert.equal(suggestFirstPoints([7, "unobserved", "pending"]).suggestion, null);
});

test("jedna trójka i średnia dokładnie 5 spełniają warunki punktowe", () => {
  const decisions = { ...standard.decisions, cooperation: 3, knowledge: 7 };
  assert.deepEqual(firstResult({ ...standard, decisions }), {
    status: "scored", average: 5, positive: true, reasons: [], justificationRequired: false,
  });
});

test("dwie trójki mimo średniej 5,4 wymagają oceny negatywnej i uzasadnienia", () => {
  const decisions = { reliability: 3, knowledge: 3, organization: 7, communication: 7, cooperation: 7 };
  assert.deepEqual(firstResult({ ...standard, decisions }), {
    status: "scored", average: 5.4, positive: false, reasons: ["multiple_threes"], justificationRequired: true,
  });
});

test("wykazuje niezależne powody negatywnej oceny", () => {
  const decisions = { ...standard.decisions, cooperation: 3 };
  for (const report of ["late", "not_submitted_by_deadline"]) {
    const result = firstResult({ decisions, exam: "not_passed", report });
    assert.deepEqual(result.reasons, ["exam_not_passed", "report_not_on_time", "low_average"]);
    assert.equal(result.average, 4.6);
  }
});

test("każda z trzech podstaw wyłącza tylko warunek egzaminu", () => {
  for (const exam of [
    "ksap_graduate_without_nomination_application",
    "replacement_subject_to_first_evaluation",
    "higher_civil_service_position",
  ]) {
    assert.equal(firstResult({ ...standard, exam }).positive, true);
    assert.deepEqual(firstResult({ ...standard, exam, report: "late" }).reasons, ["report_not_on_time"]);
  }
});

test("puste pola pozostawiają szkic, jawnie niedozwolone wartości są odrzucane", () => {
  const decisions = { ...standard.decisions, knowledge: null };
  assert.deepEqual(firstResult({ decisions }), { status: "draft", missing: ["knowledge", "exam", "report"] });
  assert.throws(() => firstResult({ ...standard, decisions: { ...decisions, knowledge: 9 } }), RangeError);
  assert.throws(() => firstResult({ ...standard, exam: "training_waived" }), RangeError);
  assert.throws(() => firstResult({ ...standard, report: "unknown" }), RangeError);
});
