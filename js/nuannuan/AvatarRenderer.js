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

function buildOverlayLayer(overlays, { draggable = false, onPlace = null } = {}) {
  if (!overlays?.length) return null;
  const layer = document.createElement("div");
  layer.className = "avatar-accessory-layer";
  overlays.forEach((item, index) => {
    const wrap = document.createElement("span");
    wrap.className = `avatar-acc avatar-acc--${item.slot || "chest"}`;
    if (item.slot === "neck" || item.slot === "chest" || item.placement) {
      wrap.classList.add("avatar-acc--pendant");
    }
    if (draggable && item.movable !== false) {
      wrap.classList.add("is-movable");
      wrap.title = `${item.name || "配饰"} · 拖动调整位置`;
      wrap.setAttribute("role", "button");
      wrap.setAttribute("aria-label", `${item.name || "配饰"}，可拖动调整位置`);
      wrap.tabIndex = 0;
    }
    wrap.dataset.accId = item.id;
    wrap.style.zIndex = String(20 + index);
    const place = item.placement;
    if (place) {
      if (place.top) wrap.style.top = place.top;
      if (place.left) wrap.style.left = place.left;
      if (place.width) wrap.style.width = place.width;
    }
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = "";
    img.draggable = false;
    img.decoding = "async";
    wrap.appendChild(img);
    requestAnimationFrame(() => wrap.classList.add("is-on"));
    if (draggable && item.movable !== false) {
      enableAccessoryDrag(wrap, layer, onPlace);
    }
    layer.appendChild(wrap);
  });
  return layer;
}

function enableAccessoryDrag(wrap, layer, onPlace) {
  let dragging = false;
  let moved = false;
  let pointerId = null;

  const toPercent = (clientX, clientY) => {
    const rect = layer.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const left = ((clientX - rect.left) / rect.width) * 100;
    const top = ((clientY - rect.top) / rect.height) * 100;
    return {
      left: Math.min(94, Math.max(6, left)),
      top: Math.min(88, Math.max(4, top)),
    };
  };

  const applyPos = (pos) => {
    wrap.style.left = `${pos.left}%`;
    wrap.style.top = `${pos.top}%`;
  };

  const onPointerDown = (event) => {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    dragging = true;
    moved = false;
    pointerId = event.pointerId;
    wrap.classList.add("is-dragging");
    wrap.setPointerCapture?.(pointerId);
    const pos = toPercent(event.clientX, event.clientY);
    if (pos) applyPos(pos);
  };

  const onPointerMove = (event) => {
    if (!dragging || (pointerId != null && event.pointerId !== pointerId)) return;
    event.preventDefault();
    moved = true;
    const pos = toPercent(event.clientX, event.clientY);
    if (pos) applyPos(pos);
  };

  const endDrag = (event) => {
    if (!dragging) return;
    if (pointerId != null && event.pointerId !== pointerId) return;
    dragging = false;
    wrap.classList.remove("is-dragging");
    try {
      wrap.releasePointerCapture?.(pointerId);
    } catch {
      /* ignore */
    }
    pointerId = null;
    if (!moved) return;
    const pos = toPercent(event.clientX, event.clientY);
    if (!pos) return;
    applyPos(pos);
    const width = parseFloat(wrap.style.width) || undefined;
    onPlace?.({
      id: wrap.dataset.accId,
      left: pos.left,
      top: pos.top,
      ...(Number.isFinite(width) ? { width } : {}),
    });
  };

  wrap.addEventListener("pointerdown", onPointerDown);
  wrap.addEventListener("pointermove", onPointerMove);
  wrap.addEventListener("pointerup", endDrag);
  wrap.addEventListener("pointercancel", endDrag);
}

function attachOverlays(stack, overlays, dragOpts) {
  const layer = buildOverlayLayer(overlays, dragOpts);
  if (layer) stack.appendChild(layer);
  return stack;
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
  const overlays = Array.isArray(config?.accessoryOverlays) ? config.accessoryOverlays : [];
  const dragOpts = {
    draggable: Boolean(opts.draggableAccessories),
    onPlace: typeof opts.onAccessoryPlace === "function" ? opts.onAccessoryPlace : null,
  };

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
      attachOverlays(next, overlays, dragOpts);
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
    attachOverlays(next, overlays, dragOpts);
    host.dataset.placeholder = "0";
    host.dataset.mode = useFixtures ? "fixtures" : "layered";
    stage.querySelector(".placeholder-badge")?.remove();
  } else if (allowSvgFallback && !useFixtures) {
    next = document.createElement("div");
    next.className = "avatar-stack is-entering";
    next.innerHTML = buildAvatarSVG(config, uid);
    attachOverlays(next, overlays, dragOpts);
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
