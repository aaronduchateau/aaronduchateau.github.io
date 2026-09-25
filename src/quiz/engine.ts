import { Engine } from "json-rules-engine";
import { getQuizDefinition } from "./catalog";
import { buildQuizFacts } from "./facts";
import { allQuizRules, rulesForQuiz } from "./rules";
import type { QuizDefinition, QuizGrade, QuizQuestionGrade } from "./types";

let engineSingleton: Engine | null = null;

export function getQuizEngine(): Engine {
  if (engineSingleton) return engineSingleton;
  engineSingleton = new Engine(allQuizRules, { allowUndefinedFacts: true });
  return engineSingleton;
}

function engineForDefinition(quiz: QuizDefinition): Engine {
  if (getQuizDefinition(quiz.id) === quiz) return getQuizEngine();
  return new Engine(rulesForQuiz(quiz), { allowUndefinedFacts: true });
}

/**
 * Grade submitted answers through json-rules-engine.
 * Return value never includes the answer key — only right/wrong per question.
 */
export async function resolveQuiz(
  quizId: string,
  answers: Readonly<Record<string, string>>,
  quiz: QuizDefinition | null = getQuizDefinition(quizId),
): Promise<QuizGrade> {
  const empty: QuizGrade = {
    quizId,
    questions: [],
    wrongCount: 0,
    correctCount: 0,
    passed: false,
    complete: false,
  };
  if (!quiz) return empty;

  const engine = engineForDefinition(quiz);
  const baseFacts = buildQuizFacts(quizId, answers, undefined, quiz);
  const { events: gradeEvents } = await engine.run(baseFacts);

  const gradeById = new Map<string, boolean>();
  for (const event of gradeEvents) {
    if (event.type !== "grade-question") continue;
    const questionId =
      typeof event.params?.questionId === "string" ? event.params.questionId : "";
    if (!questionId) continue;
    gradeById.set(questionId, event.params?.correct === true);
  }

  const questions: QuizQuestionGrade[] = [];
  for (const question of quiz.questions) {
    if (!answers[question.id]) continue;
    questions.push({
      id: question.id,
      title: question.title,
      correct: gradeById.get(question.id) === true,
    });
  }

  const correctCount = questions.filter((row) => row.correct).length;
  const wrongCount = questions.filter((row) => !row.correct).length;
  const complete = baseFacts.complete;

  const tallied = buildQuizFacts(quizId, answers, { wrongCount, correctCount }, quiz);
  const { events: outcomeEvents } = await engine.run(tallied);
  const passed = complete && outcomeEvents.some((event) => event.type === "quiz-pass");

  return {
    quizId,
    questions,
    wrongCount,
    correctCount,
    passed,
    complete,
  };
}
