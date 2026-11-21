import { redirect } from "next/navigation";
import { requireRole } from "../../lib/server/access";
import { listAudit, listCases } from "../../lib/server/cases";
import { Logo } from "../logo";
import { Logout } from "../logout";
import { Remind } from "./remind";
import { caseTask } from "../../lib/cases/next-action";

export const dynamic = "force-dynamic";
const dateTime = new Intl.DateTimeFormat("pl-PL", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Warsaw",
});
const urgency = {
  overdue: { label: "Po terminie", order: 0 },
  soon: { label: "Do 7 dni", order: 1 },
  confirmation: { label: "Oczekuje na potwierdzenie", order: 2 },
  undated: { label: "Termin do ustalenia", order: 3 },
  scheduled: { label: "Zaplanowano", order: 4 },
};
const dateLabel = (iso: string) => iso.split("-").reverse().join(".");
const names = { periodic: "Ocena okresowa", first: "Pierwsza ocena" };

export default async function HRPage() {
  const session = await requireRole(["hr", "admin"]);
  if (!session) redirect("/");
  const [cases, audit] = await Promise.all([
    listCases(session.workspace),
    session.role === "admin" ? listAudit(session.workspace) : [],
  ]);
  const queue = cases.flatMap((item) => {
    const task = caseTask(item.kind, item.status, item.actionDue);
    return task ? [{ item, task }] : [];
  }).sort((a, b) => urgency[a.task.urgency].order - urgency[b.task.urgency].order);
  const completed = cases.filter(({ status }) => status === "Zapoznano z oceną");
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
        <p className="lead">Sprawdź, co przełożony powinien zrobić w każdej zapisanej sprawie.</p>
        <section>
          <h2>Sprawy wymagające działania</h2>
          {queue.length === 0 ? (
            <p>{cases.length === 0
              ? "Sprawy pojawią się po zapisaniu ich przez przełożonego."
              : "Wszystkie zapisane sprawy mają odnotowane zapoznanie z oceną."}</p>
          ) : (
            <table className="hr-queue">
              <thead>
                <tr>
                  <th scope="col">Sprawa</th>
                  <th scope="col">Następna czynność</th>
                  <th scope="col">Termin czynności</th>
                  <th scope="col">Przypomnienie</th>
                </tr>
              </thead>
              <tbody>
                {queue.map(({ item, task }) => (
                  <tr key={item.kind}>
                    <td><strong>{item.title}</strong><small>{item.status}</small></td>
                    <td>{task.label}<small>Przełożony</small></td>
                    <td>
                      {item.actionDue && <time dateTime={item.actionDue}>{dateLabel(item.actionDue)}</time>}
                      <small data-urgency={task.urgency}>{urgency[task.urgency].label}</small>
                    </td>
                    <td>
                      <Remind kind={item.kind} unread={!!item.reminder} />
                      {item.reminder === "automatic" && <small>Wysłano automatycznie</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        {completed.length > 0 && (
          <section>
            <h2>Zakończone sprawy</h2>
            <ul>
              {completed.map((item) => <li key={item.kind}>{item.title} · {item.status}</li>)}
            </ul>
          </section>
        )}
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
