# BluePulse Nexus – Roadmap

## Abgeschlossen

- Phase 1–13: Datenmodell, PostgreSQL/API, Rollen und Anmeldung, Inhalte,
  Medien, Versionierung, Builder, Kontaktformular, SEO/Rechtliches und Tests
- Phase 14A: lokaler Docker-Produktionsstack mit Caddy, API, PostgreSQL,
  Persistenz und automatischer Funktionsprüfung
- Phase 14B: Linux-/VPS-Compose mit Domain und automatischem HTTPS
- Phase 14C: Produktions-Secrets, sichere Cookies, interne Netze,
  Security-Header und begrenzte Docker-Logs
- Phase 14D: reproduzierbare Erstbereitstellung, Produktionsprüfung und
  Betriebsdokumentation
- Phase 15: verschlüsselte Restic-Snapshots für Datenbank, Medien und
  Konfiguration, automatische Aufbewahrung, täglicher systemd-Timer,
  abgesicherte Komplettwiederherstellung und praktischer Restore-Test
- Phase 16A: automatisches Launch-Audit für Inhalte, Rechtsseiten, Medien,
  Navigation, Footer, SEO und Administratorzugang; lokaler Ein-Durchlauf mit
  Tests, Build, verschlüsseltem Abnahme-Snapshot und Restore-Test
- Phase 16B: reproduzierbare Staging-Übernahme auf den VPS,
  Produktions-Abnahme, abgesicherte DNS-Umschaltung und dokumentiertes
  Rollback

## Operative Freigabe

- finale vereins- und providerspezifische Pflichtangaben einpflegen
- VPS buchen und `neu.blue-pulse.de` zur Staging-Abnahme bereitstellen
- Abnahme dokumentieren und `blue-pulse.de` kontrolliert umschalten

Der gesamte Ablauf steht in
[`phase-16-launch.md`](phase-16-launch.md). Der Codeanteil der Roadmap ist
damit abgeschlossen. Die operative Freigabe benötigt echte Vereinsangaben,
VPS-IP und STRATO-Zugriff und kann deshalb nicht im Repository simuliert
werden.
