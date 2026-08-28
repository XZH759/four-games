# Step 4B：Design Complete

视觉参考：`reference.png`。只处理 `/collect` 的 settle/完成状态，不另建与答题状态脱节的假页面。

## 简要指令

把现有简化结算升级为图示完成页：顶部完成横幅；左侧 confirmed companion 庆祝；中央展示本次 `sessionDesigned` 中真实新模块卡和奖励；右侧展示这些模块如何进入穿搭槽；底部提供 `Continue Designing` 与 `View Wardrobe`。解锁卡按 hair/top/skirt/shoes/accessory 等真实 slot 渲染，不固定为四张。

结算只读取已提交结果，不在进入页面时再次发奖。没有新模块时显示“本轮未解锁，可回顾题目”，不伪造奖励。继续设计返回当前 boutique 地图/下一可用关卡；衣柜进入 `/nuannuan/wardrobe`。庆祝粒子短而克制，并支持 reduced motion。

完成后执行 `QA_CHECKLIST.md`。
