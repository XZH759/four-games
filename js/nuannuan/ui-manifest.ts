/**
 * UI 九宫格 / 控件资源清单（类型声明源）
 * 运行时请使用同目录 `ui-manifest.js`（本仓库为原生 ES Module，无 TS 打包）。
 */
export const NINE_SLICE_INSETS = {
  panel: { top: 36, right: 36, bottom: 36, left: 36 },
  card: { top: 28, right: 28, bottom: 28, left: 28 },
  ribbon: { top: 24, right: 48, bottom: 24, left: 48 },
  button: { top: 28, right: 48, bottom: 28, left: 48 },
} as const;

const UI = "/assets/ui/nine-slice";

export const UI_ASSETS = {
  panelPrimary: `${UI}/panel-primary.9.webp`,
  panelSecondary: `${UI}/panel-secondary.9.webp`,
  cardDefault: `${UI}/card-default.9.webp`,
  cardHover: `${UI}/card-hover.9.webp`,
  cardPressed: `${UI}/card-pressed.9.webp`,
  cardSelected: `${UI}/card-selected.9.webp`,
  cardDisabled: `${UI}/card-disabled.9.webp`,
  cardLoading: `${UI}/card-loading.9.webp`,
  buttonPrimaryDefault: `${UI}/button-primary-default.webp`,
  buttonPrimaryHover: `${UI}/button-primary-hover.webp`,
  buttonPrimaryPressed: `${UI}/button-primary-pressed.webp`,
  buttonPrimaryDisabled: `${UI}/button-primary-disabled.webp`,
  buttonSecondaryDefault: `${UI}/button-secondary-default.webp`,
  buttonSecondaryHover: `${UI}/button-secondary-hover.webp`,
  buttonSecondaryPressed: `${UI}/button-secondary-pressed.webp`,
  buttonSecondaryDisabled: `${UI}/button-secondary-disabled.webp`,
  titleRibbon: `${UI}/title-ribbon.9.webp`,
  nameScrollDefault: `${UI}/name-scroll-default.webp`,
  nameScrollFocus: `${UI}/name-scroll-focus.webp`,
  nameScrollError: `${UI}/name-scroll-error.webp`,
  selectedCheck: `${UI}/selected-check.webp`,
  diceDefault: `${UI}/dice-button-default.webp`,
  diceHover: `${UI}/dice-button-hover.webp`,
} as const;

export type UiAssetKey = keyof typeof UI_ASSETS;

export function uiCssVars(prefix = "ui"): string {
  return (Object.entries(UI_ASSETS) as [string, string][])
    .map(([key, url]) => {
      const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `--${prefix}-${kebab}: url("${url}")`;
    })
    .join(";\n  ");
}

export default UI_ASSETS;
