/**
 * AI 素养挑战赛 — Terraria / 像素沙盒风格 UI
 * Solo play with bot classmates; PIN/lobby are simulated locally.
 */
import { AI_QUESTIONS, isCorrectOption, localizeQuestion } from "/monopoly/questions.js";
import { initI18n, onLangChange, applyDom, getLang, t } from "/js/i18n.js";
import { mountLobbyExit } from "/js/lobby-exit.js";
import { logAnswer } from "/js/answer-log.js";

initI18n({ toggleHost: "#lang-host" });
onLangChange(() => {
  applyDom();
  syncJoinReady();
  paintAvatars();
  paintWaitRoom();
  if (els.play?.classList.contains("is-on")) {
    paintQuestionText();
    paintYouHud();
    paintBoard(els.liveBoard);
  }
  if (els.reveal?.classList.contains("is-on") && state.lastReveal) {
    showReveal(state.lastReveal);
  }
  if (els.podium?.classList.contains("is-on")) {
    paintPodium();
  }
});
mountLobbyExit();

const DEMO_PIN = "AI2025";
const TIME_LIMIT_MS = 20000;
const BASE_POINTS = 500;
const SPEED_POINTS = 500;
const CIRC = 188.4;

const AVATARS = [
  { id: "av01", src: "/assets/kahoot/pixel/kahoot-av-01.png?v=3", label: "牛仔马尾", labelEn: "Cowboy ponytail" },
  { id: "av02", src: "/assets/kahoot/pixel/kahoot-av-02.png?v=3", label: "粉结学院", labelEn: "Pink-bow academy" },
  { id: "av03", src: "/assets/kahoot/pixel/kahoot-av-03.png?v=3", label: "绿帽少年", labelEn: "Green-hat teen" },
  { id: "av04", src: "/assets/kahoot/pixel/kahoot-av-04.png?v=3", label: "粉结少女", labelEn: "Pink-bow girl" },
  { id: "av05", src: "/assets/kahoot/pixel/kahoot-av-05.png?v=3", label: "学院制服", labelEn: "School uniform" },
  { id: "av06", src: "/assets/kahoot/pixel/kahoot-av-06.png?v=3", label: "薄荷绿发", labelEn: "Mint hair" },
];

const BOT_POOL = [
  { name: "学霸国王", nameEn: "Quiz King", avatarId: "av02" },
  { name: "电路兔", nameEn: "Circuit Bunny", avatarId: "av03" },
  { name: "信号喵", nameEn: "Signal Cat", avatarId: "av05" },
  { name: "星火仔", nameEn: "Spark Kid", avatarId: "av01" },
  { name: "数据狐", nameEn: "Data Fox", avatarId: "av06" },
  { name: "机伴07", nameEn: "Bot-07", avatarId: "av04" },
  { name: "闪电选手", nameEn: "Lightning", avatarId: "av01" },
  { name: "好奇星", nameEn: "Curious Star", avatarId: "av04" },
  { name: "冷静派", nameEn: "Cool Head", avatarId: "av02" },
  { name: "冲鸭鸭", nameEn: "Go Duck", avatarId: "av03" },
  { name: "代码熊", nameEn: "Code Bear", avatarId: "av05" },
];

function isEn() {
  return getLang() === "en";
}

function avatarLabel(avatar) {
  return isEn() ? (avatar.labelEn || avatar.label) : avatar.label;
}

function playerName(p) {
  if (!p) return "";
  if (p.isYou) return p.name;
  return isEn() ? (p.nameEn || p.name) : p.name;
}

function avatarById(id) {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}

function avatarImg(id, className = "") {
  const a = avatarById(id);
  return `<img class="${className}" src="${a.src}" alt="${a.label}" />`;
}

const SHAPES = [
  { cls: "is-red", key: "A", tone: "pink" },
  { cls: "is-blue", key: "B", tone: "sky" },
  { cls: "is-yellow", key: "C", tone: "mint" },
  { cls: "is-green", key: "D", tone: "lavender" },
];

function pressFeedback(btn) {
  if (!btn) return;
  btn.classList.add("is-pressed");
  setTimeout(() => btn.classList.remove("is-pressed"), 120);
}

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
  avatarPreviewImg: document.getElementById("avatar-preview-img"),
  roundSize: document.getElementById("round-size"),
  joinBtn: document.getElementById("join-btn"),
  helpBtn: document.getElementById("help-btn"),
  stepPin: document.getElementById("step-pin"),
  stepProfile: document.getElementById("step-profile"),
  pinStatus: document.getElementById("pin-status"),
  profileStatus: document.getElementById("profile-status"),
  joinReady: document.getElementById("join-ready"),
  nickCount: document.getElementById("nick-count"),
  joinPanel: document.getElementById("join-panel"),
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
  lastReveal: null,
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

function setPin(pin, { animate = false } = {}) {
  const chars = String(pin || "").toUpperCase().slice(0, 6).split("");
  els.pinBoxes.forEach((box, i) => {
    box.value = chars[i] || "";
    box.classList.toggle("has-val", Boolean(box.value));
    if (animate && chars[i]) {
      box.classList.remove("is-flash");
      void box.offsetWidth;
      box.classList.add("is-flash");
      setTimeout(() => box.classList.remove("is-flash"), 360);
    }
  });
  syncJoinReady();
}

function nickOk() {
  const nick = els.nickname.value.trim();
  return nick.length >= 2 && nick.length <= 10;
}

function pinOk() {
  return readPin().length === 6;
}

function syncJoinReady() {
  const pinReady = pinOk();
  const profileReady = nickOk() && Boolean(state.avatar);
  const ready = pinReady && profileReady;

  els.pinBoxes.forEach((box) => box.classList.toggle("has-val", Boolean(box.value)));

  if (els.stepPin) {
    els.stepPin.classList.toggle("is-done", pinReady);
    els.stepPin.classList.toggle("is-active", !pinReady);
  }
  if (els.stepProfile) {
    els.stepProfile.classList.toggle("is-done", profileReady);
    els.stepProfile.classList.toggle("is-active", pinReady && !profileReady);
  }
  if (els.pinStatus) {
    els.pinStatus.textContent = pinReady
      ? t("kahoot.pinReady")
      : t("kahoot.pinProgress", { n: readPin().length });
  }
  if (els.profileStatus) {
    if (!nickOk()) els.profileStatus.textContent = t("kahoot.nickNeed");
    else if (!state.avatar) els.profileStatus.textContent = t("kahoot.avatarNeed");
    else els.profileStatus.textContent = t("kahoot.profileReady");
  }
  if (els.nickCount) {
    els.nickCount.textContent = `${els.nickname.value.length}/10`;
  }
  els.nickname.closest(".nick-field")?.classList.toggle("is-ok", nickOk());

  if (els.joinBtn) {
    els.joinBtn.disabled = !ready;
    els.joinBtn.title = ready ? t("kahoot.joinTitleReady") : t("kahoot.joinTitleNeed");
  }
  if (els.joinReady) {
    els.joinReady.classList.toggle("is-ok", ready);
    els.joinReady.textContent = ready ? t("kahoot.joinGo") : t("kahoot.joinNeed");
  }
}

function shakeJoin() {
  if (!els.joinPanel) return;
  els.joinPanel.classList.remove("is-shake");
  void els.joinPanel.offsetWidth;
  els.joinPanel.classList.add("is-shake");
  setTimeout(() => els.joinPanel.classList.remove("is-shake"), 420);
}

function syncAvatarPreview() {
  const a = avatarById(state.avatar);
  if (els.avatarPreviewImg) {
    els.avatarPreviewImg.src = a.src;
    els.avatarPreviewImg.alt = avatarLabel(a);
  }
}

function paintAvatars() {
  els.avatarRow.innerHTML = "";
  syncAvatarPreview();
  AVATARS.forEach((avatar, index) => {
    const label = avatarLabel(avatar);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `avatar-opt ui-slot${avatar.id === state.avatar ? " is-on" : ""}`;
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", avatar.id === state.avatar ? "true" : "false");
    btn.setAttribute("aria-label", label);
    btn.dataset.index = String(index);
    btn.title = label;
    btn.innerHTML = `<img src="${avatar.src}" alt="" />`;
    btn.addEventListener("click", () => {
      state.avatar = avatar.id;
      paintAvatars();
      syncJoinReady();
      toast(t("kahoot.toast.avatarPick", { name: label }));
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
      const medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1);
      return `<li class="${p.isYou ? "is-you" : ""}">
        <span class="rank">${medal}</span>
        <span class="av">${avatarImg(p.avatar)}</span>
        <span class="nm">${playerName(p)}${p.isYou ? t("kahoot.you") : ""}</span>
        <span class="pts">${p.score.toLocaleString()}</span>
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
  els.youStreak.textContent =
    state.streak > 0 ? t("kahoot.streakN", { n: state.streak }) : t("kahoot.streak0");
  els.comboText.textContent = t("kahoot.combo", { n: state.streak });
  const xp = Math.min(100, (me.score % 1000) / 10);
  if (els.xpFill) els.xpFill.style.width = `${Math.max(8, xp)}%`;
  const lv = Math.floor(me.score / 1000) + 1;
  const role =
    lv < 3 ? t("kahoot.lvBeginner") : lv < 5 ? t("kahoot.lvAdvanced") : t("kahoot.lvChallenger");
  els.xpLabel.textContent = t("kahoot.lv", { n: lv, role });
  els.itemHint.textContent = `×${state.items.hint}`;
  els.itemFifty.textContent = `×${state.items.fifty}`;
  els.itemTime.textContent = `×${state.items.time}`;
  els.buffShield.textContent = state.shield ? t("kahoot.shieldOn") : t("kahoot.shieldOff");
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
    state.streak >= 3 ? t("kahoot.tipHot") : t("kahoot.tipRhythm");
}

function paintWaitGrid() {
  const max = 12;
  els.playerGrid.innerHTML = state.players
    .map((p, i) => {
      return `<div class="player-pill${p.isYou ? " is-host" : ""}">
        <span class="idx">${String(i + 1).padStart(2, "0")}</span>
        <span class="av">${avatarImg(p.avatar)}</span>
        <span class="name">${playerName(p)}${p.isYou ? t("kahoot.youDot") : ""}</span>
        <span class="dot" aria-hidden="true"></span>
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
      nameEn: bot.nameEn,
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
    toast(t("kahoot.toast.pinNeed"));
    shakeJoin();
    els.pinBoxes[pin.length]?.focus();
    syncJoinReady();
    return;
  }
  if (!nickOk()) {
    toast(t("kahoot.toast.nickNeed"));
    shakeJoin();
    els.nickname.focus();
    syncJoinReady();
    return;
  }
  if (!state.avatar) {
    toast(t("kahoot.toast.avatarNeed"));
    shakeJoin();
    syncJoinReady();
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
  toast(t("kahoot.toast.welcome", { pin }));
}

function paintWaitRoom() {
  if (!els.wait?.classList.contains("is-on")) return;
  paintWaitGrid();
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
  const total = state.questions.length;
  state.order = shuffle(state.questions[state.index].options.map((_, i) => i));
  paintQuestionText();
  paintYouHud();
  show(els.play);
  state.startedAt = performance.now();
  state.endsAt = state.startedAt + TIME_LIMIT_MS;
  tickTimer();
}

function paintQuestionText() {
  const raw = state.questions[state.index];
  if (!raw) return;
  const q = localizeQuestion(raw, getLang());
  const total = state.questions.length;
  els.qIndex.textContent = t("kahoot.qIndex", { n: state.index + 1, total });
  els.qDomain.textContent = q.domain;
  els.qStem.textContent = q.stem;
  const order = state.order?.length ? state.order : q.options.map((_, i) => i);
  els.answers.innerHTML = "";
  order.forEach((optionIndex, displayIndex) => {
    const shape = SHAPES[displayIndex];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `answer opt-banner clay-opt ${shape.cls}`;
    btn.dataset.opt = String(optionIndex);
    btn.disabled = state.locked;
    btn.innerHTML = `<span class="opt-letter" aria-hidden="true"><em>${shape.key}</em></span><span class="opt-text">${q.options[optionIndex]}</span><span class="opt-deco" aria-hidden="true"></span>`;
    btn.addEventListener("click", () => {
      pressFeedback(btn);
      submitAnswer(optionIndex, btn);
    });
    els.answers.appendChild(btn);
  });
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
  let correct = !timedOut && isCorrectOption(q, optionIndex);
  let shielded = false;
  if (!correct && !timedOut && state.shield) {
    state.shield = false;
    shielded = true;
    correct = true;
  }
  const points = scoreFromMs(elapsed, correct && !shielded) || (shielded ? Math.round(BASE_POINTS * 0.4) : 0);

  void logAnswer(
    {
      game: "kahoot",
      question_id: q.id || `kahoot-${state.index}`,
      answer: { optionIndex, timedOut },
      correct,
      latency_ms: Math.round(elapsed),
      meta: {
        index: state.index,
        points,
        shielded,
        timedOut,
        streak: correct ? state.streak + 1 : 0,
      },
    },
    { nick: you()?.name || state.nickname || "" },
  );

  state.players.forEach((p) => {
    if (p.isYou) p.score += points;
    else p.score += botScore(p);
  });
  state.streak = correct ? state.streak + 1 : 0;
  if (state.streak > 0 && state.streak % 5 === 0) {
    state.shield = true;
    toast(t("kahoot.toast.shield"));
  }

  [...els.answers.children].forEach((node) => {
    const opt = Number(node.dataset.opt);
    node.disabled = true;
    if (isCorrectOption(q, opt)) node.classList.add("is-correct");
    else if (button && node === button) node.classList.add("is-wrong");
    else node.classList.add("is-miss");
  });
  if (button) button.classList.add("is-picked");
  paintYouHud();
  showReveal({ correct, timedOut, shielded, points, question: q });
}

function showReveal({ correct, timedOut, shielded, points, question }) {
  state.lastReveal = { correct, timedOut, shielded, points, question };
  const me = you();
  const total = state.questions.length;
  els.revealIndex.textContent = t("kahoot.qIndex", { n: state.index + 1, total });
  els.revealGain.textContent = t("kahoot.revealGain", { n: points });
  els.revealAvatar.innerHTML = avatarImg(me.avatar);
  els.revealName.textContent = me.name;
  els.revealTotal.textContent = me.score.toLocaleString();
  els.revealStreak.textContent = t("kahoot.streakShort", { n: state.streak });
  els.revealCenter.classList.toggle("is-bad", !correct);
  els.confetti.classList.toggle("is-off", !correct);
  els.revealTitle.textContent = timedOut
    ? t("kahoot.timeout")
    : shielded
      ? t("kahoot.shielded")
      : correct
        ? t("kahoot.correct")
        : t("kahoot.wrong");
  els.revealSub.textContent = correct ? t("kahoot.subGood") : t("kahoot.subBad");
  const keys = ["A", "B", "C", "D"];
  const displayQ = localizeQuestion(question, getLang());
  const correctIdx = Array.isArray(question.answers) && question.answers.length
    ? question.answers
    : [question.answer];
  els.revealAnswer.textContent = correctIdx
    .map((i) => `${keys[i] || ""} ${displayQ.options[i] || ""}`)
    .join(" · ");
  els.revealPoints.textContent = t("kahoot.plusPts", { n: points });
  els.revealExplain.textContent = displayQ.explain || "";
  els.revealCombo.textContent = `${state.streak} COMBO!`;
  els.revealComboFill.style.width = `${Math.min(100, state.streak * 12.5)}%`;
  els.revealComboTip.textContent =
    state.streak >= 3 ? t("kahoot.comboTipHot") : t("kahoot.comboTip");
  els.revealNext.textContent =
    state.index + 1 >= total ? t("kahoot.seePodium") : t("kahoot.nextQ");
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
      <strong>${avatarImg(p.avatar, "av-img")} ${playerName(p)}${p.isYou ? t("kahoot.you") : ""}</strong>
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
    toast(
      q.explain
        ? t("kahoot.toast.hint", { text: `${localizeQuestion(q, getLang()).explain.slice(0, 42)}…` })
        : t("kahoot.toast.domain", { text: q.domain }),
    );
  } else if (kind === "fifty") {
    state.items.fifty -= 1;
    const q = state.questions[state.index];
    const wrong = state.order.filter((i) => !isCorrectOption(q, i));
    shuffle(wrong)
      .slice(0, 2)
      .forEach((opt) => {
        const node = [...els.answers.children].find((n) => Number(n.dataset.opt) === opt);
        if (node) {
          node.classList.add("is-dim");
          node.disabled = true;
        }
      });
    toast(t("kahoot.toast.fifty"));
  } else if (kind === "time") {
    state.items.time -= 1;
    state.extraMs += 5000;
    state.endsAt += 5000;
    els.buffTime.textContent = `+${state.extraMs / 1000}s`;
    toast(t("kahoot.toast.time"));
  }
  paintYouHud();
}

/* wire UI */
paintAvatars();
setPin(DEMO_PIN, { animate: false });
syncJoinReady();

els.pinBoxes.forEach((box, i) => {
  box.addEventListener("input", () => {
    box.value = box.value.replace(/[^a-zA-Z0-9]/g, "").slice(-1).toUpperCase();
    box.classList.toggle("has-val", Boolean(box.value));
    if (box.value && i < els.pinBoxes.length - 1) els.pinBoxes[i + 1].focus();
    syncJoinReady();
  });
  box.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !box.value && i > 0) {
      els.pinBoxes[i - 1].focus();
      els.pinBoxes[i - 1].value = "";
      els.pinBoxes[i - 1].classList.remove("has-val");
      syncJoinReady();
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && i > 0) els.pinBoxes[i - 1].focus();
    if (e.key === "ArrowRight" && i < els.pinBoxes.length - 1) els.pinBoxes[i + 1].focus();
    if (e.key === "Enter") {
      e.preventDefault();
      if (pinOk()) els.nickname.focus();
      else joinRoom();
    }
  });
  box.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text") || "";
    const clean = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    if (!clean) return;
    setPin(clean, { animate: true });
    const next = Math.min(clean.length, 5);
    els.pinBoxes[next]?.focus();
  });
  box.addEventListener("focus", () => syncJoinReady());
});

els.fillPin.addEventListener("click", () => {
  setPin(DEMO_PIN, { animate: true });
  toast(t("kahoot.toast.pinFilled"));
  els.nickname.focus();
});

els.nickname.addEventListener("input", syncJoinReady);
els.nickname.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (els.joinBtn && !els.joinBtn.disabled) joinRoom();
    else if (!nickOk()) toast(t("kahoot.toast.nickNeed"));
    else toast(t("kahoot.toast.avatarThen"));
  }
});

els.avatarRow.addEventListener("keydown", (e) => {
  const focused = document.activeElement;
  if (!focused?.classList.contains("avatar-opt")) return;
  const idx = Number(focused.dataset.index || 0);
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    e.preventDefault();
    const next = els.avatarRow.querySelector(`[data-index="${(idx + 1) % AVATARS.length}"]`);
    next?.focus();
  }
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    e.preventDefault();
    const prev = els.avatarRow.querySelector(`[data-index="${(idx - 1 + AVATARS.length) % AVATARS.length}"]`);
    prev?.focus();
  }
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    focused.click();
  }
});

els.joinBtn.addEventListener("click", joinRoom);
els.helpBtn.addEventListener("click", () => {
  toast(t("kahoot.toast.help"));
});
els.leaveWait.addEventListener("click", () => {
  clearInterval(state.fillTimer);
  show(els.join);
  syncJoinReady();
});
els.copyCode.addEventListener("click", async () => {
  const code = els.roomCode.textContent;
  try {
    await navigator.clipboard.writeText(code);
    els.copyCode.classList.add("is-copied");
    els.copyCode.innerHTML = `<span class="copy-ico" aria-hidden="true">✓</span>${t("kahoot.copied")}`;
    toast(t("kahoot.toast.copied", { code }));
    setTimeout(() => {
      els.copyCode.classList.remove("is-copied");
      els.copyCode.innerHTML = `<span class="copy-ico" aria-hidden="true">⧉</span>${t("kahoot.copy")}`;
    }, 1600);
  } catch {
    toast(code);
  }
});
els.roomSettings.addEventListener("click", () => toast(t("kahoot.toast.settings")));

const catStack = document.getElementById("cat-stack");
if (catStack) {
  catStack.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat");
    if (!btn) return;
    const wasOn = btn.classList.contains("is-on");
    catStack.querySelectorAll(".cat").forEach((c) => c.classList.remove("is-on"));
    if (!wasOn) {
      btn.classList.add("is-on");
      toast(t("kahoot.toast.catOn", { name: btn.textContent.trim() }));
    } else {
      toast(t("kahoot.toast.catOff"));
    }
  });
}
els.startBtn.addEventListener("click", startMatch);
els.revealNext.addEventListener("click", nextAfterReveal);
els.again.addEventListener("click", () => {
  show(els.join);
  syncJoinReady();
});
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
  else setPin(DEMO_PIN);
  syncJoinReady();
} catch {
  syncJoinReady();
}
