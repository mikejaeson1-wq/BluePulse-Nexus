$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot

$templatePath = Join-Path $projectRoot ".env.production.example"
$targetPath = Join-Path $projectRoot ".env.production"

if (-not (Test-Path $templatePath)) {
    throw "Die Vorlage .env.production.example wurde nicht gefunden."
}

if (Test-Path $targetPath) {
    throw @"
Die Datei .env.production existiert bereits.
Sie wurde aus Sicherheitsgruenden nicht ueberschrieben.
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
Write-Host "Die Produktionskonfiguration wurde erstellt:" -ForegroundColor Green
Write-Host $targetPath
Write-Host ""
Write-Host "Die Datei ist nur fuer den spaeteren VPS vorbereitet." -ForegroundColor Yellow
Write-Host "Sie darf niemals in Git eingecheckt oder im Chat geteilt werden."
Write-Host ""
Write-Host "Naechster lokaler Pruefschritt:"
Write-Host "npm run production:config"
Write-Host ""
