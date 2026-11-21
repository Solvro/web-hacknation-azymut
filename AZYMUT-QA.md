# Azymut: QA wdrożenia (https://azymut.b.solvro.pl)

Stan: 21.11.2026, ok. 18:30. Testowany commit lokalny: `517034d`. **QA niepełne.** Brak hasła kont demo wdrożenia (`AZYMUT_DEMO_PASSWORD`): nie ma go w repo, a hasła nie zgadywano. Przetestowano tylko część dostępną bez logowania.

## Sprawdzone bez logowania (OK)

- `/`, `/kadry` i `/asystent` przekierowują (307) na `/logowanie`.
- `GET /api/do-podpisu` oraz `POST` na `sprawy`, `arkusze`, `asystent`, `obserwacje` i `opis-stanowiska` zwracają 401.
- Błędne hasło zwraca z API `INVALID_EMAIL_OR_PASSWORD`. Formularz tłumaczy ten kod na komunikat po polsku (`src/app/logowanie/login.tsx`).

## Znaleziska

### 1. Niska: `/api/przypomnienia` waliduje dane przed sprawdzeniem sesji ✅ naprawione
- **Rola:** niezalogowany
- **URL:** `POST https://azymut.b.solvro.pl/api/przypomnienia`
- **Kroki:** wyślij bez sesji `POST` z ciałem `{}` i poprawnym `Origin`.
- **Oczekiwane:** 401, tak jak w pozostałych endpointach.
- **Faktyczne:** 400, czyli schemat jest sprawdzany przed autoryzacją. Odpowiedź ujawnia, że dane są niepoprawne, i jest niespójna z innymi trasami.
- **Poprawka:** w `src/app/api/przypomnienia/route.ts` najpierw wywołaj `requireApiRole(request, ["hr","admin","supervisor"])`, potem waliduj dane i na końcu sprawdź rolę dla akcji.

## Niewykonane (wymagają logowania)

- Ponowna weryfikacja na wdrożeniu: zapis oceny okresowej i pierwszej, przypomnienia HR→przełożony, konflikt wersji (409) i pobieranie PDF (B, C, first, report, do podpisu).
- Pełny przebieg dla ról przełożonego, kadr, administratora i kierującego komórką.
- Asystent: cytowanie źródeł, przyznawanie się do niewiedzy i zachowanie przy awarii modelu.
