import { normalize, type Source } from "./search.ts";
import { verifyAnswer } from "./verify.ts";

const rules = [
  {
    match: (q: string) =>
      /czastkow/.test(q) &&
      /\b1\b|jedynk/.test(q) &&
      /wynik|negatywn|pozytywn/.test(q),
    scope: "periodic",
    prefix: "r2016",
    locator: "§ 11 ust. 1",
    anchor: "a także w przypadku uzyskania przez ocenianego",
    answer:
      "Jeśli choć jedna ocena cząstkowa wynosi 1 pkt, wynik oceny okresowej jest negatywny także przy wyższej średniej. Podstawa to § 11 ust. 1 pkt 4 rozporządzenia.",
  },
  {
    match: (q: string) =>
      /kryteri/.test(q) &&
      /zmian\w* (?:na stanowisku )?(?:oceniajac|przelozon)|(?:zmienia sie|zmienil sie) (?:oceniajac|przelozon)|(?:oceniajac|przelozon)\w* (?:sie zmienia|zmienia sie|zmienil sie)/.test(q),
    scope: "periodic",
    prefix: "r2016",
    locator: "§ 9 ust. 3",
    anchor: "ocena jest sporządzana na podstawie wybranych wcześniej kryteriów",
    answer:
      "Jeżeli w trakcie okresu oceny zmienia się oceniający, ocenę sporządza się według kryteriów wybranych wcześniej. Podstawa to § 9 ust. 3 rozporządzenia.",
  },
  {
    match: (q: string) =>
      /czastkow|trojk/.test(q) &&
      /\bdwie\b|\bdwoch\b|\b2\b/.test(q) &&
      /\b3\b|trojk/.test(q) &&
      /pozytywn|negatywn|wynik/.test(q),
    scope: "first",
    prefix: "r2015",
    locator: "§ 10 ust. 1",
    anchor: "uzyskanie nie więcej niż jednej oceny cząstkowej",
    answer:
      "Dwie oceny cząstkowe po 3 pkt oznaczają negatywną pierwszą ocenę również przy średniej co najmniej 5 pkt. Do wyniku pozytywnego można mieć najwyżej jedną ocenę 3 pkt. Podstawa to § 10 ust. 1 pkt 3 i ust. 2 rozporządzenia.",
  },
  {
    match: (q: string) =>
      /sprawozdani/.test(q) &&
      /miesie/.test(q) &&
      /przeprac|jak dlugo|obejm|wystarcz/.test(q),
    scope: "first",
    prefix: "r2015",
    locator: "§ 6 ust. 1",
    anchor: "Sprawozdanie obejmuje",
    answer:
      "Sprawozdanie obejmuje okres faktycznie przepracowany przez ocenianego wynoszący co najmniej siedem miesięcy. Podstawa to § 6 ust. 1 rozporządzenia.",
  },
  {
    match: (q: string) => /wyzsz\w* stanowisk/.test(q) && /egzamin/.test(q),
    scope: "first",
    prefix: "r2015",
    locator: "§ 10 ust. 3",
    anchor: "pracownikiem służby cywilnej zatrudnionym na wyższym stanowisku",
    answer:
      "Do osoby zatrudnionej na wyższym stanowisku w służbie cywilnej nie stosuje się warunku zaliczenia egzaminu przy pierwszej ocenie. Podstawa to § 10 ust. 3 pkt 3 rozporządzenia.",
  },
] as const;

export function formalRuleAnswer(
  question: string,
  scope: "first" | "periodic",
  corpus: Source[],
) {
  const plain = normalize(question);
  const rule = rules.find(
    (candidate) => candidate.scope === scope && candidate.match(plain),
  );
  if (!rule) return null;
  const source = corpus.find(
    (item) =>
      item.id.startsWith(rule.prefix + "-") && item.locator === rule.locator,
  );
  if (!source) return null;
  const start = source.text.indexOf(rule.anchor);
  if (start < 0) return null;
  const quote = source.text
    .slice(start)
    .split(/;|\.(?:\s|$)/, 1)[0]
    .trim()
    .slice(0, 330);
  return verifyAnswer(
    { answer: rule.answer, citations: [{ id: source.id, quote }] },
    [source],
  );
}
