# Cursor 调用说明（可直接复制）

你现在要读取 `config/asset-index.json` 和 `config/layer-system.json`。

目标：
1. 先按 `role` 和 `gender` 读取角色素材。
2. 读取对应 `sheet` 路径作为角色设定参考图。
3. 统一遵守画布尺寸 `1024 x 1536`。
4. 统一遵守锚点：`foot_center = (512, 1216)`。
5. 如果要做后续换装或拆分，固定图层顺序为：
   `body -> outfit -> hairBack -> face -> eyes -> hairFront -> accessory`
6. 当前包内素材状态为 `reference_sheet`，即：
   - 适合作为前端界面展示、角色风格参考、二次拆分依据
   - 不等于已经切好的透明独立图层
7. 若后续需要运行时叠戴，请先把单张 `sheet.png` 进一步拆为独立透明 PNG。