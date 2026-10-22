# Wissenschaftssprache – Gratisversion

Die gesamte Werkstatt läuft als statische Seite auf GitHub Pages. Keine API-Schlüssel,
keine KI-Aufrufe, keine externen Prüfdienste, keine kostenpflichtigen Abhängigkeiten.
Es wird kein Node-Hosting benötigt. Eingaben und Dateien werden von der Anwendung nicht versendet.

## Funktionen und Grenzen

- Regelbasierte Stil-, Struktur-, Zitations- und Dossierhinweise im Browser.
- Drei regelbasierte Überarbeitungsstufen mit nachvollziehbaren Eingriffen.
- TXT, Markdown, HTML, DOCX und PDFs mit Textebene lokal lesen (bis 20 MB / 250 PDF-Seiten).
  Keine OCR für Scans. PDF-Lesereihenfolge und Absätze können vom Original abweichen;
  DOCX-Import liest den Haupttext, nicht Kopfzeilen, Kommentare oder Fussnoten.
- Lokaler Sprach-Basischeck für ausgewählte Fehler, Wiederholungen und Schweizer ss-Schreibung.
  Keine vollständige Grammatikprüfung. Browser-Rechtschreibprüfung ist zusätzlich aktiviert;
  mögliche erweiterte Browser-Prüfdienste werden durch eigene Browsereinstellungen gesteuert.
- Anpassbarer Prompt zum manuellen Kopieren in ein selbst gewähltes Gratisangebot.
  Keine automatische Übermittlung oder Zusicherung fremder Gratislimits.
- Bewertungen sind heuristische Orientierung, keine Benotung, Quellenprüfung oder Plagiatsprüfung.

## Veröffentlichung

`.github/workflows/pages.yml` veröffentlicht die statischen Dateien auf GitHub Pages.
Direkter Einstieg: `/wissenschaftssprache/public/wissenschaftssprache/`.
Eine frühere Render-Konfiguration und die API-Implementierung wurden entfernt.
Das beendet keine möglicherweise früher separat eingerichteten Hosting-Abonnements.

## Lokal (optional)

`npm start` startet mit Node ohne Paketinstallation einen reinen statischen Vorschauserver.
Dann `http://localhost:3000/wissenschaftssprache/` öffnen. `npm test` prüft die lokale Engine.

## Quellen

`public/wissenschaftssprache/review-engine.js` enthält die Browseranalyse.
`app.js` steuert Dateilesen, Darstellung, Basischeck und Prompt.
PDF.js 4.10.38 (Apache-2.0) und fflate 0.8.2 (MIT) liegen mit Lizenzen unter `vendor/`.
Bibliotheken werden lokal ausgeliefert, ohne CDN-Aufrufe.
