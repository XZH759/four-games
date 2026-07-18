/**
 * Shells — 壳层（仅在题与题之间生效）
 * plain / stages / collect / race
 */
window.Shells = {
  plain: {
    id: "plain",
    mount(bar, ctx) {
      bar.innerHTML = `<p class="shell-plain">第 ${ctx.index + 1}/${ctx.total} 题</p>`;
    },
    between() {},
    onLevelClear() {},
    decorateHome(card) {
      card.querySelector(".arm-desc").textContent = "无壳对照。仅页码「第 n/15 题」。";
    },
  },

  stages: {
    id: "stages",
    mount(bar, ctx) {
      const pct = Math.round(((ctx.index) / ctx.total) * 100);
      const levelPct = Math.round((ctx.levelProgress / 3) * 100);
      bar.innerHTML = `
        <div class="shell-stages">
          <div class="zone-chip">${ctx.zone}</div>
          <div class="circuit-map" aria-hidden="true">${this.mapSvg(ctx)}</div>
          <div class="dial">
            <svg viewBox="0 0 36 36" class="dial-ring">
              <path class="dial-bg" d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 1 1 0-31"/>
              <path class="dial-fg" stroke-dasharray="${levelPct}, 100" d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 1 1 0-31"/>
            </svg>
            <span>关内 ${ctx.levelProgress}/3</span>
          </div>
          <p class="shell-copy">提交即接通，与对错无关 · 总进度 ${pct}%</p>
        </div>`;
    },
    mapSvg(ctx) {
      const zones = ["信号塔", "工坊", "指挥室", "实验室"];
      const active = Math.min(3, Math.floor(ctx.index / 3) >= 4 ? 3 : Math.floor(ctx.index / 3) > 1 ? Math.floor(ctx.index / 3) - 1 : Math.floor(ctx.index / 3));
      // L1-2 signal, L3 create, L4 manage, L5 design → map index
      let zi = 0;
      if (ctx.levelId === "L3") zi = 1;
      else if (ctx.levelId === "L4") zi = 2;
      else if (ctx.levelId === "L5") zi = 3;
      else zi = 0;
      return zones
        .map((z, i) => `<span class="node ${i <= zi ? "lit" : ""} ${i === zi ? "now" : ""}">${z}</span>${i < 3 ? '<span class="wire"></span>' : ""}`)
        .join("");
    },
    between(host, ctx) {
      if (!ctx.justClearedLevel) return Promise.resolve();
      const toast = document.createElement("div");
      toast.className = "between-toast";
      toast.innerHTML = `<div><img src="assets/bot-buddy.png" alt=""/><p>区域接通 · ${ctx.zone}</p><button type="button">继续</button></div>`;
      host.appendChild(toast);
      return new Promise((resolve) => {
        const t = setTimeout(() => { toast.remove(); resolve(); }, 2000);
        toast.querySelector("button").onclick = () => { clearTimeout(t); toast.remove(); resolve(); };
      });
    },
    onLevelClear() {},
    decorateHome(card) {
      card.querySelector(".arm-desc").textContent = "电路地图 + 密码机度盘（去惩罚）。提交即推进。";
    },
  },

  collect: {
    id: "collect",
    parts: [
      { id: "hat", branch: "外观", label: "天线帽", icon: "🎩" },
      { id: "sticker", branch: "外观", label: "贴纸", icon: "⭐" },
      { id: "antenna", branch: "装备", label: "强化天线", icon: "📡" },
      { id: "pack", branch: "装备", label: "背包", icon: "🎒" },
      { id: "drone", branch: "伙伴", label: "小无人机", icon: "🛸" },
      { id: "scarf", branch: "外观", label: "派对围巾", icon: "🧣" },
      { id: "badge", branch: "装备", label: "庄园徽章", icon: "🏅" },
    ],
    stateKey: "ailit_collect_v2",

    load() {
      try {
        return JSON.parse(localStorage.getItem(this.stateKey) || "{}");
      } catch {
        return {};
      }
    },
    save(s) {
      localStorage.setItem(this.stateKey, JSON.stringify(s));
    },
    ensure(answeredCount) {
      const s = { unlocked: [], growth: 0, ...this.load() };
      const shouldHave = Math.min(this.parts.length, Math.floor(answeredCount / 2));
      while (s.unlocked.length < shouldHave) {
        const next = this.parts[s.unlocked.length];
        s.unlocked.push(next.id);
      }
      this.save(s);
      return s;
    },
    mount(bar, ctx) {
      const s = this.ensure(ctx.index);
      const nextIdx = s.unlocked.length;
      const next = this.parts[nextIdx];
      const untilNext = next ? 2 - (ctx.index % 2) : 0;
      const growth = ctx.levelId === "L5" ? 3 : ctx.levelId === "L3" || ctx.levelId === "L4" ? 2 : 1;

      bar.innerHTML = `
        <div class="shell-collect">
          <div class="pet-row">
            <div class="pet-stage growth-${growth}" data-log="accessory-view">
              <img src="assets/bot-buddy.png" alt="机伴"/>
              <div class="wear">${s.unlocked.map((id) => {
                const p = this.parts.find((x) => x.id === id);
                return p ? `<span title="${p.label}">${p.icon}</span>` : "";
              }).join("")}</div>
            </div>
            <div class="tree">
              <p class="tree-title">配件树 · 确定性解锁</p>
              <div class="branches">
                ${["外观", "装备", "伙伴"].map((b) => `
                  <div class="branch">
                    <span>${b}</span>
                    ${this.parts.filter((p) => p.branch === b).map((p) => `
                      <em class="${s.unlocked.includes(p.id) ? "got" : ""}" title="${p.label}">${p.icon}</em>
                    `).join("")}
                  </div>`).join("")}
              </div>
              <p class="next-reward">${next ? `下一件预览：${next.icon} ${next.label}（再 ${untilNext || 2} 题）` : "全部解锁完成"}</p>
            </div>
          </div>
        </div>`;

      const stage = bar.querySelector("[data-log='accessory-view']");
      if (stage) {
        const t0 = performance.now();
        const log = () => {
          const ms = Math.round(performance.now() - t0);
          const logs = JSON.parse(localStorage.getItem("ailit_collect_viewlog") || "[]");
          logs.push({ ms, at: Date.now(), index: ctx.index });
          localStorage.setItem("ailit_collect_viewlog", JSON.stringify(logs.slice(-50)));
        };
        stage.addEventListener("mouseenter", () => { stage._t0 = performance.now(); });
        stage.addEventListener("mouseleave", () => {
          if (stage._t0) {
            const ms = Math.round(performance.now() - stage._t0);
            const logs = JSON.parse(localStorage.getItem("ailit_collect_viewlog") || "[]");
            logs.push({ ms, at: Date.now(), index: ctx.index, type: "blur" });
            localStorage.setItem("ailit_collect_viewlog", JSON.stringify(logs.slice(-50)));
          }
        });
        window.addEventListener("blur", log, { once: true });
      }
    },
    between(host, ctx) {
      if (!(ctx.index > 0 && ctx.index % 2 === 0)) return Promise.resolve();
      const s = this.ensure(ctx.index);
      const just = this.parts[s.unlocked.length - 1];
      if (!just) return Promise.resolve();
      const toast = document.createElement("div");
      toast.className = "between-toast collect-toast";
      toast.innerHTML = `<div><p>解锁 ${just.icon} ${just.label}</p><p class="next-reward">下一件预览仍可见</p><button type="button">收下</button></div>`;
      host.appendChild(toast);
      return new Promise((resolve) => {
        const t = setTimeout(() => { toast.remove(); resolve(); }, 1800);
        toast.querySelector("button").onclick = () => { clearTimeout(t); toast.remove(); resolve(); };
      });
    },
    decorateHome(card) {
      card.querySelector(".arm-desc").textContent = "每 2 题一件配件；L1/L3/L5 三段成长。下一件永远预览可见。";
    },
  },

  race: {
    id: "race",
    flagKey: "ailit_race_ethics_flag",
    mount(bar, ctx) {
      const enabled = localStorage.getItem(this.flagKey) === "1";
      const you = ctx.index;
      // anonymous peer 07 — simulated slightly behind/ahead, never "chase"
      const peer = Math.max(0, Math.min(ctx.total, you + (you % 3 === 0 ? -1 : 1)));
      const youPct = Math.round((you / ctx.total) * 100);
      const peerPct = Math.round((peer / ctx.total) * 100);

      if (!enabled) {
        bar.innerHTML = `
          <div class="shell-race muted">
            <p class="ethics-note">比赛臂默认关闭（伦理 flag）。开启后按<strong>答题数</strong>排名，与对错无关。</p>
            <label class="flag-toggle"><input type="checkbox" id="race-flag"/> 我已获伦理批准，启用同屏竞速</label>
            <p class="shell-plain">第 ${ctx.index + 1}/${ctx.total} 题（flag 关闭时退化为页码）</p>
          </div>`;
        bar.querySelector("#race-flag")?.addEventListener("change", (e) => {
          localStorage.setItem(this.flagKey, e.target.checked ? "1" : "0");
          this.mount(bar, ctx);
        });
        return;
      }

      bar.innerHTML = `
        <div class="shell-race">
          <p class="rank-note">榜单按答题数 · 与对错无关 · 无淘汰</p>
          <div class="track">
            <div class="racer you" style="left:${youPct}%"><img src="assets/bot-buddy.png" alt="你"/></div>
            <div class="racer peer" style="left:${peerPct}%"><span>07</span></div>
          </div>
          <ol class="mini-board">
            <li class="${you >= peer ? "lead" : ""}">你 · ${you} 题</li>
            <li class="${peer > you ? "lead" : ""}">07号 · ${peer} 题</li>
          </ol>
        </div>`;
    },
    between() {},
    decorateHome(card) {
      card.querySelector(".arm-desc").textContent = "电路竞速 + 答题数榜（伦理 flag 默认关）。无追逃、无淘汰。";
    },
  },
};
