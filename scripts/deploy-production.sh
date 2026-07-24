#!/bin/sh

set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_directory/.." && pwd)

environment_path="${BLUEPULSE_ENV_FILE:-$project_root/.env.production}"
backup_environment_path="${BLUEPULSE_BACKUP_ENV_FILE:-$project_root/.env.backup}"
compose_path="$project_root/compose.production.yaml"
backup_compose_path="$project_root/compose.backup.yaml"

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker wurde nicht gefunden." >&2
    exit 1
fi

if [ ! -f "$environment_path" ]; then
    echo "Die Datei .env.production wurde nicht gefunden." >&2
    exit 1
fi

if [ ! -f "$backup_environment_path" ]; then
    echo "Die Datei .env.backup wurde nicht gefunden." >&2
    echo "Zuerst ./scripts/initialize-backup-env.sh ausfuehren." >&2
    exit 1
fi

if grep -q "CHANGE_ME" "$environment_path"; then
    echo "Die Produktionskonfiguration enthaelt noch CHANGE_ME-Platzhalter." >&2
    exit 1
fi

if command -v node >/dev/null 2>&1; then
    node "$script_directory/validate-production-env.mjs" "$environment_path"
    node "$script_directory/validate-backup-env.mjs" "$backup_environment_path"
fi

compose() {
    docker compose \
        --env-file "$environment_path" \
        -f "$compose_path" \
        "$@"
}

backup_compose() {
    docker compose \
        --env-file "$environment_path" \
        --env-file "$backup_environment_path" \
        -f "$compose_path" \
        -f "$backup_compose_path" \
        "$@"
}

echo ""
echo "BluePulse Nexus: Produktionskonfiguration wird geprueft."

compose config --quiet

echo ""
echo "BluePulse Nexus: Images werden gebaut."

compose build --pull

echo ""
echo "BluePulse Nexus: Backup-Image wird gebaut."

backup_compose build --pull backup

echo ""
echo "BluePulse Nexus: Caddy-Konfiguration wird validiert."

compose run \
    --rm \
    --no-deps \
    web \
    caddy validate \
    --config /etc/caddy/Caddyfile

echo ""
echo "BluePulse Nexus: Produktionsstack wird gestartet."

compose up \
    -d \
    --remove-orphans \
    --wait \
    --wait-timeout 180

echo ""
compose ps

echo ""
echo "Der Produktionsstack wurde gestartet."
echo "Die externe Pruefung erfolgt mit:"
echo "./scripts/verify-production-stack.sh"
echo ""
