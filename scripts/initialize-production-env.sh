#!/bin/sh

set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_directory/.." && pwd)

template_path="$project_root/.env.production.example"
target_path="$project_root/.env.production"

if [ ! -f "$template_path" ]; then
    echo "Die Vorlage .env.production.example wurde nicht gefunden." >&2
    exit 1
fi

if [ -e "$target_path" ]; then
    echo "Die Datei .env.production existiert bereits." >&2
    echo "Sie wurde aus Sicherheitsgruenden nicht ueberschrieben." >&2
    exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
    echo "OpenSSL wird zum sicheren Erzeugen der Geheimnisse benoetigt." >&2
    exit 1
fi

umask 077

postgres_password=$(openssl rand -hex 24)
contact_secret=$(openssl rand -hex 32)

sed \
    -e "s/CHANGE_ME_POSTGRES_PASSWORD/$postgres_password/g" \
    -e "s/CHANGE_ME_CONTACT_IP_HASH_SECRET/$contact_secret/g" \
    "$template_path" > "$target_path"

chmod 600 "$target_path"

echo ""
echo "Die Produktionskonfiguration wurde erstellt:"
echo "$target_path"
echo ""
echo "Die Datei darf niemals in Git eingecheckt oder weitergegeben werden."
echo ""
