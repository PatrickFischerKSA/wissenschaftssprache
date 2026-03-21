# Wissenschaftssprache

Ein webbasiertes Lern- und Überprüfungstool für wissenschaftlichen Stil. Die App verbindet lokale Heuristiken, optionale KI-Rückmeldungen, eine Rechtschreib- und Grammatikprüfung mit `LanguageTool` in `de-CH` sowie eine Korrekturfunktion für Zitation im Modus `APA` oder `Fussnoten`.

## Hauptfunktion

- Upload oder Einfügen von `txt`, `md`, `html`, `docx` und `pdf`
- Analyse wissenschaftlicher Sprache mit Markierung typischer Schwächen
- Verbesserungsvorschläge und bearbeitbare Verbesserungskopie
- Zitationsprüfung mit Umschalter zwischen `APA` und `Fussnoten`
- `LanguageTool`-Prüfung in deutschschweizer Rechtschreibung
- optionale KI-Zusatzanalyse über OpenAI

Die Hauptoberfläche liegt unter:

```text
/wissenschaftssprache/
```

## Lokal starten

```bash
npm install
npm start
```

Danach im Browser öffnen:

```text
http://localhost:3000/wissenschaftssprache/
```

## Deployment auf Render

Das Repository enthält bereits eine passende [render.yaml](./render.yaml).

Auf Render:

1. Neues Web Service aus dem GitHub-Repo erstellen.
2. Render erkennt `render.yaml` automatisch.
3. Falls gewünscht, `OPENAI_API_KEY` oder `OPENAI_API_KEY_DEFAULT` als Environment Variable setzen.
4. Deploy starten.

Wichtige Pfade:

- Startseite: `/`
- App: `/wissenschaftssprache/`
- Healthcheck: `/api/health`

## OpenAI Setup

Die KI-Erweiterung ist optional. Ohne API-Key läuft die lokale Analyse weiterhin.

Möglichkeit 1, lokal per `.env.local`:

```bash
OPENAI_API_KEY_DEFAULT="sk-..."
OPENAI_MODEL="gpt-4o-mini"
```

Möglichkeit 2, auf macOS über den Schlüsselbund:

```bash
security add-generic-password -a "$USER" -s "reden-beurteilungsroboter-openai" -w "sk-..." -U
```

## Zentrale Dateien

- [server.js](./server.js)
- [wissenschaftssprache-review.js](./wissenschaftssprache-review.js)
- [public/wissenschaftssprache/index.html](./public/wissenschaftssprache/index.html)
- [public/wissenschaftssprache/app.js](./public/wissenschaftssprache/app.js)
- [public/wissenschaftssprache/styles.css](./public/wissenschaftssprache/styles.css)
