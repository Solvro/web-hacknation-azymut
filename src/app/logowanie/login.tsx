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
  const [error, setError] = useState("");
  return (
    <main className="login">
      <div className="brand">
        <Logo />
      </div>
      <h1>Zaloguj się do demo</h1>
      <p className="lead">
        Wybierz rolę i wpisz hasło podane w zgłoszeniu lub przez zespół Azymutu.
        Wszystkie role demonstracyjne korzystają z tego samego hasła.
      </p>
      <section>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            setBusy(true);
            setError("");
            let signedIn = false;
            try {
              const result = await auth.signIn.email({
                email: role + "@azymut.example",
                password,
              });
              if (result.error) {
                setError(
                  result.error.code === "INVALID_EMAIL_OR_PASSWORD"
                    ? "Sprawdź hasło demonstracyjne i spróbuj ponownie."
                    : result.error.status === 429
                      ? "Za dużo prób logowania. Odczekaj minutę i spróbuj ponownie."
                      : "Logowanie jest chwilowo niedostępne. Spróbuj ponownie za chwilę.",
                );
                return;
              }
              signedIn = true;
              const response = await fetch("/api/demo", { method: "POST" });
              if (!response.ok) throw new Error();
              window.location.assign(roleHome(role));
            } catch {
              setError(
                signedIn
                  ? "Nie udało się otworzyć zestawu spraw demo. Spróbuj ponownie za chwilę."
                  : "Logowanie jest chwilowo niedostępne. Spróbuj ponownie za chwilę.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="field">
            Konto
            <select
              value={role}
              disabled={busy}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {Object.entries(roleLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
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
              disabled={busy}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="primary" disabled={busy}>
            {busy ? "Logowanie…" : "Zaloguj się"}
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
      </section>
    </main>
  );
}
