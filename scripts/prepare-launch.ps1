param(
    [switch]$SkipQualityChecks,
    [switch]$SkipBackup
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot

Set-Location $projectRoot

$reportDirectory = Join-Path $projectRoot "backups\recovery"

New-Item `
    -ItemType Directory `
    -Path $reportDirectory `
    -Force |
    Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

$reportPath = Join-Path `
    $reportDirectory `
    "launch-readiness-$timestamp.txt"

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
    $reportPath,
    "BluePulse Phase 16 - Launch-Vorbereitung`r`n" +
        "Zeitpunkt: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')`r`n" +
        "Projekt: $projectRoot`r`n`r`n",
    $utf8WithoutBom
)

function Add-ReportLine {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$Text
    )

    [System.IO.File]::AppendAllText(
        $reportPath,
        "$Text`r`n",
        $utf8WithoutBom
    )
}

function Invoke-NpmStep {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Label,

        [Parameter(Mandatory = $true)]
        [string]$Script
    )

    Write-Host ""
    Write-Host "==> $Label" -ForegroundColor Cyan

    Add-ReportLine "==> $Label"

    & npm.cmd run $Script

    $exitCode = $LASTEXITCODE

    if ($exitCode -ne 0) {
        Add-ReportLine "[FEHLER] $Label (Exitcode $exitCode)"

        throw @"
$Label ist fehlgeschlagen.
Der Launch bleibt gesperrt.
Bericht: $reportPath
"@
    }

    Add-ReportLine "[OK] $Label"
}

try {
    Invoke-NpmStep `
        -Label "Lokale Docker-Images aktualisieren und Stack starten" `
        -Script "docker:up"

    Invoke-NpmStep `
        -Label "Lokalen Docker-Stack pruefen" `
        -Script "docker:verify"

    Invoke-NpmStep `
        -Label "CMS-Inhalte und Launchdaten pruefen" `
        -Script "launch:audit"

    if (-not $SkipQualityChecks) {
        Invoke-NpmStep `
            -Label "Alle automatischen Tests ausfuehren" `
            -Script "test:all"

        Invoke-NpmStep `
            -Label "Quellcode statisch pruefen" `
            -Script "lint"

        Invoke-NpmStep `
            -Label "Produktions-Build erstellen" `
            -Script "build"
    }

    if (-not $SkipBackup) {
        Invoke-NpmStep `
            -Label "Verschluesselten Abnahme-Snapshot erstellen" `
            -Script "backup:create"

        Invoke-NpmStep `
            -Label "Restic-Repository vollstaendig pruefen" `
            -Script "backup:check"

        Invoke-NpmStep `
            -Label "Praktischen Restore-Test ausfuehren" `
            -Script "backup:restore:test"
    }

    Add-ReportLine ""
    Add-ReportLine "ERGEBNIS: BEREIT FUER STAGING"

    Write-Host ""
    Write-Host "Phase 16 ist lokal bereit fuer die Staging-Abnahme." -ForegroundColor Green
    Write-Host "Bericht: $reportPath"
    Write-Host ""
}
catch {
    Add-ReportLine ""
    Add-ReportLine "ERGEBNIS: NOCH NICHT BEREIT"

    Write-Host ""
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""

    exit 1
}
