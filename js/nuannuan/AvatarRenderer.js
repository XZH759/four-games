/**
 * 统一 AvatarRenderer（中央立绘 / 性别卡 / 体型卡 / 套装卡共用）
 * - 优先加载 manifest WebP 图层
 * - 仅在图层全部缺失时回退 SVG（开发 fallback）
 * - 切换时保留旧画面，预加载完成后交叉淡化，避免闪白
 * - 禁止 CSS scaleX / 非等比拉伸
 */
import { resolveAvatarLayers, AVATAR_LAYER_ORDER, AVATAR_PLACEHOLDER_NOTE } from "./avatar-manifest.js";
import { buildAvatarSVG } from "./avatar-preview.js";

const CROSSFADE_MS = 220;

function preloadImages(urls) {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ url, ok: true, img });
          img.onerror = () => resolve({ url, ok: false, img: null });
          img.src = url;
        }),
    ),
  );
}

function ensureStage(host, alt) {
  let stage = host.querySelector(".avatar-stage");
  if (!stage) {
    host.innerHTML = "";
    stage = document.createElement("div");
    stage.className = "avatar-stage";
    stage.setAttribute("role", "img");
    host.appendChild(stage);
  }
  stage.setAttribute("aria-label", alt);
  return stage;
}

function buildLayerStack(layers, results) {
  const next = document.createElement("div");
  next.className = "avatar-stack is-entering";
  AVATAR_LAYER_ORDER.forEach((key) => {
    const src = layers[key];
    if (!src) return;
    const hit = results.find((r) => r.url === src);
    if (!hit?.ok) return;
    const img = document.createElement("img");
    img.className = `avatar-layer avatar-layer--${key}`;
    img.src = src;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.draggable = false;
    img.decoding = "async";
    next.appendChild(img);
  });
  return next;
}

function swapStacks(stage, next, reduce) {
  const old = stage.querySelector(".avatar-stack:not(.is-entering):not(.is-leaving)")
    || stage.querySelector(".avatar-stack");
  // 若 next 已在 stage 中则不再重复 append
  if (next.parentNode !== stage) stage.appendChild(next);

  requestAnimationFrame(() => {
    next.classList.remove("is-entering");
    if (old && old !== next) {
      if (reduce) {
        old.remove();
      } else {
        old.classList.add("is-leaving");
        setTimeout(() => old.remove(), CROSSFADE_MS);
      }
    }
  });
}

/**
 * @param {HTMLElement} host
 * @param {object} config
 * @param {{ uid?: string, alt?: string, compact?: boolean, showBadge?: boolean, allowSvgFallback?: boolean }} [opts]
 */
export async function renderAvatar(host, config, opts = {}) {
  if (!host) return { placeholder: true };
  const uid = opts.uid || "main";
  const alt = opts.alt || "当前角色预览";
  const showBadge = opts.showBadge === true;
  const allowSvgFallback = opts.allowSvgFallback !== false;

  const token = (host._avatarToken = (host._avatarToken || 0) + 1);
  const layers = resolveAvatarLayers(config);
  const urls = Object.values(layers).filter(Boolean);
  const stage = ensureStage(host, alt);

  host.classList.add("is-loading");
  host.dataset.loading = "1";

  const results = await preloadImages(urls);
  if (host._avatarToken !== token) return { placeholder: host.dataset.placeholder === "1" };

  const okCount = results.filter((r) => r.ok).length;
  const requiredKeys = ["bodyBase", "faceBase", "hairFront", "outfitMain"];
  const requiredOk = requiredKeys.every((k) => {
    const src = layers[k];
    return src && results.some((r) => r.url === src && r.ok);
  });
  const useAssets = requiredOk && okCount >= 4;

  let next;
  if (useAssets) {
    next = buildLayerStack(layers, results);
    host.dataset.placeholder = "0";
    stage.querySelector(".placeholder-badge")?.remove();
  } else if (allowSvgFallback) {
    next = document.createElement("div");
    next.className = "avatar-stack is-entering";
    next.innerHTML = buildAvatarSVG(config, uid);
    host.dataset.placeholder = "1";
    if (showBadge) {
      let badge = stage.querySelector(".placeholder-badge");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "placeholder-badge";
        badge.textContent = "占位预览";
        badge.title = AVATAR_PLACEHOLDER_NOTE;
        stage.appendChild(badge);
      }
    }
    if (typeof console !== "undefined" && console.info) {
      console.info("[AvatarRenderer] WebP 图层不足，使用 SVG fallback", {
        okCount,
        missing: results.filter((r) => !r.ok).map((r) => r.url),
      });
    }
  } else {
    host.classList.remove("is-loading");
    host.dataset.loading = "0";
    return { placeholder: true, missing: true };
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  swapStacks(stage, next, reduce);

  host.classList.remove("is-loading");
  host.dataset.loading = "0";
  return { placeholder: host.dataset.placeholder === "1" };
}

/**
 * 缩略图也走同一异步渲染器（WebP 分层），避免中央与卡片两套人物。
 */
export function renderAvatarSync(host, config, uid = "thumb") {
  if (!host) return;
  // 保留旧画面，异步替换
  renderAvatar(host, config, {
    uid,
    alt: "角色缩略预览",
    compact: true,
    showBadge: false,
    allowSvgFallback: true,
  });
}

export default { renderAvatar, renderAvatarSync };
