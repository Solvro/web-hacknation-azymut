"use client";

import { useState } from "react";
import type { CaseKind, ReminderKind } from "../lib/cases/next-action";

export function CaseControls({
  kind,
  revision,
  setRevision,
  reminder,
  draft,
}: {
  kind: CaseKind;
  revision: number;
  setRevision: (revision: number) => void;
  reminder: ReminderKind | null;
  draft: Record<string, unknown>;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(reminder);
  return (
    <div className="case-box">
      {pending && (
        <div className="reminder" role="status">
          <p>
            {pending === "automatic"
              ? "Zbliża się termin bieżącej czynności. Sprawdź, co zostało do zrobienia w tej sprawie."
              : "Kadry proszą o uzupełnienie bieżącego etapu tej oceny."}
          </p>
          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/przypomnienia", {
                  method: "POST",
                  body: JSON.stringify({ kind, action: "read" }),
                });
                if (!response.ok) throw new Error();
                setPending(null);
              } catch {
                setMessage("Nie udało się oznaczyć przypomnienia.");
              }
            }}
          >
            Oznacz jako przeczytane
          </button>
        </div>
      )}
      <button
        className="primary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const response = await fetch("/api/sprawy", {
              method: "POST",
              body: JSON.stringify({ kind, revision, draft }),
            });
            const result = await response.json();
            if (!response.ok)
              throw new Error(result.error || "Zapis nie powiódł się.");
            setRevision(result.revision);
            setPending(result.reminder);
            setMessage("Zapisano sprawę na serwerze.");
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : "Zapis nie powiódł się.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Zapisywanie…" : "Zapisz sprawę"}
      </button>
      <small>
        Kadry zobaczą tylko etap i termin. Obserwacje i uzasadnienie zostają u
        Ciebie.
      </small>
      {message && <small role="status">{message}</small>}
    </div>
  );
}
