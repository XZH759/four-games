/** Star Closet clothing catalog — merged into castle point exchange. */

export const STAR_CLOSET_SHEET = "/assets/nuannuan-shop.png";
const CARD_W = 197;
const COLS = [10, 213, 416, 618, 821];
const ROWS = [90, 435];

/** @typedef {"top"|"bottom"|"headwear"|"set"} ClothingType */

/**
 * clothingType: top 上装 · bottom 下装 · headwear 头饰 · set 套装
 * price: 钻石（活动任务奖励货币，用于兑换星橱服装）
 */
export const STAR_CLOSET_ITEMS = [
  { id: "sc-1", name: "星海花冠", clothingType: "headwear", price: 1680, tags: ["华丽", "优雅"], sheetIndex: 0, rarity: "e" },
  { id: "sc-2", name: "夜泉之翼", clothingType: "set", price: 1480, tags: ["帅气", "成熟"], sheetIndex: 1, rarity: "e" },
  { id: "sc-3", name: "甜心游园会", clothingType: "set", price: 980, tags: ["可爱", "清纯"], sheetIndex: 2, rarity: "r" },
  { id: "sc-4", name: "竹影清荷", clothingType: "set", price: 1280, tags: ["清新", "优雅"], sheetIndex: 3, rarity: "r" },
  { id: "sc-5", name: "雪域长歌", clothingType: "set", price: 1680, tags: ["华丽", "成熟"], sheetIndex: 4, rarity: "e" },
  { id: "sc-6", name: "阳光小橘子", clothingType: "bottom", price: 680, tags: ["可爱", "活泼"], sheetIndex: 5, rarity: "c" },
  { id: "sc-7", name: "街头律动", clothingType: "top", price: 1080, tags: ["帅气", "活泼"], sheetIndex: 6, rarity: "r" },
  { id: "sc-8", name: "星月幻梦", clothingType: "set", price: 1380, tags: ["华丽", "优雅"], sheetIndex: 7, rarity: "e" },
  { id: "sc-9", name: "暗夜玫瑰", clothingType: "top", price: 1280, tags: ["性感", "成熟"], sheetIndex: 8, rarity: "r" },
  { id: "sc-10", name: "海风少年志", clothingType: "bottom", price: 880, tags: ["清新", "活泼"], sheetIndex: 9, rarity: "r" },
];

export const CLOTHING_TYPE_IDS = ["all", "top", "bottom", "headwear", "set"];
export const CLOTHING_EQUIP_SLOTS = ["top", "bottom", "headwear", "set"];

const ITEM_MAP = new Map(STAR_CLOSET_ITEMS.map((it) => [it.id, it]));

export function findClothingItem(id) {
  return ITEM_MAP.get(id) || null;
}

export function allClothingItems() {
  return STAR_CLOSET_ITEMS.slice();
}

export function clothingPrice(item) {
  return Math.max(0, Math.round(Number(item?.price) || 0));
}

/** @deprecated alias */
export const clothingDiamondPrice = clothingPrice;

export function sheetStyle(sheetIndex) {
  const idx = Number(sheetIndex) || 0;
  const col = idx % 5;
  const row = Math.floor(idx / 5);
  return {
    backgroundImage: `url(${STAR_CLOSET_SHEET})`,
    backgroundSize: `${(519.8 / CARD_W) * 100}% auto`,
    backgroundPosition: `${-(COLS[col] / CARD_W) * 100}% ${-(ROWS[row] / 245) * 100}%`,
  };
}

/** Migrate legacy nn_shop_v1 owned ids → sc-* keys */
export function migrateLegacyShopOwned(ownedIds = []) {
  const out = {};
  ownedIds.forEach((raw) => {
    const id = `sc-${raw}`;
    if (findClothingItem(id)) out[id] = 1;
  });
  return out;
}
