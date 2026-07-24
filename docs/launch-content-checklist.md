# BluePulse – Inhalts- und Rechtscheck vor dem Launch

Diese Liste ergaenzt den automatischen `npm run launch:audit`. Rechtliche
Pflichtangaben muessen von einer verantwortlichen Person des Vereins geprueft
werden; die technische Pruefung ersetzt keine Rechtsberatung.

## Vor dem ersten gruene Audit zwingend eintragen

| CMS-Bereich | Pflichtpruefung |
| --- | --- |
| Website-Inhalte | Alle im Startseiten-Layout aktiven Bereiche einmal pruefen und speichern |
| Kontaktbereich | Hinweis beschreibt die Speicherung im BluePulse-Kontaktpostfach; kein alter Mailto-Text |
| Navigation | Jeder aktive Eintrag hat Beschriftung und gueltiges Ziel |
| Footer | Kontaktadresse korrekt; Impressum und Datenschutz aktiviert |
| Rechtliches-Setup | Ladungsfaehige Anschrift des Vereins |
| Rechtliches-Setup | Aktuelle Vertretung: Holger Fischer und Doreen Hoffmann |
| Rechtliches-Setup | Verantwortliche Person nach Medienstaatsvertrag samt Anschrift |
| Rechtliches-Setup | Tatsaechlich gebuchter Hostinganbieter samt korrekter Anschrift |
| Impressum | Nach der letzten Aenderung neu erzeugen und veroeffentlichen |
| Datenschutz | Nach der letzten Aenderung neu erzeugen und veroeffentlichen |
| Seiten-SEO | Fuer jede veroeffentlichte Seite eine aussagekraeftige Beschreibung |
| Medien | Jede Datenbankdatei vorhanden; jedes inhaltliche Bild mit Alt-Text |
| Benutzer | Mindestens ein aktives Administratorkonto |

## Inhalte und Aktionen

- Hero-Texte und beide Hauptbuttons
- Mission und Vereinszweck
- Projekte nur als laufend bezeichnen, wenn dies tatsaechlich stimmt
- Mitmachangebote mit erreichbaren Kontakt- oder Anmeldemoeglichkeiten
- Wirkungszahlen mit belegbarem aktuellem Stand oder Bereich deaktivieren
- Spendenziel und aktueller Betrag
- PayPal-, Bank- und Kampagnenbuttons nur sichtbar, wenn das Ziel funktioniert
- Kontaktadresse im Inhaltsbereich und Footer identisch beziehungsweise
  bewusst unterschiedlich
- Community- und Social-Links nur aktivieren, wenn das Ziel oeffentlich
  erreichbar ist

Der Audit sperrt einen sichtbaren Spendenbutton mit leerem Ziel. Nullwerte bei
Wirkungszahlen werden als Warnung ausgegeben. Eine Warnung muss vor der
menschlichen Abnahme bewusst entschieden werden.

## Rechtliche Angaben

Die folgenden Werte duerfen nicht als Platzhalter veroeffentlicht werden:

- vollstaendiger Vereinsname und Rechtsform,
- ladungsfaehige Anschrift,
- Vertretungsberechtigte,
- Kontakt-E-Mail,
- redaktionell verantwortliche Person und Anschrift, soweit erforderlich,
- Hostinganbieter und Anbieteranschrift,
- eingesetzter E-Mail-Dienst und tatsaechliche Verarbeitung,
- zutreffende Beschreibung des Kontaktformulars,
- zustaendige Datenschutzaufsicht.

Automatisch blockiert werden unter anderem:

- `BITTE ... EINTRAGEN`,
- `CHANGE_ME`,
- `TODO`,
- Beispiel-Domains,
- der veraltete Name Jeannine Kellermann,
- fehlende aktuelle Namen Holger Fischer oder Doreen Hoffmann im Impressum,
- nicht veroeffentlichtes Impressum oder nicht veroeffentlichter Datenschutz.

## Medien und Barrierearmut

Fuer jedes inhaltliche Bild:

- kurzer, konkreter Alt-Text,
- keine Formulierung wie „Bild von“, wenn sie keinen Mehrwert bietet,
- sichtbarer Ausschnitt auf Smartphone und Desktop geprueft,
- Nutzungsrecht beziehungsweise eigene Urheberschaft dokumentiert,
- keine sensiblen personenbezogenen Daten ohne Rechtsgrundlage oder
  Einwilligung.

Reine Schmuckbilder sollten in der Darstellung als dekorativ behandelt werden.
Da die Mediathek derzeit einen Text fuer jedes Bild erwartet, kann fuer solche
Dateien eine kurze interne Kennzeichnung verwendet und die konkrete Ausgabe in
der Seite geprueft werden.

## Abnahmeprotokoll

| Punkt | Geprueft von | Datum | Offen |
| --- | --- | --- | --- |
| Texte und Zahlen |  |  |  |
| Projekte und Mitmachen |  |  |  |
| Spendenwege |  |  |  |
| Bilder und Rechte |  |  |  |
| Impressum |  |  |  |
| Datenschutz |  |  |  |
| Kontaktformular |  |  |  |
| Smartphone |  |  |  |
| Desktop |  |  |  |

Nach jeder inhaltlichen Korrekturrunde erneut ausfuehren:

```powershell
npm run launch:prepare
```
