# Fashion Town 数据与路由契约

## 1. 真实入口与顺序

| 状态 | 路由 | 读取 | 写入 | 下一步 |
|---|---|---|---|---|
| 选店 | `/nuannuan/town` | `BOUTIQUES`、Fashion 状态、钱包 | `nn_fashion_active_boutique` | 角色创建或伙伴选择 |
| 建立探索者 | `/nuannuan/login?from=town&boutique=:id` | avatar/login 草稿 | avatar 最终配置、Fashion role | 伙伴选择 |
| 选择伙伴 | `/nuannuan/partner?from=town&boutique=:id` | companion 配置、推荐关系 | confirmed companion | 精品店地图 |
| 关卡地图 | `/nuannuan/map?boutique=:id` | map progress、当前店、伙伴 | 当前关卡 | `/collect?level=:n&boutique=:id` |
| 答题 | `/collect?level=:n&boutique=:id` | 真实题目、题序、伙伴、店铺 | 答案日志、模块解锁 | 本页结算或地图 |
| 结算 | `/collect` 的 `settle` 状态 | `sessionDesigned`、奖励 | 已领取标记 | 继续挑战或衣柜 |
| 装配 | `/nuannuan/wardrobe` | 已解锁模块、avatar、伙伴羁绊 | saved look、active look | 返回小镇或展示 |

所有跳转必须保留有效 `boutique`；刷新后允许从 `nn_fashion_active_boutique` 恢复。无效参数回退到第一个可用店铺并给出页面内提示。

## 2. 角色字段兼容

登录系统的原角色值可能只有 `researcher/programmer/engineer`。Fashion Town 不得覆盖或改名这些后端/登录字段。新增展示层字段：

```js
fashionRole: "researcher" | "artist" | "engineer" | "analyst"
```

建议默认展示映射：

| 精品店 | Fashion role | 当前可用推荐伙伴 | 模块方向 |
|---|---|---|---|
| Style Lab | researcher | eileen | hairpin、top、accessory、palette |
| Dream Atelier | artist | fiona | dress、tops、skirt、fabric |
| Tech Accessory Garage | engineer | gladys | shoes、gadget、glasses、tech |
| Pattern House | analyst | diana | coat、pattern、bag、wardrobe |

推荐只高亮，不强制锁死。玩家换伙伴时，题目答案和评分规则不得改变；伙伴只改变鼓励语、提示风格、羁绊反馈和可选的非答案型加成。

## 3. 在原 key 上兼容扩展

保留现有 `nn_fashion_town_v1` 和 `nn_fashion_active_boutique`，在 `loadFashionState()` 内做默认值合并与 schema 迁移。不要另造互不相通的状态。

```json
{
  "schemaVersion": 2,
  "profile": {
    "fashionRole": "artist",
    "look": {
      "hair": "F_HAIRFRONT_001",
      "top": null,
      "skirt": null,
      "shoes": null,
      "accessory": "F_ACCESSORY_001",
      "palette": "soft-pastel"
    }
  },
  "boutiques": {
    "dream-atelier": {
      "unlocked": ["dress"],
      "completedChallengeIds": ["question-id"],
      "stars": 1
    }
  },
  "inventory": [
    {
      "moduleId": "dream-atelier:dress:01",
      "slot": "dress",
      "boutiqueId": "dream-atelier",
      "sourceQuestionId": "question-id",
      "unlockedAt": 0
    }
  ],
  "sessionDesigned": [],
  "companionBond": {
    "fiona": { "xp": 0, "level": 1 }
  },
  "savedLooks": [],
  "activeLookId": null,
  "sharedOutfit": false
}
```

旧数据只有 `boutiques[id].unlocked`、`sessionDesigned` 和 `sharedOutfit` 时必须继续可读。迁移只能补字段，不能清空玩家进度。

## 4. 正确答题到服装模块

一次提交的顺序固定：

1. 使用现有 `ItemRenderer.collect()` 校验输入。
2. 用真实题目答案判断 `correct`。
3. 先按现有方式记录答题日志。
4. 仅当 `correct === true` 且 `challengeId` 尚未发奖时解锁一个模块。
5. 同一 `questionId + boutiqueId` 重试、刷新或回退不能重复解锁。
6. 更新 `sessionDesigned`、inventory、店铺进度和伙伴 bond。
7. 更新右侧设计板；当前阶段完成后进入 Design Complete。

现有 `tryUnlockModule()` 的“最后一件完成”判断要基于当前内存 `state` 计算，再一次性保存；不要在保存前调用会重新读取旧 localStorage 的 `allBoutiquesComplete()`。

错误答案：保存答案/日志并显示解释或思路提示，但不新增库存、不增加奖励。伙伴提示不能泄露选项编号或正确答案。

## 5. 结算与保存幂等

- `sessionDesigned` 只记录本次新增模块；打开结算页只读取，不再次发放。
- 结算刷新后仍显示同一批结果，但“已加入收藏”状态明确。
- `Save Look` 先创建草稿预览，确认成功后才更新 `savedLooks` 和 `activeLookId`。
- `Show in Park` 只有项目存在真实展示入口时才启用；否则显示“待接入”说明，不能假跳转或伪成功。
- `Style Identity` 分数必须从穿戴模块标签/稀有度/完整度确定性计算；参考图的 98,765 不能硬编码。

## 6. 数据来源优先级

1. 项目真实配置与已有保存函数。
2. 本地兼容状态（离线/演示）。
3. 明确标记的占位数据。

不得凭空新增未在项目中存在的 API 路径。若现有 API/日志失败，保留本地进度并显示非阻断提示；不得让一次网络失败造成重复奖励。
