import { AI_QUESTIONS, isCorrectOption, localizeQuestion } from "/monopoly/questions.js";
import { addCastlePoints, getEquippedLoadout } from "/castle/castle.js";
import { initI18n, onLangChange, applyDom, getLang, t } from "/js/i18n.js";
import { mountLobbyExit } from "/js/lobby-exit.js";
import {
  drawFlightGear,
  drawOrbitAura,
  drawCape,
  drawHeadGear,
  drawChestCharm,
  drawBalloons,
  drawPet,
  spawnWingTrail,
  spawnBalloonTrail,
  spawnCosmeticTrail,
  spawnFireworkBloom,
  plotFromCtx,
  backAnchorX,
  DEFAULT_FACING,
} from "/castle/cosmetics-draw.js?v=4";
import { resolveEquipFx, isOrbitTrail, isBloomTrail } from "/castle/equip-fx.js?v=4";

initI18n({ toggleHost: "#lang-host" });
onLangChange(() => {
  applyDom();
  if (typeof paintRaceLoadout === "function") paintRaceLoadout();
  if (typeof paintDriverSelection === "function") {
    paintDriverSelection();
    paintSelectedDriver();
    paintTrackSelection();
    paintSelectedTrack();
  }
  if (typeof updateHud === "function" && game) updateHud();
  if (activeQuestion && typeof refreshQuizUi === "function") {
    refreshQuizUi();
    if (activeQuestion.answered && activeQuestion.pendingEffect) {
      paintQuizResult(activeQuestion.pendingEffect, !!activeQuestion.wasCorrect);
    }
  }
  if (game?.mode === "finished" && typeof paintFinishUi === "function") {
    paintFinishUi();
  }
});
mountLobbyExit();

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
    nameEn: "Cloud Ring",
    icon: "☁️",
    art: "/assets/race/clay/track-cloud.png",
    subtitle: "宽阔高速 · 长直道",
    length: "4.1 km",
    level: "入门",
    levelEn: "Beginner",
    world: { width: 2200, height: 1300, cx: 1100, cy: 650, rx: 820, ry: 470 },
    roadWidth: 142,
    startIndex: 2,
    route: [
      [-0.92, 0.18], [-0.72, -0.46], [-0.20, -0.70], [0.36, -0.62],
      [0.88, -0.26], [0.78, 0.30], [0.38, 0.66], [-0.18, 0.72],
      [-0.68, 0.56],
    ],
    gates: [0.22, 0.48, 0.74],
    theme: {
      style: "clay",
      skyTop: "#7ec8f0", skyMid: "#b9e4ff", skyBottom: "#eef8ff",
      cloud: "#ffffff", sun: "#ffe6a8",
      voidA: "#c8e9ff", voidB: "#d9f0ff",
      roadA: "#f0c49a", roadB: "#e8b888",
      curbA: "#f7f4ef", curbB: "#7ecfc4",
      accent: "#ff8f5a", flag: "#ff7a3a",
      islandA: "#f7b7a3", islandB: "#8fd3a8",
    },
  },
  {
    id: "neon-harbor",
    name: "霓虹港湾",
    nameEn: "Neon Harbor",
    icon: "🌃",
    art: "/assets/race/clay/track-neon.png",
    subtitle: "连续弯道 · 霓虹夜景",
    length: "4.0 km",
    level: "进阶",
    levelEn: "Advanced",
    world: { width: 2500, height: 1400, cx: 1250, cy: 700, rx: 940, ry: 500 },
    roadWidth: 138,
    startIndex: 2,
    route: [
      [-0.94, 0.34], [-0.82, -0.26], [-0.46, -0.68], [-0.02, -0.62],
      [0.12, -0.18], [0.48, -0.58], [0.90, -0.40], [0.82, 0.08],
      [0.42, 0.24], [0.24, 0.70], [-0.26, 0.74], [-0.40, 0.26],
      [-0.72, 0.06],
    ],
    gates: [0.18, 0.42, 0.66, 0.88],
    theme: {
      style: "clay",
      skyTop: "#3d2f78", skyMid: "#6b4ea8", skyBottom: "#d8b4f0",
      cloud: "#f3e8ff", sun: "#ffc4ef",
      voidA: "#4a3a86", voidB: "#6a4ea0",
      roadA: "#c9b8e8", roadB: "#b5a0db",
      curbA: "#efe8ff", curbB: "#f15dff",
      accent: "#f15dff", flag: "#ff8ad8",
      islandA: "#9b7ad6", islandB: "#6ec8c0",
    },
  },
  {
    id: "aurora-snow",
    name: "极光雪原",
    nameEn: "Aurora Tundra",
    icon: "❄️",
    art: "/assets/race/clay/track-aurora.png",
    subtitle: "超长赛程 · 高速挑战",
    length: "5.1 km",
    level: "挑战",
    levelEn: "Challenge",
    world: { width: 2750, height: 1500, cx: 1375, cy: 750, rx: 1040, ry: 550 },
    roadWidth: 134,
    startIndex: 3,
    route: [
      [-0.94, 0.42], [-0.84, -0.18], [-0.56, -0.68], [-0.18, -0.48],
      [0.08, -0.78], [0.52, -0.62], [0.88, -0.24], [0.58, 0.04],
      [0.92, 0.38], [0.54, 0.72], [0.12, 0.46], [-0.16, 0.76],
      [-0.52, 0.56], [-0.42, 0.16], [-0.78, 0.02],
    ],
    gates: [0.16, 0.38, 0.58, 0.78],
    theme: {
      style: "clay",
      skyTop: "#2f5f8f", skyMid: "#6eb8c8", skyBottom: "#dff7f2",
      cloud: "#f4fffc", sun: "#d5fff8",
      voidA: "#b8e4ea", voidB: "#d2f0f2",
      roadA: "#e8f2f5", roadB: "#d5e6ec",
      curbA: "#ffffff", curbB: "#73ffca",
      accent: "#5ec4ff", flag: "#ff9f7a",
      islandA: "#d8edf2", islandB: "#9fd3c0",
    },
  },
];
const WORLD = { ...TRACKS[0].world };
const DRIVERS = [
  {
    id: "spark",
    name: "闪电学员",
    nameEn: "Lightning Learner",
    title: "极速新星",
    titleEn: "Speed Rookie",
    emoji: "🧑‍🚀",
    art: "/assets/race/clay/driver-spark.png",
    color: "#6ec4ff",
    skill: "开局短暂知识涡轮（答对可延续加速）",
    skillEn: "Short knowledge turbo at race start",
    stats: { speed: 88, acceleration: 82, handling: 66 },
    kart: {
      body: "#6ec4ff",
      bodyDeep: "#3a9de0",
      accent: "#ffffff",
      seat: "#2c3038",
      emblem: "bolt",
      driver: "astronaut",
    },
  },
  {
    id: "bubble",
    name: "泡泡工程师",
    nameEn: "Bubble Engineer",
    title: "防护专家",
    titleEn: "Safety Specialist",
    emoji: "👩‍🔬",
    art: "/assets/race/clay/driver-bubble.png",
    color: "#e8a06a",
    skill: "开局携带事实护盾，抵消一次答错惩罚",
    skillEn: "Start with a fact shield against one miss",
    stats: { speed: 72, acceleration: 86, handling: 82 },
    kart: {
      body: "#e8a06a",
      bodyDeep: "#c87a48",
      accent: "#ffffff",
      seat: "#2c3038",
      emblem: "gear",
      driver: "engineer",
    },
  },
  {
    id: "claw",
    name: "云爪侦探",
    nameEn: "Cloud-Paw Detective",
    title: "答题猎手",
    titleEn: "Quiz Hunter",
    emoji: "🦊",
    art: "/assets/race/clay/driver-claw.png",
    color: "#d2a878",
    skill: "答对时更容易抽到强力涡轮",
    skillEn: "Correct answers more often yield turbo",
    stats: { speed: 80, acceleration: 72, handling: 94 },
    kart: {
      body: "#d2a878",
      bodyDeep: "#b08655",
      accent: "#fff8ef",
      seat: "#3a3030",
      emblem: "paw",
      driver: "fox",
    },
  },
  {
    id: "aurora",
    name: "极光领航员",
    nameEn: "Aurora Navigator",
    title: "稳定大师",
    titleEn: "Stability Master",
    emoji: "🐧",
    art: "/assets/race/clay/driver-aurora.png",
    color: "#7ecfc0",
    skill: "开局获得专注引擎，巡航更稳",
    skillEn: "Start with Focus Engine for steady cruise",
    stats: { speed: 76, acceleration: 78, handling: 88 },
    kart: {
      body: "#7ecfc0",
      bodyDeep: "#4eaea0",
      accent: "#ffffff",
      seat: "#2c3038",
      emblem: "compass",
      driver: "penguin",
    },
  },
];

const RIVAL_STYLES = [
  { avatar: "fox", body: "#ef6b6b", bodyDeep: "#c94a4a", emblem: "bolt" },
  { avatar: "rabbit", body: "#9b7ad6", bodyDeep: "#7354b0", emblem: "paw" },
  { avatar: "bear", body: "#c48a4a", bodyDeep: "#9a6832", emblem: "gear" },
  { avatar: "cat", body: "#f2a04a", bodyDeep: "#d07828", emblem: "bolt" },
  { avatar: "hawk", body: "#8b6b3a", bodyDeep: "#6a4e28", emblem: "compass" },
];

function isEn() {
  return getLang() === "en";
}

function driverLabel(driver = selectedDriver) {
  return isEn() ? driver.nameEn : driver.name;
}

function trackLabel(track = selectedTrack) {
  return isEn() ? track.nameEn : track.name;
}

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
  questionTitle: document.getElementById("question-title"),
  questionStem: document.getElementById("question-stem"),
  answers: document.getElementById("answer-list"),
  feedback: document.getElementById("answer-feedback"),
  quizContinue: document.getElementById("quiz-continue"),
};

function createPlayer() {
  const start = pointAtProgress(START_PROGRESS, -18);
  return {
    x: start.x,
    y: start.y,
    angle: start.angle,
    speed: 0,
    totalProgress: START_PROGRESS,
    lap: 1,
    progress: START_PROGRESS,
    previousProgress: START_PROGRESS,
    lane: -18,
    boostTimer: 0,
    focusTimer: 0,
    slowTimer: 0,
    stallTimer: 0,
    spinTimer: 0,
    shield: false,
    onRoad: true,
    color: selectedDriver.color,
    driverId: selectedDriver.id,
  };
}
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
let loadout = null;
const cosmeticFx = [];
let kartTrailTick = 0;

function refreshLoadout() {
  try {
    loadout = getEquippedLoadout();
  } catch (_) {
    loadout = null;
  }
  paintRaceLoadout();
}

function paintRaceLoadout() {
  const chip = document.getElementById("race-loadout-chip");
  const portrait = document.getElementById("driver-portrait");
  if (portrait) {
    portrait.dataset.frame = loadout?.frame?.frameStyle || "";
  }
  if (!chip) return;
  if (!loadout || (!loadout.title && !loadout.pet && !loadout.trail && !loadout.frame && !loadout.decor)) {
    chip.hidden = true;
    return;
  }
  chip.hidden = false;
  const bits = [];
  if (loadout.frame) bits.push(loadout.frame.icon);
  if (loadout.title) bits.push(loadout.title.titleText || loadout.title.name);
  if (loadout.pet) bits.push(loadout.pet.icon);
  if (loadout.trail) bits.push(loadout.trail.icon);
  chip.innerHTML = `<span>${t("race.loadoutChip")}</span><strong>${bits.join(" · ")}</strong>`;
  chip.dataset.frame = loadout.frame?.frameStyle || "";
}

function spawnKartTrail(x, y) {
  if (!loadout?.trailStyle || isBloomTrail(loadout.trailStyle)) return;
  if (isOrbitTrail(loadout.trailStyle)) return;
  if (cosmeticFx.length > 80) return;
  spawnCosmeticTrail(cosmeticFx, x, y + 20, loadout.trailStyle, {
    kind: undefined,
    t: game.elapsed,
    count: loadout.trailStyle === "aurora" ? 4 : 2,
  });
}

function spawnRaceFireworks(cx, cy) {
  spawnFireworkBloom(cosmeticFx, cx, cy, {
    count: 24,
    rings: 2,
    speed: 110,
    life: 0.9,
  });
}

function updateCosmeticFx(dt) {
  for (let i = cosmeticFx.length - 1; i >= 0; i -= 1) {
    const p = cosmeticFx[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 120 * dt;
    if (p.life <= 0) cosmeticFx.splice(i, 1);
  }
}

function drawCosmeticFx() {
  cosmeticFx.forEach((p) => {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    if (p.icon) {
      ctx.font = `${p.size || 16}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(p.icon, p.x, p.y);
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  });
  ctx.globalAlpha = 1;
}

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

function createOpponents() {
  const roster = [
    { name: "像素狐", nameEn: "Pixel Fox", color: "#ef6b6b", avatar: "🦊" },
    { name: "云端兔", nameEn: "Cloud Rabbit", color: "#9b7ad6", avatar: "🐰" },
    { name: "量子熊", nameEn: "Quantum Bear", color: "#c48a4a", avatar: "🐻" },
    { name: "逻辑猫", nameEn: "Logic Cat", color: "#f2a04a", avatar: "🐱" },
    { name: "数据鹰", nameEn: "Data Hawk", color: "#8b6b3a", avatar: "🦅" },
  ];
  return roster.map((racer, index) => ({
    ...racer,
    style: RIVAL_STYLES[index],
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
    button.className = "character-card has-art";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(selected));
    button.style.setProperty("--driver-color", driver.color);
    const title = isEn() ? driver.titleEn : driver.title;
    const name = isEn() ? driver.nameEn : driver.name;
    button.innerHTML = `
      <span class="char-check" aria-hidden="true">✓</span>
      <span class="char-art-wrap">
        <img class="char-art" src="${driver.art}" alt="" loading="lazy" />
      </span>
      <strong>${name}</strong>
      <small>${title}</small>`;
    button.addEventListener("click", () => {
      selectedDriver = driver;
      paintDriverSelection();
      paintSelectedDriver();
    });
    els.characterGrid.appendChild(button);
  });
}

function paintSelectedDriver() {
  els.driverPortrait.innerHTML = `<img src="${selectedDriver.art}" alt="" />`;
  els.driverPortrait.style.setProperty("--selected-driver-color", selectedDriver.color);
  els.driverName.textContent = driverLabel();
  els.driverSkill.textContent = isEn() ? selectedDriver.skillEn : selectedDriver.skill;
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
    button.className = "track-card has-art";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(selected));
    button.style.setProperty("--track-sky", track.theme.skyTop);
    button.style.setProperty("--track-ground", track.theme.islandB || track.theme.voidA);
    button.style.setProperty("--track-sun", track.theme.sun);
    const name = isEn() ? track.nameEn : track.name;
    button.innerHTML = `
      <span class="track-check">✓</span>
      <span class="track-art-wrap">
        <img class="track-art" src="${track.art}" alt="" loading="lazy" />
      </span>
      <strong>${name}</strong>
      <small>${track.icon} ${track.length}</small>`;
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
  els.selectedTrackName.textContent = trackLabel();
  els.selectedTrackLength.textContent = selectedTrack.length;
  els.selectedTrackGates.textContent = isEn()
    ? `${selectedTrack.gates.length} Knowledge Gates/lap`
    : `${selectedTrack.gates.length} 座知识门/圈`;
  els.selectedTrackLevel.textContent = isEn() ? selectedTrack.levelEn : selectedTrack.level;
  els.hudTrackName.textContent = `${trackLabel()} · KNOWLEDGE KART`;
  const label = document.getElementById("start-button-label");
  const startText = isEn()
    ? `START RACE — ${selectedTrack.nameEn}`
    : `开始比赛 — ${selectedTrack.name}`;
  if (label) label.textContent = startText;
  else els.start.textContent = startText;
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
  /* no driving controls — quiz answers are the only player input */
}

function showOverlay(element, visible) {
  element.classList.toggle("is-visible", visible);
  if (element === els.startScreen) {
    document.body.classList.toggle("is-lobby", visible);
  }
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
  announce(
    isEn()
      ? `${selectedTrack.icon} ${trackLabel()} · ${selectedTrack.gates.length} Knowledge Gates / lap`
      : `${selectedTrack.icon} ${trackLabel()} · 前方知识门 ${selectedTrack.gates.length} 座/圈`,
  );
}

function applyDriverStartSkill() {
  const player = game.player;
  if (selectedDriver.id === "spark") {
    player.boostTimer = 2.2;
  } else if (selectedDriver.id === "bubble") {
    player.shield = true;
  } else if (selectedDriver.id === "aurora") {
    player.focusTimer = 5;
  }
  player.speed = playerCruiseTarget();
  syncPlayerRailPose();
}

function startRace() {
  countdownToken += 1;
  refreshLoadout();
  game = createGame();
  activeQuestion = null;
  particles.length = 0;
  cosmeticFx.length = 0;
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

function playerCruiseTarget() {
  const player = game.player;
  const speedStat = .88 + selectedDriver.stats.speed / 700;
  const accelStat = .92 + selectedDriver.stats.acceleration / 900;
  let cruise = 236 * speedStat * accelStat;
  if (player.focusTimer > 0) cruise *= 1.14;
  if (player.boostTimer > 0) cruise *= 1.42;
  if (player.slowTimer > 0) cruise *= 0.48;
  if (player.stallTimer > 0) cruise *= 0.08;
  if (player.spinTimer > 0) cruise *= 0.35;
  return cruise;
}

function updatePlayer(dt) {
  const player = game.player;
  player.onRoad = true;

  const target = playerCruiseTarget();
  const blend = player.boostTimer > 0 || player.stallTimer > 0 ? 4.2 : 2.4;
  player.speed += (target - player.speed) * Math.min(1, dt * blend);

  const previousTotal = player.totalProgress;
  player.totalProgress += player.speed * dt / trackLapLength();

  if (player.totalProgress >= LAPS_TO_WIN) {
    player.totalProgress = LAPS_TO_WIN;
    player.progress = 0;
    player.lap = LAPS_TO_WIN + 1;
    syncPlayerRailPose();
    finishRace();
    return;
  }

  const prevFloor = Math.floor(previousTotal);
  const nextFloor = Math.floor(player.totalProgress);
  const previous = previousTotal - prevFloor;
  const next = player.totalProgress - nextFloor;
  player.previousProgress = previous;
  player.progress = next;

  const nextLap = nextFloor + 1;
  if (nextLap > player.lap) {
    player.lap = nextLap;
    announce(`第 ${player.lap} 圈！`);
  } else {
    player.lap = nextLap;
  }

  // Lane wobble keeps the kart visually alive without player steering.
  const handling = .84 + selectedDriver.stats.handling / 520;
  player.lane = -18 + Math.sin(game.elapsed * 1.1 * handling) * 5;
  syncPlayerRailPose();

  if (player.boostTimer > 0 && Math.random() < dt * 28) emitParticle(player, "#5ff2ff", 1.7);
  ["boostTimer", "focusTimer", "slowTimer", "stallTimer", "spinTimer"].forEach((key) => {
    player[key] = Math.max(0, player[key] - dt);
  });

  if (player.totalProgress > previousTotal) {
    if (nextFloor > prevFloor) {
      checkKnowledgeGates(prevFloor, previous, 1);
      checkKnowledgeGates(nextFloor, 0, next);
    } else {
      checkKnowledgeGates(nextFloor, previous, next);
    }
  }
  resolveKartContacts();
}

function syncPlayerRailPose() {
  const player = game.player;
  const point = pointAtProgress(player.progress, player.lane);
  player.x = point.x;
  player.y = point.y;
  player.angle = point.angle + (player.spinTimer > 0 ? Math.sin(game.elapsed * 14) * 0.55 : 0);
}

function checkKnowledgeGates(lapFloor, previous, next) {
  if (next < previous || next - previous > 0.25) return;
  for (let index = 0; index < selectedTrack.gates.length; index += 1) {
    const gate = selectedTrack.gates[index];
    const key = `${lapFloor}-${index}`;
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
    const distance = Math.hypot(player.x - opponent.x, player.y - opponent.y);
    if (distance > 0 && distance < 38) {
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
  return game.player.totalProgress;
}

function getPosition() {
  const total = getPlayerTotalProgress();
  return 1 + game.opponents.filter((opponent) => opponent.totalProgress > total).length;
}

function currentStandings() {
  return [
    {
      id: "player",
      name: driverLabel(),
      avatar: selectedDriver.emoji,
      color: selectedDriver.color,
      total: getPlayerTotalProgress(),
      isPlayer: true,
    },
    ...game.opponents.map((opponent, index) => ({
      id: `ai-${index}`,
      name: isEn() ? opponent.nameEn : opponent.name,
      avatar: opponent.avatar,
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
  els.rankLapLabel.textContent = isEn()
    ? `LAP ${Math.min(game.player.lap, LAPS_TO_WIN)}`
    : `第 ${Math.min(game.player.lap, LAPS_TO_WIN)} 圈`;
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
      <span>${racer.name}${racer.isPlayer ? t("race.you") : ""}</span>
      <span class="final-rank-time">${racer.finishTime != null ? formatTime(racer.finishTime) : t("race.racing")}</span>
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
  game.player.speed *= .55;
  const question = nextQuestion();
  const order = shuffle(question.options.map((_, index) => index));
  activeQuestion = { question, order, answered: false, pendingEffect: null };
  refreshQuizUi();
  els.feedback.hidden = true;
  els.feedback.className = "answer-feedback";
  els.feedback.innerHTML = "";
  els.quizContinue.hidden = true;
  showOverlay(els.quiz, true);
}

function refreshQuizUi() {
  if (!activeQuestion) return;
  const question = localizeQuestion(activeQuestion.question, getLang());
  els.questionDomain.textContent = question.domain;
  els.questionStem.textContent = question.stem;
  if (els.questionTitle) els.questionTitle.textContent = t("race.quizTitle");
  els.answers.innerHTML = "";
  activeQuestion.order.forEach((optionIndex, displayIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.disabled = activeQuestion.answered;
    button.innerHTML = `<span class="answer-letter">${LETTERS[displayIndex]}</span><span>${question.options[optionIndex]}</span>`;
    if (activeQuestion.answered) {
      if (isCorrectOption(activeQuestion.question, optionIndex)) button.classList.add("is-correct");
      if (
        !activeQuestion.wasCorrect
        && optionIndex === activeQuestion.chosenOptionIndex
      ) {
        button.classList.add("is-wrong");
      }
    }
    button.addEventListener("click", () => answerQuestion(optionIndex, button));
    els.answers.appendChild(button);
  });
}

function makeEffect(id, icon) {
  return {
    id,
    icon,
    name: t(`race.fx.${id}`),
    description: t(`race.fx.${id}Desc`),
  };
}

function choosePositiveEffect() {
  const effects = [
    makeEffect("turbo", "🚀"),
    makeEffect("shield", "🛡️"),
    makeEffect("focus", "⚡"),
  ];
  if (selectedDriver.id === "claw" && Math.random() < 0.55) {
    return effects[0];
  }
  return effects[Math.floor(Math.random() * effects.length)];
}

function chooseNegativeEffect() {
  if (game.player.shield) {
    return makeEffect("blocked", "🛡️");
  }
  const effects = [
    makeEffect("slow", "🌫️"),
    makeEffect("stall", "⛔"),
    makeEffect("spin", "🌀"),
  ];
  return effects[Math.floor(Math.random() * effects.length)];
}

function localizeEffect(effect) {
  if (!effect?.id) return effect;
  return {
    ...effect,
    name: t(`race.fx.${effect.id}`),
    description: t(`race.fx.${effect.id}Desc`),
  };
}

function paintQuizResult(effect, correct) {
  const fx = localizeEffect(effect);
  els.feedback.hidden = false;
  els.feedback.className = `answer-feedback ${correct ? "correct" : "wrong"}`;
  const displayQ = localizeQuestion(activeQuestion.question, getLang());
  els.feedback.innerHTML = `
    <strong>${t(correct ? "race.correctFx" : "race.wrongFx", {
      icon: fx.icon,
      name: fx.name,
    })}</strong>
    <span>${displayQ.explain || ""}</span>`;
  els.quizContinue.textContent = t(correct ? "race.claimFx" : "race.takeFx", {
    name: fx.name,
  });
  els.quizContinue.hidden = false;
}

function answerQuestion(optionIndex, selectedButton) {
  if (!activeQuestion || activeQuestion.answered) return;
  activeQuestion.answered = true;
  game.answered += 1;
  const correct = isCorrectOption(activeQuestion.question, optionIndex);
  activeQuestion.wasCorrect = correct;
  activeQuestion.chosenOptionIndex = optionIndex;
  if (correct) {
    game.correct += 1;
    if (loadout?.petBonus) {
      // 伙伴助威：短暂涡轮倾向
      game.player.boostTimer = Math.max(game.player.boostTimer, 1.2);
    }
  }
  const buttons = [...els.answers.children];
  buttons.forEach((button, displayIndex) => {
    button.disabled = true;
    const originalIndex = activeQuestion.order[displayIndex];
    if (isCorrectOption(activeQuestion.question, originalIndex)) button.classList.add("is-correct");
  });
  if (!correct) selectedButton.classList.add("is-wrong");

  const effect = correct ? choosePositiveEffect() : chooseNegativeEffect();
  activeQuestion.pendingEffect = effect;
  paintQuizResult(effect, correct);
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
  } else if (effect.id === "stall") {
    player.stallTimer = Math.max(player.stallTimer, 2.6);
    player.speed *= .12;
  } else if (effect.id === "spin") {
    player.spinTimer = Math.max(player.spinTimer, 1.3);
    player.speed *= .42;
  } else if (effect.id === "blocked") {
    player.shield = false;
  }
  const fx = localizeEffect(effect);
  announce(t("race.announceFx", { icon: fx.icon, name: fx.name, desc: fx.description }), 2200);
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
  paintFinishUi();
  showOverlay(els.finishScreen, true);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  try {
    const gain = 60 + game.correct * 25 + (game.finalPosition === 1 ? 100 : 0);
    addCastlePoints(gain);
  } catch (_) { /* ignore */ }
  if (loadout?.trailStyle === "fireworks") {
    spawnRaceFireworks(width / 2, height * 0.4);
  }
  if (loadout?.parts?.emote) {
    announce("🦜 鹦鹉为你欢呼！装扮结算特效触发");
  }
}

function paintFinishUi() {
  if (!game || game.finalPosition == null) return;
  const won = game.finalPosition === 1;
  els.finishIcon.textContent = won ? "🏆" : game.finalPosition <= 3 ? "🏅" : "🏁";
  els.finishTitle.textContent = t(won ? "race.finishWin" : "race.finishDone");
  els.finishSummary.textContent = t(won ? "race.finishWinSummary" : "race.finishSummary", {
    track: trackLabel(),
  });
  els.finishPosition.textContent = `${game.finalPosition} / ${RACER_COUNT}`;
  els.finishTime.textContent = formatTime(game.elapsed);
  els.finishAnswers.textContent = `${game.correct} / ${game.answered}`;
  renderFinalRanking();
}

function activeEffect() {
  const player = game.player;
  if (player.boostTimer > 0) return { name: t("race.fx.turbo"), icon: "🚀", type: "positive" };
  if (player.focusTimer > 0) return { name: t("race.fx.focus"), icon: "⚡", type: "positive" };
  if (player.shield) return { name: t("race.fx.shield"), icon: "🛡️", type: "positive" };
  if (player.stallTimer > 0) return { name: t("race.fx.stall"), icon: "⛔", type: "negative" };
  if (player.slowTimer > 0) return { name: t("race.fx.slow"), icon: "🌫️", type: "negative" };
  if (player.spinTimer > 0) return { name: t("race.fx.spin"), icon: "🌀", type: "negative" };
  return { name: t("race.itemWait"), icon: "◇", type: "" };
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
    : game.player.focusTimer > 0
      ? "FOCUS"
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
  const horizon = height * .31;
  const theme = selectedTrack.theme;
  drawSky(width, height, horizon);
  drawFloatingIslands(width, height, horizon);

  const playerProgress = game.player.progress;
  const basePoint = pointAtProgress(playerProgress);
  const lateral = (game.player.x - basePoint.x) * basePoint.nx
    + (game.player.y - basePoint.y) * basePoint.ny;
  const segmentCount = 96;
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

  // Soft cloud void under the floating track (not green grass)
  for (let index = segmentCount - 1; index >= 0; index -= 1) {
    const far = slices[index + 1];
    const near = slices[index];
    const stripe = Math.floor((playerProgress + index * stepProgress) * 180);
    ctx.fillStyle = stripe % 2 ? theme.voidA : theme.voidB;
    ctx.fillRect(0, far.y, width, Math.max(1, near.y - far.y + 1));
    drawRoadQuad(far, near, stripe);
    if (index % 5 === 0 && index > 2) {
      drawRoadsideObject(near, index, width);
    }
  }

  drawCloudBanks(width, height, horizon);
  drawUpcomingGates3D(slices, playerProgress);
  drawOpponents3D(slices, playerProgress);
  drawSpeedEffects(width, height);
  drawPlayerKart3D(width / 2, height - 84);
  drawCosmeticFx();
  drawMiniMap(width, height);
}

function drawSky(width, height, horizon) {
  const theme = selectedTrack.theme;
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, theme.skyTop);
  sky.addColorStop(0.42, theme.skyMid || lighten(theme.skyTop, 18));
  sky.addColorStop(0.72, theme.skyBottom);
  sky.addColorStop(1, lighten(theme.skyBottom, 8));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Soft sun / glow
  const sunX = width * 0.82;
  const sunY = horizon * 0.28;
  const glow = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 110);
  glow.addColorStop(0, theme.sun);
  glow.addColorStop(0.45, `${theme.sun}88`);
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 110, 0, TAU);
  ctx.fill();

  // Big puffy clay clouds
  for (let index = 0; index < 8; index += 1) {
    const drift = game.elapsed * (4 + index * 0.6);
    const x = ((index * 193 + drift) % (width + 240)) - 120;
    const y = 28 + (index % 4) * (horizon * 0.18);
    const s = 0.85 + (index % 3) * 0.22;
    drawPuffyCloud(x, y, s, theme.cloud || "#fff");
  }

  // Tiny floating clay stars (match gate motif)
  for (let index = 0; index < 6; index += 1) {
    const x = ((index * 157 + game.elapsed * 8) % (width + 40)) - 20;
    const y = 36 + (index % 3) * (horizon * 0.22);
    if (typeof drawClayStar === "function") {
      drawClayStar(x, y, 4 + (index % 2), 5, "#ffe066");
    }
  }
}

function drawPuffyCloud(x, y, scale, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  ctx.ellipse(x, y, 48 * scale, 18 * scale, 0, 0, TAU);
  ctx.ellipse(x + 28 * scale, y - 8 * scale, 36 * scale, 20 * scale, 0, 0, TAU);
  ctx.ellipse(x - 26 * scale, y - 4 * scale, 30 * scale, 16 * scale, 0, 0, TAU);
  ctx.ellipse(x + 8 * scale, y - 16 * scale, 26 * scale, 16 * scale, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawFloatingIslands(width, height, horizon) {
  const theme = selectedTrack.theme;
  const islands = [
    { x: width * 0.14, y: horizon * 0.62, s: 0.95, kind: "castle" },
    { x: width * 0.86, y: horizon * 0.58, s: 1.05, kind: "books" },
    { x: width * 0.48, y: horizon * 0.42, s: 0.55, kind: "palm" },
    { x: width * 0.72, y: horizon * 0.78, s: 0.7, kind: "palm" },
  ];
  islands.forEach((island, i) => {
    const bob = Math.sin(game.elapsed * 0.7 + i) * 3;
    ctx.save();
    ctx.translate(island.x, island.y + bob);
    ctx.scale(island.s, island.s);
    // cloud base
    ctx.fillStyle = "rgba(255,255,255,.88)";
    ctx.beginPath();
    ctx.ellipse(0, 28, 78, 22, 0, 0, TAU);
    ctx.ellipse(-36, 24, 40, 16, 0, 0, TAU);
    ctx.ellipse(40, 26, 36, 15, 0, 0, TAU);
    ctx.fill();
    // land mound
    ctx.fillStyle = theme.islandB || "#8fd3a8";
    ctx.beginPath();
    ctx.ellipse(0, 18, 62, 18, 0, 0, TAU);
    ctx.fill();
    if (island.kind === "castle") drawClayCastle(theme);
    else if (island.kind === "books") drawClayBooks(theme);
    else drawClayPalmCluster();
    ctx.restore();
  });
}

function drawClayCastle(theme) {
  const wall = "#f4b8b0";
  // main keep
  ctx.fillStyle = wall;
  roundRect(ctx, -36, -52, 72, 62, 12);
  ctx.fill();
  // side towers
  roundRect(ctx, -54, -36, 24, 46, 9);
  ctx.fill();
  roundRect(ctx, 30, -42, 24, 52, 9);
  ctx.fill();
  // door
  ctx.fillStyle = "#d48a6a";
  roundRect(ctx, -10, -8, 20, 18, 8);
  ctx.fill();
  // roofs — soft orange cones
  ctx.fillStyle = "#f08a55";
  [[-42, -36, -54], [0, -52, -84], [42, -42, -68]].forEach(([cx, baseY, tipY]) => {
    ctx.beginPath();
    ctx.moveTo(cx - 18, baseY);
    ctx.lineTo(cx, tipY);
    ctx.lineTo(cx + 18, baseY);
    ctx.closePath();
    ctx.fill();
    drawClayStar(cx, tipY - 4, 5, 5, "#ffd338");
  });
  // windows
  ctx.fillStyle = "#ffe7a8";
  roundRect(ctx, -16, -34, 10, 12, 3);
  ctx.fill();
  roundRect(ctx, 6, -34, 10, 12, 3);
  ctx.fill();
  // palm
  ctx.fillStyle = "#5fbf7a";
  ctx.beginPath();
  ctx.arc(-48, 6, 9, 0, TAU);
  ctx.arc(50, 8, 8, 0, TAU);
  ctx.fill();
}

function drawClayBooks(theme) {
  const stack = [
    { y: 8, w: 70, h: 14, c: "#f28b6b" },
    { y: -6, w: 62, h: 14, c: "#6ec4ff" },
    { y: -20, w: 54, h: 14, c: "#9ad27a" },
    { y: -34, w: 46, h: 14, c: "#c9a0ff" },
  ];
  stack.forEach((book) => {
    ctx.fillStyle = book.c;
    roundRect(ctx, -book.w / 2, book.y, book.w, book.h, 4);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.fillRect(-book.w / 2 + 4, book.y + 3, 8, book.h - 6);
  });
  // chart board
  ctx.fillStyle = "#fff8ef";
  roundRect(ctx, 18, -70, 42, 34, 6);
  ctx.fill();
  ctx.strokeStyle = theme.accent || "#ff8f5a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(26, -44);
  ctx.lineTo(34, -56);
  ctx.lineTo(42, -50);
  ctx.lineTo(52, -64);
  ctx.stroke();
  ctx.fillStyle = "#7ecfc4";
  ctx.fillRect(26, -42, 5, 8);
  ctx.fillStyle = "#f28b6b";
  ctx.fillRect(34, -48, 5, 14);
  ctx.fillStyle = "#6ec4ff";
  ctx.fillRect(42, -46, 5, 12);
}

function drawClayPalmCluster() {
  ctx.fillStyle = "#6ecf88";
  ctx.beginPath();
  ctx.arc(-10, 0, 12, 0, TAU);
  ctx.arc(12, 2, 10, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#c48a4a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.quadraticCurveTo(4, -10, 10, -28);
  ctx.stroke();
  ctx.fillStyle = "#4fbf6e";
  for (let i = 0; i < 4; i += 1) {
    const a = -1.2 + i * 0.55;
    ctx.beginPath();
    ctx.ellipse(10 + Math.cos(a) * 12, -28 + Math.sin(a) * 6, 12, 5, a, 0, TAU);
    ctx.fill();
  }
}

function drawCloudBanks(width, height, horizon) {
  ctx.fillStyle = "rgba(255,255,255,.35)";
  for (let i = 0; i < 4; i += 1) {
    const y = horizon + 40 + i * ((height - horizon) / 4.5);
    ctx.beginPath();
    ctx.ellipse(width * (0.2 + (i % 3) * 0.25), y, 120 + i * 20, 18, 0, 0, TAU);
    ctx.fill();
  }
}

function drawRoadQuad(far, near, stripe) {
  const theme = selectedTrack.theme;
  // Peach clay pavers
  ctx.fillStyle = stripe % 2 ? theme.roadA : theme.roadB;
  quad(
    far.x - far.half, far.y,
    far.x + far.half, far.y,
    near.x + near.half, near.y,
    near.x - near.half, near.y,
  );
  ctx.fill();

  // Soft seam lines between tiles
  if (stripe % 6 === 0) {
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(far.x - far.half * 0.85, far.y);
    ctx.lineTo(near.x - near.half * 0.85, near.y);
    ctx.moveTo(far.x + far.half * 0.85, far.y);
    ctx.lineTo(near.x + near.half * 0.85, near.y);
    ctx.stroke();
  }

  const farCurb = Math.max(2.5, far.half * .11);
  const nearCurb = Math.max(3.5, near.half * .11);
  const curbTone = stripe % 2 ? theme.curbA : theme.curbB;
  ctx.fillStyle = curbTone;
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
  const theme = selectedTrack.theme;
  const scale = Math.max(.16, (1 - slice.depth) * 1.3);
  const side = index % 2 ? -1 : 1;
  const x = slice.x + side * (slice.half + 26 * scale);
  const y = slice.y;
  ctx.save();
  ctx.translate(x, y);

  if (index % 10 === 0) {
    // Soft clay palm
    ctx.fillStyle = "rgba(0,0,0,.12)";
    ctx.beginPath();
    ctx.ellipse(0, 2 * scale, 14 * scale, 5 * scale, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#c49a62";
    ctx.lineWidth = Math.max(2, 3.5 * scale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(4 * scale, -22 * scale, 2 * scale, -40 * scale);
    ctx.stroke();
    ctx.fillStyle = "#4fbf6e";
    for (let i = 0; i < 5; i += 1) {
      const a = -Math.PI / 2 + (i - 2) * 0.45;
      ctx.beginPath();
      ctx.ellipse(
        2 * scale + Math.cos(a) * 14 * scale,
        -40 * scale + Math.sin(a) * 6 * scale,
        14 * scale,
        5 * scale,
        a,
        0,
        TAU,
      );
      ctx.fill();
    }
  } else {
    // Orange pennant flags along the curb
    ctx.fillStyle = "#d8b48a";
    ctx.fillRect(-1.5 * scale, -36 * scale, 3 * scale, 36 * scale);
    ctx.fillStyle = theme.flag || theme.accent;
    ctx.beginPath();
    ctx.moveTo(1.5 * scale, -36 * scale);
    ctx.lineTo(18 * scale, -30 * scale);
    ctx.lineTo(1.5 * scale, -24 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.fillRect(-1.5 * scale, -2 * scale, 3 * scale, 2 * scale);
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

function drawClayStar(cx, cy, outerR, points = 5, color = "#ffd338") {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.shadowColor = "rgba(255, 210, 80, 0.55)";
  ctx.shadowBlur = outerR * 0.8;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outerR : outerR * 0.42;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,.45)";
  ctx.beginPath();
  ctx.arc(-outerR * 0.18, -outerR * 0.22, outerR * 0.22, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawKnowledgeGateArch(roadWidth, height, scale) {
  const half = roadWidth / 2;
  const pillarW = Math.max(14, 22 * scale);
  const pillarH = height + 6 * scale;
  const archThickness = Math.max(16, 28 * scale);

  ctx.fillStyle = "rgba(90, 70, 50, 0.16)";
  ctx.beginPath();
  ctx.ellipse(-half, 4 * scale, pillarW * 1.1, 5 * scale, 0, 0, TAU);
  ctx.ellipse(half, 4 * scale, pillarW * 1.1, 5 * scale, 0, 0, TAU);
  ctx.fill();

  const pillarFill = ctx.createLinearGradient(0, -pillarH, 0, 0);
  pillarFill.addColorStop(0, "#fff4e4");
  pillarFill.addColorStop(0.55, "#f0d8b4");
  pillarFill.addColorStop(1, "#e2c194");
  [-half, half].forEach((px) => {
    ctx.fillStyle = pillarFill;
    roundRect(ctx, px - pillarW / 2, -pillarH, pillarW, pillarH, 8 * scale);
    ctx.fill();
    ctx.fillStyle = "#e8b84a";
    roundRect(ctx, px - pillarW / 2 - 1 * scale, -pillarH + 8 * scale, pillarW + 2 * scale, 5 * scale, 2 * scale);
    ctx.fill();
    roundRect(ctx, px - pillarW / 2 - 1 * scale, -18 * scale, pillarW + 2 * scale, 5 * scale, 2 * scale);
    ctx.fill();
    ctx.fillStyle = "#d7b888";
    roundRect(ctx, px - pillarW * 0.72, -8 * scale, pillarW * 1.44, 10 * scale, 4 * scale);
    ctx.fill();
  });

  const outerR = half + pillarW * 0.15;
  const innerR = Math.max(outerR - archThickness, half * 0.55);
  const archCenterY = -height * 0.05;
  const archGrad = ctx.createLinearGradient(0, archCenterY - outerR, 0, -height * 0.2);
  archGrad.addColorStop(0, "#ff9a72");
  archGrad.addColorStop(0.45, "#f06a4c");
  archGrad.addColorStop(1, "#e2553f");
  ctx.fillStyle = archGrad;
  ctx.beginPath();
  ctx.arc(0, archCenterY, outerR, Math.PI, 0, false);
  ctx.arc(0, archCenterY, innerR, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 244, 220, 0.7)";
  ctx.lineWidth = Math.max(2, 4 * scale);
  ctx.beginPath();
  ctx.arc(0, archCenterY, innerR + 2 * scale, Math.PI, 0, false);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 210, 90, 0.75)";
  ctx.lineWidth = Math.max(2, 3.5 * scale);
  ctx.beginPath();
  ctx.arc(0, archCenterY, outerR - 2 * scale, Math.PI, 0, false);
  ctx.stroke();

  const label = "KNOWLEDGE GATE";
  const fontSize = Math.max(7, Math.min(16, roadWidth * 0.085));
  ctx.font = `900 ${fontSize}px Fredoka, Nunito, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const labelRadius = (outerR + innerR) / 2;
  for (let i = 0; i < label.length; i += 1) {
    const t = (i + 0.5) / label.length;
    const angle = Math.PI + 0.32 + t * (Math.PI - 0.64);
    const cx = Math.cos(angle) * labelRadius;
    const cy = archCenterY + Math.sin(angle) * labelRadius;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = "rgba(40, 24, 18, 0.22)";
    ctx.fillText(label[i], 0.6 * scale, 0.6 * scale);
    ctx.fillStyle = "#fffdf8";
    ctx.fillText(label[i], 0, 0);
    ctx.restore();
  }

  drawClayStar(0, archCenterY - outerR - 2 * scale, Math.max(8, 16 * scale), 5, "#ffd338");
  drawClayStar(-half, -pillarH - 6 * scale, Math.max(5, 9 * scale), 5, "#ffe066");
  drawClayStar(half, -pillarH - 6 * scale, Math.max(5, 9 * scale), 5, "#ffe066");

  const box = Math.max(16, 36 * scale);
  const boxY = -height * 0.42;
  const ropeTop = archCenterY - innerR + 4 * scale;
  ctx.strokeStyle = "#c4a06a";
  ctx.lineWidth = Math.max(1.2, 2.2 * scale);
  ctx.beginPath();
  ctx.moveTo(-box * 0.28, ropeTop);
  ctx.lineTo(-box * 0.28, boxY - box / 2);
  ctx.moveTo(box * 0.28, ropeTop);
  ctx.lineTo(box * 0.28, boxY - box / 2);
  ctx.stroke();

  const boxGrad = ctx.createLinearGradient(-box / 2, boxY - box / 2, box / 2, boxY + box / 2);
  boxGrad.addColorStop(0, "#b794ff");
  boxGrad.addColorStop(0.5, "#8b5cf6");
  boxGrad.addColorStop(1, "#6d3fe0");
  ctx.fillStyle = boxGrad;
  roundRect(ctx, -box / 2, boxY - box / 2, box, box, Math.max(6, 10 * scale));
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.85)";
  ctx.lineWidth = Math.max(1.5, 3 * scale);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.28)";
  roundRect(ctx, -box * 0.32, boxY - box * 0.38, box * 0.42, box * 0.22, 4 * scale);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `900 ${Math.max(14, 28 * scale)}px Fredoka, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", 0, boxY + scale);
}

function drawUpcomingGates3D(slices, playerProgress) {
  const lapIndex = game.player.lap - 1;
  let nearestHint = null;
  selectedTrack.gates.forEach((gate, index) => {
    const key = `${lapIndex}-${index}`;
    if (game.usedGates.has(key)) return;
    const distance = progressDistance(gate, playerProgress);
    if (nearestHint == null || distance < nearestHint) nearestHint = distance;
    if (distance > .30) return;
    const slice = sliceForDistance(slices, distance);
    if (!slice) return;
    const scale = Math.max(.2, 1 - slice.depth);
    const roadWidth = slice.half * 1.85;
    const height = Math.max(40, roadWidth * .62);
    ctx.save();
    ctx.translate(slice.x, slice.y);
    drawKnowledgeGateArch(roadWidth, height, scale);
    ctx.restore();
  });

  if (game.mode === "racing" && nearestHint != null && nearestHint < 0.12 && nearestHint > 0.02) {
    const corners = Math.max(1, Math.ceil(nearestHint * 18));
    const tip = isEn()
      ? `${trackLabel()} · Knowledge Gate ahead in ${corners} corners`
      : `${trackLabel()} · 前方知识门约 ${corners} 个弯道`;
    if (els.message.textContent !== tip && !els.message.classList.contains("is-visible")) {
      announce(tip, 1600);
    }
  }
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
    drawRivalKart3D(slice.x + laneOffset, slice.y, scale, opponent, index + 2);
  });
}

function drawKartEmblem(emblem, scale) {
  ctx.save();
  ctx.translate(0, 8 * scale);
  // soft circular badge recess (matches clay art cards)
  ctx.fillStyle = "rgba(0,0,0,.12)";
  ctx.beginPath();
  ctx.arc(0, 0, 13 * scale, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.22)";
  ctx.beginPath();
  ctx.arc(0, 0, 12 * scale, 0, TAU);
  ctx.fill();

  if (emblem === "bolt") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(-2 * scale, -11 * scale);
    ctx.lineTo(6 * scale, -11 * scale);
    ctx.lineTo(1 * scale, -1 * scale);
    ctx.lineTo(8 * scale, -1 * scale);
    ctx.lineTo(-5 * scale, 13 * scale);
    ctx.lineTo(0, 2 * scale);
    ctx.lineTo(-8 * scale, 2 * scale);
    ctx.closePath();
    ctx.fill();
  } else if (emblem === "gear") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * TAU;
      ctx.lineTo(Math.cos(a) * 10 * scale, Math.sin(a) * 10 * scale);
      ctx.lineTo(Math.cos(a + 0.18) * 6.5 * scale, Math.sin(a + 0.18) * 6.5 * scale);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c87a48";
    ctx.beginPath();
    ctx.arc(0, 0, 3 * scale, 0, TAU);
    ctx.fill();
  } else if (emblem === "paw") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(0, 3 * scale, 7 * scale, 6 * scale, 0, 0, TAU);
    ctx.fill();
    [[-7, -3], [7, -3], [-2.5, -8], [2.5, -8]].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.ellipse(px * scale, py * scale, 2.8 * scale, 3.4 * scale, 0, 0, TAU);
      ctx.fill();
    });
  } else {
    // compass / star rose
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(0, -10 * scale);
    ctx.lineTo(3 * scale, -3 * scale);
    ctx.lineTo(10 * scale, 0);
    ctx.lineTo(3 * scale, 3 * scale);
    ctx.lineTo(0, 10 * scale);
    ctx.lineTo(-3 * scale, 3 * scale);
    ctx.lineTo(-10 * scale, 0);
    ctx.lineTo(-3 * scale, -3 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4eaea0";
    ctx.beginPath();
    ctx.arc(0, 0, 2.2 * scale, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawClayWheel(x, y, scale, hubColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(40,30,25,.2)";
  ctx.beginPath();
  ctx.ellipse(1 * scale, 2 * scale, 13 * scale, 6 * scale, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#2a2e36";
  ctx.beginPath();
  ctx.ellipse(0, 0, 12 * scale, 12 * scale, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = hubColor || "#6ec4ff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 5.5 * scale, 5.5 * scale, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.beginPath();
  ctx.arc(-2 * scale, -2 * scale, 2 * scale, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawClayKartBody(scale, kart, { rearGlow = false } = {}) {
  const body = kart.body;
  const deep = kart.bodyDeep;
  const seat = kart.seat || "#2c3038";

  // soft ground shadow
  ctx.fillStyle = "rgba(80,60,40,.18)";
  ctx.beginPath();
  ctx.ellipse(0, 22 * scale, 58 * scale, 12 * scale, 0, 0, TAU);
  ctx.fill();

  // rear thrusters / bumper
  if (rearGlow) {
    const flame = ctx.createLinearGradient(0, 18 * scale, 0, 58 * scale);
    flame.addColorStop(0, "#fff");
    flame.addColorStop(0.35, "#7adfff");
    flame.addColorStop(1, "rgba(90,210,255,0)");
    ctx.fillStyle = flame;
    [[-22, 14], [22, 14]].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.moveTo((px - 8) * scale, py * scale);
      ctx.lineTo((px + 8) * scale, py * scale);
      ctx.lineTo(px * scale, (py + 36 + Math.random() * 10) * scale);
      ctx.closePath();
      ctx.fill();
    });
  }

  // rear wheels first (behind body)
  drawClayWheel(-34 * scale, 14 * scale, scale * 1.05, deep);
  drawClayWheel(34 * scale, 14 * scale, scale * 1.05, deep);

  // main rounded body / fenders
  const bodyGrad = ctx.createLinearGradient(0, -28 * scale, 0, 24 * scale);
  bodyGrad.addColorStop(0, lighten(body, 22));
  bodyGrad.addColorStop(0.45, body);
  bodyGrad.addColorStop(1, deep);
  ctx.fillStyle = bodyGrad;
  // rear shell
  roundRect(ctx, -42 * scale, -8 * scale, 84 * scale, 28 * scale, 14 * scale);
  ctx.fill();
  // hood / nose
  ctx.beginPath();
  ctx.moveTo(-40 * scale, 4 * scale);
  ctx.quadraticCurveTo(-46 * scale, -18 * scale, -18 * scale, -26 * scale);
  ctx.quadraticCurveTo(0, -32 * scale, 18 * scale, -26 * scale);
  ctx.quadraticCurveTo(46 * scale, -18 * scale, 40 * scale, 4 * scale);
  ctx.quadraticCurveTo(36 * scale, 18 * scale, 0, 20 * scale);
  ctx.quadraticCurveTo(-36 * scale, 18 * scale, -40 * scale, 4 * scale);
  ctx.closePath();
  ctx.fill();

  // soft highlight
  ctx.fillStyle = "rgba(255,255,255,.28)";
  ctx.beginPath();
  ctx.ellipse(0, -14 * scale, 22 * scale, 8 * scale, 0, 0, TAU);
  ctx.fill();

  // clay side studs (art cards)
  ctx.fillStyle = "rgba(255,255,255,.55)";
  [[-34, -2], [-34, 8], [34, -2], [34, 8]].forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(px * scale, py * scale, 2.2 * scale, 0, TAU);
    ctx.fill();
  });

  // headlights
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(-28 * scale, 2 * scale, 5 * scale, 4 * scale, 0, 0, TAU);
  ctx.ellipse(28 * scale, 2 * scale, 5 * scale, 4 * scale, 0, 0, TAU);
  ctx.fill();

  // hood emblem
  drawKartEmblem(kart.emblem || "bolt", scale * 0.85);

  // cockpit seat
  ctx.fillStyle = seat;
  roundRect(ctx, -16 * scale, -22 * scale, 32 * scale, 26 * scale, 10 * scale);
  ctx.fill();
  ctx.fillStyle = lighten(seat, 18);
  roundRect(ctx, -12 * scale, -28 * scale, 24 * scale, 12 * scale, 8 * scale);
  ctx.fill();

  // front wheels
  drawClayWheel(-38 * scale, 10 * scale, scale, body);
  drawClayWheel(38 * scale, 10 * scale, scale, body);

  // rear light bars
  ctx.fillStyle = "#ff8a5a";
  roundRect(ctx, -18 * scale, 16 * scale, 12 * scale, 5 * scale, 2 * scale);
  ctx.fill();
  roundRect(ctx, 6 * scale, 16 * scale, 12 * scale, 5 * scale, 2 * scale);
  ctx.fill();
}

function drawClayDriverFigure(scale, kind) {
  ctx.save();
  ctx.translate(0, -18 * scale);

  if (kind === "astronaut") {
    // suit torso
    ctx.fillStyle = "#f4f7fb";
    roundRect(ctx, -14 * scale, -6 * scale, 28 * scale, 26 * scale, 10 * scale);
    ctx.fill();
    ctx.fillStyle = "#6ec4ff";
    roundRect(ctx, -14 * scale, -2 * scale, 28 * scale, 8 * scale, 4 * scale);
    ctx.fill();
    // gloves on wheel
    ctx.fillStyle = "#dfe8f2";
    ctx.beginPath();
    ctx.ellipse(-12 * scale, 14 * scale, 6 * scale, 5 * scale, 0, 0, TAU);
    ctx.ellipse(12 * scale, 14 * scale, 6 * scale, 5 * scale, 0, 0, TAU);
    ctx.fill();
    // helmet
    ctx.fillStyle = "#f7fbff";
    ctx.beginPath();
    ctx.arc(0, -18 * scale, 18 * scale, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#6ec4ff";
    ctx.beginPath();
    ctx.arc(-14 * scale, -16 * scale, 5 * scale, 0, TAU);
    ctx.arc(14 * scale, -16 * scale, 5 * scale, 0, TAU);
    ctx.fill();
    // face opening
    ctx.fillStyle = "#ffe6d2";
    ctx.beginPath();
    ctx.ellipse(0, -16 * scale, 11 * scale, 12 * scale, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.arc(-4 * scale, -18 * scale, 2.2 * scale, 0, TAU);
    ctx.arc(4 * scale, -18 * scale, 2.2 * scale, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = Math.max(1, 1.5 * scale);
    ctx.beginPath();
    ctx.arc(0, -12 * scale, 3 * scale, 0.15, Math.PI - 0.15);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,140,160,.35)";
    ctx.beginPath();
    ctx.ellipse(-7 * scale, -12 * scale, 3 * scale, 2 * scale, 0, 0, TAU);
    ctx.ellipse(7 * scale, -12 * scale, 3 * scale, 2 * scale, 0, 0, TAU);
    ctx.fill();
  } else if (kind === "engineer") {
    ctx.fillStyle = "#e8a06a";
    roundRect(ctx, -13 * scale, -4 * scale, 26 * scale, 24 * scale, 9 * scale);
    ctx.fill();
    ctx.fillStyle = "#8b5a32";
    roundRect(ctx, -15 * scale, -8 * scale, 30 * scale, 8 * scale, 4 * scale);
    ctx.fill();
    // dark gloves
    ctx.fillStyle = "#2c3038";
    ctx.beginPath();
    ctx.ellipse(-12 * scale, 14 * scale, 6 * scale, 5 * scale, 0, 0, TAU);
    ctx.ellipse(12 * scale, 14 * scale, 6 * scale, 5 * scale, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffe6d2";
    ctx.beginPath();
    ctx.arc(0, -18 * scale, 12 * scale, 0, TAU);
    ctx.fill();
    // blonde hair under hat
    ctx.fillStyle = "#f0d060";
    ctx.beginPath();
    ctx.ellipse(-10 * scale, -14 * scale, 4 * scale, 6 * scale, -0.35, 0, TAU);
    ctx.ellipse(10 * scale, -14 * scale, 4 * scale, 6 * scale, 0.35, 0, TAU);
    ctx.fill();
    // white hard hat + gear badge
    ctx.fillStyle = "#f5f5f5";
    roundRect(ctx, -13 * scale, -30 * scale, 26 * scale, 12 * scale, 5 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -30 * scale, 14 * scale, 5 * scale, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#e8a06a";
    ctx.beginPath();
    ctx.arc(-11 * scale, -24 * scale, 2 * scale, 0, TAU);
    ctx.arc(11 * scale, -24 * scale, 2 * scale, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#c87a48";
    ctx.beginPath();
    ctx.arc(0, -24 * scale, 3.2 * scale, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * TAU;
      ctx.lineTo(Math.cos(a) * 2.6 * scale, -24 * scale + Math.sin(a) * 2.6 * scale);
      ctx.lineTo(Math.cos(a + 0.25) * 1.4 * scale, -24 * scale + Math.sin(a + 0.25) * 1.4 * scale);
    }
    ctx.closePath();
    ctx.fill();
    // glasses
    ctx.strokeStyle = "#6a6a6a";
    ctx.lineWidth = Math.max(1.2, 2 * scale);
    ctx.beginPath();
    ctx.arc(-4.5 * scale, -18 * scale, 3.5 * scale, 0, TAU);
    ctx.arc(4.5 * scale, -18 * scale, 3.5 * scale, 0, TAU);
    ctx.moveTo(-1 * scale, -18 * scale);
    ctx.lineTo(1 * scale, -18 * scale);
    ctx.stroke();
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.arc(-4.5 * scale, -18 * scale, 1.4 * scale, 0, TAU);
    ctx.arc(4.5 * scale, -18 * scale, 1.4 * scale, 0, TAU);
    ctx.fill();
  } else if (kind === "fox") {
    // coat
    ctx.fillStyle = "#8b6b55";
    roundRect(ctx, -14 * scale, -6 * scale, 28 * scale, 24 * scale, 9 * scale);
    ctx.fill();
    // chunky rust scarf
    ctx.fillStyle = "#c45a3a";
    roundRect(ctx, -16 * scale, -12 * scale, 32 * scale, 10 * scale, 5 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(12 * scale, -2 * scale, 5 * scale, 8 * scale, 0.2, 0, TAU);
    ctx.fill();
    // head
    ctx.fillStyle = "#e8924a";
    ctx.beginPath();
    ctx.ellipse(0, -20 * scale, 13 * scale, 12 * scale, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fff4e8";
    ctx.beginPath();
    ctx.ellipse(0, -16 * scale, 7 * scale, 6 * scale, 0, 0, TAU);
    ctx.fill();
    // ears
    ctx.fillStyle = "#e8924a";
    ctx.beginPath();
    ctx.moveTo(-10 * scale, -28 * scale);
    ctx.lineTo(-16 * scale, -40 * scale);
    ctx.lineTo(-4 * scale, -30 * scale);
    ctx.closePath();
    ctx.moveTo(10 * scale, -28 * scale);
    ctx.lineTo(16 * scale, -40 * scale);
    ctx.lineTo(4 * scale, -30 * scale);
    ctx.closePath();
    ctx.fill();
    // deerstalker with ear flaps
    ctx.fillStyle = "#6b4428";
    roundRect(ctx, -14 * scale, -34 * scale, 28 * scale, 10 * scale, 4 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-16 * scale, -28 * scale, 5 * scale, 6 * scale, 0.3, 0, TAU);
    ctx.ellipse(16 * scale, -28 * scale, 5 * scale, 6 * scale, -0.3, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-4 * scale, -34 * scale);
    ctx.lineTo(0, -42 * scale);
    ctx.lineTo(4 * scale, -34 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.arc(-4.5 * scale, -20 * scale, 2.2 * scale, 0, TAU);
    ctx.arc(4.5 * scale, -20 * scale, 2.2 * scale, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -15 * scale, 1.6 * scale, 0, TAU);
    ctx.fill();
    // bushy tail
    ctx.fillStyle = "#e8924a";
    ctx.beginPath();
    ctx.ellipse(-24 * scale, 6 * scale, 10 * scale, 6 * scale, -0.55, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fff4e8";
    ctx.beginPath();
    ctx.ellipse(-32 * scale, 4 * scale, 5 * scale, 3.5 * scale, -0.55, 0, TAU);
    ctx.fill();
  } else if (kind === "penguin") {
    ctx.fillStyle = "#6b5a9a";
    roundRect(ctx, -13 * scale, -4 * scale, 26 * scale, 24 * scale, 10 * scale);
    ctx.fill();
    ctx.fillStyle = "#fff8f0";
    roundRect(ctx, -8 * scale, 0, 16 * scale, 16 * scale, 7 * scale);
    ctx.fill();
    // blue scarf
    ctx.fillStyle = "#4aa0d8";
    roundRect(ctx, -14 * scale, -8 * scale, 28 * scale, 7 * scale, 3 * scale);
    ctx.fill();
    ctx.fillStyle = "#3a8fd0";
    roundRect(ctx, 8 * scale, -4 * scale, 6 * scale, 14 * scale, 2 * scale);
    ctx.fill();
    // head
    ctx.fillStyle = "#6b5a9a";
    ctx.beginPath();
    ctx.arc(0, -20 * scale, 13 * scale, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fff8f0";
    ctx.beginPath();
    ctx.ellipse(0, -18 * scale, 8 * scale, 8 * scale, 0, 0, TAU);
    ctx.fill();
    // mint aviator + blue goggles
    ctx.fillStyle = "#7ecfc0";
    roundRect(ctx, -14 * scale, -32 * scale, 28 * scale, 12 * scale, 6 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-12 * scale, -24 * scale, 5 * scale, 6 * scale, 0.2, 0, TAU);
    ctx.ellipse(12 * scale, -24 * scale, 5 * scale, 6 * scale, -0.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#7ec4ff";
    ctx.beginPath();
    ctx.ellipse(-5 * scale, -34 * scale, 4.5 * scale, 3.5 * scale, -0.2, 0, TAU);
    ctx.ellipse(5 * scale, -34 * scale, 4.5 * scale, 3.5 * scale, 0.2, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#c0c8d0";
    ctx.lineWidth = Math.max(1, 1.5 * scale);
    ctx.beginPath();
    ctx.moveTo(-1 * scale, -34 * scale);
    ctx.lineTo(1 * scale, -34 * scale);
    ctx.stroke();
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.arc(-4 * scale, -20 * scale, 2 * scale, 0, TAU);
    ctx.arc(4 * scale, -20 * scale, 2 * scale, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#f0a050";
    ctx.beginPath();
    ctx.moveTo(-3 * scale, -14 * scale);
    ctx.lineTo(0, -10 * scale);
    ctx.lineTo(3 * scale, -14 * scale);
    ctx.closePath();
    ctx.fill();
    // wood gear lever
    ctx.fillStyle = "#c48a4a";
    roundRect(ctx, 16 * scale, 2 * scale, 4 * scale, 12 * scale, 2 * scale);
    ctx.fill();
    ctx.fillStyle = "#e8c090";
    ctx.beginPath();
    ctx.arc(18 * scale, 2 * scale, 3 * scale, 0, TAU);
    ctx.fill();
  } else {
    // generic animal head for rivals
    const colors = {
      fox: "#e8924a",
      rabbit: "#f2e6f8",
      bear: "#c48a4a",
      cat: "#f2a04a",
      hawk: "#8b6b3a",
    };
    const c = colors[kind] || "#e8c090";
    ctx.fillStyle = c;
    roundRect(ctx, -12 * scale, -2 * scale, 24 * scale, 20 * scale, 8 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -16 * scale, 12 * scale, 0, TAU);
    ctx.fill();
    if (kind === "rabbit") {
      ctx.beginPath();
      ctx.ellipse(-6 * scale, -30 * scale, 3 * scale, 10 * scale, -0.2, 0, TAU);
      ctx.ellipse(6 * scale, -30 * scale, 3 * scale, 10 * scale, 0.2, 0, TAU);
      ctx.fill();
    }
    if (kind === "fox" || kind === "cat") {
      ctx.beginPath();
      ctx.moveTo(-8 * scale, -24 * scale);
      ctx.lineTo(-12 * scale, -34 * scale);
      ctx.lineTo(-2 * scale, -26 * scale);
      ctx.moveTo(8 * scale, -24 * scale);
      ctx.lineTo(12 * scale, -34 * scale);
      ctx.lineTo(2 * scale, -26 * scale);
      ctx.fill();
    }
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.arc(-4 * scale, -16 * scale, 2 * scale, 0, TAU);
    ctx.arc(4 * scale, -16 * scale, 2 * scale, 0, TAU);
    ctx.fill();
  }

  // steering wheel
  ctx.strokeStyle = "#1f232a";
  ctx.lineWidth = Math.max(2, 3 * scale);
  ctx.beginPath();
  ctx.arc(0, 12 * scale, 10 * scale, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-8 * scale, 12 * scale);
  ctx.lineTo(8 * scale, 12 * scale);
  ctx.stroke();

  ctx.restore();
}

function drawRivalKart3D(x, y, scale, opponent, number) {
  const style = opponent?.style || RIVAL_STYLES[(number - 2) % RIVAL_STYLES.length];
  const kart = {
    body: style.body,
    bodyDeep: style.bodyDeep,
    seat: "#2c3038",
    emblem: style.emblem,
  };
  ctx.save();
  ctx.translate(x, y);
  drawClayKartBody(scale, kart);
  drawClayDriverFigure(scale, style.avatar);
  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.beginPath();
  ctx.arc(18 * scale, -30 * scale, 8 * scale, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#5a4030";
  ctx.font = `900 ${9 * scale}px Fredoka, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(number), 18 * scale, -29 * scale);
  ctx.restore();
}

function drawPlayerKart3D(x, y) {
  const bounce = Math.sin(game.elapsed * 18) * Math.min(2.5, Math.abs(game.player.speed) / 150);
  const sway = Math.sin(game.elapsed * 1.4) * 0.03;
  const kart = selectedDriver.kart || {
    body: selectedDriver.color,
    bodyDeep: darken(selectedDriver.color, 18),
    seat: "#2c3038",
    emblem: "bolt",
    driver: "astronaut",
  };
  const scale = 1.15;
  ctx.save();
  ctx.translate(x, y + bounce);
  ctx.rotate(sway + (game.player.spinTimer > 0 ? Math.sin(game.elapsed * 14) * .16 : 0));

  const plot = plotFromCtx(ctx);
  const eq = resolveEquipFx(loadout, {
    boost: game.player.boostTimer > 0,
    speed: game.player.speed,
    speedThreshold: 280,
  });
  const facing = DEFAULT_FACING;
  const bodyCx = 0;
  if (eq.isMount) {
    const mountScale = eq.wingStyle === "ufo" ? 3.2 : 3.0;
    drawFlightGear(plot, bodyCx, 26 - eq.bodyLift * 0.15, mountScale, {
      style: eq.wingStyle || "carpet",
      flying: eq.flying,
      t: game.elapsed,
      facing,
      layer: "mount",
    });
  }
  if (eq.isWings || eq.isJetpack) {
    const gearScale = eq.isJetpack ? 2.9 : 3.25;
    const backKind = eq.wingStyle === "rocket" ? "rocket" : eq.isJetpack ? "jetpack" : "wings";
    const backCx = backAnchorX(bodyCx, gearScale, { facing, kind: backKind });
    drawFlightGear(plot, backCx, eq.isJetpack ? 2 : -6 - eq.bodyLift * 0.3, gearScale, {
      style: eq.wingStyle || "feather",
      flying: eq.flying,
      t: game.elapsed,
      lean: 0,
      facing,
      layer: "back",
    });
  }
  if (loadout?.parts?.cape) {
    const capeCx = backAnchorX(bodyCx, 2.3, { facing, kind: "cape" });
    drawCape(plot, capeCx, 10, 2.3, { t: game.elapsed, wind: eq.capeWind, facing });
  }

  drawClayKartBody(scale, kart, { rearGlow: game.player.boostTimer > 0 });
  drawClayDriverFigure(scale, kart.driver);

  if (eq.isMount && eq.wingStyle === "ufo") {
    drawFlightGear(plot, bodyCx, 26 - eq.bodyLift * 0.15, 3.2, {
      style: "ufo",
      flying: eq.flying,
      t: game.elapsed,
      facing,
      layer: "overlay",
    });
  }

  if (loadout?.headStyle) {
    drawHeadGear(plot, 0, -62, 1.8, { t: game.elapsed, style: loadout.headStyle });
  }
  if (eq.flightKind === "balloon") {
    drawBalloons(plot, 70, -8 - eq.bodyLift * 0.4, eq.flying ? 2.4 : 2.0, {
      t: game.elapsed,
      flying: eq.flying,
      side: 1,
      attach: "hand",
    });
  }
  if (loadout?.chestStyle) {
    drawChestCharm(plot, 28, -6, 1.4, {
      t: game.elapsed,
      style: loadout.chestStyle,
      framed: loadout.chestStyle === "clover",
    });
  } else if (loadout?.parts?.badge || loadout?.parts?.sticker) {
    ctx.font = "16px \"Segoe UI Emoji\", \"Apple Color Emoji\", sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(loadout.decor?.icon || "🔰", 36, -8);
  }
  if (loadout?.decor?.icon && ["note", "coinCopper"].includes(loadout.decor.part)) {
    ctx.font = "18px \"Segoe UI Emoji\", \"Apple Color Emoji\", sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(loadout.decor.icon, 70, 8);
  }
  if (loadout?.trailStyle && isOrbitTrail(loadout.trailStyle)) {
    drawOrbitAura(plot, 0, -8, 2.2, {
      style: loadout.trailStyle,
      t: game.elapsed,
      radius: 38,
    });
  }
  if (loadout?.pet) {
    const motion = loadout.petMotion || "ground";
    drawPet(plot, -92, motion === "hover" ? -20 : 22, loadout.petStyle || "slime", {
      t: game.elapsed,
      scale: 2.2,
      motion,
    });
  }
  if (loadout?.title) {
    ctx.fillStyle = "rgba(20,16,12,.82)";
    const label = `${loadout.title.icon || ""} ${loadout.title.titleText || loadout.title.name.replace(/^称号·/, "")}`.trim();
    ctx.font = "700 12px Fredoka, sans-serif";
    const tw = Math.max(56, ctx.measureText(label).width + 14);
    roundRect(ctx, -tw / 2, -92, tw, 18, 5);
    ctx.fill();
    ctx.fillStyle = "#ffd45a";
    ctx.textAlign = "center";
    ctx.fillText(label, 0, -78);
  }

  if (game.player.shield) {
    ctx.strokeStyle = "rgba(91,235,255,.9)";
    ctx.lineWidth = 5;
    ctx.shadowColor = "#35d9f1";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(0, -5, 82, 69, 0, 0, TAU);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  kartTrailTick += 1;
  if (eq.flying && (eq.isWings || eq.isJetpack || eq.isMount) && kartTrailTick % 2 === 0) {
    const backKind = eq.wingStyle === "rocket" ? "rocket" : eq.isJetpack ? "jetpack" : eq.isMount ? "default" : "wings";
    const exhX = eq.isMount ? x : x + backAnchorX(0, 2.4, { facing: DEFAULT_FACING, kind: backKind });
    const exhY = eq.isJetpack ? y + 18 : eq.isMount ? y + 24 : y + 8;
    spawnWingTrail(cosmeticFx, exhX, exhY, eq.wingStyle || "feather", { dir: DEFAULT_FACING, count: 2 });
  }
  if (eq.flying && eq.flightKind === "balloon" && kartTrailTick % 2 === 0) {
    spawnBalloonTrail(cosmeticFx, x + 40, y - 20, { dir: 1, count: 3 });
  }
  if (loadout?.trailStyle && isBloomTrail(loadout.trailStyle) && kartTrailTick % 16 === 0 && cosmeticFx.length < 100) {
    spawnFireworkBloom(
      cosmeticFx,
      x + (Math.random() - 0.5) * 56,
      y - 8 + (Math.random() - 0.5) * 40,
      { count: 12, rings: 1, speed: 72, life: 0.55 },
    );
  }
  if (loadout?.trailStyle && !isBloomTrail(loadout.trailStyle) && game.player.speed > 40) {
    if (kartTrailTick % 2 === 0) spawnKartTrail(x, y + 8);
  }
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
  const theme = selectedTrack.theme;
  ctx.save();
  ctx.fillStyle = "rgba(255,249,241,.92)";
  ctx.strokeStyle = "rgba(210,190,170,.85)";
  ctx.lineWidth = 2;
  roundRect(ctx, x - 10, y - 10, mapWidth + 20, mapHeight + 20, 18);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#6a5848";
  ctx.font = "800 10px Nunito, Fredoka, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`LAP ${Math.min(game.player.lap, LAPS_TO_WIN)}/${LAPS_TO_WIN}`, x, y + 4);
  const mapPoint = (point) => ({
    x: x + mapWidth / 2 + (point.x - WORLD.cx) / WORLD.rx * 59,
    y: y + 57 + (point.y - WORLD.cy) / WORLD.ry * 27,
  });
  ctx.strokeStyle = theme.roadA;
  ctx.lineWidth = 8;
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
  ctx.strokeStyle = theme.curbB || theme.accent;
  ctx.lineWidth = 2.5;
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
  selectedTrack.gates.forEach((gate) => drawDot(gate, "#7a4dff", 3));
  drawDot(game.player.progress, selectedDriver.color, 5);
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
  updateCosmeticFx(dt);
  updateHud();
  render();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyP" || event.code === "Escape") {
    event.preventDefault();
    if (game.mode === "racing") togglePause(true);
    else if (game.mode === "paused") togglePause(false);
  }
});

window.addEventListener("blur", () => {
  if (game.mode === "racing") togglePause(true);
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
refreshLoadout();
resizeCanvas();
updateOpponents(0);
updateHud();
render();
requestAnimationFrame(frame);
