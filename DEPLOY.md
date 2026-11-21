# Wdrożenie Azymutu

Jeden obraz Docker (`Dockerfile`) i baza PostgreSQL z rozszerzeniem pgvector. Model językowy działa poza aplikacją, na serwerze Ollama lub vLLM z API zgodnym z OpenAI.

## Dane spoza repozytorium

Model kompetencji MC i baza wiedzy powstają z materiałów partnera, których nie commitujemy. Obraz ich nie zawiera. Kontener oczekuje w `/app/data` dwóch plików:

- `competencies.json` (z `python3 scripts/import-model.py`),
- `knowledge.json` (z `pnpm knowledge:import`).

Bez nich kontener kończy start z czytelnym komunikatem. Lokalnie:

```sh
docker build -t azymut .
docker run -p 3000:3000 -v "$PWD/data:/app/data:ro" --env-file .env.local azymut
```

## Start kontenera

`docker/entrypoint.sh` sprawdza pliki danych. Jeśli ustawiono `DATABASE_URL` i `AZYMUT_DEMO_PASSWORD`, tworzy schemat i trzy konta demo (`supervisor@`, `hr@`, `admin@azymut.example`); operacja jest idempotentna. Jeśli ustawiono też `AZYMUT_EMBED_URL` i `AZYMUT_EMBED_NAME`, buduje indeks wektorowy. Awaria indeksowania nie blokuje startu, a asystent korzysta wtedy z wyszukiwania tekstowego.

## Zmienne środowiskowe

| Zmienna | Znaczenie |
|---|---|
| `DATABASE_URL` | Postgres z pgvector |
| `BETTER_AUTH_URL` | publiczny adres aplikacji, np. `https://azymut.b.solvro.pl` |
| `BETTER_AUTH_SECRET` | losowy sekret (np. `openssl rand -hex 32`) |
| `AZYMUT_DEMO_PASSWORD` | hasło kont demo, co najmniej 12 znaków |
| `AZYMUT_MODEL_URL`, `AZYMUT_MODEL_NAME` | serwer i model generujący (`/v1`) |
| `AZYMUT_EMBED_URL`, `AZYMUT_EMBED_NAME` | opcjonalnie: model embeddingów (np. `bge-m3`) |

## Coolify (demo hackathonowe)

- Projekt Hackatony, środowisko `hacknation-2026-kguzek`, serwer `solvro-stacja-web`, budowanie na `solvro-build-server`.
- Aplikacja z repo przez GitHub App, build pack `Dockerfile`, port `3000`, healthcheck `GET /logowanie` → 200.
- Baza: PostgreSQL z obrazem `pgvector/pgvector:pg17`.
- Dane: katalog na hoście zamontowany tylko do odczytu pod `/app/data`.
- Model: Ollama na `solvro-stacja`, wołana wyłącznie z sieci wewnętrznej, `gemma4:e4b`.
- Automatyczne wdrożenie po pushu jest wyłączone; wdrożenia uruchamiamy ręcznie.

## Licencje

Obrazy bazowe: `node:22.18.0-alpine` (MIT, Node.js) i `pgvector/pgvector:pg17` (PostgreSQL License). Nie dodano nowych zależności npm.
