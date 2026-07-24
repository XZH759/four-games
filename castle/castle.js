/**
 * 知识城堡 · 积分兑换区
 * 累计积分解锁 1–5 级；等级越高奖池越精致，高稀有权重越大
 */

const STORAGE_KEY = "ailit_castle_wallet_v1";

const RARITY_LABEL = {
  c: "普通",
  r: "精良",
  e: "史诗",
  l: "传说",
};

/** 等级门槛（累计获得积分）+ 单次消耗 + 稀有度权重 */
const TIERS = [
  {
    level: 1,
    unlock: 0,
    cost: 50,
    weights: { c: 70, r: 25, e: 5, l: 0 },
    blurb: "入门补给",
  },
  {
    level: 2,
    unlock: 500,
    cost: 100,
    weights: { c: 50, r: 35, e: 14, l: 1 },
    blurb: "见习藏品",
  },
  {
    level: 3,
    unlock: 1500,
    cost: 200,
    weights: { c: 35, r: 40, e: 20, l: 5 },
    blurb: "学者珍藏",
  },
  {
    level: 4,
    unlock: 4000,
    cost: 400,
    weights: { c: 20, r: 40, e: 30, l: 10 },
    blurb: "城堡宝库",
  },
  {
    level: 5,
    unlock: 8000,
    cost: 800,
    weights: { c: 10, r: 30, e: 40, l: 20 },
    blurb: "至高圣物",
  },
];

/** 按等级划分奖池：上级物品更精致，且仅出现在该级及以上 */
const POOL = {
  1: [
    { id: "c-sticker", rarity: "c", name: "像素贴纸", desc: "小小纪念贴画" },
    { id: "c-badge", rarity: "c", name: "新手徽章", desc: "入园纪念章" },
    { id: "r-frame-plain", rarity: "r", name: "木纹相框", desc: "朴素头像框" },
    { id: "e-title-scribe", rarity: "e", name: "称号·见习书记", desc: "昵称前缀" },
  ],
  2: [
    { id: "c-coin-skin", rarity: "c", name: "铜币皮肤", desc: "金币外观·铜色" },
    { id: "r-trail-dust", rarity: "r", name: "星尘拖尾", desc: "奔跑微光特效" },
    { id: "e-frame-azure", rarity: "e", name: "蔚蓝雕花框", desc: "精致头像框" },
    { id: "l-charm-luck", rarity: "l", name: "幸运符·微光", desc: "下次抽取保底+1 权重" },
  ],
  3: [
    { id: "c-note", rarity: "c", name: "羊皮笔记", desc: "收藏页装饰" },
    { id: "r-emote-bow", rarity: "r", name: "表情·鞠躬", desc: "结算表情" },
    { id: "e-cape-scholar", rarity: "e", name: "学者披风", desc: "角色披风部件" },
    { id: "l-title-archivist", rarity: "l", name: "称号·典籍守护", desc: "稀有称号" },
  ],
  4: [
    { id: "r-frame-gold", rarity: "r", name: "鎏金回廊框", desc: "华丽头像框" },
    { id: "e-trail-aurora", rarity: "e", name: "极光轨迹", desc: "高级冲刺特效" },
    { id: "e-pet-owl", rarity: "e", name: "知识猫头鹰", desc: "跟随宠物·精致立绘" },
    { id: "l-crown-mini", rarity: "l", name: "迷你知识冠", desc: "头饰部件" },
  ],
  5: [
    { id: "r-banner", rarity: "r", name: "城堡旗帜", desc: "主页横幅装饰" },
    { id: "e-frame-crystal", rarity: "e", name: "水晶圣堂框", desc: "顶级头像框" },
    { id: "l-wing-archive", rarity: "l", name: "典藏之翼", desc: "背饰·最高精致度" },
    { id: "l-title-sovereign", rarity: "l", name: "称号·知识君主", desc: "殿堂级称号" },
  ],
};

const els = {
  points: document.getElementById("points-now"),
  lifetime: document.getElementById("lifetime-hint"),
  tiers: document.getElementById("tiers"),
  tierTitle: document.getElementById("tier-title"),
  tierSub: document.getElementById("tier-sub"),
  odds: document.getElementById("odds"),
  pool: document.getElementById("pool"),
  drawBtn: document.getElementById("draw-btn"),
  drawMsg: document.getElementById("draw-msg"),
  inventory: document.getElementById("inventory"),
  invEmpty: document.getElementById("inv-empty"),
  demoAdd: document.getElementById("demo-add"),
  toast: document.getElementById("toast"),
  reveal: document.getElementById("reveal"),
  revealRarity: document.getElementById("reveal-rarity"),
  revealName: document.getElementById("reveal-name"),
  revealDesc: document.getElementById("reveal-desc"),
  revealClose: document.getElementById("reveal-close"),
};

let selectedLevel = null;

function loadWallet() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      points: Math.max(0, Number(raw.points) || 0),
      lifetime: Math.max(0, Number(raw.lifetime) || 0),
      inventory: raw.inventory && typeof raw.inventory === "object" ? raw.inventory : {},
    };
  } catch {
    return { points: 0, lifetime: 0, inventory: {} };
  }
}

function saveWallet(w) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(w));
}

function toast(msg) {
  els.toast.hidden = false;
  els.toast.textContent = msg;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    els.toast.hidden = true;
  }, 1800);
}

function poolForLevel(level) {
  const items = [];
  for (let lv = 1; lv <= level; lv += 1) {
    // 高等级：本级物品权重更高（更精致的本级池）
    const boost = lv === level ? 2 : 1;
    (POOL[lv] || []).forEach((it) => {
      for (let i = 0; i < boost; i += 1) items.push(it);
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
  if (total <= 0) return "c";
  let roll = Math.random() * total;
  for (const [key, w] of entries) {
    roll -= w;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function drawItem(level) {
  const tier = TIERS.find((t) => t.level === level);
  const rarity = pickWeighted(tier.weights);
  const candidates = uniquePool(level).filter((it) => it.rarity === rarity);
  const fallback = uniquePool(level);
  const list = candidates.length ? candidates : fallback;
  return list[Math.floor(Math.random() * list.length)];
}

function unlockedLevel(lifetime) {
  let max = 1;
  TIERS.forEach((t) => {
    if (lifetime >= t.unlock) max = t.level;
  });
  return max;
}

function renderTiers(w) {
  const maxLv = unlockedLevel(w.lifetime);
  els.tiers.innerHTML = "";
  TIERS.forEach((t) => {
    const open = w.lifetime >= t.unlock;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tier" + (selectedLevel === t.level ? " is-on" : "");
    btn.disabled = !open;
    btn.innerHTML = `
      <span class="lv">${t.level} 级</span>
      <span class="need">${open ? t.blurb : `需累计 ${t.unlock}`}</span>
      <span class="cost">抽一次 ${t.cost}</span>
    `;
    if (open) {
      btn.addEventListener("click", () => {
        selectedLevel = t.level;
        renderAll();
      });
    }
    els.tiers.appendChild(btn);
  });
  if (selectedLevel == null || selectedLevel > maxLv) {
    selectedLevel = maxLv;
  }
}

function renderOdds(tier) {
  const order = ["c", "r", "e", "l"];
  const total = order.reduce((s, k) => s + (tier.weights[k] || 0), 0) || 1;
  els.odds.innerHTML = order
    .map((k) => {
      const w = tier.weights[k] || 0;
      const pct = ((w / total) * 100).toFixed(0);
      return `<div class="odd ${k}"><b>${pct}%</b><span>${RARITY_LABEL[k]}</span></div>`;
    })
    .join("");
}

function renderPool(level) {
  const items = uniquePool(level).sort((a, b) => {
    const rank = { c: 0, r: 1, e: 2, l: 3 };
    return rank[a.rarity] - rank[b.rarity];
  });
  els.pool.innerHTML = items
    .map(
      (it) => `
      <div class="pool-item">
        <span class="tag ${it.rarity}">${RARITY_LABEL[it.rarity]}</span>
        <strong>${it.name}</strong>
      </div>`,
    )
    .join("");
}

function renderInventory(w) {
  const entries = Object.entries(w.inventory).filter(([, n]) => n > 0);
  els.inventory.innerHTML = "";
  els.invEmpty.classList.toggle("is-hide", entries.length > 0);
  const nameOf = (id) => {
    for (const list of Object.values(POOL)) {
      const hit = list.find((x) => x.id === id);
      if (hit) return hit;
    }
    return { name: id, rarity: "c" };
  };
  entries
    .sort((a, b) => b[1] - a[1])
    .forEach(([id, n]) => {
      const it = nameOf(id);
      const li = document.createElement("li");
      li.innerHTML = `<span><span class="tag ${it.rarity}">${RARITY_LABEL[it.rarity]}</span> ${it.name}</span><span class="qty">×${n}</span>`;
      els.inventory.appendChild(li);
    });
}

function renderAll() {
  const w = loadWallet();
  els.points.textContent = String(w.points);
  els.lifetime.textContent = `累计获得 ${w.lifetime}`;
  renderTiers(w);
  const tier = TIERS.find((t) => t.level === selectedLevel) || TIERS[0];
  selectedLevel = tier.level;
  els.tierTitle.textContent = `${tier.level} 级兑换 · ${tier.blurb}`;
  els.tierSub.textContent =
    w.lifetime >= tier.unlock
      ? `累计达标 · 每次消耗 ${tier.cost} 积分`
      : `尚未解锁（需累计 ${tier.unlock}）`;
  renderOdds(tier);
  renderPool(tier.level);
  const can =
    w.lifetime >= tier.unlock && w.points >= tier.cost;
  els.drawBtn.disabled = !can;
  els.drawBtn.textContent = can
    ? `抽取一次（-${tier.cost}）`
    : w.points < tier.cost
      ? `积分不足（需要 ${tier.cost}）`
      : "等级未解锁";
  els.drawMsg.textContent = "";
  renderInventory(w);
}

function doDraw() {
  const w = loadWallet();
  const tier = TIERS.find((t) => t.level === selectedLevel);
  if (!tier || w.lifetime < tier.unlock) {
    toast("该等级尚未解锁");
    return;
  }
  if (w.points < tier.cost) {
    toast("积分不足");
    return;
  }
  w.points -= tier.cost;
  const item = drawItem(tier.level);
  w.inventory[item.id] = (w.inventory[item.id] || 0) + 1;
  saveWallet(w);

  els.reveal.hidden = false;
  els.revealRarity.textContent = RARITY_LABEL[item.rarity];
  els.revealRarity.style.color =
    item.rarity === "l"
      ? "#e8a020"
      : item.rarity === "e"
        ? "#b45ad4"
        : item.rarity === "r"
          ? "#3a8fd4"
          : "#7a8a96";
  els.revealName.textContent = item.name;
  els.revealDesc.textContent = item.desc;
  renderAll();
}

/** 供其它游戏写入：addCastlePoints(n) */
export function addCastlePoints(n) {
  const w = loadWallet();
  const gain = Math.max(0, Math.floor(n));
  w.points += gain;
  w.lifetime += gain;
  saveWallet(w);
  return w;
}

els.demoAdd.addEventListener("click", () => {
  addCastlePoints(800);
  toast("已获得 800 体验积分");
  renderAll();
});

els.drawBtn.addEventListener("click", doDraw);
els.revealClose.addEventListener("click", () => {
  els.reveal.hidden = true;
});

renderAll();
