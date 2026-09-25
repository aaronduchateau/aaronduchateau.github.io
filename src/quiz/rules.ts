import type { RuleProperties } from "json-rules-engine";
import { listQuizzes } from "./catalog";
import { answerFactName, answeredFactName, expectedAnswerValue } from "./facts";
import type { QuizDefinition } from "./types";

/** Grade + pass/fail rules for one quiz definition (catalog or library JSON). */
export function rulesForQuiz(quiz: QuizDefinition): RuleProperties[] {
  const rules: RuleProperties[] = [];
  for (const question of quiz.questions) {
    const fact = answerFactName(question.id);
    const answered = answeredFactName(question.id);
    const expected = expectedAnswerValue(question);
    rules.push({
      name: `quiz-grade-correct-${quiz.id}-${question.id}`,
      conditions: {
        all: [
          { fact: "quizId", operator: "equal", value: quiz.id },
          { fact: answered, operator: "equal", value: true },
          { fact, operator: "equal", value: expected },
        ],
      },
      event: {
        type: "grade-question",
        params: { quizId: quiz.id, questionId: question.id, correct: true },
      },
      priority: 10,
    });
    rules.push({
      name: `quiz-grade-wrong-${quiz.id}-${question.id}`,
      conditions: {
        all: [
          { fact: "quizId", operator: "equal", value: quiz.id },
          { fact: answered, operator: "equal", value: true },
          { fact, operator: "notEqual", value: expected },
        ],
      },
      event: {
        type: "grade-question",
        params: { quizId: quiz.id, questionId: question.id, correct: false },
      },
      priority: 10,
    });
  }

  rules.push(
    {
      name: `quiz-pass-${quiz.id}`,
      conditions: {
        all: [
          { fact: "quizId", operator: "equal", value: quiz.id },
          { fact: "complete", operator: "equal", value: true },
          { fact: "wrongCount", operator: "lessThanInclusive", value: quiz.maxWrong },
        ],
      },
      event: {
        type: "quiz-pass",
        params: { quizId: quiz.id },
      },
      priority: 5,
    },
    {
      name: `quiz-fail-${quiz.id}`,
      conditions: {
        all: [
          { fact: "quizId", operator: "equal", value: quiz.id },
          { fact: "complete", operator: "equal", value: true },
          { fact: "wrongCount", operator: "greaterThan", value: quiz.maxWrong },
        ],
      },
      event: {
        type: "quiz-fail",
        params: { quizId: quiz.id },
      },
      priority: 5,
    },
  );

  return rules;
}

/** Generated from `catalog.json` — add a question there, not here. */
export const allQuizRules: RuleProperties[] = listQuizzes().flatMap(rulesForQuiz);
