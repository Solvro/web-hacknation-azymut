# Obraz produkcyjny Azymutu (Next.js). Pliki z materiałów partnera
# (data/competencies.json, data/knowledge.json) nie trafiają do obrazu:
# montuje się je w czasie działania pod /app/data.
FROM node:22.18.0-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
# Strony czytają dane w czasie żądania (force-dynamic), więc build nie
# potrzebuje modelu MC. Pomijamy import z xlsx, którego nie ma w repo.
RUN pnpm exec next build --webpack && pnpm prune --prod

FROM node:22.18.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/next.config.mjs ./
COPY --from=build --chown=node:node /app/assets ./assets
COPY --from=build --chown=node:node /app/db ./db
COPY --from=build --chown=node:node /app/scripts ./scripts
COPY --from=build --chown=node:node /app/src/lib ./src/lib
COPY --chown=node:node docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN mkdir -p data && chown node:node data && chmod +x /usr/local/bin/entrypoint.sh
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=6 \
  CMD wget -qO- http://127.0.0.1:3000/logowanie >/dev/null || exit 1
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node_modules/.bin/next", "start"]
