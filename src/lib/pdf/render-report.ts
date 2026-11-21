import { displayDate, openAssessmentDocument } from "./document";
import type { ReportForm } from "./report";

export function renderReport(data: ReportForm) {
  const { text, reference, section, field, heading, writingLines, signatures, finish } =
    openAssessmentDocument(
      "Sprawozdanie z zadań w przepracowanym okresie",
      "PIERWSZA OCENA  |  SPRAWOZDANIE",
      "Marta Przykładowa",
    );
  reference("Załącznik nr 3 do rozporządzenia Prezesa Rady Ministrów z 23 lipca 2015 r. (Dz.U. poz. 1144)");
  section("Dane ocenianego");
  field("Oceniany", "Marta Przykładowa");
  field("Komórka i stanowisko", "Wydział Organizacyjny, starszy specjalista");
  field("Termin złożenia sprawozdania", `od ${displayDate(data.reportFrom)} do ${displayDate(data.reportDue)}`);
  section("Sprawozdanie");
  text("Wskaż okres pracy objęty sprawozdaniem (co najmniej siedem przepracowanych miesięcy).");
  field("Okres pracy", "od ................................ do ................................");
  for (const topic of [
    "Zrealizowane zadania",
    "Napotkane problemy i sposób ich rozwiązania",
    "Nabyte umiejętności i wiedza",
    "Wnioski i propozycje usprawnienia pracy",
  ]) {
    heading(topic);
    writingLines(3);
  }
  signatures("Podpis", ["Miejscowość, data i podpis ocenianego"]);
  return finish();
}
