# Bad Assets Report

生成时间：2026-07-22  
来源：`reports/asset-audit.md` + 建角页已知素材分诊  
**本会话不处理素材，只记录。**

## 规则

按 `.cursor/rules/art-contract.mdc`：不合规素材由人修文件，代码不做 `trimOffset` / 透明探测 / 逐层缩放平移 workaround。

## 职业分解图（不可作运行时叠层）

以下文件为多人/多部件 **reference sheet**，尺寸 `1448×1086`、无 alpha，不符 `1024×1536` 透明图层契约。登录页已改用 `career-cutouts` 单人立绘，**勿再把 sheet 挂到职业卡**：

| 文件 | 问题 |
|---|---|
| `character-reference/assets/reference_sheets/researcher/female/sheet.png` | 非透明图层；分解图 |
| `character-reference/assets/reference_sheets/researcher/male/sheet.png` | 同上 |
| `character-reference/assets/reference_sheets/programmer/female/sheet.png` | 同上 |
| `character-reference/assets/reference_sheets/programmer/male/sheet.png` | 同上 |
| `character-reference/assets/reference_sheets/engineer/female/sheet.png` | 同上 |
| `character-reference/assets/reference_sheets/engineer/male/sheet.png` | 同上 |
| `character-reference/assets/reference_sheets/master_lineup/master_lineup.png` | 阵容图，非单人立绘 |

## 过渡立绘 `career-cutouts`（可用，但质量过渡）

来源：`avatar-layers-extracted.zip`（见同目录 `extraction-report.md`）。

| 路径 | 用途 | 问题 / 限制 |
|---|---|---|
| `*/canvas/composite.png` | 登录职业舞台预览（1024×1536） | LANCZOS 放大，偏软 |
| `*/preview_cutout.png` / `preview_card.png` | 职业卡缩略 | 原生分辨率低 |
| `*/canvas/body.png` · `outfit.png` | 脚底对齐的半套图层 | 仅 body/outfit 生产可用 |
| `*/canvas_experimental/*` | — | **禁止**运行时叠层；头部启发式对位不准 |
| `*/parts/*` | 原生 trim 切块 | 尺度远低于契约，勿直接 inset-0 叠 |

**需要的正式产物**：按 STYLE LOCK 为每职业×性别重生完整 7 层 `1024×1536` 透明 PNG，再替换 composite 过渡图。

## 分层运行时素材（`character-assets`）

审计显示当前 `1024×1536` + alpha 标记为 OK。  
若建角页仍见「头部白框 / 接缝 / 头发像素化」，属视觉验收问题，需人工对照源图：

| 现象 | 归类 | 处理 |
|---|---|---|
| 头部白色矩形底 | 素材抠图/导出 | 重导出透明层；禁止代码裁切补丁 |
| 头发像素化 | 源分辨率不足或被放大 | 换高清源图；禁止 CSS 放大补救 |
| 头部右侧白竖线 | 抠图残渣 | 修图；勿用 edge-detect |
| 男女画风不一致 | 风格锁未统一 | 男性走同一 STYLE LOCK 重生 |
| 图层间接缝 | 导出未对齐脚底锚点 | 按同一 1024×1536 锚点重排 |

## 验收基准（本会话）

渲染契约以 `public/avatar/_fixtures/` + `?fixtures=1` 为准：

- 三层完全对齐
- 层序 `body → outfit → hairFront`
- 容器任意缩放不错位
- 脚底基线 `y=1440` 重合
