(() => {
  const state = {
    arm: null,
    index: 0,
    answers: {},
    config: null,
    itemsById: {},
    order: [],
  };

  const el = {
    home: document.getElementById("home"),
    assess: document.getElementById("assess"),
    shellBar: document.getElementById("shell-bar"),
    itemRoot: document.getElementById("item-root"),
    betweenHost: document.getElementById("between-host"),
    submit: document.getElementById("btn-submit"),
    exit: document.getElementById("btn-exit"),
    end: document.getElementById("end-screen"),
    resume: document.getElementById("resume-modal"),
  };

  async function loadData() {
    const [cfg, seed] = await Promise.all([
      fetch("assessment_config.json").then((r) => r.json()),
      fetch("items.seed.json").then((r) => r.json()),
    ]);
    state.config = cfg;
    seed.items.forEach((it) => {
      state.itemsById[it.id] = it;
    });
    state.order = cfg.levels.flatMap((lv) =>
      lv.items.map((id) => ({ id, levelId: lv.id, zone: lv.zone, domain: lv.domain }))
    );
  }

  function progressKey() {
    return `ailit_progress_${state.arm}`;
  }

  function saveProgress() {
    localStorage.setItem(
      progressKey(),
      JSON.stringify({ index: state.index, answers: state.answers, arm: state.arm })
    );
  }

  function loadProgress(arm) {
    try {
      return JSON.parse(localStorage.getItem(`ailit_progress_${arm}`) || "null");
    } catch {
      return null;
    }
  }

  function clearProgress() {
    localStorage.removeItem(progressKey());
  }

  function ctx() {
    const meta = state.order[state.index] || state.order[state.order.length - 1];
    const levelItems = state.config.levels.find((l) => l.id === meta.levelId)?.items || [];
    const posInLevel = levelItems.indexOf(meta.id) + 1;
    return {
      index: state.index,
      total: state.order.length,
      levelId: meta.levelId,
      zone: meta.zone,
      domain: meta.domain,
      levelProgress: Math.max(0, posInLevel),
      justClearedLevel: false,
    };
  }

  function mountShell() {
    const shell = window.Shells[state.arm];
    shell.mount(el.shellBar, ctx());
  }

  function showItem() {
    if (state.index >= state.order.length) {
      showEnding();
      return;
    }
    el.end.hidden = true;
    el.assess.hidden = false;
    el.home.hidden = true;
    mountShell();
    const meta = state.order[state.index];
    const item = state.itemsById[meta.id];
    const saved = state.answers[item.id];
    window.ItemRenderer.render(item, el.itemRoot, saved);
    updateSubmit();
    el.itemRoot.addEventListener("answerchange", onAnswerChange);
  }

  function onAnswerChange() {
    const meta = state.order[state.index];
    const item = state.itemsById[meta.id];
    const { value } = window.ItemRenderer.collect(item, el.itemRoot);
    state.answers[item.id] = value;
    saveProgress();
    updateSubmit();
  }

  function updateSubmit() {
    const meta = state.order[state.index];
    const item = state.itemsById[meta.id];
    const { valid } = window.ItemRenderer.collect(item, el.itemRoot);
    el.submit.disabled = !valid;
  }

  async function submit() {
    const meta = state.order[state.index];
    const item = state.itemsById[meta.id];
    const { value, valid } = window.ItemRenderer.collect(item, el.itemRoot);
    if (!valid) return;
    state.answers[item.id] = value;

    const levelItems = state.config.levels.find((l) => l.id === meta.levelId).items;
    const atLevelEnd = levelItems[levelItems.length - 1] === meta.id;

    state.index += 1;
    saveProgress();
    el.itemRoot.removeEventListener("answerchange", onAnswerChange);

    const shell = window.Shells[state.arm];
    const betweenCtx = {
      index: state.index,
      total: state.order.length,
      justClearedLevel: atLevelEnd,
      zone: meta.zone,
      levelId: meta.levelId,
    };
    const maybe = shell.between?.(el.betweenHost, betweenCtx);
    if (maybe && typeof maybe.then === "function") await maybe;

    showItem();
  }

  function showEnding() {
    el.assess.hidden = true;
    el.end.hidden = false;
    clearProgress();
  }

  function openResume(arm) {
    const p = loadProgress(arm);
    if (!p || p.index <= 0) {
      startArm(arm, true);
      return;
    }
    el.resume.hidden = false;
    el.resume.dataset.arm = arm;
    document.getElementById("resume-text").textContent =
      `检测到「${window.Shells[arm] ? document.querySelector(`[data-arm="${arm}"] .arm-name`)?.textContent || arm : arm}」进度：第 ${p.index + 1}/15 题。`;
  }

  function startArm(arm, fresh) {
    state.arm = arm;
    if (fresh) {
      state.index = 0;
      state.answers = {};
      clearProgress();
    } else {
      const p = loadProgress(arm);
      state.index = p?.index || 0;
      state.answers = p?.answers || {};
    }
    el.resume.hidden = true;
    showItem();
  }

  function exitAssess() {
    // neutral exit — same for all arms
    saveProgress();
    el.assess.hidden = true;
    el.home.hidden = false;
    el.end.hidden = true;
  }

  document.querySelectorAll("[data-arm]").forEach((btn) => {
    btn.addEventListener("click", () => openResume(btn.dataset.arm));
  });

  el.submit.addEventListener("click", () => submit());
  el.exit.addEventListener("click", () => exitAssess());
  document.getElementById("btn-resume").addEventListener("click", () => {
    startArm(el.resume.dataset.arm, false);
  });
  document.getElementById("btn-restart").addEventListener("click", () => {
    startArm(el.resume.dataset.arm, true);
  });
  document.getElementById("btn-home").addEventListener("click", () => {
    el.end.hidden = true;
    el.home.hidden = false;
  });
  document.querySelector("[data-nav='home']")?.addEventListener("click", (e) => {
    e.preventDefault();
    exitAssess();
  });

  loadData()
    .then(() => {
      document.getElementById("boot-error").hidden = true;
      Object.keys(window.Shells).forEach((id) => {
        const card = document.querySelector(`[data-arm="${id}"]`);
        if (card) window.Shells[id].decorateHome?.(card);
      });
    })
    .catch((err) => {
      console.error(err);
      const box = document.getElementById("boot-error");
      box.hidden = false;
      box.textContent =
        "无法加载题库配置。请用本地服务器打开（如 npx serve），或部署到 Vercel 后再试。";
    });
})();
