# Step 4：Solve Fashion Challenges

视觉参考：`reference.png`。只处理 `/collect?level=:n&boutique=:id` 的 quiz 状态。

## 简要指令

保留现有真实题库、`ItemRenderer`、答题日志和正确性判断，把 quiz 状态改造成图示三栏：左侧玩家与 confirmed companion；中央挑战题、题目情境和真实选项；右侧当前 boutique 的 Design Board，显示已解锁模块、锁定位和本阶段进度。底部五步导航高亮第 4 步。

用户先选择再提交；提交正确时只调用一次 Fashion 解锁逻辑并更新设计板，错误时显示解释/思路提示但不解锁。伙伴可以鼓励、提醒检查主题/条件，不能指明正确选项。`Save Draft` 只保存当前输入，不计正确、不发奖励。阶段完成才进入 Design Complete；中途刷新恢复答案和进度。

服装选项必须来自真实题目数据；缺少独立插画时用带标签的模块占位卡并记录 `ART-TODO`，不得从 reference 裁切。

完成后执行 `QA_CHECKLIST.md`。
