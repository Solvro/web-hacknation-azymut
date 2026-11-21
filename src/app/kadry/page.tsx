import { redirect } from "next/navigation";
import { requireRole } from "../../lib/server/access";
import { listAudit, listCases } from "../../lib/server/cases";
import { Logo } from "../logo";
import { Logout } from "../logout";
import { Remind } from "./remind";

export const dynamic = "force-dynamic";
const dateTime = new Intl.DateTimeFormat("pl-PL", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Warsaw",
});
const isComplete = (status: string) =>
  status === "Do podpisu" || status === "Zapoznano z oceną";
const names = { periodic: "Ocena okresowa", first: "Pierwsza ocena" };

export default async function HRPage() {
  const session = await requireRole(["hr", "admin"]);
  if (!session) redirect("/");
  const [cases, audit] = await Promise.all([
    listCases(session.workspace),
    session.role === "admin" ? listAudit(session.workspace) : [],
  ]);
  const today = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return (
    <>
      <header className="top">
        <div className="brand">
          <Logo />
        </div>
        <span className="demo">
          <Logout />
        </span>
      </header>
      <main className="hr-workspace">
        <h1>{session.role === "admin" ? "Administrator" : "Kadry"}</h1>
        <p className="lead">
          Monitoruj status i termin zapisanych spraw demonstracyjnych.
        </p>
        <section>
          <h2>Sprawy w tej sesji demonstracyjnej</h2>
          {cases.length === 0 ? (
            <p>Sprawy pojawią się po zapisaniu ich przez przełożonego.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th scope="col">Sprawa</th>
                  <th scope="col">Etap</th>
                  <th scope="col">Termin</th>
                  <th scope="col">Przypomnienie</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((item) => (
                  <tr key={item.kind}>
                    <td>{item.title}</td>
                    <td>{item.status}</td>
                    <td>
                      {item.due?.split("-").reverse().join(".") ||
                        "Do ustalenia"}
                      {item.due &&
                        item.due < today &&
                        !isComplete(item.status) && <small>Po terminie</small>}
                    </td>
                    <td>
                      {isComplete(item.status) ? (
                        "—"
                      ) : (
                        <Remind kind={item.kind} unread={item.unread} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        {session.role === "admin" && (
          <section>
            <h2>Dziennik czynności</h2>
            {audit.length === 0 ? (
              <p>Brak czynności.</p>
            ) : (
              <ul>
                {audit.map((event, i) => (
                  <li key={i}>
                    {dateTime.format(new Date(event.at))} · {event.actor} ·{" "}
                    {event.action === "case_saved"
                      ? "Zapis sprawy"
                      : "Wysłanie przypomnienia"}{" "}
                    · {names[event.kind]}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </>
  );
}
