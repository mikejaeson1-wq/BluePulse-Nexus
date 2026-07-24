$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$environmentPath = Join-Path $projectRoot ".env.docker"
$composePath = Join-Path $projectRoot "compose.local.yaml"
$legacyMediaPath = Join-Path $projectRoot "apps\api\storage\media"
$legacyContainer = "bluepulse-nexus-postgres"
$databaseName = "bluepulse_nexus"
$databaseUser = "bluepulse"
$legacyDumpInContainer = "/tmp/bluepulse-legacy-postgres16.dump"
$currentDumpInContainer = "/tmp/bluepulse-before-legacy-recovery.dump"
$restoreDumpInContainer = "/tmp/bluepulse-legacy-restore.dump"

function Invoke-NativeCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,

        [Parameter(Mandatory = $true)]
        [string[]]$ArgumentList
    )

    & $FilePath @ArgumentList

    if ($LASTEXITCODE -ne 0) {
        throw "Der Befehl '$FilePath' ist mit Exitcode $LASTEXITCODE fehlgeschlagen."
    }
}

function Invoke-NativeText {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,

        [Parameter(Mandatory = $true)]
        [string[]]$ArgumentList
    )

    $output = & $FilePath @ArgumentList

    if ($LASTEXITCODE -ne 0) {
        throw "Der Befehl '$FilePath' ist mit Exitcode $LASTEXITCODE fehlgeschlagen."
    }

    return (
        $output |
            Out-String
    ).Trim()
}

if (-not (Test-Path -LiteralPath $environmentPath)) {
    throw "Die Datei .env.docker wurde nicht gefunden."
}

if (-not (Test-Path -LiteralPath $composePath)) {
    throw "compose.local.yaml wurde nicht gefunden."
}

if (-not (Test-Path -LiteralPath $legacyMediaPath)) {
    throw "Der alte Medienordner wurde nicht gefunden."
}

$composeArguments = @(
    "compose",
    "--env-file",
    $environmentPath,
    "-f",
    $composePath
)

$legacyContainerRunning = Invoke-NativeText `
    -FilePath "docker" `
    -ArgumentList @(
        "inspect",
        "--format",
        "{{.State.Running}}",
        $legacyContainer
    )

if ($legacyContainerRunning -ne "true") {
    throw "Der alte PostgreSQL-16-Container laeuft nicht."
}

$newDatabaseContainer = Invoke-NativeText `
    -FilePath "docker" `
    -ArgumentList (
        $composeArguments +
        @(
            "ps",
            "-q",
            "database"
        )
    )

if (-not $newDatabaseContainer) {
    throw "Der neue PostgreSQL-17-Container wurde nicht gefunden."
}

$composeProjectLine = Get-Content -LiteralPath $environmentPath |
    Where-Object {
        $_ -match "^COMPOSE_PROJECT_NAME="
    } |
    Select-Object -First 1

if (-not $composeProjectLine) {
    throw "COMPOSE_PROJECT_NAME fehlt in .env.docker."
}

$composeProjectName = (
    $composeProjectLine -split "=",
    2
)[1].Trim()

$mediaVolumeName = "${composeProjectName}_bluepulse_media_data"

Invoke-NativeCommand `
    -FilePath "docker" `
    -ArgumentList @(
        "volume",
        "inspect",
        $mediaVolumeName
    )

$legacyMediaRowsText = Invoke-NativeText `
    -FilePath "docker" `
    -ArgumentList @(
        "exec",
        $legacyContainer,
        "psql",
        "-U",
        $databaseUser,
        "-d",
        $databaseName,
        "-tA",
        "-c",
        "SELECT COUNT(*) FROM media_assets;"
    )

$newMediaRowsText = Invoke-NativeText `
    -FilePath "docker" `
    -ArgumentList @(
        "exec",
        $newDatabaseContainer,
        "psql",
        "-U",
        $databaseUser,
        "-d",
        $databaseName,
        "-tA",
        "-c",
        "SELECT COUNT(*) FROM media_assets;"
    )

$legacyMediaRows = [int]$legacyMediaRowsText
$newMediaRows = [int]$newMediaRowsText

$legacyStorageKeysText = Invoke-NativeText `
    -FilePath "docker" `
    -ArgumentList @(
        "exec",
        $legacyContainer,
        "psql",
        "-U",
        $databaseUser,
        "-d",
        $databaseName,
        "-tA",
        "-c",
        "SELECT storage_key FROM media_assets ORDER BY storage_key;"
    )

$legacyStorageKeys = @(
    $legacyStorageKeysText -split "\r?\n" |
        Where-Object {
            $_.Trim()
        }
)

$legacyMediaFiles = @(
    Get-ChildItem `
        -LiteralPath $legacyMediaPath `
        -File `
        -Recurse
)

$activeMediaFilesText = Invoke-NativeText `
    -FilePath "docker" `
    -ArgumentList @(
        "run",
        "--rm",
        "--mount",
        "type=volume,source=$mediaVolumeName,target=/data,readonly",
        "postgres:17-alpine",
        "sh",
        "-lc",
        "find /data -type f | wc -l"
    )

$activeMediaFiles = [int]$activeMediaFilesText

Write-Host ""
Write-Host "Gefundener Altbestand:" -ForegroundColor Cyan
Write-Host "- Datenbankeintraege: $legacyMediaRows"
Write-Host "- Dateien: $($legacyMediaFiles.Count)"
Write-Host ""
Write-Host "Aktiver neuer Stack:" -ForegroundColor Cyan
Write-Host "- Datenbankeintraege: $newMediaRows"
Write-Host "- Dateien im Volume: $activeMediaFiles"
Write-Host ""

if ($legacyMediaRows -lt 1) {
    throw "Die alte Datenbank enthaelt keine Medien."
}

if ($legacyMediaFiles.Count -lt $legacyMediaRows) {
    throw "Es fehlen Dateien fuer die alten Mediendatensaetze."
}

if ($legacyStorageKeys.Count -ne $legacyMediaRows) {
    throw "Die alten Medien-Schluessel konnten nicht vollstaendig gelesen werden."
}

foreach ($storageKey in $legacyStorageKeys) {
    if (
        [System.IO.Path]::GetFileName($storageKey) -ne
            $storageKey
    ) {
        throw "Ein alter Medien-Schluessel enthaelt einen ungueltigen Pfad."
    }

    $sourceFile = Join-Path $legacyMediaPath $storageKey

    if (-not (Test-Path -LiteralPath $sourceFile -PathType Leaf)) {
        throw "Die referenzierte Mediendatei fehlt: $storageKey"
    }
}

if ($newMediaRows -ne 0 -or $activeMediaFiles -ne 0) {
    throw "Der neue Medienbestand ist nicht leer. Eine automatische Ersetzung waere unsicher."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$recoveryRoot = Join-Path $projectRoot "backups\recovery\legacy-$timestamp"
$legacyDumpPath = Join-Path $recoveryRoot "legacy-postgres16.dump"
$currentDumpPath = Join-Path $recoveryRoot "before-recovery-postgres17.dump"
$legacyMediaBackupPath = Join-Path $recoveryRoot "legacy-media"
$referencedMediaPath = Join-Path $recoveryRoot "referenced-media"

New-Item `
    -ItemType Directory `
    -Force `
    -Path $recoveryRoot |
    Out-Null

Write-Host "Sicherungen werden unter folgendem Pfad erstellt:" -ForegroundColor Yellow
Write-Host $recoveryRoot
Write-Host ""

Invoke-NativeCommand `
    -FilePath "docker" `
    -ArgumentList @(
        "exec",
        $legacyContainer,
        "pg_dump",
        "-U",
        $databaseUser,
        "-d",
        $databaseName,
        "--format=custom",
        "--file=$legacyDumpInContainer"
    )

Invoke-NativeCommand `
    -FilePath "docker" `
    -ArgumentList @(
        "cp",
        "${legacyContainer}:$legacyDumpInContainer",
        $legacyDumpPath
    )

Invoke-NativeCommand `
    -FilePath "docker" `
    -ArgumentList @(
        "exec",
        $newDatabaseContainer,
        "pg_dump",
        "-U",
        $databaseUser,
        "-d",
        $databaseName,
        "--format=custom",
        "--file=$currentDumpInContainer"
    )

Invoke-NativeCommand `
    -FilePath "docker" `
    -ArgumentList @(
        "cp",
        "${newDatabaseContainer}:$currentDumpInContainer",
        $currentDumpPath
    )

Copy-Item `
    -LiteralPath $legacyMediaPath `
    -Destination $legacyMediaBackupPath `
    -Recurse `
    -Force

New-Item `
    -ItemType Directory `
    -Force `
    -Path $referencedMediaPath |
    Out-Null

foreach ($storageKey in $legacyStorageKeys) {
    Copy-Item `
        -LiteralPath (
            Join-Path $legacyMediaPath $storageKey
        ) `
        -Destination (
            Join-Path $referencedMediaPath $storageKey
        )
}

if (
    -not (Test-Path -LiteralPath $legacyDumpPath) -or
    -not (Test-Path -LiteralPath $currentDumpPath) -or
    -not (Test-Path -LiteralPath $legacyMediaBackupPath)
) {
    throw "Mindestens eine Sicherheitskopie konnte nicht erstellt werden."
}

Write-Host "Alle Sicherheitskopien wurden erstellt." -ForegroundColor Green
Write-Host ""
Write-Host "ACHTUNG: Die gesamte aktive PostgreSQL-17-Datenbank wird durch den Altbestand ersetzt." -ForegroundColor Yellow
Write-Host "Der aktuelle Stand wurde unmittelbar zuvor separat gesichert."
$confirmation = Read-Host "Zum Fortfahren exakt MIGRATE_LEGACY_DATA eingeben"

if ($confirmation -ne "MIGRATE_LEGACY_DATA") {
    Write-Host "Migration wurde ohne Aenderungen abgebrochen."
    exit 0
}

$servicesStopped = $false

try {
    Invoke-NativeCommand `
        -FilePath "docker" `
        -ArgumentList (
            $composeArguments +
            @(
                "stop",
                "--timeout",
                "30",
                "web",
                "api"
            )
        )

    $servicesStopped = $true

    Invoke-NativeCommand `
        -FilePath "docker" `
        -ArgumentList @(
            "cp",
            $legacyDumpPath,
            "${newDatabaseContainer}:$restoreDumpInContainer"
        )

    Invoke-NativeCommand `
        -FilePath "docker" `
        -ArgumentList @(
            "exec",
            $newDatabaseContainer,
            "dropdb",
            "-U",
            $databaseUser,
            "--if-exists",
            "--force",
            "--maintenance-db=postgres",
            $databaseName
        )

    Invoke-NativeCommand `
        -FilePath "docker" `
        -ArgumentList @(
            "exec",
            $newDatabaseContainer,
            "createdb",
            "-U",
            $databaseUser,
            "--owner=$databaseUser",
            "--maintenance-db=postgres",
            $databaseName
        )

    Invoke-NativeCommand `
        -FilePath "docker" `
        -ArgumentList @(
            "exec",
            $newDatabaseContainer,
            "pg_restore",
            "-U",
            $databaseUser,
            "-d",
            $databaseName,
            "--exit-on-error",
            "--no-owner",
            "--no-privileges",
            $restoreDumpInContainer
        )

    Invoke-NativeCommand `
        -FilePath "docker" `
        -ArgumentList @(
            "run",
            "--rm",
            "--mount",
            "type=bind,source=$referencedMediaPath,target=/source,readonly",
            "--mount",
            "type=volume,source=$mediaVolumeName,target=/target",
            "postgres:17-alpine",
            "sh",
            "-lc",
            "cp -a /source/. /target/ && chown -R 1000:1000 /target"
        )

    $restoredMediaRowsText = Invoke-NativeText `
        -FilePath "docker" `
        -ArgumentList @(
            "exec",
            $newDatabaseContainer,
            "psql",
            "-U",
            $databaseUser,
            "-d",
            $databaseName,
            "-tA",
            "-c",
            "SELECT COUNT(*) FROM media_assets;"
        )

    if ([int]$restoredMediaRowsText -ne $legacyMediaRows) {
        throw "Die Anzahl der wiederhergestellten Mediendatensaetze stimmt nicht."
    }

    Invoke-NativeCommand `
        -FilePath "docker" `
        -ArgumentList (
            $composeArguments +
            @(
                "up",
                "-d",
                "--no-build",
                "--wait",
                "--wait-timeout",
                "180"
            )
        )

    $servicesStopped = $false

    Invoke-NativeCommand `
        -FilePath "powershell" `
        -ArgumentList @(
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            (Join-Path $PSScriptRoot "verify-docker-stack.ps1")
        )

    Invoke-NativeCommand `
        -FilePath "npm" `
        -ArgumentList @(
            "run",
            "backup:create"
        )

    Invoke-NativeCommand `
        -FilePath "npm" `
        -ArgumentList @(
            "run",
            "backup:restore:test"
        )

    Write-Host ""
    Write-Host "Legacy-Daten erfolgreich in den neuen Stack uebernommen." -ForegroundColor Green
    Write-Host "Wiederhergestellte Mediendatensaetze: $legacyMediaRows"
    Write-Host "Kopierte referenzierte Dateien: $($legacyStorageKeys.Count)"
    Write-Host "Separat gesicherte Altdateien: $($legacyMediaFiles.Count)"
    Write-Host "Neuer verschluesselter Snapshot und Restore-Test: erfolgreich"
    Write-Host ""
    Write-Host "Der alte Container wurde nicht entfernt."
    Write-Host "Sicherungen: $recoveryRoot"
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "FEHLER: $($_.Exception.Message)" -ForegroundColor Red

    if ($servicesStopped) {
        Write-Host "API und Web bleiben vorsichtshalber angehalten." -ForegroundColor Yellow
        Write-Host "Die Sicherheitskopien liegen hier:"
        Write-Host $recoveryRoot
    }

    exit 1
}
