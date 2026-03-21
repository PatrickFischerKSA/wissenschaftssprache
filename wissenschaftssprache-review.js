const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SWISS_REPLACEMENTS = [
  [/\bIch finde, dass\b/gi, 'Die Analyse legt nahe, dass'],
  [/\bMeiner Meinung nach\b/gi, 'Aus den vorliegenden Befunden ergibt sich, dass'],
  [/\bIch denke, dass\b/gi, 'Die Ergebnisse deuten darauf hin, dass'],
  [/\bWir sehen, dass\b/gi, 'Es zeigt sich, dass'],
  [/\bman sieht\b/gi, 'es zeigt sich'],
  [/\beigentlich\b/gi, ''],
  [/\bnatürlich\b/gi, ''],
  [/\bsozusagen\b/gi, ''],
  [/\bgewisserma(?:ß|ss)en\b/gi, 'in gewissem Umfang'],
  [/\bein bisschen\b/gi, 'teilweise'],
  [/\bKrankenschwestern\b/g, 'Pflegefachpersonen'],
  [/\bKrankenschwester\b/g, 'Pflegefachperson'],
  [/\bStewardessen\b/g, 'Flugbegleiterinnen und Flugbegleiter'],
  [/\bStewardess\b/g, 'Flugbegleiterin'],
  [/\bStudenten\b/g, 'Studierende'],
  [/\bStudent\b/g, 'Studierender'],
  [/\bSchüler\b/g, 'Lernende'],
  [/\bLehrer\b/g, 'Lehrpersonen'],
  [/ß/g, 'ss']
];

const SUBJECTIVE_PATTERNS = [
  {
    id: 'ich-form',
    title: 'Ich-Formulierung',
    regex: /\b(ich finde|ich denke|ich bin der meinung|meiner meinung nach|ich behaupte)\b/i,
    suggestion: 'Formuliere Beobachtungen sachlich und stütze sie auf Befunde oder Quellen.'
  },
  {
    id: 'man-form',
    title: 'Man-Formulierung',
    regex: /\bman\b/i,
    suggestion: 'Prüfe, ob eine präzisere Subjektbezeichnung oder eine passivische Formulierung möglich ist.'
  },
  {
    id: 'umgangssprache',
    title: 'Umgangssprachlicher Ausdruck',
    regex: /\b(eigentlich|natürlich|ein bisschen|sozusagen|gewissermassen|gewissermaßen|klarerweise)\b/i,
    suggestion: 'Ersetze alltagssprachliche Weichmacher durch präzise, überprüfbare Formulierungen.'
  },
  {
    id: 'vagheit',
    title: 'Unpräziser Sammelbegriff',
    regex: /\b(Sachen|Dinge|Leute|irgendwie)\b/i,
    suggestion: 'Benutze fachlich genauere Begriffe und nenne die relevante Gruppe oder den Sachverhalt explizit.'
  }
];

const GENDERED_TERMS = [
  'Studenten',
  'Schüler',
  'Lehrer',
  'Autoren',
  'Mitarbeiter',
  'Leser',
  'Krankenschwester',
  'Stewardess'
];

const INCLUSIVE_MARKERS = [
  'Studierende',
  'Lehrpersonen',
  'Lernende',
  'Autor:innen',
  'Autorinnen und Autoren',
  'Schüler:innen',
  'Mitarbeitende',
  'Pflegefachperson'
];

const SCIENTIFIC_CONNECTORS = [
  'folglich',
  'demnach',
  'zudem',
  'hingegen',
  'darüber hinaus',
  'somit',
  'daher',
  'ferner',
  'erstens',
  'zweitens',
  'abschliessend',
  'zusammenfassend'
];

const EVIDENCE_MARKERS = [
  'laut',
  'gemäss',
  'gemäß',
  'studie',
  'studien',
  'daten',
  'erhebung',
  'befund',
  'befunde',
  'forschung',
  'quelle',
  'abbildung',
  'tabelle'
];

const LIGHT_REVISION_RULES = [
  {
    title: 'Ich-Formulierung objektivieren',
    category: 'objektivitaet',
    pattern: /\bIch finde, dass\b/gi,
    replacement: 'Die Analyse legt nahe, dass',
    reason: 'Der wissenschaftliche Ton wird sachlicher.'
  },
  {
    title: 'Meinungsmarker neutralisieren',
    category: 'objektivitaet',
    pattern: /\bMeiner Meinung nach\b/gi,
    replacement: 'Aus den vorliegenden Befunden ergibt sich, dass',
    reason: 'Subjektive Einleitungen werden durch Befundsprache ersetzt.'
  },
  {
    title: 'Denkmarker objektivieren',
    category: 'objektivitaet',
    pattern: /\bIch denke, dass\b/gi,
    replacement: 'Die Ergebnisse deuten darauf hin, dass',
    reason: 'Persönliche Einschätzung wird als analytische Beobachtung formuliert.'
  },
  {
    title: 'man-Formulierung glätten',
    category: 'objektivitaet',
    pattern: /\bman kann sagen, dass\b/gi,
    replacement: 'Es lässt sich festhalten, dass',
    reason: 'Unpräzise Alltagssprache wird in wissenschaftliche Standardsprache überführt.'
  },
  {
    title: 'Weichmacher entfernen',
    category: 'praezision',
    pattern: /\beigentlich\b/gi,
    replacement: '',
    reason: 'Überflüssige Abschwächungen werden entfernt.'
  },
  {
    title: 'Selbstverständlichkeit entfernen',
    category: 'praezision',
    pattern: /\bnatürlich\b/gi,
    replacement: '',
    reason: 'Unbelegte Selbstverständlichkeiten schwächen die Präzision.'
  },
  {
    title: 'Umgangssprachliche Füllung entfernen',
    category: 'praezision',
    pattern: /\bsozusagen\b/gi,
    replacement: '',
    reason: 'Die Formulierung wird konzentrierter.'
  },
  {
    title: 'Schweizer Schreibweise angleichen',
    category: 'sprache',
    pattern: /ß/g,
    replacement: 'ss',
    reason: 'Der Text wird an de-CH angepasst.'
  },
  {
    title: 'Inklusive Personenbezeichnung einsetzen',
    category: 'inklusion',
    pattern: /\bStudenten\b/g,
    replacement: 'Studierende',
    reason: 'Die Formulierung wird inklusiver.'
  },
  {
    title: 'Inklusive Personenbezeichnung einsetzen',
    category: 'inklusion',
    pattern: /\bSchüler\b/g,
    replacement: 'Lernende',
    reason: 'Die Formulierung wird inklusiver.'
  },
  {
    title: 'Inklusive Personenbezeichnung einsetzen',
    category: 'inklusion',
    pattern: /\bLehrer\b/g,
    replacement: 'Lehrpersonen',
    reason: 'Die Formulierung wird inklusiver.'
  }
];

const STANDARD_REVISION_RULES = [
  {
    title: 'Verweisverb präzisieren',
    category: 'praezision',
    pattern: /\b([A-ZÄÖÜ][A-Za-zÄÖÜäöüß-]+)\s+sagt, dass\b/g,
    replacement: (_match, name) => `${name} argumentiert, dass`,
    reason: 'Wissenschaftliche Texte benennen Aussagen meist analytischer als bloßes „sagen“.'
  },
  {
    title: 'Vage Sammelbezeichnung schärfen',
    category: 'praezision',
    pattern: /\ban vielen Dingen\b/gi,
    replacement: 'an zahlreichen Aspekten',
    reason: 'Vage Formulierungen werden fachsprachlich präziser.'
  },
  {
    title: 'Vage Sammelbezeichnung schärfen',
    category: 'praezision',
    pattern: /\bDinge\b/g,
    replacement: 'Aspekte',
    reason: 'Vage Formulierungen werden fachsprachlich präziser.'
  },
  {
    title: 'Unpräzise Personenbezeichnung schärfen',
    category: 'praezision',
    pattern: /\bLeute\b/g,
    replacement: 'Personen',
    reason: 'Umgangssprachliche Gruppenbezeichnungen werden formalisiert.'
  },
  {
    title: 'Schlussmarker wissenschaftlicher formulieren',
    category: 'struktur',
    pattern: /\bAbschliessend kann man sagen, dass\b/gi,
    replacement: 'Zusammenfassend lässt sich festhalten, dass',
    reason: 'Der Schluss klingt so weniger mündlich und klarer strukturiert.'
  }
];

const RADICAL_REVISION_RULES = [
  {
    title: 'Schlussmarker verdichten',
    category: 'struktur',
    pattern: /\bAbschliessend\b/gi,
    replacement: 'Zusammenfassend',
    reason: 'Der Schluss wird terminologisch vereinheitlicht.'
  },
  {
    title: 'Halbpräzise Formulierung schärfen',
    category: 'praezision',
    pattern: /\bhalb genau\b/gi,
    replacement: 'nur unzureichend präzise',
    reason: 'Umgangssprachliche Wertungen werden akademisch präzisiert.'
  }
];

function normalizeText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

function countMarkerOccurrences(text, markers) {
  return markers.reduce((sum, marker) => {
    const matches = text.match(new RegExp(`\\b${escapeRegExp(marker)}\\b`, 'gi'));
    return sum + (matches ? matches.length : 0);
  }, 0);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function statusFromScore(score) {
  if (score >= 80) return 'stark';
  if (score >= 60) return 'solide';
  return 'ausbaufähig';
}

function decodeEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"')
    .replace(/&#x2013;/gi, '–')
    .replace(/&#x2014;/gi, '—')
    .replace(/&#x00df;/gi, 'ß')
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripHtml(html) {
  return normalizeText(
    decodeEntities(
      String(html || '')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|section|article|li|h\d)>/gi, '\n\n')
        .replace(/<[^>]+>/g, ' ')
    )
  );
}

function extractDocxXmlText(xml) {
  return normalizeText(
    decodeEntities(
      String(xml || '')
        .replace(/<w:tab[^>]*\/>/g, '\t')
        .replace(/<w:br[^>]*\/>/g, '\n')
        .replace(/<\/w:p>/g, '\n\n')
        .replace(/<[^>]+>/g, '')
    )
  );
}

function extractDocxText(filePath) {
  try {
    const output = execFileSync('textutil', ['-convert', 'txt', '-stdout', filePath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    return normalizeText(output);
  } catch {}

  try {
    const xml = execFileSync('unzip', ['-p', filePath, 'word/document.xml'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    return extractDocxXmlText(xml);
  } catch (error) {
    throw new Error(`DOCX konnte nicht gelesen werden: ${error.message}`);
  }
}

function extractPdfText(filePath) {
  const script = `
from pathlib import Path
import sys

path = Path(sys.argv[1])
errors = []

for module_name in ("pypdf", "PyPDF2"):
    try:
        mod = __import__(module_name)
        reader = mod.PdfReader(str(path))
        text = "\\n".join((page.extract_text() or "") for page in reader.pages)
        print(text)
        raise SystemExit(0)
    except Exception as exc:
        errors.append(f"{module_name}: {exc}")

print("\\n".join(errors))
raise SystemExit(2)
  `.trim();

  try {
    const output = execFileSync('python3', ['-c', script, filePath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    return normalizeText(output);
  } catch (error) {
    throw new Error(`PDF konnte nicht gelesen werden: ${error.message}`);
  }
}

function withTemporaryFile(buffer, extension, reader) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wiss-style-'));
  const tempFile = path.join(tempDir, `upload${extension}`);

  try {
    fs.writeFileSync(tempFile, buffer);
    return reader(tempFile);
  } finally {
    try {
      fs.unlinkSync(tempFile);
    } catch {}
    try {
      fs.rmdirSync(tempDir);
    } catch {}
  }
}

function extractTextFromUpload({ filename, mimeType, contentBase64 }) {
  const name = String(filename || 'upload').trim() || 'upload';
  const extension = path.extname(name).toLowerCase();
  const buffer = Buffer.from(String(contentBase64 || ''), 'base64');
  const normalizedMimeType = String(mimeType || '').toLowerCase();

  if (!buffer.length) {
    throw new Error('Die hochgeladene Datei enthält keinen lesbaren Inhalt.');
  }

  if (['.txt', '.md', '.csv', '.rtf'].includes(extension) || normalizedMimeType.startsWith('text/')) {
    return normalizeText(buffer.toString('utf8'));
  }

  if (['.html', '.htm'].includes(extension)) {
    return stripHtml(buffer.toString('utf8'));
  }

  if (extension === '.docx') {
    return withTemporaryFile(buffer, extension, extractDocxText);
  }

  if (extension === '.pdf') {
    return withTemporaryFile(buffer, extension, extractPdfText);
  }

  throw new Error('Unterstützt werden aktuell TXT, MD, HTML, DOCX und PDF.');
}

function findSentenceWithPattern(sentences, regex) {
  return sentences.find((sentence) => regex.test(sentence)) || '';
}

function collectQuotes(text) {
  const quotes = [];
  const regex = /[„"]([^"“”„]{6,}?)["“”]/g;
  let match;

  while ((match = regex.exec(text))) {
    quotes.push({
      text: match[0],
      content: match[1],
      index: match.index,
      end: match.index + match[0].length
    });
  }

  return quotes;
}

function detectApaCitations(text) {
  const regex = /\((?:vgl\.\s*)?[A-ZÄÖÜ][A-Za-zÄÖÜäöüß-]+(?:\s(?:und|&)\s[A-ZÄÖÜ][A-Za-zÄÖÜäöüß-]+| et al\.)?,\s*\d{4}[a-z]?(?:,\s*S\.\s*\d+(?:\s*f{1,2}\.?)?)?\)/g;
  return text.match(regex) || [];
}

function detectFootnoteMarkers(text) {
  const inlineMarkers = text.match(/(?:\^?\d{1,2}|\[\d{1,2}\])(?=\s|$)/g) || [];
  const lineFootnotes = text.match(/^\d+\s.+$/gm) || [];
  return {
    inlineMarkers,
    lineFootnotes
  };
}

function findUncitedQuotes(text, citationStyle) {
  const quotes = collectQuotes(text);
  const uncited = [];

  quotes.forEach((quote) => {
    const afterWindow = text.slice(quote.end, quote.end + 140);
    const nearbyWindow = text.slice(Math.max(0, quote.index - 20), quote.end + 140);
    const hasApa = detectApaCitations(nearbyWindow).length > 0;
    const footnoteHit = /(?:\^?\d{1,2}|\[\d{1,2}\])/.test(afterWindow.slice(0, 12));
    const cited = citationStyle === 'apa' ? hasApa : footnoteHit;
    if (!cited) {
      uncited.push(quote);
    }
  });

  return uncited;
}

function countMatches(text, items) {
  return items.reduce((sum, item) => {
    const regex = new RegExp(`\\b${escapeRegExp(item)}\\b`, 'gi');
    const matches = text.match(regex);
    return sum + (matches ? matches.length : 0);
  }, 0);
}

function buildCitationGuide(citationStyle) {
  if (citationStyle === 'fussnoten') {
    return {
      mode: 'Fussnoten',
      rule: 'Direkte Zitate brauchen eine Fussnotenziffer unmittelbar nach dem Zitat; sinngemässe Übernahmen werden ebenfalls nachgewiesen.',
      examples: [
        'Direktes Zitat: „... Bus.“1',
        'Sinngemässe Übernahme: Vgl. Frenzel, Herbert A. und Elisabeth: Daten deutscher Dichtung ..., S. 27 ff.',
        'Internetquelle in der Fussnote: URL plus Abrufdatum in Klammern.'
      ],
      checklist: [
        'Setze die Fussnotenziffer direkt nach Zitat, Paraphrase oder Bezugnahme.',
        'Führe in der Fussnote Autor, Titel, Ort, Jahr und Seite möglichst vollständig an.',
        'Nutze bei sinngemässen Übernahmen ein klares Signal wie „Vgl.“.',
        'Gib bei Internetquellen URL und Abrufdatum an.',
        'Bleibe innerhalb der ganzen Arbeit bei genau einem Fussnotenstil.'
      ]
    };
  }

  return {
    mode: 'APA',
    rule: 'Direkte und indirekte Übernahmen werden im Fliesstext mit Autor, Jahr und Seitenangabe markiert.',
    examples: [
      'Direktes Zitat: „...“ (Müller, 2024, S. 15).',
      'Paraphrase: Die Studie betont die Bedeutung klarer Struktur (vgl. Müller, 2024, S. 15).',
      'Mehrere Autor:innen: (Meier & Keller, 2023, S. 7).'
    ],
    checklist: [
      'Setze nach direkten und indirekten Übernahmen unmittelbar einen Klammerbeleg.',
      'Nenne Autor, Jahr und bei Textstellen die genaue Seitenzahl.',
      'Kennzeichne sinngemässe Übernahmen mit einem passenden Verweis wie „vgl.“.',
      'Nutze für mehrere Autor:innen eine einheitliche Schreibweise, z. B. „&“ oder „und“ nach Vorgabe.',
      'Mische keine Fussnotenziffern in einen sonst durchgängig APA-basierten Fliesstext.'
    ]
  };
}

function cleanupRevisionText(text) {
  return String(text || '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;!?])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

function createRevisionAction({ level, category, title, reason, before, after }) {
  return {
    level,
    category,
    title,
    reason,
    before: String(before || '').trim(),
    after: String(after || '').trim()
  };
}

function applyRevisionRuleSet(text, rules, level) {
  let revised = String(text || '');
  const actions = [];

  rules.forEach((rule) => {
    let localCount = 0;
    revised = revised.replace(rule.pattern, (...args) => {
      const match = args[0];
      const replacement = typeof rule.replacement === 'function'
        ? rule.replacement(...args)
        : rule.replacement;

      if (replacement === undefined || replacement === null || replacement === match) {
        return replacement;
      }

      if (localCount < 4) {
        actions.push(
          createRevisionAction({
            level,
            category: rule.category,
            title: rule.title,
            reason: rule.reason,
            before: match,
            after: replacement
          })
        );
      }

      localCount += 1;
      return replacement;
    });
  });

  return {
    text: cleanupRevisionText(revised),
    actions
  };
}

function addCitationPlaceholders(text, citationStyle, uncitedQuotes, level) {
  if (!Array.isArray(uncitedQuotes) || !uncitedQuotes.length) {
    return { text, actions: [] };
  }

  let revised = String(text || '');
  const actions = [];
  const placeholder = citationStyle === 'apa'
    ? ' (Autor, Jahr, S. xx ergänzen)'
    : '[Fussnote mit Quelle ergänzen]';

  uncitedQuotes.slice(0, 3).forEach((quote) => {
    if (!quote?.text || !revised.includes(quote.text)) return;
    const after = `${quote.text}${placeholder}`;
    revised = revised.replace(quote.text, after);
    actions.push(
      createRevisionAction({
        level,
        category: 'zitation',
        title: 'Nachweisplatzhalter ergänzen',
        reason:
          citationStyle === 'apa'
            ? 'Direkte Zitate sollten sofort mit einem Klammerbeleg abgesichert werden.'
            : 'Direkte Zitate sollten sofort mit einer Fussnote abgesichert werden.',
        before: quote.text,
        after
      })
    );
  });

  return {
    text: cleanupRevisionText(revised),
    actions
  };
}

function splitOverlongSentences(text, level) {
  const paragraphs = String(text || '').split(/\n\s*\n/).map((entry) => entry.trim()).filter(Boolean);
  const actions = [];

  const revisedParagraphs = paragraphs.map((paragraph) => {
    const sentences = splitSentences(paragraph);
    const updatedSentences = sentences.map((sentence) => {
      if (splitWords(sentence).length < 28) return sentence;

      const replacements = [
        [/\s*,\s*weil\s+/i, '. Dies wird damit begründet, dass '],
        [/\s*,\s*denn\s+/i, '. Begründend gilt: '],
        [/\s*,\s*aber\s+/i, '. Gleichzeitig gilt jedoch: '],
        [/\s*,\s*obwohl\s+/i, '. Zugleich zeigt sich, dass ']
      ];

      for (const [pattern, replacement] of replacements) {
        if (pattern.test(sentence)) {
          const after = sentence.replace(pattern, replacement);
          actions.push(
            createRevisionAction({
              level,
              category: 'struktur',
              title: 'Langen Satz aufteilen',
              reason: 'Lange Satzperioden werden in klarere Gedankenschritte zerlegt.',
              before: sentence,
              after
            })
          );
          return after;
        }
      }

      return sentence;
    });

    return updatedSentences.join(' ');
  });

  return {
    text: cleanupRevisionText(revisedParagraphs.join('\n\n')),
    actions
  };
}

function improveParagraphStructure(text, level) {
  const paragraphs = String(text || '').split(/\n\s*\n/).map((entry) => entry.trim()).filter(Boolean);
  const actions = [];

  if (paragraphs.length !== 1) {
    return { text, actions };
  }

  const sentences = splitSentences(paragraphs[0]);
  if (sentences.length < 5) {
    return { text, actions };
  }

  const firstCut = Math.max(2, Math.floor(sentences.length / 3));
  const secondCut = Math.max(firstCut + 1, Math.floor((sentences.length * 2) / 3));
  const rebuilt = [
    sentences.slice(0, firstCut).join(' '),
    sentences.slice(firstCut, secondCut).join(' '),
    sentences.slice(secondCut).join(' ')
  ].filter(Boolean).join('\n\n');

  actions.push(
    createRevisionAction({
      level,
      category: 'struktur',
      title: 'Absatzstruktur ausbauen',
      reason: 'Ein einziger Langabsatz wird in klarere Funktionsabschnitte gegliedert.',
      before: paragraphs[0],
      after: rebuilt
    })
  );

  return {
    text: cleanupRevisionText(rebuilt),
    actions
  };
}

function strengthenParagraphTransitions(text, level) {
  const paragraphs = String(text || '').split(/\n\s*\n/).map((entry) => entry.trim()).filter(Boolean);
  const actions = [];

  if (paragraphs.length < 2) {
    return { text, actions };
  }

  const updated = paragraphs.map((paragraph, index) => {
    if (index === 0) return paragraph;
    if (/^(Darüber hinaus|Ferner|Zudem|Zusammenfassend|Abschliessend|Schliesslich)\b/i.test(paragraph)) {
      return paragraph;
    }

    const prefix = index === paragraphs.length - 1 ? 'Schliesslich gilt: ' : 'Darüber hinaus gilt: ';
    const after = `${prefix}${paragraph}`;
    actions.push(
      createRevisionAction({
        level,
        category: 'struktur',
        title: 'Absatzübergang schärfen',
        reason: 'Der Absatzanschluss wird im radikalen Modus expliziter geführt.',
        before: paragraph,
        after
      })
    );
    return after;
  });

  return {
    text: cleanupRevisionText(updated.join('\n\n')),
    actions
  };
}

function strengthenConclusion(text, level) {
  const paragraphs = String(text || '').split(/\n\s*\n/).map((entry) => entry.trim()).filter(Boolean);
  const actions = [];

  if (!paragraphs.length) {
    return { text, actions };
  }

  const lastParagraph = paragraphs[paragraphs.length - 1];
  const sentences = splitSentences(lastParagraph);
  if (!sentences.length) {
    return { text, actions };
  }

  const lastSentence = sentences[sentences.length - 1];
  if (/^(Zusammenfassend|Abschliessend|Insgesamt)\b/i.test(lastSentence)) {
    return { text, actions };
  }

  const strengthened = `Zusammenfassend gilt: ${lastSentence}`;
  sentences[sentences.length - 1] = strengthened;
  paragraphs[paragraphs.length - 1] = sentences.join(' ');

  actions.push(
    createRevisionAction({
      level,
      category: 'struktur',
      title: 'Schluss explizit markieren',
      reason: 'Der letzte Gedankenschritt wird als Fazit klar sichtbar gemacht.',
      before: lastSentence,
      after: strengthened
    })
  );

  return {
    text: cleanupRevisionText(paragraphs.join('\n\n')),
    actions
  };
}

function buildRevisionLevel(id, label, description, text, stageActions, cumulativeActions, focus) {
  const cleaned = cleanupRevisionText(text);
  return {
    id,
    label,
    description,
    focus,
    text: cleaned,
    stageActions,
    actions: cumulativeActions,
    stats: {
      words: splitWords(cleaned).length,
      sentences: splitSentences(cleaned).length,
      paragraphs: cleaned.split(/\n\s*\n/).map((entry) => entry.trim()).filter(Boolean).length,
      changeCount: cumulativeActions.length
    }
  };
}

function buildRevisionPlan(levels, categories, citationStyle) {
  const items = [];
  const standard = levels.find((level) => level.id === 'standard');
  const radical = levels.find((level) => level.id === 'radikal');
  const weakestCategories = (categories || []).slice().sort((a, b) => a.score - b.score).slice(0, 3);

  weakestCategories.forEach((category, index) => {
    items.push({
      priority: index === 0 ? 'sofort' : index === 1 ? 'hoch' : 'danach',
      title: category.label,
      summary: category.advice
    });
  });

  items.push({
    priority: 'hoch',
    title: citationStyle === 'apa' ? 'APA-Nachweise absichern' : 'Fussnoten absichern',
    summary:
      citationStyle === 'apa'
        ? 'Direkte Übernahmen sollten unmittelbar mit Autor, Jahr und Seite abgesichert werden.'
        : 'Direkte Übernahmen sollten unmittelbar mit einer vollständigen Fussnote abgesichert werden.'
  });

  if (standard) {
    items.push({
      priority: 'danach',
      title: 'Standard-Überarbeitung',
      summary: `${standard.stats.changeCount} Eingriffe glätten Ton, Präzision und Zitationssignale.`
    });
  }

  if (radical) {
    items.push({
      priority: 'optional',
      title: 'Radikale Straffung',
      summary: `${radical.stats.changeCount} kumulative Eingriffe verdichten Struktur, Fazit und Satzführung deutlich stärker.`
    });
  }

  return items;
}

function buildRevisionWorkbench({ text, citationStyle, uncitedQuotes, categories }) {
  const lightBase = applyRevisionRuleSet(text, LIGHT_REVISION_RULES, 'leicht');
  const lightLevel = buildRevisionLevel(
    'leicht',
    'Leicht',
    'Glättet Ton, Schweizer Schreibweise und inklusive Begriffe, ohne die Struktur stark anzutasten.',
    lightBase.text,
    lightBase.actions,
    [...lightBase.actions],
    ['Ton glätten', 'de-CH angleichen', 'inklusive Begriffe einsetzen']
  );

  const standardRules = applyRevisionRuleSet(lightBase.text, STANDARD_REVISION_RULES, 'standard');
  const standardStructure = improveParagraphStructure(standardRules.text, 'standard');
  const standardCitations = addCitationPlaceholders(
    standardStructure.text,
    citationStyle,
    uncitedQuotes,
    'standard'
  );
  const standardStageActions = [
    ...standardRules.actions,
    ...standardStructure.actions,
    ...standardCitations.actions
  ];
  const standardLevel = buildRevisionLevel(
    'standard',
    'Standard',
    'Überarbeitet Ton, Präzision, Absatzlogik und ergänzt Platzhalter für fehlende Nachweise.',
    standardCitations.text,
    standardStageActions,
    [...lightLevel.actions, ...standardStageActions],
    ['Verweisverben präzisieren', 'Langabsätze gliedern', 'fehlende Nachweise sichtbar machen']
  );

  const radicalRules = applyRevisionRuleSet(standardLevel.text, RADICAL_REVISION_RULES, 'radikal');
  const radicalSplits = splitOverlongSentences(radicalRules.text, 'radikal');
  const radicalTransitions = strengthenParagraphTransitions(radicalSplits.text, 'radikal');
  const radicalConclusion = strengthenConclusion(radicalTransitions.text, 'radikal');
  const radicalStageActions = [
    ...radicalRules.actions,
    ...radicalSplits.actions,
    ...radicalTransitions.actions,
    ...radicalConclusion.actions
  ];
  const radicalLevel = buildRevisionLevel(
    'radikal',
    'Radikal',
    'Strafft Satzführung und Schluss deutlich stärker und führt den Text näher an eine schulisch-wissenschaftliche Modellfassung.',
    radicalConclusion.text,
    radicalStageActions,
    [...standardLevel.actions, ...radicalStageActions],
    ['Satzperioden zerlegen', 'Schluss explizit machen', 'Modellfassung annähern']
  );

  return {
    levels: [lightLevel, standardLevel, radicalLevel],
    plan: buildRevisionPlan([lightLevel, standardLevel, radicalLevel], categories, citationStyle)
  };
}

function hasHeading(text, headings) {
  const normalized = String(text || '');
  return headings.some((heading) => {
    const regex = new RegExp(`(^|\\n)\\s*(?:\\d+(?:\\.\\d+)*)?\\s*${escapeRegExp(heading)}\\b`, 'i');
    return regex.test(normalized);
  });
}

function buildFacharbeitGuide(workType = 'allgemein') {
  const structureByType = {
    allgemein: [
      'Inhaltsverzeichnis',
      'Vorwort oder Einleitung',
      'Aufarbeitung und Darlegung der Ergebnisse',
      'Diskussion, Folgerungen oder Einsichten',
      'Zusammenfassung oder Schluss',
      'Quellenverzeichnis',
      'Eigenständigkeitserklärung'
    ],
    geisteswissenschaftlich: [
      'Inhaltsverzeichnis',
      'Abstract (wo verlangt)',
      'Vorwort',
      'Einleitung',
      'Hauptteil',
      'Diskussion, Zusammenfassung und Schluss',
      'Quellenverzeichnis',
      'Eigenständigkeitserklärung'
    ],
    naturwissenschaftlich: [
      'Inhaltsverzeichnis',
      'Abstract',
      'Vorwort',
      'Einleitung',
      'Grundlagen',
      'Methode oder Untersuchung',
      'Ergebnisse',
      'Diskussion oder Schluss',
      'Quellenverzeichnis',
      'Eigenständigkeitserklärung'
    ]
  };

  return {
    coreRequirements: [
      'Thema präzise eingrenzen und fachwissenschaftlich verankern.',
      'Eine klar ausgewiesene eigene Untersuchung oder Erhebung integrieren.',
      'Gedanken anderer sauber von eigenen Schlussfolgerungen trennen.',
      'Internetquellen mit genauer Adresse und Abrufdatum angeben.',
      'Titel maximal 100 Zeichen, Haupttext in der Regel 15 bis 20 reine Textseiten.'
    ],
    submissionHints: [
      'Für die Facharbeit werden laut Dossier Papierfassung, PDF, anonymisierte Word-/PDF-Version, Abstractblatt und je nach Absprache ein Arbeitsjournal verlangt.',
      'Das Abstractblatt soll kurz und präzis formuliert sein und zwingend eine Visualisierung mit Quellenangabe enthalten.',
      'Im Dossier sind zudem Präsentationsvorgaben zu PowerPoint, Dateiformaten und Testlauf festgehalten.'
    ],
    structure: structureByType[workType] || structureByType.allgemein
  };
}

function analyzeFacharbeitRequirements({ text, title, abstract, workType }) {
  const normalizedText = normalizeText(text);
  const normalizedTitle = normalizeText(title);
  const normalizedAbstract = normalizeText(abstract);
  const lowerText = normalizedText.toLowerCase();
  const lowerAbstract = normalizedAbstract.toLowerCase();
  const words = splitWords(normalizedText);
  const urls = normalizedText.match(/https?:\/\/\S+/gi) || [];
  const ownInvestigationMarkers = [
    'umfrage',
    'interview',
    'fragebogen',
    'experiment',
    'versuch',
    'erhebung',
    'auswertung',
    'beobachtung',
    'analyse',
    'messung',
    'fallbeispiel',
    'archivmaterial',
    'quellenanalyse'
  ];
  const abstractMarkers = ['fragestellung', 'ergebnis', 'ergebnisse', 'schlussfolgerung', 'methode', 'untersuchung'];
  const headingSets = {
    allgemein: {
      introduction: ['Einleitung', 'Vorwort'],
      body: ['Hauptteil', 'Ergebnisse', 'Darlegung der Ergebnisse'],
      discussion: ['Diskussion', 'Schluss', 'Zusammenfassung'],
      sources: ['Quellenverzeichnis', 'Literaturverzeichnis'],
      declaration: ['Eigenständigkeitserklärung']
    },
    geisteswissenschaftlich: {
      introduction: ['Einleitung', 'Vorwort'],
      body: ['Hauptteil'],
      discussion: ['Diskussion', 'Zusammenfassung', 'Schluss'],
      sources: ['Quellenverzeichnis'],
      declaration: ['Eigenständigkeitserklärung']
    },
    naturwissenschaftlich: {
      introduction: ['Einleitung'],
      body: ['Grundlagen', 'Methode', 'Untersuchung', 'Ergebnisse'],
      discussion: ['Diskussion', 'Schluss'],
      sources: ['Quellenverzeichnis'],
      declaration: ['Eigenständigkeitserklärung']
    }
  };
  const selectedHeadings = headingSets[workType] || headingSets.allgemein;
  const titleLength = normalizedTitle.length;
  const abstractWords = splitWords(normalizedAbstract).length;
  const ownInvestigationCount = countMarkerOccurrences(lowerText, ownInvestigationMarkers);
  const abstractSignalCount = countMarkerOccurrences(lowerAbstract, abstractMarkers);
  const headingHits = Object.values(selectedHeadings).reduce((sum, group) => sum + (hasHeading(normalizedText, group) ? 1 : 0), 0);

  let internetDateCount = 0;
  urls.forEach((url) => {
    const urlIndex = normalizedText.indexOf(url);
    const window = normalizedText.slice(Math.max(0, urlIndex - 40), Math.min(normalizedText.length, urlIndex + url.length + 70));
    if (/\b(?:Abruf|abgerufen|Stand)\b/i.test(window) || /\(\d{1,2}\.\d{1,2}\.\d{4}\)/.test(window)) {
      internetDateCount += 1;
    }
  });

  const issues = [];

  if (!normalizedTitle) {
    issues.push({
      id: 'facharbeit-title-missing',
      type: 'facharbeit',
      severity: 'hoch',
      title: 'Titel der Facharbeit fehlt',
      excerpt: 'Im Dossier ist ein klarer Haupttitel vorgesehen.',
      suggestion: 'Ergänze einen präzisen Titel und halte den Haupttitel unter 100 Zeichen.'
    });
  } else if (titleLength > 100) {
    issues.push({
      id: 'facharbeit-title-length',
      type: 'facharbeit',
      severity: 'hoch',
      title: 'Titel ist zu lang',
      excerpt: normalizedTitle,
      suggestion: `Der Haupttitel umfasst ${titleLength} Zeichen. Laut Dossier sollte er höchstens 100 Zeichen lang sein.`
    });
  }

  if (!normalizedAbstract) {
    issues.push({
      id: 'facharbeit-abstract-missing',
      type: 'facharbeit',
      severity: 'mittel',
      title: 'Abstract fehlt',
      excerpt: 'Im Dossier wird für das Abstractblatt eine kurze, präzise Zusammenfassung verlangt.',
      suggestion: 'Füge ein kurzes Abstract hinzu, das Fragestellung, Vorgehen, Ergebnisse und Schlussfolgerung bündelt.'
    });
  } else if (abstractWords < 35 || abstractSignalCount < 2) {
    issues.push({
      id: 'facharbeit-abstract-weak',
      type: 'facharbeit',
      severity: 'mittel',
      title: 'Abstract ist noch zu knapp oder unscharf',
      excerpt: normalizedAbstract.slice(0, 220),
      suggestion: 'Verdichte das Abstract so, dass Fragestellung, Methode, wichtigste Ergebnisse und Schluss klar sichtbar werden.'
    });
  }

  if (ownInvestigationCount < 2) {
    issues.push({
      id: 'facharbeit-investigation',
      type: 'facharbeit',
      severity: 'hoch',
      title: 'Eigene Untersuchung ist zu wenig sichtbar',
      excerpt: 'Im Dossier wird eine klar ausgewiesene eigene Untersuchung oder Erhebung verlangt.',
      suggestion: 'Markiere deutlicher, wo Umfrage, Interview, Analyse, Experiment oder eigene Auswertung im Text stattfinden.'
    });
  }

  if (headingHits < 3 && words.length > 1200) {
    issues.push({
      id: 'facharbeit-structure',
      type: 'facharbeit',
      severity: 'mittel',
      title: 'Facharbeitsstruktur ist nicht klar ausgewiesen',
      excerpt: 'Die geforderten Teile wie Einleitung, Ergebnisse, Schluss oder Quellenverzeichnis sollten deutlicher sichtbar sein.',
      suggestion: 'Arbeite mit expliziten Kapitelüberschriften, damit die Facharbeitsstruktur sofort erkennbar wird.'
    });
  }

  if (urls.length > internetDateCount) {
    issues.push({
      id: 'facharbeit-internet-sources',
      type: 'facharbeit',
      severity: 'mittel',
      title: 'Internetquellen ohne Abrufdatum erkannt',
      excerpt: urls.slice(0, 2).join(' · '),
      suggestion: 'Ergänze bei Internetquellen eine genaue URL und das Datum der Abfrage, wie es im Dossier verlangt wird.'
    });
  }

  if (words.length > 2500 && !hasHeading(normalizedText, selectedHeadings.declaration) && !/selbstständig.*angegebenen quellen/i.test(lowerText)) {
    issues.push({
      id: 'facharbeit-declaration',
      type: 'facharbeit',
      severity: 'mittel',
      title: 'Eigenständigkeitserklärung nicht sichtbar',
      excerpt: 'Im Dossier ist die Eigenständigkeitserklärung als eigener Teil am Schluss vorgesehen.',
      suggestion: 'Prüfe, ob die Eigenständigkeitserklärung am Ende der Arbeit als eigener Abschnitt eingefügt ist.'
    });
  }

  const titleScore = normalizedTitle ? (titleLength <= 100 ? 100 : clamp(100 - (titleLength - 100) * 3, 10, 85)) : 25;
  const abstractScore = !normalizedAbstract
    ? 25
    : clamp(55 + Math.min(abstractWords, 120) * 0.35 + abstractSignalCount * 8, 25, 100);
  const structureScore = clamp(35 + headingHits * 14 + (words.length >= 2500 ? 8 : 0), 25, 100);
  const investigationScore = clamp(30 + ownInvestigationCount * 18, 20, 100);
  const sourceScore = clamp(55 + Math.min(internetDateCount, 4) * 10 - Math.max(urls.length - internetDateCount, 0) * 10, 20, 100);

  const overallScore = Math.round(
    titleScore * 0.15 +
      abstractScore * 0.2 +
      structureScore * 0.25 +
      investigationScore * 0.25 +
      sourceScore * 0.15
  );

  return {
    score: overallScore,
    status: statusFromScore(overallScore),
    observation:
      overallScore >= 80
        ? 'Zentrale Anforderungen des Facharbeitsdossiers sind im Text bereits gut sichtbar.'
        : overallScore >= 60
          ? 'Mehrere Dossier-Anforderungen sind erkennbar, einzelne Pflichtteile sollten aber noch klarer ausgearbeitet werden.'
          : 'Wichtige Elemente der Facharbeit nach Dossier sind noch zu wenig sichtbar oder zu wenig klar markiert.',
    advice: 'Prüfe Titel, Abstract, eigene Untersuchung, Kapitelstruktur, Internetquellen und Eigenständigkeitserklärung gezielt gegen das Dossier.',
    issues,
    guide: buildFacharbeitGuide(workType),
    signals: {
      titleLength,
      abstractWords,
      ownInvestigationCount,
      headingHits,
      urls: urls.length,
      internetDateCount
    }
  };
}

function analyzeScientificStyle(text, citationStyle = 'apa', metadata = {}) {
  const normalizedText = normalizeText(text);
  const normalizedTitle = normalizeText(metadata.title || '');
  const normalizedAbstract = normalizeText(metadata.abstract || '');
  const workType = metadata.workType === 'naturwissenschaftlich'
    ? 'naturwissenschaftlich'
    : metadata.workType === 'geisteswissenschaftlich'
      ? 'geisteswissenschaftlich'
      : 'allgemein';
  const lowerText = normalizedText.toLowerCase();
  const words = splitWords(normalizedText);
  const sentences = splitSentences(normalizedText);
  const paragraphs = normalizedText.split(/\n\s*\n/).map((entry) => entry.trim()).filter(Boolean);
  const apaCitations = detectApaCitations(normalizedText);
  const footnotes = detectFootnoteMarkers(normalizedText);
  const uncitedQuotes = findUncitedQuotes(normalizedText, citationStyle);
  const directQuoteCount = collectQuotes(normalizedText).length;
  const firstPersonCount = (lowerText.match(/\b(ich|wir|mich|uns|mein|meine|unser)\b/g) || []).length;
  const manCount = (lowerText.match(/\bman\b/g) || []).length;
  const fillerCount = (lowerText.match(/\b(eigentlich|natürlich|ein bisschen|sozusagen|gewissermassen|gewissermaßen|klarerweise)\b/g) || []).length;
  const vagueCount = (lowerText.match(/\b(sachen|dinge|leute|irgendwie)\b/g) || []).length;
  const evidenceCount =
    countMarkerOccurrences(lowerText, EVIDENCE_MARKERS) +
    (normalizedText.match(/\d+(?:[.,]\d+)?\s?(?:%|prozent|befragte|teilnehmende)/gi) || []).length;
  const connectorCount = countMarkerOccurrences(lowerText, SCIENTIFIC_CONNECTORS);
  const inclusiveCount = countMatches(normalizedText, INCLUSIVE_MARKERS);
  const genderedCount = countMatches(normalizedText, GENDERED_TERMS);
  const avgSentenceLength = sentences.length ? words.length / sentences.length : 0;
  const avgParagraphLength = paragraphs.length ? words.length / paragraphs.length : words.length;
  const sourceCount = citationStyle === 'apa'
    ? apaCitations.length
    : footnotes.inlineMarkers.length + footnotes.lineFootnotes.length;
  const styleMismatchCount = citationStyle === 'apa'
    ? footnotes.inlineMarkers.length + footnotes.lineFootnotes.length
    : apaCitations.length;

  const objectivityScore = clamp(
    92 - firstPersonCount * 8 - manCount * 4 - fillerCount * 7 + Math.min(evidenceCount, 5) * 3,
    0,
    100
  );
  const precisionScore = clamp(
    68 + Math.min(connectorCount, 6) * 4 - vagueCount * 8 - fillerCount * 5 + Math.min(sourceCount, 4) * 3,
    0,
    100
  );
  const structureScore = clamp(
    45 +
      Math.min(paragraphs.length, 5) * 9 +
      Math.min(connectorCount, 6) * 4 +
      (avgParagraphLength >= 45 && avgParagraphLength <= 140 ? 8 : 0) +
      (avgSentenceLength >= 10 && avgSentenceLength <= 26 ? 8 : 0),
    0,
    100
  );
  const citationScore = clamp(
    55 +
      Math.min(sourceCount, 6) * 7 -
      uncitedQuotes.length * 16 -
      styleMismatchCount * 9 +
      (directQuoteCount === 0 && sourceCount > 0 ? 6 : 0),
    0,
    100
  );
  const inclusivityScore = clamp(72 + inclusiveCount * 9 - genderedCount * 8, 0, 100);
  const clarityScore = clamp(
    75 +
      (avgSentenceLength >= 9 && avgSentenceLength <= 24 ? 10 : avgSentenceLength <= 32 ? 2 : -12) +
      (paragraphs.length >= 2 ? 6 : -8) -
      fillerCount * 4,
    0,
    100
  );
  const facharbeitCheck = analyzeFacharbeitRequirements({
    text: normalizedText,
    title: normalizedTitle,
    abstract: normalizedAbstract,
    workType
  });

  const categories = [
    {
      id: 'objektivitaet',
      label: 'Objektivität',
      score: objectivityScore,
      status: statusFromScore(objectivityScore),
      observation:
        objectivityScore >= 80
          ? 'Der Text bleibt überwiegend sachlich und vermeidet klare Ich-Zentrierung.'
          : objectivityScore >= 60
            ? 'Der Text ist grundsätzlich sachlich, enthält aber einzelne subjektive Marker.'
            : 'Subjektive Formulierungen schwächen den wissenschaftlichen Ton deutlich.',
      advice: 'Ersetze Ich-, Wir- und Man-Formulierungen möglichst durch sachliche Befundsprache.'
    },
    {
      id: 'praezision',
      label: 'Präzision',
      score: precisionScore,
      status: statusFromScore(precisionScore),
      observation:
        precisionScore >= 80
          ? 'Die Wortwahl ist meist präzise und argumentativ gut geführt.'
          : precisionScore >= 60
            ? 'Die Formulierungen sind verständlich, könnten aber stellenweise fachlich genauer sein.'
            : 'Mehrere Begriffe bleiben zu vage oder alltagssprachlich.',
      advice: 'Vermeide Sammelbegriffe wie „Dinge“ oder „Leute“ und benenne Sachverhalte konkret.'
    },
    {
      id: 'struktur',
      label: 'Struktur und Logik',
      score: structureScore,
      status: statusFromScore(structureScore),
      observation:
        structureScore >= 80
          ? 'Absätze und Verknüpfungen tragen den Gedankengang gut.'
          : structureScore >= 60
            ? 'Eine Grundstruktur ist erkennbar, könnte aber klarer gegliedert sein.'
            : 'Der Aufbau braucht deutlichere Absatzlogik und stärkere Übergänge.',
      advice: 'Ordne jeden Absatz einer klaren Teilfunktion zu: Hinführung, Analyse, Beleg, Schluss.'
    },
    {
      id: 'zitation',
      label: citationStyle === 'apa' ? 'APA-Zitation' : 'Fussnotenapparat',
      score: citationScore,
      status: statusFromScore(citationScore),
      observation:
        citationScore >= 80
          ? 'Die Nachweise passen mehrheitlich zum gewählten Zitationsstil.'
          : citationScore >= 60
            ? 'Zitationen sind teilweise vorhanden, aber noch nicht konsequent genug umgesetzt.'
            : 'Quellenbelege fehlen, sind inkonsistent oder passen nicht zum gewählten Stil.',
      advice:
        citationStyle === 'apa'
          ? 'Nutze im Fliesstext konsequent Klammerbelege mit Autor, Jahr und Seitenangabe.'
          : 'Setze direkte und indirekte Übernahmen mit Fussnotenziffern und sauberem Nachweis ab.'
    },
    {
      id: 'inklusion',
      label: 'Antidiskriminierende Sprache',
      score: inclusivityScore,
      status: statusFromScore(inclusivityScore),
      observation:
        inclusivityScore >= 80
          ? 'Die Formulierungen wirken überwiegend inklusiv und anschlussfähig.'
          : inclusivityScore >= 60
            ? 'Die Sprache ist meist neutral, könnte aber noch sichtbarer inklusiv formuliert werden.'
            : 'Mehrere Personenbezeichnungen wirken nicht inklusiv oder unnötig verengt.',
      advice: 'Prüfe Personenbezeichnungen auf inklusive Alternativen wie „Studierende“ oder „Lehrpersonen“.'
    },
    {
      id: 'verstaendlichkeit',
      label: 'Verständlichkeit',
      score: clarityScore,
      status: statusFromScore(clarityScore),
      observation:
        clarityScore >= 80
          ? 'Satzlängen und Absatzstruktur unterstützen eine gute Lesbarkeit.'
          : clarityScore >= 60
            ? 'Der Text ist lesbar, würde aber von kompakteren Sätzen profitieren.'
          : 'Lange oder unklare Sätze erschweren die Nachvollziehbarkeit.',
      advice: 'Verkürze überlange Sätze und setze pro Satz möglichst nur einen zentralen Gedankenschritt.'
    },
    {
      id: 'facharbeit',
      label: 'Facharbeit nach Dossier',
      score: facharbeitCheck.score,
      status: facharbeitCheck.status,
      observation: facharbeitCheck.observation,
      advice: facharbeitCheck.advice
    }
  ];

  const issues = [...facharbeitCheck.issues];

  SUBJECTIVE_PATTERNS.forEach((pattern) => {
    const sentence = findSentenceWithPattern(sentences, pattern.regex);
    if (sentence) {
      issues.push({
        id: pattern.id,
        type: 'stil',
        severity: pattern.id === 'ich-form' ? 'hoch' : 'mittel',
        title: pattern.title,
        excerpt: sentence,
        suggestion: pattern.suggestion
      });
    }
  });

  uncitedQuotes.slice(0, 3).forEach((quote, index) => {
    issues.push({
      id: `quote-${index + 1}`,
      type: 'zitation',
      severity: 'hoch',
      title: 'Zitat ohne klaren Nachweis',
      excerpt: quote.text,
      suggestion:
        citationStyle === 'apa'
          ? 'Ergänze direkt nach dem Zitat einen APA-Beleg, zum Beispiel (Müller, 2024, S. 15).'
          : 'Setze direkt nach dem Zitat eine Fussnotenziffer und führe die Quelle vollständig in der Fussnote nach.'
    });
  });

  if (styleMismatchCount > 0) {
    issues.push({
      id: 'style-mismatch',
      type: 'zitation',
      severity: 'mittel',
      title: 'Zitationsstil ist nicht einheitlich',
      excerpt:
        citationStyle === 'apa'
          ? 'Es wurden Fussnotenmarker oder Fussnotenblöcke gefunden.'
          : 'Es wurden APA-Klammerbelege gefunden.',
      suggestion:
        citationStyle === 'apa'
          ? 'Entscheide dich für APA im Fliesstext und entferne konkurrierende Fussnotenmarker.'
          : 'Entscheide dich für den Fussnotenstil und löse APA-Klammerbelege in Fussnoten auf.'
    });
  }

  if (genderedCount > 0) {
    const genderSentence = findSentenceWithPattern(
      sentences,
      new RegExp(`\\b(${GENDERED_TERMS.map(escapeRegExp).join('|')})\\b`, 'i')
    );
    issues.push({
      id: 'inklusion',
      type: 'sprache',
      severity: 'mittel',
      title: 'Personenbezeichnung prüfen',
      excerpt: genderSentence || 'Mehrere Personenbezeichnungen wirken nicht inklusiv.',
      suggestion: 'Ersetze verengende Personenbezeichnungen nach Möglichkeit durch inklusive Alternativen.'
    });
  }

  if (paragraphs.length < 2 || avgSentenceLength > 28) {
    issues.push({
      id: 'struktur',
      type: 'struktur',
      severity: 'mittel',
      title: 'Leseführung verbessern',
      excerpt:
        paragraphs[0] || normalizedText.slice(0, 240),
      suggestion: 'Arbeite mit klaren Absätzen und reduziere verschachtelte Satzperioden.'
    });
  }

  const strengths = categories
    .filter((category) => category.score >= 78)
    .map((category) => `${category.label}: ${category.observation}`);

  const suggestions = categories
    .filter((category) => category.score < 78)
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((category) => `${category.label}: ${category.advice}`);

  const rewriteTemplates = [
    {
      label: 'Objektiv formulieren',
      before: 'Ich finde, dass soziale Medien problematisch sind.',
      after: 'Die ausgewerteten Befunde deuten darauf hin, dass soziale Medien problematische Effekte haben können.'
    },
    {
      label: 'Paraphrase markieren',
      before: 'Bollnow sagt, dass der Mensch sich von der Natur entfernt.',
      after:
        citationStyle === 'apa'
          ? 'Bollnow argumentiert, dass sich der Mensch durch den Verstand von der Natur entfernt hat (vgl. Bollnow, 1951, S. 3 f.).'
          : 'Bollnow argumentiert, dass sich der Mensch durch den Verstand von der Natur entfernt hat.1'
    },
    {
      label: citationStyle === 'apa' ? 'APA-Zitat setzen' : 'Fussnote setzen',
      before: '„Das Flugzeug sah innen aus wie ein Bus.“',
      after:
        citationStyle === 'apa'
          ? '„Das Flugzeug sah innen aus wie ein Bus.“ (Schami, 2003, S. 13).'
          : '„Das Flugzeug sah innen aus wie ein Bus.“1'
    }
  ];

  const overallScore = Math.round(
    objectivityScore * 0.17 +
      precisionScore * 0.14 +
      structureScore * 0.15 +
      citationScore * 0.19 +
      inclusivityScore * 0.08 +
      clarityScore * 0.11 +
      facharbeitCheck.score * 0.16
  );

  const verdict =
    overallScore >= 82
      ? 'Der Text erfüllt zentrale Merkmale wissenschaftlicher Sprache bereits überzeugend.'
      : overallScore >= 65
        ? 'Die wissenschaftliche Grundhaltung ist erkennbar, braucht aber noch mehr Konsequenz bei Stil und Nachweisen.'
        : 'Der Text benötigt eine deutlich wissenschaftlichere Ausrichtung bei Stil, Struktur und Zitation.';

  const revisionWorkbench = buildRevisionWorkbench({
    text: normalizedText,
    citationStyle,
    uncitedQuotes,
    categories
  });
  const standardLevel = revisionWorkbench.levels.find((level) => level.id === 'standard');

  return {
    overallScore,
    verdict,
    citationStyle,
    stats: {
      characters: normalizedText.length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      averageSentenceLength: Number(avgSentenceLength.toFixed(1)),
      averageParagraphLength: Number(avgParagraphLength.toFixed(1))
    },
    signals: {
      sourceCount,
      directQuotes: directQuoteCount,
      uncitedQuotes: uncitedQuotes.length,
      firstPersonCount,
      fillerCount,
      evidenceMarkers: evidenceCount,
      styleMismatchCount,
      dossierHeadingHits: facharbeitCheck.signals.headingHits,
      ownInvestigationCount: facharbeitCheck.signals.ownInvestigationCount
    },
    categories,
    strengths: strengths.length ? strengths : ['Die Grundintention des Textes ist erkennbar und kann gut weiter geschärft werden.'],
    suggestions,
    issues: issues.slice(0, 8),
    rewriteTemplates,
    facharbeitGuide: facharbeitCheck.guide,
    citationGuide: buildCitationGuide(citationStyle),
    revisionWorkbench,
    suggestedRevision: standardLevel ? standardLevel.text : normalizedText
  };
}

async function createAiScientificReview({ text, heuristic, citationStyle, apiKey, model }) {
  const excerpt = text.length > 12000 ? `${text.slice(0, 12000)}\n\n[Text gekürzt]` : text;
  const prompt = `
Du bist eine präzise, konstruktive Schreibberaterin für wissenschaftliche Texte in deutscher Schweizer Standardsprache.
Analysiere den Text lernförderlich.
Nutze die heuristische Voranalyse nur als Ausgangspunkt.
Berücksichtige besonders:
- Objektivität statt Ich-/Man-Formulierungen
- Präzision, klare Argumentationsstruktur und Verständlichkeit
- antidiskriminierende Sprache
- Zitation im gewählten Stil (${citationStyle === 'apa' ? 'APA' : 'Fussnoten'})

Antworte ausschliesslich als JSON.

Schema:
{
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
      max_output_tokens: 1000
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
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 6) : [],
    lineEdits: Array.isArray(parsed.line_edits) ? parsed.line_edits.slice(0, 6) : []
  };
}

module.exports = {
  analyzeScientificStyle,
  createAiScientificReview,
  extractTextFromUpload
};
