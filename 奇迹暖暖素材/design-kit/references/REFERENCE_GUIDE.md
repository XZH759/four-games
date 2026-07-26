# 多页面视觉参考指南

## 使用边界

这些参考图用于描述期望的完成度与视觉语法。实现时必须保留项目自身的信息架构、数据、文案和业务规则，并重新构建可响应、可交互、可维护的组件。

禁止：

- 把整张参考图作为页面背景，再覆盖透明点击区域；
- 从参考图中裁切角色、服装、徽章、图标或装饰作为正式素材；
- 逐像素照搬布局、具体文案、商品、人物造型或品牌识别元素；
- 为了接近截图而固定整个页面宽高，导致移动端或桌面端溢出；
- 在缺少正式人物素材时用 CSS 或简单 SVG 冒充最终立绘。

应当提取：

- 奶油白、雾紫、粉金、浅蓝组成的低饱和色阶；
- 半透明奶油面板、双层细描边、金色高光和克制的星光；
- 清晰的标题区、主内容区、辅助状态区和底部操作区；
- 紫色次级按钮、粉色主按钮、金色奖励/特殊操作按钮的层级；
- 选中、完成、锁定、可领取和进行中状态的统一视觉编码；
- 轻量淡入、描边高亮、勾选章缩放和奖励光晕等低延迟反馈。

## 共用设计系统

所有页面应复用同一套设计变量与基础组件，而不是每页单独“画一张海报”。可按现有技术栈建立或映射：

```text
GamePageShell
OrnamentalFrame
PageTitle
CurrencyBar
CreamPanel
SegmentedTabs
ItemCard / RewardCard
ProgressTrack
PrimaryActionButton
SecondaryActionButton
StatusBadge
```

优先复用 `design-kit/styles/game-theme.css`、`design-kit/styles/avatar-motion.css` 和 `design-kit/assets/ui/`，并根据现有项目组件体系调整名称。

## 页面与参考图映射

| 参考文件 | 对应页面 | 重点提取 | 不应照搬 |
|---|---|---|---|
| `interfaces/01_initial-avatar/reference.png` | 初始形象创建 | 中央人物舞台、左右设置区、名称输入、双主按钮 | 人物、服装缩略图、标题装饰的精确造型 |
| `interfaces/02_companion-selection/reference.png` | 学习伙伴选择 | 左侧候选列表、右侧大详情、队伍槽、确认操作 | 伙伴人物和职业名称 |
| `interfaces/03_task-list/reference.png` | 学习任务 | 总进度、分组标签、任务行、奖励预览、完成/锁定状态 | 奖励图标和固定任务文案 |
| `interfaces/04_level-map/reference.png` | 关卡地图 | 区域分色、连线路径、节点状态、侧边进度与奖励 | 地形、城堡、具体节点数量与位置 |
| `interfaces/05_knowledge-gallery/reference.png` | AI 知识图鉴 | 书册式内容区、主题卡、解锁状态、收藏进度 | 具体插画、章节名称和书本装饰细节 |
| `interfaces/06_shop-collection/reference.png` | 商城/套装收集 | 角色预览、分类标签、商品网格、套装收集进度 | 商品人物、服装、价格和背景插画 |
| `interfaces/07_featured-outfits/reference.png` | 横版服饰陈列 | 多列商品卡、标签、价格、统一底线和购买按钮 | 具体人物、套装名称和限时活动文案 |
| `interfaces/08_blind-box/reference.png` | 抽卡盲盒 | 开启流程、翻牌选择、结果卡、历史记录、保底进度 | 礼盒、卡背和奖励物的具体绘制 |
| `interfaces/09_achievements/reference.png` | 徽章成就 | 分类导航、核心里程碑、近期达成、阶段奖励轨道 | 徽章图案、角色头像和英文命名 |
| `interfaces/10_chapter-complete/reference.png` | 章节结算 | 大标题、完成状态、三栏奖励、下一步主操作 | 奖励物、人物插画和精确排版尺寸 |

## 响应式解释

参考图同时包含横版与竖版构图，只代表页面信息关系：

- 宽屏：允许左右分栏、横向商品网格和固定辅助侧栏；
- 平板：减少同时显示的卡片列数，保留主要信息层级；
- 手机：改为单列或上下分区，底部主操作可吸底，但不能遮挡内容；
- 人物、卡片和装饰只能等比缩放，不得纵向或横向拉伸；
- 装饰星光、光晕和边角纹样在小屏上应减少，而不是压缩正文。

## Cursor 每页完成后应输出

1. 参考图与实际路由/组件的映射。
2. 复用的共用组件和设计变量。
3. 页面独有的布局规则。
4. 桌面、平板、手机截图。
5. 尚未替换的占位素材与原因。
6. 与参考图不同但为适配真实业务而保留的设计决定。
