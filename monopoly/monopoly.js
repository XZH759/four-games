import { AI_QUESTIONS } from "/monopoly/questions.js";

const SAVE_KEY = "ai_monopoly_v1";
const START_MONEY = 1500;
const PASS_START_REWARD = 200;
const CORRECT_REWARD = 300;
const WRONG_PENALTY = 150;
const WIN_MONEY = 4000;

const CELLS = [
  { type: "start", name: "起点", icon: "🚀" },
  { type: "property", name: "资料小径", price: 60, rent: 12, group: "brown", color: "#9b6741" },
  { type: "question", name: "AI 知识卡", icon: "?" },
  { type: "property", name: "运算街", price: 60, rent: 14, group: "brown", color: "#9b6741" },
  { type: "tax", name: "设备维护费", amount: 100, icon: "🔧" },
  { type: "station", name: "数据枢纽一", price: 200, rent: 50, icon: "🛰️" },
  { type: "property", name: "模型大道", price: 100, rent: 20, group: "cyan", color: "#4ebedf" },
  { type: "question", name: "AI 知识卡", icon: "?" },
  { type: "property", name: "提示词路", price: 100, rent: 22, group: "cyan", color: "#4ebedf" },
  { type: "property", name: "创意广场", price: 120, rent: 26, group: "cyan", color: "#4ebedf" },
  { type: "jail", name: "监测区 / 探访", icon: "🔍" },
  { type: "property", name: "隐私花园", price: 140, rent: 30, group: "pink", color: "#e47ca6" },
  { type: "utility", name: "算力中心", price: 150, rent: 60, icon: "⚡" },
  { type: "question", name: "AI 知识卡", icon: "?" },
  { type: "property", name: "原创大道", price: 160, rent: 36, group: "pink", color: "#e47ca6" },
  { type: "station", name: "数据枢纽二", price: 200, rent: 50, icon: "🛰️" },
  { type: "property", name: "公平社区", price: 180, rent: 40, group: "orange", color: "#ed994c" },
  { type: "question", name: "AI 知识卡", icon: "?" },
  { type: "property", name: "多元大街", price: 180, rent: 42, group: "orange", color: "#ed994c" },
  { type: "property", name: "无障碍广场", price: 200, rent: 46, group: "orange", color: "#ed994c" },
  { type: "parking", name: "自由休息站", icon: "☕" },
  { type: "property", name: "核实大道", price: 220, rent: 50, group: "red", color: "#e55d5d" },
  { type: "question", name: "AI 知识卡", icon: "?" },
  { type: "property", name: "来源街", price: 220, rent: 52, group: "red", color: "#e55d5d" },
  { type: "property", name: "事实广场", price: 240, rent: 58, group: "red", color: "#e55d5d" },
  { type: "station", name: "数据枢纽三", price: 200, rent: 50, icon: "🛰️" },
  { type: "property", name: "低碳街", price: 260, rent: 62, group: "yellow", color: "#e8c943" },
  { type: "question", name: "AI 知识卡", icon: "?" },
  { type: "utility", name: "绿色机房", price: 150, rent: 60, icon: "🌱" },
  { type: "property", name: "永续广场", price: 280, rent: 70, group: "yellow", color: "#e8c943" },
  { type: "gojail", name: "前往监测区", icon: "🚨" },
  { type: "property", name: "透明街", price: 300, rent: 76, group: "green", color: "#48a86f" },
  { type: "property", name: "解释大道", price: 300, rent: 78, group: "green", color: "#48a86f" },
  { type: "question", name: "AI 知识卡", icon: "?" },
  { type: "property", name: "责任广场", price: 320, rent: 84, group: "green", color: "#48a86f" },
  { type: "station", name: "数据枢纽四", price: 200, rent: 50, icon: "🛰️" },
  { type: "question", name: "AI 知识卡", icon: "?" },
  { type: "property", name: "智慧云端", price: 350, rent: 92, group: "blue", color: "#3979c9" },
  { type: "tax", name: "系统升级费", amount: 150, icon: "🧾" },
  { type: "property", name: "可信 AI 城", price: 400, rent: 110, group: "blue", color: "#3979c9" },
];

const DICE_FACES = ["1", "2", "3", "4", "5", "6"];

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
    log: [`游戏开始：${playerOne}先行动。`],
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
      return saved;
    }
  } catch {
    // 使用新游戏状态
  }
  return freshState();
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
  if (index > 0 && index < 10) classes.push("side-bottom");
  if (index > 10 && index < 20) classes.push("side-left");
  if (index > 20 && index < 30) classes.push("side-top");
  if (index > 30) classes.push("side-right");
  return classes.join(" ");
}

function renderBoard() {
  els.board.querySelectorAll(".board-cell").forEach((cell) => cell.remove());
  CELLS.forEach((cell, index) => {
    const node = document.createElement("div");
    const position = cellPosition(index);
    node.className = cellClass(cell, index);
    node.dataset.index = String(index);
    node.style.gridRow = String(position.row);
    node.style.gridColumn = String(position.col);
    if (cell.color) node.style.setProperty("--cell-color", cell.color);
    node.innerHTML = `
      ${cell.color ? '<span class="color-bar"></span>' : ""}
      <span class="cell-icon" aria-hidden="true">${cell.icon || (cell.type === "property" ? "🏠" : "")}</span>
      <span class="cell-name">${cell.name}</span>
      <span class="cell-price">${cell.price ? `$${cell.price}` : cell.amount ? `−$${cell.amount}` : ""}</span>
      <span class="tokens"></span>`;
    node.title = cell.price ? `${cell.name} · 价格 $${cell.price} · 基础租金 $${cell.rent}` : cell.name;
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
    piece.setAttribute("aria-label", `${player.name}位于${CELLS[player.position].name}`);
    host.appendChild(piece);
  });
}

function renderOwnership() {
  document.querySelectorAll(".board-cell").forEach((node) => {
    const owner = state.ownership[node.dataset.index];
    node.classList.toggle("is-owned", owner !== undefined);
    if (owner !== undefined) {
      node.style.setProperty("--owner-color", owner === 0 ? "#1d77d2" : "#805ec7");
    } else {
      node.style.removeProperty("--owner-color");
    }
  });
}

function renderStatus() {
  const [player, bot] = state.players;
  const current = state.players[state.turn];
  const humanTurn = isHumanPlayer(state.turn);
  els.playerName.textContent = player.name;
  els.opponentName.textContent = bot.name;
  els.playerMoney.textContent = `$${player.money.toLocaleString()}`;
  els.botMoney.textContent = `$${bot.money.toLocaleString()}`;
  els.playerMoney.classList.toggle("is-danger", player.money < 300);
  els.botMoney.classList.toggle("is-danger", bot.money < 300);
  els.playerProperties.textContent = String(player.properties.length);
  els.botProperties.textContent = String(bot.properties.length);
  els.round.textContent = String(state.round);
  els.playerCard.classList.toggle("is-active", state.turn === 0 && !state.gameOver);
  els.botCard.classList.toggle("is-active", state.turn === 1 && !state.gameOver);
  els.playerStatus.textContent = state.players[0].jailTurns ? "监测中" : state.turn === 0 ? "当前回合" : "等待回合";
  els.botStatus.textContent = state.players[1].jailTurns
    ? "监测中"
    : state.turn === 1
      ? (state.mode === "pvp" ? "当前回合" : "正在行动")
      : "等待回合";
  els.turnLabel.textContent = humanTurn ? `轮到 ${current.name} 行动` : "AI 对手行动中";

  const canRoll = humanTurn && state.phase === "ready" && !state.gameOver;
  els.roll.disabled = !canRoll;
  els.roll.hidden = !humanTurn || ["landed", "question"].includes(state.phase);
  els.buy.hidden = state.pendingPurchase === null || !humanTurn;
  els.end.hidden = !humanTurn || state.phase !== "landed";

  renderOwnedList(state.mode === "pvp" ? state.turn : 0);
  renderLog();
  renderTokens();
  renderOwnership();
}

function renderOwnedList(playerIndex = 0) {
  const owner = state.players[playerIndex];
  const properties = owner.properties;
  els.assetTitle.textContent = state.mode === "pvp" ? `${owner.name}的资产` : "我的资产";
  if (!properties.length) {
    els.ownedList.innerHTML = "<p>尚未购买地产</p>";
    return;
  }
  els.ownedList.innerHTML = properties
    .map((index) => {
      const cell = CELLS[index];
      return `
        <div class="owned-item">
          <span class="owned-color" style="background:${cell.color || "#17324d"}"></span>
          <span>${cell.name}</span>
          <strong>$${cell.rent}</strong>
        </div>`;
    })
    .join("");
}

function renderLog() {
  els.log.innerHTML = state.log
    .slice(0, 14)
    .map((entry) => `<li>${entry}</li>`)
    .join("");
}

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 30);
  els.centerMessage.textContent = message;
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
    els.dieOne.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    els.dieTwo.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    await wait(70);
  }
  els.dieOne.classList.remove("is-rolling");
  els.dieTwo.classList.remove("is-rolling");
  els.dieOne.textContent = DICE_FACES[dice[0] - 1];
  els.dieTwo.textContent = DICE_FACES[dice[1] - 1];
}

async function movePlayer(playerIndex, steps) {
  const player = state.players[playerIndex];
  for (let i = 0; i < steps; i += 1) {
    const previous = player.position;
    player.position = (player.position + 1) % CELLS.length;
    if (player.position === 0 && previous === CELLS.length - 1) {
      player.money += PASS_START_REWARD;
      addLog(`${player.name}经过起点，获得 $${PASS_START_REWARD}。`);
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
  addLog(`${player.name}停在“${cell.name}”。`);

  if (["property", "station", "utility"].includes(cell.type)) {
    const owner = state.ownership[cellIndex];
    if (owner === undefined) {
      if (isHumanPlayer(playerIndex)) {
        state.pendingPurchase = cellIndex;
        state.phase = "landed";
        els.buy.textContent = `购买 ${cell.name}（$${cell.price}）`;
        renderStatus();
        return;
      }
      if (player.money - cell.price >= 400) {
        buyProperty(1, cellIndex);
      } else {
        addLog(`AI 对手保留现金，没有购买“${cell.name}”。`);
      }
    } else if (owner !== playerIndex) {
      const rent = propertyRent(cellIndex, owner);
      player.money -= rent;
      state.players[owner].money += rent;
      addLog(`${player.name}向${state.players[owner].name}支付租金 $${rent}。`);
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
    addLog(`${player.name}支付“${cell.name}” $${cell.amount}。`);
  } else if (cell.type === "parking") {
    if (state.pot > 0) {
      const reward = state.pot;
      player.money += reward;
      state.pot = 0;
      addLog(`${player.name}在自由休息站获得公共奖金 $${reward}。`);
    } else {
      addLog("自由休息站很安静，本次没有公共奖金。");
    }
  } else if (cell.type === "gojail") {
    player.position = 10;
    player.jailTurns = 1;
    state.extraTurn = false;
    renderTokens();
    addLog(`${player.name}被送往监测区，将暂停一回合。`);
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
    if (playerIndex === 0) addLog("现金不足，无法购买这块地产。");
    return false;
  }
  player.money -= cell.price;
  player.properties.push(cellIndex);
  state.ownership[cellIndex] = playerIndex;
  state.pendingPurchase = null;
  addLog(`${player.name}以 $${cell.price} 购买了“${cell.name}”。`);
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
  els.questionDomain.textContent = question.domain;
  els.questionStem.textContent = question.stem;
  els.answerFeedback.hidden = true;
  els.questionContinue.hidden = true;
  els.answerList.innerHTML = "";
  order.forEach((optionIndex, displayIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.innerHTML = `
      <span class="answer-letter">${String.fromCharCode(65 + displayIndex)}</span>
      <span>${question.options[optionIndex]}</span>`;
    button.addEventListener("click", () => answerQuestion(optionIndex, button));
    els.answerList.appendChild(button);
  });
  els.questionModal.hidden = false;
  els.answerList.querySelector("button")?.focus();
  saveState();
}

function answerQuestion(optionIndex, selectedButton) {
  if (!activeQuestion || activeQuestion.answered) return;
  activeQuestion.answered = true;
  const { question, playerIndex } = activeQuestion;
  const correct = optionIndex === question.answer;
  const player = state.players[playerIndex];
  player.money += correct ? CORRECT_REWARD : -WRONG_PENALTY;

  [...els.answerList.children].forEach((button, displayIndex) => {
    button.disabled = true;
    const originalIndex = activeQuestion.order[displayIndex];
    if (originalIndex === question.answer) button.classList.add("is-correct");
  });
  if (!correct) selectedButton.classList.add("is-wrong");

  els.answerFeedback.className = `answer-feedback ${correct ? "correct" : "wrong"}`;
  els.answerFeedback.innerHTML = `
    <strong>${correct ? `回答正确，获得 $${CORRECT_REWARD}` : `回答错误，扣除 $${WRONG_PENALTY}`}</strong>
    <span>${question.explain}</span>`;
  els.answerFeedback.hidden = false;
  els.questionContinue.hidden = false;
  addLog(
    correct
      ? `${player.name}答对了 AI 素养题，获得 $${CORRECT_REWARD}。`
      : `${player.name}答错了 AI 素养题，扣除 $${WRONG_PENALTY}。`,
  );
  els.questionContinue.focus();
}

async function resolveBotQuestion() {
  const question = nextQuestion();
  await wait(650);
  const correct = Math.random() < 0.68;
  state.players[1].money += correct ? CORRECT_REWARD : -WRONG_PENALTY;
  addLog(
    correct
      ? `AI 对手答对“${question.domain}”题，获得 $${CORRECT_REWARD}。`
      : `AI 对手答错“${question.domain}”题，扣除 $${WRONG_PENALTY}。`,
  );
}

async function takeTurn(playerIndex) {
  if (state.gameOver || state.turn !== playerIndex) return;
  const player = state.players[playerIndex];
  if (player.jailTurns > 0) {
    player.jailTurns -= 1;
    state.extraTurn = false;
    addLog(`${player.name}本回合留在监测区。`);
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
  addLog(`${player.name}掷出 ${dice[0]} + ${dice[1]}，前进 ${state.currentRoll} 格。`);
  await movePlayer(playerIndex, state.currentRoll);
  await resolveLanding(playerIndex);
}

function advanceTurn() {
  if (checkGameOver()) return;
  state.pendingPurchase = null;
  if (state.extraTurn) {
    addLog(`${state.players[state.turn].name}掷出双骰，再行动一次。`);
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
  let winner = null;
  let reason = "";
  if (player.money < 0) {
    winner = 1;
    reason = `${player.name}的资金低于 $0，${bot.name}赢得本局。`;
  } else if (bot.money < 0) {
    winner = 0;
    reason = `${bot.name}的资金低于 $0，${player.name}赢得本局！`;
  } else if (player.money >= WIN_MONEY) {
    winner = 0;
    reason = `${player.name}率先拥有 $${WIN_MONEY.toLocaleString()}，赢得本局！`;
  } else if (bot.money >= WIN_MONEY) {
    winner = 1;
    reason = `${bot.name}率先拥有 $${WIN_MONEY.toLocaleString()}，赢得本局。`;
  }
  if (winner === null) return false;

  state.gameOver = true;
  state.phase = "gameover";
  saveState();
  els.gameoverIcon.textContent = winner === 0 ? "🏆" : "🤖";
  els.gameoverTitle.textContent = `${state.players[winner].name}获胜！`;
  els.gameoverText.textContent = reason;
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
  els.dieOne.textContent = "–";
  els.dieTwo.textContent = "–";
  renderStatus();
  saveState();
}

function cleanUsername(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 12);
}

function openLobby() {
  const mode = state.mode || "ai";
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  document.getElementById("player-two-field").hidden = mode !== "pvp";
  document.getElementById("player-one-input").value = state.players[0]?.name || "玩家一";
  document.getElementById("player-two-input").value =
    state.mode === "pvp" ? state.players[1]?.name || "玩家二" : "玩家二";
  document.getElementById("join-error").hidden = true;
  els.lobbyModal.dataset.mode = mode;
  els.lobbyModal.hidden = false;
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
    error.textContent = "请输入参与游戏的用户名。";
    error.hidden = false;
    return;
  }
  if (mode === "pvp" && playerOne.toLowerCase() === playerTwo.toLowerCase()) {
    error.textContent = "两位玩家请使用不同的用户名。";
    error.hidden = false;
    return;
  }
  state = freshState(mode, playerOne, playerTwo);
  els.lobbyModal.hidden = true;
  saveState();
  renderStatus();
  addLog(
    mode === "pvp"
      ? `${playerTwo}已加入游戏，${playerOne}先行动。`
      : `${playerOne}加入游戏，将与 AI 对手对战。`,
  );
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

renderBoard();
renderStatus();
if (hadSavedGame) saveState();
else openLobby();
if (state.turn === 1 && state.mode === "ai") setTimeout(() => takeTurn(1), 700);
