#!/bin/sh

set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_directory/.." && pwd)

template_path="$project_root/.env.backup.example"
target_path="$project_root/.env.backup"
secrets_directory="$project_root/.secrets"
password_path="$secrets_directory/restic-password"
repository_path="$project_root/backups/restic"
recovery_path="$project_root/backups/recovery"

if [ ! -f "$template_path" ]; then
    echo "Die Vorlage .env.backup.example wurde nicht gefunden." >&2
    exit 1
fi

if [ -e "$target_path" ] || [ -e "$password_path" ]; then
    echo "Backup-Konfiguration oder Restic-Schluessel existiert bereits." >&2
    echo "Aus Sicherheitsgruenden wurde nichts ueberschrieben." >&2
    exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
    echo "OpenSSL wird zum Erzeugen des Restic-Schluessels benoetigt." >&2
    exit 1
fi

umask 077

mkdir -p \
    "$secrets_directory" \
    "$repository_path" \
    "$recovery_path"

cp "$template_path" "$target_path"
openssl rand -hex 32 > "$password_path"

chmod 600 "$target_path" "$password_path"

echo ""
echo "Die Produktions-Backup-Konfiguration wurde erstellt:"
echo "$target_path"
echo ""
echo "Der separate Restic-Schluessel liegt hier:"
echo "$password_path"
echo ""
echo "Diesen Schluessel zusaetzlich offline oder im Passwortmanager sichern."
echo "Ohne ihn koennen die verschluesselten Backups nicht wiederhergestellt werden."
echo ""
