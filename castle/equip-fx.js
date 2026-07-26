/**
 * 装备试装 / 实装 · 运动与特效解析（泰拉式挂点）
 *
 * 飞行源互斥（装饰槽）：
 * - wings   背后双翼振翅
 * - jetpack 背后喷气/火箭推进
 * - mount   坐上飞毯 / 云朵 / UFO 悬浮
 * - balloon 手持气球浮空
 */

/** @typedef {"wing"|"balloon"|null} FlightMode */
/** @typedef {"wings"|"jetpack"|"mount"|"balloon"|null} FlightKind */

export const MOUNT_STYLES = new Set(["carpet", "ufo", "cloud"]);
export const JETPACK_STYLES = new Set(["jetpack", "rocket"]);
export const WING_FLIGHT_STYLES = new Set(["feather", "angel", "mech", "demon", "butterfly"]);
/** 环绕型特效：绕角色浮动，而非脚后拖尾 */
export const ORBIT_TRAIL_STYLES = new Set(["leaf", "bubble"]);
/** 绽放型特效：在角色周围炸开（烟花） */
export const BLOOM_TRAIL_STYLES = new Set(["fireworks"]);

const FLY_LABELS = {
  feather: "羽翼飞行",
  angel: "天使飞行",
  mech: "机械振翅",
  demon: "魔翼滑翔",
  butterfly: "蝶翼飞舞",
  cloud: "云朵巡航",
  jetpack: "喷气推进",
  rocket: "火箭推进",
  carpet: "飞毯巡航",
  ufo: "飞碟巡航",
};

export function resolveFlightKind(wingStyle, balloon = false) {
  if (balloon) return "balloon";
  if (!wingStyle) return null;
  if (MOUNT_STYLES.has(wingStyle)) return "mount";
  if (JETPACK_STYLES.has(wingStyle)) return "jetpack";
  return "wings";
}

export function isOrbitTrail(styleKey) {
  return ORBIT_TRAIL_STYLES.has(styleKey);
}

export function isBloomTrail(styleKey) {
  return BLOOM_TRAIL_STYLES.has(styleKey);
}

/**
 * 从 loadout 解析装备能力（静态元数据）
 * @param {object} load getEquippedLoadout / buildTryOnLoadout 结果
 */
export function getEquipCapabilities(load) {
  const balloon = !!load?.parts?.balloon;
  const wingStyle = load?.parts?.wings
    ? (load?.wingStyle || "feather")
    : null;
  const flightKind = resolveFlightKind(wingStyle, balloon);
  const flightMode = balloon ? "balloon" : wingStyle ? "wing" : null;
  return {
    flightMode, /** @type {FlightMode} */
    flightKind, /** @type {FlightKind} */
    canFly: !!flightKind,
    wingStyle: wingStyle || (flightMode === "wing" ? "feather" : null),
    isMount: flightKind === "mount",
    isJetpack: flightKind === "jetpack",
    isWings: flightKind === "wings",
    hasCape: !!load?.parts?.cape,
    hasCrown: !!load?.parts?.crown,
    hasHelmet: !!load?.parts?.helmet,
    hasGoggles: !!load?.parts?.goggles,
    hasHat: !!load?.parts?.hat,
    hasLuck: !!load?.parts?.luck,
    hasNecklace: !!load?.parts?.necklace,
    hasPendant: !!load?.parts?.pendant,
    headStyle: load?.headStyle || null,
    chestStyle: load?.chestStyle || null,
    hasTrail: !!load?.trailStyle,
    trailStyle: load?.trailStyle || null,
    trailOrbit: isOrbitTrail(load?.trailStyle),
    trailBloom: isBloomTrail(load?.trailStyle),
    petStyle: load?.petStyle || null,
    petMotion: load?.petMotion || null,
    decorStyle: load?.decorStyle || null,
  };
}

/**
 * 运行时动静特效状态
 */
export function resolveEquipFx(load, rt = {}) {
  const cap = getEquipCapabilities(load);
  const threshold = rt.speedThreshold ?? 280;
  const speedFly = rt.speed != null && Math.abs(rt.speed) > threshold;
  const intentFly = !!(
    rt.forceFly
    || rt.pose === "fly"
    || rt.burst
    || rt.boost
    || speedFly
  );
  const flying = !!(cap.canFly && intentFly && !rt.fall);
  const idle = !flying;

  // 坐骑 / 气球：直立悬浮；喷气：微前倾；双翼：明显前倾推进
  const floaty = cap.flightKind === "balloon" || cap.flightKind === "mount";
  const sitPose = !!(flying && cap.isMount);

  let bodyTilt = 0;
  let bodyLift = 0;
  let bobAmp = 1;
  let bobSpeed = 3;
  if (flying) {
    if (cap.flightKind === "mount") {
      bodyTilt = -2;
      // UFO 坐进舱：抬升少一点让碟盘盖住下半身；云/毯站在平台上抬更高
      bodyLift = cap.wingStyle === "ufo" ? 8 : 14;
      bobAmp = 4.5;
      bobSpeed = 2.0;
    } else if (cap.flightKind === "balloon") {
      bodyTilt = -3;
      bodyLift = 8;
      bobAmp = 5;
      bobSpeed = 2.2;
    } else if (cap.flightKind === "jetpack") {
      bodyTilt = -6;
      bodyLift = 5;
      bobAmp = 2.2;
      bobSpeed = 5;
    } else {
      bodyTilt = -12;
      bodyLift = 3;
      bobAmp = 2.5;
      bobSpeed = 6;
    }
  }

  const capeWind = !cap.hasCape
    ? 0
    : flying
      ? (floaty ? 0.5 : cap.isJetpack ? 1.4 : 1.8)
      : 1;

  const flyLabel = !cap.canFly
    ? null
    : cap.flightKind === "balloon"
      ? "气球浮空"
      : (FLY_LABELS[cap.wingStyle] || "飞行");

  const idleLabel = !cap.canFly
    ? "静态"
    : cap.flightKind === "balloon"
      ? "气球待机"
      : cap.isMount
        ? "坐骑待机"
        : cap.isJetpack
          ? "喷气待机"
          : "振翅待机";

  let flightFx = null;
  if (flying) {
    if (cap.flightKind === "balloon") flightFx = "confetti";
    else if (cap.isJetpack || cap.wingStyle === "mech") flightFx = "jet";
    else if (cap.wingStyle === "demon") flightFx = "shadow";
    else if (cap.isMount) flightFx = "sparkle";
    else flightFx = "sparkle";
  }

  return {
    ...cap,
    flying,
    idle,
    floaty,
    sitPose,
    bodyTilt,
    bodyLift,
    bobAmp,
    bobSpeed,
    capeWind,
    flyLabel,
    idleLabel,
    flightFx,
  };
}

/** 装扮台飞行按钮文案 */
export function poseLabelsForLoad(load) {
  const fx = resolveEquipFx(load, { pose: "idle" });
  return {
    canFly: fx.canFly,
    idle: fx.idleLabel || "静态",
    fly: fx.flyLabel || "飞行",
    flightMode: fx.flightMode,
    flightKind: fx.flightKind,
  };
}
