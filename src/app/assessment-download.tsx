"use client";

import { useState, type ReactNode } from "react";
import { FileDown } from "lucide-react";

export function AssessmentDownload({
  form,
  payload,
  children,
}: {
  form: string;
  payload: Record<string, unknown>;
  children?: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <section>
      <h2>Arkusz do podpisu</h2>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const fields = Object.fromEntries(new FormData(event.currentTarget));
          setBusy(true);
          setError("");
          try {
            const response = await fetch("/api/arkusze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...payload, ...fields, form }),
            });
            if (!response.ok) throw new Error(await response.text());
            const url = URL.createObjectURL(await response.blob());
            const link = document.createElement("a");
            link.href = url;
            link.download = `azymut-arkusz-${form}.pdf`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          } catch (reason) {
            setError(
              reason instanceof Error
                ? reason.message
                : "Pobranie pliku nie powiodło się.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {children}
        <button className="primary" disabled={busy}>
          <FileDown className="inline" />{" "}
          {busy ? "Przygotowywanie…" : "Pobierz PDF"}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </section>
  );
}
