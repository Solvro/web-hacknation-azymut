import { displayDate as date, openAssessmentDocument } from "./document";
import { criteria, periodicCriteria } from "../scoring/periodic";
import type { prepareAssessment } from "./assessment";

const levels: Record<number, string> = {
  1: "Znacznie poniżej oczekiwań",
  3: "Poniżej oczekiwań",
  5: "Na poziomie oczekiwań",
  7: "Powyżej oczekiwań",
  9: "Znacznie powyżej oczekiwań",
};
const names = {
  B: ["Alicja Przykładowa", "Naczelniczka wydziału"],
  C: ["Adam Przykładowy", "Starszy specjalista"],
  first: ["Marta Przykładowa", "Starszy specjalista"],
};

export async function renderAssessment({
  data,
  result,
  rows,
}: ReturnType<typeof prepareAssessment>) {
  const first = data.form === "first";
  const title = first
    ? "Arkusz pierwszej oceny w służbie cywilnej"
    : "Arkusz oceny okresowej w służbie cywilnej";
  const [employee, position] = names[data.form];
  const { doc, text, textHeight, nextPageIfNeeded, reference, section, heading, field, signatures, finish } =
    openAssessmentDocument(title, first ? "PIERWSZA OCENA" : `ARKUSZ ${data.form}  |  OCENA OKRESOWA`, employee);

  function marks(scale: number[], scores: typeof rows) {
    doc
      .fillColor("#172231")
      .fontSize(9.5)
      .table({
        columnStyles: ["*", ...scale.map(() => 42)],
        defaultStyle: { border: 0.6, borderColor: "#a4adb7", padding: 5 },
        data: [
          [
            { text: "Kryterium", backgroundColor: "#e8ebef" },
            ...scale.map((points) => ({ text: `${points} pkt`, align: "center" as const, backgroundColor: "#e8ebef" })),
          ],
          ...scores.map((score) => [
            score.label,
            ...scale.map((points) => score.points === points
              ? { text: "X", align: "center" as const, backgroundColor: "#e8ebef" }
              : ""),
          ]),
        ],
      });
  }

  reference(first
    ? "Załącznik nr 2 do rozporządzenia Prezesa Rady Ministrów z 23 lipca 2015 r. (Dz.U. poz. 1144)"
    : `Załącznik nr ${data.form === "B" ? "3" : "4"} do rozporządzenia Prezesa Rady Ministrów z 4 kwietnia 2016 r. (Dz.U. poz. 470)`);

  section(first ? "I. Część ogólna" : "Część I. Dane i kryteria oceny");
  field("Oceniany", employee);
  field("Komórka organizacyjna", "Wydział Organizacyjny");
  field("Stanowisko", position);
  field("Bezpośredni przełożony", "Jan Przykładowy, Wydział Organizacyjny");
  if (first) {
    field("Kierujący komórką", "Ewa Przykładowa, Departament Organizacyjny");
    field("Nawiązanie stosunku pracy", date(data.employmentStart));
    section("II. Rozmowa wstępna");
    field("Data rozmowy wstępnej", date(data.opening));
    field("Termin złożenia sprawozdania", `od ${date(data.reportFrom)} do ${date(data.reportDue)}`);
    field("Okres sporządzenia oceny", `od ${date(data.earliestAssessment)} do ${date(data.latestAssessment)}`);
  } else {
    field("Kryteria obowiązkowe", periodicCriteria(data.form).map((key) => criteria[key]).join("\n"));
    field("Kryteria dodatkowe", data.extra.map((key) => criteria[key]).join("\n") || "Brak");
    field("Rozmowa rozpoczynająca", date(data.opening));
    field("Termin sporządzenia oceny", date(data.assessmentDue));
  }
  signatures("Potwierdzenie ustaleń", [
    "Data i podpis bezpośredniego przełożonego",
    "Data i podpis ocenianego",
  ]);

  doc.addPage();
  if (first) {
    section("III. Rozmowa oceniająca");
    field("Data rozmowy oceniającej", date(data.conversation));
    signatures("Potwierdzenie przeprowadzenia rozmowy", ["Podpis bezpośredniego przełożonego", "Podpis ocenianego"]);
    section("IV. Oceny cząstkowe");
    marks([3, 5, 7], rows);
  } else {
    section("Część II. Sporządzenie oceny okresowej");
    field("Data rozmowy oceniającej", date(data.conversation));
    field("Oceniany okres", `od ${date(data.periodFrom)} do ${date(data.periodTo)}`);
    heading("Oceny cząstkowe: kryteria obowiązkowe");
    marks([1, 3, 5, 7, 9], rows.slice(0, 5));
    if (data.extra.length) {
      heading("Oceny cząstkowe: kryteria dodatkowe");
      marks([1, 3, 5, 7, 9], rows.slice(5));
    }
  }
  const development = !first || result.positive ? data.development : "";
  const evaluationTextHeight = textHeight(data.justification) + textHeight(development);
  nextPageIfNeeded((first ? 382 : 330) + Math.min(evaluationTextHeight, 220));
  section(first ? "V. Pierwsza ocena w służbie cywilnej" : "Przyznanie oceny okresowej");
  field("Średnia arytmetyczna", `${result.average.toLocaleString("pl-PL", { maximumFractionDigits: 3 })} pkt`);
  if ("level" in result) field("Ogólny poziom spełniania kryteriów", levels[result.level]);
  if (first) {
    field("Zaliczenie egzaminu", data.exam === "passed" ? "Tak" : data.exam === "not_passed" ? "Nie" : "Nie dotyczy");
    field("Sprawozdanie w terminie", data.report === "on_time" ? "Tak" : "Nie");
  }
  field("Wynik oceny", result.positive ? "POZYTYWNA" : "NEGATYWNA");
  if (data.justification) {
    heading("Uzasadnienie przyznanej oceny");
    text(data.justification);
  } else {
    field("Uzasadnienie przyznanej oceny", "—");
  }
  if (first) section("VI. Wnioski dotyczące rozwoju zawodowego");
  else heading("Wnioski do indywidualnego programu rozwoju zawodowego");
  text(development || "—");
  if (!first && data.gradeRequest) field("Wniosek o kolejny stopień służbowy", "Dołączono w części III arkusza.");
  signatures("Podpisy i zapoznanie z oceną", [
    "Data i podpis bezpośredniego przełożonego",
    ...(first ? ["Data i podpis kierującego komórką organizacyjną"] : []),
    "Data zapoznania i podpis ocenianego",
  ], first
    ? "Oceniany potwierdza zapoznanie się z pierwszą oceną w służbie cywilnej."
    : "Oceniany potwierdza zapoznanie się z oceną okresową i wnioskami dotyczącymi rozwoju zawodowego.");
  if (!first && data.gradeRequest) {
    doc.addPage();
    section("Część III. Wniosek o przyznanie kolejnego stopnia służbowego");
    field("Urzędnik służby cywilnej", `${employee}, ${position}`);
    reference("Podstawa: art. 89 ust. 1 ustawy z dnia 21 listopada 2008 r. o służbie cywilnej.");
    heading("Uzasadnienie wniosku");
    text(data.gradeRequest);
    signatures("Podpis wnioskującego", ["Data i podpis oceniającego"]);
  }
  return finish();
}
