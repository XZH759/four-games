/**
 * 知识乐园 · 积分商城
 * 首页地图 / 货架预览兑换 / 等级盲盒 / 背包装备 / 规则 / 活动
 */

import { resolveEquipFx, poseLabelsForLoad } from "/castle/equip-fx.js?v=4";

const STORAGE_KEY = "ailit_castle_wallet_v1";
const PAGE_SIZE = 8;

const RARITY_LABEL = { c: "普通", r: "精良", e: "史诗", l: "传说" };
const RARITY_COLOR = { c: "#7a8a96", r: "#3a8fd4", e: "#b45ad4", l: "#e8a020" };
/**
 * 定价原则：盲盒单抽便宜、博概率；货架直兑买确定性，价格明显高于「盲盒摸到同稀有度」的期望花费。
 * 参考（约）：普通期望 ~80–200 · 精良 ~250–800 · 史诗 ~1000–2000 · 传说 ~4000
 * 直兑取约 3× 期望，并随货架等级小幅上浮。
 */
const PRICE_BY_RARITY = { c: 240, r: 780, e: 3000, l: 12000 };
const CAT_LABEL = { frame: "头像框", trail: "特效", title: "称号", pet: "伙伴", decor: "装饰" };
const EQUIP_SLOTS = ["frame", "trail", "title", "pet", "decor"];

const CATS = [
  { id: "all", name: "全部" },
  { id: "frame", name: "头像框" },
  { id: "trail", name: "特效" },
  { id: "title", name: "称号" },
  { id: "pet", name: "伙伴" },
  { id: "decor", name: "装饰" },
];

const TIERS = [
  { level: 1, unlock: 0, cost: 40, weights: { c: 70, r: 25, e: 5, l: 0 }, blurb: "入门补给", box: "📦" },
  { level: 2, unlock: 500, cost: 80, weights: { c: 50, r: 35, e: 14, l: 1 }, blurb: "见习藏品", box: "🗃️" },
  { level: 3, unlock: 1500, cost: 160, weights: { c: 35, r: 40, e: 20, l: 5 }, blurb: "学者珍藏", box: "🎁" },
  { level: 4, unlock: 4000, cost: 320, weights: { c: 20, r: 40, e: 30, l: 10 }, blurb: "城堡宝库", box: "💎" },
  { level: 5, unlock: 8000, cost: 640, weights: { c: 10, r: 30, e: 40, l: 20 }, blurb: "至高圣物", box: "👑" },
];

const WEEK_MILESTONES = [1000, 2000, 3000, 5000];

/**
 * wear 实装位：
 * runner = 冲刺角色本体 · trail = 奔跑拖尾 · pet = 跟随伙伴
 * hud = HUD/头像 · scene = 商城/大厅场景 · coin = 金币皮肤 · settle = 结算特效 · gacha = 盲盒幸运
 */
const POOL = {
  1: [
    { id: "c-sticker", rarity: "c", cat: "decor", icon: "🐶", name: "像素贴纸", desc: "乐园小狗纪念贴画", buff: "肩侧贴纸", wear: "runner", part: "sticker" },
    { id: "c-badge", rarity: "c", cat: "decor", icon: "🔰", name: "新手徽章", desc: "入园纪念章", buff: "胸口徽章", wear: "runner", part: "badge" },
    { id: "c-decor-pot", rarity: "c", cat: "decor", icon: "🪴", name: "像素花盆", desc: "花丛轻摇 · 偶落花瓣", buff: "场景花盆摆件", wear: "scene", part: "prop", decorStyle: "pot" },
    { id: "c-pet-slime", rarity: "c", cat: "pet", icon: "🟢", name: "绿史莱姆伙伴", desc: "果冻弹跳跟随", buff: "地面伙伴+助威", wear: "pet", petStyle: "slime", petMotion: "ground", petBonus: 40 },
    { id: "r-frame-wood", rarity: "r", cat: "frame", icon: "🖼️", name: "木纹相框", desc: "藤叶点缀的木质边框", buff: "头像框·木纹", wear: "hud", frameStyle: "wood" },
    { id: "r-trail-dust", rarity: "r", cat: "trail", icon: "✨", name: "星尘拖尾", desc: "金色星屑拖尾", buff: "脚底星尘", wear: "trail", trailStyle: "dust" },
    { id: "r-title-star", rarity: "r", cat: "title", icon: "⭐", name: "称号·探险新星", desc: "月桂金星绶带", buff: "HUD 称号", wear: "hud", titleText: "探险新星" },
    { id: "r-necklace-star", rarity: "r", cat: "decor", icon: "🌟", name: "星辉项链", desc: "金星吊坠 · 星屑微光", buff: "胸口星辉", wear: "runner", part: "necklace", chestStyle: "star" },
  ],
  2: [
    { id: "c-coin-skin", rarity: "c", cat: "decor", icon: "🪙", name: "铜币皮肤", desc: "金币外观·铜色", buff: "冲刺金币变铜", wear: "coin", part: "coinCopper" },
    { id: "r-decor-balloon", rarity: "r", cat: "decor", icon: "🎈", name: "派对气球束", desc: "右手牵绳浮空 · 泰拉式手持", buff: "手持气球浮空飞行", wear: "runner", part: "balloon", decorStyle: "balloon", flyMode: "balloon", attach: "hand" },
    { id: "r-trail-spark", rarity: "r", cat: "trail", icon: "🔥", name: "像素火花", desc: "橙红火花上飘", buff: "火花特效", wear: "trail", trailStyle: "spark" },
    { id: "r-pet-bee", rarity: "r", cat: "pet", icon: "🐝", name: "机械蜜蜂", desc: "蓝晶翼急速扇动", buff: "悬停伙伴", wear: "pet", petStyle: "bee", petMotion: "hover", petBonus: 60 },
    { id: "r-pendant-crystal", rarity: "r", cat: "decor", icon: "💎", name: "水晶吊坠", desc: "冰蓝泪滴 · 微光闪烁", buff: "胸口水晶", wear: "runner", part: "pendant", chestStyle: "crystal" },
    { id: "r-helm-miner", rarity: "r", cat: "decor", icon: "⛑️", name: "矿工头盔", desc: "头灯常亮 · 矿道探索感", buff: "头顶矿盔", wear: "runner", part: "helmet", headStyle: "miner" },
    { id: "e-frame-vine", rarity: "e", cat: "frame", icon: "🌿", name: "藤蔓相框", desc: "粉花藤蔓缠绕", buff: "头像框·藤蔓", wear: "hud", frameStyle: "vine" },
    { id: "e-title-craft", rarity: "e", cat: "title", icon: "🛠️", name: "称号·知识工匠", desc: "书与锤扳手绶带", buff: "HUD 称号", wear: "hud", titleText: "知识工匠" },
    { id: "l-charm-luck", rarity: "l", cat: "decor", icon: "🍀", name: "幸运护符", desc: "金框四叶 · 盲盒传说+8", buff: "胸口微光+幸运", wear: "runner", part: "luck", chestStyle: "clover", chestFx: "clover" },
  ],
  3: [
    { id: "c-decor-cabin", rarity: "c", cat: "decor", icon: "🏠", name: "小木屋摆件", desc: "窗光暖黄 · 烟囱轻烟", buff: "场景木屋", wear: "scene", part: "prop", decorStyle: "cabin" },
    { id: "r-decor-sign", rarity: "r", cat: "decor", icon: "🌙", name: "夜灯路牌", desc: "月牌摇曳 · 灯火闪烁", buff: "场景路牌灯", wear: "scene", part: "prop", decorStyle: "sign" },
    { id: "r-trail-ice", rarity: "r", cat: "trail", icon: "❄️", name: "冰晶足迹", desc: "脚下冰斑与雪花", buff: "冰晶足迹", wear: "trail", trailStyle: "ice" },
    { id: "e-cape-scholar", rarity: "e", cat: "decor", icon: "🧥", name: "学者披风", desc: "深蓝金边 · 颈扣蓝宝石", buff: "背后披风摆动", wear: "runner", part: "cape", capeStyle: "scholar" },
    { id: "e-goggles-steam", rarity: "e", cat: "decor", icon: "🥽", name: "蒸汽护目镜", desc: "皮革镜框 · 蓝晶镜片", buff: "眼部护目镜", wear: "runner", part: "goggles", headStyle: "goggles" },
    { id: "e-carpet-magic", rarity: "e", cat: "decor", icon: "🧞", name: "魔法飞毯", desc: "坐上紫毯金纹巡航 · 与气球互斥", buff: "飞毯坐骑飞行", wear: "runner", part: "wings", wingStyle: "carpet", flyMode: "wing" },
    { id: "e-pet-owl", rarity: "e", cat: "pet", icon: "🦉", name: "像素猫头鹰", desc: "转头待机 · 偶扇翅", buff: "悬停伙伴+助威", wear: "pet", petStyle: "owl", petMotion: "hover", petBonus: 80 },
    { id: "e-pet-train", rarity: "e", cat: "pet", icon: "🚂", name: "小火车伙伴", desc: "蒸汽小火车跟脚", buff: "地面伙伴+助威", wear: "pet", petStyle: "train", petMotion: "ground", petBonus: 120 },
    { id: "l-title-sky", rarity: "l", cat: "title", icon: "🎈", name: "称号·天空旅者", desc: "热气球云端绶带", buff: "HUD 称号", wear: "hud", titleText: "天空旅者" },
  ],
  4: [
    { id: "r-decor-trophy", rarity: "r", cat: "decor", icon: "🏆", name: "矿石奖杯", desc: "紫蓝晶石闪光", buff: "场景奖杯", wear: "scene", part: "prop", decorStyle: "trophy" },
    { id: "r-banner", rarity: "r", cat: "decor", icon: "🏳️", name: "城堡旗帜", desc: "紫旗金冠 · 迎风摆动", buff: "场景旗帜", wear: "scene", part: "banner", decorStyle: "banner" },
    { id: "e-trail-aurora", rarity: "e", cat: "trail", icon: "🌈", name: "彩虹拖尾", desc: "七色弧光拖尾", buff: "彩虹拖尾", wear: "trail", trailStyle: "aurora" },
    { id: "e-trail-leaf", rarity: "e", cat: "trail", icon: "🍃", name: "叶片旋风", desc: "绿叶环绕身侧浮动", buff: "环绕叶片", wear: "trail", trailStyle: "leaf" },
    { id: "e-frame-lava", rarity: "e", cat: "frame", icon: "🌋", name: "熔岩相框", desc: "岩缝熔岩脉动", buff: "头像框·熔岩", wear: "hud", frameStyle: "lava" },
    { id: "e-pet-dragon", rarity: "e", cat: "pet", icon: "🐉", name: "熔岩小龙", desc: "喷火星 · 尾摆动", buff: "悬停伙伴+助威", wear: "pet", petStyle: "dragon", petMotion: "hover", petBonus: 100 },
    { id: "e-helm-brave", rarity: "e", cat: "decor", icon: "🪖", name: "勇者头盔", desc: "绿箍羽饰 · 冒险感拉满", buff: "头顶勇盔", wear: "runner", part: "helmet", headStyle: "brave" },
    { id: "e-wing-mech", rarity: "e", cat: "decor", icon: "⚙️", name: "机械飞翼", desc: "齿轮驱动 · 飞行尾焰 · 与气球互斥", buff: "双翼振翅+尾焰", wear: "runner", part: "wings", wingStyle: "mech", flyMode: "wing" },
    { id: "e-jetpack", rarity: "e", cat: "decor", icon: "🚀", name: "喷气背包", desc: "背负红银双喷 · 向下喷焰推进 · 与气球互斥", buff: "背后喷气飞行", wear: "runner", part: "wings", wingStyle: "jetpack", flyMode: "wing" },
    { id: "e-glider-cloud", rarity: "e", cat: "decor", icon: "☁️", name: "云朵坐骑", desc: "坐上软云悬浮巡航 · 与气球互斥", buff: "云朵坐骑飞行", wear: "runner", part: "wings", wingStyle: "cloud", flyMode: "wing" },
    { id: "e-rocket", rarity: "e", cat: "decor", icon: "🧨", name: "火箭推进器", desc: "腰侧双筒 · 尾焰向下推进 · 与气球互斥", buff: "火箭喷气飞行", wear: "runner", part: "wings", wingStyle: "rocket", flyMode: "wing" },
    { id: "l-crown-mini", rarity: "l", cat: "decor", icon: "👑", name: "知识王冠", desc: "三尖金冠 · 蓝宝石闪光", buff: "头顶王冠微光", wear: "runner", part: "crown", headStyle: "knowledge", crownStyle: "knowledge" },
  ],
  5: [
    { id: "r-decor-pumpkin", rarity: "r", cat: "decor", icon: "🎃", name: "南瓜提灯", desc: "橙火闪烁 · 火星上飘", buff: "场景南瓜灯", wear: "scene", part: "prop", decorStyle: "pumpkin" },
    { id: "e-decor-books", rarity: "e", cat: "decor", icon: "📚", name: "魔法书堆", desc: "符文微光 · 书页轻翻", buff: "场景魔法书", wear: "scene", part: "prop", decorStyle: "books" },
    { id: "e-frame-crystal", rarity: "e", cat: "frame", icon: "💎", name: "水晶相框", desc: "冰晶棱角 · 顶镶宝石", buff: "头像框·水晶", wear: "hud", frameStyle: "crystal" },
    { id: "e-trail-shadow", rarity: "e", cat: "trail", icon: "🌑", name: "暗影烟雾", desc: "紫黑烟雾翻涌", buff: "暗影烟雾", wear: "trail", trailStyle: "shadow" },
    { id: "e-trail-gold", rarity: "e", cat: "trail", icon: "🪙", name: "金币闪光", desc: "金币辉光与星芒", buff: "金币闪光", wear: "trail", trailStyle: "gold" },
    { id: "e-trail-bubble", rarity: "e", cat: "trail", icon: "🫧", name: "泡泡环绕", desc: "透明泡泡绕身漂浮", buff: "环绕泡泡", wear: "trail", trailStyle: "bubble" },
    { id: "e-hat-wizard", rarity: "e", cat: "decor", icon: "🎩", name: "法师尖帽", desc: "紫帽红箍 · 金扣闪光", buff: "头顶法帽", wear: "runner", part: "hat", headStyle: "wizard" },
    { id: "e-wing-angel", rarity: "e", cat: "decor", icon: "🕊️", name: "天使翅膀", desc: "纯白金边 · 圣光星屑 · 与气球互斥", buff: "天使振翅飞行", wear: "runner", part: "wings", wingStyle: "angel", flyMode: "wing" },
    { id: "e-pet-ghost", rarity: "e", cat: "pet", icon: "👻", name: "迷你幽灵", desc: "半透明漂浮 · 星屑", buff: "悬停伙伴", wear: "pet", petStyle: "ghost", petMotion: "hover", petBonus: 90 },
    { id: "e-pet-alpaca", rarity: "e", cat: "pet", icon: "🦙", name: "云朵羊驼", desc: "踩云絮的绒绒伙伴", buff: "地面伙伴", wear: "pet", petStyle: "alpaca", petMotion: "ground", petBonus: 95 },
    { id: "l-pet-firefly", rarity: "l", cat: "pet", icon: "✨", name: "水晶萤火虫", desc: "腹光脉动 · 晶翼闪烁", buff: "悬停发光伙伴", wear: "pet", petStyle: "firefly", petMotion: "hover", petBonus: 140 },
    { id: "l-wing-archive", rarity: "l", cat: "decor", icon: "🪽", name: "典藏羽翼", desc: "多层白羽飞行 · 与气球互斥", buff: "双翼振翅飞行", wear: "runner", part: "wings", wingStyle: "feather", flyMode: "wing" },
    { id: "l-wing-demon", rarity: "l", cat: "decor", icon: "🦇", name: "暗夜魔翼", desc: "紫蝠膜翼滑翔 · 与气球互斥", buff: "双翼+暗影特效", wear: "runner", part: "wings", wingStyle: "demon", flyMode: "wing" },
    { id: "l-wing-butterfly", rarity: "l", cat: "decor", icon: "🦋", name: "幻彩蝶翼", desc: "虹彩渐变 · 花瓣星屑 · 与气球互斥", buff: "蝶翼飞舞", wear: "runner", part: "wings", wingStyle: "butterfly", flyMode: "wing" },
    { id: "l-ufo", rarity: "l", cat: "decor", icon: "🛸", name: "UFO飞碟", desc: "坐进碟舱悬停巡航 · 与气球互斥", buff: "飞碟坐骑飞行", wear: "runner", part: "wings", wingStyle: "ufo", flyMode: "wing" },
    { id: "l-title-lucky", rarity: "l", cat: "title", icon: "💎", name: "称号·幸运收藏家", desc: "宝箱溢彩绶带", buff: "HUD 称号", wear: "hud", titleText: "幸运收藏家" },
    { id: "l-fireworks", rarity: "l", cat: "trail", icon: "🎆", name: "烟花特效", desc: "身周绽放烟花，完美连吃更华丽", buff: "烟花绽放", wear: "settle", trailStyle: "fireworks" },
  ],
};

/** 旧存档 id → 新 id（兼容已兑换物品） */
const ITEM_ALIASES = {
  "r-frame-plain": "r-frame-wood",
  "e-frame-azure": "e-frame-vine",
  "r-frame-gold": "e-frame-lava",
  "e-title-scribe": "r-title-star",
  "l-title-archivist": "e-title-craft",
  "l-title-sovereign": "l-title-lucky",
  "c-note": "e-decor-books",
  "r-ferris": "r-decor-balloon",
  "r-emote-bow": "e-pet-owl",
};

const state = {
  tab: "home",
  cat: "all",
  bagFilter: "all",
  sort: "level",
  onlyCan: false,
  page: 0,
  selectedLevel: null,
  selectedId: null,
  pendingBuy: null,
  drawing: false,
};

function $(id) {
  return document.getElementById(id);
}

function loadWallet() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return migrateWallet({
      points: Math.max(0, Number(raw.points) || 0),
      lifetime: Math.max(0, Number(raw.lifetime) || 0),
      weekGain: Math.max(0, Number(raw.weekGain) || 0),
      inventory: raw.inventory && typeof raw.inventory === "object" ? { ...raw.inventory } : {},
      equipped: raw.equipped && typeof raw.equipped === "object" ? { ...raw.equipped } : {},
      pityBoost: Math.max(0, Number(raw.pityBoost) || 0),
      history: Array.isArray(raw.history) ? raw.history.slice(0, 40) : [],
      tasks: raw.tasks && typeof raw.tasks === "object" ? { ...raw.tasks } : { quiz: 0, play: 0, redeem: 0 },
      name: raw.name || "乐园学员",
      uid: raw.uid || "10086",
      activitySeen: !!raw.activitySeen,
    });
  } catch {
    return {
      points: 0, lifetime: 0, weekGain: 0, inventory: {}, equipped: {},
      pityBoost: 0, history: [], tasks: { quiz: 0, play: 0, redeem: 0 },
      name: "乐园学员", uid: "10086", activitySeen: false,
    };
  }
}

function saveWallet(w) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(w));
}

function toast(msg) {
  const el = $("toast");
  el.hidden = false;
  el.textContent = msg;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    el.hidden = true;
  }, 1800);
}

function burstFx(x = innerWidth / 2, y = innerHeight / 2) {
  const layer = $("fx-burst");
  if (!layer) return;
  layer.hidden = false;
  layer.innerHTML = "";
  const icons = ["⭐", "✨", "🪙", "🎉"];
  for (let i = 0; i < 12; i += 1) {
    const s = document.createElement("span");
    s.textContent = icons[i % icons.length];
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    const ang = (Math.PI * 2 * i) / 12;
    s.style.setProperty("--dx", `${Math.cos(ang) * (60 + Math.random() * 80)}px`);
    s.style.setProperty("--dy", `${Math.sin(ang) * (40 + Math.random() * 70) - 30}px`);
    layer.appendChild(s);
  }
  clearTimeout(burstFx._t);
  burstFx._t = setTimeout(() => {
    layer.hidden = true;
    layer.innerHTML = "";
  }, 950);
}

function allItems() {
  const map = new Map();
  Object.entries(POOL).forEach(([lv, list]) => {
    list.forEach((it) => map.set(it.id, { ...it, level: Number(lv) }));
  });
  return [...map.values()];
}

function findItem(id) {
  const resolved = ITEM_ALIASES[id] || id;
  return allItems().find((x) => x.id === resolved) || {
    id: resolved, name: resolved, rarity: "c", cat: "decor", icon: "⭐", desc: "", level: 1,
  };
}

/** 迁移旧物品 id，避免背包/装备指向失效 */
function migrateWallet(w) {
  const inv = { ...w.inventory };
  Object.keys(inv).forEach((id) => {
    const next = ITEM_ALIASES[id];
    if (!next || next === id) return;
    inv[next] = (inv[next] || 0) + inv[id];
    delete inv[id];
  });
  const equipped = { ...w.equipped };
  EQUIP_SLOTS.forEach((slot) => {
    const id = equipped[slot];
    if (id && ITEM_ALIASES[id]) equipped[slot] = ITEM_ALIASES[id];
  });
  return { ...w, inventory: inv, equipped };
}

function itemPrice(it) {
  const base = PRICE_BY_RARITY[it.rarity] ?? PRICE_BY_RARITY.c;
  const lv = Math.max(1, Math.min(5, Number(it.level) || 1));
  // Lv1 = 1.0×，Lv5 = 1.4×：高档货架同稀有度略贵
  return Math.round(base * (1 + (lv - 1) * 0.1));
}

function unlockedLevel(lifetime) {
  let max = 1;
  TIERS.forEach((t) => {
    if (lifetime >= t.unlock) max = t.level;
  });
  return max;
}

function playerLevel(lifetime) {
  return Math.max(1, Math.floor(lifetime / 400) + 1);
}

function nextUnlock(lifetime) {
  const next = TIERS.find((t) => t.unlock > lifetime);
  if (!next) return { level: 5, unlock: TIERS[4].unlock, pct: 100 };
  const prev = TIERS.filter((t) => t.unlock <= lifetime).pop() || TIERS[0];
  const span = Math.max(1, next.unlock - prev.unlock);
  return {
    level: next.level,
    unlock: next.unlock,
    pct: Math.min(100, ((lifetime - prev.unlock) / span) * 100),
  };
}

function poolForLevel(level) {
  const items = [];
  for (let lv = 1; lv <= level; lv += 1) {
    const boost = lv === level ? 2 : 1;
    (POOL[lv] || []).forEach((it) => {
      for (let i = 0; i < boost; i += 1) items.push({ ...it, level: lv });
    });
  }
  return items;
}

function uniquePool(level) {
  const map = new Map();
  poolForLevel(level).forEach((it) => map.set(it.id, it));
  return [...map.values()];
}

function pickWeighted(weights) {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total;
  for (const [key, w] of entries) {
    roll -= w;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function drawItem(level, pityBoost = 0) {
  const tier = TIERS.find((t) => t.level === level);
  const weights = { ...tier.weights };
  if (pityBoost > 0) weights.l = (weights.l || 0) + pityBoost;
  const rarity = pickWeighted(weights);
  const candidates = uniquePool(level).filter((it) => it.rarity === rarity);
  const list = candidates.length ? candidates : uniquePool(level);
  return list[Math.floor(Math.random() * list.length)];
}

function pushHistory(w, item, src) {
  w.history = [{ id: item.id, src, t: Date.now() }, ...(w.history || [])].slice(0, 40);
}

function showReveal(item, src) {
  $("reveal").hidden = false;
  $("reveal-ico").textContent = item.icon || "★";
  $("reveal-rarity").textContent = RARITY_LABEL[item.rarity] || "普通";
  $("reveal-rarity").style.color = RARITY_COLOR[item.rarity] || RARITY_COLOR.c;
  $("reveal-name").textContent = item.name;
  $("reveal-desc").textContent = item.desc;
  $("reveal-src").textContent = src || "";
  burstFx(innerWidth / 2, innerHeight * 0.42);
}

function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.tab === tab);
  });
  document.querySelectorAll(".panel").forEach((p) => {
    p.hidden = p.id !== `panel-${tab}`;
  });
  if (tab === "activity") {
    const w = loadWallet();
    w.activitySeen = true;
    saveWallet(w);
  }
  if (tab === "shelf" && !state.selectedId) {
    const first = filteredShelf(loadWallet())[0];
    if (first) state.selectedId = first.id;
  }
  renderAll();
}

function filteredShelf(w) {
  const maxLv = unlockedLevel(w.lifetime);
  let items = allItems().filter((it) => it.level <= maxLv);
  if (state.cat !== "all") items = items.filter((it) => it.cat === state.cat);
  if (state.onlyCan) items = items.filter((it) => w.points >= itemPrice(it));
  const rank = { c: 0, r: 1, e: 2, l: 3 };
  items.sort((a, b) => {
    if (state.sort === "price") return itemPrice(a) - itemPrice(b);
    if (state.sort === "rarity") return rank[b.rarity] - rank[a.rarity];
    return a.level - b.level || rank[a.rarity] - rank[b.rarity];
  });
  return items;
}

function renderHeader(w) {
  const pts = $("points-now");
  const prevPts = pts.textContent;
  const nextPts = String(w.points);
  pts.textContent = nextPts;
  if (prevPts && prevPts !== nextPts) {
    pts.classList.remove("pulse");
    void pts.offsetWidth;
    pts.classList.add("pulse");
  }
  $("lifetime-hint").textContent = String(w.lifetime);
  $("profile-name").textContent = w.name;
  $("profile-id").textContent = w.uid;
  const lv = playerLevel(w.lifetime);
  $("profile-lv").textContent = `Lv.${lv}`;
  const maxLv = unlockedLevel(w.lifetime);
  const unlock = nextUnlock(w.lifetime);
  $("unlock-label").textContent =
    maxLv >= 5 ? `兑换等级 MAX · 角色 Lv.${lv}` : `兑换 ${maxLv} 级 · 距 ${unlock.level} 级`;
  $("unlock-fill").style.width = `${maxLv >= 5 ? 100 : unlock.pct}%`;

  const load = buildLoadout(w);
  const avatar = $("profile-avatar");
  avatar.textContent = load.frame?.icon || "🧒";
  avatar.dataset.frame = load.frame?.frameStyle || "";
  const titleEl = $("profile-title");
  if (titleEl) {
    titleEl.hidden = !load.title;
    titleEl.textContent = load.title ? `${load.title.icon} ${load.title.titleText || load.title.name}` : "";
  }
  const petEl = $("profile-pet");
  if (petEl) {
    petEl.hidden = !load.pet;
    petEl.textContent = load.pet?.icon || "";
  }

  const actDot = $("act-dot");
  if (actDot) actDot.hidden = !!w.activitySeen;
}

function loadoutFromSlots(slots, extra = {}) {
  const decor = slots.decor;
  const part = decor?.part || null;
  const pet = slots.pet;
  const headParts = ["crown", "helmet", "goggles", "hat"];
  const chestParts = ["luck", "necklace", "pendant"];
  return {
    name: extra.name || "乐园学员",
    uid: extra.uid || "10086",
    points: extra.points || 0,
    lifetime: extra.lifetime || 0,
    slots,
    frame: slots.frame,
    title: slots.title,
    pet,
    trail: slots.trail,
    decor,
    parts: {
      cape: part === "cape",
      crown: part === "crown",
      helmet: part === "helmet",
      goggles: part === "goggles",
      hat: part === "hat",
      wings: part === "wings",
      sticker: part === "sticker",
      badge: part === "badge",
      coinCopper: part === "coinCopper",
      balloon: part === "balloon",
      banner: part === "banner",
      luck: part === "luck",
      necklace: part === "necklace",
      pendant: part === "pendant",
      prop: part === "prop",
    },
    wingStyle: part === "wings" ? (decor?.wingStyle || "feather") : null,
    capeStyle: part === "cape" ? (decor?.capeStyle || "scholar") : null,
    crownStyle: part === "crown" ? (decor?.crownStyle || decor?.headStyle || "knowledge") : null,
    headStyle: headParts.includes(part)
      ? (decor?.headStyle || decor?.crownStyle || part)
      : null,
    chestStyle: chestParts.includes(part)
      ? (decor?.chestStyle || (part === "luck" ? "clover" : part))
      : null,
    decorStyle: decor?.decorStyle || null,
    flightMode: part === "wings" ? "wing" : part === "balloon" ? "balloon" : null,
    canFly: part === "wings" || part === "balloon",
    trailStyle: slots.trail?.trailStyle || null,
    petStyle: pet?.petStyle || null,
    petMotion: pet?.petMotion || (pet ? "ground" : null),
    petBonus: Number(pet?.petBonus) || 0,
    trying: extra.trying || null,
  };
}

function buildLoadout(w) {
  const slots = {};
  EQUIP_SLOTS.forEach((slot) => {
    const id = w.equipped[slot];
    slots[slot] = id ? findItem(id) : null;
  });
  return loadoutFromSlots(slots, {
    name: w.name, uid: w.uid, points: w.points, lifetime: w.lifetime,
  });
}

/** 背包装扮台：已装备为实装；选中可装备类物品叠加为试装（含未拥有预览） */
function buildTryOnLoadout(w) {
  const slots = {};
  EQUIP_SLOTS.forEach((slot) => {
    const id = w.equipped[slot];
    slots[slot] = id ? findItem(id) : null;
  });
  const tryIt = state.selectedId ? findItem(state.selectedId) : null;
  let trying = null;
  if (tryIt && EQUIP_SLOTS.includes(tryIt.cat)) {
    slots[tryIt.cat] = tryIt;
    trying = tryIt;
  }
  return loadoutFromSlots(slots, {
    name: w.name, uid: w.uid, points: w.points, lifetime: w.lifetime, trying,
  });
}

/** 供冲刺 / 大厅读取当前实装装扮 */
export function getEquippedLoadout() {
  return buildLoadout(loadWallet());
}

export { loadWallet, findItem, STORAGE_KEY };
export { resolveEquipFx, poseLabelsForLoad } from "/castle/equip-fx.js?v=4";

function renderPreview(w) {
  const it = state.selectedId ? findItem(state.selectedId) : null;
  const action = $("preview-action");
  if (!it) {
    $("preview-ico").textContent = "⭐";
    $("preview-name").textContent = "选择一件商品";
    $("preview-desc").textContent = "点击货架或背包中的物品查看详情";
    $("preview-meta").innerHTML = "";
    $("preview-price").textContent = "—";
    const stage = $("preview-stage");
    if (stage) {
      delete stage.dataset.rarity;
      delete stage.dataset.cat;
      delete stage.dataset.style;
    }
    action.disabled = true;
    action.textContent = "立即兑换";
    action.className = "btn-go";
    return;
  }

  const owned = w.inventory[it.id] || 0;
  const price = itemPrice(it);
  const maxLv = unlockedLevel(w.lifetime);
  const unlocked = it.level <= maxLv;
  const equipped = w.equipped[it.cat] === it.id;

  $("preview-ico").textContent = it.icon || "⭐";
  $("preview-name").textContent = it.name;
  $("preview-desc").textContent =
    (it.desc || "") +
    (it.buff ? ` · ${it.buff}` : "") +
    (it.wear ? ` · 实装：${({
      runner: "冲刺角色",
      trail: "奔跑拖尾",
      pet: "跟随伙伴",
      hud: "头像/称号",
      scene: "乐园场景",
      coin: "金币外观",
      settle: "结算特效",
      gacha: "盲盒幸运",
    })[it.wear] || it.wear}` : "");
  const stage = $("preview-stage");
  if (stage) {
    stage.dataset.rarity = it.rarity;
    stage.dataset.cat = it.cat || "";
    stage.dataset.style = it.frameStyle || it.trailStyle || it.petStyle || it.decorStyle || it.wingStyle || it.headStyle || it.chestStyle || it.part || "";
  }
  // 同步试装到背包装扮台（切到背包即可看全身效果）
  renderMannequin(w);
  $("preview-meta").innerHTML = `
    <div><dt>稀有度</dt><dd style="color:${RARITY_COLOR[it.rarity]}">${RARITY_LABEL[it.rarity]}</dd></div>
    <div><dt>类型</dt><dd>${CAT_LABEL[it.cat] || it.cat}</dd></div>
    <div><dt>需求</dt><dd>兑换 Lv.${it.level}+</dd></div>
    <div><dt>拥有</dt><dd>×${owned}</dd></div>`;
  $("preview-price").textContent = unlocked ? String(price) : "未解锁";

  action.className = "btn-go";
  if (state.tab === "bag" && owned > 0 && EQUIP_SLOTS.includes(it.cat)) {
    action.disabled = false;
    if (equipped) {
      action.textContent = "卸下";
      action.className = "btn-go unequip";
      action.onclick = () => unequipItem(it.id);
    } else {
      action.textContent = "装备";
      action.className = "btn-go equip";
      action.onclick = () => equipItem(it.id);
    }
  } else {
    action.onclick = () => openBuy(it.id);
    action.disabled = !unlocked || w.points < price;
    action.textContent = !unlocked ? "等级未解锁" : w.points < price ? "积分不足" : "立即兑换";
  }
}

function renderGoodsCard(it, w, opts = {}) {
  const price = itemPrice(it);
  const owned = w.inventory[it.id] || 0;
  const can = w.points >= price;
  const sel = state.selectedId === it.id ? " is-sel" : "";
  const equipped = w.equipped[it.cat] === it.id;
  return `
    <button type="button" class="goods${sel}" data-id="${it.id}" ${opts.disableBuy && !can ? "disabled" : ""}>
      <span class="tag ${it.rarity}">${RARITY_LABEL[it.rarity]}</span>
      <div class="ico">${it.icon || "⭐"}</div>
      <strong>${it.name}</strong>
      <p class="desc">${it.desc}</p>
      <div class="row">
        <span class="price">${price}</span>
        <span class="owned">${owned > 0 ? `已有×${owned}` : `Lv.${it.level}+`}</span>
      </div>
      ${opts.bag ? `<div class="act${equipped ? " on" : ""}">${equipped ? "已装备" : "可使用"}</div>` : ""}
    </button>`;
}

function renderHome(w) {
  const load = buildLoadout(w);
  const mapArt = document.querySelector(".park-map .map-art");
  if (mapArt) {
    mapArt.dataset.banner = load.parts.banner ? "1" : "";
    mapArt.dataset.prop = load.decorStyle || "";
  }
  const featured = filteredShelf(w).slice(0, 4);
  $("featured-row").innerHTML = featured.map((it) => renderGoodsCard(it, w)).join("");
  $("featured-row").querySelectorAll(".goods").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.id;
      switchTab("shelf");
    });
  });
}

function renderMannequin(w) {
  const stage = $("loadout-stage");
  if (!stage) return;
  const load = buildTryOnLoadout(w);
  const hero = $("mn-hero");
  let pose = hero?.dataset.pose || "idle";
  const labels = poseLabelsForLoad(load);
  if (!labels.canFly && pose === "fly") {
    pose = "idle";
    if (hero) hero.dataset.pose = "idle";
  }
  const fx = resolveEquipFx(load, { pose });

  const setVis = (id, on) => {
    const el = $(id);
    if (!el) return;
    el.hidden = !on;
  };
  const setGear = (id, icon, on) => {
    const el = $(id);
    if (!el) return;
    el.hidden = !on;
    if (on && icon != null) el.textContent = icon;
  };
  const scene = $("mannequin");
  if (scene) {
    scene.dataset.frame = load.frame?.frameStyle || "";
    scene.dataset.trail = load.trailStyle || "";
    scene.dataset.trying = load.trying ? "1" : "";
    scene.dataset.flight = fx.flightMode || "";
  }
  const tryBadge = $("mn-try-badge");
  if (tryBadge) {
    tryBadge.hidden = !load.trying;
    tryBadge.textContent = load.trying ? `试装·${load.trying.name.replace(/^称号·/, "")}` : "";
  }

  const wingStyle = fx.wingStyle || "feather";
  const pairWings = ["feather", "angel", "mech", "demon", "butterfly"];
  const showWingPair = !!(load.parts.wings && pairWings.includes(wingStyle));
  const showFlightProp = !!(load.parts.wings && !showWingPair);
  const hasHead = !!(load.headStyle);
  const hasChest = !!(load.chestStyle);
  if (hero) {
    hero.dataset.gear = [
      load.parts.wings && "wings",
      load.parts.cape && "cape",
      hasHead && "head",
      hasChest && "chest",
      load.parts.balloon && "balloon",
    ].filter(Boolean).join(" ");
    hero.dataset.wing = load.parts.wings ? wingStyle : "";
    hero.dataset.head = load.headStyle || "";
    hero.dataset.chest = load.chestStyle || "";
    hero.dataset.flight = fx.flightMode || "";
    hero.dataset.flightKind = fx.flightKind || "";
    hero.dataset.pose = pose;
    hero.dataset.motion = fx.flying ? "fly" : "idle";
    hero.dataset.floaty = fx.floaty ? "1" : "";
    hero.dataset.sit = fx.sitPose ? "1" : "";
  }

  // 姿态按钮：无飞行装时禁用「飞行」
  document.querySelectorAll(".pose-btn").forEach((btn) => {
    const isFly = btn.dataset.pose === "fly";
    btn.disabled = isFly && !fx.canFly;
    btn.classList.toggle("is-on", btn.dataset.pose === pose);
    if (btn.dataset.pose === "idle") btn.textContent = labels.idle;
    if (isFly) btn.textContent = labels.fly || "飞行";
  });

  ["mn-wing-l", "mn-wing-r"].forEach((id) => {
    const el = $(id);
    if (!el) return;
    el.hidden = !showWingPair;
    el.dataset.style = wingStyle;
    el.dataset.motion = fx.flying ? "fly" : "idle";
  });

  const flightProp = $("mn-flight");
  if (flightProp) {
    flightProp.hidden = !showFlightProp;
    flightProp.dataset.style = showFlightProp ? wingStyle : "";
    flightProp.dataset.motion = fx.flying ? "fly" : "idle";
  }
  const flightFront = $("mn-flight-front");
  if (flightFront) {
    const showUfoFront = showFlightProp && wingStyle === "ufo";
    flightFront.hidden = !showUfoFront;
    flightFront.dataset.style = showUfoFront ? "ufo" : "";
    flightFront.dataset.motion = fx.flying ? "fly" : "idle";
  }

  // 翅膀飞行特效 vs 气球浮空特效
  setVis("mn-jet", fx.flying && fx.flightFx === "jet");
  setVis("mn-stars", fx.flying && fx.flightFx === "sparkle");
  setVis("mn-shadow-fx", fx.flying && fx.flightFx === "shadow");
  setVis("mn-confetti", fx.flying && fx.flightFx === "confetti");

  setVis("mn-cape", load.parts.cape);
  const cape = $("mn-cape");
  if (cape) cape.dataset.wind = String(fx.capeWind > 1.2 ? "high" : fx.capeWind < 0.8 ? "low" : "mid");

  const crown = $("mn-crown");
  if (crown) {
    crown.hidden = !hasHead;
    crown.dataset.style = load.headStyle || "";
  }
  setVis("mn-badge", load.parts.badge);
  const clover = $("mn-clover");
  if (clover) {
    clover.hidden = !hasChest;
    clover.dataset.style = load.chestStyle || "";
  }
  setGear("mn-sticker", "🐶", load.parts.sticker);

  const balloon = $("mn-balloon");
  if (balloon) {
    balloon.hidden = !load.parts.balloon;
    balloon.dataset.motion = fx.flying ? "fly" : "idle";
    balloon.dataset.attach = load.decor?.attach || "hand";
  }

  const handParts = ["coinCopper"];
  const isHand = load.decor && handParts.includes(load.decor.part);
  setGear("mn-hand", load.decor?.icon || "", isHand);

  const propStyle = (load.parts.prop || load.parts.banner) ? (load.decorStyle || "banner") : "";
  const prop = $("mn-prop");
  if (prop) {
    prop.hidden = !propStyle;
    prop.dataset.style = propStyle || "";
    prop.textContent = "";
  }
  setVis("mn-banner", false);

  const title = $("mn-title");
  if (title) {
    title.hidden = !load.title;
    title.dataset.style = load.title ? "on" : "";
    title.textContent = load.title
      ? `${load.title.icon} ${load.title.titleText || load.title.name}`
      : "";
  }

  const pet = $("mn-pet");
  if (pet) {
    const hasPet = !!load.pet;
    pet.hidden = !hasPet;
    if (hasPet) {
      pet.dataset.style = load.petStyle || "slime";
      // 浮空飞行时地面宠也略抬；悬停宠跟飞
      const motion = fx.flying && load.petMotion === "ground" ? "lift" : (load.petMotion || "ground");
      pet.dataset.motion = motion;
      pet.textContent = load.pet.icon || "";
    }
  }

  const trail = $("mn-trail");
  if (trail) {
    const showTrail = !!load.trail;
    trail.hidden = !showTrail;
    trail.dataset.style = load.trailStyle || "";
    trail.dataset.orbit = fx.trailOrbit ? "1" : "";
    trail.dataset.bloom = fx.trailBloom ? "1" : "";
    trail.dataset.motion = fx.flying ? "fly" : "idle";
  }

  const slots = $("terra-slots");
  if (slots) {
    const rows = [
      { key: "frame", label: "头像框", item: load.frame },
      { key: "title", label: "称号", item: load.title },
      { key: "trail", label: "特效", item: load.trail },
      { key: "pet", label: "伙伴", item: load.pet },
      { key: "decor", label: "装饰", item: load.decor },
    ];
    slots.innerHTML = rows
      .map((r) => {
        const trying = load.trying?.cat === r.key;
        return `<div class="slot${r.item ? " is-on" : ""}${trying ? " is-try" : ""}" title="${r.item?.name || r.label}">
        <b class="slot-ico">${r.item?.icon || "·"}</b>
        <span>${r.label}</span>
        <em>${r.item ? r.item.name.replace(/^称号·/, "") : "空"}</em>
      </div>`;
      })
      .join("");
  }

  const hint = $("loadout-hint");
  if (hint) {
    if (load.trying) {
      const tryFx = resolveEquipFx(
        loadoutFromSlots({ ...load.slots, [load.trying.cat]: load.trying }),
        { pose },
      );
      const flyHint = tryFx.canFly
        ? ` · 可预览「${tryFx.flyLabel}」`
        : "";
      hint.textContent = `试装中：${load.trying.name}${flyHint}（装备后局内实装）`;
    } else if (fx.canFly) {
      hint.textContent = `实装飞行源：${fx.flyLabel} · 静态=${fx.idleLabel} / 动态=${fx.flyLabel}`;
    } else {
      const bits = [];
      if (load.pet) bits.push(load.pet.name);
      if (load.trail) bits.push(load.trail.name);
      if (load.frame) bits.push(load.frame.name);
      if (load.decor) bits.push(load.decor.name);
      hint.textContent = bits.length
        ? `实装中：${bits.join(" · ")}（装备翅膀或气球可解锁飞行预览）`
        : "选中物品试装；装备翅膀=振翅飞行，气球=浮空飞行";
    }
  }
}

function renderCats() {
  $("cats").innerHTML = CATS.map(
    (c) => `<button type="button" class="cat-btn${state.cat === c.id ? " is-on" : ""}" data-cat="${c.id}">${c.name}</button>`,
  ).join("");
  $("cats").querySelectorAll(".cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.cat = btn.dataset.cat;
      state.page = 0;
      renderAll();
    });
  });
}

function renderShelf(w) {
  renderCats();
  const items = filteredShelf(w);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  if (state.page >= pages) state.page = pages - 1;
  const slice = items.slice(state.page * PAGE_SIZE, state.page * PAGE_SIZE + PAGE_SIZE);
  $("shelf-empty").hidden = slice.length > 0;
  $("shelf-grid").innerHTML = slice.map((it) => renderGoodsCard(it, w)).join("");
  $("shelf-grid").querySelectorAll(".goods").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.id;
      renderAll();
    });
    btn.addEventListener("dblclick", () => openBuy(btn.dataset.id));
  });

  let pager = "";
  if (pages > 1) {
    pager += `<button type="button" data-p="${state.page - 1}" ${state.page <= 0 ? "disabled" : ""}>‹</button>`;
    for (let i = 0; i < pages; i += 1) {
      pager += `<button type="button" class="${i === state.page ? "is-on" : ""}" data-p="${i}">${i + 1}</button>`;
    }
    pager += `<button type="button" data-p="${state.page + 1}" ${state.page >= pages - 1 ? "disabled" : ""}>›</button>`;
  }
  $("shelf-pager").innerHTML = pager;
  $("shelf-pager").querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = Number(btn.dataset.p);
      if (Number.isNaN(p) || p < 0) return;
      state.page = p;
      renderAll();
    });
  });
}

function renderGacha(w) {
  const maxLv = unlockedLevel(w.lifetime);
  if (state.selectedLevel == null || state.selectedLevel > maxLv) state.selectedLevel = maxLv;
  const level = state.selectedLevel;
  const tier = TIERS.find((t) => t.level === level);

  $("chest-row").innerHTML = TIERS.map((t) => {
    const open = w.lifetime >= t.unlock;
    return `
      <button type="button" class="chest${level === t.level ? " is-on" : ""}" data-lv="${t.level}" ${open ? "" : "disabled"}>
        <span class="box">${t.box}</span>
        <span class="lv">LV ${t.level}</span>
        <span class="need">${open ? t.blurb : `累计 ${t.unlock}`}</span>
        <span class="cost">抽一次 ${t.cost}</span>
      </button>`;
  }).join("");
  $("chest-row").querySelectorAll(".chest").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedLevel = Number(btn.dataset.lv);
      renderAll();
    });
  });

  const pity = w.pityBoost || 0;
  $("tier-title").textContent = `${tier.level} 级盲盒 · ${tier.blurb}`;
  $("tier-sub").textContent =
    w.lifetime >= tier.unlock
      ? `消耗 ${tier.cost} 积分${pity ? ` · 幸运加成传说 +${pity}` : ""}`
      : `需累计 ${tier.unlock}`;

  const order = ["c", "r", "e", "l"];
  const total = order.reduce((s, k) => s + (tier.weights[k] || 0), 0) || 1;
  $("odds").innerHTML = order
    .map((k) => {
      const pct = (((tier.weights[k] || 0) / total) * 100).toFixed(0);
      return `<div class="odd ${k}"><b>${pct}%</b><span>${RARITY_LABEL[k]}</span></div>`;
    })
    .join("");

  $("pool").innerHTML = uniquePool(level)
    .sort((a, b) => ({ c: 0, r: 1, e: 2, l: 3 }[a.rarity] - { c: 0, r: 1, e: 2, l: 3 }[b.rarity]))
    .map(
      (it) => `
      <button type="button" class="pool-item" data-id="${it.id}">
        <span class="tag ${it.rarity}">${RARITY_LABEL[it.rarity]}</span>
        <span>${it.icon || ""}</span>
        <strong>${it.name}</strong>
      </button>`,
    )
    .join("");
  $("pool").querySelectorAll(".pool-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.id;
      renderPreview(loadWallet());
    });
  });

  const can = w.lifetime >= tier.unlock && w.points >= tier.cost && !state.drawing;
  const btn = $("draw-btn");
  btn.disabled = !can;
  btn.textContent = can
    ? `立即抽取（-${tier.cost}）`
    : w.points < tier.cost
      ? `积分不足（需 ${tier.cost}）`
      : "等级未解锁";
  $("draw-msg").textContent = "";
}

function renderBag(w) {
  const filters = [
    { id: "all", name: "全部" },
    { id: "equipped", name: "已装备" },
    { id: "frame", name: "头像框" },
    { id: "title", name: "称号" },
    { id: "pet", name: "伙伴" },
    { id: "trail", name: "特效" },
    { id: "decor", name: "装饰" },
  ];
  $("bag-filters").innerHTML = filters
    .map((f) => `<button type="button" class="cat-btn${state.bagFilter === f.id ? " is-on" : ""}" data-f="${f.id}">${f.name}</button>`)
    .join("");
  $("bag-filters").querySelectorAll(".cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.bagFilter = btn.dataset.f;
      renderAll();
    });
  });

  let entries = Object.entries(w.inventory).filter(([, n]) => n > 0);
  if (state.bagFilter === "equipped") {
    const eq = new Set(Object.values(w.equipped).filter(Boolean));
    entries = entries.filter(([id]) => eq.has(id));
  } else if (state.bagFilter !== "all") {
    entries = entries.filter(([id]) => findItem(id).cat === state.bagFilter);
  }

  const totalOwned = Object.values(w.inventory).reduce((s, n) => s + (n > 0 ? 1 : 0), 0);
  const equippedCount = Object.values(w.equipped).filter(Boolean).length;
  const catalog = allItems().length;
  const pct = catalog ? Math.round((totalOwned / catalog) * 100) : 0;
  $("bag-stats").textContent = `拥有 ${totalOwned} · 已装备 ${equippedCount} · 收集 ${pct}%`;
  $("collect-fill").style.width = `${pct}%`;
  $("codex-text").textContent = `${totalOwned} / ${catalog}`;
  renderMannequin(w);

  $("inv-empty").hidden = entries.length > 0;
  $("inventory").innerHTML = entries
    .map(([id]) => renderGoodsCard(findItem(id), w, { bag: true }))
    .join("");
  $("inventory").querySelectorAll(".goods").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.id;
      renderAll();
    });
  });

  const recent = (w.history || []).slice(0, 4);
  $("recent-list").innerHTML = recent.length
    ? recent
        .map((h) => {
          const it = findItem(h.id);
          const mins = Math.max(0, Math.round((Date.now() - h.t) / 60000));
          return `<li>${it.icon} ${it.name} · ${mins} 分钟前</li>`;
        })
        .join("")
    : "<li>暂无记录</li>";
}

function renderRules() {
  $("rules-tiers").innerHTML = TIERS.map(
    (t) => `<div><b>Lv.${t.level} ${t.blurb}</b><br/>累计 ${t.unlock} · 抽一次 ${t.cost}</div>`,
  ).join("");
}

function renderActivity(w) {
  const tasks = [
    { key: "quiz", label: "完成 3 次知识门答对", need: 3, cur: w.tasks.quiz || 0, href: "/parkour/" },
    { key: "play", label: "参与 1 次冲刺玩法", need: 1, cur: w.tasks.play || 0, href: "/parkour/" },
    { key: "redeem", label: "兑换 1 件商品", need: 1, cur: w.tasks.redeem || 0, href: null },
  ];
  $("task-list").innerHTML = tasks
    .map((t) => {
      const done = t.cur >= t.need;
      return `<li>
        <div><strong>${t.label}</strong><br/><span>${Math.min(t.cur, t.need)}/${t.need}${done ? " ✓" : ""}</span></div>
        ${done ? "<span>已完成</span>" : t.href ? `<a class="go" href="${t.href}">去完成</a>` : `<button type="button" class="go" data-tab="shelf">去兑换</button>`}
      </li>`;
    })
    .join("");
  $("task-list").querySelectorAll("button.go").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  const week = w.weekGain || 0;
  $("week-fill").style.width = `${Math.min(100, (week / 5000) * 100)}%`;
  $("week-text").textContent = `${week} / 5000`;
  $("week-chests").innerHTML = WEEK_MILESTONES.map(
    (m) => `<span class="${week >= m ? "done" : ""}">${week >= m ? "🎁" : "🔒"} ${m}</span>`,
  ).join("");
}

function openBuy(id) {
  const w = loadWallet();
  const it = findItem(id);
  const maxLv = unlockedLevel(w.lifetime);
  if (it.level > maxLv) {
    toast("尚未解锁该商品等级");
    return;
  }
  const price = itemPrice(it);
  if (w.points < price) {
    toast("积分不足");
    return;
  }
  state.pendingBuy = it;
  state.selectedId = it.id;
  $("buy-ico").textContent = it.icon || "⭐";
  $("buy-title").textContent = it.name;
  $("buy-desc").textContent = `${it.desc} · ${RARITY_LABEL[it.rarity]}`;
  $("buy-cost").textContent = String(price);
  $("buy-modal").hidden = false;
}

function confirmBuy() {
  const it = state.pendingBuy;
  if (!it) return;
  const w = loadWallet();
  const price = itemPrice(it);
  if (w.points < price) {
    toast("积分不足");
    $("buy-modal").hidden = true;
    return;
  }
  w.points -= price;
  w.inventory[it.id] = (w.inventory[it.id] || 0) + 1;
  w.tasks.redeem = (w.tasks.redeem || 0) + 1;
  if (it.id === "l-charm-luck") w.pityBoost = (w.pityBoost || 0) + 8;
  pushHistory(w, it, "货架兑换");
  saveWallet(w);
  $("buy-modal").hidden = true;
  state.pendingBuy = null;
  showReveal(it, "来自货架兑换");
  toast(`兑换成功 · -${price}`);
  renderAll();
}

function equipItem(id) {
  const w = loadWallet();
  const it = findItem(id);
  if (!(w.inventory[id] > 0)) return;
  if (!EQUIP_SLOTS.includes(it.cat)) {
    toast("该物品不可装备");
    return;
  }
  w.equipped[it.cat] = id;
  saveWallet(w);
  toast(`已装备 · ${it.name}`);
  renderAll();
}

function unequipItem(id) {
  const w = loadWallet();
  const it = findItem(id);
  if (w.equipped[it.cat] === id) {
    delete w.equipped[it.cat];
    saveWallet(w);
    toast(`已卸下 · ${it.name}`);
  }
  renderAll();
}

function doDraw() {
  if (state.drawing) return;
  const w = loadWallet();
  const maxLv = unlockedLevel(w.lifetime);
  const level = Math.min(state.selectedLevel || maxLv, maxLv);
  const tier = TIERS.find((t) => t.level === level);
  if (!tier || w.lifetime < tier.unlock) {
    toast("该等级尚未解锁");
    return;
  }
  if (w.points < tier.cost) {
    toast("积分不足");
    return;
  }
  state.drawing = true;
  const pity = w.pityBoost || 0;
  w.points -= tier.cost;
  const item = drawItem(tier.level, pity);
  if (pity > 0) w.pityBoost = 0;
  w.inventory[item.id] = (w.inventory[item.id] || 0) + 1;
  if (item.id === "l-charm-luck") w.pityBoost = (w.pityBoost || 0) + 8;
  pushHistory(w, item, `${tier.level}级盲盒`);
  saveWallet(w);
  state.selectedId = item.id;
  showReveal(item, pity > 0 ? `来自 ${tier.level} 级盲盒 · 幸运加成已消耗` : `来自 ${tier.level} 级盲盒`);
  toast(`盲盒开启 · -${tier.cost}`);
  state.drawing = false;
  renderAll();
}

function renderAll() {
  const w = loadWallet();
  renderHeader(w);
  if (state.tab === "home") renderHome(w);
  if (state.tab === "shelf") renderShelf(w);
  if (state.tab === "gacha") renderGacha(w);
  if (state.tab === "bag") renderBag(w);
  if (state.tab === "rules") renderRules();
  if (state.tab === "activity") renderActivity(w);
  renderPreview(w);
}

export function addCastlePoints(n) {
  const w = loadWallet();
  const gain = Math.max(0, Math.floor(n));
  w.points += gain;
  w.lifetime += gain;
  w.weekGain = (w.weekGain || 0) + gain;
  w.tasks.play = Math.max(w.tasks.play || 0, 1);
  if (gain >= 40) w.tasks.quiz = (w.tasks.quiz || 0) + 1;
  saveWallet(w);
  return w;
}

/** 仅在商城页面挂载 UI（被冲刺/大厅 import 时不执行） */
if ($("points-now") && document.querySelector(".side-nav")) {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  document.querySelectorAll(".map-pin").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.go));
  });

  $("demo-add")?.addEventListener("click", () => {
    addCastlePoints(800);
    toast("已获得 800 体验积分");
    burstFx();
    renderAll();
  });
  $("sort-by")?.addEventListener("change", (e) => {
    state.sort = e.target.value;
    state.page = 0;
    renderAll();
  });
  $("only-can")?.addEventListener("change", (e) => {
    state.onlyCan = e.target.checked;
    state.page = 0;
    renderAll();
  });
  $("draw-btn")?.addEventListener("click", doDraw);
  $("reveal-close")?.addEventListener("click", () => {
    $("reveal").hidden = true;
  });
  $("buy-cancel")?.addEventListener("click", () => {
    $("buy-modal").hidden = true;
    state.pendingBuy = null;
  });
  $("buy-ok")?.addEventListener("click", confirmBuy);
  $("buy-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "buy-modal") {
      $("buy-modal").hidden = true;
      state.pendingBuy = null;
    }
  });

  document.querySelectorAll(".pose-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const hero = $("mn-hero");
      if (!hero || btn.disabled) return;
      hero.dataset.pose = btn.dataset.pose || "idle";
      renderMannequin(loadWallet());
    });
  });

  renderAll();
}
