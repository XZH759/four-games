/**
 * Fashion Town — role + companion → design fashion modules via correct answers → shared outfit.
 */
import { logEvent } from "/js/event-log.js";
export const FASHION_STORAGE = "nn_fashion_town_v1";
export const ACTIVE_BOUTIQUE_KEY = "nn_fashion_active_boutique";

/** @typedef {{ id: string, tone: string, role: string, fashionRole: string, companionId: string, nameKey: string, taglineKey: string, focusKey: string, modules: string[], buildingArt: string }} Boutique */

/** ART-TODO: replace region-banner placeholders with boutique building cutouts. */
const BOUTIQUE_ART = {
  "style-lab": "/nuannuan/map/assets/kit/region-banner-1.png",
  "dream-atelier": "/nuannuan/map/assets/kit/region-banner-2.png",
  "tech-garage": "/nuannuan/map/assets/kit/region-banner-3.png",
  "pattern-house": "/nuannuan/map/assets/kit/region-banner-4.png",
};

/** @type {Boutique[]} */
export const BOUTIQUES = [
  {
    id: "style-lab",
    tone: "purple",
    role: "researcher",
    fashionRole: "researcher",
    companionId: "eileen",
    nameKey: "town.boutique.styleLab",
    taglineKey: "town.boutique.styleLabTag",
    focusKey: "town.boutique.styleLabFocus",
    modules: ["hairpin", "top", "accessory", "palette"],
    buildingArt: BOUTIQUE_ART["style-lab"],
  },
  {
    id: "dream-atelier",
    tone: "pink",
    role: "programmer",
    fashionRole: "artist",
    companionId: "fiona",
    nameKey: "town.boutique.dreamAtelier",
    taglineKey: "town.boutique.dreamAtelierTag",
    focusKey: "town.boutique.dreamAtelierFocus",
    modules: ["dress", "tops", "skirt", "fabric"],
    buildingArt: BOUTIQUE_ART["dream-atelier"],
  },
  {
    id: "tech-garage",
    tone: "teal",
    role: "engineer",
    fashionRole: "engineer",
    companionId: "gladys",
    nameKey: "town.boutique.techGarage",
    taglineKey: "town.boutique.techGarageTag",
    focusKey: "town.boutique.techGarageFocus",
    modules: ["shoes", "gadget", "glasses", "tech"],
    buildingArt: BOUTIQUE_ART["tech-garage"],
  },
  {
    id: "pattern-house",
    tone: "blue",
    role: "researcher",
    fashionRole: "analyst",
    companionId: "diana",
    nameKey: "town.boutique.patternHouse",
    taglineKey: "town.boutique.patternHouseTag",
    focusKey: "town.boutique.patternHouseFocus",
    modules: ["coat", "pattern", "bag", "wardrobe"],
    buildingArt: BOUTIQUE_ART["pattern-house"],
  },
];

export const MODULE_LABEL_KEYS = {
  hairpin: "town.module.hairpin",
  top: "town.module.top",
  accessory: "town.module.accessory",
  palette: "town.module.palette",
  dress: "town.module.dress",
  tops: "town.module.tops",
  skirt: "town.module.skirt",
  fabric: "town.module.fabric",
  shoes: "town.module.shoes",
  gadget: "town.module.gadget",
  glasses: "town.module.glasses",
  tech: "town.module.tech",
  coat: "town.module.coat",
  pattern: "town.module.pattern",
  bag: "town.module.bag",
  wardrobe: "town.module.wardrobe",
};

/** Maps boutique module ids to wardrobe slot label keys for settle / wardrobe UI. */
export const MODULE_WARDROBE_SLOTS = {
  hairpin: "collect.settle.slot.hair",
  top: "collect.settle.slot.top",
  tops: "collect.settle.slot.top",
  dress: "collect.settle.slot.dress",
  skirt: "collect.settle.slot.skirt",
  shoes: "collect.settle.slot.shoes",
  accessory: "collect.settle.slot.accessory",
  gadget: "collect.settle.slot.accessory",
  glasses: "collect.settle.slot.accessory",
  bag: "collect.settle.slot.accessory",
  palette: "collect.settle.slot.palette",
  fabric: "collect.settle.slot.fabric",
  pattern: "collect.settle.slot.pattern",
  tech: "collect.settle.slot.tech",
  coat: "collect.settle.slot.coat",
  wardrobe: "collect.settle.slot.wardrobe",
};

export const SHARED_OUTFIT_ID = "signature-ensemble";

export function defaultFashionState() {
  return {
    schemaVersion: 2,
    boutiques: Object.fromEntries(
      BOUTIQUES.map((b) => [b.id, { unlocked: [], completedChallengeIds: [] }]),
    ),
    sharedOutfit: false,
    sessionDesigned: [],
    companionBond: {},
    savedLooks: [],
    activeLookId: null,
  };
}

export function loadFashionState() {
  try {
    const raw = JSON.parse(localStorage.getItem(FASHION_STORAGE) || "null");
    if (!raw || typeof raw !== "object") return defaultFashionState();
    const base = defaultFashionState();
    BOUTIQUES.forEach((b) => {
      const saved = raw.boutiques?.[b.id];
      base.boutiques[b.id].unlocked = Array.isArray(saved?.unlocked)
        ? saved.unlocked.filter((m) => b.modules.includes(m))
        : [];
      base.boutiques[b.id].completedChallengeIds = Array.isArray(saved?.completedChallengeIds)
        ? saved.completedChallengeIds.filter(Boolean)
        : [];
    });
    base.sharedOutfit = raw.sharedOutfit === true;
    base.sessionDesigned = Array.isArray(raw.sessionDesigned) ? raw.sessionDesigned : [];
    base.companionBond =
      raw.companionBond && typeof raw.companionBond === "object" ? { ...raw.companionBond } : {};
    base.savedLooks = Array.isArray(raw.savedLooks) ? raw.savedLooks : [];
    base.activeLookId = typeof raw.activeLookId === "string" ? raw.activeLookId : null;
    return base;
  } catch {
    return defaultFashionState();
  }
}

export function saveFashionState(state) {
  localStorage.setItem(FASHION_STORAGE, JSON.stringify(state));
}

export function getBoutique(id) {
  return BOUTIQUES.find((b) => b.id === id) || null;
}

export function setActiveBoutique(id) {
  if (!getBoutique(id)) return;
  localStorage.setItem(ACTIVE_BOUTIQUE_KEY, id);
}

export function getActiveBoutiqueId() {
  const id = localStorage.getItem(ACTIVE_BOUTIQUE_KEY);
  return getBoutique(id) ? id : null;
}

export function getActiveBoutique() {
  return getBoutique(getActiveBoutiqueId()) || BOUTIQUES[0];
}

/** Returns boutique id from URL when present but unknown (for page notice). */
export function invalidBoutiqueFromUrl() {
  const id = new URLSearchParams(location.search).get("boutique");
  if (id && !getBoutique(id)) return id;
  return null;
}

export function getUnlockedModules(boutiqueId) {
  const state = loadFashionState();
  return [...(state.boutiques[boutiqueId]?.unlocked || [])];
}

export function boutiqueProgress(boutiqueId) {
  const boutique = getBoutique(boutiqueId);
  if (!boutique) return { unlocked: 0, total: 0 };
  const unlocked = getUnlockedModules(boutiqueId);
  return { unlocked: unlocked.length, total: boutique.modules.length };
}

export function allBoutiquesComplete() {
  return BOUTIQUES.every((b) => boutiqueProgress(b.id).unlocked >= b.modules.length);
}

export function getCompanionBond(companionId) {
  const state = loadFashionState();
  const entry = state.companionBond?.[companionId];
  return entry ? { xp: entry.xp || 0, level: entry.level || 1 } : { xp: 0, level: 1 };
}

function applyCompanionBond(state, companionId, amount = 1) {
  if (!companionId || amount <= 0) return 0;
  if (!state.companionBond || typeof state.companionBond !== "object") {
    state.companionBond = {};
  }
  const cur = state.companionBond[companionId] || { xp: 0, level: 1 };
  cur.xp = (cur.xp || 0) + amount;
  while (cur.xp >= 5) {
    cur.xp -= 5;
    cur.level = (cur.level || 1) + 1;
  }
  state.companionBond[companionId] = cur;
  return amount;
}

export function tryUnlockModule(
  boutiqueId,
  { levelId = null, challengeId = null, companionId = null } = {},
) {
  const boutique = getBoutique(boutiqueId);
  if (!boutique) return null;
  const state = loadFashionState();
  const entry = state.boutiques[boutiqueId];
  const cid = challengeId || (levelId != null ? `level-${levelId}` : null);
  if (cid && entry.completedChallengeIds.includes(cid)) return null;

  const next = boutique.modules.find((m) => !entry.unlocked.includes(m));
  if (!next) return null;

  entry.unlocked.push(next);
  if (cid) entry.completedChallengeIds.push(cid);
  state.sessionDesigned.push({
    boutiqueId,
    moduleId: next,
    levelId,
    challengeId: cid,
    at: Date.now(),
  });

  const allComplete = BOUTIQUES.every((b) => {
    const unlocked = state.boutiques[b.id]?.unlocked || [];
    return unlocked.length >= b.modules.length;
  });
  if (allComplete) state.sharedOutfit = true;

  const bondGained = companionId ? applyCompanionBond(state, companionId, 1) : 0;
  saveFashionState(state);
  void logEvent({
    event_type: "fashion.module_unlock",
    category: "fashion",
    payload: {
      boutiqueId,
      moduleId: next,
      levelId,
      challengeId: cid,
      sharedOutfit: state.sharedOutfit,
      bondGained,
      companionId,
    },
  });
  return {
    boutiqueId,
    moduleId: next,
    sharedOutfit: state.sharedOutfit,
    bondGained,
  };
}

export function clearSessionDesigned() {
  const state = loadFashionState();
  state.sessionDesigned = [];
  saveFashionState(state);
}

export function readSessionDesigned() {
  return [...loadFashionState().sessionDesigned];
}

export function roleMatchesBoutique(boutique, loginRole) {
  if (!boutique?.role || !loginRole) return true;
  return boutique.role === loginRole;
}

export function companionMatchesBoutique(boutique, companionId) {
  if (!boutique?.companionId || !companionId) return true;
  return boutique.companionId === companionId;
}

export const WARDROBE_FILTERS = [
  { id: "hair", labelKey: "wardrobe.filter.hair" },
  { id: "top", labelKey: "wardrobe.filter.top" },
  { id: "skirt", labelKey: "wardrobe.filter.skirt" },
  { id: "shoes", labelKey: "wardrobe.filter.shoes" },
  { id: "accessory", labelKey: "wardrobe.filter.accessory" },
  { id: "palette", labelKey: "wardrobe.filter.palette" },
];

export const MODULE_FILTER_IDS = {
  hairpin: "hair",
  top: "top",
  tops: "top",
  dress: "top",
  skirt: "skirt",
  shoes: "shoes",
  accessory: "accessory",
  gadget: "accessory",
  glasses: "accessory",
  bag: "accessory",
  coat: "accessory",
  tech: "accessory",
  wardrobe: "accessory",
  palette: "palette",
  fabric: "palette",
  pattern: "palette",
};

/** Modules that lack independent avatar layers — preview shows ART-TODO, no runtime patch. */
export const MODULE_LAYER_GAPS = new Set(["skirt", "shoes", "tops", "fabric"]);

const BOUTIQUE_STYLE_TAGS = {
  "style-lab": ["clever", "elegant"],
  "dream-atelier": ["dreamy", "sweet"],
  "tech-garage": ["bold", "clever"],
  "pattern-house": ["elegant", "clever"],
};

const MODULE_EXTRA_TAGS = {
  hairpin: ["sweet"],
  top: ["clever"],
  dress: ["dreamy", "elegant"],
  skirt: ["sweet"],
  shoes: ["bold"],
  accessory: ["elegant"],
  palette: ["dreamy"],
  coat: ["elegant"],
  pattern: ["clever"],
};

const ROLE_SCORE_MULT = {
  researcher: 1.05,
  artist: 1.1,
  engineer: 1.0,
  analyst: 1.08,
};

export function buildModuleInventory() {
  const state = loadFashionState();
  const items = [];
  BOUTIQUES.forEach((boutique, boutiqueIndex) => {
    const unlocked = state.boutiques[boutique.id]?.unlocked || [];
    unlocked.forEach((moduleId, orderIndex) => {
      const filterId = MODULE_FILTER_IDS[moduleId] || "accessory";
      items.push({
        id: `${boutique.id}:${moduleId}`,
        boutiqueId: boutique.id,
        moduleId,
        filterId,
        labelKey: MODULE_LABEL_KEYS[moduleId],
        boutiqueNameKey: boutique.nameKey,
        orderIndex,
        boutiqueIndex,
        layerGap: MODULE_LAYER_GAPS.has(moduleId),
        tags: [
          ...(BOUTIQUE_STYLE_TAGS[boutique.id] || []),
          ...(MODULE_EXTRA_TAGS[moduleId] || []),
        ],
      });
    });
  });
  return items;
}

export function totalUnlockableModules() {
  return BOUTIQUES.reduce((sum, b) => sum + b.modules.length, 0);
}

export function computeStyleIdentity(selectedItems, fashionRole = "researcher") {
  const tagWeights = new Map();
  let score = 0;
  selectedItems.forEach((item) => {
    score += 100 + (item.orderIndex + 1) * 40 + item.boutiqueIndex * 20;
    item.tags.forEach((tag) => tagWeights.set(tag, (tagWeights.get(tag) || 0) + 1));
  });
  score = Math.round(score * (ROLE_SCORE_MULT[fashionRole] || 1));
  const tags = [...tagWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
  let rank = "C";
  if (score >= 720) rank = "S";
  else if (score >= 540) rank = "A";
  else if (score >= 360) rank = "B";
  return { score, rank, tags };
}

export function readSavedLooks() {
  return [...(loadFashionState().savedLooks || [])];
}

export function saveLookEntry({ name, modules, boutiqueId, score, rank }) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return { ok: false, code: "empty" };
  if (trimmed.length > 24) return { ok: false, code: "length" };

  const state = loadFashionState();
  if (!Array.isArray(state.savedLooks)) state.savedLooks = [];
  if (state.savedLooks.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
    return { ok: false, code: "duplicate" };
  }

  const look = {
    id: `look-${Date.now()}`,
    name: trimmed,
    modules: { ...modules },
    boutiqueId: boutiqueId || null,
    score: score || 0,
    rank: rank || "C",
    savedAt: Date.now(),
  };
  state.savedLooks.push(look);
  state.activeLookId = look.id;
  saveFashionState(state);
  void logEvent({
    event_type: "fashion.look_saved",
    category: "fashion",
    payload: {
      lookId: look.id,
      name: look.name,
      boutiqueId: look.boutiqueId,
      score: look.score,
      rank: look.rank,
      moduleCount: Object.keys(look.modules || {}).length,
    },
  });
  return { ok: true, look };
}
