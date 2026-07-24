FROM node:24-bookworm AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json

RUN npm ci \
    --omit=dev \
    --workspace=@bluepulse/api \
    --include-workspace-root=false \
    && npm cache clean --force


FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app/apps/api

COPY --from=dependencies /app/node_modules /app/node_modules

COPY apps/api/package.json ./package.json
COPY apps/api/src ./src
COPY apps/api/migrations ./migrations

COPY docker/api-entrypoint.sh /usr/local/bin/bluepulse-api-entrypoint

RUN chmod 0755 /usr/local/bin/bluepulse-api-entrypoint \
    && mkdir -p /app/apps/api/storage/media \
    && chown -R node:node /app

USER node

EXPOSE 3001

ENTRYPOINT ["/usr/local/bin/bluepulse-api-entrypoint"]
