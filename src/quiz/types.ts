export type QuizChoice = {
  id: string;
  label: string;
};

export type QuizQuestionKind = "single" | "multi";

export type QuizQuestion = {
  id: string;
  title: string;
  description?: string;
  /** `multi` = checkboxes, all listed `answerIds` required. Default `single`. */
  type?: QuizQuestionKind;
  choices: QuizChoice[];
  /** Correct choice for `single` questions. */
  answerId?: string;
  /** All correct choices for `multi` questions (exact set). */
  answerIds?: string[];
};

export type QuizDefinition = {
  id: string;
  title: string;
  description: string;
  /** Miss this many or fewer to pass (2 = miss fewer than 3). */
  maxWrong: number;
  questions: QuizQuestion[];
};

export type QuizCatalog = {
  quizzes: QuizDefinition[];
};

/** Facts passed to json-rules-engine. Answers are flattened as `answer_<questionId>`. */
export type QuizFacts = {
  quizId: string;
  questionCount: number;
  answeredCount: number;
  complete: boolean;
  wrongCount: number;
  correctCount: number;
  [flagFact: `answer_${string}` | `answered_${string}`]: string | number | boolean;
};

export type QuizQuestionGrade = {
  id: string;
  title: string;
  correct: boolean;
};

export type QuizGrade = {
  quizId: string;
  questions: QuizQuestionGrade[];
  wrongCount: number;
  correctCount: number;
  passed: boolean;
  complete: boolean;
};

/** Playable quiz with the answer key stripped. */
export type QuizPublicQuestion = {
  id: string;
  title: string;
  description?: string;
  type: QuizQuestionKind;
  choices: QuizChoice[];
};

export type QuizPublic = {
  id: string;
  title: string;
  description: string;
  maxWrong: number;
  questions: QuizPublicQuestion[];
};
