# Step 1：进入 Fashion Town

视觉参考：`reference.png`。只处理 `/nuannuan/town` 和必要的 Fashion Town 共用样式/配置。

## 简要指令

把现有小镇入口改造成图示三栏旅程页：左侧 AI World Park 小地图和 Fashion Town 说明；中央四张由 `BOUTIQUES` 渲染的精品店卡；右侧旅程规则；底部五步导航高亮第 1 步。使用真实玩家、钱包、店铺进度和推荐伙伴，移除 emoji 占位。精品店选择有单选、键盘和明确选中态；`Enter Boutique` 先保存 active boutique，再按已有状态进入角色创建、伙伴选择或地图。四店建筑素材缺失时使用带 `ART-TODO` 标记的现有小镇占位图，不得裁 reference。

保持现有数据和跳转逻辑；不要实现后续页面。移动端按“小地图/说明 → 店铺卡 → 规则 → 按钮”重排，店铺卡可纵向或横向滚动但必须可读。

完成后执行 `QA_CHECKLIST.md`。
