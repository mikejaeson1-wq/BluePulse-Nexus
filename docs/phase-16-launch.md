# BluePulse Nexus – Phase 16: Staging, Abnahme und Launch

Phase 16 ist als kontrollierter Ein-Durchlauf aufgebaut. Lokal prueft ein
einziger Befehl den vollstaendigen CMS-Stand, den Quellcode und das
verschluesselte Backup. Auf dem VPS prueft ein zweiter Befehl Inhalte, HTTPS,
API und eine echte Wiederherstellung. Der Domainwechsel besitzt eine
Sicherung, eine ausdrueckliche Freigabe und eine automatische Rueckkehr zur
vorherigen Domainkonfiguration.

Der echte Launch kann erst erfolgen, wenn folgende externe Angaben vorliegen:

- ladungsfaehige Vereinsanschrift,
- verantwortliche Person fuer redaktionelle Inhalte samt Anschrift,
- tatsaechlich gebuchter Hostinganbieter samt korrekter Anbieteranschrift,
- VPS-IPv4-Adresse und SSH-Zugang,
- STRATO-Zugang fuer die DNS-Freigabe,
- echte Ziele aller sichtbaren Spenden- und Social-Media-Buttons.

Diese Werte werden aus rechtlichen und sicherheitsrelevanten Gruenden nicht
automatisch geraten.

## 1. Phase-16-Paket lokal uebernehmen

Das ZIP wie bei den vorherigen Phasen in den bestehenden Projektordner
entpacken und vorhandene Dateien ersetzen. Danach im Projektroot:

```powershell
npm run launch:prepare
```

Der Befehl erledigt in dieser Reihenfolge:

1. Docker-Images mit dem neuen Audit aktualisieren und Stack starten,
2. Website, API und PostgreSQL pruefen,
3. CMS-Inhalte, Rechtsseiten, Medien und Benutzer auditieren,
4. alle Web- und API-Tests ausfuehren,
5. Lint und Produktions-Build ausfuehren,
6. einen neuen verschluesselten Snapshot erstellen,
7. das Restic-Repository vollstaendig lesen,
8. den neuesten Snapshot in einer temporaeren Datenbank restaurieren.

Der Bericht liegt danach unter
`backups/recovery/launch-readiness-DATUM-UHRZEIT.txt`. Er enthaelt keine
Passwoerter. Sobald ein Blocker erkannt wird, stoppt der Lauf mit einer
konkreten CMS-Stelle und Loesung. Nach der Korrektur denselben Befehl erneut
ausfuehren.

Einzelpruefung nur fuer Inhalte:

```powershell
npm run launch:audit
```

Die vollstaendige Inhaltsliste steht in
[`launch-content-checklist.md`](launch-content-checklist.md).

## 2. Finalen lokalen Snapshot notieren

Wenn `launch:prepare` erfolgreich war:

```powershell
npm run backup:list
```

Die ID des neuesten inhaltlich vollstaendigen Snapshots notieren. Beim Umzug
auf den VPS muss genau diese ID verwendet werden. `latest` ist fuer den ersten
Server-Restore ungeeignet, weil das Restore-Skript unmittelbar vorher ein
zusaetzliches Sicherheitsbackup des neuen Servers anlegt.

Ausserdem muss `.secrets\restic-password` bereits ausserhalb des PCs sicher
verwahrt sein. Ohne diesen Schluessel ist der Snapshot nicht lesbar.

## 3. VPS vorbereiten

Empfohlen ist ein aktuelles 64-Bit-Ubuntu- oder Debian-System. Benoetigt werden:

- SSH-Anmeldung mit Schluessel,
- aktuelle Sicherheitsupdates,
- Docker Engine und Docker-Compose-Plugin,
- Git, curl und OpenSSL,
- TCP 80 und 443 sowie UDP 443 in der Firewall,
- SSH nur fuer die benoetigten Administrationsadressen, soweit praktisch.

Nicht freigeben:

- PostgreSQL 5432,
- API 3001.

Projekt installieren:

```bash
sudo mkdir -p /opt/bluepulse-nexus
sudo chown "$USER":"$USER" /opt/bluepulse-nexus
git clone https://github.com/mikejaeson1-wq/BluePulse-Nexus.git \
  /opt/bluepulse-nexus
cd /opt/bluepulse-nexus
chmod +x scripts/*.sh
./scripts/initialize-production-env.sh
./scripts/initialize-backup-env.sh
```

In `.env.production` fuer die Abnahme setzen:

```dotenv
SITE_DOMAIN=neu.blue-pulse.de
APP_PUBLIC_URL=https://neu.blue-pulse.de
ACME_EMAIL=bluepulsekontakt@gmail.com
```

Mail kann fuer die erste technische Abnahme deaktiviert bleiben. Fuer die
abschliessende Kontaktformular-Abnahme die echten SMTP-Werte setzen und
`MAIL_ENABLED=true` verwenden.

## 4. Verschluesselten Datenstand auf den VPS kopieren

Zuerst den durch `initialize-backup-env.sh` neu erzeugten VPS-Schluessel durch
den bereits separat gesicherten lokalen Schluessel ersetzen. Den Schluessel
nicht im Chat, in Git oder per E-Mail uebertragen.

Beispiel aus PowerShell; Benutzername und Serveradresse ersetzen:

```powershell
scp -r .\backups\restic `
  VPS_USER@VPS_IP:/opt/bluepulse-nexus/backups/

scp .\.secrets\restic-password `
  VPS_USER@VPS_IP:/opt/bluepulse-nexus/.secrets/restic-password
```

Auf dem VPS:

```bash
cd /opt/bluepulse-nexus
chmod 600 .env.production .env.backup .secrets/restic-password
docker compose \
  --env-file .env.production \
  --env-file .env.backup \
  -f compose.production.yaml \
  -f compose.backup.yaml \
  config --quiet
```

## 5. STRATO-Staging ohne E-Mail-Eingriff

Im STRATO-Kundenlogin:

1. `Domains` und `Domainverwaltung` oeffnen.
2. Unter `blue-pulse.de` die Subdomain `neu` anlegen.
3. Fuer `neu.blue-pulse.de` den A-Record auf die VPS-IPv4 setzen.
4. Einen AAAA-Record nur setzen, wenn IPv6 auf dem VPS wirklich funktioniert.
5. MX-, SPF-, DKIM-, DMARC-, TXT- und bestehende Mail-CNAME-Eintraege nicht
   veraendern.

STRATO dokumentiert A-Records fuer Haupt- und Subdomains separat. Caddy kann
das oeffentliche Zertifikat automatisch ausstellen, sobald A/AAAA auf den VPS
zeigen und die Ports 80/443 erreichbar sind:

- <https://www.strato.de/faq/domains/wie-kann-ich-bei-strato-meine-dns-eintraege-verwalten/>
- <https://caddyserver.com/docs/automatic-https>

DNS pruefen:

```powershell
Resolve-DnsName neu.blue-pulse.de -Type A
```

Die ausgegebene IPv4 muss der VPS-IP entsprechen.

## 6. Staging bereitstellen und den lokalen Stand restaurieren

Auf dem VPS:

```bash
cd /opt/bluepulse-nexus
./scripts/deploy-production.sh
./scripts/restore-production.sh SNAPSHOT_ID
```

Bei der Abfrage exakt `RESTORE_BLUEPULSE_NEXUS` eingeben. Anschliessend:

```bash
./scripts/verify-launch-production.sh
```

Dieser eine Lauf prueft:

- Produktionskonfiguration und Container,
- CMS-Inhalte und Pflichtseiten,
- Vertretung durch Holger Fischer und Doreen Hoffmann,
- das Fehlen des veralteten Namens Jeannine Kellermann,
- Medien-Dateien und Alt-Texte,
- HTTPS, HSTS, Website, API, Datenbank, Sitemap und CMS-Route,
- einen neuen verschluesselten Snapshot,
- einen praktischen Restore-Test,
- die Erreichbarkeit nach dem Backup.

Nur `PHASE 16 BESTANDEN` ist eine technische Freigabe.

## 7. Menschliche Staging-Abnahme

Unter `https://neu.blue-pulse.de` pruefen:

- Startseite auf Smartphone und Desktop,
- Navigation und alle sichtbaren Buttons,
- aktuelle Texte, Zahlen, Projekte und Spendenziele,
- Bilder, Bildausschnitte und Alt-Texte,
- Impressum und Datenschutz mit finalen echten Angaben,
- Kontaktformular und Eingang der Benachrichtigung,
- Anmeldung im CMS,
- Bearbeiten und erneutes Veroeffentlichen einer Testaenderung,
- anschliessende Ruecknahme dieser Testaenderung.

Abnahme dokumentieren:

| Freigabe | Name | Datum | Ergebnis |
| --- | --- | --- | --- |
| Inhalt |  |  |  |
| Rechtliche Angaben |  |  |  |
| Technik |  |  |  |
| Vereinsvertretung |  |  |  |

## 8. DNS-Umschaltung und Launch in einem Lauf

Vorher im STRATO-Login Screenshots oder Notizen der bestehenden
`blue-pulse.de`-A/AAAA-Werte anlegen. Der MX-Record und die Mail-Eintraege
bleiben unveraendert.

Dann den A-Record der Hauptdomain `blue-pulse.de` auf die VPS-IPv4 setzen. Ein
AAAA-Record wird wiederum nur bei getesteter IPv6-Anbindung gesetzt.

Auf einem unabhaengigen Rechner pruefen:

```powershell
Resolve-DnsName blue-pulse.de -Type A
```

Erst wenn die neue VPS-IP erscheint, auf dem VPS starten:

```bash
cd /opt/bluepulse-nexus
./scripts/switch-production-domain.sh blue-pulse.de
```

Zur Freigabe exakt `SWITCH_BLUEPULSE_DOMAIN` eingeben. Das Skript:

1. erstellt vor der Umschaltung ein verschluesseltes Sicherheitsbackup,
2. sichert die bisherige `.env.production`,
3. setzt Domain und oeffentliche URL gemeinsam,
4. baut und startet den Produktionsstack,
5. fuehrt den kompletten Phase-16-Produktionscheck aus,
6. kehrt bei einem Fehler automatisch zur vorherigen Domainkonfiguration
   zurueck.

Bei Erfolg erscheint `DOMAINWECHSEL ERFOLGREICH`.

Die aktuelle Caddy-Konfiguration bedient bewusst die kanonische Domain
`https://blue-pulse.de`. Einen zusaetzlichen `www`-DNS-Eintrag erst einrichten,
wenn er explizit als zweite Caddy-Domain oder als getestete Weiterleitung
konfiguriert wurde.

## 9. Rollback

Wenn der technische Wechsel fehlschlaegt, stellt das Skript die vorherige
Staging-Umgebung wieder her. Der externe DNS-A-Record kann nicht automatisch
zurueckgesetzt werden.

Fuer einen vollstaendigen Rueckweg:

1. den Hauptdomain-A/AAAA-Eintrag bei STRATO auf den zuvor dokumentierten Wert
   zuruecksetzen,
2. auf dem VPS den Status pruefen:

   ```bash
   docker compose --env-file .env.production \
     -f compose.production.yaml ps
   ```

3. falls Daten betroffen sind, den notierten Sicherheits-Snapshot verwenden:

   ```bash
   ./scripts/restore-production.sh SNAPSHOT_ID
   ```

4. Fehler analysieren, waehrend `neu.blue-pulse.de` weiter fuer die Abnahme
   genutzt wird.

Nie `docker compose down --volumes` ausfuehren. Dieser Befehl wuerde
Produktionsdaten entfernen.

## 10. Direkt nach dem Launch

```bash
./scripts/install-backup-timer.sh
systemctl list-timers bluepulse-backup.timer
./scripts/verify-launch-production.sh
```

Danach:

- Website und Kontaktpostfach 24 Stunden eng beobachten,
- Caddy-/API-Logs auf Fehler pruefen,
- externen zweiten Restic-Repository-Stand aktualisieren,
- VPS-, STRATO- und Vereinszugang im Passwortmanager dokumentieren,
- alten Webstand und alte Daten erst nach erfolgreicher Beobachtungsphase
  entfernen.
