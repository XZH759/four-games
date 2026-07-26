# Cursor 游戏精美化实施包

本实施包用于把初始形象、伙伴选择、任务、地图、图鉴、商城、抽卡、成就和章节结算等页面，逐个升级为精致、统一、可扩展的幻想换装学习游戏界面。

## 最重要的原则

Cursor 擅长：
- 页面结构、组件、状态管理；
- CSS 视觉系统；
- 过渡动画和交互反馈；
- 图片图层组合与资源管理。

Cursor 不擅长凭空绘制高精度角色立绘。正式效果需要先准备统一角色素材，再交给 Cursor 集成。不要要求 Cursor 用 div、简单 SVG 或 CSS 几何图形画出最终人物。

## 推荐使用顺序

1. 本文件夹已经命名为 `design-kit/`，把它完整复制到项目根目录，不要拆散。
2. 先阅读 `00_交给Cursor_执行顺序.md` 和 `项目目录与上下级关系.md`。
3. 本包已把 10 张效果参考图分到 `interfaces/` 的 10 个界面子目录。
4. 每次只发送一个子目录的 `CURSOR_TASK.md`，完成后执行同目录的 `QA_CHECKLIST.md`。
5. 按 `00_交给Cursor_执行顺序.md` 操作，不要一次性发送多个界面。
6. 先让 Cursor 完成审计和架构，再放入正式人物素材。
7. 使用 `scripts/validate-avatar-assets.mjs` 检查所有透明图层尺寸是否一致。
8. 全部界面完成后按照 `checklists/visual-qa.md` 做总体验收。

## 文件说明

- `prompts/01_master_audit.md`：让 Cursor 检查现有项目并制定修改计划。
- `prompts/02_asset_architecture.md`：建立高清分层人物系统。
- `prompts/03_visual_polish.md`：实现暖暖风 UI 视觉精修。
- `prompts/03b_multi_page_reference_alignment.md`：只建立真实路由与界面子任务映射。
- `prompts/04_interaction_polish.md`：实现点击、切换、预加载、过渡和反馈。
- `prompts/05_integrate_assets.md`：将正式立绘接入页面。
- `prompts/06_final_qa.md`：最终修复和验收。
- `prompts/image_generation_prompts.md`：用于生成统一角色与服装素材的提示词。
- `styles/game-theme.css`：可直接复用的颜色、边框、按钮与动效变量。
- `styles/avatar-motion.css`：角色切换、卡片选择和减弱动画支持。
- `src/avatar/avatar-manifest.ts`：人物资源配置模板。
- `src/avatar/avatar-types.ts`：人物配置和分层资源类型模板。
- `src/avatar/AvatarRenderer.tsx`：React 分层渲染示例。
- `scripts/validate-avatar-assets.mjs`：检查角色资源尺寸和透明通道。
- `assets/ui/*.svg`：可直接使用的原创星光主题装饰素材。
- `interfaces/COMMON_REQUIREMENTS.md`：每个界面都必须遵守的质量基线。
- `interfaces/*/reference.png`：当前界面的唯一视觉参考。
- `interfaces/*/CURSOR_TASK.md`：当前界面的独立制作指令。
- `interfaces/*/QA_CHECKLIST.md`：当前界面的独立验收清单。

## 两类目录不要混淆

- `design-kit/assets/`：交给 Cursor 的参考资源和 UI 原始素材。
- `public/assets/`：游戏运行时真正读取的静态资源目录；正式人物图应放在 `public/assets/avatar/`。

`design-kit/src/` 是实现示例。Cursor 应根据现有项目技术栈合并，不要未经审计直接覆盖项目的 `src/`。
