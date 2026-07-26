# 范文伴读手册 · 初学者术语与理论中英对照
**A Beginner's Bilingual Companion for Reading the Anchor Paper**

配套阅读对象：Xiao et al. (2026), EAAI-26 ｜ 编写：2026-07-06
定位：伴随原文 PDF 逐节阅读使用；本手册不替代原文，而是扫清阅读障碍。

---

## 0. 使用方法 | How to Use

1. 打开原文 PDF 与本手册分屏对照；
2. 按「第一部分逐节导读」的顺序读原文，遇到生词查「第二部分术语词典」（按类别 + 字母序排列）；
3. 读到理论出场处（导读中已标注）翻「第三部分理论讲义」；
4. 想模仿某类句子时查「第四部分句式模板」；
5. 遇到整段难句：把原句贴给 Claude 逐句讲解——针对性讲解比全文对照翻译更能建立你的英文学术阅读能力。

---

# 第一部分 ｜ 逐节导读 · Section-by-Section Reading Map

> 每节给出：本节功能、阅读重点、涉及术语与理论的索引。内容概述为改写复述（非原文翻译）。

**Abstract（摘要）** —— 功能：全文微缩版。阅读重点：数一数它用几句话分别完成背景、缺口、方案、评估设置、三条结果、意义留白（对照《解剖卡》§2 的十功能单元）。涉及术语：intervention, deployment, auto-grader。

**§1 Introduction** —— 功能：三段漏斗（背景→缺口→本文）。阅读重点：第二段如何用 what/when/how 三分法定义 prompting literacy；第三段 "This work presents..." 声明句与结尾路线图句。涉及理论：active learning、experiential learning（讲义 T4/T5）。

**§2 Related Work** —— 功能：2.1 立缺口、2.2 立理论。阅读重点：2.1 结尾的 "However, ... persists" 缺口句；2.2 开头 "grounded in two foundational learning sciences principles" 与结尾的桥接句。涉及理论：learning-by-doing（T4）、elaborated immediate feedback（T6）。

**§3 Module Overview** —— 功能：说明教什么、怎么练、怎么评。阅读重点：3.1 学习目标的双源推导（教师需求 + AI4K12）；3.2 四步练习循环与缩进展示的场景实例；3.3 自建 rubric 如何挂靠 CLEAR 框架。涉及理论：AI4K12（T2）、CLEAR（T3）、scenario-based assessment（T9）。

**§4 Study 1** —— 功能：主研究。阅读重点：开头一段六要素（时间/规模/地区/形式/IRB/样本量）；三个 RQ 的句式；4.3 的双人编码信度流程；4.4–4.6 每个结果小节都以加粗结论句开头，随后是统计量，再是错误案例定性剖析。涉及术语：ground truth, inter-rater reliability, McNemar, Wilcoxon, Pearson, ceiling effect。涉及理论：Bloom（T8，出现在 4.2 测评设计）、productive struggle（T7，出现在 4.6）。

**§5 Study 2** —— 功能：基于研究一数据的测评迭代。阅读重点：换题型的推理链（MCQ 高层级难命制 → 改判断题与开放题）；5.2 用难度、区分度、α 三指标评估题目质量，并诚实报告 α 低于基准。涉及术语：distractor, item difficulty, discrimination index, Cronbach's alpha。

**§6 Lessons Learned and Future Work** —— 功能：三段式收尾（每段 = 加粗贡献 + 局限 + 未来钩子）。阅读重点：三个钩子（对照研究/更大规模/IRT）正是你们的选题候选。涉及术语：dosage effect, IRT。

**References** —— 阅读重点：观察自引（Xiao/Hou/Tseng 等）与他引在格式上毫无差别——这就是匿名自引的正确形态。

---

# 第二部分 ｜ 专业术语词典（68 词条，中英对照）
**Beginner's Glossary: Terms You Need**

体例：**English term 中文译名** ｜ EN: 一句英文定义 ｜ 中: 初学者解释（含范文实例）

## A. 研究设计与方法 | Research Design & Methods

**research question (RQ) 研究问题**
EN: The specific question a study is designed to answer.
中: 整篇论文围绕回答的具体问题；范文有 RQ1–RQ4，每个结果小节对应回答一个。写论文先定 RQ，再定方法。

**intervention 干预**
EN: The instructional treatment introduced to change learning outcomes.
中: 研究者主动引入、期望改变学习结果的教学处理；范文的干预 = 那个提示词素养练习模块。

**(classroom) deployment 课堂部署**
EN: Running the system/intervention in real classrooms rather than a lab.
中: 把系统放进真实课堂运行（区别于实验室环境）；"authentic classrooms" 强调生态真实性。

**pre-test / post-test 前测 / 后测**
EN: Assessments before and after the intervention to measure change.
中: 干预前后各测一次，差值即学习变化；范文用 6 道选择题做前后测。

**between-subjects / within-subjects design 被试间 / 被试内设计**
EN: Comparing different groups under different conditions vs. the same people across conditions.
中: 被试间 = 不同人接受不同条件（样稿的 EF vs BF 两组）；被试内 = 同一批人经历所有条件（范文的 Q1→Q3 前后比较属于此类逻辑）。

**condition 实验条件**
EN: One version of the treatment participants may receive.
中: 参与者可能被分到的处理版本；对照研究至少两个条件。

**control / comparison condition 对照条件**
EN: The baseline condition against which the treatment is compared.
中: 用来衬托干预效果的基线；范文没有对照条件（这正是它 Future Work 承认的缺口）。

**random assignment 随机分配**
EN: Allocating participants to conditions by chance to balance unknown differences.
中: 用随机方式把人分进条件，抹平未知差异；按班级整群分配叫 cluster assignment（整群分配），推断力弱于个体随机。

**counterbalancing 顺序平衡**
EN: Varying the order of tasks across participants to cancel order effects.
中: 让不同人以不同顺序做任务，抵消"先做的更差/更好"这类顺序效应。

**sample size (n) / valid data 样本量 / 有效数据**
EN: Number of participants; "valid" excludes incomplete or unusable records.
中: n 是分析用的人数；"valid data from 111 students" 意为剔除无效记录后剩 111 人。

**IRB (Institutional Review Board) 伦理审查委员会**
EN: The body that approves research involving human participants.
中: 涉及人的研究须先获其批准；论文里通常一句话交代（"with the local IRB approval"），但没有这句可能直接被拒。Monash 对应机构是 MUHREC。

**informed consent 知情同意**
EN: Participants (or guardians for minors) agree to take part after being told what the study involves.
中: 参与者（未成年人由监护人）在了解研究内容后同意参加；K-12 研究通常经学校收集家长同意。

**ground truth 真值 / 金标准**
EN: The trusted reference answer used to evaluate an automated system.
中: 评判自动系统对错的"标准答案"；范文用两位研究者的人工评分作为评估自动评分器的真值。

**inter-rater reliability (IRR) 评分者间信度**
EN: The degree to which independent coders give the same judgments.
中: 两位编码者独立打分的一致程度；不达标说明评分标准本身模糊，结果不可信。常用 Cohen's κ 衡量。

**coding / codebook 编码 / 编码本**
EN: Systematically labeling qualitative data; the codebook defines each label.
中: 给开放文本（学生反思）贴标签的过程；编码本 = 标签的定义手册，需两人迭代打磨。

**thematic analysis 主题分析**
EN: A qualitative method that identifies recurring themes across textual data.
中: 从文本数据中归纳反复出现主题的质性方法；范文用它分析 131 份学生反思，主题配计数与原话例证。

**Likert scale 李克特量表**
EN: An ordinal rating scale (e.g., 1–5 from strongly disagree to strongly agree).
中: 1–5（或 1–7）的等级评分；属于有序数据，比较前后变化用 Wilcoxon 而非 t 检验更稳妥。

**self-report 自我报告**
EN: Data based on participants' own statements about themselves.
中: 参与者自述的数据（信心、态度）；固有局限是主观偏差，报告时措辞要保守。

**triangulation 三角互证**
EN: Using multiple data sources/methods to corroborate a finding.
中: 用多种来源相互印证同一结论；范文用「行为数据（提示词得分）+ 自评（信心）+ 反思文本」三线互证。

**generalizability 可推广性**
EN: The extent to which findings apply beyond the studied sample and setting.
中: 结论能否推广到样本与情境之外；单地区、单学段研究要在 Limitations 里主动声明边界。

**limitations 局限**
EN: Honest statements of a study's boundaries and weaknesses.
中: 论文主动交代的边界与弱点；在 EAAI 社区，写好局限是加分项而非减分项。

**pilot study 预研究**
EN: A small trial run to debug materials and procedures before the main study.
中: 正式研究前的小规模试跑，用于调试材料与流程。

## B. 统计术语 | Statistics

**p-value / statistical significance p 值 / 统计显著性**
EN: The probability of observing data at least this extreme if there were truly no effect; p < .05 is the conventional threshold.
中: 假设真实无效应时，观察到当前（或更极端）数据的概率；p < .05 按惯例称"显著"。注意：显著 ≠ 效应大，只表示"不太可能是随机波动"。

**mean (M) / median / standard deviation (SD) 均值 / 中位数 / 标准差**
EN: Average; middle value; spread of the data.
中: 平均数；排序后中间的值；数据离散程度。报告格式如 "M = 4.4, SD = 1.04"。

**null result 不显著结果**
EN: A comparison that fails to reach significance.
中: 没达到显著的比较结果；范文示范了正确处理——如实报告并给机制解释（天花板效应），而非隐藏。

**ceiling effect 天花板效应**
EN: Scores cluster near the maximum, leaving no room to detect improvement.
中: 前测分数已接近满分，后测无提升空间，导致测不出学习效果；解法是提高题目难度层级（范文研究二的动机）。

**dosage effect 剂量效应**
EN: Outcomes depend on the amount/duration of the treatment received.
中: 效果取决于干预"剂量"（时长/次数）；单节课练习不足以改变不熟悉的技能维度，是解释部分维度无提升的机制。

**dichotomous data 二分数据**
EN: Data with exactly two possible values (pass/fail, yes/no).
中: 只有两个取值的数据；范文每个评分维度都是过/不过，这决定了要用 McNemar 而非 t 检验。

**McNemar test 麦克尼马尔检验**
EN: Tests change in paired dichotomous outcomes (same people, before vs. after).
中: 同一批人、前后两次、二分结果的变化检验；范文用它比较 Q1 与 Q3 各维度通过率。

**chi-square test 卡方检验**
EN: Tests association between categorical variables across independent groups.
中: 独立组间分类变量的关联检验；样稿用它比较两条件的提升比例差异。

**Wilcoxon signed-rank test 威尔科克森符号秩检验**
EN: Non-parametric test for paired ordinal data.
中: 配对等级数据的非参数检验；Likert 前后对比的标准选择（不假设正态分布）。

**Mann–Whitney U test 曼-惠特尼 U 检验**
EN: Non-parametric test comparing two independent groups on ordinal data.
中: 两独立组等级数据的比较；样稿用它比较两条件的信心变化量。

**Pearson correlation (r) 皮尔逊相关**
EN: Linear association between two continuous variables, from −1 to 1.
中: 两个连续变量的线性关联强度；r = .27 属弱到中等正相关。相关 ≠ 因果。

**Cohen's kappa (κ) 科恩卡帕系数**
EN: Agreement between coders corrected for chance agreement.
中: 扣除"随机也会一致"的期望后的编码一致性；κ > .90 依 McHugh (2012) 判为几乎完全一致。比原始一致率更严格可信。

**Cronbach's alpha (α) 克伦巴赫系数**
EN: Internal consistency of a multi-item scale; .70 is the conventional benchmark.
中: 量表内部各题是否"测同一件事"的指标；惯例基准 .70，低于时要解释（小样本、题目多样性）。

**item difficulty 题目难度**
EN: Proportion of test-takers answering correctly; ideal ≈ 0.3–0.7.
中: 答对人数比例（注意：数值越高题越"容易"）；理想区间约 [0.3, 0.7]——太易太难都测不出差异。

**discrimination index 区分度**
EN: How well an item separates high from low performers; ≥ 0.2 acceptable.
中: 题目区分高低水平学生的能力（高分组与低分组答对率之差）；≥ 0.2 可接受，越接近 1 越好。

**reliability vs. validity 信度 vs 效度**
EN: Consistency of measurement vs. whether it measures the intended construct.
中: 信度 = 测得稳不稳（重复测结果一致吗）；效度 = 测得准不准（真的在测目标能力吗）。二者独立：高信度不保证高效度。

**Item Response Theory (IRT) 项目反应理论**
EN: Models placing items and persons on a common latent scale, yielding sample-invariant item parameters.
中: 把题目难度与人的能力放到同一量尺上的统计模型（1PL/2PL/3PL）；优于经典指标之处是题目参数不依赖特定样本。范文 Future Work 的方法升级方向。

**effect size 效应量**
EN: The magnitude of an effect, independent of sample size (e.g., Cohen's d, φ).
中: 效应"有多大"的度量（p 值只说"有没有"）；审稿趋势是要求显著性与效应量并报。

## C. AI 与学习科学 | AI & Learning Sciences

**AI literacy AI 素养**
EN: The competencies to critically evaluate, communicate with, and use AI effectively.
中: 批判性评估 AI、与 AI 有效协作、把 AI 当工具使用的能力集（Long & Magerko 2020 的定义域）。

**prompting literacy 提示词素养**
EN: Understanding what AI can support, when to use it, and how to craft effective prompts.
中: AI 素养的聚焦子域：懂 AI 能支持什么（what）、何时该用（when）、如何写好提示词（how）。范文的教学目标。

**prompt / prompt engineering 提示词 / 提示词工程**
EN: The natural-language input to an LLM; the craft of designing effective ones.
中: 发给大模型的自然语言指令；系统性设计有效提示词的技艺。

**large language model (LLM) 大语言模型**
EN: A neural model trained on large text corpora to generate and evaluate language.
中: 在海量文本上训练、能生成与判断语言的神经网络模型；范文用 GPT-4o 同时扮演聊天机器人与评分器。

**auto-grader 自动评分器**
EN: A system that scores student work automatically, here an LLM applying a rubric.
中: 自动给学生作品打分的系统；范文的核心技术组件——LLM 按量规逐维判定并生成解释。

**rubric 评分量规**
EN: Explicit criteria and levels used to judge work consistently.
中: 明确的评分标准表（维度 + 定义 + 判级）；范文的六维二元量规是自建 rubric 挂靠已有框架（CLEAR）的示范。

**learning objective (LO) 学习目标**
EN: What learners should know or be able to do after instruction.
中: 教学后学习者应会什么；好的 LO 可测、有推导来源（教师需求 + 权威框架）。

**formative vs. summative assessment 形成性 vs 总结性评价**
EN: Assessment to improve ongoing learning vs. to certify final attainment.
中: 形成性 = 过程中给反馈促学习（范文的练习反馈）；总结性 = 期末定级（考试打分）。

**verification vs. elaborated feedback 验证式 vs 详释式反馈**
EN: Telling only right/wrong vs. explaining why and how to improve.
中: 只告知对错 vs 解释原因并给改进方向；Shute (2008) 的核心二分，也是样稿两条件的定义来源。

**scaffolding 脚手架**
EN: Temporary support that enables learners to perform beyond their current ability, gradually removed.
中: 帮助学习者完成"够不着"任务的临时支持，随能力增长逐步撤除；源自维果茨基最近发展区（ZPD）传统。

**MCQ / True-False / open-ended items 选择题 / 判断题 / 开放题**
EN: Item formats differing in what cognition they can capture and how they are scored.
中: 三种题型各有测量边界：MCQ 依赖高质量干扰项、难测高层级认知；判断题逐题独立提供更多数据点；开放题直接测产出行为但需人工或 AI 评分。

**distractor 干扰项**
EN: The wrong options in an MCQ, ideally built from common misconceptions.
中: 选择题里的错误选项；高质量干扰项应来自学生常见迷思——不了解学生先备知识时干扰项写不好（范文换题型的原因之一）。

**misconception 迷思概念**
EN: A systematic, persistent wrong belief learners hold.
中: 学习者系统性、顽固的错误理解；收集迷思是命题与教学设计的素材（范文用开放题充当迷思收集器）。

**productive struggle 生产性挣扎**
EN: Difficulty that, with support, advances understanding rather than blocking it.
中: 有支持时能推进理解的困难；与之相对的是应被消除的额外负担。把"学生觉得难"分类到这里，是把负面证据翻转为设计有效证据的理论工具。

**extraneous cognitive load 外在认知负荷**
EN: Mental effort imposed by poor design or logistics, not by the learning itself.
中: 与学习目标无关的心智负担（登录慢、打字困难）；设计者的职责是将其最小化。

**scenario-based assessment 情境化测评**
EN: Assessing skills through realistic, contextualized problem situations.
中: 把测评题嵌进真实情境（"明天要考试，你会怎么问 AI"），促进深度思考与知识应用，适合能力型目标。

## D. 学术出版术语 | Academic Publishing

**venue / proceedings 发表平台 / 会议论文集**
EN: Where research is published; proceedings are the archived papers of a conference.
中: 论文发表的去处；proceedings 是会议正式存档的论文集（EAAI 论文收录于 AAAI proceedings）。

**call for papers (CFP) 征稿启事**
EN: The official announcement of topics, requirements, and deadlines.
中: 官方发布的投稿范围、要求与截止时间——写作全程的第一依据。

**track / area 赛道 / 分区**
EN: Sub-divisions of a venue with distinct scopes and review criteria.
中: 会议内部按主题/类型划分的投稿通道；选错赛道按错的标准被评。

**double-blind review 双盲评审**
EN: Authors don't know reviewers and reviewers don't know authors.
中: 作者与评审互不知晓身份；因此投稿版必须匿名（去作者/机构/致谢、自引第三人称）。

**desk reject 直接拒稿**
EN: Rejection by the chairs before peer review, usually for scope/format/anonymity violations.
中: 未进入评审即被程序主席拒掉——超页、暴露身份、跑题是三大常见原因。

**camera-ready 出版终稿**
EN: The final version prepared after acceptance, with author info restored.
中: 录用后按出版要求准备的最终版；补回作者信息与致谢、签版权表。

**Anywhere on Earth (AoE) 全球最晚时区**
EN: Deadline convention meaning the deadline holds as long as it's not past in UTC-12.
中: 截止时间按 UTC-12 计——地球上最后一个时区过完当天才算截止；换算到墨尔本会"多出"约 22 小时，但不要卡这个点。

**dual / simultaneous submission 一稿多投**
EN: Submitting substantially the same work to multiple archival venues at once—prohibited.
中: 同一工作同时投多个有正式论文集的平台——被禁止；评审期内论文处于"锁定"状态。

**supplementary material 补充材料**
EN: Optional appendices (technical/multimedia/code) submitted separately; reviewers aren't obliged to read them.
中: 单独提交的附加材料（技术附录/多媒体/代码）；评审没有义务看——正文必须自包含。

**DOI 数字对象标识符**
EN: A permanent identifier resolving to the official copy of a publication.
中: 指向文献官方版本的永久编号；核对引用真伪的最可靠入口。

**preprint / arXiv 预印本**
EN: A publicly posted, non-peer-reviewed version of a paper.
中: 未经评审公开张贴的论文版本；按 AAAI 惯例不违反双盲，但投稿正文不能指向它、它也不能提及投稿。

**self-citation & anonymization 自引与匿名化**
EN: Citing your own prior work in third person so it reads like anyone else's.
中: 匿名评审下引自己的前作要用第三人称（"Xiao et al. (2026) showed..."），格式与他引完全一致，绝不写 "our previous work"。

**contribution (statement) 贡献声明**
EN: Explicit statements of what the paper adds to knowledge.
中: 论文对领域"新增了什么"的显式陈述；常见形式是 Introduction 结尾的编号列表或路线图段。

**novelty / (technical) rigor 新颖性 / 严谨性**
EN: Newness of the contribution; soundness of methods and evidence.
中: 评审打分的两大硬指标：贡献是否新、方法证据是否扎实。

**related work 相关工作**
EN: The section positioning your paper among existing literature.
中: 把你的论文放进已有文献坐标系的章节；功能是"立缺口 + 立理论"，不是文献罗列。

**citation key / BibTeX 引用键 / 文献数据库格式**
EN: The identifier used in \cite{...}; BibTeX stores structured reference entries.
中: 正文引用时用的短代号（如 xiao2026learning）；BibTeX 是存放结构化文献条目的格式，编译时自动生成参考文献列表。

---

# 第三部分 ｜ 理论知识初学者讲义（10 讲，中英对照）
**Theory Primer for Beginners**

> 体例：EN 段（英文原理）→ 中文段（对照讲解）→ 在范文中的位置 → 初学者易错点

## T1. AI 素养框架 | AI Literacy Frameworks

**EN** — AI literacy frameworks answer the question "what should people learn about AI?" Long and Magerko (2020) synthesized interdisciplinary research into a set of competencies—critically evaluating AI, communicating and collaborating with it, and using it as a tool—plus design considerations for learning experiences. Frameworks give a paper *conceptual legitimacy*: instead of inventing your own definition of what matters, you anchor your goals to a community-vetted structure.

**中** — AI 素养框架回答"人们应当学会关于 AI 的什么"。Long & Magerko (2020) 把跨学科研究综合为一组能力（批判评估、有效协作、工具化使用）外加学习体验的设计考量。框架给论文提供**概念合法性**：你不必自创"什么重要"的定义，而是把目标挂到社区公认的结构上。

**在范文中**：Introduction 定义 prompting literacy 时的上位概念来源。
**易错点**：把框架当装饰性引用（Intro 提一句就完）——正确用法是让框架实际参与推导（目标从框架条目派生）。

## T2. AI4K12 五大观念 | Five Big Ideas in AI

**EN** — The AI4K12 initiative organizes what K-12 students should know into five Big Ideas: Perception (computers sense the world), Representation & Reasoning (agents maintain models and use them), Learning (computers learn from data), Natural Interaction (intelligent agents interact with humans), and Societal Impact (AI can help or harm society). Grade-band progressions specify age-appropriate depth.

**中** — AI4K12 计划把 K-12 学生应了解的内容组织为五大观念：感知（计算机感知世界）、表示与推理（智能体维护并使用世界模型）、学习（计算机从数据中学习）、自然交互（智能体与人交互）、社会影响（AI 可能造福或伤害社会），并按学段给出深度进阶表。

**在范文中**：§3.1 学习目标推导的框架源。
**易错点**：把五大观念当知识点清单直接照抄成教学内容——它是组织框架，具体学习目标仍需结合人群需求派生。

## T3. CLEAR 提示词框架 | The CLEAR Framework

**EN** — Lo (2023) proposes five criteria for effective prompts: Concise (brief and focused), Logical (well-ordered reasoning), Explicit (clear about the desired output), Adaptive (revised in response to outputs), and Reflective (evaluating and learning from the exchange). It is a *prescriptive* framework: it states what ought to be, without empirical testing.

**中** — Lo (2023) 提出有效提示词的五判据：简洁（短而聚焦）、有逻辑（表达有序）、明确（清楚说明想要的输出）、自适应（根据输出迭代修改）、反思性（评估并从交互中学习）。它是**规范性**框架：陈述"应该怎样"，本身不含实证检验。

**在范文中**：§3.3——自建评分维度的挂靠依据；范文把规范条目操作化为可判定的二元维度。
**易错点**：直接引用框架却不做操作化——评审要看到"框架条目 → 可测定义"的转换过程。

## T4. 做中学与目标导向场景 | Learning-by-Doing & Goal-Based Scenarios

**EN** — Schank's learning-by-doing holds that skills are acquired by pursuing meaningful goals in realistic scenarios, not by absorbing lectures first. A Goal-Based Scenario packages this into components: a mission, a cover story, a role for the learner, operations, resources, and feedback. Koedinger et al. (2015) supply large-scale evidence: in MOOC data, interactive doing was several times more strongly associated with learning than watching or reading (the "doer effect").

**中** — Schank 的做中学主张：技能在真实场景中追求有意义目标时习得，而非先听讲再实践。目标导向场景（GBS）把这一思想打包为构件：任务使命、背景故事、学习者角色、操作、资源与反馈。Koedinger 等 (2015) 提供了大规模证据：MOOC 数据中，交互式"做"与学习成效的关联是被动看/读的数倍（"实践者效应"）。

**在范文中**：§2.2 理论声明 + §3.2 场景设计（每个练习都含角色/故事/资源/使命）。
**易错点**：引了理论但场景设计不含 GBS 构件——理论与设计要逐项对得上；另外 doer effect 是相关性证据，措辞用 "associated with" 而非因果断言。

## T5. 主动学习与体验式学习 | Active & Experiential Learning

**EN** — Active learning (Bonwell & Eison 1991) is the umbrella idea that students learn by doing things and thinking about what they do. Experiential learning adds a cycle: concrete experience → reflective observation → abstract conceptualization → active experimentation. These overlap with learning-by-doing; papers typically anchor to one or two, not all.

**中** — 主动学习（Bonwell & Eison 1991）是伞概念：学生通过"动手做并思考所做"来学习。体验式学习进一步给出循环：具体经验 → 反思观察 → 抽象概念化 → 主动实验。它们与做中学高度重叠；论文通常挂 1–2 个理论即可，不必全引。

**在范文中**：Introduction 第三段的双理论挂载（active learning + experiential learning）。
**易错点**：把三个近义理论堆着全引——显得没想清楚设计到底基于哪个机制。

## T6. 形成性反馈理论 | Formative Feedback Theory

**EN** — Shute (2008) distinguishes feedback by content: *verification* (right/wrong only) versus *elaboration* (why, and how to improve), recommending elaborated, task-focused feedback for learning. Hattie and Timperley (2007) model effective feedback as answering three questions—Where am I going? How am I going? Where to next?—operating at four levels (task, process, self-regulation, self), with self-level praise least effective.

**中** — Shute (2008) 按内容区分反馈：验证式（只报对错）vs 详释式（解释原因并指改进方向），并建议学习场景用聚焦任务的详释反馈。Hattie & Timperley (2007) 把有效反馈建模为回答三个问题——目标是什么？我现在如何？下一步去哪？——作用于四个层次（任务、过程、自我调节、自我），其中指向"自我"的表扬对学习最无效。

**在范文中**：§2.2 的第二条学习科学原理；范文的详释反馈同时覆盖"我现在如何"（逐维判定）与"下一步去哪"（改进解释）。
**易错点**：以为反馈越多越好——Shute 强调匹配（新手/难任务宜即时详释；反馈聚焦任务而非人）；样稿的 RQ3 也显示详释反馈有"阅读负荷"的代价。

## T7. 生产性挣扎与认知负荷 | Productive Struggle & Cognitive Load

**EN** — Not all difficulty is bad. Productive struggle (Warshauer 2015) is difficulty aligned with the learning goal that, when supported, deepens understanding. Cognitive load theory separates load intrinsic to the task from *extraneous* load imposed by poor design (slow platforms, clumsy interfaces). Good design preserves productive struggle and removes extraneous load.

**中** — 不是所有困难都有害。生产性挣扎（Warshauer 2015）指与学习目标同构、在支持下能深化理解的困难。认知负荷理论把任务固有的负荷与设计不良强加的**外在负荷**（平台卡顿、界面笨拙）区分开。好的设计保留生产性挣扎、消除外在负荷。

**在范文中**：§4.6 把学生报告的挑战二分为两类——"写好提示词难"归为生产性（正是教学目标），"登录慢/打字难"归为外在负荷（改进项）。
**易错点**：把学生"觉得难"一律当负面结果报告——用这个透镜分类后，一部分困难反而是干预有效的证据。

## T8. 布鲁姆修订版分类学 | Bloom's Revised Taxonomy

**EN** — Krathwohl (2002) summarizes the revision: six cognitive processes—remember, understand, apply, analyze, evaluate, create—crossed with four knowledge types (factual, conceptual, procedural, metacognitive). Its practical power in assessment: classify what cognitive level a skill demands, then choose item formats capable of measuring that level.

**中** — Krathwohl (2002) 概述修订版：六个认知过程——记忆、理解、应用、分析、评价、创造——与四类知识（事实、概念、程序、元认知）交叉。它在测评中的实用价值：先判定技能所需的认知层级，再选择能测到该层级的题型。

**在范文中**：§5.1 的换题型推理链——写提示词属 analyze/create 层级 → 高层级 MCQ 极难命制 → 改用开放题直接测产出。
**易错点**：给每节课贴层级标签就完事——分类学的价值在指导决策（题型/活动选择），不在贴标签本身。

## T9. 情境化测评 | Scenario-Based Assessment

**EN** — Instead of testing decontextualized facts, scenario-based assessment embeds tasks in realistic situations that demand applying knowledge. It suits competency-oriented goals: if the objective is "knowing when and how to use AI," the test should present a *when-and-how* situation, not a definition to recite.

**中** — 情境化测评不考脱离情境的知识点，而是把任务嵌进需要应用知识的真实情境。它适配能力型目标：若目标是"知道何时、如何用 AI"，测评就应呈现一个"何时-如何"的情境，而非让学生背定义。

**在范文中**：§4.2 测评设计的论证基础（写作、数学、科学领域的情境测评先例引文簇）。
**易错点**：情境写得太长太花——情境要素（背景/目标/资源/约束）齐即可，冗余叙事反而增加外在负荷。

## T10. 经典测量理论与项目反应理论 | CTT vs. IRT

**EN** — Classical Test Theory evaluates items with sample statistics: difficulty (proportion correct, ideal ≈ .3–.7), discrimination (≥ .2), and scale reliability (Cronbach's α, benchmark .70). Its weakness: these numbers depend on who happened to take the test. Item Response Theory fits latent-trait models (1PL/2PL/3PL) that place persons and items on one scale, giving sample-invariant item parameters—the natural upgrade when assessments must compare across populations or versions.

**中** — 经典测量理论（CTT）用样本统计量评估题目：难度（答对比例，理想约 .3–.7）、区分度（≥ .2）、量表信度（Cronbach's α，基准 .70）。其弱点：这些数字取决于"恰好是谁来考"。项目反应理论（IRT）拟合潜在特质模型（1PL/2PL/3PL），把人与题放到同一量尺，题目参数不随样本变——当测评需要跨人群、跨版本可比时，IRT 是自然升级。

**在范文中**：§5.2 全部用 CTT 指标诊断题目质量；§6 把 IRT 列为 Future Work。
**易错点**：小样本硬上 IRT——IRT 需要较大样本才能稳定估计参数；范文样本量级用 CTT 是正确选择，这也是它"诚实匹配方法与数据"的示范。

---

# 第四部分 ｜ 关键句式模板 · 中英对照
**Sentence Pattern Templates (EN template ↔ 中文对应)**

> 句式已模板化（方括号为替换槽），可直接往里填你们的内容。中文行帮助理解句式功能，写作时用英文行。

**P1 · 缺口句 Gap statement**
EN: While [X] holds promise for [population], few [interventions/studies], to our knowledge, focus on [Y].
中: 尽管 [X] 对 [人群] 前景可观，但据我们所知，很少有 [干预/研究] 关注 [Y]。

**P2 · 概念定义 Concept definition (what/when/how)**
EN: [Concept] includes helping students understand what [systems] can do, when to use them effectively, and how to [core skill].
中: [概念] 包括帮助学生理解 [系统] 能做什么、何时有效使用、以及如何 [核心技能]。

**P3 · 重要性收束 Importance closer**
EN: Therefore, equipping students with [skill] is crucial to [goal].
中: 因此，让学生具备 [技能] 对 [目标] 至关重要。

**P4 · 本文声明 This-work statement**
EN: This work presents [artifact type] to improve [outcome] for [population].
中: 本文提出 [制品类型]，以提升 [人群] 的 [结果]。

**P5 · 理论挂载 Theory anchoring**
EN: It applies [theory A] ([cite]) and [theory B] ([cite]) methods to engage students with [activity].
中: 本设计应用 [理论A] 与 [理论B] 的方法，让学生投入 [活动]。

**P6 · 研究假设 Hypothesis**
EN: We hypothesized that [practicing X in this way] could help students [outcome], supporting [secondary outcome].
中: 我们假设 [以此方式练习X] 能帮助学生 [结果]，并促进 [次级结果]。

**P7 · 路线图 Roadmap**
EN: We first [outline the design]. Then, we [report evaluation results]. Finally, we [propose improvements].
中: 我们首先 [介绍设计]；随后 [报告评估结果]；最后 [提出改进方向]。

**P8 · 理论声明 Grounding statement**
EN: This study's [instructional design] is grounded in two foundational learning sciences principles: [A] ([cite]) and [B] ([cite]).
中: 本研究的 [教学设计] 扎根于两条学习科学基本原理：[A] 与 [B]。

**P9 · 前人局限 Prior-work limitation**
EN: While [approach] has been applied in [domain] (e.g., [tool] ([cite])), such efforts often lack [component], which may [negative consequence].
中: 尽管 [方法] 已应用于 [领域]（如 [工具]），这类工作往往缺少 [组件]，可能导致 [负面后果]。

**P10 · 桥接收束 Bridge closer**
EN: Building on these capabilities, our work integrates [A] with [B] to close the gap in [C].
中: 基于这些能力，本工作将 [A] 与 [B] 结合，以填补 [C] 的缺口。

**P11 · 目标推导 LO derivation**
EN: Based on [needs source] ([cite]) and [framework] ([cite]), [N] learning objectives were derived: [LO1], [LO2], and [LO3].
中: 基于 [需求来源] 与 [权威框架]，推导出 [N] 条学习目标：……

**P12 · 部署情境 Deployment context**
EN: The study was conducted in [time] in [N] classrooms in [region]. We deployed this as [format] with [ethics body] approval, resulting in valid data from [n] students.
中: 研究于 [时间] 在 [地区] 的 [N] 个课堂开展，以 [形式] 部署并获 [伦理机构] 批准，最终获得 [n] 名学生的有效数据。

**P13 · 加粗结论句 Bold finding opener**
EN: [Population] improved at [skill] with practice. ／ The [system] is able to [function] with good quality in most categories.
中: [人群] 在练习中于 [技能] 上取得提升。／ [系统] 在多数类别中能高质量地 [功能]（注意自带限定词 in most categories）。

**P14 · 诚实的不显著 Honest null**
EN: No significant increment (p = [value]) was found in [measure], which we attribute to [mechanism, e.g., a ceiling effect] in [assessment].
中: [测量] 未见显著提升（p = [值]），我们将其归因于 [机制，如天花板效应]。

**P15 · 误差剖析 Error analysis**
EN: For the inaccurate cases in [dimension], one pattern is that the [system] tended to [behavior]. For instance, one [example] was "[short excerpt]"...
中: 就 [维度] 的误判案例而言，一个模式是 [系统] 倾向于 [行为]；例如……（引具体案例，原话用斜体）

**P16 · 收尾三段式 Lessons-learned paragraph**
EN: First, our results provide [contribution phrase]. [Evidence recap]. However, [limitation] remains open; future work should [direction].
中: 第一，我们的结果提供了 [贡献]。……然而 [局限] 仍待解决；未来工作应 [方向]。

---

## 结语 | Closing Note

读原文时的推荐节奏：**第一遍**只读摘要、各节标题、加粗句与图表（20 分钟，建立骨架感）；**第二遍**逐节精读，配合本手册第一、二部分（90 分钟）；**第三遍**只重读 §4–§5 的统计段落，配合第三部分 T10 与术语词典 B 类（40 分钟，这是你作为数据分析负责人的主战场）。遇到任何一段读不通的英文，直接贴给 Claude 逐句拆解——按需精讲远胜通篇对照。
