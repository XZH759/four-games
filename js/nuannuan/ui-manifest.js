/**
 * UI 九宫格 / 控件资源清单（路径唯一来源，禁止页面硬编码散落路径）
 * 对应用户约定的 ui-manifest；本项目为原生 JS，运行时模块为 .js
 */

const UI = "/assets/ui/nine-slice";
const CREATE_CONTROLS = "/assets/nuannuan/character-create-kit/01_ui_controls";

/** 九宫格默认切片边距（px，相对源图） */
export const NINE_SLICE_INSETS = {
  panel: { top: 36, right: 36, bottom: 36, left: 36 },
  card: { top: 28, right: 28, bottom: 28, left: 28 },
  ribbon: { top: 24, right: 48, bottom: 24, left: 48 },
  button: { top: 28, right: 48, bottom: 28, left: 48 },
};

export const UI_ASSETS = {
  panelPrimary: `${UI}/panel-primary.9.webp`,
  panelSecondary: `${UI}/panel-secondary.9.webp`,

  cardDefault: `${UI}/card-default.9.webp`,
  cardHover: `${UI}/card-hover.9.webp`,
  cardPressed: `${UI}/card-pressed.9.webp`,
  cardSelected: `${UI}/card-selected.9.webp`,
  cardDisabled: `${UI}/card-disabled.9.webp`,
  cardLoading: `${UI}/card-loading.9.webp`,

  buttonPrimaryDefault: `${CREATE_CONTROLS}/004_large_button_pink_1.png`,
  buttonPrimaryHover: `${CREATE_CONTROLS}/005_large_button_pink_glow.png`,
  buttonPrimaryPressed: `${CREATE_CONTROLS}/004_large_button_pink_1.png`,
  buttonPrimaryDisabled: `${CREATE_CONTROLS}/006_large_button_pale_pink.png`,

  buttonSecondaryDefault: `${CREATE_CONTROLS}/001_large_button_purple_1.png`,
  buttonSecondaryHover: `${CREATE_CONTROLS}/002_large_button_purple_glow.png`,
  buttonSecondaryPressed: `${CREATE_CONTROLS}/001_large_button_purple_1.png`,
  buttonSecondaryDisabled: `${CREATE_CONTROLS}/003_large_button_pale.png`,

  titleRibbon: `${UI}/title-ribbon.9.webp`,

  nameScrollDefault: `${UI}/name-scroll-default.webp`,
  nameScrollFocus: `${UI}/name-scroll-focus.webp`,
  nameScrollError: `${UI}/name-scroll-error.webp`,

  selectedCheck: `${CREATE_CONTROLS}/013_circle_check.png`,
  diceDefault: `${CREATE_CONTROLS}/012_circle_dice.png`,
  diceHover: `${CREATE_CONTROLS}/012_circle_dice.png`,
  arrowPrev: `${CREATE_CONTROLS}/010_circle_prev.png`,
  arrowNext: `${CREATE_CONTROLS}/011_circle_next.png`,
};

/** 供 CSS 注入的自定义属性映射 */
export function uiCssVars(prefix = "ui") {
  const entries = Object.entries(UI_ASSETS).map(([key, url]) => {
    const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    return `--${prefix}-${kebab}: url("${url}")`;
  });
  return entries.join(";\n  ");
}

export default UI_ASSETS;
