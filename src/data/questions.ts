import { Question } from '../types';

export const defaultQuestions: Question[] = [
  {
    id: '1',
    sentence: "[BLANK] tired, she still finished the report.",
    options: ["Although", "Despite", "Because", "Unless"],
    correctAnswer: "Although",
    explanation: {
      rule: "**Although** 是连词，用于引导让步状语从句，后接主谓结构（在省略句中如 'Although (she was) tired'，主语和系动词可省略）。**Despite** 是介词，后接名词或动名词。\n\n'Although' is a conjunction used to introduce a subordinate clause. It is followed by a subject and a verb.",
      example: "Although it was raining, we went out. (尽管在下雨，我们还是出去了。) / Despite the rain, we went out. (尽管有雨，我们还是出去了。)",
      commonMistake: "在 Despite 后接完整的句子 (例如：*Despite she was tired*)。应该使用 Despite her tiredness 或 Although she was tired。"
    },
    difficulty: 'Intermediate',
    category: 'Conjunctions (连词)',
    examType: 'TOEFL'
  },
  {
    id: '2',
    sentence: "The professor [BLANK] research was published last month is giving a lecture today.",
    options: ["who", "whom", "whose", "which"],
    correctAnswer: "whose",
    explanation: {
      rule: "**Whose** 是关系代词，表示所属关系（“……的”）。它代替形容词性物主代词（如 his, her, their），后接名词。\n\n'Whose' is a relative pronoun used to show possession. It replaces a possessive adjective and is followed by a noun.",
      example: "The girl whose brother is a doctor is my friend. (那个哥哥是医生的女孩是我的朋友。)",
      commonMistake: "混淆 'whose' (所有格) 和 'who's' (who is 的缩写)。"
    },
    difficulty: 'Intermediate',
    category: 'Relative Clauses (定语从句)',
    examType: 'SAT'
  },
  {
    id: '3',
    sentence: "[BLANK] the project on time, the team worked through the weekend.",
    options: ["To finish", "Finished", "Finish", "Finishing"],
    correctAnswer: "To finish",
    explanation: {
      rule: "动词不定式 **To finish** 在此处表示目的（为了完成……）。\n\nThe infinitive 'to finish' is used here to express purpose (in order to finish).",
      example: "To pass the exam, you must study hard. (为了通过考试，你必须努力学习。)",
      commonMistake: "在句首使用动词原形 'Finish' 或过去分词 'Finished' 来表示目的。"
    },
    difficulty: 'Intermediate',
    category: 'Non-finite Verbs (非谓语动词)',
    examType: 'TOEFL'
  },
  {
    id: '4',
    sentence: "Hardly [BLANK] the station when the train left.",
    options: ["had he reached", "he had reached", "did he reach", "he reached"],
    correctAnswer: "had he reached",
    explanation: {
      rule: "当句子以 **Hardly**, **Scarcely**, 或 **No sooner** 等否定或限制性副词开头时，主句需要部分倒装（助动词提前）。'Hardly' 通常与 'when' 连用，并使用过去完成时。\n\nWhen a sentence begins with negative adverbs like 'Hardly', the subject and auxiliary verb must be inverted.",
      example: "Hardly had I closed my eyes when the phone rang. (我刚闭上眼电话就响了。)",
      commonMistake: "使用正常语序 (Hardly he had reached...)，忘记倒装。"
    },
    difficulty: 'Advanced',
    category: 'Inversion (倒装句)',
    examType: 'SAT'
  },
  {
    id: '5',
    sentence: "The committee suggested that the proposal [BLANK] again.",
    options: ["be reviewed", "is reviewed", "was reviewed", "reviewed"],
    correctAnswer: "be reviewed",
    explanation: {
      rule: "在表示建议、要求、命令的动词（如 **suggest**, **recommend**, **insist**, **demand**）后的 'that' 从句中，需使用虚拟语气，形式为 **(should) + 动词原形**。\n\nVerbs like 'suggest' are followed by a 'that' clause using the subjunctive mood (base form of the verb).",
      example: "I suggest that he be on time. (我建议他准时。)",
      commonMistake: "在虚拟语气从句中使用 'is' 或 'was' 而不是原形 'be'。"
    },
    difficulty: 'Advanced',
    category: 'Subjunctive Mood (虚拟语气)',
    examType: 'TOEFL'
  }
];
