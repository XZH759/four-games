# Step 5：Assemble Your Signature Look

视觉参考：`reference.png`。建立 `/nuannuan/wardrobe`，复用现有 `/nuannuan`、avatar 和 Fashion 状态；不要另做独立 demo。

## 简要指令

实现图示三栏装配页：左侧只列真实已解锁模块并按 Hair/Top/Skirt/Shoes/Accessory/Palette 筛选；中央用统一 avatar 分层渲染器实时预览当前草稿造型、命名并提供 Save Look；右侧显示由当前穿搭确定性计算的 Style Identity、confirmed companion 的真实 bond 和 Fashion role 影响。底部五步导航高亮第 5 步。

选择模块只更新 preview draft；Save Look 成功后才写入 `savedLooks`/`activeLookId`。不兼容或缺失独立图层时禁用相应组合并说明素材缺口，不让图层错位。空库存引导返回小镇挑战。`Show in Park` 只有真实入口存在时启用，否则标为待接入；`Visit Boutique` 返回当前店。

完成后执行 `QA_CHECKLIST.md`。
