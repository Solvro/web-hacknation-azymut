import assert from "node:assert/strict";
import { test } from "node:test";
import { searchSources } from "./search.ts";
import { verifyAnswer } from "./verify.ts";

const art = {
  id: "ustawa-42",
  title: "Ustawa",
  locator: "Art. 83 ust. 1",
  text: "Sprzeciw w terminie 7 dni od dnia zapoznania się z oceną.",
  url: "https://eli.gov.pl",
  scope: "both",
  kind: "law",
};
const section = {
  ...art,
  id: "r2015-10",
  locator: "§ 10 ust. 3",
  scope: "first",
  text: "Przepis określa wyjątki od warunku egzaminu.",
};
test("wyszukuje podstawę sprzeciwu i dokładny paragraf we właściwej ścieżce", () => {
  assert.deepEqual(
    searchSources("Jak wnieść sprzeciw?", "periodic", [art, section]),
    [art],
  );
  assert.deepEqual(searchSources("§ 10 ust. 3", "first", [art, section]), [
    section,
  ]);
  assert.deepEqual(
    searchSources("Opisz kosmiczne kwiaciarnie", "periodic", [art, section]),
    [],
  );
});
test("akceptuje cytat wyłącznie z przekazanej jednostki", () => {
  const output = {
    answer: "Siedem dni.",
    citations: [{ id: art.id, quote: "Sprzeciw w terminie 7 dni" }],
  };
  assert.ok(verifyAnswer(output, [art]));
  assert.equal(verifyAnswer(output, [section]), null);
  assert.equal(
    verifyAnswer(
      {
        ...output,
        citations: [{ id: art.id, quote: "Sprzeciw w terminie czterech dni" }],
      },
      [art],
    ),
    null,
  );
  assert.equal(verifyAnswer({ ...output, citations: [] }, [art]), null);
});
