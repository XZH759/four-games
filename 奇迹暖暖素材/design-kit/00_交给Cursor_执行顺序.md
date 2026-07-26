# 交给 Cursor：按顺序执行

## 使用前准备

1. 把整个 `design-kit/` 文件夹放到现有游戏项目根目录。
2. 10 个界面已分别放入 `design-kit/interfaces/`；每个子目录包含参考图、独立任务和独立验收清单。
3. 不要新建独立项目；所有修改都应基于现有项目、路由和业务逻辑。
4. 在同一个 Cursor Agent 对话中逐阶段执行。每一阶段检查通过后，再发送下一阶段。

## 发送顺序

### 第 1 次：只审计，不改代码

发送给 Cursor：

```text
请完整读取 design-kit/prompts/01_master_audit.md。先不要修改代码，只检查项目并给出实施计划。请明确页面入口、人物渲染方式、相关组件、路由、状态管理，以及拟新增和修改的文件。
```

确认 Cursor 找到的确实是包含“初始形象创建、体型选择、初始套装、随机生成、确认进入”等功能的页面，再继续。

### 第 2 次：建立分层人物架构

```text
请根据上一阶段的审计结果，完整执行 design-kit/prompts/02_asset_architecture.md。保留现有页面、路由和业务逻辑，不要创建独立项目。参考 design-kit/src/ 中的示例，但要适配当前项目技术栈。
```

完成标志：中央角色、体型卡和套装卡都复用同一个 `AvatarRenderer`；资源路径统一由 `avatar-manifest` 管理。

### 第 3 次：接入统一视觉基础

```text
请把 design-kit/styles/ 中可复用的设计变量和动画适配到现有项目，并把 design-kit/assets/ui/ 的 SVG 复制到项目的 public/assets/ui/。不要另建一套不一致的颜色系统，也不要改变业务规则。
```

### 第 4 次：确认界面与路由映射，不改代码

```text
请读取 design-kit/prompts/03b_multi_page_reference_alignment.md，只输出当前项目路由与 design-kit/interfaces/ 十个界面子任务的映射和缺口，不要修改代码。
```

### 第 5 次开始：每次只制作一个界面

从 `design-kit/interfaces/README.md` 所列顺序开始。每个界面单独发送一次任务，模板如下：

```text
本次只处理 design-kit/interfaces/<当前子目录>/ 对应的一个界面。请先读取 design-kit/interfaces/COMMON_REQUIREMENTS.md，再读取当前目录的 CURSOR_TASK.md 和 reference.png。不得修改其他界面。完成实现后读取同目录的 QA_CHECKLIST.md，逐项测试并直接修复；最后输出三种视口截图、修改文件列表、清单结果和剩余问题。未通过验收前不要开始下一个界面。
```

推荐顺序：

```text
01_initial-avatar
02_companion-selection
03_task-list
04_level-map
05_knowledge-gallery
06_shop-collection
07_featured-outfits
08_blind-box
09_achievements
10_chapter-complete
```

每个界面验收通过后再开启下一次 Cursor 任务。不要在一次请求中发送两个或更多子目录。

### 正式人物素材就位后：单独接入

先按 `design-kit/prompts/asset_export_spec.md` 和 `design-kit/prompts/image_generation_prompts.md` 准备人物素材，并放入 `public/assets/avatar/`。然后发送：

```text
正式人物素材已经位于 public/assets/avatar/。请完整执行 design-kit/prompts/05_integrate_assets.md，严格通过 avatar-manifest 接入，并运行资源检查；不得重新绘制或替换这些素材。
```

### 全部界面完成后：最终验收

```text
请完整执行 design-kit/prompts/06_final_qa.md，并按照 design-kit/checklists/visual-qa.md 逐项检查和修复。请输出桌面与手机截图、修改文件列表、已修复问题、剩余占位素材和性能问题。
```

## 不得跨越的阶段门槛

- 第 1 阶段未定位正确页面：不要改代码。
- 分层渲染未统一：不要继续大规模视觉精修。
- 当前界面的 `QA_CHECKLIST.md` 未通过：不要开始下一个界面。
- 每次 Cursor 只允许处理一个 `interfaces/<子目录>/`。
- 正式人物素材未到位：不得声称涉及人物的界面已经完成，也不得用 CSS/SVG 几何图形冒充最终人物。
- 资源检查存在尺寸或透明通道异常：先修正素材，再接入页面。
- 最终验收必须覆盖 `1440×900`、`1024×768`、`390×844`。
