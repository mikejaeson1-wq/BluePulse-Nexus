$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot

$templatePath = Join-Path $projectRoot ".env.backup.example"
$targetPath = Join-Path $projectRoot ".env.backup"
$secretsDirectory = Join-Path $projectRoot ".secrets"
$passwordPath = Join-Path $secretsDirectory "restic-password"
$repositoryPath = Join-Path $projectRoot "backups\restic"
$recoveryPath = Join-Path $projectRoot "backups\recovery"

if (-not (Test-Path $templatePath)) {
    throw "Die Vorlage .env.backup.example wurde nicht gefunden."
}

if ((Test-Path $targetPath) -or (Test-Path $passwordPath)) {
    throw @"
Die Backup-Konfiguration oder der Restic-Schluessel existiert bereits.
Aus Sicherheitsgruenden wurde nichts ueberschrieben.
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

$resticPassword = New-HexSecret -ByteCount 32
$content = [System.IO.File]::ReadAllText($templatePath)

$content = $content.Replace(
    "BACKUP_SOURCE_ENV_FILE=./.env.production",
    "BACKUP_SOURCE_ENV_FILE=./.env.docker"
)

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

New-Item -ItemType Directory -Force $secretsDirectory | Out-Null
New-Item -ItemType Directory -Force $repositoryPath | Out-Null
New-Item -ItemType Directory -Force $recoveryPath | Out-Null

[System.IO.File]::WriteAllText(
    $targetPath,
    $content,
    $utf8WithoutBom
)

[System.IO.File]::WriteAllText(
    $passwordPath,
    $resticPassword,
    $utf8WithoutBom
)

Write-Host ""
Write-Host "Die lokale Backup-Konfiguration wurde erstellt:" -ForegroundColor Green
Write-Host $targetPath
Write-Host ""
Write-Host "Der separate Restic-Schluessel liegt hier:" -ForegroundColor Yellow
Write-Host $passwordPath
Write-Host ""
Write-Host "Diesen Schluessel zusaetzlich offline oder im Passwortmanager sichern."
Write-Host "Ohne ihn koennen die verschluesselten Backups nicht wiederhergestellt werden."
Write-Host ""
