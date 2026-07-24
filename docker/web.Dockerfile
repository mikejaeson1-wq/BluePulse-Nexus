FROM node:24-bookworm AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json

RUN npm ci

COPY . .

ENV VITE_DATA_MODE=api
ENV VITE_PAGE_DATA_MODE=api
ENV VITE_MEDIA_DATA_MODE=api
ENV VITE_API_BASE_URL=/api
ENV VITE_APP_VERSION=0.3.0-alpha.0

RUN npm run test:web \
    && npm run build


FROM caddy:2.11-alpine AS runtime

COPY docker/Caddyfile.local /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 80
