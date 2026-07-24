$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot

$templatePath = Join-Path $projectRoot ".env.docker.example"
$targetPath = Join-Path $projectRoot ".env.docker"

if (-not (Test-Path $templatePath)) {
    throw "Die Vorlage .env.docker.example wurde nicht gefunden."
}

if (Test-Path $targetPath) {
    throw @"
Die Datei .env.docker existiert bereits.
Sie wurde aus Sicherheitsgründen nicht überschrieben.
"@
}

function New-HexSecret {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateRange(16, 128)]
        [int]$ByteCount
    )

    $bytes = New-Object byte[] $ByteCount
    $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()

    try {
        $generator.GetBytes($bytes)
    }
    finally {
        $generator.Dispose()
    }

    $hexSecret = [System.BitConverter]::ToString($bytes)

    return $hexSecret.Replace("-", "").ToLowerInvariant()
}

$postgresPassword = New-HexSecret -ByteCount 24
$contactSecret = New-HexSecret -ByteCount 32

$content = [System.IO.File]::ReadAllText($templatePath)

$content = $content.Replace(
    "CHANGE_ME_POSTGRES_PASSWORD",
    $postgresPassword
)

$content = $content.Replace(
    "CHANGE_ME_CONTACT_IP_HASH_SECRET",
    $contactSecret
)

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
    $targetPath,
    $content,
    $utf8WithoutBom
)

Write-Host ""
Write-Host "Die lokale Docker-Konfiguration wurde erstellt:" -ForegroundColor Green
Write-Host $targetPath
Write-Host ""
Write-Host "E-Mail-Versand ist zunächst deaktiviert." -ForegroundColor Yellow
Write-Host "Für den SMTP-Test MAIL_ENABLED=true und das Google-App-Passwort in .env.docker eintragen."
Write-Host ""
