/**
 * ItemRenderer — 题层统一呈现（四臂完全一致）
 * 检验法：只改呈现，不改题干/选项文字；不引入计时/迷你游戏作答。
 */
window.ItemRenderer = {
  seqIcons(text) {
    return String(text)
      .replaceAll("{ok}", '<span class="seq seq-ok" title="正确">✓</span>')
      .replaceAll("{no}", '<span class="seq seq-no" title="错误">✗</span>');
  },

  render(item, root, saved) {
    root.innerHTML = "";
    root.dataset.itemId = item.id;
    root.dataset.itemType = item.type;

    const stem = document.createElement("p");
    stem.className = "item-stem";
    stem.textContent = item.stem;
    root.appendChild(stem);

    if (item.type === "open_triple") {
      this.renderOpenTriple(item, root, saved);
      return;
    }
    if (item.type === "table_multi" || item.type === "table_single") {
      this.renderTableCards(item, root, saved);
      return;
    }
    if (item.type === "order") {
      this.renderOrder(item, root, saved);
      return;
    }
    if (item.type === "multi") {
      this.renderChoices(item, root, saved, true);
      return;
    }
    this.renderChoices(item, root, saved, false);
  },

  renderChoices(item, root, saved, multi) {
    const hint = document.createElement("p");
    hint.className = "item-hint";
    hint.textContent = multi ? "多选题（可选多项）" : "单选题";
    root.appendChild(hint);

    const list = document.createElement("div");
    list.className = "opt-list";
    list.setAttribute("role", multi ? "group" : "radiogroup");

    const picked = new Set(
      multi
        ? Array.isArray(saved) ? saved : []
        : saved != null ? [saved] : []
    );

    item.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt-btn" + (picked.has(opt.key) ? " is-on" : "");
      btn.dataset.key = opt.key;

      const key = document.createElement("span");
      key.className = "opt-key";
      key.textContent = opt.key;

      const body = document.createElement("span");
      body.className = "opt-body";
      if (opt.render === "seq_icons") {
        body.innerHTML = this.seqIcons(opt.text);
      } else {
        body.textContent = opt.text;
      }

      btn.append(key, body);
      btn.addEventListener("click", () => {
        if (multi) {
          btn.classList.toggle("is-on");
        } else {
          list.querySelectorAll(".opt-btn").forEach((b) => b.classList.remove("is-on"));
          btn.classList.add("is-on");
        }
        root.dispatchEvent(new CustomEvent("answerchange", { bubbles: true }));
      });
      list.appendChild(btn);
    });
    root.appendChild(list);
  },

  renderOrder(item, root, saved) {
    const steps = document.createElement("ol");
    steps.className = "order-steps";
    item.steps.forEach((s) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${s.id}.</strong> ${s.text}`;
      steps.appendChild(li);
    });
    root.appendChild(steps);
    this.renderChoices(item, root, saved, false);
  },

  renderTableCards(item, root, saved) {
    const multi = item.type === "table_multi";
    const hint = document.createElement("p");
    hint.className = "item-hint";
    hint.textContent = multi ? "请选择合理项（可多选）· 卡片可左右滑动" : "请选择一项 · 表格已卡片化";
    root.appendChild(hint);

    if (item.table) {
      const scroller = document.createElement("div");
      scroller.className = "card-scroll";
      item.table.rows.forEach((row) => {
        const card = document.createElement("article");
        card.className = "data-card";
        card.innerHTML = `<h4>${row[0]}</h4>`;
        item.table.headers.slice(1).forEach((h, i) => {
          card.innerHTML += `<p><span>${h}</span><strong>${row[i + 1]}</strong></p>`;
        });
        scroller.appendChild(card);
      });
      root.appendChild(scroller);
    }

    if (item.cards) {
      const scroller = document.createElement("div");
      scroller.className = "card-scroll";
      const picked = new Set(
        multi ? (Array.isArray(saved) ? saved : []) : saved != null ? [saved] : []
      );
      item.cards.forEach((c) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "choice-card" + (picked.has(c.key) ? " is-on" : "");
        card.dataset.key = c.key;
        card.innerHTML = `
          <span class="opt-key">${c.key}</span>
          <p class="card-practice"><em>做法</em>${c.practice}</p>
          <p class="card-explain"><em>解释</em>${c.explain}</p>
        `;
        card.addEventListener("click", () => {
          if (multi) {
            card.classList.toggle("is-on");
          } else {
            scroller.querySelectorAll(".choice-card").forEach((x) => x.classList.remove("is-on"));
            card.classList.add("is-on");
          }
          root.dispatchEvent(new CustomEvent("answerchange", { bubbles: true }));
        });
        scroller.appendChild(card);
      });
      root.appendChild(scroller);
      return;
    }

    this.renderChoices(item, root, saved, false);
  },

  renderOpenTriple(item, root, saved) {
    const wrap = document.createElement("div");
    wrap.className = "open-triple";
    const vals = saved && typeof saved === "object" ? saved : {};
    item.prompts.forEach((p, i) => {
      const block = document.createElement("div");
      block.className = "open-block";
      const label = document.createElement("label");
      label.textContent = `${i + 1}. ${p}`;
      label.setAttribute("for", `open-${item.id}-${i}`);
      const ta = document.createElement("textarea");
      ta.id = `open-${item.id}-${i}`;
      ta.rows = 3;
      ta.placeholder = "在此作答…";
      ta.value = vals[String(i)] || "";
      ta.addEventListener("blur", () => {
        root.dispatchEvent(new CustomEvent("answerchange", { bubbles: true, detail: { autosave: true } }));
      });
      ta.addEventListener("input", () => {
        root.dispatchEvent(new CustomEvent("answerchange", { bubbles: true }));
      });
      block.append(label, ta);
      wrap.appendChild(block);
    });
    root.appendChild(wrap);
  },

  collect(item, root) {
    if (item.type === "open_triple") {
      const out = {};
      root.querySelectorAll("textarea").forEach((ta, i) => {
        out[String(i)] = ta.value.trim();
      });
      const filled = Object.values(out).filter(Boolean).length;
      return { value: out, valid: filled === item.prompts.length };
    }
    if (item.type === "table_multi" || item.type === "multi") {
      const keys = [...root.querySelectorAll(".opt-btn.is-on, .choice-card.is-on")].map((b) => b.dataset.key);
      return { value: keys, valid: keys.length > 0 };
    }
    const one = root.querySelector(".opt-btn.is-on, .choice-card.is-on");
    return { value: one ? one.dataset.key : null, valid: !!one };
  },
};
