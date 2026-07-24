/**
 * 云城冲刺 — 长路径透视 / 弯道转向 / 路上吃金币
 * 答对：连吃 20 金币；答错：桥断坠落再爬起（扣命）
 */
import { AI_QUESTIONS } from "/monopoly/questions.js";

const MAX_LIVES = 3;
const COIN_BURST = 20;
const QUIZ_TIME = 10;
const HOME_LANE = 1;
/** 路径远裁：越大越有延伸感 */
const FAR_Z = 3800;
const RUNNER_Z = 95;
/** 金币磁吸 / 拾取距离（世界 z） */
const COIN_MAGNET_Z = 320;
const COIN_PICK_Z = 120;

const els = {
  menu: document.getElementById("screen-menu"),
  play: document.getElementById("screen-play"),
  over: document.getElementById("screen-over"),
  canvas: document.getElementById("game"),
  start: document.getElementById("start-btn"),
  retry: document.getElementById("retry-btn"),
  pause: document.getElementById("pause-btn"),
  score: document.getElementById("hud-score"),
  dist: document.getElementById("hud-dist"),
  coins: document.getElementById("hud-coins"),
  lives: document.getElementById("hud-lives"),
  missionCoins: document.getElementById("m-coins"),
  missionDist: document.getElementById("m-dist"),
  missionQuiz: document.getElementById("m-quiz"),
  swipeHint: document.getElementById("swipe-hint"),
  quizBanner: document.getElementById("quiz-banner"),
  quizDomain: document.getElementById("quiz-domain"),
  quizStem: document.getElementById("quiz-stem"),
  laneKeys: document.getElementById("lane-keys"),
  quizTimer: document.getElementById("quiz-timer"),
  toast: document.getElementById("toast"),
  overScore: document.getElementById("over-score"),
  overDist: document.getElementById("over-dist"),
  overCoins: document.getElementById("over-coins"),
  overQuiz: document.getElementById("over-quiz"),
  overMsg: document.getElementById("over-msg"),
};

const ctx = els.canvas.getContext("2d");

/** 像素缓冲：低分辨率最近邻放大 */
const GW = 400;
const GH = 225;
const buffer = document.createElement("canvas");
buffer.width = GW;
buffer.height = GH;
const bctx = buffer.getContext("2d");
bctx.imageSmoothingEnabled = false;

const PX = {
  ink: "#1a1c2c",
  paper: "#f4f0e8",
  gold: "#ffd541",
  goldDk: "#e39d18",
  goldLt: "#ffe9a0",
  cyan: "#41a6f6",
  sky: "#3cbcfc",
  sky2: "#94e4fc",
  green: "#38b764",
  red: "#e43b44",
  violet: "#b55088",
  road1: "#c0cbdc",
  road2: "#8b9bb4",
  roadGold1: "#ffe9a0",
  roadGold2: "#e39d18",
  white: "#ffffff",
  navy: "#29366f",
  abyss: "#0f1020",
};

function px(n) {
  return Math.round(n);
}

function rect(x, y, w, h, color) {
  bctx.fillStyle = color;
  bctx.fillRect(px(x), px(y), Math.max(1, px(w)), Math.max(1, px(h)));
}

function spawnCoinFx(x, y, big = false) {
  const n = big ? 18 : 10;
  for (let i = 0; i < n; i += 1) {
    const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const spd = (big ? 110 : 65) + Math.random() * 80;
    state.fx.push({
      kind: "spark",
      x,
      y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 50,
      life: 0.45 + Math.random() * 0.4,
      color: i % 3 === 0 ? PX.goldLt : i % 3 === 1 ? PX.gold : PX.goldDk,
      size: big ? 3 : 2,
    });
  }
  const bits = big ? 8 : 4;
  for (let i = 0; i < bits; i += 1) {
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const spd = 40 + Math.random() * (big ? 120 : 70);
    state.fx.push({
      kind: "coinbit",
      x,
      y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 30,
      life: 0.55 + Math.random() * 0.35,
      spin: Math.random() * 8,
    });
  }
  state.fx.push({
    kind: "ring",
    x,
    y,
    life: 0.4,
    max: 0.4,
    color: PX.gold,
  });
  if (big) {
    state.fx.push({
      kind: "ring",
      x,
      y,
      life: 0.55,
      max: 0.55,
      color: PX.goldLt,
    });
    state.fx.push({
      kind: "flash",
      life: 0.22,
      max: 0.22,
    });
  }
}

/** 实在「吃到」：吸入环 + 飞向右上角金币栏 */
function spawnEatCoinFx(x, y, big = false) {
  state.fx.push({
    kind: "suck",
    x,
    y,
    life: 0.28,
    max: 0.28,
  });
  state.fx.push({
    kind: "trail",
    x,
    y,
    tx: GW - 28,
    ty: 18,
    life: 0.5,
    max: 0.5,
  });
  // 贴地金屑
  for (let i = 0; i < (big ? 10 : 5); i += 1) {
    state.fx.push({
      kind: "spark",
      x: x + (Math.random() - 0.5) * 8,
      y: y + 2,
      vx: (Math.random() - 0.5) * 50,
      vy: -20 - Math.random() * 40,
      life: 0.35 + Math.random() * 0.2,
      color: i % 2 ? PX.gold : PX.goldLt,
      size: 2,
    });
  }
  spawnCoinFx(x, y, big);
}

function spawnCoinRain(count = 24) {
  for (let i = 0; i < count; i += 1) {
    state.fx.push({
      kind: "coinbit",
      x: GW * 0.2 + Math.random() * GW * 0.6,
      y: GH * 0.15 + Math.random() * 20,
      vx: (Math.random() - 0.5) * 60,
      vy: 40 + Math.random() * 90,
      life: 0.8 + Math.random() * 0.5,
      spin: Math.random() * 10,
    });
  }
}

function spawnCoinPopup(text) {
  state.fx.push({
    kind: "text",
    x: GW / 2,
    y: GH * 0.38,
    vy: -28,
    life: 0.8,
    text,
    color: PX.gold,
  });
}

const state = {
  running: false,
  paused: false,
  over: false,
  t: 0,
  last: 0,
  lane: HOME_LANE,
  targetLane: HOME_LANE,
  laneX: 0,
  speed: 420,
  distance: 0,
  score: 0,
  coins: 0,
  lives: MAX_LIVES,
  invuln: 0,
  quizCorrect: 0,
  burstCollected: 0,
  burstActive: false,
  burstDoneToast: false,
  nextQuizAt: 40,
  entities: [],
  popups: [],
  debris: [],
  fx: [],
  activeQuiz: null,
  awaitingAnswer: false,
  quizTimeLeft: 0,
  returnHomeAt: 0,
  shake: 0,
  bob: 0,
  camBank: 0,
  camBankTarget: 0,
  camPitch: 0,
  /** 道路弯折：-1 左弯 / +1 右弯，让换道像拐进那条路 */
  pathBend: 0,
  pathBendTarget: 0,
  turnBoost: 0,
  scroll: 0,
  fall: null, // { phase, t, lane, lifeTaken }
  runnerFallY: 0,
  gapOpen: 0,
  questionBag: [],
};

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add("is-on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove("is-on"), 1700);
}

function show(screen) {
  [els.menu, els.play, els.over].forEach((n) => n.classList.toggle("is-on", n === screen));
}

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  els.canvas.width = Math.floor(w * dpr);
  els.canvas.height = Math.floor(h * dpr);
  els.canvas.style.width = `${w}px`;
  els.canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
}

function laneToX(lane, w = GW) {
  const mid = w / 2 + state.camBank * w * 0.08 + state.pathBend * w * 0.05;
  const spread = Math.min(78, w * 0.22);
  return mid + (lane - 1) * spread;
}

function nextQuestion() {
  if (!state.questionBag.length) state.questionBag = shuffle(AI_QUESTIONS);
  return state.questionBag.pop();
}

function makeQuizGate(z) {
  const q = nextQuestion();
  const correct = q.answer;
  const others = q.options.map((_, i) => i).filter((i) => i !== correct);
  const picks = shuffle([correct, ...shuffle(others).slice(0, 2)]);
  while (picks.length < 3) picks.push(others[picks.length % others.length] ?? 0);
  return {
    type: "quiz",
    z,
    resolved: false,
    question: q,
    laneOptions: picks,
    correctLane: picks.indexOf(correct),
  };
}

function spawnCoinBurst(lane) {
  state.burstCollected = 0;
  state.burstActive = true;
  state.burstDoneToast = false;
  // 金币排在正道前方路面上，间距拉开，一路看得见
  for (let i = 0; i < COIN_BURST; i += 1) {
    state.entities.push({
      type: "coin",
      lane,
      z: 260 + i * 85,
      burst: true,
      taken: false,
      sucking: false,
      suckT: 0,
      sx: 0,
      sy: 0,
    });
  }
}

function addPopup(text, color = "#ffd166") {
  state.popups.push({ text, color, life: 1, y: 0 });
}

function startBridgeFall(lane) {
  state.fall = { phase: "crack", t: 0, lane, lifeTaken: false };
  state.targetLane = lane;
  state.camBankTarget = (lane - 1) * 0.9;
  state.gapOpen = 0;
  state.runnerFallY = 0;
  state.debris = [];
  for (let i = 0; i < 14; i += 1) {
    state.debris.push({
      lane: lane + (Math.random() - 0.5) * 0.4,
      z: 60 + Math.random() * 80,
      vx: (Math.random() - 0.5) * 180,
      vy: 40 + Math.random() * 80,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 8,
      size: 10 + Math.random() * 18,
      life: 1.6 + Math.random(),
    });
  }
  state.shake = 16;
  toast("答错！桥面断裂！");
  addPopup("桥断了！", "#ff5a7a");
  els.quizTimer.textContent = "桥面崩塌…";
}

function paintLives() {
  els.lives.innerHTML = Array.from({ length: MAX_LIVES }, (_, i) => {
    return `<i class="${i < state.lives ? "on" : ""}"></i>`;
  }).join("");
}

function updateHud() {
  els.score.textContent = Math.floor(state.score).toLocaleString();
  els.dist.textContent = `${Math.floor(state.distance)} M`;
  els.coins.textContent = String(state.coins);
  paintLives();
  els.missionCoins.textContent = state.burstActive
    ? `连吃爽感 ${state.burstCollected} / ${COIN_BURST}`
    : `本轮连吃 ${state.burstCollected} / ${COIN_BURST}`;
  els.missionDist.textContent = `奔跑距离 ${Math.min(Math.floor(state.distance), 1000)} / 1000m`;
  els.missionQuiz.textContent = `答对知识门 ${state.quizCorrect}`;
}

function setQuizBanner(quiz) {
  if (!quiz) {
    els.quizBanner.hidden = true;
    els.laneKeys.innerHTML = "";
    return;
  }
  els.quizBanner.hidden = false;
  els.quizDomain.textContent = quiz.question.domain;
  els.quizStem.textContent = quiz.question.stem;
  els.quizTimer.textContent = `请点选答案 · 剩余 ${Math.ceil(state.quizTimeLeft)}s`;
  els.laneKeys.innerHTML = "";
  quiz.laneOptions.forEach((optIdx, lane) => {
    const label = ["A · 左", "B · 中", "C · 右"][lane];
    const text = quiz.question.options[optIdx];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `l${lane}`;
    btn.innerHTML = `<b>${label}</b>${text}`;
    btn.addEventListener("click", () => answerQuiz(lane));
    els.laneKeys.appendChild(btn);
  });
}

function answerQuiz(chosenLane) {
  const quiz = state.activeQuiz;
  if (!quiz || quiz.resolved || !state.awaitingAnswer) return;
  [...els.laneKeys.querySelectorAll("button")].forEach((b) => {
    b.disabled = true;
  });
  resolveQuiz(quiz, chosenLane, false);
}

function resetGame() {
  Object.assign(state, {
    running: true,
    paused: false,
    over: false,
    t: 0,
    last: performance.now(),
    lane: HOME_LANE,
    targetLane: HOME_LANE,
    laneX: 0,
    speed: 420,
    distance: 0,
    score: 0,
    coins: 0,
    lives: MAX_LIVES,
    invuln: 0,
    quizCorrect: 0,
    burstCollected: 0,
    burstActive: false,
    burstDoneToast: false,
    nextQuizAt: 35,
    entities: [],
    popups: [],
    debris: [],
    fx: [],
    activeQuiz: null,
    awaitingAnswer: false,
    quizTimeLeft: 0,
    returnHomeAt: 0,
    shake: 0,
    bob: 0,
    camBank: 0,
    camBankTarget: 0,
    camPitch: 0,
    pathBend: 0,
    pathBendTarget: 0,
    turnBoost: 0,
    scroll: 0,
    fall: null,
    runnerFallY: 0,
    gapOpen: 0,
    questionBag: shuffle(AI_QUESTIONS),
  });
  setQuizBanner(null);
  updateHud();
  els.swipeHint.classList.remove("is-hide");
  setTimeout(() => els.swipeHint.classList.add("is-hide"), 4000);
  show(els.play);
  requestAnimationFrame(loop);
}

function endGame(reason) {
  state.running = false;
  state.over = true;
  state.awaitingAnswer = false;
  state.fall = null;
  els.overScore.textContent = Math.floor(state.score).toLocaleString();
  els.overDist.textContent = `${Math.floor(state.distance)} M`;
  els.overCoins.textContent = String(state.coins);
  els.overQuiz.textContent = String(state.quizCorrect);
  els.overMsg.textContent = reason;
  setQuizBanner(null);
  show(els.over);
}

function finishBurst() {
  if (state.burstDoneToast) return;
  state.burstDoneToast = true;
  state.burstActive = false;
  if (state.burstCollected < COIN_BURST) {
    const miss = COIN_BURST - state.burstCollected;
    state.coins += miss;
    state.score += miss * 50;
    state.burstCollected = COIN_BURST;
  }
  state.score += 500;
  toast(`完美连吃 ×${COIN_BURST}！`);
  addPopup("PERFECT ×20", PX.gold);
  spawnCoinFx(GW / 2, GH * 0.45, true);
  spawnCoinFx(GW / 2 - 30, GH * 0.5, true);
  spawnCoinFx(GW / 2 + 30, GH * 0.5, true);
  spawnCoinRain(28);
  spawnCoinPopup("×20 COMBO!");
  state.fx.push({ kind: "flash", life: 0.32, max: 0.32 });
  state.returnHomeAt = state.t + 1.4;
  state.pathBendTarget = 0;
  state.turnBoost = Math.max(state.turnBoost, 0.35);
  updateHud();
}

function resolveQuiz(quiz, chosenLane, timedOut) {
  if (quiz.resolved) return;
  quiz.resolved = true;
  state.awaitingAnswer = false;
  const correct = !timedOut && chosenLane === quiz.correctLane;
  state.entities = state.entities.filter((e) => e.type === "quiz");

  if (correct) {
    state.targetLane = quiz.correctLane;
    state.pathBendTarget = (quiz.correctLane - 1) * 0.72;
    state.camBankTarget = (quiz.correctLane - 1) * 0.68;
    state.turnBoost = 1;
    state.quizCorrect += 1;
    state.score += 1000;
    state.speed = Math.min(600, state.speed + 32);
    spawnCoinBurst(quiz.correctLane);
    state.returnHomeAt = state.t + 6.2;
    toast(`答对！拐进${quiz.correctLane === 0 ? "左" : quiz.correctLane === 2 ? "右" : "中"}道，连吃 ${COIN_BURST} 金币`);
    els.quizTimer.textContent = "答对！金币冲刺中…";
    addPopup(quiz.correctLane === 0 ? "← 拐入左道" : quiz.correctLane === 2 ? "拐入右道 →" : "直行正道", "#2fd0ff");
  } else {
    const failLane = timedOut ? HOME_LANE : chosenLane;
    startBridgeFall(failLane);
  }

  state.activeQuiz = null;
  setTimeout(() => setQuizBanner(null), 700);
  updateHud();
}

function updateFall(dt) {
  const f = state.fall;
  if (!f) return false;
  f.t += dt;

  if (f.phase === "crack") {
    state.gapOpen = Math.min(1, f.t / 0.35);
    state.shake = 18;
    state.camPitch = -0.08;
    if (f.t > 0.35) {
      f.phase = "falling";
      f.t = 0;
    }
    return true;
  }

  if (f.phase === "falling") {
    state.gapOpen = 1;
    state.runnerFallY += 520 * dt;
    state.camPitch = -0.22;
    state.shake = 10;
    if (!f.lifeTaken && f.t > 0.25) {
      f.lifeTaken = true;
      state.lives -= 1;
      state.invuln = 2;
      updateHud();
      toast("坠落！-1 生命");
      addPopup("-1 生命", "#ff5a7a");
      if (state.lives <= 0) {
        endGame("从断裂的桥上坠落…");
        return true;
      }
    }
    if (f.t > 1.05) {
      f.phase = "rising";
      f.t = 0;
      toast("抓住桥缘，重新上来！");
    }
    return true;
  }

  if (f.phase === "rising") {
    state.runnerFallY = Math.max(0, state.runnerFallY - 620 * dt);
    state.gapOpen = Math.max(0, 1 - f.t / 0.9);
    state.camPitch += (0 - state.camPitch) * Math.min(1, dt * 4);
    if (f.t > 0.95 && state.runnerFallY <= 2) {
      state.runnerFallY = 0;
      state.gapOpen = 0;
      state.fall = null;
      state.targetLane = HOME_LANE;
      state.camBankTarget = 0;
      state.returnHomeAt = state.t + 0.4;
      addPopup("继续冲刺！", "#7dffb0");
    }
    return true;
  }

  return true;
}

function update(dt) {
  if (!state.running || state.paused || state.over) return;
  state.t += dt;
  state.bob += dt * (10 + state.speed * 0.012);
  state.invuln = Math.max(0, state.invuln - dt);
  state.shake = Math.max(0, state.shake - dt * 18);

  state.popups = state.popups
    .map((p) => ({ ...p, life: p.life - dt, y: p.y - dt * 48 }))
    .filter((p) => p.life > 0);

  state.debris = state.debris
    .map((d) => ({
      ...d,
      z: d.z - 40 * dt,
      vy: d.vy + 520 * dt,
      y: (d.y || 0) + d.vy * dt,
      x: (d.x || 0) + d.vx * dt,
      rot: d.rot + d.spin * dt,
      life: d.life - dt,
    }))
    .filter((d) => d.life > 0);

  // 转向：银行角 + 道路弯折（幅度克制，保持透视梯形）
  state.camBankTarget = (state.targetLane - 1) * (0.58 + state.turnBoost * 0.22);
  if (state.fall) state.camBankTarget = (state.fall.lane - 1) * 0.7;
  state.pathBendTarget = (state.targetLane - 1) * (0.55 + state.turnBoost * 0.28);
  if (state.fall) state.pathBendTarget = (state.fall.lane - 1) * 0.75;
  state.camBank += (state.camBankTarget - state.camBank) * Math.min(1, dt * 3.8);
  state.pathBend += (state.pathBendTarget - state.pathBend) * Math.min(1, dt * 3.2);
  state.camBank = Math.max(-0.85, Math.min(0.85, state.camBank));
  state.pathBend = Math.max(-0.9, Math.min(0.9, state.pathBend));
  state.turnBoost = Math.max(0, state.turnBoost - dt * 0.45);

  if (state.returnHomeAt && state.t >= state.returnHomeAt && !state.awaitingAnswer && !state.burstActive && !state.fall) {
    state.targetLane = HOME_LANE;
    state.pathBendTarget = 0;
    state.returnHomeAt = 0;
  }

  const desired = laneToX(state.targetLane, GW);
  // 换道稍带惯性，配合弯道
  state.laneX += (desired - (state.laneX || desired)) * Math.min(1, dt * 5.2);
  state.lane = state.targetLane;

  // 金币/特效粒子
  state.fx = state.fx
    .map((p) => {
      const next = { ...p, life: p.life - dt };
      if (p.kind === "spark" || p.kind === "coinbit") {
        next.x += p.vx * dt;
        next.y += p.vy * dt;
        next.vy += (p.kind === "coinbit" ? 220 : 180) * dt;
        if (p.kind === "coinbit") next.spin = (p.spin || 0) + dt * 14;
      } else if (p.kind === "text") {
        next.y += (p.vy || -30) * dt;
      } else if (p.kind === "trail") {
        const u = 1 - next.life / p.max;
        const ease = u * u;
        next.x = p.x + (p.tx - p.x) * ease;
        next.y = p.y + (p.ty - p.y) * ease;
      }
      return next;
    })
    .filter((p) => p.life > 0);

  if (updateFall(dt)) {
    updateHud();
    return;
  }

  if (state.awaitingAnswer) {
    state.quizTimeLeft -= dt;
    if (els.quizTimer) {
      els.quizTimer.textContent = `请点选答案 · 剩余 ${Math.max(0, Math.ceil(state.quizTimeLeft))}s`;
    }
    if (state.quizTimeLeft <= 0 && state.activeQuiz) {
      resolveQuiz(state.activeQuiz, null, true);
      updateHud();
      return;
    }
    const slow = state.speed * 0.3;
    state.distance += slow * dt * 0.12;
    state.score += slow * dt * 0.05;
    state.scroll += slow * dt * 0.55;
    state.entities.forEach((e) => {
      e.z -= slow * dt;
    });
    state.camPitch += ((0.04 + Math.sin(state.t * 3) * 0.01) - state.camPitch) * dt * 3;
    updateHud();
    return;
  }

  const distGain = state.speed * dt;
  state.distance += distGain * 0.12;
  state.score += distGain * 0.08;
  state.scroll += distGain * 0.55;

  const runSpeed = state.burstActive ? state.speed * 1.32 : state.speed;
  const dz = runSpeed * dt;
  state.entities.forEach((e) => {
    if (e.type === "coin" && e.sucking) return;
    e.z -= dz;
  });

  // 前进俯仰：速度越快越有冲刺感
  const pitchTarget = state.burstActive ? 0.12 : 0.05 + (state.speed - 400) * 0.00028;
  state.camPitch += (pitchTarget - state.camPitch) * Math.min(1, dt * 4);

  if (!state.activeQuiz && !state.burstActive && state.distance >= state.nextQuizAt) {
    const quiz = makeQuizGate(1400);
    state.entities.push(quiz);
    state.activeQuiz = quiz;
    state.awaitingAnswer = true;
    state.quizTimeLeft = QUIZ_TIME;
    state.nextQuizAt = state.distance + 190 + Math.random() * 110;
    setQuizBanner(quiz);
  }

  state.entities.forEach((e) => {
    if (e.type !== "coin" || e.taken) return;
    const sameLane = e.lane === state.targetLane;

    // 磁吸：同道近处金币加速贴向角色
    if (sameLane && !e.sucking && e.z < COIN_MAGNET_Z && e.z > COIN_PICK_Z) {
      e.z -= dt * 200;
    }

    if (sameLane && e.z <= COIN_PICK_Z) {
      if (!e.sucking) {
        const cp = worldXY(e.lane, Math.max(40, e.z));
        e.sucking = true;
        e.suckT = 0;
        e.fx = cp.x + (e.sx || 0);
        e.fy = cp.y - 3 * cp.scale + (e.sy || 0);
      }
      e.suckT += dt;
      const rp = worldXY(state.targetLane, RUNNER_Z);
      const u = Math.min(1, e.suckT / 0.16);
      const ease = 1 - (1 - u) * (1 - u);
      e.drawX = e.fx + (rp.x - e.fx) * ease;
      e.drawY = e.fy + (rp.y - 12 - e.fy) * ease;
      e.drawScale = Math.max(0.2, 1 - ease * 0.75);

      if (u >= 1) {
        e.taken = true;
        state.coins += 1;
        state.score += 50;
        state.burstCollected += 1;
        const milestone = state.burstCollected % 5 === 0;
        spawnEatCoinFx(rp.x, rp.y - 10, milestone);
        if (milestone) {
          addPopup(`×${state.burstCollected}`, PX.gold);
          spawnCoinPopup(`+${state.burstCollected}`);
        } else {
          state.fx.push({
            kind: "text",
            x: rp.x + (Math.random() - 0.5) * 12,
            y: rp.y - 16,
            text: "+1",
            color: PX.goldLt,
            life: 0.55,
            vy: -45,
          });
        }
      }
    }
  });

  if (state.burstActive && state.burstCollected >= COIN_BURST) finishBurst();
  if (state.burstActive) {
    const left = state.entities.some((e) => e.type === "coin" && e.burst && !e.taken);
    if (!left) finishBurst();
  }

  state.entities = state.entities.filter(
    (e) => (e.sucking || e.z > -80) && !e.taken && !(e.type === "quiz" && e.resolved),
  );

  if (!state.burstActive) state.speed = Math.min(560, state.speed + dt * 2.2);
  updateHud();
}

/* ---------- draw helpers (pseudo-3D + 弯道) ---------- */

function worldXY(lane, z) {
  const w = GW;
  const h = GH;
  const bend = state.pathBend || 0;
  // 灭点轻移：路往目标道「拐」，但不拆掉透视
  const vanishX = w / 2 + state.camBank * w * 0.12 + bend * w * 0.04;
  const horizon = h * (0.22 - state.camPitch * 0.16);
  const depth = Math.max(0.006, Math.min(1, z / FAR_Z));
  // 近大远小更陡 → 路更长、更有延伸
  const perspective = 1 - Math.pow(depth, 0.62);
  const roadHalf = w * 0.48 * (0.08 + 0.92 * perspective);
  const laneSpread = roadHalf * 0.7;
  // 前方弯道：远处偏移更明显
  const curve = bend * Math.pow(1 - perspective, 1.4) * (w * 0.2);
  const x = vanishX + (lane - 1) * laneSpread * perspective + curve;
  const y = horizon + (h * 0.88 - horizon) * perspective + state.runnerFallY * 0.12 * perspective;
  const scale = 0.14 + 0.96 * perspective;
  return { x, y, scale, vanishX, horizon, roadHalf, perspective, curve };
}

function drawBackground() {
  const h = GH;
  const horizon = Math.floor(h * (0.22 - state.camPitch * 0.16));
  for (let y = 0; y < horizon; y += 1) {
    const t = y / Math.max(1, horizon);
    bctx.fillStyle = t < 0.4 ? PX.navy : t < 0.72 ? PX.sky : PX.sky2;
    bctx.fillRect(0, y, GW, 1);
  }
  rect(0, horizon, GW, h - horizon, state.gapOpen > 0.2 ? PX.abyss : PX.green);

  const sx = px(GW * 0.72 - state.camBank * 24 - state.pathBend * 12);
  const sy = px(h * 0.08);
  rect(sx - 7, sy - 7, 14, 14, PX.gold);
  rect(sx - 4, sy - 4, 8, 8, PX.goldLt);

  for (let i = 0; i < 5; i += 1) {
    const cx = px(((i * 90 + state.scroll * 0.1 + state.camBank * 36 + state.pathBend * 18) % (GW + 40)) - 20);
    const cy = 6 + (i % 3) * 6;
    rect(cx, cy, 16, 5, PX.white);
    rect(cx + 4, cy - 3, 10, 5, PX.white);
  }

  for (let i = 0; i < 14; i += 1) {
    const x = px((i / 14) * GW - state.camBank * 28 - state.pathBend * 16);
    const tw = 2 + (i % 3) * 2;
    const th = 8 + (i % 5) * 6;
    rect(x, horizon - th, tw, th, PX.paper);
    rect(x + 1, horizon - th + 2, Math.max(1, tw - 2), 1, PX.cyan);
  }
}

function drawRoad() {
  const segLen = 36;
  const segs = 58;
  const scrollSeg = state.scroll % segLen;
  const activeLane = state.targetLane;

  for (let i = segs; i >= 0; i -= 1) {
    const z0 = i * segLen - scrollSeg;
    const z1 = (i + 1) * segLen - scrollSeg;
    const c0 = worldXY(1, Math.max(0, z0));
    const c1 = worldXY(1, Math.max(0, z1));
    const rw0 = c0.roadHalf;
    const rw1 = c1.roadHalf;
    const gapZone = z0 > 40 && z0 < 160 && state.gapOpen > 0.15;

    // 整条桥面（以中道为中心，含弯道偏移）
    bctx.beginPath();
    bctx.moveTo(px(c0.x - rw0), px(c0.y));
    bctx.lineTo(px(c0.x + rw0), px(c0.y));
    bctx.lineTo(px(c1.x + rw1), px(c1.y));
    bctx.lineTo(px(c1.x - rw1), px(c1.y));
    bctx.closePath();
    if (gapZone) {
      bctx.fillStyle = PX.abyss;
      bctx.fill();
      continue;
    }
    const stripe = Math.floor((i + state.scroll / segLen) % 2) === 0;
    bctx.fillStyle = stripe ? PX.road1 : PX.road2;
    bctx.fill();

    // 目标道高亮：像「拐进」那条路
    const a0 = worldXY(activeLane, Math.max(0, z0));
    const a1 = worldXY(activeLane, Math.max(0, z1));
    const band0 = Math.max(3, rw0 * 0.28);
    const band1 = Math.max(3, rw1 * 0.28);
    bctx.beginPath();
    bctx.moveTo(px(a0.x - band0), px(a0.y));
    bctx.lineTo(px(a0.x + band0), px(a0.y));
    bctx.lineTo(px(a1.x + band1), px(a1.y));
    bctx.lineTo(px(a1.x - band1), px(a1.y));
    bctx.closePath();
    if (state.burstActive) bctx.fillStyle = stripe ? PX.roadGold1 : PX.roadGold2;
    else if (Math.abs(state.pathBend) > 0.12) bctx.fillStyle = stripe ? "#9ad4ff" : "#5db7f0";
    else bctx.fillStyle = stripe ? "#d8e0ec" : "#b0bccf";
    bctx.fill();

    // 三道分隔线
    if (i % 2 === 0) {
      for (const lane of [0.5, 1.5]) {
        const d = worldXY(lane, Math.max(0, z0));
        rect(d.x - 1, d.y, 2, Math.max(1, 2 * d.scale), PX.cyan);
      }
    }

    rect(c0.x - rw0, c0.y - 1, 2, 2, PX.navy);
    rect(c0.x + rw0 - 2, c0.y - 1, 2, 2, PX.navy);
    if (i % 3 === 0) {
      const ph = Math.max(3, 10 * c0.scale);
      rect(c0.x - rw0, c0.y - ph, 2, ph, PX.navy);
      rect(c0.x + rw0 - 2, c0.y - ph, 2, ph, PX.navy);
    }
  }

  if (Math.abs(state.pathBend) > 0.18 || state.turnBoost > 0.2) {
    const tip = worldXY(activeLane, 520);
    bctx.globalAlpha = Math.min(0.85, 0.3 + Math.abs(state.pathBend) + state.turnBoost * 0.5);
    bctx.fillStyle = state.pathBend < 0 ? PX.cyan : state.pathBend > 0 ? PX.violet : PX.gold;
    bctx.font = `${Math.max(5, Math.round(7 * tip.scale))}px "Press Start 2P", monospace`;
    bctx.textAlign = "center";
    bctx.fillText(state.pathBend < -0.1 ? "<<" : state.pathBend > 0.1 ? ">>" : "^^", px(tip.x), px(tip.y));
    bctx.globalAlpha = 1;
  }

  if (state.gapOpen > 0) {
    const p = worldXY(state.fall?.lane ?? 1, 90);
    for (let k = 0; k < 6; k += 1) {
      rect(p.x - 16 + k * 6, p.y + k * 2, 3, 8 + state.gapOpen * 10, PX.red);
    }
  }
}

function drawDebris() {
  state.debris.forEach((d) => {
    const p = worldXY(d.lane, Math.max(0, d.z));
    const s = Math.max(2, (d.size || 10) * 0.25);
    rect(p.x + (d.x || 0) * 0.05, p.y + (d.y || 0) * 0.08, s, s * 0.6, PX.road2);
  });
}

function drawPixelCoin(x, y, s, burst) {
  const size = Math.max(4, Math.round((burst ? 11 : 6) * Math.max(0.35, s)));
  const frame = Math.floor(state.t * 12 + x * 0.2) % 4;
  const squash = frame === 1 || frame === 3 ? 0.45 : 1;
  const w = Math.max(3, Math.round(size * squash));
  const h = size;
  const cx = px(x - w / 2);
  const cy = px(y - h / 2);
  rect(cx - 1, cy + h, w + 2, 2, "#00000055");
  rect(cx, cy, w, h, PX.ink);
  rect(cx + 1, cy + 1, Math.max(1, w - 2), Math.max(1, h - 2), burst ? PX.gold : PX.cyan);
  if (w > 3) {
    rect(cx + 1, cy + 1, 1, 1, PX.goldLt);
    if (burst) rect(cx + Math.max(1, w - 3), cy + Math.max(1, h - 3), 1, 1, PX.goldDk);
  }
  if (burst && frame === 0) {
    rect(cx + w, cy - 1, 2, 2, PX.white);
    rect(cx - 2, cy + Math.floor(h / 2), 2, 1, PX.goldLt);
  }
}

function drawQuizGate(e) {
  const colors = [PX.cyan, PX.gold, PX.violet];
  const labels = ["A<", "B", ">C"];
  for (let lane = 0; lane < 3; lane += 1) {
    const p = worldXY(lane, e.z);
    const hw = Math.max(6, 14 * p.scale);
    const hh = Math.max(10, 22 * p.scale);
    rect(p.x - hw, p.y - hh, hw * 2, hh * 1.4, PX.ink);
    rect(p.x - hw + 1, p.y - hh + 1, hw * 2 - 2, hh * 1.4 - 2, colors[lane]);
    bctx.fillStyle = PX.ink;
    bctx.font = "5px \"Press Start 2P\", monospace";
    bctx.textAlign = "center";
    bctx.fillText(labels[lane], px(p.x), px(p.y - hh + 8));
  }
}

function drawRunner() {
  const p = worldXY(state.targetLane, RUNNER_Z);
  const x = state.laneX || p.x;
  const y = p.y + Math.sin(state.bob) * 2 + state.runnerFallY * 0.12;
  const s = Math.max(0.6, p.scale);
  const flash = state.invuln > 0 && Math.floor(state.t * 12) % 2 === 0;
  if (flash) return;

  const bw = Math.round(8 * s);
  const bh = Math.round(12 * s);
  const lean = Math.round(state.camBank * 4 + state.pathBend * 2);
  rect(x - bw / 2 + lean, y + 2, bw, 3, "#00000055");
  rect(x - bw / 2 + lean, y - bh, bw, bh, state.burstActive ? PX.goldLt : PX.paper);
  rect(x - 2 + lean, y - bh, 4, 3, state.burstActive ? PX.gold : PX.cyan);
  rect(x - 3 + lean, y - bh - 5, 6, 5, "#ffccaa");
  rect(x - 2 + lean, y - bh - 3, 1, 1, PX.ink);
  rect(x + 1 + lean, y - bh - 3, 1, 1, PX.ink);
  const swing = Math.round(Math.sin(state.bob) * 3 * s);
  rect(x - 3 + lean - swing, y, 2, 4, PX.navy);
  rect(x + 1 + lean + swing, y, 2, 4, PX.navy);
  if (Math.abs(state.camBank) > 0.2 || Math.abs(state.pathBend) > 0.2) {
    const dir = state.camBank + state.pathBend < 0 ? -1 : 1;
    rect(x - dir * (bw + 3), y - 8, 3, 1, PX.cyan);
    rect(x - dir * (bw + 5), y - 5, 3, 1, PX.cyan);
  }
}

function drawFx() {
  state.fx.forEach((p) => {
    if (p.kind === "spark") {
      rect(p.x, p.y, p.size || 2, p.size || 2, p.color);
    } else if (p.kind === "coinbit") {
      const frame = Math.floor((p.spin || 0) * 2) % 4;
      const squash = frame === 1 || frame === 3 ? 0.4 : 1;
      const s = 5;
      const w = Math.max(2, Math.round(s * squash));
      rect(p.x - w / 2, p.y - s / 2, w, s, PX.ink);
      rect(p.x - w / 2 + 1, p.y - s / 2 + 1, Math.max(1, w - 2), s - 2, PX.gold);
      if (w > 3) rect(p.x - w / 2 + 1, p.y - s / 2 + 1, 1, 1, PX.goldLt);
    } else if (p.kind === "ring") {
      const r = (1 - p.life / p.max) * 22;
      bctx.strokeStyle = p.color;
      bctx.lineWidth = 2;
      bctx.strokeRect(px(p.x - r), px(p.y - r), px(r * 2), px(r * 2));
    } else if (p.kind === "suck") {
      const t = 1 - p.life / p.max;
      const r = 14 * (1 - t);
      bctx.strokeStyle = PX.goldLt;
      bctx.lineWidth = 2;
      bctx.strokeRect(px(p.x - r), px(p.y - r), px(r * 2), px(r * 2));
      rect(p.x - 1, p.y - 1, 2, 2, PX.white);
    } else if (p.kind === "trail") {
      const u = 1 - p.life / p.max;
      drawPixelCoin(p.x, p.y, Math.max(0.35, 0.9 - u * 0.5), true);
      for (let k = 1; k <= 3; k += 1) {
        const ox = p.x - (p.tx - p.x) * 0.05 * k;
        const oy = p.y - (p.ty - p.y) * 0.05 * k;
        rect(ox, oy, 2, 2, k === 1 ? PX.goldLt : PX.gold);
      }
    } else if (p.kind === "flash") {
      bctx.globalAlpha = Math.max(0, p.life / p.max) * 0.4;
      rect(0, 0, GW, GH, PX.gold);
      bctx.globalAlpha = 1;
    } else if (p.kind === "text") {
      bctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
      bctx.fillStyle = p.color;
      bctx.font = "6px \"Press Start 2P\", monospace";
      bctx.textAlign = "center";
      bctx.fillText(p.text, px(p.x), px(p.y));
      bctx.globalAlpha = 1;
    }
  });
}

function drawPopups() {
  state.popups.forEach((p) => {
    bctx.globalAlpha = Math.max(0, p.life);
    bctx.fillStyle = p.color;
    bctx.font = "7px \"Press Start 2P\", monospace";
    bctx.textAlign = "center";
    bctx.fillText(p.text, px(GW / 2 + state.camBank * 20), px(GH * 0.3 + p.y));
    bctx.globalAlpha = 1;
  });
}

function drawTurnCue() {
  if (Math.abs(state.pathBend) < 0.18 && Math.abs(state.camBank) < 0.18) return;
  bctx.globalAlpha = Math.min(0.9, Math.abs(state.pathBend) + Math.abs(state.camBank) + 0.15);
  bctx.fillStyle = (state.pathBend || state.camBank) < 0 ? PX.cyan : PX.violet;
  bctx.font = "10px \"Press Start 2P\", monospace";
  bctx.textAlign = "center";
  const dir = (state.pathBend || state.camBank) < 0 ? "<<" : ">>";
  bctx.fillText(dir, px(GW / 2 + (state.pathBend + state.camBank) * 40), px(GH * 0.74));
  bctx.globalAlpha = 1;
}

function draw() {
  bctx.imageSmoothingEnabled = false;
  bctx.clearRect(0, 0, GW, GH);

  bctx.save();
  bctx.translate(GW / 2, GH / 2);
  // 轻微倾侧即可，过猛会把路拧成侧面
  bctx.rotate(state.camBank * 0.045 + state.pathBend * 0.02);
  bctx.translate(-GW / 2, -GH / 2);
  if (state.shake > 0) {
    bctx.translate(px((Math.random() - 0.5) * state.shake * 0.35), px((Math.random() - 0.5) * state.shake * 0.35));
  }

  drawBackground();
  drawRoad();
  drawDebris();

  const sorted = [...state.entities].sort((a, b) => b.z - a.z);
  sorted.forEach((e) => {
    if (e.type === "quiz") {
      drawQuizGate(e);
      return;
    }
    if (e.type === "coin" && !e.taken) {
      if (e.sucking && e.drawX != null) {
        drawPixelCoin(e.drawX, e.drawY, (e.drawScale || 1) * 0.9, e.burst);
        return;
      }
      const p = worldXY(e.lane, e.z);
      // 贴在路面上（略抬一点 + 阴影在 drawPixelCoin 里）
      drawPixelCoin(p.x + (e.sx || 0), p.y - 2 * p.scale + (e.sy || 0), p.scale, e.burst);
    }
  });

  drawRunner();
  drawTurnCue();
  drawPopups();
  drawFx();
  bctx.restore();

  // nearest-neighbor upscale to screen
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = PX.abyss;
  ctx.fillRect(0, 0, w, h);
  const scale = Math.max(1, Math.floor(Math.min(w / GW, h / GH)));
  const dw = GW * scale;
  const dh = GH * scale;
  const ox = Math.floor((w - dw) / 2);
  const oy = Math.floor((h - dh) / 2);
  ctx.drawImage(buffer, 0, 0, GW, GH, ox, oy, dw, dh);

  // letterbox scanline (pixel vibe)
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  for (let y = oy; y < oy + dh; y += 4) ctx.fillRect(ox, y, dw, 1);
}

function loop(now) {
  if (!state.running) return;
  const dt = Math.min(0.05, (now - state.last) / 1000 || 0.016);
  state.last = now;
  if (!state.paused) {
    update(dt);
    draw();
  }
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  if (!state.running) return;
  if (e.key === "p" || e.key === "P" || e.key === "Escape") {
    state.paused = !state.paused;
    toast(state.paused ? "已暂停" : "继续冲刺");
    if (!state.paused) {
      state.last = performance.now();
      requestAnimationFrame(loop);
    }
  }
});

els.start.addEventListener("click", () => {
  resize();
  resetGame();
});
els.retry.addEventListener("click", () => {
  resize();
  resetGame();
});
els.pause.addEventListener("click", () => {
  if (!state.running) return;
  state.paused = !state.paused;
  toast(state.paused ? "已暂停" : "继续冲刺");
  if (!state.paused) {
    state.last = performance.now();
    requestAnimationFrame(loop);
  }
});

window.addEventListener("resize", () => {
  if (state.running) resize();
});
