# 角色分层素材：Cursor / 前端接入规范

## 1. 本包内容

本接入包已经包含：

- `public/character-assets/`：当前可运行的男女分层 PNG 素材与 JSON 索引；
- `src/components/LayeredCharacter.tsx`：按固定层序叠加角色；
- `src/components/CharacterCreator.tsx`：最小可运行的角色创建示例；
- `src/utils/`：读取、随机生成、预加载、导出合成 PNG；
- `src/styles/character-creator.css`：响应式三栏样式；
- `scripts/validate-character-assets.mjs`：零依赖素材检查脚本；
- `references/`：已确认的首页、女性母版、男性母版设计参考图；
- `CURSOR_PROMPT.md`：可直接粘贴给 Cursor 的实现指令。

## 2. 素材契约

| 项目 | 固定值 |
|---|---|
| 画布 | 1024 × 1536 |
| 宽高比 | 2:3 |
| 锚点 | 脚底中心 `(512, 1216)` |
| 层序 | `body → outfit → hairBack → face → eyes → hairFront → accessory` |
| 必选层 | body、face、eyes |
| 可选层 | outfit、hairBack、hairFront、accessory |
| 运行时首选格式 | PNG |

所有部件都是整张透明画布。前端叠加时，七层图片必须占据同一个容器的同一坐标，不需要也不允许逐层移动。

> 注意：当前目录中的运行时素材来自此前标准化原型包；`references/female_master_sheet_reference.png` 和 `references/male_master_sheet_reference.png` 是新一轮独立母版的设计参考，不是可直接叠加的运行时部件。待从母版正式导出独立 SVG/PNG 后，按相同命名和 JSON 契约替换即可，前端代码无需改动。

## 3. 快速接入

将本包内容合并到 React + TypeScript 项目根目录。然后在页面中使用：

```tsx
import { CharacterCreator } from "./components/CharacterCreator";

export default function App() {
  return <CharacterCreator />;
}
```

素材 URL 的根路径固定为：

```text
/character-assets/
```

开发环境和 Vercel 部署时，`public/character-assets` 会原样映射到该 URL。

## 4. 核心渲染规则

角色容器：

```css
.layered-character {
  position: relative;
  aspect-ratio: 2 / 3;
}
```

每层图片：

```css
.layered-character__layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

渲染顺序必须读取或严格遵守：

```ts
const layerOrder = [
  "body",
  "outfit",
  "hairBack",
  "face",
  "eyes",
  "hairFront",
  "accessory",
] as const;
```

不得按文件加载完成顺序追加 DOM；否则网络较慢时会造成层级错误。应先按层序生成固定 DOM，图片加载只改变内容。

## 5. JSON 文件用途

### `asset_index.json`

运行时唯一素材总表。每个素材包含：

- `asset_id`：业务状态保存的唯一 ID；
- `relative_path`：相对 `/character-assets/` 的文件路径；
- `gender`：female 或 male；
- `layer`：所属图层；
- `z_index`：固定层级；
- `canvas_width / canvas_height`：必须为 1024 / 1536；
- `anchor_x / anchor_y`：必须为 512 / 1216。

### `sample_presets.json`

当前可直接加载的完整角色组合。预设必须包含同一性别的素材。

### `frontend_asset_map.json`

已按 `gender → layer → assets` 分组，适合直接生成选择器，但建议业务逻辑仍以 `asset_index.json` 为单一事实来源。

### `career-presets.template.json`

实验室研究员、程序员、工程师预设的字段模板。里面带有尚未导出的职业素材 ID，因此目前不能直接加载。新职业素材导出后，将这些 ID 加入 `asset_index.json` 再启用。

## 6. 推荐状态结构

```ts
interface SavedCharacter {
  schemaVersion: 1;
  gender: "female" | "male";
  name: string;
  selection: {
    body: string;
    outfit: string | null;
    hairBack: string | null;
    face: string;
    eyes: string;
    hairFront: string | null;
    accessory: string | null;
  };
}
```

后端只保存 `asset_id`，不要保存完整图片 URL。这样以后替换 CDN、格式或目录时不需要迁移用户数据。

## 7. 交互规则

### 外观定制

建议将发型作为一对关联操作：

- 选择发型时同时修改 `hairBack` 与 `hairFront`；
- 若未来允许自由混搭，可在素材元数据中增加 `hair_family_id`；
- 当前原型可分别切换两层，但正式产品建议成对选择，避免前后发不匹配。

### 形象定制

- 女性和男性只控制 `gender`；
- 切换性别后必须重建完整选择，不能保留另一性别的 asset ID；
- 职业预设只是一组完整 selection，不应改变底层渲染器。

### 随机生成

- 仅从当前性别中抽取；
- body、face、eyes 必须有值；
- accessory 可按概率为空；
- 若加入职业筛选，先按 `role` 过滤候选，再随机。

## 8. 新素材加入流程

1. 设计端以 1024×1536、脚底中心 `(512,1216)` 导出透明文件；
2. 按命名规则放入对应目录；
3. 向 `asset_index.json` 增加一条记录；
4. 如属于职业套装，补充 `role` 标签；
5. 如有兼容限制，补充 `compatible_with` 或 `excludes`；
6. 运行检查：

```bash
node scripts/validate-character-assets.mjs public/character-assets
```

7. 在浏览器逐一测试组合和随机生成。

推荐命名：

```text
F_BODY_001.png
F_OUTFIT_001.png
F_HAIRBACK_001.png
F_FACE_001.png
F_EYES_001.png
F_HAIRFRONT_001.png
F_ACCESSORY_001.png
```

职业素材可扩展为：

```text
F_OUTFIT_RESEARCHER_001.png
M_OUTFIT_PROGRAMMER_001.png
F_ACCESSORY_ENGINEER_001.png
```

## 9. 性能要求

- 角色编辑时使用 PNG；真正的原生 SVG 部件完成后可切换 SVG；
- 首屏只预加载当前组合；用户点击某分类时再预加载该分类候选；
- 不要一次预加载所有角色素材；
- 静态文件设置长期缓存，文件更新时使用新文件名或版本号；
- 角色层最多七张，避免给每层使用高成本 CSS filter；
- 动画仅作用于外层角色容器，不要分别动画七个图层。

## 10. 重要限制

当前 `programmatic_standardized_assets_1024x1536.zip` 中的素材可用于功能原型和前端联调，但其中部分发型拆分及饰品定位属于早期近似版本。最新生成的女性/男性母版参考图已经按独立部件思路设计，但仍需设计端或后续流程将母版中的每个部件正式导出为原生透明 SVG/PNG。完成替换后，本接入规范、组件与保存结构无需改变。
