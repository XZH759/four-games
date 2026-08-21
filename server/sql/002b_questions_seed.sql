-- Auto-generated from items.seed.json + monopoly/questions.js keys
-- Run in Neon SQL Editor after 002_questions.sql
BEGIN;

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'E-1-Q1',
  'Engaging',
  'single',
  '均一教育平台会根据学生的答题情况，自动调整题目的难度。君君和依依第一题做的是同样难度的题目，但接下来君君的两题比依依的更难。下列哪一种是可能的答题情况？',
  '{"options":[{"key":"A","text":"君君: {no}{ok}{ok}; 依依: {no}{no}{no}","render":"seq_icons"},{"key":"B","text":"君君: {ok}{ok}{no}; 依依: {no}{no}{ok}","render":"seq_icons"},{"key":"C","text":"君君: {ok}{ok}{ok}; 依依: {ok}{no}{no}","render":"seq_icons"},{"key":"D","text":"君君: {ok}{ok}{no}; 依依: {ok}{no}{no}","render":"seq_icons"}]}'::jsonb,
  '{"answer":2}'::jsonb,
  '自适应通常在答对后提高难度。君君连续答对而依依表现较弱时，君君后续题目更难是合理结果。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'E-2-Q1',
  'Engaging',
  'single',
  '你在使用一个非台湾本土的 AI 工具协助撰写台湾历史小论文。AI生成了一段历史叙述，内容看起来合理、逻辑清楚，但你在课本中没有找到相同角度的描述。以下哪一种做法是相对而言较负责任的？',
  '{"options":[{"key":"A","text":"使用这段内容，因为非本土 AI 可以提供更全面的历史视角"},{"key":"B","text":"反复询问AI，确认回答前后一致后再写进论文，避免AI幻觉"},{"key":"C","text":"不使用，因为该AI不是台湾本土工具，生成的台湾历史信息一定是错的"},{"key":"D","text":"不使用，因为这段内容缺乏其他可靠资料的支持"}]}'::jsonb,
  '{"answer":3}'::jsonb,
  '看起来合理并不等于可靠；缺乏其他可靠资料支持时，不应直接采用。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'E-3-Q1',
  'Engaging',
  'single',
  'Chloe经常在社交媒体发表减肥打卡的帖子。以下四则推文哪一个更有可能被推荐给Chloe？为什么？',
  '{"options":[{"key":"A","text":"一篇被营养学专家转发、详细介绍健康减重原理的帖子，因为平台的推荐算法会优先推送专家认可的内容给所有用户，以保证用户对平台的信赖度。"},{"key":"B","text":"一则获得大量点赞和评论、但含有不实信息、强调“快速瘦身秘诀”的帖子，因为推荐算法往往会根据Chloe过去的互动行为和兴趣偏好，推送她更可能点击和停留的内容，以提高参与度。"},{"key":"C","text":"一篇语气中立、总结不同减肥方法优缺点的权威新闻机构报道，因为推荐算法会刻意平衡不同观点，确保用户看到多元、全面的信息。"},{"key":"D","text":"一条讲述因减肥导致厌食症经历的影片，由一位与Chloe年纪和生活背景相似的女生发布，因为推荐算法会呈现关键字“减肥”下包含的不同选择的利弊与可能后果。"}]}'::jsonb,
  '{"answer":1}'::jsonb,
  '推荐系统常优化参与度，会依据过往互动推送更可能点击/停留的内容，即使信息不实。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'E-3-Q2',
  'Engaging',
  'open_triple',
  '你喜欢一位歌手，但你发现你和好朋友君君在社交媒体上看到的内容很不一样：即使是同一件事，你看到的多半是称赞这位歌手的内容，而君君看到的却是批评或负面的说法。请用你自己的话回答下面的问题：',
  '{"prompts":["为什么你们的主页会出现不同的内容？","你觉得哪些信息比较可信？你通常会怎么判断？","你认为个人和社交媒体平台可以分别做些什么，来减少不实信息的传播？"]}'::jsonb,
  NULL,
  NULL,
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'E-4-Q1',
  'Engaging',
  'single',
  '一名南非黑人女老师一直无法让AI识别到她的脸。针对算法可能产生偏见这一问题，程序员可以在采取以下哪种针对性措施来减轻偏见、提高算法的公平性？',
  '{"options":[{"key":"A","text":"使用性能更高的计算设备训练模型，以提升整体运算效率和识别能力"},{"key":"B","text":"在训练过程中加入更多来自不同性别、肤色和地区的人脸数据"},{"key":"C","text":"调整模型结构并延长训练过程，使模型能够学习到更复杂的特征"},{"key":"D","text":"检查并调整AI的使用环境和参数设置，例如光线条件或识别阈值"}]}'::jsonb,
  '{"answer":1}'::jsonb,
  '增加多元、具代表性的训练数据，是减轻识别偏差的直接针对性措施。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'E-5-Q1',
  'Engaging',
  'single',
  '以下四个场景中，哪一个相对而言最对环境负责',
  '{"options":[{"key":"A","text":"一家公司频繁训练超大规模 AI 模型用于生成娱乐内容；训练过程主要依赖可再生能源。"},{"key":"B","text":"一家科技企业的数据中心采用封闭式水冷系统；在服务设计中对不同等级用户设置不同的计算规模上限。"},{"key":"C","text":"一家科技企业部署多个相似的 AI 系统处理同一任务；公司硬件频繁更新但进行部分硬件回收。"},{"key":"D","text":"一家公司为了追求更快响应速度，将同一模型复制部署在多个地区的数据中心；公司会计算水电费用成本。"}]}'::jsonb,
  '{"answer":1}'::jsonb,
  '在提升冷却效率的同时限制不必要算力规模，比反复训练/重复部署更能体现环境责任。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'E-6-Q1',
  'Engaging',
  'single',
  '一位同学正在使用 AI 改写他的「个人故事」写作。以下是他的原句：“那天我坐在餐桌旁，望着厨房里的妈妈，和在炉灶上冒着热气的面条看了很久，心里乱成一团。”下面哪一句修改后的版本读起来更像是真正的他？',
  '{"options":[{"key":"A","text":"那天我坐在餐桌旁，看着厨房里的妈妈，还有炉灶上热气腾腾的面条，发了很久的呆，心里乱糟糟的。"},{"key":"B","text":"那天我坐在餐桌旁，看着厨房里的妈妈和热气腾腾的面条思考。"},{"key":"C","text":"那天的经历使我在餐桌旁对自己的情绪状态进行了反思，心绪纷乱。"},{"key":"D","text":"那天我在餐桌旁，体验到了一种复杂的心理状态，心乱如麻。"}]}'::jsonb,
  '{"answer":0}'::jsonb,
  '最接近原句节奏与个人口语感的改写，通常更能保留作者声音。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'E-7-Q1',
  'Engaging',
  'multi',
  '26岁的外国人Amy想要在台湾贷款买房，但她发现银行的AI算法拒绝了她的贷款请求。以下关于AI可能如何做出判断的说法，哪些是正确的？',
  '{"options":[{"key":"A","text":"Amy确实存在贷款风险，AI算法可能通过使用Amy的个人信用历史等数据得出了贷款风险高的结论。"},{"key":"B","text":"AI对于外国人还款能力可能存在偏见；增加AI训练时居住地（如邮政编码），手机型号种类(如使用苹果/安卓系统）和邮箱服务商这些中立数据的使用可以减少偏见。"},{"key":"C","text":"AI对于外国人还款能力可能存在偏见；如果不采用性别、种族、国籍这些敏感信息训练AI模型，算法就不会有偏见。"},{"key":"D","text":"Amy确实存在贷款风险，因为数学模型只是对客观事实的真实反映，能消除人类决策中的偏见，全面考虑到Amy自己想不到的方面。"}]}'::jsonb,
  '{"answer":0,"answers":[0]}'::jsonb,
  '信用历史等可相关数据可能支持风险判断；代理变量与“去掉敏感字段就无偏见”“模型必然客观”并不成立。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'C-1-Q1',
  'Creating',
  'order',
  '你的社会实践作业要求制作一支鼓励老人了解AI的影片，你已经有初步的构想并打算用AI工具协助你完成影片制作。选择可行的做法并进行步骤排序：',
  '{"steps":[{"id":"1","text":"让Sora根据“老人需要了解 AI”这个主题，自动生成完整影片。"},{"id":"2","text":"让Sora根据分镜脚本生成每一小段的影片。"},{"id":"3","text":"使用ChatGPT根据Sora生成的影片生成解说字幕。"},{"id":"4","text":"使用ChatGPT将你原本对影片内容的想法整理成多个简短版本的分镜，再由你选择最适合老人理解的一种。"},{"id":"5","text":"使用AIVA（背景音乐生成平台）根据ChatGPT生成的字幕生成配乐。"},{"id":"6","text":"使用AIVA（背景音乐生成平台）并选择适配的创作风格、速度、情绪、长度等来生成背景音乐。"},{"id":"7","text":"将视频、音乐、字幕组合在一起。"}],"options":[{"key":"A","text":"1→3→5→7"},{"key":"B","text":"4→2→6→7"},{"key":"C","text":"1→3→6→7"},{"key":"D","text":"4→1→5→7"}]}'::jsonb,
  '{"answer":1}'::jsonb,
  '先整理并人工选择分镜，再分段生成影像与可控配乐，最后合成，更符合人机协作创作。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'C-3-Q1',
  'Creating',
  'multi',
  '你是《蛋仔派对》开发团队的首席工程师，你们的团队正在开发新的游戏功能。今早开会时，你团队的四个工程师汇报了他们如何与AI共同进行开发，以下哪几项是你认可的做法：',
  '{"options":[{"key":"A","text":"工程师A：当代码报错时，把整个文件传给AI，让AI重写一份新的不报错的文件替代原文件"},{"key":"B","text":"工程师B：把复杂的开发任务拆分成多个明确的步骤逐步向 AI 提问，并在代码报错的步骤检查AI回答。"},{"key":"C","text":"工程师C：在写改正错误代码的提示词时提供非常长的信息，包括当前代码、功能设计、测试要求、性能条件等。"},{"key":"D","text":"工程师 D 在遇到问题时，坚持完全不使用 AI，认为依赖 AI 会削弱工程师的独立思考能力，因此只靠自己反复尝试解决问题。"}]}'::jsonb,
  '{"answer":1,"answers":[1,2]}'::jsonb,
  '拆分任务并核查、提供充分上下文是较稳妥的协作方式；整文件盲替换与完全拒绝工具都不理想。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'C-4-Q1',
  'Creating',
  'multi',
  '你是一个动漫二创博主，常常用AI工具生成视觉素材。以下哪些提示词生成语是符合版权规定的？',
  '{"options":[{"key":"A","text":"生成皮卡丘背着背包，带观众游览台北 101、九份和夜市的插画，画风可爱卡通"},{"key":"B","text":"将台北的城市景点（如台北 101、淡水老街）绘制成温暖、手绘感的宫崎骏风格"},{"key":"C","text":"由于漫画角色和风格都受到版权保护，因此任何已有 IP 都不应以任何形式（包括风格、画风或设定）被 AI 用来进行二次创作。"},{"key":"D","text":"在明确获得官方授权或平台说明允许的前提下（例如 OpenAI 与 Disney 达成授权合作），生成指定动画 IP 角色的插画，用于授权范围内的内容创作。"}]}'::jsonb,
  '{"answer":3,"answers":[3]}'::jsonb,
  '在明确授权范围内使用指定 IP 相对合规；直接生成受保护角色/风格通常有风险。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'M-1-Q1',
  'Managing',
  'table_multi',
  '你的班级正在制定一份「负责任使用 AI 的学习规范」。以下是四种学生在学习中使用 AI 的做法，以及他们给出的理由说明。请选出「做法与解释之间的对应关系是合理的」选项。',
  '{"cards":[{"key":"A","practice":"学生在撰写报告时使用 AI 协助整理想法与改写句子，并在作业最后注明自己使用了 AI 工具以及 AI 参与的部分。","explain":"这是一种与学术／学习诚信（prompt honesty）相关的良好做法，因为学生清楚说明了 AI 的使用方式，避免误导他人对作品原创性的判断。"},{"key":"B","practice":"学生使用 AI 发想思路，并思考 AI 的回答哪些地方需要修改，透过多次与 AI 对话来加以完善。","explain":"这是一种与尊重智慧财产权（respect for intellectual property）相关的良好做法，因为学生清楚 AI 在学习过程中的角色，而非直接使用他人完成的成果。"},{"key":"C","practice":"学生在使用 AI 生成资料时，会主动查阅课本或其他可靠来源，对 AI 提供的资讯进行比对与修正。","explain":"这与批判性思考（critical thinking）有关，因为学生没有将 AI 的输出视为最终答案，而是进行判断与验证。"},{"key":"D","practice":"学生要求 AI 模仿某位知名作家的写作风格完成一整篇作业，并直接缴交，未标注参考来源。","explain":"这与尊重智慧财产权（respect for intellectual property）有关，因为该做法可能模糊原创性与模仿之间的界线。"}]}'::jsonb,
  '{"answer":0,"answers":[0,2,3]}'::jsonb,
  '这是一种与学术／学习诚信（prompt honesty）相关的良好做法，因为学生清楚说明了 AI 的使用方式，避免误导他人对作品原创性的判断。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'D-1-Q1',
  'Designing',
  'single',
  '某中學計畫使用 AI 系統來给学生推薦課後活動。下列哪一種AI系統設計最能確保推薦結果同時保留必要的人工介入？',
  '{"options":[{"key":"A","text":"AI主要使用學生的學業成績作為資料來源，以確保推薦結果客觀且一致，之后由 AI 產生建議清單；最终结果由教師與學生共同審核與最終決定。"},{"key":"B","text":"AI依據學生興趣、課表與歷史參與紀錄產生推薦結果，並自動完成活動分配；教師於學期結束後檢視整體成效並進行調整。"},{"key":"C","text":"AI結合學生填寫的興趣資料、課表與時間限制，以及過往活動參與情況，将學生分群；實際的個人推薦與分配由教師依經驗判斷完成。"},{"key":"D","text":"結合學生填寫的興趣資料、課表與時間限制，以及過往活動參與情況，產生推薦清單；最终结果由教師與學生共同審核與最終決定。"}]}'::jsonb,
  '{"answer":3}'::jsonb,
  '使用相关情境资料生成建议，并由教师与学生共同审核决定，最能保留必要人工介入。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'D-2-Q1',
  'Designing',
  'single',
  '罗伯特是一名图书管理员，他设计了一个使用「条件判断（if–else）」的简易聊天机器人来协助常客选择今日想读的书籍，具体运行方式为常客将个人需求输入，系统自动推荐三本书籍。他将这个聊天机器人与执行相同任务的机器学习系统进行比较。下列哪一项比较最为正确？',
  '{"options":[{"key":"A","text":"条件式聊天机器人与机器学习系统在推论阶段皆依赖人类定义的逻辑，因此两者在可解释性与控制性上没有显著差异。"},{"key":"B","text":"条件式聊天机器人依赖预先设定的规则与选项，回应固定；机器学习系统则可透过训练资料调整模型，以因应新的偏好。"},{"key":"C","text":"机器学习系统仅适合处理结构化问题，而条件式聊天机器人较适合处理模糊与多变的使用者需求。"},{"key":"D","text":"条件式聊天机器人需要少量历史资料就能正常运作，而机器学习系统可在没有资料的情况下直接做出准确推荐"}]}'::jsonb,
  '{"answer":1}'::jsonb,
  '规则系统回应相对固定；学习系统可随资料更新适应新偏好。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'D-3-Q1',
  'Designing',
  'single',
  '为了帮助垃圾分类，你训练了一个基础影像辨识AI模型，使用网路收集的照片来辨识可回收材料。模型在测试资料中表现良好，但在真实环境部署时准确率明显下降。根据这一结果，下列哪一项最合理地描述该模型在训练过程中学到的内容？',
  '{"options":[{"key":"A","text":"模型学到了主要是可回收材料的物理与化学本质特征，导致在不同环境下预测不稳定。"},{"key":"B","text":"模型学到了训练与测试资料中特有的视觉线索或偏差，而非可在真实环境泛化的关键特征。"},{"key":"C","text":"模型缺乏足够的训练样本，因此无法建立一致的分类标准"},{"key":"D","text":"模型在不同资料来源上形成了两套独立的分类规则，导致运行时发生决策冲突。"}]}'::jsonb,
  '{"answer":1}'::jsonb,
  '测试集表现好但真实场景变差，常表示学到了资料特有偏差而非可泛化特征。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'D-4-Q1a',
  'Designing',
  'single',
  '学生使用相同的购物纪录与使用者行为资料，训练并比较不同的 AI 购物推荐模型。虽然某一模型在离线评估指标（如点击率）上表现最佳，但在实际上线测试时，使用者满意度并未明显提升。学生因此加入使用者回馈，并调整推荐策略。根据上述情境，下列哪一项最合理地解释这一结果？',
  '{"options":[{"key":"A","text":"离线评估指标无法完整反映真实使用情境，因为离线指标和上线指标不一致。"},{"key":"B","text":"模型在训练过程中可能过度拟合既有购物行为模式，未能捕捉使用者需求的变化。"},{"key":"C","text":"使用者满意度一旦形成便不会随推荐内容改变，因此即使调整推荐模型，也无法对满意度产生影响"},{"key":"D","text":"不同推荐模型的差异大部分来自随机因素，无法透过用户回馈进行系统性改进"}]}'::jsonb,
  '{"answer":0}'::jsonb,
  '离线指标与真实满意度可能不一致，需要结合上线反馈调整。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'D-4-Q1',
  'Designing',
  'table_single',
  '你是地震警报系统负责人，需要根据模型判断结果通知市民疏散，有三个地震预测模型，它们的在同一数据集上表现如下表所示。你会选择哪一个模型来发布地震预警？',
  '{"table":{"headers":["模型","预测正确次数（地震且警报，或无地震无警报）","误报次数（警报但无地震）","漏报次数（地震但无警报）"],"rows":[["模型1","95","2","3"],["模型2","98","0","2"],["模型3","90","10","0"]]},"options":[{"key":"A","text":"模型1"},{"key":"B","text":"模型2"},{"key":"C","text":"模型3"},{"key":"D","text":"无法判断，因为三个模型的表现在不同维度各有优劣。"}]}'::jsonb,
  '{"answer":2}'::jsonb,
  '预警场景通常更不能接受漏报；模型3漏报为0，更符合安全优先。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO questions (question_id, domain, item_type, stem, payload, answer_key, explain, source, active, updated_at) VALUES (
  'D-5-Q1',
  'Designing',
  'table_multi',
  '你的组员给游乐园百科大型语言模型编写了模型卡 model card。请你作为组长，检查哪个部分的描述存在明显错误：',
  '{"cards":[{"key":"A","practice":"模型功能概述","explain":"本模型可回答世界各地游乐园的相关问题……由于模型经过完整训练，提供的资讯皆为正确且即时更新。"},{"key":"B","practice":"模型类型","explain":"大型语言模型（Large Language Model）"},{"key":"C","practice":"使用情境","explain":"查询游乐园设施与特色；协助做出更好的游乐园选择与行程安排"},{"key":"D","practice":"伦理考量","explain":"由于本模型仅提供游乐园相关资讯，不涉及健康或安全风险，因此使用者可以放心依赖模型提供的建议来安排行程。"}]}'::jsonb,
  '{"answer":0,"answers":[0,3]}'::jsonb,
  '本模型可回答世界各地游乐园的相关问题……由于模型经过完整训练，提供的资讯皆为正确且即时更新。',
  'items.seed',
  TRUE,
  NOW()
) ON CONFLICT (question_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  item_type = EXCLUDED.item_type,
  stem = EXCLUDED.stem,
  payload = EXCLUDED.payload,
  answer_key = EXCLUDED.answer_key,
  explain = EXCLUDED.explain,
  source = EXCLUDED.source,
  active = EXCLUDED.active,
  updated_at = NOW();

COMMIT;

-- SELECT question_id, domain, item_type, (answer_key IS NOT NULL) AS has_key FROM questions ORDER BY question_id;