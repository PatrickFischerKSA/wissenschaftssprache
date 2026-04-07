const storageKey = "lernlandschaft-911-afghanistan-irak-progress";
const teacherPassword = "neunelf";
const teacherPasswordAliases = ["neunelf", "911", "nine eleven", "nine_eleven", "afghanistan irak", "9 11"];
const modules = window.NINE_ELEVEN_MODULES || [];
const structureSpec = {
  thesis: ["ich argumentiere", "ich vertrete", "meine these", "entscheidend ist", "zentral ist", "ich bewerte"],
  evidence: ["das video", "das material", "die quelle", "zeigt", "deutlich wird", "im video", "im material"],
  comparison: ["während", "hingegen", "im unterschied", "gemeinsam", "im vergleich", "andererseits"],
  nuance: ["jedoch", "allerdings", "zugleich", "nicht nur", "einerseits", "andererseits", "dennoch", "spannungsfeld"],
  conclusion: ["insgesamt", "daher", "somit", "deshalb", "abschließend", "fazit"]
};

const state = {
  activeModuleId: modules[0]?.id || null,
  activeMiniQuestionId: null,
  sourceModalOpen: false,
  teacherAuthorized: false,
  teacherMode: false,
  teacherAccessOpen: false,
  answers: {}
};

const elements = {
  statsGrid: document.getElementById("stats-grid"),
  moduleNav: document.getElementById("module-nav"),
  moduleHeader: document.getElementById("module-header"),
  teacherAccessPanel: document.getElementById("teacher-access-panel"),
  teacherPanel: document.getElementById("teacher-panel"),
  resourcePanel: document.getElementById("resource-panel"),
  resourceGroups: document.getElementById("resource-groups"),
  questionList: document.getElementById("question-list"),
  miniQuestionModal: document.getElementById("mini-question-modal"),
  sourceModal: document.getElementById("source-modal"),
  startRouteButton: document.getElementById("start-route-button"),
  openFirstOpenButton: document.getElementById("open-first-open-button"),
  teacherModeButton: document.getElementById("teacher-mode-button")
};

function loadStore() {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object") {
      return { answers: {}, teacherMode: false, teacherAuthorized: false };
    }
    if ("answers" in parsed || "teacherMode" in parsed) {
      return {
        answers: parsed.answers && typeof parsed.answers === "object" ? parsed.answers : {},
        teacherMode: Boolean(parsed.teacherMode),
        teacherAuthorized: Boolean(parsed.teacherAuthorized)
      };
    }
    return { answers: parsed, teacherMode: false, teacherAuthorized: false };
  } catch {
    return { answers: {}, teacherMode: false, teacherAuthorized: false };
  }
}

function saveStore() {
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      answers: state.answers,
      teacherMode: state.teacherMode,
      teacherAuthorized: state.teacherAuthorized
    })
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getImageErrorAttributes(mode = "card") {
  if (mode === "module") {
    return 'onerror="handleImageError(this, \'module\')"';
  }

  if (mode === "resource") {
    return 'onerror="handleImageError(this, \'resource\')"';
  }

  return 'onerror="handleImageError(this, \'card\')"';
}

function getImageStyleAttribute(config = {}) {
  const styles = [];
  if (config.imageFit) styles.push(`object-fit:${config.imageFit}`);
  if (config.imagePosition) styles.push(`object-position:${config.imagePosition}`);
  if (config.imageBackground) styles.push(`background:${config.imageBackground}`);
  return styles.length ? `style="${escapeHtml(styles.join(";"))}"` : "";
}

function handleImageError(image, mode = "card") {
  if (!(image instanceof HTMLElement)) return;

  if (mode === "module") {
    image.closest(".module-visual")?.remove();
    return;
  }

  if (mode === "resource") {
    image.closest(".resource-image-link")?.remove();
    image.closest(".resource-card")?.classList.add("image-missing");
    return;
  }

  image.closest(".drag-card, .focus-card, .actor-card")?.classList.add("image-missing");
  image.remove();
}

function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/[„“"']/g, "")
    .replace(/[-/]/g, " ")
    .replace(/[.,;:!?()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePasswordEntry(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isTeacherPasswordValid(value = "") {
  const normalizedValue = normalizePasswordEntry(value);
  return [teacherPassword, ...teacherPasswordAliases].some(
    (entry) => normalizePasswordEntry(entry) === normalizedValue
  );
}

function wordCount(value = "") {
  return normalizeText(value).split(" ").filter(Boolean).length;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getModuleById(moduleId) {
  return modules.find((entry) => entry.id === moduleId) || modules[0] || null;
}

function getActiveModule() {
  return getModuleById(state.activeModuleId);
}

function getModuleScore(module) {
  const questionCount = module.questions.length || 1;
  const totalScore = module.questions.reduce((sum, question) => sum + (getAnswer(question.id)?.result?.score || 0), 0);
  return totalScore / questionCount;
}

function isModuleUnlocked(moduleIndex) {
  if (state.teacherMode) return true;
  if (moduleIndex <= 0) return true;
  const previousModule = modules[moduleIndex - 1];
  return getModuleScore(previousModule) >= 60;
}

function getFirstLockedModuleIndex() {
  return modules.findIndex((_, index) => !isModuleUnlocked(index));
}

function getFirstAvailableModuleId() {
  const firstLocked = getFirstLockedModuleIndex();
  if (firstLocked === -1) return modules[modules.length - 1]?.id || modules[0]?.id || null;
  return modules[Math.max(0, firstLocked - 1)]?.id || modules[0]?.id || null;
}

function getAnswer(questionId) {
  return state.answers[questionId] || null;
}

function setAnswer(questionId, payload) {
  state.answers[questionId] = payload;
  saveStore();
}

function getQuestionById(questionId) {
  for (const module of modules) {
    const question = module.questions.find((entry) => entry.id === questionId);
    if (question) return question;
    const miniQuestion = (module.miniQuestions || []).find((entry) => entry.id === questionId);
    if (miniQuestion) return miniQuestion;
  }
  return null;
}

function getResourceMap(module) {
  return new Map(module.resources.map((resource) => [resource.id, resource]));
}

function getMiniQuestions(module) {
  return module.miniQuestions || [];
}

function getVisibleResources(module) {
  if (state.teacherMode) return module.resources;
  return module.resources.filter((resource) => resource.type !== "PDF");
}

function getIntegratedSources(module) {
  return (module.resources || []).filter((resource) => resource.type !== "PDF");
}

function getVideoSources(module) {
  return getIntegratedSources(module).filter((resource) => resource.type === "Video");
}

function getAllVideoResources() {
  return modules.flatMap((module, moduleIndex) =>
    getVideoSources(module).map((resource, videoIndex) => ({
      ...resource,
      moduleId: module.id,
      moduleIndex,
      moduleStep: module.step,
      moduleTitle: module.title,
      videoIndex
    }))
  ).sort((left, right) => {
    if (left.moduleIndex !== right.moduleIndex) {
      return left.moduleIndex - right.moduleIndex;
    }
    return left.videoIndex - right.videoIndex;
  });
}

function getResourceUsageMap(module) {
  const usageMap = new Map();
  module.questions.forEach((question, index) => {
    (question.sourceIds || []).forEach((resourceId) => {
      if (!usageMap.has(resourceId)) {
        usageMap.set(resourceId, []);
      }
      usageMap.get(resourceId).push(index + 1);
    });
  });
  return usageMap;
}

function getQuestionReference(module, question) {
  const mainIndex = module.questions.findIndex((entry) => entry.id === question.id);
  if (mainIndex > -1) {
    return {
      kind: "main",
      label: `Frage ${mainIndex + 1}`,
      title: question.prompt
    };
  }

  const miniQuestions = getMiniQuestions(module);
  const miniIndex = miniQuestions.findIndex((entry) => entry.id === question.id);
  if (miniIndex > -1) {
    return {
      kind: "mini",
      label: `Zusatzcheck ${miniIndex + 1}`,
      title: question.title || question.prompt
    };
  }

  return {
    kind: "main",
    label: "Frage",
    title: question.prompt
  };
}

function getQuestionsForResource(module, resourceId) {
  const combined = [...module.questions, ...getMiniQuestions(module)];
  return combined.filter((question) => (question.sourceIds || []).includes(resourceId));
}

function formatQuestionTargets(targets = []) {
  if (!targets.length) return "";
  if (targets.length === 1) return `Frage ${targets[0]}`;
  if (targets.length === 2) return `Frage ${targets[0]} und ${targets[1]}`;
  return `Fragen ${targets.slice(0, -1).join(", ")} und ${targets.at(-1)}`;
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function containsVariant(normalizedAnswer, variant) {
  return normalizedAnswer.includes(normalizeText(variant));
}

function countMatchedConceptGroups(answer, question) {
  const normalizedAnswer = normalizeText(answer);
  const hits = [];
  const missing = [];

  (question.conceptGroups || []).forEach((group) => {
    const matched = group.variants.some((variant) => containsVariant(normalizedAnswer, variant));
    if (matched) {
      hits.push(group.label);
    } else {
      missing.push(group.label);
    }
  });

  return { hits, missing };
}

function evaluateStructure(normalizedAnswer, question) {
  const hits = [];
  const missing = [];

  Object.entries(structureSpec).forEach(([group, markers]) => {
    const matched = markers.some((marker) => containsVariant(normalizedAnswer, marker));
    if (matched) hits.push(group);
    else missing.push(group);
  });

  const mandatory = question.structureExpectations?.mandatory || ["thesis", "evidence"];
  const mandatoryMissing = mandatory.filter((entry) => !hits.includes(entry));
  return { hits, missing, mandatoryMissing };
}

function evaluateSingleChoice(question, answerValue) {
  if (!answerValue) {
    return {
      status: "error",
      score: 0,
      title: "Noch keine Entscheidung",
      body: "Wähle zuerst eine Antwort aus.",
      missing: [],
      strengths: []
    };
  }

  const correct = answerValue === question.correctOptionId;
  return {
    status: correct ? "success" : "error",
    score: correct ? 100 : 0,
    title: correct ? "Treffer" : "Noch nicht passend",
    body: question.explanation,
    missing: correct ? [] : ["Prüfe den Kernbegriff der Aufgabe erneut."],
    strengths: correct ? ["Die zentrale Aussage ist korrekt erkannt."] : []
  };
}

function evaluateMultiSelect(question, selectedIds) {
  if (!selectedIds.length) {
    return {
      status: "error",
      score: 0,
      title: "Noch nichts markiert",
      body: "Markiere mindestens eine Antwort.",
      missing: [],
      strengths: []
    };
  }

  const correctSet = new Set(question.correctOptionIds || []);
  const selectedSet = new Set(selectedIds);
  let hits = 0;
  let wrong = 0;

  selectedSet.forEach((id) => {
    if (correctSet.has(id)) hits += 1;
    else wrong += 1;
  });

  const score = clamp(Math.round(((hits - wrong * 0.75) / correctSet.size) * 100));
  const fullyCorrect = hits === correctSet.size && wrong === 0;

  return {
    status: fullyCorrect ? "success" : score >= 55 ? "warn" : "error",
    score,
    title: fullyCorrect ? "Vollständig richtig" : score >= 55 ? "Teilweise richtig" : "Zu ungenau",
    body: question.explanation,
    missing: fullyCorrect ? [] : ["Vergleiche die markierten Aussagen nochmals mit der historischen Logik."],
    strengths: hits ? [`Du hast ${hits} zutreffende Aussage${hits === 1 ? "" : "n"} markiert.`] : []
  };
}

function evaluateDragOrder(question, orderedIds) {
  const expectedOrder = question.correctOrder || [];
  if (!orderedIds.length) {
    return {
      status: "error",
      score: 0,
      title: "Noch nicht sortiert",
      body: "Ordne zuerst die Karten per Drag-and-drop.",
      missing: [],
      strengths: []
    };
  }

  let correctPositions = 0;
  const misplaced = [];
  orderedIds.forEach((id, index) => {
    if (expectedOrder[index] === id) {
      correctPositions += 1;
    } else {
      const item = (question.items || []).find((entry) => entry.id === id);
      if (item) misplaced.push(item.label);
    }
  });

  const score = clamp(Math.round((correctPositions / expectedOrder.length) * 100));
  const fullyCorrect = correctPositions === expectedOrder.length;

  return {
    status: fullyCorrect ? "success" : score >= 60 ? "warn" : "error",
    score,
    title: fullyCorrect ? "Chronologie stimmig" : score >= 60 ? "Teilweise stimmig" : "Reihenfolge noch unsicher",
    body: question.explanation,
    missing: fullyCorrect ? [] : misplaced.slice(0, 4).map((item) => `Noch prüfen: ${item}`),
    strengths: fullyCorrect ? ["Die Abfolge ist historisch schlüssig geordnet."] : [`${correctPositions} von ${expectedOrder.length} Positionen stimmen bereits.`]
  };
}

function evaluateShortText(question, answer) {
  const trimmed = answer.trim();
  if (!trimmed) {
    return {
      status: "error",
      score: 0,
      title: "Noch keine Antwort",
      body: "Schreibe zuerst eine kurze Erklärung.",
      missing: [],
      strengths: []
    };
  }

  const { hits, missing } = countMatchedConceptGroups(trimmed, question);
  const score = clamp(Math.round((hits.length / question.conceptGroups.length) * 100));
  const success = hits.length >= (question.successThreshold || question.conceptGroups.length);

  return {
    status: success ? "success" : score >= 50 ? "warn" : "error",
    score,
    title: success ? "Begrifflich tragfähig" : score >= 50 ? "Teilweise tragfähig" : "Noch zu dünn",
    body: success
      ? "Die Antwort deckt die geforderten Sinnschichten ab."
      : "Die Antwort hat bereits einen Kern, braucht aber noch mehr historische Präzision.",
    missing,
    strengths: hits
  };
}

function evaluateOpenAnalysis(question, answer) {
  const trimmed = answer.trim();
  if (!trimmed) {
    return {
      status: "error",
      score: 0,
      title: "Noch keine Antwort",
      body: "Schreibe zuerst eine zusammenhängende Deutung.",
      missing: [],
      strengths: []
    };
  }

  const normalizedAnswer = normalizeText(trimmed);
  const wc = wordCount(trimmed);
  const reasoningMarkers = ["weil", "deshalb", "somit", "während", "hingegen", "einerseits", "andererseits"];
  const nuanceMarkers = ["jedoch", "allerdings", "zugleich", "dennoch", "nicht nur", "spannungsfeld", "ambivalent"];
  const chronologyMarkers = ["1914", "1941", "1945", "1948", "1980", "1989", "1990", "1991", "1992", "1994", "1995", "1996", "1999"];
  const reasoningHits = reasoningMarkers.filter((marker) => containsVariant(normalizedAnswer, marker));
  const nuanceHits = nuanceMarkers.filter((marker) => containsVariant(normalizedAnswer, marker));
  const chronologyHits = chronologyMarkers.filter((marker) => containsVariant(normalizedAnswer, marker));
  const sourceHits = (question.sourceHints || []).filter((hint) => containsVariant(normalizedAnswer, hint));
  const structure = evaluateStructure(normalizedAnswer, question);

  const strengths = [];
  const missing = [];
  let conceptHits = 0;

  (question.rubric || []).forEach((criterion) => {
    const found = criterion.keywords.some((keyword) => containsVariant(normalizedAnswer, keyword));
    if (found) {
      conceptHits += 1;
      strengths.push(criterion.concept);
    } else {
      missing.push(criterion.concept);
    }
  });

  const targetStructureHits = question.structureExpectations?.targetHits || 4;
  const conceptScore = Math.round((conceptHits / question.rubric.length) * 50);
  const structureScore = Math.round((Math.min(structure.hits.length, targetStructureHits) / targetStructureHits) * 20);
  const sourceScore = Math.min(10, sourceHits.length * 4 + Math.min(2, chronologyHits.length) * 1);
  const nuanceScore = Math.min(10, nuanceHits.length * 3 + reasoningHits.length * 2);
  const lengthScore = Math.min(10, Math.round((wc / question.minWords) * 10));
  let total = clamp(conceptScore + structureScore + sourceScore + nuanceScore + lengthScore);

  if (wc < Math.round(question.minWords * 0.65)) total = Math.min(total, 54);
  if (conceptHits < Math.ceil(question.rubric.length / 2)) total = Math.min(total, 59);
  if (structure.mandatoryMissing.length) total = Math.min(total, 64);
  if (sourceHits.length === 0) total = Math.min(total, 69);

  let title = "Ausbaufähig";
  let status = "error";
  let body =
    "Die Antwort hat eine Richtung, braucht aber noch mehr Struktur, Materialbezug und begriffliche Schärfe.";

  if (total >= 85) {
    title = "Sehr differenziert";
    status = "success";
    body =
      "Die Antwort verbindet mehrere Erklärungsebenen, arbeitet mit Materialbezug und zeigt eine eigene historische Gewichtung.";
  } else if (total >= 68) {
    title = "Differenziert";
    status = "warn";
    body =
      "Die Antwort ist tragfähig, kann aber noch klarer gewichten oder genauer auf einzelne Materialien Bezug nehmen.";
  } else if (total >= 50) {
    title = "Teilweise tragfähig";
    status = "warn";
    body =
      "Wichtige Aspekte sind angesprochen, aber die Antwort bleibt noch zu kurz oder zu wenig verknüpft.";
  }

  return {
    status,
    score: total,
    title,
    body,
    missing: [...missing, ...structure.mandatoryMissing.map((item) => `Strukturbaustein: ${item}`)],
    strengths,
    breakdown: [
      `Inhalt: ${conceptHits}/${question.rubric.length} Kriterien`,
      `Struktur: ${structure.hits.length}/${targetStructureHits} Signale`,
      `Materialbezug: ${sourceHits.length} Treffer`,
      `Nuancierung: ${nuanceHits.length + reasoningHits.length} Signale`,
      `Umfang: ${wc} Wörter`
    ]
  };
}

function evaluateQuestion(question, userInput) {
  if (question.type === "single-choice") {
    return evaluateSingleChoice(question, userInput.answerValue || "");
  }

  if (question.type === "multi-select") {
    return evaluateMultiSelect(question, userInput.selectedIds || []);
  }

  if (question.type === "drag-order") {
    return evaluateDragOrder(question, userInput.orderedIds || []);
  }

  if (question.type === "short-text") {
    return evaluateShortText(question, userInput.answerText || "");
  }

  return evaluateOpenAnalysis(question, userInput.answerText || "");
}

function isMastered(questionId) {
  const answer = getAnswer(questionId);
  if (!answer?.result) return false;
  const question = getQuestionById(questionId);
  if (!question) return false;
  if (question.type === "single-choice") return answer.result.score === 100;
  if (question.type === "multi-select") return answer.result.score >= 80;
  if (question.type === "drag-order") return answer.result.score >= 80;
  return answer.result.score >= 68;
}

function buildStats() {
  const allQuestions = modules.flatMap((module) => module.questions);
  const answered = allQuestions.filter((question) => Boolean(getAnswer(question.id)?.result));
  const mastered = allQuestions.filter((question) => isMastered(question.id));
  const masteredModules = modules.filter((module) => module.questions.every((question) => isMastered(question.id)));
  const unlockedModules = modules.filter((module, index) => isModuleUnlocked(index));
  const averageScore = answered.length
    ? answered.reduce((sum, question) => sum + (getAnswer(question.id)?.result?.score || 0), 0) / answered.length
    : 0;

  return [
    { label: "Freigeschaltet", value: `${unlockedModules.length} / ${modules.length}` },
    { label: "Fragen gelöst", value: `${answered.length} / ${allQuestions.length}` },
    { label: "Sicher gemeistert", value: `${mastered.length}` },
    { label: "Durchschnitt", value: formatPercent(averageScore) }
  ];
}

function renderStats() {
  elements.statsGrid.innerHTML = buildStats()
    .map(
      (stat) => `
        <article class="stat-card">
          <span>${escapeHtml(stat.label)}</span>
          <strong>${escapeHtml(stat.value)}</strong>
        </article>
      `
    )
    .join("");
}

function getTeacherSummary(question) {
  if (question.type === "single-choice") {
    return "Prüft die zentrale historische Grundentscheidung dieser Station.";
  }
  if (question.type === "multi-select") {
    return "Prüft, ob mehrere historische Faktoren gleichzeitig erkannt und gegeneinander abgegrenzt werden.";
  }
  if (question.type === "drag-order") {
    return "Prüft Chronologie, Strukturverständnis und die Fähigkeit, Ereignisse oder Entwicklungsschritte sinnvoll zu ordnen.";
  }
  if (question.type === "short-text") {
    return `Diagnose der Begriffsarbeit: ${question.conceptGroups.map((group) => group.label).join("; ")}.`;
  }
  return `Diagnose der Transferleistung: ${question.rubric.map((entry) => entry.concept).join("; ")}.`;
}

function renderModuleNav() {
  elements.moduleNav.innerHTML = modules
    .map((module, index) => {
      const masteredCount = module.questions.filter((question) => isMastered(question.id)).length;
      const isActive = module.id === state.activeModuleId;
      const score = getModuleScore(module);
      const unlocked = isModuleUnlocked(index);
      const previousModule = modules[index - 1];
      return `
        <button class="module-button${isActive ? " active" : ""}${unlocked ? "" : " locked"}" type="button" data-module-id="${escapeHtml(module.id)}" ${unlocked ? "" : "disabled"}>
          <div>
            <span class="module-step">${escapeHtml(module.step)}</span>
            <h3>${escapeHtml(module.title)}</h3>
          </div>
          <p>${escapeHtml(module.intro)}</p>
          <div class="module-button-footer">
            <span>${unlocked ? escapeHtml(module.era) : "gesperrt"}</span>
            <span>${formatPercent(score)}</span>
          </div>
          <div class="module-button-footer">
            <span>${masteredCount}/${module.questions.length} gemeistert</span>
            <span>${unlocked ? "freigeschaltet" : `ab 60 % in ${escapeHtml(previousModule?.title || "Station 1")}`}</span>
          </div>
        </button>
      `;
    })
    .join("");

  elements.moduleNav.querySelectorAll("[data-module-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeModuleId = button.dataset.moduleId;
      state.sourceModalOpen = false;
      state.activeMiniQuestionId = null;
      renderApp();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderModuleHeader(module) {
  const masteredCount = module.questions.filter((question) => isMastered(question.id)).length;
  const moduleIndex = modules.findIndex((entry) => entry.id === module.id);
  const unlocked = isModuleUnlocked(moduleIndex);
  const moduleScore = getModuleScore(module);
  const visual = module.visual;
  const actors = module.actors || [];
  const visualDossier = module.visualDossier || [];
  const miniQuestions = getMiniQuestions(module);
  const integratedSources = getIntegratedSources(module);
  const videoSources = getVideoSources(module);

  elements.moduleHeader.innerHTML = `
    <div class="module-title-row">
      <div>
        <p class="eyebrow">Station ${escapeHtml(module.step)}</p>
        <h2>${escapeHtml(module.title)}</h2>
        <p class="module-copy">${escapeHtml(module.intro)}</p>
        <div class="module-kicker">
          <span class="module-pill">${escapeHtml(module.era)}</span>
          <span class="module-pill">${masteredCount}/${module.questions.length} Fragen gemeistert</span>
          <span class="module-pill">${formatPercent(moduleScore)} Modulscore</span>
          <span class="module-pill">${unlocked ? "freigeschaltet" : "gesperrt"}</span>
        </div>
      </div>
      <aside class="module-meta-card">
        <strong>Lernziel</strong>
        <p class="module-copy">${escapeHtml(module.goal)}</p>
      </aside>
    </div>

    ${
      visual
        ? `
          <figure class="module-visual">
            <img
              src="${escapeHtml(visual.src)}"
              alt="${escapeHtml(visual.alt || module.title)}"
              ${getImageErrorAttributes("module")}
              ${getImageStyleAttribute(visual)}
            />
          </figure>
        `
        : ""
    }

    <div class="module-grid">
      <article class="module-box">
        <h3>Arbeitsroute</h3>
        <p class="module-copy">${escapeHtml(module.route)}</p>
      </article>
      <article class="module-box">
        <h3>Kerninformation</h3>
        <p class="module-copy">${escapeHtml(module.goal)}</p>
      </article>
      <article class="module-box">
        <h3>Format</h3>
        <p class="module-copy">
          Kurze Informationen, Textfragen mit Sofortfeedback und eine Chronologieaufgabe.
        </p>
      </article>
      ${
        videoSources.length
          ? `
            <article class="module-box module-box-wide film-module-box">
              <div class="film-module-head">
                <div>
                  <h3>Filmmodul der Station</h3>
                  <p class="module-copy">
                    Öffne das Film-und-Fragen-Modul: Dort liegen die Dokumentation, ergänzende
                    Videos und die direkt dazugehörigen Fragen gesammelt als Popup.
                  </p>
                </div>
                <p class="film-module-status">${videoSources.length} Film${videoSources.length === 1 ? "" : "e"} integriert</p>
              </div>
              <div class="film-module-preview">
                ${videoSources
                  .map(
                    (resource) => `
                      <div class="film-preview-chip">
                        <strong>${escapeHtml(resource.title)}</strong>
                        <span>${escapeHtml(resource.focus)}</span>
                      </div>
                    `
                  )
                  .join("")}
              </div>
              <div class="question-actions">
                <button class="btn primary" type="button" data-open-source-modal="true">
                  Film-und-Fragen-Modul öffnen
                </button>
              </div>
            </article>
          `
          : integratedSources.length
            ? `
              <article class="module-box module-box-wide film-module-box">
                <div class="film-module-head">
                  <div>
                    <h3>Quellenmodul der Station</h3>
                    <p class="module-copy">
                      Diese Station arbeitet ohne Film, aber mit integriertem Quellenfenster und
                      zugehörigen Fragen.
                    </p>
                  </div>
                </div>
                <div class="question-actions">
                  <button class="btn primary" type="button" data-open-source-modal="true">
                    Quellenmodul öffnen
                  </button>
                </div>
              </article>
            `
            : ""
      }
      ${
        miniQuestions.length
          ? `
            <article class="module-box module-box-wide mini-checks-box">
              <div class="mini-checks-head">
                <div>
                  <h3>Zusatzchecks zur Station</h3>
                  <p class="module-copy">
                    Die eingebetteten Arbeitsimpulse liegen hier als kurze prüfbare Mini-Fragen
                    mit Sofortkorrektur vor.
                  </p>
                </div>
                <p class="mini-checks-status">${miniQuestions.filter((question) => isMastered(question.id)).length}/${miniQuestions.length} Zusatzchecks gemeistert</p>
              </div>
              <div class="mini-check-grid">
                ${miniQuestions
                  .map(
                    (question, index) => `
                      <button
                        class="mini-check-button${isMastered(question.id) ? " is-solved" : ""}"
                        type="button"
                        data-open-mini-question="${escapeHtml(question.id)}"
                      >
                        <span class="mini-check-index">${index + 1}</span>
                        <span class="mini-check-copy">
                          <strong>${escapeHtml(question.title || `Zusatzcheck ${index + 1}`)}</strong>
                          <span>${isMastered(question.id) ? "gemeistert" : "öffnen"}</span>
                        </span>
                      </button>
                    `
                  )
                  .join("")}
              </div>
            </article>
          `
          : ""
      }
    </div>

    ${
      visualDossier.length
        ? `
          <section class="focus-gallery">
            <div class="focus-gallery-head">
              <div>
                <p class="eyebrow">Bilddossier</p>
                <h3>${escapeHtml(module.visualDossierTitle || "Bilder, die diese Station tragen")}</h3>
              </div>
              <p class="module-copy">${escapeHtml(module.visualDossierIntro || "")}</p>
            </div>
            <div class="focus-gallery-grid">
              ${visualDossier
                .map(
                  (entry) => `
                    <article class="focus-card">
                      <img
                        class="focus-card-image"
                        src="${escapeHtml(entry.src)}"
                        alt="${escapeHtml(entry.alt || entry.title)}"
                        loading="lazy"
                        ${getImageErrorAttributes("card")}
                        ${getImageStyleAttribute(entry)}
                      />
                      <div class="focus-card-copy">
                        <h4>${escapeHtml(entry.title)}</h4>
                        <p class="focus-card-caption">${escapeHtml(entry.caption || "")}</p>
                      </div>
                    </article>
                  `
                )
                .join("")}
            </div>
          </section>
        `
        : ""
    }

    ${
      actors.length
        ? `
          <section class="actor-panel">
            <div class="actor-panel-head">
              <div>
                <p class="eyebrow">Akteurskonstellation</p>
                <h3>${escapeHtml(module.actorFocus?.title || "Akteur*innen dieser Station")}</h3>
              </div>
              <p class="module-copy">${escapeHtml(module.actorFocus?.intro || "")}</p>
            </div>
            <div class="actor-grid">
              ${actors
                .map(
                  (actor) => `
                    <article class="actor-card">
                      <img
                        class="actor-image"
                        src="${escapeHtml(actor.imageSrc)}"
                        alt="${escapeHtml(actor.imageAlt || actor.name)}"
                        loading="lazy"
                        ${getImageErrorAttributes("card")}
                        ${getImageStyleAttribute(actor)}
                      />
                      <div class="actor-copy">
                        <h4>${escapeHtml(actor.name)}</h4>
                        <p class="actor-role">${escapeHtml(actor.role)}</p>
                        ${
                          state.teacherMode
                            ? `
                              <p>${escapeHtml(actor.lens || "")}</p>
                              <p>${escapeHtml(actor.whyHere || "")}</p>
                            `
                            : ""
                        }
                      </div>
                    </article>
                  `
                )
                .join("")}
            </div>
          </section>
        `
        : ""
    }
  `;

  elements.moduleHeader.querySelectorAll("[data-open-mini-question]").forEach((button) => {
    button.addEventListener("click", () => {
      openMiniQuestion(button.dataset.openMiniQuestion);
    });
  });

  elements.moduleHeader.querySelector("[data-open-source-modal]")?.addEventListener("click", () => {
    openSourceModal();
  });
}

function renderTeacherPanel(module) {
  if (!state.teacherMode) {
    elements.teacherPanel.classList.add("hidden");
    elements.teacherPanel.innerHTML = "";
    return;
  }

  const toolkit = module.teacherToolkit || {};
  elements.teacherPanel.classList.remove("hidden");
  elements.teacherPanel.innerHTML = `
    <details class="teacher-details">
      <summary>Lehrpersonenansicht dieser Station öffnen</summary>
      <div class="teacher-details-body">
        <div class="section-head">
          <div>
            <p class="eyebrow">Lehrpersonenmodus</p>
            <h2>Zusatzansicht</h2>
          </div>
          <p class="section-copy">
            Diese Ansicht bündelt Zeitbedarf, Diagnosefokus, Fehlvorstellungen und Kommentare zu den Aufgaben.
          </p>
        </div>
        <div class="teacher-grid">
          <article class="teacher-card">
            <h3>Zeitbedarf</h3>
            <p>${escapeHtml(toolkit.duration || "45 Minuten")}</p>
          </article>
          <article class="teacher-card">
            <h3>Sozialformen</h3>
            <ul class="module-list">
              ${(toolkit.socialForms || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </article>
          <article class="teacher-card">
            <h3>Diagnosefokus</h3>
            <ul class="module-list">
              ${(toolkit.assessmentFocus || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </article>
          <article class="teacher-card">
            <h3>Typische Fehlvorstellungen</h3>
            <ul class="module-list">
              ${(toolkit.misconceptions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </article>
          <article class="teacher-card">
            <h3>Produkt</h3>
            <p>${escapeHtml(toolkit.product || "Kurze Transferantwort.")}</p>
          </article>
          <article class="teacher-card">
            <h3>Erweiterung</h3>
            <p>${escapeHtml(toolkit.extension || "Quellen vergleichen und Ergebnisse sichern.")}</p>
          </article>
        </div>
        <div class="teacher-map">
          ${module.questions
            .map(
              (question, index) => `
                <article class="teacher-map-card">
                  <h4>Kommentar zu Aufgabe ${index + 1}</h4>
                  <p><strong>Arbeitsfrage:</strong> ${escapeHtml(question.prompt)}</p>
                  <p>${escapeHtml(question.teacherPrompt || getTeacherSummary(question))}</p>
                  ${
                    question.commonPitfall
                      ? `<p><strong>Typische Schwachstelle:</strong> ${escapeHtml(question.commonPitfall)}</p>`
                      : ""
                  }
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </details>
  `;
}

function groupResources(resources) {
  const map = new Map();
  resources.forEach((resource) => {
    if (!map.has(resource.bucket)) {
      map.set(resource.bucket, []);
    }
    map.get(resource.bucket).push(resource);
  });
  return Array.from(map.entries());
}

function renderResources(module) {
  if (elements.resourcePanel) {
    elements.resourcePanel.classList.add("hidden");
    elements.resourcePanel.setAttribute("aria-hidden", "true");
  }
  if (elements.resourceGroups) {
    elements.resourceGroups.innerHTML = "";
  }
  return;

  const moduleIndex = modules.findIndex((entry) => entry.id === module.id);
  const unlocked = isModuleUnlocked(moduleIndex);
  if (!unlocked) {
    const previousModule = modules[moduleIndex - 1];
    elements.resourceGroups.innerHTML = `
      <section class="resource-group">
        <h3>Ressourcen noch gesperrt</h3>
        <p class="module-copy">
          Diese Station wird erst freigeschaltet, wenn du in
          <strong>${escapeHtml(previousModule?.title || "der vorangehenden Station")}</strong>
          mindestens 60 % erreichst.
        </p>
      </section>
    `;
    return;
  }

  const usageMap = getResourceUsageMap(module);
  const visibleResources = getVisibleResources(module);
  if (!visibleResources.length) {
    elements.resourceGroups.innerHTML = `
      <section class="resource-group">
        <h3>Materialien in Aufgaben eingearbeitet</h3>
        <p class="module-copy">
          Die relevanten Arbeitsaufträge stecken bereits in den Fragen dieser Station.
          Zusätzliche PDF-Fragenhefte werden in der Lernendenansicht nicht separat angezeigt.
        </p>
      </section>
    `;
    return;
  }

  elements.resourceGroups.innerHTML = groupResources(visibleResources)
    .map(([bucket, resources]) => {
      return `
        <section class="resource-group">
          <h3>${escapeHtml(bucket)}</h3>
          <div class="resource-grid">
            ${resources
              .map((resource) => {
                let actionLabel = "Material öffnen";
                if (resource.type === "Video") actionLabel = "Video öffnen";
                if (resource.type === "Bild") actionLabel = "Bild öffnen";
                if (resource.type === "Website") actionLabel = "Artikel öffnen";
                const targets = usageMap.get(resource.id) || [];
                return `
                  <article class="resource-card">
                    ${
                      resource.type === "Bild"
                        ? `
                          <a class="resource-image-link" href="${escapeHtml(resource.link)}" target="_blank" rel="noreferrer">
                            <img
                              class="resource-image"
                              src="${escapeHtml(resource.link)}"
                              alt="${escapeHtml(resource.imageAlt || resource.title)}"
                              loading="lazy"
                              ${getImageErrorAttributes("resource")}
                              ${getImageStyleAttribute(resource)}
                            />
                          </a>
                        `
                        : ""
                    }
                    <h4>${escapeHtml(resource.title)}</h4>
                    <div class="resource-type-row">
                      <span class="tag">${escapeHtml(resource.type)}</span>
                      ${resource.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
                    </div>
                    <p>${escapeHtml(resource.focus)}</p>
                    ${
                      resource.selectionNote
                        ? `<p class="resource-note"><strong>Auswahl:</strong> ${escapeHtml(resource.selectionNote)}</p>`
                        : ""
                    }
                    ${
                      resource.didacticUse
                        ? `<p class="resource-note"><strong>Einsatz:</strong> ${escapeHtml(resource.didacticUse)}</p>`
                        : ""
                    }
                    ${
                      targets.length
                        ? `<p class="resource-note"><strong>Direkt verknüpft mit:</strong> ${escapeHtml(formatQuestionTargets(targets))}</p>`
                        : ""
                    }
                    <div class="resource-actions">
                      <a class="btn ghost small" href="${escapeHtml(resource.link)}" target="_blank" rel="noreferrer">${actionLabel}</a>
                    </div>
                    ${
                      resource.type === "Audio"
                        ? `
                          <audio controls preload="none" class="audio-frame">
                            <source src="${escapeHtml(resource.link)}" type="audio/mpeg" />
                          </audio>
                        `
                        : ""
                    }
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderSourceChips(question, resourceMap) {
  return (question.sourceIds || [])
    .map((resourceId) => resourceMap.get(resourceId))
    .filter(Boolean)
    .map((resource) => `<span class="source-chip">${escapeHtml(resource.title)}</span>`)
    .join("");
}

function renderFeedback(result) {
  if (!result) {
    return `
      <div class="feedback-box neutral">
        <p class="feedback-title">Noch nicht korrigiert</p>
        <div class="feedback-body">Löse die Frage, um sofort Rückmeldung zu erhalten.</div>
      </div>
    `;
  }

  return `
    <div class="feedback-box ${escapeHtml(result.status)}">
      <p class="feedback-title">
        <span>${escapeHtml(result.title)}</span>
        <span>${escapeHtml(formatPercent(result.score))}</span>
      </p>
      <div class="feedback-body">${escapeHtml(result.body)}</div>
      ${
        result.strengths && result.strengths.length
          ? `<ul class="feedback-list">${result.strengths
              .map((item) => `<li>Stark: ${escapeHtml(item)}</li>`)
              .join("")}</ul>`
          : ""
      }
      ${
        result.missing && result.missing.length
          ? `<ul class="feedback-list">${result.missing
              .map((item) => `<li>Noch ausbauen: ${escapeHtml(item)}</li>`)
              .join("")}</ul>`
          : ""
      }
      ${
        state.teacherMode && result.breakdown && result.breakdown.length
          ? `<ul class="feedback-breakdown">${result.breakdown
              .map((item) => `<li>${escapeHtml(item)}</li>`)
              .join("")}</ul>`
          : ""
      }
    </div>
  `;
}

function renderDragOrderField(question, answer) {
  const savedOrder = answer?.userInput?.orderedIds || [];
  const itemMap = new Map((question.items || []).map((item) => [item.id, item]));
  const orderedItems = savedOrder.length
    ? savedOrder.map((id) => itemMap.get(id)).filter(Boolean)
    : question.items || [];

  return `
    <div class="drag-order" data-drag-question="${escapeHtml(question.id)}">
      ${orderedItems
        .map(
          (item, index) => `
            <div class="drag-card" draggable="true" data-drag-item-id="${escapeHtml(item.id)}">
              <span class="drag-index">${index + 1}</span>
              ${
                item.imageSrc
                  ? `
                    <img
                      class="drag-image"
                      src="${escapeHtml(item.imageSrc)}"
                      alt="${escapeHtml(item.imageAlt || item.label)}"
                      loading="lazy"
                      ${getImageErrorAttributes("card")}
                      ${getImageStyleAttribute(item)}
                    />
                  `
                  : ""
              }
              <div class="drag-copy">
                <strong>${escapeHtml(item.label)}</strong>
                ${item.detail ? `<p>${escapeHtml(item.detail)}</p>` : ""}
              </div>
              <span class="drag-handle" aria-hidden="true">⋮⋮</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderQuestionCard(question, index, resourceMap) {
  const answer = getAnswer(question.id);
  const sourceChips = renderSourceChips(question, resourceMap);
  const answerField = renderAnswerField(question, answer);

  return `
    <article class="question-card${isMastered(question.id) ? " mastered" : ""}" id="${escapeHtml(question.id)}">
      <div class="question-topline">
        <div>
          <span class="question-type">${escapeHtml(question.challenge)}</span>
          <h3>Frage ${index + 1}: ${escapeHtml(question.prompt)}</h3>
        </div>
        <div class="question-score">${escapeHtml(answer?.result ? formatPercent(answer.result.score) : "offen")}</div>
      </div>
      <p class="question-help">${escapeHtml(question.help)}</p>
      <div class="source-row">${sourceChips}</div>
      ${answerField}
      <div class="question-actions">
        <button class="btn primary small" type="button" data-evaluate-question="${escapeHtml(question.id)}">
          Sofortkorrektur
        </button>
      </div>
      ${renderFeedback(answer?.result)}
      <details>
        <summary>Lösung anzeigen</summary>
        <div class="model-answer">${escapeHtml(question.modelAnswer)}</div>
      </details>
    </article>
  `;
}

function renderAnswerField(question, answer) {
  if (question.type === "single-choice") {
    const savedValue = answer?.userInput?.answerValue || "";
    return `
      <div class="option-list">
        ${question.options
          .map(
            (option) => `
              <label class="option-item">
                <input type="radio" name="${escapeHtml(question.id)}" value="${escapeHtml(option.id)}" ${
                  savedValue === option.id ? "checked" : ""
                } />
                <span>${escapeHtml(option.text)}</span>
              </label>
            `
          )
          .join("")}
      </div>
    `;
  }

  if (question.type === "multi-select") {
    const savedIds = new Set(answer?.userInput?.selectedIds || []);
    return `
      <div class="option-list">
        ${question.options
          .map(
            (option) => `
              <label class="option-item">
                <input type="checkbox" value="${escapeHtml(option.id)}" ${
                  savedIds.has(option.id) ? "checked" : ""
                } data-question-checkbox="${escapeHtml(question.id)}" />
                <span>${escapeHtml(option.text)}</span>
              </label>
            `
          )
          .join("")}
      </div>
    `;
  }

  if (question.type === "drag-order") {
    return renderDragOrderField(question, answer);
  }

  const savedText = answer?.userInput?.answerText || "";
  const fieldClass = question.type === "open-analysis" ? "answer-field large" : "answer-field";
  return `
    <textarea
      class="${fieldClass}"
      data-question-text="${escapeHtml(question.id)}"
      placeholder="${escapeHtml(question.placeholder || "")}"
    >${escapeHtml(savedText)}</textarea>
  `;
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".drag-card:not(.dragging)")];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}

function activateDragAndDrop() {
  elements.questionList.querySelectorAll("[data-drag-question]").forEach((container) => {
    let dragged = null;

    container.querySelectorAll(".drag-card").forEach((card) => {
      card.addEventListener("dragstart", () => {
        dragged = card;
        card.classList.add("dragging");
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        dragged = null;
      });
    });

    container.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (!dragged) return;
      const afterElement = getDragAfterElement(container, event.clientY);
      if (!afterElement) {
        container.appendChild(dragged);
      } else if (afterElement !== dragged) {
        container.insertBefore(dragged, afterElement);
      }
    });

    container.addEventListener("drop", (event) => {
      event.preventDefault();
    });
  });
}

function renderQuestions(module) {
  const moduleIndex = modules.findIndex((entry) => entry.id === module.id);
  const unlocked = isModuleUnlocked(moduleIndex);
  if (!unlocked) {
    const previousModule = modules[moduleIndex - 1];
    elements.questionList.innerHTML = `
      <article class="question-card locked">
        <div class="question-topline">
          <div>
            <span class="question-type">Freischaltung</span>
            <h3>Nächste Station gesperrt</h3>
          </div>
          <div class="question-score">${formatPercent(getModuleScore(previousModule))}</div>
        </div>
        <p class="question-help">
          Erreiche zuerst mindestens 60 % im vorangehenden Modul
          <strong>${escapeHtml(previousModule?.title || "")}</strong>. Danach werden Fragen und
          Materialien dieser Station automatisch freigeschaltet.
        </p>
      </article>
    `;
    return;
  }

  const resourceMap = getResourceMap(module);
  elements.questionList.innerHTML = module.questions
    .map((question, index) => renderQuestionCard(question, index, resourceMap))
    .join("");

  elements.questionList.querySelectorAll("[data-evaluate-question]").forEach((button) => {
    button.addEventListener("click", () => {
      const questionId = button.dataset.evaluateQuestion;
      evaluateAndStore(questionId, elements.questionList);
      renderApp();
      const target = document.getElementById(questionId);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  activateDragAndDrop();
}

function collectUserInput(question, root = document) {
  if (question.type === "single-choice") {
    const selected = root.querySelector(`input[name="${question.id}"]:checked`);
    return { answerValue: selected?.value || "" };
  }

  if (question.type === "multi-select") {
    const selectedIds = Array.from(root.querySelectorAll(`[data-question-checkbox="${question.id}"]:checked`)).map(
      (input) => input.value
    );
    return { selectedIds };
  }

  if (question.type === "drag-order") {
    const orderedIds = Array.from(
      root.querySelectorAll(`[data-drag-question="${question.id}"] [data-drag-item-id]`)
    ).map((item) => item.dataset.dragItemId);
    return { orderedIds };
  }

  const textarea = root.querySelector(`[data-question-text="${question.id}"]`);
  return { answerText: textarea?.value || "" };
}

function evaluateAndStore(questionId, root = document) {
  const question = getQuestionById(questionId);
  if (!question) return;
  const userInput = collectUserInput(question, root);
  const result = evaluateQuestion(question, userInput);
  setAnswer(questionId, { userInput, result, updatedAt: Date.now() });
}

function openMiniQuestion(questionId) {
  state.activeMiniQuestionId = questionId;
  renderMiniQuestionModal();
}

function closeMiniQuestion() {
  state.activeMiniQuestionId = null;
  renderMiniQuestionModal();
}

function renderMiniQuestionModal() {
  if (!elements.miniQuestionModal) return;

  const module = getActiveModule();
  const miniQuestions = getMiniQuestions(module);
  const questionIndex = miniQuestions.findIndex((entry) => entry.id === state.activeMiniQuestionId);
  const question = questionIndex > -1 ? miniQuestions[questionIndex] : null;

  if (!question) {
    elements.miniQuestionModal.classList.add("hidden");
    elements.miniQuestionModal.setAttribute("aria-hidden", "true");
    elements.miniQuestionModal.innerHTML = "";
    return;
  }

  const answer = getAnswer(question.id);
  const resourceMap = getResourceMap(module);

  elements.miniQuestionModal.classList.remove("hidden");
  elements.miniQuestionModal.setAttribute("aria-hidden", "false");
  elements.miniQuestionModal.innerHTML = `
    <div class="mini-question-backdrop" data-close-mini-question="true"></div>
    <div class="mini-question-dialog" role="dialog" aria-modal="true" aria-labelledby="mini-question-title">
      <div class="mini-question-header">
        <div>
          <p class="eyebrow">Zusatzcheck ${questionIndex + 1}</p>
          <h3 id="mini-question-title">${escapeHtml(question.title || "Zusatzfrage")}</h3>
        </div>
        <button class="btn ghost small mini-question-close" type="button" data-close-mini-question="true">Schließen</button>
      </div>
      <div class="mini-question-body">
        <div class="question-topline mini-question-topline">
          <div>
            <span class="question-type">${escapeHtml(question.challenge)}</span>
            <h4>${escapeHtml(question.prompt)}</h4>
          </div>
          <div class="question-score">${escapeHtml(answer?.result ? formatPercent(answer.result.score) : "offen")}</div>
        </div>
        <p class="question-help">${escapeHtml(question.help)}</p>
        <div class="source-row">${renderSourceChips(question, resourceMap)}</div>
        ${renderAnswerField(question, answer)}
        <div class="question-actions">
          <button class="btn primary small" type="button" data-evaluate-mini-question="${escapeHtml(question.id)}">
            Sofortkorrektur
          </button>
        </div>
        ${renderFeedback(answer?.result)}
        <details>
          <summary>Musterlösung anzeigen</summary>
          <div class="model-answer">${escapeHtml(question.modelAnswer)}</div>
        </details>
      </div>
    </div>
  `;

  elements.miniQuestionModal.querySelectorAll("[data-close-mini-question]").forEach((button) => {
    button.addEventListener("click", closeMiniQuestion);
  });

  elements.miniQuestionModal.querySelector("[data-evaluate-mini-question]")?.addEventListener("click", () => {
    evaluateAndStore(question.id, elements.miniQuestionModal);
    renderApp();
  });
}

function getSourceActionLabel(resource) {
  if (resource.type === "Video") return "Film öffnen";
  if (resource.type === "Bild") return "Bild öffnen";
  if (resource.type === "Website") return "Artikel öffnen";
  return "Quelle öffnen";
}

function renderSourceModal() {
  if (!elements.sourceModal) return;

  const module = getActiveModule();
  const integratedSources = getIntegratedSources(module);
  const videoSources = integratedSources.filter((resource) => resource.type === "Video");
  const otherSources = integratedSources.filter((resource) => resource.type !== "Video");
  const allUnitVideos = getAllVideoResources();

  if (!state.sourceModalOpen || !integratedSources.length) {
    elements.sourceModal.classList.add("hidden");
    elements.sourceModal.setAttribute("aria-hidden", "true");
    elements.sourceModal.innerHTML = "";
    return;
  }

  elements.sourceModal.classList.remove("hidden");
  elements.sourceModal.setAttribute("aria-hidden", "false");
  elements.sourceModal.innerHTML = `
    <div class="source-modal-backdrop" data-close-source-modal="true"></div>
    <div class="source-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="source-modal-title">
      <div class="source-modal-header">
        <div>
          <p class="eyebrow">Film-und-Fragen-Modul</p>
          <h3 id="source-modal-title">${escapeHtml(module.title)}: Filme und Aufgaben</h3>
          <p class="module-copy">
            Die Filme bleiben direkt zugänglich. Unter jedem Film stehen die Hauptfragen und
            Zusatzchecks, die genau mit diesem Material verknüpft sind. Die PDF-Fragen erscheinen
            nicht separat, weil sie hier bereits eingearbeitet sind.
          </p>
        </div>
        <button class="btn ghost small" type="button" data-close-source-modal="true">Schließen</button>
      </div>
      <div class="source-modal-body">
        ${
          allUnitVideos.length
            ? `
              <section class="source-modal-group">
                <h4>Filmreihe in chronologischer Reihenfolge</h4>
                <div class="source-modal-body-inner">
                  ${modules
                    .map((moduleEntry) => {
                      const moduleVideos = allUnitVideos.filter((resource) => resource.moduleId === moduleEntry.id);
                      if (!moduleVideos.length) return "";
                      return `
                        <section class="source-modal-group${moduleEntry.id === module.id ? " source-modal-group-emphasis" : ""}">
                          <h4>Station ${escapeHtml(moduleEntry.step)}: ${escapeHtml(moduleEntry.title)}</h4>
                          <div class="film-modal-grid">
                            ${moduleVideos
                              .map((resource) =>
                                renderSourceModalCard(module, resource, {
                                  showModuleMeta: moduleEntry.id !== module.id
                                })
                              )
                              .join("")}
                          </div>
                        </section>
                      `;
                    })
                    .join("")}
                </div>
              </section>
            `
            : ""
        }
        ${
          otherSources.length
            ? `
              <details class="source-modal-details">
                <summary>Weitere integrierte Quellen anzeigen</summary>
                <section class="source-modal-group">
                  <div class="source-modal-grid">
                    ${otherSources
                      .map((resource) => renderSourceModalCard(module, resource))
                      .join("")}
                  </div>
                </section>
              </details>
            `
            : ""
        }
      </div>
    </div>
  `;

  elements.sourceModal.querySelectorAll("[data-close-source-modal]").forEach((button) => {
    button.addEventListener("click", closeSourceModal);
  });

  elements.sourceModal.querySelectorAll("[data-jump-question]").forEach((button) => {
    button.addEventListener("click", () => {
      const questionId = button.dataset.jumpQuestion;
      closeSourceModal();
      requestAnimationFrame(() => {
        const target = document.getElementById(questionId);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });

  elements.sourceModal.querySelectorAll("[data-open-linked-mini]").forEach((button) => {
    button.addEventListener("click", () => {
      const questionId = button.dataset.openLinkedMini;
      closeSourceModal();
      openMiniQuestion(questionId);
    });
  });

  elements.sourceModal.querySelectorAll("[data-open-resource-module]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeModuleId = button.dataset.openResourceModule;
      state.activeMiniQuestionId = null;
      state.sourceModalOpen = true;
      renderApp();
    });
  });
}

function renderSourceModalCard(module, resource, options = {}) {
  const homeModule = resource.moduleId ? getModuleById(resource.moduleId) : module;
  const linkedQuestions = homeModule?.id === module.id ? getQuestionsForResource(module, resource.id) : [];
  return `
    <article class="source-modal-card${resource.type === "Video" ? " film-modal-card" : ""}">
      <div class="resource-type-row">
        <span class="tag">${escapeHtml(resource.type)}</span>
        ${resource.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
      <h5>${escapeHtml(resource.title)}</h5>
      ${
        options.showModuleMeta && homeModule
          ? `<p class="resource-note"><strong>Station:</strong> ${escapeHtml(homeModule.step)} - ${escapeHtml(homeModule.title)}</p>`
          : ""
      }
      <p>${escapeHtml(resource.focus)}</p>
      ${
        resource.selectionNote
          ? `<p class="resource-note"><strong>Auswahl:</strong> ${escapeHtml(resource.selectionNote)}</p>`
          : ""
      }
      ${
        resource.didacticUse
          ? `<p class="resource-note"><strong>Einbau:</strong> ${escapeHtml(resource.didacticUse)}</p>`
          : ""
      }
      <div class="resource-actions">
        <a class="btn ${resource.type === "Video" ? "primary" : "ghost"} small" href="${escapeHtml(resource.link)}" target="_blank" rel="noreferrer">
          ${getSourceActionLabel(resource)}
        </a>
        ${
          options.showModuleMeta && homeModule?.id !== module.id
            ? `
              <button class="btn ghost small" type="button" data-open-resource-module="${escapeHtml(homeModule.id)}">
                Zu Station ${escapeHtml(homeModule.step)}
              </button>
            `
            : ""
        }
      </div>
      ${
        resource.type === "Video" && linkedQuestions.length
          ? `
            <div class="linked-question-block">
              <p class="linked-question-title">Direkt dazugehörige Fragen</p>
              <div class="linked-question-grid">
                ${linkedQuestions
                  .map((question) => {
                    const reference = getQuestionReference(module, question);
                    return reference.kind === "mini"
                      ? `
                          <button class="linked-question-chip" type="button" data-open-linked-mini="${escapeHtml(question.id)}">
                            <strong>${escapeHtml(reference.label)}</strong>
                            <span>${escapeHtml(reference.title)}</span>
                          </button>
                        `
                      : `
                          <button class="linked-question-chip" type="button" data-jump-question="${escapeHtml(question.id)}">
                            <strong>${escapeHtml(reference.label)}</strong>
                            <span>${escapeHtml(reference.title)}</span>
                          </button>
                        `;
                  })
                  .join("")}
              </div>
            </div>
          `
          : ""
      }
    </article>
  `;
}

function openSourceModal() {
  state.activeMiniQuestionId = null;
  state.sourceModalOpen = true;
  renderSourceModal();
}

function closeSourceModal() {
  state.sourceModalOpen = false;
  renderSourceModal();
}

function jumpToFirstOpenQuestion() {
  for (const module of modules) {
    const moduleIndex = modules.findIndex((entry) => entry.id === module.id);
    if (!isModuleUnlocked(moduleIndex)) continue;
    const question = module.questions.find((entry) => entry.challenge === "Transfer");
    if (question) {
      state.activeModuleId = module.id;
      renderApp();
      requestAnimationFrame(() => {
        const target = document.getElementById(question.id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
  }
}

function unlockTeacherMode() {
  state.teacherAuthorized = true;
  state.teacherMode = true;
  state.teacherAccessOpen = false;
  saveStore();
  renderApp();
  requestAnimationFrame(() => {
    elements.questionList.closest(".panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function lockTeacherMode() {
  state.teacherAuthorized = false;
  state.teacherMode = false;
  state.teacherAccessOpen = false;
  saveStore();
  renderApp();
}

function renderTeacherAccessPanel() {
  if (!elements.teacherAccessPanel) return;

  if (!state.teacherAuthorized && !state.teacherAccessOpen) {
    elements.teacherAccessPanel.classList.add("hidden");
    elements.teacherAccessPanel.innerHTML = "";
    return;
  }

  elements.teacherAccessPanel.classList.remove("hidden");

  if (!state.teacherAuthorized) {
    elements.teacherAccessPanel.innerHTML = `
      <div class="teacher-access-wrap">
        <div>
          <p class="eyebrow">Lehrer*innenzugang</p>
          <h2>Lehrpersonenmodus freischalten</h2>
          <p class="section-copy">
            Der Lehrerzugang blendet Zusatzhinweise, Diagnosefokus und kommentierte Aufgabenansichten ein.
          </p>
        </div>
        <form class="teacher-access-form" id="teacher-access-form">
          <label for="teacher-access-password">Passwort</label>
          <input
            id="teacher-access-password"
            name="teacher-access-password"
            type="password"
            autocomplete="current-password"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            placeholder="Passwort eingeben"
            required
          />
          <div class="teacher-access-actions">
            <button class="btn primary" type="submit">Freischalten</button>
            <button class="btn ghost" type="button" id="teacher-access-close">Schließen</button>
          </div>
          <p class="teacher-access-status" id="teacher-access-status" aria-live="polite"></p>
        </form>
      </div>
    `;

    const form = document.getElementById("teacher-access-form");
    const input = document.getElementById("teacher-access-password");
    const status = document.getElementById("teacher-access-status");
    const closeButton = document.getElementById("teacher-access-close");

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input?.value.trim() || "";
      if (!isTeacherPasswordValid(value)) {
        if (status) status.textContent = "Passwort nicht korrekt.";
        return;
      }
      unlockTeacherMode();
    });

    closeButton?.addEventListener("click", () => {
      state.teacherAccessOpen = false;
      renderTeacherAccessPanel();
    });

    requestAnimationFrame(() => input?.focus());
    return;
  }

  elements.teacherAccessPanel.innerHTML = `
    <div class="teacher-access-wrap teacher-access-status-card">
      <div>
        <p class="eyebrow">Lehrpersonenmodus</p>
        <h2>${state.teacherMode ? "Lehrerhinweise sind aktiv" : "Lehrerhinweise sind ausgeblendet"}</h2>
        <p class="section-copy">
          ${state.teacherMode
            ? "Zusätzliche Kommentare und Diagnosehinweise werden angezeigt."
            : "Der Zugang ist freigeschaltet. Die Zusatzansicht kann wieder eingeblendet werden."}
        </p>
      </div>
      <div class="teacher-access-actions">
        <button class="btn primary" type="button" id="teacher-access-toggle">
          ${state.teacherMode ? "Lehrerhinweise ausblenden" : "Lehrerhinweise einblenden"}
        </button>
        <button class="btn ghost" type="button" id="teacher-access-lock">Zugang sperren</button>
      </div>
    </div>
  `;

  document.getElementById("teacher-access-toggle")?.addEventListener("click", () => {
    state.teacherMode = !state.teacherMode;
    saveStore();
    renderApp();
  });

  document.getElementById("teacher-access-lock")?.addEventListener("click", lockTeacherMode);
}

function renderApp() {
  const activeIndex = modules.findIndex((entry) => entry.id === state.activeModuleId);
  if (activeIndex > -1 && !isModuleUnlocked(activeIndex)) {
    state.activeModuleId = getFirstAvailableModuleId();
  }

  const module = getActiveModule();
  if (!module) return;
  if (state.activeMiniQuestionId && !getMiniQuestions(module).some((question) => question.id === state.activeMiniQuestionId)) {
    state.activeMiniQuestionId = null;
  }
  if (!getIntegratedSources(module).length) {
    state.sourceModalOpen = false;
  }
  if (!state.teacherAuthorized) {
    state.teacherMode = false;
  }
  if (elements.teacherModeButton) {
    elements.teacherModeButton.textContent = state.teacherMode
      ? "Lehrerhinweise ausblenden"
      : state.teacherAuthorized
        ? "Lehrerhinweise einblenden"
        : "Lehrer*innenzugang";
    elements.teacherModeButton.classList.toggle("is-active", state.teacherMode);
  }
  renderTeacherAccessPanel();
  renderStats();
  renderModuleNav();
  renderModuleHeader(module);
  renderTeacherPanel(module);
  renderResources(module);
  renderQuestions(module);
  renderMiniQuestionModal();
  renderSourceModal();
}

elements.startRouteButton?.addEventListener("click", () => {
  state.activeModuleId = modules[0]?.id || null;
  state.sourceModalOpen = false;
  state.activeMiniQuestionId = null;
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

elements.openFirstOpenButton?.addEventListener("click", jumpToFirstOpenQuestion);
elements.teacherModeButton?.addEventListener("click", () => {
  if (!state.teacherAuthorized) {
    state.teacherAccessOpen = !state.teacherAccessOpen;
    renderTeacherAccessPanel();
    if (state.teacherAccessOpen) {
      requestAnimationFrame(() => {
        elements.teacherAccessPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    return;
  }
  state.teacherMode = !state.teacherMode;
  saveStore();
  renderApp();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.activeMiniQuestionId) {
    closeMiniQuestion();
    return;
  }
  if (event.key === "Escape" && state.sourceModalOpen) {
    closeSourceModal();
  }
});

const persisted = loadStore();
state.answers = persisted.answers;
state.teacherMode = persisted.teacherMode;
state.teacherAuthorized = persisted.teacherAuthorized;
renderApp();
