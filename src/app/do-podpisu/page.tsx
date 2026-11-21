import { redirect } from "next/navigation";
import { requireRole } from "../../lib/server/access";
import { firstForSignature } from "../../lib/server/first-for-signature";
import { Logout } from "../logout";

export const dynamic = "force-dynamic";
export default async function SignaturePage() {
  const session = await requireRole(["department_head"]);
  if (!session) redirect("/");
  const assessment = await firstForSignature(session.workspace);
  return (
    <>
      <header className="top">
        <div className="brand">Azymut</div>
        <span className="demo">
          <Logout />
        </span>
      </header>
      <main className="hr-workspace">
        <h1>Pierwsza ocena do podpisu</h1>
        {assessment ? (
          <section>
            <h2>Marta Przykładowa · starszy specjalista</h2>
            <p>
              Ocena {assessment.result.positive ? "pozytywna" : "negatywna"} ·
              średnia {assessment.result.average.toLocaleString("pl-PL")} pkt.
            </p>
            <a
              className="primary inline-block rounded-md mt-4"
              href="/api/do-podpisu"
            >
              Pobierz arkusz pierwszej oceny
            </a>
            <p>
              Arkusz zawiera miejsca na podpis przełożonego i kierującego
              komórką.
            </p>
          </section>
        ) : (
          <p>
            Arkusz pojawi się, gdy przełożony zapisze podsumowanie pierwszej
            oceny.
          </p>
        )}
      </main>
    </>
  );
}
