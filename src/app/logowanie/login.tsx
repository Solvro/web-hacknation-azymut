"use client";

import { roleLabels, roleHome, type Role } from "../../lib/roles";
import { useState } from "react";
import { createAuthClient } from "better-auth/react";
import { Logo } from "../logo";

const auth = createAuthClient();

export function Login() {
  const [role, setRole] = useState<Role>("supervisor");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <main className="login">
      <div className="brand">
        <Logo />
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
              window.location.assign(roleHome(role));
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
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {Object.entries(roleLabels).map(([id, label]) => (
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
