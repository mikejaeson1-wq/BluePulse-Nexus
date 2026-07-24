#!/bin/sh

set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_directory/.." && pwd)

production_environment_path="${BLUEPULSE_ENV_FILE:-$project_root/.env.production}"
backup_environment_path="${BLUEPULSE_BACKUP_ENV_FILE:-$project_root/.env.backup}"
production_compose_path="$project_root/compose.production.yaml"
backup_compose_path="$project_root/compose.backup.yaml"
backup_image="bluepulse-nexus-backup:phase15"

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker wurde nicht gefunden." >&2
    exit 1
fi

if [ ! -f "$production_environment_path" ]; then
    echo "Die Datei .env.production wurde nicht gefunden." >&2
    exit 1
fi

if [ ! -f "$backup_environment_path" ]; then
    echo "Die Datei .env.backup wurde nicht gefunden." >&2
    exit 1
fi

if command -v node >/dev/null 2>&1; then
    node "$script_directory/validate-production-env.mjs" \
        "$production_environment_path"

    node "$script_directory/validate-backup-env.mjs" \
        "$backup_environment_path"
fi

compose() {
    docker compose \
        --env-file "$production_environment_path" \
        --env-file "$backup_environment_path" \
        -f "$production_compose_path" \
        -f "$backup_compose_path" \
        "$@"
}

compose config --quiet

if ! docker image inspect "$backup_image" >/dev/null 2>&1; then
    echo ""
    echo "Das Backup-Image wird einmalig gebaut."
    compose build backup
fi

api_was_running=false

if compose ps \
    --status running \
    --services |
    grep -qx "api"; then
    api_was_running=true
fi

restart_api() {
    result=$?
    trap - EXIT HUP INT TERM

    if [ "$api_was_running" = "true" ]; then
        echo ""
        echo "Die API wird wieder gestartet."

        if ! compose up \
            -d \
            --no-build \
            --wait \
            --wait-timeout 180 \
            api \
            web; then
            result=1
        fi
    fi

    exit "$result"
}

trap restart_api EXIT HUP INT TERM

if [ "$api_was_running" = "true" ]; then
    echo ""
    echo "Die API wird fuer einen konsistenten Gesamtstand kurz angehalten."
    compose stop --timeout 30 api
fi

echo ""
echo "Das verschluesselte BluePulse-Backup wird erstellt."

compose run \
    --rm \
    -e "BLUEPULSE_SKIP_RETENTION=${BLUEPULSE_SKIP_RETENTION:-false}" \
    backup \
    backup

echo ""
echo "Produktionsbackup erfolgreich abgeschlossen."
