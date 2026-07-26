import { getEquippedLoadout } from "/castle/castle.js";

(() => {
  const pins = [...document.querySelectorAll("[data-pin]")];
  const items = [...document.querySelectorAll(".legend-item[data-pin]")];
  const hotspots = [...document.querySelectorAll(".map-hotspot[data-pin]")];
  const hotSlots = [...document.querySelectorAll(".hot-slot[data-pin]")];
  const toast = document.getElementById("page-toast");

  let activePin = null;

  function announce(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(announce.timer);
    announce.timer = setTimeout(() => toast.classList.remove("is-visible"), 1600);
  }

  function setHot(pinId, on) {
    if (!pinId) return;
    document.querySelectorAll(`[data-pin="${pinId}"]`).forEach((el) => {
      el.classList.toggle("is-hot", on);
    });
  }

  function setZoneHot(zone, on) {
    if (!zone) return;
    document.querySelectorAll(`[data-zone="${zone}"]`).forEach((el) => {
      el.classList.toggle("is-hot", on);
    });
  }

  function setActive(pinId) {
    if (activePin) {
      document.querySelectorAll(`[data-pin="${activePin}"]`).forEach((el) => {
        el.classList.remove("is-active");
      });
    }
    activePin = pinId;
    if (!pinId) return;
    document.querySelectorAll(`[data-pin="${pinId}"]`).forEach((el) => {
      el.classList.add("is-active");
    });
  }

  function bind(el) {
    const pin = el.getAttribute("data-pin");
    const zoneKey =
      el.getAttribute("data-zone") ||
      el.closest("[data-zone]")?.getAttribute("data-zone") ||
      null;

    const enter = () => {
      setHot(pin, true);
      setZoneHot(zoneKey, true);
    };
    const leave = () => {
      setHot(pin, false);
      setZoneHot(zoneKey, false);
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focus", enter);
    el.addEventListener("blur", leave);

    el.addEventListener("click", () => {
      setActive(pin);
      const label =
        el.getAttribute("aria-label") ||
        el.querySelector("strong")?.textContent ||
        el.getAttribute("title") ||
        `入口 ${pin}`;
      announce(`前往：${label}`);
    });
  }

  pins.forEach(bind);

  // 地图悬停时，桌面端把对应列表项滚入视野
  hotspots.forEach((pin) => {
    pin.addEventListener("pointerenter", () => {
      const id = pin.getAttribute("data-pin");
      const item = items.find((i) => i.getAttribute("data-pin") === id);
      if (item && !window.matchMedia("(max-width: 960px)").matches) {
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  });

  // 列表悬停时，短暂脉冲对应地图热区
  items.forEach((item) => {
    item.addEventListener("pointerenter", () => {
      const id = item.getAttribute("data-pin");
      const spot = hotspots.find((h) => h.getAttribute("data-pin") === id);
      if (!spot) return;
      spot.classList.add("is-hot");
    });
  });

  // 键盘：数字键快速聚焦对应入口（0=知识城堡，1–7=连续玩法）
  const keyMap = {
    0: "0",
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
  };
  window.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea, select, [contenteditable]")) return;
    const pinId = keyMap[e.key];
    if (!pinId) return;
    const target =
      hotspots.find((h) => h.getAttribute("data-pin") === pinId) ||
      items.find((i) => i.getAttribute("data-pin") === pinId);
    if (!target) return;
    e.preventDefault();
    setActive(pinId);
    setHot(pinId, true);
    target.focus({ preventScroll: false });
    target.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });

  // 更新提示（演示用：首次访问展示，可稍后关闭）
  const updatePill = document.getElementById("update-pill");
  const updLater = document.getElementById("upd-later");
  const updNow = document.getElementById("upd-now");
  try {
    if (updatePill && !localStorage.getItem("nn_park_update_dismissed")) {
      updatePill.hidden = false;
    }
  } catch (_) {
    if (updatePill) updatePill.hidden = false;
  }
  updLater?.addEventListener("click", () => {
    if (updatePill) updatePill.hidden = true;
    try {
      localStorage.setItem("nn_park_update_dismissed", "1");
    } catch (_) {}
  });
  updNow?.addEventListener("click", () => {
    announce("已是最新版本");
    if (updatePill) updatePill.hidden = true;
    try {
      localStorage.setItem("nn_park_update_dismissed", "1");
    } catch (_) {}
  });

  // 大厅展示城堡实装装扮
  try {
    const load = getEquippedLoadout();
    const avatar = document.getElementById("tc-avatar");
    const name = document.getElementById("tc-name");
    const title = document.getElementById("tc-title");
    const pet = document.getElementById("tc-pet");
    const chip = document.getElementById("traveler-chip");
    if (avatar) {
      avatar.textContent = load.frame?.icon || "🧒";
      avatar.dataset.frame = load.frame?.frameStyle || "";
    }
    if (name) name.textContent = load.name || "乐园学员";
    if (title) {
      title.textContent = load.title
        ? `${load.title.icon} ${load.title.titleText || load.title.name}`
        : load.pet
          ? `${load.pet.icon} 已装备伙伴`
          : "探险新星";
    }
    if (pet) {
      pet.hidden = !load.pet;
      pet.textContent = load.pet?.icon || "";
    }
    if (chip) {
      const bits = [];
      if (load.parts?.wings) bits.push("wings");
      if (load.trail) bits.push("trail");
      chip.dataset.loaded = bits.length || load.frame || load.title || load.pet ? "1" : "";
    }
  } catch (_) {
    /* wallet optional */
  }

  // 预热热区，避免首悬停闪烁
  hotSlots.forEach((slot) => {
    slot.addEventListener("pointerenter", () => {
      const id = slot.getAttribute("data-pin");
      setHot(id, true);
    });
  });
})();
