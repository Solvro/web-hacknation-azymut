# Azymut: koncepcja

**Azymut** to nasze rozwiązanie zadania „Kompas Kompetencji” (MC, Biuro Dyrektora Generalnego). Azymut to kierunek wyznaczony kompasem: przełożony dostaje jasny kierunek oceny i rozwoju pracownika, opisany konkretnymi zachowaniami.

- Na slajdach: **„Azymut: kompas kompetencji w służbie cywilnej”**.
- Moduły nazywamy **tak jak na grafice partnera** („Kompas Kompetencji: Ścieżki Oceny”): *Rozpocznij ocenę*, *Zakończ ocenę (z zastosowaniem modelu kompetencji)*, *Asystent formalny oceny*, *Asystent rozmowy*, *Analiza opisu stanowiska pracy*. Jury zobaczy w aplikacji własny szkic, tylko że działający. Nie wymyślamy własnych nazw modułów.

> **Od obserwacji do poziomu.** Przełożony ocenia to, co widział, a nie ogólne wrażenie. Azymut pokazuje, co z tego wynika, a decyzję zostawia przełożonemu.

## 1. Dla kogo gramy: jury

Źródło: `../hacknation-mentorzy.md`, sekcja 7 (pliku `hacknation-jury.md` nie ma). Skład jury to hipoteza oparta na stanowiskach.

| Osoba | Kim jest | Co sprawdzi | Czym odpowiadamy | Gdzie to widać |
|---|---|---|---|---|
| **Karolina Wiśniewska**, dyrektor w BDG | autorka książki o ocenach okresowych w administracji, trenerka, przez 8 lat prowadziła oceny w MKiŚ | **poprawność merytoryczną asystenta** (zada trudne pytania o terminy, nieobecności, zmianę przełożonego), jakość rozmowy oceniającej | zestaw ewaluacyjny zbudowany z przypadków brzegowych z poradników; Asystent rozmowy z planem rozmowy, feedbackiem w schemacie **sytuacja–działanie–rezultat** i wnioskami do IPRZ | czat na żywo, slajd z wynikiem ewaluacji |
| **Agnieszka Szymańczak**, naczelniczka Wydz. Rozwoju i Relacji Pracowniczych | prawniczka; równe traktowanie, etyka, przeciwdziałanie dyskryminacji i mobbingowi | czy narzędzie nie utrwala uprzedzeń, czy decyzja zostaje przy człowieku, zgodność z przepisami | **Strażnik języka**: wykrywa w uzasadnieniach etykiety osobowe i odwołania do cech chronionych lub nieobecności usprawiedliwionej; cytaty z § przy każdej regule | ostrzeżenie w uzasadnieniu na demo |
| **Magdalena Laskowska**, naczelnik Wydz. Rekrutacji | adaptacja pracowników, opisy i wartościowanie stanowisk | pierwszą ocenę (nowy pracownik) i pracę z OSP | **Analiza opisu stanowiska**: arkusz B/C z OSP, propozycje kryteriów dodatkowych z cytatem z OSP; ścieżka pierwszej oceny z terminami adaptacji (21 dni, sprawozdanie) | wgranie OSP na demo |
| **Arkadiusz Maliński**, Dep. Cyberbezpieczeństwa | jedyna osoba techniczna: Python, Docker, PostgreSQL, kryptografia | bezpieczeństwo, ochronę danych, realność wdrożenia | model **na infrastrukturze urzędu** (dane nie wychodzą), role i uprawnienia na serwerze, dziennik zdarzeń, pseudonimizacja w promptach, OpenAPI, lista rzeczy do zabezpieczenia przed produkcją | slajd architektury, README |
| mentorzy (Kuchta, Cieślak-Dyjecińska, Kowalczyk) | radcy HR: rozwój zawodowy, szkolenia | codzienną użyteczność | prowadzenie krok po kroku, autozapis, brak zbędnych pól | całe demo |

**Wnioski dla całego projektu:**

1. **Model kompetencji jest ich dziełem.** Opisy 49 wskaźników na 5 poziomach przygotował MC. Pokazujemy je **słowo w słowo**, AI ich nie przepisuje ani nie streszcza. Na pitchu mówimy: „Wasz model, jeden do jednego”.
2. **Mówimy językiem kadr, nie IT.** Na scenie padają słowa „arkusz”, „kryterium”, „rozmowa oceniająca”, „IPRZ”, „sprzeciw”, a nie „RAG”, „embeddingi” czy „pgvector”. Technika trafia na jeden slajd i do README dla Malińskiego.
3. **Poprawność asystenta to najczęściej sprawdzany element.** Treść zadania mówi wprost: „Oceniana będzie poprawność odpowiedzi”, a w jury siedzi autorka książki o ocenach. Na trafność asystenta poświęcamy więcej czasu niż na cokolwiek innego poza ścieżką główną.
4. **Zwycięzca dostaje propozycję umowy na wdrożenie** (pkt 9 treści). Prototyp ma wyglądać jak początek produktu dla MC i innych urzędów, a nie jak gadżet.

## 2. Problem

Przełożony w służbie cywilnej ocenia np. „współpracę” albo „komunikację”. To pojęcia szerokie, więc oceny opierają się na ogólnym wrażeniu, a różni przełożeni interpretują te same kryteria inaczej. Wiedza o procedurze jest rozproszona po ustawie, dwóch rozporządzeniach, poradnikach i formularzach. Do rozmowy z pracownikiem przełożony przygotowuje się zwykle sam.

## 3. Użytkownicy

| Rola | Potrzeba | Co dostaje |
|---|---|---|
| **Przełożony** (główny) | rzetelnie ocenić, wypełnić arkusz, przygotować rozmowę | prowadzony proces, ocena wskaźników, sugerowany poziom, oba asystenty, PDF |
| **Kierujący komórką** | podpisać pierwszą ocenę (wymóg rozporządzenia z 2015 r.) | akceptacja arkusza w aplikacji |
| **HR** | pilnować terminów i spójności ocen, utrzymywać bazę wiedzy | panel statusów i terminów, przypomnienia, rozkład ocen, edycja zestawu pytań i odpowiedzi |
| **Admin** | konta, role, wersje modelu kompetencji | panel administracyjny, stan serwera modelu |

Oceniany nie ma konta w MVP. Dostaje PDF i rozmowę.

## 4. Kryteria → jak je spełniamy

| Kryterium | Waga | Jak je spełniamy | Dowód na demo |
|---|---|---|---|
| Zgodność merytoryczna | 25% | obie ścieżki zgodne z rozporządzeniami; punktacja i terminy liczone deterministycznie (§ 11 rozp. 2016, § 10 rozp. 2015) z testami; 14 kompetencji i 49 wskaźników 1:1 z modelu MC; PDF arkuszy B, C i pierwszej oceny według wzorów | jedna ocena 1 pkt daje ocenę negatywną mimo dobrej średniej, na żywo; PDF obok wzoru z rozporządzenia |
| UX | 25% | układ jak na grafice partnera; krok po kroku; ekran wskaźników z kartami zachowań; sugestia i decyzja wyraźnie od siebie odróżnione; autozapis; skróty klawiszowe; asystent zawsze pod ręką w panelu bocznym | cała ścieżka w niecałe 2 min bez tłumaczenia interfejsu |
| AI | 20% | asystent formalny z cytatami na poziomie § i ust., **sprawdzanymi automatycznie**; odmowa przy braku źródła; asystent rozmowy (plan, feedback, IPRZ, szkic uzasadnienia) oparty tylko na wpisanych przykładach; analiza OSP; **zmierzona trafność** | juror pyta, odpowiedź z klikalnym §; pytanie spoza bazy kończy się odmową; „jaką ocenę mam dać?” kończy się odmową decyzji |
| Innowacyjność i jakość | 20% | Strażnik języka (cechy chronione, etykiety osobowe); strażnicy obiektywności (aureola, świeżość, brak dowodu); weryfikacja cytatów; tryb „samych źródeł” przy awarii modelu; rozkład ocen dla HR | ostrzeżenie Strażnika języka na demo |
| Wdrożenie | 10% | otwarty model na serwerze urzędu (zero kosztów licencji AI, dane nie wychodzą); model wymienny przez `.env`; role na serwerze; OpenAPI; opisane integracje z EZD RP i QNT; model kompetencji i baza wiedzy jako dane edytowane przez HR | slajd architektury, lista „przed produkcją” |

## 5. Ścieżki użytkownika

Ekran startowy odwzorowuje grafikę partnera: dwa duże kafle, **„Pierwsza ocena w służbie cywilnej”** (niebieski) i **„Ocena okresowa w służbie cywilnej”** (fioletowy). Pod nimi lista moich ocen ze statusem i najbliższym terminem.

### Ocena okresowa (ścieżka główna na demo)

| Krok | Etap na grafice | Co robi przełożony | Co robi Azymut |
|---|---|---|---|
| 1 | Analiza opisu stanowiska pracy | wybiera pracownika (dane syntetyczne, „import z kadr” zamockowany) i wgrywa OSP (docx) | **arkusz B lub C wyznacza reguła** z pola „liczba podległych pracowników” w OSP (gdy pole jest nieczytelne, pyta przełożonego); AI proponuje do 3 kryteriów dodatkowych i istotne wskaźniki, **każdą propozycję z cytatem z OSP**; przełożony akceptuje, zmienia albo odrzuca |
| 2 | Rozpocznij ocenę | przeprowadza rozmowę rozpoczynającą | checklista z § 5 ust. 1 (obowiązki z OSP, kryteria, oczekiwania); termin z § 7 liczony automatycznie; Asystent rozmowy przygotowuje plan rozmowy rozpoczynającej; potwierdzenie przeprowadzenia (część I arkusza) |
| 3 | Zakończ ocenę: model kompetencji | ocenia wskaźniki | karty zachowań, przykład S–D–R, „brak podstaw do oceny”, sugerowany poziom liczony na bieżąco (sekcja 6) |
| 4 | Zakończ ocenę: decyzja | wybiera ostateczny poziom każdego kryterium | odchylenie od sugestii o ≥2 poziomy wymaga jednego zdania uzasadnienia (dokumentacja, nie blokada) |
| 5 | Zakończ ocenę: podsumowanie | pisze uzasadnienie, wnioski do IPRZ, opcjonalnie wniosek o stopień | średnia, poziom ogólny, wynik pozytywny lub negatywny (§ 11); uzasadnienie wymagane przy negatywnej; Strażnik języka; szkic uzasadnienia z przykładów (AI, do edycji) |
| 6 | Asystent rozmowy | przygotowuje rozmowę oceniającą | plan rozmowy, pytania otwarte, punkty docenienia, trudne momenty, propozycje działań rozwojowych |
| 7 | Dokumentacja | pobiera PDF | arkusz B lub C według wzoru; status „do zapoznania”; termin sprzeciwu (7 dni, art. 83) liczony od daty zapoznania |

### Pierwsza ocena

Te same ekrany w innej konfiguracji (kafel niebieski):
- 5 stałych elementów (rzetelność, wykorzystywanie wiedzy, organizacja pracy, komunikacja, współpraca), bez kryteriów dodatkowych,
- rozmowa wstępna w ciągu 21 dni od zatrudnienia, termin sprawozdania ocenianego,
- pola: egzamin ze służby przygotowawczej (z wyjątkami z § 10 ust. 3), sprawozdanie złożone w terminie,
- **przeliczenie 5→3** i warunki z § 10 (najwyżej jedna ocena 3 pkt, ocena łączna ≥5),
- akceptacja przez **kierującego komórką** (osobna rola, status „do podpisu”).

## 6. Logika sugerowanego poziomu (deterministyczna)

- Poziom wskaźnika 1–5 odpowiada punktom **1 / 3 / 5 / 7 / 9**.
- **Sugestia dla kryterium** to średnia punktów obserwowanych wskaźników zaokrąglona do najbliższego dozwolonego poziomu. Przy remisie zaokrąglamy w stronę „na poziomie oczekiwań” i pokazujemy to w interfejsie.
- Wzór jest widoczny: „4 z 6 wskaźników obserwowanych, średnia 6,5 → sugestia: powyżej oczekiwań (7 pkt)”.
- **Pewność sugestii:**
  - mniej niż 50% wskaźników obserwowanych: komunikat „za mało podstaw do sugestii”, bez liczby,
  - rozrzut ≥2 poziomów między wskaźnikami: flaga „rozbieżne obserwacje, przejrzyj przykłady”.
- **Pierwsza ocena, przeliczenie 5→3:** poziomy 1–2 → 3 pkt, poziom 3 → 5 pkt, poziomy 4–5 → 7 pkt. To **nasza interpretacja**, w aplikacji opisana jako ustawienie do potwierdzenia z mentorami MC.
- Ocena ogólna i wynik (§ 11 rozp. 2016, § 10 rozp. 2015) to nie sugestia, tylko wynik reguły prawnej z odnośnikiem do przepisu.
- Wszystko jest w `lib/scoring` jako czyste funkcje z testami, w tym na przykładach arkuszy z załączników poradnika.

## 7. Strażnicy (heurystyki, bez AI)

| Strażnik | Reguła | Komunikat | Dla kogo |
|---|---|---|---|
| Efekt aureoli | wszystkie wskaźniki w ≥3 kryteriach na identycznym poziomie | „Czy na pewno wszystkie obszary wyglądają tak samo?” | Wiśniewska |
| Efekt świeżości | ponad 70% przykładów z ostatnich 3 miesięcy okresu | „Większość przykładów pochodzi z końca okresu” | Wiśniewska |
| Brak dowodu | poziom inny niż „na poziomie oczekiwań” bez przykładu | „Dodaj przykład, który uzasadnia ocenę” | wszyscy |
| **Strażnik języka** | słownik (rdzenie wyrazów, bez AI) etykiet osobowych („leniwy”, „roszczeniowa”, „nie nadaje się”) oraz odwołań do cech chronionych i nieobecności usprawiedliwionej (wiek, ciąża, urlop macierzyński, L4, zdrowie, niepełnosprawność, wyznanie, pochodzenie, związki zawodowe) | „To zdanie opisuje cechę lub sytuację osobistą, a nie zachowanie. Opisz konkretną sytuację, działanie i rezultat.” Przycisk „Zaproponuj sformułowanie” (AI, do akceptacji) | Szymańczak |
| Kalibracja (HR) | rozkład ocen według przełożonego i komórki | wykres w panelu HR | HR |

Strażnicy nie blokują zapisu. Ostrzegają i zostawiają ślad w dzienniku.

## 8. AI w produkcie

Dwa asystenty, tak jak na grafice partnera, w panelu bocznym dostępnym z każdego ekranu.

| Funkcja | Wejście | Wyjście | Zabezpieczenia |
|---|---|---|---|
| **Asystent formalny oceny** (czat) | pytanie o zasady | odpowiedź z cytatami `[Rozp. 2016, § 11 ust. 1]`, klikalnymi; klik otwiera źródło z podświetlonym fragmentem | bramka trafności przed modelem (sekcja 9); weryfikacja cytatów po modelu; bez źródła stały komunikat „Nie znajduję tego w bazie wiedzy” i wskazówka, gdzie szukać (HR, Departament Służby Cywilnej KPRM) |
| **Asystent rozmowy** | stan oceny: kryteria, poziomy, przykłady | plan rozmowy, pytania otwarte do słabszych wskaźników, punkty docenienia, trudne momenty, feedback w schemacie S–D–R, działania rozwojowe do IPRZ, szkic uzasadnienia | argumenty **wyłącznie z wpisanych przykładów**, każde zdanie z odnośnikiem do przykładu; dane pracownika pseudonimizowane („Pracownik”) przed wysłaniem do modelu |
| **Analiza opisu stanowiska** | OSP (docx) | propozycje kryteriów dodatkowych i wskaźników z cytatem z OSP | arkusz B/C liczy reguła, nie model; cytat musi występować w OSP dosłownie; treść OSP traktowana jako dane, a nie polecenia (odporność na prompt injection) |
| **Zaproponuj sformułowanie** (Strażnik języka) | zdanie oznaczone przez strażnika | wersja opisująca zachowanie | przełożony akceptuje lub odrzuca; bez akceptacji nic się nie zmienia |
| (P2) **Trening rozmowy** | scenariusz, np. „pracownik nie zgadza się z oceną” | AI w roli pracownika, po rozmowie informacja zwrotna | oznaczone jako symulacja |

**AI nie decyduje o poziomie.** Pytanie typu „jaką ocenę dać Annie?” rozpoznaje reguła (słowa kluczowe) wspierana przez klasyfikację modelu. Asystent odpowiada wtedy: „Nie podejmuję decyzji o ocenie. Z Twoich obserwacji wynika sugestia X (wyliczenie, nie AI). Decyzja należy do Ciebie.” To pokazujemy na demo.

**Dwa rodzaje podpowiedzi, dwa oznaczenia:**
- **„Wyliczenie”** (ikona kalkulatora): sugerowany poziom, wynik oceny, terminy. Liczy reguła, a każdy wynik ma odnośnik do przepisu.
- **„AI”** (ikona iskry): treści wygenerowane przez model, zawsze z podpisem „Wygenerowane przez AI, sprawdź przed użyciem”.

## 9. Baza wiedzy i jakość odpowiedzi

**Źródła** (wszystkie publiczne):

| Dokument | Skąd | Uwagi |
|---|---|---|
| ustawa o służbie cywilnej, wyciąg (rozdz. o ocenach, art. 81–83, 89 i powiązane) | ISAP, aktualny tekst jednolity | **nie ma jej w materiałach**, pobieramy sami; numer Dz. U. tekstu jednolitego do ustalenia |
| rozporządzenie o ocenach okresowych (2016) | materiały | |
| rozporządzenie o pierwszej ocenie (2015) | materiały | |
| model kompetencji MC | materiały (xlsx) | |
| poradniki KPRM: oceny okresowe (2016), pierwsza ocena (2016) | materiały | z numerami stron |
| **zestaw pytań i odpowiedzi** | przygotowujemy sami (treść zadania tego wymaga) | ok. 60 par, każda ze źródłem; edytowalny przez HR w panelu |

**Podział:** ustawa i rozporządzenia po jednostkach redakcyjnych (art., §, ust., pkt), poradniki po podrozdziałach z numerem strony, model po wskaźniku, zestaw pytań i odpowiedzi po parze. Metadane: akt, jednostka, strona, data wersji.

**Przebieg odpowiedzi:**

1. **Wyszukiwanie hybrydowe:** pełnotekstowe Postgresa (konfiguracja `simple` + `unaccent`) i wektorowe (bge-m3, pgvector), połączone przez RRF. Odwołania wprost („§ 5”, „art. 81 ust. 7”) parsujemy regułą i dociągamy dokładną jednostkę.
2. **Bramka przed modelem:** gdy żaden fragment nie przekracza progu trafności, model nie jest w ogóle wołany i pada stały komunikat o braku źródła. Zasada z Rogatki: deterministyczne bramki decydują, AI eskaluje.
3. **Generowanie ustrukturyzowane** (`streamObject`, schemat JSON): `{ status: "odpowiedź" | "brak_źródła", treść, cytaty: [{ id_fragmentu, dosłowny_cytat }] }`.
4. **Weryfikacja cytatów po modelu:** każde `id_fragmentu` musi być wśród wyszukanych, a `dosłowny_cytat` musi występować w fragmencie (po normalizacji białych znaków). Gdy weryfikacja zawiedzie: jedna ponowna próba, potem komunikat o braku pewnego źródła i lista pasujących fragmentów.
5. Odpowiedź zawsze pokazuje cytaty jako klikalne odnośniki.

**Ewaluacja (`pnpm eval`):** ok. 60 pytań z oczekiwaną odpowiedzią i źródłem. Zestaw układamy według spisu treści poradników, z naciskiem na przypadki brzegowe, które zada autorka książki:
- terminy: 24 miesiące, przedłużenie przy nieobecności powyżej miesiąca (art. 81 ust. 7), zmiana stanowiska, przeniesienie do innego urzędu, powołanie na wyższe stanowisko, ponowna ocena po negatywnej,
- kto ocenia przy zmianie przełożonego,
- arkusze A, B i C, kryteria obowiązkowe i dodatkowe, skala, poziom ogólny, uzasadnienie, IPRZ, stopnie służbowe, sprzeciw, skutki dwóch ocen negatywnych,
- pierwsza ocena: służba przygotowawcza i wyjątki, sprawozdanie, warunki oceny pozytywnej, podpisy,
- ok. 10 pytań spoza bazy (oczekiwana odmowa) i 5 prób wymuszenia decyzji o ocenie.

Skrypt liczy trafność odpowiedzi (ocena ręczna na próbie i ocena modelem jako sędzią), trafność cytatu i odsetek poprawnych odmów. **Wynik idzie na slajd**, a zestaw służy też do wyboru modelu (sekcja 10).

## 10. Modele

Wymóg MC: **w aplikacji tylko darmowe AI**. Używamy wyłącznie otwartych modeli uruchamianych u siebie, bez płatnych API i bez darmowych limitów komercyjnych API.

**LLM: wybór po teście na zestawie ewaluacyjnym** (pierwsze 2 h, ten sam prompt i to samo wyszukiwanie):

| Kandydat | Rozmiar w Q4_K_M | Licencja | Za | Przeciw |
|---|---|---|---|---|
| **PLLuM 12B instruct** | ≈7,5 GB | zależy od wariantu: bierzemy wariant na Apache 2.0, **nie `-nc`** (do sprawdzenia na karcie modelu) | polski model rozwijany z inicjatywy **Ministerstwa Cyfryzacji**, bardzo dobra historia dla tego jury | trzymanie się formatu JSON do sprawdzenia |
| **Bielik 11B v2.x instruct** | ≈6,7 GB | Apache 2.0 | najlepsza polszczyzna, sprawdzony w naszych projektach | |
| Qwen3 8B | ≈5 GB | Apache 2.0 | dobre trzymanie się instrukcji i JSON, szybki | słabsza polszczyzna |
| Gemma (12B lub nowsza) | ≈7–8 GB | Gemma Terms | | licencja mniej czytelna dla urzędu; wersję i wymagania Ollamy sprawdzamy na stacji |

**Reguła wyboru:** jeśli PLLuM jest w granicach 5 pkt proc. trafności od najlepszego, bierzemy PLLuM (argument „model MC w narzędziu MC”). W przeciwnym razie bierzemy najlepszego i mówimy o tym otwarcie. Model zapasowy to mniejszy z pozostałych.

**Embeddingi:** bge-m3 (MIT), 1024 wymiary, **na CPU**, a nie na GPU (uzasadnienie w sekcji 11).

**Argument na slajd:** model działa na serwerze urzędu, więc dane pracowników nie wychodzą na zewnątrz, a koszt licencji AI wynosi zero. Model podmienia się w `.env` bez zmian w kodzie. Czat formalny w ogóle nie dostaje danych pracownika.

## 11. Infrastruktura i hosting

Stan na sob 21.11, ok. 13:00, według `../SERVERS.md` i `../solvro-infra-hackathon.md`.

| Element | Gdzie | Zasoby | Uwagi |
|---|---|---|---|
| aplikacja Next.js (obraz `standalone`) | `solvro-stacja-web` przez Coolify, projekt **Hackatony**, środowisko `azymut` | limit 1 GB RAM | domena **`azymut.b.solvro.pl`**, Let's Encrypt automatycznie; build na `solvro-build-server`, żeby nie obciążać produkcji |
| Postgres 17 + pgvector (`pgvector/pgvector:pg17`) | `solvro-stacja-web`, zasób Coolify | limit 1 GB RAM | ta sama ścieżka co działająca baza `dietlownik`; `CREATE EXTENSION vector, unaccent` w migracji |
| embeddingi bge-m3 | osobny kontener Ollama **tylko CPU** na `solvro-stacja-web` | limit 2,5 GB RAM, 4 vCPU | jedno zapytanie to ok. 0,1–0,3 s na 7950X (szacunek); korpus indeksujemy raz przy seedzie |
| LLM | **`solvro-stacja` (10.21.37.1:11434)**, wołany po stronie serwera przez WireGuard | RTX 3060 12 GB lub 3080 10 GB (niepotwierdzone) | **stacja jest teraz nieosiągalna**: bloker nr 1 (sekcja 15); `ollama.b.solvro.pl` zostaje za `solvrovpn-whitelist`, nie wystawiamy Ollamy publicznie |

Nie wdrażamy niczego na `solvro-devops` ani `solvro-wcss`: mają po 1,7 GiB wolnego RAM i już używają swapu.

**Dlaczego embeddingi na CPU:**
1. Zwalniają ok. 1,2 GB VRAM. Na 3080 (10 GB) dopiero wtedy mieści się model 11–12B.
2. **Wyszukiwanie działa nawet wtedy, gdy stacja z GPU padnie.** Dzięki temu mamy uczciwy tryb awaryjny „same źródła” (niżej).

**Budżet VRAM (szacunki, do sprawdzenia przez `ollama ps`):**

| Składnik | RTX 3060 12 GB | RTX 3080 10 GB |
|---|---|---|
| LLM 11–12B Q4_K_M | 6,7–7,5 GB | 6,7–7,5 GB |
| KV cache, kontekst 8k | ≈1,3 GB na slot × 2 sloty | ≈1,3 GB × 1 slot |
| narzut CUDA | ≈0,5 GB | ≈0,5 GB |
| **razem** | **≈10–10,6 GB, mieści się** | **≈8,5–9,3 GB, na styk**; przy problemach Qwen3 8B albo kontekst 6k |

**Ustawienia Ollamy na stacji:** `OLLAMA_KEEP_ALIVE=-1`, `OLLAMA_NUM_PARALLEL=2` (3060) lub `1` (3080), `OLLAMA_MAX_LOADED_MODELS=1`, `num_ctx=8192` w żądaniu. **Uzgodnienie z zespołem OKRES:** oba projekty dzielą jedną kartę, więc muszą używać **tego samego tagu modelu**, inaczej Ollama będzie przeładowywać modele przy każdym żądaniu. Wspólny jest tylko serwer modelu, kod pozostaje osobny.

**Wydajność (szacunek):** na 3060 ok. 25–35 tokenów/s dla 11–12B Q4, czyli odpowiedź na 200–300 tokenów w 8–12 s ze strumieniowaniem (pierwsze słowa po ok. 1–2 s). Na 3080 ok. 1,5–2 razy szybciej. Mierzymy przed 20:00 i wpisujemy do README.

**Kolejka:** semafor w aplikacji równy liczbie slotów. Gdy kilku jurorów pyta naraz, interfejs pokazuje „Asystent odpowiada innej osobie, jesteś w kolejce (1)”, a nie błąd. Przy starcie aplikacja wysyła żądanie rozgrzewające, żeby model był w pamięci.

**Drabina awaryjna (każdy tryb widocznie oznaczony):**

| Poziom | Kiedy | Co widzi użytkownik |
|---|---|---|
| 1. LLM na stacji | normalnie | pełne odpowiedzi z cytatami |
| 2. model zapasowy | główny model nie mieści się albo zawodzi | znacznik „model zapasowy” w stopce asystenta |
| 3. **tryb „same źródła”** | stacja nie odpowiada w 10 s | „Model językowy jest niedostępny. Pokazuję pasujące fragmenty przepisów i odpowiedzi z zestawu pytań.” Wyszukiwanie działa na CPU |
| 4. nagrane odpowiedzi | tylko awaria na scenie | wyłącznie plan B, z banerem „tryb demonstracyjny offline” |

Ścieżka oceny, punktacja i PDF działają bez AI na każdym poziomie. Stan serwera modelu widać w panelu admina i w stopce asystenta.

## 12. Architektura i stack

```
przeglądarka (desktop) ──HTTPS──> azymut.b.solvro.pl (Traefik, Coolify)
                                    │
                    Next.js (App Router, Server Actions + REST /api/v1)
                    ├─ app/            ekrany: start, ścieżki, wskaźniki, podsumowanie, HR, admin
                    ├─ lib/scoring     punktacja, przeliczenia, terminy (czyste funkcje + Vitest)
                    ├─ lib/model       model kompetencji (xlsx → JSON w repo, z wersją)
                    ├─ lib/guards      strażnicy obiektywności i Strażnik języka (słowniki)
                    ├─ lib/rag         podział, indeksowanie, wyszukiwanie hybrydowe, weryfikacja cytatów
                    ├─ lib/osp         parsowanie docx (mammoth), reguła B/C
                    ├─ lib/pdf         arkusze B, C, pierwsza ocena (@react-pdf/renderer, czcionki z PL)
                    └─ api/v1          REST + OpenAPI 3.1 (zod)
                    │            │                         │
       Postgres 17 + pgvector   Ollama CPU: bge-m3     Ollama GPU (solvro-stacja, WireGuard):
       (Drizzle)                (ten sam serwer)       LLM przez API zgodne z OpenAI (Vercel AI SDK)
```

| Warstwa | Wybór | Dlaczego |
|---|---|---|
| frontend | Next.js (aktualna stabilna), TypeScript, Tailwind v4, shadcn/ui, ikony lucide | znany stack zespołu; ikony lucide mają ten sam styl konturowy co grafika partnera |
| baza | Postgres 17 + pgvector, Drizzle, migracje w repo | jedna baza na dane i wektory |
| uwierzytelnianie | Better Auth: e-mail i hasło, sesje w ciasteczkach `httpOnly`, role `przelozony`, `kierujacy`, `hr`, `admin` | konta demo dla jury; w produkcji SSO przez OIDC (AD FS, Entra ID albo Keycloak urzędu) |
| autoryzacja | sprawdzanie na serwerze w każdej akcji: przełożony widzi tylko swoich podwładnych, HR widzi statusy i terminy, ale **nie treść uzasadnień** | minimalizacja dostępu |
| AI | Vercel AI SDK, dostawca zgodny z OpenAI, `LLM_BASE_URL`, `LLM_MODEL`, `EMBED_BASE_URL`, `EMBED_MODEL` w `.env` | model wymienny bez zmian w kodzie |
| PDF | `@react-pdf/renderer` po stronie serwera, czcionka Noto Serif osadzona w pliku | bez Chromium w kontenerze; polskie znaki |
| testy | Vitest dla `lib/scoring`, `lib/guards`, `lib/rag` (weryfikacja cytatów); `pnpm eval` dla asystenta | |
| jakość | `@solvro/config` (ESLint, Prettier), pnpm | |

**Model danych (Drizzle, w skrócie):** `users` (rola), `employees` (imię, nazwisko, stanowisko, komórka, data zatrudnienia, status urzędnik/pracownik; **bez PESEL i adresu**), `positions` (OSP: tekst, liczba podległych), `evaluations` (typ, arkusz, status, okres, terminy), `evaluation_criteria` (obowiązkowe i dodatkowe, uzasadnienie wyboru), `indicator_ratings` (poziom lub „brak podstaw”, przykład S–D–R, data), `criterion_decisions` (sugestia, decyzja, uzasadnienie odchylenia), `evaluation_summary`, `guard_events`, `kb_documents`, `kb_chunks` (`vector(1024)`, jednostka redakcyjna, strona), `faq`, `reminders`, `audit_log`, `competency_model_versions`.

**API dla integracji (opisane, nie wykonane):**
- **QNT / system kadrowy:** import struktury, pracowników, podległości i nieobecności (`POST /api/v1/import/employees`, CSV albo JSON). Nieobecności zasilają liczenie terminów.
- **EZD RP:** eksport podpisanego arkusza PDF z metadanymi JSON do teczki akt osobowych; webhook zmiany statusu oceny.
- Dokumentacja OpenAPI pod `/api/docs`.

## 13. Bezpieczeństwo i dane osobowe

Co jest w prototypie:
- role i uprawnienia sprawdzane na serwerze, nie tylko ukrywane w interfejsie,
- `audit_log`: kto otworzył, zmienił, wyeksportował ocenę,
- minimalizacja: tylko pola z arkusza i przykłady; brak PESEL, adresu, danych zdrowotnych,
- pseudonimizacja przed modelem: imię i nazwisko zastępowane przez „Pracownik”, przełożony przez „Przełożony”; czat formalny nie dostaje danych pracownika,
- LLM nie ma dostępu do bazy ani narzędzi z efektami ubocznymi; treść OSP i przykładów trafia do promptu jako dane w wyraźnych ogranicznikach,
- logi zapytań do modelu bez danych osobowych,
- limit zapytań do asystenta na użytkownika,
- tylko dane syntetyczne, bez sekretów w repo.

**Do zabezpieczenia przed produkcją** (slajd i README): SSO urzędu zamiast haseł; szyfrowanie wolumenu bazy (LUKS) i kopii zapasowych; TLS na odcinku do serwera modelu (dziś WireGuard); polityka retencji (po przekazaniu arkusza do EZD dane robocze usuwane po terminie ustalonym przez urząd); DPIA i rejestr czynności przetwarzania; test penetracyjny; audyt dostępności WCAG 2.1 AA (ustawa o dostępności cyfrowej); kwalifikowany podpis albo podpis w EZD zamiast podpisu na papierze.

## 14. Wygląd

### Zasady

1. **Ciągłość z grafiką partnera.** Jury zaprojektowało szkic: niebieski dla pierwszej oceny, fiolet dla oceny okresowej, zieleń dla „Rozpocznij”, róż dla „Zakończ”, lawendowe tło, ikony konturowe. Bierzemy tę paletę i porządkujemy ją pod dostępność.
2. **Sugestia to obrys, decyzja to wypełnienie.** Sugerowany poziom: przerywana ramka w kolorze podstawowym i etykieta „Sugestia (wyliczenie)”. Decyzja przełożonego: pełne wypełnienie, ikona ✓ i etykieta „Twoja decyzja”. Różnicę widać bez czytania.
3. **Skala bez czerwieni.** Poziomy 1–5 mają jeden odcień fioletu o rosnącym nasyceniu, zawsze z etykietą tekstową. Ocena to rozmowa, a nie alarm. Czerwień jest zarezerwowana dla wyniku negatywnego i błędów, zawsze razem z tekstem i ikoną.
4. **Źródła mają własny kolor** (morski), inny niż AI i inny niż sugestia.
5. **Desktop.** Projekt pod 1280–1920 px, działa od 1024 px. Poniżej 1024 px ekran informuje: „Azymut jest przeznaczony na komputer”, bo zadanie zabrania wersji na smartfony.
6. **WCAG 2.1 AA:** kontrast ≥4,5:1 dla tekstu, pełna obsługa klawiaturą, widoczny fokus, kolor nigdy jako jedyny nośnik informacji.

### Paleta (tokeny shadcn/Tailwind)

| Token | Hex | Rola | Kontrast z bielą |
|---|---|---|---|
| `--ink` | `#1C1A3A` | tekst, nagłówki | ≈16:1 |
| `--muted-foreground` | `#5D5A7A` | tekst pomocniczy | ≈6,5:1 |
| `--background` | `#F7F6FD` | tło aplikacji (lawenda z grafiki) | – |
| `--card` | `#FFFFFF` | karty, panele | – |
| `--border` | `#E4E1F5` | ramki | – |
| `--primary` | `#5B45D6` | ocena okresowa, główne przyciski, marka Azymutu | ≈6,4:1 |
| `--path-first` | `#1F5FCC` (tło `#EAF1FD`) | pierwsza ocena | ≈5,9:1 |
| `--stage-start` | `#1E7F55` (tło `#E8F6EE`) | etap „Rozpocznij ocenę” | ≈5,0:1 |
| `--stage-finish` | `#B4335F` (tło `#FDEBF1`) | etap „Zakończ ocenę”, decyzja | ≈5,9:1 |
| `--source` | `#0F6E7A` (tło `#E6F4F5`) | cytaty i źródła | ≈6,0:1 |
| `--ai` | `#5B45D6` + ikona iskry, tło `#F1EEFD` | treści AI | ≈6,4:1 |
| `--warning` | tekst `#8A5A00` na `#FFF6E0` | strażnicy | ≈5,5:1 na tle |
| `--destructive` | `#B42318` (tło `#FDECEA`) | wynik negatywny, błędy | ≈6,5:1 |

**Skala poziomów** (tła kart, tekst `--ink`, poziom 5 tekst biały):

| Poziom | Etykieta z modelu MC | Tło |
|---|---|---|
| 1 | Znacznie poniżej oczekiwań | `#EEEAFD` |
| 2 | Poniżej oczekiwań | `#D9D1FA` |
| 3 | **Na poziomie oczekiwań** (standard, znacznik „standard”) | `#B7A8F3` |
| 4 | Powyżej oczekiwań | `#8C76E6` |
| 5 | Znacznie powyżej oczekiwań | `#5B45D6` |

Kontrasty liczone ręcznie; przed oddaniem sprawdzamy narzędziem.

### Typografia i elementy

- **Inter** (OFL) w interfejsie, cyfry tabelaryczne (`tabular-nums`) w punktacji. **Noto Serif** w PDF, bo arkusz ma przypominać urzędowy wzór.
- Ikony **lucide**, dobrane do grafiki partnera: `user-star` (pierwsza ocena), `calendar-days` (okresowa), `file-search` (analiza OSP), `play` (rozpocznij), `circle-check` (zakończ), `layers` (model kompetencji), `file-text` (asystent formalny), `messages-square` (asystent rozmowy), `calculator` (wyliczenie), `sparkles` (AI), `book-open` (źródło).
- Logo: róża kompasu, której igła północna tworzy literę „A”, w kolorze `--primary`. Prosty SVG robimy sami.

### Układ ekranów

- **Trzy kolumny:** po lewej kroki ścieżki (stepper z etapami z grafiki i statusem), w środku praca, po prawej zwijany panel asystenta (formalny lub rozmowy, przełączane zakładką). Asystent zna kontekst ekranu, np. na ekranie wskaźników podpowiada pytania o pokazywane kryterium.
- **Ekran wskaźników (serce aplikacji):** jedno kryterium na ekran. Każdy wskaźnik to wiersz 5 kart z opisami zachowań z modelu (pełny tekst, bez skrótów) i szósta opcja „Brak podstaw do oceny”. Pod wybraną kartą rozwija się pole przykładu: sytuacja, działanie, rezultat, data. Na dole przyklejony pasek: sugestia (obrys), decyzja (wypełnienie), flagi pewności. Skróty: `1`–`5` wybór karty, `0` brak podstaw, `↓` następny wskaźnik.
- **Podsumowanie:** podgląd arkusza w układzie wzoru, a obok wynik z odnośnikiem do § 11.
- **Panel HR:** tabela ocen ze statusem, terminem i licznikiem dni, filtry „po terminie”, „w ciągu 14 dni”, przycisk „Wyślij przypomnienie” (zapis w dzienniku, e-mail zamockowany), wykres rozkładu ocen.

## 15. Plan pracy (sob 21.11 → ndz 22.11)

| Kiedy | Co | Kto |
|---|---|---|
| 13:30–14:30 | repo, szkielet Next.js, Drizzle, Better Auth, wdrożenie „hello” na `azymut.b.solvro.pl`; **równolegle: odblokowanie stacji z GPU** | infra + backend |
| 13:30–15:30 | `lib/model` (xlsx → JSON), `lib/scoring` z testami, seed 3 fikcyjnych pracowników na bazie 3 OSP | backend |
| 13:30–15:30 | korpus: ustawa z ISAP, podział jednostkami, indeks; zestaw ~60 pytań; porównanie modeli | AI |
| 14:00–18:00 | ekran startowy, ścieżka okresowa, ekran wskaźników, podsumowanie | frontend |
| 15:30–18:30 | asystent formalny: wyszukiwanie, bramka, `streamObject`, weryfikacja cytatów, tryb „same źródła” | AI |
| 18:00–19:30 | PDF arkusza C i B, panel HR (wersja podstawowa) | backend |
| **do 20:00** | **draft na HackTribe**: nazwa, opis, link do działającej wersji | lider |
| 20:00–02:00 | P1: analiza OSP, asystent rozmowy, strażnicy, Strażnik języka, pierwsza ocena | wszyscy |
| 02:00–07:00 | `pnpm eval`, poprawki trafności, dopracowanie wyglądu, rotacja snu | wszyscy |
| 07:00–10:00 | slajdy (PDF, maks. 10), README, film do 3 min, próba demo z zegarkiem | lider + frontend |
| **do 11:00** | **finalne zgłoszenie**; zamrożenie kodu o 10:30 | lider |

**Bloker nr 1:** stacja z GPU (10.21.37.1) nie odpowiada. Ktoś z fizycznym dostępem musi ją uruchomić **przed 16:00**. Jeśli do 16:00 nie wróci: LLM na laptopie z Apple Silicon lub GPU, połączonym przez WireGuard (do sprawdzenia, czy `solvro-stacja-web` widzi sieć użytkowników 10.21.38.0/24). W międzyczasie budujemy na lokalnej Ollamie na laptopach.

## 16. Zakres MVP

**P0, musi działać do 20:00 (draft) i na demo:**
- ścieżka oceny okresowej (arkusze B i C) od startu do PDF,
- ekran wskaźników z sugestią, decyzją i uzasadnieniem odchylenia,
- asystent formalny z cytatami, weryfikacją cytatów i odmową,
- konta demo dla każdej roli, seed 3 fikcyjnych pracowników.

**P1, do rana:**
- analiza OSP z propozycjami kryteriów,
- Asystent rozmowy (plan, feedback S–D–R, IPRZ, szkic uzasadnienia),
- strażnicy obiektywności i Strażnik języka,
- ścieżka pierwszej oceny z przeliczeniem 5→3 i akceptacją kierującego,
- panel HR (statusy, terminy, przypomnienia jako log),
- `pnpm eval` z wynikiem na slajdzie,
- tryb „same źródła”.

**P2, tylko gdy P1 jest gotowe:**
- trening rozmowy,
- kalibracja w panelu HR,
- OpenAPI z dokumentacją pod `/api/docs`,
- edycja zestawu pytań i odpowiedzi przez HR.

## 17. Poza zakresem

Wersja mobilna (zakazana), arkusz A (nie dotyczy MC), prawdziwe integracje z EZD RP i QNT, e-podpis, konto pracownika, wysyłka e-maili (tylko dziennik), wiele urzędów, notatnik obserwacji z całego okresu (to rdzeń projektu OKRES, nie powielamy go), profilowanie osobowości pracowników.

## 18. Scenariusz demo (≈2 min)

Konto demo: `przelozony@azymut.demo`. Fikcyjna naczelniczka „Ewa Nowicka”, OSP na wzór przykładowego OSP naczelnika.

| Czas | Co pokazujemy | Co mówimy |
|---|---|---|
| 0:00–0:10 | ekran startowy z dwoma kaflami jak na grafice partnera | „To Państwa szkic, tylko działający.” |
| 0:10–0:30 | wgranie OSP → arkusz B (reguła) → 2 kryteria dodatkowe z cytatem z OSP → akceptacja | „Arkusz wybiera reguła z OSP, a AI tylko proponuje kryteria i pokazuje, skąd je wzięło.” |
| 0:30–1:05 | „Zarządzanie ludźmi”: karty zachowań z modelu MC, przykład S–D–R, jeden wskaźnik „brak podstaw”, sugestia w obrysie; przełożony wybiera wyżej i dopisuje zdanie uzasadnienia | „Państwa model, słowo w słowo. Sugestia jest obrysem, decyzja wypełnieniem.” |
| 1:05–1:20 | w uzasadnieniu zdanie „po powrocie z L4 mniej zaangażowana” → Strażnik języka → „Zaproponuj sformułowanie” | „Ocena dotyczy zachowań, nie sytuacji osobistej.” |
| 1:20–1:30 | podsumowanie, jedna ocena 1 pkt daje wynik negatywny (§ 11), PDF arkusza B | |
| 1:30–1:50 | czat: „Co jeśli pracownik był na zwolnieniu przez 3 miesiące?” → odpowiedź z art. 81 ust. 7 i klikalnym cytatem; „Jaką ocenę mam dać?” → odmowa decyzji | „Każde zdanie ma źródło. Gdy źródła nie ma, asystent to mówi.” |
| 1:50–2:00 | panel HR: terminy, przypomnienie | „Ścieżki, terminy i przypomnienia w jednym miejscu.” |

Dane demo przygotowane w seedzie: druga ocena zatrzymana w połowie, żeby w razie problemu przeskoczyć od razu do ekranu wskaźników.

## 19. Prezentacja (PDF, maks. 10 slajdów)

1. Problem: ocena z wrażenia, wiedza rozproszona, rozmowa bez wsparcia.
2. Azymut w jednym zdaniu i zrzut ekranu startowego obok grafiki partnera.
3. Ścieżka oceny okresowej krok po kroku (zrzuty).
4. Model kompetencji: wskaźnik → sugestia → decyzja (wzór sugestii).
5. Asystent formalny: cytaty, weryfikacja, odmowa; **wynik ewaluacji** (trafność, cytaty, odmowy).
6. Asystent rozmowy i Strażnik języka.
7. Pierwsza ocena i panel HR.
8. Architektura i bezpieczeństwo: model na serwerze urzędu, role, minimalizacja, integracje z EZD RP i QNT.
9. Wdrożenie i rozwój: co dalej dla MC i innych urzędów, lista rzeczy do zabezpieczenia przed produkcją.
10. Użycie AI (w produkcie i przy wytwarzaniu), technologie, licencje, zespół.

## 20. Otwarte pytania do mentorów MC

1. Czy przeliczenie 5→3 w pierwszej ocenie odpowiada intencji MC?
2. Sugestia per kryterium (nasze założenie) czy także dla oceny ogólnej?
3. Czy MC ma własny zestaw pytań i odpowiedzi, czy budujemy go sami?
4. Czy HR może widzieć treść uzasadnień, czy tylko statusy (przyjęliśmy: tylko statusy)?
5. Czy MC preferuje konkretny model (np. PLLuM) albo ma serwer z GPU, na którym docelowo działałby Azymut?

## 21. Ryzyka

| Ryzyko | Mitigacja |
|---|---|
| stacja z GPU nie wróci | termin decyzji 16:00; laptop przez WireGuard; tryb „same źródła” działa na CPU |
| asystent odpowie błędnie na pytanie jurora | zestaw z przypadkami brzegowymi, bramka trafności, weryfikacja cytatów, odmowa zamiast zgadywania |
| otwarty model słabszy od komercyjnych | porównanie 3–4 modeli w pierwszych 2 h; odpowiedź tylko z fragmentów; krótki, ścisły prompt |
| 3080 zamiast 3060, za mało VRAM | embeddingi na CPU, 1 slot, Qwen3 8B albo kontekst 6k |
| kilku jurorów naraz plus zespół OKRES na tej samej karcie | wspólny tag modelu, kolejka z komunikatem, rozgrzewanie modelu |
| zbyt szeroki zakres | P0 do 20:00, P1 dopiero po działającym P0, P2 tylko z zapasem czasu |
| przeciążenie produkcji na `solvro-stacja-web` | limity RAM w Coolify, build na build serverze |
