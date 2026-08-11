/**
 * AI 知识之旅 · 关卡地图
 * 对齐 assessment_config.json：5 区 × 3 关 = 15 题（ailit_assessment 题序）
 */
export const MAP_STORAGE = "nn_map_progress_v1";
export const QUIZ_URL = "/collect";
export const TOTAL_LEVELS = 15;

/** @type {{ id: string, index: number, title: string, titleEn: string, levelId: string, domain: string, range: [number, number], tone: string, focus: {x:number,y:number} }[]} */
export const REGIONS = [
  {
    id: "r1",
    index: 1,
    title: "信号塔·入口",
    titleEn: "ENGAGING · GATE",
    levelId: "L1",
    domain: "Engaging",
    range: [1, 3],
    tone: "teal",
    focus: { x: 22, y: 68 },
  },
  {
    id: "r2",
    index: 2,
    title: "信号塔·塔顶",
    titleEn: "ENGAGING · PEAK",
    levelId: "L2",
    domain: "Engaging",
    range: [4, 6],
    tone: "green",
    focus: { x: 28, y: 28 },
  },
  {
    id: "r3",
    index: 3,
    title: "创作工坊",
    titleEn: "CREATING",
    levelId: "L3",
    domain: "Creating",
    range: [7, 9],
    tone: "violet",
    focus: { x: 58, y: 22 },
  },
  {
    id: "r4",
    index: 4,
    title: "指挥室",
    titleEn: "MANAGING",
    levelId: "L4",
    domain: "Managing",
    range: [10, 12],
    tone: "orange",
    focus: { x: 62, y: 55 },
  },
  {
    id: "r5",
    index: 5,
    title: "核心实验室",
    titleEn: "DESIGNING",
    levelId: "L5",
    domain: "Designing",
    range: [13, 15],
    tone: "crystal",
    focus: { x: 78, y: 78 },
  },
];

/** 与 assessment_config.levels 扁平题序一致 */
export const LEVEL_ITEM_IDS = [
  "E-1-Q1", "E-2-Q1", "E-3-Q1",
  "E-4-Q1", "E-5-Q1", "E-7-Q1",
  "C-1-Q1", "C-3-Q1", "C-4-Q1",
  "M-1-Q1", "E-6-Q1", "E-3-Q2",
  "D-2-Q1", "D-4-Q1", "D-5-Q1",
];

/** 奖励节点：每区终点 */
export const CHEST_NODES = [3, 6, 9, 12, 15];

const REWARD_POOL = [
  { id: "hair_aurora", label: "星辉发饰", kind: "发饰" },
  { id: "dress_signal", label: "信号礼裙", kind: "服装" },
  { id: "boot_orbit", label: "轨道短靴", kind: "鞋履" },
  { id: "acc_lens", label: "观测镜片", kind: "配饰" },
  { id: "outfit_core", label: "核心实验外套", kind: "套装" },
];

function buildNodes() {
  const nodes = [];
  for (let n = 1; n <= TOTAL_LEVELS; n += 1) {
    const region = REGIONS.find((r) => n >= r.range[0] && n <= r.range[1]);
    const local = n - region.range[0] + 1;
    const itemId = LEVEL_ITEM_IDS[n - 1];
    nodes.push({
      id: n,
      regionId: region.id,
      levelId: region.levelId,
      domain: region.domain,
      itemId,
      title: `${region.title} · 第 ${local} 关`,
      summary: `本题来自 AI 素养测评题库（${itemId}）。提交后推进旅程；养成臂按答题数解锁配件，与对错无关。`,
      reward: CHEST_NODES.includes(n)
        ? REWARD_POOL[CHEST_NODES.indexOf(n) % REWARD_POOL.length]
        : { id: "star", label: "旅程之星 ×1", kind: "星星" },
      isChest: CHEST_NODES.includes(n),
    });
  }
  return nodes;
}

export const NODES = buildNodes();

export function defaultProgress() {
  return {
    schemaVersion: 2,
    completed: [],
    current: 1,
    stars: 0,
    gems: 0,
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(MAP_STORAGE);
    if (!raw) return defaultProgress();
    const data = JSON.parse(raw);
    const clampId = (n) => {
      const v = Number(n);
      return v >= 1 && v <= TOTAL_LEVELS ? v : 1;
    };
    return {
      ...defaultProgress(),
      ...data,
      completed: Array.isArray(data.completed)
        ? data.completed.map(Number).filter((n) => n >= 1 && n <= TOTAL_LEVELS)
        : [],
      current: clampId(data.current),
      stars: Number(data.stars) || 0,
      gems: Number(data.gems) || 0,
    };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress) {
  localStorage.setItem(MAP_STORAGE, JSON.stringify(progress));
}

export function isCompleted(progress, id) {
  return progress.completed.includes(id);
}

export function isUnlocked(progress, id) {
  if (id === 1) return true;
  return isCompleted(progress, id - 1);
}

export function nodeStatus(progress, id) {
  if (isCompleted(progress, id)) return "done";
  if (progress.current === id && isUnlocked(progress, id)) return "current";
  if (isUnlocked(progress, id)) return "open";
  return "locked";
}

export function completionRatio(progress) {
  return Math.round((progress.completed.length / NODES.length) * 100);
}

export function nextRewards(progress) {
  const nextChest = CHEST_NODES.find((n) => !isCompleted(progress, n)) || CHEST_NODES[CHEST_NODES.length - 1];
  const idx = CHEST_NODES.indexOf(nextChest);
  return REWARD_POOL.slice(idx, idx + 3);
}

export function getNode(id) {
  return NODES.find((n) => n.id === id) || null;
}

export function itemIdForLevel(id) {
  return LEVEL_ITEM_IDS[id - 1] || null;
}

export function quizUrlFor(id) {
  const itemId = itemIdForLevel(id);
  const q = new URLSearchParams({
    level: String(id),
    arm: "collect",
  });
  if (itemId) q.set("item", itemId);
  return `${QUIZ_URL}?${q.toString()}`;
}

/**
 * 路径点：百分比坐标（5 区 × 3 关）
 */
const REGION_PATHS = [
  [[14, 78], [22, 70], [28, 66]],
  [[24, 48], [30, 32], [36, 38]],
  [[46, 24], [58, 18], [64, 26]],
  [[62, 46], [68, 58], [60, 54]],
  [[74, 72], [82, 80], [78, 74]],
];

export function pathPoints() {
  const pts = [];
  REGION_PATHS.forEach((segment, segIdx) => {
    segment.forEach(([x, y], i) => {
      const id = segIdx * 3 + i + 1;
      pts.push({ id, x, y });
    });
  });
  return pts;
}

export function regionOf(id) {
  return REGIONS.find((r) => id >= r.range[0] && id <= r.range[1]) || REGIONS[0];
}

export function regionProgress(progress, region) {
  const [lo, hi] = region.range;
  let done = 0;
  for (let n = lo; n <= hi; n += 1) {
    if (isCompleted(progress, n)) done += 1;
  }
  return { done, total: hi - lo + 1 };
}
