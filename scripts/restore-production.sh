#!/bin/sh

set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_directory/.." && pwd)

production_environment_path="${BLUEPULSE_ENV_FILE:-$project_root/.env.production}"
backup_environment_path="${BLUEPULSE_BACKUP_ENV_FILE:-$project_root/.env.backup}"
snapshot="${1:-latest}"

if [ ! -f "$production_environment_path" ] ||
    [ ! -f "$backup_environment_path" ]; then
    echo ".env.production oder .env.backup fehlt." >&2
    exit 1
fi

compose() {
    docker compose \
        --env-file "$production_environment_path" \
        --env-file "$backup_environment_path" \
        -f "$project_root/compose.production.yaml" \
        -f "$project_root/compose.backup.yaml" \
        "$@"
}

compose config --quiet

echo ""
echo "ACHTUNG: Datenbank und Medien werden durch Snapshot '$snapshot' ersetzt."
echo "Vorher wird automatisch ein zusaetzliches Sicherheitsbackup erstellt."
echo "Die aktive .env.production wird nicht ueberschrieben."
echo ""
printf "Zum Fortfahren exakt RESTORE_BLUEPULSE_NEXUS eingeben: "
IFS= read -r confirmation

if [ "$confirmation" != "RESTORE_BLUEPULSE_NEXUS" ]; then
    echo "Wiederherstellung abgebrochen." >&2
    exit 1
fi

echo ""
echo "Zusaetzliches Sicherheitsbackup vor dem Restore."

BLUEPULSE_SKIP_RETENTION=true \
    "$script_directory/backup-production.sh"

api_was_running=false

if compose ps \
    --status running \
    --services |
    grep -qx "api"; then
    api_was_running=true
    compose stop --timeout 30 api
fi

echo ""
echo "Die vollstaendige Wiederherstellung beginnt."

if ! compose run \
    --rm \
    -e "BLUEPULSE_RESTORE_CONFIRM=RESTORE_BLUEPULSE_NEXUS" \
    restore \
    restore \
    "$snapshot"; then
    echo "" >&2
    echo "Die Wiederherstellung ist fehlgeschlagen." >&2
    echo "Die API bleibt vorsichtshalber angehalten." >&2
    echo "Das unmittelbar zuvor erstellte Sicherheitsbackup bleibt erhalten." >&2
    exit 1
fi

if [ "$api_was_running" = "true" ]; then
    echo ""
    echo "API und Webserver werden mit dem wiederhergestellten Stand gestartet."

    compose up \
        -d \
        --no-build \
        --wait \
        --wait-timeout 180 \
        api \
        web

    "$script_directory/verify-production-stack.sh"
fi

echo ""
echo "Wiederherstellung und anschliessende Pruefung erfolgreich."
echo "Eine Kopie der gesicherten Konfiguration liegt unter backups/recovery."
