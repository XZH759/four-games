# Cursor Ready AI Character Assets

## 这是什么
这是整理给 Cursor / 前端工程直接调用的角色素材包。

## 当前包内容
- 6 张正式角色资产参考图（研究员 / 程序员 / 工程师，各男女 1 套）
- 1 张主设定阵容图
- 统一配置文件（JSON / TS）
- 角色分类、图层顺序、统一画布与锚点说明

## 目录结构
- `assets/reference_sheets/...`：按 `role/gender` 分类的角色图
- `config/asset-index.json`：主索引
- `config/roles.json`：按职业分类
- `config/layer-system.json`：统一图层系统
- `config/characterAssets.ts`：可直接在 Cursor / TS 项目中 import 的注册表
- `examples/presets.json`：示例 preset
- `docs/cursor_prompt_template.md`：给 Cursor 的说明模板

## 重要说明
当前这些文件是 **reference sheets（参考分解图）**，不是已经切好的透明独立图层。
也就是说：
- 适合做：风格参考、角色配置、UI 调用、二次开发说明
- 还不适合直接做：运行时逐层叠戴

如果你下一步要做真正的换装 / 叠戴系统，建议基于这套命名和分类结构，继续导出：
- `body.png`
- `outfit.png`
- `hairBack.png`
- `face.png`
- `eyes.png`
- `hairFront.png`
- `accessory.png`

## 统一标准
- Canvas: `1024 x 1536`
- Anchor: `foot_center = (512, 1216)`
- Layer order: `body -> outfit -> hairBack -> face -> eyes -> hairFront -> accessory`