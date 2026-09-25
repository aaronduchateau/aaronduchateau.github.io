import type { QuizDefinition } from "./types";

/** Four-question sample for the component library — same shape as `catalog.json`. */
export const LIBRARY_SAMPLE_QUIZ: QuizDefinition = {
  id: "quiz-library-sample",
  title: "Library sample",
  description:
    "Four questions so the catalog can show Right/Wrong, the wiggle, confetti, and a pass/fail result. Miss fewer than two to pass.",
  maxWrong: 1,
  questions: [
    {
      id: "lq-1",
      title: "What does a correct answer play?",
      choices: [
        { id: "a", label: "The skip-the-fun click" },
        { id: "b", label: "The bound nav click, plus confetti" },
        { id: "c", label: "Nothing — quizzes are silent" },
      ],
      answerId: "b",
    },
    {
      id: "lq-2",
      title: "What happens when you miss?",
      choices: [
        { id: "a", label: "The prompt wiggles and plays skip-the-fun" },
        { id: "b", label: "The page reloads" },
        { id: "c", label: "Confetti anyway" },
      ],
      answerId: "a",
    },
    {
      id: "lq-3",
      title: "How many misses still pass this sample?",
      choices: [
        { id: "a", label: "Zero only" },
        { id: "b", label: "One or fewer" },
        { id: "c", label: "All of them" },
      ],
      answerId: "b",
    },
    {
      id: "lq-4",
      title: "Where does the result list live?",
      choices: [
        { id: "a", label: "A different component than the questions" },
        { id: "b", label: "The same QuizPlayer, after the last grade" },
        { id: "c", label: "Only on the easter-egg board" },
      ],
      answerId: "b",
    },
  ],
};
