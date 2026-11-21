import { redirect } from "next/navigation";
import { demoAccess, hasDatabase, sameOrigin, type Role } from "./auth";

export async function requireRole(allowed: Role[]) {
  if (!hasDatabase()) return null;
  const session = await demoAccess();
  if (!session) redirect("/logowanie");
  if (!allowed.includes(session.role))
    redirect(session.role === "supervisor" ? "/" : "/kadry");
  return session;
}

export async function requireApiRole(request: Request, allowed: Role[]) {
  if (!hasDatabase()) return null;
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const session = await demoAccess();
  if (!session) return new Response(null, { status: 401 });
  if (!allowed.includes(session.role))
    return new Response(null, { status: 403 });
  return session;
}
