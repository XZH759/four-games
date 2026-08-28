# Cursor 第 0 步：只审计，不改代码

请先读取：

```text
02_设计规范与Cursor交接/04_Fashion_Town游戏化旅程/README_先看这里.md
02_设计规范与Cursor交接/04_Fashion_Town游戏化旅程/COMMON_REQUIREMENTS.md
02_设计规范与Cursor交接/04_Fashion_Town游戏化旅程/DATA_AND_ROUTES.md
02_设计规范与Cursor交接/04_Fashion_Town游戏化旅程/ART_ASSET_INDEX.md
02_设计规范与Cursor交接/04_Fashion_Town游戏化旅程/manifests/journey.json
```

本阶段不要修改任何代码或素材。审计现有 `/nuannuan/town`、`/nuannuan/login`、`/nuannuan/partner`、`/nuannuan/map`、`/collect`、`/nuannuan`，以及 `js/nuannuan/fashion-town.js`、avatar/companion/map 配置。

输出：

1. 每个路由的入口 HTML/CSS/JS、状态 key、跳转条件和当前实现程度。
2. 五张新 reference 与真实路由的一对一映射。
3. 复用素材路径、缺失素材和不能直接使用的占位内容。
4. `nn_fashion_town_v1` 的向后兼容扩展方案。
5. 每一步拟修改文件，明确哪些现有未提交修改会被保留。
6. 当前已知闭环缺口，至少核对最后一件模块的 sharedOutfit 判断、重复发奖和 boutique 参数传递。

没有定位真实页面或数据源前，不要开始视觉改造。
