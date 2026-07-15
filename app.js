(() => {
  const panels = Array.from(document.querySelectorAll("[data-panel]"));

  function showPanel(id) {
    panels.forEach((panel) => {
      const match = panel.dataset.panel === id;
      panel.hidden = !match;
      panel.classList.toggle("is-active", match);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (id === "memory") memory.reset();
    if (id !== "versus") versus.stop();
    if (id !== "sprint") sprint.stop();
  }

  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => showPanel(btn.dataset.open));
  });

  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showPanel(btn.dataset.nav);
    });
  });

  /* ——— 01 快问快答 ——— */
  const quizBank = [
    { q: "太阳系中最大的行星是？", options: ["地球", "木星", "火星", "金星"], a: 1 },
    { q: "「HTTPS」里的「S」代表？", options: ["Speed", "Secure", "Server", "System"], a: 1 },
    { q: "一周有几天？", options: ["5", "6", "7", "8"], a: 2 },
    { q: "水的化学式是？", options: ["CO₂", "H₂O", "NaCl", "O₂"], a: 1 },
    { q: "「京剧」属于哪一类艺术形式？", options: ["歌剧", "戏曲", "话剧", "音乐剧"], a: 1 },
  ];

  const quiz = {
    scoreEl: document.getElementById("quiz-score"),
    progressEl: document.getElementById("quiz-progress"),
    questionEl: document.getElementById("quiz-question"),
    optionsEl: document.getElementById("quiz-options"),
    feedbackEl: document.getElementById("quiz-feedback"),
    startBtn: document.getElementById("quiz-start"),
    index: 0,
    score: 0,
    active: false,

    start() {
      this.index = 0;
      this.score = 0;
      this.active = true;
      this.scoreEl.textContent = "0";
      this.feedbackEl.textContent = "";
      this.feedbackEl.classList.remove("is-bad");
      this.startBtn.hidden = true;
      this.render();
    },

    render() {
      if (this.index >= quizBank.length) {
        this.questionEl.textContent = `全部完成！总分 ${this.score}/${quizBank.length}`;
        this.optionsEl.innerHTML = "";
        this.progressEl.textContent = `${quizBank.length}/${quizBank.length}`;
        this.feedbackEl.textContent = this.score === quizBank.length ? "满分！漂亮。" : "再来一轮冲击满分吧。";
        this.startBtn.hidden = false;
        this.startBtn.textContent = "再来一轮";
        this.active = false;
        return;
      }

      const item = quizBank[this.index];
      this.questionEl.textContent = item.q;
      this.progressEl.textContent = `${this.index + 1}/${quizBank.length}`;
      this.optionsEl.innerHTML = "";

      item.options.forEach((text, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = text;
        btn.addEventListener("click", () => this.answer(i));
        this.optionsEl.appendChild(btn);
      });
    },

    answer(choice) {
      if (!this.active) return;
      const item = quizBank[this.index];
      const buttons = Array.from(this.optionsEl.querySelectorAll("button"));
      buttons.forEach((b) => {
        b.disabled = true;
      });
      buttons[item.a].classList.add("is-correct");

      if (choice === item.a) {
        this.score += 1;
        this.scoreEl.textContent = String(this.score);
        this.feedbackEl.textContent = "答对了！";
        this.feedbackEl.classList.remove("is-bad");
      } else {
        buttons[choice].classList.add("is-wrong");
        this.feedbackEl.textContent = "不对，看下一题。";
        this.feedbackEl.classList.add("is-bad");
      }

      setTimeout(() => {
        this.index += 1;
        this.feedbackEl.textContent = "";
        this.render();
      }, 700);
    },
  };

  quiz.startBtn.addEventListener("click", () => quiz.start());

  /* ——— 02 翻牌记忆 ——— */
  const SYMBOLS = ["▲", "●", "■", "★", "◆", "◎", "✦", "☀"];

  const memory = {
    boardEl: document.getElementById("memory-board"),
    movesEl: document.getElementById("memory-moves"),
    pairsEl: document.getElementById("memory-pairs"),
    feedbackEl: document.getElementById("memory-feedback"),
    resetBtn: document.getElementById("memory-reset"),
    deck: [],
    flipped: [],
    pairs: 0,
    moves: 0,
    lock: false,

    reset() {
      const doubled = [...SYMBOLS, ...SYMBOLS];
      this.deck = doubled
        .map((symbol, i) => ({ id: i, symbol, matched: false }))
        .sort(() => Math.random() - 0.5);
      this.flipped = [];
      this.pairs = 0;
      this.moves = 0;
      this.lock = false;
      this.movesEl.textContent = "0";
      this.pairsEl.textContent = "0/8";
      this.feedbackEl.textContent = "";
      this.render();
    },

    render() {
      this.boardEl.innerHTML = "";
      this.deck.forEach((card, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "card-tile";
        btn.dataset.index = String(index);
        btn.textContent = card.symbol;
        if (card.matched) btn.classList.add("is-matched");
        if (this.flipped.includes(index) || card.matched) btn.classList.add("is-flipped");
        btn.addEventListener("click", () => this.flip(index));
        this.boardEl.appendChild(btn);
      });
    },

    flip(index) {
      const card = this.deck[index];
      if (this.lock || card.matched || this.flipped.includes(index)) return;
      if (this.flipped.length >= 2) return;

      this.flipped.push(index);
      this.render();

      if (this.flipped.length < 2) return;

      this.moves += 1;
      this.movesEl.textContent = String(this.moves);
      const [a, b] = this.flipped;
      const cardA = this.deck[a];
      const cardB = this.deck[b];

      if (cardA.symbol === cardB.symbol) {
        cardA.matched = true;
        cardB.matched = true;
        this.pairs += 1;
        this.pairsEl.textContent = `${this.pairs}/8`;
        this.flipped = [];
        this.render();
        if (this.pairs === 8) {
          this.feedbackEl.textContent = `清空！共 ${this.moves} 步。`;
        }
      } else {
        this.lock = true;
        setTimeout(() => {
          this.flipped = [];
          this.lock = false;
          this.render();
        }, 650);
      }
    },
  };

  memory.resetBtn.addEventListener("click", () => memory.reset());

  /* ——— 03 限时冲刺 ——— */
  const sprint = {
    timeEl: document.getElementById("sprint-time"),
    scoreEl: document.getElementById("sprint-score"),
    arenaEl: document.getElementById("sprint-arena"),
    targetEl: document.getElementById("sprint-target"),
    idleEl: document.getElementById("sprint-idle"),
    feedbackEl: document.getElementById("sprint-feedback"),
    startBtn: document.getElementById("sprint-start"),
    score: 0,
    timeLeft: 15,
    timer: null,
    running: false,

    start() {
      this.stop();
      this.score = 0;
      this.timeLeft = 15;
      this.running = true;
      this.scoreEl.textContent = "0";
      this.timeEl.textContent = "15";
      this.feedbackEl.textContent = "快！目标在跳动。";
      this.feedbackEl.classList.remove("is-bad");
      this.idleEl.hidden = true;
      this.targetEl.hidden = false;
      this.startBtn.disabled = true;
      this.startBtn.textContent = "冲刺中…";
      this.moveTarget();
      this.timer = setInterval(() => {
        this.timeLeft -= 1;
        this.timeEl.textContent = String(this.timeLeft);
        if (this.timeLeft <= 0) this.finish();
      }, 1000);
    },

    stop() {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
      this.running = false;
      this.targetEl.hidden = true;
      this.idleEl.hidden = false;
      this.startBtn.disabled = false;
      this.startBtn.textContent = "开始冲刺";
    },

    finish() {
      this.running = false;
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
      this.targetEl.hidden = true;
      this.idleEl.hidden = false;
      this.idleEl.textContent = "时间到";
      this.startBtn.disabled = false;
      this.startBtn.textContent = "再冲一次";
      this.feedbackEl.textContent = `本局得分：${this.score}`;
    },

    moveTarget() {
      const pad = 40;
      const w = this.arenaEl.clientWidth;
      const h = this.arenaEl.clientHeight;
      const x = pad + Math.random() * (w - pad * 2);
      const y = pad + Math.random() * (h - pad * 2);
      this.targetEl.style.left = `${x}px`;
      this.targetEl.style.top = `${y}px`;
    },

    hit() {
      if (!this.running) return;
      this.score += 1;
      this.scoreEl.textContent = String(this.score);
      this.moveTarget();
    },
  };

  sprint.startBtn.addEventListener("click", () => sprint.start());
  sprint.targetEl.addEventListener("click", () => sprint.hit());

  /* ——— 04 双人对决 ——— */
  const versus = {
    aEl: document.getElementById("racer-a"),
    bEl: document.getElementById("racer-b"),
    feedbackEl: document.getElementById("versus-feedback"),
    startBtn: document.getElementById("versus-start"),
    posA: 0,
    posB: 0,
    max: 0,
    running: false,
    step: 4,

    measure() {
      const track = this.aEl.parentElement;
      this.max = Math.max(0, track.clientWidth - this.aEl.offsetWidth - 8);
    },

    start() {
      this.measure();
      this.posA = 0;
      this.posB = 0;
      this.running = true;
      this.paint();
      this.feedbackEl.textContent = "开赛！A/D 对战 ←/→";
      this.feedbackEl.classList.remove("is-bad");
      this.startBtn.textContent = "重新开战";
    },

    stop() {
      this.running = false;
      this.posA = 0;
      this.posB = 0;
      this.paint();
      this.feedbackEl.textContent = "点击开始后，双方一起狂按键盘。";
      this.startBtn.textContent = "准备开战";
    },

    paint() {
      this.aEl.style.left = `${4 + this.posA}px`;
      this.bEl.style.left = `${4 + this.posB}px`;
    },

    nudge(who) {
      if (!this.running) return;
      this.measure();
      if (who === "a") this.posA = Math.min(this.max, this.posA + this.step);
      if (who === "b") this.posB = Math.min(this.max, this.posB + this.step);
      this.paint();

      if (this.posA >= this.max || this.posB >= this.max) {
        this.running = false;
        if (this.posA >= this.max && this.posB >= this.max) {
          this.feedbackEl.textContent = "平局！再来。";
        } else if (this.posA >= this.max) {
          this.feedbackEl.textContent = "选手 A 获胜！";
        } else {
          this.feedbackEl.textContent = "选手 B 获胜！";
        }
      }
    },
  };

  versus.startBtn.addEventListener("click", () => versus.start());

  window.addEventListener("keydown", (e) => {
    if (!versus.running) return;
    const key = e.key.toLowerCase();
    if (key === "a" || key === "d") {
      e.preventDefault();
      versus.nudge("a");
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      versus.nudge("b");
    }
  });

  window.addEventListener("resize", () => {
    if (document.getElementById("versus").hidden === false) {
      versus.measure();
      versus.paint();
    }
  });
})();
