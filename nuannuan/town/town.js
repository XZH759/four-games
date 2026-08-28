import { initI18n, applyDom, onLangChange, t, getLang } from "/js/i18n.js";
import { mountLobbyExit } from "/js/lobby-exit.js";
import {
  BOUTIQUES,
  MODULE_LABEL_KEYS,
  setActiveBoutique,
  getActiveBoutiqueId,
  boutiqueProgress,
  loadFashionState,
  getUnlockedModules,
  invalidBoutiqueFromUrl,
} from "/js/nuannuan/fashion-town.js";
import { loadFinal } from "/js/nuannuan/avatar-config.js";
import { renderAvatar } from "/js/nuannuan/AvatarRenderer.js";
import { loadAssetIndex } from "/js/nuannuan/character-assets.js";
import { loadConfirmedCompanion, getCompanion, localizeCompanion } from "/js/nuannuan/companion-config.js";

initI18n({ toggleHost: "#lang-host" });
mountLobbyExit();

const LOGIN_KEY = "nn_login_avatar_v1";

const els = {
  grid: document.getElementById("boutique-grid"),
  enter: document.getElementById("btn-enter"),
  shared: document.getElementById("shared-status"),
  avatar: document.getElementById("town-avatar"),
  name: document.getElementById("town-name"),
  level: document.getElementById("town-level"),
  coins: document.getElementById("town-coins"),
  gems: document.getElementById("town-gems"),
  enterHint: document.getElementById("enter-hint"),
  enterHintPortrait: document.getElementById("enter-hint-portrait"),
  enterHintText: document.getElementById("enter-hint-text"),
};

const state = { selected: null, focusIndex: 0 };

function readLogin() {
  try {
    return JSON.parse(localStorage.getItem(LOGIN_KEY) || "null");
  } catch {
    return null;
  }
}

function resolveSelectedId() {
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get("boutique");
  if (fromUrl && BOUTIQUES.some((b) => b.id === fromUrl)) return fromUrl;
  const saved = getActiveBoutiqueId();
  if (saved) return saved;
  return BOUTIQUES[0]?.id || null;
}


function toast(msg) {
  const node = document.getElementById("town-toast");
  if (!node) return;
  node.textContent = msg;
  node.classList.add("is-visible");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => node.classList.remove("is-visible"), 2600);
}

async function paintPlayer() {
  const login = readLogin() || loadFinal();
  const wallet = (() => {
    try {
      return JSON.parse(localStorage.getItem("ailit_castle_wallet_v1") || "{}");
    } catch {
      return {};
    }
  })();
  const lifetime = Number(wallet.lifetime) || 0;
  const level = Math.max(1, Math.floor(lifetime / 400) + 1);
  const points = Number(wallet.points) || 0;
  const gems = Number(wallet.gems) || Math.floor(points / 10);

  if (login && els.avatar) {
    els.name.textContent = login.name || t("town.playerExplorer");
    try {
      await loadAssetIndex();
      await renderAvatar(
        els.avatar,
        {
          gender: login.gender || "female",
          selection: login.selection || null,
          referenceSheet: login.referenceSheet || null,
        },
        { alt: login.name || t("town.playerExplorer"), compact: true },
      );
    } catch {
      els.avatar.innerHTML = "";
      const img = document.createElement("img");
      img.src = `/nuannuan/login/assets/theme-packs/${login.role || "researcher"}_${login.gender === "male" ? "male" : "female"}.png`;
      img.alt = "";
      img.className = "town-player-fallback";
      els.avatar.append(img);
    }
  } else {
    els.name.textContent = t("town.playerExplorer");
  }
  els.level.textContent = `Lv.${level}`;
  els.coins.textContent = String(points);
  els.gems.textContent = String(gems);
}

function companionForBoutique(boutique) {
  return localizeCompanion(getCompanion(boutique.companionId), getLang());
}

function paintEnterHint() {
  const boutique = BOUTIQUES.find((b) => b.id === state.selected);
  if (!boutique) {
    els.enterHint.hidden = true;
    return;
  }
  const companion = companionForBoutique(boutique);
  els.enterHint.hidden = false;
  if (companion?.portrait) els.enterHintPortrait.src = companion.portrait;
  els.enterHintPortrait.alt = companion?.name || "";
  els.enterHintText.textContent = t("town.enterHint");
}

function selectBoutique(id, { focus = true } = {}) {
  if (!BOUTIQUES.some((b) => b.id === id)) return;
  state.selected = id;
  state.focusIndex = BOUTIQUES.findIndex((b) => b.id === id);
  paintBoutiques();
  els.enter.disabled = false;
  paintEnterHint();
  if (focus) {
    els.grid.querySelector(`[data-boutique="${id}"]`)?.focus();
  }
}

function boutiqueCardHtml(boutique, index) {
  const prog = boutiqueProgress(boutique.id);
  const unlocked = new Set(getUnlockedModules(boutique.id));
  const companion = companionForBoutique(boutique);
  const trait = companion?.traits?.[0]?.name || "";
  const modules = boutique.modules
    .map((m) => {
      const cls = unlocked.has(m) ? " is-unlocked" : "";
      return `<span class="${cls.trim()}">${t(MODULE_LABEL_KEYS[m])}</span>`;
    })
    .join("");

  return `
    <span class="boutique-path">${t("town.pathLabel", { n: index + 1 })}</span>
    <div class="boutique-art">
      <img src="${boutique.buildingArt}" alt="" loading="lazy" />
      <span class="boutique-art-todo">${t("town.boutiqueArtTodo")}</span>
    </div>
    <span class="boutique-tag">${t(boutique.taglineKey)}</span>
    <strong>${t(boutique.nameKey)}</strong>
    <span class="boutique-role-line">${t("town.roleLabel")}: ${t(`town.fashionRole.${boutique.fashionRole}`)}</span>
    <span class="boutique-focus">${t("town.focusLabel")}: ${t(boutique.focusKey)}</span>
    <div class="boutique-companion-row">
      <img src="${companion?.portrait || ""}" alt="" loading="lazy" width="28" height="28" />
      <div class="boutique-companion-meta">
        <em>${t("town.recommendedCompanion")}</em>
        <span>${companion?.name || boutique.companionId}${trait ? ` · ${trait}` : ""}</span>
      </div>
    </div>
    <span class="boutique-modules-label">${t("town.modulesLabel")}</span>
    <div class="boutique-modules">${modules}</div>
    <span class="boutique-progress">${t("town.progressLabel")}: <b>${prog.unlocked}</b> / ${prog.total}</span>
  `;
}

function paintBoutiques() {
  const fashion = loadFashionState();
  els.grid.replaceChildren(
    ...BOUTIQUES.map((boutique, index) => {
      const btn = document.createElement("button");
      const isSelected = state.selected === boutique.id;
      btn.type = "button";
      btn.className = `boutique-card${isSelected ? " is-on" : ""}`;
      btn.dataset.tone = boutique.tone;
      btn.dataset.boutique = boutique.id;
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", isSelected ? "true" : "false");
      btn.tabIndex = isSelected ? 0 : -1;
      btn.innerHTML = boutiqueCardHtml(boutique, index);
      btn.addEventListener("click", () => selectBoutique(boutique.id));
      return btn;
    }),
  );
  els.shared.hidden = !fashion.sharedOutfit;

  document.querySelectorAll("#flow-steps .flow-icon").forEach((node, i) => {
    node.dataset.step = String(i + 1);
  });
}

function moveSelection(delta) {
  if (!BOUTIQUES.length) return;
  const next = (state.focusIndex + delta + BOUTIQUES.length) % BOUTIQUES.length;
  selectBoutique(BOUTIQUES[next].id);
}

function enterBoutique() {
  if (!state.selected) return;
  setActiveBoutique(state.selected);
  const login = readLogin() || loadFinal();
  const companion = loadConfirmedCompanion();
  if (!login?.name && !login?.characterId) {
    location.href = `/nuannuan/login?from=town&boutique=${encodeURIComponent(state.selected)}`;
    return;
  }
  if (!companion?.id) {
    location.href = `/nuannuan/partner?from=town&boutique=${encodeURIComponent(state.selected)}`;
    return;
  }
  location.href = `/nuannuan/map?boutique=${encodeURIComponent(state.selected)}`;
}

els.grid.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    moveSelection(1);
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    moveSelection(-1);
  } else if (event.key === "Home") {
    event.preventDefault();
    selectBoutique(BOUTIQUES[0].id);
  } else if (event.key === "End") {
    event.preventDefault();
    selectBoutique(BOUTIQUES[BOUTIQUES.length - 1].id);
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    enterBoutique();
  }
});

els.enter.addEventListener("click", enterBoutique);

onLangChange(() => {
  applyDom();
  paintPlayer();
  paintBoutiques();
  paintEnterHint();
});

state.selected = resolveSelectedId();
state.focusIndex = Math.max(0, BOUTIQUES.findIndex((b) => b.id === state.selected));
const invalid = invalidBoutiqueFromUrl();
if (invalid) toast(t("town.invalidBoutique", { id: invalid }));
void paintPlayer();
paintBoutiques();
paintEnterHint();
applyDom();
if (state.selected) els.enter.disabled = false;
