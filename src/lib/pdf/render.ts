import PDFDocument from "pdfkit";
import { join } from "node:path";
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
    : `Arkusz ${data.form} — ocena okresowa w służbie cywilnej`;
  const doc = new PDFDocument({
    size: "A4",
    margin: 42,
    info: { Title: title },
  });
  const chunks: Buffer[] = [];
  const complete = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  doc.font(join(process.cwd(), "assets/fonts/NotoSans-Regular.ttf"));
  const text = (value: string) => {
    doc.fillColor("#17152c").fontSize(10).text(value, { lineGap: 2 });
  };
  function heading(value: string) {
    if (doc.y > doc.page.height - 110) doc.addPage();
    doc
      .moveDown(0.8)
      .fillColor("#46318c")
      .fontSize(13)
      .text(value)
      .moveDown(0.35);
  }
  function signature(label: string) {
    doc.moveDown(0.45);
    text(`........................................................  ${label}`);
  }
  const date = (value: string) => value.split("-").reverse().join(".");
  function marks(scale: number[], scores: typeof rows) {
    text("Ocena cząstkowa · X oznacza poziom wybrany przez przełożonego");
    for (const score of scores) {
      doc.moveDown(0.35);
      text(score.label);
      text(
        scale
          .map(
            (points) =>
              `${points === score.points ? "[X]" : "[ ]"} ${points} pkt`,
          )
          .join("       "),
      );
    }
  }
  doc.fillColor("#46318c").fontSize(10).text("AZYMUT / DANE SYNTETYCZNE");
  doc.moveDown(0.6).fillColor("#17152c").fontSize(19).text(title);
  text(
    first
      ? "Załącznik nr 2 do rozporządzenia z 23.07.2015 r. (Dz.U. poz. 1144)"
      : `Załącznik nr ${data.form === "B" ? "3" : "4"} do rozporządzenia z 4.04.2016 r. (Dz.U. poz. 470)`,
  );

  heading(first ? "I. Część ogólna" : "Część I. Dane i kryteria");
  const [employee, position] = names[data.form];
  text("Urząd: Urząd Demonstracyjny");
  text(`Oceniany: ${employee} · Wydział Organizacyjny · ${position}`);
  text(
    "Oceniający: Jan Przykładowy · Wydział Organizacyjny · Bezpośredni przełożony",
  );
  if (first) {
    text("Kierujący komórką: Ewa Przykładowa · Departament Organizacyjny");
    text(`Data nawiązania stosunku pracy: ${date(data.employmentStart)}`);
    heading("II. Rozmowa wstępna");
    text(`Data: ${date(data.opening)}`);
    text(
      `Termin złożenia sprawozdania: ${date(data.reportFrom)} – ${date(data.reportDue)}`,
    );
    text(
      `Okres pierwszej oceny: ${date(data.earliestAssessment)} – ${date(data.latestAssessment)}`,
    );
  } else {
    text(
      `Kryteria obowiązkowe: ${periodicCriteria(data.form)
        .map((key) => criteria[key])
        .join(", ")}.`,
    );
    text(
      `Kryteria dodatkowe: ${data.extra.map((key) => criteria[key]).join(", ") || "brak"}.`,
    );
    text(
      `Rozmowa rozpoczynająca: ${date(data.opening)}. Termin pisemnej oceny: ${date(data.assessmentDue)}.`,
    );
  }
  signature("Data i podpis przełożonego");
  signature("Data i podpis ocenianego");

  doc.addPage();
  if (first) {
    heading("III. Rozmowa oceniająca");
    text(`Data: ${date(data.conversation)}`);
    signature("Podpis przełożonego");
    signature("Podpis ocenianego");
    heading("IV. Oceny cząstkowe");
    marks([3, 5, 7], rows);
  } else {
    heading("Część II. Sporządzenie oceny");
    text(
      `Data rozmowy: ${date(data.conversation)}. Okres oceny: ${date(data.periodFrom)} – ${date(data.periodTo)}.`,
    );
    heading("Kryteria obowiązkowe");
    marks([1, 3, 5, 7, 9], rows.slice(0, 5));
    if (data.extra.length) {
      heading("Kryteria dodatkowe");
      marks([1, 3, 5, 7, 9], rows.slice(5));
    }
  }
  heading(
    first
      ? "V. Pierwsza ocena w służbie cywilnej"
      : "Przyznanie oceny okresowej",
  );
  text(
    `Średnia arytmetyczna: ${result.average.toLocaleString("pl-PL", { maximumFractionDigits: 3 })} pkt.`,
  );
  if ("level" in result)
    text(`Ogólny poziom spełniania kryteriów: ${levels[result.level]}.`);
  if (first) {
    text(
      `Zaliczenie egzaminu: ${data.exam === "passed" ? "Tak" : data.exam === "not_passed" ? "Nie" : "Nie dotyczy"}.`,
    );
    text(
      `Sprawozdanie złożone w terminie: ${data.report === "on_time" ? "Tak" : "Nie"}.`,
    );
  }
  text(`Wynik: ${result.positive ? "POZYTYWNA" : "NEGATYWNA"}`);
  heading("Uzasadnienie przyznanej oceny");
  text(data.justification || "—");
  heading(
    first
      ? "VI. Wnioski dotyczące rozwoju zawodowego"
      : "Wnioski do indywidualnego programu rozwoju zawodowego",
  );
  text(!first || result.positive ? data.development || "—" : "—");
  if (!first)
    text("Wniosek o przyznanie kolejnego stopnia służbowego: nie dołączono.");
  heading("Potwierdzenie dokonania oceny");
  signature("Data i podpis przełożonego");
  if (first) signature("Data i podpis kierującego komórką");
  signature("Data zapoznania i podpis ocenianego");
  doc.end();
  return complete;
}
