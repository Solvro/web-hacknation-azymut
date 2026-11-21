# Postęp Azymutu

- 21 listopada — przegląd koncepcji na podstawie zadania, obu regulaminów, materiałów MC i wzorów arkuszy. Poprawiono kolejność rozmowy i oceny, reguły sugestii, priorytety MVP, zakres panelu HR, próbę samodzielną jury i plan finału. Dodano do ignorowanych materiałów tekst jednolity ustawy (Dz.U. 2026 poz. 590).
- Endpoint stacji Ollama nie odpowiedział na próbę połączenia. Host zapasowy i odpowiedź z poziomu wdrożonej aplikacji pozostają do potwierdzenia. Harmonogram, próby odbioru i wyniki planowane są opisane w CONCEPT.md. Repo na tym etapie zawiera koncepcję.
- 21 listopada — pierwsza implementacja punktacji okresowej B/C w TypeScript. Obejmuje wybór kryteriów, sugestię z zachowań i wynik z decyzji przełożonego. Testy uruchamia się przez `pnpm test` na Node.js ≥22.18.
- 21 listopada — dodano punktację pierwszej oceny, jawne przeliczenie sugestii na skalę 3/5/7 oraz testy warunków wyniku i wyjątków egzaminacyjnych. Status sprawozdania jest wejściem do punktacji.
- 21 listopada — importer modelu MC sprawdza kompletność 14 kompetencji, 49 wskaźników i pięciu opisów na wskaźnik. Dane generuje lokalnie w ignorowanym katalogu data.
- 21 listopada — działa pierwsza ścieżka przeglądarkowa oceny okresowej B/C: syntetyczny OSP, wybór kryteriów, obserwacje z modelu MC, przykłady, potwierdzenie rozmowy, jawne decyzje i podsumowanie. W Chrome sprawdzono przypadek negatywny z uzasadnieniem dla B, pozytywny dla C i ponowny wybór decyzji po zmianie obserwacji. Przeszły kompilacja produkcyjna, kontrola typów i 13 testów punktacji. Stan jest na razie przechowywany w pamięci otwartej strony.
- 21 listopada — dodano rozmowę rozpoczynającą dla B/C z obowiązkami, kryteriami, oczekiwaniami, celami i terminem oceny pisemnej. Ustalenia są dostępne przy rozmowie oceniającej i w podsumowaniu.
- 21 listopada — szkic okresowej B/C wznawia się po odświeżeniu w tej samej karcie. Odczyt sprawdza wersję modelu, wybrane kryteria, wskaźnik i kompletność wyniku. Użytkownik może rozpocząć nową ocenę po potwierdzeniu.
- 21 listopada — dodano wymagane wnioski do indywidualnego programu rozwoju zawodowego w obu arkuszach okresowych. Starsze podsumowania bez tego pola wracają do uzupełnienia z zachowaniem decyzji.
- 21 listopada — ekran obserwacji i etap decyzji wyjaśniają sugestię dla każdego kryterium: wskazują wybrane zachowania, pominięte wskaźniki, średnią, rozstrzygnięcie remisu lub powód braku sugestii.
- Dodano ścieżkę pierwszej oceny z terminami, sprawozdaniem, egzaminem, obserwacjami i decyzjami w skali 3/5/7.
- Dodano serwerowy eksport PDF pierwszej oceny oraz arkuszy B/C, z walidacją danych i ponownym obliczeniem wyniku na serwerze.
- Asystent zasad i rozmowy korzysta z indeksu lokalnych materiałów i sprawdza wszystkie cytaty przed pokazaniem odpowiedzi. Ekran rozróżnia brak podstawy, niepoprawne cytaty i awarię modelu.
- Konta demonstracyjne przełożonego, HR i administratora korzystają z Better Auth oraz PostgreSQL. Po zmianie roli przeglądarka zachowuje identyfikator zestawu spraw. Zestawy są odizolowane między sesjami demonstracyjnymi.
- Sprawy obu ścieżek zapisują się w PostgreSQL z kontrolą wersji. Kadry widzą etapy i terminy oraz wysyłają przypomnienia. Przełożony odbiera je w sprawie, a administrator przegląda dziennik czynności.
- Indeks 240 fragmentów można załadować do pgvector przy użyciu lokalnego modelu bge-m3. Sprawdzono zapis, ponowne indeksowanie i zapytanie kosinusowe na prawdziwym pgvector z kontrolowanym endpointem embeddingów.
- Dodano kalkulator 30 i 7 dni na czynności rozpoczynające, standardowy cykl, przedłużenie przy ciągłej usprawiedliwionej nieobecności oraz terminy od daty zapoznania. HR widzi zapisany status zapoznania z oceną.
