import { initI18n, onLangChange, applyDom, getLang, t } from "/js/i18n.js";
import { upsertUser } from "/js/user-log.js";
import {
  PORTAL_ROLES,
  validateNickname,
  loadPortalUser,
  savePortalUser,
  guestNickname,
} from "/js/portal-auth.js";

const NEXT_URL = "/";
const els = {
  form: document.getElementById("portal-form"),
  nick: document.getElementById("portal-nick"),
  error: document.getElementById("portal-error"),
  roleGrid: document.getElementById("role-grid"),
  enter: document.getElementById("btn-enter"),
  guest: document.getElementById("btn-guest"),
  toast: document.getElementById("portal-toast"),
};

const state = {
  role: "explorer",
  busy: false,
};

initI18n({ toggleHost: "#lang-host" });
onLangChange(() => {
  applyDom();
  paintRoles();
});

function announce(msg) {
  if (!els.toast || !msg) return;
  els.toast.textContent = msg;
  els.toast.classList.add("is-visible");
  clearTimeout(announce.timer);
  announce.timer = setTimeout(() => els.toast.classList.remove("is-visible"), 1800);
}

function paintRoles() {
  els.roleGrid.replaceChildren(
    ...PORTAL_ROLES.map((role) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `role-btn${state.role === role.id ? " is-on" : ""}`;
      btn.dataset.role = role.id;
      btn.innerHTML = `<span class="ico">${role.icon}</span><strong>${t(role.labelKey)}</strong>`;
      btn.addEventListener("click", () => {
        state.role = role.id;
        paintRoles();
      });
      return btn;
    }),
  );
}

function showError(code) {
  const key =
    code === "length" ? "portal.error.length" : "portal.error.empty";
  els.error.hidden = false;
  els.error.textContent = t(key);
}

function clearError() {
  els.error.hidden = true;
  els.error.textContent = "";
}

async function completeLogin({ display_name, guest = false }) {
  if (state.busy) return;
  state.busy = true;
  els.enter.disabled = true;
  els.guest.disabled = true;

  const user = savePortalUser({
    display_name,
    role: state.role,
    guest,
    logged_in_at: Date.now(),
  });

  void upsertUser({
    display_name: user.display_name,
    role: user.role,
    character_id: `portal-${user.role}`,
    profile: { portal: true, guest: user.guest },
  });

  announce(t("portal.toast.welcome", { name: user.display_name }));
  await new Promise((resolve) => setTimeout(resolve, 380));
  location.href = NEXT_URL;
}

els.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();
  const check = validateNickname(els.nick.value);
  if (!check.ok) {
    showError(check.code);
    els.nick.focus();
    return;
  }
  await completeLogin({ display_name: check.name, guest: false });
});

els.guest.addEventListener("click", async () => {
  clearError();
  await completeLogin({
    display_name: guestNickname(getLang()),
    guest: true,
  });
});

els.nick.addEventListener("input", clearError);

if (loadPortalUser()) {
  location.replace(NEXT_URL);
} else {
  paintRoles();
  applyDom();
  els.nick.focus();
}
