const fileInput = document.getElementById('fileInput');
const sampleButton = document.getElementById('sampleButton');
const analyzeButton = document.getElementById('analyzeButton');
const improveButton = document.getElementById('improveButton');
const copyBackButton = document.getElementById('copyBackButton');
const textInput = document.getElementById('textInput');
const revisionOutput = document.getElementById('revisionOutput');
const revisionMode = document.getElementById('revisionMode');
const revisionStats = document.getElementById('revisionStats');
const fileMeta = document.getElementById('fileMeta');
const statusBadge = document.getElementById('statusBadge');
const textStats = document.getElementById('textStats');
const titleInput = document.getElementById('titleInput');
const abstractInput = document.getElementById('abstractInput');
const workTypeInput = document.getElementById('workTypeInput');
const scoreRing = document.getElementById('scoreRing');
const scoreValue = document.getElementById('scoreValue');
const summaryText = document.getElementById('summaryText');
const categoryGrid = document.getElementById('categoryGrid');
const dossierBox = document.getElementById('dossierBox');
const issuesBox = document.getElementById('issuesBox');
const suggestionsBox = document.getElementById('suggestionsBox');
const templatesBox = document.getElementById('templatesBox');
const revisionPlanBox = document.getElementById('revisionPlanBox');
const revisionActionsBox = document.getElementById('revisionActionsBox');
const spellcheckStatus = document.getElementById('spellcheckStatus');
const spellcheckBox = document.getElementById('spellcheckBox');
const citationMode = document.getElementById('citationMode');
const citationGuideTitle = document.getElementById('citationGuideTitle');
const citationGuideRule = document.getElementById('citationGuideRule');
const citationGuideExamples = document.getElementById('citationGuideExamples');
const citationGuideChecklist = document.getElementById('citationGuideChecklist');

const REVIEW_ENDPOINT = '/api/wissenschaftssprache-review';
const EXTRACT_ENDPOINT = '/api/wissenschaftssprache-extract';
const SPELLCHECK_ENDPOINT = '/api/languagetool-check';

const CITATION_GUIDES = {
  apa: {
    title: 'APA im Fliesstext',
    rule: 'Direkte und indirekte Übernahmen werden im Fliesstext mit Autor, Jahr und Seitenangabe markiert.',
    examples: [
      'Direktes Zitat: „...“ (Müller, 2024, S. 15).',
      'Paraphrase: Die Studie betont die Bedeutung klarer Struktur (vgl. Müller, 2024, S. 15).',
      'Mehrere Autor:innen: (Meier & Keller, 2023, S. 7).'
    ],
    checklist: [
      'Direkte und indirekte Übernahmen sofort im Fliesstext belegen.',
      'Autor, Jahr und bei Textstellen die genaue Seite nennen.',
      'Paraphrasen mit einem klaren Verweissignal wie „vgl.“ markieren.',
      'Die gewählte Schreibweise bei mehreren Autor:innen konsequent durchhalten.',
      'Keine Fussnotenziffern in einen sonst APA-basierten Text mischen.'
    ]
  },
  fussnoten: {
    title: 'Fussnotenapparat',
    rule: 'Direkte Zitate und sinngemässe Übernahmen werden mit Fussnotenziffern und vollständigem Nachweis belegt.',
    examples: [
      'Direktes Zitat: „... Bus.“1',
      'Paraphrase: Bollnow argumentiert, dass ...1',
      'Internetquelle in der Fussnote: URL plus Abrufdatum.'
    ],
    checklist: [
      'Fussnotenziffer direkt nach Zitat oder Paraphrase setzen.',
      'In der Fussnote die bibliografischen Angaben vollständig und sauber aufführen.',
      'Sinngemässe Übernahmen mit „Vgl.“ oder gleichwertigem Signal markieren.',
      'Bei Internetquellen URL und Abrufdatum ergänzen.',
      'Durch die ganze Arbeit hindurch denselben Fussnotenstil beibehalten.'
    ]
  }
};

const SAMPLE_TEXT = `Ich finde, dass wissenschaftliche Sprache eigentlich ziemlich kompliziert ist. Man sieht an vielen Dingen, dass Autoren oft möglichst schwierig schreiben. „Wissenschaftliche Texte müssen objektiv sein.“ Viele Studenten übernehmen solche Regeln, aber sie geben die Quelle nicht immer sauber an.

Bollnow sagt, dass der Mensch sich durch den Verstand von der Natur entfernt. Diese Aussage ist wichtig, weil sie zeigt, dass Theorie und Argumentation zusammengehören. Ausserdem kann man mit Studien arbeiten, aber viele Leute machen das nur sozusagen halb genau.

Abschliessend kann man sagen, dass wissenschaftliches Schreiben nicht nur korrekt, sondern auch klar und fair sein sollte.`;

let citationStyle = 'apa';
let latestReview = null;
let revisionLevel = 'standard';

function setStatus(kind, text) {
  statusBadge.className = `status-badge ${kind}`;
  statusBadge.textContent = text;
}

function normalizeText(value) {
  return String(value || '').replace(/\r\n/g, '\n').trim();
}

function updateTextStats() {
  const text = normalizeText(textInput.value);
  const words = (text.match(/[A-Za-zÀ-ÖØ-öø-ÿÄÖÜäöüß]+(?:-[A-Za-zÀ-ÖØ-öø-ÿÄÖÜäöüß]+)*/g) || []).length;
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean).length;
  const paragraphs = text.split(/\n\s*\n/).map((entry) => entry.trim()).filter(Boolean).length;

  textStats.innerHTML = `
    <span>${words} Wörter</span>
    <span>${sentences} Sätze</span>
    <span>${paragraphs} Absätze</span>
  `;
}

function setScore(score) {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
  scoreValue.textContent = String(Math.round(safeScore));
  scoreRing.style.background = `
    radial-gradient(circle at center, #f9f4eb 0 56%, transparent 57%),
    conic-gradient(#7b2d26 0deg, #d0a349 ${safeScore * 3.6}deg, rgba(28, 24, 21, 0.1) ${safeScore * 3.6}deg)
  `;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeClassName(value) {
  return String(value || '')
    .replace(/[^\wäöüÄÖÜß-]/g, '')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/Ä/g, 'A')
    .replace(/Ö/g, 'O')
    .replace(/Ü/g, 'U')
    .replace(/ß/g, 'ss');
}

async function postJson(path, payload) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const raw = await response.text();
  let data = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { error: raw || `HTTP ${response.status}` };
  }

  if (!response.ok) {
    throw new Error(data.details || data.error || `HTTP ${response.status}`);
  }

  return data;
}

function renderCitationGuide() {
  const guide = CITATION_GUIDES[citationStyle];
  citationGuideTitle.textContent = guide.title;
  citationGuideRule.textContent = guide.rule;
  citationGuideExamples.innerHTML = guide.examples
    .map((example) => `<span>${escapeHtml(example)}</span>`)
    .join('');
  citationGuideChecklist.innerHTML = `
    <strong>Zitier-Checkliste</strong>
    <ul>
      ${(guide.checklist || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>
  `;

  citationMode.querySelectorAll('[data-citation-style]').forEach((button) => {
    button.classList.toggle('active', button.dataset.citationStyle === citationStyle);
  });
}

function renderRevisionModeButtons(workbench) {
  const availableLevels = new Set((workbench?.levels || []).map((level) => level.id));
  revisionMode.querySelectorAll('[data-revision-level]').forEach((button) => {
    const isActive = button.dataset.revisionLevel === revisionLevel;
    button.classList.toggle('active', isActive);
    button.disabled = !availableLevels.has(button.dataset.revisionLevel);
  });
}

function getSelectedRevisionLevel() {
  const levels = latestReview?.heuristic?.revisionWorkbench?.levels || [];
  return levels.find((level) => level.id === revisionLevel) || levels[0] || null;
}

function createRevisionPlanItem(item) {
  return `
    <article class="stack-item plan-item">
      <div class="issue-meta">
        <strong>${escapeHtml(item.title || 'Revisionsschritt')}</strong>
        <span class="plan-priority ${escapeClassName(item.priority || 'danach')}">${escapeHtml(item.priority || 'danach')}</span>
      </div>
      <p>${escapeHtml(item.summary || '')}</p>
    </article>
  `;
}

function createRevisionActionItem(action) {
  return `
    <article class="stack-item revision-action-item">
      <div class="issue-meta">
        <strong>${escapeHtml(action.title || 'Eingriff')}</strong>
        <span class="revision-category">${escapeHtml(action.category || 'Revision')}</span>
      </div>
      <p>${escapeHtml(action.reason || '')}</p>
      <p class="template-before">${escapeHtml(action.before || '')}</p>
      <p class="template-after">${escapeHtml(action.after || '')}</p>
    </article>
  `;
}

function createDossierItem(item) {
  return `
    <article class="stack-item">
      <strong>${escapeHtml(item.title || 'Dossier-Hinweis')}</strong>
      <p>${escapeHtml(item.text || '')}</p>
    </article>
  `;
}

function createCategoryItem(category) {
  return `
    <article class="category-item">
      <div class="category-topline">
        <strong>${escapeHtml(category.label)}</strong>
        <span>${Math.round(category.score)}</span>
      </div>
      <p>${escapeHtml(category.observation)}</p>
      <span class="category-pill ${escapeClassName(category.status)}">${escapeHtml(category.status)}</span>
    </article>
  `;
}

function createIssueItem(issue) {
  return `
    <article class="stack-item issue-item ${escapeClassName(issue.severity)}">
      <div class="issue-meta">
        <strong>${escapeHtml(issue.title)}</strong>
        <span>${escapeHtml(issue.severity || 'Hinweis')}</span>
      </div>
      <p>${escapeHtml(issue.excerpt || '')}</p>
      <div class="issue-suggestion">${escapeHtml(issue.suggestion || '')}</div>
    </article>
  `;
}

function createSuggestionItem(title, text) {
  return `
    <article class="stack-item">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(text)}</p>
    </article>
  `;
}

function createTemplateItem(template) {
  return `
    <article class="template-item">
      <strong>${escapeHtml(template.label || 'Beispiel')}</strong>
      <p class="template-before">${escapeHtml(template.before || '')}</p>
      <p class="template-after">${escapeHtml(template.after || '')}</p>
    </article>
  `;
}

function createSpellcheckItem(match) {
  const replacements = Array.isArray(match.replacements) ? match.replacements : [];
  return `
    <article class="stack-item">
      <strong>${escapeHtml(match.message || 'Hinweis')}</strong>
      <p>${escapeHtml(match.rule?.description || match.category?.name || 'Rechtschreib- oder Grammatikhinweis')}</p>
      ${match.sentence ? `<div class="spell-snippet">${escapeHtml(match.sentence)}</div>` : ''}
      ${
        replacements.length
          ? `<div class="replacement-list">${replacements
              .map((entry) => `<span class="replacement">${escapeHtml(entry)}</span>`)
              .join('')}</div>`
          : ''
      }
    </article>
  `;
}

function renderReview(result) {
  latestReview = result;
  const heuristic = result.heuristic || {};
  const ai = result.ai || {};

  setScore(heuristic.overallScore || 0);
  categoryGrid.innerHTML = (heuristic.categories || []).map(createCategoryItem).join('');

  const summaryParts = [heuristic.verdict];
  if (ai.summary) summaryParts.push(ai.summary);
  summaryText.textContent = summaryParts.filter(Boolean).join(' ');

  const issues = Array.isArray(heuristic.issues) ? heuristic.issues : [];
  if (issues.length) {
    issuesBox.classList.remove('empty-state');
    issuesBox.innerHTML = issues.map(createIssueItem).join('');
  } else {
    issuesBox.classList.add('empty-state');
    issuesBox.textContent = 'Es wurden keine markanten Stilprobleme erkannt.';
  }

  const suggestions = [];
  (heuristic.suggestions || []).forEach((entry) => {
    suggestions.push({ title: 'Heuristischer Hinweis', text: entry });
  });
  (ai.improvements || []).forEach((entry) => {
    suggestions.push({ title: 'KI-Verbesserung', text: entry });
  });
  if (ai.error) {
    suggestions.push({ title: 'KI-Status', text: ai.error });
  }

  if (suggestions.length) {
    suggestionsBox.classList.remove('empty-state');
    suggestionsBox.innerHTML = suggestions.slice(0, 8).map((entry) => createSuggestionItem(entry.title, entry.text)).join('');
  } else {
    suggestionsBox.classList.add('empty-state');
    suggestionsBox.textContent = 'Keine zusätzlichen Vorschläge vorhanden.';
  }

  const templates = [
    ...(heuristic.rewriteTemplates || []),
    ...((ai.lineEdits || []).map((entry) => ({
      label: entry.why || 'Überarbeitung',
      before: entry.before || '',
      after: entry.after || ''
    })))
  ];

  if (templates.length) {
    templatesBox.classList.remove('empty-state');
    templatesBox.innerHTML = templates.slice(0, 8).map(createTemplateItem).join('');
  } else {
    templatesBox.classList.add('empty-state');
    templatesBox.textContent = 'Keine Formulierungshilfen vorhanden.';
  }

  renderDossierCheck();
  renderRevisionWorkbench();
  improveButton.disabled = false;
}

function renderDossierCheck() {
  const guide = latestReview?.heuristic?.facharbeitGuide;
  const dossierIssues = (latestReview?.heuristic?.issues || []).filter((item) => item.type === 'facharbeit');

  if (!guide) {
    dossierBox.classList.add('empty-state');
    dossierBox.textContent = 'Nach der Analyse erscheinen hier die integrierten Anforderungen aus dem Facharbeitsdossier.';
    return;
  }

  const entries = [
    ...((guide.coreRequirements || []).map((text) => ({ title: 'Kernanforderung', text }))),
    ...((guide.structure || []).map((text) => ({ title: 'Strukturvorgabe', text }))),
    ...((guide.submissionHints || []).slice(0, 2).map((text) => ({ title: 'Abgabehinweis', text }))),
    ...(dossierIssues.map((issue) => ({ title: issue.title, text: issue.suggestion })))
  ];

  dossierBox.classList.remove('empty-state');
  dossierBox.innerHTML = entries.slice(0, 12).map(createDossierItem).join('');
}

function renderRevisionWorkbench() {
  const workbench = latestReview?.heuristic?.revisionWorkbench;
  if (!workbench) {
    revisionStats.classList.add('empty-state');
    revisionStats.textContent = 'Nach der Analyse erscheinen hier Umfang und Schärfe der gewählten Überarbeitungsstufe.';
    revisionPlanBox.classList.add('empty-state');
    revisionPlanBox.textContent = 'Nach der Analyse erscheint hier ein mehrstufiger Überarbeitungsplan.';
    revisionActionsBox.classList.add('empty-state');
    revisionActionsBox.textContent = 'Konkrete Eingriffe der gewählten Überarbeitungsstufe erscheinen hier.';
    revisionOutput.value = '';
    copyBackButton.disabled = true;
    renderRevisionModeButtons({ levels: [] });
    return;
  }

  renderRevisionModeButtons(workbench);

  const plan = Array.isArray(workbench.plan) ? workbench.plan : [];
  if (plan.length) {
    revisionPlanBox.classList.remove('empty-state');
    revisionPlanBox.innerHTML = plan.map(createRevisionPlanItem).join('');
  } else {
    revisionPlanBox.classList.add('empty-state');
    revisionPlanBox.textContent = 'Kein zusätzlicher Revisionsplan verfügbar.';
  }

  applyRevisionLevel(revisionLevel, false);
}

function applyRevisionLevel(levelId, announce = true) {
  if (levelId) {
    revisionLevel = levelId;
  }

  const selectedLevel = getSelectedRevisionLevel();
  const workbench = latestReview?.heuristic?.revisionWorkbench;

  renderRevisionModeButtons(workbench);

  if (!selectedLevel) {
    return;
  }

  revisionOutput.value = selectedLevel.text || '';
  copyBackButton.disabled = !revisionOutput.value.trim();

  const focus = Array.isArray(selectedLevel.focus) ? selectedLevel.focus.join(' · ') : '';
  revisionStats.classList.remove('empty-state');
  revisionStats.innerHTML = `
    <strong>${escapeHtml(selectedLevel.label || 'Überarbeitung')}</strong>
    <span>${selectedLevel.stats?.changeCount || 0} Eingriffe</span>
    <span>${selectedLevel.stats?.sentences || 0} Sätze</span>
    <span>${selectedLevel.stats?.paragraphs || 0} Absätze</span>
    ${focus ? `<small>${escapeHtml(focus)}</small>` : ''}
  `;

  const actions = Array.isArray(selectedLevel.actions) ? selectedLevel.actions : [];
  if (actions.length) {
    revisionActionsBox.classList.remove('empty-state');
    revisionActionsBox.innerHTML = actions.slice(0, 16).map(createRevisionActionItem).join('');
  } else {
    revisionActionsBox.classList.add('empty-state');
    revisionActionsBox.textContent = 'Für diese Stufe wurden keine zusätzlichen Eingriffe berechnet.';
  }

  if (announce) {
    setStatus('neutral', selectedLevel.label);
  }
}

function renderSpellcheck(result) {
  const matches = Array.isArray(result.matches) ? result.matches : [];
  const details = [];
  if (result.truncated) details.push('Der Text wurde für die Prüfung aufgeteilt.');

  spellcheckStatus.textContent = `${matches.length} Treffer gefunden${details.length ? ` · ${details.join(' ')}` : ''}`;

  if (matches.length) {
    spellcheckBox.classList.remove('empty-state');
    spellcheckBox.innerHTML = matches.slice(0, 25).map(createSpellcheckItem).join('');
  } else {
    spellcheckBox.classList.add('empty-state');
    spellcheckBox.textContent = 'Keine Rechtschreib- oder Grammatiktreffer gefunden.';
  }
}

async function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const commaIndex = result.indexOf(',');
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
    reader.readAsDataURL(file);
  });
}

async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
    reader.readAsText(file, 'utf-8');
  });
}

async function handleUpload(file) {
  if (!file) return;

  const extension = (file.name.split('.').pop() || '').toLowerCase();
  const canReadDirectly = ['txt', 'md'].includes(extension);

  try {
    setStatus('loading', 'Lade');
    let text = '';

    if (canReadDirectly) {
      const content = await readFileAsText(file);
      text = content;
    } else {
      const contentBase64 = await readFileAsBase64(file);
      const extracted = await postJson(EXTRACT_ENDPOINT, {
        filename: file.name,
        mimeType: file.type,
        contentBase64
      });
      text = extracted.text || '';
    }

    textInput.value = normalizeText(text);
    fileMeta.textContent = `${file.name} · ${(file.size / 1024).toFixed(1)} KB`;
    updateTextStats();
    setStatus('neutral', 'Geladen');
  } catch (error) {
    setStatus('error', 'Uploadfehler');
    fileMeta.textContent = error.message || 'Datei konnte nicht verarbeitet werden.';
  }
}

async function handleAnalyze() {
  const text = normalizeText(textInput.value);
  updateTextStats();

  if (text.length < 120) {
    setStatus('error', 'Zu kurz');
    summaryText.textContent = 'Bitte füge einen längeren wissenschaftlichen Text ein oder lade eine Datei hoch.';
    return;
  }

  analyzeButton.disabled = true;
  improveButton.disabled = true;
  copyBackButton.disabled = true;
  setStatus('loading', 'Prüfe');
  summaryText.textContent = 'Die Analyse läuft. Stil, Zitation und Rechtschreibung werden parallel ausgewertet.';
  spellcheckStatus.textContent = 'Rechtschreibprüfung läuft ...';

  const [reviewResult, spellcheckResult] = await Promise.allSettled([
    postJson(REVIEW_ENDPOINT, {
      text,
      citationStyle,
      title: titleInput.value,
      abstract: abstractInput.value,
      workType: workTypeInput.value
    }),
    postJson(SPELLCHECK_ENDPOINT, { text, language: 'de-CH' })
  ]);

  if (reviewResult.status === 'fulfilled') {
    renderReview(reviewResult.value);
  } else {
    latestReview = null;
    categoryGrid.innerHTML = '';
    issuesBox.classList.add('empty-state');
    issuesBox.textContent = 'Die Analyse konnte nicht geladen werden.';
    suggestionsBox.classList.add('empty-state');
    suggestionsBox.textContent = 'Keine Vorschläge verfügbar.';
    templatesBox.classList.add('empty-state');
    templatesBox.textContent = 'Keine Formulierungshilfen vorhanden.';
    dossierBox.classList.add('empty-state');
    dossierBox.textContent = 'Der Dossier-Check konnte nicht geladen werden.';
    renderRevisionWorkbench();
    summaryText.textContent =
      reviewResult.reason?.message || 'Die Analyse wissenschaftlicher Sprache konnte nicht durchgeführt werden.';
  }

  if (spellcheckResult.status === 'fulfilled') {
    renderSpellcheck(spellcheckResult.value);
  } else {
    spellcheckStatus.textContent =
      spellcheckResult.reason?.message || 'Die Rechtschreibprüfung konnte nicht geladen werden.';
    spellcheckBox.classList.add('empty-state');
    spellcheckBox.textContent = 'Keine LanguageTool-Treffer verfügbar.';
  }

  if (reviewResult.status === 'fulfilled' || spellcheckResult.status === 'fulfilled') {
    setStatus('success', 'Fertig');
  } else {
    setStatus('error', 'Fehler');
  }

  analyzeButton.disabled = false;
}

function buildRevisionCopy() {
  if (!latestReview?.heuristic?.revisionWorkbench) return;
  applyRevisionLevel(revisionLevel, true);
  setStatus('neutral', 'Arbeitskopie');
}

function copyRevisionBack() {
  if (!revisionOutput.value.trim()) return;
  textInput.value = revisionOutput.value.trim();
  updateTextStats();
  setStatus('neutral', 'Übernommen');
}

fileInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  handleUpload(file);
});

sampleButton.addEventListener('click', () => {
  titleInput.value = 'Wissenschaftliche Sprache zwischen Objektivität und Verständlichkeit';
  abstractInput.value = 'Die Arbeit untersucht, wie wissenschaftliche Sprache Objektivität, Präzision und Nachvollziehbarkeit herstellt. Dazu werden sprachliche Merkmale analysiert, typische Schwächen benannt und mögliche Überarbeitungen verglichen. Die Ergebnisse zeigen, dass vor allem klare Quellenarbeit, präzise Begriffe und eine saubere Trennung zwischen Befund und Meinung zentral sind.';
  workTypeInput.value = 'geisteswissenschaftlich';
  textInput.value = SAMPLE_TEXT;
  fileMeta.textContent = 'Beispieltext geladen.';
  updateTextStats();
  setStatus('neutral', 'Bereit');
});

analyzeButton.addEventListener('click', handleAnalyze);
improveButton.addEventListener('click', buildRevisionCopy);
copyBackButton.addEventListener('click', copyRevisionBack);
textInput.addEventListener('input', updateTextStats);

revisionMode.querySelectorAll('[data-revision-level]').forEach((button) => {
  button.addEventListener('click', () => {
    revisionLevel = button.dataset.revisionLevel || 'standard';
    applyRevisionLevel(revisionLevel, false);
  });
});

citationMode.querySelectorAll('[data-citation-style]').forEach((button) => {
  button.addEventListener('click', () => {
    citationStyle = button.dataset.citationStyle === 'fussnoten' ? 'fussnoten' : 'apa';
    renderCitationGuide();
    if (latestReview) {
      setStatus('neutral', 'Modus geändert');
      summaryText.textContent = 'Zitationsmodus geändert. Bitte die Analyse erneut starten.';
    }
  });
});

setScore(0);
updateTextStats();
renderCitationGuide();
renderRevisionWorkbench();
