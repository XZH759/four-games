/**
 * Fashion Town · Step 4 quiz mode for /collect?level=:n&boutique=:id
 */
import {
  getBoutique,
  setActiveBoutique,
  getActiveBoutiqueId,
  boutiqueProgress,
  MODULE_LABEL_KEYS,
  getUnlockedModules,
} from "/js/nuannuan/fashion-town.js";
import { getCompanion, localizeCompanion } from "/js/nuannuan/companion-config.js";
import { renderAvatar } from "/js/nuannuan/AvatarRenderer.js";
import { loadAssetIndex } from "/js/nuannuan/character-assets.js";
import { loadFinal } from "/js/nuannuan/avatar-config.js";

export function resolveCollectBoutiqueId() {
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get("boutique");
  if (fromUrl && getBoutique(fromUrl)) return fromUrl;
  const fromMap = params.has("level") && (params.get("arm") === "collect" || params.has("item"));
  if (fromMap) {
    const saved = getActiveBoutiqueId();
    if (saved && getBoutique(saved)) return saved;
  }
  return null;
}

export function isFashionCollectMode() {
  return Boolean(resolveCollectBoutiqueId());
}

export function moduleForLevel(levelId, boutique) {
  if (!boutique?.modules?.length) return null;
  const idx = (levelId - 1) % boutique.modules.length;
  return boutique.modules[idx];
}

function loadExplorerProfile() {
  try {
    const raw = localStorage.getItem("nn_login_avatar_v1");
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return loadFinal();
}

export function mountFashionCollect(ctx) {
  const { state, els, t, getLang } = ctx;
  const boutiqueId = resolveCollectBoutiqueId();
  const boutique = getBoutique(boutiqueId);
  if (!boutique) return;

  state.fashionMode = true;
  state.boutiqueId = boutique.id;
  setActiveBoutique(boutique.id);

  document.body.classList.add("is-fashion-challenge");
  document.body.dataset.boutiqueTone = boutique.tone;
  document.title = t("collect.ft.title", { name: t(boutique.nameKey) });

  if (els.quizTopLegacy) els.quizTopLegacy.hidden = true;
  if (els.quizFootLegacy) els.quizFootLegacy.hidden = true;
  if (els.companionStage) els.companionStage.hidden = true;
  if (els.ftQuizHead) els.ftQuizHead.hidden = false;
  if (els.ftQuizActions) els.ftQuizActions.hidden = false;
  if (els.ftPlayerPanel) els.ftPlayerPanel.hidden = false;
  if (els.ftDesignBoard) els.ftDesignBoard.hidden = false;
  if (els.ftJourney) els.ftJourney.hidden = false;
  if (els.ftChallengeHead) els.ftChallengeHead.hidden = false;

  if (els.ftBackMap) {
    els.ftBackMap.href = `/nuannuan/map?boutique=${encodeURIComponent(boutique.id)}`;
  }
  if (els.ftBoutiqueIcon) {
    els.ftBoutiqueIcon.src = boutique.buildingArt;
    els.ftBoutiqueIcon.alt = "";
  }
  if (els.ftChallengeTitle) {
    els.ftChallengeTitle.textContent = t("collect.ft.challengeTitle", { name: t(boutique.nameKey) });
  }
  if (els.ftChallengeSub) {
    els.ftChallengeSub.textContent = t("collect.ft.challengeSub");
  }

  document.querySelectorAll("#ft-journey-flow li").forEach((li, i) => {
    const step = i + 1;
    li.classList.toggle("is-done", step < 4);
    li.classList.toggle("is-current", step === 4);
  });

  void paintFashionPlayer(ctx);
  paintDesignBoard(ctx);
}

export async function paintFashionPlayer(ctx) {
  const { els, t, getLang } = ctx;
  const profile = loadExplorerProfile();
  const boutique = getBoutique(ctx.state.boutiqueId);
  const companion = localizeCompanion(
    ctx.state.companion || getCompanion(ctx.state.companion?.id || boutique?.companionId || "diana"),
    getLang(),
  );

  const fashionRole = profile?.fashionRole || boutique?.fashionRole || "researcher";
  if (els.ftPlayerRole) {
    els.ftPlayerRole.textContent = t(`town.fashionRole.${fashionRole}`);
  }
  if (els.ftPlayerName) {
    els.ftPlayerName.textContent = profile?.name || t("collect.ft.explorer");
  }
  if (els.ftPlayerTagline) {
    els.ftPlayerTagline.textContent = boutique ? t(boutique.focusKey) : "";
  }

  if (els.ftCompanionName) {
    els.ftCompanionName.textContent = companion?.name || companion?.nameEn || "";
  }
  if (els.ftCompanionRole) {
    els.ftCompanionRole.textContent = companion?.role || "";
  }
  if (els.ftCompanionPortrait && companion?.portrait) {
    els.ftCompanionPortrait.src = companion.portrait;
    els.ftCompanionPortrait.alt = companion.name || "";
  }
  if (els.ftCompanionLine) {
    els.ftCompanionLine.textContent = t("collect.ft.companionLine");
  }

  if (els.ftPlayerAvatar) {
    try {
      await loadAssetIndex();
      await renderAvatar(
        els.ftPlayerAvatar,
        {
          gender: profile?.gender || "female",
          selection: profile?.selection || null,
          referenceSheet: profile?.referenceSheet || null,
        },
        { alt: profile?.name || t("collect.ft.explorer"), compact: true },
      );
    } catch {
      els.ftPlayerAvatar.innerHTML = `<p class="ft-art-todo">${t("collect.ft.avatarTodo")}</p>`;
    }
  }
}

export function paintDesignBoard(ctx) {
  const { state, els, t } = ctx;
  const boutique = getBoutique(state.boutiqueId);
  if (!boutique || !els.ftDesignBoard) return;

  const unlocked = new Set(getUnlockedModules(boutique.id));
  const prog = boutiqueProgress(boutique.id);
  const slot = state.session?.[state.cursor];
  const targetMod = slot ? moduleForLevel(slot.level, boutique) : null;

  els.ftDesignBoard.innerHTML = `
    <header class="ft-board-head">
      <h2>${t("collect.ft.boardTitle")}</h2>
      <p class="ft-board-progress">${t("collect.ft.boardProgress", { n: prog.unlocked, total: prog.total })}</p>
    </header>
    <div class="ft-board-preview" aria-hidden="true">
      <span class="ft-art-todo">${t("collect.ft.outfitPreviewTodo")}</span>
    </div>
    <div class="ft-module-grid">
      ${boutique.modules
        .map((mod) => {
          const done = unlocked.has(mod);
          const isTarget = mod === targetMod;
          return `
            <article class="ft-module-slot${done ? " is-unlocked" : " is-locked"}${isTarget ? " is-target" : ""}">
              <div class="ft-module-art">${done ? `<span class="ft-module-dot"></span>` : `<span class="ft-module-lock">·</span>`}</div>
              <strong>${t(MODULE_LABEL_KEYS[mod])}</strong>
              <small>${done ? t("collect.ft.moduleUnlocked") : t("collect.ft.moduleLocked")}</small>
              ${!done ? `<span class="ft-art-todo">${t("collect.ft.moduleArtTodo")}</span>` : ""}
            </article>`;
        })
        .join("")}
    </div>
    <p class="ft-board-note">${t("collect.ft.boardNote")}</p>`;
}

export function paintFashionChrome(ctx) {
  const { state, els, t } = ctx;
  const slot = state.session[state.cursor];
  if (!slot) return;

  const boutique = getBoutique(state.boutiqueId);
  const total = state.session.length;
  const idx = state.cursor + 1;
  const targetMod = moduleForLevel(slot.level, boutique);

  if (els.ftStagePill) {
    els.ftStagePill.textContent = t("collect.ft.stageOf", { n: idx, total });
  }
  if (els.ftScorePair) {
    els.ftScorePair.textContent = t("collect.ft.scorePair", {
      n: ctx.answeredInSession(),
      total,
    });
  }
  if (els.ftTargetModule) {
    els.ftTargetModule.textContent = targetMod
      ? t("collect.ft.designTarget", { module: t(MODULE_LABEL_KEYS[targetMod]) })
      : "";
  }
  if (els.domainPill) {
    els.domainPill.textContent = slot.meta?.domain || slot.item.domain || "";
  }

  paintDesignBoard(ctx);
}

export function showFashionFeedback(els, message, { isError = true } = {}) {
  if (!els.ftFeedback) return;
  els.ftFeedback.hidden = false;
  els.ftFeedback.textContent = message;
  els.ftFeedback.classList.toggle("is-error", isError);
  els.ftFeedback.classList.toggle("is-ok", !isError);
}

export function hideFashionFeedback(els) {
  if (!els.ftFeedback) return;
  els.ftFeedback.hidden = true;
  els.ftFeedback.textContent = "";
  els.ftFeedback.classList.remove("is-error", "is-ok");
}
