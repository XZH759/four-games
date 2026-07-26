# 阶段 2：建立高清分层人物架构

根据上一阶段的审计结果开始修改项目，先建立人物资源架构，不追求一次完成全部视觉细节。

请完成：
1. 创建统一 `AvatarConfig`、`AvatarAssetSet` 和资源清单。
2. 创建 `AvatarRenderer`，按照固定顺序渲染透明图层。
3. 所有图层使用同一画布尺寸和同一脚底锚点。
4. 中央角色、体型卡、套装卡全部复用 AvatarRenderer。
5. 支持 hairStyle、hairColor、skinTone、eyeStyle、faceShape、bodyType、outfitId、accessoryId。
6. 资源加载失败时显示优雅占位，不让页面崩溃。
7. 预加载当前选择以及前后两个可能选项。
8. 切换时使用旧图层保持显示，新图层加载完成后再交叉淡化，避免白闪。
9. 保留 localStorage 恢复逻辑。
10. 在代码中标记哪些资源是 `prototype-placeholder`。

图层顺序：
backAccessory → hairBack → bodyBase → legs → shoes → outfitBack → outfitMain → outfitFront → faceBase → eyes → eyebrows → mouth → blush → hairSide → hairFront → headAccessory → handAccessory → highlights。

禁止：
- `scaleX()` 模拟体型；
- `object-fit: cover` 裁人物；
- 切换套装时重置脸和头发；
- 每张卡片使用独立的不同人物图片。
