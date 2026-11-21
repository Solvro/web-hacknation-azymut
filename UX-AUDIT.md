# Audyt UX Azymutu

| Obszar | Odtworzenie i objaw | Poprawka |
| --- | --- | --- |
| Wejście do demo | Otwórz wdrożenie w czystej sesji. Formularz wymaga hasła bez wskazania, gdzie je znaleźć. Ten sam błąd obejmuje odrzucone dane i awarię otwierania zestawu spraw. | Wskazanie zgłoszenia lub zespołu jako źródła hasła. Na liście są nazwy ról. Komunikat zależy od powodu niepowodzenia. |
| Przykład a szkic | Zmień właściwy szkic, po czym otwórz przykład z ekranu startowego lub panelu bocznego. Przykład zastępuje dotychczasowy zapis w karcie. | Przykład ma osobny adres i automatyczny zapis w karcie. Powrót do własnej oceny przywraca jej treść. Przykład można uruchomić od nowa bez wpływu na własną sprawę. |
| Instrukcja ćwiczenia | Dokończ ocenę szkoleniową. Na podsumowaniu nadal wyświetla się polecenie uzupełnienia obserwacji i wybrania oceny. | Podsumowanie oznacza sprawę szkoleniową. Instrukcja ćwiczenia jest w kroku obserwacji. |
| Przejścia w ocenie okresowej | Z obserwacji spróbuj wrócić do ustaleń rozmowy rozpoczynającej. Brakuje przycisku. Zmiany kroku przewijają stronę, a fokus nadal należy do poprzedniej kontrolki. | Dodano powrót i przeniesienie fokusu na nagłówek kroku. Formularz notatek zachowuje wpisany tekst przy powrocie. |
| Zmiana zakresu | Dodaj obserwację, przykład lub decyzję do kryterium dodatkowego. Zmień zakres i wznów szkic. Walidacja odrzuca zapis z danymi usuniętego kryterium. | Przed usunięciem ocen i przykładów jest potwierdzenie. Surowe notatki zostają jako kwestie do rozmowy. Szkic można wznowić razem z danymi dla zachowanych kryteriów. |
| Asystent | Karta na ekranie głównym obiecuje źródło przy każdej odpowiedzi, choć istnieje osobny stan braku podstaw. | Karta zapowiada odpowiedź opartą na źródłach lub informację o braku podstaw. |
| Pytanie o termin sprzeciwu | Wybierz zakładkę okresowej i przykładowe pytanie o sprzeciw. Bez modelu asystent pokazuje niedostępność, choć ma odpowiedni przepis. | Dokładne pytania o termin sprzeciwu korzystają z oznaczonej reguły również bez modelu, jeśli w bazie jest cytat z art. 83 ust. 1. |
| Pierwsza ocena | Zacznij uzupełniać daty i odśwież, zanim zapiszesz sprawę na serwerze. Wpisane pola znikają. Wyliczone okno złożenia sprawozdania trzeba przepisać ręcznie. | Pierwsza ocena wznawia szkic z tej samej karty, a wyliczone daty można wstawić razem. Formularz wyjaśnia, co jest potrzebne przed przejściem do obserwacji. |

## Regresja automatyczna

- Osobne klucze zapisu sprawy szkoleniowej i własnej dla trybu lokalnego i zalogowanego.
- Ponowny odczyt szkicu po usunięciu kryterium wraz z zachowaniem tekstu notatki i decyzji dotyczącej aktualnego kryterium.
- Przykładowe pytanie o termin sprzeciwu zwraca odpowiedź z cytatem w ścieżce okresowej. Bez właściwego źródła lub w ścieżce pierwszej reguła wstrzymuje się.
