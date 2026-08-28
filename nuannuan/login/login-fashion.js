/**
 * Fashion Town · Build Explorer mode for /nuannuan/login?from=town&boutique=:id
 */
import {
  BOUTIQUES,
  MODULE_LABEL_KEYS,
  getBoutique,
  setActiveBoutique,
  getActiveBoutiqueId,
} from "/js/nuannuan/fashion-town.js";
import { getCompanion, localizeCompanion } from "/js/nuannuan/companion-config.js";
import {
  createDefaultSelection,
  getAssetIndexSync,
  getAssetsForLayer,
  getAssetUrl,
  getAssetsByIdSync,
  labelForAsset,
  loadAssetIndex,
} from "/js/nuannuan/character-assets.js";

export const FASHION_TABS = [
  { id: "hair", labelKey: "login.ft.mod.hair", layers: ["hairBack", "hairFront"] },
  { id: "outfit", labelKey: "login.ft.mod.outfit", layers: ["outfit"] },
  { id: "skirt", labelKey: "login.ft.mod.skirt", gap: true },
  { id: "shoes", labelKey: "login.ft.mod.shoes", gap: true },
  { id: "accessory", labelKey: "login.ft.mod.accessory", loginModule: "accessory" },
  { id: "palette", labelKey: "login.ft.mod.palette", loginModule: "theme" },
];

export const MOOD_KEYS = ["soft", "dreamy", "classic", "vibrant"];

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

function companionFor(boutique, lang) {
  return localizeCompanion(getCompanion(boutique?.companionId), lang);
}

function layerHasAssets(layer, gender) {
  const index = getAssetIndexSync();
  if (!index) return false;
  return getAssetsForLayer(index, gender, layer).length > 0;
}

function tabHasRealOptions(tab, gender) {
  if (tab.gap) return false;
  if (tab.loginModule) return true;
  if (!tab.layers?.length) return false;
  return tab.layers.some((layer) => layerHasAssets(layer, gender));
}

export async function bootstrapFashionAssets(state) {
  try {
    await loadAssetIndex();
    if (!state.layerSelection) {
      state.layerSelection = createDefaultSelection(getAssetIndexSync(), state.gender);
    }
    state.assetsReady = true;
  } catch {
    state.assetsReady = false;
    state.layerSelection = null;
  }
}

export function fashionPreviewConfig(state) {
  const base = { gender: state.gender };
  if (state.assetsReady && state.layerSelection) {
    return {
      ...base,
      selection: { ...state.layerSelection },
      referenceSheet: null,
    };
  }
  return {
    ...base,
    selection: null,
    referenceSheet: state.referenceSheet,
  };
}

export function mountFashionTown(ctx) {
  const {
    state,
    els,
    t,
    getLang,
    applySelection,
    paintPreview,
    paintModules,
    paintThemePicker,
    persist,
    snapshot,
    resolveAccessoryOverlays,
    currentPack,
  } = ctx;

  const ft = {
    journeyFlow: document.getElementById("ft-journey-flow"),
    moodTabs: document.getElementById("ft-mood-tabs"),
    gapNote: document.getElementById("ft-gap-note"),
    companionStage: document.getElementById("ft-companion-stage"),
    companionName: document.getElementById("ft-companion-name"),
    companionSummary: document.getElementById("ft-companion-summary"),
    modulePreview: document.getElementById("ft-module-preview"),
    rotateBtn: document.getElementById("ft-rotate"),
    randomLook: document.getElementById("ft-random-look"),
    placeholderNote: document.getElementById("ft-layer-note"),
  };

  state.townMode = true;
  state.boutiqueId = resolveTownBoutiqueId();
  state.fashionRole = getBoutique(state.boutiqueId)?.fashionRole || null;
  state.ftTab = state.ftTab || "hair";
  state.mood = state.mood || "soft";
  state.rotateDeg = state.rotateDeg || 0;

  document.body.classList.add("is-fashion-town");
  if (ft.journeyFlow) ft.journeyFlow.hidden = false;
  document.getElementById("ft-companion-preview")?.removeAttribute("hidden");
  document.getElementById("ft-mood-tabs")?.removeAttribute("hidden");
  document.getElementById("ft-stage-tools")?.removeAttribute("hidden");
  document.getElementById("ft-path-note")?.removeAttribute("hidden");

  const boutique = getBoutique(state.boutiqueId);
  if (boutique) {
    setActiveBoutique(boutique.id);
    if (boutique.role !== state.role) {
      state.role = boutique.role;
    }
  }

  if (els.sysBack) {
    els.sysBack.href = state.boutiqueId
      ? `/nuannuan/town?boutique=${encodeURIComponent(state.boutiqueId)}`
      : "/nuannuan/town";
    els.sysBack.dataset.i18n = "login.ft.backTown";
    els.sysBack.textContent = t("login.ft.backTown");
  }
  if (els.confirm) {
    els.confirm.dataset.i18n = "login.ft.startChallenge";
    els.confirm.textContent = t("login.ft.startChallenge");
  }
  if (els.selectTitle) els.selectTitle.dataset.i18n = "login.ft.boutiqueTitle";
  if (els.selectLead) els.selectLead.dataset.i18n = "login.ft.boutiqueLead";
  if (els.detailTitle) els.detailTitle.dataset.i18n = "login.ft.companionTitle";
  if (els.detailSub) els.detailSub.dataset.i18n = "login.ft.companionLead";

  paintBoutiquePaths();
  paintCompanionPanel();
  paintFashionTabs();
  paintMoodTabs();
  paintGapNote();
  applyRotate();

  ft.rotateBtn?.addEventListener("click", () => {
    state.rotateDeg = (state.rotateDeg + 90) % 360;
    applyRotate();
  });

  ft.randomLook?.addEventListener("click", () => {
    els.random?.click();
  });

  function applyRotate() {
    const stage = document.getElementById("stage");
    if (stage) stage.style.setProperty("--ft-rotate", `${state.rotateDeg}deg`);
  }

  function paintBoutiquePaths() {
    if (!els.roleList) return;
    const genderBlock = els.genderList?.closest(".panel-select");
    els.genderList?.previousElementSibling?.classList.add("ft-hidden-section");
    els.genderList?.classList.add("ft-hidden-section");
    els.random?.classList.add("ft-hidden-section");

    els.roleList.innerHTML = "";
    els.roleList.setAttribute("aria-label", t("login.ft.boutiquePaths"));

    BOUTIQUES.forEach((item) => {
      const on = state.boutiqueId === item.id;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `choice role-card ft-path-card${on ? " is-on" : ""}`;
      btn.dataset.boutique = item.id;
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.innerHTML = `
        <span class="ft-path-art">
          <img src="${item.buildingArt}" alt="" loading="lazy" />
          <span class="ft-path-todo">${t("town.boutiqueArtTodo")}</span>
        </span>
        <span class="role-copy">
          <strong>${t(`town.fashionRole.${item.fashionRole}`)}</strong>
          <small>${t(item.nameKey)}</small>
        </span>
        ${on ? `<span class="role-check" aria-hidden="true"></span>` : ""}`;
      btn.addEventListener("click", async () => {
        if (on) return;
        state.boutiqueId = item.id;
        state.fashionRole = item.fashionRole;
        setActiveBoutique(item.id);
        await applySelection(
          { role: item.role },
          { message: t("login.ft.toast.path", { name: t(item.nameKey) }) },
        );
        paintBoutiquePaths();
        paintCompanionPanel();
        paintModulePreview();
        persist();
      });
      els.roleList.appendChild(btn);
    });

    const note = document.getElementById("ft-path-note");
    if (note) note.textContent = t("login.ft.pathNote");
  }

  function paintCompanionPanel() {
    const boutique = getBoutique(state.boutiqueId);
    const companion = companionFor(boutique, getLang());
    if (ft.companionStage && companion?.stage) {
      ft.companionStage.innerHTML = `<img src="${companion.stage}" alt="" loading="lazy" />`;
    }
    if (ft.companionName) {
      ft.companionName.textContent = companion?.name || "—";
    }
    if (ft.companionSummary) {
      ft.companionSummary.textContent = companion?.summary || companion?.intro || "";
    }
    paintModulePreview();
  }

  function paintModulePreview() {
    if (!ft.modulePreview) return;
    const boutique = getBoutique(state.boutiqueId);
    if (!boutique) {
      ft.modulePreview.replaceChildren();
      return;
    }
    ft.modulePreview.replaceChildren(
      ...boutique.modules.map((mod) => {
        const chip = document.createElement("span");
        chip.className = "ft-module-chip";
        chip.textContent = t(MODULE_LABEL_KEYS[mod]);
        return chip;
      }),
    );
  }

  function paintFashionTabs() {
    if (!els.moduleDock) return;
    els.moduleDock.innerHTML = "";
    els.moduleDock.setAttribute("aria-label", t("login.ft.customizeTabs"));
    FASHION_TABS.forEach((tab) => {
      const btn = document.createElement("button");
      const on = state.ftTab === tab.id;
      const hasOptions = tabHasRealOptions(tab, state.gender);
      btn.type = "button";
      btn.className = `module-btn ft-tab${on ? " is-on" : ""}${tab.gap ? " is-gap" : ""}${!hasOptions && !tab.gap ? " is-disabled" : ""}`;
      btn.dataset.module = tab.loginModule || tab.id;
      btn.dataset.ftTab = tab.id;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.disabled = !hasOptions && !tab.gap && tab.id !== "outfit";
      btn.innerHTML = `<span class="module-ico ft-tab-ico" aria-hidden="true"></span><small data-i18n="${tab.labelKey}">${t(tab.labelKey)}</small>`;
      btn.addEventListener("click", () => {
        state.ftTab = tab.id;
        if (tab.loginModule) {
          state.module = tab.loginModule;
        } else if (tab.id === "hair" || tab.id === "outfit") {
          state.module = tab.id;
        } else {
          state.module = tab.id;
        }
        paintFashionTabs();
        paintGapNote();
        paintLayerPicker();
        paintModules();
      });
      els.moduleDock.appendChild(btn);
    });
    paintLayerPicker();
  }

  function paintMoodTabs() {
    if (!ft.moodTabs) return;
    ft.moodTabs.replaceChildren(
      ...MOOD_KEYS.map((mood) => {
        const btn = document.createElement("button");
        const on = state.mood === mood;
        btn.type = "button";
        btn.className = `ft-mood${on ? " is-on" : ""}`;
        btn.dataset.mood = mood;
        btn.textContent = t(`login.ft.mood.${mood}`);
        btn.addEventListener("click", () => {
          state.mood = mood;
          const pack = currentPack();
          const keyword = pack?.keywords?.[MOOD_KEYS.indexOf(mood)] || pack?.keywords?.[0];
          if (keyword) {
            state.theme.keywordId = keyword.id;
            persist();
            paintThemePicker();
            void paintPreview();
          }
          paintMoodTabs();
        });
        return btn;
      }),
    );
  }

  function paintGapNote() {
    const tab = FASHION_TABS.find((item) => item.id === state.ftTab);
    if (!ft.gapNote) return;
    if (tab?.gap) {
      ft.gapNote.hidden = false;
      ft.gapNote.textContent = t("login.ft.gapLayer", { slot: t(tab.labelKey) });
    } else {
      ft.gapNote.hidden = true;
    }
  }

  function currentLayerLabel(layer) {
    const id = state.layerSelection?.[layer];
    if (!id) return t("login.ft.none");
    return labelForAsset(getAssetsByIdSync().get(id)) || t("login.ft.none");
  }

  function paintLayerPicker() {
    const tab = FASHION_TABS.find((item) => item.id === state.ftTab);
    if (!tab || tab.gap || tab.loginModule) return;
    if (!state.assetsReady || !state.layerSelection) {
      if (ft.placeholderNote) {
        ft.placeholderNote.hidden = false;
        ft.placeholderNote.textContent = t("login.ft.assetsLoading");
      }
      return;
    }

    els.themePicker.hidden = false;
    els.themePickerTitle.textContent = t(tab.labelKey);
    els.themePickerSub.textContent = t("login.ft.layerPickerSub");
    els.themePickerSheet.hidden = true;

    const primary = tab.layers[0];
    const assets = getAssetsForLayer(getAssetIndexSync(), state.gender, primary);
    els.themePickerList.innerHTML = "";

    assets.slice(0, 8).forEach((asset) => {
      const selected =
        tab.id === "hair"
          ? state.layerSelection.hairBack === asset.asset_id
          : state.layerSelection[primary] === asset.asset_id;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `theme-opt ft-layer-opt${selected ? " is-on" : ""}`;
      btn.innerHTML = `
        <span class="theme-opt__glyph"><img src="${getAssetUrl(asset)}" alt="" /></span>
        <span class="theme-opt__copy"><strong>${labelForAsset(asset)}</strong></span>`;
      btn.addEventListener("click", async () => {
        const index = getAssetIndexSync();
        if (!index || !state.layerSelection) return;
        if (tab.id === "hair") {
          const backs = getAssetsForLayer(index, state.gender, "hairBack");
          const fronts = getAssetsForLayer(index, state.gender, "hairFront");
          const back = backs.find((a) => a.asset_id === asset.asset_id) || asset;
          const front = fronts.find((a) => a.variant === back.variant) || fronts[0];
          state.layerSelection = {
            ...state.layerSelection,
            hairBack: back.asset_id,
            hairFront: front?.asset_id || state.layerSelection.hairFront,
          };
        } else {
          state.layerSelection = { ...state.layerSelection, [primary]: asset.asset_id };
        }
        persist();
        paintLayerPicker();
        await paintPreview();
      });
      els.themePickerList.appendChild(btn);
    });

    const focused = tab.id === "hair" ? currentLayerLabel("hairFront") : currentLayerLabel(primary);
    els.themePickerDesc.textContent = t("login.ft.currentLayer", { name: focused });
    els.themePickerStats.innerHTML = "";

    if (ft.placeholderNote) {
      if (tab.id === "outfit") {
        ft.placeholderNote.hidden = false;
        ft.placeholderNote.textContent = t("login.ft.outfitBundleNote");
      } else {
        ft.placeholderNote.hidden = false;
        ft.placeholderNote.textContent = t("login.ft.layerNote");
      }
    }
  }

  ctx.paintFashionTown = () => {
    paintBoutiquePaths();
    paintCompanionPanel();
    paintFashionTabs();
    paintMoodTabs();
    paintGapNote();
  };
  ctx.paintLayerPicker = paintLayerPicker;

  return { ...ft, paintLayerPicker };
}
