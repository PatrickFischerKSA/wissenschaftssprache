const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const {
  analyzeScientificStyle,
  createAiScientificReview,
  extractTextFromUpload
} = require('./wissenschaftssprache-review');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx < 1) return;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
}

loadEnvFile(path.join(__dirname, '.env.local'));
loadEnvFile(path.join(__dirname, '.env'));

const KEYCHAIN_SERVICE = 'reden-beurteilungsroboter-openai';
let cachedApiKey = null;
let cachedKeySource = 'none';

function getApiKeyFromKeychain() {
  if (process.platform !== 'darwin') return '';
  try {
    const out = execFileSync(
      'security',
      ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-w'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    return (out || '').trim();
  } catch {
    return '';
  }
}

function resolveApiKey() {
  if (cachedApiKey) {
    return { key: cachedApiKey, source: cachedKeySource };
  }

  const envKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_DEFAULT;
  if (envKey) {
    cachedApiKey = envKey;
    cachedKeySource = 'server-env';
    return { key: cachedApiKey, source: cachedKeySource };
  }

  const keychainKey = getApiKeyFromKeychain();
  if (keychainKey) {
    cachedApiKey = keychainKey;
    cachedKeySource = 'macos-keychain';
    return { key: cachedApiKey, source: cachedKeySource };
  }

  return { key: '', source: 'none' };
}

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '35mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map();

function getRoom(code) {
  if (!rooms.has(code)) {
    rooms.set(code, {
      code,
      clients: new Map(),
      state: null,
      hostId: null,
      updatedAt: Date.now()
    });
  }
  return rooms.get(code);
}

function broadcast(room, message, exceptId = null) {
  const data = JSON.stringify(message);
  for (const [clientId, ws] of room.clients.entries()) {
    if (clientId === exceptId) continue;
    if (ws.readyState === WebSocket.OPEN) ws.send(data);
  }
}

function cleanupRooms() {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (room.clients.size === 0 && now - room.updatedAt > 1000 * 60 * 30) {
      rooms.delete(code);
    }
  }
}

setInterval(cleanupRooms, 1000 * 60 * 5);

wss.on('connection', (ws) => {
  let room = null;
  let clientId = null;

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === 'join') {
      const { code, id, asHost } = msg;
      room = getRoom(code);
      clientId = id;
      room.clients.set(id, ws);
      room.updatedAt = Date.now();
      if (asHost || !room.hostId) room.hostId = id;

      ws.send(JSON.stringify({
        type: 'joined',
        code: room.code,
        hostId: room.hostId,
        state: room.state
      }));

      broadcast(room, { type: 'presence', id, joined: true }, id);
      return;
    }

    if (!room) return;

    if (msg.type === 'state') {
      if (room.hostId !== clientId) return;
      room.state = msg.state;
      room.updatedAt = Date.now();
      broadcast(room, { type: 'state', state: msg.state }, clientId);
      return;
    }

    if (msg.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong', t: Date.now() }));
      return;
    }
  });

  ws.on('close', () => {
    if (room && clientId) {
      room.clients.delete(clientId);
      room.updatedAt = Date.now();
      if (room.hostId === clientId) {
        // promote first remaining client to host
        const next = room.clients.keys().next().value || null;
        room.hostId = next;
        if (next) broadcast(room, { type: 'host', hostId: next });
      }
      broadcast(room, { type: 'presence', id: clientId, joined: false }, clientId);
    }
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

app.get('/api/health', (_req, res) => {
  const resolved = resolveApiKey();
  const keyConfigured = Boolean(resolved.key);
  res.json({
    ok: true,
    service: 'reden-beurteilungsroboter-api',
    keyConfigured,
    keySource: resolved.source,
    model: process.env.OPENAI_MODEL || 'gpt-4.1',
    transcribeModel: process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe'
  });
});

app.post('/api/ai-feedback', async (req, res) => {
  const { key: apiKey } = resolveApiKey();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    return res.status(400).json({ error: 'OPENAI_API_KEY fehlt.' });
  }

  const { transcript, scores, metrics, videoFrames } = req.body || {};
  if (
    (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) &&
    (!Array.isArray(videoFrames) || videoFrames.length === 0)
  ) {
    return res.status(400).json({ error: 'Es braucht mindestens Transkript oder Video-Keyframes.' });
  }

  const promptText = `
Du bist ein deutschsprachiger Rhetorik-Coach.
Bewerte eine Eroeffnungsrede lernfoerderlich und konstruktiv.
Fokus ist der gehaltene Auftritt (Sprechweise, Koerpersprache, Wirkung), nicht die inhaltliche Wahrheit.
Gib konkrete, umsetzbare Tipps.

Kriterienraster (vereinfacht):
- Inhalt: Korrektheit der Behauptungen, Schlüssigkeit, Strategie, Problembewusstsein, Breite, Publikumsgerechtigkeit.
- Form (Text): Aufbau, Stilistik, Sprachlogik, Umfang (2–3 Minuten), sprachliche Korrektheit.
- Form (Auftritt): Freie Rede, Rollengerechtigkeit, Blickkontakt, Mimik, Gestik, Intonation, Tempo, Lautstärke, Artikulation, Redefluss.

Messwerte:
${JSON.stringify(metrics || {}, null, 2)}

Optionale Zusatzwerte:
${JSON.stringify(scores || {}, null, 2)}

Transkript (optional, kann leer sein):
${transcript || '(nicht vorhanden)'}

Antworte als JSON mit:
{
  "summary": "2-3 Saetze",
  "rhetorical_feedback": ["mind. 4 konkrete Beobachtungen zum Auftritt"],
  "content_feedback": ["mind. 4 konkrete Beobachtungen zu Argumentstruktur und inhaltlicher Klarheit"],
  "strengths": ["..."],
  "improvements": ["..."],
  "tips": ["..."],
  "next_steps": ["..."]
}
`.trim();

  try {
    const content = [
      { type: 'input_text', text: promptText }
    ];

    if (Array.isArray(videoFrames)) {
      const selectedFrames = videoFrames.slice(0, 3);
      selectedFrames.forEach((frame, idx) => {
        if (frame && typeof frame.dataUrl === 'string' && frame.dataUrl.startsWith('data:image/')) {
          content.push({
            type: 'input_text',
            text: `Keyframe ${idx + 1} bei ca. ${frame.timeSec || 0} Sekunden`
          });
          content.push({
            type: 'input_image',
            image_url: frame.dataUrl
          });
        }
      });
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'user',
            content
          }
        ],
        max_output_tokens: 600
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      const details = (errText || '').slice(0, 2000);
      return res.status(500).json({ error: 'OpenAI API Fehler', details });
    }

    const data = await response.json();
    const outputText =
      data.output_text ||
      (Array.isArray(data.output) && data.output[0]?.content?.[0]?.text) ||
      '';

    let parsed = null;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      parsed = {
        summary: outputText,
        rhetorical_feedback: [],
        content_feedback: [],
        strengths: [],
        improvements: [],
        tips: [],
        next_steps: []
      };
    }

    return res.json({ ok: true, data: parsed });
  } catch (err) {
    return res.status(500).json({ error: 'Serverfehler', details: err.message });
  }
});

app.post('/api/transcribe-audio', async (req, res) => {
  const { key: apiKey } = resolveApiKey();
  const model = process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe';

  if (!apiKey) {
    return res.status(400).json({ error: 'OPENAI_API_KEY fehlt.' });
  }

  const { audioBase64, language } = req.body || {};
  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return res.status(400).json({ error: 'audioBase64 fehlt.' });
  }

  try {
    const buffer = Buffer.from(audioBase64, 'base64');
    const form = new FormData();
    form.append('model', model);
    form.append('language', (language && typeof language === 'string') ? language : 'de');
    form.append('file', new Blob([buffer], { type: 'audio/wav' }), 'speech.wav');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: form
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(500).json({ error: 'Transkription fehlgeschlagen.', details });
    }

    const data = await response.json();
    return res.json({ ok: true, transcript: data.text || '' });
  } catch (err) {
    return res.status(500).json({ error: 'Serverfehler', details: err.message });
  }
});

app.post('/api/argumentation-review', async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text : '';
  const normalizedText = normalizeInputText(text);

  if (normalizedText.length < 120) {
    return res.status(400).json({
      error: 'Bitte einen Text mit mindestens 120 Zeichen hochladen oder einfügen.'
    });
  }

  const heuristic = analyzeArgumentation(normalizedText);
  const { key: apiKey, source: keySource } = resolveApiKey();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  let aiReview = {
    available: Boolean(apiKey),
    used: false,
    error: apiKey ? '' : 'Kein OpenAI-Key konfiguriert. Es wird nur die lokale Analyse angezeigt.'
  };

  if (apiKey) {
    try {
      aiReview = await createAiArgumentationReview({
        text: normalizedText,
        heuristic,
        apiKey,
        model
      });
    } catch (error) {
      aiReview = {
        available: true,
        used: false,
        error: error.message || 'Die KI-Analyse konnte nicht geladen werden.'
      };
    }
  }

  return res.json({
    ok: true,
    meta: {
      keyConfigured: Boolean(apiKey),
      keySource,
      model,
      locale: 'de-CH'
    },
    heuristic,
    ai: aiReview
  });
});

app.post('/api/wissenschaftssprache-extract', async (req, res) => {
  const { filename, mimeType, contentBase64 } = req.body || {};

  if (!contentBase64 || typeof contentBase64 !== 'string') {
    return res.status(400).json({ error: 'Es wurde keine Datei zum Auslesen übermittelt.' });
  }

  try {
    const text = extractTextFromUpload({ filename, mimeType, contentBase64 });
    return res.json({
      ok: true,
      filename: typeof filename === 'string' ? filename : 'upload',
      text
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Datei konnte nicht verarbeitet werden.',
      details: error.message || 'Unbekannter Fehler'
    });
  }
});

app.post('/api/wissenschaftssprache-review', async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text : '';
  const citationStyle = req.body?.citationStyle === 'fussnoten' ? 'fussnoten' : 'apa';
  const metadata = {
    title: typeof req.body?.title === 'string' ? req.body.title : '',
    abstract: typeof req.body?.abstract === 'string' ? req.body.abstract : '',
    workType: typeof req.body?.workType === 'string' ? req.body.workType : 'allgemein'
  };
  const normalizedText = normalizeInputText(text);

  if (normalizedText.length < 120) {
    return res.status(400).json({
      error: 'Bitte einen Text mit mindestens 120 Zeichen hochladen oder einfügen.'
    });
  }

  const heuristic = analyzeScientificStyle(normalizedText, citationStyle, metadata);
  const { key: apiKey, source: keySource } = resolveApiKey();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  let aiReview = {
    available: Boolean(apiKey),
    used: false,
    error: apiKey ? '' : 'Kein OpenAI-Key konfiguriert. Es wird nur die lokale Analyse angezeigt.'
  };

  if (apiKey) {
    try {
      aiReview = await createAiScientificReview({
        text: normalizedText,
        heuristic,
        citationStyle,
        apiKey,
        model
      });
    } catch (error) {
      aiReview = {
        available: true,
        used: false,
        error: error.message || 'Die KI-Analyse konnte nicht geladen werden.'
      };
    }
  }

  return res.json({
    ok: true,
    meta: {
      keyConfigured: Boolean(apiKey),
      keySource,
      model,
      locale: 'de-CH',
      citationStyle
    },
    heuristic,
    ai: aiReview
  });
});

app.post('/api/languagetool-check', async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text : '';
  const normalizedText = normalizeInputText(text);
  const language = typeof req.body?.language === 'string' ? req.body.language : 'de-CH';

  if (!normalizedText.trim()) {
    return res.status(400).json({ error: 'Es wurde kein Text zum Prüfen übermittelt.' });
  }

  try {
    const result = await runLanguageToolCheck(normalizedText, { language });
    return res.json({ ok: true, ...result });
  } catch (error) {
    return res.status(502).json({
      error: 'LanguageTool-Prüfung fehlgeschlagen.',
      details: error.message || 'Unbekannter Fehler'
    });
  }
});

function normalizeInputText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countMarkerOccurrences(text, markers) {
  return markers.reduce((sum, marker) => {
    const regex = new RegExp(`\\b${escapeRegExp(marker)}\\b`, 'gi');
    const matches = text.match(regex);
    return sum + (matches ? matches.length : 0);
  }, 0);
}

function splitWords(text) {
  return text.match(/[A-Za-zÀ-ÖØ-öø-ÿÄÖÜäöüß]+(?:-[A-Za-zÀ-ÖØ-öø-ÿÄÖÜäöüß]+)*/g) || [];
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function scoreStatus(score) {
  if (score >= 75) return 'stark';
  if (score >= 50) return 'solide';
  return 'ausbaufähig';
}

function analyzeArgumentation(text) {
  const lowerText = text.toLowerCase();
  const paragraphs = text.split(/\n\s*\n/).map((entry) => entry.trim()).filter(Boolean);
  const sentences = splitSentences(text);
  const words = splitWords(text);

  const thesisMarkers = [
    'ich bin der meinung',
    'meiner meinung nach',
    'ich finde',
    'ich behaupte',
    'meine these',
    'es ist klar',
    'ich vertrete die auffassung',
    'meines erachtens'
  ];
  const reasonMarkers = [
    'weil',
    'denn',
    'da',
    'deshalb',
    'daher',
    'folglich',
    'somit',
    'zum einen',
    'zum anderen',
    'erstens',
    'zweitens',
    'darum'
  ];
  const evidenceMarkers = [
    'zum beispiel',
    'beispielsweise',
    'etwa',
    'laut',
    'studie',
    'statistik',
    'zahl',
    'zahlen',
    'beleg',
    'quelle'
  ];
  const counterMarkers = [
    'allerdings',
    'jedoch',
    'andererseits',
    'hingegen',
    'zwar',
    'obwohl',
    'dennoch',
    'trotzdem',
    'einwand',
    'gegenargument'
  ];
  const conclusionMarkers = [
    'zusammenfassend',
    'abschliessend',
    'abschließend',
    'fazit',
    'insgesamt',
    'schlussendlich',
    'darum zeigt sich',
    'somit lässt sich'
  ];
  const appealMarkers = [
    'wir sollten',
    'man sollte',
    'deshalb sollten wir',
    'es ist nötig',
    'es braucht',
    'ich fordere',
    'darum muss'
  ];

  const firstPart = paragraphs.slice(0, Math.max(1, Math.ceil(paragraphs.length / 3))).join(' ');
  const lastPart = paragraphs.slice(-Math.max(1, Math.ceil(paragraphs.length / 3))).join(' ');

  const thesisCount = countMarkerOccurrences(lowerText, thesisMarkers);
  const reasonCount = countMarkerOccurrences(lowerText, reasonMarkers);
  const evidenceCount =
    countMarkerOccurrences(lowerText, evidenceMarkers) +
    (text.match(/\d+(?:[.,]\d+)?\s?(?:%|prozent|million(?:en)?|milliarden?)/gi) || []).length +
    (text.match(/[„"][^„”"]{8,}[”"]/g) || []).length;
  const counterCount = countMarkerOccurrences(lowerText, counterMarkers);
  const conclusionCount = countMarkerOccurrences(lastPart.toLowerCase(), conclusionMarkers);
  const appealCount = countMarkerOccurrences(lowerText, appealMarkers);
  const connectorCount = reasonCount + counterCount + conclusionCount;

  const avgSentenceLength = sentences.length ? words.length / sentences.length : 0;
  const avgParagraphLength = paragraphs.length ? words.length / paragraphs.length : words.length;
  const rhetoricalQuestions = (text.match(/\?/g) || []).length;
  const exclamations = (text.match(/!/g) || []).length;

  const structureScore = clamp(
    30 +
      Math.min(paragraphs.length, 6) * 8 +
      Math.min(connectorCount, 6) * 5 +
      (conclusionCount > 0 ? 12 : 0),
    0,
    100
  );
  const thesisScore = clamp(
    25 + Math.min(thesisCount, 3) * 18 + (firstPart ? Math.min(countMarkerOccurrences(firstPart.toLowerCase(), thesisMarkers), 2) * 12 : 0),
    0,
    100
  );
  const evidenceScore = clamp(18 + Math.min(evidenceCount, 5) * 15, 0, 100);
  const counterScore = clamp(15 + Math.min(counterCount, 4) * 18, 0, 100);
  const languageScore = clamp(
    45 +
      (avgSentenceLength >= 11 && avgSentenceLength <= 24 ? 22 : avgSentenceLength <= 32 ? 10 : -8) +
      Math.min(rhetoricalQuestions, 2) * 8 +
      Math.min(exclamations, 1) * 4 +
      Math.min(appealCount, 3) * 7,
    0,
    100
  );
  const coherenceScore = clamp(
    28 +
      Math.min(reasonCount, 6) * 9 +
      Math.min(connectorCount, 5) * 7 +
      (avgParagraphLength >= 45 && avgParagraphLength <= 140 ? 8 : 0),
    0,
    100
  );

  const categories = [
    {
      id: 'these',
      label: 'These und Position',
      score: thesisScore,
      status: scoreStatus(thesisScore),
      observation:
        thesisScore >= 75
          ? 'Die zentrale Position ist gut erkennbar und früh im Text verankert.'
          : thesisScore >= 50
            ? 'Eine Position ist erkennbar, könnte aber noch deutlicher und früher formuliert werden.'
            : 'Die Hauptthese bleibt zu implizit oder erscheint erst spät im Text.',
      advice:
        'Formuliere zu Beginn einen klaren Leitsatz, auf den sich die folgenden Abschnitte sichtbar beziehen.'
    },
    {
      id: 'begruendung',
      label: 'Begründung und Logik',
      score: coherenceScore,
      status: scoreStatus(coherenceScore),
      observation:
        coherenceScore >= 75
          ? 'Die Gedankenschritte greifen gut ineinander und werden sprachlich verbunden.'
          : coherenceScore >= 50
            ? 'Die Argumentation ist grundsätzlich nachvollziehbar, wirkt aber stellenweise sprunghaft.'
            : 'Zwischen den Aussagen fehlen verbindende Begründungen oder klare Übergänge.',
      advice:
        'Nutze mehr kausale und folgernde Verknüpfungen wie "weil", "daher" oder "folglich", um Schlussketten sichtbarer zu machen.'
    },
    {
      id: 'belege',
      label: 'Belege und Beispiele',
      score: evidenceScore,
      status: scoreStatus(evidenceScore),
      observation:
        evidenceScore >= 75
          ? 'Mehrere Beispiele oder Belege stützen die Aussagen überzeugend ab.'
          : evidenceScore >= 50
            ? 'Es gibt einzelne Beispiele, doch einige Behauptungen bleiben noch unbelegt.'
            : 'Wichtige Aussagen stehen weitgehend ohne Beispiel, Quelle oder konkreten Fall da.',
      advice:
        'Ergänze kritische Aussagen mit einem Beispiel, einer Zahl oder einem klar benannten Einzelfall.'
    },
    {
      id: 'gegenargument',
      label: 'Gegenargumente und Differenzierung',
      score: counterScore,
      status: scoreStatus(counterScore),
      observation:
        counterScore >= 75
          ? 'Der Text nimmt Einwände auf und differenziert die eigene Position sichtbar.'
          : counterScore >= 50
            ? 'Ansätze zur Differenzierung sind vorhanden, könnten aber expliziter ausgebaut werden.'
            : 'Der Text bleibt einseitig und setzt sich kaum mit möglichen Einwänden auseinander.',
      advice:
        'Baue mindestens ein Gegenargument ein und entkräfte es anschließend mit einer klaren Gewichtung.'
    },
    {
      id: 'aufbau',
      label: 'Aufbau und Schluss',
      score: structureScore,
      status: scoreStatus(structureScore),
      observation:
        structureScore >= 75
          ? 'Die Gliederung trägt den Gedankengang, und der Schluss bündelt das Ergebnis gut.'
          : structureScore >= 50
            ? 'Der Aufbau funktioniert, könnte aber mit markanterem Schluss und klareren Abschnitten gewinnen.'
            : 'Der Text braucht eine deutlichere Gliederung mit Einleitung, Mittelteil und Schluss.',
      advice:
        'Setze auf eine klare Dreiteilung: Ausgangsthese, argumentative Entfaltung, bündelndes Fazit.'
    },
    {
      id: 'sprache',
      label: 'Sprachliche Wirkung',
      score: languageScore,
      status: scoreStatus(languageScore),
      observation:
        languageScore >= 75
          ? 'Der Stil wirkt adressatenbezogen und unterstützt die Überzeugungskraft des Textes.'
          : languageScore >= 50
            ? 'Die Sprache ist brauchbar, könnte aber präziser und wirkungsbewusster eingesetzt werden.'
            : 'Der Stil bleibt noch zu allgemein oder monoton, um stark zu überzeugen.',
      advice:
        'Schärfe Schlüsselbegriffe und setze pointierte Formulierungen gezielt statt zu oft ein.'
    }
  ];

  const strengths = categories
    .filter((entry) => entry.score >= 70)
    .map((entry) => `${entry.label}: ${entry.observation}`);

  const suggestions = categories
    .filter((entry) => entry.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((entry) => `${entry.label}: ${entry.advice}`);

  const repeatedWords = findRepeatedKeywords(words);
  const overallScore = Math.round(
    thesisScore * 0.2 +
      coherenceScore * 0.25 +
      evidenceScore * 0.2 +
      counterScore * 0.15 +
      structureScore * 0.1 +
      languageScore * 0.1
  );

  const verdict =
    overallScore >= 80
      ? 'Die Argumentation wirkt bereits überzeugend und gut strukturiert.'
      : overallScore >= 60
        ? 'Die Argumentation ist tragfähig, hat aber noch Ausbaupotenzial bei Präzision und Absicherung.'
        : 'Die Grundidee ist erkennbar, braucht aber klarere Struktur und belastbarere Begründungen.';

  return {
    overallScore,
    verdict,
    stats: {
      characters: text.length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      averageSentenceLength: Number(avgSentenceLength.toFixed(1)),
      rhetoricalQuestions
    },
    signals: {
      thesisMarkers: thesisCount,
      reasonMarkers: reasonCount,
      evidenceMarkers: evidenceCount,
      counterMarkers: counterCount,
      conclusionMarkers: conclusionCount
    },
    categories,
    strengths: strengths.length ? strengths : ['Der Text verfolgt bereits eine erkennbare argumentative Absicht.'],
    suggestions,
    rewriteTemplates: buildRewriteTemplates({
      thesisScore,
      evidenceScore,
      counterScore,
      structureScore
    }),
    repeatedKeywords: repeatedWords
  };
}

function findRepeatedKeywords(words) {
  const stopwords = new Set([
    'und', 'oder', 'aber', 'doch', 'denn', 'weil', 'dass', 'das', 'die', 'der', 'dem', 'den',
    'ein', 'eine', 'einer', 'einem', 'einen', 'ist', 'sind', 'war', 'waren', 'wie', 'mit',
    'auch', 'nicht', 'noch', 'nur', 'schon', 'sehr', 'mehr', 'wenn', 'dann', 'man', 'wir',
    'sie', 'ich', 'du', 'er', 'es', 'zu', 'im', 'in', 'am', 'an', 'auf', 'für', 'von', 'des',
    'so', 'als', 'bei', 'aus', 'einerseits', 'andererseits'
  ]);

  const counts = new Map();
  words.forEach((raw) => {
    const word = raw.toLowerCase();
    if (word.length < 5 || stopwords.has(word)) return;
    counts.set(word, (counts.get(word) || 0) + 1);
  });

  return [...counts.entries()]
    .filter(([, count]) => count >= 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));
}

function buildRewriteTemplates(scores) {
  const templates = [];

  if (scores.thesisScore < 70) {
    templates.push({
      label: 'These schärfen',
      text: 'Meine zentrale These lautet: ..., weil ... und weil ... .'
    });
  }

  if (scores.evidenceScore < 70) {
    templates.push({
      label: 'Beleg ergänzen',
      text: 'Das zeigt sich zum Beispiel an ..., denn dort wird deutlich, dass ... .'
    });
  }

  if (scores.counterScore < 70) {
    templates.push({
      label: 'Gegenargument einbauen',
      text: 'Zwar könnte man einwenden, dass ... , dennoch überzeugt dieses Argument weniger, weil ... .'
    });
  }

  if (scores.structureScore < 70) {
    templates.push({
      label: 'Schluss formulieren',
      text: 'Abschliessend zeigt sich, dass ... . Deshalb ist ... überzeugender als ... .'
    });
  }

  if (!templates.length) {
    templates.push({
      label: 'Stil verdichten',
      text: 'Entscheidend ist nicht nur ..., sondern vor allem ..., weil dadurch ... sichtbar wird.'
    });
  }

  return templates;
}

async function createAiArgumentationReview({ text, heuristic, apiKey, model }) {
  const excerpt = text.length > 12000 ? `${text.slice(0, 12000)}\n\n[Text gekürzt]` : text;
  const prompt = `
Du bist eine präzise, konstruktive Deutschlehrperson.
Analysiere die folgende Argumentation auf Deutsch (Schweizer Standardsprache).
Nutze die heuristischen Vorbefunde nur als Orientierung, nicht als Wahrheit.
Antworte ausschliesslich als JSON ohne Markdown.

Schema:
{
  "available": true,
  "used": true,
  "summary": "2-3 Sätze",
  "strengths": ["..."],
  "improvements": ["..."],
  "line_edits": [
    {
      "before": "kurzer problematischer Ausschnitt",
      "after": "verbesserte Formulierung",
      "why": "kurze Begründung"
    }
  ]
}

Heuristik:
${JSON.stringify(heuristic, null, 2)}

Text:
${excerpt}
  `.trim();

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'user',
          content: [{ type: 'input_text', text: prompt }]
        }
      ],
      max_output_tokens: 900
    })
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 1200);
    throw new Error(`KI-Analyse fehlgeschlagen: ${details}`);
  }

  const data = await response.json();
  const outputText =
    data.output_text ||
    (Array.isArray(data.output) && data.output[0]?.content?.[0]?.text) ||
    '';

  let parsed;
  try {
    parsed = JSON.parse(outputText);
  } catch {
    throw new Error('Die KI-Antwort war kein gültiges JSON.');
  }

  return {
    available: true,
    used: true,
    summary: String(parsed.summary || ''),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    lineEdits: Array.isArray(parsed.line_edits) ? parsed.line_edits.slice(0, 5) : []
  };
}

function buildLanguageToolChunks(text, maxLength = 18000) {
  if (text.length <= maxLength) {
    return [{ text, start: 0 }];
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxLength, text.length);

    if (end < text.length) {
      const nextParagraphBreak = text.lastIndexOf('\n\n', end);
      const nextSentenceBreak = text.lastIndexOf('. ', end);
      const boundary = Math.max(nextParagraphBreak, nextSentenceBreak);
      if (boundary > start + 2000) {
        end = boundary + (boundary === nextParagraphBreak ? 2 : 1);
      }
    }

    chunks.push({
      text: text.slice(start, end),
      start
    });
    start = end;
  }

  return chunks.slice(0, 8);
}

async function runLanguageToolCheck(text, options = {}) {
  const baseUrl = process.env.LANGUAGETOOL_BASE_URL || 'https://api.languagetool.org/v2/check';
  const language = options.language || 'de-CH';
  const chunks = buildLanguageToolChunks(text);
  const matches = [];

  for (const chunk of chunks) {
    const payload = new URLSearchParams({
      text: chunk.text,
      language
    });

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        Accept: 'application/json'
      },
      body: payload.toString()
    });

    if (!response.ok) {
      const details = (await response.text()).slice(0, 1000);
      throw new Error(`HTTP ${response.status}: ${details || response.statusText}`);
    }

    const data = await response.json();
    const chunkMatches = Array.isArray(data.matches) ? data.matches : [];

    chunkMatches.forEach((match) => {
      matches.push({
        message: match.message || 'Hinweis',
        shortMessage: match.shortMessage || '',
        offset: Number(match.offset || 0) + chunk.start,
        length: Number(match.length || 0),
        replacements: Array.isArray(match.replacements)
          ? match.replacements.slice(0, 4).map((entry) => entry.value).filter(Boolean)
          : [],
        sentence: match.sentence || '',
        context: match.context || null,
        rule: {
          id: match.rule?.id || '',
          description: match.rule?.description || ''
        },
        category: {
          id: match.rule?.category?.id || '',
          name: match.rule?.category?.name || ''
        },
        issueType: match.rule?.issueType || ''
      });
    });
  }

  matches.sort((a, b) => a.offset - b.offset);

  return {
    language,
    baseUrl,
    chunkCount: chunks.length,
    matchCount: matches.length,
    truncated: text.length > chunks.reduce((sum, chunk) => sum + chunk.text.length, 0),
    matches: matches.slice(0, 80)
  };
}

module.exports = {
  app,
  server,
  analyzeArgumentation,
  normalizeInputText,
  buildLanguageToolChunks,
  runLanguageToolCheck
};
