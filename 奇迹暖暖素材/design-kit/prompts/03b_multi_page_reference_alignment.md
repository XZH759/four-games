# 阶段 3B：路由与界面子任务映射

本阶段只做映射，不修改代码，也不一次性实施全部界面。

先完整读取：

```text
design-kit/interfaces/README.md
design-kit/interfaces/COMMON_REQUIREMENTS.md
design-kit/references/REFERENCE_GUIDE.md
```

然后检查项目路由、页面入口和业务模块，将真实页面映射到以下 10 个独立子任务：

```text
design-kit/interfaces/01_initial-avatar/
design-kit/interfaces/02_companion-selection/
design-kit/interfaces/03_task-list/
design-kit/interfaces/04_level-map/
design-kit/interfaces/05_knowledge-gallery/
design-kit/interfaces/06_shop-collection/
design-kit/interfaces/07_featured-outfits/
design-kit/interfaces/08_blind-box/
design-kit/interfaces/09_achievements/
design-kit/interfaces/10_chapter-complete/
```

## 只输出以下内容

1. 每个子任务对应的真实路由、入口组件和关键子组件。
2. 当前项目不存在的页面及缺失原因。
3. 各界面共享的布局、面板、按钮、标题、进度和状态组件候选。
4. 推荐实施顺序与依赖关系。
5. 每个界面预计修改和新增的文件。

## 强制边界

- 本阶段不要修改任何代码。
- 后续每次只能读取并执行一个子目录的 `CURSOR_TASK.md`。
- 当前界面的 `QA_CHECKLIST.md` 未通过前，不得开始下一个界面。
- 项目不存在的页面只列入缺口，不要凭空创建不具备真实业务的数据页面。
- 参考图不得作为页面背景或正式素材来源。
