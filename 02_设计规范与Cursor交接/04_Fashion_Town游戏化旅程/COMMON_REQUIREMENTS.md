# Fashion Town 公共实现要求

## 1. 产品与工程边界

- 基于现有 `nuannuan/`、`collect/`、`js/nuannuan/` 页面和状态继续实现。
- 先确认目标路由、入口文件、数据来源和修改范围，再动代码。
- 只修改当前环节以及确有必要的共用 Fashion Town 文件；保留登录、答题、日志、进度和返回大厅逻辑。
- 不得把参考图当整页背景；界面必须由真实 DOM、可交互控件和项目素材组合而成。
- 不使用 emoji 充当主图标或正式人物/服装素材。
- 伙伴、角色、题目和奖励必须由配置或状态驱动，不能把参考图文案硬编码成真实数据。

## 2. 统一视觉系统

优先复用 `奇迹暖暖素材/design-kit/styles/game-theme.css`，必要时把变量整理为 Fashion Town 共用 CSS，不要每页复制一套。

```css
:root {
  --ft-cream-50: #fffaf3;
  --ft-cream-100: #f8efdf;
  --ft-ink: #55382f;
  --ft-muted: #806b63;
  --ft-lavender-100: #eee8fb;
  --ft-lavender-500: #8b6fc3;
  --ft-purple: #8f63c7;
  --ft-rose: #e97aa4;
  --ft-gold: #c9a45c;
  --ft-teal: #79bdb6;
  --ft-success: #69b86f;
  --ft-danger: #bd5f69;
  --ft-panel: rgba(255, 250, 243, .91);
  --ft-border: rgba(201, 164, 92, .58);
  --ft-shadow: 0 14px 38px rgba(76, 56, 103, .14);
  --ft-radius-lg: 28px;
  --ft-radius-md: 18px;
  --ft-ease: cubic-bezier(.22, .61, .36, 1);
}
```

- 品牌：`Fredoka, Noto Sans SC, sans-serif`。
- 英文/中文大标题：`Noto Serif SC, Georgia, serif`。
- 正文与按钮：`Nunito, Noto Sans SC, sans-serif`。
- 主操作用紫色；答题提交与当前选择用粉色；奖励、完成和稀有状态用金色；成功用绿色。
- 面板使用奶油白半透明底、细金边、双层内框和轻柔阴影；装饰不得压住正文。
- 卡片 hover 仅上移 1–2px；不能缩放造成布局跳动。

## 3. 固定页面骨架

五个主页面共用以下层级：

1. 顶栏：返回、AI World Park 品牌、Fashion Town 面包屑、语言、玩家与货币。
2. 页面标题：主标题 + 一句当前任务说明。
3. 主交互区：桌面三栏或“侧栏 + 主舞台 + 状态栏”。
4. 主/次操作：每屏只能有一个最强主按钮。
5. 旅程导航：五步状态一致，完成显示勾选，当前步骤同时用图标、边框和文字标记。

参考图为 1448×1086 的 4:3 视觉稿。实现不能锁死宽高：

- `≥1200px`：保持三栏和底部五步导航。
- `768–1199px`：压缩侧栏，保证中央任务区优先。
- `<768px`：按“标题 → 当前任务 → 主交互 → 辅助信息 → 主按钮 → 旅程导航”重排；旅程导航可横向滚动。
- 最少验证 `1440×900`、`1024×768`、`390×844`。

## 4. 交互与状态

- 所有选择卡使用真实 `button` 或可访问单选控件；选中状态设置 `aria-pressed` 或 `aria-selected`。
- 覆盖默认、hover、active、focus-visible、selected、completed、locked、disabled、loading、empty、error。
- 焦点环不能只靠阴影；触控目标不小于 44×44px；正文对比度不低于 4.5:1。
- 异步加载保留旧内容或稳定骨架，不闪白；提交期间禁止重复点击。
- 页面内反馈替代 `alert()`；错误紧邻触发操作显示。
- 动画只使用 opacity 和 transform，单次 140–320ms；庆祝动画不超过 2.4s。
- `prefers-reduced-motion: reduce` 时关闭漂浮、粒子、路径光效和大幅过渡。

## 5. 角色与美术

- 玩家形象必须复用 `assets/nuannuan/avatar-standardized/` 与现有 avatar 配置/分层渲染逻辑。
- 同一角色在创建页、答题页、结算页和衣柜页必须使用同一份保存配置。
- 同一伙伴的卡片、详情、答题陪伴和结算立绘必须来自 `js/nuannuan/companion-config.js` 同一条记录。
- 参考图中不存在于项目的伙伴名和服装只能作为美术方向，不得冒充已接入正式数据。
- 资源缺失时使用有标签的占位卡，并在交付报告列出；不得用 CSS 几何图形伪造最终人物。

## 6. 每次 Cursor 交付必须包含

1. 实际路由与入口文件。
2. 修改/新增文件列表。
3. 复用的状态、组件、设计变量和素材路径。
4. 桌面、平板、手机验证结果或截图。
5. 当前 `QA_CHECKLIST.md` 逐项结果。
6. 剩余素材缺口、控制台错误和下一步。
