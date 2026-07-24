#!/bin/sh

set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_directory/.." && pwd)
expected_root="/opt/bluepulse-nexus"

if [ "$(id -u)" -ne 0 ]; then
    echo "Dieses Skript muss mit sudo ausgefuehrt werden." >&2
    exit 1
fi

if [ "$project_root" != "$expected_root" ]; then
    echo "Der systemd-Dienst erwartet das Projekt unter $expected_root." >&2
    echo "Aktueller Pfad: $project_root" >&2
    exit 1
fi

if [ ! -f "$project_root/.env.production" ] ||
    [ ! -f "$project_root/.env.backup" ]; then
    echo ".env.production oder .env.backup fehlt." >&2
    exit 1
fi

if command -v node >/dev/null 2>&1; then
    node "$script_directory/validate-production-env.mjs" \
        "$project_root/.env.production"

    node "$script_directory/validate-backup-env.mjs" \
        "$project_root/.env.backup"
fi

docker compose \
    --env-file "$project_root/.env.production" \
    --env-file "$project_root/.env.backup" \
    -f "$project_root/compose.production.yaml" \
    -f "$project_root/compose.backup.yaml" \
    build backup

install \
    -m 0644 \
    "$project_root/deploy/systemd/bluepulse-backup.service" \
    /etc/systemd/system/bluepulse-backup.service

install \
    -m 0644 \
    "$project_root/deploy/systemd/bluepulse-backup.timer" \
    /etc/systemd/system/bluepulse-backup.timer

systemctl daemon-reload
systemctl enable --now bluepulse-backup.timer

echo ""
echo "Der taegliche Backup-Timer ist aktiv."
systemctl list-timers bluepulse-backup.timer --no-pager
