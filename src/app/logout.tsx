"use client";

import { useState } from "react";
import { createAuthClient } from "better-auth/react";

const auth = createAuthClient();
export function Logout() {
  const [failed, setFailed] = useState(false);
  return (
    <>
      <button
        onClick={async () => {
          setFailed(false);
          try {
            const result = await auth.signOut();
            if (result.error) throw new Error();
            window.location.assign("/logowanie");
          } catch {
            setFailed(true);
          }
        }}
      >
        Zmień konto
      </button>
      {failed && <small role="alert">Wylogowanie się nie powiodło.</small>}
    </>
  );
}
