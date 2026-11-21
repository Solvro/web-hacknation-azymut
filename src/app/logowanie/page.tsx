import { Login } from "./login";
import { hasDatabase } from "../../lib/server/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  if (!hasDatabase()) redirect("/");
  return <Login />;
}
