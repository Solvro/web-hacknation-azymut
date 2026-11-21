"use client";

import { useState } from "react";
import type { CaseKind } from "../lib/server/cases";

export function CaseControls({
  kind,
  revision,
  setRevision,
  unread,
  draft,
}: {
  kind: CaseKind;
  revision: number;
  setRevision: (revision: number) => void;
  unread: boolean;
  draft: Record<string, unknown>;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasReminder, setHasReminder] = useState(unread);
  return (
    <section>
      <h2>Sprawa demonstracyjna</h2>
      {hasReminder && (
        <div className="confirm">
          <p>
            Kadry proszą o sprawdzenie terminu i uzupełnienie bieżącego etapu
            tej oceny.
          </p>
          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/przypomnienia", {
                  method: "POST",
                  body: JSON.stringify({ kind, action: "read" }),
                });
                if (!response.ok) throw new Error();
                setHasReminder(false);
              } catch {
                setMessage("Nie udało się oznaczyć przypomnienia.");
              }
            }}
          >
            Oznacz jako przeczytane
          </button>
        </div>
      )}
      <p>
        Zapis udostępnia kadrom status i termin. Obserwacje i uzasadnienie widzi
        przełożony.
      </p>
      <button
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
      {message && <p role="status">{message}</p>}
    </section>
  );
}
