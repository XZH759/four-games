/**
 * AI Knowledge Journey · companion quiz + settlement (from map step 3).
 * Still uses items.seed.json + ItemRenderer; companions encourage only.
 */
import { getNode, TOTAL_LEVELS, LEVEL_ITEM_IDS, REGIONS } from "/js/nuannuan/map-config.js";
import {
  getActiveBoutique,
  tryUnlockModule,
  readSessionDesigned,
  clearSessionDesigned,
  MODULE_LABEL_KEYS,
  setActiveBoutique,
  getBoutique,
  invalidBoutiqueFromUrl,
} from "/js/nuannuan/fashion-town.js";
import {
  isFashionCollectMode,
  resolveCollectBoutiqueId,
  mountFashionCollect,
  paintFashionChrome,
  paintFashionPlayer,
  paintDesignBoard,
  showFashionFeedback,
  hideFashionFeedback,
} from "/collect/collect-fashion.js";
import {
  mountFashionSettle,
  paintFashionSettle,
  SETTLE_PENDING_KEY,
} from "/collect/collect-settle-fashion.js";
import { AI_QUESTIONS, isCorrectOption } from "/monopoly/questions.js";
import {
  getCompanion,
  loadConfirmedCompanion,
  loadCompanionDraft,
  localizeCompanion,
} from "/js/nuannuan/companion-config.js";
import { mountLobbyExit } from "/js/lobby-exit.js";
import { logAnswers } from "/js/answer-log.js";
import { logEvent, trackPageView } from "/js/event-log.js";
import { createDwellTracker } from "/js/dwell-log.js";

const dwell = createDwellTracker("collect");
import { initI18n, onLangChange, applyDom, getLang, t } from "/js/i18n.js";

initI18n({ toggleHost: "#lang-host" });
onLangChange(() => {
  applyDom();
  paintBrief();
  if (!els.quiz.hidden) {
    if (state.fashionMode) {
      paintFashionChrome({ state, els, t, answeredInSession });
      void paintFashionPlayer({ state, els, t, getLang });
    } else paintChrome();
  }
  if (!els.settle.hidden) paintSettle();
});

const PROGRESS_KEY = "ailit_progress_collect";

const QUIZ_LINE = {
  bella: { zh: "先回想你学过的内容。", en: "Think about what you learned before." },
  ava: { zh: "稳住节奏，一步一步来。", en: "Keep a steady pace — one step at a time." },
  eileen: { zh: "先找选项里的关键模式。", en: "Look for the key pattern in the choices." },
  fiona: { zh: "你已经很棒了，慢慢来。", en: "You’re doing great – take your time." },
  gladys: { zh: "把步骤核对一遍，再提交。", en: "Check the steps, then submit." },
  diana: { zh: "把这题和你之前学过的连起来。", en: "Connect this to what you learned before." },
};

const SETTLE_LINE = {
  bella: { zh: "优雅地走完这一段了。休息一下，再继续发光。", en: "You finished this stretch with grace. Reset, then shine again." },
  ava: { zh: "节奏保持得很好。下一拍，我们继续。", en: "Nice pace. We’ll keep the beat going." },
  eileen: { zh: "线索已经排过一遍。接下来把旅程往前推。", en: "You lined up the clues. Let’s advance the journey." },
  fiona: { zh: "你已经很努力了。我们一起把下一段走完。", en: "You tried hard. Let’s walk the next stretch together." },
  gladys: { zh: "步骤核对完毕。可以继续向前了。", en: "Checklist complete. We can move forward." },
  diana: { zh: "知识会发光。我们把地图再点亮一点。", en: "Knowledge glows. Let’s light up more of the map." },
};

const BRIEF_PACK = {
  bella: {
    focus: { zh: "专注：重置与回神", en: "Focus: Reset & Refocus" },
    skills: [
      { zh: ["平静重置", "帮你呼吸一下，回到平静。"], en: ["Calm Reset", "helps you breathe and return to calm."] },
      { zh: ["休息提醒", "需要时建议你短暂歇一歇。"], en: ["Break Reminder", "suggests short breaks when needed."] },
      { zh: ["注意恢复", "轻轻把注意力带回来。"], en: ["Attention Recovery", "helps you refocus and come back gently."] },
    ],
  },
  ava: {
    focus: { zh: "专注：节奏与动量", en: "Focus: Pace & Momentum" },
    skills: [
      { zh: ["节奏教练", "帮你保持稳定的答题拍子。"], en: ["Pace Coach", "helps you maintain a steady answering rhythm."] },
      { zh: ["前进动量", "让进度流动，减少卡住。"], en: ["Momentum", "keeps progress flowing and reduces hesitation."] },
      { zh: ["信心火花", "为努力喝彩，把信心点亮。"], en: ["Confidence Spark", "celebrates effort and builds confidence."] },
    ],
  },
  eileen: {
    focus: { zh: "专注：分析与比较", en: "Focus: Analyze & Compare" },
    skills: [
      { zh: ["模式透镜", "提醒你留意题干里的关键模式。"], en: ["Pattern Lens", "highlights keywords and important patterns."] },
      { zh: ["焦点信号", "把注意力引向真正要紧的结构。"], en: ["Focus Signal", "guides attention to the structure that matters."] },
      { zh: ["比较助手", "提醒你公平地对照各个选项。"], en: ["Comparison Aid", "helps you compare options carefully and fairly."] },
    ],
  },
  fiona: {
    focus: { zh: "专注：鼓励与安抚", en: "Focus: Encourage & Comfort" },
    skills: [
      { zh: ["鼓励", "用温柔的话给你打气。"], en: ["Encouragement", "offers kind words to lift your spirits."] },
      { zh: ["情绪减压", "帮你放下压力和紧张。"], en: ["Emotional Ease", "helps reduce pressure and test anxiety."] },
      { zh: ["轻轻坚持", "鼓励你把这一组认真做完。"], en: ["Gentle Persistence", "encourages finishing the set with care."] },
    ],
  },
  gladys: {
    focus: { zh: "专注：思考与核对", en: "Focus: Think & Verify" },
    skills: [
      { zh: ["分步思考", "把任务拆成简单的小步骤。"], en: ["Step-by-Step Thinking", "breaks tasks into simple steps."] },
      { zh: ["逻辑链", "提醒你顺着因果往下想。"], en: ["Logic Chain", "reminds you to follow cause and effect."] },
      { zh: ["差错检查", "提交前再核对一遍。"], en: ["Error Check", "prompts you to review before submitting."] },
    ],
  },
  diana: {
    focus: { zh: "专注：连接与回忆", en: "Focus: Connect & Recall" },
    skills: [
      { zh: ["知识链接", "把这题接到你之前学过的内容。"], en: ["Knowledge Link", "connects the question to what you learned before."] },
      { zh: ["记忆加持", "鼓励你回想相关概念。"], en: ["Memory Boost", "encourages recall of related concepts."] },
      { zh: ["灵感", "再换一个角度想想。"], en: ["Inspiration", "suggests another angle to think about."] },
    ],
  },
};

const els = {
  bootError: document.getElementById("boot-error"),
  brief: document.getElementById("phase-brief"),
  quiz: document.getElementById("phase-quiz"),
  settle: document.getElementById("phase-settle"),
  briefStage: document.getElementById("brief-stage"),
  briefPortrait: document.getElementById("brief-portrait"),
  briefName: document.getElementById("brief-name"),
  briefRole: document.getElementById("brief-role"),
  briefBio: document.getElementById("brief-bio"),
  briefSkills: document.getElementById("brief-skills"),
  briefFocus: document.getElementById("brief-focus"),
  briefStart: document.getElementById("brief-start"),
  itemRoot: document.getElementById("item-root"),
  levelBadge: document.getElementById("level-badge"),
  progressLabel: document.getElementById("progress-label"),
  progressFill: document.getElementById("progress-fill"),
  starPair: document.getElementById("star-pair"),
  domainPill: document.getElementById("domain-pill"),
  sceneArt: document.getElementById("scene-art"),
  buddySprite: document.getElementById("buddy-sprite"),
  quizSpeech: document.getElementById("quiz-speech"),
  skip: document.getElementById("btn-skip"),
  next: document.getElementById("btn-next"),
  settleStage: document.getElementById("settle-stage"),
  settlePortrait: document.getElementById("settle-portrait"),
  settleSpeech: document.getElementById("settle-speech"),
  settleTitle: document.getElementById("settle-title"),
  statAnswered: document.getElementById("stat-answered"),
  statSkipped: document.getElementById("stat-skipped"),
  statStars: document.getElementById("stat-stars"),
  settleReview: document.getElementById("settle-review"),
  settleContinue: document.getElementById("settle-continue"),
  statDesigned: document.getElementById("stat-designed"),
  designHost: document.getElementById("between-host"),
  quizTopLegacy: document.getElementById("quiz-top-legacy"),
  quizFootLegacy: document.getElementById("quiz-foot-legacy"),
  companionStage: document.getElementById("companion-stage"),
  ftQuizHead: document.getElementById("ft-quiz-head"),
  ftQuizActions: document.getElementById("ft-quiz-actions"),
  ftBackMap: document.getElementById("ft-back-map"),
  ftBoutiqueIcon: document.getElementById("ft-boutique-icon"),
  ftChallengeTitle: document.getElementById("ft-challenge-title"),
  ftChallengeSub: document.getElementById("ft-challenge-sub"),
  ftStagePill: document.getElementById("ft-stage-pill"),
  ftScorePair: document.getElementById("ft-score-pair"),
  ftPlayerPanel: document.getElementById("ft-player-panel"),
  ftPlayerAvatar: document.getElementById("ft-player-avatar"),
  ftPlayerName: document.getElementById("ft-player-name"),
  ftPlayerRole: document.getElementById("ft-player-role"),
  ftPlayerTagline: document.getElementById("ft-player-tagline"),
  ftCompanionName: document.getElementById("ft-companion-name"),
  ftCompanionRole: document.getElementById("ft-companion-role"),
  ftCompanionPortrait: document.getElementById("ft-companion-portrait"),
  ftCompanionLine: document.getElementById("ft-companion-line"),
  ftChallengeHead: document.getElementById("ft-challenge-head"),
  ftTargetModule: document.getElementById("ft-target-module"),
  ftDesignBoard: document.getElementById("ft-design-board"),
  ftFeedback: document.getElementById("ft-feedback"),
  ftJourney: document.getElementById("ft-journey-flow"),
  btnDraft: document.getElementById("btn-draft"),
  btnSubmit: document.getElementById("btn-submit"),
  btnSkipFt: document.getElementById("btn-skip-ft"),
  settleLegacy: document.getElementById("settle-legacy"),
  ftSettle: document.getElementById("ft-settle"),
  ftConfetti: document.getElementById("ft-confetti"),
  ftSettleTitle: document.getElementById("ft-settle-title"),
  ftSettleSub: document.getElementById("ft-settle-sub"),
  ftSettleCompanionTitle: document.getElementById("ft-settle-companion-title"),
  ftSettlePortrait: document.getElementById("ft-settle-portrait"),
  ftSettleSpeech: document.getElementById("ft-settle-speech"),
  ftSettleBond: document.getElementById("ft-settle-bond"),
  ftModuleCards: document.getElementById("ft-module-cards"),
  ftSlotBoard: document.getElementById("ft-slot-board"),
  ftRewards: document.getElementById("ft-rewards"),
  settleContinueFt: document.getElementById("settle-continue-ft"),
  settleWardrobe: document.getElementById("settle-wardrobe"),
  settleReviewFt: document.getElementById("settle-review-ft"),
};

const state = {
  config: null,
  itemsById: {},
  order: [],
  session: [],
  cursor: 0,
  answers: {},
  skipped: new Set(),
  logged: new Set(),
  companion: null,
  startedAt: 0,
  reviewing: false,
  fashionMode: false,
  boutiqueId: null,
  busy: false,
  settleDesigned: [],
};

function sessionResolved() {
  return (
    state.session.length > 0
    && state.session.every(
      (s) => state.answers[s.item.id] != null || state.skipped.has(s.item.id),
    )
  );
}

function readSettlePending() {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTLE_PENDING_KEY) || "null");
    if (!raw?.boutiqueId) return null;
    return raw;
  } catch {
    return null;
  }
}

function markSettlePending() {
  if (!state.fashionMode || !state.boutiqueId) return;
  localStorage.setItem(
    SETTLE_PENDING_KEY,
    JSON.stringify({
      boutiqueId: state.boutiqueId,
      at: Date.now(),
      designed: state.settleDesigned,
    }),
  );
}

function finalizeSettleSession() {
  clearSettlePending();
  clearSessionDesigned();
}

function clearSettlePending() {
  localStorage.removeItem(SETTLE_PENDING_KEY);
}

function isEn() {
  return getLang() === "en";
}

function snapshotSettleDesigned() {
  state.settleDesigned = readSessionDesigned();
}

function companionId() {
  return state.companion?.id || "diana";
}

function pickLang(pack) {
  if (!pack) return "";
  return isEn() ? pack.en : pack.zh;
}

function lineFor(map) {
  const pack = map[companionId()] || map.diana;
  return pickLang(pack);
}

function setPhase(name) {
  document.body.dataset.phase = name;
  document.body.dataset.companion = companionId();
  els.brief.hidden = name !== "brief";
  els.quiz.hidden = name !== "quiz";
  els.settle.hidden = name !== "settle";
}

function progressStorageKey() {
  return state.boutiqueId ? `${PROGRESS_KEY}_${state.boutiqueId}` : PROGRESS_KEY;
}

function loadLocalAnswers() {
  try {
    return JSON.parse(localStorage.getItem(progressStorageKey()) || "{}");
  } catch {
    return {};
  }
}

function saveLocalAnswers() {
  localStorage.setItem(
    progressStorageKey(),
    JSON.stringify({
      answers: state.answers,
      index: Object.keys(state.answers).length,
      arm: "collect",
      boutiqueId: state.boutiqueId || null,
      updatedAt: Date.now(),
    }),
  );
}

function currentSlot() {
  return state.session[state.cursor] || null;
}

function answeredInSession() {
  return state.session.filter((slot) => state.answers[slot.item.id] != null && !state.skipped.has(slot.item.id)).length;
}

function regionOfLevel(level) {
  return REGIONS.find((r) => level >= r.range[0] && level <= r.range[1]) || REGIONS[0];
}

function parseEntry() {
  const params = new URLSearchParams(location.search);
  let level = Number(params.get("level")) || 1;
  if (level < 1 || level > TOTAL_LEVELS) level = 1;
  const itemHint = params.get("item");
  const boutiqueId = resolveCollectBoutiqueId();
  const node = getNode(level);
  const itemId = itemHint && LEVEL_ITEM_IDS.includes(itemHint)
    ? itemHint
    : node?.itemId || LEVEL_ITEM_IDS[level - 1];
  return { level, itemId, node, boutiqueId };
}

function buildSession(entry) {
  const region = regionOfLevel(entry.level);
  const slots = [];
  for (let n = entry.level; n <= region.range[1]; n += 1) {
    const itemId = LEVEL_ITEM_IDS[n - 1];
    const meta = state.order.find((m) => m.id === itemId) || state.order[n - 1];
    const item = state.itemsById[itemId];
    if (!meta || !item) continue;
    slots.push({
      level: n,
      item,
      meta,
      node: getNode(n),
    });
  }
  return slots.length ? slots : [{
    level: entry.level,
    item: state.itemsById[entry.itemId],
    meta: state.order.find((m) => m.id === entry.itemId),
    node: entry.node,
  }];
}

function paintBrief() {
  const raw = state.companion || getCompanion("diana");
  const c = localizeCompanion(raw, getLang()) || raw;
  const name = c.nameEn || c.name || "DIANA";
  els.briefName.textContent = name;
  els.briefRole.textContent = c.role || "";
  els.briefBio.textContent = c.description || c.summary || "";
  els.briefStage.src = c.stage || "";
  els.briefPortrait.src = c.portrait || "";
  els.briefPortrait.alt = name;
  const pack = BRIEF_PACK[companionId()] || BRIEF_PACK.diana;
  els.briefFocus.textContent = pickLang(pack.focus);
  els.briefSkills.replaceChildren(
    ...pack.skills.map((skill) => {
      const pair = pickLang(skill);
      const li = document.createElement("li");
      const title = document.createElement("strong");
      title.textContent = pair[0];
      const text = document.createElement("span");
      text.textContent = pair[1];
      li.append(title, text);
      return li;
    }),
  );
}

function paintChrome() {
  const slot = currentSlot();
  if (!slot) return;
  if (state.fashionMode) {
    paintFashionChrome({ state, els, t, answeredInSession });
    return;
  }
  const total = state.session.length;
  const idx = state.cursor + 1;
  const region = regionOfLevel(slot.level);
  const c = localizeCompanion(state.companion, getLang()) || state.companion;
  els.levelBadge.textContent = region.levelId || `L${region.index}`;
  els.progressLabel.textContent = t("journey.qOf", { n: idx, total });
  els.progressFill.style.width = `${Math.round((idx / total) * 100)}%`;
  els.starPair.textContent = `${answeredInSession()}/${total}`;
  els.domainPill.textContent = slot.meta?.domain || slot.item.domain || "";
  els.sceneArt.src = c?.stage || "";
  els.buddySprite.src = c?.portrait || "";
  els.buddySprite.alt = c?.name || "";
  els.quizSpeech.textContent = lineFor(QUIZ_LINE);
}

function isCollectCorrect(itemId, answerValue) {
  const q = AI_QUESTIONS.find((x) => x.id === itemId);
  if (!q) return null;
  if (q.type === "open_triple") {
    if (!answerValue || typeof answerValue !== "object") return false;
    return Object.values(answerValue).every((v) => String(v).trim());
  }
  if (Array.isArray(answerValue)) return null;
  const keys = ["A", "B", "C", "D", "E", "F"];
  const idx = keys.indexOf(answerValue);
  if (idx < 0) return false;
  return isCorrectOption(q, idx);
}

function showDesignReveal(unlock) {
  if (!els.designHost || !unlock) return;
  const label = t(MODULE_LABEL_KEYS[unlock.moduleId] || unlock.moduleId);
  const boutique = getActiveBoutique();
  const shared = unlock.sharedOutfit ? t("town.design.sharedReady") : "";
  els.designHost.innerHTML = `
    <div class="design-reveal is-visible">
      <span class="design-spark" aria-hidden="true"></span>
      <div>
        <strong>${t("town.design.unlocked", { module: label })}</strong>
        <small>${t("town.design.boutique", { name: t(boutique?.nameKey || "town.heading") })}</small>
        ${shared ? `<em>${shared}</em>` : ""}
      </div>
    </div>
  `;
  clearTimeout(showDesignReveal._t);
  showDesignReveal._t = setTimeout(() => {
    els.designHost.innerHTML = "";
  }, 2400);
}

function paintSettle() {
  if (state.fashionMode) {
    paintFashionSettle({ state, els, t, getLang });
    const skipped = state.session.filter((s) => state.skipped.has(s.item.id)).length;
    if (els.settleReviewFt) els.settleReviewFt.hidden = skipped === 0;
    return;
  }
  const answered = answeredInSession();
  const skipped = state.session.filter((s) => state.skipped.has(s.item.id)).length;
  const c = localizeCompanion(state.companion, getLang()) || state.companion;
  els.settleStage.src = c?.stage || "";
  els.settlePortrait.src = c?.portrait || "";
  els.settlePortrait.alt = c?.name || "";
  els.settleSpeech.textContent = lineFor(SETTLE_LINE);
  els.settleTitle.textContent = t("journey.settleTitle");
  els.statAnswered.textContent = String(answered);
  els.statSkipped.textContent = String(skipped);
  els.statStars.textContent = String(answered);
  if (els.statDesigned) {
    els.statDesigned.textContent = String(readSessionDesigned().length);
  }
  els.settleReview.hidden = skipped === 0;
}

function updateNext() {
  const slot = currentSlot();
  if (!slot) {
    if (els.next) els.next.disabled = true;
    if (els.btnSubmit) els.btnSubmit.disabled = true;
    return;
  }
  const { valid } = window.ItemRenderer.collect(slot.item, els.itemRoot);
  if (els.next) els.next.disabled = !valid || state.busy;
  if (els.btnSubmit) els.btnSubmit.disabled = !valid || state.busy;
}

function onAnswerChange() {
  const slot = currentSlot();
  if (!slot) return;
  const { value } = window.ItemRenderer.collect(slot.item, els.itemRoot);
  state.answers[slot.item.id] = value;
  state.skipped.delete(slot.item.id);
  saveLocalAnswers();
  if (state.fashionMode) hideFashionFeedback(els);
  updateNext();
}

function showItem() {
  const slot = currentSlot();
  if (!slot) {
    showSettle();
    return;
  }
  setPhase("quiz");
  els.itemRoot.replaceWith(els.itemRoot.cloneNode(false));
  els.itemRoot = document.getElementById("item-root");
  const saved = state.skipped.has(slot.item.id) ? undefined : state.answers[slot.item.id];
  window.ItemRenderer.render(slot.item, els.itemRoot, saved);
  els.itemRoot.addEventListener("answerchange", onAnswerChange);
  if (state.fashionMode) hideFashionFeedback(els);
  paintChrome();
  updateNext();
  dwell.beginQuestion(slot.item.id, { level: slot.level, levelId: slot.meta?.levelId || null });
  state.startedAt = performance.now();
}

function logCurrent(value, extra = {}) {
  const slot = currentSlot();
  if (!slot || state.logged.has(slot.item.id)) return;
  state.logged.add(slot.item.id);
  const correct = extra.correct ?? null;
  const dwellMs =
    dwell.endQuestion(slot.item.id, {
      skipped: extra.skipped === true,
      correct,
      level: slot.level,
      boutiqueId: getActiveBoutique()?.id || null,
    }) ?? Math.round(performance.now() - state.startedAt);
  return logAnswers([
    {
      game: "collect",
      question_id: slot.item.id,
      level_index: slot.level,
      answer: value,
      correct,
      latency_ms: dwellMs,
      meta: {
        arm: "collect",
        zone: slot.meta?.zone || null,
        levelId: slot.meta?.levelId || null,
        companionId: companionId(),
        boutiqueId: getActiveBoutique()?.id || null,
        dwell_ms: dwellMs,
        ...extra,
      },
    },
  ]);
}

function nextAfterCommit() {
  if (state.reviewing) {
    const idx = state.session.findIndex((s) => state.skipped.has(s.item.id));
    if (idx >= 0) {
      state.cursor = idx;
      showItem();
      return;
    }
    state.reviewing = false;
    showSettle();
    return;
  }
  if (state.cursor < state.session.length - 1) {
    state.cursor += 1;
    showItem();
    return;
  }
  showSettle();
}

function explainForItem(itemId) {
  const q = AI_QUESTIONS.find((x) => x.id === itemId);
  return q?.explain || "";
}

async function submitFashionAnswer() {
  if (state.busy) return;
  const slot = currentSlot();
  if (!slot) return;
  const collected = window.ItemRenderer.collect(slot.item, els.itemRoot);
  if (!collected.valid) return;

  state.busy = true;
  if (els.btnSubmit) {
    els.btnSubmit.disabled = true;
    els.btnSubmit.textContent = t("collect.ft.submitting");
  }
  if (els.btnDraft) els.btnDraft.disabled = true;

  state.answers[slot.item.id] = collected.value;
  state.skipped.delete(slot.item.id);
  saveLocalAnswers();

  const correct = isCollectCorrect(slot.item.id, collected.value);
  await logCurrent(collected.value, { skipped: false, correct });

  if (correct) {
    hideFashionFeedback(els);
    const boutique = getActiveBoutique();
    const unlock = tryUnlockModule(boutique.id, {
      levelId: slot.level,
      challengeId: slot.item.id,
      companionId: companionId(),
    });
    if (unlock) {
      showDesignReveal(unlock);
      paintDesignBoard({ state, els, t });
    }
    try {
      window.Shells.collect.ensure(Object.keys(state.answers).length);
    } catch {
      /* optional */
    }
    state.busy = false;
    resetSubmitButton();
    setTimeout(() => nextAfterCommit(), 700);
    return;
  }

  const explain = explainForItem(slot.item.id);
  showFashionFeedback(
    els,
    explain ? `${t("collect.ft.wrongTitle")} — ${explain}` : t("collect.ft.wrongTitle"),
    { isError: true },
  );
  state.busy = false;
  resetSubmitButton();
  updateNext();
}

function resetSubmitButton() {
  if (!els.btnSubmit) return;
  els.btnSubmit.textContent = t("collect.ft.submit");
  if (els.btnDraft) els.btnDraft.disabled = false;
}

function saveDraftOnly() {
  if (state.busy) return;
  const slot = currentSlot();
  if (!slot) return;
  const collected = window.ItemRenderer.collect(slot.item, els.itemRoot);
  if (collected.value != null) {
    state.answers[slot.item.id] = collected.value;
    saveLocalAnswers();
  }
  showFashionFeedback(els, t("collect.ft.draftSaved"), { isError: false });
}

async function commitAndAdvance({ skip = false } = {}) {
  const slot = currentSlot();
  if (!slot) return;
  const collected = window.ItemRenderer.collect(slot.item, els.itemRoot);
  if (!skip && !collected.valid) return;

  if (skip) {
    state.skipped.add(slot.item.id);
    logCurrent({ skipped: true }, { skipped: true, correct: null });
    void logEvent({
      event_type: "collect.question_skip",
      category: "collect",
      payload: {
        question_id: slot.item.id,
        level: slot.level,
        boutiqueId: state.boutiqueId || getActiveBoutique()?.id || null,
        fashionMode: state.fashionMode,
      },
    });
  } else {
    state.answers[slot.item.id] = collected.value;
    state.skipped.delete(slot.item.id);
    saveLocalAnswers();
    state.logged.delete(slot.item.id);
    const correct = isCollectCorrect(slot.item.id, collected.value);
    logCurrent(collected.value, { skipped: false, correct });
    if (correct && !state.fashionMode) {
      const boutique = getActiveBoutique();
      const unlock = tryUnlockModule(boutique.id, {
        levelId: slot.level,
        challengeId: slot.item.id,
      });
      if (unlock) showDesignReveal(unlock);
    }
    try {
      window.Shells.collect.ensure(Object.keys(state.answers).length);
    } catch {
      /* shell unlock is optional */
    }
  }

  nextAfterCommit();
}

function showSettle() {
  if (state.fashionMode) {
    snapshotSettleDesigned();
    markSettlePending();
    clearSessionDesigned();
    document.body.classList.remove("is-fashion-challenge");
    document.body.classList.add("is-fashion-settle");
    mountFashionSettle({ state, els, t, getLang });
    void logEvent({
      event_type: "fashion.settle_complete",
      category: "fashion",
      payload: {
        boutiqueId: state.boutiqueId || getActiveBoutique()?.id || null,
        designed: (state.settleDesigned || []).length,
        answered: answeredInSession(),
        skipped: state.session.filter((s) => state.skipped.has(s.item.id)).length,
      },
    });
  }
  setPhase("settle");
  paintSettle();
}

function continueToMap() {
  if (state.fashionMode) finalizeSettleSession();
  else clearSettlePending();
  const done = state.session
    .filter((s) => state.answers[s.item.id] != null && !state.skipped.has(s.item.id))
    .map((s) => s.level);
  const q = new URLSearchParams();
  if (done.length) q.set("complete", done.join(","));
  const boutique = state.boutiqueId || getActiveBoutique()?.id;
  if (boutique) q.set("boutique", boutique);
  location.href = `/nuannuan/map${q.toString() ? `?${q}` : ""}`;
}

function reviewSkipped() {
  const idx = state.session.findIndex((s) => state.skipped.has(s.item.id));
  if (idx < 0) {
    showSettle();
    return;
  }
  state.reviewing = true;
  state.cursor = idx;
  showItem();
}

async function boot() {
  state.companion = loadConfirmedCompanion() || loadCompanionDraft() || getCompanion("diana");
  const entry = parseEntry();
  if (entry.boutiqueId) {
    setActiveBoutique(entry.boutiqueId);
    state.boutiqueId = entry.boutiqueId;
    state.fashionMode = isFashionCollectMode();
  }
  void trackPageView({ fashionMode: state.fashionMode });
  mountLobbyExit({
    href: state.boutiqueId
      ? `/nuannuan/map?boutique=${encodeURIComponent(state.boutiqueId)}`
      : "/nuannuan/map",
  });

  const [cfg, seed] = await Promise.all([
    fetch("/assessment_config.json").then((r) => {
      if (!r.ok) throw new Error("assessment_config.json");
      return r.json();
    }),
    fetch("/items.seed.json").then((r) => {
      if (!r.ok) throw new Error("items.seed.json");
      return r.json();
    }),
  ]);

  state.config = cfg;
  seed.items.forEach((it) => {
    state.itemsById[it.id] = it;
  });
  state.order = cfg.levels.flatMap((lv) =>
    lv.items.map((id) => ({ id, levelId: lv.id, zone: lv.zone, domain: lv.domain })),
  );

  const saved = loadLocalAnswers();
  state.answers = saved.answers && typeof saved.answers === "object" ? saved.answers : {};
  state.session = buildSession(entry);
  state.cursor = 0;

  paintBrief();
  applyDom();

  if (state.fashionMode) {
    mountFashionCollect({ state, els, t, getLang });
    const invalid = invalidBoutiqueFromUrl();
    if (invalid) {
      showFashionFeedback(els, t("town.invalidBoutique", { id: invalid }), { isError: false });
    }
    const pending = readSettlePending();
    if (pending?.boutiqueId === state.boutiqueId && sessionResolved()) {
      state.settleDesigned = Array.isArray(pending.designed) ? pending.designed : [];
      document.body.classList.add("is-fashion-settle");
      mountFashionSettle({ state, els, t, getLang });
      setPhase("settle");
      paintSettle();
      return;
    }
    setPhase("quiz");
    showItem();
    return;
  }

  setPhase("brief");
}

els.briefStart.addEventListener("click", () => {
  showItem();
});
els.next?.addEventListener("click", () => commitAndAdvance({ skip: false }));
els.skip?.addEventListener("click", () => commitAndAdvance({ skip: true }));
els.btnSkipFt?.addEventListener("click", () => commitAndAdvance({ skip: true }));
els.btnSubmit?.addEventListener("click", () => {
  if (state.fashionMode) void submitFashionAnswer();
  else void commitAndAdvance({ skip: false });
});
els.btnDraft?.addEventListener("click", saveDraftOnly);
els.settleContinue.addEventListener("click", continueToMap);
els.settleContinueFt?.addEventListener("click", continueToMap);
els.settleWardrobe?.addEventListener("click", () => {
  finalizeSettleSession();
});
els.settleReview.addEventListener("click", (event) => {
  event.preventDefault();
  clearSettlePending();
  reviewSkipped();
});
els.settleReviewFt?.addEventListener("click", (event) => {
  event.preventDefault();
  clearSettlePending();
  document.body.classList.remove("is-fashion-settle");
  document.body.classList.add("is-fashion-challenge");
  if (els.ftSettle) els.ftSettle.hidden = true;
  reviewSkipped();
});

document.addEventListener("keydown", (event) => {
  if (els.quiz.hidden || state.busy) return;
  const key = event.key.toUpperCase();
  if (["A", "B", "C", "D", "E", "F"].includes(key)) {
    const btn = els.itemRoot?.querySelector(`.opt-btn[data-key="${key}"]`);
    if (btn) {
      event.preventDefault();
      btn.click();
    }
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    if (state.fashionMode) void submitFashionAnswer();
    else void commitAndAdvance({ skip: false });
  }
});

boot().catch((err) => {
  console.error(err);
  els.bootError.hidden = false;
  els.bootError.textContent = t("journey.bootError");
  setPhase("brief");
  els.brief.hidden = true;
});
