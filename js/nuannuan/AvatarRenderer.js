/**
 * 统一 AvatarRenderer（art-contract）
 * - 唯一合成方式：aspect-ratio 容器 + 图层 absolute inset-0
 * - 层序来自 manifest zOrder；禁止 trimOffset / 逐层缩放平移
 * - ?fixtures=1 时用契约验收剪影
 */
import {
  resolveAvatarLayers,
  layerOrderFor,
  AVATAR_PLACEHOLDER_NOTE,
} from "./avatar-manifest.js";
import { buildAvatarSVG } from "./avatar-preview.js";
import { REQUIRED_LAYERS, preloadImages } from "./character-assets.js";

const CROSSFADE_MS = 220;

function ensureStage(host, alt) {
  let stage = host.querySelector(".avatar-stage");
  if (!stage) {
    host.innerHTML = "";
    stage = document.createElement("div");
    stage.className = "avatar-stage layered-character";
    stage.setAttribute("role", "img");
    host.appendChild(stage);
  }
  stage.setAttribute("aria-label", alt);
  return stage;
}

function buildLayerStack(layers, results, order) {
  const next = document.createElement("div");
  next.className = "avatar-stack is-entering";
  order.forEach((key, zIndex) => {
    const src = layers[key];
    if (!src) return;
    const hit = results.find((r) => r.url === src);
    if (!hit?.ok) return;
    const img = document.createElement("img");
    img.className = `avatar-layer layered-character__layer avatar-layer--${key}`;
    img.src = hit.objectUrl || src;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.draggable = false;
    img.decoding = "async";
    img.style.zIndex = String(zIndex);
    next.appendChild(img);
  });
  return next;
}

function swapStacks(stage, next, reduce) {
  const old =
    stage.querySelector(".avatar-stack:not(.is-entering):not(.is-leaving)") ||
    stage.querySelector(".avatar-stack");
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
  const useFixtures = Boolean(config?.useFixtures);

  const token = (host._avatarToken = (host._avatarToken || 0) + 1);
  const stage = ensureStage(host, alt);
  host.classList.add("is-loading");
  host.dataset.loading = "1";

  // fixtures 优先：契约验收，不走职业整图
  if (!useFixtures && config?.referenceSheet) {
    const results = await preloadImages([config.referenceSheet]);
    if (host._avatarToken !== token) return { placeholder: host.dataset.placeholder === "1" };
    if (results[0]?.ok) {
      const next = document.createElement("div");
      next.className = "avatar-stack is-entering is-reference-sheet";
      const img = document.createElement("img");
      img.className = "avatar-layer layered-character__layer avatar-layer--reference";
      img.src = config.referenceSheet;
      img.alt = "";
      img.draggable = false;
      img.decoding = "async";
      next.appendChild(img);
      host.dataset.placeholder = "0";
      host.dataset.mode = "reference-sheet";
      stage.querySelector(".placeholder-badge")?.remove();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      swapStacks(stage, next, reduce);
      host.classList.remove("is-loading");
      host.dataset.loading = "0";
      return { placeholder: false, mode: "reference-sheet" };
    }
  }

  const order = layerOrderFor(config);
  const layers = resolveAvatarLayers(config);
  const urls = Object.values(layers).filter(Boolean);
  const results = await preloadImages(urls);
  if (host._avatarToken !== token) return { placeholder: host.dataset.placeholder === "1" };

  const required = useFixtures ? ["body", "outfit", "hairFront"] : REQUIRED_LAYERS;
  const requiredOk = required.every((key) => {
    const src = layers[key];
    return src && results.some((r) => r.url === src && r.ok);
  });

  let next;
  if (requiredOk) {
    next = buildLayerStack(layers, results, order);
    host.dataset.placeholder = "0";
    host.dataset.mode = useFixtures ? "fixtures" : "layered";
    stage.querySelector(".placeholder-badge")?.remove();
  } else if (allowSvgFallback && !useFixtures) {
    next = document.createElement("div");
    next.className = "avatar-stack is-entering";
    next.innerHTML = buildAvatarSVG(config, uid);
    host.dataset.placeholder = "1";
    host.dataset.mode = "fallback";
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
  } else {
    host.classList.remove("is-loading");
    host.dataset.loading = "0";
    return { placeholder: true, missing: true };
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  swapStacks(stage, next, reduce);

  host.classList.remove("is-loading");
  host.dataset.loading = "0";
  return { placeholder: host.dataset.placeholder === "1", mode: host.dataset.mode };
}

export function renderAvatarSync(host, config, uid = "thumb") {
  if (!host) return;
  renderAvatar(host, config, {
    uid,
    alt: "角色缩略预览",
    compact: true,
    showBadge: false,
    allowSvgFallback: true,
  });
}

export default { renderAvatar, renderAvatarSync };
