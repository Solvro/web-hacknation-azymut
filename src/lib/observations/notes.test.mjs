import assert from "node:assert/strict";
import { test } from "node:test";
import { splitNotes, verifyNoteSuggestions } from "./notes.ts";

const notes = ["Rozdzieliła zadania w zespole.", "Za mało informacji zwrotnej."];
const candidates = new Set(["delegowanie"]);
const match = { index: 0, indicatorId: "delegowanie", quote: "Rozdzieliła zadania", gap: null };
const vague = { index: 1, indicatorId: null, quote: "Za mało informacji", gap: "situation" };

test("oddziela notatki akapitami i porządkuje komplet zweryfikowanych dopasowań", () => {
  assert.deepEqual(splitNotes(notes.join("\r\n \r\n")), notes);
  assert.deepEqual(verifyNoteSuggestions(notes, [vague, match], candidates), [match, vague]);
});

test("odrzuca cytaty z innej notatki, zmyślony cytat lub wskaźnik spoza sprawy", () => {
  for (const changed of [
    { ...match, quote: vague.quote },
    { ...match, quote: "Zmieniła zakres zadań" },
    { ...match, indicatorId: "spoza-sprawy" },
  ]) {
    assert.equal(verifyNoteSuggestions(notes, [changed, vague], candidates), null);
  }
});

test("wymaga jednego wyniku na akapit i powodu przy braku przypisania", () => {
  for (const suggestions of [[match], [match, match], [match, { ...vague, gap: null }]]) {
    assert.equal(verifyNoteSuggestions(notes, suggestions, candidates), null);
  }
});
