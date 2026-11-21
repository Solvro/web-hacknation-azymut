# Azymut

Prototyp wspiera przełożonego w służbie cywilnej. W przeglądarce można przejść przez dobór kryteriów arkusza B lub C, rozmowę rozpoczynającą z ustaleniem terminów, wybór obserwowanych zachowań, rozmowę oceniającą, decyzje przełożonego i wnioski do indywidualnego programu rozwoju zawodowego. Punktacja pierwszej oceny jest dostępna jako osobny moduł TypeScript z testami.

## Uruchomienie

Wymagane są Node.js ≥22.18, pnpm, Python 3 i oryginalny plik partnera w `materials/Model_kompetencji.xlsx`. Z katalogu repozytorium uruchom:

```sh
pnpm install --frozen-lockfile && pnpm dev
```

Otwórz [localhost:3000](http://localhost:3000). Start i budowanie aplikacji importują model MC. Oryginał arkusza i wygenerowany JSON pozostają poza Git. Testy punktacji uruchamia `pnpm test`, kontrolę typów `pnpm typecheck`, a kompilację produkcyjną `pnpm build`.

## Zakres tej wersji

Stanowiska i ich obowiązki są syntetyczne. Szkic treningowy zapisuje się automatycznie w pamięci sesji karty. Po odświeżeniu wracają wybrany wskaźnik, obserwacje, decyzje i ustalenia rozmowy. Przycisk „Rozpocznij nową ocenę” pozwala usunąć bieżący szkic. Widok podsumowania służy do sprawdzenia wyniku. Zapis spraw na serwerze, konta, oficjalne PDF, panel HR i czat są zaplanowane w [koncepcji](CONCEPT.md).

## Gdzie użyto AI

Claude Code i Codex pomagały opracować koncepcję. Codex pomagał przy implementacji i testach. W tej wersji aplikacja wykonuje obliczenia deterministycznie. Opisy zachowań pochodzą z materiałów MC.
