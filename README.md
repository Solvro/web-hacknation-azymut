# Azymut

Prototyp wspiera przełożonego w służbie cywilnej. W przeglądarce można przejść przez dobór kryteriów arkusza B lub C, rozmowę rozpoczynającą z ustaleniem terminów, wybór obserwowanych zachowań, rozmowę oceniającą, decyzje przełożonego i wnioski do indywidualnego programu rozwoju zawodowego. Pierwsza ocena ma własną ścieżkę, dostępną z nagłówka. Po skonfigurowaniu bazy można zapisać sprawę obu ścieżek na serwerze.

## Uruchomienie

Wymagane są Node.js ≥22.18, pnpm, Python 3 i oryginalny plik partnera w `materials/Model_kompetencji.xlsx`. Z katalogu repozytorium uruchom:

```sh
pnpm install --frozen-lockfile && pnpm dev
```

Otwórz [localhost:3000](http://localhost:3000). Start i budowanie aplikacji importują model MC. Oryginał arkusza i wygenerowany JSON pozostają poza Git. Testy punktacji uruchamia `pnpm test`, kontrolę typów `pnpm typecheck`, a kompilację produkcyjną `pnpm build`.

## Zakres tej wersji

Stanowiska i ich obowiązki są syntetyczne. Szkic okresowej zapisuje się automatycznie w pamięci sesji karty. Po odświeżeniu wracają wybrany wskaźnik, obserwacje, decyzje i ustalenia rozmowy. Przycisk „Rozpocznij nową ocenę” pozwala usunąć bieżący szkic. Z podsumowania można pobrać arkusz B, C lub pierwszej oceny w PDF z danymi demonstracyjnymi i miejscami na podpis. PDF odwzorowuje główne części wzorów. Przełożony może dołączyć umotywowany wniosek o kolejny stopień służbowy do pozytywnej oceny urzędnika. W pierwszej ocenie dostępny jest również formularz sprawozdania. Noto Sans jest dołączony na licencji OFL. W trybie z bazą przełożony zapisuje sprawy, a HR widzi status i termin oraz wysyła przypomnienia. Administrator widzi też dziennik czynności.

## Konta i panel kadr

W `.env.local` ustaw `DATABASE_URL`, `BETTER_AUTH_URL` zgodny z adresem aplikacji, losowy `BETTER_AUTH_SECRET` (minimum 32 znaki) oraz `AZYMUT_DEMO_PASSWORD` (minimum 12 znaków). Uruchom `pnpm db:setup`. Formularz logowania udostępnia cztery fikcyjne konta z jednym skonfigurowanym hasłem. Przycisk „Zmień konto” pozwala wysłać przypomnienie w roli HR i odebrać je jako przełożony w tej samej przeglądarce. Kierujący komórką może pobrać ukończoną pierwszą ocenę do podpisu. Do monitorowania trafiają sprawy po kliknięciu „Zapisz sprawę”. Bez DATABASE_URL dostępny jest lokalny tryb przełożonego.

## Asystent

Uruchom `pnpm knowledge:import` z zainstalowanym uv i dokumentami z katalogu `materials/`. W `.env.local` ustaw `AZYMUT_MODEL_URL` (np. `http://127.0.0.1:11434/v1`) i `AZYMUT_MODEL_NAME` (np. `gemma4:e4b`). Prototyp zakłada prywatny serwer Ollama lub vLLM z otwartym modelem. Bez działającego modelu aplikacja zgłasza awarię i pokazuje pasujące źródła.

Do wyszukiwania wektorowego ustaw `AZYMUT_EMBED_URL` i `AZYMUT_EMBED_NAME=bge-m3` oraz użyj PostgreSQL z rozszerzeniem pgvector. Po imporcie uruchom `pnpm knowledge:index`. Wyszukiwanie łączy dopasowanie tekstowe z podobieństwem wektorowym. Dla czterech jednoznacznych pytań o warunki z rozporządzeń asystent pokazuje oznaczoną odpowiedź z reguły i cytat. Pozostałe pytania obsługuje model. Bez indeksu lub dostępnego endpointu embeddingów działa wyszukiwanie tekstowe.

Do samodzielnego sprawdzianu użyj `AZYMUT_EVAL_URL=http://127.0.0.1:3000 pnpm eval` na uprawnionej instancji testowej. Gdy instancja wymaga logowania, podaj w prywatnym środowisku procesu `AZYMUT_EVAL_COOKIE` z aktywnej sesji przełożonego. Skrypt sprawdza podstawowe elementy odpowiedzi i oczekiwane jednostki redakcyjne. Wyniki wymagają też oceny merytorycznej.

- Gemma 4 E4B generuje odpowiedzi. Wagi bazowe są na Apache 2.0. [Karta Gemma 4 E4B](https://huggingface.co/google/gemma-4-E4B-it)
- BGE-M3 generuje wektory dla wyszukiwarki. Wagi są na MIT. [Karta BGE-M3](https://huggingface.co/BAAI/bge-m3)

## Uruchomienie z PostgreSQL w Dockerze

Uzupełnij w `.env.local` wartości `BETTER_AUTH_SECRET`, `AZYMUT_DEMO_PASSWORD` oraz `AZYMUT_POSTGRES_PASSWORD` (losowe hasło złożone ze znaków szesnastkowych). Przygotuj model i korpus przez `pnpm knowledge:import`. Compose montuje wygenerowany katalog `data/` tylko do odczytu. Dostęp do tych plików na serwerze wymaga uzgodnienia z partnerem.

```sh
docker compose --env-file .env.local up -d --build
```

Compose udostępnia aplikację pod `http://localhost:3000` i uruchamia PostgreSQL z pgvector w sieci kontenerów. Adres Ollamy lub vLLM musi być osiągalny z kontenera. Jeśli model działa na tym samym komputerze z Docker Desktop, użyj adresu `host.docker.internal` i udostępnij usługę dla sieci kontenerów. Przy starcie kontener tworzy konta demo i opcjonalnie odświeża indeks wektorowy. Konfigurację Coolify opisuje [DEPLOY.md](DEPLOY.md). Przy wdrożeniu przez HTTPS ustaw `BETTER_AUTH_URL` na publiczny adres aplikacji.

## Interfejs HTTP

W konfiguracji z bazą operacje zapisujące wymagają sesji Better Auth, roli oraz zgodnego nagłówka `Origin`. Zapis sprawy sprawdza numer rewizji i zwraca `409`, jeśli od czasu odczytu inną wersję zapisano na serwerze.

- `POST /api/sprawy` zapisuje `{kind, revision, draft}` przełożonego. Rodzaj to `periodic` lub `first` i odpowiada schematowi szkicu w `src/lib/drafts`.
- `POST /api/przypomnienia` przyjmuje `{kind, action}`. Akcję `send` wykonuje HR lub administrator. Akcję `read` wykonuje przełożony.
- `POST /api/arkusze` generuje PDF z użyciem schematu w `src/lib/pdf`. Dozwolone formularze to `B`, `C`, `first` i `report`.
- `GET /api/do-podpisu` zwraca kierującemu komórką PDF ukończonej pierwszej oceny z jego zestawu spraw.
- `POST /api/asystent` przyjmuje `{scope, mode, question, previousQuestion?, evidence?}`. Dopuszczalne tryby to `formal` i `conversation`. Odpowiedź zawiera status i, przy odpowiedzi merytorycznej, treść oraz źródła. Awaria modelu ma status HTTP `503` i osobny komunikat.

Przyszła integracja z QNT obejmuje import pracownika, stanowiska oraz przypisania przełożonego. EZD ma otrzymywać podpisany PDF i metadane sprawy. Przed użyciem z prawdziwymi danymi potrzebna jest tożsamość służbowa, uprawnienia per jednostka, polityka retencji, kopie zapasowe, audyt bezpieczeństwa oraz dopuszczenie wersji arkuszy do obiegu przez urząd.

## Gdzie użyto AI

Claude Code i Codex pomagały opracować koncepcję. Codex pomagał przy implementacji i testach. Model generuje objaśnienia proceduralne i propozycje pytań do rozmowy na podstawie źródeł. Punktacja i terminy są obliczane deterministycznie. Opisy zachowań pochodzą z materiałów MC.
