#!/bin/sh

set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_directory/.." && pwd)

production_environment_path="${BLUEPULSE_ENV_FILE:-$project_root/.env.production}"
backup_environment_path="${BLUEPULSE_BACKUP_ENV_FILE:-$project_root/.env.backup}"

if [ ! -f "$production_environment_path" ]; then
    echo "Die Datei .env.production wurde nicht gefunden." >&2
    exit 1
fi

if [ ! -f "$backup_environment_path" ]; then
    echo "Die Datei .env.backup wurde nicht gefunden." >&2
    exit 1
fi

compose() {
    docker compose \
        --env-file "$production_environment_path" \
        -f "$project_root/compose.production.yaml" \
        "$@"
}

echo ""
echo "Phase 16: Produktionskonfiguration"

if command -v node >/dev/null 2>&1; then
    node "$script_directory/validate-production-env.mjs" \
        "$production_environment_path"

    node "$script_directory/validate-backup-env.mjs" \
        "$backup_environment_path"
else
    echo "Node.js ist auf dem Host nicht installiert; die bereits im Deployment"
    echo "durchgefuehrten Compose- und Containerpruefungen werden verwendet."
fi

compose config --quiet

echo ""
echo "Phase 16: Containerstatus"

compose ps

echo ""
echo "Phase 16: CMS- und Inhaltsaudit"

compose exec \
    -T \
    api \
    node src/launch/auditLaunchReadiness.js

echo ""
echo "Phase 16: Externe HTTPS-Pruefung"

"$script_directory/verify-production-stack.sh"

echo ""
echo "Phase 16: Verschluesselter Abnahme-Snapshot"

"$script_directory/backup-production.sh"

echo ""
echo "Phase 16: Repository- und Restore-Pruefung"

"$script_directory/verify-backup-production.sh"

echo ""
echo "Phase 16: Abschlusskontrolle nach dem Backup"

"$script_directory/verify-production-stack.sh"

echo ""
echo "PHASE 16 BESTANDEN"
echo "Inhalte, Rechtsseiten, Medien, HTTPS, API und Restore-Test sind bereit."
echo ""
