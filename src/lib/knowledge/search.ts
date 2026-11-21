export interface Source {
  id: string;
  title: string;
  locator: string;
  text: string;
  url: string;
  scope: "first" | "periodic" | "both";
  kind: "law" | "guide" | "model" | "faq" | "observation";
}

const ignored = new Set([
  "czy",
  "jak",
  "jest",
  "dla",
  "oraz",
  "przy",
  "gdy",
  "jaki",
  "kiedy",
  "ktory",
  "mozna",
]);
export function normalize(text: string) {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[łŁ]/g, "l")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
function terms(text: string, question = false) {
  const tokens = normalize(text).match(/[a-z0-9]{3,}/g) ?? [];
  return tokens
    .filter((word) => !question || !ignored.has(word))
    .map((word) => word.slice(0, 5));
}

// Pytania kontrolne i odsyłacze opracowane na podstawie obowiązujących aktów.
const faq = [
  {
    words: /sprzeciw|odwolani/,
    source: "ustawa",
    locators: [
      "Art. 83 ust. 1",
      "Art. 83 ust. 3",
      "Art. 83 ust. 4",
      "Art. 83 ust. 5",
    ],
  },
  {
    words: /nieobecn|zwolnieni.*lekarsk|\bl4\b/,
    source: "ustawa",
    locators: ["Art. 81 ust. 7", "Art. 81 ust. 8"],
  },
  { words: /ponown|negatywn/, source: "ustawa", locators: ["Art. 81 ust. 9"] },
  {
    words: /egzamin|\bksap\b|sluzb.*przygotowawcz/,
    source: "r2015",
    locators: ["§ 10 ust. 1", "§ 10 ust. 3"],
  },
  {
    words: /egzamin|zwolnieni.*odbyw/,
    source: "ustawa",
    locators: ["Art. 36 ust. 7", "Art. 36 ust. 8"],
  },
  { words: /21 dni|wstepn|zastepst/, source: "r2015", locators: ["§ 3"] },
  {
    words: /sprawozdani/,
    source: "r2015",
    locators: [
      "§ 4 ust. 1",
      "§ 5 ust. 1",
      "§ 6 ust. 1",
      "§ 8 ust. 1",
      "§ 10 ust. 1",
    ],
  },
  {
    words: /pierwsz.*(termin|ocen|podpis)|[78] miesie/,
    source: "ustawa",
    locators: ["Art. 38 ust. 1", "Art. 38 ust. 2"],
  },
  {
    words: /arkusz|kierowan.*pracownik/,
    source: "r2016",
    locators: ["§ 3 ust. 2", "§ 3 ust. 3", "§ 3 ust. 4"],
  },
  {
    words: /kryteri.*dodatk|dodatk.*kryteri/,
    source: "r2016",
    locators: ["§ 5 ust. 2"],
  },
  {
    words: /30 dni|rozpoczynaj|ustal.*kryteri/,
    source: "r2016",
    locators: ["§ 5 ust. 1", "§ 7"],
  },
  {
    words: /jedynk|punkt|sredni|uzasadn|negatywn/,
    source: "r2016",
    locators: ["§ 11 ust. 1", "§ 11 ust. 3", "§ 11 ust. 4"],
  },
  { words: /zmian.*stanowisk/, source: "ustawa", locators: ["Art. 81 ust. 6"] },
  {
    words: /zmian.*przelozon|now.*przelozon/,
    source: "r2016",
    locators: ["§ 9 ust. 3"],
  },
  {
    words: /\biprz\b|indywidualn.*rozwoj/,
    source: "ustawa",
    locators: ["Art. 81 ust. 5"],
  },
];

export function searchSources(
  question: string,
  scope: "first" | "periodic",
  sources: Source[],
  semantic: string[] = [],
) {
  const phrase = normalize(question);
  const query = [...new Set(terms(question, true))];
  const explicit = [
    ...phrase.matchAll(/(art\.?|§)\s*(\d+)(?:\s+ust\.?\s*(\d+[a-z]?))?/g),
  ];
  const questionScope =
    /pierwsz\w* ocen/.test(phrase) &&
    /okresow\w* ocen|ocen\w* okresow/.test(phrase)
      ? "both"
      : /pierwsz\w* ocen|ocen\w* pierwsz/.test(phrase)
        ? "first"
        : /okresow\w* ocen|ocen\w* okresow/.test(phrase)
          ? "periodic"
          : scope;
  return sources
    .filter(
      (source) =>
        questionScope === "both" ||
        source.scope === "both" ||
        source.scope === questionScope,
    )
    .map((source) => {
      const tokens = new Set(terms(source.locator + " " + source.text));
      const matches = query.filter((word) => tokens.has(word)).length;
      const reference = explicit.some(([, symbol, section, unit]) => {
        const match = normalize(source.locator).match(
          /^(art\.?|§)\s*(\d+)(?:\s+ust\.?\s*(\d+[a-z]?))?/,
        );
        return (
          match &&
          match[1][0] === symbol[0] &&
          match[2] === section &&
          (!unit || match[3] === unit)
        );
      });
      const anchor = faq.some(
        (item) =>
          item.words.test(phrase) &&
          source.id.startsWith(item.source + "-") &&
          item.locators.includes(source.locator),
      );
      const semanticRank = semantic.indexOf(source.id);
      const lexical =
        matches >= Math.min(2, query.length) &&
        matches > 0 &&
        query.length >= 2;
      const score =
        (reference ? 30 : 0) +
        (anchor ? 15 : 0) +
        (lexical ? matches : 0) +
        (semanticRank >= 0 ? 1 / (semanticRank + 1) : 0);
      return {
        source,
        score: score && score + (source.kind === "law" ? 1 : 0),
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 6)
    .map((item) => item.source);
}
