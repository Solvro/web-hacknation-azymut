import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addDays,
  addMonths,
  firstAssessmentWindow,
  periodicOpeningDeadline,
  periodicCycleDeadline,
  periodicFollowUp,
  extendPeriodicDeadline,
} from "./calendar.ts";

test("przesuwa daty kalendarzowe na końcu miesiąca i w roku przestępnym", () => {
  assert.equal(addMonths("2024-01-31", 1), "2024-02-29");
  assert.equal(addMonths("2025-03-31", -1), "2025-02-28");
  assert.equal(addDays("2026-12-26", 7), "2027-01-02");
});

test("dla zastępstwa termin rozmowy biegnie od ustalenia stron", () => {
  assert.deepEqual(
    firstAssessmentWindow("2026-01-31", "2027-01-31", "2026-02-15"),
    {
      interviewDeadline: "2026-03-08",
      earliestAssessment: "2026-10-01",
      latestAssessment: "2026-12-31",
    },
  );
});

test("termin rozpoczęcia po negatywnej ocenie i terminy od zapoznania mają różne podstawy", () => {
  assert.equal(
    periodicOpeningDeadline("indefinite_contract", "2026-10-30"),
    "2026-11-29",
  );
  assert.equal(
    periodicOpeningDeadline("previous_assessment", "2026-10-30"),
    "2026-11-29",
  );
  assert.equal(
    periodicOpeningDeadline("negative_assessment", "2026-10-30"),
    "2026-11-06",
  );
  assert.equal(periodicCycleDeadline("2024-02-29"), "2026-02-28");
  assert.deepEqual(periodicFollowUp("2026-11-02", false), {
    objectionDue: "2026-11-09",
    nextAssessment: "2027-05-02",
  });
  assert.equal(periodicFollowUp("2026-11-02", true).nextAssessment, null);
});

test("tylko ciągła nieobecność dłuższa niż miesiąc przedłuża termin o cały okres", () => {
  assert.equal(
    extendPeriodicDeadline("2026-08-01", "2026-01-01", "2026-01-31"),
    "2026-08-01",
  );
  assert.equal(
    extendPeriodicDeadline("2026-08-01", "2026-01-01", "2026-02-01"),
    "2026-09-02",
  );
});
