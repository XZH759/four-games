/**
 * collect 臂 · 角色登录旅程答题页
 * 题层：items.seed.json（ailit_assessment 原文）+ ItemRenderer
 * 壳层：Shells.collect（每 2 题解锁配件；提交即推进、与对错无关）
 * 入口：/collect?level=1..15&item=E-1-Q1&arm=collect
 */
import {
  getNode,
  TOTAL_LEVELS,
  LEVEL_ITEM_IDS,
} from "/js/nuannuan/map-config.js";
import {
  loadConfirmedCompanion,
  loadCompanionDraft,
} from "/js/nuannuan/companion-config.js";
import { mountLobbyExit } from "/js/lobby-exit.js";

mountLobbyExit();

const PROGRESS_KEY = "ailit_progress_collect";

const els = {
  bootError: document.getElementById("boot-error"),
  assess: document.getElementById("assess"),
  shellBar: document.getElementById("shell-bar"),
  itemRoot: document.getElementById("item-root"),
  betweenHost: document.getElementById("between-host"),
  submit: document.getElementById("btn-submit"),
  exit: document.getElementById("btn-exit"),
  end: document.getElementById("end-screen"),
  endSummary: document.getElementById("end-summary"),
  backMap: document.getElementById("btn-back-map"),
  levelChip: document.getElementById("level-chip"),
  assessMeta: document.getElementById("assess-meta"),
  companionRail: document.getElementById("companion-rail"),
  companionPortrait: document.getElementById("companion-portrait"),
  companionEncourage: document.getElementById("companion-encourage"),
};

const state = {
  config: null,
  itemsById: {},
  order: [],
  /** global index in 15-item assessment order (0-based) */
  index: 0,
  answers: {},
  levelId: 1,
  node: null,
  item: null,
  meta: null,
};

function parseEntry() {
  const params = new URLSearchParams(location.search);
  let level = Number(params.get("level")) || 1;
  if (level < 1 || level > TOTAL_LEVELS) level = 1;
  const itemHint = params.get("item");
  const node = getNode(level);
  const itemId = itemHint && LEVEL_ITEM_IDS.includes(itemHint)
    ? itemHint
    : node?.itemId || LEVEL_ITEM_IDS[level - 1];
  return { level, itemId, node };
}

function loadLocalAnswers() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveLocalAnswers() {
  localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify({
      answers: state.answers,
      index: Object.keys(state.answers).length,
      arm: "collect",
      updatedAt: Date.now(),
    }),
  );
}

function answeredCount() {
  return Object.keys(state.answers).length;
}

function ctxForShell() {
  const meta = state.meta;
  const levelItems = state.config.levels.find((l) => l.id === meta.levelId)?.items || [];
  const posInLevel = levelItems.indexOf(meta.id) + 1;
  return {
    index: answeredCount(),
    total: state.order.length,
    levelId: meta.levelId,
    zone: meta.zone,
    domain: meta.domain,
    levelProgress: Math.max(1, posInLevel),
    justClearedLevel: false,
  };
}

function mountShell() {
  const shell = window.Shells.collect;
  shell.mount(els.shellBar, ctxForShell());
}

function hydrateCompanion() {
  const companion = loadConfirmedCompanion() || loadCompanionDraft();
  if (!companion) return;
  els.companionRail.hidden = false;
  if (companion.portrait) {
    els.companionPortrait.src = companion.portrait;
    els.companionPortrait.alt = companion.name || "学习伙伴";
  }
  els.companionEncourage.textContent =
    companion.encourage
    || companion.intro
    || "我在旁边陪你。慢慢想，提交就能继续前进。";
}

function updateSubmit() {
  const { valid } = window.ItemRenderer.collect(state.item, els.itemRoot);
  els.submit.disabled = !valid;
}

function onAnswerChange() {
  const { value } = window.ItemRenderer.collect(state.item, els.itemRoot);
  state.answers[state.item.id] = value;
  saveLocalAnswers();
  updateSubmit();
}

function showItem() {
  els.end.hidden = true;
  els.assess.hidden = false;
  mountShell();
  const saved = state.answers[state.item.id];
  window.ItemRenderer.render(state.item, els.itemRoot, saved);
  els.itemRoot.addEventListener("answerchange", onAnswerChange);
  updateSubmit();
  els.assessMeta.textContent = `${state.meta.zone} · ${state.item.id} · 第 ${state.levelId}/${TOTAL_LEVELS} 关`;
  els.levelChip.textContent = `${state.meta.levelId} · ${state.item.domain}`;
}

async function submit() {
  const { value, valid } = window.ItemRenderer.collect(state.item, els.itemRoot);
  if (!valid) return;
  state.answers[state.item.id] = value;
  saveLocalAnswers();
  els.itemRoot.removeEventListener("answerchange", onAnswerChange);

  const shell = window.Shells.collect;
  const betweenCtx = {
    index: answeredCount(),
    total: state.order.length,
    justClearedLevel: false,
    zone: state.meta.zone,
    levelId: state.meta.levelId,
  };
  // force unlock check after this answer is stored
  shell.ensure(answeredCount());
  const maybe = shell.between?.(els.betweenHost, betweenCtx);
  if (maybe && typeof maybe.then === "function") await maybe;

  finishLevel();
}

function finishLevel() {
  els.assess.hidden = true;
  els.end.hidden = false;
  const label = state.node?.title || `第 ${state.levelId} 关`;
  els.endSummary.textContent = `「${label}」已提交（${state.item.id}）。地图进度将更新。`;
  const back = `/nuannuan/map?complete=${state.levelId}`;
  els.backMap.href = back;
  // auto-return shortly so journey feels continuous
  setTimeout(() => {
    location.href = back;
  }, 1200);
}

function exitToMap() {
  saveLocalAnswers();
  location.href = "/nuannuan/map";
}

async function boot() {
  const entry = parseEntry();
  state.levelId = entry.level;
  state.node = entry.node;

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

  const meta = state.order.find((m) => m.id === entry.itemId) || state.order[entry.level - 1];
  if (!meta) throw new Error(`missing meta for ${entry.itemId}`);
  const item = state.itemsById[meta.id];
  if (!item) throw new Error(`missing item ${meta.id}`);

  state.meta = meta;
  state.item = item;
  state.index = state.order.findIndex((m) => m.id === meta.id);

  const saved = loadLocalAnswers();
  state.answers = saved.answers && typeof saved.answers === "object" ? saved.answers : {};

  hydrateCompanion();
  showItem();
}

els.submit.addEventListener("click", () => submit());
els.exit.addEventListener("click", () => exitToMap());

boot().catch((err) => {
  console.error(err);
  els.bootError.hidden = false;
  els.bootError.textContent =
    "无法加载测评题库。请用本地服务器打开本站（如 npx serve），并确认 assessment_config.json / items.seed.json 可访问。";
  els.assess.hidden = true;
});
