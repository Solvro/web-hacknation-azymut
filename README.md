# Azymut

Prototyp wspiera przełożonego w służbie cywilnej. W przeglądarce można przejść przez dobór kryteriów arkusza B lub C, rozmowę rozpoczynającą z ustaleniem terminów, wybór obserwowanych zachowań, rozmowę oceniającą, decyzje przełożonego i wnioski do indywidualnego programu rozwoju zawodowego. Pierwsza ocena ma własną ścieżkę, dostępną z nagłówka. Po skonfigurowaniu bazy można zapisać sprawę obu ścieżek na serwerze.

## Uruchomienie

Wymagane są Node.js ≥22.18, pnpm, Python 3 i oryginalny plik partnera w `materials/Model_kompetencji.xlsx`. Z katalogu repozytorium uruchom:

```sh
pnpm install --frozen-lockfile && pnpm dev
```

Otwórz [localhost:3000](http://localhost:3000). Start i budowanie aplikacji importują model MC. Oryginał arkusza i wygenerowany JSON pozostają poza Git. Testy punktacji uruchamia `pnpm test`, kontrolę typów `pnpm typecheck`, a kompilację produkcyjną `pnpm build`.

## Zakres tej wersji

Stanowiska i ich obowiązki są syntetyczne. Szkic treningowy zapisuje się automatycznie w pamięci sesji karty. Po odświeżeniu wracają wybrany wskaźnik, obserwacje, decyzje i ustalenia rozmowy. Przycisk „Rozpocznij nową ocenę” pozwala usunąć bieżący szkic. Z podsumowania można pobrać arkusz B, C lub pierwszej oceny w PDF z danymi demonstracyjnymi i miejscami na podpis. PDF odwzorowuje główne części wzorów. Wniosek o kolejny stopień służbowy pozostaje poza zakresem eksportu prototypu. Noto Sans jest dołączony na licencji OFL. W trybie z bazą przełożony zapisuje sprawy, a HR widzi status i termin oraz wysyła przypomnienia. Administrator widzi też dziennik czynności.

## Konta i panel kadr

W `.env.local` ustaw `DATABASE_URL`, `BETTER_AUTH_URL` zgodny z adresem aplikacji, losowy `BETTER_AUTH_SECRET` (minimum 32 znaki) oraz `AZYMUT_DEMO_PASSWORD` (minimum 12 znaków). Uruchom `pnpm db:setup`. Formularz logowania udostępnia trzy fikcyjne konta z jednym skonfigurowanym hasłem. Przycisk „Zmień konto” pozwala wysłać przypomnienie w roli HR i odebrać je jako przełożony w tej samej przeglądarce. Do monitorowania trafiają sprawy po kliknięciu „Zapisz sprawę”. Bez DATABASE_URL dostępny jest lokalny tryb przełożonego.

## Asystent

Uruchom `pnpm knowledge:import` z zainstalowanym uv i dokumentami z katalogu `materials/`. W `.env.local` ustaw `AZYMUT_MODEL_URL` (np. `http://127.0.0.1:11434/v1`) i `AZYMUT_MODEL_NAME` (np. `qwen3:8b`). Prototyp zakłada prywatny serwer Ollama lub vLLM z otwartym modelem. Bez działającego modelu aplikacja zgłasza awarię i pokazuje pasujące źródła.

Do wyszukiwania wektorowego ustaw `AZYMUT_EMBED_URL` i `AZYMUT_EMBED_NAME=bge-m3` oraz użyj PostgreSQL z rozszerzeniem pgvector. Po imporcie uruchom `pnpm knowledge:index`. Wyszukiwanie łączy dopasowanie tekstowe z podobieństwem wektorowym. Bez indeksu lub dostępnego endpointu embeddingów działa wyszukiwanie tekstowe.

## Gdzie użyto AI

Claude Code i Codex pomagały opracować koncepcję. Codex pomagał przy implementacji i testach. Model generuje objaśnienia proceduralne i propozycje pytań do rozmowy na podstawie źródeł. Punktacja i terminy są obliczane deterministycznie. Opisy zachowań pochodzą z materiałów MC.
