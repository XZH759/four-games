import { AI_QUESTIONS } from "/monopoly/questions.js";

const WORLD = { width: 1600, height: 1000, cx: 800, cy: 500, rx: 610, ry: 345 };
const START_ANGLE = Math.PI / 2;
const LAPS_TO_WIN = 3;
const RACER_COUNT = 6;
const GATES = [0.18, 0.48, 0.78];
const LETTERS = ["A", "B", "C", "D"];
const TAU = Math.PI * 2;

const canvas = document.getElementById("race-canvas");
const ctx = canvas.getContext("2d");
const els = {
  startScreen: document.getElementById("start-screen"),
  start: document.getElementById("start-button"),
  pause: document.getElementById("pause-button"),
  pauseScreen: document.getElementById("pause-screen"),
  resume: document.getElementById("resume-button"),
  restart: document.getElementById("restart-button"),
  playAgain: document.getElementById("play-again"),
  finishScreen: document.getElementById("finish-screen"),
  finishIcon: document.getElementById("finish-icon"),
  finishTitle: document.getElementById("finish-title"),
  finishSummary: document.getElementById("finish-summary"),
  finishPosition: document.getElementById("finish-position"),
  finishTime: document.getElementById("finish-time"),
  finishAnswers: document.getElementById("finish-answers"),
  position: document.getElementById("position"),
  lap: document.getElementById("lap"),
  timer: document.getElementById("timer"),
  speed: document.getElementById("speed"),
  speedFill: document.getElementById("speed-fill"),
  effectPanel: document.getElementById("effect-panel"),
  effectIcon: document.getElementById("effect-icon"),
  effectName: document.getElementById("effect-name"),
  message: document.getElementById("race-message"),
  countdown: document.getElementById("countdown"),
  quiz: document.getElementById("quiz-overlay"),
  questionDomain: document.getElementById("question-domain"),
  questionStem: document.getElementById("question-stem"),
  answers: document.getElementById("answer-list"),
  feedback: document.getElementById("answer-feedback"),
  quizContinue: document.getElementById("quiz-continue"),
};

const input = { left: false, right: false, gas: false, brake: false, drift: false };
const particles = [];
const scenery = Array.from({ length: 95 }, (_, index) => {
  const angle = (index * 2.399963 + 0.3) % TAU;
  const outer = index % 3 !== 0;
  const radius = outer ? 1.33 + (index % 5) * 0.08 : 0.45 - (index % 4) * 0.055;
  return {
    x: WORLD.cx + Math.cos(angle) * WORLD.rx * radius,
    y: WORLD.cy + Math.sin(angle) * WORLD.ry * radius,
    size: 13 + (index % 6) * 3,
    hue: 105 + (index % 5) * 7,
  };
});

let game = createGame();
let activeQuestion = null;
let countdownToken = 0;
let lastFrame = performance.now();
let messageTimer = 0;

function createPlayer() {
  const t = START_ANGLE;
  return {
    x: WORLD.cx + WORLD.rx * Math.cos(t),
    y: WORLD.cy + WORLD.ry * Math.sin(t) - 22,
    angle: 0,
    speed: 0,
    lap: 1,
    progress: 0,
    previousProgress: 0,
    checkpoints: new Set(),
    driftCharge: 0,
    drifting: false,
    boostTimer: 0,
    focusTimer: 0,
    slowTimer: 0,
    invertTimer: 0,
    spinTimer: 0,
    shield: false,
    onRoad: true,
    color: "#ffd338",
  };
}

function createOpponents() {
  const colors = ["#ef4545", "#35d9f1", "#8c63e9", "#36d27f", "#ff8f32"];
  const names = ["像素狐", "云端兔", "量子熊", "逻辑猫", "数据鹰"];
  return colors.map((color, index) => ({
    name: names[index],
    color,
    totalProgress: -(index + 1) * 0.012,
    speed: 224 + index * 6,
    baseSpeed: 224 + index * 6,
    lane: (index - 2) * 18,
    wobble: index * 1.7,
    x: 0,
    y: 0,
    angle: 0,
    finished: false,
  }));
}

function createGame() {
  return {
    mode: "menu",
    player: createPlayer(),
    opponents: createOpponents(),
    elapsed: 0,
    usedGates: new Set(),
    correct: 0,
    answered: 0,
    finalPosition: null,
    questionDeck: shuffle(AI_QUESTIONS.map((_, index) => index)),
    questionCursor: 0,
  };
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(value) {
  return ((value % TAU) + TAU) % TAU;
}

function progressAt(x, y) {
  const t = normalizeAngle(Math.atan2((y - WORLD.cy) / WORLD.ry, (x - WORLD.cx) / WORLD.rx));
  return normalizeAngle(START_ANGLE - t) / TAU;
}

function pointAtProgress(progress, lane = 0) {
  const t = START_ANGLE - progress * TAU;
  const cos = Math.cos(t);
  const sin = Math.sin(t);
  const nxRaw = cos / WORLD.rx;
  const nyRaw = sin / WORLD.ry;
  const length = Math.hypot(nxRaw, nyRaw) || 1;
  const nx = nxRaw / length;
  const ny = nyRaw / length;
  const x = WORLD.cx + WORLD.rx * cos + nx * lane;
  const y = WORLD.cy + WORLD.ry * sin + ny * lane;
  const angle = Math.atan2(-WORLD.ry * cos, WORLD.rx * sin);
  return { x, y, angle, nx, ny };
}

function isOnRoad(x, y) {
  const dx = (x - WORLD.cx) / WORLD.rx;
  const dy = (y - WORLD.cy) / WORLD.ry;
  const radial = Math.sqrt(dx * dx + dy * dy);
  return Math.abs(radial - 1) < 0.225;
}

function resetInput() {
  Object.keys(input).forEach((key) => { input[key] = false; });
  document.querySelectorAll("[data-control]").forEach((button) => button.classList.remove("is-held"));
}

function showOverlay(element, visible) {
  element.classList.toggle("is-visible", visible);
}

function announce(text, duration = 1700) {
  els.message.textContent = text;
  els.message.classList.add("is-visible");
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => els.message.classList.remove("is-visible"), duration);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  return `${String(minutes).padStart(2, "0")}:${rest.toFixed(1).padStart(4, "0")}`;
}

async function runCountdown() {
  const token = ++countdownToken;
  game.mode = "countdown";
  resetInput();
  for (const text of ["3", "2", "1", "GO!"]) {
    if (token !== countdownToken) return;
    els.countdown.textContent = text;
    els.countdown.classList.remove("is-active");
    void els.countdown.offsetWidth;
    els.countdown.classList.add("is-active");
    await new Promise((resolve) => setTimeout(resolve, text === "GO!" ? 650 : 760));
  }
  if (token !== countdownToken) return;
  els.countdown.classList.remove("is-active");
  game.mode = "racing";
  announce("冲过知识门，答题赢取加速！");
}

function startRace() {
  countdownToken += 1;
  game = createGame();
  activeQuestion = null;
  particles.length = 0;
  showOverlay(els.startScreen, false);
  showOverlay(els.pauseScreen, false);
  showOverlay(els.finishScreen, false);
  showOverlay(els.quiz, false);
  updateHud();
  runCountdown();
}

function togglePause(force) {
  const shouldPause = typeof force === "boolean" ? force : game.mode === "racing";
  if (shouldPause && game.mode === "racing") {
    game.mode = "paused";
    resetInput();
    showOverlay(els.pauseScreen, true);
  } else if (!shouldPause && game.mode === "paused") {
    game.mode = "racing";
    showOverlay(els.pauseScreen, false);
  }
}

function updatePlayer(dt) {
  const player = game.player;
  const steerRaw = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const steer = player.invertTimer > 0 ? -steerRaw : steerRaw;
  const wasDrifting = player.drifting;
  player.onRoad = isOnRoad(player.x, player.y);

  const acceleration = player.focusTimer > 0 ? 285 : 235;
  if (input.gas) player.speed += acceleration * dt;
  if (input.brake) player.speed -= (player.speed > 0 ? 330 : 145) * dt;
  if (!input.gas && !input.brake) {
    const drag = player.onRoad ? 72 : 125;
    player.speed -= Math.sign(player.speed) * Math.min(Math.abs(player.speed), drag * dt);
  }

  const drifting = input.drift && Math.abs(steer) > 0 && player.speed > 145 && player.onRoad;
  player.drifting = drifting;
  if (drifting) {
    player.driftCharge = Math.min(1.8, player.driftCharge + dt);
    player.speed -= 20 * dt;
    if (Math.random() < dt * 18) emitParticle(player, "#d9f6ff", 1.2);
  } else if (wasDrifting && player.driftCharge > 0.38) {
    const power = player.driftCharge;
    player.boostTimer = Math.max(player.boostTimer, 0.75 + power * 1.05);
    player.speed = Math.max(player.speed, 300 + power * 35);
    announce(power > 1.2 ? "完美漂移！强力喷射" : "漂移喷射！");
    player.driftCharge = 0;
  } else if (!drifting) {
    player.driftCharge = Math.max(0, player.driftCharge - dt * 1.6);
  }

  let maxSpeed = player.boostTimer > 0 ? 520 : player.focusTimer > 0 ? 405 : 355;
  if (!player.onRoad) maxSpeed = 150;
  if (player.slowTimer > 0) maxSpeed = Math.min(maxSpeed, 175);
  player.speed = clamp(player.speed, -85, maxSpeed);

  const speedFactor = clamp(Math.abs(player.speed) / 260, 0.25, 1.25);
  const turnRate = (drifting ? 2.25 : 1.7) * speedFactor;
  player.angle += steer * turnRate * dt * (player.speed >= 0 ? 1 : -1);
  if (player.spinTimer > 0) player.angle += 8.5 * dt;

  player.x += Math.cos(player.angle) * player.speed * dt;
  player.y += Math.sin(player.angle) * player.speed * dt;
  player.x = clamp(player.x, 35, WORLD.width - 35);
  player.y = clamp(player.y, 35, WORLD.height - 35);

  if (player.boostTimer > 0 && Math.random() < dt * 28) emitParticle(player, "#5ff2ff", 1.7);
  ["boostTimer", "focusTimer", "slowTimer", "invertTimer", "spinTimer"].forEach((key) => {
    player[key] = Math.max(0, player[key] - dt);
  });

  updatePlayerProgress();
  resolveKartContacts();
}

function updatePlayerProgress() {
  const player = game.player;
  const next = progressAt(player.x, player.y);
  const previous = player.progress;
  player.previousProgress = previous;
  player.progress = next;
  if (player.speed > 30) {
    [0.25, 0.5, 0.75].forEach((checkpoint, index) => {
      if (previous < checkpoint && next >= checkpoint && next - previous < 0.25) {
        player.checkpoints.add(index);
      }
    });
    checkKnowledgeGates(previous, next);
    if (previous > 0.82 && next < 0.18 && player.checkpoints.size === 3) {
      player.lap += 1;
      player.checkpoints.clear();
      if (player.lap > LAPS_TO_WIN) {
        finishRace();
      } else {
        announce(`第 ${player.lap} 圈！`);
      }
    }
  }
}

function checkKnowledgeGates(previous, next) {
  if (next < previous || next - previous > 0.2) return;
  const lapIndex = game.player.lap - 1;
  for (let index = 0; index < GATES.length; index += 1) {
    const gate = GATES[index];
    const key = `${lapIndex}-${index}`;
    if (!game.usedGates.has(key) && previous < gate && next >= gate) {
      game.usedGates.add(key);
      openQuiz();
      break;
    }
  }
}

function updateOpponents(dt) {
  game.opponents.forEach((opponent, index) => {
    if (opponent.finished) return;
    const wave = Math.sin(game.elapsed * 0.8 + opponent.wobble) * 13;
    const target = opponent.baseSpeed + wave;
    opponent.speed += (target - opponent.speed) * dt * 1.2;
    opponent.totalProgress += opponent.speed * dt / 3270;
    if (opponent.totalProgress >= LAPS_TO_WIN) {
      opponent.finished = true;
      opponent.totalProgress = LAPS_TO_WIN;
    }
    const localProgress = normalizeAngle(opponent.totalProgress * TAU) / TAU;
    const point = pointAtProgress(localProgress, opponent.lane + Math.sin(game.elapsed + index) * 4);
    opponent.x = point.x;
    opponent.y = point.y;
    opponent.angle = point.angle;
  });
}

function resolveKartContacts() {
  const player = game.player;
  game.opponents.forEach((opponent) => {
    const dx = player.x - opponent.x;
    const dy = player.y - opponent.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 0 && distance < 38) {
      const push = (38 - distance) * 0.65;
      player.x += (dx / distance) * push;
      player.y += (dy / distance) * push;
      player.speed *= 0.94;
    }
  });
}

function emitParticle(player, color, strength) {
  particles.push({
    x: player.x - Math.cos(player.angle) * 24,
    y: player.y - Math.sin(player.angle) * 24,
    vx: -Math.cos(player.angle) * 45 + (Math.random() - 0.5) * 30,
    vy: -Math.sin(player.angle) * 45 + (Math.random() - 0.5) * 30,
    life: .55,
    maxLife: .55,
    size: 5 * strength,
    color,
  });
}

function updateParticles(dt) {
  for (let index = particles.length - 1; index >= 0; index -= 1) {
    const particle = particles[index];
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    if (particle.life <= 0) particles.splice(index, 1);
  }
}

function getPlayerTotalProgress() {
  return game.player.lap - 1 + game.player.progress;
}

function getPosition() {
  const total = getPlayerTotalProgress();
  return 1 + game.opponents.filter((opponent) => opponent.totalProgress > total).length;
}

function nextQuestion() {
  if (!game.questionDeck.length || game.questionCursor >= game.questionDeck.length) {
    game.questionDeck = shuffle(AI_QUESTIONS.map((_, index) => index));
    game.questionCursor = 0;
  }
  const question = AI_QUESTIONS[game.questionDeck[game.questionCursor]];
  game.questionCursor += 1;
  return question;
}

function openQuiz() {
  if (game.mode !== "racing") return;
  game.mode = "quiz";
  resetInput();
  game.player.speed *= .58;
  const question = nextQuestion();
  const order = shuffle(question.options.map((_, index) => index));
  activeQuestion = { question, order, answered: false, pendingEffect: null };
  els.questionDomain.textContent = question.domain;
  els.questionStem.textContent = question.stem;
  els.feedback.hidden = true;
  els.feedback.className = "answer-feedback";
  els.feedback.innerHTML = "";
  els.quizContinue.hidden = true;
  els.answers.innerHTML = "";
  order.forEach((optionIndex, displayIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.innerHTML = `<span class="answer-letter">${LETTERS[displayIndex]}</span><span>${question.options[optionIndex]}</span>`;
    button.addEventListener("click", () => answerQuestion(optionIndex, button));
    els.answers.appendChild(button);
  });
  showOverlay(els.quiz, true);
}

function answerQuestion(optionIndex, selectedButton) {
  if (!activeQuestion || activeQuestion.answered) return;
  activeQuestion.answered = true;
  game.answered += 1;
  const correct = optionIndex === activeQuestion.question.answer;
  if (correct) game.correct += 1;
  const buttons = [...els.answers.children];
  buttons.forEach((button, displayIndex) => {
    button.disabled = true;
    const originalIndex = activeQuestion.order[displayIndex];
    if (originalIndex === activeQuestion.question.answer) button.classList.add("is-correct");
  });
  if (!correct) selectedButton.classList.add("is-wrong");

  const effect = correct ? choosePositiveEffect() : chooseNegativeEffect();
  activeQuestion.pendingEffect = effect;
  els.feedback.hidden = false;
  els.feedback.classList.add(correct ? "correct" : "wrong");
  els.feedback.innerHTML = `
    <strong>${correct ? `回答正确 · ${effect.icon} ${effect.name}` : `回答错误 · ${effect.icon} ${effect.name}`}</strong>
    <span>${activeQuestion.question.explain}</span>`;
  els.quizContinue.textContent = correct
    ? `领取“${effect.name}”并继续`
    : `承受“${effect.name}”并继续`;
  els.quizContinue.hidden = false;
}

function choosePositiveEffect() {
  const effects = [
    { id: "turbo", name: "知识涡轮", icon: "🚀", description: "高速喷射 3.5 秒" },
    { id: "shield", name: "事实护盾", icon: "🛡️", description: "抵消下一次负面道具" },
    { id: "focus", name: "专注引擎", icon: "⚡", description: "加速与极速提升 7 秒" },
  ];
  return effects[Math.floor(Math.random() * effects.length)];
}

function chooseNegativeEffect() {
  if (game.player.shield) {
    return { id: "blocked", name: "护盾成功抵消", icon: "🛡️", description: "事实护盾挡住了负面效果" };
  }
  const effects = [
    { id: "slow", name: "信息迷雾", icon: "🌫️", description: "极速降低 4.5 秒" },
    { id: "invert", name: "偏差干扰", icon: "↔️", description: "左右方向颠倒 5 秒" },
    { id: "spin", name: "过载旋转", icon: "🌀", description: "赛车短暂失控旋转" },
  ];
  return effects[Math.floor(Math.random() * effects.length)];
}

function applyEffect(effect) {
  const player = game.player;
  if (effect.id === "turbo") {
    player.boostTimer = Math.max(player.boostTimer, 3.5);
    player.speed = Math.max(player.speed, 390);
  } else if (effect.id === "shield") {
    player.shield = true;
  } else if (effect.id === "focus") {
    player.focusTimer = Math.max(player.focusTimer, 7);
  } else if (effect.id === "slow") {
    player.slowTimer = Math.max(player.slowTimer, 4.5);
    player.speed *= .45;
  } else if (effect.id === "invert") {
    player.invertTimer = Math.max(player.invertTimer, 5);
  } else if (effect.id === "spin") {
    player.spinTimer = Math.max(player.spinTimer, 1.3);
    player.speed *= .62;
  } else if (effect.id === "blocked") {
    player.shield = false;
  }
  announce(`${effect.icon} ${effect.name}：${effect.description}`, 2200);
}

function continueFromQuiz() {
  if (!activeQuestion?.answered) return;
  applyEffect(activeQuestion.pendingEffect);
  activeQuestion = null;
  showOverlay(els.quiz, false);
  game.mode = "racing";
}

function finishRace() {
  if (game.mode === "finished") return;
  game.mode = "finished";
  resetInput();
  game.finalPosition = getPosition();
  const won = game.finalPosition === 1;
  els.finishIcon.textContent = won ? "🏆" : game.finalPosition <= 3 ? "🏅" : "🏁";
  els.finishTitle.textContent = won ? "冠军冲线！" : "比赛完成！";
  els.finishSummary.textContent = won
    ? "你用速度与 AI 素养赢得了本场大奖赛。"
    : "完成比赛！继续练习漂移与 AI 素养题，向冠军发起挑战。";
  els.finishPosition.textContent = `${game.finalPosition} / ${RACER_COUNT}`;
  els.finishTime.textContent = formatTime(game.elapsed);
  els.finishAnswers.textContent = `${game.correct} / ${game.answered}`;
  showOverlay(els.finishScreen, true);
}

function activeEffect() {
  const player = game.player;
  if (player.boostTimer > 0) return { name: "知识涡轮", icon: "🚀", type: "positive" };
  if (player.focusTimer > 0) return { name: "专注引擎", icon: "⚡", type: "positive" };
  if (player.shield) return { name: "事实护盾", icon: "🛡️", type: "positive" };
  if (player.slowTimer > 0) return { name: "信息迷雾", icon: "🌫️", type: "negative" };
  if (player.invertTimer > 0) return { name: "偏差干扰", icon: "↔️", type: "negative" };
  if (player.spinTimer > 0) return { name: "过载旋转", icon: "🌀", type: "negative" };
  if (game.player.drifting) return { name: "漂移蓄力", icon: "💨", type: "positive" };
  return { name: "等待知识门", icon: "◇", type: "" };
}

function updateHud() {
  const position = game.finalPosition || getPosition();
  els.position.textContent = String(position);
  els.lap.textContent = `${Math.min(game.player.lap, LAPS_TO_WIN)} / ${LAPS_TO_WIN}`;
  els.timer.textContent = formatTime(game.elapsed);
  const displayedSpeed = Math.max(0, Math.round(game.player.speed * .82));
  els.speed.textContent = String(displayedSpeed);
  els.speedFill.style.width = `${clamp(displayedSpeed / 420 * 100, 0, 100)}%`;
  const effect = activeEffect();
  els.effectIcon.textContent = effect.icon;
  els.effectName.textContent = effect.name;
  els.effectPanel.classList.toggle("is-positive", effect.type === "positive");
  els.effectPanel.classList.toggle("is-negative", effect.type === "negative");
}

function resizeCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
}

function viewTransform() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const portrait = width / height < 1.08;
  if (portrait) {
    const scale = Math.max(width / 720, height / 820);
    return {
      scale,
      x: width / 2 - game.player.x * scale,
      y: height / 2 - game.player.y * scale,
    };
  }
  const scale = Math.min(width / WORLD.width, height / WORLD.height);
  return {
    scale,
    x: (width - WORLD.width * scale) / 2,
    y: (height - WORLD.height * scale) / 2,
  };
}

function render() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const sky = ctx.createLinearGradient(0, 0, 0, cssHeight);
  sky.addColorStop(0, "#5ac0df");
  sky.addColorStop(1, "#77c96f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const view = viewTransform();
  ctx.setTransform(dpr * view.scale, 0, 0, dpr * view.scale, dpr * view.x, dpr * view.y);
  drawWorld();
}

function drawWorld() {
  ctx.fillStyle = "#6bc86f";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  drawGrassPattern();
  scenery.forEach(drawTree);

  ctx.save();
  ctx.translate(WORLD.cx, WORLD.cy);
  ctx.fillStyle = "#313d49";
  ctx.beginPath();
  ctx.ellipse(0, 0, WORLD.rx + 112, WORLD.ry + 112, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#5fbf68";
  ctx.beginPath();
  ctx.ellipse(0, 0, WORLD.rx - 112, WORLD.ry - 112, 0, 0, TAU);
  ctx.fill();

  ctx.setLineDash([26, 22]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255,255,255,.42)";
  ctx.beginPath();
  ctx.ellipse(0, 0, WORLD.rx, WORLD.ry, 0, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  drawCurb(WORLD.rx + 108, WORLD.ry + 108);
  drawCurb(WORLD.rx - 108, WORLD.ry - 108);
  ctx.restore();

  drawInfield();
  GATES.forEach((gate, index) => drawGate(gate, index));
  drawFinishLine();

  particles.forEach(drawParticle);
  game.opponents.forEach((opponent, index) => drawKart(opponent, false, index));
  drawKart(game.player, true, 0);
}

function drawGrassPattern() {
  ctx.save();
  ctx.globalAlpha = .14;
  ctx.strokeStyle = "#2d9450";
  ctx.lineWidth = 2;
  for (let x = -WORLD.height; x < WORLD.width; x += 55) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + WORLD.height, WORLD.height);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTree(tree) {
  ctx.save();
  ctx.translate(tree.x, tree.y);
  ctx.fillStyle = "rgba(0,0,0,.15)";
  ctx.beginPath();
  ctx.ellipse(5, 8, tree.size, tree.size * .55, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#785233";
  ctx.fillRect(-3, 2, 6, tree.size);
  ctx.fillStyle = `hsl(${tree.hue} 52% 38%)`;
  ctx.beginPath();
  ctx.arc(0, 0, tree.size, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `hsl(${tree.hue} 58% 48%)`;
  ctx.beginPath();
  ctx.arc(-tree.size * .25, -tree.size * .25, tree.size * .62, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawCurb(rx, ry) {
  ctx.lineWidth = 13;
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([32, 32]);
  ctx.strokeStyle = "#ef4545";
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawInfield() {
  ctx.save();
  ctx.translate(WORLD.cx, WORLD.cy);
  const gradient = ctx.createRadialGradient(0, -30, 20, 0, 0, 420);
  gradient.addColorStop(0, "#8dde8a");
  gradient.addColorStop(1, "#4eae60");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, WORLD.rx - 125, WORLD.ry - 125, 0, 0, TAU);
  ctx.fill();
  ctx.rotate(-.08);
  ctx.fillStyle = "rgba(9,37,52,.78)";
  roundRect(ctx, -240, -92, 480, 184, 28);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#fff";
  ctx.stroke();
  ctx.fillStyle = "#ffd338";
  ctx.font = "900 54px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("AI SPEEDWAY", 0, -12);
  ctx.fillStyle = "#d7f4ff";
  ctx.font = "700 23px Fredoka, sans-serif";
  ctx.fillText("KNOWLEDGE POWERS THE RACE", 0, 34);
  ctx.restore();
}

function drawGate(progress, index) {
  const point = pointAtProgress(progress);
  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(point.angle + Math.PI / 2);
  ctx.shadowColor = "#35d9f1";
  ctx.shadowBlur = 16;
  ctx.strokeStyle = "rgba(53,217,241,.88)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-94, 0);
  ctx.lineTo(94, 0);
  ctx.stroke();
  ctx.shadowBlur = 0;
  for (let x = -76; x <= 76; x += 38) {
    ctx.fillStyle = (x / 38 + index) % 2 === 0 ? "#35d9f1" : "#8c63e9";
    ctx.fillRect(x - 13, -10, 26, 20);
  }
  ctx.fillStyle = "white";
  ctx.font = "900 25px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("?", 0, 8);
  ctx.restore();
}

function drawFinishLine() {
  const point = pointAtProgress(0);
  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(point.angle + Math.PI / 2);
  const size = 18;
  for (let row = -5; row < 5; row += 1) {
    for (let column = -1; column <= 1; column += 1) {
      ctx.fillStyle = (row + column) % 2 === 0 ? "#fff" : "#111";
      ctx.fillRect(row * size, column * size, size, size);
    }
  }
  ctx.restore();
}

function drawKart(racer, isPlayer, index) {
  ctx.save();
  ctx.translate(racer.x, racer.y);
  ctx.rotate(racer.angle);
  const boost = isPlayer && racer.boostTimer > 0;
  if (boost) {
    ctx.fillStyle = "#5ff2ff";
    ctx.beginPath();
    ctx.moveTo(-25, -8);
    ctx.lineTo(-52 - Math.random() * 12, 0);
    ctx.lineTo(-25, 8);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.beginPath();
  ctx.ellipse(3, 7, 31, 18, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#111923";
  ctx.fillRect(-21, -22, 12, 9);
  ctx.fillRect(11, -22, 12, 9);
  ctx.fillRect(-21, 13, 12, 9);
  ctx.fillRect(11, 13, 12, 9);
  ctx.fillStyle = racer.color;
  roundRect(ctx, -25, -17, 50, 34, 11);
  ctx.fill();
  ctx.lineWidth = isPlayer ? 4 : 2;
  ctx.strokeStyle = isPlayer ? "#fff" : "rgba(255,255,255,.7)";
  ctx.stroke();
  ctx.fillStyle = "#162d43";
  roundRect(ctx, -8, -12, 20, 24, 7);
  ctx.fill();
  ctx.fillStyle = isPlayer ? "#fff2b1" : "#fff";
  ctx.beginPath();
  ctx.arc(2, -2, 8, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#14273a";
  ctx.font = "900 9px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(isPlayer ? "YOU" : String(index + 2), 2, 1);
  if (isPlayer && racer.shield) {
    ctx.strokeStyle = "rgba(85,226,255,.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 37, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function roundRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawParticle(particle) {
  ctx.save();
  ctx.globalAlpha = particle.life / particle.maxLife;
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size * (particle.life / particle.maxLife), 0, TAU);
  ctx.fill();
  ctx.restore();
}

function frame(now) {
  const dt = Math.min(.035, (now - lastFrame) / 1000);
  lastFrame = now;
  if (game.mode === "racing") {
    game.elapsed += dt;
    updatePlayer(dt);
    updateOpponents(dt);
  }
  updateParticles(dt);
  updateHud();
  render();
  requestAnimationFrame(frame);
}

const keyMap = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "gas",
  KeyW: "gas",
  ArrowDown: "brake",
  KeyS: "brake",
  Space: "drift",
};

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyP" || event.code === "Escape") {
    event.preventDefault();
    if (game.mode === "racing") togglePause(true);
    else if (game.mode === "paused") togglePause(false);
    return;
  }
  const control = keyMap[event.code];
  if (!control) return;
  event.preventDefault();
  input[control] = true;
});

window.addEventListener("keyup", (event) => {
  const control = keyMap[event.code];
  if (!control) return;
  event.preventDefault();
  input[control] = false;
});

window.addEventListener("blur", () => {
  if (game.mode === "racing") togglePause(true);
  resetInput();
});

document.querySelectorAll("[data-control]").forEach((button) => {
  const control = button.dataset.control;
  const press = (event) => {
    event.preventDefault();
    input[control] = true;
    button.classList.add("is-held");
    button.setPointerCapture?.(event.pointerId);
  };
  const release = (event) => {
    event.preventDefault();
    input[control] = false;
    button.classList.remove("is-held");
  };
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
});

els.start.addEventListener("click", startRace);
els.pause.addEventListener("click", () => togglePause(true));
els.resume.addEventListener("click", () => togglePause(false));
els.restart.addEventListener("click", startRace);
els.playAgain.addEventListener("click", startRace);
els.quizContinue.addEventListener("click", continueFromQuiz);
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
updateOpponents(0);
updateHud();
render();
requestAnimationFrame(frame);
