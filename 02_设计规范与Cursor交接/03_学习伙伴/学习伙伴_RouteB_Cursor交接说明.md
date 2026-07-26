# Cursor 输入包：学习伙伴选择页 Route B

## 目标
保留现有双栏/桌面信息架构，只替换角色资产和视觉 token。六名角色必须引用本包中的 PNG，禁止使用纸娃娃组件、SVG 简笔人物或 CSS 绘制人物。

## 资产位置
将本包 `public/companions/` 整体复制到项目的 `public/companions/`。
将 `src/data/companions.ts` 与 `src/styles/companion-tokens.css` 复制到同名目录。

## 硬约束
1. 所有伙伴图像只允许使用 `<img src={profile.assets.card}>` 或 `<img src={profile.assets.hero}>`。
2. 禁止复用建角页默认 avatar；禁止为六张卡重复同一人物。
3. 名字只显示英文：BELLA / AVA / EILEEN / FIONA / GLADYS / DIANA。
4. 技能、特质和说明使用中文。
5. 页面保持浅薰衣草玻璃风，不切换成深色电竞/赛博朋克底。
6. 角色图使用 `object-fit: contain`，不得拉伸或裁掉头部、机甲耳件和背部推进器。
7. 选中态优先使用 `card-selected.png`，也可叠加 `--selected-glow`。
8. 共享边框图使用 `border-image`：`url('/companions/shared/card-frame-9slice.png') 32 fill / 32px / 0 stretch`。

## 一次 commit 的实现任务
- 读取 `/companions/companions.manifest.json` 或导入 `src/data/companions.ts`。
- 左侧渲染 2×3 伙伴卡；点击更新 `selectedCompanionId`。
- 右侧展示所选角色 `hero.png`、英文名字、中文角色定位、台词和技能。
- 卡片内姓名只出现一次；不要把角色名烘焙进新图片。
- 保留“伙伴不会直接告诉答案”的说明。
- 移动端改为横向可滑卡片 + 单列详情；桌面保持双栏。
- `prefers-reduced-motion` 下关闭呼吸光和扫描动画。

## 验收
- 6 张卡的人物外观均不同。
- 选中任意卡，右侧人物、名字、技能同步变化。
- 1920 / 1440 / 390 三分辨率无裁切、无布局跳动。
- DevTools Network 中人物资源均来自 `/companions/`。
- DOM/CSS 中不存在用渐变或 SVG 临摹人物的代码。
