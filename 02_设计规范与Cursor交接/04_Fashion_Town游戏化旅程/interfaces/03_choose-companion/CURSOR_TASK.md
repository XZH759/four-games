# Step 3：选择 AI Companion

读取 `REFERENCE_POINTER.md`。只处理 `/nuannuan/partner?from=town&boutique=:id`。

## 简要指令

保持已有“候选列表 → 伙伴详情 → 队伍槽 → 确认 → 开始”逻辑，并接入 active boutique：优先高亮该店推荐伙伴，但允许选择其他真实伙伴；卡片、详情、答题立绘全部读取同一 `companion-config`。新增 Fashion Town 五步导航并高亮第 3 步。明确写出伙伴只负责鼓励、非答案提示和思维引导，不改变正确答案。

确认后保存 confirmed companion；`Start` 保留 boutique 参数进入 `/nuannuan/map`。未确认、加载失败、空列表、重复点击和返回恢复都有页面内状态。不要把图中 Lumi 等占位名替换项目真实伙伴。

完成后执行 `QA_CHECKLIST.md`。
