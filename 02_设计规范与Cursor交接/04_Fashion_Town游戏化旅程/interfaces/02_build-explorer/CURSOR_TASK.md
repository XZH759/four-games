# Step 2：Build Your Explorer

视觉参考：`reference.png`。只处理 `/nuannuan/login?from=town&boutique=:id` 及其现有角色配置。

## 简要指令

在现有登录/角色创建页上实现 Fashion Town 模式：左侧显示当前 boutique、四种 Fashion role 路径；中央使用项目统一分层角色渲染器，提供 Hair、Top/Outfit、Skirt（若已有独立层）、Shoes（若已有独立层）、Accessory、Palette 的真实可用选项；右侧显示推荐伙伴说明和该路线可设计模块。底部五步导航高亮第 2 步，主按钮为 `Start Style Challenge`，实际下一步仍先进入伙伴选择。

新增 `fashionRole` 展示字段，不覆盖原登录/后端 role。图中 Artist/Analyst 是 Fashion role；不存在独立服装层时必须保留整套 outfit 映射并标记素材缺口，不伪造自由混搭。随机造型、旋转、保存和返回都复用原逻辑；保存成功后保留 `from=town&boutique` 跳到 `/nuannuan/partner`。

完成后执行 `QA_CHECKLIST.md`。
