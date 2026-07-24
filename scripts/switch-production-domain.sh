#!/bin/sh

set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_directory/.." && pwd)

environment_path="${BLUEPULSE_ENV_FILE:-$project_root/.env.production}"
target_domain="${1:-}"

case "$target_domain" in
    ""|*:*|*/*|*" "*|.*|*.|*[!a-zA-Z0-9.-]*|*..*)
        echo "Aufruf: ./scripts/switch-production-domain.sh blue-pulse.de" >&2
        exit 1
        ;;
esac

if [ ! -f "$environment_path" ]; then
    echo "Die Datei .env.production wurde nicht gefunden." >&2
    exit 1
fi

current_domain=$(
    awk -F= '
        $1 == "SITE_DOMAIN" {
            sub(/^[^=]*=/, "")
            value = $0
        }

        END {
            print value
        }
    ' "$environment_path" |
        tr -d '\r'
)

if [ "$current_domain" = "$target_domain" ]; then
    echo "SITE_DOMAIN ist bereits $target_domain." >&2
    exit 1
fi

echo ""
echo "Geplanter Domainwechsel:"
echo "  von: https://$current_domain"
echo "  nach: https://$target_domain"
echo ""
echo "Vorher muessen A/AAAA fuer $target_domain bereits auf diesen VPS zeigen."
echo "MX-, SPF-, DKIM- und sonstige Mail-Eintraege duerfen nicht veraendert werden."
echo ""
printf "Zur Freigabe exakt SWITCH_BLUEPULSE_DOMAIN eingeben: "
read -r confirmation

if [ "$confirmation" != "SWITCH_BLUEPULSE_DOMAIN" ]; then
    echo "Domainwechsel abgebrochen." >&2
    exit 1
fi

echo ""
echo "Vor dem Domainwechsel wird ein Sicherheitsbackup erstellt."

"$script_directory/backup-production.sh"

timestamp=$(date -u +"%Y%m%dT%H%M%SZ")
rollback_path="$environment_path.pre-switch-$timestamp"
temporary_path="$environment_path.phase16-tmp"

cp "$environment_path" "$rollback_path"

cleanup() {
    rm -f "$temporary_path"
}

trap cleanup EXIT HUP INT TERM

awk \
    -v domain="$target_domain" '
        BEGIN {
            site_domain_written = 0
            public_url_written = 0
        }

        /^SITE_DOMAIN=/ {
            print "SITE_DOMAIN=" domain
            site_domain_written = 1
            next
        }

        /^APP_PUBLIC_URL=/ {
            print "APP_PUBLIC_URL=https://" domain
            public_url_written = 1
            next
        }

        {
            print
        }

        END {
            if (!site_domain_written) {
                print "SITE_DOMAIN=" domain
            }

            if (!public_url_written) {
                print "APP_PUBLIC_URL=https://" domain
            }
        }
    ' "$environment_path" > "$temporary_path"

mv "$temporary_path" "$environment_path"

if \
    "$script_directory/deploy-production.sh" &&
    "$script_directory/verify-launch-production.sh"
then
    trap - EXIT HUP INT TERM

    echo ""
    echo "DOMAINWECHSEL ERFOLGREICH"
    echo "BluePulse ist unter https://$target_domain geprueft erreichbar."
    echo "Rueckfallkopie der vorherigen Umgebung: $rollback_path"
    echo ""

    exit 0
fi

echo ""
echo "Der neue Host hat die Launch-Pruefung nicht bestanden." >&2
echo "Die vorherige Umgebung wird wiederhergestellt." >&2

cp "$rollback_path" "$environment_path"

if "$script_directory/deploy-production.sh"; then
    echo "Die vorherige Domainkonfiguration laeuft wieder." >&2
else
    echo "ACHTUNG: Auch die automatische Rueckkehr ist fehlgeschlagen." >&2
    echo "Manuell mit $rollback_path wiederherstellen." >&2
fi

exit 1
