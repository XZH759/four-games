# Fashion Town 美术素材索引

`reference.png` 是效果参考，不是可直接上生产的切图。运行时优先复用下列现有项目素材；完整机器可读清单见 `manifests/art-assets.csv`。

## 01 进入 Fashion Town

- 设计图：`interfaces/01_enter-fashion-town/reference.png`
- 场景：`nuannuan/login/assets/bg-lobby.png`、`assets/park/clay/island.png`、`assets/park/clay/zones/zone-4-town.png`
- 地图/节点：`nuannuan/map/assets/world-map.png`、`nuannuan/map/assets/kit/region-banner-*.png`
- 主按钮/步骤条：`nuannuan/素材/01_ui_controls/001_large_button_purple_1.png`、`049_stepper_1_to_5.png`
- 面板/装饰：`nuannuan/素材/02_panels_cards/002_panel_medium_blank.png`、`nuannuan/素材/03_decorations/030_star_large_gold.png`、`nuannuan/素材/03_decorations/038–040_sparkle_*.png`
- 缺口：四座精品店需要各自独立透明建筑立绘；现有素材可先作清楚标记的占位，不能从参考图裁切。

## 02 Build Your Explorer

- 设计图：`interfaces/02_build-explorer/reference.png`
- 分层角色：`assets/nuannuan/avatar-standardized/`、`js/nuannuan/avatar-config.js`
- 现有角色主题预览：`nuannuan/login/assets/theme-packs/*.png`
- 舞台：`nuannuan/素材/03_decorations/011_stage_large.png`、`nuannuan/素材/03_decorations/012_platform_round_purple.png`
- 外观选项：`nuannuan/素材/04_character_reference/010–024_*`（女）、`nuannuan/素材/04_character_reference/047–061_*`（男）
- 控件：`nuannuan/素材/01_ui_controls/012_circle_dice.png`、`nuannuan/素材/01_ui_controls/013_circle_check.png`、`nuannuan/素材/01_ui_controls/024_segmented_tab_3_purple.png`
- 伙伴预告：使用 `js/nuannuan/companion-config.js` 的真实 portrait，不能复制设计稿中的 Lumi。

## 03 选择 AI Companion

- 已有设计参考：`奇迹暖暖素材/design-kit/interfaces/02_companion-selection/reference.png`
- 伙伴卡与立绘：`nuannuan/partner/assets/companions/*.png`、`nuannuan/partner/assets/stages/*.png`
- 伙伴数据：`js/nuannuan/companion-config.js`
- 卡框：`nuannuan/partner/assets/companions/frame.png`、`companions/shared/card-frame-9slice.png`、`selected-badge.png`

## 03B 精品店关卡地图

- 已有设计参考：`奇迹暖暖素材/design-kit/interfaces/04_level-map/reference.png`
- 地图：`nuannuan/map/assets/world-map.png`、`world-map-alt.png`
- 节点/连线/按钮：`nuannuan/map/assets/kit/node-*.png`、`halo-*.png`、`btn-*.png`
- 配置：`js/nuannuan/map-config.js`

## 04 Solve Fashion Challenges

- 设计图：`interfaces/04_fashion-challenge/reference.png`
- 伙伴：当前 confirmed companion 的 portrait 与 stage。
- 题目：现有题库、`assessment_config.json` 和 `ItemRenderer`；不把服装插图当答案数据。
- 设计板/卡片：`nuannuan/素材/02_panels_cards/001_panel_large_stage.png`、`nuannuan/素材/02_panels_cards/007_outfit_card_selected.png`、`nuannuan/素材/02_panels_cards/008_outfit_card_locked.png`
- 模块缩略图：`nuannuan/素材/02_panels_cards/011_item_hair.png`、`nuannuan/素材/02_panels_cards/012_item_dress.png`、`nuannuan/素材/02_panels_cards/013_item_shoes.png`、`nuannuan/素材/02_panels_cards/014_item_necklace.png`
- 提交/提示：`nuannuan/素材/01_ui_controls/004_large_button_pink_1.png`、`nuannuan/素材/01_ui_controls/046_speech_tooltip.png`、`nuannuan/素材/01_ui_controls/031_toast_panel.png`
- 缺口：若题目需要四张独立服装选项插图，应由美术按统一透明底规范补齐并进入 manifest；不能从设计图裁切。

## 04B Design Complete

- 设计图：`interfaces/04b_design-complete/reference.png`
- 解锁卡：`nuannuan/素材/02_panels_cards/018_reward_card.png`、`nuannuan/素材/02_panels_cards/007_outfit_card_selected.png`
- 服装模块：`nuannuan/素材/02_panels_cards/011_item_hair.png`、`nuannuan/素材/02_panels_cards/012_item_dress.png`、`nuannuan/素材/02_panels_cards/013_item_shoes.png`、`nuannuan/素材/02_panels_cards/014_item_necklace.png`
- 庆祝：`nuannuan/素材/03_decorations/030_star_large_gold.png`、`nuannuan/素材/03_decorations/038–040_sparkle_*.png`、`nuannuan/素材/03_decorations/059–066_magic_effect_*.png`、`nuannuan/素材/03_decorations/073–077_ribbon_*.png`
- 主/次按钮：`nuannuan/素材/01_ui_controls/002_large_button_purple_glow.png`、`nuannuan/素材/01_ui_controls/003_large_button_pale.png`

## 05 Assemble Signature Look

- 设计图：`interfaces/05_assemble-outfit/reference.png`
- 角色：必须使用 `assets/nuannuan/avatar-standardized/` 的同一分层配置。
- 库存卡：`nuannuan/素材/02_panels_cards/007_outfit_card_selected.png`、`nuannuan/素材/02_panels_cards/008_outfit_card_locked.png` 和四个 item 缩略图。
- 舞台：`nuannuan/素材/03_decorations/001_background_arch_scene.png`、`nuannuan/素材/03_decorations/011_stage_large.png`、`nuannuan/素材/03_decorations/012_platform_round_purple.png`、`nuannuan/素材/03_decorations/072_frame_arch_purple.png`
- 色板/选择态：`nuannuan/素材/01_ui_controls/024–027_segmented_tab_*.png`、`nuannuan/素材/01_ui_controls/032_radio_purple_selected.png`、`nuannuan/素材/01_ui_controls/035_radio_pink_selected.png`。
- 伙伴：confirmed companion portrait/stage；羁绊值来自状态，不使用固定 Lv.5。
- 缺口：当前标准化人物仅有整套 outfit 层，不足以完全独立组合 top/skirt/shoes。先把已有模块作为可选缩略图与整套映射；正式自由混搭需要美术按同一画布、锚点和 z-index 输出独立服装层。

## 素材接入规则

- 新素材放入稳定运行时目录，并更新一个统一 manifest；页面不散落硬编码路径。
- 同类角色图层必须尺寸、锚点、透明通道一致；先运行项目已有资源校验再接入。
- 图片保持宽高比；首屏关键场景可预加载，其余 `loading="lazy"`。
- 每个缺失素材都使用 `ART-TODO` 标记并在交付报告列出，禁止用“已完成”掩盖占位。
