import { requireRole } from "../../lib/server/access";
import { AppHeader } from "../app-header";
import { AssistantChat } from "../assistant-panel";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const session = await requireRole(["supervisor"]);
  return (
    <>
      <AppHeader authenticated={!!session} section="Asystent" />
      <main className="chat-page">
        <AssistantChat />
      </main>
    </>
  );
}
