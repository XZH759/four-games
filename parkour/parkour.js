/**
 * 云城冲刺 — 神庙遗迹风 · 长路径 · 弯道 · 金币/宝石
 * 答对：连吃宝藏；答错：桥断坠落受罚
 */
import { AI_QUESTIONS, isCorrectOption, localizeQuestion } from "/monopoly/questions.js";
import { addCastlePoints, getEquippedLoadout } from "/castle/castle.js";
import { initI18n, onLangChange, applyDom, getLang, t } from "/js/i18n.js";
import { mountLobbyExit } from "/js/lobby-exit.js";
import { logAnswer } from "/js/answer-log.js";
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
  backAnchorX,
  DEFAULT_FACING,
} from "/castle/cosmetics-draw.js?v=4";
import { resolveEquipFx, isOrbitTrail, isBloomTrail } from "/castle/equip-fx.js?v=4";

initI18n({ toggleHost: "#lang-host" });
mountLobbyExit();

const MAX_LIVES = 3;
const COIN_BURST = 20;
const QUIZ_TIME = 10;
const HOME_LANE = 1;
const FAR_Z = 3800;
const RUNNER_Z = 95;
const COIN_MAGNET_Z = 320;
const COIN_PICK_Z = 120;
const BEST_KEY = "ailit_parkour_best_v1";

const els = {
  menu: document.getElementById("screen-menu"),
  play: document.getElementById("screen-play"),
  over: document.getElementById("screen-over"),
  canvas: document.getElementById("game"),
  start: document.getElementById("start-btn"),
  retry: document.getElementById("retry-btn"),
  pause: document.getElementById("pause-btn"),
  score: document.getElementById("hud-score"),
  best: document.getElementById("hud-best"),
  dist: document.getElementById("hud-dist"),
  coins: document.getElementById("hud-coins"),
  gems: document.getElementById("hud-gems"),
  lives: document.getElementById("hud-lives"),
  xpFill: document.getElementById("xp-fill"),
  distFill: document.getElementById("dist-fill"),
  missionCoins: document.getElementById("m-coins"),
  missionDist: document.getElementById("m-dist"),
  missionQuiz: document.getElementById("m-quiz"),
  missionZone: document.getElementById("m-zone"),
  zoneBanner: document.getElementById("zone-banner"),
  zoneEn: document.getElementById("zone-en"),
  zoneZh: document.getElementById("zone-zh"),
  swipeHint: document.getElementById("swipe-hint"),
  quizBanner: document.getElementById("quiz-banner"),
  quizDomain: document.getElementById("quiz-domain"),
  quizStem: document.getElementById("quiz-stem"),
  laneKeys: document.getElementById("lane-keys"),
  quizTimer: document.getElementById("quiz-timer"),
  toast: document.getElementById("toast"),
  turnBanner: document.getElementById("turn-banner"),
  turnEn: document.getElementById("turn-en"),
  turnZh: document.getElementById("turn-zh"),
  rewardPanel: document.getElementById("reward-panel"),
  rewardDetail: document.getElementById("reward-detail"),
  rewardEn: document.getElementById("reward-en"),
  rewardZh: document.getElementById("reward-zh"),
  rewardOk: document.getElementById("reward-ok"),
  penaltyPanel: document.getElementById("penalty-panel"),
  penaltyScore: document.getElementById("penalty-score"),
  penaltyDetail: document.getElementById("penalty-detail"),
  penaltyEn: document.getElementById("penalty-en"),
  penaltyZh: document.getElementById("penalty-zh"),
  penaltyOk: document.getElementById("penalty-ok"),
  overScore: document.getElementById("over-score"),
  overDist: document.getElementById("over-dist"),
  overCoins: document.getElementById("over-coins"),
  overQuiz: document.getElementById("over-quiz"),
  overMsg: document.getElementById("over-msg"),
  loadoutChip: document.getElementById("loadout-chip"),
  menuLoadout: document.getElementById("menu-loadout"),
};

const ctx = els.canvas.getContext("2d");

const GW = 400;
const GH = 225;
const buffer = document.createElement("canvas");
buffer.width = GW;
buffer.height = GH;
const bctx = buffer.getContext("2d");
bctx.imageSmoothingEnabled = false;

const PX = {
  ink: "#1a1410",
  paper: "#f2e6c9",
  gold: "#ffd541",
  goldDk: "#c47a12",
  goldLt: "#ffe9a0",
  cyan: "#41a6f6",
  sky: "#5aa8e0",
  skyMid: "#7ec4f0",
  sky2: "#a8d8f0",
  cloud: "#e8f4fc",
  green: "#2a6a32",
  greenLt: "#3d9a48",
  greenDeep: "#163820",
  canopy: "#1a3a22",
  jungle: "#245028",
  mist: "#c8e0e8",
  red: "#e43b44",
  violet: "#b55088",
  stone1: "#8a8a94",
  stone2: "#5a5a62",
  stone3: "#3a3a42",
  stoneRuin: "#6a6a70",
  moss: "#3d8b4a",
  vine: "#2f7a3a",
  torch: "#ff8a2a",
  torchCore: "#ffe066",
  emerald: "#2ecc71",
  emeraldDk: "#1a8f4a",
  road1: "#9a9aa4",
  road2: "#6a6a74",
  roadGold1: "#ffe9a0",
  roadGold2: "#c47a12",
  white: "#ffffff",
  navy: "#2a3a4a",
  abyss: "#0a1218",
  abyss2: "#122028",
  water: "#4a90b0",
  waterLt: "#a8d8e8",
  skin: "#e8b890",
  shirt: "#3d9a4a",
};

/** 约每 5 道知识门切换一次背景（对照参考图 · 可循环） */
const QUESTIONS_PER_SCENE = 5;
const WORLD_SCENES = [
  {
    id: "jungle",
    name: "丛林神庙",
    nameEn: "JUNGLE TEMPLE",
    biome: "jungle",
    sky: ["#3a88d0", "#5aa8e8", "#7ec8f0", "#a8dcf0"],
    cloud: "#f0f8fc",
    cloudShade: "#d8ecf4",
    hills: ["#1a4020", "#245828", "#2e7030"],
    stoneA: "#7a7a82",
    stoneB: "#5a5a62",
    edge: ["#2a5830", "#1a3820"],
    abyss: ["#2a5030", "#1e4028", "#143020", "#0c1810"],
    mist: "#c8e8d0",
    mist2: "#e0f4e8",
    foliage: ["#1e6a28", "#3a9a40", "#5aba50"],
    trunk: "#3a2818",
    sunrays: true,
    rayColor: "#ffe9a0",
    sun: true,
  },
  {
    id: "desert",
    name: "沙漠夕照",
    nameEn: "DESERT SUNSET",
    biome: "desert",
    sky: ["#4a2868", "#c45030", "#e87838", "#f8b868"],
    cloud: "#f8d090",
    cloudShade: "#e8a868",
    hills: ["#8a6040", "#a07850", "#b89060"],
    stoneA: "#9a8070",
    stoneB: "#7a6050",
    edge: ["#c4a070", "#a08050"],
    abyss: ["#c8a878", "#b09060", "#8a7048", "#6a5030"],
    mist: "#f0d0a0",
    mist2: "#f8e0b8",
    foliage: ["#4a6830", "#6a8840", "#3a5020"],
    trunk: "#5a4030",
    sunrays: true,
    rayColor: "#ffc070",
    sun: true,
  },
  {
    id: "snow",
    name: "雪峰遗迹",
    nameEn: "SNOW RUINS",
    biome: "snow",
    sky: ["#68a8e0", "#88c0f0", "#a8d4f8", "#c8e8fc"],
    cloud: "#f8fcff",
    cloudShade: "#e0eef8",
    hills: ["#6890b0", "#88a8c8", "#b0c8e0"],
    stoneA: "#8a949e",
    stoneB: "#6a747e",
    edge: ["#d8e4f0", "#b0c0d0"],
    abyss: ["#c8d8e8", "#a8bcd0", "#7890a8", "#506878"],
    mist: "#e8f0f8",
    mist2: "#f4f8fc",
    foliage: ["#2a5040", "#3a6850", "#e8f0f8"],
    trunk: "#3a3028",
    sunrays: true,
    rayColor: "#e0f0ff",
    sun: false,
  },
  {
    id: "volcano",
    name: "熔岩神殿",
    nameEn: "LAVA TEMPLE",
    biome: "volcano",
    sky: ["#1a1018", "#2a1820", "#3a2028", "#4a2830"],
    cloud: "#3a3038",
    cloudShade: "#2a2028",
    hills: ["#2a2028", "#3a2830", "#4a3038"],
    stoneA: "#4a4a52",
    stoneB: "#2e2e36",
    edge: ["#3a2820", "#2a1810"],
    abyss: ["#ff6a20", "#e04810", "#8a2010", "#2a1010"],
    mist: "#ff8a40",
    mist2: "#ffb060",
    foliage: ["#4a3020", "#5a4030", "#ff5a20"],
    trunk: "#1a1410",
    sunrays: false,
    rayColor: "#ff8040",
    sun: false,
    embers: true,
  },
];

function sceneIndexFromProgress(quizSeen) {
  return Math.floor(Math.max(0, quizSeen) / QUESTIONS_PER_SCENE) % WORLD_SCENES.length;
}

function activeScene() {
  return WORLD_SCENES[state.sceneIndex] || WORLD_SCENES[0];
}

/** 奖励 / 惩罚文案与配色：与当前场景强绑定 */
const BIOME_FX = {
  jungle: {
    reward: {
      en: "JUNGLE LOOT",
      zh: "丛林宝藏",
      detail: `翡翠宝箱开启 · 连吃 ×${COIN_BURST}`,
      btn: "携宝冲刺",
      toast: "丛林宝箱！翡翠与金币飞来！",
      popup: "丛林宝藏！",
    },
    fail: {
      blade: {
        en: "VINE SPIKES",
        zh: "藤蔓地刺",
        toast: "答错！藤蔓抽紧，地刺刺出！",
        popup: "藤刺陷阱！",
        timer: "藤蔓陷阱…",
        detail: "JUNGLE A · 藤蔓 + 地刺！",
        detailEn: "JUNGLE A · Vines + spikes!",
        life: "被藤刺缠中！-1 生命",
        end: "倒在丛林陷阱里…",
        recover: "挣脱藤蔓，继续奔跑！",
        btn: "挣脱继续",
      },
      boulder: {
        en: "TEMPLE ROCK",
        zh: "神庙滚石",
        toast: "答错！神庙巨石滚落！",
        popup: "神庙碾压！",
        timer: "滚石逼近…",
        detail: "JUNGLE B · 神庙巨石！",
        detailEn: "JUNGLE B · Temple boulder!",
        life: "被神庙石碾中！-1 生命",
        end: "被神庙滚石压倒…",
        recover: "从苔石里爬出！",
        btn: "爬起来继续",
      },
      lava: {
        en: "STONE CHOMP",
        zh: "石口吞噬",
        toast: "答错！石怪大口张开！",
        popup: "石口吞噬！",
        timer: "石怪陷阱…",
        detail: "JUNGLE C · 石口陷阱！",
        detailEn: "JUNGLE C · Stone mouth trap!",
        life: "被石口咬中！-1 生命",
        end: "被丛林石怪吞没…",
        recover: "从石口逃出！",
        btn: "逃出石口",
      },
    },
    coin: "#ffd541",
    coinLt: "#c8f080",
    gem: "#2ecc71",
    gemDk: "#1a8f4a",
    debrisBlade: ["#3d8b4a", "#c8d0d8"],
    debrisBoulder: ["#5a5a62", "#3d8b4a"],
    debrisLava: ["#8a5a28", "#2ecc71"],
    sparkBlade: "#8ada70",
    sparkBoulder: "#9a9aa2",
    sparkLava: "#5aba50",
    spike: "#8a8a94",
    spikeTip: "#c8f080",
    blade: "#6a8a50",
    boulder: "#5a6a52",
    pit: "#1a3820",
    pitHot: "#3d8b4a",
  },
  desert: {
    reward: {
      en: "DESERT HOARD",
      zh: "沙漠金库",
      detail: `黄金圣甲虫匣 · 连吃 ×${COIN_BURST}`,
      btn: "携金冲刺",
      toast: "沙漠金库！金币在沙尘中闪耀！",
      popup: "沙漠金库！",
    },
    fail: {
      blade: {
        en: "SAND SPIKES",
        zh: "沙地尖刺",
        toast: "答错！沙板翻开，尖刺弹出！",
        popup: "沙刺陷阱！",
        timer: "沙刺陷阱…",
        detail: "DESERT A · 沙地尖刺！",
        detailEn: "DESERT A · Sand spikes!",
        life: "踩中沙刺！-1 生命",
        end: "倒在沙刺陷阱上…",
        recover: "跳出沙板，继续冲刺！",
        btn: "跳出继续",
      },
      boulder: {
        en: "SAND SLIDE",
        zh: "流沙陷落",
        toast: "答错！流沙塌陷，石柱砸下！",
        popup: "流沙碾压！",
        timer: "流沙逼近…",
        detail: "DESERT B · 流沙 + 石柱！",
        detailEn: "DESERT B · Quicksand + pillars!",
        life: "陷入流沙！-1 生命",
        end: "被流沙淹没…",
        recover: "从流沙里爬出！",
        btn: "爬出流沙",
      },
      lava: {
        en: "DESERT MOUTH",
        zh: "沙口陷阱",
        toast: "答错！沙口裂开，熔沙喷涌！",
        popup: "沙口吞噬！",
        timer: "沙口陷阱…",
        detail: "DESERT C · 沙口 + 熔沙！",
        detailEn: "DESERT C · Sand mouth + molten sand!",
        life: "掉进沙口！-1 生命",
        end: "被沙漠沙口吞没…",
        recover: "抓住岩壁爬上来！",
        btn: "逃出沙口",
      },
    },
    coin: "#ffd541",
    coinLt: "#ffe9a0",
    gem: "#e8a040",
    gemDk: "#c47a12",
    debrisBlade: ["#c4a070", "#d8c090"],
    debrisBoulder: ["#9a8070", "#c4a070"],
    debrisLava: ["#e07040", "#ffb060"],
    sparkBlade: "#f0d0a0",
    sparkBoulder: "#b89060",
    sparkLava: "#ff8a40",
    spike: "#9a8070",
    spikeTip: "#ffe9a0",
    blade: "#c4a070",
    boulder: "#8a6a50",
    pit: "#8a4010",
    pitHot: "#e07040",
  },
  snow: {
    reward: {
      en: "FROST CHEST",
      zh: "霜晶宝箱",
      detail: `冰晶宝匣开启 · 连吃 ×${COIN_BURST}`,
      btn: "携霜冲刺",
      toast: "霜晶宝箱！冰晶与金币飞溅！",
      popup: "霜晶宝藏！",
    },
    fail: {
      blade: {
        en: "ICE SPIKES",
        zh: "冰锥陷阱",
        toast: "答错！冰锥破地，寒刃横扫！",
        popup: "冰锥斩击！",
        timer: "冰锥陷阱…",
        detail: "SNOW A · 冰锥 + 寒刃！",
        detailEn: "SNOW A · Ice spikes + frost blades!",
        life: "被冰锥刺中！-1 生命",
        end: "倒在冰锥陷阱上…",
        recover: "抖落霜雪，继续冲刺！",
        btn: "抖雪继续",
      },
      boulder: {
        en: "SNOW CRUSH",
        zh: "雪球碾压",
        toast: "答错！巨型雪球滚来！",
        popup: "雪球碾压！",
        timer: "雪球逼近…",
        detail: "SNOW B · 巨型雪球！",
        detailEn: "SNOW B · Giant snowball!",
        life: "被雪球砸中！-1 生命",
        end: "被雪球压倒…",
        recover: "从雪堆里爬出！",
        btn: "爬出雪堆",
      },
      lava: {
        en: "FROST PIT",
        zh: "冰窟坠落",
        toast: "答错！冰面碎裂，坠入冰窟！",
        popup: "冰窟坠落！",
        timer: "冰窟陷阱…",
        detail: "SNOW C · 冰窟 + 霜怪！",
        detailEn: "SNOW C · Frost pit + ice beast!",
        life: "掉进冰窟！-1 生命",
        end: "坠入冰窟深渊…",
        recover: "抓住冰棱爬上来！",
        btn: "爬出冰窟",
      },
    },
    coin: "#e8f0ff",
    coinLt: "#ffffff",
    gem: "#7ec8f0",
    gemDk: "#3a88c0",
    debrisBlade: ["#e8f0f8", "#a8c0d8"],
    debrisBoulder: ["#d0dce8", "#8898a8"],
    debrisLava: ["#a8d0f0", "#e8f4fc"],
    sparkBlade: "#f4f8fc",
    sparkBoulder: "#c8d8e8",
    sparkLava: "#88c0e8",
    spike: "#c8d0d8",
    spikeTip: "#ffffff",
    blade: "#b0c8e0",
    boulder: "#d8e4f0",
    pit: "#406878",
    pitHot: "#a8d0f0",
  },
  volcano: {
    reward: {
      en: "MAGMA CACHE",
      zh: "熔心宝匣",
      detail: `熔心宝匣开启 · 连吃 ×${COIN_BURST}`,
      btn: "携火冲刺",
      toast: "熔心宝匣！火晶与金币迸溅！",
      popup: "熔心宝藏！",
    },
    fail: {
      blade: {
        en: "EMBER BLADES",
        zh: "熔刃摆锤",
        toast: "答错！熔刃摆下，地火喷出！",
        popup: "熔刃斩击！",
        timer: "熔刃陷阱…",
        detail: "LAVA A · 熔刃 + 地火！",
        detailEn: "LAVA A · Ember blades + ground fire!",
        life: "被熔刃灼伤！-1 生命",
        end: "倒在熔刃陷阱上…",
        recover: "躲开火舌，继续冲刺！",
        btn: "躲开继续",
      },
      boulder: {
        en: "MAGMA ROCK",
        zh: "岩浆滚石",
        toast: "答错！岩浆巨石滚来！",
        popup: "岩浆碾压！",
        timer: "岩浆石逼近…",
        detail: "LAVA B · 岩浆滚石！",
        detailEn: "LAVA B · Magma boulder!",
        life: "被岩浆石砸中！-1 生命",
        end: "被岩浆滚石压倒…",
        recover: "从焦石里爬出！",
        btn: "爬起来继续",
      },
      lava: {
        en: "LAVA CHOMP",
        zh: "熔岩石怪",
        toast: "答错！熔岩裂开，石怪张嘴！",
        popup: "熔岩吞噬！",
        timer: "熔岩陷阱…",
        detail: "LAVA C · 熔岩 + 石怪！",
        detailEn: "LAVA C · Lava + rock beast!",
        life: "掉进熔岩！-1 生命",
        end: "被熔岩与石怪吞没…",
        recover: "抓住岩壁爬上来！",
        btn: "逃出熔岩",
      },
    },
    coin: "#ffb040",
    coinLt: "#ffe080",
    gem: "#ff5a20",
    gemDk: "#c43010",
    debrisBlade: ["#ff8a40", "#c8d0d8"],
    debrisBoulder: ["#5a4a42", "#ff6a20"],
    debrisLava: ["#ff5a20", "#ffd080"],
    sparkBlade: "#ffd080",
    sparkBoulder: "#ff8a40",
    sparkLava: "#ff5a20",
    spike: "#6a6a72",
    spikeTip: "#ff8a40",
    blade: "#ff6a20",
    boulder: "#4a3a38",
    pit: "#8a2010",
    pitHot: "#ff5a20",
  },
};

function biomeFx() {
  const id = activeScene().biome || "jungle";
  return BIOME_FX[id] || BIOME_FX.jungle;
}

function failCopy(kind) {
  const fx = biomeFx();
  return fx.fail[kind] || fx.fail.blade || BIOME_FX.jungle.fail.blade;
}

function showZoneBanner(scene) {
  if (!els.zoneBanner) return;
  if (els.zoneEn) els.zoneEn.textContent = scene.nameEn;
  if (els.zoneZh) els.zoneZh.textContent = scene.name;
  els.zoneBanner.hidden = false;
  clearTimeout(showZoneBanner._t);
  showZoneBanner._t = setTimeout(() => {
    if (els.zoneBanner) els.zoneBanner.hidden = true;
  }, 2200);
}

function advanceSceneProgress() {
  state.quizSeen += 1;
  const next = sceneIndexFromProgress(state.quizSeen);
  if (next === state.sceneIndex) return;
  state.prevScene = state.sceneIndex;
  state.sceneIndex = next;
  state.sceneFlash = 1;
  const scene = WORLD_SCENES[next];
  showZoneBanner(scene);
  toast(`场景切换 · ${scene.name}`);
  addPopup(scene.nameEn, PX.gold);
}

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
  gems: 0,
  best: Number(localStorage.getItem(BEST_KEY) || 0),
  lives: MAX_LIVES,
  invuln: 0,
  quizCorrect: 0,
  quizSeen: 0,
  sceneIndex: 0,
  prevScene: 0,
  sceneFlash: 0,
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
  fall: null, // { phase, t, lane, kind, lifeTaken }
  runnerFallY: 0,
  runnerSquash: 1,
  runnerHitX: 0,
  gapOpen: 0,
  questionBag: [],
  loadout: null,
  trailTick: 0,
};

function refreshLoadout() {
  try {
    state.loadout = getEquippedLoadout();
  } catch (_) {
    state.loadout = null;
  }
  paintLoadoutHud();
}

function paintLoadoutHud() {
  const load = state.loadout;
  const chip = els.loadoutChip;
  if (chip) {
    if (!load || (!load.title && !load.pet && !load.trail && !load.frame && !load.decor)) {
      chip.hidden = true;
    } else {
      chip.hidden = false;
      const bits = [];
      if (load.frame) bits.push(load.frame.icon);
      if (load.title) bits.push(`${load.title.icon}${load.title.titleText || ""}`);
      if (load.pet) bits.push(load.pet.icon);
      if (load.trail) bits.push(load.trail.icon);
      if (load.parts?.cape) bits.push("🧥");
      if (load.headStyle) {
        const hico = { knowledge: "👑", miner: "⛑️", brave: "🪖", goggles: "🥽", wizard: "🎩" };
        bits.push(hico[load.headStyle] || "👑");
      }
      if (load.chestStyle) {
        const cico = { clover: "🍀", star: "🌟", crystal: "💎" };
        bits.push(cico[load.chestStyle] || "✨");
      }
      if (load.parts?.balloon) bits.push("🎈");
      if (load.parts?.wings) {
        const ico = {
          feather: "🪽", angel: "🕊️", mech: "⚙️", demon: "🦇",
          butterfly: "🦋", cloud: "☁️", jetpack: "🚀", rocket: "🧨",
          carpet: "🧞", ufo: "🛸",
        };
        bits.push(ico[load.wingStyle] || "🪽");
      }
      chip.innerHTML = `<span class="lo-label">LOADOUT</span><strong>${bits.join(" ")}</strong>`;
      chip.dataset.frame = load.frame?.frameStyle || "";
    }
  }
  const menu = els.menuLoadout;
  if (menu) {
    if (!load) {
      menu.innerHTML = `<p>${t("parkour.loadoutUnread")} <a href="/castle/">${t("parkour.loadoutUnreadLink")}</a></p>`;
    } else {
      const rows = [
        ["frame", load.frame],
        ["title", load.title],
        ["trail", load.trail],
        ["pet", load.pet],
        ["decor", load.decor],
      ]
        .filter(([, it]) => it)
        .map(([, it]) => `<li>${it.icon} ${it.name}</li>`)
        .join("");
      menu.innerHTML = rows
        ? `<p>${t("parkour.loadoutActive")}</p><ul>${rows}</ul><a href="/castle/">${t("parkour.loadoutAdjust")}</a>`
        : `<p>${t("parkour.loadoutEmpty")}</p><a href="/castle/">${t("parkour.loadoutGoCastle")}</a>`;
    }
  }
}

function spawnRunnerTrail(x, y) {
  const load = state.loadout;
  if (!load?.trailStyle || isBloomTrail(load.trailStyle)) return;
  if (isOrbitTrail(load.trailStyle)) return;
  spawnCosmeticTrail(state.fx, x, y, load.trailStyle, { kind: "spark", t: state.t });
}

function spawnFireworks(cx, cy) {
  spawnFireworkBloom(state.fx, cx, cy, {
    count: 20,
    rings: 2,
    speed: 68,
    kind: "spark",
    life: 0.85,
  });
  state.fx.push({ kind: "ring", x: cx, y: cy, life: 0.45, max: 0.45, color: "#ffd45a" });
}

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
  const correctPool = Array.isArray(q.answers) && q.answers.length ? q.answers : [q.answer];
  const correct = correctPool[Math.floor(Math.random() * correctPool.length)] ?? q.answer;
  const others = q.options.map((_, i) => i).filter((i) => !isCorrectOption(q, i));
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
  for (let i = 0; i < COIN_BURST; i += 1) {
    const isGem = (i + 1) % 5 === 0;
    state.entities.push({
      type: "coin",
      lane,
      z: 260 + i * 85,
      burst: true,
      gem: isGem,
      taken: false,
      sucking: false,
      suckT: 0,
      sx: 0,
      sy: 0,
    });
  }
}

function showTurnBanner(lane) {
  if (!els.turnBanner) return;
  if (lane === 0) {
    els.turnEn.textContent = "TURN LEFT";
    els.turnZh.textContent = "左转";
  } else if (lane === 2) {
    els.turnEn.textContent = "TURN RIGHT";
    els.turnZh.textContent = "右转";
  } else {
    els.turnEn.textContent = "GO STRAIGHT";
    els.turnZh.textContent = "直行";
  }
  els.turnBanner.hidden = false;
  clearTimeout(showTurnBanner._t);
  showTurnBanner._t = setTimeout(() => {
    els.turnBanner.hidden = true;
  }, 2200);
}

function showReward(detail) {
  if (!els.rewardPanel) return;
  const fx = biomeFx();
  const r = fx.reward;
  els.rewardPanel.dataset.biome = activeScene().biome || "jungle";
  if (els.rewardEn) els.rewardEn.textContent = r.en;
  if (els.rewardZh) els.rewardZh.textContent = r.zh;
  els.rewardDetail.textContent = detail || r.detail;
  if (els.rewardOk) els.rewardOk.textContent = r.btn;
  els.rewardPanel.hidden = false;
  clearTimeout(showReward._t);
  showReward._t = setTimeout(hideReward, 2400);
}

function hideReward() {
  if (!els.rewardPanel || els.rewardPanel.hidden) return;
  els.rewardPanel.hidden = true;
}

function showPenalty(scoreCut, kind = "blade") {
  if (!els.penaltyPanel) return;
  const copy = failCopy(kind);
  const biome = activeScene().biome || "jungle";
  const en = getLang() === "en";
  els.penaltyPanel.dataset.kind = kind;
  els.penaltyPanel.dataset.biome = biome;
  if (els.penaltyScore) els.penaltyScore.textContent = `-${scoreCut}% SCORE`;
  if (els.penaltyEn) els.penaltyEn.textContent = copy.en;
  if (els.penaltyZh) {
    els.penaltyZh.textContent = copy.zh;
    els.penaltyZh.hidden = en;
  }
  if (els.penaltyDetail) {
    els.penaltyDetail.textContent = en ? (copy.detailEn || copy.en) : copy.detail;
  }
  if (els.penaltyOk) {
    els.penaltyOk.textContent = en ? t("parkour.penaltyOk") : copy.btn;
  }
  els.penaltyPanel.hidden = false;
  clearTimeout(showPenalty._t);
  showPenalty._t = setTimeout(hidePenalty, 2400);
}

function hidePenalty() {
  if (!els.penaltyPanel || els.penaltyPanel.hidden) return;
  els.penaltyPanel.hidden = true;
}

function addPopup(text, color = "#ffd166") {
  state.popups.push({ text, color, life: 1, y: 0 });
}

/** 与画面错路陷阱一一对应：A 摆刀地刺 / B 滚石 / C 熔岩石怪（外观随场景） */
function laneHazardKind(lane) {
  if (lane === 0) return "blade";
  if (lane === 2) return "lava";
  return "boulder";
}

function spawnFailDebris(kind, lane) {
  const fx = biomeFx();
  const palette =
    kind === "lava" ? fx.debrisLava : kind === "boulder" ? fx.debrisBoulder : fx.debrisBlade;
  state.debris = [];
  const n = kind === "lava" ? 18 : kind === "boulder" ? 16 : 12;
  for (let i = 0; i < n; i += 1) {
    state.debris.push({
      lane: lane + (Math.random() - 0.5) * 0.45,
      z: 50 + Math.random() * 90,
      vx: (Math.random() - 0.5) * (kind === "blade" ? 260 : 160),
      vy: 30 + Math.random() * 90,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 10,
      size: kind === "boulder" ? 14 + Math.random() * 22 : 8 + Math.random() * 16,
      life: 1.4 + Math.random(),
      tint: palette[i % palette.length],
    });
  }
}

function spawnFailSparks(kind, x, y) {
  const fx = biomeFx();
  const color =
    kind === "lava" ? fx.sparkLava : kind === "blade" ? fx.sparkBlade : fx.sparkBoulder;
  const n = kind === "blade" ? 14 : 10;
  for (let i = 0; i < n; i += 1) {
    state.fx.push({
      kind: "spark",
      x: x + (Math.random() - 0.5) * 20,
      y: y - 8 + (Math.random() - 0.5) * 12,
      vx: (Math.random() - 0.5) * 120,
      vy: -40 - Math.random() * 80,
      life: 0.4 + Math.random() * 0.5,
      color,
    });
  }
}

function startFailTrap(lane, kind) {
  const copy = failCopy(kind);
  const fx = biomeFx();
  state.fall = {
    phase: "warn",
    t: 0,
    lane,
    kind,
    lifeTaken: false,
  };
  state.targetLane = lane;
  state.camBankTarget = (lane - 1) * 0.9;
  state.gapOpen = 0;
  state.runnerFallY = 0;
  state.runnerSquash = 1;
  state.runnerHitX = 0;
  spawnFailDebris(kind, lane);
  state.shake = kind === "boulder" ? 22 : kind === "lava" ? 18 : 14;
  toast(copy.toast);
  addPopup(copy.popup, kind === "lava" ? fx.sparkLava : "#ff5a7a");
  if (els.quizTimer) els.quizTimer.textContent = copy.timer;
}

function paintLives() {
  els.lives.innerHTML = Array.from({ length: MAX_LIVES }, (_, i) => {
    return `<i class="${i < state.lives ? "on" : ""}"></i>`;
  }).join("");
}

function updateHud() {
  els.score.textContent = Math.floor(state.score).toLocaleString();
  if (els.best) els.best.textContent = Math.floor(state.best).toLocaleString();
  els.dist.textContent = `${Math.floor(state.distance)} M`;
  els.coins.textContent = String(state.coins);
  if (els.gems) els.gems.textContent = String(state.gems || 0);
  paintLives();
  const xp = ((state.quizSeen % QUESTIONS_PER_SCENE) / QUESTIONS_PER_SCENE) * 100;
  if (els.xpFill) els.xpFill.style.width = `${xp}%`;
  const distPct = Math.min(100, (state.distance / 1000) * 100);
  if (els.distFill) {
    els.distFill.style.width = `${distPct}%`;
    const dot = els.distFill.parentElement?.querySelector(".runner-dot");
    if (dot) dot.style.left = `${distPct}%`;
  }
  els.missionCoins.textContent = t("parkour.missionCoins", {
    n: state.burstCollected,
    max: COIN_BURST,
  });
  els.missionDist.textContent = t("parkour.missionDist", {
    n: Math.min(Math.floor(state.distance), 1000),
  });
  els.missionQuiz.textContent = t("parkour.missionQuiz", {
    ok: state.quizCorrect,
    seen: state.quizSeen,
  });
  if (els.missionZone) {
    const sc = activeScene();
    const into = state.quizSeen % QUESTIONS_PER_SCENE;
    const left = QUESTIONS_PER_SCENE - into;
    const name = getLang() === "en" ? sc.nameEn : sc.name;
    els.missionZone.textContent = t("parkour.missionZone", {
      name,
      left,
      into,
      per: QUESTIONS_PER_SCENE,
    });
  }
}

function setQuizBanner(quiz) {
  if (!quiz) {
    els.quizBanner.hidden = true;
    els.laneKeys.innerHTML = "";
    return;
  }
  const q = localizeQuestion(quiz.question, getLang());
  els.quizBanner.hidden = false;
  els.quizDomain.textContent = q.domain;
  els.quizStem.textContent = q.stem;
  els.quizTimer.textContent = t("parkour.quizPick", {
    s: Math.ceil(state.quizTimeLeft),
  });
  els.laneKeys.innerHTML = "";
  const laneLabels = [t("parkour.laneLeft"), t("parkour.laneMid"), t("parkour.laneRight")];
  quiz.laneOptions.forEach((optIdx, lane) => {
    const label = laneLabels[lane];
    const text = q.options[optIdx];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `l${lane}`;
    btn.innerHTML = `<b>${label}</b>${text}`;
    btn.addEventListener("click", () => answerQuiz(lane));
    els.laneKeys.appendChild(btn);
  });
}

onLangChange(() => {
  applyDom();
  paintLoadoutHud();
  if (els.swipeHint) els.swipeHint.textContent = t("parkour.tipSwipe");
  updateHud();
  if (state.activeQuiz && !state.activeQuiz.resolved) {
    setQuizBanner(state.activeQuiz);
  }
});

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
    gems: 0,
    best: Number(localStorage.getItem(BEST_KEY) || 0),
    lives: MAX_LIVES,
    invuln: 0,
    quizCorrect: 0,
    quizSeen: 0,
    sceneIndex: 0,
    prevScene: 0,
    sceneFlash: 0,
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
    runnerSquash: 1,
    runnerHitX: 0,
    gapOpen: 0,
    questionBag: shuffle(AI_QUESTIONS),
    trailTick: 0,
  });
  refreshLoadout();
  setQuizBanner(null);
  updateHud();
  if (els.swipeHint) {
    els.swipeHint.textContent = t("parkour.tipSwipe");
    els.swipeHint.classList.remove("is-hide");
    setTimeout(() => els.swipeHint.classList.add("is-hide"), 4000);
  }
  show(els.play);
  requestAnimationFrame(loop);
}

function endGame(reason) {
  state.running = false;
  state.over = true;
  state.awaitingAnswer = false;
  state.fall = null;
  if (state.score > state.best) {
    state.best = Math.floor(state.score);
    localStorage.setItem(BEST_KEY, String(state.best));
  }
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
  try { addCastlePoints(80); } catch (_) { /* ignore */ }
  if (state.loadout?.trailStyle === "fireworks") {
    spawnFireworks(GW / 2, GH * 0.42);
    toast("🎆 烟花特效绽放！");
  }
  updateHud();
  const r = biomeFx().reward;
  toast(r.toast);
  addPopup(r.popup, biomeFx().gem);
  showReward(r.detail);
}

function resolveQuiz(quiz, chosenLane, timedOut) {
  if (quiz.resolved) return;
  quiz.resolved = true;
  state.awaitingAnswer = false;
  const correct = !timedOut && chosenLane === quiz.correctLane;
  state.entities = state.entities.filter((e) => e.type === "quiz");

  void logAnswer({
    game: "parkour",
    question_id: quiz.question?.id || `parkour-${state.quizSeen}`,
    answer: { chosenLane, correctLane: quiz.correctLane, timedOut },
    correct,
    meta: {
      distance: Math.round(state.distance),
      quizSeen: state.quizSeen,
      quizCorrect: state.quizCorrect + (correct ? 1 : 0),
      sceneIndex: state.sceneIndex,
    },
  });

  if (correct) {
    state.targetLane = quiz.correctLane;
    state.pathBendTarget = (quiz.correctLane - 1) * 0.72;
    state.camBankTarget = (quiz.correctLane - 1) * 0.68;
    state.turnBoost = 1;
    state.quizCorrect += 1;
    state.score += 1000;
    state.speed = Math.min(600, state.speed + 32);
    try { addCastlePoints(40); } catch (_) { /* ignore */ }
    const petBonus = state.loadout?.petBonus || 0;
    if (petBonus > 0 && state.loadout?.pet) {
      state.score += petBonus;
      addPopup(`${state.loadout.pet.icon} +${petBonus}`, PX.gold);
    }
    if (state.loadout?.parts?.emote) {
      addPopup("🦜 鹦鹉欢呼！", "#ff8a5a");
    }
    spawnCoinBurst(quiz.correctLane);
    state.returnHomeAt = state.t + 6.2;
    showTurnBanner(quiz.correctLane);
    const reward = biomeFx().reward;
    const loot = getLang() === "en" ? reward.en : reward.zh;
    const laneKey =
      quiz.correctLane === 0
        ? "parkour.laneNameL"
        : quiz.correctLane === 2
          ? "parkour.laneNameR"
          : "parkour.laneNameM";
    toast(t("parkour.correctLane", { lane: t(laneKey), loot }));
    els.quizTimer.textContent = t("parkour.correctTimer", { loot });
    addPopup(quiz.correctLane === 0 ? "← 拐入左道" : quiz.correctLane === 2 ? "拐入右道 →" : "直行正道", biomeFx().gem);
  } else {
    // 超时：随机踩一条错路陷阱，让淘汰表现也多样化
    const failLane = timedOut
      ? [0, 1, 2][Math.floor(Math.random() * 3)]
      : chosenLane;
    const kind = laneHazardKind(failLane);
    const cut = Math.max(1, Math.floor(state.score * 0.1));
    state.score = Math.max(0, state.score - cut);
    startFailTrap(failLane, kind);
    showPenalty(10, kind);
  }

  state.activeQuiz = null;
  advanceSceneProgress();
  setTimeout(() => setQuizBanner(null), 700);
  updateHud();
}

function updateFall(dt) {
  const f = state.fall;
  if (!f) return false;
  f.t += dt;
  const kind = f.kind || "blade";
  const copy = failCopy(kind);

  if (f.phase === "warn") {
    // 陷阱蓄力：路裂 / 滚石逼近 / 熔岩冒泡
    const warnLen = kind === "boulder" ? 0.42 : 0.32;
    state.gapOpen = Math.min(1, f.t / warnLen);
    state.shake = kind === "boulder" ? 20 : 14;
    if (kind === "blade") {
      state.camPitch = -0.04;
      state.runnerHitX = Math.sin(f.t * 40) * 2;
    } else if (kind === "boulder") {
      state.camPitch = 0.06;
      state.runnerSquash = 1 - Math.min(0.15, f.t * 0.2);
    } else {
      state.camPitch = -0.1;
      state.runnerFallY = Math.min(18, f.t * 40);
    }
    if (f.t > warnLen) {
      f.phase = "impact";
      f.t = 0;
      const p = worldXY(f.lane, RUNNER_Z);
      spawnFailSparks(kind, state.laneX || p.x, p.y);
      state.shake = kind === "boulder" ? 28 : 20;
    }
    return true;
  }

  if (f.phase === "impact") {
    state.gapOpen = 1;
    if (kind === "blade") {
      // 侧向弹开 + 轻微下坠
      state.runnerFallY += 280 * dt;
      state.runnerHitX = Math.sin(f.t * 28) * 10 * (f.lane === 0 ? -1 : 1);
      state.camPitch = -0.12;
      state.shake = 12;
    } else if (kind === "boulder") {
      // 压扁
      state.runnerSquash = Math.max(0.28, 0.35 + Math.sin(f.t * 18) * 0.05);
      state.runnerFallY = Math.min(30, state.runnerFallY + 80 * dt);
      state.camPitch = 0.1;
      state.shake = 16;
    } else {
      // 沉入熔岩
      state.runnerFallY += 580 * dt;
      state.runnerSquash = 0.85;
      state.camPitch = -0.28;
      state.shake = 14;
    }

    if (!f.lifeTaken && f.t > 0.22) {
      f.lifeTaken = true;
      state.lives -= 1;
      state.invuln = 2;
      updateHud();
      toast(copy.life);
      addPopup("-1 生命", "#ff5a7a");
      if (state.lives <= 0) {
        endGame(copy.end);
        return true;
      }
    }
    if (f.t > 1.05) {
      f.phase = "recover";
      f.t = 0;
      toast(copy.recover);
    }
    return true;
  }

  if (f.phase === "recover") {
    state.runnerFallY = Math.max(0, state.runnerFallY - 640 * dt);
    state.runnerSquash += (1 - state.runnerSquash) * Math.min(1, dt * 6);
    state.runnerHitX *= Math.max(0, 1 - dt * 8);
    state.gapOpen = Math.max(0, 1 - f.t / 0.9);
    state.camPitch += (0 - state.camPitch) * Math.min(1, dt * 4);
    if (f.t > 0.95 && state.runnerFallY <= 2) {
      state.runnerFallY = 0;
      state.runnerSquash = 1;
      state.runnerHitX = 0;
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
  state.sceneFlash = Math.max(0, state.sceneFlash - dt * 1.6);

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
      if (p.kind === "spark" || p.kind === "coinbit" || p.kind === "wingtrail") {
        next.x += p.vx * dt;
        next.y += p.vy * dt;
        next.vy += (p.kind === "coinbit" ? 220 : p.kind === "wingtrail" ? 40 : 180) * dt;
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
      els.quizTimer.textContent = t("parkour.quizPick", {
        s: Math.max(0, Math.ceil(state.quizTimeLeft)),
      });
    }
    if (state.quizTimeLeft <= 0 && state.activeQuiz) {
      resolveQuiz(state.activeQuiz, null, true);
      updateHud();
      return;
    }
    const slow = state.speed * 0.22;
    state.distance += slow * dt * 0.12;
    state.score += slow * dt * 0.05;
    state.scroll += slow * dt * 0.35;
    state.entities.forEach((e) => {
      // 知识门保持在视野中段，方便看清三岔路口
      if (e.type === "quiz") e.z = Math.max(780, e.z - slow * dt * 0.35);
      else e.z -= slow * dt;
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
    const quiz = makeQuizGate(1050);
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
        if (e.gem) {
          state.gems += 1;
          state.score += 120;
        } else {
          state.coins += 1;
          state.score += 50;
        }
        state.burstCollected += 1;
        const milestone = state.burstCollected % 5 === 0;
        spawnEatCoinFx(rp.x, rp.y - 10, milestone || e.gem);
        if (milestone) {
          addPopup(`×${state.burstCollected}`, PX.gold);
          spawnCoinPopup(`+${state.burstCollected}`);
        } else {
          state.fx.push({
            kind: "text",
            x: rp.x + (Math.random() - 0.5) * 12,
            y: rp.y - 16,
            text: e.gem ? "+GEM" : "+1",
            color: e.gem ? PX.emerald : PX.goldLt,
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

function drawPyramid(cx, baseY, tiers, colorA, colorB, door = true) {
  for (let t = 0; t < tiers; t += 1) {
    const tw = (tiers - t) * 8;
    const th = 5;
    const x = cx - tw / 2;
    const y = baseY - (t + 1) * th;
    rect(x, y, tw, th, t % 2 ? colorA : colorB);
  }
  if (door) {
    const dw = 4;
    const dh = 6;
    rect(cx - dw / 2, baseY - dh - 2, dw, dh, "#1a1410");
  }
}

function drawCactus(x, y, s) {
  rect(x, y - 14 * s, 3 * s, 14 * s, "#3a7a40");
  rect(x - 4 * s, y - 10 * s, 4 * s, 2 * s, "#3a7a40");
  rect(x - 4 * s, y - 14 * s, 2 * s, 5 * s, "#3a7a40");
  rect(x + 3 * s, y - 8 * s, 4 * s, 2 * s, "#3a7a40");
  rect(x + 5 * s, y - 12 * s, 2 * s, 5 * s, "#3a7a40");
  rect(x + 1, y - 12 * s, 1, 1, "#8ada70");
}

function drawPine(x, y, s, snow) {
  rect(x - 1, y - 4 * s, 2, 5 * s, "#3a2818");
  rect(x - 6 * s, y - 8 * s, 12 * s, 5 * s, "#2a5040");
  rect(x - 5 * s, y - 12 * s, 10 * s, 5 * s, "#3a6850");
  rect(x - 3 * s, y - 16 * s, 6 * s, 5 * s, "#2a5848");
  if (snow) {
    rect(x - 5 * s, y - 12 * s, 10 * s, 2 * s, "#e8f0f8");
    rect(x - 3 * s, y - 16 * s, 6 * s, 2 * s, "#f4f8fc");
  }
}

function drawVolcano(x, baseY, h, erupting) {
  bctx.beginPath();
  bctx.moveTo(px(x - 18), px(baseY));
  bctx.lineTo(px(x - 4), px(baseY - h));
  bctx.lineTo(px(x + 4), px(baseY - h));
  bctx.lineTo(px(x + 18), px(baseY));
  bctx.closePath();
  bctx.fillStyle = "#2a2028";
  bctx.fill();
  rect(x - 3, baseY - h - 2, 6, 4, "#1a1018");
  if (erupting) {
    const flicker = Math.floor(state.t * 8) % 3;
    rect(x - 2, baseY - h - 8 - flicker, 4, 8 + flicker, "#ff6a20");
    rect(x - 1, baseY - h - 12 - flicker, 2, 5, "#ffd080");
    bctx.globalAlpha = 0.45;
    rect(x - 8, baseY - h - 18, 16, 10, "#3a3038");
    bctx.globalAlpha = 1;
    // 熔岩流
    rect(x - 1, baseY - h + 2, 2, h - 4, "#e04810");
    rect(x + 2, baseY - h / 2, 2, h / 2, "#ff6a20");
  }
}

function drawTempleGate(cx, baseY, sc) {
  const w = 28;
  const h = 22;
  rect(cx - w / 2, baseY - h, w, h, sc.stoneB);
  rect(cx - w / 2 - 2, baseY - h - 3, w + 4, 4, sc.stoneA);
  rect(cx - 6, baseY - 14, 12, 14, "#0a0a0e");
  // 藤蔓 / 雪 / 熔岩点缀
  if (sc.biome === "jungle") {
    rect(cx - w / 2, baseY - h + 2, 2, h - 4, PX.vine);
    rect(cx + w / 2 - 2, baseY - h + 4, 2, 8, PX.moss);
    rect(cx - 4, baseY - h - 5, 8, 3, sc.foliage[1]);
  } else if (sc.biome === "snow") {
    rect(cx - w / 2 - 2, baseY - h - 4, w + 4, 3, "#f4f8fc");
  } else if (sc.biome === "volcano") {
    rect(cx - 3, baseY - h - 6, 6, 4, "#ff6a20");
    rect(cx - 2, baseY - h - 2, 4, 2, "#1a1410"); // 骷髅纹暗示
  } else if (sc.biome === "desert") {
    drawPyramid(cx, baseY - 2, 5, sc.stoneA, sc.stoneB, true);
    return;
  }
}

function drawBackground() {
  const h = GH;
  const w = GW;
  const horizon = Math.floor(h * (0.26 - state.camPitch * 0.14));
  const scroll = state.scroll;
  const bank = state.camBank * 22 + state.pathBend * 14;
  const sc = activeScene();
  const biome = sc.biome;

  // 1) 天空
  for (let y = 0; y < horizon; y += 1) {
    const t = y / Math.max(1, horizon);
    let c;
    if (t < 0.22) c = sc.sky[0];
    else if (t < 0.5) c = sc.sky[1];
    else if (t < 0.78) c = sc.sky[2];
    else c = sc.sky[3];
    bctx.fillStyle = c;
    bctx.fillRect(0, y, w, 1);
  }

  // 太阳（丛林 / 沙漠）
  if (sc.sun) {
    const sx = biome === "desert" ? w * 0.72 : w * 0.8;
    const sy = biome === "desert" ? horizon - 18 : 8;
    const col = biome === "desert" ? "#ffb040" : "#ffe066";
    rect(sx - bank * 0.15, sy, 12, 12, col);
    rect(sx + 2 - bank * 0.15, sy + 2, 8, 8, "#fff0a0");
  }

  // 云
  for (let i = 0; i < 5; i += 1) {
    const cx = px(((i * 95 + scroll * 0.03) % (w + 60)) - 30 - bank * 0.3);
    const cy = 5 + (i % 3) * 6;
    rect(cx, cy, 26, 5, sc.cloud);
    rect(cx + 5, cy - 3, 16, 4, sc.cloud);
    rect(cx + 8, cy + 3, 12, 3, sc.cloudShade);
  }

  // 2) 远景地标（按生物群系）
  if (biome === "jungle") {
    // 远山丛林 + 金字塔剪影
    for (let layer = 0; layer < 3; layer += 1) {
      const baseY = horizon - 4 - layer * 7;
      const col = sc.hills[layer];
      for (let i = 0; i < 12; i += 1) {
        const x = px((i / 12) * w - bank * (0.15 + layer * 0.1));
        const hh = 8 + ((i * 5 + layer * 3) % 14) + layer * 3;
        rect(x, baseY - hh, 10, hh, col);
        rect(x - 2, baseY - hh - 3, 14, 5, col);
      }
    }
    drawPyramid(w * 0.72 - bank * 0.3, horizon - 2, 6, sc.stoneA, sc.stoneB, false);
    // 瀑布
    for (let i = 0; i < 3; i += 1) {
      const fx = px(w * 0.82 + i * 10 - bank * 0.25);
      const fh = 18 + i * 4;
      rect(fx, horizon - fh, 4, fh, PX.water);
      rect(fx + 1, horizon - fh + 2, 2, fh - 2, PX.waterLt);
    }
  } else if (biome === "desert") {
    // 平顶山 / 台地
    for (let i = 0; i < 5; i += 1) {
      const x = px((i / 5) * w + 10 - bank * 0.4);
      const mw = 22 + (i % 3) * 8;
      const mh = 10 + (i % 4) * 5;
      rect(x, horizon - mh, mw, mh, sc.hills[i % 3]);
      rect(x - 2, horizon - mh - 3, mw + 4, 4, sc.hills[0]);
    }
    drawPyramid(w / 2 - bank * 0.2, horizon, 8, sc.stoneA, sc.stoneB, true);
  } else if (biome === "snow") {
    // 雪峰山脉
    for (let i = 0; i < 8; i += 1) {
      const x = px((i / 8) * w - bank * 0.35);
      const mh = 18 + (i % 5) * 7;
      bctx.beginPath();
      bctx.moveTo(px(x), px(horizon));
      bctx.lineTo(px(x + 10), px(horizon - mh));
      bctx.lineTo(px(x + 22), px(horizon));
      bctx.closePath();
      bctx.fillStyle = sc.hills[i % 3];
      bctx.fill();
      // 雪顶
      bctx.beginPath();
      bctx.moveTo(px(x + 7), px(horizon - mh + 6));
      bctx.lineTo(px(x + 10), px(horizon - mh));
      bctx.lineTo(px(x + 14), px(horizon - mh + 6));
      bctx.closePath();
      bctx.fillStyle = "#f4f8fc";
      bctx.fill();
    }
  } else if (biome === "volcano") {
    drawVolcano(w * 0.22 - bank * 0.3, horizon, 28, true);
    drawVolcano(w * 0.5 - bank * 0.2, horizon, 36, true);
    drawVolcano(w * 0.78 - bank * 0.3, horizon, 24, true);
    // 烟尘
    bctx.globalAlpha = 0.35;
    for (let i = 0; i < 4; i += 1) {
      rect(40 + i * 80, 4 + (i % 2) * 6, 50, 8, "#3a3038");
    }
    bctx.globalAlpha = 1;
  }

  // 3) 中景石柱 / 断垣
  for (let i = 0; i < 8; i += 1) {
    const x = px((i / 8) * w + 6 - bank * 0.5);
    const tw = 3 + (i % 2);
    const th = 14 + (i % 4) * 6;
    const top = horizon - th;
    rect(x, top, tw, th, i % 2 ? sc.stoneA : sc.stoneB);
    if (biome === "jungle") {
      rect(x, top + 2, 1, th * 0.4, PX.vine);
      rect(x - 1, top, tw + 2, 2, sc.foliage[1]);
    } else if (biome === "snow") {
      rect(x - 1, top - 2, tw + 2, 3, "#f4f8fc");
    } else if (biome === "volcano" && i % 3 === 0) {
      rect(x, top + th - 4, tw, 3, "#ff6a20");
    }
  }

  // 中央神庙门（沙漠用金字塔已画）
  if (biome !== "desert") {
    drawTempleGate(w / 2 - bank * 0.15, horizon + 1, sc);
  }

  // 4) 地平线雾
  bctx.globalAlpha = biome === "volcano" ? 0.35 : 0.4;
  rect(0, horizon - 4, w, 8, sc.mist);
  bctx.globalAlpha = 0.2;
  rect(0, horizon + 2, w, 10, sc.mist2);
  bctx.globalAlpha = 1;

  // 5) 桥下 / 路侧地面
  for (let y = horizon; y < h; y += 1) {
    const t = (y - horizon) / Math.max(1, h - horizon);
    let c;
    if (biome === "volcano") {
      // 熔岩海：波动亮色
      const pulse = Math.floor(state.t * 6 + y * 0.3) % 3;
      if (t < 0.1) c = sc.abyss[1];
      else if (pulse === 0) c = sc.abyss[0];
      else if (pulse === 1) c = sc.abyss[1];
      else c = sc.abyss[2];
      if (t > 0.7) c = sc.abyss[3];
    } else if (state.gapOpen > 0.25) {
      c = t < 0.25 ? sc.abyss[2] : sc.abyss[3];
    } else if (t < 0.1) c = sc.abyss[0];
    else if (t < 0.3) c = sc.abyss[1];
    else if (t < 0.55) c = sc.abyss[2];
    else c = sc.abyss[3];
    bctx.fillStyle = c;
    bctx.fillRect(0, y, w, 1);
  }

  // 两侧装饰带
  for (let y = horizon; y < h; y += 4) {
    const t = (y - horizon) / Math.max(1, h - horizon);
    const edgeW = Math.floor(16 + t * 48);
    rect(0, y, edgeW, 4, t < 0.35 ? sc.edge[0] : sc.edge[1]);
    rect(w - edgeW, y, edgeW, 4, t < 0.35 ? sc.edge[0] : sc.edge[1]);
  }

  // 熔岩瀑布（火山）
  if (biome === "volcano") {
    for (let i = 0; i < 4; i += 1) {
      const side = i < 2;
      const fx = px(side ? 20 + i * 18 : w - 30 - (i - 2) * 18);
      const fh = 20 + i * 5;
      rect(fx, horizon - 4, 5, fh + 10, "#ff6a20");
      rect(fx + 1, horizon - 2, 3, fh + 6, "#ffd080");
    }
  }

  // 水雾 / 热浪 / 雪尘
  bctx.globalAlpha = biome === "volcano" ? 0.22 : 0.26;
  for (let i = 0; i < 7; i += 1) {
    const mx = px(((i * 55 + scroll * 0.2) % (w + 50)) - 25);
    const my = horizon + 12 + (i % 4) * 14;
    rect(mx, my, 40, 5, sc.mist);
  }
  bctx.globalAlpha = 1;

  // 6) 路侧道具：仙人掌 / 松树 / 丛林叶
  if (biome === "desert") {
    for (let i = 0; i < 6; i += 1) {
      const side = i % 2 === 0 ? 0 : 1;
      const x = side === 0 ? 10 + (i * 9) % 40 : w - 20 - (i * 9) % 40;
      const y = horizon + 20 + (i % 3) * 18;
      drawCactus(x - bank * 0.1, y, 0.7 + (i % 3) * 0.15);
    }
  } else if (biome === "snow") {
    for (let i = 0; i < 8; i += 1) {
      const side = i % 2 === 0 ? 0 : 1;
      const x = side === 0 ? 8 + (i * 11) % 48 : w - 18 - (i * 11) % 48;
      const y = horizon + 16 + (i % 4) * 16;
      drawPine(x - bank * 0.1, y, 0.65 + (i % 2) * 0.2, true);
    }
  } else if (biome === "jungle") {
    // 近景阔叶框
    for (let side = 0; side < 2; side += 1) {
      const baseX = side === 0 ? -2 : w - 34;
      for (let i = 0; i < 5; i += 1) {
        const x = baseX + (side === 0 ? i * 6 : -i * 6);
        const ty = 1 + (i % 3) * 4;
        rect(x, ty, 20, 9, sc.foliage[0]);
        rect(x + 2, ty - 3, 14, 6, sc.foliage[1]);
        rect(x + 5, ty + 2, 8, 5, sc.foliage[2]);
        // 垂藤
        rect(x + 8, ty + 8, 2, 12 + i * 4, PX.vine);
      }
    }
  } else if (biome === "volcano") {
    // 漂浮火星
    for (let i = 0; i < 16; i += 1) {
      const ex = px(((i * 37 + state.t * 28) % (w + 20)) - 10);
      const ey = px(((i * 19 + state.t * 40) % (h - 20)) + 4);
      rect(ex, ey, 1 + (i % 2), 1 + (i % 2), i % 3 ? "#ff8a40" : "#ffd080");
    }
  }

  // 非丛林的近景框（沙漠/雪/火山简化）
  if (biome !== "jungle") {
    for (let side = 0; side < 2; side += 1) {
      const baseX = side === 0 ? 0 : w - 10;
      for (let i = 0; i < 4; i += 1) {
        const y = 2 + i * 8;
        if (biome === "snow") rect(baseX, y, 10, 6, "#e8f0f8");
        else if (biome === "desert") rect(baseX, y + 40, 10, 8, sc.edge[0]);
        else rect(baseX, horizon + 8 + i * 10, 8, 6, "#ff6a20");
      }
    }
  }

  // 7) 光柱
  if (sc.sunrays) {
    bctx.globalAlpha = 0.07 + Math.sin(state.t * 1.2) * 0.025;
    bctx.fillStyle = sc.rayColor;
    for (let i = 0; i < 3; i += 1) {
      const gx = w * (0.3 + i * 0.18) - bank * 0.2;
      bctx.beginPath();
      bctx.moveTo(px(gx), 0);
      bctx.lineTo(px(gx + 16), 0);
      bctx.lineTo(px(gx + 36), horizon + 16);
      bctx.lineTo(px(gx - 8), horizon + 16);
      bctx.closePath();
      bctx.fill();
    }
    bctx.globalAlpha = 1;
  }

  if (state.sceneFlash > 0) {
    bctx.globalAlpha = Math.min(0.55, state.sceneFlash * 0.55);
    bctx.fillStyle = sc.rayColor;
    bctx.fillRect(0, 0, w, h);
    bctx.globalAlpha = 1;
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

    // 路侧峡谷崖壁 + 丛林（颜色随场景）
    if (i % 2 === 0 && !gapZone) {
      const sc = activeScene();
      const cliffH = Math.max(3, 10 * c0.scale);
      rect(c0.x - rw0 - 8 * c0.scale, c0.y, 8 * c0.scale, cliffH, sc.edge[1]);
      rect(c0.x + rw0, c0.y, 8 * c0.scale, cliffH, sc.edge[1]);
      if (i % 6 === 0) {
        rect(c0.x - rw0 - 6 * c0.scale, c0.y - 2, 4 * c0.scale, 3, sc.foliage[1]);
        rect(c0.x + rw0 + 2 * c0.scale, c0.y - 2, 4 * c0.scale, 3, PX.moss);
      }
    }

    bctx.beginPath();
    bctx.moveTo(px(c0.x - rw0), px(c0.y));
    bctx.lineTo(px(c0.x + rw0), px(c0.y));
    bctx.lineTo(px(c1.x + rw1), px(c1.y));
    bctx.lineTo(px(c1.x - rw1), px(c1.y));
    bctx.closePath();
    if (gapZone) {
      bctx.fillStyle = PX.abyss;
      bctx.fill();
      for (let s = 0; s < 5; s += 1) {
        rect(c0.x - 12 + s * 6, c0.y + 2, 3, 6 + state.gapOpen * 8, PX.stone1);
      }
      continue;
    }
    const stripe = Math.floor((i + state.scroll / segLen) % 2) === 0;
    const scRoad = activeScene();
    if (scRoad.biome === "desert") {
      bctx.fillStyle = stripe ? "#b8a090" : "#9a8070";
    } else if (scRoad.biome === "snow") {
      bctx.fillStyle = stripe ? "#c8d0d8" : "#a0a8b0";
    } else if (scRoad.biome === "volcano") {
      bctx.fillStyle = stripe ? "#5a5a62" : "#3a3a42";
    } else {
      bctx.fillStyle = stripe ? PX.stone1 : PX.stone2;
    }
    bctx.fill();
    // 苔藓 / 积雪 / 熔岩裂缝点缀
    if (i % 5 === 0) {
      if (scRoad.biome === "jungle") {
        rect(c0.x - rw0 * 0.4, c0.y - 1, 4, 2, PX.moss);
      } else if (scRoad.biome === "snow") {
        rect(c0.x - 3, c0.y - 1, 6, 2, "#e8f0f8");
      } else if (scRoad.biome === "volcano" && i % 10 === 0) {
        rect(c0.x - 2, c0.y, 4, 2, "#ff6a20");
      }
    }

    // 正道高亮（宝藏道 / 弯道）
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
    else if (Math.abs(state.pathBend) > 0.12) bctx.fillStyle = stripe ? "#7eb8e8" : "#4a90b8";
    else bctx.fillStyle = stripe ? "#a8a8b0" : "#787880";
    bctx.fill();

    // 苔藓边缘
    if (i % 4 === 0) {
      rect(c0.x - rw0, c0.y - 1, 3, 2, PX.moss);
      rect(c0.x + rw0 - 3, c0.y - 1, 3, 2, PX.moss);
    }

    if (i % 2 === 0) {
      for (const lane of [0.5, 1.5]) {
        const d = worldXY(lane, Math.max(0, z0));
        rect(d.x - 1, d.y, 2, Math.max(1, 2 * d.scale), "#4a4a52");
      }
    }

    // 石栏 + 火把石柱（更高、带藤）
    rect(c0.x - rw0, c0.y - 1, 2, 2, PX.stone3);
    rect(c0.x + rw0 - 2, c0.y - 1, 2, 2, PX.stone3);
    if (i % 4 === 0) {
      const ph = Math.max(5, 16 * c0.scale);
      const pw = Math.max(2, 3 * c0.scale);
      rect(c0.x - rw0 - 2, c0.y - ph, pw, ph, PX.stone3);
      rect(c0.x + rw0 - 1, c0.y - ph, pw, ph, PX.stone3);
      rect(c0.x - rw0 - 3, c0.y - ph, pw + 2, 2, PX.stone1);
      rect(c0.x + rw0 - 2, c0.y - ph, pw + 2, 2, PX.stone1);
      // 柱身藤蔓
      rect(c0.x - rw0 - 1, c0.y - ph + 3, 1, ph * 0.4, PX.vine);
      rect(c0.x + rw0, c0.y - ph + 5, 1, ph * 0.35, PX.moss);
      const flicker = Math.floor(state.t * 10 + i) % 2;
      rect(c0.x - rw0 - 2, c0.y - ph - 5 - flicker, 3, 5, PX.torch);
      rect(c0.x - rw0 - 1, c0.y - ph - 4, 1, 2, PX.torchCore);
      rect(c0.x + rw0 - 1, c0.y - ph - 5 - flicker, 3, 5, PX.torch);
      rect(c0.x + rw0, c0.y - ph - 4, 1, 2, PX.torchCore);
      // 火光晕
      bctx.globalAlpha = 0.15;
      rect(c0.x - rw0 - 4, c0.y - ph - 6, 7, 6, PX.torch);
      rect(c0.x + rw0 - 3, c0.y - ph - 6, 7, 6, PX.torch);
      bctx.globalAlpha = 1;
    }
  }

  // 大金箭头提示转弯
  if (Math.abs(state.pathBend) > 0.15 || state.turnBoost > 0.15) {
    const tip = worldXY(activeLane, 480);
    const s = Math.max(6, 14 * tip.scale);
    bctx.globalAlpha = Math.min(0.95, 0.4 + Math.abs(state.pathBend) + state.turnBoost * 0.5);
    bctx.fillStyle = PX.gold;
    bctx.font = `${Math.max(8, Math.round(s))}px "Press Start 2P", monospace`;
    bctx.textAlign = "center";
    const arrow = state.pathBend < -0.08 ? "←" : state.pathBend > 0.08 ? "→" : "↑";
    bctx.fillText(arrow, px(tip.x), px(tip.y - 4));
    bctx.globalAlpha = 1;
  }

  if (state.gapOpen > 0) {
    const f = state.fall;
    const kind = f?.kind || "blade";
    const fx = biomeFx();
    const p = worldXY(f?.lane ?? 1, 90);
    const g = state.gapOpen;
    if (kind === "lava") {
      rect(p.x - 22, p.y - 2, 44, 6 + g * 10, fx.pit);
      rect(p.x - 18, p.y - 1, 36, 4 + g * 8, fx.pitHot);
      rect(p.x - 10, p.y, 8, 3 + g * 4, fx.spikeTip);
      if (g > 0.5) {
        drawHazardMonster(p.x, p.y - 4, 0.9 + g * 0.4);
      }
    } else if (kind === "boulder") {
      for (let k = 0; k < 5; k += 1) {
        rect(p.x - 14 + k * 7, p.y + 1, 5, 4 + g * 6, fx.boulder);
      }
    } else {
      for (let k = 0; k < 6; k += 1) {
        rect(p.x - 16 + k * 6, p.y + k, 3, 6 + g * 10, fx.spike);
        rect(p.x - 15 + k * 6, p.y - 2 + k, 2, 4 + g * 4, fx.spikeTip);
      }
    }
  }
}

function drawFailHazard() {
  const f = state.fall;
  if (!f || state.gapOpen <= 0) return;
  const kind = f.kind || "blade";
  const fx = biomeFx();
  const p = worldXY(f.lane, 70);
  const s = Math.max(0.85, 1.1 + state.gapOpen * 0.5);
  if (kind === "blade") {
    drawHazardSpikes(p.x, p.y + 4, s);
    const swing = Math.sin((f.phase === "warn" ? f.t * 8 : state.t * 10)) * 18 * s;
    rect(p.x - 1, p.y - 40 * s, 2, 22 * s, "#5a3a18");
    rect(p.x - 14 * s + swing, p.y - 22 * s, 28 * s, 5 * s, fx.blade);
    rect(p.x - 12 * s + swing, p.y - 21 * s, 24 * s, 2 * s, PX.red);
  } else if (kind === "boulder") {
    const approach = f.phase === "warn" ? 1 - f.t / 0.42 : 0;
    const by = p.y - 10 - approach * 40;
    drawHazardBoulder(p.x, by, s * (1.1 + (1 - approach) * 0.3));
  } else {
    drawHazardLava(p.x, p.y + 2, s);
    if (f.phase !== "warn" || f.t > 0.12) {
      drawHazardMonster(p.x, p.y - 10 * s, s * 1.15);
    }
  }
}

function drawDebris() {
  state.debris.forEach((d) => {
    const p = worldXY(d.lane, Math.max(0, d.z));
    const s = Math.max(2, (d.size || 10) * 0.25);
    rect(p.x + (d.x || 0) * 0.05, p.y + (d.y || 0) * 0.08, s, s * 0.6, d.tint || PX.stone2);
  });
}

function drawPixelCoin(x, y, s, burst) {
  const fx = biomeFx();
  const copper = !!state.loadout?.parts?.coinCopper;
  const size = Math.max(4, Math.round((burst ? 11 : 6) * Math.max(0.35, s)));
  const frame = Math.floor(state.t * 12 + x * 0.2) % 4;
  const squash = frame === 1 || frame === 3 ? 0.45 : 1;
  const w = Math.max(3, Math.round(size * squash));
  const h = size;
  const cx = px(x - w / 2);
  const cy = px(y - h / 2);
  const fill = copper ? (burst ? "#d4944a" : "#c87838") : (burst ? fx.coin : PX.gold);
  const lite = copper ? "#f0c090" : (burst ? fx.coinLt : PX.goldLt);
  const dark = copper ? "#8a4820" : PX.goldDk;
  rect(cx - 1, cy + h, w + 2, 2, "#00000055");
  rect(cx, cy, w, h, PX.ink);
  rect(cx + 1, cy + 1, Math.max(1, w - 2), Math.max(1, h - 2), fill);
  if (w > 3) {
    rect(cx + 1, cy + 1, 1, 1, lite);
    if (burst) rect(cx + Math.max(1, w - 3), cy + Math.max(1, h - 3), 1, 1, dark);
  }
  if (burst && frame === 0) {
    rect(cx + w, cy - 1, 2, 2, PX.white);
    rect(cx - 2, cy + Math.floor(h / 2), 2, 1, lite);
  }
}

function drawPixelGem(x, y, s) {
  const fx = biomeFx();
  const size = Math.max(4, Math.round(8 * Math.max(0.35, s)));
  const cx = px(x);
  const cy = px(y - size / 2);
  rect(cx - 1, cy + size, 3, 2, "#00000055");
  for (let i = 0; i < size / 2; i += 1) {
    rect(cx - i, cy + i, i * 2 + 1, 1, fx.gemDk);
  }
  for (let i = 0; i < size / 2; i += 1) {
    rect(cx - (size / 2 - i), cy + size / 2 + i, (size / 2 - i) * 2 + 1, 1, fx.gem);
  }
  rect(cx, cy + 1, 1, 1, PX.white);
}

function drawWoodenSign(x, y, s, text) {
  const w = Math.max(18, Math.round(28 * s));
  const h = Math.max(8, Math.round(12 * s));
  rect(x - 1, y, 2, Math.max(4, 8 * s), "#5a3a18");
  rect(x - w / 2, y - h, w, h, "#8a5a28");
  rect(x - w / 2 + 1, y - h + 1, w - 2, h - 2, "#c4893a");
  bctx.fillStyle = PX.ink;
  bctx.font = `${Math.max(4, Math.round(5 * s))}px "Press Start 2P", monospace`;
  bctx.textAlign = "center";
  bctx.fillText(text, px(x), px(y - h / 2 + 2));
}

function drawWarnSign(x, y, s) {
  const sz = Math.max(5, Math.round(8 * s));
  rect(x - 1, y - sz, 2, sz + 2, "#5a3a18");
  bctx.fillStyle = PX.gold;
  bctx.beginPath();
  bctx.moveTo(px(x), px(y - sz - 2));
  bctx.lineTo(px(x + sz), px(y + 1));
  bctx.lineTo(px(x - sz), px(y + 1));
  bctx.closePath();
  bctx.fill();
  bctx.fillStyle = PX.ink;
  bctx.font = `${Math.max(5, Math.round(6 * s))}px "Press Start 2P", monospace`;
  bctx.textAlign = "center";
  bctx.fillText("!", px(x), px(y - 1));
}

function drawPortal(x, y, s, color) {
  const hw = Math.max(12, Math.round(22 * s));
  const hh = Math.max(20, Math.round(38 * s));
  // 石门框 + 能量门
  rect(x - hw - 3, y - hh, 5, hh + 3, PX.stone3);
  rect(x + hw - 2, y - hh, 5, hh + 3, PX.stone3);
  rect(x - hw - 3, y - hh - 4, hw * 2 + 6, 5, PX.stone2);
  rect(x - hw - 4, y - 2, hw * 2 + 8, 4, PX.stone3);
  // 垛口
  for (let i = -2; i <= 2; i += 1) {
    rect(x + i * (hw / 2.2) - 2, y - hh - 7, 4, 4, PX.stone1);
  }
  const pulse = 0.5 + Math.sin(state.t * 7) * 0.2;
  bctx.globalAlpha = pulse;
  rect(x - hw + 2, y - hh + 2, hw * 2 - 4, hh - 2, color);
  bctx.globalAlpha = 0.4;
  rect(x - hw / 2, y - hh + 6, hw, hh - 10, PX.white);
  bctx.globalAlpha = 0.55;
  // 门内星点
  for (let i = 0; i < 4; i += 1) {
    const ox = Math.sin(state.t * 3 + i * 1.7) * (hw * 0.5);
    const oy = ((state.t * 18 + i * 9) % hh);
    rect(x + ox - 1, y - oy, 2, 2, PX.white);
  }
  bctx.globalAlpha = 1;
}

function drawHazardSpikes(x, y, s) {
  const fx = biomeFx();
  for (let i = 0; i < 5; i += 1) {
    const sx = x - 12 * s + i * 6 * s;
    const h = Math.max(6, (8 + (i % 2) * 3) * s);
    rect(sx, y - h, Math.max(2, 3 * s), h, fx.spike);
    rect(sx, y - h - 3 * s, Math.max(1, 2 * s), Math.max(2, 4 * s), fx.spikeTip);
  }
}

function drawHazardBlade(x, y, s) {
  const fx = biomeFx();
  const swing = Math.sin(state.t * 5) * 14 * s;
  rect(x - 1, y - 34 * s, 2, 20 * s, "#5a3a18");
  rect(x - 2, y - 36 * s, 4, 4, PX.stone3);
  rect(x - 12 * s + swing, y - 18 * s, 24 * s, 4 * s, fx.blade);
  rect(x - 10 * s + swing, y - 17 * s, 20 * s, 2 * s, PX.red);
  rect(x - 14 * s + swing, y - 16 * s, 3 * s, 2 * s, fx.spikeTip);
  rect(x + 11 * s + swing, y - 16 * s, 3 * s, 2 * s, fx.spikeTip);
}

function drawHazardBoulder(x, y, s) {
  const fx = biomeFx();
  const bob = Math.sin(state.t * 5) * 3;
  const roll = Math.sin(state.t * 3) * 2;
  const r = Math.max(10, Math.round(18 * s));
  rect(x - r + roll, y - r * 1.7 + bob, r * 2, r * 2, fx.boulder);
  rect(x - r + 3 + roll, y - r * 1.7 + 3 + bob, r * 2 - 6, r * 2 - 6, PX.stone3);
  rect(x - 5 + roll, y - r + bob, 3, 3, PX.red);
  rect(x + 3 + roll, y - r + bob, 3, 3, PX.red);
  rect(x - 4 + roll, y - r + 7 + bob, 8, 2, PX.ink);
  rect(x - r - 3 + roll, y - 3 + bob, 3, 3, fx.spike);
  rect(x + r + roll, y - 5 + bob, 3, 3, fx.spike);
  rect(x - r - 4, y + 1, 3, 1, PX.white);
  rect(x + r + 2, y + 2, 3, 1, PX.white);
}

function drawHazardLava(x, y, s) {
  const fx = biomeFx();
  const flicker = Math.floor(state.t * 10) % 3;
  rect(x - 14 * s, y - 3, 28 * s, 7 * s, fx.pit);
  rect(x - 12 * s, y - 2 - flicker, 24 * s, 5 * s, fx.pitHot);
  rect(x - 8 * s, y - 1 - flicker, 6 * s, 3 * s, fx.spikeTip);
  rect(x + 2 * s, y - flicker, 5 * s, 2 * s, fx.coinLt || PX.torchCore);
}

function drawHazardMonster(x, y, s) {
  const hw = Math.max(12, 20 * s);
  const hh = Math.max(12, 18 * s);
  const chomp = Math.sin(state.t * 6) * 2;
  rect(x - hw, y - hh - 6, hw * 2, hh + 6, PX.stone3);
  rect(x - hw + 2, y - hh - 4, hw * 2 - 4, hh, PX.stone2);
  rect(x - 7, y - hh + 2, 4, 4, PX.red);
  rect(x + 3, y - hh + 2, 4, 4, PX.red);
  rect(x - 6, y - hh + 3, 2, 2, PX.white);
  rect(x + 4, y - hh + 3, 2, 2, PX.white);
  // 獠牙
  rect(x - 8, y - 2 + chomp, 3, 5, PX.white);
  rect(x - 2, y - 1 + chomp, 3, 6, PX.white);
  rect(x + 4, y - 2 + chomp, 3, 5, PX.white);
}

function forkLaneAt(lane, t) {
  // t: 0=汇合中道, 1=完全分到 A/B/C
  return 1 + (lane - 1) * t;
}

function drawLaneBranch(lane, zNear, zFar, color) {
  const steps = 8;
  for (let i = 0; i < steps; i += 1) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const z0 = zNear + (zFar - zNear) * t0;
    const z1 = zNear + (zFar - zNear) * t1;
    const a = worldXY(forkLaneAt(lane, t0), z0);
    const b = worldXY(forkLaneAt(lane, t1), z1);
    const rw0 = a.roadHalf * (0.28 + 0.06 * t0);
    const rw1 = b.roadHalf * (0.28 + 0.06 * t1);
    bctx.beginPath();
    bctx.moveTo(px(a.x - rw0), px(a.y));
    bctx.lineTo(px(a.x + rw0), px(a.y));
    bctx.lineTo(px(b.x + rw1), px(b.y));
    bctx.lineTo(px(b.x - rw1), px(b.y));
    bctx.closePath();
    bctx.fillStyle = i % 2 === 0 ? PX.stone1 : PX.stone2;
    bctx.fill();
    // 护栏
    rect(a.x - rw0 - 2, a.y - 5 * a.scale, 2, 5 * a.scale, PX.stone3);
    rect(a.x + rw0, a.y - 5 * a.scale, 2, 5 * a.scale, PX.stone3);
    bctx.strokeStyle = color;
    bctx.globalAlpha = 0.85;
    bctx.lineWidth = 2;
    bctx.stroke();
    bctx.globalAlpha = 1;
  }
}

function drawQuizGate(e) {
  const colors = [PX.cyan, PX.gold, "#e07030"];
  const labels = ["A", "B", "C"];
  const signs = ["← A", "↑ B", "C →"];
  const correct = e.correctLane ?? 1;
  const zPortal = e.z;
  // 陷阱/木牌更靠前，体量更大，对照示意图三岔口
  const zHazard = Math.max(280, e.z * 0.55);
  const zSign = Math.max(220, e.z * 0.42);
  const zBranchNear = 180;
  const zBranchFar = Math.max(320, e.z * 0.85);

  for (let lane = 0; lane < 3; lane += 1) {
    drawLaneBranch(lane, zBranchNear, zBranchFar, colors[lane]);
  }

  for (let lane = 0; lane < 3; lane += 1) {
    const safe = lane === correct;
    const portal = worldXY(lane, zPortal);
    const ps = portal.scale * 1.55;
    drawPortal(portal.x, portal.y, ps, colors[lane]);
    bctx.fillStyle = colors[lane];
    bctx.font = `${Math.max(7, Math.round(10 * ps))}px "Press Start 2P", monospace`;
    bctx.textAlign = "center";
    bctx.fillText(labels[lane], px(portal.x), px(portal.y - 42 * ps));

    const hz = worldXY(lane, zHazard);
    const hs = hz.scale * 1.35;
    if (!safe) {
      drawWarnSign(hz.x + 14 * hs, hz.y - 22 * hs, hs);
      if (lane === 0) {
        drawHazardSpikes(hz.x, hz.y, hs);
        drawHazardBlade(hz.x, hz.y - 2, hs);
      } else if (lane === 1) {
        drawHazardBoulder(hz.x, hz.y, hs);
      } else {
        drawHazardLava(hz.x, hz.y, hs);
        drawHazardMonster(hz.x, hz.y - 6 * hs, hs);
      }
    } else {
      drawPixelCoin(hz.x - 8, hz.y - 10 * hs, hs * 0.95, true);
      drawPixelCoin(hz.x + 2, hz.y - 6 * hs, hs * 0.95, true);
      drawPixelCoin(hz.x + 10, hz.y - 12 * hs, hs * 0.95, true);
      bctx.fillStyle = PX.gold;
      bctx.font = `${Math.max(10, Math.round(14 * hs))}px "Press Start 2P", monospace`;
      bctx.textAlign = "center";
      bctx.fillText(lane === 0 ? "←" : lane === 2 ? "→" : "↑", px(hz.x), px(hz.y - 20 * hs));
    }

    const sg = worldXY(lane, zSign);
    drawWoodenSign(sg.x, sg.y - 6 * sg.scale, sg.scale * 1.25, signs[lane]);
  }
}

function drawRunner() {
  const p = worldXY(state.targetLane, RUNNER_Z);
  const load = state.loadout;
  const eq = resolveEquipFx(load, {
    burst: state.burstActive,
    fall: !!state.fall,
  });
  const baseY = p.y + Math.sin(state.bob * eq.bobSpeed) * eq.bobAmp + state.runnerFallY * 0.12;
  const x = (state.laneX || p.x) + (state.runnerHitX || 0);
  const y = baseY - eq.bodyLift;
  const s = Math.max(0.6, p.scale);
  const flash = state.invuln > 0 && Math.floor(state.t * 12) % 2 === 0;
  if (flash) return;

  const squash = state.runnerSquash || 1;
  const bw = Math.round(8 * s / Math.max(0.45, squash));
  const bh = Math.round(12 * s * squash);
  const lean = Math.round(state.camBank * 4 + state.pathBend * 2 + eq.bodyTilt * 0.15);
  const fallKind = state.fall?.kind;
  let body = state.burstActive ? biomeFx().coinLt : PX.shirt;
  if (state.fall && state.fall.phase === "impact") {
    const bfx = biomeFx();
    if (fallKind === "lava") body = bfx.pitHot;
    else if (fallKind === "blade") body = bfx.blade;
    else body = bfx.boulder;
  }

  // 装扮层（泰拉挂点）：坐骑平台 → 背后（朝右=身体左侧）翼/喷气 → 身体 → 环绕特效
  const facing = DEFAULT_FACING; // 朝右，背后在左侧
  const bodyCx = x + lean;
  if (eq.isMount && !state.fall) {
    const mountScale = Math.max(1.05, s * (eq.wingStyle === "ufo" ? 1.35 : 1.25));
    // 平台画在脚底：人物站/坐在其上
    drawFlightGear(rect, bodyCx, y + (eq.sitPose ? 2 : 4), mountScale, {
      style: eq.wingStyle || "carpet",
      flying: eq.flying,
      t: state.t,
      lean: 0,
      facing,
      layer: "mount",
    });
  }
  if ((eq.isWings || eq.isJetpack) && !state.fall) {
    const gearScale = Math.max(0.95, s * (eq.isJetpack ? 1.15 : eq.isWings ? 1.22 : 1.05));
    const backKind = eq.wingStyle === "rocket" ? "rocket" : eq.isJetpack ? "jetpack" : "wings";
    const backCx = backAnchorX(bodyCx, gearScale, { facing, kind: backKind });
    const backY = eq.isJetpack ? y - bh * 0.4 : y - bh * 0.55;
    drawFlightGear(rect, backCx, backY, gearScale, {
      style: eq.wingStyle || "feather",
      flying: eq.flying,
      t: state.t,
      lean: 0,
      facing,
      layer: "back",
    });
    if (eq.flying && (state.trailTick || 0) % 3 === 0) {
      const exhY = eq.isJetpack ? y - bh * 0.05 : y - bh * 0.2;
      spawnWingTrail(state.fx, backCx, exhY, eq.wingStyle || "feather", { dir: facing, count: 2 });
    }
  }
  if (eq.isMount && eq.flying && (state.trailTick || 0) % 4 === 0) {
    spawnWingTrail(state.fx, bodyCx, y + 2, eq.wingStyle || "carpet", { count: 2 });
  }
  if (load?.parts?.cape && !state.fall) {
    const capeScale = Math.max(0.8, s);
    const capeCx = backAnchorX(bodyCx, capeScale, { facing, kind: "cape" });
    drawCape(rect, capeCx, y - bh * 0.15, capeScale, {
      t: state.t,
      lean: 0,
      facing,
      wind: eq.capeWind,
    });
  }

  rect(x - bw / 2 + lean, y + 2, bw, 3, "#00000055");
  // 坐骑飞行：略蹲坐的躯干
  const sit = eq.sitPose;
  const torsoH = sit ? Math.round(bh * 0.85) : bh;
  const torsoY = sit ? y - torsoH + 2 : y - bh;
  rect(x - bw / 2 + lean, torsoY, bw, torsoH, body);
  rect(x - 3 + lean, torsoY + 2, bw + 2, Math.max(2, Math.round(4 * squash)), "#6a4a28");
  rect(x - 2 + lean, torsoY, 4, Math.max(2, Math.round(3 * squash)), state.burstActive ? PX.gold : PX.emerald);
  rect(x - 3 + lean, torsoY - 5 * squash, 6, Math.max(3, Math.round(5 * squash)), PX.skin);
  rect(x - 3 + lean, torsoY - 6 * squash, 6, 2, "#5a3a18");
  rect(x - 2 + lean, torsoY - 3 * squash, 1, 1, PX.ink);
  rect(x + 1 + lean, torsoY - 3 * squash, 1, 1, PX.ink);

  // 手持气球：身体画完后再画，握在右手（泰拉式）
  if (eq.flightKind === "balloon" && !state.fall) {
    const handX = x + bw * 0.85 + lean + 2;
    const handY = y - bh * 0.35;
    drawBalloons(rect, handX, handY, Math.max(0.75, s * (eq.flying ? 1.05 : 0.9)), {
      t: state.t,
      lean: 0,
      flying: eq.flying,
      side: 1,
      attach: "hand",
    });
    if (eq.flying && (state.trailTick || 0) % 3 === 0) {
      spawnBalloonTrail(state.fx, handX + 6, handY - 12, { dir: 1, count: 2 });
    }
  }

  if (load?.headStyle && !state.fall) {
    drawHeadGear(rect, x, torsoY - 8 * squash, Math.max(0.85, s), {
      t: state.t,
      lean,
      style: load.headStyle,
    });
  }
  if (load?.parts?.badge && !state.fall) {
    drawGearIcon(load.decor?.icon || "🔰", x + lean, torsoY + bh * 0.15, Math.max(7, 9 * s));
  }
  if (load?.chestStyle && !state.fall) {
    drawChestCharm(rect, x + lean + 2, torsoY + bh * 0.15, Math.max(0.7, s * 0.85), {
      t: state.t,
      style: load.chestStyle,
      framed: load.chestStyle === "clover",
    });
  }
  if (load?.parts?.sticker && !state.fall) {
    drawGearIcon(load.decor?.icon || "🐶", x + bw * 0.85 + lean, torsoY + 2, Math.max(8, 10 * s));
  }
  if (load?.decor && !state.fall) {
    const part = load.decor.part;
    if (["note", "coinCopper"].includes(part)) {
      drawGearIcon(load.decor.icon, x + bw + 2 + lean, y - bh * 0.25, Math.max(8, 10 * s));
    }
  }

  // 环绕特效：叶片 / 泡泡绕身浮动
  if (load?.trailStyle && isOrbitTrail(load.trailStyle) && !state.fall) {
    drawOrbitAura(rect, x + lean, torsoY + torsoH * 0.35, Math.max(0.8, s), {
      style: load.trailStyle,
      t: state.t,
      radius: 14,
    });
  }

  // 烟花绽放：身周周期性炸开
  if (load?.trailStyle && isBloomTrail(load.trailStyle) && !state.fall) {
    state.fwTick = (state.fwTick || 0) + 1;
    if (state.fwTick % 26 === 0 && state.fx.length < 140) {
      const ox = (Math.random() - 0.5) * 36;
      const oy = (Math.random() - 0.5) * 28 - 8;
      spawnFireworkBloom(state.fx, bodyCx + ox, torsoY + torsoH * 0.2 + oy, {
        count: 10,
        rings: 1,
        speed: 36,
        life: 0.5,
        kind: "spark",
      });
    }
  }

  const swing = Math.round(Math.sin(state.bob) * 3 * s);
  // 站立跑 / 翼飞后掠 / 坐骑蹲坐 / 气球收腿
  if (squash > 0.5 && !eq.flying) {
    rect(x - 3 + lean - swing, y, 2, 4, "#4a3020");
    rect(x + 1 + lean + swing, y, 2, 4, "#4a3020");
  } else if (eq.sitPose) {
    // 坐骑：腿收起踩在平台上
    rect(x - 4 + lean, y - 1, 3, 2, "#4a3020");
    rect(x + 1 + lean, y - 1, 3, 2, "#4a3020");
  } else if (eq.flying && eq.isWings) {
    rect(x - 4 + lean, y - 1, 2, 3, "#4a3020");
    rect(x + 2 + lean, y, 2, 3, "#4a3020");
  } else if (eq.flying && (eq.isJetpack || eq.flightKind === "balloon")) {
    rect(x - 2 + lean, y - 1, 2, 2, "#4a3020");
    rect(x + 1 + lean, y - 1, 2, 2, "#4a3020");
  }

  // UFO 舱罩：身体画完后再盖一层，部分遮住躯干
  if (eq.isMount && eq.wingStyle === "ufo" && !state.fall) {
    const mountScale = Math.max(1.05, s * 1.35);
    drawFlightGear(rect, bodyCx, y + (eq.sitPose ? 2 : 4), mountScale, {
      style: "ufo",
      flying: eq.flying,
      t: state.t,
      lean: 0,
      facing,
      layer: "overlay",
    });
  }

  if (Math.abs(Math.sin(state.bob)) > 0.6 && !state.fall) {
    if (!eq.flying) {
      rect(x - 5 + lean, y + 3, 2, 1, PX.white);
      rect(x + 3 + lean, y + 4, 2, 1, PX.white);
    }
    state.trailTick = (state.trailTick || 0) + 1;
    if (state.trailTick % 2 === 0) spawnRunnerTrail(x - 4, y + (eq.flying ? -2 : 3));
  }
  if (Math.abs(state.camBank) > 0.2 || Math.abs(state.pathBend) > 0.2) {
    const dir = state.camBank + state.pathBend < 0 ? -1 : 1;
    rect(x - dir * (bw + 3), y - 8, 3, 1, PX.gold);
    rect(x - dir * (bw + 5), y - 5, 3, 1, PX.gold);
  }

  if (load?.pet && !state.fall) {
    const motion = load.petMotion || "ground";
    const followFly = eq.flying;
    const pxPet = motion === "hover" ? x - 14 * s + lean : x - 16 * s + lean;
    const pyPet = motion === "hover"
      ? y - bh * 0.55
      : (followFly ? y - 4 : y - 2);
    drawPet(rect, pxPet, pyPet, load.petStyle || "slime", {
      t: state.t,
      scale: Math.max(0.75, s * 0.95),
      motion: followFly && motion === "ground" ? "hover" : motion,
    });
  }

  if (load?.title && !state.fall) {
    const label = `${load.title.icon || ""} ${load.title.titleText || load.title.name.replace(/^称号·/, "")}`.trim();
    bctx.globalAlpha = 0.95;
    bctx.fillStyle = "#1a1410";
    bctx.font = "5px \"Press Start 2P\", monospace";
    const tw = Math.max(36, bctx.measureText(label).width + 8);
    bctx.fillRect(px(x - tw / 2), px(y - bh - 20 * squash), px(tw), px(9));
    bctx.fillStyle = "#ffd45a";
    bctx.textAlign = "center";
    bctx.fillText(label, px(x), px(y - bh - 13 * squash));
    bctx.globalAlpha = 1;
  }
}

function drawGearIcon(icon, x, y, size = 14, opts = {}) {
  if (!icon) return;
  bctx.save();
  bctx.translate(px(x), px(y));
  if (opts.flip) bctx.scale(-1, 1);
  bctx.font = `${Math.round(size)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  bctx.textAlign = "center";
  bctx.textBaseline = "middle";
  bctx.shadowColor = "rgba(0,0,0,0.4)";
  bctx.shadowBlur = 0;
  bctx.shadowOffsetY = 1;
  bctx.fillText(icon, 0, 0);
  bctx.restore();
}

function drawFx() {
  state.fx.forEach((p) => {
    if (p.kind === "spark" || p.kind === "wingtrail") {
      bctx.globalAlpha = p.kind === "wingtrail" ? Math.max(0, p.life / (p.max || 0.5)) : 1;
      rect(p.x, p.y, p.size || 2, p.size || 2, p.color);
      bctx.globalAlpha = 1;
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
      const emoji = /[\u{1F300}-\u{1FAFF}]/u.test(p.text || "");
      bctx.font = emoji
        ? "12px \"Segoe UI Emoji\", \"Apple Color Emoji\", sans-serif"
        : "6px \"Press Start 2P\", monospace";
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
  drawFailHazard();

  const sorted = [...state.entities].sort((a, b) => b.z - a.z);
  sorted.forEach((e) => {
    if (e.type === "quiz") {
      drawQuizGate(e);
      return;
    }
    if (e.type === "coin" && !e.taken) {
      if (e.sucking && e.drawX != null) {
        if (e.gem) drawPixelGem(e.drawX, e.drawY, (e.drawScale || 1) * 0.9);
        else drawPixelCoin(e.drawX, e.drawY, (e.drawScale || 1) * 0.9, e.burst);
        return;
      }
      const p = worldXY(e.lane, e.z);
      if (e.gem) drawPixelGem(p.x + (e.sx || 0), p.y - 2 * p.scale + (e.sy || 0), p.scale);
      else drawPixelCoin(p.x + (e.sx || 0), p.y - 2 * p.scale + (e.sy || 0), p.scale, e.burst);
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
els.rewardOk?.addEventListener("click", hideReward);
els.penaltyOk?.addEventListener("click", hidePenalty);

window.__parkourDebug = {
  setScene(i) {
    const idx = ((i % WORLD_SCENES.length) + WORLD_SCENES.length) % WORLD_SCENES.length;
    state.sceneIndex = idx;
    state.quizSeen = idx * QUESTIONS_PER_SCENE;
    state.sceneFlash = 0.8;
    showZoneBanner(WORLD_SCENES[idx]);
    updateHud();
  },
  scenes: WORLD_SCENES,
};

window.addEventListener("resize", () => {
  if (state.running) resize();
});

refreshLoadout();
