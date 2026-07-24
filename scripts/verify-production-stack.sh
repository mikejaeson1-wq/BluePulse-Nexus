#!/bin/sh

set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_root=$(CDPATH= cd -- "$script_directory/.." && pwd)

environment_path="${BLUEPULSE_ENV_FILE:-$project_root/.env.production}"

if ! command -v curl >/dev/null 2>&1; then
    echo "curl wurde nicht gefunden." >&2
    exit 1
fi

if [ ! -f "$environment_path" ]; then
    echo "Die Datei .env.production wurde nicht gefunden." >&2
    exit 1
fi

site_domain=$(
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

case "$site_domain" in
    ""|*:*|*/*|*" "*)
        echo "SITE_DOMAIN ist ungueltig." >&2
        exit 1
        ;;
esac

base_url="https://$site_domain"

check_endpoint() {
    name="$1"
    path="$2"
    expected_content_type="$3"

    result=$(
        curl \
            --silent \
            --show-error \
            --fail \
            --location \
            --proto '=https' \
            --tlsv1.2 \
            --output /dev/null \
            --write-out '%{http_code}|%{content_type}' \
            "$base_url$path"
    )

    status_code=${result%%|*}
    content_type=${result#*|}

    if [ "$status_code" != "200" ]; then
        echo "[FEHLER] $name: HTTP $status_code" >&2
        exit 1
    fi

    case "$content_type" in
        "$expected_content_type"*)
            ;;
        *)
            echo "[FEHLER] $name: Content-Type $content_type" >&2
            exit 1
            ;;
    esac

    echo "[OK] $name"
}

echo ""
echo "BluePulse Produktionspruefung: $base_url"
echo ""

check_endpoint "Website" "/" "text/html"
check_endpoint "API-Bereitschaft" "/api/ready" "application/json"
check_endpoint "API-Healthcheck" "/api/health" "application/json"
check_endpoint "robots.txt" "/robots.txt" "text/plain"
check_endpoint "sitemap.xml" "/sitemap.xml" "application/xml"
check_endpoint "CMS-Route" "/admin/login" "text/html"

health_response=$(
    curl \
        --silent \
        --show-error \
        --fail \
        --proto '=https' \
        --tlsv1.2 \
        "$base_url/api/health"
)

if ! printf '%s' "$health_response" |
    grep -Eq '"status"[[:space:]]*:[[:space:]]*"ok"'; then
    echo "[FEHLER] Die API meldet nicht den Status ok." >&2
    exit 1
fi

if ! printf '%s' "$health_response" |
    grep -Eq '"database"[[:space:]]*:'; then
    echo "[FEHLER] Der Datenbankstatus fehlt in der API-Antwort." >&2
    exit 1
fi

security_headers=$(
    curl \
        --silent \
        --show-error \
        --fail \
        --head \
        --proto '=https' \
        --tlsv1.2 \
        "$base_url/"
)

if ! printf '%s' "$security_headers" |
    grep -Eiq '^strict-transport-security:'; then
    echo "[FEHLER] Strict-Transport-Security fehlt." >&2
    exit 1
fi

echo "[OK] HTTPS-Sicherheitsheader"
echo ""
echo "Website, API, PostgreSQL, Caddy, HTTPS und CMS-Routing funktionieren."
echo ""
