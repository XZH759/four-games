# 界面子任务总入口

本目录把视觉精修拆成 10 个可以独立交给 Cursor 的界面任务。不要一次发送全部界面，也不要让 Cursor 同时修改多个页面。

## 每个界面的执行方法

1. 在同一个项目中开启 Cursor Agent。
2. 要求 Cursor 先读取 `design-kit/interfaces/COMMON_REQUIREMENTS.md`。
3. 再读取当前子目录的 `CURSOR_TASK.md`，只处理该界面。
4. 完成后读取同目录的 `QA_CHECKLIST.md`，逐项测试并直接修复。
5. Cursor 必须输出桌面、平板、手机截图、修改文件列表和剩余问题。
6. 人工确认当前界面通过后，再进入下一个子目录。

## 建议顺序

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

每个子目录中的 `reference.png` 只用于提取视觉语言和信息层级，不能作为页面背景，也不能裁切其中的角色、服装、图标或装饰作为正式素材。

