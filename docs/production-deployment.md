# BluePulse Nexus – Produktion und VPS-Vorbereitung

Diese Anleitung deckt die Produktionsbereitstellung aus Phase 14 ab. Die
verschlüsselten Backups und die Wiederherstellung aus Phase 15 sind in
[`backup-and-restore.md`](backup-and-restore.md) beschrieben. Die lokale
Docker-Umgebung aus Phase 14A bleibt unverändert nutzbar.

Die konkrete Staging-Abnahme, Inhaltsprüfung und DNS-Umschaltung aus Phase 16
steht in [`phase-16-launch.md`](phase-16-launch.md).

## 1. Architektur

Der Produktionsstack besteht aus drei Diensten:

- `web`: Caddy, React-Website, Reverse Proxy und automatische HTTPS-Zertifikate
- `api`: Fastify-API, Migrationen, CMS, Kontaktformular und Mediendateien
- `database`: PostgreSQL ohne öffentlichen Host-Port

Nur Caddy veröffentlicht Ports:

- TCP 80 für die Zertifikatsprüfung und HTTPS-Weiterleitung
- TCP 443 für HTTPS
- UDP 443 für HTTP/3

PostgreSQL ist ausschließlich im internen Docker-Netz erreichbar. Die API ist
nicht direkt aus dem Internet erreichbar. Datenbank, Medien und
Caddy-Zertifikate liegen in getrennten Docker-Volumes.

## 2. Produktionskonfiguration lokal vorbereiten

Unter Windows im Projektroot:

```powershell
npm run production:env
npm run production:config
npm run production:caddy:check
```

Der erste Befehl erzeugt `.env.production` mit:

- einem zufälligen PostgreSQL-Passwort,
- einem zufälligen Geheimnis für den Kontakt-IP-Hash,
- `blue-pulse.de` als vorbereiteter Domain,
- sicheren Produktions-Cookies,
- zunächst deaktiviertem E-Mail-Versand.

`.env.production` darf niemals in Git eingecheckt oder im Chat geteilt werden.
Die Datei ist durch `.gitignore` ausgeschlossen.

Soll eine andere endgültige Domain verwendet werden, müssen in
`.env.production` beide Werte gemeinsam angepasst werden:

```dotenv
SITE_DOMAIN=example.org
APP_PUBLIC_URL=https://example.org
```

Der E-Mail-Versand bleibt zunächst deaktiviert. Zum späteren Aktivieren:

```dotenv
MAIL_ENABLED=true
MAIL_PASSWORD=GOOGLE_APP_PASSWORT_OHNE_LEERZEICHEN
```

Danach erneut ausführen:

```powershell
npm run production:config
```

`production:config` prüft Geheimnisse, Domain, HTTPS-Adresse, sichere Cookies
und die Docker-Compose-Konfiguration. `production:caddy:check` baut bei Bedarf
das Web-Image und validiert die Caddy-Konfiguration, startet aber keinen
dauerhaften Dienst und fordert kein Zertifikat an.

## 3. Was lokal nicht gestartet werden soll

`npm run production:up` ist für den späteren Server vorgesehen. Auf dem
Windows-Entwicklungsrechner soll weiterhin ausschließlich der getestete lokale
Stack laufen:

```powershell
npm run docker:up
npm run docker:ps
npm run docker:verify
```

Der Produktionsstack benötigt eine öffentlich erreichbare Domain sowie freie
Ports 80 und 443.

## 4. Voraussetzungen des späteren Linux-VPS

Vor dem ersten Start werden benötigt:

- 64-Bit-Linux mit aktuellen Sicherheitsupdates
- Docker Engine und das Docker-Compose-Plugin
- Git
- OpenSSL
- curl
- SSH-Anmeldung mit Schlüssel statt Passwort
- Firewallfreigaben nur für SSH, TCP 80, TCP 443 und UDP 443
- DNS-A-Eintrag auf die IPv4-Adresse des VPS
- optional DNS-AAAA-Eintrag, aber nur bei funktionierender IPv6-Anbindung

PostgreSQL-Port 5432 und API-Port 3001 dürfen nicht in der Firewall
veröffentlicht werden.

## 5. Repository und Konfiguration auf dem VPS

Beispielpfad:

```bash
sudo mkdir -p /opt/bluepulse-nexus
sudo chown "$USER":"$USER" /opt/bluepulse-nexus
git clone https://github.com/mikejaeson1-wq/BluePulse-Nexus.git /opt/bluepulse-nexus
cd /opt/bluepulse-nexus
```

Produktionskonfiguration erzeugen:

```bash
chmod +x scripts/*.sh
./scripts/initialize-production-env.sh
./scripts/initialize-backup-env.sh
```

Danach `.env.production` prüfen. Insbesondere:

```dotenv
SITE_DOMAIN=blue-pulse.de
APP_PUBLIC_URL=https://blue-pulse.de
ACME_EMAIL=bluepulsekontakt@gmail.com
```

Vor dem Start müssen die DNS-Einträge bereits auf den VPS zeigen. Caddy
beantragt beim ersten Start automatisch das HTTPS-Zertifikat.

## 6. Erste Bereitstellung

Die Erstbereitstellung erfolgt mit:

```bash
./scripts/deploy-production.sh
```

Der Ablauf:

1. prüft die Produktionskonfiguration,
2. prüft die Backup-Konfiguration und den separat gespeicherten Schlüssel,
3. validiert Docker Compose,
4. baut Anwendungs- und Backup-Images frisch,
5. validiert Caddy innerhalb des Web-Containers,
6. startet alle Dienste,
7. wartet auf gesunde Container,
8. zeigt den Containerstatus.

Danach:

```bash
./scripts/verify-production-stack.sh
./scripts/backup-production.sh
./scripts/verify-backup-production.sh
```

Die Prüfung kontrolliert Website, API, PostgreSQL-Verbindung, `robots.txt`,
Sitemap, CMS-Route, HTTPS und den HSTS-Sicherheitsheader. Der zusätzliche
Backup-Durchlauf erstellt den ersten verschlüsselten Snapshot und restauriert
ihn praktisch in eine temporäre Datenbank.

## 7. Betriebskommandos

Auf dem Windows-PC oder einem Rechner mit Node.js:

```bash
npm run production:config
npm run production:caddy:check
npm run production:ps
npm run production:logs
npm run production:create-admin
npm run production:down
```

Direkt auf dem Linux-VPS:

```bash
docker compose --env-file .env.production -f compose.production.yaml ps
docker compose --env-file .env.production -f compose.production.yaml logs -f --tail=200
docker compose --env-file .env.production -f compose.production.yaml exec api node src/auth/createInitialAdmin.js
docker compose --env-file .env.production -f compose.production.yaml down
```

`down` entfernt keine Datenvolumes. Befehle mit `--volumes` dürfen im
Produktionsbetrieb nicht verwendet werden.

## 8. Sicherheitsmerkmale

- automatische HTTPS-Zertifikate und HTTPS-Weiterleitung durch Caddy
- sichere und HTTP-only Anmelde-Cookies
- PostgreSQL ohne öffentlichen Port
- getrenntes internes Datenbanknetz
- API-Dateisystem schreibgeschützt, ausgenommen Medienvolume und `/tmp`
- entfernte Linux-Capabilities des API-Containers
- `no-new-privileges` für API und Webserver
- HSTS, MIME-Schutz, Frame-Schutz, Referrer- und Berechtigungsrichtlinie
- rotierende Docker-Logs mit maximal fünf Dateien zu je 10 MB pro Dienst
- keine Geheimnisse im Repository
- verschlüsselte Komplettsnapshots mit separat verwahrtem Schlüssel
- automatische Aufbewahrung und praktisch geprüfte Wiederherstellung

## 9. Abschlusskriterien von Phase 14

Phase 14 gilt als abgeschlossen, wenn:

- der lokale Stack aus Phase 14A weiterhin vollständig funktioniert,
- `docker/Caddyfile.local` tatsächlich von Git erfasst wird,
- `.env.production` sicher erzeugt und validiert werden kann,
- `compose.production.yaml` ohne Fehler validiert,
- die Produktionsarchitektur keine Datenbank oder API direkt veröffentlicht,
- HTTPS, Persistenz und sichere Cookies vorbereitet sind,
- Erstbereitstellung und Produktionsprüfung dokumentiert sind.

Phase 15 ergänzt diese Produktionsbasis um automatische, verschlüsselte
Backups. Phase 16 ergänzt das automatische Inhaltsaudit, die Staging-Abnahme
und die abgesicherte DNS-Umschaltung.
