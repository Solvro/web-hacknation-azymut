#!/bin/sh
set -eu

for file in competencies.json knowledge.json; do
  if [ ! -s "data/$file" ]; then
    echo "Brakuje /app/data/$file (zamontuj katalog z danymi modelu MC i bazy wiedzy)." >&2
    exit 1
  fi
done

if [ -n "${DATABASE_URL:-}" ] && [ -n "${AZYMUT_DEMO_PASSWORD:-}" ]; then
  node scripts/setup-db.mjs
fi

if [ -n "${DATABASE_URL:-}" ] && [ -n "${AZYMUT_EMBED_URL:-}" ] && [ -n "${AZYMUT_EMBED_NAME:-}" ]; then
  node scripts/index-knowledge.mjs || echo "Indeksowanie wektorowe nie powiodło się; asystent użyje wyszukiwania tekstowego." >&2
fi

exec "$@"
