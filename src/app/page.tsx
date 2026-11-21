import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  PlayCircle,
} from "lucide-react";
import { requireRole } from "../lib/server/access";
import { listCases, type CaseSummary } from "../lib/server/cases";
import { AppHeader } from "./app-header";

export const dynamic = "force-dynamic";

function CaseStatus({ item }: { item?: CaseSummary }) {
  if (!item) return <span className="status idle">Brak rozpoczętej sprawy</span>;
  return (
    <span className={"status" + (item.reminder ? " alert" : "")}>
      {item.reminder ? "Przypomnienie · " : ""}
      {item.status}
      {item.actionDue ? " · termin " + item.actionDue.split("-").reverse().join(".") : ""}
    </span>
  );
}

export default async function Home() {
  const session = await requireRole(["supervisor"]);
  const cases = session ? await listCases(session.workspace) : [];
  const periodic = cases.find((item) => item.kind === "periodic");
  const first = cases.find((item) => item.kind === "first");
  return (
    <>
      <AppHeader authenticated={!!session} />
      <main className="home">
        <p className="eyebrow">Dzień dobry</p>
        <h1>Co chcesz dziś zrobić?</h1>
        <p className="lead">
          Wybierz jedną rzecz. Azymut poprowadzi Cię krok po kroku, a decyzję o
          ocenie zawsze podejmujesz Ty.
        </p>
        <div className="tiles">
          <Link className="tile" href="/okresowa">
            <ClipboardCheck aria-hidden="true" />
            <strong>Ocena okresowa</strong>
            <span>
              Pracownik ma za sobą okres oceny. Przejdziesz przez kryteria,
              obserwacje, rozmowę i arkusz B lub C.
            </span>
            <CaseStatus item={periodic} />
            <em>
              {periodic ? "Wróć do sprawy" : "Rozpocznij"} <ArrowRight />
            </em>
          </Link>
          <Link className="tile" href="/pierwsza">
            <GraduationCap aria-hidden="true" />
            <strong>Pierwsza ocena</strong>
            <span>
              Nowy pracownik w służbie przygotowawczej. Rozmowa wstępna,
              sprawozdanie, egzamin i ocena w skali 3/5/7.
            </span>
            <CaseStatus item={first} />
            <em>
              {first ? "Wróć do sprawy" : "Rozpocznij"} <ArrowRight />
            </em>
          </Link>
          <Link className="tile" href="/asystent">
            <BookOpen aria-hidden="true" />
            <strong>Zapytaj asystenta</strong>
            <span>
              Zapytaj o zasady, terminy albo przygotowanie rozmowy. Asystent
              wskazuje źródła lub informuje, gdy brakuje podstaw do odpowiedzi.
            </span>
            <span className="status idle">Odpowiada na podstawie bazy wiedzy</span>
            <em>
              Zadaj pytanie <ArrowRight />
            </em>
          </Link>
        </div>
        <Link className="sample" href="/okresowa?przyklad=1">
          <PlayCircle aria-hidden="true" />
          <span>
            <strong>Wypróbuj na przykładowej ocenie.</strong> Przeanalizuj notatki
            i przygotuj agendę rozmowy w osobnym szkicu szkoleniowym.
          </span>
          <ArrowRight aria-hidden="true" />
        </Link>
      </main>
    </>
  );
}
