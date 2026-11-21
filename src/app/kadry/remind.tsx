"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CaseKind } from "../../lib/server/cases";

export function Remind({ kind, unread }: { kind: CaseKind; unread: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <>
      <button
        disabled={busy || unread}
        onClick={async () => {
          setBusy(true);
          try {
            const reply = await fetch("/api/przypomnienia", {
              method: "POST",
              body: JSON.stringify({ kind, action: "send" }),
            });
            if (!reply.ok) throw new Error();
            setMessage("Przypomnienie wysłane.");
            router.refresh();
          } catch {
            setMessage("Nie udało się wysłać przypomnienia. Odśwież listę.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {unread ? "Oczekuje na odczyt" : "Przypomnij"}
      </button>
      {message && <small role="status">{message}</small>}
    </>
  );
}
