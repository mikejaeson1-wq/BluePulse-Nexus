#!/bin/sh

set -eu

backup_tag="bluepulse-nexus"
dump_path="/work/bluepulse-database.dump"
manifest_path="/work/bluepulse-backup-manifest.txt"

say() {
    printf '%s\n' "$*"
}

fail() {
    printf 'FEHLER: %s\n' "$*" >&2
    exit 1
}

require_environment() {
    for name in \
        PGHOST \
        PGPORT \
        PGDATABASE \
        PGUSER \
        PGPASSWORD \
        RESTIC_REPOSITORY \
        RESTIC_PASSWORD_FILE \
        BACKUP_HOSTNAME
    do
        eval "value=\${$name:-}"

        if [ -z "$value" ]; then
            fail "Die Umgebungsvariable $name fehlt."
        fi
    done

    if [ ! -r "$RESTIC_PASSWORD_FILE" ]; then
        fail "Der Restic-Schluessel ist nicht lesbar."
    fi
}

ensure_repository() {
    if [ ! -f "$RESTIC_REPOSITORY/config" ]; then
        if find "$RESTIC_REPOSITORY" \
            -mindepth 1 \
            -maxdepth 1 \
            -print |
            grep -q .; then
            fail "Das Repository-Verzeichnis ist nicht leer, enthaelt aber keine Restic-Konfiguration."
        fi

        say "Das verschluesselte Restic-Repository wird initialisiert."
        restic init
    fi

    if ! restic cat config >/dev/null; then
        fail "Das Restic-Repository oder der Schluessel ist ungueltig."
    fi
}

validate_snapshot() {
    snapshot="$1"

    case "$snapshot" in
        ""|-*|*/*|*" "*)
            fail "Die Snapshot-ID ist ungueltig."
            ;;
    esac
}

snapshot_contains() {
    snapshot="$1"
    required_path="$2"

    restic ls "$snapshot" |
        grep -Eq "(^|[[:space:]])/?${required_path}(/|$)"
}

create_manifest() {
    cat > "$manifest_path" <<EOF
format=bluepulse-nexus-complete-v1
created_at_utc=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
backup_host=$BACKUP_HOSTNAME
database=$PGDATABASE
database_format=postgresql-custom
media_path=/source/media
configuration_path=/source/config/environment
EOF
}

run_retention() {
    keep_daily="${BACKUP_KEEP_DAILY:-7}"
    keep_weekly="${BACKUP_KEEP_WEEKLY:-5}"
    keep_monthly="${BACKUP_KEEP_MONTHLY:-12}"
    keep_yearly="${BACKUP_KEEP_YEARLY:-3}"

    say ""
    say "Aufbewahrungsregeln werden angewendet."

    restic forget \
        --host "$BACKUP_HOSTNAME" \
        --tag "$backup_tag" \
        --keep-daily "$keep_daily" \
        --keep-weekly "$keep_weekly" \
        --keep-monthly "$keep_monthly" \
        --keep-yearly "$keep_yearly" \
        --prune
}

run_check() {
    say ""

    if [ "${BLUEPULSE_FULL_DATA_CHECK:-false}" = "true" ]; then
        say "Repository und saemtliche verschluesselten Daten werden vollstaendig gelesen."
        restic check --read-data
    else
        say "Die Struktur des Restic-Repositorys wird geprueft."
        restic check
    fi
}

run_backup() {
    [ -r /source/config/environment ] ||
        fail "Die zu sichernde Konfigurationsdatei fehlt."

    [ -d /source/media ] ||
        fail "Das Medienvolume ist nicht eingebunden."

    rm -f "$dump_path" "$manifest_path"

    say ""
    say "PostgreSQL wird konsistent in ein Custom-Format-Archiv exportiert."

    pg_dump \
        --format=custom \
        --compress=6 \
        --no-owner \
        --no-privileges \
        --file="$dump_path"

    create_manifest

    say ""
    say "Datenbank, Medien und Konfiguration werden verschluesselt gesichert."

    restic backup \
        --host "$BACKUP_HOSTNAME" \
        --tag "$backup_tag" \
        --tag "complete" \
        "$dump_path" \
        "$manifest_path" \
        /source/media \
        /source/config/environment

    if [ "${BLUEPULSE_SKIP_RETENTION:-false}" != "true" ]; then
        run_retention
    else
        say ""
        say "Aufbewahrung wurde fuer dieses Sicherheitsbackup uebersprungen."
    fi

    if [ "${BACKUP_CHECK_AFTER_BACKUP:-true}" = "true" ]; then
        run_check
    fi

    rm -f "$dump_path" "$manifest_path"

    say ""
    say "Backup erfolgreich abgeschlossen."
    say ""

    restic snapshots \
        --host "$BACKUP_HOSTNAME" \
        --tag "$backup_tag"
}

restore_database_archive() {
    snapshot="$1"
    target_directory="$2"

    rm -rf "$target_directory"
    mkdir -p "$target_directory"

    restic restore "$snapshot" \
        --target "$target_directory" \
        --include "/work/bluepulse-database.dump" \
        --include "/work/bluepulse-backup-manifest.txt"

    restored_dump="$target_directory/work/bluepulse-database.dump"

    [ -s "$restored_dump" ] ||
        fail "Der Snapshot enthaelt kein gueltiges Datenbankarchiv."

    pg_restore --list "$restored_dump" >/dev/null
}

run_restore_test() {
    snapshot="${1:-latest}"
    validate_snapshot "$snapshot"

    test_root="/work/restore-test"
    test_database="bp_restore_test_$(date -u '+%Y%m%d%H%M%S')_$$"

    cleanup_restore_test() {
        dropdb \
            --if-exists \
            --force \
            --maintenance-db=postgres \
            "$test_database" \
            >/dev/null 2>&1 ||
            true

        rm -rf "$test_root"
    }

    trap cleanup_restore_test EXIT HUP INT TERM

    say ""
    say "Snapshot $snapshot wird fuer den Restore-Test gelesen."

    restore_database_archive "$snapshot" "$test_root"

    snapshot_contains "$snapshot" "source/media" ||
        fail "Der Snapshot enthaelt keinen Medienbestand."

    snapshot_contains "$snapshot" "source/config/environment" ||
        fail "Der Snapshot enthaelt keine Konfigurationssicherung."

    createdb \
        --maintenance-db=postgres \
        --owner="$PGUSER" \
        "$test_database"

    pg_restore \
        --exit-on-error \
        --no-owner \
        --no-privileges \
        --dbname="$test_database" \
        "$test_root/work/bluepulse-database.dump"

    migration_table=$(
        psql \
            --dbname="$test_database" \
            --tuples-only \
            --no-align \
            --command="SELECT COALESCE(to_regclass('public.nexus_migrations')::text, '');"
    )

    [ "$migration_table" = "nexus_migrations" ] ||
        fail "Die wiederhergestellte Datenbank enthaelt keine Migrationstabelle."

    migration_count=$(
        psql \
            --dbname="$test_database" \
            --tuples-only \
            --no-align \
            --command="SELECT COUNT(*) FROM nexus_migrations;"
    )

    case "$migration_count" in
        ""|*[!0-9]*)
            fail "Die wiederhergestellten Migrationen konnten nicht gelesen werden."
            ;;
    esac

    cleanup_restore_test
    trap - EXIT HUP INT TERM

    say ""
    say "Restore-Test erfolgreich."
    say "Datenbankarchiv, $migration_count Migrationen, Medienpfad und Konfiguration sind lesbar."
}

recover_configuration() {
    snapshot="$1"
    recovery_root="/work/recovered-configuration"

    rm -rf "$recovery_root"
    mkdir -p "$recovery_root"

    restic restore "$snapshot" \
        --target "$recovery_root" \
        --include "/source/config/environment"

    recovered_source="$recovery_root/source/config/environment"

    [ -s "$recovered_source" ] ||
        fail "Im Snapshot wurde keine Konfiguration gefunden."

    snapshot_name=$(
        printf '%s' "$snapshot" |
            tr -cd 'A-Za-z0-9._-'
    )

    recovered_target="/recovery/environment.recovered-${snapshot_name}-$(date -u '+%Y%m%dT%H%M%SZ')"

    cp "$recovered_source" "$recovered_target"
    chmod 600 "$recovered_target"

    say "Konfiguration zur manuellen Pruefung wiederhergestellt:"
    say "$recovered_target"
}

run_restore() {
    snapshot="${1:-latest}"
    validate_snapshot "$snapshot"

    if [ "${BLUEPULSE_RESTORE_CONFIRM:-}" != "RESTORE_BLUEPULSE_NEXUS" ]; then
        fail "Die explizite Restore-Bestaetigung fehlt."
    fi

    restore_root="/work/full-restore"

    say ""
    say "Snapshot $snapshot wird vor der Wiederherstellung validiert."

    restore_database_archive "$snapshot" "$restore_root"

    snapshot_contains "$snapshot" "source/media" ||
        fail "Der Snapshot enthaelt keinen Medienbestand."

    snapshot_contains "$snapshot" "source/config/environment" ||
        fail "Der Snapshot enthaelt keine Konfigurationssicherung."

    say ""
    say "Die Zieldatenbank wird neu erstellt."

    dropdb \
        --if-exists \
        --force \
        --maintenance-db=postgres \
        "$PGDATABASE"

    createdb \
        --maintenance-db=postgres \
        --owner="$PGUSER" \
        "$PGDATABASE"

    pg_restore \
        --exit-on-error \
        --no-owner \
        --no-privileges \
        --dbname="$PGDATABASE" \
        "$restore_root/work/bluepulse-database.dump"

    say ""
    say "Das Medienvolume wird aus dem Snapshot ersetzt."

    find /restore-root/source/media \
        -mindepth 1 \
        -delete

    restic restore "$snapshot" \
        --target /restore-root \
        --include "/source/media"

    recover_configuration "$snapshot"

    say ""
    say "Vollstaendige Wiederherstellung erfolgreich."
    say "Die aktive Konfiguration wurde nicht automatisch ueberschrieben."
}

show_help() {
    cat <<'EOF'
BluePulse Backup Manager

Kommandos:
  backup                  Vollstaendigen verschluesselten Snapshot erstellen
  snapshots               Vorhandene BluePulse-Snapshots anzeigen
  check                   Restic-Repository pruefen
  restore-test [SNAPSHOT] Nicht-destruktiven Restore-Test ausfuehren
  recover-config [SNAPSHOT]
                          Konfiguration separat zur Pruefung wiederherstellen
  restore [SNAPSHOT]      Datenbank und Medien vollstaendig ersetzen
EOF
}

require_environment

command_name="${1:-help}"
shift || true

case "$command_name" in
    help|--help|-h)
        show_help
        ;;
    backup)
        ensure_repository
        run_backup
        ;;
    snapshots)
        ensure_repository
        restic snapshots \
            --host "$BACKUP_HOSTNAME" \
            --tag "$backup_tag"
        ;;
    check)
        ensure_repository
        BLUEPULSE_FULL_DATA_CHECK=true run_check
        ;;
    restore-test)
        ensure_repository
        run_restore_test "${1:-latest}"
        ;;
    recover-config)
        ensure_repository
        snapshot="${1:-latest}"
        validate_snapshot "$snapshot"
        recover_configuration "$snapshot"
        ;;
    restore)
        ensure_repository
        run_restore "${1:-latest}"
        ;;
    *)
        fail "Unbekanntes Kommando: $command_name"
        ;;
esac
