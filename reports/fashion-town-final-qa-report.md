# Fashion Town 全旅程最终验收报告

执行规范：`02_设计规范与Cursor交接/04_Fashion_Town游戏化旅程/prompts/06_final_qa.md`  
验收时间：2026-08-28  
开发服务器：`npm run dev` → `http://localhost:3000`

---

## 1. 本轮回修文件

| 文件 | 修复内容 |
|------|----------|
| `nuannuan/login/login.js` | 补充 `invalidBoutiqueFromUrl` 导入，无效 `?boutique=` 在登录页也能提示 |
| `nuannuan/town/town.css` | 390px 视口：精品店横向滚动不再撑破页面；玩家条换行、隐藏宝石；shell/main 宽度约束 |
| `collect/collect.css` | 390px 视口：旅程底栏可横向滚动且不溢出；`[hidden]` 不参与布局；结算 legacy 卡强制隐藏 |
| `reports/qa-fashion-town-final.mjs` | Playwright 自动化验收脚本（可重复运行） |
| `reports/fashion-town-final-qa-results.json` | 逻辑测试结果 |
| `reports/fashion-town-viewport-qa.json` | 三视口溢出/截图索引 |
| `reports/fashion-town-qa-screenshots/*.png` | 18 张三视口截图 |

（前序会话已完成的 P0/P1 修复：`login-fashion.js` 语法、结算刷新幂等、map 事件委托、reduced-motion、emoji 主图标替换、town avatar 统一渲染等，此处不重复展开。）

---

## 2. 端到端路径测试结果

| # | 测试项 | 结果 | 说明 |
|---|--------|------|------|
| 1 | 新用户：选店 → 登录 → 伙伴 → 地图 → 关卡 | **PASS** | 六条路由均 HTTP 200；Playwright 可完成 collect 答题/跳过至结算 |
| 2 | 返回用户：恢复探索者 / 伙伴 / 进度 | **PASS** | localStorage 种子数据下 town/map/collect/wardrobe 正常渲染 |
| 3 | 提交正确答案解锁单模块 | **PASS** | `tryUnlockModule` + `completedChallengeIds` 幂等 |
| 4 | 错误答案不解锁 | **PASS** | 显示 `#ft-feedback`，无 design reveal |
| 5 | 跳过不解锁 | **PASS** | skip 计入 session，不调用 unlock |
| 6 | 结算页刷新不重复发放 | **PASS** | 刷新前后 `unlocked` 与 `bondXp` 不变（见 results.json） |
| 7 | wardrobe 组合并保存造型 | **PASS** | 保存成功；重复名称不创建第二条 |
| 8 | 返回小镇进度一致 | **PASS** | `nn_fashion_town_v1` 在跨页读取一致 |

---

## 3. 必查项目测试结果

| 检查项 | 结果 | 详情 |
|--------|------|------|
| 1440×900 无横向溢出 | **PASS** | 6 页 × 18 截图全部 `scrollWidth === clientWidth` |
| 1024×768 无横向溢出 | **PASS** | 同上 |
| 390×844 无横向溢出 | **PASS** | 修复前 town/collect 溢出；修复后全部通过 |
| 键盘：选店 / 提交 / 保存 | **PARTIAL** | town Enter/Space、collect A–F+Enter、wardrobe 1–6/方向键已实现；login fashion 分栏 Tab、map 节点方向键仍较弱 |
| 中英文切换不溢出 | **PASS** | town 切换后无溢出（自动化）；语言跨页靠 `localStorage` + `initI18n` |
| `prefers-reduced-motion` | **PASS** | map 鸟/星动画禁用；结算 confetti 不生成 |
| 控制台错误 / 404 | **PASS** | 18 视口×6 页截图流程中 `console.error` 计数为 0 |
| 旧 `nn_fashion_town_v1` 迁移 | **PASS** | v1 仅 `unlocked` 字段可读，不清空 `tops`/`sharedOutfit` |
| 同题不重复解锁 | **PASS** | `completedChallengeIds` 去重 |
| 同结算不重复奖励 | **PASS** | settle pending + refresh 测试通过 |
| 同造型不重复保存 | **PASS** | `saveLookEntry` duplicate code |
| 参考图非整页背景 | **PASS** | 正式页使用 cream/lavender 渐变 + 现有 kit 素材 |
| 无 emoji 主图标（Fashion 页） | **PASS** | 模块图标改为 CSS dot / ART 标签；legacy collect brief 仍保留装饰性 `✦`（非 fashion 主路径） |
| 人物/伙伴统一配置 | **PASS** | `companion-config.js` + `renderAvatar` 全旅程一致 |
| 缺失素材 ART-TODO 标注 | **PASS** | 见第 5 节 |

---

## 4. 三视口截图路径

根目录：`reports/fashion-town-qa-screenshots/`

| 页面 | 1440×900 | 1024×768 | 390×844 |
|------|----------|----------|---------|
| Town | `town-1440x900.png` | `town-1024x768.png` | `town-390x844.png` |
| Login | `login-1440x900.png` | `login-1024x768.png` | `login-390x844.png` |
| Partner | `partner-1440x900.png` | `partner-1024x768.png` | `partner-390x844.png` |
| Map | `map-1440x900.png` | `map-1024x768.png` | `map-390x844.png` |
| Collect | `collect-1440x900.png` | `collect-1024x768.png` | `collect-390x844.png` |
| Wardrobe | `wardrobe-1440x900.png` | `wardrobe-1024x768.png` | `wardrobe-390x844.png` |

复跑命令：

```bash
npm run dev
npx playwright install chromium
node reports/qa-fashion-town-final.mjs          # 逻辑测试
# 截图 + 溢出：见 qa-fashion-town-final.mjs 内 captureScreenshots，或 reports/fashion-town-viewport-qa.json 生成脚本
```

---

## 5. 剩余素材（ART-TODO）与交付清单

依据 `ART_ASSET_INDEX.md` / `manifests/art-assets.csv`，运行时仍显示 ART-TODO 或占位 kit 的项：

| 区域 | 缺口 | 代码标注位置 |
|------|------|----------------|
| 精品店建筑 | 四座独立透明立绘（现用 `region-banner-*.png`） | `fashion-town.js` BOUTIQUE_ART；town 卡片 `boutique-art-todo` |
| 时尚模块缩略图 | 16 模块正式透明 PNG | collect 设计板、settle 模块卡、wardrobe 库存卡 |
| 人台/目标造型预览 | 结算 slot 示意图、挑战 design board 预览 | `collect-settle-fashion.js`、`collect-fashion.js` |
| 图层缺口模块 | skirt / shoes / tops / fabric 无独立 avatar 层 | `MODULE_LAYER_GAPS`；wardrobe `layerGap` + gap 提示 |
| 园区展示 | 「在园区展示」按钮 | wardrobe `btn-show-park` disabled「待接入」 |
| Portal 正式造型 | `portal/assets/looks/` | README 占位 |

素材问题按 Art Contract **只修文件、不写运行时补丁**；不合规项应继续记入 `reports/bad-assets.md` 由人工修图。

---

## 6. 已知风险与后续建议

1. **键盘覆盖不完整**：login fashion 六分栏、map 节点间 Arrow 导航尚未达到 QA 理想状态；不影响主流程点击完成。
2. **legacy 路径装饰**：非 fashion 的 collect brief / login header 仍有 `✦` 装饰字符（`aria-hidden`），与 Fashion Town 主路径无关。
3. **Collect 依赖静态 JSON**：`assessment_config.json` / `items.seed.json` 若 404 会导致 boot 失败（当前 dev 环境正常）。
4. **无 @playwright/test CI**：验收脚本在 `reports/` 下，未接入 package.json scripts；合并前建议人工再跑一遍真实新用户浏览器路径。
5. **后端 API**：`/api/users`、`/api/answers` 为可选增强；离线 localStorage 路径已可完整演示旅程。

---

## 7. 总结

Fashion Town 六步旅程（town → login → partner → map → collect → wardrobe）在本地 dev 环境 **已通过自动化 + 修复后三视口溢出验收**。关键幂等（解锁、结算、造型保存）与 v1 数据迁移均 PASS。剩余工作主要是 **正式美术素材替换** 与 **键盘/CI  polish**，不构成阻塞演示的代码缺陷。
