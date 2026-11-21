# Postęp Azymutu

- 21 listopada — przegląd koncepcji na podstawie zadania, obu regulaminów, materiałów MC i wzorów arkuszy. Poprawiono kolejność rozmowy i oceny, reguły sugestii, priorytety MVP, zakres panelu HR, próbę samodzielną jury i plan finału. Dodano do ignorowanych materiałów tekst jednolity ustawy (Dz.U. 2026 poz. 590).
- Endpoint stacji Ollama nie odpowiedział na próbę połączenia. Host zapasowy i odpowiedź z poziomu wdrożonej aplikacji pozostają do potwierdzenia. Harmonogram, próby odbioru i wyniki planowane są opisane w CONCEPT.md. Repo na tym etapie zawiera koncepcję.
- 21 listopada — pierwsza implementacja punktacji okresowej B/C w TypeScript. Obejmuje wybór kryteriów, sugestię z zachowań i wynik z decyzji przełożonego. Testy uruchamia się przez `pnpm test` na Node.js ≥22.18.
- 21 listopada — dodano punktację pierwszej oceny, jawne przeliczenie sugestii na skalę 3/5/7 oraz testy warunków wyniku i wyjątków egzaminacyjnych. Status sprawozdania jest wejściem do punktacji.
- 21 listopada — importer modelu MC sprawdza kompletność 14 kompetencji, 49 wskaźników i pięciu opisów na wskaźnik. Dane generuje lokalnie w ignorowanym katalogu data.
