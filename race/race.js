import { AI_QUESTIONS } from "/monopoly/questions.js";

const START_ANGLE = Math.PI / 2;
const START_PROGRESS = 0.008;
const LAPS_TO_WIN = 3;
const RACER_COUNT = 6;
const LETTERS = ["A", "B", "C", "D"];
const TAU = Math.PI * 2;
const TRACKS = [
  {
    id: "cloud-city",
    name: "云海环城",
    icon: "☁️",
    subtitle: "宽阔高速 · 长直道",
    length: "4.1 km",
    level: "入门",
    world: { width: 2200, height: 1300, cx: 1100, cy: 650, rx: 820, ry: 470 },
    roadWidth: 142,
    startIndex: 2,
    route: [
      [-0.92, 0.18], [-0.72, -0.46], [-0.20, -0.70], [0.36, -0.62],
      [0.88, -0.26], [0.78, 0.30], [0.38, 0.66], [-0.18, 0.72],
      [-0.68, 0.56],
    ],
    gates: [0.30, 0.76],
    theme: {
      skyTop: "#3e8ed0", skyBottom: "#d8f3ff", mountain: "#6285a4",
      hill: "#7fa879", grassA: "#5eb95f", grassB: "#66c568",
      roadA: "#263745", roadB: "#2d404e", accent: "#35d9f1", sun: "#fff0a1",
    },
  },
  {
    id: "neon-harbor",
    name: "霓虹港湾",
    icon: "🌃",
    subtitle: "连续弯道 · 霓虹夜景",
    length: "4.6 km",
    level: "进阶",
    world: { width: 2500, height: 1400, cx: 1250, cy: 700, rx: 940, ry: 500 },
    roadWidth: 138,
    startIndex: 2,
    route: [
      [-0.94, 0.34], [-0.82, -0.26], [-0.46, -0.68], [-0.02, -0.62],
      [0.12, -0.18], [0.48, -0.58], [0.90, -0.40], [0.82, 0.08],
      [0.42, 0.24], [0.24, 0.70], [-0.26, 0.74], [-0.40, 0.26],
      [-0.72, 0.06],
    ],
    gates: [0.34, 0.79],
    theme: {
      skyTop: "#151348", skyBottom: "#8b3bb4", mountain: "#242758",
      hill: "#164e68", grassA: "#153e53", grassB: "#194a60",
      roadA: "#20243d", roadB: "#292c49", accent: "#f15dff", sun: "#77efff",
    },
  },
  {
    id: "aurora-snow",
    name: "极光雪原",
    icon: "❄️",
    subtitle: "超长赛程 · 高速挑战",
    length: "5.1 km",
    level: "挑战",
    world: { width: 2750, height: 1500, cx: 1375, cy: 750, rx: 1040, ry: 550 },
    roadWidth: 134,
    startIndex: 3,
    route: [
      [-0.94, 0.42], [-0.84, -0.18], [-0.56, -0.68], [-0.18, -0.48],
      [0.08, -0.78], [0.52, -0.62], [0.88, -0.24], [0.58, 0.04],
      [0.92, 0.38], [0.54, 0.72], [0.12, 0.46], [-0.16, 0.76],
      [-0.52, 0.56], [-0.42, 0.16], [-0.78, 0.02],
    ],
    gates: [0.28, 0.72],
    theme: {
      skyTop: "#18376d", skyBottom: "#8de0d0", mountain: "#a8c5d5",
      hill: "#d7edf2", grassA: "#b8dce3", grassB: "#c7e6ea",
      roadA: "#344654", roadB: "#3b4f5e", accent: "#73ffca", sun: "#d5fff8",
    },
  },
];
const WORLD = { ...TRACKS[0].world };
const DRIVERS = [
  {
    id: "spark",
    name: "闪电学员",
    title: "极速新星",
    emoji: "🧑‍🚀",
    color: "#2f8ef4",
    skill: "起步时获得短暂加速",
    stats: { speed: 88, acceleration: 82, handling: 66 },
  },
  {
    id: "bubble",
    name: "泡泡工程师",
    title: "防护专家",
    emoji: "👩‍🔬",
    color: "#ee6ba7",
    skill: "开局携带一次事实护盾",
    stats: { speed: 72, acceleration: 86, handling: 82 },
  },
  {
    id: "claw",
    name: "云爪侦探",
    title: "弯道猎手",
    emoji: "🦊",
    color: "#f29a32",
    skill: "漂移蓄力速度提升",
    stats: { speed: 80, acceleration: 72, handling: 94 },
  },
  {
    id: "aurora",
    name: "极光领航员",
    title: "稳定大师",
    emoji: "🐧",
    color: "#43b978",
    skill: "开局获得专注引擎",
    stats: { speed: 76, acceleration: 78, handling: 88 },
  },
];

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
  speedNeedle: document.getElementById("speed-needle"),
  speedFill: document.getElementById("speed-fill"),
  boostState: document.getElementById("boost-state"),
  effectPanel: document.getElementById("effect-panel"),
  effectIcon: document.getElementById("effect-icon"),
  effectName: document.getElementById("effect-name"),
  shieldSlot: document.getElementById("shield-slot"),
  liveRanking: document.getElementById("live-ranking-list"),
  rankLapLabel: document.getElementById("rank-lap-label"),
  characterGrid: document.getElementById("character-grid"),
  driverPortrait: document.getElementById("driver-portrait"),
  driverName: document.getElementById("driver-name"),
  driverSkill: document.getElementById("driver-skill"),
  statSpeed: document.getElementById("stat-speed"),
  statAccel: document.getElementById("stat-accel"),
  statHandling: document.getElementById("stat-handling"),
  finalRanking: document.getElementById("final-ranking-list"),
  trackGrid: document.getElementById("track-grid"),
  selectedTrackIcon: document.getElementById("selected-track-icon"),
  selectedTrackName: document.getElementById("selected-track-name"),
  selectedTrackLength: document.getElementById("selected-track-length"),
  selectedTrackGates: document.getElementById("selected-track-gates"),
  selectedTrackLevel: document.getElementById("selected-track-level"),
  hudTrackName: document.getElementById("hud-track-name"),
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

let selectedTrack = TRACKS[0];
let selectedDriver = DRIVERS[0];
let trackGeometry = buildTrackGeometry(selectedTrack);
let game = createGame();
let activeQuestion = null;
let countdownToken = 0;
let lastFrame = performance.now();
let messageTimer = 0;

function buildTrackGeometry(track) {
  const orderedRoute = track.route.map(
    (_, index) => track.route[(index + track.startIndex) % track.route.length],
  );
  const control = orderedRoute.map(([x, y]) => ({
    x: track.world.cx + x * track.world.rx,
    y: track.world.cy + y * track.world.ry,
  }));
  const samples = [];
  const stepsPerCurve = 44;

  for (let index = 0; index < control.length; index += 1) {
    const p0 = control[(index - 1 + control.length) % control.length];
    const p1 = control[index];
    const p2 = control[(index + 1) % control.length];
    const p3 = control[(index + 2) % control.length];
    for (let step = 0; step < stepsPerCurve; step += 1) {
      const t = step / stepsPerCurve;
      const t2 = t * t;
      const t3 = t2 * t;
      samples.push({
        x: .5 * ((2 * p1.x) + (-p0.x + p2.x) * t
          + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2
          + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: .5 * ((2 * p1.y) + (-p0.y + p2.y) * t
          + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2
          + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }

  let totalLength = 0;
  samples.forEach((sample, index) => {
    const next = samples[(index + 1) % samples.length];
    sample.cumulative = totalLength;
    sample.segmentLength = Math.hypot(next.x - sample.x, next.y - sample.y);
    totalLength += sample.segmentLength;
  });
  return { samples, totalLength };
}

function createPlayer() {
  const start = pointAtProgress(START_PROGRESS, -22);
  return {
    x: start.x,
    y: start.y,
    angle: start.angle,
    speed: 0,
    lap: 1,
    progress: START_PROGRESS,
    previousProgress: START_PROGRESS,
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
    color: selectedDriver.color,
    driverId: selectedDriver.id,
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
    finishTime: null,
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

function paintDriverSelection() {
  els.characterGrid.innerHTML = "";
  DRIVERS.forEach((driver) => {
    const selected = driver.id === selectedDriver.id;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "character-card";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(selected));
    button.style.setProperty("--driver-color", driver.color);
    button.innerHTML = `
      <span class="character-avatar">${driver.emoji}</span>
      <strong>${driver.name}</strong>
      <small>${driver.title}</small>
      <span class="character-kart" aria-hidden="true"></span>`;
    button.addEventListener("click", () => {
      selectedDriver = driver;
      paintDriverSelection();
      paintSelectedDriver();
    });
    els.characterGrid.appendChild(button);
  });
}

function paintSelectedDriver() {
  els.driverPortrait.textContent = selectedDriver.emoji;
  els.driverPortrait.style.setProperty("--selected-driver-color", selectedDriver.color);
  els.driverName.textContent = selectedDriver.name;
  els.driverSkill.textContent = selectedDriver.skill;
  els.statSpeed.style.width = `${selectedDriver.stats.speed}%`;
  els.statAccel.style.width = `${selectedDriver.stats.acceleration}%`;
  els.statHandling.style.width = `${selectedDriver.stats.handling}%`;
}

function paintTrackSelection() {
  els.trackGrid.innerHTML = "";
  TRACKS.forEach((track) => {
    const selected = track.id === selectedTrack.id;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "track-card";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(selected));
    button.style.setProperty("--track-sky", track.theme.skyTop);
    button.style.setProperty("--track-ground", track.theme.grassA);
    button.style.setProperty("--track-sun", track.theme.sun);
    const previewPoints = [...track.route, track.route[0]]
      .map(([x, y]) => `${50 + x * 42},${34 + y * 28}`)
      .join(" ");
    button.innerHTML = `
      <span class="track-check">✓</span>
      <svg class="track-route-preview" viewBox="0 0 100 68" aria-hidden="true">
        <polyline points="${previewPoints}"></polyline>
      </svg>
      <strong>${track.icon} ${track.name}</strong>
      <small>${track.subtitle} · ${track.length}</small>`;
    button.addEventListener("click", () => {
      selectedTrack = track;
      Object.assign(WORLD, selectedTrack.world);
      trackGeometry = buildTrackGeometry(selectedTrack);
      game = createGame();
      updateOpponents(0);
      paintTrackSelection();
      paintSelectedTrack();
    });
    els.trackGrid.appendChild(button);
  });
}

function paintSelectedTrack() {
  els.selectedTrackIcon.textContent = selectedTrack.icon;
  els.selectedTrackName.textContent = selectedTrack.name;
  els.selectedTrackLength.textContent = selectedTrack.length;
  els.selectedTrackGates.textContent = `${selectedTrack.gates.length} 座/圈`;
  els.selectedTrackLevel.textContent = selectedTrack.level;
  els.hudTrackName.textContent = `${selectedTrack.name} · KNOWLEDGE KART`;
  els.start.textContent = `在「${selectedTrack.name}」开始比赛`;
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

function trackLapLength() {
  return trackGeometry.totalLength;
}

function normalizeAngle(value) {
  return ((value % TAU) + TAU) % TAU;
}

function signedAngle(value) {
  let angle = normalizeAngle(value);
  if (angle > Math.PI) angle -= TAU;
  return angle;
}

function progressAt(x, y, hint = null) {
  return nearestTrackPosition(x, y, hint).progress;
}

function pointAtProgress(progress, lane = 0) {
  const normalized = ((progress % 1) + 1) % 1;
  const target = normalized * trackGeometry.totalLength;
  const samples = trackGeometry.samples;
  let low = 0;
  let high = samples.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (samples[mid].cumulative <= target) low = mid + 1;
    else high = mid - 1;
  }
  const index = Math.max(0, high);
  const current = samples[index];
  const next = samples[(index + 1) % samples.length];
  const mix = current.segmentLength
    ? (target - current.cumulative) / current.segmentLength
    : 0;
  const centerX = current.x + (next.x - current.x) * mix;
  const centerY = current.y + (next.y - current.y) * mix;
  const angle = Math.atan2(next.y - current.y, next.x - current.x);
  const nx = -Math.sin(angle);
  const ny = Math.cos(angle);
  return {
    x: centerX + nx * lane,
    y: centerY + ny * lane,
    angle,
    nx,
    ny,
  };
}

function isOnRoad(x, y) {
  return nearestTrackPosition(x, y).distance <= selectedTrack.roadWidth;
}

function nearestTrackPosition(x, y, hint = null) {
  const samples = trackGeometry.samples;
  let nearestScore = Infinity;
  let nearestDistanceSq = Infinity;
  let nearestProgress = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const current = samples[index];
    const next = samples[(index + 1) % samples.length];
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const lengthSq = dx * dx + dy * dy || 1;
    const mix = clamp(((x - current.x) * dx + (y - current.y) * dy) / lengthSq, 0, 1);
    const projectedX = current.x + dx * mix;
    const projectedY = current.y + dy * mix;
    const distanceSq = (x - projectedX) ** 2 + (y - projectedY) ** 2;
    const candidateProgress = (current.cumulative + current.segmentLength * mix) / trackGeometry.totalLength;
    const continuity = hint == null
      ? 0
      : Math.abs(((candidateProgress - hint + 1.5) % 1) - .5) * trackGeometry.totalLength * .32;
    const score = distanceSq + continuity * continuity;
    if (score < nearestScore) {
      nearestScore = score;
      nearestDistanceSq = distanceSq;
      nearestProgress = candidateProgress;
    }
  }
  return { progress: nearestProgress % 1, distance: Math.sqrt(nearestDistanceSq) };
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
  applyDriverStartSkill();
  announce(`${selectedTrack.icon} ${selectedTrack.name} · 前方知识门 ${selectedTrack.gates.length} 座/圈`);
}

function applyDriverStartSkill() {
  const player = game.player;
  if (selectedDriver.id === "spark") {
    player.boostTimer = 2.2;
    player.speed = 315;
  } else if (selectedDriver.id === "bubble") {
    player.shield = true;
  } else if (selectedDriver.id === "aurora") {
    player.focusTimer = 5;
  }
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

  const driverAcceleration = .84 + selectedDriver.stats.acceleration / 500;
  const acceleration = (player.focusTimer > 0 ? 285 : 235) * driverAcceleration;
  if (input.gas) player.speed += acceleration * dt;
  if (input.brake) player.speed -= (player.speed > 0 ? 330 : 145) * dt;
  if (!input.gas && !input.brake) {
    const drag = player.onRoad ? 72 : 125;
    player.speed -= Math.sign(player.speed) * Math.min(Math.abs(player.speed), drag * dt);
  }

  const drifting = input.drift && Math.abs(steer) > 0 && player.speed > 145 && player.onRoad;
  player.drifting = drifting;
  if (drifting) {
    const driftGain = selectedDriver.id === "claw" ? 1.28 : 1;
    player.driftCharge = Math.min(1.8, player.driftCharge + dt * driftGain);
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
  maxSpeed *= .89 + selectedDriver.stats.speed / 830;
  if (!player.onRoad) maxSpeed = 150;
  if (player.slowTimer > 0) maxSpeed = Math.min(maxSpeed, 175);
  player.speed = clamp(player.speed, -85, maxSpeed);

  const speedFactor = clamp(Math.abs(player.speed) / 260, 0.25, 1.25);
  const handling = .84 + selectedDriver.stats.handling / 520;
  const turnRate = (drifting ? 2.25 : 1.7) * speedFactor * handling;
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
  const previous = player.progress;
  let next = progressAt(player.x, player.y, previous);
  if (previous < 0.08 && next > 0.92) next = 0;
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
  for (let index = 0; index < selectedTrack.gates.length; index += 1) {
    const gate = selectedTrack.gates[index];
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
    opponent.totalProgress += opponent.speed * dt / trackLapLength();
    if (opponent.totalProgress >= LAPS_TO_WIN) {
      opponent.finished = true;
      opponent.totalProgress = LAPS_TO_WIN;
      opponent.finishTime = game.elapsed;
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

function currentStandings() {
  return [
    {
      id: "player",
      name: selectedDriver.name,
      avatar: selectedDriver.emoji,
      color: selectedDriver.color,
      total: getPlayerTotalProgress(),
      isPlayer: true,
    },
    ...game.opponents.map((opponent, index) => ({
      id: `ai-${index}`,
      name: opponent.name,
      avatar: ["🦊", "🐰", "🐻", "🐱", "🦅"][index],
      color: opponent.color,
      total: opponent.totalProgress,
      isPlayer: false,
      finishTime: opponent.finishTime,
    })),
  ].sort((a, b) => b.total - a.total);
}

function renderLiveRanking() {
  const standings = currentStandings();
  els.liveRanking.innerHTML = standings.map((racer, index) => `
    <li class="${racer.isPlayer ? "is-player" : ""}">
      <span class="rank-number">${index + 1}</span>
      <span class="rank-avatar">${racer.avatar}</span>
      <span>${racer.name}</span>
    </li>`).join("");
  els.rankLapLabel.textContent = `第 ${Math.min(game.player.lap, LAPS_TO_WIN)} 圈`;
}

function renderFinalRanking() {
  const racers = currentStandings();
  racers.forEach((racer) => {
    if (racer.isPlayer) racer.finishTime = game.elapsed;
  });
  racers.sort((a, b) => {
    if (a.finishTime != null && b.finishTime != null) return a.finishTime - b.finishTime;
    if (a.finishTime != null) return -1;
    if (b.finishTime != null) return 1;
    return b.total - a.total;
  });
  els.finalRanking.innerHTML = racers.map((racer, index) => `
    <li class="${racer.isPlayer ? "is-player" : ""}">
      <span class="final-rank-number">${index + 1}</span>
      <span>${racer.avatar}</span>
      <span>${racer.name}${racer.isPlayer ? "（你）" : ""}</span>
      <span class="final-rank-time">${racer.finishTime != null ? formatTime(racer.finishTime) : "比赛中"}</span>
    </li>`).join("");
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
  game.finalPosition = 1 + game.opponents
    .filter((opponent) => opponent.finishTime != null && opponent.finishTime < game.elapsed)
    .length;
  const won = game.finalPosition === 1;
  els.finishIcon.textContent = won ? "🏆" : game.finalPosition <= 3 ? "🏅" : "🏁";
  els.finishTitle.textContent = won ? "冠军冲线！" : "比赛完成！";
  els.finishSummary.textContent = won
    ? `你征服了「${selectedTrack.name}」，用速度与 AI 素养赢得本场大奖赛。`
    : `你完成了「${selectedTrack.name}」！继续练习漂移与 AI 素养题，向冠军发起挑战。`;
  els.finishPosition.textContent = `${game.finalPosition} / ${RACER_COUNT}`;
  els.finishTime.textContent = formatTime(game.elapsed);
  els.finishAnswers.textContent = `${game.correct} / ${game.answered}`;
  renderFinalRanking();
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
  const speedAngle = -128 + clamp(displayedSpeed / 420, 0, 1) * 256;
  els.speedNeedle.style.setProperty("--speed-angle", `${speedAngle}deg`);
  els.boostState.textContent = game.player.boostTimer > 0
    ? "ACTIVE"
    : game.player.driftCharge > .45
      ? `${Math.round(game.player.driftCharge / 1.8 * 100)}%`
      : "READY";
  const effect = activeEffect();
  els.effectIcon.textContent = effect.icon;
  els.effectName.textContent = effect.name;
  els.effectPanel.classList.toggle("is-positive", effect.type === "positive");
  els.effectPanel.classList.toggle("is-negative", effect.type === "negative");
  els.shieldSlot.classList.toggle("is-active", game.player.shield);
  renderLiveRanking();
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
  drawPseudo3D(cssWidth, cssHeight);
}

function drawPseudo3D(width, height) {
  const horizon = height * .29;
  drawSky(width, height, horizon);

  const playerProgress = game.player.progress;
  const basePoint = pointAtProgress(playerProgress);
  const lateral = (game.player.x - basePoint.x) * basePoint.nx
    + (game.player.y - basePoint.y) * basePoint.ny;
  const segmentCount = 92;
  const stepProgress = .00275;
  const nearHalfWidth = Math.min(width * .48, height * .69);
  const slices = [];

  for (let index = 0; index <= segmentCount; index += 1) {
    const depth = index / segmentCount;
    const closeness = 1 - depth;
    const progress = normalizeAngle((playerProgress + index * stepProgress) * TAU) / TAU;
    const point = pointAtProgress(progress);
    const headingDelta = signedAngle(point.angle - basePoint.angle);
    const curveShift = headingDelta * width * .35 * Math.pow(depth, 1.35);
    const lateralShift = -(lateral / 112) * nearHalfWidth * Math.pow(closeness, 1.45);
    slices.push({
      progress,
      x: width / 2 + curveShift + lateralShift,
      y: horizon + Math.pow(closeness, 1.62) * (height - horizon + 44),
      half: 7 + Math.pow(closeness, 1.12) * nearHalfWidth,
      depth,
    });
  }

  for (let index = segmentCount - 1; index >= 0; index -= 1) {
    const far = slices[index + 1];
    const near = slices[index];
    const stripe = Math.floor((playerProgress + index * stepProgress) * 180);
    ctx.fillStyle = stripe % 2 ? selectedTrack.theme.grassA : selectedTrack.theme.grassB;
    ctx.fillRect(0, far.y, width, Math.max(1, near.y - far.y + 1));

    drawRoadQuad(far, near, stripe);
    if (index % 7 === 0 && index > 3) {
      drawRoadsideObject(near, index, width);
    }
  }

  drawUpcomingGates3D(slices, playerProgress);
  drawOpponents3D(slices, playerProgress);
  drawSpeedEffects(width, height);
  drawPlayerKart3D(width / 2 + ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 10, height - 84);
  drawMiniMap(width, height);
}

function drawSky(width, height, horizon) {
  const theme = selectedTrack.theme;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon + 80);
  sky.addColorStop(0, theme.skyTop);
  sky.addColorStop(.62, lighten(theme.skyTop, 22));
  sky.addColorStop(1, theme.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, horizon + 80);

  const sunX = width * .78;
  const sunY = horizon * .34;
  const glow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 80);
  glow.addColorStop(0, theme.sun);
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 80, 0, TAU);
  ctx.fill();

  ctx.fillStyle = theme.mountain;
  ctx.beginPath();
  ctx.moveTo(0, horizon + 35);
  for (let x = 0; x <= width; x += 55) {
    const y = horizon - 18 - Math.sin(x * .018) * 27 - Math.sin(x * .043) * 12;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, horizon + 65);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = theme.hill;
  ctx.beginPath();
  ctx.moveTo(0, horizon + 48);
  for (let x = 0; x <= width; x += 42) {
    const y = horizon + 12 - Math.sin(x * .027 + 1.5) * 17;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, horizon + 75);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,.78)";
  for (let index = 0; index < 5; index += 1) {
    const x = ((index * 271 + game.elapsed * (5 + index)) % (width + 180)) - 90;
    const y = 42 + (index % 3) * 36;
    ctx.beginPath();
    ctx.ellipse(x, y, 42, 13, 0, 0, TAU);
    ctx.ellipse(x + 28, y - 5, 28, 14, 0, 0, TAU);
    ctx.fill();
  }
}

function drawRoadQuad(far, near, stripe) {
  ctx.fillStyle = stripe % 2 ? selectedTrack.theme.roadA : selectedTrack.theme.roadB;
  quad(
    far.x - far.half, far.y,
    far.x + far.half, far.y,
    near.x + near.half, near.y,
    near.x - near.half, near.y,
  );
  ctx.fill();

  const farCurb = Math.max(2, far.half * .09);
  const nearCurb = Math.max(3, near.half * .09);
  ctx.fillStyle = stripe % 2 ? selectedTrack.theme.accent : "#fff";
  quad(
    far.x - far.half - farCurb, far.y,
    far.x - far.half, far.y,
    near.x - near.half, near.y,
    near.x - near.half - nearCurb, near.y,
  );
  ctx.fill();
  quad(
    far.x + far.half, far.y,
    far.x + far.half + farCurb, far.y,
    near.x + near.half + nearCurb, near.y,
    near.x + near.half, near.y,
  );
  ctx.fill();

  if (stripe % 8 < 4) {
    const farLine = Math.max(1, far.half * .018);
    const nearLine = Math.max(2, near.half * .018);
    ctx.fillStyle = "rgba(255,255,255,.5)";
    quad(
      far.x - farLine, far.y,
      far.x + farLine, far.y,
      near.x + nearLine, near.y,
      near.x - nearLine, near.y,
    );
    ctx.fill();
  }
}

function quad(x1, y1, x2, y2, x3, y3, x4, y4) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.lineTo(x4, y4);
  ctx.closePath();
}

function drawRoadsideObject(slice, index, width) {
  const scale = Math.max(.15, (1 - slice.depth) * 1.25);
  const side = index % 2 ? -1 : 1;
  const x = slice.x + side * (slice.half + 32 * scale);
  const y = slice.y;
  ctx.save();
  ctx.translate(x, y);
  if (index % 14 === 0) {
    ctx.fillStyle = "#f5d74c";
    ctx.fillRect(-3 * scale, -46 * scale, 6 * scale, 46 * scale);
    ctx.fillStyle = "#17334b";
    roundRect(ctx, -30 * scale, -66 * scale, 60 * scale, 27 * scale, 5 * scale);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = `900 ${12 * scale}px Fredoka, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("AI", 0, -48 * scale);
  } else {
    ctx.fillStyle = "rgba(0,0,0,.18)";
    ctx.beginPath();
    ctx.ellipse(5 * scale, 3 * scale, 23 * scale, 8 * scale, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#765236";
    ctx.fillRect(-3 * scale, -28 * scale, 6 * scale, 30 * scale);
    ctx.fillStyle = index % 3 ? "#27864a" : "#3aa357";
    ctx.beginPath();
    ctx.arc(0, -36 * scale, 22 * scale, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function progressDistance(ahead, current) {
  return normalizeAngle((ahead - current) * TAU) / TAU;
}

function sliceForDistance(slices, distance) {
  const index = Math.round(distance / .00275);
  if (index < 1 || index >= slices.length) return null;
  return slices[index];
}

function drawUpcomingGates3D(slices, playerProgress) {
  const lapIndex = game.player.lap - 1;
  selectedTrack.gates.forEach((gate, index) => {
    const key = `${lapIndex}-${index}`;
    if (game.usedGates.has(key)) return;
    const distance = progressDistance(gate, playerProgress);
    if (distance > .24) return;
    const slice = sliceForDistance(slices, distance);
    if (!slice) return;
    const scale = Math.max(.16, 1 - slice.depth);
    const roadWidth = slice.half * 1.6;
    const height = Math.max(25, roadWidth * .48);
    ctx.save();
    ctx.translate(slice.x, slice.y);
    ctx.shadowColor = selectedTrack.theme.accent;
    ctx.shadowBlur = 12 * scale;
    ctx.strokeStyle = selectedTrack.theme.accent;
    ctx.lineWidth = Math.max(2, 8 * scale);
    ctx.beginPath();
    ctx.moveTo(-roadWidth / 2, 0);
    ctx.lineTo(-roadWidth / 2, -height);
    ctx.quadraticCurveTo(0, -height * 1.35, roadWidth / 2, -height);
    ctx.lineTo(roadWidth / 2, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#8c63e9";
    ctx.beginPath();
    ctx.arc(0, -height * 1.12, Math.max(6, 19 * scale), 0, TAU);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = `900 ${Math.max(9, 20 * scale)}px Fredoka, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("?", 0, -height * 1.12 + Math.max(3, 7 * scale));
    ctx.restore();
  });
}

function drawOpponents3D(slices) {
  const playerTotal = getPlayerTotalProgress();
  const visible = game.opponents
    .map((opponent, index) => ({ opponent, index, distance: opponent.totalProgress - playerTotal }))
    .filter((entry) => entry.distance > .002 && entry.distance < .245)
    .sort((a, b) => b.distance - a.distance);
  visible.forEach(({ opponent, index, distance }) => {
    const slice = sliceForDistance(slices, distance);
    if (!slice) return;
    const scale = .18 + Math.pow(1 - slice.depth, 1.2) * 1.18;
    const laneOffset = opponent.lane / 112 * slice.half;
    drawRivalKart3D(slice.x + laneOffset, slice.y, scale, opponent.color, index + 2);
  });
}

function drawRivalKart3D(x, y, scale, color, number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.beginPath();
  ctx.ellipse(0, 4 * scale, 32 * scale, 9 * scale, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#111923";
  ctx.fillRect(-29 * scale, -15 * scale, 10 * scale, 24 * scale);
  ctx.fillRect(19 * scale, -15 * scale, 10 * scale, 24 * scale);
  const body = ctx.createLinearGradient(0, -25 * scale, 0, 13 * scale);
  body.addColorStop(0, lighten(color, 28));
  body.addColorStop(.55, color);
  body.addColorStop(1, darken(color, 25));
  ctx.fillStyle = body;
  roundRect(ctx, -25 * scale, -22 * scale, 50 * scale, 34 * scale, 9 * scale);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.75)";
  ctx.lineWidth = Math.max(1, 2 * scale);
  ctx.stroke();
  ctx.fillStyle = "#d8edf8";
  ctx.beginPath();
  ctx.arc(0, -21 * scale, 10 * scale, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#10283c";
  ctx.font = `900 ${9 * scale}px Fredoka, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(String(number), 0, -18 * scale);
  ctx.restore();
}

function drawPlayerKart3D(x, y) {
  const steer = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const bounce = Math.sin(game.elapsed * 18) * Math.min(2.5, Math.abs(game.player.speed) / 150);
  ctx.save();
  ctx.translate(x, y + bounce);
  ctx.rotate(steer * .045 + (game.player.spinTimer > 0 ? Math.sin(game.elapsed * 14) * .16 : 0));
  if (game.player.boostTimer > 0) {
    const flame = ctx.createLinearGradient(0, 18, 0, 68);
    flame.addColorStop(0, "#fff");
    flame.addColorStop(.35, "#35d9f1");
    flame.addColorStop(1, "rgba(53,217,241,0)");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(-33, 18);
    ctx.lineTo(-17, 18);
    ctx.lineTo(-25, 65 + Math.random() * 14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(17, 18);
    ctx.lineTo(33, 18);
    ctx.lineTo(25, 65 + Math.random() * 14);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "rgba(0,0,0,.34)";
  ctx.beginPath();
  ctx.ellipse(0, 24, 77, 18, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#121923";
  roundRect(ctx, -72, -13, 25, 52, 7);
  ctx.fill();
  roundRect(ctx, 47, -13, 25, 52, 7);
  ctx.fill();
  const body = ctx.createLinearGradient(0, -45, 0, 40);
  body.addColorStop(0, lighten(selectedDriver.color, 36));
  body.addColorStop(.28, lighten(selectedDriver.color, 18));
  body.addColorStop(.72, selectedDriver.color);
  body.addColorStop(1, darken(selectedDriver.color, 28));
  ctx.fillStyle = body;
  roundRect(ctx, -58, -42, 116, 78, 24);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#16324b";
  roundRect(ctx, -34, -30, 68, 35, 14);
  ctx.fill();
  ctx.fillStyle = "#d9f4ff";
  ctx.beginPath();
  ctx.arc(0, -38, 25, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#26394a";
  ctx.beginPath();
  ctx.arc(0, -42, 22, Math.PI, TAU);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(selectedDriver.emoji, 0, -31);
  ctx.fillStyle = "#ef4545";
  ctx.fillRect(-43, 14, 86, 14);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-35, 17, 14, 7);
  ctx.fillRect(21, 17, 14, 7);
  if (game.player.shield) {
    ctx.strokeStyle = "rgba(91,235,255,.9)";
    ctx.lineWidth = 5;
    ctx.shadowColor = "#35d9f1";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(0, -5, 82, 69, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSpeedEffects(width, height) {
  const intensity = clamp((game.player.speed - 300) / 180, 0, 1);
  if (intensity <= 0) return;
  ctx.save();
  ctx.globalAlpha = intensity * .55;
  ctx.strokeStyle = game.player.boostTimer > 0 ? "#7bf5ff" : "#fff";
  ctx.lineWidth = 2;
  for (let index = 0; index < 22; index += 1) {
    const side = index % 2 ? -1 : 1;
    const x = width / 2 + side * (width * .16 + (index % 11) * width * .032);
    const y = (index * 83 + game.elapsed * 780) % height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + side * 28 * intensity, y + 74 * intensity);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMiniMap(width, height) {
  if (width < 720) return;
  const mapWidth = 152;
  const mapHeight = 96;
  const x = width - mapWidth - 20;
  const y = height - mapHeight - 22;
  ctx.save();
  ctx.fillStyle = "rgba(6,20,33,.72)";
  roundRect(ctx, x - 10, y - 10, mapWidth + 20, mapHeight + 20, 15);
  ctx.fill();
  ctx.fillStyle = "#ffd338";
  ctx.font = "900 9px Fredoka, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`赛道地图 · LAP ${Math.min(game.player.lap, LAPS_TO_WIN)}/${LAPS_TO_WIN}`, x, y + 4);
  const mapPoint = (point) => ({
    x: x + mapWidth / 2 + (point.x - WORLD.cx) / WORLD.rx * 59,
    y: y + 57 + (point.y - WORLD.cy) / WORLD.ry * 27,
  });
  ctx.strokeStyle = "rgba(255,255,255,.65)";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  trackGeometry.samples.forEach((sample, index) => {
    if (index % 5 !== 0) return;
    const mapped = mapPoint(sample);
    if (index === 0) ctx.moveTo(mapped.x, mapped.y);
    else ctx.lineTo(mapped.x, mapped.y);
  });
  const routeStart = mapPoint(trackGeometry.samples[0]);
  ctx.lineTo(routeStart.x, routeStart.y);
  ctx.stroke();
  const drawDot = (progress, color, radius) => {
    const point = pointAtProgress(progress);
    const mapped = mapPoint(point);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(mapped.x, mapped.y, radius, 0, TAU);
    ctx.fill();
  };
  game.opponents.forEach((opponent) => drawDot(normalizeAngle(opponent.totalProgress * TAU) / TAU, opponent.color, 3));
  selectedTrack.gates.forEach((gate) => drawDot(gate, selectedTrack.theme.accent, 2.5));
  drawDot(game.player.progress, "#ffd338", 5);
  const finish = pointAtProgress(0);
  const mappedFinish = mapPoint(finish);
  ctx.fillStyle = "#fff";
  ctx.fillRect(mappedFinish.x - 1, mappedFinish.y - 8, 2, 9);
  ctx.fillStyle = "#111";
  ctx.fillRect(mappedFinish.x + 1, mappedFinish.y - 8, 7, 5);
  ctx.restore();
}

function lighten(hex, amount) {
  return shadeColor(hex, amount);
}

function darken(hex, amount) {
  return shadeColor(hex, -amount);
}

function shadeColor(hex, amount) {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = clamp((value >> 16) + Math.round(255 * amount / 100), 0, 255);
  const g = clamp(((value >> 8) & 0xff) + Math.round(255 * amount / 100), 0, 255);
  const b = clamp((value & 0xff) + Math.round(255 * amount / 100), 0, 255);
  return `rgb(${r},${g},${b})`;
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
  selectedTrack.gates.forEach((gate, index) => drawGate(gate, index));
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

paintDriverSelection();
paintSelectedDriver();
paintTrackSelection();
paintSelectedTrack();
resizeCanvas();
updateOpponents(0);
updateHud();
render();
requestAnimationFrame(frame);
