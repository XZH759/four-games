import { AI_QUESTIONS, isCorrectOption, localizeQuestion } from "/monopoly/questions.js";
import { initI18n, onLangChange, applyDom, getLang, t } from "/js/i18n.js";
import { mountLobbyExit } from "/js/lobby-exit.js";

initI18n({ toggleHost: "#lang-host" });
onLangChange(() => {
  applyDom();
  renderBoard();
  renderStatus();
  paintBoardTips();
  paintLobbyDefaults();
  if (activeQuestion) paintQuestionUi();
});
mountLobbyExit();

const SAVE_KEY = "ai_monopoly_v3";
const START_MONEY = 1500;
const PASS_START_REWARD = 200;
const CORRECT_REWARD = 300;
const WRONG_PENALTY = 150;
const WIN_MONEY = 4000;

/* Soft clay pastel groups — aligned to mock property cards */
const GROUP = {
  brown: "#c9a882",
  teal: "#7ecfc0",
  cyan: "#5eb8d8",
  violet: "#b898e8",
  pink: "#f0a0b8",
  orange: "#f0a06a",
  coral: "#e88878",
  yellow: "#e8c860",
  green: "#6ec89a",
  blue: "#6aa8e0",
};

const TILE_ART_BASE = "/assets/monopoly/clay/icons";

/** Canonical board tile art — keyed by tile ID (never array position). */
const tileAssets = {
  verificationAve: `${TILE_ART_BASE}/verification-ave.png`,
  sourceStreet: `${TILE_ART_BASE}/source-street.png`,
  factPlaza: `${TILE_ART_BASE}/fact-plaza.png`,
  dataHub: `${TILE_ART_BASE}/data-hub.png`,
  lowCarbonStreet: `${TILE_ART_BASE}/low-carbon-street.png`,
  greenDataCenter: `${TILE_ART_BASE}/green-data-center.png`,
  sustainabilityPlaza: `${TILE_ART_BASE}/sustainability-plaza.png`,
  promptLane: `${TILE_ART_BASE}/prompt-lane.png`,
  modelAvenue: `${TILE_ART_BASE}/model-avenue.png`,
  computeStreet: `${TILE_ART_BASE}/compute-street.png`,
  dataPath: `${TILE_ART_BASE}/data-path.png`,
  creativityPlaza: `${TILE_ART_BASE}/creativity-plaza.png`,
  start: `${TILE_ART_BASE}/start.png`,
  aiKnowledgeCard: `${TILE_ART_BASE}/ai-knowledge.png`,
  freeRestStop: `${TILE_ART_BASE}/free-rest.png`,
  frontierMonitor: `${TILE_ART_BASE}/frontier-monitor.png`,
  equipmentMaintenance: `${TILE_ART_BASE}/equipment-maintenance.png`,
  upgradeSystem: `${TILE_ART_BASE}/upgrade-system.png`,
  aiDataCard: `${TILE_ART_BASE}/ai-data.png`,
  aiQuestion: `${TILE_ART_BASE}/ai-question.png`,
};

function tileArtUrl(assetId) {
  return assetId && tileAssets[assetId] ? tileAssets[assetId] : null;
}

function cellFallbackIcon(cell) {
  if (cell.type === "question") return cell.variant === "data" ? "📊" : "?";
  if (cell.icon) return cell.icon;
  if (cell.type === "start") return "🚀";
  if (cell.type === "tax") return "🔧";
  if (cell.type === "parking") return "☕";
  if (cell.type === "jail" || cell.type === "gojail") return "🔭";
  if (cell.type === "station" || cell.type === "utility") return "🏢";
  return "🏠";
}

const CELLS = [
  { type: "start", name: "起点", nameEn: "START", icon: "🚀", assetId: "start" },
  { type: "property", name: "资料小径", nameEn: "Data Path", price: 60, rent: 12, group: "teal", color: GROUP.teal, assetId: "dataPath" },
  { type: "question", name: "AI 知识卡", nameEn: "AI Knowledge Card", icon: "?", variant: "knowledge", assetId: "aiKnowledgeCard" },
  { type: "property", name: "运算街", nameEn: "Compute Street", price: 60, rent: 14, group: "brown", color: GROUP.brown, assetId: "computeStreet" },
  { type: "tax", name: "设备维护", nameEn: "Equipment Maintenance", amount: 100, assetId: "equipmentMaintenance" },
  { type: "station", name: "数据枢纽", nameEn: "Data Hub", price: 200, rent: 50, color: "#5aa8e0", assetId: "dataHub" },
  { type: "property", name: "模型大道", nameEn: "Model Avenue", price: 100, rent: 20, group: "cyan", color: GROUP.cyan, assetId: "modelAvenue" },
  { type: "question", name: "AI 数据卡", nameEn: "AI Data Card", icon: "📊", variant: "data", assetId: "aiDataCard" },
  { type: "property", name: "提示词路", nameEn: "Prompt Lane", price: 100, rent: 22, group: "violet", color: GROUP.violet, assetId: "promptLane" },
  { type: "property", name: "创意广场", nameEn: "Creativity Plaza", price: 120, rent: 26, group: "pink", color: GROUP.pink, assetId: "creativityPlaza" },
  { type: "jail", name: "升级系统", nameEn: "Upgrade System", assetId: "upgradeSystem", priceTag: "$150", tagTone: "up" },
  { type: "property", name: "隐私花园", nameEn: "Privacy Garden", price: 140, rent: 30, group: "pink", color: GROUP.pink, assetId: "promptLane" },
  { type: "utility", name: "算力中心", nameEn: "Compute Hub", price: 150, rent: 60, color: "#6ec89a", assetId: "computeStreet" },
  { type: "question", name: "AI 问答", nameEn: "AI Question", icon: "?", variant: "quiz", assetId: "aiQuestion" },
  { type: "property", name: "原创大道", nameEn: "Original Ave", price: 160, rent: 36, group: "pink", color: GROUP.pink, assetId: "creativityPlaza" },
  { type: "station", name: "数据枢纽", nameEn: "Data Hub", price: 200, rent: 50, color: "#5aa8e0", assetId: "dataHub" },
  { type: "property", name: "公平社区", nameEn: "Fairness District", price: 180, rent: 40, group: "orange", color: GROUP.orange, assetId: "verificationAve" },
  { type: "question", name: "AI 知识卡", nameEn: "AI Knowledge Card", icon: "?", variant: "knowledge", assetId: "aiKnowledgeCard" },
  { type: "property", name: "多元大街", nameEn: "Diversity Ave", price: 180, rent: 42, group: "orange", color: GROUP.orange, assetId: "factPlaza" },
  { type: "property", name: "核对广场", nameEn: "Factor Check Plaza", price: 200, rent: 46, group: "orange", color: GROUP.orange, assetId: "factPlaza" },
  { type: "parking", name: "自由休息站", nameEn: "Free Rest Stop", assetId: "freeRestStop" },
  { type: "property", name: "核实大道", nameEn: "Verification Ave", price: 220, rent: 50, group: "coral", color: GROUP.coral, assetId: "verificationAve" },
  { type: "question", name: "AI 数据卡", nameEn: "AI Data Card", icon: "📊", variant: "data", assetId: "aiDataCard" },
  { type: "property", name: "来源街", nameEn: "Source Street", price: 220, rent: 52, group: "coral", color: GROUP.coral, assetId: "sourceStreet" },
  { type: "property", name: "事实广场", nameEn: "Fact Plaza", price: 240, rent: 58, group: "coral", color: GROUP.coral, assetId: "factPlaza" },
  { type: "station", name: "数据枢纽", nameEn: "Data Hub", price: 200, rent: 50, color: "#5aa8e0", assetId: "dataHub" },
  { type: "property", name: "低碳街", nameEn: "Low-Carbon Street", price: 260, rent: 62, group: "yellow", color: GROUP.yellow, assetId: "lowCarbonStreet" },
  { type: "question", name: "AI 问答", nameEn: "AI Question", icon: "?", variant: "quiz", assetId: "aiQuestion" },
  { type: "utility", name: "绿色机房", nameEn: "Green Data Center", price: 150, rent: 60, color: "#6ec89a", assetId: "greenDataCenter" },
  { type: "property", name: "永续广场", nameEn: "Sustainability Plaza", price: 280, rent: 70, group: "green", color: GROUP.green, assetId: "sustainabilityPlaza" },
  { type: "gojail", name: "前沿监测", nameEn: "Frontier Monitor", assetId: "frontierMonitor" },
  { type: "property", name: "透明街", nameEn: "Transparency St", price: 300, rent: 76, group: "green", color: GROUP.green, assetId: "modelAvenue" },
  { type: "property", name: "解释大道", nameEn: "Explain Ave", price: 300, rent: 78, group: "green", color: GROUP.green, assetId: "creativityPlaza" },
  { type: "question", name: "AI 知识卡", nameEn: "AI Knowledge Card", icon: "?", variant: "knowledge", assetId: "aiKnowledgeCard" },
  { type: "property", name: "责任广场", nameEn: "Accountability Plaza", price: 320, rent: 84, group: "green", color: GROUP.green, assetId: "verificationAve" },
  { type: "station", name: "数据枢纽", nameEn: "Data Hub", price: 200, rent: 50, color: "#5aa8e0", assetId: "dataHub" },
  { type: "question", name: "AI 数据卡", nameEn: "AI Data Card", icon: "📊", variant: "data", assetId: "aiDataCard" },
  { type: "property", name: "智慧云端", nameEn: "Smart Cloud", price: 350, rent: 92, group: "blue", color: GROUP.blue, assetId: "dataHub" },
  { type: "tax", name: "设备维护", nameEn: "Equipment Maintenance", amount: 150, assetId: "equipmentMaintenance" },
  { type: "property", name: "可信 AI 城", nameEn: "Trusted AI City", price: 400, rent: 110, group: "blue", color: GROUP.blue, assetId: "verificationAve" },
];

function isEn() {
  return getLang() === "en";
}

function cellLabel(cell) {
  return isEn() && cell.nameEn ? cell.nameEn : cell.name;
}

const DIE_PIPS = "<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>";

function setDieFace(el, value) {
  if (!el) return;
  const n = Number(value);
  if (!n || n < 1 || n > 6) {
    el.dataset.face = "0";
    el.textContent = "–";
    return;
  }
  el.dataset.face = String(n);
  el.innerHTML = DIE_PIPS;
}

const els = {
  board: document.getElementById("board"),
  playerCard: document.getElementById("player-card"),
  botCard: document.getElementById("bot-card"),
  playerName: document.getElementById("player-name"),
  opponentName: document.getElementById("opponent-name"),
  playerMoney: document.getElementById("player-money"),
  botMoney: document.getElementById("bot-money"),
  playerProperties: document.getElementById("player-properties"),
  botProperties: document.getElementById("bot-properties"),
  playerStatus: document.getElementById("player-status"),
  botStatus: document.getElementById("bot-status"),
  round: document.getElementById("round-number"),
  turnLabel: document.getElementById("turn-label"),
  dieOne: document.getElementById("die-one"),
  dieTwo: document.getElementById("die-two"),
  roll: document.getElementById("roll-button"),
  buy: document.getElementById("buy-button"),
  end: document.getElementById("end-button"),
  centerMessage: document.getElementById("center-message"),
  ownedList: document.getElementById("owned-list"),
  assetTitle: document.getElementById("asset-title"),
  log: document.getElementById("game-log"),
  questionModal: document.getElementById("question-modal"),
  questionDomain: document.getElementById("question-domain"),
  questionTitle: document.getElementById("question-title"),
  questionStakes: document.querySelector(".question-stakes"),
  questionStem: document.getElementById("question-stem"),
  answerList: document.getElementById("answer-list"),
  answerFeedback: document.getElementById("answer-feedback"),
  questionContinue: document.getElementById("question-continue"),
  rulesModal: document.getElementById("rules-modal"),
  lobbyModal: document.getElementById("lobby-modal"),
  gameoverModal: document.getElementById("gameover-modal"),
  gameoverIcon: document.getElementById("gameover-icon"),
  gameoverTitle: document.getElementById("gameover-title"),
  gameoverText: document.getElementById("gameover-text"),
};

function freshState(mode = "ai", playerOne = "玩家一", playerTwo = "玩家二") {
  return {
    players: [
      { name: playerOne, position: 0, money: START_MONEY, properties: [], jailTurns: 0 },
      {
        name: mode === "pvp" ? playerTwo : "AI 对手",
        position: 0,
        money: START_MONEY,
        properties: [],
        jailTurns: 0,
      },
    ],
    mode,
    ownership: {},
    turn: 0,
    round: 1,
    pot: 0,
    phase: "ready",
    pendingPurchase: null,
    currentRoll: 0,
    extraTurn: false,
    questionOrder: shuffle(AI_QUESTIONS.map((_, index) => index)),
    questionCursor: 0,
    log: [{ id: "start", playerIndex: 0 }],
    gameOver: false,
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (
      saved &&
      Array.isArray(saved.players) &&
      saved.players.length === 2 &&
      !saved.gameOver
    ) {
      saved.mode = saved.mode === "pvp" ? "pvp" : "ai";
      saved.players[0].name ||= "玩家一";
      saved.players[1].name = saved.mode === "pvp"
        ? (saved.players[1].name || "玩家二")
        : "AI 对手";
      saved.phase = saved.mode === "pvp" ? "ready" : saved.turn === 0 ? "ready" : "bot";
      saved.pendingPurchase = null;
      saved.log = normalizeLog(saved.log);
      return saved;
    }
  } catch {
    // 使用新游戏状态
  }
  return freshState();
}

function normalizeLog(log) {
  if (!Array.isArray(log)) return [];
  return log.map((entry) => {
    if (entry == null) return { id: "noop" };
    if (typeof entry === "string") return { id: "legacy", zh: entry, en: entry };
    if (entry.id) return entry;
    return {
      id: "legacy",
      zh: entry.zh || entry.en || "",
      en: entry.en || entry.zh || "",
    };
  });
}

const hadSavedGame = Boolean(localStorage.getItem(SAVE_KEY));
let state = loadState();
let activeQuestion = null;

function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function wait(ms) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return new Promise((resolve) => setTimeout(resolve, reduced ? 0 : ms));
}

function displayPlayerName(playerIndex) {
  const player = state.players[playerIndex];
  if (!player) return "";
  if (playerIndex === 0) {
    if (player.name === "玩家一" || player.name === "YOU") {
      return isEn() ? "YOU" : "玩家一";
    }
    return player.name;
  }
  if (state.mode === "ai" && (player.name === "AI 对手" || player.name === "AI OPPONENT")) {
    return isEn() ? "AI OPPONENT" : "AI 对手";
  }
  return player.name;
}

function isHumanPlayer(playerIndex) {
  return playerIndex === 0 || state.mode === "pvp";
}

function cellPosition(index) {
  if (index === 0) return { row: 11, col: 11 };
  if (index < 10) return { row: 11, col: 11 - index };
  if (index === 10) return { row: 11, col: 1 };
  if (index < 20) return { row: 21 - index, col: 1 };
  if (index === 20) return { row: 1, col: 1 };
  if (index < 30) return { row: 1, col: index - 19 };
  if (index === 30) return { row: 1, col: 11 };
  return { row: index - 29, col: 11 };
}

function cellClass(cell, index) {
  const classes = ["board-cell", cell.type];
  if (["start", "jail", "parking", "gojail"].includes(cell.type)) classes.push("corner", "special");
  if (cell.variant) classes.push(`variant-${cell.variant}`);
  if (index > 0 && index < 10) classes.push("side-bottom");
  if (index > 10 && index < 20) classes.push("side-left");
  if (index > 20 && index < 30) classes.push("side-top");
  if (index > 30) classes.push("side-right");
  return classes.join(" ");
}

function cellTone(cell) {
  if (cell.type === "question") return cell.variant === "data" ? "aqua" : "lavender";
  if (cell.type === "station") return "aqua";
  if (cell.type === "tax" || cell.type === "parking" || cell.type === "jail") return "sand";
  if (cell.type === "start") return "mint";
  if (cell.type === "gojail") return "aqua";
  if (cell.type === "utility") {
    return /green|永续|绿色/i.test(`${cell.name} ${cell.nameEn || ""}`) ? "mint" : "aqua";
  }
  if (cell.type === "property") {
    if (["green", "yellow"].includes(cell.group)) return "mint";
    if (["teal", "cyan", "blue"].includes(cell.group)) return "aqua";
    if (cell.group === "brown") return "sand";
    return "coral";
  }
  return "coral";
}

function renderCellArt(cell) {
  const src = tileArtUrl(cell.assetId);
  const fallback = cellFallbackIcon(cell);
  if (!src) {
    return cell.type === "question"
      ? `<span class="cell-art-fallback is-visible q-mark" aria-hidden="true">${fallback}</span>`
      : `<span class="cell-art-fallback is-visible cell-icon" aria-hidden="true">${fallback}</span>`;
  }
  return `
    <span class="cell-art-frame">
      <img class="cell-art" src="${src}" alt="" draggable="false" loading="eager" decoding="async" />
      <span class="cell-art-fallback${cell.type === "question" ? " q-mark" : ""}" aria-hidden="true">${fallback}</span>
    </span>`;
}

function bindCellArtFallback(node) {
  const img = node.querySelector(".cell-art");
  if (!img) return;
  const showFallback = () => {
    img.classList.add("is-failed");
    const fallback = img.parentElement?.querySelector(".cell-art-fallback");
    if (fallback) fallback.classList.add("is-visible");
  };
  if (img.complete && img.naturalWidth === 0) {
    showFallback();
    return;
  }
  img.addEventListener("error", showFallback, { once: true });
}

function renderBoard() {
  els.board.querySelectorAll(".board-cell").forEach((cell) => cell.remove());
  CELLS.forEach((cell, index) => {
    const node = document.createElement("div");
    const position = cellPosition(index);
    const label = cellLabel(cell);
    const tone = cellTone(cell);
    const hasArt = Boolean(tileArtUrl(cell.assetId));
    node.className = `${cellClass(cell, index)} tone-${tone}`;
    if (hasArt) node.classList.add("has-art");
    node.dataset.index = String(index);
    if (cell.assetId) node.dataset.assetId = cell.assetId;
    node.style.gridRow = String(position.row);
    node.style.gridColumn = String(position.col);
    if (cell.color) node.style.setProperty("--cell-color", cell.color);

    const price = cell.price
      ? `$${cell.price}`
      : cell.amount
        ? `−$${cell.amount}`
        : cell.priceTag || "";
    const priceClass = [
      "cell-price",
      cell.amount ? "is-fee" : "",
      cell.tagTone === "up" ? "is-bonus" : "",
    ].filter(Boolean).join(" ");

    const colorBar = cell.color
      ? `<span class="color-bar" style="background:${cell.color}" aria-hidden="true"></span>`
      : "";

    node.innerHTML = `
      ${colorBar}
      <span class="cell-stage">${renderCellArt(cell)}</span>
      <span class="cell-foot">
        <span class="cell-name">${label}</span>
        ${price ? `<span class="${priceClass}">${price}</span>` : ""}
      </span>
      <span class="tokens"></span>`;

    bindCellArtFallback(node);

    if (cell.type === "station" && !cell.color) node.style.setProperty("--cell-color", "var(--aqua)");
    if (cell.type === "tax") node.style.setProperty("--cell-color", "#d4b896");
    if (cell.type === "utility" && !cell.color) node.style.setProperty("--cell-color", "var(--mint)");
    if (cell.type === "jail") node.style.setProperty("--cell-color", "#d8c4a0");
    node.title = cell.price
      ? `${label} · $${cell.price} · $${cell.rent}`
      : label;
    els.board.appendChild(node);
  });
}

function renderTokens() {
  document.querySelectorAll(".tokens").forEach((host) => { host.innerHTML = ""; });
  state.players.forEach((player, index) => {
    const host = document.querySelector(`.board-cell[data-index="${player.position}"] .tokens`);
    if (!host) return;
    const piece = document.createElement("span");
    piece.className = `piece ${index === 0 ? "player" : "bot"}`;
    piece.textContent = index === 0 ? "🤖" : "🧠";
    piece.setAttribute("aria-label", `${player.name} @ ${cellLabel(CELLS[player.position])}`);
    host.appendChild(piece);
  });
}

function renderOwnership() {
  const selectedIndex = state.pendingPurchase;
  document.querySelectorAll(".board-cell").forEach((node) => {
    const index = Number(node.dataset.index);
    const owner = state.ownership[node.dataset.index];
    node.classList.toggle("is-owned", owner !== undefined);
    node.classList.toggle("is-selected", selectedIndex !== null && selectedIndex === index);
    if (owner !== undefined) {
      node.style.setProperty("--owner-color", owner === 0 ? "#5aa8e0" : "#9f7ae8");
    } else {
      node.style.removeProperty("--owner-color");
    }
  });
}

function renderStatus() {
  const [player, bot] = state.players;
  const humanTurn = isHumanPlayer(state.turn);
  els.playerName.textContent = displayPlayerName(0);
  els.opponentName.textContent = displayPlayerName(1);
  els.playerMoney.textContent = `$${player.money.toLocaleString()}`;
  els.botMoney.textContent = `$${bot.money.toLocaleString()}`;
  els.playerMoney.classList.toggle("is-danger", player.money < 300);
  els.botMoney.classList.toggle("is-danger", bot.money < 300);
  els.playerProperties.textContent = String(player.properties.length);
  els.botProperties.textContent = String(bot.properties.length);
  els.round.textContent = String(state.round);
  els.playerCard.classList.toggle("is-active", state.turn === 0 && !state.gameOver);
  els.botCard.classList.toggle("is-active", state.turn === 1 && !state.gameOver);
  els.playerStatus.textContent = state.players[0].jailTurns
    ? (isEn() ? "Jail" : "监测")
    : state.turn === 0
      ? (isEn() ? "Turn" : "回合")
      : (isEn() ? "Wait" : "等待");
  els.botStatus.textContent = state.players[1].jailTurns
    ? (isEn() ? "Jail" : "监测")
    : state.turn === 1
      ? (state.mode === "pvp"
        ? (isEn() ? "Turn" : "回合")
        : (isEn() ? "AI" : "行动"))
      : (isEn() ? "Wait" : "等待");
  els.turnLabel.textContent = humanTurn
    ? (isEn() ? "Roll the dice" : "请掷骰子")
    : (isEn() ? "AI is moving…" : "AI 行动中");

  const canRoll = humanTurn && state.phase === "ready" && !state.gameOver;
  els.roll.disabled = !canRoll;
  els.roll.hidden = !humanTurn || ["landed", "question"].includes(state.phase);
  els.buy.hidden = state.pendingPurchase === null || !humanTurn;
  els.end.hidden = !humanTurn || state.phase !== "landed";

  if (state.pendingPurchase !== null) {
    const cell = CELLS[state.pendingPurchase];
    els.buy.textContent = isEn()
      ? `Buy ${cellLabel(cell)} ($${cell.price})`
      : `购买 ${cellLabel(cell)}（$${cell.price}）`;
  }

  if (state.log.length) {
    els.centerMessage.textContent = formatLogEntry(state.log[0]);
  } else {
    els.centerMessage.textContent = t("monopoly.startHint");
  }

  paintBoardTips();
  renderOwnedList(state.mode === "pvp" ? state.turn : 0);
  renderLog();
  renderTokens();
  renderOwnership();
}

function paintBoardTips() {
  const hint = document.querySelector(".board-hint");
  if (hint) hint.textContent = t("monopoly.boardHint");
  const ok = document.querySelector(".reward-rule .ok span");
  const bad = document.querySelector(".reward-rule .bad span");
  if (ok) ok.textContent = t("monopoly.correctLabel");
  if (bad) bad.textContent = t("monopoly.wrongLabel");
  if (els.questionTitle) els.questionTitle.textContent = t("monopoly.qTitle");
  if (els.questionStakes) els.questionStakes.textContent = t("monopoly.qStakes", {
    ok: CORRECT_REWARD,
    bad: WRONG_PENALTY,
  });
  if (els.questionContinue && (!activeQuestion || !activeQuestion.answered)) {
    els.questionContinue.textContent = t("monopoly.qContinue");
  }
}

function renderOwnedList(playerIndex = 0) {
  const owner = state.players[playerIndex];
  const properties = owner.properties;
  els.assetTitle.textContent = state.mode === "pvp"
    ? (isEn() ? `${owner.name}'s assets` : `${owner.name}的资产`)
    : (isEn() ? "My Assets" : "我的资产");
  if (!properties.length) {
    els.ownedList.innerHTML = `<p class="owned-empty">${isEn() ? "No properties owned" : "尚未购买地产"}</p>`;
    return;
  }
  els.ownedList.innerHTML = properties
    .map((index) => {
      const cell = CELLS[index];
      const color = cell.color || "#5aa8e0";
      return `
        <div class="owned-item">
          <span class="owned-color" style="background:${color}" aria-hidden="true"></span>
          <span class="owned-name">${cellLabel(cell)}</span>
          <strong class="owned-rent">$${cell.rent}</strong>
        </div>`;
    })
    .join("");
}

function renderLog() {
  // state.log is newest-first; display oldest→newest so the latest sits at the bottom.
  const entries = state.log.slice(0, 30).slice().reverse();
  els.log.innerHTML = entries
    .map((entry) => `<li>${formatLogEntry(entry)}</li>`)
    .join("");
  els.log.scrollTop = els.log.scrollHeight;
}

function logName(playerIndex) {
  const player = state.players[playerIndex];
  if (!player) return { zh: "", en: "" };
  if (playerIndex === 0 && (player.name === "玩家一" || player.name === "YOU")) {
    return { zh: "玩家一", en: "YOU" };
  }
  if (state.mode === "ai" && playerIndex === 1) {
    return { zh: "AI 对手", en: "AI Opponent" };
  }
  return { zh: player.name, en: player.name };
}

function formatPlayerName(playerIndex) {
  return isEn() ? logName(playerIndex).en : logName(playerIndex).zh;
}

function formatCellName(cellOrIndex) {
  const cell = typeof cellOrIndex === "number" ? CELLS[cellOrIndex] : cellOrIndex;
  if (!cell) return "";
  return isEn() ? (cell.nameEn || cell.name) : cell.name;
}

function formatLogEntry(entry) {
  if (entry == null) return "";
  if (typeof entry === "string") return entry;

  // Legacy bilingual blobs from older saves
  if (entry.id === "legacy" || (!entry.id && (entry.zh || entry.en))) {
    return isEn() ? (entry.en || entry.zh || "") : (entry.zh || entry.en || "");
  }

  const n = (idx = entry.playerIndex) => formatPlayerName(idx);
  const cell = () => formatCellName(entry.cellIndex);
  const amount = entry.amount;
  const en = isEn();

  switch (entry.id) {
    case "noop":
      return "";
    case "start":
      return en
        ? `Game start: ${n(0)} goes first.`
        : `游戏开始：${n(0)}先行动。`;
    case "joinAi":
      return en
        ? `${n(0)} joined and will play against AI Opponent.`
        : `${n(0)}加入游戏，将与 AI 对手对战。`;
    case "joinPvp":
      return en
        ? `${n(1)} joined. ${n(0)} goes first.`
        : `${n(1)}已加入游戏，${n(0)}先行动。`;
    case "roll":
      return en
        ? `${n()} rolled ${entry.d1} + ${entry.d2} and moved ${entry.total} spaces.`
        : `${n()}掷出 ${entry.d1} + ${entry.d2}，前进 ${entry.total} 格。`;
    case "land":
      return en
        ? `${n()} landed on ${cell()}.`
        : `${n()}停在“${cell()}”。`;
    case "passStart":
      return en
        ? `${n()} passed START and collected $${amount}.`
        : `${n()}经过起点，获得 $${amount}。`;
    case "tax":
      return en
        ? `${n()} paid $${amount} for ${cell()}.`
        : `${n()}支付“${cell()}” $${amount}。`;
    case "rent":
      return en
        ? `${n(entry.playerIndex)} paid $${amount} rent to ${n(entry.ownerIndex)}.`
        : `${n(entry.playerIndex)}向${n(entry.ownerIndex)}支付租金 $${amount}。`;
    case "buy":
      return en
        ? `${n()} bought ${cell()} for $${amount}.`
        : `${n()}以 $${amount} 购买了“${cell()}”。`;
    case "skipBuy":
      return en
        ? `AI Opponent kept cash and skipped buying ${cell()}.`
        : `AI 对手保留现金，没有购买“${cell()}”。`;
    case "cantBuy":
      return en
        ? "Not enough cash to buy this property."
        : "现金不足，无法购买这块地产。";
    case "pot":
      return en
        ? `${n()} collected $${amount} from Free Rest Stop.`
        : `${n()}在自由休息站获得公共奖金 $${amount}。`;
    case "potEmpty":
      return en
        ? "Free Rest Stop is quiet — no pot this time."
        : "自由休息站很安静，本次没有公共奖金。";
    case "goJail":
      return en
        ? `${n()} was sent to the monitor zone and will skip one turn.`
        : `${n()}被送往监测区，将暂停一回合。`;
    case "stayJail":
      return en
        ? `${n()} stays in the monitor zone this turn.`
        : `${n()}本回合留在监测区。`;
    case "doubles":
      return en
        ? `${n()} rolled doubles and gets another turn.`
        : `${n()}掷出双骰，再行动一次。`;
    case "quizOk":
      return en
        ? `${n()} answered an AI literacy question correctly (+$${amount}).`
        : `${n()}答对了 AI 素养题，获得 $${amount}。`;
    case "quizBad":
      return en
        ? `${n()} missed an AI literacy question (−$${amount}).`
        : `${n()}答错了 AI 素养题，扣除 $${amount}。`;
    case "botQuizOk":
      return en
        ? `AI Opponent answered a “${entry.domainEn || entry.domainZh}” question correctly (+$${amount}).`
        : `AI 对手答对“${entry.domainZh || entry.domainEn}”题，获得 $${amount}。`;
    case "botQuizBad":
      return en
        ? `AI Opponent missed a “${entry.domainEn || entry.domainZh}” question (−$${amount}).`
        : `AI 对手答错“${entry.domainZh || entry.domainEn}”题，扣除 $${amount}。`;
    default:
      return en ? (entry.en || entry.zh || "") : (entry.zh || entry.en || "");
  }
}

function addLog(entry) {
  const item = entry && typeof entry === "object" ? entry : { id: "legacy", zh: String(entry || ""), en: String(entry || "") };
  state.log.unshift(item);
  state.log = state.log.slice(0, 30);
  els.centerMessage.textContent = formatLogEntry(item);
  saveState();
  renderStatus();
}

function rollDice() {
  return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
}

async function showDice(dice) {
  els.dieOne.classList.add("is-rolling");
  els.dieTwo.classList.add("is-rolling");
  for (let i = 0; i < 7; i += 1) {
    setDieFace(els.dieOne, Math.floor(Math.random() * 6) + 1);
    setDieFace(els.dieTwo, Math.floor(Math.random() * 6) + 1);
    await wait(70);
  }
  els.dieOne.classList.remove("is-rolling");
  els.dieTwo.classList.remove("is-rolling");
  setDieFace(els.dieOne, dice[0]);
  setDieFace(els.dieTwo, dice[1]);
}

async function movePlayer(playerIndex, steps) {
  const player = state.players[playerIndex];
  for (let i = 0; i < steps; i += 1) {
    const previous = player.position;
    player.position = (player.position + 1) % CELLS.length;
    if (player.position === 0 && previous === CELLS.length - 1) {
      player.money += PASS_START_REWARD;
      addLog({ id: "passStart", playerIndex, amount: PASS_START_REWARD });
    }
    renderTokens();
    const piece = document.querySelector(
      `.board-cell[data-index="${player.position}"] .piece.${playerIndex === 0 ? "player" : "bot"}`,
    );
    piece?.classList.add("is-moving");
    await wait(120);
  }
  saveState();
}

function propertyRent(cellIndex, ownerIndex) {
  const cell = CELLS[cellIndex];
  if (cell.type === "station") {
    const stationCount = state.players[ownerIndex].properties.filter(
      (index) => CELLS[index].type === "station",
    ).length;
    return 50 * Math.max(1, stationCount);
  }
  if (cell.type === "utility") return Math.max(cell.rent, state.currentRoll * 8);
  const sameGroup = CELLS
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.group && item.group === cell.group);
  const ownsGroup = sameGroup.every(({ index }) => state.ownership[index] === ownerIndex);
  return ownsGroup ? cell.rent * 2 : cell.rent;
}

async function resolveLanding(playerIndex) {
  const player = state.players[playerIndex];
  const cellIndex = player.position;
  const cell = CELLS[cellIndex];
  state.pendingPurchase = null;
  addLog({ id: "land", playerIndex, cellIndex });

  if (["property", "station", "utility"].includes(cell.type)) {
    const owner = state.ownership[cellIndex];
    if (owner === undefined) {
      if (isHumanPlayer(playerIndex)) {
        state.pendingPurchase = cellIndex;
        state.phase = "landed";
        els.buy.textContent = isEn()
          ? `Buy ${cellLabel(cell)} ($${cell.price})`
          : `购买 ${cellLabel(cell)}（$${cell.price}）`;
        renderStatus();
        return;
      }
      if (player.money - cell.price >= 400) {
        buyProperty(1, cellIndex);
      } else {
        addLog({ id: "skipBuy", cellIndex });
      }
    } else if (owner !== playerIndex) {
      const rent = propertyRent(cellIndex, owner);
      player.money -= rent;
      state.players[owner].money += rent;
      addLog({ id: "rent", playerIndex, ownerIndex: owner, amount: rent });
    }
    return finishLanding(playerIndex);
  }

  if (cell.type === "question") {
    state.phase = "question";
    if (isHumanPlayer(playerIndex)) {
      openQuestion(playerIndex);
      renderStatus();
      return;
    }
    await resolveBotQuestion();
    return finishLanding(playerIndex);
  }

  if (cell.type === "tax") {
    player.money -= cell.amount;
    state.pot += cell.amount;
    addLog({ id: "tax", playerIndex, cellIndex, amount: cell.amount });
  } else if (cell.type === "parking") {
    if (state.pot > 0) {
      const reward = state.pot;
      player.money += reward;
      state.pot = 0;
      addLog({ id: "pot", playerIndex, amount: reward });
    } else {
      addLog({ id: "potEmpty" });
    }
  } else if (cell.type === "gojail") {
    player.position = 10;
    player.jailTurns = 1;
    state.extraTurn = false;
    renderTokens();
    addLog({ id: "goJail", playerIndex });
  }
  return finishLanding(playerIndex);
}

function buyProperty(playerIndex, cellIndex) {
  const player = state.players[playerIndex];
  const cell = CELLS[cellIndex];
  if (
    state.ownership[cellIndex] !== undefined ||
    !cell.price ||
    player.money < cell.price
  ) {
    if (playerIndex === 0) {
      addLog({ id: "cantBuy" });
    }
    return false;
  }
  player.money -= cell.price;
  player.properties.push(cellIndex);
  state.ownership[cellIndex] = playerIndex;
  state.pendingPurchase = null;
  addLog({ id: "buy", playerIndex, cellIndex, amount: cell.price });
  return true;
}

function finishLanding(playerIndex) {
  saveState();
  renderStatus();
  if (checkGameOver()) return;
  if (isHumanPlayer(playerIndex)) {
    state.phase = "landed";
    renderStatus();
  } else {
    setTimeout(() => advanceTurn(), 700);
  }
}

function nextQuestion() {
  if (state.questionCursor >= state.questionOrder.length) {
    state.questionOrder = shuffle(AI_QUESTIONS.map((_, index) => index));
    state.questionCursor = 0;
  }
  const index = state.questionOrder[state.questionCursor];
  state.questionCursor += 1;
  return AI_QUESTIONS[index];
}

function openQuestion(playerIndex) {
  const question = nextQuestion();
  const order = shuffle(question.options.map((_, index) => index));
  activeQuestion = { question, order, answered: false, playerIndex };
  paintQuestionUi();
  els.answerFeedback.hidden = true;
  els.questionContinue.hidden = true;
  els.questionModal.hidden = false;
  els.answerList.querySelector("button")?.focus();
  saveState();
}

function paintQuestionUi() {
  if (!activeQuestion) return;
  const question = localizeQuestion(activeQuestion.question, getLang());
  if (els.questionTitle) els.questionTitle.textContent = t("monopoly.qTitle");
  if (els.questionStakes) {
    els.questionStakes.textContent = t("monopoly.qStakes", {
      ok: CORRECT_REWARD,
      bad: WRONG_PENALTY,
    });
  }
  els.questionDomain.textContent = question.domain;
  els.questionStem.textContent = question.stem;
  els.answerList.innerHTML = "";
  activeQuestion.order.forEach((optionIndex, displayIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.disabled = activeQuestion.answered;
    button.innerHTML = `
      <span class="answer-letter">${String.fromCharCode(65 + displayIndex)}</span>
      <span>${question.options[optionIndex]}</span>`;
    button.addEventListener("click", () => answerQuestion(optionIndex, button));
    els.answerList.appendChild(button);
  });
  els.questionContinue.textContent = t("monopoly.qContinue");
}

function answerQuestion(optionIndex, selectedButton) {
  if (!activeQuestion || activeQuestion.answered) return;
  activeQuestion.answered = true;
  const { question, playerIndex } = activeQuestion;
  const correct = isCorrectOption(question, optionIndex);
  const player = state.players[playerIndex];
  player.money += correct ? CORRECT_REWARD : -WRONG_PENALTY;

  [...els.answerList.children].forEach((button, displayIndex) => {
    button.disabled = true;
    const originalIndex = activeQuestion.order[displayIndex];
    if (isCorrectOption(question, originalIndex)) button.classList.add("is-correct");
  });
  if (!correct) selectedButton.classList.add("is-wrong");

  const displayQ = localizeQuestion(question, getLang());
  els.answerFeedback.className = `answer-feedback ${correct ? "correct" : "wrong"}`;
  els.answerFeedback.innerHTML = `
    <strong>${correct
      ? (isEn() ? `Correct! +$${CORRECT_REWARD}` : `回答正确，获得 $${CORRECT_REWARD}`)
      : (isEn() ? `Wrong. −$${WRONG_PENALTY}` : `回答错误，扣除 $${WRONG_PENALTY}`)}</strong>
    <span>${displayQ.explain || ""}</span>`;
  els.answerFeedback.hidden = false;
  els.questionContinue.hidden = false;
  els.questionContinue.textContent = t("monopoly.qContinue");
  addLog({
    id: correct ? "quizOk" : "quizBad",
    playerIndex,
    amount: correct ? CORRECT_REWARD : WRONG_PENALTY,
  });
  els.questionContinue.focus();
}

async function resolveBotQuestion() {
  const question = nextQuestion();
  await wait(650);
  const correct = Math.random() < 0.68;
  state.players[1].money += correct ? CORRECT_REWARD : -WRONG_PENALTY;
  const zhQ = localizeQuestion(question, "zh");
  const enQ = localizeQuestion(question, "en");
  addLog({
    id: correct ? "botQuizOk" : "botQuizBad",
    amount: correct ? CORRECT_REWARD : WRONG_PENALTY,
    domainZh: zhQ.domain,
    domainEn: enQ.domain,
  });
}

async function takeTurn(playerIndex) {
  if (state.gameOver || state.turn !== playerIndex) return;
  const player = state.players[playerIndex];
  if (player.jailTurns > 0) {
    player.jailTurns -= 1;
    state.extraTurn = false;
    addLog({ id: "stayJail", playerIndex });
    if (isHumanPlayer(playerIndex)) {
      state.phase = "landed";
      renderStatus();
    } else {
      setTimeout(() => advanceTurn(), 700);
    }
    return;
  }

  state.phase = isHumanPlayer(playerIndex) ? "moving" : "bot";
  renderStatus();
  const dice = rollDice();
  state.currentRoll = dice[0] + dice[1];
  state.extraTurn = dice[0] === dice[1];
  await showDice(dice);
  addLog({
    id: "roll",
    playerIndex,
    d1: dice[0],
    d2: dice[1],
    total: state.currentRoll,
  });
  await movePlayer(playerIndex, state.currentRoll);
  await resolveLanding(playerIndex);
}

function advanceTurn() {
  if (checkGameOver()) return;
  state.pendingPurchase = null;
  if (state.extraTurn) {
    addLog({ id: "doubles", playerIndex: state.turn });
  } else {
    const previous = state.turn;
    state.turn = state.turn === 0 ? 1 : 0;
    if (previous === 1 && state.turn === 0) state.round += 1;
  }
  state.extraTurn = false;
  state.phase = isHumanPlayer(state.turn) ? "ready" : "bot";
  saveState();
  renderStatus();
  if (state.turn === 1 && state.mode === "ai") setTimeout(() => takeTurn(1), 800);
}

function checkGameOver() {
  const [player, bot] = state.players;
  const p0 = displayPlayerName(0);
  const p1 = displayPlayerName(1);
  let winner = null;
  let reasonZh = "";
  let reasonEn = "";
  if (player.money < 0) {
    winner = 1;
    reasonZh = `${player.name}的资金低于 $0，${bot.name}赢得本局。`;
    reasonEn = `${p0} dropped below $0. ${p1} wins.`;
  } else if (bot.money < 0) {
    winner = 0;
    reasonZh = `${bot.name}的资金低于 $0，${player.name}赢得本局！`;
    reasonEn = `${p1} dropped below $0. ${p0} wins!`;
  } else if (player.money >= WIN_MONEY) {
    winner = 0;
    reasonZh = `${player.name}率先拥有 $${WIN_MONEY.toLocaleString()}，赢得本局！`;
    reasonEn = `${p0} reached $${WIN_MONEY.toLocaleString()} first and wins!`;
  } else if (bot.money >= WIN_MONEY) {
    winner = 1;
    reasonZh = `${bot.name}率先拥有 $${WIN_MONEY.toLocaleString()}，赢得本局。`;
    reasonEn = `${p1} reached $${WIN_MONEY.toLocaleString()} first and wins.`;
  }
  if (winner === null) return false;

  state.gameOver = true;
  state.phase = "gameover";
  saveState();
  els.gameoverIcon.textContent = winner === 0 ? "🏆" : "🤖";
  els.gameoverTitle.textContent = isEn()
    ? t("monopoly.winTitle", { name: displayPlayerName(winner) })
    : `${state.players[winner].name}获胜！`;
  els.gameoverText.textContent = isEn() ? reasonEn : reasonZh;
  els.gameoverModal.hidden = false;
  renderStatus();
  return true;
}

function restartGame(preserveMode = true) {
  const mode = preserveMode ? state.mode : "ai";
  const playerOne = preserveMode ? state.players[0].name : "玩家一";
  const playerTwo = preserveMode ? state.players[1].name : "玩家二";
  localStorage.removeItem(SAVE_KEY);
  state = freshState(mode, playerOne, playerTwo);
  activeQuestion = null;
  els.questionModal.hidden = true;
  els.gameoverModal.hidden = true;
  setDieFace(els.dieOne, 0);
  setDieFace(els.dieTwo, 0);
  renderStatus();
  saveState();
}

function cleanUsername(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 12);
}

function isDefaultPlayerName(name, which) {
  const n = String(name || "").trim();
  if (which === 1) return !n || n === "玩家一" || n === "YOU";
  return !n || n === "玩家二" || n === "Player 2";
}

function paintLobbyDefaults() {
  const p1 = document.getElementById("player-one-input");
  const p2 = document.getElementById("player-two-input");
  if (p1 && isDefaultPlayerName(p1.value, 1)) p1.value = t("monopoly.defaultP1");
  if (p2 && isDefaultPlayerName(p2.value, 2)) p2.value = t("monopoly.defaultP2");
}

function openLobby() {
  const mode = state.mode || "ai";
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  document.getElementById("player-two-field").hidden = mode !== "pvp";
  const p1Name = state.players[0]?.name;
  const p2Name = state.mode === "pvp" ? state.players[1]?.name : "";
  document.getElementById("player-one-input").value = isDefaultPlayerName(p1Name, 1)
    ? t("monopoly.defaultP1")
    : (p1Name || t("monopoly.defaultP1"));
  document.getElementById("player-two-input").value = isDefaultPlayerName(p2Name, 2)
    ? t("monopoly.defaultP2")
    : (p2Name || t("monopoly.defaultP2"));
  document.getElementById("join-error").hidden = true;
  els.lobbyModal.dataset.mode = mode;
  els.lobbyModal.hidden = false;
  applyDom(els.lobbyModal);
}

document.querySelectorAll(".mode-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const mode = tab.dataset.mode;
    els.lobbyModal.dataset.mode = mode;
    document.querySelectorAll(".mode-tab").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    document.getElementById("player-two-field").hidden = mode !== "pvp";
  });
});

document.getElementById("join-game").addEventListener("click", () => {
  const mode = els.lobbyModal.dataset.mode === "pvp" ? "pvp" : "ai";
  const playerOne = cleanUsername(document.getElementById("player-one-input").value);
  const playerTwo = cleanUsername(document.getElementById("player-two-input").value);
  const error = document.getElementById("join-error");
  if (!playerOne || (mode === "pvp" && !playerTwo)) {
    error.textContent = t("monopoly.lobbyNeedName");
    error.hidden = false;
    return;
  }
  if (mode === "pvp" && playerOne.toLowerCase() === playerTwo.toLowerCase()) {
    error.textContent = t("monopoly.lobbyDupName");
    error.hidden = false;
    return;
  }
  state = freshState(mode, playerOne, playerTwo);
  els.lobbyModal.hidden = true;
  saveState();
  renderStatus();
  addLog(mode === "pvp" ? { id: "joinPvp" } : { id: "joinAi" });
});

els.roll.addEventListener("click", () => takeTurn(state.turn));
els.buy.addEventListener("click", () => {
  if (state.pendingPurchase === null) return;
  buyProperty(state.turn, state.pendingPurchase);
  state.phase = "landed";
  renderStatus();
  checkGameOver();
});
els.end.addEventListener("click", () => advanceTurn());
els.questionContinue.addEventListener("click", () => {
  if (!activeQuestion?.answered) return;
  const playerIndex = activeQuestion.playerIndex;
  els.questionModal.hidden = true;
  activeQuestion = null;
  finishLanding(playerIndex);
});

document.getElementById("rules-button").addEventListener("click", () => {
  els.rulesModal.hidden = false;
});
document.getElementById("mode-button").addEventListener("click", openLobby);
document.getElementById("rules-close").addEventListener("click", () => {
  els.rulesModal.hidden = true;
});
document.getElementById("rules-confirm").addEventListener("click", () => {
  els.rulesModal.hidden = true;
});
document.getElementById("restart-button").addEventListener("click", () => restartGame(true));
document.getElementById("play-again").addEventListener("click", () => restartGame(true));
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !els.rulesModal.hidden) els.rulesModal.hidden = true;
});

const rewardCorrectEl = document.getElementById("reward-correct");
const rewardWrongEl = document.getElementById("reward-wrong");
if (rewardCorrectEl) rewardCorrectEl.textContent = `+$${CORRECT_REWARD}`;
if (rewardWrongEl) rewardWrongEl.textContent = `−$${WRONG_PENALTY}`;

renderBoard();
setDieFace(els.dieOne, 0);
setDieFace(els.dieTwo, 0);
renderStatus();
if (hadSavedGame) saveState();
else openLobby();
if (state.turn === 1 && state.mode === "ai") setTimeout(() => takeTurn(1), 700);
