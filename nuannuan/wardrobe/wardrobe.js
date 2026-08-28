/**
 * Fashion Town · Step 5 wardrobe / assemble outfit
 */
import { initI18n, applyDom, onLangChange, t, getLang } from "/js/i18n.js";
import { mountLobbyExit } from "/js/lobby-exit.js";
import { renderAvatar } from "/js/nuannuan/AvatarRenderer.js";
import { loadAssetIndex } from "/js/nuannuan/character-assets.js";
import { loadFinal } from "/js/nuannuan/avatar-config.js";
import {
  getBoutique,
  setActiveBoutique,
  getActiveBoutiqueId,
  WARDROBE_FILTERS,
  buildModuleInventory,
  totalUnlockableModules,
  computeStyleIdentity,
  saveLookEntry,
  getCompanionBond,
  invalidBoutiqueFromUrl,
} from "/js/nuannuan/fashion-town.js";
import {
  getCompanion,
  loadConfirmedCompanion,
  localizeCompanion,
} from "/js/nuannuan/companion-config.js";

const LOGIN_KEY = "nn_login_avatar_v1";
const DRAFT_KEY = "nn_wardrobe_draft_v1";

const ROLE_BONUS_KEYS = {
  researcher: "wardrobe.roleBonus.researcher",
  artist: "wardrobe.roleBonus.artist",
  engineer: "wardrobe.roleBonus.engineer",
  analyst: "wardrobe.roleBonus.analyst",
};

const INSPIRATION_KEYS = {
  researcher: "wardrobe.inspiration.researcher",
  artist: "wardrobe.inspiration.artist",
  engineer: "wardrobe.inspiration.engineer",
  analyst: "wardrobe.inspiration.analyst",
};

initI18n({ toggleHost: "#lang-host" });
mountLobbyExit({ href: "/nuannuan/town" });

const els = {
  bootError: document.getElementById("boot-error"),
  shell: document.getElementById("wr-shell"),
  empty: document.getElementById("wr-empty"),
  emptyCta: document.getElementById("wr-empty-cta"),
  backTown: document.getElementById("wr-back-town"),
  visitBoutique: document.getElementById("btn-visit-boutique"),
  inventoryCount: document.getElementById("wr-inventory-count"),
  filters: document.getElementById("wr-filters"),
  moduleGrid: document.getElementById("wr-module-grid"),
  avatar: document.getElementById("wr-avatar"),
  gapNote: document.getElementById("wr-gap-note"),
  draftChips: document.getElementById("wr-draft-chips"),
  lookName: document.getElementById("wr-look-name"),
  formError: document.getElementById("wr-form-error"),
  saveLook: document.getElementById("btn-save-look"),
  showPark: document.getElementById("btn-show-park"),
  styleScore: document.getElementById("wr-style-score"),
  styleRank: document.getElementById("wr-style-rank"),
  styleTags: document.getElementById("wr-style-tags"),
  inspiration: document.getElementById("wr-inspiration"),
  companionPortrait: document.getElementById("wr-companion-portrait"),
  companionName: document.getElementById("wr-companion-name"),
  bondLine: document.getElementById("wr-bond-line"),
  fashionRole: document.getElementById("wr-fashion-role"),
  roleBonus: document.getElementById("wr-role-bonus"),
  toast: document.getElementById("toast"),
};

const state = {
  boutiqueId: null,
  inventory: [],
  filter: "hair",
  draft: {},
  profile: null,
  companion: null,
  fashionRole: "researcher",
  busy: false,
};

function resolveBoutiqueId() {
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get("boutique");
  if (fromUrl && getBoutique(fromUrl)) return fromUrl;
  const saved = getActiveBoutiqueId();
  if (saved) return saved;
  return null;
}

function readLogin() {
  try {
    const raw = localStorage.getItem(LOGIN_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return loadFinal();
}

function loadDraft() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
    if (!raw || raw.boutiqueId !== state.boutiqueId) return;
    if (raw.modules && typeof raw.modules === "object") state.draft = { ...raw.modules };
    if (typeof raw.name === "string") els.lookName.value = raw.name;
  } catch {
    /* ignore */
  }
}

function persistDraft() {
  sessionStorage.setItem(
    DRAFT_KEY,
    JSON.stringify({
      boutiqueId: state.boutiqueId,
      modules: state.draft,
      name: els.lookName.value,
    }),
  );
}

function toast(msg) {
  if (!els.toast) return;
  els.toast.textContent = msg;
  els.toast.classList.add("is-visible");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove("is-visible"), 2400);
}

function selectedItems() {
  return Object.values(state.draft)
    .filter(Boolean)
    .map((id) => state.inventory.find((item) => item.id === id))
    .filter(Boolean);
}

function paintFilters() {
  els.filters.replaceChildren(
    ...WARDROBE_FILTERS.map((filter) => {
      const count = state.inventory.filter((i) => i.filterId === filter.id).length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `wr-filter${state.filter === filter.id ? " is-on" : ""}`;
      btn.dataset.filter = filter.id;
      btn.textContent = `${t(filter.labelKey)} (${count})`;
      btn.addEventListener("click", () => {
        state.filter = filter.id;
        paintFilters();
        paintModuleGrid();
      });
      return btn;
    }),
  );
}

function paintModuleGrid() {
  const items = state.inventory.filter((i) => i.filterId === state.filter);
  if (!items.length) {
    els.moduleGrid.innerHTML = `<p class="wr-filter-empty">${t("wardrobe.filterEmpty")}</p>`;
    return;
  }
  els.moduleGrid.replaceChildren(
    ...items.map((item) => {
      const selected = state.draft[item.filterId] === item.id;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `wr-module-card${selected ? " is-on" : ""}${item.layerGap ? " is-gap" : ""}`;
      btn.dataset.id = item.id;
      btn.innerHTML = `
        <span class="wr-module-art">${item.layerGap ? `<span class="wr-art-label">ART</span>` : `<span class="wr-module-dot"></span>`}</span>
        <strong>${t(item.labelKey)}</strong>
        <small>${t(item.boutiqueNameKey)}</small>
        ${item.layerGap ? `<em>${t("wardrobe.layerGap")}</em>` : ""}`;
      btn.addEventListener("click", () => toggleModule(item));
      return btn;
    }),
  );
}

function toggleModule(item) {
  if (state.draft[item.filterId] === item.id) {
    delete state.draft[item.filterId];
  } else {
    state.draft[item.filterId] = item.id;
  }
  persistDraft();
  paintModuleGrid();
  paintPreview();
  paintStats();
}

function paintInventoryMeta() {
  const total = totalUnlockableModules();
  els.inventoryCount.textContent = t("wardrobe.inventoryCount", {
    n: state.inventory.length,
    total,
  });
}

async function paintAvatar() {
  if (!els.avatar) return;
  const profile = state.profile;
  try {
    await loadAssetIndex();
    await renderAvatar(
      els.avatar,
      {
        gender: profile?.gender || "female",
        selection: profile?.selection || null,
        referenceSheet: profile?.referenceSheet || null,
      },
      { alt: profile?.name || t("wardrobe.explorer"), compact: true },
    );
  } catch {
    els.avatar.innerHTML = `<p class="wr-art-todo">${t("wardrobe.avatarTodo")}</p>`;
  }
}

function paintPreview() {
  const items = selectedItems();
  const gapItems = items.filter((i) => i.layerGap);
  if (gapItems.length) {
    els.gapNote.hidden = false;
    els.gapNote.textContent = t("wardrobe.gapPreview", {
      modules: gapItems.map((i) => t(i.labelKey)).join(" · "),
    });
  } else {
    els.gapNote.hidden = true;
    els.gapNote.textContent = "";
  }

  els.draftChips.replaceChildren(
    ...items.map((item) => {
      const li = document.createElement("li");
      li.textContent = `${t(WARDROBE_FILTERS.find((f) => f.id === item.filterId)?.labelKey || "wardrobe.filter.accessory")}: ${t(item.labelKey)}`;
      return li;
    }),
  );
}

function paintStats() {
  const items = selectedItems();
  const identity = computeStyleIdentity(items, state.fashionRole);
  els.styleScore.textContent = String(identity.score);
  els.styleRank.textContent = identity.rank;
  els.styleTags.replaceChildren(
    ...identity.tags.map((tag) => {
      const li = document.createElement("li");
      li.textContent = t(`wardrobe.tag.${tag}`);
      li.dataset.tag = tag;
      return li;
    }),
  );
  els.inspiration.textContent = t(INSPIRATION_KEYS[state.fashionRole] || INSPIRATION_KEYS.researcher);

  const companion = localizeCompanion(state.companion, getLang()) || state.companion;
  const bond = getCompanionBond(companion?.id || "diana");
  if (companion?.portrait) els.companionPortrait.src = companion.portrait;
  els.companionName.textContent = companion?.name || companion?.nameEn || "";
  els.bondLine.textContent = t("wardrobe.bondLine", { level: bond.level, xp: bond.xp });

  els.fashionRole.textContent = t(`town.fashionRole.${state.fashionRole}`);
  els.roleBonus.textContent = t(ROLE_BONUS_KEYS[state.fashionRole] || ROLE_BONUS_KEYS.researcher);
}

function paintRoutes() {
  const boutiqueQ = state.boutiqueId
    ? `?boutique=${encodeURIComponent(state.boutiqueId)}`
    : "";
  els.visitBoutique.href = `/nuannuan/map${boutiqueQ}`;
  els.backTown.href = state.boutiqueId
    ? `/nuannuan/town?boutique=${encodeURIComponent(state.boutiqueId)}`
    : "/nuannuan/town";
  els.emptyCta.href = els.backTown.href;
}

function paintAll() {
  paintRoutes();
  paintInventoryMeta();
  paintFilters();
  paintModuleGrid();
  void paintAvatar();
  paintPreview();
  paintStats();
  applyDom();
}

function showEmpty() {
  els.shell.hidden = true;
  els.empty.hidden = false;
  paintRoutes();
  applyDom();
}

function showShell() {
  els.empty.hidden = true;
  els.shell.hidden = false;
  paintAll();
}

function clearFormError() {
  els.formError.hidden = true;
  els.formError.textContent = "";
}

function showFormError(code) {
  const key = {
    empty: "wardrobe.error.emptyName",
    duplicate: "wardrobe.error.duplicateName",
    length: "wardrobe.error.nameLength",
  }[code] || "wardrobe.error.saveFailed";
  els.formError.hidden = false;
  els.formError.textContent = t(key);
}

async function onSaveLook() {
  if (state.busy) return;
  clearFormError();
  const items = selectedItems();
  if (!items.length) {
    clearFormError();
    els.formError.hidden = false;
    els.formError.textContent = t("wardrobe.error.noModules");
    return;
  }

  state.busy = true;
  els.saveLook.disabled = true;
  const identity = computeStyleIdentity(items, state.fashionRole);
  const result = saveLookEntry({
    name: els.lookName.value,
    modules: { ...state.draft },
    boutiqueId: state.boutiqueId,
    score: identity.score,
    rank: identity.rank,
  });

  state.busy = false;
  els.saveLook.disabled = false;

  if (!result.ok) {
    showFormError(result.code);
    return;
  }

  toast(t("wardrobe.toast.saved", { name: result.look.name }));
  sessionStorage.removeItem(DRAFT_KEY);
  state.draft = {};
  paintModuleGrid();
  paintPreview();
  paintStats();
}

async function boot() {
  state.boutiqueId = resolveBoutiqueId();
  const invalid = invalidBoutiqueFromUrl();
  if (state.boutiqueId) setActiveBoutique(state.boutiqueId);
  if (invalid) toast(t("town.invalidBoutique", { id: invalid }));

  state.profile = readLogin();
  state.companion = loadConfirmedCompanion() || getCompanion(getBoutique(state.boutiqueId)?.companionId || "diana");
  state.fashionRole = state.profile?.fashionRole || getBoutique(state.boutiqueId)?.fashionRole || "researcher";

  state.inventory = buildModuleInventory();
  loadDraft();

  if (!state.inventory.length) {
    showEmpty();
    return;
  }

  showShell();
}

onLangChange(() => {
  if (!els.empty.hidden) {
    applyDom();
    paintRoutes();
    return;
  }
  if (!els.shell.hidden) paintAll();
});

els.saveLook.addEventListener("click", () => void onSaveLook());
els.lookName.addEventListener("input", () => {
  clearFormError();
  persistDraft();
});

document.addEventListener("keydown", (event) => {
  if (els.empty.hidden === false || els.shell.hidden) return;
  const key = event.key;
  if (key === "Enter" && document.activeElement === els.lookName) {
    event.preventDefault();
    void onSaveLook();
    return;
  }
  const filterIdx = WARDROBE_FILTERS.findIndex((f) => f.id === state.filter);
  if (key === "ArrowRight" || key === "ArrowDown") {
    const cards = [...els.moduleGrid.querySelectorAll(".wr-module-card")];
    const active = cards.findIndex((c) => c === document.activeElement);
    if (active >= 0 && active < cards.length - 1) {
      event.preventDefault();
      cards[active + 1].focus();
    }
  } else if (key === "ArrowLeft" || key === "ArrowUp") {
    const cards = [...els.moduleGrid.querySelectorAll(".wr-module-card")];
    const active = cards.findIndex((c) => c === document.activeElement);
    if (active > 0) {
      event.preventDefault();
      cards[active - 1].focus();
    }
  } else if (key >= "1" && key <= "6") {
    const idx = Number(key) - 1;
    if (WARDROBE_FILTERS[idx]) {
      state.filter = WARDROBE_FILTERS[idx].id;
      paintFilters();
      paintModuleGrid();
    }
  }
});

boot().catch((err) => {
  console.error(err);
  els.bootError.hidden = false;
  els.bootError.textContent = t("wardrobe.bootError");
});
