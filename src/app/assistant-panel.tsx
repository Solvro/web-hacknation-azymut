"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

type Evidence = { label: string; text: string };
type Reply = {
  status:
    | "answered"
    | "decision"
    | "insufficient"
    | "model-unavailable"
    | "knowledge-unavailable"
    | "unverified"
    | "invalid";
  answer?: string;
  sources?: {
    id: string;
    title: string;
    locator: string;
    text: string;
    url: string;
  }[];
};
const messages: Record<Exclude<Reply["status"], "answered">, string> = {
  decision:
    "Ocenę wybiera przełożony. Mogę wyjaśnić zasady albo pomóc przygotować pytania do rozmowy.",
  insufficient:
    "Nie mam wystarczających informacji w bazie, by odpowiedzieć. Doprecyzuj rodzaj oceny lub etap.",
  "model-unavailable":
    "Model niedostępny. Poniżej możesz sprawdzić pasujące fragmenty źródeł, jeśli udało się je odnaleźć.",
  "knowledge-unavailable":
    "Baza wiedzy jest niedostępna. Spróbuj ponownie po jej załadowaniu.",
  unverified:
    "Nie udało się potwierdzić cytatów z odpowiedzi. Poniżej znajdziesz odszukane fragmenty.",
  invalid: "Wpisz pytanie od 5 do 1200 znaków i spróbuj ponownie.",
};
export function AssistantPanel({
  scope,
  evidence,
}: {
  scope: "first" | "periodic";
  evidence: Evidence[];
}) {
  const [mode, setMode] = useState<"formal" | "conversation">("formal");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [thread, setThread] = useState<{ question: string; reply: Reply }[]>(
    [],
  );
  return (
    <section className="assistant-panel">
      <details>
        <summary>
          <BookOpen size={18} className="inline" /> Zapytaj asystenta
        </summary>
        <div className="actions assistant-modes">
          <button
            disabled={busy}
            aria-pressed={mode === "formal"}
            onClick={() => setMode("formal")}
          >
            Zasady oceny
          </button>
          <button
            disabled={busy}
            aria-pressed={mode === "conversation"}
            onClick={() => setMode("conversation")}
          >
            Przygotowanie rozmowy
          </button>
        </div>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const asked = question.trim();
            if (asked.length < 5 || busy) return;
            setBusy(true);
            let reply: Reply;
            try {
              const response = await fetch("/api/asystent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  scope,
                  mode,
                  question: asked,
                  evidence: mode === "conversation" ? evidence.slice(0, 8) : [],
                }),
              });
              reply = await response.json();
            } catch {
              reply = { status: "model-unavailable" };
            }
            setThread((previous) => [
              ...previous.slice(-7),
              { question: asked, reply },
            ]);
            setQuestion("");
            setBusy(false);
          }}
        >
          <label className="field">
            Pytanie
            <textarea
              required
              minLength={5}
              maxLength={1200}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                mode === "formal"
                  ? "Np. Kiedy pracownik może wnieść sprzeciw?"
                  : "Np. Jakie pytania pomogą omówić współpracę?"
              }
            />
          </label>
          <small>
            {mode === "conversation"
              ? "Asystent może użyć przykładów z tej oceny. Wpisuj wyłącznie dane fikcyjne."
              : "Wpisuj wyłącznie dane fikcyjne."}
          </small>
          <button
            className="primary"
            disabled={busy || question.trim().length < 5}
          >
            {busy ? "Szukam odpowiedzi…" : "Wyślij pytanie"}
          </button>
        </form>
        <div aria-live="polite">
          {thread.map((message, i) => (
            <article key={i}>
              <h3>{message.question}</h3>
              <p className="whitespace-pre-wrap wrap-anywhere">
                {message.reply.status === "answered"
                  ? message.reply.answer
                  : messages[message.reply.status]}
              </p>
              {message.reply.sources?.map((source, index) => (
                <details key={source.id + "-" + index}>
                  <summary>
                    {source.title} · {source.locator}
                  </summary>
                  <blockquote>{source.text}</blockquote>
                  {source.url && (
                    <a href={source.url} target="_blank" rel="noreferrer">
                      Otwórz akt prawny
                    </a>
                  )}
                </details>
              ))}
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}
