"use client";

import "./assistant-chat.css";
import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ChevronRight,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import {
  chatStreamType,
  type ChatEvent,
  type Citation,
  type Evidence,
  type Mode,
  type Progress,
  type Reply,
  type Scope,
} from "../lib/knowledge/chat";

type Notice =
  | Exclude<Reply["status"], "answered">
  | "network"
  | "session"
  | "stopped";
type Turn = {
  id: number;
  question: string;
  scope: Scope;
  mode: Mode;
  previousQuestion?: string;
  previousAnswer?: string;
  answer?: string;
  sources?: Citation[];
  method?: "rule" | "model";
  notice?: Notice;
};

const notices: Record<Notice, string> = {
  decision:
    "Ocenę wybierasz Ty. Mogę objaśnić zasady lub pomóc Ci przygotować się do rozmowy.",
  insufficient:
    "Nie znajduję podstawy do odpowiedzi. Doprecyzuj, o który etap lub sytuację chodzi.",
  "model-unavailable":
    "Asystent chwilowo nie może odpowiedzieć. Spróbuj ponownie za chwilę.",
  "knowledge-unavailable":
    "Nie mogę teraz otworzyć bazy wiedzy. Spróbuj ponownie za chwilę.",
  unverified:
    "Nie udało mi się potwierdzić cytatów. Możesz sprawdzić znalezione fragmenty lub ponowić pytanie.",
  invalid:
    "Pytanie powinno mieć od 5 do 1200 znaków. Wpisz je ponownie w polu wiadomości.",
  network: "Połączenie zostało przerwane. Możesz ponowić pytanie.",
  session: "Zaloguj się jako przełożony, aby kontynuować rozmowę.",
  stopped: "Odpowiedź zatrzymana.",
};
const retryable = new Set<Notice>([
  "model-unavailable",
  "knowledge-unavailable",
  "unverified",
  "network",
  "stopped",
]);

const phases: Record<Progress, string> = {
  searching: "Szukam w bazie wiedzy…",
  writing: "Układam odpowiedź…",
  checking: "Sprawdzam cytaty…",
};
const scopes: Record<Scope, string> = {
  periodic: "Ocena okresowa",
  first: "Pierwsza ocena",
};
const modes: Record<Mode, string> = {
  formal: "Zasady oceny",
  conversation: "Przygotowanie rozmowy",
};

const prompts = {
  periodic: [
    ["Kryteria dodatkowe", "Ile kryteriów dodatkowych mogę wybrać?"],
    ["Wynik oceny", "Kiedy ocena okresowa jest negatywna?"],
    [
      "Termin na sprzeciw",
      "Ile dni ma pracownik na wniesienie sprzeciwu od oceny okresowej?",
    ],
  ],
  first: [
    [
      "Rozmowa wstępna",
      "Do kiedy muszę przeprowadzić rozmowę wstępną przy pierwszej ocenie?",
    ],
    ["Wynik oceny", "Kiedy pierwsza ocena jest pozytywna?"],
    ["Podpisy na arkuszu", "Kto podpisuje arkusz pierwszej oceny?"],
  ],
  conversation: [
    ["Plan rozmowy", "Jak ułożyć plan rozmowy oceniającej?"],
    ["Pytania o współpracę", "Jakie otwarte pytania mogę zadać o współpracę?"],
    ["Rozmowa o rozwoju", "Jak zapytać o potrzeby rozwojowe pracownika?"],
  ],
};

export function AssistantChat({
  fixedScope,
  evidence = [],
  active = true,
  close,
}: {
  fixedScope?: Scope;
  evidence?: Evidence[];
  active?: boolean;
  close?: () => void;
}) {
  const [selectedScope, setScope] = useState<Scope>("periodic");
  const scope = fixedScope ?? selectedScope;
  const [mode, setMode] = useState<Mode>("formal");
  const [drafts, setDrafts] = useState<Record<Scope, string>>({
    periodic: "",
    first: "",
  });
  const question = drafts[scope];
  const [thread, setThread] = useState<Turn[]>([]);
  const [pending, setPending] = useState<{ id: number; phase: Progress }>();
  const [announcement, setAnnouncement] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const request = useRef<AbortController | null>(null);
  const nextId = useRef(0);
  const input = useRef<HTMLTextAreaElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const viewportId = useId();
  const helpId = useId();
  const visibleThread = thread.filter((turn) => turn.scope === scope);
  const lastTurn = visibleThread.at(-1);
  const suggestions = prompts[mode === "formal" ? scope : "conversation"];
  const Heading = fixedScope ? "h2" : "h1";

  useEffect(() => () => request.current?.abort(), []);

  function scrollToLatest() {
    if (viewport.current)
      viewport.current.scrollTop = viewport.current.scrollHeight;
    followLatest.current = true;
    setAtBottom(true);
  }

  useEffect(() => {
    if (active && followLatest.current) scrollToLatest();
  }, [active, thread, scope, pending]);

  function updateTurn(id: number, changes: Partial<Turn>) {
    setThread((current) =>
      current.map((turn) => (turn.id === id ? { ...turn, ...changes } : turn)),
    );
  }

  async function ask(turn: Turn) {
    if (request.current) return;
    const controller = new AbortController();
    const signal = AbortSignal.any([
      controller.signal,
      AbortSignal.timeout(135_000),
    ]);
    request.current = controller;
    followLatest.current = true;
    setPending({ id: turn.id, phase: "searching" });
    setAnnouncement("Szukam odpowiedzi.");
    setThread((current) =>
      current.some(({ id }) => id === turn.id)
        ? current.map((item) => (item.id === turn.id ? turn : item))
        : [...current, turn],
    );
    input.current?.focus();

    let answer = "";
    let sources: Citation[] | undefined;
    let method: Turn["method"];
    let announcement = "Nie udało się uzyskać odpowiedzi.";
    let result: (ChatEvent & { type: "done" }) | undefined;
    try {
      const response = await fetch("/api/asystent", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: chatStreamType },
        signal,
        body: JSON.stringify({
          scope: turn.scope,
          mode: turn.mode,
          question: turn.question,
          previousQuestion: turn.previousQuestion,
          previousAnswer: turn.previousAnswer,
          evidence: turn.mode === "conversation" ? evidence.slice(0, 8) : [],
        }),
      });
      if (response.status === 401 || response.status === 403) {
        updateTurn(turn.id, { notice: "session" });
        announcement = notices.session;
        return;
      }
      if (response.status === 400) {
        updateTurn(turn.id, { notice: "invalid" });
        announcement = notices.invalid;
        return;
      }
      if (
        !response.ok ||
        !response.body ||
        !response.headers.get("content-type")?.startsWith(chatStreamType)
      )
        throw new Error("Brak strumienia odpowiedzi");

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      const reduceMotion = matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      let buffer = "";
      try {
        while (!result) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          let end = buffer.indexOf("\n");
          while (end !== -1 && !result) {
            signal.throwIfAborted();
            const event: ChatEvent = JSON.parse(buffer.slice(0, end));
            buffer = buffer.slice(end + 1);
            if (event.type === "progress")
              setPending({ id: turn.id, phase: event.phase });
            if (event.type === "sources") {
              sources = event.sources;
              method = event.method;
            }
            if (event.type === "text") {
              answer += event.text;
              updateTurn(turn.id, { answer, sources, method });
              if (!reduceMotion)
                await new Promise((resolve) => setTimeout(resolve, 16));
            }
            if (event.type === "done") result = event;
            end = buffer.indexOf("\n");
          }
        }
      } finally {
        reader.releaseLock();
      }
      if (!result) throw new Error("Niepełna odpowiedź");
      if (result.reply.status !== "answered") {
        updateTurn(turn.id, {
          answer: undefined,
          sources: result.reply.sources,
          notice: result.reply.status,
        });
        announcement = notices[result.reply.status];
      } else if (!answer || !sources?.length) {
        throw new Error("Niepełna odpowiedź");
      } else {
        announcement =
          "Odpowiedź jest gotowa. Pod wiadomością znajdziesz źródła.";
      }
    } catch {
      const notice = controller.signal.aborted ? "stopped" : "network";
      updateTurn(turn.id, {
        answer: undefined,
        sources: undefined,
        method: undefined,
        notice,
      });
      announcement = notices[notice];
    } finally {
      if (request.current === controller) {
        request.current = null;
        setPending(undefined);
        setAnnouncement(announcement);
      }
    }
  }

  function send(text: string, clearDraft = true) {
    const asked = text.trim();
    if (asked.length < 5 || asked.length > 1200 || request.current) return;
    const previous = visibleThread.findLast(
      (turn) => turn.mode === mode && turn.answer && !turn.notice,
    );
    if (clearDraft) setDrafts((current) => ({ ...current, [scope]: "" }));
    void ask({
      id: ++nextId.current,
      scope,
      mode,
      question: asked,
      previousQuestion: previous?.question,
      previousAnswer: previous?.answer,
    });
  }

  return (
    <div className="assistant-chat">
      <header className="chat-header">
        <div className="chat-identity">
          <span className="chat-avatar">
            <Sparkles aria-hidden="true" size={21} />
          </span>
          <div>
            <Heading>Asystent Azymutu</Heading>
            <p>
              {fixedScope
                ? scopes[fixedScope]
                : "Przepisy i rozmowy oceniające"}
            </p>
          </div>
        </div>
        {close && (
          <button
            type="button"
            className="chat-icon"
            aria-label="Zamknij asystenta"
            onClick={close}
          >
            <X aria-hidden="true" size={20} />
          </button>
        )}
        {!fixedScope && (
          <div className="chat-scopes" role="group" aria-label="Rodzaj oceny">
            {(["periodic", "first"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={scope === value}
                disabled={!!pending}
                onClick={() => {
                  followLatest.current = true;
                  setScope(value);
                }}
              >
                {scopes[value]}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="chat-body">
        <div
          className="chat-history"
          id={viewportId}
          ref={viewport}
          tabIndex={0}
          role="region"
          aria-label="Wiadomości w rozmowie"
          onScroll={(event) => {
            const { scrollHeight, scrollTop, clientHeight } =
              event.currentTarget;
            followLatest.current = scrollHeight - scrollTop - clientHeight < 48;
            setAtBottom(followLatest.current);
          }}
        >
          {visibleThread.length === 0 ? (
            <div className="chat-welcome">
              <span className="chat-welcome-icon">
                <MessageCircle aria-hidden="true" size={28} />
              </span>
              <h2>W czym mogę Ci pomóc?</h2>
              <p>
                Zapytaj o zasady{" "}
                {scope === "first" ? "pierwszej oceny" : "oceny okresowej"} lub
                przygotuj się do rozmowy z pracownikiem.
              </p>
              <ul className="chat-prompts" aria-label="Przykładowe pytania">
                {suggestions.map(([label, text]) => (
                  <li key={text}>
                    <button type="button" onClick={() => send(text, false)}>
                      <strong>{label}</strong>
                      <ChevronRight aria-hidden="true" size={16} />
                      <span>{text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ol className="chat-turns">
              {visibleThread.map((turn) => (
                <li className="chat-turn" key={turn.id}>
                  <div className="chat-outgoing">
                    <span className="chat-byline">Ty · {modes[turn.mode]}</span>
                    <div className="chat-bubble">{turn.question}</div>
                  </div>
                  <div className="chat-incoming">
                    <span className="chat-avatar">
                      <Sparkles aria-hidden="true" size={15} />
                    </span>
                    <div
                      className="chat-bubble"
                      aria-label="Odpowiedź asystenta"
                    >
                      {pending?.id === turn.id &&
                      !turn.answer &&
                      !turn.notice ? (
                        <div className="chat-waiting">
                          <p>{phases[pending.phase]}</p>
                          <div className="chat-shimmer" aria-hidden="true">
                            <span />
                            <span />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="chat-text">
                            {turn.notice ? notices[turn.notice] : turn.answer}
                          </p>
                          {turn.method === "rule" && (
                            <small className="chat-method">
                              Odpowiedź z reguły i przepisu
                            </small>
                          )}
                          {!!turn.sources?.length && (
                            <Sources
                              sources={turn.sources}
                              fallback={!!turn.notice}
                            />
                          )}
                          {turn.notice === "session" && (
                            <a href="/logowanie">Przejdź do logowania</a>
                          )}
                          {turn.id === lastTurn?.id &&
                            turn.notice &&
                            retryable.has(turn.notice) &&
                            !pending && (
                              <button
                                type="button"
                                className="chat-retry"
                                onClick={() =>
                                  void ask({
                                    ...turn,
                                    answer: undefined,
                                    sources: undefined,
                                    notice: undefined,
                                  })
                                }
                              >
                                <RotateCcw aria-hidden="true" size={15} />{" "}
                                Spróbuj ponownie
                              </button>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
        {!atBottom && (
          <button
            type="button"
            className="chat-latest"
            aria-controls={viewportId}
            onClick={scrollToLatest}
          >
            <ArrowDown aria-hidden="true" size={17} /> Najnowsza wiadomość
          </button>
        )}
      </div>
      <span className="sr-only" role="status">
        {announcement}
      </span>

      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          send(question);
        }}
      >
        <div className="chat-modes" role="group" aria-label="Temat pytania">
          {(["formal", "conversation"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              disabled={!!pending}
              onClick={() => setMode(value)}
            >
              {value === "formal" ? (
                <BookOpen aria-hidden="true" size={15} />
              ) : (
                <MessageCircle aria-hidden="true" size={15} />
              )}
              {modes[value]}
            </button>
          ))}
        </div>
        <div className="chat-input">
          <textarea
            ref={input}
            rows={2}
            maxLength={1200}
            value={question}
            placeholder={
              mode === "formal"
                ? "Zadaj pytanie o zasady oceny…"
                : "O co chcesz zapytać przed rozmową?"
            }
            aria-label="Wiadomość do asystenta"
            aria-describedby={helpId}
            onChange={(event) =>
              setDrafts({ ...drafts, [scope]: event.target.value })
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          {pending ? (
            <button
              type="button"
              className="chat-icon chat-send"
              aria-label="Zatrzymaj odpowiedź"
              title="Zatrzymaj odpowiedź"
              onClick={() => {
                request.current?.abort();
                input.current?.focus();
              }}
            >
              <Square aria-hidden="true" size={17} />
            </button>
          ) : (
            <button
              type="submit"
              className="chat-icon chat-send"
              aria-label="Wyślij wiadomość"
              title="Wyślij wiadomość"
              disabled={question.trim().length < 5}
            >
              <ArrowUp aria-hidden="true" size={20} />
            </button>
          )}
        </div>
        <div className="chat-help" id={helpId}>
          <span>
            {mode === "conversation" && evidence.length > 0
              ? "Czat korzysta z przykładów z tej sprawy. "
              : ""}
            Wpisuj tylko fikcyjne dane.
          </span>
          <span>
            {question.length >= 1100
              ? question.length + "/1200"
              : question.trim().length > 0 && question.trim().length < 5
                ? "Co najmniej 5 znaków"
                : "Enter wysyła · Shift+Enter nowy wiersz"}
          </span>
        </div>
      </form>
    </div>
  );
}

function Sources({
  sources,
  fallback,
}: {
  sources: Citation[];
  fallback: boolean;
}) {
  return (
    <details className="chat-sources">
      <summary>
        <BookOpen aria-hidden="true" size={15} />{" "}
        {fallback ? "Znalezione fragmenty" : "Źródła odpowiedzi"}{" "}
        <span>{sources.length}</span>
      </summary>
      <ul>
        {sources.map((source, index) => (
          <li key={source.id + "-" + index}>
            <strong>
              {source.title} · {source.locator}
            </strong>
            <blockquote>{source.text}</blockquote>
            {source.url && (
              <a href={source.url} target="_blank" rel="noreferrer">
                Otwórz źródło
              </a>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function AssistantPanel({
  scope,
  evidence,
}: {
  scope: Scope;
  evidence: Evidence[];
}) {
  const [open, setOpen] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (open) drawer.current?.querySelector("textarea")?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    launcher.current?.focus();
  }

  return (
    <>
      <button
        ref={launcher}
        type="button"
        className="assistant-fab"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <MessageCircle aria-hidden="true" /> Zapytaj asystenta
      </button>
      <div
        ref={drawer}
        className="chat-drawer"
        id={id}
        hidden={!open}
        role="region"
        aria-label="Asystent"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            close();
          }
        }}
      >
        <AssistantChat
          fixedScope={scope}
          evidence={evidence}
          active={open}
          close={close}
        />
      </div>
    </>
  );
}
