# LevelUp Build Spec for Cursor — v2.0
# 游戏化 AI 素养测评平台 · Cursor 构建规格
# v2.0 变更：条件体系对齐文献三分类；游戏性档位②入规；会前/会后问卷；
#           demo 入口；日志扩容；Vercel 部署段。v1.0 作废。

> **使用方法（操作者读，Cursor 不需要）**
> 存为项目根 `SPEC.md`；按 §12 分六次对话喂 Cursor，每阶段 git commit；
> `[DECISION-RW]` 处按默认实现、待睿威确认；验收清单在 §13。

---

## 1. Project overview

Web-based research instrument delivering an identical AI-literacy assessment
under multiple interface conditions, measuring whether and which gamified
delivery increases middle-school students' completion and persistence.

**Research instrument, not a product.** Priorities: (1) behavioral-log
integrity, (2) identical item experience across conditions except the
manipulated shell, (3) game-feel for 12–15 year olds, (4) everything else.

**Stack:** Vite + React + TypeScript + Supabase. Static deploy on Vercel.
Must work at 360px width on school Chromebooks/tablets/phones.

## 2. Hard research constraints

Four red lines override any UX instinct:

1. **Reward progress, never correctness or speed.** All celebrations,
   points, unlocks trigger on submission counts only. No correctness
   feedback anywhere in the student UI.
2. **No timers.** Nothing counts down or displays elapsed time. RT logged
   silently.
3. **No failure states.** Progress never decreases; no lives, no retry
   gates, no breakable streaks (cumulative milestones only — "已连续探索"
   类可断连击禁止，改为"累计答题 N 题"里程碑). Any reload resumes exactly.
4. **No leaderboards / social comparison** in v2 scope (race shell kept in
   `appendix/` behind `race_flag=false`, excluded from bundle when off).

**Gamefulness dial = Position ② (Haiman precedent):** item stem, options,
input semantics, information content, and order are byte-identical across
conditions; game arms MAY add **non-informational ambient chrome inside the
item page** (backgrounds, companion character, submit juice) that never
varies with the response given. `[DECISION-RW: 档位②默认执行]`

**Answer keys never reach the client** (separate service-role table).

## 3. Conditions — aligned to the literature taxonomy

Justification hierarchy per advisor: literature classification (strongest)
→ children's co-design preferences (蛋仔派对/第五人格机制溯源) → researcher
choice (avoid). The three game arms map 1:1 to the literature's three
implementation families, each manipulating ONE mechanism family:

| key | family | shell & item-page chrome | excludes |
|---|---|---|---|
| `plain` | control | plain pages; text position "第 8 / 15 题" (this baseline indicator appears in ALL arms) | everything |
| `progress` | progress-based | circuit zone map, per-level progress ring, node unlock animation; item-page chrome: submit spark travels into the ring | no points, no character, no story |
| `reward` | reward-based | points counter (+1 per submission), deterministic accessory unlocks every 2 items (robot wardrobe), milestone badges at level bounds; item-page chrome: point pop + "再答 2 题解锁…" chip | no map, no story; linear flow |
| `narrative` | narrative/challenge-based | companion robot on every page with scripted encouragement bubbles at fixed indices (correctness-blind), zone mission cards ("信号塔的接收器出故障了…"), chapter transitions, finale power-on ceremony | no points, no map |

`assessment_config.json` field `conditions_enabled` controls arms; build
with all four, enable per study. `[DECISION-RW: 上线臂数与顺序]`

**Mechanism-source comments** (ship as code comments for the paper's
Method): progress ← 蛋仔关卡地图+第五人格密码机度盘(去惩罚)；reward ←
蛋仔装扮收集(盲盒→确定性)；narrative ← 蛋仔角色陪伴+任务框架。

## 4. Item bank & data model

Item bank is data (`items.seed.json`), tolerant of TBA gaps, upsert by id.

### 4.1 Item schema — unchanged from v1 except:
- `domain` values now come from `domains` config array, NOT a hardcoded
  enum. **Known discrepancy:** the bank's 4th section says "Designing AI"
  (D-1~D-5) while the advisor's framework says "Shape AI"（个人/行业/政策
  如何塑造 AI）. Store the bank's codes verbatim; display labels come from
  config so a rename is zero-code. `[DECISION-RW: 第四域对外标签用
  Designing 还是 Shape]`
- Markdown stems with `{ok}`/`{no}` icon tokens, tables, images; multi-
  prompt open items; no `correct` field client-side.

### 4.2 Config additions
```jsonc
{
  "domains": [
    {"code":"engaging","label_zh":"信号塔区","label_en":"Signal Tower"},
    {"code":"creating","label_zh":"创作工坊","label_en":"Creation Workshop"},
    {"code":"managing","label_zh":"指挥室","label_en":"Command Room"},
    {"code":"designing","label_zh":"核心实验室","label_en":"Core Lab"}
  ],
  "items_per_level": 3,
  "conditions_enabled": ["plain","progress"],
  "pre_survey_enabled": true,
  "post_survey_enabled": true,
  "race_flag": false
}
```

### 4.3 Database — v1 tables plus:
```sql
-- events.event_type adds: revise | hint | survey_submit | zone_enter
-- events.response for submit adds: {"clicks": n, "revisions": n}
-- pre_survey: session_id fk, age_band text, gender text,
--   game_exp int, ai_exp int          -- 1–5 self-report
-- post_survey: session_id fk, enjoyment int, willing_again int,
--   frustration int                    -- 1–5, three items max
```
`revise` fires when a selected option changes before submit. Click count
aggregates pointerdown within the item card. `hint` reserved — **no hints
exist in v2** `[DECISION-RW: 是否加提示功能，默认无]`.

## 5. Flows

**Production** `/a/:classCode`: consent → roster code → **pre-survey
(4 questions: 年龄段/性别/游戏经验/AI 经验, one screen, skippable)** →
condition assignment (seeded hash, uniform) → item loop → **post-survey
(3 questions max)** → identical finale screen. Resume anywhere; heartbeat
15 s; blur/focus/quit(sendBeacon).
`[DECISION-RW: pre-survey 默认开，若嫌摩擦可 config 关]`

**Demo** `/demo` (advisor preview, per meeting priority 1): homepage with
four condition entry buttons + item-preview index. Excluded from
production analytics via `sessions.is_demo=true`; banner "演示模式，数据
不计入研究".

**Item loop invariants:** choice items need a selection to submit;
open-ended items show "跳过此题" (logs `skip`); multi-prompt open items
autosave per textarea on blur.

## 6. Visual system & juice budget

Palette/mascot per v1 (active.ai derivative: navy #262B45, cyan #4ED6E8,
cobalt #4373B8, off-white; original monitor robot with accessory slots).

**Juice rules (all arms that include them):**
- Submit juice ≤ 600 ms, skippable-by-tap, identical for right/wrong.
- Level/zone transitions ≤ 10 s, skippable, no reading required.
- Sound OFF by default (classroom), single toggle.
- Companion bubbles are scripted by item index (e.g., after items 3, 7,
  11), never by response content.
- Red-line microcopy ships verbatim where relevant: 「提交就能点亮进度，
  对错都不扣分」「答错不倒退、无惩罚」.
- Map supports free pan to preview locked zones (curiosity pull), no
  interaction cost.

## 7. i18n
`en` + `zh-TW`, fixed per class via config; UI strings centralized;
log locale. Bank text verbatim — typos go back to the bank owner, never
patched in code.

## 8. Admin
`/admin` (shared password env): per-class allocation counts, items-
attempted distribution, completion counts, CSV export (sessions, events,
pre/post surveys). No charts.

## 9. Non-goals
Student accounts, AI grading, real-time multiplayer, VR/AR/Minecraft,
push notifications, analytics SDKs, >2 locales, hints (v2).

## 10. Engineering conventions
TS strict; zod-validate seeds; ItemRenderer takes no condition prop —
arms inject chrome via a `ShellChrome` slot around it; components ≤200
lines; Playwright for §13; feature flags in config.

## 11. Deployment (per meeting priority 5)
GitHub repo → Vercel import → framework preset Vite → env vars
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` → deploy → verify `/demo`
on phone. Supabase RLS as §4; anon key is public by design, keys table
service-role only. Document the public URL in README for advisor testing.

## 12. Phased Cursor prompts（六阶段）
1. **Data core**: schema + seeds + ItemRenderer(all types incl. tokens,
   tables, multi-prompt) + `/preview/:itemId`.
2. **Plain end-to-end**: consent→roster→pre-survey→loop→post-survey→
   finale, full logging incl. revise/clicks, resume, heartbeat.
3. **Progress shell** (+item-page spark chrome).
4. **Reward shell** (points, wardrobe, milestones) & **Narrative shell**
   (companion, missions, chapters, finale ceremony).
5. **Demo homepage + Admin + CSV**.
6. **Hardening**: §13 Playwright run, 360px pass, offline event queue,
   40-session load test, Vercel production deploy.

Per phase: "Read SPEC.md. Implement Phase N only."

## 13. Acceptance checklist
1. Production bundle: zero answer-key material; item payloads keyless.
2. Same roster code → same session/condition/position every time.
3. Cross-condition snapshot: identical stems/options/order/input widgets.
4. No timer/score-by-correctness/streak-break anywhere (DOM audit).
5. Wrong vs right answers → byte-identical juice (verify against key file).
6. Kill tab mid-item → resume event + exact position.
7. blur/focus/heartbeat pattern correct when tab hidden.
8. `revise` fires on option change; submit payload carries clicks+revisions.
9. Pre/post surveys skippable, logged, ≤1 screen each.
10. `/demo` sessions flagged `is_demo`, excluded from admin counts.
11. 360px: all item types render, tables become h-scroll cards.
12. `race_flag=false` → race code tree-shaken from bundle.
13. Vercel URL loads all four demo conditions on a phone.
14. Juice timing: submit ≤600 ms, transitions ≤10 s, all skippable.

---
*v2.0 依据：第二次会议纪要（文献三分类=最强机制依据；四条件示例；行为
指标扩容；主观量表；背景变量；demo 主页；Vercel 部署）＋ 游戏性档位②
（Haiman 先例）＋《题库游戏化升级设计》§0–§5。*
