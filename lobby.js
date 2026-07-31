import { getEquippedLoadout } from "/castle/castle.js";

(() => {
  const ZONE_META = {
    castle: {
      title: "知识城堡",
      ico: "/assets/park/clay/castle.png",
      links: [
        { href: "/castle", name: "积分兑换区", desc: "1–5 级奖池兑换装扮" },
        { href: "/nuannuan", name: "知识星橱", desc: "答题收集 · 解锁星橱" },
      ],
    },
    adventure: {
      title: "冒险冲刺区",
      ico: "/assets/park/clay/adventure.png",
      links: [
        { href: "/parkour", name: "云城冲刺", desc: "神庙逃亡 · 答对吃币" },
        { href: "/race", name: "AI 极速赛道", desc: "街机竞速 · 答对加速" },
      ],
    },
    arena: {
      title: "知识竞技场",
      ico: "/assets/park/clay/arena.png",
      links: [
        { href: "/kahoot", name: "AI 素养挑战赛", desc: "限时抢答 · 即时排行" },
        { href: "/monopoly", name: "AI 地产大亨", desc: "棋盘经营 · 答对赚钱" },
      ],
    },
    town: {
      title: "装扮小镇",
      ico: "/assets/park/clay/town.png",
      links: [
        { href: "/nuannuan/login", name: "AI 角色登录", desc: "暖暖风 · 建角登录" },
        { href: "/explorer", name: "建立你的探索者", desc: "自定义角色 · 开启探索" },
      ],
    },
  };

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

  let activeZone = null;

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
    const meta = ZONE_META[zone];
    if (!meta || !picker || !pickerLinks) return;

    setActiveZone(zone);
    scrollGuide(zone);

    if (pickerIco) pickerIco.src = meta.ico;
    if (pickerTitle) pickerTitle.textContent = meta.title;
    pickerLinks.innerHTML = meta.links
      .map(
        (link) =>
          `<a href="${link.href}"><span>${link.name}</span><small>${link.desc}</small></a>`
      )
      .join("");

    picker.hidden = false;
    announce(`已打开：${meta.title}`);
  }

  function focusZone(zone) {
    if (!zone || !ZONE_META[zone]) return;
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
      const name = link.querySelector("strong")?.textContent || "玩法";
      announce(`前往：${name}`);
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

  // Keyboard 1–4 → open matching zone
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

  // Soft parallax on island
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

  // Profile from castle wallet / loadout
  try {
    const load = getEquippedLoadout();
    const avatar = document.getElementById("profile-avatar");
    const name = document.getElementById("profile-name");
    const level = document.getElementById("profile-level");
    const points = document.getElementById("profile-points");
    const coins = document.getElementById("profile-coins");
    if (avatar) avatar.textContent = load.frame?.icon || load.pet?.icon || "🧒";
    if (name) name.textContent = load.name || "小探索者";
    if (level) {
      const lv = Math.max(1, Math.floor((Number(load.lifetime) || 0) / 500) + 1);
      level.textContent = load.title
        ? `Lv.${lv} ${load.title.titleText || load.title.name.replace(/^称号·/, "")}`
        : `Lv.${lv} 探索者`;
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

  // Week star progress
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
    if (weekCount) weekCount.textContent = `${weekDays}/5 天`;
  }
  renderWeek();
  requestAnimationFrame(() => renderWeek());

  document.getElementById("week-gift")?.addEventListener("click", () => {
    if (weekDays >= 5) {
      announce("礼物已领取，下周继续加油！");
      return;
    }
    weekDays = Math.min(5, weekDays + 1);
    try { localStorage.setItem(WEEK_KEY, String(weekDays)); } catch (_) {}
    renderWeek();
    announce(weekDays >= 5 ? "打卡完成！礼物已放入背包灵感盒" : `打卡成功：${weekDays}/5 天`);
  });

  // Soft UI actions
  document.getElementById("daily-banner")?.addEventListener("click", () => {
    announce("今日任务：完成任意一场冲刺或挑战赛");
    focusZone("adventure");
  });
  document.getElementById("btn-activity")?.addEventListener("click", () => {
    announce("活动中心：本周双倍积分进行中");
  });
  document.getElementById("btn-achieve")?.addEventListener("click", () => {
    announce("成就勋章：继续探索可解锁新徽章");
  });
  document.getElementById("map-mini")?.addEventListener("click", () => {
    islandStage?.scrollIntoView({ behavior: "smooth", block: "center" });
    announce("园区地图已居中");
  });
  document.getElementById("btn-settings")?.addEventListener("click", () => {
    announce("设置：音效与提醒将在后续版本开放");
  });
  document.getElementById("btn-explore")?.addEventListener("click", () => {
    islandStage?.scrollIntoView({ behavior: "smooth", block: "center" });
    focusZone("castle");
    announce("探索模式：点击地图编号 1–4 进入分区");
  });

  // Newbie guide modal
  const openGuide = () => {
    if (typeof guideModal?.showModal === "function") guideModal.showModal();
    else announce("先登录角色，再去冲刺赚积分，最后回城堡兑换装扮");
  };
  document.getElementById("newbie-guide")?.addEventListener("click", openGuide);
  document.getElementById("guide-start")?.addEventListener("click", () => {
    announce("从装扮小镇开始创建角色吧");
    window.location.href = "/nuannuan/login";
  });
  try {
    if (!localStorage.getItem("nn_park_guide_seen")) {
      setTimeout(openGuide, 700);
      localStorage.setItem("nn_park_guide_seen", "1");
    }
  } catch (_) {}
})();
