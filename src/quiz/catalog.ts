import catalogJson from "./catalog.json";
import type { QuizCatalog, QuizDefinition, QuizPublic } from "./types";

const catalog = catalogJson as QuizCatalog;

export function listQuizzes(): readonly QuizDefinition[] {
  return catalog.quizzes;
}

export function getQuizDefinition(quizId: string): QuizDefinition | null {
  return catalog.quizzes.find((quiz) => quiz.id === quizId) ?? null;
}

/** UI-safe quiz: no answer ids. */
export function toQuizPublic(quiz: QuizDefinition): QuizPublic {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    maxWrong: quiz.maxWrong,
    questions: quiz.questions.map(({ id, title, description, choices, type }) => ({
      id,
      title,
      description,
      type: type === "multi" ? "multi" : "single",
      choices,
    })),
  };
}

export function getQuizPublic(quizId: string): QuizPublic | null {
  const quiz = getQuizDefinition(quizId);
  return quiz ? toQuizPublic(quiz) : null;
}

export function isQuizDefinition(value: unknown): value is QuizDefinition {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Partial<QuizDefinition>;
  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    typeof row.description === "string" &&
    typeof row.maxWrong === "number" &&
    Array.isArray(row.questions) &&
    row.questions.length > 0
  );
}
