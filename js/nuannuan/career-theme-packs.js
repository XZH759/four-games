/**
 * 职业×性别主题元素包（配饰 / 印记 / 眼部 / 主题关键词）
 * 数据来源：login/assets/theme-packs/* 概念设定图
 */

const BASE = "/nuannuan/login/assets/theme-packs";
const OVERLAY_BASE = `${BASE}/overlays`;

/** Slot placement on the 1024×1536 doll stage (percent of stage box). */
export const ACCESSORY_SLOT_LAYOUT = {
  head: { top: "14%", left: "50%", width: "34%", transform: "translate(-50%, 0)" },
  shoulder: { top: "28%", left: "68%", width: "28%", transform: "translate(-50%, 0)" },
  back: { top: "26%", left: "28%", width: "30%", transform: "translate(-50%, 0)" },
  // 项链/吊坠：对齐概念图「佩戴效果」——胸口居中、领口下方
  neck: { top: "26%", left: "50%", width: "22%", transform: "translate(-50%, 0)" },
  chest: { top: "27%", left: "50%", width: "20%", transform: "translate(-50%, 0)" },
  wrist: { top: "48%", left: "22%", width: "30%", transform: "translate(-50%, 0)" },
  waist: { top: "52%", left: "50%", width: "32%", transform: "translate(-50%, 0)" },
  hip: { top: "54%", left: "72%", width: "30%", transform: "translate(-50%, 0)" },
};

/**
 * 项链/吊坠单项微调：使效果图与示意图（V 链 + 居中吊坠）一致。
 * top 以立绘舞台百分比计，约等于下巴下方 → 上胸。
 */
export const PENDANT_PLACEMENT = {
  pf_cube: { top: "25.5%", left: "50%", width: "21%" },
  pm_chip: { top: "26%", left: "50%", width: "21%" },
  em_wrench: { top: "25.5%", left: "50%", width: "22%" },
  rf_badge: { top: "27%", left: "50%", width: "19%" },
  rm_badge: { top: "26.5%", left: "50%", width: "19%" },
};

function overlayUrl(id) {
  return `${OVERLAY_BASE}/${id}.png`;
}

export function placementForAccessory(item, customPlacements) {
  if (!item) return null;
  const custom = customPlacements?.[item.id];
  if (custom && typeof custom.left === "number" && typeof custom.top === "number") {
    return {
      top: `${clampPercent(custom.top, 4, 88)}%`,
      left: `${clampPercent(custom.left, 6, 94)}%`,
      width: typeof custom.width === "number"
        ? `${clampPercent(custom.width, 10, 48)}%`
        : PENDANT_PLACEMENT[item.id]?.width || ACCESSORY_SLOT_LAYOUT[item.slot]?.width || "22%",
    };
  }
  if (PENDANT_PLACEMENT[item.id]) return { ...PENDANT_PLACEMENT[item.id] };
  const slot = ACCESSORY_SLOT_LAYOUT[item.slot];
  if (!slot) return null;
  return { top: slot.top, left: slot.left, width: slot.width };
}

function clampPercent(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/** Parse "26%" → 26 */
export function percentNumber(value, fallback = 50) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = parseFloat(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

/**
 * @typedef {{ id: string, slot: string, name: string, desc: string, glyph: string, stats?: string[] }} ThemeAccessory
 * @typedef {{ id: string, glyph: string, title: string, desc: string }} ThemeMark
 * @typedef {{ id: string, label: string, desc: string, glyph: string }} ThemeEye
 * @typedef {{ id: string, glyph: string, label: string }} ThemeKeyword
 * @typedef {{
 *   key: string,
 *   role: 'researcher'|'programmer'|'engineer',
 *   gender: 'female'|'male',
 *   outfit: string,
 *   slogan: string,
 *   sheet: string,
 *   palette: string[],
 *   accessories: ThemeAccessory[],
 *   marks: ThemeMark[],
 *   eyes: ThemeEye[],
 *   keywords: ThemeKeyword[],
 * }} CareerThemePack
 */

/** @type {Record<string, CareerThemePack>} */
export const CAREER_THEME_PACKS = {
  programmer_female: {
    key: "programmer_female",
    role: "programmer",
    gender: "female",
    outfit: "深色机能技衣 · 分层短裙 · 暗色长靴",
    slogan: "Code is Magic, Logic is Power",
    sheet: `${BASE}/programmer_f.png`,
    palette: ["#0a0e18", "#121a2a", "#1e3a5f", "#2a6f9e", "#3ecbff", "#7ef0ff", "#b8fff0", "#e8fff8"],
    accessories: [
      {
        id: "pf_headset",
        slot: "head",
        name: "像素代码耳机",
        desc: "降噪代码频道，舒适佩戴，专注编译节奏。",
        glyph: "</>",
        stats: ["专注 +20%", "编译速度 +15%"],
      },
      {
        id: "pf_wrist_kb",
        slot: "wrist",
        name: "全息键盘手环",
        desc: "腕部投射全息键位，快速指令输入。",
        glyph: "⌨",
        stats: ["指令速度 +", "数据防护"],
      },
      {
        id: "pf_cube",
        slot: "neck",
        name: "代码立方吊坠",
        desc: "便携数据核，微光能量闪烁。",
        glyph: "▣",
        stats: ["数据容量 +25%", "移动速度 +10%"],
      },
    ],
    marks: [
      { id: "pf_focus", glyph: "◈", title: "代码之瞳", desc: "在数据流中定位关键路径。" },
      { id: "pf_compile", glyph: "</>", title: "编译印记", desc: "把思路编译成可运行结构。" },
      { id: "pf_data", glyph: "⧉", title: "数据核心", desc: "以容量与条理承载复杂问题。" },
    ],
    eyes: [
      { id: "pf_scan", label: "高亮扫描视界", desc: "快速扫过题干关键节点。", glyph: "◉" },
      { id: "pf_channel", label: "代码频道视界", desc: "屏蔽噪声，只听关键信号。", glyph: "◎" },
      { id: "pf_grid", label: "全息网格视界", desc: "把信息铺成可操作网格。", glyph: "▦" },
    ],
    keywords: [
      { id: "pf_code", glyph: "</>", label: "代码" },
      { id: "pf_terminal", glyph: "▣", label: "终端" },
      { id: "pf_storage", glyph: "☰", label: "数据" },
    ],
  },

  programmer_male: {
    key: "programmer_male",
    role: "programmer",
    gender: "male",
    outfit: "深色连帽衫 · 暗色长裤 · 白底运动鞋",
    slogan: "代码即力量，逻辑即武器",
    sheet: `${BASE}/programmer_m.png`,
    palette: ["#0b1018", "#151c28", "#243044", "#2f6d8c", "#3ad0ff", "#8ae7ff"],
    accessories: [
      {
        id: "pm_goggles",
        slot: "head",
        name: "赛博编程护目镜",
        desc: "增强屏幕感知与暗线代码路径识别。",
        glyph: "▣",
        stats: ["视野范围 +", "暴击洞察 +"],
      },
      {
        id: "pm_chip",
        slot: "neck",
        name: "代码芯片吊坠",
        desc: "核心代码芯片，加速思维编译。",
        glyph: "⌬",
        stats: ["施法速度 +", "魔法上限 +"],
      },
      {
        id: "pm_terminal",
        slot: "hip",
        name: "调试终端腕带",
        desc: "便携调试终端，随时读日志修异常。",
        glyph: "⌨",
        stats: ["调试效率 +", "异常抵抗 +"],
      },
    ],
    marks: [
      { id: "pm_logic", glyph: "◈", title: "逻辑武装", desc: "以逻辑为刃，切开含糊条件。" },
      { id: "pm_debug", glyph: "⌁", title: "调试印记", desc: "先定位异常，再推进下一步。" },
      { id: "pm_power", glyph: "</>", title: "代码力量", desc: "专业 · 代码 · 逻辑。" },
    ],
    eyes: [
      { id: "pm_cyber", label: "赛博护目视界", desc: "夜视与代码路径叠加显示。", glyph: "▣" },
      { id: "pm_crit", label: "暴击洞察视界", desc: "更快发现关键线索。", glyph: "◇" },
      { id: "pm_log", label: "日志追踪视界", desc: "顺着日志线索回溯因果。", glyph: "⌕" },
    ],
    keywords: [
      { id: "pm_pro", glyph: "◆", label: "专业" },
      { id: "pm_code", glyph: "</>", label: "代码" },
      { id: "pm_logic", glyph: "◎", label: "逻辑" },
    ],
  },

  researcher_female: {
    key: "researcher_female",
    role: "researcher",
    gender: "female",
    outfit: "白色实验服 · 深蓝内搭 · 证件挂绳 · 白运动鞋",
    slogan: "专注探索，解析未知，以智慧与科技推动世界进步",
    sheet: `${BASE}/researcher_f.png`,
    palette: ["#1a2433", "#2c3e55", "#4a6d8c", "#6ec4ff", "#cfe9ff", "#f4f7fb"],
    accessories: [
      {
        id: "rf_goggles",
        slot: "head",
        name: "晶能数据护目镜",
        desc: "增强数据分析，显示隐藏信息。",
        glyph: "◉",
        stats: ["防御 +1", "发现 +10%", "夜视"],
      },
      {
        id: "rf_badge",
        slot: "chest",
        name: "智能实验室证章",
        desc: "记录研究进度，提升实验效率。",
        glyph: "✦",
        stats: ["智力 +1", "研究速度 +5%", "法力 +10"],
      },
      {
        id: "rf_notes",
        slot: "back",
        name: "悬浮分析笔记",
        desc: "自动记录样本数据，提供实时分析辅助。",
        glyph: "☰",
        stats: ["存储槽 +1", "采集效率 +5%", "自动记录"],
      },
    ],
    marks: [
      { id: "rf_core", glyph: "◆", title: "理性之芯", desc: "以观测与推理推进实验。" },
      { id: "rf_explore", glyph: "⌕", title: "探索印记", desc: "研究 · 探索 · 未来。" },
      { id: "rf_wisdom", glyph: "⚗", title: "智识星芒", desc: "用智慧把未知变成可验证结论。" },
    ],
    eyes: [
      { id: "rf_observe", label: "专注观测视界", desc: "看清实验条件与异常点。", glyph: "◉" },
      { id: "rf_night", label: "晶能夜视视界", desc: "在低信息密度中找出信号。", glyph: "◎" },
      { id: "rf_analyze", label: "分析叠层视界", desc: "把样本特征分层对照。", glyph: "◇" },
    ],
    keywords: [
      { id: "rf_research", glyph: "⚗", label: "研究" },
      { id: "rf_explore", glyph: "⛏", label: "探索" },
      { id: "rf_future", glyph: "☰", label: "未来" },
    ],
  },

  researcher_male: {
    key: "researcher_male",
    role: "researcher",
    gender: "male",
    outfit: "白色实验服 · 深色内搭 · 蓝挂绳证件 · 黑白运动鞋",
    slogan: "理性探索 · 数据为证",
    sheet: `${BASE}/researcher_m.png`,
    palette: ["#152033", "#2a3f5c", "#4f7ea8", "#6ec8ff", "#d7ebff", "#ffffff"],
    accessories: [
      {
        id: "rm_monocle",
        slot: "head",
        name: "智能单镜",
        desc: "增强观察与分析，轻微提升暴击洞察。",
        glyph: "◎",
        stats: ["观察 +", "分析 +", "暴击率微增"],
      },
      {
        id: "rm_badge",
        slot: "chest",
        name: "数据识别证",
        desc: "研究员专属通行证，提升知识获取与经验加成。",
        glyph: "▤",
        stats: ["知识获取 +", "经验加成 +"],
      },
      {
        id: "rm_tubes",
        slot: "waist",
        name: "能量试管腰包",
        desc: "储存实验能量试剂，加快技能冷却恢复。",
        glyph: "⚗",
        stats: ["冷却恢复 +", "试剂存储"],
      },
    ],
    marks: [
      { id: "rm_reason", glyph: "◆", title: "理性之证", desc: "理性探索，数据为证。" },
      { id: "rm_data", glyph: "▤", title: "数据印记", desc: "用证据校准每一次判断。" },
      { id: "rm_pulse", glyph: "⌁", title: "能量波形", desc: "让实验节奏保持可恢复。" },
    ],
    eyes: [
      { id: "rm_mono", label: "单镜分析视界", desc: "聚焦单点，深挖条件。", glyph: "◎" },
      { id: "rm_glass", label: "镜框校准视界", desc: "对齐观测尺度与误差。", glyph: "▣" },
      { id: "rm_crit", label: "洞察暴击视界", desc: "更快抓住关键变量。", glyph: "◇" },
    ],
    keywords: [
      { id: "rm_reason", glyph: "◆", label: "理性" },
      { id: "rm_explore", glyph: "⌕", label: "探索" },
      { id: "rm_data", glyph: "▤", label: "数据" },
    ],
  },

  engineer_female: {
    key: "engineer_female",
    role: "engineer",
    gender: "female",
    outfit: "白色安全帽 · 深蓝连体工装 · 棕色工作靴 · 扳手",
    slogan: "智慧与创造的创造者，用工具与蓝图改变世界的构造",
    sheet: `${BASE}/engineer_f.png`,
    palette: ["#121820", "#1e2a3a", "#2f4a66", "#f0a020", "#3ecbff", "#d8dee8"],
    accessories: [
      {
        id: "ef_helmet_pin",
        slot: "head",
        name: "安全头盔发夹",
        desc: "迷你安全帽发饰，工程专属防护标识。",
        glyph: "⌂",
        stats: ["防御 +1", "工程师专属"],
      },
      {
        id: "ef_toolbag",
        slot: "waist",
        name: "多功能工具包挂饰",
        desc: "腰间工具袋与能量小瓶，提升工具效率。",
        glyph: "⚒",
        stats: ["工具效率 +5%", "工程师专属"],
      },
      {
        id: "ef_sensor",
        slot: "wrist",
        name: "测量传感腕装",
        desc: "蓝屏传感腕带，提高测量精度与建造范围。",
        glyph: "⌚",
        stats: ["测量精度 +10%", "建造范围 +1 格"],
      },
    ],
    marks: [
      { id: "ef_craft", glyph: "▣", title: "构筑之手", desc: "把构想装配成可运行结构。" },
      { id: "ef_create", glyph: "⚙", title: "创造印记", desc: "工程 · 创造 · 精密。" },
      { id: "ef_blueprint", glyph: "▤", title: "蓝图印记", desc: "先画结构，再落工具。" },
    ],
    eyes: [
      { id: "ef_measure", label: "测量校准视界", desc: "对齐尺寸与误差边界。", glyph: "◎" },
      { id: "ef_build", label: "建造网格视界", desc: "把空间拆成可建造格子。", glyph: "▦" },
      { id: "ef_safe", label: "安全巡视视界", desc: "优先发现结构风险点。", glyph: "⌂" },
    ],
    keywords: [
      { id: "ef_eng", glyph: "⚙", label: "工程" },
      { id: "ef_create", glyph: "⚒", label: "创造" },
      { id: "ef_precise", glyph: "◎", label: "精密" },
    ],
  },

  engineer_male: {
    key: "engineer_male",
    role: "engineer",
    gender: "male",
    outfit: "深灰战术工装 · 多袋背带 · 工具腰带",
    slogan: "用智慧与机械，改变世界的工程师!!",
    sheet: `${BASE}/engineer_m.png`,
    palette: ["#101418", "#1c242c", "#3a4654", "#6a7a8c", "#3ad0ff", "#c9a26b", "#8b5a2b"],
    accessories: [
      {
        id: "em_goggles",
        slot: "head",
        name: "工程护目镜",
        desc: "强化合金护目镜，提升视野与作业效率。",
        glyph: "▣",
        stats: ["视野 +", "作业效率 +"],
      },
      {
        id: "em_epaulet",
        slot: "shoulder",
        name: "机械齿轮肩章",
        desc: "精密齿轮与合金铭牌，标识专业身份。",
        glyph: "⚙",
        stats: ["专业标识", "结构稳定"],
      },
      {
        id: "em_wrench",
        slot: "neck",
        name: "能量扳手项链",
        desc: "能量扳手吊坠，同步机械护腕能量。",
        glyph: "⚒",
        stats: ["能量灌注", "装配速度 +"],
      },
    ],
    marks: [
      { id: "em_craft", glyph: "▣", title: "工艺之心", desc: "工艺 · 创新 · 精准 · 效率。" },
      { id: "em_mech", glyph: "⚙", title: "机械印记", desc: "用机械把蓝图变成现实。" },
      { id: "em_energy", glyph: "⌁", title: "能量核心", desc: "为装配注入可持续动力。" },
    ],
    eyes: [
      { id: "em_alloy", label: "合金护目视界", desc: "在强光与粉尘中保持清晰。", glyph: "▣" },
      { id: "em_gear", label: "齿轮结构视界", desc: "看出传动关系与卡点。", glyph: "⚙" },
      { id: "em_energy", label: "能量流向视界", desc: "追踪能量从哪来到哪去。", glyph: "⌁" },
    ],
    keywords: [
      { id: "em_eng", glyph: "⚙", label: "工程" },
      { id: "em_build", glyph: "⚒", label: "建造" },
      { id: "em_energy", glyph: "⌁", label: "能量" },
      { id: "em_mech", glyph: "☰", label: "机械" },
    ],
  },
};

export function packKey(role, gender) {
  return `${role}_${gender}`;
}

export function getThemePack(role, gender) {
  const pack = CAREER_THEME_PACKS[packKey(role, gender)] || null;
  if (!pack) return null;
  return {
    ...pack,
    accessories: pack.accessories.map((item) => ({
      ...item,
      overlay: item.overlay || overlayUrl(item.id),
    })),
  };
}

/** @returns {{ id: string, slot: string, src: string, name: string, placement?: object }[]} */
export function resolveAccessoryOverlays(pack, selection) {
  if (!pack || !selection?.accessories?.length) return [];
  const custom = selection.placements || {};
  return selection.accessories
    .map((id) => {
      const item = pack.accessories.find((a) => a.id === id);
      if (!item) return null;
      return {
        id: item.id,
        slot: item.slot,
        src: item.overlay || overlayUrl(item.id),
        name: item.name,
        placement: placementForAccessory(item, custom),
        movable: true,
      };
    })
    .filter(Boolean);
}

export function defaultThemeSelection(pack) {
  if (!pack) {
    return { accessories: [], markId: null, eyeId: null, keywordId: null, placements: {} };
  }
  return {
    accessories: [],
    markId: pack.marks[0]?.id || null,
    eyeId: pack.eyes[0]?.id || null,
    keywordId: pack.keywords[0]?.id || null,
    placements: {},
  };
}

export function resolveThemeSelection(pack, selection) {
  const base = defaultThemeSelection(pack);
  if (!pack || !selection) return base;
  const accIds = new Set(pack.accessories.map((a) => a.id));
  const accessories = Array.isArray(selection.accessories)
    ? selection.accessories.filter((id) => accIds.has(id)).slice(0, 3)
    : [];
  const markId = pack.marks.some((m) => m.id === selection.markId)
    ? selection.markId
    : base.markId;
  const eyeId = pack.eyes.some((e) => e.id === selection.eyeId)
    ? selection.eyeId
    : base.eyeId;
  const keywordId = pack.keywords.some((k) => k.id === selection.keywordId)
    ? selection.keywordId
    : base.keywordId;
  const placements = {};
  if (selection.placements && typeof selection.placements === "object") {
    Object.entries(selection.placements).forEach(([id, pos]) => {
      if (!accIds.has(id) || !pos || typeof pos !== "object") return;
      placements[id] = {
        left: clampPercent(pos.left, 6, 94),
        top: clampPercent(pos.top, 4, 88),
        width: typeof pos.width === "number" ? clampPercent(pos.width, 10, 48) : undefined,
      };
    });
  }
  return { accessories, markId, eyeId, keywordId, placements };
}

export function findAccessory(pack, id) {
  return pack?.accessories.find((a) => a.id === id) || null;
}

export function findMark(pack, id) {
  return pack?.marks.find((m) => m.id === id) || null;
}

export function findEye(pack, id) {
  return pack?.eyes.find((e) => e.id === id) || null;
}

export function findKeyword(pack, id) {
  return pack?.keywords.find((k) => k.id === id) || null;
}

export const SLOT_LABELS = {
  head: "头部",
  wrist: "腕部",
  neck: "颈部",
  chest: "胸前",
  back: "背部",
  waist: "腰部",
  hip: "腰侧",
  shoulder: "肩部",
};
