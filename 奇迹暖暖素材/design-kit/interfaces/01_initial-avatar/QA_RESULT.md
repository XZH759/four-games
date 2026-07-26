# 界面 01 QA 结果 · 初始形象创建

测试日期：2026-07-20（WebP 分层 + 九宫格 UI）  
路由：`/nuannuan/create`  
入口：`nuannuan/create/index.html` + `create.js` + `create.css`

## 清单逐项

- [x] 未改业务路由：确认仍跳转 `/nuannuan/partner`
- [x] 中央 / 性别卡 / 体型卡 / 套装卡共用 `AvatarRenderer`（WebP 分层）
- [x] 男女切换保留各自配置（发型不串；名称共享）
- [x] 换套装 / 体型不重置发型
- [x] 画布 1600×2400，`object-fit: contain` + 脚底锚点，无 scaleX / 拉伸
- [x] 切换保留旧层 + 220ms 交叉淡化，不闪白
- [x] 空名就地提示；localStorage 恢复
- [x] 正式页默认 WebP（`data-placeholder=0`，SVG 层数 0）
- [x] UI 路径来自 `ui-manifest.js` / `ui-manifest.ts`，已移除 sliced 硬编码依赖
- [x] 卡片 / 按钮状态：default · hover · pressed · selected · disabled · loading/saving
- [x] 三种视口截图：`qa-shots/01-initial-avatar/{1440x900,1024x768,390x844}.png`

## 素材生成

- `node scripts/generate-create-assets.mjs`
- 校验：`node 奇迹暖暖素材/design-kit/scripts/validate-avatar-assets.mjs assets/avatar` → 267 文件，异常 0

## 已知说明

1. 当前人物 WebP 为**原创程序化分层**（非商业立绘），用于替换 SVG 默认显示；后续可替换同名文件升级画质。
2. 九宫格为程序化生成的原创 UI 贴图，非参考图裁切。
3. SVG 仅作开发 fallback，正式页默认不显示。
