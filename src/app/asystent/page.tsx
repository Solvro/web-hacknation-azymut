import { requireRole } from "../../lib/server/access";
import { AppHeader } from "../app-header";
import { StandaloneAssistant } from "./standalone";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const session = await requireRole(["supervisor"]);
  return (
    <>
      <AppHeader authenticated={!!session} section="Asystent" />
      <main className="narrow">
        <h1>Zapytaj asystenta</h1>
        <p className="lead">
          Asystent odpowiada na podstawie ustawy, rozporządzeń, modelu
          kompetencji i poradników. Pokazuje źródło każdej odpowiedzi, a gdy go
          nie znajdzie, mówi o tym wprost.
        </p>
        <StandaloneAssistant />
      </main>
    </>
  );
}
