/**
 * AI 知识之旅 · 关卡地图数据与进度
 * 5 区域 × 10 关 = 50 节点；线性解锁。
 */
export const MAP_STORAGE = "nn_map_progress_v1";
export const QUIZ_URL = "/collect";

export const REGIONS = [
  {
    id: "r1",
    index: 1,
    title: "认识AI",
    titleEn: "UNDERSTANDING AI",
    range: [1, 10],
    tone: "teal",
    /** 区域中心（地图百分比坐标），用于跳转定位 */
    focus: { x: 22, y: 68 },
  },
  {
    id: "r2",
    index: 2,
    title: "提示与协作",
    titleEn: "USING AI",
    range: [11, 20],
    tone: "green",
    focus: { x: 28, y: 28 },
  },
  {
    id: "r3",
    index: 3,
    title: "评估与判断",
    titleEn: "EVALUATING AI OUTPUTS",
    range: [21, 30],
    tone: "violet",
    focus: { x: 58, y: 22 },
  },
  {
    id: "r4",
    index: 4,
    title: "创作与应用",
    titleEn: "AI ETHICS & SAFETY",
    range: [31, 40],
    tone: "orange",
    focus: { x: 62, y: 55 },
  },
  {
    id: "r5",
    index: 5,
    title: "责任与未来",
    titleEn: "CREATING WITH AI",
    range: [41, 50],
    tone: "crystal",
    focus: { x: 78, y: 78 },
  },
];

/** 奖励节点：每区终点 */
export const CHEST_NODES = [10, 20, 30, 40, 50];

const REWARD_POOL = [
  { id: "hair_aurora", label: "星辉发饰", kind: "发饰" },
  { id: "dress_signal", label: "信号礼裙", kind: "服装" },
  { id: "boot_orbit", label: "轨道短靴", kind: "鞋履" },
  { id: "acc_lens", label: "观测镜片", kind: "配饰" },
  { id: "outfit_core", label: "核心实验外套", kind: "套装" },
];

function buildNodes() {
  const nodes = [];
  for (let n = 1; n <= 50; n += 1) {
    const region = REGIONS.find((r) => n >= r.range[0] && n <= r.range[1]);
    const local = n - region.range[0] + 1;
    nodes.push({
      id: n,
      regionId: region.id,
      title: `${region.title} · 第 ${local} 关`,
      summary: `完成关卡后可推进旅程进度，并有机会获得装扮奖励。`,
      reward: CHEST_NODES.includes(n)
        ? REWARD_POOL[(CHEST_NODES.indexOf(n)) % REWARD_POOL.length]
        : { id: "star", label: "旅程之星 ×1", kind: "星星" },
      isChest: CHEST_NODES.includes(n),
    });
  }
  return nodes;
}

export const NODES = buildNodes();

export function defaultProgress() {
  return {
    schemaVersion: 1,
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
    return {
      ...defaultProgress(),
      ...data,
      completed: Array.isArray(data.completed)
        ? data.completed.map(Number).filter((n) => n >= 1 && n <= 50)
        : [],
      current: Number(data.current) >= 1 && Number(data.current) <= 50 ? Number(data.current) : 1,
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

export function quizUrlFor(id) {
  return `${QUIZ_URL}?level=${id}`;
}

/**
 * 路径点：百分比坐标，贴合 world-map 五区地理（线性旅程）。
 * 区序：蓝湾 → 绿林 → 紫峰 → 金城 → 晶海
 */
const REGION_PATHS = [
  // r1 Understanding AI — 左下蓝湾
  [
    [14, 78], [18, 74], [22, 70], [20, 65], [24, 62],
    [28, 66], [32, 70], [30, 75], [26, 80], [22, 72],
  ],
  // r2 Using AI — 左上绿林
  [
    [24, 48], [22, 42], [26, 36], [30, 32], [34, 28],
    [38, 32], [36, 38], [32, 42], [28, 40], [34, 34],
  ],
  // r3 Evaluating — 上中紫峰
  [
    [42, 30], [46, 24], [52, 20], [58, 18], [64, 22],
    [68, 26], [62, 28], [56, 26], [50, 28], [54, 22],
  ],
  // r4 Ethics — 中右金城
  [
    [58, 42], [62, 46], [66, 50], [70, 54], [68, 58],
    [64, 62], [60, 58], [56, 54], [60, 50], [66, 56],
  ],
  // r5 Creating — 右下晶海
  [
    [70, 68], [74, 72], [78, 76], [82, 80], [86, 78],
    [84, 84], [80, 86], [76, 82], [72, 78], [78, 74],
  ],
];

export function pathPoints() {
  const pts = [];
  REGION_PATHS.forEach((segment, segIdx) => {
    segment.forEach(([x, y], i) => {
      const id = segIdx * 10 + i + 1;
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
