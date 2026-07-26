/**
 * 像素装扮绘制：飞行装备（双翼 / 背包 / 飞毯 / UFO）+ 头饰 / 胸饰
 * plot(x, y, w, h, color) — 由调用方注入（冲刺用 rect，赛车用 fillRect）
 *
 * 朝向约定（泰拉侧视）：
 * facing = 1  角色朝右 → 背后挂点在身体左侧（-x）
 * facing = -1 角色朝左 → 背后挂点在身体右侧（+x）
 */

/** 默认朝右；背后相对躯干中心的偏移（未乘 scale） */
export const DEFAULT_FACING = 1;
export const BACK_DEPTH = {
  jetpack: 6,
  rocket: 7,
  wings: 4,
  cape: 5,
  default: 5,
};

/**
 * 背后挂点 X：躯干中心向背后偏移
 * @param {number} bodyCx 躯干中心 x
 * @param {number} [scale=1]
 * @param {{ facing?: number, depth?: number, lean?: number, kind?: string }} [opts]
 */
export function backAnchorX(bodyCx, scale = 1, opts = {}) {
  const facing = opts.facing == null ? DEFAULT_FACING : opts.facing;
  const kind = opts.kind || "default";
  const depth = opts.depth == null ? (BACK_DEPTH[kind] || BACK_DEPTH.default) : opts.depth;
  const s = Math.max(0.6, scale);
  return bodyCx - facing * depth * s + (opts.lean || 0);
}

/** 双翼类样式（对称绘制，挂在背后） */
export const WING_PAIR_STYLES = ["feather", "angel", "mech", "demon", "butterfly"];

export const WING_STYLES = {
  feather: {
    name: "典藏羽翼",
    membrane: ["#f4f7ff", "#e8eef8", "#c8d4e8"],
    bone: "#9aa8c0",
    tip: "#ffe9a8",
    trail: ["#ffffff", "#c8e8ff", "#ffe9a8"],
  },
  angel: {
    name: "天使翅膀",
    membrane: ["#ffffff", "#f8f4ff", "#e8e0ff"],
    bone: "#d0c8e8",
    tip: "#ffe9a8",
    trail: ["#ffffff", "#e8d8ff", "#ffe9a8"],
  },
  mech: {
    name: "机械飞翼",
    membrane: ["#c8923a", "#a87028", "#6a4a1a"],
    bone: "#5a3a12",
    tip: "#5ad8ff",
    core: "#3aa8ff",
    trail: ["#5ad8ff", "#9ae8ff", "#ffffff"],
  },
  demon: {
    name: "暗夜魔翼",
    membrane: ["#4a1860", "#7a2888", "#c040a0"],
    bone: "#1a0818",
    tip: "#ff60c8",
    trail: ["#3a1048", "#a03090", "#ff80d0"],
  },
  butterfly: {
    name: "幻彩蝶翼",
    membrane: ["#c060ff", "#40c8ff", "#ff80c0"],
    bone: "#6a28a0",
    tip: "#ffe060",
    trail: ["#c060ff", "#40e0a0", "#ff80c0"],
  },
  jetpack: {
    name: "喷气背包",
    membrane: ["#c84848", "#888898", "#404050"],
    bone: "#303040",
    tip: "#5ad8ff",
    trail: ["#5ad8ff", "#9ae8ff", "#ffffff"],
  },
  rocket: {
    name: "火箭推进器",
    membrane: ["#c8d0d8", "#8890a0", "#505868"],
    bone: "#404850",
    tip: "#ff9030",
    trail: ["#ff6030", "#ffd45a", "#ffffff"],
  },
  carpet: {
    name: "魔法飞毯",
    membrane: ["#7a28a8", "#d4a84a", "#4a1868"],
    bone: "#d4a84a",
    tip: "#c060ff",
    trail: ["#c060ff", "#a050e0", "#ffe9a8"],
  },
  ufo: {
    name: "UFO飞碟",
    membrane: ["#a8b0b8", "#5ad8ff", "#687078"],
    bone: "#505860",
    tip: "#5ad8ff",
    trail: ["#5ad8ff", "#9ae8ff", "#ffffff"],
  },
  cloud: {
    name: "云朵坐骑",
    membrane: ["#ffffff", "#e8f4ff", "#c8e0ff"],
    bone: "#a08060",
    tip: "#5ad8ff",
    trail: ["#ffffff", "#c8e8ff", "#a8d8ff"],
  },
};

export function isWingPairStyle(styleKey) {
  return WING_PAIR_STYLES.includes(styleKey);
}

function styleOf(key) {
  return WING_STYLES[key] || WING_STYLES.feather;
}

/** 单侧翅膀：本地坐标，根部在 (0,0)，向 +x 展开；左翼由调用方镜像 */
function drawOneWing(plot, s, styleKey, { flap = 0, flying = false } = {}) {
  const st = styleOf(styleKey);
  const [m0, m1, m2] = st.membrane;
  const lift = flap;

  if (styleKey === "demon") {
    // 蝠翼：骨架 + 膜
    plot(0, -1 + lift, 2, 3, st.bone);
    plot(2, -2 + lift, 3, 2, st.bone);
    plot(5, -4 + lift, 3, 2, st.bone);
    plot(8, -6 + lift, 2, 2, st.bone);
    // 膜片（扇形像素块）
    plot(1, 0 + lift, 4, 5, m0);
    plot(4, -2 + lift, 5, 7, m1);
    plot(7, -4 + lift, 4, 8, m2);
    plot(9, -5 + lift, 2, 6, m1);
    // 下缘锯齿
    plot(3, 5 + lift, 2, 1, m0);
    plot(6, 5 + lift, 2, 1, m1);
    plot(8, 4 + lift, 2, 1, m2);
    if (flying) plot(10, -3 + lift, 1, 1, st.tip);
    return;
  }

  if (styleKey === "mech") {
    // 金属叶片
    plot(0, 0 + lift, 2, 3, st.bone);
    plot(2, -1 + lift, 4, 2, m0);
    plot(2, 1 + lift, 4, 2, m1);
    plot(5, -3 + lift, 4, 2, m0);
    plot(5, 0 + lift, 4, 2, m1);
    plot(5, 3 + lift, 3, 2, m2);
    plot(8, -4 + lift, 3, 2, m0);
    plot(8, -1 + lift, 3, 2, m1);
    // 齿轮关节
    plot(0, 0, 3, 3, "#8a6830");
    plot(1, 1, 1, 1, st.core || st.tip);
    // 翼尖能量晶
    plot(10, -4 + lift, 2, 2, st.tip);
    plot(10, -3 + lift, 1, 1, "#ffffff");
    if (flying) {
      plot(-1, 1, 1, 1, st.tip);
      plot(-2, 2, 1, 1, "#9ae8ff");
    }
    return;
  }

  if (styleKey === "butterfly") {
    plot(0, 0 + lift, 2, 3, st.bone);
    plot(2, -4 + lift, 5, 6, m0);
    plot(5, -6 + lift, 5, 5, m1);
    plot(7, -3 + lift, 4, 6, m2);
    plot(2, 2 + lift, 5, 4, m2);
    plot(6, 1 + lift, 4, 4, m0);
    plot(4, -2 + lift, 2, 2, "#ffffff");
    plot(8, -5 + lift, 1, 1, st.tip);
    if (flying) {
      plot(11, -4 + lift, 1, 1, m1);
      plot(10, 1 + lift, 1, 1, m2);
    }
    return;
  }

  // feather / angel：三层白羽（天使更亮）
  const bright = styleKey === "angel";
  plot(0, 0 + lift, 2, 3, st.bone);
  plot(2, -2 + lift, 3, 5, m1);
  plot(4, -4 + lift, 4, 6, m0);
  plot(7, -5 + lift, 3, 5, m0);
  plot(3, 1 + lift, 4, 4, m2);
  plot(6, 0 + lift, 3, 4, m1);
  plot(9, -4 + lift, 1, 2, st.tip);
  plot(8, -5 + lift, 1, 1, "#ffffff");
  if (bright) {
    plot(5, -5 + lift, 1, 1, "#ffe9a8");
    plot(10, -3 + lift, 1, 1, "#ffffff");
  }
  if (flying) {
    plot(10, -3 + lift, 1, 1, "#ffffff");
    plot(9, -1 + lift, 1, 1, "#c8e8ff");
  }
}

/**
 * 对称双翼。cx/cy = 背后挂点（朝右时已在身体左侧）。
 * facing: 1 朝右（默认），-1 朝左。
 */
export function drawWingPair(plot, cx, cy, scale = 1, opts = {}) {
  const {
    style = "feather",
    flying = false,
    t = 0,
    lean = 0,
    facing = DEFAULT_FACING,
  } = opts;
  // 翅膀整体放大，试装/冲刺/赛车统一观感
  const s = Math.max(0.6, scale) * 1.5;
  const flapAmp = flying ? 5 : 2.2;
  const flapSpeed = flying ? 14 : 5;
  const flap = Math.sin(t * flapSpeed) * flapAmp * s * 0.15;
  // 背后根点：略再向背后偏，双翼从背后张开
  const rootX = cx + lean - facing * 1.2 * s;

  const plotAt = (ox, oy, w, h, color, mirror) => {
    const x = mirror ? rootX - (ox + w) * s : rootX + ox * s;
    const y = cy + oy * s;
    plot(x, y, Math.max(1, w * s), Math.max(1, h * s), color);
  };

  drawOneWing(
    (x, y, w, h, c) => plotAt(x, y, w, h, c, true),
    s,
    style,
    { flap, flying },
  );
  drawOneWing(
    (x, y, w, h, c) => plotAt(x, y, w, h, c, false),
    s,
    style,
    { flap: -flap, flying },
  );

  if (flying) {
    const st = styleOf(style);
    if (style === "mech") {
      plot(rootX - 1 * s, cy + 2 * s, 3 * s, 5 * s, st.trail[0]);
      plot(rootX, cy + 5 * s, 2 * s, 4 * s, st.trail[1]);
      plot(rootX, cy + 8 * s, 1 * s, 3 * s, st.trail[2]);
    } else if (style === "demon") {
      plot(rootX - 2 * s, cy + 1 * s, 4 * s, 3 * s, st.trail[0]);
      plot(rootX - 1 * s, cy + 3 * s, 3 * s, 3 * s, st.trail[1]);
      plot(rootX, cy + 5 * s, 2 * s, 2 * s, st.trail[2]);
    } else if (style === "butterfly") {
      const spark = Math.floor(t * 10) % 4;
      plot(rootX - 5 * s, cy - spark, 1 * s, 1 * s, st.trail[0]);
      plot(rootX + 4 * s, cy + 1 - spark, 1 * s, 1 * s, st.trail[1]);
      plot(rootX, cy - 3 * s, 1 * s, 1 * s, st.trail[2]);
    } else {
      const spark = Math.floor(t * 8) % 3;
      plot(rootX - 4 * s, cy - 2 * s - spark, 1 * s, 1 * s, st.trail[0]);
      plot(rootX + 3 * s, cy - 1 * s + spark, 1 * s, 1 * s, st.trail[1]);
      plot(rootX, cy - 4 * s, 1 * s, 1 * s, st.trail[2]);
    }
  }
}

/** 喷气背包：背负于背后挂点（朝右时在身体左侧），喷嘴向下喷焰 — 放大型号 */
function drawJetpack(plot, cx, cy, scale, opts = {}) {
  const s = Math.max(0.6, scale) * 1.45;
  const facing = opts.facing == null ? DEFAULT_FACING : opts.facing;
  const flying = !!opts.flying;
  const t = opts.t || 0;
  const x = cx - 6 * s - facing * 1.5 * s;
  const y = cy - 5 * s;
  // 主罐体
  plot(x + 2 * s, y, 10 * s, 13 * s, "#707888");
  plot(x + 3 * s, y + 1 * s, 8 * s, 11 * s, "#c84848");
  plot(x + 5 * s, y + 2 * s, 4 * s, 5 * s, "#e06060");
  plot(x + 4 * s, y + 3 * s, 2 * s, 2 * s, "#ffd45a");
  // 侧扣
  plot(x + 1 * s, y + 2 * s, 2 * s, 3 * s, "#505060");
  plot(x + 11 * s, y + 2 * s, 2 * s, 3 * s, "#505060");
  // 双喷嘴
  plot(x + 2 * s, y + 11 * s, 4 * s, 5 * s, "#404850");
  plot(x + 8 * s, y + 11 * s, 4 * s, 5 * s, "#404850");
  plot(x + 3 * s, y + 12 * s, 2 * s, 3 * s, "#9098a8");
  plot(x + 9 * s, y + 12 * s, 2 * s, 3 * s, "#9098a8");
  if (flying) {
    const flick = Math.floor(t * 18) % 3;
    const h = 7 + flick;
    plot(x + 2 * s, y + 16 * s, 4 * s, h * s, "#5ad8ff");
    plot(x + 8 * s, y + 16 * s, 4 * s, h * s, "#5ad8ff");
    plot(x + 3 * s, y + (16 + h) * s, 2 * s, 4 * s, "#ffffff");
    plot(x + 9 * s, y + (16 + h) * s, 2 * s, 4 * s, "#ffffff");
  }
}

/** 火箭推进器：挂在背后，双筒放大 + 尾焰向下 */
function drawRocketPack(plot, cx, cy, scale, opts = {}) {
  const s = Math.max(0.6, scale) * 1.45;
  const facing = opts.facing == null ? DEFAULT_FACING : opts.facing;
  const flying = !!opts.flying;
  const t = opts.t || 0;
  const x = cx - 7 * s - facing * 1.5 * s;
  const y = cy - 2 * s;
  plot(x + 5 * s, y, 6 * s, 3 * s, "#687078");
  plot(x, y + 2 * s, 6 * s, 12 * s, "#c8d0d8");
  plot(x + 10 * s, y + 2 * s, 6 * s, 12 * s, "#c8d0d8");
  plot(x + 1 * s, y + 3 * s, 4 * s, 8 * s, "#8890a0");
  plot(x + 11 * s, y + 3 * s, 4 * s, 8 * s, "#8890a0");
  plot(x + 2 * s, y + 5 * s, 2 * s, 3 * s, "#ff9030");
  plot(x + 12 * s, y + 5 * s, 2 * s, 3 * s, "#ff9030");
  plot(x + 1 * s, y + 12 * s, 4 * s, 3 * s, "#505868");
  plot(x + 11 * s, y + 12 * s, 4 * s, 3 * s, "#505868");
  if (flying) {
    const flick = Math.floor(t * 16) % 2;
    plot(x, y + 15 * s, 6 * s, 8 * s + flick, "#ff9030");
    plot(x + 10 * s, y + 15 * s, 6 * s, 8 * s + flick, "#ff9030");
    plot(x + 1 * s, y + 20 * s, 4 * s, 5 * s, "#ffe060");
    plot(x + 11 * s, y + 20 * s, 4 * s, 5 * s, "#ffe060");
    plot(x + 2 * s, y + 24 * s, 2 * s, 3 * s, "#ffffff");
    plot(x + 12 * s, y + 24 * s, 2 * s, 3 * s, "#ffffff");
  }
}

/** 魔法飞毯坐骑：加宽加长，人物站/坐在毯面之上 */
function drawMagicCarpet(plot, cx, cy, scale, opts = {}) {
  const s = Math.max(0.6, scale) * 1.55;
  const lean = opts.lean || 0;
  const t = opts.t || 0;
  const flying = !!opts.flying;
  const bob = Math.sin(t * (flying ? 2.6 : 2.0)) * (flying ? 1.4 : 0.6) * s;
  const x = cx - 18 * s + lean;
  const y = cy + bob;
  // 毯体（大平台）
  plot(x, y, 36 * s, 7 * s, "#7a28a8");
  plot(x + 2 * s, y + 1 * s, 32 * s, 5 * s, "#9a40c8");
  plot(x + 10 * s, y, 16 * s, 7 * s, "#d4a84a");
  plot(x + 12 * s, y + 1 * s, 12 * s, 5 * s, "#7a28a8");
  plot(x + 14 * s, y + 2 * s, 8 * s, 3 * s, "#c060ff");
  // 金边纹
  plot(x + 1 * s, y, 34 * s, 1 * s, "#d4a84a");
  plot(x + 1 * s, y + 6 * s, 34 * s, 1 * s, "#d4a84a");
  // 四角流苏
  plot(x - 2 * s, y + 2 * s, 3 * s, 2 * s, "#d4a84a");
  plot(x + 35 * s, y + 2 * s, 3 * s, 2 * s, "#d4a84a");
  plot(x + 2 * s, y + 7 * s, 2 * s, 3 * s, "#d4a84a");
  plot(x + 32 * s, y + 7 * s, 2 * s, 3 * s, "#d4a84a");
  if (flying) {
    plot(x + 6 * s, y - 2 * s, 2 * s, 2 * s, "#c060ff");
    plot(x + 24 * s, y - 1 * s, 2 * s, 2 * s, "#ffe9a8");
    plot(x + 16 * s, y + 8 * s, 2 * s, 2 * s, "#a050e0");
  }
}

/**
 * UFO 坐骑底层：碟盘托住人物（画在身体之前）
 * 人物坐进舱内，腿部埋入碟盘
 */
function drawUfoMount(plot, cx, cy, scale, opts = {}) {
  const s = Math.max(0.6, scale) * 1.7;
  const lean = opts.lean || 0;
  const t = opts.t || 0;
  const flying = !!opts.flying;
  const bob = Math.sin(t * 2.2) * (flying ? 1.6 : 0.7) * s;
  const x = cx - 18 * s + lean;
  const y = cy + bob;
  // 下缘阴影环
  plot(x + 4 * s, y + 3 * s, 28 * s, 3 * s, "#40485088");
  // 主碟盘（宽）
  plot(x, y, 36 * s, 6 * s, "#a8b0b8");
  plot(x + 2 * s, y + 1 * s, 32 * s, 4 * s, "#687078");
  plot(x + 4 * s, y + 2 * s, 28 * s, 2 * s, "#505860");
  // 边缘灯
  plot(x + 4 * s, y + 2 * s, 3 * s, 2 * s, "#5ad8ff");
  plot(x + 12 * s, y + 2 * s, 3 * s, 2 * s, "#5ad8ff");
  plot(x + 21 * s, y + 2 * s, 3 * s, 2 * s, "#5ad8ff");
  plot(x + 29 * s, y + 2 * s, 3 * s, 2 * s, "#5ad8ff");
  // 舱底托盘（人物站立面）
  plot(x + 10 * s, y - 2 * s, 16 * s, 3 * s, "#9098a0");
  if (flying) {
    plot(x + 12 * s, y + 6 * s, 12 * s, 8 * s, "#5ad8ff66");
    plot(x + 14 * s, y + 6 * s, 8 * s, 10 * s, "#9ae8ff44");
  }
}

/**
 * UFO 前层罩：半透明驾驶舱盖住人物躯干（画在身体之后）
 */
function drawUfoOverlay(plot, cx, cy, scale, opts = {}) {
  const s = Math.max(0.6, scale) * 1.7;
  const lean = opts.lean || 0;
  const t = opts.t || 0;
  const flying = !!opts.flying;
  const bob = Math.sin(t * 2.2) * (flying ? 1.6 : 0.7) * s;
  const x = cx - 18 * s + lean;
  const y = cy + bob;
  // 舱罩穹顶（覆盖躯干中下部）
  plot(x + 8 * s, y - 12 * s, 20 * s, 10 * s, "#5ad8ff99");
  plot(x + 10 * s, y - 14 * s, 16 * s, 4 * s, "#9ae8ffaa");
  plot(x + 12 * s, y - 15 * s, 12 * s, 2 * s, "#c8f0ff");
  // 舱罩边框压在碟盘上沿
  plot(x + 7 * s, y - 3 * s, 22 * s, 2 * s, "#c8d0d8");
  plot(x + 9 * s, y - 4 * s, 18 * s, 1 * s, "#e8f0f8");
  // 高光
  plot(x + 14 * s, y - 13 * s, 4 * s, 2 * s, "#ffffffcc");
}

/** 云朵坐骑：加宽软云，人物站/坐在云顶 */
function drawCloudMount(plot, cx, cy, scale, opts = {}) {
  const s = Math.max(0.6, scale) * 1.55;
  const lean = opts.lean || 0;
  const t = opts.t || 0;
  const flying = !!opts.flying;
  const bob = Math.sin(t * 2.0) * (flying ? 1.5 : 0.6) * s;
  const x = cx - 16 * s + lean;
  const y = cy + bob;
  // 主云团（大平台）
  plot(x + 3 * s, y, 26 * s, 8 * s, "#ffffff");
  plot(x, y + 2 * s, 10 * s, 6 * s, "#e8f4ff");
  plot(x + 22 * s, y + 2 * s, 10 * s, 6 * s, "#e8f4ff");
  plot(x + 8 * s, y - 4 * s, 16 * s, 7 * s, "#ffffff");
  plot(x + 11 * s, y - 6 * s, 10 * s, 4 * s, "#c8e0ff");
  plot(x + 6 * s, y + 3 * s, 5 * s, 3 * s, "#c8e0ff");
  plot(x + 20 * s, y + 3 * s, 5 * s, 3 * s, "#d8ecf8");
  // 站立面高光
  plot(x + 10 * s, y - 1 * s, 12 * s, 2 * s, "#f8fcff");
  if (flying) {
    plot(x + 4 * s, y + 9 * s, 2 * s, 2 * s, "#ffffff");
    plot(x + 20 * s, y + 8 * s, 2 * s, 2 * s, "#c8e8ff");
    plot(x + 14 * s, y + 10 * s, 1 * s, 1 * s, "#a8d8ff");
  }
}

/**
 * 统一飞行装备绘制（泰拉挂点）。
 * layer:
 * - "back"     背后（双翼 / 喷气背包）— 画在身体之前
 * - "mount"    坐骑平台（飞毯 / 云 / UFO 碟盘）— 画在身体脚底之前
 * - "overlay"  前罩（UFO 舱罩）— 画在身体之后，部分盖住人物
 */
export function drawFlightGear(plot, cx, cy, scale = 1, opts = {}) {
  const style = opts.style || "feather";
  const layer = opts.layer || "back";
  if (layer === "mount") {
    if (style === "carpet") drawMagicCarpet(plot, cx, cy, scale, opts);
    else if (style === "ufo") drawUfoMount(plot, cx, cy, scale, opts);
    else if (style === "cloud") drawCloudMount(plot, cx, cy, scale, opts);
    return;
  }
  if (layer === "overlay") {
    if (style === "ufo") drawUfoOverlay(plot, cx, cy, scale, opts);
    return;
  }
  if (layer === "back") {
    if (style === "jetpack") drawJetpack(plot, cx, cy, scale, opts);
    else if (style === "rocket") drawRocketPack(plot, cx, cy, scale, opts);
    else if (isWingPairStyle(style)) drawWingPair(plot, cx, cy, scale, opts);
  }
}

/**
 * 环绕型特效：叶片 / 泡泡绕角色浮动（每帧绘制，不走拖尾粒子）
 */
export function drawOrbitAura(plot, cx, cy, scale = 1, opts = {}) {
  const style = opts.style || "leaf";
  const t = opts.t || 0;
  const s = Math.max(0.55, scale);
  const n = style === "bubble" ? 6 : 5;
  const radius = (opts.radius || 13) * s;
  for (let i = 0; i < n; i += 1) {
    const speed = style === "leaf" ? 1.7 : 1.15;
    const ang = t * speed + (i / n) * Math.PI * 2;
    const wobble = Math.sin(t * 3.2 + i * 1.1) * 1.8 * s;
    const px = cx + Math.cos(ang) * radius;
    const py = cy + Math.sin(ang) * radius * 0.72 + wobble;
    if (style === "bubble") {
      const sz = (2 + (i % 3)) * s;
      plot(px, py, sz, sz, "#a8e0ff88");
      plot(px + 0.5 * s, py + 0.5 * s, Math.max(1, sz * 0.45), Math.max(1, sz * 0.45), "#ffffff");
    } else {
      // leaf：菱形小叶片
      const colors = ["#3aaa48", "#6dff7a", "#2a6a30", "#a8ff7a"];
      const c = colors[i % colors.length];
      plot(px, py, 3 * s, 2 * s, c);
      plot(px + 1 * s, py - 1 * s, 2 * s, 2 * s, c);
      plot(px + 2 * s, py + 1 * s, 1 * s, 1 * s, "#2a6a30");
    }
  }
}

/** 学者披风：深蓝金边，挂在背后（朝右时偏左侧） */
export function drawCape(plot, cx, cy, scale = 1, opts = {}) {
  const s = Math.max(0.6, scale);
  const facing = opts.facing == null ? DEFAULT_FACING : opts.facing;
  const wind = opts.wind == null ? 1 : opts.wind;
  const sway = Math.sin((opts.t || 0) * (2.5 + wind)) * 1.5 * s * wind;
  const lean = opts.lean || 0;
  // cx 应为背后挂点；再略向背后偏，披风从背后垂下
  const x = cx - 5 * s + lean + sway * 0.3 - facing * 1.5 * s;
  const y = cy;
  const stretch = 1 + Math.max(0, wind - 1) * 0.12;
  plot(x + 1 * s, y, 8 * s, 14 * s * stretch, "#1a2a68");
  plot(x, y + 1 * s, 10 * s, 12 * s * stretch, "#243888");
  plot(x + 1 * s, y, 8 * s, 1 * s, "#d4a84a");
  plot(x, y + 1 * s, 1 * s, 12 * s * stretch, "#d4a84a");
  plot(x + 9 * s, y + 1 * s, 1 * s, 12 * s * stretch, "#d4a84a");
  plot(x + 1 * s, y + 13 * s * stretch, 8 * s, 1 * s, "#d4a84a");
  plot(cx - 1 * s + lean - facing * 1.5 * s, y - 1 * s, 3 * s, 3 * s, "#d4a84a");
  plot(cx + lean - facing * 1.5 * s, y, 1 * s, 1 * s, "#5ad8ff");
}

/** 头饰：王冠 / 头盔 / 护目镜 / 法帽 */
export function drawHeadGear(plot, cx, cy, scale = 1, opts = {}) {
  const style = opts.style || "knowledge";
  const s = Math.max(0.6, scale);
  const lean = opts.lean || 0;
  const t = opts.t || 0;
  const x = cx - 4 * s + lean;
  const y = cy;

  if (style === "miner") {
    plot(x, y + 1 * s, 8 * s, 3 * s, "#6a4a28");
    plot(x + 1 * s, y, 6 * s, 2 * s, "#8a6830");
    plot(x + 3 * s, y - 1 * s, 2 * s, 2 * s, "#d4a84a");
    plot(x + 3 * s, y - 2 * s, 2 * s, 1 * s, "#ffe060");
    if (Math.floor(t * 4) % 3 === 0) plot(x + 4 * s, y - 3 * s, 1 * s, 1 * s, "#ffffff");
    return;
  }
  if (style === "brave") {
    plot(x, y + 1 * s, 8 * s, 4 * s, "#4a3020");
    plot(x + 1 * s, y, 6 * s, 2 * s, "#3aaa48");
    plot(x + 3 * s, y - 3 * s, 1 * s, 4 * s, "#e84848");
    plot(x + 2 * s, y - 1 * s, 3 * s, 1 * s, "#c03030");
    return;
  }
  if (style === "goggles") {
    plot(x + 1 * s, y + 2 * s, 6 * s, 1 * s, "#6a4a28");
    plot(x, y + 1 * s, 3 * s, 3 * s, "#8a6830");
    plot(x + 5 * s, y + 1 * s, 3 * s, 3 * s, "#8a6830");
    plot(x + 1 * s, y + 2 * s, 1 * s, 1 * s, "#5ad8ff");
    plot(x + 6 * s, y + 2 * s, 1 * s, 1 * s, "#5ad8ff");
    return;
  }
  if (style === "wizard") {
    plot(x + 2 * s, y - 8 * s, 4 * s, 10 * s, "#7a28a8");
    plot(x + 1 * s, y + 1 * s, 6 * s, 2 * s, "#7a28a8");
    plot(x + 2 * s, y - 1 * s, 4 * s, 2 * s, "#c84848");
    plot(x + 3 * s, y - 1 * s, 2 * s, 1 * s, "#d4a84a");
    plot(x + 3 * s, y - 9 * s, 2 * s, 2 * s, "#9a40c8");
    return;
  }
  // knowledge 默认王冠
  plot(x, y + 2 * s, 8 * s, 2 * s, "#d4a84a");
  plot(x + 1 * s, y, 2 * s, 3 * s, "#e8c060");
  plot(x + 3 * s, y - 1 * s, 2 * s, 4 * s, "#e8c060");
  plot(x + 5 * s, y, 2 * s, 3 * s, "#e8c060");
  plot(x + 1 * s, y, 1 * s, 1 * s, "#5ad8ff");
  plot(x + 3 * s, y - 1 * s, 1 * s, 1 * s, "#5ad8ff");
  plot(x + 5 * s, y, 1 * s, 1 * s, "#5ad8ff");
  if (Math.floor(t * 3) % 4 === 0) {
    plot(x + 4 * s, y - 2 * s, 1 * s, 1 * s, "#ffffff");
  }
}

/** @deprecated 使用 drawHeadGear(..., { style: "knowledge" }) */
export function drawCrown(plot, cx, cy, scale = 1, opts = {}) {
  drawHeadGear(plot, cx, cy, scale, { ...opts, style: opts.style || "knowledge" });
}

/** 胸饰：幸运符 / 星辉项链 / 水晶吊坠 */
export function drawChestCharm(plot, cx, cy, scale = 1, opts = {}) {
  const style = opts.style || "clover";
  const s = Math.max(0.6, scale);
  const lean = opts.lean || 0;
  const t = opts.t || 0;

  if (style === "star") {
    const pulse = Math.floor(t * 5) % 2;
    plot(cx - 1 * s + lean, cy - 3 * s, 1 * s, 3 * s, "#d4a84a");
    plot(cx - 2 * s + lean, cy, 5 * s, 1 * s, "#d4a84a");
    plot(cx - 1 * s + lean, cy - 1 * s, 3 * s, 3 * s, "#ffe060");
    plot(cx + lean, cy, 1 * s, 1 * s, "#ffffff");
    if (pulse) {
      plot(cx - 3 * s + lean, cy - 1 * s, 1 * s, 1 * s, "#ffe9a8");
      plot(cx + 3 * s + lean, cy + 1 * s, 1 * s, 1 * s, "#ffe9a8");
    }
    return;
  }
  if (style === "crystal") {
    plot(cx - 0.5 * s + lean, cy - 3 * s, 1 * s, 3 * s, "#6a4a28");
    plot(cx - 1 * s + lean, cy, 3 * s, 4 * s, "#3a78e8");
    plot(cx + lean, cy + 1 * s, 1 * s, 2 * s, "#9ae8ff");
    if (Math.floor(t * 4) % 3 === 0) plot(cx + lean, cy, 1 * s, 1 * s, "#ffffff");
    return;
  }
  // clover 默认
  drawLuckBadge(plot, cx, cy, scale, opts);
}

/** 幸运四叶徽章（胸口） */
export function drawLuckBadge(plot, cx, cy, scale = 1, opts = {}) {
  const s = Math.max(0.6, scale);
  const pulse = 0.85 + Math.sin((opts.t || 0) * 4) * 0.15;
  const lean = opts.lean || 0;
  const g = pulse > 0.95 ? "#6dff7a" : "#3aaa48";
  plot(cx - 2 * s + lean, cy - 1 * s, 2 * s, 2 * s, g);
  plot(cx + lean, cy - 1 * s, 2 * s, 2 * s, g);
  plot(cx - 2 * s + lean, cy + 1 * s, 2 * s, 2 * s, g);
  plot(cx + lean, cy + 1 * s, 2 * s, 2 * s, g);
  plot(cx - 0.5 * s + lean, cy, 1 * s, 2 * s, "#2a6a30");
  // 金框护符感
  if (opts.framed) {
    plot(cx - 3 * s + lean, cy - 2 * s, 6 * s, 1 * s, "#d4a84a");
    plot(cx - 3 * s + lean, cy + 3 * s, 6 * s, 1 * s, "#d4a84a");
  }
}

/**
 * 派对气球束 · 泰拉式手持/腰系
 * cx,cy = 握点（手掌或腰带扣）；气球在握点上方外侧，身体之后绘制才不会被挡住
 * opts.side: 1 右侧（默认）/ -1 左侧
 * opts.attach: "hand" | "waist"
 */
export function drawBalloons(plot, cx, cy, scale = 1, opts = {}) {
  const s = Math.max(0.6, scale);
  const flying = !!opts.flying;
  const t = opts.t || 0;
  const lean = opts.lean || 0;
  const side = opts.side == null ? 1 : opts.side;
  const attach = opts.attach || "hand";
  const bob = Math.sin(t * (flying ? 2.4 : 3.2)) * (flying ? 2.5 : 1.4) * s;
  const colors = ["#e84848", "#3a78e8", "#f0d040", "#3aaa48", "#a050d0"];
  const count = flying ? 5 : 4;
  const spread = flying ? 3.6 : 2.8;
  const gripX = cx + lean + side * (attach === "waist" ? 1 * s : 0);
  const gripY = cy;

  if (attach === "hand") {
    plot(gripX - 1 * s, gripY - 1 * s, 3 * s, 3 * s, "#f0c090");
    plot(gripX, gripY, 1 * s, 1 * s, "#d0a070");
  } else {
    plot(gripX - 1 * s, gripY, 3 * s, 2 * s, "#6a4a28");
    plot(gripX, gripY, 1 * s, 1 * s, "#d4a84a");
  }

  for (let i = 0; i < count; i += 1) {
    const c = colors[i % colors.length];
    const ox = side * (4 + i * spread) * s + Math.sin(t * 2.5 + i) * 0.6 * s;
    const oy = bob
      - (flying ? 16 : 11) * s
      - (i % 3) * 2.2 * s
      + Math.cos(t * 2 + i * 0.7) * (flying ? 1.5 : 0.8) * s;
    const bx = gripX + ox;
    const by = gripY + oy;
    const bw = flying ? 4 * s : 3 * s;
    const bh = flying ? 5 * s : 4 * s;
    plot(bx, by, bw, bh, c);
    plot(bx + 1 * s, by + 1 * s, 1 * s, 1 * s, "#ffffff");
    const steps = Math.max(4, Math.round(((flying ? 14 : 10) * s) / Math.max(1, s)));
    for (let k = 1; k <= steps; k += 1) {
      const u = k / steps;
      const arc = Math.sin(u * Math.PI) * side * 1.2 * s;
      const sx = bx + bw * 0.4 + (gripX - (bx + bw * 0.4)) * u + arc * (1 - u);
      const sy = by + bh + (gripY - (by + bh)) * u;
      plot(sx, sy, 1 * s, 1 * s, u > 0.85 ? "#e8e8e8" : "#c8c8c8");
    }
  }

  if (flying) {
    const spark = ["#ff8a8a", "#8ab4ff", "#ffe08a", "#8aff9a", "#d08aff"];
    for (let i = 0; i < 4; i += 1) {
      if (Math.floor(t * 7 + i) % 3 !== 0) continue;
      plot(
        gripX + side * (6 + i * 3) * s,
        gripY - (18 + (Math.floor(t * 9 + i) % 4) * 2) * s,
        1 * s,
        1 * s,
        spark[i % spark.length],
      );
    }
  }
}

/** 气球浮空尾迹：彩色碎屑向上/向后飘 */
export function spawnBalloonTrail(particles, x, y, opts = {}) {
  const colors = ["#e84848", "#3a78e8", "#f0d040", "#3aaa48", "#a050d0", "#ffffff"];
  const n = opts.count || 3;
  const dir = opts.dir || 1;
  for (let i = 0; i < n; i += 1) {
    particles.push({
      kind: opts.kind || "wingtrail",
      x: x + (Math.random() - 0.5) * 14,
      y: y + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 18 - dir * 12,
      vy: -25 - Math.random() * 35,
      life: 0.4 + Math.random() * 0.3,
      max: 0.65,
      color: colors[i % colors.length],
      size: 2,
    });
  }
}

/**
 * 像素伙伴。motion: ground | hover
 * 返回建议挂点偏移供粒子用
 */
export function drawPet(plot, cx, cy, styleKey = "slime", opts = {}) {
  const s = Math.max(0.7, opts.scale || 1);
  const t = opts.t || 0;
  const bob = opts.motion === "hover"
    ? Math.sin(t * 5) * 3 * s
    : Math.abs(Math.sin(t * 6)) * -1.5 * s;
  const x = cx;
  const y = cy + bob;

  if (styleKey === "train") {
    plot(x - 5 * s, y - 4 * s, 10 * s, 5 * s, "#2a2a2a");
    plot(x + 1 * s, y - 7 * s, 5 * s, 4 * s, "#d04040");
    plot(x - 2 * s, y - 8 * s, 3 * s, 3 * s, "#d4a84a");
    plot(x - 4 * s, y + 1 * s, 2 * s, 2 * s, "#888");
    plot(x + 2 * s, y + 1 * s, 2 * s, 2 * s, "#888");
    if (Math.floor(t * 6) % 2 === 0) plot(x - 1 * s, y - 10 * s, 2 * s, 2 * s, "#eee");
    return { x, y };
  }
  if (styleKey === "bee") {
    plot(x - 3 * s, y - 3 * s, 6 * s, 5 * s, "#f0d040");
    plot(x - 3 * s, y - 1 * s, 6 * s, 1 * s, "#1a1410");
    plot(x + 2 * s, y - 2 * s, 2 * s, 2 * s, "#5ad8ff");
    plot(x - 5 * s, y - 4 * s, 3 * s, 2 * s, "#a8e8ff");
    plot(x + 3 * s, y - 4 * s, 3 * s, 2 * s, "#a8e8ff");
    return { x, y };
  }
  if (styleKey === "owl") {
    plot(x - 4 * s, y - 5 * s, 8 * s, 7 * s, "#8a6030");
    plot(x - 3 * s, y - 4 * s, 3 * s, 3 * s, "#f0e8a0");
    plot(x + 1 * s, y - 4 * s, 3 * s, 3 * s, "#f0e8a0");
    plot(x - 2 * s, y - 3 * s, 1 * s, 1 * s, "#1a1410");
    plot(x + 2 * s, y - 3 * s, 1 * s, 1 * s, "#1a1410");
    plot(x - 1 * s, y + 2 * s, 1 * s, 2 * s, "#e87820");
    plot(x + 1 * s, y + 2 * s, 1 * s, 2 * s, "#e87820");
    return { x, y };
  }
  if (styleKey === "ghost") {
    plot(x - 3 * s, y - 5 * s, 6 * s, 7 * s, "#f0f4ff");
    plot(x - 2 * s, y - 3 * s, 1 * s, 1 * s, "#1a1410");
    plot(x + 1 * s, y - 3 * s, 1 * s, 1 * s, "#1a1410");
    plot(x - 4 * s, y - 6 * s, 1 * s, 1 * s, "#fff");
    plot(x + 4 * s, y - 2 * s, 1 * s, 1 * s, "#c8e0ff");
    return { x, y };
  }
  if (styleKey === "dragon") {
    plot(x - 4 * s, y - 4 * s, 8 * s, 5 * s, "#2a1a18");
    plot(x - 2 * s, y - 2 * s, 4 * s, 3 * s, "#e84820");
    plot(x - 5 * s, y - 5 * s, 2 * s, 3 * s, "#e86020");
    plot(x + 3 * s, y - 5 * s, 2 * s, 3 * s, "#e86020");
    plot(x - 1 * s, y - 3 * s, 1 * s, 1 * s, "#ffd45a");
    plot(x + 1 * s, y - 3 * s, 1 * s, 1 * s, "#ffd45a");
    if (Math.floor(t * 5) % 3 === 0) plot(x + 4 * s, y - 4 * s, 2 * s, 1 * s, "#ff8030");
    return { x, y };
  }
  if (styleKey === "alpaca") {
    plot(x - 4 * s, y - 5 * s, 8 * s, 7 * s, "#f4f4f8");
    plot(x - 2 * s, y - 7 * s, 4 * s, 3 * s, "#f4f4f8");
    plot(x - 3 * s, y - 1 * s, 6 * s, 2 * s, "#5a98d8");
    plot(x - 1 * s, y - 5 * s, 1 * s, 1 * s, "#1a1410");
    plot(x + 1 * s, y - 5 * s, 1 * s, 1 * s, "#1a1410");
    return { x, y };
  }
  if (styleKey === "firefly") {
    plot(x - 2 * s, y - 2 * s, 4 * s, 3 * s, "#284878");
    plot(x - 3 * s, y - 3 * s, 2 * s, 2 * s, "#a8e8ff");
    plot(x + 2 * s, y - 3 * s, 2 * s, 2 * s, "#a8e8ff");
    const glow = Math.sin(t * 8) > 0 ? "#e8ff60" : "#a0d040";
    plot(x - 1 * s, y, 3 * s, 3 * s, glow);
    plot(x + 3 * s, y - 4 * s, 1 * s, 1 * s, "#fff");
    return { x, y };
  }
  // slime 默认
  const squash = 1 + Math.sin(t * 6) * 0.08;
  plot(x - 4 * s, y - 4 * s * squash, 8 * s, 6 * s * squash, "#3aaa48");
  plot(x - 3 * s, y - 5 * s * squash, 6 * s, 2 * s, "#6dff7a");
  plot(x - 2 * s, y - 2 * s, 1 * s, 1 * s, "#1a1410");
  plot(x + 1 * s, y - 2 * s, 1 * s, 1 * s, "#1a1410");
  return { x, y };
}

const TRAIL_PALETTE = {
  dust: ["#fff6c8", "#ffe08a", "#ffd45a", "#ffffff"],
  aurora: ["#ff6ad5", "#7ad7ff", "#a8ff7a", "#ffd45a", "#c89cff"],
  spark: ["#ff4010", "#ff8030", "#ffd45a"],
  ice: ["#e8f8ff", "#a8e8ff", "#ffffff", "#7ad7ff"],
  shadow: ["#2a1040", "#4a1860", "#7a2888"],
  gold: ["#ffd45a", "#ffe08a", "#ffffff", "#f0c040"],
  leaf: ["#3aaa48", "#6dff7a", "#2a6a30", "#a8ff7a"],
  bubble: ["#a8e0ff", "#d0f0ff", "#ffffff", "#7ad7ff"],
  fireworks: ["#ff6ad5", "#ffd45a", "#7ad7ff", "#ff8a5a", "#c89cff", "#ffffff", "#a8ff7a"],
};

/** 奔跑 / 赛车拖尾粒子（环绕型请用 drawOrbitAura；烟花请用 spawnFireworkBloom） */
export function spawnCosmeticTrail(particles, x, y, styleKey, opts = {}) {
  if (!styleKey || styleKey === "fireworks") return;
  if (styleKey === "leaf" || styleKey === "bubble") return;
  const colors = TRAIL_PALETTE[styleKey] || TRAIL_PALETTE.dust;
  const n = opts.count || (styleKey === "aurora" ? 4 : 2);
  const dir = opts.dir || 1;
  for (let i = 0; i < n; i += 1) {
    let vx = (Math.random() - 0.5) * 24 - dir * 10;
    let vy = 8 + Math.random() * 24;
    let size = 2;
    if (styleKey === "spark") {
      // 火花：向上飙升后落下
      vx = (Math.random() - 0.5) * 16;
      vy = -28 - Math.random() * 48;
      size = 2;
    } else if (styleKey === "ice") {
      // 冰晶足迹：贴地缓慢散开
      vx = (Math.random() - 0.5) * 18;
      vy = -2 + Math.random() * 8;
      size = 2 + (i % 2);
    } else if (styleKey === "shadow") {
      // 暗影烟雾：向上翻涌
      vx = (Math.random() - 0.5) * 20;
      vy = -18 - Math.random() * 22;
      size = 3 + (i % 2);
    } else if (styleKey === "gold") {
      // 金币闪光：四周爆散星芒
      const ang = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 36;
      vx = Math.cos(ang) * spd;
      vy = Math.sin(ang) * spd;
      size = 1 + (i % 2);
    } else if (styleKey === "dust") {
      // 星尘：脚后拖尾
      vx = (Math.random() - 0.5) * 14 - dir * 14;
      vy = 4 + Math.random() * 18;
      size = 2;
    } else if (styleKey === "aurora") {
      // 彩虹弧光：斜向拖尾彩带
      vx = (Math.random() - 0.5) * 10 - dir * 18;
      vy = -6 + Math.random() * 16;
      size = 2 + (i % 2);
    }
    particles.push({
      kind: opts.kind || "spark",
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 6,
      vx,
      vy,
      life: 0.3 + Math.random() * 0.3,
      max: 0.55,
      size,
      color: colors[i % colors.length],
    });
  }
}

/**
 * 烟花绽放：从中心向四周炸开（可多层爆点）
 * @param {object[]} particles
 * @param {number} cx
 * @param {number} cy
 * @param {{ count?: number, rings?: number, speed?: number, kind?: string, life?: number }} [opts]
 */
export function spawnFireworkBloom(particles, cx, cy, opts = {}) {
  const colors = TRAIL_PALETTE.fireworks;
  const rings = opts.rings || 1;
  const perRing = opts.count || 16;
  const baseSpd = opts.speed || 55;
  const kind = opts.kind || "spark";
  const life = opts.life || 0.75;
  for (let r = 0; r < rings; r += 1) {
    const ox = (Math.random() - 0.5) * (r * 18);
    const oy = (Math.random() - 0.5) * (r * 14) - r * 6;
    for (let i = 0; i < perRing; i += 1) {
      const ang = (Math.PI * 2 * i) / perRing + r * 0.35;
      const spd = baseSpd * (0.55 + Math.random() * 0.7) * (1 + r * 0.15);
      particles.push({
        kind,
        x: cx + ox,
        y: cy + oy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 12,
        life: life * (0.7 + Math.random() * 0.4),
        max: life + 0.25,
        size: 2 + (i % 3 === 0 ? 1 : 0),
        color: colors[(i + r * 3) % colors.length],
      });
    }
  }
  // 中心闪光（用 spark，冲刺/赛车都能画；冲刺可另加 ring）
  particles.push({
    kind,
    x: cx - 2,
    y: cy - 2,
    vx: 0,
    vy: -6,
    life: 0.28,
    max: 0.28,
    size: 5,
    color: "#ffd45a",
  });
}

/**
 * 喷气 / 火箭尾焰粒子（从背后喷嘴向下喷）
 */
export function spawnJetExhaust(particles, x, y, styleKey = "jetpack", opts = {}) {
  const st = styleOf(styleKey);
  const n = opts.count || 3;
  for (let i = 0; i < n; i += 1) {
    particles.push({
      kind: "wingtrail",
      x: x + (i % 2 === 0 ? -3 : 3) + (Math.random() - 0.5) * 2,
      y: y + Math.random() * 2,
      vx: (Math.random() - 0.5) * 12,
      vy: 40 + Math.random() * 50,
      life: 0.28 + Math.random() * 0.2,
      max: 0.5,
      color: st.trail[i % st.trail.length],
      size: styleKey === "rocket" ? 3 : 2,
    });
  }
}

/**
 * 生成翅膀飞行尾迹粒子（推入数组）
 * particles: {x,y,vx,vy,life,max,color,size}[]
 */
export function spawnWingTrail(particles, x, y, styleKey, opts = {}) {
  if (styleKey === "jetpack" || styleKey === "rocket") {
    spawnJetExhaust(particles, x, y, styleKey, opts);
    return;
  }
  if (styleKey === "carpet" || styleKey === "ufo" || styleKey === "cloud") {
    // 坐骑：少量星屑从平台边缘飘出
    const st = styleOf(styleKey);
    const n = opts.count || 2;
    for (let i = 0; i < n; i += 1) {
      particles.push({
        kind: "wingtrail",
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 16,
        vy: -8 - Math.random() * 16,
        life: 0.4 + Math.random() * 0.2,
        max: 0.6,
        color: st.trail[i % st.trail.length],
        size: 2,
      });
    }
    return;
  }
  const st = styleOf(styleKey);
  const n = opts.count || 3;
  const dir = opts.dir || 1;
  for (let i = 0; i < n; i += 1) {
    const c = st.trail[i % st.trail.length];
    particles.push({
      kind: "wingtrail",
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * 20 - dir * 30,
      vy: (Math.random() - 0.5) * 16 - (styleKey === "mech" ? 40 : 10),
      life: 0.35 + Math.random() * 0.25,
      max: 0.55,
      color: c,
      size: styleKey === "demon" ? 3 : 2,
    });
  }
}

/** 用原生 canvas ctx 适配 plot（赛车等） */
export function plotFromCtx(ctx) {
  return (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  };
}
