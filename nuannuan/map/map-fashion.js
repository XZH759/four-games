/**
 * Fashion Town · Boutique level map mode
 */
import {
  BOUTIQUES,
  getBoutique,
  setActiveBoutique,
  getActiveBoutiqueId,
  boutiqueProgress,
  MODULE_LABEL_KEYS,
  getUnlockedModules,
} from "/js/nuannuan/fashion-town.js";
import { getCompanion, localizeCompanion } from "/js/nuannuan/companion-config.js";

export function resolveMapBoutiqueId() {
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get("boutique");
  if (fromUrl && getBoutique(fromUrl)) return fromUrl;
  const saved = getActiveBoutiqueId();
  if (saved && getBoutique(saved)) return saved;
  return null;
}

export function isFashionMapMode() {
  return Boolean(resolveMapBoutiqueId());
}

export function moduleForLevel(levelId, boutique) {
  if (!boutique?.modules?.length) return null;
  const idx = (levelId - 1) % boutique.modules.length;
  return boutique.modules[idx];
}

export function mountFashionMap(ctx) {
  const { state, els, t, getLang } = ctx;
  const boutique = getBoutique(state.boutiqueId);
  if (!boutique) return;

  setActiveBoutique(boutique.id);
  document.body.classList.add("is-fashion-map");
  document.body.dataset.boutiqueTone = boutique.tone;

  const journey = document.getElementById("ft-journey-flow");
  if (journey) journey.hidden = false;

  if (els.back) {
    els.back.href = `/nuannuan/town?boutique=${encodeURIComponent(boutique.id)}`;
    els.back.dataset.i18n = "map.ft.backTown";
    els.back.setAttribute("aria-label", t("map.ft.backTown"));
  }
  if (els.h1) els.h1.textContent = t(boutique.nameKey);
  if (els.sub) els.sub.textContent = t("map.ft.sub", { tagline: t(boutique.taglineKey) });

  const bar = document.getElementById("ft-boutique-bar");
  if (bar) {
    bar.hidden = false;
    const companion = localizeCompanion(getCompanion(boutique.companionId), getLang());
    bar.innerHTML = `
      <img src="${boutique.buildingArt}" alt="" width="40" height="40" loading="lazy" />
      <div class="ft-boutique-copy">
        <strong>${t(boutique.nameKey)}</strong>
        <small>${t("map.ft.rolePath", { role: t(`town.fashionRole.${boutique.fashionRole}`) })}</small>
      </div>
      ${
        companion?.portrait
          ? `<img class="ft-boutique-companion" src="${companion.portrait}" alt="" width="36" height="36" loading="lazy" title="${t("map.ft.recommendedCompanion")}" />`
          : ""
      }`;
  }

  document.querySelectorAll("#ft-journey-flow .flow-icon").forEach((node, i) => {
    node.dataset.step = String(i + 1);
  });
}

export function paintFashionModules(ctx) {
  const { state, els, t } = ctx;
  const boutique = getBoutique(state.boutiqueId);
  if (!boutique || !els.modulePanel) return;

  const unlocked = new Set(getUnlockedModules(boutique.id));
  const prog = boutiqueProgress(boutique.id);
  els.modulePanel.innerHTML = `
    <h2>${t("map.ft.modulesTitle")}</h2>
    <p class="module-progress-line">${t("map.ft.modulesProgress", { n: prog.unlocked, total: prog.total })}</p>
    <div class="module-chips">
      ${boutique.modules
        .map((mod) => {
          const done = unlocked.has(mod);
          return `<span class="module-chip${done ? " is-unlocked" : ""}">${t(MODULE_LABEL_KEYS[mod])}</span>`;
        })
        .join("")}
    </div>`;
}

export function fashionModuleLabel(levelId, boutique, t) {
  const mod = moduleForLevel(levelId, boutique);
  if (!mod) return "";
  return t(MODULE_LABEL_KEYS[mod]);
}
