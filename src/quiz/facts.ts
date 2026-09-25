import { getQuizDefinition } from "./catalog";
import type { QuizFacts, QuizQuestion } from "./types";

/** Canonical stored answer: one id, or sorted ids joined for check-all. */
export function encodeAnswerIds(ids: readonly string[]): string {
  return [...ids].filter(Boolean).sort().join(",");
}

export function expectedAnswerValue(question: QuizQuestion): string {
  if (question.type === "multi") {
    return encodeAnswerIds(question.answerIds ?? []);
  }
  return question.answerId ?? "";
}

export function answerFactName(questionId: string): `answer_${string}` {
  return `answer_${questionId}`;
}

export function answeredFactName(questionId: string): `answered_${string}` {
  return `answered_${questionId}`;
}

/** Flatten submitted answers. Counts only — the engine grades correctness. */
export function buildQuizFacts(
  quizId: string,
  answers: Readonly<Record<string, string>>,
  tallies?: { wrongCount: number; correctCount: number },
  quiz = getQuizDefinition(quizId),
): QuizFacts {
  const questionCount = quiz?.questions.length ?? 0;
  let answeredCount = 0;
  const facts: QuizFacts = {
    quizId,
    questionCount,
    answeredCount: 0,
    complete: false,
    wrongCount: tallies?.wrongCount ?? 0,
    correctCount: tallies?.correctCount ?? 0,
  };

  if (!quiz) return facts;

  for (const question of quiz.questions) {
    const choice = answers[question.id];
    if (!choice) continue;
    answeredCount += 1;
    facts[answeredFactName(question.id)] = true;
    facts[answerFactName(question.id)] = choice;
  }

  facts.answeredCount = answeredCount;
  facts.complete = questionCount > 0 && answeredCount >= questionCount;
  return facts;
}
