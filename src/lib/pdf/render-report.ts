import { displayDate, openAssessmentDocument } from "./document";
import type { ReportForm } from "./report";

export function renderReport(data: ReportForm) {
  const { doc, text, heading, signature, finish } = openAssessmentDocument(
    "Formularz sprawozdania z zadań realizowanych w przepracowanym okresie",
  );
  text("Załącznik nr 3 do rozporządzenia z 23.07.2015 r. (Dz.U. poz. 1144)");
  heading("Dane ocenianego");
  text("Urząd Demonstracyjny · Wydział Organizacyjny");
  text("Marta Przykładowa · Starszy specjalista");
  text(
    `Termin złożenia sprawozdania: od ${displayDate(data.reportFrom)} do ${displayDate(data.reportDue)}.`,
  );
  heading("Sprawozdanie");
  text(
    "Wskaż okres pracy objęty sprawozdaniem (co najmniej siedem przepracowanych miesięcy).",
  );
  text(
    "Okres od ................................ do ................................",
  );
  for (const topic of [
    "Zrealizowane zadania",
    "Napotkane problemy i sposób ich rozwiązania",
    "Nabyte umiejętności i wiedza",
    "Wnioski i propozycje usprawnienia pracy",
  ]) {
    heading(topic);
    for (let i = 0; i < 3; i++) {
      text(
        "..............................................................................................................................................",
      );
      doc.moveDown(0.5);
    }
  }
  signature("Miejscowość, data i podpis ocenianego");
  return finish();
}
