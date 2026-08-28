# Step 3B：精品店关卡地图

读取 `REFERENCE_POINTER.md`。只处理 `/nuannuan/map?boutique=:id` 和必要的地图配置。

## 简要指令

把现有关卡地图作为所选 boutique 的内部挑战路线：标题、颜色、模块奖励和推荐伙伴由 active boutique 驱动；节点仍读取真实 map progress、前置关系和 `map-config`。节点详情明确显示“本题将设计的服装模块”，进入后把 `level` 与 `boutique` 同时传给 `/collect`。伙伴只显示鼓励/提醒。

不要复制或新建一套固定坐标假地图。完成、当前、可进入、锁定和奖励节点必须同时有图形与文字状态；返回应回到 `/nuannuan/town?boutique=:id`。此衔接页的旅程状态标记为第 4 步“准备挑战”。

完成后执行 `QA_CHECKLIST.md`。
