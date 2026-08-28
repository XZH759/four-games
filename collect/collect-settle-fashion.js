/**
 * Fashion Town · Step 4B Design Complete settle for /collect settle phase
 */
import {
  getBoutique,
  boutiqueProgress,
  MODULE_LABEL_KEYS,
  MODULE_WARDROBE_SLOTS,
  getCompanionBond,
} from "/js/nuannuan/fashion-town.js";
import { getCompanion, localizeCompanion } from "/js/nuannuan/companion-config.js";

export const SETTLE_PENDING_KEY = "nn_collect_settle_pending";

const SETTLE_LINE = {
  bella: { zh: "优雅地完成了这一段设计！", en: "You finished this design stretch with grace!" },
  ava: { zh: "节奏保持得很好，设计真棒！", en: "Nice pace — what a stylish result!" },
  eileen: { zh: "线索已变成真正的模块了。", en: "Your clues became real modules!" },
  fiona: { zh: "你做到了！想法变成了真实设计！", en: "You did it! Your idea became a real design!" },
  gladys: { zh: "步骤核对完毕，模块已入库。", en: "Checklist complete — modules saved!" },
  diana: { zh: "知识在设计中发光了。", en: "Your knowledge shines in this design!" },
};

function pickLang(pack, lang) {
  if (!pack) return "";
  return lang === "en" ? pack.en : pack.zh;
}

export function mountFashionSettle(ctx) {
  const { els } = ctx;
  document.body.classList.add("is-fashion-settle");
  if (els.settleLegacy) els.settleLegacy.hidden = true;
  if (els.ftSettle) els.ftSettle.hidden = false;
  if (els.ftJourney) els.ftJourney.hidden = false;
  spawnConfetti(els.ftConfetti);
}

export function paintFashionSettle(ctx) {
  const { state, els, t, getLang } = ctx;
  const lang = getLang();
  const designed = state.settleDesigned || [];
  const boutique = getBoutique(state.boutiqueId);
  const c = localizeCompanion(state.companion || getCompanion("diana"), lang) || state.companion;
  const cid = c?.id || state.companion?.id || "diana";
  const bond = getCompanionBond(cid);
  const prog = boutiqueProgress(state.boutiqueId);
  const sessionBond = designed.length;
  const sessionFragments = designed.length;
  const sessionBoutique = designed.filter((d) => d.boutiqueId === state.boutiqueId).length;

  if (els.ftSettleTitle) {
    els.ftSettleTitle.textContent = t("collect.settle.title");
  }
  if (els.ftSettleSub) {
    els.ftSettleSub.textContent = designed.length
      ? t("collect.settle.sub")
      : t("collect.settle.subEmpty");
  }
  if (els.ftSettleCompanionTitle) {
    els.ftSettleCompanionTitle.textContent = t("collect.settle.cheerTitle");
  }
  if (els.ftSettlePortrait && c?.portrait) {
    els.ftSettlePortrait.src = c.portrait;
    els.ftSettlePortrait.alt = c.name || "";
  }
  if (els.ftSettleSpeech) {
    els.ftSettleSpeech.textContent = pickLang(SETTLE_LINE[cid] || SETTLE_LINE.diana, lang);
  }
  if (els.ftSettleBond) {
    els.ftSettleBond.textContent = t("collect.settle.bondStatus", {
      level: bond.level,
      xp: bond.xp,
    });
  }

  if (els.ftModuleCards) {
    if (!designed.length) {
      els.ftModuleCards.innerHTML = `
        <div class="ft-settle-empty">
          <p>${t("collect.settle.emptyTitle")}</p>
          <small>${t("collect.settle.emptyHint")}</small>
        </div>`;
    } else {
      els.ftModuleCards.innerHTML = designed
        .map((entry) => {
          const modBoutique = getBoutique(entry.boutiqueId);
          const moduleLabel = t(MODULE_LABEL_KEYS[entry.moduleId] || entry.moduleId);
          const slotKey = MODULE_WARDROBE_SLOTS[entry.moduleId] || "collect.settle.slot.module";
          const slotLabel = t(slotKey);
          const boutiqueLabel = modBoutique ? t(modBoutique.nameKey) : entry.boutiqueId;
          return `
            <article class="ft-module-card">
              <span class="ft-module-new">${t("collect.settle.newTag")}</span>
              <div class="ft-module-thumb" aria-hidden="true">
                <span class="ft-art-todo">${t("collect.settle.moduleArtTodo")}</span>
              </div>
              <h3>${moduleLabel}</h3>
              <p class="ft-module-slot">${slotLabel}</p>
              <p class="ft-module-source">${t("collect.settle.fromBoutique", { name: boutiqueLabel })}</p>
              <p class="ft-module-collected">${t("collect.settle.collected")}</p>
            </article>`;
        })
        .join("");
    }
  }

  if (els.ftSlotBoard) {
    const slots = [...new Set(designed.map((d) => MODULE_WARDROBE_SLOTS[d.moduleId]).filter(Boolean))];
    els.ftSlotBoard.innerHTML = `
      <h2>${t("collect.settle.assembleTitle")}</h2>
      <div class="ft-slot-diagram" aria-hidden="true">
        <div class="ft-mannequin">${t("collect.settle.mannequinTodo")}</div>
        ${
          slots.length
            ? `<ul class="ft-slot-list">${slots
                .map((key) => `<li>${t(key)}</li>`)
                .join("")}</ul>`
            : `<p class="ft-slot-empty">${t("collect.settle.slotsEmpty")}</p>`
        }
      </div>
      <p class="ft-slot-note">${t("collect.settle.wardrobeNote")}</p>`;
  }

  if (els.ftRewards) {
    els.ftRewards.innerHTML = `
      <h2>${t("collect.settle.rewardsTitle")}</h2>
      <ul class="ft-reward-list">
        <li><span>${t("collect.settle.rewardFragment")}</span><strong>+${sessionFragments}</strong></li>
        <li><span>${t("collect.settle.rewardBond")}</span><strong>+${sessionBond}</strong></li>
        <li><span>${t("collect.settle.rewardProgress")}</span><strong>+${sessionBoutique}</strong></li>
      </ul>
      <p class="ft-reward-note">${t("collect.settle.rewardsNote")}</p>
      <p class="ft-boutique-progress">${t("collect.settle.boutiqueProgress", {
        n: prog.unlocked,
        total: prog.total,
        name: boutique ? t(boutique.nameKey) : "",
      })}</p>`;
  }

  if (els.settleContinueFt) {
    els.settleContinueFt.textContent = t("collect.settle.continue");
  }
  if (els.settleWardrobe) {
    const q = state.boutiqueId ? `?boutique=${encodeURIComponent(state.boutiqueId)}` : "";
    els.settleWardrobe.href = `/nuannuan/wardrobe${q}`;
    els.settleWardrobe.textContent = t("collect.settle.wardrobe");
  }
}

function spawnConfetti(host) {
  if (!host) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    host.innerHTML = "";
    return;
  }
  const colors = ["#e8dff8", "#f8d7e8", "#ffd56a", "#c9b8e8"];
  host.innerHTML = Array.from({ length: 18 }, (_, i) => {
    const left = 4 + Math.random() * 92;
    const delay = (i * 0.08).toFixed(2);
    const color = colors[i % colors.length];
    return `<span class="ft-confetti-bit" style="left:${left}%;animation-delay:${delay}s;background:${color}"></span>`;
  }).join("");
  setTimeout(() => {
    host.innerHTML = "";
  }, 2200);
}
