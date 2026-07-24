/**
 * AI 素养挑战赛 — Kahoot-style UI matching design mockups.
 * Solo play with bot classmates; PIN/lobby are simulated locally.
 */
import { AI_QUESTIONS } from "/monopoly/questions.js";

const DEMO_PIN = "AI2025";
const TIME_LIMIT_MS = 20000;
const BASE_POINTS = 500;
const SPEED_POINTS = 500;
const CIRC = 188.4;

const AVATARS = [
  { id: "av01", src: "/assets/kahoot/avatars/kahoot-av-01.png", label: "蓝帽少年" },
  { id: "av02", src: "/assets/kahoot/avatars/kahoot-av-02.png", label: "学院少年" },
  { id: "av03", src: "/assets/kahoot/avatars/kahoot-av-03.png", label: "青绿少年" },
  { id: "av04", src: "/assets/kahoot/avatars/kahoot-av-04.png", label: "粉系少女" },
  { id: "av05", src: "/assets/kahoot/avatars/kahoot-av-05.png", label: "短发少女" },
  { id: "av06", src: "/assets/kahoot/avatars/kahoot-av-06.png", label: "马尾少女" },
];

const BOT_POOL = [
  { name: "学霸国王", avatarId: "av02" },
  { name: "电路兔", avatarId: "av03" },
  { name: "信号喵", avatarId: "av05" },
  { name: "星火仔", avatarId: "av01" },
  { name: "数据狐", avatarId: "av06" },
  { name: "机伴07", avatarId: "av04" },
  { name: "闪电选手", avatarId: "av01" },
  { name: "好奇星", avatarId: "av04" },
  { name: "冷静派", avatarId: "av02" },
  { name: "冲鸭鸭", avatarId: "av03" },
  { name: "代码熊", avatarId: "av05" },
];

function avatarById(id) {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}

function avatarImg(id, className = "") {
  const a = avatarById(id);
  return `<img class="${className}" src="${a.src}" alt="${a.label}" />`;
}

const SHAPES = [
  { cls: "is-red", key: "A", svg: `<svg viewBox="0 0 24 24"><path d="M12 3 22 21H2z"/></svg>` },
  { cls: "is-blue", key: "B", svg: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>` },
  { cls: "is-yellow", key: "C", svg: `<svg viewBox="0 0 24 24"><path d="M12 3l2.5 7.5H22l-6 4.5 2.3 7L12 17.5 5.7 22 8 14.5 2 10h7.5z"/></svg>` },
  { cls: "is-green", key: "D", svg: `<svg viewBox="0 0 24 24"><path d="M12 2 22 12 12 22 2 12z"/></svg>` },
];

const els = {
  join: document.getElementById("screen-join"),
  wait: document.getElementById("screen-wait"),
  play: document.getElementById("screen-play"),
  reveal: document.getElementById("screen-reveal"),
  podium: document.getElementById("screen-podium"),
  pinBoxes: [...document.querySelectorAll(".pin-box")],
  fillPin: document.getElementById("fill-pin"),
  nickname: document.getElementById("nickname"),
  avatarRow: document.getElementById("avatar-row"),
  roundSize: document.getElementById("round-size"),
  joinBtn: document.getElementById("join-btn"),
  helpBtn: document.getElementById("help-btn"),
  leaveWait: document.getElementById("leave-wait"),
  roomCode: document.getElementById("room-code"),
  copyCode: document.getElementById("copy-code"),
  playerGrid: document.getElementById("player-grid"),
  playerCount: document.getElementById("player-count"),
  onlineCount: document.getElementById("online-count"),
  startBtn: document.getElementById("start-btn"),
  roomSettings: document.getElementById("room-settings"),
  qIndex: document.getElementById("q-index"),
  timerText: document.getElementById("timer-text"),
  timerProg: document.getElementById("timer-prog"),
  qDomain: document.getElementById("q-domain"),
  qStem: document.getElementById("q-stem"),
  answers: document.getElementById("answers"),
  youAvatar: document.getElementById("you-avatar"),
  youName: document.getElementById("you-name"),
  youScore: document.getElementById("you-score"),
  youStreak: document.getElementById("you-streak"),
  xpFill: document.getElementById("xp-fill"),
  xpLabel: document.getElementById("xp-label"),
  liveBoard: document.getElementById("live-board"),
  comboText: document.getElementById("combo-text"),
  timelineTrack: document.getElementById("timeline-track"),
  timelineTip: document.getElementById("timeline-tip"),
  itemHint: document.getElementById("item-hint"),
  itemFifty: document.getElementById("item-fifty"),
  itemTime: document.getElementById("item-time"),
  items: document.getElementById("items"),
  buffShield: document.getElementById("buff-shield"),
  buffTime: document.getElementById("buff-time"),
  revealIndex: document.getElementById("reveal-index"),
  revealGain: document.getElementById("reveal-gain"),
  revealAvatar: document.getElementById("reveal-avatar"),
  revealName: document.getElementById("reveal-name"),
  revealTotal: document.getElementById("reveal-total"),
  revealStreak: document.getElementById("reveal-streak"),
  revealCenter: document.querySelector(".reveal-center"),
  revealTitle: document.getElementById("reveal-title"),
  revealSub: document.getElementById("reveal-sub"),
  revealAnswer: document.getElementById("reveal-answer"),
  revealPoints: document.getElementById("reveal-points"),
  revealExplain: document.getElementById("reveal-explain"),
  revealCombo: document.getElementById("reveal-combo"),
  revealComboFill: document.getElementById("reveal-combo-fill"),
  revealComboTip: document.getElementById("reveal-combo-tip"),
  revealBoard: document.getElementById("reveal-board"),
  revealNext: document.getElementById("reveal-next"),
  confetti: document.querySelector(".confetti"),
  podiumSlots: document.getElementById("podium"),
  finalList: document.getElementById("final-list"),
  again: document.getElementById("again"),
  toast: document.getElementById("toast"),
};

const state = {
  pin: "",
  nickname: "",
  avatar: AVATARS[0].id,
  questions: [],
  index: 0,
  players: [],
  streak: 0,
  items: { hint: 2, fifty: 1, time: 1 },
  shield: false,
  extraMs: 0,
  startedAt: 0,
  endsAt: 0,
  order: [],
  locked: false,
  rafId: null,
  fillTimer: null,
};

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add("is-on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove("is-on"), 1800);
}

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function show(screen) {
  [els.join, els.wait, els.play, els.reveal, els.podium].forEach((node) => {
    node.classList.toggle("is-on", node === screen);
  });
}

function clearTimers() {
  if (state.rafId) cancelAnimationFrame(state.rafId);
  state.rafId = null;
}

function readPin() {
  return els.pinBoxes.map((box) => box.value).join("").toUpperCase();
}

function setPin(code) {
  const chars = String(code).toUpperCase().slice(0, 6).split("");
  els.pinBoxes.forEach((box, i) => {
    box.value = chars[i] || "";
  });
}

function paintAvatars() {
  els.avatarRow.innerHTML = "";
  AVATARS.forEach((avatar) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `avatar-opt${avatar.id === state.avatar ? " is-on" : ""}`;
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", avatar.id === state.avatar ? "true" : "false");
    btn.setAttribute("aria-label", avatar.label);
    btn.title = avatar.label;
    btn.innerHTML = `<img src="${avatar.src}" alt="" />`;
    btn.addEventListener("click", () => {
      state.avatar = avatar.id;
      paintAvatars();
    });
    els.avatarRow.appendChild(btn);
  });
}

function you() {
  return state.players.find((p) => p.isYou);
}

function ranked() {
  return [...state.players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

function scoreFromMs(elapsedMs, correct) {
  if (!correct) return 0;
  const limit = TIME_LIMIT_MS + state.extraMs;
  const ratio = Math.max(0, 1 - elapsedMs / limit);
  return Math.round(BASE_POINTS + SPEED_POINTS * ratio);
}

function botScore(bot) {
  if (Math.random() > bot.skill) return 0;
  const delay = 1600 + Math.random() * (TIME_LIMIT_MS * (1.1 - bot.skill));
  return scoreFromMs(Math.min(delay, TIME_LIMIT_MS - 100), true);
}

function paintBoard(listEl) {
  listEl.innerHTML = ranked()
    .slice(0, 8)
    .map((p, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1);
      return `<li class="${p.isYou ? "is-you" : ""}">
        <span class="rank">${medal}</span>
        <span class="av">${avatarImg(p.avatar)}</span>
        <span>${p.name}${p.isYou ? " (你)" : ""}</span>
        <span class="pts">${p.score}</span>
      </li>`;
    })
    .join("");
}

function paintYouHud() {
  const me = you();
  if (!me) return;
  els.youAvatar.innerHTML = avatarImg(me.avatar);
  els.youName.textContent = me.name;
  els.youScore.textContent = me.score.toLocaleString();
  els.youStreak.textContent = state.streak > 0 ? `连续答对 ${state.streak} 题！` : "连续答对 0 题";
  els.comboText.textContent = `${state.streak} 连击`;
  const xp = Math.min(100, (me.score % 1000) / 10);
  els.xpFill.style.width = `${Math.max(8, xp)}%`;
  const lv = Math.floor(me.score / 1000) + 1;
  els.xpLabel.textContent = `Lv.${lv} ${lv < 3 ? "初学者" : lv < 5 ? "进阶者" : "挑战者"}`;
  els.itemHint.textContent = `×${state.items.hint}`;
  els.itemFifty.textContent = `×${state.items.fifty}`;
  els.itemTime.textContent = `×${state.items.time}`;
  els.buffShield.textContent = state.shield ? "可抵一次" : "未启用";
  els.buffTime.textContent = state.extraMs ? `+${state.extraMs / 1000}s` : "—";
  [...els.items.querySelectorAll(".item-btn")].forEach((btn) => {
    const key = btn.dataset.item;
    btn.disabled = state.locked || state.items[key] <= 0;
  });
  paintBoard(els.liveBoard);
  const total = state.questions.length || 1;
  const pct = ((state.index + (state.locked ? 1 : 0)) / total) * 100;
  els.timelineTrack.innerHTML = `<i style="width:${Math.min(100, pct)}%"></i>`;
  els.timelineTip.textContent =
    state.streak >= 3 ? "太厉害了！保持这个节奏！" : "保持节奏，冲向满分！";
}

function paintWaitGrid() {
  const max = 12;
  els.playerGrid.innerHTML = state.players
    .map((p, i) => {
      return `<div class="player-pill${p.isYou ? " is-host" : ""}">
        <span class="idx">${String(i + 1).padStart(2, "0")}</span>
        <span class="av">${avatarImg(p.avatar)}</span>
        <span>${p.name}${p.isYou ? " · 你" : ""}</span>
      </div>`;
    })
    .join("");
  els.playerCount.textContent = `${state.players.length} / ${max}`;
  els.onlineCount.textContent = `${state.players.length} / ${max}`;
}

function fillLobbyGradually() {
  clearInterval(state.fillTimer);
  const extras = shuffle(BOT_POOL).slice(0, 7);
  let i = 0;
  state.fillTimer = setInterval(() => {
    if (i >= extras.length) {
      clearInterval(state.fillTimer);
      return;
    }
    const bot = extras[i];
    state.players.push({
      id: `bot-${i}`,
      name: bot.name,
      avatar: bot.avatarId,
      score: 0,
      isYou: false,
      skill: 0.4 + Math.random() * 0.5,
    });
    i += 1;
    paintWaitGrid();
  }, 450);
}

function joinRoom() {
  const pin = readPin();
  const nick = els.nickname.value.trim();
  if (pin.length < 6) {
    toast("请输入完整 6 位 PIN");
    els.pinBoxes[pin.length]?.focus();
    return;
  }
  if (nick.length < 2) {
    toast("昵称至少 2 个字");
    els.nickname.focus();
    return;
  }
  state.pin = pin;
  state.nickname = nick.slice(0, 10);
  state.players = [
    {
      id: "you",
      name: state.nickname,
      avatar: state.avatar,
      score: 0,
      isYou: true,
      skill: 1,
    },
  ];
  els.roomCode.textContent = pin;
  localStorage.setItem(
    "kahoot_profile",
    JSON.stringify({ nick: state.nickname, avatar: state.avatar, pin }),
  );
  paintWaitGrid();
  show(els.wait);
  fillLobbyGradually();
  toast("已加入房间，等待开赛");
}

function startMatch() {
  clearInterval(state.fillTimer);
  const size = Number(els.roundSize.value) || 8;
  state.questions = shuffle(AI_QUESTIONS).slice(0, Math.min(size, AI_QUESTIONS.length));
  state.index = 0;
  state.streak = 0;
  state.items = { hint: 2, fifty: 1, time: 1 };
  state.shield = false;
  state.extraMs = 0;
  state.players.forEach((p) => {
    p.score = 0;
  });
  beginQuestion();
}

function beginQuestion() {
  clearTimers();
  state.locked = false;
  state.extraMs = 0;
  els.buffTime.textContent = "—";
  const q = state.questions[state.index];
  const total = state.questions.length;
  els.qIndex.textContent = `第 ${state.index + 1} / ${total} 题`;
  els.qDomain.textContent = q.domain;
  els.qStem.textContent = q.stem;
  state.order = shuffle(q.options.map((_, i) => i));
  els.answers.innerHTML = "";
  state.order.forEach((optionIndex, displayIndex) => {
    const shape = SHAPES[displayIndex];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `answer ${shape.cls}`;
    btn.dataset.opt = String(optionIndex);
    btn.innerHTML = `<span class="shape">${shape.svg}</span><span><span class="key">${shape.key}</span>${q.options[optionIndex]}</span>`;
    btn.addEventListener("click", () => submitAnswer(optionIndex, btn));
    els.answers.appendChild(btn);
  });
  paintYouHud();
  show(els.play);
  state.startedAt = performance.now();
  state.endsAt = state.startedAt + TIME_LIMIT_MS;
  tickTimer();
}

function tickTimer() {
  const left = Math.max(0, state.endsAt - performance.now());
  const limit = TIME_LIMIT_MS + state.extraMs;
  const sec = Math.ceil(left / 1000);
  els.timerText.textContent = `00:${String(sec).padStart(2, "0")}`;
  const used = 1 - left / limit;
  els.timerProg.style.strokeDashoffset = String(CIRC * Math.min(1, Math.max(0, used)));
  if (left <= 0) {
    if (!state.locked) submitAnswer(null, null);
    return;
  }
  state.rafId = requestAnimationFrame(tickTimer);
}

function submitAnswer(optionIndex, button) {
  if (state.locked) return;
  state.locked = true;
  clearTimers();

  const q = state.questions[state.index];
  const elapsed = performance.now() - state.startedAt;
  const timedOut = optionIndex == null;
  let correct = !timedOut && optionIndex === q.answer;
  let shielded = false;
  if (!correct && !timedOut && state.shield) {
    state.shield = false;
    shielded = true;
    correct = true;
  }
  const points = scoreFromMs(elapsed, correct && !shielded) || (shielded ? Math.round(BASE_POINTS * 0.4) : 0);

  state.players.forEach((p) => {
    if (p.isYou) p.score += points;
    else p.score += botScore(p);
  });
  state.streak = correct ? state.streak + 1 : 0;
  if (state.streak > 0 && state.streak % 5 === 0) {
    state.shield = true;
    toast("获得护盾：可抵挡一次失误");
  }

  [...els.answers.children].forEach((node) => {
    const opt = Number(node.dataset.opt);
    node.disabled = true;
    if (opt === q.answer) node.classList.add("is-correct");
    else if (button && node === button) node.classList.add("is-wrong");
    else node.classList.add("is-miss");
  });
  if (button) button.classList.add("is-picked");
  paintYouHud();
  showReveal({ correct, timedOut, shielded, points, question: q });
}

function showReveal({ correct, timedOut, shielded, points, question }) {
  const me = you();
  const total = state.questions.length;
  els.revealIndex.textContent = `第 ${state.index + 1} / ${total} 题`;
  els.revealGain.textContent = `本题获得 ★+${points} 分`;
  els.revealAvatar.innerHTML = avatarImg(me.avatar);
  els.revealName.textContent = me.name;
  els.revealTotal.textContent = me.score.toLocaleString();
  els.revealStreak.textContent = state.streak > 0 ? `连续 ${state.streak}` : "连续 0";
  els.revealCenter.classList.toggle("is-bad", !correct);
  els.confetti.classList.toggle("is-off", !correct);
  els.revealTitle.textContent = timedOut ? "时间到" : shielded ? "护盾抵挡！" : correct ? "答对了！" : "答错了";
  els.revealSub.textContent = correct
    ? "太棒了！你展现了超强的学习力！"
    : "别灰心，下一题再冲！";
  els.revealAnswer.textContent = `${["A", "B", "C", "D"][question.answer] || ""} ${question.options[question.answer]}`;
  els.revealPoints.textContent = `+${points} 分`;
  els.revealExplain.textContent = question.explain || "";
  els.revealCombo.textContent = `${state.streak} COMBO!`;
  els.revealComboFill.style.width = `${Math.min(100, state.streak * 12.5)}%`;
  els.revealComboTip.textContent =
    state.streak >= 3 ? "太厉害了！连续答对中，气势如虹！" : "继续保持气势！";
  els.revealNext.textContent =
    state.index + 1 >= total ? "查看颁奖 →" : "下一题 →";
  paintBoard(els.revealBoard);
  show(els.reveal);
}

function nextAfterReveal() {
  state.index += 1;
  if (state.index >= state.questions.length) {
    paintPodium();
    show(els.podium);
    return;
  }
  beginQuestion();
}

function paintPodium() {
  const top = ranked().slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];
  els.podiumSlots.innerHTML = top
    .map(
      (p, i) => `<div class="podium-slot is-${i + 1}">
      <div>${medals[i]}</div>
      <strong>${avatarImg(p.avatar, "av-img")} ${p.name}${p.isYou ? " (你)" : ""}</strong>
      <span>${p.score}</span>
    </div>`,
    )
    .join("");
  paintBoard(els.finalList);
}

function useItem(kind) {
  if (state.locked || state.items[kind] <= 0) return;
  if (kind === "hint") {
    state.items.hint -= 1;
    const q = state.questions[state.index];
    toast(q.explain ? `提示：${q.explain.slice(0, 42)}…` : `领域：${q.domain}`);
  } else if (kind === "fifty") {
    state.items.fifty -= 1;
    const q = state.questions[state.index];
    const wrong = state.order.filter((i) => i !== q.answer);
    shuffle(wrong)
      .slice(0, 2)
      .forEach((opt) => {
        const node = [...els.answers.children].find((n) => Number(n.dataset.opt) === opt);
        if (node) {
          node.classList.add("is-dim");
          node.disabled = true;
        }
      });
    toast("已去掉两个错误选项");
  } else if (kind === "time") {
    state.items.time -= 1;
    state.extraMs += 5000;
    state.endsAt += 5000;
    els.buffTime.textContent = `+${state.extraMs / 1000}s`;
    toast("作答时间 +5 秒");
  }
  paintYouHud();
}

/* wire UI */
paintAvatars();
setPin(DEMO_PIN);

els.pinBoxes.forEach((box, i) => {
  box.addEventListener("input", () => {
    box.value = box.value.replace(/[^a-zA-Z0-9]/g, "").slice(-1).toUpperCase();
    if (box.value && i < els.pinBoxes.length - 1) els.pinBoxes[i + 1].focus();
  });
  box.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !box.value && i > 0) els.pinBoxes[i - 1].focus();
  });
});

els.fillPin.addEventListener("click", () => {
  setPin(DEMO_PIN);
  toast("已填入演示 PIN");
});

els.joinBtn.addEventListener("click", joinRoom);
els.helpBtn.addEventListener("click", () => {
  toast("输入 PIN → 设定昵称头像 → 加入 → 开始挑战");
});
const soundBtn = document.getElementById("sound-btn");
if (soundBtn) {
  let soundOn = true;
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? "🔊" : "🔇";
    soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
    toast(soundOn ? "音效已开启（演示）" : "音效已关闭（演示）");
  });
}
els.leaveWait.addEventListener("click", () => {
  clearInterval(state.fillTimer);
  show(els.join);
});
els.copyCode.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.roomCode.textContent);
    toast("房间代码已复制");
  } catch {
    toast(els.roomCode.textContent);
  }
});
els.roomSettings.addEventListener("click", () => toast("演示模式：题量可在加入页调整"));
els.startBtn.addEventListener("click", startMatch);
els.revealNext.addEventListener("click", nextAfterReveal);
els.again.addEventListener("click", () => show(els.join));
els.items.addEventListener("click", (e) => {
  const btn = e.target.closest(".item-btn");
  if (!btn) return;
  useItem(btn.dataset.item);
});

try {
  const saved = JSON.parse(localStorage.getItem("kahoot_profile") || "null");
  if (saved?.nick) els.nickname.value = saved.nick;
  if (saved?.avatar && AVATARS.some((a) => a.id === saved.avatar)) {
    state.avatar = saved.avatar;
    paintAvatars();
  }
  if (saved?.pin) setPin(saved.pin);
} catch {
  /* ignore */
}
