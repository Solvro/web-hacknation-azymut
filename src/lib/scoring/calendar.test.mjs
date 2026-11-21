import assert from "node:assert/strict";
import { test } from "node:test";
import { addDays, addMonths, firstAssessmentWindow } from "./calendar.ts";

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
