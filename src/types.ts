export interface QuestionBank {
  id: string;
  name: string;
  questions: Question[];
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type ExamType = 'TOEFL' | 'SAT';

export interface Explanation {
  rule: string;
  example: string;
  commonMistake: string;
}

export interface Question {
  id: string;
  sentence: string; // Use [BLANK] for the gap
  options: string[];
  correctAnswer: string;
  explanation: Explanation;
  difficulty: Difficulty;
  category: string;
  examType: ExamType;
}

export interface UserAnswer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
}
