import { redirect } from "next/navigation";
import { requireRole } from "../../lib/server/access";
import { Logout } from "../logout";

export const dynamic = "force-dynamic";
export default async function HRPage() {
  const session = await requireRole(["hr", "admin"]);
  if (!session) redirect("/");
  return (
    <main className="login">
      <h1>{session.role === "admin" ? "Administrator" : "Kadry"}</h1>
      <p>
        Sprawy demonstracyjne pojawią się po zapisaniu oceny przez przełożonego.
      </p>
      <Logout />
    </main>
  );
}
