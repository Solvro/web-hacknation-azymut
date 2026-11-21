"use client";

import { useState } from "react";
import { createAuthClient } from "better-auth/react";
import { Compass } from "lucide-react";

const auth = createAuthClient();
const roles = {
  supervisor: "Przełożony",
  hr: "Kadry",
  admin: "Administrator",
};

export function Login() {
  const [role, setRole] = useState<keyof typeof roles>("supervisor");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <main className="login">
      <div className="brand">
        <Compass aria-hidden="true" /> Azymut
      </div>
      <h1>Zaloguj się do demo</h1>
      <p className="lead">
        Wybierz konto demonstracyjne. Po ponownym zalogowaniu w tej przeglądarce
        wrócisz do tego samego zestawu spraw.
      </p>
      <section>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setFailed(false);
            try {
              const result = await auth.signIn.email({
                email: role + "@azymut.example",
                password,
              });
              if (result.error) throw new Error();
              const response = await fetch("/api/demo", { method: "POST" });
              if (!response.ok) throw new Error();
              window.location.assign(role === "supervisor" ? "/" : "/kadry");
            } catch {
              setFailed(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="field">
            Konto
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as keyof typeof roles)}
            >
              {Object.entries(roles).map(([id, label]) => (
                <option key={id} value={id}>
                  {label} · {id}@azymut.example
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Hasło demonstracyjne
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="primary" disabled={busy}>
            {busy ? "Logowanie…" : "Zaloguj się"}
          </button>
          {failed && (
            <p role="alert">
              Logowanie się nie powiodło. Sprawdź hasło demonstracyjne.
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
