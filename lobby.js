import { getEquippedLoadout } from "/castle/castle.js";
import { initI18n, t, onLangChange, setLang, getLang, applyDom } from "/js/i18n.js";
import { isPortalLoggedIn, loadPortalUser, companionLabelKey, ONBOARDING_KEY, isProfileComplete } from "/js/portal-auth.js";

(() => {
  if (!isPortalLoggedIn()) {
    location.replace("/portal/");
    return;
  }
  const portalUser = loadPortalUser();
  if (portalUser && !isProfileComplete(portalUser)) {
    location.replace("/portal/?step=profile");
    return;
  }

  initI18n({ toggleHost: "#lang-host" });

  const ZONE_META = () => ({
    castle: {
      titleKey: "lobby.zone.castle",
      ico: "/assets/park/clay/castle.png",
      links: [
        { href: "/castle", nameKey: "lobby.link.castleExchange", descKey: "lobby.link.castleExchangeDesc" },
        { href: "/nuannuan", nameKey: "lobby.link.starCloset", descKey: "lobby.link.starClosetDesc" },
      ],
    },
    adventure: {
      titleKey: "lobby.zone.adventure",
      ico: "/assets/park/clay/adventure.png",
      links: [
        { href: "/parkour", nameKey: "lobby.link.parkour", descKey: "lobby.link.parkourDesc" },
        { href: "/race", nameKey: "lobby.link.race", descKey: "lobby.link.raceDesc" },
      ],
    },
    arena: {
      titleKey: "lobby.zone.arena",
      ico: "/assets/park/clay/arena.png",
      links: [
        { href: "/kahoot", nameKey: "lobby.link.kahoot", descKey: "lobby.link.kahootDesc" },
        { href: "/monopoly", nameKey: "lobby.link.monopoly", descKey: "lobby.link.monopolyDesc" },
      ],
    },
    town: {
      titleKey: "lobby.zone.town",
      ico: "/assets/park/clay/town.png",
      links: [
        { href: "/nuannuan/town", nameKey: "lobby.link.fashionTown", descKey: "lobby.link.fashionTownDesc" },
        { href: "/nuannuan/login", nameKey: "lobby.link.login", descKey: "lobby.link.loginDesc" },
      ],
    },
  });

  const zoneLabels = [...document.querySelectorAll(".zone-label[data-zone]")];
  const zoneHits = [...document.querySelectorAll(".zone-hit[data-zone]")];
  const guideZones = [...document.querySelectorAll(".guide-zone[data-zone]")];
  const guideLinks = [...document.querySelectorAll(".guide-link")];
  const islandStage = document.getElementById("island-stage");
  const toast = document.getElementById("page-toast");
  const guideModal = document.getElementById("guide-modal");
  const picker = document.getElementById("zone-picker");
  const pickerIco = document.getElementById("zone-picker-ico");
  const pickerTitle = document.getElementById("zone-picker-title");
  const pickerLinks = document.getElementById("zone-picker-links");
  const pickerClose = document.getElementById("zone-picker-close");
  const onboardingModal = document.getElementById("onboarding-modal");
  const onboardingArt = document.getElementById("onboarding-art");
  const onboardingCount = document.getElementById("onboarding-count");
  const onboardingTicketTitle = document.getElementById("onboarding-ticket-title");
  const onboardingTitle = document.getElementById("onboarding-title");
  const onboardingDescription = document.getElementById("onboarding-description");
  const onboardingFeatures = document.getElementById("onboarding-features");
  const onboardingNext = document.getElementById("onboarding-next");
  const onboardingNextLabel = document.getElementById("onboarding-next-label");
  const onboardingSkip = document.getElementById("onboarding-skip");
  const onboardingClose = document.getElementById("onboarding-close");
  const onboardingDots = document.getElementById("onboarding-dots");
  const onboardingTabs = document.getElementById("onboarding-tabs");

  let activeZone = null;
  let onboardingIndex = 0;

  const ONBOARDING_SLIDES = [
    {
      art: "/assets/park/clay/pin.png",
      ticketKey: "onboarding.guide.ticket",
      titleKey: "onboarding.guide.title",
      descriptionKey: "onboarding.guide.copy",
      features: [
        ["🗺️", "onboarding.guide.feature1", "onboarding.guide.feature1Desc", "#e4f5e9"],
        ["❓", "onboarding.guide.feature2", "onboarding.guide.feature2Desc", "#eee4ff"],
        ["⭐", "onboarding.guide.feature3", "onboarding.guide.feature3Desc", "#fff0cb"],
      ],
    },
    {
      art: "/assets/park/clay/arena.png",
      ticketKey: "onboarding.quiz.ticket",
      titleKey: "onboarding.quiz.title",
      descriptionKey: "onboarding.quiz.copy",
      features: [
        ["🏰", "onboarding.quiz.feature1", "onboarding.quiz.feature1Desc", "#fff0d9"],
        ["⚡", "onboarding.quiz.feature2", "onboarding.quiz.feature2Desc", "#e7f5ec"],
        ["🏆", "onboarding.quiz.feature3", "onboarding.quiz.feature3Desc", "#eee7fb"],
      ],
    },
    {
      art: "/assets/park/clay/gift.png",
      ticketKey: "onboarding.reward.ticket",
      titleKey: "onboarding.reward.title",
      descriptionKey: "onboarding.reward.copy",
      features: [
        ["🎁", "onboarding.reward.feature1", "onboarding.reward.feature1Desc", "#fff0dc"],
        ["✨", "onboarding.reward.feature2", "onboarding.reward.feature2Desc", "#f1e9ff"],
        ["🧭", "onboarding.reward.feature3", "onboarding.reward.feature3Desc", "#e5f4e9"],
      ],
    },
  ];

  function announce(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(announce.timer);
    announce.timer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  function setZoneHot(zone, on) {
    if (!zone) return;
    document.querySelectorAll(`[data-zone="${zone}"]`).forEach((el) => {
      el.classList.toggle("is-hot", on);
    });
  }

  function setActiveZone(zone) {
    if (activeZone) {
      document.querySelectorAll(`[data-zone="${activeZone}"]`).forEach((el) => {
        el.classList.remove("is-active");
      });
    }
    activeZone = zone;
    if (!zone) return;
    document.querySelectorAll(`[data-zone="${zone}"]`).forEach((el) => {
      el.classList.add("is-active");
    });
  }

  function scrollGuide(zone) {
    const panel = guideZones.find((z) => z.getAttribute("data-zone") === zone);
    panel?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function closePicker() {
    if (!picker) return;
    picker.hidden = true;
  }

  function openPicker(zone) {
    const meta = ZONE_META()[zone];
    if (!meta || !picker || !pickerLinks) return;

    setActiveZone(zone);
    scrollGuide(zone);

    const title = t(meta.titleKey);
    if (pickerIco) pickerIco.src = meta.ico;
    if (pickerTitle) pickerTitle.textContent = title;
    pickerLinks.innerHTML = meta.links
      .map(
        (link) =>
          `<a href="${link.href}"><span>${t(link.nameKey)}</span><small>${t(link.descKey)}</small></a>`
      )
      .join("");

    picker.hidden = false;
    announce(t("lobby.toast.opened", { name: title }));
  }

  function focusZone(zone) {
    if (!zone || !ZONE_META()[zone]) return;
    openPicker(zone);
  }

  [...zoneLabels, ...zoneHits].forEach((el) => {
    const zone = el.getAttribute("data-zone");
    el.addEventListener("pointerenter", () => setZoneHot(zone, true));
    el.addEventListener("pointerleave", () => setZoneHot(zone, false));
    el.addEventListener("focus", () => setZoneHot(zone, true));
    el.addEventListener("blur", () => setZoneHot(zone, false));
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      focusZone(zone);
    });
  });

  guideZones.forEach((panel) => {
    const zone = panel.getAttribute("data-zone");
    panel.addEventListener("pointerenter", () => setZoneHot(zone, true));
    panel.addEventListener("pointerleave", () => setZoneHot(zone, false));
    panel.querySelector(".zone-banner")?.addEventListener("click", () => focusZone(zone));
  });

  guideLinks.forEach((link) => {
    const zone = link.getAttribute("data-zone");
    link.addEventListener("pointerenter", () => setZoneHot(zone, true));
    link.addEventListener("pointerleave", () => setZoneHot(zone, false));
    link.addEventListener("click", () => {
      const name = link.querySelector("strong")?.textContent || t("common.lobby");
      announce(t("lobby.toast.goto", { name }));
    });
  });

  pickerClose?.addEventListener("click", (e) => {
    e.stopPropagation();
    closePicker();
  });

  islandStage?.addEventListener("click", (e) => {
    if (e.target.closest(".zone-label, .zone-hit, .zone-picker")) return;
    closePicker();
  });

  window.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea, select, [contenteditable]")) return;
    if (e.key === "Escape") {
      closePicker();
      return;
    }
    if (!/^[1-4]$/.test(e.key)) return;
    const label = zoneLabels.find((h) => h.getAttribute("data-num") === e.key);
    const zone = label?.getAttribute("data-zone");
    if (!zone) return;
    e.preventDefault();
    focusZone(zone);
    label?.focus({ preventScroll: true });
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (islandStage && !reduceMotion) {
    const wrap = islandStage.parentElement;
    wrap?.addEventListener("pointermove", (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      islandStage.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 3}deg)`;
    });
    wrap?.addEventListener("pointerleave", () => {
      islandStage.style.transform = "";
    });
  }

  function renderProfile() {
    try {
      const portal = loadPortalUser();
      const load = getEquippedLoadout();
      const avatar = document.getElementById("profile-avatar");
      const name = document.getElementById("profile-name");
      const level = document.getElementById("profile-level");
      const points = document.getElementById("profile-points");
      const coins = document.getElementById("profile-coins");
      if (avatar) avatar.textContent = load.frame?.icon || load.pet?.icon || "🧒";
      if (name) {
        name.removeAttribute("data-i18n");
        name.textContent = portal?.display_name || load.name || t("lobby.explorerDefault");
      }
      if (level) {
        const lv = Math.max(1, Math.floor((Number(load.lifetime) || 0) / 500) + 1);
        const companionTitle = portal ? t(companionLabelKey(portal.companion)) : null;
        level.textContent = load.title
          ? `Lv.${lv} ${load.title.titleText || load.title.name.replace(/^称号·/, "")}`
          : companionTitle
            ? `Lv.${lv} ${companionTitle}`
            : t("lobby.levelExplorer", { n: lv });
      }
      if (points) points.textContent = String(Number(load.points) || 0);
      if (coins) {
        const petBits = load.pet ? 120 : 0;
        const trailBits = load.trail ? 80 : 0;
        coins.textContent = String(petBits + trailBits + Math.floor((Number(load.points) || 0) / 10));
      }
    } catch (_) {
      /* wallet optional */
    }
  }
  renderProfile();

  const WEEK_KEY = "nn_park_week_star";
  let weekDays = 3;
  try {
    const saved = Number(localStorage.getItem(WEEK_KEY));
    if (Number.isFinite(saved) && saved >= 0) weekDays = Math.min(5, saved);
  } catch (_) {}
  const weekFill = document.getElementById("week-fill");
  const weekCount = document.getElementById("week-count");
  function renderWeek() {
    if (weekFill) weekFill.style.setProperty("--p", `${(weekDays / 5) * 100}%`);
    if (weekCount) weekCount.textContent = t("lobby.weekDays", { n: weekDays });
  }
  renderWeek();
  requestAnimationFrame(() => renderWeek());

  document.getElementById("week-gift")?.addEventListener("click", () => {
    if (weekDays >= 5) {
      announce(t("lobby.toast.giftDone"));
      return;
    }
    weekDays = Math.min(5, weekDays + 1);
    try { localStorage.setItem(WEEK_KEY, String(weekDays)); } catch (_) {}
    renderWeek();
    announce(weekDays >= 5 ? t("lobby.toast.checkinDone") : t("lobby.toast.checkin", { n: weekDays }));
  });

  document.getElementById("daily-banner")?.addEventListener("click", () => {
    announce(t("lobby.toast.daily"));
    focusZone("adventure");
  });
  document.getElementById("btn-activity")?.addEventListener("click", () => {
    announce(t("lobby.toast.activity"));
  });
  document.getElementById("btn-achieve")?.addEventListener("click", () => {
    announce(t("lobby.toast.achieve"));
  });
  document.getElementById("map-mini")?.addEventListener("click", () => {
    islandStage?.scrollIntoView({ behavior: "smooth", block: "center" });
    announce(t("lobby.toast.mapCenter"));
  });
  document.getElementById("btn-settings")?.addEventListener("click", () => {
    setLang(getLang() === "zh" ? "en" : "zh");
    announce(t("lobby.toast.lang"));
  });
  document.getElementById("btn-explore")?.addEventListener("click", () => {
    islandStage?.scrollIntoView({ behavior: "smooth", block: "center" });
    focusZone("castle");
    announce(t("lobby.toast.explore"));
  });

  function paintOnboarding() {
    const slide = ONBOARDING_SLIDES[onboardingIndex] || ONBOARDING_SLIDES[0];
    if (!slide || !onboardingFeatures) return;
    if (onboardingArt) onboardingArt.src = slide.art;
    if (onboardingCount) onboardingCount.textContent = `${onboardingIndex + 1} / ${ONBOARDING_SLIDES.length}`;
    if (onboardingTicketTitle) onboardingTicketTitle.textContent = t(slide.ticketKey);
    if (onboardingTitle) onboardingTitle.textContent = t(slide.titleKey);
    if (onboardingDescription) onboardingDescription.textContent = t(slide.descriptionKey);
    if (onboardingNextLabel) {
      onboardingNextLabel.textContent = t(
        onboardingIndex === ONBOARDING_SLIDES.length - 1
          ? "onboarding.getStarted"
          : "onboarding.next",
      );
    }

    onboardingFeatures.replaceChildren(
      ...slide.features.map(([icon, titleKey, descKey, background]) => {
        const item = document.createElement("li");
        const art = document.createElement("span");
        const copy = document.createElement("div");
        const title = document.createElement("strong");
        const description = document.createElement("small");
        art.textContent = icon;
        art.style.setProperty("--feature-bg", background);
        title.textContent = t(titleKey);
        description.textContent = t(descKey);
        copy.append(title, description);
        item.append(art, copy);
        return item;
      }),
    );

    if (onboardingDots) {
      onboardingDots.replaceChildren(
        ...ONBOARDING_SLIDES.map((_, index) => {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = `onboarding-dot${index === onboardingIndex ? " is-on" : ""}`;
          dot.setAttribute("role", "tab");
          dot.setAttribute("aria-selected", index === onboardingIndex ? "true" : "false");
          dot.setAttribute("aria-label", t("onboarding.step", { n: index + 1 }));
          dot.addEventListener("click", () => goToOnboarding(index));
          return dot;
        }),
      );
    }

    if (onboardingTabs) {
      onboardingTabs.replaceChildren(
        ...ONBOARDING_SLIDES.map((tabSlide, index) => {
          const tab = document.createElement("button");
          tab.type = "button";
          tab.className = `onboarding-tab${index === onboardingIndex ? " is-on" : ""}`;
          tab.setAttribute("aria-current", index === onboardingIndex ? "step" : "false");
          tab.innerHTML = `<b>${index + 1}/3</b><img src="${tabSlide.art}" alt="" /><span>${t(tabSlide.ticketKey)}</span>`;
          tab.addEventListener("click", () => goToOnboarding(index));
          return tab;
        }),
      );
    }
  }

  function goToOnboarding(index) {
    onboardingIndex = Math.min(ONBOARDING_SLIDES.length - 1, Math.max(0, Number(index) || 0));
    try { localStorage.setItem(ONBOARDING_KEY, String(onboardingIndex + 1)); } catch (_) {}
    paintOnboarding();
  }

  function closeOnboarding(status = -1) {
    try { localStorage.setItem(ONBOARDING_KEY, String(status)); } catch (_) {}
    if (onboardingModal?.open) onboardingModal.close();
  }

  function openOnboarding({ restart = false } = {}) {
    if (!onboardingModal) {
      announce(t("onboarding.guide.title"));
      return;
    }
    let saved = 0;
    try { saved = Number(localStorage.getItem(ONBOARDING_KEY) || 0); } catch (_) {}
    onboardingIndex = restart ? 0 : saved >= 1 && saved < 3 ? saved - 1 : 0;
    paintOnboarding();
    if (typeof onboardingModal.showModal === "function") onboardingModal.showModal();
    else onboardingModal.setAttribute("open", "");
    onboardingNext?.focus({ preventScroll: true });
  }

  onboardingNext?.addEventListener("click", () => {
    if (onboardingIndex < ONBOARDING_SLIDES.length - 1) {
      goToOnboarding(onboardingIndex + 1);
      return;
    }
    closeOnboarding(3);
    announce(t("onboarding.readyToast"));
  });
  onboardingSkip?.addEventListener("click", () => closeOnboarding(-1));
  onboardingClose?.addEventListener("click", () => closeOnboarding(-1));
  onboardingModal?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeOnboarding(-1);
  });
  onboardingModal?.addEventListener("click", (event) => {
    if (event.target === onboardingModal) closeOnboarding(-1);
  });
  document.getElementById("newbie-guide")?.addEventListener("click", () => openOnboarding({ restart: true }));

  try {
    const params = new URLSearchParams(location.search);
    const forced = params.get("onboarding") === "1";
    const saved = Number(localStorage.getItem(ONBOARDING_KEY) || 0);
    if (forced || saved === 0 || saved === 1 || saved === 2) {
      setTimeout(() => openOnboarding(), 520);
    }
    if (forced) {
      params.delete("onboarding");
      const query = params.toString();
      history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
    }
  } catch (_) {}

  onLangChange(() => {
    applyDom();
    renderProfile();
    renderWeek();
    if (activeZone && picker && !picker.hidden) openPicker(activeZone);
    if (onboardingModal?.open) paintOnboarding();
  });
})();
