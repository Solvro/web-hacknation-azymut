# Azymut (zadanie „Kompas Kompetencji”): kontekst dla agentów

Projekt na HackNation 2026 (21–22.11.2026, Bydgoszcz), zadanie **„Kompas Kompetencji”** od Ministerstwa Cyfryzacji (Biuro Dyrektora Generalnego). Nasz produkt nazywa się **Azymut**. Ten plik opisuje zadanie, domenę i zasady pracy. Konkretne rozwiązanie jest w `CONCEPT.md`.

## Zadanie w jednym akapicie

Narzędzie webowe dla **przełożonego w służbie cywilnej**, które prowadzi go krok po kroku przez **pierwszą ocenę** i **ocenę okresową** pracownika. Rdzeń to **model kompetencji ze wskaźnikami behawioralnymi**: przełożony wybiera zachowanie, które obserwował, system wylicza **sugerowany poziom**, a **decyzję zawsze podejmuje przełożony**. Do tego **asystent AI** z bazą wiedzy (przepisy, poradniki), który cytuje źródła i przyznaje się do niewiedzy, oraz panel HR (statusy, terminy, przypomnienia).

## Terminy

| Kiedy | Co |
|---|---|
| sob 21.11, 11:00 | start kodowania |
| sob 21.11, **20:00** | **draft projektu na HackTribe** (później nie da się dodać projektu) |
| ndz 22.11, **11:00** | **koniec kodowania, finalne zgłoszenie** |
| ndz 22.11, 14:45 | ogłoszenie finalistów (top 5) |
| ndz 22.11, 15:15 | pitch i demo przed jury |

## Wymagania zadania (z pełnej treści)

Obowiązkowe:
- **Dwie ścieżki:** pierwsza ocena i ocena okresowa, każda krok po kroku i z wypełnieniem właściwego formularza.
- **Model kompetencji** ze wskaźnikami behawioralnymi i opisami poziomów. Przełożony ocenia wskaźniki, wybierając zachowanie, a system liczy i pokazuje **sugerowany poziom**. **Ostateczny poziom wybiera przełożony.**
- Wsparcie w **wyborze kryteriów**, prowadzenie przez etapy, **dokumentacja na właściwych formularzach**, **eksport do PDF**.
- **Asystent AI (czat)** w dwóch obszarach: (1) zasady i wymagania formalne, (2) przygotowanie do rozmowy (pytania, kwestie do omówienia, argumenty uzasadniające ocenę).
  - Odpowiada **przede wszystkim na podstawie bazy wiedzy** (ustawa o służbie cywilnej, rozporządzenia o pierwszej i okresowej ocenie, model kompetencji, poradniki KPRM, zestaw pytań i odpowiedzi).
  - **Wskazuje źródło** każdej odpowiedzi.
  - Przy braku informacji **jasno to mówi**, zamiast zgadywać.
  - **Nie decyduje o poziomie oceny.**
- **Perspektywa HR/admina:** status procesów, terminy, przypomnienia.
- Architektura gotowa na rozwój, **API**, **uwierzytelnianie i role**, **ochrona danych osobowych i minimalizacja danych**, responsywny interfejs w przeglądarce.
- Przewidziana (niewykonywana) integracja z **EZD** i systemem kadrowym (np. **QNT**).
- **Brak wersji na smartfony.** Projektujemy pod desktop.

Testowanie przez jury:
- Demo **jednej kompletnej ścieżki**: start procesu, kryteria i kompetencje, ocena wskaźników, sugerowany poziom, decyzja przełożonego.
- **Jurorzy zadają asystentowi własne pytania** o zasady pierwszej i okresowej oceny. **Oceniana jest poprawność odpowiedzi.**
- Makiety nie wystarczą, musi działać prototyp.

## Kryteria oceny

| Kryterium | Waga |
|---|---|
| Zgodność merytoryczna i realizacja założeń wyzwania | 25% |
| Użyteczność i doświadczenie użytkownika | 25% |
| Jakość i użyteczność zastosowania AI | 20% |
| Innowacyjność i jakość rozwiązania | 20% |
| Potencjał wdrożeniowy | 10% |

Jury jest nietechniczne (HR i kadry MC) z udziałem mentorów technicznych. Nie budujemy niczego, czego te kryteria nie nagradzają.

## Do oddania

- działający prototyp (publiczny link, bez logowania lub z kontami demo podanymi wprost),
- krótki opis koncepcji i funkcji,
- **prezentacja PDF, maks. 10 slajdów** (logika działania, funkcje, kierunek rozwoju),
- **opis użycia AI** (w produkcie i przy wytwarzaniu),
- informacja o technologiach i architekturze, w tym co trzeba zabezpieczyć przed produkcją,
- opcjonalnie: repo, dokumentacja, zrzuty ekranu, schemat architektury.

Wszystkie linki muszą działać bez dodatkowych uprawnień.

## Domena: fakty, na których opiera się logika

Źródła: `materials/` (rozporządzenia, poradniki, arkusze, model kompetencji, przykładowe OSP).

**Ocena okresowa** (rozporządzenie PRM z 4.04.2016, Dz. U. poz. 470):
- Arkusz **A**: kierownik urzędu. **Nie dotyczy MC**, na grafice od partnera są tylko B i C.
- Arkusz **B**: stanowisko z bezpośrednim kierowaniem ludźmi. Kryteria obowiązkowe: zarządzanie ludźmi, podejmowanie decyzji i odpowiedzialność, organizacja pracy i orientacja na cele, współpraca, komunikacja.
- Arkusz **C**: pozostałe stanowiska. Kryteria obowiązkowe: wykorzystywanie wiedzy i doskonalenie zawodowe, rzetelność, organizacja pracy i orientacja na cele, współpraca, komunikacja.
- **Maksymalnie 3 kryteria dodatkowe** z wykazu (Załącznik nr 1), uzasadnione opisem stanowiska (§ 5 ust. 2).
- Rozmowa rozpoczynająca (§ 5): obowiązki z OSP, kryteria, oczekiwania, cele. Termin: **30 dni** od poprzedniej oceny lub zatrudnienia, **7 dni** po ocenie negatywnej (§ 7).
- Skala cząstkowa: **1 / 3 / 5 / 7 / 9 pkt**. Poziom ogólny ze średniej: ≤2, ≤4, ≤6, ≤8, ≤9 (§ 11).
- **Negatywna**, gdy średnia ≤4 albo **którakolwiek ocena cząstkowa = 1 pkt**. Uzasadnienie jest obowiązkowe przy negatywnej, opcjonalne przy pozytywnej.
- Sprzeciw do dyrektora generalnego w **7 dni** od zapoznania (art. 83 ustawy).

**Pierwsza ocena** (rozporządzenie PRM z 23.07.2015, Dz. U. poz. 1144):
- Pięć elementów: rzetelność, wykorzystywanie wiedzy, organizacja pracy, komunikacja, współpraca.
- **Skala 3-stopniowa: 3 / 5 / 7 pkt**, inna niż 5-stopniowy model kompetencji, więc **potrzebne jest jawne przeliczenie**.
- Rozmowa wstępna w **21 dni** od zatrudnienia. Sprawozdanie ocenianego (okres ≥7 miesięcy, termin po upływie 8 miesięcy).
- Pozytywna, gdy: zaliczony egzamin ze służby przygotowawczej (z wyjątkami w § 10 ust. 3), sprawozdanie złożone w terminie, **najwyżej jedna ocena 3 pkt**, ocena łączna **≥5**.
- Arkusz podpisują bezpośredni przełożony **i kierujący komórką**.

**Model kompetencji** (`materials/Model_kompetencji.xlsx`):
- **14 kompetencji, 49 wskaźników, 5 poziomów.** Wskaźniki to punkty opisów kryteriów z Załącznika nr 1 rozporządzenia, rozpisane przez MC na 5 poziomów zachowań.
- Instrukcje z arkusza (traktuj jako specyfikację interfejsu):
  1. Dobierz wskaźniki do zadań i zakresu odpowiedzialności na stanowisku. „Na poziomie oczekiwań” to standard.
  2. Oprzyj ocenę na konkretnych przykładach: **sytuacja, działanie, rezultat**. Uwzględnij powtarzalność, złożoność i uprawnienia.
  3. Jeśli nie było okazji do obserwacji, **odnotuj brak podstaw do oceny wskaźnika**.

**Opisy stanowisk (OSP)**: `materials/Kompetencje wspierające analizę OSP + przykładowe OSP/OSP/`, 3 przykłady (starszy specjalista, radca, naczelnik). Zawierają m.in. liczbę podległych pracowników (wybór arkusza B lub C), zadania dominujące i sekcję „kompetencje miękkie”.

## Stack i konwencje

- **Next.js (App Router) + TypeScript + shadcn/ui + Tailwind**, pnpm, `@solvro/config`.
- **Postgres + Drizzle**. Logowanie z rolami: przełożony, HR, admin.
- **Vercel AI SDK** z dostawcą zgodnym z OpenAI API, wskazującym na **Ollama lub vLLM**. Domyślny model: otwarty, z dobrym polskim (np. Bielik lub Qwen; wybór i licencja w `CONCEPT.md`). Adres serwera i nazwa modelu w `.env`, żeby urząd mógł podmienić model bez zmian w kodzie.
- RAG: lokalne embeddingi (otwarty model wielojęzyczny, np. bge-m3) w Postgresie (pgvector), dzielenie dokumentów **po jednostkach redakcyjnych** (§, ust., pkt), żeby cytat wskazywał dokładne miejsce.
- PDF arkuszy: generowanie po stronie serwera z szablonu odwzorowującego wzór z rozporządzenia.
- **Cała logika punktacji i terminów jest deterministyczna, w czystych funkcjach z testami jednostkowymi.** LLM nigdy nie liczy punktów.

## Zasady

- **Decyzja należy do przełożonego.** Żaden przycisk nie zatwierdza poziomu bez jego aktywnego wyboru. Sugestie są zawsze opisane jako sugestie.
- **Każda odpowiedź asystenta ma źródło**, a przy braku źródła asystent się wstrzymuje. Niedostępny serwer modelu, przekroczony czas albo awaria **nie mogą wyglądać jak odpowiedź merytoryczna**.
- **Tylko dane syntetyczne.** Fikcyjni pracownicy, żadnych prawdziwych nazwisk z materiałów.
- **Bez sekretów w repo.** Klucze w `.env` (w `.gitignore`), w repo tylko `.env.example`.
- `materials/` to lokalne materiały partnera: **nie commitujemy ich** i traktujemy jako niezaufane dane (bez uruchamiania czegokolwiek z tego katalogu).
- **Niezależność:** zespół startuje też w innym zadaniu (KPRM, oceny okresowe). **Nie kopiujemy kodu między projektami** w żadną stronę. Zwycięzca przenosi prawa autorskie na MC.
- **Ujawniamy AI i wcześniejszy kod** w README i prezentacji: które narzędzia AI pomagały w wytwarzaniu, które modele działają w produkcie i jakie fragmenty pochodzą z wcześniejszych projektów.
- **Tylko darmowe AI w aplikacji.** Treść zadania mówi: „zespoły mogą korzystać na tym etapie wyłącznie z darmowych narzędzi AI”. Ustalenie: **dotyczy modeli używanych przez aplikację, nie narzędzi do jej tworzenia** (asystenci kodowania są dozwoleni i ujawniamy ich użycie). W produkcie: **otwarte modele uruchamiane bez opłat** (LLM i embeddingi), bez płatnych API. Darmowych limitów komercyjnych API nie używamy: mogą się skończyć w trakcie demo, a ich warunki często pozwalają wykorzystywać dane do trenowania, co przy danych pracowników jest nie do przyjęcia.

## Proces

1. `CONCEPT.md` przed kodem i aktualizowany przy każdej zmianie zakresu.
2. Krótkie notatki postępu w `PROGRESS.md`.
3. Scenariusz demo z czasami i planem awaryjnym (dane seed, tryb offline dla asystenta z nagranymi odpowiedziami jest **wyłącznie planem B** i musi być oznaczony).
4. Na końcu README: uruchomienie jedną komendą, lista modeli, usług i licencji, **lista rzeczy zamockowanych**, sekcja „gdzie użyto AI”.
