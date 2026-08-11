/**
 * English overlays for AI_QUESTIONS (same ids / answer indices).
 * Used by localizeQuestion() when lang === "en".
 */
export const QUESTION_EN = {
  "E-1-Q1": {
    stem: "An adaptive learning platform adjusts question difficulty based on student answers. Junjun and Yiyi start with the same difficulty, but Junjun’s next two questions are harder than Yiyi’s. Which answer pattern is most likely?",
    options: [
      "Junjun: ❌✅✅; Yiyi: ❌❌❌",
      "Junjun: ✅✅❌; Yiyi: ❌❌✅",
      "Junjun: ✅✅✅; Yiyi: ✅❌❌",
      "Junjun: ✅✅❌; Yiyi: ✅❌❌",
    ],
    explain: "Adaptive systems usually raise difficulty after correct answers. If Junjun keeps succeeding while Yiyi struggles, Junjun’s later items being harder is a reasonable result.",
  },
  "E-2-Q1": {
    stem: "You use a non–Taiwan-based AI tool to help write a short paper on Taiwanese history. The AI produces a coherent narrative that looks reasonable, but you cannot find the same angle in your textbook. What is the most responsible next step?",
    options: [
      "Use the text, because a non-local AI can offer a more complete historical view",
      "Ask the AI repeatedly until answers stay consistent, then put it in the paper to avoid hallucination",
      "Do not use it, because a non–Taiwan AI must always be wrong about Taiwanese history",
      "Do not use it, because the claim lacks support from other reliable sources",
    ],
    explain: "Sounding reasonable is not the same as being reliable. Without support from other trustworthy sources, you should not adopt the text.",
  },
  "E-3-Q1": {
    stem: "Chloe often posts weight-loss check-ins on social media. Which of the following posts is most likely to be recommended to Chloe, and why?",
    options: [
      "A nutrition-expert-shared post explaining healthy weight loss in detail, because algorithms prioritize expert-approved content for all users to keep trust high.",
      "A viral post with many likes/comments that pushes a “quick slim secret” with false claims, because recommenders often optimize for past engagement and interests to raise clicks and watch time.",
      "A neutral news piece summarizing pros and cons of diet methods, because algorithms deliberately balance viewpoints for diversity.",
      "A video about anorexia from dieting by someone similar in age/background to Chloe, because algorithms show the full set of trade-offs under the keyword “diet.”",
    ],
    explain: "Recommenders often optimize engagement and will surface content a user is likely to click or linger on—even when it is misleading.",
  },
  "E-4-Q1": {
    stem: "A Black woman teacher from South Africa finds that an AI repeatedly fails to recognize her face. To reduce bias and improve fairness, which targeted action should programmers take?",
    options: [
      "Train on faster hardware to improve overall compute efficiency and recognition power",
      "Add more face data from diverse genders, skin tones, and regions during training",
      "Change the model architecture and train longer so it learns more complex features",
      "Only tweak the usage environment and parameters (lighting, thresholds, etc.)",
    ],
    explain: "More representative, diverse training data is a direct way to reduce recognition bias.",
  },
  "E-5-Q1": {
    stem: "Which of the following scenarios is relatively the most environmentally responsible?",
    options: [
      "A company frequently trains huge entertainment AI models, mostly on renewable energy.",
      "A tech firm uses closed-loop water cooling in data centers and caps compute scale by user tier in product design.",
      "A firm deploys many similar AI systems for the same task and refreshes hardware often with partial recycling.",
      "A company replicates the same model across many regions for lower latency and only tracks utility costs.",
    ],
    explain: "Improving cooling efficiency while limiting unnecessary compute is a stronger environmental practice than repeated training or redundant deployment.",
  },
  "E-6-Q1": {
    stem: "A student uses AI to rewrite a personal story. Original: “That day I sat at the table, watching Mom in the kitchen and the steaming noodles on the stove for a long time, my mind a mess.” Which revision still sounds most like the real student?",
    options: [
      "That day I sat at the table, watching Mom in the kitchen and the steaming noodles, zoning out for a long time with a messy mind.",
      "That day I sat at the table watching Mom and the steaming noodles and thinking.",
      "That day’s experience led me to reflect on my emotional state at the table amid tangled feelings.",
      "That day at the table I experienced a complex mental state and felt utterly confused.",
    ],
    explain: "The rewrite closest to the original rhythm and personal voice usually best preserves the author’s style.",
  },
  "E-7-Q1": {
    stem: "Amy, a 26-year-old foreigner in Taiwan, is denied a mortgage by a bank AI. Which statements about how the AI might decide are correct?",
    options: [
      "Amy may truly be higher risk; the AI could have used credit history and similar data to estimate high default risk.",
      "The AI may be biased against foreigners; adding “neutral” features like zip code, phone brand, or email provider during training will remove bias.",
      "The AI may be biased against foreigners; if gender, race, and nationality are not used in training, the algorithm cannot be biased.",
      "Amy must be high risk because mathematical models only mirror objective facts and eliminate human bias.",
    ],
    explain: "Relevant data like credit history can support a risk call; proxy features and claims that “removing sensitive fields removes bias” or “models are always objective” do not hold.",
  },
  "C-1-Q1": {
    stem: "Your community project needs a short video that helps older adults learn about AI. You have a draft idea and want AI tools to help. Choose a feasible workflow and order the steps:",
    options: ["1→3→5→7", "4→2→6→7", "1→3→6→7", "4→1→5→7"],
    explain: "Draft and human-select storyboards first, then generate clips and controllable music, then assemble—this is stronger human–AI co-creation.",
  },
  "C-3-Q1": {
    stem: "You lead engineering for a game studio. Four engineers report how they co-develop with AI. Which practices would you approve?",
    options: [
      "Engineer A: When code errors, send the whole file to AI and replace it with a new “error-free” rewrite.",
      "Engineer B: Split complex work into clear steps, ask AI step by step, and verify answers where the code fails.",
      "Engineer C: When prompting bug fixes, include rich context—current code, design, tests, and performance needs.",
      "Engineer D: Never use AI, believing it weakens independent thinking, and only debug alone by trial and error.",
    ],
    explain: "Task decomposition with checking, plus rich context, are sound practices; blind full-file replacement and total tool refusal are not ideal.",
  },
  "C-4-Q1": {
    stem: "You are an anime fan-content creator who often generate visuals with AI. Which prompts are compatible with copyright rules?",
    options: [
      "Generate Pikachu with a backpack touring Taipei 101, Jiufen, and night markets in a cute cartoon style",
      "Draw Taipei landmarks (Taipei 101, Tamsui Old Street) in a warm hand-drawn Miyazaki style",
      "Because characters and styles are copyrighted, no existing IP may be used in any form (style, look, or setting) for AI fan works.",
      "With clear official authorization (e.g., a licensed OpenAI–Disney partnership), generate the specified IP characters within the allowed scope.",
    ],
    explain: "Using a named IP within an explicit license is comparatively compliant; generating protected characters/styles without permission is risky.",
  },
  "M-debate-Q1": {
    stem: "Four classmates customize AI chatbots as debate partners. The learning goal is to improve critical thinking and argumentation in debate. Whose customization best supports that goal?",
    options: [
      "Ask AI to neutrally summarize both sides, then pick a stance.",
      "Ask AI to argue the opposite side, point out logic gaps, and keep practicing rebuttals.",
      "Ask AI for many different points, quickly grasp directions, then pick some to use.",
      "Ask AI for many arguments, then pick a few that support one’s own side.",
    ],
    explain: "To build debate skills, sustained clash with opposing arguments is closest to the learning goal.",
  },
  "M-1-Q1": {
    stem: "Your class is writing a “responsible AI for learning” policy. For each practice paired with a reason, select the options where the practice–reason mapping is reasonable.",
    options: [
      "Practice: Use AI to organize ideas and rewrite sentences for a report, then note which parts used AI. Reason: This supports academic honesty by disclosing AI use.",
      "Practice: Brainstorm with AI, revise answers, and iterate through dialogue. Reason: This is mainly about respecting intellectual property because the student sees AI’s role clearly.",
      "Practice: Cross-check AI facts against textbooks or reliable sources and correct them. Reason: This reflects critical thinking rather than treating AI as final truth.",
      "Practice: Ask AI to imitate a famous author’s style for a full assignment and submit without credit. Reason: This relates to IP because originality vs imitation can be blurred.",
    ],
    explain: "A/C/D pairings are more reasonable; B is closer to iterative collaboration than a pure IP framing.",
  },
  "D-1-Q1": {
    stem: "A school plans an AI system to recommend after-school activities. Which design best keeps necessary human involvement in the final outcome?",
    options: [
      "AI mainly uses grades for objectivity, outputs a list; teachers and students jointly review and decide.",
      "AI uses interests, schedules, and history to auto-assign activities; teachers only review results at term end.",
      "AI clusters students with interest/schedule/history data; individual recommendations are made solely by teacher intuition.",
      "AI uses interest forms, schedules, time limits, and past participation to produce a recommendation list; teachers and students jointly review and decide.",
    ],
    explain: "Generating suggestions from relevant context, then deciding together with teachers and students, best preserves human oversight.",
  },
  "D-2-Q1": {
    stem: "Robert, a librarian, builds a simple if–else chatbot that recommends three books from patron needs, and compares it with a machine-learning system doing the same task. Which comparison is most accurate?",
    options: [
      "Both rely on human-defined logic at inference time, so explainability and control barely differ.",
      "The rule chatbot follows preset rules with fixed replies; the ML system can adapt via training data to new preferences.",
      "ML only fits structured problems, while rule chatbots better handle vague, changing needs.",
      "Rule chatbots need little history to work; ML systems can recommend accurately with no data at all.",
    ],
    explain: "Rule systems answer more rigidly; learning systems can update with data to fit new preferences.",
  },
  "D-3-Q1": {
    stem: "You train a basic image model on web photos to recognize recyclables. It does well on the test set but accuracy drops in the real world. What did the model most likely learn?",
    options: [
      "Mainly the physical/chemical essence of recyclables, causing unstable predictions across environments.",
      "Dataset-specific visual cues or biases that do not generalize to real settings.",
      "Too few samples to form any consistent classification standard.",
      "Two independent rule sets from different sources that conflict at runtime.",
    ],
    explain: "Strong test performance but weak real-world results often means the model fit dataset quirks, not transferable features.",
  },
  "D-4-Q1a": {
    stem: "Students train shopping recommenders on the same behavior data. The best offline metric model (e.g., CTR) does not clearly raise user satisfaction online, so they add feedback and adjust strategy. What best explains this?",
    options: [
      "Offline metrics cannot fully capture real use, so offline and online results can diverge.",
      "The model overfit past shopping patterns and missed shifting needs.",
      "Satisfaction never changes with recommendations, so model tweaks cannot affect it.",
      "Model differences are mostly random and cannot be improved systematically with feedback.",
    ],
    explain: "Offline scores and real satisfaction can diverge; online feedback is needed to adjust.",
  },
  "D-4-Q1": {
    stem: "You run an earthquake alert system. Three models on the same data: Model1=95/2/3 correct/false-alarm/miss; Model2=98/0/2; Model3=90/10/0. Which model would you choose for public warnings?",
    options: ["Model 1", "Model 2", "Model 3", "Cannot decide; each model wins on different dimensions."],
    explain: "For alerts, missed earthquakes are usually least acceptable; Model 3’s zero misses fits a safety-first choice.",
  },
  "D-5-Q1": {
    stem: "Your teammates wrote a model card for an amusement-park encyclopedia LLM. As lead, which sections contain clear errors?",
    options: ["Model overview", "Model type", "Intended use", "Ethics considerations"],
    explain: "Claims that all answers are correct and up to date, or that users can safely rely on advice with no risk, are clearly inappropriate.",
  },
};
