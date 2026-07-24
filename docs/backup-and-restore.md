# BluePulse Nexus – Backup und Wiederherstellung

Diese Anleitung deckt Phase 15 vollständig ab: verschlüsselte Backups,
automatische Aufbewahrung, Repository-Prüfung, praktischer Restore-Test und
abgesicherte Komplettwiederherstellung.

## 1. Was ein Snapshot enthält

Jeder vollständige Snapshot enthält gemeinsam:

- die PostgreSQL-Datenbank als komprimiertes Custom-Format-Archiv,
- das komplette Docker-Volume der hochgeladenen Medien,
- die aktive `.env.docker` beziehungsweise `.env.production`,
- ein Manifest mit Zeitpunkt, Datenbank und Formatversion.

Restic verschlüsselt den Snapshot, bevor er im Repository abgelegt wird.
Unveränderte Datenblöcke werden dedupliziert. Der separate Restic-Schlüssel
liegt ausschließlich in `.secrets/restic-password` und wird selbst niemals in
den Snapshot aufgenommen.

## 2. Entscheidend: Restic-Schlüssel extern sichern

Ohne `.secrets/restic-password` kann kein Backup entschlüsselt werden. Die
Datei muss deshalb zusätzlich außerhalb des Rechners gesichert werden, zum
Beispiel:

- im Passwortmanager des Vereins,
- auf einem verschlüsselten, sicher verwahrten USB-Datenträger,
- in einem zweiten geschützten Administrationskonto.

Den Schlüssel niemals in Git einchecken, per E-Mail versenden oder im Chat
einfügen. Ein verlorener Schlüssel kann technisch nicht ersetzt werden.

## 3. Vollständiger lokaler Test unter Windows

Der lokale Docker-Stack muss aus Phase 14 bereits laufen:

```powershell
npm run docker:ps
npm run docker:verify
```

Danach im Projektroot genau diese Reihenfolge ausführen:

```powershell
npm run backup:env
npm run backup:config
npm run backup:build
npm run backup:create
npm run backup:list
npm run backup:check
npm run backup:restore:test
```

`backup:env` erzeugt:

- `.env.backup` mit Pfaden und Aufbewahrungsregeln,
- `.secrets/restic-password` mit einem zufälligen 256-Bit-Schlüssel,
- `backups/restic` für die verschlüsselten Snapshots,
- `backups/recovery` für separat wiederhergestellte Konfigurationen.

Beim lokalen Backup sollte während des kurzen Vorgangs nichts im CMS geändert
werden. Auf dem späteren VPS hält das Produktionsskript die API automatisch
kurz an, damit Datenbank und Medien denselben Stand repräsentieren.

`backup:restore:test` verändert weder die echte Datenbank noch das
Medienvolume. Es restauriert das Datenbankarchiv in eine neu angelegte
temporäre PostgreSQL-Datenbank, liest die Migrationstabelle, prüft Medien- und
Konfigurationspfad und löscht die Testdatenbank anschließend wieder.

Eine gesicherte Konfiguration kann ohne Überschreiben der aktiven Datei separat
extrahiert werden:

```powershell
npm run backup:recover:config
```

Das Ergebnis liegt unter `backups/recovery`.

## 4. Aufbewahrungsregeln

Die Vorgaben stehen in `.env.backup`:

```dotenv
BACKUP_KEEP_DAILY=7
BACKUP_KEEP_WEEKLY=5
BACKUP_KEEP_MONTHLY=12
BACKUP_KEEP_YEARLY=3
BACKUP_CHECK_AFTER_BACKUP=true
```

Nach jedem normalen Backup führt Restic `forget --prune` mit diesen Regeln aus
und prüft anschließend die Repository-Struktur. `backup:check` beziehungsweise
`verify-backup-production.sh` liest zusätzlich mit `restic check --read-data`
sämtliche verschlüsselten Daten vollständig. Ein Sicherheitsbackup direkt vor
einem Restore überspringt bewusst die Aufbewahrungsbereinigung, damit der
vorherige Zustand garantiert erhalten bleibt.

## 5. Vorbereitung auf dem Linux-VPS

Nach `.env.production` auch die Backup-Konfiguration erzeugen:

```bash
cd /opt/bluepulse-nexus
chmod +x scripts/*.sh
./scripts/initialize-backup-env.sh
node scripts/validate-backup-env.mjs
```

Der Linux-Generator sichert `.env.production`. Der Windows-Generator trägt
stattdessen automatisch `.env.docker` als Quelle ein.

Vor der ersten automatischen Ausführung einen vollständigen manuellen Durchlauf
machen:

```bash
./scripts/backup-production.sh
./scripts/verify-backup-production.sh
```

Das erste Skript hält eine laufende API kurz an, erstellt den gemeinsamen
Snapshot und startet die API wieder. Das zweite Skript prüft das Repository und
führt den nicht-destruktiven Datenbank-Restore-Test aus.

## 6. Täglichen systemd-Timer aktivieren

Das Projekt muss dafür wie in der Produktionsanleitung unter
`/opt/bluepulse-nexus` liegen:

```bash
sudo ./scripts/install-backup-timer.sh
```

Der Timer läuft täglich um 03:15 Uhr Europe/Berlin mit bis zu 30 Minuten
zufälliger Verzögerung. `Persistent=true` sorgt dafür, dass ein während einer
Abschaltung verpasster Lauf nachgeholt wird.

Status und Protokoll:

```bash
systemctl list-timers bluepulse-backup.timer
sudo systemctl status bluepulse-backup.service
sudo journalctl -u bluepulse-backup.service --since today
```

Manueller Produktionslauf:

```bash
sudo systemctl start bluepulse-backup.service
```

## 7. Vollständige Wiederherstellung

Snapshots anzeigen:

```bash
docker compose \
  --env-file .env.production \
  --env-file .env.backup \
  -f compose.production.yaml \
  -f compose.backup.yaml \
  run --rm backup snapshots
```

Vor einem echten Restore zuerst den gewünschten Snapshot notieren. Dann:

```bash
./scripts/restore-production.sh SNAPSHOT_ID
```

Ohne ID wird `latest` verwendet. Das Skript:

1. verlangt die exakte Eingabe `RESTORE_BLUEPULSE_NEXUS`,
2. erstellt ein zusätzliches Sicherheitsbackup ohne Bereinigung,
3. hält die API an,
4. validiert Datenbankarchiv, Medien und Konfiguration,
5. ersetzt Datenbank und Medien durch den gewählten Snapshot,
6. legt die gesicherte Konfiguration separat unter `backups/recovery` ab,
7. startet den Stack und führt die Produktionsprüfung aus.

Die aktive `.env.production` wird absichtlich nicht automatisch ersetzt.
Domain, Passwörter oder Mail-Einstellungen müssen erst verglichen und bewusst
übernommen werden.

Wenn der Restore fehlschlägt, bleibt die API aus Sicherheitsgründen angehalten.
Die Fehlermeldung beheben oder das unmittelbar zuvor angelegte
Sicherheitsbackup auswählen und den Restore erneut ausführen.

## 8. Desaster-Recovery auf einem neuen Server

Benötigt werden:

- Repository-Stand beziehungsweise Git-Clone von BluePulse Nexus,
- das vollständige verschlüsselte Verzeichnis `backups/restic`,
- der separat verwahrte Restic-Schlüssel,
- Docker Engine und Docker Compose.

Ablauf:

1. Repository nach `/opt/bluepulse-nexus` klonen.
2. Verschlüsseltes Restic-Repository nach `backups/restic` kopieren.
3. Schlüssel als `.secrets/restic-password` mit Dateimodus `600` ablegen.
4. `.env.backup` und eine minimale passende `.env.production` erstellen.
5. Images bauen und PostgreSQL starten.
6. `./scripts/restore-production.sh SNAPSHOT_ID` ausführen.
7. Wiederhergestellte Konfiguration unter `backups/recovery` vergleichen.
8. Produktionsprüfung und danach DNS/Erreichbarkeit kontrollieren.

## 9. Zweite Kopie außerhalb des VPS

Ein Backup auf derselben Festplatte schützt nicht vor Serververlust. Das
verschlüsselte Verzeichnis `backups/restic` sollte daher regelmäßig zusätzlich
auf einen unabhängigen Speicher kopiert werden. Sinnvoll ist die 3-2-1-Regel:
drei Kopien, zwei unterschiedliche Speicherarten, eine Kopie außerhalb des
Servers. Da das Repository bereits verschlüsselt ist, bleibt der Restic-
Schlüssel trotzdem separat.

Mindestens vierteljährlich und nach größeren Änderungen:

```bash
./scripts/verify-backup-production.sh
```

Der dokumentierte Restore-Test gilt erst als erfolgreich, wenn er mit Exitcode
0 endet und ausdrücklich `Restore-Test erfolgreich` meldet.
