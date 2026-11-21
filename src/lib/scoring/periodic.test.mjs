import assert from "node:assert/strict";
import { test } from "node:test";
import { periodicCriteria, periodicResult, suggestPeriodicPoints } from "./periodic.ts";

test("arkusze mają właściwe kryteria i dopuszczają do trzech różnych dodatkowych", () => {
  assert.deepEqual(periodicCriteria("B"), ["leadership", "decisions", "organization", "cooperation", "communication"]);
  assert.deepEqual(periodicCriteria("C"), ["knowledge", "reliability", "organization", "cooperation", "communication"]);
  const extras = ["analysis", "negotiation", "strategy"];
  assert.deepEqual(periodicCriteria("B", extras).slice(5), extras);
  for (const invalid of [[...extras, "knowledge"], ["analysis", "analysis"], ["leadership"], ["typo"]]) {
    assert.throws(() => periodicCriteria("B", invalid), RangeError);
  }
  assert.throws(() => periodicCriteria("A"), RangeError);
});

test("brak podstaw i puste pola nie stają się ocenami", () => {
  for (const observations of [[], ["outside_scope"], ["unobserved"], ["pending"], [9, "pending", "unobserved"]]) {
    assert.equal(suggestPeriodicPoints(observations).suggestion, null);
  }
  assert.deepEqual(suggestPeriodicPoints([3, "outside_scope", "unobserved"]), {
    observed: 1, selected: 2, average: 3, suggestion: 3,
  });
});

test("sugestia liczy średnią obserwacji i rozstrzyga remisy w stronę standardu", () => {
  assert.deepEqual(suggestPeriodicPoints([5, 7, 7, 7, "pending", "unobserved"]), {
    observed: 4, selected: 6, average: 6.5, suggestion: 7,
  });
  for (const [values, expected] of [[[1, 3], 3], [[3, 5], 5], [[5, 7], 5], [[7, 9], 7]]) {
    assert.equal(suggestPeriodicPoints(values).suggestion, expected);
  }
  assert.throws(() => suggestPeriodicPoints([2]), RangeError);
});

function decisionsFor(points, extra = []) {
  return Object.fromEntries(periodicCriteria("B", extra).map((key, i) => [key, points[i]]));
}

test("brak jawnej decyzji dla dowolnego wybranego kryterium pozostawia szkic", () => {
  const decisions = decisionsFor([7, 7, 7, 7, 7]);
  assert.deepEqual(periodicResult("B", ["analysis"], { ...decisions, decisions: null }), {
    status: "draft", missing: ["decisions", "analysis"],
  });
  assert.throws(() => periodicResult("B", [], { ...decisions, decisions: 0 }), RangeError);
});

test("jedynka daje wynik negatywny również przy wysokiej średniej", () => {
  assert.deepEqual(periodicResult("B", [], decisionsFor([1, 7, 7, 7, 7])), {
    status: "scored", average: 5.8, level: 5, positive: false, reasons: ["one_point"],
  });
  assert.deepEqual(periodicResult("B", [], decisionsFor([1, 3, 3, 3, 3])).reasons, ["low_average", "one_point"]);
});

test("dokładny próg należy do niższego przedziału, średniej nie zaokrąglamy", () => {
  for (const lower of [1, 3, 5, 7]) {
    for (const higherCount of [3, 4]) {
      const points = Array(6).fill(lower);
      points.fill(lower + 2, 0, higherCount);
      const result = periodicResult("B", ["analysis"], decisionsFor(points, ["analysis"]));
      assert.equal(result.level, higherCount === 3 ? lower : lower + 2);
      assert.equal(result.positive, !points.includes(1) && result.average > 4);
    }
  }
});

test("w wyniku C liczą się tylko kryteria wybrane dla tej sprawy", () => {
  const decisions = Object.fromEntries(periodicCriteria("C").map((key) => [key, 9]));
  assert.deepEqual(periodicResult("C", [], { ...decisions, analysis: 1 }), {
    status: "scored", average: 9, level: 9, positive: true, reasons: [],
  });
});
