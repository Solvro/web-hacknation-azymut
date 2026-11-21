# Azymut

Prototyp wspiera przełożonego w służbie cywilnej. W przeglądarce można przejść przez dobór kryteriów arkusza B lub C, wybór obserwowanych zachowań, rozmowę i własne decyzje prowadzące do podsumowania. Punktacja pierwszej oceny jest dostępna jako osobny moduł TypeScript z testami.

## Uruchomienie

Wymagane są Node.js ≥22.18, pnpm, Python 3 i oryginalny plik partnera w `materials/Model_kompetencji.xlsx`. Z katalogu repozytorium uruchom:

```sh
pnpm install --frozen-lockfile && pnpm dev
```

Otwórz [localhost:3000](http://localhost:3000). Start i budowanie aplikacji importują model MC. Oryginał arkusza i wygenerowany JSON pozostają poza Git. Testy punktacji uruchamia `pnpm test`, kontrolę typów `pnpm typecheck`, a kompilację produkcyjną `pnpm build`.

## Zakres tej wersji

Stanowiska i ich obowiązki są syntetyczne. Ocenę przechowuje otwarta strona do jej odświeżenia. Widok podsumowania służy do sprawdzenia wyniku. Zapis szkiców, konta, oficjalne PDF, panel HR i czat są zaplanowane w [koncepcji](CONCEPT.md).

## Gdzie użyto AI

Claude Code i Codex pomagały opracować koncepcję. Codex pomagał przy implementacji i testach. W tej wersji aplikacja wykonuje obliczenia deterministycznie. Opisy zachowań pochodzą z materiałów MC.
