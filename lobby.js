(() => {
  const pins = [...document.querySelectorAll(".map-pin[data-pin]")];
  const items = [...document.querySelectorAll(".legend-item[data-pin]")];
  const zones = [...document.querySelectorAll(".zone-land[data-zone], .legend-zone[data-zone]")];

  function setHot(pinId, on) {
    const sel = `[data-pin="${pinId}"]`;
    document.querySelectorAll(sel).forEach((el) => el.classList.toggle("is-hot", on));
  }

  function setZoneHot(zone, on) {
    if (!zone) return;
    document.querySelectorAll(`[data-zone="${zone}"]`).forEach((el) => {
      el.classList.toggle("is-hot", on);
    });
  }

  function bind(el) {
    const pin = el.getAttribute("data-pin");

    let zoneKey = el.closest("[data-zone]")?.getAttribute("data-zone") || null;
    if (!zoneKey && el.classList.contains("map-pin")) {
      const bg = el.querySelector(".pin-bg");
      if (bg?.classList.contains("z-plaza")) zoneKey = "plaza";
      else if (bg?.classList.contains("z-adventure")) zoneKey = "adventure";
      else if (bg?.classList.contains("z-arena")) zoneKey = "arena";
      else if (bg?.classList.contains("z-town")) zoneKey = "town";
    }

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
  }

  pins.forEach(bind);
  items.forEach(bind);

  // 列表滚动到对应项（点地图时）
  pins.forEach((pin) => {
    pin.addEventListener("pointerenter", () => {
      const id = pin.getAttribute("data-pin");
      const item = items.find((i) => i.getAttribute("data-pin") === id);
      if (item && window.matchMedia("(max-width: 900px)").matches === false) {
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  });
})();
