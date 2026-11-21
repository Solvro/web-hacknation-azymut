const origin = process.env.AZYMUT_EVAL_URL || "http://127.0.0.1:3000";
const normalize = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ł/g, "l");
const cases = [
  {
    scope: "periodic",
    question:
      "Co powinienem zrobić ze zwykłym terminem oceny, jeżeli urzędnik był na usprawiedliwionej nieobecności przez dwa miesiące?",
    citation: "Art. 81 ust. 7",
    pattern: /przed[lł]u[zż]/,
  },
  {
    scope: "periodic",
    question:
      "Od jakiego wydarzenia biegnie termin ponownej oceny po negatywnej?",
    citation: "Art. 81 ust. 9",
    pattern: /zapozn/,
  },
  {
    scope: "periodic",
    question:
      "Jestem pracownikiem na umowie bezterminowej. Ile dni mam na sprzeciw od okresowej oceny?",
    citation: "Art. 83 ust. 1",
    pattern: /\b7\b|siedem/,
  },
  {
    scope: "periodic",
    question:
      "Czy przełożony może ustalić cztery dodatkowe kryteria do arkusza C?",
    citation: "§ 5 ust. 2",
    pattern: /\b3\b|trzy/,
  },
  {
    scope: "periodic",
    question:
      "Jedna cząstkowa ocena to 1, reszta 9. Jaki jest formalny wynik okresowej oceny?",
    citation: "§ 11 ust. 1",
    pattern: /negatywn/,
  },
  {
    scope: "periodic",
    question:
      "Gdy oceniający zmienia się w trakcie trwania cyklu, czy ocena ma być oparta na dotychczasowych kryteriach?",
    citation: "§ 9 ust. 3",
    pattern: /wczesniej|dotychczasow|wybran/,
  },
  {
    scope: "first",
    question:
      "Przy zastępstwie strony same zdecydowały o pierwszej ocenie. Od kiedy biegnie termin na rozmowę wstępną?",
    citation: "§ 3",
    pattern: /\b21\b|dwadziescia jeden/,
  },
  {
    scope: "first",
    question:
      "Czy pięć miesięcy przepracowanego okresu wystarczy w sprawozdaniu do pierwszej oceny?",
    citation: "§ 6 ust. 1",
    pattern: /\b7\b|siedem/,
  },
  {
    scope: "first",
    question:
      "Czy wyższe stanowisko w służbie cywilnej podlega wyjątkowi w warunku zdania egzaminu do pierwszej oceny?",
    citation: "§ 10 ust. 3",
    pattern: /nie stosuje|nie jest wymagan|nie musi|podlega wyjatk|zwoln/,
  },
  {
    scope: "first",
    question:
      "Czy dwie oceny cząstkowe po 3 punkty pozwalają na pozytywną pierwszą ocenę przy średniej 5,4?",
    citation: "§ 10 ust. 1",
    pattern: /negatywn|nie wiecej|najwyzej/,
  },
  {
    scope: "first",
    question: "Jaki jest kod pocztowy portu kosmicznego?",
    status: "insufficient",
  },
  {
    scope: "periodic",
    question: "Jaką ocenę mam dać temu pracownikowi?",
    status: "decision",
  },
];
let passed = 0;
let available = true;
for (const item of cases) {
  const response = await fetch(new URL("/api/asystent", origin), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin,
      ...(process.env.AZYMUT_EVAL_COOKIE
        ? { cookie: process.env.AZYMUT_EVAL_COOKIE }
        : {}),
    },
    body: JSON.stringify({
      mode: "formal",
      scope: item.scope,
      question: item.question,
    }),
    signal: AbortSignal.timeout(45000),
  });
  const data = await response
    .json()
    .catch(() => ({ status: "http-" + response.status }));
  if (
    data.status === "model-unavailable" ||
    data.status === "knowledge-unavailable" ||
    response.status === 401 ||
    response.status === 403
  )
    available = false;
  const expected = item.status
    ? data.status === item.status
    : data.status === "answered" &&
      item.pattern.test(normalize(data.answer)) &&
      data.sources?.some((source) => source.locator === item.citation);
  if (expected) passed++;
  console.log(
    `${expected ? "OK" : "DO SPRAWDZENIA"} · ${data.method ?? data.status} · ${item.question}`,
  );
  if (data.answer) console.log("  " + data.answer.replace(/\s+/g, " "));
  if (!available) break;
}
if (!available)
  console.log(
    "Przerwano. Do pełnej próby potrzebny jest dostęp do bazy wiedzy i aktywnego modelu.",
  );
else
  console.log(
    `Automatyczna kontrola treści i źródła: ${passed}/${cases.length}. Odpowiedzi należy dodatkowo ocenić merytorycznie.`,
  );
if (passed !== cases.length) process.exitCode = 1;
