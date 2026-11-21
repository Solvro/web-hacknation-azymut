import assert from "node:assert/strict";
import { test } from "node:test";
import { searchSources } from "./search.ts";
import { formalRuleAnswer } from "./formal-rules.ts";
import { verifyAnswer } from "./verify.ts";

const art = {
  id: "ustawa-42",
  title: "Ustawa",
  locator: "Art. 83 ust. 1",
  text: "Od oceny okresowej służy, w terminie 7 dni od dnia zapoznania się z oceną, sprzeciw do dyrektora generalnego urzędu.",
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
    citations: [{ id: art.id, quote: "w terminie 7 dni" }],
  };
  assert.ok(verifyAnswer(output, [art]));
  assert.equal(verifyAnswer(output, [section]), null);
  assert.equal(
    verifyAnswer({ ...output, answer: "insufficient" }, [art]),
    null,
  );
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

test("odpowiada na przykładowe pytanie o termin sprzeciwu wyłącznie z właściwym cytatem", () => {
  const question = "Ile dni ma pracownik na wniesienie sprzeciwu?";
  const answer = formalRuleAnswer(question, "periodic", [art]);
  assert.match(answer.answer, /7 dni od zapoznania się z oceną/);
  assert.equal(answer.sources[0].locator, art.locator);
  assert.equal(formalRuleAnswer(question, "first", [art]), null);
  assert.equal(formalRuleAnswer(question, "periodic", [section]), null);
  assert.equal(formalRuleAnswer("Jak wnieść sprzeciw?", "periodic", [art]), null);
});

test("objaśnia skutki podanej oceny 1 pkt tylko dla okresowej i z właściwą jednostką", () => {
  const ruleSource = {
    ...art,
    id: "r2016-1",
    locator: "§ 11 ust. 1",
    text: "przyznaniu oceny negatywnej, a także w przypadku uzyskania przez ocenianego co najmniej jednej z ocen cząstkowych na poziomie znacznie poniżej oczekiwań.",
  };
  const question = "Ocena cząstkowa to 1 punkt. Jaki jest wynik oceny?";
  assert.match(
    formalRuleAnswer(question, "periodic", [ruleSource]).answer,
    /negatywny/,
  );
  assert.equal(formalRuleAnswer(question, "first", [ruleSource]), null);
  assert.equal(formalRuleAnswer(question, "periodic", [art]), null);
  assert.equal(
    formalRuleAnswer("Jaką ocenę mam dać?", "periodic", [ruleSource]),
    null,
  );
});

test("przy zmianie oceniającego zachowuje kryteria wybrane przed zmianą", () => {
  const source = {
    ...art,
    id: "r2016-21",
    locator: "§ 9 ust. 3",
    text: "W przypadku zmiany na stanowisku oceniającego w trakcie okresu, w którym oceniany podlega ocenie, ocena jest sporządzana na podstawie wybranych wcześniej kryteriów.",
  };
  const question = "Gdy oceniający zmienia się w trakcie cyklu, czy zostają dotychczasowe kryteria?";
  const result = formalRuleAnswer(question, "periodic", [source]);
  assert.match(result.answer, /wybranych wcześniej/);
  assert.equal(result.sources[0].locator, source.locator);
  assert.equal(formalRuleAnswer(question, "first", [source]), null);
  assert.equal(formalRuleAnswer("Jakie kryteria po zmianie stanowiska pracownika?", "periodic", [source]), null);
});
