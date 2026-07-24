/**
 * Route B 学习伙伴：使用独立立绘，不叠 character-assets 图层。
 * 伙伴只提供鼓励与流程提醒，不提供答案。
 */
export const COMPANION_STORAGE = "nn_companion_v1";
export const COMPANION_DRAFT_STORAGE = "nn_companion_draft_v1";

const BASE = "/nuannuan/partner/assets/companions";

export const COMPANIONS = [
  {
    id: "bella",
    name: "BELLA",
    nameEn: "BELLA",
    role: "星辉守护型",
    tags: ["优雅", "坚韧"],
    accent: "#9b6cff",
    summary: "以沉稳气场稳住节奏，陪你在压力下坚持完成。",
    description:
      "优雅而坚韧的同行者。她会在你犹豫时给予肯定，提醒你把大目标拆成小步骤，但不会替你作答。",
    intro: "慢慢来也没关系。优雅地前进，本身就是一种力量。",
    traits: [
      { icon: "♛", name: "优雅", text: "用从容语气降低焦虑" },
      { icon: "◆", name: "坚韧", text: "提醒坚持完成当前节点" },
      { icon: "♡", name: "守护", text: "卡关时给予稳住节奏的鼓励" },
      { icon: "✦", name: "秩序", text: "提示先完成再切换任务" },
    ],
    portrait: `${BASE}/bella.png`,
  },
  {
    id: "ava",
    name: "AVA",
    nameEn: "AVA",
    role: "节奏勇气型",
    tags: ["节奏", "勇气"],
    accent: "#5ec8ff",
    summary: "用轻快节奏推动你继续尝试，减少卡住不动的时间。",
    description:
      "节奏感强的同行者。她会用短促鼓励帮你重新起步，并提示保持舒适学习节拍，不会直接给出答案。",
    intro: "换个拍子再试一次！勇气往往藏在下一次点击里。",
    traits: [
      { icon: "♪", name: "节奏", text: "帮助维持舒适完成速度" },
      { icon: "⚡", name: "勇气", text: "鼓励继续尝试下一步" },
      { icon: "◎", name: "启动", text: "久停后温和推动重新开始" },
      { icon: "♡", name: "轻快", text: "用活泼反馈缓解压力" },
    ],
    portrait: `${BASE}/ava.png`,
  },
  {
    id: "eileen",
    name: "EILEEN",
    nameEn: "EILEEN",
    role: "智慧分析型",
    tags: ["智慧", "分析"],
    accent: "#7ec8ff",
    summary: "提示你整理题干结构与已知条件，不代替判断。",
    description:
      "冷静敏锐的同行者。她会提醒你先拆分问题、核对关键信息，但绝不会替你下结论或透露答案。",
    intro: "先把线索排好。分析清楚了，答案自然会靠近你。",
    traits: [
      { icon: "◇", name: "智慧", text: "提示结构化思考路径" },
      { icon: "⌕", name: "分析", text: "提醒核对题干关键条件" },
      { icon: "⧉", name: "拆解", text: "帮助把大问题拆成小步" },
      { icon: "☾", name: "冷静", text: "减少干扰信息打扰" },
    ],
    portrait: `${BASE}/eileen.png`,
  },
  {
    id: "fiona",
    name: "FIONA",
    nameEn: "FIONA",
    role: "鼓舞温暖型",
    tags: ["鼓舞", "温暖"],
    accent: "#ff6eb5",
    summary: "在低落时送上温暖鼓励，帮你恢复继续学习的动力。",
    description:
      "热情温暖的同行者。她会在你完成小目标时送上鼓励，并提醒休息与照顾状态，但不会评价答案对错。",
    intro: "你已经很努力了！我们一起把下一段路走完吧。",
    traits: [
      { icon: "♡", name: "鼓舞", text: "完成节点时给予正向反馈" },
      { icon: "❀", name: "温暖", text: "低落时提供情绪支持提醒" },
      { icon: "☀", name: "活力", text: "用轻量庆祝维持动力" },
      { icon: "✚", name: "疗愈", text: "提示适时休息与放松" },
    ],
    portrait: `${BASE}/fiona.png`,
  },
  {
    id: "gladys",
    name: "GLADYS",
    nameEn: "GLADYS",
    role: "逻辑精准型",
    tags: ["逻辑", "精准"],
    accent: "#8b7cff",
    summary: "用逻辑清单帮你自检步骤完整性，不透露结论。",
    description:
      "理性精确的同行者。她会提示你按清单核对步骤与遗漏项，但绝不会直接告诉你答案。",
    intro: "把步骤列出来。精准核对后，我们再往前推进。",
    traits: [
      { icon: "⧉", name: "逻辑", text: "提示按结构检查流程" },
      { icon: "◎", name: "精准", text: "提醒核对是否遗漏条件" },
      { icon: "⌁", name: "校准", text: "帮助确认步骤是否完整" },
      { icon: "◇", name: "克制", text: "只给方法提醒，不给答案" },
    ],
    portrait: `${BASE}/gladys.png`,
  },
  {
    id: "diana",
    name: "DIANA",
    nameEn: "DIANA",
    role: "学术支援型",
    tags: ["活力", "好奇"],
    accent: "#ff7ab8",
    summary: "擅长知识整合与记忆强化提醒，陪你一起成长。",
    description:
      "热情开朗的学术支援型伙伴。她专注于知识整合与记忆强化提醒，会用提问推动探索，但不会直接告诉你答案。",
    intro: "一起学习一起成长！知识是最闪亮的魔法！",
    traits: [
      { icon: "📚", name: "知识整合", text: "提醒串联已学内容" },
      { icon: "🧠", name: "记忆强化", text: "提示回顾关键知识点" },
      { icon: "✦", name: "灵感刺激", text: "鼓励换角度观察问题" },
      { icon: "◎", name: "专注引导", text: "提醒回到当前任务" },
      { icon: "🤝", name: "协作意识", text: "强调结伴学习节奏" },
      { icon: "♡", name: "情绪鼓励", text: "维持积极学习状态" },
    ],
    portrait: `${BASE}/diana.png`,
  },
];

export function getCompanion(id) {
  return COMPANIONS.find((item) => item.id === id) || null;
}

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function loadCompanionDraft() {
  return getCompanion(read(COMPANION_DRAFT_STORAGE));
}

export function loadConfirmedCompanion() {
  return getCompanion(read(COMPANION_STORAGE));
}

export function saveCompanionDraft(id) {
  if (!getCompanion(id)) return false;
  localStorage.setItem(COMPANION_DRAFT_STORAGE, id);
  return true;
}

export function confirmCompanion(id) {
  if (!getCompanion(id)) return false;
  localStorage.setItem(COMPANION_STORAGE, id);
  localStorage.removeItem(COMPANION_DRAFT_STORAGE);
  return true;
}
