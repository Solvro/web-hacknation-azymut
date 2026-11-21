import assert from "node:assert/strict";
import { test } from "node:test";
import { assessmentCopy } from "./assessment-copy.ts";

const agenda = {
  criteria: [
    { criterion: "leadership", indicators: [{ evidence: [{ text: "Zachęciła zespół do pracy.", quote: "Zachęciła zespół", gap: null }] }] },
    { criterion: "communication", indicators: [{ evidence: [{ text: "Zbyt mało informacji.", gap: "situation" }] }] },
  ],
};

test("przygotowuje wniosek i uzasadnienie z zatwierdzonych decyzji i dosłownych przykładów", () => {
  const copy = assessmentCopy(agenda, { leadership: 5, communication: 3 }, "");
  assert.match(copy.development, /Zarządzanie ludźmi.*„Zachęciła zespół”/);
  assert.match(copy.justification, /Komunikacja – 3 pkt/);
  assert.match(copy.justification, /Zarządzanie ludźmi – 5 pkt/);
  assert.doesNotMatch(copy.justification, /Zbyt mało informacji/);
  assert.deepEqual(assessmentCopy(agenda, {}, ""), { development: "", justification: "" });
});
