$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$environmentPath = Join-Path $projectRoot ".env.docker"

if (-not (Test-Path $environmentPath)) {
    throw "Die Datei .env.docker wurde nicht gefunden."
}

$environment = @{}

Get-Content $environmentPath |
    ForEach-Object {
        $line = $_.Trim()

        if (
            -not $line -or
            $line.StartsWith("#") -or
            -not $line.Contains("=")
        ) {
            return
        }

        $separatorIndex = $line.IndexOf("=")
        $name = $line.Substring(0, $separatorIndex).Trim()
        $value = $line.Substring($separatorIndex + 1).Trim()

        $environment[$name] = $value
    }

$port = if ($environment.ContainsKey("HTTP_PORT")) {
    $environment["HTTP_PORT"]
}
else {
    "8080"
}

$baseUrl = "http://127.0.0.1:$port"

$checks = @(
    @{
        Name = "Website"
        Uri = "$baseUrl/"
        ContentType = "text/html"
    },
    @{
        Name = "API-Bereitschaft"
        Uri = "$baseUrl/api/ready"
        ContentType = "application/json"
    },
    @{
        Name = "API-Healthcheck"
        Uri = "$baseUrl/api/health"
        ContentType = "application/json"
    },
    @{
        Name = "robots.txt"
        Uri = "$baseUrl/robots.txt"
        ContentType = "text/plain"
    },
    @{
        Name = "sitemap.xml"
        Uri = "$baseUrl/sitemap.xml"
        ContentType = "application/xml"
    },
    @{
        Name = "CMS-Route"
        Uri = "$baseUrl/admin/login"
        ContentType = "text/html"
    }
)

Write-Host ""
Write-Host "BluePulse Docker-Prüfung: $baseUrl" -ForegroundColor Cyan
Write-Host ""

foreach ($check in $checks) {
    try {
        $response = Invoke-WebRequest `
            -Uri $check.Uri `
            -UseBasicParsing `
            -TimeoutSec 15

        $contentType = [string]$response.Headers["Content-Type"]

        if ($response.StatusCode -ne 200) {
            throw "HTTP $($response.StatusCode)"
        }

        if (
            $check.ContentType -and
            -not $contentType.StartsWith($check.ContentType)
        ) {
            throw "Unerwarteter Content-Type: $contentType"
        }

        Write-Host "[OK] $($check.Name)" -ForegroundColor Green
    }
    catch {
        Write-Host "[FEHLER] $($check.Name): $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

$health = Invoke-RestMethod `
    -Uri "$baseUrl/api/health" `
    -TimeoutSec 15

if ($health.status -ne "ok") {
    throw "Die API meldet den Status '$($health.status)'."
}

if ($health.database.status -ne "connected") {
    throw "PostgreSQL ist laut API nicht verbunden."
}

Write-Host ""
Write-Host "Website, API, PostgreSQL, Caddy, Sitemap und CMS-Routing funktionieren." -ForegroundColor Green
Write-Host ""
