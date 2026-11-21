"use client";

import { useState } from "react";
import { AssistantChat, type Scope } from "../assistant-panel";

const examples: Record<Scope, string[]> = {
  periodic: [
    "Ile kryteriów dodatkowych mogę wybrać?",
    "Kiedy ocena okresowa jest negatywna?",
    "Ile dni ma pracownik na sprzeciw?",
  ],
  first: [
    "Kiedy pierwsza ocena jest pozytywna?",
    "Do kiedy trzeba przeprowadzić rozmowę wstępną?",
    "Kto podpisuje arkusz pierwszej oceny?",
  ],
};

export function StandaloneAssistant() {
  const [scope, setScope] = useState<Scope>("periodic");
  return (
    <section>
      <div className="segmented" role="group" aria-label="Rodzaj oceny">
        <span>Pytam o:</span>
        <button
          type="button"
          aria-pressed={scope === "periodic"}
          onClick={() => setScope("periodic")}
        >
          Ocenę okresową
        </button>
        <button
          type="button"
          aria-pressed={scope === "first"}
          onClick={() => setScope("first")}
        >
          Pierwszą ocenę
        </button>
      </div>
      <AssistantChat
        key={scope}
        scope={scope}
        evidence={[]}
        suggestions={examples[scope]}
      />
    </section>
  );
}
