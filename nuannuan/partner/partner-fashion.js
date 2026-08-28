/**
 * Fashion Town · Choose Companion mode
 */
import {
  BOUTIQUES,
  getBoutique,
  setActiveBoutique,
  getActiveBoutiqueId,
} from "/js/nuannuan/fashion-town.js";
import { getCompanion } from "/js/nuannuan/companion-config.js";

export function isFashionTownMode() {
  return new URLSearchParams(location.search).get("from") === "town";
}

export function resolveTownBoutiqueId() {
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get("boutique");
  if (fromUrl && getBoutique(fromUrl)) return fromUrl;
  const saved = getActiveBoutiqueId();
  if (saved) return saved;
  return BOUTIQUES[0]?.id || null;
}

export function recommendedCompanionId(boutiqueId) {
  return getBoutique(boutiqueId)?.companionId || null;
}

export function mountFashionTownPartner(ctx) {
  const { state, els, t } = ctx;
  state.townMode = true;
  state.boutiqueId = resolveTownBoutiqueId();
  if (state.boutiqueId) setActiveBoutique(state.boutiqueId);

  const boutique = getBoutique(state.boutiqueId);
  state.recommendedId = recommendedCompanionId(state.boutiqueId);

  document.body.classList.add("is-fashion-town");
  document.body.classList.remove("pixel-page");
  document.querySelector(".terra-mosaic")?.setAttribute("hidden", "");

  const journey = document.getElementById("ft-journey-flow");
  if (journey) journey.hidden = false;

  const bar = document.getElementById("ft-boutique-bar");
  if (bar && boutique) {
    bar.hidden = false;
    bar.innerHTML = `
      <img src="${boutique.buildingArt}" alt="" width="36" height="36" loading="lazy" />
      <span><strong>${t(boutique.nameKey)}</strong><small>${t("partner.ft.boutiqueActive")}</small></span>`;
  }

  if (els.back) {
    const q = new URLSearchParams({ from: "town" });
    if (state.boutiqueId) q.set("boutique", state.boutiqueId);
    els.back.href = `/nuannuan/login?${q}`;
    els.back.dataset.i18n = "partner.ft.backExplorer";
    els.back.textContent = t("partner.ft.backExplorer");
  }

  if (els.sub) els.sub.textContent = t("partner.ft.sub");
  if (els.h1) els.h1.textContent = t("partner.ft.h1");
  if (els.notice) els.notice.textContent = t("partner.ft.notice");

  document.querySelectorAll("#ft-journey-flow .flow-icon").forEach((node, i) => {
    node.dataset.step = String(i + 1);
  });
}

export function loginRedirectUrl(boutiqueId) {
  const q = new URLSearchParams({ from: "town" });
  if (boutiqueId) q.set("boutique", boutiqueId);
  return `/nuannuan/login?${q}`;
}
