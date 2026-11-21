import type { Source } from "./search.ts";

const entries = [
  [
    "Ile dni ma pracownik na sprzeciw wobec oceny okresowej?",
    "Siedem dni od zapoznania się z oceną. Sprzeciw wnosi się do dyrektora generalnego urzędu.",
    "ustawa",
    "Art. 83 ust. 1",
  ],
  [
    "Co ile sporządza się ocenę okresową?",
    "W zwykłym cyklu co 24 miesiące.",
    "ustawa",
    "Art. 81 ust. 4",
  ],
  [
    "Ile można wybrać dodatkowych kryteriów okresowej?",
    "Najwyżej trzy kryteria dodatkowe, dobrane do zadań i obowiązków wynikających z opisu stanowiska.",
    "r2016",
    "§ 5 ust. 2",
  ],
  [
    "Kiedy pierwsza rozmowa wstępna przy zatrudnieniu na zastępstwo?",
    "W ciągu 21 dni od uzgodnienia przez strony, że osoba zatrudniona na zastępstwo będzie podlegać pierwszej ocenie.",
    "r2015",
    "§ 3",
  ],
  [
    "Jaki okres obejmuje sprawozdanie przy pierwszej ocenie?",
    "Sprawozdanie obejmuje okres faktycznie przepracowany, nie krótszy niż siedem miesięcy.",
    "r2015",
    "§ 6 ust. 1",
  ],
  [
    "Czy zwolnienie z odbywania służby przygotowawczej zwalnia też z egzaminu?",
    "Zwolnienie na podstawie art. 36 ust. 7 samo w sobie pozostawia obowiązek przystąpienia do egzaminu.",
    "ustawa",
    "Art. 36 ust. 8",
  ],
] as const;

export function faqSources(corpus: Source[]): Source[] {
  return entries.flatMap(([question, answer, prefix, locator], index) => {
    const source = corpus.find(
      (item) => item.id.startsWith(prefix + "-") && item.locator === locator,
    );
    return source
      ? [
          {
            ...source,
            id: "faq-" + index,
            referenceId: source.id,
            title: "Pytania i odpowiedzi Azymutu",
            locator: question,
            text: answer + " Podstawa: " + source.title + ", " + locator + ".",
            kind: "faq",
          },
        ]
      : [];
  });
}
