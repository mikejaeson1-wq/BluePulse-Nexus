#!/bin/sh

set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_directory/.." && pwd)

production_environment_path="${BLUEPULSE_ENV_FILE:-$project_root/.env.production}"
backup_environment_path="${BLUEPULSE_BACKUP_ENV_FILE:-$project_root/.env.backup}"

if [ ! -f "$production_environment_path" ] ||
    [ ! -f "$backup_environment_path" ]; then
    echo ".env.production oder .env.backup fehlt." >&2
    exit 1
fi

if command -v node >/dev/null 2>&1; then
    node "$script_directory/validate-backup-env.mjs" \
        "$backup_environment_path"
fi

compose() {
    docker compose \
        --env-file "$production_environment_path" \
        --env-file "$backup_environment_path" \
        -f "$project_root/compose.production.yaml" \
        -f "$project_root/compose.backup.yaml" \
        "$@"
}

echo ""
echo "Das Restic-Repository wird geprueft."
compose run --rm backup check

echo ""
echo "Der neueste Snapshot wird in eine temporaere Datenbank restauriert."
compose run --rm backup restore-test latest

echo ""
echo "Backup-Pruefung und praktischer Restore-Test waren erfolgreich."
