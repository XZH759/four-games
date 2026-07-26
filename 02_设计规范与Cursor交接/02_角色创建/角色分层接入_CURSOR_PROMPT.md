# 直接粘贴给 Cursor 的任务指令

请在当前前端项目中接入 `public/character-assets` 角色分层素材，并完成“初始形象创建”页面。

## 不可更改的素材契约

- 画布：`1024 × 1536`
- 角色锚点：脚底中心 `(512, 1216)`
- 固定层序：`body → outfit → hairBack → face → eyes → hairFront → accessory`
- 每个素材文件本身已经是完整透明画布，因此所有图层必须使用相同的 `inset: 0; width: 100%; height: 100%`，禁止为单个图层单独调整 `top/left/scale/translate`。
- 角色预览容器必须保持 `aspect-ratio: 2 / 3`。
- 只能组合相同性别的素材。
- `body`、`face`、`eyes` 为必选图层；`accessory` 可以为空。

## 页面结构

页面仅保留三个视觉区域：

1. 左侧“外观定制”：发型、眼睛、脸型、配饰，可额外包含服装；
2. 中间角色预览：完整叠层角色、角色名称、随机生成、确认进入；
3. 右侧“形象定制”：女性、男性，以及后续实验室研究员、程序员、工程师预设。

不要出现无用途的空面板、孤立模块或大面积突兀留白。桌面端使用三栏布局；窄屏时角色预览优先置顶，其他模块向下堆叠。

## 数据接入

- 读取 `/character-assets/asset_index.json`；
- 读取 `/character-assets/sample_presets.json`；
- 使用 `asset_id` 存储角色选择，不要在业务状态中存储完整 URL；
- URL 由 `relative_path` 与 `/character-assets/` 拼接；
- 使用仓库内 `src/components/LayeredCharacter.tsx` 作为基础渲染组件；
- 切换素材前预加载下一张图片，避免闪白；
- 随机生成只能从当前 gender 对应的候选素材中选择；
- 切换 gender 时重置成该 gender 的默认完整组合。

## 状态保存格式

```json
{
  "schemaVersion": 1,
  "gender": "female",
  "name": "绮罗",
  "selection": {
    "body": "F_BODY_001",
    "outfit": "F_OUTFIT_001",
    "hairBack": "F_HAIRBACK_001",
    "face": "F_FACE_001",
    "eyes": "F_EYES_001",
    "hairFront": "F_HAIRFRONT_001",
    "accessory": "F_ACCESSORY_001"
  }
}
```

## 验收标准

- 图层顺序完全正确；
- 切换任意素材时角色脚底位置不跳动；
- 男女素材不混用；
- 页面缩放后角色比例不变；
- 所有图片请求无 404；
- 初次进入显示完整角色，不出现缺 body / face / eyes；
- 随机生成连续执行不会报错；
- 执行 `node scripts/validate-character-assets.mjs public/character-assets` 能通过；
- 不将参考图 `references/*.png` 当作运行时分层素材。
